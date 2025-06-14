// MailService.js - Service de récupération des emails Microsoft Graph SANS LIMITATION v4.0

class MailService {
    constructor() {
        this.isInitialized = false;
        this.cache = new Map();
        this.folders = new Map();
        this.folderMapping = {
            'inbox': 'inbox',
            'junkemail': 'junkemail', 
            'sentitems': 'sentitems',
            'drafts': 'drafts',
            'archive': 'archive'
        };
        
        // Configuration pour contourner les limitations
        this.config = {
            batchSize: 999, // Juste sous la limite de 1000
            delayBetweenBatches: 100, // Délai minimal entre les requêtes (ms)
            maxRetries: 3,
            retryDelay: 1000
        };
        
        console.log('[MailService] Constructor - Service de récupération des emails SANS LIMITATION');
    }

    async initialize() {
        console.log('[MailService] Initializing...');
        
        if (this.isInitialized) {
            console.log('[MailService] Already initialized');
            return;
        }

        try {
            // Vérifier que AuthService est disponible et initialisé
            if (!window.authService) {
                throw new Error('AuthService not available');
            }

            if (!window.authService.isAuthenticated()) {
                console.warn('[MailService] User not authenticated, cannot initialize');
                return;
            }

            // Charger les dossiers de messagerie
            console.log('[MailService] Loading mail folders...');
            await this.loadMailFolders();

            console.log('[MailService] ✅ Initialization complete');
            this.isInitialized = true;

        } catch (error) {
            console.error('[MailService] ❌ Initialization failed:', error);
            throw error;
        }
    }

    // ================================================
    // CHARGEMENT DES DOSSIERS
    // ================================================
    async loadMailFolders() {
        try {
            const accessToken = await window.authService.getAccessToken();
            if (!accessToken) {
                throw new Error('Unable to get access token');
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

            console.log(`[MailService] ✅ Loaded ${folders.length} folders`);
            
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

        } catch (error) {
            console.error('[MailService] Error loading folders:', error);
            throw error;
        }
    }

    // ================================================
    // MÉTHODE PRINCIPALE : RÉCUPÉRATION DES EMAILS SANS LIMITE
    // ================================================
    async getEmailsFromFolder(folderName, options = {}) {
        console.log(`[MailService] Getting ALL emails from folder: ${folderName}`);
        
        try {
            // Initialiser si nécessaire
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Vérifier l'authentification
            if (!window.authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            // Obtenir le token d'accès
            const accessToken = await window.authService.getAccessToken();
            if (!accessToken) {
                throw new Error('Unable to get access token');
            }

            // Obtenir l'ID réel du dossier
            const folderId = await this.resolveFolderId(folderName);
            
            // Récupérer TOUS les emails par pagination
            const allEmails = await this.getAllEmailsPaginated(folderId, accessToken, options);
            
            console.log(`[MailService] ✅ Retrieved ${allEmails.length} total emails from ${folderName}`);
            
            // Traiter et enrichir les emails
            const processedEmails = this.processEmails(allEmails, folderName);
            
            return processedEmails;

        } catch (error) {
            console.error(`[MailService] ❌ Error getting emails from ${folderName}:`, error);
            throw error;
        }
    }

    // ================================================
    // RÉCUPÉRATION PAGINÉE SANS LIMITE
    // ================================================
    async getAllEmailsPaginated(folderId, accessToken, options = {}) {
        const allEmails = [];
        let nextLink = null;
        let pageNumber = 1;
        let totalRetrieved = 0;
        
        // Limiter si l'utilisateur a spécifié un nombre max
        const userLimit = options.top || Infinity;
        
        console.log('[MailService] Starting paginated retrieval...');
        
        do {
            try {
                console.log(`[MailService] Fetching page ${pageNumber}...`);
                
                // Construire l'URL (première page ou page suivante)
                const url = nextLink || this.buildGraphUrl(folderId, {
                    ...options,
                    top: Math.min(this.config.batchSize, userLimit - totalRetrieved)
                });
                
                // Effectuer la requête avec retry automatique
                const response = await this.fetchWithRetry(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Prefer': 'odata.maxpagesize=999' // Optimiser la taille de page
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                const emails = data.value || [];
                
                // Ajouter les emails récupérés
                allEmails.push(...emails);
                totalRetrieved += emails.length;
                
                console.log(`[MailService] Page ${pageNumber}: ${emails.length} emails (Total: ${totalRetrieved})`);
                
                // Récupérer le lien vers la page suivante
                nextLink = data['@odata.nextLink'] || null;
                
                // Vérifier si on a atteint la limite utilisateur
                if (totalRetrieved >= userLimit) {
                    console.log('[MailService] User limit reached, stopping pagination');
                    break;
                }
                
                // Petit délai entre les pages pour éviter le rate limiting
                if (nextLink) {
                    await this.delay(this.config.delayBetweenBatches);
                }
                
                pageNumber++;
                
            } catch (error) {
                console.error(`[MailService] Error on page ${pageNumber}:`, error);
                
                // En cas d'erreur 429 (Too Many Requests), attendre plus longtemps
                if (error.message.includes('429')) {
                    console.log('[MailService] Rate limit hit, waiting 60 seconds...');
                    await this.delay(60000);
                    continue; // Réessayer la même page
                }
                
                throw error;
            }
            
        } while (nextLink);
        
        console.log(`[MailService] ✅ Pagination complete: ${totalRetrieved} total emails retrieved`);
        return allEmails;
    }

    // ================================================
    // REQUÊTE HTTP AVEC RETRY AUTOMATIQUE
    // ================================================
    async fetchWithRetry(url, options, retryCount = 0) {
        try {
            const response = await fetch(url, options);
            
            // Si rate limit (429), attendre et réessayer
            if (response.status === 429 && retryCount < this.config.maxRetries) {
                const retryAfter = response.headers.get('Retry-After') || 60;
                const waitTime = parseInt(retryAfter) * 1000;
                
                console.log(`[MailService] Rate limited. Waiting ${retryAfter} seconds before retry ${retryCount + 1}/${this.config.maxRetries}`);
                await this.delay(waitTime);
                
                return this.fetchWithRetry(url, options, retryCount + 1);
            }
            
            return response;
            
        } catch (error) {
            if (retryCount < this.config.maxRetries) {
                console.log(`[MailService] Request failed, retry ${retryCount + 1}/${this.config.maxRetries}`);
                await this.delay(this.config.retryDelay * (retryCount + 1));
                return this.fetchWithRetry(url, options, retryCount + 1);
            }
            throw error;
        }
    }

    // ================================================
    // UTILITAIRE DE DÉLAI
    // ================================================
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ================================================
    // RÉSOLUTION DE L'ID DU DOSSIER
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

        // Pour la boîte de réception, utiliser l'endpoint spécial
        if (folderName === 'inbox') {
            return 'inbox'; // Utiliser l'endpoint /me/mailFolders/inbox
        }

        // Fallback: rechercher par nom de dossier
        console.warn(`[MailService] Folder ${folderName} not found in cache, using as-is`);
        return folderName;
    }

    // ================================================
    // CONSTRUCTION DE L'URL MICROSOFT GRAPH AMÉLIORÉE
    // ================================================
    buildGraphUrl(folderId, options) {
        const {
            startDate,
            endDate,
            top = this.config.batchSize,
            orderBy = 'receivedDateTime desc'
        } = options;

        // Base URL adaptée selon le type d'ID
        let baseUrl;
        if (folderId === 'inbox') {
            // Utiliser l'endpoint spécial pour la boîte de réception
            baseUrl = 'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages';
        } else if (folderId.includes('AAM') || folderId.length > 20) {
            // ID complet de dossier
            baseUrl = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`;
        } else {
            // Nom de dossier
            baseUrl = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`;
        }

        // Paramètres de requête
        const params = new URLSearchParams();
        
        // Nombre d'emails à récupérer par page
        params.append('$top', Math.min(top, this.config.batchSize).toString());
        
        // Tri par date de réception décroissante
        params.append('$orderby', orderBy);
        
        // Sélection des champs nécessaires optimisée
        params.append('$select', [
            'id',
            'subject', 
            'bodyPreview',
            'body',
            'from',
            'toRecipients',
            'ccRecipients',
            'receivedDateTime',
            'sentDateTime',
            'isRead',
            'importance',
            'hasAttachments',
            'flag',
            'categories',
            'parentFolderId',
            'webLink'
        ].join(','));

        // Filtre par dates si spécifié
        if (startDate || endDate) {
            const filters = [];
            
            if (startDate) {
                const startISO = new Date(startDate).toISOString();
                filters.push(`receivedDateTime ge ${startISO}`);
            }
            
            if (endDate) {
                // S'assurer que endDate inclut toute la journée
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

    // ================================================
    // TRAITEMENT ET ENRICHISSEMENT DES EMAILS
    // ================================================
    processEmails(emails, folderName) {
        console.log(`[MailService] 🔄 Processing ${emails.length} emails from ${folderName}`);
        
        return emails.map(email => {
            try {
                // Email de base avec métadonnées ajoutées
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
                    
                    // Métadonnées ajoutées par notre service
                    sourceFolder: folderName,
                    retrievedAt: new Date().toISOString(),
                    
                    // Champs préparés pour la catégorisation
                    emailText: this.extractEmailText(email),
                    senderDomain: this.extractSenderDomain(email.from),
                    recipientCount: (email.toRecipients?.length || 0) + (email.ccRecipients?.length || 0)
                };

                return processedEmail;

            } catch (error) {
                console.warn('[MailService] ⚠️ Error processing email:', email.id, error);
                return email; // Retourner l'email original en cas d'erreur
            }
        });
    }

    // ================================================
    // EXTRACTION DU TEXTE DE L'EMAIL AMÉLIORÉE
    // ================================================
    extractEmailText(email) {
        let text = '';
        
        // Ajouter le sujet (avec poids important)
        if (email.subject) {
            text += email.subject + ' ';
        }
        
        // Ajouter les noms et adresses des expéditeurs
        if (email.from?.emailAddress) {
            if (email.from.emailAddress.name) {
                text += email.from.emailAddress.name + ' ';
            }
            if (email.from.emailAddress.address) {
                text += email.from.emailAddress.address + ' ';
            }
        }
        
        // Ajouter l'aperçu du corps
        if (email.bodyPreview) {
            text += email.bodyPreview + ' ';
        }
        
        // Ajouter le corps si disponible
        if (email.body && email.body.content) {
            // Nettoyer le HTML si c'est du HTML
            if (email.body.contentType === 'html') {
                const cleanText = email.body.content
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprimer scripts
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Supprimer styles
                    .replace(/<[^>]*>/g, ' ') // Supprimer les balises HTML
                    .replace(/&nbsp;/g, ' ') // Remplacer &nbsp;
                    .replace(/&[^;]+;/g, ' ') // Remplacer autres entités HTML
                    .replace(/\s+/g, ' ') // Normaliser les espaces
                    .trim();
                text += cleanText;
            } else {
                text += email.body.content;
            }
        }
        
        return text.trim();
    }

    // ================================================
    // EXTRACTION DU DOMAINE DE L'EXPÉDITEUR
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

    // ================================================
    // RÉCUPÉRATION D'UN EMAIL SPÉCIFIQUE
    // ================================================
    async getEmailById(emailId) {
        console.log(`[MailService] Getting email by ID: ${emailId}`);
        
        try {
            const accessToken = await window.authService.getAccessToken();
            if (!accessToken) {
                throw new Error('Unable to get access token');
            }

            const response = await this.fetchWithRetry(
                `https://graph.microsoft.com/v1.0/me/messages/${emailId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const email = await response.json();
            console.log('[MailService] ✅ Email retrieved');
            
            return email;

        } catch (error) {
            console.error('[MailService] ❌ Error getting email by ID:', error);
            throw error;
        }
    }

    // ================================================
    // RÉCUPÉRATION DES DOSSIERS PUBLIQUE
    // ================================================
    async getFolders() {
        console.log('[MailService] Getting mail folders');
        
        try {
            const accessToken = await window.authService.getAccessToken();
            if (!accessToken) {
                throw new Error('Unable to get access token');
            }

            const response = await this.fetchWithRetry(
                'https://graph.microsoft.com/v1.0/me/mailFolders',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const folders = data.value || [];

            console.log(`[MailService] ✅ Retrieved ${folders.length} folders`);
            return folders;

        } catch (error) {
            console.error('[MailService] ❌ Error getting folders:', error);
            throw error;
        }
    }

    // ================================================
    // STATISTIQUES D'EMAIL AMÉLIORÉES
    // ================================================
    async getEmailStats(folderName = 'inbox') {
        console.log(`[MailService] Getting email stats for ${folderName}`);
        
        try {
            const accessToken = await window.authService.getAccessToken();
            if (!accessToken) {
                throw new Error('Unable to get access token');
            }

            // Résoudre l'ID du dossier
            const folderId = await this.resolveFolderId(folderName);

            // Requête pour obtenir le nombre total d'emails
            const endpoint = folderId === 'inbox' ? 
                'https://graph.microsoft.com/v1.0/me/mailFolders/inbox' :
                `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}`;

            const response = await this.fetchWithRetry(
                `${endpoint}?$select=totalItemCount,unreadItemCount`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const stats = await response.json();
            console.log('[MailService] ✅ Email stats retrieved');
            
            return {
                totalEmails: stats.totalItemCount || 0,
                unreadEmails: stats.unreadItemCount || 0,
                folderName: folderName
            };

        } catch (error) {
            console.error('[MailService] ❌ Error getting email stats:', error);
            return {
                totalEmails: 0,
                unreadEmails: 0,
                folderName: folderName,
                error: error.message
            };
        }
    }

    // ================================================
    // RECHERCHE D'EMAILS AVEC PAGINATION
    // ================================================
    async searchEmails(query, options = {}) {
        console.log(`[MailService] Searching emails with query: ${query}`);
        
        try {
            const accessToken = await window.authService.getAccessToken();
            if (!accessToken) {
                throw new Error('Unable to get access token');
            }

            const {
                top = 50,
                folderName = 'inbox'
            } = options;

            const folderId = await this.resolveFolderId(folderName);
            
            const params = new URLSearchParams();
            params.append('$search', `"${query}"`);
            params.append('$top', Math.min(top, this.config.batchSize).toString());
            params.append('$orderby', 'receivedDateTime desc');
            params.append('$select', [
                'id', 'subject', 'bodyPreview', 'from', 
                'receivedDateTime', 'importance', 'hasAttachments'
            ].join(','));

            const endpoint = folderId === 'inbox' ? 
                'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages' :
                `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages`;

            const response = await this.fetchWithRetry(
                `${endpoint}?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const emails = data.value || [];

            console.log(`[MailService] ✅ Found ${emails.length} emails matching query`);
            return this.processEmails(emails, folderName);

        } catch (error) {
            console.error('[MailService] ❌ Error searching emails:', error);
            throw error;
        }
    }

    // ================================================
    // RÉCUPÉRATION EN MASSE DE TOUS LES DOSSIERS
    // ================================================
    async getAllEmailsFromAllFolders(options = {}) {
        console.log('[MailService] Getting emails from ALL folders...');
        
        try {
            // S'assurer que les dossiers sont chargés
            if (this.folders.size === 0) {
                await this.loadMailFolders();
            }

            const allEmails = [];
            const folderResults = [];

            // Parcourir tous les dossiers
            for (const [folderName, folder] of this.folders) {
                console.log(`[MailService] Processing folder: ${folder.displayName}`);
                
                try {
                    const emails = await this.getEmailsFromFolder(folder.id, options);
                    allEmails.push(...emails);
                    
                    folderResults.push({
                        folderName: folder.displayName,
                        folderId: folder.id,
                        count: emails.length,
                        success: true
                    });
                    
                } catch (error) {
                    console.error(`[MailService] Error in folder ${folder.displayName}:`, error);
                    folderResults.push({
                        folderName: folder.displayName,
                        folderId: folder.id,
                        count: 0,
                        success: false,
                        error: error.message
                    });
                }
                
                // Petit délai entre les dossiers
                await this.delay(this.config.delayBetweenBatches);
            }

            console.log(`[MailService] ✅ Retrieved ${allEmails.length} total emails from ${folderResults.length} folders`);
            
            return {
                emails: allEmails,
                folderResults: folderResults,
                totalCount: allEmails.length
            };

        } catch (error) {
            console.error('[MailService] ❌ Error getting all emails:', error);
            throw error;
        }
    }

    // ================================================
    // MÉTHODES DE DIAGNOSTIC AMÉLIORÉES
    // ================================================
    async testConnection() {
        console.log('[MailService] Testing Graph API connection...');
        
        try {
            // Test simple avec l'endpoint utilisateur
            const accessToken = await window.authService.getAccessToken();
            if (!accessToken) {
                throw new Error('No access token available');
            }

            const response = await this.fetchWithRetry(
                'https://graph.microsoft.com/v1.0/me',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const user = await response.json();
            console.log('[MailService] ✅ Connection test successful:', user.displayName);
            
            return {
                success: true,
                user: user.displayName,
                email: user.mail || user.userPrincipalName
            };

        } catch (error) {
            console.error('[MailService] ❌ Connection test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ================================================
    // NETTOYAGE ET RESET
    // ================================================
    reset() {
        console.log('[MailService] Resetting service...');
        this.isInitialized = false;
        this.cache.clear();
        this.folders.clear();
    }

    // ================================================
    // INFORMATIONS DE DIAGNOSTIC AMÉLIORÉES
    // ================================================
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            hasToken: window.authService ? !!window.authService.getAccessToken : false,
            foldersCount: this.folders.size,
            cacheSize: this.cache.size,
            config: this.config,
            folders: Array.from(this.folders.entries()).map(([name, folder]) => ({
                name,
                id: folder.id,
                displayName: folder.displayName
            }))
        };
    }
}

// Créer l'instance globale avec gestion d'erreur améliorée
try {
    window.mailService = new MailService();
    console.log('[MailService] ✅ Global instance created successfully');
} catch (error) {
    console.error('[MailService] ❌ Failed to create global instance:', error);
    
    // Instance de fallback plus robuste
    window.mailService = {
        isInitialized: false,
        getEmailsFromFolder: async () => {
            throw new Error('MailService not available - Check console for errors');
        },
        initialize: async () => {
            throw new Error('MailService failed to initialize - Check AuthService');
        },
        getDiagnosticInfo: () => ({ 
            error: 'MailService failed to create',
            authServiceAvailable: !!window.authService,
            userAuthenticated: window.authService ? window.authService.isAuthenticated() : false
        })
    };
}

console.log('✅ MailService v4.0 loaded - UNLIMITED email retrieval with automatic pagination');
