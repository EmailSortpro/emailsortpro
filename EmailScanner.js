// EmailScanner.js - Version 17.0 - Scanner Adaptatif avec CategoryManager
// Version complète et robuste sans erreurs

console.log('[EmailScanner] 🚀 Loading EmailScanner.js v17.0 - CategoryManager Adaptive...');

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        // Configuration
        this.config = {
            batchSize: 100,
            categorizationDelay: 0,
            maxConcurrentAnalysis: 10,
            cacheCategories: true,
            debugMode: false
        };
        
        // Cache de catégorisation
        this.categoryCache = new Map();
        
        // Métriques
        this.metrics = {
            startTime: null,
            categorizedCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            avgCategorizeTime: 0
        };
        
        console.log('[EmailScanner] ✅ Version 17.0 initialized - CategoryManager Adaptive');
        this.initializeWithSync();
    }

    // ================================================
    // INITIALISATION
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

    // ================================================
    // ANALYSE D'EMAIL - MÉTHODE PRINCIPALE
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
        
        // 1. Vérification spam
        if (this.isSpamEmail(email) && this.settings.preferences?.excludeSpam !== false) {
            const result = { category: 'spam', score: 0, confidence: 1, isSpam: true };
            this.categoryCache.set(cacheKey, result);
            return result;
        }

        // 2. Extraction du contenu
        const content = this.extractEmailContent(email);
        
        // 3. Détection CC
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
        
        // 4. Analyse avec CategoryManager
        const categoryScores = this.analyzeWithCategoryManager(content);
        
        // 5. Sélection de la meilleure catégorie
        const bestCategory = this.selectBestCategory(categoryScores);
        
        // 6. Résultat final
        let result;
        if (bestCategory && bestCategory.score >= 30) {
            result = {
                category: bestCategory.category,
                score: bestCategory.score,
                confidence: bestCategory.confidence,
                matchedPatterns: bestCategory.matches || [],
                hasAbsolute: bestCategory.hasAbsolute || false
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
            console.log(`[EmailScanner] Categorized "${email.subject?.substring(0, 50)}..." as ${result.category} (score: ${result.score})`);
        }
        
        return result;
    }

    // ================================================
    // ANALYSE AVEC CATEGORYMANAGER
    // ================================================
    analyzeWithCategoryManager(content) {
        if (!window.categoryManager) {
            console.warn('[EmailScanner] CategoryManager not available');
            return {};
        }
        
        const activeCategories = window.categoryManager.getActiveCategories();
        const results = {};
        
        for (const categoryId of activeCategories) {
            const keywords = window.categoryManager.getCategoryKeywords(categoryId);
            if (!keywords || (!keywords.absolute?.length && !keywords.strong?.length && !keywords.weak?.length)) {
                continue;
            }
            
            const score = this.calculateKeywordScore(content.text, keywords, content.subject);
            
            if (score.total > 0) {
                results[categoryId] = {
                    category: categoryId,
                    score: score.total,
                    hasAbsolute: score.hasAbsolute,
                    matches: score.matches,
                    confidence: this.calculateConfidence(score),
                    priority: window.categoryManager.categories[categoryId]?.priority || 50
                };
            }
        }
        
        return results;
    }

    // ================================================
    // CALCUL DU SCORE
    // ================================================
    calculateKeywordScore(text, keywords, subject = '') {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        
        // Créer un Set pour recherche rapide
        const textWords = new Set(text.split(/\s+/));
        const subjectWords = new Set(subject.split(/\s+/));
        
        // Test des exclusions
        if (keywords.exclusions?.length) {
            for (const exclusion of keywords.exclusions) {
                if (this.containsKeyword(text, textWords, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
                }
            }
        }
        
        // Test des mots-clés absolus
        if (keywords.absolute?.length) {
            for (const keyword of keywords.absolute) {
                if (this.containsKeyword(text, textWords, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Bonus si dans le sujet
                    if (subject && this.containsKeyword(subject, subjectWords, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + ' (subject)', type: 'bonus', score: 50 });
                    }
                }
            }
        }
        
        // Test des mots-clés forts
        if (keywords.strong?.length) {
            let strongCount = 0;
            for (const keyword of keywords.strong) {
                if (this.containsKeyword(text, textWords, keyword)) {
                    totalScore += 40;
                    strongCount++;
                    matches.push({ keyword, type: 'strong', score: 40 });
                    
                    // Bonus si dans le sujet
                    if (subject && this.containsKeyword(subject, subjectWords, keyword)) {
                        totalScore += 20;
                        matches.push({ keyword: keyword + ' (subject)', type: 'bonus', score: 20 });
                    }
                }
            }
            
            // Bonus pour multiples matches
            if (strongCount >= 3) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong', type: 'bonus', score: 30 });
            }
        }
        
        // Test des mots-clés faibles
        if (keywords.weak?.length) {
            let weakCount = 0;
            for (const keyword of keywords.weak) {
                if (this.containsKeyword(text, textWords, keyword)) {
                    totalScore += 15;
                    weakCount++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                }
            }
            
            // Bonus pour multiples matches
            if (weakCount >= 4) {
                totalScore += 20;
                matches.push({ keyword: 'multiple_weak', type: 'bonus', score: 20 });
            }
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategory(categoryScores) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const candidates = Object.values(categoryScores)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD);
        
        if (candidates.length === 0) {
            return null;
        }
        
        // Trier par : mots absolus > priorité > score
        return candidates.sort((a, b) => {
            // Priorité aux mots absolus
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
    // SCAN PRINCIPAL
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === STARTING SCAN v17.0 ===');
        
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

            // Étape 2: Catégorisation
            if (scanOptions.autoCategrize) {
                await this.categorizeEmails();
            }

            // Étape 3: Analyse IA (optionnelle)
            if (scanOptions.autoAnalyze && window.aiTaskAnalyzer) {
                await this.analyzeForTasks();
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
                cacheMisses: this.metrics.cacheMisses
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

    // ================================================
    // CATÉGORISATION DES EMAILS
    // ================================================
    async categorizeEmails() {
        const total = this.emails.length;
        console.log(`[EmailScanner] 🏷️ === CATEGORIZING ${total} EMAILS ===`);
        console.log('[EmailScanner] ⭐ Preselected categories:', this.taskPreselectedCategories);

        let processed = 0;
        const batchSize = this.config.batchSize;
        
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
        console.log(`[EmailScanner] 📊 Cache stats: ${this.metrics.cacheHits} hits, ${this.metrics.cacheMisses} misses`);
    }

    // ================================================
    // EXTRACTION DE CONTENU
    // ================================================
    extractEmailContent(email) {
        const parts = [];
        let subject = '';
        
        // Sujet (très important - répété pour le poids)
        if (email.subject?.trim()) {
            subject = email.subject.toLowerCase();
            parts.push(...Array(5).fill(subject));
        }
        
        // From (important)
        if (email.from?.emailAddress?.address) {
            parts.push(...Array(3).fill(email.from.emailAddress.address.toLowerCase()));
        }
        
        // Corps
        const maxBodyLength = 5000;
        
        if (email.bodyPreview) {
            parts.push(email.bodyPreview.toLowerCase());
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtml(email.body.content);
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
            subject: subject,
            domain: this.extractDomain(email.from?.emailAddress?.address),
            from: email.from?.emailAddress?.address?.toLowerCase() || '',
            length: fullText.length
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
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

    cleanHtml(html) {
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
    // PRÉPARATION DES OPTIONS DE SCAN
    // ================================================
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

    // ================================================
    // RÉCUPÉRATION DES EMAILS
    // ================================================
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

    // ================================================
    // ANALYSE IA DES TÂCHES
    // ================================================
    async analyzeForTasks() {
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

    // ================================================
    // CONSTRUCTION DES RÉSULTATS
    // ================================================
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
                cacheMisses: this.metrics.cacheMisses
            },
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.metrics,
            provider: options.provider
        };
    }

    // ================================================
    // RESET ET NETTOYAGE
    // ================================================
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
            avgCategorizeTime: 0
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

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
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

    // ================================================
    // RECATÉGORISATION
    // ================================================
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
            avgCategorizeTime: 0
        };

        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Recategorization complete');
        
        this.dispatchEvent('emailsRecategorized', {
            emails: this.emails,
            breakdown: this.getCategoryBreakdown(),
            taskPreselectedCategories: this.taskPreselectedCategories,
            preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
        });
    }

    // ================================================
    // MÉTHODES D'ACCÈS
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

    // ================================================
    // EVENT LISTENERS
    // ================================================
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

    // ================================================
    // DEBUG ET EXPORT
    // ================================================
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

console.log('✅ EmailScanner v17.0 loaded - CategoryManager Adaptive');
console.log('🎯 Complete integration with CategoryManager keywords');
console.log('📧 Robust error handling and caching');
console.log('🔍 Optimized for performance and accuracy');
