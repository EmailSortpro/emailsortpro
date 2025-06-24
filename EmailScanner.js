// EmailScanner.js - Version 14.0 - Synchronisation avec PageManager corrigée

class EmailScanner {
    constructor() {
        // Collections principales
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        
        // Synchronisation avec CategoryManager
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        // Métriques
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        // État du dernier scan
        this.lastScanResults = null;
        this.lastScanTimestamp = null;
        
        console.log('[EmailScanner] ✅ Version 14.0 - Synchronisation corrigée');
        this.loadSettingsFromCategoryManager();
        
        // S'enregistrer globalement pour être accessible
        window.emailScanner = this;
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
    // ================================================
    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager?.getSettings) {
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
    // SCAN PRINCIPAL AVEC SAUVEGARDE AUTOMATIQUE
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🔄 Démarrage scan v14.0');
        
        // Synchronisation des catégories
        if (window.categoryManager?.getTaskPreselectedCategories) {
            const freshCategories = window.categoryManager.getTaskPreselectedCategories();
            this.taskPreselectedCategories = [...freshCategories];
            console.log('[EmailScanner] ✅ Catégories synchronisées:', this.taskPreselectedCategories);
        }
        
        // Utiliser les catégories des options si fournies
        if (options.taskPreselectedCategories && Array.isArray(options.taskPreselectedCategories)) {
            console.log('[EmailScanner] 📋 Catégories depuis options:', options.taskPreselectedCategories);
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
            return this.getLastResults();
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;
            this.scanMetrics.startTime = Date.now();

            console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN ===');
            console.log('[EmailScanner] 📊 Options:', mergedOptions);
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

            // Détection provider
            const provider = this.detectCurrentProvider();
            console.log('[EmailScanner] 🔌 Provider détecté:', provider);

            if (!provider) {
                throw new Error('Aucun service d\'authentification disponible - Veuillez vous connecter');
            }

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

            // Récupération emails
            let emails = await this.fetchEmailsUnified(mergedOptions, startDate, endDate, provider);
            this.emails = emails || [];
            
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés depuis ${provider}`);

            if (this.emails.length === 0) {
                const emptyResults = this.getEmptyResults();
                this.saveResults(emptyResults);
                return emptyResults;
            }

            // Stocker les catégories dans les métriques
            this.scanMetrics.taskPreselectedCategories = [...this.taskPreselectedCategories];

            // Catégorisation
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

            // Analyse IA optionnelle
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
            
            // IMPORTANT: Sauvegarder les résultats
            this.saveResults(results);
            
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

            // Dispatcher l'événement avec les emails
            this.dispatchScanCompleted(results, provider);

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
    // SAUVEGARDE ET DISPATCH DES RÉSULTATS
    // ================================================
    saveResults(results) {
        this.lastScanResults = results;
        this.lastScanTimestamp = Date.now();
        
        // Sauvegarder dans sessionStorage pour PageManager
        try {
            const dataToSave = {
                emails: this.emails,
                results: results,
                timestamp: this.lastScanTimestamp,
                provider: this.detectCurrentProvider()
            };
            
            sessionStorage.setItem('lastScanResults', JSON.stringify(dataToSave));
            console.log('[EmailScanner] 💾 Résultats sauvegardés dans sessionStorage');
            
            // Aussi sauvegarder dans localStorage avec expiration
            const persistentData = {
                emails: this.emails.slice(0, 200), // Limiter pour localStorage
                timestamp: this.lastScanTimestamp,
                provider: this.detectCurrentProvider(),
                expiry: Date.now() + (24 * 60 * 60 * 1000) // 24h
            };
            
            localStorage.setItem('emailsCachePersistent', JSON.stringify(persistentData));
            console.log('[EmailScanner] 💾 Cache persistant sauvegardé');
            
        } catch (error) {
            console.warn('[EmailScanner] ⚠️ Erreur sauvegarde:', error);
        }
        
        // Enregistrer aussi dans CategoryManager si disponible
        if (window.categoryManager?.recordScanResult) {
            window.categoryManager.recordScanResult({
                ...results,
                provider: this.detectCurrentProvider(),
                timestamp: this.lastScanTimestamp
            });
        }
    }

    dispatchScanCompleted(results, provider) {
        // Dispatcher avec un délai pour laisser le temps aux autres modules
        setTimeout(() => {
            const eventData = {
                results,
                emails: this.emails,
                breakdown: results.breakdown,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                preselectedCount: results.stats.preselectedForTasks,
                provider: provider,
                scanMetrics: this.scanMetrics,
                timestamp: this.lastScanTimestamp
            };
            
            window.dispatchEvent(new CustomEvent('scanCompleted', {
                detail: eventData
            }));
            
            console.log('[EmailScanner] 📨 Événement scanCompleted dispatché avec', this.emails.length, 'emails');
            
            // Notifier aussi via un événement spécifique pour PageManager
            window.dispatchEvent(new CustomEvent('emailScannerReady', {
                detail: {
                    emailCount: this.emails.length,
                    provider: provider
                }
            }));
            
        }, 100);
    }

    // ================================================
    // DÉTECTION PROVIDER
    // ================================================
    detectCurrentProvider() {
        // Utiliser CategoryManager si disponible
        if (window.categoryManager?.detectEmailProvider) {
            const provider = window.categoryManager.detectEmailProvider();
            return provider?.type || null;
        }
        
        // Détection manuelle
        if (window.googleAuthService?.isAuthenticated?.()) {
            return 'google';
        }
        
        if (window.authService?.isAuthenticated?.()) {
            return 'microsoft';
        }
        
        return null;
    }

    // ================================================
    // VÉRIFICATION DES SERVICES
    // ================================================
    async checkRequiredServices() {
        console.log('[EmailScanner] 🔧 Vérification des services...');
        
        if (!window.categoryManager) {
            throw new Error('CategoryManager non disponible');
        }
        
        // MailService optionnel
        if (!window.mailService) {
            console.warn('[EmailScanner] ⚠️ MailService non disponible - Utilisation méthodes directes');
        }
        
        console.log('[EmailScanner] ✅ Services vérifiés');
    }

    // ================================================
    // RÉCUPÉRATION EMAILS UNIFIÉE
    // ================================================
    async fetchEmailsUnified(options, startDate, endDate, provider) {
        console.log(`[EmailScanner] 📧 Récupération emails ${provider}`);
        
        try {
            // Essayer via MailService d'abord
            if (window.mailService?.getEmailsFromFolder) {
                console.log('[EmailScanner] 🔄 Utilisation MailService');
                
                const mailServiceOptions = {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    top: options.maxEmails || 1000
                };
                
                return await window.mailService.getEmailsFromFolder(options.folder, mailServiceOptions);
            }
            
            // Sinon méthodes directes
            if (provider === 'google') {
                return await this.fetchGmailDirect(options, startDate, endDate);
            } else if (provider === 'microsoft') {
                return await this.fetchMicrosoftDirect(options, startDate, endDate);
            }
            
            throw new Error(`Provider ${provider} non supporté`);
            
        } catch (error) {
            console.error(`[EmailScanner] ❌ Erreur récupération emails:`, error);
            throw new Error(`Impossible de récupérer les emails: ${error.message}`);
        }
    }

    // ================================================
    // RÉCUPÉRATION GMAIL DIRECTE
    // ================================================
    async fetchGmailDirect(options, startDate, endDate) {
        console.log('[EmailScanner] 🔄 Récupération Gmail directe');
        
        if (!window.googleAuthService?.isAuthenticated()) {
            throw new Error('Gmail non authentifié');
        }
        
        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Gmail non disponible');
        }
        
        try {
            const query = this.buildGmailQuery(options, startDate, endDate);
            console.log('[EmailScanner] 🔍 Gmail query:', query);
            
            const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${query}`;
            const listResponse = await fetch(listUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!listResponse.ok) {
                throw new Error(`Gmail API error ${listResponse.status}`);
            }
            
            const listData = await listResponse.json();
            if (!listData.messages || listData.messages.length === 0) {
                console.log('[EmailScanner] 📭 Aucun message Gmail trouvé');
                return [];
            }
            
            console.log(`[EmailScanner] 📧 ${listData.messages.length} messages Gmail trouvés`);
            
            // Récupérer les détails
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
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'fetching',
                        message: `Récupération Gmail: ${emails.length}/${maxMessages}`,
                        progress: { current: emails.length, total: maxMessages }
                    });
                }
                
                if (i + batchSize < maxMessages) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            console.log(`[EmailScanner] ✅ ${emails.length} emails Gmail récupérés et convertis`);
            return emails;
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur Gmail:', error);
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
            }
            
            return null;
        } catch (error) {
            console.warn('[EmailScanner] Erreur message Gmail:', messageId, error);
            return null;
        }
    }

    buildGmailQuery(options, startDate, endDate) {
        const params = new URLSearchParams();
        params.append('maxResults', Math.min(options.maxEmails || 1000, 500).toString());
        
        let query = 'in:inbox ';
        
        if (startDate) {
            query += `after:${startDate.toISOString().split('T')[0]} `;
        }
        
        if (endDate) {
            query += `before:${endDate.toISOString().split('T')[0]} `;
        }
        
        if (!options.includeSpam) {
            query += '-in:spam ';
        }
        
        params.append('q', query.trim());
        return params.toString();
    }

    // ================================================
    // RÉCUPÉRATION MICROSOFT DIRECTE
    // ================================================
    async fetchMicrosoftDirect(options, startDate, endDate) {
        console.log('[EmailScanner] 🔄 Récupération Microsoft directe');
        
        if (!window.authService?.isAuthenticated()) {
            throw new Error('Microsoft non authentifié');
        }
        
        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Microsoft non disponible');
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
                throw new Error(`Microsoft Graph error ${response.status}`);
            }
            
            const data = await response.json();
            const emails = data.value || [];
            
            console.log(`[EmailScanner] ✅ ${emails.length} emails Microsoft récupérés`);
            
            return emails.map(email => this.convertMicrosoftToStandardFormat(email));
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur Microsoft:', error);
            throw error;
        }
    }

    buildMicrosoftGraphUrl(options, startDate, endDate) {
        const baseUrl = 'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages';
        const params = new URLSearchParams();
        
        params.append('$top', Math.min(options.maxEmails || 1000, 1000).toString());
        params.append('$orderby', 'receivedDateTime desc');
        params.append('$select', [
            'id', 'subject', 'bodyPreview', 'body', 'from', 'toRecipients',
            'ccRecipients', 'receivedDateTime', 'sentDateTime', 'isRead',
            'importance', 'hasAttachments', 'categories', 'parentFolderId'
        ].join(','));
        
        if (startDate || endDate) {
            const filters = [];
            
            if (startDate) {
                filters.push(`receivedDateTime ge ${startDate.toISOString()}`);
            }
            
            if (endDate) {
                const endDateObj = new Date(endDate);
                endDateObj.setHours(23, 59, 59, 999);
                filters.push(`receivedDateTime le ${endDateObj.toISOString()}`);
            }
            
            if (filters.length > 0) {
                params.append('$filter', filters.join(' and '));
            }
        }
        
        return `${baseUrl}?${params.toString()}`;
    }

    // ================================================
    // CONVERSION FORMATS
    // ================================================
    convertGmailToStandardFormat(gmailMessage) {
        try {
            const headers = {};
            if (gmailMessage.payload?.headers) {
                gmailMessage.payload.headers.forEach(header => {
                    headers[header.name.toLowerCase()] = header.value;
                });
            }
            
            let bodyContent = '';
            let bodyPreview = gmailMessage.snippet || '';
            
            if (gmailMessage.payload) {
                bodyContent = this.extractGmailBodyContent(gmailMessage.payload);
            }
            
            const parseEmailAddress = (emailString) => {
                if (!emailString) return null;
                
                const match = emailString.match(/^(.+?)\s*<(.+?)>$/) || [null, emailString, emailString];
                return {
                    emailAddress: {
                        name: match[1] ? match[1].trim().replace(/"/g, '') : '',
                        address: match[2] ? match[2].trim() : emailString.trim()
                    }
                };
            };
            
            const parseEmailList = (emailString) => {
                if (!emailString) return [];
                return emailString.split(',').map(email => parseEmailAddress(email.trim())).filter(Boolean);
            };
            
            return {
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
                gmailMetadata: {
                    labelIds: gmailMessage.labelIds || [],
                    threadId: gmailMessage.threadId,
                    historyId: gmailMessage.historyId
                },
                sourceProvider: 'google'
            };
            
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
        
        if (payload.body?.data) {
            try {
                return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } catch (e) {
                console.warn('[EmailScanner] Erreur décodage base64:', e);
            }
        }
        
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/html' || part.mimeType === 'text/plain') {
                    if (part.body?.data) {
                        try {
                            return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        } catch (e) {
                            console.warn('[EmailScanner] Erreur décodage part:', e);
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
        
        return gmailMessage.payload ? checkPartForAttachments(gmailMessage.payload) : false;
    }

    getGmailImportance(gmailMessage) {
        if (gmailMessage.labelIds) {
            if (gmailMessage.labelIds.includes('IMPORTANT')) return 'high';
            if (gmailMessage.labelIds.includes('CATEGORY_PROMOTIONS')) return 'low';
        }
        return 'normal';
    }

    // ================================================
    // CATÉGORISATION
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
                        console.log(`[EmailScanner] ⭐ Email pré-sélectionné: "${email.subject?.substring(0, 50)}" (${finalCategory})`);
                        preselectedStats[finalCategory] = (preselectedStats[finalCategory] || 0) + 1;
                    }
                    
                    // Ajouter à la catégorie
                    if (!this.categorizedEmails[finalCategory]) {
                        this.categorizedEmails[finalCategory] = [];
                    }
                    
                    this.categorizedEmails[finalCategory].push(email);
                    categoryStats[finalCategory] = (categoryStats[finalCategory] || 0) + 1;

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation:', error);
                    
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
    // ANALYSE IA
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
        
        const emailsToAnalyze = preselectedEmails.slice(0, 10);

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
                console.error('[EmailScanner] Erreur analyse IA:', error);
                email.aiAnalysisError = error.message;
            }
        }

        const totalSuggested = this.emails.filter(e => e.taskSuggested).length;
        console.log('[EmailScanner] ✅ Analyse IA terminée');
        console.log('[EmailScanner] 📊 Tâches suggérées:', totalSuggested);
    }

    // ================================================
    // RÉSULTATS
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

    getLastResults() {
        if (this.lastScanResults) {
            return this.lastScanResults;
        }
        
        // Essayer de charger depuis sessionStorage
        try {
            const stored = sessionStorage.getItem('lastScanResults');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.results) {
                    this.emails = data.emails || [];
                    this.lastScanResults = data.results;
                    this.lastScanTimestamp = data.timestamp;
                    return data.results;
                }
            }
        } catch (error) {
            console.warn('[EmailScanner] Erreur chargement résultats:', error);
        }
        
        return this.getEmptyResults();
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

    // ================================================
    // API PUBLIQUE IMPORTANTE
    // ================================================
    
    /**
     * Récupère tous les emails
     * @returns {Array} Liste des emails
     */
    getAllEmails() {
        console.log('[EmailScanner] getAllEmails appelé, retourne', this.emails.length, 'emails');
        return [...this.emails];
    }

    /**
     * Récupère un email par ID
     * @param {string} emailId - ID de l'email
     * @returns {Object|null} Email trouvé ou null
     */
    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId) || null;
    }

    /**
     * Récupère les emails par catégorie
     * @param {string} categoryId - ID de la catégorie
     * @returns {Array} Liste des emails
     */
    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return [...this.emails];
        }
        return this.emails.filter(email => email.category === categoryId);
    }

    /**
     * Récupère les emails pré-sélectionnés
     * @returns {Array} Liste des emails pré-sélectionnés
     */
    getPreselectedEmails() {
        return this.emails.filter(email => email.isPreselectedForTasks);
    }

    /**
     * Récupère les catégories pré-sélectionnées
     * @returns {Array} Liste des IDs de catégories
     */
    getTaskPreselectedCategories() {
        return [...this.taskPreselectedCategories];
    }

    /**
     * Met à jour les catégories pré-sélectionnées
     * @param {Array} categories - Nouvelles catégories
     * @returns {Array} Catégories mises à jour
     */
    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Mise à jour catégories:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        const hasChanged = JSON.stringify(oldCategories.sort()) !== 
                          JSON.stringify([...this.taskPreselectedCategories].sort());
        
        if (hasChanged && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Re-catégorisation nécessaire');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.taskPreselectedCategories;
    }

    /**
     * Re-catégorise tous les emails
     */
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
        
        // Dispatcher événement
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('emailsRecategorized', {
                detail: {
                    emails: this.emails,
                    breakdown: this.getDetailedResults().breakdown,
                    taskPreselectedCategories: this.taskPreselectedCategories,
                    preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
                }
            }));
        }, 10);
    }

    // ================================================
    // MÉTHODE D'INTERFACE AVEC PAGEMANAGER
    // ================================================
    async getEmails(options = {}) {
        // Si des emails sont déjà chargés, les retourner
        if (this.emails.length > 0) {
            console.log('[EmailScanner] Emails déjà chargés:', this.emails.length);
            return {
                success: true,
                emails: this.emails,
                total: this.emails.length
            };
        }
        
        // Sinon lancer un scan
        return this.scan(options);
    }

    // ================================================
    // DEBUG ET EXPORT
    // ================================================
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
            lastScanTimestamp: this.lastScanTimestamp,
            version: 'v14.0',
            hasRequiredServices: {
                categoryManager: !!window.categoryManager,
                mailService: !!window.mailService,
                googleAuth: !!(window.googleAuthService?.isAuthenticated?.()),
                microsoftAuth: !!(window.authService?.isAuthenticated?.())
            }
        };
    }

    exportResults(format = 'csv') {
        console.log('[EmailScanner] 📤 Export des résultats en', format);
        
        if (this.emails.length === 0) {
            window.uiManager?.showToast('Aucune donnée à exporter', 'warning');
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
            
            window.uiManager?.showToast(`${this.emails.length} emails exportés`, 'success');
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur export:', error);
            window.uiManager?.showToast('Erreur lors de l\'export', 'error');
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
        this.lastScanResults = null;
        this.lastScanTimestamp = null;
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
(function() {
    // Nettoyer l'ancienne instance
    if (window.emailScanner) {
        console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
        try {
            window.emailScanner.destroy?.();
        } catch (e) {
            console.warn('[EmailScanner] Erreur nettoyage:', e);
        }
    }

    console.log('[EmailScanner] 🚀 Création nouvelle instance v14.0...');
    
    try {
        window.emailScanner = new EmailScanner();
        
        // Méthodes de test globales
        window.testEmailScanner = function() {
            console.group('🧪 TEST EmailScanner v14.0');
            
            const debugInfo = window.emailScanner.getDebugInfo();
            console.log('Debug Info:', debugInfo);
            console.log('Emails en mémoire:', window.emailScanner.getAllEmails().length);
            
            // Vérifier la synchronisation avec PageManager
            if (window.pageManager) {
                console.log('PageManager détecté ✅');
                const pageManagerEmails = window.pageManager.getAllEmails();
                console.log('Emails dans PageManager:', pageManagerEmails.length);
            } else {
                console.log('PageManager non détecté ❌');
            }
            
            console.groupEnd();
            
            return { 
                success: true, 
                version: debugInfo.version,
                emailCount: debugInfo.totalEmails,
                provider: debugInfo.provider
            };
        };
        
        window.syncEmailsToPageManager = function() {
            if (!window.pageManager) {
                console.error('PageManager non disponible');
                return false;
            }
            
            const emails = window.emailScanner.getAllEmails();
            if (emails.length === 0) {
                console.log('Aucun email à synchroniser');
                return false;
            }
            
            window.pageManager.updateEmailsCache(emails, 'manual_sync');
            console.log(`✅ ${emails.length} emails synchronisés avec PageManager`);
            
            if (window.pageManager.currentPage === 'emails') {
                window.pageManager.refreshEmailsView();
            }
            
            return true;
        };
        
    } catch (error) {
        console.error('[EmailScanner] ❌ Erreur création instance:', error);
    }
})();

console.log('[EmailScanner] ✅ EmailScanner v14.0 loaded - Synchronisation corrigée!');
console.log('[EmailScanner] 💾 Sauvegarde automatique dans sessionStorage et localStorage');
console.log('[EmailScanner] 📨 Dispatch événements pour PageManager');
console.log('[EmailScanner] 🔄 Utilisez window.syncEmailsToPageManager() pour forcer la sync');
