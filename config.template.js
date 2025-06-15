// config.template.js - Configuration centralisée NETLIFY COMPATIBLE v4.0 - CORRIGÉE
// Intégration de la configuration Google OAuth pour Gmail API
// Ce fichier est un TEMPLATE. Vous devriez le copier en 'config.js' et le modifier.

// FONCTION DE DÉTECTION DE L'ENVIRONNEMENT AMÉLIORÉE
function detectEnvironment() {
    const hostname = window.location.hostname;
    const isNetlify = hostname.includes('netlify.app') ||
                     hostname.includes('netlifyapp.com') ||
                     hostname.includes('.netlify.com');
    const isGitHubPages = hostname.includes('github.io');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    console.log('[CONFIG] Environment detection:', {
        hostname,
        isNetlify,
        isGitHubPages,
        isLocalhost,
        origin: window.location.origin
    });

    return {
        type: isNetlify ? 'netlify' : isGitHubPages ? 'github' : isLocalhost ? 'localhost' : 'other',
        isNetlify,
        isGitHubPages,
        isLocalhost,
        hostname
    };
}

// FONCTION DE RÉCUPÉRATION DES CLIENT ID CORRIGÉE POUR NETLIFY ET GESTION MULTI-SERVICES
function getClientIds(environment) {
    console.log('[CONFIG] Getting Client IDs for environment:', environment.type);

    let msalClientId = 'CONFIGURATION_REQUIRED';
    let googleClientId = 'CONFIGURATION_REQUIRED';
    let googleApiKey = 'OPTIONAL_GOOGLE_API_KEY'; // For other Google services if needed

    // 1. SOLUTION NETLIFY / Variables d'environnement pour déploiement
    // Pour Netlify, on suppose que les variables d'environnement VITE_AZURE_CLIENT_ID et VITE_GOOGLE_CLIENT_ID sont configurées
    if (environment.isNetlify) {
        // 'import.meta.env' est spécifique à Vite. Si vous n'utilisez pas Vite, ce sera undefined.
        // Dans ce cas, vous devrez gérer la récupération des variables d'environnement différemment
        // (par exemple, via un script côté serveur qui génère un fichier JS avec les variables,
        // ou en les injectant directement dans le HTML si la sécurité le permet).
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AZURE_CLIENT_ID && import.meta.env.VITE_AZURE_CLIENT_ID !== 'CONFIGURATION_REQUIRED') {
            msalClientId = import.meta.env.VITE_AZURE_CLIENT_ID;
            console.log('[CONFIG] Netlify MSAL Client ID from VITE_AZURE_CLIENT_ID');
        } else {
            console.warn('[CONFIG] Netlify: VITE_AZURE_CLIENT_ID not found or not configured. (Check Vite setup)');
        }

        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'CONFIGURATION_REQUIRED') {
            googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            console.log('[CONFIG] Netlify Google Client ID from VITE_GOOGLE_CLIENT_ID');
        } else {
            console.warn('[CONFIG] Netlify: VITE_GOOGLE_CLIENT_ID not found or not configured. (Check Vite setup)');
        }
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_API_KEY && import.meta.env.VITE_GOOGLE_API_KEY !== 'OPTIONAL_GOOGLE_API_KEY') {
            googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            console.log('[CONFIG] Netlify Google API Key from VITE_GOOGLE_API_KEY');
        }
    }

    // 2. SOLUTION LOCALHOST / Développement local
    // Pour le développement local, on peut utiliser des valeurs par défaut ou demander à l'utilisateur de les configurer
    if (environment.isLocalhost) {
        // Ces valeurs sont des placeholders, REMPLACEZ-LES avec vos vrais IDs pour le développement local
        msalClientId = msalClientId === 'CONFIGURATION_REQUIRED' ? 'YOUR_AZURE_CLIENT_ID_FOR_LOCALHOST' : msalClientId;
        // The Google Client ID provided by the user
        googleClientId = googleClientId === 'CONFIGURATION_REQUIRED' ? '436941729211-00tc5fdl74l0hc3q1qotfknh0v86h72i.apps.googleusercontent.com' : googleClientId;
        googleApiKey = googleApiKey === 'OPTIONAL_GOOGLE_API_KEY' ? 'YOUR_OPTIONAL_GOOGLE_API_KEY_FOR_LOCALHOST' : googleApiKey;

        if (msalClientId === 'YOUR_AZURE_CLIENT_ID_FOR_LOCALHOST') {
            console.warn('[CONFIG] Localhost: MSAL Client ID is a placeholder. Update config.template.js (or config.js) or set VITE_AZURE_CLIENT_ID.');
        }
        if (googleClientId === '436941729211-00tc5fdl74l0hc3q1qotfknh0v86h72i.apps.googleusercontent.com') {
             console.warn('[CONFIG] Localhost: Google Client ID is the provided ID. If this is a placeholder, update config.template.js (or config.js) or set VITE_GOOGLE_CLIENT_ID.');
        }
        if (googleApiKey === 'YOUR_OPTIONAL_GOOGLE_API_KEY_FOR_LOCALHOST') {
            console.warn('[CONFIG] Localhost: Google API Key is a placeholder. Update config.template.js (or config.js) or set VITE_GOOGLE_API_KEY.');
        }
    }

    // 3. SOLUTION GITHUB PAGES / Configuration via localStorage (si applicable)
    if (environment.isGitHubPages) {
        // This part would typically be handled by a specific setup page
        // or a different deployment strategy for GitHub Pages.
        // For a public GitHub Pages site, exposing client IDs directly in JS is usually not recommended.
        const storedConfig = JSON.parse(localStorage.getItem('appConfig')) || {};
        msalClientId = storedConfig.msalClientId || msalClientId;
        googleClientId = storedConfig.googleClientId || googleClientId;
        googleApiKey = storedConfig.googleApiKey || googleApiKey;

        if (msalClientId === 'CONFIGURATION_REQUIRED') {
            console.warn('[CONFIG] GitHub Pages: MSAL Client ID not found in localStorage. Consider a setup page.');
        }
        if (googleClientId === 'CONFIGURATION_REQUIRED') {
            console.warn('[CONFIG] GitHub Pages: Google Client ID not found in localStorage. Consider a setup page.');
        }
        if (googleApiKey === 'OPTIONAL_GOOGLE_API_KEY') {
            console.warn('[CONFIG] GitHub Pages: Google API Key not found in localStorage. Consider a setup page.');
        }
    }

    // Default for 'other' or if not found
    msalClientId = msalClientId === 'CONFIGURATION_REQUIRED' ? 'YOUR_AZURE_CLIENT_ID_DEFAULT' : msalClientId;
    googleClientId = googleClientId === 'CONFIGURATION_REQUIRED' ? 'YOUR_GOOGLE_CLIENT_ID_DEFAULT' : googleClientId;
    googleApiKey = googleApiKey === 'OPTIONAL_GOOGLE_API_KEY' ? 'YOUR_OPTIONAL_GOOGLE_API_KEY_DEFAULT' : googleApiKey;


    return { msalClientId, googleClientId, googleApiKey };
}

const env = detectEnvironment();
const { msalClientId, googleClientId, googleApiKey } = getClientIds(env);

// The global AppConfig object that the rest of your application will use
window.AppConfig = {
    environment: env,
    basePath: "/", // Base path of your application

    msal: {
        auth: {
            clientId: msalClientId,
            authority: "https://login.microsoftonline.com/common", // "common" for multi-tenant apps
            // Dynamic redirect URI based on environment
            redirectUri: env.isLocalhost ? "http://localhost:8080/auth-callback.html" : "https://emailsortpro.netlify.app/auth-callback.html",
        },
        cache: {
            cacheLocation: "localStorage",
            storeAuthStateInCookie: false,
        },
        system: {
            loggerOptions: {
                loggerCallback: (level, message, containsPii) => {
                    if (containsPii) {
                        return;
                    }
                    switch (level) {
                        case msal.LogLevel.Error:
                            console.error(message);
                            return;
                        case msal.LogLevel.Info:
                            console.info(message);
                            return;
                        case msal.LogLevel.Verbose:
                            console.debug(message);
                            return;
                        case msal.LogLevel.Warning:
                            console.warn(message);
                            return;
                    }
                },
                piiLoggingEnabled: false
            }
        },
        scopes: [
            "User.Read",
            "Mail.Read",
            "Mail.ReadBasic",
            "Mail.ReadWrite",
            "Mail.Send",
            "offline_access" // Important for refreshing tokens
        ]
    },

    google: {
        clientId: googleClientId, // Your Google Client ID
        apiKey: googleApiKey, // Optional, only if you use other Google APIs that require it (e.g., Maps, Analytics)
        scopes: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            // Add other necessary Gmail scopes here as needed for your application functionality
            // For example: "https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/gmail.compose"
        ],
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
        // IMPORTANT: These must match the "Authorized JavaScript origins" in your Google Cloud Console
        redirectUris: [
            "https://emailsortpro.netlify.app",
            "http://localhost:8080" // or your local development server, adjust port as needed
            // Add other origins if your app is hosted elsewhere for development/testing
        ]
    },

    validate: function() {
        const issues = [];
        // MSAL Validation
        if (!this.msal || !this.msal.auth || !this.msal.auth.clientId || this.msal.auth.clientId === 'CONFIGURATION_REQUIRED' || this.msal.auth.clientId === 'YOUR_AZURE_CLIENT_ID_FOR_LOCALHOST' || this.msal.auth.clientId === 'YOUR_AZURE_CLIENT_ID_DEFAULT') {
            issues.push('MSAL configuration is incomplete or client ID is a placeholder. Please update.');
        }
        if (!this.msal.auth.redirectUri) {
             issues.push('MSAL redirectUri is not defined.');
        } else if (this.environment.isLocalhost && !this.msal.auth.redirectUri.startsWith('http://localhost')) {
            issues.push(`MSAL redirectUri "${this.msal.auth.redirectUri}" does not match localhost environment.`);
        } else if (this.environment.isNetlify && !this.msal.auth.redirectUri.startsWith('https://emailsortpro.netlify.app')) {
            issues.push(`MSAL redirectUri "${this.msal.auth.redirectUri}" does not match Netlify environment.`);
        }
        if (!this.msal.scopes || this.msal.scopes.length === 0) {
            issues.push('MSAL scopes are not defined.');
        }

        // Google Validation
        if (!this.google || !this.google.clientId || this.google.clientId === 'CONFIGURATION_REQUIRED' || this.google.clientId === 'YOUR_GOOGLE_CLIENT_ID_DEFAULT') {
            issues.push('Google configuration is incomplete or client ID is a placeholder. Please update.');
        } else if (this.google.clientId === '436941729211-00tc5fdl74l0hc3q1qotfknh0v86h72i.apps.googleusercontent.com' && this.environment.type !== 'localhost') {
            // This is the specific client ID you provided. If it's intended for production, remove this check.
            // If it's a temp/test ID, keep this warning.
            // For now, assuming it's the intended production ID if not localhost.
            // issues.push('Google Client ID appears to be the provided ID but environment is not localhost. Ensure this is your production ID.');
        }
        if (!this.google.scopes || this.google.scopes.length === 0) {
            issues.push('Google scopes are not defined.');
        }
        if (!this.google.redirectUris || !Array.isArray(this.google.redirectUris) || this.google.redirectUris.length === 0) {
            issues.push('Google redirectUris (Authorized JavaScript origins) are not defined or are empty.');
        } else if (!this.google.redirectUris.includes(window.location.origin)) {
            issues.push(`Current origin "${window.location.origin}" is not listed in Google redirectUris. Ensure it's configured as an Authorized JavaScript Origin in Google Cloud Console.`);
        }
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
};

// Fonction de diagnostic consolidée pour la configuration
window.diagnoseAppConfig = function() {
    console.group('AppConfig Diagnostic');
    const validation = window.AppConfig.validate();
    const debug = {
        environment: window.AppConfig.environment,
        msalClientId: window.AppConfig.msal.auth.clientId,
        googleClientId: window.AppConfig.google.clientId,
        googleApiKey: window.AppConfig.google.apiKey,
        msalRedirectUri: window.AppConfig.msal.auth.redirectUri,
        googleRedirectUris: window.AppConfig.google.redirectUris,
        currentOrigin: window.location.origin,
        currentUrl: window.location.href,
        // Check for Vite environment variables only if typeof import.meta is 'object'
        netlifyEnvVars: {
            msal: typeof import.meta !== 'undefined' && import.meta.env?.VITE_AZURE_CLIENT_ID !== 'undefined' ? import.meta.env.VITE_AZURE_CLIENT_ID : 'N/A (check if running with Vite/on Netlify)',
            google: typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID !== 'undefined' ? import.meta.env.VITE_GOOGLE_CLIENT_ID : 'N/A (check if running with Vite/on Netlify)'
        }
    };

    console.log('--- Configuration Summary ---');
    console.log('Environment:', debug.environment.type);
    console.log('MSAL Client ID:', debug.msalClientId);
    console.log('Google Client ID:', debug.googleClientId);
    console.log('Google API Key:', debug.googleApiKey);
    console.log('MSAL Redirect URI (configured):', debug.msalRedirectUri);
    console.log('Google Authorized JS Origins (configured):', debug.googleRedirectUris);
    console.log('Current Origin:', debug.currentOrigin);
    console.log('Current URL:', debug.currentUrl);

    console.log('--- Validation Results ---');
    if (!validation.valid) {
        console.error('❌ Configuration Issues Found:');
        validation.issues.forEach(issue => console.error(`  - ${issue}`));
    } else {
        console.log('✅ Configuration is valid according to checks.');
    }

    console.log('--- Environment Specific Hints ---');
    if (debug.environment.isNetlify) {
        console.log('💡 Suggestions for Netlify:');
        console.log('  - Ensure VITE_AZURE_CLIENT_ID and VITE_GOOGLE_CLIENT_ID are set as environment variables in Netlify site settings.');
        console.log('  - Verify that the MSAL Redirect URI in Azure matches your Netlify deployment URL + /auth-callback.html.');
        console.log('  - Verify that your Google Cloud Console "Authorized JavaScript origins" include your Netlify URL (e.g., https://emailsortpro.netlify.app).');
    } else if (debug.environment.isLocalhost) {
        console.log('💡 Suggestions for Localhost:');
        console.log('  - Ensure http://localhost:PORT is added to "Authorized JavaScript origins" in Google Cloud Console.');
        console.log('  - Ensure http://localhost:PORT/auth-callback.html is added to "Redirect URIs" in Azure AD App Registration.');
        console.log('  - Replace placeholder Client IDs (YOUR_..._FOR_LOCALHOST) in config.template.js (or config.js) if you are testing with your own app registrations locally.');
    } else if (debug.environment.isGitHubPages) {
        console.log('💡 Suggestions for GitHub Pages:');
        console.log('  - For GitHub Pages, consider a secure way to inject client IDs (e.g., via a build script or a separate setup page that stores in localStorage).');
        console.log('  - Verify redirect URIs/origins in Azure/Google Cloud Console for your GitHub Pages URL.');
    }

    console.groupEnd();
    return { debug, validation };
};

// Messages de confirmation au chargement
console.log('✅ AppConfig loaded for emailsortpro.netlify.app v4.0 (with Google OAuth)');
console.log(`📱 MSAL Client ID: ${window.AppConfig.msal.auth.clientId}`);
console.log(`📧 Google Client ID: ${window.AppConfig.google.clientId}`);
console.log(`🌐 Environnement: ${window.AppConfig.environment.type}`);
console.log('🔍 Utilisez diagnoseAppConfig() pour un diagnostic détaillé.');

// Exécuter un diagnostic léger au chargement pour les erreurs critiques
setTimeout(() => {
    window.diagnoseAppConfig(); // Runs the full diagnostic on load
}, 2000);
