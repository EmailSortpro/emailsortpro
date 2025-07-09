// GoogleAuthService.js - Service Google SÉCURISÉ pour EmailSortPro v4.4
// CORRECTION: Rechargement automatique de l'utilisateur depuis le token en cache

class GoogleAuthService {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'google';
        
        // Configuration Google OAuth2 SÉCURISÉE - SANS CLIENT SECRET
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
        
        console.log('[GoogleAuthService] Constructor - Version SÉCURISÉE v4.4');
        console.log('[GoogleAuthService] 🔒 Security Mode: NO CLIENT SECRET');
        console.log('[GoogleAuthService] 🚀 Scan Mode: UNLIMITED');
        this.verifyDomain();
        
        // NOUVEAU: Auto-initialisation pour recharger l'utilisateur
        this.autoInitialize();
    }

    // NOUVEAU: Auto-initialisation au démarrage
    async autoInitialize() {
        console.log('[GoogleAuthService] Auto-initializing...');
        try {
            await this.initialize();
            
            // Si on a un token valide mais pas d'utilisateur, le recharger
            const cachedToken = this.getCachedToken();
            if (cachedToken && this.isTokenValid(cachedToken) && !this.currentUser) {
                console.log('[GoogleAuthService] Reloading user from valid token...');
                await this.loadUserInfoFromToken(cachedToken.access_token);
                
                // IMPORTANT: Marquer comme provider actif si on a réussi
                if (this.currentUser) {
                    sessionStorage.setItem('lastAuthProvider', 'google');
                    console.log('[GoogleAuthService] ✅ User reloaded successfully:', this.currentUser.email);
                }
            }
        } catch (error) {
            console.warn('[GoogleAuthService] Auto-init warning:', error);
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
            isLocalhost: isLocalhost,
            origin: window.location.origin,
            securityMode: 'SECURE',
            scanMode: 'UNLIMITED'
        });
    }

    async initialize() {
        console.log('[GoogleAuthService] Initialize - Starting...');
        
        if (this.initializationPromise) {
            console.log('[GoogleAuthService] Already initializing, returning existing promise');
            return this.initializationPromise;
        }
        
        if (this.isInitialized) {
            console.log('[GoogleAuthService] Already initialized');
            return Promise.resolve(true);
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    async _doInitialize() {
        try {
            console.log('[GoogleAuthService] Initialisation OAuth2 sécurisée...');
            
            // Vérifier s'il y a un token en cache AVANT de marquer comme initialisé
            const cachedToken = this.getCachedToken();
            if (cachedToken && this.isTokenValid(cachedToken)) {
                console.log('[GoogleAuthService] Valid token found in cache');
                
                try {
                    // Charger les infos utilisateur depuis le token
                    await this.loadUserInfoFromToken(cachedToken.access_token);
                    console.log('[GoogleAuthService] ✅ User loaded from cached token');
                    
                    // Marquer Google comme provider actif
                    sessionStorage.setItem('lastAuthProvider', 'google');
                } catch (error) {
                    console.warn('[GoogleAuthService] Failed to load user from cached token:', error);
                    // Ne pas échouer l'initialisation pour autant
                }
            } else {
                console.log('[GoogleAuthService] No valid token in cache');
            }
            
            // Marquer comme initialisé APRÈS avoir tenté de charger l'utilisateur
            this.isInitialized = true;
            
            console.log('[GoogleAuthService] ✅ Initialization complete');
            return true;
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Initialization error:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    isAuthenticated() {
        const hasCurrentUser = this.currentUser !== null;
        const hasValidToken = this.hasValidCachedToken();
        const isInit = this.isInitialized;
        const authenticated = hasCurrentUser && isInit && hasValidToken;
        
        console.log('[GoogleAuthService] Authentication check:', {
            hasCurrentUser,
            hasValidToken,
            isInitialized: isInit,
            result: authenticated,
            userEmail: this.currentUser?.email,
            provider: this.provider
        });
        
        return authenticated;
    }

    hasValidCachedToken() {
        const cachedToken = this.getCachedToken();
        const isValid = cachedToken && this.isTokenValid(cachedToken);
        return isValid;
    }

    getAccount() {
        if (!this.isAuthenticated()) {
            console.log('[GoogleAuthService] getAccount: Not authenticated');
            return null;
        }
        
        if (!this.currentUser) {
            console.log('[GoogleAuthService] getAccount: No current user');
            return null;
        }
        
        const account = {
            id: this.currentUser.sub || this.currentUser.id,
            name: this.currentUser.name,
            email: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: 'google',
            // Format compatible Microsoft
            username: this.currentUser.email,
            displayName: this.currentUser.name,
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email,
            // Capacités de scan
            scanCapabilities: {
                unlimited: true,
                maxEmails: this.scanLimits.maxEmails,
                batchSize: this.scanLimits.batchSize
            }
        };
        
        console.log('[GoogleAuthService] getAccount returning:', account.email);
        return account;
    }

    async login() {
        console.log('[GoogleAuthService] Login OAuth2 SÉCURISÉ...');
        
        // S'assurer que le service est initialisé
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            // Marquer Google comme provider actif AVANT la redirection
            sessionStorage.setItem('lastAuthProvider', 'google');
            
            // Construire l'URL OAuth2 sécurisée (flow implicit)
            const authUrl = this.buildSecureOAuth2Url();
            
            console.log('[GoogleAuthService] 🔒 Redirecting to Google OAuth2...');
            
            // Afficher message à l'utilisateur
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Redirection vers Google Gmail...',
                    'info',
                    3000
                );
            }
            
            // Rediriger vers Google OAuth2
            window.location.href = authUrl;
            
            // Cette promesse ne se résoudra jamais car on redirige
            return new Promise(() => {});
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Login error:', error);
            
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

    buildSecureOAuth2Url() {
        const state = 'google_auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Sauvegarder l'état pour validation
        sessionStorage.setItem('google_oauth_state', state);
        
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scopes.join(' '),
            response_type: 'token', // Flow implicit
            access_type: 'online',
            prompt: 'select_account',
            state: state
        });
        
        console.log('[GoogleAuthService] OAuth2 URL built');
        
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async handleOAuthCallback(fragment) {
        console.log('[GoogleAuthService] Processing OAuth2 callback...');
        
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
            
            console.log('[GoogleAuthService] Token received');
            
            // Charger les informations utilisateur
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
            
            console.log('[GoogleAuthService] ✅ OAuth2 authentication successful');
            return true;
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ OAuth2 callback error:', error);
            throw error;
        } finally {
            sessionStorage.removeItem('google_oauth_state');
        }
    }

    async loadUserInfoFromToken(accessToken) {
        console.log('[GoogleAuthService] Loading user info...');
        
        if (!accessToken) {
            throw new Error('No access token provided');
        }
        
        const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v2/userinfo';
        
        try {
            const response = await fetch(userInfoEndpoint, {
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
            
            // Sauvegarder les infos utilisateur en session
            sessionStorage.setItem('google_user_info', JSON.stringify(userInfo));
            
            console.log('[GoogleAuthService] ✅ User info loaded:', userInfo.email);
            
            return userInfo;
            
        } catch (error) {
            console.error('[GoogleAuthService] Error loading user info:', error);
            throw error;
        }
    }

    saveToken(tokenData) {
        try {
            const tokenInfo = {
                access_token: tokenData.access_token,
                expires_at: tokenData.expires_at || (Date.now() + (tokenData.expires_in * 1000)),
                token_type: tokenData.token_type || 'Bearer',
                created_at: Date.now(),
                flow_type: 'implicit_secure',
                scan_capabilities: this.scanLimits
            };
            
            localStorage.setItem('google_token_emailsortpro', JSON.stringify(tokenInfo));
            console.log('[GoogleAuthService] Token saved');
        } catch (error) {
            console.warn('[GoogleAuthService] Error saving token:', error);
        }
    }

    getCachedToken() {
        try {
            const tokenStr = localStorage.getItem('google_token_emailsortpro');
            if (tokenStr) {
                return JSON.parse(tokenStr);
            }
        } catch (error) {
            console.warn('[GoogleAuthService] Error reading cached token:', error);
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
        // S'assurer que le service est initialisé
        if (!this.isInitialized) {
            await this.initialize();
        }

        const cachedToken = this.getCachedToken();
        if (cachedToken && this.isTokenValid(cachedToken)) {
            return cachedToken.access_token;
        }
        
        console.warn('[GoogleAuthService] No valid token available');
        
        // Si on a un utilisateur mais pas de token valide, forcer la reconnexion
        if (this.currentUser) {
            console.log('[GoogleAuthService] User exists but token invalid, clearing user');
            this.currentUser = null;
            sessionStorage.removeItem('google_user_info');
        }
        
        return null;
    }

    async getUserInfo() {
        if (!this.isAuthenticated()) {
            // Tenter de recharger depuis le cache
            const cachedUserStr = sessionStorage.getItem('google_user_info');
            if (cachedUserStr) {
                try {
                    this.currentUser = JSON.parse(cachedUserStr);
                    console.log('[GoogleAuthService] User restored from session cache');
                } catch (e) {
                    console.warn('[GoogleAuthService] Failed to parse cached user info');
                }
            }
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated with Google');
            }
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
            email: this.currentUser.email,
            scanCapabilities: {
                unlimited: true,
                ...this.scanLimits
            }
        };
        
        return userInfo;
    }

    async logout() {
        console.log('[GoogleAuthService] Logging out...');
        
        try {
            // Révoquer le token si possible
            const cachedToken = this.getCachedToken();
            if (cachedToken && cachedToken.access_token) {
                try {
                    await fetch(`https://oauth2.googleapis.com/revoke?token=${cachedToken.access_token}`, {
                        method: 'POST'
                    });
                    console.log('[GoogleAuthService] Token revoked');
                } catch (revokeError) {
                    console.warn('[GoogleAuthService] Token revocation error:', revokeError);
                }
            }
            
            // Nettoyer les données
            this.forceCleanup();
            
            console.log('[GoogleAuthService] ✅ Logout complete');
            
        } catch (error) {
            console.error('[GoogleAuthService] Logout error:', error);
            this.forceCleanup();
        }
    }

    async reset() {
        console.log('[GoogleAuthService] Resetting...');
        this.forceCleanup();
    }

    forceCleanup() {
        console.log('[GoogleAuthService] Force cleanup...');
        
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        
        try {
            // Nettoyer le stockage
            localStorage.removeItem('google_token_emailsortpro');
            sessionStorage.removeItem('google_oauth_state');
            sessionStorage.removeItem('google_user_info');
            
            // Si Google était le dernier provider, le supprimer
            if (sessionStorage.getItem('lastAuthProvider') === 'google') {
                sessionStorage.removeItem('lastAuthProvider');
            }
            
            // Nettoyer autres clés Google
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('google_token') || key.includes('google_auth'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            console.log('[GoogleAuthService] Cleanup complete');
        } catch (error) {
            console.warn('[GoogleAuthService] Cleanup error:', error);
        }
    }

    getScanLimits() {
        return {
            ...this.scanLimits,
            provider: 'google',
            unlimited: true
        };
    }

    adjustScanLimits(options = {}) {
        if (options.batchSize && options.batchSize > 0) {
            this.scanLimits.batchSize = Math.min(options.batchSize, 500);
        }
        
        if (options.rateLimitDelay && options.rateLimitDelay >= 0) {
            this.scanLimits.rateLimitDelay = options.rateLimitDelay;
        }
        
        console.log('[GoogleAuthService] Scan limits adjusted:', this.scanLimits);
        return this.scanLimits;
    }

    getDiagnosticInfo() {
        const cachedToken = this.getCachedToken();
        const cachedUserInfo = sessionStorage.getItem('google_user_info');
        
        return {
            isInitialized: this.isInitialized,
            hasCurrentUser: !!this.currentUser,
            userEmail: this.currentUser?.email || 'No user',
            expectedDomain: this.expectedDomain,
            currentDomain: window.location.hostname,
            domainMatch: window.location.hostname === this.expectedDomain,
            provider: this.provider,
            method: 'OAuth2 Implicit Flow (NO CLIENT SECRET)',
            securityMode: 'SECURE_NO_CLIENT_SECRET',
            scanMode: 'UNLIMITED',
            scanLimits: this.scanLimits,
            isAuthenticated: this.isAuthenticated(),
            lastAuthProvider: sessionStorage.getItem('lastAuthProvider'),
            hasCachedUserInfo: !!cachedUserInfo,
            config: {
                clientId: this.config.clientId.substring(0, 15) + '...',
                hasClientSecret: false,
                scopes: this.config.scopes,
                origin: window.location.origin,
                redirectUri: this.config.redirectUri,
                responseType: this.config.responseType
            },
            tokenInfo: cachedToken ? {
                hasToken: !!cachedToken.access_token,
                isValid: this.isTokenValid(cachedToken),
                expiresAt: cachedToken.expires_at ? new Date(cachedToken.expires_at).toISOString() : null,
                flowType: cachedToken.flow_type || 'unknown',
                createdAt: cachedToken.created_at ? new Date(cachedToken.created_at).toISOString() : null
            } : null,
            currentUrl: window.location.href
        };
    }

    async testGmailConnection() {
        console.log('[GoogleAuthService] Testing Gmail API connection...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
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
            console.log('[GoogleAuthService] ✅ Gmail API test successful');
            
            return {
                success: true,
                provider: 'google',
                email: profile.emailAddress,
                messagesTotal: profile.messagesTotal,
                threadsTotal: profile.threadsTotal,
                securityMode: 'SECURE',
                scanMode: 'UNLIMITED',
                scanLimits: this.scanLimits
            };

        } catch (error) {
            console.error('[GoogleAuthService] ❌ Gmail API test failed:', error);
            return {
                success: false,
                provider: 'google',
                error: error.message,
                securityMode: 'SECURE',
                scanMode: 'FAILED'
            };
        }
    }
}

// Créer l'instance globale
try {
    window.googleAuthService = new GoogleAuthService();
    console.log('[GoogleAuthService] ✅ Instance created - v4.4');
} catch (error) {
    console.error('[GoogleAuthService] ❌ Failed to create instance:', error);
    
    window.googleAuthService = {
        isInitialized: false,
        provider: 'google',
        initialize: () => Promise.resolve(),
        login: () => Promise.reject(new Error('GoogleAuthService unavailable')),
        isAuthenticated: () => false,
        getScanLimits: () => ({ unlimited: false, maxEmails: 0 }),
        getDiagnosticInfo: () => ({ 
            error: 'GoogleAuthService failed: ' + error.message,
            provider: 'google'
        })
    };
}

console.log('✅ GoogleAuthService v4.4 loaded');
console.log('🔒 Security Mode: OAuth2 Implicit Flow (NO CLIENT SECRET)');
console.log('🚀 Scan Mode: UNLIMITED');
