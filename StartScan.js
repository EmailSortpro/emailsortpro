// StartScan.js - Version 10.0 - HYPER OPTIMISÉ PERFORMANCE 🚀⚡

console.log('[StartScan] 🚀 Loading StartScan.js v10.0 HYPER OPTIMIZED...');

class UltraFastScanModule {
    constructor() {
        // Core optimisé
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        
        // NOUVEAU: Cache ultra-optimisé
        this.settingsCache = new Map();
        this.settingsCacheTime = 0;
        this.CACHE_DURATION = 30000; // 30 secondes
        
        // NOUVEAU: Synchronisation ultra-légère
        this.taskPreselectedCategories = [];
        this.lastSettingsHash = '';
        this.syncCheckInterval = null;
        
        // NOUVEAU: Métriques temps réel
        this.performanceMetrics = {
            settingsLoadTime: 0,
            renderTime: 0,
            styleLoadTime: 0,
            lastScanDuration: 0
        };
        
        console.log('[UltraFastScan] Scanner v10.0 initialized - Performance MAXIMISÉE');
        this.initializeUltraFast();
    }

    // ================================================
    // INITIALISATION ULTRA-RAPIDE
    // ================================================
    initializeUltraFast() {
        const start = performance.now();
        
        // 1. Chargement settings optimisé avec cache
        this.loadSettingsUltraFast();
        
        // 2. Styles avec cache CSS et batch DOM
        this.addUltraFastStyles();
        
        // 3. Sync check toutes les 30 secondes seulement (au lieu de 10)
        this.startLightweightSync();
        
        const duration = performance.now() - start;
        this.performanceMetrics.settingsLoadTime = duration;
        
        console.log(`[UltraFastScan] ✅ Initialization complete in ${duration.toFixed(2)}ms`);
    }

    // ================================================
    // CHARGEMENT SETTINGS AVEC CACHE INTELLIGENT
    // ================================================
    loadSettingsUltraFast() {
        const now = Date.now();
        
        // Vérifier le cache en premier
        if (this.settingsCache.has('settings') && 
            (now - this.settingsCacheTime) < this.CACHE_DURATION) {
            const cached = this.settingsCache.get('settings');
            this.settings = cached.settings;
            this.taskPreselectedCategories = cached.taskPreselectedCategories;
            this.selectedDays = cached.selectedDays;
            return;
        }
        
        try {
            // Essayer CategoryManager en premier (plus rapide)
            if (window.categoryManager?.getSettings) {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
                
                if (this.settings.scanSettings?.defaultPeriod) {
                    this.selectedDays = this.settings.scanSettings.defaultPeriod;
                }
                
                console.log('[UltraFastScan] ✅ Settings from CategoryManager (FAST)');
            } else {
                // Fallback localStorage optimisé
                const settingsStr = localStorage.getItem('categorySettings');
                if (settingsStr) {
                    const parsed = JSON.parse(settingsStr);
                    this.settings = parsed;
                    this.taskPreselectedCategories = parsed.taskPreselectedCategories || [];
                    
                    if (parsed.scanSettings?.defaultPeriod) {
                        this.selectedDays = parsed.scanSettings.defaultPeriod;
                    }
                    
                    console.log('[UltraFastScan] ✅ Settings from localStorage (CACHED)');
                } else {
                    this.settings = this.getDefaultSettingsOptimized();
                    this.taskPreselectedCategories = [];
                }
            }
            
            // Mettre en cache
            this.settingsCache.set('settings', {
                settings: this.settings,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                selectedDays: this.selectedDays
            });
            this.settingsCacheTime = now;
            
            // Hash pour détecter les changements
            this.lastSettingsHash = this.hashSettings();
            
        } catch (error) {
            console.error('[UltraFastScan] Settings load error (using defaults):', error);
            this.settings = this.getDefaultSettingsOptimized();
            this.taskPreselectedCategories = [];
        }
    }

    getDefaultSettingsOptimized() {
        // Version allégée des settings par défaut
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

    hashSettings() {
        // Hash rapide pour détecter les changements
        const key = JSON.stringify({
            taskPreselectedCategories: this.taskPreselectedCategories,
            selectedDays: this.selectedDays,
            scanSettings: this.settings.scanSettings
        });
        
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            const char = key.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // ================================================
    // SYNCHRONISATION ULTRA-LÉGÈRE
    // ================================================
    startLightweightSync() {
        // Arrêter l'ancien interval s'il existe
        if (this.syncCheckInterval) {
            clearInterval(this.syncCheckInterval);
        }
        
        // Check toutes les 30 secondes (au lieu de 5-10)
        this.syncCheckInterval = setInterval(() => {
            this.lightweightSyncCheck();
        }, 30000);
    }

    lightweightSyncCheck() {
        // Vérification ultra-rapide avec hash
        if (!window.categoryManager?.getSettings) return;
        
        try {
            const currentCategories = window.categoryManager.getTaskPreselectedCategories() || [];
            const currentHash = this.hashArray(currentCategories);
            const oldHash = this.hashArray(this.taskPreselectedCategories);
            
            if (currentHash !== oldHash) {
                console.log('[UltraFastScan] 🔄 Settings change detected (lightweight sync)');
                
                // Invalider le cache
                this.settingsCache.clear();
                this.settingsCacheTime = 0;
                
                // Recharger
                this.loadSettingsUltraFast();
                
                // Mettre à jour l'UI seulement si nécessaire
                if (document.querySelector('.preselected-categories-display')) {
                    this.updatePreselectedCategoriesDisplay();
                }
            }
        } catch (error) {
            console.error('[UltraFastScan] Lightweight sync error:', error);
        }
    }

    hashArray(arr) {
        if (!Array.isArray(arr)) return 0;
        const str = arr.sort().join('|');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return hash;
    }

    // ================================================
    // STYLES CSS AVEC CACHE ET OPTIMISATION
    // ================================================
    addUltraFastStyles() {
        const start = performance.now();
        
        // Vérifier si déjà chargé
        if (this.stylesAdded || document.getElementById('ultra-fast-scan-styles')) {
            this.performanceMetrics.styleLoadTime = performance.now() - start;
            return;
        }
        
        // Créer et injecter en une seule opération
        const styleElement = document.createElement('style');
        styleElement.id = 'ultra-fast-scan-styles';
        styleElement.textContent = this.getOptimizedStyles();
        
        // Injection batch
        document.head.appendChild(styleElement);
        this.stylesAdded = true;
        
        const duration = performance.now() - start;
        this.performanceMetrics.styleLoadTime = duration;
        
        console.log(`[UltraFastScan] ✅ Styles injected in ${duration.toFixed(2)}ms`);
    }

    getOptimizedStyles() {
        // Styles CSS optimisés avec moins de calculs
        return `
            /* Ultra Fast Scanner v10.0 - CSS optimisé */
            .ultra-fast-scanner {
                height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                overflow: hidden;
                position: relative;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            .scanner-card-ultra-fast {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 50px;
                width: 100%;
                max-width: 700px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                transform: translateZ(0); /* Force GPU acceleration */
                will-change: transform;
            }
            
            .scanner-icon-ultra {
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
                transform: translateZ(0);
            }
            
            .scanner-title-ultra {
                font-size: 32px;
                font-weight: 600;
                color: #1a1a2e;
                margin-bottom: 12px;
                line-height: 1.2;
            }
            
            .scanner-subtitle-ultra {
                font-size: 18px;
                color: #6b7280;
                margin-bottom: 35px;
                line-height: 1.4;
            }
            
            /* Affichage catégories pré-sélectionnées optimisé */
            .preselected-categories-display {
                margin: 20px 0;
                transition: opacity 0.2s ease;
            }
            
            .preselected-info-ultra {
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
                transform: translateZ(0);
            }
            
            .preselected-info-ultra.no-selection {
                background: rgba(107, 114, 128, 0.1);
                border-color: rgba(107, 114, 128, 0.3);
                color: #6b7280;
            }
            
            .preselected-categories-grid-ultra {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
                transform: translateZ(0);
            }
            
            .preselected-category-badge-ultra {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border: 2px solid;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                transition: transform 0.2s ease;
                transform: translateZ(0);
            }
            
            .preselected-category-badge-ultra:hover {
                transform: translateY(-2px) translateZ(0);
            }
            
            /* Étapes optimisées */
            .steps-container-ultra {
                display: flex;
                justify-content: space-between;
                margin-bottom: 35px;
                padding: 0 20px;
                transform: translateZ(0);
            }
            
            .step-ultra {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                position: relative;
                transform: translateZ(0);
            }
            
            .step-ultra:not(:last-child)::after {
                content: '';
                position: absolute;
                top: 20px;
                right: -50%;
                width: 100%;
                height: 2px;
                background: #e5e7eb;
                z-index: 1;
            }
            
            .step-number-ultra {
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
                transform: translateZ(0);
            }
            
            .step-ultra.active .step-number-ultra {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                transform: scale(1.1) translateZ(0);
            }
            
            .step-label-ultra {
                font-size: 14px;
                color: #6b7280;
                text-align: center;
                max-width: 80px;
                font-weight: 500;
            }
            
            .step-ultra.active .step-label-ultra {
                color: #667eea;
                font-weight: 600;
            }
            
            /* Sélecteur de durée optimisé */
            .duration-section-ultra {
                margin-bottom: 35px;
                transform: translateZ(0);
            }
            
            .duration-label-ultra {
                font-size: 18px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 20px;
            }
            
            .duration-options-ultra {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
                transform: translateZ(0);
            }
            
            .duration-option-ultra {
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
                transform: translateZ(0);
            }
            
            .duration-option-ultra.selected {
                border-color: #667eea;
                background: #667eea;
                color: white;
                transform: translateY(-2px) translateZ(0);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .duration-option-ultra:hover:not(.selected) {
                border-color: #9ca3af;
                transform: translateY(-1px) translateZ(0);
            }
            
            /* Bouton scan ultra-optimisé */
            .scan-button-ultra {
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
                transform: translateZ(0);
                will-change: transform;
            }
            
            .scan-button-ultra:hover:not(:disabled) {
                transform: translateY(-2px) translateZ(0);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button-ultra:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: translateZ(0);
            }
            
            .scan-button-ultra::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .scan-button-ultra:hover::before {
                left: 100%;
            }
            
            /* Badge résultat optimisé */
            .success-badge-ultra {
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
                animation: badgePulse 2s ease-in-out infinite;
                transform: translateZ(0);
            }
            
            @keyframes badgePulse {
                0%, 100% { transform: scale(1) translateZ(0); }
                50% { transform: scale(1.1) translateZ(0); }
            }
            
            /* Progress optimisé */
            .progress-section-ultra {
                opacity: 0;
                transition: opacity 0.3s ease;
                margin-top: 20px;
                transform: translateZ(0);
            }
            
            .progress-section-ultra.visible {
                opacity: 1;
            }
            
            .progress-bar-ultra {
                width: 100%;
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 15px;
                transform: translateZ(0);
            }
            
            .progress-fill-ultra {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                width: 0%;
                transition: width 0.5s ease;
                transform: translateZ(0);
            }
            
            .progress-text-ultra {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .progress-status-ultra {
                font-size: 14px;
                color: #9ca3af;
            }
            
            /* Info optimisé */
            .scan-info-ultra {
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
                transform: translateZ(0);
            }
            
            .scan-info-main-ultra {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .scan-info-details-ultra {
                font-size: 12px;
                color: #8b5cf6;
                margin-top: 4px;
                text-align: center;
            }
            
            /* Responsive optimisé */
            @media (max-width: 480px) {
                .scanner-card-ultra-fast {
                    padding: 35px 25px;
                }
                
                .scanner-title-ultra {
                    font-size: 28px;
                }
                
                .scanner-subtitle-ultra {
                    font-size: 16px;
                }
                
                .duration-option-ultra {
                    padding: 10px 16px;
                    font-size: 13px;
                    min-width: 75px;
                }
            }
            
            /* Performance optimizations */
            * {
                box-sizing: border-box;
            }
            
            .ultra-fast-scanner * {
                transform-style: preserve-3d;
                backface-visibility: hidden;
            }
        `;
    }

    // ================================================
    // RENDU ULTRA-OPTIMISÉ
    // ================================================
    async render(container) {
        const start = performance.now();
        
        console.log('[UltraFastScan] 🎯 Ultra-fast render starting...');
        
        try {
            // 1. Styles d'abord (cache check)
            this.addUltraFastStyles();
            
            // 2. Settings avec cache
            this.loadSettingsUltraFast();
            
            // 3. Vérification auth ultra-rapide
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticatedOptimized();
                return;
            }

            // 4. Rendu principal optimisé
            container.innerHTML = this.renderUltraFastScanner();
            
            // 5. Events en une seule fois
            this.initializeEventsOptimized();
            
            this.isInitialized = true;
            
            const duration = performance.now() - start;
            this.performanceMetrics.renderTime = duration;
            
            console.log(`[UltraFastScan] ✅ Ultra-fast render complete in ${duration.toFixed(2)}ms`);
            
        } catch (error) {
            console.error('[UltraFastScan] ❌ Render error:', error);
            container.innerHTML = this.renderErrorOptimized(error);
        }
    }

    renderUltraFastScanner() {
        // Template string optimisé avec moins de calculs
        const preselectedHtml = this.renderPreselectedCategoriesOptimized();
        const durationHtml = this.renderDurationOptionsOptimized();
        const infoHtml = this.renderScanInfoDetailsOptimized();
        
        return `
            <div class="ultra-fast-scanner">
                <div class="scanner-card-ultra-fast">
                    <div class="scanner-icon-ultra">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <h1 class="scanner-title-ultra">Scanner Email</h1>
                    <p class="scanner-subtitle-ultra">Organisez vos emails automatiquement avec IA</p>
                    
                    <div class="preselected-categories-display">
                        ${preselectedHtml}
                    </div>
                    
                    <div class="steps-container-ultra">
                        <div class="step-ultra active" id="step1">
                            <div class="step-number-ultra">1</div>
                            <div class="step-label-ultra">Sélection</div>
                        </div>
                        <div class="step-ultra" id="step2">
                            <div class="step-number-ultra">2</div>
                            <div class="step-label-ultra">Analyse</div>
                        </div>
                        <div class="step-ultra" id="step3">
                            <div class="step-number-ultra">3</div>
                            <div class="step-label-ultra">Résultats</div>
                        </div>
                    </div>
                    
                    <div class="duration-section-ultra">
                        <div class="duration-label-ultra">Période d'analyse</div>
                        <div class="duration-options-ultra">
                            ${durationHtml}
                        </div>
                    </div>
                    
                    <button class="scan-button-ultra" id="ultraFastScanBtn">
                        <i class="fas fa-play"></i>
                        <span>Démarrer l'analyse intelligente</span>
                    </button>
                    
                    <div class="progress-section-ultra" id="progressSectionUltra">
                        <div class="progress-bar-ultra">
                            <div class="progress-fill-ultra" id="progressFillUltra"></div>
                        </div>
                        <div class="progress-text-ultra" id="progressTextUltra">Initialisation...</div>
                        <div class="progress-status-ultra" id="progressStatusUltra">Préparation du scan</div>
                    </div>
                    
                    <div class="scan-info-ultra">
                        <div class="scan-info-main-ultra">
                            <i class="fas fa-shield-alt"></i>
                            <span>Scan sécurisé et privé avec IA Claude</span>
                        </div>
                        ${infoHtml}
                    </div>
                </div>
            </div>
        `;
    }

    renderPreselectedCategoriesOptimized() {
        if (this.taskPreselectedCategories.length === 0) {
            return `
                <div class="preselected-info-ultra no-selection">
                    <i class="fas fa-info-circle"></i>
                    <span>Aucune catégorie pré-sélectionnée pour la création de tâches</span>
                </div>
            `;
        }
        
        // Batch les catégories pour éviter les appels multiples
        const categoryDetails = [];
        for (const catId of this.taskPreselectedCategories) {
            const category = window.categoryManager?.getCategory(catId);
            if (category) {
                categoryDetails.push({
                    icon: category.icon,
                    name: category.name,
                    color: category.color
                });
            }
        }
        
        const badgesHtml = categoryDetails.map(cat => `
            <div class="preselected-category-badge-ultra" style="background: ${cat.color}20; border-color: ${cat.color};">
                <span class="category-icon">${cat.icon}</span>
                <span class="category-name">${cat.name}</span>
            </div>
        `).join('');
        
        return `
            <div class="preselected-info-ultra">
                <i class="fas fa-star"></i>
                <span>Emails pré-sélectionnés pour tâches:</span>
            </div>
            <div class="preselected-categories-grid-ultra">
                ${badgesHtml}
            </div>
        `;
    }

    renderDurationOptionsOptimized() {
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
                <button class="duration-option-ultra ${isSelected ? 'selected' : ''}" 
                        data-days="${option.value}">
                    ${option.label}
                </button>
            `;
        }).join('');
    }

    renderScanInfoDetailsOptimized() {
        const details = [];
        
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
            `<div class="scan-info-details-ultra">${details.join(' • ')}</div>` :
            '<div class="scan-info-details-ultra">Configuration par défaut</div>';
    }

    renderNotAuthenticatedOptimized() {
        return `
            <div class="ultra-fast-scanner">
                <div class="scanner-card-ultra-fast">
                    <div class="scanner-icon-ultra">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h1 class="scanner-title-ultra">Connexion requise</h1>
                    <p class="scanner-subtitle-ultra">Connectez-vous pour analyser vos emails</p>
                    
                    <button class="scan-button-ultra" onclick="window.authService.login()">
                        <i class="fab fa-microsoft"></i>
                        <span>Se connecter</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderErrorOptimized(error) {
        return `
            <div class="ultra-fast-scanner">
                <div class="scanner-card-ultra-fast">
                    <div class="scanner-icon-ultra" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 class="scanner-title-ultra">Erreur</h1>
                    <p class="scanner-subtitle-ultra">${error.message}</p>
                    
                    <button class="scan-button-ultra" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // EVENTS OPTIMISÉS - DELEGATION D'EVENTS
    // ================================================
    initializeEventsOptimized() {
        // Delegation d'events pour éviter multiple listeners
        const container = document.querySelector('.ultra-fast-scanner');
        if (!container) return;
        
        // Event delegué unique pour tous les clics
        container.addEventListener('click', this.handleAllClicks.bind(this), { passive: true });
        
        console.log('[UltraFastScan] ✅ Events initialized with delegation');
    }

    handleAllClicks(event) {
        const target = event.target.closest('[data-days], #ultraFastScanBtn');
        if (!target) return;
        
        if (target.hasAttribute('data-days')) {
            // Sélection de durée
            const days = parseInt(target.dataset.days);
            this.selectDurationOptimized(days);
        } else if (target.id === 'ultraFastScanBtn') {
            // Bouton scan
            this.startScanOptimized();
        }
    }

    selectDurationOptimized(days) {
        this.selectedDays = days;
        
        // Update DOM en une seule passe
        const buttons = document.querySelectorAll('.duration-option-ultra');
        buttons.forEach(btn => {
            const btnDays = parseInt(btn.dataset.days);
            btn.classList.toggle('selected', btnDays === days);
        });
        
        console.log(`[UltraFastScan] ✅ Duration selected: ${days} days`);
    }

    updatePreselectedCategoriesDisplay() {
        const display = document.querySelector('.preselected-categories-display');
        if (!display) return;
        
        // Update en une seule opération DOM
        display.innerHTML = this.renderPreselectedCategoriesOptimized();
    }

    // ================================================
    // SCAN ULTRA-OPTIMISÉ
    // ================================================
    async startScanOptimized() {
        if (this.scanInProgress) {
            console.log('[UltraFastScan] Scan already in progress');
            return;
        }
        
        console.log('[UltraFastScan] 🚀 Starting ultra-optimized scan');
        console.log('[UltraFastScan] ⭐ Preselected categories:', this.taskPreselectedCategories);
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            // UI updates batch
            this.updateScanUIBatch({
                step: 2,
                button: { disabled: true, text: 'Analyse en cours...', icon: 'fas fa-spinner fa-spin' },
                progress: { visible: true }
            });
            
            // Options de scan optimisées
            const scanOptions = this.prepareScanOptionsOptimized();
            
            // Execution du scan
            await this.executeScanOptimized(scanOptions);
            
            // Finalisation
            this.updateScanUIBatch({
                step: 3,
                progress: { percent: 100, text: 'Scan terminé !', status: 'Analyse complète' }
            });
            
            this.completeScanOptimized();
            
        } catch (error) {
            console.error('[UltraFastScan] ❌ Scan error:', error);
            this.showScanErrorOptimized(error);
        }
    }

    updateScanUIBatch(updates) {
        // Batch toutes les mises à jour DOM
        const elements = {};
        
        if (updates.step) {
            elements.steps = document.querySelectorAll('.step-ultra');
            elements.activeStep = document.getElementById(`step${updates.step}`);
        }
        
        if (updates.button) {
            elements.button = document.getElementById('ultraFastScanBtn');
        }
        
        if (updates.progress) {
            elements.progressSection = document.getElementById('progressSectionUltra');
            elements.progressFill = document.getElementById('progressFillUltra');
            elements.progressText = document.getElementById('progressTextUltra');
            elements.progressStatus = document.getElementById('progressStatusUltra');
        }
        
        // Appliquer tous les changements en une fois
        requestAnimationFrame(() => {
            if (updates.step && elements.steps && elements.activeStep) {
                elements.steps.forEach(step => step.classList.remove('active'));
                elements.activeStep.classList.add('active');
            }
            
            if (updates.button && elements.button) {
                const btn = updates.button;
                elements.button.disabled = btn.disabled || false;
                if (btn.text && btn.icon) {
                    elements.button.innerHTML = `<i class="${btn.icon}"></i> <span>${btn.text}</span>`;
                }
                if (btn.style) {
                    Object.assign(elements.button.style, btn.style);
                }
            }
            
            if (updates.progress) {
                const prog = updates.progress;
                if (elements.progressSection && prog.visible) {
                    elements.progressSection.classList.add('visible');
                }
                if (elements.progressFill && prog.percent !== undefined) {
                    elements.progressFill.style.width = `${prog.percent}%`;
                }
                if (elements.progressText && prog.text) {
                    elements.progressText.textContent = prog.text;
                }
                if (elements.progressStatus && prog.status) {
                    elements.progressStatus.textContent = prog.status;
                }
            }
        });
    }

    prepareScanOptionsOptimized() {
        const baseOptions = {
            days: this.selectedDays,
            folder: this.settings.scanSettings?.defaultFolder || 'inbox',
            autoAnalyze: this.settings.scanSettings?.autoAnalyze !== false,
            autoCategrize: this.settings.scanSettings?.autoCategrize !== false,
            includeSpam: !this.settings.preferences?.excludeSpam,
            detectCC: this.settings.preferences?.detectCC !== false,
            onProgress: (progress) => this.updateProgressOptimized(progress)
        };
        
        if (this.taskPreselectedCategories.length > 0) {
            baseOptions.taskPreselectedCategories = [...this.taskPreselectedCategories];
        }
        
        console.log('[UltraFastScan] 📊 Optimized scan options:', baseOptions);
        return baseOptions;
    }

    async executeScanOptimized(scanOptions) {
        try {
            if (window.emailScanner?.scan) {
                console.log('[UltraFastScan] 🔄 Real scan with ultra optimizations...');
                
                const results = await window.emailScanner.scan(scanOptions);
                this.scanResults = results;
                
                console.log('[UltraFastScan] ✅ Ultra-optimized scan completed:', results);
                
                if (results.stats?.preselectedForTasks > 0) {
                    console.log(`[UltraFastScan] ⭐ ${results.stats.preselectedForTasks} emails preselected for tasks`);
                }
                
            } else {
                console.log('[UltraFastScan] 🎭 Ultra-fast simulation mode');
                
                // Simulation ultra-rapide
                const steps = [10, 25, 50, 75, 90, 100];
                for (const step of steps) {
                    this.updateProgressOptimized({
                        progress: { current: step },
                        message: `Analyse ${step}%`,
                        phase: 'Ultra-fast simulation'
                    });
                    await this.fastWait(100); // Micro délais
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
            console.error('[UltraFastScan] ❌ Execution error:', error);
            throw error;
        }
    }

    fastWait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateProgressOptimized(progress) {
        const percent = progress.progress?.current || 0;
        const text = progress.message || '';
        const status = progress.phase || '';
        
        // Batch update avec requestAnimationFrame
        requestAnimationFrame(() => {
            this.updateScanUIBatch({
                progress: { percent, text, status }
            });
        });
    }

    completeScanOptimized() {
        const duration = Date.now() - this.scanStartTime;
        this.performanceMetrics.lastScanDuration = duration;
        
        setTimeout(() => {
            const preselectedCount = this.scanResults?.stats?.preselectedForTasks || 0;
            
            this.updateScanUIBatch({
                button: {
                    text: 'Scan terminé !',
                    icon: 'fas fa-check',
                    style: { 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        position: 'relative'
                    }
                }
            });
            
            // Badge de succès si emails pré-sélectionnés
            if (preselectedCount > 0) {
                const button = document.getElementById('ultraFastScanBtn');
                if (button && !button.querySelector('.success-badge-ultra')) {
                    button.insertAdjacentHTML('beforeend', `
                        <span class="success-badge-ultra">
                            ⭐ ${preselectedCount} emails pour tâches
                        </span>
                    `);
                }
            }
            
            // Redirection après délai réduit
            setTimeout(() => {
                this.redirectToResultsOptimized();
            }, 1000); // Réduit de 1500ms à 1000ms
            
        }, 500);
    }

    redirectToResultsOptimized() {
        this.scanInProgress = false;
        
        const essentialResults = {
            success: true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            timestamp: Date.now(),
            performanceMetrics: this.performanceMetrics
        };
        
        // Storage optimisé avec try-catch
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
        } catch (error) {
            console.warn('[UltraFastScan] Storage error (continuing anyway):', error);
        }
        
        // Toast optimisé
        if (window.uiManager?.showToast) {
            const message = essentialResults.preselectedForTasks > 0 ?
                `✅ ${essentialResults.total} emails analysés • ⭐ ${essentialResults.preselectedForTasks} pré-sélectionnés` :
                `✅ ${essentialResults.total} emails analysés`;
            
            window.uiManager.showToast(message, 'success', 3000); // Réduit de 4000ms à 3000ms
        }
        
        // Redirection immédiate
        setTimeout(() => {
            if (window.pageManager?.loadPage) {
                window.pageManager.loadPage('emails');
            }
        }, 300); // Réduit de 500ms à 300ms
    }

    showScanErrorOptimized(error) {
        const progressSection = document.getElementById('progressSectionUltra');
        if (progressSection) {
            progressSection.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">Erreur de scan</div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">${error.message}</div>
                    
                    <button class="scan-button-ultra" onclick="window.ultraFastScanModule.resetScannerOptimized()" 
                            style="width: auto; padding: 0 20px; height: 40px; font-size: 14px;">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
                </div>
            `;
        }
        
        this.scanInProgress = false;
    }

    resetScannerOptimized() {
        this.scanInProgress = false;
        
        // Reset UI en batch
        this.updateScanUIBatch({
            step: 1,
            button: {
                disabled: false,
                text: 'Démarrer l\'analyse intelligente',
                icon: 'fas fa-play',
                style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
            },
            progress: { visible: false, percent: 0, text: 'Initialisation...', status: 'Préparation du scan' }
        });
        
        // Nettoyer le badge
        const badge = document.querySelector('.success-badge-ultra');
        if (badge) badge.remove();
        
        // Rafraîchir les settings et affichage
        this.settingsCache.clear();
        this.settingsCacheTime = 0;
        this.loadSettingsUltraFast();
        this.updatePreselectedCategoriesDisplay();
        
        console.log('[UltraFastScan] 🔄 Scanner reset optimized');
    }

    // ================================================
    // MISE À JOUR OPTIMISÉE DES PARAMÈTRES
    // ================================================
    updateSettingsOptimized(newSettings) {
        console.log('[UltraFastScan] 📝 Optimized settings update:', newSettings);
        
        // Invalider le cache
        this.settingsCache.clear();
        this.settingsCacheTime = 0;
        
        // Merger les settings
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.taskPreselectedCategories = [...newSettings.taskPreselectedCategories];
        }
        
        if (newSettings.scanSettings?.defaultPeriod) {
            this.selectedDays = newSettings.scanSettings.defaultPeriod;
        }
        
        // Mettre à jour le hash
        this.lastSettingsHash = this.hashSettings();
        
        // UI update seulement si visible
        if (document.querySelector('.preselected-categories-display')) {
            this.updatePreselectedCategoriesDisplay();
            
            // Mettre à jour la sélection de durée
            const buttons = document.querySelectorAll('.duration-option-ultra');
            buttons.forEach(btn => {
                const btnDays = parseInt(btn.dataset.days);
                btn.classList.toggle('selected', btnDays === this.selectedDays);
            });
        }
    }

    // ================================================
    // MÉTHODES DE DEBUG ET MÉTRIQUES
    // ================================================
    getDebugInfoOptimized() {
        return {
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            performanceMetrics: this.performanceMetrics,
            cacheStats: {
                settingsCacheSize: this.settingsCache.size,
                settingsCacheTime: this.settingsCacheTime,
                lastSettingsHash: this.lastSettingsHash
            },
            scanResults: this.scanResults
        };
    }

    getPerformanceReport() {
        const metrics = this.performanceMetrics;
        const totalTime = Object.values(metrics).reduce((sum, time) => sum + time, 0);
        
        return {
            settingsLoadTime: `${metrics.settingsLoadTime.toFixed(2)}ms`,
            styleLoadTime: `${metrics.styleLoadTime.toFixed(2)}ms`,
            renderTime: `${metrics.renderTime.toFixed(2)}ms`,
            lastScanDuration: `${(metrics.lastScanDuration / 1000).toFixed(2)}s`,
            totalInitTime: `${totalTime.toFixed(2)}ms`,
            efficiency: totalTime < 100 ? 'EXCELLENT' : totalTime < 500 ? 'GOOD' : 'NEEDS_OPTIMIZATION'
        };
    }

    // ================================================
    // NETTOYAGE OPTIMISÉ
    // ================================================
    cleanup() {
        // Arrêter les intervals
        if (this.syncCheckInterval) {
            clearInterval(this.syncCheckInterval);
            this.syncCheckInterval = null;
        }
        
        // Nettoyer les caches
        this.settingsCache.clear();
        this.settingsCacheTime = 0;
        
        // Reset des propriétés
        this.scanInProgress = false;
        this.isInitialized = false;
        this.lastSettingsHash = '';
        
        console.log('[UltraFastScan] 🧹 Optimized cleanup completed');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.performanceMetrics = {};
        console.log('[UltraFastScan] Instance destroyed');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE ULTRA-OPTIMISÉE
// ================================================
if (window.ultraFastScanModule) {
    window.ultraFastScanModule.destroy?.();
}

if (window.minimalScanModule) {
    window.minimalScanModule.destroy?.();
}

window.UltraFastScanModule = UltraFastScanModule;
window.ultraFastScanModule = new UltraFastScanModule();
window.scanStartModule = window.ultraFastScanModule; // Compatibility
window.minimalScanModule = window.ultraFastScanModule; // Compatibility

// Tests de performance ultra-rapides
window.testUltraFastScanPerformance = function() {
    console.group('🚀 TEST PERFORMANCE UltraFastScan v10.0');
    
    const module = window.ultraFastScanModule;
    
    // Test 1: Vitesse d'initialisation
    const start1 = performance.now();
    module.loadSettingsUltraFast();
    const initTime = performance.now() - start1;
    
    // Test 2: Vitesse de rendu
    const start2 = performance.now();
    const testContainer = document.createElement('div');
    module.render(testContainer);
    const renderTime = performance.now() - start2;
    
    // Test 3: Vitesse de mise à jour
    const start3 = performance.now();
    module.updateSettingsOptimized({ taskPreselectedCategories: ['tasks', 'commercial'] });
    const updateTime = performance.now() - start3;
    
    console.log(`✅ Initialization: ${initTime.toFixed(2)}ms`);
    console.log(`✅ Render: ${renderTime.toFixed(2)}ms`);
    console.log(`✅ Settings update: ${updateTime.toFixed(2)}ms`);
    console.log(`📊 Total: ${(initTime + renderTime + updateTime).toFixed(2)}ms`);
    
    const report = module.getPerformanceReport();
    console.log('📈 Performance report:', report);
    
    console.groupEnd();
    return { initTime, renderTime, updateTime, report };
};

console.log('✅ UltraFastScan v10.0 loaded - HYPER OPTIMISÉ! ⚡🚀');
