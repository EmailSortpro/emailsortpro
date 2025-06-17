// CategoryManager.js - Version 21.1 - CORRIGÉ ET OPTIMISÉ 🚀

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // NOUVEAU: Système de cache haute performance
        this.analysisCache = new Map(); // Cache LRU des analyses
        this.cacheMaxSize = 1000;
        this.cacheTTL = 300000; // 5 minutes
        this.cacheStats = { hits: 0, misses: 0 };
        
        // NOUVEAU: Optimisation regex pré-compilées
        this.compiledPatterns = new Map();
        this.textNormalizer = this.createTextNormalizer();
        
        // NOUVEAU: Système de synchronisation optimisé
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        // NOUVEAU: Batch processing
        this.pendingAnalysis = [];
        this.batchSize = 50;
        this.batchTimeout = null;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.initializeFilters();
        this.setupEventListeners();
        this.startOptimizedSync();
        
        console.log('[CategoryManager] ✅ Version 21.1 - CORRIGÉ ET OPTIMISÉ');
    }

    // ================================================
    // CACHE SYSTÈME HAUTE PERFORMANCE
    // ================================================
    createCacheKey(email) {
        // CORRECTION: Utiliser la méthode optimisée
        const content = this.extractCompleteContentOptimized(email);
        const key = `${email.from?.emailAddress?.address || ''}|${email.subject || ''}|${content.text.substring(0, 100)}`;
        return this.hashString(key);
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    getCachedAnalysis(email) {
        const key = this.createCacheKey(email);
        const cached = this.analysisCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            this.cacheStats.hits++;
            return cached.result;
        }
        
        this.cacheStats.misses++;
        return null;
    }

    setCachedAnalysis(email, result) {
        const key = this.createCacheKey(email);
        
        // Gestion LRU: supprimer les anciens si trop de cache
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
    // OPTIMISATION REGEX ET NORMALISATION
    // ================================================
    createTextNormalizer() {
        // Pré-compiler les regex de normalisation pour éviter la recompilation
        return {
            accents: /[àâäéèêëîïôöùûüç]/gi,
            accentMap: {
                'à': 'a', 'â': 'a', 'ä': 'a',
                'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
                'î': 'i', 'ï': 'i',
                'ô': 'o', 'ö': 'o',
                'ù': 'u', 'û': 'u', 'ü': 'u',
                'ç': 'c'
            },
            spaces: /\s+/g,
            punctuation: /[^\w\s]/g,
            html: /<[^>]+>/g
        };
    }

    normalizeTextFast(text) {
        if (!text) return '';
        
        return text.toLowerCase()
            .replace(this.textNormalizer.accents, (match) => this.textNormalizer.accentMap[match] || match)
            .replace(this.textNormalizer.punctuation, ' ')
            .replace(this.textNormalizer.spaces, ' ')
            .trim();
    }

    getCompiledPattern(keyword) {
        if (!this.compiledPatterns.has(keyword)) {
            const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            this.compiledPatterns.set(keyword, new RegExp(`\\b${escaped}\\b`, 'i'));
        }
        return this.compiledPatterns.get(keyword);
    }

    // ================================================
    // BATCH PROCESSING POUR ANALYSE MASSIVE
    // ================================================
    async analyzeEmailsBatch(emails) {
        console.log(`[CategoryManager] 📦 Batch analysis: ${emails.length} emails`);
        
        const batchResults = [];
        const batchSize = this.batchSize;
        
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const batchPromises = batch.map(email => this.analyzeEmailOptimized(email));
            
            // Traitement par batch avec Promise.all pour parallélisme
            const results = await Promise.all(batchPromises);
            batchResults.push(...results);
            
            // Pause micro pour laisser respirer le thread principal
            if (i + batchSize < emails.length) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        console.log(`[CategoryManager] ✅ Batch completed: ${batchResults.length} analyses`);
        return batchResults;
    }

    // ================================================
    // ANALYSE EMAIL OPTIMISÉE
    // ================================================
    analyzeEmailOptimized(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // 1. Vérifier le cache en premier
        const cached = this.getCachedAnalysis(email);
        if (cached) {
            return cached;
        }
        
        // 2. Vérifications rapides
        if (this.shouldExcludeSpam() && this.isSpamEmailFast(email)) {
            const result = { category: 'spam', score: 0, confidence: 0, isSpam: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // 3. Extraction de contenu optimisée
        const content = this.extractCompleteContentOptimized(email);
        
        // 4. Vérifications d'exclusion rapides
        if (this.isGloballyExcludedFast(content, email)) {
            const result = { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // 5. Détection personnelle rapide
        if (this.isPersonalEmailFast(content)) {
            const result = {
                category: this.categories.personal ? 'personal' : 'excluded',
                score: 100,
                confidence: 0.95,
                isPersonal: true
            };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // 6. Analyse CC optimisée
        const ccResult = this.analyzeCCOptimized(email, content);
        if (ccResult) {
            this.setCachedAnalysis(email, ccResult);
            return ccResult;
        }
        
        // 7. Analyse des catégories avec optimisations
        const result = this.analyzeAllCategoriesOptimized(content);
        
        // 8. Cache du résultat
        this.setCachedAnalysis(email, result);
        return result;
    }

    // ================================================
    // EXTRACTION CONTENU OPTIMISÉE
    // ================================================
    extractCompleteContentOptimized(email) {
        const parts = [];
        
        // Sujet avec pondération (répété 3 fois au lieu de 10)
        if (email.subject?.trim()) {
            parts.push(email.subject.repeat(3));
        }
        
        // Expéditeur (répété 2 fois au lieu de 3)
        if (email.from?.emailAddress?.address) {
            parts.push(email.from.emailAddress.address.repeat(2));
        }
        
        // Aperçu du corps seulement (pas le corps complet)
        if (email.bodyPreview) {
            parts.push(email.bodyPreview);
        }
        
        // Extraction simplifiée des destinataires
        const recipients = [];
        if (email.toRecipients?.length) {
            recipients.push(...email.toRecipients.slice(0, 3).map(r => r.emailAddress?.address).filter(Boolean));
        }
        if (email.ccRecipients?.length) {
            recipients.push(...email.ccRecipients.slice(0, 2).map(r => r.emailAddress?.address).filter(Boolean));
        }
        parts.push(recipients.join(' '));
        
        const rawText = parts.join(' ');
        const normalizedText = this.normalizeTextFast(rawText);
        
        return {
            text: normalizedText,
            subject: this.normalizeTextFast(email.subject || ''),
            domain: this.extractDomainFast(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: normalizedText.length,
            rawSubject: email.subject || ''
        };
    }

    // CORRECTION: Ajouter l'alias pour la compatibilité
    extractCompleteContent(email) {
        return this.extractCompleteContentOptimized(email);
    }

    extractDomainFast(email) {
        if (!email || !email.includes('@')) return 'unknown';
        const parts = email.split('@');
        return parts[1]?.toLowerCase() || 'unknown';
    }

    // ================================================
    // VÉRIFICATIONS RAPIDES
    // ================================================
    isSpamEmailFast(email) {
        // Vérifications ultra-rapides uniquement
        if (email.parentFolderId?.toLowerCase().includes('junk')) return true;
        if (email.categories?.some(cat => cat.toLowerCase().includes('spam'))) return true;
        return false;
    }

    isGloballyExcludedFast(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        // Vérification domaine seulement (plus rapide)
        if (exclusions.domains?.length) {
            return exclusions.domains.some(domain => content.domain.includes(domain.toLowerCase()));
        }
        return false;
    }

    isPersonalEmailFast(content) {
        // Patterns rapides pré-compilés
        const personalPatterns = ['papa', 'maman', 'bises', 'famille'];
        return personalPatterns.some(pattern => content.text.includes(pattern));
    }

    analyzeCCOptimized(email, content) {
        if (!this.shouldDetectCC()) return null;
        
        const isMainRecipient = this.isMainRecipientFast(email);
        const isInCC = this.isInCCFast(email);
        
        if (isInCC && !isMainRecipient) {
            // Vérification rapide marketing
            if (content.text.includes('unsubscribe') || content.text.includes('newsletter')) {
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

    isMainRecipientFast(email) {
        return email.toRecipients?.length > 0;
    }

    isInCCFast(email) {
        return email.ccRecipients?.length > 0;
    }

    // ================================================
    // ANALYSE CATÉGORIES OPTIMISÉE
    // ================================================
    analyzeAllCategoriesOptimized(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // Traitement optimisé par priorité
        const categoriesByPriority = activeCategories
            .map(catId => ({ id: catId, priority: this.categories[catId]?.priority || 50 }))
            .sort((a, b) => b.priority - a.priority);
        
        for (const { id: categoryId } of categoriesByPriority) {
            const keywords = this.weightedKeywords[categoryId];
            if (!keywords || this.isEmptyKeywords(keywords)) continue;
            
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
                
                // Arrêt précoce si match absolu fort
                if (score.hasAbsolute && score.total >= 150) {
                    break;
                }
            }
        }
        
        return this.selectByPriorityWithThresholdOptimized(results);
    }

    calculateScoreOptimized(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Bonus de catégorie (pré-calculé)
        const categoryBonus = this.getCategoryBonus(categoryId);
        if (categoryBonus > 0) {
            totalScore += categoryBonus;
            matches.push({ keyword: 'category_bonus', type: 'bonus', score: categoryBonus });
        }
        
        // Test exclusions en premier (plus rapide si on peut éliminer)
        if (keywords.exclusions?.length) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInTextOptimized(text, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
                }
            }
        }
        
        // Test des absolus (arrêt précoce possible)
        if (keywords.absolute?.length) {
            for (const keyword of keywords.absolute) {
                if (this.findInTextOptimized(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Bonus sujet
                    if (content.subject && this.findInTextOptimized(content.subject, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + '_subject', type: 'bonus', score: 50 });
                    }
                }
            }
        }
        
        // Test des forts seulement si pas d'absolu suffisant
        if (!hasAbsolute || totalScore < 150) {
            if (keywords.strong?.length) {
                let strongMatches = 0;
                for (const keyword of keywords.strong) {
                    if (this.findInTextOptimized(text, keyword)) {
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
        }
        
        // Test des faibles seulement si score encore faible
        if (totalScore < 100 && keywords.weak?.length) {
            let weakMatches = 0;
            for (const keyword of keywords.weak.slice(0, 5)) { // Limite à 5 pour performance
                if (this.findInTextOptimized(text, keyword)) {
                    totalScore += 15;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                }
            }
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    findInTextOptimized(text, keyword) {
        // Utilisation des regex pré-compilées
        const pattern = this.getCompiledPattern(keyword);
        return pattern.test(text);
    }

    getCategoryBonus(categoryId) {
        const bonuses = {
            'tasks': 15,
            'security': 10,
            'finance': 10,
            'marketing_news': 5,
            'project': 10,
            'hr': 10
        };
        return bonuses[categoryId] || 0;
    }

    selectByPriorityWithThresholdOptimized(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
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
            if (a.hasAbsolute !== b.hasAbsolute) {
                return b.hasAbsolute - a.hasAbsolute;
            }
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
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
    // SYNCHRONISATION OPTIMISÉE
    // ================================================
    startOptimizedSync() {
        // Synchronisation moins fréquente
        setInterval(() => {
            this.processSettingsChanges();
        }, 5000); // 5 secondes au lieu de 2
        
        this.setupImmediateSync();
    }

    setupImmediateSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'categorySettings') {
                console.log('[CategoryManager] 🔄 Changement localStorage détecté');
                this.reloadSettingsFromStorage();
                this.invalidateCache(); // Invalider le cache
                this.notifyAllModules('storageChange');
            }
        });
    }

    invalidateCache() {
        this.analysisCache.clear();
        this.cacheStats = { hits: 0, misses: 0 };
        console.log('[CategoryManager] 🧹 Cache invalidé');
    }

    // ================================================
    // MÉTHODES UTILITAIRES OPTIMISÉES
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
        return 0.50;
    }

    // ================================================
    // MÉTHODES PUBLIQUES (déléguées aux versions optimisées)
    // ================================================
    analyzeEmail(email) {
        return this.analyzeEmailOptimized(email);
    }

    // ================================================
    // MÉTRIQUES DE PERFORMANCE
    // ================================================
    getPerformanceStats() {
        return {
            cache: {
                size: this.analysisCache.size,
                hits: this.cacheStats.hits,
                misses: this.cacheStats.misses,
                hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100
            },
            compiledPatterns: this.compiledPatterns.size,
            batchSize: this.batchSize,
            cacheMaxSize: this.cacheMaxSize
        };
    }

    // ================================================
    // NETTOYAGE OPTIMISÉ
    // ================================================
    cleanup() {
        // Nettoyage du cache
        this.analysisCache.clear();
        this.compiledPatterns.clear();
        
        // Nettoyage des timers
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        
        // Nettoyage des intervals
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Nettoyage des listeners
        if (this.externalSettingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.externalSettingsChangeHandler);
        }
        
        this.syncQueue = [];
        this.changeListeners.clear();
        this.eventListenersSetup = false;
        this.syncInProgress = false;
        
        console.log('[CategoryManager] 🧹 Nettoyage optimisé effectué');
    }

    // ================================================
    // TOUTES LES AUTRES MÉTHODES EXISTANTES
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

    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    'se désinscrire', 'unsubscribe', 'opt out', 'newsletter',
                    'disable these notifications', 'email preferences'
                ],
                strong: ['promo', 'offer', 'sale', 'marketing', 'campaign'],
                weak: ['update', 'discover', 'new'],
                exclusions: []
            },
            security: {
                absolute: [
                    'alerte de connexion', 'login alert', 'new sign-in',
                    'code de vérification', 'two-factor', 'password reset'
                ],
                strong: ['sécurité', 'security', 'authentification'],
                weak: ['compte', 'account'],
                exclusions: ['newsletter', 'promotion']
            },
            tasks: {
                absolute: [
                    'action required', 'action requise', 'urgent',
                    'deadline', 'échéance', 'update request', 'correction requise'
                ],
                strong: ['urgent', 'priority', 'complete', 'action', 'task'],
                weak: ['demande', 'request', 'need'],
                exclusions: ['newsletter', 'marketing', 'family']
            },
            meetings: {
                absolute: [
                    'meeting request', 'réunion', 'teams meeting', 'zoom meeting',
                    'rendez-vous', 'appointment'
                ],
                strong: ['meeting', 'schedule', 'calendar', 'conference'],
                weak: ['agenda', 'available'],
                exclusions: ['newsletter', 'promotion']
            },
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'contrat',
                    'purchase order', 'opportunity'
                ],
                strong: ['client', 'customer', 'commercial', 'business', 'deal'],
                weak: ['offre', 'négociation'],
                exclusions: ['newsletter', 'marketing']
            },
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'virement',
                    'commande n°', 'order number', 'confirmation commande'
                ],
                strong: ['montant', 'total', 'fiscal', 'bancaire', 'commande'],
                weak: ['euro', 'dollar', 'prix'],
                exclusions: ['newsletter', 'marketing', 'soldes']
            },
            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone', 'sprint',
                    'document corrigé', 'version corrigée'
                ],
                strong: ['projet', 'project', 'development', 'document'],
                weak: ['development', 'phase', 'planning'],
                exclusions: ['newsletter', 'family']
            },
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'comme convenu'
                ],
                strong: ['reminder', 'rappel', 'follow', 'relance'],
                weak: ['discussed', 'encore'],
                exclusions: ['newsletter', 'marketing']
            },
            support: {
                absolute: [
                    'ticket #', 'case number', 'incident #',
                    'support ticket', 'problème résolu'
                ],
                strong: ['support', 'assistance', 'help desk', 'ticket'],
                weak: ['help', 'aide', 'issue'],
                exclusions: ['newsletter', 'marketing']
            },
            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'performance review', 'offre d\'emploi'
                ],
                strong: ['rh', 'hr', 'salaire', 'ressources humaines', 'emploi'],
                weak: ['employee', 'staff', 'personnel'],
                exclusions: ['newsletter', 'family', 'personal']
            },
            internal: {
                absolute: [
                    'all staff', 'company announcement', 'memo interne',
                    'communication interne', 'note de service'
                ],
                strong: ['internal', 'interne', 'company wide', 'annonce'],
                weak: ['announcement', 'information'],
                exclusions: ['newsletter', 'marketing', 'external']
            },
            notifications: {
                absolute: [
                    'do not reply', 'noreply@', 'automated message',
                    'system notification', 'no-reply@'
                ],
                strong: ['automated', 'automatic', 'system', 'notification'],
                weak: ['notification', 'alert'],
                exclusions: ['newsletter', 'marketing']
            },
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'courtesy copy'
                ],
                strong: ['information', 'copie', 'copy'],
                weak: ['fyi', 'info'],
                exclusions: ['commande', 'facture', 'urgent']
            }
        };

        console.log('[CategoryManager] Mots-clés optimisés initialisés');
    }

    initializeFilters() {
        this.loadCategoryFilters();
        console.log('[CategoryManager] Filtres initialisés');
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
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" (${id}): ${totalKeywords} mots-clés`);
            });
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    setupEventListeners() {
        if (this.eventListenersSetup) return;

        this.externalSettingsChangeHandler = (event) => {
            if (event.detail?.source === 'CategoryManager') return;
            
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
        
        if (window.emailScanner) {
            switch (type) {
                case 'taskPreselectedCategories':
                    console.log('[CategoryManager] → EmailScanner: taskPreselectedCategories');
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    setTimeout(() => {
                        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                            console.log('[CategoryManager] → EmailScanner: Déclenchement re-catégorisation');
                            window.emailScanner.recategorizeEmails?.();
                        }
                    }, 100);
                    break;
                    
                case 'activeCategories':
                    console.log('[CategoryManager] → EmailScanner: activeCategories');
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
        
        if (window.aiTaskAnalyzer) {
            if (type === 'taskPreselectedCategories') {
                if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
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
    // API PUBLIQUE POUR CHANGEMENTS DE PARAMÈTRES
    // ================================================
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

    invalidateTaskCategoriesCache() {
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        console.log('[CategoryManager] 🔄 Cache des catégories tâches invalidé');
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

    updateCategoryKeywords(categoryId, keywords) {
        console.log(`[CategoryManager] 🔑 Mise à jour mots-clés pour ${categoryId}:`, keywords);
        
        if (this.weightedKeywords[categoryId]) {
            this.weightedKeywords[categoryId] = {
                absolute: [...(keywords.absolute || [])],
                strong: [...(keywords.strong || [])],
                weak: [...(keywords.weak || [])],
                exclusions: [...(keywords.exclusions || [])]
            };
            
            // Sauvegarder si c'est une catégorie personnalisée
            if (this.customCategories[categoryId]) {
                this.customCategories[categoryId].keywords = this.weightedKeywords[categoryId];
                this.saveCustomCategories();
            }
            
            // Invalider le cache car les mots-clés ont changé
            this.invalidateCache();
            
            console.log('[CategoryManager] ✅ Mots-clés mis à jour');
        }
    }

    updateCategoryFilters(categoryId, filters) {
        console.log(`[CategoryManager] 🔍 Mise à jour filtres pour ${categoryId}:`, filters);
        
        if (!this.categoryFilters) {
            this.categoryFilters = {};
        }
        
        this.categoryFilters[categoryId] = {
            includeDomains: [...(filters.includeDomains || [])],
            includeEmails: [...(filters.includeEmails || [])],
            excludeDomains: [...(filters.excludeDomains || [])],
            excludeEmails: [...(filters.excludeEmails || [])]
        };
        
        this.saveCategoryFilters();
        
        // Invalider le cache car les filtres ont changé
        this.invalidateCache();
        
        console.log('[CategoryManager] ✅ Filtres mis à jour');
    }

    saveCategoryFilters() {
        try {
            localStorage.setItem('categoryFilters', JSON.stringify(this.categoryFilters));
            console.log('[CategoryManager] 💾 Filtres sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde filtres:', error);
        }
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

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            const allCategories = Object.keys(this.categories);
            console.log('[CategoryManager] Toutes catégories actives:', allCategories);
            return allCategories;
        }
        
        return [...this.settings.activeCategories];
    }

    isCategoryActive(categoryId) {
        const activeCategories = this.getActiveCategories();
        return activeCategories.includes(categoryId);
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

    getCategories() {
        return this.categories;
    }

    getCustomCategories() {
        return this.customCategories;
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

    getCategoryFilters(categoryId) {
        return this.categoryFilters?.[categoryId] || {
            includeDomains: [],
            includeEmails: [],
            excludeDomains: [],
            excludeEmails: []
        };
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
        console.log('[CategoryManager] 🆕 Création catégorie personnalisée:', categoryData);
        
        // Générer un ID unique
        const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newCategory = {
            ...categoryData,
            id,
            isCustom: true,
            priority: categoryData.priority || 30,
            keywords: categoryData.keywords || {
                absolute: [],
                strong: [],
                weak: [],
                exclusions: []
            }
        };
        
        // Ajouter aux catégories
        this.categories[id] = newCategory;
        this.customCategories[id] = newCategory;
        this.weightedKeywords[id] = newCategory.keywords;
        
        // Sauvegarder
        this.saveCustomCategories();
        
        // Invalider le cache
        this.invalidateCache();
        
        console.log('[CategoryManager] ✅ Catégorie créée:', id);
        
        return { id, ...newCategory };
    }

    deleteCustomCategory(categoryId) {
        console.log('[CategoryManager] 🗑️ Suppression catégorie:', categoryId);
        
        if (!this.customCategories[categoryId]) {
            console.warn('[CategoryManager] Catégorie non trouvée ou non personnalisée');
            return false;
        }
        
        // Supprimer de toutes les structures
        delete this.categories[categoryId];
        delete this.customCategories[categoryId];
        delete this.weightedKeywords[categoryId];
        delete this.categoryFilters?.[categoryId];
        
        // Retirer des catégories actives si présente
        if (this.settings.activeCategories?.includes(categoryId)) {
            this.settings.activeCategories = this.settings.activeCategories.filter(id => id !== categoryId);
            this.saveSettingsToStorage();
        }
        
        // Retirer des catégories pré-sélectionnées si présente
        if (this.settings.taskPreselectedCategories?.includes(categoryId)) {
            this.settings.taskPreselectedCategories = this.settings.taskPreselectedCategories.filter(id => id !== categoryId);
            this.saveSettingsToStorage();
        }
        
        // Sauvegarder
        this.saveCustomCategories();
        this.saveCategoryFilters();
        
        // Invalider le cache
        this.invalidateCache();
        
        console.log('[CategoryManager] ✅ Catégorie supprimée');
        
        return true;
    }

    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] 💾 Catégories personnalisées sauvegardées');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde catégories personnalisées:', error);
        }
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
// INITIALISATION GLOBALE OPTIMISÉE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v21.1 CORRIGÉE...');
window.categoryManager = new CategoryManager();

// Test de performance amélioré
window.testCategoryManagerPerformance = function() {
    console.group('🚀 TEST PERFORMANCE CategoryManager v21.1');
    
    const start = performance.now();
    
    const testEmails = Array.from({ length: 100 }, (_, i) => ({
        id: `test-${i}`,
        subject: `Test email ${i}`,
        from: { emailAddress: { address: `test${i}@example.com` } },
        bodyPreview: 'This is a test email with some content',
        receivedDateTime: new Date().toISOString()
    }));
    
    console.log('Test de 100 emails...');
    
    const results = testEmails.map(email => 
        window.categoryManager.analyzeEmailOptimized(email)
    );
    
    const end = performance.now();
    const duration = end - start;
    
    console.log(`✅ 100 emails analysés en ${duration.toFixed(2)}ms`);
    console.log(`📊 Moyenne: ${(duration / 100).toFixed(2)}ms par email`);
    console.log(`📈 Estimation 700 emails: ${(duration * 7).toFixed(2)}ms`);
    
    const stats = window.categoryManager.getPerformanceStats();
    console.log('Cache stats:', stats.cache);
    
    console.groupEnd();
    return { duration, avgPerEmail: duration / 100, results: results.length };
};

console.log('✅ CategoryManager v21.1 CORRIGÉ loaded - Performance maximisée et bugs fixés!');
