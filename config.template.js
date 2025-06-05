// config.template.js - Template de configuration pour EmailSortPro
// 
// ⚠️ INSTRUCTIONS IMPORTANTES:
// 1. Copiez ce fichier et renommez-le en 'config.js'
// 2. Remplacez 'VOTRE_CLIENT_ID_ICI' par votre vrai Client ID Azure
// 3. NE JAMAIS commiter config.js sur GitHub (il est dans .gitignore)
// 4. Ce fichier template peut être partagé en toute sécurité
//
// 📖 Pour obtenir votre Client ID, suivez le guide : AZURE-SETUP-GUIDE.md

window.AppConfig = {
    // Configuration MSAL - REMPLACEZ CETTE VALEUR
    msal: {
        clientId: 'VOTRE_CLIENT_ID_ICI', // <-- 🔧 REMPLACEZ ICI avec votre Client ID Azure
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin + '/auth-callback.html',
        postLogoutRedirectUri: window.location.origin,
        
        cache: {
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: false
        },
        
        system: {
            loggerOptions: {
                loggerCallback: (level, message, containsPii) => {
                    if (window.debugMode) {
                        console.log(`[MSAL ${level}] ${message}`);
                    }
                },
                piiLoggingEnabled: false,
                logLevel: 'Warning'
            },
            allowNativeBroker: false
        }
    },
    
    // Scopes Microsoft Graph
    scopes: {
        login: [
            'https://graph.microsoft.com/User.Read',
            'https://graph.microsoft.com/Mail.Read',
            'https://graph.microsoft.com/Mail.ReadWrite'
        ],
        silent: [
            'https://graph.microsoft.com/User.Read',
            'https://graph.microsoft.com/Mail.Read',
            'https://graph.microsoft.com/Mail.ReadWrite'
        ]
    },
    
    // Configuration de l'application
    app: {
        name: 'EmailSortPro',
        version: '2.0.3',
        debug: false,
        maxRetries: 3,
        retryDelay: 2000
    },
    
    // Configuration des emails
    email: {
        defaultFolder: 'inbox',
        defaultDays: 30,
        pageSize: 100,
        maxEmails: 10000
    },
    
    // Messages d'erreur personnalisés
    errors: {
        'unauthorized_client': 'Configuration Azure incorrecte. Vérifiez votre Client ID.',
        'invalid_client': 'Application non autorisée. Contactez l\'administrateur.',
        'consent_required': 'Autorisation requise. Veuillez accepter les permissions.',
        'interaction_required': 'Reconnexion requise.',
        'login_required': 'Connexion requise.',
        'network_error': 'Erreur réseau. Vérifiez votre connexion.',
        'token_expired': 'Session expirée. Reconnexion nécessaire.',
        'AADSTS900144': 'Erreur de configuration client_id. Actualisation requise.'
    },
    
    // Validation de la configuration
    validate() {
        const issues = [];
        
        if (!this.msal.clientId || this.msal.clientId === 'VOTRE_CLIENT_ID_ICI') {
            issues.push('Client ID non configuré - Veuillez éditer config.js');
        } else if (!/^[a-f0-9-]{36}$/i.test(this.msal.clientId)) {
            issues.push('Format Client ID invalide (doit être un GUID)');
        }
        
        if (!this.msal.authority || !this.msal.authority.includes('microsoftonline.com')) {
            issues.push('Authority URL invalide');
        }
        
        if (!this.msal.redirectUri) {
            issues.push('Redirect URI manquant');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    },
    
    // Force validation (pour debug)
    forceValidate() {
        console.log('[CONFIG] Force validation...');
        const validation = this.validate();
        console.log('[CONFIG] Validation result:', validation);
        
        if (!validation.valid) {
            console.error('[CONFIG] Configuration invalide:', validation.issues);
        }
        
        return validation;
    },
    
    // Informations de debug
    getDebugInfo() {
        const validation = this.validate();
        return {
            hostname: window.location.hostname,
            origin: window.location.origin,
            isGitHubPages: window.location.hostname.includes('github.io'),
            configValid: validation.valid,
            configIssues: validation.issues,
            timestamp: new Date().toISOString()
        };
    }
};

// Message pour les développeurs
console.log('⚠️ CONFIG TEMPLATE CHARGÉ');
console.log('📋 Pour utiliser EmailSortPro :');
console.log('1️⃣ Copiez ce fichier et renommez-le en config.js');
console.log('2️⃣ Remplacez VOTRE_CLIENT_ID_ICI par votre Client ID Azure');
console.log('3️⃣ Suivez le guide AZURE-SETUP-GUIDE.md pour créer votre Client ID');
console.log('❓ Besoin d\'aide ? Consultez la documentation sur GitHub');