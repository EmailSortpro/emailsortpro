// config-supabase.js - Configuration Supabase avec auto-détection des variables d'environnement
// Version 3.0 - Compatible Netlify et développement local

class SupabaseConfig {
    constructor() {
        this.url = '';
        this.anonKey = '';
        this.initialized = false;
        this.initializationError = null;
        
        console.log('[SupabaseConfig] Initializing configuration detector...');
    }

    async detectEnvironmentVariables() {
        console.log('[SupabaseConfig] Detecting environment variables...');
        
        const possibleLocations = [
            // 1. Variables directement dans window
            { 
                url: window.VITE_SUPABASE_URL, 
                key: window.VITE_SUPABASE_ANON_KEY,
                source: 'window.VITE_*'
            },
            // 2. Variables dans window.env
            { 
                url: window.env?.VITE_SUPABASE_URL, 
                key: window.env?.VITE_SUPABASE_ANON_KEY,
                source: 'window.env'
            },
            // 3. Variables dans window.__env__
            { 
                url: window.__env__?.VITE_SUPABASE_URL, 
                key: window.__env__?.VITE_SUPABASE_ANON_KEY,
                source: 'window.__env__'
            },
            // 4. Variables dans import.meta.env (Vite)
            { 
                url: typeof import !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL, 
                key: typeof import !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY,
                source: 'import.meta.env'
            },
            // 5. Variables dans process.env (fallback)
            { 
                url: typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL, 
                key: typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY,
                source: 'process.env'
            }
        ];

        // Tenter de trouver les variables
        for (const location of possibleLocations) {
            if (location.url && location.key) {
                console.log(`[SupabaseConfig] ✅ Found variables in ${location.source}`);
                this.url = location.url;
                this.anonKey = location.key;
                return true;
            }
        }

        // Si pas trouvé, chercher dans les scripts injectés
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.textContent && script.textContent.includes('VITE_SUPABASE_URL')) {
                console.log('[SupabaseConfig] Found variables in injected script');
                // Essayer d'extraire les variables avec regex
                const urlMatch = script.textContent.match(/VITE_SUPABASE_URL\s*=\s*["']([^"']+)["']/);
                const keyMatch = script.textContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*["']([^"']+)["']/);
                
                if (urlMatch && keyMatch) {
                    this.url = urlMatch[1];
                    this.anonKey = keyMatch[1];
                    console.log('[SupabaseConfig] ✅ Extracted variables from script');
                    return true;
                }
            }
        }

        console.warn('[SupabaseConfig] ❌ No environment variables found');
        return false;
    }

    async loadFromNetlifyFunction() {
        console.log('[SupabaseConfig] Attempting to load from Netlify function...');
        
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

            if (!response.ok) {
                throw new Error(`Function returned ${response.status}`);
            }

            const data = await response.json();
            
            if (data.url && data.anonKey) {
                this.url = data.url;
                this.anonKey = data.anonKey;
                console.log('[SupabaseConfig] ✅ Loaded from Netlify function');
                return true;
            }
            
            throw new Error('Invalid response from function');
            
        } catch (error) {
            console.warn('[SupabaseConfig] Netlify function failed:', error.message);
            return false;
        }
    }

    getConfig() {
        if (!this.initialized) {
            throw new Error('SupabaseConfig not initialized. Call initialize() first.');
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
            
            // 1. Essayer de détecter les variables d'environnement
            const envFound = await this.detectEnvironmentVariables();
            
            if (!envFound) {
                // 2. Si pas trouvé et on est sur Netlify, essayer la fonction
                if (window.location.hostname.includes('netlify.app')) {
                    const functionLoaded = await this.loadFromNetlifyFunction();
                    
                    if (!functionLoaded) {
                        // 3. Utiliser des valeurs de test pour le développement
                        console.warn('[SupabaseConfig] Using test values - Configure your environment variables!');
                        this.url = 'https://placeholder.supabase.co';
                        this.anonKey = 'placeholder-key';
                    }
                } else {
                    // Développement local sans variables
                    throw new Error(
                        'Supabase configuration not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
                    );
                }
            }

            // Valider la configuration
            if (!this.url || !this.anonKey) {
                throw new Error('Invalid Supabase configuration');
            }

            // Vérifier que ce ne sont pas des placeholders
            if (this.url.includes('placeholder') || this.anonKey === 'placeholder-key') {
                console.warn('[SupabaseConfig] ⚠️ Using placeholder values - real connection will fail');
            }

            this.initialized = true;
            console.log('[SupabaseConfig] ✅ Configuration initialized successfully');
            console.log('[SupabaseConfig] URL:', this.url.substring(0, 30) + '...');
            
            return true;
            
        } catch (error) {
            console.error('[SupabaseConfig] ❌ Initialization failed:', error);
            this.initializationError = error;
            this.initialized = false;
            throw error;
        }
    }

    isConfigured() {
        return this.initialized && 
               this.url && 
               this.anonKey && 
               !this.url.includes('placeholder');
    }

    getStatus() {
        return {
            initialized: this.initialized,
            configured: this.isConfigured(),
            url: this.url ? this.url.substring(0, 30) + '...' : null,
            hasKey: !!this.anonKey,
            error: this.initializationError?.message || null
        };
    }
}

// Créer l'instance globale et l'initialiser
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

// Export des constantes de statut
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

console.log('[SupabaseConfig] ✅ Configuration module loaded v3.0');
