// MailService.js - Version 13.0 - Service Email Unifié avec extraction complète
// Support Gmail/Outlook avec normalisation complète du contenu

console.log('[MailService] 🚀 Loading MailService.js v13.0 - Service unifié avec extraction complète...');

class MailService {
    constructor() {
        // État du service
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
        this.userEmail = null;
        this.folders = [];
        
        // Cache et optimisation
        this.emailCache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
        this.tokenCache = {
            gmail: { token: null, expires: 0 },
            outlook: { token: null, expires: 0 }
        };
        
        // Métadonnées des providers
        this.providers = {
            gmail: {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#4285f4',
                apiBase: 'https://gmail.googleapis.com/gmail/v1',
                scopes: [
                    'https://www.googleapis.com/auth/gmail.readonly',
                    'https://www.googleapis.com/auth/gmail.modify'
                ]
            },
            outlook: {
                name: 'Outlook',
                icon: 'fab fa-microsoft', 
                color: '#0078d4',
                apiBase: 'https://graph.microsoft.com/v1.0',
                scopes: ['Mail.Read', 'Mail.ReadWrite']
            }
        };
        
        // Configuration des limites
        this.limits = {
            maxBatchSize: 100,
            maxConcurrentRequests: 5,
            rateLimitDelay: 100
        };
        
        console.log('[MailService] ✅ Service v13.0 initialisé');
    }

    // ================================================
    // INITIALISATION ET AUTHENTIFICATION
    // ================================================
    async initialize() {
        if (this.initialized) {
            console.log('[MailService] ⚠️ Déjà initialisé');
            return true;
        }

        console.log('[MailService] 🔧 Initialisation...');
        
        try {
            // 1. Détecter le provider actuel
            await this.detectCurrentProvider();
            
            if (!this.currentProvider) {
                console.log('[MailService] ⚠️ Aucun provider détecté');
                return false;
            }
            
            // 2. Obtenir le token d'accès
            await this.refreshAccessToken();
            
            if (!this.accessToken) {
                console.log('[MailService] ⚠️ Pas de token d\'accès');
                return false;
            }
            
            // 3. Obtenir les informations utilisateur
            await this.loadUserInfo();
            
            // 4. Charger les dossiers
            await this.loadFolders();
            
            this.initialized = true;
            console.log('[MailService] ✅ Initialisation complète');
            console.log('[MailService] 📧 Provider:', this.currentProvider);
            console.log('[MailService] 👤 User:', this.userEmail);
            
            // Dispatcher l'événement
            this.dispatchEvent('mailServiceReady', {
                provider: this.currentProvider,
                userEmail: this.userEmail
            });
            
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur initialisation:', error);
            this.initialized = false;
            return false;
        }
    }

    async detectCurrentProvider() {
        console.log('[MailService] 🔍 Détection du provider actuel...');
        
        // Réinitialiser
        this.currentProvider = null;
        
        // 1. Vérifier Gmail
        if (await this.checkGmailAuth()) {
            this.currentProvider = 'gmail';
            console.log('[MailService] ✅ Gmail détecté');
            return;
        }
        
        // 2. Vérifier Outlook
        if (await this.checkOutlookAuth()) {
            this.currentProvider = 'outlook';
            console.log('[MailService] ✅ Outlook détecté');
            return;
        }
        
        // 3. Vérifier sessionStorage pour le dernier provider
        const lastProvider = sessionStorage.getItem('lastEmailProvider');
        if (lastProvider === 'gmail' || lastProvider === 'outlook') {
            console.log('[MailService] 📦 Utilisation du dernier provider:', lastProvider);
            this.currentProvider = lastProvider;
            
            // Vérifier si toujours authentifié
            const isAuth = lastProvider === 'gmail' ? 
                await this.checkGmailAuth() : 
                await this.checkOutlookAuth();
            
            if (!isAuth) {
                this.currentProvider = null;
                sessionStorage.removeItem('lastEmailProvider');
            }
        }
        
        console.log('[MailService] 📧 Provider actuel:', this.currentProvider || 'Aucun');
    }

    async checkGmailAuth() {
        try {
            // GoogleAuthService
            if (window.googleAuthService?.isAuthenticated) {
                const isAuth = window.googleAuthService.isAuthenticated();
                console.log('[MailService] GoogleAuthService auth:', isAuth);
                return isAuth;
            }
            
            // GAPI (fallback)
            if (window.gapi?.auth2) {
                const authInstance = window.gapi.auth2.getAuthInstance();
                return authInstance && authInstance.isSignedIn.get();
            }
            
            return false;
        } catch (error) {
            console.warn('[MailService] Erreur vérification Gmail:', error);
            return false;
        }
    }

    async checkOutlookAuth() {
        try {
            // AuthService
            if (window.authService?.isAuthenticated) {
                return window.authService.isAuthenticated();
            }
            
            // MSAL (fallback)
            if (window.msalInstance) {
                const accounts = window.msalInstance.getAllAccounts();
                return accounts && accounts.length > 0;
            }
            
            return false;
        } catch (error) {
            console.warn('[MailService] Erreur vérification Outlook:', error);
            return false;
        }
    }

    async refreshAccessToken() {
        console.log('[MailService] 🔑 Rafraîchissement du token...');
        
        const now = Date.now();
        
        // Vérifier le cache
        if (this.tokenCache[this.currentProvider]) {
            const cached = this.tokenCache[this.currentProvider];
            if (cached.token && cached.expires > now) {
                console.log('[MailService] ✅ Utilisation du token en cache');
                this.accessToken = cached.token;
                return;
            }
        }
        
        try {
            let token = null;
            let expiresIn = 3600; // Par défaut 1 heure
            
            if (this.currentProvider === 'gmail') {
                token = await this.getGmailToken();
            } else if (this.currentProvider === 'outlook') {
                token = await this.getOutlookToken();
            }
            
            if (token) {
                this.accessToken = token;
                
                // Mettre en cache
                this.tokenCache[this.currentProvider] = {
                    token: token,
                    expires: now + (expiresIn * 1000)
                };
                
                console.log('[MailService] ✅ Token rafraîchi');
            } else {
                throw new Error('Impossible d\'obtenir un token');
            }
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur rafraîchissement token:', error);
            this.accessToken = null;
            throw error;
        }
    }

    async getGmailToken() {
        // 1. GoogleAuthService (priorité)
        if (window.googleAuthService?.getAccessToken) {
            const token = await window.googleAuthService.getAccessToken();
            if (token) {
                console.log('[MailService] Token obtenu via GoogleAuthService');
                return token;
            }
        }
        
        // 2. GAPI (fallback)
        if (window.gapi?.auth2) {
            const authInstance = window.gapi.auth2.getAuthInstance();
            if (authInstance && authInstance.isSignedIn.get()) {
                const user = authInstance.currentUser.get();
                const authResponse = user.getAuthResponse();
                return authResponse.access_token;
            }
        }
        
        return null;
    }

    async getOutlookToken() {
        // 1. AuthService
        if (window.authService?.getAccessToken) {
            return await window.authService.getAccessToken();
        }
        
        // 2. MSAL (fallback)
        if (window.msalInstance) {
            const accounts = window.msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                const request = {
                    scopes: this.providers.outlook.scopes,
                    account: accounts[0]
                };
                
                try {
                    const response = await window.msalInstance.acquireTokenSilent(request);
                    return response.accessToken;
                } catch (error) {
                    const response = await window.msalInstance.acquireTokenPopup(request);
                    return response.accessToken;
                }
            }
        }
        
        return null;
    }

    async loadUserInfo() {
        console.log('[MailService] 👤 Chargement des informations utilisateur...');
        
        try {
            if (this.currentProvider === 'gmail') {
                await this.loadGmailUserInfo();
            } else if (this.currentProvider === 'outlook') {
                await this.loadOutlookUserInfo();
            }
            
            console.log('[MailService] ✅ Infos utilisateur chargées:', this.userEmail);
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur infos utilisateur:', error);
            this.userEmail = 'me'; // Fallback
        }
    }

    async loadGmailUserInfo() {
        // 1. GoogleAuthService
        if (window.googleAuthService?.getAccount) {
            const account = window.googleAuthService.getAccount();
            if (account) {
                this.userEmail = account.email;
                return;
            }
        }
        
        // 2. API Gmail
        if (this.accessToken) {
            const response = await fetch(`${this.providers.gmail.apiBase}/users/me/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const profile = await response.json();
                this.userEmail = profile.emailAddress;
            }
        }
    }

    async loadOutlookUserInfo() {
        // 1. AuthService
        if (window.authService?.getUserInfo) {
            const userInfo = await window.authService.getUserInfo();
            if (userInfo) {
                this.userEmail = userInfo.mail || userInfo.userPrincipalName;
                return;
            }
        }
        
        // 2. API Graph
        if (this.accessToken) {
            const response = await fetch(`${this.providers.outlook.apiBase}/me`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const profile = await response.json();
                this.userEmail = profile.mail || profile.userPrincipalName;
            }
        }
    }

    async loadFolders() {
        console.log('[MailService] 📁 Chargement des dossiers...');
        
        try {
            if (this.currentProvider === 'gmail') {
                await this.loadGmailFolders();
            } else if (this.currentProvider === 'outlook') {
                await this.loadOutlookFolders();
            }
            
            console.log(`[MailService] ✅ ${this.folders.length} dossiers chargés`);
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur chargement dossiers:', error);
            this.setDefaultFolders();
        }
    }

    async loadGmailFolders() {
        const response = await fetch(`${this.providers.gmail.apiBase}/users/me/labels`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Gmail API error: ${response.status}`);
        }

        const data = await response.json();
        
        this.folders = (data.labels || [])
            .filter(label => label.type === 'system' || label.type === 'user')
            .map(label => ({
                id: label.id,
                name: label.name,
                type: label.type,
                provider: 'gmail',
                messagesTotal: label.messagesTotal || 0,
                messagesUnread: label.messagesUnread || 0
            }));
    }

    async loadOutlookFolders() {
        const response = await fetch(`${this.providers.outlook.apiBase}/me/mailFolders`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Outlook API error: ${response.status}`);
        }

        const data = await response.json();
        
        this.folders = (data.value || []).map(folder => ({
            id: folder.id,
            name: folder.displayName,
            provider: 'outlook',
            parentFolderId: folder.parentFolderId,
            totalItemCount: folder.totalItemCount || 0,
            unreadItemCount: folder.unreadItemCount || 0
        }));
    }

    setDefaultFolders() {
        console.log('[MailService] 📁 Utilisation des dossiers par défaut');
        
        if (this.currentProvider === 'gmail') {
            this.folders = [
                { id: 'INBOX', name: 'Inbox', type: 'system', provider: 'gmail' },
                { id: 'SENT', name: 'Sent', type: 'system', provider: 'gmail' },
                { id: 'DRAFT', name: 'Drafts', type: 'system', provider: 'gmail' },
                { id: 'SPAM', name: 'Spam', type: 'system', provider: 'gmail' },
                { id: 'TRASH', name: 'Trash', type: 'system', provider: 'gmail' }
            ];
        } else {
            this.folders = [
                { id: 'inbox', name: 'Inbox', provider: 'outlook' },
                { id: 'sentitems', name: 'Sent Items', provider: 'outlook' },
                { id: 'drafts', name: 'Drafts', provider: 'outlook' },
                { id: 'junk', name: 'Junk Email', provider: 'outlook' },
                { id: 'deleteditems', name: 'Deleted Items', provider: 'outlook' }
            ];
        }
    }

    // ================================================
    // RÉCUPÉRATION DES MESSAGES - MÉTHODE PRINCIPALE
    // ================================================
    async getMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📬 === RÉCUPÉRATION DES MESSAGES ===`);
        console.log('[MailService] Dossier:', folderId);
        console.log('[MailService] Options:', options);
        
        if (!this.initialized) {
            console.log('[MailService] ⚠️ Service non initialisé, initialisation...');
            await this.initialize();
        }
        
        // Vérifier le cache
        const cacheKey = this.getCacheKey(folderId, options);
        const cached = this.getCachedData(cacheKey);
        if (cached && !options.forceRefresh) {
            console.log('[MailService] 📦 Retour depuis le cache');
            return cached;
        }
        
        try {
            // Rafraîchir le token si nécessaire
            await this.refreshAccessToken();
            
            let messages = [];
            
            if (this.currentProvider === 'gmail') {
                // Utiliser GoogleAuthService si disponible
                if (window.googleAuthService?.fetchEmails) {
                    console.log('[MailService] Utilisation de GoogleAuthService pour Gmail');
                    messages = await this.getGmailMessagesViaAuthService(folderId, options);
                } else {
                    console.log('[MailService] Utilisation de l\'API Gmail directe');
                    messages = await this.getGmailMessages(folderId, options);
                }
            } else if (this.currentProvider === 'outlook') {
                messages = await this.getOutlookMessages(folderId, options);
            }
            
            // Mettre en cache
            this.setCachedData(cacheKey, messages);
            
            console.log(`[MailService] ✅ ${messages.length} messages récupérés`);
            return messages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération messages:', error);
            
            // Si erreur 401, réinitialiser et réessayer une fois
            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                console.log('[MailService] 🔄 Tentative après réauth...');
                await this.reset();
                await this.initialize();
                
                // Une seule retry
                if (this.currentProvider === 'gmail') {
                    return await this.getGmailMessages(folderId, options);
                } else if (this.currentProvider === 'outlook') {
                    return await this.getOutlookMessages(folderId, options);
                }
            }
            
            throw error;
        }
    }

    // ================================================
    // RÉCUPÉRATION GMAIL VIA GOOGLEAUTHSERVICE
    // ================================================
    async getGmailMessagesViaAuthService(labelId = 'INBOX', options = {}) {
        console.log('[MailService] 📧 Récupération Gmail via GoogleAuthService...');
        
        // Préparer les options pour GoogleAuthService
        const fetchOptions = {
            maxResults: options.maxResults || 500,
            days: options.days,
            folder: labelId,
            includeSpam: options.includeSpam !== false,
            onProgress: options.onProgress
        };
        
        // Récupérer les emails via GoogleAuthService
        const emails = await window.googleAuthService.fetchEmails(fetchOptions);
        
        // Les emails sont déjà au bon format grâce à GoogleAuthService v8.0
        // On s'assure juste qu'ils ont tous les champs nécessaires
        return emails.map(email => ({
            ...email,
            provider: 'gmail',
            providerType: 'gmail',
            source: 'gmail'
        }));
    }

    // ================================================
    // RÉCUPÉRATION GMAIL DIRECTE (FALLBACK)
    // ================================================
    async getGmailMessages(labelId = 'INBOX', options = {}) {
        console.log(`[MailService] 📧 Récupération Gmail directe...`);
        
        const messages = [];
        let pageToken = null;
        const maxResults = Math.min(options.maxResults || 100, 100);
        const totalMax = options.maxResults || 500;
        
        // Construire la query
        let query = this.buildGmailQuery(labelId, options);
        console.log('[MailService] Query Gmail:', query);
        
        do {
            const params = new URLSearchParams({
                maxResults: maxResults.toString()
            });
            
            if (query) params.append('q', query);
            if (pageToken) params.append('pageToken', pageToken);
            
            // Liste des messages
            const listResponse = await fetch(
                `${this.providers.gmail.apiBase}/users/me/messages?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!listResponse.ok) {
                const error = await listResponse.text();
                throw new Error(`Gmail API error ${listResponse.status}: ${error}`);
            }
            
            const listData = await listResponse.json();
            const messageIds = listData.messages || [];
            
            if (messageIds.length === 0) break;
            
            // Récupérer les détails
            const batch = await this.getGmailMessageDetails(messageIds, options);
            messages.push(...batch);
            
            pageToken = listData.nextPageToken;
            
            // Progress callback
            if (options.onProgress) {
                options.onProgress({
                    phase: 'fetching',
                    message: `${messages.length} emails récupérés...`,
                    progress: { current: messages.length, total: totalMax }
                });
            }
            
            // Limiter au maximum demandé
            if (messages.length >= totalMax) break;
            
            // Rate limiting
            if (pageToken) {
                await new Promise(resolve => setTimeout(resolve, this.limits.rateLimitDelay));
            }
            
        } while (pageToken && messages.length < totalMax);
        
        return messages.slice(0, totalMax);
    }

    buildGmailQuery(labelId, options) {
        const parts = [];
        
        // Label/Folder
        if (labelId && labelId !== 'all') {
            if (labelId === 'INBOX') parts.push('in:inbox');
            else if (labelId === 'SENT') parts.push('in:sent');
            else if (labelId === 'DRAFT') parts.push('in:draft');
            else if (labelId === 'SPAM') parts.push('in:spam');
            else if (labelId === 'TRASH') parts.push('in:trash');
            else parts.push(`label:${labelId}`);
        }
        
        // Date filter
        if (options.days && options.days > 0) {
            const date = new Date();
            date.setDate(date.getDate() - options.days);
            parts.push(`after:${date.toISOString().split('T')[0]}`);
        }
        
        // Additional filters
        if (options.filter) parts.push(options.filter);
        
        // Exclude spam
        if (options.includeSpam === false) {
            parts.push('-in:spam');
        }
        
        return parts.join(' ');
    }

    async getGmailMessageDetails(messageIds, options) {
        const details = [];
        const batchSize = Math.min(this.limits.maxBatchSize, 10);
        
        for (let i = 0; i < messageIds.length; i += batchSize) {
            const batch = messageIds.slice(i, i + batchSize);
            
            const promises = batch.map(msg => 
                this.getGmailSingleMessage(msg.id).catch(error => {
                    console.error(`[MailService] Erreur message ${msg.id}:`, error);
                    return null;
                })
            );
            
            const results = await Promise.all(promises);
            
            results.forEach(message => {
                if (message) {
                    details.push(message);
                }
            });
            
            // Rate limiting entre les batches
            if (i + batchSize < messageIds.length) {
                await new Promise(resolve => setTimeout(resolve, this.limits.rateLimitDelay));
            }
        }
        
        return details;
    }

    async getGmailSingleMessage(messageId) {
        const response = await fetch(
            `${this.providers.gmail.apiBase}/users/me/messages/${messageId}?format=full`,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Failed to get message ${messageId}: ${response.status}`);
        }
        
        const message = await response.json();
        return this.normalizeGmailMessage(message);
    }

    // ================================================
    // NORMALISATION DES MESSAGES GMAIL
    // ================================================
    normalizeGmailMessage(message) {
        const headers = this.extractGmailHeaders(message.payload?.headers || []);
        const content = this.extractGmailContent(message.payload);
        
        // Créer le contenu textuel complet pour l'analyse
        let fullTextContent = '';
        
        // 1. Ajouter le sujet (très important)
        if (headers.subject) {
            fullTextContent += headers.subject + '\n\n';
        }
        
        // 2. Ajouter l'expéditeur
        if (headers.from) {
            fullTextContent += 'From: ' + headers.from + '\n';
        }
        
        // 3. Ajouter le corps complet
        if (content.text) {
            fullTextContent += content.text + '\n';
        } else if (content.html) {
            fullTextContent += this.htmlToText(content.html) + '\n';
        }
        
        // 4. Ajouter le snippet si différent
        if (message.snippet && !fullTextContent.includes(message.snippet)) {
            fullTextContent += '\n' + message.snippet;
        }
        
        return {
            // Identifiants
            id: message.id,
            threadId: message.threadId,
            provider: 'gmail',
            providerType: 'gmail',
            source: 'gmail',
            
            // Métadonnées principales
            receivedDateTime: new Date(parseInt(message.internalDate)).toISOString(),
            subject: headers.subject || '(No subject)',
            
            // Expéditeur et destinataires
            from: this.parseEmailAddress(headers.from),
            toRecipients: this.parseRecipients(headers.to),
            ccRecipients: this.parseRecipients(headers.cc),
            
            // Corps du message
            bodyPreview: message.snippet || '',
            body: {
                content: content.html || content.text || '',
                contentType: content.html ? 'html' : 'text'
            },
            
            // IMPORTANT: Contenu complet pour CategoryManager
            fullTextContent: fullTextContent.trim(),
            
            // Métadonnées supplémentaires
            hasAttachments: content.hasAttachments,
            labels: message.labelIds || [],
            isRead: !message.labelIds?.includes('UNREAD'),
            importance: message.labelIds?.includes('IMPORTANT') ? 'high' : 'normal',
            headers: headers,
            
            // Métadonnées Gmail
            gmailMetadata: {
                historyId: message.historyId,
                snippet: message.snippet,
                sizeEstimate: message.sizeEstimate,
                labels: message.labelIds || []
            }
        };
    }

    extractGmailHeaders(headers) {
        const result = {};
        headers.forEach(header => {
            const name = header.name.toLowerCase();
            result[name] = header.value;
        });
        return result;
    }

    extractGmailContent(payload) {
        let text = '';
        let html = '';
        let hasAttachments = false;
        
        const extractFromPart = (part) => {
            if (part.filename && part.filename.length > 0) {
                hasAttachments = true;
                return;
            }
            
            if (part.body?.data) {
                const decoded = this.base64Decode(part.body.data);
                if (part.mimeType === 'text/plain') {
                    text += decoded + '\n';
                } else if (part.mimeType === 'text/html') {
                    html += decoded;
                }
            }
            
            if (part.parts && Array.isArray(part.parts)) {
                part.parts.forEach(extractFromPart);
            }
        };
        
        if (payload) extractFromPart(payload);
        
        return { 
            text: text.trim(), 
            html: html.trim(), 
            hasAttachments 
        };
    }

    // ================================================
    // RÉCUPÉRATION DES MESSAGES OUTLOOK
    // ================================================
    async getOutlookMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📂 Récupération Outlook...`);
        
        const messages = [];
        let nextLink = null;
        const maxResults = options.maxResults || 500;
        
        // Construire le filtre
        let filter = this.buildOutlookFilter(options);
        console.log('[MailService] Filtre Outlook:', filter);
        
        do {
            let url;
            
            if (nextLink) {
                url = nextLink;
            } else {
                const params = new URLSearchParams({
                    '$top': Math.min(maxResults - messages.length, 50).toString(),
                    '$select': 'id,conversationId,receivedDateTime,subject,body,bodyPreview,importance,isRead,hasAttachments,from,toRecipients,ccRecipients,flag,categories',
                    '$orderby': 'receivedDateTime desc'
                });
                
                if (filter) params.append('$filter', filter);
                
                url = `${this.providers.outlook.apiBase}/me/mailFolders/${folderId}/messages?${params}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Outlook API error ${response.status}: ${error}`);
            }
            
            const data = await response.json();
            const batch = data.value || [];
            
            // Normaliser les messages
            const normalized = batch.map(msg => this.normalizeOutlookMessage(msg));
            messages.push(...normalized);
            
            nextLink = data['@odata.nextLink'];
            
            // Progress callback
            if (options.onProgress) {
                options.onProgress({
                    phase: 'fetching',
                    message: `${messages.length} emails récupérés...`,
                    progress: { current: messages.length, total: maxResults }
                });
            }
            
            // Rate limiting
            if (nextLink && messages.length < maxResults) {
                await new Promise(resolve => setTimeout(resolve, this.limits.rateLimitDelay));
            }
            
        } while (nextLink && messages.length < maxResults);
        
        return messages.slice(0, maxResults);
    }

    buildOutlookFilter(options) {
        const filters = [];
        
        // Date filter
        if (options.days && options.days > 0) {
            const date = new Date();
            date.setDate(date.getDate() - options.days);
            filters.push(`receivedDateTime ge ${date.toISOString()}`);
        }
        
        // Additional filters
        if (options.filter) {
            filters.push(options.filter);
        }
        
        return filters.join(' and ');
    }

    // ================================================
    // NORMALISATION DES MESSAGES OUTLOOK
    // ================================================
    normalizeOutlookMessage(message) {
        // Créer le contenu textuel complet pour l'analyse
        let fullTextContent = '';
        
        // 1. Ajouter le sujet
        if (message.subject) {
            fullTextContent += message.subject + '\n\n';
        }
        
        // 2. Ajouter l'expéditeur
        if (message.from?.emailAddress?.address) {
            fullTextContent += 'From: ' + message.from.emailAddress.name + ' <' + message.from.emailAddress.address + '>\n';
        }
        
        // 3. Ajouter le corps
        let bodyText = '';
        if (message.body?.contentType === 'html') {
            bodyText = this.htmlToText(message.body.content);
        } else {
            bodyText = message.body?.content || '';
        }
        fullTextContent += bodyText;
        
        // 4. Ajouter le bodyPreview si différent
        if (message.bodyPreview && !fullTextContent.includes(message.bodyPreview)) {
            fullTextContent += '\n' + message.bodyPreview;
        }
        
        return {
            // Identifiants
            id: message.id,
            conversationId: message.conversationId,
            provider: 'outlook',
            providerType: 'outlook',
            source: 'outlook',
            
            // Métadonnées principales
            receivedDateTime: message.receivedDateTime,
            subject: message.subject || '(No subject)',
            
            // Expéditeur et destinataires
            from: message.from,
            toRecipients: message.toRecipients || [],
            ccRecipients: message.ccRecipients || [],
            
            // Corps du message
            bodyPreview: message.bodyPreview || '',
            body: message.body || { content: '', contentType: 'text' },
            
            // IMPORTANT: Contenu complet pour CategoryManager
            fullTextContent: fullTextContent.trim(),
            
            // Métadonnées supplémentaires
            hasAttachments: message.hasAttachments || false,
            importance: message.importance,
            isRead: message.isRead,
            categories: message.categories || [],
            flag: message.flag,
            
            // Headers (Outlook n'expose pas directement les headers)
            headers: {
                subject: message.subject,
                from: message.from?.emailAddress?.address,
                to: message.toRecipients?.map(r => r.emailAddress?.address).join(', ')
            }
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    base64Decode(data) {
        try {
            // Remplacer les caractères URL-safe
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            // Ajouter le padding
            const padded = base64 + '=='.substring(0, (4 - base64.length % 4) % 4);
            // Décoder
            return decodeURIComponent(escape(atob(padded)));
        } catch (error) {
            console.error('[MailService] Erreur décodage base64:', error);
            return '';
        }
    }

    htmlToText(html) {
        if (!html) return '';
        
        // Créer un élément temporaire
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Supprimer les scripts et styles
        const scripts = temp.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());
        
        // Préserver les sauts de ligne
        temp.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        temp.querySelectorAll('p, div').forEach(el => {
            if (el.textContent.trim()) {
                el.innerHTML = '\n' + el.innerHTML + '\n';
            }
        });
        temp.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
            el.innerHTML = '\n\n' + el.innerHTML + '\n\n';
        });
        
        // Extraire le texte
        let text = temp.textContent || temp.innerText || '';
        
        // Nettoyer
        text = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/[ \t]+\n/g, '\n')
            .trim();
        
        return text;
    }

    parseEmailAddress(emailString) {
        if (!emailString) return { emailAddress: { address: '', name: '' } };
        
        const match = emailString.match(/^"?([^"<]*?)"?\s*<?([^>]+)>?$/);
        
        if (match) {
            return {
                emailAddress: {
                    name: match[1].trim() || match[2].split('@')[0],
                    address: match[2].trim()
                }
            };
        }
        
        return {
            emailAddress: {
                name: emailString.split('@')[0],
                address: emailString.trim()
            }
        };
    }

    parseRecipients(recipientString) {
        if (!recipientString) return [];
        
        const recipients = [];
        const parts = recipientString.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
        
        parts.forEach(part => {
            const parsed = this.parseEmailAddress(part.trim());
            if (parsed.emailAddress.address) {
                recipients.push(parsed);
            }
        });
        
        return recipients;
    }

    // ================================================
    // GESTION DU CACHE
    // ================================================
    getCacheKey(folderId, options) {
        return `${this.currentProvider}_${folderId}_${JSON.stringify(options)}`;
    }

    getCachedData(key) {
        const cached = this.emailCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.emailCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        // Limiter la taille du cache
        if (this.emailCache.size > 20) {
            const firstKey = this.emailCache.keys().next().value;
            this.emailCache.delete(firstKey);
        }
    }

    clearCache() {
        console.log('[MailService] 🧹 Vidage du cache...');
        this.emailCache.clear();
    }

    // ================================================
    // MÉTHODES PUBLIQUES
    // ================================================
    isInitialized() {
        return this.initialized;
    }

    getCurrentProvider() {
        return this.currentProvider;
    }

    getUserEmail() {
        return this.userEmail;
    }

    getFolders() {
        return [...this.folders];
    }

    async setProvider(provider) {
        if (provider !== 'gmail' && provider !== 'outlook') {
            throw new Error(`Provider invalide: ${provider}`);
        }
        
        console.log(`[MailService] Changement de provider: ${this.currentProvider} -> ${provider}`);
        
        await this.reset();
        this.currentProvider = provider;
        sessionStorage.setItem('lastEmailProvider', provider);
        
        await this.initialize();
    }

    async authenticate(provider) {
        console.log(`[MailService] 🔐 Authentification ${provider}...`);
        
        if (provider === 'gmail' || provider === 'google') {
            if (window.googleAuthService?.login) {
                await window.googleAuthService.login();
            } else if (window.gapi?.auth2) {
                const authInstance = window.gapi.auth2.getAuthInstance();
                await authInstance.signIn();
            } else {
                throw new Error('Service d\'authentification Gmail non disponible');
            }
        } else if (provider === 'outlook' || provider === 'microsoft') {
            if (window.authService?.login) {
                await window.authService.login();
            } else if (window.msalInstance) {
                await window.msalInstance.loginPopup();
            } else {
                throw new Error('Service d\'authentification Outlook non disponible');
            }
        }
        
        // Réinitialiser après authentification
        await this.reset();
        await this.initialize();
    }

    async reset() {
        console.log('[MailService] 🔄 Réinitialisation...');
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
        this.userEmail = null;
        this.folders = [];
        this.clearCache();
    }

    dispatchEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { 
            detail: {
                ...detail,
                source: 'MailService',
                timestamp: Date.now()
            }
        }));
    }

    // ================================================
    // MÉTHODES DE DIAGNOSTIC
    // ================================================
    getDiagnostics() {
        return {
            initialized: this.initialized,
            currentProvider: this.currentProvider,
            hasAccessToken: !!this.accessToken,
            userEmail: this.userEmail,
            foldersCount: this.folders.length,
            cacheSize: this.emailCache.size,
            tokenCache: {
                gmail: this.tokenCache.gmail.expires > Date.now(),
                outlook: this.tokenCache.outlook.expires > Date.now()
            }
        };
    }

    async testConnection() {
        console.log('[MailService] 🧪 Test de connexion...');
        
        try {
            if (!this.initialized) {
                await this.initialize();
            }
            
            // Essayer de récupérer 1 message
            const messages = await this.getMessages('inbox', { 
                maxResults: 1,
                forceRefresh: true 
            });
            
            return {
                success: true,
                provider: this.currentProvider,
                userEmail: this.userEmail,
                testMessageFound: messages.length > 0
            };
            
        } catch (error) {
            return {
                success: false,
                provider: this.currentProvider,
                error: error.message
            };
        }
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================

// Nettoyer l'ancienne instance
if (window.mailService) {
    console.log('[MailService] 🔄 Nettoyage de l\'ancienne instance...');
    window.mailService.reset?.();
}

// Créer la nouvelle instance
window.mailService = new MailService();

console.log('[MailService] ✅ MailService v13.0 chargé - Service unifié avec extraction complète!');
