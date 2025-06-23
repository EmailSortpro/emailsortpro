// EmailScanner.js - Version 11.0 - Optimisé pour Google Gmail avec catégorisation précise

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        
        // Système de synchronisation SIMPLIFIÉ
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        console.log('[EmailScanner] ✅ Version 11.0 - Optimisé Google Gmail avec catégorisation précise');
        this.loadSettingsFromCategoryManager();
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES SIMPLIFIÉ
    // ================================================
    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                this.lastSettingsSync = Date.now();
                return true;
                
            } else {
                return this.loadSettingsFromFallback();
            }
        } catch (error) {
            console.error('[EmailScanner] Erreur chargement CategoryManager:', error);
            return this.loadSettingsFromFallback();
        }
    }

    loadSettingsFromFallback() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = JSON.parse(saved);
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[EmailScanner] 📦 Paramètres chargés depuis localStorage');
            } else {
                this.settings = this.getDefaultSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[EmailScanner] 📝 Utilisation paramètres par défaut');
            }
            
            this.lastSettingsSync = Date.now();
            return true;
            
        } catch (error) {
            console.error('[EmailScanner] Erreur fallback:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
            return false;
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'meetings', 'finance'],
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
    // SCAN PRINCIPAL - OPTIMISÉ GOOGLE + MICROSOFT
    // ================================================
    async scan(options = {}) {
        // Synchronisation simple avant scan
        console.log('[EmailScanner] 🔄 Synchronisation pré-scan');
        
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const freshCategories = window.categoryManager.getTaskPreselectedCategories();
            this.taskPreselectedCategories = [...freshCategories];
            console.log('[EmailScanner] ✅ Catégories synchronisées:', this.taskPreselectedCategories);
        }
        
        // Si des catégories sont passées dans les options, les utiliser en priorité
        if (options.taskPreselectedCategories && Array.isArray(options.taskPreselectedCategories)) {
            console.log('[EmailScanner] 📋 Utilisation des catégories depuis options:', options.taskPreselectedCategories);
            this.taskPreselectedCategories = [...options.taskPreselectedCategories];
        }
        
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            maxEmails: options.maxEmails || 1000,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: [...this.taskPreselectedCategories]
        };

        if (this.isScanning) {
            console.warn('[EmailScanner] Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;
            this.scanMetrics.startTime = Date.now();

            console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN ===');
            console.log('[EmailScanner] 📊 Options:', mergedOptions);
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

            // DÉTECTION PROVIDER UNIFIÉ GOOGLE/MICROSOFT
            const provider = this.detectCurrentProvider();
            console.log('[EmailScanner] 🔌 Provider détecté:', provider);

            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            if (!window.categoryManager) {
                throw new Error('CategoryManager non disponible');
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - mergedOptions.days);

            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: `Récupération des emails ${provider} des ${mergedOptions.days} derniers jours...`,
                    progress: { current: 0, total: 100 }
                });
            }

            console.log('[EmailScanner] 📧 Récupération emails depuis:', mergedOptions.folder);

            // RÉCUPÉRATION EMAILS - COMPATIBLE GOOGLE/MICROSOFT
            let emails = await this.fetchEmailsUnified(mergedOptions, startDate, endDate);

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés depuis ${provider}`);

            if (this.emails.length === 0) {
                return this.getEmptyResults();
            }

            // Stocker les catégories pré-sélectionnées dans les métriques
            this.scanMetrics.taskPreselectedCategories = [...this.taskPreselectedCategories];

            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: `Catégorisation intelligente des emails ${provider}...`,
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmails(this.taskPreselectedCategories);
            }

            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA pour la création de tâches...`,
                        progress: { current: 0, total: Math.min(this.emails.length, 10) }
                    });
                }

                await this.analyzeForTasks();
            }

            const results = this.getDetailedResults();

            console.log('[EmailScanner] 🔍 === RÉSULTATS FINAUX ===');
            console.log(`[EmailScanner] Provider: ${provider}`);
            console.log(`[EmailScanner] Total: ${results.total}, Catégorisés: ${results.categorized}`);
            console.log(`[EmailScanner] ⭐ Pré-sélectionnés pour tâches: ${results.stats.preselectedForTasks}`);

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: `Scan ${provider} terminé avec succès !`,
                    results
                });
            }

            // Dispatch des résultats
            setTimeout(() => {
                this.dispatchEvent('scanCompleted', {
                    results,
                    emails: this.emails,
                    breakdown: results.breakdown,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    preselectedCount: results.stats.preselectedForTasks,
                    provider: provider,
                    scanMetrics: this.scanMetrics
                });
            }, 10);

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
    // DÉTECTION PROVIDER UNIFIÉ - GOOGLE + MICROSOFT
    // ================================================
    detectCurrentProvider() {
        // Priorité 1: Google Gmail
        if (window.googleAuthService && 
            typeof window.googleAuthService.isAuthenticated === 'function' && 
            window.googleAuthService.isAuthenticated()) {
            return 'google';
        }
        
        // Priorité 2: Microsoft Outlook
        if (window.authService && 
            typeof window.authService.isAuthenticated === 'function' && 
            window.authService.isAuthenticated()) {
            return 'microsoft';
        }
        
        // Détection fallback basée sur l'URL ou autres indices
        const currentUrl = window.location.href.toLowerCase();
        if (currentUrl.includes('google') || currentUrl.includes('gmail')) {
            return 'google';
        }
        if (currentUrl.includes('microsoft') || currentUrl.includes('outlook')) {
            return 'microsoft';
        }
        
        return 'unknown';
    }

    // ================================================
    // RÉCUPÉRATION EMAILS UNIFIÉE - OPTIMISÉE GOOGLE
    // ================================================
    async fetchEmailsUnified(options, startDate, endDate) {
        const provider = this.detectCurrentProvider();
        
        try {
            // GOOGLE GMAIL - PRIORITÉ
            if (provider === 'google') {
                console.log('[EmailScanner] 📧 Récupération emails Google Gmail');
                
                // Méthode 1: API Gmail via MailService
                if (typeof window.mailService.getEmails === 'function') {
                    return await window.mailService.getEmails({
                        provider: 'google',
                        folder: options.folder,
                        days: options.days,
                        maxEmails: options.maxEmails,
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString()
                    });
                }
                
                // Méthode 2: API Gmail directe si disponible
                else if (window.gapi && window.gapi.client && window.gapi.client.gmail) {
                    return await this.fetchGmailDirectly(options, startDate, endDate);
                }
                
                // Méthode 3: Fallback générique
                else {
                    console.warn('[EmailScanner] ⚠️ API Gmail non disponible, utilisation générique');
                    return await this.fetchGenericEmails(options, startDate, endDate);
                }
            }
            
            // MICROSOFT OUTLOOK
            else if (provider === 'microsoft') {
                console.log('[EmailScanner] 📧 Récupération emails Microsoft Outlook');
                
                if (typeof window.mailService.getEmailsFromFolder === 'function') {
                    return await window.mailService.getEmailsFromFolder(options.folder, {
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        top: options.maxEmails
                    });
                } else if (typeof window.mailService.getEmails === 'function') {
                    return await window.mailService.getEmails({
                        folder: options.folder,
                        days: options.days,
                        maxEmails: options.maxEmails
                    });
                }
            }
            
            // FALLBACK GÉNÉRIQUE
            console.log('[EmailScanner] 🔄 Utilisation méthode générique');
            return await this.fetchGenericEmails(options, startDate, endDate);
            
        } catch (error) {
            console.error(`[EmailScanner] ❌ Erreur récupération emails ${provider}:`, error);
            throw error;
        }
    }

    // ================================================
    // RÉCUPÉRATION GMAIL DIRECTE - OPTIMISÉE
    // ================================================
    async fetchGmailDirectly(options, startDate, endDate) {
        console.log('[EmailScanner] 🔄 Récupération Gmail directe via API');
        
        try {
            const query = this.buildGmailQuery(options, startDate, endDate);
            console.log('[EmailScanner] 🔍 Gmail query:', query);
            
            // Lister les messages
            const listResponse = await window.gapi.client.gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults: options.maxEmails
            });
            
            if (!listResponse.result.messages) {
                console.log('[EmailScanner] 📭 Aucun message Gmail trouvé');
                return [];
            }
            
            console.log(`[EmailScanner] 📧 ${listResponse.result.messages.length} messages Gmail trouvés`);
            
            // Récupérer les détails de chaque message par batch
            const emails = [];
            const batchSize = 20; // Augmenté pour de meilleures performances
            
            for (let i = 0; i < listResponse.result.messages.length; i += batchSize) {
                const batch = listResponse.result.messages.slice(i, i + batchSize);
                
                const batchPromises = batch.map(message => 
                    window.gapi.client.gmail.users.messages.get({
                        userId: 'me',
                        id: message.id,
                        format: 'full'
                    }).catch(error => {
                        console.warn('[EmailScanner] Erreur récupération message:', message.id, error);
                        return null;
                    })
                );
                
                const batchResults = await Promise.allSettled(batchPromises);
                
                batchResults.forEach(result => {
                    if (result.status === 'fulfilled' && result.value && result.value.result) {
                        const convertedEmail = this.convertGmailToStandardFormat(result.value.result);
                        if (convertedEmail) {
                            emails.push(convertedEmail);
                        }
                    }
                });
                
                // Mettre à jour le progrès
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'fetching',
                        message: `Récupération Gmail: ${emails.length}/${listResponse.result.messages.length}`,
                        progress: { current: emails.length, total: listResponse.result.messages.length }
                    });
                }
                
                // Pause pour éviter les limites de taux
                if (i + batchSize < listResponse.result.messages.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            console.log(`[EmailScanner] ✅ ${emails.length} emails Gmail récupérés et convertis`);
            return emails;
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur récupération Gmail directe:', error);
            throw error;
        }
    }

    buildGmailQuery(options, startDate, endDate) {
        const queries = [];
        
        // Folder mapping pour Gmail
        const folderMap = {
            'inbox': 'in:inbox',
            'sent': 'in:sent',
            'drafts': 'in:drafts',
            'trash': 'in:trash',
            'spam': 'in:spam',
            'important': 'is:important',
            'unread': 'is:unread'
        };
        
        const folder = folderMap[options.folder.toLowerCase()] || 'in:inbox';
        queries.push(folder);
        
        // Dates
        const formatDate = (date) => date.toISOString().split('T')[0];
        queries.push(`after:${formatDate(startDate)}`);
        queries.push(`before:${formatDate(endDate)}`);
        
        // Exclure spam si nécessaire
        if (!options.includeSpam) {
            queries.push('-in:spam');
        }
        
        return queries.join(' ');
    }

    // ================================================
    // CONVERSION GMAIL - OPTIMISÉE POUR CATÉGORISATION
    // ================================================
    convertGmailToStandardFormat(gmailMessage) {
        try {
            const headers = {};
            if (gmailMessage.payload && gmailMessage.payload.headers) {
                gmailMessage.payload.headers.forEach(header => {
                    headers[header.name.toLowerCase()] = header.value;
                });
            }
            
            // Extraire le contenu du corps - OPTIMISÉ
            let bodyContent = '';
            let bodyPreview = '';
            
            if (gmailMessage.snippet) {
                bodyPreview = gmailMessage.snippet;
            }
            
            const extractTextFromPart = (part) => {
                if (part.body && part.body.data) {
                    try {
                        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    } catch (e) {
                        console.warn('[EmailScanner] Erreur décodage base64:', e);
                        return '';
                    }
                }
                if (part.parts) {
                    return part.parts.map(extractTextFromPart).join(' ');
                }
                return '';
            };
            
            if (gmailMessage.payload) {
                bodyContent = extractTextFromPart(gmailMessage.payload);
            }
            
            // Parser les adresses email - ROBUSTE
            const parseEmailAddress = (emailString) => {
                if (!emailString) return null;
                
                try {
                    const match = emailString.match(/^(.+?)\s*<(.+?)>$/) || [null, emailString, emailString];
                    return {
                        emailAddress: {
                            name: match[1] ? match[1].trim().replace(/"/g, '') : '',
                            address: match[2] ? match[2].trim() : emailString.trim()
                        }
                    };
                } catch (e) {
                    console.warn('[EmailScanner] Erreur parse email:', emailString, e);
                    return {
                        emailAddress: {
                            name: '',
                            address: emailString || ''
                        }
                    };
                }
            };
            
            const parseEmailList = (emailString) => {
                if (!emailString) return [];
                return emailString.split(',').map(email => parseEmailAddress(email.trim())).filter(Boolean);
            };
            
            // Convertir au format standard Outlook/Microsoft
            const standardEmail = {
                id: gmailMessage.id || `gmail-${Date.now()}-${Math.random()}`,
                subject: headers.subject || '',
                bodyPreview: bodyPreview,
                body: {
                    content: bodyContent,
                    contentType: 'html'
                },
                from: parseEmailAddress(headers.from),
                toRecipients: parseEmailList(headers.to),
                ccRecipients: parseEmailList(headers.cc),
                bccRecipients: parseEmailList(headers.bcc),
                receivedDateTime: new Date(parseInt(gmailMessage.internalDate)).toISOString(),
                sentDateTime: headers.date ? new Date(headers.date).toISOString() : null,
                hasAttachments: this.checkGmailAttachments(gmailMessage),
                importance: this.getGmailImportance(gmailMessage),
                isRead: !gmailMessage.labelIds?.includes('UNREAD'),
                isDraft: gmailMessage.labelIds?.includes('DRAFT'),
                categories: [],
                
                // Métadonnées Gmail spécifiques
                gmailMetadata: {
                    labelIds: gmailMessage.labelIds || [],
                    threadId: gmailMessage.threadId,
                    historyId: gmailMessage.historyId
                },
                
                // Source provider
                sourceProvider: 'google'
            };
            
            return standardEmail;
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur conversion Gmail:', error);
            return null;
        }
    }

    checkGmailAttachments(gmailMessage) {
        const checkPartForAttachments = (part) => {
            if (part.filename && part.filename.length > 0) {
                return true;
            }
            if (part.parts) {
                return part.parts.some(checkPartForAttachments);
            }
            return false;
        };
        
        if (gmailMessage.payload) {
            return checkPartForAttachments(gmailMessage.payload);
        }
        
        return false;
    }

    getGmailImportance(gmailMessage) {
        if (gmailMessage.labelIds) {
            if (gmailMessage.labelIds.includes('IMPORTANT')) return 'high';
            if (gmailMessage.labelIds.includes('CATEGORY_PROMOTIONS')) return 'low';
        }
        return 'normal';
    }

    // ================================================
    // FALLBACK RÉCUPÉRATION EMAILS GÉNÉRIQUE
    // ================================================
    async fetchGenericEmails(options, startDate, endDate) {
        console.log('[EmailScanner] 🔄 Utilisation méthode générique');
        
        if (typeof window.mailService.getEmails === 'function') {
            return await window.mailService.getEmails({
                folder: options.folder,
                days: options.days,
                maxEmails: options.maxEmails
            });
        }
        
        throw new Error('Aucune méthode de récupération d\'emails disponible');
    }

    // ================================================
    // CATÉGORISATION EMAILS - AVEC PRIORITÉ MARKETING
    // ================================================
    async categorizeEmails(overridePreselectedCategories = null) {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        const taskPreselectedCategories = overridePreselectedCategories || this.taskPreselectedCategories || [];
        
        console.log('[EmailScanner] 🏷️ Début catégorisation (marketing prioritaire)');
        console.log('[EmailScanner] 📊 Total emails:', total);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', taskPreselectedCategories);

        const categoryStats = {};
        const keywordStats = {};
        const categories = window.categoryManager?.getCategories() || {};
        
        // Initialiser les statistiques
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
            keywordStats[catId] = {
                absoluteMatches: 0,
                strongMatches: 0,
                weakMatches: 0,
                exclusionMatches: 0
            };
        });

        const preselectedStats = {};
        taskPreselectedCategories.forEach(catId => {
            preselectedStats[catId] = 0;
        });

        const batchSize = 30; // Optimisé pour performance
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // UTILISER LA NOUVELLE ANALYSE AVEC PRIORITÉ MARKETING
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    const finalCategory = analysis.category || 'other';
                    
                    email.category = finalCategory;
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isExcluded = analysis.isExcluded || false;
                    email.priorityDetection = analysis.priorityDetection || null;
                    
                    // MARQUER les emails pré-sélectionnés
                    email.isPreselectedForTasks = taskPreselectedCategories.includes(finalCategory);
                    
                    if (email.isPreselectedForTasks) {
                        console.log(`[EmailScanner] ⭐ Email pré-sélectionné: ${email.subject?.substring(0, 50)} (${finalCategory})`);
                        preselectedStats[finalCategory] = (preselectedStats[finalCategory] || 0) + 1;
                    }
                    
                    // Log spécial pour marketing
                    if (finalCategory === 'marketing_news' && analysis.priorityDetection === 'marketing_first') {
                        console.log(`[EmailScanner] 📰 Marketing détecté (priorité): ${email.subject?.substring(0, 50)}`);
                    }
                    
                    // Ajouter l'email à la catégorie
                    if (!this.categorizedEmails[finalCategory]) {
                        this.categorizedEmails[finalCategory] = [];
                    }
                    
                    this.categorizedEmails[finalCategory].push(email);
                    categoryStats[finalCategory] = (categoryStats[finalCategory] || 0) + 1;

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation email:', error);
                    
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    
                    if (!this.categorizedEmails.other) {
                        this.categorizedEmails.other = [];
                    }
                    this.categorizedEmails.other.push(email);
                    categoryStats.other = (categoryStats.other || 0) + 1;
                    errors++;
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

            // Pause légère pour la performance
            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        const marketingCount = categoryStats.marketing_news || 0;
        
        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.keywordMatches = keywordStats;
        this.scanMetrics.categoryDistribution = categoryStats;
        this.scanMetrics.preselectedCount = preselectedCount;
        this.scanMetrics.preselectedStats = preselectedStats;
        this.scanMetrics.errors = errors;
        this.scanMetrics.marketingDetected = marketingCount;
        
        console.log('[EmailScanner] ✅ Catégorisation terminée (marketing prioritaire)');
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] 📰 Marketing détecté:', marketingCount);
        console.log('[EmailScanner] ⭐ Total pré-sélectionnés:', preselectedCount);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors);
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES - PRIORITÉ AUX PRÉ-SÉLECTIONNÉS
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] AITaskAnalyzer non disponible');
            return;
        }

        // PRIORITÉ 1: Emails pré-sélectionnés avec haute confiance
        const preselectedEmails = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        // PRIORITÉ 2: Autres emails avec très haute confiance
        const additionalEmails = this.emails.filter(email => 
            !email.isPreselectedForTasks && 
            email.categoryConfidence > 0.8 &&
            ['tasks', 'commercial', 'finance', 'meetings'].includes(email.category)
        ).slice(0, Math.max(0, 10 - preselectedEmails.length));
        
        const emailsToAnalyze = [...preselectedEmails.slice(0, 10), ...additionalEmails];

        console.log(`[EmailScanner] 🤖 Analyse IA de ${emailsToAnalyze.length} emails prioritaires`);
        console.log(`[EmailScanner] ⭐ Dont ${emailsToAnalyze.filter(e => e.isPreselectedForTasks).length} pré-sélectionnés`);

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
                console.error('[EmailScanner] Erreur analyse IA:', error);
                email.aiAnalysisError = error.message;
            }
        }

        const totalSuggested = this.emails.filter(e => e.taskSuggested).length;
        const preselectedSuggested = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;

        console.log('[EmailScanner] ✅ Analyse IA terminée');
        console.log('[EmailScanner] 📊 Tâches suggérées:', totalSuggested);
        console.log('[EmailScanner] ⭐ Dont pré-sélectionnées:', preselectedSuggested);
    }

    // ================================================
    // RÉSULTATS FINAUX
    // ================================================
    getDetailedResults() {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithAbsolute = 0;
        let totalWithTasks = 0;
        let totalPreselected = 0;

        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId !== 'other' && catId !== 'spam' && catId !== 'excluded') {
                totalCategorized += emails.length;
            }
            
            emails.forEach(email => {
                if (email.categoryConfidence >= 0.8) totalWithHighConfidence++;
                if (email.hasAbsolute) totalWithAbsolute++;
                if (email.taskSuggested) totalWithTasks++;
                if (email.isPreselectedForTasks) totalPreselected++;
            });
        });

        const avgConfidence = this.calculateAverageConfidence();
        const avgScore = this.calculateAverageScore();
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
                absoluteMatches: totalWithAbsolute,
                taskSuggestions: totalWithTasks,
                preselectedForTasks: totalPreselected,
                marketingDetected: this.scanMetrics.marketingDetected || 0,
                averageConfidence: avgConfidence,
                averageScore: avgScore,
                scanDuration: scanDuration
            },
            keywordStats: this.scanMetrics.keywordMatches,
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.scanMetrics
        };
    }

    getEmptyResults() {
        console.warn('[EmailScanner] Aucun email trouvé');
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
                absoluteMatches: 0,
                marketingDetected: 0
            },
            emails: [],
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            scanMetrics: this.scanMetrics
        };
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
            keywordMatches: {},
            categoryDistribution: {},
            marketingDetected: 0
        };
        
        // Initialiser avec toutes les catégories disponibles
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        // S'assurer que les catégories spéciales existent
        ['other', 'excluded', 'spam'].forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
            }
        });
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée (google)');
    }

    calculateAverageConfidence() {
        if (this.emails.length === 0) return 0;
        
        const totalConfidence = this.emails.reduce((sum, email) => {
            return sum + (email.categoryConfidence || 0);
        }, 0);
        
        return Math.round((totalConfidence / this.emails.length) * 100) / 100;
    }

    calculateAverageScore() {
        if (this.emails.length === 0) return 0;
        
        const totalScore = this.emails.reduce((sum, email) => {
            return sum + (email.categoryScore || 0);
        }, 0);
        
        return Math.round(totalScore / this.emails.length);
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
    // API PUBLIQUE
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

    getTaskPreselectedCategories() {
        return [...this.taskPreselectedCategories];
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 updateTaskPreselectedCategories:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        const hasChanged = JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
        
        if (hasChanged && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Re-catégorisation nécessaire');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.taskPreselectedCategories;
    }

    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScanner] 🔄 === DÉBUT RE-CATÉGORISATION ===');
        
        // Vider les catégories actuelles
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        // Recatégoriser tous les emails
        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Re-catégorisation terminée');
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getDetailedResults().breakdown,
                taskPreselectedCategories: this.taskPreselectedCategories,
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
            });
        }, 10);
    }

    getDebugInfo() {
        const provider = this.detectCurrentProvider();
        
        return {
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            provider: provider,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            marketingDetected: this.scanMetrics.marketingDetected || 0,
            avgConfidence: this.calculateAverageConfidence(),
            avgScore: this.calculateAverageScore(),
            settings: this.settings,
            scanMetrics: this.scanMetrics,
            version: 'v11.0-GoogleOptimized'
        };
    }

    // ================================================
    // EXPORT
    // ================================================
    exportResults(format = 'csv') {
        console.log('[EmailScanner] 📤 Export des résultats en', format);
        
        if (this.emails.length === 0) {
            if (window.uiManager) {
                window.uiManager.showToast('Aucune donnée à exporter', 'warning');
            }
            return;
        }

        try {
            let content, filename, mimeType;

            if (format === 'csv') {
                content = this.exportToCSV();
                filename = `email_scan_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv;charset=utf-8;';
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
            
            if (window.uiManager) {
                window.uiManager.showToast(`${this.emails.length} emails exportés`, 'success');
            }
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur export:', error);
            if (window.uiManager) {
                window.uiManager.showToast('Erreur lors de l\'export', 'error');
            }
        }
    }

    exportToCSV() {
        const rows = [
            ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Pré-sélectionné', 'Provider']
        ];

        this.emails.forEach(email => {
            const categoryInfo = window.categoryManager?.getCategory(email.category) || 
                { name: email.category || 'other' };
            
            rows.push([
                new Date(email.receivedDateTime).toLocaleString('fr-FR'),
                email.from?.emailAddress?.name || '',
                email.from?.emailAddress?.address || '',
                email.subject || 'Sans sujet',
                categoryInfo.name,
                Math.round((email.categoryConfidence || 0) * 100) + '%',
                email.categoryScore || 0,
                email.isPreselectedForTasks ? 'Oui' : 'Non',
                email.sourceProvider || this.detectCurrentProvider()
            ]);
        });

        const csv = rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        return '\ufeff' + csv; // BOM pour UTF-8
    }

    cleanup() {
        console.log('[EmailScanner] 🧹 Nettoyage...');
        this.emails = [];
        this.categorizedEmails = {};
        this.taskPreselectedCategories = [];
        this.scanProgress = null;
        this.scanMetrics = { 
            startTime: null, 
            categorizedCount: 0, 
            keywordMatches: {}, 
            categoryDistribution: {},
            marketingDetected: 0
        };
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        console.log('[EmailScanner] Instance détruite');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
    window.emailScanner.destroy?.();
}

console.log('[EmailScanner] 🚀 Création nouvelle instance optimisée...');
window.emailScanner = new EmailScanner();

// Méthodes de test globales
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v11.0 - Google Optimized');
    
    const debugInfo = window.emailScanner.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    console.log('Provider détecté:', window.emailScanner.detectCurrentProvider());
    console.log('Catégories pré-sélectionnées:', window.emailScanner.getTaskPreselectedCategories());
    
    console.groupEnd();
    return { success: true, provider: debugInfo.provider, version: debugInfo.version };
};

console.log('✅ EmailScanner v11.0 loaded - Optimisé Google Gmail avec catégorisation précise');
