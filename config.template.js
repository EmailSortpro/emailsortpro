// config.js - Configuration sécurisée pour production
// Version GitHub-safe - Les clés sensibles sont gérées par les variables d'environnement

// Fonction pour récupérer la clé API de manière sécurisée
function getSecureClientId() {
    // 1. Essayer les variables d'environnement Netlify
    if (typeof process !== 'undefined' && process.env?.VITE_AZURE_CLIENT_ID) {
        return process.env.VITE_AZURE_CLIENT_ID;
    }
    
    // 2. Essayer depuis les variables globales injectées au build
    if (window.ENV?.VITE_AZURE_CLIENT_ID) {
        return window.ENV.VITE_AZURE_CLIENT_ID;
    }
    
    // 3. Essayer le localStorage (configuré par l'utilisateur)
    const savedClientId = localStorage.getItem('emailsortpro_client_id');
    if (savedClientId && savedClientId !== 'VOTRE_CLIENT_ID_ICI') {
        return savedClientId;
    }
    
    // 4. Valeur par défaut qui force la configuration
    return 'CONFIGURATION_REQUISE';
}

// Fonction pour détecter l'environnement
function getEnvironment() {
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
        return 'development';
    }
    if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('github.io')) {
        return 'production';
    }
    return 'production';
}

// Configuration principale
window.AppConfig = {
    // Configuration MSAL - Clé sécurisée
    msal: {
        clientId: getSecureClientId(),
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin + (window.location.pathname.includes('/emailsortpro') ? '/emailsortpro' : '') + '/auth-callback.html',
        postLogoutRedirectUri: window.location.origin + (window.location.pathname.includes('/emailsortpro') ? '/emailsortpro' : ''),
        
        // Configuration cache optimisée
        cache: {
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: false
        },
        
        // Configuration système avec logging adaptatif
        system: {
            loggerOptions: {
                loggerCallback: (level, message, containsPii) => {
                    if (getEnvironment() === 'development' || window.debugMode) {
                        console.log(`[MSAL ${level}] ${message}`);
                    }
                },
                piiLoggingEnabled: false,
                logLevel: getEnvironment() === 'development' ? 'Verbose' : 'Warning'
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
        version: '2.1.0',
        debug: getEnvironment() === 'development',
        environment: getEnvironment(),
        buildDate: new Date().toISOString(),
        supportedPlatforms: ['netlify', 'github-pages', 'local']
    },
    
    // Configuration des emails
    email: {
        defaultFolder: 'inbox',
        defaultDays: 30,
        pageSize: 100,
        maxEmails: 10000,
        retryAttempts: 3,
        retryDelay: 2000
    },
    
    // Messages d'erreur localisés
    errors: {
        'unauthorized_client': 'Configuration Azure incorrecte. Vérifiez votre Client ID dans les paramètres.',
        'invalid_client': 'Application non autorisée. Contactez l\'administrateur système.',
        'consent_required': 'Autorisation requise. Veuillez accepter les permissions Microsoft.',
        'interaction_required': 'Reconnexion requise pour des raisons de sécurité.',
        'login_required': 'Connexion requise pour accéder à cette fonctionnalité.',
        'network_error': 'Erreur réseau. Vérifiez votre connexion internet.',
        'token_expired': 'Session expirée. Reconnexion automatique en cours...',
        'popup_blocked': 'Popup bloqué. Autorisez les popups pour ce site.',
        'configuration_missing': 'Configuration requise. Cliquez sur "Configurer" pour commencer.',
        'AADSTS900144': 'Erreur de configuration Azure. Actualisez la page et réessayez.'
    },
    
    // Méthode de validation renforcée
    validate() {
        const issues = [];
        const clientId = this.msal.clientId;
        
        // Vérifications du client ID
        if (!clientId) {
            issues.push('Client ID manquant - Configuration requise');
        } else if (clientId === 'CONFIGURATION_REQUISE') {
            issues.push('Configuration non effectuée - Utilisez la page de configuration');
        } else if (clientId === 'VOTRE_CLIENT_ID_ICI') {
            issues.push('Client ID par défaut détecté - Configuration requise');
        } else if (clientId.length < 30) {
            issues.push('Client ID invalide - Format incorrect');
        } else if (!/^[a-f0-9-]{36}$/i.test(clientId)) {
            issues.push('Format Client ID invalide - Doit être un GUID Azure');
        }
        
        // Vérifications de l'autorité
        if (!this.msal.authority || !this.msal.authority.includes('microsoftonline.com')) {
            issues.push('URL d\'autorité Azure invalide');
        }
        
        // Vérifications des URI de redirection
        if (!this.msal.redirectUri || !this.msal.redirectUri.includes(window.location.hostname)) {
            issues.push('URI de redirection incompatible avec le domaine actuel');
        }
        
        // Vérifications des scopes
        if (!this.scopes.login || this.scopes.login.length === 0) {
            issues.push('Scopes de connexion manquants');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues,
            clientId: clientId,
            environment: this.app.environment,
            configurationMethod: this.getConfigurationSource()
        };
    },
    
    // Méthode pour obtenir des informations de debug détaillées
    getDebugInfo() {
        const validation = this.validate();
        return {
            // Informations sur l'environnement
            environment: {
                hostname: window.location.hostname,
                origin: window.location.origin,
                pathname: window.location.pathname,
                userAgent: navigator.userAgent,
                platform: navigator.platform
            },
            
            // Informations sur la configuration
            configuration: {
                valid: validation.valid,
                issues: validation.issues,
                clientIdLength: this.msal.clientId ? this.msal.clientId.length : 0,
                clientIdFormat: this.msal.clientId ? (this.msal.clientId.includes('-') ? 'GUID' : 'Invalid') : 'Missing',
                configSource: this.getConfigurationSource(),
                environment: this.app.environment
            },
            
            // Informations sur le navigateur
            browser: {
                localStorage: typeof Storage !== 'undefined',
                localStorageKeys: typeof Storage !== 'undefined' ? Object.keys(localStorage).length : 0,
                cookies: navigator.cookieEnabled,
                online: navigator.onLine
            },
            
            // Informations temporelles
            timestamps: {
                configLoad: new Date().toISOString(),
                buildDate: this.app.buildDate,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            
            // Informations sur les dépendances
            dependencies: {
                msalAvailable: typeof msal !== 'undefined',
                msalVersion: window.msal?.version || 'Unknown'
            }
        };
    },
    
    // Méthode pour identifier la source de configuration
    getConfigurationSource() {
        if (typeof process !== 'undefined' && process.env?.VITE_AZURE_CLIENT_ID) {
            return 'environment-variables';
        }
        if (window.ENV?.VITE_AZURE_CLIENT_ID) {
            return 'build-injection';
        }
        if (localStorage.getItem('emailsortpro_client_id')) {
            return 'user-configuration';
        }
        return 'default-fallback';
    },
    
    // Méthode pour forcer la revalidation
    forceValidate() {
        console.log('[CONFIG] Force validation started...');
        
        const validation = this.validate();
        const debugInfo = this.getDebugInfo();
        
        console.log('[CONFIG] Validation result:', validation);
        console.log('[CONFIG] Debug info:', debugInfo);
        
        if (!validation.valid) {
            console.error('[CONFIG] CONFIGURATION CRITIQUE:', validation.issues);
            
            // Afficher une notification d'erreur pour l'utilisateur
            this.showConfigurationError(validation, debugInfo);
            
            return {
                valid: false,
                issues: validation.issues,
                debug: debugInfo,
                needsSetup: true
            };
        }
        
        console.log('[CONFIG] ✅ Configuration validée avec succès');
        return { 
            valid: true, 
            debug: debugInfo,
            needsSetup: false
        };
    },
    
    // Méthode pour afficher les erreurs de configuration
    showConfigurationError(validation, debugInfo) {
        // Vérifier si on doit rediriger vers setup
        if (validation.issues.some(issue => issue.includes('Configuration non effectuée') || issue.includes('Configuration requise'))) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('setup.html')) {
                console.log('[CONFIG] Redirection vers la page de configuration...');
                setTimeout(() => {
                    const basePath = window.location.pathname.includes('/emailsortpro') ? '/emailsortpro' : '';
                    window.location.href = window.location.origin + basePath + '/setup.html';
                }, 2000);
            }
        }
        
        // Afficher une notification si l'UI Manager est disponible
        if (window.uiManager && typeof window.uiManager.showToast === 'function') {
            const mainIssue = validation.issues[0] || 'Configuration requise';
            window.uiManager.showToast(
                `Configuration : ${mainIssue}`,
                'warning',
                8000
            );
        }
    },
    
    // Méthode pour mettre à jour la configuration
    updateConfiguration(newClientId, save = true) {
        if (!newClientId || newClientId.length < 30) {
            throw new Error('Client ID invalide');
        }
        
        this.msal.clientId = newClientId;
        
        if (save) {
            localStorage.setItem('emailsortpro_client_id', newClientId);
            console.log('[CONFIG] Configuration mise à jour et sauvegardée');
        }
        
        // Revalider après mise à jour
        return this.forceValidate();
    },
    
    // Méthode pour réinitialiser la configuration
    resetConfiguration() {
        const keysToRemove = [
            'emailsortpro_client_id',
            'emailsortpro_tenant_id',
            'emailsortpro_config_version'
        ];
        
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('[CONFIG] Erreur lors de la suppression de', key);
            }
        });
        
        this.msal.clientId = 'CONFIGURATION_REQUISE';
        console.log('[CONFIG] Configuration réinitialisée');
        
        return this.forceValidate();
    }
};

// Validation automatique au chargement
(function autoValidate() {
    console.log('[CONFIG] Validation automatique au chargement...');
    
    // Vérifier que la configuration a été créée
    if (!window.AppConfig) {
        console.error('[CONFIG] ERREUR CRITIQUE: AppConfig non créé!');
        return;
    }
    
    // Attendre que le DOM soit prêt pour les vérifications avancées
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AppConfig.forceValidate();
        });
    } else {
        window.AppConfig.forceValidate();
    }
})();

// Fonction de diagnostic globale améliorée
window.diagnoseMSALConfig = function() {
    console.group('🔍 DIAGNOSTIC CONFIGURATION MSAL COMPLET');
    
    try {
        const config = window.AppConfig;
        const debug = config.getDebugInfo();
        const validation = config.validate();
        
        console.log('📋 Configuration actuelle:', {
            clientId: config.msal.clientId?.substring(0, 8) + '...',
            authority: config.msal.authority,
            redirectUri: config.msal.redirectUri,
            environment: config.app.environment
        });
        
        console.log('✅ Validation:', validation);
        console.log('🐛 Debug complet:', debug);
        
        if (window.authService && typeof window.authService.getDiagnosticInfo === 'function') {
            console.log('🔐 AuthService:', window.authService.getDiagnosticInfo());
        }
        
        // Suggestions basées sur les problèmes détectés
        if (!validation.valid) {
            console.log('💡 Suggestions:');
            validation.issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
            
            if (validation.issues.some(i => i.includes('Configuration requise'))) {
                console.log('   🔧 Action: Allez sur /setup.html pour configurer');
            }
        }
        
        return { debug, validation };
        
    } catch (error) {
        console.error('❌ Diagnostic échoué:', error);
        return { error: error.message };
    } finally {
        console.groupEnd();
    }
};

// Messages de confirmation
console.log('✅ Configuration sécurisée chargée avec succès');
console.log(`📱 Mode: ${getEnvironment()}`);
console.log(`🔧 Source: ${window.AppConfig.getConfigurationSource()}`);
console.log('🔍 Utilisez diagnoseMSALConfig() pour diagnostiquer');

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.AppConfig;
}
