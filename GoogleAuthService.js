// GoogleAuthService.js - Service d'authentification Google Gmail API v2.0 - Corrigé avec vraies infos

class GoogleAuthService {
    constructor() {
        this.gapi = null;
        this.auth2 = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'google';
        
        // Configuration Google OAuth2 RÉELLE
        this.config = {
            clientId: '436941729211-00tc5fdl74l0hc3q1qotfknh0v86h72i.apps.googleusercontent.com',
            clientSecret: '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', // Normalement pas exposé côté client
            scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            discoveryDocs: [
                'https://gmail.googleapis.com/$discovery/rest?version=v1',
                'https://www.googleapis.com/discovery/v1/apis/oauth2/v2/rest'
            ]
        };
        
        console.log('[GoogleAuthService] Constructor called for EmailSortPro Gmail integration');
        this.verifyDomain();
    }

    verifyDomain() {
        const currentDomain = window.location.hostname;
        const isCorrectDomain = currentDomain === this.expectedDomain;
        
        console.log('[GoogleAuthService] Domain verification:', {
            current: currentDomain,
            expected: this.expectedDomain,
            isCorrect: isCorrectDomain,
            origin: window.location.origin
        });
        
        if (!isCorrectDomain && !currentDomain.includes('localhost') && !currentDomain.includes('127.0.0.1')) {
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
            
            // Charger l'API Google si elle n'est pas déjà chargée
            if (!window.gapi) {
                await this.loadGoogleAPI();
            }
            
            console.log('[GoogleAuthService] ✅ Google API library loaded');
            
            // Initialiser l'API Google avec auth2
            await new Promise((resolve, reject) => {
                window.gapi.load('auth2', {
                    callback: () => {
                        console.log('[GoogleAuthService] Auth2 module loaded');
                        resolve();
                    },
                    onerror: (error) => {
                        console.error('[GoogleAuthService] Error loading auth2:', error);
                        reject(new Error('Failed to load Google Auth2 module'));
                    }
                });
            });
            
            console.log('[GoogleAuthService] ✅ Google Auth2 module loaded');
            
            // Initialiser l'authentification avec configuration EmailSortPro
            try {
                this.auth2 = await window.gapi.auth2.init({
                    client_id: this.config.clientId,
                    scope: this.config.scopes.join(' '),
                    hosted_domain: undefined, // Permettre tous les domaines Gmail
                    fetch_basic_profile: true,
                    ux_mode: 'redirect',
                    redirect_uri: `${window.location.origin}/auth-callback.html`
                });
                
                console.log('[GoogleAuthService] ✅ Google Auth2 initialized for EmailSortPro');
                console.log('[GoogleAuthService] Client ID:', this.config.clientId.substring(0, 15) + '...');
                console.log('[GoogleAuthService] Redirect URI:', `${window.location.origin}/auth-callback.html`);
                
            } catch (authError) {
                console.error('[GoogleAuthService] Auth2 initialization error:', authError);
                
                // Gestion des erreurs d'initialisation spécifiques
                if (authError.error === 'popup_blocked_by_browser') {
                    throw new Error('Popups bloqués - Autorisez les popups pour EmailSortPro');
                } else if (authError.error === 'access_denied') {
                    throw new Error('Accès Google refusé - Vérifiez les permissions');
                } else if (authError.error === 'invalid_client') {
                    throw new Error('Client ID Google invalide - Configuration incorrecte');
                } else {
                    throw new Error(`Erreur Google Auth2: ${authError.error || authError.message}`);
                }
            }
            
            // Vérifier si l'utilisateur est déjà connecté
            if (this.auth2.isSignedIn.get()) {
                this.currentUser = this.auth2.currentUser.get();
                const profile = this.currentUser.getBasicProfile();
                console.log('[GoogleAuthService] ✅ User already signed in:', profile.getEmail());
            } else {
                console.log('[GoogleAuthService] No existing Google session');
            }
            
            this.isInitialized = true;
            console.log('[GoogleAuthService] ✅ Initialization completed successfully for EmailSortPro');
            
            return true;

        } catch (error) {
            console.error('[GoogleAuthService] ❌ Initialization failed:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            
            // Gestion d'erreurs spécifiques avec messages pour EmailSortPro
            if (error.message && error.message.includes('origin_mismatch')) {
                console.error('[GoogleAuthService] ORIGIN MISMATCH: Configure', window.location.origin, 'in Google Console');
                if (window.uiManager) {
                    window.uiManager.showToast(
                        `Erreur domaine Google: Configurez ${window.location.origin} dans Google Console pour EmailSortPro`,
                        'error',
                        15000
                    );
                }
            } else if (error.message && error.message.includes('popup_blocked')) {
                if (window.uiManager) {
                    window.uiManager.showToast(
                        'Popup bloqué. Autorisez les popups pour EmailSortPro Gmail et réessayez.',
                        'error',
                        10000
                    );
                }
            } else if (error.message && error.message.includes('invalid_client')) {
                console.error('[GoogleAuthService] INVALID CLIENT - Check configuration');
                if (window.uiManager) {
                    window.uiManager.showToast(
                        'Configuration Google incorrecte pour EmailSortPro. Vérifiez le Client ID.',
                        'error',
                        12000
                    );
                }
            }
            
            throw error;
        }
    }

    async loadGoogleAPI() {
        console.log('[GoogleAuthService] Loading Google API for EmailSortPro...');
        
        return new Promise((resolve, reject) => {
            // Vérifier si l'API est déjà chargée
            if (window.gapi) {
                console.log('[GoogleAuthService] Google API already loaded');
                resolve();
                return;
            }
            
            // Créer le script pour charger l'API Google
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('[GoogleAuthService] ✅ Google API script loaded for EmailSortPro');
                
                // Attendre que gapi soit disponible avec timeout
                let attempts = 0;
                const maxAttempts = 50; // 5 secondes
                
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

    isAuthenticated() {
        const authenticated = this.currentUser !== null && this.isInitialized && 
                            this.auth2 && this.auth2.isSignedIn.get();
        
        console.log('[GoogleAuthService] Authentication check for EmailSortPro:', {
            hasCurrentUser: !!this.currentUser,
            isInitialized: this.isInitialized,
            hasAuth2: !!this.auth2,
            isSignedIn: this.auth2 ? this.auth2.isSignedIn.get() : false,
            result: authenticated,
            provider: this.provider
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
            console.log('[GoogleAuthService] Initiating Google sign-in for EmailSortPro...');
            
            // Configuration pour la connexion
            const signInOptions = {
                scope: this.config.scopes.join(' '),
                prompt: 'select_account'
            };
            
            console.log('[GoogleAuthService] Google sign-in options:', {
                scopes: this.config.scopes,
                clientId: this.config.clientId.substring(0, 15) + '...',
                domain: window.location.hostname,
                origin: window.location.origin
            });
            
            // Utiliser signIn avec options pour EmailSortPro
            this.currentUser = await this.auth2.signIn(signInOptions);
            
            if (this.currentUser) {
                const profile = this.currentUser.getBasicProfile();
                console.log('[GoogleAuthService] ✅ EmailSortPro Google login successful:', profile.getEmail());
                
                // Vérifier les permissions accordées
                const authResponse = this.currentUser.getAuthResponse(true);
                console.log('[GoogleAuthService] Granted scopes for EmailSortPro:', authResponse.scope);
                
                // Vérifier que les scopes Gmail sont bien accordés
                const requiredScopes = ['gmail.readonly', 'gmail.modify'];
                const grantedScopes = authResponse.scope.toLowerCase();
                
                const missingScopes = requiredScopes.filter(scope => !grantedScopes.includes(scope));
                if (missingScopes.length > 0) {
                    console.warn('[GoogleAuthService] Missing required Gmail scopes for EmailSortPro:', missingScopes);
                    if (window.uiManager) {
                        window.uiManager.showToast(
                            'Certaines permissions Gmail manquent. Fonctionnalités limitées.',
                            'warning',
                            8000
                        );
                    }
                }
                
                return this.currentUser;
            } else {
                throw new Error('No user returned from Google sign-in');
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
            if (this.auth2 && this.auth2.isSignedIn.get()) {
                await this.auth2.signOut();
                console.log('[GoogleAuthService] ✅ Google Gmail sign-out successful for EmailSortPro');
            }
            
            this.currentUser = null;
            
        } catch (error) {
            console.error('[GoogleAuthService] Logout error:', error);
            // Force cleanup même en cas d'erreur
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
            
            // Vérifier si le token est encore valide
            if (authResponse && authResponse.access_token) {
                const expiresAt = authResponse.expires_at;
                const now = Date.now();
                
                // Si le token expire dans moins de 5 minutes, le renouveler
                if (expiresAt - now > 5 * 60 * 1000) {
                    console.log('[GoogleAuthService] ✅ Valid Gmail token available for EmailSortPro');
                    return authResponse.access_token;
                } else {
                    console.log('[GoogleAuthService] Gmail token expiring soon, refreshing...');
                }
            }
            
            // Renouveler le token
            const newAuthResponse = await this.currentUser.reloadAuthResponse();
            
            if (newAuthResponse && newAuthResponse.access_token) {
                console.log('[GoogleAuthService] ✅ Gmail token refreshed successfully for EmailSortPro');
                return newAuthResponse.access_token;
            } else {
                throw new Error('No Gmail access token in response');
            }
            
        } catch (error) {
            console.error('[GoogleAuthService] Gmail token acquisition error:', error);
            
            // Si le renouvellement échoue, tenter une reconnexion
            if (error.error === 'immediate_failed') {
                console.log('[GoogleAuthService] Immediate token refresh failed, requiring re-login');
                try {
                    await this.login();
                    const authResponse = this.currentUser.getAuthResponse();
                    return authResponse ? authResponse.access_token : null;
                } catch (loginError) {
                    console.error('[GoogleAuthService] Re-login failed:', loginError);
                    return null;
                }
            }
            
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
                givenName: profile.getGivenName(),
                familyName: profile.getFamilyName(),
                mail: profile.getEmail(),
                userPrincipalName: profile.getEmail(),
                imageUrl: profile.getImageUrl(),
                provider: 'google',
                // Champs additionnels pour EmailSortPro
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
        
        // Reset internal state
        this.currentUser = null;
        this.isInitialized = false;
        this.auth2 = null;
        this.initializationPromise = null;
        
        // Nettoyer le cache Google (si accessible)
        try {
            if (window.gapi && window.gapi.auth2) {
                const authInstance = window.gapi.auth2.getAuthInstance();
                if (authInstance) {
                    authInstance.disconnect();
                }
            }
        } catch (error) {
            console.warn('[GoogleAuthService] Error during Google cleanup:', error);
        }
        
        // Nettoyer le localStorage des tokens Google si possible
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('google') || key.includes('gapi') || key.includes('oauth'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => {
                try {
                    localStorage.removeItem(key);
                    console.log('[GoogleAuthService] Removed Google cache key:', key);
                } catch (e) {
                    console.warn('[GoogleAuthService] Error removing Google key:', key, e);
                }
            });
        } catch (error) {
            console.warn('[GoogleAuthService] Could not clean Google localStorage:', error);
        }
        
        console.log('[GoogleAuthService] ✅ Google Gmail cleanup complete for EmailSortPro');
    }

    // Méthode de diagnostic améliorée pour EmailSortPro
    getDiagnosticInfo() {
        return {
            isInitialized: this.isInitialized,
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
                redirectUri: `${window.location.origin}/auth-callback.html`
            },
            gapiLoaded: !!window.gapi,
            auth2Available: !!(window.gapi && window.gapi.auth2),
            currentUrl: window.location.href,
            hasRequiredScopes: this.currentUser ? this.checkRequiredScopes() : false
        };
    }

    checkRequiredScopes() {
        if (!this.currentUser) return false;
        
        try {
            const authResponse = this.currentUser.getAuthResponse(true);
            const grantedScopes = authResponse.scope.toLowerCase();
            const requiredScopes = ['gmail.readonly', 'gmail.modify', 'userinfo.email'];
            
            return requiredScopes.every(scope => grantedScopes.includes(scope));
        } catch (error) {
            console.warn('[GoogleAuthService] Error checking scopes:', error);
            return false;
        }
    }

    // Test de connexion spécifique Gmail
    async testGmailConnection() {
        console.log('[GoogleAuthService] Testing Gmail API connection for EmailSortPro...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token available for Gmail');
            }

            // Test simple avec l'API Gmail
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
            console.log('[GoogleAuthService] ✅ Gmail API connection test successful for EmailSortPro');
            
            return {
                success: true,
                provider: 'google',
                email: profile.emailAddress,
                messagesTotal: profile.messagesTotal,
                threadsTotal: profile.threadsTotal,
                historyId: profile.historyId
            };

        } catch (error) {
            console.error('[GoogleAuthService] ❌ Gmail API connection test failed:', error);
            return {
                success: false,
                provider: 'google',
                error: error.message
            };
        }
    }
}

// Créer l'instance globale avec gestion d'erreur pour EmailSortPro
try {
    window.googleAuthService = new GoogleAuthService();
    console.log('[GoogleAuthService] ✅ Global EmailSortPro instance created successfully');
} catch (error) {
    console.error('[GoogleAuthService] ❌ Failed to create global instance for EmailSortPro:', error);
    
    // Créer une instance de fallback
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

// Fonction de diagnostic globale pour EmailSortPro
window.diagnoseGoogle = function() {
    console.group('🔍 DIAGNOSTIC GOOGLE GMAIL AUTH DÉTAILLÉ - EmailSortPro');
    
    try {
        const googleDiag = window.googleAuthService.getDiagnosticInfo();
        
        console.log('🔐 GoogleAuthService:', googleDiag);
        console.log('📚 Google API Library:', typeof gapi !== 'undefined' ? 'Available' : 'Missing');
        console.log('🌐 Current URL:', window.location.href);
        console.log('🎯 Expected domain:', googleDiag.expectedDomain);
        console.log('✅ Domain match:', googleDiag.domainMatch);
        console.log('🔑 Client ID:', googleDiag.config.clientId);
        console.log('📧 Gmail scopes:', googleDiag.config.scopes.filter(s => s.includes('gmail')));
        
        // Validation spécifique des origines pour EmailSortPro
        console.log('🔗 Origin Validation:');
        console.log('  Current Origin:', window.location.origin);
        console.log('  Expected Origin:', `https://${googleDiag.expectedDomain}`);
        console.log('  Origin Match:', window.location.origin === `https://${googleDiag.expectedDomain}` ? '✅' : '❌');
        console.log('  Redirect URI:', googleDiag.config.redirectUri);
        
        if (!googleDiag.domainMatch) {
            console.log('🚨 ACTION REQUIRED FOR EMAILSORTPRO:');
            console.log(`  Configure origin in Google Console: ${window.location.origin}`);
            console.log('  Add authorized redirect URI:', googleDiag.config.redirectUri);
        }
        
        if (googleDiag.isSignedIn && !googleDiag.hasRequiredScopes) {
            console.log('⚠️ MISSING GMAIL SCOPES:');
            console.log('  User signed in but missing required Gmail permissions');
            console.log('  Required: gmail.readonly, gmail.modify, userinfo.email');
        }
        
        return googleDiag;
        
    } catch (error) {
        console.error('❌ EmailSortPro Google diagnostic failed:', error);
        return { error: error.message };
    } finally {
        console.groupEnd();
    }
};

// Test de disponibilité de l'API au chargement pour EmailSortPro
setTimeout(() => {
    const currentDomain = window.location.hostname;
    const expectedDomain = 'emailsortpro.netlify.app';
    
    console.log('[GoogleAuthService] Domain check for EmailSortPro:', {
        current: currentDomain,
        expected: expectedDomain,
        match: currentDomain === expectedDomain,
        origin: window.location.origin
    });
    
    if (currentDomain !== expectedDomain && 
        !currentDomain.includes('localhost') && 
        !currentDomain.includes('127.0.0.1')) {
        console.warn('🚨 WARNING: Google OAuth for EmailSortPro not configured for current domain');
        console.warn('Current:', currentDomain);
        console.warn('Expected:', expectedDomain);
        console.warn('Configure in Google Console:', window.location.origin);
    }
    
    console.log('Use diagnoseGoogle() for detailed Gmail diagnostic');
}, 3000);

console.log('✅ GoogleAuthService v2.0 loaded for EmailSortPro - Gmail integration with real API credentials ready');
