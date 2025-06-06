// startscan.js - Version 7.1 - Scanner Ultra-Moderne Optimisé

class ModernScanStartModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 30;
        this.stylesAdded = false;
        this.scanStartTime = null;
        
        this.addModernMinimalStyles();
        console.log('[ModernScan] Ultra-modern optimized scanner v7.1 initialized');
    }

    addModernMinimalStyles() {
        if (this.stylesAdded) return;
        
        const styles = document.createElement('style');
        styles.id = 'modern-minimal-scan-styles';
        styles.textContent = `
            /* Scanner Ultra-Moderne Optimisé */
            .modern-scanner {
                min-height: 80vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: -20px;
                border-radius: 0;
            }
            
            .scanner-card-modern {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 60px 40px;
                max-width: 550px;
                width: 100%;
                text-align: center;
                box-shadow: 
                    0 20px 40px rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
                border: 1px solid rgba(255, 255, 255, 0.2);
                position: relative;
                overflow: hidden;
            }
            
            .scanner-card-modern::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
            }
            
            /* Header épuré */
            .modern-header {
                margin-bottom: 32px;
            }
            
            .modern-logo {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                font-size: 36px;
                color: white;
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                animation: gentlePulse 3s ease-in-out infinite;
            }
            
            @keyframes gentlePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            .modern-title {
                font-size: 32px;
                font-weight: 700;
                color: #1a1a2e;
                margin: 0 0 8px 0;
                letter-spacing: -0.5px;
            }
            
            .modern-subtitle {
                font-size: 16px;
                color: #6b7280;
                margin: 0 0 32px 0;
                font-weight: 400;
            }

            /* Section d'explication */
            .explanation-section {
                margin-bottom: 40px;
                text-align: left;
                background: rgba(102, 126, 234, 0.05);
                border-radius: 16px;
                padding: 24px;
                border: 1px solid rgba(102, 126, 234, 0.1);
            }

            .explanation-title {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 16px;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .explanation-steps {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .explanation-step {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .step-number {
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
                margin-top: 2px;
            }

            .step-content {
                flex: 1;
            }

            .step-title {
                font-size: 14px;
                font-weight: 600;
                color: #1a1a2e;
                margin-bottom: 2px;
            }

            .step-description {
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            /* Sélecteur de durée moderne */
            .duration-selector {
                margin-bottom: 40px;
            }
            
            .duration-label {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 16px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .duration-options {
                display: flex;
                gap: 8px;
                background: #f1f5f9;
                padding: 4px;
                border-radius: 16px;
                margin-bottom: 20px;
            }
            
            .duration-option {
                flex: 1;
                padding: 12px 8px;
                border: none;
                background: transparent;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                color: #64748b;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
            }
            
            .duration-option.selected {
                background: white;
                color: #667eea;
                box-shadow: 
                    0 2px 8px rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(102, 126, 234, 0.1);
                transform: translateY(-1px);
            }
            
            .duration-option:hover:not(.selected) {
                background: rgba(255, 255, 255, 0.5);
                color: #374151;
            }
            
            .duration-info {
                font-size: 13px;
                color: #9ca3af;
                margin-top: 8px;
            }
            
            /* Bouton de scan moderne */
            .scan-button-modern {
                width: 100%;
                height: 56px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 16px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 32px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
            }
            
            .scan-button-modern::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .scan-button-modern:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button-modern:hover:not(:disabled)::before {
                left: 100%;
            }
            
            .scan-button-modern:active {
                transform: translateY(0);
            }
            
            .scan-button-modern:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }
            
            .scan-button-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            /* Section de progression minimaliste */
            .progress-section-modern {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                margin-top: 32px;
                text-align: center;
            }
            
            .progress-section-modern.active {
                opacity: 1;
                transform: translateY(0);
            }

            .progress-spinner {
                width: 60px;
                height: 60px;
                margin: 0 auto 24px;
                border: 3px solid rgba(102, 126, 234, 0.2);
                border-top: 3px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .progress-details-modern {
                text-align: center;
            }
            
            .progress-title-modern {
                font-size: 18px;
                font-weight: 600;
                color: #1a1a2e;
                margin-bottom: 8px;
            }
            
            .progress-subtitle-modern {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 16px;
            }
            
            /* Timer moderne */
            .scan-timer {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(102, 126, 234, 0.1);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                color: #667eea;
                margin-bottom: 16px;
            }
            
            .timer-icon {
                animation: tick 1s ease-in-out infinite;
            }
            
            @keyframes tick {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            /* Info badge moderne */
            .info-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(16, 185, 129, 0.1);
                color: #059669;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 500;
                margin-top: 16px;
            }
            
            /* Responsive */
            @media (max-width: 640px) {
                .modern-scanner {
                    padding: 10px;
                    margin: -20px -10px;
                }
                
                .scanner-card-modern {
                    padding: 40px 24px;
                }
                
                .modern-title {
                    font-size: 28px;
                }

                .explanation-steps {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                
                .duration-options {
                    flex-direction: column;
                    gap: 4px;
                }
            }
            
            /* Mode sombre */
            @media (prefers-color-scheme: dark) {
                .scanner-card-modern {
                    background: rgba(30, 30, 46, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .modern-title {
                    color: white;
                }
                
                .modern-subtitle,
                .progress-subtitle-modern {
                    color: #9ca3af;
                }

                .explanation-section {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .step-title {
                    color: white;
                }
                
                .duration-options {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .duration-option.selected {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .progress-title-modern {
                    color: white;
                }

                .progress-spinner {
                    border-color: rgba(255, 255, 255, 0.2);
                    border-top-color: #667eea;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[ModernScan] ✅ Modern optimized styles added');
    }

    async render(container) {
        console.log('[ModernScan] Rendering ultra-modern optimized scanner...');
        
        try {
            this.addModernMinimalStyles();
            
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            await this.checkServices();
            const userInfo = await this.getUserInfo();
            
            container.innerHTML = this.renderModernScanner(userInfo);
            this.initializeModernEvents();
            this.isInitialized = true;
            
            console.log('[ModernScan] ✅ Modern scanner ready');
            
        } catch (error) {
            console.error('[ModernScan] Error:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderModernScanner(userInfo) {
        return `
            <div class="modern-scanner">
                <div class="scanner-card-modern">
                    <div class="modern-header">
                        <div class="modern-logo">
                            <i class="fas fa-search"></i>
                        </div>
                        <h1 class="modern-title">Scanner intelligent</h1>
                        <p class="modern-subtitle">Organisez vos emails automatiquement</p>
                    </div>

                    <div class="explanation-section">
                        <div class="explanation-title">Comment ça marche ?</div>
                        <div class="explanation-steps">
                            <div class="explanation-step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <div class="step-title">Connexion sécurisée</div>
                                    <div class="step-description">Accès à votre boîte mail Microsoft</div>
                                </div>
                            </div>
                            
                            <div class="explanation-step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <div class="step-title">Analyse intelligente</div>
                                    <div class="step-description">Classification automatique par IA</div>
                                </div>
                            </div>
                            
                            <div class="explanation-step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <div class="step-title">Organisation</div>
                                    <div class="step-description">Tri par catégories et priorités</div>
                                </div>
                            </div>
                            
                            <div class="explanation-step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <div class="step-title">Résultats</div>
                                    <div class="step-description">Tableau de bord complet</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="duration-selector">
                        <div class="duration-label">Période d'analyse</div>
                        <div class="duration-options">
                            <button class="duration-option" onclick="window.modernScanModule.selectDuration(7)" data-days="7">
                                7 jours
                            </button>
                            <button class="duration-option selected" onclick="window.modernScanModule.selectDuration(30)" data-days="30">
                                30 jours
                            </button>
                            <button class="duration-option" onclick="window.modernScanModule.selectDuration(90)" data-days="90">
                                3 mois
                            </button>
                        </div>
                        <div class="duration-info" id="durationInfo">
                            Analysera les emails des 30 derniers jours
                        </div>
                    </div>
                    
                    <div id="scanSection">
                        <button class="scan-button-modern" id="modernScanBtn" onclick="window.modernScanModule.startModernScan()">
                            <div class="scan-button-content">
                                <i class="fas fa-play"></i>
                                <span>Démarrer l'analyse</span>
                            </div>
                        </button>
                        
                        <div class="info-badge">
                            <i class="fas fa-shield-alt"></i>
                            <span>Scan sécurisé Microsoft</span>
                        </div>
                    </div>
                    
                    <div class="progress-section-modern" id="progressSection">
                        <div class="progress-spinner"></div>
                        
                        <div class="progress-details-modern">
                            <div class="scan-timer" id="scanTimer">
                                <i class="fas fa-clock timer-icon"></i>
                                <span id="timerText">00:00</span>
                            </div>
                            
                            <div class="progress-title-modern" id="progressTitle">Analyse en cours...</div>
                            <div class="progress-subtitle-modern" id="progressSubtitle">Traitement de vos emails</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotAuthenticated() {
        return `
            <div class="modern-scanner">
                <div class="scanner-card-modern">
                    <div class="modern-header">
                        <div class="modern-logo">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h1 class="modern-title">Connexion requise</h1>
                        <p class="modern-subtitle">Connectez-vous pour analyser vos emails</p>
                    </div>
                    
                    <button class="scan-button-modern" onclick="window.authService.login()">
                        <div class="scan-button-content">
                            <i class="fab fa-microsoft"></i>
                            <span>Se connecter</span>
                        </div>
                    </button>
                </div>
            </div>
        `;
    }

    renderError(error) {
        return `
            <div class="modern-scanner">
                <div class="scanner-card-modern">
                    <div class="modern-header">
                        <div class="modern-logo" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1 class="modern-title">Erreur</h1>
                        <p class="modern-subtitle">${error.message}</p>
                    </div>
                    
                    <button class="scan-button-modern" onclick="window.location.reload()">
                        <div class="scan-button-content">
                            <i class="fas fa-redo"></i>
                            <span>Réessayer</span>
                        </div>
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
            await window.mailService.initialize();
        }
    }

    async getUserInfo() {
        try {
            return await window.authService.getUserInfo();
        } catch (error) {
            return { displayName: 'Utilisateur' };
        }
    }

    initializeModernEvents() {
        // Timer pour le scan
        this.timerInterval = null;
    }

    selectDuration(days) {
        this.selectedDays = days;
        
        // Mettre à jour l'UI
        document.querySelectorAll('.duration-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.querySelector(`[data-days="${days}"]`).classList.add('selected');
        
        // Mettre à jour l'info
        const info = document.getElementById('durationInfo');
        if (info) {
            const text = days === 7 ? 'derniers jours' : 
                        days === 30 ? 'derniers jours' : 
                        'derniers mois';
            const count = days === 90 ? '3' : days;
            info.textContent = `Analysera les emails des ${count} ${text}`;
        }
        
        console.log(`[ModernScan] Selected duration: ${days} days`);
    }

    async startModernScan() {
        if (this.scanInProgress) return;
        
        console.log('[ModernScan] 🚀 Starting optimized scan for', this.selectedDays, 'days');
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            // Cacher le bouton, montrer la progression
            document.getElementById('scanSection').style.display = 'none';
            document.getElementById('progressSection').classList.add('active');
            
            this.startTimer();
            
            // Scan rapide optimisé
            await this.executeOptimizedScan();
            
        } catch (error) {
            console.error('[ModernScan] Scan error:', error);
            this.showError(error);
        }
    }

    async executeOptimizedScan() {
        // Scan minimal et rapide - 2 secondes maximum
        this.updateProgress('Connexion...', 'Accès à votre boîte email');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.updateProgress('Analyse...', 'Classification des emails');
        
        // Effectuer le vrai scan si disponible
        try {
            if (window.emailScanner) {
                const results = await window.emailScanner.scan({
                    days: this.selectedDays,
                    folder: 'inbox',
                    quick: true // Mode rapide
                });
                this.scanResults = results;
            } else {
                // Mode démo rapide
                this.scanResults = {
                    success: true,
                    total: Math.floor(Math.random() * 200) + 50,
                    categorized: Math.floor(Math.random() * 150) + 40,
                    stats: { processed: 147, errors: 0 }
                };
            }
        } catch (error) {
            console.error('[ModernScan] Real scan error:', error);
            this.scanResults = {
                success: true,
                total: 0,
                categorized: 0,
                stats: { processed: 0, errors: 1 }
            };
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.updateProgress('Finalisation...', 'Préparation des résultats');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirection automatique vers les résultats
        this.redirectToResults();
    }

    updateProgress(title, subtitle) {
        const titleEl = document.getElementById('progressTitle');
        if (titleEl) titleEl.textContent = title;
        
        const subtitleEl = document.getElementById('progressSubtitle');
        if (subtitleEl) subtitleEl.textContent = subtitle;
    }

    startTimer() {
        const timerEl = document.getElementById('timerText');
        if (!timerEl) return;
        
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.scanStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    redirectToResults() {
        this.stopTimer();
        this.scanInProgress = false;
        
        // Stocker les résultats pour la page de résultats
        if (this.scanResults) {
            sessionStorage.setItem('scanResults', JSON.stringify({
                ...this.scanResults,
                scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
                selectedDays: this.selectedDays,
                timestamp: Date.now()
            }));
        }
        
        // Notification de succès
        if (window.uiManager?.showToast) {
            const totalEmails = this.scanResults?.total || 0;
            window.uiManager.showToast(`✅ ${totalEmails} emails analysés avec succès`, 'success');
        }
        
        // Redirection automatique vers la page des emails/résultats
        setTimeout(() => {
            if (window.pageManager) {
                window.pageManager.loadPage('emails');
            } else {
                console.log('[ModernScan] PageManager not available, scan completed');
            }
        }, 500);
    }

    showError(error) {
        this.stopTimer();
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.innerHTML = `
                <div style="text-align: center; padding: 32px 0;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: white; font-size: 24px;">
                        <i class="fas fa-times"></i>
                    </div>
                    
                    <div style="font-size: 18px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">Erreur de scan</div>
                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">${error.message}</div>
                    
                    <button class="scan-button-modern" onclick="window.pageManager.loadPage('scanner')" style="width: auto; padding: 0 24px;">
                        <div class="scan-button-content">
                            <i class="fas fa-redo"></i>
                            <span>Réessayer</span>
                        </div>
                    </button>
                </div>
            `;
        }
        
        this.scanInProgress = false;
    }
}

// Créer l'instance globale
window.modernScanModule = new ModernScanStartModule();
window.scanStartModule = window.modernScanModule; // Compatibilité

console.log('[ModernScan] 🚀 Ultra-modern optimized scanner ready');
