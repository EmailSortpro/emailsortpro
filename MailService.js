// MailService.js - Version 9.0 - Service de gestion des emails SANS LIMITES avec récupération complète

class MailService {
    constructor() {
        this.initialized = false;
        this.currentProvider = null;
        this.folders = [];
        this.labels = [];
        this.currentFolder = 'inbox';
        this.initPromise = null;
        this.accessToken = null;
        this.emailCache = new Map();
        this.lastFetchTime = 0;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        
        // Anti-duplication persistante
        this.fetchedEmailIds = new Set();
        this.loadPersistedEmailIds();
        
        // Pagination Gmail
        this.pageTokens = new Map();
        
        // Gestion des erreurs d'authentification
        this.tokenRefreshAttempts = 0;
        this.maxTokenRefreshAttempts = 3;
        
        console.log('[MailService] Constructor v9.0 - Service emails SANS LIMITES avec récupération complète');
    }

    // ================================================
    // GESTION DE LA PERSISTANCE DES IDS
    // ================================================
    loadPersistedEmailIds() {
        try {
            const stored = localStorage.getItem('mailservice_processed_ids');
            if (stored) {
                const ids = JSON.parse(stored);
                this.fetchedEmailIds = new Set(ids);
                console.log(`[MailService] ✅ ${this.fetchedEmailIds.size} IDs chargés depuis le cache`);
            }
        } catch (error) {
            console.warn('[MailService] ⚠️ Erreur chargement IDs persistés:', error);
        }
    }

    savePersistedEmailIds() {
        try {
            const ids = Array.from(this.fetchedEmailIds);
            // Garder les 50000 derniers IDs pour éviter que le localStorage devienne trop gros
            const recentIds = ids.slice(-50000);
            localStorage.setItem('mailservice_processed_ids', JSON.stringify(recentIds));
        } catch (error) {
            console.warn('[MailService] ⚠️ Erreur sauvegarde IDs:', error);
        }
    }

    async initialize() {
        if (this.initPromise) {
            return this.initPromise;
        }

        if (this.initialized) {
            return Promise.resolve();
        }

        this.initPromise = this._doInitialize();
        return this.initPromise;
    }

    async _doInitialize() {
        console.log('[MailService] 🔧 Initialisation du service v9.0...');
        
        try {
            // Détecter le provider actif
            const provider = await this.detectActiveProvider();
            
            if (!provider) {
                console.log('[MailService] ⚠️ Aucun provider détecté, mode démo activé');
                this.currentProvider = 'demo';
                this.accessToken = 'demo-token';
                this.setDefaultFolders();
                this.initialized = true;
                return true;
            }
            
            this.currentProvider = provider;
            console.log(`[MailService] ✅ Provider détecté: ${provider}`);
            
            // Obtenir le token d'accès
            await this.obtainAccessToken();
            
            // Vérifier si on a bien un token valide
            if (!this.accessToken || this.accessToken === 'demo-token') {
                console.warn('[MailService] ⚠️ Token invalide, basculement en mode démo');
                this.currentProvider = 'demo';
                this.accessToken = 'demo-token';
                this.setDefaultFolders();
                this.initialized = true;
                return true;
            }
            
            // Charger les dossiers/labels selon le provider
            await this.loadFoldersOrLabels();
            
            this.initialized = true;
            console.log('[MailService] ✅ Initialisation v9.0 terminée - Mode SANS LIMITES activé');
            
            // Notifier que le service est prêt
            window.dispatchEvent(new CustomEvent('mailServiceReady', {
                detail: { 
                    provider: this.currentProvider,
                    version: '9.0',
                    features: ['no-limits', 'full-content', 'attachments', 'persistent-dedup']
                }
            }));
            
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur initialisation:', error);
            console.log('[MailService] 🔄 Basculement en mode démo suite à l\'erreur');
            this.currentProvider = 'demo';
            this.accessToken = 'demo-token';
            this.setDefaultFolders();
            this.initialized = true;
            return true;
        }
    }

    async detectActiveProvider() {
        console.log('[MailService] 🔍 Détection du provider actif...');
        
        // 1. Vérifier Google Auth
        if (window.googleAuthService) {
            try {
                const isGoogleAuth = await window.googleAuthService.isAuthenticated();
                if (isGoogleAuth) {
                    console.log('[MailService] ✅ Google Auth détecté');
                    return 'google';
                }
            } catch (error) {
                console.warn('[MailService] ⚠️ Erreur vérification Google Auth:', error);
            }
        }
        
        // 2. Vérifier Microsoft Auth
        if (window.authService) {
            try {
                const isMSAuth = await window.authService.isAuthenticated();
                if (isMSAuth) {
                    console.log('[MailService] ✅ Microsoft Auth détecté');
                    return 'microsoft';
                }
            } catch (error) {
                console.warn('[MailService] ⚠️ Erreur vérification Microsoft Auth:', error);
            }
        }
        
        // 3. Vérifier l'app principale
        if (window.app && window.app.currentProvider) {
            console.log('[MailService] ✅ Provider depuis app:', window.app.currentProvider);
            return window.app.currentProvider;
        }
        
        // 4. Fallback sur le dernier provider
        const lastProvider = sessionStorage.getItem('lastAuthProvider') || sessionStorage.getItem('currentProvider');
        if (lastProvider === 'google' || lastProvider === 'microsoft') {
            console.log('[MailService] ⚠️ Utilisation du dernier provider:', lastProvider);
            return lastProvider;
        }
        
        console.log('[MailService] ❌ Aucun provider détecté');
        return null;
    }

    async obtainAccessToken(forceRefresh = false) {
        console.log('[MailService] 🔑 Obtention du token d\'accès...', forceRefresh ? '(Renouvellement forcé)' : '');
        
        try {
            if (this.currentProvider === 'google' && window.googleAuthService) {
                // Forcer le renouvellement si demandé
                if (forceRefresh) {
                    console.log('[MailService] 🔄 Renouvellement du token Google...');
                    
                    if (typeof window.googleAuthService.refreshToken === 'function') {
                        try {
                            await window.googleAuthService.refreshToken();
                        } catch (error) {
                            console.warn('[MailService] ⚠️ Échec refreshToken:', error);
                        }
                    }
                    
                    if (typeof window.googleAuthService.login === 'function') {
                        try {
                            const isAuth = await window.googleAuthService.isAuthenticated();
                            if (!isAuth) {
                                console.log('[MailService] 🔄 Reconnexion Google...');
                                await window.googleAuthService.login();
                            }
                        } catch (error) {
                            console.warn('[MailService] ⚠️ Échec reconnexion:', error);
                        }
                    }
                }
                
                this.accessToken = await window.googleAuthService.getAccessToken();
                
                if (!this.accessToken) {
                    console.warn('[MailService] ⚠️ Token Google vide');
                    throw new Error('Token Google invalide');
                }
                
                console.log('[MailService] ✅ Token Google obtenu');
                
            } else if (this.currentProvider === 'microsoft' && window.authService) {
                // Forcer le renouvellement si demandé
                if (forceRefresh) {
                    console.log('[MailService] 🔄 Renouvellement du token Microsoft...');
                    
                    if (typeof window.authService.refreshToken === 'function') {
                        try {
                            await window.authService.refreshToken();
                        } catch (error) {
                            console.warn('[MailService] ⚠️ Échec refreshToken:', error);
                        }
                    }
                    
                    if (typeof window.authService.login === 'function') {
                        try {
                            const isAuth = await window.authService.isAuthenticated();
                            if (!isAuth) {
                                console.log('[MailService] 🔄 Reconnexion Microsoft...');
                                await window.authService.login();
                            }
                        } catch (error) {
                            console.warn('[MailService] ⚠️ Échec reconnexion:', error);
                        }
                    }
                }
                
                this.accessToken = await window.authService.getAccessToken();
                
                if (!this.accessToken) {
                    console.warn('[MailService] ⚠️ Token Microsoft vide');
                    throw new Error('Token Microsoft invalide');
                }
                
                console.log('[MailService] ✅ Token Microsoft obtenu');
                
            } else if (this.currentProvider === 'demo') {
                this.accessToken = 'demo-token';
                console.log('[MailService] ✅ Mode démo activé');
            } else {
                throw new Error(`Impossible d'obtenir le token pour ${this.currentProvider}`);
            }
            
            // Réinitialiser le compteur de tentatives si succès
            if (this.accessToken && this.accessToken !== 'demo-token') {
                this.tokenRefreshAttempts = 0;
            }
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur obtention token:', error);
            this.tokenRefreshAttempts++;
            
            if (this.tokenRefreshAttempts >= this.maxTokenRefreshAttempts) {
                console.warn('[MailService] ⚠️ Trop de tentatives échouées, basculement en mode démo');
                this.currentProvider = 'demo';
                this.accessToken = 'demo-token';
            } else {
                throw error;
            }
        }
    }

    async loadFoldersOrLabels() {
        console.log(`[MailService] 📁 Chargement des dossiers pour ${this.currentProvider}...`);
        
        if (this.currentProvider === 'google') {
            await this.loadGmailLabels();
        } else if (this.currentProvider === 'microsoft') {
            await this.loadOutlookFolders();
        } else {
            this.setDefaultFolders();
        }
    }

    async loadGmailLabels() {
        console.log('[MailService] 📧 Chargement des labels Gmail...');
        
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
            try {
                const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 401 && retryCount < maxRetries) {
                        console.warn(`[MailService] ⚠️ Erreur 401 - Token expiré (tentative ${retryCount + 1}/${maxRetries})`);
                        await this.obtainAccessToken(true);
                        retryCount++;
                        continue;
                    }
                    
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                this.labels = data.labels || [];
                
                // Mapper les labels Gmail vers un format unifié
                this.folders = this.labels.map(label => ({
                    id: label.id,
                    name: label.name,
                    displayName: this.getLocalizedLabelName(label.name),
                    type: label.type,
                    parentFolderId: null,
                    childFolderCount: 0,
                    unreadItemCount: label.messagesUnread || 0,
                    totalItemCount: label.messagesTotal || 0,
                    isGmailLabel: true
                }));
                
                console.log(`[MailService] ✅ ${this.labels.length} labels Gmail chargés`);
                return;
                
            } catch (error) {
                console.error(`[MailService] ❌ Erreur chargement labels Gmail (tentative ${retryCount + 1}/${maxRetries + 1}):`, error);
                
                if (retryCount >= maxRetries) {
                    console.warn('[MailService] ⚠️ Échec après toutes les tentatives, utilisation des labels par défaut');
                    this.setDefaultLabels();
                    return;
                }
                
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    async loadOutlookFolders() {
        console.log('[MailService] 📂 Chargement des dossiers Outlook...');
        
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
            try {
                const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 401 && retryCount < maxRetries) {
                        console.warn(`[MailService] ⚠️ Erreur 401 - Token expiré (tentative ${retryCount + 1}/${maxRetries})`);
                        await this.obtainAccessToken(true);
                        retryCount++;
                        continue;
                    }
                    
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                this.folders = data.value || [];
                
                console.log(`[MailService] ✅ ${this.folders.length} dossiers Outlook chargés`);
                return;
                
            } catch (error) {
                console.error(`[MailService] ❌ Erreur chargement dossiers Outlook (tentative ${retryCount + 1}/${maxRetries + 1}):`, error);
                
                if (retryCount >= maxRetries) {
                    console.warn('[MailService] ⚠️ Échec après toutes les tentatives, utilisation des dossiers par défaut');
                    this.setDefaultFolders();
                    return;
                }
                
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE RÉCUPÉRATION D'EMAILS
    // ================================================
    async getMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📬 Récupération des messages depuis ${folderId}...`);
        console.log(`[MailService] 📊 Options:`, options);
        console.log('[MailService] 🚀 Mode SANS LIMITES activé - Récupération COMPLÈTE');
        
        if (!this.initialized) {
            console.log('[MailService] ⚠️ Service non initialisé, initialisation...');
            await this.initialize();
        }
        
        try {
            let messages = [];
            
            if (this.currentProvider === 'google') {
                messages = await this.getGmailMessages(folderId, options);
            } else if (this.currentProvider === 'microsoft') {
                messages = await this.getOutlookMessages(folderId, options);
            } else {
                console.log('[MailService] 📧 Mode démo - génération d\'emails de démonstration');
                messages = this.generateDemoEmails(options);
            }
            
            // Filtrer les doublons
            const uniqueMessages = [];
            const seenIds = new Set();
            
            messages.forEach(msg => {
                if (msg && msg.id && !seenIds.has(msg.id)) {
                    seenIds.add(msg.id);
                    uniqueMessages.push(msg);
                }
            });
            
            // Sauvegarder les IDs traités
            this.savePersistedEmailIds();
            
            console.log(`[MailService] ✅ ${uniqueMessages.length} messages uniques récupérés (CONTENU COMPLET)`);
            return uniqueMessages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération messages:', error);
            
            if (error.message && error.message.includes('401')) {
                console.log('[MailService] 🔄 Erreur 401 détectée, tentative de réinitialisation...');
                await this.reset();
                await this.initialize();
                
                if (this.currentProvider === 'demo') {
                    return this.generateDemoEmails(options);
                }
                
                try {
                    if (this.currentProvider === 'google') {
                        return await this.getGmailMessages(folderId, options);
                    } else if (this.currentProvider === 'microsoft') {
                        return await this.getOutlookMessages(folderId, options);
                    }
                } catch (retryError) {
                    console.error('[MailService] ❌ Échec après réinitialisation:', retryError);
                }
            }
            
            console.log('[MailService] 📧 Fallback vers emails de démonstration...');
            return this.generateDemoEmails(options);
        }
    }

    async getGmailMessages(labelId = 'INBOX', options = {}) {
        console.log(`[MailService] 📧 Récupération emails Gmail depuis ${labelId}...`);
        console.log('[MailService] 🚀 Mode SANS LIMITES - Récupération de TOUS les emails avec contenu COMPLET');
        
        try {
            const allMessages = [];
            let pageToken = null;
            let totalFetched = 0;
            let pageCount = 0;
            
            // Pas de limite artificielle - on récupère TOUT
            const targetCount = options.top || Number.MAX_SAFE_INTEGER;
            
            do {
                pageCount++;
                console.log(`[MailService] 📄 Récupération page ${pageCount}...`);
                
                // Construire les paramètres de requête
                const params = new URLSearchParams({
                    maxResults: 500, // Maximum autorisé par l'API Gmail
                    labelIds: labelId,
                    includeSpamTrash: false
                });

                // Ajouter le filtre si fourni
                if (options.filter) {
                    params.append('q', options.filter);
                }
                
                // Ajouter le token de pagination si disponible
                if (pageToken) {
                    params.append('pageToken', pageToken);
                }

                // Requête pour obtenir la liste des messages
                const listResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!listResponse.ok) {
                    throw new Error(`HTTP ${listResponse.status}: ${listResponse.statusText}`);
                }

                const listData = await listResponse.json();
                const messagesList = listData.messages || [];
                pageToken = listData.nextPageToken;
                
                console.log(`[MailService] 📋 ${messagesList.length} messages trouvés dans la page ${pageCount}`);
                
                if (messagesList.length === 0) {
                    break;
                }

                // Récupérer les détails COMPLETS en batch
                const detailedMessages = await this.getGmailMessageDetailsBatch(messagesList, true); // true = contenu complet
                allMessages.push(...detailedMessages);
                totalFetched = allMessages.length;
                
                console.log(`[MailService] 📊 Total récupéré: ${totalFetched} emails (avec contenu complet)`);
                
                // Petite pause pour ne pas surcharger l'API
                if (pageToken) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                // Continuer tant qu'il y a des pages et qu'on n'a pas atteint la limite demandée
            } while (pageToken && totalFetched < targetCount);
            
            console.log(`[MailService] ✅ ${allMessages.length} messages Gmail récupérés au total (CONTENU COMPLET)`);
            return allMessages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération Gmail:', error);
            throw error;
        }
    }

    async getGmailMessageDetailsBatch(messagesList, fullContent = true) {
        const batchSize = 50;
        const detailedMessages = [];
        
        for (let i = 0; i < messagesList.length; i += batchSize) {
            const batch = messagesList.slice(i, i + batchSize);
            
            // Créer toutes les promesses pour ce batch
            const batchPromises = batch.map(msg => {
                // Vérifier si on a déjà cet email
                if (this.fetchedEmailIds.has(msg.id)) {
                    return null;
                }
                this.fetchedEmailIds.add(msg.id);
                return this.getGmailMessageDetails(msg.id, fullContent);
            });
            
            // Attendre que toutes les requêtes du batch se terminent
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Traiter les résultats
            batchResults.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    detailedMessages.push(result.value);
                }
            });
            
            // Petite pause entre les batchs
            if (i + batchSize < messagesList.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        return detailedMessages;
    }

    async getGmailMessageDetails(messageId, fullContent = true) {
        try {
            // Récupérer le contenu COMPLET du message
            const format = fullContent ? 'full' : 'metadata';
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error(`HTTP 401: Unauthorized`);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const message = await response.json();
            
            // Extraire les métadonnées des headers
            const headers = message.payload?.headers || [];
            const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
            
            // Extraire le contenu complet du message avec images
            let bodyContent = message.snippet || '';
            let htmlContent = '';
            let textContent = '';
            let attachments = [];
            let inlineImages = [];
            
            if (fullContent && message.payload) {
                const extraction = this.extractGmailContent(message.payload);
                bodyContent = extraction.text || extraction.html || message.snippet || '';
                htmlContent = extraction.html || '';
                textContent = extraction.text || '';
                attachments = extraction.attachments || [];
                inlineImages = extraction.inlineImages || [];
                
                // Traiter les images inline dans le HTML
                if (htmlContent && inlineImages.length > 0) {
                    htmlContent = await this.processInlineImagesGmail(messageId, htmlContent, inlineImages);
                }
            }
            
            // Extraire toutes les images (inline + attachments)
            const allImages = [
                ...inlineImages.map(img => ({ ...img, isInline: true })),
                ...attachments.filter(att => att.contentType && att.contentType.startsWith('image/'))
            ];
            
            // Convertir au format unifié
            const unifiedMessage = {
                id: message.id,
                conversationId: message.threadId,
                receivedDateTime: new Date(parseInt(message.internalDate)).toISOString(),
                subject: getHeader('Subject') || 'Sans sujet',
                bodyPreview: message.snippet || '',
                body: {
                    content: htmlContent || textContent || bodyContent,
                    contentType: htmlContent ? 'html' : 'text'
                },
                bodyHtml: htmlContent,
                bodyText: textContent,
                importance: message.labelIds?.includes('IMPORTANT') ? 'high' : 'normal',
                isRead: !message.labelIds?.includes('UNREAD'),
                isDraft: message.labelIds?.includes('DRAFT'),
                hasAttachments: attachments.length > 0,
                hasImages: allImages.length > 0,
                attachments: attachments,
                images: allImages,
                inlineImages: inlineImages,
                from: {
                    emailAddress: {
                        name: this.extractNameFromEmail(getHeader('From')),
                        address: this.extractAddressFromEmail(getHeader('From'))
                    }
                },
                toRecipients: this.parseEmailAddresses(getHeader('To')),
                ccRecipients: this.parseEmailAddresses(getHeader('Cc')),
                bccRecipients: this.parseEmailAddresses(getHeader('Bcc')),
                replyTo: this.parseEmailAddresses(getHeader('Reply-To')),
                categories: message.labelIds || [],
                labels: message.labelIds || [],
                webLink: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
                provider: 'google',
                sizeEstimate: message.sizeEstimate || 0,
                rawData: fullContent ? message : null
            };
            
            return unifiedMessage;
            
        } catch (error) {
            console.error(`[MailService] ❌ Erreur récupération détails Gmail ${messageId}:`, error);
            if (error.message && error.message.includes('401')) {
                throw error;
            }
            return null;
        }
    }

    extractGmailContent(payload, attachments = [], inlineImages = []) {
        let text = '';
        let html = '';
        
        if (!payload) return { text, html, attachments, inlineImages };
        
        // Si c'est une partie simple
        if (payload.body && payload.body.data) {
            const decoded = this.base64Decode(payload.body.data);
            
            if (payload.mimeType === 'text/plain') {
                text = decoded;
            } else if (payload.mimeType === 'text/html') {
                html = decoded;
            }
        }
        
        // Si c'est un message multipart
        if (payload.parts) {
            for (const part of payload.parts) {
                // Vérifier si c'est une pièce jointe
                if (part.filename && part.body) {
                    const attachment = {
                        id: part.body.attachmentId,
                        partId: part.partId,
                        name: part.filename,
                        contentType: part.mimeType,
                        size: part.body.size || 0,
                        contentId: this.getHeaderValue(part.headers, 'Content-ID'),
                        contentDisposition: this.getHeaderValue(part.headers, 'Content-Disposition'),
                        inline: false
                    };
                    
                    // Vérifier si c'est une image inline
                    if (attachment.contentId || (attachment.contentDisposition && attachment.contentDisposition.includes('inline'))) {
                        attachment.inline = true;
                        // Nettoyer le Content-ID
                        if (attachment.contentId) {
                            attachment.contentId = attachment.contentId.replace(/[<>]/g, '');
                        }
                        inlineImages.push(attachment);
                    }
                    
                    attachments.push(attachment);
                } else {
                    // Récursivement extraire le contenu
                    const subContent = this.extractGmailContent(part, attachments, inlineImages);
                    if (subContent.text) text = text || subContent.text;
                    if (subContent.html) html = html || subContent.html;
                }
            }
        }
        
        return { text, html, attachments, inlineImages };
    }

    getHeaderValue(headers, headerName) {
        if (!headers) return null;
        const header = headers.find(h => h.name.toLowerCase() === headerName.toLowerCase());
        return header ? header.value : null;
    }

    async processInlineImagesGmail(messageId, htmlContent, inlineImages) {
        console.log(`[MailService] 🖼️ Traitement de ${inlineImages.length} images inline...`);
        
        try {
            let processedHtml = htmlContent;
            
            for (const image of inlineImages) {
                if (!image.id) continue;
                
                try {
                    // Récupérer les données de l'image
                    const imageData = await this.getGmailAttachment(messageId, image.id);
                    if (imageData && imageData.data) {
                        const dataUrl = `data:${image.contentType};base64,${imageData.data}`;
                        
                        // Remplacer les références CID
                        if (image.contentId) {
                            // Remplacer cid:contentId
                            processedHtml = processedHtml.replace(
                                new RegExp(`cid:${image.contentId}`, 'gi'),
                                dataUrl
                            );
                            // Remplacer src="contentId"
                            processedHtml = processedHtml.replace(
                                new RegExp(`src=["']?${image.contentId}["']?`, 'gi'),
                                `src="${dataUrl}"`
                            );
                        }
                        
                        // Ajouter le data URL à l'objet image pour référence
                        image.dataUrl = dataUrl;
                    }
                } catch (error) {
                    console.error(`[MailService] ❌ Erreur récupération image ${image.id}:`, error);
                }
            }
            
            return processedHtml;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur traitement images inline:', error);
            return htmlContent;
        }
    }

    base64Decode(data) {
        try {
            // Remplacer les caractères URL-safe par les caractères standards
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            return decodeURIComponent(escape(atob(base64)));
        } catch (error) {
            console.error('[MailService] Erreur décodage base64:', error);
            return '';
        }
    }

    async getOutlookMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📂 Récupération emails Outlook depuis ${folderId}...`);
        console.log('[MailService] 🚀 Mode SANS LIMITES - Récupération de TOUS les emails avec contenu COMPLET et IMAGES');
        
        try {
            const allMessages = [];
            let nextLink = null;
            let totalFetched = 0;
            let pageCount = 0;
            
            // Pas de limite artificielle
            const targetCount = options.top || Number.MAX_SAFE_INTEGER;
            
            do {
                pageCount++;
                console.log(`[MailService] 📄 Récupération page ${pageCount}...`);
                
                let url;
                
                if (nextLink) {
                    url = nextLink;
                } else {
                    // Première requête avec TOUS les champs et expansions
                    const params = new URLSearchParams({
                        '$top': 999, // Maximum autorisé par l'API
                        '$select': 'id,conversationId,receivedDateTime,subject,body,bodyPreview,importance,isRead,isDraft,hasAttachments,from,toRecipients,ccRecipients,bccRecipients,replyTo,categories,flag,internetMessageId,parentFolderId,webLink,attachments,internetMessageHeaders',
                        '$expand': 'attachments($select=id,name,contentType,size,isInline,contentId,contentLocation,contentBytes)',
                        '$orderby': 'receivedDateTime desc'
                    });

                    // Ajouter le filtre si fourni
                    if (options.filter) {
                        params.append('$filter', options.filter);
                    }
                    
                    // Gérer le skip pour la pagination manuelle
                    if (options.skip) {
                        params.append('$skip', options.skip);
                    }
                    
                    url = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages?${params}`;
                }

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'outlook.body-content-type="html"' // Préférer le HTML
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error(`HTTP 401: Unauthorized`);
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const messages = data.value || [];
                nextLink = data['@odata.nextLink'] || null;
                
                console.log(`[MailService] 📋 ${messages.length} messages trouvés dans la page ${pageCount}`);
                
                // Traiter et enrichir chaque message
                for (const message of messages) {
                    if (message && message.id && !this.fetchedEmailIds.has(message.id)) {
                        this.fetchedEmailIds.add(message.id);
                        
                        // Enrichir avec les données complètes
                        message.provider = 'microsoft';
                        message.bodyText = message.body?.content || '';
                        message.bodyHtml = message.body?.contentType === 'html' ? message.body.content : '';
                        
                        // Séparer les images des autres pièces jointes
                        const allImages = [];
                        const regularAttachments = [];
                        const inlineImages = [];
                        
                        if (message.attachments) {
                            message.attachments.forEach(att => {
                                const processedAtt = {
                                    id: att.id,
                                    name: att.name,
                                    contentType: att.contentType,
                                    size: att.size,
                                    inline: att.isInline,
                                    contentId: att.contentId,
                                    contentLocation: att.contentLocation,
                                    contentBytes: att.contentBytes // Base64 si disponible
                                };
                                
                                // Vérifier si c'est une image
                                if (att.contentType && att.contentType.startsWith('image/')) {
                                    allImages.push(processedAtt);
                                    
                                    if (att.isInline || att.contentId) {
                                        processedAtt.dataUrl = att.contentBytes ? 
                                            `data:${att.contentType};base64,${att.contentBytes}` : null;
                                        inlineImages.push(processedAtt);
                                    }
                                }
                                
                                regularAttachments.push(processedAtt);
                            });
                            
                            // Traiter les images inline dans le HTML
                            if (message.bodyHtml && inlineImages.length > 0) {
                                message.bodyHtml = this.processInlineImagesOutlook(message.bodyHtml, inlineImages);
                            }
                        }
                        
                        message.attachments = regularAttachments;
                        message.images = allImages;
                        message.inlineImages = inlineImages;
                        message.hasImages = allImages.length > 0;
                        
                        allMessages.push(message);
                    }
                }
                
                totalFetched = allMessages.length;
                console.log(`[MailService] 📊 Total Outlook récupéré: ${totalFetched} emails (avec contenu complet et images)`);
                
                // Petite pause pour ne pas surcharger l'API
                if (nextLink) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                // Continuer tant qu'il y a un nextLink et qu'on n'a pas atteint la limite
            } while (nextLink && totalFetched < targetCount);
            
            // Sauvegarder les IDs traités
            this.savePersistedEmailIds();
            
            console.log(`[MailService] ✅ ${allMessages.length} messages Outlook récupérés au total (CONTENU COMPLET + IMAGES)`);
            return allMessages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération Outlook:', error);
            throw error;
        }
    }

    processInlineImagesOutlook(htmlContent, inlineImages) {
        console.log(`[MailService] 🖼️ Traitement de ${inlineImages.length} images inline Outlook...`);
        
        let processedHtml = htmlContent;
        
        inlineImages.forEach(image => {
            if (!image.dataUrl) return;
            
            // Remplacer les références CID
            if (image.contentId) {
                // Remplacer cid:contentId
                processedHtml = processedHtml.replace(
                    new RegExp(`cid:${image.contentId}`, 'gi'),
                    image.dataUrl
                );
                // Remplacer src="contentId"
                processedHtml = processedHtml.replace(
                    new RegExp(`src=["']?${image.contentId}["']?`, 'gi'),
                    `src="${image.dataUrl}"`
                );
            }
            
            // Remplacer par nom de fichier si nécessaire
            if (image.name) {
                processedHtml = processedHtml.replace(
                    new RegExp(`src=["']?${image.name}["']?`, 'gi'),
                    `src="${image.dataUrl}"`
                );
            }
        });
        
        return processedHtml;
    }

    // ================================================
    // RÉCUPÉRATION DES PIÈCES JOINTES ET IMAGES
    // ================================================
    async getGmailAttachment(messageId, attachmentId) {
        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                data: data.data, // Base64 encoded
                size: data.size
            };
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération pièce jointe Gmail:', error);
            return null;
        }
    }

    async getOutlookAttachment(messageId, attachmentId, includeBytes = true) {
        try {
            // Pour Outlook, on peut demander directement les bytes
            const url = includeBytes ? 
                `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments/${attachmentId}?$select=id,name,contentType,size,contentBytes,isInline,contentId` :
                `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments/${attachmentId}`;
                
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                data: data.contentBytes, // Base64 encoded
                contentType: data.contentType,
                name: data.name,
                size: data.size,
                isInline: data.isInline,
                contentId: data.contentId
            };
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération pièce jointe Outlook:', error);
            return null;
        }
    }

    async downloadAllAttachments(email) {
        console.log(`[MailService] 📎 Téléchargement de toutes les pièces jointes pour l'email ${email.id}...`);
        
        if (!email.attachments || email.attachments.length === 0) {
            return [];
        }
        
        const downloadedAttachments = [];
        
        for (const attachment of email.attachments) {
            try {
                let attachmentData;
                
                if (email.provider === 'google') {
                    attachmentData = await this.getGmailAttachment(email.id, attachment.id);
                } else if (email.provider === 'microsoft') {
                    attachmentData = await this.getOutlookAttachment(email.id, attachment.id);
                }
                
                if (attachmentData && attachmentData.data) {
                    downloadedAttachments.push({
                        ...attachment,
                        data: attachmentData.data,
                        dataUrl: `data:${attachment.contentType};base64,${attachmentData.data}`
                    });
                }
            } catch (error) {
                console.error(`[MailService] ❌ Erreur téléchargement pièce jointe ${attachment.name}:`, error);
            }
        }
        
        console.log(`[MailService] ✅ ${downloadedAttachments.length} pièces jointes téléchargées`);
        return downloadedAttachments;
    }

    // ================================================
    // EXTRACTION D'IMAGES DEPUIS LE HTML
    // ================================================
    extractExternalImages(htmlContent) {
        if (!htmlContent) return [];
        
        const images = [];
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;
        
        while ((match = imgRegex.exec(htmlContent)) !== null) {
            const src = match[1];
            
            // Ignorer les images data:, cid: et les chemins relatifs
            if (!src.startsWith('data:') && !src.startsWith('cid:') && 
                (src.startsWith('http://') || src.startsWith('https://'))) {
                images.push({
                    type: 'external',
                    url: src,
                    isExternal: true
                });
            }
        }
        
        return images;
    }

    // ================================================
    // GÉNÉRATION D'EMAILS DE DÉMONSTRATION
    // ================================================
    generateDemoEmails(options = {}) {
        console.log('[MailService] 🎭 Génération d\'emails de démonstration avec images...');
        
        const categories = ['shopping', 'newsletters', 'meetings', 'finance', 'marketing', 'work', 'personal', 'social'];
        const senders = [
            { name: 'Amazon', domain: 'amazon.com' },
            { name: 'TechCrunch', domain: 'techcrunch.com' },
            { name: 'Google Calendar', domain: 'google.com' },
            { name: 'BNP Paribas', domain: 'bnpparibas.com' },
            { name: 'Nike', domain: 'nike.com' },
            { name: 'LinkedIn', domain: 'linkedin.com' },
            { name: 'GitHub', domain: 'github.com' },
            { name: 'Spotify', domain: 'spotify.com' }
        ];
        
        const subjects = [
            'Votre commande a été expédiée',
            'Newsletter hebdomadaire',
            'Rappel: Réunion demain',
            'Votre relevé mensuel',
            'Offre spéciale -50%',
            'Nouvelle connexion détectée',
            'Pull request approuvé',
            'Votre playlist de la semaine'
        ];
        
        const count = options.top || 100;
        const demoEmails = [];
        
        for (let i = 0; i < count; i++) {
            const sender = senders[i % senders.length];
            const subject = subjects[i % subjects.length];
            const category = categories[i % categories.length];
            const hoursAgo = Math.floor(Math.random() * 168);
            
            const bodyText = `Ceci est un email de démonstration ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
            
            // HTML avec images de démonstration
            const bodyHtml = `
                <html>
                <body style="font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <img src="https://via.placeholder.com/600x200/667eea/ffffff?text=${encodeURIComponent(sender.name)}" 
                             alt="Header" style="width: 100%; height: auto;">
                        <h1 style="color: #333;">${subject}</h1>
                        <p>${bodyText}</p>
                        <div style="margin: 20px 0;">
                            <img src="https://via.placeholder.com/300x200/764ba2/ffffff?text=Product+Image" 
                                 alt="Product" style="width: 300px; height: auto;">
                        </div>
                        <p>Cordialement,<br><strong>${sender.name}</strong></p>
                    </div>
                </body>
                </html>`;
            
            const hasImages = Math.random() > 0.5;
            const images = hasImages ? [
                {
                    id: `demo_img_${i}_1`,
                    name: 'header.png',
                    contentType: 'image/png',
                    size: 50000,
                    inline: true,
                    contentId: `header_${i}`,
                    dataUrl: `https://via.placeholder.com/600x200/667eea/ffffff?text=${encodeURIComponent(sender.name)}`
                },
                {
                    id: `demo_img_${i}_2`,
                    name: 'product.png',
                    contentType: 'image/png',
                    size: 30000,
                    inline: true,
                    contentId: `product_${i}`,
                    dataUrl: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Product+Image'
                }
            ] : [];
            
            demoEmails.push({
                id: `demo_${Date.now()}_${i}`,
                subject: `${subject} #${i + 1}`,
                from: {
                    emailAddress: {
                        name: sender.name,
                        address: `noreply@${sender.domain}`
                    }
                },
                receivedDateTime: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
                bodyPreview: bodyText.substring(0, 100) + '...',
                body: {
                    content: bodyHtml,
                    contentType: 'html'
                },
                bodyText: bodyText,
                bodyHtml: bodyHtml,
                importance: Math.random() > 0.8 ? 'high' : 'normal',
                isRead: Math.random() > 0.5,
                isDraft: false,
                hasAttachments: Math.random() > 0.7,
                hasImages: hasImages,
                images: images,
                inlineImages: images.filter(img => img.inline),
                attachments: Math.random() > 0.7 ? [{
                    id: `demo_att_${i}`,
                    name: 'document.pdf',
                    contentType: 'application/pdf',
                    size: 1024 * Math.floor(Math.random() * 1000),
                    inline: false
                }] : [],
                provider: this.currentProvider,
                category: category,
                isDemoEmail: true
            });
        }
        
        demoEmails.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));
        
        console.log(`[MailService] ✅ ${demoEmails.length} emails de démonstration générés (avec contenu complet et images)`);
        return demoEmails;
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    hasGmailAttachments(payload) {
        if (!payload) return false;
        
        if (payload.parts) {
            return payload.parts.some(part => 
                part.filename && part.filename.length > 0
            );
        }
        
        return false;
    }

    extractNameFromEmail(emailStr) {
        if (!emailStr) return '';
        
        const match = emailStr.match(/^"?([^"<]+)"?\s*<?/);
        return match ? match[1].trim() : '';
    }

    extractAddressFromEmail(emailStr) {
        if (!emailStr) return '';
        
        const match = emailStr.match(/<([^>]+)>/);
        return match ? match[1] : emailStr.trim();
    }

    parseEmailAddresses(emailStr) {
        if (!emailStr) return [];
        
        const addresses = emailStr.split(',').map(addr => {
            const trimmed = addr.trim();
            return {
                emailAddress: {
                    name: this.extractNameFromEmail(trimmed),
                    address: this.extractAddressFromEmail(trimmed)
                }
            };
        });
        
        return addresses.filter(addr => addr.emailAddress.address);
    }

    getLocalizedLabelName(labelName) {
        const labelMap = {
            'INBOX': 'Boîte de réception',
            'SENT': 'Messages envoyés',
            'DRAFT': 'Brouillons',
            'TRASH': 'Corbeille',
            'SPAM': 'Spam',
            'STARRED': 'Suivis',
            'IMPORTANT': 'Important',
            'CATEGORY_PERSONAL': 'Personnel',
            'CATEGORY_SOCIAL': 'Réseaux sociaux',
            'CATEGORY_PROMOTIONS': 'Promotions',
            'CATEGORY_UPDATES': 'Mises à jour',
            'CATEGORY_FORUMS': 'Forums'
        };
        
        return labelMap[labelName] || labelName;
    }

    setDefaultLabels() {
        console.log('[MailService] 📋 Configuration des labels par défaut...');
        
        this.labels = [
            { id: 'INBOX', name: 'INBOX', type: 'system' },
            { id: 'SENT', name: 'SENT', type: 'system' },
            { id: 'DRAFT', name: 'DRAFT', type: 'system' },
            { id: 'TRASH', name: 'TRASH', type: 'system' },
            { id: 'STARRED', name: 'STARRED', type: 'system' }
        ];
        
        this.folders = this.labels.map(label => ({
            id: label.id,
            name: label.name,
            displayName: this.getLocalizedLabelName(label.name),
            type: label.type,
            parentFolderId: null,
            childFolderCount: 0,
            unreadItemCount: 0,
            totalItemCount: 0,
            isGmailLabel: true
        }));
    }

    setDefaultFolders() {
        console.log('[MailService] 📂 Configuration des dossiers par défaut...');
        
        this.folders = [
            {
                id: 'inbox',
                displayName: 'Boîte de réception',
                parentFolderId: null,
                childFolderCount: 0,
                unreadItemCount: 0,
                totalItemCount: 0
            },
            {
                id: 'sentitems',
                displayName: 'Éléments envoyés',
                parentFolderId: null,
                childFolderCount: 0,
                unreadItemCount: 0,
                totalItemCount: 0
            },
            {
                id: 'drafts',
                displayName: 'Brouillons',
                parentFolderId: null,
                childFolderCount: 0,
                unreadItemCount: 0,
                totalItemCount: 0
            },
            {
                id: 'deleteditems',
                displayName: 'Éléments supprimés',
                parentFolderId: null,
                childFolderCount: 0,
                unreadItemCount: 0,
                totalItemCount: 0
            },
            {
                id: 'junkmail',
                displayName: 'Courrier indésirable',
                parentFolderId: null,
                childFolderCount: 0,
                unreadItemCount: 0,
                totalItemCount: 0
            }
        ];
    }

    // ================================================
    // MÉTHODES ADDITIONNELLES
    // ================================================
    async getAllMessages(folderId = 'inbox', filter = null) {
        console.log('[MailService] 📥 Récupération de TOUS les messages (SANS LIMITE)...');
        
        const options = {
            filter: filter
            // Pas de limite top - on récupère tout
        };
        
        return this.getMessages(folderId, options);
    }

    async searchMessages(query) {
        console.log(`[MailService] 🔍 Recherche: "${query}"`);
        
        if (this.currentProvider === 'google') {
            return this.getMessages('INBOX', { filter: query });
        } else if (this.currentProvider === 'microsoft') {
            const searchUrl = `https://graph.microsoft.com/v1.0/me/messages?$search="${query}"&$top=999&$expand=attachments`;
            
            try {
                const response = await fetch(searchUrl, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'outlook.body-content-type="html"'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                return data.value || [];
                
            } catch (error) {
                console.error('[MailService] ❌ Erreur recherche:', error);
                return [];
            }
        } else {
            const allEmails = await this.getMessages('inbox');
            const lowerQuery = query.toLowerCase();
            
            return allEmails.filter(email => 
                email.subject.toLowerCase().includes(lowerQuery) ||
                email.bodyPreview.toLowerCase().includes(lowerQuery) ||
                email.bodyText?.toLowerCase().includes(lowerQuery) ||
                email.from?.emailAddress?.name?.toLowerCase().includes(lowerQuery) ||
                email.from?.emailAddress?.address?.toLowerCase().includes(lowerQuery)
            );
        }
    }

    // ================================================
    // MÉTHODES D'INFORMATION ET DEBUG
    // ================================================
    getProviderInfo() {
        return {
            provider: this.currentProvider,
            isGmail: this.currentProvider === 'google',
            isOutlook: this.currentProvider === 'microsoft',
            isDemo: this.currentProvider === 'demo',
            initialized: this.initialized,
            hasAccessToken: !!this.accessToken,
            foldersCount: this.folders.length,
            labelsCount: this.labels.length,
            fetchedEmailIds: this.fetchedEmailIds.size,
            cacheSize: this.emailCache.size,
            tokenRefreshAttempts: this.tokenRefreshAttempts,
            version: '9.0',
            features: ['no-limits', 'full-content', 'attachments', 'persistent-dedup']
        };
    }

    isInitialized() {
        return this.initialized;
    }

    getCurrentProvider() {
        return this.currentProvider;
    }

    getFolders() {
        return this.folders;
    }

    getLabels() {
        return this.labels;
    }

    // ================================================
    // NETTOYAGE ET RÉINITIALISATION
    // ================================================
    clearCache() {
        console.log('[MailService] 🧹 Nettoyage du cache...');
        this.emailCache.clear();
        // Ne pas effacer fetchedEmailIds pour garder l'historique
        this.pageTokens.clear();
        this.lastFetchTime = 0;
    }

    async reset() {
        console.log('[MailService] 🔄 Réinitialisation du service...');
        
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
        this.folders = [];
        this.labels = [];
        this.currentFolder = 'inbox';
        this.initPromise = null;
        this.tokenRefreshAttempts = 0;
        
        // Sauvegarder les IDs avant de nettoyer
        this.savePersistedEmailIds();
        this.clearCache();
        
        console.log('[MailService] ✅ Service réinitialisé');
    }

    cleanup() {
        console.log('[MailService] 🧹 Nettoyage du service...');
        this.savePersistedEmailIds();
        this.reset();
        console.log('[MailService] ✅ Nettoyage terminé');
    }
}

// ================================================
// INSTANCE GLOBALE
// ================================================
if (window.mailService) {
    console.log('[MailService] 🔄 Nettoyage ancienne instance...');
    window.mailService.cleanup?.();
}

window.mailService = new MailService();

// ================================================
// FONCTIONS UTILITAIRES GLOBALES
// ================================================
window.testMailService = async function(options = {}) {
    console.group('🧪 TEST MailService v9.0 - SANS LIMITES');
    
    try {
        console.log('1. Informations du service:');
        console.log(window.mailService.getProviderInfo());
        
        console.log('\n2. Test d\'initialisation:');
        await window.mailService.initialize();
        console.log('✅ Service initialisé');
        
        console.log('\n3. Test de récupération d\'emails (mode SANS LIMITES):');
        const testCount = options.count || 50;
        const emails = await window.mailService.getMessages('inbox', { top: testCount });
        console.log(`✅ ${emails.length} emails récupérés avec CONTENU COMPLET`);
        
        console.log('\n4. Vérification du contenu complet:');
        if (emails.length > 0) {
            const sampleEmail = emails[0];
            console.log('Email exemple:', {
                id: sampleEmail.id,
                subject: sampleEmail.subject,
                hasBody: !!sampleEmail.body,
                hasBodyText: !!sampleEmail.bodyText,
                hasBodyHtml: !!sampleEmail.bodyHtml,
                attachmentsCount: sampleEmail.attachments?.length || 0
            });
        }
        
        console.log('\n5. Vérification des doublons:');
        const uniqueIds = new Set(emails.map(e => e.id));
        console.log(`📊 ${uniqueIds.size} IDs uniques sur ${emails.length} emails`);
        
        console.log('\n6. Aperçu des emails:');
        emails.slice(0, 3).forEach((email, index) => {
            console.log(`  ${index + 1}. [${email.id}] ${email.subject}`);
            console.log(`     De: ${email.from?.emailAddress?.name} <${email.from?.emailAddress?.address}>`);
            console.log(`     Pièces jointes: ${email.attachments?.length || 0}`);
            console.log(`     Taille contenu: ${email.bodyText?.length || 0} caractères`);
        });
        
        console.log('\n7. Test de recherche (optionnel):');
        if (options.searchQuery) {
            const searchResults = await window.mailService.searchMessages(options.searchQuery);
            console.log(`🔍 ${searchResults.length} résultats pour "${options.searchQuery}"`);
        }
        
        console.log('\n✅ Test terminé avec succès - Mode SANS LIMITES fonctionnel');
        return { 
            success: true, 
            emails: emails.length, 
            unique: uniqueIds.size,
            provider: window.mailService.getCurrentProvider(),
            hasFullContent: emails.some(e => e.bodyText || e.bodyHtml)
        };
        
    } catch (error) {
        console.error('❌ Test échoué:', error);
        return { success: false, error: error.message };
    } finally {
        console.groupEnd();
    }
};

// Fonction pour récupérer TOUS les emails
window.getAllEmails = async function() {
    console.log('📥 Récupération de TOUS les emails (SANS LIMITE)...');
    const allEmails = await window.mailService.getAllMessages();
    console.log(`✅ ${allEmails.length} emails récupérés au total avec CONTENU COMPLET`);
    return allEmails;
};

// Fonction pour forcer le renouvellement du token
window.refreshMailToken = async function() {
    console.log('🔄 Renouvellement forcé du token...');
    try {
        await window.mailService.obtainAccessToken(true);
        console.log('✅ Token renouvelé avec succès');
        return true;
    } catch (error) {
        console.error('❌ Échec du renouvellement:', error);
        return false;
    }
};

// Fonction pour effacer l'historique des IDs
window.clearMailHistory = function() {
    console.log('🧹 Effacement de l\'historique des emails traités...');
    window.mailService.fetchedEmailIds.clear();
    localStorage.removeItem('mailservice_processed_ids');
    console.log('✅ Historique effacé');
};

console.log('✅ MailService v9.0 loaded - Mode SANS LIMITES avec récupération COMPLÈTE + IMAGES!');
console.log('💡 Utilisez window.testMailService() pour tester');
console.log('💡 Utilisez window.getAllEmails() pour récupérer TOUS les emails');
console.log('💡 Utilisez window.clearMailHistory() pour réinitialiser l\'historique');
console.log('🖼️ Les images inline sont automatiquement converties en data URLs');
