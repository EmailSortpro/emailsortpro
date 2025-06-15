// GoogleAuthService.js - Service d'authentification Google Gmail API v1.0

class GoogleAuthService {
    constructor() {
        this.gapi = null;
        this.auth2 = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        
        // Configuration Google OAuth2
        this.config = {
            clientId: '436941729211-00tc5fdl74l0hc3q1qotfknh0v86h72i.apps.googleusercontent.com',
            scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            discoveryDocs: [
                'https://gmail.googleapis.com/$discovery/rest?version=v1'
            ]
        };
        
        console.log('[GoogleAuthService] Constructor called for Gmail integration');
        this.verifyDomain();
    }

    verifyDomain() {
        const currentDomain = window.location.hostname;
        const isCorrectDomain = currentDomain === this.expectedDomain;
        
        console.log('[GoogleAuthService] Domain verification:', {
            current: currentDomain,
            expected: this.expectedDomain,
            isCorrect: isCorrectDomain
        });
        
        if (!isCorrectDomain && !currentDomain.includes('localhost') && !currentDomain.includes('127.0.0.1')) {
            console.warn('[GoogleAuthService] ⚠️ Domain mismatch! Google authentication may fail.');
            console.warn('[GoogleAuthService] Google OAuth must be configured for:', this.expectedDomain);
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
            console.log('[GoogleAuthService] Starting Google API initialization...');
            
            // Charger l'API Google si elle n'est pas déjà chargée
            if (!window.gapi) {
                await this.loadGoogleAPI();
            }
            
            console.log('[GoogleAuthService] ✅ Google API library loaded');
            
            // Initialiser l'API Google
            await new Promise((resolve, reject) => {
                window.gapi.load('auth2', {
                    callback: resolve,
                    onerror: reject
                });
            });
            
            console.log('[GoogleAuthService] ✅ Google Auth2 module loaded');
            
            // Initialiser l'authentification
            this.auth2 = await window.gapi.auth2.init({
                client_id: this.config.clientId,
                scope: this.config.scopes.join(' '),
                hosted_domain: undefined // Permettre tous les domaines
            });
            
            console.log('[GoogleAuthService] ✅ Google Auth2 initialized');
            
            // Vérifier si l'utilisateur est déjà connecté
            if (this.auth2.isSignedIn.get()) {
                this.currentUser = this.auth2.currentUser.get();
                console.log('[GoogleAuthService] ✅ User already signed in:', this.currentUser.getBasicProfile().getEmail());
            }
            
            this.isInitialized = true;
            console.log('[GoogleAuthService] ✅ Initialization completed successfully');
            
            return true;

        } catch (error) {
            console.error('[GoogleAuthService] ❌ Initialization failed:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            
            // Gestion d'erreurs spécifiques
            if (error.message && error.message.includes('origin_mismatch')) {
                console.error('[GoogleAuthService] ORIGIN MISMATCH: Configure', window.location.origin, 'in Google Console');
                if (window.uiManager) {
                    window.uiManager.showToast(
                        `Erreur domaine Google: Configurez ${window.location.origin} dans Google Console`,
                        'error',
                        15000
                    );
                }
            } else if (error.message && error.message.includes('popup_blocked')) {
                if (window.uiManager) {
                    window.uiManager.showToast(
                        'Popup bloqué. Autorisez les popups pour Gmail et réessayez.',
                        'error',
                        10000
                    );
                }
            }
            
            throw error;
        }
    }

    async loadGoogleAPI() {
        console.log('[GoogleAuthService] Loading Google API...');
        
        return new Promise((resolve, reject) => {
            // Vérifier si l'API est déjà chargée
            if (window.gapi) {
                resolve();
                return;
            }
            
            // Créer le script pour charger l'API Google
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('[GoogleAuthService] ✅ Google API script loaded');
                
                // Attendre que gapi soit disponible
                const checkGapi = () => {
                    if (window.gapi) {
                        resolve();
                    } else {
                        setTimeout(checkGapi, 100);
                    }
                };
                checkGapi();
            };
            
            script.onerror = () => {
                console.error('[GoogleAuthService] ❌ Failed to load Google API script');
                reject(new Error('Failed to load Google API'));
            };
            
            document.head.appendChild(script);
        });
    }

    isAuthenticated() {
        const authenticated = this.currentUser !== null && this.isInitialized && 
                            this.auth2 && this.auth2.isSignedIn.get();
        
        console.log('[GoogleAuthService] Authentication check:', {
            hasCurrentUser: !!this.currentUser,
            isInitialized: this.isInitialized,
            hasAuth2: !!this.auth2,
            isSignedIn: this.auth2 ? this.auth2.isSignedIn.get() : false,
            result: authenticated
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
                provider: 'google'
            };
        } catch (error) {
            console.error('[GoogleAuthService] Error getting account info:', error);
            return null;
        }
    }

    async login() {
        console.log('[GoogleAuthService] Login attempt started...');
        
        if (!this.isInitialized) {
            console.log('[GoogleAuthService] Not initialized, initializing first...');
            await this.initialize();
        }

        try {
            console.log('[GoogleAuthService] Initiating Google sign-in...');
            
            // Utiliser signIn avec options
            this.currentUser = await this.auth2.signIn({
                scope: this.config.scopes.join(' '),
                prompt: 'select_account'
            });
            
            if (this.currentUser) {
                const profile = this.currentUser.getBasicProfile();
                console.log('[GoogleAuthService] ✅ Login successful:', profile.getEmail());
                
                // Vérifier les permissions accordées
                const authResponse = this.currentUser.getAuthResponse(true);
                console.log('[GoogleAuthService] Granted scopes:', authResponse.scope);
                
                return this.currentUser;
            } else {
                throw new Error('No user returned from sign-in');
            }
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Login error:', error);
            
            let userMessage = 'Erreur de connexion Gmail';
            
            if (error.error) {
                const errorCode = error.error;
                console.log('[GoogleAuthService] Google Error code:', errorCode);
                
                switch (errorCode) {
                    case 'popup_closed_by_user':
                        userMessage = 'Connexion annulée par l\'utilisateur.';
                        break;
                    case 'access_denied':
                        userMessage = 'Accès refusé. Veuillez accepter les permissions Gmail.';
                        break;
                    case 'popup_blocked_by_browser':
                        userMessage = 'Popup bloqué. Autorisez les popups et réessayez.';
                        break;
                    case 'immediate_failed':
                        userMessage = 'Connexion silencieuse échouée. Reconnexion nécessaire.';
                        break;
                    default:
                        userMessage = `Erreur Google: ${errorCode}`;
                }
            } else if (error.message) {
                if (error.message.includes('popup')) {
                    userMessage = 'Problème de popup. Autorisez les popups pour Gmail.';
                } else if (error.message.includes('network')) {
                    userMessage = 'Erreur réseau. Vérifiez votre connexion.';
                }
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(userMessage, 'error', 8000);
            }
            
            throw error;
        }
    }

    async logout() {
        console.log('[GoogleAuthService] Logout initiated...');
        
        try {
            if (this.auth2 && this.auth2.isSignedIn.get()) {
                await this.auth2.signOut();
                console.log('[GoogleAuthService] ✅ Google sign-out successful');
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
                    console.log('[GoogleAuthService] ✅ Valid token available');
                    return authResponse.access_token;
                } else {
                    console.log('[GoogleAuthService] Token expiring soon, refreshing...');
                }
            }
            
            // Renouveler le token
            const newAuthResponse = await this.currentUser.reloadAuthResponse();
            
            if (newAuthResponse && newAuthResponse.access_token) {
                console.log('[GoogleAuthService] ✅ Token refreshed successfully');
                return newAuthResponse.access_token;
            } else {
                throw new Error('No access token in response');
            }
            
        } catch (error) {
            console.error('[GoogleAuthService] Token acquisition error:', error);
            
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
            throw new Error('Not authenticated with Google');
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
                provider: 'google'
            };
            
            console.log('[GoogleAuthService] ✅ User info retrieved:', userInfo.displayName);
            return userInfo;

        } catch (error) {
            console.error('[GoogleAuthService] Error getting user info:', error);
            throw error;
        }
    }

    async reset() {
        console.log('[GoogleAuthService] Resetting Google authentication...');
        
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
        console.log('[GoogleAuthService] Force cleanup initiated...');
        
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
        
        console.log('[GoogleAuthService] ✅ Cleanup complete');
    }

    // Méthode de diagnostic
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
            config: {
                clientId: this.config.clientId.substring(0, 10) + '...',
                scopes: this.config.scopes,
                origin: window.location.origin
            },
            gapiLoaded: !!window.gapi,
            auth2Available: !!(window.gapi && window.gapi.auth2)
        };
    }
}

// Créer l'instance globale
try {
    window.googleAuthService = new GoogleAuthService();
    console.log('[GoogleAuthService] ✅ Global instance created successfully');
} catch (error) {
    console.error('[GoogleAuthService] ❌ Failed to create global instance:', error);
    
    // Créer une instance de fallback
    window.googleAuthService = {
        isInitialized: false,
        initialize: () => Promise.reject(new Error('GoogleAuthService failed to initialize: ' + error.message)),
        login: () => Promise.reject(new Error('GoogleAuthService not available: ' + error.message)),
        isAuthenticated: () => false,
        getDiagnosticInfo: () => ({ 
            error: 'GoogleAuthService failed to create: ' + error.message,
            expectedDomain: 'emailsortpro.netlify.app',
            currentDomain: window.location.hostname
        })
    };
}

// Fonction de diagnostic globale
window.diagnoseGoogle = function() {
    console.group('🔍 DIAGNOSTIC GOOGLE AUTH DÉTAILLÉ');
    
    try {
        const googleDiag = window.googleAuthService.getDiagnosticInfo();
        
        console.log('🔐 GoogleAuthService:', googleDiag);
        console.log('📚 Google API Library:', typeof gapi !== 'undefined' ? 'Available' : 'Missing');
        console.log('🌐 Current URL:', window.location.href);
        console.log('🎯 Expected domain:', googleDiag.expectedDomain);
        console.log('✅ Domain match:', googleDiag.domainMatch);
        
        // Validation spécifique des origines
        console.log('🔗 Origin Validation:');
        console.log('  Current Origin:', window.location.origin);
        console.log('  Expected Origin:', `https://${googleDiag.expectedDomain}`);
        console.log('  Origin Match:', window.location.origin === `https://${googleDiag.expectedDomain}` ? '✅' : '❌');
        
        if (!googleDiag.domainMatch) {
            console.log('🚨 ACTION REQUIRED:');
            console.log(`  Configure origin in Google Console: ${window.location.origin}`);
        }
        
        return googleDiag;
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
        return { error: error.message };
    } finally {
        console.groupEnd();
    }
};

console.log('✅ GoogleAuthService loaded v1.0 - Gmail integration ready');
