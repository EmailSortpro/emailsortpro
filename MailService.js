// MailService.js - Service de gestion des emails v4.4
// CORRECTION: Détection correcte du provider (Google/Microsoft)

class MailService {
    constructor() {
        this.initialized = false;
        this.currentProvider = null;
        this.folders = [];
        this.labels = [];
        this.currentFolder = 'inbox';
        this.initPromise = null;
        
        console.log('[MailService] Constructor v4.4 - Détection provider corrigée');
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
        console.log('[MailService] Initializing...');
        
        try {
            // Détecter le provider actif
            const provider = await this.detectActiveProvider();
            
            if (!provider) {
                throw new Error('No authentication provider found');
            }
            
            this.currentProvider = provider;
            console.log(`[MailService] ✅ Using ${provider} provider`);
            
            // Charger les dossiers/labels selon le provider
            await this.loadFoldersOrLabels();
            
            this.initialized = true;
            console.log('[MailService] ✅ Initialization complete with provider:', this.currentProvider);
            
            // Notifier que le service est prêt
            window.dispatchEvent(new CustomEvent('mailServiceReady', {
                detail: { provider: this.currentProvider }
            }));
            
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Initialization failed:', error);
            this.initialized = false;
            this.initPromise = null;
            throw error;
        }
    }

    async detectActiveProvider() {
        console.log('[MailService] Detecting active provider...');
        
        // 1. Vérifier le dernier provider utilisé
        const lastProvider = sessionStorage.getItem('lastAuthProvider');
        console.log('[MailService] Last auth provider:', lastProvider);
        
        // 2. Vérifier Google Auth
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            const googleAuth = window.googleAuthService.isAuthenticated();
            console.log('[MailService] Google auth check:', googleAuth);
            if (googleAuth) {
                return 'google';
            }
        }
        
        // 3. Vérifier Microsoft Auth
        if (window.authService && window.authService.isAuthenticated()) {
            const msAuth = window.authService.isAuthenticated();
            console.log('[MailService] Microsoft auth check:', msAuth);
            if (msAuth) {
                return 'microsoft';
            }
        }
        
        // 4. Vérifier l'app principale
        if (window.app) {
            console.log('[MailService] App provider:', window.app.currentProvider);
            if (window.app.currentProvider) {
                return window.app.currentProvider;
            }
        }
        
        // 5. Fallback sur le dernier provider si défini
        if (lastProvider === 'google' || lastProvider === 'microsoft') {
            console.log('[MailService] Using last provider as fallback:', lastProvider);
            return lastProvider;
        }
        
        console.log('[MailService] No provider detected');
        return null;
    }

    async loadFoldersOrLabels() {
        console.log(`[MailService] Loading folders for provider: ${this.currentProvider}`);
        
        if (this.currentProvider === 'google') {
            await this.loadGmailLabels();
        } else if (this.currentProvider === 'microsoft') {
            await this.loadOutlookFolders();
        }
    }

    async loadGmailLabels() {
        console.log('[MailService] Loading Gmail labels...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }

            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
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
            
            console.log(`[MailService] ✅ Loaded ${this.labels.length} Gmail labels`);
            
        } catch (error) {
            console.error('[MailService] ❌ Error loading Gmail labels:', error);
            this.setDefaultLabels();
        }
    }

    async loadOutlookFolders() {
        console.log('[MailService] Loading Outlook folders...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }

            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.folders = data.value || [];
            
            console.log(`[MailService] ✅ Loaded ${this.folders.length} Outlook folders`);
            
        } catch (error) {
            console.error('[MailService] ❌ Error loading Outlook folders:', error);
            this.setDefaultFolders();
        }
    }

    async getAccessToken() {
        if (this.currentProvider === 'google' && window.googleAuthService) {
            return await window.googleAuthService.getAccessToken();
        } else if (this.currentProvider === 'microsoft' && window.authService) {
            return await window.authService.getAccessToken();
        }
        
        return null;
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
        console.log('[MailService] Setting default Gmail labels');
        this.labels = [
            { id: 'INBOX', name: 'INBOX', type: 'system' },
            { id: 'SENT', name: 'SENT', type: 'system' },
            { id: 'DRAFT', name: 'DRAFT', type: 'system' },
            { id: 'TRASH', name: 'TRASH', type: 'system' },
            { id: 'SPAM', name: 'SPAM', type: 'system' }
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
        console.log('[MailService] Setting default Outlook folders');
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
                id: 'junkemail',
                displayName: 'Courrier indésirable',
                parentFolderId: null,
                childFolderCount: 0,
                unreadItemCount: 0,
                totalItemCount: 0
            }
        ];
    }

    async getMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] Getting messages from ${folderId} for provider ${this.currentProvider}`);
        
        if (this.currentProvider === 'google') {
            return await this.getGmailMessages(folderId, options);
        } else if (this.currentProvider === 'microsoft') {
            return await this.getOutlookMessages(folderId, options);
        }
        
        return [];
    }

    async getGmailMessages(labelId = 'INBOX', options = {}) {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }

            const params = new URLSearchParams({
                maxResults: options.top || 50,
                labelIds: labelId,
                includeSpamTrash: false
            });

            if (options.filter) {
                params.append('q', options.filter);
            }

            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const messages = data.messages || [];
            
            // Récupérer les détails de chaque message
            const detailedMessages = await Promise.all(
                messages.slice(0, options.top || 50).map(msg => this.getGmailMessageDetails(msg.id, token))
            );
            
            return detailedMessages.filter(msg => msg !== null);
            
        } catch (error) {
            console.error('[MailService] Error getting Gmail messages:', error);
            return [];
        }
    }

    async getGmailMessageDetails(messageId, token) {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                return null;
            }

            const message = await response.json();
            
            // Extraire les métadonnées des headers
            const headers = message.payload?.headers || [];
            const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
            
            // Convertir au format unifié
            return {
                id: message.id,
                conversationId: message.threadId,
                receivedDateTime: new Date(parseInt(message.internalDate)).toISOString(),
                subject: getHeader('Subject'),
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
                provider: 'google'
            };
            
        } catch (error) {
            console.error('[MailService] Error getting Gmail message details:', error);
            return null;
        }
    }

    async getOutlookMessages(folderId = 'inbox', options = {}) {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }

            const params = new URLSearchParams({
                '$top': options.top || 50,
                '$select': 'id,conversationId,receivedDateTime,subject,bodyPreview,importance,isRead,isDraft,hasAttachments,from,toRecipients,ccRecipients,categories,webLink',
                '$orderby': 'receivedDateTime desc'
            });

            if (options.filter) {
                params.append('$filter', options.filter);
            }

            const response = await fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.value || [];
            
        } catch (error) {
            console.error('[MailService] Error getting Outlook messages:', error);
            return [];
        }
    }

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
        const match = emailStr.match(/^"?([^"<]+)"?\s*<?/);
        return match ? match[1].trim() : '';
    }

    extractAddressFromEmail(emailStr) {
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
        
        return addresses;
    }

    async moveMessage(messageId, targetFolderId) {
        if (this.currentProvider === 'google') {
            return await this.moveGmailMessage(messageId, targetFolderId);
        } else if (this.currentProvider === 'microsoft') {
            return await this.moveOutlookMessage(messageId, targetFolderId);
        }
    }

    async moveGmailMessage(messageId, targetLabelId) {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }

            // Modifier les labels du message
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    addLabelIds: [targetLabelId],
                    removeLabelIds: ['INBOX'] // Retirer de la boîte de réception si on déplace
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log(`[MailService] ✅ Gmail message moved to ${targetLabelId}`);
            return true;
            
        } catch (error) {
            console.error('[MailService] Error moving Gmail message:', error);
            return false;
        }
    }

    async moveOutlookMessage(messageId, targetFolderId) {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }

            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}/move`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    destinationId: targetFolderId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log(`[MailService] ✅ Outlook message moved to ${targetFolderId}`);
            return true;
            
        } catch (error) {
            console.error('[MailService] Error moving Outlook message:', error);
            return false;
        }
    }

    async deleteMessage(messageId) {
        if (this.currentProvider === 'google') {
            return await this.deleteGmailMessage(messageId);
        } else if (this.currentProvider === 'microsoft') {
            return await this.deleteOutlookMessage(messageId);
        }
    }

    async deleteGmailMessage(messageId) {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }

            // Déplacer vers la corbeille
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log('[MailService] ✅ Gmail message moved to trash');
            return true;
            
        } catch (error) {
            console.error('[MailService] Error deleting Gmail message:', error);
            return false;
        }
    }

    async deleteOutlookMessage(messageId) {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }

            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok && response.status !== 204) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log('[MailService] ✅ Outlook message deleted');
            return true;
            
        } catch (error) {
            console.error('[MailService] Error deleting Outlook message:', error);
            return false;
        }
    }

    getProviderInfo() {
        return {
            provider: this.currentProvider,
            isGmail: this.currentProvider === 'google',
            isOutlook: this.currentProvider === 'microsoft',
            initialized: this.initialized
        };
    }

    getDiagnosticInfo() {
        return {
            initialized: this.initialized,
            currentProvider: this.currentProvider,
            folders: this.folders.length,
            labels: this.labels.length,
            currentFolder: this.currentFolder
        };
    }
}

// Créer l'instance globale
window.mailService = new MailService();

console.log('[MailService] ✅ v4.4 loaded - Détection provider corrigée');
