// AuthService.js - Service d'authentification Microsoft Graph et Google API v3.1
// CORRIGÉ pour emailsortpro.netlify.app

class AuthService {
    constructor() {
        this.msalInstance = null;
        this.outlookAccount = null;
        this.googleAuth = null; // GoogleAuth object
        this.googleAccount = null; // Google user object
        this.isInitialized = { msal: false, gapi: false };
        this.currentProvider = null; // 'outlook' or 'gmail'

        this.initializationPromise = { msal: null, gapi: null };
        this.configWaitAttempts = 0;
        this.maxConfigWaitAttempts = 50; // 5 secondes max
        this.expectedDomain = 'emailsortpro.netlify.app';

        console.log('[AuthService] Constructor called - Enhanced support for emailsortpro.netlify.app');

        this.verifyDomain();
        this.waitForConfig(); // Still waits for AppConfig to be available
    }

    verifyDomain() {
        const currentDomain = window.location.hostname;
        const isCorrectDomain = currentDomain === this.expectedDomain;

        console.log('[AuthService] Domain verification:', {
            current: currentDomain,
            expected: this.expectedDomain,
            isCorrect: isCorrectDomain
        });

        if (!isCorrectDomain && !currentDomain.includes('localhost') && !currentDomain.includes('127.0.0.1')) {
            console.warn('[AuthService] ⚠️ Domain mismatch! Authentication may fail.');
            console.warn('[AuthService] Azure App Registration and Google OAuth Consent Screen must be configured for:', this.expectedDomain);
        }
    }

    waitForConfig() {
        console.log('[AuthService] Waiting for AppConfig...');
        if (window.AppConfig) {
            console.log('[AuthService] AppConfig found.');
            this.initializeMsal(); // Initialize MSAL as soon as config is ready
            this.initializeGapi(); // Initialize GAPI as soon as config is ready
        } else {
            if (this.configWaitAttempts < this.maxConfigWaitAttempts) {
                this.configWaitAttempts++;
                setTimeout(() => this.waitForConfig(), 100);
            } else {
                console.error('[AuthService] ❌ AppConfig not found after multiple attempts. Authentication services may not initialize.');
            }
        }
    }

    async initializeMsal() {
        if (this.isInitialized.msal || !window.AppConfig || !window.AppConfig.msal) {
            if (!window.AppConfig) console.error('AppConfig not available for MSAL initialization.');
            if (!window.AppConfig.msal) console.error('AppConfig.msal not available for MSAL initialization.');
            return;
        }

        if (this.initializationPromise.msal) {
            return this.initializationPromise.msal;
        }

        this.initializationPromise.msal = (async () => {
            console.log('[AuthService] Initializing MSAL...');
            try {
                this.msalInstance = new msal.PublicClientApplication(window.AppConfig.msal);
                this.isInitialized.msal = true;
                console.log('[AuthService] ✅ MSAL initialized.');

                // Attempt silent login for Outlook on init
                const accounts = this.msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    this.outlookAccount = accounts[0];
                    this.currentProvider = 'outlook';
                    console.log(`[AuthService] Found existing Outlook session for ${this.outlookAccount.username}`);
                    // You might want to try a silent acquire token here to refresh
                    try {
                        const silentResult = await this.msalInstance.acquireTokenSilent({
                            account: this.outlookAccount,
                            scopes: window.AppConfig.msal.scopes
                        });
                        console.log('[AuthService] Outlook token silently acquired.', silentResult.accessToken ? 'Token present' : 'No token');
                    } catch (error) {
                        console.warn('[AuthService] Silent Outlook token acquisition failed, user may need to re-login.', error);
                    }
                }
            } catch (error) {
                console.error('[AuthService] ❌ Failed to initialize MSAL:', error);
                this.isInitialized.msal = false;
                this.initializationPromise.msal = null; // Allow re-initialization attempt
                throw error;
            }
        })();
        return this.initializationPromise.msal;
    }

    async initializeGapi() {
        if (this.isInitialized.gapi || !window.AppConfig || !window.AppConfig.google) {
            if (!window.AppConfig) console.error('AppConfig not available for GAPI initialization.');
            if (!window.AppConfig.google) console.error('AppConfig.google not available for GAPI initialization.');
            return;
        }

        if (this.initializationPromise.gapi) {
            return this.initializationPromise.gapi;
        }

        this.initializationPromise.gapi = new Promise((resolve, reject) => {
            console.log('[AuthService] Initializing GAPI...');
            // Load the 'client' and 'auth2' libraries
            gapi.load('client:auth2', async () => {
                try {
                    await gapi.client.init({
                        apiKey: window.AppConfig.google.apiKey, // If you have one for other Google services
                        clientId: window.AppConfig.google.clientId,
                        scope: window.AppConfig.google.scopes.join(' '),
                        discoveryDocs: window.AppConfig.google.discoveryDocs
                    });

                    this.googleAuth = gapi.auth2.getAuthInstance();
                    this.isInitialized.gapi = true;
                    console.log('[AuthService] ✅ GAPI initialized.');

                    // Listen for sign-in state changes.
                    this.googleAuth.isSignedIn.listen(this.updateGoogleSignInStatus.bind(this));

                    // Initial sign-in state check
                    this.updateGoogleSignInStatus(this.googleAuth.isSignedIn.get());

                    resolve();
                } catch (error) {
                    console.error('[AuthService] ❌ Failed to initialize GAPI:', error);
                    this.isInitialized.gapi = false;
                    this.initializationPromise.gapi = null; // Allow re-initialization attempt
                    reject(error);
                }
            });
        });
        return this.initializationPromise.gapi;
    }

    updateGoogleSignInStatus(isSignedIn) {
        if (isSignedIn) {
            const googleUser = this.googleAuth.currentUser.get();
            this.googleAccount = {
                id: googleUser.getId(),
                name: googleUser.getBasicProfile().getName(),
                email: googleUser.getBasicProfile().getEmail(),
                provider: 'gmail',
                token: googleUser.getAuthResponse().access_token
            };
            this.currentProvider = 'gmail';
            console.log(`[AuthService] Google user signed in: ${this.googleAccount.email}`);
            window.updateAuthStatusUI(this.googleAccount.name, this.googleAccount.email, 'Gmail');
        } else {
            this.googleAccount = null;
            if (this.currentProvider === 'gmail') {
                this.currentProvider = null; // Only clear if Gmail was the active provider
            }
            console.log('[AuthService] Google user signed out.');
            // Only update UI if no other provider is active
            if (!this.isAuthenticated('outlook')) {
                 window.updateAuthStatusUI(null, null);
            }
        }
    }

    async login(provider) {
        if (!window.AppConfig) {
            console.error('AppConfig not available, cannot perform login.');
            throw new Error('Configuration missing.');
        }

        if (provider === 'outlook') {
            await this.initializeMsal();
            if (!this.msalInstance) throw new Error('MSAL not initialized.');

            try {
                const loginResponse = await this.msalInstance.loginPopup(window.AppConfig.msal);
                this.outlookAccount = loginResponse.account;
                this.currentProvider = 'outlook';
                console.log('[AuthService] ✅ Outlook login successful:', this.outlookAccount);
                return this.outlookAccount;
            } catch (error) {
                console.error('[AuthService] ❌ Outlook login failed:', error);
                throw error;
            }
        } else if (provider === 'gmail') {
            await this.initializeGapi();
            if (!this.googleAuth) throw new Error('GoogleAuth not initialized.');

            try {
                await this.googleAuth.signIn();
                // updateGoogleSignInStatus will handle setting this.googleAccount and currentProvider
                if (this.googleAccount) {
                    console.log('[AuthService] ✅ Gmail login successful:', this.googleAccount.email);
                    return this.googleAccount;
                } else {
                    throw new Error('Gmail sign-in did not return an account.');
                }
            } catch (error) {
                console.error('[AuthService] ❌ Gmail login failed:', error);
                throw error;
            }
        } else {
            throw new Error('Invalid provider specified.');
        }
    }

    async logout() {
        if (this.currentProvider === 'outlook' && this.msalInstance) {
            try {
                await this.msalInstance.logoutPopup();
                this.outlookAccount = null;
                this.currentProvider = null;
                console.log('[AuthService] ✅ Outlook logout successful.');
            } catch (error) {
                console.error('[AuthService] ❌ Outlook logout failed:', error);
                throw error;
            }
        } else if (this.currentProvider === 'gmail' && this.googleAuth) {
            try {
                await this.googleAuth.signOut();
                this.googleAccount = null;
                this.currentProvider = null;
                console.log('[AuthService] ✅ Gmail logout successful.');
            } catch (error) {
                console.error('[AuthService] ❌ Gmail logout failed:', error);
                throw error;
            }
        } else {
            console.log('[AuthService] No active session to log out from.');
        }
    }

    isAuthenticated(provider = null) {
        if (provider === 'outlook') {
            return this.outlookAccount !== null;
        } else if (provider === 'gmail') {
            return this.googleAccount !== null;
        } else {
            // If no provider specified, check if any provider is authenticated
            return this.outlookAccount !== null || this.googleAccount !== null;
        }
    }

    getAccount(provider = null) {
        if (provider === 'outlook') {
            return this.outlookAccount;
        } else if (provider === 'gmail') {
            return this.googleAccount;
        } else {
            // Return the currently active account, or null if neither
            return this.currentProvider === 'outlook' ? this.outlookAccount :
                   (this.currentProvider === 'gmail' ? this.googleAccount : null);
        }
    }

    async getAccessToken(provider = null) {
        const targetProvider = provider || this.currentProvider;

        if (!targetProvider) {
            console.warn('[AuthService] No active provider to get access token for.');
            return null;
        }

        if (targetProvider === 'outlook') {
            if (!this.msalInstance || !this.outlookAccount) {
                console.warn('[AuthService] MSAL or Outlook account not available for token acquisition.');
                return null;
            }
            try {
                const response = await this.msalInstance.acquireTokenSilent({
                    account: this.outlookAccount,
                    scopes: window.AppConfig.msal.scopes
                });
                return response.accessToken;
            } catch (error) {
                console.error('[AuthService] ❌ Failed to acquire Outlook token silently:', error);
                // If silent fails, try interactive (e.g., popup or redirect)
                try {
                    const response = await this.msalInstance.acquireTokenPopup(window.AppConfig.msal);
                    return response.accessToken;
                } catch (interactiveError) {
                    console.error('[AuthService] ❌ Failed to acquire Outlook token interactively:', interactiveError);
                    throw interactiveError; // Re-throw to indicate failure
                }
            }
        } else if (targetProvider === 'gmail') {
            if (!this.googleAuth || !this.googleAuth.isSignedIn.get()) {
                console.warn('[AuthService] GAPI or Google account not available for token acquisition.');
                return null;
            }
            // GAPI's currentUser.get().getAuthResponse(true) automatically refreshes if needed
            return this.googleAuth.currentUser.get().getAuthResponse(true).access_token;
        }
        return null;
    }

    getCurrentProvider() {
        return this.currentProvider;
    }

    async diagnoseMSAL() {
        console.group('MSAL Diagnostic - AuthService');
        try {
            const authDiag = {};
            authDiag.isInitialized = this.isInitialized.msal;
            authDiag.msalInstancePresent = !!this.msalInstance;
            authDiag.outlookAccount = this.outlookAccount ? {
                username: this.outlookAccount.username,
                name: this.outlookAccount.name,
                homeAccountId: this.outlookAccount.homeAccountId
            } : 'No account logged in';
            authDiag.accountsInCache = this.msalInstance ? this.msalInstance.getAllAccounts().map(acc => acc.username) : 'N/A';
            authDiag.currentProvider = this.currentProvider;

            const configDiag = { ...window.AppConfig.msal };
            configDiag.redirectUriMatch = window.location.href.startsWith(configDiag.redirectUri);
            configDiag.expectedRedirectUri = configDiag.redirectUri;
            configDiag.currentUri = window.location.href;

            if (!configDiag.redirectUriMatch) {
                console.log('🚨 ACTION REQUIRED:');
                console.log(`  Configure redirect URI in Azure Portal: ${configDiag.expectedRedirectUri}`);
            }

            return { authDiag, configDiag };

        } catch (error) {
            console.error('❌ MSAL Diagnostic failed:', error);
            return { error: error.message };
        } finally {
            console.groupEnd();
        }
    }

    async diagnoseGAPI() {
        console.group('GAPI Diagnostic - AuthService');
        try {
            const authDiag = {};
            authDiag.isInitialized = this.isInitialized.gapi;
            authDiag.googleAuthPresent = !!this.googleAuth;
            authDiag.googleAccount = this.googleAccount ? {
                email: this.googleAccount.email,
                name: this.googleAccount.name
            } : 'No account logged in';
            authDiag.isSignedInGAPI = this.googleAuth ? this.googleAuth.isSignedIn.get() : 'N/A';
            authDiag.currentProvider = this.currentProvider;

            const configDiag = { ...window.AppConfig.google };
            configDiag.currentUri = window.location.href;
            // For GAPI, redirect URI validation is often handled implicitly by Google's JS library
            // or explicitly configured in the Google Cloud Console.
            // We can check if current origin is among authorized origins.
            configDiag.expectedAuthorizedOrigins = window.AppConfig.google.redirectUris; // This should be configured in config.js

            const currentOrigin = window.location.origin;
            configDiag.originMatch = configDiag.expectedAuthorizedOrigins.includes(currentOrigin);

            if (!configDiag.originMatch) {
                console.log('🚨 ACTION REQUIRED:');
                console.log(`  Ensure '${currentOrigin}' is configured as an authorized redirect URI/origin in Google Cloud Console.`);
            }

            return { authDiag, configDiag };

        } catch (error) {
            console.error('❌ GAPI Diagnostic failed:', error);
            return { error: error.message };
        } finally {
            console.groupEnd();
        }
    }

    // Combined diagnostic function
    async diagnose() {
        console.group('AuthService Full Diagnostic');
        const msalDiag = await this.diagnoseMSAL();
        const gapiDiag = await this.diagnoseGAPI();
        console.groupEnd();
        return { msal: msalDiag, gapi: gapiDiag };
    }
}

// Create global instance
try {
    window.authService = new AuthService();
    console.log('[AuthService] ✅ Global instance created successfully');
} catch (error) {
    console.error('[AuthService] ❌ Failed to create global AuthService instance:', error);
    // Fallback if AuthService constructor itself fails
    window.authService = {
        isInitialized: { msal: false, gapi: false },
        isAuthenticated: () => false,
        getAccount: () => null,
        getAccessToken: async () => { throw new Error('AuthService not available'); },
        login: async (provider) => { throw new Error(`AuthService not available for ${provider} login`); },
        logout: async () => { console.warn('AuthService not available for logout'); },
        getCurrentProvider: () => null,
        diagnose: async () => ({ error: 'AuthService instance creation failed' }),
        diagnoseMSAL: async () => ({ error: 'AuthService instance creation failed' }),
        diagnoseGAPI: async () => ({ error: 'AuthService instance creation failed' }),
        waitForConfig: async () => { console.warn('AuthService not available, cannot wait for config.'); },
        initializeMsal: async () => { console.warn('AuthService not available, cannot initialize MSAL.'); },
        initializeGapi: async () => { console.warn('AuthService not available, cannot initialize GAPI.'); }
    };
}

// Test de disponibilité de la configuration au chargement (moved inside AuthService constructor now)
// Small timeout for diagnostic info to appear after page load
setTimeout(() => {
    if (window.AppConfig) {
        const validation = window.AppConfig.validate();
        if (!validation.valid) {
            console.warn('🚨 WARNING: Configuration invalid for emailsortpro.netlify.app');
            console.log('Issues:', validation.issues);
        }
        
        // Specific domain check (already handled in AuthService constructor)
        // This part below is redundant if AuthService.verifyDomain is thorough
        if (window.AppConfig.msal?.redirectUri && 
            !window.AppConfig.msal.redirectUri.includes(window.authService.expectedDomain)) {
            console.error('🚨 CRITICAL: MSAL Redirect URI does not match expected domain!');
            console.error('Expected:', `https://${window.authService.expectedDomain}/auth-callback.html`);
            console.error('Configured:', window.AppConfig.msal.redirectUri);
        }
        // Add check for Google redirect URIs / origins in AppConfig.google.redirectUris
        if (window.AppConfig.google?.redirectUris && 
            !window.AppConfig.google.redirectUris.includes(window.location.origin)) {
            console.error('🚨 CRITICAL: Google Authorized JavaScript Origins does not include current origin!');
            console.error('Expected one of:', window.AppConfig.google.redirectUris);
            console.error('Current Origin:', window.location.origin);
        }


        console.log('Use authService.diagnose() for detailed diagnostic');
    }
}, 2000);

console.log('✅ AuthService loaded with enhanced support for emailsortpro.netlify.app v3.1 (with Gmail support)');
