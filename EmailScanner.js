// EmailScanner.js - Version 12.0 - Intégration Gmail/Outlook complète et fonctionnelle

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        
        // Système de synchronisation
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        console.log('[EmailScanner] ✅ Version 12.0 - Intégration Gmail/Outlook complète');
        this.loadSettingsFromCategoryManager();
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
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
    // SCAN PRINCIPAL - INTÉGRATION COMPLÈTE
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🔄 Synchronisation pré-scan');
        
        // Synchronisation des catégories
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

            // DÉTECTION PROVIDER UNIFIÉ
            const provider = this.detectCurrentProvider();
            console.log('[EmailScanner] 🔌 Provider détecté:', provider);

            if (!provider) {
                throw new Error('Aucun service d\'authentification disponible - Veuillez vous connecter à Gmail ou Outlook');
            }

            // Vérification des services requis
            await this.checkRequiredServices();

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

            // RÉCUPÉRATION EMAILS - MÉTHODE UNIFIÉE
            let emails = await this.fetchEmailsUnified(mergedOptions, startDate, endDate, provider);

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
    // DÉTECTION PROVIDER UNIFIÉ
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
        
        return null;
    }

    // ================================================
    // VÉRIFICATION DES SERVICES REQUIS
    // ================================================
    async checkRequiredServices() {
        console.log('[EmailScanner] 🔧 Vérification des services requis...');
        
        // Vérifier MailService
        if (!window.mailService) {
            throw new Error('MailService non disponible - Veuillez recharger la page');
        }
        
        // Initialiser MailService si nécessaire
        if (!window.mailService.isInitialized) {
            console.log('[EmailScanner] 🔄 Initialisation MailService...');
            await window.mailService.initialize();
        }
        
        // Vérifier CategoryManager
        if (!window.categoryManager) {
            throw new Error('CategoryManager non disponible - Veuillez recharger la page');
        }
        
        console.log('[EmailScanner] ✅ Tous les services sont disponibles');
    }

    // ================================================
    // RÉCUPÉRATION EMAILS UNIFIÉE - CORRIGÉE
    // ================================================
    async fetchEmailsUnified(options, startDate, endDate, provider) {
        console.log(`[EmailScanner] 📧 Récupération emails ${provider} unifiée`);
        
        try {
            // MÉTHODE 1: MailService unifié (recommandé)
            if (window.mailService && typeof window.mailService.getEmailsFromFolder === 'function') {
                console.log('[EmailScanner] 🔄 Utilisation MailService unifié');
                
                const mailServiceOptions = {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    top: options.maxEmails || 1000
                };
                
                return await window.mailService.getEmailsFromFolder(options.folder, mailServiceOptions);
            }
            
            // MÉTHODE 2: API spécifique au provider
            else if (provider === 'google') {
                return await this.fetchGmailDirect(options, startDate, endDate);
            }
            else if (provider === 'microsoft') {
                return await this.fetchMicrosoftDirect(options, startDate, endDate);
            }
            
            // MÉTHODE 3: Fallback d'urgence
            else {
                throw new Error(`Provider ${provider} non supporté ou service indisponible`);
            }
            
        } catch (error) {
            console.error(`[EmailScanner] ❌ Erreur récupération emails ${provider}:`, error);
            throw new Error(`Impossible de récupérer les emails ${provider}: ${error.message}`);
        }
    }

    // ================================================
    // RÉCUPÉRATION GMAIL DIRECTE - CORRIGÉE
    // ================================================
    async fetchGmailDirect(options, startDate, endDate) {
        console.log('[EmailScanner] 🔄 Récupération Gmail directe');
        
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('Gmail non authentifié');
        }
        
        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Gmail non disponible - Veuillez vous reconnecter');
        }
        
        try {
            const query = this.buildGmailQuery(options, startDate, endDate);
            console.log('[EmailScanner] 🔍 Gmail query:', query);
            
            // Étape 1: Lister les messages
            const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${query}`;
            const listResponse = await fetch(listUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!listResponse.ok) {
                const errorText = await listResponse.text();
                throw new Error(`Gmail API error ${listResponse.status}: ${errorText}`);
            }
            
            const listData = await listResponse.json();
            if (!listData.messages || listData.messages.length === 0) {
                console.log('[EmailScanner] 📭 Aucun message Gmail trouvé');
                return [];
            }
            
            console.log(`[EmailScanner] 📧 ${listData.messages.length} messages Gmail trouvés`);
            
            // Étape 2: Récupérer les détails par batch
            const emails = [];
            const batchSize = 10;
            const maxMessages = Math.min(listData.messages.length, options.maxEmails || 1000);
            
            for (let i = 0; i < maxMessages; i += batchSize) {
                const batch = listData.messages.slice(i, i + batchSize);
                
                const batchPromises = batch.map(message => 
                    this.getGmailMessageDetail(message.id, accessToken)
                );
                
                const batchResults = await Promise.allSettled(batchPromises);
                
                batchResults.forEach(result => {
                    if (result.status === 'fulfilled' && result.value) {
                        const convertedEmail = this.convertGmailToStandardFormat(result.value);
                        if (convertedEmail) {
                            emails.push(convertedEmail);
                        }
                    }
                });
                
                // Mettre à jour le progrès
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'fetching',
                        message: `Récupération Gmail: ${emails.length}/${maxMessages}`,
                        progress: { current: emails.length, total: maxMessages }
                    });
                }
                
                // Pause pour éviter les limites de taux
                if (i + batchSize < maxMessages) {
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

    async getGmailMessageDetail(messageId, accessToken) {
        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                return await response.json();
            } else {
                console.warn('[EmailScanner] Erreur récupération message Gmail:', messageId, response.status);
                return null;
            }
        } catch (error) {
            console.warn('[EmailScanner] Erreur récupération message Gmail:', messageId, error);
            return null;
        }
    }

    buildGmailQuery(options, startDate, endDate) {
        const params = new URLSearchParams();
        
        // Limite de résultats
        params.append('maxResults', Math.min(options.maxEmails || 1000, 500).toString());
        
        // Construction de la requête
        let query = '';
        
        // Dossier
        if (options.folder && options.folder !== 'inbox') {
            if (options.folder === 'spam') {
                query += 'in:spam ';
            } else if (options.folder === 'sent') {
                query += 'in:sent ';
            } else if (options.folder === 'drafts') {
                query += 'in:drafts ';
            } else {
                query += 'in:inbox ';
            }
        } else {
            query += 'in:inbox ';
        }
        
        // Dates
        if (startDate) {
            const startFormatted = startDate.toISOString().split('T')[0];
            query += `after:${startFormatted} `;
        }
        
        if (endDate) {
            const endFormatted = endDate.toISOString().split('T')[0];
            query += `before:${endFormatted} `;
        }
        
        // Exclure spam si nécessaire
        if (!options.includeSpam) {
            query += '-in:spam ';
        }
        
        if (query.trim()) {
            params.append('q', query.trim());
        }
        
        return params.toString();
    }

    // ================================================
    // RÉCUPÉRATION MICROSOFT DIRECTE - CORRIGÉE
    // ================================================
    async fetchMicrosoftDirect(options, startDate, endDate) {
        console.log('[EmailScanner] 🔄 Récupération Microsoft directe');
        
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Microsoft non authentifié');
        }
        
        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Microsoft non disponible - Veuillez vous reconnecter');
        }
        
        try {
            const graphUrl = this.buildMicrosoftGraphUrl(options, startDate, endDate);
            console.log('[EmailScanner] 🔍 Microsoft Graph URL:', graphUrl);
            
            const response = await fetch(graphUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Microsoft Graph error ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            const emails = data.value || [];
            
            console.log(`[EmailScanner] ✅ ${emails.length} emails Microsoft récupérés`);
            
            // Conversion au format standard
            return emails.map(email => this.convertMicrosoftToStandardFormat(email));
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur récupération Microsoft directe:', error);
            throw error;
        }
    }

    buildMicrosoftGraphUrl(options, startDate, endDate) {
        const baseUrl = 'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages';
        const params = new URLSearchParams();
        
        // Limite de résultats
        params.append('$top', Math.min(options.maxEmails || 1000, 1000).toString());
        params.append('$orderby', 'receivedDateTime desc');
        
        // Champs à récupérer
        params.append('$select', [
            'id', 'subject', 'bodyPreview', 'body', 'from', 'toRecipients',
            'ccRecipients', 'receivedDateTime', 'sentDateTime', 'isRead',
            'importance', 'hasAttachments', 'categories', 'parentFolderId'
        ].join(','));
        
        // Filtres de dates
        if (startDate || endDate) {
            const filters = [];
            
            if (startDate) {
                const startISO = startDate.toISOString();
                filters.push(`receivedDateTime ge ${startISO}`);
            }
            
            if (endDate) {
                const endDateObj = new Date(endDate);
                endDateObj.setHours(23, 59, 59, 999);
                const endISO = endDateObj.toISOString();
                filters.push(`receivedDateTime le ${endISO}`);
            }
            
            if (filters.length > 0) {
                params.append('$filter', filters.join(' and '));
            }
        }
        
        return `${baseUrl}?${params.toString()}`;
    }

    // ================================================
    // CONVERSION FORMATS - UNIFIÉE
    // ================================================
    convertGmailToStandardFormat(gmailMessage) {
        try {
            const headers = {};
            if (gmailMessage.payload && gmailMessage.payload.headers) {
                gmailMessage.payload.headers.forEach(header => {
                    headers[header.name.toLowerCase()] = header.value;
                });
            }
            
            // Extraire le contenu du corps
            let bodyContent = '';
            let bodyPreview = gmailMessage.snippet || '';
            
            if (gmailMessage.payload) {
                bodyContent = this.extractGmailBodyContent(gmailMessage.payload);
            }
            
            // Parser les adresses email
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
            
            // Format standard unifié
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
                
                // Métadonnées Gmail
                gmailMetadata: {
                    labelIds: gmailMessage.labelIds || [],
                    threadId: gmailMessage.threadId,
                    historyId: gmailMessage.historyId
                },
                
                sourceProvider: 'google'
            };
            
            return standardEmail;
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur conversion Gmail:', error);
            return null;
        }
    }

    convertMicrosoftToStandardFormat(microsoftEmail) {
        try {
            return {
                id: microsoftEmail.id,
                subject: microsoftEmail.subject || '',
                bodyPreview: microsoftEmail.bodyPreview || '',
                body: microsoftEmail.body || { content: '', contentType: 'text' },
                from: microsoftEmail.from,
                toRecipients: microsoftEmail.toRecipients || [],
                ccRecipients: microsoftEmail.ccRecipients || [],
                bccRecipients: microsoftEmail.bccRecipients || [],
                receivedDateTime: microsoftEmail.receivedDateTime,
                sentDateTime: microsoftEmail.sentDateTime,
                hasAttachments: microsoftEmail.hasAttachments || false,
                importance: microsoftEmail.importance || 'normal',
                isRead: microsoftEmail.isRead || false,
                isDraft: false,
                categories: microsoftEmail.categories || [],
                
                sourceProvider: 'microsoft'
            };
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur conversion Microsoft:', error);
            return null;
        }
    }

    extractGmailBodyContent(payload) {
        if (!payload) return '';
        
        // Corps direct
        if (payload.body && payload.body.data) {
            try {
                return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } catch (e) {
                console.warn('[EmailScanner] Erreur décodage base64:', e);
                return '';
            }
        }
        
        // Parties multiples
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/html' || part.mimeType === 'text/plain') {
                    if (part.body && part.body.data) {
                        try {
                            return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        } catch (e) {
                            console.warn('[EmailScanner] Erreur décodage base64 part:', e);
                        }
                    }
                }
            }
        }
        
        return '';
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
    // CATÉGORISATION EMAILS
    // ================================================
    async categorizeEmails(overridePreselectedCategories = null) {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        const taskPreselectedCategories = overridePreselectedCategories || this.taskPreselectedCategories || [];
        
        console.log('[EmailScanner] 🏷️ Début catégorisation');
        console.log('[EmailScanner] 📊 Total emails:', total);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', taskPreselectedCategories);

        const categoryStats = {};
        const categories = window.categoryManager?.getCategories() || {};
        
        // Initialiser les statistiques
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
        });

        const preselectedStats = {};
        taskPreselectedCategories.forEach(catId => {
            preselectedStats[catId] = 0;
        });

        const batchSize = 30;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
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
                    
                    // Marquer les emails pré-sélectionnés
                    email.isPreselectedForTasks = taskPreselectedCategories.includes(finalCategory);
                    
                    if (email.isPreselectedForTasks) {
                        console.log(`[EmailScanner] ⭐ Email pré-sélectionné: ${email.subject?.substring(0, 50)} (${finalCategory})`);
                        preselectedStats[finalCategory] = (preselectedStats[finalCategory] || 0) + 1;
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

            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        const marketingCount = categoryStats.marketing_news || 0;
        
        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.categoryDistribution = categoryStats;
        this.scanMetrics.preselectedCount = preselectedCount;
        this.scanMetrics.preselectedStats = preselectedStats;
        this.scanMetrics.errors = errors;
        this.scanMetrics.marketingDetected = marketingCount;
        
        console.log('[EmailScanner] ✅ Catégorisation terminée');
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] ⭐ Total pré-sélectionnés:', preselectedCount);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors);
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] AITaskAnalyzer non disponible');
            return;
        }

        const preselectedEmails = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        const additionalEmails = this.emails.filter(email => 
            !email.isPreselectedForTasks && 
            email.categoryConfidence > 0.8 &&
            ['tasks', 'commercial', 'finance', 'meetings'].includes(email.category)
        ).slice(0, Math.max(0, 10 - preselectedEmails.length));
        
        const emailsToAnalyze = [...preselectedEmails.slice(0, 10), ...additionalEmails];

        console.log(`[EmailScanner] 🤖 Analyse IA de ${emailsToAnalyze.length} emails prioritaires`);

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
        console.log('[EmailScanner] ✅ Analyse IA terminée');
        console.log('[EmailScanner] 📊 Tâches suggérées:', totalSuggested);
    }

    // ================================================
    // RÉSULTATS ET UTILITAIRES
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
        
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        ['other', 'excluded', 'spam'].forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
            }
        });
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée');
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
        
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Re-catégorisation terminée');
        
        setTimeout(() => {
            this.dispatchEvent('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getDetailedResults().breakdown,
                taskPreselectedCategories: this.taskPreselectedCategories,
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
            });
        }, 10);
    }

    // ================================================
    // MÉTHODES D'INTERFACE
    // ================================================
    async getEmails(options = {}) {
        // Méthode compatible avec l'interface attendue
        return this.scan(options);
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
            version: 'v12.0-Complete',
            hasRequiredServices: {
                mailService: !!window.mailService,
                categoryManager: !!window.categoryManager,
                googleAuth: !!(window.googleAuthService?.isAuthenticated?.()),
                microsoftAuth: !!(window.authService?.isAuthenticated?.())
            }
        };
    }

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

        return '\ufeff' + csv;
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

console.log('[EmailScanner] 🚀 Création nouvelle instance v12.0...');
window.emailScanner = new EmailScanner();

// Méthodes de test globales
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v12.0 - Complete');
    
    const debugInfo = window.emailScanner.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    console.log('Provider détecté:', window.emailScanner.detectCurrentProvider());
    console.log('Catégories pré-sélectionnées:', window.emailScanner.getTaskPreselectedCategories());
    
    console.groupEnd();
    return { success: true, provider: debugInfo.provider, version: debugInfo.version };
};

console.log('✅ EmailScanner v12.0 loaded - Intégration Gmail/Outlook complète et fonctionnelle');
