// MailService.js - Service unifié Gmail/Outlook v6.0 - Performance et structure identiques

class MailService {
    constructor() {
        this.isInitialized = false;
        this.cache = new Map();
        this.folders = new Map();
        this.provider = null; // 'microsoft' ou 'google'
        this.folderMapping = {
            'inbox': 'inbox',
            'junkemail': 'junkemail', 
            'sentitems': 'sentitems',
            'drafts': 'drafts',
            'archive': 'archive'
        };
        
        console.log('[MailService] Constructor v6.0 - Structure unifiée Outlook/Gmail');
    }

    async initialize() {
        console.log('[MailService] Initializing v6.0...');
        
        if (this.isInitialized) {
            console.log('[MailService] Already initialized');
            return;
        }

        try {
            // Détecter automatiquement le provider avec priorité Google
            if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
                this.provider = 'google';
                console.log('[MailService] ✅ Provider: Google Gmail (priorité)');
            } else if (window.authService && window.authService.isAuthenticated()) {
                this.provider = 'microsoft';
                console.log('[MailService] ✅ Provider: Microsoft Outlook');
            } else {
                console.warn('[MailService] ⚠️ Aucun provider authentifié');
                // Essayer d'initialiser les deux
                await this.tryInitializeBothProviders();
                return;
            }

            // Charger les dossiers selon le provider
            console.log('[MailService] Chargement dossiers...');
            await this.loadMailFolders();

            console.log('[MailService] ✅ Initialisation terminée');
            this.isInitialized = true;

        } catch (error) {
            console.error('[MailService] ❌ Initialisation échouée:', error);
            throw error;
        }
    }

    async tryInitializeBothProviders() {
        console.log('[MailService] Tentative initialisation des deux providers...');
        
        try {
            // Essayer Google d'abord (priorité)
            if (window.googleAuthService) {
                await window.googleAuthService.initialize();
                if (window.googleAuthService.isAuthenticated()) {
                    this.provider = 'google';
                    console.log('[MailService] ✅ Google Gmail activé (priorité)');
                    await this.loadMailFolders();
                    this.isInitialized = true;
                    return;
                }
            }
            
            // Puis Microsoft
            if (window.authService) {
                await window.authService.initialize();
                if (window.authService.isAuthenticated()) {
                    this.provider = 'microsoft';
                    console.log('[MailService] ✅ Microsoft Outlook activé');
                    await this.loadMailFolders();
                    this.isInitialized = true;
                    return;
                }
            }
            
            console.warn('[MailService] ⚠️ Aucun provider disponible');
            
        } catch (error) {
            console.error('[MailService] Erreur initialisation providers:', error);
            throw error;
        }
    }

    // ================================================
    // CHARGEMENT DOSSIERS UNIFIÉ - PERFORMANCE IDENTIQUE
    // ================================================
    async loadMailFolders() {
        try {
            if (this.provider === 'google') {
                return await this.loadGmailFolders();
            } else if (this.provider === 'microsoft') {
                return await this.loadMicrosoftFolders();
            } else {
                throw new Error('Aucun provider valide');
            }
        } catch (error) {
            console.error('[MailService] Erreur chargement dossiers:', error);
            throw error;
        }
    }

    async loadMicrosoftFolders() {
        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Microsoft manquant');
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

        console.log(`[MailService] ✅ ${folders.length} dossiers Microsoft chargés`);
        
        // Mapping unifié des dossiers
        folders.forEach(folder => {
            this.folders.set(folder.displayName.toLowerCase(), folder);
            
            // Mapping standard unifié
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
            if (folder.displayName.toLowerCase().includes('draft') || 
                folder.displayName.toLowerCase().includes('brouillons')) {
                this.folders.set('drafts', folder);
            }
        });

        return folders;
    }

    async loadGmailFolders() {
        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Gmail manquant');
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

        console.log(`[MailService] ✅ ${labels.length} labels Gmail chargés`);
        
        // Mapping unifié des labels Gmail vers structure de dossiers
        labels.forEach(label => {
            this.folders.set(label.name.toLowerCase(), label);
            
            // Mapping standard Gmail -> unifié
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
    // MÉTHODE PRINCIPALE UNIFIÉE - PERFORMANCE IDENTIQUE
    // ================================================
    async getEmailsFromFolder(folderName, options = {}) {
        console.log(`[MailService] Récupération emails "${folderName}" (${this.provider})...`);
        
        try {
            // Initialiser si nécessaire
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Cache unifié pour performance
            const cacheKey = `${this.provider}_${folderName}_${JSON.stringify(options)}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                const cacheAge = Date.now() - cached.timestamp;
                if (cacheAge < 30000) { // Cache 30 secondes
                    console.log(`[MailService] ✅ Cache hit (${this.provider})`);
                    return cached.data;
                }
            }

            let emails;
            const startTime = performance.now();

            if (this.provider === 'microsoft') {
                emails = await this.getMicrosoftEmails(folderName, options);
            } else if (this.provider === 'google') {
                emails = await this.getGmailEmails(folderName, options);
            } else {
                throw new Error('Provider non configuré');
            }

            const duration = Math.round(performance.now() - startTime);
            console.log(`[MailService] ✅ ${emails?.length || 0} emails récupérés en ${duration}ms (${this.provider})`);

            // Cache unifié pour performance
            this.cache.set(cacheKey, {
                data: emails,
                timestamp: Date.now()
            });

            return emails;

        } catch (error) {
            console.error(`[MailService] ❌ Erreur récupération ${folderName} (${this.provider}):`, error);
            throw error;
        }
    }

    // ================================================
    // MICROSOFT EMAILS - STRUCTURE OPTIMISÉE
    // ================================================
    async getMicrosoftEmails(folderName, options = {}) {
        if (!window.authService.isAuthenticated()) {
            throw new Error('Microsoft non authentifié');
        }

        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Microsoft manquant');
        }

        const folderId = await this.resolveFolderId(folderName);
        const graphUrl = this.buildMicrosoftGraphUrl(folderId, options);
        
        console.log(`[MailService] Microsoft query: ${graphUrl}`);

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
            console.error('[MailService] ❌ Microsoft Graph error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const emails = data.value || [];

        // Traitement unifié des emails Microsoft
        return this.processMicrosoftEmails(emails, folderName);
    }

    // ================================================
    // GMAIL EMAILS - STRUCTURE IDENTIQUE À MICROSOFT
    // ================================================
    async getGmailEmails(folderName, options = {}) {
        if (!window.googleAuthService.isAuthenticated()) {
            throw new Error('Gmail non authentifié');
        }

        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Gmail manquant');
        }

        // ÉTAPE 1: Récupérer la liste des messages
        const gmailUrl = this.buildGmailUrl(folderName, options);
        console.log(`[MailService] Gmail query: ${gmailUrl}`);

        const response = await fetch(gmailUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[MailService] ❌ Gmail API error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const messages = data.messages || [];

        console.log(`[MailService] ✅ ${messages.length} messages Gmail trouvés`);

        // ÉTAPE 2: Récupérer les détails par batch pour performance identique
        const detailedEmails = await this.getGmailMessageDetailsBatch(messages.slice(0, options.top || 100), accessToken);
        
        // ÉTAPE 3: Traitement unifié
        return this.processGmailEmails(detailedEmails, folderName);
    }

    // NOUVEAU: Récupération batch optimisée Gmail pour performance identique
    async getGmailMessageDetailsBatch(messages, accessToken) {
        const detailedEmails = [];
        const batchSize = 10; // Optimisation performance
        
        for (let i = 0; i < messages.length; i += batchSize) {
            const batch = messages.slice(i, i + batchSize);
            const promises = batch.map(message => 
                this.getGmailMessageDetail(message.id, accessToken)
            );
            
            const results = await Promise.allSettled(promises);
            
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    detailedEmails.push(result.value);
                }
            });
            
            // Petit délai pour éviter le rate limiting
            if (i + batchSize < messages.length) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        return detailedEmails;
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
        } catch (error) {
            console.warn('[MailService] Erreur détail message Gmail:', error);
        }
        return null;
    }

    // ================================================
    // CONSTRUCTION URLs API - PERFORMANCE OPTIMISÉE
    // ================================================
    buildMicrosoftGraphUrl(folderId, options) {
        const {
            startDate,
            endDate,
            top = 100,
            orderBy = 'receivedDateTime desc'
        } = options;

        let baseUrl;
        if (folderId === 'inbox') {
            baseUrl = 'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages';
        } else {
            baseUrl = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`;
        }

        const params = new URLSearchParams();
        params.append('$top', Math.min(top, 1000).toString());
        params.append('$orderby', orderBy);
        
        // Champs optimisés pour performance identique
        params.append('$select', [
            'id', 'subject', 'bodyPreview', 'body', 'from', 'toRecipients',
            'ccRecipients', 'receivedDateTime', 'sentDateTime', 'isRead',
            'importance', 'hasAttachments', 'flag', 'categories', 'parentFolderId', 'webLink'
        ].join(','));

        // Filtres de dates
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
            top = 100
        } = options;

        let baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
        const params = new URLSearchParams();

        params.append('maxResults', Math.min(top, 500).toString());

        // Construction query Gmail
        let query = '';
        
        // Dossier/Label
        if (folderName && folderName !== 'inbox') {
            const folder = this.folders.get(folderName.toLowerCase());
            if (folder && folder.id) {
                query += `label:${folder.id} `;
            }
        } else {
            query += 'in:inbox ';
        }

        // Filtres dates Gmail
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
    // TRAITEMENT UNIFIÉ DES EMAILS - STRUCTURE IDENTIQUE
    // ================================================
    processMicrosoftEmails(emails, folderName) {
        console.log(`[MailService] 🔄 Traitement ${emails.length} emails Microsoft...`);
        
        return emails.map(email => {
            try {
                return {
                    // Structure unifiée compatible
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
                    
                    // Champs pour catégorisation unifiée
                    emailText: this.extractEmailText(email, 'microsoft'),
                    senderDomain: this.extractSenderDomain(email.from),
                    recipientCount: (email.toRecipients?.length || 0) + (email.ccRecipients?.length || 0)
                };

            } catch (error) {
                console.warn('[MailService] ⚠️ Erreur traitement email Microsoft:', email.id, error);
                return { ...email, provider: 'microsoft', sourceFolder: folderName, processingError: error.message };
            }
        });
    }

    processGmailEmails(emails, folderName) {
        console.log(`[MailService] 🔄 Traitement ${emails.length} emails Gmail...`);
        
        return emails.map(email => {
            try {
                const headers = this.parseGmailHeaders(email.payload?.headers || []);
                
                return {
                    // Structure unifiée compatible Microsoft
                    id: email.id,
                    subject: headers.subject || 'Sans sujet',
                    bodyPreview: email.snippet || '',
                    body: this.extractGmailBody(email.payload),
                    from: { emailAddress: { address: headers.from, name: this.extractNameFromEmail(headers.from) } },
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
                    
                    // Métadonnées unifiées identiques
                    provider: 'google',
                    sourceFolder: folderName,
                    retrievedAt: new Date().toISOString(),
                    
                    // Champs pour catégorisation unifiée
                    emailText: this.extractEmailText({ subject: headers.subject, snippet: email.snippet, payload: email.payload }, 'google'),
                    senderDomain: this.extractSenderDomainFromEmail(headers.from),
                    recipientCount: (headers.to ? headers.to.split(',').length : 0) + (headers.cc ? headers.cc.split(',').length : 0)
                };

            } catch (error) {
                console.warn('[MailService] ⚠️ Erreur traitement email Gmail:', email.id, error);
                return { ...email, provider: 'google', sourceFolder: folderName, processingError: error.message };
            }
        });
    }

    // ================================================
    // UTILITAIRES GMAIL - PERFORMANCE OPTIMISÉE
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
            emailAddress: { 
                address: email.trim(), 
                name: this.extractNameFromEmail(email.trim()) 
            }
        }));
    }

    extractNameFromEmail(emailString) {
        if (!emailString) return '';
        
        // Extraire le nom de "Name <email@domain.com>"
        const nameMatch = emailString.match(/^([^<]+)<.+>$/);
        if (nameMatch) {
            return nameMatch[1].trim().replace(/^"(.*)"$/, '$1');
        }
        
        // Sinon retourner la partie avant @
        return emailString.split('@')[0];
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
            let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            return atob(base64);
        } catch (error) {
            console.warn('[MailService] Erreur décodage Base64URL:', error);
            return '';
        }
    }

    // ================================================
    // EXTRACTION TEXTE UNIFIÉE - PERFORMANCE IDENTIQUE
    // ================================================
    extractEmailText(email, provider) {
        let text = '';
        
        if (provider === 'microsoft') {
            if (email.subject) text += email.subject + ' ';
            if (email.from?.emailAddress?.name) text += email.from.emailAddress.name + ' ';
            if (email.from?.emailAddress?.address) text += email.from.emailAddress.address + ' ';
            if (email.bodyPreview) text += email.bodyPreview + ' ';
            
            if (email.body?.content) {
                text += this.cleanHtml(email.body.content);
            }
        } else if (provider === 'google') {
            if (email.subject) text += email.subject + ' ';
            if (email.snippet) text += email.snippet + ' ';
            
            if (email.payload) {
                const body = this.extractGmailBody(email.payload);
                if (body.content) {
                    text += this.cleanHtml(body.content);
                }
            }
        }
        
        return text.trim();
    }

    cleanHtml(html) {
        if (!html) return '';
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ================================================
    // DOMAINES UNIFIÉS
    // ================================================
    extractSenderDomain(fromField) {
        try {
            if (!fromField?.emailAddress?.address) return 'unknown';
            const email = fromField.emailAddress.address;
            const domain = email.split('@')[1];
            return domain ? domain.toLowerCase() : 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    extractSenderDomainFromEmail(emailString) {
        try {
            if (!emailString) return 'unknown';
            
            const emailMatch = emailString.match(/<(.+@.+)>/) || emailString.match(/(.+@.+)/);
            const email = emailMatch ? emailMatch[1] : emailString;
            
            const domain = email.split('@')[1];
            return domain ? domain.toLowerCase() : 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // ================================================
    // MÉTHODES GÉNÉRIQUES UNIFIÉES
    // ================================================
    async resolveFolderId(folderName) {
        // ID complet déjà fourni
        if (folderName.includes('AAM') || folderName.length > 20) {
            return folderName;
        }

        // Chercher dans le cache
        const folder = this.folders.get(folderName.toLowerCase());
        if (folder) {
            console.log(`[MailService] Dossier résolu ${folderName} -> ${folder.id}`);
            return folder.id;
        }

        // Inbox par défaut
        if (folderName === 'inbox') {
            return 'inbox';
        }

        console.warn(`[MailService] Dossier ${folderName} non trouvé, utilisation tel quel`);
        return folderName;
    }

    async getEmailById(emailId) {
        console.log(`[MailService] Récupération email ${emailId} (${this.provider})...`);
        
        try {
            if (this.provider === 'microsoft') {
                return await this.getMicrosoftEmailById(emailId);
            } else if (this.provider === 'google') {
                return await this.getGmailEmailById(emailId);
            } else {
                throw new Error('Provider non configuré');
            }
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération email:', error);
            throw error;
        }
    }

    async getMicrosoftEmailById(emailId) {
        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Microsoft manquant');
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
        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Gmail manquant');
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
        console.log('[MailService] Récupération dossiers...');
        
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            return Array.from(this.folders.values());
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération dossiers:', error);
            throw error;
        }
    }

    async testConnection() {
        console.log(`[MailService] Test connexion ${this.provider}...`);
        
        try {
            if (this.provider === 'microsoft') {
                return await this.testMicrosoftConnection();
            } else if (this.provider === 'google') {
                return await this.testGmailConnection();
            } else {
                throw new Error('Aucun provider configuré');
            }
        } catch (error) {
            console.error('[MailService] ❌ Test connexion échoué:', error);
            return {
                success: false,
                provider: this.provider,
                error: error.message
            };
        }
    }

    async testMicrosoftConnection() {
        const accessToken = await window.authService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Microsoft manquant');
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
        console.log('[MailService] ✅ Test Microsoft réussi:', user.displayName);
        
        return {
            success: true,
            provider: 'microsoft',
            user: user.displayName,
            email: user.mail || user.userPrincipalName
        };
    }

    async testGmailConnection() {
        const accessToken = await window.googleAuthService.getAccessToken();
        if (!accessToken) {
            throw new Error('Token Gmail manquant');
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
        console.log('[MailService] ✅ Test Gmail réussi:', profile.emailAddress);
        
        return {
            success: true,
            provider: 'google',
            user: profile.emailAddress,
            email: profile.emailAddress
        };
    }

    // ================================================
    // API COMPATIBLE AVEC EMAILSCANNER
    // ================================================
    async getEmails(options = {}) {
        // Méthode compatible avec EmailScanner pour interface unifiée
        const folder = options.folder || 'inbox';
        const mailServiceOptions = {
            startDate: options.startDate,
            endDate: options.endDate,
            top: options.maxEmails || 1000
        };
        
        return await this.getEmailsFromFolder(folder, mailServiceOptions);
    }

    // ================================================
    // DIAGNOSTIC ET NETTOYAGE
    // ================================================
    getDebugInfo() {
        const authService = this.provider === 'microsoft' ? window.authService : window.googleAuthService;
        
        return {
            isInitialized: this.isInitialized,
            provider: this.provider,
            hasToken: authService ? !!authService.getAccessToken : false,
            foldersCount: this.folders.size,
            cacheSize: this.cache.size,
            version: '6.0',
            folders: Array.from(this.folders.entries()).map(([name, folder]) => ({
                name,
                id: folder.id,
                displayName: folder.displayName || folder.name,
                provider: this.provider
            })),
            supportedProviders: ['google', 'microsoft'],
            currentProviderPriority: this.provider === 'google' ? 'high' : 'normal'
        };
    }

    reset() {
        console.log('[MailService] Reset unifié...');
        this.isInitialized = false;
        this.provider = null;
        this.cache.clear();
        this.folders.clear();
    }

    clearCache() {
        this.cache.clear();
        console.log('[MailService] Cache vidé');
    }
}

// Créer l'instance globale
try {
    window.mailService = new MailService();
    console.log('[MailService] ✅ Instance unifiée v6.0 créée');
} catch (error) {
    console.error('[MailService] ❌ Erreur création instance:', error);
    
    window.mailService = {
        isInitialized: false,
        getEmailsFromFolder: async () => {
            throw new Error('MailService indisponible');
        },
        getEmails: async () => {
            throw new Error('MailService indisponible');
        },
        initialize: async () => {
            throw new Error('MailService indisponible');
        },
        getDebugInfo: () => ({ 
            error: 'MailService indisponible',
            available: false,
            version: '6.0'
        })
    };
}

console.log('✅ MailService v6.0 loaded - Structure unifiée Outlook/Gmail avec performance identique et support Gmail prioritaire');
