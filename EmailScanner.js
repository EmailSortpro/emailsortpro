// EmailScanner.js - Version 17.0 - Scanner Entreprise avec Détection par Contenu
// Détection basée uniquement sur les mots-clés et le contenu, sans domaines prédéfinis

console.log('[EmailScanner] 🚀 Loading EmailScanner.js v17.0 - Enterprise Content Detection...');

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        // Configuration optimisée
        this.config = {
            batchSize: 100,
            categorizationDelay: 0,
            maxConcurrentAnalysis: 10,
            cacheCategories: true,
            debugMode: false,
            enhancedDetection: true
        };
        
        // Cache de catégorisation
        this.categoryCache = new Map();
        
        // Métriques de performance
        this.metrics = {
            startTime: null,
            categorizedCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            avgCategorizeTime: 0,
            detectionStats: {}
        };
        
        // Patterns de détection améliorés
        this.detectionPatterns = this.initializeDetectionPatterns();
        
        console.log('[EmailScanner] ✅ Version 17.0 initialized - Enhanced Detection');
        this.initializeWithSync();
    }

    // ================================================
    // PATTERNS DE DÉTECTION POUR CONTEXTE ENTREPRISE
    // ================================================
    initializeDetectionPatterns() {
        return {
            // Patterns basés uniquement sur le contenu, pas les domaines
            contentPatterns: {
                // Patterns d'adresses d'envoi automatiques
                automatedSenders: [
                    'no-reply@', 'noreply@', 'donotreply@', 'ne-pas-repondre@',
                    'notifications@', 'alerts@', 'system@', 'automated@'
                ],
                
                // Patterns de désabonnement (fort indicateur de newsletter/marketing)
                unsubscribePatterns: [
                    'unsubscribe', 'désabonner', 'désinscrire', 'stop receiving', 
                    'opt out', 'opt-out', 'manage preferences', 'gérer vos préférences',
                    'email preferences', 'préférences email', 'notification settings',
                    'click here to stop', 'ne plus recevoir', 'arrêter les emails',
                    'vous ne souhaitez plus', 'manage your subscription',
                    'update your preferences', 'communication preferences'
                ],
                
                // Patterns de notifications automatiques
                notificationIndicators: [
                    'this is an automated', 'ceci est un message automatique',
                    'do not reply to this', 'ne pas répondre à ce',
                    'automated message', 'message automatique',
                    'system notification', 'notification système',
                    'automatic notification', 'notification automatique'
                ]
            },
            
            // Mots-clés métier pour améliorer la détection
            businessKeywords: {
                // Indicateurs d'action requise
                actionRequired: [
                    'action required', 'action requise', 'urgent action',
                    'immediate action', 'action immédiate', 'response required',
                    'réponse requise', 'please respond', 'merci de répondre',
                    'deadline', 'échéance', 'due date', 'date limite'
                ],
                
                // Indicateurs de communication interne
                internalComm: [
                    'all staff', 'tout le personnel', 'team update',
                    'company announcement', 'annonce entreprise',
                    'internal communication', 'communication interne',
                    'memo', 'note de service', 'to all employees'
                ],
                
                // Indicateurs de projet
                projectRelated: [
                    'project update', 'mise à jour projet', 'milestone',
                    'deliverable', 'livrable', 'sprint', 'roadmap',
                    'project status', 'statut projet', 'progress report'
                ]
            }
        };
    }

    // ================================================
    // ANALYSE D'EMAIL AMÉLIORÉE v17
    // ================================================
    analyzeEmail(email) {
        if (!email) {
            return { category: 'other', score: 0, confidence: 0 };
        }

        const startTime = performance.now();
        
        // Vérifier le cache
        const cacheKey = this.getEmailCacheKey(email);
        if (this.config.cacheCategories && this.categoryCache.has(cacheKey)) {
            this.metrics.cacheHits++;
            return this.categoryCache.get(cacheKey);
        }
        
        this.metrics.cacheMisses++;
        
        // 1. Vérifications préliminaires
        if (this.isSpamEmail(email) && this.settings.preferences?.excludeSpam !== false) {
            const result = { category: 'spam', score: 0, confidence: 1, isSpam: true };
            this.categoryCache.set(cacheKey, result);
            return result;
        }

        // 2. Détection améliorée basée sur les patterns
        const patternDetection = this.detectByPatterns(email);
        if (patternDetection && patternDetection.confidence >= 0.8) {
            this.categoryCache.set(cacheKey, patternDetection);
            this.updateMetrics(startTime);
            return patternDetection;
        }

        // 3. Extraction du contenu
        const content = this.extractContentOptimized(email);
        
        // 4. Détection CC
        if (this.settings.preferences?.detectCC !== false && this.isDefinitelyInCC(email)) {
            const result = {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'in_cc', type: 'system', score: 100 }],
                hasAbsolute: true,
                isCC: true
            };
            this.categoryCache.set(cacheKey, result);
            this.updateMetrics(startTime);
            return result;
        }
        
        // 5. Analyse multi-catégories avec pondération améliorée
        const categoryScores = this.analyzeCategoriesEnhanced(content, email);
        
        // 6. Sélection intelligente de la catégorie
        const bestCategory = this.selectBestCategoryIntelligent(categoryScores, email);
        
        // 7. Résultat final
        let result;
        if (bestCategory && bestCategory.score >= 25) { // Seuil abaissé pour plus de sensibilité
            result = {
                category: bestCategory.category,
                score: bestCategory.score,
                confidence: bestCategory.confidence,
                matchedPatterns: bestCategory.matches || [],
                hasAbsolute: bestCategory.hasAbsolute || false,
                detectionMethod: bestCategory.detectionMethod || 'keywords'
            };
        } else {
            result = { category: 'other', score: 0, confidence: 0 };
        }
        
        // Mettre en cache
        if (this.config.cacheCategories) {
            this.categoryCache.set(cacheKey, result);
        }
        
        this.updateMetrics(startTime);
        
        if (this.config.debugMode && result.category !== 'other') {
            console.log(`[EmailScanner] Categorized "${email.subject?.substring(0, 50)}..." as ${result.category} (score: ${result.score}, method: ${result.detectionMethod})`);
        }
        
        return result;
    }

    // ================================================
    // DÉTECTION PAR PATTERNS BASÉE SUR LE CONTENU
    // ================================================
    detectByPatterns(email) {
        const fromAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
        const subject = email.subject?.toLowerCase() || '';
        const bodyContent = this.getEmailBodyContent(email).toLowerCase();
        
        // 1. Détecter les emails marketing/newsletter par le contenu
        if (this.isMarketingNewsletter(fromAddress, bodyContent)) {
            return {
                category: 'marketing_news',
                score: 120,
                confidence: 0.85,
                matchedPatterns: [
                    { keyword: 'unsubscribe_pattern', type: 'content', score: 100 }
                ],
                hasAbsolute: true,
                detectionMethod: 'content_analysis'
            };
        }
        
        // 2. Détecter les notifications automatiques
        if (this.isAutomatedNotification(fromAddress, bodyContent)) {
            return {
                category: 'notifications',
                score: 100,
                confidence: 0.8,
                matchedPatterns: [
                    { keyword: 'automated_sender', type: 'sender', score: 100 }
                ],
                hasAbsolute: true,
                detectionMethod: 'sender_analysis'
            };
        }
        
        // 3. Détecter les emails d'action requise
        if (this.requiresAction(subject, bodyContent)) {
            return {
                category: 'tasks',
                score: 110,
                confidence: 0.85,
                matchedPatterns: [
                    { keyword: 'action_required', type: 'content', score: 110 }
                ],
                hasAbsolute: true,
                detectionMethod: 'action_detection'
            };
        }
        
        // 4. Détecter les communications internes
        if (this.isInternalCommunication(subject, bodyContent)) {
            return {
                category: 'internal',
                score: 90,
                confidence: 0.8,
                matchedPatterns: [
                    { keyword: 'internal_comm', type: 'content', score: 90 }
                ],
                hasAbsolute: true,
                detectionMethod: 'internal_detection'
            };
        }
        
        return null;
    }

    isMarketingNewsletter(fromAddress, bodyContent) {
        // Vérifier la présence de liens de désabonnement (fort indicateur)
        const hasUnsubscribe = this.detectionPatterns.contentPatterns.unsubscribePatterns
            .some(pattern => bodyContent.includes(pattern));
        
        // Vérifier si c'est un expéditeur automatique
        const isAutomatedSender = this.detectionPatterns.contentPatterns.automatedSenders
            .some(pattern => fromAddress.includes(pattern));
        
        // Newsletter = lien de désabonnement OU (expéditeur automatique + contenu marketing)
        return hasUnsubscribe || (isAutomatedSender && this.hasMarketingContent(bodyContent));
    }

    isAutomatedNotification(fromAddress, bodyContent) {
        // Vérifier l'expéditeur
        const isAutomatedSender = this.detectionPatterns.contentPatterns.automatedSenders
            .some(pattern => fromAddress.includes(pattern));
        
        // Vérifier les indicateurs de notification automatique
        const hasNotificationIndicators = this.detectionPatterns.contentPatterns.notificationIndicators
            .some(pattern => bodyContent.includes(pattern));
        
        return isAutomatedSender && hasNotificationIndicators;
    }

    requiresAction(subject, bodyContent) {
        const combinedContent = subject + ' ' + bodyContent;
        
        // Compter les indicateurs d'action requise
        const actionIndicators = this.detectionPatterns.businessKeywords.actionRequired
            .filter(pattern => combinedContent.includes(pattern)).length;
        
        return actionIndicators >= 2; // Au moins 2 indicateurs
    }

    isInternalCommunication(subject, bodyContent) {
        const combinedContent = subject + ' ' + bodyContent;
        
        // Vérifier les patterns de communication interne
        return this.detectionPatterns.businessKeywords.internalComm
            .some(pattern => combinedContent.includes(pattern));
    }

    hasMarketingContent(bodyContent) {
        // Indicateurs de contenu marketing (sans référence à des domaines spécifiques)
        const marketingIndicators = [
            'offre spéciale', 'special offer', 'promotion', 'promo',
            'réduction', 'discount', 'soldes', 'sale', 'économisez',
            'save', 'gratuit', 'free', 'nouveau', 'new', 'découvrez',
            'discover', 'cliquez ici', 'click here', 'inscrivez-vous',
            'sign up', 'abonnez-vous', 'subscribe'
        ];
        
        const indicatorCount = marketingIndicators
            .filter(indicator => bodyContent.includes(indicator)).length;
        
        return indicatorCount >= 2; // Au moins 2 indicateurs marketing
    }

    getEmailBodyContent(email) {
        return email.bodyPreview || 
               email.body?.content || 
               email.bodyText || 
               '';
    }

    // ================================================
    // ANALYSE DES CATÉGORIES AMÉLIORÉE
    // ================================================
    analyzeCategoriesEnhanced(content, email) {
        if (!window.categoryManager) {
            console.warn('[EmailScanner] CategoryManager not available');
            return {};
        }
        
        const activeCategories = window.categoryManager.getActiveCategories();
        const results = {};
        
        // Analyser chaque catégorie active
        for (const categoryId of activeCategories) {
            const keywords = window.categoryManager.getCategoryKeywords(categoryId);
            if (!keywords || (!keywords.absolute?.length && !keywords.strong?.length && !keywords.weak?.length)) {
                continue;
            }
            
            // Calcul du score avec bonus contextuels
            const baseScore = this.calculateScoreOptimized(content.text, keywords, categoryId);
            const contextBonus = this.calculateContextBonus(email, categoryId);
            
            const totalScore = baseScore.total + contextBonus;
            
            if (totalScore > 0) {
                results[categoryId] = {
                    category: categoryId,
                    score: totalScore,
                    hasAbsolute: baseScore.hasAbsolute,
                    matches: baseScore.matches,
                    confidence: this.calculateConfidenceEnhanced(baseScore, contextBonus),
                    priority: window.categoryManager.categories[categoryId]?.priority || 50,
                    contextBonus: contextBonus,
                    detectionMethod: contextBonus > 0 ? 'keywords_context' : 'keywords'
                };
            }
        }
        
        return results;
    }

    calculateContextBonus(email, categoryId) {
        let bonus = 0;
        
        const fromAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
        const subject = email.subject?.toLowerCase() || '';
        const bodyContent = this.getEmailBodyContent(email).toLowerCase();
        
        // Bonus basés sur le contenu et l'expéditeur, sans référence aux domaines
        
        // Bonus pour marketing_news
        if (categoryId === 'marketing_news') {
            // Bonus pour expéditeur automatique
            if (this.detectionPatterns.contentPatterns.automatedSenders
                .some(pattern => fromAddress.includes(pattern))) {
                bonus += 25;
            }
            
            // Bonus si contient des liens de désabonnement
            if (this.detectionPatterns.contentPatterns.unsubscribePatterns
                .some(pattern => bodyContent.includes(pattern))) {
                bonus += 40; // Fort indicateur de newsletter
            }
            
            // Bonus pour contenu marketing
            if (this.hasMarketingContent(bodyContent)) {
                bonus += 20;
            }
        }
        
        // Bonus pour notifications
        if (categoryId === 'notifications') {
            // Bonus pour expéditeur automatique
            if (this.detectionPatterns.contentPatterns.automatedSenders
                .some(pattern => fromAddress.includes(pattern))) {
                bonus += 30;
            }
            
            // Bonus pour indicateurs de notification automatique
            if (this.detectionPatterns.contentPatterns.notificationIndicators
                .some(pattern => bodyContent.includes(pattern))) {
                bonus += 25;
            }
        }
        
        // Bonus pour tasks (actions requises)
        if (categoryId === 'tasks') {
            const actionCount = this.detectionPatterns.businessKeywords.actionRequired
                .filter(pattern => (subject + ' ' + bodyContent).includes(pattern)).length;
            bonus += actionCount * 20; // 20 points par indicateur d'action
        }
        
        // Bonus pour internal (communications internes)
        if (categoryId === 'internal') {
            if (this.detectionPatterns.businessKeywords.internalComm
                .some(pattern => (subject + ' ' + bodyContent).includes(pattern))) {
                bonus += 35;
            }
        }
        
        // Bonus pour project
        if (categoryId === 'project') {
            const projectCount = this.detectionPatterns.businessKeywords.projectRelated
                .filter(pattern => (subject + ' ' + bodyContent).includes(pattern)).length;
            bonus += projectCount * 15;
        }
        
        // Bonus pour commercial (sans domaines spécifiques)
        if (categoryId === 'commercial') {
            // Détecter les patterns d'emploi/recrutement dans le contenu
            const jobKeywords = [
                'emploi', 'job', 'poste', 'position', 'candidature',
                'application', 'recrutement', 'recruitment', 'offre d\'emploi',
                'job offer', 'opportunity', 'opportunité', 'carrière', 'career'
            ];
            
            const jobCount = jobKeywords
                .filter(keyword => (subject + ' ' + bodyContent).includes(keyword)).length;
            bonus += jobCount * 15;
        }
        
        return bonus;
    }

    calculateConfidenceEnhanced(score, contextBonus) {
        const totalScore = score.total + contextBonus;
        
        if (score.hasAbsolute) return 0.95;
        if (totalScore >= 250) return 0.95;
        if (totalScore >= 200) return 0.90;
        if (totalScore >= 150) return 0.85;
        if (totalScore >= 100) return 0.80;
        if (totalScore >= 80) return 0.75;
        if (totalScore >= 60) return 0.70;
        if (totalScore >= 40) return 0.65;
        if (totalScore >= 25) return 0.60;
        return 0.50;
    }

    // ================================================
    // SÉLECTION INTELLIGENTE DE CATÉGORIE
    // ================================================
    selectBestCategoryIntelligent(categoryScores, email) {
        const MIN_SCORE_THRESHOLD = 25; // Seuil abaissé
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        // Filtrer les candidats valides
        const candidates = Object.values(categoryScores)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD);
        
        if (candidates.length === 0) {
            return null;
        }
        
        // Trier par méthode de détection, priorité, puis score
        return candidates.sort((a, b) => {
            // Priorité aux détections par pattern
            if (a.detectionMethod?.includes('pattern') && !b.detectionMethod?.includes('pattern')) return -1;
            if (!a.detectionMethod?.includes('pattern') && b.detectionMethod?.includes('pattern')) return 1;
            
            // Puis par mots absolus
            if (a.hasAbsolute && !b.hasAbsolute) return -1;
            if (!a.hasAbsolute && b.hasAbsolute) return 1;
            
            // Puis par priorité de catégorie
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            
            // Enfin par score total
            return b.score - a.score;
        })[0];
    }

    // ================================================
    // EXTRACTION DE CONTENU OPTIMISÉE
    // ================================================
    extractContentOptimized(email) {
        const parts = [];
        
        // Sujet (très important)
        if (email.subject?.trim()) {
            // Répéter le sujet plusieurs fois pour augmenter son poids
            parts.push(...Array(5).fill(email.subject.toLowerCase()));
        }
        
        // From (important pour la détection)
        if (email.from?.emailAddress?.address) {
            parts.push(...Array(3).fill(email.from.emailAddress.address.toLowerCase()));
        }
        
        // Corps
        const maxBodyLength = 5000;
        
        if (email.bodyPreview) {
            parts.push(email.bodyPreview.toLowerCase());
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtmlFast(email.body.content);
            if (cleanedBody.length > maxBodyLength) {
                parts.push(cleanedBody.substring(0, maxBodyLength).toLowerCase());
            } else {
                parts.push(cleanedBody.toLowerCase());
            }
        }
        
        if (email.bodyText && email.bodyText.length <= maxBodyLength) {
            parts.push(email.bodyText.toLowerCase());
        }
        
        const fullText = parts.join(' ');
        
        return {
            text: fullText,
            subject: email.subject?.toLowerCase() || '',
            domain: this.extractDomain(email.from?.emailAddress?.address),
            from: email.from?.emailAddress?.address?.toLowerCase() || '',
            length: fullText.length
        };
    }

    // ================================================
    // MÉTHODES OPTIMISÉES (reprises de v16)
    // ================================================
    calculateScoreOptimized(text, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        
        // Utiliser une map pour les recherches rapides
        const textWords = new Set(text.split(/\s+/));
        
        // Test des mots-clés absolus
        if (keywords.absolute?.length) {
            for (const keyword of keywords.absolute) {
                if (this.containsKeyword(text, textWords, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    if (totalScore >= 200) break;
                }
            }
        }
        
        // Test des mots-clés forts
        if (totalScore < 300 && keywords.strong?.length) {
            let strongCount = 0;
            for (const keyword of keywords.strong) {
                if (this.containsKeyword(text, textWords, keyword)) {
                    totalScore += 50;
                    strongCount++;
                    matches.push({ keyword, type: 'strong', score: 50 });
                    
                    if (strongCount >= 5) break;
                }
            }
            
            if (strongCount >= 3) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong', type: 'bonus', score: 30 });
            }
        }
        
        // Test des mots-clés faibles
        if (totalScore < 200 && keywords.weak?.length) {
            let weakCount = 0;
            for (const keyword of keywords.weak) {
                if (this.containsKeyword(text, textWords, keyword)) {
                    totalScore += 15;
                    weakCount++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                    
                    if (weakCount >= 6) break;
                }
            }
            
            if (weakCount >= 4) {
                totalScore += 20;
                matches.push({ keyword: 'multiple_weak', type: 'bonus', score: 20 });
            }
        }
        
        // Test des exclusions
        if (keywords.exclusions?.length && totalScore > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.containsKeyword(text, textWords, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
                }
            }
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    containsKeyword(text, textWords, keyword) {
        // Normaliser le keyword
        const normalizedKeyword = keyword.toLowerCase().trim();
        
        // Pour les mots simples
        if (!normalizedKeyword.includes(' ')) {
            return textWords.has(normalizedKeyword);
        }
        
        // Pour les phrases, vérifier la présence exacte
        return text.includes(normalizedKeyword);
    }

    // ================================================
    // AUTRES MÉTHODES (reprises de v16 avec améliorations)
    // ================================================
    
    cleanHtmlFast(html) {
        if (!html) return '';
        
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    isSpamEmail(email) {
        if (email.parentFolderId) {
            const folder = email.parentFolderId.toLowerCase();
            if (folder.includes('junk') || folder.includes('spam') || 
                folder.includes('unwanted') || folder.includes('indésirable')) {
                return true;
            }
        }
        
        if (email.categories?.length) {
            return email.categories.some(cat => {
                const lower = cat.toLowerCase();
                return lower.includes('spam') || lower.includes('junk') || 
                       lower.includes('indésirable');
            });
        }
        
        return false;
    }

    isDefinitelyInCC(email) {
        if (!email.ccRecipients?.length || email.toRecipients?.length) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) {
            return false;
        }
        
        const lowerEmail = currentUserEmail.toLowerCase();
        
        const inCC = email.ccRecipients.some(r => 
            r.emailAddress?.address?.toLowerCase() === lowerEmail
        );
        
        const inTO = email.toRecipients?.some(r => 
            r.emailAddress?.address?.toLowerCase() === lowerEmail
        ) || false;
        
        return inCC && !inTO;
    }

    getCurrentUserEmail() {
        if (this._currentUserEmail) {
            return this._currentUserEmail;
        }
        
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                this._currentUserEmail = parsed.email || parsed.userPrincipalName || parsed.mail;
                return this._currentUserEmail;
            }
            
            const msalAccounts = JSON.parse(localStorage.getItem('msal.account.keys') || '[]');
            if (msalAccounts.length > 0) {
                const firstAccount = localStorage.getItem(msalAccounts[0]);
                if (firstAccount) {
                    const account = JSON.parse(firstAccount);
                    this._currentUserEmail = account.username || account.preferred_username;
                    return this._currentUserEmail;
                }
            }
            
            if (window.authService?.getAccount) {
                const account = window.authService.getAccount();
                if (account?.username) {
                    this._currentUserEmail = account.username;
                    return this._currentUserEmail;
                }
            }
            
        } catch (e) {
            console.warn('[EmailScanner] Unable to get user email:', e);
        }
        
        return null;
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    getEmailCacheKey(email) {
        return `${email.id}_${email.subject?.substring(0, 50)}_${email.from?.emailAddress?.address}`;
    }

    updateMetrics(startTime) {
        const categorizeTime = performance.now() - startTime;
        
        const count = this.metrics.cacheHits + this.metrics.cacheMisses;
        this.metrics.avgCategorizeTime = 
            (this.metrics.avgCategorizeTime * (count - 1) + categorizeTime) / count;
    }

    // ================================================
    // SCAN PRINCIPAL
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === STARTING ENHANCED SCAN v17.0 ===');
        
        if (this.isScanning) {
            console.warn('[EmailScanner] ⚠️ Scan already in progress');
            return null;
        }

        const scanOptions = this.prepareScanOptions(options);
        console.log('[EmailScanner] 📊 Scan options:', scanOptions);

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = scanOptions.onProgress;
            this.metrics.startTime = Date.now();

            // Étape 1: Récupération des emails
            await this.fetchEmails(scanOptions);
            
            if (this.emails.length === 0) {
                return this.buildResults(scanOptions);
            }

            // Étape 2: Catégorisation améliorée
            if (scanOptions.autoCategrize) {
                await this.categorizeEmailsEnhanced();
            }

            // Étape 3: Analyse IA (optionnelle)
            if (scanOptions.autoAnalyze && window.aiTaskAnalyzer) {
                await this.analyzeForTasksOptimized();
            }

            // Résultats
            const results = this.buildResults(scanOptions);
            
            const scanTime = Date.now() - this.metrics.startTime;
            console.log(`[EmailScanner] 🎉 === SCAN COMPLETED in ${scanTime}ms ===`);
            console.log('[EmailScanner] 📊 Results:', {
                total: results.total,
                categorized: results.categorized,
                preselected: results.stats.preselectedForTasks,
                cacheHits: this.metrics.cacheHits,
                cacheMisses: this.metrics.cacheMisses,
                detectionStats: this.metrics.detectionStats
            });

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé !',
                    results
                });
            }

            // Notifier
            this.dispatchEvent('scanCompleted', {
                results,
                emails: this.emails,
                metrics: this.metrics
            });

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Scan error:', error);
            this.metrics.errors++;
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'error',
                    message: error.message,
                    error
                });
            }
            
            throw error;
            
        } finally {
            this.isScanning = false;
        }
    }

    async categorizeEmailsEnhanced() {
        const total = this.emails.length;
        console.log(`[EmailScanner] 🏷️ === CATEGORIZING ${total} EMAILS (Enhanced) ===`);
        console.log('[EmailScanner] ⭐ Preselected categories:', this.taskPreselectedCategories);

        let processed = 0;
        const batchSize = this.config.batchSize;
        
        // Initialiser les stats de détection
        this.metrics.detectionStats = {
            byPattern: 0,
            byKeywords: 0,
            byContext: 0,
            uncategorized: 0
        };
        
        // Traiter par batches
        for (let i = 0; i < total; i += batchSize) {
            const batch = this.emails.slice(i, Math.min(i + batchSize, total));
            
            batch.forEach(email => {
                try {
                    const analysis = this.analyzeEmail(email);
                    
                    // Assigner les résultats
                    email.category = analysis.category;
                    email.categoryScore = analysis.score;
                    email.categoryConfidence = analysis.confidence;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.detectionMethod = analysis.detectionMethod || 'unknown';
                    
                    // Stats de détection
                    if (analysis.category === 'other') {
                        this.metrics.detectionStats.uncategorized++;
                    } else if (analysis.detectionMethod?.includes('pattern')) {
                        this.metrics.detectionStats.byPattern++;
                    } else if (analysis.detectionMethod?.includes('context')) {
                        this.metrics.detectionStats.byContext++;
                    } else {
                        this.metrics.detectionStats.byKeywords++;
                    }
                    
                    // Vérifier si pré-sélectionné pour tâches
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(analysis.category);
                    
                    // Ajouter à la catégorie
                    if (!this.categorizedEmails[analysis.category]) {
                        this.categorizedEmails[analysis.category] = [];
                    }
                    this.categorizedEmails[analysis.category].push(email);
                    
                    processed++;
                    this.metrics.categorizedCount++;
                    
                } catch (error) {
                    console.error('[EmailScanner] Categorization error:', error);
                    this.metrics.errors++;
                    
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    
                    if (!this.categorizedEmails.other) {
                        this.categorizedEmails.other = [];
                    }
                    this.categorizedEmails.other.push(email);
                    
                    processed++;
                }
            });
            
            // Mise à jour du progrès
            if (this.scanProgress) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} (${percent}%)`,
                    progress: { current: processed, total }
                });
            }
            
            // Micro-pause entre batches si configuré
            if (this.config.categorizationDelay > 0 && i + batchSize < total) {
                await new Promise(resolve => setTimeout(resolve, this.config.categorizationDelay));
            }
        }

        console.log('[EmailScanner] ✅ Categorization complete');
        console.log('[EmailScanner] 📊 Detection stats:', this.metrics.detectionStats);
        console.log(`[EmailScanner] 📊 Cache stats: ${this.metrics.cacheHits} hits, ${this.metrics.cacheMisses} misses`);
    }

    // ================================================
    // MÉTHODES REPRISES DE v16
    // ================================================
    
    async initializeWithSync() {
        console.log('[EmailScanner] 🔧 Initializing...');
        
        try {
            await this.loadSettingsFromCategoryManager();
            this.registerAsChangeListener();
            this.setupEventListeners();
            
            console.log('[EmailScanner] ✅ Initialization complete');
            console.log('[EmailScanner] ⭐ Task categories:', this.taskPreselectedCategories);
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Initialization error:', error);
        }
    }

    prepareScanOptions(options) {
        const scanSettings = this.settings.scanSettings || {};
        
        return {
            days: options.days ?? scanSettings.defaultPeriod ?? 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            maxEmails: options.maxEmails ?? scanSettings.maxEmails ?? 1000,
            autoAnalyze: options.autoAnalyze ?? scanSettings.autoAnalyze ?? true,
            autoCategrize: options.autoCategrize ?? scanSettings.autoCategrize ?? true,
            taskPreselectedCategories: options.taskPreselectedCategories || [...this.taskPreselectedCategories],
            includeSpam: options.includeSpam ?? !this.settings.preferences?.excludeSpam,
            provider: options.provider || 'microsoft'
        };
    }

    async fetchEmails(options) {
        console.log('[EmailScanner] 📬 Fetching emails...');
        
        if (this.scanProgress) {
            this.scanProgress({ 
                phase: 'fetching', 
                message: 'Récupération des emails...',
                progress: { current: 0, total: 100 }
            });
        }

        try {
            if (!window.mailService) {
                throw new Error('MailService not available');
            }

            if (!window.mailService.isInitialized()) {
                await window.mailService.initialize();
            }

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - options.days);

            const emails = await window.mailService.getMessages(options.folder, {
                maxResults: options.maxEmails,
                days: options.days,
                includeSpam: options.includeSpam
            });

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails fetched`);

        } catch (error) {
            console.error('[EmailScanner] ❌ Fetch error:', error);
            throw error;
        }
    }

    async analyzeForTasksOptimized() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] ⚠️ AITaskAnalyzer not available');
            return;
        }

        const emailsToAnalyze = this.emails
            .filter(email => email.isPreselectedForTasks && email.categoryConfidence > 0.6)
            .sort((a, b) => b.categoryConfidence - a.categoryConfidence)
            .slice(0, 50);

        console.log(`[EmailScanner] 🤖 AI analysis for ${emailsToAnalyze.length} emails`);

        const concurrentLimit = this.config.maxConcurrentAnalysis;
        
        for (let i = 0; i < emailsToAnalyze.length; i += concurrentLimit) {
            const batch = emailsToAnalyze.slice(i, Math.min(i + concurrentLimit, emailsToAnalyze.length));
            
            const promises = batch.map(email => 
                this.analyzeEmailForTask(email).catch(error => {
                    console.error('[EmailScanner] AI analysis error:', error);
                    email.aiAnalysisError = error.message;
                    return null;
                })
            );
            
            await Promise.all(promises);
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'analyzing',
                    message: `Analyse IA: ${Math.min(i + concurrentLimit, emailsToAnalyze.length)}/${emailsToAnalyze.length}`,
                    progress: { current: i + batch.length, total: emailsToAnalyze.length }
                });
            }
        }
    }

    async analyzeEmailForTask(email) {
        try {
            const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
            email.aiAnalysis = analysis;
            email.taskSuggested = analysis?.mainTask?.title ? true : false;
            return analysis;
        } catch (error) {
            email.aiAnalysisError = error.message;
            throw error;
        }
    }

    buildResults(options) {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithTasks = 0;
        let totalPreselected = 0;

        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId !== 'other' && catId !== 'spam') {
                totalCategorized += emails.length;
            }
            
            emails.forEach(email => {
                if (email.categoryConfidence >= 0.8) {
                    totalWithHighConfidence++;
                }
                if (email.taskSuggested) {
                    totalWithTasks++;
                }
                if (email.isPreselectedForTasks) {
                    totalPreselected++;
                }
            });
        });

        const scanDuration = this.metrics.startTime ? 
            Math.round((Date.now() - this.metrics.startTime) / 1000) : 0;

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: {
                processed: this.emails.length,
                errors: this.metrics.errors,
                highConfidence: totalWithHighConfidence,
                taskSuggestions: totalWithTasks,
                preselectedForTasks: totalPreselected,
                scanDuration: scanDuration,
                cacheHits: this.metrics.cacheHits,
                cacheMisses: this.metrics.cacheMisses,
                detectionStats: this.metrics.detectionStats
            },
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.metrics,
            provider: options.provider
        };
    }

    reset() {
        console.log('[EmailScanner] 🔄 Resetting...');
        
        this.emails = [];
        this.categorizedEmails = {};
        this.categoryCache.clear();
        
        this.metrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            avgCategorizeTime: 0,
            detectionStats: {}
        };
        
        // Initialiser les catégories
        const categories = window.categoryManager?.getCategories() || {};
        Object.keys(categories).forEach(catId => {
            this.categorizedEmails[catId] = [];
        });
        
        ['other', 'spam', 'cc'].forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
            }
        });
    }

    async loadSettingsFromCategoryManager() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            try {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
                
                console.log('[EmailScanner] ✅ Settings loaded from CategoryManager');
                console.log('[EmailScanner] ⭐ Task categories:', this.taskPreselectedCategories);
                
                return true;
            } catch (error) {
                console.error('[EmailScanner] ❌ CategoryManager load error:', error);
                return this.loadDefaultSettings();
            }
        } else {
            console.warn('[EmailScanner] ⚠️ CategoryManager not available');
            return this.loadDefaultSettings();
        }
    }

    loadDefaultSettings() {
        this.settings = {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true,
                maxEmails: 1000
            },
            taskPreselectedCategories: [],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            }
        };
        this.taskPreselectedCategories = [];
        return true;
    }

    updateSettings(newSettings) {
        console.log('[EmailScanner] 📝 Updating settings:', newSettings);
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Updating task categories:', categories);
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        if (this.emails.length > 0) {
            let updated = 0;
            this.emails.forEach(email => {
                const wasPreselected = email.isPreselectedForTasks;
                email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
                if (wasPreselected !== email.isPreselectedForTasks) {
                    updated++;
                }
            });
            
            if (updated > 0) {
                console.log(`[EmailScanner] ✅ ${updated} emails updated for task preselection`);
            }
        }
    }

    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] ⚠️ No emails to recategorize');
            return;
        }

        console.log('[EmailScanner] 🔄 === RECATEGORIZING EMAILS ===');
        
        await this.loadSettingsFromCategoryManager();
        this.categoryCache.clear();
        
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });
        
        this.metrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            avgCategorizeTime: 0,
            detectionStats: {}
        };

        await this.categorizeEmailsEnhanced();
        
        console.log('[EmailScanner] ✅ Recategorization complete');
        
        this.dispatchEvent('emailsRecategorized', {
            emails: this.emails,
            breakdown: this.getCategoryBreakdown(),
            taskPreselectedCategories: this.taskPreselectedCategories,
            preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            detectionStats: this.metrics.detectionStats
        });
    }

    getAllEmails() {
        return [...this.emails];
    }

    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return [...this.emails];
        }
        return this.emails.filter(email => email.category === categoryId);
    }

    getPreselectedEmails() {
        return this.emails.filter(email => email.isPreselectedForTasks);
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    getCategoryBreakdown() {
        const breakdown = {};
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
        });
        return breakdown;
    }

    getTaskPreselectedCategories() {
        return [...this.taskPreselectedCategories];
    }

    registerAsChangeListener() {
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            this.changeListener = window.categoryManager.addChangeListener((type, data) => {
                console.log(`[EmailScanner] 📨 CategoryManager change: ${type}`);
                this.handleCategoryManagerChange(type, data);
            });
            
            console.log('[EmailScanner] 👂 CategoryManager listener registered');
        }
    }

    handleCategoryManagerChange(type, data) {
        const needsRecategorization = [
            'keywordsUpdated',
            'categoryCreated',
            'categoryUpdated',
            'categoryDeleted',
            'settingsChanged'
        ].includes(type);
        
        if (type === 'taskPreselectedCategories') {
            this.updateTaskPreselectedCategories(data);
        }
        
        if (needsRecategorization && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Auto-recategorization triggered');
            clearTimeout(this._recategorizeTimeout);
            this._recategorizeTimeout = setTimeout(() => {
                this.recategorizeEmails();
            }, 500);
        }
    }

    setupEventListeners() {
        window.addEventListener('keywordsUpdated', (event) => {
            if (this.emails.length > 0) {
                clearTimeout(this._keywordsTimeout);
                this._keywordsTimeout = setTimeout(() => {
                    this.recategorizeEmails();
                }, 300);
            }
        });
        
        window.addEventListener('settingsChanged', (event) => {
            if (event.detail?.type === 'taskPreselectedCategories') {
                this.updateTaskPreselectedCategories(event.detail.value);
            }
        });
        
        console.log('[EmailScanner] ✅ Event listeners configured');
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'EmailScanner',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`[EmailScanner] ❌ Event dispatch error ${eventName}:`, error);
        }
    }

    getDebugInfo() {
        return {
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: this.metrics.categorizedCount,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            settings: this.settings,
            metrics: {
                ...this.metrics,
                cacheSize: this.categoryCache.size,
                avgCategorizeTimeMs: this.metrics.avgCategorizeTime.toFixed(2)
            },
            config: this.config,
            version: '17.0'
        };
    }

    setDebugMode(enabled) {
        this.config.debugMode = enabled;
        console.log(`[EmailScanner] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    clearCache() {
        this.categoryCache.clear();
        console.log('[EmailScanner] 🧹 Category cache cleared');
    }

    destroy() {
        if (this.changeListener && typeof this.changeListener === 'function') {
            this.changeListener();
        }
        
        clearTimeout(this._recategorizeTimeout);
        clearTimeout(this._keywordsTimeout);
        
        this.emails = [];
        this.categorizedEmails = {};
        this.categoryCache.clear();
        
        console.log('[EmailScanner] Instance destroyed');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Cleaning up old instance...');
    window.emailScanner.destroy?.();
}

window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v17.0 loaded - Enterprise Content Detection');
console.log('🎯 Detection based on content analysis and keywords only');
console.log('📧 No predefined domain patterns - suitable for enterprise use');
console.log('🔍 Context-aware categorization with business keyword detection');
