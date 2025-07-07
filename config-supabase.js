// config-supabase.js - Configuration Supabase avec récupération sécurisée des variables
// Version 4.0 - Optimisé pour Netlify Functions

(function() {
    'use strict';

    class SupabaseConfig {
        constructor() {
            this.url = '';
            this.anonKey = '';
            this.initialized = false;
            this.initializationError = null;
            
            console.log('[SupabaseConfig] Initializing configuration detector v4.0...');
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
                const response = await fetch('/.netlify/functions/get-supabase-config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        accessKey: 'emailsortpro-2025'
                    })
                });

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
                console.error('[SupabaseConfig] Netlify function error:', error);
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
                }
            };
        }

        async initialize() {
            if (this.initialized) {
                return true;
            }

            try {
                console.log('[SupabaseConfig] Starting initialization...');
                
                // 1. Essayer de détecter les variables d'environnement locales
                const envFound = await this.detectEnvironmentVariables();
                
                if (!envFound) {
                    // 2. Si pas trouvé localement, utiliser la fonction Netlify
                    console.log('[SupabaseConfig] Trying Netlify function...');
                    const functionLoaded = await this.loadFromNetlifyFunction();
                    
                    if (!functionLoaded) {
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
                
                throw error;
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
            this.initializationError = null;
            console.log('[SupabaseConfig] Configuration reset');
        }
    }

    // Créer l'instance globale
    window.supabaseConfig = new SupabaseConfig();

    // Fonction d'initialisation globale
    window.initializeSupabaseConfig = async function() {
        try {
            await window.supabaseConfig.initialize();
            return true;
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

    console.log('[SupabaseConfig] ✅ Configuration module loaded v4.0');
})();
