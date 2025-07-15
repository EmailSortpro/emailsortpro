// GoogleAuthService.js - Service Google corrigé v6.0
// Amélioration de l'extraction des emails Gmail

class GoogleAuthService {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'gmail';
        
        // Configuration OAuth2
        this.config = {
            clientId: '436941729211-2dr129lfjnc22k1k7f42ofisjbfthmr2.apps.googleusercontent.com',
            scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            redirectUri: `${window.location.origin}/auth-callback.html`,
            responseType: 'token',
            accessType: 'online'
        };
        
        this.scanLimits = {
            maxEmails: Number.MAX_SAFE_INTEGER,
            batchSize: 500,
            rateLimitDelay: 100
        };
        
        console.log('[GoogleAuthService] v6.0 - Structure extraction améliorée');
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
            console.log('[GoogleAuthService] Initialisation...');
            this.isInitialized = true;
            
            const cachedToken = this.getCachedToken();
            if (cachedToken && this.isTokenValid(cachedToken)) {
                console.log('[GoogleAuthService] Token valide trouvé');
                await this.loadUserInfoFromToken(cachedToken.access_token);
            }
            
            console.log('[GoogleAuthService] ✅ Initialisation réussie');
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    isAuthenticated() {
        return this.currentUser !== null && this.isInitialized;
    }

    getAccount() {
        if (!this.currentUser) return null;
        
        return {
            id: this.currentUser.sub || this.currentUser.id,
            name: this.currentUser.name,
            email: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: this.provider,
            username: this.currentUser.email,
            displayName: this.currentUser.name,
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email,
            scanCapabilities: {
                unlimited: true,
                maxEmails: this.scanLimits.maxEmails,
                batchSize: this.scanLimits.batchSize
            }
        };
    }

    async login() {
        console.log('[GoogleAuthService] Login OAuth2...');
        
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const authUrl = this.buildSecureOAuth2Url();
            
            if (window.uiManager) {
                window.uiManager.showToast('Redirection vers Google...', 'info');
            }
            
            window.location.href = authUrl;
            return new Promise(() => {});
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur login:', error);
            throw error;
        }
    }

    buildSecureOAuth2Url() {
        const state = 'google_auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('google_oauth_state', state);
        
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scopes.join(' '),
            response_type: 'token',
            access_type: 'online',
            prompt: 'select_account',
            state: state
        });
        
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async handleOAuthCallback(fragment) {
        console.log('[GoogleAuthService] Traitement callback OAuth2...');
        
        try {
            const fragmentParams = new URLSearchParams(fragment.substring(1));
            
            const accessToken = fragmentParams.get('access_token');
            const tokenType = fragmentParams.get('token_type');
            const expiresIn = fragmentParams.get('expires_in');
            const state = fragmentParams.get('state');
            const error = fragmentParams.get('error');
            
            if (error) {
                throw new Error(`Erreur OAuth2: ${error}`);
            }
            
            if (!accessToken) {
                throw new Error('Token manquant');
            }
            
            const savedState = sessionStorage.getItem('google_oauth_state');
            if (!savedState || savedState !== state) {
                throw new Error('État invalide');
            }
            
            await this.loadUserInfoFromToken(accessToken);
            
            const tokenData = {
                access_token: accessToken,
                token_type: tokenType || 'Bearer',
                expires_in: parseInt(expiresIn) || 3600,
                expires_at: Date.now() + (parseInt(expiresIn) || 3600) * 1000
            };
            
            this.saveToken(tokenData);
            
            console.log('[GoogleAuthService] ✅ Auth réussie');
            return true;
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur callback:', error);
            throw error;
        } finally {
            sessionStorage.removeItem('google_oauth_state');
        }
    }

    async loadUserInfoFromToken(accessToken) {
        console.log('[GoogleAuthService] Chargement infos utilisateur...');
        
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur userinfo: ${response.status}`);
        }
        
        const userInfo = await response.json();
        this.currentUser = userInfo;
        
        console.log('[GoogleAuthService] ✅ User:', userInfo.email);
        return userInfo;
    }

    async fetchEmails(options = {}) {
        console.log('[GoogleAuthService] Récupération emails Gmail...');
        
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('Pas de token');
        }

        try {
            const maxResults = options.maxResults || 100;
            const query = this.buildGmailQuery(options);
            
            let allEmails = [];
            let pageToken = null;
            let totalFetched = 0;
            
            do {
                const params = new URLSearchParams({
                    maxResults: Math.min(this.scanLimits.batchSize, maxResults - totalFetched),
                    q: query
                });
                
                if (pageToken) {
                    params.append('pageToken', pageToken);
                }
                
                const response = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`Gmail API error: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.messages && data.messages.length > 0) {
                    const batchEmails = await this.fetchEmailDetails(data.messages, token);
                    allEmails = allEmails.concat(batchEmails);
                    totalFetched += batchEmails.length;
                    
                    if (options.onProgress) {
                        options.onProgress({
                            phase: 'fetching',
                            message: `${totalFetched} emails récupérés...`,
                            progress: { current: totalFetched, total: maxResults }
                        });
                    }
                }
                
                pageToken = data.nextPageToken;
                
                if (pageToken && totalFetched < maxResults) {
                    await new Promise(resolve => setTimeout(resolve, this.scanLimits.rateLimitDelay));
                }
                
            } while (pageToken && totalFetched < maxResults);
            
            console.log(`[GoogleAuthService] ✅ ${allEmails.length} emails récupérés`);
            return allEmails;
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur:', error);
            throw error;
        }
    }

    buildGmailQuery(options) {
        const parts = [];
        
        if (!options.includeSpam) {
            parts.push('-in:spam');
        }
        
        parts.push('-in:trash');
        parts.push('in:inbox OR in:sent');
        
        if (options.days && options.days > 0) {
            const date = new Date();
            date.setDate(date.getDate() - options.days);
            parts.push(`after:${date.toISOString().split('T')[0]}`);
        }
        
        return parts.join(' ');
    }

    async fetchEmailDetails(messages, token) {
        const emails = [];
        
        for (const msg of messages) {
            try {
                const response = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }
                );
                
                if (!response.ok) continue;
                
                const emailData = await response.json();
                const email = this.transformGmailToStandardFormat(emailData);
                
                if (email) {
                    emails.push(email);
                }
                
            } catch (error) {
                console.warn(`[GoogleAuthService] Erreur email ${msg.id}:`, error);
            }
        }
        
        return emails;
    }

    transformGmailToStandardFormat(gmailData) {
        try {
            const headers = this.extractHeaders(gmailData.payload.headers);
            const body = this.extractBody(gmailData.payload);
            
            // AMÉLIORATION: Extraction complète et structurée
            const email = {
                id: gmailData.id,
                provider: 'gmail',
                providerType: 'gmail',
                source: 'gmail',
                threadId: gmailData.threadId,
                labelIds: gmailData.labelIds || [],
                
                // Extraction propre du sujet
                subject: this.cleanSubject(headers.subject || '(Sans sujet)'),
                
                // Extraction structurée de l'expéditeur
                from: {
                    emailAddress: {
                        address: this.extractEmailAddress(headers.from),
                        name: this.extractDisplayName(headers.from)
                    }
                },
                
                // Destinataires
                toRecipients: this.parseRecipients(headers.to),
                ccRecipients: this.parseRecipients(headers.cc),
                
                // Date et heure
                receivedDateTime: new Date(parseInt(gmailData.internalDate)).toISOString(),
                
                // Corps du message avec extraction intelligente
                bodyPreview: this.cleanBodyPreview(body.preview || body.text),
                body: {
                    content: body.html || body.text,
                    contentType: body.html ? 'html' : 'text'
                },
                
                // Métadonnées
                hasAttachments: this.hasAttachments(gmailData.payload),
                importance: this.extractImportance(headers),
                isRead: !gmailData.labelIds?.includes('UNREAD'),
                isDraft: gmailData.labelIds?.includes('DRAFT'),
                
                // Headers complets pour analyse
                headers: headers,
                
                // Gmail specific
                gmailMetadata: {
                    historyId: gmailData.historyId,
                    snippet: gmailData.snippet,
                    sizeEstimate: gmailData.sizeEstimate,
                    labels: gmailData.labelIds || []
                }
            };
            
            return email;
            
        } catch (error) {
            console.error('[GoogleAuthService] Erreur transformation:', error);
            return null;
        }
    }

    extractHeaders(headers) {
        const result = {};
        headers.forEach(header => {
            const name = header.name.toLowerCase();
            result[name] = header.value;
        });
        return result;
    }

    extractBody(payload) {
        let text = '';
        let html = '';
        
        const extractPart = (part) => {
            if (part.mimeType === 'text/plain' && part.body.data) {
                text = this.base64Decode(part.body.data);
            } else if (part.mimeType === 'text/html' && part.body.data) {
                html = this.base64Decode(part.body.data);
            }
            
            if (part.parts) {
                part.parts.forEach(extractPart);
            }
        };
        
        extractPart(payload);
        
        // Nettoyer le texte pour le preview
        const preview = text || this.htmlToText(html);
        
        return { 
            text, 
            html, 
            preview: preview.substring(0, 500) // Preview plus long
        };
    }

    base64Decode(data) {
        try {
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            return decodeURIComponent(escape(atob(base64)));
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur décodage:', error);
            return '';
        }
    }

    htmlToText(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Supprimer les scripts et styles
        const scripts = temp.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());
        
        // Remplacer les BR par des espaces
        const brs = temp.querySelectorAll('br');
        brs.forEach(br => br.replaceWith(' '));
        
        // Extraire le texte
        let text = temp.textContent || temp.innerText || '';
        
        // Nettoyer les espaces multiples
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    cleanSubject(subject) {
        // Nettoyer les caractères spéciaux du sujet
        return subject
            .replace(/\r\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    cleanBodyPreview(text) {
        if (!text) return '';
        
        // Nettoyer le texte pour le preview
        return text
            .replace(/\r\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/https?:\/\/[^\s]+/g, '[LIEN]')
            .trim()
            .substring(0, 500);
    }

    extractEmailAddress(fromHeader) {
        if (!fromHeader) return 'unknown@gmail.com';
        
        // Format: "Name" <email@domain.com>
        const match = fromHeader.match(/<(.+?)>/);
        if (match) {
            return match[1].toLowerCase();
        }
        
        // Format simple: email@domain.com
        if (fromHeader.includes('@')) {
            return fromHeader.toLowerCase().trim();
        }
        
        return fromHeader;
    }

    extractDisplayName(fromHeader) {
        if (!fromHeader) return 'Unknown';
        
        // Format: "Name" <email@domain.com>
        const match = fromHeader.match(/^"?([^"<]+)"?\s*</);
        if (match) {
            return match[1].trim();
        }
        
        // Si pas de nom, utiliser la partie avant @
        const email = this.extractEmailAddress(fromHeader);
        return email.split('@')[0];
    }

    parseRecipients(recipientHeader) {
        if (!recipientHeader) return [];
        
        // Séparer par virgule et nettoyer
        const recipients = recipientHeader.split(',').map(r => r.trim());
        
        return recipients.map(recipient => ({
            emailAddress: {
                address: this.extractEmailAddress(recipient),
                name: this.extractDisplayName(recipient)
            }
        }));
    }

    hasAttachments(payload) {
        const checkPart = (part) => {
            if (part.filename && part.filename.length > 0) {
                return true;
            }
            if (part.parts) {
                return part.parts.some(checkPart);
            }
            return false;
        };
        
        return checkPart(payload);
    }

    extractImportance(headers) {
        const importance = headers['importance'] || headers['x-priority'];
        if (importance && (importance.includes('high') || importance === '1')) {
            return 'high';
        }
        return 'normal';
    }

    saveToken(tokenData) {
        try {
            const tokenInfo = {
                access_token: tokenData.access_token,
                expires_at: tokenData.expires_at || (Date.now() + (tokenData.expires_in * 1000)),
                token_type: tokenData.token_type || 'Bearer',
                created_at: Date.now(),
                provider: this.provider
            };
            
            localStorage.setItem('google_token_emailsortpro', JSON.stringify(tokenInfo));
            console.log('[GoogleAuthService] Token sauvegardé');
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur sauvegarde:', error);
        }
    }

    getCachedToken() {
        try {
            const tokenStr = localStorage.getItem('google_token_emailsortpro');
            if (tokenStr) {
                return JSON.parse(tokenStr);
            }
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur lecture token:', error);
        }
        return null;
    }

    isTokenValid(tokenInfo) {
        if (!tokenInfo || !tokenInfo.access_token) {
            return false;
        }
        
        const now = Date.now();
        const expiresAt = tokenInfo.expires_at || 0;
        return expiresAt > (now + 5 * 60 * 1000);
    }

    async getAccessToken() {
        if (!this.isAuthenticated()) {
            return null;
        }

        const cachedToken = this.getCachedToken();
        if (cachedToken && this.isTokenValid(cachedToken)) {
            return cachedToken.access_token;
        }
        
        return null;
    }

    async getUserInfo() {
        if (!this.isAuthenticated()) {
            throw new Error('Non authentifié');
        }

        return {
            id: this.currentUser.id || this.currentUser.sub,
            displayName: this.currentUser.name,
            givenName: this.currentUser.given_name,
            familyName: this.currentUser.family_name,
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: this.provider,
            username: this.currentUser.email,
            name: this.currentUser.name,
            email: this.currentUser.email
        };
    }

    async logout() {
        console.log('[GoogleAuthService] Logout...');
        
        try {
            this.currentUser = null;
            localStorage.removeItem('google_token_emailsortpro');
            sessionStorage.removeItem('google_oauth_state');
            
            console.log('[GoogleAuthService] ✅ Logout réussi');
            
        } catch (error) {
            console.error('[GoogleAuthService] Erreur logout:', error);
        }
    }

    async reset() {
        console.log('[GoogleAuthService] Reset...');
        this.forceCleanup();
    }

    forceCleanup() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        
        try {
            localStorage.removeItem('google_token_emailsortpro');
            sessionStorage.removeItem('google_oauth_state');
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur cleanup:', error);
        }
    }

    getDiagnosticInfo() {
        const cachedToken = this.getCachedToken();
        
        return {
            isInitialized: this.isInitialized,
            hasCurrentUser: !!this.currentUser,
            userEmail: this.currentUser?.email,
            provider: this.provider,
            tokenInfo: cachedToken ? {
                hasToken: !!cachedToken.access_token,
                isValid: this.isTokenValid(cachedToken),
                expiresAt: cachedToken.expires_at ? new Date(cachedToken.expires_at).toISOString() : null
            } : null
        };
    }

    async testGmailConnection() {
        console.log('[GoogleAuthService] Test connexion Gmail...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('Aucun token');
            }

            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Gmail API error: ${response.status}`);
            }

            const profile = await response.json();
            console.log('[GoogleAuthService] ✅ Test réussi');
            
            return {
                success: true,
                provider: this.provider,
                email: profile.emailAddress,
                messagesTotal: profile.messagesTotal,
                threadsTotal: profile.threadsTotal
            };

        } catch (error) {
            console.error('[GoogleAuthService] ❌ Test échoué:', error);
            return {
                success: false,
                provider: this.provider,
                error: error.message
            };
        }
    }
}

// Créer l'instance globale
try {
    window.googleAuthService = new GoogleAuthService();
    console.log('[GoogleAuthService] ✅ v6.0 créée');
} catch (error) {
    console.error('[GoogleAuthService] ❌ Erreur création:', error);
    
    window.googleAuthService = {
        isInitialized: false,
        provider: 'gmail',
        initialize: () => Promise.resolve(),
        login: () => Promise.reject(new Error('Service indisponible')),
        isAuthenticated: () => false
    };
}

console.log('✅ GoogleAuthService v6.0 - Structure extraction améliorée');
