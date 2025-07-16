// authService.js - Microsoft Authentication Service v5.0
// Service complet avec récupération des emails Outlook via Microsoft Graph

class MicrosoftAuthService {
    constructor() {
        this.msalInstance = null;
        this.account = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'microsoft';
        this.configWaitAttempts = 0;
        this.maxConfigWaitAttempts = 50;
        
        console.log('[MicrosoftAuthService] Constructor called v5.0 - Service complet avec emails');
        
        this.verifyDomain();
        this.waitForConfig();
    }

    verifyDomain() {
        const currentDomain = window.location.hostname;
        const isCorrectDomain = currentDomain === this.expectedDomain || currentDomain.includes('localhost');
        
        console.log('[MicrosoftAuthService] Domain verification:', {
            current: currentDomain,
            expected: this.expectedDomain,
            isCorrect: isCorrectDomain
        });
    }

    waitForConfig() {
        console.log('[MicrosoftAuthService] Waiting for configuration...');
        
        if (!window.AppConfig) {
            this.configWaitAttempts++;
            
            if (this.configWaitAttempts >= this.maxConfigWaitAttempts) {
                console.error('[MicrosoftAuthService] Configuration timeout');
                return;
            }
            
            setTimeout(() => this.waitForConfig(), 100);
            return;
        }
        
        const validation = window.AppConfig.validate();
        if (!validation.valid) {
            console.error('[MicrosoftAuthService] Configuration invalid:', validation.issues);
        } else {
            console.log('[MicrosoftAuthService] ✅ Configuration valid');
        }
    }

    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        if (this.isInitialized) {
            return Promise.resolve();
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    async _doInitialize() {
        try {
            console.log('[MicrosoftAuthService] Starting initialization...');
            
            if (typeof msal === 'undefined') {
                throw new Error('MSAL library not loaded');
            }

            if (!window.AppConfig) {
                throw new Error('AppConfig not loaded');
            }

            const validation = window.AppConfig.forceValidate();
            if (!validation.valid) {
                console.warn('[MicrosoftAuthService] Configuration issues:', validation.issues);
            }

            const msalConfig = {
                auth: {
                    clientId: window.AppConfig.msal.clientId,
                    authority: window.AppConfig.msal.authority,
                    redirectUri: window.AppConfig.msal.redirectUri,
                    postLogoutRedirectUri: window.AppConfig.msal.postLogoutRedirectUri
                },
                cache: window.AppConfig.msal.cache,
                system: window.AppConfig.msal.system
            };
            
            this.msalInstance = new msal.PublicClientApplication(msalConfig);
            await this.msalInstance.initialize();
            
            console.log('[MicrosoftAuthService] ✅ MSAL initialized');
            
            const response = await this.msalInstance.handleRedirectPromise();
            
            if (response) {
                this.account = response.account;
                this.msalInstance.setActiveAccount(this.account);
                sessionStorage.setItem('lastAuthProvider', 'microsoft');
                console.log('[MicrosoftAuthService] ✅ Redirect handled, user authenticated');
            } else {
                const accounts = this.msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.msalInstance.setActiveAccount(this.account);
                    console.log('[MicrosoftAuthService] ✅ Existing account found');
                }
            }

            this.isInitialized = true;
            return true;

        } catch (error) {
            console.error('[MicrosoftAuthService] Initialization failed:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    isAuthenticated() {
        return this.account !== null && this.isInitialized;
    }

    getAccount() {
        return this.account;
    }

    async login() {
        console.log('[MicrosoftAuthService] Login attempt...');
        
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const loginRequest = {
                scopes: window.AppConfig.scopes.login,
                prompt: 'select_account'
            };

            // Marquer Microsoft comme provider actif AVANT la redirection
            sessionStorage.setItem('lastAuthProvider', 'microsoft');
            
            await this.msalInstance.loginRedirect(loginRequest);
            
        } catch (error) {
            console.error('[MicrosoftAuthService] Login error:', error);
            throw error;
        }
    }

    async logout() {
        if (!this.isInitialized) {
            this.forceCleanup();
            return;
        }

        try {
            const logoutRequest = {
                account: this.account,
                postLogoutRedirectUri: window.AppConfig.msal.postLogoutRedirectUri
            };

            await this.msalInstance.logoutRedirect(logoutRequest);
            
        } catch (error) {
            console.error('[MicrosoftAuthService] Logout error:', error);
            this.forceCleanup();
        }
    }

    async getAccessToken() {
        if (!this.isInitialized || !this.isAuthenticated()) {
            return null;
        }

        try {
            const tokenRequest = {
                scopes: window.AppConfig.scopes.silent,
                account: this.account,
                forceRefresh: false
            };

            const response = await this.msalInstance.acquireTokenSilent(tokenRequest);
            return response.accessToken;
            
        } catch (error) {
            console.warn('[MicrosoftAuthService] Token acquisition failed:', error);
            
            if (error instanceof msal.InteractionRequiredAuthError) {
                await this.login();
                return null;
            }
            
            return null;
        }
    }

    async getUserInfo() {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const userInfo = await response.json();
            return { 
                ...userInfo, 
                provider: 'microsoft',
                email: userInfo.mail || userInfo.userPrincipalName 
            };

        } catch (error) {
            console.error('[MicrosoftAuthService] Error getting user info:', error);
            throw error;
        }
    }

    // ================================================
    // MÉTHODES DE RÉCUPÉRATION DES EMAILS
    // ================================================
    
    /**
     * Méthode principale pour récupérer les emails
     * Compatible avec MailService
     */
    async fetchEmails(options = {}) {
        console.log('[MicrosoftAuthService] 📧 === RÉCUPÉRATION EMAILS OUTLOOK ===');
        console.log('[MicrosoftAuthService] Options:', options);
        
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        try {
            // Paramètres par défaut
            const maxResults = options.maxResults === -1 ? 999 : (options.maxResults || 100);
            const days = options.days || 7;
            const includeSpam = options.includeSpam || false;
            const folder = options.folder || 'INBOX';
            
            // Construire le filtre de date
            let dateFilter = '';
            if (days > 0) {
                const date = new Date();
                date.setDate(date.getDate() - days);
                dateFilter = `receivedDateTime ge ${date.toISOString()}`;
            }
            
            // Construire l'URL de requête
            let endpoint = 'https://graph.microsoft.com/v1.0/me/messages';
            
            // Gérer les dossiers spécifiques
            if (folder === 'SENT') {
                endpoint = 'https://graph.microsoft.com/v1.0/me/mailFolders/SentItems/messages';
            } else if (folder === 'INBOX') {
                endpoint = 'https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages';
            }
            
            // Paramètres de requête
            const params = new URLSearchParams({
                '$top': Math.min(maxResults, 999).toString(),
                '$select': 'id,subject,from,toRecipients,ccRecipients,bccRecipients,receivedDateTime,body,bodyPreview,hasAttachments,importance,isRead,isDraft,webLink',
                '$orderby': 'receivedDateTime desc'
            });
            
            if (dateFilter) {
                params.append('$filter', dateFilter);
            }
            
            console.log('[MicrosoftAuthService] 🔍 Endpoint:', endpoint);
            console.log('[MicrosoftAuthService] 📊 Paramètres:', params.toString());
            
            // Callback de progression initial
            if (options.onProgress) {
                options.onProgress({
                    phase: 'fetching',
                    message: 'Connexion à Outlook...',
                    progress: { current: 0, total: maxResults }
                });
            }
            
            const allEmails = [];
            let nextLink = `${endpoint}?${params}`;
            let totalFetched = 0;
            
            // Récupérer les emails page par page
            while (nextLink && totalFetched < maxResults) {
                const response = await fetch(nextLink, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'outlook.body-content-type="html"'
                    }
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Microsoft Graph API error ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                const emails = data.value || [];
                
                // Transformer les emails au format standard
                const transformedEmails = emails.map(email => this.transformOutlookEmail(email));
                allEmails.push(...transformedEmails);
                totalFetched += emails.length;
                
                // Callback de progression
                if (options.onProgress) {
                    options.onProgress({
                        phase: 'fetching',
                        message: `${totalFetched} emails Outlook récupérés...`,
                        progress: { current: totalFetched, total: maxResults }
                    });
                }
                
                // Vérifier s'il y a une page suivante
                nextLink = data['@odata.nextLink'];
                
                // Limiter au nombre demandé
                if (totalFetched >= maxResults) {
                    break;
                }
                
                // Petit délai pour éviter le rate limiting
                if (nextLink) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            console.log(`[MicrosoftAuthService] ✅ TOTAL: ${allEmails.length} emails Outlook récupérés`);
            return allEmails.slice(0, maxResults);
            
        } catch (error) {
            console.error('[MicrosoftAuthService] ❌ Erreur récupération emails:', error);
            throw error;
        }
    }

    /**
     * Alias pour compatibilité avec MailService
     */
    async getMessages(folder = 'INBOX', options = {}) {
        return this.fetchEmails({ ...options, folder });
    }

    /**
     * Transforme un email Outlook au format standard utilisé par l'application
     */
    transformOutlookEmail(outlookEmail) {
        try {
            // Créer le contenu textuel complet pour l'analyse
            let fullTextForAnalysis = '';
            
            // 1. Ajouter le sujet
            if (outlookEmail.subject) {
                fullTextForAnalysis += outlookEmail.subject + '\n\n';
            }
            
            // 2. Ajouter l'expéditeur
            if (outlookEmail.from?.emailAddress) {
                fullTextForAnalysis += `From: ${outlookEmail.from.emailAddress.name || ''} <${outlookEmail.from.emailAddress.address}>\n`;
            }
            
            // 3. Ajouter le corps
            let bodyContent = '';
            if (outlookEmail.body?.content) {
                if (outlookEmail.body.contentType === 'html') {
                    bodyContent = this.extractTextFromHtml(outlookEmail.body.content);
                } else {
                    bodyContent = outlookEmail.body.content;
                }
                fullTextForAnalysis += '\n' + bodyContent;
            } else if (outlookEmail.bodyPreview) {
                fullTextForAnalysis += '\n' + outlookEmail.bodyPreview;
            }
            
            return {
                // Identifiants
                id: outlookEmail.id,
                provider: 'outlook',
                providerType: 'outlook',
                source: 'outlook',
                
                // Métadonnées principales
                subject: outlookEmail.subject || '(Sans sujet)',
                receivedDateTime: outlookEmail.receivedDateTime,
                
                // Expéditeur
                from: outlookEmail.from,
                
                // Destinataires
                toRecipients: outlookEmail.toRecipients || [],
                ccRecipients: outlookEmail.ccRecipients || [],
                bccRecipients: outlookEmail.bccRecipients || [],
                
                // Corps du message
                bodyPreview: outlookEmail.bodyPreview || '',
                body: outlookEmail.body || { content: '', contentType: 'text' },
                
                // IMPORTANT: Contenu complet pour l'analyse par CategoryManager
                fullTextContent: fullTextForAnalysis.trim(),
                
                // Contenu textuel brut
                bodyText: outlookEmail.body?.contentType === 'text' ? outlookEmail.body.content : bodyContent,
                bodyHtml: outlookEmail.body?.contentType === 'html' ? outlookEmail.body.content : '',
                
                // Pièces jointes
                hasAttachments: outlookEmail.hasAttachments || false,
                
                // État et importance
                isRead: outlookEmail.isRead || false,
                isDraft: outlookEmail.isDraft || false,
                importance: outlookEmail.importance || 'normal',
                
                // Lien web
                webLink: outlookEmail.webLink,
                
                // Métadonnées Outlook spécifiques
                outlookMetadata: {
                    id: outlookEmail.id,
                    conversationId: outlookEmail.conversationId,
                    changeKey: outlookEmail.changeKey
                }
            };
            
        } catch (error) {
            console.error('[MicrosoftAuthService] Erreur transformation email:', error);
            console.error('[MicrosoftAuthService] Email Outlook:', outlookEmail);
            return null;
        }
    }

    /**
     * Extrait le texte depuis le HTML
     */
    extractTextFromHtml(html) {
        if (!html) return '';
        
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Supprimer les éléments non textuels
            const elementsToRemove = tempDiv.querySelectorAll('script, style, noscript, iframe, object, embed');
            elementsToRemove.forEach(el => el.remove());
            
            // Préserver la structure du texte
            tempDiv.querySelectorAll('br').forEach(br => {
                br.replaceWith('\n');
            });
            
            tempDiv.querySelectorAll('p, div, li, tr, h1, h2, h3, h4, h5, h6').forEach(el => {
                if (el.textContent.trim()) {
                    el.innerHTML = el.innerHTML + '\n';
                }
            });
            
            tempDiv.querySelectorAll('td, th').forEach(el => {
                el.innerHTML = el.innerHTML + ' ';
            });
            
            // Extraire le texte
            let text = tempDiv.textContent || tempDiv.innerText || '';
            
            // Nettoyer
            text = text
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .replace(/[ \t]+/g, ' ')
                .replace(/\n[ \t]+/g, '\n')
                .replace(/[ \t]+\n/g, '\n')
                .trim();
            
            return text;
        } catch (error) {
            console.warn('[MicrosoftAuthService] Erreur extraction HTML:', error);
            return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }

    // ================================================
    // OPÉRATIONS SUR LES MESSAGES
    // ================================================
    
    async markAsRead(messageId) {
        const token = await this.getAccessToken();
        if (!token) return false;
        
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isRead: true })
            });
            
            return response.ok;
        } catch (error) {
            console.error('[MicrosoftAuthService] Erreur markAsRead:', error);
            return false;
        }
    }

    async archive(messageId) {
        const token = await this.getAccessToken();
        if (!token) return false;
        
        try {
            // Récupérer l'ID du dossier Archive
            const archiveFolderResponse = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders/Archive', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!archiveFolderResponse.ok) {
                console.error('[MicrosoftAuthService] Dossier Archive non trouvé');
                return false;
            }
            
            const archiveFolder = await archiveFolderResponse.json();
            
            // Déplacer le message
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}/move`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ destinationId: archiveFolder.id })
            });
            
            return response.ok;
        } catch (error) {
            console.error('[MicrosoftAuthService] Erreur archive:', error);
            return false;
        }
    }

    async delete(messageId) {
        const token = await this.getAccessToken();
        if (!token) return false;
        
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return response.ok || response.status === 204;
        } catch (error) {
            console.error('[MicrosoftAuthService] Erreur delete:', error);
            return false;
        }
    }

    // ================================================
    // AUTRES MÉTHODES
    // ================================================

    forceCleanup() {
        console.log('[MicrosoftAuthService] Force cleanup...');
        
        this.account = null;
        this.isInitialized = false;
        this.msalInstance = null;
        this.initializationPromise = null;
        
        // Nettoyer uniquement les tokens Microsoft
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('msal') && !key.includes('google')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Si le dernier provider était Microsoft, le supprimer
        if (sessionStorage.getItem('lastAuthProvider') === 'microsoft') {
            sessionStorage.removeItem('lastAuthProvider');
        }
    }

    reset() {
        this.forceCleanup();
    }

    getDiagnosticInfo() {
        return {
            provider: this.provider,
            isInitialized: this.isInitialized,
            hasAccount: !!this.account,
            accountUsername: this.account?.username,
            currentDomain: window.location.hostname,
            expectedDomain: this.expectedDomain,
            hasEmailMethods: true,
            supportedMethods: ['fetchEmails', 'getMessages', 'markAsRead', 'archive', 'delete']
        };
    }

    /**
     * Test de connexion à Microsoft Graph
     */
    async testConnection() {
        console.log('[MicrosoftAuthService] Test connexion Microsoft Graph...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('Aucun token valide');
            }

            const response = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=1', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Microsoft Graph API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('[MicrosoftAuthService] ✅ Test réussi');
            
            return {
                success: true,
                provider: this.provider,
                email: this.account?.username,
                messageCount: data['@odata.count'] || 'Non disponible'
            };

        } catch (error) {
            console.error('[MicrosoftAuthService] ❌ Test échoué:', error);
            return {
                success: false,
                provider: this.provider,
                error: error.message
            };
        }
    }
}

// Créer l'instance globale
window.authService = new MicrosoftAuthService();

console.log('[MicrosoftAuthService] ✅ Service loaded and ready - v5.0 avec support emails complet');
