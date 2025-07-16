// MailService.js - Version 11.0 - Service Email Multi-Provider avec Fix HTTP 400

console.log('[MailService] 🚀 Loading MailService.js v11.0 - Fixed HTTP 400...');

class MailService {
    constructor() {
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
        this.folders = [];
        this.emailCache = new Map();
        this.userEmail = null;
        
        console.log('[MailService] ✅ Service v11.0 initialized');
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        if (this.initialized) {
            console.log('[MailService] ⚠️ Déjà initialisé');
            return true;
        }

        console.log('[MailService] 🔧 Initialisation...');
        
        try {
            // 1. Détecter le provider
            await this.detectProvider();
            
            if (!this.currentProvider) {
                throw new Error('Aucun provider détecté');
            }
            
            // 2. Obtenir le token
            await this.obtainAccessToken();
            
            if (!this.accessToken) {
                throw new Error('Impossible d\'obtenir le token');
            }
            
            // 3. Obtenir l'email de l'utilisateur
            await this.getUserEmail();
            
            // 4. Charger les dossiers
            await this.loadFolders();
            
            this.initialized = true;
            console.log('[MailService] ✅ Initialisation complète');
            console.log('[MailService] 📧 Provider:', this.currentProvider);
            console.log('[MailService] 👤 User:', this.userEmail);
            
            // Dispatcher l'événement
            window.dispatchEvent(new CustomEvent('mailServiceReady', {
                detail: {
                    provider: this.currentProvider,
                    userEmail: this.userEmail,
                    initialized: true
                }
            }));
            
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur initialisation:', error);
            this.initialized = false;
            throw error;
        }
    }

    // ================================================
    // DÉTECTION DU PROVIDER
    // ================================================
    async detectProvider() {
        console.log('[MailService] 🔍 Détection du provider...');
        
        // 1. Vérifier Google
        if (window.googleAuthService?.isAuthenticated) {
            try {
                const isGoogle = await window.googleAuthService.isAuthenticated();
                if (isGoogle) {
                    this.currentProvider = 'google';
                    console.log('[MailService] ✅ Provider: Google');
                    return;
                }
            } catch (error) {
                console.warn('[MailService] ⚠️ Erreur check Google:', error);
            }
        }
        
        // 2. Vérifier Microsoft
        if (window.authService?.isAuthenticated) {
            try {
                const isMicrosoft = await window.authService.isAuthenticated();
                if (isMicrosoft) {
                    this.currentProvider = 'microsoft';
                    console.log('[MailService] ✅ Provider: Microsoft');
                    return;
                }
            } catch (error) {
                console.warn('[MailService] ⚠️ Erreur check Microsoft:', error);
            }
        }
        
        // 3. Vérifier sessionStorage
        const storedProvider = sessionStorage.getItem('currentEmailProvider');
        if (storedProvider === 'google' || storedProvider === 'microsoft') {
            this.currentProvider = storedProvider;
            console.log('[MailService] ⚠️ Provider depuis storage:', storedProvider);
            return;
        }
        
        console.log('[MailService] ❌ Aucun provider détecté');
        this.currentProvider = null;
    }

    // ================================================
    // OBTENTION DU TOKEN
    // ================================================
    async obtainAccessToken() {
        console.log('[MailService] 🔑 Obtention du token...');
        
        try {
            if (this.currentProvider === 'google') {
                // Essayer via GoogleAuthService
                if (window.googleAuthService?.getAccessToken) {
                    this.accessToken = await window.googleAuthService.getAccessToken();
                    if (this.accessToken) {
                        console.log('[MailService] ✅ Token Google obtenu via GoogleAuthService');
                        return;
                    }
                }
                
                // Essayer via gapi
                if (window.gapi?.auth2) {
                    const authInstance = window.gapi.auth2.getAuthInstance();
                    if (authInstance && authInstance.isSignedIn.get()) {
                        const user = authInstance.currentUser.get();
                        const authResponse = user.getAuthResponse();
                        this.accessToken = authResponse.access_token;
                        console.log('[MailService] ✅ Token Google obtenu via gapi');
                        return;
                    }
                }
                
                throw new Error('Impossible d\'obtenir le token Google');
                
            } else if (this.currentProvider === 'microsoft') {
                if (!window.authService?.getAccessToken) {
                    throw new Error('AuthService non disponible');
                }
                
                this.accessToken = await window.authService.getAccessToken();
                console.log('[MailService] ✅ Token Microsoft obtenu');
                
            } else {
                throw new Error(`Provider inconnu: ${this.currentProvider}`);
            }
            
            if (!this.accessToken) {
                throw new Error('Token vide');
            }
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur obtention token:', error);
            this.accessToken = null;
            throw error;
        }
    }

    // ================================================
    // OBTENTION EMAIL UTILISATEUR
    // ================================================
    async getUserEmail() {
        console.log('[MailService] 👤 Obtention email utilisateur...');
        
        try {
            if (this.currentProvider === 'google') {
                // Via GoogleAuthService
                if (window.googleAuthService?.getUserEmail) {
                    this.userEmail = await window.googleAuthService.getUserEmail();
                    if (this.userEmail) {
                        console.log('[MailService] ✅ Email obtenu:', this.userEmail);
                        return;
                    }
                }
                
                // Via API Gmail
                const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
                
                if (response.ok) {
                    const profile = await response.json();
                    this.userEmail = profile.emailAddress;
                    console.log('[MailService] ✅ Email obtenu via API:', this.userEmail);
                    return;
                }
                
            } else if (this.currentProvider === 'microsoft') {
                // Via AuthService
                if (window.authService?.getUserEmail) {
                    this.userEmail = await window.authService.getUserEmail();
                    if (this.userEmail) {
                        console.log('[MailService] ✅ Email obtenu:', this.userEmail);
                        return;
                    }
                }
                
                // Via API Graph
                const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
                
                if (response.ok) {
                    const profile = await response.json();
                    this.userEmail = profile.mail || profile.userPrincipalName;
                    console.log('[MailService] ✅ Email obtenu via API:', this.userEmail);
                    return;
                }
            }
            
            console.warn('[MailService] ⚠️ Impossible d\'obtenir l\'email utilisateur');
            this.userEmail = 'me'; // Fallback pour Gmail
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur obtention email:', error);
            this.userEmail = 'me'; // Fallback
        }
    }

    // ================================================
    // CHARGEMENT DES DOSSIERS
    // ================================================
    async loadFolders() {
        console.log('[MailService] 📁 Chargement des dossiers...');
        
        try {
            if (this.currentProvider === 'google') {
                await this.loadGmailLabels();
            } else if (this.currentProvider === 'microsoft') {
                await this.loadOutlookFolders();
            }
            
            console.log(`[MailService] ✅ ${this.folders.length} dossiers chargés`);
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur chargement dossiers:', error);
            this.setDefaultFolders();
        }
    }

    async loadGmailLabels() {
        try {
            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[MailService] Erreur API Gmail:', errorText);
                throw new Error(`HTTP ${response.status}`);
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
            
            console.log('[MailService] Labels Gmail chargés:', this.folders.map(f => f.name));
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur labels Gmail:', error);
            throw error;
        }
    }

    async loadOutlookFolders() {
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
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
            console.error('[MailService] ❌ Erreur dossiers Outlook:', error);
            throw error;
        }
    }

    setDefaultFolders() {
        console.log('[MailService] 📁 Utilisation des dossiers par défaut');
        
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

    // ================================================
    // RÉCUPÉRATION DES MESSAGES
    // ================================================
    async getMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📬 Récupération des messages depuis ${folderId}...`);
        console.log('[MailService] Options:', options);
        
        if (!this.initialized) {
            await this.initialize();
        }
        
        // Vérifier le cache
        const cacheKey = this.getCacheKey(folderId, options);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        
        try {
            let messages = [];
            
            if (this.currentProvider === 'google') {
                messages = await this.getGmailMessages(folderId, options);
            } else if (this.currentProvider === 'microsoft') {
                messages = await this.getOutlookMessages(folderId, options);
            }
            
            // Mettre en cache
            this.setCache(cacheKey, messages);
            
            console.log(`[MailService] ✅ ${messages.length} messages récupérés`);
            return messages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération messages:', error);
            
            // Si erreur 401, réinitialiser et réessayer
            if (error.message?.includes('401')) {
                console.log('[MailService] 🔄 Réinitialisation suite à erreur 401...');
                await this.reset();
                await this.initialize();
                
                // Réessayer une fois
                if (this.currentProvider === 'google') {
                    return await this.getGmailMessages(folderId, options);
                } else if (this.currentProvider === 'microsoft') {
                    return await this.getOutlookMessages(folderId, options);
                }
            }
            
            throw error;
        }
    }

    // ================================================
    // GMAIL - CORRIGÉ POUR HTTP 400
    // ================================================
    async getGmailMessages(labelId = 'INBOX', options = {}) {
        console.log(`[MailService] 📧 Récupération emails Gmail...`);
        console.log('[MailService] Label ID:', labelId);
        console.log('[MailService] Options Gmail:', options);
        
        const allMessages = [];
        let pageToken = null;
        const maxResults = Math.min(options.maxResults || 100, 100); // Limiter à 100 par page
        const totalMax = options.maxResults || 500;
        
        // Construire la query pour Gmail
        let query = '';
        
        // Ajouter le label (ATTENTION: syntaxe spéciale pour Gmail)
        if (labelId && labelId !== 'all') {
            if (labelId === 'INBOX') {
                query = 'in:inbox';
            } else if (labelId === 'SENT') {
                query = 'in:sent';
            } else if (labelId === 'DRAFT') {
                query = 'in:draft';
            } else if (labelId === 'TRASH') {
                query = 'in:trash';
            } else if (labelId === 'SPAM') {
                query = 'in:spam';
            } else {
                query = `label:${labelId}`;
            }
        }
        
        // Ajouter le filtre de date si spécifié
        if (options.days) {
            const dateFilter = `after:${this.getDateFilter(options.days)}`;
            query = query ? `${query} ${dateFilter}` : dateFilter;
        }
        
        // Ajouter d'autres filtres
        if (options.filter) {
            query = query ? `${query} ${options.filter}` : options.filter;
        }
        
        // Exclure le spam si demandé
        if (options.includeSpam === false) {
            query = query ? `${query} -in:spam` : '-in:spam';
        }
        
        console.log('[MailService] Query Gmail finale:', query);
        
        do {
            try {
                // Construire les paramètres
                const params = new URLSearchParams({
                    maxResults: maxResults.toString()
                });
                
                // Ajouter la query seulement si elle n'est pas vide
                if (query) {
                    params.append('q', query);
                }
                
                if (pageToken) {
                    params.append('pageToken', pageToken);
                }
                
                console.log('[MailService] Paramètres requête:', params.toString());
                
                // Récupérer la liste des messages
                const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`;
                console.log('[MailService] URL requête:', listUrl);
                
                const listResponse = await fetch(listUrl, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!listResponse.ok) {
                    const errorText = await listResponse.text();
                    console.error('[MailService] Erreur API Gmail:', errorText);
                    
                    // Parser l'erreur si possible
                    try {
                        const errorData = JSON.parse(errorText);
                        console.error('[MailService] Détails erreur:', errorData);
                        
                        if (errorData.error?.message) {
                            throw new Error(`Gmail API: ${errorData.error.message}`);
                        }
                    } catch (e) {
                        // Ignorer l'erreur de parsing
                    }
                    
                    throw new Error(`HTTP ${listResponse.status}: ${errorText}`);
                }
                
                const listData = await listResponse.json();
                const messageIds = listData.messages || [];
                
                console.log(`[MailService] ${messageIds.length} IDs de messages récupérés`);
                
                if (messageIds.length === 0) {
                    break;
                }
                
                // Récupérer les détails des messages
                const detailedMessages = await this.getGmailMessageDetails(messageIds);
                allMessages.push(...detailedMessages);
                
                pageToken = listData.nextPageToken;
                
                // Vérifier si on a atteint la limite
                if (allMessages.length >= totalMax) {
                    console.log('[MailService] Limite atteinte:', allMessages.length);
                    break;
                }
                
            } catch (error) {
                console.error('[MailService] Erreur dans la boucle Gmail:', error);
                throw error;
            }
            
        } while (pageToken && allMessages.length < totalMax);
        
        return allMessages.slice(0, totalMax);
    }

    getDateFilter(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    async getGmailMessageDetails(messageIds) {
        const details = [];
        
        // Traiter par batch de 5 pour éviter de surcharger
        for (let i = 0; i < messageIds.length; i += 5) {
            const batch = messageIds.slice(i, i + 5);
            
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
            
            // Petit délai entre les batches
            if (i + 5 < messageIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        return details;
    }

    async getGmailSingleMessage(messageId) {
        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                console.error(`[MailService] Erreur récupération message ${messageId}: HTTP ${response.status}`);
                return null;
            }
            
            const message = await response.json();
            return this.normalizeGmailMessage(message);
            
        } catch (error) {
            console.error(`[MailService] Erreur message ${messageId}:`, error);
            return null;
        }
    }

    normalizeGmailMessage(message) {
        const headers = message.payload?.headers || [];
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
        
        // Extraire le contenu
        const content = this.extractGmailContent(message.payload);
        
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

    extractGmailContent(payload) {
        let text = '';
        let html = '';
        let hasAttachments = false;
        
        if (!payload) return { text, html, hasAttachments };
        
        // Fonction récursive pour extraire le contenu
        const extractFromPart = (part) => {
            // Si c'est une pièce jointe
            if (part.filename && part.filename.length > 0) {
                hasAttachments = true;
                return;
            }
            
            // Si c'est du contenu direct
            if (part.body?.data) {
                const decoded = this.base64Decode(part.body.data);
                if (part.mimeType === 'text/plain' && !text) {
                    text = decoded;
                } else if (part.mimeType === 'text/html' && !html) {
                    html = decoded;
                }
            }
            
            // Si c'est multipart, parcourir les sous-parties
            if (part.parts && Array.isArray(part.parts)) {
                part.parts.forEach(subPart => extractFromPart(subPart));
            }
        };
        
        extractFromPart(payload);
        
        return { text, html, hasAttachments };
    }

    // ================================================
    // OUTLOOK
    // ================================================
    async getOutlookMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📂 Récupération emails Outlook...`);
        
        const allMessages = [];
        let nextLink = null;
        const maxResults = options.maxResults || 500;
        
        // Construire le filtre pour Outlook
        let filter = '';
        
        if (options.days) {
            const date = new Date();
            date.setDate(date.getDate() - options.days);
            filter = `receivedDateTime ge ${date.toISOString()}`;
        }
        
        if (options.filter) {
            filter = filter ? `${filter} and ${options.filter}` : options.filter;
        }
        
        do {
            let url;
            
            if (nextLink) {
                url = nextLink;
            } else {
                const params = new URLSearchParams({
                    '$top': Math.min(maxResults - allMessages.length, 50).toString(),
                    '$select': 'id,conversationId,receivedDateTime,subject,body,bodyPreview,importance,isRead,hasAttachments,from,toRecipients,ccRecipients',
                    '$orderby': 'receivedDateTime desc'
                });
                
                if (filter) {
                    params.append('$filter', filter);
                }
                
                url = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages?${params}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[MailService] Erreur API Outlook:', errorText);
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            const messages = data.value || [];
            
            // Normaliser les messages
            const normalized = messages.map(msg => this.normalizeOutlookMessage(msg));
            allMessages.push(...normalized);
            
            nextLink = data['@odata.nextLink'];
            
        } while (nextLink && allMessages.length < maxResults);
        
        return allMessages.slice(0, maxResults);
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

    // ================================================
    // UTILITAIRES
    // ================================================
    base64Decode(data) {
        try {
            // Remplacer les caractères URL-safe par les caractères standards
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            // Ajouter le padding si nécessaire
            const padded = base64 + '=='.substring(0, (4 - base64.length % 4) % 4);
            // Décoder
            return decodeURIComponent(escape(atob(padded)));
        } catch (error) {
            console.error('[MailService] Erreur décodage base64:', error);
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
        
        // Diviser par virgule en tenant compte des guillemets
        const recipients = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < recipientString.length; i++) {
            const char = recipientString[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            
            if (char === ',' && !inQuotes) {
                if (current.trim()) {
                    const parsed = this.parseEmailAddress(current.trim());
                    if (parsed.address) {
                        recipients.push({
                            emailAddress: {
                                name: parsed.name,
                                address: parsed.address
                            }
                        });
                    }
                }
                current = '';
            } else {
                current += char;
            }
        }
        
        // Dernier destinataire
        if (current.trim()) {
            const parsed = this.parseEmailAddress(current.trim());
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
        return this.userEmail;
    }

    async setProvider(provider) {
        if (provider !== 'google' && provider !== 'microsoft') {
            throw new Error(`Provider invalide: ${provider}`);
        }
        
        console.log(`[MailService] Changement de provider: ${this.currentProvider} -> ${provider}`);
        
        await this.reset();
        this.currentProvider = provider;
        sessionStorage.setItem('currentEmailProvider', provider);
        
        await this.initialize();
    }

    async reset() {
        console.log('[MailService] 🔄 Réinitialisation...');
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
        this.userEmail = null;
        this.folders = [];
        this.emailCache.clear();
    }

    // ================================================
    // CACHE
    // ================================================
    getCacheKey(folderId, options) {
        return `${this.currentProvider}_${folderId}_${JSON.stringify(options)}`;
    }

    getFromCache(key) {
        const cached = this.emailCache.get(key);
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
            console.log('[MailService] 📦 Utilisation du cache');
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.emailCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        // Limiter la taille du cache
        if (this.emailCache.size > 10) {
            const firstKey = this.emailCache.keys().next().value;
            this.emailCache.delete(firstKey);
        }
    }

    clearCache() {
        console.log('[MailService] 🧹 Vidage du cache');
        this.emailCache.clear();
    }
}

// ================================================
// INSTANCE GLOBALE
// ================================================
if (window.mailService) {
    console.log('[MailService] 🔄 Nettoyage ancienne instance...');
    window.mailService.reset?.();
}

window.mailService = new MailService();

console.log('✅ MailService v11.0 loaded - Fixed HTTP 400 Error');
