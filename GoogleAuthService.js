// GoogleAuthService.js - Service Google UNIFIÉ pour EmailSortPro v6.0
// Compatible avec MailService unifié - Structure identique à AuthService Microsoft

class GoogleAuthService {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'google';
        this.profileCache = null;
        this.profileCacheTime = 0;
        
        // Configuration Google OAuth2 SÉCURISÉE - Structure unifiée
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
        
        console.log('[GoogleAuthService] Constructor v6.0 - Structure unifiée Outlook/Gmail');
        this.verifyDomain();
    }

    verifyDomain() {
        const currentDomain = window.location.hostname;
        const isCorrectDomain = currentDomain === this.expectedDomain;
        const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
        
        console.log('[GoogleAuthService] Domain verification unifiée:', {
            current: currentDomain,
            expected: this.expectedDomain,
            isCorrect: isCorrectDomain,
            isLocalhost: isLocalhost,
            provider: this.provider
        });
    }

    async initialize() {
        console.log('[GoogleAuthService] Initialize - Structure unifiée...');
        
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
            console.log('[GoogleAuthService] Initialisation Gmail unifiée...');
            
            this.isInitialized = true;
            
            // Vérifier token en cache
            const cachedToken = this.getCachedToken();
            if (cachedToken && this.isTokenValid(cachedToken)) {
                console.log('[GoogleAuthService] Token Gmail valide trouvé');
                await this.loadUserInfoFromToken(cachedToken.access_token);
            }
            
            console.log('[GoogleAuthService] ✅ Initialisation Gmail unifiée réussie');
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur initialisation Gmail:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    // Méthode unifiée - compatible avec AuthService Microsoft
    isAuthenticated() {
        const authenticated = this.currentUser !== null && this.isInitialized;
        
        console.log('[GoogleAuthService] Check authentification Gmail unifiée:', {
            hasCurrentUser: !!this.currentUser,
            isInitialized: this.isInitialized,
            result: authenticated,
            provider: this.provider
        });
        
        return authenticated;
    }

    // Format unifié compatible avec Microsoft
    getAccount() {
        if (!this.currentUser) return null;
        
        return {
            id: this.currentUser.sub || this.currentUser.id,
            name: this.currentUser.name,
            email: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: 'google',
            username: this.currentUser.email,
            displayName: this.currentUser.name,
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email,
            // Champs additionnels pour compatibilité
            givenName: this.currentUser.given_name,
            familyName: this.currentUser.family_name
        };
    }

    // Méthode unifiée de login
    async login() {
        console.log('[GoogleAuthService] Login Gmail unifié...');
        
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const authUrl = this.buildOAuth2Url();
            
            console.log('[GoogleAuthService] Redirection Gmail unifiée');
            
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Redirection vers Gmail...',
                    'info',
                    3000
                );
            }
            
            window.location.href = authUrl;
            return new Promise(() => {});
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur login Gmail:', error);
            
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Erreur connexion Gmail: ' + error.message,
                    'error',
                    8000
                );
            }
            
            throw error;
        }
    }

    buildOAuth2Url() {
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

    // Traitement callback unifié
    async handleOAuthCallback(fragment) {
        console.log('[GoogleAuthService] Callback Gmail unifié...');
        
        try {
            const fragmentParams = new URLSearchParams(fragment.substring(1));
            
            const accessToken = fragmentParams.get('access_token');
            const tokenType = fragmentParams.get('token_type');
            const expiresIn = fragmentParams.get('expires_in');
            const state = fragmentParams.get('state');
            const error = fragmentParams.get('error');
            
            if (error) {
                throw new Error(`Erreur OAuth2 Gmail: ${error}`);
            }
            
            if (!accessToken) {
                throw new Error('Token Gmail manquant');
            }
            
            // Vérifier état pour sécurité
            const savedState = sessionStorage.getItem('google_oauth_state');
            if (!savedState || savedState !== state) {
                throw new Error('État OAuth2 Gmail invalide');
            }
            
            console.log('[GoogleAuthService] Token Gmail reçu avec succès');
            
            await this.loadUserInfoFromToken(accessToken);
            
            const tokenData = {
                access_token: accessToken,
                token_type: tokenType || 'Bearer',
                expires_in: parseInt(expiresIn) || 3600,
                expires_at: Date.now() + (parseInt(expiresIn) || 3600) * 1000
            };
            
            this.saveToken(tokenData);
            
            console.log('[GoogleAuthService] ✅ Authentification Gmail unifiée réussie');
            return true;
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur callback Gmail:', error);
            throw error;
        } finally {
            sessionStorage.removeItem('google_oauth_state');
        }
    }

    async loadUserInfoFromToken(accessToken) {
        console.log('[GoogleAuthService] Chargement infos utilisateur Gmail...');
        
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur user info Gmail: ${response.status}`);
        }
        
        const userInfo = await response.json();
        this.currentUser = userInfo;
        
        // Cache pour compatibilité
        this.profileCache = userInfo;
        this.profileCacheTime = Date.now();
        
        // Sauvegarder pour compatibilité avec les autres services
        try {
            localStorage.setItem('currentUserInfo', JSON.stringify({
                email: userInfo.email,
                name: userInfo.name,
                userPrincipalName: userInfo.email,
                provider: 'google'
            }));
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur sauvegarde userInfo:', error);
        }
        
        console.log('[GoogleAuthService] ✅ Infos utilisateur Gmail chargées:', userInfo.email);
        
        return userInfo;
    }

    // Méthode unifiée pour obtenir le token - compatible avec MailService
    async getAccessToken() {
        if (!this.isAuthenticated()) {
            console.warn('[GoogleAuthService] Pas authentifié Gmail');
            return null;
        }

        const cachedToken = this.getCachedToken();
        if (cachedToken && this.isTokenValid(cachedToken)) {
            return cachedToken.access_token;
        }
        
        console.warn('[GoogleAuthService] Token Gmail expiré');
        return null;
    }

    // Méthode unifiée getUserInfo - format compatible Microsoft
    async getUserInfo() {
        if (!this.isAuthenticated()) {
            throw new Error('Pas authentifié Gmail');
        }

        return {
            id: this.currentUser.id || this.currentUser.sub,
            displayName: this.currentUser.name,
            givenName: this.currentUser.given_name || this.currentUser.name?.split(' ')[0],
            familyName: this.currentUser.family_name || this.currentUser.name?.split(' ').slice(1).join(' '),
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: 'google',
            username: this.currentUser.email,
            name: this.currentUser.name,
            email: this.currentUser.email
        };
    }

    // Méthode unifiée getCurrentUser - compatible avec MailService
    getCurrentUser() {
        if (!this.currentUser) return null;
        
        return {
            email: this.currentUser.email,
            userPrincipalName: this.currentUser.email,
            username: this.currentUser.email,
            displayName: this.currentUser.name,
            name: this.currentUser.name,
            provider: 'google'
        };
    }

    saveToken(tokenData) {
        try {
            const tokenInfo = {
                access_token: tokenData.access_token,
                expires_at: Date.now() + (tokenData.expires_in * 1000),
                token_type: tokenData.token_type || 'Bearer',
                created_at: Date.now(),
                provider: 'google'
            };
            
            localStorage.setItem('google_token_emailsortpro', JSON.stringify(tokenInfo));
            console.log('[GoogleAuthService] Token Gmail sauvegardé');
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur sauvegarde token:', error);
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
        const isValid = expiresAt > (now + 5 * 60 * 1000); // Marge 5 min
        
        return isValid;
    }

    async logout() {
        console.log('[GoogleAuthService] Logout Gmail unifié...');
        
        try {
            this.currentUser = null;
            this.profileCache = null;
            this.profileCacheTime = 0;
            
            localStorage.removeItem('google_token_emailsortpro');
            localStorage.removeItem('currentUserInfo');
            sessionStorage.removeItem('google_oauth_state');
            
            // Révoquer token
            const cachedToken = this.getCachedToken();
            if (cachedToken && cachedToken.access_token) {
                try {
                    await fetch(`https://oauth2.googleapis.com/revoke?token=${cachedToken.access_token}`, {
                        method: 'POST'
                    });
                    console.log('[GoogleAuthService] Token Gmail révoqué');
                } catch (revokeError) {
                    console.warn('[GoogleAuthService] Erreur révocation:', revokeError);
                }
            }
            
            console.log('[GoogleAuthService] ✅ Logout Gmail réussi');
            
        } catch (error) {
            console.error('[GoogleAuthService] Erreur logout Gmail:', error);
            this.forceCleanup();
        }
    }

    async reset() {
        console.log('[GoogleAuthService] Reset Gmail unifié...');
        this.forceCleanup();
    }

    forceCleanup() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.profileCache = null;
        this.profileCacheTime = 0;
        
        try {
            localStorage.removeItem('google_token_emailsortpro');
            localStorage.removeItem('currentUserInfo');
            sessionStorage.removeItem('google_oauth_state');
            
            // Nettoyer autres clés Google
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('google') || key.includes('gapi') || key.includes('oauth'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            console.log('[GoogleAuthService] Nettoyage Gmail terminé');
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur nettoyage:', error);
        }
    }

    // Test connexion Gmail - format unifié
    async testConnection() {
        console.log('[GoogleAuthService] Test connexion Gmail unifié...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('Aucun token Gmail disponible');
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
            
            return {
                success: true,
                provider: 'google',
                user: this.currentUser.name,
                email: profile.emailAddress,
                messagesTotal: profile.messagesTotal,
                threadsTotal: profile.threadsTotal
            };

        } catch (error) {
            console.error('[GoogleAuthService] ❌ Test Gmail échoué:', error);
            return {
                success: false,
                provider: 'google',
                error: error.message
            };
        }
    }

    getDiagnosticInfo() {
        const cachedToken = this.getCachedToken();
        
        return {
            isInitialized: this.isInitialized,
            hasCurrentUser: !!this.currentUser,
            userEmail: this.currentUser ? this.currentUser.email : null,
            provider: this.provider,
            expectedDomain: this.expectedDomain,
            currentDomain: window.location.hostname,
            domainMatch: window.location.hostname === this.expectedDomain,
            config: {
                clientId: this.config.clientId.substring(0, 15) + '...',
                scopes: this.config.scopes,
                redirectUri: this.config.redirectUri
            },
            tokenInfo: cachedToken ? {
                hasToken: !!cachedToken.access_token,
                isValid: this.isTokenValid(cachedToken),
                expiresAt: cachedToken.expires_at ? new Date(cachedToken.expires_at).toISOString() : null,
                provider: cachedToken.provider
            } : null,
            version: '6.0'
        };
    }
}

// Créer l'instance globale
try {
    window.googleAuthService = new GoogleAuthService();
    console.log('[GoogleAuthService] ✅ Instance Gmail unifiée créée v6.0');
} catch (error) {
    console.error('[GoogleAuthService] ❌ Erreur création instance:', error);
    
    window.googleAuthService = {
        isInitialized: false,
        provider: 'google',
        initialize: () => Promise.resolve(),
        login: () => Promise.reject(new Error('GoogleAuthService indisponible')),
        isAuthenticated: () => false,
        getAccessToken: () => Promise.resolve(null),
        getCurrentUser: () => null,
        getDiagnosticInfo: () => ({ 
            error: 'GoogleAuthService indisponible: ' + error.message,
            provider: 'google',
            expectedDomain: 'emailsortpro.netlify.app',
            version: '6.0'
        })
    };
}

console.log('✅ GoogleAuthService v6.0 - Structure unifiée Outlook/Gmail compatible complète');
