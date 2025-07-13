// LicenseService.js - Service de gestion des licences EmailSortPro avec blocage strict
// Version 6.1 - Blocage effectif des licences expirées

class LicenseService {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initialized = false;
        this.initPromise = null;
        this.cachedLicenseStatus = null;
        this.cacheExpiry = null;
        
        // Domaines personnels connus
        this.personalDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
            'aol.com', 'icloud.com', 'protonmail.com', 'mail.com', 'gmx.com',
            'yandex.com', 'zoho.com', 'fastmail.com', 'tutanota.com', 'hushmail.com',
            'yahoo.fr', 'orange.fr', 'free.fr', 'sfr.fr', 'laposte.net',
            'wanadoo.fr', 'bbox.fr', 'hotmail.fr', 'live.fr', 'outlook.fr'
        ];
        
        console.log('[LicenseService] Service created v6.1 - With strict license enforcement');
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
            console.log('[LicenseService] Starting initialization...');
            
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

            console.log('[LicenseService] ✅ Supabase client created');
            
            this.initialized = true;
            return true;

        } catch (error) {
            console.error('[LicenseService] Initialization error:', error);
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
                console.log('[LicenseService] Supabase library loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('[LicenseService] Failed to load Supabase library');
                reject(new Error('Failed to load Supabase'));
            };
            document.head.appendChild(script);
        });
    }

    // Vérifier si un domaine est personnel
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

            console.log('[LicenseService] Authenticating user:', email);
            
            // Vérifier le cache d'abord
            if (this.cachedLicenseStatus && this.cacheExpiry && new Date() < this.cacheExpiry) {
                const cachedUser = this.cachedLicenseStatus.user;
                if (cachedUser && cachedUser.email === email) {
                    console.log('[LicenseService] Using cached license status');
                    return this.cachedLicenseStatus;
                }
            }

            // Vérifier le statut de la licence
            const licenseStatus = await this.checkLicenseStatus(email);
            
            // IMPORTANT: Bloquer immédiatement si la licence est expirée (sauf super admin)
            if (!licenseStatus.valid && licenseStatus.status === 'expired') {
                console.warn('[LicenseService] ❌ LICENSE EXPIRED - Blocking access');
                this.clearCache();
                return licenseStatus;
            }
            
            // Mettre en cache le résultat seulement si valide
            if (licenseStatus.valid) {
                this.cachedLicenseStatus = licenseStatus;
                this.cacheExpiry = new Date(Date.now() + 60 * 60 * 1000);
                this.currentUser = licenseStatus.user;
                
                // Mettre à jour la dernière connexion
                await this.updateLastLogin(licenseStatus.user.id);
            }
            
            return licenseStatus;

        } catch (error) {
            console.error('[LicenseService] Authentication error:', error);
            
            // En cas d'erreur réseau, utiliser le cache si disponible ET valide
            if (this.cachedLicenseStatus && 
                this.cachedLicenseStatus.valid && 
                error.message.includes('network')) {
                console.log('[LicenseService] Network error, using cached status');
                return { ...this.cachedLicenseStatus, offline: true };
            }
            
            return {
                valid: false,
                status: 'error',
                message: 'Erreur lors de la vérification de votre licence',
                error: error.message
            };
        }
    }

    async checkLicenseStatus(email) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            console.log('[LicenseService] Checking license status for:', email);
            
            // Essayer d'abord avec la fonction RPC
            try {
                const { data: rpcData, error: rpcError } = await this.supabase
                    .rpc('check_user_by_email', { user_email: email });
                
                if (!rpcError && rpcData && rpcData.length > 0) {
                    console.log('[LicenseService] User found via RPC');
                    const user = rpcData[0];
                    return this.processUserLicense(user);
                }
            } catch (rpcErr) {
                console.log('[LicenseService] RPC not available, using direct query');
            }
            
            // Requête directe en fallback
            const { data: users, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', email);

            if (error) {
                console.error('[LicenseService] Database error:', error);
                return { 
                    valid: false, 
                    status: 'error',
                    message: 'Erreur de connexion à la base de données. Veuillez réessayer.'
                };
            }

            if (!users || users.length === 0) {
                console.log('[LicenseService] User not found');
                return { 
                    valid: false, 
                    status: 'not_found',
                    message: 'Compte utilisateur non trouvé'
                };
            }

            const user = users[0];
            return this.processUserLicense(user);

        } catch (error) {
            console.error('[LicenseService] Error checking license:', error);
            return { 
                valid: false, 
                status: 'error',
                error: error.message,
                message: 'Erreur de vérification. Veuillez réessayer.'
            };
        }
    }

    // Traiter la licence d'un utilisateur
    processUserLicense(user) {
        // Les super admins ont toujours accès
        if (user.role === 'super_admin') {
            console.log('[LicenseService] Super admin user - always valid');
            return {
                valid: true,
                status: 'active',
                user: user,
                message: 'Accès super administrateur'
            };
        }

        // Vérifier le statut de licence
        const status = user.license_status;
        const startsAt = user.license_starts_at ? new Date(user.license_starts_at) : null;
        const expiresAt = user.license_expires_at ? new Date(user.license_expires_at) : null;
        const now = new Date();

        console.log('[LicenseService] User found:', {
            email: user.email,
            status: status,
            role: user.role,
            account_type: user.account_type,
            has_expiry: !!expiresAt,
            expires_at: expiresAt ? expiresAt.toISOString() : null,
            now: now.toISOString()
        });

        // Vérifier si bloqué
        if (status === 'blocked') {
            const adminContact = this.getAdminContact(user);
            return { 
                valid: false, 
                status: 'blocked',
                message: 'Votre compte a été bloqué. Contactez votre administrateur.',
                user: user,
                adminContact: adminContact,
                requiresAction: true
            };
        }

        // Vérifier si la licence n'a pas encore commencé
        if (startsAt && startsAt > now) {
            return { 
                valid: false, 
                status: 'not_started',
                message: `Votre licence commencera le ${startsAt.toLocaleDateString('fr-FR')}`,
                startsAt: startsAt,
                user: user,
                requiresAction: true
            };
        }

        // VÉRIFICATION CRITIQUE : Expiration de la licence
        if (expiresAt && expiresAt < now) {
            const adminContact = this.getAdminContact(user);
            const daysExpired = Math.ceil((now - expiresAt) / (1000 * 60 * 60 * 24));
            
            console.warn(`[LicenseService] ❌ LICENSE EXPIRED ${daysExpired} days ago for:`, user.email);
            
            return { 
                valid: false, 
                status: 'expired',
                message: `Votre licence a expiré depuis ${daysExpired} jour${daysExpired > 1 ? 's' : ''}`,
                detailedMessage: `Votre période d'essai de 15 jours est terminée. Pour continuer à utiliser EmailSortPro, veuillez contacter votre administrateur ou le support pour renouveler votre licence.`,
                expiredAt: expiresAt,
                daysExpired: daysExpired,
                user: user,
                adminContact: adminContact,
                requiresAction: true,
                blockAccess: true // Flag explicite pour bloquer l'accès
            };
        }

        // Calculer les jours restants
        let daysRemaining = null;
        let warningLevel = null;
        
        if (expiresAt) {
            daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
            
            // Définir le niveau d'avertissement
            if (daysRemaining <= 3) {
                warningLevel = 'critical';
            } else if (daysRemaining <= 7) {
                warningLevel = 'warning';
            } else if (daysRemaining <= 14) {
                warningLevel = 'info';
            }
        }

        // La licence est valide
        return {
            valid: true,
            status: status || 'active',
            startsAt: startsAt,
            expiresAt: expiresAt,
            daysRemaining: daysRemaining,
            warningLevel: warningLevel,
            user: user,
            message: status === 'trial' ? 
                `Période d'essai - ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}` : 
                'Licence active'
        };
    }

    // Obtenir le contact de l'administrateur
    getAdminContact(user) {
        // Pour les comptes individual, retourner le support
        if (user.account_type === 'individual') {
            return {
                email: 'support@emailsortpro.com',
                name: 'Support EmailSortPro',
                phone: '+33 1 xx xx xx xx'
            };
        }

        // Pour les comptes professional, retourner un contact admin générique
        const domain = user.email.split('@')[1];
        return {
            email: `admin@${domain}`,
            name: 'Administrateur de votre entreprise',
            fallbackEmail: 'support@emailsortpro.com'
        };
    }

    // Créer un nouvel utilisateur avec période d'essai
    async createUserWithTrial(email, accountType = 'professional', companyName = null) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            console.log('[LicenseService] Creating user with trial:', { email, accountType, companyName });
            
            const domain = email.split('@')[1];
            const name = email.split('@')[0];
            const trialDays = 15; // Période d'essai fixe de 15 jours
            
            // Pour les comptes professionnels, gérer la société
            let companyId = null;
            let role = 'user';
            
            if (accountType === 'professional' && !this.isPersonalDomain(email)) {
                const company = await this.getOrCreateCompany(domain, companyName);
                if (company) {
                    companyId = company.id;
                    // Vérifier si c'est le premier utilisateur
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
                console.error('[LicenseService] Error creating user:', userError);
                throw userError;
            }

            console.log('[LicenseService] ✅ User created with trial');

            // Créer les stats
            await this.createUserStats(email, name, domain);

            return { success: true, user: userData };

        } catch (error) {
            console.error('[LicenseService] Error creating user with trial:', error);
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
                console.error('[LicenseService] Error creating company:', createError);
                return null;
            }

            return newCompany;

        } catch (error) {
            console.error('[LicenseService] Error in getOrCreateCompany:', error);
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
                console.error('[LicenseService] Error checking first user:', error);
                return false;
            }

            return count === 0;

        } catch (error) {
            console.error('[LicenseService] Error in isFirstUserOfCompany:', error);
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

            if (error && error.code !== '23505') { // Ignorer les doublons
                console.error('[LicenseService] Error creating user stats:', error);
            }

        } catch (error) {
            console.error('[LicenseService] Error in createUserStats:', error);
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
            console.error('[LicenseService] Error updating last login:', error);
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

            // Invalider le cache
            this.clearCache();

            console.log('[LicenseService] Updated user license status to:', newStatus);
            return { success: true };

        } catch (error) {
            console.error('[LicenseService] Error updating license status:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserLicenseDates(userId, startDate, endDate) {
        try {
            const startsAt = new Date(startDate);
            const expiresAt = new Date(endDate);

            if (startsAt >= expiresAt) {
                return { success: false, error: 'La date de fin doit être après la date de début' };
            }

            const updateData = {
                license_starts_at: startsAt.toISOString(),
                license_expires_at: expiresAt.toISOString(),
                updated_at: new Date().toISOString()
            };

            // Déterminer le statut en fonction des dates
            const now = new Date();
            if (startsAt > now) {
                updateData.license_status = 'pending';
            } else if (expiresAt > now) {
                updateData.license_status = 'active';
            } else {
                updateData.license_status = 'expired';
            }

            const { error } = await this.supabase
                .from('users')
                .update(updateData)
                .eq('id', userId);

            if (error) throw error;

            // Invalider le cache
            this.clearCache();

            console.log('[LicenseService] ✅ License dates updated successfully');
            return { success: true };

        } catch (error) {
            console.error('[LicenseService] Error updating license dates:', error);
            return { success: false, error: error.message };
        }
    }

    // Méthode pour prolonger une période d'essai (admin seulement)
    async extendTrial(userId, additionalDays) {
        try {
            if (!this.isAdmin()) {
                return { success: false, error: 'Seuls les administrateurs peuvent prolonger les essais' };
            }

            const { data: user, error: fetchError } = await this.supabase
                .from('users')
                .select('license_expires_at, license_status')
                .eq('id', userId)
                .single();

            if (fetchError || !user) {
                return { success: false, error: 'Utilisateur non trouvé' };
            }

            if (user.license_status !== 'trial' && user.license_status !== 'expired') {
                return { success: false, error: 'Seuls les essais peuvent être prolongés' };
            }

            const currentExpiry = new Date(user.license_expires_at);
            const newExpiry = new Date(Math.max(currentExpiry, new Date()));
            newExpiry.setDate(newExpiry.getDate() + additionalDays);

            const result = await this.updateUserLicenseStatus(userId, 'trial', newExpiry.toISOString());

            if (result.success) {
                console.log(`[LicenseService] Extended trial by ${additionalDays} days for user ${userId}`);
            }

            return result;

        } catch (error) {
            console.error('[LicenseService] Error extending trial:', error);
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
            console.error('[LicenseService] Error fetching company users:', error);
            return [];
        }
    }

    async deleteUser(userId) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // Vérifier les permissions
            if (!this.isAdmin()) {
                return { success: false, error: 'Droits insuffisants' };
            }

            // Récupérer l'utilisateur pour avoir son email
            const { data: targetUser } = await this.supabase
                .from('users')
                .select('email, role')
                .eq('id', userId)
                .single();

            if (!targetUser) {
                return { success: false, error: 'Utilisateur non trouvé' };
            }

            // Empêcher la suppression d'un super admin par un non super admin
            if (targetUser.role === 'super_admin' && this.currentUser.role !== 'super_admin') {
                return { success: false, error: 'Seul un super admin peut supprimer un autre super admin' };
            }

            // Empêcher l'auto-suppression
            if (this.currentUser.id === userId) {
                return { success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' };
            }

            // Supprimer d'abord les stats
            await this.supabase
                .from('user_email_stats')
                .delete()
                .eq('email', targetUser.email);

            // Supprimer l'utilisateur
            const { error } = await this.supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            console.log('[LicenseService] ✅ User deleted successfully');
            return { success: true };

        } catch (error) {
            console.error('[LicenseService] Error deleting user:', error);
            return { success: false, error: error.message };
        }
    }

    clearCache() {
        this.cachedLicenseStatus = null;
        this.cacheExpiry = null;
        console.log('[LicenseService] Cache cleared');
    }

    reset() {
        this.supabase = null;
        this.currentUser = null;
        this.initialized = false;
        this.initPromise = null;
        this.clearCache();
        console.log('[LicenseService] Service reset');
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
                accountType: this.currentUser.account_type,
                expiresAt: this.currentUser.license_expires_at
            } : null,
            hasCachedStatus: !!this.cachedLicenseStatus,
            cacheExpiry: this.cacheExpiry
        };
    }
}

// Créer l'instance globale
window.licenseService = new LicenseService();

console.log('[LicenseService] ✅ Service loaded v6.1 - With strict license enforcement');
