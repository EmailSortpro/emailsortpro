// LicenseService.js - Service de gestion des licences EmailSortPro
// Version 6.2 - Correction des permissions et de la synchronisation

(function(global) {
    'use strict';

    class LicenseService {
        constructor() {
            this.supabase = null;
            this.currentUser = null;
            this.isInitialized = false;
            this.licenseCache = new Map();
            this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
            this.lastCheck = null;
            this.checkInterval = null;
            
            // Configuration
            this.config = {
                trialDays: 15,
                gracePeriodDays: 3,
                checkIntervalMinutes: 30
            };
            
            console.log('[LicenseService] Service created v6.2 - Fixed permissions');
        }

        // === INITIALISATION ===
        async initialize() {
            if (this.isInitialized) {
                return true;
            }

            try {
                console.log('[LicenseService] Starting initialization...');
                
                // Initialiser la configuration Supabase
                if (!window.supabaseConfig) {
                    throw new Error('Supabase config not found');
                }

                const configInitialized = await window.initializeSupabaseConfig();
                if (!configInitialized) {
                    console.warn('[LicenseService] Supabase config initialization failed, running in offline mode');
                    return false;
                }

                const config = window.supabaseConfig.getConfig();
                
                // Créer le client Supabase
                this.supabase = window.supabase.createClient(
                    config.url,
                    config.anonKey,
                    {
                        auth: {
                            autoRefreshToken: true,
                            persistSession: false,
                            detectSessionInUrl: false
                        }
                    }
                );

                console.log('[LicenseService] ✅ Supabase client created');
                
                this.isInitialized = true;
                
                // Démarrer la vérification périodique
                this.startPeriodicCheck();
                
                return true;
                
            } catch (error) {
                console.error('[LicenseService] Initialization error:', error);
                this.isInitialized = false;
                return false;
            }
        }

        // === AUTHENTIFICATION ===
        async authenticateWithEmail(email) {
            if (!email) {
                return {
                    success: false,
                    message: 'Email requis',
                    status: 'error'
                };
            }

            try {
                console.log('[LicenseService] Authenticating user:', email);
                
                // Vérifier dans le cache d'abord
                const cached = this.getCachedLicense(email);
                if (cached) {
                    console.log('[LicenseService] Using cached license data');
                    return cached;
                }

                // Vérifier l'utilisateur directement dans la table users
                const { data: user, error } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('email', email.toLowerCase().trim())
                    .single();

                if (error || !user) {
                    console.log('[LicenseService] User not found');
                    return {
                        success: false,
                        status: 'not_found',
                        message: 'Utilisateur non trouvé'
                    };
                }

                // Calculer le statut de la licence
                const licenseStatus = this.calculateLicenseStatus(user);
                
                // Mettre à jour le statut si nécessaire
                if (licenseStatus.status !== user.license_status) {
                    await this.updateUserLicenseStatus(user.id, licenseStatus.status);
                    user.license_status = licenseStatus.status;
                }

                // Mettre à jour la dernière connexion
                await this.updateLastLogin(user.id);

                // Mettre en cache
                const result = {
                    success: true,
                    user: user,
                    status: licenseStatus.status,
                    daysRemaining: licenseStatus.daysRemaining,
                    message: licenseStatus.message
                };

                this.setCachedLicense(email, result);
                this.currentUser = user;

                console.log('[LicenseService] Authentication successful:', result);
                return result;

            } catch (error) {
                console.error('[LicenseService] Authentication error:', error);
                return {
                    success: false,
                    message: 'Erreur lors de l\'authentification',
                    status: 'error'
                };
            }
        }

        calculateLicenseStatus(user) {
            if (!user.license_expires_at) {
                return {
                    status: 'active',
                    daysRemaining: null,
                    message: 'Licence permanente'
                };
            }

            const now = new Date();
            const expiryDate = new Date(user.license_expires_at);
            const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

            if (user.is_lifetime_free) {
                return {
                    status: 'active',
                    daysRemaining: null,
                    message: 'Licence gratuite à vie'
                };
            }

            if (daysRemaining > 0) {
                if (user.license_status === 'trial') {
                    return {
                        status: 'trial',
                        daysRemaining: daysRemaining,
                        message: `Période d'essai - ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
                    };
                }
                return {
                    status: 'active',
                    daysRemaining: daysRemaining,
                    message: `Licence active - ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
                };
            } else if (daysRemaining > -this.config.gracePeriodDays) {
                return {
                    status: 'grace_period',
                    daysRemaining: this.config.gracePeriodDays + daysRemaining,
                    message: `Période de grâce - ${this.config.gracePeriodDays + daysRemaining} jour${(this.config.gracePeriodDays + daysRemaining) > 1 ? 's' : ''} restant${(this.config.gracePeriodDays + daysRemaining) > 1 ? 's' : ''}`
                };
            } else {
                return {
                    status: 'expired',
                    daysRemaining: 0,
                    message: 'Licence expirée'
                };
            }
        }

        async updateUserLicenseStatus(userId, status) {
            try {
                const { error } = await this.supabase
                    .from('users')
                    .update({ 
                        license_status: status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('[LicenseService] Error updating license status:', error);
                }
            } catch (error) {
                console.error('[LicenseService] Failed to update license status:', error);
            }
        }

        async updateLastLogin(userId) {
            try {
                const now = new Date().toISOString();
                const { data: user } = await this.supabase
                    .from('users')
                    .select('first_login_at, login_count')
                    .eq('id', userId)
                    .single();

                const updates = {
                    last_login_at: now,
                    login_count: (user?.login_count || 0) + 1,
                    updated_at: now
                };

                if (!user?.first_login_at) {
                    updates.first_login_at = now;
                }

                const { error } = await this.supabase
                    .from('users')
                    .update(updates)
                    .eq('id', userId);

                if (error) {
                    console.error('[LicenseService] Error updating last login:', error);
                }
            } catch (error) {
                console.error('[LicenseService] Failed to update last login:', error);
            }
        }

        // === CRÉATION D'UTILISATEURS ===
        async createUserWithTrial(email, accountType = 'individual', companyName = null, trialDays = 15) {
            try {
                console.log('[LicenseService] Creating user with trial:', email);

                // Vérifier si l'utilisateur existe déjà
                const { data: existingUser } = await this.supabase
                    .from('users')
                    .select('id')
                    .eq('email', email.toLowerCase().trim())
                    .single();

                if (existingUser) {
                    return {
                        success: false,
                        error: 'Un compte existe déjà avec cet email'
                    };
                }

                // Créer ou récupérer la société si nécessaire
                let companyId = null;
                if (accountType === 'professional' && companyName) {
                    const { data: company } = await this.supabase
                        .from('companies')
                        .select('id')
                        .eq('name', companyName)
                        .single();

                    if (company) {
                        companyId = company.id;
                    } else {
                        // Créer la société
                        const { data: newCompany, error: companyError } = await this.supabase
                            .from('companies')
                            .insert({
                                name: companyName,
                                status: 'prospect',
                                type: 'professional'
                            })
                            .select()
                            .single();

                        if (companyError) {
                            console.error('[LicenseService] Error creating company:', companyError);
                        } else {
                            companyId = newCompany.id;
                        }
                    }
                }

                // Créer l'utilisateur
                const now = new Date();
                const trialEnd = new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000));

                // Déterminer le rôle en fonction du type de compte
                let role = 'user';
                if (accountType === 'individual') {
                    // Les comptes individuels ont accès à leurs propres analytics
                    role = 'user';
                } else if (accountType === 'professional' && companyId) {
                    // Le premier utilisateur d'une société devient admin
                    const { count } = await this.supabase
                        .from('users')
                        .select('*', { count: 'exact', head: true })
                        .eq('company_id', companyId);
                    
                    if (count === 0) {
                        role = 'company_admin';
                    }
                }

                const { data: newUser, error } = await this.supabase
                    .from('users')
                    .insert({
                        email: email.toLowerCase().trim(),
                        name: email.split('@')[0],
                        account_type: accountType,
                        company_id: companyId,
                        role: role,
                        license_status: 'trial',
                        license_starts_at: now.toISOString(),
                        license_expires_at: trialEnd.toISOString(),
                        trial_days: trialDays,
                        created_at: now.toISOString()
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('[LicenseService] Error creating user:', error);
                    return {
                        success: false,
                        error: 'Erreur lors de la création du compte'
                    };
                }

                console.log('[LicenseService] User created successfully:', newUser);

                return {
                    success: true,
                    user: newUser,
                    message: `Compte créé avec ${trialDays} jours d'essai gratuit`
                };

            } catch (error) {
                console.error('[LicenseService] Create user error:', error);
                return {
                    success: false,
                    error: 'Erreur lors de la création du compte'
                };
            }
        }

        // === GESTION DU CACHE ===
        getCachedLicense(email) {
            const cached = this.licenseCache.get(email.toLowerCase());
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
            this.licenseCache.delete(email.toLowerCase());
            return null;
        }

        setCachedLicense(email, data) {
            this.licenseCache.set(email.toLowerCase(), {
                data: data,
                timestamp: Date.now()
            });
        }

        clearCache() {
            this.licenseCache.clear();
        }

        // === VÉRIFICATION PÉRIODIQUE ===
        startPeriodicCheck() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
            }

            this.checkInterval = setInterval(() => {
                if (this.currentUser) {
                    this.checkCurrentUserLicense();
                }
            }, this.config.checkIntervalMinutes * 60 * 1000);
        }

        async checkCurrentUserLicense() {
            if (!this.currentUser || !this.currentUser.email) return;

            console.log('[LicenseService] Periodic license check...');
            
            const result = await this.authenticateWithEmail(this.currentUser.email);
            
            if (result.status === 'expired' || result.status === 'blocked') {
                // Émettre un événement pour que l'application puisse réagir
                window.dispatchEvent(new CustomEvent('licenseExpired', { 
                    detail: result 
                }));
            }
        }

        stopPeriodicCheck() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
                this.checkInterval = null;
            }
        }

        // === MÉTHODES UTILITAIRES ===
        isLicenseValid() {
            if (!this.currentUser) return false;
            
            const status = this.currentUser.license_status;
            return status === 'active' || status === 'trial' || status === 'grace_period';
        }

        getDaysRemaining() {
            if (!this.currentUser || !this.currentUser.license_expires_at) {
                return null;
            }

            const now = new Date();
            const expiryDate = new Date(this.currentUser.license_expires_at);
            return Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        }

        async extendLicense(userId, days) {
            try {
                const { data: user } = await this.supabase
                    .from('users')
                    .select('license_expires_at')
                    .eq('id', userId)
                    .single();

                if (!user) {
                    return { success: false, error: 'Utilisateur non trouvé' };
                }

                const currentExpiry = new Date(user.license_expires_at || new Date());
                const newExpiry = new Date(currentExpiry.getTime() + (days * 24 * 60 * 60 * 1000));

                const { error } = await this.supabase
                    .from('users')
                    .update({
                        license_expires_at: newExpiry.toISOString(),
                        license_status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('[LicenseService] Error extending license:', error);
                    return { success: false, error: 'Erreur lors de l\'extension' };
                }

                // Invalider le cache
                this.clearCache();

                return { 
                    success: true, 
                    newExpiry: newExpiry,
                    message: `Licence étendue de ${days} jours`
                };

            } catch (error) {
                console.error('[LicenseService] Extend license error:', error);
                return { success: false, error: 'Erreur lors de l\'extension' };
            }
        }

        async activateLicense(userId, licenseKey) {
            // Cette méthode pourrait être étendue pour gérer des clés de licence
            // Pour l'instant, elle active simplement la licence
            try {
                const { error } = await this.supabase
                    .from('users')
                    .update({
                        license_status: 'active',
                        license_key: licenseKey,
                        activated_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('[LicenseService] Error activating license:', error);
                    return { success: false, error: 'Erreur lors de l\'activation' };
                }

                // Invalider le cache
                this.clearCache();

                return { 
                    success: true, 
                    message: 'Licence activée avec succès'
                };

            } catch (error) {
                console.error('[LicenseService] Activate license error:', error);
                return { success: false, error: 'Erreur lors de l\'activation' };
            }
        }

        // === MÉTHODES D'ADMINISTRATION ===
        async getAllUsers(filters = {}) {
            try {
                let query = this.supabase
                    .from('users')
                    .select(`
                        *,
                        company:companies(id, name, domain)
                    `)
                    .order('created_at', { ascending: false });

                // Appliquer les filtres
                if (filters.status) {
                    query = query.eq('license_status', filters.status);
                }
                if (filters.accountType) {
                    query = query.eq('account_type', filters.accountType);
                }
                if (filters.companyId) {
                    query = query.eq('company_id', filters.companyId);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('[LicenseService] Error getting users:', error);
                    return { success: false, error: error.message };
                }

                return { success: true, users: data || [] };

            } catch (error) {
                console.error('[LicenseService] Get users error:', error);
                return { success: false, error: 'Erreur lors de la récupération des utilisateurs' };
            }
        }

        async updateUserRole(userId, newRole) {
            try {
                const validRoles = ['user', 'company_admin', 'super_admin'];
                if (!validRoles.includes(newRole)) {
                    return { success: false, error: 'Rôle invalide' };
                }

                const { error } = await this.supabase
                    .from('users')
                    .update({
                        role: newRole,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('[LicenseService] Error updating role:', error);
                    return { success: false, error: error.message };
                }

                // Invalider le cache
                this.clearCache();

                return { success: true, message: 'Rôle mis à jour avec succès' };

            } catch (error) {
                console.error('[LicenseService] Update role error:', error);
                return { success: false, error: 'Erreur lors de la mise à jour du rôle' };
            }
        }

        async blockUser(userId, reason = '') {
            try {
                const { error } = await this.supabase
                    .from('users')
                    .update({
                        license_status: 'blocked',
                        blocked_at: new Date().toISOString(),
                        blocked_reason: reason,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('[LicenseService] Error blocking user:', error);
                    return { success: false, error: error.message };
                }

                // Invalider le cache
                this.clearCache();

                return { success: true, message: 'Utilisateur bloqué' };

            } catch (error) {
                console.error('[LicenseService] Block user error:', error);
                return { success: false, error: 'Erreur lors du blocage' };
            }
        }

        async unblockUser(userId) {
            try {
                const { data: user } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (!user) {
                    return { success: false, error: 'Utilisateur non trouvé' };
                }

                // Recalculer le statut de licence approprié
                const licenseStatus = this.calculateLicenseStatus(user);

                const { error } = await this.supabase
                    .from('users')
                    .update({
                        license_status: licenseStatus.status,
                        blocked_at: null,
                        blocked_reason: null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('[LicenseService] Error unblocking user:', error);
                    return { success: false, error: error.message };
                }

                // Invalider le cache
                this.clearCache();

                return { success: true, message: 'Utilisateur débloqué' };

            } catch (error) {
                console.error('[LicenseService] Unblock user error:', error);
                return { success: false, error: 'Erreur lors du déblocage' };
            }
        }

        // === ANALYTICS ===
        async getUsageStats(userId = null, dateRange = {}) {
            try {
                let query = this.supabase
                    .from('email_analytics')
                    .select('*', { count: 'exact' });

                if (userId) {
                    const { data: user } = await this.supabase
                        .from('users')
                        .select('email')
                        .eq('id', userId)
                        .single();
                    
                    if (user) {
                        query = query.eq('user_email', user.email);
                    }
                }

                if (dateRange.start) {
                    query = query.gte('created_at', dateRange.start);
                }
                if (dateRange.end) {
                    query = query.lte('created_at', dateRange.end);
                }

                const { data, count, error } = await query;

                if (error) {
                    console.error('[LicenseService] Error getting usage stats:', error);
                    return { success: false, error: error.message };
                }

                // Calculer les statistiques
                const stats = {
                    totalEvents: count || 0,
                    emailScans: 0,
                    totalEmails: 0,
                    sessions: 0,
                    errors: 0
                };

                if (data) {
                    data.forEach(event => {
                        if (event.event_type === 'email_scan') {
                            stats.emailScans++;
                            stats.totalEmails += event.email_count || 0;
                        } else if (event.event_type === 'session_start') {
                            stats.sessions++;
                        } else if (event.event_type === 'error') {
                            stats.errors++;
                        }
                    });
                }

                return { success: true, stats };

            } catch (error) {
                console.error('[LicenseService] Get usage stats error:', error);
                return { success: false, error: 'Erreur lors de la récupération des statistiques' };
            }
        }

        // === NETTOYAGE ===
        destroy() {
            this.stopPeriodicCheck();
            this.clearCache();
            this.currentUser = null;
            this.isInitialized = false;
            console.log('[LicenseService] Service destroyed');
        }
    }

    // Créer l'instance globale
    global.licenseService = new LicenseService();
    
    console.log('[LicenseService] ✅ Service loaded v6.2 - Fixed permissions');

})(window);
