// StartScan.js - Version 11.0 - Scan unifié avec détection marketing améliorée

console.log('[StartScan] 🚀 Loading StartScan.js v11.0 - Marketing detection enhanced...');

class MinimalScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        this.currentProvider = null; // 'microsoft' ou 'google'
        
        // Intégration paramètres unifiée
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        console.log('[MinimalScan] Scanner v11.0 initialized - Marketing detection enhanced');
        this.loadSettingsFromCategoryManager();
        this.addMinimalStyles();
    }

    // ================================================
    // DÉTECTION PROVIDER UNIFIÉ - PRIORITÉ GOOGLE
    // ================================================
    detectProvider() {
        // PRIORITÉ 1: Google Gmail (pour la nouvelle optimisation)
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            this.currentProvider = 'google';
            return 'google';
        } 
        // PRIORITÉ 2: Microsoft Outlook
        else if (window.authService && window.authService.isAuthenticated()) {
            this.currentProvider = 'microsoft';
            return 'microsoft';
        }
        return null;
    }

    getProviderInfo() {
        const provider = this.detectProvider();
        
        if (provider === 'google') {
            return {
                name: 'Google Gmail',
                icon: 'fab fa-google',
                color: '#ea4335',
                service: window.googleAuthService,
                priority: 'high' // Nouvelle priorité pour Gmail
            };
        } else if (provider === 'microsoft') {
            return {
                name: 'Microsoft Outlook',
                icon: 'fab fa-microsoft',
                color: '#0078d4',
                service: window.authService,
                priority: 'normal'
            };
        }
        
        return {
            name: 'Non connecté',
            icon: 'fas fa-question-circle',
            color: '#6b7280',
            service: null,
            priority: 'none'
        };
    }

    // ================================================
    // INTÉGRATION PARAMÈTRES AVEC FOCUS MARKETING
    // ================================================
    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[MinimalScan] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[MinimalScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                // Vérifier la présence de marketing dans les catégories
                const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
                if (hasMarketing) {
                    console.log('[MinimalScan] 📰 Marketing dans les catégories pré-sélectionnées - Optimisation activée');
                }
                
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

    getDefaultSettings() {
        return {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            taskPreselectedCategories: ['tasks', 'meetings', 'finance'], // Marketing pas par défaut
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true,
                marketingPriority: true // Nouveau: priorité marketing
            }
        };
    }

    checkSettingsUpdate() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 3000) return; // Plus fréquent
        
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

    updateUIWithNewSettings() {
        // Mettre à jour sélection durée
        const durationOptions = document.querySelectorAll('.duration-option');
        durationOptions.forEach(option => {
            option.classList.remove('selected');
            if (parseInt(option.dataset.days) === this.selectedDays) {
                option.classList.add('selected');
            }
        });
        
        // Mettre à jour affichage catégories
        this.updatePreselectedCategoriesDisplay();
        
        // Mettre à jour infos provider
        this.updateProviderInfo();
    }

    updatePreselectedCategoriesDisplay() {
        const display = document.getElementById('preselected-categories-display');
        if (!display) return;
        
        if (this.taskPreselectedCategories.length === 0) {
            display.innerHTML = `
                <div class="preselected-info no-selection">
                    <i class="fas fa-info-circle"></i>
                    <span>Aucune catégorie pré-sélectionnée pour la création de tâches</span>
                </div>
            `;
        } else {
            const categoryDetails = this.taskPreselectedCategories.map(catId => {
                const category = window.categoryManager?.getCategory(catId);
                return category ? { 
                    id: catId,
                    icon: category.icon, 
                    name: category.name, 
                    color: category.color,
                    isMarketing: catId === 'marketing_news'
                } : null;
            }).filter(Boolean);
            
            // Compter les emails marketing potentiels
            const hasMarketing = categoryDetails.some(cat => cat.isMarketing);
            const marketingNote = hasMarketing ? 
                '<div class="marketing-note">📰 Détection marketing prioritaire activée</div>' : '';
            
            display.innerHTML = `
                <div class="preselected-info">
                    <i class="fas fa-star"></i>
                    <span>Emails pré-sélectionnés pour tâches:</span>
                </div>
                <div class="preselected-categories-grid">
                    ${categoryDetails.map(cat => `
                        <div class="preselected-category-badge ${cat.isMarketing ? 'marketing-priority' : ''}" 
                             style="background: ${cat.color}20; border-color: ${cat.color};">
                            <span class="category-icon">${cat.icon}</span>
                            <span class="category-name">${cat.name}</span>
                            ${cat.isMarketing ? '<span class="priority-star">🔥</span>' : ''}
                        </div>
                    `).join('')}
                </div>
                ${marketingNote}
            `;
        }
    }

    updateProviderInfo() {
        const providerInfo = this.getProviderInfo();
        const providerDisplay = document.getElementById('provider-info-display');
        
        if (providerDisplay) {
            const priorityBadge = providerInfo.priority === 'high' ? 
                '<span class="priority-badge">🚀 Optimisé</span>' : '';
            
            providerDisplay.innerHTML = `
                <div class="provider-info" style="color: ${providerInfo.color};">
                    <i class="${providerInfo.icon}"></i>
                    <span>Connecté à ${providerInfo.name}</span>
                    ${priorityBadge}
                </div>
            `;
        }
    }

    addMinimalStyles() {
        if (this.stylesAdded || document.getElementById('minimal-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'minimal-scan-styles';
        styles.textContent = `
            /* Scanner v11.0 - Marketing detection enhanced */
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

            /* Info provider avec priorité */
            #provider-info-display { margin: 15px 0; }
            
            .provider-info {
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                padding: 10px 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 500;
                position: relative;
            }
            
            .priority-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 8px;
                font-weight: 700;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(255, 107, 107, 0.4);
            }
            
            /* Affichage catégories avec focus marketing */
            #preselected-categories-display { margin: 20px 0; }
            
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
            
            .preselected-categories-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
                margin-bottom: 12px;
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
                position: relative;
            }
            
            .preselected-category-badge.marketing-priority {
                border-width: 3px;
                background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(238, 90, 36, 0.1));
                border-color: #ff6b6b;
                animation: marketingPulse 2s infinite;
            }
            
            @keyframes marketingPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .priority-star {
                position: absolute;
                top: -6px;
                right: -6px;
                font-size: 12px;
            }
            
            .marketing-note {
                background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(238, 90, 36, 0.1));
                border: 1px solid #ff6b6b;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 12px;
                color: #ff6b6b;
                font-weight: 600;
                text-align: center;
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
            .duration-section { margin-bottom: 35px; }
            
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
            
            /* Bouton de scan avec détection marketing */
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
            
            .scan-button-minimal.marketing-enhanced {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
                animation: marketingEnhanced 3s infinite;
            }
            
            @keyframes marketingEnhanced {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            .scan-button-minimal:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button-minimal.marketing-enhanced:hover:not(:disabled) {
                box-shadow: 0 10px 30px rgba(255, 107, 107, 0.5);
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
            
            /* Badge de résultat avec marketing */
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
            
            .success-badge.marketing {
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                animation: marketingBadge 2s infinite;
            }
            
            @keyframes marketingBadge {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(5deg); }
            }
            
            /* Section de progression */
            .progress-section-minimal {
                opacity: 0;
                transition: opacity 0.3s ease;
                margin-top: 20px;
            }
            
            .progress-section-minimal.visible { opacity: 1; }
            
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
            
            .progress-fill.marketing-mode {
                background: linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%);
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
            
            /* Info badge avec marketing */
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
            
            .scan-info.marketing-enhanced {
                background: rgba(255, 107, 107, 0.1);
                color: #ff6b6b;
                border: 1px solid rgba(255, 107, 107, 0.2);
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
            
            .scan-info.marketing-enhanced .scan-info-details {
                color: #ee5a24;
            }
            
            /* Responsive */
            @media (max-width: 480px) {
                .scanner-card-minimal { padding: 35px 25px; }
                .scanner-title { font-size: 28px; }
                .scanner-subtitle { font-size: 16px; }
                .preselected-categories-grid { gap: 6px; }
                .preselected-category-badge { font-size: 12px; padding: 6px 10px; }
                .duration-option { padding: 10px 16px; font-size: 13px; min-width: 75px; }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[MinimalScan] ✅ Styles v11.0 ajoutés - Marketing detection enhanced');
    }

    async render(container) {
        console.log('[MinimalScan] 🎯 Rendu scanner v11.0 avec détection marketing...');
        
        try {
            this.addMinimalStyles();
            this.checkSettingsUpdate();
            
            const provider = this.detectProvider();
            if (!provider) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            await this.checkServices();
            
            container.innerHTML = this.renderMinimalScanner();
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log(`[MinimalScan] ✅ Scanner v11.0 rendu avec succès (${provider})`);
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderMinimalScanner() {
        const providerInfo = this.getProviderInfo();
        const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
        const scannerClass = hasMarketing ? 'marketing-enhanced' : '';
        
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner Email ${hasMarketing ? '📰' : 'Unifié'}</h1>
                    <p class="scanner-subtitle">
                        ${hasMarketing ? 
                            'Organisez vos emails avec détection marketing prioritaire - IA optimisée' :
                            'Organisez vos emails automatiquement avec IA - Compatible Outlook & Gmail'
                        }
                    </p>
                    
                    <div id="provider-info-display">
                        <div class="provider-info" style="color: ${providerInfo.color};">
                            <i class="${providerInfo.icon}"></i>
                            <span>Connecté à ${providerInfo.name}</span>
                            ${providerInfo.priority === 'high' ? '<span class="priority-badge">🚀 Optimisé</span>' : ''}
                        </div>
                    </div>
                    
                    <div id="preselected-categories-display">
                        ${this.renderPreselectedCategories()}
                    </div>
                    
                    <div class="steps-container">
                        <div class="step active" id="step1">
                            <div class="step-number">1</div>
                            <div class="step-label">${hasMarketing ? 'Config' : 'Sélection'}</div>
                        </div>
                        <div class="step" id="step2">
                            <div class="step-number">2</div>
                            <div class="step-label">${hasMarketing ? 'Scan 📰' : 'Analyse'}</div>
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
                    
                    <button class="scan-button-minimal ${scannerClass}" id="minimalScanBtn" onclick="window.minimalScanModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>${hasMarketing ? 'Analyser avec détection marketing' : 'Démarrer l\'analyse intelligente'}</span>
                    </button>
                    
                    <div class="progress-section-minimal" id="progressSection">
                        <div class="progress-bar-minimal">
                            <div class="progress-fill ${hasMarketing ? 'marketing-mode' : ''}" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus">Préparation du scan ${hasMarketing ? 'marketing' : 'unifié'}</div>
                    </div>
                    
                    <div class="scan-info ${scannerClass}">
                        <div class="scan-info-main">
                            <i class="fas fa-shield-alt"></i>
                            <span>Scan sécurisé et privé${hasMarketing ? ' - Marketing Priority' : ''} - Compatible Outlook & Gmail</span>
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
            return category ? { 
                id: catId,
                icon: category.icon, 
                name: category.name, 
                color: category.color,
                isMarketing: catId === 'marketing_news'
            } : null;
        }).filter(Boolean);
        
        const hasMarketing = categoryDetails.some(cat => cat.isMarketing);
        const marketingNote = hasMarketing ? 
            '<div class="marketing-note">📰 Détection marketing prioritaire activée</div>' : '';
        
        return `
            <div class="preselected-info">
                <i class="fas fa-star"></i>
                <span>Emails pré-sélectionnés pour tâches:</span>
            </div>
            <div class="preselected-categories-grid">
                ${categoryDetails.map(cat => `
                    <div class="preselected-category-badge ${cat.isMarketing ? 'marketing-priority' : ''}" 
                         style="background: ${cat.color}20; border-color: ${cat.color};">
                        <span class="category-icon">${cat.icon}</span>
                        <span class="category-name">${cat.name}</span>
                        ${cat.isMarketing ? '<span class="priority-star">🔥</span>' : ''}
                    </div>
                `).join('')}
            </div>
            ${marketingNote}
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
                        onclick="window.minimalScanModule.selectDuration(${option.value})" 
                        data-days="${option.value}">
                    ${option.label}
                </button>
            `;
        }).join('');
    }

    renderScanInfoDetails() {
        let details = [];
        
        const providerInfo = this.getProviderInfo();
        if (providerInfo.name !== 'Non connecté') {
            details.push(`Provider: ${providerInfo.name}`);
        }
        
        if (this.taskPreselectedCategories.includes('marketing_news')) {
            details.push('🔥 Détection marketing prioritaire');
        }
        
        if (this.taskPreselectedCategories.length > 0) {
            details.push(`${this.taskPreselectedCategories.length} catégorie(s) pour tâches automatiques`);
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

    renderNotAuthenticated() {
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h1 class="scanner-title">Connexion requise</h1>
                    <p class="scanner-subtitle">Connectez-vous à Gmail ou Outlook pour analyser vos emails</p>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; margin: 30px 0;">
                        <button class="scan-button-minimal" style="width: auto; padding: 0 25px; background: linear-gradient(135deg, #ea4335 0%, #db4437 100%);" onclick="window.googleAuthService?.login()">
                            <i class="fab fa-google"></i>
                            <span>Google Gmail</span>
                        </button>
                        
                        <button class="scan-button-minimal" style="width: auto; padding: 0 25px;" onclick="window.authService?.login()">
                            <i class="fab fa-microsoft"></i>
                            <span>Microsoft Outlook</span>
                        </button>
                    </div>
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
        const provider = this.detectProvider();
        if (!provider) {
            throw new Error('Aucun service d\'authentification disponible');
        }
        
        // Vérifier MailService
        if (!window.mailService) {
            console.warn('[MinimalScan] ⚠️ MailService non disponible');
            throw new Error('MailService requis pour le scan');
        }
        
        // Vérifier CategoryManager avec priorité marketing
        if (!window.categoryManager) {
            console.warn('[MinimalScan] ⚠️ CategoryManager non disponible, tentative d\'initialisation...');
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (!window.categoryManager && window.CategoryManager) {
                console.log('[MinimalScan] 🔧 Création CategoryManager...');
                try {
                    window.categoryManager = new window.CategoryManager();
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (error) {
                    console.error('[MinimalScan] Erreur création CategoryManager:', error);
                }
            }
            
            if (!window.categoryManager) {
                console.error('[MinimalScan] ❌ CategoryManager toujours non disponible');
                throw new Error('CategoryManager requis pour la catégorisation - Rechargez la page');
            }
        }
        
        // Vérifier que la détection marketing est disponible
        if (this.taskPreselectedCategories.includes('marketing_news')) {
            const marketingCategory = window.categoryManager.getCategory('marketing_news');
            if (!marketingCategory) {
                console.warn('[MinimalScan] ⚠️ Catégorie marketing non trouvée');
            } else {
                console.log('[MinimalScan] 📰 Détection marketing validée');
            }
        }
        
        console.log(`[MinimalScan] ✅ Services vérifiés (${provider})`);
    }

    initializeEvents() {
        console.log('[MinimalScan] ✅ Événements initialisés');
        
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
        }
        
        this.settingsCheckInterval = setInterval(() => {
            this.checkSettingsUpdate();
        }, 5000); // Plus fréquent pour réactivité
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
        
        console.log(`[MinimalScan] ✅ Durée sélectionnée: ${days} jours`);
    }

    async startScan() {
        if (this.scanInProgress) {
            console.log('[MinimalScan] Scan déjà en cours');
            return;
        }
        
        const provider = this.detectProvider();
        const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
        
        console.log(`[MinimalScan] 🚀 Démarrage scan ${hasMarketing ? 'avec détection marketing' : 'unifié'} (${provider})`);
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
                scanBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i> 
                    <span>Analyse en cours${hasMarketing ? ' 📰' : ''} (${provider})...</span>
                `;
            }
            
            const scanOptions = this.prepareScanOptions();
            await this.executeScan(scanOptions);
            
            this.setActiveStep(3);
            this.completeScan();
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur scan:', error);
            this.showScanError(error);
        }
    }

    prepareScanOptions() {
        const provider = this.detectProvider();
        const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
        
        const baseOptions = {
            days: this.selectedDays,
            folder: this.settings.scanSettings?.defaultFolder || 'inbox',
            autoAnalyze: this.settings.scanSettings?.autoAnalyze !== false,
            autoCategrize: this.settings.scanSettings?.autoCategrize !== false,
            includeSpam: !this.settings.preferences?.excludeSpam,
            detectCC: this.settings.preferences?.detectCC !== false,
            provider: provider,
            marketingPriority: hasMarketing, // NOUVEAU: indiquer la priorité marketing
            onProgress: (progress) => this.updateProgress(
                progress.progress?.current || 0, 
                progress.message || '', 
                progress.phase || ''
            )
        };
        
        if (this.taskPreselectedCategories.length > 0) {
            baseOptions.taskPreselectedCategories = [...this.taskPreselectedCategories];
        }
        
        console.log(`[MinimalScan] 📊 Options scan ${hasMarketing ? 'marketing' : 'unifié'} (${provider}):`, baseOptions);
        return baseOptions;
    }

    async executeScan(scanOptions) {
        try {
            if (window.emailScanner && typeof window.emailScanner.scan === 'function') {
                const scanType = scanOptions.marketingPriority ? 'marketing prioritaire' : 'unifié';
                console.log(`[MinimalScan] 🔄 Scan réel ${scanType} en cours (${scanOptions.provider})...`);
                
                const results = await window.emailScanner.scan(scanOptions);
                this.scanResults = results;
                
                console.log(`[MinimalScan] ✅ Scan ${scanType} terminé (${scanOptions.provider}):`, results);
                
                if (results.stats?.preselectedForTasks > 0) {
                    console.log(`[MinimalScan] ⭐ ${results.stats.preselectedForTasks} emails pré-sélectionnés pour tâches`);
                }
                
                if (results.stats?.marketingDetected > 0) {
                    console.log(`[MinimalScan] 📰 ${results.stats.marketingDetected} emails marketing détectés`);
                }
                
            } else {
                console.log(`[MinimalScan] 🎭 Mode simulation ${scanOptions.marketingPriority ? 'marketing' : 'unifié'} (${scanOptions.provider})`);
                
                // Simulation adaptée au provider et marketing
                const simulationSteps = scanOptions.marketingPriority ? 
                    ['Connexion Gmail...', 'Détection newsletters...', 'Classification marketing...', 'Analyse finale...'] :
                    ['Connexion...', 'Récupération...', 'Classification...', 'Finalisation...'];
                
                for (let i = 0; i <= 100; i += 25) {
                    const stepIndex = Math.floor(i / 25);
                    const message = simulationSteps[stepIndex] || `Analyse ${i}% (${scanOptions.provider})`;
                    
                    this.updateProgress(i, message, `Simulation ${scanOptions.provider} en cours`);
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                
                this.scanResults = {
                    success: true,
                    total: 180,
                    categorized: 165,
                    provider: scanOptions.provider,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    stats: { 
                        preselectedForTasks: this.taskPreselectedCategories.length > 0 ? 32 : 0,
                        taskSuggestions: 28,
                        marketingDetected: scanOptions.marketingPriority ? 85 : 45
                    },
                    marketingPriority: scanOptions.marketingPriority
                };
            }
        } catch (error) {
            console.error(`[MinimalScan] ❌ Erreur scan (${scanOptions.provider}):`, error);
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
        const provider = this.detectProvider();
        const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
        
        setTimeout(() => {
            const scanBtn = document.getElementById('minimalScanBtn');
            if (scanBtn) {
                const preselectedCount = this.scanResults?.stats?.preselectedForTasks || 0;
                const marketingCount = this.scanResults?.stats?.marketingDetected || 0;
                
                let buttonText = `Scan ${provider} terminé !`;
                let badgeContent = '';
                
                if (hasMarketing && marketingCount > 0) {
                    buttonText = `📰 Scan marketing terminé !`;
                    badgeContent = `📰 ${marketingCount} newsletters`;
                } else if (preselectedCount > 0) {
                    badgeContent = `⭐ ${preselectedCount} emails pour tâches`;
                }
                
                scanBtn.innerHTML = `<i class="fas fa-check"></i> <span>${buttonText}</span>`;
                scanBtn.style.background = hasMarketing ? 
                    'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                    'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                
                if (badgeContent) {
                    scanBtn.style.position = 'relative';
                    const badgeClass = hasMarketing && marketingCount > 0 ? 'success-badge marketing' : 'success-badge';
                    scanBtn.insertAdjacentHTML('beforeend', `
                        <span class="${badgeClass}">
                            ${badgeContent}
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
        const provider = this.detectProvider();
        const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
        
        const essentialResults = {
            success: true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            provider: provider,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            marketingDetected: this.scanResults?.stats?.marketingDetected || 0,
            marketingPriority: hasMarketing,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            timestamp: Date.now()
        };
        
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
        } catch (error) {
            console.warn('[MinimalScan] Erreur stockage:', error);
        }
        
        if (window.uiManager?.showToast) {
            let message = `✅ ${essentialResults.total} emails analysés (${provider})`;
            
            if (hasMarketing && essentialResults.marketingDetected > 0) {
                message += ` • 📰 ${essentialResults.marketingDetected} newsletters détectées`;
            }
            
            if (essentialResults.preselectedForTasks > 0) {
                message += ` • ⭐ ${essentialResults.preselectedForTasks} pré-sélectionnés`;
            }
            
            window.uiManager.showToast(message, 'success', 5000);
        }
        
        setTimeout(() => {
            if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                window.pageManager.loadPage('emails');
            }
        }, 500);
    }

    showScanError(error) {
        const provider = this.detectProvider();
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">Erreur scan ${provider}</div>
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
            const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
            
            scanBtn.disabled = false;
            scanBtn.innerHTML = hasMarketing ? 
                '<i class="fas fa-play"></i> <span>Analyser avec détection marketing</span>' :
                '<i class="fas fa-play"></i> <span>Démarrer l\'analyse intelligente</span>';
            
            scanBtn.style.background = hasMarketing ?
                'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' :
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            
            scanBtn.className = hasMarketing ? 
                'scan-button-minimal marketing-enhanced' :
                'scan-button-minimal';
            
            const badge = scanBtn.querySelector('.success-badge');
            if (badge) badge.remove();
        }
        
        this.updateProgress(0, 'Initialisation...', 'Préparation du scan unifié');
        
        this.loadSettingsFromCategoryManager();
        this.updatePreselectedCategoriesDisplay();
        this.updateProviderInfo();
        
        console.log('[MinimalScan] 🔄 Scanner unifié réinitialisé');
    }

    updateSettings(newSettings) {
        console.log('[MinimalScan] 📝 Mise à jour paramètres:', newSettings);
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
        const provider = this.detectProvider();
        const providerInfo = this.getProviderInfo();
        const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
        
        return {
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            currentProvider: provider,
            providerInfo: providerInfo,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            marketingDetection: hasMarketing,
            settings: this.settings,
            lastSettingsSync: this.lastSettingsSync,
            scanResults: this.scanResults,
            version: '11.0',
            marketingEnhanced: true
        };
    }

    cleanup() {
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
            this.settingsCheckInterval = null;
        }
        
        this.scanInProgress = false;
        this.isInitialized = false;
        
        console.log('[MinimalScan] 🧹 Nettoyage marketing enhanced terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.currentProvider = null;
        console.log('[MinimalScan] Instance marketing enhanced détruite');
    }
}

// Créer l'instance globale avec vérification robuste
if (window.minimalScanModule) {
    try {
        window.minimalScanModule.destroy?.();
    } catch (e) {
        console.warn('[MinimalScan] Erreur nettoyage:', e);
    }
}

// Export de la classe
window.MinimalScanModule = MinimalScanModule;

try {
    window.minimalScanModule = new MinimalScanModule();
    window.scanStartModule = window.minimalScanModule;
    console.log('[StartScan] ✅ Scanner v11.0 créé avec succès - Marketing detection enhanced');
} catch (error) {
    console.error('[StartScan] ❌ Erreur création instance:', error);
    
    // Instance de secours
    window.minimalScanModule = {
        isInitialized: false,
        scanInProgress: false,
        currentProvider: null,
        
        detectProvider: function() {
            if (window.googleAuthService?.isAuthenticated()) return 'google';
            if (window.authService?.isAuthenticated()) return 'microsoft';
            return null;
        },
        
        render: async function(container) {
            container.innerHTML = `
                <div class="minimal-scanner">
                    <div class="scanner-card-minimal">
                        <div class="scanner-icon" style="background: #ef4444;">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1 class="scanner-title">Erreur d'initialisation</h1>
                        <p class="scanner-subtitle">Le scanner marketing n'a pas pu s'initialiser correctement</p>
                        <button class="scan-button-minimal" onclick="window.location.reload()">
                            <i class="fas fa-redo"></i>
                            <span>Recharger la page</span>
                        </button>
                        <div style="margin-top: 20px; font-size: 12px; color: #666;">
                            Erreur: ${error.message}
                        </div>
                    </div>
                </div>
            `;
        },
        
        getDebugInfo: function() {
            return {
                error: 'Scanner de secours créé suite à: ' + error.message,
                isInitialized: false,
                available: false,
                marketingEnhanced: false
            };
        },
        
        error: 'Scanner de secours - Rechargez la page: ' + error.message
    };
    
    window.scanStartModule = window.minimalScanModule;
    console.log('[StartScan] 🔧 Instance de secours créée');
}

console.log('[StartScan] ✅ Scanner v11.0 chargé - Marketing detection enhanced!');
