// EmailScanner.js - Version 16.0 - Scanner Optimisé avec Catégorisation Améliorée
// Performance améliorée et catégorisation plus précise

console.log('[EmailScanner] 🚀 Loading EmailScanner.js v16.0 - Optimized...');

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
            batchSize: 100,              // Emails par batch
            categorizationDelay: 0,      // Délai entre batches (ms)
            maxConcurrentAnalysis: 10,   // Analyses simultanées max
            cacheCategories: true,       // Cache des résultats de catégorisation
            debugMode: false            // Mode debug
        };
        
        // Cache de catégorisation pour éviter les recalculs
        this.categoryCache = new Map();
        
        // Métriques de performance
        this.metrics = {
            startTime: null,
            categorizedCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            avgCategorizeTime: 0
        };
        
        console.log('[EmailScanner] ✅ Version 16.0 initialized - Optimized');
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
    // ANALYSE D'EMAIL OPTIMISÉE v16
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
            const cached = this.categoryCache.get(cacheKey);
            
            if (this.config.debugMode) {
                console.log(`[EmailScanner] Cache hit for: ${email.subject?.substring(0, 50)}...`);
            }
            
            return cached;
        }
        
        this.metrics.cacheMisses++;
        
        // 1. Vérifications préliminaires rapides
        if (this.isSpamEmail(email) && this.settings.preferences?.excludeSpam !== false) {
            const result = { category: 'spam', score: 0, confidence: 1, isSpam: true };
            this.categoryCache.set(cacheKey, result);
            return result;
        }

        // 2. Extraction optimisée du contenu
        const content = this.extractContentOptimized(email);
        
        // 3. Détection CC rapide
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
        
        // 4. Analyse multi-catégories optimisée
        const categoryScores = this.analyzeCategoriesOptimized(content);
        
        // 5. Sélection de la meilleure catégorie
        const bestCategory = this.selectBestCategoryOptimized(categoryScores);
        
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
    // EXTRACTION DE CONTENU OPTIMISÉE
    // ================================================
    extractContentOptimized(email) {
        // Utiliser une approche plus rapide avec moins de répétitions
        const parts = [];
        
        // Sujet (très important)
        if (email.subject?.trim()) {
            parts.push(email.subject.toLowerCase());
            parts.push(email.subject.toLowerCase()); // Double poids
        }
        
        // Corps - limiter la taille pour la performance
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
            length: fullText.length
        };
    }

    cleanHtmlFast(html) {
        if (!html) return '';
        
        // Version rapide du nettoyage HTML
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ================================================
    // ANALYSE DES CATÉGORIES OPTIMISÉE
    // ================================================
    analyzeCategoriesOptimized(content) {
        if (!window.categoryManager) {
            console.warn('[EmailScanner] CategoryManager not available');
            return {};
        }
        
        const activeCategories = window.categoryManager.getActiveCategories();
        const results = {};
        
        // Analyser uniquement les catégories actives
        for (const categoryId of activeCategories) {
            // Skip si pas de mots-clés
            const keywords = window.categoryManager.getCategoryKeywords(categoryId);
            if (!keywords || (!keywords.absolute?.length && !keywords.strong?.length && !keywords.weak?.length)) {
                continue;
            }
            
            const score = this.calculateScoreOptimized(content.text, keywords, categoryId);
            
            if (score.total > 0) {
                results[categoryId] = {
                    category: categoryId,
                    score: score.total,
                    hasAbsolute: score.hasAbsolute,
                    matches: score.matches,
                    confidence: this.calculateConfidenceFast(score)
                };
            }
        }
        
        return results;
    }

    calculateScoreOptimized(text, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        
        // Utiliser une map pour les recherches rapides
        const textWords = new Set(text.split(/\s+/));
        
        // Test des mots-clés absolus (priorité maximale)
        if (keywords.absolute?.length) {
            for (const keyword of keywords.absolute) {
                if (this.containsKeyword(text, textWords, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Si on a un match absolu avec bon score, on peut réduire les tests
                    if (totalScore >= 200) {
                        break;
                    }
                }
            }
        }
        
        // Si on a déjà un score très élevé, limiter les tests suivants
        if (totalScore < 300 && keywords.strong?.length) {
            let strongCount = 0;
            for (const keyword of keywords.strong) {
                if (this.containsKeyword(text, textWords, keyword)) {
                    totalScore += 50;
                    strongCount++;
                    matches.push({ keyword, type: 'strong', score: 50 });
                    
                    if (strongCount >= 5) break; // Limiter pour la performance
                }
            }
            
            // Bonus pour multiples matches
            if (strongCount >= 3) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong', type: 'bonus', score: 30 });
            }
        }
        
        // Mots faibles seulement si nécessaire
        if (totalScore < 200 && keywords.weak?.length) {
            let weakCount = 0;
            for (const keyword of keywords.weak) {
                if (this.containsKeyword(text, textWords, keyword)) {
                    totalScore += 15;
                    weakCount++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                    
                    if (weakCount >= 6) break; // Limiter
                }
            }
            
            if (weakCount >= 4) {
                totalScore += 20;
                matches.push({ keyword: 'multiple_weak', type: 'bonus', score: 20 });
            }
        }
        
        // Test des exclusions (négatif)
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
        // Pour les mots simples, vérifier dans le Set
        if (!keyword.includes(' ')) {
            return textWords.has(keyword.toLowerCase());
        }
        
        // Pour les phrases, utiliser includes
        return text.includes(keyword.toLowerCase());
    }

    calculateConfidenceFast(score) {
        if (score.hasAbsolute) return 0.95;
        
        const total = score.total;
        if (total >= 250) return 0.95;
        if (total >= 200) return 0.90;
        if (total >= 150) return 0.85;
        if (total >= 100) return 0.80;
        if (total >= 80) return 0.75;
        if (total >= 60) return 0.70;
        if (total >= 40) return 0.60;
        if (total >= 30) return 0.55;
        return 0.40;
    }

    // ================================================
    // SÉLECTION DE CATÉGORIE OPTIMISÉE
    // ================================================
    selectBestCategoryOptimized(categoryScores) {
        // Filtrer et trier en une seule passe
        const candidates = Object.values(categoryScores)
            .filter(r => r.score >= 30 && r.confidence >= 0.4);
        
        if (candidates.length === 0) {
            return null;
        }
        
        // Tri optimisé
        return candidates.reduce((best, current) => {
            // Priorité aux mots absolus
            if (current.hasAbsolute && !best.hasAbsolute) return current;
            if (!current.hasAbsolute && best.hasAbsolute) return best;
            
            // Puis par score
            return current.score > best.score ? current : best;
        });
    }

    // ================================================
    // DÉTECTION CC OPTIMISÉE
    // ================================================
    isDefinitelyInCC(email) {
        // Vérification rapide
        if (!email.ccRecipients?.length || email.toRecipients?.length) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) {
            return false;
        }
        
        // Vérifier uniquement si on est SEULEMENT en CC
        const lowerEmail = currentUserEmail.toLowerCase();
        
        const inCC = email.ccRecipients.some(r => 
            r.emailAddress?.address?.toLowerCase() === lowerEmail
        );
        
        const inTO = email.toRecipients?.some(r => 
            r.emailAddress?.address?.toLowerCase() === lowerEmail
        ) || false;
        
        return inCC && !inTO;
    }

    // ================================================
    // SCAN PRINCIPAL OPTIMISÉ
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === STARTING OPTIMIZED SCAN v16.0 ===');
        
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

            // Étape 2: Catégorisation optimisée
            if (scanOptions.autoCategrize) {
                await this.categorizeEmailsOptimized();
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

    async categorizeEmailsOptimized() {
        const total = this.emails.length;
        console.log(`[EmailScanner] 🏷️ === CATEGORIZING ${total} EMAILS ===`);
        console.log('[EmailScanner] ⭐ Preselected categories:', this.taskPreselectedCategories);

        let processed = 0;
        const batchSize = this.config.batchSize;
        
        // Traiter par batches pour optimiser
        for (let i = 0; i < total; i += batchSize) {
            const batch = this.emails.slice(i, Math.min(i + batchSize, total));
            const batchStartTime = performance.now();
            
            // Catégoriser le batch
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
            
            const batchTime = performance.now() - batchStartTime;
            
            // Mise à jour du progrès
            if (this.scanProgress) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} (${percent}%)`,
                    progress: { current: processed, total }
                });
            }
            
            // Log batch performance
            if (this.config.debugMode) {
                console.log(`[EmailScanner] Batch ${Math.floor(i/batchSize)+1}: ${batch.length} emails in ${batchTime.toFixed(1)}ms`);
            }
            
            // Micro-pause entre batches si configuré
            if (this.config.categorizationDelay > 0 && i + batchSize < total) {
                await new Promise(resolve => setTimeout(resolve, this.config.categorizationDelay));
            }
        }

        console.log('[EmailScanner] ✅ Categorization complete');
        console.log(`[EmailScanner] 📊 Cache stats: ${this.metrics.cacheHits} hits, ${this.metrics.cacheMisses} misses`);
    }

    async analyzeForTasksOptimized() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] ⚠️ AITaskAnalyzer not available');
            return;
        }

        // Filtrer les emails à analyser
        const emailsToAnalyze = this.emails
            .filter(email => email.isPreselectedForTasks && email.categoryConfidence > 0.6)
            .sort((a, b) => b.categoryConfidence - a.categoryConfidence)
            .slice(0, 50); // Limiter pour la performance

        console.log(`[EmailScanner] 🤖 AI analysis for ${emailsToAnalyze.length} emails`);

        const concurrentLimit = this.config.maxConcurrentAnalysis;
        
        // Analyser par groupes concurrents
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

        // Calculer les statistiques
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
    // MÉTHODES UTILITAIRES
    // ================================================
    getEmailCacheKey(email) {
        // Clé de cache basée sur l'ID et le contenu principal
        return `${email.id}_${email.subject?.substring(0, 50)}_${email.from?.emailAddress?.address}`;
    }

    updateMetrics(startTime) {
        const categorizeTime = performance.now() - startTime;
        
        // Calculer la moyenne mobile
        const count = this.metrics.cacheHits + this.metrics.cacheMisses;
        this.metrics.avgCategorizeTime = 
            (this.metrics.avgCategorizeTime * (count - 1) + categorizeTime) / count;
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
        
        // Re-marquer les emails si nécessaire
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
        
        // Recharger les paramètres
        await this.loadSettingsFromCategoryManager();
        
        // Vider le cache de catégorisation
        this.categoryCache.clear();
        
        // Réinitialiser les catégories
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });
        
        // Réinitialiser les métriques
        this.metrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            avgCategorizeTime: 0
        };

        // Recatégoriser
        await this.categorizeEmailsOptimized();
        
        console.log('[EmailScanner] ✅ Recategorization complete');
        
        // Notifier
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
    // DÉTECTION SPAM OPTIMISÉE
    // ================================================
    isSpamEmail(email) {
        // Check rapide du dossier
        if (email.parentFolderId) {
            const folder = email.parentFolderId.toLowerCase();
            if (folder.includes('junk') || folder.includes('spam') || 
                folder.includes('unwanted') || folder.includes('indésirable')) {
                return true;
            }
        }
        
        // Check des catégories
        if (email.categories?.length) {
            return email.categories.some(cat => {
                const lower = cat.toLowerCase();
                return lower.includes('spam') || lower.includes('junk') || 
                       lower.includes('indésirable');
            });
        }
        
        return false;
    }

    // ================================================
    // UTILITAIRES OPTIMISÉS
    // ================================================
    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    getCurrentUserEmail() {
        // Cache statique pour éviter les recherches répétées
        if (this._currentUserEmail) {
            return this._currentUserEmail;
        }
        
        try {
            // Essayer localStorage
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                this._currentUserEmail = parsed.email || parsed.userPrincipalName || parsed.mail;
                return this._currentUserEmail;
            }
            
            // Essayer MSAL
            const msalAccounts = JSON.parse(localStorage.getItem('msal.account.keys') || '[]');
            if (msalAccounts.length > 0) {
                const firstAccount = localStorage.getItem(msalAccounts[0]);
                if (firstAccount) {
                    const account = JSON.parse(firstAccount);
                    this._currentUserEmail = account.username || account.preferred_username;
                    return this._currentUserEmail;
                }
            }
            
            // Essayer les services d'auth
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
            // Debounce pour éviter les appels multiples
            clearTimeout(this._recategorizeTimeout);
            this._recategorizeTimeout = setTimeout(() => {
                this.recategorizeEmails();
            }, 500);
        }
    }

    setupEventListeners() {
        // Écouter les changements de mots-clés
        window.addEventListener('keywordsUpdated', (event) => {
            if (this.emails.length > 0) {
                clearTimeout(this._keywordsTimeout);
                this._keywordsTimeout = setTimeout(() => {
                    this.recategorizeEmails();
                }, 300);
            }
        });
        
        // Écouter les changements de paramètres
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
    // EXPORT ET DEBUG
    // ================================================
    exportResults(format = 'json') {
        const results = this.buildResults({ provider: this.getCurrentProvider() });
        
        if (format === 'csv') {
            // Export CSV
            let csv = 'Date,De,Sujet,Catégorie,Score,Confiance,Pré-sélectionné\n';
            
            this.emails.forEach(email => {
                const date = new Date(email.receivedDateTime).toLocaleDateString('fr-FR');
                const from = email.from?.emailAddress?.address || '';
                const subject = (email.subject || '').replace(/"/g, '""');
                const category = email.category || 'other';
                const score = email.categoryScore || 0;
                const confidence = Math.round((email.categoryConfidence || 0) * 100);
                const preselected = email.isPreselectedForTasks ? 'Oui' : 'Non';
                
                csv += `"${date}","${from}","${subject}","${category}","${score}","${confidence}%","${preselected}"\n`;
            });
            
            // Télécharger
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `scan_emails_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            console.log('[EmailScanner] 📄 CSV export completed');
            
        } else {
            // Export JSON
            const data = JSON.stringify(results, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `scan_emails_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            console.log('[EmailScanner] 📄 JSON export completed');
        }
    }

    getCurrentProvider() {
        return window.mailService?.getCurrentProvider() || 'unknown';
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
            version: '16.0'
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
        // Nettoyer les listeners
        if (this.changeListener && typeof this.changeListener === 'function') {
            this.changeListener();
        }
        
        // Nettoyer les timeouts
        clearTimeout(this._recategorizeTimeout);
        clearTimeout(this._keywordsTimeout);
        
        // Vider les données
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

console.log('✅ EmailScanner v16.0 loaded - Optimized');
console.log('🚀 Performance improvements: caching, batch processing, optimized algorithms');
console.log('📊 Metrics tracking enabled for performance monitoring');
