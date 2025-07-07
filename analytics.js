// analytics.js - Module Analytics avec Supabase v4.0
// Intégration complète avec la base de données pour la persistance

(function() {
    'use strict';

    class AnalyticsManager {
        constructor() {
            this.currentSession = null;
            this.isInitialized = false;
            this.supabaseClient = null;
            this.pendingEvents = [];
            this.syncInterval = null;
            
            // Données en mémoire
            this.analyticsData = {
                users: {},
                companies: {},
                globalStats: {
                    totalUsers: 0,
                    totalScans: 0,
                    totalTasks: 0,
                    totalErrors: 0,
                    lastUpdated: new Date().toISOString()
                }
            };
            
            console.log('[Analytics] Manager initialized v4.0 with Supabase');
            this.initializeSession();
            this.initializeSupabase();
        }

        // =====================================
        // INITIALISATION SUPABASE
        // =====================================
        async initializeSupabase() {
            try {
                console.log('[Analytics] Initializing Supabase connection...');
                
                // Attendre que la configuration soit prête
                if (!window.supabaseConfig || !window.supabaseConfig.initialized) {
                    console.log('[Analytics] Waiting for Supabase config...');
                    
                    // Attendre jusqu'à 10 secondes
                    let attempts = 0;
                    while ((!window.supabaseConfig || !window.supabaseConfig.initialized) && attempts < 20) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        attempts++;
                    }
                }
                
                if (!window.supabaseConfig || !window.supabaseConfig.initialized) {
                    console.error('[Analytics] Supabase config not available after timeout');
                    return;
                }
                
                // Obtenir la configuration
                const config = window.supabaseConfig.getConfig();
                if (!config.url || !config.anonKey) {
                    console.error('[Analytics] Invalid Supabase config:', config);
                    return;
                }
                
                // Créer le client Supabase
                if (!window.supabase) {
                    console.error('[Analytics] Supabase library not loaded');
                    return;
                }
                
                this.supabaseClient = window.supabase.createClient(
                    config.url,
                    config.anonKey,
                    {
                        auth: {
                            persistSession: false
                        }
                    }
                );
                
                console.log('[Analytics] ✅ Supabase client created successfully');
                
                // Démarrer la synchronisation périodique
                this.startPeriodicSync();
                
                // Synchroniser les événements en attente
                if (this.pendingEvents.length > 0) {
                    console.log(`[Analytics] Sending ${this.pendingEvents.length} pending events...`);
                    await this.flushPendingEvents();
                }
                
                this.isInitialized = true;
                
            } catch (error) {
                console.error('[Analytics] Error initializing Supabase:', error);
            }
        }

        // =====================================
        // GESTION DE SESSION
        // =====================================
        initializeSession() {
            const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.currentSession = {
                id: sessionId,
                startTime: new Date().toISOString(),
                events: []
            };
            
            console.log('[Analytics] Session initialized:', sessionId);
        }

        // =====================================
        // TRACKING D'ÉVÉNEMENTS
        // =====================================
        async trackEvent(eventType, eventData = {}) {
            try {
                const event = {
                    session_id: this.currentSession.id,
                    event_type: eventType,
                    event_data: eventData,
                    timestamp: new Date().toISOString(),
                    domain: window.location.hostname,
                    user_agent: navigator.userAgent
                };
                
                console.log('[Analytics] Event tracked:', eventType, eventData);
                
                // Ajouter à la session locale
                this.currentSession.events.push(event);
                
                // Mettre à jour les stats locales
                this.updateLocalStats(eventType, eventData);
                
                // Envoyer à Supabase
                if (this.supabaseClient) {
                    await this.sendEventToSupabase(event);
                } else {
                    // Ajouter aux événements en attente
                    this.pendingEvents.push(event);
                    console.log('[Analytics] Event queued (no Supabase connection)');
                }
                
            } catch (error) {
                console.error('[Analytics] Error tracking event:', error);
            }
        }

        // =====================================
        // ENVOI À SUPABASE
        // =====================================
        async sendEventToSupabase(event) {
            try {
                const { data, error } = await this.supabaseClient
                    .from('analytics_events')
                    .insert({
                        session_id: event.session_id,
                        event_type: event.event_type,
                        event_data: event.event_data,
                        user_id: event.event_data.userEmail || null,
                        created_at: event.timestamp
                    });
                
                if (error) {
                    console.error('[Analytics] Error sending event to Supabase:', error);
                    this.pendingEvents.push(event);
                } else {
                    console.log('[Analytics] ✅ Event sent to Supabase');
                }
                
            } catch (error) {
                console.error('[Analytics] Error in sendEventToSupabase:', error);
                this.pendingEvents.push(event);
            }
        }

        // =====================================
        // TRACKING D'AUTHENTIFICATION
        // =====================================
        async trackAuthentication(provider, userInfo) {
            try {
                console.log('[Analytics] Tracking authentication:', provider, userInfo.email);
                
                // Mettre à jour les données utilisateur locales
                const email = userInfo.email || userInfo.mail || userInfo.userPrincipalName;
                const domain = email ? email.split('@')[1] : 'unknown';
                
                if (!this.analyticsData.users[email]) {
                    this.analyticsData.users[email] = {
                        email: email,
                        name: userInfo.displayName || userInfo.name || 'Unknown',
                        provider: provider,
                        domain: domain,
                        firstSeen: new Date().toISOString(),
                        lastSeen: new Date().toISOString(),
                        loginCount: 0,
                        totalScans: 0,
                        totalTasks: 0
                    };
                }
                
                this.analyticsData.users[email].lastSeen = new Date().toISOString();
                this.analyticsData.users[email].loginCount++;
                
                // Mettre à jour les données de société
                if (domain && domain !== 'unknown') {
                    if (!this.analyticsData.companies[domain]) {
                        this.analyticsData.companies[domain] = {
                            name: domain,
                            domain: domain,
                            users: [],
                            totalScans: 0,
                            totalTasks: 0,
                            firstSeen: new Date().toISOString(),
                            lastActive: new Date().toISOString()
                        };
                    }
                    
                    if (!this.analyticsData.companies[domain].users.includes(email)) {
                        this.analyticsData.companies[domain].users.push(email);
                    }
                    
                    this.analyticsData.companies[domain].lastActive = new Date().toISOString();
                }
                
                // Envoyer à Supabase
                if (this.supabaseClient) {
                    await this.updateUserInSupabase(email, userInfo, provider);
                    await this.updateDomainUsage(email, domain);
                }
                
                // Tracker l'événement
                await this.trackEvent('user_login', {
                    userEmail: email,
                    userName: userInfo.displayName || userInfo.name,
                    provider: provider,
                    domain: domain,
                    licenseStatus: userInfo.licenseStatus || 'unknown'
                });
                
            } catch (error) {
                console.error('[Analytics] Error tracking authentication:', error);
            }
        }

        // =====================================
        // MISE À JOUR UTILISATEUR DANS SUPABASE
        // =====================================
        async updateUserInSupabase(email, userInfo, provider) {
            try {
                // Vérifier si l'utilisateur existe
                const { data: existingUser, error: selectError } = await this.supabaseClient
                    .from('user_email_stats')
                    .select('*')
                    .eq('email', email)
                    .single();
                
                const userData = {
                    email: email,
                    name: userInfo.displayName || userInfo.name || email.split('@')[0],
                    domain: email.split('@')[1],
                    last_activity: new Date().toISOString(),
                    is_admin: userInfo.licenseStatus === 'admin' || false
                };
                
                if (selectError || !existingUser) {
                    // Créer un nouvel utilisateur
                    const { error: insertError } = await this.supabaseClient
                        .from('user_email_stats')
                        .insert({
                            ...userData,
                            total_sessions: 1,
                            total_emails_scanned: 0,
                            first_seen: new Date().toISOString()
                        });
                    
                    if (insertError) {
                        console.error('[Analytics] Error creating user in Supabase:', insertError);
                    } else {
                        console.log('[Analytics] ✅ User created in Supabase');
                    }
                } else {
                    // Mettre à jour l'utilisateur existant
                    const { error: updateError } = await this.supabaseClient
                        .from('user_email_stats')
                        .update({
                            ...userData,
                            total_sessions: (existingUser.total_sessions || 0) + 1
                        })
                        .eq('email', email);
                    
                    if (updateError) {
                        console.error('[Analytics] Error updating user in Supabase:', updateError);
                    } else {
                        console.log('[Analytics] ✅ User updated in Supabase');
                    }
                }
                
            } catch (error) {
                console.error('[Analytics] Error in updateUserInSupabase:', error);
            }
        }

        // =====================================
        // MISE À JOUR USAGE PAR DOMAINE
        // =====================================
        async updateDomainUsage(email, domain) {
            try {
                if (!domain || domain === 'unknown') return;
                
                // Vérifier si le domaine existe
                const { data: existingDomain, error: selectError } = await this.supabaseClient
                    .from('domain_usage')
                    .select('*')
                    .eq('domain', domain)
                    .single();
                
                if (selectError || !existingDomain) {
                    // Créer un nouveau domaine
                    const { error: insertError } = await this.supabaseClient
                        .from('domain_usage')
                        .insert({
                            domain: domain,
                            total_users: 1,
                            active_users: 1,
                            total_emails_scanned: 0,
                            admin_email: email,
                            last_activity: new Date().toISOString()
                        });
                    
                    if (insertError) {
                        console.error('[Analytics] Error creating domain in Supabase:', insertError);
                    } else {
                        console.log('[Analytics] ✅ Domain created in Supabase');
                    }
                } else {
                    // Mettre à jour le domaine existant
                    const { error: updateError } = await this.supabaseClient
                        .from('domain_usage')
                        .update({
                            last_activity: new Date().toISOString(),
                            active_users: existingDomain.active_users + 1
                        })
                        .eq('domain', domain);
                    
                    if (updateError) {
                        console.error('[Analytics] Error updating domain in Supabase:', updateError);
                    }
                }
                
            } catch (error) {
                console.error('[Analytics] Error in updateDomainUsage:', error);
            }
        }

        // =====================================
        // TRACKING DE SCANS
        // =====================================
        async trackEmailScan(scanData) {
            try {
                const userEmail = scanData.userEmail || 'anonymous';
                const emailCount = scanData.emailCount || 0;
                
                console.log('[Analytics] Tracking email scan:', userEmail, emailCount);
                
                // Mettre à jour les stats locales
                if (this.analyticsData.users[userEmail]) {
                    this.analyticsData.users[userEmail].totalScans++;
                }
                
                this.analyticsData.globalStats.totalScans++;
                
                // Envoyer à Supabase
                if (this.supabaseClient && userEmail !== 'anonymous') {
                    await this.updateScanStatsInSupabase(userEmail, emailCount);
                }
                
                // Tracker l'événement
                await this.trackEvent('email_scan', {
                    userEmail: userEmail,
                    emailCount: emailCount,
                    categories: scanData.categories || []
                });
                
            } catch (error) {
                console.error('[Analytics] Error tracking email scan:', error);
            }
        }

        // =====================================
        // MISE À JOUR STATS DE SCAN DANS SUPABASE
        // =====================================
        async updateScanStatsInSupabase(userEmail, emailCount) {
            try {
                // Mettre à jour les stats utilisateur
                const { data: user, error: userError } = await this.supabaseClient
                    .from('user_email_stats')
                    .select('total_emails_scanned')
                    .eq('email', userEmail)
                    .single();
                
                if (!userError && user) {
                    await this.supabaseClient
                        .from('user_email_stats')
                        .update({
                            total_emails_scanned: (user.total_emails_scanned || 0) + emailCount,
                            last_activity: new Date().toISOString()
                        })
                        .eq('email', userEmail);
                }
                
                // Mettre à jour les stats du domaine
                const domain = userEmail.split('@')[1];
                if (domain) {
                    const { data: domainData, error: domainError } = await this.supabaseClient
                        .from('domain_usage')
                        .select('total_emails_scanned')
                        .eq('domain', domain)
                        .single();
                    
                    if (!domainError && domainData) {
                        await this.supabaseClient
                            .from('domain_usage')
                            .update({
                                total_emails_scanned: (domainData.total_emails_scanned || 0) + emailCount,
                                last_activity: new Date().toISOString()
                            })
                            .eq('domain', domain);
                    }
                }
                
                console.log('[Analytics] ✅ Scan stats updated in Supabase');
                
            } catch (error) {
                console.error('[Analytics] Error updating scan stats:', error);
            }
        }

        // =====================================
        // TRACKING DE TÂCHES
        // =====================================
        async trackTaskCreation(taskData) {
            try {
                const userEmail = taskData.userEmail || 'anonymous';
                
                console.log('[Analytics] Tracking task creation:', userEmail);
                
                // Mettre à jour les stats locales
                if (this.analyticsData.users[userEmail]) {
                    this.analyticsData.users[userEmail].totalTasks++;
                }
                
                this.analyticsData.globalStats.totalTasks++;
                
                // Tracker l'événement
                await this.trackEvent('task_created', {
                    userEmail: userEmail,
                    taskTitle: taskData.title,
                    taskCategory: taskData.category,
                    fromEmail: taskData.fromEmail || false
                });
                
            } catch (error) {
                console.error('[Analytics] Error tracking task creation:', error);
            }
        }

        // =====================================
        // TRACKING D'ERREURS
        // =====================================
        async onError(errorType, errorData) {
            try {
                console.log('[Analytics] Tracking error:', errorType);
                
                this.analyticsData.globalStats.totalErrors++;
                
                await this.trackEvent('error_occurred', {
                    errorType: errorType,
                    errorMessage: errorData.message || 'Unknown error',
                    errorData: errorData
                });
                
            } catch (error) {
                console.error('[Analytics] Error tracking error:', error);
            }
        }

        // =====================================
        // TRACKING DE PAGE
        // =====================================
        async onPageLoad(pageName) {
            try {
                await this.trackEvent('page_load', {
                    page: pageName,
                    referrer: document.referrer,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('[Analytics] Error tracking page load:', error);
            }
        }

        // =====================================
        // SYNCHRONISATION PÉRIODIQUE
        // =====================================
        startPeriodicSync() {
            // Synchroniser toutes les 30 secondes
            this.syncInterval = setInterval(() => {
                this.flushPendingEvents();
            }, 30000);
            
            console.log('[Analytics] Periodic sync started (every 30s)');
        }

        async flushPendingEvents() {
            if (this.pendingEvents.length === 0 || !this.supabaseClient) {
                return;
            }
            
            console.log(`[Analytics] Flushing ${this.pendingEvents.length} pending events...`);
            
            const eventsToSend = [...this.pendingEvents];
            this.pendingEvents = [];
            
            for (const event of eventsToSend) {
                await this.sendEventToSupabase(event);
            }
        }

        // =====================================
        // MISE À JOUR DES STATS LOCALES
        // =====================================
        updateLocalStats(eventType, eventData) {
            switch (eventType) {
                case 'user_login':
                    this.analyticsData.globalStats.totalUsers = Object.keys(this.analyticsData.users).length;
                    break;
                    
                case 'email_scan':
                    if (eventData.emailCount) {
                        const count = parseInt(eventData.emailCount) || 0;
                        this.analyticsData.globalStats.totalScans += count;
                    }
                    break;
                    
                case 'task_created':
                    this.analyticsData.globalStats.totalTasks++;
                    break;
                    
                case 'error_occurred':
                    this.analyticsData.globalStats.totalErrors++;
                    break;
            }
            
            this.analyticsData.globalStats.lastUpdated = new Date().toISOString();
        }

        // =====================================
        // RÉCUPÉRATION DES DONNÉES
        // =====================================
        async loadDataFromSupabase() {
            if (!this.supabaseClient) {
                console.warn('[Analytics] Cannot load data - Supabase not initialized');
                return;
            }
            
            try {
                console.log('[Analytics] Loading data from Supabase...');
                
                // Charger les utilisateurs
                const { data: users, error: usersError } = await this.supabaseClient
                    .from('user_email_stats')
                    .select('*')
                    .order('last_activity', { ascending: false });
                
                if (!usersError && users) {
                    users.forEach(user => {
                        this.analyticsData.users[user.email] = {
                            email: user.email,
                            name: user.name,
                            domain: user.domain,
                            firstSeen: user.first_seen,
                            lastSeen: user.last_activity,
                            loginCount: user.total_sessions || 0,
                            totalScans: user.total_emails_scanned || 0,
                            isAdmin: user.is_admin || false
                        };
                    });
                    
                    console.log(`[Analytics] ✅ Loaded ${users.length} users from Supabase`);
                }
                
                // Charger les domaines
                const { data: domains, error: domainsError } = await this.supabaseClient
                    .from('domain_usage')
                    .select('*')
                    .order('last_activity', { ascending: false });
                
                if (!domainsError && domains) {
                    domains.forEach(domain => {
                        this.analyticsData.companies[domain.domain] = {
                            name: domain.domain,
                            domain: domain.domain,
                            users: [],
                            totalScans: domain.total_emails_scanned || 0,
                            totalUsers: domain.total_users || 0,
                            activeUsers: domain.active_users || 0,
                            lastActive: domain.last_activity
                        };
                    });
                    
                    console.log(`[Analytics] ✅ Loaded ${domains.length} domains from Supabase`);
                }
                
                // Mettre à jour les stats globales
                this.updateGlobalStats();
                
            } catch (error) {
                console.error('[Analytics] Error loading data from Supabase:', error);
            }
        }

        updateGlobalStats() {
            this.analyticsData.globalStats = {
                totalUsers: Object.keys(this.analyticsData.users).length,
                totalCompanies: Object.keys(this.analyticsData.companies).length,
                totalScans: Object.values(this.analyticsData.users).reduce((sum, user) => sum + (user.totalScans || 0), 0),
                totalTasks: this.analyticsData.globalStats.totalTasks || 0,
                totalErrors: this.analyticsData.globalStats.totalErrors || 0,
                lastUpdated: new Date().toISOString()
            };
            
            console.log('[Analytics] Global stats updated:', this.analyticsData.globalStats);
        }

        // =====================================
        // MÉTHODES D'ACCÈS AUX DONNÉES
        // =====================================
        getAnalyticsData() {
            return this.analyticsData;
        }

        getGlobalStats() {
            return this.analyticsData.globalStats;
        }

        getAllUsers() {
            return Object.values(this.analyticsData.users);
        }

        getAllCompanies() {
            return Object.values(this.analyticsData.companies);
        }

        getUserByEmail(email) {
            return this.analyticsData.users[email] || null;
        }

        getCompanyByDomain(domain) {
            return this.analyticsData.companies[domain] || null;
        }

        // =====================================
        // EXPORT DES DONNÉES
        // =====================================
        exportData() {
            const exportData = {
                exportDate: new Date().toISOString(),
                session: this.currentSession,
                analyticsData: this.analyticsData,
                pendingEvents: this.pendingEvents.length
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `emailsortpro-analytics-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            console.log('[Analytics] Data exported successfully');
        }

        // =====================================
        // NETTOYAGE
        // =====================================
        destroy() {
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
            }
            
            // Envoyer les derniers événements
            this.flushPendingEvents();
            
            console.log('[Analytics] Manager destroyed');
        }
    }

    // Créer l'instance globale
    window.analyticsManager = new AnalyticsManager();
    console.log('[Analytics] Global AnalyticsManager created v4.0 with Supabase');
    
    // Charger les données depuis Supabase après un délai
    setTimeout(() => {
        window.analyticsManager.loadDataFromSupabase();
    }, 2000);
    
    // Exporter pour les autres modules
    window.AnalyticsManager = AnalyticsManager;
    
    console.log('[Analytics] ✅ Analytics module loaded successfully v4.0 with Supabase integration');

})();
