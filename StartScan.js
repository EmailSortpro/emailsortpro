// StartScan.js - Version 9.3 - CORRECTION ATTENTE INITIALISATION

console.log('[StartScan] 🚀 Loading StartScan.js v9.3...');

class MinimalScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        
        // Intégration avec les paramètres
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        // CORRECTION: Attente de l'initialisation des services
        this.servicesReady = false;
        this.maxWaitTime = 10000; // 10 secondes max
        this.checkInterval = null;
        
        console.log('[MinimalScan] Scanner v9.3 initialized - Attente services');
        
        this.initializeWithRetry();
    }

    // ================================================
    // INITIALISATION AVEC RETRY
    // ================================================
    async initializeWithRetry() {
        console.log('[MinimalScan] 🔄 Début initialisation avec retry...');
        
        let attempts = 0;
        const maxAttempts = 10;
        const retryDelay = 500;
        
        while (attempts < maxAttempts && !this.servicesReady) {
            attempts++;
            console.log(`[MinimalScan] 🔍 Tentative ${attempts}/${maxAttempts} de vérification services`);
            
            try {
                await this.checkServicesAvailability();
                
                if (this.servicesReady) {
                    console.log('[MinimalScan] ✅ Services prêts, finalisation initialisation');
                    await this.finializeInitialization();
                    break;
                }
                
            } catch (error) {
                console.warn(`[MinimalScan] ⚠️ Tentative ${attempts} échouée:`, error.message);
            }
            
            if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
            }
        }
        
        if (!this.servicesReady) {
            console.warn('[MinimalScan] ⚠️ Services non prêts après toutes les tentatives');
            console.log('[MinimalScan] 📝 Initialisation en mode dégradé');
            await this.initializeDegradedMode();
        }
    }

    async checkServicesAvailability() {
        // Vérifier CategoryManager
        if (!window.categoryManager) {
            throw new Error('CategoryManager non disponible');
        }
        
        // Vérifier EmailScanner et attendre son initialisation
        if (!window.emailScanner) {
            throw new Error('EmailScanner non disponible');
        }
        
        // NOUVEAU: Attendre que EmailScanner soit initialisé
        if (window.emailScanner.ensureInitialized) {
            const isInitialized = await window.emailScanner.ensureInitialized();
            if (!isInitialized) {
                throw new Error('EmailScanner non initialisé');
            }
        }
        
        // Vérifier l'authentification
        if (!this.isUserAuthenticated()) {
            throw new Error('Utilisateur non authentifié');
        }
        
        this.servicesReady = true;
        console.log('[MinimalScan] ✅ Tous les services sont disponibles et prêts');
    }

    async finializeInitialization() {
        this.loadSettingsFromCategoryManager();
        this.addMinimalStyles();
        this.isInitialized = true;
        
        console.log('[MinimalScan] ✅ Initialisation complète terminée');
        console.log('[MinimalScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
    }

    async initializeDegradedMode() {
        console.log('[MinimalScan] 🔄 Initialisation en mode dégradé...');
        
        // Charger les paramètres depuis localStorage en fallback
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = JSON.parse(saved);
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            } else {
                this.settings = this.getDefaultSettings();
                this.taskPreselectedCategories = [];
            }
        } catch (error) {
            console.error('[MinimalScan] Erreur chargement fallback:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
        }
        
        this.addMinimalStyles();
        this.isInitialized = true;
        
        console.log('[MinimalScan] ⚠️ Mode dégradé activé');
    }

    // ================================================
    // VÉRIFICATION D'AUTHENTIFICATION DUAL PROVIDER OPTIMISÉE
    // ================================================
    isUserAuthenticated() {
        console.log('[MinimalScan] 🔍 Vérification authentification...');
        
        // Vérifier Microsoft d'abord
        if (window.authService && typeof window.authService.isAuthenticated === 'function') {
            try {
                const msAuth = window.authService.isAuthenticated();
                if (msAuth) {
                    console.log('[MinimalScan] ✅ Utilisateur authentifié via Microsoft');
                    return true;
                } else {
                    console.log('[MinimalScan] ❌ Microsoft non authentifié');
                }
            } catch (error) {
                console.error('[MinimalScan] ❌ Erreur vérification Microsoft:', error);
            }
        } else {
            console.log('[MinimalScan] ⚠️ AuthService Microsoft non disponible');
        }
        
        // Vérifier Google ensuite avec logs détaillés
        if (window.googleAuthService && typeof window.googleAuthService.isAuthenticated === 'function') {
            try {
                const googleAuth = window.googleAuthService.isAuthenticated();
                console.log('[MinimalScan] 🔍 Google auth check result:', googleAuth);
                
                if (googleAuth) {
                    console.log('[MinimalScan] ✅ Utilisateur authentifié via Google');
                    return true;
                } else {
                    console.log('[MinimalScan] ❌ Google non authentifié');
                }
            } catch (error) {
                console.error('[MinimalScan] ❌ Erreur vérification Google:', error);
            }
        } else {
            console.log('[MinimalScan] ⚠️ GoogleAuthService non disponible');
        }
        
        console.log('[MinimalScan] ❌ Aucune authentification valide trouvée');
        return false;
    }

    getAuthenticatedProvider() {
        console.log('[MinimalScan] 🔍 Détection du provider authentifié...');
        
        // Vérifier Microsoft
        if (window.authService && typeof window.authService.isAuthenticated === 'function') {
            try {
                const msAuth = window.authService.isAuthenticated();
                if (msAuth) {
                    console.log('[MinimalScan] ✅ Provider actif: Microsoft');
                    return 'microsoft';
                }
            } catch (error) {
                console.error('[MinimalScan] ❌ Erreur check Microsoft:', error);
            }
        }
        
        // Vérifier Google
        if (window.googleAuthService && typeof window.googleAuthService.isAuthenticated === 'function') {
            try {
                const googleAuth = window.googleAuthService.isAuthenticated();
                if (googleAuth) {
                    console.log('[MinimalScan] ✅ Provider actif: Google');
                    return 'google';
                }
            } catch (error) {
                console.error('[MinimalScan] ❌ Erreur check Google:', error);
            }
        }
        
        console.log('[MinimalScan] ❌ Aucun provider authentifié');
        return null;
    }

    // ================================================
    // VÉRIFICATION DES SERVICES SÉCURISÉE
    // ================================================
    async checkServices() {
        console.log('[MinimalScan] 🔧 Vérification des services...');
        
        if (!this.servicesReady) {
            console.log('[MinimalScan] ⏳ Services non prêts, nouvelle tentative...');
            await this.checkServicesAvailability();
            
            if (!this.servicesReady) {
                throw new Error('Services non disponibles après vérification');
            }
        }
        
        if (!this.isUserAuthenticated()) {
            throw new Error('Authentification requise - Connectez-vous avec Microsoft ou Google');
        }
        
        const provider = this.getAuthenticatedProvider();
        console.log('[MinimalScan] 📡 Provider détecté:', provider);
        
        // Vérifier MailService
        if (!window.mailService) {
            throw new Error('MailService non disponible - Service de messagerie requis');
        }
        
        // Vérifier que MailService peut détecter le provider
        try {
            const mailProvider = window.mailService.detectAuthenticatedProvider?.();
            console.log('[MinimalScan] 📧 MailService provider:', mailProvider);
            
            if (!mailProvider) {
                console.warn('[MinimalScan] ⚠️ MailService ne détecte pas le provider');
                // Force l'initialisation du MailService
                if (window.mailService.initialize) {
                    await window.mailService.initialize();
                }
            }
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur vérification MailService:', error);
            throw new Error(`MailService error: ${error.message}`);
        }
        
        // Vérifier CategoryManager
        if (!window.categoryManager) {
            throw new Error('CategoryManager non disponible - Gestionnaire de catégories requis');
        }
        
        console.log('[MinimalScan] ✅ Tous les services sont disponibles');
    }

    // ================================================
    // INTÉGRATION AVEC LES PARAMÈTRES (améliorée)
    // ================================================
    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                console.log('[MinimalScan] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[MinimalScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
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
            taskPreselectedCategories: [],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            }
        };
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
                console.log('[MinimalScan] 🔄 Paramètres mis à jour détectés');
                this.updateUIWithNewSettings();
            }
        } catch (error) {
            console.error('[MinimalScan] Erreur vérification paramètres:', error);
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
                return category ? { icon: category.icon, name: category.name, color: category.color } : null;
            }).filter(Boolean);
            
            display.innerHTML = `
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
    }

    addMinimalStyles() {
        if (this.stylesAdded || document.getElementById('minimal-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'minimal-scan-styles';
        styles.textContent = `
            /* Scanner Ultra-Minimaliste v9.3 */
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
            
            /* Styles pour l'attente d'initialisation */
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 10px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .services-status {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 12px;
                padding: 16px;
                margin: 20px 0;
                text-align: left;
            }
            
            .services-status h4 {
                margin: 0 0 12px 0;
                color: #3b82f6;
                font-size: 16px;
                font-weight: 600;
            }
            
            .service-check {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 8px 0;
                font-size: 14px;
            }
            
            .service-check.ready {
                color: #10b981;
            }
            
            .service-check.waiting {
                color: #f59e0b;
            }
            
            .service-check.error {
                color: #ef4444;
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

            /* Provider Status Badge */
            .provider-badge {
                position: absolute;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .provider-badge.microsoft {
                background: rgba(0, 120, 215, 0.1);
                color: #0078d7;
                border: 1px solid rgba(0, 120, 215, 0.3);
            }
            
            .provider-badge.google {
                background: rgba(66, 133, 244, 0.1);
                color: #4285f4;
                border: 1px solid rgba(66, 133, 244, 0.3);
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
            
            /* Autres styles pour les étapes, durée, etc... */
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
            
            /* Responsive */
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
                
                .provider-badge {
                    position: static;
                    margin-bottom: 15px;
                    align-self: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[MinimalScan] ✅ Styles v9.3 ajoutés');
    }

    async render(container) {
        console.log('[MinimalScan] 🎯 Rendu du scanner v9.3...');
        
        try {
            this.addMinimalStyles();
            
            // CORRECTION: Attendre l'initialisation avant de vérifier l'auth
            if (!this.isInitialized) {
                container.innerHTML = this.renderInitializing();
                
                // Attendre l'initialisation en arrière-plan
                setTimeout(async () => {
                    try {
                        await this.initializeWithRetry();
                        // Re-rendre une fois initialisé
                        this.render(container);
                    } catch (error) {
                        console.error('[MinimalScan] Erreur initialisation:', error);
                        container.innerHTML = this.renderError(error);
                    }
                }, 100);
                return;
            }
            
            // Vérifier l'authentification
            if (!this.isUserAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            // Vérifier les services
            await this.checkServices();
            
            container.innerHTML = this.renderMinimalScanner();
            this.initializeEvents();
            
            console.log('[MinimalScan] ✅ Scanner v9.3 rendu avec succès');
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur lors du rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderInitializing() {
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon">
                        <div class="loading-spinner"></div>
                    </div>
                    
                    <h1 class="scanner-title">Initialisation</h1>
                    <p class="scanner-subtitle">Chargement des services en cours...</p>
                    
                    <div class="services-status">
                        <h4>État des services</h4>
                        <div class="service-check ${window.categoryManager ? 'ready' : 'waiting'}">
                            <i class="fas fa-${window.categoryManager ? 'check' : 'clock'}"></i>
                            <span>CategoryManager</span>
                        </div>
                        <div class="service-check ${window.emailScanner ? 'ready' : 'waiting'}">
                            <i class="fas fa-${window.emailScanner ? 'check' : 'clock'}"></i>
                            <span>EmailScanner</span>
                        </div>
                        <div class="service-check ${window.mailService ? 'ready' : 'waiting'}">
                            <i class="fas fa-${window.mailService ? 'check' : 'clock'}"></i>
                            <span>MailService</span>
                        </div>
                        <div class="service-check ${this.isUserAuthenticated() ? 'ready' : 'waiting'}">
                            <i class="fas fa-${this.isUserAuthenticated() ? 'check' : 'clock'}"></i>
                            <span>Authentification</span>
                        </div>
                    </div>
                    
                    <div class="scan-info">
                        <div class="scan-info-main">
                            <i class="fas fa-info-circle"></i>
                            <span>Vérification des services requis...</span>
                        </div>
                        <div class="scan-info-details">
                            Patientez quelques secondes
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMinimalScanner() {
        const provider = this.getAuthenticatedProvider();
        const providerBadge = provider ? this.renderProviderBadge(provider) : '';
        
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    ${providerBadge}
                    
                    <div class="scanner-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner Email</h1>
                    <p class="scanner-subtitle">Organisez vos emails automatiquement avec IA</p>
                    
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

    renderProviderBadge(provider) {
        const providerConfig = {
            microsoft: {
                icon: 'fab fa-microsoft',
                name: 'Microsoft',
                class: 'microsoft'
            },
            google: {
                icon: 'fab fa-google',
                name: 'Gmail',
                class: 'google'
            }
        };
        
        const config = providerConfig[provider];
        if (!config) return '';
        
        return `
            <div class="provider-badge ${config.class}">
                <i class="${config.icon}"></i>
                <span>Connecté via ${config.name}</span>
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
                        onclick="window.minimalScanModule.selectDuration(${option.value})" 
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
        
        const provider = this.getAuthenticatedProvider();
        if (provider) {
            details.push(`Source: ${provider === 'google' ? 'Gmail' : 'Outlook'}`);
        }
        
        return details.length > 0 ? 
            `<div class="scan-info-details">${details.join(' • ')}</div>` :
            '<div class="scan-info-details">Configuration par défaut</div>';
    }

    // Page de connexion dual provider optimisée
    renderNotAuthenticated() {
        console.log('[MinimalScan] 🔐 Rendu page de connexion');
        
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h1 class="scanner-title">Connexion requise</h1>
                    <p class="scanner-subtitle">Connectez-vous pour analyser vos emails</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 30px;">
                        <button class="scan-button-minimal" onclick="window.authService && window.authService.login()">
                            <i class="fab fa-microsoft"></i>
                            <span>Se connecter avec Microsoft / Outlook</span>
                        </button>
                        
                        <button class="scan-button-minimal" onclick="window.googleAuthService && window.googleAuthService.login()" 
                                style="background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);">
                            <i class="fab fa-google"></i>
                            <span>Se connecter avec Google / Gmail</span>
                        </button>
                    </div>
                    
                    <div class="scan-info" style="margin-top: 25px;">
                        <div class="scan-info-main">
                            <i class="fas fa-info-circle"></i>
                            <span>Compatible Outlook et Gmail</span>
                        </div>
                        <div class="scan-info-details">
                            Même expérience sur les deux plateformes
                        </div>
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
                    
                    <div class="scan-info" style="margin-top: 25px;">
                        <div class="scan-info-main">
                            <i class="fas fa-bug"></i>
                            <span>Diagnostic des services</span>
                        </div>
                        <div class="scan-info-details">
                            CategoryManager: ${window.categoryManager ? '✅' : '❌'} | 
                            EmailScanner: ${window.emailScanner ? '✅' : '❌'} | 
                            MailService: ${window.mailService ? '✅' : '❌'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeEvents() {
        console.log('[MinimalScan] ✅ Événements initialisés');
        
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
        
        console.log(`[MinimalScan] ✅ Durée sélectionnée: ${days} jours`);
    }

    async startScan() {
        if (this.scanInProgress) {
            console.log('[MinimalScan] Scan déjà en cours');
            return;
        }
        
        console.log('[MinimalScan] 🚀 Démarrage du scan');
        console.log('[MinimalScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        try {
            // CORRECTION: Vérifier que les services sont prêts avant de démarrer
            if (!this.servicesReady) {
                console.log('[MinimalScan] ⏳ Services non prêts, attente...');
                await this.checkServicesAvailability();
                
                if (!this.servicesReady) {
                    throw new Error('Services non disponibles pour le scan');
                }
            }
            
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
                scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyse en cours...</span>';
            }
            
            // Vérifier provider avant scan
            const provider = this.getAuthenticatedProvider();
            console.log('[MinimalScan] 📧 Provider pour le scan:', provider);
            
            if (!provider) {
                throw new Error('Aucun provider d\'authentification disponible');
            }
            
            const scanOptions = this.prepareScanOptions();
            await this.executeScan(scanOptions);
            
            this.setActiveStep(3);
            this.completeScan();
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur de scan:', error);
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
            onProgress: (progress) => this.updateProgress(progress.progress?.current || 0, progress.message || '', progress.phase || ''),
            provider: this.getAuthenticatedProvider()
        };
        
        if (this.taskPreselectedCategories.length > 0) {
            baseOptions.taskPreselectedCategories = [...this.taskPreselectedCategories];
        }
        
        console.log('[MinimalScan] 📊 Options de scan:', baseOptions);
        return baseOptions;
    }

    async executeScan(scanOptions) {
        try {
            if (window.emailScanner && typeof window.emailScanner.scan === 'function') {
                console.log('[MinimalScan] 🔄 Scan réel en cours...');
                
                // CORRECTION: S'assurer qu'EmailScanner est initialisé
                if (window.emailScanner.ensureInitialized) {
                    await window.emailScanner.ensureInitialized();
                }
                
                const results = await window.emailScanner.scan(scanOptions);
                this.scanResults = results;
                
                console.log('[MinimalScan] ✅ Scan terminé:', results);
                
                if (results.stats?.preselectedForTasks > 0) {
                    console.log(`[MinimalScan] ⭐ ${results.stats.preselectedForTasks} emails pré-sélectionnés pour tâches`);
                }
                
            } else {
                console.log('[MinimalScan] 🎭 Mode simulation');
                
                // Simulation
                for (let i = 0; i <= 100; i += 10) {
                    this.updateProgress(i, `Analyse ${i}%`, 'Simulation en cours');
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                this.scanResults = {
                    success: true,
                    total: 150,
                    categorized: 130,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    stats: { 
                        preselectedForTasks: this.taskPreselectedCategories.length > 0 ? 25 : 0,
                        taskSuggestions: 20
                    }
                };
            }
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur scan:', error);
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
        setTimeout(() => {
            const scanBtn = document.getElementById('minimalScanBtn');
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
        
        const provider = this.getAuthenticatedProvider();
        const essentialResults = {
            success: true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            timestamp: Date.now(),
            provider: provider
        };
        
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
        } catch (error) {
            console.warn('[MinimalScan] Erreur stockage:', error);
        }
        
        if (window.uiManager?.showToast) {
            const providerName = provider === 'google' ? 'Gmail' : 'Outlook';
            const message = essentialResults.preselectedForTasks > 0 ?
                `✅ ${essentialResults.total} emails ${providerName} analysés • ⭐ ${essentialResults.preselectedForTasks} pré-sélectionnés` :
                `✅ ${essentialResults.total} emails ${providerName} analysés`;
            
            window.uiManager.showToast(message, 'success', 4000);
        }
        
        setTimeout(() => {
            if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
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
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="fas fa-play"></i> <span>Démarrer l\'analyse intelligente</span>';
            scanBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            
            const badge = scanBtn.querySelector('.success-badge');
            if (badge) badge.remove();
        }
        
        this.updateProgress(0, 'Initialisation...', 'Préparation du scan');
        
        this.loadSettingsFromCategoryManager();
        this.updatePreselectedCategoriesDisplay();
        
        console.log('[MinimalScan] 🔄 Scanner réinitialisé');
    }

    updateSettings(newSettings) {
        console.log('[MinimalScan] 📝 Mise à jour des paramètres:', newSettings);
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
            servicesReady: this.servicesReady,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            lastSettingsSync: this.lastSettingsSync,
            scanResults: this.scanResults,
            authenticatedProvider: this.getAuthenticatedProvider(),
            isAuthenticated: this.isUserAuthenticated(),
            version: '9.3',
            authServices: {
                microsoft: {
                    available: !!window.authService,
                    authenticated: window.authService ? window.authService.isAuthenticated() : false
                },
                google: {
                    available: !!window.googleAuthService,
                    authenticated: window.googleAuthService ? window.googleAuthService.isAuthenticated() : false
                }
            },
            services: {
                categoryManager: !!window.categoryManager,
                emailScanner: !!window.emailScanner,
                mailService: !!window.mailService
            }
        };
    }

    cleanup() {
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
            this.settingsCheckInterval = null;
        }
        
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        
        this.scanInProgress = false;
        this.isInitialized = false;
        this.servicesReady = false;
        
        console.log('[MinimalScan] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        console.log('[MinimalScan] Instance détruite');
    }
}

// Créer l'instance globale
if (window.minimalScanModule) {
    window.minimalScanModule.destroy?.();
}

window.MinimalScanModule = MinimalScanModule;
window.minimalScanModule = new MinimalScanModule();
window.scanStartModule = window.minimalScanModule;

// Fonctions de debug
window.debugMinimalScan = function() {
    console.group('🔍 DEBUG MinimalScan v9.3');
    const debugInfo = window.minimalScanModule.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    console.groupEnd();
    return debugInfo;
};

console.log('[StartScan] ✅ Scanner v9.3 chargé - Correction attente initialisation!');
