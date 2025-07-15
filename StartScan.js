// LicenseService.js - Service de gestion des licences simplifié v7.0
// Focus sur la simplicité et la fiabilité

class LicenseService {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initialized = false;
        this.initPromise = null;
        this.cachedLicenseStatus = null;
        this.cacheExpiry = null;
        
        // Domaines personnels
        this.personalDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
            'aol.com', 'icloud.com', 'protonmail.com', 'mail.com', 'gmx.com',
            'yandex.com', 'zoho.com', 'fastmail.com', 'tutanota.com',
            'yahoo.fr', 'orange.fr', 'free.fr', 'sfr.fr', 'laposte.net',
            'wanadoo.fr', 'bbox.fr', 'hotmail.fr', 'live.fr', 'outlook.fr'
        ];
        
        console.log('[LicenseService] Service v7.0 créé - Simplifié');
    }

    async initialize() {
        if (this.initialized) {
            return true;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._performInitialization();
        return this.initPromise;
    }

    async _performInitialization() {
        try {
            console.log('[LicenseService] Initialisation...');
            
            // Charger Supabase
            if (!window.supabase) {
                await this.loadSupabaseLibrary();
            }

            // Initialiser la configuration
            if (!window.supabaseConfig || !window.supabaseConfig.initialized) {
                await window.initializeSupabaseConfig();
            }

            // Créer le client Supabase
            const config = window.supabaseConfig.getConfig();
            this.supabase = window.supabase.createClient(
                config.url,
                config.anonKey,
                config.auth
            );

            console.log('[LicenseService] ✅ Client Supabase créé');
            
            this.initialized = true;
            return true;

        } catch (error) {
            console.error('[LicenseService] Erreur initialisation:', error);
            this.initialized = false;
            this.initPromise = null;
            throw error;
        }
    }

    async loadSupabaseLibrary() {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                console.log('[LicenseService] Bibliothèque Supabase chargée');
                resolve();
            };
            script.onerror = () => {
                console.error('[LicenseService] Échec chargement Supabase');
                reject(new Error('Échec chargement Supabase'));
            };
            document.head.appendChild(script);
        });
    }

    isPersonalDomain(email) {
        const domain = email.split('@')[1];
        return this.personalDomains.includes(domain.toLowerCase());
    }

    // MÉTHODE PRINCIPALE D'AUTHENTIFICATION
    async authenticateWithEmail(email) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            console.log('[LicenseService] Authentification:', email);
            
            // Vérifier le cache
            if (this.cachedLicenseStatus && this.cacheExpiry && new Date() < this.cacheExpiry) {
                const cachedUser = this.cachedLicenseStatus.user;
                if (cachedUser && cachedUser.email === email) {
                    console.log('[LicenseService] Utilisation du cache');
                    return this.cachedLicenseStatus;
                }
            }

            // Vérifier le statut
            const licenseStatus = await this.checkLicenseStatus(email);
            
            // Bloquer si expiré
            if (!licenseStatus.valid && licenseStatus.status === 'expired') {
                console.warn('[LicenseService] ❌ LICENCE EXPIRÉE');
                this.clearCache();
                return licenseStatus;
            }
            
            // Mettre en cache si valide
            if (licenseStatus.valid) {
                this.cachedLicenseStatus = licenseStatus;
                this.cacheExpiry = new Date(Date.now() + 60 * 60 * 1000);
                this.currentUser = licenseStatus.user;
                
                await this.updateLastLogin(licenseStatus.user.id);
            }
            
            return licenseStatus;

        } catch (error) {
            console.error('[LicenseService] Erreur auth:', error);
            
            // Utiliser le cache en cas d'erreur réseau
            if (this.cachedLicenseStatus && 
                this.cachedLicenseStatus.valid && 
                error.message.includes('network')) {
                console.log('[LicenseService] Erreur réseau, utilisation du cache');
                return { ...this.cachedLicenseStatus, offline: true };
            }
            
            return {
                valid: false,
                status: 'error',
                message: 'Erreur de vérification',
                error: error.message
            };
        }
    }

    async checkLicenseStatus(email) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            console.log('[LicenseService] Vérification licence pour:', email);
            
            // Essayer la fonction RPC
            try {
                const { data: rpcData, error: rpcError } = await this.supabase
                    .rpc('check_user_by_email', { user_email: email });
                
                if (!rpcError && rpcData && rpcData.length > 0) {
                    console.log('[LicenseService] Utilisateur trouvé via RPC');
                    const user = rpcData[0];
                    return this.processUserLicense(user);
                }
            } catch (rpcErr) {
                console.log('[LicenseService] RPC indisponible, requête directe');
            }
            
            // Requête directe
            const { data: users, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', email);

            if (error) {
                console.error('[LicenseService] Erreur DB:', error);
                return { 
                    valid: false, 
                    status: 'error',
                    message: 'Erreur de connexion'
                };
            }

            if (!users || users.length === 0) {
                console.log('[LicenseService] Utilisateur non trouvé');
                return { 
                    valid: false, 
                    status: 'not_found',
                    message: 'Compte non trouvé'
                };
            }

            const user = users[0];
            return this.processUserLicense(user);

        } catch (error) {
            console.error('[LicenseService] Erreur vérification:', error);
            return { 
                valid: false, 
                status: 'error',
                error: error.message,
                message: 'Erreur de vérification'
            };
        }
    }

    processUserLicense(user) {
        // Super admins toujours valides
        if (user.role === 'super_admin') {
            console.log('[LicenseService] Super admin - toujours valide');
            return {
                valid: true,
                status: 'active',
                user: user,
                message: 'Accès super administrateur'
            };
        }

        // Vérifier le statut
        const status = user.license_status;
        const startsAt = user.license_starts_at ? new Date(user.license_starts_at) : null;
        const expiresAt = user.license_expires_at ? new Date(user.license_expires_at) : null;
        const now = new Date();

        console.log('[LicenseService] Utilisateur:', {
            email: user.email,
            status: status,
            role: user.role,
            expires_at: expiresAt ? expiresAt.toISOString() : null
        });

        // Vérifier si bloqué
        if (status === 'blocked') {
            return { 
                valid: false, 
                status: 'blocked',
                message: 'Compte bloqué',
                user: user,
                requiresAction: true
            };
        }

        // Vérifier si pas encore commencé
        if (startsAt && startsAt > now) {
            return { 
                valid: false, 
                status: 'not_started',
                message: `Licence commence le ${startsAt.toLocaleDateString('fr-FR')}`,
                startsAt: startsAt,
                user: user,
                requiresAction: true
            };
        }

        // Vérifier expiration
        if (expiresAt && expiresAt < now) {
            const daysExpired = Math.ceil((now - expiresAt) / (1000 * 60 * 60 * 24));
            
            console.warn(`[LicenseService] ❌ LICENCE EXPIRÉE depuis ${daysExpired} jours`);
            
            return { 
                valid: false, 
                status: 'expired',
                message: `Licence expirée depuis ${daysExpired} jour${daysExpired > 1 ? 's' : ''}`,
                expiredAt: expiresAt,
                daysExpired: daysExpired,
                user: user,
                requiresAction: true,
                blockAccess: true
            };
        }

        // Calculer les jours restants
        let daysRemaining = null;
        let warningLevel = null;
        
        if (expiresAt) {
            daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
            
            if (daysRemaining <= 3) {
                warningLevel = 'critical';
            } else if (daysRemaining <= 7) {
                warningLevel = 'warning';
            } else if (daysRemaining <= 14) {
                warningLevel = 'info';
            }
        }

        // Licence valide
        return {
            valid: true,
            status: status || 'active',
            startsAt: startsAt,
            expiresAt: expiresAt,
            daysRemaining: daysRemaining,
            warningLevel: warningLevel,
            user: user,
            message: status === 'trial' && daysRemaining ? 
                `Période d'essai - ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}` : 
                'Licence active'
        };
    }

    // Créer un utilisateur avec essai
    async createUserWithTrial(email, accountType = 'professional', companyName = null) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            console.log('[LicenseService] Création utilisateur avec essai:', email);
            
            const domain = email.split('@')[1];
            const name = email.split('@')[0];
            const trialDays = 15;
            
            // Gestion société pour les comptes pro
            let companyId = null;
            let role = 'user';
            
            if (accountType === 'professional' && !this.isPersonalDomain(email)) {
                const company = await this.getOrCreateCompany(domain, companyName);
                if (company) {
                    companyId = company.id;
                    const isFirst = await this.isFirstUserOfCompany(company.id);
                    if (isFirst) {
                        role = 'company_admin';
                    }
                }
            }
            
            const startsAt = new Date();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + trialDays);

            const { data: userData, error: userError } = await this.supabase
                .from('users')
                .insert({
                    email: email,
                    name: name,
                    role: role,
                    company_id: companyId,
                    account_type: accountType,
                    license_status: 'trial',
                    license_starts_at: startsAt.toISOString(),
                    license_expires_at: expiresAt.toISOString(),
                    first_login_at: new Date().toISOString(),
                    last_login_at: new Date().toISOString(),
                    login_count: 1
                })
                .select()
                .single();

            if (userError) {
                console.error('[LicenseService] Erreur création:', userError);
                throw userError;
            }

            console.log('[LicenseService] ✅ Utilisateur créé avec essai');

            // Créer les stats
            await this.createUserStats(email, name, domain);

            return { success: true, user: userData };

        } catch (error) {
            console.error('[LicenseService] Erreur création:', error);
            return { success: false, error: error.message };
        }
    }

    async getOrCreateCompany(domain, companyName = null) {
        try {
            const { data: existing, error: searchError } = await this.supabase
                .from('companies')
                .select('*')
                .eq('domain', domain)
                .maybeSingle();

            if (existing) {
                return existing;
            }

            const name = companyName || domain.charAt(0).toUpperCase() + domain.slice(1).replace(/\.[^.]+$/, '');
            
            const { data: newCompany, error: createError } = await this.supabase
                .from('companies')
                .insert({
                    name: name,
                    domain: domain,
                    is_virtual: false
                })
                .select()
                .single();

            if (createError) {
                console.error('[LicenseService] Erreur création société:', createError);
                return null;
            }

            return newCompany;

        } catch (error) {
            console.error('[LicenseService] Erreur getOrCreateCompany:', error);
            return null;
        }
    }

    async isFirstUserOfCompany(companyId) {
        try {
            const { count, error } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', companyId);

            if (error) {
                console.error('[LicenseService] Erreur vérification:', error);
                return false;
            }

            return count === 0;

        } catch (error) {
            console.error('[LicenseService] Erreur isFirstUser:', error);
            return false;
        }
    }

    async createUserStats(email, name, domain) {
        try {
            const { error } = await this.supabase
                .from('user_email_stats')
                .insert({
                    email: email,
                    name: name,
                    domain: domain,
                    total_sessions: 1,
                    last_activity: new Date().toISOString()
                });

            if (error && error.code !== '23505') {
                console.error('[LicenseService] Erreur création stats:', error);
            }

        } catch (error) {
            console.error('[LicenseService] Erreur createUserStats:', error);
        }
    }

    async updateLastLogin(userId) {
        try {
            const { data: currentUser, error: fetchError } = await this.supabase
                .from('users')
                .select('login_count')
                .eq('id', userId)
                .single();
            
            if (fetchError) throw fetchError;
            
            const { error } = await this.supabase
                .from('users')
                .update({
                    last_login_at: new Date().toISOString(),
                    login_count: (currentUser?.login_count || 0) + 1
                })
                .eq('id', userId);

            if (error) throw error;

        } catch (error) {
            console.error('[LicenseService] Erreur updateLastLogin:', error);
        }
    }

    async updateUserLicenseStatus(userId, newStatus, expiresAt = null) {
        try {
            const updateData = {
                license_status: newStatus,
                updated_at: new Date().toISOString()
            };

            if (expiresAt) {
                updateData.license_expires_at = expiresAt;
            }

            const { error } = await this.supabase
                .from('users')
                .update(updateData)
                .eq('id', userId);

            if (error) throw error;

            this.clearCache();

            console.log('[LicenseService] Statut licence mis à jour:', newStatus);
            return { success: true };

        } catch (error) {
            console.error('[LicenseService] Erreur mise à jour:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        return this.currentUser;
    }

    isAdmin() {
        if (!this.currentUser) {
            return false;
        }
        
        return this.currentUser.role === 'company_admin' || 
               this.currentUser.role === 'super_admin';
    }

    isSuperAdmin() {
        return this.currentUser && this.currentUser.role === 'super_admin';
    }

    async getCompanyUsers() {
        try {
            if (!this.currentUser || !this.currentUser.company_id) {
                return [];
            }

            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('company_id', this.currentUser.company_id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];

        } catch (error) {
            console.error('[LicenseService] Erreur récupération utilisateurs:', error);
            return [];
        }
    }

    clearCache() {
        this.cachedLicenseStatus = null;
        this.cacheExpiry = null;
        console.log('[LicenseService] Cache vidé');
    }

    reset() {
        this.supabase = null;
        this.currentUser = null;
        this.initialized = false;
        this.initPromise = null;
        this.clearCache();
        console.log('[LicenseService] Service réinitialisé');
    }

    async debug() {
        return {
            initialized: this.initialized,
            hasSupabase: !!this.supabase,
            currentUser: this.currentUser ? {
                email: this.currentUser.email,
                status: this.currentUser.license_status,
                role: this.currentUser.role,
                company_id: this.currentUser.company_id,
                expiresAt: this.currentUser.license_expires_at
            } : null,
            hasCachedStatus: !!this.cachedLicenseStatus,
            cacheExpiry: this.cacheExpiry
        };
    }
}

// Créer l'instance globale
window.licenseService = new LicenseService();

console.log('[LicenseService] ✅ Service v7.0 chargé - Simplifié');
