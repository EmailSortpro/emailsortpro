// StartScan.js - Version 13.0 - Scanner optimisé sans boucles infinies

console.log('[StartScan] 🚀 Loading StartScan.js v13.0 - Version optimisée...');

class MinimalScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        this.currentProvider = null;
        
        // Gestion des paramètres optimisée
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.settingsCheckInterval = null;
        this.isMonitoring = false;
        
        // Cache pour éviter les détections répétées
        this._providerCache = null;
        this._providerCacheTime = 0;
        this.PROVIDER_CACHE_DURATION = 30000; // 30 secondes
        
        console.log('[MinimalScan] Scanner v13.0 initialized - Optimisé');
        
        // Charger les paramètres une seule fois au démarrage
        this.loadSettingsFromCategoryManager(true);
        this.addMinimalStyles();
    }

    // ================================================
    // DÉTECTION PROVIDER AVEC CACHE
    // ================================================
    detectProvider() {
        // Utiliser le cache si valide
        const now = Date.now();
        if (this._providerCache && (now - this._providerCacheTime) < this.PROVIDER_CACHE_DURATION) {
            return this._providerCache;
        }
        
        // Détection réelle
        let provider = null;
        
        // PRIORITÉ 1: Google Gmail
        if (window.googleAuthService?.isAuthenticated?.()) {
            provider = 'google';
        } 
        // PRIORITÉ 2: Microsoft Outlook
        else if (window.authService?.isAuthenticated?.()) {
            provider = 'microsoft';
        }
        
        // Mettre en cache
        this._providerCache = provider;
        this._providerCacheTime = now;
        this.currentProvider = provider;
        
        return provider;
    }

    clearProviderCache() {
        this._providerCache = null;
        this._providerCacheTime = 0;
    }

    getProviderInfo() {
        const provider = this.detectProvider();
        
        const providers = {
            google: {
                name: 'Google Gmail',
                icon: 'fab fa-google',
                color: '#ea4335',
                service: window.googleAuthService,
                priority: 'high',
                status: 'authenticated'
            },
            microsoft: {
                name: 'Microsoft Outlook',
                icon: 'fab fa-microsoft',
                color: '#0078d4',
                service: window.authService,
                priority: 'normal',
                status: 'authenticated'
            }
        };
        
        return providers[provider] || {
            name: 'Non connecté',
            icon: 'fas fa-question-circle',
            color: '#6b7280',
            service: null,
            priority: 'none',
            status: 'disconnected'
        };
    }

    // ================================================
    // GESTION PARAMÈTRES OPTIMISÉE
    // ================================================
    loadSettingsFromCategoryManager(isInitialLoad = false) {
        try {
            let settingsChanged = false;
            const oldSettings = JSON.stringify(this.settings);
            const oldCategories = JSON.stringify(this.taskPreselectedCategories);
            
            if (window.categoryManager?.getSettings) {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
                
                if (!isInitialLoad) {
                    const newSettings = JSON.stringify(this.settings);
                    const newCategories = JSON.stringify(this.taskPreselectedCategories);
                    settingsChanged = (oldSettings !== newSettings) || (oldCategories !== newCategories);
                }
                
                if (isInitialLoad) {
                    console.log('[MinimalScan] ✅ Paramètres initiaux chargés');
                    console.log('[MinimalScan] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                } else if (settingsChanged) {
                    console.log('[MinimalScan] 🔄 Paramètres mis à jour');
                }
                
                // Vérifier marketing seulement si changement ou initial
                if (isInitialLoad || settingsChanged) {
                    const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
                    if (hasMarketing) {
                        console.log('[MinimalScan] 📰 Marketing dans les catégories - Optimisation activée');
                    }
                }
                
                if (this.settings.scanSettings?.defaultPeriod) {
                    this.selectedDays = this.settings.scanSettings.defaultPeriod;
                }
            } else {
                // Fallback localStorage
                this.loadSettingsFromLocalStorage();
            }
            
            this.lastSettingsSync = Date.now();
            return settingsChanged;
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            return false;
        }
    }

    loadSettingsFromLocalStorage() {
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
            console.warn('[MinimalScan] ⚠️ Erreur localStorage:', error);
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
            taskPreselectedCategories: ['tasks', 'meetings', 'finance'],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true,
                marketingPriority: true
            }
        };
    }

    // ================================================
    // MONITORING OPTIMISÉ - ON DEMAND
    // ================================================
    startMonitoring() {
        if (this.isMonitoring) return;
        
        console.log('[MinimalScan] 📊 Démarrage monitoring paramètres');
        this.isMonitoring = true;
        
        // Vérifier toutes les 10 secondes au lieu de 5
        this.settingsCheckInterval = setInterval(() => {
            this.checkSettingsUpdate();
        }, 10000);
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        console.log('[MinimalScan] 🛑 Arrêt monitoring paramètres');
        this.isMonitoring = false;
        
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
            this.settingsCheckInterval = null;
        }
    }

    checkSettingsUpdate() {
        // Éviter les vérifications trop fréquentes
        const now = Date.now();
        if (now - this.lastSettingsSync < 5000) return;
        
        try {
            const settingsChanged = this.loadSettingsFromCategoryManager(false);
            
            if (settingsChanged && this.isInitialized) {
                this.updateUIWithNewSettings();
            }
        } catch (error) {
            console.error('[MinimalScan] Erreur vérification paramètres:', error);
        }
    }

    updateUIWithNewSettings() {
        // Mettre à jour seulement si le scanner est visible
        if (!document.getElementById('minimalScanBtn')) return;
        
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

    // ================================================
    // AFFICHAGE UI OPTIMISÉ
    // ================================================
    updatePreselectedCategoriesDisplay() {
        const display = document.getElementById('preselected-categories-display');
        if (!display) return;
        
        // Utiliser un fragment pour optimiser le DOM
        const fragment = document.createDocumentFragment();
        const wrapper = document.createElement('div');
        
        if (this.taskPreselectedCategories.length === 0) {
            wrapper.innerHTML = `
                <div class="preselected-info no-selection">
                    <i class="fas fa-info-circle"></i>
                    <span>Aucune catégorie pré-sélectionnée pour la création de tâches</span>
                </div>
            `;
        } else {
            const categoryDetails = this.taskPreselectedCategories
                .map(catId => {
                    const category = window.categoryManager?.getCategory(catId);
                    return category ? { 
                        id: catId,
                        icon: category.icon, 
                        name: category.name, 
                        color: category.color,
                        isMarketing: catId === 'marketing_news'
                    } : null;
                })
                .filter(Boolean);
            
            const hasMarketing = categoryDetails.some(cat => cat.isMarketing);
            const marketingNote = hasMarketing ? 
                '<div class="marketing-note">📰 Détection marketing prioritaire activée</div>' : '';
            
            wrapper.innerHTML = `
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
        
        fragment.appendChild(wrapper.firstChild);
        display.innerHTML = '';
        display.appendChild(fragment);
    }

    updateProviderInfo() {
        const providerDisplay = document.getElementById('provider-info-display');
        if (!providerDisplay) return;
        
        const providerInfo = this.getProviderInfo();
        const priorityBadge = providerInfo.priority === 'high' ? 
            '<span class="priority-badge">🚀 Optimisé</span>' : '';
        
        const statusColor = providerInfo.status === 'authenticated' ? 
            providerInfo.color : '#6b7280';
        
        providerDisplay.innerHTML = `
            <div class="provider-info" style="color: ${statusColor};">
                <i class="${providerInfo.icon}"></i>
                <span>${providerInfo.status === 'authenticated' ? 'Connecté à' : ''} ${providerInfo.name}</span>
                ${priorityBadge}
            </div>
        `;
    }

    // ================================================
    // STYLES (Conservés mais optimisés)
    // ================================================
    addMinimalStyles() {
        if (this.stylesAdded || document.getElementById('minimal-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'minimal-scan-styles';
        styles.textContent = this.getOptimizedStyles();
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[MinimalScan] ✅ Styles v13.0 ajoutés - Optimisés');
    }

    getOptimizedStyles() {
        // Retourner les styles compressés/optimisés
        return `
            /* Scanner v13.0 - Styles optimisés */
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

            #provider-info-display { margin: 15px 0; }
            
            .provider-info {
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 500;
                position: relative;
                transition: all 0.3s ease;
            }
            
            .provider-info:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .priority-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 8px;
                font-weight: 700;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
            }
            
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
            
            .preselected-category-badge:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
            
            .scan-button-minimal.google-optimized {
                background: linear-gradient(135deg, #ea4335 0%, #db4437 100%);
                box-shadow: 0 6px 20px rgba(234, 67, 53, 0.4);
            }
            
            .scan-button-minimal.microsoft-ready {
                background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
                box-shadow: 0 6px 20px rgba(0, 120, 212, 0.4);
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
            
            .success-badge.google {
                background: linear-gradient(135deg, #ea4335, #db4437);
            }
            
            .success-badge.microsoft {
                background: linear-gradient(135deg, #0078d4, #106ebe);
            }
            
            @keyframes marketingBadge {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(5deg); }
            }
            
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
            
            .progress-fill.google-mode {
                background: linear-gradient(90deg, #ea4335 0%, #db4437 100%);
            }
            
            .progress-fill.microsoft-mode {
                background: linear-gradient(90deg, #0078d4 0%, #106ebe 100%);
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
            
            .scan-info.marketing-enhanced {
                background: rgba(255, 107, 107, 0.1);
                color: #ff6b6b;
                border: 1px solid rgba(255, 107, 107, 0.2);
            }
            
            .scan-info.google-ready {
                background: rgba(234, 67, 53, 0.1);
                color: #ea4335;
                border: 1px solid rgba(234, 67, 53, 0.2);
            }
            
            .scan-info.microsoft-ready {
                background: rgba(0, 120, 212, 0.1);
                color: #0078d4;
                border: 1px solid rgba(0, 120, 212, 0.2);
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
            
            .scan-info.google-ready .scan-info-details {
                color: #db4437;
            }
            
            .scan-info.microsoft-ready .scan-info-details {
                color: #106ebe;
            }
            
            .connection-status {
                display: flex;
                align-items: center;
                gap: 12px;
                margin: 20px 0;
                padding: 16px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 12px;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .connection-status.connected {
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }
            
            .connection-status.disconnected {
                border-color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
            }
            
            .connection-actions {
                display: flex;
                gap: 12px;
                margin-top: 20px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .provider-btn {
                padding: 12px 20px;
                border: 2px solid;
                border-radius: 10px;
                background: white;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .provider-btn.google {
                border-color: #ea4335;
                color: #ea4335;
            }
            
            .provider-btn.google:hover {
                background: #ea4335;
                color: white;
            }
            
            .provider-btn.microsoft {
                border-color: #0078d4;
                color: #0078d4;
            }
            
            .provider-btn.microsoft:hover {
                background: #0078d4;
                color: white;
            }
            
            @media (max-width: 480px) {
                .scanner-card-minimal { padding: 35px 25px; }
                .scanner-title { font-size: 28px; }
                .scanner-subtitle { font-size: 16px; }
                .preselected-categories-grid { gap: 6px; }
                .preselected-category-badge { font-size: 12px; padding: 6px 10px; }
                .duration-option { padding: 10px 16px; font-size: 13px; min-width: 75px; }
                .connection-actions { flex-direction: column; }
                .provider-btn { width: 100%; justify-content: center; }
            }
        `;
    }

    // ================================================
    // RENDER PRINCIPAL OPTIMISÉ
    // ================================================
    async render(container) {
        console.log('[MinimalScan] 🎯 Rendu scanner v13.0 optimisé...');
        
        try {
            // Démarrer le monitoring seulement quand visible
            this.startMonitoring();
            
            // Effacer le cache provider au rendu
            this.clearProviderCache();
            
            const provider = this.detectProvider();
            console.log('[MinimalScan] 🔌 Provider détecté:', provider);
            
            if (!provider) {
                container.innerHTML = this.renderNotAuthenticated();
                this.isInitialized = true;
                return;
            }

            await this.checkServices();
            
            container.innerHTML = this.renderMinimalScanner();
            this.isInitialized = true;
            
            console.log(`[MinimalScan] ✅ Scanner v13.0 rendu avec succès (${provider})`);
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur rendu:', error);
            container.innerHTML = this.renderError(error);
            this.isInitialized = false;
        }
    }

    // ================================================
    // RENDER SCANNER (conservé mais optimisé)
    // ================================================
    renderMinimalScanner() {
        const providerInfo = this.getProviderInfo();
        const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
        
        // Classes CSS optimisées
        let buttonClass = 'scan-button-minimal';
        let infoClass = 'scan-info';
        
        if (hasMarketing) {
            buttonClass += ' marketing-enhanced';
            infoClass += ' marketing-enhanced';
        } else if (providerInfo.status === 'authenticated') {
            if (this.currentProvider === 'google') {
                buttonClass += ' google-optimized';
                infoClass += ' google-ready';
            } else if (this.currentProvider === 'microsoft') {
                buttonClass += ' microsoft-ready';
                infoClass += ' microsoft-ready';
            }
        }
        
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
                            `Organisez vos emails automatiquement avec IA - ${providerInfo.name} intégré`
                        }
                    </p>
                    
                    <div id="provider-info-display">
                        ${this.renderProviderInfo(providerInfo)}
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
                            <div class="step-label">${hasMarketing ? 'Scan 📰' : `Scan ${providerInfo.name.split(' ')[0]}`}</div>
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
                    
                    <button class="${buttonClass}" id="minimalScanBtn" onclick="window.minimalScanModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>${this.getScanButtonText(hasMarketing, providerInfo)}</span>
                    </button>
                    
                    <div class="progress-section-minimal" id="progressSection">
                        <div class="progress-bar-minimal">
                            <div class="progress-fill ${this.getProgressFillClass(hasMarketing, providerInfo)}" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus">Préparation du scan ${hasMarketing ? 'marketing' : providerInfo.name}</div>
                    </div>
                    
                    <div class="${infoClass}">
                        <div class="scan-info-main">
                            <i class="fas fa-shield-alt"></i>
                            <span>Scan sécurisé et privé${hasMarketing ? ' - Marketing Priority' : ''} - ${providerInfo.name} compatible</span>
                        </div>
                        ${this.renderScanInfoDetails()}
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // MÉTHODES RENDER HELPER (conservées)
    // ================================================
    renderProviderInfo(providerInfo) {
        const priorityBadge = providerInfo.priority === 'high' ? 
            '<span class="priority-badge">🚀 Optimisé</span>' : '';
        
        const statusColor = providerInfo.status === 'authenticated' ? 
            providerInfo.color : '#6b7280';
        
        return `
            <div class="provider-info" style="color: ${statusColor};">
                <i class="${providerInfo.icon}"></i>
                <span>${providerInfo.status === 'authenticated' ? 'Connecté à' : ''} ${providerInfo.name}</span>
                ${priorityBadge}
            </div>
        `;
    }

    getScanButtonText(hasMarketing, providerInfo) {
        if (hasMarketing) {
            return 'Analyser avec détection marketing';
        } else if (providerInfo.status === 'authenticated') {
            return `Démarrer l'analyse ${providerInfo.name.split(' ')[0]}`;
        } else {
            return 'Démarrer l\'analyse intelligente';
        }
    }

    getProgressFillClass(hasMarketing, providerInfo) {
        if (hasMarketing) return 'marketing-mode';
        if (providerInfo.status === 'authenticated') {
            return `${this.currentProvider}-mode`;
        }
        return '';
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
        
        const categoryDetails = this.taskPreselectedCategories
            .map(catId => {
                const category = window.categoryManager?.getCategory(catId);
                return category ? { 
                    id: catId,
                    icon: category.icon, 
                    name: category.name, 
                    color: category.color,
                    isMarketing: catId === 'marketing_news'
                } : null;
            })
            .filter(Boolean);
        
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
        const details = [];
        
        const providerInfo = this.getProviderInfo();
        if (providerInfo.status === 'authenticated') {
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
                    
                    <div class="connection-status disconnected">
                        <i class="fas fa-unlink"></i>
                        <span>Aucun service d'emails connecté</span>
                    </div>
                    
                    <div class="connection-actions">
                        <button class="provider-btn google" onclick="window.googleAuthService?.login()">
                            <i class="fab fa-google"></i>
                            <span>Se connecter à Gmail</span>
                        </button>
                        
                        <button class="provider-btn microsoft" onclick="window.authService?.login()">
                            <i class="fab fa-microsoft"></i>
                            <span>Se connecter à Outlook</span>
                        </button>
                    </div>
                    
                    <div class="scan-info">
                        <div class="scan-info-main">
                            <i class="fas fa-info-circle"></i>
                            <span>Sécurisé et privé - Vos données restent confidentielles</span>
                        </div>
                        <div class="scan-info-details">Compatible Gmail et Outlook • Analyse IA • Catégorisation automatique</div>
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

    // ================================================
    // VÉRIFICATION SERVICES OPTIMISÉE
    // ================================================
    async checkServices() {
        const provider = this.detectProvider();
        if (!provider) {
            throw new Error('Aucun service d\'authentification disponible');
        }
        
        // Vérifier les services essentiels seulement
        const requiredServices = [
            { name: 'EmailScanner', check: () => window.emailScanner },
            { name: 'CategoryManager', check: () => window.categoryManager }
        ];
        
        for (const service of requiredServices) {
            if (!service.check()) {
                console.warn(`[MinimalScan] ⚠️ ${service.name} non disponible`);
                throw new Error(`${service.name} requis pour le scan`);
            }
        }
        
        console.log(`[MinimalScan] ✅ Services vérifiés (${provider})`);
    }

    // ================================================
    // SCAN PRINCIPAL OPTIMISÉ
    // ================================================
    selectDuration(days) {
        this.selectedDays = days;
        
        // Optimiser en utilisant querySelectorAll une seule fois
        const durationOptions = document.querySelectorAll('.duration-option');
        durationOptions.forEach(btn => {
            if (parseInt(btn.dataset.days) === days) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
        
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
        } finally {
            this.scanInProgress = false;
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
            marketingPriority: hasMarketing,
            onProgress: (progress) => this.updateProgress(
                progress.progress?.current || 0, 
                progress.message || '', 
                progress.phase || ''
            )
        };
        
        if (this.taskPreselectedCategories.length > 0) {
            baseOptions.taskPreselectedCategories = [...this.taskPreselectedCategories];
        }
        
        console.log(`[MinimalScan] 📊 Options scan:`, baseOptions);
        return baseOptions;
    }

    async executeScan(scanOptions) {
        if (!window.emailScanner?.scan) {
            throw new Error('EmailScanner non disponible');
        }
        
        console.log(`[MinimalScan] 🔄 Scan en cours (${scanOptions.provider})...`);
        
        const results = await window.emailScanner.scan(scanOptions);
        this.scanResults = results;
        
        console.log(`[MinimalScan] ✅ Scan terminé:`, {
            total: results.total,
            categorized: results.categorized,
            preselected: results.stats?.preselectedForTasks,
            marketing: results.stats?.marketingDetected
        });
        
        return results;
    }

    updateProgress(percent, text, status) {
        // Utiliser requestAnimationFrame pour optimiser
        requestAnimationFrame(() => {
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const progressStatus = document.getElementById('progressStatus');
            
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (progressText) progressText.textContent = text;
            if (progressStatus) progressStatus.textContent = status;
        });
    }

    setActiveStep(stepNumber) {
        // Optimiser en évitant les reflows multiples
        requestAnimationFrame(() => {
            document.querySelectorAll('.step').forEach(step => {
                step.classList.remove('active');
            });
            
            const activeStep = document.getElementById(`step${stepNumber}`);
            if (activeStep) {
                activeStep.classList.add('active');
            }
        });
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
                let badgeClass = 'success-badge';
                
                if (hasMarketing && marketingCount > 0) {
                    buttonText = `📰 Scan marketing terminé !`;
                    badgeContent = `📰 ${marketingCount} newsletters`;
                    badgeClass += ' marketing';
                } else if (preselectedCount > 0) {
                    badgeContent = `⭐ ${preselectedCount} emails pour tâches`;
                    badgeClass += ` ${provider}`;
                }
                
                scanBtn.innerHTML = `<i class="fas fa-check"></i> <span>${buttonText}</span>`;
                scanBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                
                if (badgeContent) {
                    scanBtn.style.position = 'relative';
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
        
        // Sauvegarder les résultats essentiels
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
            
            // Sauvegarder aussi dans localStorage avec expiration
            const storageData = {
                results: essentialResults,
                expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
            };
            localStorage.setItem('lastScanResults', JSON.stringify(storageData));
        } catch (error) {
            console.warn('[MinimalScan] Erreur stockage:', error);
        }
        
        // Notification
        if (window.uiManager?.showToast) {
            let message = `✅ ${essentialResults.total} emails analysés (${provider})`;
            
            if (hasMarketing && essentialResults.marketingDetected > 0) {
                message += ` • 📰 ${essentialResults.marketingDetected} newsletters`;
            }
            
            if (essentialResults.preselectedForTasks > 0) {
                message += ` • ⭐ ${essentialResults.preselectedForTasks} pour tâches`;
            }
            
            window.uiManager.showToast(message, 'success', 5000);
        }
        
        // Redirection
        setTimeout(() => {
            if (window.pageManager?.loadPage) {
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
                    <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">
                        Erreur scan ${provider}
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">
                        ${error.message}
                    </div>
                    
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
            // Réinitialiser le contenu
            progressSection.innerHTML = `
                <div class="progress-bar-minimal">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">Initialisation...</div>
                <div class="progress-status" id="progressStatus">Préparation du scan</div>
            `;
        }
        
        const scanBtn = document.getElementById('minimalScanBtn');
        if (scanBtn) {
            const providerInfo = this.getProviderInfo();
            const hasMarketing = this.taskPreselectedCategories.includes('marketing_news');
            
            scanBtn.disabled = false;
            scanBtn.innerHTML = `<i class="fas fa-play"></i> <span>${this.getScanButtonText(hasMarketing, providerInfo)}</span>`;
            scanBtn.style.background = '';
            
            // Restaurer les classes appropriées
            const buttonClass = this.getButtonClassForProvider(hasMarketing, providerInfo);
            scanBtn.className = buttonClass;
            
            // Supprimer le badge
            const badge = scanBtn.querySelector('.success-badge');
            if (badge) badge.remove();
        }
        
        // Recharger les paramètres
        this.loadSettingsFromCategoryManager(true);
        this.updateUIWithNewSettings();
        
        console.log('[MinimalScan] 🔄 Scanner réinitialisé');
    }

    getButtonClassForProvider(hasMarketing, providerInfo) {
        let className = 'scan-button-minimal';
        
        if (hasMarketing) {
            className += ' marketing-enhanced';
        } else if (providerInfo.status === 'authenticated') {
            if (this.currentProvider === 'google') {
                className += ' google-optimized';
            } else if (this.currentProvider === 'microsoft') {
                className += ' microsoft-ready';
            }
        }
        
        return className;
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    updateSettings(newSettings) {
        console.log('[MinimalScan] 📝 Mise à jour paramètres manuelle');
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
            version: '13.0',
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            isMonitoring: this.isMonitoring,
            selectedDays: this.selectedDays,
            currentProvider: provider,
            providerInfo: providerInfo,
            providerCached: !!this._providerCache,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            marketingDetection: hasMarketing,
            settings: this.settings,
            lastSettingsSync: new Date(this.lastSettingsSync).toLocaleString(),
            scanResults: this.scanResults ? {
                total: this.scanResults.total,
                categorized: this.scanResults.categorized,
                preselected: this.scanResults.stats?.preselectedForTasks,
                marketing: this.scanResults.stats?.marketingDetected
            } : null,
            servicesAvailable: {
                emailScanner: !!window.emailScanner,
                categoryManager: !!window.categoryManager,
                googleAuth: !!(window.googleAuthService?.isAuthenticated?.()),
                microsoftAuth: !!(window.authService?.isAuthenticated?.())
            }
        };
    }

    // ================================================
    // CLEANUP ET DESTRUCTION
    // ================================================
    cleanup() {
        // Arrêter le monitoring
        this.stopMonitoring();
        
        // Effacer les caches
        this.clearProviderCache();
        
        // Reset des états
        this.scanInProgress = false;
        this.isInitialized = false;
        
        console.log('[MinimalScan] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        
        // Effacer toutes les données
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.currentProvider = null;
        this.scanResults = null;
        
        console.log('[MinimalScan] 💥 Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================
(function() {
    // Nettoyer l'ancienne instance si elle existe
    if (window.minimalScanModule) {
        try {
            window.minimalScanModule.destroy?.();
        } catch (e) {
            console.warn('[MinimalScan] Erreur nettoyage ancienne instance:', e);
        }
    }

    // Export de la classe
    window.MinimalScanModule = MinimalScanModule;

    try {
        // Créer la nouvelle instance
        window.minimalScanModule = new MinimalScanModule();
        window.scanStartModule = window.minimalScanModule;
        
        console.log('[StartScan] ✅ Scanner v13.0 créé avec succès - Version optimisée');
        
        // Ajouter des méthodes globales pour debug
        window.debugScanner = function() {
            return window.minimalScanModule.getDebugInfo();
        };
        
        window.resetScanner = function() {
            return window.minimalScanModule.resetScanner();
        };
        
    } catch (error) {
        console.error('[StartScan] ❌ Erreur création instance:', error);
        
        // Instance de secours minimale
        window.minimalScanModule = {
            isInitialized: false,
            scanInProgress: false,
            currentProvider: null,
            
            detectProvider: function() {
                if (window.googleAuthService?.isAuthenticated?.()) return 'google';
                if (window.authService?.isAuthenticated?.()) return 'microsoft';
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
                            <p class="scanner-subtitle">Le scanner n'a pas pu s'initialiser correctement</p>
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
                    version: '13.0-fallback'
                };
            },
            
            cleanup: function() {},
            destroy: function() {},
            
            error: 'Scanner de secours - Rechargez la page'
        };
        
        window.scanStartModule = window.minimalScanModule;
        console.log('[StartScan] 🔧 Instance de secours créée');
    }
})();

console.log('[StartScan] ✅ Scanner v13.0 chargé - Version optimisée sans boucles infinies!');
console.log('[StartScan] 🚀 Monitoring paramètres activé seulement quand visible');
console.log('[StartScan] 💾 Cache provider pour éviter détections répétées');
console.log('[StartScan] 📊 Utilisez window.debugScanner() pour voir l\'état du scanner');
