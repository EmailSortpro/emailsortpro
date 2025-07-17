// StartScan.js - Version 12.0 - Refonte complète avec synchronisation correcte
// Résout les problèmes d'authentification et de coordination avec PageManager

console.log('[StartScan] 🚀 Loading StartScan.js v12.0 - Refonte complète...');

class StartScanModule {
    constructor() {
        this.version = '12.0';
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.currentProvider = null;
        this.scanResults = null;
        this.authCache = {
            gmail: false,
            outlook: false,
            lastCheck: 0
        };
        
        console.log('[StartScan] ✅ Module v12.0 initialisé');
        this.init();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async init() {
        try {
            // 1. Détecter le provider actif
            await this.detectActiveProvider();
            
            // 2. Charger les paramètres
            this.loadSettings();
            
            // 3. Ajouter les styles
            this.addStyles();
            
            // 4. Écouter les événements
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[StartScan] ✅ Initialisation complète');
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur initialisation:', error);
        }
    }

    // ================================================
    // DÉTECTION DU PROVIDER
    // ================================================
    async detectActiveProvider() {
        console.log('[StartScan] 🔍 Détection du provider actif...');
        
        // Reset cache si trop vieux
        if (Date.now() - this.authCache.lastCheck > 30000) {
            this.authCache = {
                gmail: false,
                outlook: false,
                lastCheck: Date.now()
            };
        }
        
        // Vérifier Gmail
        if (this.checkGmailAuth()) {
            this.currentProvider = 'gmail';
            this.authCache.gmail = true;
            console.log('[StartScan] ✅ Gmail détecté et authentifié');
            return;
        }
        
        // Vérifier Outlook
        if (this.checkOutlookAuth()) {
            this.currentProvider = 'outlook';
            this.authCache.outlook = true;
            console.log('[StartScan] ✅ Outlook détecté et authentifié');
            return;
        }
        
        // Aucun provider authentifié
        this.currentProvider = null;
        console.log('[StartScan] ⚠️ Aucun provider authentifié détecté');
    }

    checkGmailAuth() {
        // Vérifier différentes sources d'auth Gmail
        if (window.googleAuthService?.isAuthenticated) {
            const isAuth = typeof window.googleAuthService.isAuthenticated === 'function' 
                ? window.googleAuthService.isAuthenticated() 
                : window.googleAuthService.isAuthenticated;
            if (isAuth) return true;
        }
        
        // Vérifier le token en localStorage
        try {
            const token = localStorage.getItem('google_token_emailsortpro');
            if (token) {
                const tokenData = JSON.parse(token);
                if (tokenData.access_token && tokenData.expires_at > Date.now()) {
                    return true;
                }
            }
        } catch (e) {}
        
        // Vérifier si des emails Gmail sont déjà en cache
        if (window.emailScanner?.emails?.length > 0) {
            const hasGmailEmails = window.emailScanner.emails.some(email => 
                !email.provider || email.provider === 'google' || email.provider === 'gmail'
            );
            if (hasGmailEmails) return true;
        }
        
        return false;
    }

    checkOutlookAuth() {
        // Vérifier différentes sources d'auth Outlook
        if (window.authService?.isAuthenticated) {
            const isAuth = typeof window.authService.isAuthenticated === 'function' 
                ? window.authService.isAuthenticated() 
                : window.authService.isAuthenticated;
            if (isAuth) return true;
        }
        
        // Vérifier le token MSAL
        try {
            const msalKey = Object.keys(localStorage).find(key => key.includes('msal') && key.includes('accesstoken'));
            if (msalKey) {
                const tokenData = JSON.parse(localStorage.getItem(msalKey));
                if (tokenData && tokenData.expiresOn > Date.now() / 1000) {
                    return true;
                }
            }
        } catch (e) {}
        
        // Vérifier si des emails Outlook sont déjà en cache
        if (window.emailScannerOutlook?.emails?.length > 0) {
            return true;
        }
        
        // Fallback EmailScanner avec provider outlook
        if (window.emailScanner?.emails?.length > 0) {
            const hasOutlookEmails = window.emailScanner.emails.some(email => 
                email.provider === 'microsoft' || email.provider === 'outlook'
            );
            if (hasOutlookEmails) return true;
        }
        
        return false;
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
    // ================================================
    loadSettings() {
        try {
            // Charger depuis CategoryManager si disponible
            if (window.categoryManager?.getSettings) {
                const settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = settings.taskPreselectedCategories || [];
                
                // Charger la période par défaut
                if (settings.scanSettings?.defaultPeriod && settings.scanSettings.defaultPeriod > 0) {
                    this.selectedDays = settings.scanSettings.defaultPeriod;
                }
            } else {
                // Fallback localStorage
                const saved = localStorage.getItem('categorySettings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    this.taskPreselectedCategories = settings.taskPreselectedCategories || [];
                }
            }
            
            // Charger la dernière sélection utilisateur
            const lastSelection = localStorage.getItem('scanLastSelection');
            if (lastSelection) {
                const data = JSON.parse(lastSelection);
                if (data.selectedDays > 0) {
                    this.selectedDays = data.selectedDays;
                }
            }
            
        } catch (error) {
            console.error('[StartScan] Erreur chargement paramètres:', error);
            this.taskPreselectedCategories = [];
        }
    }

    // ================================================
    // RENDU PRINCIPAL
    // ================================================
    async render(container) {
        console.log('[StartScan] 🎨 Rendu du scanner...');
        
        try {
            // Réinitialiser l'état
            this.scanInProgress = false;
            
            // Détecter le provider
            await this.detectActiveProvider();
            
            if (!this.currentProvider) {
                container.innerHTML = this.renderWelcomeState();
            } else {
                container.innerHTML = this.renderScannerUI();
            }
            
            // Initialiser les événements après le rendu
            this.initializeUIEvents();
            
        } catch (error) {
            console.error('[StartScan] Erreur rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderWelcomeState() {
        return `
            <div class="scanner-container">
                <div class="scanner-card">
                    <div class="scanner-icon">
                        <i class="fas fa-envelope-open-text"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner d'Emails</h1>
                    <p class="scanner-subtitle">Connectez-vous pour analyser vos emails</p>
                    
                    <div class="auth-buttons">
                        <button class="auth-btn gmail" onclick="window.scanStartModule.loginGmail()">
                            <i class="fab fa-google"></i>
                            <span>Gmail</span>
                        </button>
                        
                        <button class="auth-btn outlook" onclick="window.scanStartModule.loginOutlook()">
                            <i class="fab fa-microsoft"></i>
                            <span>Outlook</span>
                        </button>
                    </div>
                    
                    <div class="scanner-info">
                        <div class="scanner-info-main">
                            <i class="fas fa-shield-alt"></i>
                            <span>Analyse sécurisée avec IA Claude</span>
                        </div>
                        <div class="scanner-info-details">
                            Support Gmail & Outlook • Catégorisation intelligente • Création de tâches automatique
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderScannerUI() {
        const providerName = this.currentProvider === 'gmail' ? 'Gmail' : 'Outlook';
        const providerIcon = this.currentProvider === 'gmail' ? 'fab fa-google' : 'fab fa-microsoft';
        
        return `
            <div class="scanner-container">
                <div class="scanner-card">
                    <div class="scanner-icon ${this.currentProvider}">
                        <i class="${providerIcon}"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner ${providerName}</h1>
                    <p class="scanner-subtitle">Analysez vos emails ${providerName}</p>
                    
                    ${this.renderPreselectedCategories()}
                    
                    <div class="scan-steps">
                        <div class="step active" id="step1">
                            <div class="step-number">1</div>
                            <div class="step-label">Configuration</div>
                        </div>
                        <div class="step" id="step2">
                            <div class="step-number">2</div>
                            <div class="step-label">Analyse</div>
                        </div>
                        <div class="step" id="step3">
                            <div class="step-number">3</div>
                            <div class="step-label">Résultats</div>
                        </div>
                    </div>
                    
                    <div class="duration-section">
                        <h3>Période d'analyse</h3>
                        <div class="duration-options">
                            ${this.renderDurationOptions()}
                        </div>
                    </div>
                    
                    <button class="scan-btn ${this.currentProvider}" id="scanBtn" onclick="window.scanStartModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Démarrer l'analyse</span>
                    </button>
                    
                    <div class="progress-section" id="progressSection" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                    </div>
                    
                    <div class="scanner-info">
                        <div class="scanner-info-main">
                            <i class="fas fa-info-circle"></i>
                            <span>Scan illimité • Catégorisation IA • Création de tâches</span>
                        </div>
                        ${this.taskPreselectedCategories?.length > 0 ? 
                            `<div class="scanner-info-details">${this.taskPreselectedCategories.length} catégorie(s) pour tâches automatiques</div>` : 
                            ''
                        }
                    </div>
                </div>
            </div>
        `;
    }

    renderPreselectedCategories() {
        if (!this.taskPreselectedCategories || this.taskPreselectedCategories.length === 0) {
            return '';
        }
        
        const categories = this.taskPreselectedCategories.map(catId => {
            const cat = window.categoryManager?.getCategory?.(catId);
            return cat || { name: catId, icon: '📌', color: '#6b7280' };
        });
        
        return `
            <div class="preselected-info">
                <i class="fas fa-star"></i>
                <span>Catégories pour tâches automatiques:</span>
                <div class="preselected-badges">
                    ${categories.map(cat => `
                        <span class="category-badge" style="background: ${cat.color}20; color: ${cat.color};">
                            ${cat.icon} ${cat.name}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderDurationOptions() {
        const options = [
            { value: 1, label: '1 jour' },
            { value: 3, label: '3 jours' },
            { value: 7, label: '7 jours' },
            { value: 15, label: '15 jours' },
            { value: 30, label: '30 jours' },
            { value: 90, label: '3 mois' }
        ];
        
        return options.map(opt => `
            <button class="duration-btn ${opt.value === this.selectedDays ? 'active' : ''}"
                    data-days="${opt.value}"
                    onclick="window.scanStartModule.selectDuration(${opt.value})">
                ${opt.label}
            </button>
        `).join('');
    }

    renderError(error) {
        return `
            <div class="scanner-container">
                <div class="scanner-card error">
                    <div class="scanner-icon error">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 class="scanner-title">Erreur</h1>
                    <p class="scanner-subtitle">${error.message}</p>
                    <button class="scan-btn" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        <span>Recharger</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DU SCAN
    // ================================================
    async startScan() {
        if (this.scanInProgress) {
            console.log('[StartScan] Scan déjà en cours');
            return;
        }
        
        console.log('[StartScan] 🚀 Démarrage du scan...');
        console.log('[StartScan] Provider:', this.currentProvider);
        console.log('[StartScan] Période:', this.selectedDays, 'jours');
        
        try {
            this.scanInProgress = true;
            this.setStep(2);
            
            // Afficher la progression
            const progressSection = document.getElementById('progressSection');
            if (progressSection) progressSection.style.display = 'block';
            
            // Désactiver le bouton
            const scanBtn = document.getElementById('scanBtn');
            if (scanBtn) {
                scanBtn.disabled = true;
                scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyse en cours...</span>';
            }
            
            // Préparer les options
            const scanOptions = {
                days: this.selectedDays,
                provider: this.currentProvider,
                maxResults: -1, // Pas de limite
                taskPreselectedCategories: this.taskPreselectedCategories || [],
                onProgress: (progress) => this.updateProgress(progress)
            };
            
            // Exécuter le scan
            const results = await this.executeScan(scanOptions);
            this.scanResults = results;
            
            // Scan terminé
            this.setStep(3);
            this.onScanComplete(results);
            
        } catch (error) {
            console.error('[StartScan] Erreur scan:', error);
            this.onScanError(error);
        }
    }

    async executeScan(options) {
        console.log('[StartScan] 🔄 Exécution du scan...');
        
        // Sélectionner le bon scanner
        let scanner = null;
        let emails = [];
        
        if (this.currentProvider === 'gmail') {
            // Pour Gmail, utiliser EmailScanner
            if (window.emailScanner?.scan) {
                scanner = window.emailScanner;
            } else if (window.EmailScanner) {
                scanner = new window.EmailScanner();
                window.emailScanner = scanner;
            }
            
            if (!scanner) {
                throw new Error('Scanner Gmail non disponible');
            }
            
        } else if (this.currentProvider === 'outlook') {
            // Pour Outlook, préférer EmailScannerOutlook
            if (window.emailScannerOutlook?.scan) {
                scanner = window.emailScannerOutlook;
            } else if (window.EmailScannerOutlook) {
                scanner = new window.EmailScannerOutlook();
                window.emailScannerOutlook = scanner;
            } else if (window.emailScanner) {
                // Fallback vers EmailScanner générique
                scanner = window.emailScanner;
            }
            
            if (!scanner) {
                throw new Error('Scanner Outlook non disponible');
            }
        }
        
        // Exécuter le scan
        const results = await scanner.scan(options);
        
        // S'assurer que les emails sont stockés correctement
        if (results.emails && results.emails.length > 0) {
            if (this.currentProvider === 'gmail') {
                // Stocker dans EmailScanner
                if (window.emailScanner) {
                    window.emailScanner.emails = results.emails;
                    window.emailScanner.startScanSynced = true;
                }
                
                // Stocker aussi en localStorage pour PageManagerGmail
                try {
                    localStorage.setItem('gmailEmails', JSON.stringify(results.emails));
                    localStorage.setItem('gmailScanResults', JSON.stringify({
                        total: results.total,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    console.warn('[StartScan] Erreur stockage localStorage');
                }
                
            } else if (this.currentProvider === 'outlook') {
                // Créer EmailScannerOutlook si nécessaire
                if (!window.emailScannerOutlook) {
                    window.emailScannerOutlook = {
                        emails: [],
                        getAllEmails: function() { return this.emails; },
                        provider: 'outlook'
                    };
                }
                
                // Stocker dans EmailScannerOutlook
                window.emailScannerOutlook.emails = results.emails;
                window.emailScannerOutlook.startScanSynced = true;
                
                // Aussi dans EmailScanner comme fallback
                if (window.emailScanner) {
                    window.emailScanner.emails = results.emails;
                    window.emailScanner.provider = 'outlook';
                }
            }
            
            // Stocker en sessionStorage si possible
            try {
                if (results.emails.length < 100) {
                    sessionStorage.setItem('scannedEmails', JSON.stringify(results.emails));
                }
                sessionStorage.setItem('scanResults', JSON.stringify({
                    success: true,
                    total: results.total,
                    provider: this.currentProvider,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('[StartScan] SessionStorage plein');
            }
        }
        
        return results;
    }

    updateProgress(progress) {
        const percent = progress.progress?.current || progress.percent || 0;
        const message = progress.message || progress.text || 'Analyse en cours...';
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = message;
    }

    // ================================================
    // GESTION DES RÉSULTATS
    // ================================================
    onScanComplete(results) {
        console.log('[StartScan] ✅ Scan terminé:', results);
        
        const scanBtn = document.getElementById('scanBtn');
        if (scanBtn) {
            scanBtn.innerHTML = '<i class="fas fa-check"></i> <span>Scan terminé!</span>';
            scanBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        }
        
        // Notification
        if (window.uiManager?.showToast) {
            const message = `✅ ${results.total} emails analysés`;
            window.uiManager.showToast(message, 'success');
        }
        
        // Déclencher les événements
        this.dispatchScanComplete(results);
        
        // Redirection après un court délai
        setTimeout(() => {
            this.redirectToEmails();
        }, 1000);
    }

    onScanError(error) {
        console.error('[StartScan] ❌ Erreur scan:', error);
        
        this.scanInProgress = false;
        
        const scanBtn = document.getElementById('scanBtn');
        if (scanBtn) {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="fas fa-redo"></i> <span>Réessayer</span>';
        }
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast('Erreur: ' + error.message, 'error');
        }
    }

    dispatchScanComplete(results) {
        // Événement pour EmailScanner
        window.dispatchEvent(new CustomEvent('scanCompleted', {
            detail: {
                ...results,
                provider: this.currentProvider,
                timestamp: Date.now()
            }
        }));
        
        // Événement pour PageManager
        window.dispatchEvent(new CustomEvent('emailScannerReady', {
            detail: {
                provider: this.currentProvider,
                emailCount: results.total,
                timestamp: Date.now()
            }
        }));
        
        // Événement spécifique au provider
        if (this.currentProvider === 'gmail') {
            window.dispatchEvent(new CustomEvent('gmailScanComplete', {
                detail: results
            }));
        } else if (this.currentProvider === 'outlook') {
            window.dispatchEvent(new CustomEvent('outlookScanComplete', {
                detail: results
            }));
        }
    }

    redirectToEmails() {
        console.log('[StartScan] 🔄 Redirection vers les emails...');
        
        // Essayer de déterminer quel PageManager utiliser
        if (this.currentProvider === 'gmail' && window.pageManagerGmail) {
            console.log('[StartScan] Utilisation PageManagerGmail');
            window.pageManagerGmail.loadPage('emails');
        } else if (this.currentProvider === 'outlook' && window.pageManagerOutlook) {
            console.log('[StartScan] Utilisation PageManagerOutlook');
            window.pageManagerOutlook.loadPage('emails');
        } else if (window.pageManager) {
            console.log('[StartScan] Utilisation PageManager générique');
            window.pageManager.loadPage('emails');
        } else {
            console.log('[StartScan] Redirection par URL');
            window.location.href = '#emails';
            setTimeout(() => window.location.reload(), 100);
        }
    }

    // ================================================
    // MÉTHODES UI
    // ================================================
    selectDuration(days) {
        this.selectedDays = days;
        
        // Mettre à jour l'UI
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.days) === days);
        });
        
        // Sauvegarder la sélection
        localStorage.setItem('scanLastSelection', JSON.stringify({
            selectedDays: days,
            timestamp: Date.now()
        }));
    }

    setStep(stepNumber) {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index < stepNumber);
        });
    }

    async loginGmail() {
        console.log('[StartScan] 🔐 Login Gmail...');
        
        try {
            if (window.googleAuthService?.login) {
                await window.googleAuthService.login();
            } else if (window.googleAuthService?.signIn) {
                await window.googleAuthService.signIn();
            }
            
            // Réactualiser après login
            await this.detectActiveProvider();
            
            // Re-rendre si on est sur la page scanner
            const container = document.querySelector('.scanner-container')?.parentElement;
            if (container) {
                await this.render(container);
            }
            
        } catch (error) {
            console.error('[StartScan] Erreur login Gmail:', error);
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Erreur connexion Gmail', 'error');
            }
        }
    }

    async loginOutlook() {
        console.log('[StartScan] 🔐 Login Outlook...');
        
        try {
            if (window.authService?.login) {
                await window.authService.login();
            } else if (window.authService?.signIn) {
                await window.authService.signIn();
            }
            
            // Réactualiser après login
            await this.detectActiveProvider();
            
            // Re-rendre si on est sur la page scanner
            const container = document.querySelector('.scanner-container')?.parentElement;
            if (container) {
                await this.render(container);
            }
            
        } catch (error) {
            console.error('[StartScan] Erreur login Outlook:', error);
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Erreur connexion Outlook', 'error');
            }
        }
    }

    // ================================================
    // EVENT LISTENERS
    // ================================================
    setupEventListeners() {
        // Écouter les changements d'authentification
        window.addEventListener('googleAuthSuccess', () => {
            console.log('[StartScan] Google Auth Success détecté');
            this.detectActiveProvider();
        });
        
        window.addEventListener('outlookAuthSuccess', () => {
            console.log('[StartScan] Outlook Auth Success détecté');
            this.detectActiveProvider();
        });
        
        // Écouter les changements de paramètres
        window.addEventListener('settingsChanged', (event) => {
            if (event.detail?.type === 'taskPreselectedCategories') {
                this.taskPreselectedCategories = event.detail.value || [];
                this.updatePreselectedCategoriesUI();
            }
        });
    }

    initializeUIEvents() {
        // Les événements sont déjà attachés via onclick dans le HTML
        console.log('[StartScan] UI events initialisés');
    }

    updatePreselectedCategoriesUI() {
        const container = document.querySelector('.preselected-info');
        if (container && this.currentProvider) {
            container.outerHTML = this.renderPreselectedCategories();
        }
    }

    // ================================================
    // STYLES
    // ================================================
    addStyles() {
        if (document.getElementById('startscan-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'startscan-styles';
        styles.textContent = `
            /* StartScan v12.0 Styles - Design original restauré */
            .scanner-container {
                height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                overflow: hidden;
                position: relative;
                padding: 20px;
            }
            
            .scanner-card {
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
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .scanner-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                color: white;
                font-size: 32px;
            }
            
            .scanner-icon.gmail {
                background: linear-gradient(135deg, #4285f4, #1a73e8);
            }
            
            .scanner-icon.outlook {
                background: linear-gradient(135deg, #0078d4, #005a9e);
            }
            
            .scanner-icon.error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
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
            
            .auth-buttons {
                display: flex;
                gap: 16px;
                justify-content: center;
                margin: 30px 0;
            }
            
            .auth-btn {
                flex: 1;
                max-width: 220px;
                height: 56px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                color: white;
            }
            
            .auth-btn.gmail {
                background: #4285f4;
            }
            
            .auth-btn.gmail:hover {
                background: #3367d6;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(66, 133, 244, 0.3);
            }
            
            .auth-btn.outlook {
                background: #0078d4;
            }
            
            .auth-btn.outlook:hover {
                background: #005a9e;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 120, 212, 0.3);
            }
            
            .preselected-info {
                background: rgba(139, 92, 246, 0.1);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
                text-align: left;
            }
            
            .preselected-info i {
                color: #8b5cf6;
                margin-right: 8px;
            }
            
            .preselected-badges {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 12px;
            }
            
            .category-badge {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            
            .scan-steps {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            
            .step {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
            }
            
            .step:not(:last-child)::after {
                content: '';
                position: absolute;
                top: 20px;
                right: -50%;
                width: 100%;
                height: 2px;
                background: #e5e7eb;
            }
            
            .step.active .step-number {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
            }
            
            .step.active::after {
                background: linear-gradient(90deg, #667eea, #764ba2);
            }
            
            .step-number {
                width: 40px;
                height: 40px;
                background: #e5e7eb;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                color: #9ca3af;
                margin-bottom: 8px;
                position: relative;
                z-index: 1;
            }
            
            .step-label {
                font-size: 13px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .step.active .step-label {
                color: #667eea;
                font-weight: 600;
            }
            
            .duration-section {
                margin-bottom: 30px;
            }
            
            .duration-section h3 {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 16px;
            }
            
            .duration-options {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .duration-btn {
                padding: 10px 18px;
                border: 2px solid #e5e7eb;
                background: white;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 500;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .duration-btn:hover {
                border-color: #9ca3af;
                transform: translateY(-1px);
            }
            
            .duration-btn.active {
                border-color: #667eea;
                background: #667eea;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .scan-btn {
                width: 100%;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 15px;
                color: white;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 25px;
                position: relative;
                overflow: hidden;
            }
            
            .scan-btn.gmail {
                background: linear-gradient(135deg, #4285f4, #1a73e8);
            }
            
            .scan-btn.outlook {
                background: linear-gradient(135deg, #0078d4, #005a9e);
            }
            
            .scan-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .progress-section {
                margin: 20px 0;
            }
            
            .progress-bar {
                width: 100%;
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 15px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                width: 0%;
                transition: width 0.5s ease;
            }
            
            .progress-text {
                font-size: 16px;
                color: #6b7280;
                text-align: center;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .scanner-info {
                background: rgba(102, 126, 234, 0.1);
                border-radius: 10px;
                padding: 15px;
                font-size: 14px;
                color: #667eea;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-weight: 500;
                flex-direction: column;
            }
            
            .scanner-info-main {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .scanner-info-details {
                font-size: 12px;
                color: #8b5cf6;
                margin-top: 4px;
                text-align: center;
            }
            
            @media (max-width: 640px) {
                .scanner-card {
                    padding: 35px 25px;
                }
                
                .scanner-title {
                    font-size: 28px;
                }
                
                .scanner-subtitle {
                    font-size: 16px;
                }
                
                .auth-buttons {
                    flex-direction: column;
                }
                
                .auth-btn {
                    max-width: 100%;
                }
                
                .duration-options {
                    gap: 6px;
                }
                
                .duration-btn {
                    padding: 10px 16px;
                    font-size: 13px;
                    min-width: 75px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    getDebugInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            currentProvider: this.currentProvider,
            selectedDays: this.selectedDays,
            authCache: this.authCache,
            taskPreselectedCategories: this.taskPreselectedCategories,
            scanResults: this.scanResults ? {
                total: this.scanResults.total,
                provider: this.scanResults.provider,
                timestamp: this.scanResults.timestamp
            } : null,
            emailScanners: {
                emailScanner: !!window.emailScanner,
                emailScannerOutlook: !!window.emailScannerOutlook,
                gmailEmails: window.emailScanner?.emails?.length || 0,
                outlookEmails: window.emailScannerOutlook?.emails?.length || 0
            }
        };
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================

// Nettoyer les anciennes instances
if (window.scanStartModule) {
    console.log('[StartScan] 🧹 Nettoyage ancienne instance...');
    window.scanStartModule = null;
}

// Créer la nouvelle instance
console.log('[StartScan] 🚀 Création nouvelle instance v12.0...');
window.scanStartModule = new StartScanModule();

// Alias pour compatibilité
window.unifiedScanModule = window.scanStartModule;
window.StartScanModule = StartScanModule;

// Fonctions de debug
window.debugStartScan = function() {
    console.group('🔍 DEBUG StartScan v12.0');
    const info = window.scanStartModule.getDebugInfo();
    console.log('Info complète:', info);
    console.groupEnd();
    return info;
};

window.testScanAuth = async function() {
    console.group('🔐 TEST Authentification');
    
    const module = window.scanStartModule;
    await module.detectActiveProvider();
    
    console.log('Provider actuel:', module.currentProvider);
    console.log('Auth Gmail:', module.checkGmailAuth());
    console.log('Auth Outlook:', module.checkOutlookAuth());
    console.log('Cache auth:', module.authCache);
    
    console.groupEnd();
    
    return {
        currentProvider: module.currentProvider,
        gmailAuth: module.checkGmailAuth(),
        outlookAuth: module.checkOutlookAuth()
    };
};

console.log('[StartScan] ✅ Module v12.0 chargé avec succès!');
