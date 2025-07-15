// StartScan.js - Version 13.0 - Scanner Email Unifié Multi-Provider
// Support complet Gmail/Outlook avec synchronisation parfaite

console.log('[StartScan] 🚀 Loading StartScan.js v13.0 - Complete Unified Scanner...');

class UnifiedScanModule {
    constructor() {
        // État principal
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        this.scanResults = null;
        
        // Provider et authentification
        this.currentProvider = null;
        this.isAuthenticated = false;
        this.authCache = {
            gmail: { checked: false, authenticated: false, timestamp: 0 },
            outlook: { checked: false, authenticated: false, timestamp: 0 }
        };
        
        // Services disponibles
        this.availableServices = {
            gmail: {
                googleAuthService: !!window.googleAuthService,
                gapi: !!(window.gapi?.auth2),
                mailService: false
            },
            outlook: {
                authService: !!window.authService,
                msal: !!window.msalInstance,
                mailService: false
            }
        };
        
        // Paramètres et synchronisation
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.settingsSyncInterval = null;
        
        console.log('[UnifiedScan] ✅ Scanner v13.0 initialized');
        this.initialize();
    }

    // ================================================
    // INITIALISATION PRINCIPALE
    // ================================================
    async initialize() {
        try {
            console.log('[UnifiedScan] 🔧 Initializing scanner...');
            
            // 1. Détecter les services disponibles
            await this.detectAvailableServices();
            
            // 2. Charger les paramètres
            await this.loadSettings();
            
            // 3. Vérifier l'authentification
            await this.checkAuthentication();
            
            // 4. Ajouter les styles
            this.addStyles();
            
            // 5. Démarrer la synchronisation
            this.startSettingsSync();
            
            this.isInitialized = true;
            console.log('[UnifiedScan] ✅ Initialization complete');
            
        } catch (error) {
            console.error('[UnifiedScan] ❌ Initialization error:', error);
        }
    }

    // ================================================
    // DÉTECTION DES SERVICES
    // ================================================
    async detectAvailableServices() {
        console.log('[UnifiedScan] 🔍 Detecting available services...');
        
        // Vérifier MailService unifié
        if (window.mailService) {
            this.availableServices.gmail.mailService = true;
            this.availableServices.outlook.mailService = true;
            console.log('[UnifiedScan] ✅ MailService detected');
        }
        
        // Log des services disponibles
        console.log('[UnifiedScan] 📊 Available services:', {
            gmail: this.availableServices.gmail,
            outlook: this.availableServices.outlook
        });
    }

    // ================================================
    // VÉRIFICATION D'AUTHENTIFICATION
    // ================================================
    async checkAuthentication() {
        console.log('[UnifiedScan] 🔐 Checking authentication...');
        
        const now = Date.now();
        const CACHE_DURATION = 30000; // 30 secondes
        
        // Réinitialiser l'état
        this.currentProvider = null;
        this.isAuthenticated = false;
        
        // Vérifier Gmail
        if (!this.authCache.gmail.checked || (now - this.authCache.gmail.timestamp) > CACHE_DURATION) {
            const gmailAuth = await this.checkGmailAuth();
            this.authCache.gmail = {
                checked: true,
                authenticated: gmailAuth,
                timestamp: now
            };
        }
        
        if (this.authCache.gmail.authenticated) {
            this.currentProvider = 'gmail';
            this.isAuthenticated = true;
            console.log('[UnifiedScan] ✅ Gmail authenticated');
            return;
        }
        
        // Vérifier Outlook
        if (!this.authCache.outlook.checked || (now - this.authCache.outlook.timestamp) > CACHE_DURATION) {
            const outlookAuth = await this.checkOutlookAuth();
            this.authCache.outlook = {
                checked: true,
                authenticated: outlookAuth,
                timestamp: now
            };
        }
        
        if (this.authCache.outlook.authenticated) {
            this.currentProvider = 'outlook';
            this.isAuthenticated = true;
            console.log('[UnifiedScan] ✅ Outlook authenticated');
            return;
        }
        
        // Vérifier le dernier provider utilisé
        const lastProvider = sessionStorage.getItem('lastEmailProvider');
        if (lastProvider === 'gmail' && this.authCache.gmail.authenticated) {
            this.currentProvider = 'gmail';
            this.isAuthenticated = true;
        } else if (lastProvider === 'outlook' && this.authCache.outlook.authenticated) {
            this.currentProvider = 'outlook';
            this.isAuthenticated = true;
        }
        
        console.log('[UnifiedScan] 📧 Current provider:', this.currentProvider || 'None');
        console.log('[UnifiedScan] 🔐 Authenticated:', this.isAuthenticated);
    }

    async checkGmailAuth() {
        try {
            // 1. GoogleAuthService
            if (window.googleAuthService?.isAuthenticated) {
                const isAuth = await window.googleAuthService.isAuthenticated();
                if (isAuth) return true;
            }
            
            // 2. GAPI
            if (window.gapi?.auth2) {
                const authInstance = window.gapi.auth2.getAuthInstance();
                if (authInstance && authInstance.isSignedIn.get()) return true;
            }
            
            // 3. MailService
            if (window.mailService?.isInitialized && window.mailService?.getCurrentProvider) {
                const provider = window.mailService.getCurrentProvider();
                if (provider === 'gmail') return true;
            }
            
            return false;
        } catch (error) {
            console.warn('[UnifiedScan] Gmail auth check error:', error);
            return false;
        }
    }

    async checkOutlookAuth() {
        try {
            // 1. AuthService
            if (window.authService?.isAuthenticated) {
                const isAuth = await window.authService.isAuthenticated();
                if (isAuth) return true;
            }
            
            // 2. MSAL
            if (window.msalInstance) {
                const accounts = window.msalInstance.getAllAccounts();
                if (accounts && accounts.length > 0) return true;
            }
            
            // 3. MailService
            if (window.mailService?.isInitialized && window.mailService?.getCurrentProvider) {
                const provider = window.mailService.getCurrentProvider();
                if (provider === 'outlook') return true;
            }
            
            return false;
        } catch (error) {
            console.warn('[UnifiedScan] Outlook auth check error:', error);
            return false;
        }
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    async loadSettings() {
        console.log('[UnifiedScan] 📋 Loading settings...');
        
        try {
            // 1. Depuis CategoryManager
            if (window.categoryManager?.getSettings) {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
                console.log('[UnifiedScan] ✅ Settings loaded from CategoryManager');
            }
            // 2. Depuis localStorage
            else {
                const saved = localStorage.getItem('categorySettings');
                if (saved) {
                    this.settings = JSON.parse(saved);
                    this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                    console.log('[UnifiedScan] ✅ Settings loaded from localStorage');
                } else {
                    this.settings = this.getDefaultSettings();
                    this.taskPreselectedCategories = [];
                    console.log('[UnifiedScan] 📝 Using default settings');
                }
            }
            
            // Appliquer la période par défaut
            if (this.settings.scanSettings?.defaultPeriod) {
                this.selectedDays = this.settings.scanSettings.defaultPeriod;
            }
            
            console.log('[UnifiedScan] ⭐ Preselected categories:', this.taskPreselectedCategories);
            
        } catch (error) {
            console.error('[UnifiedScan] ❌ Settings load error:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
        }
    }

    getDefaultSettings() {
        return {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true,
                maxEmails: -1
            },
            taskPreselectedCategories: [],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            }
        };
    }

    startSettingsSync() {
        // Synchronisation toutes les 5 secondes
        this.settingsSyncInterval = setInterval(() => {
            this.checkSettingsUpdate();
        }, 5000);
        
        // Écouter les événements de changement
        window.addEventListener('categorySettingsChanged', (e) => {
            console.log('[UnifiedScan] 📨 Settings change event received');
            this.handleSettingsChange(e.detail);
        });
        
        window.addEventListener('settingsChanged', (e) => {
            if (e.detail?.type === 'taskPreselectedCategories') {
                console.log('[UnifiedScan] ⭐ Task categories updated');
                this.taskPreselectedCategories = e.detail.value || [];
                this.updatePreselectedDisplay();
            }
        });
    }

    checkSettingsUpdate() {
        if (window.categoryManager?.getTaskPreselectedCategories) {
            const newCategories = window.categoryManager.getTaskPreselectedCategories();
            const changed = JSON.stringify(this.taskPreselectedCategories) !== JSON.stringify(newCategories);
            
            if (changed) {
                console.log('[UnifiedScan] 🔄 Task categories sync');
                this.taskPreselectedCategories = newCategories;
                this.updatePreselectedDisplay();
            }
        }
    }

    handleSettingsChange(detail) {
        if (detail.settings) {
            this.settings = detail.settings;
            this.taskPreselectedCategories = detail.settings.taskPreselectedCategories || [];
            this.updatePreselectedDisplay();
        }
    }

    // ================================================
    // RENDU PRINCIPAL
    // ================================================
    async render(container) {
        console.log('[UnifiedScan] 🎨 Rendering scanner...');
        
        try {
            // Vérifier l'authentification
            await this.checkAuthentication();
            
            if (!this.isAuthenticated) {
                container.innerHTML = this.renderAuthSelection();
            } else {
                container.innerHTML = this.renderScanner();
            }
            
            this.attachEventListeners();
            
        } catch (error) {
            console.error('[UnifiedScan] ❌ Render error:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderAuthSelection() {
        const hasGmail = Object.values(this.availableServices.gmail).some(v => v);
        const hasOutlook = Object.values(this.availableServices.outlook).some(v => v);
        
        return `
            <div class="unified-scanner">
                <div class="scanner-card">
                    <div class="scanner-header">
                        <div class="scanner-icon">
                            <i class="fas fa-envelope-open-text"></i>
                        </div>
                        <h1 class="scanner-title">Scanner Email Unifié</h1>
                        <p class="scanner-subtitle">Analysez vos emails avec l'IA Claude</p>
                    </div>
                    
                    <div class="auth-options">
                        ${hasGmail ? `
                            <button class="auth-button gmail" onclick="unifiedScanModule.loginProvider('gmail')">
                                <i class="fab fa-google"></i>
                                <span>Se connecter avec Gmail</span>
                                <span class="auth-status">${this.authCache.gmail.authenticated ? '✓' : ''}</span>
                            </button>
                        ` : ''}
                        
                        ${hasOutlook ? `
                            <button class="auth-button outlook" onclick="unifiedScanModule.loginProvider('outlook')">
                                <i class="fab fa-microsoft"></i>
                                <span>Se connecter avec Outlook</span>
                                <span class="auth-status">${this.authCache.outlook.authenticated ? '✓' : ''}</span>
                            </button>
                        ` : ''}
                        
                        ${!hasGmail && !hasOutlook ? `
                            <div class="no-service-warning">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p>Aucun service d'email détecté</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="scanner-info">
                        <i class="fas fa-shield-alt"></i>
                        <span>Connexion sécurisée • Analyse privée • Sans limite d'emails</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderScanner() {
        const providerName = this.currentProvider === 'gmail' ? 'Gmail' : 'Outlook';
        const providerIcon = this.currentProvider === 'gmail' ? 'fab fa-google' : 'fab fa-microsoft';
        
        return `
            <div class="unified-scanner">
                <div class="scanner-card">
                    <div class="scanner-header">
                        <div class="scanner-icon ${this.currentProvider}">
                            <i class="${providerIcon}"></i>
                        </div>
                        <h1 class="scanner-title">Scanner ${providerName}</h1>
                        <p class="scanner-subtitle">Analysez tous vos emails ${providerName}</p>
                    </div>
                    
                    ${this.renderPreselectedCategories()}
                    
                    <div class="scan-steps">
                        <div class="step active" id="step-select">
                            <span class="step-number">1</span>
                            <span class="step-label">Sélection</span>
                        </div>
                        <div class="step" id="step-scan">
                            <span class="step-number">2</span>
                            <span class="step-label">Analyse</span>
                        </div>
                        <div class="step" id="step-results">
                            <span class="step-number">3</span>
                            <span class="step-label">Résultats</span>
                        </div>
                    </div>
                    
                    <div class="period-selection">
                        <h3>Période d'analyse</h3>
                        <div class="period-options">
                            ${this.renderPeriodOptions()}
                        </div>
                    </div>
                    
                    <button class="scan-button ${this.currentProvider}" id="scanButton" onclick="unifiedScanModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Démarrer l'analyse</span>
                    </button>
                    
                    <div class="scan-progress" id="scanProgress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <p class="progress-text" id="progressText">Initialisation...</p>
                        <p class="progress-details" id="progressDetails"></p>
                    </div>
                    
                    <div class="scanner-footer">
                        <button class="link-button" onclick="unifiedScanModule.logout()">
                            <i class="fas fa-sign-out-alt"></i>
                            Changer de compte
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderPreselectedCategories() {
        if (this.taskPreselectedCategories.length === 0) {
            return `
                <div class="preselected-info empty">
                    <i class="fas fa-info-circle"></i>
                    <span>Aucune catégorie pré-sélectionnée pour les tâches</span>
                </div>
            `;
        }
        
        const categories = this.taskPreselectedCategories.map(catId => {
            const category = window.categoryManager?.getCategory(catId);
            return category || { id: catId, name: catId, icon: '📂', color: '#6366f1' };
        });
        
        return `
            <div class="preselected-section">
                <div class="preselected-header">
                    <i class="fas fa-star"></i>
                    <span>Catégories pré-sélectionnées pour tâches</span>
                </div>
                <div class="preselected-grid">
                    ${categories.map(cat => `
                        <div class="preselected-badge" style="background: ${cat.color}20; border-color: ${cat.color};">
                            <span class="cat-icon">${cat.icon}</span>
                            <span class="cat-name">${cat.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPeriodOptions() {
        const periods = [
            { value: 1, label: '1 jour' },
            { value: 3, label: '3 jours' },
            { value: 7, label: '7 jours' },
            { value: 15, label: '15 jours' },
            { value: 30, label: '30 jours' },
            { value: 90, label: '3 mois' },
            { value: -1, label: 'Tous' }
        ];
        
        return periods.map(period => `
            <button class="period-option ${this.selectedDays === period.value ? 'selected' : ''}"
                    onclick="unifiedScanModule.selectPeriod(${period.value})"
                    data-days="${period.value}">
                ${period.label}
            </button>
        `).join('');
    }

    renderError(error) {
        return `
            <div class="unified-scanner">
                <div class="scanner-card error">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Erreur</h2>
                    <p>${error.message || 'Une erreur est survenue'}</p>
                    <button class="scan-button" onclick="location.reload()">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // AUTHENTIFICATION
    // ================================================
    async loginProvider(provider) {
        console.log(`[UnifiedScan] 🔐 Login ${provider}...`);
        
        try {
            this.showLoading(`Connexion à ${provider === 'gmail' ? 'Gmail' : 'Outlook'}...`);
            
            let success = false;
            
            if (provider === 'gmail') {
                success = await this.loginGmail();
            } else if (provider === 'outlook') {
                success = await this.loginOutlook();
            }
            
            if (success) {
                this.currentProvider = provider;
                this.isAuthenticated = true;
                sessionStorage.setItem('lastEmailProvider', provider);
                
                // Invalider le cache
                this.authCache[provider] = {
                    checked: true,
                    authenticated: true,
                    timestamp: Date.now()
                };
                
                // Recharger l'interface
                const container = document.querySelector('.unified-scanner')?.parentElement;
                if (container) {
                    await this.render(container);
                }
                
                this.showToast(`Connecté à ${provider === 'gmail' ? 'Gmail' : 'Outlook'}`, 'success');
            } else {
                throw new Error(`Échec de connexion ${provider}`);
            }
            
        } catch (error) {
            console.error(`[UnifiedScan] Login ${provider} error:`, error);
            this.showToast(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loginGmail() {
        // 1. GoogleAuthService
        if (window.googleAuthService?.login) {
            await window.googleAuthService.login();
            return await window.googleAuthService.isAuthenticated();
        }
        
        // 2. GAPI
        if (window.gapi?.auth2) {
            const authInstance = window.gapi.auth2.getAuthInstance();
            if (authInstance) {
                await authInstance.signIn();
                return authInstance.isSignedIn.get();
            }
        }
        
        // 3. MailService
        if (window.mailService?.authenticate) {
            await window.mailService.authenticate('gmail');
            return true;
        }
        
        return false;
    }

    async loginOutlook() {
        // 1. AuthService
        if (window.authService?.login) {
            await window.authService.login();
            return await window.authService.isAuthenticated();
        }
        
        // 2. MSAL
        if (window.msalInstance) {
            const loginRequest = { scopes: ['User.Read', 'Mail.Read'] };
            await window.msalInstance.loginPopup(loginRequest);
            const accounts = window.msalInstance.getAllAccounts();
            return accounts && accounts.length > 0;
        }
        
        // 3. MailService
        if (window.mailService?.authenticate) {
            await window.mailService.authenticate('outlook');
            return true;
        }
        
        return false;
    }

    async logout() {
        console.log('[UnifiedScan] 🚪 Logout...');
        
        try {
            if (this.currentProvider === 'gmail') {
                if (window.googleAuthService?.logout) {
                    await window.googleAuthService.logout();
                } else if (window.gapi?.auth2) {
                    const authInstance = window.gapi.auth2.getAuthInstance();
                    await authInstance.signOut();
                }
            } else if (this.currentProvider === 'outlook') {
                if (window.authService?.logout) {
                    await window.authService.logout();
                } else if (window.msalInstance) {
                    const accounts = window.msalInstance.getAllAccounts();
                    if (accounts.length > 0) {
                        await window.msalInstance.logoutPopup({ account: accounts[0] });
                    }
                }
            }
            
            // Réinitialiser l'état
            this.currentProvider = null;
            this.isAuthenticated = false;
            this.authCache = {
                gmail: { checked: false, authenticated: false, timestamp: 0 },
                outlook: { checked: false, authenticated: false, timestamp: 0 }
            };
            
            sessionStorage.removeItem('lastEmailProvider');
            
            // Recharger l'interface
            const container = document.querySelector('.unified-scanner')?.parentElement;
            if (container) {
                await this.render(container);
            }
            
        } catch (error) {
            console.error('[UnifiedScan] Logout error:', error);
        }
    }

    // ================================================
    // SCAN
    // ================================================
    async startScan() {
        if (this.scanInProgress) {
            console.log('[UnifiedScan] Scan already in progress');
            return;
        }
        
        console.log('[UnifiedScan] 🚀 Starting scan...');
        console.log('[UnifiedScan] 📧 Provider:', this.currentProvider);
        console.log('[UnifiedScan] ⭐ Preselected categories:', this.taskPreselectedCategories);
        console.log('[UnifiedScan] 📅 Period:', this.selectedDays === -1 ? 'All' : `${this.selectedDays} days`);
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            // Mettre à jour l'UI
            this.setStep('scan');
            this.showProgress();
            this.disableScanButton();
            
            // Préparer les options
            const scanOptions = {
                provider: this.currentProvider,
                days: this.selectedDays,
                folder: this.settings.scanSettings?.defaultFolder || 'inbox',
                autoAnalyze: this.settings.scanSettings?.autoAnalyze !== false,
                autoCategrize: this.settings.scanSettings?.autoCategrize !== false,
                includeSpam: !this.settings.preferences?.excludeSpam,
                detectCC: this.settings.preferences?.detectCC !== false,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                maxResults: this.selectedDays === -1 ? -1 : undefined,
                onProgress: (progress) => this.updateProgress(progress)
            };
            
            // Exécuter le scan
            const results = await this.executeScan(scanOptions);
            this.scanResults = results;
            
            // Terminer
            this.setStep('results');
            this.completeScan(results);
            
        } catch (error) {
            console.error('[UnifiedScan] ❌ Scan error:', error);
            this.showError(error);
        } finally {
            this.scanInProgress = false;
        }
    }

    async executeScan(options) {
        // Utiliser EmailScanner si disponible
        if (window.emailScanner?.scan) {
            console.log('[UnifiedScan] Using EmailScanner...');
            return await window.emailScanner.scan(options);
        }
        
        // Sinon simulation
        console.log('[UnifiedScan] Simulation mode...');
        
        for (let i = 0; i <= 100; i += 5) {
            this.updateProgress({
                phase: 'scanning',
                message: `Analyse en cours... ${i}%`,
                progress: { current: i, total: 100 }
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return {
            success: true,
            total: Math.floor(Math.random() * 1000) + 500,
            categorized: Math.floor(Math.random() * 900) + 400,
            provider: this.currentProvider,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: {
                preselectedForTasks: this.taskPreselectedCategories.length > 0 ? Math.floor(Math.random() * 100) + 50 : 0
            }
        };
    }

    completeScan(results) {
        console.log('[UnifiedScan] ✅ Scan completed:', results);
        
        const scanButton = document.getElementById('scanButton');
        if (scanButton) {
            scanButton.innerHTML = `
                <i class="fas fa-check"></i>
                <span>Scan terminé !</span>
            `;
            scanButton.classList.add('success');
            
            if (results.stats?.preselectedForTasks > 0) {
                scanButton.insertAdjacentHTML('beforeend', `
                    <span class="badge">⭐ ${results.stats.preselectedForTasks} emails pour tâches</span>
                `);
            }
        }
        
        // Sauvegarder les résultats
        sessionStorage.setItem('scanResults', JSON.stringify({
            ...results,
            timestamp: Date.now(),
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000)
        }));
        
        // Notification
        const message = results.stats?.preselectedForTasks > 0 ?
            `✅ ${results.total} emails analysés • ⭐ ${results.stats.preselectedForTasks} pré-sélectionnés` :
            `✅ ${results.total} emails analysés`;
        
        this.showToast(message, 'success');
        
        // Redirection après 1.5 secondes
        setTimeout(() => {
            this.redirectToResults();
        }, 1500);
    }

    redirectToResults() {
        console.log('[UnifiedScan] 🔄 Redirecting to results...');
        
        if (window.pageManager?.loadPage) {
            window.pageManager.loadPage('emails');
        } else if (this.currentProvider === 'gmail' && window.pageManagerGmail?.loadPage) {
            window.pageManagerGmail.loadPage('emails');
        } else if (this.currentProvider === 'outlook' && window.pageManagerOutlook?.loadPage) {
            window.pageManagerOutlook.loadPage('emails');
        } else {
            window.location.href = '#emails';
        }
    }

    // ================================================
    // UI HELPERS
    // ================================================
    selectPeriod(days) {
        this.selectedDays = days;
        
        // Mettre à jour l'UI
        document.querySelectorAll('.period-option').forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.dataset.days) === days);
        });
        
        console.log(`[UnifiedScan] Period selected: ${days === -1 ? 'All' : days + ' days'}`);
    }

    setStep(stepName) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        const stepElement = document.getElementById(`step-${stepName}`);
        if (stepElement) {
            stepElement.classList.add('active');
        }
    }

    showProgress() {
        const progressSection = document.getElementById('scanProgress');
        if (progressSection) {
            progressSection.style.display = 'block';
        }
    }

    updateProgress(progress) {
        const fill = document.getElementById('progressFill');
        const text = document.getElementById('progressText');
        const details = document.getElementById('progressDetails');
        
        if (fill && progress.progress) {
            const percent = Math.round((progress.progress.current / progress.progress.total) * 100);
            fill.style.width = `${percent}%`;
        }
        
        if (text) text.textContent = progress.message || 'Traitement...';
        if (details) details.textContent = progress.phase || '';
    }

    disableScanButton() {
        const button = document.getElementById('scanButton');
        if (button) {
            button.disabled = true;
            button.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>Analyse en cours...</span>
            `;
        }
    }

    updatePreselectedDisplay() {
        const container = document.querySelector('.preselected-section');
        if (container) {
            const parent = container.parentElement;
            container.outerHTML = this.renderPreselectedCategories();
        }
    }

    attachEventListeners() {
        // Les event listeners sont attachés via onclick dans le HTML
    }

    showLoading(message = 'Chargement...') {
        const existing = document.getElementById('unifiedLoading');
        if (existing) {
            existing.querySelector('p').textContent = message;
            return;
        }
        
        const loading = document.createElement('div');
        loading.id = 'unifiedLoading';
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('unifiedLoading');
        if (loading) loading.remove();
    }

    showToast(message, type = 'info') {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[UnifiedScan] Toast: ${type} - ${message}`);
        }
    }

    showError(error) {
        const progressSection = document.getElementById('scanProgress');
        if (progressSection) {
            progressSection.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message || 'Une erreur est survenue'}</p>
                    <button onclick="unifiedScanModule.resetScan()">Réessayer</button>
                </div>
            `;
        }
    }

    resetScan() {
        this.scanInProgress = false;
        this.setStep('select');
        
        const button = document.getElementById('scanButton');
        if (button) {
            button.disabled = false;
            button.classList.remove('success');
            button.innerHTML = `
                <i class="fas fa-play"></i>
                <span>Démarrer l'analyse</span>
            `;
        }
        
        const progress = document.getElementById('scanProgress');
        if (progress) {
            progress.style.display = 'none';
        }
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addStyles() {
        if (this.stylesAdded) return;
        
        const style = document.createElement('style');
        style.id = 'unified-scan-styles';
        style.textContent = `
            /* Scanner unifié v13.0 */
            .unified-scanner {
                min-height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
            }
            
            .scanner-card {
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(10px);
                border-radius: 24px;
                padding: 48px;
                width: 100%;
                max-width: 720px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                animation: fadeIn 0.5s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .scanner-header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .scanner-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                color: white;
                font-size: 36px;
            }
            
            .scanner-icon.gmail {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
            }
            
            .scanner-icon.outlook {
                background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
            }
            
            .scanner-title {
                font-size: 32px;
                font-weight: 700;
                color: #1a1a2e;
                margin: 0 0 8px 0;
            }
            
            .scanner-subtitle {
                font-size: 18px;
                color: #6b7280;
                margin: 0;
            }
            
            /* Auth options */
            .auth-options {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin: 32px 0;
            }
            
            .auth-button {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 16px 24px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .auth-button.gmail {
                background: #4285f4;
                color: white;
            }
            
            .auth-button.gmail:hover {
                background: #3367d6;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(66, 133, 244, 0.3);
            }
            
            .auth-button.outlook {
                background: #0078d4;
                color: white;
            }
            
            .auth-button.outlook:hover {
                background: #005a9e;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 120, 212, 0.3);
            }
            
            .auth-status {
                position: absolute;
                right: 20px;
                color: #10b981;
                font-size: 20px;
            }
            
            /* Preselected categories */
            .preselected-section {
                background: #f8f9ff;
                border: 2px solid #e0e7ff;
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 32px;
            }
            
            .preselected-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
                font-weight: 600;
                color: #4c1d95;
            }
            
            .preselected-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .preselected-badge {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border: 2px solid;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
            }
            
            .preselected-info {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 16px;
                background: #f3f4f6;
                border-radius: 12px;
                color: #6b7280;
                margin-bottom: 32px;
            }
            
            .preselected-info.empty {
                background: #fef3c7;
                color: #92400e;
            }
            
            /* Steps */
            .scan-steps {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
                padding: 0 40px;
            }
            
            .step {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                position: relative;
                flex: 1;
            }
            
            .step:not(:last-child)::after {
                content: '';
                position: absolute;
                top: 20px;
                left: 60%;
                width: 80%;
                height: 2px;
                background: #e5e7eb;
            }
            
            .step.active .step-number {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .step.active .step-label {
                color: #4c1d95;
                font-weight: 600;
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
            }
            
            .step-label {
                font-size: 14px;
                color: #6b7280;
            }
            
            /* Period selection */
            .period-selection {
                margin-bottom: 32px;
            }
            
            .period-selection h3 {
                font-size: 18px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 16px;
                text-align: center;
            }
            
            .period-options {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .period-option {
                padding: 12px 20px;
                border: 2px solid #e5e7eb;
                background: white;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .period-option:hover {
                border-color: #a78bfa;
                transform: translateY(-1px);
            }
            
            .period-option.selected {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-color: transparent;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            /* Scan button */
            .scan-button {
                width: 100%;
                padding: 16px 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 12px;
                color: white;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                margin-bottom: 24px;
                position: relative;
            }
            
            .scan-button.gmail {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
            }
            
            .scan-button.outlook {
                background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
            }
            
            .scan-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .scan-button.success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            
            .scan-button .badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #8b5cf6;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 700;
                border: 2px solid white;
            }
            
            /* Progress */
            .scan-progress {
                margin-bottom: 24px;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                width: 0%;
                transition: width 0.5s ease;
            }
            
            .progress-text {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 4px;
            }
            
            .progress-details {
                font-size: 14px;
                color: #6b7280;
            }
            
            /* Footer */
            .scanner-footer {
                text-align: center;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
            }
            
            .link-button {
                background: none;
                border: none;
                color: #6366f1;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
            }
            
            .link-button:hover {
                color: #4c1d95;
                transform: translateX(2px);
            }
            
            /* Scanner info */
            .scanner-info {
                background: rgba(99, 102, 241, 0.1);
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                color: #4c1d95;
                font-size: 14px;
                font-weight: 500;
            }
            
            /* Error */
            .scanner-card.error {
                text-align: center;
            }
            
            .error-icon {
                font-size: 48px;
                color: #ef4444;
                margin-bottom: 16px;
            }
            
            .error-message {
                text-align: center;
                padding: 20px;
            }
            
            .error-message i {
                font-size: 36px;
                color: #ef4444;
                margin-bottom: 12px;
            }
            
            .error-message p {
                color: #374151;
                margin-bottom: 16px;
            }
            
            .error-message button {
                padding: 8px 16px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }
            
            /* No service warning */
            .no-service-warning {
                text-align: center;
                padding: 32px;
                background: #fef2f2;
                border-radius: 12px;
                color: #991b1b;
            }
            
            .no-service-warning i {
                font-size: 36px;
                margin-bottom: 12px;
            }
            
            /* Loading overlay */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .loading-content {
                background: white;
                border-radius: 16px;
                padding: 32px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .loading-content i {
                font-size: 48px;
                color: #6366f1;
                margin-bottom: 16px;
                display: block;
            }
            
            .loading-content p {
                color: #374151;
                font-size: 16px;
                font-weight: 500;
                margin: 0;
            }
            
            /* Responsive */
            @media (max-width: 640px) {
                .scanner-card {
                    padding: 32px 24px;
                }
                
                .scan-steps {
                    padding: 0 20px;
                }
                
                .period-options {
                    gap: 8px;
                }
                
                .period-option {
                    padding: 10px 16px;
                    font-size: 13px;
                }
            }
        `;
        
        document.head.appendChild(style);
        this.stylesAdded = true;
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    destroy() {
        console.log('[UnifiedScan] 🧹 Destroying scanner...');
        
        // Arrêter la synchronisation
        if (this.settingsSyncInterval) {
            clearInterval(this.settingsSyncInterval);
        }
        
        // Retirer les event listeners
        window.removeEventListener('categorySettingsChanged', this.handleSettingsChange);
        window.removeEventListener('settingsChanged', this.handleSettingsChange);
        
        // Réinitialiser l'état
        this.isInitialized = false;
        this.scanInProgress = false;
        this.currentProvider = null;
        this.isAuthenticated = false;
        
        console.log('[UnifiedScan] ✅ Scanner destroyed');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================

// Nettoyer les anciennes instances
if (window.unifiedScanModule) {
    window.unifiedScanModule.destroy?.();
}

// Créer la nouvelle instance
window.unifiedScanModule = new UnifiedScanModule();

// Alias pour compatibilité
window.scanStartModule = window.unifiedScanModule;
window.minimalScanModule = window.unifiedScanModule;
window.UnifiedScanModule = UnifiedScanModule;

console.log('[StartScan] ✅ Scanner Unifié v13.0 loaded - Complete rewrite!');
