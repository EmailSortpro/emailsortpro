// StartScan.js - Version 10.0 - ULTRA-OPTIMISÉ PERFORMANCE 🚀

console.log('[StartScan] 🚀 Loading StartScan.js v10.0 ULTRA-OPTIMISÉ...');

class UltraOptimizedScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        
        // NOUVEAU: Cache ultra-performant des paramètres
        this.settingsCache = new Map();
        this.settingsCacheTime = 0;
        this.cacheTTL = 10000; // 10 secondes
        
        // NOUVEAU: Optimisation de la synchronisation
        this.lastSettingsSync = 0;
        this.syncDebounced = this.debounce(this.syncSettings.bind(this), 300);
        this.renderDebounced = this.debounce(this.updateUIOptimized.bind(this), 150);
        
        // NOUVEAU: Performance monitoring
        this.performanceTracker = new ScanPerformanceTracker();
        this.renderMetrics = { renders: 0, avgTime: 0 };
        
        // Intégration avec les paramètres optimisée
        this.settings = this.getDefaultSettings();
        this.taskPreselectedCategories = [];
        
        console.log('[UltraOptimizedScan] Scanner v10.0 initialized - Performance révolutionnaire');
        this.initializeOptimized();
    }

    // ================================================
    // CLASSE DE MONITORING PERFORMANCE
    // ================================================
}

class ScanPerformanceTracker {
    constructor() {
        this.operations = new Map();
        this.alerts = [];
        this.thresholds = {
            settings_load: 50,
            ui_render: 100,
            scan_execution: 5000
        };
    }

    start(operation) {
        this.operations.set(operation, performance.now());
    }

    end(operation) {
        const start = this.operations.get(operation);
        if (!start) return 0;
        
        const duration = performance.now() - start;
        this.operations.delete(operation);
        
        // Alert si dépassement de seuil
        const threshold = this.thresholds[operation] || 100;
        if (duration > threshold) {
            this.alerts.push({
                operation,
                duration,
                threshold,
                timestamp: Date.now()
            });
            console.warn(`[ScanPerf] ⚠️ ${operation} lent: ${duration.toFixed(2)}ms (seuil: ${threshold}ms)`);
        }
        
        return duration;
    }

    getStats() {
        return {
            activeOperations: this.operations.size,
            recentAlerts: this.alerts.slice(-5),
            averageTimes: this.calculateAverages()
        };
    }

    calculateAverages() {
        const ops = {};
        this.alerts.forEach(alert => {
            if (!ops[alert.operation]) ops[alert.operation] = [];
            ops[alert.operation].push(alert.duration);
        });
        
        Object.keys(ops).forEach(op => {
            const times = ops[op];
            ops[op] = times.reduce((sum, time) => sum + time, 0) / times.length;
        });
        
        return ops;
    }
}

// ================================================
// INITIALISATION ULTRA-OPTIMISÉE
// ================================================
UltraOptimizedScanModule.prototype.initializeOptimized = async function() {
    this.performanceTracker.start('initialization');
    
    try {
        // Chargement asynchrone des paramètres
        await this.loadSettingsOptimized();
        
        // Styles en parallèle
        this.addOptimizedStyles();
        
        // Setup des événements optimisés
        this.setupOptimizedEventListeners();
        
        // Monitoring léger en arrière-plan
        this.startPerformanceMonitoring();
        
        this.isInitialized = true;
        
    } catch (error) {
        console.error('[UltraOptimizedScan] Erreur initialisation:', error);
    }
    
    const initTime = this.performanceTracker.end('initialization');
    console.log(`[UltraOptimizedScan] ✅ Initialisé en ${initTime.toFixed(2)}ms`);
};

// ================================================
// GESTION DES PARAMÈTRES ULTRA-OPTIMISÉE
// ================================================
UltraOptimizedScanModule.prototype.loadSettingsOptimized = async function() {
    this.performanceTracker.start('settings_load');
    
    const cacheKey = 'scan_settings';
    const now = Date.now();
    
    // Vérifier le cache en premier
    const cached = this.settingsCache.get(cacheKey);
    if (cached && (now - this.settingsCacheTime) < this.cacheTTL) {
        this.applySettingsOptimized(cached);
        this.performanceTracker.end('settings_load');
        return;
    }
    
    try {
        let newSettings = {};
        let newTaskCategories = [];
        
        // Source prioritaire: CategoryManager
        if (window.categoryManager?.getSettings) {
            newSettings = window.categoryManager.getSettings();
            newTaskCategories = window.categoryManager.getTaskPreselectedCategories?.() || [];
        } else {
            // Fallback rapide localStorage
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                newSettings = parsed;
                newTaskCategories = parsed.taskPreselectedCategories || [];
            }
        }
        
        // Mise à jour du cache
        const settingsData = { settings: newSettings, categories: newTaskCategories };
        this.settingsCache.set(cacheKey, settingsData);
        this.settingsCacheTime = now;
        
        // Application des paramètres
        this.applySettingsOptimized(settingsData);
        
        this.lastSettingsSync = now;
        
    } catch (error) {
        console.error('[UltraOptimizedScan] Erreur chargement paramètres optimisé:', error);
        this.applySettingsOptimized({ settings: this.getDefaultSettings(), categories: [] });
    }
    
    this.performanceTracker.end('settings_load');
};

UltraOptimizedScanModule.prototype.applySettingsOptimized = function(settingsData) {
    const { settings, categories } = settingsData;
    
    // Application rapide des paramètres
    this.settings = { ...this.getDefaultSettings(), ...settings };
    this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
    
    // Mise à jour de la durée par défaut
    if (this.settings.scanSettings?.defaultPeriod) {
        this.selectedDays = this.settings.scanSettings.defaultPeriod;
    }
    
    console.log(`[UltraOptimizedScan] ⚡ Paramètres appliqués: ${this.taskPreselectedCategories.length} catégories pré-sélectionnées`);
};

UltraOptimizedScanModule.prototype.getDefaultSettings = function() {
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
        },
        automationSettings: {
            autoCreateTasks: false,
            groupTasksByDomain: false,
            skipDuplicates: true
        }
    };
};

// ================================================
// SYNCHRONISATION OPTIMISÉE DES PARAMÈTRES
// ================================================
UltraOptimizedScanModule.prototype.syncSettings = function() {
    const now = Date.now();
    
    // Éviter les sync trop fréquents
    if (now - this.lastSettingsSync < 2000) return;
    
    this.performanceTracker.start('settings_sync');
    
    try {
        const oldCategories = [...this.taskPreselectedCategories];
        const oldDays = this.selectedDays;
        
        // Rechargement rapide
        this.loadSettingsOptimized().then(() => {
            // Vérifier les changements
            const categoriesChanged = this.arraysDiffer(oldCategories, this.taskPreselectedCategories);
            const daysChanged = oldDays !== this.selectedDays;
            
            if (categoriesChanged || daysChanged) {
                console.log('[UltraOptimizedScan] 🔄 Changements détectés - mise à jour UI');
                this.renderDebounced();
            }
        });
        
    } catch (error) {
        console.error('[UltraOptimizedScan] Erreur sync paramètres:', error);
    }
    
    this.performanceTracker.end('settings_sync');
};

UltraOptimizedScanModule.prototype.arraysDiffer = function(arr1, arr2) {
    if (arr1.length !== arr2.length) return true;
    return arr1.some((item, index) => item !== arr2[index]);
};

// ================================================
// ÉVÉNEMENTS OPTIMISÉS
// ================================================
UltraOptimizedScanModule.prototype.setupOptimizedEventListeners = function() {
    // Event listeners debounced pour éviter la surcharge
    this.settingsChangeHandler = this.syncDebounced;
    
    window.addEventListener('categorySettingsChanged', this.settingsChangeHandler);
    window.addEventListener('settingsChanged', this.settingsChangeHandler);
    
    // Sync périodique optimisé (moins fréquent)
    this.syncInterval = setInterval(() => {
        this.syncSettings();
    }, 15000); // 15 secondes au lieu de 5-10
    
    console.log('[UltraOptimizedScan] ✅ Event listeners optimisés configurés');
};

UltraOptimizedScanModule.prototype.startPerformanceMonitoring = function() {
    // Monitoring léger toutes les 30 secondes
    this.perfInterval = setInterval(() => {
        const stats = this.performanceTracker.getStats();
        if (stats.recentAlerts.length > 0) {
            console.log('[UltraOptimizedScan] 📊 Performance alerts:', stats.recentAlerts.length);
        }
    }, 30000);
};

// ================================================
// STYLES ULTRA-OPTIMISÉS
// ================================================
UltraOptimizedScanModule.prototype.addOptimizedStyles = function() {
    if (this.stylesAdded || document.getElementById('ultra-optimized-scan-styles')) {
        return;
    }
    
    const styles = document.createElement('style');
    styles.id = 'ultra-optimized-scan-styles';
    styles.textContent = `
        /* Scanner Ultra-Optimisé v10.0 - Performance Révolutionnaire */
        .ultra-optimized-scanner {
            height: calc(100vh - 140px);
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            overflow: hidden;
            position: relative;
            padding: 20px;
            contain: layout style paint;
        }
        
        .scanner-card-ultra {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 50px;
            width: 100%;
            max-width: 700px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: ultraFadeIn 0.3s ease-out;
            will-change: transform, opacity;
            transform: translateZ(0);
        }
        
        @keyframes ultraFadeIn {
            from {
                opacity: 0;
                transform: translateY(15px) translateZ(0);
            }
            to {
                opacity: 1;
                transform: translateY(0) translateZ(0);
            }
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
            will-change: transform;
            transform: translateZ(0);
        }
        
        .scanner-title-ultra {
            font-size: 32px;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 12px;
            font-display: swap;
        }
        
        .scanner-subtitle-ultra {
            font-size: 18px;
            color: #6b7280;
            margin-bottom: 35px;
            font-display: swap;
        }
        
        /* Affichage des catégories pré-sélectionnées OPTIMISÉ */
        #preselected-categories-display-ultra {
            margin: 20px 0;
            contain: layout style;
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
            transition: none; /* Supprimer transitions coûteuses */
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
            contain: layout;
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
            transition: transform 0.1s ease-out; /* Transition plus rapide */
            will-change: transform;
            backface-visibility: hidden;
        }
        
        .preselected-category-badge-ultra:hover {
            transform: translateY(-1px) translateZ(0); /* Plus léger */
        }
        
        /* Étapes visuelles OPTIMISÉES */
        .steps-container-ultra {
            display: flex;
            justify-content: space-between;
            margin-bottom: 35px;
            padding: 0 20px;
            contain: layout;
        }
        
        .step-ultra {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            position: relative;
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
            transition: background-color 0.2s ease; /* Optimisé */
            will-change: background-color;
        }
        
        .step-ultra.active .step-number-ultra {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .step-label-ultra {
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            max-width: 80px;
            font-weight: 500;
            font-display: swap;
        }
        
        .step-ultra.active .step-label-ultra {
            color: #667eea;
            font-weight: 600;
        }
        
        /* Sélecteur de durée OPTIMISÉ */
        .duration-section-ultra {
            margin-bottom: 35px;
            contain: layout;
        }
        
        .duration-label-ultra {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 20px;
            font-display: swap;
        }
        
        .duration-options-ultra {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
            contain: layout;
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
            transition: border-color 0.15s ease-out, transform 0.1s ease-out; /* Optimisé */
            min-width: 85px;
            position: relative;
            will-change: transform, border-color;
            backface-visibility: hidden;
        }
        
        .duration-option-ultra.selected {
            border-color: #667eea;
            background: #667eea;
            color: white;
            transform: translateY(-1px) translateZ(0); /* Léger */
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2); /* Réduit */
        }
        
        .duration-option-ultra:hover:not(.selected) {
            border-color: #9ca3af;
            transform: translateY(-0.5px) translateZ(0); /* Plus léger */
        }
        
        /* Bouton de scan ULTRA-OPTIMISÉ */
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
            transition: transform 0.15s ease-out, box-shadow 0.15s ease-out; /* Optimisé */
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 25px;
            position: relative;
            overflow: hidden;
            will-change: transform, box-shadow;
            backface-visibility: hidden;
        }
        
        .scan-button-ultra:hover:not(:disabled) {
            transform: translateY(-1px) translateZ(0); /* Plus léger */
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3); /* Réduit */
        }
        
        .scan-button-ultra:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        /* Animation de brillance optimisée */
        .scan-button-ultra::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            transition: left 0.3s ease; /* Réduit */
        }
        
        .scan-button-ultra:hover::before {
            left: 100%;
        }
        
        /* Badge de résultat OPTIMISÉ */
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
            box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3); /* Réduit */
            animation: badgePulseUltra 1.5s ease-in-out infinite; /* Plus rapide */
        }
        
        @keyframes badgePulseUltra {
            0%, 100% { 
                transform: scale(1) translateZ(0);
                box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
            }
            50% { 
                transform: scale(1.08) translateZ(0); /* Réduit */
                box-shadow: 0 3px 8px rgba(139, 92, 246, 0.4);
            }
        }
        
        /* Section de progression OPTIMISÉE */
        .progress-section-ultra {
            opacity: 0;
            transition: opacity 0.2s ease; /* Plus rapide */
            margin-top: 20px;
            contain: layout style;
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
            contain: layout;
        }
        
        .progress-fill-ultra {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.3s ease; /* Plus rapide */
            will-change: width;
        }
        
        .progress-text-ultra {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 8px;
            font-weight: 500;
            font-display: swap;
        }
        
        .progress-status-ultra {
            font-size: 14px;
            color: #9ca3af;
            font-display: swap;
        }
        
        /* Info badge OPTIMISÉ */
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
            contain: layout style;
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
            font-display: swap;
        }
        
        /* RESPONSIVE ULTRA-OPTIMISÉ */
        @media (max-width: 480px) {
            .scanner-card-ultra {
                padding: 35px 25px;
            }
            
            .scanner-title-ultra {
                font-size: 28px;
            }
            
            .scanner-subtitle-ultra {
                font-size: 16px;
            }
            
            .preselected-categories-grid-ultra {
                gap: 6px;
            }
            
            .preselected-category-badge-ultra {
                font-size: 12px;
                padding: 6px 10px;
            }
            
            .duration-option-ultra {
                padding: 10px 16px;
                font-size: 13px;
                min-width: 75px;
            }
        }
        
        /* OPTIMISATIONS GPU SPÉCIFIQUES */
        .scanner-card-ultra,
        .scan-button-ultra,
        .duration-option-ultra,
        .preselected-category-badge-ultra {
            transform: translateZ(0);
            backface-visibility: hidden;
        }
        
        /* Désactiver les transitions sur mobile pour performance */
        @media (max-width: 768px) {
            .duration-option-ultra,
            .scan-button-ultra,
            .preselected-category-badge-ultra {
                transition: none;
            }
        }
    `;
    
    document.head.appendChild(styles);
    this.stylesAdded = true;
    console.log('[UltraOptimizedScan] ✅ Styles ultra-optimisés v10.0 ajoutés');
};

// ================================================
// RENDU ULTRA-OPTIMISÉ
// ================================================
UltraOptimizedScanModule.prototype.render = async function(container) {
    console.log('[UltraOptimizedScan] 🎯 Rendu ultra-optimisé v10.0...');
    
    this.performanceTracker.start('ui_render');
    
    try {
        // Styles en parallèle si nécessaire
        this.addOptimizedStyles();
        
        // Synchronisation rapide des paramètres
        await this.loadSettingsOptimized();
        
        // Vérifications rapides
        if (!window.authService?.isAuthenticated()) {
            container.innerHTML = this.renderNotAuthenticatedOptimized();
            this.performanceTracker.end('ui_render');
            return;
        }

        await this.checkServicesOptimized();
        
        // Rendu principal optimisé
        container.innerHTML = this.renderUltraOptimizedScanner();
        this.initializeEventsOptimized();
        this.isInitialized = true;
        
        const renderTime = this.performanceTracker.end('ui_render');
        console.log(`[UltraOptimizedScan] ✅ Rendu terminé en ${renderTime.toFixed(2)}ms`);
        
    } catch (error) {
        console.error('[UltraOptimizedScan] ❌ Erreur lors du rendu optimisé:', error);
        container.innerHTML = this.renderErrorOptimized(error);
        this.performanceTracker.end('ui_render');
    }
};

UltraOptimizedScanModule.prototype.renderUltraOptimizedScanner = function() {
    return `
        <div class="ultra-optimized-scanner">
            <div class="scanner-card-ultra">
                <div class="scanner-icon-ultra">
                    <i class="fas fa-search"></i>
                </div>
                
                <h1 class="scanner-title-ultra">Scanner Email</h1>
                <p class="scanner-subtitle-ultra">Organisez vos emails automatiquement avec IA</p>
                
                <div id="preselected-categories-display-ultra">
                    ${this.renderPreselectedCategoriesOptimized()}
                </div>
                
                <div class="steps-container-ultra">
                    <div class="step-ultra active" id="step1Ultra">
                        <div class="step-number-ultra">1</div>
                        <div class="step-label-ultra">Sélection</div>
                    </div>
                    <div class="step-ultra" id="step2Ultra">
                        <div class="step-number-ultra">2</div>
                        <div class="step-label-ultra">Analyse</div>
                    </div>
                    <div class="step-ultra" id="step3Ultra">
                        <div class="step-number-ultra">3</div>
                        <div class="step-label-ultra">Résultats</div>
                    </div>
                </div>
                
                <div class="duration-section-ultra">
                    <div class="duration-label-ultra">Période d'analyse</div>
                    <div class="duration-options-ultra">
                        ${this.renderDurationOptionsOptimized()}
                    </div>
                </div>
                
                <button class="scan-button-ultra" id="ultraScanBtn" onclick="window.ultraOptimizedScanModule.startUltraScan()">
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
                    ${this.renderScanInfoDetailsOptimized()}
                </div>
            </div>
        </div>
    `;
};

UltraOptimizedScanModule.prototype.renderPreselectedCategoriesOptimized = function() {
    if (this.taskPreselectedCategories.length === 0) {
        return `
            <div class="preselected-info-ultra no-selection">
                <i class="fas fa-info-circle"></i>
                <span>Aucune catégorie pré-sélectionnée pour la création de tâches</span>
            </div>
        `;
    }
    
    // Cache des détails de catégories pour éviter les appels répétés
    const categoryDetails = this.getCachedCategoryDetails();
    
    return `
        <div class="preselected-info-ultra">
            <i class="fas fa-star"></i>
            <span>Emails pré-sélectionnés pour tâches:</span>
        </div>
        <div class="preselected-categories-grid-ultra">
            ${categoryDetails.map(cat => `
                <div class="preselected-category-badge-ultra" style="background: ${cat.color}20; border-color: ${cat.color};">
                    <span class="category-icon">${cat.icon}</span>
                    <span class="category-name">${cat.name}</span>
                </div>
            `).join('')}
        </div>
    `;
};

UltraOptimizedScanModule.prototype.getCachedCategoryDetails = function() {
    const cacheKey = `category_details_${this.taskPreselectedCategories.join('|')}`;
    
    if (this.settingsCache.has(cacheKey)) {
        return this.settingsCache.get(cacheKey);
    }
    
    const details = this.taskPreselectedCategories.map(catId => {
        const category = window.categoryManager?.getCategory(catId);
        return category ? { 
            icon: category.icon, 
            name: category.name, 
            color: category.color 
        } : null;
    }).filter(Boolean);
    
    this.settingsCache.set(cacheKey, details);
    return details;
};

UltraOptimizedScanModule.prototype.renderDurationOptionsOptimized = function() {
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
                    onclick="window.ultraOptimizedScanModule.selectDurationOptimized(${option.value})" 
                    data-days="${option.value}">
                ${option.label}
            </button>
        `;
    }).join('');
};

UltraOptimizedScanModule.prototype.renderScanInfoDetailsOptimized = function() {
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
};

// ================================================
// MISE À JOUR UI ULTRA-OPTIMISÉE
// ================================================
UltraOptimizedScanModule.prototype.updateUIOptimized = function() {
    this.performanceTracker.start('ui_update');
    
    // Mise à jour batch des éléments
    requestAnimationFrame(() => {
        this.updateDurationSelectionOptimized();
        this.updatePreselectedCategoriesOptimized();
        
        const updateTime = this.performanceTracker.end('ui_update');
        console.log(`[UltraOptimizedScan] ⚡ UI mise à jour en ${updateTime.toFixed(2)}ms`);
    });
};

UltraOptimizedScanModule.prototype.updateDurationSelectionOptimized = function() {
    const options = document.querySelectorAll('.duration-option-ultra');
    options.forEach(option => {
        const days = parseInt(option.dataset.days);
        option.classList.toggle('selected', days === this.selectedDays);
    });
};

UltraOptimizedScanModule.prototype.updatePreselectedCategoriesOptimized = function() {
    const display = document.getElementById('preselected-categories-display-ultra');
    if (display) {
        display.innerHTML = this.renderPreselectedCategoriesOptimized();
    }
};

// ================================================
// INTERACTIONS OPTIMISÉES
// ================================================
UltraOptimizedScanModule.prototype.selectDurationOptimized = function(days) {
    this.selectedDays = days;
    
    // Mise à jour DOM optimisée
    requestAnimationFrame(() => {
        this.updateDurationSelectionOptimized();
    });
    
    console.log(`[UltraOptimizedScan] ✅ Durée sélectionnée: ${days} jours`);
};

UltraOptimizedScanModule.prototype.initializeEventsOptimized = function() {
    console.log('[UltraOptimizedScan] ✅ Événements ultra-optimisés initialisés');
    
    // Pas de polling fréquent, seulement les événements nécessaires
    if (this.eventCheckInterval) {
        clearInterval(this.eventCheckInterval);
    }
    
    // Check moins fréquent
    this.eventCheckInterval = setInterval(() => {
        this.syncSettings();
    }, 20000); // 20 secondes
};

// ================================================
// SCAN ULTRA-OPTIMISÉ
//
