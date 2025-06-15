// MailService.js - Service de récupération des emails Microsoft Graph et Google API v3.1
// CORRIGÉ avec support multi-provider

class MailService {
    constructor() {
        this.isInitialized = false;
        this.cache = new Map();
        this.folders = new Map(); // Stores folder IDs by display name (for Outlook)
        this.folderMapping = {
            'inbox': 'inbox',
            'junkemail': 'junkemail',
            'sentitems': 'sentitems',
            'drafts': 'drafts',
            'archive': 'archive',
            // Gmail specific folder mappings might be added here, or handled dynamically
        };
        this.currentMailProvider = null; // 'outlook' or 'gmail'

        console.log('[MailService] Constructor - Service de récupération des emails réels');
    }

    async initialize(provider) {
        console(`[MailService] Initializing for provider: ${provider}...`);

        if (this.isInitialized && this.currentMailProvider === provider) {
            console.log(`[MailService] Already initialized for ${provider}`);
            return;
        }

        try {
            if (!window.authService) {
                throw new Error('AuthService not available');
            }

            if (!window.authService.isAuthenticated(provider)) {
                console.warn(`[MailService] User not authenticated for ${provider}, cannot initialize.`);
                // Throw an error or return gracefully if not authenticated
                throw new Error(`User not authenticated for ${provider}`);
            }

            this.currentMailProvider = provider;
            this.cache.clear(); // Clear cache on provider change
            this.folders.clear(); // Clear folders on provider change

            if (provider === 'outlook') {
                await this.loadOutlookMailFolders();
            } else if (provider === 'gmail') {
                await this.loadGmailMailLabels(); // Gmail uses "labels" instead of "folders"
            } else {
                throw new Error(`Unsupported mail provider: ${provider}`);
            }

            console.log(`[MailService] ✅ Initialization complete for ${provider}`);
            this.isInitialized = true;

        } catch (error) {
            console.error(`[MailService] ❌ Initialization failed for ${provider}:`, error);
            this.isInitialized = false;
            this.currentMailProvider = null; // Reset provider on failure
            throw error;
        }
    }

    reset() {
        console.log('[MailService] Resetting MailService state.');
        this.isInitialized = false;
        this.cache.clear();
        this.folders.clear();
        this.currentMailProvider = null;
    }

    async loadOutlookMailFolders() {
        console.log('[MailService] Loading Outlook mail folders...');
        const accessToken = await window.authService.getAccessToken('outlook');
        if (!accessToken) {
            throw new Error('No Outlook access token available.');
        }

        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders?$top=50', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch Outlook mail folders: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            data.value.forEach(folder => {
                // Store by lowercase displayName for easier lookup and consistency
                this.folders.set(folder.displayName.toLowerCase(), {
                    id: folder.id,
                    displayName: folder.displayName,
                    wellKnownName: folder.wellKnownName // Use this for standard folders like 'inbox', 'sentitems'
                });
            });
            console.log('[MailService] Outlook mail folders loaded:', Array.from(this.folders.keys()));
        } catch (error) {
            console.error('[MailService] Error loading Outlook mail folders:', error);
            throw error;
        }
    }

    async loadGmailMailLabels() {
        console.log('[MailService] Loading Gmail mail labels...');
        const accessToken = await window.authService.getAccessToken('gmail');
        if (!accessToken) {
            throw new Error('No Gmail access token available.');
        }

        try {
            await gapi.client.gmail.users.labels.list({
                'userId': 'me'
            }); // Ensure Gmail API client is loaded and ready

            const response = await gapi.client.gmail.users.labels.list({
                'userId': 'me'
            });

            if (response.status !== 200) {
                throw new Error(`Failed to fetch Gmail labels: ${response.status} - ${response.body}`);
            }

            response.result.labels.forEach(label => {
                // Gmail uses 'labels', map them to a similar structure as folders
                // Use the name directly, as Gmail labels can be custom
                this.folders.set(label.name.toLowerCase(), {
                    id: label.id,
                    displayName: label.name,
                    type: label.type // 'system' or 'user'
                });
            });
            console.log('[MailService] Gmail labels loaded:', Array.from(this.folders.keys()));
        } catch (error) {
            console.error('[MailService] Error loading Gmail labels:', error);
            throw error;
        }
    }

    async getEmailsFromFolder(folderName, page = 1, pageSize = 10) {
        if (!this.isInitialized || !this.currentMailProvider) {
            console.warn('[MailService] Service not initialized or provider not set.');
            return { emails: [], totalCount: 0 };
        }

        const offset = (page - 1) * pageSize;
        const lowerCaseFolderName = folderName.toLowerCase();

        if (this.currentMailProvider === 'outlook') {
            const folder = this.folders.get(lowerCaseFolderName);
            if (!folder) {
                console.warn(`[MailService] Outlook folder "${folderName}" not found.`);
                return { emails: [], totalCount: 0 };
            }
            return this.getOutlookEmails(folder.id, offset, pageSize);
        } else if (this.currentMailProvider === 'gmail') {
            const label = this.folders.get(lowerCaseFolderName);
            if (!label) {
                console.warn(`[MailService] Gmail label "${folderName}" not found.`);
                return { emails: [], totalCount: 0 };
            }
            return this.getGmailEmails(label.id, offset, pageSize);
        } else {
            console.error('[MailService] No mail provider selected or recognized.');
            return { emails: [], totalCount: 0 };
        }
    }

    async getOutlookEmails(folderId, skip = 0, top = 10) {
        console.log(`[MailService] Fetching Outlook emails from folder ID: ${folderId}, Skip: ${skip}, Top: ${top}`);
        const accessToken = await window.authService.getAccessToken('outlook');
        if (!accessToken) {
            throw new Error('No Outlook access token available.');
        }

        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages?$top=${top}&$skip=${skip}&$select=id,subject,from,toRecipients,receivedDateTime,isRead,bodyPreview,hasAttachments`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch Outlook emails: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const emails = data.value.map(email => ({
                id: email.id,
                subject: email.subject,
                from: email.from?.emailAddress?.address || 'Unknown',
                fromName: email.from?.emailAddress?.name || '',
                to: email.toRecipients.map(r => r.emailAddress.address),
                receivedDateTime: email.receivedDateTime,
                isRead: email.isRead,
                bodyPreview: email.bodyPreview,
                hasAttachments: email.hasAttachments,
                // Add more fields as needed
            }));
            // Outlook doesn't directly provide total count in simple queries,
            // so we might need to adjust this or make another call for accurate total.
            // For now, let's assume `data['@odata.count']` if available, otherwise estimate.
            const totalCount = data['@odata.count'] || (emails.length === top ? skip + top + 1 : skip + emails.length);

            return { emails, totalCount };

        } catch (error) {
            console.error('[MailService] Error fetching Outlook emails:', error);
            throw error;
        }
    }

    async getGmailEmails(labelId, offset = 0, limit = 10) {
        console.log(`[MailService] Fetching Gmail emails from label ID: ${labelId}, Offset: ${offset}, Limit: ${limit}`);
        const accessToken = await window.authService.getAccessToken('gmail');
        if (!accessToken) {
            throw new Error('No Gmail access token available.');
        }

        try {
            // Ensure GAPI is loaded and authenticated
            if (!gapi.client || !gapi.client.gmail) {
                console.warn('GAPI Gmail client not ready. Attempting to load...');
                await window.authService.initializeGapi(); // Re-initialize GAPI if not ready
                if (!gapi.client.gmail) {
                    throw new Error('Gmail API client could not be loaded.');
                }
            }

            const response = await gapi.client.gmail.users.messages.list({
                'userId': 'me',
                'labelIds': [labelId],
                'maxResults': limit,
                // Gmail uses pageToken for pagination, not offset directly.
                // This means 'offset' as a concept needs to be adapted or
                // we fetch all and paginate client-side, which is inefficient.
                // For simplicity here, we'll assume the first 'limit' messages.
                // A full implementation would involve managing `nextPageToken`.
            });

            if (response.status !== 200) {
                throw new Error(`Failed to fetch Gmail messages: ${response.status} - ${response.body}`);
            }

            const messages = response.result.messages || [];
            const totalCount = response.result.resultSizeEstimate || messages.length; // Gmail provides resultSizeEstimate

            const emailPromises = messages.map(message =>
                gapi.client.gmail.users.messages.get({
                    'userId': 'me',
                    'id': message.id,
                    'format': 'metadata', // 'full', 'raw', 'minimal'
                    'metadataHeaders': ['From', 'Subject', 'Date', 'To', 'Cc', 'Bcc']
                })
            );

            const emailDetails = await Promise.all(emailPromises);

            const emails = emailDetails.map(detail => {
                const headers = detail.result.payload.headers;
                const getHeader = (name) => headers.find(h => h.name === name)?.value;

                return {
                    id: detail.result.id,
                    subject: getHeader('Subject') || '(No Subject)',
                    from: getHeader('From') || 'Unknown',
                    fromName: getHeader('From')?.split('<')[0]?.trim() || '',
                    to: (getHeader('To')?.split(',') || []).map(email => email.trim()),
                    receivedDateTime: getHeader('Date') ? new Date(getHeader('Date')).toISOString() : null,
                    isRead: !detail.result.labelIds.includes('UNREAD'), // Assuming 'UNREAD' label indicates unread
                    bodyPreview: detail.result.snippet || '', // Gmail provides snippet
                    hasAttachments: detail.result.payload.mimeType.includes('multipart') && detail.result.payload.parts?.some(p => p.filename && p.filename.length > 0)
                    // Add more fields as needed, may require 'full' format for body content
                };
            });

            return { emails, totalCount };

        } catch (error) {
            console.error('[MailService] Error fetching Gmail emails:', error);
            throw error;
        }
    }

    // Helper to get a specific folder/label ID
    getFolderId(name) {
        return this.folders.get(name.toLowerCase())?.id;
    }

    getDiagnosticInfo() {
        return {
            isInitialized: this.isInitialized,
            currentProvider: this.currentMailProvider,
            authServiceAvailable: !!window.authService,
            userAuthenticatedOutlook: window.authService ? window.authService.isAuthenticated('outlook') : false,
            userAuthenticatedGmail: window.authService ? window.authService.isAuthenticated('gmail') : false,
            foldersCount: this.folders.size,
            cacheSize: this.cache.size,
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
        initialize: async (provider) => {
            throw new Error(`MailService failed to initialize for ${provider} - Check AuthService`);
        },
        getDiagnosticInfo: () => ({
            error: 'MailService failed to create',
            authServiceAvailable: !!window.authService,
            userAuthenticatedOutlook: window.authService ? window.authService.isAuthenticated('outlook') : false,
            userAuthenticatedGmail: window.authService ? window.authService.isAuthenticated('gmail') : false
        }),
        reset: () => { console.warn('MailService not available, cannot reset.'); }
    };
}

console.log('✅ MailService v3.1 loaded - Enhanced with better folder resolution and error handling and Gmail support');
