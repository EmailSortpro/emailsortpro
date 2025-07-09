// MailService.js - Service unifié de récupération des emails Microsoft Graph et Gmail API v4.1

class MailService {
    constructor() {
        this.isInitialized = false;
        this.cache = new Map();
        this.folders = new Map();
        this.provider = null; // 'microsoft' ou 'google'
        this.initializationPromise = null;
        this.folderMapping = {
            'inbox': 'inbox',
            'junkemail': 'junkemail', 
            'sentitems': 'sentitems',
            'drafts': 'drafts',
            'archive': 'archive'
        }

// Créer l'instance globale
try {
    window.mailService = new MailService();
    console.log('[MailService] ✅ Global unified instance created successfully');
} catch (error) {
    console.error('[MailService] ❌ Failed to create global instance:', error);
    
    window.mailService = {
        isInitialized: false,
        getEmailsFromFolder: async () => {
            throw new Error('MailService not available - Check console for errors');
        },
        getEmails: async () => {
            throw new Error('MailService not available - Check console for errors');
        },
        initialize: async () => {
            throw new Error('MailService failed to initialize - Check AuthService');
        },
        getDebugInfo: () => ({ 
            error: 'MailService failed to create',
            microsoftAuthServiceAvailable: !!window.authService,
            googleAuthServiceAvailable: !!window.googleAuthService,
            userAuthenticated: (window.authService ? window.authService.isAuthenticated() : false) || 
                              (window.googleAuthService ? window.googleAuthService.isAuthenticated() : false)
        })
    };
}

console.log('✅ MailService v4.1 loaded - Unified Outlook/Gmail support with improved auth handling');;
        
        console.log('[MailService] Constructor - Service unifié Outlook/Gmail v4.1');
    }

    async initialize() {
        console.log('[MailService] Initializing...');
        
        // Éviter l'initialisation multiple
        if (this.initializationPromise) {
            console.log('[MailService] Already initializing, waiting for existing promise...');
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
            // Détecter le provider utilisé - attendre que les services soient prêts
            let attempts = 0;
            const maxAttempts = 30; // 3 secondes
            let authServiceFound = false;

            while (attempts < maxAttempts && !authServiceFound) {
                // Vérifier Microsoft d'abord
                if (window.authService && window.authService.isInitialized && window.authService.isAuthenticated()) {
                    this.provider = 'microsoft';
                    authServiceFound = true;
                    console.log('[MailService] Using Microsoft provider (authenticated)');
                    break;
                }
                
                // Vérifier Google ensuite
                if (window.googleAuthService && window.googleAuthService.isInitialized && window.googleAuthService.isAuthenticated()) {
                    this.provider = 'google';
                    authServiceFound = true;
                    console.log('[MailService] Using Google provider (authenticated)');
                    break;
                }

                // Si les services existent mais ne sont pas encore initialisés/authentifiés
                if (window.authService && !window.authService.isInitialized) {
                    console.log('[MailService] Microsoft auth service exists but not initialized yet...');
                }
                if (window.googleAuthService && !window.googleAuthService.isInitialized) {
                    console.log('[MailService] Google auth service exists but not initialized yet...');
                }

                attempts++;
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (!authServiceFound) {
                console.warn('[MailService] No authenticated service available after waiting');
                this.isInitialized = false;
                this.initializationPromise = null;
                return false;
            }

            // Charger les dossiers selon le provider
            console.log('[MailService] Loading mail folders for provider:', this.provider);
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

    // ================================================
    // CHARGEMENT DES DOSSIERS UNIFIÉ
    // ================================================
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
        // Vérifier que le service est prêt
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
        
        // Stocker les dossiers avec leurs ID réels
        folders.forEach(folder => {
            this.folders.set(folder.displayName.toLowerCase(), folder);
            
            // Mapping des noms standards
            if (folder.displayName.toLowerCase().includes('inbox') || 
                folder.displayName.toLowerCase().includes('boîte de réception')) {
                this.folders.set('inbox', folder);
            }
            if (folder.displayName.toLowerCase().includes('junk') || 
                folder.displayName.toLowerCase().includes('courrier indésirable')) {
                this.folders.set('junkemail', folder);
            }
            if (folder.displayName.toLowerCase().includes('sent') || 
                folder.displayName.toLowerCase().includes('éléments envoyés')) {
                this.folders.set('sentitems', folder);
            }
        });

        return folders;
    }

    async loadGoogleFolders() {
        // Vérifier que le service est prêt
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
        
        // Stocker les labels comme dossiers
        labels.forEach(label => {
            this.folders.set(label.name.toLowerCase(), label);
            
            // Mapping des labels standards Gmail
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

    // ================================================
    // MÉTHODE PRINCIPALE : RÉCUPÉRATION DES EMAILS UNIFIÉE
    // ================================================
    async getEmailsFromFolder(folderName, options = {}) {
        console.log(`[MailService] Getting emails from folder: ${folderName}`);
        
        try {
            // Initialiser si nécessaire
            if (!this.isInitialized) {
                console.log('[MailService] Not initialized, initializing first...');
                const initialized = await this.initialize();
                if (!initialized) {
                    throw new Error('Failed to initialize MailService - no authenticated provider');
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
            console.error(`[MailService] ❌ Error getting emails from ${folderName}:`, error);
            throw error;
        }
    }

    async getMicrosoftEmails(folderName, options = {}) {
        // Vérifier l'authentification Microsoft
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('User not authenticated with Microsoft');
        }

        // Obtenir le token d'accès
        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Unable to get Microsoft access token');
        }

        // Obtenir l'ID réel du dossier
        const folderId = await this.resolveFolderId(folderName);
        
        // Construire l'URL de l'API Microsoft Graph
        const graphUrl = this.buildMicrosoftGraphUrl(folderId, options);
        console.log(`[MailService] Microsoft query endpoint: ${graphUrl}`);

        // Effectuer la requête
        const response = await fetch(graphUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[MailService] ❌ Microsoft Graph API error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const emails = data.value || [];

        console.log(`[MailService] ✅ Retrieved ${emails.length} Microsoft emails`);
        
        // Traiter et enrichir les emails
        const processedEmails = this.processMicrosoftEmails(emails, folderName);
        
        return processedEmails;
    }

    async getGmailEmails(folderName, options = {}) {
        // Vérifier l'authentification Google
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('User not authenticated with Google');
        }

        // Obtenir le token d'accès
        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Unable to get Google access token');
        }

        // Construire la requête Gmail
        const gmailUrl = this.buildGmailUrl(folderName, options);
        console.log(`[MailService] Gmail query endpoint: ${gmailUrl}`);

        // Effectuer la requête pour obtenir la liste des messages
        const response = await fetch(gmailUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[MailService] ❌ Gmail API error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const messages = data.messages || [];

        console.log(`[MailService] ✅ Found ${messages.length} Gmail messages`);

        // Récupérer les détails de chaque message
        const detailedEmails = await this.getGmailMessageDetails(messages.slice(0, options.top || 50));
        
        // Traiter et enrichir les emails
        const processedEmails = this.processGmailEmails(detailedEmails, folderName);
        
        return processedEmails;
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
                console.warn('[MailService] Error fetching Gmail message details:', error);
            }
        }

        return detailedEmails;
    }

    // ================================================
    // CONSTRUCTION DES URLs API
    // ================================================
    buildMicrosoftGraphUrl(folderId, options) {
        const {
            startDate,
            endDate,
            top = 100,
            orderBy = 'receivedDateTime desc'
        } = options;

        // Base URL adaptée selon le type d'ID
        let baseUrl;
        if (folderId === 'inbox') {
            baseUrl = 'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages';
        } else if (folderId.includes('AAM') || folderId.length > 20) {
            baseUrl = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`;
        } else {
            baseUrl = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`;
        }

        // Paramètres de requête
        const params = new URLSearchParams();
        
        params.append('$top', Math.min(top, 1000).toString());
        params.append('$orderby', orderBy);
        
        // Sélection des champs nécessaires
        params.append('$select', [
            'id', 'subject', 'bodyPreview', 'body', 'from', 'toRecipients',
            'ccRecipients', 'receivedDateTime', 'sentDateTime', 'isRead',
            'importance', 'hasAttachments', 'flag', 'categories', 'parentFolderId', 'webLink'
        ].join(','));

        // Filtre par dates si spécifié
        if (startDate || endDate) {
            const filters = [];
            
            if (startDate) {
                const startISO = new Date(startDate).toISOString();
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

    buildGmailUrl(folderName, options) {
        const {
            startDate,
            endDate,
            top = 50
        } = options;

        let baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
        const params = new URLSearchParams();

        // Paramètres de base
        params.append('maxResults', Math.min(top, 500).toString());

        // Query pour le dossier/label
        let query = '';
        if (folderName && folderName !== 'inbox') {
            const folder = this.folders.get(folderName.toLowerCase());
            if (folder && folder.id) {
                query += `label:${folder.id} `;
            }
        } else {
            query += 'in:inbox ';
        }

        // Filtres par date
        if (startDate) {
            const startFormatted = new Date(startDate).toISOString().split('T')[0];
            query += `after:${startFormatted} `;
        }

        if (endDate) {
            const endFormatted = new Date(endDate).toISOString().split('T')[0];
            query += `before:${endFormatted} `;
        }

        if (query.trim()) {
            params.append('q', query.trim());
        }

        return `${baseUrl}?${params.toString()}`;
    }

    // ================================================
    // TRAITEMENT DES EMAILS PAR PROVIDER
    // ================================================
    processMicrosoftEmails(emails, folderName) {
        console.log(`[MailService] 🔄 Processing ${emails.length} Microsoft emails from ${folderName}`);
        
        return emails.map(email => {
            try {
                const processedEmail = {
                    // Champs originaux de Microsoft Graph
                    id: email.id,
                    subject: email.subject || 'Sans sujet',
                    bodyPreview: email.bodyPreview || '',
                    body: email.body,
                    from: email.from,
                    toRecipients: email.toRecipients || [],
                    ccRecipients: email.ccRecipients || [],
                    receivedDateTime: email.receivedDateTime,
                    sentDateTime: email.sentDateTime,
                    isRead: email.isRead,
                    importance: email.importance,
                    hasAttachments: email.hasAttachments,
                    flag: email.flag,
                    categories: email.categories || [],
                    parentFolderId: email.parentFolderId,
                    webLink: email.webLink,
                    
                    // Métadonnées unifiées
                    provider: 'microsoft',
                    sourceFolder: folderName,
                    retrievedAt: new Date().toISOString(),
                    
                    // Champs préparés pour la catégorisation
                    emailText: this.extractMicrosoftEmailText(email),
                    senderDomain: this.extractSenderDomain(email.from),
                    recipientCount: (email.toRecipients?.length || 0) + (email.ccRecipients?.length || 0)
                };

                return processedEmail;

            } catch (error) {
                console.warn('[MailService] ⚠️ Error processing Microsoft email:', email.id, error);
                return { ...email, provider: 'microsoft', sourceFolder: folderName };
            }
        });
    }

    processGmailEmails(emails, folderName) {
        console.log(`[MailService] 🔄 Processing ${emails.length} Gmail emails from ${folderName}`);
        
        return emails.map(email => {
            try {
                const headers = this.parseGmailHeaders(email.payload?.headers || []);
                
                const processedEmail = {
                    // Champs unifiés adaptés de Gmail
                    id: email.id,
                    subject: headers.subject || 'Sans sujet',
                    bodyPreview: email.snippet || '',
                    body: this.extractGmailBody(email.payload),
                    from: { emailAddress: { address: headers.from, name: headers.from } },
                    toRecipients: this.parseGmailRecipients(headers.to),
                    ccRecipients: this.parseGmailRecipients(headers.cc),
                    receivedDateTime: new Date(parseInt(email.internalDate)).toISOString(),
                    sentDateTime: new Date(parseInt(email.internalDate)).toISOString(),
                    isRead: !email.labelIds?.includes('UNREAD'),
                    importance: email.labelIds?.includes('IMPORTANT') ? 'high' : 'normal',
                    hasAttachments: this.hasGmailAttachments(email.payload),
                    flag: null,
                    categories: email.labelIds || [],
                    parentFolderId: folderName,
                    webLink: `https://mail.google.com/mail/u/0/#inbox/${email.id}`,
                    
                    // Métadonnées unifiées
                    provider: 'google',
                    sourceFolder: folderName,
                    retrievedAt: new Date().toISOString(),
                    
                    // Champs préparés pour la catégorisation
                    emailText: this.extractGmailEmailText(email, headers),
                    senderDomain: this.extractSenderDomainFromEmail(headers.from),
                    recipientCount: (headers.to ? headers.to.split(',').length : 0) + (headers.cc ? headers.cc.split(',').length : 0)
                };

                return processedEmail;

            } catch (error) {
                console.warn('[MailService] ⚠️ Error processing Gmail email:', email.id, error);
                return { ...email, provider: 'google', sourceFolder: folderName };
            }
        });
    }

    // ================================================
    // UTILITAIRES GMAIL
    // ================================================
    parseGmailHeaders(headers) {
        const headerMap = {};
        headers.forEach(header => {
            headerMap[header.name.toLowerCase()] = header.value;
        });
        return headerMap;
    }

    parseGmailRecipients(recipientString) {
        if (!recipientString) return [];
        return recipientString.split(',').map(email => ({
            emailAddress: { address: email.trim(), name: email.trim() }
        }));
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
                if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
                    if (part.body?.data) {
                        return {
                            content: this.decodeBase64Url(part.body.data),
                            contentType: part.mimeType?.includes('html') ? 'html' : 'text'
                        };
                    }
                }
            }
        }
        
        return { content: '', contentType: 'text' };
    }

    hasGmailAttachments(payload) {
        if (!payload) return false;
        
        if (payload.parts) {
            return payload.parts.some(part => 
                part.filename && part.filename.length > 0 &&
                part.body?.attachmentId
            );
        }
        
        return false;
    }

    decodeBase64Url(data) {
        try {
            // Conversion Base64URL vers Base64 standard
            let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            
            // Ajouter le padding si nécessaire
            while (base64.length % 4) {
                base64 += '=';
            }
            
            return atob(base64);
        } catch (error) {
            console.warn('[MailService] Error decoding Base64URL:', error);
            return '';
        }
    }

    // ================================================
    // EXTRACTION DU TEXTE UNIFIÉ
    // ================================================
    extractMicrosoftEmailText(email) {
        let text = '';
        
        if (email.subject) {
            text += email.subject + ' ';
        }
        
        if (email.from?.emailAddress) {
            if (email.from.emailAddress.name) {
                text += email.from.emailAddress.name + ' ';
            }
            if (email.from.emailAddress.address) {
                text += email.from.emailAddress.address + ' ';
            }
        }
        
        if (email.bodyPreview) {
            text += email.bodyPreview + ' ';
        }
        
        if (email.body && email.body.content) {
            if (email.body.contentType === 'html') {
                const cleanText = email.body.content
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&[^;]+;/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                text += cleanText;
            } else {
                text += email.body.content;
            }
        }
        
        return text.trim();
    }

    extractGmailEmailText(email, headers) {
        let text = '';
        
        if (headers.subject) {
            text += headers.subject + ' ';
        }
        
        if (headers.from) {
            text += headers.from + ' ';
        }
        
        if (email.snippet) {
            text += email.snippet + ' ';
        }
        
        const body = this.extractGmailBody(email.payload);
        if (body.content) {
            if (body.contentType === 'html') {
                const cleanText = body.content
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&[^;]+;/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                text += cleanText;
            } else {
                text += body.content;
            }
        }
        
        return text.trim();
    }

    // ================================================
    // EXTRACTION DU DOMAINE UNIFIÉ
    // ================================================
    extractSenderDomain(fromField) {
        try {
            if (!fromField || !fromField.emailAddress || !fromField.emailAddress.address) {
                return 'unknown';
            }
            
            const email = fromField.emailAddress.address;
            const domain = email.split('@')[1];
            return domain ? domain.toLowerCase() : 'unknown';
            
        } catch (error) {
            console.warn('[MailService] Error extracting sender domain:', error);
            return 'unknown';
        }
    }

    extractSenderDomainFromEmail(emailString) {
        try {
            if (!emailString) return 'unknown';
            
            // Extraire l'email de la chaîne "Name <email@domain.com>"
            const emailMatch = emailString.match(/<(.+@.+)>/);
            const email = emailMatch ? emailMatch[1] : emailString;
            
            const domain = email.split('@')[1];
            return domain ? domain.toLowerCase() : 'unknown';
            
        } catch (error) {
            console.warn('[MailService] Error extracting sender domain from email:', error);
            return 'unknown';
        }
    }

    // ================================================
    // MÉTHODES GÉNÉRIQUES UNIFIÉES
    // ================================================
    async resolveFolderId(folderName) {
        // Si c'est déjà un ID complet, l'utiliser directement
        if (folderName.includes('AAM') || folderName.length > 20) {
            return folderName;
        }

        // Chercher dans le cache des dossiers
        const folder = this.folders.get(folderName.toLowerCase());
        if (folder) {
            console.log(`[MailService] Resolved folder ${folderName} to ID: ${folder.id}`);
            return folder.id;
        }

        // Pour la boîte de réception
        if (folderName === 'inbox') {
            return 'inbox';
        }

        console.warn(`[MailService] Folder ${folderName} not found in cache, using as-is`);
        return folderName;
    }

    async getEmailById(emailId) {
        console.log(`[MailService] Getting email by ID: ${emailId}`);
        
        try {
            // Vérifier l'initialisation
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.provider === 'microsoft') {
                return await this.getMicrosoftEmailById(emailId);
            } else if (this.provider === 'google') {
                return await this.getGmailEmailById(emailId);
            } else {
                throw new Error('No valid provider available');
            }
        } catch (error) {
            console.error('[MailService] ❌ Error getting email by ID:', error);
            throw error;
        }
    }

    async getMicrosoftEmailById(emailId) {
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Microsoft auth service not ready');
        }

        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Unable to get access token');
        }

        const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${emailId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    async getGmailEmailById(emailId) {
        if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
            throw new Error('Google auth service not ready');
        }

        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Unable to get Google access token');
        }

        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    async getFolders() {
        console.log('[MailService] Getting mail folders');
        
        try {
            // Vérifier l'initialisation
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.provider === 'microsoft') {
                return await this.loadMicrosoftFolders();
            } else if (this.provider === 'google') {
                return await this.loadGoogleFolders();
            } else {
                throw new Error('No valid provider available');
            }
        } catch (error) {
            console.error('[MailService] ❌ Error getting folders:', error);
            throw error;
        }
    }

    async testConnection() {
        console.log('[MailService] Testing API connection...');
        
        try {
            // Vérifier l'initialisation
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
            console.error('[MailService] ❌ Connection test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async testMicrosoftConnection() {
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Microsoft auth service not ready');
        }

        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('No access token available');
        }

        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const user = await response.json();
        console.log('[MailService] ✅ Microsoft connection test successful:', user.displayName);
        
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
        if (!accessToken) {
            throw new Error('No Google access token available');
        }

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const profile = await response.json();
        console.log('[MailService] ✅ Google connection test successful:', profile.emailAddress);
        
        return {
            success: true,
            provider: 'google',
            user: profile.emailAddress,
            email: profile.emailAddress
        };
    }

    // ================================================
    // MÉTHODE PRINCIPALE SIMPLIFIÉE POUR COMPATIBILITÉ
    // ================================================
    async getEmails(folderName = 'inbox', options = {}) {
        console.log('[MailService] getEmails called (compatibility method)');
        return this.getEmailsFromFolder(folderName, options);
    }

    // ================================================
    // NETTOYAGE ET RESET
    // ================================================
    reset() {
        console.log('[MailService] Resetting service...');
        this.isInitialized = false;
        this.provider = null;
        this.cache.clear();
        this.folders.clear();
        this.initializationPromise = null;
    }

    // ================================================
    // INFORMATIONS DE DIAGNOSTIC
    // ================================================
    getDebugInfo() {
        const authService = this.provider === 'microsoft' ? window.authService : window.googleAuthService;
        
        return {
            isInitialized: this.isInitialized,
            provider: this.provider,
            hasAuthService: !!authService,
            authServiceInitialized: authService ? authService.isInitialized : false,
            authServiceAuthenticated: authService ? authService.isAuthenticated() : false,
            foldersCount: this.folders.size,
            cacheSize: this.cache.size,
            folders: Array.from(this.folders.entries()).map(([name, folder]) => ({
                name,
                id: folder.id,
                displayName: folder.displayName || folder.name
            }))
        };
    }
}
