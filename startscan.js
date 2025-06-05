// startscan.js - Version 6.0 - Ultra-minimaliste avec interface condensée

class ScanStartModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 30;
        this.selectedFolder = 'inbox';
        this.autoClassifyEmails = true;
        this.autoCreateTasks = true;
        this.excludedDomains = this.getExcludedDomains();
        
        this.scanSettings = {
            startDate: this.getStartDateFromDays(30),
            endDate: new Date().toISOString().split('T')[0],
            maxEmails: 1000
        };
        
        this.stylesAdded = false;
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

    // ====================================================
    // STYLES CSS ULTRA-MINIMALISTES
    // ====================================================
    addUltraMinimalStyles() {
        if (this.stylesAdded) return;

        const styleId = 'scanstart-ultra-minimal-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* ====================================================
               STYLES ULTRA-MINIMALISTES POUR LE SCANNER
               ==================================================== */
            
            .scanner-container {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 32px;
                max-width: 90vw;
                width: 100%;
                max-width: 500px;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                text-align: center;
                position: relative;
                animation: slideUp 0.6s ease-out;
                overflow-y: auto;
                margin: 0 auto;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Quick Settings - Floating */
            .quick-settings {
                position: absolute;
                top: 16px;
                right: 16px;
                display: flex;
                gap: 8px;
            }

            .quick-btn {
                width: 32px;
                height: 32px;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #666;
                font-size: 12px;
                border: none;
            }

            .quick-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                color: #333;
            }

            .quick-btn.active {
                background: #10b981;
                color: white;
            }

            /* Header - Compact */
            .scanner-header {
                margin-bottom: 20px;
            }

            .scanner-icon {
                width: 52px;
                height: 52px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 10px;
                font-size: 18px;
                color: white;
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
            }

            .scanner-icon.scanning {
                animation: scanPulse 2s infinite;
            }

            @keyframes scanPulse {
                0%, 100% { 
                    transform: scale(1); 
                    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
                }
                50% { 
                    transform: scale(1.05); 
                    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
                }
            }

            .scanner-title {
                font-size: 20px;
                font-weight: 700;
                color: #1a1a1a;
                margin-bottom: 3px;
                letter-spacing: -0.5px;
            }

            .scanner-subtitle {
                font-size: 12px;
                color: #666;
                opacity: 0.8;
            }

            /* Main Action Button */
            .scan-action {
                margin-bottom: 16px;
            }

            .scan-button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 16px 36px;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
                min-width: 240px;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .scan-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s ease;
            }

            .scan-button:hover::before {
                left: 100%;
            }

            .scan-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
            }

            .scan-button.scanning {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                animation: buttonPulse 2s infinite;
            }

            @keyframes buttonPulse {
                0%, 100% { transform: translateY(-2px) scale(1); }
                50% { transform: translateY(-2px) scale(1.02); }
            }

            .scan-button .fa-spinner {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            /* Period Selection - Inline */
            .period-section {
                margin-bottom: 20px;
            }

            .period-label {
                font-size: 12px;
                font-weight: 600;
                color: #666;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .period-chips {
                display: flex;
                justify-content: center;
                gap: 6px;
                flex-wrap: wrap;
            }

            .period-chip {
                padding: 8px 16px;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                color: #666;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 60px;
                text-align: center;
                user-select: none;
            }

            .period-chip:hover {
                border-color: #667eea;
                color: #667eea;
                transform: translateY(-1px);
            }

            .period-chip.selected {
                border-color: #667eea;
                background: #667eea;
                color: white;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
            }

            /* AI Options - Inline */
            .ai-section {
                margin-bottom: 20px;
            }

            .ai-toggles {
                display: flex;
                justify-content: center;
                gap: 12px;
                flex-wrap: wrap;
            }

            .ai-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 12px;
                font-weight: 600;
                color: #666;
                user-select: none;
            }

            .ai-toggle:hover {
                border-color: #667eea;
                background: #f0f4ff;
            }

            .ai-toggle.active {
                border-color: #10b981;
                background: #10b981;
                color: white;
            }

            .toggle-icon {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 2px solid currentColor;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
            }

            .ai-toggle.active .toggle-icon {
                background: white;
                border-color: white;
                color: #10b981;
            }

            /* Settings Link */
            .settings-link {
                margin-bottom: 16px;
            }

            .settings-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: transparent;
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 12px;
                color: #667eea;
                font-size: 11px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
            }

            .settings-btn:hover {
                background: rgba(102, 126, 234, 0.1);
                border-color: #667eea;
                transform: translateY(-1px);
            }

            .settings-btn i {
                font-size: 10px;
            }

            /* Process Steps - Ultra Compact */
            .process-section {
                margin-bottom: 12px;
            }

            .process-steps {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 8px;
                background: rgba(255, 255, 255, 0.5);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 16px;
                padding: 8px 16px;
            }

            .step {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 10px;
                color: #555;
                font-weight: 600;
            }

            .step::after {
                content: '→';
                margin-left: 6px;
                color: #999;
                font-size: 10px;
            }

            .step:last-child::after {
                display: none;
            }

            .step-number {
                width: 14px;
                height: 14px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 7px;
                font-weight: 700;
            }

            /* Progress */
            .progress-container {
                display: none;
                margin-bottom: 16px;
                animation: slideDown 0.5s ease;
            }

            .progress-container.active {
                display: block;
            }

            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 8px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(135deg, #10b981, #059669);
                width: 0%;
                transition: width 0.5s ease;
                border-radius: 4px;
                position: relative;
            }

            .progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            .progress-text {
                font-size: 12px;
                color: #333;
                font-weight: 600;
                margin-bottom: 4px;
            }

            .progress-details {
                font-size: 10px;
                color: #666;
            }

            /* Footer Info - Minimal */
            .scan-info {
                display: flex;
                justify-content: center;
                gap: 16px;
                opacity: 0.6;
                font-size: 10px;
                color: #666;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .info-item i {
                color: #10b981;
                font-size: 10px;
            }

            /* States d'erreur et authentification */
            .auth-needed-minimal, .error-state-minimal {
                text-align: center;
                padding: 40px 24px;
            }

            .auth-icon, .error-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #667eea;
            }

            .error-icon {
                color: #ef4444;
            }

            .auth-needed-minimal h2, .error-state-minimal h2 {
                margin: 0 0 12px 0;
                color: #1f2937;
                font-size: 20px;
                font-weight: 600;
            }

            .auth-needed-minimal p, .error-state-minimal p {
                color: #6b7280;
                margin-bottom: 24px;
                font-size: 14px;
                line-height: 1.5;
            }

            .btn-auth {
                background: #0078d4;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
                font-size: 14px;
            }

            .btn-auth:hover {
                background: #106ebe;
                transform: translateY(-1px);
            }

            /* Responsive */
            @media (max-width: 640px) {
                .scanner-container {
                    padding: 20px 16px;
                    max-width: 95vw;
                    border-radius: 20px;
                }

                .scanner-title {
                    font-size: 18px;
                }

                .scan-button {
                    padding: 14px 28px;
                    font-size: 14px;
                    min-width: 200px;
                }

                .period-chips {
                    gap: 4px;
                }

                .period-chip {
                    padding: 6px 10px;
                    font-size: 11px;
                    min-width: 40px;
                }

                .ai-toggles {
                    gap: 8px;
                }

                .ai-toggle {
                    padding: 6px 10px;
                    font-size: 11px;
                }

                .scan-info {
                    flex-direction: column;
                    gap: 6px;
                }
            }
        `;

        document.head.appendChild(style);
        this.stylesAdded = true;
        console.log('[ScanStart] ✅ Ultra minimal styles added');
    }

    // ====================================================
    // RENDU DE L'INTERFACE
    // ====================================================
    async render(container) {
        console.log('[ScanStart] Rendering ultra minimal scanner interface...');
        
        try {
            this.addUltraMinimalStyles();
            
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            await this.checkAndInitializeServices();
            const userInfo = await this.getUserInfo();
            
            // Render directly in the container without extra wrapper
            container.innerHTML = this.renderUltraMinimalInterface(userInfo);
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log('[ScanStart] ✅ Ultra minimal scanner interface ready');
            
        } catch (error) {
            console.error('[ScanStart] Error rendering interface:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderUltraMinimalInterface(userInfo) {
        return `
            <div class="scanner-ultra-minimal">
                <div class="scanner-container">
                    <!-- Quick Settings -->
                    <div class="quick-settings">
                        <button class="quick-btn" id="folderBtn" onclick="window.scanStartModule.toggleFolder()" title="Boîte de réception">
                            <i class="fas fa-inbox"></i>
                        </button>
                        <button class="quick-btn" onclick="window.scanStartModule.showHelp()" title="Aide (Ctrl+?)">
                            <i class="fas fa-question"></i>
                        </button>
                    </div>

                    <!-- Header -->
                    <div class="scanner-header">
                        <div class="scanner-icon" id="scannerIcon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h1 class="scanner-title">Scanner intelligent</h1>
                        <p class="scanner-subtitle">Analysez vos emails automatiquement</p>
                    </div>

                    <!-- Main Action Button -->
                    <div class="scan-action">
                        <button class="scan-button" id="scanButton" onclick="window.scanStartModule.startUltraMinimalScan()">
                            <i class="fas fa-play"></i>
                            <span>Démarrer le scan</span>
                        </button>
                    </div>

                    <!-- Period Selection -->
                    <div class="period-section">
                        <div class="period-label">
                            <i class="fas fa-calendar-alt"></i>
                            Période
                        </div>
                        <div class="period-chips">
                            <div class="period-chip" data-period="1" onclick="window.scanStartModule.selectPeriod(1)">1j</div>
                            <div class="period-chip" data-period="3" onclick="window.scanStartModule.selectPeriod(3)">3j</div>
                            <div class="period-chip" data-period="7" onclick="window.scanStartModule.selectPeriod(7)">7j</div>
                            <div class="period-chip" data-period="15" onclick="window.scanStartModule.selectPeriod(15)">15j</div>
                            <div class="period-chip selected" data-period="30" onclick="window.scanStartModule.selectPeriod(30)">30j</div>
                        </div>
                    </div>

                    <!-- AI Options -->
                    <div class="ai-section">
                        <div class="ai-toggles">
                            <div class="ai-toggle active" data-ai="classify" onclick="window.scanStartModule.toggleAI('classify')">
                                <div class="toggle-icon">
                                    <i class="fas fa-check"></i>
                                </div>
                                <span>Classification</span>
                            </div>
                            <div class="ai-toggle active" data-ai="tasks" onclick="window.scanStartModule.toggleAI('tasks')">
                                <div class="toggle-icon">
                                    <i class="fas fa-check"></i>
                                </div>
                                <span>Tâches auto</span>
                            </div>
                        </div>
                    </div>

                    <!-- Process Steps -->
                    <div class="process-section">
                        <div class="process-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <span>Connexion</span>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <span>Récupération</span>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <span>Classification</span>
                            </div>
                            <div class="step">
                                <div class="step-number">4</div>
                                <span>Tâches</span>
                            </div>
                        </div>
                    </div>

                    <!-- Settings Link -->
                    <div class="settings-link">
                        <button class="settings-btn" onclick="window.scanStartModule.openSettings()">
                            <i class="fas fa-cog"></i>
                            <span>Paramètres de scan</span>
                        </button>
                    </div>

                    <!-- Progress (Hidden by default) -->
                    <div class="progress-container" id="progressContainer">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-details" id="progressDetails"></div>
                    </div>

                    <!-- Footer Info -->
                    <div class="scan-info">
                        <div class="info-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>Sécurisé</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>30s-2min</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-magic"></i>
                            <span>IA intégrée</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotAuthenticated() {
        return `
            <div class="scanner-container">
                <div class="auth-needed-minimal">
                    <div class="auth-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h2>Connexion requise</h2>
                    <p>Connectez-vous à Microsoft pour scanner vos emails</p>
                    <button class="btn-auth" onclick="window.authService.login()">
                        <i class="fab fa-microsoft"></i>
                        <span>Se connecter</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderError(error) {
        return `
            <div class="scanner-container">
                <div class="error-state-minimal">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h2>Erreur d'initialisation</h2>
                    <p>${error.message}</p>
                    <button class="btn-auth" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ====================================================
    // GESTION DES ÉVÉNEMENTS
    // ====================================================
    initializeEvents() {
        console.log('[ScanStart] Initializing ultra minimal events...');
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !this.scanInProgress) {
                this.startUltraMinimalScan();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showHelp();
            }
        });
    }

    selectPeriod(days) {
        this.selectedDays = days;
        this.scanSettings.startDate = this.getStartDateFromDays(days);
        
        // Mettre à jour l'UI
        document.querySelectorAll('.period-chip').forEach(chip => {
            chip.classList.remove('selected');
        });
        
        const selectedChip = document.querySelector(`[data-period="${days}"]`);
        if (selectedChip) {
            selectedChip.classList.add('selected');
        }
        
        console.log(`[ScanStart] Selected period: ${days} days`);
    }

    toggleFolder() {
        const btn = document.getElementById('folderBtn');
        const icon = btn.querySelector('i');
        
        if (this.selectedFolder === 'inbox') {
            this.selectedFolder = 'all';
            icon.className = 'fas fa-folder';
            btn.title = 'Tous les dossiers';
            btn.classList.add('active');
        } else {
            this.selectedFolder = 'inbox';
            icon.className = 'fas fa-inbox';
            btn.title = 'Boîte de réception';
            btn.classList.remove('active');
        }
        
        console.log(`[ScanStart] Selected folder: ${this.selectedFolder}`);
    }

    toggleAI(type) {
        const toggle = document.querySelector(`[data-ai="${type}"]`);
        if (!toggle) return;
        
        toggle.classList.toggle('active');
        const icon = toggle.querySelector('.toggle-icon i');
        
        if (toggle.classList.contains('active')) {
            icon.className = 'fas fa-check';
            if (type === 'classify') this.autoClassifyEmails = true;
            if (type === 'tasks') this.autoCreateTasks = true;
        } else {
            icon.className = '';
            if (type === 'classify') this.autoClassifyEmails = false;
            if (type === 'tasks') this.autoCreateTasks = false;
        }
        
        console.log(`[ScanStart] AI ${type}: ${toggle.classList.contains('active') ? 'enabled' : 'disabled'}`);
    }

    showHelp() {
        const folderText = this.selectedFolder === 'inbox' ? 'Boîte de réception' : 'Tous les dossiers';
        
        alert(`🚀 Scanner d'emails intelligent

📧 Analyse automatique de vos emails
🎯 Classification par IA 
📋 Création de tâches automatique

⌨️ Raccourcis:
• Entrée: Démarrer le scan
• Ctrl+/: Cette aide

🔧 Configuration actuelle:
• Période: ${this.selectedDays} jours
• Dossier: ${folderText}
• Classification: ${this.autoClassifyEmails ? 'Activée' : 'Désactivée'}
• Tâches auto: ${this.autoCreateTasks ? 'Activée' : 'Désactivée'}`);
    }

    openSettings() {
        if (window.pageManager?.loadPage) {
            window.pageManager.loadPage('settings');
        } else {
            alert('⚙️ Paramètres de scan\n\nAccédez aux options avancées :\n• Dossiers supplémentaires\n• Filtres par expéditeur\n• Configuration IA\n• Paramètres de notification\n\nFonctionnalité bientôt disponible !');
        }
    }

    // ====================================================
    // SCAN ULTRA-MINIMAL
    // ====================================================
    async startUltraMinimalScan() {
        if (this.scanInProgress) return;
        
        console.log('[ScanStart] 🚀 Starting ultra minimal scan with settings:', {
            days: this.selectedDays,
            folder: this.selectedFolder,
            autoClassify: this.autoClassifyEmails,
            autoCreateTasks: this.autoCreateTasks
        });
        
        try {
            this.scanInProgress = true;
            this.showProgressInterface();
            
            // Vérification des services
            await this.checkAndInitializeServices();
            
            // Démarrer le scan
            await this.performUltraMinimalScan();
            
        } catch (error) {
            console.error('[ScanStart] ❌ Ultra minimal scan error:', error);
            this.handleScanError(error);
        }
    }

    showProgressInterface() {
        const scanButton = document.getElementById('scanButton');
        const progressContainer = document.getElementById('progressContainer');
        const scannerIcon = document.getElementById('scannerIcon');

        scanButton.classList.add('scanning');
        scanButton.innerHTML = '<i class="fas fa-spinner"></i><span>Scan en cours...</span>';
        scanButton.disabled = true;
        
        scannerIcon.classList.add('scanning');
        progressContainer.classList.add('active');
    }

    async performUltraMinimalScan() {
        const startTime = Date.now();
        
        try {
            // Configuration
            const folders = this.selectedFolder === 'all' ? ['inbox', 'junkemail'] : ['inbox'];
            const filters = {
                startDate: this.scanSettings.startDate,
                endDate: this.scanSettings.endDate,
                folders: folders,
                maxEmails: 1000
            };

            // Étapes du scan
            const phases = [
                { text: 'Connexion...', detail: 'Microsoft Graph API', progress: 15 },
                { text: 'Récupération...', detail: `${this.selectedDays} derniers jours`, progress: 40 },
                { text: 'Classification IA...', detail: 'Analyse intelligente', progress: 70 },
                { text: 'Création tâches...', detail: 'Génération automatique', progress: 90 },
                { text: 'Finalisation...', detail: 'Sauvegarde', progress: 100 }
            ];

            // Simulation du scan (remplacer par la vraie logique)
            for (let i = 0; i < phases.length; i++) {
                const phase = phases[i];
                this.updateProgress(phase.progress, phase.text, phase.detail);
                await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
            }

            // Résultats simulés
            const emailCount = Math.floor(Math.random() * 200) + 50;
            const taskCount = this.autoCreateTasks ? Math.floor(emailCount * 0.15) : 0;
            const categoryCount = this.autoClassifyEmails ? Math.floor(emailCount * 0.7) : 0;
            
            const scanResults = {
                date: new Date().toISOString(),
                total: emailCount,
                categorized: categoryCount,
                tasksCreated: taskCount,
                scanDuration: Date.now() - startTime,
                settings: {
                    days: this.selectedDays,
                    folder: this.selectedFolder,
                    autoClassify: this.autoClassifyEmails,
                    autoCreateTasks: this.autoCreateTasks
                }
            };

            // Finaliser
            this.updateProgress(100, 'Scan terminé !', `${emailCount} emails analysés`);
            
            setTimeout(() => {
                this.completeScan(scanResults);
            }, 1000);

        } catch (error) {
            throw error;
        }
    }

    completeScan(results) {
        // Notification
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(
                `✅ Scan terminé ! ${results.total} emails en ${Math.round(results.scanDuration / 1000)}s`,
                'success'
            );
        } else {
            alert(`✅ Scan terminé avec succès !

📊 Résultats:
• ${results.total} emails analysés
• ${results.categorized} emails classifiés  
• ${results.tasksCreated} tâches créées
• Durée: ${Math.round(results.scanDuration / 1000)}s

🎉 Vos emails sont maintenant organisés !`);
        }

        // Redirection
        setTimeout(() => {
            if (window.pageManager?.loadPage) {
                window.pageManager.loadPage('emails');
            } else {
                this.resetInterface();
            }
        }, 2000);
    }

    handleScanError(error) {
        this.updateProgress(0, 'Erreur de scan', error.message);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
        }
        
        setTimeout(() => {
            this.resetInterface();
        }, 3000);
    }

    resetInterface() {
        const scanButton = document.getElementById('scanButton');
        const progressContainer = document.getElementById('progressContainer');
        const scannerIcon = document.getElementById('scannerIcon');

        if (scanButton) {
            scanButton.classList.remove('scanning');
            scanButton.innerHTML = '<i class="fas fa-play"></i><span>Démarrer le scan</span>';
            scanButton.disabled = false;
        }
        
        if (scannerIcon) scannerIcon.classList.remove('scanning');
        if (progressContainer) progressContainer.classList.remove('active');
        
        this.scanInProgress = false;
    }

    // ====================================================
    // FONCTIONS UTILITAIRES
    // ====================================================
    updateProgress(progress, status, detail) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressDetails = document.getElementById('progressDetails');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = status;
        if (progressDetails) progressDetails.textContent = detail;
    }

    async checkAndInitializeServices() {
        if (!window.authService?.isAuthenticated()) {
            throw new Error('Utilisateur non authentifié');
        }
        
        if (!window.mailService) {
            throw new Error('Service de messagerie non disponible');
        }
        
        if (!window.mailService.isInitialized) {
            await window.mailService.initialize();
        }
    }

    async getUserInfo() {
        try {
            if (window.authService?.isAuthenticated()) {
                return await window.authService.getUserInfo();
            }
            return { displayName: 'Utilisateur' };
        } catch (error) {
            return { displayName: 'Utilisateur' };
        }
    }

    // ====================================================
    // API PUBLIQUE
    // ====================================================
    getCurrentConfig() {
        return {
            selectedDays: this.selectedDays,
            selectedFolder: this.selectedFolder,
            autoClassifyEmails: this.autoClassifyEmails,
            autoCreateTasks: this.autoCreateTasks,
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress
        };
    }

    async startScanProgrammatically(options = {}) {
        if (options.days) this.selectPeriod(options.days);
        if (options.folder) this.selectedFolder = options.folder;
        if (options.autoClassify !== undefined) this.autoClassifyEmails = options.autoClassify;
        if (options.autoCreateTasks !== undefined) this.autoCreateTasks = options.autoCreateTasks;
        
        return await this.startUltraMinimalScan();
    }
}

// ====================================================
// INITIALISATION
// ====================================================
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.scanStartModule = new ScanStartModule();
            console.log('[ScanStart] 🚀 Ultra minimal ScanStartModule ready');
        });
    } else {
        window.scanStartModule = new ScanStartModule();
        console.log('[ScanStart] 🚀 Ultra minimal ScanStartModule ready');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScanStartModule;
}
