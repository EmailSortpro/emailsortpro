// MailService.js - Version 8.0 - Service de gestion des emails avec gestion des erreurs 401

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
        
        // Anti-duplication et pagination
        this.fetchedEmailIds = new Set();
        this.pageTokens = new Map(); // Pour gérer la pagination Gmail
        
        // Gestion des erreurs d'authentification
        this.tokenRefreshAttempts = 0;
        this.maxTokenRefreshAttempts = 3;
        
        console.log('[MailService] Constructor v8.0 - Service emails avec gestion erreurs 401');
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
        console.log('[MailService] 🔧 Initialisation du service...');
        
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
            console.log('[MailService] ✅ Initialisation terminée');
            
            // Notifier que le service est prêt
            window.dispatchEvent(new CustomEvent('mailServiceReady', {
                detail: { provider: this.currentProvider }
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
                    
                    // Essayer refreshToken si disponible
                    if (typeof window.googleAuthService.refreshToken === 'function') {
                        try {
                            await window.googleAuthService.refreshToken();
                        } catch (error) {
                            console.warn('[MailService] ⚠️ Échec refreshToken:', error);
                        }
                    }
                    
                    // Sinon, essayer de se reconnecter
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
                
                console.log('[MailService] ✅ Token Google obtenu:', this.accessToken ? 'Valide' : 'Invalide');
                
            } else if (this.currentProvider === 'microsoft' && window.authService) {
                // Forcer le renouvellement si demandé
                if (forceRefresh) {
                    console.log('[MailService] 🔄 Renouvellement du token Microsoft...');
                    
                    // Essayer refreshToken si disponible
                    if (typeof window.authService.refreshToken === 'function') {
                        try {
                            await window.authService.refreshToken();
                        } catch (error) {
                            console.warn('[MailService] ⚠️ Échec refreshToken:', error);
                        }
                    }
                    
                    // Sinon, essayer de se reconnecter
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
                
                console.log('[MailService] ✅ Token Microsoft obtenu:', this.accessToken ? 'Valide' : 'Invalide');
                
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
            
            // Si trop de tentatives, basculer en mode démo
            if (this.tokenRefreshAttempts >= this.maxTokenRefreshAttempts) {
                console.warn('[MailService] ⚠️ Trop de tentatives échouées, basculement en mode démo');
                this.currentProvider = 'demo';
                this.accessToken = 'demo-token';
            } else {
                throw error; // Propager l'erreur pour retry
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
                    // Si erreur 401, essayer de renouveler le token
                    if (response.status === 401 && retryCount < maxRetries) {
                        console.warn(`[MailService] ⚠️ Erreur 401 - Token expiré (tentative ${retryCount + 1}/${maxRetries})`);
                        await this.obtainAccessToken(true); // Forcer le renouvellement
                        retryCount++;
                        continue; // Réessayer avec le nouveau token
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
                return; // Succès, sortir de la boucle
                
            } catch (error) {
                console.error(`[MailService] ❌ Erreur chargement labels Gmail (tentative ${retryCount + 1}/${maxRetries + 1}):`, error);
                
                if (retryCount >= maxRetries) {
                    console.warn('[MailService] ⚠️ Échec après toutes les tentatives, utilisation des labels par défaut');
                    this.setDefaultLabels();
                    return;
                }
                
                retryCount++;
                
                // Petite pause avant de réessayer
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
                    // Si erreur 401, essayer de renouveler le token
                    if (response.status === 401 && retryCount < maxRetries) {
                        console.warn(`[MailService] ⚠️ Erreur 401 - Token expiré (tentative ${retryCount + 1}/${maxRetries})`);
                        await this.obtainAccessToken(true); // Forcer le renouvellement
                        retryCount++;
                        continue; // Réessayer avec le nouveau token
                    }
                    
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                this.folders = data.value || [];
                
                console.log(`[MailService] ✅ ${this.folders.length} dossiers Outlook chargés`);
                return; // Succès, sortir de la boucle
                
            } catch (error) {
                console.error(`[MailService] ❌ Erreur chargement dossiers Outlook (tentative ${retryCount + 1}/${maxRetries + 1}):`, error);
                
                if (retryCount >= maxRetries) {
                    console.warn('[MailService] ⚠️ Échec après toutes les tentatives, utilisation des dossiers par défaut');
                    this.setDefaultFolders();
                    return;
                }
                
                retryCount++;
                
                // Petite pause avant de réessayer
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
            
            // Filtrer les doublons au cas où
            const uniqueMessages = [];
            const seenIds = new Set();
            
            messages.forEach(msg => {
                if (msg && msg.id && !seenIds.has(msg.id)) {
                    seenIds.add(msg.id);
                    uniqueMessages.push(msg);
                }
            });
            
            console.log(`[MailService] ✅ ${uniqueMessages.length} messages uniques récupérés`);
            return uniqueMessages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération messages:', error);
            
            // Si erreur d'authentification, essayer de réinitialiser
            if (error.message && error.message.includes('401')) {
                console.log('[MailService] 🔄 Erreur 401 détectée, tentative de réinitialisation...');
                await this.reset();
                await this.initialize();
                
                // Si toujours en mode démo après réinit, retourner des emails de démo
                if (this.currentProvider === 'demo') {
                    return this.generateDemoEmails(options);
                }
                
                // Sinon, réessayer une fois
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
            
            // Fallback vers emails de démonstration
            console.log('[MailService] 📧 Fallback vers emails de démonstration...');
            return this.generateDemoEmails(options);
        }
    }

    async getGmailMessages(labelId = 'INBOX', options = {}) {
        console.log(`[MailService] 📧 Récupération emails Gmail depuis ${labelId}...`);
        
        try {
            const allMessages = [];
            let pageToken = null;
            let totalFetched = 0;
            const maxResults = options.top || 500; // Par défaut 500 si non spécifié
            
            // Si on veut TOUS les emails, on met une grande limite
            const targetCount = options.all ? 10000 : maxResults;
            
            do {
                // Construire les paramètres de requête
                const params = new URLSearchParams({
                    maxResults: Math.min(500, targetCount - totalFetched), // Max 500 par requête API
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
                
                console.log(`[MailService] 📋 ${messagesList.length} messages trouvés dans cette page Gmail`);
                
                if (messagesList.length === 0) {
                    break;
                }

                // Récupérer les détails en batch
                const detailedMessages = await this.getGmailMessageDetailsBatch(messagesList);
                allMessages.push(...detailedMessages);
                totalFetched = allMessages.length;
                
                console.log(`[MailService] 📊 Total récupéré: ${totalFetched}/${targetCount}`);
                
                // Continuer si on a un token et qu'on n'a pas atteint la limite
            } while (pageToken && totalFetched < targetCount);
            
            console.log(`[MailService] ✅ ${allMessages.length} messages Gmail récupérés au total`);
            return allMessages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération Gmail:', error);
            throw error;
        }
    }

    async getGmailMessageDetailsBatch(messagesList) {
        const batchSize = 50; // Traiter 50 messages à la fois
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
                return this.getGmailMessageDetails(msg.id);
            });
            
            // Attendre que toutes les requêtes du batch se terminent
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Traiter les résultats
            batchResults.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    detailedMessages.push(result.value);
                }
            });
            
            // Petite pause entre les batchs pour éviter de surcharger l'API
            if (i + batchSize < messagesList.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        return detailedMessages;
    }

    async getGmailMessageDetails(messageId) {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Si 401, on laisse remonter l'erreur pour gestion globale
                if (response.status === 401) {
                    throw new Error(`HTTP 401: Unauthorized`);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const message = await response.json();
            
            // Extraire les métadonnées des headers
            const headers = message.payload?.headers || [];
            const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
            
            // Convertir au format unifié
            const unifiedMessage = {
                id: message.id,
                conversationId: message.threadId,
                receivedDateTime: new Date(parseInt(message.internalDate)).toISOString(),
                subject: getHeader('Subject') || 'Sans sujet',
                bodyPreview: message.snippet || '',
                importance: message.labelIds?.includes('IMPORTANT') ? 'high' : 'normal',
                isRead: !message.labelIds?.includes('UNREAD'),
                isDraft: message.labelIds?.includes('DRAFT'),
                hasAttachments: this.hasGmailAttachments(message.payload),
                from: {
                    emailAddress: {
                        name: this.extractNameFromEmail(getHeader('From')),
                        address: this.extractAddressFromEmail(getHeader('From'))
                    }
                },
                toRecipients: this.parseEmailAddresses(getHeader('To')),
                ccRecipients: this.parseEmailAddresses(getHeader('Cc')),
                categories: message.labelIds || [],
                webLink: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
                provider: 'google',
                originalData: message
            };
            
            return unifiedMessage;
            
        } catch (error) {
            console.error(`[MailService] ❌ Erreur récupération détails Gmail ${messageId}:`, error);
            // Propager les erreurs 401 pour gestion globale
            if (error.message && error.message.includes('401')) {
                throw error;
            }
            return null;
        }
    }

    async getOutlookMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📂 Récupération emails Outlook depuis ${folderId}...`);
        
        try {
            const allMessages = [];
            let nextLink = null;
            let totalFetched = 0;
            const maxResults = options.top || 999;
            const targetCount = options.all ? 10000 : maxResults;
            
            do {
                let url;
                
                if (nextLink) {
                    // Utiliser le lien de pagination fourni par l'API
                    url = nextLink;
                } else {
                    // Première requête
                    const params = new URLSearchParams({
                        '$top': Math.min(999, targetCount - totalFetched),
                        '$select': 'id,conversationId,receivedDateTime,subject,bodyPreview,importance,isRead,isDraft,hasAttachments,from,toRecipients,ccRecipients,categories,webLink',
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
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    // Si 401, on laisse remonter l'erreur pour gestion globale
                    if (response.status === 401) {
                        throw new Error(`HTTP 401: Unauthorized`);
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const messages = data.value || [];
                nextLink = data['@odata.nextLink'] || null;
                
                // Filtrer les doublons et ajouter le provider
                messages.forEach(message => {
                    if (message && message.id && !this.fetchedEmailIds.has(message.id)) {
                        this.fetchedEmailIds.add(message.id);
                        message.provider = 'microsoft';
                        allMessages.push(message);
                    }
                });
                
                totalFetched = allMessages.length;
                console.log(`[MailService] 📊 Total Outlook récupéré: ${totalFetched}/${targetCount}`);
                
                // Continuer si on a un nextLink et qu'on n'a pas atteint la limite
            } while (nextLink && totalFetched < targetCount);
            
            console.log(`[MailService] ✅ ${allMessages.length} messages Outlook récupérés au total`);
            return allMessages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération Outlook:', error);
            throw error;
        }
    }

    // ================================================
    // GÉNÉRATION D'EMAILS DE DÉMONSTRATION
    // ================================================
    generateDemoEmails(options = {}) {
        console.log('[MailService] 🎭 Génération d\'emails de démonstration...');
        
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
        
        // Générer le nombre d'emails demandé
        const count = Math.min(options.top || 50, 1000);
        const demoEmails = [];
        
        for (let i = 0; i < count; i++) {
            const sender = senders[i % senders.length];
            const subject = subjects[i % subjects.length];
            const category = categories[i % categories.length];
            const hoursAgo = Math.floor(Math.random() * 168); // Jusqu'à 7 jours
            
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
                bodyPreview: `Ceci est un email de démonstration ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit...`,
                importance: Math.random() > 0.8 ? 'high' : 'normal',
                isRead: Math.random() > 0.5,
                isDraft: false,
                hasAttachments: Math.random() > 0.7,
                provider: this.currentProvider,
                category: category,
                isDemoEmail: true
            });
        }
        
        // Trier par date décroissante
        demoEmails.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));
        
        console.log(`[MailService] ✅ ${demoEmails.length} emails de démonstration générés`);
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
        console.log('[MailService] 📥 Récupération de TOUS les messages...');
        
        const options = {
            all: true,
            filter: filter
        };
        
        return this.getMessages(folderId, options);
    }

    async searchMessages(query) {
        console.log(`[MailService] 🔍 Recherche: "${query}"`);
        
        if (this.currentProvider === 'google') {
            // Gmail utilise le paramètre q pour la recherche
            return this.getMessages('INBOX', { filter: query, top: 100 });
        } else if (this.currentProvider === 'microsoft') {
            // Outlook utilise $search
            const searchUrl = `https://graph.microsoft.com/v1.0/me/messages?$search="${query}"&$top=100`;
            
            try {
                const response = await fetch(searchUrl, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
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
            // Mode démo : recherche dans le sujet et le corps
            const allEmails = await this.getMessages('inbox', { top: 100 });
            const lowerQuery = query.toLowerCase();
            
            return allEmails.filter(email => 
                email.subject.toLowerCase().includes(lowerQuery) ||
                email.bodyPreview.toLowerCase().includes(lowerQuery)
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
            tokenRefreshAttempts: this.tokenRefreshAttempts
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
        this.fetchedEmailIds.clear();
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
        this.clearCache();
        
        console.log('[MailService] ✅ Service réinitialisé');
    }

    cleanup() {
        console.log('[MailService] 🧹 Nettoyage du service...');
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
    console.group('🧪 TEST MailService v8.0');
    
    try {
        console.log('1. Informations du service:');
        console.log(window.mailService.getProviderInfo());
        
        console.log('\n2. Test d\'initialisation:');
        await window.mailService.initialize();
        console.log('✅ Service initialisé');
        
        console.log('\n3. Test de récupération d\'emails:');
        const testCount = options.count || 10;
        const emails = await window.mailService.getMessages('inbox', { top: testCount });
        console.log(`✅ ${emails.length} emails récupérés`);
        
        console.log('\n4. Vérification des doublons:');
        const uniqueIds = new Set(emails.map(e => e.id));
        console.log(`📊 ${uniqueIds.size} IDs uniques sur ${emails.length} emails`);
        if (uniqueIds.size !== emails.length) {
            console.warn('⚠️ Des doublons ont été détectés!');
        }
        
        console.log('\n5. Aperçu des emails:');
        emails.slice(0, 5).forEach((email, index) => {
            console.log(`  ${index + 1}. [${email.id}] ${email.subject} - ${email.from?.emailAddress?.name}`);
        });
        
        console.log('\n6. Test de recherche (optionnel):');
        if (options.searchQuery) {
            const searchResults = await window.mailService.searchMessages(options.searchQuery);
            console.log(`🔍 ${searchResults.length} résultats pour "${options.searchQuery}"`);
        }
        
        console.log('\n✅ Test terminé avec succès');
        return { 
            success: true, 
            emails: emails.length, 
            unique: uniqueIds.size,
            provider: window.mailService.getCurrentProvider()
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
    console.log('📥 Récupération de TOUS les emails...');
    const allEmails = await window.mailService.getAllMessages();
    console.log(`✅ ${allEmails.length} emails récupérés au total`);
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

console.log('✅ MailService v8.0 loaded - Gestion améliorée des erreurs 401!');
console.log('💡 Utilisez window.testMailService() pour tester');
console.log('💡 Utilisez window.getAllEmails() pour récupérer tous les emails');
console.log('💡 Utilisez window.refreshMailToken() pour renouveler le token');
