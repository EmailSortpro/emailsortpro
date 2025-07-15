// EmailScanner.js - Version 13.0 - Intégration améliorée avec CategoryManager v23
// Détection newsletter/marketing optimisée et extraction de contenu complète

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        
        // Provider tracking amélioré
        this.currentProvider = null;
        this.providerMetadata = {
            gmail: {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#4285f4'
            },
            outlook: {
                name: 'Outlook', 
                icon: 'fab fa-microsoft',
                color: '#0078d4'
            }
        };
        
        // Système de synchronisation amélioré
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.syncCheckInterval = null;
        this.categoryManagerListener = null;
        
        // Cache pour optimisation
        this._categoriesCache = null;
        this._categoriesCacheTime = 0;
        
        // Métriques de scan
        this.scanMetrics = {
            startTime: null,
            endTime: null,
            totalEmails: 0,
            categorizedCount: 0,
            preselectedCount: 0,
            categoryDistribution: {},
            provider: null,
            errors: [],
            newsletterCount: 0 // Nouveau compteur
        };
        
        console.log('[EmailScanner] ✅ Version 13.0 - Intégration CategoryManager v23');
        this.initialize();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        console.log('[EmailScanner] 🔧 Initialisation...');
        
        try {
            // 1. Vérifier CategoryManager v23
            if (!window.categoryManager) {
                console.error('[EmailScanner] ❌ CategoryManager non disponible!');
                return;
            }
            
            // 2. Charger les paramètres depuis CategoryManager
            await this.loadSettings();
            
            // 3. S'abonner aux changements de CategoryManager
            this.subscribeToCategoryManager();
            
            // 4. Démarrer la vérification de synchronisation
            this.startSyncCheck();
            
            // 5. Setup event listeners
            this.setupEventListeners();
            
            console.log('[EmailScanner] ✅ Initialisation terminée');
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur initialisation:', error);
        }
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
    // ================================================
    async loadSettings() {
        console.log('[EmailScanner] 📋 Chargement des paramètres...');
        
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            try {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
                this.lastSettingsSync = Date.now();
                return true;
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur chargement CategoryManager:', error);
            }
        }
        
        // Fallback vers localStorage
        return this.loadSettingsFromStorage();
    }

    loadSettingsFromStorage() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = JSON.parse(saved);
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[EmailScanner] 📦 Paramètres chargés depuis localStorage');
            } else {
                this.settings = this.getDefaultSettings();
                this.taskPreselectedCategories = [];
                console.log('[EmailScanner] 📝 Utilisation paramètres par défaut');
            }
            this.lastSettingsSync = Date.now();
            return true;
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur chargement storage:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
            return false;
        }
    }

    getDefaultSettings() {
        return {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true,
                maxEmails: -1 // Pas de limite par défaut
            },
            taskPreselectedCategories: [],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            }
        };
    }

    // ================================================
    // ABONNEMENT AUX CHANGEMENTS
    // ================================================
    subscribeToCategoryManager() {
        if (!window.categoryManager || typeof window.categoryManager.addChangeListener !== 'function') {
            console.warn('[EmailScanner] ⚠️ CategoryManager non disponible pour abonnement');
            return;
        }
        
        // Désabonner l'ancien listener si existant
        if (this.categoryManagerListener) {
            this.categoryManagerListener();
        }
        
        // S'abonner aux changements
        this.categoryManagerListener = window.categoryManager.addChangeListener((type, value) => {
            console.log(`[EmailScanner] 📨 Changement reçu: ${type}`);
            this.handleCategoryManagerChange(type, value);
        });
        
        console.log('[EmailScanner] 👂 Abonné aux changements CategoryManager');
    }

    handleCategoryManagerChange(type, value) {
        switch (type) {
            case 'taskPreselectedCategories':
                const oldCategories = [...this.taskPreselectedCategories];
                this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
                console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées mises à jour:', this.taskPreselectedCategories);
                
                // Recatégoriser si nécessaire
                if (this.emails.length > 0 && this.hasSignificantChange(oldCategories, this.taskPreselectedCategories)) {
                    this.recategorizeEmails();
                }
                break;
                
            case 'settings':
                this.settings = { ...this.settings, ...value };
                break;
        }
        
        this.lastSettingsSync = Date.now();
    }

    hasSignificantChange(oldArray, newArray) {
        if (oldArray.length !== newArray.length) return true;
        const oldSet = new Set(oldArray);
        return newArray.some(item => !oldSet.has(item));
    }

    // ================================================
    // VÉRIFICATION DE SYNCHRONISATION
    // ================================================
    startSyncCheck() {
        // Vérifier la synchronisation toutes les 5 secondes
        this.syncCheckInterval = setInterval(() => {
            this.checkSync();
        }, 5000);
    }

    async checkSync() {
        if (!window.categoryManager) return;
        
        try {
            const currentCategories = window.categoryManager.getTaskPreselectedCategories();
            
            if (this.hasSignificantChange(this.taskPreselectedCategories, currentCategories)) {
                console.log('[EmailScanner] 🔄 Désynchronisation détectée, mise à jour...');
                this.taskPreselectedCategories = [...currentCategories];
                
                if (this.emails.length > 0) {
                    await this.recategorizeEmails();
                }
            }
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur vérification sync:', error);
        }
    }

    // ================================================
    // MÉTHODE SCAN PRINCIPALE
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v13.0 ===');
        
        if (this.isScanning) {
            console.warn('[EmailScanner] ⚠️ Scan déjà en cours');
            return null;
        }
        
        try {
            this.isScanning = true;
            this.resetScanMetrics();
            
            // Synchroniser avant le scan
            await this.loadSettings();
            
            // Détecter le provider
            this.currentProvider = options.provider || this.detectCurrentProvider();
            console.log('[EmailScanner] 📧 Provider:', this.currentProvider);
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
            // Préparer les options de scan
            const scanOptions = this.prepareScanOptions(options);
            
            // Étape 1: Récupérer les emails
            this.updateProgress(scanOptions.onProgress, 'fetching', 'Récupération des emails...', 0);
            const emails = await this.fetchEmails(scanOptions);
            
            this.emails = emails || [];
            this.scanMetrics.totalEmails = this.emails.length;
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés`);
            
            if (this.emails.length === 0) {
                return this.buildResults('empty');
            }
            
            // Étape 2: Enrichir le contenu des emails
            await this.enrichEmailContent(scanOptions);
            
            // Étape 3: Catégoriser les emails
            if (scanOptions.autoCategrize !== false) {
                await this.categorizeAllEmails(scanOptions);
            }
            
            // Étape 4: Analyse IA (optionnelle)
            if (scanOptions.autoAnalyze && window.aiTaskAnalyzer) {
                await this.analyzeForTasks(scanOptions);
            }
            
            // Construire les résultats
            const results = this.buildResults('success');
            
            console.log('[EmailScanner] 🎉 === SCAN TERMINÉ ===');
            console.log('[EmailScanner] 📊 Résultats:', {
                total: results.total,
                categorized: results.categorized,
                newsletters: results.stats.newsletterCount,
                preselected: results.stats.preselectedForTasks,
                duration: results.stats.scanDuration
            });
            
            // Notifier les autres modules
            this.notifyScanComplete(results);
            
            return results;
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur scan:', error);
            this.scanMetrics.errors.push(error.message);
            
            if (options.onProgress) {
                options.onProgress({
                    phase: 'error',
                    message: error.message,
                    error: error
                });
            }
            
            return this.buildResults('error', error);
            
        } finally {
            this.isScanning = false;
            this.scanMetrics.endTime = Date.now();
        }
    }

    // ================================================
    // ENRICHISSEMENT DU CONTENU - NOUVEAU
    // ================================================
    async enrichEmailContent(options) {
        console.log('[EmailScanner] 🔍 Enrichissement du contenu des emails...');
        
        let enriched = 0;
        const batchSize = 10;
        
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            await Promise.all(batch.map(async (email) => {
                try {
                    // S'assurer que chaque email a le contenu complet
                    if (!email.fullTextContent) {
                        email.fullTextContent = this.buildFullTextContent(email);
                        enriched++;
                    }
                    
                    // Ajouter les métadonnées du provider
                    email.provider = email.provider || this.currentProvider;
                    email.providerType = email.providerType || this.currentProvider;
                    
                } catch (error) {
                    console.error('[EmailScanner] Erreur enrichissement:', error);
                }
            }));
            
            // Mettre à jour le progrès
            if (options.onProgress) {
                const percent = Math.round(((i + batch.length) / this.emails.length) * 20); // 20% pour enrichissement
                this.updateProgress(options.onProgress, 'enriching', 
                    `Enrichissement: ${i + batch.length}/${this.emails.length}`, percent);
            }
        }
        
        console.log(`[EmailScanner] ✅ ${enriched} emails enrichis`);
    }

    buildFullTextContent(email) {
        let fullText = '';
        
        // 1. Sujet (important, répété pour augmenter le poids)
        if (email.subject) {
            fullText += email.subject + ' ' + email.subject + ' ' + email.subject + '\n\n';
        }
        
        // 2. Expéditeur
        if (email.from?.emailAddress) {
            const fromEmail = email.from.emailAddress.address || '';
            const fromName = email.from.emailAddress.name || '';
            fullText += `De: ${fromName} <${fromEmail}>\n`;
            if (fromEmail.includes('@')) {
                const domain = fromEmail.split('@')[1];
                fullText += `Domaine: ${domain}\n`;
            }
        }
        
        // 3. Date
        if (email.receivedDateTime) {
            fullText += `Date: ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}\n`;
        }
        
        // 4. Corps du message
        if (email.body?.content) {
            // Inclure le HTML brut pour détecter les patterns
            fullText += '\n[HTML_CONTENT]\n' + email.body.content + '\n[/HTML_CONTENT]\n';
            
            // Extraire le texte propre
            const cleanText = this.extractTextFromHtml(email.body.content);
            fullText += '\n[TEXT_CONTENT]\n' + cleanText + '\n[/TEXT_CONTENT]\n';
        } else if (email.bodyText) {
            fullText += '\n[TEXT_CONTENT]\n' + email.bodyText + '\n[/TEXT_CONTENT]\n';
        } else if (email.bodyPreview) {
            fullText += '\n[PREVIEW]\n' + email.bodyPreview + '\n[/PREVIEW]\n';
        }
        
        // 5. Snippet Gmail
        if (email.gmailMetadata?.snippet) {
            fullText += '\n[SNIPPET]\n' + email.gmailMetadata.snippet + '\n[/SNIPPET]\n';
        }
        
        // 6. Métadonnées
        if (email.hasAttachments) {
            fullText += '\n[ATTACHMENTS]';
        }
        
        if (email.importance === 'high') {
            fullText += '\n[HIGH_PRIORITY]';
        }
        
        // 7. Labels Gmail
        if (email.labelIds && Array.isArray(email.labelIds)) {
            fullText += '\n[LABELS]\n';
            email.labelIds.forEach(label => {
                fullText += label + ' ';
            });
            fullText += '\n[/LABELS]\n';
        }
        
        return fullText;
    }

    extractTextFromHtml(html) {
        if (!html) return '';
        
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Supprimer les éléments non textuels
            const elementsToRemove = tempDiv.querySelectorAll('script, style, noscript, iframe, object, embed');
            elementsToRemove.forEach(el => el.remove());
            
            // Préserver les sauts de ligne
            tempDiv.querySelectorAll('br').forEach(br => {
                br.replaceWith('\n');
            });
            
            tempDiv.querySelectorAll('p, div, li, tr, h1, h2, h3, h4, h5, h6').forEach(el => {
                if (el.textContent.trim()) {
                    el.innerHTML = el.innerHTML + '\n';
                }
            });
            
            // Extraire le texte
            let text = tempDiv.textContent || tempDiv.innerText || '';
            
            // Nettoyer
            text = text
                .replace(/\n{3,}/g, '\n\n')
                .replace(/[ \t]+/g, ' ')
                .trim();
            
            return text;
        } catch (error) {
            console.warn('[EmailScanner] Erreur extraction HTML:', error);
            return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }

    // ================================================
    // DÉTECTION DU PROVIDER
    // ================================================
    detectCurrentProvider() {
        // Vérifier GoogleAuthService
        if (window.googleAuthService?.isAuthenticated?.()) {
            return 'gmail';
        }
        
        // Vérifier AuthService (Outlook)
        if (window.authService?.isAuthenticated?.()) {
            return 'outlook';
        }
        
        // Vérifier MailService
        if (window.mailService?.getCurrentProvider) {
            const provider = window.mailService.getCurrentProvider();
            if (provider === 'google' || provider === 'gmail') return 'gmail';
            if (provider === 'microsoft' || provider === 'outlook') return 'outlook';
        }
        
        return 'unknown';
    }

    // ================================================
    // PRÉPARATION DES OPTIONS
    // ================================================
    prepareScanOptions(options) {
        const defaults = this.settings.scanSettings || {};
        
        return {
            days: options.days ?? defaults.defaultPeriod ?? 7,
            folder: options.folder || defaults.defaultFolder || 'inbox',
            maxEmails: options.maxEmails ?? defaults.maxEmails ?? -1,
            autoAnalyze: options.autoAnalyze ?? defaults.autoAnalyze ?? true,
            autoCategrize: options.autoCategrize ?? defaults.autoCategrize ?? true,
            includeSpam: options.includeSpam ?? !this.settings.preferences?.excludeSpam,
            detectCC: options.detectCC ?? this.settings.preferences?.detectCC ?? true,
            onProgress: options.onProgress,
            provider: this.currentProvider
        };
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS
    // ================================================
    async fetchEmails(options) {
        console.log('[EmailScanner] 📬 Récupération des emails...');
        
        // Vérifier MailService
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }
        
        // Initialiser si nécessaire
        if (!window.mailService.isInitialized()) {
            await window.mailService.initialize();
        }
        
        // Configurer le provider
        const currentProvider = window.mailService.getCurrentProvider();
        if (currentProvider !== this.currentProvider) {
            await window.mailService.setProvider(this.currentProvider);
        }
        
        // Récupérer les emails
        const emails = await window.mailService.getMessages(options.folder, {
            maxResults: options.maxEmails,
            days: options.days,
            includeSpam: options.includeSpam,
            includeFullContent: true, // IMPORTANT: demander le contenu complet
            onProgress: (progress) => {
                if (options.onProgress) {
                    options.onProgress({
                        phase: 'fetching',
                        message: progress.message || 'Récupération des emails...',
                        progress: progress
                    });
                }
            }
        });
        
        // S'assurer que tous les emails ont le provider marqué
        return emails.map(email => ({
            ...email,
            provider: email.provider || this.currentProvider,
            providerType: email.providerType || this.currentProvider
        }));
    }

    // ================================================
    // CATÉGORISATION DES EMAILS - AMÉLIORÉE
    // ================================================
    async categorizeAllEmails(options) {
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION v13.0 ===');
        console.log('[EmailScanner] 📊 Total emails:', this.emails.length);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        // Réinitialiser les catégories
        this.categorizedEmails = {};
        this.scanMetrics.categoryDistribution = {};
        this.scanMetrics.newsletterCount = 0;
        
        let processed = 0;
        let preselectedCount = 0;
        let newsletterCount = 0;
        
        // Catégoriser par batch pour les performances
        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // Catégoriser l'email avec CategoryManager v23
                    const result = await this.categorizeEmail(email);
                    
                    // Ajouter à la catégorie
                    if (!this.categorizedEmails[result.category]) {
                        this.categorizedEmails[result.category] = [];
                    }
                    this.categorizedEmails[result.category].push(email);
                    
                    // Mettre à jour les stats
                    this.scanMetrics.categoryDistribution[result.category] = 
                        (this.scanMetrics.categoryDistribution[result.category] || 0) + 1;
                    
                    if (email.isPreselectedForTasks) {
                        preselectedCount++;
                    }
                    
                    if (result.category === 'marketing_news') {
                        newsletterCount++;
                    }
                    
                    processed++;
                    
                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation:', error);
                    email.category = 'other';
                    email.categoryError = error.message;
                    
                    if (!this.categorizedEmails.other) {
                        this.categorizedEmails.other = [];
                    }
                    this.categorizedEmails.other.push(email);
                }
            }
            
            // Mettre à jour le progrès
            if (options.onProgress) {
                const percent = 20 + Math.round((processed / this.emails.length) * 60); // 20-80% pour catégorisation
                this.updateProgress(options.onProgress, 'categorizing', 
                    `Catégorisation: ${processed}/${this.emails.length} (${percent - 20}%)`, percent);
            }
            
            // Pause pour ne pas bloquer l'UI
            if (i + batchSize < this.emails.length) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.preselectedCount = preselectedCount;
        this.scanMetrics.newsletterCount = newsletterCount;
        
        console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
        console.log('[EmailScanner] 📊 Distribution:', this.scanMetrics.categoryDistribution);
        console.log('[EmailScanner] 📰 Newsletters détectées:', newsletterCount);
        console.log('[EmailScanner] ⭐ Emails pré-sélectionnés:', preselectedCount);
    }

    // ================================================
    // CATÉGORISATION D'UN EMAIL
    // ================================================
    async categorizeEmail(email) {
        // S'assurer que l'email a le contenu complet
        if (!email.fullTextContent) {
            email.fullTextContent = this.buildFullTextContent(email);
        }
        
        // Utiliser CategoryManager v23 pour l'analyse
        if (!window.categoryManager || typeof window.categoryManager.analyzeEmail !== 'function') {
            email.category = 'other';
            email.categoryScore = 0;
            email.categoryConfidence = 0;
            email.isPreselectedForTasks = false;
            return { category: 'other' };
        }
        
        // Analyser l'email avec le nouveau CategoryManager
        const analysis = window.categoryManager.analyzeEmail(email);
        
        // Appliquer les résultats
        email.category = analysis.category || 'other';
        email.categoryScore = analysis.score || 0;
        email.categoryConfidence = analysis.confidence || 0;
        email.matchedPatterns = analysis.matchedPatterns || [];
        email.hasAbsolute = analysis.hasAbsolute || false;
        
        // Vérifier si pré-sélectionné pour les tâches
        email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
        
        // Debug pour les newsletters
        if (email.category === 'marketing_news') {
            console.log('[EmailScanner] 📰 Newsletter détectée:', {
                subject: email.subject,
                from: email.from?.emailAddress?.address,
                score: email.categoryScore,
                patterns: email.matchedPatterns
            });
        }
        
        return analysis;
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES
    // ================================================
    async analyzeForTasks(options) {
        console.log('[EmailScanner] 🤖 Analyse IA des emails...');
        
        // Sélectionner les emails à analyser
        const emailsToAnalyze = this.selectEmailsForAIAnalysis();
        
        if (emailsToAnalyze.length === 0) {
            console.log('[EmailScanner] ⚠️ Aucun email à analyser');
            return;
        }
        
        console.log(`[EmailScanner] 📊 ${emailsToAnalyze.length} emails à analyser`);
        
        let analyzed = 0;
        for (const email of emailsToAnalyze) {
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = !!analysis?.mainTask?.title;
                analyzed++;
                
                if (options.onProgress) {
                    const percent = 80 + Math.round((analyzed / emailsToAnalyze.length) * 20); // 80-100%
                    this.updateProgress(options.onProgress, 'analyzing',
                        `Analyse IA: ${analyzed}/${emailsToAnalyze.length}`, percent);
                }
                
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur analyse IA:', error);
                email.aiAnalysisError = error.message;
            }
            
            // Pause entre les analyses
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('[EmailScanner] ✅ Analyse IA terminée');
    }

    selectEmailsForAIAnalysis() {
        // Exclure les newsletters de l'analyse IA
        const nonNewsletters = this.emails.filter(e => e.category !== 'marketing_news');
        
        // Priorité 1: Emails pré-sélectionnés avec haute confiance (sauf newsletters)
        const preselected = nonNewsletters.filter(e => 
            e.isPreselectedForTasks && e.categoryConfidence > 0.7
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        // Priorité 2: Autres emails haute confiance (sauf newsletters)
        const highConfidence = nonNewsletters.filter(e =>
            !e.isPreselectedForTasks && e.categoryConfidence > 0.8
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        // Limiter à 10 emails au total
        return [...preselected.slice(0, 10), ...highConfidence.slice(0, Math.max(0, 10 - preselected.length))];
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
        
        this.resetScanMetrics();
        
        await this.categorizeAllEmails({
            onProgress: (progress) => {
                console.log(`[EmailScanner] ${progress.message}`);
            }
        });
        
        const results = this.buildResults('recategorized');
        
        console.log('[EmailScanner] ✅ Re-catégorisation terminée');
        
        // Notifier les modules
        this.notifyRecategorization(results);
    }

    // ================================================
    // CONSTRUCTION DES RÉSULTATS
    // ================================================
    buildResults(status, error = null) {
        const stats = {
            processed: this.scanMetrics.categorizedCount,
            errors: this.scanMetrics.errors.length,
            preselectedForTasks: this.scanMetrics.preselectedCount,
            newsletterCount: this.scanMetrics.newsletterCount,
            highConfidence: this.emails.filter(e => e.categoryConfidence >= 0.8).length,
            taskSuggestions: this.emails.filter(e => e.taskSuggested).length,
            scanDuration: this.scanMetrics.endTime ? 
                Math.round((this.scanMetrics.endTime - this.scanMetrics.startTime) / 1000) : 0
        };
        
        return {
            success: status !== 'error',
            status: status,
            total: this.emails.length,
            categorized: this.scanMetrics.categorizedCount,
            breakdown: { ...this.scanMetrics.categoryDistribution },
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: stats,
            emails: this.emails,
            provider: this.currentProvider,
            error: error,
            timestamp: Date.now()
        };
    }

    // ================================================
    // NOTIFICATIONS
    // ================================================
    notifyScanComplete(results) {
        window.dispatchEvent(new CustomEvent('scanCompleted', {
            detail: {
                ...results,
                source: 'EmailScanner',
                provider: this.currentProvider
            }
        }));
    }

    notifyRecategorization(results) {
        window.dispatchEvent(new CustomEvent('emailsRecategorized', {
            detail: {
                ...results,
                source: 'EmailScanner',
                provider: this.currentProvider
            }
        }));
    }

    // ================================================
    // MÉTHODES D'ACCÈS
    // ================================================
    getEmails() {
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

    getNewsletterEmails() {
        return this.emails.filter(email => email.category === 'marketing_news');
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    getCategorizedEmails() {
        return { ...this.categorizedEmails };
    }

    getCategories() {
        if (this._categoriesCache && (Date.now() - this._categoriesCacheTime) < 30000) {
            return this._categoriesCache;
        }
        
        if (window.categoryManager?.getCategories) {
            this._categoriesCache = window.categoryManager.getCategories();
            this._categoriesCacheTime = Date.now();
            return this._categoriesCache;
        }
        
        return {};
    }

    getTaskPreselectedCategories() {
        // Toujours retourner la version synchronisée
        if (window.categoryManager?.getTaskPreselectedCategories) {
            const fresh = window.categoryManager.getTaskPreselectedCategories();
            // Mettre à jour si différent
            if (this.hasSignificantChange(this.taskPreselectedCategories, fresh)) {
                this.taskPreselectedCategories = [...fresh];
            }
        }
        return [...this.taskPreselectedCategories];
    }

    getCurrentProvider() {
        return this.currentProvider;
    }

    getSettings() {
        return { ...this.settings };
    }

    getScanMetrics() {
        return { ...this.scanMetrics };
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    updateProgress(callback, phase, message, percent = 0) {
        if (!callback) return;
        
        callback({
            phase: phase,
            message: message,
            progress: {
                current: percent,
                total: 100
            }
        });
    }

    resetScanMetrics() {
        this.scanMetrics = {
            startTime: Date.now(),
            endTime: null,
            totalEmails: 0,
            categorizedCount: 0,
            preselectedCount: 0,
            newsletterCount: 0,
            categoryDistribution: {},
            provider: this.currentProvider,
            errors: []
        };
    }

    setupEventListeners() {
        if (this.eventListenersSetup) return;
        
        // Écouter les mises à jour de mots-clés
        window.addEventListener('keywordsUpdated', (event) => {
            console.log('[EmailScanner] 🔑 Mots-clés mis à jour');
            if (this.emails.length > 0) {
                setTimeout(() => this.recategorizeEmails(), 200);
            }
        });
        
        // Écouter les demandes de synchronisation
        window.addEventListener('forceSynchronization', () => {
            console.log('[EmailScanner] 🚀 Synchronisation forcée');
            this.loadSettings().then(() => {
                if (this.emails.length > 0) {
                    this.recategorizeEmails();
                }
            });
        });
        
        this.eventListenersSetup = true;
        console.log('[EmailScanner] ✅ Event listeners configurés');
    }

    // ================================================
    // EXPORT
    // ================================================
    exportToCSV() {
        const headers = [
            'Date', 'Provider', 'De', 'Email', 'Sujet', 'Catégorie', 
            'Confiance', 'Score', 'Pré-sélectionné', 'Newsletter', 'Tâche suggérée'
        ];
        
        const rows = [headers];
        
        this.emails.forEach(email => {
            const category = this.getCategories()[email.category];
            rows.push([
                new Date(email.receivedDateTime).toLocaleString('fr-FR'),
                email.provider || 'unknown',
                email.from?.emailAddress?.name || '',
                email.from?.emailAddress?.address || '',
                email.subject || 'Sans sujet',
                category?.name || email.category || 'other',
                Math.round((email.categoryConfidence || 0) * 100) + '%',
                email.categoryScore || 0,
                email.isPreselectedForTasks ? 'Oui' : 'Non',
                email.category === 'marketing_news' ? 'Oui' : 'Non',
                email.taskSuggested ? 'Oui' : 'Non'
            ]);
        });
        
        const csv = rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        return '\ufeff' + csv; // BOM pour Excel
    }

    exportResults(format = 'csv') {
        console.log('[EmailScanner] 📤 Export des résultats');
        
        if (this.emails.length === 0) {
            console.warn('[EmailScanner] ⚠️ Aucune donnée à exporter');
            return;
        }
        
        try {
            let content, filename, mimeType;
            
            if (format === 'csv') {
                content = this.exportToCSV();
                filename = `email_scan_${this.currentProvider}_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv;charset=utf-8;';
            } else {
                content = JSON.stringify(this.buildResults('export'), null, 2);
                filename = `email_scan_${this.currentProvider}_${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json;charset=utf-8;';
            }
            
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails exportés`);
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur export:', error);
        }
    }

    // ================================================
    // DEBUG
    // ================================================
    getDebugInfo() {
        return {
            version: '13.0',
            isScanning: this.isScanning,
            currentProvider: this.currentProvider,
            totalEmails: this.emails.length,
            categorizedCount: this.scanMetrics.categorizedCount,
            newsletterCount: this.scanMetrics.newsletterCount,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedCount: this.getPreselectedEmails().length,
            settings: this.settings,
            lastSync: new Date(this.lastSettingsSync).toISOString(),
            categoryManagerAvailable: !!window.categoryManager,
            categoryManagerVersion: window.categoryManager?.getDebugInfo?.()?.version,
            mailServiceAvailable: !!window.mailService,
            metrics: this.scanMetrics
        };
    }

    testCategorization() {
        console.group('🧪 TEST Catégorisation EmailScanner v13.0');
        
        const testEmails = [
            {
                id: 'test1',
                subject: 'Introducing your new dining feed',
                from: { emailAddress: { address: 'info@news.thefork.co.uk', name: 'TheFork' } },
                body: { content: 'Unsubscribe | All rights reserved | You received this email because' }
            },
            {
                id: 'test2',
                subject: 'SUMMER SAVINGS: 1000X Series Earbuds',
                from: { emailAddress: { address: 'sonyeurope@bmail.sony-europe.com', name: 'Sony' } },
                body: { content: 'Unsubscribe Contact Us | View online | Update your e-mail preferences' }
            },
            {
                id: 'test3',
                subject: 'Facture #12345 - À payer',
                from: { emailAddress: { address: 'billing@company.com', name: 'Company Billing' } },
                body: { content: 'Montant total: 150€ | Échéance: 31/01/2025' }
            }
        ];
        
        console.log('Testing email categorization with full content...\n');
        
        testEmails.forEach(async (email) => {
            email.fullTextContent = this.buildFullTextContent(email);
            const result = await this.categorizeEmail(email);
            console.log(`📧 "${email.subject}"`);
            console.log(`   From: ${email.from.emailAddress.address}`);
            console.log(`   Category: ${result.category} (Score: ${result.score}, Confidence: ${Math.round(result.confidence * 100)}%)`);
            console.log('');
        });
        
        console.groupEnd();
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        // Arrêter la vérification de sync
        if (this.syncCheckInterval) {
            clearInterval(this.syncCheckInterval);
            this.syncCheckInterval = null;
        }
        
        // Désabonner de CategoryManager
        if (this.categoryManagerListener) {
            this.categoryManagerListener();
            this.categoryManagerListener = null;
        }
        
        // Nettoyer les données
        this.emails = [];
        this.categorizedEmails = {};
        this._categoriesCache = null;
        
        console.log('[EmailScanner] 🧹 Nettoyage effectué');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.currentProvider = null;
        console.log('[EmailScanner] Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.emailScanner) {
    window.emailScanner.destroy?.();
}

window.emailScanner = new EmailScanner();

// Fonctions de test globales
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v13.0');
    
    const info = window.emailScanner.getDebugInfo();
    console.log('Debug Info:', info);
    
    console.log('Catégories pré-sélectionnées:', window.emailScanner.getTaskPreselectedCategories());
    console.log('Provider actuel:', window.emailScanner.getCurrentProvider());
    
    // Test de catégorisation
    window.emailScanner.testCategorization();
    
    console.groupEnd();
    
    return info;
};

console.log('✅ EmailScanner v13.0 loaded - Intégration CategoryManager v23');
