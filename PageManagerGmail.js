// PageManagerGmail.js - Version 1.1 - Correction authentification Gmail

class PageManagerGmail {
    constructor() {
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.lastScanData = null;
        this.hideExplanation = this.getLocalStorageItem('hideEmailExplanation') === 'true';
        this.isInitialized = false;
        
        // Vue modes pour les emails
        this.currentViewMode = 'grouped-domain';
        this.currentCategory = null;
        
        // Détection spécifique Gmail
        this.provider = 'gmail';
        this.isGmail = true;
        this.gmailDetected = false;
        
        // État de synchronisation Gmail
        this.syncState = {
            startScanSynced: false,
            emailScannerSynced: false,
            categoryManagerSynced: false,
            lastSyncTimestamp: null,
            emailCount: 0,
            gmailAPIConnected: false
        };
        
        // Cache pour optimisation
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        
        // Page modules mapping
        this.pageModules = {
            scanner: 'minimalScanModule',
            emails: null,
            tasks: 'tasksView',
            categories: 'categoriesPage',
            settings: 'categoriesPage',
            ranger: 'domainOrganizer'
        };
        
        this.safeInit();
    }

    getLocalStorageItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('[PageManagerGmail] LocalStorage non disponible:', error);
            return null;
        }
    }

    setLocalStorageItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('[PageManagerGmail] LocalStorage non disponible:', error);
        }
    }

    safeInit() {
        try {
            this.detectGmailEnvironment();
            this.setupEventListeners();
            this.setupSyncListeners();
            this.setupCategoryManagerIntegration();
            this.isInitialized = true;
            console.log('[PageManagerGmail] ✅ Version 1.1 - Gmail Edition initialisée avec auth corrigée');
        } catch (error) {
            console.error('[PageManagerGmail] Erreur initialisation:', error);
        }
    }

    // ================================================
    // DÉTECTION ENVIRONNEMENT GMAIL
    // ================================================
    detectGmailEnvironment() {
        console.log('[PageManagerGmail] 🔍 Détection environnement Gmail...');
        
        // Vérifier l'URL
        const hostname = window.location.hostname.toLowerCase();
        if (hostname.includes('mail.google.com') || hostname.includes('gmail.com')) {
            this.gmailDetected = true;
            console.log('[PageManagerGmail] ✅ Gmail détecté via URL');
        }
        
        // Vérifier les éléments DOM spécifiques à Gmail
        const gmailSelectors = [
            '.gmail_default',
            '[gh="tl"]', // Toolbar Gmail
            '.T-I.T-I-KE', // Bouton composer
            '.zA', // Ligne d'email Gmail
            '.nH .no .nH', // Structure Gmail
            '[role="main"][aria-label*="Gmail"]'
        ];
        
        for (const selector of gmailSelectors) {
            if (document.querySelector(selector)) {
                this.gmailDetected = true;
                console.log('[PageManagerGmail] ✅ Gmail détecté via DOM:', selector);
                break;
            }
        }
        
        // Observer pour détecter Gmail après chargement
        if (!this.gmailDetected) {
            this.observeGmailLoad();
        }
    }

    observeGmailLoad() {
        const observer = new MutationObserver((mutations) => {
            if (document.querySelector('.gmail_default') || document.querySelector('[gh="tl"]')) {
                this.gmailDetected = true;
                console.log('[PageManagerGmail] ✅ Gmail détecté après chargement');
                observer.disconnect();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Timeout après 10 secondes
        setTimeout(() => observer.disconnect(), 10000);
    }

    // ================================================
    // INTÉGRATION CATEGORYMANAGER
    // ================================================
    setupCategoryManagerIntegration() {
        console.log('[PageManagerGmail] 🔗 Configuration intégration CategoryManager...');
        
        if (window.categoryManager) {
            console.log('[PageManagerGmail] ✅ CategoryManager détecté');
            this.syncState.categoryManagerSynced = true;
            
            window.categoryManager.addChangeListener((type, value, settings) => {
                console.log('[PageManagerGmail] 📨 Changement CategoryManager reçu:', type, value);
                this.handleCategoryManagerChange(type, value, settings);
            });
        } else {
            console.warn('[PageManagerGmail] ⚠️ CategoryManager non trouvé, attente...');
            setTimeout(() => this.setupCategoryManagerIntegration(), 2000);
        }
    }

    handleCategoryManagerChange(type, value, settings) {
        console.log('[PageManagerGmail] 🔄 Traitement changement CategoryManager:', type);
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.invalidateTaskCategoriesCache();
                this.handleTaskPreselectedCategoriesChange(value);
                break;
                
            case 'activeCategories':
                this.handleActiveCategoriesChange(value);
                break;
                
            case 'categoryCreated':
            case 'categoryUpdated':
            case 'categoryDeleted':
                this.handleCategoryStructureChange(type, value);
                break;
                
            default:
                this.handleGenericCategoryChange(type, value);
        }
        
        if (this.currentPage === 'emails') {
            setTimeout(() => {
                this.refreshEmailsView();
            }, 100);
        }
    }

    // ================================================
    // AUTHENTIFICATION GMAIL CORRIGÉE
    // ================================================
    async checkAuthenticationStatus() {
        try {
            let isAuthenticated = false;
            let user = null;
            
            // Vérifier d'abord GoogleAuthService
            if (window.googleAuthService) {
                console.log('[PageManagerGmail] Vérification authentification Google...');
                
                // Utiliser checkAuthentication() au lieu de checkAuthStatus()
                if (typeof window.googleAuthService.checkAuthentication === 'function') {
                    try {
                        const authStatus = await window.googleAuthService.checkAuthentication();
                        isAuthenticated = authStatus.isAuthenticated || false;
                        user = authStatus.user || null;
                        this.syncState.gmailAPIConnected = isAuthenticated;
                        console.log('[PageManagerGmail] GoogleAuthService.checkAuthentication():', authStatus);
                    } catch (error) {
                        console.warn('[PageManagerGmail] Erreur checkAuthentication:', error);
                    }
                }
                
                // Fallback sur isAuthenticated()
                if (!isAuthenticated && typeof window.googleAuthService.isAuthenticated === 'function') {
                    isAuthenticated = window.googleAuthService.isAuthenticated();
                    console.log('[PageManagerGmail] GoogleAuthService.isAuthenticated():', isAuthenticated);
                }
                
                // Essayer de récupérer l'utilisateur si authentifié
                if (isAuthenticated && !user && typeof window.googleAuthService.getUserInfo === 'function') {
                    try {
                        const userInfo = await window.googleAuthService.getUserInfo();
                        user = userInfo?.email || userInfo?.emailAddress || null;
                        console.log('[PageManagerGmail] User info récupéré:', user);
                    } catch (error) {
                        console.warn('[PageManagerGmail] Erreur getUserInfo:', error);
                    }
                }
            }
            
            // Vérifier aussi Microsoft au cas où (double authentification)
            if (!isAuthenticated && window.authService) {
                console.log('[PageManagerGmail] Vérification authentification Microsoft comme fallback...');
                
                if (typeof window.authService.isAuthenticated === 'function') {
                    const msAuth = window.authService.isAuthenticated();
                    if (msAuth) {
                        isAuthenticated = true;
                        user = 'Microsoft User';
                        console.log('[PageManagerGmail] Authentifié via Microsoft');
                    }
                }
            }
            
            // Vérifier si on est dans Gmail natif
            if (!isAuthenticated && this.gmailDetected) {
                // Gmail est déjà authentifié si on peut voir l'interface
                const gmailInterface = document.querySelector('.gmail_default') || 
                                     document.querySelector('[gh="tl"]') ||
                                     document.querySelector('.T-I.T-I-KE');
                
                if (gmailInterface) {
                    isAuthenticated = true;
                    console.log('[PageManagerGmail] ✅ Utilisateur connecté à Gmail (interface détectée)');
                    
                    // Essayer de récupérer l'email de l'utilisateur
                    const accountButton = document.querySelector('[aria-label*="Google Account"]');
                    if (accountButton) {
                        const emailMatch = accountButton.getAttribute('aria-label')?.match(/([^@]+@[^)]+)/);
                        if (emailMatch) {
                            user = emailMatch[1];
                        }
                    }
                }
            }
            
            // Dernier recours : vérifier localStorage
            if (!isAuthenticated) {
                try {
                    const storedAuth = this.getLocalStorageItem('googleAuthStatus') || 
                                      this.getLocalStorageItem('authStatus') || 
                                      this.getLocalStorageItem('userInfo');
                    if (storedAuth) {
                        isAuthenticated = true;
                        console.log('[PageManagerGmail] Found stored authentication indicator');
                    }
                } catch (error) {
                    console.warn('[PageManagerGmail] Cannot access localStorage:', error);
                }
            }
            
            console.log('[PageManagerGmail] ✅ Résultat final authentification:', {
                isAuthenticated,
                user,
                source: isAuthenticated ? 'detected' : 'none',
                gmailAPIConnected: this.syncState.gmailAPIConnected
            });
            
            return {
                isAuthenticated,
                user,
                source: isAuthenticated ? 'gmail' : 'none'
            };
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur vérification authentification:', error);
            return {
                isAuthenticated: false,
                user: null,
                error: error.message
            };
        }
    }

    renderAuthRequiredState(pageName) {
        return `
            <div class="auth-required-state">
                <div class="auth-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h3 class="auth-title">Authentification requise</h3>
                <p class="auth-text">
                    Vous devez être connecté pour accéder à cette page.
                </p>
                <div class="auth-actions">
                    <button class="btn btn-primary" onclick="window.pageManagerGmail.handleLogin()">
                        <i class="fas fa-sign-in-alt"></i>
                        Se connecter
                    </button>
                    <button class="btn btn-secondary" onclick="window.pageManagerGmail.loadPage('dashboard')">
                        <i class="fas fa-home"></i>
                        Retour au tableau de bord
                    </button>
                </div>
            </div>
        `;
    }

    async handleLogin() {
        console.log('[PageManagerGmail] Handling Gmail login request...');
        
        try {
            if (window.googleAuthService && typeof window.googleAuthService.login === 'function') {
                console.log('[PageManagerGmail] Using GoogleAuthService.login()');
                await window.googleAuthService.login();
            } else if (window.googleAuthService && typeof window.googleAuthService.signIn === 'function') {
                console.log('[PageManagerGmail] Using GoogleAuthService.signIn()');
                await window.googleAuthService.signIn();
            } else if (window.authService && typeof window.authService.login === 'function') {
                console.log('[PageManagerGmail] Fallback to Microsoft auth');
                await window.authService.login();
            } else {
                console.log('[PageManagerGmail] No login method available, redirecting to Google');
                window.location.href = 'https://accounts.google.com/signin/v2/identifier?service=mail&continue=https://mail.google.com';
            }
        } catch (error) {
            console.error('[PageManagerGmail] Login error:', error);
            this.showError('Erreur lors de la connexion: ' + error.message);
        }
    }

    // ================================================
    // RENDU DE LA PAGE SCANNER CORRIGÉ
    // ================================================
    async renderScanner(container) {
        console.log('[PageManagerGmail] Rendering scanner page...');
        
        const authStatus = await this.checkAuthenticationStatus();
        console.log('[PageManagerGmail] Auth status for scanner:', authStatus);
        
        // Si authentifié, déléguer au module scanner
        if (authStatus.isAuthenticated) {
            if (window.minimalScanModule && typeof window.minimalScanModule.render === 'function') {
                try {
                    console.log('[PageManagerGmail] Délégation au minimalScanModule...');
                    await window.minimalScanModule.render(container);
                    return;
                } catch (error) {
                    console.error('[PageManagerGmail] Erreur avec minimalScanModule:', error);
                }
            }
        }
        
        // Si non authentifié, afficher la page de connexion
        container.innerHTML = `
            <div class="scanner-auth-required">
                <div class="scanner-header">
                    <h1><i class="fas fa-search"></i> Scanner d'emails</h1>
                    <p>Connectez-vous pour analyser vos emails</p>
                </div>
                
                <div class="auth-card">
                    <div class="auth-icon">
                        <i class="fab fa-google"></i>
                    </div>
                    <h3>Connexion Google</h3>
                    <p>Accédez à vos emails Gmail</p>
                    <button class="btn btn-primary btn-large" onclick="window.pageManagerGmail.handleLogin()">
                        <i class="fas fa-sign-in-alt"></i>
                        Se connecter à Google
                    </button>
                </div>
                
                <div class="scanner-info">
                    <div class="info-card">
                        <i class="fas fa-shield-alt"></i>
                        <h4>Sécurisé</h4>
                        <p>Authentification OAuth2 Google</p>
                    </div>
                    <div class="info-card">
                        <i class="fas fa-robot"></i>
                        <h4>IA Intégrée</h4>
                        <p>Analyse intelligente avec Claude AI</p>
                    </div>
                    <div class="info-card">
                        <i class="fas fa-tasks"></i>
                        <h4>Productivité</h4>
                        <p>Convertit automatiquement en tâches</p>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // RENDU SPÉCIFIQUE GMAIL
    // ================================================
    renderEmailCard(email) {
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
        
        // Détection newsletter Gmail
        const isNewsletter = this.detectGmailNewsletter(email);
        
        const cardClasses = [
            'email-card',
            isSelected ? 'selected' : '',
            hasTask ? 'has-task' : '',
            isPreselectedForTasks ? 'preselected' : '',
            email.webSimulated ? 'simulated' : '',
            isNewsletter ? 'newsletter' : '',
            'gmail-style'
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${cardClasses}" 
                 data-email-id="${email.id}"
                 data-category="${email.category}"
                 data-preselected="${isPreselectedForTasks}">
                
                <input type="checkbox" 
                       class="email-checkbox gmail-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onchange="event.stopPropagation(); window.pageManagerGmail.toggleEmailSelection('${email.id}')">
                
                <div class="priority-bar" 
                     style="background-color: ${isPreselectedForTasks ? '#8b5cf6' : this.getEmailPriorityColor(email)}"></div>
                
                <div class="email-content" onclick="window.pageManagerGmail.handleEmailClick(event, '${email.id}')">
                    <div class="email-header">
                        <h3 class="email-title">${this.escapeHtml(email.subject || 'Sans sujet')}</h3>
                        <div class="email-meta">
                            ${isNewsletter ? `
                                <span class="newsletter-badge">
                                    <i class="fas fa-newspaper"></i> Newsletter
                                </span>
                            ` : ''}
                            <span class="email-type">
                                ${email.webSimulated ? '🤖 Simulé' : '📧 Email'}
                            </span>
                            <span class="email-date">
                                📅 ${this.formatEmailDate(email.receivedDateTime)}
                            </span>
                            ${isPreselectedForTasks ? `
                                <span class="preselected-badge">
                                    ⭐ Pré-sélectionné
                                </span>
                            ` : ''}
                            ${email.labels && email.labels.length > 0 ? `
                                <span class="gmail-labels">
                                    ${email.labels.map(label => `
                                        <span class="gmail-label">${label}</span>
                                    `).join('')}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="email-sender">
                        <i class="fas fa-envelope"></i>
                        <span class="sender-name">${this.escapeHtml(senderName)}</span>
                        ${email.hasAttachments ? '<span class="attachment-indicator">📎 Pièce jointe</span>' : ''}
                        ${email.category && email.category !== 'other' ? `
                            <span class="category-badge" 
                                  style="background: ${this.getCategoryColor(email.category)}20; 
                                         color: ${this.getCategoryColor(email.category)};
                                         ${isPreselectedForTasks ? 'font-weight: 700;' : ''}">
                                ${this.getCategoryIcon(email.category)} ${this.getCategoryName(email.category)}
                                ${isPreselectedForTasks ? ' ⭐' : ''}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="email-actions">
                    ${this.renderEmailActions(email, isNewsletter)}
                </div>
            </div>
        `;
    }

    // ================================================
    // DÉTECTION NEWSLETTER GMAIL
    // ================================================
    detectGmailNewsletter(email) {
        // Vérifier les headers spécifiques Gmail
        if (email.headers) {
            const unsubscribeHeader = email.headers['List-Unsubscribe'] || 
                                     email.headers['list-unsubscribe'];
            if (unsubscribeHeader) {
                return true;
            }
        }
        
        // Vérifier les labels Gmail
        if (email.labels && Array.isArray(email.labels)) {
            const newsletterLabels = ['promotions', 'updates', 'forums', 'social'];
            if (email.labels.some(label => newsletterLabels.includes(label.toLowerCase()))) {
                return true;
            }
        }
        
        // Vérifier le contenu pour des liens de désabonnement
        const bodyText = (email.bodyPreview || email.body?.content || '').toLowerCase();
        const unsubscribeKeywords = [
            'unsubscribe',
            'se désabonner',
            'désinscrire',
            'stop receiving',
            'opt out',
            'email preferences',
            'notification settings',
            'gérer vos préférences'
        ];
        
        return unsubscribeKeywords.some(keyword => bodyText.includes(keyword));
    }

    // ================================================
    // ACTIONS SPÉCIFIQUES GMAIL
    // ================================================
    renderEmailActions(email, isNewsletter) {
        const hasTask = this.createdTasks.has(email.id);
        const actions = [];
        
        if (!hasTask) {
            actions.push(`
                <button class="action-btn create-task" 
                        onclick="event.stopPropagation(); window.pageManagerGmail.showTaskCreationModal('${email.id}')"
                        title="Créer une tâche à partir de cet email">
                    <i class="fas fa-tasks"></i>
                </button>
            `);
        } else {
            actions.push(`
                <button class="action-btn view-task" 
                        onclick="event.stopPropagation(); window.pageManagerGmail.openCreatedTask('${email.id}')"
                        title="Voir la tâche créée">
                    <i class="fas fa-check-circle"></i>
                </button>
            `);
        }
        
        // Bouton Se désabonner pour les newsletters
        if (isNewsletter) {
            actions.push(`
                <button class="action-btn unsubscribe gmail-unsubscribe" 
                        onclick="event.stopPropagation(); window.pageManagerGmail.handleUnsubscribe('${email.id}')"
                        title="Se désabonner de cette newsletter">
                    <i class="fas fa-user-minus"></i>
                </button>
            `);
        }
        
        // Bouton Archive Gmail
        actions.push(`
            <button class="action-btn archive gmail-archive" 
                    onclick="event.stopPropagation(); window.pageManagerGmail.archiveEmail('${email.id}')"
                    title="Archiver cet email">
                <i class="fas fa-archive"></i>
            </button>
        `);
        
        // Bouton Label Gmail
        actions.push(`
            <button class="action-btn label gmail-label" 
                    onclick="event.stopPropagation(); window.pageManagerGmail.showLabelMenu('${email.id}')"
                    title="Ajouter un label">
                <i class="fas fa-tag"></i>
            </button>
        `);
        
        actions.push(`
            <button class="action-btn details" 
                    onclick="event.stopPropagation(); window.pageManagerGmail.showEmailModal('${email.id}')"
                    title="Voir le contenu complet de l'email">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // ================================================
    // GESTION NEWSLETTER GMAIL
    // ================================================
    async handleUnsubscribe(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        console.log('[PageManagerGmail] 🔔 Gestion désabonnement:', emailId);
        
        // Chercher le lien de désabonnement
        const unsubscribeLink = this.findUnsubscribeLink(email);
        
        if (unsubscribeLink) {
            // Afficher modal de confirmation
            this.showUnsubscribeModal(email, unsubscribeLink);
        } else {
            // Proposer d'archiver ou de bloquer
            this.showAlternativeUnsubscribeModal(email);
        }
    }

    findUnsubscribeLink(email) {
        // Vérifier les headers
        if (email.headers && email.headers['List-Unsubscribe']) {
            const header = email.headers['List-Unsubscribe'];
            const urlMatch = header.match(/<(https?:\/\/[^>]+)>/);
            if (urlMatch) {
                return urlMatch[1];
            }
        }
        
        // Chercher dans le contenu
        const bodyContent = email.body?.content || email.bodyPreview || '';
        const unsubscribeRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*unsubscribe[^<]*)<\/a>/gi;
        const match = unsubscribeRegex.exec(bodyContent);
        
        if (match) {
            return match[1];
        }
        
        return null;
    }

    showUnsubscribeModal(email, unsubscribeLink) {
        const modalId = 'unsubscribe_modal_' + Date.now();
        const senderName = email.from?.emailAddress?.name || 'cet expéditeur';
        
        const modalHTML = `
            <div id="${modalId}" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); z-index: 99999999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 16px; max-width: 500px; width: 100%; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #ea4335 0%, #fbbc04 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: white; font-size: 28px;">
                            <i class="fas fa-user-minus"></i>
                        </div>
                        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #1f2937;">Se désabonner</h2>
                        <p style="margin: 0; color: #6b7280; font-size: 16px;">Voulez-vous vous désabonner de ${this.escapeHtml(senderName)} ?</p>
                    </div>
                    
                    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-info-circle" style="color: #f59e0b; font-size: 20px; flex-shrink: 0;"></i>
                            <div style="font-size: 14px; color: #92400e;">
                                Vous allez être redirigé vers la page de désabonnement. 
                                Gmail marquera également cet expéditeur pour filtrer les futures newsletters.
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button onclick="document.getElementById('${modalId}').remove();"
                                style="padding: 12px 24px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600; color: #374151;">
                            Annuler
                        </button>
                        <button onclick="window.pageManagerGmail.confirmUnsubscribe('${email.id}', '${encodeURIComponent(unsubscribeLink)}'); document.getElementById('${modalId}').remove();"
                                style="padding: 12px 24px; background: linear-gradient(135deg, #ea4335 0%, #d33b2c 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-external-link-alt"></i> Se désabonner
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    showAlternativeUnsubscribeModal(email) {
        const modalId = 'alt_unsubscribe_modal_' + Date.now();
        const senderName = email.from?.emailAddress?.name || 'cet expéditeur';
        const senderEmail = email.from?.emailAddress?.address || '';
        
        const modalHTML = `
            <div id="${modalId}" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); z-index: 99999999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 16px; max-width: 500px; width: 100%; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: white; font-size: 28px;">
                            <i class="fas fa-filter"></i>
                        </div>
                        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #1f2937;">Gérer les emails</h2>
                        <p style="margin: 0; color: #6b7280; font-size: 16px;">Aucun lien de désabonnement trouvé</p>
                    </div>
                    
                    <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                        <div style="font-weight: 600; color: #1e40af; margin-bottom: 8px;">${this.escapeHtml(senderName)}</div>
                        <div style="font-size: 14px; color: #3730a3;">${this.escapeHtml(senderEmail)}</div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button onclick="window.pageManagerGmail.createGmailFilter('${email.id}'); document.getElementById('${modalId}').remove();"
                                style="padding: 16px; background: white; border: 2px solid #4285f4; border-radius: 8px; cursor: pointer; font-weight: 600; color: #1d4ed8; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fas fa-filter"></i> Créer un filtre Gmail
                        </button>
                        
                        <button onclick="window.pageManagerGmail.blockSender('${email.id}'); document.getElementById('${modalId}').remove();"
                                style="padding: 16px; background: white; border: 2px solid #ea4335; border-radius: 8px; cursor: pointer; font-weight: 600; color: #dc2626; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fas fa-ban"></i> Bloquer cet expéditeur
                        </button>
                        
                        <button onclick="document.getElementById('${modalId}').remove();"
                                style="padding: 12px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; color: #6b7280;">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async confirmUnsubscribe(emailId, encodedLink) {
        const link = decodeURIComponent(encodedLink);
        
        // Marquer l'email
        const email = this.getEmailById(emailId);
        if (email) {
            // Ajouter aux emails traités
            this.setLocalStorageItem(`unsubscribed_${email.from?.emailAddress?.address}`, 'true');
        }
        
        // Ouvrir le lien dans un nouvel onglet
        window.open(link, '_blank');
        
        this.showToast('Redirection vers la page de désabonnement...', 'info');
        
        // Optionnel : archiver l'email
        setTimeout(() => {
            this.archiveEmail(emailId);
        }, 2000);
    }

    async createGmailFilter(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const senderEmail = email.from?.emailAddress?.address;
        console.log('[PageManagerGmail] 📧 Création filtre Gmail pour:', senderEmail);
        
        // Simuler la création d'un filtre (dans une vraie implémentation, utiliser l'API Gmail)
        this.setLocalStorageItem(`gmail_filter_${senderEmail}`, JSON.stringify({
            created: new Date().toISOString(),
            action: 'skip_inbox',
            label: 'Filtered'
        }));
        
        this.showToast('Filtre Gmail créé. Les futurs emails seront automatiquement archivés.', 'success');
        this.archiveEmail(emailId);
    }

    async blockSender(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const senderEmail = email.from?.emailAddress?.address;
        console.log('[PageManagerGmail] 🚫 Blocage expéditeur:', senderEmail);
        
        // Simuler le blocage (dans une vraie implémentation, utiliser l'API Gmail)
        this.setLocalStorageItem(`blocked_sender_${senderEmail}`, 'true');
        
        this.showToast('Expéditeur bloqué. Vous ne recevrez plus d\'emails de cette adresse.', 'success');
        
        // Supprimer l'email de la vue
        this.selectedEmails.delete(emailId);
        this.refreshEmailsView();
    }

    async archiveEmail(emailId) {
        console.log('[PageManagerGmail] 📦 Archivage email:', emailId);
        
        // Simuler l'archivage
        const email = this.getEmailById(emailId);
        if (email) {
            email.archived = true;
            email.labels = email.labels || [];
            if (!email.labels.includes('Archived')) {
                email.labels.push('Archived');
            }
        }
        
        this.showToast('Email archivé', 'success');
        this.refreshEmailsView();
    }

    showLabelMenu(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        const modalId = 'label_menu_' + Date.now();
        
        // Labels Gmail par défaut
        const defaultLabels = [
            { name: 'Important', color: '#fbbc04', icon: 'star' },
            { name: 'Travail', color: '#4285f4', icon: 'briefcase' },
            { name: 'Personnel', color: '#0f9d58', icon: 'user' },
            { name: 'À faire', color: '#ea4335', icon: 'check-square' },
            { name: 'Projet', color: '#673ab7', icon: 'folder' },
            { name: 'Finance', color: '#ff5722', icon: 'dollar-sign' }
        ];
        
        const currentLabels = email.labels || [];
        
        const modalHTML = `
            <div id="${modalId}" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 99999999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 16px; max-width: 400px; width: 100%; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #1f2937; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-tags" style="color: #4285f4;"></i>
                        Ajouter des labels
                    </h3>
                    
                    <div style="display: grid; gap: 8px; max-height: 300px; overflow-y: auto;">
                        ${defaultLabels.map(label => {
                            const isSelected = currentLabels.includes(label.name);
                            return `
                                <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid ${isSelected ? label.color : '#e5e7eb'}; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; background: ${isSelected ? label.color + '20' : 'white'};">
                                    <input type="checkbox" 
                                           ${isSelected ? 'checked' : ''} 
                                           onchange="window.pageManagerGmail.toggleLabel('${emailId}', '${label.name}')"
                                           style="width: 16px; height: 16px; cursor: pointer;">
                                    <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                                        <i class="fas fa-${label.icon}" style="color: ${label.color}; font-size: 16px;"></i>
                                        <span style="font-weight: 500; color: #374151;">${label.name}</span>
                                    </div>
                                </label>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                        <button onclick="document.getElementById('${modalId}').remove();"
                                style="padding: 10px 20px; background: #4285f4; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Terminé
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    toggleLabel(emailId, labelName) {
        const email = this.getEmailById(emailId);
        if (!email) return;
        
        email.labels = email.labels || [];
        
        const index = email.labels.indexOf(labelName);
        if (index > -1) {
            email.labels.splice(index, 1);
        } else {
            email.labels.push(labelName);
        }
        
        console.log('[PageManagerGmail] 🏷️ Labels mis à jour:', email.labels);
    }

    // ================================================
    // STYLES SPÉCIFIQUES GMAIL
    // ================================================
    addEmailsStyles() {
        if (document.getElementById('gmailEmailsPageStyles')) return;
        
        const baseStyles = document.getElementById('emailsPageStyles');
        if (baseStyles) {
            baseStyles.remove();
        }
        
        const styles = document.createElement('style');
        styles.id = 'gmailEmailsPageStyles';
        styles.textContent = `
            /* Styles Gmail spécifiques */
            .email-card.gmail-style {
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
                border-left: 4px solid transparent;
                transition: all 0.2s ease;
            }
            
            .email-card.gmail-style:hover {
                background: #f8f9fa;
                box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
            }
            
            .email-card.newsletter {
                border-left-color: #fbbc04;
            }
            
            .gmail-checkbox {
                border-radius: 3px;
                border: 2px solid #dadce0;
                width: 20px;
                height: 20px;
            }
            
            .gmail-checkbox:checked {
                background: #1a73e8;
                border-color: #1a73e8;
            }
            
            .newsletter-badge {
                background: #fef7e0;
                color: #f9ab00;
                border: 1px solid #f9ab00;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .gmail-labels {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }
            
            .gmail-label {
                background: #e8f0fe;
                color: #1967d2;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 11px;
                font-weight: 500;
            }
            
            .action-btn.gmail-unsubscribe {
                color: #ea4335;
            }
            
            .action-btn.gmail-unsubscribe:hover {
                background: #fce8e6;
                border-color: #ea4335;
            }
            
            .action-btn.gmail-archive {
                color: #5f6368;
            }
            
            .action-btn.gmail-archive:hover {
                background: #f1f3f4;
                border-color: #5f6368;
            }
            
            .action-btn.gmail-label {
                color: #1a73e8;
            }
            
            .action-btn.gmail-label:hover {
                background: #e8f0fe;
                border-color: #1a73e8;
            }
            
            /* Provider badge Gmail */
            .provider-badge.gmail {
                background: rgba(66, 133, 244, 0.1);
                border-color: rgba(66, 133, 244, 0.3);
                color: #1a73e8;
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
            }
            
            /* Catégories Gmail style */
            .category-tab.gmail-style {
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
                border-radius: 4px;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 0.5px;
            }
            
            .category-tab.gmail-style:hover {
                background: #f8f9fa;
                border-color: #dadce0;
            }
            
            .category-tab.gmail-style.active {
                background: #1a73e8;
                border-color: #1a73e8;
                color: white;
            }
            
            /* Search box Gmail style */
            .search-input.gmail-style {
                background: #f1f3f4;
                border: 1px solid transparent;
                border-radius: 8px;
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
            }
            
            .search-input.gmail-style:focus {
                background: white;
                border-color: #dadce0;
                box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
            }
            
            /* Boutons Gmail style */
            .btn.gmail-style {
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
                border-radius: 4px;
                text-transform: none;
                letter-spacing: 0.25px;
                font-weight: 500;
            }
            
            .btn-primary.gmail-style {
                background: #1a73e8;
                border-color: #1a73e8;
            }
            
            .btn-primary.gmail-style:hover {
                background: #1765cc;
                box-shadow: 0 1px 2px 0 rgba(66,133,244,0.3), 0 1px 3px 1px rgba(66,133,244,0.15);
            }
        `;
        
        document.head.appendChild(styles);
        
        // Ajouter aussi les styles de base adaptés
        const baseStylesAdapted = document.createElement('style');
        baseStylesAdapted.id = 'emailsPageStyles';
        baseStylesAdapted.textContent = this.getBaseEmailStyles();
        document.head.appendChild(baseStylesAdapted);
    }

    getBaseEmailStyles() {
        // Retourner les styles de base du PageManager original
        // mais adaptés pour Gmail
        return `
            .emails-page-modern {
                padding: 16px;
                background: #f8f9fa;
                min-height: 100vh;
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
            }

            .explanation-notice {
                background: #e8f0fe;
                border: 1px solid #1a73e8;
                border-radius: 4px;
                padding: 10px 14px;
                margin: 0 16px 12px 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #1967d2;
                font-size: 13px;
                font-weight: 500;
            }

            /* ... autres styles de base adaptés pour Gmail ... */
        `;
    }

    // ================================================
    // MÉTHODES HÉRITÉES
    // ================================================
    // Toutes les autres méthodes du PageManager original sont héritées
    // On peut les surcharger si nécessaire pour adapter à Gmail
    
    cleanup() {
        if (this.categoryManagerChangeListener) {
            window.categoryManager?.removeChangeListener?.(this.categoryManagerChangeListener);
        }
        
        this.invalidateTaskCategoriesCache();
        this.selectedEmails.clear();
        this.aiAnalysisResults.clear();
        this.createdTasks.clear();
        
        console.log('[PageManagerGmail] 🧹 Nettoyage effectué');
    }
}

// ================================================
// COPIER TOUTES LES MÉTHODES NON SURCHARGÉES
// ================================================
// Copier les méthodes du PageManager original qui ne sont pas redéfinies
const methodsToCopy = [
    'handleTaskPreselectedCategoriesChange',
    'handleActiveCategoriesChange',
    'handleCategoryStructureChange',
    'handleGenericCategoryChange',
    'setupSyncListeners',
    'handleScanCompleted',
    'handleEmailScannerSynced',
    'handleEmailsRecategorized',
    'handleEmailScannerReady',
    'setupEventListeners',
    'handleGenericSettingsChanged',
    'loadPage',
    'checkEmailSyncStatus',
    'tryRecoverScanResults',
    'requiresAuthentication',
    'renderPage',
    'delegateToModule',
    'initializePageEvents',
    'getAllEmails',
    'getCategories',
    'getTaskPreselectedCategories',
    'invalidateTaskCategoriesCache',
    'renderEmails',
    'buildCategoryTabs',
    'renderEmailsList',
    'renderFlatView',
    'renderGroupedView',
    'renderEmailGroup',
    'toggleEmailSelection',
    'updateControlsOnly',
    'clearSelection',
    'refreshEmailsView',
    'refreshEmails',
    'filterByCategory',
    'changeViewMode',
    'hideExplanationMessage',
    'toggleGroup',
    'handleEmailClick',
    'setupEmailsEventListeners',
    'handleSearch',
    'clearSearch',
    'toggleBulkActions',
    'bulkMarkAsRead',
    'bulkArchive',
    'bulkDelete',
    'bulkExport',
    'createTasksFromSelection',
    'buildTaskDataFromAnalysis',
    'buildTaskDataFromEmail',
    'generateTaskId',
    'getEmailById',
    'showEmailModal',
    'showTaskCreationModal',
    'createTaskFromModal',
    'openCreatedTask',
    'renderTasks',
    'renderCategories',
    'renderSettings',
    'startFallbackScan',
    'renderRanger',
    'renderEmptyEmailsState',
    'renderEmptyState',
    'configureAI',
    'getVisibleEmails',
    'matchesSearch',
    'calculateCategoryCounts',
    'createEmailGroups',
    'generateAvatarColor',
    'getEmailPriorityColor',
    'formatEmailDate',
    'escapeHtml',
    'getEmailContent',
    'getCategoryColor',
    'getCategoryIcon',
    'getCategoryName',
    'analyzeFirstEmails',
    'safeCall',
    'getPageContainer',
    'showPageContent',
    'updateNavigation',
    'showLoading',
    'hideLoading',
    'showError',
    'showToast',
    'renderErrorPage',
    'getSyncStatus'
];

// Copier les méthodes depuis le prototype de PageManager si disponible
if (typeof PageManager !== 'undefined') {
    methodsToCopy.forEach(methodName => {
        if (!PageManagerGmail.prototype[methodName] && PageManager.prototype[methodName]) {
            PageManagerGmail.prototype[methodName] = PageManager.prototype[methodName];
        }
    });
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.pageManagerGmail) {
    console.log('[PageManagerGmail] 🔄 Nettoyage ancienne instance...');
    window.pageManagerGmail.cleanup?.();
}

console.log('[PageManagerGmail] 🚀 Création nouvelle instance v1.1...');
window.pageManagerGmail = new PageManagerGmail();

// Bind toutes les méthodes
Object.getOwnPropertyNames(PageManagerGmail.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManagerGmail[name] === 'function') {
        window.pageManagerGmail[name] = window.pageManagerGmail[name].bind(window.pageManagerGmail);
    }
});

// Exposer comme PageManager si on est dans Gmail
if (window.location.hostname.includes('gmail.com') || window.location.hostname.includes('mail.google.com')) {
    window.pageManager = window.pageManagerGmail;
}

// Fonctions de debug globales
window.debugPageManagerGmail = function() {
    return window.pageManagerGmail?.getSyncStatus() || { error: 'PageManagerGmail non disponible' };
};

console.log('✅ PageManagerGmail v1.1 loaded - Gmail Edition avec auth corrigée');
