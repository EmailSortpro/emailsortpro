// MailService.js - Version 10.0 - Service Email Multi-Provider Simplifié

console.log('[MailService] 🚀 Loading MailService.js v10.0 - Simplified Multi-Provider...');

class MailService {
    constructor() {
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
        this.folders = [];
        this.emailCache = new Map();
        
        console.log('[MailService] ✅ Service v10.0 initialized');
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
            
            // 3. Charger les dossiers
            await this.loadFolders();
            
            this.initialized = true;
            console.log('[MailService] ✅ Initialisation complète');
            
            // Dispatcher l'événement
            window.dispatchEvent(new CustomEvent('mailServiceReady', {
                detail: {
                    provider: this.currentProvider,
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
        const storedProvider = sessionStorage.getItem('currentProvider');
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
                if (!window.googleAuthService?.getAccessToken) {
                    throw new Error('GoogleAuthService non disponible');
                }
                
                this.accessToken = await window.googleAuthService.getAccessToken();
                console.log('[MailService] ✅ Token Google obtenu');
                
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
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            this.folders = (data.labels || []).map(label => ({
                id: label.id,
                name: label.name,
                type: label.type,
                messagesTotal: label.messagesTotal || 0,
                messagesUnread: label.messagesUnread || 0
            }));
            
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
                { id: 'INBOX', name: 'INBOX', type: 'system' },
                { id: 'SENT', name: 'SENT', type: 'system' },
                { id: 'DRAFT', name: 'DRAFT', type: 'system' },
                { id: 'TRASH', name: 'TRASH', type: 'system' }
            ];
        } else {
            this.folders = [
                { id: 'inbox', name: 'Inbox' },
                { id: 'sentitems', name: 'Sent Items' },
                { id: 'drafts', name: 'Drafts' },
                { id: 'deleteditems', name: 'Deleted Items' }
            ];
        }
    }

    // ================================================
    // RÉCUPÉRATION DES MESSAGES
    // ================================================
    async getMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📬 Récupération des messages depuis ${folderId}...`);
        
        if (!this.initialized) {
            await this.initialize();
        }
        
        try {
            let messages = [];
            
            if (this.currentProvider === 'google') {
                messages = await this.getGmailMessages(folderId, options);
            } else if (this.currentProvider === 'microsoft') {
                messages = await this.getOutlookMessages(folderId, options);
            }
            
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
    // GMAIL
    // ================================================
    async getGmailMessages(labelId = 'INBOX', options = {}) {
        console.log(`[MailService] 📧 Récupération emails Gmail...`);
        
        const allMessages = [];
        let pageToken = null;
        const maxResults = Math.min(options.maxResults || 500, 500);
        
        do {
            // Construire l'URL
            const params = new URLSearchParams({
                labelIds: labelId,
                maxResults: maxResults - allMessages.length,
                includeSpamTrash: false
            });
            
            if (options.filter) {
                params.append('q', options.filter);
            }
            
            if (pageToken) {
                params.append('pageToken', pageToken);
            }
            
            // Récupérer la liste
            const listResponse = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!listResponse.ok) {
                throw new Error(`HTTP ${listResponse.status}`);
            }
            
            const listData = await listResponse.json();
            const messageIds = listData.messages || [];
            
            // Récupérer les détails
            const detailedMessages = await this.getGmailMessageDetails(messageIds);
            allMessages.push(...detailedMessages);
            
            pageToken = listData.nextPageToken;
            
        } while (pageToken && allMessages.length < maxResults);
        
        return allMessages.slice(0, maxResults);
    }

    async getGmailMessageDetails(messageIds) {
        const details = [];
        
        // Traiter par batch de 10
        for (let i = 0; i < messageIds.length; i += 10) {
            const batch = messageIds.slice(i, i + 10);
            
            const promises = batch.map(msg => this.getGmailSingleMessage(msg.id));
            const results = await Promise.allSettled(promises);
            
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    details.push(result.value);
                }
            });
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
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
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
        const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
        
        // Extraire le contenu
        const content = this.extractGmailContent(message.payload);
        
        return {
            id: message.id,
            threadId: message.threadId,
            provider: 'google',
            receivedDateTime: new Date(parseInt(message.internalDate)).toISOString(),
            subject: getHeader('Subject') || 'Sans sujet',
            from: {
                emailAddress: {
                    name: this.extractName(getHeader('From')),
                    address: this.extractEmail(getHeader('From'))
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
            isRead: !message.labelIds?.includes('UNREAD')
        };
    }

    extractGmailContent(payload) {
        let text = '';
        let html = '';
        let hasAttachments = false;
        
        if (!payload) return { text, html, hasAttachments };
        
        // Contenu direct
        if (payload.body?.data) {
            const decoded = this.base64Decode(payload.body.data);
            if (payload.mimeType === 'text/plain') {
                text = decoded;
            } else if (payload.mimeType === 'text/html') {
                html = decoded;
            }
        }
        
        // Contenu multipart
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.filename) {
                    hasAttachments = true;
                } else {
                    const subContent = this.extractGmailContent(part);
                    if (subContent.text) text = text || subContent.text;
                    if (subContent.html) html = html || subContent.html;
                    if (subContent.hasAttachments) hasAttachments = true;
                }
            }
        }
        
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
        
        do {
            let url;
            
            if (nextLink) {
                url = nextLink;
            } else {
                const params = new URLSearchParams({
                    '$top': Math.min(maxResults - allMessages.length, 999),
                    '$select': 'id,conversationId,receivedDateTime,subject,body,bodyPreview,importance,isRead,hasAttachments,from,toRecipients,ccRecipients',
                    '$orderby': 'receivedDateTime desc'
                });
                
                if (options.filter) {
                    params.append('$filter', options.filter);
                }
                
                url = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages?${params}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
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
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            return decodeURIComponent(escape(atob(base64)));
        } catch (error) {
            console.error('[MailService] Erreur décodage base64:', error);
            return '';
        }
    }

    extractName(emailString) {
        if (!emailString) return '';
        const match = emailString.match(/^"?([^"<]+)"?\s*<?/);
        return match ? match[1].trim() : '';
    }

    extractEmail(emailString) {
        if (!emailString) return '';
        const match = emailString.match(/<([^>]+)>/);
        return match ? match[1] : emailString.trim();
    }

    parseRecipients(recipientString) {
        if (!recipientString) return [];
        
        return recipientString.split(',').map(r => {
            const trimmed = r.trim();
            return {
                emailAddress: {
                    name: this.extractName(trimmed),
                    address: this.extractEmail(trimmed)
                }
            };
        }).filter(r => r.emailAddress.address);
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

    async reset() {
        console.log('[MailService] 🔄 Réinitialisation...');
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
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

console.log('✅ MailService v10.0 loaded - Service Multi-Provider Simplifié');
