// GoogleAuthService.js - Service Google SÉCURISÉ v4.5
// CORRECTION COMPLÈTE : Détection automatique de l'authentification existante

class GoogleAuthService {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'google';
        
        // Configuration OAuth2 sécurisée
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
        
        console.log('[GoogleAuthService] Constructor v4.5 - Auto-detection activée');
        this.verifyDomain();
        
        // IMPORTANT: Vérifier immédiatement s'il y a un token valide
        this.checkExistingAuth();
    }

    // NOUVEAU: Vérification immédiate de l'authentification existante
    checkExistingAuth() {
        console.log('[GoogleAuthService] Vérification authentification existante...');
        
        try {
            const cachedToken = this.getCachedToken();
            if (cachedToken && this.isTokenValid(cachedToken)) {
                console.log('[GoogleAuthService] ✅ Token valide trouvé, récupération user...');
                
                // Récupérer les infos utilisateur du cache si disponibles
                const cachedUserStr = sessionStorage.getItem('google_user_info');
                if (cachedUserStr) {
                    try {
                        this.currentUser = JSON.parse(cachedUserStr);
                        console.log('[GoogleAuthService] ✅ User récupéré du cache:', this.currentUser.email);
                        
                        // Marquer comme provider actif
                        sessionStorage.setItem('lastAuthProvider', 'google');
                        
                        // Déclencher un événement pour notifier l'app
                        window.dispatchEvent(new CustomEvent('googleAuthReady', {
                            detail: { user: this.currentUser, authenticated: true }
                        }));
                    } catch (e) {
                        console.warn('[GoogleAuthService] Erreur parsing user cache:', e);
                    }
                }
            }
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur vérification auth existante:', error);
        }
    }

    verifyDomain() {
        const currentDomain = window.location.hostname;
        const isCorrectDomain = currentDomain === this.expectedDomain;
        const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
        
        console.log('[GoogleAuthService] Domain verification:', {
            current: currentDomain,
            expected: this.expectedDomain,
            isCorrect: isCorrectDomain,
            isLocalhost: isLocalhost
        });
    }

    async initialize() {
        console.log('[GoogleAuthService] Initialize...');
        
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        if (this.isInitialized) {
            return Promise.resolve(true);
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    async _doInitialize() {
        try {
            console.log('[GoogleAuthService] Initialisation...');
            
            // Vérifier s'il y a un token en cache
            const cachedToken = this.getCachedToken();
            if (cachedToken && this.isTokenValid(cachedToken)) {
                console.log('[GoogleAuthService] Token valide en cache');
                
                // Si on n'a pas encore l'utilisateur, le charger
                if (!this.currentUser) {
                    try {
                        await this.loadUserInfoFromToken(cachedToken.access_token);
                        sessionStorage.setItem('lastAuthProvider', 'google');
                    } catch (error) {
                        console.warn('[GoogleAuthService] Erreur chargement user:', error);
                        // Ne pas échouer l'initialisation
                    }
                }
            }
            
            this.isInitialized = true;
            console.log('[GoogleAuthService] ✅ Initialisation terminée');
            
            // Notifier que le service est prêt
            window.dispatchEvent(new CustomEvent('googleAuthServiceReady', {
                detail: { 
                    authenticated: this.isAuthenticated(),
                    user: this.currentUser 
                }
            }));
            
            return true;
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur initialisation:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    isAuthenticated() {
        const hasUser = this.currentUser !== null;
        const hasValidToken = this.hasValidCachedToken();
        const result = hasUser && hasValidToken && this.isInitialized;
        
        console.log('[GoogleAuthService] isAuthenticated check:', {
            hasUser,
            hasValidToken,
            isInitialized: this.isInitialized,
            result,
            userEmail: this.currentUser?.email
        });
        
        return result;
    }

    hasValidCachedToken() {
        const cachedToken = this.getCachedToken();
        return cachedToken && this.isTokenValid(cachedToken);
    }

    getAccount() {
        if (!this.currentUser) {
            return null;
        }
        
        return {
            id: this.currentUser.sub || this.currentUser.id,
            name: this.currentUser.name,
            email: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: 'google',
            username: this.currentUser.email,
            displayName: this.currentUser.name,
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email
        };
    }

    async login() {
        console.log('[GoogleAuthService] Login...');
        
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            // Marquer Google comme provider actif
            sessionStorage.setItem('lastAuthProvider', 'google');
            
            // Construire l'URL OAuth2
            const authUrl = this.buildOAuth2Url();
            
            console.log('[GoogleAuthService] Redirection vers Google...');
            
            if (window.uiManager) {
                window.uiManager.showToast('Redirection vers Google...', 'info');
            }
            
            // Rediriger
            window.location.href = authUrl;
            
            return new Promise(() => {}); // Ne jamais résoudre car on redirige
            
        } catch (error) {
            console.error('[GoogleAuthService] Erreur login:', error);
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
                throw new Error(`OAuth2 error: ${error}`);
            }
            
            if (!accessToken) {
                throw new Error('No access token in fragment');
            }
            
            console.log('[GoogleAuthService] Token reçu');
            
            // Charger les infos utilisateur
            await this.loadUserInfoFromToken(accessToken);
            
            // Sauvegarder le token
            const tokenData = {
                access_token: accessToken,
                token_type: tokenType || 'Bearer',
                expires_in: parseInt(expiresIn) || 3600,
                expires_at: Date.now() + (parseInt(expiresIn) || 3600) * 1000
            };
            
            this.saveToken(tokenData);
            
            // Marquer comme provider actif
            sessionStorage.setItem('lastAuthProvider', 'google');
            
            console.log('[GoogleAuthService] ✅ Authentification réussie');
            
            // Déclencher un événement
            window.dispatchEvent(new CustomEvent('googleAuthSuccess', {
                detail: { user: this.currentUser }
            }));
            
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
            throw new Error(`User info error: ${response.status}`);
        }
        
        const userInfo = await response.json();
        this.currentUser = userInfo;
        
        // Sauvegarder en session
        sessionStorage.setItem('google_user_info', JSON.stringify(userInfo));
        
        console.log('[GoogleAuthService] ✅ User chargé:', userInfo.email);
        
        return userInfo;
    }

    saveToken(tokenData) {
        try {
            const tokenInfo = {
                access_token: tokenData.access_token,
                expires_at: tokenData.expires_at || (Date.now() + (tokenData.expires_in * 1000)),
                token_type: tokenData.token_type || 'Bearer',
                created_at: Date.now()
            };
            
            localStorage.setItem('google_token_emailsortpro', JSON.stringify(tokenInfo));
            console.log('[GoogleAuthService] Token sauvegardé');
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
        const isValid = expiresAt > (now + 5 * 60 * 1000); // 5 minutes de marge
        
        return isValid;
    }

    async getAccessToken() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const cachedToken = this.getCachedToken();
        if (cachedToken && this.isTokenValid(cachedToken)) {
            return cachedToken.access_token;
        }
        
        return null;
    }

    async getUserInfo() {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        return {
            id: this.currentUser.id || this.currentUser.sub,
            displayName: this.currentUser.name,
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: 'google',
            email: this.currentUser.email
        };
    }

    async logout() {
        console.log('[GoogleAuthService] Logout...');
        
        try {
            // Révoquer le token si possible
            const cachedToken = this.getCachedToken();
            if (cachedToken && cachedToken.access_token) {
                try {
                    await fetch(`https://oauth2.googleapis.com/revoke?token=${cachedToken.access_token}`, {
                        method: 'POST'
                    });
                } catch (e) {
                    // Ignorer les erreurs de révocation
                }
            }
            
            this.forceCleanup();
            
        } catch (error) {
            console.error('[GoogleAuthService] Erreur logout:', error);
            this.forceCleanup();
        }
    }

    forceCleanup() {
        console.log('[GoogleAuthService] Cleanup...');
        
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        
        try {
            localStorage.removeItem('google_token_emailsortpro');
            sessionStorage.removeItem('google_oauth_state');
            sessionStorage.removeItem('google_user_info');
            
            if (sessionStorage.getItem('lastAuthProvider') === 'google') {
                sessionStorage.removeItem('lastAuthProvider');
            }
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur cleanup:', error);
        }
    }

    async testGmailConnection() {
        console.log('[GoogleAuthService] Test connexion Gmail...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token');
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
            console.log('[GoogleAuthService] ✅ Gmail API OK');
            
            return {
                success: true,
                provider: 'google',
                email: profile.emailAddress,
                messagesTotal: profile.messagesTotal
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
            userEmail: this.currentUser?.email,
            isAuthenticated: this.isAuthenticated(),
            lastAuthProvider: sessionStorage.getItem('lastAuthProvider'),
            tokenInfo: cachedToken ? {
                hasToken: !!cachedToken.access_token,
                isValid: this.isTokenValid(cachedToken),
                expiresAt: cachedToken.expires_at ? new Date(cachedToken.expires_at).toISOString() : null
            } : null
        };
    }
}

// Créer l'instance globale
window.googleAuthService = new GoogleAuthService();

console.log('[GoogleAuthService] ✅ v4.5 loaded - Auto-detection activée');
