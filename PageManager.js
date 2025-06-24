// PageManager.js - Version 14.0 - SCAN ET AFFICHAGE CORRIGÉS COMPLETS

class PageManager {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = localStorage.getItem('hideEmailExplanation') === 'true';
        
        // SYSTÈME EMAIL ROBUSTE CORRIGÉ
        this.emailsCache = {
            rawEmails: [], // Emails bruts depuis l'API
            processedEmails: [], // Emails traités et catégorisés
            lastUpdate: null,
            scanInProgress: false,
            errors: []
        };
        
        // Vue modes pour les emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        
        // Gmail/Outlook detection et état RENFORCÉ
        this.currentProvider = null;
        this.connectionStatus = {
            gmail: false,
            outlook: false,
            lastCheck: null,
            authenticated: false
        };
        
        // PRIORITÉ NEWSLETTER/SPAM ABSOLUE
        this.categoryPriority = {
            'marketing_news': 1000,  // PRIORITÉ MAXIMALE ABSOLUE
            'spam': 950,
            'security': 900,
            'finance': 850,
            'tasks': 800,
            'meetings': 750,
            'commercial': 700,
            'support': 650,
            'hr': 600,
            'notifications': 100, // TRÈS RÉDUIT
            'reminders': 500,
            'project': 450,
            'internal': 400,
            'cc': 350,
            'other': 0
        };
        
        // Page renderers
        this.pages = {
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container),
            ranger: (container) => this.renderRanger(container)
        };
        
        this.setupEventListeners();
        this.detectProviders();
        this.init();
    }

    init() {
        console.log('[PageManager] ✅ Version 14.0 - SCAN ET AFFICHAGE CORRIGÉS COMPLETS');
        this.startPeriodicProviderCheck();
        this.loadEmailsFromCache();
    }

    // ================================================
    // SYSTÈME EMAIL ROBUSTE CORRIGÉ - NOUVELLE APPROCHE
    // ================================================
    
    /**
     * Récupère TOUS les emails de toutes les sources disponibles
     */
    async getAllEmailsRobust() {
        console.log('[PageManager] 📧 Récupération emails robuste...');
        
        // 1. Essayer EmailScanner en premier (si scan récent)
        if (window.emailScanner && typeof window.emailScanner.getAllEmails === 'function') {
            try {
                const scannerEmails = window.emailScanner.getAllEmails();
                if (scannerEmails && scannerEmails.length > 0) {
                    console.log(`[PageManager] ✅ ${scannerEmails.length} emails depuis EmailScanner`);
                    this.updateEmailsCache(scannerEmails, 'emailScanner');
                    return this.emailsCache.processedEmails;
                }
            } catch (error) {
                console.warn('[PageManager] ⚠️ Erreur EmailScanner:', error);
            }
        }
        
        // 2. Essayer le cache local
        if (this.emailsCache.processedEmails.length > 0) {
            console.log(`[PageManager] 📦 ${this.emailsCache.processedEmails.length} emails depuis cache`);
            return this.emailsCache.processedEmails;
        }
        
        // 3. Essayer sessionStorage (scan précédent)
        try {
            const sessionEmails = this.loadEmailsFromSessionStorage();
            if (sessionEmails && sessionEmails.length > 0) {
                console.log(`[PageManager] 💾 ${sessionEmails.length} emails depuis sessionStorage`);
                this.updateEmailsCache(sessionEmails, 'sessionStorage');
                return this.emailsCache.processedEmails;
            }
        } catch (error) {
            console.warn('[PageManager] ⚠️ Erreur sessionStorage:', error);
        }
        
        // 4. Essayer de déclencher un scan direct si provider connecté
        const provider = this.detectProviders();
        if (provider && !this.emailsCache.scanInProgress) {
            console.log('[PageManager] 🔄 Tentative scan direct...');
            try {
                const directEmails = await this.performDirectEmailScan();
                if (directEmails && directEmails.length > 0) {
                    console.log(`[PageManager] 🎯 ${directEmails.length} emails depuis scan direct`);
                    this.updateEmailsCache(directEmails, 'directScan');
                    return this.emailsCache.processedEmails;
                }
            } catch (error) {
                console.warn('[PageManager] ⚠️ Erreur scan direct:', error);
            }
        }
        
        console.warn('[PageManager] ❌ Aucun email trouvé depuis aucune source');
        return [];
    }

    /**
     * Scan direct des emails si provider disponible
     */
    async performDirectEmailScan() {
        const provider = this.detectProviders();
        if (!provider) {
            console.warn('[PageManager] Aucun provider pour scan direct');
            return [];
        }
        
        this.emailsCache.scanInProgress = true;
        
        try {
            let emails = [];
            
            if (provider === 'gmail' && window.googleAuthService) {
                emails = await this.scanGmailDirect();
            } else if (provider === 'outlook' && window.authService) {
                emails = await this.scanOutlookDirect();
            }
            
            // Traiter et catégoriser les emails
            if (emails.length > 0) {
                const processedEmails = await this.processAndCategorizeEmails(emails);
                this.saveEmailsToSessionStorage(processedEmails);
                return processedEmails;
            }
            
        } catch (error) {
            console.error('[PageManager] Erreur scan direct:', error);
            this.emailsCache.errors.push({
                timestamp: Date.now(),
                error: error.message,
                provider: provider
            });
        } finally {
            this.emailsCache.scanInProgress = false;
        }
        
        return [];
    }

    /**
     * Scan Gmail direct
     */
    async scanGmailDirect() {
        console.log('[PageManager] 📧 Scan Gmail direct...');
        
        const token = window.googleAuthService.getAccessToken();
        if (!token) throw new Error('Token Gmail non disponible');
        
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=in:inbox', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Gmail API error: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.messages) return [];
        
        // Récupérer les détails de chaque message
        const emails = [];
        for (const message of data.messages.slice(0, 30)) { // Limiter pour éviter rate limit
            try {
                const detailResponse = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (detailResponse.ok) {
                    const emailDetail = await detailResponse.json();
                    const processedEmail = this.convertGmailToStandardFormat(emailDetail);
                    if (processedEmail) {
                        emails.push(processedEmail);
                    }
                }
                
                // Délai pour éviter rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.warn(`[PageManager] Erreur récupération message ${message.id}:`, error);
            }
        }
        
        console.log(`[PageManager] ✅ ${emails.length} emails Gmail récupérés`);
        return emails;
    }

    /**
     * Scan Outlook direct
     */
    async scanOutlookDirect() {
        console.log('[PageManager] 📧 Scan Outlook direct...');
        
        const token = window.authService.getAccessToken();
        if (!token) throw new Error('Token Outlook non disponible');
        
        const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=50&$select=id,subject,from,receivedDateTime,bodyPreview,toRecipients,ccRecipients,hasAttachments,importance,categories', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Outlook API error: ${response.status}`);
        }
        
        const data = await response.json();
        const emails = data.value || [];
        
        // Enrichir chaque email avec le body complet si nécessaire
        for (const email of emails.slice(0, 20)) {
            try {
                const bodyResponse = await fetch(
                    `https://graph.microsoft.com/v1.0/me/messages/${email.id}?$select=body`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (bodyResponse.ok) {
                    const bodyData = await bodyResponse.json();
                    email.body = bodyData.body;
                }
                
                await new Promise(resolve => setTimeout(resolve, 50));
                
            } catch (error) {
                console.warn(`[PageManager] Erreur récupération body ${email.id}:`, error);
            }
        }
        
        console.log(`[PageManager] ✅ ${emails.length} emails Outlook récupérés`);
        return emails;
    }

    /**
     * Convertit un email Gmail au format standard
     */
    convertGmailToStandardFormat(gmailEmail) {
        if (!gmailEmail || !gmailEmail.payload) return null;
        
        const headers = gmailEmail.payload.headers || [];
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
        
        // Extraire le body
        let bodyContent = '';
        if (gmailEmail.payload.body && gmailEmail.payload.body.data) {
            bodyContent = atob(gmailEmail.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (gmailEmail.payload.parts) {
            // Email multipart
            for (const part of gmailEmail.payload.parts) {
                if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                    bodyContent = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    break;
                } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
                    bodyContent = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                }
            }
        }
        
        // Extraire preview (premiers 150 caractères du body nettoyé)
        const bodyPreview = bodyContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 150);
        
        return {
            id: gmailEmail.id,
            subject: getHeader('Subject') || '[Sans sujet]',
            from: {
                emailAddress: {
                    address: getHeader('From').replace(/.*<(.+?)>.*/, '$1') || getHeader('From'),
                    name: getHeader('From').replace(/^([^<]+)<.*/, '$1').trim() || getHeader('From')
                }
            },
            receivedDateTime: getHeader('Date') || new Date().toISOString(),
            bodyPreview: bodyPreview,
            body: {
                content: bodyContent,
                contentType: 'html'
            },
            toRecipients: this.parseEmailAddresses(getHeader('To')),
            ccRecipients: this.parseEmailAddresses(getHeader('Cc')),
            hasAttachments: gmailEmail.payload.parts?.some(part => 
                part.filename && part.filename.length > 0
            ) || false,
            importance: 'normal',
            categories: [],
            provider: 'gmail'
        };
    }

    /**
     * Parse les adresses email depuis un header
     */
    parseEmailAddresses(headerValue) {
        if (!headerValue) return [];
        
        const addresses = [];
        const emailRegex = /([^<,]+)<([^>]+)>|([^,\s]+@[^,\s]+)/g;
        let match;
        
        while ((match = emailRegex.exec(headerValue)) !== null) {
            if (match[2]) {
                // Format "Name <email@domain.com>"
                addresses.push({
                    emailAddress: {
                        name: match[1].trim(),
                        address: match[2].trim()
                    }
                });
            } else if (match[3]) {
                // Format "email@domain.com"
                addresses.push({
                    emailAddress: {
                        name: match[3].trim(),
                        address: match[3].trim()
                    }
                });
            }
        }
        
        return addresses;
    }

    /**
     * Traite et catégorise les emails avec le CategoryManager ULTRA-RENFORCÉ
     */
    async processAndCategorizeEmails(rawEmails) {
        console.log(`[PageManager] 🔄 Traitement et catégorisation de ${rawEmails.length} emails...`);
        
        if (!window.categoryManager) {
            console.error('[PageManager] CategoryManager non disponible');
            return rawEmails;
        }
        
        const processedEmails = [];
        const categoryStats = {};
        
        for (const email of rawEmails) {
            try {
                // Analyser avec CategoryManager
                const analysis = window.categoryManager.analyzeEmail(email);
                
                // Enrichir l'email avec les résultats d'analyse
                const processedEmail = {
                    ...email,
                    category: analysis.category,
                    categoryScore: analysis.score,
                    categoryConfidence: analysis.confidence,
                    matchedPatterns: analysis.matchedPatterns || [],
                    hasAbsolute: analysis.hasAbsolute || false,
                    priorityDetection: analysis.priorityDetection || null,
                    detectionMethod: analysis.detectionMethod || 'standard',
                    isSpam: analysis.isSpam || false,
                    isExcluded: analysis.isExcluded || false,
                    processedAt: Date.now()
                };
                
                // Marquer comme pré-sélectionné pour tâches si nécessaire
                const preselectedCategories = this.getTaskPreselectedCategories();
                processedEmail.isPreselectedForTasks = preselectedCategories.includes(analysis.category);
                
                processedEmails.push(processedEmail);
                
                // Stats
                categoryStats[analysis.category] = (categoryStats[analysis.category] || 0) + 1;
                
            } catch (error) {
                console.error('[PageManager] Erreur traitement email:', email.id, error);
                // Ajouter l'email avec catégorie par défaut
                processedEmails.push({
                    ...email,
                    category: 'other',
                    categoryScore: 0,
                    categoryConfidence: 0,
                    processedAt: Date.now()
                });
            }
        }
        
        console.log('[PageManager] ✅ Emails traités:', {
            total: processedEmails.length,
            categories: categoryStats,
            newsletter: categoryStats.marketing_news || 0,
            spam: categoryStats.spam || 0
        });
        
        return processedEmails;
    }

    /**
     * Met à jour le cache d'emails
     */
    updateEmailsCache(emails, source) {
        console.log(`[PageManager] 📦 Mise à jour cache emails depuis ${source}: ${emails.length} emails`);
        
        // Si emails déjà traités, les utiliser directement
        if (emails.length > 0 && emails[0].processedAt) {
            this.emailsCache.processedEmails = [...emails];
        } else {
            // Sinon, marquer pour traitement
            this.emailsCache.rawEmails = [...emails];
        }
        
        this.emailsCache.lastUpdate = Date.now();
        this.emailsCache.source = source;
        
        // Dispatcher événement
        this.dispatchEvent('emailsCacheUpdated', {
            count: emails.length,
            source: source,
            timestamp: Date.now()
        });
    }

    /**
     * Charge les emails depuis sessionStorage
     */
    loadEmailsFromSessionStorage() {
        try {
            const stored = sessionStorage.getItem('lastScanResults');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.emails && Array.isArray(data.emails)) {
                    console.log(`[PageManager] 📥 ${data.emails.length} emails chargés depuis sessionStorage`);
                    return data.emails;
                }
            }
        } catch (error) {
            console.warn('[PageManager] Erreur chargement sessionStorage:', error);
        }
        return null;
    }

    /**
     * Sauvegarde les emails dans sessionStorage
     */
    saveEmailsToSessionStorage(emails) {
        try {
            const data = {
                emails: emails,
                timestamp: Date.now(),
                provider: this.currentProvider,
                total: emails.length
            };
            sessionStorage.setItem('lastScanResults', JSON.stringify(data));
            console.log(`[PageManager] 💾 ${emails.length} emails sauvegardés dans sessionStorage`);
        } catch (error) {
            console.warn('[PageManager] Erreur sauvegarde sessionStorage:', error);
        }
    }

    /**
     * Charge les emails depuis le cache au démarrage
     */
    loadEmailsFromCache() {
        const cachedEmails = this.loadEmailsFromSessionStorage();
        if (cachedEmails && cachedEmails.length > 0) {
            this.updateEmailsCache(cachedEmails, 'startup_cache');
        }
    }

    /**
     * Méthode publique pour récupérer les emails (API simple)
     */
    getAllEmails() {
        // Retourner les emails traités du cache
        if (this.emailsCache.processedEmails.length > 0) {
            return this.emailsCache.processedEmails;
        }
        
        // Sinon retourner les emails bruts
        if (this.emailsCache.rawEmails.length > 0) {
            return this.emailsCache.rawEmails;
        }
        
        // Charger depuis sessionStorage si pas en cache
        const sessionEmails = this.loadEmailsFromSessionStorage();
        if (sessionEmails) {
            this.updateEmailsCache(sessionEmails, 'lazy_load');
            return sessionEmails;
        }
        
        return [];
    }

    /**
     * Trouve un email par ID - VERSION ULTRA-ROBUSTE
     */
    getEmailById(emailId) {
        if (!emailId) {
            console.warn('[PageManager] getEmailById appelé sans ID');
            return null;
        }

        // 1. Chercher dans le cache traité
        if (this.emailsCache.processedEmails.length > 0) {
            const email = this.emailsCache.processedEmails.find(e => e.id === emailId);
            if (email) return email;
        }
        
        // 2. Chercher dans le cache brut
        if (this.emailsCache.rawEmails.length > 0) {
            const email = this.emailsCache.rawEmails.find(e => e.id === emailId);
            if (email) return email;
        }
        
        // 3. Chercher dans EmailScanner
        if (window.emailScanner) {
            if (typeof window.emailScanner.getEmailById === 'function') {
                const email = window.emailScanner.getEmailById(emailId);
                if (email) return email;
            }
            
            if (typeof window.emailScanner.getAllEmails === 'function') {
                const allEmails = window.emailScanner.getAllEmails();
                const email = allEmails.find(e => e.id === emailId);
                if (email) return email;
            }
        }
        
        // 4. Chercher dans sessionStorage
        const sessionEmails = this.loadEmailsFromSessionStorage();
        if (sessionEmails) {
            const email = sessionEmails.find(e => e.id === emailId);
            if (email) return email;
        }

        console.warn(`[PageManager] Email non trouvé: ${emailId}`);
        return null;
    }

    // ================================================
    // DÉTECTION PROVIDER RENFORCÉE
    // ================================================
    detectProviders() {
        console.log('[PageManager] 🔍 Détection providers email RENFORCÉE...');
        
        // Reset
        this.connectionStatus = {
            gmail: false,
            outlook: false,
            lastCheck: Date.now(),
            authenticated: false
        };
        
        // PRIORITÉ 1: Gmail
        if (window.googleAuthService && 
            typeof window.googleAuthService.isAuthenticated === 'function') {
            try {
                const isGmailAuth = window.googleAuthService.isAuthenticated();
                this.connectionStatus.gmail = isGmailAuth;
                
                if (isGmailAuth) {
                    this.currentProvider = 'gmail';
                    this.connectionStatus.authenticated = true;
                    console.log('[PageManager] ✅ Gmail AUTHENTIFIÉ et PRÊT');
                    return 'gmail';
                }
            } catch (error) {
                console.warn('[PageManager] ⚠️ Erreur vérification Gmail:', error);
            }
        }
        
        // PRIORITÉ 2: Outlook
        if (window.authService && 
            typeof window.authService.isAuthenticated === 'function') {
            try {
                const isOutlookAuth = window.authService.isAuthenticated();
                this.connectionStatus.outlook = isOutlookAuth;
                
                if (isOutlookAuth) {
                    this.currentProvider = 'outlook';
                    this.connectionStatus.authenticated = true;
                    console.log('[PageManager] ✅ Outlook AUTHENTIFIÉ et PRÊT');
                    return 'outlook';
                }
            } catch (error) {
                console.warn('[PageManager] ⚠️ Erreur vérification Outlook:', error);
            }
        }
        
        console.log('[PageManager] ⚠️ Aucun provider email authentifié');
        this.currentProvider = null;
        this.connectionStatus.authenticated = false;
        return null;
    }

    getProviderInfo() {
        const provider = this.detectProviders();
        
        if (provider === 'gmail') {
            return {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#ea4335',
                status: 'connected',
                priority: 'high',
                optimized: true,
                canScan: true
            };
        } else if (provider === 'outlook') {
            return {
                name: 'Outlook',
                icon: 'fab fa-microsoft',
                color: '#0078d4',
                status: 'connected',
                priority: 'normal',
                optimized: true,
                canScan: true
            };
        }
        
        return {
            name: 'Non connecté',
            icon: 'fas fa-unlink',
            color: '#6b7280',
            status: 'disconnected',
            priority: 'none',
            optimized: false,
            canScan: false
        };
    }

    // ================================================
    // ACTUALISATION ET SCAN FORCÉ
    // ================================================
    
    /**
     * Force un nouveau scan complet
     */
    async forceEmailScan() {
        console.log('[PageManager] 🔄 SCAN FORCÉ démarré...');
        
        const provider = this.detectProviders();
        if (!provider) {
            throw new Error('Aucun provider email connecté');
        }
        
        // Vider le cache
        this.emailsCache = {
            rawEmails: [],
            processedEmails: [],
            lastUpdate: null,
            scanInProgress: false,
            errors: []
        };
        
        // Déclencher scan direct
        const emails = await this.performDirectEmailScan();
        
        if (emails.length > 0) {
            // Notifier les composants
            this.dispatchEvent('emailsRefreshed', {
                count: emails.length,
                provider: provider,
                timestamp: Date.now()
            });
            
            console.log(`[PageManager] ✅ SCAN FORCÉ terminé: ${emails.length} emails`);
            return emails;
        }
        
        throw new Error('Aucun email récupéré lors du scan forcé');
    }

    /**
     * Actualise les emails (API publique)
     */
    async refreshEmails() {
        window.uiManager?.showLoading('Actualisation des emails...');
        
        try {
            // Tenter un scan forcé
            await this.forceEmailScan();
            
            // Recharger la page emails si on y est
            if (this.currentPage === 'emails') {
                await this.loadPage('emails');
            }
            
            window.uiManager?.showToast(`Emails actualisés (${this.currentProvider})`, 'success');
            
        } catch (error) {
            console.error('[PageManager] Erreur actualisation:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
        } finally {
            window.uiManager?.hideLoading();
        }
    }

    // ================================================
    // ÉVÉNEMENTS ET SYNCHRONISATION
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[PageManager] 📨 Paramètres changés:', event.detail);
            this.handleSettingsChanged(event.detail);
        });

        window.addEventListener('settingsChanged', (event) => {
            console.log('[PageManager] 📨 Changement générique:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
        });

        // Écouter les fins de scan
        window.addEventListener('scanCompleted', (event) => {
            console.log('[PageManager] 📨 Scan terminé:', event.detail);
            this.handleScanCompleted(event.detail);
        });

        // Écouter les recatégorisations
        window.addEventListener('emailsRecategorized', (event) => {
            console.log('[PageManager] 📨 Emails recatégorisés');
            this.handleEmailsRecategorized(event.detail);
        });

        // Écouter le scroll
        window.addEventListener('scroll', () => {
            this.handleScrollForSticky();
        });
    }

    handleScanCompleted(eventDetail) {
        this.lastScanData = eventDetail;
        
        // Mettre à jour le cache si des emails sont fournis
        if (eventDetail.emails && Array.isArray(eventDetail.emails)) {
            this.updateEmailsCache(eventDetail.emails, 'scan_completed');
        } else {
            // Recharger depuis EmailScanner
            this.reloadFromEmailScanner();
        }
        
        // Rafraîchir la vue si on est sur la page emails
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.loadPage('emails');
            }, 100);
        }
    }

    handleEmailsRecategorized(eventDetail) {
        if (eventDetail && eventDetail.emails) {
            this.updateEmailsCache(eventDetail.emails, 'recategorized');
        } else {
            this.reloadFromEmailScanner();
        }
        
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.refreshEmailsView();
            }, 100);
        }
    }

    reloadFromEmailScanner() {
        if (window.emailScanner && typeof window.emailScanner.getAllEmails === 'function') {
            try {
                const emails = window.emailScanner.getAllEmails();
                if (emails && emails.length > 0) {
                    this.updateEmailsCache(emails, 'emailScanner_reload');
                }
            } catch (error) {
                console.warn('[PageManager] Erreur rechargement EmailScanner:', error);
            }
        }
    }

    handleSettingsChanged(settingsData) {
        console.log('[PageManager] 🔧 Traitement changement paramètres:', settingsData);
        
        if (settingsData.settings?.taskPreselectedCategories) {
            console.log('[PageManager] 📋 Catégories pré-sélectionnées changées');
            
            // Forcer une re-catégorisation
            if (window.emailScanner && this.emailsCache.processedEmails.length > 0) {
                setTimeout(() => {
                    if (typeof window.emailScanner.recategorizeEmails === 'function') {
                        window.emailScanner.recategorizeEmails();
                    }
                }, 100);
            }
        }
        
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.refreshEmailsView();
            }, 200);
        }
    }

    handleGenericSettingsChanged(changeData) {
        const { type, value } = changeData;
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[PageManager] 📋 Catégories pour tâches changées:', value);
                break;
                
            case 'activeCategories':
                console.log('[PageManager] 🏷️ Catégories actives changées:', value);
                // Forcer recatégorisation
                if (window.emailScanner && this.emailsCache.processedEmails.length > 0) {
                    setTimeout(() => {
                        if (typeof window.emailScanner.recategorizeEmails === 'function') {
                            window.emailScanner.recategorizeEmails();
                        }
                    }, 150);
                }
                break;
        }
    }

    // ================================================
    // RENDU PAGE EMAILS CORRIGÉ
    // ================================================
    async renderEmails(container) {
        console.log('[PageManager] 📧 Rendu page emails CORRIGÉ...');
        
        // Récupérer les emails avec la méthode robuste
        const emails = await this.getAllEmailsRobust();
        const categories = window.categoryManager?.getCategories() || {};
        
        console.log(`[PageManager] 📧 ${emails.length} emails à afficher`);
        console.log(`[PageManager] 🔌 Provider: ${this.currentProvider}`);
        
        if (emails.length === 0) {
            container.innerHTML = this.renderEmptyEmailsState();
            return;
        }

        // Assurer la détection Newsletter/Spam en priorité
        this.ensureNewsletterSpamPriority(emails);

        const categoryCounts = this.calculateCategoryCounts(emails);
        const totalEmails = emails.length;
        const selectedCount = this.selectedEmails.size;
        const providerInfo = this.getProviderInfo();
        
        // Stats Newsletter/Spam
        const newsletterCount = emails.filter(e => e.category === 'marketing_news').length;
        const spamCount = emails.filter(e => e.category === 'spam').length;
        const preselectedCount = emails.filter(e => e.isPreselectedForTasks).length;
        
        container.innerHTML = `
            <div class="tasks-page-modern">
                <!-- Statut du cache et provider -->
                <div class="cache-status-info">
                    <div class="cache-indicators">
                        <div class="cache-indicator ${this.emailsCache.processedEmails.length > 0 ? 'active' : ''}">
                            <i class="fas fa-database"></i>
                            <span>Cache: ${this.emailsCache.processedEmails.length} emails</span>
                        </div>
                        <div class="provider-indicator ${providerInfo.status === 'connected' ? 'connected' : 'disconnected'}">
                            <i class="${providerInfo.icon}"></i>
                            <span>${providerInfo.name}</span>
                            ${providerInfo.optimized ? '<span class="opt-badge">✨</span>' : ''}
                        </div>
                        <div class="scan-indicator ${this.emailsCache.scanInProgress ? 'scanning' : ''}">
                            <i class="fas fa-sync-alt ${this.emailsCache.scanInProgress ? 'fa-spin' : ''}"></i>
                            <span>${this.emailsCache.scanInProgress ? 'Scan en cours...' : 'Prêt'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Texte explicatif -->
                ${!this.hideExplanation ? `
                    <div class="explanation-text-harmonized ${providerInfo.status === 'connected' ? 'provider-connected' : 'provider-disconnected'}">
                        <div class="explanation-content">
                            <div class="explanation-main">
                                <i class="fas fa-info-circle"></i>
                                <span>
                                    Cliquez sur vos emails pour les sélectionner, puis utilisez les boutons d'action. 
                                    <strong>Detection Newsletter/Spam ULTRA-RENFORCÉE active.</strong>
                                </span>
                            </div>
                            <div class="explanation-stats">
                                <span class="stat-item newsletter">📰 ${newsletterCount} newsletters</span>
                                <span class="stat-item spam">🚫 ${spamCount} spam</span>
                                <span class="stat-item preselected">⭐ ${preselectedCount} pré-sélectionnés</span>
                                <span class="stat-item provider" style="color: ${providerInfo.color};">
                                    <i class="${providerInfo.icon}"></i> ${providerInfo.name}
                                </span>
                            </div>
                        </div>
                        <button class="explanation-close-btn" onclick="window.pageManager.hideExplanationMessage()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}

                <!-- Contrôles -->
                <div class="controls-and-filters-container">
                    <div class="controls-bar-single-line">
                        <!-- Actions de scan -->
                        <div class="scan-controls">
                            <button class="btn-action btn-scan" onclick="window.pageManager.refreshEmails()" 
                                    ${this.emailsCache.scanInProgress ? 'disabled' : ''}>
                                <i class="fas fa-sync-alt ${this.emailsCache.scanInProgress ? 'fa-spin' : ''}"></i>
                                <span class="btn-text">${this.emailsCache.scanInProgress ? 'Scan...' : 'Actualiser'}</span>
                            </button>
                            
                            ${providerInfo.canScan ? `
                                <button class="btn-action btn-force-scan" onclick="window.pageManager.forceEmailScan()" 
                                        ${this.emailsCache.scanInProgress ? 'disabled' : ''}>
                                    <i class="fas fa-search"></i>
                                    <span class="btn-text">Scan forcé</span>
                                </button>
                            ` : ''}
                        </div>
                        
                        <!-- Recherche -->
                        <div class="search-section">
                            <div class="search-box">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" 
                                       class="search-input" 
                                       id="emailSearchInput"
                                       placeholder="Rechercher..." 
                                       value="${this.searchTerm}">
                                ${this.searchTerm ? `
                                    <button class="search-clear" onclick="window.pageManager.clearSearch()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Modes de vue -->
                        <div class="view-modes">
                            <button class="view-mode ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                    onclick="window.pageManager.changeViewMode('grouped-domain')">
                                <i class="fas fa-globe"></i>
                                <span>Domaine</span>
                            </button>
                            <button class="view-mode ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                    onclick="window.pageManager.changeViewMode('grouped-sender')">
                                <i class="fas fa-user"></i>
                                <span>Expéditeur</span>
                            </button>
                            <button class="view-mode ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                    onclick="window.pageManager.changeViewMode('flat')">
                                <i class="fas fa-list"></i>
                                <span>Liste</span>
                            </button>
                        </div>
                        
                        <!-- Actions principales -->
                        <div class="action-buttons">
                            <button class="btn-action btn-selection-toggle" 
                                    onclick="window.pageManager.toggleAllSelection()">
                                <i class="fas fa-check-square"></i>
                                <span class="btn-text">Sélectionner tous</span>
                                <span class="btn-count">(${this.getVisibleEmails().length})</span>
                            </button>
                            
                            <button class="btn-action btn-primary ${selectedCount === 0 ? 'disabled' : ''}" 
                                    onclick="window.pageManager.createTasksFromSelection()"
                                    ${selectedCount === 0 ? 'disabled' : ''}>
                                <i class="fas fa-tasks"></i>
                                <span class="btn-text">Créer tâche${selectedCount > 1 ? 's' : ''}</span>
                                ${selectedCount > 0 ? `<span class="count-badge">${selectedCount}</span>` : ''}
                            </button>
                            
                            ${selectedCount > 0 ? `
                                <button class="btn-action btn-clear" 
                                        onclick="window.pageManager.clearSelection()">
                                    <i class="fas fa-times"></i>
                                    <span class="btn-text">Effacer (${selectedCount})</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Filtres de catégories avec priorité Newsletter/Spam -->
                    <div class="status-filters-compact">
                        ${this.buildPriorityCompactCategoryTabs(categoryCounts, totalEmails, categories)}
                    </div>
                </div>

                <!-- Container fixe (clone) -->
                <div class="sticky-controls-container">
                    <!-- Contenu cloné dynamiquement -->
                </div>

                <!-- CONTENU DES EMAILS -->
                <div class="tasks-container-harmonized">
                    ${this.renderEmailsList()}
                </div>
            </div>
        `;

        this.addEmailStyles();
        this.setupEmailsEventListeners();
        this.setupStickyControls();
        
        // Auto-analyze si activé
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            const preselectedCategories = this.getTaskPreselectedCategories();
            
            if (preselectedCategories && preselectedCategories.length > 0) {
                const emailsToAnalyze = emails.filter(email => 
                    preselectedCategories.includes(email.category)
                ).slice(0, 5);
                
                if (emailsToAnalyze.length > 0) {
                    setTimeout(() => {
                        this.analyzeFirstEmails(emailsToAnalyze);
                    }, 1000);
                }
            }
        }
    }

    // ================================================
    // PRIORITÉ NEWSLETTER/SPAM - MÉTHODE RENFORCÉE
    // ================================================
    ensureNewsletterSpamPriority(emails) {
        console.log('[PageManager] 🔍 Vérification PRIORITÉ Newsletter/Spam ULTRA-RENFORCÉE...');
        
        let corrected = 0;
        
        emails.forEach(email => {
            const originalCategory = email.category;
            const correctedCategory = this.detectNewsletterSpamPriorityEnhanced(email);
            
            if (correctedCategory && correctedCategory !== originalCategory) {
                console.log(`[PageManager] 📰 CORRECTION PRIORITÉ: "${email.subject?.substring(0, 40)}" ${originalCategory} → ${correctedCategory}`);
                email.category = correctedCategory;
                email.categoryScore = (email.categoryScore || 0) + 100; // Bonus important
                email.categoryConfidence = Math.max(email.categoryConfidence || 0, 0.95);
                email.priorityCorrection = true;
                email.correctionMethod = 'priority_enhanced';
                corrected++;
            }
        });
        
        if (corrected > 0) {
            console.log(`[PageManager] ✅ ${corrected} emails CORRIGÉS avec priorité Newsletter/Spam ULTRA-RENFORCÉE`);
        }
    }

    detectNewsletterSpamPriorityEnhanced(email) {
        const content = this.extractEmailContentForAnalysis(email);
        
        // PATTERNS NEWSLETTER ULTRA-RENFORCÉS
        const newsletterPatterns = [
            // Désabonnement - ABSOLU
            /unsubscribe|désabonner|se désinscrire|opt[-\s]?out/i,
            /ne plus recevoir|stop emails|arreter.*emails/i,
            /email preferences|préférences email|gérer.*abonnement/i,
            /view in browser|voir.*navigateur|version web/i,
            /mailing list|liste.*diffusion|newsletter/i,
            
            // Services spécifiques - ULTRA-PRIORITÉ
            /google cloud|twitch|youtube|netflix|spotify|amazon/i,
            /microsoft|apple|github|linkedin|facebook/i,
            
            // Adresses noreply - PRIORITÉ ABSOLUE
            /noreply@|no[-\s]?reply@|donotreply@|notifications@/i,
            /updates@|news@|newsletter@|marketing@|promo@/i,
            
            // Contenu promotionnel
            /promotion|promo|offer|offre|deal|sale|vente/i,
            /shop now|buy now|acheter|commande|order/i,
            /limited.*time|temps.*limité|expire.*soon/i,
            
            // Structure newsletter
            /follow us|suivez[-\s]?nous|social media|réseaux sociaux/i,
            /you.*receiving.*email|vous recevez.*email/i,
            
            // Encodage défectueux (courrier Microsoft, etc.)
            /sÃ©curitÃ©|notificatÃ©|prÃ©fÃ©rences|dÃ©sabonner/i,
            /confidentialitÃ©|Ã©quipe|rÃ©ception/i
        ];
        
        // PATTERNS SPAM
        const spamPatterns = [
            /urgent.*action|action.*urgente|immediately.*click/i,
            /félicitations.*gagné|congratulations.*won|winner/i,
            /claim.*prize|réclamez.*prix|free.*money/i,
            /100%.*gratuit.*aucun.*frais|completely free/i,
            /limited.*offer.*expires|offre.*expire.*rapidement/i
        ];
        
        // VÉRIFICATION ULTRA-PRIORITAIRE NEWSLETTER
        let newsletterScore = 0;
        newsletterPatterns.forEach(pattern => {
            if (pattern.test(content.text) || 
                pattern.test(content.subject) ||
                pattern.test(content.sender)) {
                newsletterScore += 50;
            }
        });
        
        // Bonus pour domaines newsletter
        if (this.isNewsletterDomain(content.domain)) {
            newsletterScore += 100;
        }
        
        // Bonus pour adresses noreply
        if (/noreply|no[-\s]?reply|donotreply|notifications|updates|news|newsletter|marketing|promo/.test(content.sender)) {
            newsletterScore += 80;
        }
        
        // Bonus pour services connus
        const knownServices = ['google', 'microsoft', 'twitch', 'youtube', 'netflix', 'spotify', 'amazon', 'apple'];
        if (knownServices.some(service => 
            content.sender.includes(service) || 
            content.subject.includes(service) ||
            content.domain.includes(service)
        )) {
            newsletterScore += 120;
        }
        
        // DÉCISION NEWSLETTER avec seuil TRÈS PERMISSIF
        if (newsletterScore >= 50) { // Seuil très bas
            return 'marketing_news';
        }
        
        // VÉRIFICATION SPAM
        let spamScore = 0;
        spamPatterns.forEach(pattern => {
            if (pattern.test(content.text) || pattern.test(content.subject)) {
                spamScore += 30;
            }
        });
        
        if (this.isSuspiciousDomain(content.domain)) {
            spamScore += 50;
        }
        
        if (spamScore >= 60) {
            return 'spam';
        }
        
        return null; // Pas de correction
    }

    isNewsletterDomain(domain) {
        const newsletterDomains = [
            'mailchimp.com', 'sendgrid.net', 'constantcontact.com',
            'aweber.com', 'getresponse.com', 'campaign-monitor.com',
            'sendinblue.com', 'klaviyo.com', 'convertkit.com',
            'activecampaign.com', 'drip.com', 'infusionsoft.com',
            'pardot.com', 'hubspot.com', 'marketo.com',
            'google.com', 'microsoft.com', 'twitch.tv',
            'youtube.com', 'netflix.com', 'spotify.com',
            'amazon.com', 'apple.com'
        ];
        
        return newsletterDomains.some(nd => domain.includes(nd));
    }

    extractEmailContentForAnalysis(email) {
        const subject = email.subject || '';
        const body = email.bodyPreview || email.body?.content || '';
        const sender = email.from?.emailAddress?.address || '';
        const senderName = email.from?.emailAddress?.name || '';
        const domain = sender.includes('@') ? sender.split('@')[1] : '';
        
        return {
            text: (subject + ' ' + body + ' ' + senderName).toLowerCase(),
            subject: subject.toLowerCase(),
            sender: sender.toLowerCase(),
            domain: domain.toLowerCase()
        };
    }

    isSuspiciousDomain(domain) {
        const suspiciousDomains = [
            'temp-mail', 'guerrillamail', '10minutemail', 'mailinator',
            'throwaway', 'fakeinbox', 'yopmail', 'maildrop',
            'temp', 'disposable', 'spam', 'fake'
        ];
        
        return suspiciousDomains.some(suspicious => domain.includes(suspicious));
    }

    // ================================================
    // RENDU LISTE EMAILS CORRIGÉ
    // ================================================
    renderEmailsList() {
        const emails = this.getAllEmails();
        let filteredEmails = emails;
        
        console.log(`[PageManager] 📧 Rendu liste: ${emails.length} total, catégorie: ${this.currentCategory}`);
        
        // Filtrage par catégorie
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                });
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
            }
        }
        
        // Filtrage par recherche
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        console.log(`[PageManager] 📧 Emails filtrés: ${filteredEmails.length}`);
        
        if (filteredEmails.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'flat':
                return this.renderFlatView(filteredEmails);
            case 'grouped-domain':
            case 'grouped-sender':
                return this.renderGroupedView(filteredEmails, this.currentViewMode);
            default:
                return this.renderFlatView(filteredEmails);
        }
    }

    renderFlatView(emails) {
        return `
            <div class="tasks-harmonized-list">
                ${emails.map(email => this.renderEmailRowEnhanced(email)).join('')}
            </div>
        `;
    }

    renderEmailRowEnhanced(email) {
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        const preselectedCategories = this.getTaskPreselectedCategories();
        let isPreselectedForTasks = email.isPreselectedForTasks === true;
        
        if (!isPreselectedForTasks && preselectedCategories.includes(email.category)) {
            isPreselectedForTasks = true;
            email.isPreselectedForTasks = true;
        }
        
        const isSelected = this.selectedEmails.has(email.id) || isPreselectedForTasks;
        
        if (isPreselectedForTasks && !this.selectedEmails.has(email.id)) {
            this.selectedEmails.add(email.id);
        }
        
        // Classes spéciales ULTRA-RENFORCÉES
        let specialClasses = '';
        let priorityBadge = '';
        
        if (email.category === 'marketing_news') {
            specialClasses = 'newsletter-email ultra-enhanced';
            priorityBadge = '<span class="priority-badge newsletter">📰 Newsletter</span>';
        } else if (email.category === 'spam') {
            specialClasses = 'spam-email ultra-enhanced';
            priorityBadge = '<span class="priority-badge spam">🚫 Spam</span>';
        } else if (email.priorityCorrection) {
            specialClasses = 'priority-corrected';
            priorityBadge = '<span class="priority-badge corrected">✅ Corrigé</span>';
        }
        
        const cardClasses = [
            'task-harmonized-card',
            'email-card-enhanced',
            isSelected ? 'selected' : '',
            hasTask ? 'has-task' : '',
            isPreselectedForTasks ? 'preselected-task' : '',
            specialClasses
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${cardClasses}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}"
                 data-preselected="${isPreselectedForTasks}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="priority-bar-harmonized" 
                     style="background-color: ${isPreselectedForTasks ? '#8b5cf6' : this.getEmailPriorityColor(email)}"></div>
                
                <div class="task-main-content-harmonized">
                    <div class="task-header-harmonized">
                        <h3 class="task-title-harmonized">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="task-meta-harmonized">
                            <span class="task-type-badge-harmonized">📧 Email</span>
                            <span class="deadline-badge-harmonized">
                                📅 ${this.formatEmailDate(email.receivedDateTime)}
                            </span>
                            ${email.categoryScore ? `
                                <span class="confidence-badge-harmonized">
                                    🎯 ${Math.round(email.categoryConfidence * 100)}%
                                </span>
                            ` : ''}
                            ${priorityBadge}
                            ${isPreselectedForTasks ? `
                                <span class="preselected-badge-harmonized">
                                    ⭐ Pré-sélectionné
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="task-recipient-harmonized">
                        <i class="fas fa-envelope"></i>
                        <span class="recipient-name-harmonized">${this.escapeHtml(senderName)}</span>
                        <span class="recipient-email-harmonized">${this.escapeHtml(senderEmail)}</span>
                        ${email.hasAttachments ? '<span class="attachment-indicator">📎 Pièce jointe</span>' : ''}
                        ${email.category && email.category !== 'other' ? `
                            <span class="category-indicator-harmonized enhanced ${email.category === 'marketing_news' ? 'newsletter-category' : ''} ${email.category === 'spam' ? 'spam-category' : ''}" 
                                  style="background: ${this.getCategoryColor(email.category)}20; 
                                         color: ${this.getCategoryColor(email.category)};
                                         ${isPreselectedForTasks ? 'font-weight: 700;' : ''}">
                                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                ${isPreselectedForTasks ? ' ⭐' : ''}
                            </span>
                        ` : ''}
                        
                        <!-- Informations de détection -->
                        ${email.detectionMethod ? `
                            <span class="detection-info" title="Méthode: ${email.detectionMethod}">
                                🔍 ${email.detectionMethod}
                            </span>
                        ` : ''}
                    </div>
                    
                    <!-- Preview du contenu -->
                    ${email.bodyPreview ? `
                        <div class="email-preview-content">
                            <p class="preview-text">${this.escapeHtml(email.bodyPreview.substring(0, 150))}${email.bodyPreview.length > 150 ? '...' : ''}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="task-actions-harmonized">
                    ${this.renderEmailActionsEnhanced(email)}
                </div>
            </div>
        `;
    }

    renderEmailActionsEnhanced(email) {
        const hasTask = this.createdTasks.has(email.id);
        const actions = [];
        
        if (!hasTask) {
            actions.push(`
                <button class="action-btn-harmonized create-task enhanced" 
                        onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')"
                        title="Créer une tâche">
                    <i class="fas fa-tasks"></i>
                </button>
            `);
        } else {
            actions.push(`
                <button class="action-btn-harmonized view-task enhanced" 
                        onclick="event.stopPropagation(); window.pageManager.openCreatedTask('${email.id}')"
                        title="Voir la tâche créée">
                    <i class="fas fa-check-circle"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-harmonized details enhanced" 
                    onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')"
                    title="Voir l'email complet">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // ================================================
    // GESTION SÉLECTION ET INTERACTIONS
    // ================================================
    
    toggleAllSelection() {
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        if (allSelected) {
            visibleEmails.forEach(email => {
                this.selectedEmails.delete(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails désélectionnés`, 'info');
        } else {
            visibleEmails.forEach(email => {
                this.selectedEmails.add(email.id);
            });
            window.uiManager?.showToast(`${visibleEmails.length} emails sélectionnés`, 'success');
        }
        
        this.refreshEmailsView();
    }

    toggleEmailSelection(emailId) {
        console.log('[PageManager] Toggle sélection:', emailId);
        
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        const checkbox = document.querySelector(`[data-email-id="${emailId}"] .task-checkbox-harmonized`);
        if (checkbox) {
            checkbox.checked = this.selectedEmails.has(emailId);
        }
        
        this.updateControlsBarOnly();
        console.log('[PageManager] Total sélectionnés:', this.selectedEmails.size);
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.refreshEmailsView();
        window.uiManager?.showToast('Sélection effacée', 'info');
    }

    getVisibleEmails() {
        const emails = this.getAllEmails();
        let filteredEmails = emails;
        
        if (this.currentCategory && this.currentCategory !== 'all') {
            if (this.currentCategory === 'other') {
                filteredEmails = filteredEmails.filter(email => {
                    const cat = email.category;
                    return !cat || cat === 'other' || cat === null || cat === undefined || cat === '';
                });
            } else {
                filteredEmails = filteredEmails.filter(email => email.category === this.currentCategory);
            }
        }
        
        if (this.searchTerm) {
            filteredEmails = filteredEmails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        return filteredEmails;
    }

    matchesSearch(email, searchTerm) {
        if (!searchTerm) return true;
        
        const search = searchTerm.toLowerCase();
        const subject = (email.subject || '').toLowerCase();
        const sender = (email.from?.emailAddress?.name || '').toLowerCase();
        const senderEmail = (email.from?.emailAddress?.address || '').toLowerCase();
        const preview = (email.bodyPreview || '').toLowerCase();
        
        return subject.includes(search) || 
               sender.includes(search) || 
               senderEmail.includes(search) || 
               preview.includes(search);
    }

    handleEmailClick(event, emailId) {
        // Éviter les double-clics sur la checkbox
        if (event.target.type === 'checkbox') {
            return;
        }
        
        // Éviter les clics sur les boutons d'action
        if (event.target.closest('.task-actions-harmonized')) {
            return;
        }
        
        // Éviter les clics sur les headers de groupes
        if (event.target.closest('.group-header-harmonized')) {
            return;
        }
        
        // Gestion du double-clic pour sélection
        const now = Date.now();
        const lastClick = this.lastEmailClick || 0;
        
        if (now - lastClick < 300) {
            // Double-clic: sélectionner/désélectionner
            event.preventDefault();
            event.stopPropagation();
            this.toggleEmailSelection(emailId);
            this.lastEmailClick = 0;
            return;
        }
        
        // Simple clic: ouvrir email après délai
        this.lastEmailClick = now;
        
        setTimeout(() => {
            if (Date.now() - this.lastEmailClick >= 250) {
                this.showEmailModal(emailId);
            }
        }, 250);
    }

    /**
     * Affiche la modal d'un email - VERSION ULTRA-COMPLÈTE
     */
    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            console.error('[PageManager] Email non trouvé pour la modal:', emailId);
            window.uiManager?.showToast('Email non trouvé', 'error');
            return;
        }

        // Supprimer toute modal existante
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const providerInfo = this.getProviderInfo();
        const uniqueId = 'email_modal_' + Date.now();
        
        // Informations détaillées de l'email
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const hasAttachments = email.hasAttachments || false;
        const importance = email.importance || 'normal';
        
        // Destinataires
        const toRecipients = email.toRecipients || [];
        const ccRecipients = email.ccRecipients || [];
        
        // Analyse et catégorisation
        const categoryInfo = this.getCategoryInfo(email.category);
        const detectionInfo = this.getDetectionInfo(email);
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    
                    <!-- En-tête modal -->
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">Email Complet</h2>
                            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 8px;">
                                <!-- Provider -->
                                <span style="background: ${providerInfo.color}; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                    <i class="${providerInfo.icon}"></i> ${providerInfo.name}
                                </span>
                                
                                <!-- Catégorie -->
                                ${categoryInfo ? `
                                    <span style="background: ${categoryInfo.color}20; color: ${categoryInfo.color}; border: 1px solid ${categoryInfo.color}40; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                        ${categoryInfo.icon} ${categoryInfo.name}
                                    </span>
                                ` : ''}
                                
                                <!-- Badges spéciaux -->
                                ${email.category === 'marketing_news' ? '<span style="background: #f97316; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">📰 Newsletter</span>' : ''}
                                ${email.category === 'spam' ? '<span style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">🚫 Spam</span>' : ''}
                                ${email.priorityCorrection ? '<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">✅ Corrigé</span>' : ''}
                                ${email.isPreselectedForTasks ? '<span style="background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">⭐ Pré-sélectionné</span>' : ''}
                                
                                <!-- Importance -->
                                ${importance === 'high' ? '<span style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">🔥 Important</span>' : ''}
                                
                                <!-- Pièces jointes -->
                                ${hasAttachments ? '<span style="background: #0ea5e9; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">📎 Pièces jointes</span>' : ''}
                            </div>
                        </div>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; flex-shrink: 0;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Contenu principal -->
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        
                        <!-- Informations de base -->
                        <div style="margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #374151;">Informations de l'email</h3>
                            
                            <div style="display: grid; gap: 12px;">
                                <!-- De -->
                                <div style="display: flex; align-items: flex-start; gap: 12px;">
                                    <span style="font-weight: 700; color: #374151; min-width: 80px;">De:</span>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #1f2937;">${this.escapeHtml(senderName)}</div>
                                        <div style="font-size: 14px; color: #6b7280; font-family: monospace;">&lt;${this.escapeHtml(senderEmail)}&gt;</div>
                                    </div>
                                </div>
                                
                                <!-- À -->
                                ${toRecipients.length > 0 ? `
                                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                                        <span style="font-weight: 700; color: #374151; min-width: 80px;">À:</span>
                                        <div style="flex: 1;">
                                            ${toRecipients.map(recipient => `
                                                <div style="margin-bottom: 4px;">
                                                    <span style="font-weight: 500;">${this.escapeHtml(recipient.emailAddress?.name || recipient.emailAddress?.address || '')}</span>
                                                    ${recipient.emailAddress?.name ? `<span style="color: #6b7280; font-size: 14px; font-family: monospace;"> &lt;${this.escapeHtml(recipient.emailAddress.address)}&gt;</span>` : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <!-- Cc -->
                                ${ccRecipients.length > 0 ? `
                                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                                        <span style="font-weight: 700; color: #374151; min-width: 80px;">Cc:</span>
                                        <div style="flex: 1;">
                                            ${ccRecipients.map(recipient => `
                                                <div style="margin-bottom: 4px;">
                                                    <span style="font-weight: 500;">${this.escapeHtml(recipient.emailAddress?.name || recipient.emailAddress?.address || '')}</span>
                                                    ${recipient.emailAddress?.name ? `<span style="color: #6b7280; font-size: 14px; font-family: monospace;"> &lt;${this.escapeHtml(recipient.emailAddress.address)}&gt;</span>` : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <!-- Date -->
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-weight: 700; color: #374151; min-width: 80px;">Date:</span>
                                    <span style="color: #1f2937;">${new Date(email.receivedDateTime).toLocaleString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                                
                                <!-- Sujet -->
                                <div style="display: flex; align-items: flex-start; gap: 12px;">
                                    <span style="font-weight: 700; color: #374151; min-width: 80px;">Sujet:</span>
                                    <span style="color: #1f2937; font-weight: 600; flex: 1; word-break: break-word;">${this.escapeHtml(email.subject || 'Sans sujet')}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Analyse et catégorisation -->
                        ${detectionInfo ? `
                            <div style="margin-bottom: 24px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 20px;">
                                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0c4a6e; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-brain"></i> Analyse IA
                                </h3>
                                
                                <div style="display: grid; gap: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="font-weight: 600;">Score de catégorisation:</span>
                                        <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 700;">
                                            ${email.categoryScore || 0} points
                                        </span>
                                    </div>
                                    
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="font-weight: 600;">Confiance:</span>
                                        <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 700;">
                                            ${Math.round((email.categoryConfidence || 0) * 100)}%
                                        </span>
                                    </div>
                                    
                                    ${email.detectionMethod ? `
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <span style="font-weight: 600;">Méthode de détection:</span>
                                            <span style="background: #8b5cf6; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 12px;">
                                                ${this.escapeHtml(email.detectionMethod)}
                                            </span>
                                        </div>
                                    ` : ''}
                                    
                                    ${email.hasAbsolute ? `
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <span style="font-weight: 600;">Correspondance absolue:</span>
                                            <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 700;">
                                                ✅ OUI
                                            </span>
                                        </div>
                                    ` : ''}
                                    
                                    ${email.matchedPatterns && email.matchedPatterns.length > 0 ? `
                                        <div>
                                            <span style="font-weight: 600; display: block; margin-bottom: 8px;">Patterns détectés (${email.matchedPatterns.length}):</span>
                                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                                ${email.matchedPatterns.slice(0, 10).map(pattern => `
                                                    <span style="background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-family: monospace;">
                                                        ${this.escapeHtml(pattern.keyword || pattern)}
                                                    </span>
                                                `).join('')}
                                                ${email.matchedPatterns.length > 10 ? `<span style="color: #6b7280; font-size: 12px;">... et ${email.matchedPatterns.length - 10} autres</span>` : ''}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- Contenu de l'email -->
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; max-height: 400px; overflow-y: auto;">
                            <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                                <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #374151; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-envelope-open"></i> Contenu de l'email
                                </h3>
                            </div>
                            <div style="padding: 20px; line-height: 1.6; color: #374151; word-break: break-word;">
                                ${this.getEmailContentForModal(email)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                        <div style="display: flex; gap: 12px;">
                            <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                    style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                Fermer
                            </button>
                            
                            <button onclick="window.pageManager.toggleEmailSelection('${emailId}'); document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                    style="padding: 12px 20px; background: ${this.selectedEmails.has(emailId) ? '#ef4444' : '#10b981'}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-${this.selectedEmails.has(emailId) ? 'minus' : 'plus'}"></i> 
                                ${this.selectedEmails.has(emailId) ? 'Désélectionner' : 'Sélectionner'}
                            </button>
                        </div>
                        
                        <div style="display: flex; gap: 12px;">
                            ${!this.createdTasks.has(emailId) ? `
                                <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.showTaskCreationModal('${emailId}');"
                                        style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    <i class="fas fa-tasks"></i> Créer une tâche
                                </button>
                            ` : `
                                <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.openCreatedTask('${emailId}');"
                                        style="padding: 12px 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    <i class="fas fa-check-circle"></i> Voir la tâche
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    getCategoryInfo(categoryId) {
        if (!categoryId) return null;
        
        const category = this.getCategory(categoryId);
        if (!category) return null;
        
        return {
            name: category.name,
            icon: category.icon,
            color: category.color
        };
    }

    getDetectionInfo(email) {
        if (!email.categoryScore && !email.detectionMethod) return null;
        
        return {
            score: email.categoryScore || 0,
            confidence: email.categoryConfidence || 0,
            method: email.detectionMethod || 'unknown',
            hasAbsolute: email.hasAbsolute || false,
            patterns: email.matchedPatterns || []
        };
    }

    getEmailContentForModal(email) {
        // Priorité: body complet, puis preview
        let content = '';
        
        if (email.body?.content) {
            content = email.body.content;
            
            // Si c'est du HTML, le nettoyer mais préserver la structure
            if (content.includes('<')) {
                content = this.cleanHtmlForDisplay(content);
            }
        } else if (email.bodyPreview) {
            content = `<p><em>Aperçu:</em></p><p>${this.escapeHtml(email.bodyPreview)}</p>`;
        } else {
            content = '<p><em>Aucun contenu disponible</em></p>';
        }
        
        return content;
    }

    cleanHtmlForDisplay(html) {
        if (!html) return '';
        
        // Préserver certaines balises importantes
        let cleaned = html;
        
        // Supprimer les éléments dangereux
        cleaned = cleaned
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<style[^>]*>.*?<\/style>/gis, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
            .replace(/on\w+="[^"]*"/gi, '') // Supprimer les event handlers
            .replace(/javascript:/gi, ''); // Supprimer javascript:
        
        // Convertir certaines balises en équivalents sécurisés
        cleaned = cleaned
            .replace(/<h[1-6][^>]*>/gi, '<h3 style="font-weight: bold; margin: 16px 0 8px 0;">')
            .replace(/<\/h[1-6]>/gi, '</h3>')
            .replace(/<strong[^>]*>/gi, '<span style="font-weight: bold;">')
            .replace(/<\/strong>/gi, '</span>')
            .replace(/<b[^>]*>/gi, '<span style="font-weight: bold;">')
            .replace(/<\/b>/gi, '</span>')
            .replace(/<em[^>]*>/gi, '<span style="font-style: italic;">')
            .replace(/<\/em>/gi, '</span>')
            .replace(/<i[^>]*>/gi, '<span style="font-style: italic;">')
            .replace(/<\/i>/gi, '</span>')
            .replace(/<br[^>]*>/gi, '<br>')
            .replace(/<hr[^>]*>/gi, '<hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;">')
            .replace(/<a\s+href="([^"]+)"[^>]*>/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">')
            .replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, '<img src="$1" style="max-width: 100%; height: auto; margin: 8px 0;" alt="Image">');
        
        return cleaned;
    }

    // ================================================
    // GROUPES ET VUES
    // ================================================
    
    renderGroupedView(emails, groupMode) {
        const groups = this.createEmailGroups(emails, groupMode);
        
        return `
            <div class="tasks-grouped-harmonized">
                ${groups.map(group => this.renderEmailGroup(group, groupMode)).join('')}
            </div>
        `;
    }

    renderEmailGroup(group, groupType) {
        const displayName = groupType === 'grouped-domain' ? `@${group.name}` : group.name;
        const avatarColor = this.generateAvatarColor(group.name);
        
        return `
            <div class="task-group-harmonized" data-group-key="${group.key}">
                <div class="group-header-harmonized" onclick="event.preventDefault(); event.stopPropagation(); window.pageManager.toggleGroup('${group.key}', event)">
                    <div class="group-avatar-harmonized" style="background: ${avatarColor}">
                        ${groupType === 'grouped-domain' ? 
                            '<i class="fas fa-globe"></i>' : 
                            group.name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="group-info-harmonized">
                        <div class="group-name-harmonized">${displayName}</div>
                        <div class="group-meta-harmonized">${group.count} email${group.count > 1 ? 's' : ''} • ${this.formatEmailDate(group.latestDate)}</div>
                    </div>
                    <div class="group-expand-harmonized" onclick="event.preventDefault(); event.stopPropagation();">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="group-content-harmonized" style="display: none;">
                    ${group.emails.map(email => this.renderEmailRowEnhanced(email)).join('')}
                </div>
            </div>
        `;
    }

    createEmailGroups(emails, groupMode) {
        const groups = {};
        
        emails.forEach(email => {
            let groupKey, groupName;
            
            if (groupMode === 'grouped-domain') {
                const domain = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                groupKey = domain;
                groupName = domain;
            } else {
                const senderEmail = email.from?.emailAddress?.address || 'unknown';
                const senderName = email.from?.emailAddress?.name || senderEmail;
                groupKey = senderEmail;
                groupName = senderName;
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    key: groupKey,
                    name: groupName,
                    emails: [],
                    count: 0,
                    latestDate: null
                };
            }
            
            groups[groupKey].emails.push(email);
            groups[groupKey].count++;
            
            const emailDate = new Date(email.receivedDateTime);
            if (!groups[groupKey].latestDate || emailDate > groups[groupKey].latestDate) {
                groups[groupKey].latestDate = emailDate;
            }
        });
        
        return Object.values(groups).sort((a, b) => {
            if (!a.latestDate && !b.latestDate) return 0;
            if (!a.latestDate) return 1;
            if (!b.latestDate) return -1;
            return b.latestDate - a.latestDate;
        });
    }

    toggleGroup(groupKey, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content-harmonized');
        const icon = group.querySelector('.group-expand-harmonized i');
        const header = group.querySelector('.group-header-harmonized');
        
        if (!content || !icon || !header) return;
        
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
            header.classList.remove('expanded-header');
        } else {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
            header.classList.add('expanded-header');
        }
    }

    generateAvatarColor(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = Math.abs(hash) % 360;
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 45 + (Math.abs(hash) % 15);
        
        return `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness + 10}%))`;
    }

    // ================================================
    // ACTIONS BULK ET CRÉATION DE TÂCHES
    // ================================================
    
    async createTasksFromSelection() {
        if (this.selectedEmails.size === 0) {
            window.uiManager?.showToast('Aucun email sélectionné', 'warning');
            return;
        }
        
        let created = 0;
        window.uiManager?.showLoading(`Création de ${this.selectedEmails.size} tâches...`);
        
        for (const emailId of this.selectedEmails) {
            const email = this.getEmailById(emailId);
            if (!email || this.createdTasks.has(emailId)) continue;
            
            try {
                if (window.taskManager) {
                    const taskData = this.buildTaskFromEmail(email);
                    const task = window.taskManager.createTaskFromEmail(taskData, email);
                    this.createdTasks.set(emailId, task.id);
                    created++;
                }
            } catch (error) {
                console.error('[PageManager] Erreur création tâche:', emailId, error);
            }
        }
        
        window.uiManager?.hideLoading();
        
        if (created > 0) {
            window.taskManager?.saveTasks();
            window.uiManager?.showToast(`${created} tâche${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''} (${this.currentProvider})`, 'success');
            this.clearSelection();
            this.refreshEmailsView();
        } else {
            window.uiManager?.showToast('Aucune tâche créée', 'warning');
        }
    }

    buildTaskFromEmail(email) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || 'unknown';
        
        return {
            id: this.generateTaskId(),
            title: `Email de ${senderName}: ${email.subject || 'Sans sujet'}`,
            description: this.buildTaskDescription(email),
            priority: this.determinePriority(email),
            dueDate: null,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            emailFrom: senderEmail,
            emailFromName: senderName,
            emailSubject: email.subject,
            emailDomain: senderDomain,
            emailDate: email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            tags: [senderDomain, email.category].filter(Boolean),
            method: 'enhanced',
            provider: this.currentProvider || 'unknown',
            
            // Informations d'analyse enrichies
            categoryScore: email.categoryScore || 0,
            categoryConfidence: email.categoryConfidence || 0,
            detectionMethod: email.detectionMethod || 'standard',
            priorityCorrection: email.priorityCorrection || false
        };
    }

    buildTaskDescription(email) {
        let description = email.bodyPreview || 'Aucune description disponible';
        
        // Ajouter des infos contextuelles
        const contextInfo = [];
        
        if (email.category && email.category !== 'other') {
            const categoryName = this.getCategoryName(email.category);
            contextInfo.push(`Catégorie: ${categoryName}`);
        }
        
        if (email.hasAttachments) {
            contextInfo.push('Contient des pièces jointes');
        }
        
        if (email.importance === 'high') {
            contextInfo.push('Marqué comme important');
        }
        
        if (email.categoryScore > 80) {
            contextInfo.push(`Score de catégorisation: ${email.categoryScore}pts`);
        }
        
        if (email.priorityCorrection) {
            contextInfo.push('Email recatégorisé automatiquement');
        }
        
        if (contextInfo.length > 0) {
            description += '\n\n--- Informations automatiques ---\n' + contextInfo.join('\n');
        }
        
        return description;
    }

    determinePriority(email) {
        // Priorité basée sur l'importance et la catégorie
        if (email.importance === 'high') return 'urgent';
        if (email.category === 'security') return 'high';
        if (email.category === 'finance') return 'high';
        if (email.category === 'tasks') return 'high';
        if (email.categoryScore > 120) return 'high';
        if (email.category === 'meetings') return 'medium';
        if (email.category === 'marketing_news') return 'low';
        if (email.category === 'notifications') return 'low';
        
        return 'medium';
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async showTaskCreationModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            window.uiManager?.showToast('Email non trouvé', 'error');
            return;
        }

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'task_creation_modal_' + Date.now();
        const providerInfo = this.getProviderInfo();
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const suggestedPriority = this.determinePriority(email);
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; max-width: 600px; width: 100%; 
                            max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">Créer une tâche</h2>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; color: ${providerInfo.color};">
                                <i class="${providerInfo.icon}"></i>
                                <span style="font-size: 14px; font-weight: 600;">${providerInfo.name}</span>
                                ${email.category ? `<span style="background: ${this.getCategoryColor(email.category)}20; color: ${this.getCategoryColor(email.category)}; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}</span>` : ''}
                            </div>
                        </div>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Titre de la tâche</label>
                            <input type="text" id="task-title" 
                                   style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                   value="Email de ${senderName}: ${email.subject || 'Sans sujet'}">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Description</label>
                            <textarea id="task-description" 
                                      style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 120px;"
                                      rows="5">${this.buildTaskDescription(email)}</textarea>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Priorité (suggérée: ${suggestedPriority})</label>
                            <select id="task-priority" 
                                    style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                                <option value="urgent" ${suggestedPriority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                                <option value="high" ${suggestedPriority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${suggestedPriority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${suggestedPriority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Échéance (optionnelle)</label>
                            <input type="date" id="task-due-date" 
                                   style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                        </div>
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 12px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Annuler
                        </button>
                        <button onclick="window.pageManager.createTaskFromModal('${email.id}'); document.getElementById('${uniqueId}').remove();"
                                style="padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-check"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    async createTaskFromModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) {
            window.uiManager?.showToast('Email non trouvé', 'error');
            return;
        }

        const title = document.getElementById('task-title')?.value;
        const description = document.getElementById('task-description')?.value;
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-due-date')?.value;

        if (!title) {
            window.uiManager?.showToast('Le titre est requis', 'warning');
            return;
        }

        try {
            const taskData = {
                ...this.buildTaskFromEmail(email),
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null
            };

            const task = window.taskManager?.createTaskFromEmail(taskData, email);
            if (task) {
                this.createdTasks.set(emailId, task.id);
                window.taskManager?.saveTasks();
                window.uiManager?.showToast(`Tâche créée avec succès (${this.currentProvider})`, 'success');
                this.refreshEmailsView();
            } else {
                throw new Error('Erreur lors de la création de la tâche');
            }
            
        } catch (error) {
            console.error('Error creating task:', error);
            window.uiManager?.showToast('Erreur lors de la création', 'error');
        }
    }

    openCreatedTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId) return;
        
        this.loadPage('tasks').then(() => {
            setTimeout(() => {
                if (window.tasksView?.showTaskDetails) {
                    window.tasksView.showTaskDetails(taskId);
                }
            }, 100);
        });
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
    calculateCategoryCounts(emails) {
        const counts = {};
        let uncategorizedCount = 0;
        
        emails.forEach(email => {
            const cat = email.category;
            
            if (cat && cat !== 'other' && cat !== null && cat !== undefined && cat !== '') {
                counts[cat] = (counts[cat] || 0) + 1;
            } else {
                uncategorizedCount++;
            }
        });
        
        if (uncategorizedCount > 0) {
            counts.other = uncategorizedCount;
        }
        
        return counts;
    }

    buildPriorityCompactCategoryTabs(categoryCounts, totalEmails, categories) {
        const preselectedCategories = this.getTaskPreselectedCategories();
        
        // ORDRE PRIORITAIRE: Newsletter/Spam d'abord
        const priorityOrder = [
            'all',
            'marketing_news', // NEWSLETTER EN PREMIER
            'spam',           // SPAM EN SECOND
            'security',
            'finance', 
            'tasks',
            'meetings',
            'commercial',
            'support',
            'hr',
            'notifications',
            'reminders',
            'project',
            'internal',
            'cc',
            'other'
        ];
        
        const tabs = [];
        
        tabs.push({
            id: 'all',
            name: 'Tous',
            icon: '📧',
            count: totalEmails,
            isPreselected: false,
            priority: 1000
        });
        
        priorityOrder.slice(1).forEach(catId => {
            const count = categoryCounts[catId] || 0;
            const category = categories[catId];
            
            if (count > 0 && category) {
                const isPreselected = preselectedCategories.includes(catId);
                const priority = this.categoryPriority[catId] || 0;
                
                let icon = category.icon;
                let specialClass = '';
                
                if (catId === 'marketing_news') {
                    icon = '📰';
                    specialClass = 'newsletter-priority';
                } else if (catId === 'spam') {
                    icon = '🚫';
                    specialClass = 'spam-priority';
                }
                
                tabs.push({
                    id: catId,
                    name: category.name,
                    icon: icon,
                    color: category.color,
                    count: count,
                    isPreselected: isPreselected,
                    priority: priority,
                    specialClass: specialClass
                });
            }
        });
        
        tabs.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        return tabs.map(tab => {
            const isCurrentCategory = this.currentCategory === tab.id;
            const baseClasses = `status-pill-compact ${isCurrentCategory ? 'active' : ''} ${tab.isPreselected ? 'preselected-category' : ''} ${tab.specialClass || ''}`;
            
            return `
                <button class="${baseClasses}" 
                        onclick="window.pageManager.filterByCategory('${tab.id}')"
                        data-category-id="${tab.id}"
                        title="${tab.isPreselected ? '⭐ Catégorie pré-sélectionnée pour les tâches' : ''}">
                    <div class="pill-content-twolines">
                        <div class="pill-first-line-twolines">
                            <span class="pill-icon-twolines">${tab.icon}</span>
                            <span class="pill-count-twolines">${tab.count}</span>
                        </div>
                        <div class="pill-second-line-twolines">
                            <span class="pill-text-twolines">${tab.name}</span>
                        </div>
                    </div>
                    ${tab.isPreselected ? '<span class="preselected-star">⭐</span>' : ''}
                </button>
            `;
        }).join('');
    }

    getTaskPreselectedCategories() {
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            return window.categoryManager.getTaskPreselectedCategories();
        }
        
        try {
            const settings = JSON.parse(localStorage.getItem('categorySettings') || '{}');
            return settings.taskPreselectedCategories || [];
        } catch (error) {
            console.error('[PageManager] Erreur récupération catégories pré-sélectionnées:', error);
            return [];
        }
    }

    getCategoryColor(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.color || '#64748b';
    }

    getCategoryIcon(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.icon || '📌';
    }

    getCategoryName(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        return category?.name || categoryId || 'Autre';
    }

    getCategory(categoryId) {
        return window.categoryManager?.getCategory(categoryId);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatEmailDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Hier';
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    getEmailPriorityColor(email) {
        if (email.importance === 'high') return '#ef4444';
        if (email.hasAttachments) return '#f97316';
        if (email.categoryScore >= 80) return '#10b981';
        if (email.category === 'marketing_news') return '#f97316';
        if (email.category === 'spam') return '#ef4444';
        return '#3b82f6';
    }

    // ================================================
    // FILTRES ET RECHERCHE
    // ================================================
    
    filterByCategory(categoryId) {
        console.log(`[PageManager] 🔍 Filtrage par catégorie: ${categoryId}`);
        
        this.currentCategory = categoryId;
        this.refreshEmailsView();
        
        ['', 'Sticky'].forEach(suffix => {
            const containerSelector = suffix ? '.sticky-controls-container' : '.controls-and-filters-container';
            const container = document.querySelector(containerSelector);
            if (container) {
                container.querySelectorAll('.status-pill-compact').forEach(pill => {
                    const pillCategoryId = pill.dataset.categoryId;
                    if (pillCategoryId === categoryId) {
                        pill.classList.add('active');
                    } else {
                        pill.classList.remove('active');
                    }
                });
            }
        });
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshEmailsView();
    }

    handleSearch(term) {
        this.searchTerm = term.trim();
        this.refreshEmailsView();
        
        const stickySearchInput = document.getElementById('emailSearchInputSticky');
        if (stickySearchInput && stickySearchInput.value !== term) {
            stickySearchInput.value = term;
        }
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        
        const stickySearchInput = document.getElementById('emailSearchInputSticky');
        if (stickySearchInput) stickySearchInput.value = '';
        
        this.refreshEmailsView();
    }

    // ================================================
    // CONTRÔLES ET ÉVÉNEMENTS
    // ================================================
    
    setupEmailsEventListeners() {
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    }

    setupStickyControls() {
        const originalContainer = document.querySelector('.controls-and-filters-container');
        const stickyContainer = document.querySelector('.sticky-controls-container');
        
        if (!originalContainer || !stickyContainer) return;

        stickyContainer.innerHTML = originalContainer.innerHTML;
        this.setupEventListenersForStickyClone(stickyContainer);
    }

    setupEventListenersForStickyClone(stickyContainer) {
        const searchInput = stickyContainer.querySelector('#emailSearchInput');
        if (searchInput) {
            searchInput.id = 'emailSearchInputSticky';
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        stickyContainer.querySelectorAll('button[onclick]').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('window.pageManager')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    eval(onclickAttr);
                });
            }
        });
    }

    updateControlsBarOnly() {
        const selectedCount = this.selectedEmails.size;
        const visibleEmails = this.getVisibleEmails();
        const allSelected = visibleEmails.length > 0 && visibleEmails.every(email => this.selectedEmails.has(email.id));
        
        const updateContainer = (container) => {
            if (!container) return;
            
            const selectAllBtn = container.querySelector('.btn-selection-toggle');
            if (selectAllBtn) {
                const btnText = selectAllBtn.querySelector('.btn-text');
                const btnCount = selectAllBtn.querySelector('.btn-count');
                const icon = selectAllBtn.querySelector('i');
                
                if (allSelected) {
                    if (btnText) btnText.textContent = 'Désélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-check-square');
                        icon.classList.add('fa-square');
                    }
                    selectAllBtn.classList.add('all-selected');
                } else {
                    if (btnText) btnText.textContent = 'Sélectionner tous';
                    if (icon) {
                        icon.classList.remove('fa-square');
                        icon.classList.add('fa-check-square');
                    }
                    selectAllBtn.classList.remove('all-selected');
                }
                
                if (btnCount) {
                    btnCount.textContent = `(${visibleEmails.length})`;
                }
            }
            
            const createTaskBtn = container.querySelector('.btn-primary[onclick*="createTasksFromSelection"]');
            if (createTaskBtn) {
                const span = createTaskBtn.querySelector('.btn-text');
                const countBadge = createTaskBtn.querySelector('.count-badge');
                
                if (selectedCount === 0) {
                    createTaskBtn.classList.add('disabled');
                    createTaskBtn.disabled = true;
                } else {
                    createTaskBtn.classList.remove('disabled');
                    createTaskBtn.disabled = false;
                }
                
                if (span) {
                    span.textContent = `Créer tâche${selectedCount > 1 ? 's' : ''}`;
                }
                
                if (countBadge) {
                    if (selectedCount > 0) {
                        countBadge.textContent = selectedCount;
                        countBadge.style.display = 'inline';
                    } else {
                        countBadge.style.display = 'none';
                    }
                } else if (selectedCount > 0) {
                    const newBadge = document.createElement('span');
                    newBadge.className = 'count-badge';
                    newBadge.textContent = selectedCount;
                    createTaskBtn.appendChild(newBadge);
                }
            }
            
            const existingClearBtn = container.querySelector('.btn-clear');
            const actionButtonsContainer = container.querySelector('.action-buttons');
            
            if (selectedCount > 0) {
                if (!existingClearBtn && actionButtonsContainer) {
                    const clearBtn = document.createElement('button');
                    clearBtn.className = 'btn-action btn-clear';
                    clearBtn.onclick = () => window.pageManager.clearSelection();
                    clearBtn.title = 'Effacer la sélection';
                    clearBtn.innerHTML = `
                        <i class="fas fa-times"></i>
                        <span class="btn-text">Effacer (${selectedCount})</span>
                    `;
                    actionButtonsContainer.appendChild(clearBtn);
                } else if (existingClearBtn) {
                    const span = existingClearBtn.querySelector('.btn-text');
                    if (span) {
                        span.textContent = `Effacer (${selectedCount})`;
                    }
                }
            } else {
                if (existingClearBtn) {
                    existingClearBtn.remove();
                }
            }
        };
        
        updateContainer(document.querySelector('.controls-and-filters-container'));
        updateContainer(document.querySelector('.sticky-controls-container'));
    }

    refreshEmailsView() {
        console.log('[PageManager] Rafraîchissement vue emails...');
        
        const emailsContainer = document.querySelector('.tasks-container-harmonized');
        if (emailsContainer) {
            emailsContainer.innerHTML = this.renderEmailsList();
        }
        
        this.updateControlsBarOnly();
    }

    handleScrollForSticky() {
        if (this.currentPage !== 'emails') return;

        const stickyContainer = document.querySelector('.sticky-controls-container');
        const originalContainer = document.querySelector('.controls-and-filters-container');
        
        if (!stickyContainer || !originalContainer) return;

        const scrollY = window.scrollY;
        const containerTop = originalContainer.offsetTop;
        
        if (scrollY > containerTop - 20) {
            stickyContainer.classList.add('sticky-active');
            const content = document.querySelector('.tasks-container-harmonized');
            if (content) {
                content.style.paddingTop = stickyContainer.offsetHeight + 'px';
            }
        } else {
            stickyContainer.classList.remove('sticky-active');
            const content = document.querySelector('.tasks-container-harmonized');
            if (content) {
                content.style.paddingTop = '0';
            }
        }
    }

    // ================================================
    // ÉTATS VIDES
    // ================================================
    
    renderEmptyState() {
        const providerInfo = this.getProviderInfo();
        
        let title, text, action = '';
        
        if (this.searchTerm) {
            title = 'Aucun résultat trouvé';
            text = `Aucun email ne correspond à votre recherche "${this.searchTerm}"`;
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.currentCategory === 'other') {
            title = 'Aucun email non catégorisé';
            text = 'Tous vos emails ont été correctement catégorisés ! 🎉';
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else if (this.currentCategory && this.currentCategory !== 'all') {
            const categoryName = this.getCategoryName(this.currentCategory);
            title = `Aucun email dans "${categoryName}"`;
            text = 'Cette catégorie ne contient aucun email pour le moment.';
            action = `
                <button class="btn btn-primary" onclick="window.pageManager.filterByCategory('all')">
                    <i class="fas fa-list"></i>
                    <span>Voir tous les emails</span>
                </button>
            `;
        } else {
            title = 'Aucun email trouvé';
            text = providerInfo.status === 'connected' ? 
                `Connecté à ${providerInfo.name}. Utilisez le scanner pour récupérer et analyser vos emails.` :
                'Connectez-vous à Gmail ou Outlook pour commencer l\'analyse.';
            
            if (providerInfo.status === 'connected') {
                action = `
                    <button class="btn btn-primary" onclick="window.pageManager.refreshEmails()">
                        <i class="fas fa-sync-alt"></i>
                        <span>Actualiser les emails</span>
                    </button>
                    <button class="btn btn-secondary" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i>
                        <span>Aller au scanner</span>
                    </button>
                `;
            } else {
                action = `
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="window.googleAuthService?.login()" style="background: #ea4335;">
                            <i class="fab fa-google"></i>
                            <span>Se connecter à Gmail</span>
                        </button>
                        <button class="btn btn-secondary" onclick="window.authService?.login()" style="background: #0078d4; color: white;">
                            <i class="fab fa-microsoft"></i>
                            <span>Se connecter à Outlook</span>
                        </button>
                    </div>
                `;
            }
        }
        
        return `
            <div class="empty-state-harmonized">
                <div class="empty-state-icon-harmonized">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title-harmonized">${title}</h3>
                <p class="empty-state-text-harmonized">${text}</p>
                ${action}
            </div>
        `;
    }

    renderEmptyEmailsState() {
        const providerInfo = this.getProviderInfo();
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title">Aucun email trouvé</h3>
                <p class="empty-state-text">
                    ${providerInfo.status === 'connected' ? 
                        `Connecté à ${providerInfo.name}. Utilisez le scanner pour récupérer et analyser vos emails.` :
                        'Connectez-vous à Gmail ou Outlook pour commencer l\'analyse.'
                    }
                </p>
                <div class="empty-state-actions">
                    ${providerInfo.status === 'connected' ? `
                        <button class="btn btn-primary" onclick="window.pageManager.refreshEmails()">
                            <i class="fas fa-sync-alt"></i>
                            Actualiser
                        </button>
                        <button class="btn btn-secondary" onclick="window.pageManager.loadPage('scanner')">
                            <i class="fas fa-search"></i>
                            Aller au scanner
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="window.googleAuthService?.login()" style="background: #ea4335;">
                            <i class="fab fa-google"></i>
                            Se connecter à Gmail
                        </button>
                        <button class="btn btn-secondary" onclick="window.authService?.login()" style="background: #0078d4; color: white;">
                            <i class="fab fa-microsoft"></i>
                            Se connecter à Outlook
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideEmailExplanation', 'true');
        this.refreshEmailsView();
    }

    // ================================================
    // STYLES CSS ULTRA-COMPLETS
    // ================================================
    
    addEmailStyles() {
        if (document.getElementById('emailPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'emailPageStyles';
        styles.textContent = `
            /* Variables CSS de base */
            :root {
                --btn-height: 44px;
                --btn-padding-horizontal: 16px;
                --btn-font-size: 13px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-gap: 8px;
                --card-height: 88px; /* Augmenté pour plus de contenu */
                --card-padding: 16px; /* Augmenté */
                --card-border-radius: 12px;
                --action-btn-size: 36px;
                --gap-small: 8px;
                --gap-medium: 12px;
                --gap-large: 16px;
                --transition-speed: 0.2s;
                --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
                --preselect-color: #8b5cf6;
                --newsletter-color: #f97316;
                --spam-color: #ef4444;
                --sticky-height: 200px; /* Augmenté */
            }
            
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: var(--gap-large);
                font-size: var(--btn-font-size);
            }

            /* Cache et provider status */
            .cache-status-info {
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                backdrop-filter: blur(20px);
                box-shadow: var(--shadow-base);
            }

            .cache-indicators {
                display: flex;
                gap: var(--gap-medium);
                align-items: center;
                flex-wrap: wrap;
            }

            .cache-indicator,
            .provider-indicator,
            .scan-indicator {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid;
                transition: all 0.3s ease;
            }

            .cache-indicator.active {
                background: rgba(16, 185, 129, 0.1);
                border-color: #10b981;
                color: #065f46;
            }

            .cache-indicator:not(.active) {
                background: rgba(107, 114, 128, 0.1);
                border-color: #9ca3af;
                color: #6b7280;
            }

            .provider-indicator.connected {
                background: rgba(16, 185, 129, 0.1);
                border-color: #10b981;
                color: #065f46;
            }

            .provider-indicator.disconnected {
                background: rgba(239, 68, 68, 0.1);
                border-color: #ef4444;
                color: #991b1b;
            }

            .scan-indicator.scanning {
                background: rgba(59, 130, 246, 0.1);
                border-color: #3b82f6;
                color: #1e40af;
            }

            .scan-indicator:not(.scanning) {
                background: rgba(34, 197, 94, 0.1);
                border-color: #22c55e;
                color: #15803d;
            }

            .opt-badge {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 700;
                margin-left: 4px;
            }

            /* Explanation styles */
            .explanation-text-harmonized {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                backdrop-filter: blur(10px);
                position: relative;
            }

            .explanation-text-harmonized.provider-connected {
                background: rgba(16, 185, 129, 0.1);
                border-color: rgba(16, 185, 129, 0.3);
            }

            .explanation-text-harmonized.provider-disconnected {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.3);
            }

            .explanation-content {
                display: flex;
                flex-direction: column;
                gap: var(--gap-small);
            }

            .explanation-main {
                display: flex;
                align-items: center;
                gap: var(--gap-medium);
                color: #1e40af;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.5;
            }

            .explanation-stats {
                display: flex;
                flex-wrap: wrap;
                gap: var(--gap-medium);
                margin-top: var(--gap-small);
            }

            .stat-item {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .stat-item.newsletter {
                background: rgba(249, 115, 22, 0.1);
                color: var(--newsletter-color);
                border: 1px solid rgba(249, 115, 22, 0.3);
            }

            .stat-item.spam {
                background: rgba(239, 68, 68, 0.1);
                color: var(--spam-color);
                border: 1px solid rgba(239, 68, 68, 0.3);
            }

            .stat-item.preselected {
                background: rgba(139, 92, 246, 0.1);
                color: var(--preselect-color);
                border: 1px solid rgba(139, 92, 246, 0.3);
            }

            .stat-item.provider {
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(0, 0, 0, 0.1);
                font-weight: 700;
            }
            
            .explanation-close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                color: #3b82f6;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: all 0.2s ease;
            }
            
            .explanation-close-btn:hover {
                background: rgba(59, 130, 246, 0.2);
                transform: scale(1.1);
            }

            /* Contrôles */
            .controls-and-filters-container {
                position: relative;
                z-index: 100;
                background: transparent;
                margin-bottom: var(--gap-medium);
            }
            
            .sticky-controls-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                padding: var(--gap-large);
                transform: translateY(-100%);
                transition: transform 0.3s ease;
                opacity: 0;
                visibility: hidden;
            }
            
            .sticky-controls-container.sticky-active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }

            .controls-bar-single-line {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                display: flex;
                align-items: center;
                gap: var(--gap-large);
                position: relative;
                z-index: 1000;
                min-height: var(--btn-height);
                flex-wrap: wrap;
            }

            /* Contrôles de scan */
            .scan-controls {
                display: flex;
                gap: var(--gap-small);
                flex-shrink: 0;
            }

            .btn-scan,
            .btn-force-scan {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
            }

            .btn-scan:hover,
            .btn-force-scan:hover {
                background: linear-gradient(135deg, #059669, #047857);
                box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
            }

            .btn-scan:disabled,
            .btn-force-scan:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                pointer-events: none;
            }
            
            /* Section de recherche */
            .search-section {
                flex: 1;
                max-width: 400px;
                min-width: 250px;
            }
            
            .search-box {
                position: relative;
                width: 100%;
                height: var(--btn-height);
                display: flex;
                align-items: center;
            }
            
            .search-input {
                width: 100%;
                height: 100%;
                padding: 0 var(--gap-medium) 0 40px;
                border: 2px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                background: #f9fafb;
                transition: all var(--transition-speed) ease;
                outline: none;
                font-weight: 500;
                color: #374151;
            }
            
            .search-input:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-input::placeholder {
                color: #9ca3af;
                font-weight: 400;
            }
            
            .search-icon {
                position: absolute;
                left: var(--gap-medium);
                color: #6b7280;
                pointer-events: none;
                font-size: 14px;
                z-index: 1;
            }
            
            .search-input:focus + .search-icon {
                color: #3b82f6;
            }
            
            .search-clear {
                position: absolute;
                right: var(--gap-small);
                background: #ef4444;
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                transition: all var(--transition-speed) ease;
            }
            
            .search-clear:hover {
                background: #dc2626;
                transform: scale(1.1);
            }

            /* Modes de vue */
            .view-modes {
                display: flex;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: 3px;
                gap: 2px;
                height: var(--btn-height);
                flex-shrink: 0;
            }
            
            .view-mode {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 0 12px;
                height: calc(var(--btn-height) - 6px);
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                min-width: 80px;
                white-space: nowrap;
            }
            
            .view-mode:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
            }
            
            .view-mode.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
                font-weight: 700;
            }

            /* Actions */
            .action-buttons {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
                position: relative;
                z-index: 1001;
                flex-wrap: wrap;
            }
            
            .btn-action {
                height: var(--btn-height);
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                padding: 0 var(--gap-medium);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: var(--shadow-base);
                position: relative;
                white-space: nowrap;
                flex-shrink: 0;
            }
            
            .btn-action:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-action.disabled {
                opacity: 0.5;
                cursor: not-allowed !important;
                pointer-events: none;
            }
            
            .btn-action.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                font-weight: 700;
            }
            
            .btn-action.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }
            
            .btn-action.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-action.btn-secondary:hover {
                background: #f1f5f9;
                color: #334155;
                border-color: #cbd5e1;
            }
            
            .btn-action.btn-selection-toggle {
                background: #f0f9ff;
                color: #0369a1;
                border-color: #0ea5e9;
                min-width: 140px;
            }
            
            .btn-action.btn-selection-toggle:hover {
                background: #e0f2fe;
                color: #0c4a6e;
                border-color: #0284c7;
            }
            
            .btn-action.btn-selection-toggle.all-selected {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-action.btn-selection-toggle.all-selected:hover {
                background: #fee2e2;
                color: #b91c1c;
                border-color: #fca5a5;
            }
            
            .btn-action.btn-clear {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .btn-action.btn-clear:hover {
                background: #fee2e2;
                color: #b91c1c;
                border-color: #fca5a5;
            }
            
            .btn-text {
                font-weight: inherit;
            }
            
            .btn-count {
                font-size: 11px;
                opacity: 0.8;
                margin-left: 2px;
            }
            
            .count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 8px;
                min-width: 16px;
                text-align: center;
                border: 2px solid white;
                animation: badgePulse 2s ease-in-out infinite;
            }

            @keyframes badgePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            /* Filtres de catégories ULTRA-RENFORCÉS */
            .status-filters-compact {
                display: flex;
                gap: var(--gap-small);
                margin-bottom: var(--gap-medium);
                flex-wrap: wrap;
                width: 100%;
                position: relative;
                z-index: 10;
                align-items: flex-start;
            }
            
            .status-pill-compact {
                height: 60px;
                padding: var(--gap-small);
                font-size: 12px;
                font-weight: 700;
                flex: 0 1 calc(16.666% - var(--gap-small));
                min-width: 120px;
                max-width: 180px;
                border-radius: var(--btn-border-radius);
                box-shadow: var(--shadow-base);
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                cursor: pointer;
                position: relative;
                overflow: visible;
                z-index: 11;
            }

            /* Styles spéciaux Newsletter et Spam */
            .status-pill-compact.newsletter-priority {
                border-width: 2px;
                border-color: var(--newsletter-color);
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05));
                animation: newsletterPulse 3s ease-in-out infinite;
            }

            .status-pill-compact.spam-priority {
                border-width: 2px;
                border-color: var(--spam-color);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
                animation: spamPulse 3s ease-in-out infinite;
            }

            @keyframes newsletterPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2); }
                50% { transform: scale(1.02); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
            }

            @keyframes spamPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2); }
                50% { transform: scale(1.02); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
            }
            
            .status-pill-compact.preselected-category {
                animation: pulsePreselected 3s ease-in-out infinite;
                border-width: 2px;
                border-color: var(--preselect-color);
            }
            
            .status-pill-compact.preselected-category::before {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                border-radius: inherit;
                background: linear-gradient(45deg, var(--preselect-color), #a78bfa, var(--preselect-color));
                background-size: 300% 300%;
                animation: gradientShift 4s ease infinite;
                z-index: -1;
                opacity: 0.3;
            }
            
            @keyframes pulsePreselected {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.03); }
            }
            
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            .pill-content-twolines {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                width: 100%;
                height: 100%;
                justify-content: center;
            }
            
            .pill-first-line-twolines {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .pill-icon-twolines {
                font-size: 16px;
            }
            
            .pill-count-twolines {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 800;
                min-width: 18px;
                text-align: center;
            }
            
            .pill-second-line-twolines {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
            }
            
            .pill-text-twolines {
                font-weight: 700;
                font-size: 12px;
                line-height: 1.2;
                text-align: center;
            }
            
            .preselected-star {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 20px;
                height: 20px;
                background: var(--preselect-color);
                color: white;
                border-radius: 50%;
                display: flex !important;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
                animation: starPulse 2s ease-in-out infinite;
                z-index: 15;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            @keyframes starPulse {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
                }
                50% { 
                    transform: scale(1.15);
                    box-shadow: 0 3px 8px rgba(139, 92, 246, 0.6);
                }
            }
            
            .status-pill-compact:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
                z-index: 12;
            }
            
            .status-pill-compact.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                transform: translateY(-2px);
                z-index: 13;
            }
            
            .status-pill-compact.active.preselected-category {
                background: linear-gradient(135deg, var(--preselect-color) 0%, #7c3aed 100%);
                box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
            }

            .status-pill-compact.active.newsletter-priority {
                background: linear-gradient(135deg, var(--newsletter-color) 0%, #ea580c 100%);
                box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
            }

            .status-pill-compact.active.spam-priority {
                background: linear-gradient(135deg, var(--spam-color) 0%, #dc2626 100%);
                box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
            }
            
            .status-pill-compact.active .pill-count-twolines {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }

            /* Container des emails */
            .tasks-container-harmonized {
                background: transparent;
                transition: padding-top 0.3s ease;
            }
            
            .tasks-harmonized-list {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            /* Cartes d'emails ULTRA-RENFORCÉES */
            .task-harmonized-card {
                display: flex;
                align-items: stretch; /* Changé pour étirer */
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: var(--card-height);
                border-bottom: 1px solid #e5e7eb;
                z-index: 1;
            }

            /* Amélioration pour les emails enhanced */
            .email-card-enhanced {
                min-height: calc(var(--card-height) + 20px); /* Plus haut */
            }

            /* Styles spéciaux Newsletter ULTRA-ENHANCED */
            .task-harmonized-card.newsletter-email.ultra-enhanced {
                border-left: 5px solid var(--newsletter-color);
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
                animation: newsletterEmailGlow 4s ease-in-out infinite;
            }

            .task-harmonized-card.newsletter-email.ultra-enhanced:hover {
                border-left: 6px solid var(--newsletter-color);
                box-shadow: 0 10px 30px rgba(249, 115, 22, 0.2);
                background: linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(255, 255, 255, 1) 100%);
            }

            @keyframes newsletterEmailGlow {
                0%, 100% { 
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
                }
                50% { 
                    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.15);
                }
            }

            /* Styles spéciaux Spam ULTRA-ENHANCED */
            .task-harmonized-card.spam-email.ultra-enhanced {
                border-left: 5px solid var(--spam-color);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
                opacity: 0.85;
                animation: spamEmailGlow 4s ease-in-out infinite;
            }

            .task-harmonized-card.spam-email.ultra-enhanced:hover {
                border-left: 6px solid var(--spam-color);
                box-shadow: 0 10px 30px rgba(239, 68, 68, 0.2);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(255, 255, 255, 1) 100%);
                opacity: 1;
            }

            @keyframes spamEmailGlow {
                0%, 100% { 
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
                }
                50% { 
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.15);
                }
            }

            /* Emails corrigés par priorité */
            .task-harmonized-card.priority-corrected {
                border-left: 4px solid #10b981;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
            }
            
            .task-harmonized-card:first-child {
                border-top-left-radius: var(--card-border-radius);
                border-top-right-radius: var(--card-border-radius);
                border-top: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:last-child {
                border-bottom-left-radius: var(--card-border-radius);
                border-bottom-right-radius: var(--card-border-radius);
                border-bottom: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 2;
            }
            
            .task-harmonized-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 3;
            }
            
            .task-harmonized-card.has-task {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid #22c55e;
            }
            
            .task-harmonized-card.preselected-task {
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
                border-left: 3px solid var(--preselect-color);
                border-color: rgba(139, 92, 246, 0.3);
            }
            
            .task-harmonized-card.preselected-task:hover {
                border-left: 4px solid var(--preselect-color);
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
                border-color: rgba(139, 92, 246, 0.4);
            }
            
            .task-harmonized-card.preselected-task.selected {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                border-left: 4px solid var(--preselect-color);
                border-color: var(--preselect-color);
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
            }
            
            .task-checkbox-harmonized {
                margin-right: var(--gap-medium);
                cursor: pointer;
                width: 20px;
                height: 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                transition: all var(--transition-speed) ease;
                flex-shrink: 0;
                appearance: none;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 4px; /* Alignement top */
            }
            
            .task-checkbox-harmonized:checked {
                background: #6366f1;
                border-color: #6366f1;
            }
            
            .task-harmonized-card.preselected-task .task-checkbox-harmonized:checked {
                background: var(--preselect-color);
                border-color: var(--preselect-color);
            }

            .task-harmonized-card.newsletter-email .task-checkbox-harmonized:checked {
                background: var(--newsletter-color);
                border-color: var(--newsletter-color);
            }

            .task-harmonized-card.spam-email .task-checkbox-harmonized:checked {
                background: var(--spam-color);
                border-color: var(--spam-color);
            }
            
            .task-checkbox-harmonized:checked::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: 700;
            }
            
            .priority-bar-harmonized {
                width: 4px;
                height: 56px;
                border-radius: 2px;
                margin-right: var(--gap-medium);
                transition: all 0.3s ease;
                flex-shrink: 0;
                margin-top: 4px; /* Alignement top */
            }
            
            .task-main-content-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: flex-start; /* Alignement top */
                gap: 6px; /* Augmenté */
                height: 100%;
                padding: 2px 0; /* Petit padding */
            }
            
            .task-header-harmonized {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: var(--gap-medium);
                margin-bottom: 6px; /* Augmenté */
            }
            
            .task-title-harmonized {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-meta-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
                flex-wrap: wrap; /* Permet le wrap */
            }
            
            .task-type-badge-harmonized,
            .deadline-badge-harmonized,
            .confidence-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: #f8fafc;
                color: #64748b;
                padding: 3px 6px; /* Réduit */
                border-radius: 4px; /* Réduit */
                font-size: 10px; /* Réduit */
                font-weight: 600;
                border: 1px solid #e2e8f0;
                white-space: nowrap;
            }
            
            .confidence-badge-harmonized {
                background: #f0fdf4;
                color: #16a34a;
                border-color: #bbf7d0;
            }

            /* Badges priorité spéciaux */
            .priority-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 3px 8px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
                white-space: nowrap;
                border: 1px solid;
                animation: priorityBadgePulse 2s ease-in-out infinite;
            }

            .priority-badge.newsletter {
                background: linear-gradient(135deg, var(--newsletter-color), #ea580c);
                color: white;
                border-color: var(--newsletter-color);
                box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
            }

            .priority-badge.spam {
                background: linear-gradient(135deg, var(--spam-color), #dc2626);
                color: white;
                border-color: var(--spam-color);
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
            }

            .priority-badge.corrected {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border-color: #10b981;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
            }

            @keyframes priorityBadgePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .preselected-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: linear-gradient(135deg, var(--preselect-color) 0%, #7c3aed 100%);
                color: white !important;
                padding: 3px 6px; /* Réduit */
                border-radius: 4px; /* Réduit */
                font-size: 10px; /* Réduit */
                font-weight: 700 !important;
                border: none !important;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
                animation: badgePulse 2s ease-in-out infinite;
            }
            
            .task-recipient-harmonized {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
                flex-wrap: wrap; /* Permet le wrap */
            }
            
            .recipient-name-harmonized {
                font-weight: 600;
                color: #374151;
            }

            .recipient-email-harmonized {
                font-family: monospace;
                font-size: 11px;
                color: #6b7280;
                background: #f3f4f6;
                padding: 2px 4px;
                border-radius: 3px;
            }

            .attachment-indicator {
                color: #f59e0b;
                font-weight: 600;
                font-size: 10px;
                background: rgba(245, 158, 11, 0.1);
                padding: 2px 4px;
                border-radius: 3px;
                border: 1px solid rgba(245, 158, 11, 0.3);
            }
            
            .category-indicator-harmonized {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 3px;
                transition: all 0.2s ease;
            }

            .category-indicator-harmonized.enhanced {
                border: 1px solid;
                box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
            }

            .category-indicator-harmonized.newsletter-category {
                border: 2px solid var(--newsletter-color);
                box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
                animation: newsletterCategoryGlow 2s ease-in-out infinite;
            }

            .category-indicator-harmonized.spam-category {
                border: 2px solid var(--spam-color);
                box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
                animation: spamCategoryGlow 2s ease-in-out infinite;
            }

            @keyframes newsletterCategoryGlow {
                0%, 100% { 
                    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
                }
                50% { 
                    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.4);
                }
            }

            @keyframes spamCategoryGlow {
                0%, 100% { 
                    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
                }
                50% { 
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4);
                }
            }

            .detection-info {
                font-family: monospace;
                font-size: 9px;
                background: #e0f2fe;
                color: #0369a1;
                padding: 2px 4px;
                border-radius: 3px;
                border: 1px solid #0ea5e9;
            }

            /* Preview du contenu */
            .email-preview-content {
                margin-top: 8px;
                padding: 8px 12px;
                background: #f8fafc;
                border-radius: 6px;
                border-left: 3px solid #e2e8f0;
            }

            .preview-text {
                margin: 0;
                font-size: 12px;
                line-height: 1.4;
                color: #6b7280;
                font-style: italic;
            }
            
            .task-harmonized-card.preselected-task .category-indicator-harmonized {
                box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
                animation: categoryGlow 2s ease-in-out infinite;
            }

            @keyframes categoryGlow {
                0%, 100% { 
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
                }
                50% { 
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.5);
                }
            }
            
            .task-actions-harmonized {
                display: flex;
                align-items: flex-start; /* Alignement top */
                gap: 4px;
                margin-left: var(--gap-medium);
                flex-shrink: 0;
                z-index: 10;
                position: relative;
                margin-top: 4px; /* Alignement top */
            }
            
            .action-btn-harmonized {
                width: var(--action-btn-size);
                height: var(--action-btn-size);
                border: 2px solid transparent;
                border-radius: var(--btn-border-radius);
                background: rgba(255, 255, 255, 0.9);
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 13px;
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                z-index: 11;
                position: relative;
            }

            .action-btn-harmonized.enhanced {
                border-width: 1px;
                border-color: rgba(0, 0, 0, 0.1);
                background: rgba(255, 255, 255, 0.95);
            }
            
            .action-btn-harmonized:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .action-btn-harmonized.create-task {
                color: #3b82f6;
            }
            
            .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
                color: #2563eb;
            }

            .action-btn-harmonized.create-task.enhanced:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
            }
            
            .task-harmonized-card.preselected-task .action-btn-harmonized.create-task {
                color: var(--preselect-color);
                background: rgba(139, 92, 246, 0.1);
            }
            
            .task-harmonized-card.preselected-task .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                border-color: var(--preselect-color);
                color: #7c3aed;
            }

            .task-harmonized-card.newsletter-email .action-btn-harmonized.create-task {
                color: var(--newsletter-color);
                background: rgba(249, 115, 22, 0.1);
            }

            .task-harmonized-card.newsletter-email .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
                border-color: var(--newsletter-color);
                color: #ea580c;
            }

            .task-harmonized-card.spam-email .action-btn-harmonized.create-task {
                color: var(--spam-color);
                background: rgba(239, 68, 68, 0.1);
            }

            .task-harmonized-card.spam-email .action-btn-harmonized.create-task:hover {
                background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
                border-color: var(--spam-color);
                color: #dc2626;
            }
            
            .action-btn-harmonized.view-task {
                color: #16a34a;
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }

            .action-btn-harmonized.view-task.enhanced {
                border-color: rgba(34, 197, 94, 0.3);
            }
            
            .action-btn-harmonized.view-task:hover {
                background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
                border-color: #16a34a;
                color: #15803d;
            }
            
            .action-btn-harmonized.details {
                color: #8b5cf6;
            }

            .action-btn-harmonized.details.enhanced {
                background: rgba(139, 92, 246, 0.05);
                border-color: rgba(139, 92, 246, 0.2);
            }
            
            .action-btn-harmonized.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: #8b5cf6;
                color: #7c3aed;
            }

            /* États vides harmonisés */
            .empty-state-harmonized {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .empty-state-icon-harmonized {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }
            
            .empty-state-title-harmonized {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-text-harmonized {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
            }

            .empty-state-actions {
                display: flex;
                gap: var(--gap-medium);
                justify-content: center;
                flex-wrap: wrap;
            }

            /* États vide standard */
            .empty-state {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
            }
            
            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }
            
            .empty-state-title {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-text {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
                margin-left: auto;
                margin-right: auto;
            }

            /* Boutons dans empty state */
            .empty-state .btn,
            .empty-state-harmonized .btn,
            .btn {
                display: inline-flex;
                align-items: center;
                gap: var(--gap-small);
                padding: 12px 24px;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                text-decoration: none;
                border: 1px solid transparent;
                white-space: nowrap;
            }

            .btn.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }

            .btn.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }

            .btn.btn-secondary {
                background: white;
                color: #374151;
                border-color: #e5e7eb;
                box-shadow: var(--shadow-base);
            }

            .btn.btn-secondary:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }

            /* Vue groupée */
            .tasks-grouped-harmonized {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            
            .task-group-harmonized {
                background: transparent;
                border: none;
                border-radius: 0;
                overflow: visible;
                margin: 0;
                padding: 0;
                z-index: 1;
            }
            
            .group-header-harmonized {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: var(--card-height);
                max-height: var(--card-height);
                border-bottom: 1px solid #e5e7eb;
                gap: var(--gap-medium);
                z-index: 1;
            }
            
            .group-avatar-harmonized {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 16px;
                flex-shrink: 0;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            
            .group-info-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                height: 100%;
            }
            
            .group-name-harmonized {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .group-meta-harmonized {
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }
            
            .group-expand-harmonized {
                width: var(--action-btn-size);
                height: var(--action-btn-size);
                border: 2px solid transparent;
                border-radius: var(--btn-border-radius);
                background: rgba(255, 255, 255, 0.9);
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 13px;
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                flex-shrink: 0;
            }
            
            .group-content-harmonized {
                background: transparent;
                margin: 0;
                padding: 0;
                display: none;
            }

            /* RESPONSIVE ULTRA-COMPLET */
            @media (max-width: 1400px) {
                .status-pill-compact {
                    flex: 0 1 calc(20% - var(--gap-small));
                    min-width: 100px;
                    max-width: 160px;
                }

                .controls-bar-single-line {
                    gap: var(--gap-medium);
                }
            }
            
            @media (max-width: 1200px) {
                .status-pill-compact {
                    flex: 0 1 calc(25% - var(--gap-small));
                    min-width: 80px;
                    max-width: 140px;
                }

                .action-buttons {
                    flex-wrap: wrap;
                }
            }
            
            @media (max-width: 1024px) {
                .status-pill-compact {
                    flex: 0 1 calc(33.333% - var(--gap-small));
                    min-width: 70px;
                    max-width: 120px;
                    height: 52px;
                }
                
                .controls-bar-single-line {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                }
                
                .scan-controls {
                    order: 0;
                    justify-content: center;
                }

                .search-section {
                    max-width: none;
                    order: 1;
                }
                
                .view-modes {
                    width: 100%;
                    justify-content: space-around;
                    order: 2;
                }
                
                .action-buttons {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    order: 3;
                }
                
                .dropdown-menu {
                    right: auto;
                    left: 0;
                }

                /* Cartes plus compactes sur tablette */
                .task-harmonized-card {
                    min-height: calc(var(--card-height) - 10px);
                    padding: 12px;
                }

                .email-card-enhanced {
                    min-height: var(--card-height);
                }
            }
            
            @media (max-width: 768px) {
                .status-filters-compact {
                    flex-wrap: wrap;
                    gap: 2px;
                    border-radius: 0;
                    border: none;
                    box-shadow: none;
                    background: transparent;
                }
                
                .status-pill-compact {
                    flex: 0 1 calc(50% - 1px);
                    min-width: 0;
                    border-radius: var(--btn-border-radius);
                    border: 1px solid #e5e7eb;
                    box-shadow: var(--shadow-base);
                }
                
                .view-mode span,
                .btn-action .btn-text {
                    display: none;
                }
                
                .view-mode {
                    min-width: 44px;
                    padding: 0;
                    justify-content: center;
                }
                
                .btn-action {
                    padding: 0 var(--gap-small);
                    min-width: 44px;
                    justify-content: center;
                }
                
                .btn-action .btn-count {
                    display: none;
                }
                
                .search-input {
                    font-size: 14px;
                    padding: 0 var(--gap-small) 0 36px;
                }
                
                .search-icon {
                    left: var(--gap-small);
                    font-size: 14px;
                }

                .explanation-stats {
                    justify-content: center;
                }

                .stat-item {
                    font-size: 11px;
                    padding: 3px 6px;
                }

                .cache-indicators {
                    justify-content: center;
                    gap: var(--gap-small);
                }

                .cache-indicator,
                .provider-indicator,
                .scan-indicator {
                    font-size: 11px;
                    padding: 4px 8px;
                }

                /* Cartes mobiles optimisées */
                .task-harmonized-card {
                    padding: 10px;
                    min-height: 70px;
                }

                .email-card-enhanced {
                    min-height: 80px;
                }

                .task-main-content-harmonized {
                    gap: 4px;
                }

                .task-meta-harmonized {
                    gap: 4px;
                }

                .task-recipient-harmonized {
                    gap: 4px;
                    font-size: 11px;
                }

                .email-preview-content {
                    margin-top: 6px;
                    padding: 6px 8px;
                }

                .preview-text {
                    font-size: 11px;
                }
            }
            
            @media (max-width: 480px) {
                .status-filters-compact {
                    flex-direction: column;
                    gap: 4px;
                }
                
                .status-pill-compact {
                    flex: none;
                    width: 100%;
                    border-radius: var(--btn-border-radius);
                    border: 1px solid #e5e7eb;
                    box-shadow: var(--shadow-base);
                    height: 50px;
                }
                
                .controls-bar-single-line {
                    padding: var(--gap-small);
                    gap: var(--gap-small);
                }
                
                .action-buttons {
                    flex-direction: column;
                    gap: var(--gap-small);
                    align-items: stretch;
                }
                
                .action-buttons > * {
                    width: 100%;
                    justify-content: center;
                }
                
                .sticky-controls-container {
                    padding: var(--gap-small);
                }

                .explanation-content {
                    align-items: center;
                }

                .explanation-stats {
                    flex-direction: column;
                    align-items: center;
                    gap: var(--gap-small);
                }

                .cache-indicators {
                    flex-direction: column;
                    align-items: center;
                }

                /* Très petit mobile - cartes ultra-compactes */
                .task-harmonized-card {
                    padding: 8px;
                    min-height: 60px;
                }

                .email-card-enhanced {
                    min-height: 70px;
                }

                .task-title-harmonized {
                    font-size: 14px;
                }

                .task-actions-harmonized {
                    gap: 2px;
                }

                .action-btn-harmonized {
                    width: 32px;
                    height: 32px;
                    font-size: 12px;
                }

                .email-preview-content {
                    display: none; /* Masquer sur très petit écran */
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // PAGES ADDITIONNELLES
    // ================================================
    
    async renderScanner(container) {
        console.log('[PageManager] Rendu page scanner...');
        
        if (window.scanStartModule && 
            typeof window.scanStartModule.render === 'function' && 
            window.scanStartModule.stylesAdded) {
            
            try {
                console.log('[PageManager] Utilisation ScanStartModule moderne');
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Erreur ScanStartModule, fallback:', error);
            }
        }
        
        const providerInfo = this.getProviderInfo();
        console.log('[PageManager] Utilisation interface scanner fallback');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="empty-title">Scanner d'emails</h3>
                <p class="empty-text">
                    ${providerInfo.status === 'connected' ? 
                        `Connecté à ${providerInfo.name}. Module de scan en cours de chargement...` :
                        'Connectez-vous à Gmail ou Outlook pour commencer.'
                    }
                </p>
                ${providerInfo.status !== 'connected' ? `
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="window.googleAuthService?.login()" style="background: #ea4335;">
                            <i class="fab fa-google"></i>
                            Se connecter à Gmail
                        </button>
                        <button class="btn btn-secondary" onclick="window.authService?.login()" style="background: #0078d4; color: white;">
                            <i class="fab fa-microsoft"></i>
                            Se connecter à Outlook
                        </button>
                    </div>
                ` : `
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="window.pageManager.refreshEmails()">
                            <i class="fas fa-sync-alt"></i>
                            Scan direct
                        </button>
                    </div>
                `}
            </div>
        `;
    }

    async renderTasks(container) {
        if (window.tasksView && window.tasksView.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>Tâches</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="empty-title">Aucune tâche</h3>
                    <p class="empty-text">Créez des tâches à partir de vos emails ${this.currentProvider || 'scannés'}</p>
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="window.pageManager.loadPage('emails')">
                            <i class="fas fa-envelope"></i>
                            Voir les emails
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async renderCategories(container) {
        const categories = window.categoryManager?.getCategories() || {};
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Catégories</h1>
            </div>
            
            <div class="categories-grid">
                ${Object.entries(categories).map(([id, cat]) => `
                    <div class="category-card">
                        <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color}">
                            ${cat.icon}
                        </div>
                        <h3>${cat.name}</h3>
                        <p>${cat.description || ''}</p>
                        ${id === 'marketing_news' ? '<span class="priority-badge newsletter">🚀 Priorité Newsletter/Spam ULTRA-RENFORCÉE</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderSettings(container) {
        if (window.categoriesPage) {
            window.categoriesPage.renderSettings(container);
        } else {
            const providerInfo = this.getProviderInfo();
            container.innerHTML = `
                <div class="page-header">
                    <h1>Paramètres</h1>
                </div>
                
                <div class="settings-card">
                    <h3>Configuration IA</h3>
                    <p>Provider actuel: <strong style="color: ${providerInfo.color};">${providerInfo.name}</strong></p>
                    <p>Emails en cache: <strong>${this.emailsCache.processedEmails.length}</strong></p>
                    <button class="btn primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                        <i class="fas fa-cog"></i> Configurer Claude AI
                    </button>
                </div>
            `;
        }
    }

    async renderRanger(container) {
        if (window.domainOrganizer && window.domainOrganizer.showPage) {
            window.domainOrganizer.showPage(container);
        } else {
            const providerInfo = this.getProviderInfo();
            container.innerHTML = `
                <div class="page-header">
                    <h1>Ranger par domaine</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-folder-tree"></i>
                    </div>
                    <h3 class="empty-title">Module de rangement</h3>
                    <p class="empty-text">
                        Organisez vos emails ${providerInfo.name} par domaine. Module en cours de chargement...
                    </p>
                </div>
            `;
        }
    }

    // ================================================
    // NAVIGATION ET CHARGEMENT PAGES
    // ================================================
    async loadPage(pageName) {
        console.log(`[PageManager] Chargement page: ${pageName}`);

        if (pageName === 'dashboard') {
            console.log('[PageManager] Dashboard ignoré - géré par index.html');
            this.updateNavigation(pageName);
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.style.display = 'block';
                pageContent.style.opacity = '1';
            }
            return;
        }

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManager] Container de contenu non trouvé');
            return;
        }

        this.updateNavigation(pageName);
        window.uiManager?.showLoading(`Chargement ${pageName}...`);

        try {
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} non trouvée`);
            }

            window.uiManager?.hideLoading();

        } catch (error) {
            console.error(`[PageManager] Erreur chargement page:`, error);
            window.uiManager?.hideLoading();
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = this.renderErrorPage(error);
        }
    }

    renderErrorPage(error) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="empty-state-title">Erreur de chargement</h3>
                <p class="empty-state-text">${error.message}</p>
                <button class="btn btn-primary" onclick="window.pageManager.loadPage('emails')">
                    Voir les emails
                </button>
            </div>
        `;
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    startPeriodicProviderCheck() {
        setInterval(() => {
            const oldProvider = this.currentProvider;
            const newProvider = this.detectProviders();
            
            if (oldProvider !== newProvider) {
                console.log(`[PageManager] 🔄 Provider changé: ${oldProvider} → ${newProvider}`);
                this.updateProviderStatus();
            }
        }, 30000);
    }

    updateProviderStatus() {
        if (this.currentPage === 'emails') {
            this.updateProviderInfoDisplay();
        }
        
        this.dispatchEvent('providerChanged', {
            provider: this.currentProvider,
            connectionStatus: this.connectionStatus
        });
    }

    updateProviderInfoDisplay() {
        const providerDisplays = document.querySelectorAll('.provider-status-display, .provider-indicator');
        const providerInfo = this.getProviderInfo();
        
        providerDisplays.forEach(display => {
            if (display && display.classList.contains('provider-indicator')) {
                const statusClass = providerInfo.status === 'connected' ? 'connected' : 'disconnected';
                display.className = `provider-indicator ${statusClass}`;
                display.innerHTML = `
                    <i class="${providerInfo.icon}"></i>
                    <span>${providerInfo.name}</span>
                    ${providerInfo.optimized ? '<span class="opt-badge">✨</span>' : ''}
                `;
            }
        });
    }

    // ================================================
    // MÉTHODES UTILITAIRES ET ANALYSE
    // ================================================
    
    analyzeFirstEmails(emails) {
        console.log(`[PageManager] Analyse de ${emails.length} emails pré-sélectionnés`);
        // Méthode pour analyse IA si nécessaire
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'PageManager',
                    timestamp: Date.now(),
                    provider: this.currentProvider,
                    version: '14.0'
                }
            }));
        } catch (error) {
            console.error(`[PageManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // CLEANUP ET DESTRUCTION
    // ================================================
    
    cleanup() {
        console.log('[PageManager] 🧹 Nettoyage...');
        this.selectedEmails.clear();
        this.aiAnalysisResults.clear();
        this.createdTasks.clear();
        this.emailsCache = {
            rawEmails: [],
            processedEmails: [],
            lastUpdate: null,
            scanInProgress: false,
            errors: []
        };
    }

    destroy() {
        this.cleanup();
        this.currentPage = null;
        this.currentProvider = null;
        console.log('[PageManager] 💥 Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================
if (window.pageManager) {
    console.log('[PageManager] 🔄 Nettoyage ancienne instance...');
    try {
        window.pageManager.destroy?.();
    } catch (e) {
        console.warn('[PageManager] Erreur nettoyage:', e);
    }
}

console.log('[PageManager] 🚀 Création nouvelle instance v14.0 SCAN ET AFFICHAGE CORRIGÉS...');
window.pageManager = new PageManager();

// Bind des méthodes pour préserver le contexte
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

// ================================================
// FONCTIONS DE TEST GLOBALES CORRIGÉES
// ================================================

window.testPageManagerComplete = function() {
    console.group('🧪 TEST PageManager v14.0 - SCAN ET AFFICHAGE CORRIGÉS');
    
    const debugInfo = {
        currentProvider: window.pageManager.currentProvider,
        connectionStatus: window.pageManager.connectionStatus,
        providerInfo: window.pageManager.getProviderInfo(),
        emailsInCache: window.pageManager.emailsCache.processedEmails.length,
        rawEmailsInCache: window.pageManager.emailsCache.rawEmails.length,
        scanInProgress: window.pageManager.emailsCache.scanInProgress,
        cacheErrors: window.pageManager.emailsCache.errors.length
    };
    
    console.log('Debug Info COMPLET:', debugInfo);
    console.log('✅ getAllEmailsRobust disponible:', typeof window.pageManager.getAllEmailsRobust === 'function');
    console.log('✅ getEmailById ULTRA-ROBUSTE disponible:', typeof window.pageManager.getEmailById === 'function');
    console.log('✅ forceEmailScan disponible:', typeof window.pageManager.forceEmailScan === 'function');
    
    // Test des méthodes robustes
    try {
        const emails = window.pageManager.getAllEmails();
        console.log(`✅ getAllEmails retourne ${emails.length} emails`);
        
        if (emails.length > 0) {
            const firstEmail = emails[0];
            const foundEmail = window.pageManager.getEmailById(firstEmail.id);
            console.log('✅ Test getEmailById:', foundEmail ? 'RÉUSSI' : 'ÉCHEC');
            
            // Test scan des providers
            const providerMethods = window.pageManager.checkEmailRetrievalMethods?.() || { available: false };
            console.log('✅ Méthodes de scan disponibles:', providerMethods.available);
        }
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    }
    
    console.groupEnd();
    return { 
        success: true, 
        provider: debugInfo.currentProvider,
        connected: debugInfo.providerInfo.status === 'connected',
        version: '14.0-SCAN-CORRIGÉ',
        emailsAvailable: debugInfo.emailsInCache > 0,
        scanCapable: debugInfo.providerInfo.canScan || false,
        cacheStatus: {
            processed: debugInfo.emailsInCache,
            raw: debugInfo.rawEmailsInCache,
            scanning: debugInfo.scanInProgress,
            errors: debugInfo.cacheErrors
        }
    };
};

window.debugEmailCache = function() {
    console.group('🔍 DEBUG Email Cache v14.0');
    const cache = window.pageManager.emailsCache;
    
    console.log('État du cache:', {
        processedEmails: cache.processedEmails.length,
        rawEmails: cache.rawEmails.length,
        lastUpdate: cache.lastUpdate ? new Date(cache.lastUpdate).toLocaleString() : 'Jamais',
        scanInProgress: cache.scanInProgress,
        source: cache.source || 'Non définie',
        errors: cache.errors.length
    });
    
    if (cache.errors.length > 0) {
        console.log('Erreurs du cache:');
        cache.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.error} (${error.provider}, ${new Date(error.timestamp).toLocaleString()})`);
        });
    }
    
    if (cache.processedEmails.length > 0) {
        const firstEmail = cache.processedEmails[0];
        console.log('Premier email traité:', {
            id: firstEmail.id,
            subject: firstEmail.subject?.substring(0, 50),
            category: firstEmail.category,
            from: firstEmail.from?.emailAddress?.address,
            processedAt: firstEmail.processedAt ? new Date(firstEmail.processedAt).toLocaleString() : 'Non défini'
        });
    }
    
    console.groupEnd();
};

console.log('✅ PageManager v14.0 loaded - SCAN ET AFFICHAGE CORRIGÉS COMPLETS!');
console.log('🔥 Detection Newsletter/Spam ULTRA-RENFORCÉE avec priorité absolue');
console.log('📧 Système de cache email robuste avec scan direct multi-provider');
console.log('🎨 Interface utilisateur complète avec modal détaillée et preview');
console.log('📧 Utilisez testPageManagerComplete() pour tester');
console.log('📧 Utilisez debugEmailCache() pour voir l\'état du cache');
