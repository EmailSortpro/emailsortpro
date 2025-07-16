// EmailScanner.js - Version 15.0 - Intégration optimisée avec CategoryManager v26
// Extraction de contenu complète et gestion améliorée des newsletters

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        
        // Provider tracking
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
        
        // Système de synchronisation
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
            newsletterCount: 0,
            debugInfo: []
        };
        
        console.log('[EmailScanner] ✅ Version 15.0 - Intégration CategoryManager v26');
        this.initialize();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        console.log('[EmailScanner] 🔧 Initialisation...');
        
        try {
            // 1. Attendre CategoryManager
            let attempts = 0;
            while (!window.categoryManager && attempts < 20) {
                console.log('[EmailScanner] ⏳ Attente de CategoryManager...', attempts + 1);
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }
            
            if (!window.categoryManager) {
                console.error('[EmailScanner] ❌ CategoryManager non disponible!');
            } else {
                console.log('[EmailScanner] ✅ CategoryManager v26 trouvé');
            }
            
            // 2. Charger les paramètres
            await this.loadSettings();
            
            // 3. S'abonner aux changements
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
                maxEmails: -1
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
        
        if (this.categoryManagerListener) {
            this.categoryManagerListener();
        }
        
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
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v15.0 ===');
        
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
            
            // Préparer les options
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
            
            // Étape 2: Vérifier le contenu complet
            console.log('[EmailScanner] 📋 Vérification du contenu complet...');
            await this.ensureFullContent(scanOptions);
            
            // Étape 3: Catégoriser avec CategoryManager v26
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
            
            // Debug des newsletters mal catégorisées
            if (window.debugNewsletters) {
                this.debugNewsletterCategorization();
            }
            
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
    // DÉTECTION DU PROVIDER
    // ================================================
    detectCurrentProvider() {
        if (window.mailService?.getCurrentProvider) {
            const provider = window.mailService.getCurrentProvider();
            if (provider === 'google' || provider === 'gmail') return 'gmail';
            if (provider === 'microsoft' || provider === 'outlook') return 'outlook';
            return provider;
        }
        
        if (window.googleAuthService?.isAuthenticated?.()) {
            return 'gmail';
        }
        
        if (window.authService?.isAuthenticated?.()) {
            return 'outlook';
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
        console.log('[EmailScanner] 📬 Récupération des emails via MailService...');
        
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }
        
        if (!window.mailService.isInitialized()) {
            await window.mailService.initialize();
        }
        
        const emails = await window.mailService.getMessages(options.folder, {
            maxResults: options.maxEmails,
            days: options.days,
            includeSpam: options.includeSpam,
            includeFullContent: true,
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
        
        return emails.map(email => ({
            ...email,
            provider: email.provider || this.currentProvider,
            providerType: email.providerType || this.currentProvider
        }));
    }

    // ================================================
    // ASSURER LE CONTENU COMPLET
    // ================================================
    async ensureFullContent(options) {
        let emailsWithContent = 0;
        let emailsNeedingContent = [];
        
        this.emails.forEach(email => {
            if (email.fullTextContent && email.fullTextContent.trim()) {
                emailsWithContent++;
            } else {
                emailsNeedingContent.push(email);
            }
        });
        
        console.log(`[EmailScanner] 📊 ${emailsWithContent}/${this.emails.length} emails avec contenu complet`);
        
        if (emailsNeedingContent.length > 0) {
            console.log(`[EmailScanner] 🔧 Construction du contenu pour ${emailsNeedingContent.length} emails...`);
            
            for (const email of emailsNeedingContent) {
                email.fullTextContent = this.buildFullTextContent(email);
            }
        }
    }

    // ================================================
    // CATÉGORISATION DES EMAILS
    // ================================================
    async categorizeAllEmails(options) {
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION v15.0 ===');
        console.log('[EmailScanner] 📊 Total emails:', this.emails.length);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        // Réinitialiser
        this.categorizedEmails = {};
        this.scanMetrics.categoryDistribution = {};
        this.scanMetrics.newsletterCount = 0;
        this.scanMetrics.debugInfo = [];
        
        let processed = 0;
        let preselectedCount = 0;
        let newsletterCount = 0;
        
        // Catégoriser par batch
        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // Catégoriser avec CategoryManager v26
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
                        
                        // Debug info pour newsletters
                        this.scanMetrics.debugInfo.push({
                            subject: email.subject,
                            from: email.from?.emailAddress?.address,
                            category: result.category,
                            score: email.categoryScore,
                            confidence: email.categoryConfidence,
                            patterns: email.matchedPatterns?.slice(0, 3)
                        });
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
                const percent = 20 + Math.round((processed / this.emails.length) * 60);
                this.updateProgress(options.onProgress, 'categorizing', 
                    `Catégorisation: ${processed}/${this.emails.length} (${newsletterCount} newsletters)`, percent);
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
        // S'assurer du contenu complet
        if (!email.fullTextContent) {
            email.fullTextContent = this.buildFullTextContent(email);
        }
        
        // Utiliser CategoryManager v26
        if (!window.categoryManager || typeof window.categoryManager.analyzeEmail !== 'function') {
            console.warn('[EmailScanner] ⚠️ CategoryManager non disponible');
            email.category = 'other';
            email.categoryScore = 0;
            email.categoryConfidence = 0;
            email.isPreselectedForTasks = false;
            return { category: 'other' };
        }
        
        // Analyser avec CategoryManager v26
        const analysis = window.categoryManager.analyzeEmail(email);
        
        // Appliquer les résultats
        email.category = analysis.category || 'other';
        email.categoryScore = analysis.score || 0;
        email.categoryConfidence = analysis.confidence || 0;
        email.matchedPatterns = analysis.matchedPatterns || [];
        email.hasAbsolute = analysis.hasAbsolute || false;
        
        // Vérifier si pré-sélectionné
        email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
        
        return analysis;
    }

    // ================================================
    // CONSTRUCTION DU CONTENU COMPLET
    // ================================================
    buildFullTextContent(email) {
        let fullText = '';
        
        // 1. Sujet (répété pour le poids)
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
            fullText += '\n[HTML_CONTENT]\n' + email.body.content + '\n[/HTML_CONTENT]\n';
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
            const elementsToRemove = tempDiv.querySelectorAll('script, style, noscript, iframe, object, embed, meta, link');
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
    // ANALYSE IA POUR TÂCHES
    // ================================================
    async analyzeForTasks(options) {
        console.log('[EmailScanner] 🤖 Analyse IA des emails...');
        
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
                    const percent = 80 + Math.round((analyzed / emailsToAnalyze.length) * 20);
                    this.updateProgress(options.onProgress, 'analyzing',
                        `Analyse IA: ${analyzed}/${emailsToAnalyze.length}`, percent);
                }
                
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur analyse IA:', error);
                email.aiAnalysisError = error.message;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('[EmailScanner] ✅ Analyse IA terminée');
    }

    selectEmailsForAIAnalysis() {
        // Exclure les newsletters
        const nonNewsletters = this.emails.filter(e => e.category !== 'marketing_news');
        
        // Priorité 1: Emails pré-sélectionnés (sauf newsletters)
        const preselected = nonNewsletters.filter(e => 
            e.isPreselectedForTasks && e.categoryConfidence > 0.7
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        // Priorité 2: Autres emails haute confiance (sauf newsletters)
        const highConfidence = nonNewsletters.filter(e =>
            !e.isPreselectedForTasks && e.categoryConfidence > 0.8
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        // Limiter à 10 emails
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
            timestamp: Date.now(),
            debugInfo: this.scanMetrics.debugInfo
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
        if (window.categoryManager?.getTaskPreselectedCategories) {
            const fresh = window.categoryManager.getTaskPreselectedCategories();
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
    // DEBUG
    // ================================================
    debugNewsletterCategorization() {
        console.group('📰 DEBUG Catégorisation Newsletters');
        
        const newsletters = this.scanMetrics.debugInfo.filter(info => 
            info.category === 'marketing_news'
        );
        
        const misclassified = this.scanMetrics.debugInfo.filter(info => 
            info.category !== 'marketing_news' && 
            (info.from?.includes('newsletter') || 
             info.from?.includes('news') ||
             info.subject?.match(/newsletter|unsubscribe|désinscr/i))
        );
        
        console.log(`✅ ${newsletters.length} newsletters correctement détectées`);
        console.log(`❌ ${misclassified.length} newsletters potentiellement mal classées`);
        
        if (misclassified.length > 0) {
            console.log('\nNewsletters mal classées:');
            misclassified.forEach(email => {
                console.log(`- "${email.subject}" (${email.category})`);
                console.log(`  From: ${email.from}`);
                console.log(`  Score: ${email.score}, Confiance: ${Math.round((email.confidence || 0) * 100)}%`);
            });
        }
        
        console.groupEnd();
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
            errors: [],
            debugInfo: []
        };
    }

    setupEventListeners() {
        if (this.eventListenersSetup) return;
        
        window.addEventListener('keywordsUpdated', (event) => {
            console.log('[EmailScanner] 🔑 Mots-clés mis à jour');
            if (this.emails.length > 0) {
                setTimeout(() => this.recategorizeEmails(), 200);
            }
        });
        
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
        
        return '\ufeff' + csv;
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
            version: '15.0',
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
        console.group('🧪 TEST Catégorisation EmailScanner v15.0');
        
        const testEmails = [
            {
                id: 'test1',
                subject: '⛰️ Mission Kaizen : à chacun son Everest ! 🎾',
                from: { emailAddress: { address: 'newsletter@winamax.fr', name: 'Winamax' } },
                body: { content: 'Enchaîne les paris gagnants... 100 000 € de Freebets... Si vous souhaitez ne plus recevoir notre newsletter, cliquez ici.' }
            },
            {
                id: 'test2',
                subject: 'Désactivation de votre alerte',
                from: { emailAddress: { address: 'contact@jinka.fr', name: 'Jinka' } },
                body: { content: 'Nous avons remarqué que vous n\'utilisez plus votre alerte... Pour ne plus recevoir d\'e-mail de ce type de notre part, cliquez ici' }
            },
            {
                id: 'test3',
                subject: 'Sahar : un nouveau poste correspond à votre profil',
                from: { emailAddress: { address: 'no-reply@sahar.teamtailor-mail.com', name: 'Sahar' } },
                body: { content: 'Strategic Project Manager (F/H) - CDI - Paris... Se désabonner | Supprimer mes données' }
            },
            {
                id: 'test4',
                subject: '[GitHub] A third-party OAuth application has been added to your account',
                from: { emailAddress: { address: 'noreply@github.com', name: 'GitHub' } },
                body: { content: 'A third-party OAuth application (MongoDB Atlas) with read:user and user:email scopes was recently authorized' }
            }
        ];
        
        console.log('Testing email categorization...\n');
        
        testEmails.forEach(async (email) => {
            email.fullTextContent = this.buildFullTextContent(email);
            const result = await this.categorizeEmail(email);
            
            console.log(`📧 "${email.subject}"`);
            console.log(`   From: ${email.from.emailAddress.address}`);
            console.log(`   Category: ${result.category} (Score: ${result.score}, Confidence: ${Math.round((result.confidence || 0) * 100)}%)`);
            console.log(`   Expected: ${email.id === 'test4' ? 'notifications' : 'marketing_news'}`);
            console.log('');
        });
        
        console.groupEnd();
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        if (this.syncCheckInterval) {
            clearInterval(this.syncCheckInterval);
            this.syncCheckInterval = null;
        }
        
        if (this.categoryManagerListener) {
            this.categoryManagerListener();
            this.categoryManagerListener = null;
        }
        
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
    console.group('🧪 TEST EmailScanner v15.0');
    
    const info = window.emailScanner.getDebugInfo();
    console.log('Debug Info:', info);
    
    console.log('Catégories pré-sélectionnées:', window.emailScanner.getTaskPreselectedCategories());
    console.log('Provider actuel:', window.emailScanner.getCurrentProvider());
    
    // Test de catégorisation
    window.emailScanner.testCategorization();
    
    console.groupEnd();
    
    return info;
};

// Active le debug des newsletters pour cette session
window.debugNewsletters = true;

console.log('✅ EmailScanner v15.0 loaded - Intégration optimisée avec CategoryManager v26');
