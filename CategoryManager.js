// CategoryManager.js - Version 21.0 - Analyse complète des emails avec fullTextContent
// Amélioration majeure de l'extraction et de l'analyse du contenu

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // Système de synchronisation
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.initializeFilters();
        this.setupEventListeners();
        
        // Démarrer la synchronisation automatique
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 21.0 - Analyse complète avec fullTextContent');
    }

    // ================================================
    // SYSTÈME DE SYNCHRONISATION AUTOMATIQUE
    // ================================================
    startAutoSync() {
        // Synchronisation automatique toutes les 2 secondes
        setInterval(() => {
            this.processSettingsChanges();
        }, 2000);
        
        // Synchronisation immédiate lors des changements
        this.setupImmediateSync();
    }

    setupImmediateSync() {
        // Écouter les changements dans localStorage
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
        
        // Appliquer le changement dans les settings locaux
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
        
        // Sauvegarder immédiatement
        this.saveSettingsToStorage();
        
        // Notifier les modules si demandé
        if (notifyModules !== false) {
            this.notifySpecificModules(type, value);
            this.notifyAllModules(type, value);
        }
    }

    // ================================================
    // MÉTHODE D'ANALYSE PRINCIPALE - AMÉLIORÉE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Vérifier si c'est du spam
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        // Extraire le contenu complet pour l'analyse
        const content = this.extractCompleteContent(email);
        
        if (this.debugMode) {
            console.log('[CategoryManager] 📄 Analyse email:', {
                subject: email.subject,
                from: email.from?.emailAddress?.address,
                provider: email.provider,
                contentLength: content.text.length,
                hasFullText: !!email.fullTextContent
            });
        }
        
        // Vérifier les exclusions globales
        if (this.isGloballyExcluded(content, email)) {
            return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
        }
        
        // Détecter les emails personnels/familiaux
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
        
        // Vérifier si on est destinataire principal ou en CC
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        // Si on est en CC, vérifier d'abord si c'est du marketing
        if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
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
            
            const allResults = this.analyzeAllCategories(content);
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
        const allResults = this.analyzeAllCategories(content);
        
        // Sélectionner la meilleure catégorie
        const selectedResult = this.selectByPriorityWithThreshold(allResults);
        
        // Si aucune catégorie trouvée, retourner 'other'
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
    // EXTRACTION COMPLÈTE DU CONTENU - AMÉLIORÉE
    // ================================================
    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        // PRIORITÉ 1: Utiliser fullTextContent si disponible (depuis GoogleAuthService v8.0)
        if (email.fullTextContent) {
            allText = email.fullTextContent;
            subject = email.subject || '[SANS_SUJET]';
            
            // Ajouter le sujet au début s'il n'y est pas déjà
            if (!allText.toLowerCase().includes(subject.toLowerCase())) {
                allText = subject + '\n\n' + allText;
            }
        } else {
            // FALLBACK: Construire le contenu manuellement
            
            // Traiter le sujet avec un poids élevé
            if (email.subject && email.subject.trim()) {
                subject = email.subject;
                // Répéter le sujet pour lui donner plus de poids
                allText += (email.subject + ' ').repeat(5);
            } else {
                subject = '[SANS_SUJET]';
                allText += 'sans sujet email sans objet ';
            }
            
            // Ajouter l'expéditeur
            if (email.from?.emailAddress?.address) {
                allText += '\nFrom: ' + email.from.emailAddress.address + ' ';
                allText += (email.from.emailAddress.address + ' ').repeat(2);
            }
            if (email.from?.emailAddress?.name) {
                allText += email.from.emailAddress.name + ' ';
            }
            
            // Ajouter les destinataires
            if (email.toRecipients && Array.isArray(email.toRecipients)) {
                allText += '\nTo: ';
                email.toRecipients.forEach(recipient => {
                    if (recipient.emailAddress?.address) {
                        allText += recipient.emailAddress.address + ' ';
                    }
                });
            }
            
            // Ajouter les CC
            if (email.ccRecipients && Array.isArray(email.ccRecipients)) {
                allText += '\nCC: ';
                email.ccRecipients.forEach(recipient => {
                    if (recipient.emailAddress?.address) {
                        allText += recipient.emailAddress.address + ' ';
                    }
                });
            }
            
            // Ajouter le corps du message
            if (email.bodyPreview) {
                allText += '\n\n' + email.bodyPreview + ' ';
            }
            
            if (email.body?.content) {
                const cleanedBody = this.cleanHtml(email.body.content);
                allText += '\n' + cleanedBody + ' ';
            }
            
            // Ajouter le snippet Gmail si disponible
            if (email.gmailMetadata?.snippet && !allText.includes(email.gmailMetadata.snippet)) {
                allText += '\n' + email.gmailMetadata.snippet + ' ';
            }
        }
        
        // Analyser le contexte
        const contextClues = this.extractContextClues(email);
        allText += '\n' + contextClues;
        
        // Détecter les patterns spécifiques
        if (email.provider === 'gmail' || email.providerType === 'gmail') {
            const patterns = this.detectSpecialPatterns(allText);
            if (patterns) {
                allText += ' ' + patterns;
            }
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length,
            hasNoSubject: !email.subject || !email.subject.trim(),
            rawSubject: email.subject || '',
            provider: email.provider || email.providerType || 'unknown',
            hasFullTextContent: !!email.fullTextContent
        };
    }

    // ================================================
    // DÉTECTION DE PATTERNS SPÉCIAUX
    // ================================================
    detectSpecialPatterns(text) {
        const patterns = [];
        const textLower = text.toLowerCase();
        
        // Patterns de désabonnement (marketing)
        const unsubscribePatterns = [
            'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
            'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
            'gérer vos préférences', 'manage preferences', 'email preferences',
            'ne plus recevoir', 'stop emails', 'arrêter les emails',
            'cliquez?[- ]ici pour', 'click here to', 'update your preferences',
            'modifier vos préférences', 'communication preferences',
            'mailing list', 'liste de diffusion', 'notification settings'
        ];
        
        unsubscribePatterns.forEach(pattern => {
            if (textLower.includes(pattern)) {
                patterns.push('marketing_pattern_unsubscribe');
            }
        });
        
        // Patterns d'emails automatiques (notifications)
        const autoPatterns = [
            'no-reply@', 'noreply@', 'donotreply@', 'notification@',
            'automated message', 'automatic email', 'system notification',
            'do not reply', 'ne pas répondre', 'message automatique',
            'this is an automated', 'ceci est un message automatique'
        ];
        
        autoPatterns.forEach(pattern => {
            if (textLower.includes(pattern)) {
                patterns.push('notification_pattern_automated');
            }
        });
        
        // Patterns de recrutement
        const recruitmentPatterns = [
            'your application', 'votre candidature', 'recruitment team',
            'hiring manager', 'talent acquisition', 'job opportunity',
            'we regret to inform', 'nous avons le regret',
            'thank you for your application', 'merci pour votre candidature',
            'after thorough consideration', 'après examen approfondi'
        ];
        
        recruitmentPatterns.forEach(pattern => {
            if (textLower.includes(pattern)) {
                patterns.push('recruitment_pattern');
            }
        });
        
        // Patterns commerciaux/partenariats
        const commercialPatterns = [
            'collaboration', 'partnership', 'partenariat', 'collab',
            'exclusive offer', 'offre exclusive', 'limited edition',
            'édition limitée', 'special price', 'prix spécial',
            'disponible en magasin', 'available in store', 'boutique'
        ];
        
        commercialPatterns.forEach(pattern => {
            if (textLower.includes(pattern)) {
                patterns.push('commercial_pattern');
            }
        });
        
        return patterns.join(' ');
    }

    // ================================================
    // ANALYSE PAR CATÉGORIE
    // ================================================
    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // Toujours inclure les catégories personnalisées
        const customCategoryIds = Object.keys(this.customCategories);
        
        if (this.debugMode) {
            console.log('[CategoryManager] 🎯 Analyse des catégories:', {
                actives: activeCategories.length,
                personnalisées: customCategoryIds.length
            });
        }
        
        // Analyser toutes les catégories
        const allCategoriesToAnalyze = new Set([
            ...Object.keys(this.weightedKeywords),
            ...customCategoryIds
        ]);
        
        for (const categoryId of allCategoriesToAnalyze) {
            // Vérifier si la catégorie est active ou personnalisée
            const isActive = activeCategories.includes(categoryId);
            const isCustom = customCategoryIds.includes(categoryId);
            const isSpecial = ['marketing_news', 'cc'].includes(categoryId);
            
            if (!isActive && !isCustom && !isSpecial) {
                continue;
            }
            
            // Vérifier que la catégorie existe
            if (!this.categories[categoryId]) {
                console.warn(`[CategoryManager] ⚠️ Catégorie ${categoryId} non trouvée`);
                continue;
            }
            
            // Obtenir les mots-clés
            let keywords = this.weightedKeywords[categoryId];
            
            // Pour les catégories personnalisées
            if (isCustom && (!keywords || this.isEmptyKeywords(keywords))) {
                const customCat = this.customCategories[categoryId];
                if (customCat && customCat.keywords) {
                    keywords = customCat.keywords;
                    this.weightedKeywords[categoryId] = keywords;
                }
            }
            
            // Vérifier si la catégorie a des mots-clés
            if (!keywords || this.isEmptyKeywords(keywords)) {
                if (isCustom && this.debugMode) {
                    console.warn(`[CategoryManager] ⚠️ Catégorie personnalisée ${categoryId} sans mots-clés`);
                }
                continue;
            }
            
            // Calculer le score
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
            
            if (this.debugMode && score.total > 0) {
                console.log(`[CategoryManager] 📊 ${categoryId}: ${score.total}pts (${score.matches.length} matches)`);
            }
        }
        
        return results;
    }

    // ================================================
    // CALCUL DU SCORE - AMÉLIORÉ POUR GMAIL
    // ================================================
    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        const isGmail = content.provider === 'gmail' || content.provider === 'google';
        
        // Pénalité pour contenu personnel dans catégories professionnelles
        const personalIndicators = ['papa', 'maman', 'bises', 'bisous', 'famille', 'chéri', 'chérie'];
        const hasPersonalContent = personalIndicators.some(indicator => text.includes(indicator));
        
        if (hasPersonalContent && ['internal', 'hr', 'meetings', 'commercial'].includes(categoryId)) {
            totalScore -= 50;
            matches.push({ keyword: 'personal_content_penalty', type: 'penalty', score: -50 });
        }
        
        // Bonus de base par catégorie (ajustés pour Gmail)
        const categoryBonus = {
            'project': 10,
            'cc': 5,
            'security': 10,
            'hr': 10,
            'tasks': 15,
            'finance': 10,
            'marketing_news': isGmail ? 20 : 10,
            'notifications': isGmail ? 25 : 15,
            'commercial': isGmail ? 20 : 10
        };
        
        if (categoryBonus[categoryId]) {
            totalScore += categoryBonus[categoryId];
            matches.push({ keyword: 'category_bonus', type: 'bonus', score: categoryBonus[categoryId] });
        }
        
        // Bonus patterns détectés
        if (content.text.includes('marketing_pattern_unsubscribe') && categoryId === 'marketing_news') {
            totalScore += 80;
            matches.push({ keyword: 'unsubscribe_pattern_detected', type: 'pattern', score: 80 });
            hasAbsolute = true;
        }
        
        if (content.text.includes('notification_pattern_automated') && categoryId === 'notifications') {
            totalScore += 60;
            matches.push({ keyword: 'automated_email_pattern', type: 'pattern', score: 60 });
        }
        
        if (content.text.includes('recruitment_pattern') && categoryId === 'notifications') {
            totalScore += 50;
            matches.push({ keyword: 'recruitment_notification', type: 'pattern', score: 50 });
        }
        
        if (content.text.includes('commercial_pattern') && categoryId === 'commercial') {
            totalScore += 40;
            matches.push({ keyword: 'commercial_partnership', type: 'pattern', score: 40 });
        }
        
        // Test des exclusions
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    let penalty = 50;
                    
                    if (personalIndicators.includes(exclusion) && 
                        ['internal', 'hr', 'meetings', 'commercial'].includes(categoryId)) {
                        penalty = 100;
                    }
                    
                    totalScore -= penalty;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -penalty });
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
                    
                    // Bonus si dans le sujet
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
                    
                    // Bonus si dans le sujet
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 20;
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 20 });
                    }
                }
            }
            
            // Bonus pour matches multiples
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
            
            // Bonus pour matches multiples
            if (weakMatches >= 3) {
                totalScore += 20;
                matches.push({ keyword: 'multiple_weak_matches', type: 'bonus', score: 20 });
            }
        }
        
        // Bonus de domaine
        const domainBonus = this.applyEnhancedDomainBonus(content, categoryId);
        if (domainBonus > 0) {
            totalScore += domainBonus;
            matches.push({ keyword: `domain_${content.domain}`, type: 'domain', score: domainBonus });
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    // ================================================
    // RECHERCHE DE TEXTE AMÉLIORÉE
    // ================================================
    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        // Normalisation complète
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
        
        // Recherche avec word boundaries
        const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
        
        return wordBoundaryRegex.test(normalizedText) || normalizedText.includes(normalizedKeyword);
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ================================================
    // BONUS DE DOMAINE AMÉLIORÉ
    // ================================================
    applyEnhancedDomainBonus(content, categoryId) {
        const domainBonuses = {
            security: ['microsoft', 'google', 'apple', 'security', 'auth', '2fa', 'verification'],
            finance: ['gouv.fr', 'impots', 'bank', 'paypal', 'stripe', 'invoice', 'billing'],
            marketing_news: ['newsletter', 'mailchimp', 'campaign', 'marketing', 'sendinblue', 'mailjet'],
            notifications: ['noreply', 'notification', 'donotreply', 'automated', 'system', 'greenhouse', 'workday'],
            project: ['github', 'gitlab', 'jira', 'asana', 'trello', 'confluence', 'bitbucket'],
            hr: ['workday', 'bamboohr', 'adp', 'payroll', 'hr', 'recruiting', 'greenhouse', 'lever'],
            meetings: ['zoom', 'teams', 'meet', 'webex', 'gotomeeting', 'calendar', 'calendly'],
            support: ['zendesk', 'freshdesk', 'helpdesk', 'support', 'ticket', 'servicedesk'],
            commercial: ['shop', 'store', 'ecommerce', 'shopify', 'woocommerce', 'magento']
        };
        
        if (domainBonuses[categoryId] && content.domain) {
            for (const domainKeyword of domainBonuses[categoryId]) {
                if (content.domain.includes(domainKeyword)) {
                    return 40; // Bonus uniforme
                }
            }
        }
        
        return 0;
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectByPriorityWithThreshold(results) {
        // Seuils pour la sélection
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // Priorité aux matches absolus
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Puis par priorité de catégorie
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                // Enfin par score
                return b.score - a.score;
            });
        
        if (this.debugMode && sortedResults.length > 0) {
            console.log('[CategoryManager] 📊 Top résultats:', 
                sortedResults.slice(0, 3).map(r => ({
                    cat: r.category,
                    score: r.score,
                    conf: Math.round(r.confidence * 100) + '%'
                }))
            );
        }
        
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
        
        // Fallback avec seuil plus bas
        const fallbackResults = Object.values(results)
            .filter(r => r.score >= 20 && r.confidence >= 0.4)
            .sort((a, b) => b.score - a.score);
        
        if (fallbackResults.length > 0) {
            const fallback = fallbackResults[0];
            if (this.debugMode) {
                console.log(`[CategoryManager] 📌 Utilisation fallback: ${fallback.category} (${fallback.score}pts)`);
            }
            return {
                category: fallback.category,
                score: fallback.score,
                confidence: fallback.confidence,
                matchedPatterns: fallback.matches,
                hasAbsolute: fallback.hasAbsolute
            };
        }
        
        // Aucune catégorie trouvée
        return {
            category: 'other',
            score: 0,
            confidence: 0,
            matchedPatterns: [],
            hasAbsolute: false,
            reason: 'below_threshold'
        };
    }

    // ================================================
    // DÉTECTION D'EMAILS PERSONNELS
    // ================================================
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
        
        // Compter les indicateurs
        let personalScore = 0;
        personalIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                personalScore += 10;
            }
        });
        
        // Réduire le score si indicateurs professionnels
        let professionalScore = 0;
        professionalCounterIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                professionalScore += 10;
            }
        });
        
        return personalScore > 20 && professionalScore < 10;
    }

    // ================================================
    // VÉRIFICATION SI DESTINATAIRE PRINCIPAL
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

    // ================================================
    // VÉRIFICATION SI EN CC
    // ================================================
    isInCC(email) {
        // Si pas de CC, ce n'est pas un email en CC
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        
        if (!currentUserEmail) {
            console.log('[CategoryManager] ⚠️ Email utilisateur non trouvé');
            return false;
        }
        
        // Vérifier si l'utilisateur est dans TO
        const isInToList = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        }) || false;
        
        // Vérifier si l'utilisateur est dans CC
        const isInCCList = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        // On est en CC seulement si on est dans CC ET PAS dans TO
        const result = isInCCList && !isInToList;
        
        if (result && this.debugMode) {
            console.log('[CategoryManager] 📋 Email en CC détecté');
        }
        
        return result;
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100,
                isCustom: false
            },
            
            // CATÉGORIE CC - PRIORITÉ ÉLEVÉE
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE
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

    // ================================================
    // INITIALISATION DES MOTS-CLÉS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS
            marketing_news: {
                absolute: [
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'paramétrez vos choix', 'parametrez vos choix',
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'limited offer', 'offre limitée', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente privée',
                    'ventes en ligne', 'vente en ligne', 'shopping',
                    'disable these notifications', 'turn off notifications',
                    'manage notifications', 'notification settings',
                    'email settings', 'communication preferences',
                    'update your preferences', 'modify your subscription',
                    'cliquez-ici pour vous désinscrire', 'click here to unsubscribe',
                    'manage your subscription', 'gérer votre abonnement'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount', 'réduction',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'exclusive', 'special', 'limited', 'new', 'nouveau',
                    'boutique', 'shopping', 'acheter', 'commander',
                    'offre', 'promotion', 'remise', 'solde',
                    'notifications', 'alerts', 'updates', 'subscribe',
                    'blog', 'article', 'news', 'actualité', 'nouveauté'
                ],
                weak: ['update', 'discover', 'new', 'nouveauté', 'découvrir'],
                exclusions: []
            },

            // NOTIFICATIONS
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique',
                    'system notification', 'ceci est un message automatique',
                    'no-reply@', 'donotreply@', 'notification@',
                    'your application', 'votre candidature',
                    'application status', 'statut de candidature',
                    'we regret to inform', 'nous avons le regret',
                    'thank you for your application', 'merci pour votre candidature',
                    'recruitment team', 'équipe de recrutement',
                    'hiring team', 'talent acquisition'
                ],
                strong: [
                    'automated', 'automatic', 'system',
                    'notification', 'automatique', 'alert',
                    'status', 'update', 'application',
                    'candidature', 'recruitment', 'hiring'
                ],
                weak: ['notification', 'alert', 'info', 'message'],
                exclusions: ['newsletter', 'marketing', 'urgent', 'action required']
            },

            // COMMERCIAL
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale',
                    'opportunity', 'opportunité', 'lead',
                    'collaboration', 'partnership', 'partenariat',
                    'édition limitée', 'limited edition',
                    'offre exclusive', 'exclusive offer'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal',
                    'vente', 'sales', 'négociation', 'collaboration',
                    'collab', 'partner', 'partenaire', 'boutique',
                    'shop', 'store', 'achat', 'commande'
                ],
                weak: ['offre', 'négociation', 'discussion', 'projet'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'unsubscribe', 'ventes en ligne']
            },

            // SECURITY
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'password reset', 'réinitialisation mot de passe',
                    'unusual activity', 'activité inhabituelle'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe',
                    'connexion', 'login', 'signin', 'access'
                ],
                weak: ['compte', 'account', 'accès', 'alert'],
                exclusions: ['newsletter', 'unsubscribe', 'promotion']
            },

            // TASKS
            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable',
                    'urgence', 'urgent', 'très urgent',
                    'demande update', 'update request', 'mise à jour demandée',
                    'demande de mise à jour', 'update needed', 'mise a jour requise',
                    'correction requise', 'à corriger', 'please review',
                    'merci de valider', 'validation requise', 'approval needed'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'update', 'mise à jour', 'demande', 'request',
                    'task', 'tâche', 'todo', 'à faire',
                    'correction', 'corriger', 'modifier', 'révision'
                ],
                weak: ['demande', 'besoin', 'attente', 'request', 'need', 'waiting'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'unsubscribe', 'papa', 'maman', 'famille']
            },

            // MEETINGS
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'rendez-vous', 'appointment', 'rdv',
                    'join the meeting', 'rejoindre la réunion'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment', 'agenda',
                    'conférence', 'conference', 'call', 'visio'
                ],
                weak: ['présentation', 'agenda', 'disponible', 'available'],
                exclusions: ['newsletter', 'promotion', 'marketing', 'papa', 'maman', 'famille']
            },

            // FINANCE
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement', 'refund',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration',
                    'n°commande', 'numéro commande', 'order number',
                    'numéro de commande', 'commande n°', 'commande numéro',
                    'livraison commande', 'commande expédiée',
                    'confirmation commande', 'order confirmation'
                ],
                strong: [
                    'montant', 'amount', 'total', 'facture',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'commande', 'order', 'achat', 'vente',
                    'livraison', 'delivery', 'expédition', 'shipping',
                    'prix', 'price', 'coût', 'cost'
                ],
                weak: ['euro', 'dollar', 'prix', 'payment', 'transaction'],
                exclusions: ['newsletter', 'marketing', 'spam', 'promotion', 'soldes', 'ventes en ligne']
            },

            // PROJECT
            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'retrospective', 'roadmap',
                    'document corrigé', 'version corrigée', 'corrections apportées',
                    'github', 'gitlab', 'jira issue', 'pull request'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'jira',
                    'development', 'développement',
                    'document', 'présentation', 'correction',
                    'version', 'release', 'deployment'
                ],
                weak: ['development', 'phase', 'étape', 'planning', 'présentation'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'papa', 'maman', 'famille', 'bises']
            },

            // REMINDERS
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'as discussed',
                    'suite à notre échange', 'following our discussion'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu', 'discussed', 'pending',
                    'en attente', 'waiting', 'suivi'
                ],
                weak: ['previous', 'discussed', 'encore', 'still'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            // SUPPORT
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'demande de support',
                    'helpdesk', 'service desk'
                ],
                strong: [
                    'support', 'assistance', 'help desk',
                    'technical support', 'ticket', 'incident',
                    'problème', 'problem', 'issue', 'bug',
                    'résolution', 'solution', 'fixed'
                ],
                weak: ['help', 'aide', 'issue', 'question'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            // HR
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
                weak: ['employee', 'staff', 'personnel', 'équipe'],
                exclusions: [
                    'newsletter', 'marketing', 'famille', 'family', 
                    'personnel', 'personal', 'papa', 'maman',
                    'présentation', 'document', 'correction',
                    'bises', 'bisous', 'familial'
                ]
            },

            // INTERNAL
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'memo interne',
                    'communication interne', 'note de service',
                    'à tous', 'to all employees',
                    'team update', 'mise à jour équipe'
                ],
                strong: [
                    'internal', 'interne', 'company wide',
                    'personnel', 'staff', 'équipe',
                    'annonce', 'announcement', 'communication'
                ],
                weak: ['annonce', 'announcement', 'information', 'update'],
                exclusions: ['newsletter', 'marketing', 'external', 'client', 'papa', 'maman', 'famille', 'bises']
            },

            // CC
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy',
                    'pour info', 'pour information'
                ],
                strong: ['information', 'copie', 'copy', 'cc'],
                weak: ['fyi', 'info'],
                exclusions: [
                    'commande', 'order', 'facture', 'invoice',
                    'urgent', 'action required', 'payment'
                ]
            }
        };

        console.log('[CategoryManager] Mots-clés initialisés pour', Object.keys(this.weightedKeywords).length, 'catégories');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
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

    extractContextClues(email) {
        let clues = '';
        
        // Patterns de réponse/transfert
        const subject = email.subject || '';
        if (subject.match(/^(RE:|FW:|Fwd:|Tr:)/i)) {
            clues += ' conversation reply response ';
        }
        
        // Mentions de documents
        const body = email.body?.content || email.bodyPreview || '';
        if (body.match(/ci-joint|attached|attachment|pièce jointe|document/i)) {
            clues += ' document attachment piece jointe ';
        }
        
        // Formules de politesse familiales
        if (body.match(/\b(papa|maman|bises|bisous)\b/i)) {
            clues += ' famille family personal personnel ';
        }
        
        // Mentions commerciales
        if (body.match(/\b(commande|order|facture|invoice|livraison|delivery|n°|numéro)\b/i)) {
            clues += ' commerce order commande achat vente ';
        }
        
        return clues;
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

    getCurrentUserEmail() {
        try {
            // Essayer plusieurs sources
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName || parsed.mail;
            }
            
            // Essayer depuis le token MSAL
            const msalAccounts = JSON.parse(localStorage.getItem('msal.account.keys') || '[]');
            if (msalAccounts.length > 0) {
                const firstAccount = localStorage.getItem(msalAccounts[0]);
                if (firstAccount) {
                    const account = JSON.parse(firstAccount);
                    return account.username || account.preferred_username;
                }
            }
            
            // Essayer depuis AuthService
            if (window.authService && typeof window.authService.getCurrentUser === 'function') {
                const user = window.authService.getCurrentUser();
                if (user) {
                    return user.email || user.userPrincipalName || user.username;
                }
            }
            
            // Essayer depuis GoogleAuthService
            if (window.googleAuthService && typeof window.googleAuthService.getAccount === 'function') {
                const account = window.googleAuthService.getAccount();
                if (account) {
                    return account.email || account.mail;
                }
            }
            
        } catch (e) {
            console.warn('[CategoryManager] Impossible de récupérer l\'email utilisateur:', e);
        }
        return null;
    }

    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        // Vérifier les domaines exclus
        if (exclusions.domains && exclusions.domains.length > 0) {
            for (const domain of exclusions.domains) {
                if (content.domain.includes(domain.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Vérifier les emails exclus
        if (exclusions.emails && exclusions.emails.length > 0) {
            const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
            if (emailAddress && exclusions.emails.includes(emailAddress)) {
                return true;
            }
        }
        
        return false;
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
        
        // Détecter les changements et notifier
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
            activeCategories: null, // null = toutes actives
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

    // ================================================
    // MÉTHODES DE NOTIFICATION
    // ================================================
    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification spécifique: ${type}`);
        
        // EmailScanner
        if (window.emailScanner) {
            switch (type) {
                case 'taskPreselectedCategories':
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    break;
                    
                case 'activeCategories':
                    if (typeof window.emailScanner.updateSettings === 'function') {
                        window.emailScanner.updateSettings({ activeCategories: value });
                    }
                    break;
            }
        }
        
        // Autres modules...
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
    // MÉTHODES PUBLIQUES
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

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            console.log('[CategoryManager] 📁 Chargement catégories personnalisées...');
            
            Object.entries(this.customCategories).forEach(([id, category]) => {
                // Ajouter la catégorie
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30
                };
                
                // Charger les mots-clés
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
            
            console.log('[CategoryManager] 📊 Résumé:');
            console.log('  - Catégories personnalisées:', Object.keys(this.customCategories).length);
            console.log('  - Total catégories:', Object.keys(this.categories).length);
            
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

    // ================================================
    // MÉTHODES DE MISE À JOUR
    // ================================================
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

    // ================================================
    // AUTRES MÉTHODES
    // ================================================
    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        window.addEventListener('settingsChanged', (event) => {
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
        });
        
        this.eventListenersSetup = true;
        console.log('[CategoryManager] Event listeners configurés');
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

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
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
    console.group('🧪 TEST CategoryManager v21.0');
    
    const tests = [
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", expected: "marketing_news" },
        { subject: "Action requise: Confirmer votre commande", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte", expected: "security" },
        { subject: "Facture #12345 - Échéance dans 3 jours", expected: "finance" },
        { subject: "Réunion équipe prévue pour demain", expected: "meetings" },
        { subject: "An update about your application to Qantev", expected: "notifications" },
        { subject: "Top départ Collab Rilès x Fitness Park 🔥", expected: "commercial" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
    });
    
    console.log('Stats:', window.categoryManager.getCategoryStats());
    console.log('Debug Info:', window.categoryManager.getDebugInfo());
    
    console.groupEnd();
    return { success: true, testsRun: tests.length };
};

console.log('✅ CategoryManager v21.0 loaded - Analyse complète avec fullTextContent');
