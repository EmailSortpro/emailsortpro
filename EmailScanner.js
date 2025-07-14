// EmailScanner.js - Version 15.0 - Version propre et optimisée
// Utilise uniquement CategoryManager pour les mots-clés et catégories

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        // Priorités des catégories (géré localement par EmailScanner)
        this.categoryPriorities = {
            'marketing_news': 100,  // Priorité maximale
            'cc': 90,              // Priorité élevée
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
            'notifications': 30    // Priorité basse par défaut
        };
        
        // Métriques
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            categoryDistribution: {},
            preselectedCount: 0
        };
        
        console.log('[EmailScanner] ✅ Version 15.0 - Optimisée et stable');
        this.initialize();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        console.log('[EmailScanner] 🔧 Initialisation...');
        
        await this.loadSettings();
        this.setupEventListeners();
        
        console.log('[EmailScanner] ✅ Initialisation terminée');
    }

    async loadSettings() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            try {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
                return true;
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur chargement CategoryManager:', error);
            }
        }
        
        // Paramètres par défaut
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
    }

    // ================================================
    // MÉTHODE SCAN PRINCIPALE
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN ===');
        
        if (this.isScanning) {
            console.warn('[EmailScanner] ⚠️ Scan déjà en cours');
            return null;
        }

        const scanOptions = this.prepareScanOptions(options);

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = scanOptions.onProgress;
            this.scanMetrics.startTime = Date.now();

            // Étape 1: Récupérer les emails
            const emails = await this.fetchEmails(scanOptions);
            this.emails = emails || [];
            
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                return this.buildResults();
            }

            // Étape 2: Catégoriser
            if (scanOptions.autoCategrize) {
                await this.categorizeEmails();
            }

            // Étape 3: Analyse IA (optionnel)
            if (scanOptions.autoAnalyze && window.aiTaskAnalyzer) {
                await this.analyzeForTasks();
            }

            const results = this.buildResults();
            
            console.log('[EmailScanner] 🎉 === SCAN TERMINÉ ===');
            
            this.notifyCompletion(results);
            
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

    prepareScanOptions(options) {
        const scanSettings = this.settings.scanSettings || {};
        return {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            maxEmails: options.maxEmails || -1,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            includeSpam: !this.settings.preferences?.excludeSpam,
            provider: options.provider || 'microsoft'
        };
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS
    // ================================================
    async fetchEmails(options) {
        if (this.scanProgress) {
            this.scanProgress({ 
                phase: 'fetching', 
                message: 'Récupération des emails...',
                progress: { current: 0, total: 100 }
            });
        }

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

        return await window.mailService.getMessages(options.folder, {
            top: options.maxEmails > 0 ? options.maxEmails : undefined,
            filter: dateFilter
        });
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
    // CATÉGORISATION DES EMAILS
    // ================================================
    async categorizeEmails() {
        const total = this.emails.length;
        let processed = 0;
        
        console.log('[EmailScanner] 🏷️ Début catégorisation:', total, 'emails');

        if (this.scanProgress) {
            this.scanProgress({
                phase: 'categorizing',
                message: 'Catégorisation des emails...',
                progress: { current: 0, total }
            });
        }

        for (const email of this.emails) {
            try {
                const category = this.categorizeEmail(email);
                email.category = category.category;
                email.categoryScore = category.score;
                email.categoryConfidence = category.confidence;
                email.matchedPatterns = category.matchedPatterns || [];
                email.hasAbsolute = category.hasAbsolute || false;
                email.isPreselectedForTasks = this.taskPreselectedCategories.includes(category.category);
                
                // Ajouter à la liste catégorisée
                if (!this.categorizedEmails[category.category]) {
                    this.categorizedEmails[category.category] = [];
                }
                this.categorizedEmails[category.category].push(email);
                
            } catch (error) {
                console.error('[EmailScanner] Erreur catégorisation email:', error);
                email.category = 'other';
                email.categoryScore = 0;
                email.categoryConfidence = 0;
                email.isPreselectedForTasks = false;
                
                if (!this.categorizedEmails.other) {
                    this.categorizedEmails.other = [];
                }
                this.categorizedEmails.other.push(email);
            }

            processed++;
            
            if (this.scanProgress && processed % 50 === 0) {
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total}`,
                    progress: { current: processed, total }
                });
            }
        }

        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        console.log('[EmailScanner] ✅ Catégorisation terminée');
    }

    // ================================================
    // CATÉGORISATION D'UN EMAIL
    // ================================================
    categorizeEmail(email) {
        if (!email) {
            return { category: 'other', score: 0, confidence: 0 };
        }

        // 1. Vérifier spam
        if (this.isSpam(email) && this.settings.preferences?.excludeSpam) {
            return { category: 'spam', score: 0, confidence: 1, isSpam: true };
        }

        // 2. Extraire le contenu
        const content = this.extractContent(email);
        
        // 3. Détecter les caractéristiques spéciales
        const isNoreply = this.isNoreplyEmail(email);
        const isCC = this.isInCC(email);
        const isDirectlyAddressed = this.isDirectlyAddressed(email, content);
        
        // 4. Analyser avec toutes les catégories
        const scores = this.analyzeWithCategories(content);
        
        // 5. Ajuster les scores selon le contexte
        this.adjustScoresForContext(scores, {
            isNoreply,
            isCC,
            isDirectlyAddressed,
            content
        });
        
        // 6. Sélectionner la meilleure catégorie
        const bestCategory = this.selectBestCategory(scores);
        
        // 7. Cas spéciaux
        if (isCC && !isDirectlyAddressed && (!bestCategory || bestCategory.score < 100)) {
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'email_in_cc', type: 'detected' }],
                hasAbsolute: true,
                isCC: true
            };
        }
        
        if (bestCategory) {
            return bestCategory;
        }
        
        return { category: 'other', score: 0, confidence: 0 };
    }

    // ================================================
    // ANALYSE AVEC LES CATÉGORIES
    // ================================================
    analyzeWithCategories(content) {
        const categories = window.categoryManager?.getCategories() || {};
        const activeCategories = window.categoryManager?.getActiveCategories() || Object.keys(categories);
        const scores = {};
        
        for (const categoryId of activeCategories) {
            const keywords = window.categoryManager?.getCategoryKeywords(categoryId);
            if (!keywords) continue;
            
            const score = this.calculateScore(content, keywords, categoryId);
            
            scores[categoryId] = {
                category: categoryId,
                score: score.total,
                hasAbsolute: score.hasAbsolute,
                matchedPatterns: score.matches,
                confidence: this.calculateConfidence(score),
                priority: this.categoryPriorities[categoryId] || 30
            };
        }
        
        return scores;
    }

    // ================================================
    // CALCUL DU SCORE
    // ================================================
    calculateScore(content, keywords, categoryId) {
        let total = 0;
        let hasAbsolute = false;
        const matches = [];
        
        const text = content.text;
        const subject = content.subject;
        
        // Mots-clés absolus (100 points)
        if (keywords.absolute?.length > 0) {
            for (const keyword of keywords.absolute) {
                if (this.containsKeyword(text, keyword)) {
                    total += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Bonus sujet
                    if (subject && this.containsKeyword(subject, keyword)) {
                        total += 50;
                        matches.push({ keyword: `${keyword} (sujet)`, type: 'bonus', score: 50 });
                    }
                }
            }
        }
        
        // Mots-clés forts (50 points)
        if (keywords.strong?.length > 0) {
            for (const keyword of keywords.strong) {
                if (this.containsKeyword(text, keyword)) {
                    total += 50;
                    matches.push({ keyword, type: 'strong', score: 50 });
                    
                    // Bonus sujet
                    if (subject && this.containsKeyword(subject, keyword)) {
                        total += 25;
                        matches.push({ keyword: `${keyword} (sujet)`, type: 'bonus', score: 25 });
                    }
                }
            }
        }
        
        // Mots-clés faibles (20 points)
        if (keywords.weak?.length > 0) {
            for (const keyword of keywords.weak) {
                if (this.containsKeyword(text, keyword)) {
                    total += 20;
                    matches.push({ keyword, type: 'weak', score: 20 });
                }
            }
        }
        
        return { total, hasAbsolute, matches };
    }

    // ================================================
    // AJUSTEMENT DES SCORES SELON LE CONTEXTE
    // ================================================
    adjustScoresForContext(scores, context) {
        const { isNoreply, isCC, isDirectlyAddressed, content } = context;
        
        // Si noreply ET patterns marketing → boost marketing
        if (isNoreply && scores.marketing_news && scores.marketing_news.score >= 50) {
            scores.marketing_news.score += 100;
            scores.marketing_news.priority = 110; // Priorité temporaire plus haute
            scores.marketing_news.matchedPatterns.push({
                keyword: 'noreply_marketing_boost',
                type: 'context',
                score: 100
            });
        }
        
        // Si noreply sans marketing fort → boost notifications
        else if (isNoreply) {
            if (!scores.notifications) {
                scores.notifications = {
                    category: 'notifications',
                    score: 100,
                    hasAbsolute: true,
                    matchedPatterns: [{ keyword: 'noreply_auto', type: 'context', score: 100 }],
                    confidence: 0.85,
                    priority: 80 // Priorité temporaire plus haute
                };
            } else {
                scores.notifications.score += 80;
                scores.notifications.priority = 80;
            }
        }
        
        // Pénalités contextuelles
        this.applyContextPenalties(scores, content.text);
    }

    applyContextPenalties(scores, text) {
        // Si on trouve des patterns de désabonnement, pénaliser tout sauf marketing
        const marketingKeywords = window.categoryManager?.getCategoryKeywords('marketing_news');
        if (marketingKeywords?.absolute) {
            const hasUnsubscribe = marketingKeywords.absolute.some(k => 
                (k.includes('désinscrire') || k.includes('unsubscribe') || k.includes('ne plus recevoir')) &&
                this.containsKeyword(text, k)
            );
            
            if (hasUnsubscribe) {
                Object.keys(scores).forEach(catId => {
                    if (catId !== 'marketing_news' && catId !== 'notifications') {
                        scores[catId].score = Math.max(0, scores[catId].score - 100);
                    }
                });
            }
        }
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategory(scores) {
        const candidates = Object.values(scores)
            .filter(s => s.score >= 30)
            .sort((a, b) => {
                // D'abord par mot-clé absolu
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
    // MÉTHODES UTILITAIRES
    // ================================================
    extractContent(email) {
        let text = '';
        let subject = '';
        
        // Sujet (très important)
        if (email.subject) {
            subject = email.subject;
            text += (email.subject + ' ').repeat(5);
        }
        
        // Corps
        if (email.bodyPreview) {
            text += email.bodyPreview + ' ';
        }
        
        if (email.body?.content) {
            text += this.cleanHtml(email.body.content) + ' ';
        }
        
        return {
            text: text.toLowerCase(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address)
        };
    }

    cleanHtml(html) {
        if (!html) return '';
        return html
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return '';
        return email.split('@')[1]?.toLowerCase() || '';
    }

    containsKeyword(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalize = (str) => {
            return str.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[''`]/g, "'")
                .replace(/[-_]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };
        
        return normalize(text).includes(normalize(keyword));
    }

    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.85;
        if (score.total >= 100) return 0.80;
        if (score.total >= 60) return 0.70;
        if (score.total >= 30) return 0.50;
        return 0.30;
    }

    isSpam(email) {
        const spamIndicators = ['spam', 'junk', 'indésirable', 'unwanted'];
        
        // Vérifier le dossier parent
        if (email.parentFolderId) {
            const folder = email.parentFolderId.toLowerCase();
            if (spamIndicators.some(ind => folder.includes(ind))) {
                return true;
            }
        }
        
        // Vérifier les catégories
        if (email.categories?.length > 0) {
            return email.categories.some(cat => 
                spamIndicators.some(ind => cat.toLowerCase().includes(ind))
            );
        }
        
        return false;
    }

    isNoreplyEmail(email) {
        const address = email.from?.emailAddress?.address?.toLowerCase() || '';
        const patterns = ['noreply', 'no-reply', 'donotreply', 'ne_pas_repondre', 'nepasrepondre'];
        
        return patterns.some(p => address.includes(p));
    }

    isInCC(email) {
        if (!email.ccRecipients?.length) return false;
        
        const userEmail = this.getCurrentUserEmail();
        if (!userEmail) return false;
        
        // Vérifier si on est dans TO
        const inTo = email.toRecipients?.some(r => 
            r.emailAddress?.address?.toLowerCase() === userEmail.toLowerCase()
        );
        
        // Vérifier si on est dans CC
        const inCC = email.ccRecipients.some(r => 
            r.emailAddress?.address?.toLowerCase() === userEmail.toLowerCase()
        );
        
        // On est en CC seulement si on y est ET qu'on n'est pas dans TO
        return inCC && !inTo;
    }

    isDirectlyAddressed(email, content) {
        const userName = this.getCurrentUserName();
        
        // Vérifier le nom dans le contenu
        if (userName && content.text.includes(userName.toLowerCase())) {
            return true;
        }
        
        // Vérifier si seul destinataire
        if (email.toRecipients?.length === 1) {
            const userEmail = this.getCurrentUserEmail();
            if (email.toRecipients[0].emailAddress?.address?.toLowerCase() === userEmail?.toLowerCase()) {
                return true;
            }
        }
        
        // Patterns d'adresse directe
        const patterns = ['bonjour', 'hello', 'cher', 'votre', 'ton'];
        return patterns.some(p => content.text.substring(0, 50).includes(p));
    }

    getCurrentUserEmail() {
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName;
            }
        } catch (e) {
            console.warn('[EmailScanner] Email utilisateur non trouvé');
        }
        return null;
    }

    getCurrentUserName() {
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.displayName || parsed.name;
            }
        } catch (e) {
            console.warn('[EmailScanner] Nom utilisateur non trouvé');
        }
        return null;
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) return;

        const emailsToAnalyze = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        );

        console.log(`[EmailScanner] 🤖 Analyse IA de ${emailsToAnalyze.length} emails`);

        if (this.scanProgress) {
            this.scanProgress({
                phase: 'analyzing',
                message: 'Analyse IA en cours...',
                progress: { current: 0, total: emailsToAnalyze.length }
            });
        }

        for (let i = 0; i < emailsToAnalyze.length; i++) {
            const email = emailsToAnalyze[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = !!analysis?.mainTask?.title;
            } catch (error) {
                console.error('[EmailScanner] Erreur analyse IA:', error);
            }

            if (this.scanProgress && (i + 1) % 10 === 0) {
                this.scanProgress({
                    phase: 'analyzing',
                    message: `Analyse IA: ${i + 1}/${emailsToAnalyze.length}`,
                    progress: { current: i + 1, total: emailsToAnalyze.length }
                });
            }
        }
    }

    // ================================================
    // CONSTRUCTION DES RÉSULTATS
    // ================================================
    buildResults() {
        const breakdown = {};
        let categorized = 0;
        
        Object.entries(this.categorizedEmails).forEach(([cat, emails]) => {
            breakdown[cat] = emails.length;
            if (cat !== 'other' && cat !== 'spam') {
                categorized += emails.length;
            }
        });

        return {
            success: true,
            total: this.emails.length,
            categorized,
            breakdown,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: {
                processed: this.emails.length,
                errors: this.emails.filter(e => e.categoryError).length,
                preselectedForTasks: this.emails.filter(e => e.isPreselectedForTasks).length,
                taskSuggestions: this.emails.filter(e => e.taskSuggested).length,
                scanDuration: Math.round((Date.now() - this.scanMetrics.startTime) / 1000)
            },
            emails: this.emails
        };
    }

    // ================================================
    // MÉTHODES PUBLIQUES
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

    getCategorizedEmails() {
        return { ...this.categorizedEmails };
    }

    async recategorizeEmails() {
        if (this.emails.length === 0) return;
        
        console.log('[EmailScanner] 🔄 Recatégorisation...');
        
        // Recharger les paramètres
        await this.loadSettings();
        
        // Réinitialiser les catégories
        this.categorizedEmails = {};
        
        // Recatégoriser
        await this.categorizeEmails();
        
        // Notifier
        this.dispatchEvent('emailsRecategorized', {
            emails: this.emails,
            breakdown: this.buildResults().breakdown
        });
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS
    // ================================================
    setupEventListeners() {
        // Écouter les changements de CategoryManager
        if (window.categoryManager?.addChangeListener) {
            window.categoryManager.addChangeListener(async (event, data) => {
                console.log(`[EmailScanner] 📨 Changement détecté: ${event}`);
                
                if (['settingsChanged', 'keywordsUpdated'].includes(event)) {
                    await this.loadSettings();
                    
                    if (this.emails.length > 0) {
                        setTimeout(() => this.recategorizeEmails(), 100);
                    }
                }
            });
        }
    }

    notifyCompletion(results) {
        this.dispatchEvent('scanCompleted', {
            results,
            emails: this.emails,
            breakdown: results.breakdown,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedCount: results.stats.preselectedForTasks
        });
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
            console.error(`[EmailScanner] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    reset() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            categoryDistribution: {},
            preselectedCount: 0
        };
        
        // Initialiser toutes les catégories
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
            version: '15.0',
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedEmails: Object.entries(this.categorizedEmails)
                .map(([cat, emails]) => `${cat}: ${emails.length}`)
                .join(', '),
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            settings: this.settings
        };
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Remplacement instance existante...');
}

window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v15.0 chargé - Version propre et optimisée');
