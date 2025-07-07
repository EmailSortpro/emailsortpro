// config-supabase.js - Configuration Supabase avec récupération sécurisée des variables
// Version 5.0 - Optimisé pour éviter les blocages

(function() {
    'use strict';

    class SupabaseConfig {
        constructor() {
            this.url = '';
            this.anonKey = '';
            this.initialized = false;
            this.initializing = false;
            this.initializationError = null;
            this.initPromise = null;
            
            console.log('[SupabaseConfig] Initializing configuration detector v5.0...');
        }

        async detectEnvironmentVariables() {
            console.log('[SupabaseConfig] Detecting environment variables...');
            
            // Vérifier les variables dans window (pour le développement local)
            const possibleLocations = [
                { 
                    url: window.VITE_SUPABASE_URL, 
                    key: window.VITE_SUPABASE_ANON_KEY,
                    source: 'window.VITE_*'
                },
                { 
                    url: window.env?.VITE_SUPABASE_URL, 
                    key: window.env?.VITE_SUPABASE_ANON_KEY,
                    source: 'window.env'
                }
            ];

            // Tenter de trouver les variables localement
            for (const location of possibleLocations) {
                if (location.url && location.key && 
                    !location.url.includes('${') && 
                    !location.key.includes('${')) {
                    console.log(`[SupabaseConfig] ✅ Found variables in ${location.source}`);
                    this.url = location.url;
                    this.anonKey = location.key;
                    return true;
                }
            }

            console.log('[SupabaseConfig] No local environment variables found');
            return false;
        }

        async loadFromNetlifyFunction() {
            console.log('[SupabaseConfig] Loading from Netlify function...');
            
            try {
                // Timeout de 5 secondes pour éviter les blocages
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch('/.netlify/functions/get-supabase-config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        accessKey: 'emailsortpro-2025'
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                console.log('[SupabaseConfig] Function response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[SupabaseConfig] Function error response:', errorText);
                    throw new Error(`Function returned ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                console.log('[SupabaseConfig] Function response received');
                
                if (data.url && data.anonKey) {
                    this.url = data.url;
                    this.anonKey = data.anonKey;
                    console.log('[SupabaseConfig] ✅ Configuration loaded from Netlify function');
                    console.log('[SupabaseConfig] URL starts with:', this.url.substring(0, 20) + '...');
                    return true;
                }
                
                console.error('[SupabaseConfig] Invalid response data:', data);
                throw new Error('Invalid response: missing url or anonKey');
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.error('[SupabaseConfig] Function timeout after 5 seconds');
                } else {
                    console.error('[SupabaseConfig] Netlify function error:', error);
                }
                return false;
            }
        }

        getConfig() {
            if (!this.initialized) {
                throw new Error('SupabaseConfig not initialized. Call initialize() first.');
            }

            if (!this.url || !this.anonKey) {
                throw new Error('Supabase configuration is incomplete');
            }

            return {
                url: this.url,
                anonKey: this.anonKey,
                auth: {
                    autoRefreshToken: true,
                    persistSession: false,
                    detectSessionInUrl: false
                },
                global: {
                    headers: {
                        'X-Client-Info': 'emailsortpro-analytics'
                    }
                },
                db: {
                    schema: 'public'
                },
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            };
        }

        async initialize() {
            // Si déjà initialisé, retourner immédiatement
            if (this.initialized) {
                return true;
            }
            
            // Si une initialisation est en cours, attendre
            if (this.initializing && this.initPromise) {
                return this.initPromise;
            }
            
            // Commencer l'initialisation
            this.initializing = true;
            
            this.initPromise = this._doInitialize();
            
            try {
                const result = await this.initPromise;
                return result;
            } finally {
                this.initializing = false;
            }
        }
        
        async _doInitialize() {
            try {
                console.log('[SupabaseConfig] Starting initialization...');
                
                // 1. Essayer de détecter les variables d'environnement locales
                const envFound = await this.detectEnvironmentVariables();
                
                if (!envFound) {
                    // 2. Si pas trouvé localement, utiliser la fonction Netlify
                    console.log('[SupabaseConfig] Trying Netlify function...');
                    const functionLoaded = await this.loadFromNetlifyFunction();
                    
                    if (!functionLoaded) {
                        // Utiliser des valeurs par défaut si tout échoue
                        console.warn('[SupabaseConfig] Using fallback configuration');
                        throw new Error(
                            'Unable to load Supabase configuration. Please check your environment setup.'
                        );
                    }
                }

                // Valider la configuration
                if (!this.url || !this.anonKey) {
                    throw new Error('Invalid Supabase configuration: missing URL or key');
                }

                // Vérifier que l'URL est valide
                try {
                    new URL(this.url);
                } catch (e) {
                    throw new Error('Invalid Supabase URL format');
                }

                this.initialized = true;
                console.log('[SupabaseConfig] ✅ Configuration initialized successfully');
                
                return true;
                
            } catch (error) {
                console.error('[SupabaseConfig] ❌ Initialization failed:', error);
                this.initializationError = error;
                this.initialized = false;
                
                // Reset values on error
                this.url = '';
                this.anonKey = '';
                
                // Ne pas propager l'erreur pour éviter de bloquer l'application
                return false;
            }
        }

        isConfigured() {
            return this.initialized && 
                   this.url && 
                   this.anonKey && 
                   this.url.startsWith('https://');
        }

        getStatus() {
            return {
                initialized: this.initialized,
                initializing: this.initializing,
                configured: this.isConfigured(),
                hasUrl: !!this.url && this.url.startsWith('https://'),
                hasKey: !!this.anonKey && this.anonKey.length > 20,
                error: this.initializationError?.message || null
            };
        }

        reset() {
            this.url = '';
            this.anonKey = '';
            this.initialized = false;
            this.initializing = false;
            this.initializationError = null;
            this.initPromise = null;
            console.log('[SupabaseConfig] Configuration reset');
        }
        
        // Méthode pour obtenir une configuration de fallback
        getFallbackConfig() {
            console.warn('[SupabaseConfig] Using fallback configuration');
            return {
                url: 'https://fallback.supabase.co',
                anonKey: 'fallback-key',
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                    detectSessionInUrl: false
                },
                offline: true
            };
        }
    }

    // Créer l'instance globale
    window.supabaseConfig = new SupabaseConfig();

    // Fonction d'initialisation globale avec gestion d'erreur
    window.initializeSupabaseConfig = async function() {
        try {
            const result = await window.supabaseConfig.initialize();
            if (!result) {
                console.warn('[SupabaseConfig] Initialization failed, app will work in offline mode');
            }
            return result;
        } catch (error) {
            console.error('[SupabaseConfig] Global initialization failed:', error);
            return false;
        }
    };

    // Export des constantes
    window.LICENSE_STATUS = {
        TRIAL: 'trial',
        ACTIVE: 'active',
        EXPIRED: 'expired',
        BLOCKED: 'blocked'
    };

    window.USER_ROLES = {
        SUPER_ADMIN: 'super_admin',
        COMPANY_ADMIN: 'company_admin',
        USER: 'user'
    };

    console.log('[SupabaseConfig] ✅ Configuration module loaded v5.0');
})();
