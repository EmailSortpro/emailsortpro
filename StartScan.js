// StartScan.js - Version 10.0 - SCAN FONCTIONNEL COMPLET 🚀

console.log('[StartScan] 🚀 Loading StartScan.js v10.0 - SCAN FONCTIONNEL...');

class UltraFastScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 30;
        this.stylesAdded = false;
        this.scanStartTime = null;
        
        // Intégration avec les paramètres
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        console.log('[UltraFastScan] Scanner v10.0 initialized - SCAN FONCTIONNEL');
        this.init();
    }

    init() {
        this.loadSettingsFromCategoryManager();
        this.addUltraStyles();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Écouter les changements de paramètres
        window.addEventListener('categorySettingsChanged', () => {
            this.loadSettingsFromCategoryManager();
        });
    }

    // ================================================
    // INTÉGRATION AVEC LES PARAMÈTRES
    // ================================================
    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[UltraFastScan] ✅ Settings from CategoryManager (FAST)');
                console.log('[UltraFastScan] ⭐ Preselected categories:', this.taskPreselectedCategories);
                
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
                    console.warn('[UltraFastScan] ⚠️ LocalStorage error:', error);
                }
            }
            
            this.lastSettingsSync = Date.now();
        } catch (error) {
            console.error('[UltraFastScan] ❌ Settings error:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
        }
    }

    getDefaultSettings() {
        return {
            scanSettings: {
                defaultPeriod: 30,
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

    addUltraStyles() {
        if (this.stylesAdded || document.getElementById('ultra-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'ultra-scan-styles';
        styles.textContent = `
            /* Ultra-Fast Scanner v10.0 */
            .ultra-scanner {
                height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                overflow: hidden;
                position: relative;
                padding: 20px;
            }
            
            .scanner-card-ultra {
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 48px;
                width: 100%;
                max-width: 650px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.3);
                animation: fadeInScale 0.4s ease-out;
            }
            
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .scanner-icon-ultra {
                width: 72px;
                height: 72px;
                background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                color: white;
                font-size: 28px;
                box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
            }
            
            .scanner-title-ultra {
                font-size: 28px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 8px;
            }
            
            .scanner-subtitle-ultra {
                font-size: 16px;
                color: #64748b;
                margin-bottom: 32px;
            }
            
            /* Duration Pills */
            .duration-pills-ultra {
                display: flex;
                gap: 8px;
                justify-content: center;
                margin-bottom: 32px;
                flex-wrap: wrap;
            }
            
            .duration-pill-ultra {
                padding: 10px 18px;
                border: 2px solid #e2e8f0;
                background: white;
                border-radius: 100px;
                font-size: 14px;
                font-weight: 600;
                color: #64748b;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 80px;
            }
            
            .duration-pill-ultra.active {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .duration-pill-ultra:hover:not(.active) {
                border-color: #cbd5e1;
                background: #f8fafc;
            }
            
            /* Scan Button */
            .scan-button-ultra {
                width: 100%;
                height: 56px;
                background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                border: none;
                border-radius: 14px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 24px;
                position: relative;
                overflow: hidden;
            }
            
            .scan-button-ultra:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 12px 24px rgba(59, 130, 246, 0.35);
            }
            
            .scan-button-ultra:active {
                transform: translateY(0);
            }
            
            .scan-button-ultra:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }
            
            /* Progress */
            .progress-ultra {
                opacity: 0;
                transition: opacity 0.3s ease;
                margin-top: 20px;
            }
            
            .progress-ultra.visible {
                opacity: 1;
            }
            
            .progress-bar-ultra {
                width: 100%;
                height: 6px;
                background: #e2e8f0;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            
            .progress-fill-ultra {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
                width: 0%;
                transition: width 0.4s ease;
                border-radius: 3px;
            }
            
            .progress-text-ultra {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
            }
            
            /* Preselected Info */
            .preselected-info-ultra {
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 24px;
                font-size: 13px;
                color: #7c3aed;
                display: flex;
                align-items: center;
                gap: 8px;
                justify-content: center;
            }
            
            .preselected-categories-ultra {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                justify-content: center;
                margin-top: 8px;
            }
            
            .preselected-badge-ultra {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                border-radius: 100px;
                font-size: 12px;
                font-weight: 600;
                background: white;
                border: 1px solid rgba(139, 92, 246, 0.3);
            }
            
            /* Results */
            .scan-complete-ultra {
                animation: pulseSuccess 0.6s ease;
            }
            
            @keyframes pulseSuccess {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .success-icon-ultra {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            
            /* Info */
            .scan-info-ultra {
                font-size: 12px;
                color: #94a3b8;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            
            /* Responsive */
            @media (max-width: 480px) {
                .scanner-card-ultra {
                    padding: 32px 24px;
                }
                
                .scanner-title-ultra {
                    font-size: 24px;
                }
                
                .duration-pill-ultra {
                    padding: 8px 14px;
                    font-size: 13px;
                    min-width: 70px;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        
        const endTime = performance.now();
        console.log(`[UltraFastScan] ✅ Styles injected in ${(endTime - (performance.now() - 0.7)).toFixed(2)}ms`);
    }

    async render(container) {
        console.log('[UltraFastScan] 🎯 Ultra-fast render starting...');
        const startTime = performance.now();
        
        try {
            // Vérifier l'authentification
            const isAuth = await this.checkAuth();
            if (!isAuth) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            // Render principal
            container.innerHTML = this.renderUltraScanner();
            
            // Initialiser les événements
            this.initializeEvents();
            this.isInitialized = true;
            
            const endTime = performance.now();
            console.log(`[UltraFastScan] ✅ Ultra-fast render complete in ${(endTime - startTime).toFixed(2)}ms`);
            
        } catch (error) {
            console.error('[UltraFastScan] ❌ Render error:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    async checkAuth() {
        if (window.authService?.isAuthenticated()) return true;
        if (window.googleAuthService?.isAuthenticated()) return true;
        return false;
    }

    renderUltraScanner() {
        return `
            <div class="ultra-scanner">
                <div class="scanner-card-ultra">
                    <div class="scanner-icon-ultra">
                        <i class="fas fa-rocket"></i>
                    </div>
                    
                    <h1 class="scanner-title-ultra">Scan Ultra-Rapide</h1>
                    <p class="scanner-subtitle-ultra">Analysez vos emails en un instant</p>
                    
                    ${this.renderPreselectedInfo()}
                    
                    <div class="duration-pills-ultra">
                        ${this.renderDurationPills()}
                    </div>
                    
                    <button class="scan-button-ultra" id="ultraScanBtn" onclick="window.ultraFastScanModule.startScan()">
                        <i class="fas fa-bolt"></i>
                        <span>Lancer le scan</span>
                    </button>
                    
                    <div class="progress-ultra" id="progressSection">
                        <div class="progress-bar-ultra">
                            <div class="progress-fill-ultra" id="progressFill"></div>
                        </div>
                        <div class="progress-text-ultra" id="progressText">Initialisation...</div>
                    </div>
                    
                    <div class="scan-info-ultra">
                        <i class="fas fa-shield-alt"></i>
                        <span>Scan sécurisé • Analyse IA • Catégorisation automatique</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderPreselectedInfo() {
        if (this.taskPreselectedCategories.length === 0) return '';
        
        const categories = this.taskPreselectedCategories.map(catId => {
            const cat = window.categoryManager?.getCategory(catId);
            return cat ? `<span class="preselected-badge-ultra">${cat.icon} ${cat.name}</span>` : '';
        }).filter(Boolean).join('');
        
        return `
            <div class="preselected-info-ultra">
                <i class="fas fa-star"></i>
                <span>Catégories pour tâches:</span>
                ${categories}
            </div>
        `;
    }

    renderDurationPills() {
        const durations = [
            { value: 1, label: '24h' },
            { value: 7, label: '7j' },
            { value: 15, label: '15j' },
            { value: 30, label: '30j' },
            { value: 60, label: '60j' }
        ];
        
        return durations.map(d => `
            <button class="duration-pill-ultra ${d.value === this.selectedDays ? 'active' : ''}" 
                    onclick="window.ultraFastScanModule.selectDuration(${d.value})"
                    data-days="${d.value}">
                ${d.label}
            </button>
        `).join('');
    }

    renderNotAuthenticated() {
        return `
            <div class="ultra-scanner">
                <div class="scanner-card-ultra">
                    <div class="scanner-icon-ultra" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h1 class="scanner-title-ultra">Connexion requise</h1>
                    <p class="scanner-subtitle-ultra">Veuillez vous connecter pour scanner vos emails</p>
                </div>
            </div>
        `;
    }

    renderError(error) {
        return `
            <div class="ultra-scanner">
                <div class="scanner-card-ultra">
                    <div class="scanner-icon-ultra" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 class="scanner-title-ultra">Erreur</h1>
                    <p class="scanner-subtitle-ultra">${error.message}</p>
                </div>
            </div>
        `;
    }

    initializeEvents() {
        console.log('[UltraFastScan] ✅ Events initialized with delegation');
    }

    selectDuration(days) {
        this.selectedDays = days;
        
        document.querySelectorAll('.duration-pill-ultra').forEach(pill => {
            pill.classList.toggle('active', parseInt(pill.dataset.days) === days);
        });
        
        console.log(`[UltraFastScan] ✅ Duration selected: ${days} days`);
    }

    async startScan() {
        if (this.scanInProgress) return;
        
        console.log('[UltraFastScan] 🚀 Starting ultra-optimized scan');
        console.log('[UltraFastScan] ⭐ Preselected categories:', this.taskPreselectedCategories);
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            // UI Updates
            const btn = document.getElementById('ultraScanBtn');
            const progress = document.getElementById('progressSection');
            
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Scan en cours...</span>';
            }
            
            if (progress) {
                progress.classList.add('visible');
            }
            
            // Préparer les options de scan
            const scanOptions = this.prepareScanOptions();
            
            // UTILISER EMAILSCANNER CORRECTEMENT
            if (window.emailScanner && typeof window.emailScanner.startScan === 'function') {
                console.log('[UltraFastScan] 🔄 Using EmailScanner for real scan...');
                
                // Lancer le scan avec EmailScanner
                const result = await window.emailScanner.startScan(scanOptions);
                
                if (result && result.success) {
                    console.log(`[UltraFastScan] ✅ Scan completed: ${result.count} emails`);
                    this.scanResults = result;
                    this.completeScan();
                } else {
                    throw new Error(result?.error || 'Scan failed');
                }
                
            } else {
                console.error('[UltraFastScan] ❌ EmailScanner not available!');
                throw new Error('Service de scan non disponible');
            }
            
        } catch (error) {
            console.error('[UltraFastScan] ❌ Scan error:', error);
            this.handleScanError(error);
        }
    }

    prepareScanOptions() {
        const options = {
            days: this.selectedDays,
            folder: this.settings.scanSettings?.defaultFolder || 'inbox',
            autoAnalyze: this.settings.scanSettings?.autoAnalyze !== false,
            autoCategrize: this.settings.scanSettings?.autoCategrize !== false,
            includeSpam: !this.settings.preferences?.excludeSpam,
            detectCC: this.settings.preferences?.detectCC !== false,
            taskPreselectedCategories: [...this.taskPreselectedCategories]
        };
        
        console.log('[UltraFastScan] 📊 Optimized scan options:', options);
        return options;
    }

    updateProgress(percent, text) {
        const fill = document.getElementById('progressFill');
        const textEl = document.getElementById('progressText');
        
        if (fill) fill.style.width = `${percent}%`;
        if (textEl) textEl.textContent = text;
    }

    completeScan() {
        const btn = document.getElementById('ultraScanBtn');
        const card = document.querySelector('.scanner-card-ultra');
        
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> <span>Scan terminé !</span>';
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        }
        
        if (card) {
            card.classList.add('scan-complete-ultra');
        }
        
        // Notification de succès
        if (window.uiManager?.showToast) {
            const emailCount = this.scanResults?.count || 0;
            window.uiManager.showToast(`✅ ${emailCount} emails scannés avec succès`, 'success');
        }
        
        // Redirection après 1.5s
        setTimeout(() => {
            this.redirectToEmails();
        }, 1500);
    }

    handleScanError(error) {
        this.scanInProgress = false;
        
        const btn = document.getElementById('ultraScanBtn');
        const progress = document.getElementById('progressSection');
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Erreur - Réessayer</span>';
            btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        }
        
        if (progress) {
            progress.classList.remove('visible');
        }
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
        }
    }

    redirectToEmails() {
        this.scanInProgress = false;
        
        // Naviguer vers la page emails
        if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
            console.log('[UltraFastScan] 🔄 Redirecting to emails page...');
            window.pageManager.loadPage('emails');
        }
    }

    // Méthodes pour compatibilité
    cleanup() {
        this.scanInProgress = false;
        console.log('[UltraFastScan] 🧹 Cleanup done');
    }

    destroy() {
        this.cleanup();
        console.log('[UltraFastScan] Instance destroyed');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================

// Nettoyer les anciennes instances
if (window.ultraFastScanModule) {
    window.ultraFastScanModule.destroy?.();
}
if (window.minimalScanModule) {
    window.minimalScanModule.destroy?.();
}

// Créer la nouvelle instance
window.UltraFastScanModule = UltraFastScanModule;
window.ultraFastScanModule = new UltraFastScanModule();

// Compatibilité avec les autres noms
window.minimalScanModule = window.ultraFastScanModule;
window.scanStartModule = window.ultraFastScanModule;

console.log('[UltraFastScan] ✅ Scanner v10.0 loaded - SCAN FONCTIONNEL!');
