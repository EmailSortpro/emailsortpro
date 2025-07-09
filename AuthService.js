console.log('[AuthService] Constructor called - Microsoft Auth Service v4.2');
    
    // Ne pas interférer avec Google Auth
    if (this.detectGoogleAuth()) {
        console.log('[AuthService] Google Auth detected, Microsoft service in standby mode');
        return;
    }
    
    this.verifyDomain();
    this.waitForConfig();
}

detectGoogleAuth() {
    // Vérifier si Google est le provider principal
    const googleToken = localStorage.getItem('google_token_emailsortpro');
    const lastProvider = sessionStorage.getItem('lastAuthProvider');
    
    return (googleToken && lastProvider === 'google') || 
           (window.googleAuthService && window.googleAuthService.isAuthenticated());
}

verifyDomain() {
    const currentDomain = window.location.hostname;
    const isCorrectDomain = currentDomain === this.expectedDomain;
    
    console.log('[AuthService] Domain verification:', {
        current: currentDomain,
        expected: this.expectedDomain,
        isCorrect: isCorrectDomain
    });
}

waitForConfig() {
    if (this.detectGoogleAuth()) return;
    
    console.log('[AuthService] Waiting for Microsoft configuration...');
    
    if (!window.AppConfig) {
        this.configWaitAttempts++;
        
        if (this.configWaitAttempts >= this.maxConfigWaitAttempts) {
            console.error('[AuthService] Configuration timeout');
            return;
        }
        
        setTimeout(() => this.waitForConfig(), 100);
        return;
    }
    
    const validation = window.AppConfig.validate();
    if (!validation.valid) {
        console.error('[AuthService] Configuration invalid:', validation.issues);
    } else {
        console.log('[AuthService] ✅ Configuration valid');
    }
}

async initialize() {
    if (this.detectGoogleAuth()) {
        console.log('[AuthService] Skipping Microsoft init - Google is active');
        return Promise.resolve();
    }
    
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
        console.log('[AuthService] Starting Microsoft initialization...');
        
        if (typeof msal === 'undefined') {
            throw new Error('MSAL library not loaded');
        }

        if (!window.AppConfig) {
            throw new Error('AppConfig not loaded');
        }

        const validation = window.AppConfig.forceValidate();
        if (!validation.valid) {
            console.warn('[AuthService] Configuration issues:', validation.issues);
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
        
        console.log('[AuthService] ✅ MSAL initialized');
        
        const response = await this.msalInstance.handleRedirectPromise();
        
        if (response) {
            this.account = response.account;
            this.msalInstance.setActiveAccount(this.account);
            // Marquer Microsoft comme provider actif
            sessionStorage.setItem('lastAuthProvider', 'microsoft');
        } else {
            const accounts = this.msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                this.account = accounts[0];
                this.msalInstance.setActiveAccount(this.account);
            }
        }

        this.isInitialized = true;
        return true;

    } catch (error) {
        console.error('[AuthService] Initialization failed:', error);
        this.isInitialized = false;
        this.initializationPromise = null;
        throw error;
    }
}

isAuthenticated() {
    // Si Google est actif, retourner false pour Microsoft
    if (this.detectGoogleAuth()) {
        return false;
    }
    
    return this.account !== null && this.isInitialized;
}

getAccount() {
    return this.account;
}

async login() {
    console.log('[AuthService] Microsoft login attempt...');
    
    if (!this.isInitialized) {
        await this.initialize();
    }

    try {
        const loginRequest = {
            scopes: window.AppConfig.scopes.login,
            prompt: 'select_account'
        };

        await this.msalInstance.loginRedirect(loginRequest);
        // Marquer Microsoft comme provider actif avant la redirection
        sessionStorage.setItem('lastAuthProvider', 'microsoft');
        
    } catch (error) {
        console.error('[AuthService] Login error:', error);
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
            postLogoutRedirectUri: `https://${this.expectedDomain}/`
        };

        await this.msalInstance.logoutRedirect(logoutRequest);
        
    } catch (error) {
        console.error('[AuthService] Logout error:', error);
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
        console.warn('[AuthService] Token acquisition failed:', error);
        
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
        return { ...userInfo, provider: 'microsoft' };

    } catch (error) {
        console.error('[AuthService] Error getting user info:', error);
        throw error;
    }
}

forceCleanup() {
    console.log('[AuthService] Force cleanup...');
    
    this.account = null;
    this.isInitialized = false;
    this.msalInstance = null;
    this.initializationPromise = null;
    
    // Ne pas effacer les tokens Google
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('msal') && !key.includes('google')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

getDiagnosticInfo() {
    return {
        provider: this.provider,
        isInitialized: this.isInitialized,
        hasAccount: !!this.account,
        accountUsername: this.account?.username,
        googleActive: this.detectGoogleAuth(),
        currentDomain: window.location.hostname,
        expectedDomain: this.expectedDomain
    };
}
