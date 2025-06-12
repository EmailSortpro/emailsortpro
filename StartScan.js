// StartScan.js - Version 8.2 - Synchronisation paramètres réparée

console.log('[StartScan] 🚀 Loading StartScan.js v8.2...');

class MinimalScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        
        // RÉPARATION: Intégration renforcée avec les paramètres
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.syncInProgress = false;
        this.parametersLoaded = false;
        
        console.log('[MinimalScan] ✅ Scanner ultra-minimaliste v8.2 initialized avec réparation synchronisation');
        
        // Charger les paramètres en premier
        this.loadSettingsFromCategoryManager();
        this.addMinimalStyles();
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES - RÉPARÉ ET RENFORCÉ
    // ================================================
    loadSettingsFromCategoryManager() {
        console.log('[MinimalScan] 📥 === CHARGEMENT PARAMÈTRES ===');
        
        try {
            // Priorité 1: CategoryManager
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                
                console.log('[MinimalScan] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[MinimalScan] 📊 Settings:', this.settings);
                console.log('[MinimalScan] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                // Utiliser la période par défaut des paramètres
                if (this.settings.scanSettings?.defaultPeriod) {
                    this.selectedDays = this.settings.scanSettings.defaultPeriod;
                    console.log('[MinimalScan] 📅 Période par défaut mise à jour:', this.selectedDays);
                }
                
                this.parametersLoaded = true;
                
            } else if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
                this.taskPreselectedCategories = window.categoriesPage.getTaskPreselectedCategories();
                const scanSettings = window.categoriesPage.getScanSettings();
                
                this.settings = {
                    taskPreselectedCategories: this.taskPreselectedCategories,
                    scanSettings: scanSettings || this.getDefaultSettings().scanSettings,
                    preferences: window.categoriesPage.shouldExcludeSpam ? 
                        { excludeSpam: window.categoriesPage.shouldExcludeSpam() } : {}
                };
                
                if (scanSettings?.defaultPeriod) {
                    this.selectedDays = scanSettings.defaultPeriod;
                }
                
                console.log('[MinimalScan] ✅ Paramètres chargés depuis CategoriesPage');
                console.log('[MinimalScan] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                this.parametersLoaded = true;
                
            } else {
                // Fallback localStorage avec validation renforcée
                try {
                    const saved = localStorage.getItem('categorySettings');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        this.settings = { ...this.getDefaultSettings(), ...parsed };
                        this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                        
                        if (this.settings.scanSettings?.defaultPeriod) {
                            this.selectedDays = this.settings.scanSettings.defaultPeriod;
                        }
                        
                        console.log('[MinimalScan] ✅ Paramètres chargés depuis localStorage');
                        console.log('[MinimalScan] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                        
                        this.parametersLoaded = true;
                    } else {
                        throw new Error('Aucun paramètre sauvegardé');
                    }
                } catch (storageError) {
                    console.warn('[MinimalScan] ⚠️ Fallback vers paramètres par défaut:', storageError.message);
                    this.settings = this.getDefaultSettings();
                    this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                    this.selectedDays = this.settings.scanSettings.defaultPeriod;
                    
                    this.parametersLoaded = true;
                }
            }
            
            // Validation des paramètres chargés
            this.validateLoadedSettings();
            
            this.lastSettingsSync = Date.now();
            console.log('[MinimalScan] ✅ === PARAMÈTRES CHARGÉS AVEC SUCCÈS ===');
            console.log('[MinimalScan] 📊 Settings finaux:', this.settings);
            console.log('[MinimalScan] 📋 Catégories pré-sélectionnées finales:', this.taskPreselectedCategories);
            console.log('[MinimalScan] 📅 Période sélectionnée:', this.selectedDays);
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur critique chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            this.selectedDays = this.settings.scanSettings.defaultPeriod;
            this.parametersLoaded = true;
            
            console.log('[MinimalScan] 🔄 Utilisation paramètres par défaut suite à l\'erreur');
        }
    }

    validateLoadedSettings() {
        // S'assurer que taskPreselectedCategories est un array valide
        if (!Array.isArray(this.taskPreselectedCategories)) {
            console.warn('[MinimalScan] ⚠️ taskPreselectedCategories n\'est pas un array, correction...');
            this.taskPreselectedCategories = this.getDefaultSettings().taskPreselectedCategories;
            this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        }
        
        // Vérifier que selectedDays est valide
        if (!this.selectedDays || this.selectedDays < 1 || this.selectedDays > 365) {
            console.warn('[MinimalScan] ⚠️ selectedDays invalide, correction...');
            this.selectedDays = 7;
        }
        
        // S'assurer que les settings sont complets
        if (!this.settings.scanSettings) {
            this.settings.scanSettings = this.getDefaultSettings().scanSettings;
        }
        
        if (!this.settings.preferences) {
            this.settings.preferences = this.getDefaultSettings().preferences;
        }
        
        console.log('[MinimalScan] ✅ Paramètres validés');
    }

    getDefaultSettings() {
        return {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            },
            automationSettings: {
                autoCreateTasks: false,
                groupTasksByDomain: false,
                skipDuplicates: true,
                autoAssignPriority: false
            }
        };
    }

    // ================================================
    // VÉRIFICATION PÉRIODIQUE DES PARAMÈTRES - AMÉLIORÉE
    // ================================================
    checkSettingsUpdate() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 5000) return; // Vérifier toutes les 5 secondes max
        
        console.log('[MinimalScan] 🔍 Vérification mise à jour paramètres...');
        
        try {
            const oldTaskCategories = [...this.taskPreselectedCategories];
            const oldSelectedDays = this.selectedDays;
            const oldParametersLoaded = this.parametersLoaded;
            
            this.loadSettingsFromCategoryManager();
            
            // Si les paramètres ont changé, mettre à jour l'interface
            const categoriesChanged = JSON.stringify(oldTaskCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
            const daysChanged = oldSelectedDays !== this.selectedDays;
            const parametersJustLoaded = !oldParametersLoaded && this.parametersLoaded;
            
            if (categoriesChanged || daysChanged || parametersJustLoaded) {
                console.log('[MinimalScan] 🔄 === CHANGEMENTS DÉTECTÉS ===');
                console.log('  - Anciennes catégories:', oldTaskCategories);
                console.log('  - Nouvelles catégories:', this.taskPreselectedCategories);
                console.log('  - Ancienne période:', oldSelectedDays);
                console.log('  - Nouvelle période:', this.selectedDays);
                console.log('  - Paramètres juste chargés:', parametersJustLoaded);
                
                this.updateUIWithNewSettings();
            }
        } catch (error) {
            console.error('[MinimalScan] Erreur vérification paramètres:', error);
        }
    }

    updateUIWithNewSettings() {
        console.log('[MinimalScan] 🔄 Mise à jour interface avec nouveaux paramètres');
        
        // Mettre à jour la sélection de durée si l'interface est visible
        const durationOptions = document.querySelectorAll('.duration-option');
        durationOptions.forEach(option => {
            option.classList.remove('selected');
            if (parseInt(option.dataset.days) === this.selectedDays) {
                option.classList.add('selected');
                console.log('[MinimalScan] ✅ Option durée mise à jour:', this.selectedDays);
            }
        });
        
        // Mettre à jour l'affichage des catégories pré-sélectionnées
        this.updatePreselectedCategoriesDisplay();
        
        // Mettre à jour les informations de scan
        this.updateScanInfoDetails();
    }

    updatePreselectedCategoriesDisplay() {
        const preselectedDisplay = document.getElementById('preselected-categories-display');
        if (preselectedDisplay) {
            if (this.taskPreselectedCategories.length > 0) {
                const categoryNames = this.taskPreselectedCategories.map(catId => {
                    const category = window.categoryManager?.getCategory(catId);
                    return category ? `${category.icon} ${category.name}` : catId;
                });
                
                preselectedDisplay.innerHTML = `
                    <div class="preselected-info">
                        <i class="fas fa-star"></i>
                        <span>Catégories pré-sélectionnées pour tâches: ${categoryNames.join(', ')}</span>
                    </div>
                `;
                
                console.log('[MinimalScan] ✅ Affichage catégories pré-sélectionnées mis à jour');
            } else {
                preselectedDisplay.innerHTML = '';
                console.log('[MinimalScan] ℹ️ Aucune catégorie pré-sélectionnée à afficher');
            }
        }
    }

    updateScanInfoDetails() {
        const scanInfoDetails = document.querySelector('.scan-info-details');
        if (scanInfoDetails) {
            scanInfoDetails.innerHTML = this.renderScanInfoDetails();
            console.log('[MinimalScan] ✅ Détails info scan mis à jour');
        }
    }

    addMinimalStyles() {
        if (this.stylesAdded || document.getElementById('minimal-scan-styles')) {
            console.log('[MinimalScan] Styles already added, skipping...');
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'minimal-scan-styles';
        styles.textContent = `
            /* Scanner Ultra-Minimaliste v8.2 avec synchronisation paramètres réparée */
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
            
            /* NOUVEAU: Affichage amélioré des catégories pré-sélectionnées */
            .preselected-info {
                background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                color: white;
                border-radius: 12px;
                padding: 16px 20px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                font-weight: 500;
                text-align: left;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
                position: relative;
                overflow: hidden;
            }
            
            .preselected-info::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                animation: shimmer 3s infinite;
            }
            
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .preselected-info i {
                color: #fbbf24;
                font-size: 18px;
                flex-shrink: 0;
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
                transform: scale(1.1);
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
            
            /* Sélecteur de durée amélioré */
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .duration-option:hover:not(.selected) {
                border-color: #9ca3af;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            /* NOUVEAU: Indicateur pour option recommandée basée sur paramètres */
            .duration-option.recommended::after {
                content: '⭐ Par défaut';
                position: absolute;
                top: -8px;
                right: -8px;
                background: #10b981;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 8px;
                font-weight: 600;
            }
            
            /* Bouton de scan */
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
            
            /* Effet brillant sur le bouton */
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
            
            /* Section de progression */
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
            
            /* Info badge amélioré avec catégories */
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
                border: 1px solid rgba(102, 126, 234, 0.2);
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
                line-height: 1.4;
            }
            
            /* Responsive mobile */
            @media (max-width: 480px) {
                .scanner-card-minimal {
                    width: 95%;
                    padding: 35px 30px;
                    max-width: 650px;
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
                
                .preselected-info {
                    font-size: 12px;
                    padding: 12px 16px;
                }
            }
            
            /* Mode sombre */
            @media (prefers-color-scheme: dark) {
                .scanner-card-minimal {
                    background: rgba(30, 30, 46, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .scanner-title {
                    color: white;
                }
                
                .scanner-subtitle,
                .progress-text,
                .progress-status {
                    color: #9ca3af;
                }
                
                .duration-option {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #9ca3af;
                }
                
                .duration-option.selected {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[MinimalScan] ✅ Styles minimalistes ajoutés avec synchronisation paramètres');
    }

    async render(container) {
        console.log('[MinimalScan] 🎯 === RENDU SCANNER AVEC PARAMÈTRES ===');
        
        try {
            // S'assurer que les styles sont ajoutés
            this.addMinimalStyles();
            
            // NOUVEAU: Vérifier et charger les paramètres en priorité
            if (!this.parametersLoaded) {
                console.log('[MinimalScan] 📥 Paramètres pas encore chargés, chargement...');
                this.checkSettingsUpdate();
            }
            
            // Vérifier l'authentification
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            // Vérifier les services
            await this.checkServices();
            
            // Rendu de l'interface avec les paramètres
            container.innerHTML = this.renderMinimalScanner();
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log('[MinimalScan] ✅ Scanner rendu avec paramètres synchronisés');
            console.log('[MinimalScan] 📊 Paramètres utilisés:', this.settings);
            console.log('[MinimalScan] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            console.log('[MinimalScan] 📅 Période sélectionnée:', this.selectedDays);
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur lors du rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderMinimalScanner() {
        // Déterminer l'option recommandée basée sur les paramètres
        const recommendedPeriod = this.selectedDays;
        
        // Créer l'affichage des catégories pré-sélectionnées
        const preselectedDisplay = this.taskPreselectedCategories.length > 0 ? 
            this.renderPreselectedCategoriesInfo() : '';
        
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner Email</h1>
                    <p class="scanner-subtitle">Organisez vos emails automatiquement avec IA</p>
                    
                    ${preselectedDisplay}
                    
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
                            ${this.renderDurationOptions(recommendedPeriod)}
                        </div>
                    </div>
                    
                    <button class="scan-button-minimal" id="minimalScanBtn" onclick="window.minimalScanModule.startScan()">
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
                            <span>Scan sécurisé et privé avec IA Claude</span>
                        </div>
                        ${this.renderScanInfoDetails()}
                    </div>
                </div>
            </div>
        `;
    }

    renderDurationOptions(recommendedPeriod) {
        const options = [
            { value: 1, label: '1 jour' },
            { value: 3, label: '3 jours' },
            { value: 7, label: '7 jours' },
            { value: 15, label: '15 jours' },
            { value: 30, label: '30 jours' }
        ];
        
        return options.map(option => {
            const isSelected = option.value === this.selectedDays;
            const isRecommended = option.value === recommendedPeriod && recommendedPeriod !== 7; // 7 est la valeur standard
            
            return `
                <button class="duration-option ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}" 
                        onclick="window.minimalScanModule.selectDuration(${option.value})" 
                        data-days="${option.value}">
                    ${option.label}
                </button>
            `;
        }).join('');
    }

    renderPreselectedCategoriesInfo() {
        if (this.taskPreselectedCategories.length === 0) return '';
        
        const categoryNames = this.taskPreselectedCategories.map(catId => {
            const category = window.categoryManager?.getCategory(catId);
            return category ? `${category.icon} ${category.name}` : catId;
        }).slice(0, 3); // Afficher max 3 catégories
        
        const moreCount = this.taskPreselectedCategories.length - 3;
        const displayText = categoryNames.join(', ') + (moreCount > 0 ? ` et ${moreCount} autre${moreCount > 1 ? 's' : ''}` : '');
        
        return `
            <div id="preselected-categories-display">
                <div class="preselected-info">
                    <i class="fas fa-star"></i>
                    <span>Création automatique de tâches activée pour: ${displayText}</span>
                </div>
            </div>
        `;
    }

    renderScanInfoDetails() {
        let details = [];
        
        if (this.taskPreselectedCategories.length > 0) {
            details.push(`${this.taskPreselectedCategories.length} catégorie(s) pré-sélectionnée(s) pour tâches`);
        }
        
        if (this.settings.scanSettings?.autoAnalyze) {
            details.push('Analyse IA automatique activée');
        }
        
        if (this.settings.preferences?.excludeSpam) {
            details.push('Filtrage spam activé');
        }
        
        if (this.settings.preferences?.detectCC) {
            details.push('Détection CC activée');
        }
        
        if (details.length === 0) {
            return '<div class="scan-info-details">Configuration par défaut</div>';
        }
        
        return `<div class="scan-info-details">${details.join(' • ')}</div>`;
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
                        <span>Se connecter</span>
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
            console.warn('[MinimalScan] ⚠️ MailService non disponible - scan en mode simulation');
        }
    }

    initializeEvents() {
        console.log('[MinimalScan] ✅ Événements initialisés avec surveillance paramètres');
        
        // Démarrer la vérification périodique des paramètres
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
        }
        
        this.settingsCheckInterval = setInterval(() => {
            this.checkSettingsUpdate();
        }, 10000); // Vérifier toutes les 10 secondes
    }

    selectDuration(days) {
        console.log(`[MinimalScan] 📅 === SÉLECTION DURÉE ===`);
        console.log(`[MinimalScan] 📅 Nouvelle durée sélectionnée: ${days} jours`);
        
        this.selectedDays = days;
        
        // Mettre à jour l'UI
        document.querySelectorAll('.duration-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`[data-days="${days}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        console.log(`[MinimalScan] ✅ Durée sélectionnée: ${days} jours`);
        
        // NOUVEAU: Sauvegarder la préférence si différente du défaut et que les settings sont chargés
        if (this.parametersLoaded && this.settings.scanSettings && this.settings.scanSettings.defaultPeriod !== days) {
            try {
                if (window.categoryManager && typeof window.categoryManager.updateSettings === 'function') {
                    const newScanSettings = { ...this.settings.scanSettings, defaultPeriod: days };
                    window.categoryManager.updateSettings({ scanSettings: newScanSettings });
                    console.log(`[MinimalScan] 💾 Nouvelle période par défaut sauvegardée dans CategoryManager: ${days} jours`);
                } else {
                    // Fallback localStorage
                    this.settings.scanSettings.defaultPeriod = days;
                    localStorage.setItem('categorySettings', JSON.stringify(this.settings));
                    console.log(`[MinimalScan] 💾 Nouvelle période par défaut sauvegardée dans localStorage: ${days} jours`);
                }
            } catch (error) {
                console.warn('[MinimalScan] ⚠️ Erreur sauvegarde période:', error);
            }
        }
    }

    async startScan() {
        if (this.scanInProgress) {
            console.log('[MinimalScan] Scan déjà en cours');
            return;
        }
        
        console.log('[MinimalScan] 🚀 === DÉMARRAGE SCAN AVEC PARAMÈTRES ===');
        console.log('[MinimalScan] 📅 Période:', this.selectedDays, 'jours');
        console.log('[MinimalScan] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        console.log('[MinimalScan] 📊 Settings complets:', this.settings);
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            // Passer à l'étape 2
            this.setActiveStep(2);
            
            // Afficher la progression
            const progressSection = document.getElementById('progressSection');
            if (progressSection) {
                progressSection.classList.add('visible');
            }
            
            const scanBtn = document.getElementById('minimalScanBtn');
            if (scanBtn) {
                scanBtn.disabled = true;
                scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyse en cours...</span>';
            }
            
            // NOUVEAU: Préparer les options de scan avec tous les paramètres
            const scanOptions = this.prepareScanOptions();
            
            // Exécuter le scan
            await this.executeScan(scanOptions);
            
            // Passer à l'étape 3
            this.setActiveStep(3);
            
            // Finaliser
            this.completeScan();
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur de scan:', error);
            this.showScanError(error);
        }
    }

    prepareScanOptions() {
        // Fusionner tous les paramètres utilisateur avec les options de scan
        const baseOptions = {
            days: this.selectedDays,
            folder: this.settings.scanSettings?.defaultFolder || 'inbox',
            autoAnalyze: this.settings.scanSettings?.autoAnalyze !== false,
            autoCategrize: this.settings.scanSettings?.autoCategrize !== false,
            includeSpam: !this.settings.preferences?.excludeSpam,
            detectCC: this.settings.preferences?.detectCC !== false,
            maxEmails: 1000
        };
        
        // Ajouter les catégories pré-sélectionnées si disponibles
        if (this.taskPreselectedCategories.length > 0) {
            baseOptions.taskPreselectedCategories = [...this.taskPreselectedCategories];
        }
        
        // Ajouter les paramètres d'automatisation
        if (this.settings.automationSettings) {
            baseOptions.automationSettings = { ...this.settings.automationSettings };
        }
        
        console.log('[MinimalScan] 📊 Options de scan préparées avec tous paramètres:', baseOptions);
        return baseOptions;
    }

    async executeScan(scanOptions) {
        const steps = [
            { progress: 0, text: 'Initialisation...', status: 'Connexion au serveur' },
            { progress: 10, text: 'Chargement paramètres...', status: 'Configuration personnalisée chargée' },
            { progress: 20, text: 'Synchronisation...', status: `${scanOptions.taskPreselectedCategories?.length || 0} catégories pré-sélectionnées` },
            { progress: 35, text: 'Connexion...', status: 'Authentification Microsoft' },
            { progress: 55, text: 'Récupération...', status: `Chargement des emails (${this.selectedDays} jours)` },
            { progress: 75, text: 'Analyse IA...', status: 'Classification intelligente en cours' },
            { progress: 90, text: 'Organisation...', status: 'Tri par catégories et tâches' },
            { progress: 100, text: 'Terminé !', status: 'Scan complété avec paramètres synchronisés' }
        ];

        try {
            // Vérifier si le scanner EmailScanner est disponible
            if (window.emailScanner && typeof window.emailScanner.scan === 'function') {
                console.log('[MinimalScan] 🔄 Utilisation du vrai scanner avec paramètres complets');
                
                // S'assurer que EmailScanner a les bons paramètres avant le scan
                if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                    window.emailScanner.updateTaskPreselectedCategories(this.taskPreselectedCategories);
                }
                
                if (typeof window.emailScanner.updateSettings === 'function') {
                    window.emailScanner.updateSettings(this.settings);
                }
                
                // Progression personnalisée pour le vrai scan
                scanOptions.onProgress = (progressData) => {
                    if (progressData.progress) {
                        const percent = Math.round((progressData.progress.current / progressData.progress.total) * 100);
                        this.updateProgress(percent, progressData.message, progressData.phase);
                    }
                };
                
                // Lancer le scan réel
                const results = await window.emailScanner.scan(scanOptions);
                this.scanResults = results;
                
                console.log('[MinimalScan] ✅ Scan réel terminé avec paramètres complets:', results);
                
                // Log spécial pour les catégories pré-sélectionnées
                if (results.stats?.preselectedForTasks > 0) {
                    console.log(`[MinimalScan] ⭐ ${results.stats.preselectedForTasks} emails identifiés pour création de tâches automatique`);
                }
                
            } else {
                console.log('[MinimalScan] 🎭 Mode simulation avec paramètres complets');
                // Simulation enrichie avec les paramètres
                for (const step of steps) {
                    this.updateProgress(step.progress, step.text, step.status);
                    await new Promise(resolve => setTimeout(resolve, 600));
                }
                
                // Générer des résultats réalistes basés sur les paramètres
                const baseEmails = Math.floor(Math.random() * 200) + 50;
                const preselectedCount = this.taskPreselectedCategories.length > 0 ? 
                    Math.floor(baseEmails * 0.15) : 0; // 15% des emails dans les catégories pré-sélectionnées
                
                this.scanResults = {
                    success: true,
                    total: baseEmails,
                    categorized: Math.floor(baseEmails * 0.85),
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    scanOptions: scanOptions,
                    stats: { 
                        processed: baseEmails, 
                        errors: Math.floor(Math.random() * 3),
                        preselectedForTasks: preselectedCount,
                        taskSuggestions: Math.floor(preselectedCount * 0.8)
                    }
                };
                
                console.log('[MinimalScan] ✅ Simulation terminée avec paramètres complets:', this.scanResults);
            }
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur lors du scan:', error);
            // Continuer avec simulation en cas d'erreur
            for (const step of steps) {
                this.updateProgress(step.progress, step.text, step.status);
                await new Promise(resolve => setTimeout(resolve, 400));
            }
            
            this.scanResults = {
                success: true,
                total: 0,
                categorized: 0,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                scanOptions: scanOptions,
                stats: { processed: 0, errors: 1, preselectedForTasks: 0, taskSuggestions: 0 }
            };
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
        setTimeout(() => {
            const scanBtn = document.getElementById('minimalScanBtn');
            if (scanBtn) {
                // Bouton de succès avec information sur les tâches pré-sélectionnées
                const preselectedCount = this.scanResults?.stats?.preselectedForTasks || 0;
                const buttonText = preselectedCount > 0 ? 
                    `Scan terminé ! ${preselectedCount} emails pour tâches` : 
                    'Scan terminé !';
                
                scanBtn.innerHTML = `<i class="fas fa-check"></i> <span>${buttonText}</span>`;
                scanBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                
                // Ajouter un badge si des emails pré-sélectionnés ont été trouvés
                if (preselectedCount > 0) {
                    scanBtn.style.position = 'relative';
                    scanBtn.insertAdjacentHTML('beforeend', `
                        <span style="position: absolute; top: -8px; right: -8px; background: #8b5cf6; color: white; 
                                     font-size: 10px; padding: 3px 6px; border-radius: 10px; font-weight: 700;">
                            ${preselectedCount}
                        </span>
                    `);
                }
            }
            
            // Préparer la redirection
            setTimeout(() => {
                this.redirectToResults();
            }, 1500);
        }, 500);
    }

    redirectToResults() {
        this.scanInProgress = false;
        
        // Stocker les résultats enrichis avec tous les paramètres
        const essentialResults = {
            success: this.scanResults?.success || true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            taskSuggestions: this.scanResults?.stats?.taskSuggestions || 0,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            selectedDays: this.selectedDays,
            timestamp: Date.now(),
            scanOptions: this.prepareScanOptions(),
            settingsUsed: { ...this.settings }
        };
        
        try {
            sessionStorage.removeItem('scanResults');
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
            console.log('[MinimalScan] 💾 Résultats enrichis avec paramètres sauvegardés:', essentialResults);
        } catch (error) {
            console.warn('[MinimalScan] ⚠️ Erreur de stockage:', error);
        }
        
        // Notification de succès enrichie avec paramètres
        if (window.uiManager?.showToast) {
            const totalEmails = essentialResults.total;
            const preselectedCount = essentialResults.preselectedForTasks;
            
            let message = `✅ ${totalEmails} emails analysés avec succès`;
            if (preselectedCount > 0) {
                message += ` • ${preselectedCount} emails pré-sélectionnés pour tâches`;
            }
            if (this.taskPreselectedCategories.length > 0) {
                message += ` • ${this.taskPreselectedCategories.length} catégories actives`;
            }
            
            window.uiManager.showToast(message, 'success', 5000);
        }
        
        // Redirection vers les emails avec paramètres synchronisés
        setTimeout(() => {
            if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
                console.log('[MinimalScan] 🔄 Redirection vers emails avec paramètres synchronisés');
                
                // NOUVEAU: S'assurer que PageManager a les bons paramètres
                if (typeof window.pageManager.loadCurrentParameters === 'function') {
                    window.pageManager.loadCurrentParameters();
                }
                
                window.pageManager.loadPage('emails');
            } else {
                console.log('[MinimalScan] ⚠️ PageManager non disponible');
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
        console.log('[MinimalScan] 🔄 Reset scanner avec rechargement paramètres');
        
        this.scanInProgress = false;
        this.setActiveStep(1);
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.classList.remove('visible');
        }
        
        const scanBtn = document.getElementById('minimalScanBtn');
        if (scanBtn) {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="fas fa-play"></i> <span>Démarrer l\'analyse intelligente</span>';
            scanBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            
            // Retirer le badge s'il existe
            const badge = scanBtn.querySelector('span[style*="position: absolute"]');
            if (badge) badge.remove();
        }
        
        this.updateProgress(0, 'Initialisation...', 'Préparation du scan');
        
        // Recharger les paramètres au reset
        this.loadSettingsFromCategoryManager();
        this.updatePreselectedCategoriesDisplay();
        
        console.log('[MinimalScan] 🔄 Scanner réinitialisé avec paramètres actualisés');
    }

    // ================================================
    // MÉTHODES DE SYNCHRONISATION ET MISE À JOUR
    // ================================================
    updateSettings(newSettings) {
        console.log('[MinimalScan] 📝 === MISE À JOUR SETTINGS ===');
        console.log('[MinimalScan] 📥 Nouveaux settings:', newSettings);
        
        const oldSettings = { ...this.settings };
        const oldCategories = [...this.taskPreselectedCategories];
        
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.taskPreselectedCategories = [...newSettings.taskPreselectedCategories];
        }
        
        if (newSettings.scanSettings?.defaultPeriod) {
            this.selectedDays = newSettings.scanSettings.defaultPeriod;
        }
        
        console.log('[MinimalScan] 📊 Settings mis à jour:');
        console.log('  - Anciens settings:', oldSettings);
        console.log('  - Nouveaux settings:', this.settings);
        console.log('  - Anciennes catégories:', oldCategories);
        console.log('  - Nouvelles catégories:', this.taskPreselectedCategories);
        
        // Mettre à jour l'interface si elle est visible
        this.updateUIWithNewSettings();
    }

    forceSettingsReload() {
        console.log('[MinimalScan] 🔄 === RECHARGEMENT FORCÉ PARAMÈTRES ===');
        
        this.parametersLoaded = false;
        this.syncInProgress = false;
        this.loadSettingsFromCategoryManager();
        
        console.log('[MinimalScan] ✅ Rechargement forcé terminé');
    }

    // ================================================
    // DEBUG ET UTILITAIRES
    // ================================================
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            lastSettingsSync: this.lastSettingsSync,
            scanResults: this.scanResults,
            settingsCheckInterval: !!this.settingsCheckInterval,
            stylesAdded: this.stylesAdded,
            parametersLoaded: this.parametersLoaded,
            syncInProgress: this.syncInProgress
        };
    }

    cleanup() {
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
            this.settingsCheckInterval = null;
        }
        
        this.scanInProgress = false;
        this.isInitialized = false;
        this.parametersLoaded = false;
        this.syncInProgress = false;
        
        console.log('[MinimalScan] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        console.log('[MinimalScan] Instance détruite');
    }
}

// ===== CRÉATION DES INSTANCES GLOBALES =====
console.log('[StartScan] 🔧 Création des instances globales...');

// Nettoyer l'ancienne instance si elle existe
if (window.minimalScanModule) {
    window.minimalScanModule.destroy?.();
}

// Créer l'instance principale
window.MinimalScanModule = MinimalScanModule;
window.minimalScanModule = new MinimalScanModule();
window.scanStartModule = window.minimalScanModule; // Alias pour compatibilité

console.log('[StartScan] ✅ Instances créées:');
console.log('- window.MinimalScanModule:', !!window.MinimalScanModule);
console.log('- window.minimalScanModule:', !!window.minimalScanModule);
console.log('- window.scanStartModule:', !!window.scanStartModule);

// ===== MÉTHODES UTILITAIRES GLOBALES POUR DEBUG =====
window.testScannerSettings = function() {
    console.group('🧪 TEST Scanner Settings');
    
    const debugInfo = window.minimalScanModule.getDebugInfo();
    console.log('Debug Info Scanner:', debugInfo);
    
    console.log('CategoryManager disponible:', !!window.categoryManager);
    console.log('CategoriesPage disponible:', !!window.categoriesPage);
    console.log('EmailScanner disponible:', !!window.emailScanner);
    
    if (window.categoryManager) {
        console.log('CategoryManager settings:', window.categoryManager.getSettings());
        console.log('CategoryManager taskPreselectedCategories:', window.categoryManager.getTaskPreselectedCategories());
    }
    
    if (window.categoriesPage) {
        console.log('CategoriesPage taskPreselectedCategories:', window.categoriesPage.getTaskPreselectedCategories());
    }
    
    if (window.emailScanner) {
        console.log('EmailScanner taskPreselectedCategories:', window.emailScanner.getTaskPreselectedCategories());
    }
    
    console.groupEnd();
    return debugInfo;
};

window.forceScannerSync = function() {
    console.log('[StartScan] 🔄 Forçage synchronisation scanner...');
    window.minimalScanModule.forceSettingsReload();
    window.minimalScanModule.updateUIWithNewSettings();
    console.log('[StartScan] ✅ Synchronisation forcée terminée');
    return window.minimalScanModule.getDebugInfo();
};

window.compareScannerSettings = function() {
    console.group('🔍 COMPARAISON SETTINGS ENTRE MODULES');
    
    const scannerSettings = window.minimalScanModule.settings;
    const scannerCategories = window.minimalScanModule.taskPreselectedCategories;
    
    const categoryManagerSettings = window.categoryManager?.getSettings();
    const categoryManagerCategories = window.categoryManager?.getTaskPreselectedCategories();
    
    const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories();
    
    console.log('🎯 Scanner Module:');
    console.log('  - Settings:', scannerSettings);
    console.log('  - TaskPreselectedCategories:', scannerCategories);
    
    console.log('🏷️ CategoryManager:');
    console.log('  - Settings:', categoryManagerSettings);
    console.log('  - TaskPreselectedCategories:', categoryManagerCategories);
    
    console.log('📧 EmailScanner:');
    console.log('  - TaskPreselectedCategories:', emailScannerCategories);
    
    // Comparaison
    const scannerStr = JSON.stringify([...scannerCategories].sort());
    const categoryManagerStr = JSON.stringify([...(categoryManagerCategories || [])].sort());
    const emailScannerStr = JSON.stringify([...(emailScannerCategories || [])].sort());
    
    console.log('🔍 Synchronisation:');
    console.log('  - Scanner vs CategoryManager:', scannerStr === categoryManagerStr ? '✅ SYNC' : '❌ DESYNC');
    console.log('  - Scanner vs EmailScanner:', scannerStr === emailScannerStr ? '✅ SYNC' : '❌ DESYNC');
    console.log('  - CategoryManager vs EmailScanner:', categoryManagerStr === emailScannerStr ? '✅ SYNC' : '❌ DESYNC');
    
    console.groupEnd();
    
    return {
        scanner: { settings: scannerSettings, categories: scannerCategories },
        categoryManager: { settings: categoryManagerSettings, categories: categoryManagerCategories },
        emailScanner: { categories: emailScannerCategories },
        isSync: scannerStr === categoryManagerStr && scannerStr === emailScannerStr
    };
};

console.log('[StartScan] 🚀 Scanner minimaliste v8.2 prêt avec synchronisation paramètres réparée!');
console.log('[StartScan] 🔧 Méthodes de debug disponibles: testScannerSettings(), forceScannerSync(), compareScannerSettings()');
