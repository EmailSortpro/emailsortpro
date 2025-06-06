// ScanStart.js - Version 8.1 - Scanner Ultra-Minimaliste CORRIGÉ

class ScanStartModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        this.scanResults = null;
        
        console.log('[ScanStart] Scanner ultra-minimaliste v8.1 initialized');
    }

    addUltraMinimalStyles() {
        if (this.stylesAdded) return;
        
        const styles = document.createElement('style');
        styles.id = 'scanstart-styles';
        styles.textContent = `
            /* Scanner Ultra-Minimaliste */
            .minimal-scanner {
                height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                overflow: hidden;
                position: fixed;
                top: 140px;
                left: 0;
                right: 0;
                bottom: 0;
                padding: 20px;
            }
            
            .scanner-card-minimal {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 50px;
                width: 100%;
                max-width: 650px;
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 25px;
                color: white;
                font-size: 32px;
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
            
            .steps-container {
                display: flex;
                justify-content: space-between;
                margin-bottom: 35px;
                padding: 0 20px;
            }
            
            .step {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
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
                z-index: 1;
            }
            
            .step-number {
                width: 40px;
                height: 40px;
                background: #e5e7eb;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: 600;
                color: #9ca3af;
                margin-bottom: 12px;
                position: relative;
                z-index: 2;
                transition: all 0.3s ease;
            }
            
            .step.active .step-number {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .step-label {
                font-size: 14px;
                color: #6b7280;
                text-align: center;
                max-width: 80px;
                font-weight: 500;
            }
            
            .step.active .step-label {
                color: #667eea;
                font-weight: 600;
            }
            
            .duration-section {
                margin-bottom: 35px;
            }
            
            .duration-label {
                font-size: 18px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 20px;
            }
            
            .duration-options {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .duration-option {
                padding: 12px 20px;
                border: 2px solid #e5e7eb;
                background: white;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 500;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 85px;
            }
            
            .duration-option.selected {
                border-color: #667eea;
                background: #667eea;
                color: white;
            }
            
            .duration-option:hover:not(.selected) {
                border-color: #9ca3af;
            }
            
            .scan-button-minimal {
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
            }
            
            .scan-button-minimal:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button-minimal:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .progress-section-minimal {
                opacity: 0;
                transition: opacity 0.3s ease;
                margin-top: 20px;
            }
            
            .progress-section-minimal.visible {
                opacity: 1;
            }
            
            .progress-bar-minimal {
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
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .progress-status {
                font-size: 14px;
                color: #9ca3af;
            }
            
            .scan-info {
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
            }
            
            @media (max-width: 480px) {
                .scanner-card-minimal {
                    width: 95%;
                    padding: 35px 30px;
                }
                
                .scanner-title {
                    font-size: 28px;
                }
                
                .scanner-subtitle {
                    font-size: 16px;
                }
                
                .steps-container {
                    padding: 0 10px;
                }
                
                .step-label {
                    font-size: 12px;
                    max-width: 70px;
                }
                
                .duration-label {
                    font-size: 16px;
                }
                
                .duration-options {
                    gap: 8px;
                }
                
                .duration-option {
                    padding: 10px 16px;
                    font-size: 13px;
                    min-width: 75px;
                }
                
                .scan-button-minimal {
                    height: 55px;
                    font-size: 16px;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[ScanStart] ✅ Styles ajoutés');
    }

    async render(container) {
        console.log('[ScanStart] Rendu du scanner...');
        
        try {
            this.addUltraMinimalStyles();
            
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            await this.checkServices();
            
            container.innerHTML = this.renderMinimalScanner();
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log('[ScanStart] ✅ Scanner prêt');
            
        } catch (error) {
            console.error('[ScanStart] Erreur:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderMinimalScanner() {
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner Email</h1>
                    <p class="scanner-subtitle">Analysez vos vrais emails Outlook</p>
                    
                    <div class="steps-container">
                        <div class="step active" id="step1">
                            <div class="step-number">1</div>
                            <div class="step-label">Sélection</div>
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
                        <div class="duration-label">Période d'analyse</div>
                        <div class="duration-options">
                            <button class="duration-option" onclick="window.scanStartModule.selectDuration(1)" data-days="1">1 jour</button>
                            <button class="duration-option" onclick="window.scanStartModule.selectDuration(3)" data-days="3">3 jours</button>
                            <button class="duration-option selected" onclick="window.scanStartModule.selectDuration(7)" data-days="7">7 jours</button>
                            <button class="duration-option" onclick="window.scanStartModule.selectDuration(15)" data-days="15">15 jours</button>
                            <button class="duration-option" onclick="window.scanStartModule.selectDuration(30)" data-days="30">30 jours</button>
                        </div>
                    </div>
                    
                    <button class="scan-button-minimal" id="scanStartBtn" onclick="window.scanStartModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Scanner mes emails réels</span>
                    </button>
                    
                    <div class="progress-section-minimal" id="progressSection">
                        <div class="progress-bar-minimal">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus">Préparation du scan</div>
                    </div>
                    
                    <div class="scan-info">
                        <i class="fas fa-shield-alt"></i>
                        <span>Scan de vos emails Outlook authentiques</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotAuthenticated() {
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h1 class="scanner-title">Connexion requise</h1>
                    <p class="scanner-subtitle">Connectez-vous pour analyser vos emails</p>
                    
                    <button class="scan-button-minimal" onclick="window.authService.login()">
                        <i class="fab fa-microsoft"></i>
                        <span>Se connecter à Outlook</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderError(error) {
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
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

    async checkServices() {
        if (!window.authService?.isAuthenticated()) {
            throw new Error('Authentification requise');
        }
        
        if (!window.mailService) {
            throw new Error('Service de messagerie indisponible');
        }
        
        if (!window.mailService.isInitialized) {
            console.log('[ScanStart] Initialisation du MailService...');
            await window.mailService.initialize();
        }
    }

    initializeEvents() {
        console.log('[ScanStart] Événements initialisés');
    }

    selectDuration(days) {
        this.selectedDays = days;
        
        document.querySelectorAll('.duration-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.querySelector(`[data-days="${days}"]`).classList.add('selected');
        
        console.log(`[ScanStart] Durée sélectionnée: ${days} jours`);
    }

    async startScan() {
        if (this.scanInProgress) return;
        
        console.log('[ScanStart] 🚀 Démarrage du VRAI scan pour', this.selectedDays, 'jours');
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            this.setActiveStep(2);
            
            document.getElementById('progressSection').classList.add('visible');
            const scanBtn = document.getElementById('scanStartBtn');
            scanBtn.disabled = true;
            scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Scan en cours...</span>';
            
            // VRAIE récupération des emails via MailService
            await this.executeRealScan();
            
            this.setActiveStep(3);
            this.completeScan();
            
        } catch (error) {
            console.error('[ScanStart] Erreur de scan:', error);
            this.showScanError(error);
        }
    }

    async executeRealScan() {
        console.log('[ScanStart] Exécution du scan réel...');
        
        this.updateProgress(10, 'Connexion...', 'Authentification Microsoft Graph');
        
        try {
            // Vérifier que le MailService est prêt
            if (!window.mailService?.isInitialized) {
                await window.mailService.initialize();
            }
            
            this.updateProgress(30, 'Récupération...', `Chargement des emails (${this.selectedDays} jours)`);
            
            // Récupérer les VRAIS emails via MailService
            const emails = await window.mailService.getEmails({
                maxResults: 100,
                folder: 'inbox',
                days: this.selectedDays
            });
            
            console.log('[ScanStart] Emails récupérés:', emails.length);
            
            this.updateProgress(60, 'Classification...', 'Analyse et catégorisation');
            
            // Classification avec categoryManager
            if (window.categoryManager && emails.length > 0) {
                emails.forEach(email => {
                    const result = window.categoryManager.analyzeEmail(email);
                    email.category = result.category || 'other';
                });
            }
            
            this.updateProgress(80, 'Organisation...', 'Tri par catégories');
            
            // Stocker les résultats dans emailScanner
            if (window.emailScanner) {
                window.emailScanner.emails = emails;
                console.log('[ScanStart] Emails stockés dans emailScanner');
            }
            
            // Aussi stocker dans pageManager comme backup
            if (window.pageManager) {
                window.pageManager.temporaryEmailStorage = emails;
                window.pageManager.lastScanData = {
                    total: emails.length,
                    categorized: emails.filter(e => e.category && e.category !== 'other').length,
                    scanTime: new Date().toISOString(),
                    duration: Math.floor((Date.now() - this.scanStartTime) / 1000)
                };
            }
            
            this.updateProgress(100, 'Terminé !', `${emails.length} emails analysés avec succès`);
            
            this.scanResults = {
                success: true,
                total: emails.length,
                categorized: emails.filter(e => e.category && e.category !== 'other').length,
                emails: emails
            };
            
        } catch (error) {
            console.error('[ScanStart] Erreur lors du scan réel:', error);
            throw error;
        }
    }

    updateProgress(percent, text, status) {
        const fill = document.getElementById('progressFill');
        const textEl = document.getElementById('progressText');
        const statusEl = document.getElementById('progressStatus');
        
        if (fill) fill.style.width = `${percent}%`;
        if (textEl) textEl.textContent = text;
        if (statusEl) statusEl.textContent = status;
    }

    setActiveStep(stepNumber) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        const stepEl = document.getElementById(`step${stepNumber}`);
        if (stepEl) stepEl.classList.add('active');
    }

    completeScan() {
        setTimeout(() => {
            const scanBtn = document.getElementById('scanStartBtn');
            if (scanBtn) {
                scanBtn.innerHTML = '<i class="fas fa-check"></i> <span>Scan terminé !</span>';
                scanBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
            
            setTimeout(() => {
                this.redirectToResults();
            }, 1500);
        }, 500);
    }

    redirectToResults() {
        this.scanInProgress = false;
        
        const totalEmails = this.scanResults?.total || 0;
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(`✅ ${totalEmails} emails réels analysés !`, 'success');
        }
        
        setTimeout(() => {
            if (window.pageManager) {
                window.pageManager.loadPage('emails');
            }
        }, 500);
    }

    showScanError(error) {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">Erreur de scan</div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">${error.message}</div>
                    
                    <button class="scan-button-minimal" onclick="window.scanStartModule.resetScanner()" style="width: auto; padding: 0 20px; height: 40px; font-size: 14px;">
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
        
        const scanBtn = document.getElementById('scanStartBtn');
        if (scanBtn) {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="fas fa-play"></i> <span>Scanner mes emails réels</span>';
            scanBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
        
        this.updateProgress(0, 'Initialisation...', 'Préparation du scan');
        
        console.log('[ScanStart] Scanner réinitialisé');
    }

    // Méthode pour mode programmatique (compatibilité PageManager)
    async startScanProgrammatically(options = {}) {
        this.selectedDays = options.days || 7;
        
        try {
            await this.executeRealScan();
            return this.scanResults;
        } catch (error) {
            console.error('[ScanStart] Erreur scan programmatique:', error);
            throw error;
        }
    }

    cleanup() {
        console.log('[ScanStart] Nettoyage terminé');
    }
}

// Créer l'instance globale
window.scanStartModule = new ScanStartModule();

console.log('[ScanStart] 🚀 Scanner réel prêt pour emails Outlook');
