// startscan.js - Version 6.0 - Scanner d'emails avec interface corrigée

class ScanStartModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedFolders = ['inbox'];
        this.selectedDays = 30; // Paramètre par défaut augmenté
        this.autoClassifyEmails = true;
        this.autoCreateTasks = true;
        this.excludedDomains = this.getExcludedDomains();
        this.stylesAdded = false;
        
        this.scanSettings = {
            startDate: this.getStartDateFromDays(30),
            endDate: new Date().toISOString().split('T')[0],
            maxEmails: 1000
        };
        
        this.addUltraMinimalStyles();
        console.log('[ScanStart] Module initialized - ULTRA MINIMAL v6.0');
    }

    getExcludedDomains() {
        try {
            const saved = localStorage.getItem('excludedDomains');
            return saved ? JSON.parse(saved) : ['newsletter.com', 'noreply.com', 'donotreply.com'];
        } catch (e) {
            return ['newsletter.com', 'noreply.com', 'donotreply.com'];
        }
    }

    getStartDateFromDays(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    addUltraMinimalStyles() {
        if (this.stylesAdded) return;
        
        const styles = document.createElement('style');
        styles.id = 'ultra-minimal-scan-styles';
        styles.textContent = `
            /* Scanner Ultra Minimal */
            .scanner-minimal {
                max-width: 900px;
                margin: 20px auto;
                padding: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            .scanner-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f1f5f9;
            }
            
            .user-welcome {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .user-avatar {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
            }
            
            .scanner-title {
                margin: 0;
                font-size: 28px;
                color: #1e293b;
                font-weight: 700;
            }
            
            .scanner-subtitle {
                margin: 5px 0 0 0;
                color: #64748b;
                font-size: 16px;
            }
            
            /* Configuration rapide */
            .quick-config {
                margin-bottom: 30px;
            }
            
            .config-row {
                margin-bottom: 25px;
            }
            
            .config-item {
                background: #f8fafc;
                border-radius: 8px;
                padding: 20px;
            }
            
            .config-label {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 15px;
                font-size: 16px;
            }
            
            /* Sélecteur de période */
            .period-selector {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .period-chip {
                padding: 12px 20px;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
                color: #64748b;
            }
            
            .period-chip:hover {
                border-color: #667eea;
                background: #f1f5f9;
            }
            
            .period-chip.selected {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
            
            /* Sélecteur de dossiers */
            .folders-selector {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .folder-chip {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 18px;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
                color: #64748b;
            }
            
            .folder-chip:hover {
                border-color: #667eea;
                background: #f1f5f9;
            }
            
            .folder-chip.selected {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
            
            /* Options IA */
            .ai-options {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .switch-option {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            
            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e1;
                transition: .4s;
                border-radius: 24px;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            
            input:checked + .slider {
                background-color: #667eea;
            }
            
            input:checked + .slider:before {
                transform: translateX(26px);
            }
            
            .option-label {
                font-weight: 500;
                color: #374151;
            }
            
            /* Aperçu */
            .scan-preview {
                background: #f0f9ff;
                border: 1px solid #7dd3fc;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
            }
            
            .preview-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: #0c4a6e;
                margin-bottom: 15px;
                font-size: 16px;
            }
            
            .preview-content {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .preview-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .preview-label {
                color: #64748b;
                font-weight: 500;
            }
            
            .preview-value {
                color: #1e293b;
                font-weight: 600;
            }
            
            /* Action de scan */
            .scan-action {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .btn-scan {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 18px 40px;
                border-radius: 12px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 12px;
                min-width: 250px;
                justify-content: center;
                margin-bottom: 20px;
            }
            
            .btn-scan:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .btn-scan:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }
            
            .scan-info {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                color: #64748b;
                font-size: 14px;
            }
            
            .advanced-options {
                margin-top: 20px;
            }
            
            .btn-link {
                background: none;
                border: none;
                color: #667eea;
                cursor: pointer;
                text-decoration: underline;
                font-size: 14px;
            }
            
            /* Barre de progression */
            .progress-container {
                background: #f8fafc;
                border-radius: 12px;
                padding: 25px;
                margin-top: 20px;
                display: none;
            }
            
            .progress-container.active {
                display: block;
            }
            
            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .progress-header h3 {
                margin: 0;
                color: #1e293b;
                font-size: 18px;
            }
            
            .progress-percentage {
                font-weight: 600;
                color: #667eea;
                font-size: 16px;
            }
            
            .progress-bar {
                width: 100%;
                height: 12px;
                background: #e2e8f0;
                border-radius: 6px;
                overflow: hidden;
                margin-bottom: 15px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 6px;
                transition: width 0.5s ease;
                width: 0%;
            }
            
            .progress-text {
                color: #475569;
                font-weight: 500;
                margin-bottom: 5px;
            }
            
            .progress-stats {
                color: #64748b;
                font-size: 14px;
            }
            
            .btn-cancel {
                background: #ef4444;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                margin-top: 15px;
                cursor: pointer;
                display: none;
            }
            
            .btn-cancel:hover {
                background: #dc2626;
            }
            
            /* Guide d'utilisation */
            .usage-guide {
                background: #f9fafb;
                border-radius: 8px;
                padding: 20px;
                margin-top: 30px;
            }
            
            .guide-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 15px;
                font-size: 16px;
            }
            
            .guide-tips {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .tip {
                display: flex;
                gap: 12px;
                align-items: flex-start;
            }
            
            .tip-icon {
                font-size: 20px;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .tip-content {
                flex: 1;
            }
            
            .tip-title {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 4px;
            }
            
            .tip-text {
                color: #64748b;
                font-size: 14px;
                line-height: 1.5;
            }
            
            /* États d'erreur et auth */
            .auth-needed-modern {
                text-align: center;
                padding: 60px 20px;
            }
            
            .auth-icon {
                font-size: 60px;
                color: #f59e0b;
                margin-bottom: 20px;
            }
            
            .auth-needed-modern h2 {
                color: #1e293b;
                margin-bottom: 10px;
                font-size: 24px;
            }
            
            .auth-needed-modern p {
                color: #64748b;
                margin-bottom: 30px;
                font-size: 16px;
            }
            
            .btn-modern {
                padding: 12px 24px;
                border-radius: 8px;
                border: none;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-auth {
                background: #667eea;
                color: white;
            }
            
            .btn-auth:hover {
                background: #5b6ee8;
            }
            
            .error-state-modern {
                text-align: center;
                padding: 40px 20px;
            }
            
            .error-icon {
                font-size: 50px;
                color: #ef4444;
                margin-bottom: 20px;
            }
            
            .error-details-modern {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            
            .error-detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #fee2e2;
            }
            
            .error-detail-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .detail-label {
                font-weight: 500;
                color: #374151;
            }
            
            .detail-status {
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .status-ok {
                background: #d1fae5;
                color: #065f46;
            }
            
            .status-error {
                background: #fee2e2;
                color: #991b1b;
            }
            
            .error-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin-top: 20px;
            }
            
            .btn-retry {
                background: #3b82f6;
                color: white;
            }
            
            .btn-retry:hover {
                background: #2563eb;
            }
            
            .btn-diagnose {
                background: #f59e0b;
                color: white;
            }
            
            .btn-diagnose:hover {
                background: #d97706;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .scanner-minimal {
                    margin: 10px;
                    padding: 15px;
                }
                
                .period-selector, .folders-selector {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .period-chip, .folder-chip {
                    justify-content: center;
                    text-align: center;
                }
                
                .btn-scan {
                    padding: 16px 30px;
                    font-size: 16px;
                    min-width: 200px;
                }
                
                .preview-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                
                .guide-tips {
                    gap: 12px;
                }
                
                .tip {
                    flex-direction: column;
                    text-align: center;
                    gap: 8px;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[ScanStart] ✅ Ultra minimal styles added');
    }

    async render(container) {
        console.log('[ScanStart] Rendering ultra minimal scanner interface...');
        
        try {
            // S'assurer que les styles sont chargés
            this.addUltraMinimalStyles();
            
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            // Vérifier et initialiser les services
            await this.checkAndInitializeServices();

            const userInfo = await this.getUserInfo();
            container.innerHTML = this.renderUltraMinimalScanInterface(userInfo);
            this.initializeUltraMinimalEvents();
            this.isInitialized = true;
            
            console.log('[ScanStart] ✅ Ultra minimal scanner interface ready');
            
        } catch (error) {
            console.error('[ScanStart] Error rendering interface:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    async checkAndInitializeServices() {
        console.log('[ScanStart] Checking and initializing services...');
        
        // Vérifier AuthService
        if (!window.authService) {
            throw new Error('Service d\'authentification non disponible');
        }
        
        if (!window.authService.isAuthenticated()) {
            throw new Error('Utilisateur non authentifié');
        }

        // Vérifier MailService
        if (!window.mailService) {
            throw new Error('Service de messagerie non disponible');
        }

        // Initialiser MailService si nécessaire
        try {
            if (!window.mailService.isInitialized) {
                console.log('[ScanStart] Initializing MailService...');
                await window.mailService.initialize();
                console.log('[ScanStart] ✅ MailService initialized successfully');
            }
        } catch (initError) {
            console.error('[ScanStart] MailService initialization error:', initError);
            throw new Error(`Impossible d'initialiser le service de messagerie: ${initError.message}`);
        }
    }

    renderUltraMinimalScanInterface(userInfo) {
        return `
            <div class="scanner-minimal">
                <!-- En-tête avec info utilisateur -->
                <div class="scanner-header">
                    <div class="user-welcome">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-info">
                            <h1 class="scanner-title">
                                <i class="fas fa-search"></i>
                                Scanner d'emails
                            </h1>
                            <p class="scanner-subtitle">Bonjour ${userInfo.displayName || 'Utilisateur'} • Analysez vos emails intelligemment</p>
                        </div>
                    </div>
                </div>
                
                <!-- Contenu principal -->
                <div class="scanner-content">
                    <!-- Configuration rapide -->
                    <div class="quick-config">
                        <div class="config-row">
                            <div class="config-item">
                                <label class="config-label">
                                    <i class="fas fa-calendar-alt"></i>
                                    Période à analyser
                                </label>
                                <div class="period-selector">
                                    <div class="period-chip" onclick="window.scanStartModule.selectDays(1)">1 jour</div>
                                    <div class="period-chip" onclick="window.scanStartModule.selectDays(7)">7 jours</div>
                                    <div class="period-chip selected" onclick="window.scanStartModule.selectDays(30)">30 jours</div>
                                    <div class="period-chip" onclick="window.scanStartModule.selectDays(90)">90 jours</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="config-row">
                            <div class="config-item">
                                <label class="config-label">
                                    <i class="fas fa-folder"></i>
                                    Dossiers à scanner
                                </label>
                                <div class="folders-selector">
                                    <div class="folder-chip selected" onclick="window.scanStartModule.toggleFolder('inbox')">
                                        <i class="fas fa-inbox"></i>
                                        Boîte de réception
                                    </div>
                                    <div class="folder-chip" onclick="window.scanStartModule.toggleFolder('junkemail')">
                                        <i class="fas fa-trash-alt"></i>
                                        Courrier indésirable
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="config-row">
                            <div class="config-item">
                                <label class="config-label">
                                    <i class="fas fa-robot"></i>
                                    Options intelligentes
                                </label>
                                <div class="ai-options">
                                    <div class="switch-option">
                                        <label class="switch">
                                            <input type="checkbox" id="autoClassify" 
                                                ${this.autoClassifyEmails ? 'checked' : ''}
                                                onchange="window.scanStartModule.toggleAutoClassify()">
                                            <span class="slider"></span>
                                        </label>
                                        <span class="option-label">Classification automatique par IA</span>
                                    </div>
                                    
                                    <div class="switch-option">
                                        <label class="switch">
                                            <input type="checkbox" id="autoTasks" 
                                                ${this.autoCreateTasks ? 'checked' : ''}
                                                onchange="window.scanStartModule.toggleAutoTasks()">
                                            <span class="slider"></span>
                                        </label>
                                        <span class="option-label">Création automatique de tâches</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Aperçu des paramètres -->
                    <div class="scan-preview">
                        <div class="preview-title">
                            <i class="fas fa-eye"></i>
                            Aperçu du scan
                        </div>
                        <div class="preview-content">
                            <div class="preview-item">
                                <span class="preview-label">Période :</span>
                                <span class="preview-value" id="previewPeriod">30 derniers jours</span>
                            </div>
                            <div class="preview-item">
                                <span class="preview-label">Dossiers :</span>
                                <span class="preview-value" id="previewFolders">Boîte de réception</span>
                            </div>
                            <div class="preview-item">
                                <span class="preview-label">IA activée :</span>
                                <span class="preview-value" id="previewAI">Classification + Tâches</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action de scan -->
                    <div id="scanAction" class="scan-action">
                        <button class="btn-scan" id="startScanBtn" onclick="window.scanStartModule.startUltraMinimalScan()">
                            <i class="fas fa-search"></i>
                            <span>Démarrer le scan intelligent</span>
                        </button>
                        
                        <div class="scan-info">
                            <div class="info-item">
                                <i class="fas fa-shield-alt"></i>
                                <span>Scan sécurisé via Microsoft Graph API</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <span>Durée estimée : 30 secondes à 2 minutes</span>
                            </div>
                        </div>
                        
                        <div class="advanced-options">
                            <button class="btn-link" onclick="window.scanStartModule.showAdvancedOptions()">
                                <i class="fas fa-cog"></i>
                                Options avancées
                            </button>
                        </div>
                    </div>
                    
                    <!-- Barre de progression -->
                    <div id="progressContainer" class="progress-container">
                        <div class="progress-header">
                            <h3 id="progressTitle">Scan en cours...</h3>
                            <div id="progressPercentage" class="progress-percentage">0%</div>
                        </div>
                        <div class="progress-bar">
                            <div id="progressFill" class="progress-fill"></div>
                        </div>
                        <div class="progress-details">
                            <div id="progressText" class="progress-text">Initialisation...</div>
                            <div id="progressStats" class="progress-stats"></div>
                        </div>
                        
                        <button id="cancelScanBtn" class="btn-cancel" onclick="window.scanStartModule.cancelScan()">
                            <i class="fas fa-times"></i>
                            Annuler le scan
                        </button>
                    </div>
                </div>
                
                <!-- Guide d'utilisation -->
                <div class="usage-guide">
                    <div class="guide-title">
                        <i class="fas fa-lightbulb"></i>
                        Comment optimiser votre scan
                    </div>
                    <div class="guide-tips">
                        <div class="tip">
                            <div class="tip-icon">💡</div>
                            <div class="tip-content">
                                <div class="tip-title">Commencez par 30 jours</div>
                                <div class="tip-text">Pour un premier scan, analysez les 30 derniers jours pour des résultats complets et pertinents</div>
                            </div>
                        </div>
                        <div class="tip">
                            <div class="tip-icon">🎯</div>
                            <div class="tip-content">
                                <div class="tip-title">Activez l'IA</div>
                                <div class="tip-text">La classification automatique vous fait gagner du temps en organisant vos emails par catégorie</div>
                            </div>
                        </div>
                        <div class="tip">
                            <div class="tip-icon">📋</div>
                            <div class="tip-content">
                                <div class="tip-title">Tâches automatiques</div>
                                <div class="tip-text">L'IA crée des tâches pour les emails nécessitant une action de votre part</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotAuthenticated() {
        return `
            <div class="scanner-minimal">
                <div class="auth-needed-modern">
                    <div class="auth-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h2>Connexion requise</h2>
                    <p>Connectez-vous à votre compte Microsoft pour accéder à vos emails</p>
                    <button class="btn-modern btn-auth" onclick="window.authService.login()">
                        <i class="fab fa-microsoft"></i>
                        <span>Se connecter avec Microsoft</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderError(error) {
        return `
            <div class="scanner-minimal">
                <div class="error-state-modern">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h2>Problème d'initialisation</h2>
                    <p>${error.message}</p>
                    <div class="error-details-modern">
                        <div class="error-detail-item">
                            <span class="detail-label">Service d'authentification:</span>
                            <span class="detail-status ${window.authService ? 'status-ok' : 'status-error'}">
                                ${window.authService ? '✓ Disponible' : '✗ Indisponible'}
                            </span>
                        </div>
                        <div class="error-detail-item">
                            <span class="detail-label">Utilisateur authentifié:</span>
                            <span class="detail-status ${window.authService?.isAuthenticated() ? 'status-ok' : 'status-error'}">
                                ${window.authService?.isAuthenticated() ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                        <div class="error-detail-item">
                            <span class="detail-label">Service de messagerie:</span>
                            <span class="detail-status ${window.mailService ? 'status-ok' : 'status-error'}">
                                ${window.mailService ? '✓ Disponible' : '✗ Indisponible'}
                            </span>
                        </div>
                        <div class="error-detail-item">
                            <span class="detail-label">MailService initialisé:</span>
                            <span class="detail-status ${window.mailService?.isInitialized ? 'status-ok' : 'status-error'}">
                                ${window.mailService?.isInitialized ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                    </div>
                    <div class="error-actions">
                        <button class="btn-modern btn-retry" onclick="window.location.reload()">
                            <i class="fas fa-redo"></i>
                            <span>Réessayer</span>
                        </button>
                        <button class="btn-modern btn-diagnose" onclick="window.scanStartModule.runDiagnostic()">
                            <i class="fas fa-stethoscope"></i>
                            <span>Diagnostic</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async getUserInfo() {
        try {
            if (window.authService?.isAuthenticated()) {
                return await window.authService.getUserInfo();
            }
            return { displayName: 'Utilisateur' };
        } catch (error) {
            console.warn('[ScanStart] Could not get user info:', error);
            return { displayName: 'Utilisateur' };
        }
    }

    // ====================================================
    // GESTION DES ÉVÉNEMENTS ULTRA MINIMAL
    // ====================================================
    initializeUltraMinimalEvents() {
        console.log('[ScanStart] Initializing ultra minimal events...');
        
        // Mettre à jour l'aperçu en temps réel
        setTimeout(() => {
            this.updatePreview();
        }, 100);
    }
    
    selectDays(days) {
        this.selectedDays = days;
        this.scanSettings.startDate = this.getStartDateFromDays(days);
        
        // Mettre à jour l'UI
        document.querySelectorAll('.period-chip').forEach(chip => {
            chip.classList.remove('selected');
        });
        
        const selectedChip = document.querySelector(`.period-chip[onclick*="selectDays(${days})"]`);
        if (selectedChip) {
            selectedChip.classList.add('selected');
        }
        
        this.updatePreview();
        console.log(`[ScanStart] Selected period: ${days} days`);
    }
    
    toggleFolder(folderId) {
        const folderChip = document.querySelector(`.folder-chip[onclick*="toggleFolder('${folderId}')"]`);
        
        if (this.selectedFolders.includes(folderId)) {
            // Ne pas désélectionner le dernier dossier
            if (this.selectedFolders.length > 1) {
                this.selectedFolders = this.selectedFolders.filter(id => id !== folderId);
                if (folderChip) folderChip.classList.remove('selected');
            }
        } else {
            this.selectedFolders.push(folderId);
            if (folderChip) folderChip.classList.add('selected');
        }
        
        this.updatePreview();
        console.log(`[ScanStart] Selected folders: ${this.selectedFolders.join(', ')}`);
    }
    
    toggleAutoClassify() {
        const checkbox = document.getElementById('autoClassify');
        this.autoClassifyEmails = checkbox ? checkbox.checked : this.autoClassifyEmails;
        this.updatePreview();
        console.log(`[ScanStart] Auto classify: ${this.autoClassifyEmails}`);
    }
    
    toggleAutoTasks() {
        const checkbox = document.getElementById('autoTasks');
        this.autoCreateTasks = checkbox ? checkbox.checked : this.autoCreateTasks;
        this.updatePreview();
        console.log(`[ScanStart] Auto tasks: ${this.autoCreateTasks}`);
    }
    
    updatePreview() {
        // Mettre à jour l'aperçu de la période
        const previewPeriod = document.getElementById('previewPeriod');
        if (previewPeriod) {
            previewPeriod.textContent = `${this.selectedDays} dernier${this.selectedDays > 1 ? 's' : ''} jour${this.selectedDays > 1 ? 's' : ''}`;
        }
        
        // Mettre à jour l'aperçu des dossiers
        const previewFolders = document.getElementById('previewFolders');
        if (previewFolders) {
            const folderNames = this.selectedFolders.map(f => this.getFolderName(f));
            previewFolders.textContent = folderNames.join(', ');
        }
        
        // Mettre à jour l'aperçu de l'IA
        const previewAI = document.getElementById('previewAI');
        if (previewAI) {
            const features = [];
            if (this.autoClassifyEmails) features.push('Classification');
            if (this.autoCreateTasks) features.push('Tâches');
            previewAI.textContent = features.length > 0 ? features.join(' + ') : 'Désactivée';
        }
    }

    showAdvancedOptions() {
        if (window.pageManager?.loadPage) {
            window.pageManager.loadPage('settings');
        } else {
            alert('Options avancées disponibles dans les paramètres');
        }
    }

    // ====================================================
    // FONCTION DE SCAN ULTRA MINIMAL CORRIGÉE
    // ====================================================
    async startUltraMinimalScan() {
        if (this.scanInProgress) {
            return;
        }
        
        console.log('[ScanStart] 🚀 Starting ultra minimal scan with settings:', {
            days: this.selectedDays,
            folders: this.selectedFolders,
            autoClassify: this.autoClassifyEmails,
            autoCreateTasks: this.autoCreateTasks
        });
        
        try {
            this.scanInProgress = true;
            this.showProgressInterface();
            
            // Vérification finale des services
            await this.performFinalServiceCheck();
            
            // Sauvegarder les paramètres
            this.saveScanSettings();
            
            // Démarrer le scan avec EmailScanner
            await this.performEmailScannerBasedScan();
            
        } catch (error) {
            console.error('[ScanStart] ❌ Ultra minimal scan error:', error);
            this.handleScanError(error);
        }
    }
    
    showProgressInterface() {
        const scanAction = document.getElementById('scanAction');
        const progressContainer = document.getElementById('progressContainer');
        
        if (scanAction) scanAction.style.display = 'none';
        if (progressContainer) {
            progressContainer.style.display = 'block';
            progressContainer.classList.add('active');
            
            // Afficher le bouton d'annulation après 5 secondes
            setTimeout(() => {
                const cancelBtn = document.getElementById('cancelScanBtn');
                if (cancelBtn && this.scanInProgress) {
                    cancelBtn.style.display = 'block';
                }
            }, 5000);
        }
    }
    
    async performFinalServiceCheck() {
        this.updateProgress(5, 'Vérification des services', 'Connexion à Microsoft Graph API...');
        
        // Vérifications détaillées
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Service d\'authentification non disponible ou utilisateur non connecté');
        }
        
        if (!window.mailService) {
            throw new Error('Service de messagerie non disponible');
        }
        
        if (!window.mailService.isInitialized) {
            console.log('[ScanStart] MailService not initialized, initializing now...');
            await window.mailService.initialize();
        }
        
        // Test d'accès token
        try {
            const token = await window.authService.getAccessToken();
            if (!token) {
                throw new Error('Impossible d\'obtenir le token d\'accès');
            }
            console.log('[ScanStart] ✅ Access token obtained');
        } catch (tokenError) {
            throw new Error(`Erreur d\'authentification: ${tokenError.message}`);
        }
        
        // Test de connexion MailService
        try {
            const connectionTest = await window.mailService.testConnection();
            if (!connectionTest.success) {
                throw new Error(`Test de connexion échoué: ${connectionTest.error}`);
            }
            console.log('[ScanStart] ✅ MailService connection test passed');
        } catch (testError) {
            throw new Error(`Test de connexion échoué: ${testError.message}`);
        }
    }
    
    async performEmailScannerBasedScan() {
        console.log('[ScanStart] Using EmailScanner for scan execution');
        
        try {
            // Utiliser EmailScanner si disponible
            if (window.emailScanner) {
                console.log('[ScanStart] EmailScanner available, using it for scan');
                
                const scanOptions = {
                    days: this.selectedDays,
                    folder: this.selectedFolders[0], // Prendre le premier dossier pour commencer
                    onProgress: (progress) => {
                        this.handleScanProgress(progress);
                    },
                    maxEmails: 1000
                };
                
                console.log('[ScanStart] Scan options:', scanOptions);
                
                const results = await window.emailScanner.scan(scanOptions);
                
                if (results && results.success) {
                    console.log('[ScanStart] ✅ Scan completed successfully:', results);
                    this.completeScanWithSuccess(results);
                } else {
                    throw new Error('EmailScanner returned no results or failed');
                }
                
            } else {
                throw new Error('EmailScanner not available');
            }
            
        } catch (error) {
            console.error('[ScanStart] EmailScanner scan failed:', error);
            throw error;
        }
    }
    
    handleScanProgress(progress) {
        console.log('[ScanStart] Progress update:', progress);
        
        if (progress.phase === 'fetching') {
            this.updateProgress(20, 'Récupération des emails', progress.message || 'Téléchargement...');
        } else if (progress.phase === 'categorizing') {
            const percent = 20 + Math.floor((progress.progress?.current / progress.progress?.total) * 60);
            this.updateProgress(percent, 'Classification', progress.message || 'Classification en cours...');
        } else if (progress.phase === 'complete') {
            this.updateProgress(100, 'Terminé !', 'Scan complété avec succès');
        } else if (progress.phase === 'error') {
            this.updateProgress(0, 'Erreur', progress.message || 'Une erreur est survenue');
        }
    }
    
    completeScanWithSuccess(results) {
        console.log('[ScanStart] Completing scan with results:', results);
        
        this.updateProgress(100, 'Scan terminé !', `${results.total} emails analysés avec succès`);
        
        // Notification de succès
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(
                `✅ Scan terminé ! ${results.total} emails analysés`, 
                'success',
                5000
            );
        }
        
        // Redirection vers les emails après un délai
        setTimeout(() => {
            if (window.pageManager?.loadPage) {
                console.log('[ScanStart] Redirecting to emails page');
                window.pageManager.loadPage('emails');
            } else {
                console.log('[ScanStart] PageManager not available, showing results inline');
                this.showScanResultsInline(results);
            }
        }, 2000);
    }
    
    showScanResultsInline(results) {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.innerHTML = `
                <div class="scan-results-inline">
                    <div class="results-header">
                        <i class="fas fa-check-circle" style="color: #10b981; font-size: 48px;"></i>
                        <h3>Scan terminé avec succès !</h3>
                    </div>
                    <div class="results-stats">
                        <div class="stat-item">
                            <div class="stat-value">${results.total}</div>
                            <div class="stat-label">Emails analysés</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${results.categorized || 0}</div>
                            <div class="stat-label">Emails catégorisés</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.selectedFolders.length}</div>
                            <div class="stat-label">Dossiers scannés</div>
                        </div>
                    </div>
                    <div class="results-actions">
                        <button class="btn-modern btn-primary" onclick="window.pageManager?.loadPage('emails') || window.location.reload()">
                            <i class="fas fa-envelope"></i>
                            Voir les emails
                        </button>
                        <button class="btn-modern btn-secondary" onclick="window.scanStartModule.resetScanInterface()">
                            <i class="fas fa-redo"></i>
                            Nouveau scan
                        </button>
                    </div>
                </div>
            `;
        }
    }

    handleScanError(error) {
        console.error('[ScanStart] Handling scan error:', error);
        
        this.updateProgress(
            0, 
            'Erreur de scan', 
            error.message,
            'Le scan a été interrompu'
        );
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(`Erreur: ${error.message}`, 'error', 8000);
        }
        
        // Afficher les options de récupération après 3 secondes
        setTimeout(() => {
            const progressContainer = document.getElementById('progressContainer');
            if (progressContainer) {
                progressContainer.innerHTML = `
                    <div class="scan-error-inline">
                        <div class="error-header">
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 48px;"></i>
                            <h3>Erreur pendant le scan</h3>
                        </div>
                        <div class="error-message">
                            <p>${error.message}</p>
                        </div>
                        <div class="error-actions">
                            <button class="btn-modern btn-retry" onclick="window.scanStartModule.resetScanInterface()">
                                <i class="fas fa-redo"></i>
                                Réessayer
                            </button>
                            <button class="btn-modern btn-diagnose" onclick="window.scanStartModule.runDiagnostic()">
                                <i class="fas fa-stethoscope"></i>
                                Diagnostic
                            </button>
                        </div>
                    </div>
                `;
            }
        }, 3000);
        
        this.scanInProgress = false;
    }

    cancelScan() {
        console.log('[ScanStart] Scan cancelled by user');
        
        this.scanInProgress = false;
        
        this.updateProgress(
            0, 
            'Scan annulé', 
            'Le scan a été annulé par l\'utilisateur',
            ''
        );
        
        setTimeout(() => {
            this.resetScanInterface();
        }, 2000);
    }

    async runDiagnostic() {
        console.log('[ScanStart] Running comprehensive diagnostic...');
        
        const diagnosticResults = {
            timestamp: new Date().toISOString(),
            authService: null,
            mailService: null,
            connectivity: null,
            configuration: null
        };
        
        // Test AuthService
        try {
            diagnosticResults.authService = {
                available: !!window.authService,
                authenticated: window.authService?.isAuthenticated() || false,
                diagnostic: window.authService?.getDiagnosticInfo?.() || null
            };
        } catch (e) {
            diagnosticResults.authService = { error: e.message };
        }
        
        // Test MailService
        try {
            diagnosticResults.mailService = {
                available: !!window.mailService,
                initialized: window.mailService?.isInitialized || false,
                diagnostic: window.mailService?.getDebugInfo?.() || null
            };
            
            if (window.mailService?.testConnection) {
                diagnosticResults.connectivity = await window.mailService.testConnection();
            }
        } catch (e) {
            diagnosticResults.mailService = { error: e.message };
        }
        
        // Test Configuration
        try {
            diagnosticResults.configuration = window.AppConfig?.getDebugInfo?.() || null;
        } catch (e) {
            diagnosticResults.configuration = { error: e.message };
        }
        
        console.group('🔍 DIAGNOSTIC COMPLET DU SCANNER');
        console.log('📊 Résultats:', diagnosticResults);
        console.groupEnd();
        
        // Afficher les résultats
        this.showDiagnosticResults(diagnosticResults);
    }
    
    showDiagnosticResults(results) {
        const content = `
            <div class="diagnostic-modal">
                <div class="diagnostic-header">
                    <h3>Diagnostic du scanner</h3>
                </div>
                <div class="diagnostic-content">
                    <div class="diagnostic-section">
                        <h4>🔐 Service d'authentification</h4>
                        <div class="diagnostic-item">
                            <span>Disponible:</span>
                            <span class="${results.authService?.available ? 'status-ok' : 'status-error'}">
                                ${results.authService?.available ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                        <div class="diagnostic-item">
                            <span>Authentifié:</span>
                            <span class="${results.authService?.authenticated ? 'status-ok' : 'status-error'}">
                                ${results.authService?.authenticated ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="diagnostic-section">
                        <h4>📧 Service de messagerie</h4>
                        <div class="diagnostic-item">
                            <span>Disponible:</span>
                            <span class="${results.mailService?.available ? 'status-ok' : 'status-error'}">
                                ${results.mailService?.available ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                        <div class="diagnostic-item">
                            <span>Initialisé:</span>
                            <span class="${results.mailService?.initialized ? 'status-ok' : 'status-error'}">
                                ${results.mailService?.initialized ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="diagnostic-section">
                        <h4>🌐 Connectivité</h4>
                        <div class="diagnostic-item">
                            <span>Microsoft Graph:</span>
                            <span class="${results.connectivity?.success ? 'status-ok' : 'status-error'}">
                                ${results.connectivity?.success ? '✓ Accessible' : '✗ Inaccessible'}
                            </span>
                        </div>
                        ${results.connectivity?.error ? `
                        <div class="diagnostic-error">
                            Erreur: ${results.connectivity.error}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="diagnostic-actions">
                        <button class="btn-modern" onclick="window.uiManager?.closeModal?.()">Fermer</button>
                        <button class="btn-modern btn-primary" onclick="window.location.reload()">Actualiser</button>
                    </div>
                </div>
            </div>
        `;
        
        if (window.uiManager?.showModal) {
            window.uiManager.showModal(content, { title: 'Diagnostic', size: 'medium' });
        } else {
            alert('Diagnostic terminé. Consultez la console pour les détails.');
        }
    }

    // ====================================================
    // FONCTIONS UTILITAIRES
    // ====================================================
    updateProgress(progress, status, detail, stats = '') {
        const progressFill = document.getElementById('progressFill');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressTitle = document.getElementById('progressTitle');
        const progressText = document.getElementById('progressText');
        const progressStats = document.getElementById('progressStats');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressPercentage) progressPercentage.textContent = `${progress}%`;
        if (progressTitle) progressTitle.textContent = status;
        if (progressText) progressText.textContent = detail;
        if (progressStats && stats) progressStats.textContent = stats;
    }
    
    getFolderName(folderId) {
        const folderNames = {
            'inbox': 'Boîte de réception',
            'junkemail': 'Courrier indésirable',
            'sentitems': 'Éléments envoyés',
            'drafts': 'Brouillons',
            'archive': 'Archive'
        };
        return folderNames[folderId] || folderId;
    }
    
    resetScanInterface() {
        const scanAction = document.getElementById('scanAction');
        const progressContainer = document.getElementById('progressContainer');
        
        if (scanAction) scanAction.style.display = 'flex';
        if (progressContainer) {
            progressContainer.style.display = 'none';
            progressContainer.classList.remove('active');
        }
        
        this.scanInProgress = false;
        console.log('[ScanStart] ✅ Interface reset');
    }
    
    saveScanSettings() {
        try {
            const settings = {
                selectedDays: this.selectedDays,
                selectedFolders: this.selectedFolders,
                autoClassifyEmails: this.autoClassifyEmails,
                autoCreateTasks: this.autoCreateTasks,
                excludedDomains: this.excludedDomains,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('scanSettings', JSON.stringify(settings));
            console.log('[ScanStart] ✅ Settings saved');
        } catch (e) {
            console.warn('[ScanStart] Could not save settings:', e);
        }
    }
    
    // ====================================================
    // MÉTHODE PROGRAMMATIQUE POUR PAGEMANAGER
    // ====================================================
    async startScanProgrammatically(options = {}) {
        console.log('[ScanStart] Starting scan programmatically with options:', options);
        
        // Mettre à jour les paramètres si fournis
        if (options.days !== undefined) {
            this.selectedDays = options.days;
        }
        if (options.folders && Array.isArray(options.folders)) {
            this.selectedFolders = options.folders;
        }
        if (options.autoClassify !== undefined) {
            this.autoClassifyEmails = options.autoClassify;
        }
        if (options.autoCreateTasks !== undefined) {
            this.autoCreateTasks = options.autoCreateTasks;
        }
        
        // Démarrer le scan
        await this.startUltraMinimalScan();
    }
}

// Créer l'instance globale
window.scanStartModule = new ScanStartModule();

console.log('[ScanStart] 🚀 Ultra minimal ScanStartModule ready');
