// StartScan.js - Version 15.0 - Scanner Multi-Provider avec Récupération Corrigée

console.log('[StartScan] 🚀 Loading StartScan.js v15.0 - Fixed Multi-Provider Scanner...');

class MinimalScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.currentProvider = null;
        this.scanResults = null;
        this.abortController = null;
        
        // Paramètres par défaut
        this.settings = {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            taskPreselectedCategories: []
        };
        
        console.log('[StartScan] ✅ Scanner v15.0 initialized');
        this.init();
    }

    async init() {
        await this.detectCurrentProvider();
        await this.loadSettings();
        this.addMinimalStyles();
    }

    // ================================================
    // DÉTECTION DU PROVIDER ACTIF
    // ================================================
    async detectCurrentProvider() {
        console.log('[StartScan] 🔍 Détection du provider actif...');
        
        try {
            // 1. Vérifier Google Auth
            if (window.googleAuthService?.isAuthenticated) {
                const isGoogle = await window.googleAuthService.isAuthenticated();
                if (isGoogle) {
                    this.currentProvider = 'google';
                    console.log('[StartScan] ✅ Google/Gmail détecté');
                    return;
                }
            }
            
            // 2. Vérifier Microsoft Auth
            if (window.authService?.isAuthenticated) {
                const isMicrosoft = await window.authService.isAuthenticated();
                if (isMicrosoft) {
                    this.currentProvider = 'microsoft';
                    console.log('[StartScan] ✅ Microsoft/Outlook détecté');
                    return;
                }
            }
            
            // 3. Vérifier depuis app
            if (window.app?.currentProvider) {
                this.currentProvider = window.app.currentProvider;
                console.log('[StartScan] ✅ Provider depuis app:', this.currentProvider);
                return;
            }
            
            // 4. Vérifier sessionStorage
            const lastProvider = sessionStorage.getItem('currentProvider');
            if (lastProvider) {
                this.currentProvider = lastProvider;
                console.log('[StartScan] ⚠️ Provider depuis storage:', lastProvider);
                return;
            }
            
            console.log('[StartScan] ❌ Aucun provider détecté');
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur détection provider:', error);
        }
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
    // ================================================
    async loadSettings() {
        try {
            // Depuis CategoryManager
            if (window.categoryManager?.getSettings) {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
                console.log('[StartScan] ✅ Settings chargés depuis CategoryManager');
                return;
            }
            
            // Depuis localStorage
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = parsed;
                this.taskPreselectedCategories = parsed.taskPreselectedCategories || [];
                console.log('[StartScan] ✅ Settings chargés depuis localStorage');
            }
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur chargement settings:', error);
        }
    }

    // ================================================
    // INTERFACE UTILISATEUR
    // ================================================
    async render(container) {
        console.log('[StartScan] 🎨 Rendu du scanner...');
        
        if (!container) {
            console.error('[StartScan] ❌ Container non fourni');
            return;
        }

        try {
            // Détecter le provider actuel
            await this.detectCurrentProvider();
            
            if (!this.currentProvider) {
                container.innerHTML = this.renderLoginRequired();
                this.setupLoginHandlers();
                return;
            }

            container.innerHTML = this.renderScanner();
            this.setupEventHandlers();
            this.isInitialized = true;
            
            console.log('[StartScan] ✅ Scanner rendu avec succès');
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur rendu:', error);
            container.innerHTML = this.renderError(error.message);
        }
    }

    renderScanner() {
        const providerName = this.currentProvider === 'google' ? 'Gmail' : 'Outlook';
        const providerIcon = this.currentProvider === 'google' ? 'fab fa-google' : 'fab fa-microsoft';
        
        return `
            <div class="minimal-scanner">
                <div class="scanner-card">
                    <div class="scanner-icon">
                        <i class="fas fa-envelope-open-text"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner d'Emails</h1>
                    <p class="scanner-subtitle">Récupérez tous vos emails en un clic</p>
                    
                    <div class="provider-badge ${this.currentProvider}">
                        <i class="${providerIcon}"></i>
                        <span>${providerName}</span>
                    </div>
                    
                    <div class="duration-section">
                        <label class="duration-label">Période à analyser</label>
                        <div class="duration-options">
                            ${this.renderDurationOptions()}
                        </div>
                    </div>
                    
                    <button class="scan-button" id="scanBtn" onclick="window.minimalScanModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Démarrer le scan</span>
                    </button>
                    
                    <div class="progress-section" id="progressSection" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus"></div>
                        
                        <button class="scan-button cancel-button" onclick="window.minimalScanModule.cancelScan()" style="display: none;" id="cancelBtn">
                            <i class="fas fa-stop"></i>
                            <span>Annuler</span>
                        </button>
                    </div>
                    
                    <div class="scan-info">
                        <i class="fas fa-info-circle"></i>
                        <span>Scan sécurisé avec récupération complète du contenu</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderDurationOptions() {
        const options = [
            { value: 1, label: '1 jour' },
            { value: 3, label: '3 jours' },
            { value: 7, label: '1 semaine' },
            { value: 30, label: '1 mois' },
            { value: 90, label: '3 mois' },
            { value: 365, label: '1 an' },
            { value: 999999, label: 'Tous' }
        ];
        
        return options.map(opt => `
            <button class="duration-btn ${opt.value === this.selectedDays ? 'active' : ''}" 
                    data-days="${opt.value}"
                    onclick="window.minimalScanModule.selectDuration(${opt.value})">
                ${opt.label}
            </button>
        `).join('');
    }

    renderLoginRequired() {
        return `
            <div class="minimal-scanner">
                <div class="scanner-card">
                    <div class="scanner-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    
                    <h1 class="scanner-title">Connexion requise</h1>
                    <p class="scanner-subtitle">Connectez-vous pour scanner vos emails</p>
                    
                    <div class="login-buttons">
                        <button class="scan-button gmail-login" onclick="window.minimalScanModule.loginGoogle()">
                            <i class="fab fa-google"></i>
                            <span>Se connecter avec Gmail</span>
                        </button>
                        
                        <button class="scan-button outlook-login" onclick="window.minimalScanModule.loginMicrosoft()">
                            <i class="fab fa-microsoft"></i>
                            <span>Se connecter avec Outlook</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderError(message) {
        return `
            <div class="minimal-scanner">
                <div class="scanner-card">
                    <div class="scanner-icon error">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    
                    <h1 class="scanner-title">Erreur</h1>
                    <p class="scanner-subtitle">${message}</p>
                    
                    <button class="scan-button" onclick="location.reload()">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS
    // ================================================
    setupEventHandlers() {
        // Les handlers sont déjà définis inline dans le HTML
        console.log('[StartScan] ✅ Event handlers configurés');
    }

    setupLoginHandlers() {
        // Les handlers sont déjà définis inline dans le HTML
        console.log('[StartScan] ✅ Login handlers configurés');
    }

    selectDuration(days) {
        this.selectedDays = days;
        
        // Mettre à jour l'UI
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.days) === days);
        });
        
        console.log(`[StartScan] ✅ Durée sélectionnée: ${days} jours`);
    }

    // ================================================
    // AUTHENTIFICATION
    // ================================================
    async loginGoogle() {
        console.log('[StartScan] 🔐 Connexion Google...');
        
        try {
            if (!window.googleAuthService) {
                throw new Error('Service Google non disponible');
            }
            
            await window.googleAuthService.login();
            const isAuth = await window.googleAuthService.isAuthenticated();
            
            if (isAuth) {
                this.currentProvider = 'google';
                sessionStorage.setItem('currentProvider', 'google');
                
                // Recharger l'interface
                const container = document.querySelector('.page-content') || document.getElementById('content');
                if (container) {
                    await this.render(container);
                }
                
                this.showToast('Connexion Google réussie', 'success');
            }
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur connexion Google:', error);
            this.showToast('Erreur de connexion Google', 'error');
        }
    }

    async loginMicrosoft() {
        console.log('[StartScan] 🔐 Connexion Microsoft...');
        
        try {
            if (!window.authService) {
                throw new Error('Service Microsoft non disponible');
            }
            
            await window.authService.login();
            const isAuth = await window.authService.isAuthenticated();
            
            if (isAuth) {
                this.currentProvider = 'microsoft';
                sessionStorage.setItem('currentProvider', 'microsoft');
                
                // Recharger l'interface
                const container = document.querySelector('.page-content') || document.getElementById('content');
                if (container) {
                    await this.render(container);
                }
                
                this.showToast('Connexion Microsoft réussie', 'success');
            }
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur connexion Microsoft:', error);
            this.showToast('Erreur de connexion Microsoft', 'error');
        }
    }

    // ================================================
    // SCAN PRINCIPAL
    // ================================================
    async startScan() {
        if (this.scanInProgress) {
            console.warn('[StartScan] ⚠️ Scan déjà en cours');
            return;
        }

        console.log('[StartScan] 🚀 === DÉMARRAGE DU SCAN ===');
        console.log('[StartScan] 📋 Provider:', this.currentProvider);
        console.log('[StartScan] 📅 Période:', this.selectedDays, 'jours');
        
        try {
            this.scanInProgress = true;
            this.abortController = new AbortController();
            
            // UI Updates
            this.showProgress();
            this.disableScanButton();
            
            // Vérifier et initialiser MailService
            await this.initializeMailService();
            
            // Options de scan
            const scanOptions = {
                days: this.selectedDays,
                provider: this.currentProvider,
                folder: this.currentProvider === 'google' ? 'INBOX' : 'inbox',
                includeFullContent: true,
                abortSignal: this.abortController.signal,
                taskPreselectedCategories: this.taskPreselectedCategories,
                onProgress: (progress) => this.updateProgress(progress)
            };
            
            // Exécuter le scan
            const results = await this.executeScan(scanOptions);
            
            if (results && results.success) {
                this.scanResults = results;
                this.onScanComplete(results);
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('[StartScan] ⚠️ Scan annulé');
                this.onScanCancelled();
            } else {
                console.error('[StartScan] ❌ Erreur scan:', error);
                this.onScanError(error);
            }
        } finally {
            this.scanInProgress = false;
            this.abortController = null;
        }
    }

    async initializeMailService() {
        console.log('[StartScan] 🔧 Initialisation MailService...');
        
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }

        try {
            // S'assurer que MailService est initialisé
            if (!window.mailService.isInitialized || !window.mailService.isInitialized()) {
                await window.mailService.initialize();
            }
            
            // Vérifier que le provider correspond
            const mailProvider = window.mailService.getCurrentProvider?.();
            console.log('[StartScan] 📋 MailService provider:', mailProvider);
            
            if (mailProvider && mailProvider !== this.currentProvider && mailProvider !== 'demo') {
                console.warn('[StartScan] ⚠️ Provider mismatch, réinitialisation...');
                if (window.mailService.reset) {
                    await window.mailService.reset();
                    await window.mailService.initialize();
                }
            }
            
            console.log('[StartScan] ✅ MailService prêt');
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur init MailService:', error);
            throw new Error('Impossible d\'initialiser le service email');
        }
    }

    async executeScan(options) {
        console.log('[StartScan] 🔄 Exécution du scan...');
        
        const results = {
            success: false,
            total: 0,
            emails: [],
            provider: options.provider,
            timestamp: Date.now()
        };

        try {
            // Étape 1: Récupération des emails
            this.updateProgress({ phase: 'fetching', message: 'Récupération des emails...', progress: 20 });
            
            const emails = await this.fetchEmails(options);
            results.emails = emails;
            results.total = emails.length;
            
            console.log(`[StartScan] ✅ ${emails.length} emails récupérés`);
            
            // Étape 2: Catégorisation
            if (options.taskPreselectedCategories && window.categoryManager) {
                this.updateProgress({ phase: 'categorizing', message: 'Catégorisation...', progress: 60 });
                
                await this.categorizeEmails(emails, options);
                results.categorized = emails.length;
            }
            
            // Étape 3: Finalisation
            this.updateProgress({ phase: 'complete', message: 'Finalisation...', progress: 100 });
            
            results.success = true;
            results.taskPreselectedCategories = options.taskPreselectedCategories;
            
            return results;
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur exécution scan:', error);
            throw error;
        }
    }

    async fetchEmails(options) {
        console.log('[StartScan] 📧 Récupération des emails...');
        
        if (!window.mailService?.getMessages) {
            throw new Error('MailService.getMessages non disponible');
        }

        try {
            // Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            
            if (options.days === 999999) {
                startDate.setFullYear(2000); // Récupérer depuis l'an 2000
            } else {
                startDate.setDate(endDate.getDate() - options.days);
            }
            
            // Construire le filtre
            let filter = '';
            if (options.provider === 'microsoft') {
                filter = `receivedDateTime ge ${startDate.toISOString()} and receivedDateTime le ${endDate.toISOString()}`;
            } else {
                // Gmail
                const startStr = startDate.toISOString().split('T')[0];
                const endStr = endDate.toISOString().split('T')[0];
                filter = `after:${startStr} before:${endStr}`;
            }
            
            console.log('[StartScan] 📅 Filtre de date:', filter);
            
            // Récupérer les emails
            const emails = await window.mailService.getMessages(options.folder, { filter });
            
            console.log(`[StartScan] ✅ ${emails.length} emails récupérés`);
            return emails || [];
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur récupération emails:', error);
            throw error;
        }
    }

    async categorizeEmails(emails, options) {
        console.log('[StartScan] 🏷️ Catégorisation des emails...');
        
        if (!window.categoryManager?.analyzeEmail) {
            console.warn('[StartScan] ⚠️ CategoryManager non disponible');
            return;
        }

        const batchSize = 50;
        let processed = 0;
        
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    const analysis = window.categoryManager.analyzeEmail(email);
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.isPreselectedForTasks = options.taskPreselectedCategories.includes(email.category);
                } catch (error) {
                    console.error('[StartScan] ❌ Erreur catégorisation:', error);
                    email.category = 'other';
                }
                
                processed++;
            }
            
            // Update progress
            const progress = 60 + Math.round((processed / emails.length) * 30);
            this.updateProgress({ 
                phase: 'categorizing', 
                message: `Catégorisation: ${processed}/${emails.length}`,
                progress 
            });
            
            // Pause pour ne pas bloquer l'UI
            if (i + batchSize < emails.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        console.log('[StartScan] ✅ Catégorisation terminée');
    }

    // ================================================
    // GESTION DU PROGRÈS
    // ================================================
    showProgress() {
        const progressSection = document.getElementById('progressSection');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (progressSection) {
            progressSection.style.display = 'block';
        }
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-flex';
        }
    }

    updateProgress(data) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressStatus = document.getElementById('progressStatus');
        
        if (progressFill && data.progress) {
            progressFill.style.width = `${data.progress}%`;
        }
        if (progressText && data.message) {
            progressText.textContent = data.message;
        }
        if (progressStatus && data.phase) {
            progressStatus.textContent = data.phase;
        }
    }

    disableScanButton() {
        const scanBtn = document.getElementById('scanBtn');
        if (scanBtn) {
            scanBtn.disabled = true;
            scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Scan en cours...</span>';
        }
    }

    enableScanButton() {
        const scanBtn = document.getElementById('scanBtn');
        if (scanBtn) {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="fas fa-play"></i> <span>Démarrer le scan</span>';
        }
    }

    cancelScan() {
        if (this.abortController) {
            this.abortController.abort();
        }
    }

    // ================================================
    // CALLBACKS DE FIN DE SCAN
    // ================================================
    onScanComplete(results) {
        console.log('[StartScan] 🎉 Scan terminé avec succès');
        console.log('[StartScan] 📊 Résultats:', results);
        
        // Stocker les résultats
        try {
            sessionStorage.setItem('scanResults', JSON.stringify({
                success: true,
                total: results.total,
                provider: results.provider,
                timestamp: results.timestamp,
                taskPreselectedCategories: results.taskPreselectedCategories
            }));
            
            // Stocker les emails dans EmailScanner si disponible
            if (window.emailScanner && results.emails) {
                window.emailScanner.emails = results.emails;
                console.log('[StartScan] ✅ Emails stockés dans EmailScanner');
            }
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur stockage résultats:', error);
        }
        
        // Notification
        this.showToast(`${results.total} emails récupérés`, 'success');
        
        // UI Update
        const scanBtn = document.getElementById('scanBtn');
        if (scanBtn) {
            scanBtn.innerHTML = '<i class="fas fa-check"></i> <span>Scan terminé!</span>';
            scanBtn.style.background = '#10b981';
        }
        
        // Dispatcher l'événement
        window.dispatchEvent(new CustomEvent('scanCompleted', {
            detail: {
                results: results,
                emails: results.emails,
                source: 'StartScan',
                provider: results.provider
            }
        }));
        
        // Redirection après 2 secondes
        setTimeout(() => {
            this.redirectToEmails();
        }, 2000);
    }

    onScanCancelled() {
        console.log('[StartScan] ⚠️ Scan annulé');
        this.showToast('Scan annulé', 'warning');
        this.resetUI();
    }

    onScanError(error) {
        console.error('[StartScan] ❌ Erreur de scan:', error);
        this.showToast(`Erreur: ${error.message}`, 'error');
        this.resetUI();
    }

    resetUI() {
        this.enableScanButton();
        
        const progressSection = document.getElementById('progressSection');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (progressSection) {
            progressSection.style.display = 'none';
        }
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
        
        this.updateProgress({ progress: 0, message: 'Initialisation...', phase: '' });
    }

    // ================================================
    // REDIRECTION
    // ================================================
    redirectToEmails() {
        console.log('[StartScan] 🔄 Redirection vers la page emails...');
        
        // Méthode 1: PageManager approprié
        if (this.currentProvider === 'google' && window.pageManagerGmail?.loadPage) {
            window.pageManagerGmail.loadPage('emails');
        } else if (this.currentProvider === 'microsoft' && window.pageManagerOutlook?.loadPage) {
            window.pageManagerOutlook.loadPage('emails');
        } 
        // Méthode 2: PageManager générique
        else if (window.pageManager?.loadPage) {
            window.pageManager.loadPage('emails');
        }
        // Méthode 3: Navigation directe
        else {
            const emailsLink = document.querySelector('[data-page="emails"]');
            if (emailsLink) {
                emailsLink.click();
            } else {
                this.showToast('Cliquez sur "Emails" pour voir les résultats', 'info');
            }
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    showToast(message, type = 'info') {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addMinimalStyles() {
        if (this.stylesAdded) return;
        
        const styles = document.createElement('style');
        styles.id = 'minimal-scan-styles';
        styles.textContent = `
            .minimal-scanner {
                min-height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
            }
            
            .scanner-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 40px;
                max-width: 600px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .scanner-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                color: white;
                font-size: 36px;
            }
            
            .scanner-icon.error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            
            .scanner-title {
                font-size: 28px;
                font-weight: 600;
                color: #1a1a2e;
                margin-bottom: 10px;
            }
            
            .scanner-subtitle {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 30px;
            }
            
            .provider-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 20px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                color: white;
                margin-bottom: 30px;
            }
            
            .provider-badge.google {
                background: linear-gradient(135deg, #4285f4, #34a853);
            }
            
            .provider-badge.microsoft {
                background: linear-gradient(135deg, #0078d4, #106ebe);
            }
            
            .duration-section {
                margin-bottom: 30px;
            }
            
            .duration-label {
                display: block;
                font-weight: 600;
                color: #374151;
                margin-bottom: 15px;
            }
            
            .duration-options {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .duration-btn {
                padding: 10px 20px;
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
                border-color: #667eea;
                transform: translateY(-2px);
            }
            
            .duration-btn.active {
                background: #667eea;
                border-color: #667eea;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .scan-button {
                width: 100%;
                padding: 15px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 12px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .scan-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .scan-button.cancel-button {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                width: auto;
                padding: 10px 20px;
                margin: 20px auto 0;
            }
            
            .scan-button.gmail-login {
                background: linear-gradient(135deg, #4285f4, #34a853);
                margin-bottom: 10px;
            }
            
            .scan-button.outlook-login {
                background: linear-gradient(135deg, #0078d4, #106ebe);
            }
            
            .login-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .progress-section {
                margin-top: 20px;
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
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                width: 0%;
                transition: width 0.5s ease;
            }
            
            .progress-text {
                font-size: 14px;
                color: #374151;
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .progress-status {
                font-size: 12px;
                color: #9ca3af;
            }
            
            .scan-info {
                background: rgba(102, 126, 234, 0.1);
                border-radius: 10px;
                padding: 12px 20px;
                font-size: 14px;
                color: #667eea;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            @media (max-width: 640px) {
                .scanner-card {
                    padding: 30px 20px;
                }
                
                .scanner-title {
                    font-size: 24px;
                }
                
                .duration-options {
                    flex-direction: column;
                }
                
                .duration-btn {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
    }

    // ================================================
    // CLEANUP
    // ================================================
    cleanup() {
        this.scanInProgress = false;
        this.scanResults = null;
        if (this.abortController) {
            this.abortController.abort();
        }
        console.log('[StartScan] 🧹 Nettoyage effectué');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.minimalScanModule) {
    window.minimalScanModule.cleanup?.();
}

window.minimalScanModule = new MinimalScanModule();
window.scanStartModule = window.minimalScanModule; // Alias

console.log('✅ StartScan v15.0 loaded - Scanner Multi-Provider Corrigé');
console.log('💡 Provider actuel:', window.minimalScanModule.currentProvider);
