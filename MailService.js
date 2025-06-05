// MailService.js - Service de gestion des emails via Microsoft Graph API
// Version 3.0 - Service complet avec gestion d'erreurs améliorée

class MailService {
    constructor() {
        this.graphEndpoint = 'https://graph.microsoft.com/v1.0';
        this.isInitialized = false;
        this.folders = new Map();
        this.emailCache = new Map();
        this.accessToken = null;
        console.log('[MailService] Initialized v3.0');
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        console.log('[MailService] Initializing...');
        
        try {
            // Vérifier AuthService
            if (!window.authService) {
                throw new Error('AuthService not available');
            }
            
            if (!window.authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            
            // Obtenir le token d'accès
            this.accessToken = await window.authService.getAccessToken();
            if (!this.accessToken) {
                throw new Error('Failed to get access token');
            }
            
            // Charger les dossiers
            await this.loadFolders();
            
            this.isInitialized = true;
            console.log('[MailService] ✅ Initialization complete');
            
        } catch (error) {
            console.error('[MailService] ❌ Initialization failed:', error);
            throw error;
        }
    }

    // ================================================
    // GESTION DES DOSSIERS
    // ================================================
    async loadFolders() {
        console.log('[MailService] Loading mail folders...');
        
        try {
            const response = await this.graphRequest('/me/mailFolders');
            
            if (response.value) {
                this.folders.clear();
                response.value.forEach(folder => {
                    this.folders.set(folder.id, folder);
                    this.folders.set(folder.displayName.toLowerCase(), folder);
                });
                
                console.log(`[MailService] ✅ Loaded ${response.value.length} folders`);
            }
            
            return response.value || [];
            
        } catch (error) {
            console.error('[MailService] ❌ Error loading folders:', error);
            throw error;
        }
    }

    async getFolders() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        return Array.from(this.folders.values()).filter(folder => 
            typeof folder === 'object' && folder.id
        );
    }

    getFolderId(folderIdentifier) {
        // Si c'est déjà un ID (format GUID)
        if (/^[A-Z0-9]{100,}$/i.test(folderIdentifier)) {
            return folderIdentifier;
        }
        
        // Rechercher par nom
        const folder = this.folders.get(folderIdentifier.toLowerCase());
        if (folder) {
            return folder.id;
        }
        
        // Cas spéciaux
        const specialFolders = {
            'inbox': 'inbox',
            'sentitems': 'sentitems',
            'drafts': 'drafts',
            'deleteditems': 'deleteditems',
            'junkemail': 'junkemail',
            'archive': 'archive'
        };
        
        return specialFolders[folderIdentifier.toLowerCase()] || folderIdentifier;
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS
    // ================================================
    async getEmailsFromFolder(folderIdentifier, options = {}) {
        console.log('[MailService] Getting emails from folder:', folderIdentifier);
        
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            const folderId = this.getFolderId(folderIdentifier);
            const {
                top = 100,
                skip = 0,
                orderBy = 'receivedDateTime desc',
                select = 'id,subject,from,toRecipients,ccRecipients,receivedDateTime,importance,hasAttachments,bodyPreview,body,isRead,flag,categories,parentFolderId,webLink',
                filter = null,
                startDate = null,
                endDate = null
            } = options;
            
            // Construire les paramètres de requête
            let queryParams = [];
            queryParams.push(`$top=${top}`);
            if (skip > 0) queryParams.push(`$skip=${skip}`);
            queryParams.push(`$orderby=${orderBy}`);
            queryParams.push(`$select=${select}`);
            
            // Construire le filtre
            let filters = [];
            if (filter) filters.push(filter);
            
            if (startDate) {
                const startDateISO = new Date(startDate).toISOString();
                filters.push(`receivedDateTime ge ${startDateISO}`);
            }
            
            if (endDate) {
                const endDateISO = new Date(endDate).toISOString();
                filters.push(`receivedDateTime le ${endDateISO}`);
            }
            
            if (filters.length > 0) {
                queryParams.push(`$filter=${filters.join(' and ')}`);
            }
            
            const endpoint = `/me/mailFolders/${folderId}/messages?${queryParams.join('&')}`;
            console.log('[MailService] Query endpoint:', endpoint);
            
            const response = await this.graphRequest(endpoint);
            
            if (!response.value) {
                console.warn('[MailService] No emails found');
                return [];
            }
            
            console.log(`[MailService] ✅ Retrieved ${response.value.length} emails`);
            
            // Enrichir les emails avec des métadonnées
            const enrichedEmails = response.value.map(email => ({
                ...email,
                sourceFolder: folderIdentifier,
                folderDisplayName: this.getFolderDisplayName(folderId)
            }));
            
            // Mettre en cache si nécessaire
            if (options.cache !== false) {
                enrichedEmails.forEach(email => {
                    this.emailCache.set(email.id, email);
                });
            }
            
            return enrichedEmails;
            
        } catch (error) {
            console.error('[MailService] ❌ Error getting emails:', error);
            
            // Gestion d'erreur spécifique
            if (error.statusCode === 404) {
                console.error('[MailService] Folder not found:', folderIdentifier);
                throw new Error(`Dossier "${folderIdentifier}" non trouvé`);
            } else if (error.statusCode === 401) {
                console.error('[MailService] Authentication error');
                // Essayer de renouveler le token
                try {
                    this.accessToken = await window.authService.getAccessToken(true);
                    // Réessayer la requête
                    return await this.getEmailsFromFolder(folderIdentifier, options);
                } catch (retryError) {
                    throw new Error('Erreur d\'authentification. Veuillez vous reconnecter.');
                }
            }
            
            throw error;
        }
    }

    async getEmails(options = {}) {
        // Alias pour compatibilité
        return this.getEmailsFromFolder('inbox', options);
    }

    getFolderDisplayName(folderId) {
        for (const [key, folder] of this.folders.entries()) {
            if (folder.id === folderId) {
                return folder.displayName;
            }
        }
        return folderId;
    }

    // ================================================
    // OPÉRATIONS SUR LES EMAILS
    // ================================================
    async getEmailById(emailId) {
        console.log('[MailService] Getting email by ID:', emailId);
        
        try {
            // Vérifier le cache d'abord
            if (this.emailCache.has(emailId)) {
                return this.emailCache.get(emailId);
            }
            
            const endpoint = `/me/messages/${emailId}`;
            const email = await this.graphRequest(endpoint);
            
            // Mettre en cache
            this.emailCache.set(emailId, email);
            
            return email;
            
        } catch (error) {
            console.error('[MailService] Error getting email:', error);
            throw error;
        }
    }

    async markAsRead(emailId, isRead = true) {
        console.log(`[MailService] Marking email as ${isRead ? 'read' : 'unread'}:`, emailId);
        
        try {
            const endpoint = `/me/messages/${emailId}`;
            await this.graphRequest(endpoint, 'PATCH', {
                isRead: isRead
            });
            
            // Mettre à jour le cache
            if (this.emailCache.has(emailId)) {
                const email = this.emailCache.get(emailId);
                email.isRead = isRead;
            }
            
            console.log('[MailService] ✅ Email marked successfully');
            
        } catch (error) {
            console.error('[MailService] Error marking email:', error);
            throw error;
        }
    }

    async moveToFolder(emailId, destinationFolderId) {
        console.log('[MailService] Moving email to folder:', destinationFolderId);
        
        try {
            const endpoint = `/me/messages/${emailId}/move`;
            const destFolderId = this.getFolderId(destinationFolderId);
            
            const result = await this.graphRequest(endpoint, 'POST', {
                destinationId: destFolderId
            });
            
            // Supprimer du cache car il a changé de dossier
            this.emailCache.delete(emailId);
            
            console.log('[MailService] ✅ Email moved successfully');
            return result;
            
        } catch (error) {
            console.error('[MailService] Error moving email:', error);
            throw error;
        }
    }

    async deleteEmail(emailId) {
        console.log('[MailService] Deleting email:', emailId);
        
        try {
            const endpoint = `/me/messages/${emailId}`;
            await this.graphRequest(endpoint, 'DELETE');
            
            // Supprimer du cache
            this.emailCache.delete(emailId);
            
            console.log('[MailService] ✅ Email deleted successfully');
            
        } catch (error) {
            console.error('[MailService] Error deleting email:', error);
            throw error;
        }
    }

    async flagEmail(emailId, flagStatus = 'flagged') {
        console.log('[MailService] Flagging email:', emailId);
        
        try {
            const endpoint = `/me/messages/${emailId}`;
            await this.graphRequest(endpoint, 'PATCH', {
                flag: {
                    flagStatus: flagStatus
                }
            });
            
            // Mettre à jour le cache
            if (this.emailCache.has(emailId)) {
                const email = this.emailCache.get(emailId);
                email.flag = { flagStatus };
            }
            
            console.log('[MailService] ✅ Email flagged successfully');
            
        } catch (error) {
            console.error('[MailService] Error flagging email:', error);
            throw error;
        }
    }

    // ================================================
    // OPÉRATIONS EN BATCH
    // ================================================
    async batchOperation(operations) {
        console.log(`[MailService] Executing ${operations.length} batch operations`);
        
        try {
            const batchRequests = operations.map((op, index) => ({
                id: index.toString(),
                method: op.method || 'GET',
                url: op.url,
                body: op.body || undefined,
                headers: op.headers || { 'Content-Type': 'application/json' }
            }));
            
            const batchResponse = await this.graphRequest('/$batch', 'POST', {
                requests: batchRequests
            });
            
            console.log('[MailService] ✅ Batch operations completed');
            return batchResponse.responses;
            
        } catch (error) {
            console.error('[MailService] Error in batch operation:', error);
            throw error;
        }
    }

    async markMultipleAsRead(emailIds, isRead = true) {
        const operations = emailIds.map(id => ({
            method: 'PATCH',
            url: `/me/messages/${id}`,
            body: { isRead }
        }));
        
        return this.batchOperation(operations);
    }

    async deleteMultiple(emailIds) {
        const operations = emailIds.map(id => ({
            method: 'DELETE',
            url: `/me/messages/${id}`
        }));
        
        return this.batchOperation(operations);
    }

    // ================================================
    // RECHERCHE D'EMAILS
    // ================================================
    async searchEmails(searchQuery, options = {}) {
        console.log('[MailService] Searching emails:', searchQuery);
        
        try {
            const {
                top = 50,
                select = 'id,subject,from,receivedDateTime,bodyPreview',
                orderBy = 'receivedDateTime desc'
            } = options;
            
            const endpoint = `/me/messages?$search="${encodeURIComponent(searchQuery)}"&$top=${top}&$select=${select}&$orderby=${orderBy}`;
            
            const response = await this.graphRequest(endpoint);
            
            console.log(`[MailService] ✅ Found ${response.value?.length || 0} emails`);
            return response.value || [];
            
        } catch (error) {
            console.error('[MailService] Error searching emails:', error);
            throw error;
        }
    }

    // ================================================
    // CRÉATION DE DOSSIERS
    // ================================================
    async createFolder(folderName, parentFolderId = null) {
        console.log('[MailService] Creating folder:', folderName);
        
        try {
            const endpoint = parentFolderId 
                ? `/me/mailFolders/${parentFolderId}/childFolders`
                : '/me/mailFolders';
            
            const newFolder = await this.graphRequest(endpoint, 'POST', {
                displayName: folderName
            });
            
            // Ajouter au cache
            this.folders.set(newFolder.id, newFolder);
            this.folders.set(newFolder.displayName.toLowerCase(), newFolder);
            
            console.log('[MailService] ✅ Folder created successfully');
            return newFolder;
            
        } catch (error) {
            console.error('[MailService] Error creating folder:', error);
            throw error;
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    async graphRequest(endpoint, method = 'GET', body = null) {
        if (!this.accessToken) {
            this.accessToken = await window.authService.getAccessToken();
        }
        
        const url = endpoint.startsWith('http') 
            ? endpoint 
            : `${this.graphEndpoint}${endpoint}`;
        
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        };
        
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const error = new Error(errorData?.error?.message || response.statusText);
                error.statusCode = response.status;
                error.errorData = errorData;
                throw error;
            }
            
            // DELETE requests may not return content
            if (method === 'DELETE') {
                return { success: true };
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('[MailService] Graph API request failed:', error);
            
            // Si token expiré, essayer de le renouveler
            if (error.statusCode === 401) {
                console.log('[MailService] Token expired, refreshing...');
                this.accessToken = await window.authService.getAccessToken(true);
                
                // Réessayer la requête
                options.headers.Authorization = `Bearer ${this.accessToken}`;
                const retryResponse = await fetch(url, options);
                
                if (!retryResponse.ok) {
                    throw error;
                }
                
                return method === 'DELETE' ? { success: true } : await retryResponse.json();
            }
            
            throw error;
        }
    }

    // ================================================
    // STATISTIQUES
    // ================================================
    async getMailboxStats() {
        console.log('[MailService] Getting mailbox statistics...');
        
        try {
            const folders = await this.getFolders();
            const stats = {
                totalFolders: folders.length,
                folderStats: {},
                totalUnread: 0,
                totalEmails: 0
            };
            
            for (const folder of folders) {
                stats.folderStats[folder.displayName] = {
                    total: folder.totalItemCount || 0,
                    unread: folder.unreadItemCount || 0
                };
                
                stats.totalUnread += folder.unreadItemCount || 0;
                stats.totalEmails += folder.totalItemCount || 0;
            }
            
            return stats;
            
        } catch (error) {
            console.error('[MailService] Error getting stats:', error);
            throw error;
        }
    }

    // ================================================
    // GESTION DU CACHE
    // ================================================
    clearCache() {
        this.emailCache.clear();
        console.log('[MailService] Cache cleared');
    }

    getCacheSize() {
        return this.emailCache.size;
    }

    // ================================================
    // DEBUG
    // ================================================
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            hasToken: !!this.accessToken,
            foldersCount: this.folders.size,
            cacheSize: this.emailCache.size,
            folders: Array.from(this.folders.values())
                .filter(f => typeof f === 'object' && f.displayName)
                .map(f => ({
                    id: f.id,
                    name: f.displayName,
                    unread: f.unreadItemCount,
                    total: f.totalItemCount
                }))
        };
    }
}

// Créer l'instance globale
window.mailService = new MailService();

console.log('✅ MailService v3.0 loaded - Complete email management with Microsoft Graph');