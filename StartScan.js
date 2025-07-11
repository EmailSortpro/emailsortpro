// StartScan.js - Version 11.1 - Scanner Unifié avec correction syntaxe
// Affichage instantané des résultats, sans limite d'emails

console.log('[StartScan] 🚀 Loading StartScan.js v11.1 - Scanner Unifié Corrigé...');

class UnifiedScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        this.scanResults = null;
        
        // Détection du provider actuel
        this.currentProvider = null;
        this.isAuthenticated = false;
        
        // Intégration avec les paramètres
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        console.log('[UnifiedScan] Scanner v11.1 initialized - Corrigé');
        this.detectCurrentProvider();
        this.loadSettingsFromCategoryManager();
        this.addUnifiedStyles();
    }

    // ================================================
    // DÉTECTION DU PROVIDER
    // ================================================
    detectCurrentProvider() {
        console.log('[UnifiedScan] 🔍 Détection du provider...');
        
        // Vérifier Gmail
        if (window.googleAuthService?.isAuthenticated) {
            const isGmailAuth = window.googleAuthService.isAuthenticated();
            if (isGmailAuth) {
                this.currentProvider = 'gmail';
                this.isAuthenticated = true;
                console.log('[UnifiedScan] ✅ Gmail détecté et connecté');
                return;
            }
        }
        
        // Vérifier Outlook
        if (window.authService?.isAuthenticated && window.authService.isAuthenticated()) {
            this.currentProvider = 'outlook';
            this.isAuthenticated = true;
            console.log('[UnifiedScan] ✅ Outlook détecté et connecté');
            return;
        }
        
        // Vérifier via MailService
        if (window.mailService?.getCurrentProvider) {
            const provider = window.mailService.getCurrentProvider();
            if (provider === 'google' || provider === 'gmail') {
                this.currentProvider = 'gmail';
                this.isAuthenticated = true;
            } else if (provider === 'microsoft' || provider === 'outlook') {
                this.currentProvider = 'outlook';
                this.isAuthenticated = true;
            }
        }
        
        // Si aucun provider détecté
        if (!this.currentProvider) {
            console.log('[UnifiedScan] ⚠️ Aucun provider détecté');
            this.currentProvider = null;
            this.isAuthenticated = false;
        }
    }

    // ================================================
    // INTÉGRATION AVEC LES PARAMÈTRES
    // ================================================
    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[UnifiedScan] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[UnifiedScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
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
                    console.warn('[UnifiedScan] ⚠️ Erreur chargement localStorage:', error);
                }
            }
            
            this.lastSettingsSync = Date.now();
        } catch (error) {
            console.error('[UnifiedScan] ❌ Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
        }
    }

    getDefaultSettings() {
        return {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true,
                maxEmails: -1 // Pas de limite
            },
            taskPreselectedCategories: [],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            }
        };
    }

    // ================================================
    // STYLES UNIFIÉS
    // ================================================
    addUnifiedStyles() {
        if (this.stylesAdded || document.getElementById('unified-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'unified-scan-styles';
        styles.textContent = `
            /* Scanner Unifié v11.1 - Optimisé */
            .unified-scanner {
                height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                overflow: hidden;
                position: relative;
                padding: 20px;
            }
            
            .scanner-card-unified {
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
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Scanner Icon */
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
                position: relative;
            }
            
            .scanner-icon.gmail {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
            }
            
            .scanner-icon.outlook {
                background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
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
            
            /* Affichage des catégories pré-sélectionnées */
            #preselected-categories-display {
                margin: 20px 0;
            }
            
            .preselected-info {
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                color: #7c3aed;
                font-size: 14px;
                font-weight: 500;
                text-align: left;
                margin-bottom: 12px;
            }
            
            .preselected-info.no-selection {
                background: rgba(107, 114, 128, 0.1);
                border-color: rgba(107, 114, 128, 0.3);
                color: #6b7280;
            }
            
            .preselected-info i {
                font-size: 16px;
                flex-shrink: 0;
            }
            
            .preselected-categories-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
            }
            
            .preselected-category-badge {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border: 2px solid;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.2s ease;
            }
            
            .preselected-category-badge:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .category-icon {
                font-size: 16px;
            }
            
            /* Étapes visuelles */
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
            
            /* Sélecteur de durée */
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
                position: relative;
            }
            
            .duration-option.selected {
                border-color: #667eea;
                background: #667eea;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .duration-option:hover:not(.selected) {
                border-color: #9ca3af;
                transform: translateY(-1px);
            }
            
            /* Bouton de scan */
            .scan-button-unified {
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
            
            .scan-button-unified.gmail {
                background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
            }
            
            .scan-button-unified.outlook {
                background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
            }
            
            .scan-button-unified:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button-unified:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .scan-button-unified::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .scan-button-unified:hover::before {
                left: 100%;
            }
            
            /* Badge de résultat avec catégories */
            .success-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #8b5cf6;
                color: white;
                font-size: 11px;
                padding: 4px 8px;
                border-radius: 12px;
                font-weight: 700;
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
            }
            
            /* Section de progression */
            .progress-section-unified {
                opacity: 0;
                transition: opacity 0.3s ease;
                margin-top: 20px;
            }
            
            .progress-section-unified.visible {
                opacity: 1;
            }
            
            .progress-bar-unified {
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
            
            .progress-fill.gmail {
                background: linear-gradient(90deg, #4285f4 0%, #1a73e8 100%);
            }
            
            .progress-fill.outlook {
                background: linear-gradient(90deg, #0078d4 0%, #005a9e 100%);
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
            
            /* Info badge */
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
                flex-direction: column;
            }
            
            .scan-info-main {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .scan-info-details {
                font-size: 12px;
                color: #8b5cf6;
                margin-top: 4px;
                text-align: center;
            }
            
            /* Welcome state */
            .welcome-state {
                padding: 40px 0;
            }
            
            .auth-buttons {
                display: flex;
                gap: 16px;
                justify-content: center;
                margin-top: 30px;
            }
            
            .auth-button {
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
            
            .auth-button.gmail {
                background: #4285f4;
            }
            
            .auth-button.gmail:hover {
                background: #3367d6;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(66, 133, 244, 0.3);
            }
            
            .auth-button.outlook {
                background: #0078d4;
            }
            
            .auth-button.outlook:hover {
                background: #005a9e;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 120, 212, 0.3);
            }
            
            /* Responsive */
            @media (max-width: 640px) {
                .scanner-card-unified {
                    padding: 35px 25px;
                }
                
                .scanner-title {
                    font-size: 28px;
                }
                
                .scanner-subtitle {
                    font-size: 16px;
                }
                
                .preselected-categories-grid {
                    gap: 6px;
                }
                
                .preselected-category-badge {
                    font-size: 12px;
                    padding: 6px 10px;
                }
                
                .duration-option {
                    padding: 10px 16px;
                    font-size: 13px;
                    min-width: 75px;
                }
                
                .auth-buttons {
                    flex-direction: column;
                }
                
                .auth-button {
                    max-width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[UnifiedScan] ✅ Styles v11.1 ajoutés');
    }

    // ================================================
    // RENDU PRINCIPAL
    // ================================================
    async render(container) {
        console.log('[UnifiedScan] 🎯 Rendu du scanner unifié v11.1...');
        
        try {
            this.addUnifiedStyles();
            this.detectCurrentProvider();
            this.checkSettingsUpdate();
            
            if (!this.isAuthenticated) {
                container.innerHTML = this.renderWelcomeState();
                return;
            }

            await this.checkServices();
            
            container.innerHTML = this.renderUnifiedScanner();
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log('[UnifiedScan] ✅ Scanner unifié v11.1 rendu avec succès');
            
        } catch (error) {
            console.error('[UnifiedScan] ❌ Erreur lors du rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderWelcomeState() {
        return `
            <div class="unified-scanner">
                <div class="scanner-card-unified">
                    <div class="welcome-state">
                        <div class="scanner-icon">
                            <i class="fas fa-envelope-open-text"></i>
                        </div>
                        
                        <h1 class="scanner-title">Scanner Email Unifié</h1>
                        <p class="scanner-subtitle">Connectez-vous pour analyser vos emails avec l'IA</p>
                        
                        <div class="auth-buttons">
                            <button class="auth-button gmail" onclick="window.unifiedScanModule.loginGmail()">
                                <i class="fab fa-google"></i>
                                <span>Gmail</span>
                            </button>
                            
                            <button class="auth-button outlook" onclick="window.unifiedScanModule.loginOutlook()">
                                <i class="fab fa-microsoft"></i>
                                <span>Outlook</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="scan-info">
                        <div class="scan-info-main">
                            <i class="fas fa-shield-alt"></i>
                            <span>Scan sécurisé et privé avec IA Claude</span>
                        </div>
                        <div class="scan-info-details">
                            Support Gmail & Outlook • Catégorisation intelligente • Création de tâches automatique
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderUnifiedScanner() {
        const providerName = this.currentProvider === 'gmail' ? 'Gmail' : 'Outlook';
        const providerIcon = this.currentProvider === 'gmail' ? 'fab fa-google' : 'fab fa-microsoft';
        const providerClass = this.currentProvider;
        
        return `
            <div class="unified-scanner">
                <div class="scanner-card-unified">
                    <div class="scanner-icon ${providerClass}">
                        <i class="${providerIcon}"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner ${providerName}</h1>
                    <p class="scanner-subtitle">Analysez tous vos emails ${providerName} avec l'IA</p>
                    
                    <div id="preselected-categories-display">
                        ${this.renderPreselectedCategories()}
                    </div>
                    
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
                            ${this.renderDurationOptions()}
                        </div>
                    </div>
                    
                    <button class="scan-button-unified ${providerClass}" id="unifiedScanBtn" onclick="window.unifiedScanModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Démarrer l'analyse ${providerName}</span>
                    </button>
                    
                    <div class="progress-section-unified" id="progressSection">
                        <div class="progress-bar-unified">
                            <div class="progress-fill ${providerClass}" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus">Préparation du scan ${providerName}</div>
                    </div>
                    
                    <div class="scan-info">
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
            { value: 30, label: '30 jours' },
            { value: 90, label: '3 mois' },
            { value: -1, label: 'Tous' }
        ];
        
        return options.map(option => {
            const isSelected = option.value === this.selectedDays;
            return `
                <button class="duration-option ${isSelected ? 'selected' : ''}" 
                        onclick="window.unifiedScanModule.selectDuration(${option.value})" 
                        data-days="${option.value}">
                    ${option.label}
                </button>
            `;
        }).join('');
    }

    renderScanInfoDetails() {
        let details = [];
        
        if (this.taskPreselectedCategories.length > 0) {
            details.push(`${this.taskPreselectedCategories.length} catégorie(s) pour tâches automatiques`);
        }
        
        if (this.settings.scanSettings?.autoAnalyze) {
            details.push('Analyse IA activée');
        }
        
        if (this.settings.preferences?.excludeSpam) {
            details.push('Filtrage spam actif');
        }
        
        const provider = this.currentProvider === 'gmail' ? 'Gmail' : 'Outlook';
        details.push(`Compte ${provider} connecté`);
        details.push('Sans limite d\'emails');
        
        return details.length > 0 ? 
            `<div class="scan-info-details">${details.join(' • ')}</div>` :
            '<div class="scan-info-details">Configuration par défaut</div>';
    }

    renderError(error) {
        return `
            <div class="unified-scanner">
                <div class="scanner-card-unified">
                    <div class="scanner-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 class="scanner-title">Erreur</h1>
                    <p class="scanner-subtitle">${error.message}</p>
                    
                    <button class="scan-button-unified" onclick="window.location.reload()">
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
    async loginGmail() {
        console.log('[UnifiedScan] 🔐 Connexion Gmail...');
        try {
            if (window.googleAuthService?.login) {
                await window.googleAuthService.login();
            } else if (window.mailService?.authenticate) {
                await window.mailService.authenticate('google');
            } else {
                // Simuler une connexion
                this.currentProvider = 'gmail';
                this.isAuthenticated = true;
            }
            
            // Recharger la page
            const container = document.querySelector('.unified-scanner')?.parentElement;
            if (container) {
                this.render(container);
            }
        } catch (error) {
            console.error('[UnifiedScan] Erreur connexion Gmail:', error);
            this.showToast('Erreur de connexion Gmail', 'error');
        }
    }

    async loginOutlook() {
        console.log('[UnifiedScan] 🔐 Connexion Outlook...');
        try {
            if (window.authService?.login) {
                await window.authService.login();
            } else if (window.mailService?.authenticate) {
                await window.mailService.authenticate('microsoft');
            } else {
                // Simuler une connexion
                this.currentProvider = 'outlook';
                this.isAuthenticated = true;
            }
            
            // Recharger la page
            const container = document.querySelector('.unified-scanner')?.parentElement;
            if (container) {
                this.render(container);
            }
        } catch (error) {
            console.error('[UnifiedScan] Erreur connexion Outlook:', error);
            this.showToast('Erreur de connexion Outlook', 'error');
        }
    }

    // ================================================
    // SCAN OPTIMISÉ
    // ================================================
    async startScan() {
        if (this.scanInProgress) {
            console.log('[UnifiedScan] Scan déjà en cours');
            return;
        }
        
        console.log('[UnifiedScan] 🚀 Démarrage du scan unifié optimisé');
        console.log('[UnifiedScan] 📧 Provider:', this.currentProvider);
        console.log('[UnifiedScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        console.log('[UnifiedScan] 📅 Période:', this.selectedDays === -1 ? 'Tous les emails' : `${this.selectedDays} jours`);
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            this.setActiveStep(2);
            
            const progressSection = document.getElementById('progressSection');
            if (progressSection) {
                progressSection.classList.add('visible');
            }
            
            const scanBtn = document.getElementById('unifiedScanBtn');
            if (scanBtn) {
                scanBtn.disabled = true;
                const providerName = this.currentProvider === 'gmail' ? 'Gmail' : 'Outlook';
                scanBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Analyse ${providerName} en cours...</span>`;
            }
            
            const scanOptions = this.prepareScanOptions();
            await this.executeScan(scanOptions);
            
            this.setActiveStep(3);
            this.completeScan();
            
        } catch (error) {
            console.error('[UnifiedScan] ❌ Erreur de scan:', error);
            this.showScanError(error);
        }
    }

    prepareScanOptions() {
        const baseOptions = {
            days: this.selectedDays,
            folder: this.settings.scanSettings?.defaultFolder || 'inbox',
            autoAnalyze: this.settings.scanSettings?.autoAnalyze !== false,
            autoCategrize: this.settings.scanSettings?.autoCategrize !== false,
            includeSpam: !this.settings.preferences?.excludeSpam,
            detectCC: this.settings.preferences?.detectCC !== false,
            provider: this.currentProvider,
            maxResults: this.selectedDays === -1 ? -1 : undefined, // Pas de limite si "Tous" sélectionné
            onProgress: (progress) => this.updateProgress(
                progress.progress?.current || 0, 
                progress.message || '', 
                progress.phase || ''
            )
        };
        
        if (this.taskPreselectedCategories.length > 0) {
            baseOptions.taskPreselectedCategories = [...this.taskPreselectedCategories];
        }
        
        console.log('[UnifiedScan] 📊 Options de scan:', baseOptions);
        return baseOptions;
    }

    async executeScan(scanOptions) {
        try {
            if (window.emailScanner && typeof window.emailScanner.scan === 'function') {
                console.log('[UnifiedScan] 🔄 Scan réel en cours...');
                
                const results = await window.emailScanner.scan(scanOptions);
                this.scanResults = results;
                
                console.log('[UnifiedScan] ✅ Scan terminé:', results);
                
                if (results.stats?.preselectedForTasks > 0) {
                    console.log(`[UnifiedScan] ⭐ ${results.stats.preselectedForTasks} emails pré-sélectionnés pour tâches`);
                }
                
            } else {
                console.log('[UnifiedScan] 🎭 Mode simulation');
                
                // Simulation spécifique au provider
                for (let i = 0; i <= 100; i += 5) {
                    const providerName = this.currentProvider === 'gmail' ? 'Gmail' : 'Outlook';
                    this.updateProgress(i, `Analyse ${providerName} ${i}%`, 'Récupération des emails');
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                this.scanResults = {
                    success: true,
                    total: this.currentProvider === 'gmail' ? 1250 : 800,
                    categorized: this.currentProvider === 'gmail' ? 1180 : 750,
                    provider: this.currentProvider,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    stats: { 
                        preselectedForTasks: this.taskPreselectedCategories.length > 0 ? 125 : 0,
                        taskSuggestions: 100
                    }
                };
            }
        } catch (error) {
            console.error('[UnifiedScan] ❌ Erreur scan:', error);
            throw error;
        }
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
        const scanBtn = document.getElementById('unifiedScanBtn');
        if (scanBtn) {
            const preselectedCount = this.scanResults?.stats?.preselectedForTasks || 0;
            const providerName = this.currentProvider === 'gmail' ? 'Gmail' : 'Outlook';
            
            scanBtn.innerHTML = `<i class="fas fa-check"></i> <span>Scan ${providerName} terminé !</span>`;
            scanBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            if (preselectedCount > 0) {
                scanBtn.style.position = 'relative';
                scanBtn.insertAdjacentHTML('beforeend', `
                    <span class="success-badge">
                        ⭐ ${preselectedCount} emails pour tâches
                    </span>
                `);
            }
        }
        
        // Redirection immédiate vers les résultats
        this.redirectToResults();
    }

    redirectToResults() {
        this.scanInProgress = false;
        
        const essentialResults = {
            success: true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            provider: this.currentProvider,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            timestamp: Date.now()
        };
        
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
        } catch (error) {
            console.warn('[UnifiedScan] Erreur stockage:', error);
        }
        
        // Notification
        if (window.uiManager?.showToast) {
            const providerName = this.currentProvider === 'gmail' ? 'Gmail' : 'Outlook';
            const message = essentialResults.preselectedForTasks > 0 ?
                `✅ ${essentialResults.total} emails ${providerName} analysés • ⭐ ${essentialResults.preselectedForTasks} pré-sélectionnés` :
                `✅ ${essentialResults.total} emails ${providerName} analysés`;
            
            window.uiManager.showToast(message, 'success', 4000);
        }
        
        console.log('[UnifiedScan] 🔄 Redirection immédiate vers la page emails...');
        
        // Redirection immédiate
        try {
            if (this.currentProvider === 'gmail') {
                console.log('[UnifiedScan] 📧 Redirection vers PageManagerGmail...');
                
                if (window.pageManagerGmail && typeof window.pageManagerGmail.loadPage === 'function') {
                    console.log('[UnifiedScan] ✅ Utilisation de pageManagerGmail.loadPage');
                    window.pageManagerGmail.loadPage('emails');
                } else if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                    console.log('[UnifiedScan] ✅ Utilisation de pageManager.loadPage');
                    window.pageManager.loadPage('emails');
                } else {
                    console.log('[UnifiedScan] ⚠️ Aucun PageManager trouvé, rechargement...');
                    window.location.href = '#emails';
                    window.location.reload();
                }
                
            } else if (this.currentProvider === 'outlook') {
                console.log('[UnifiedScan] 📧 Redirection vers PageManagerOutlook...');
                
                if (window.pageManagerOutlook && typeof window.pageManagerOutlook.loadPage === 'function') {
                    console.log('[UnifiedScan] ✅ Utilisation de pageManagerOutlook.loadPage');
                    window.pageManagerOutlook.loadPage('emails');
                } else if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                    console.log('[UnifiedScan] ✅ Utilisation de pageManager.loadPage');
                    window.pageManager.loadPage('emails');
                } else {
                    console.log('[UnifiedScan] ⚠️ Aucun PageManager trouvé, rechargement...');
                    window.location.href = '#emails';
                    window.location.reload();
                }
                
            } else {
                // Fallback - redirection générique
                console.log('[UnifiedScan] 🔄 Redirection générique...');
                if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                    window.pageManager.loadPage('emails');
                } else {
                    window.location.href = '#emails';
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('[UnifiedScan] ❌ Erreur redirection:', error);
            // En cas d'erreur, forcer le rechargement
            window.location.href = '#emails';
            window.location.reload();
        }
    }

    showScanError(error) {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">Erreur de scan</div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">${error.message}</div>
                    
                    <button class="scan-button-unified" onclick="window.unifiedScanModule.resetScanner()" 
                            style="width: auto; padding: 0 20px; height: 40px; font-size: 14px;">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
                </div>
            `;
        }
        
        this.scanInProgress = false;
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    async checkServices() {
        if (!this.isAuthenticated) {
            throw new Error('Authentification requise');
        }
        
        if (!window.mailService && !window.authService && !window.googleAuthService) {
            console.warn('[UnifiedScan] ⚠️ Services d\'authentification non disponibles');
        }
    }

    initializeEvents() {
        console.log('[UnifiedScan] ✅ Événements initialisés');
        
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
        }
        
        this.settingsCheckInterval = setInterval(() => {
            this.checkSettingsUpdate();
        }, 10000);
    }

    selectDuration(days) {
        this.selectedDays = days;
        
        document.querySelectorAll('.duration-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`[data-days="${days}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        console.log(`[UnifiedScan] ✅ Durée sélectionnée: ${days === -1 ? 'Tous les emails' : days + ' jours'}`);
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
                console.log('[UnifiedScan] 🔄 Paramètres mis à jour détectés');
                this.updateUIWithNewSettings();
            }
        } catch (error) {
            console.error('[UnifiedScan] Erreur vérification paramètres:', error);
        }
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

    resetScanner() {
        this.scanInProgress = false;
        this.setActiveStep(1);
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.classList.remove('visible');
        }
        
        const scanBtn = document.getElementById('unifiedScanBtn');
        if (scanBtn) {
            scanBtn.disabled = false;
            const providerName = this.currentProvider === 'gmail' ? 'Gmail' : 'Outlook';
            scanBtn.innerHTML = `<i class="fas fa-play"></i> <span>Démarrer l'analyse ${providerName}</span>`;
            scanBtn.style.background = '';
            
            const badge = scanBtn.querySelector('.success-badge');
            if (badge) badge.remove();
        }
        
        this.updateProgress(0, 'Initialisation...', 'Préparation du scan');
        
        this.loadSettingsFromCategoryManager();
        this.updatePreselectedCategoriesDisplay();
        
        console.log('[UnifiedScan] 🔄 Scanner réinitialisé');
    }

    showToast(message, type = 'info') {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[UnifiedScan] Toast: ${type} - ${message}`);
        }
    }

    updateSettings(newSettings) {
        console.log('[UnifiedScan] 📝 Mise à jour des paramètres:', newSettings);
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.taskPreselectedCategories = [...newSettings.taskPreselectedCategories];
        }
        
        if (newSettings.scanSettings?.defaultPeriod) {
            this.selectedDays = newSettings.scanSettings.defaultPeriod;
        }
        
        this.updateUIWithNewSettings();
    }

    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            currentProvider: this.currentProvider,
            isAuthenticated: this.isAuthenticated,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            lastSettingsSync: this.lastSettingsSync,
            scanResults: this.scanResults
        };
    }

    cleanup() {
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
            this.settingsCheckInterval = null;
        }
        
        this.scanInProgress = false;
        this.isInitialized = false;
        
        console.log('[UnifiedScan] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.currentProvider = null;
        this.isAuthenticated = false;
        console.log('[UnifiedScan] Instance détruite');
    }
}

// Créer l'instance globale
if (window.unifiedScanModule) {
    window.unifiedScanModule.destroy?.();
}

// Remplacer toutes les instances
window.UnifiedScanModule = UnifiedScanModule;
window.unifiedScanModule = new UnifiedScanModule();
window.scanStartModule = window.unifiedScanModule;
window.minimalScanModule = window.unifiedScanModule; // Compatibilité

console.log('[StartScan] ✅ Scanner Unifié v11.1 chargé - Corrigé!');
