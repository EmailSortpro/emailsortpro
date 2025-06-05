// AuthService.js - Service d'authentification Microsoft Graph CORRIGÉ v3.0

class AuthService {
    constructor() {
        this.msalInstance = null;
        this.account = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.configWaitAttempts = 0;
        this.maxConfigWaitAttempts = 50; // 5 secondes max
        
        console.log('[AuthService] Constructor called - Enhanced Netlify support');
        
        // Attendre que la configuration soit disponible avec timeout
        this.waitForConfig();
    }

    waitForConfig() {
        console.log('[AuthService] Waiting for configuration...');
        
        if (!window.AppConfig) {
            this.configWaitAttempts++;
            
            if (this.configWaitAttempts >= this.maxConfigWaitAttempts) {
                console.error('[AuthService] ❌ Configuration timeout - AppConfig not available after 5 seconds');
                return;
            }
            
            console.log(`[AuthService] AppConfig not yet available, waiting... (${this.configWaitAttempts}/${this.maxConfigWaitAttempts})`);
            setTimeout(() => this.waitForConfig(), 100);
            return;
        }
        
        // Vérifier immédiatement la configuration
        const validation = window.AppConfig.validate();
        console.log('[AuthService] Configuration validation:', validation);
        
        if (!validation.valid) {
            console.error('[AuthService] Configuration invalid:', validation.issues);
            // Continuer quand même pour permettre l'affichage des erreurs
        } else {
            console.log('[AuthService] ✅ Configuration valid, ready to initialize');
        }
    }

    async initialize() {
        console.log('[AuthService] Initialize called');
        
        // Éviter l'initialisation multiple
        if (this.initializationPromise) {
            console.log('[AuthService] Already initializing, waiting for existing promise...');
            return this.initializationPromise;
        }
        
        if (this.isInitialized) {
            console.log('[AuthService] Already initialized');
            return Promise.resolve();
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    async _doInitialize() {
        try {
            console.log('[AuthService] Starting initialization...');
            
            // Vérifier que MSAL est chargé
            if (typeof msal === 'undefined') {
                throw new Error('MSAL library not loaded - check if script is included');
            }
            console.log('[AuthService] ✅ MSAL library available');

            // Vérifier que la configuration est disponible ET valide
            if (!window.AppConfig) {
                throw new Error('AppConfig not loaded - check if config.js is included before AuthService.js');
            }

            const validation = window.AppConfig.forceValidate();
            console.log('[AuthService] Configuration validation result:', validation);
            
            if (!validation.valid) {
                // Pour Netlify avec JavaScript vanilla, être plus tolérant
                if (validation.environment === 'netlify') {
                    console.warn('[AuthService] Netlify: Using default configuration');
                    // Continuer avec la configuration par défaut
                } else {
                    const errorMsg = `Configuration invalid: ${validation.issues.join(', ')}`;
                    console.error('[AuthService]', errorMsg);
                    throw new Error(errorMsg);
                }
            }

            console.log('[AuthService] ✅ Configuration validated');
            
            // Log de la configuration utilisée (sans exposer de secrets)
            console.log('[AuthService] Using configuration:', {
                clientId: window.AppConfig.msal.clientId ? window.AppConfig.msal.clientId.substring(0, 8) + '...' : 'MISSING',
                authority: window.AppConfig.msal.authority,
                redirectUri: window.AppConfig.msal.redirectUri,
                cacheLocation: window.AppConfig.msal.cache.cacheLocation,
                environment: window.AppConfig.app?.environment || 'unknown'
            });

            // Créer l'instance MSAL avec validation renforcée
            console.log('[AuthService] Creating MSAL instance...');
            
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
            
            // Validation finale avant création MSAL
            if (!msalConfig.auth.clientId || msalConfig.auth.clientId === 'CONFIGURATION_REQUIRED') {
                throw new Error('CRITICAL: clientId is missing or invalid in MSAL config');
            }
            
            // Validation du format du Client ID
            if (!/^[a-f0-9-]{36}$/i.test(msalConfig.auth.clientId)) {
                throw new Error(`CRITICAL: clientId format is invalid: ${msalConfig.auth.clientId}. Must be a valid GUID.`);
            }
            
            console.log('[AuthService] MSAL config prepared:', {
                clientId: msalConfig.auth.clientId ? '✅ Present (valid GUID)' : '❌ Missing',
                authority: msalConfig.auth.authority ? '✅ Present' : '❌ Missing',
                redirectUri: msalConfig.auth.redirectUri ? '✅ Present' : '❌ Missing',
                cacheLocation: msalConfig.cache?.cacheLocation || 'default'
            });
            
            this.msalInstance = new msal.PublicClientApplication(msalConfig);
            console.log('[AuthService] ✅ MSAL instance created successfully');
            
            // Initialiser MSAL
            await this.msalInstance.initialize();
            console.log('[AuthService] ✅ MSAL instance initialized');
            
            // Gérer la redirection si elle existe
            try {
                console.log('[AuthService] Checking for redirect response...');
                const response = await this.msalInstance.handleRedirectPromise();
                
                if (response) {
                    console.log('[AuthService] ✅ Redirect response received:', {
                        username: response.account?.username,
                        name: response.account?.name
                    });
                    this.account = response.account;
                    this.msalInstance.setActiveAccount(this.account);
                } else {
                    console.log('[AuthService] No redirect response');
                    
                    // Pas de redirection, vérifier s'il y a un compte dans le cache
                    const accounts = this.msalInstance.getAllAccounts();
                    console.log('[AuthService] Accounts in cache:', accounts.length);
                    
                    if (accounts.length > 0) {
                        this.account = accounts[0];
                        this.msalInstance.setActiveAccount(this.account);
                        console.log('[AuthService] ✅ Account restored from cache:', this.account.username);
                    } else {
                        console.log('[AuthService] No account in cache');
                    }
                }
            } catch (redirectError) {
                console.warn('[AuthService] Redirect handling error (non-critical):', redirectError);
                // Continuer même en cas d'erreur de redirection
            }

            this.isInitialized = true;
            console.log('[AuthService] ✅ Initialization completed successfully');
            
            return true;

        } catch (error) {
            console.error('[AuthService] ❌ Initialization failed:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            
            // Gestion d'erreurs spécifiques avec messages détaillés
            if (error.message.includes('unauthorized_client')) {
                console.error('[AuthService] AZURE CONFIG ERROR: Client ID incorrect or app not configured properly');
                if (window.uiManager) {
                    window.uiManager.showToast(
                        'Erreur de configuration Azure. Client ID incorrect.',
                        'error',
                        15000
                    );
                }
            } else if (error.message.includes('clientId')) {
                console.error('[AuthService] CLIENT ID ERROR:', error.message);
                if (window.uiManager) {
                    window.uiManager.showToast(
                        'Erreur critique: Client ID manquant ou invalide',
                        'error',
                        15000
                    );
                }
            } else if (error.message.includes('Netlify')) {
                console.error('[AuthService] NETLIFY CONFIG ERROR:', error.message);
                if (window.uiManager) {
                    window.uiManager.showToast(
                        'Erreur Netlify: Variable d\'environnement VITE_AZURE_CLIENT_ID manquante',
                        'error',
                        20000
                    );
                }
            }
            
            throw error;
        }
    }

    isAuthenticated() {
        const authenticated = this.account !== null && this.isInitialized;
        console.log('[AuthService] Authentication check:', {
            hasAccount: !!this.account,
            isInitialized: this.isInitialized,
            result: authenticated
        });
        return authenticated;
    }

    getAccount() {
        return this.account;
    }

    async login() {
        console.log('[AuthService] Login attempt started...');
        
        if (!this.isInitialized) {
            console.log('[AuthService] Not initialized, initializing first...');
            await this.initialize();
        }

        try {
            // Vérifier encore une fois la configuration avant le login
            const validation = window.AppConfig.validate();
            if (!validation.valid) {
                throw new Error(`Configuration invalid before login: ${validation.issues.join(', ')}`);
            }

            // Préparer la requête de login avec validation
            const loginRequest = {
                scopes: window.AppConfig.scopes.login,
                prompt: 'select_account'
            };

            console.log('[AuthService] Login request prepared:', {
                scopes: loginRequest.scopes,
                prompt: loginRequest.prompt,
                clientId: this.msalInstance?.getConfiguration()?.auth?.clientId ? '✅ Present in MSAL' : '❌ Missing in MSAL'
            });
            
            // Vérification finale avant login
            if (!this.msalInstance) {
                throw new Error('MSAL instance not available');
            }
            
            const msalConfig = this.msalInstance.getConfiguration();
            if (!msalConfig?.auth?.clientId) {
                throw new Error('CRITICAL: clientId missing in MSAL instance');
            }

            console.log('[AuthService] Initiating login redirect...');
            console.log('[AuthService] MSAL instance config verified:', {
                clientId: msalConfig.auth.clientId.substring(0, 8) + '...',
                authority: msalConfig.auth.authority,
                redirectUri: msalConfig.auth.redirectUri
            });
            
            // Utiliser loginRedirect pour éviter les problèmes de popup
            await this.msalInstance.loginRedirect(loginRequest);
            // Note: La redirection va se produire, pas de code après cette ligne
            
        } catch (error) {
            console.error('[AuthService] ❌ Login error:', error);
            
            // Gestion d'erreurs spécifiques avec logging détaillé
            let userMessage = 'Erreur de connexion';
            
            if (error.errorCode) {
                const errorCode = error.errorCode;
                console.log('[AuthService] MSAL Error code:', errorCode);
                console.log('[AuthService] MSAL Error details:', {
                    errorCode: error.errorCode,
                    errorMessage: error.errorMessage,
                    subError: error.subError,
                    correlationId: error.correlationId
                });
                
                if (window.AppConfig.errors[errorCode]) {
                    userMessage = window.AppConfig.errors[errorCode];
                } else {
                    switch (errorCode) {
                        case 'popup_window_error':
                            userMessage = 'Popup bloqué. Autorisez les popups et réessayez.';
                            break;
                        case 'user_cancelled':
                            userMessage = 'Connexion annulée par l\'utilisateur.';
                            break;
                        case 'network_error':
                            userMessage = 'Erreur réseau. Vérifiez votre connexion.';
                            break;
                        case 'unauthorized_client':
                            userMessage = 'Configuration Azure incorrecte. Vérifiez votre Client ID.';
                            break;
                        case 'invalid_client':
                            userMessage = 'Client ID invalide. Vérifiez votre configuration Azure.';
                            break;
                        default:
                            userMessage = `Erreur MSAL: ${errorCode}`;
                    }
                }
            } else if (error.message.includes('clientId')) {
                userMessage = 'Erreur de configuration: Client ID manquant ou invalide';
                console.error('[AuthService] Client ID error details:', {
                    configClientId: window.AppConfig?.msal?.clientId,
                    msalClientId: this.msalInstance?.getConfiguration()?.auth?.clientId,
                    environment: window.AppConfig?.app?.environment
                });
            } else if (error.message.includes('Netlify')) {
                userMessage = 'Erreur Netlify: Variable d\'environnement VITE_AZURE_CLIENT_ID non configurée';
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(userMessage, 'error', 10000);
            }
            
            throw error;
        }
    }

    async logout() {
        console.log('[AuthService] Logout initiated...');
        
        if (!this.isInitialized) {
            console.warn('[AuthService] Not initialized for logout, force cleanup');
            this.forceCleanup();
            return;
        }

        try {
            const logoutRequest = {
                account: this.account,
                postLogoutRedirectUri: window.AppConfig.msal.postLogoutRedirectUri
            };

            console.log('[AuthService] Logout request:', logoutRequest);
            await this.msalInstance.logoutRedirect(logoutRequest);
            // La redirection va se produire
            
        } catch (error) {
            console.error('[AuthService] Logout error:', error);
            // Force cleanup même en cas d'erreur
            this.forceCleanup();
        }
    }

    async getAccessToken() {
        if (!this.isAuthenticated()) {
            console.warn('[AuthService] Not authenticated for token request');
            return null;
        }

        try {
            const tokenRequest = {
                scopes: window.AppConfig.scopes.silent,
                account: this.account,
                forceRefresh: false
            };

            console.log('[AuthService] Requesting access token for scopes:', tokenRequest.scopes);
            const response = await this.msalInstance.acquireTokenSilent(tokenRequest);
            
            if (response && response.accessToken) {
                console.log('[AuthService] ✅ Token acquired successfully');
                return response.accessToken;
            } else {
                throw new Error('No access token in response');
            }
            
        } catch (error) {
            console.warn('[AuthService] Silent token acquisition failed:', error);
            
            if (error instanceof msal.InteractionRequiredAuthError) {
                console.log('[AuthService] Interaction required, redirecting to login...');
                await this.login();
                return null;
            } else {
                console.error('[AuthService] Token acquisition error:', error);
                return null;
            }
        }
    }

    async getUserInfo() {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        try {
            console.log('[AuthService] Fetching user info from Graph API...');
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AuthService] Graph API error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const userInfo = await response.json();
            console.log('[AuthService] ✅ User info retrieved:', userInfo.displayName);
            return userInfo;

        } catch (error) {
            console.error('[AuthService] Error getting user info:', error);
            throw error;
        }
    }

    async reset() {
        console.log('[AuthService] Resetting authentication...');
        
        try {
            if (this.msalInstance && this.account) {
                await this.msalInstance.logoutSilent({
                    account: this.account
                });
            }
        } catch (error) {
            console.warn('[AuthService] Silent logout failed during reset:', error);
        }

        this.forceCleanup();
    }

    forceCleanup() {
        console.log('[AuthService] Force cleanup initiated...');
        
        // Reset internal state
        this.account = null;
        this.isInitialized = false;
        this.msalInstance = null;
        this.initializationPromise = null;
        this.configWaitAttempts = 0;
        
        // Clear MSAL cache plus agressivement
        if (window.localStorage) {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('msal') || key.includes('auth') || key.includes('login'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => {
                try {
                    localStorage.removeItem(key);
                    console.log('[AuthService] Removed cache key:', key);
                } catch (e) {
                    console.warn('[AuthService] Error removing key:', key, e);
                }
            });
        }
        
        console.log('[AuthService] ✅ Cleanup complete');
    }

    // Méthode de diagnostic améliorée avec support Netlify
    getDiagnosticInfo() {
        return {
            isInitialized: this.isInitialized,
            hasAccount: !!this.account,
            accountUsername: this.account?.username,
            msalInstanceExists: !!this.msalInstance,
            configWaitAttempts: this.configWaitAttempts,
            msalConfig: this.msalInstance ? {
                clientId: this.msalInstance.getConfiguration()?.auth?.clientId?.substring(0, 8) + '...',
                authority: this.msalInstance.getConfiguration()?.auth?.authority,
                redirectUri: this.msalInstance.getConfiguration()?.auth?.redirectUri
            } : null,
            appConfig: window.AppConfig ? {
                exists: true,
                environment: window.AppConfig.app?.environment,
                validation: window.AppConfig.validate(),
                debug: window.AppConfig.getDebugInfo()
            } : { exists: false },
            netlifySpecific: window.AppConfig?.app?.environment === 'netlify' ? {
                envVarDetected: typeof VITE_AZURE_CLIENT_ID !== 'undefined',
                envVarValue: typeof VITE_AZURE_CLIENT_ID !== 'undefined' ? VITE_AZURE_CLIENT_ID?.substring(0, 8) + '...' : 'undefined',
                processEnvExists: typeof process !== 'undefined' && !!process.env,
                windowNetlifyClientId: !!window.NETLIFY_CLIENT_ID
            } : 'N/A'
        };
    }
}

// Créer l'instance globale avec gestion d'erreur renforcée
try {
    window.authService = new AuthService();
    console.log('[AuthService] ✅ Global instance created successfully with Netlify support');
} catch (error) {
    console.error('[AuthService] ❌ Failed to create global instance:', error);
    
    // Créer une instance de fallback plus informative
    window.authService = {
        isInitialized: false,
        initialize: () => Promise.reject(new Error('AuthService failed to initialize: ' + error.message)),
        login: () => Promise.reject(new Error('AuthService not available: ' + error.message)),
        isAuthenticated: () => false,
        getDiagnosticInfo: () => ({ 
            error: 'AuthService failed to create: ' + error.message,
            environment: window.AppConfig?.app?.environment || 'unknown',
            configExists: !!window.AppConfig
        })
    };
}

// Fonction de diagnostic globale améliorée avec support Netlify
window.diagnoseMSAL = function() {
    console.group('🔍 DIAGNOSTIC MSAL DÉTAILLÉ - NETLIFY AWARE');
    
    try {
        const authDiag = window.authService.getDiagnosticInfo();
        const configDiag = window.AppConfig ? window.AppConfig.getDebugInfo() : null;
        
        console.log('🔐 AuthService:', authDiag);
        console.log('⚙️ Configuration:', configDiag);
        console.log('📚 MSAL Library:', typeof msal !== 'undefined' ? 'Available' : 'Missing');
        console.log('🌐 Current URL:', window.location.href);
        console.log('💾 LocalStorage keys:', Object.keys(localStorage).filter(k => k.includes('msal') || k.includes('auth')));
        
        // Diagnostic spécifique Netlify
        if (window.AppConfig?.app?.environment === 'netlify') {
            console.log('🚀 NETLIFY DIAGNOSTIC:');
            console.log('  - Environment variable VITE_AZURE_CLIENT_ID:', authDiag.netlifySpecific);
            console.log('  - Current hostname:', window.location.hostname);
            console.log('  - Expected redirect URI:', window.AppConfig.msal.redirectUri);
        }
        
        return { authDiag, configDiag };
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
        return { error: error.message };
    } finally {
        console.groupEnd();
    }
};

// Test de disponibilité de la configuration au chargement
setTimeout(() => {
    if (window.AppConfig && window.AppConfig.app?.environment === 'netlify') {
        const validation = window.AppConfig.validate();
        if (!validation.valid) {
            console.warn('🚨 NETLIFY WARNING: Configuration invalid on AuthService load');
            console.log('Issues:', validation.issues);
            console.log('Use diagnoseMSAL() for detailed diagnostic');
        }
    }
}, 2000);

console.log('✅ AuthService loaded with enhanced Netlify support and client_id validation v3.0');
