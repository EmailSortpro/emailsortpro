// StartScan.js - Version 10.0 - Détection automatique Outlook/Gmail

console.log('[StartScan] 🚀 Loading StartScan.js v10.0 - Provider Detection...');

class UnifiedScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        this.provider = null;
        this.scanner = null;
        
        // Paramètres universels
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        console.log('[UnifiedScan] Scanner v10.0 initialized - Auto-detection Provider');
        this.detectProvider();
        this.loadSettingsFromCategoryManager();
        this.addMinimalStyles();
    }

    // ================================================
    // DÉTECTION DU PROVIDER
    // ================================================
    detectProvider() {
        if (window.googleAuthService?.isAuthenticated()) {
            this.provider = 'gmail';
            console.log('[UnifiedScan] 📧 Provider détecté: Gmail');
        } else if (window.authService?.isAuthenticated()) {
            this.provider = 'outlook';
            console.log('[UnifiedScan] 📧 Provider détecté: Outlook');
        } else {
            this.provider = null;
            console.log('[UnifiedScan] ⚠️ Aucun provider authentifié');
        }
        return this.provider;
    }

    // ================================================
    // INITIALISATION DU SCANNER APPROPRIÉ
    // ================================================
    async initializeScanner() {
        if (!this.provider) {
            this.detectProvider();
        }

        if (!this.scanner) {
            if (this.provider === 'gmail') {
                if (window.EmailScannerGmail) {
                    this.scanner = window.emailScannerGmail || new window.EmailScannerGmail();
                    console.log('[UnifiedScan] ✅ Scanner Gmail initialisé');
                } else {
                    console.error('[UnifiedScan] ❌ EmailScannerGmail non disponible');
                }
            } else if (this.provider === 'outlook') {
                if (window.EmailScannerOutlook) {
                    this.scanner = window.emailScannerOutlook || new window.EmailScannerOutlook();
                    console.log('[UnifiedScan] ✅ Scanner Outlook initialisé');
                } else {
                    console.error('[UnifiedScan] ❌ EmailScannerOutlook non disponible');
                }
            }
        }

        return this.scanner;
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES (identique)
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
                const saved = localStorage.getItem('categorySettings');
                if (saved) {
                    this.settings = JSON.parse(saved);
                    this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                }
            }
            
            this.lastSettingsSync = Date.now();
        } catch (error) {
            console.error('[UnifiedScan] ❌ Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
        }
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

    // ================================================
    // STYLES (identiques pour les deux)
    // ================================================
    addMinimalStyles() {
        if (this.stylesAdded || document.getElementById('unified-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'unified-scan-styles';
        styles.textContent = `
            /* Scanner Unifié v10.0 */
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

            .provider-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 20px;
                padding: 6px 16px;
                font-size: 14px;
                font-weight: 600;
                color: #6366f1;
                margin-bottom: 20px;
            }

            .provider-badge.gmail {
                background: rgba(234, 67, 53, 0.1);
                border-color: rgba(234, 67, 53, 0.3);
                color: #ea4335;
            }

            .provider-badge i {
                font-size: 16px;
            }
            
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
                position: relative;
                overflow: hidden;
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
            
            .scan-button-minimal::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .scan-button-minimal:hover::before {
                left: 100%;
            }
            
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
            
            @media (max-width: 480px) {
                .scanner-card-minimal {
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
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[UnifiedScan] ✅ Styles v10.0 ajoutés');
    }

    // ================================================
    // RENDER PRINCIPAL
    // ================================================
    async render(container) {
        console.log('[UnifiedScan] 🎯 Rendu du scanner unifié...');
        
        try {
            this.addMinimalStyles();
            this.detectProvider();
            this.checkSettingsUpdate();
            
            if (!this.provider) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            await this.checkServices();
            await this.initializeScanner();
            
            container.innerHTML = this.renderMinimalScanner();
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log('[UnifiedScan] ✅ Scanner rendu avec succès - Provider:', this.provider);
            
        } catch (error) {
            console.error('[UnifiedScan] ❌ Erreur lors du rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderMinimalScanner() {
        const providerIcon = this.provider === 'gmail' ? 
            '<i class="fab fa-google"></i>' : 
            '<i class="fab fa-microsoft"></i>';
        
        const providerName = this.provider === 'gmail' ? 'Gmail' : 'Outlook';
        
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner Email</h1>
                    <p class="scanner-subtitle">Organisez vos emails automatiquement avec IA</p>
                    
                    <div class="provider-badge ${this.provider}">
                        ${providerIcon}
                        <span>Connecté avec ${providerName}</span>
                    </div>
                    
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
                    
                    <button class="scan-button-minimal" id="unifiedScanBtn" onclick="window.unifiedScanModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Démarrer l'analyse intelligente</span>
                    </button>
                    
                    <div class="progress-section-minimal" id="progressSection">
                        <div class="progress-bar-minimal">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus">Préparation du scan</div>
                    </div>
                    
                    <div class="scan-info">
                        <div class="scan-info-main">
                            <i class="fas fa-shield-alt"></i>
                            <span>Scan sécurisé avec ${providerName} et IA Claude</span>
                        </div>
                        ${this.renderScanInfoDetails()}
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
                    
                    <div style="display: flex; gap: 12px; justify-content: center; margin-top: 30px;">
                        <button class="scan-button-minimal" style="flex: 1;" onclick="window.authService.login()">
                            <i class="fab fa-microsoft"></i>
                            <span>Outlook</span>
                        </button>
                        <button class="scan-button-minimal" style="flex: 1; background: linear-gradient(135deg, #ea4335 0%, #fbbc04 100%);" 
                                onclick="window.googleAuthService.login()">
                            <i class="fab fa-google"></i>
                            <span>Gmail</span>
                        </button>
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
            { value: 30, label: '30 jours' }
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
        
        if (this.provider) {
            details.push(`Provider: ${this.provider === 'gmail' ? 'Gmail' : 'Outlook'}`);
        }
        
        if (this.taskPreselectedCategories.length > 0) {
            details.push(`${this.taskPreselectedCategories.length} catégorie(s) pour tâches`);
        }
        
        if (this.settings.scanSettings?.autoAnalyze) {
            details.push('Analyse IA activée');
        }
        
        if (this.settings.preferences?.excludeSpam) {
            details.push('Filtrage spam actif');
        }
        
        return details.length > 0 ? 
            `<div class="scan-info-details">${details.join(' • ')}</div>` :
            '<div class="scan-info-details">Configuration par défaut</div>';
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

    // ================================================
    // VÉRIFICATION DES SERVICES
    // ================================================
    async checkServices() {
        if (!this.provider) {
            throw new Error('Aucun provider authentifié');
        }
        
        if (this.provider === 'gmail' && !window.googleAuthService?.isAuthenticated()) {
            throw new Error('Authentification Gmail requise');
        }
        
        if (this.provider === 'outlook' && !window.authService?.isAuthenticated()) {
            throw new Error('Authentification Outlook requise');
        }
        
        if (!window.mailService) {
            console.warn('[UnifiedScan] ⚠️ MailService non disponible');
        }
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS
    // ================================================
    initializeEvents() {
        console.log('[UnifiedScan] ✅ Événements initialisés');
        
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
        }
        
        this.settingsCheckInterval = setInterval(() => {
            this.checkSettingsUpdate();
        }, 10000);
    }

    checkSettingsUpdate() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 5000) return;
        
        try {
            const oldTaskCategories = [...this.taskPreselectedCategories];
            const oldSelectedDays = this.selectedDays;
            
            this.loadSettingsFromCategoryManager();
            
            const categoriesChanged = JSON.stringify(oldTaskCategories.sort()) !== 
                                    JSON.stringify([...this.taskPreselectedCategories].sort());
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

    selectDuration(days) {
        this.selectedDays = days;
        
        document.querySelectorAll('.duration-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`[data-days="${days}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        console.log(`[UnifiedScan] ✅ Durée sélectionnée: ${days} jours`);
    }

    // ================================================
    // DÉMARRAGE DU SCAN
    // ================================================
    async startScan() {
        if (this.scanInProgress) {
            console.log('[UnifiedScan] Scan déjà en cours');
            return;
        }
        
        console.log('[UnifiedScan] 🚀 Démarrage du scan -', this.provider);
        console.log('[UnifiedScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            // S'assurer que le scanner est initialisé
            if (!this.scanner) {
                await this.initializeScanner();
            }
            
            if (!this.scanner) {
                throw new Error('Scanner non disponible pour ' + this.provider);
            }
            
            this.setActiveStep(2);
            
            const progressSection = document.getElementById('progressSection');
            if (progressSection) {
                progressSection.classList.add('visible');
            }
            
            const scanBtn = document.getElementById('unifiedScanBtn');
            if (scanBtn) {
                scanBtn.disabled = true;
                scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyse en cours...</span>';
            }
            
            const scanOptions = this.prepareScanOptions();
            
            // Déléguer au scanner approprié
            const results = await this.scanner.scan(scanOptions);
            this.scanResults = results;
            
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
            const scanBtn = document.getElementById('unifiedScanBtn');
            if (scanBtn) {
                const preselectedCount = this.scanResults?.stats?.preselectedForTasks || 0;
                
                scanBtn.innerHTML = `<i class="fas fa-check"></i> <span>Scan terminé !</span>`;
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
            
            setTimeout(() => {
                this.redirectToResults();
            }, 1500);
        }, 500);
    }

    redirectToResults() {
        this.scanInProgress = false;
        
        const essentialResults = {
            success: true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            timestamp: Date.now(),
            provider: this.provider
        };
        
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
        } catch (error) {
            console.warn('[UnifiedScan] Erreur stockage:', error);
        }
        
        if (window.uiManager?.showToast) {
            const message = essentialResults.preselectedForTasks > 0 ?
                `✅ ${essentialResults.total} emails analysés • ⭐ ${essentialResults.preselectedForTasks} pré-sélectionnés` :
                `✅ ${essentialResults.total} emails analysés`;
            
            window.uiManager.showToast(message, 'success', 4000);
        }
        
        // Rediriger vers la page emails appropriée
        setTimeout(() => {
            if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                window.pageManager.loadPage('emails');
            } else if (this.provider === 'gmail' && window.pageManagerGmail) {
                window.pageManagerGmail.loadPage('emails');
            } else if (this.provider === 'outlook' && window.pageManagerOutlook) {
                window.pageManagerOutlook.loadPage('emails');
            }
        }, 500);
    }

    showScanError(error) {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">
                        Erreur de scan
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">
                        ${error.message}
                    </div>
                    
                    <button class="scan-button-minimal" onclick="window.unifiedScanModule.resetScanner()" 
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
        
        const scanBtn = document.getElementById('unifiedScanBtn');
        if (scanBtn) {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="fas fa-play"></i> <span>Démarrer l\'analyse intelligente</span>';
            scanBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            
            const badge = scanBtn.querySelector('.success-badge');
            if (badge) badge.remove();
        }
        
        this.updateProgress(0, 'Initialisation...', 'Préparation du scan');
        
        this.loadSettingsFromCategoryManager();
        this.updatePreselectedCategoriesDisplay();
        
        console.log('[UnifiedScan] 🔄 Scanner réinitialisé');
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
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            lastSettingsSync: this.lastSettingsSync,
            scanResults: this.scanResults,
            provider: this.provider,
            scanner: this.scanner ? this.scanner.constructor.name : null
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
        this.scanner = null;
        console.log('[UnifiedScan] Instance détruite');
    }
}

// Créer l'instance globale
if (window.unifiedScanModule) {
    window.unifiedScanModule.destroy?.();
}

window.UnifiedScanModule = UnifiedScanModule;
window.unifiedScanModule = new UnifiedScanModule();

// Compatibilité avec les anciens noms
window.minimalScanModule = window.unifiedScanModule;
window.scanStartModule = window.unifiedScanModule;

console.log('[StartScan] ✅ Scanner unifié v10.0 chargé - Détection automatique Outlook/Gmail!');
