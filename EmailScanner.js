// EmailScanner.js - Version 13.0 - Gestion complète de la catégorisation
// Adapté au CategoryManager v22.0 simplifié (sans priorités ni exclusions)

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        // Définition des priorités de catégories (géré par EmailScanner maintenant)
        this.categoryPriorities = {
            'marketing_news': 100,  // Priorité maximale
            'cc': 90,              // Priorité élevée
            'security': 50,
            'finance': 50,
            'tasks': 50,
            'commercial': 50,
            'meetings': 50,
            'support': 50,
            'reminders': 50,
            'project': 50,
            'hr': 50,
            'internal': 50,
            'notifications': 50
        };
        
        // Patterns d'exclusion globaux
        this.globalExclusions = {
            personal: ['papa', 'maman', 'famille', 'bises', 'bisous', 'chéri', 'chérie'],
            marketing: ['newsletter', 'unsubscribe', 'désinscrire', 'promotion', 'promo', 'soldes']
        };
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            categoryDistribution: {},
            preselectedCount: 0
        };
        
        console.log('[EmailScanner] ✅ Version 13.0 - Gestion complète de la catégorisation');
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
    // CHARGEMENT DES PARAMÈTRES
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

    // ================================================
    // MÉTHODE SCAN PRINCIPALE
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v13.0 ===');
        
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

    // ================================================
    // RÉCUPÉRATION DES EMAILS
    // ================================================
    async fetchEmailsFromMailService(options) {
        console.log('[EmailScanner] 📬 Récupération des emails...');
        
        try {
            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            // Initialiser MailService si nécessaire
            if (!window.mailService.isInitialized()) {
                await window.mailService.initialize();
            }

            // Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - options.days);

            // Construire le filtre
            const dateFilter = this.buildDateFilter(startDate, endDate, options.provider);

            // Récupérer les emails
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

    // ================================================
    // CATÉGORISATION DES EMAILS (NOUVELLE LOGIQUE)
    // ================================================
    async categorizeEmails() {
        const total = this.emails.length;
        let processed = 0;
        
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION v13.0 ===');
        console.log('[EmailScanner] 📊 Total emails:', total);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

        const batchSize = 100;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // Analyser l'email avec la nouvelle logique
                    const analysis = this.analyzeEmail(email);
                    
                    // Appliquer les résultats
                    email.category = analysis.category;
                    email.categoryScore = analysis.score;
                    email.categoryConfidence = analysis.confidence;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isPersonal = analysis.isPersonal || false;
                    
                    // Marquer comme pré-sélectionné pour les tâches
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(analysis.category);
                    
                    // Ajouter à la catégorie
                    if (!this.categorizedEmails[analysis.category]) {
                        this.categorizedEmails[analysis.category] = [];
                    }
                    this.categorizedEmails[analysis.category].push(email);

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation:', error);
                    
                    // Valeurs par défaut
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

            // Mettre à jour le progrès
            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            // Pause courte
            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
    }

    // ================================================
    // NOUVELLE LOGIQUE D'ANALYSE D'EMAIL
    // ================================================
    analyzeEmail(email) {
        if (!email) {
            return { category: 'other', score: 0, confidence: 0 };
        }

        // 1. Vérifier si c'est du spam
        if (this.isSpamEmail(email) && this.settings.preferences?.excludeSpam !== false) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }

        // 2. Extraire le contenu
        const content = this.extractCompleteContent(email);
        
        // 3. Vérifier si c'est un email personnel
        if (this.isPersonalEmail(content)) {
            return { category: 'other', score: 0, confidence: 0, isPersonal: true };
        }

        // 4. Détecter si on est en CC
        const isCC = this.isInCC(email);
        
        // 5. Analyser toutes les catégories
        const categoryScores = this.analyzeAllCategories(content);
        
        // 6. Si on est en CC et qu'on détecte du marketing, prioriser marketing
        if (isCC && categoryScores.marketing_news && categoryScores.marketing_news.score >= 50) {
            return {
                category: 'marketing_news',
                score: categoryScores.marketing_news.score,
                confidence: categoryScores.marketing_news.confidence,
                matchedPatterns: categoryScores.marketing_news.matches,
                hasAbsolute: categoryScores.marketing_news.hasAbsolute,
                isCC: true
            };
        }
        
        // 7. Sélectionner la meilleure catégorie selon les priorités
        const bestCategory = this.selectBestCategory(categoryScores);
        
        // 8. Si on est en CC et pas de catégorie forte trouvée
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
                isCC: isCC
            };
        }
        
        return { category: 'other', score: 0, confidence: 0 };
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
    // CALCUL DU SCORE POUR UNE CATÉGORIE
    // ================================================
    calculateCategoryScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text.toLowerCase();
        
        // Appliquer des exclusions contextuelles
        if (this.shouldExcludeCategory(categoryId, text)) {
            return { total: 0, hasAbsolute: false, matches: [] };
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
                        matches.push({ keyword: keyword + ' (subject)', type: 'bonus', score: 50 });
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
                        matches.push({ keyword: keyword + ' (subject)', type: 'bonus', score: 20 });
                    }
                }
            }
            
            // Bonus si plusieurs mots forts
            if (strongMatches >= 2) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong', type: 'bonus', score: 30 });
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
            
            // Bonus si beaucoup de mots faibles
            if (weakMatches >= 3) {
                totalScore += 20;
                matches.push({ keyword: 'multiple_weak', type: 'bonus', score: 20 });
            }
        }
        
        // Bonus de domaine spécifiques
        totalScore += this.getDomainBonus(content.domain, categoryId);
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    // ================================================
    // LOGIQUE D'EXCLUSION PAR CATÉGORIE
    // ================================================
    shouldExcludeCategory(categoryId, text) {
        // Exclure les catégories professionnelles des emails personnels
        const professionalCategories = ['hr', 'internal', 'meetings', 'commercial', 'project'];
        if (professionalCategories.includes(categoryId)) {
            for (const word of this.globalExclusions.personal) {
                if (text.includes(word)) {
                    return true;
                }
            }
        }
        
        // Exclure les catégories non-marketing des emails marketing évidents
        const nonMarketingCategories = ['tasks', 'meetings', 'project', 'commercial', 'finance'];
        if (nonMarketingCategories.includes(categoryId)) {
            const marketingKeywords = ['newsletter', 'unsubscribe', 'désinscrire', 'promotion'];
            let marketingCount = 0;
            for (const word of marketingKeywords) {
                if (text.includes(word)) {
                    marketingCount++;
                }
            }
            if (marketingCount >= 2) {
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
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const candidates = Object.values(categoryScores)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // D'abord par présence de mot-clé absolu
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Puis par priorité
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                // Enfin par score
                return b.score - a.score;
            });
        
        return candidates[0] || null;
    }

    // ================================================
    // BONUS DE DOMAINE
    // ================================================
    getDomainBonus(domain, categoryId) {
        const domainBonuses = {
            security: ['microsoft', 'google', 'apple', 'security', 'auth'],
            finance: ['gouv.fr', 'impots', 'bank', 'paypal', 'stripe'],
            marketing_news: ['newsletter', 'mailchimp', 'campaign', 'marketing'],
            notifications: ['noreply', 'notification', 'donotreply'],
            project: ['github', 'gitlab', 'jira', 'asana'],
            meetings: ['zoom', 'teams', 'meet', 'webex'],
            support: ['zendesk', 'freshdesk', 'helpdesk', 'support']
        };
        
        if (domainBonuses[categoryId]) {
            for (const keyword of domainBonuses[categoryId]) {
                if (domain.includes(keyword)) {
                    return 40;
                }
            }
        }
        
        return 0;
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        // Sujet avec poids élevé
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(5);
        } else {
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet ';
        }
        
        // Expéditeur
        if (email.from?.emailAddress?.address) {
            allText += (email.from.emailAddress.address + ' ').repeat(2);
        }
        
        // Corps de l'email
        if (email.bodyPreview) {
            allText += email.bodyPreview + ' ';
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtml(email.body.content);
            allText += cleanedBody + ' ';
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length
        };
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

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizeText = (str) => {
            return str.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/['']/g, "'")
                .replace(/[-_]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };
        
        const normalizedText = normalizeText(text);
        const normalizedKeyword = normalizeText(keyword);
        
        return normalizedText.includes(normalizedKeyword);
    }

    calculateConfidence(analysis) {
        if (analysis.hasAbsolute) return 0.95;
        if (analysis.total >= 200) return 0.90;
        if (analysis.total >= 150) return 0.85;
        if (analysis.total >= 100) return 0.80;
        if (analysis.total >= 80) return 0.75;
        if (analysis.total >= 60) return 0.70;
        if (analysis.total >= 40) return 0.60;
        if (analysis.total >= 30) return 0.55;
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

    isPersonalEmail(content) {
        const personalScore = this.globalExclusions.personal.reduce((score, word) => {
            return score + (content.text.includes(word) ? 10 : 0);
        }, 0);
        
        return personalScore >= 20;
    }

    isInCC(email) {
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) return false;
        
        // Vérifier si on est dans TO
        const isInTo = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        }) || false;
        
        // Vérifier si on est dans CC
        const isInCc = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        // On est en CC seulement si on est dans CC et PAS dans TO
        return isInCc && !isInTo;
    }

    getCurrentUserEmail() {
        try {
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
        } catch (e) {
            console.warn('[EmailScanner] Impossible de récupérer l\'email utilisateur');
        }
        return null;
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES
    // ================================================
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

    // ================================================
    // CONSTRUCTION DES RÉSULTATS
    // ================================================
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

    // ================================================
    // RE-CATÉGORISATION
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] ⚠️ Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScanner] 🔄 === DÉBUT RE-CATÉGORISATION ===');
        
        // Recharger les paramètres
        await this.loadSettingsFromCategoryManager();
        
        // Réinitialiser les catégories
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        // Recatégoriser
        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Re-catégorisation terminée');
        
        // Notifier
        this.dispatchEvent('emailsRecategorized', {
            emails: this.emails,
            breakdown: this.getDetailedResults().breakdown,
            taskPreselectedCategories: this.taskPreselectedCategories,
            preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
        });
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES
    // ================================================
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

    // ================================================
    // GESTION DES ÉVÉNEMENTS
    // ================================================
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
        // Écouter les changements de mots-clés
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

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
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
        
        // Initialiser avec toutes les catégories
        const categories = window.categoryManager?.getCategories() || {};
        Object.keys(categories).forEach(catId => {
            this.categorizedEmails[catId] = [];
        });
        
        // Catégories spéciales
        ['other', 'spam', 'cc'].forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
            }
        });
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
            version: '13.0'
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

console.log('✅ EmailScanner v13.0 loaded - Gestion complète de la catégorisation');
console.log('📊 Utilise CategoryManager v22.0 pour les données uniquement');
