// analytics.js - Module Analytics pour EmailSortPro avec synchronisation Supabase
// Version 4.0 - Synchronisation temps réel avec Supabase

class AnalyticsManager {
    constructor() {
        this.storageKey = 'emailsortpro_analytics';
        this.sessionKey = 'emailsortpro_session';
        this.initialized = false;
        this.currentSession = null;
        this.supabase = null;
        this.syncEnabled = true;
        
        // Configuration des coûts (en centimes d'euros)
        this.costs = {
            emailScan: 0.5,        // 0.5 centime par email scanné
            aiAnalysis: 2,         // 2 centimes par analyse IA
            taskGeneration: 1,     // 1 centime par tâche générée
            domainOrganization: 3  // 3 centimes par organisation de domaine
        };
        
        console.log('[Analytics] Manager initialized v4.0 with Supabase sync');
        this.initializeSession();
    }

    // === GESTION DES SESSIONS ===
    initializeSession() {
        const sessionId = this.generateSessionId();
        const timestamp = new Date().toISOString();
        const userAgent = navigator.userAgent;
        const domain = window.location.hostname;
        
        this.currentSession = {
            sessionId: sessionId,
            startTime: timestamp,
            domain: domain,
            userAgent: userAgent,
            actions: [],
            errors: [],
            emailStats: null,
            authProvider: null,
            userInfo: null,
            costs: {
                total: 0,
                breakdown: {}
            }
        };

        sessionStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession));
        
        this.trackEvent('session_start', {
            domain: domain,
            userAgent: userAgent.substring(0, 100),
            timestamp: timestamp
        });

        console.log('[Analytics] Session initialized:', sessionId);
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // === INITIALISATION SUPABASE ===
    async initializeSupabase() {
        if (this.supabase) return true;
        
        try {
            // Utiliser le service de licence qui a déjà Supabase initialisé
            if (window.licenseService && window.licenseService.supabase) {
                this.supabase = window.licenseService.supabase;
                console.log('[Analytics] Using Supabase from LicenseService');
                return true;
            }
            
            console.warn('[Analytics] Supabase not available');
            return false;
        } catch (error) {
            console.error('[Analytics] Error initializing Supabase:', error);
            return false;
        }
    }

    // === TRACKING DES ÉVÉNEMENTS ===
    async trackEvent(eventType, eventData = {}) {
        if (!this.currentSession) {
            this.initializeSession();
        }

        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            data: eventData,
            sessionId: this.currentSession.sessionId,
            userEmail: this.currentSession.userInfo?.email || 'anonymous'
        };

        // Ajouter à la session courante
        this.currentSession.actions.push(event);
        sessionStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession));

        // Envoyer à Supabase immédiatement si disponible
        if (this.syncEnabled) {
            await this.sendToSupabase(event);
        }
        
        console.log('[Analytics] Event tracked:', eventType, eventData);
    }

    // === ENVOI À SUPABASE ===
    async sendToSupabase(event) {
        if (!this.supabase) {
            await this.initializeSupabase();
        }
        
        if (!this.supabase) return;
        
        try {
            const { error } = await this.supabase
                .from('email_analytics')
                .insert({
                    user_email: event.userEmail,
                    user_domain: event.userEmail.split('@')[1] || 'unknown',
                    event_type: event.type,
                    event_data: event.data,
                    email_count: event.data.emailCount || 0,
                    session_id: event.sessionId,
                    ip_address: null, // Pas d'IP côté client
                    user_agent: navigator.userAgent.substring(0, 255)
                });
                
            if (error) {
                console.warn('[Analytics] Error sending to Supabase:', error);
            }
        } catch (error) {
            console.warn('[Analytics] Failed to send analytics:', error);
        }
    }

    // === TRACKING SPÉCIFIQUE ===
    trackAuthentication(provider, userInfo) {
        this.currentSession.authProvider = provider;
        this.currentSession.userInfo = {
            name: userInfo.name || userInfo.displayName,
            email: userInfo.email || userInfo.mail || userInfo.userPrincipalName,
            domain: userInfo.email ? userInfo.email.split('@')[1] : 'unknown',
            id: userInfo.id || null
        };

        this.trackEvent('auth_success', {
            provider: provider,
            userEmail: this.currentSession.userInfo.email,
            userDomain: this.currentSession.userInfo.domain,
            userName: this.currentSession.userInfo.name
        });

        this.updateUserStatsByEmail();
    }

    trackPageVisit(pageName) {
        this.trackEvent('page_visit', {
            page: pageName,
            userEmail: this.currentSession.userInfo?.email || 'anonymous',
            timestamp: new Date().toISOString()
        });
    }

    async trackEmailScan(emailCount, errors = []) {
        const userEmail = this.currentSession.userInfo?.email || 'anonymous';
        const scanCost = emailCount * this.costs.emailScan;
        
        const scanData = {
            emailCount: emailCount,
            errorCount: errors.length,
            domain: window.location.hostname,
            userEmail: userEmail,
            cost: scanCost,
            timestamp: new Date().toISOString()
        };

        if (errors.length > 0) {
            scanData.errors = errors;
            errors.forEach(error => this.trackError('scan_error', error));
        }

        await this.trackEvent('email_scan', scanData);
        
        // Mettre à jour les coûts
        this.updateSessionCost('emailScan', scanCost);
        
        // Mettre à jour les stats dans Supabase
        await this.updateSupabaseUserStats(userEmail, emailCount);
    }

    trackError(errorType, errorData) {
        const error = {
            type: errorType,
            message: errorData.message || errorData,
            stack: errorData.stack,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            userAgent: navigator.userAgent.substring(0, 100),
            userEmail: this.currentSession.userInfo?.email || 'anonymous'
        };

        if (this.currentSession) {
            this.currentSession.errors.push(error);
            sessionStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession));
        }

        this.trackEvent('error', error);
    }

    // === MISE À JOUR DES STATISTIQUES SUPABASE ===
    async updateSupabaseUserStats(email, emailCount = 0) {
        if (!this.supabase || !email || email === 'anonymous') return;
        
        try {
            // Récupérer les stats actuelles
            const { data: existingStats } = await this.supabase
                .from('user_email_stats')
                .select('*')
                .eq('email', email)
                .single();
            
            if (existingStats) {
                // Mettre à jour les stats existantes
                const { error } = await this.supabase
                    .from('user_email_stats')
                    .update({
                        total_sessions: existingStats.total_sessions + 1,
                        total_emails_scanned: existingStats.total_emails_scanned + emailCount,
                        last_activity: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('email', email);
                    
                if (error) {
                    console.warn('[Analytics] Error updating stats:', error);
                }
            } else {
                // Créer de nouvelles stats
                const { error } = await this.supabase
                    .from('user_email_stats')
                    .insert({
                        email: email,
                        name: this.currentSession.userInfo?.name || email.split('@')[0],
                        domain: email.split('@')[1] || 'unknown',
                        total_sessions: 1,
                        total_emails_scanned: emailCount,
                        last_activity: new Date().toISOString()
                    });
                    
                if (error) {
                    console.warn('[Analytics] Error creating stats:', error);
                }
            }
        } catch (error) {
            console.warn('[Analytics] Failed to update user stats:', error);
        }
    }

    updateSessionCost(costType, amount) {
        if (!this.currentSession.costs.breakdown[costType]) {
            this.currentSession.costs.breakdown[costType] = 0;
        }
        
        this.currentSession.costs.breakdown[costType] += amount;
        this.currentSession.costs.total += amount;
        
        sessionStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession));
    }

    // === MÉTHODES D'INTÉGRATION ===
    onPageLoad(pageName) {
        this.trackPageVisit(pageName);
    }

    onAuthSuccess(provider, userInfo) {
        this.trackAuthentication(provider, userInfo);
    }

    onEmailScanComplete(emailCount, errors = []) {
        this.trackEmailScan(emailCount, errors);
    }

    onError(errorType, errorData) {
        this.trackError(errorType, errorData);
    }

    // === EXPORT ===
    async exportAnalytics() {
        if (!this.supabase) {
            await this.initializeSupabase();
        }
        
        const exportData = {
            exportedAt: new Date().toISOString(),
            version: '4.0',
            currentSession: this.currentSession
        };
        
        // Récupérer les données depuis Supabase si disponible
        if (this.supabase) {
            try {
                const { data: analytics } = await this.supabase
                    .from('email_analytics')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(1000);
                
                const { data: userStats } = await this.supabase
                    .from('user_email_stats')
                    .select('*')
                    .order('total_emails_scanned', { ascending: false });
                
                exportData.analytics = analytics || [];
                exportData.userStats = userStats || [];
            } catch (error) {
                console.error('Export error:', error);
            }
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emailsortpro-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// === MODULE ANALYTICS POUR LA PAGE ===
class AnalyticsModule {
    constructor() {
        this.container = null;
        this.refreshInterval = null;
        this.analytics = window.analyticsManager || new AnalyticsManager();
        this.supabaseClient = null;
        this.currentUser = null;
        this.lastUpdate = null;
    }

    async render() {
        console.log('[AnalyticsModule] Rendering analytics page...');
        
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[AnalyticsModule] Page content container not found');
            return;
        }

        this.container = document.createElement('div');
        this.container.className = 'analytics-container';
        this.container.innerHTML = this.getAnalyticsHTML();
        
        pageContent.innerHTML = '';
        pageContent.appendChild(this.container);
        
        // Initialiser Supabase si nécessaire
        await this.analytics.initializeSupabase();
        
        // Initialiser les événements
        this.initializeEvents();
        
        // Charger les données
        await this.loadAnalyticsData();
        
        // Auto-refresh toutes les 30 secondes
        this.startAutoRefresh();
        
        console.log('[AnalyticsModule] Analytics page rendered');
    }

    getAnalyticsHTML() {
        return `
            <div class="analytics-page">
                <div class="analytics-header">
                    <h1><i class="fas fa-chart-line"></i> Analytics EmailSortPro</h1>
                    <div class="analytics-actions">
                        <button id="refreshAnalytics" class="btn-secondary">
                            <i class="fas fa-sync"></i> Actualiser
                        </button>
                        <button id="exportAnalytics" class="btn-secondary">
                            <i class="fas fa-download"></i> Exporter
                        </button>
                        <span class="sync-indicator" id="analyticsSync">
                            <i class="fas fa-circle"></i> En ligne
                        </span>
                    </div>
                </div>

                <div class="analytics-grid">
                    <!-- Statistiques générales -->
                    <div class="analytics-card overview-card">
                        <h3><i class="fas fa-tachometer-alt"></i> Vue d'ensemble</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number" id="totalUsers">-</div>
                                <div class="stat-label">Utilisateurs</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="totalScans">-</div>
                                <div class="stat-label">Scans effectués</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="totalEmails">-</div>
                                <div class="stat-label">Emails analysés</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="activeToday">-</div>
                                <div class="stat-label">Actifs aujourd'hui</div>
                            </div>
                        </div>
                    </div>

                    <!-- Top utilisateurs -->
                    <div class="analytics-card users-card">
                        <h3><i class="fas fa-users"></i> Top Utilisateurs</h3>
                        <div id="topUsersChart" class="chart-container">
                            <div class="loading">Chargement...</div>
                        </div>
                    </div>

                    <!-- Activité par jour -->
                    <div class="analytics-card activity-card">
                        <h3><i class="fas fa-calendar-alt"></i> Activité par jour</h3>
                        <div id="activityChart" class="chart-container">
                            <div class="loading">Chargement...</div>
                        </div>
                    </div>

                    <!-- Événements récents -->
                    <div class="analytics-card events-card">
                        <h3><i class="fas fa-stream"></i> Événements récents</h3>
                        <div id="recentEvents" class="events-list">
                            <div class="loading">Chargement...</div>
                        </div>
                    </div>

                    <!-- Détail par utilisateur -->
                    <div class="analytics-card user-details-card">
                        <h3><i class="fas fa-user-chart"></i> Détail par Utilisateur</h3>
                        <div id="userDetailsTable" class="table-container">
                            <div class="loading">Chargement...</div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .analytics-page {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .analytics-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #e2e8f0;
                }

                .analytics-header h1 {
                    color: #1f2937;
                    font-size: 2rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .analytics-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .sync-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: #dcfce7;
                    color: #16a34a;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .sync-indicator.offline {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .sync-indicator i {
                    font-size: 0.5rem;
                }

                .btn-secondary {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                }

                .btn-secondary:hover {
                    background: #e2e8f0;
                    border-color: #cbd5e1;
                }

                .analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 24px;
                }

                .analytics-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                }

                .analytics-card h3 {
                    color: #1f2937;
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .overview-card {
                    grid-column: 1 / -1;
                }

                .user-details-card {
                    grid-column: 1 / -1;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 20px;
                }

                .stat-item {
                    text-align: center;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .stat-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #4F46E5;
                    margin-bottom: 8px;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .chart-container {
                    min-height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .table-container {
                    overflow-x: auto;
                }

                .user-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.875rem;
                }

                .user-table th {
                    background: #f8fafc;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #475569;
                    border-bottom: 2px solid #e2e8f0;
                }

                .user-table td {
                    padding: 12px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .user-table tr:hover {
                    background: #f8fafc;
                }

                .loading {
                    color: #64748b;
                    font-style: italic;
                }

                .events-list {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .event-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-bottom: 1px solid #f1f5f9;
                    transition: background 0.2s;
                }

                .event-item:hover {
                    background: #f8fafc;
                }

                .event-item:last-child {
                    border-bottom: none;
                }

                .event-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .event-icon.session { background: #dbeafe; color: #1d4ed8; }
                .event-icon.scan { background: #dcfce7; color: #16a34a; }
                .event-icon.error { background: #fef2f2; color: #dc2626; }
                .event-icon.page { background: #fef3c7; color: #d97706; }

                .event-content {
                    flex: 1;
                }

                .event-title {
                    font-weight: 500;
                    color: #1f2937;
                    margin-bottom: 2px;
                }

                .event-details {
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .event-time {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    white-space: nowrap;
                }

                .chart-simple {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .chart-bar-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .chart-label {
                    min-width: 150px;
                    font-size: 0.875rem;
                    color: #1f2937;
                    font-weight: 500;
                }

                .chart-bar {
                    flex: 1;
                    height: 24px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;
                }

                .chart-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4F46E5, #6366F1);
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .chart-value {
                    min-width: 80px;
                    text-align: right;
                    font-size: 0.875rem;
                    color: #64748b;
                    font-weight: 600;
                }

                .activity-bar {
                    height: 32px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 4px;
                }

                .activity-fill {
                    height: 100%;
                    background: #4F46E5;
                    transition: width 0.3s ease;
                }

                @media (max-width: 768px) {
                    .analytics-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .analytics-header {
                        flex-direction: column;
                        gap: 16px;
                        align-items: stretch;
                    }
                    
                    .analytics-actions {
                        justify-content: center;
                    }
                    
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .chart-label {
                        min-width: 100px;
                        font-size: 0.75rem;
                    }
                    
                    .user-table {
                        font-size: 0.75rem;
                    }
                    
                    .user-table th,
                    .user-table td {
                        padding: 8px;
                    }
                }
            </style>
        `;
    }

    initializeEvents() {
        // Bouton refresh
        const refreshBtn = document.getElementById('refreshAnalytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAnalyticsData();
            });
        }

        // Bouton export
        const exportBtn = document.getElementById('exportAnalytics');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.analytics.exportAnalytics();
            });
        }
    }

    async loadAnalyticsData() {
        console.log('[AnalyticsModule] Loading analytics data from Supabase...');
        
        // Indiquer le chargement
        this.setSyncStatus('loading');
        
        try {
            // Vérifier la connexion Supabase
            if (!this.supabaseClient && !this.analytics.supabase) {
                await this.analytics.initializeSupabase();
                this.supabaseClient = this.analytics.supabase;
            }
            
            if (!this.supabaseClient && !this.analytics.supabase) {
                console.error('[AnalyticsModule] Supabase not available');
                this.setSyncStatus('offline');
                this.showOfflineMessage();
                return;
            }
            
            // Utiliser Supabase depuis analytics ou depuis la référence passée
            const supabase = this.supabaseClient || this.analytics.supabase;
            
            // Charger toutes les données depuis Supabase
            const [statsResult, analyticsResult, recentResult] = await Promise.all([
                // Stats des utilisateurs
                supabase
                    .from('user_email_stats')
                    .select('*')
                    .order('total_emails_scanned', { ascending: false }),
                
                // Analytics globales
                supabase
                    .from('email_analytics')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(1000),
                
                // Événements récents (dernières 24h)
                supabase
                    .from('email_analytics')
                    .select('*')
                    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
                    .order('created_at', { ascending: false })
                    .limit(50)
            ]);
            
            // Vérifier les erreurs
            if (statsResult.error || analyticsResult.error || recentResult.error) {
                console.error('[AnalyticsModule] Error loading data:', {
                    stats: statsResult.error,
                    analytics: analyticsResult.error,
                    recent: recentResult.error
                });
                this.setSyncStatus('error');
                return;
            }
            
            // Traiter les données
            const userStats = statsResult.data || [];
            const analyticsData = analyticsResult.data || [];
            const recentEvents = recentResult.data || [];
            
            // Mettre à jour l'interface
            this.updateOverviewStats(userStats, analyticsData);
            this.updateTopUsersChart(userStats);
            this.updateActivityChart(analyticsData);
            this.updateRecentEvents(recentEvents);
            this.updateUserDetailsTable(userStats);
            
            // Marquer comme synchronisé
            this.setSyncStatus('online');
            this.lastUpdate = new Date();
            
            console.log('[AnalyticsModule] Data loaded successfully');
            
        } catch (error) {
            console.error('[AnalyticsModule] Error loading analytics:', error);
            this.setSyncStatus('error');
        }
    }

    setSyncStatus(status) {
        const indicator = document.getElementById('analyticsSync');
        if (!indicator) return;
        
        indicator.classList.remove('offline');
        
        switch (status) {
            case 'loading':
                indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i> Chargement...';
                break;
            case 'online':
                indicator.innerHTML = '<i class="fas fa-circle"></i> En ligne';
                break;
            case 'offline':
                indicator.classList.add('offline');
                indicator.innerHTML = '<i class="fas fa-circle"></i> Hors ligne';
                break;
            case 'error':
                indicator.classList.add('offline');
                indicator.innerHTML = '<i class="fas fa-exclamation-circle"></i> Erreur';
                break;
        }
    }

    showOfflineMessage() {
        const containers = ['topUsersChart', 'activityChart', 'recentEvents', 'userDetailsTable'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '<div class="loading">Mode hors ligne - Données locales uniquement</div>';
            }
        });
    }

    updateOverviewStats(userStats, analyticsData) {
        // Calculer les statistiques
        const totalUsers = userStats.length;
        const totalScans = analyticsData.filter(e => e.event_type === 'email_scan').length;
        const totalEmails = userStats.reduce((sum, user) => sum + (user.total_emails_scanned || 0), 0);
        
        // Utilisateurs actifs aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const activeToday = new Set(
            analyticsData
                .filter(e => e.created_at && e.created_at.startsWith(today))
                .map(e => e.user_email)
        ).size;
        
        // Mettre à jour l'interface
        document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
        document.getElementById('totalScans').textContent = totalScans.toLocaleString();
        document.getElementById('totalEmails').textContent = totalEmails.toLocaleString();
        document.getElementById('activeToday').textContent = activeToday.toLocaleString();
    }

    updateTopUsersChart(userStats) {
        const container = document.getElementById('topUsersChart');
        if (!container) return;
        
        const topUsers = userStats.slice(0, 10);
        
        if (topUsers.length === 0) {
            container.innerHTML = '<div class="loading">Aucune donnée utilisateur</div>';
            return;
        }
        
        const maxEmails = Math.max(...topUsers.map(user => user.total_emails_scanned || 0));
        
        container.innerHTML = `
            <div class="chart-simple">
                ${topUsers.map(user => {
                    const emails = user.total_emails_scanned || 0;
                    const percentage = maxEmails > 0 ? (emails / maxEmails) * 100 : 0;
                    
                    return `
                        <div class="chart-bar-item">
                            <div class="chart-label" title="${user.email}">${user.email}</div>
                            <div class="chart-bar">
                                <div class="chart-fill" style="width: ${percentage}%"></div>
                            </div>
                            <div class="chart-value">${emails.toLocaleString()}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    updateActivityChart(analyticsData) {
        const container = document.getElementById('activityChart');
        if (!container) return;
        
        // Grouper par jour
        const scansByDay = {};
        const last7Days = [];
        
        // Générer les 7 derniers jours
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push(dateStr);
            scansByDay[dateStr] = 0;
        }
        
        // Compter les scans par jour
        analyticsData
            .filter(e => e.event_type === 'email_scan' && e.created_at)
            .forEach(event => {
                const date = event.created_at.split('T')[0];
                if (scansByDay.hasOwnProperty(date)) {
                    scansByDay[date]++;
                }
            });
        
        const maxScans = Math.max(...Object.values(scansByDay));
        
        container.innerHTML = `
            <div class="chart-simple">
                ${last7Days.map(date => {
                    const scans = scansByDay[date];
                    const percentage = maxScans > 0 ? (scans / maxScans) * 100 : 0;
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                    
                    return `
                        <div class="chart-bar-item">
                            <div class="chart-label">${dayName}</div>
                            <div class="activity-bar">
                                <div class="activity-fill" style="width: ${percentage}%"></div>
                            </div>
                            <div class="chart-value">${scans} scans</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    updateRecentEvents(events) {
        const container = document.getElementById('recentEvents');
        if (!container) return;
        
        if (events.length === 0) {
            container.innerHTML = '<div class="loading">Aucun événement récent</div>';
            return;
        }
        
        const getEventIcon = (eventType) => {
            switch (eventType) {
                case 'session_start': return { class: 'session', icon: 'fa-sign-in-alt' };
                case 'email_scan': return { class: 'scan', icon: 'fa-search' };
                case 'error': return { class: 'error', icon: 'fa-exclamation-triangle' };
                case 'page_visit': return { class: 'page', icon: 'fa-file-alt' };
                case 'auth_success': return { class: 'session', icon: 'fa-user-check' };
                default: return { class: 'session', icon: 'fa-circle' };
            }
        };
        
        const getEventTitle = (event) => {
            switch (event.event_type) {
                case 'session_start': return 'Nouvelle session';
                case 'email_scan': 
                    const count = event.event_data?.emailCount || event.email_count || 0;
                    return `Scan de ${count} emails`;
                case 'error': return `Erreur: ${event.event_data?.type || 'Inconnue'}`;
                case 'page_visit': return `Visite: ${event.event_data?.page || 'Page'}`;
                case 'auth_success': return `Connexion ${event.event_data?.provider || ''}`;
                default: return event.event_type;
            }
        };
        
        const formatTime = (timestamp) => {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) return 'À l\'instant';
            if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}m`;
            if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
            
            return date.toLocaleString('fr-FR', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        };
        
        container.innerHTML = events.map(event => {
            const icon = getEventIcon(event.event_type);
            const title = getEventTitle(event);
            const time = formatTime(event.created_at);
            
            return `
                <div class="event-item">
                    <div class="event-icon ${icon.class}">
                        <i class="fas ${icon.icon}"></i>
                    </div>
                    <div class="event-content">
                        <div class="event-title">${title}</div>
                        <div class="event-details">${event.user_email || 'Anonyme'}</div>
                    </div>
                    <div class="event-time">${time}</div>
                </div>
            `;
        }).join('');
    }

    updateUserDetailsTable(userStats) {
        const container = document.getElementById('userDetailsTable');
        if (!container) return;
        
        if (userStats.length === 0) {
            container.innerHTML = '<div class="loading">Aucune donnée utilisateur</div>';
            return;
        }
        
        container.innerHTML = `
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Nom</th>
                        <th>Domaine</th>
                        <th>Sessions</th>
                        <th>Emails scannés</th>
                        <th>Dernière activité</th>
                    </tr>
                </thead>
                <tbody>
                    ${userStats.map(user => {
                        const lastActivity = user.last_activity ? 
                            new Date(user.last_activity).toLocaleDateString('fr-FR') : 
                            'Jamais';
                        
                        return `
                            <tr>
                                <td>${user.email}</td>
                                <td>${user.name || '-'}</td>
                                <td>${user.domain || '-'}</td>
                                <td>${user.total_sessions || 0}</td>
                                <td>${user.total_emails_scanned || 0}</td>
                                <td>${lastActivity}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    startAutoRefresh() {
        // Arrêter l'ancien interval s'il existe
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Actualiser toutes les 30 secondes
        this.refreshInterval = setInterval(() => {
            console.log('[AnalyticsModule] Auto-refresh triggered');
            this.loadAnalyticsData();
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    hide() {
        this.stopAutoRefresh();
        
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    destroy() {
        this.hide();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        this.container = null;
    }
}

// Créer l'instance globale de l'analytics manager
if (!window.analyticsManager) {
    window.analyticsManager = new AnalyticsManager();
    console.log('[Analytics] Global AnalyticsManager created v4.0');
}

// Créer le module analytics global
window.analyticsModule = new AnalyticsModule();

console.log('[Analytics] ✅ Analytics module loaded successfully v4.0');
