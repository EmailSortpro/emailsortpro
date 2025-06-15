// GoogleAuthService.js - Service d'authentification Google Gmail API v3.0 - CORRIGÉ pour EmailSortPro

class GoogleAuthService {
    constructor() {
        this.gapi = null;
        this.auth2 = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'google';
        this.useNewGoogleIdentity = true; // Utiliser la nouvelle API Google Identity
        
        // Configuration Google OAuth2 RÉELLE pour EmailSortPro
        this.config = {
            clientId: '436941729211-00tc5fdl74l0hc3q1qotfknh0v86h72i.apps.googleusercontent.com',
            scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            // Configuration pour la nouvelle API Google Identity Services
            redirectUri: `${window.location.origin}/auth-callback.html`,
            ux_mode: 'redirect' // Utiliser redirect au lieu de popup
        };
        
        console.log('[GoogleAuthService] Constructor called for EmailSortPro Gmail integration');
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
        
        if (!isCorrectDomain && !isLocalhost) {
            console.warn('[GoogleAuthService] ⚠️ Domain mismatch! Google authentication may fail.');
            console.warn('[GoogleAuthService] Google OAuth must be configured for:', this.expectedDomain);
            console.warn('[GoogleAuthService] Current domain:', currentDomain);
        }
    }

    async initialize() {
        console.log('[GoogleAuthService] Initialize called for Gmail...');
        
        if (this.initializationPromise) {
            console.log('[GoogleAuthService] Already initializing, waiting for existing promise...');
            return this.initializationPromise;
        }
        
        if (this.isInitialized) {
            console.log('[GoogleAuthService] Already initialized');
            return Promise.resolve();
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    async _doInitialize() {
        try {
            console.log('[GoogleAuthService] Starting Google API initialization for EmailSortPro...');
            
            // Essayer d'abord la nouvelle API Google Identity Services
            if (this.useNewGoogleIdentity) {
                try {
                    await this.initializeWithNewGoogleIdentity();
                    return;
                } catch (newApiError) {
                    console.warn('[GoogleAuthService] New Google Identity API failed, falling back to legacy GAPI:', newApiError.message);
                    this.useNewGoogleIdentity = false;
                }
            }
            
            // Fallback vers l'ancienne API GAPI
            await this.initializeWithLegacyGAPI();
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Initialization failed:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            
            // Gestion d'erreurs spécifiques
            this.handleInitializationError(error);
            throw error;
        }
    }

    async initializeWithNewGoogleIdentity() {
        console.log('[GoogleAuthService] Trying new Google Identity Services API...');
        
        // Charger la nouvelle API Google Identity Services
        await this.loadGoogleIdentityScript();
        
        if (!window.google || !window.google.accounts) {
            throw new Error('Google Identity Services not loaded');
        }
        
        // Initialiser avec la nouvelle API
        window.google.accounts.id.initialize({
            client_id: this.config.clientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true,
            ux_mode: 'redirect',
            redirect_uri: this.config.redirectUri
        });
        
        console.log('[GoogleAuthService] ✅ New Google Identity Services initialized for EmailSortPro');
        this.isInitialized = true;
    }

    async initializeWithLegacyGAPI() {
        console.log('[GoogleAuthService] Using legacy GAPI approach...');
        
        // Charger l'API Google si elle n'est pas déjà chargée
        if (!window.gapi) {
            await this.loadGoogleAPI();
        }
        
        console.log('[GoogleAuthService] ✅ Google API library loaded');
        
        // Initialiser client:auth2 avec gestion d'erreur améliorée
        await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Google API loading timeout'));
            }, 15000);
            
            window.gapi.load('client:auth2', {
                callback: () => {
                    clearTimeout(timeoutId);
                    console.log('[GoogleAuthService] GAPI client:auth2 loaded');
                    resolve();
                },
                onerror: (error) => {
                    clearTimeout(timeoutId);
                    console.error('[GoogleAuthService] Error loading GAPI client:auth2:', error);
                    reject(new Error('Failed to load Google client:auth2 module'));
                }
            });
        });
        
        // Initialiser l'authentification avec configuration robuste
        try {
            await window.gapi.client.init({
                clientId: this.config.clientId,
                scope: this.config.scopes.join(' '),
                // NE PAS utiliser apiKey pour éviter les restrictions
                plugin_name: 'EmailSortPro' // Éviter les erreurs de dépréciation
            });
            
            // Obtenir l'instance auth2
            this.auth2 = window.gapi.auth2.getAuthInstance();
            
            if (!this.auth2) {
                throw new Error('Failed to get Google Auth2 instance');
            }
            
            console.log('[GoogleAuthService] ✅ Legacy GAPI Auth2 initialized for EmailSortPro');
            
            // Vérifier si l'utilisateur est déjà connecté
            if (this.auth2.isSignedIn.get()) {
                this.currentUser = this.auth2.currentUser.get();
                const profile = this.currentUser.getBasicProfile();
                console.log('[GoogleAuthService] ✅ User already signed in:', profile.getEmail());
            } else {
                console.log('[GoogleAuthService] No existing Google session');
            }
            
            this.isInitialized = true;
            
        } catch (authError) {
            console.error('[GoogleAuthService] Auth2 initialization error:', authError);
            
            // Gestion spécifique de l'erreur idpiframe_initialization_failed
            if (authError.error === 'idpiframe_initialization_failed') {
                console.warn('[GoogleAuthService] idpiframe_initialization_failed detected - trying alternative approach');
                
                // Essayer une approche alternative sans iframe
                try {
                    await this.initializeWithoutIframe();
                } catch (iframeError) {
                    throw new Error('Google Auth initialization failed - cookies tiers possiblement bloqués');
                }
            } else {
                throw authError;
            }
        }
    }

    async initializeWithoutIframe() {
        console.log('[GoogleAuthService] Trying initialization without iframe...');
        
        // Approche alternative utilisant OAuth2 direct
        this.auth2 = {
            isSignedIn: {
                get: () => false,
                listen: () => {}
            },
            signIn: this.directOAuth2SignIn.bind(this),
            signOut: this.directOAuth2SignOut.bind(this)
        };
        
        this.isInitialized = true;
        console.log('[GoogleAuthService] ✅ Alternative initialization without iframe successful');
    }

    async directOAuth2SignIn() {
        console.log('[GoogleAuthService] Direct OAuth2 sign-in...');
        
        const authUrl = this.buildOAuth2Url();
        console.log('[GoogleAuthService] Redirecting to Google OAuth2:', authUrl);
        
        // Rediriger vers Google OAuth2
        window.location.href = authUrl;
    }

    buildOAuth2Url() {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scopes.join(' '),
            response_type: 'code',
            access_type: 'offline',
            prompt: 'consent',
            state: 'google_auth_' + Date.now()
        });
        
        return `https://accounts.google.com/oauth/authorize?${params.toString()}`;
    }

    async directOAuth2SignOut() {
        console.log('[GoogleAuthService] Direct OAuth2 sign-out...');
        this.currentUser = null;
        
        // Nettoyer les tokens locaux
        this.clearLocalTokens();
    }

    clearLocalTokens() {
        try {
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
            console.warn('[GoogleAuthService] Error clearing local tokens:', error);
        }
    }

    async loadGoogleIdentityScript() {
        console.log('[GoogleAuthService] Loading Google Identity Services script...');
        
        return new Promise((resolve, reject) => {
            if (window.google && window.google.accounts) {
                console.log('[GoogleAuthService] Google Identity Services already loaded');
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('[GoogleAuthService] ✅ Google Identity Services script loaded');
                
                // Attendre que google.accounts soit disponible
                let attempts = 0;
                const checkIdentity = () => {
                    attempts++;
                    if (window.google && window.google.accounts) {
                        resolve();
                    } else if (attempts < 50) {
                        setTimeout(checkIdentity, 100);
                    } else {
                        reject(new Error('Google Identity Services not available after timeout'));
                    }
                };
                checkIdentity();
            };
            
            script.onerror = (error) => {
                console.error('[GoogleAuthService] ❌ Failed to load Google Identity Services script:', error);
                reject(new Error('Failed to load Google Identity Services for EmailSortPro'));
            };
            
            document.head.appendChild(script);
        });
    }

    async loadGoogleAPI() {
        console.log('[GoogleAuthService] Loading legacy Google API...');
        
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                console.log('[GoogleAuthService] Google API already loaded');
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('[GoogleAuthService] ✅ Google API script loaded');
                
                let attempts = 0;
                const maxAttempts = 50;
                
                const checkGapi = () => {
                    attempts++;
                    if (window.gapi) {
                        console.log('[GoogleAuthService] ✅ Google API (gapi) available');
                        resolve();
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkGapi, 100);
                    } else {
                        reject(new Error('Google API (gapi) not available after timeout'));
                    }
                };
                checkGapi();
            };
            
            script.onerror = (error) => {
                console.error('[GoogleAuthService] ❌ Failed to load Google API script:', error);
                reject(new Error('Failed to load Google API for EmailSortPro'));
            };
            
            document.head.appendChild(script);
        });
    }

    handleCredentialResponse(response) {
        console.log('[GoogleAuthService] Credential response received:', response);
        
        // Traiter la réponse de la nouvelle API Google Identity
        if (response.credential) {
            // Décoder le JWT token
            try {
                const payload = this.parseJWT(response.credential);
                this.currentUser = {
                    getBasicProfile: () => ({
                        getId: () => payload.sub,
                        getName: () => payload.name,
                        getEmail: () => payload.email,
                        getImageUrl: () => payload.picture
                    }),
                    getAuthResponse: () => ({
                        access_token: response.credential,
                        expires_at: payload.exp * 1000
                    })
                };
                
                console.log('[GoogleAuthService] ✅ User authenticated with new Google Identity API');
                
                // Notifier l'application
                if (window.onAuthSuccess) {
                    window.onAuthSuccess();
                }
                
            } catch (parseError) {
                console.error('[GoogleAuthService] Error parsing JWT:', parseError);
            }
        }
    }

    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('[GoogleAuthService] JWT parsing error:', error);
            throw error;
        }
    }

    handleInitializationError(error) {
        let userMessage = 'Erreur de configuration Google pour EmailSortPro';
        
        if (error.message && error.message.includes('idpiframe_initialization_failed')) {
            userMessage = 'Cookies tiers bloqués ou domaine non autorisé. Vérifiez votre navigateur.';
            
            if (window.uiManager) {
                window.uiManager.showToast(
                    'Erreur Google: Cookies tiers possiblement bloqués. Autorisez les cookies pour accounts.google.com',
                    'warning',
                    15000
                );
            }
        } else if (error.message && error.message.includes('origin_mismatch')) {
            console.error('[GoogleAuthService] ORIGIN MISMATCH: Configure', window.location.origin, 'in Google Console');
            userMessage = `Erreur domaine Google: Configurez ${window.location.origin} dans Google Console`;
        } else if (error.message && error.message.includes('invalid_client')) {
            console.error('[GoogleAuthService] INVALID CLIENT - Check configuration');
            userMessage = 'Configuration Google incorrecte pour EmailSortPro. Vérifiez le Client ID.';
        }
        
        if (window.uiManager) {
            window.uiManager.showToast(userMessage, 'error', 12000);
        }
    }

    isAuthenticated() {
        if (this.useNewGoogleIdentity) {
            return this.currentUser !== null && this.isInitialized;
        }
        
        const authenticated = this.currentUser !== null && this.isInitialized && 
                            this.auth2 && this.auth2.isSignedIn.get();
        
        console.log('[GoogleAuthService] Authentication check for EmailSortPro:', {
            hasCurrentUser: !!this.currentUser,
            isInitialized: this.isInitialized,
            hasAuth2: !!this.auth2,
            isSignedIn: this.auth2 ? this.auth2.isSignedIn.get() : false,
            result: authenticated,
            provider: this.provider,
            useNewAPI: this.useNewGoogleIdentity
        });
        
        return authenticated;
    }

    getAccount() {
        if (!this.currentUser) return null;
        
        try {
            const profile = this.currentUser.getBasicProfile();
            return {
                id: profile.getId(),
                name: profile.getName(),
                email: profile.getEmail(),
                imageUrl: profile.getImageUrl(),
                provider: 'google',
                // Format compatible avec Microsoft pour l'unification
                username: profile.getEmail(),
                displayName: profile.getName(),
                mail: profile.getEmail(),
                userPrincipalName: profile.getEmail()
            };
        } catch (error) {
            console.error('[GoogleAuthService] Error getting account info:', error);
            return null;
        }
    }

    async login() {
        console.log('[GoogleAuthService] Google Gmail login attempt started for EmailSortPro...');
        
        if (!this.isInitialized) {
            console.log('[GoogleAuthService] Not initialized, initializing first...');
            await this.initialize();
        }

        try {
            if (this.useNewGoogleIdentity) {
                // Utiliser la nouvelle API Google Identity
                console.log('[GoogleAuthService] Using new Google Identity Services for login...');
                
                window.google.accounts.id.prompt((notification) => {
                    console.log('[GoogleAuthService] Google Identity prompt result:', notification);
                    
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // Fallback vers OAuth2 classique
                        console.log('[GoogleAuthService] Prompt failed, using OAuth2 flow...');
                        this.directOAuth2SignIn();
                    }
                });
                
                return Promise.resolve();
                
            } else {
                // Utiliser l'ancienne API GAPI
                console.log('[GoogleAuthService] Using legacy GAPI for login...');
                
                const signInOptions = {
                    scope: this.config.scopes.join(' '),
                    prompt: 'select_account'
                };
                
                this.currentUser = await this.auth2.signIn(signInOptions);
                
                if (this.currentUser) {
                    const profile = this.currentUser.getBasicProfile();
                    console.log('[GoogleAuthService] ✅ EmailSortPro Google login successful:', profile.getEmail());
                    return this.currentUser;
                } else {
                    throw new Error('No user returned from Google sign-in');
                }
            }
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ EmailSortPro Google login error:', error);
            
            let userMessage = 'Erreur de connexion Gmail pour EmailSortPro';
            
            if (error.error) {
                const errorCode = error.error;
                console.log('[GoogleAuthService] Google Error code:', errorCode);
                
                switch (errorCode) {
                    case 'popup_closed_by_user':
                        userMessage = 'Connexion Gmail annulée par l\'utilisateur.';
                        break;
                    case 'access_denied':
                        userMessage = 'Accès Gmail refusé. Veuillez accepter les permissions pour EmailSortPro.';
                        break;
                    case 'popup_blocked_by_browser':
                        userMessage = 'Popup bloqué. Autorisez les popups pour EmailSortPro et réessayez.';
                        break;
                    case 'immediate_failed':
                        userMessage = 'Connexion silencieuse Gmail échouée. Reconnexion nécessaire.';
                        break;
                    case 'invalid_client':
                        userMessage = 'Configuration Google incorrecte pour EmailSortPro. Contactez le support.';
                        break;
                    case 'redirect_uri_mismatch':
                        userMessage = 'URI de redirection Google incorrecte pour EmailSortPro.';
                        break;
                    default:
                        userMessage = `Erreur Google Gmail: ${errorCode}`;
                }
            } else if (error.message) {
                if (error.message.includes('popup')) {
                    userMessage = 'Problème de popup. Autorisez les popups pour EmailSortPro Gmail.';
                } else if (error.message.includes('network')) {
                    userMessage = 'Erreur réseau Gmail. Vérifiez votre connexion.';
                } else if (error.message.includes('origin')) {
                    userMessage = 'Erreur de domaine. EmailSortPro doit être configuré dans Google Console.';
                } else if (error.message.includes('cookies')) {
                    userMessage = 'Cookies tiers bloqués. Autorisez les cookies pour accounts.google.com';
                }
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(userMessage, 'error', 10000);
            }
            
            throw error;
        }
    }

    async logout() {
        console.log('[GoogleAuthService] Google Gmail logout initiated for EmailSortPro...');
        
        try {
            if (this.useNewGoogleIdentity) {
                // Déconnexion avec nouvelle API
                if (window.google && window.google.accounts) {
                    window.google.accounts.id.disableAutoSelect();
                }
            } else {
                // Déconnexion avec ancienne API
                if (this.auth2 && this.auth2.isSignedIn.get()) {
                    await this.auth2.signOut();
                    console.log('[GoogleAuthService] ✅ Google Gmail sign-out successful for EmailSortPro');
                }
            }
            
            this.currentUser = null;
            this.clearLocalTokens();
            
        } catch (error) {
            console.error('[GoogleAuthService] Logout error:', error);
            this.forceCleanup();
        }
    }

    async getAccessToken() {
        if (!this.isAuthenticated()) {
            console.warn('[GoogleAuthService] Not authenticated for token request');
            return null;
        }

        try {
            const authResponse = this.currentUser.getAuthResponse();
            
            if (authResponse && authResponse.access_token) {
                const expiresAt = authResponse.expires_at;
                const now = Date.now();
                
                if (expiresAt - now > 5 * 60 * 1000) {
                    console.log('[GoogleAuthService] ✅ Valid Gmail token available for EmailSortPro');
                    return authResponse.access_token;
                } else {
                    console.log('[GoogleAuthService] Gmail token expiring soon, refreshing...');
                }
            }
            
            // Renouveler le token
            if (!this.useNewGoogleIdentity && this.currentUser.reloadAuthResponse) {
                const newAuthResponse = await this.currentUser.reloadAuthResponse();
                
                if (newAuthResponse && newAuthResponse.access_token) {
                    console.log('[GoogleAuthService] ✅ Gmail token refreshed successfully for EmailSortPro');
                    return newAuthResponse.access_token;
                }
            }
            
            throw new Error('No Gmail access token available');
            
        } catch (error) {
            console.error('[GoogleAuthService] Gmail token acquisition error:', error);
            return null;
        }
    }

    async getUserInfo() {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated with Google Gmail');
        }

        try {
            const profile = this.currentUser.getBasicProfile();
            
            const userInfo = {
                id: profile.getId(),
                displayName: profile.getName(),
                givenName: profile.getGivenName ? profile.getGivenName() : profile.getName().split(' ')[0],
                familyName: profile.getFamilyName ? profile.getFamilyName() : profile.getName().split(' ').slice(1).join(' '),
                mail: profile.getEmail(),
                userPrincipalName: profile.getEmail(),
                imageUrl: profile.getImageUrl(),
                provider: 'google',
                username: profile.getEmail(),
                name: profile.getName(),
                email: profile.getEmail()
            };
            
            console.log('[GoogleAuthService] ✅ Gmail user info retrieved for EmailSortPro:', userInfo.displayName);
            return userInfo;

        } catch (error) {
            console.error('[GoogleAuthService] Error getting Gmail user info:', error);
            throw error;
        }
    }

    async reset() {
        console.log('[GoogleAuthService] Resetting Google Gmail authentication for EmailSortPro...');
        
        try {
            if (this.auth2 && this.auth2.isSignedIn.get()) {
                await this.auth2.signOut();
            }
        } catch (error) {
            console.warn('[GoogleAuthService] Silent logout failed during reset:', error);
        }

        this.forceCleanup();
    }

    forceCleanup() {
        console.log('[GoogleAuthService] Force cleanup initiated for EmailSortPro...');
        
        this.currentUser = null;
        this.isInitialized = false;
        this.auth2 = null;
        this.initializationPromise = null;
        
        // Nettoyer les instances Google
        try {
            if (this.useNewGoogleIdentity && window.google && window.google.accounts) {
                window.google.accounts.id.cancel();
                window.google.accounts.id.disableAutoSelect();
            }
            
            if (!this.useNewGoogleIdentity && window.gapi && window.gapi.auth2) {
                const authInstance = window.gapi.auth2.getAuthInstance();
                if (authInstance) {
                    authInstance.disconnect();
                }
            }
        } catch (error) {
            console.warn('[GoogleAuthService] Error during Google cleanup:', error);
        }
        
        this.clearLocalTokens();
        
        console.log('[GoogleAuthService] ✅ Google Gmail cleanup complete for EmailSortPro');
    }

    getDiagnosticInfo() {
        return {
            isInitialized: this.isInitialized,
            useNewGoogleIdentity: this.useNewGoogleIdentity,
            hasCurrentUser: !!this.currentUser,
            hasAuth2: !!this.auth2,
            isSignedIn: this.auth2 ? this.auth2.isSignedIn.get() : false,
            userEmail: this.currentUser ? this.currentUser.getBasicProfile().getEmail() : null,
            expectedDomain: this.expectedDomain,
            currentDomain: window.location.hostname,
            domainMatch: window.location.hostname === this.expectedDomain,
            provider: this.provider,
            config: {
                clientId: this.config.clientId.substring(0, 15) + '...',
                scopes: this.config.scopes,
                origin: window.location.origin,
                redirectUri: this.config.redirectUri
            },
            gapiLoaded: !!window.gapi,
            googleIdentityLoaded: !!(window.google && window.google.accounts),
            auth2Available: !!(window.gapi && window.gapi.auth2),
            currentUrl: window.location.href
        };
    }
}

// Créer l'instance globale avec gestion d'erreur améliorée
try {
    window.googleAuthService = new GoogleAuthService();
    console.log('[GoogleAuthService] ✅ Global EmailSortPro instance created successfully');
} catch (error) {
    console.error('[GoogleAuthService] ❌ Failed to create global instance for EmailSortPro:', error);
    
    window.googleAuthService = {
        isInitialized: false,
        provider: 'google',
        initialize: () => Promise.reject(new Error('GoogleAuthService failed to initialize for EmailSortPro: ' + error.message)),
        login: () => Promise.reject(new Error('GoogleAuthService not available for EmailSortPro: ' + error.message)),
        isAuthenticated: () => false,
        getDiagnosticInfo: () => ({ 
            error: 'GoogleAuthService failed to create for EmailSortPro: ' + error.message,
            expectedDomain: 'emailsortpro.netlify.app',
            currentDomain: window.location.hostname,
            clientId: '436941729211-00tc5fdl74l0hc3q1qotfknh0v86h72i.apps.googleusercontent.com'
        })
    };
}

console.log('✅ GoogleAuthService v3.0 loaded for EmailSortPro - CORRIGÉ avec fallbacks multiples');
