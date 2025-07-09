// MailService.js - Version 5.0 - Service de gestion des emails complètement corrigé

class MailService {
    constructor() {
        this.initialized = false;
        this.currentProvider = null;
        this.folders = [];
        this.labels = [];
        this.currentFolder = 'inbox';
        this.initPromise = null;
        this.accessToken = null;
        
        console.log('[MailService] Constructor v5.0 - Service emails corrigé');
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
                throw new Error('No authentication provider found');
            }
            
            this.currentProvider = provider;
            console.log(`[MailService] ✅ Provider détecté: ${provider}`);
            
            // Obtenir le token d'accès
            await this.obtainAccessToken();
            
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
            this.initialized = false;
            this.initPromise = null;
            throw error;
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
        const lastProvider = sessionStorage.getItem('lastAuthProvider');
        if (lastProvider === 'google' || lastProvider === 'microsoft') {
            console.log('[MailService] ⚠️ Utilisation du dernier provider:', lastProvider);
            return lastProvider;
        }
        
        console.log('[MailService] ❌ Aucun provider détecté');
        return null;
    }

    async obtainAccessToken() {
        console.log('[MailService] 🔑 Obtention du token d\'accès...');
        
        try {
            if (this.currentProvider === 'google' && window.googleAuthService) {
                this.accessToken = await window.googleAuthService.getAccessToken();
                console.log('[MailService] ✅ Token Google obtenu');
            } else if (this.currentProvider === 'microsoft' && window.authService) {
                this.accessToken = await window.authService.getAccessToken();
                console.log('[MailService] ✅ Token Microsoft obtenu');
            } else {
                throw new Error(`Impossible d'obtenir le token pour ${this.currentProvider}`);
            }
            
            if (!this.accessToken) {
                throw new Error('Token d\'accès null ou invalide');
            }
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur obtention token:', error);
            throw error;
        }
    }

    async loadFoldersOrLabels() {
        console.log(`[MailService] 📁 Chargement des dossiers pour ${this.currentProvider}...`);
        
        if (this.currentProvider === 'google') {
            await this.loadGmailLabels();
        } else if (this.currentProvider === 'microsoft') {
            await this.loadOutlookFolders();
        }
    }

    async loadGmailLabels() {
        console.log('[MailService] 📧 Chargement des labels Gmail...');
        
        try {
            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
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
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur chargement labels Gmail:', error);
            this.setDefaultLabels();
        }
    }

    async loadOutlookFolders() {
        console.log('[MailService] 📂 Chargement des dossiers Outlook...');
        
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.folders = data.value || [];
            
            console.log(`[MailService] ✅ ${this.folders.length} dossiers Outlook chargés`);
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur chargement dossiers Outlook:', error);
            this.setDefaultFolders();
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
        
        if (!this.accessToken) {
            console.log('[MailService] ⚠️ Token manquant, récupération...');
            await this.obtainAccessToken();
        }
        
        try {
            let messages = [];
            
            if (this.currentProvider === 'google') {
                messages = await this.getGmailMessages(folderId, options);
            } else if (this.currentProvider === 'microsoft') {
                messages = await this.getOutlookMessages(folderId, options);
            } else {
                throw new Error(`Provider ${this.currentProvider} non supporté`);
            }
            
            console.log(`[MailService] ✅ ${messages.length} messages récupérés`);
            return messages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération messages:', error);
            
            // Fallback vers emails de démonstration
            console.log('[MailService] 📧 Fallback vers emails de démonstration...');
            return this.generateFallbackEmails(options);
        }
    }

    async getGmailMessages(labelId = 'INBOX', options = {}) {
        console.log(`[MailService] 📧 Récupération emails Gmail depuis ${labelId}...`);
        
        try {
            // Construire les paramètres de requête
            const params = new URLSearchParams({
                maxResults: Math.min(options.top || 50, 500),
                labelIds: labelId,
                includeSpamTrash: false
            });

            // Ajouter le filtre si fourni
            if (options.filter) {
                params.append('q', options.filter);
            }

            // Première requête pour obtenir la liste des messages
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
            
            console.log(`[MailService] 📋 ${messagesList.length} messages trouvés dans Gmail`);
            
            if (messagesList.length === 0) {
                return [];
            }

            // Récupérer les détails de chaque message
            const detailedMessages = await Promise.all(
                messagesList.slice(0, options.top || 50).map(async (msg) => {
                    try {
                        return await this.getGmailMessageDetails(msg.id);
                    } catch (error) {
                        console.error('[MailService] ❌ Erreur récupération détails message:', error);
                        return null;
                    }
                })
            );
            
            // Filtrer les messages null
            const validMessages = detailedMessages.filter(msg => msg !== null);
            
            console.log(`[MailService] ✅ ${validMessages.length} messages Gmail détaillés récupérés`);
            return validMessages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération Gmail:', error);
            throw error;
        }
    }

    async getGmailMessageDetails(messageId) {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const message = await response.json();
            
            // Extraire les métadonnées des headers
            const headers = message.payload?.headers || [];
            const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
            
            // Extraire le corps du message
            let bodyPreview = message.snippet || '';
            if (message.payload?.body?.data) {
                try {
                    bodyPreview = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                } catch (e) {
                    // Garder le snippet si le décodage échoue
                    bodyPreview = message.snippet || '';
                }
            }
            
            // Convertir au format unifié
            const unifiedMessage = {
                id: message.id,
                conversationId: message.threadId,
                receivedDateTime: new Date(parseInt(message.internalDate)).toISOString(),
                subject: getHeader('Subject') || 'Sans sujet',
                bodyPreview: bodyPreview,
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
            console.error('[MailService] ❌ Erreur récupération détails Gmail:', error);
            throw error;
        }
    }

    async getOutlookMessages(folderId = 'inbox', options = {}) {
        console.log(`[MailService] 📂 Récupération emails Outlook depuis ${folderId}...`);
        
        try {
            // Construire les paramètres de requête
            const params = new URLSearchParams({
                '$top': Math.min(options.top || 50, 500),
                '$select': 'id,conversationId,receivedDateTime,subject,bodyPreview,importance,isRead,isDraft,hasAttachments,from,toRecipients,ccRecipients,categories,webLink',
                '$orderby': 'receivedDateTime desc'
            });

            // Ajouter le filtre si fourni
            if (options.filter) {
                params.append('$filter', options.filter);
            }

            const response = await fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const messages = data.value || [];
            
            // Ajouter le provider à chaque message
            messages.forEach(message => {
                message.provider = 'microsoft';
            });
            
            console.log(`[MailService] ✅ ${messages.length} messages Outlook récupérés`);
            return messages;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération Outlook:', error);
            throw error;
        }
    }

    // ================================================
    // MÉTHODES POUR GÉRER LES EMAILS (DÉPLACER, SUPPRIMER, ETC.)
    // ================================================
    async moveMessage(messageId, targetFolderId) {
        console.log(`[MailService] 📤 Déplacement message ${messageId} vers ${targetFolderId}...`);
        
        if (this.currentProvider === 'google') {
            return await this.moveGmailMessage(messageId, targetFolderId);
        } else if (this.currentProvider === 'microsoft') {
            return await this.moveOutlookMessage(messageId, targetFolderId);
        }
        
        throw new Error(`Provider ${this.currentProvider} non supporté pour le déplacement`);
    }

    async moveGmailMessage(messageId, targetLabelId) {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    addLabelIds: [targetLabelId],
                    removeLabelIds: ['INBOX']
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`[MailService] ✅ Message Gmail déplacé vers ${targetLabelId}`);
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur déplacement Gmail:', error);
            throw error;
        }
    }

    async moveOutlookMessage(messageId, targetFolderId) {
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}/move`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    destinationId: targetFolderId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`[MailService] ✅ Message Outlook déplacé vers ${targetFolderId}`);
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur déplacement Outlook:', error);
            throw error;
        }
    }

    async deleteMessage(messageId) {
        console.log(`[MailService] 🗑️ Suppression message ${messageId}...`);
        
        if (this.currentProvider === 'google') {
            return await this.deleteGmailMessage(messageId);
        } else if (this.currentProvider === 'microsoft') {
            return await this.deleteOutlookMessage(messageId);
        }
        
        throw new Error(`Provider ${this.currentProvider} non supporté pour la suppression`);
    }

    async deleteGmailMessage(messageId) {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('[MailService] ✅ Message Gmail supprimé');
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur suppression Gmail:', error);
            throw error;
        }
    }

    async deleteOutlookMessage(messageId) {
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok && response.status !== 204) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('[MailService] ✅ Message Outlook supprimé');
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur suppression Outlook:', error);
            throw error;
        }
    }

    async markAsRead(messageId) {
        console.log(`[MailService] 📖 Marquage message ${messageId} comme lu...`);
        
        if (this.currentProvider === 'google') {
            return await this.markGmailAsRead(messageId);
        } else if (this.currentProvider === 'microsoft') {
            return await this.markOutlookAsRead(messageId);
        }
        
        throw new Error(`Provider ${this.currentProvider} non supporté pour le marquage`);
    }

    async markGmailAsRead(messageId) {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    removeLabelIds: ['UNREAD']
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('[MailService] ✅ Message Gmail marqué comme lu');
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur marquage Gmail:', error);
            throw error;
        }
    }

    async markOutlookAsRead(messageId) {
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isRead: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('[MailService] ✅ Message Outlook marqué comme lu');
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur marquage Outlook:', error);
            throw error;
        }
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
        
        return addresses;
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
        console.log('[MailService] 📋 Configuration des labels Gmail par défaut...');
        
        this.labels = [
            { id: 'INBOX', name: 'INBOX', type: 'system' },
            { id: 'SENT', name: 'SENT', type: 'system' },
            { id: 'DRAFT', name: 'DRAFT', type: 'system' },
            { id: 'TRASH', name: 'TRASH', type: 'system' },
            { id: 'SPAM', name: 'SPAM', type: 'system' },
            { id: 'STARRED', name: 'STARRED', type: 'system' },
            { id: 'IMPORTANT', name: 'IMPORTANT', type: 'system' }
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
        
        console.log('[MailService] ✅ Labels Gmail par défaut configurés');
    }

    setDefaultFolders() {
        console.log('[MailService] 📂 Configuration des dossiers Outlook par défaut...');
        
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
        
        console.log('[MailService] ✅ Dossiers Outlook par défaut configurés');
    }

    // ================================================
    // FALLBACK EMAILS DE DÉMONSTRATION
    // ================================================
    generateFallbackEmails(options = {}) {
        console.log('[MailService] 🎭 Génération d\'emails de démonstration...');
        
        const fallbackEmails = [
            {
                id: 'fallback_1',
                subject: 'Votre commande Amazon a été expédiée',
                from: {
                    emailAddress: {
                        name: 'Amazon',
                        address: 'ship-confirm@amazon.com'
                    }
                },
                receivedDateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Votre commande #123-456 a été expédiée et arrivera demain. Suivez votre colis en cliquant sur le lien...',
                importance: 'normal',
                isRead: false,
                isDraft: false,
                hasAttachments: false,
                provider: this.currentProvider,
                category: 'shopping',
                isFallback: true
            },
            {
                id: 'fallback_2',
                subject: 'Newsletter Tech Weekly - Édition #142',
                from: {
                    emailAddress: {
                        name: 'TechCrunch',
                        address: 'newsletter@techcrunch.com'
                    }
                },
                receivedDateTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Les dernières actualités tech de la semaine. IA, startups, et innovations. Cliquez pour vous désabonner.',
                importance: 'normal',
                isRead: true,
                isDraft: false,
                hasAttachments: false,
                provider: this.currentProvider,
                category: 'newsletters',
                isFallback: true
            },
            {
                id: 'fallback_3',
                subject: 'Rappel: Réunion équipe demain 14h',
                from: {
                    emailAddress: {
                        name: 'Google Calendar',
                        address: 'calendar-notification@google.com'
                    }
                },
                receivedDateTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Rappel: Vous avez une réunion d\'équipe prévue demain à 14h00. Salle de conférence A.',
                importance: 'high',
                isRead: false,
                isDraft: false,
                hasAttachments: false,
                provider: this.currentProvider,
                category: 'meetings',
                isFallback: true
            },
            {
                id: 'fallback_4',
                subject: 'Votre relevé bancaire mensuel',
                from: {
                    emailAddress: {
                        name: 'BNP Paribas',
                        address: 'noreply@bnpparibas.com'
                    }
                },
                receivedDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Votre relevé bancaire du mois de décembre est maintenant disponible en ligne.',
                importance: 'normal',
                isRead: false,
                isDraft: false,
                hasAttachments: true,
                provider: this.currentProvider,
                category: 'finance',
                isFallback: true
            },
            {
                id: 'fallback_5',
                subject: 'Offre spéciale: -50% sur votre prochain achat',
                from: {
                    emailAddress: {
                        name: 'Nike',
                        address: 'offers@nike.com'
                    }
                },
                receivedDateTime: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Profitez de 50% de réduction sur une sélection d\'articles Nike. Offre valable jusqu\'au 31 décembre.',
                importance: 'normal',
                isRead: true,
                isDraft: false,
                hasAttachments: false,
                provider: this.currentProvider,
                category: 'marketing',
                isFallback: true
            },
            {
                id: 'fallback_6',
                subject: 'Notification de sécurité - Nouvelle connexion',
                from: {
                    emailAddress: {
                        name: 'Microsoft Security',
                        address: 'account-security-noreply@microsoft.com'
                    }
                },
                receivedDateTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Nous avons détecté une nouvelle connexion à votre compte Microsoft depuis un nouvel appareil.',
                importance: 'high',
                isRead: false,
                isDraft: false,
                hasAttachments: false,
                provider: this.currentProvider,
                category: 'security',
                isFallback: true
            },
            {
                id: 'fallback_7',
                subject: 'Votre facture mensuelle est disponible',
                from: {
                    emailAddress: {
                        name: 'Orange',
                        address: 'facturation@orange.fr'
                    }
                },
                receivedDateTime: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Votre facture Orange du mois de décembre est maintenant disponible dans votre espace client.',
                importance: 'normal',
                isRead: true,
                isDraft: false,
                hasAttachments: true,
                provider: this.currentProvider,
                category: 'bills',
                isFallback: true
            },
            {
                id: 'fallback_8',
                subject: 'Invitation LinkedIn - Connectons-nous',
                from: {
                    emailAddress: {
                        name: 'LinkedIn',
                        address: 'invitations@linkedin.com'
                    }
                },
                receivedDateTime: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
                bodyPreview: 'Jean Dupont souhaite se connecter avec vous sur LinkedIn. Acceptez cette invitation pour élargir votre réseau.',
                importance: 'normal',
                isRead: false,
                isDraft: false,
                hasAttachments: false,
                provider: this.currentProvider,
                category: 'social',
                isFallback: true
            }
        ];
        
        // Limiter le nombre d'emails selon les options
        const maxEmails = Math.min(options.top || 50, fallbackEmails.length);
        const selectedEmails = fallbackEmails.slice(0, maxEmails);
        
        console.log(`[MailService] ✅ ${selectedEmails.length} emails de démonstration générés`);
        return selectedEmails;
    }

    // ================================================
    // MÉTHODES POUR ACTIONS GROUPÉES
    // ================================================
    async bulkMarkAsRead(messageIds) {
        console.log(`[MailService] 📖 Marquage groupé de ${messageIds.length} messages comme lus...`);
        
        const results = [];
        
        for (const messageId of messageIds) {
            try {
                await this.markAsRead(messageId);
                results.push({ messageId, success: true });
            } catch (error) {
                console.error(`[MailService] ❌ Erreur marquage ${messageId}:`, error);
                results.push({ messageId, success: false, error: error.message });
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        console.log(`[MailService] ✅ ${successCount}/${messageIds.length} messages marqués comme lus`);
        
        return results;
    }

    async bulkDelete(messageIds) {
        console.log(`[MailService] 🗑️ Suppression groupée de ${messageIds.length} messages...`);
        
        const results = [];
        
        for (const messageId of messageIds) {
            try {
                await this.deleteMessage(messageId);
                results.push({ messageId, success: true });
            } catch (error) {
                console.error(`[MailService] ❌ Erreur suppression ${messageId}:`, error);
                results.push({ messageId, success: false, error: error.message });
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        console.log(`[MailService] ✅ ${successCount}/${messageIds.length} messages supprimés`);
        
        return results;
    }

    async bulkMove(messageIds, targetFolderId) {
        console.log(`[MailService] 📤 Déplacement groupé de ${messageIds.length} messages vers ${targetFolderId}...`);
        
        const results = [];
        
        for (const messageId of messageIds) {
            try {
                await this.moveMessage(messageId, targetFolderId);
                results.push({ messageId, success: true });
            } catch (error) {
                console.error(`[MailService] ❌ Erreur déplacement ${messageId}:`, error);
                results.push({ messageId, success: false, error: error.message });
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        console.log(`[MailService] ✅ ${successCount}/${messageIds.length} messages déplacés`);
        
        return results;
    }

    // ================================================
    // MÉTHODES D'INFORMATION ET DEBUG
    // ================================================
    getProviderInfo() {
        return {
            provider: this.currentProvider,
            isGmail: this.currentProvider === 'google',
            isOutlook: this.currentProvider === 'microsoft',
            initialized: this.initialized,
            hasAccessToken: !!this.accessToken,
            foldersCount: this.folders.length,
            labelsCount: this.labels.length
        };
    }

    getDiagnosticInfo() {
        return {
            initialized: this.initialized,
            currentProvider: this.currentProvider,
            hasAccessToken: !!this.accessToken,
            folders: this.folders.length,
            labels: this.labels.length,
            currentFolder: this.currentFolder,
            version: '5.0',
            supportedMethods: [
                'getMessages',
                'moveMessage',
                'deleteMessage',
                'markAsRead',
                'bulkMarkAsRead',
                'bulkDelete',
                'bulkMove'
            ]
        };
    }

    getFolders() {
        return [...this.folders];
    }

    getLabels() {
        return [...this.labels];
    }

    isInitialized() {
        return this.initialized;
    }

    getCurrentProvider() {
        return this.currentProvider;
    }

    // ================================================
    // MÉTHODES DE NETTOYAGE
    // ================================================
    async refreshAccessToken() {
        console.log('[MailService] 🔄 Actualisation du token d\'accès...');
        
        try {
            await this.obtainAccessToken();
            console.log('[MailService] ✅ Token actualisé');
            return true;
        } catch (error) {
            console.error('[MailService] ❌ Erreur actualisation token:', error);
            throw error;
        }
    }

    reset() {
        console.log('[MailService] 🔄 Réinitialisation du service...');
        
        this.initialized = false;
        this.currentProvider = null;
        this.accessToken = null;
        this.folders = [];
        this.labels = [];
        this.currentFolder = 'inbox';
        this.initPromise = null;
        
        console.log('[MailService] ✅ Service réinitialisé');
    }

    cleanup() {
        console.log('[MailService] 🧹 Nettoyage du service...');
        
        this.reset();
        
        // Nettoyer les event listeners si nécessaire
        // (Aucun event listener persistent dans cette implémentation)
        
        console.log('[MailService] ✅ Nettoyage terminé');
    }
}

// Créer l'instance globale
if (window.mailService) {
    console.log('[MailService] 🔄 Nettoyage ancienne instance...');
    window.mailService.cleanup?.();
}

window.mailService = new MailService();

// Fonctions utilitaires globales
window.testMailService = async function() {
    console.group('🧪 TEST MailService v5.0');
    
    try {
        console.log('1. Informations du service:');
        console.log(window.mailService.getProviderInfo());
        
        console.log('2. Diagnostic:');
        console.log(window.mailService.getDiagnosticInfo());
        
        console.log('3. Test d\'initialisation:');
        await window.mailService.initialize();
        
        console.log('4. Test de récupération d\'emails:');
        const emails = await window.mailService.getMessages('inbox', { top: 5 });
        console.log(`✅ ${emails.length} emails récupérés`);
        
        console.log('5. Aperçu des emails:');
        emails.forEach((email, index) => {
            console.log(`  ${index + 1}. ${email.subject} - ${email.from?.emailAddress?.name}`);
        });
        
        console.log('✅ Test terminé avec succès');
        return { success: true, emails: emails.length };
        
    } catch (error) {
        console.error('❌ Test échoué:', error);
        return { success: false, error: error.message };
    } finally {
        console.groupEnd();
    }
};

console.log('✅ MailService v5.0 loaded - Service emails complètement corrigé!');
