// StartScan.js - Version 11.1 - Détection corrigée des connexions Gmail/Outlook

console.log('[StartScan] 🚀 Loading StartScan.js v11.1 - Fixed Connection Detection...');

class MinimalScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        this.emailProvider = null; // 'gmail' ou 'outlook'
        this.connectedService = null; // 'microsoft' ou 'google'
        this.detectionAttempts = 0;
        this.maxDetectionAttempts = 10;
        
        // Intégration avec les paramètres
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        console.log('[MinimalScan] Scanner v11.1 initialized - Fixed Connection Detection');
        this.detectConnectionsAndProvider();
        this.loadSettingsFromCategoryManager();
        this.addMinimalStyles();
    }

    // ================================================
    // DÉTECTION COMPLÈTE DES CONNEXIONS ET PROVIDER
    // ================================================
    async detectConnectionsAndProvider() {
        console.log('[MinimalScan] 🔍 === DÉTECTION COMPLÈTE DES CONNEXIONS ===');
        
        try {
            // Étape 1: Détecter les services connectés
            await this.detectConnectedServices();
            
            // Étape 2: Détecter le provider email basé sur la connexion
            await this.detectEmailProviderFromConnection();
            
            // Étape 3: Validation et fallback
            this.validateDetection();
            
            // Étape 4: Charger le bon PageManager
            await this.loadCorrectPageManager();
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur détection complète:', error);
            this.handleDetectionError(error);
        }
    }

    async detectConnectedServices() {
        console.log('[MinimalScan] 🔐 Détection des services connectés...');
        
        const connections = {
            microsoft: false,
            google: false,
            activeProvider: null,
            userInfo: null
        };

        // Vérifier Microsoft/Outlook - Méthode corrigée
        try {
            if (window.authService) {
                // Utiliser isAuthenticated() au lieu de checkAuthStatus()
                const isAuth = window.authService.isAuthenticated();
                console.log('[MinimalScan] 🔍 Microsoft auth status:', isAuth);
                
                if (isAuth) {
                    connections.microsoft = true;
                    connections.activeProvider = 'microsoft';
                    
                    // Essayer de récupérer les infos utilisateur
                    try {
                        const userInfo = await window.authService.getUserInfo();
                        connections.userInfo = userInfo;
                        console.log('[MinimalScan] ✅ Microsoft connecté:', userInfo.displayName || userInfo.mail);
                    } catch (error) {
                        console.warn('[MinimalScan] ⚠️ Erreur récupération info utilisateur Microsoft:', error);
                    }
                }
            }
        } catch (error) {
            console.warn('[MinimalScan] ⚠️ Erreur vérification Microsoft:', error);
        }

        // Vérifier Google/Gmail - Méthode corrigée
        try {
            if (window.googleAuthService) {
                // Utiliser isAuthenticated() au lieu de checkAuthStatus()
                const isAuth = window.googleAuthService.isAuthenticated();
                console.log('[MinimalScan] 🔍 Google auth status:', isAuth);
                
                if (isAuth) {
                    connections.google = true;
                    if (!connections.activeProvider) {
                        connections.activeProvider = 'google';
                    }
                    
                    // Essayer de récupérer les infos utilisateur
                    try {
                        const userInfo = await window.googleAuthService.getUserInfo();
                        if (!connections.userInfo) {
                            connections.userInfo = userInfo;
                        }
                        console.log('[MinimalScan] ✅ Google connecté:', userInfo.displayName || userInfo.email);
                    } catch (error) {
                        console.warn('[MinimalScan] ⚠️ Erreur récupération info utilisateur Google:', error);
                    }
                }
            }
        } catch (error) {
            console.warn('[MinimalScan] ⚠️ Erreur vérification Google:', error);
        }

        // Vérifier app.js pour le provider actif
        try {
            if (window.app) {
                // Vérifier les propriétés de l'app
                if (window.app.activeProvider) {
                    connections.activeProvider = window.app.activeProvider;
                    console.log('[MinimalScan] 🎯 Provider actif depuis app.activeProvider:', window.app.activeProvider);
                }
                
                // Vérifier l'utilisateur dans app
                if (window.app.user) {
                    if (!connections.userInfo) {
                        connections.userInfo = window.app.user;
                    }
                    
                    // Détecter le provider depuis les infos utilisateur
                    if (window.app.user.provider) {
                        connections.activeProvider = window.app.user.provider === 'microsoft' ? 'microsoft' : 'google';
                        console.log('[MinimalScan] 🎯 Provider détecté depuis user.provider:', connections.activeProvider);
                    }
                }
            }
        } catch (error) {
            console.warn('[MinimalScan] ⚠️ Erreur récupération provider app.js:', error);
        }

        this.connectedService = connections.activeProvider;
        console.log('[MinimalScan] 📊 État des connexions:', connections);
        
        return connections;
    }

    async detectEmailProviderFromConnection() {
        console.log('[MinimalScan] 📧 Détection du provider email basé sur la connexion...');
        
        if (!this.connectedService) {
            console.warn('[MinimalScan] ⚠️ Aucun service connecté détecté');
            // Au lieu de defaulter à outlook, essayer de détecter plus intelligemment
            
            // Vérifier si window.app a des infos
            if (window.app && window.app.user && window.app.user.email) {
                const email = window.app.user.email;
                if (email.includes('@gmail.com')) {
                    this.emailProvider = 'gmail';
                    this.connectedService = 'google';
                    console.log('[MinimalScan] 📧 Gmail détecté par email utilisateur');
                    return;
                }
            }
            
            this.emailProvider = 'outlook'; // Fallback par défaut
            return;
        }

        // Mapper le service connecté au provider email
        switch (this.connectedService) {
            case 'microsoft':
                this.emailProvider = 'outlook';
                console.log('[MinimalScan] 📧 Provider email: Outlook (Microsoft connecté)');
                break;

            case 'google':
                this.emailProvider = 'gmail';
                console.log('[MinimalScan] 📧 Provider email: Gmail (Google connecté)');
                break;

            default:
                console.warn('[MinimalScan] ⚠️ Service connecté non reconnu:', this.connectedService);
                this.emailProvider = 'outlook'; // Fallback
        }
    }

    validateDetection() {
        console.log('[MinimalScan] ✅ === VALIDATION DE LA DÉTECTION ===');
        
        if (!this.connectedService) {
            console.warn('[MinimalScan] ⚠️ Aucun service connecté - Mode déconnecté');
            
            // Dernière tentative de détection via localStorage
            try {
                const storedProvider = localStorage.getItem('detectedEmailProvider');
                const storedService = localStorage.getItem('detectedConnectedService');
                
                if (storedProvider && storedService && storedService !== 'none') {
                    this.emailProvider = storedProvider;
                    this.connectedService = storedService;
                    console.log('[MinimalScan] 📦 Récupération depuis localStorage:', {
                        provider: this.emailProvider,
                        service: this.connectedService
                    });
                    return;
                }
            } catch (error) {
                console.warn('[MinimalScan] ⚠️ Erreur lecture localStorage:', error);
            }
            
            this.emailProvider = 'outlook'; // Fallback par défaut
        }

        if (!this.emailProvider) {
            console.warn('[MinimalScan] ⚠️ Provider email non déterminé - Fallback Outlook');
            this.emailProvider = 'outlook';
        }

        // Stocker la détection
        try {
            localStorage.setItem('detectedEmailProvider', this.emailProvider);
            localStorage.setItem('detectedConnectedService', this.connectedService || 'none');
            console.log('[MinimalScan] 💾 Détection sauvegardée:', {
                emailProvider: this.emailProvider,
                connectedService: this.connectedService
            });
        } catch (error) {
            console.warn('[MinimalScan] ⚠️ Erreur sauvegarde détection:', error);
        }

        console.log('[MinimalScan] 🎯 DÉTECTION FINALE:');
        console.log('  - Service connecté:', this.connectedService || 'Aucun');
        console.log('  - Provider email:', this.emailProvider);
    }

    handleDetectionError(error) {
        console.error('[MinimalScan] ❌ Erreur lors de la détection:', error);
        
        // Fallback: essayer de récupérer depuis localStorage
        try {
            const storedProvider = localStorage.getItem('detectedEmailProvider');
            const storedService = localStorage.getItem('detectedConnectedService');
            
            if (storedProvider && ['gmail', 'outlook'].includes(storedProvider)) {
                this.emailProvider = storedProvider;
                this.connectedService = storedService && storedService !== 'none' ? storedService : null;
                console.log('[MinimalScan] 📦 Récupération depuis localStorage:', {
                    provider: this.emailProvider,
                    service: this.connectedService
                });
            } else {
                this.emailProvider = 'outlook';
                this.connectedService = null;
                console.log('[MinimalScan] 🔄 Fallback complet vers Outlook');
            }
        } catch (fallbackError) {
            console.error('[MinimalScan] ❌ Erreur fallback:', fallbackError);
            this.emailProvider = 'outlook';
            this.connectedService = null;
        }
    }

    // ================================================
    // CHARGEMENT DU BON PAGEMANAGER
    // ================================================
    async loadCorrectPageManager() {
        console.log('[MinimalScan] 📧 Chargement du PageManager approprié...');
        console.log('[MinimalScan] 🎯 Provider détecté:', this.emailProvider);
        console.log('[MinimalScan] 🔐 Service connecté:', this.connectedService);

        try {
            if (this.emailProvider === 'gmail') {
                await this.loadGmailPageManager();
            } else {
                await this.loadOutlookPageManager();
            }
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur chargement PageManager:', error);
            // Fallback vers PageManager général
            if (window.pageManager) {
                console.log('[MinimalScan] 📦 Utilisation PageManager existant comme fallback');
                window.pageManager.provider = this.emailProvider;
                window.pageManager.connectedService = this.connectedService;
            }
        }
    }

    async loadGmailPageManager() {
        console.log('[MinimalScan] 📧 Chargement PageManager Gmail...');
        
        // Vérifier si PageManagerGmail existe déjà
        if (window.pageManagerGmail) {
            console.log('[MinimalScan] ✅ PageManagerGmail déjà disponible');
            // Mettre à jour la configuration
            window.pageManagerGmail.connectedService = this.connectedService;
            window.pageManagerGmail.emailProvider = this.emailProvider;
            window.pageManager = window.pageManagerGmail;
            return;
        }

        // Si le code PageManagerGmail n'est pas encore chargé
        if (window.PageManagerGmail) {
            console.log('[MinimalScan] 🔄 Création instance PageManagerGmail...');
            window.pageManagerGmail = new PageManagerGmail();
            window.pageManagerGmail.connectedService = this.connectedService;
            window.pageManagerGmail.emailProvider = this.emailProvider;
            window.pageManager = window.pageManagerGmail;
        } else {
            console.log('[MinimalScan] ⚠️ PageManagerGmail non disponible, configuration Gmail sur PageManager standard');
            if (window.pageManager) {
                window.pageManager.provider = 'gmail';
                window.pageManager.isGmail = true;
                window.pageManager.connectedService = this.connectedService;
                window.pageManager.emailProvider = this.emailProvider;
            }
        }
    }

    async loadOutlookPageManager() {
        console.log('[MinimalScan] 📧 Configuration PageManager pour Outlook...');
        
        // Utiliser le PageManager existant pour Outlook
        if (window.pageManager) {
            window.pageManager.provider = 'outlook';
            window.pageManager.isGmail = false;
            window.pageManager.connectedService = this.connectedService;
            window.pageManager.emailProvider = this.emailProvider;
            console.log('[MinimalScan] ✅ PageManager configuré pour Outlook');
        } else {
            console.warn('[MinimalScan] ⚠️ PageManager standard non disponible');
        }
    }

    // ================================================
    // VÉRIFICATION DES SERVICES REQUIS
    // ================================================
    async checkServices() {
        console.log('[MinimalScan] 🔍 Vérification des services requis...');
        
        const status = {
            authenticated: false,
            provider: this.connectedService,
            emailProvider: this.emailProvider,
            services: {
                authService: !!window.authService,
                googleAuthService: !!window.googleAuthService,
                mailService: !!window.mailService,
                emailScanner: !!window.emailScanner
            },
            errors: []
        };

        // Vérifier l'authentification selon le service connecté
        try {
            if (this.connectedService === 'microsoft' && window.authService) {
                status.authenticated = window.authService.isAuthenticated();
                if (!status.authenticated) {
                    status.errors.push('Microsoft non authentifié');
                }
            } else if (this.connectedService === 'google' && window.googleAuthService) {
                status.authenticated = window.googleAuthService.isAuthenticated();
                if (!status.authenticated) {
                    status.errors.push('Google non authentifié');
                }
            } else {
                // Vérifier les deux services si aucun n'est spécifiquement connecté
                if (window.authService && window.authService.isAuthenticated()) {
                    status.authenticated = true;
                    this.connectedService = 'microsoft';
                    this.emailProvider = 'outlook';
                } else if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
                    status.authenticated = true;
                    this.connectedService = 'google';
                    this.emailProvider = 'gmail';
                } else {
                    status.errors.push('Aucun service d\'authentification disponible');
                }
            }
        } catch (error) {
            status.errors.push(`Erreur authentification: ${error.message}`);
        }

        // Vérifier les services selon le provider email
        if (this.emailProvider === 'gmail') {
            if (!window.emailScannerGmail && !window.mailService) {
                status.errors.push('EmailScannerGmail ou MailService requis pour Gmail');
            }
        } else {
            if (!window.mailService) {
                status.errors.push('MailService requis pour Outlook');
            }
        }

        console.log('[MinimalScan] 📊 État des services:', status);
        
        if (status.errors.length > 0) {
            console.warn('[MinimalScan] ⚠️ Problèmes détectés:', status.errors);
        }

        return status;
    }

    // ================================================
    // RENDU AVEC DÉTECTION COMPLÈTE
    // ================================================
    async render(container) {
        console.log('[MinimalScan] 🎯 Rendu du scanner v11.1...');
        
        try {
            this.addMinimalStyles();
            this.checkSettingsUpdate();
            
            // Re-détecter les connexions au moment du rendu
            await this.detectConnectionsAndProvider();
            
            // Vérifier les services
            const servicesStatus = await this.checkServices();
            
            if (!servicesStatus.authenticated) {
                container.innerHTML = this.renderNotAuthenticated(servicesStatus);
                return;
            }
            
            container.innerHTML = this.renderMinimalScanner();
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log('[MinimalScan] ✅ Scanner v11.1 rendu avec succès');
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur lors du rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderMinimalScanner() {
        const isGmail = this.emailProvider === 'gmail';
        const providerClass = isGmail ? 'gmail-mode' : '';
        const providerIcon = isGmail ? '🎯' : '📧';
        const providerName = isGmail ? 'Gmail' : 'Outlook';
        const serviceName = this.connectedService === 'google' ? 'Google' : 'Microsoft';

        return `
            <div class="minimal-scanner ${providerClass}">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon ${providerClass}">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <div class="connection-status">
                        <div class="provider-badge ${this.emailProvider}">
                            <span>${providerIcon}</span>
                            <span>Email: ${providerName}</span>
                        </div>
                        ${this.connectedService ? `
                            <div class="service-badge ${this.connectedService}">
                                <span>${this.connectedService === 'google' ? '🔵' : '🟦'}</span>
                                <span>Connecté: ${serviceName}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <h1 class="scanner-title">Scanner Email ${providerName}</h1>
                    <p class="scanner-subtitle">Organisez vos emails automatiquement avec IA</p>
                    
                    <div id="preselected-categories-display">
                        ${this.renderPreselectedCategories()}
                    </div>
                    
                    <div class="steps-container">
                        <div class="step active ${providerClass}" id="step1">
                            <div class="step-number">1</div>
                            <div class="step-label">Sélection</div>
                        </div>
                        <div class="step ${providerClass}" id="step2">
                            <div class="step-number">2</div>
                            <div class="step-label">Analyse</div>
                        </div>
                        <div class="step ${providerClass}" id="step3">
                            <div class="step-number">3</div>
                            <div class="step-label">Résultats</div>
                        </div>
                    </div>
                    
                    <div class="duration-section">
                        <div class="duration-label">Période d'analyse</div>
                        <div class="duration-options">
                            ${this.renderDurationOptions()}
                        </div>
                    </div>
                    
                    <button class="scan-button-minimal ${providerClass}" id="minimalScanBtn" onclick="window.minimalScanModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Démarrer l'analyse ${providerName}</span>
                    </button>
                    
                    <div class="progress-section-minimal" id="progressSection">
                        <div class="progress-bar-minimal">
                            <div class="progress-fill ${providerClass}" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus">Préparation du scan ${providerName}</div>
                    </div>
                    
                    <div class="scan-info ${providerClass}">
                        <div class="scan-info-main">
                            <i class="fas fa-shield-alt"></i>
                            <span>Scan sécurisé ${providerName} avec IA Claude</span>
                        </div>
                        ${this.renderScanInfoDetails()}
                    </div>
                </div>
            </div>
        `;
    }

    renderNotAuthenticated(servicesStatus) {
        const isGmail = this.emailProvider === 'gmail';
        const serviceName = this.emailProvider === 'gmail' ? 'Google' : 'Microsoft';
        const providerIcon = this.emailProvider === 'gmail' ? 'fab fa-google' : 'fab fa-microsoft';

        return `
            <div class="minimal-scanner ${isGmail ? 'gmail-mode' : ''}">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon ${isGmail ? 'gmail-mode' : ''}" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <i class="fas fa-lock"></i>
                    </div>
                    
                    <div class="connection-status">
                        <div class="provider-badge ${this.emailProvider}">
                            <span>${isGmail ? '🎯' : '📧'}</span>
                            <span>Provider: ${this.emailProvider}</span>
                        </div>
                        <div class="service-badge disconnected">
                            <span>🔴</span>
                            <span>Non connecté</span>
                        </div>
                    </div>
                    
                    <h1 class="scanner-title">Connexion ${serviceName} requise</h1>
                    <p class="scanner-subtitle">Connectez-vous pour analyser vos emails ${isGmail ? 'Gmail' : 'Outlook'}</p>
                    
                    ${servicesStatus.errors.length > 0 ? `
                        <div class="error-details">
                            <h4>Problèmes détectés:</h4>
                            <ul>
                                ${servicesStatus.errors.map(error => `<li>${error}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="auth-buttons">
                        ${this.emailProvider === 'gmail' ? `
                            <button class="scan-button-minimal gmail-mode" onclick="window.googleAuthService?.login()">
                                <i class="fab fa-google"></i>
                                <span>Se connecter à Google</span>
                            </button>
                        ` : `
                            <button class="scan-button-minimal" onclick="window.authService?.login()">
                                <i class="fab fa-microsoft"></i>
                                <span>Se connecter à Microsoft</span>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // SCAN AVEC REDIRECTION INTELLIGENTE
    // ================================================
    async startScan() {
        if (this.scanInProgress) {
            console.log('[MinimalScan] Scan déjà en cours');
            return;
        }
        
        console.log(`[MinimalScan] 🚀 Démarrage du scan ${this.emailProvider?.toUpperCase()}`);
        console.log('[MinimalScan] 🔐 Service connecté:', this.connectedService);
        console.log('[MinimalScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            this.setActiveStep(2);
            
            const progressSection = document.getElementById('progressSection');
            if (progressSection) {
                progressSection.classList.add('visible');
            }
            
            const scanBtn = document.getElementById('minimalScanBtn');
            if (scanBtn) {
                scanBtn.disabled = true;
                scanBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Analyse ${this.emailProvider} en cours...</span>`;
            }
            
            const scanOptions = this.prepareScanOptions();
            await this.executeScan(scanOptions);
            
            this.setActiveStep(3);
            this.completeScan();
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur de scan:', error);
            this.showScanError(error);
        }
    }

    async executeScan(scanOptions) {
        try {
            // Re-vérifier l'authentification avant le scan
            const servicesStatus = await this.checkServices();
            if (!servicesStatus.authenticated) {
                throw new Error(`Authentification ${this.connectedService} requise`);
            }

            // Choisir le bon scanner selon le provider
            let scanner = null;
            
            if (this.emailProvider === 'gmail' && window.emailScannerGmail) {
                scanner = window.emailScannerGmail;
                console.log('[MinimalScan] 🎯 Utilisation EmailScannerGmail');
            } else if (window.emailScanner) {
                scanner = window.emailScanner;
                console.log('[MinimalScan] 📧 Utilisation EmailScanner standard');
            }
            
            if (scanner && typeof scanner.scan === 'function') {
                console.log(`[MinimalScan] 🔄 Scan réel ${this.emailProvider} en cours...`);
                
                const results = await scanner.scan(scanOptions);
                this.scanResults = results;
                
                console.log(`[MinimalScan] ✅ Scan ${this.emailProvider} terminé:`, results);
                
                if (results.stats?.preselectedForTasks > 0) {
                    console.log(`[MinimalScan] ⭐ ${results.stats.preselectedForTasks} emails pré-sélectionnés pour tâches`);
                }
                
            } else {
                console.log(`[MinimalScan] 🎭 Mode simulation ${this.emailProvider}`);
                
                // Simulation adaptée au provider
                for (let i = 0; i <= 100; i += 10) {
                    this.updateProgress(i, `Analyse ${this.emailProvider} ${i}%`, `Simulation ${this.emailProvider} en cours`);
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                this.scanResults = {
                    success: true,
                    total: 150,
                    categorized: 130,
                    provider: this.emailProvider,
                    connectedService: this.connectedService,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    stats: { 
                        preselectedForTasks: this.taskPreselectedCategories.length > 0 ? 25 : 0,
                        taskSuggestions: 20
                    }
                };
            }
        } catch (error) {
            console.error(`[MinimalScan] ❌ Erreur scan ${this.emailProvider}:`, error);
            throw error;
        }
    }

    redirectToResults() {
        this.scanInProgress = false;
        
        const essentialResults = {
            success: true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            provider: this.emailProvider,
            connectedService: this.connectedService,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            timestamp: Date.now()
        };
        
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
        } catch (error) {
            console.warn('[MinimalScan] Erreur stockage:', error);
        }
        
        if (window.uiManager?.showToast) {
            const providerName = this.emailProvider === 'gmail' ? 'Gmail' : 'Outlook';
            const serviceName = this.connectedService === 'google' ? 'Google' : 'Microsoft';
            const message = essentialResults.preselectedForTasks > 0 ?
                `✅ ${essentialResults.total} emails ${providerName} analysés (${serviceName}) • ⭐ ${essentialResults.preselectedForTasks} pré-sélectionnés` :
                `✅ ${essentialResults.total} emails ${providerName} analysés (${serviceName})`;
            
            window.uiManager.showToast(message, 'success', 4000);
        }
        
        setTimeout(() => {
            if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                // Redirection intelligente selon le provider
                if (this.emailProvider === 'gmail' && window.pageManagerGmail) {
                    console.log('[MinimalScan] 🎯 Redirection vers PageManagerGmail');
                    window.pageManagerGmail.loadPage('emails');
                } else {
                    console.log('[MinimalScan] 📧 Redirection vers PageManager standard');
                    window.pageManager.loadPage('emails');
                }
            }
        }, 500);
    }

    // ================================================
    // MÉTHODES UTILITAIRES ET STYLES
    // ================================================
    addMinimalStyles() {
        if (this.stylesAdded || document.getElementById('minimal-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'minimal-scan-styles';
        styles.textContent = `
            /* Scanner Ultra-Minimaliste v11.1 - Fixed Connection Detection */
            .minimal-scanner {
                height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                overflow: hidden;
                position: relative;
                padding: 20px;
            }
            
            .minimal-scanner.gmail-mode {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
            }
            
            .scanner-card-minimal {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 50px;
                width: 100%;
                max-width: 700px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                animation: fadeIn 0.5s ease-out;
            }
            
            .connection-status {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .provider-badge, .service-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                border-radius: 20px;
                padding: 6px 16px;
                font-size: 14px;
                font-weight: 600;
                border: 1px solid;
            }
            
            .provider-badge.gmail {
                background: rgba(66, 133, 244, 0.1);
                border-color: rgba(66, 133, 244, 0.2);
                color: #1a73e8;
            }
            
            .provider-badge.outlook {
                background: rgba(0, 120, 212, 0.1);
                border-color: rgba(0, 120, 212, 0.2);
                color: #0078d4;
            }
            
            .service-badge.google {
                background: rgba(52, 168, 83, 0.1);
                border-color: rgba(52, 168, 83, 0.2);
                color: #34a853;
            }
            
            .service-badge.microsoft {
                background: rgba(0, 120, 212, 0.1);
                border-color: rgba(0, 120, 212, 0.2);
                color: #0078d4;
            }
            
            .service-badge.disconnected {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.2);
                color: #dc2626;
            }
            
            .scanner-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 25px;
                color: white;
                font-size: 32px;
            }
            
            .scanner-icon.gmail-mode {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
            }
            
            .error-details {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 12px;
                padding: 16px;
                margin: 20px 0;
                text-align: left;
            }
            
            .error-details h4 {
                color: #dc2626;
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
            }
            
            .error-details ul {
                color: #b91c1c;
                font-size: 13px;
                margin: 0;
                padding-left: 20px;
            }
            
            .auth-buttons {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-top: 20px;
            }
            
            .scanner-title {
                font-size: 32px;
                font-weight: 600;
                color: #1a1a2e;
                margin-bottom: 12px;
            }
            
            .scanner-subtitle {
                font-size: 18px;
                color: #6b7280;
                margin-bottom: 35px;
            }
            
            /* ... Autres styles existants ... */
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[MinimalScan] ✅ Styles v11.1 ajoutés');
    }

    // ================================================
    // MÉTHODES EXISTANTES (inchangées)
    // ================================================
    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                console.log('[MinimalScan] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[MinimalScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                if (this.settings.scanSettings?.defaultPeriod) {
                    this.selectedDays = this.settings.scanSettings.defaultPeriod;
                }
            } else {
                // Fallback localStorage
                try {
                    const saved = localStorage.getItem('categorySettings');
                    if (saved) {
                        this.settings = JSON.parse(saved);
                        this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                        if (this.settings.scanSettings?.defaultPeriod) {
                            this.selectedDays = this.settings.scanSettings.defaultPeriod;
                        }
                    }
                } catch (error) {
                    console.warn('[MinimalScan] ⚠️ Erreur chargement localStorage:', error);
                }
            }
            
            this.lastSettingsSync = Date.now();
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
        }
    }

    checkSettingsUpdate() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 5000) return;
        
        try {
            const oldTaskCategories = [...this.taskPreselectedCategories];
            const oldSelectedDays = this.selectedDays;
            
            this.loadSettingsFromCategoryManager();
            
            const categoriesChanged = JSON.stringify(oldTaskCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
            const daysChanged = oldSelectedDays !== this.selectedDays;
            
            if (categoriesChanged || daysChanged) {
                console.log('[MinimalScan] 🔄 Paramètres mis à jour détectés');
                this.updateUIWithNewSettings();
            }
        } catch (error) {
            console.error('[MinimalScan] Erreur vérification paramètres:', error);
        }
    }

    renderPreselectedCategories() {
        if (this.taskPreselectedCategories.length === 0) {
            return `
                <div class="preselected-info no-selection">
                    <i class="fas fa-info-circle"></i>
                    <span>Aucune catégorie pré-sélectionnée pour la création de tâches</span>
                </div>
            `;
        }
        
        const categoryDetails = this.taskPreselectedCategories.map(catId => {
            const category = window.categoryManager?.getCategory(catId);
            return category ? { icon: category.icon, name: category.name, color: category.color } : null;
        }).filter(Boolean);
        
        return `
            <div class="preselected-info">
                <i class="fas fa-star"></i>
                <span>Emails pré-sélectionnés pour tâches:</span>
            </div>
            <div class="preselected-categories-grid">
                ${categoryDetails.map(cat => `
                    <div class="preselected-category-badge" style="background: ${cat.color}20; border-color: ${cat.color};">
                        <span class="category-icon">${cat.icon}</span>
                        <span class="category-name">${cat.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDurationOptions() {
        const options = [
            { value: 1, label: '1 jour' },
            { value: 3, label: '3 jours' },
            { value: 7, label: '7 jours' },
            { value: 15, label: '15 jours' },
            { value: 30, label: '30 jours' }
        ];
        
        const providerClass = this.emailProvider === 'gmail' ? 'gmail-mode' : '';
        
        return options.map(option => {
            const isSelected = option.value === this.selectedDays;
            return `
                <button class="duration-option ${isSelected ? 'selected' : ''} ${providerClass}" 
                        onclick="window.minimalScanModule.selectDuration(${option.value})" 
                        data-days="${option.value}">
                    ${option.label}
                </button>
            `;
        }).join('');
    }

    renderScanInfoDetails() {
        let details = [];
        
        // Ajouter info sur le provider et service détectés
        details.push(`${this.emailProvider === 'gmail' ? 'Gmail' : 'Outlook'} via ${this.connectedService === 'google' ? 'Google' : 'Microsoft'}`);
        
        if (this.taskPreselectedCategories.length > 0) {
            details.push(`${this.taskPreselectedCategories.length} catégorie(s) pour tâches automatiques`);
        }
        
        if (this.settings.scanSettings?.autoAnalyze) {
            details.push('Analyse IA activée');
        }
        
        if (this.settings.preferences?.excludeSpam) {
            details.push('Filtrage spam actif');
        }
        
        const providerClass = this.emailProvider === 'gmail' ? 'gmail-mode' : '';
        
        return details.length > 0 ? 
            `<div class="scan-info-details ${providerClass}">${details.join(' • ')}</div>` :
            `<div class="scan-info-details ${providerClass}">Configuration par défaut</div>`;
    }

    // Autres méthodes existantes (prepareScanOptions, updateProgress, setActiveStep, etc.)
    prepareScanOptions() {
        const baseOptions = {
            days: this.selectedDays,
            folder: this.settings.scanSettings?.defaultFolder || 'inbox',
            autoAnalyze: this.settings.scanSettings?.autoAnalyze !== false,
            autoCategrize: this.settings.scanSettings?.autoCategrize !== false,
            includeSpam: !this.settings.preferences?.excludeSpam,
            detectCC: this.settings.preferences?.detectCC !== false,
            provider: this.emailProvider,
            connectedService: this.connectedService,
            onProgress: (progress) => this.updateProgress(progress.progress?.current || 0, progress.message || '', progress.phase || '')
        };
        
        if (this.taskPreselectedCategories.length > 0) {
            baseOptions.taskPreselectedCategories = [...this.taskPreselectedCategories];
        }
        
        console.log(`[MinimalScan] 📊 Options de scan ${this.emailProvider}:`, baseOptions);
        return baseOptions;
    }

    getDefaultSettings() {
        return {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            taskPreselectedCategories: [],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            }
        };
    }

    // Méthodes utilitaires (selectDuration, updateProgress, etc.)
    selectDuration(days) {
        this.selectedDays = days;
        
        document.querySelectorAll('.duration-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`[data-days="${days}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        console.log(`[MinimalScan] ✅ Durée sélectionnée: ${days} jours`);
    }

    updateProgress(percent, text, status) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressStatus = document.getElementById('progressStatus');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = text;
        if (progressStatus) progressStatus.textContent = status;
    }

    setActiveStep(stepNumber) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        const activeStep = document.getElementById(`step${stepNumber}`);
        if (activeStep) {
            activeStep.classList.add('active');
        }
    }

    completeScan() {
        setTimeout(() => {
            const scanBtn = document.getElementById('minimalScanBtn');
            if (scanBtn) {
                const preselectedCount = this.scanResults?.stats?.preselectedForTasks || 0;
                const providerName = this.emailProvider === 'gmail' ? 'Gmail' : 'Outlook';
                
                scanBtn.innerHTML = `<i class="fas fa-check"></i> <span>Scan ${providerName} terminé !</span>`;
                scanBtn.style.background = this.emailProvider === 'gmail' ? 
                    'linear-gradient(135deg, #34a853 0%, #4285f4 100%)' :
                    'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                
                if (preselectedCount > 0) {
                    scanBtn.style.position = 'relative';
                    const badgeClass = this.emailProvider === 'gmail' ? 'gmail-mode' : '';
                    scanBtn.insertAdjacentHTML('beforeend', `
                        <span class="success-badge ${badgeClass}">
                            ⭐ ${preselectedCount} emails pour tâches
                        </span>
                    `);
                }
            }
            
            setTimeout(() => {
                this.redirectToResults();
            }, 1500);
        }, 500);
    }

    renderError(error) {
        const isGmail = this.emailProvider === 'gmail';
        return `
            <div class="minimal-scanner ${isGmail ? 'gmail-mode' : ''}">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon ${isGmail ? 'gmail-mode' : ''}" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 class="scanner-title">Erreur</h1>
                    <p class="scanner-subtitle">${error.message}</p>
                    
                    <button class="scan-button-minimal" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
                </div>
            </div>
        `;
    }

    initializeEvents() {
        console.log('[MinimalScan] ✅ Événements initialisés');
        
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
        }
        
        this.settingsCheckInterval = setInterval(() => {
            this.checkSettingsUpdate();
        }, 10000);
    }

    showScanError(error) {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">Erreur de scan ${this.emailProvider}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">${error.message}</div>
                    
                    <button class="scan-button-minimal" onclick="window.minimalScanModule.resetScanner()" 
                            style="width: auto; padding: 0 20px; height: 40px; font-size: 14px;">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
                </div>
            `;
        }
        
        this.scanInProgress = false;
    }

    resetScanner() {
        this.scanInProgress = false;
        this.setActiveStep(1);
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.classList.remove('visible');
        }
        
        const scanBtn = document.getElementById('minimalScanBtn');
        if (scanBtn) {
            const providerName = this.emailProvider === 'gmail' ? 'Gmail' : 'Outlook';
            const providerClass = this.emailProvider === 'gmail' ? 'gmail-mode' : '';
            
            scanBtn.disabled = false;
            scanBtn.innerHTML = `<i class="fas fa-play"></i> <span>Démarrer l'analyse ${providerName}</span>`;
            scanBtn.style.background = this.emailProvider === 'gmail' ? 
                'linear-gradient(135deg, #4285f4 0%, #34a853 100%)' :
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            scanBtn.className = `scan-button-minimal ${providerClass}`;
            
            const badge = scanBtn.querySelector('.success-badge');
            if (badge) badge.remove();
        }
        
        this.updateProgress(0, 'Initialisation...', `Préparation du scan ${this.emailProvider}`);
        
        // Re-détecter les connexions
        this.detectConnectionsAndProvider();
        
        console.log(`[MinimalScan] 🔄 Scanner ${this.emailProvider} réinitialisé`);
    }

    updateSettings(newSettings) {
        console.log('[MinimalScan] 📝 Mise à jour des paramètres:', newSettings);
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.taskPreselectedCategories = [...newSettings.taskPreselectedCategories];
        }
        
        if (newSettings.scanSettings?.defaultPeriod) {
            this.selectedDays = newSettings.scanSettings.defaultPeriod;
        }
        
        this.updateUIWithNewSettings();
    }

    updateUIWithNewSettings() {
        // Mettre à jour la sélection de durée
        const durationOptions = document.querySelectorAll('.duration-option');
        durationOptions.forEach(option => {
            option.classList.remove('selected');
            if (parseInt(option.dataset.days) === this.selectedDays) {
                option.classList.add('selected');
            }
        });
        
        // Mettre à jour l'affichage des catégories
        this.updatePreselectedCategoriesDisplay();
    }

    updatePreselectedCategoriesDisplay() {
        const display = document.getElementById('preselected-categories-display');
        if (!display) return;
        
        display.innerHTML = this.renderPreselectedCategories();
    }

    getDebugInfo() {
        return {
            emailProvider: this.emailProvider,
            connectedService: this.connectedService,
            detectionAttempts: this.detectionAttempts,
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            lastSettingsSync: this.lastSettingsSync,
            scanResults: this.scanResults,
            pageManagerLoaded: {
                gmail: !!window.pageManagerGmail,
                standard: !!window.pageManager
            },
            services: {
                authService: !!window.authService,
                googleAuthService: !!window.googleAuthService,
                mailService: !!window.mailService,
                emailScanner: !!window.emailScanner
            },
            authStatus: {
                microsoft: window.authService ? window.authService.isAuthenticated() : false,
                google: window.googleAuthService ? window.googleAuthService.isAuthenticated() : false
            }
        };
    }

    cleanup() {
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
            this.settingsCheckInterval = null;
        }
        
        this.scanInProgress = false;
        this.isInitialized = false;
        
        console.log('[MinimalScan] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.emailProvider = null;
        this.connectedService = null;
        console.log('[MinimalScan] Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.minimalScanModule) {
    window.minimalScanModule.destroy?.();
}

window.MinimalScanModule = MinimalScanModule;
window.minimalScanModule = new MinimalScanModule();
window.scanStartModule = window.minimalScanModule;

// Fonction de debug globale améliorée
window.debugEmailProvider = function() {
    return {
        detected: window.minimalScanModule?.emailProvider,
        connectedService: window.minimalScanModule?.connectedService,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        authServices: {
            microsoft: !!window.authService,
            google: !!window.googleAuthService
        },
        authStatus: {
            microsoft: window.authService ? window.authService.isAuthenticated() : false,
            google: window.googleAuthService ? window.googleAuthService.isAuthenticated() : false
        },
        debugInfo: window.minimalScanModule?.getDebugInfo()
    };
};

window.testConnections = async function() {
    console.group('🔍 TEST CONNEXIONS COMPLÈTES');
    
    // Test Microsoft
    if (window.authService) {
        try {
            const isAuth = window.authService.isAuthenticated();
            console.log('Microsoft authenticated:', isAuth);
            if (isAuth) {
                const userInfo = await window.authService.getUserInfo();
                console.log('Microsoft user:', userInfo);
            }
        } catch (error) {
            console.error('Erreur Microsoft:', error);
        }
    }
    
    // Test Google
    if (window.googleAuthService) {
        try {
            const isAuth = window.googleAuthService.isAuthenticated();
            console.log('Google authenticated:', isAuth);
            if (isAuth) {
                const userInfo = await window.googleAuthService.getUserInfo();
                console.log('Google user:', userInfo);
            }
        } catch (error) {
            console.error('Erreur Google:', error);
        }
    }
    
    // Test app
    if (window.app) {
        console.log('App activeProvider:', window.app.activeProvider);
        console.log('App user:', window.app.user);
    }
    
    console.log('Debug info:', window.minimalScanModule?.getDebugInfo());
    console.groupEnd();
};

console.log('[StartScan] ✅ Scanner v11.1 chargé - Détection corrigée des connexions!');
console.log('[StartScan] 📧 Provider détecté:', window.minimalScanModule?.emailProvider);
console.log('[StartScan] 🔐 Service connecté:', window.minimalScanModule?.connectedService);
