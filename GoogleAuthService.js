// GoogleAuthService.js - Service Google SANS IFRAME pour EmailSortPro v4.0

class GoogleAuthService {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'google';
        
        // Configuration Google OAuth2 pour EmailSortPro - SANS IFRAME
        this.config = {
            clientId: '436941729211-00tc5fdl74l0hc3q1qotfknh0v86h72i.apps.googleusercontent.com',
            scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            redirectUri: `${window.location.origin}/auth-callback.html`
        };
        
        console.log('[GoogleAuthService] Constructor - Version SANS IFRAME pour EmailSortPro');
        this.verifyDomain();
    }

    verifyDomain() {
        const currentDomain = window.location.hostname;
        const isCorrectDomain = currentDomain === this.expectedDomain;
        const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
        
        console.log('[GoogleAuthService] Domain verification:', {
            current: currentDomain,
            expected: this.expectedDomain,
            isCorrect: isCorrectDomain,
            isLocalhost: isLocalhost,
            origin: window.location.origin
        });
    }

    async initialize() {
        console.log('[GoogleAuthService] Initialize - Méthode DIRECTE SANS IFRAME...');
        
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
            console.log('[GoogleAuthService] Initialisation directe OAuth2 pour EmailSortPro...');
            
            // PAS d'iframe, PAS de gapi.auth2.init
            // Juste marquer comme initialisé et utiliser OAuth2 direct
            this.isInitialized = true;
            
            // Vérifier s'il y a un token en cache
            const cachedToken = this.getCachedToken();
            if (cachedToken && this.isTokenValid(cachedToken)) {
                console.log('[GoogleAuthService] Token en cache trouvé et valide');
                await this.loadUserInfoFromToken(cachedToken);
            } else {
                console.log('[GoogleAuthService] Aucun token valide en cache');
            }
            
            console.log('[GoogleAuthService] ✅ Initialisation directe réussie - SANS IFRAME');
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur d\'initialisation:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    isAuthenticated() {
        const authenticated = this.currentUser !== null && this.isInitialized;
        
        console.log('[GoogleAuthService] Check authentification:', {
            hasCurrentUser: !!this.currentUser,
            isInitialized: this.isInitialized,
            result: authenticated,
            provider: this.provider
        });
        
        return authenticated;
    }

    getAccount() {
        if (!this.currentUser) return null;
        
        return {
            id: this.currentUser.sub || this.currentUser.id,
            name: this.currentUser.name,
            email: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: 'google',
            // Format compatible Microsoft
            username: this.currentUser.email,
            displayName: this.currentUser.name,
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email
        };
    }

    async login() {
        console.log('[GoogleAuthService] Login DIRECT OAuth2 pour EmailSortPro...');
        
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            // Construire l'URL OAuth2 directement
            const authUrl = this.buildOAuth2Url();
            
            console.log('[GoogleAuthService] Redirection vers Google OAuth2:', authUrl);
            
            // Afficher message à l'utilisateur
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Redirection vers Google Gmail...',
                    'info',
                    3000
                );
            }
            
            // Rediriger DIRECTEMENT vers Google OAuth2
            window.location.href = authUrl;
            
            // Cette promesse ne se résoudra jamais car on redirige
            return new Promise(() => {});
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur de login:', error);
            
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Erreur de connexion Gmail: ' + error.message,
                    'error',
                    8000
                );
            }
            
            throw error;
        }
    }

    buildOAuth2Url() {
        const state = 'google_auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Sauvegarder l'état pour validation
        sessionStorage.setItem('google_oauth_state', state);
        
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scopes.join(' '),
            response_type: 'code', // Utiliser code au lieu de token pour plus de sécurité
            access_type: 'online',
            prompt: 'select_account',
            state: state
        });
        
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    // Méthode pour traiter le retour OAuth2 (appelée depuis auth-callback.html)
    async handleOAuthCallback(urlParams) {
        console.log('[GoogleAuthService] Traitement du callback OAuth2...');
        
        try {
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');
            
            if (error) {
                throw new Error(`Erreur OAuth2: ${error}`);
            }
            
            if (!code) {
                throw new Error('Code d\'autorisation manquant');
            }
            
            // Vérifier l'état
            const savedState = sessionStorage.getItem('google_oauth_state');
            if (!savedState || savedState !== state) {
                throw new Error('État OAuth2 invalide - possible attaque CSRF');
            }
            
            // Échanger le code contre un token
            const tokenResponse = await this.exchangeCodeForToken(code);
            
            if (tokenResponse.access_token) {
                // Charger les informations utilisateur
                await this.loadUserInfoFromToken(tokenResponse.access_token);
                
                // Sauvegarder le token
                this.saveToken(tokenResponse);
                
                console.log('[GoogleAuthService] ✅ Authentification OAuth2 réussie');
                return true;
            } else {
                throw new Error('Token d\'accès non reçu');
            }
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur callback OAuth2:', error);
            throw error;
        } finally {
            // Nettoyer l'état
            sessionStorage.removeItem('google_oauth_state');
        }
    }

    async exchangeCodeForToken(code) {
        console.log('[GoogleAuthService] Échange du code pour un token...');
        
        const tokenEndpoint = 'https://oauth2.googleapis.com/token';
        
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            client_secret: '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', // Votre client secret
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: this.config.redirectUri
        });
        
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Erreur token exchange: ${response.status} - ${errorData}`);
        }
        
        const tokenData = await response.json();
        console.log('[GoogleAuthService] ✅ Token reçu avec succès');
        
        return tokenData;
    }

    async loadUserInfoFromToken(accessToken) {
        console.log('[GoogleAuthService] Chargement des infos utilisateur...');
        
        const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v2/userinfo';
        
        const response = await fetch(userInfoEndpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur user info: ${response.status}`);
        }
        
        const userInfo = await response.json();
        this.currentUser = userInfo;
        
        console.log('[GoogleAuthService] ✅ Infos utilisateur chargées:', userInfo.email);
        
        return userInfo;
    }

    saveToken(tokenData) {
        try {
            const tokenInfo = {
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_at: Date.now() + (tokenData.expires_in * 1000),
                token_type: tokenData.token_type || 'Bearer'
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
            console.warn('[GoogleAuthService] Erreur lecture token cache:', error);
        }
        return null;
    }

    isTokenValid(tokenInfo) {
        if (!tokenInfo || !tokenInfo.access_token) {
            return false;
        }
        
        // Vérifier expiration (avec marge de 5 minutes)
        const now = Date.now();
        const expiresAt = tokenInfo.expires_at || 0;
        const isValid = expiresAt > (now + 5 * 60 * 1000);
        
        console.log('[GoogleAuthService] Token validity check:', {
            hasToken: !!tokenInfo.access_token,
            expiresAt: new Date(expiresAt).toISOString(),
            now: new Date(now).toISOString(),
            isValid: isValid
        });
        
        return isValid;
    }

    async getAccessToken() {
        if (!this.isAuthenticated()) {
            console.warn('[GoogleAuthService] Pas authentifié pour demande de token');
            return null;
        }

        const cachedToken = this.getCachedToken();
        if (cachedToken && this.isTokenValid(cachedToken)) {
            return cachedToken.access_token;
        }
        
        console.warn('[GoogleAuthService] Token expiré ou invalide');
        return null;
    }

    async getUserInfo() {
        if (!this.isAuthenticated()) {
            throw new Error('Pas authentifié avec Google Gmail');
        }

        const userInfo = {
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
        
        console.log('[GoogleAuthService] ✅ User info pour EmailSortPro:', userInfo.displayName);
        return userInfo;
    }

    async logout() {
        console.log('[GoogleAuthService] Logout Gmail pour EmailSortPro...');
        
        try {
            // Nettoyer les données locales
            this.currentUser = null;
            localStorage.removeItem('google_token_emailsortpro');
            sessionStorage.removeItem('google_oauth_state');
            
            // Révoquer le token si possible
            const cachedToken = this.getCachedToken();
            if (cachedToken && cachedToken.access_token) {
                try {
                    await fetch(`https://oauth2.googleapis.com/revoke?token=${cachedToken.access_token}`, {
                        method: 'POST'
                    });
                } catch (revokeError) {
                    console.warn('[GoogleAuthService] Erreur révocation token:', revokeError);
                }
            }
            
            console.log('[GoogleAuthService] ✅ Logout réussi');
            
        } catch (error) {
            console.error('[GoogleAuthService] Erreur logout:', error);
            this.forceCleanup();
        }
    }

    async reset() {
        console.log('[GoogleAuthService] Reset pour EmailSortPro...');
        this.forceCleanup();
    }

    forceCleanup() {
        console.log('[GoogleAuthService] Nettoyage forcé...');
        
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        
        // Nettoyer localStorage
        try {
            localStorage.removeItem('google_token_emailsortpro');
            sessionStorage.removeItem('google_oauth_state');
            
            // Nettoyer autres clés Google
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('google') || key.includes('gapi') || key.includes('oauth'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur nettoyage:', error);
        }
        
        console.log('[GoogleAuthService] ✅ Nettoyage terminé');
    }

    getDiagnosticInfo() {
        const cachedToken = this.getCachedToken();
        
        return {
            isInitialized: this.isInitialized,
            hasCurrentUser: !!this.currentUser,
            userEmail: this.currentUser ? this.currentUser.email : null,
            expectedDomain: this.expectedDomain,
            currentDomain: window.location.hostname,
            domainMatch: window.location.hostname === this.expectedDomain,
            provider: this.provider,
            method: 'Direct OAuth2 (SANS IFRAME)',
            config: {
                clientId: this.config.clientId.substring(0, 15) + '...',
                scopes: this.config.scopes,
                origin: window.location.origin,
                redirectUri: this.config.redirectUri
            },
            tokenInfo: cachedToken ? {
                hasToken: !!cachedToken.access_token,
                isValid: this.isTokenValid(cachedToken),
                expiresAt: cachedToken.expires_at ? new Date(cachedToken.expires_at).toISOString() : null
            } : null,
            currentUrl: window.location.href,
            avoidsiFrameError: true
        };
    }

    // Test de connexion Gmail API
    async testGmailConnection() {
        console.log('[GoogleAuthService] Test connexion Gmail API...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('Aucun token d\'accès disponible');
            }

            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
            }

            const profile = await response.json();
            console.log('[GoogleAuthService] ✅ Test Gmail API réussi');
            
            return {
                success: true,
                provider: 'google',
                email: profile.emailAddress,
                messagesTotal: profile.messagesTotal,
                threadsTotal: profile.threadsTotal
            };

        } catch (error) {
            console.error('[GoogleAuthService] ❌ Test Gmail API échoué:', error);
            return {
                success: false,
                provider: 'google',
                error: error.message
            };
        }
    }
}

// Créer l'instance globale
try {
    window.googleAuthService = new GoogleAuthService();
    console.log('[GoogleAuthService] ✅ Instance SANS IFRAME créée pour EmailSortPro');
} catch (error) {
    console.error('[GoogleAuthService] ❌ Erreur création instance:', error);
    
    window.googleAuthService = {
        isInitialized: false,
        provider: 'google',
        initialize: () => Promise.resolve(),
        login: () => Promise.reject(new Error('GoogleAuthService indisponible: ' + error.message)),
        isAuthenticated: () => false,
        getDiagnosticInfo: () => ({ 
            error: 'GoogleAuthService échec: ' + error.message,
            method: 'Direct OAuth2 (SANS IFRAME)',
            expectedDomain: 'emailsortpro.netlify.app',
            currentDomain: window.location.hostname
        })
    };
}

// Fonction globale de diagnostic
window.diagnoseGoogleDirect = function() {
    console.group('🔍 DIAGNOSTIC GOOGLE DIRECT OAuth2 - EmailSortPro');
    
    try {
        const googleDiag = window.googleAuthService.getDiagnosticInfo();
        
        console.log('🔐 GoogleAuthService (Direct):', googleDiag);
        console.log('🌐 Current URL:', window.location.href);
        console.log('🎯 Expected domain:', googleDiag.expectedDomain);
        console.log('✅ Domain match:', googleDiag.domainMatch);
        console.log('🔑 Client ID:', googleDiag.config.clientId);
        console.log('🛡️ Method:', googleDiag.method);
        console.log('📧 Gmail scopes:', googleDiag.config.scopes.filter(s => s.includes('gmail')));
        console.log('🚫 Avoids iframe error:', googleDiag.avoidsiFrameError);
        
        if (googleDiag.tokenInfo) {
            console.log('🎫 Token Info:', googleDiag.tokenInfo);
        }
        
        return googleDiag;
        
    } catch (error) {
        console.error('❌ Diagnostic échec:', error);
        return { error: error.message };
    } finally {
        console.groupEnd();
    }
};

console.log('✅ GoogleAuthService v4.0 - SANS IFRAME pour EmailSortPro - Évite idpiframe_initialization_failed');
