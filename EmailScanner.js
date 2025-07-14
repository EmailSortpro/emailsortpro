// EmailScanner.js - Version 14.0 - Analyse améliorée du contenu complet
// Détection basée sur le contenu réel, pas sur les domaines

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        // Priorités des catégories (géré par EmailScanner)
        this.categoryPriorities = {
            'marketing_news': 100,
            'cc': 90,
            'security': 80,
            'finance': 70,
            'tasks': 60,
            'hr': 55,
            'commercial': 50,
            'meetings': 50,
            'support': 50,
            'reminders': 50,
            'project': 50,
            'internal': 50,
            'notifications': 40
        };
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            categoryDistribution: {},
            preselectedCount: 0
        };
        
        console.log('[EmailScanner] ✅ Version 14.0 - Utilise uniquement CategoryManager');
        this.initializeWithSync();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initializeWithSync() {
        console.log('[EmailScanner] 🔧 Initialisation...');
        
        await this.loadSettingsFromCategoryManager();
        this.registerAsChangeListener();
        this.setupEventListeners();
        
        console.log('[EmailScanner] ✅ Initialisation terminée');
    }

    // ================================================
    // ANALYSE D'EMAIL AMÉLIORÉE
    // ================================================
    analyzeEmail(email) {
        if (!email) {
            return { category: 'other', score: 0, confidence: 0 };
        }

        // 1. Vérifier si c'est du spam
        if (this.isSpamEmail(email) && this.settings.preferences?.excludeSpam !== false) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }

        // 2. Extraire le contenu COMPLET
        const content = this.extractCompleteContent(email);
        
        // 3. Vérifier si c'est un email noreply
        const isNoreply = this.isNoreplyEmail(email);
        
        // 4. Détecter si on est VRAIMENT en CC
        const isCC = this.isInCC(email) && !this.isDirectlyAddressed(email, content);
        
        // 5. Analyser toutes les catégories avec les mots-clés de CategoryManager
        const categoryScores = this.analyzeAllCategories(content);
        
        // 6. Si c'est un noreply, booster notifications sauf si marketing fort
        if (isNoreply) {
            if (categoryScores.notifications) {
                categoryScores.notifications.score += 50;
            }
            // Si marketing_news a un score faible et noreply, c'est probablement notifications
            if ((!categoryScores.marketing_news || categoryScores.marketing_news.score < 100) && 
                (!categoryScores.notifications || categoryScores.notifications.score < 50)) {
                categoryScores.notifications = {
                    category: 'notifications',
                    score: 100,
                    confidence: 0.85,
                    matches: [{ keyword: 'noreply_email', type: 'detected', score: 100 }],
                    hasAbsolute: true,
                    priority: this.categoryPriorities.notifications
                };
            }
        }
        
        // 7. Sélectionner la meilleure catégorie
        const bestCategory = this.selectBestCategory(categoryScores);
        
        // 8. Gestion spéciale CC - seulement si vraiment en CC
        if (isCC && this.settings.preferences?.detectCC !== false) {
            if (!bestCategory || bestCategory.score < 100) {
                return {
                    category: 'cc',
                    score: 100,
                    confidence: 0.95,
                    matchedPatterns: [{ keyword: 'in_cc', type: 'detected', score: 100 }],
                    hasAbsolute: true,
                    isCC: true
                };
            }
        }
        
        // 9. Retourner le résultat
        if (bestCategory && bestCategory.score >= 30) {
            return {
                category: bestCategory.category,
                score: bestCategory.score,
                confidence: bestCategory.confidence,
                matchedPatterns: bestCategory.matches,
                hasAbsolute: bestCategory.hasAbsolute,
                isCC: isCC,
                isNoreply: isNoreply
            };
        }
        
        return { category: 'other', score: 0, confidence: 0 };
    }

    // ================================================
    // ANALYSE AVEC PATTERNS SPÉCIAUX
    // ================================================
    analyzeWithSpecialPatterns(content, email) {
        const text = content.fullText.toLowerCase();
        
        // Détecter les emails marketing
        let marketingScore = 0;
        let marketingMatches = [];
        
        // Vérifier les patterns de désabonnement (très fort indicateur)
        for (const pattern of this.specialPatterns.marketing.unsubscribe) {
            if (text.includes(pattern)) {
                marketingScore += 150;
                marketingMatches.push({ keyword: pattern, type: 'unsubscribe', score: 150 });
            }
        }
        
        // Vérifier les patterns promotionnels
        for (const pattern of this.specialPatterns.marketing.promotional) {
            if (text.includes(pattern)) {
                marketingScore += 50;
                marketingMatches.push({ keyword: pattern, type: 'promotional', score: 50 });
            }
        }
        
        // Vérifier les patterns de streaming
        for (const pattern of this.specialPatterns.marketing.streaming) {
            if (text.includes(pattern)) {
                marketingScore += 80;
                marketingMatches.push({ keyword: pattern, type: 'streaming', score: 80 });
            }
        }
        
        // Patterns spécifiques pour cartes cadeaux/avoirs (finance)
        const financePatterns = {
            giftCard: ['carte cadeau', 'gift card', 'carte avoir', 'avoir', 'crédit', 'remboursement'],
            amount: ['€', '

    // ================================================
    // EXTRACTION COMPLÈTE DU CONTENU
    // ================================================
    extractCompleteContent(email) {
        let fullText = '';
        let subject = '';
        let bodyText = '';
        
        // Sujet avec poids très élevé
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            fullText += (email.subject + ' ').repeat(10); // Répéter 10 fois
        }
        
        // Corps de l'email - TOUT le contenu
        if (email.bodyPreview) {
            bodyText += email.bodyPreview + ' ';
            fullText += email.bodyPreview + ' ';
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtml(email.body.content);
            bodyText += cleanedBody + ' ';
            fullText += cleanedBody + ' ';
        }
        
        if (email.bodyText) {
            bodyText += email.bodyText + ' ';
            fullText += email.bodyText + ' ';
        }
        
        // NE PAS inclure l'expéditeur dans l'analyse principale
        // pour éviter les faux positifs basés sur le domaine
        
        return {
            fullText: fullText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            body: bodyText.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: fullText.length
        };
    }

    // ================================================
    // CALCUL DU SCORE AMÉLIORÉ
    // ================================================
    calculateCategoryScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        
        // Utiliser le texte complet pour l'analyse
        const text = content.fullText;
        const bodyText = content.body;
        const subjectText = content.subject;
        
        // Test des mots-clés absolus
        if (keywords.absolute && keywords.absolute.length > 0) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Super bonus si dans le sujet
                    if (subjectText && this.findInText(subjectText, keyword)) {
                        totalScore += 100;
                        matches.push({ keyword: keyword + ' (subject)', type: 'subject_bonus', score: 100 });
                    }
                }
            }
        }
        
        // Test des mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 50;
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: 50 });
                    
                    // Bonus si dans le sujet
                    if (subjectText && this.findInText(subjectText, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + ' (subject)', type: 'subject_bonus', score: 50 });
                    }
                }
            }
            
            // Bonus si plusieurs mots forts
            if (strongMatches >= 3) {
                totalScore += 50;
                matches.push({ keyword: 'multiple_strong', type: 'bonus', score: 50 });
            }
        }
        
        // Test des mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            let weakMatches = 0;
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 20;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 20 });
                }
            }
            
            // Bonus si beaucoup de mots faibles
            if (weakMatches >= 4) {
                totalScore += 40;
                matches.push({ keyword: 'multiple_weak', type: 'bonus', score: 40 });
            }
        }
        
        // Pénalités contextuelles basées sur d'autres catégories
        totalScore = this.applyContextualPenalties(categoryId, text, totalScore, matches);
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    // ================================================
    // PÉNALITÉS CONTEXTUELLES
    // ================================================
    applyContextualPenalties(categoryId, text, currentScore, matches) {
        // Si on trouve des mots de désabonnement forts, pénaliser toutes catégories sauf marketing
        if (categoryId !== 'marketing_news') {
            const marketingKeywords = window.categoryManager?.getCategoryKeywords('marketing_news');
            if (marketingKeywords?.absolute) {
                const unsubscribePatterns = marketingKeywords.absolute.filter(k => 
                    k.includes('désinscrire') || k.includes('unsubscribe') || 
                    k.includes('stop') || k.includes('ne plus recevoir')
                );
                
                let unsubCount = 0;
                for (const pattern of unsubscribePatterns) {
                    if (this.findInText(text, pattern)) {
                        unsubCount++;
                    }
                }
                
                if (unsubCount >= 2) {
                    currentScore = Math.max(0, currentScore - 150);
                    matches.push({ keyword: 'marketing_penalty', type: 'penalty', score: -150 });
                }
            }
        }
        
        // Si on trouve des termes RH contextuels, pénaliser les autres catégories
        if (categoryId !== 'hr') {
            const hrKeywords = window.categoryManager?.getCategoryKeywords('hr');
            if (hrKeywords?.absolute) {
                const hrContextPatterns = hrKeywords.absolute.filter(k => 
                    k.includes('poste de') || k.includes('offre d\'emploi') || 
                    k.includes('candidature') || k.includes('recrutement')
                );
                
                let hrCount = 0;
                for (const pattern of hrContextPatterns) {
                    if (this.findInText(text, pattern)) {
                        hrCount++;
                    }
                }
                
                if (hrCount >= 2) {
                    currentScore = Math.max(0, currentScore - 100);
                    matches.push({ keyword: 'hr_penalty', type: 'penalty', score: -100 });
                }
            }
        }
        
        return currentScore;
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategory(categoryScores) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.4;
        
        const candidates = Object.values(categoryScores)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // D'abord par présence de mot-clé absolu
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Si les deux ont des scores très proches, utiliser la priorité
                const scoreDiff = Math.abs(a.score - b.score);
                if (scoreDiff < 50) {
                    const priorityDiff = (this.categoryPriorities[b.category] || 30) - 
                                       (this.categoryPriorities[a.category] || 30);
                    if (priorityDiff !== 0) return priorityDiff > 0 ? 1 : -1;
                }
                
                // Sinon par score
                return b.score - a.score;
            });
        
        const best = candidates[0];
        
        if (best) {
            console.log(`[EmailScanner] 🎯 Meilleure catégorie: ${best.category} (score: ${best.score}, priorité: ${this.categoryPriorities[best.category] || 30})`);
        }
        
        return best || null;
    }

    // ================================================
    // MÉTHODES UTILITAIRES AMÉLIORÉES
    // ================================================
    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizeText = (str) => {
            return str.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[''`]/g, "'")
                .replace(/[-_]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };
        
        const normalizedText = normalizeText(text);
        const normalizedKeyword = normalizeText(keyword);
        
        // Recherche exacte
        if (normalizedText.includes(normalizedKeyword)) {
            return true;
        }
        
        // Recherche avec variations (pour les mots composés)
        const keywordVariations = [
            normalizedKeyword,
            normalizedKeyword.replace(/ /g, ''),
            normalizedKeyword.replace(/ /g, '-')
        ];
        
        return keywordVariations.some(variation => normalizedText.includes(variation));
    }

    cleanHtml(html) {
        if (!html) return '';
        
        // Extraire le texte des liens d'abord
        html = html.replace(/<a[^>]*>(.*?)<\/a>/gi, ' $1 ');
        
        // Remplacer les retours à la ligne HTML par des espaces
        html = html.replace(/<br\s*\/?>/gi, ' ');
        html = html.replace(/<\/p>/gi, ' ');
        html = html.replace(/<\/div>/gi, ' ');
        html = html.replace(/<\/li>/gi, ' ');
        
        // Supprimer toutes les autres balises
        html = html.replace(/<[^>]+>/g, ' ');
        
        // Décoder les entités HTML
        html = html.replace(/&nbsp;/g, ' ');
        html = html.replace(/&amp;/g, '&');
        html = html.replace(/&lt;/g, '<');
        html = html.replace(/&gt;/g, '>');
        html = html.replace(/&quot;/g, '"');
        html = html.replace(/&#39;/g, "'");
        html = html.replace(/&[^;]+;/g, ' ');
        
        // Nettoyer les espaces multiples
        return html.replace(/\s+/g, ' ').trim();
    }

    calculateConfidence(analysis) {
        if (analysis.hasAbsolute) return 0.95;
        if (analysis.total >= 250) return 0.95;
        if (analysis.total >= 200) return 0.90;
        if (analysis.total >= 150) return 0.85;
        if (analysis.total >= 100) return 0.80;
        if (analysis.total >= 80) return 0.75;
        if (analysis.total >= 60) return 0.70;
        if (analysis.total >= 40) return 0.60;
        if (analysis.total >= 30) return 0.55;
        return 0.40;
    }

    // ================================================
    // ANALYSE DE TOUTES LES CATÉGORIES
    // ================================================
    analyzeAllCategories(content) {
        const categories = window.categoryManager?.getCategories() || {};
        const activeCategories = window.categoryManager?.getActiveCategories() || Object.keys(categories);
        const results = {};
        
        for (const categoryId of activeCategories) {
            const keywords = window.categoryManager?.getCategoryKeywords(categoryId);
            if (!keywords) continue;
            
            const score = this.calculateCategoryScore(content, keywords, categoryId);
            if (score.total > 0) {
                results[categoryId] = {
                    category: categoryId,
                    score: score.total,
                    hasAbsolute: score.hasAbsolute,
                    matches: score.matches,
                    confidence: this.calculateConfidence(score),
                    priority: this.categoryPriorities[categoryId] || 30
                };
            }
        }
        
        return results;
    }

    // ================================================
    // AUTRES MÉTHODES (inchangées depuis v13)
    // ================================================
    
    async loadSettingsFromCategoryManager() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            try {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                return true;
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur chargement CategoryManager:', error);
                return this.loadDefaultSettings();
            }
        } else {
            console.warn('[EmailScanner] ⚠️ CategoryManager non disponible');
            return this.loadDefaultSettings();
        }
    }

    loadDefaultSettings() {
        this.settings = {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
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

    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v14.0 ===');
        
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            maxEmails: options.maxEmails || -1,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: options.taskPreselectedCategories || [...this.taskPreselectedCategories],
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            provider: options.provider || 'microsoft'
        };

        if (this.isScanning) {
            console.warn('[EmailScanner] ⚠️ Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;
            this.scanMetrics.startTime = Date.now();

            // Étape 1: Récupérer les emails
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: 'Récupération des emails...',
                    progress: { current: 0, total: 100 }
                });
            }

            const emails = await this.fetchEmailsFromMailService(mergedOptions);
            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                return this.buildEmptyResults(mergedOptions);
            }

            // Étape 2: Catégoriser les emails
            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: 'Catégorisation des emails...',
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmails();
            }

            // Étape 3: Analyser pour les tâches (optionnel)
            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: 'Analyse IA pour les tâches...',
                        progress: { current: 0, total: 10 }
                    });
                }

                await this.analyzeForTasks();
            }

            // Construire les résultats
            const results = this.getDetailedResults(mergedOptions);

            console.log('[EmailScanner] 🎉 === SCAN TERMINÉ ===');
            console.log('[EmailScanner] 📊 Résultats:', {
                total: results.total,
                categorized: results.categorized,
                preselectedForTasks: results.stats.preselectedForTasks
            });

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            // Notifier les autres modules
            this.dispatchEvent('scanCompleted', {
                results,
                emails: this.emails,
                breakdown: results.breakdown,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                preselectedCount: results.stats.preselectedForTasks
            });

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur de scan:', error);
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'error',
                    message: `Erreur: ${error.message}`,
                    error
                });
            }
            
            throw error;
        } finally {
            this.isScanning = false;
        }
    }

    async fetchEmailsFromMailService(options) {
        console.log('[EmailScanner] 📬 Récupération des emails...');
        
        try {
            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            if (!window.mailService.isInitialized()) {
                await window.mailService.initialize();
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - options.days);

            const dateFilter = this.buildDateFilter(startDate, endDate, options.provider);

            const emails = await window.mailService.getMessages(options.folder, {
                top: options.maxEmails > 0 ? options.maxEmails : undefined,
                filter: dateFilter
            });

            console.log(`[EmailScanner] ✅ ${emails.length} emails récupérés`);
            return emails;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur récupération emails:', error);
            throw error;
        }
    }

    buildDateFilter(startDate, endDate, provider) {
        if (provider === 'microsoft' || provider === 'outlook') {
            return `receivedDateTime ge ${startDate.toISOString()} and receivedDateTime le ${endDate.toISOString()}`;
        } else {
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            return `after:${startStr} before:${endStr}`;
        }
    }

    async categorizeEmails() {
        const total = this.emails.length;
        let processed = 0;
        
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION v14.0 ===');
        console.log('[EmailScanner] 📊 Total emails:', total);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

        const batchSize = 100;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    const analysis = this.analyzeEmail(email);
                    
                    email.category = analysis.category;
                    email.categoryScore = analysis.score;
                    email.categoryConfidence = analysis.confidence;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isPersonal = analysis.isPersonal || false;
                    
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(analysis.category);
                    
                    if (!this.categorizedEmails[analysis.category]) {
                        this.categorizedEmails[analysis.category] = [];
                    }
                    this.categorizedEmails[analysis.category].push(email);

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation:', error);
                    
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    
                    if (!this.categorizedEmails.other) {
                        this.categorizedEmails.other = [];
                    }
                    this.categorizedEmails.other.push(email);
                }

                processed++;
            }

            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
    }

    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] ⚠️ AITaskAnalyzer non disponible');
            return;
        }

        const emailsToAnalyze = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);

        console.log(`[EmailScanner] 🤖 Analyse IA de ${emailsToAnalyze.length} emails`);

        for (let i = 0; i < emailsToAnalyze.length; i++) {
            const email = emailsToAnalyze[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA: ${i + 1}/${emailsToAnalyze.length}`,
                        progress: { current: i + 1, total: emailsToAnalyze.length }
                    });
                }
                
                if (i < emailsToAnalyze.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur analyse IA:', error);
                email.aiAnalysisError = error.message;
            }
        }
    }

    buildEmptyResults(options) {
        return {
            success: true,
            total: 0,
            categorized: 0,
            breakdown: {},
            stats: { 
                processed: 0, 
                errors: 0,
                preselectedForTasks: 0,
                highConfidence: 0,
                taskSuggestions: 0
            },
            emails: [],
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            scanMetrics: this.scanMetrics,
            provider: options.provider
        };
    }

    getDetailedResults(options = {}) {
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

        const scanDuration = this.scanMetrics.startTime ? 
            Math.round((Date.now() - this.scanMetrics.startTime) / 1000) : 0;

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: {
                processed: this.emails.length,
                errors: this.emails.filter(e => e.categoryError).length,
                highConfidence: totalWithHighConfidence,
                taskSuggestions: totalWithTasks,
                preselectedForTasks: totalPreselected,
                scanDuration: scanDuration
            },
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.scanMetrics,
            provider: options.provider
        };
    }

    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] ⚠️ Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScanner] 🔄 === DÉBUT RE-CATÉGORISATION ===');
        
        await this.loadSettingsFromCategoryManager();
        
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Re-catégorisation terminée');
        
        this.dispatchEvent('emailsRecategorized', {
            emails: this.emails,
            breakdown: this.getDetailedResults().breakdown,
            taskPreselectedCategories: this.taskPreselectedCategories,
            preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
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

    registerAsChangeListener() {
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            this.changeListener = window.categoryManager.addChangeListener((event, data) => {
                console.log(`[EmailScanner] 📨 Changement CategoryManager: ${event}`, data);
                this.handleCategoryManagerChange(event, data);
            });
            
            console.log('[EmailScanner] 👂 Listener CategoryManager enregistré');
        }
    }

    handleCategoryManagerChange(event, data) {
        const needsRecategorization = [
            'keywordsUpdated',
            'categoryCreated',
            'categoryUpdated',
            'categoryDeleted',
            'settingsChanged'
        ].includes(event);
        
        if (event === 'settingsChanged') {
            this.settings = data;
            this.taskPreselectedCategories = data.taskPreselectedCategories || [];
        }
        
        if (needsRecategorization && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Re-catégorisation automatique déclenchée');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
    }

    setupEventListeners() {
        window.addEventListener('keywordsUpdated', (event) => {
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 200);
            }
        });
        
        console.log('[EmailScanner] ✅ Event listeners configurés');
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
            console.error(`[EmailScanner] ❌ Erreur dispatch ${eventName}:`, error);
        }
    }

    reset() {
        console.log('[EmailScanner] 🔄 Réinitialisation...');
        
        this.emails = [];
        this.categorizedEmails = {};
        
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            categoryDistribution: {},
            preselectedCount: 0
        };
        
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

    isInCC(email) {
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) return false;
        
        const isInTo = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        }) || false;
        
        const isInCc = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        return isInCc && !isInTo;
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
        } catch (e) {
            console.warn('[EmailScanner] Impossible de récupérer l\'email utilisateur');
        }
        return null;
    }

    // Méthodes helper pour la détection
    isNoreplyEmail(email) {
        const fromAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
        const fromName = email.from?.emailAddress?.name?.toLowerCase() || '';
        
        const noreplyPatterns = [
            'noreply', 'no-reply', 'donotreply', 'do-not-reply',
            'notification@', 'notifications@', 'automated@', 'system@'
        ];
        
        return noreplyPatterns.some(pattern => 
            fromAddress.includes(pattern) || fromName.includes(pattern)
        );
    }
    
    isDirectlyAddressed(email, content) {
        // Vérifier si l'email nous est directement adressé
        const userName = this.getCurrentUserName();
        const userEmail = this.getCurrentUserEmail();
        
        // Vérifier le nom dans le contenu
        if (userName && content.fullText.toLowerCase().includes(userName.toLowerCase())) {
            return true;
        }
        
        // Vérifier si on est le seul destinataire
        if (email.toRecipients && email.toRecipients.length === 1) {
            const recipient = email.toRecipients[0].emailAddress?.address?.toLowerCase();
            if (recipient === userEmail?.toLowerCase()) {
                return true;
            }
        }
        
        // Patterns d'adresse directe
        const directPatterns = [
            'hello', 'bonjour', 'salut', 'cher', 'chère',
            'votre', 'your', 'ton', 'ta', 'vos'
        ];
        
        const firstWords = content.fullText.toLowerCase().substring(0, 100);
        return directPatterns.some(pattern => firstWords.includes(pattern));
    }
    
    getCurrentUserName() {
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.displayName || parsed.name || null;
            }
        } catch (e) {
            console.warn('[EmailScanner] Impossible de récupérer le nom utilisateur');
        }
        return null;
    }

    getDebugInfo() {
        return {
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: Object.values(this.categorizedEmails)
                .reduce((sum, emails) => sum + emails.length, 0),
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            settings: this.settings,
            categoryPriorities: this.categoryPriorities,
            specialPatterns: Object.keys(this.specialPatterns),
            version: '14.0'
        };
    }

    destroy() {
        if (this.changeListener && typeof this.changeListener === 'function') {
            this.changeListener();
        }
        
        this.emails = [];
        this.categorizedEmails = {};
        console.log('[EmailScanner] Instance détruite');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.emailScanner) {
    window.emailScanner.destroy?.();
}

window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v14.0 loaded - Analyse améliorée du contenu complet');
console.log('🎯 Détection basée sur le contenu réel, pas sur les domaines');
console.log('📊 Patterns spéciaux pour marketing, RH et fraude');
, 'eur', 'usd', 'montant', 'solde', 'valable jusqu']
        };
        
        let financeScore = 0;
        let financeMatches = [];
        
        for (const pattern of financePatterns.giftCard) {
            if (text.includes(pattern)) {
                financeScore += 80;
                financeMatches.push({ keyword: pattern, type: 'gift_card', score: 80 });
            }
        }
        
        for (const pattern of financePatterns.amount) {
            if (text.includes(pattern)) {
                financeScore += 30;
                financeMatches.push({ keyword: pattern, type: 'amount', score: 30 });
            }
        }
        
        // Si c'est clairement une carte cadeau/avoir
        if (financeScore >= 100) {
            return {
                category: 'finance',
                score: financeScore,
                confidence: Math.min(0.95, financeScore / 150),
                matchedPatterns: financeMatches,
                hasAbsolute: financeScore >= 100
            };
        }
        
        if (marketingScore >= 100) {
            return {
                category: 'marketing_news',
                score: marketingScore,
                confidence: Math.min(0.95, marketingScore / 200),
                matchedPatterns: marketingMatches,
                hasAbsolute: marketingScore >= 150
            };
        }
        
        // Détecter les emails RH avec plus de précision
        let hrScore = 0;
        let hrMatches = [];
        
        // Vérifier les termes de recrutement AVEC contexte
        const hrContextPatterns = [
            'poste de', 'offre d\'emploi', 'job offer', 'nous recrutons',
            'candidature', 'entretien', 'cv', 'lettre de motivation',
            'ressources humaines', 'human resources', 'département rh'
        ];
        
        for (const pattern of hrContextPatterns) {
            if (text.includes(pattern)) {
                hrScore += 100;
                hrMatches.push({ keyword: pattern, type: 'hr_context', score: 100 });
            }
        }
        
        // Vérifier les titres de poste dans un contexte RH
        if (hrScore > 0) {
            for (const pattern of this.specialPatterns.hr.jobTitles) {
                if (text.includes(pattern)) {
                    hrScore += 40;
                    hrMatches.push({ keyword: pattern, type: 'job_title', score: 40 });
                }
            }
        }
        
        if (hrScore >= 100) {
            return {
                category: 'hr',
                score: hrScore,
                confidence: Math.min(0.95, hrScore / 150),
                matchedPatterns: hrMatches,
                hasAbsolute: hrScore >= 100
            };
        }
        
        // Détecter les récapitulatifs d'activité (généralement marketing)
        const activityPatterns = ['récap', 'recap', 'résumé du mois', 'monthly summary', 'votre activité', 'your activity'];
        let activityScore = 0;
        
        for (const pattern of activityPatterns) {
            if (text.includes(pattern)) {
                activityScore += 80;
                marketingMatches.push({ keyword: pattern, type: 'activity_recap', score: 80 });
            }
        }
        
        if (activityScore > 0 && marketingScore > 0) {
            return {
                category: 'marketing_news',
                score: marketingScore + activityScore,
                confidence: 0.9,
                matchedPatterns: marketingMatches,
                hasAbsolute: true
            };
        }
        
        return null;
    }

    // ================================================
    // EXTRACTION COMPLÈTE DU CONTENU
    // ================================================
    extractCompleteContent(email) {
        let fullText = '';
        let subject = '';
        let bodyText = '';
        
        // Sujet avec poids très élevé
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            fullText += (email.subject + ' ').repeat(10); // Répéter 10 fois
        }
        
        // Corps de l'email - TOUT le contenu
        if (email.bodyPreview) {
            bodyText += email.bodyPreview + ' ';
            fullText += email.bodyPreview + ' ';
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtml(email.body.content);
            bodyText += cleanedBody + ' ';
            fullText += cleanedBody + ' ';
        }
        
        if (email.bodyText) {
            bodyText += email.bodyText + ' ';
            fullText += email.bodyText + ' ';
        }
        
        // NE PAS inclure l'expéditeur dans l'analyse principale
        // pour éviter les faux positifs basés sur le domaine
        
        return {
            fullText: fullText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            body: bodyText.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: fullText.length
        };
    }

    // ================================================
    // CALCUL DU SCORE AMÉLIORÉ
    // ================================================
    calculateCategoryScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        
        // Utiliser le texte complet pour l'analyse
        const text = content.fullText;
        const bodyText = content.body;
        const subjectText = content.subject;
        
        // Test des mots-clés absolus
        if (keywords.absolute && keywords.absolute.length > 0) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Super bonus si dans le sujet
                    if (subjectText && this.findInText(subjectText, keyword)) {
                        totalScore += 100;
                        matches.push({ keyword: keyword + ' (subject)', type: 'subject_bonus', score: 100 });
                    }
                }
            }
        }
        
        // Test des mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 50;
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: 50 });
                    
                    // Bonus si dans le sujet
                    if (subjectText && this.findInText(subjectText, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + ' (subject)', type: 'subject_bonus', score: 50 });
                    }
                }
            }
            
            // Bonus si plusieurs mots forts
            if (strongMatches >= 3) {
                totalScore += 50;
                matches.push({ keyword: 'multiple_strong', type: 'bonus', score: 50 });
            }
        }
        
        // Test des mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            let weakMatches = 0;
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 20;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 20 });
                }
            }
            
            // Bonus si beaucoup de mots faibles
            if (weakMatches >= 4) {
                totalScore += 40;
                matches.push({ keyword: 'multiple_weak', type: 'bonus', score: 40 });
            }
        }
        
        // Pénalités contextuelles
        if (this.shouldPenalizeCategory(categoryId, text)) {
            totalScore = Math.max(0, totalScore - 100);
            matches.push({ keyword: 'contextual_penalty', type: 'penalty', score: -100 });
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    // ================================================
    // PÉNALITÉS CONTEXTUELLES
    // ================================================
    shouldPenalizeCategory(categoryId, text) {
        // Ne pas pénaliser marketing_news si on trouve des patterns de désabonnement
        if (categoryId !== 'marketing_news') {
            const unsubscribeCount = this.specialPatterns.marketing.unsubscribe
                .filter(pattern => text.includes(pattern)).length;
            if (unsubscribeCount >= 2) {
                return true; // Pénaliser les autres catégories
            }
        }
        
        // Ne pas pénaliser HR si on trouve des patterns de recrutement
        if (categoryId !== 'hr') {
            const hrCount = this.specialPatterns.hr.recruitment
                .filter(pattern => text.includes(pattern)).length;
            if (hrCount >= 3) {
                return true;
            }
        }
        
        return false;
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategory(categoryScores) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.4;
        
        const candidates = Object.values(categoryScores)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // D'abord par présence de mot-clé absolu
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Si les deux ont des scores très proches, utiliser la priorité
                const scoreDiff = Math.abs(a.score - b.score);
                if (scoreDiff < 50) {
                    const priorityDiff = (this.categoryPriorities[b.category] || 30) - 
                                       (this.categoryPriorities[a.category] || 30);
                    if (priorityDiff !== 0) return priorityDiff > 0 ? 1 : -1;
                }
                
                // Sinon par score
                return b.score - a.score;
            });
        
        const best = candidates[0];
        
        if (best) {
            console.log(`[EmailScanner] 🎯 Meilleure catégorie: ${best.category} (score: ${best.score}, priorité: ${this.categoryPriorities[best.category] || 30})`);
        }
        
        return best || null;
    }

    // ================================================
    // MÉTHODES UTILITAIRES AMÉLIORÉES
    // ================================================
    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizeText = (str) => {
            return str.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[''`]/g, "'")
                .replace(/[-_]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };
        
        const normalizedText = normalizeText(text);
        const normalizedKeyword = normalizeText(keyword);
        
        // Recherche exacte
        if (normalizedText.includes(normalizedKeyword)) {
            return true;
        }
        
        // Recherche avec variations (pour les mots composés)
        const keywordVariations = [
            normalizedKeyword,
            normalizedKeyword.replace(/ /g, ''),
            normalizedKeyword.replace(/ /g, '-')
        ];
        
        return keywordVariations.some(variation => normalizedText.includes(variation));
    }

    cleanHtml(html) {
        if (!html) return '';
        
        // Extraire le texte des liens d'abord
        html = html.replace(/<a[^>]*>(.*?)<\/a>/gi, ' $1 ');
        
        // Remplacer les retours à la ligne HTML par des espaces
        html = html.replace(/<br\s*\/?>/gi, ' ');
        html = html.replace(/<\/p>/gi, ' ');
        html = html.replace(/<\/div>/gi, ' ');
        html = html.replace(/<\/li>/gi, ' ');
        
        // Supprimer toutes les autres balises
        html = html.replace(/<[^>]+>/g, ' ');
        
        // Décoder les entités HTML
        html = html.replace(/&nbsp;/g, ' ');
        html = html.replace(/&amp;/g, '&');
        html = html.replace(/&lt;/g, '<');
        html = html.replace(/&gt;/g, '>');
        html = html.replace(/&quot;/g, '"');
        html = html.replace(/&#39;/g, "'");
        html = html.replace(/&[^;]+;/g, ' ');
        
        // Nettoyer les espaces multiples
        return html.replace(/\s+/g, ' ').trim();
    }

    calculateConfidence(analysis) {
        if (analysis.hasAbsolute) return 0.95;
        if (analysis.total >= 250) return 0.95;
        if (analysis.total >= 200) return 0.90;
        if (analysis.total >= 150) return 0.85;
        if (analysis.total >= 100) return 0.80;
        if (analysis.total >= 80) return 0.75;
        if (analysis.total >= 60) return 0.70;
        if (analysis.total >= 40) return 0.60;
        if (analysis.total >= 30) return 0.55;
        return 0.40;
    }

    // ================================================
    // ANALYSE DE TOUTES LES CATÉGORIES
    // ================================================
    analyzeAllCategories(content) {
        const categories = window.categoryManager?.getCategories() || {};
        const activeCategories = window.categoryManager?.getActiveCategories() || Object.keys(categories);
        const results = {};
        
        for (const categoryId of activeCategories) {
            const keywords = window.categoryManager?.getCategoryKeywords(categoryId);
            if (!keywords) continue;
            
            const score = this.calculateCategoryScore(content, keywords, categoryId);
            if (score.total > 0) {
                results[categoryId] = {
                    category: categoryId,
                    score: score.total,
                    hasAbsolute: score.hasAbsolute,
                    matches: score.matches,
                    confidence: this.calculateConfidence(score),
                    priority: this.categoryPriorities[categoryId] || 30
                };
            }
        }
        
        return results;
    }

    // ================================================
    // AUTRES MÉTHODES (inchangées depuis v13)
    // ================================================
    
    async loadSettingsFromCategoryManager() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            try {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                return true;
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur chargement CategoryManager:', error);
                return this.loadDefaultSettings();
            }
        } else {
            console.warn('[EmailScanner] ⚠️ CategoryManager non disponible');
            return this.loadDefaultSettings();
        }
    }

    loadDefaultSettings() {
        this.settings = {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
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

    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v14.0 ===');
        
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            maxEmails: options.maxEmails || -1,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: options.taskPreselectedCategories || [...this.taskPreselectedCategories],
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            provider: options.provider || 'microsoft'
        };

        if (this.isScanning) {
            console.warn('[EmailScanner] ⚠️ Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;
            this.scanMetrics.startTime = Date.now();

            // Étape 1: Récupérer les emails
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: 'Récupération des emails...',
                    progress: { current: 0, total: 100 }
                });
            }

            const emails = await this.fetchEmailsFromMailService(mergedOptions);
            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                return this.buildEmptyResults(mergedOptions);
            }

            // Étape 2: Catégoriser les emails
            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: 'Catégorisation des emails...',
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmails();
            }

            // Étape 3: Analyser pour les tâches (optionnel)
            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: 'Analyse IA pour les tâches...',
                        progress: { current: 0, total: 10 }
                    });
                }

                await this.analyzeForTasks();
            }

            // Construire les résultats
            const results = this.getDetailedResults(mergedOptions);

            console.log('[EmailScanner] 🎉 === SCAN TERMINÉ ===');
            console.log('[EmailScanner] 📊 Résultats:', {
                total: results.total,
                categorized: results.categorized,
                preselectedForTasks: results.stats.preselectedForTasks
            });

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            // Notifier les autres modules
            this.dispatchEvent('scanCompleted', {
                results,
                emails: this.emails,
                breakdown: results.breakdown,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                preselectedCount: results.stats.preselectedForTasks
            });

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur de scan:', error);
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'error',
                    message: `Erreur: ${error.message}`,
                    error
                });
            }
            
            throw error;
        } finally {
            this.isScanning = false;
        }
    }

    async fetchEmailsFromMailService(options) {
        console.log('[EmailScanner] 📬 Récupération des emails...');
        
        try {
            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            if (!window.mailService.isInitialized()) {
                await window.mailService.initialize();
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - options.days);

            const dateFilter = this.buildDateFilter(startDate, endDate, options.provider);

            const emails = await window.mailService.getMessages(options.folder, {
                top: options.maxEmails > 0 ? options.maxEmails : undefined,
                filter: dateFilter
            });

            console.log(`[EmailScanner] ✅ ${emails.length} emails récupérés`);
            return emails;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur récupération emails:', error);
            throw error;
        }
    }

    buildDateFilter(startDate, endDate, provider) {
        if (provider === 'microsoft' || provider === 'outlook') {
            return `receivedDateTime ge ${startDate.toISOString()} and receivedDateTime le ${endDate.toISOString()}`;
        } else {
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            return `after:${startStr} before:${endStr}`;
        }
    }

    async categorizeEmails() {
        const total = this.emails.length;
        let processed = 0;
        
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION v14.0 ===');
        console.log('[EmailScanner] 📊 Total emails:', total);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

        const batchSize = 100;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    const analysis = this.analyzeEmail(email);
                    
                    email.category = analysis.category;
                    email.categoryScore = analysis.score;
                    email.categoryConfidence = analysis.confidence;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isPersonal = analysis.isPersonal || false;
                    
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(analysis.category);
                    
                    if (!this.categorizedEmails[analysis.category]) {
                        this.categorizedEmails[analysis.category] = [];
                    }
                    this.categorizedEmails[analysis.category].push(email);

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation:', error);
                    
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    
                    if (!this.categorizedEmails.other) {
                        this.categorizedEmails.other = [];
                    }
                    this.categorizedEmails.other.push(email);
                }

                processed++;
            }

            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
    }

    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] ⚠️ AITaskAnalyzer non disponible');
            return;
        }

        const emailsToAnalyze = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);

        console.log(`[EmailScanner] 🤖 Analyse IA de ${emailsToAnalyze.length} emails`);

        for (let i = 0; i < emailsToAnalyze.length; i++) {
            const email = emailsToAnalyze[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA: ${i + 1}/${emailsToAnalyze.length}`,
                        progress: { current: i + 1, total: emailsToAnalyze.length }
                    });
                }
                
                if (i < emailsToAnalyze.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur analyse IA:', error);
                email.aiAnalysisError = error.message;
            }
        }
    }

    buildEmptyResults(options) {
        return {
            success: true,
            total: 0,
            categorized: 0,
            breakdown: {},
            stats: { 
                processed: 0, 
                errors: 0,
                preselectedForTasks: 0,
                highConfidence: 0,
                taskSuggestions: 0
            },
            emails: [],
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            scanMetrics: this.scanMetrics,
            provider: options.provider
        };
    }

    getDetailedResults(options = {}) {
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

        const scanDuration = this.scanMetrics.startTime ? 
            Math.round((Date.now() - this.scanMetrics.startTime) / 1000) : 0;

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: {
                processed: this.emails.length,
                errors: this.emails.filter(e => e.categoryError).length,
                highConfidence: totalWithHighConfidence,
                taskSuggestions: totalWithTasks,
                preselectedForTasks: totalPreselected,
                scanDuration: scanDuration
            },
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.scanMetrics,
            provider: options.provider
        };
    }

    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] ⚠️ Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScanner] 🔄 === DÉBUT RE-CATÉGORISATION ===');
        
        await this.loadSettingsFromCategoryManager();
        
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Re-catégorisation terminée');
        
        this.dispatchEvent('emailsRecategorized', {
            emails: this.emails,
            breakdown: this.getDetailedResults().breakdown,
            taskPreselectedCategories: this.taskPreselectedCategories,
            preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
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

    registerAsChangeListener() {
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            this.changeListener = window.categoryManager.addChangeListener((event, data) => {
                console.log(`[EmailScanner] 📨 Changement CategoryManager: ${event}`, data);
                this.handleCategoryManagerChange(event, data);
            });
            
            console.log('[EmailScanner] 👂 Listener CategoryManager enregistré');
        }
    }

    handleCategoryManagerChange(event, data) {
        const needsRecategorization = [
            'keywordsUpdated',
            'categoryCreated',
            'categoryUpdated',
            'categoryDeleted',
            'settingsChanged'
        ].includes(event);
        
        if (event === 'settingsChanged') {
            this.settings = data;
            this.taskPreselectedCategories = data.taskPreselectedCategories || [];
        }
        
        if (needsRecategorization && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Re-catégorisation automatique déclenchée');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
    }

    setupEventListeners() {
        window.addEventListener('keywordsUpdated', (event) => {
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 200);
            }
        });
        
        console.log('[EmailScanner] ✅ Event listeners configurés');
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
            console.error(`[EmailScanner] ❌ Erreur dispatch ${eventName}:`, error);
        }
    }

    reset() {
        console.log('[EmailScanner] 🔄 Réinitialisation...');
        
        this.emails = [];
        this.categorizedEmails = {};
        
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            categoryDistribution: {},
            preselectedCount: 0
        };
        
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

    isInCC(email) {
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) return false;
        
        const isInTo = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        }) || false;
        
        const isInCc = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        return isInCc && !isInTo;
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
        } catch (e) {
            console.warn('[EmailScanner] Impossible de récupérer l\'email utilisateur');
        }
        return null;
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    getDebugInfo() {
        return {
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: Object.values(this.categorizedEmails)
                .reduce((sum, emails) => sum + emails.length, 0),
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            settings: this.settings,
            categoryPriorities: this.categoryPriorities,
            specialPatterns: Object.keys(this.specialPatterns),
            version: '14.0'
        };
    }

    destroy() {
        if (this.changeListener && typeof this.changeListener === 'function') {
            this.changeListener();
        }
        
        this.emails = [];
        this.categorizedEmails = {};
        console.log('[EmailScanner] Instance détruite');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.emailScanner) {
    window.emailScanner.destroy?.();
}

window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v14.0 loaded - Analyse améliorée du contenu complet');
console.log('🎯 Détection basée sur le contenu réel, pas sur les domaines');
console.log('📊 Patterns spéciaux pour marketing, RH et fraude');
