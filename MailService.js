// MailService.js - Version 12.0 - Service Email Multi-Provider Optimisé
// Correction HTTP 400, amélioration des performances et gestion robuste des erreurs

console.log('[MailService] 🚀 Loading MailService.js v12.0 - Optimized...');

class MailService {
    constructor() {
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
        this.folders = [];
        this.emailCache = new Map();
        this.userEmail = null;
        
        // Configuration optimisée pour les performances
        this.config = {
            maxEmailsPerRequest: 100,    // Limite par requête (Gmail max: 100)
            maxTotalEmails: 10000,       // Limite totale par défaut (peut être dépassée)
            batchDelay: 50,              // Délai entre les batches (ms)
            cacheTimeout: 300000,        // 5 minutes
            retryAttempts: 2,            // Nombre de tentatives
            retryDelay: 1000            // Délai entre tentatives (ms)
        };
        
        // Statistiques de performance
        this.stats = {
            requestCount: 0,
            emailsFetched: 0,
            cacheHits: 0,
            errors: 0
        };
        
        console.log('[MailService] ✅ Service v12.0 initialized with optimizations');
    }

    // ================================================
    // INITIALISATION OPTIMISÉE
    // ================================================
    async initialize() {
        if (this.initialized) {
            console.log('[MailService] ⚠️ Already initialized');
            return true;
        }

        console.log('[MailService] 🔧 Initializing...');
        const startTime = Date.now();
        
        try {
            // 1. Détecter le provider
            await this.detectProvider();
            
            if (!this.currentProvider) {
                throw new Error('No provider detected');
            }
            
            // 2. Obtenir le token
            await this.obtainAccessToken();
            
            if (!this.accessToken) {
                throw new Error('Unable to obtain access token');
            }
            
            // 3. Obtenir l'email utilisateur
            await this.getUserEmail();
            
            // 4. Charger les dossiers (avec timeout)
            await this.loadFoldersWithTimeout();
            
            this.initialized = true;
            const initTime = Date.now() - startTime;
            
            console.log(`[MailService] ✅ Initialization complete in ${initTime}ms`);
            console.log('[MailService] 📧 Provider:', this.currentProvider);
            console.log('[MailService] 👤 User:', this.userEmail);
            
            // Dispatcher l'événement
            window.dispatchEvent(new CustomEvent('mailServiceReady', {
                detail: {
                    provider: this.currentProvider,
                    userEmail: this.userEmail,
                    initialized: true,
                    initTime
                }
            }));
            
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Initialization error:', error);
            this.initialized = false;
            throw error;
        }
    }

    // ================================================
    // DÉTECTION DU PROVIDER OPTIMISÉE
    // ================================================
    async detectProvider() {
        console.log('[MailService] 🔍 Detecting provider...');
        
        // Vérifications parallèles pour gagner du temps
        const checks = await Promise.allSettled([
            this.checkGoogleAuth(),
            this.checkMicrosoftAuth(),
            this.checkStoredProvider()
        ]);
        
        // Analyser les résultats
        if (checks[0].status === 'fulfilled' && checks[0].value) {
            this.currentProvider = 'google';
        } else if (checks[1].status === 'fulfilled' && checks[1].value) {
            this.currentProvider = 'microsoft';
        } else if (checks[2].status === 'fulfilled' && checks[2].value) {
            this.currentProvider = checks[2].value;
        }
        
        console.log('[MailService] Provider detected:', this.currentProvider || 'none');
    }

    async checkGoogleAuth() {
        if (window.googleAuthService?.isAuthenticated) {
            try {
                return await window.googleAuthService.isAuthenticated();
            } catch (error) {
                console.warn('[MailService] Google auth check failed:', error);
                return false;
            }
        }
        return false;
    }

    async checkMicrosoftAuth() {
        if (window.authService?.isAuthenticated) {
            try {
                return await window.authService.isAuthenticated();
            } catch (error) {
                console.warn('[MailService] Microsoft auth check failed:', error);
                return false;
            }
        }
        return false;
    }

    async checkStoredProvider() {
        const stored = sessionStorage.getItem('currentEmailProvider');
        return (stored === 'google' || stored === 'microsoft') ? stored : null;
    }

    // ================================================
    // OBTENTION DU TOKEN OPTIMISÉE
    // ================================================
    async obtainAccessToken() {
        console.log('[MailService] 🔑 Obtaining access token...');
        
        try {
            if (this.currentProvider === 'google') {
                this.accessToken = await this.getGoogleToken();
            } else if (this.currentProvider === 'microsoft') {
                this.accessToken = await this.getMicrosoftToken();
            } else {
                throw new Error(`Unknown provider: ${this.currentProvider}`);
            }
            
            if (!this.accessToken) {
                throw new Error('Empty token');
            }
            
            console.log('[MailService] ✅ Token obtained');
            
        } catch (error) {
            console.error('[MailService] ❌ Token error:', error);
            this.accessToken = null;
            throw error;
        }
    }

    async getGoogleToken() {
        // Essayer GoogleAuthService d'abord
        if (window.googleAuthService?.getAccessToken) {
            const token = await window.googleAuthService.getAccessToken();
            if (token) return token;
        }
        
        // Essayer gapi ensuite
        if (window.gapi?.auth2) {
            const authInstance = window.gapi.auth2.getAuthInstance();
            if (authInstance?.isSignedIn?.get()) {
                const user = authInstance.currentUser.get();
                const authResponse = user.getAuthResponse();
                if (authResponse?.access_token) {
                    return authResponse.access_token;
                }
            }
        }
        
        throw new Error('Unable to get Google token');
    }

    async getMicrosoftToken() {
        if (!window.authService?.getAccessToken) {
            throw new Error('AuthService not available');
        }
        
        const token = await window.authService.getAccessToken();
        if (!token) {
            throw new Error('Unable to get Microsoft token');
        }
        
        return token;
    }

    // ================================================
    // CHARGEMENT DES DOSSIERS AVEC TIMEOUT
    // ================================================
    async loadFoldersWithTimeout() {
        const timeout = 5000; // 5 secondes max
        
        try {
            await Promise.race([
                this.loadFolders(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Folder loading timeout')), timeout)
                )
            ]);
        } catch (error) {
            console.warn('[MailService] ⚠️ Folder loading failed, using defaults:', error);
            this.setDefaultFolders();
        }
    }

    async loadFolders() {
        console.log('[MailService] 📁 Loading folders...');
        
        if (this.currentProvider === 'google') {
            await this.loadGmailLabels();
        } else if (this.currentProvider === 'microsoft') {
            await this.loadOutlookFolders();
        }
        
        console.log(`[MailService] ✅ ${this.folders.length} folders loaded`);
    }

    // ================================================
    // RÉCUPÉRATION DES MESSAGES OPTIMISÉE
    // ================================================
    async getMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📬 Getting messages from ${folderId}...`);
        console.log('[MailService] Options:', options);
        
        if (!this.initialized) {
            await this.initialize();
        }
        
        // Normaliser les options
        const normalizedOptions = this.normalizeOptions(options);
        
        // Vérifier le cache
        const cacheKey = this.getCacheKey(folderId, normalizedOptions);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log(`[MailService] 📦 Cache hit: ${cached.length} messages`);
            this.stats.cacheHits++;
            return cached;
        }
        
        try {
            let messages = [];
            const startTime = Date.now();
            
            if (this.currentProvider === 'google') {
                messages = await this.getGmailMessagesOptimized(folderId, normalizedOptions);
            } else if (this.currentProvider === 'microsoft') {
                messages = await this.getOutlookMessagesOptimized(folderId, normalizedOptions);
            }
            
            const fetchTime = Date.now() - startTime;
            
            // Mettre en cache
            this.setCache(cacheKey, messages);
            
            // Statistiques
            this.stats.emailsFetched += messages.length;
            
            console.log(`[MailService] ✅ ${messages.length} messages fetched in ${fetchTime}ms`);
            
            return messages;
            
        } catch (error) {
            console.error('[MailService] ❌ Error fetching messages:', error);
            this.stats.errors++;
            
            // Si erreur 401, réinitialiser et réessayer une fois
            if (error.message?.includes('401') && normalizedOptions.retryCount < 1) {
                console.log('[MailService] 🔄 Retrying after 401 error...');
                await this.reset();
                await this.initialize();
                
                return this.getMessages(folderId, { ...options, retryCount: 1 });
            }
            
            throw error;
        }
    }

    normalizeOptions(options) {
        // Pour Gmail, permettre -1 qui signifie "tous les emails"
        let maxResults = options.maxResults;
        
        if (maxResults === undefined || maxResults === null) {
            maxResults = this.config.maxTotalEmails;
        } else if (maxResults === -1) {
            // -1 signifie pas de limite
            maxResults = Number.MAX_SAFE_INTEGER;
        } else {
            // Sinon, utiliser la valeur fournie mais dans les limites raisonnables
            maxResults = Math.min(maxResults, this.config.maxTotalEmails);
        }
        
        return {
            maxResults: maxResults,
            days: options.days,
            filter: options.filter,
            includeSpam: options.includeSpam,
            retryCount: options.retryCount || 0
        };
    }

    // ================================================
    // GMAIL OPTIMISÉ - CORRECTION HTTP 400
    // ================================================
    async getGmailMessagesOptimized(labelId = 'INBOX', options = {}) {
        console.log(`[MailService] 📧 Fetching Gmail messages...`);
        
        const allMessages = [];
        let pageToken = null;
        const batchSize = 100; // Gmail API limite par page
        const totalMax = options.maxResults || Number.MAX_SAFE_INTEGER;
        const isUnlimited = totalMax === Number.MAX_SAFE_INTEGER;
        
        // Construire la query Gmail
        const query = this.buildGmailQuery(labelId, options);
        console.log('[MailService] Gmail query:', query);
        console.log('[MailService] Max emails:', isUnlimited ? 'UNLIMITED' : totalMax);
        
        do {
            try {
                // Récupérer un batch d'IDs
                const { messageIds, nextPageToken } = await this.fetchGmailMessageIds(
                    query, 
                    batchSize, 
                    pageToken
                );
                
                if (messageIds.length === 0) {
                    break;
                }
                
                // Récupérer les détails en parallèle par petits groupes
                const detailedMessages = await this.fetchGmailMessageDetailsOptimized(messageIds);
                allMessages.push(...detailedMessages);
                
                pageToken = nextPageToken;
                
                // Log de progression
                if (isUnlimited) {
                    console.log(`[MailService] Progress: ${allMessages.length} messages fetched...`);
                } else {
                    console.log(`[MailService] Progress: ${allMessages.length}/${totalMax} messages`);
                }
                
                // Vérifier si on a atteint la limite (sauf si illimité)
                if (!isUnlimited && allMessages.length >= totalMax) {
                    console.log('[MailService] Max limit reached');
                    break;
                }
                
                // Petit délai entre les pages pour éviter le rate limiting
                if (pageToken) {
                    await new Promise(resolve => setTimeout(resolve, this.config.batchDelay));
                }
                
            } catch (error) {
                console.error('[MailService] Error in Gmail loop:', error);
                
                // Si c'est une erreur de rate limiting, attendre et réessayer
                if (error.message?.includes('429') || error.message?.includes('quotaExceeded')) {
                    console.log('[MailService] Rate limit hit, waiting...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                
                throw error;
            }
            
        } while (pageToken && (isUnlimited || allMessages.length < totalMax));
        
        // Ne limiter que si on a une limite définie
        return isUnlimited ? allMessages : allMessages.slice(0, totalMax);
    }

    buildGmailQuery(labelId, options) {
        let query = '';
        
        // Label/Folder
        if (labelId && labelId !== 'all') {
            const labelMap = {
                'INBOX': 'in:inbox',
                'SENT': 'in:sent',
                'DRAFT': 'in:draft',
                'TRASH': 'in:trash',
                'SPAM': 'in:spam'
            };
            query = labelMap[labelId] || `label:${labelId}`;
        }
        
        // Date filter
        if (options.days) {
            const dateFilter = `after:${this.getDateFilter(options.days)}`;
            query = query ? `${query} ${dateFilter}` : dateFilter;
        }
        
        // Custom filter
        if (options.filter) {
            query = query ? `${query} ${options.filter}` : options.filter;
        }
        
        // Exclude spam
        if (options.includeSpam === false) {
            query = query ? `${query} -in:spam` : '-in:spam';
        }
        
        return query;
    }

    async fetchGmailMessageIds(query, maxResults, pageToken) {
        const params = new URLSearchParams({
            maxResults: maxResults.toString()
        });
        
        if (query) {
            params.append('q', query);
        }
        
        if (pageToken) {
            params.append('pageToken', pageToken);
        }
        
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`;
        
        const response = await this.fetchWithRetry(url, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            await this.handleApiError(response, 'Gmail list messages');
        }
        
        const data = await response.json();
        
        return {
            messageIds: data.messages || [],
            nextPageToken: data.nextPageToken
        };
    }

    async fetchGmailMessageDetailsOptimized(messageIds) {
        const details = [];
        const concurrentLimit = 5; // Limite de requêtes simultanées
        
        // Traiter par groupes pour optimiser
        for (let i = 0; i < messageIds.length; i += concurrentLimit) {
            const batch = messageIds.slice(i, i + concurrentLimit);
            
            const promises = batch.map(msg => 
                this.fetchSingleGmailMessage(msg.id).catch(error => {
                    console.error(`[MailService] Error fetching message ${msg.id}:`, error);
                    return null;
                })
            );
            
            const results = await Promise.all(promises);
            
            results.forEach(message => {
                if (message) {
                    details.push(message);
                }
            });
            
            // Petit délai entre les batches
            if (i + concurrentLimit < messageIds.length) {
                await new Promise(resolve => setTimeout(resolve, this.config.batchDelay));
            }
        }
        
        return details;
    }

    async fetchSingleGmailMessage(messageId) {
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
        
        const response = await this.fetchWithRetry(url, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error(`[MailService] Failed to fetch message ${messageId}: ${response.status}`);
            return null;
        }
        
        const message = await response.json();
        return this.normalizeGmailMessage(message);
    }

    // ================================================
    // OUTLOOK OPTIMISÉ
    // ================================================
    async getOutlookMessagesOptimized(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📂 Fetching Outlook messages...`);
        
        const allMessages = [];
        let nextLink = null;
        const maxResults = options.maxResults || this.config.maxTotalEmails;
        const batchSize = 50; // Outlook recommande 50
        
        // Construire le filtre
        const filter = this.buildOutlookFilter(options);
        
        do {
            try {
                let url;
                
                if (nextLink) {
                    url = nextLink;
                } else {
                    const params = new URLSearchParams({
                        '$top': Math.min(maxResults - allMessages.length, batchSize).toString(),
                        '$select': 'id,conversationId,receivedDateTime,subject,body,bodyPreview,importance,isRead,hasAttachments,from,toRecipients,ccRecipients',
                        '$orderby': 'receivedDateTime desc'
                    });
                    
                    if (filter) {
                        params.append('$filter', filter);
                    }
                    
                    url = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages?${params}`;
                }
                
                const response = await this.fetchWithRetry(url, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    await this.handleApiError(response, 'Outlook messages');
                }
                
                const data = await response.json();
                const messages = data.value || [];
                
                // Normaliser les messages
                const normalized = messages.map(msg => this.normalizeOutlookMessage(msg));
                allMessages.push(...normalized);
                
                nextLink = data['@odata.nextLink'];
                
                console.log(`[MailService] Progress: ${allMessages.length}/${maxResults} messages`);
                
                // Petit délai entre les pages
                if (nextLink && allMessages.length < maxResults) {
                    await new Promise(resolve => setTimeout(resolve, this.config.batchDelay));
                }
                
            } catch (error) {
                console.error('[MailService] Error in Outlook loop:', error);
                
                // Si rate limiting, attendre
                if (error.message?.includes('429')) {
                    console.log('[MailService] Rate limit hit, waiting...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                
                throw error;
            }
            
        } while (nextLink && allMessages.length < maxResults);
        
        return allMessages.slice(0, maxResults);
    }

    buildOutlookFilter(options) {
        let filter = '';
        
        if (options.days) {
            const date = new Date();
            date.setDate(date.getDate() - options.days);
            filter = `receivedDateTime ge ${date.toISOString()}`;
        }
        
        if (options.filter) {
            filter = filter ? `${filter} and ${options.filter}` : options.filter;
        }
        
        return filter;
    }

    // ================================================
    // UTILITAIRES OPTIMISÉS
    // ================================================
    async fetchWithRetry(url, options, retryCount = 0) {
        this.stats.requestCount++;
        
        try {
            const response = await fetch(url, options);
            
            if (response.status === 429 || response.status === 503) {
                if (retryCount < this.config.retryAttempts) {
                    const delay = this.config.retryDelay * Math.pow(2, retryCount);
                    console.log(`[MailService] Retrying after ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.fetchWithRetry(url, options, retryCount + 1);
                }
            }
            
            return response;
            
        } catch (error) {
            if (retryCount < this.config.retryAttempts) {
                console.log(`[MailService] Network error, retrying...`);
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                return this.fetchWithRetry(url, options, retryCount + 1);
            }
            throw error;
        }
    }

    async handleApiError(response, context) {
        const errorText = await response.text();
        console.error(`[MailService] ${context} error:`, errorText);
        
        let errorMessage = `HTTP ${response.status}`;
        
        try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
                errorMessage = `${context}: ${errorData.error.message}`;
            }
        } catch (e) {
            // Ignore parsing error
        }
        
        throw new Error(errorMessage);
    }

    normalizeGmailMessage(message) {
        const headers = message.payload?.headers || [];
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
        
        // Extraire le contenu de manière optimisée
        const content = this.extractGmailContentOptimized(message.payload);
        
        // Parser l'expéditeur
        const fromHeader = getHeader('From');
        const fromParsed = this.parseEmailAddress(fromHeader);
        
        return {
            id: message.id,
            threadId: message.threadId,
            provider: 'google',
            receivedDateTime: new Date(parseInt(message.internalDate)).toISOString(),
            subject: getHeader('Subject') || 'Sans sujet',
            from: {
                emailAddress: {
                    name: fromParsed.name,
                    address: fromParsed.address
                }
            },
            toRecipients: this.parseRecipients(getHeader('To')),
            ccRecipients: this.parseRecipients(getHeader('Cc')),
            bodyPreview: message.snippet || '',
            body: {
                content: content.html || content.text || message.snippet || '',
                contentType: content.html ? 'html' : 'text'
            },
            bodyHtml: content.html,
            bodyText: content.text,
            hasAttachments: content.hasAttachments,
            labels: message.labelIds || [],
            isRead: !message.labelIds?.includes('UNREAD'),
            importance: message.labelIds?.includes('IMPORTANT') ? 'high' : 'normal'
        };
    }

    extractGmailContentOptimized(payload) {
        let text = '';
        let html = '';
        let hasAttachments = false;
        
        if (!payload) return { text, html, hasAttachments };
        
        // Stack pour parcours itératif (plus rapide que récursif)
        const stack = [payload];
        
        while (stack.length > 0) {
            const part = stack.pop();
            
            // Vérifier les pièces jointes
            if (part.filename && part.filename.length > 0) {
                hasAttachments = true;
                continue;
            }
            
            // Extraire le contenu
            if (part.body?.data) {
                const decoded = this.base64Decode(part.body.data);
                
                if (part.mimeType === 'text/plain' && !text) {
                    text = decoded;
                } else if (part.mimeType === 'text/html' && !html) {
                    html = decoded;
                }
                
                // Si on a les deux, on peut arrêter
                if (text && html) {
                    break;
                }
            }
            
            // Ajouter les sous-parties à la stack
            if (part.parts && Array.isArray(part.parts)) {
                stack.push(...part.parts);
            }
        }
        
        return { text, html, hasAttachments };
    }

    normalizeOutlookMessage(message) {
        return {
            id: message.id,
            conversationId: message.conversationId,
            provider: 'microsoft',
            receivedDateTime: message.receivedDateTime,
            subject: message.subject || 'Sans sujet',
            from: message.from,
            toRecipients: message.toRecipients || [],
            ccRecipients: message.ccRecipients || [],
            bodyPreview: message.bodyPreview || '',
            body: message.body || { content: '', contentType: 'text' },
            bodyHtml: message.body?.contentType === 'html' ? message.body.content : '',
            bodyText: message.body?.contentType === 'text' ? message.body.content : '',
            hasAttachments: message.hasAttachments || false,
            importance: message.importance,
            isRead: message.isRead,
            categories: message.categories || []
        };
    }

    base64Decode(data) {
        try {
            // Remplacer les caractères URL-safe
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            // Ajouter le padding si nécessaire
            const padded = base64 + '=='.substring(0, (4 - base64.length % 4) % 4);
            // Décoder
            return decodeURIComponent(escape(atob(padded)));
        } catch (error) {
            console.error('[MailService] Base64 decode error:', error);
            return '';
        }
    }

    parseEmailAddress(emailString) {
        if (!emailString) return { name: '', address: '' };
        
        // Format: "Name" <email@domain.com>
        const match = emailString.match(/^"?([^"<]*?)"?\s*<?([^>]+)>?$/);
        
        if (match) {
            return {
                name: match[1].trim(),
                address: match[2].trim()
            };
        }
        
        // Si c'est juste une adresse email
        return {
            name: '',
            address: emailString.trim()
        };
    }

    parseRecipients(recipientString) {
        if (!recipientString) return [];
        
        const recipients = [];
        const parts = recipientString.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
        
        for (const part of parts) {
            const parsed = this.parseEmailAddress(part.trim());
            if (parsed.address) {
                recipients.push({
                    emailAddress: {
                        name: parsed.name,
                        address: parsed.address
                    }
                });
            }
        }
        
        return recipients;
    }

    getDateFilter(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    // ================================================
    // CACHE OPTIMISÉ
    // ================================================
    getCacheKey(folderId, options) {
        const key = {
            provider: this.currentProvider,
            folder: folderId,
            days: options.days,
            filter: options.filter,
            maxResults: options.maxResults
        };
        return JSON.stringify(key);
    }

    getFromCache(key) {
        const cached = this.emailCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
            return cached.data;
        }
        
        // Nettoyer les entrées expirées
        if (cached) {
            this.emailCache.delete(key);
        }
        
        return null;
    }

    setCache(key, data) {
        // Limiter la taille du cache
        if (this.emailCache.size >= 20) {
            // Supprimer les entrées les plus anciennes
            const oldestKey = this.emailCache.keys().next().value;
            this.emailCache.delete(oldestKey);
        }
        
        this.emailCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        console.log('[MailService] 🧹 Clearing cache...');
        this.emailCache.clear();
        this.stats.cacheHits = 0;
    }

    // ================================================
    // MÉTHODES PUBLIQUES
    // ================================================
    getCurrentProvider() {
        return this.currentProvider;
    }

    isInitialized() {
        return this.initialized;
    }

    getFolders() {
        return [...this.folders];
    }

    getUserEmail() {
        return this.userEmail || 'me';
    }

    async getUserInfo() {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return {
            email: this.userEmail,
            provider: this.currentProvider,
            initialized: this.initialized
        };
    }

    async setProvider(provider) {
        if (provider !== 'google' && provider !== 'microsoft') {
            throw new Error(`Invalid provider: ${provider}`);
        }
        
        console.log(`[MailService] Switching provider: ${this.currentProvider} -> ${provider}`);
        
        await this.reset();
        this.currentProvider = provider;
        sessionStorage.setItem('currentEmailProvider', provider);
        
        await this.initialize();
    }

    async reset() {
        console.log('[MailService] 🔄 Resetting...');
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
        this.userEmail = null;
        this.folders = [];
        this.clearCache();
        this.stats = {
            requestCount: 0,
            emailsFetched: 0,
            cacheHits: 0,
            errors: 0
        };
    }

    getStats() {
        return {
            ...this.stats,
            cacheSize: this.emailCache.size,
            initialized: this.initialized,
            provider: this.currentProvider
        };
    }

    setDefaultFolders() {
        console.log('[MailService] 📁 Using default folders');
        
        if (this.currentProvider === 'google') {
            this.folders = [
                { id: 'INBOX', name: 'Boîte de réception', type: 'system' },
                { id: 'SENT', name: 'Messages envoyés', type: 'system' },
                { id: 'DRAFT', name: 'Brouillons', type: 'system' },
                { id: 'TRASH', name: 'Corbeille', type: 'system' },
                { id: 'SPAM', name: 'Spam', type: 'system' }
            ];
        } else {
            this.folders = [
                { id: 'inbox', name: 'Boîte de réception' },
                { id: 'sentitems', name: 'Éléments envoyés' },
                { id: 'drafts', name: 'Brouillons' },
                { id: 'deleteditems', name: 'Éléments supprimés' },
                { id: 'junk', name: 'Courrier indésirable' }
            ];
        }
    }

    async loadGmailLabels() {
        try {
            const response = await this.fetchWithRetry('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                await this.handleApiError(response, 'Gmail labels');
            }

            const data = await response.json();
            
            this.folders = (data.labels || [])
                .filter(label => label.type === 'system' || label.type === 'user')
                .map(label => ({
                    id: label.id,
                    name: label.name,
                    type: label.type,
                    messagesTotal: label.messagesTotal || 0,
                    messagesUnread: label.messagesUnread || 0
                }));
            
        } catch (error) {
            console.error('[MailService] ❌ Gmail labels error:', error);
            throw error;
        }
    }

    async loadOutlookFolders() {
        try {
            const response = await this.fetchWithRetry('https://graph.microsoft.com/v1.0/me/mailFolders', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                await this.handleApiError(response, 'Outlook folders');
            }

            const data = await response.json();
            
            this.folders = (data.value || []).map(folder => ({
                id: folder.id,
                name: folder.displayName,
                parentFolderId: folder.parentFolderId,
                totalItemCount: folder.totalItemCount || 0,
                unreadItemCount: folder.unreadItemCount || 0
            }));
            
        } catch (error) {
            console.error('[MailService] ❌ Outlook folders error:', error);
            throw error;
        }
    }

    async getUserEmail() {
        console.log('[MailService] 👤 Getting user email...');
        
        try {
            if (this.currentProvider === 'google') {
                // Via GoogleAuthService
                if (window.googleAuthService?.getAccount) {
                    const account = window.googleAuthService.getAccount();
                    if (account?.email) {
                        this.userEmail = account.email;
                        console.log('[MailService] ✅ Email from GoogleAuthService:', this.userEmail);
                        return;
                    }
                }
                
                // Via API Gmail
                const response = await this.fetchWithRetry('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
                
                if (response.ok) {
                    const profile = await response.json();
                    this.userEmail = profile.emailAddress;
                    console.log('[MailService] ✅ Email from Gmail API:', this.userEmail);
                    return;
                }
                
            } else if (this.currentProvider === 'microsoft') {
                // Via AuthService
                if (window.authService?.getAccount) {
                    const account = window.authService.getAccount();
                    if (account?.username) {
                        this.userEmail = account.username;
                        console.log('[MailService] ✅ Email from AuthService:', this.userEmail);
                        return;
                    }
                }
                
                // Via API Graph
                const response = await this.fetchWithRetry('https://graph.microsoft.com/v1.0/me', {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
                
                if (response.ok) {
                    const profile = await response.json();
                    this.userEmail = profile.mail || profile.userPrincipalName;
                    console.log('[MailService] ✅ Email from Graph API:', this.userEmail);
                    return;
                }
            }
            
            console.warn('[MailService] ⚠️ Unable to get user email');
            this.userEmail = 'me'; // Fallback pour Gmail
            
        } catch (error) {
            console.error('[MailService] ❌ Error getting user email:', error);
            this.userEmail = 'me'; // Fallback
        }
    }
}

// ================================================
// INSTANCE GLOBALE
// ================================================
if (window.mailService) {
    console.log('[MailService] 🔄 Cleaning up old instance...');
    window.mailService.reset?.();
}

window.mailService = new MailService();

console.log('✅ MailService v12.0 loaded - Optimized with unlimited Gmail support');
console.log('🚀 Performance optimizations: batch processing, caching, retry logic');
console.log('📊 Stats tracking enabled for monitoring');
console.log('♾️ Gmail: supports unlimited emails with -1 or no maxResults parameter');
