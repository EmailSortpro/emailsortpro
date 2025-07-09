// MailService.js - Service unifié de récupération des emails v4.3
// CORRECTION: Détection correcte du provider Google après authentification

class MailService {
    constructor() {
        this.isInitialized = false;
        this.cache = new Map();
        this.folders = new Map();
        this.provider = null;
        this.initializationPromise = null;
        this.folderMapping = {
            'inbox': 'inbox',
            'junkemail': 'junkemail', 
            'sentitems': 'sentitems',
            'drafts': 'drafts',
            'archive': 'archive'
        };
        
        console.log('[MailService] Constructor v4.3 - Détection provider améliorée');
    }

    async initialize() {
        console.log('[MailService] Initializing...');
        
        if (this.initializationPromise) {
            console.log('[MailService] Already initializing, returning existing promise');
            return this.initializationPromise;
        }
        
        if (this.isInitialized) {
            console.log('[MailService] Already initialized');
            return Promise.resolve();
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    async _doInitialize() {
        try {
            // Détection du provider avec plusieurs tentatives
            let attempts = 0;
            const maxAttempts = 30; // 3 secondes
            let authServiceFound = false;

            while (attempts < maxAttempts && !authServiceFound) {
                // Vérifier le lastAuthProvider d'abord
                const lastProvider = sessionStorage.getItem('lastAuthProvider');
                console.log('[MailService] Last auth provider:', lastProvider);
                
                // Vérifier Google si c'était le dernier provider
                if (lastProvider === 'google' && window.googleAuthService) {
                    // Attendre que GoogleAuthService soit initialisé
                    if (window.googleAuthService.isInitialized) {
                        const isAuth = window.googleAuthService.isAuthenticated();
                        console.log('[MailService] Google auth check:', isAuth);
                        
                        if (isAuth) {
                            this.provider = 'google';
                            authServiceFound = true;
                            console.log('[MailService] ✅ Using Google provider');
                            break;
                        }
                    } else {
                        console.log('[MailService] Google service not initialized yet');
                    }
                }
                
                // Vérifier Microsoft
                if (window.authService && window.authService.isInitialized) {
                    const isAuth = window.authService.isAuthenticated();
                    console.log('[MailService] Microsoft auth check:', isAuth);
                    
                    if (isAuth) {
                        this.provider = 'microsoft';
                        authServiceFound = true;
                        console.log('[MailService] ✅ Using Microsoft provider');
                        break;
                    }
                }
                
                // Re-vérifier Google si pas le dernier provider
                if (lastProvider !== 'google' && window.googleAuthService && window.googleAuthService.isInitialized) {
                    const isAuth = window.googleAuthService.isAuthenticated();
                    if (isAuth) {
                        this.provider = 'google';
                        authServiceFound = true;
                        console.log('[MailService] ✅ Using Google provider');
                        break;
                    }
                }
                
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (!authServiceFound) {
                console.warn('[MailService] No authenticated service found');
                this.isInitialized = false;
                this.initializationPromise = null;
                return false;
            }

            // Charger les dossiers
            console.log('[MailService] Loading folders for provider:', this.provider);
            await this.loadMailFolders();

            console.log('[MailService] ✅ Initialization complete with provider:', this.provider);
            this.isInitialized = true;
            return true;

        } catch (error) {
            console.error('[MailService] ❌ Initialization failed:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    isAuthenticated() {
        if (this.provider === 'google' && window.googleAuthService) {
            return window.googleAuthService.isAuthenticated();
        } else if (this.provider === 'microsoft' && window.authService) {
            return window.authService.isAuthenticated();
        }
        
        // Vérifier les deux si pas de provider défini
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            this.provider = 'google';
            return true;
        }
        if (window.authService && window.authService.isAuthenticated()) {
            this.provider = 'microsoft';
            return true;
        }
        
        return false;
    }

    getActiveProvider() {
        if (this.provider) {
            return this.provider;
        }
        
        // Détection automatique
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            return 'google';
        }
        if (window.authService && window.authService.isAuthenticated()) {
            return 'microsoft';
        }
        
        return null;
    }

    async loadMailFolders() {
        try {
            if (this.provider === 'microsoft') {
                return await this.loadMicrosoftFolders();
            } else if (this.provider === 'google') {
                return await this.loadGoogleFolders();
            } else {
                throw new Error('No valid provider available');
            }
        } catch (error) {
            console.error('[MailService] Error loading folders:', error);
            throw error;
        }
    }

    async loadMicrosoftFolders() {
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Microsoft auth service not ready');
        }

        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Unable to get Microsoft access token');
        }

        const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const folders = data.value || [];

        console.log(`[MailService] ✅ Loaded ${folders.length} Microsoft folders`);
        
        folders.forEach(folder => {
            this.folders.set(folder.displayName.toLowerCase(), folder);
            
            if (folder.displayName.toLowerCase().includes('inbox')) {
                this.folders.set('inbox', folder);
            }
            if (folder.displayName.toLowerCase().includes('junk')) {
                this.folders.set('junkemail', folder);
            }
            if (folder.displayName.toLowerCase().includes('sent')) {
                this.folders.set('sentitems', folder);
            }
        });

        return folders;
    }

    async loadGoogleFolders() {
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('Google auth service not ready');
        }

        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Unable to get Google access token');
        }

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const labels = data.labels || [];

        console.log(`[MailService] ✅ Loaded ${labels.length} Gmail labels`);
        
        labels.forEach(label => {
            this.folders.set(label.name.toLowerCase(), label);
            
            if (label.id === 'INBOX') {
                this.folders.set('inbox', label);
            }
            if (label.id === 'SPAM') {
                this.folders.set('junkemail', label);
            }
            if (label.id === 'SENT') {
                this.folders.set('sentitems', label);
            }
            if (label.id === 'DRAFT') {
                this.folders.set('drafts', label);
            }
        });

        return labels;
    }

    async getEmailsFromFolder(folderName, options = {}) {
        console.log(`[MailService] Getting emails from folder: ${folderName}`);
        
        try {
            if (!this.isInitialized) {
                console.log('[MailService] Not initialized, initializing first...');
                const initialized = await this.initialize();
                if (!initialized) {
                    throw new Error('Failed to initialize MailService');
                }
            }

            if (this.provider === 'microsoft') {
                return await this.getMicrosoftEmails(folderName, options);
            } else if (this.provider === 'google') {
                return await this.getGmailEmails(folderName, options);
            } else {
                throw new Error('No valid provider available');
            }

        } catch (error) {
            console.error(`[MailService] ❌ Error getting emails:`, error);
            throw error;
        }
    }

    async getMicrosoftEmails(folderName, options = {}) {
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('User not authenticated with Microsoft');
        }

        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Unable to get Microsoft access token');
        }

        const folderId = await this.resolveFolderId(folderName);
        const graphUrl = this.buildMicrosoftGraphUrl(folderId, options);
        
        const response = await fetch(graphUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const emails = data.value || [];

        console.log(`[MailService] ✅ Retrieved ${emails.length} Microsoft emails`);
        
        return this.processMicrosoftEmails(emails, folderName);
    }

    async getGmailEmails(folderName, options = {}) {
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('User not authenticated with Google');
        }

        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Unable to get Google access token');
        }

        const gmailUrl = this.buildGmailUrl(folderName, options);
        
        const response = await fetch(gmailUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const messages = data.messages || [];

        console.log(`[MailService] ✅ Found ${messages.length} Gmail messages`);

        // Récupérer les détails
        const detailedEmails = await this.getGmailMessageDetails(messages.slice(0, options.top || 50));
        
        return this.processGmailEmails(detailedEmails, folderName);
    }

    async getGmailMessageDetails(messages) {
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('Google auth service not ready');
        }

        const accessToken = await window.googleAuthService.getAccessToken();
        const detailedEmails = [];

        for (const message of messages) {
            try {
                const response = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.ok) {
                    const emailData = await response.json();
                    detailedEmails.push(emailData);
                }
            } catch (error) {
                console.warn('[MailService] Error fetching message details:', error);
            }
        }

        return detailedEmails;
    }

    buildMicrosoftGraphUrl(folderId, options) {
        const { startDate, endDate, top = 100, orderBy = 'receivedDateTime desc' } = options;

        let baseUrl = folderId === 'inbox' ? 
            'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages' :
            `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`;

        const params = new URLSearchParams();
        params.append('$top', Math.min(top, 1000).toString());
        params.append('$orderby', orderBy);
        params.append('$select', 'id,subject,bodyPreview,from,receivedDateTime,isRead,hasAttachments,importance');

        if (startDate || endDate) {
            const filters = [];
            if (startDate) filters.push(`receivedDateTime ge ${new Date(startDate).toISOString()}`);
            if (endDate) filters.push(`receivedDateTime le ${new Date(endDate).toISOString()}`);
            if (filters.length > 0) params.append('$filter', filters.join(' and '));
        }

        return `${baseUrl}?${params.toString()}`;
    }

    buildGmailUrl(folderName, options) {
        const { startDate, endDate, top = 50 } = options;

        const params = new URLSearchParams();
        params.append('maxResults', Math.min(top, 500).toString());

        let query = folderName === 'inbox' ? 'in:inbox ' : '';
        
        if (startDate) query += `after:${new Date(startDate).toISOString().split('T')[0]} `;
        if (endDate) query += `before:${new Date(endDate).toISOString().split('T')[0]} `;

        if (query.trim()) params.append('q', query.trim());

        return `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`;
    }

    processMicrosoftEmails(emails, folderName) {
        return emails.map(email => ({
            ...email,
            provider: 'microsoft',
            sourceFolder: folderName,
            emailText: this.extractEmailText(email),
            senderDomain: this.extractSenderDomain(email.from)
        }));
    }

    processGmailEmails(emails, folderName) {
        return emails.map(email => {
            const headers = this.parseGmailHeaders(email.payload?.headers || []);
            
            return {
                id: email.id,
                subject: headers.subject || 'Sans sujet',
                bodyPreview: email.snippet || '',
                body: this.extractGmailBody(email.payload),
                from: { 
                    emailAddress: { 
                        address: headers.from, 
                        name: headers.from?.split('<')[0]?.trim() || headers.from 
                    }
                },
                receivedDateTime: new Date(parseInt(email.internalDate)).toISOString(),
                isRead: !email.labelIds?.includes('UNREAD'),
                hasAttachments: this.hasGmailAttachments(email.payload),
                importance: email.labelIds?.includes('IMPORTANT') ? 'high' : 'normal',
                provider: 'google',
                sourceFolder: folderName,
                emailText: email.snippet || '',
                senderDomain: this.extractSenderDomainFromEmail(headers.from)
            };
        });
    }

    parseGmailHeaders(headers) {
        const headerMap = {};
        headers.forEach(header => {
            headerMap[header.name.toLowerCase()] = header.value;
        });
        return headerMap;
    }

    extractGmailBody(payload) {
        if (!payload) return { content: '', contentType: 'text' };
        
        if (payload.body?.data) {
            return {
                content: this.decodeBase64Url(payload.body.data),
                contentType: payload.mimeType?.includes('html') ? 'html' : 'text'
            };
        }
        
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                    return {
                        content: this.decodeBase64Url(part.body.data),
                        contentType: 'text'
                    };
                }
            }
        }
        
        return { content: '', contentType: 'text' };
    }

    hasGmailAttachments(payload) {
        if (!payload || !payload.parts) return false;
        
        return payload.parts.some(part => 
            part.filename && part.filename.length > 0 && part.body?.attachmentId
        );
    }

    decodeBase64Url(data) {
        try {
            let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) base64 += '=';
            return atob(base64);
        } catch (error) {
            console.warn('[MailService] Error decoding Base64URL:', error);
            return '';
        }
    }

    extractEmailText(email) {
        let text = email.subject || '';
        if (email.from?.emailAddress?.name) text += ' ' + email.from.emailAddress.name;
        if (email.bodyPreview) text += ' ' + email.bodyPreview;
        return text.trim();
    }

    extractSenderDomain(fromField) {
        try {
            const email = fromField?.emailAddress?.address;
            if (!email) return 'unknown';
            return email.split('@')[1]?.toLowerCase() || 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    extractSenderDomainFromEmail(emailString) {
        try {
            if (!emailString) return 'unknown';
            const emailMatch = emailString.match(/<(.+@.+)>/) || [null, emailString];
            const email = emailMatch[1];
            return email.split('@')[1]?.toLowerCase() || 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    async resolveFolderId(folderName) {
        const folder = this.folders.get(folderName.toLowerCase());
        if (folder) return folder.id;
        
        if (folderName === 'inbox') return 'inbox';
        
        return folderName;
    }

    async getEmailById(emailId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.provider === 'microsoft') {
                return await this.getMicrosoftEmailById(emailId);
            } else if (this.provider === 'google') {
                return await this.getGmailEmailById(emailId);
            }
        } catch (error) {
            console.error('[MailService] Error getting email by ID:', error);
            throw error;
        }
    }

    async getMicrosoftEmailById(emailId) {
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Microsoft auth service not ready');
        }

        const accessToken = await window.authService.getAccessToken();
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${emailId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    }

    async getGmailEmailById(emailId) {
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('Google auth service not ready');
        }

        const accessToken = await window.googleAuthService.getAccessToken();
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const email = await response.json();
        return this.processGmailEmails([email], 'inbox')[0];
    }

    async testConnection() {
        console.log('[MailService] Testing API connection...');
        
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.provider === 'microsoft') {
                return await this.testMicrosoftConnection();
            } else if (this.provider === 'google') {
                return await this.testGoogleConnection();
            } else {
                throw new Error('No valid provider available');
            }
        } catch (error) {
            console.error('[MailService] Connection test failed:', error);
            return { success: false, error: error.message };
        }
    }

    async testMicrosoftConnection() {
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Microsoft auth service not ready');
        }

        const accessToken = await window.authService.getAccessToken();
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const user = await response.json();
        console.log('[MailService] ✅ Microsoft connection test successful');
        
        return {
            success: true,
            provider: 'microsoft',
            user: user.displayName,
            email: user.mail || user.userPrincipalName
        };
    }

    async testGoogleConnection() {
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('Google auth service not ready');
        }

        const accessToken = await window.googleAuthService.getAccessToken();
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const profile = await response.json();
        console.log('[MailService] ✅ Google connection test successful');
        
        return {
            success: true,
            provider: 'google',
            user: profile.emailAddress,
            email: profile.emailAddress
        };
    }

    async getEmails(folderName = 'inbox', options = {}) {
        return this.getEmailsFromFolder(folderName, options);
    }

    async getFolders() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        return Array.from(this.folders.values());
    }

    reset() {
        console.log('[MailService] Resetting...');
        this.isInitialized = false;
        this.provider = null;
        this.cache.clear();
        this.folders.clear();
        this.initializationPromise = null;
    }

    getDebugInfo() {
        const authService = this.provider === 'microsoft' ? window.authService : window.googleAuthService;
        
        return {
            isInitialized: this.isInitialized,
            provider: this.provider,
            hasAuthService: !!authService,
            authServiceInitialized: authService?.isInitialized || false,
            authServiceAuthenticated: authService?.isAuthenticated() || false,
            foldersCount: this.folders.size,
            cacheSize: this.cache.size,
            lastAuthProvider: sessionStorage.getItem('lastAuthProvider')
        };
    }
}

// Créer l'instance globale
window.mailService = new MailService();

console.log('[MailService] ✅ v4.3 loaded - Détection provider améliorée');
