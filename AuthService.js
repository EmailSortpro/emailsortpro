// authService.js - Microsoft Authentication Service v4.5
// Service dédié à l'authentification Microsoft/Outlook avec support dual-provider

class MicrosoftAuthService {
    constructor() {
        this.msalInstance = null;
        this.account = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'microsoft';
        this.configWaitAttempts = 0;
        this.maxConfigWaitAttempts = 50;
        
        console.log('[MicrosoftAuthService] Constructor called v4.5 - Dual provider support');
        
        this.verifyDomain();
        this.waitForConfig();
    }

    verifyDomain() {
        const currentDomain = window.location.hostname;
        const isCorrectDomain = currentDomain === this.expectedDomain || currentDomain.includes('localhost');
        
        console.log('[MicrosoftAuthService] Domain verification:', {
            current: currentDomain,
            expected: this.expectedDomain,
            isCorrect: isCorrectDomain
        });
    }

    waitForConfig() {
        console.log('[MicrosoftAuthService] Waiting for configuration...');
        
        if (!window.AppConfig) {
            this.configWaitAttempts++;
            
            if (this.configWaitAttempts >= this.maxConfigWaitAttempts) {
                console.error('[MicrosoftAuthService] Configuration timeout');
                return;
            }
            
            setTimeout(() => this.waitForConfig(), 100);
            return;
        }
        
        const validation = window.AppConfig.validate();
        if (!validation.valid) {
            console.error('[MicrosoftAuthService] Configuration invalid:', validation.issues);
        } else {
            console.log('[MicrosoftAuthService] ✅ Configuration valid');
        }
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
            console.log('[MicrosoftAuthService] Starting initialization...');
            
            if (typeof msal === 'undefined') {
                throw new Error('MSAL library not loaded');
            }

            if (!window.AppConfig) {
                throw new Error('AppConfig not loaded');
            }

            const validation = window.AppConfig.forceValidate();
            if (!validation.valid) {
                console.warn('[MicrosoftAuthService] Configuration issues:', validation.issues);
            }

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
            
            this.msalInstance = new msal.PublicClientApplication(msalConfig);
            await this.msalInstance.initialize();
            
            console.log('[MicrosoftAuthService] ✅ MSAL initialized');
            
            const response = await this.msalInstance.handleRedirectPromise();
            
            if (response) {
                this.account = response.account;
                this.msalInstance.setActiveAccount(this.account);
                sessionStorage.setItem('lastAuthProvider', 'microsoft');
                console.log('[MicrosoftAuthService] ✅ Redirect handled, user authenticated');
            } else {
                const accounts = this.msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.msalInstance.setActiveAccount(this.account);
                    console.log('[MicrosoftAuthService] ✅ Existing account found');
                }
            }

            this.isInitialized = true;
            return true;

        } catch (error) {
            console.error('[MicrosoftAuthService] Initialization failed:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    isAuthenticated() {
        return this.account !== null && this.isInitialized;
    }

    getAccount() {
        return this.account;
    }

    async login() {
        console.log('[MicrosoftAuthService] Login attempt...');
        
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const loginRequest = {
                scopes: window.AppConfig.scopes.login,
                prompt: 'select_account'
            };

            // Marquer Microsoft comme provider actif AVANT la redirection
            sessionStorage.setItem('lastAuthProvider', 'microsoft');
            
            await this.msalInstance.loginRedirect(loginRequest);
            
        } catch (error) {
            console.error('[MicrosoftAuthService] Login error:', error);
            throw error;
        }
    }

    async logout() {
        if (!this.isInitialized) {
            this.forceCleanup();
            return;
        }

        try {
            const logoutRequest = {
                account: this.account,
                postLogoutRedirectUri: window.AppConfig.msal.postLogoutRedirectUri
            };

            await this.msalInstance.logoutRedirect(logoutRequest);
            
        } catch (error) {
            console.error('[MicrosoftAuthService] Logout error:', error);
            this.forceCleanup();
        }
    }

    async getAccessToken() {
        if (!this.isInitialized || !this.isAuthenticated()) {
            return null;
        }

        try {
            const tokenRequest = {
                scopes: window.AppConfig.scopes.silent,
                account: this.account,
                forceRefresh: false
            };

            const response = await this.msalInstance.acquireTokenSilent(tokenRequest);
            return response.accessToken;
            
        } catch (error) {
            console.warn('[MicrosoftAuthService] Token acquisition failed:', error);
            
            if (error instanceof msal.InteractionRequiredAuthError) {
                await this.login();
                return null;
            }
            
            return null;
        }
    }

    async getUserInfo() {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const userInfo = await response.json();
            return { 
                ...userInfo, 
                provider: 'microsoft',
                email: userInfo.mail || userInfo.userPrincipalName 
            };

        } catch (error) {
            console.error('[MicrosoftAuthService] Error getting user info:', error);
            throw error;
        }
    }

    forceCleanup() {
        console.log('[MicrosoftAuthService] Force cleanup...');
        
        this.account = null;
        this.isInitialized = false;
        this.msalInstance = null;
        this.initializationPromise = null;
        
        // Nettoyer uniquement les tokens Microsoft
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('msal') && !key.includes('google')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Si le dernier provider était Microsoft, le supprimer
        if (sessionStorage.getItem('lastAuthProvider') === 'microsoft') {
            sessionStorage.removeItem('lastAuthProvider');
        }
    }

    reset() {
        this.forceCleanup();
    }

    getDiagnosticInfo() {
        return {
            provider: this.provider,
            isInitialized: this.isInitialized,
            hasAccount: !!this.account,
            accountUsername: this.account?.username,
            currentDomain: window.location.hostname,
            expectedDomain: this.expectedDomain
        };
    }
}

// Créer l'instance globale
window.authService = new MicrosoftAuthService();

console.log('[MicrosoftAuthService] ✅ Service loaded and ready - v4.5');
