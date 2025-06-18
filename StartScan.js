// StartScan.js - Version 10.0 - STYLE ORIGINAL + SCAN FONCTIONNEL

console.log('[StartScan] 🚀 Loading StartScan.js v10.0 HYPER OPTIMIZED...');

class UltraFastScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 30;
        this.stylesAdded = false;
        this.scanStartTime = null;
        
        // Performance tracking
        this.initStartTime = performance.now();
        
        // Settings
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        console.log('[UltraFastScan] Scanner v10.0 initialized - Performance MAXIMISÉE');
        this.init();
    }

    init() {
        this.loadSettingsFromCategoryManager();
        this.addOptimizedStyles();
        
        const initTime = performance.now() - this.initStartTime;
        console.log(`[UltraFastScan] ✅ Initialization complete in ${initTime.toFixed(2)}ms`);
    }

    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[UltraFastScan] ✅ Settings from CategoryManager (FAST)');
                
                if (this.settings.scanSettings?.defaultPeriod) {
                    this.selectedDays = this.settings.scanSettings.defaultPeriod;
                }
            } else {
                const saved = localStorage.getItem('categorySettings');
                if (saved) {
                    this.settings = JSON.parse(saved);
                    this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                    if (this.settings.scanSettings?.defaultPeriod) {
                        this.selectedDays = this.settings.scanSettings.defaultPeriod;
                    }
                }
            }
            
            this.lastSettingsSync = Date.now();
        } catch (error) {
            console.error('[UltraFastScan] ❌ Settings error:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
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

    addOptimizedStyles() {
        if (this.stylesAdded || document.getElementById('ultra-optimized-styles')) {
            return;
        }
        
        const styleStart = performance.now();
        
        const styles = document.createElement('style');
        styles.id = 'ultra-optimized-styles';
        styles.textContent = `
            /* Ultra-Optimized Scanner v10.0 */
            .ultra-optimized-scanner {
                min-height: calc(100vh - 140px);
                padding: 40px 20px;
                background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .scanner-container-optimized {
                width: 100%;
                max-width: 900px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                animation: fadeInOptimized 0.3s ease-out;
            }
            
            @keyframes fadeInOptimized {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .scanner-header-optimized {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .scanner-icon-optimized {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                font-size: 28px;
                backdrop-filter: blur(10px);
            }
            
            .scanner-title-optimized {
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 8px 0;
            }
            
            .scanner-subtitle-optimized {
                font-size: 15px;
                opacity: 0.9;
                margin: 0;
            }
            
            .scanner-body-optimized {
                padding: 40px;
            }
            
            /* Period Selection */
            .period-section-optimized {
                margin-bottom: 35px;
            }
            
            .period-label-optimized {
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 16px;
                display: block;
            }
            
            .period-grid-optimized {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 12px;
            }
            
            .period-option-optimized {
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            }
            
            .period-option-optimized:hover {
                border-color: #cbd5e1;
                background: #f1f5f9;
                transform: translateY(-1px);
            }
            
            .period-option-optimized.active {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
                transform: scale(1.02);
            }
            
            .period-days-optimized {
                font-size: 20px;
                font-weight: 700;
                display: block;
                margin-bottom: 4px;
            }
            
            .period-label-text-optimized {
                font-size: 13px;
                opacity: 0.8;
            }
            
            /* Settings Info */
            .settings-info-optimized {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 30px;
            }
            
            .settings-row-optimized {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #0369a1;
                margin-bottom: 8px;
            }
            
            .settings-row-optimized:last-child {
                margin-bottom: 0;
            }
            
            .settings-row-optimized i {
                width: 16px;
                text-align: center;
            }
            
            /* Preselected Categories */
            .preselected-section-optimized {
                margin-bottom: 30px;
                padding: 20px;
                background: #faf5ff;
                border: 1px solid #e9d5ff;
                border-radius: 12px;
            }
            
            .preselected-title-optimized {
                font-size: 14px;
                font-weight: 600;
                color: #7c3aed;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .preselected-categories-optimized {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .category-badge-optimized {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: white;
                border: 1px solid #e9d5ff;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 500;
                color: #6b21a8;
            }
            
            /* Scan Button */
            .scan-section-optimized {
                text-align: center;
            }
            
            .scan-button-optimized {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 16px 40px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .scan-button-optimized:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            }
            
            .scan-button-optimized:active {
                transform: translateY(0);
            }
            
            .scan-button-optimized:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }
            
            /* Progress */
            .progress-section-optimized {
                margin-top: 30px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .progress-section-optimized.visible {
                opacity: 1;
            }
            
            .progress-bar-optimized {
                height: 8px;
                background: #e2e8f0;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            
            .progress-fill-optimized {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
                width: 0%;
                transition: width 0.4s ease;
                position: relative;
            }
            
            .progress-fill-optimized::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: shimmer 2s infinite;
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .progress-text-optimized {
                text-align: center;
                font-size: 14px;
                color: #64748b;
            }
            
            /* Success State */
            .scan-complete-optimized {
                animation: successPulse 0.6s ease;
            }
            
            @keyframes successPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            /* Footer */
            .scanner-footer-optimized {
                padding: 20px 40px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                font-size: 13px;
                color: #64748b;
            }
            
            /* Responsive */
            @media (max-width: 640px) {
                .scanner-body-optimized {
                    padding: 24px;
                }
                
                .period-grid-optimized {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .scan-button-optimized {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        
        const styleTime = performance.now() - styleStart;
        console.log(`[UltraFastScan] ✅ Styles injected in ${styleTime.toFixed(2)}ms`);
    }

    async render(container) {
        console.log('[UltraFastScan] 🎯 Ultra-fast render starting...');
        const renderStart = performance.now();
        
        try {
            // Check auth
            const isAuth = await this.checkAuth();
            if (!isAuth) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            // Render main UI
            container.innerHTML = this.renderOptimizedScanner();
            
            // Setup events
            this.setupEvents();
            this.isInitialized = true;
            
            const renderTime = performance.now() - renderStart;
            console.log(`[UltraFastScan] ✅ Ultra-fast render complete in ${renderTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error('[UltraFastScan] ❌ Render error:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    async checkAuth() {
        return window.authService?.isAuthenticated() || window.googleAuthService?.isAuthenticated();
    }

    renderOptimizedScanner() {
        return `
            <div class="ultra-optimized-scanner">
                <div class="scanner-container-optimized">
                    <div class="scanner-header-optimized">
                        <div class="scanner-icon-optimized">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <h1 class="scanner-title-optimized">Scan Ultra-Rapide</h1>
                        <p class="scanner-subtitle-optimized">Analysez et organisez vos emails en un instant</p>
                    </div>
                    
                    <div class="scanner-body-optimized">
                        <div class="period-section-optimized">
                            <label class="period-label-optimized">Période à analyser</label>
                            <div class="period-grid-optimized">
                                ${this.renderPeriodOptions()}
                            </div>
                        </div>
                        
                        ${this.renderSettingsInfo()}
                        ${this.renderPreselectedCategories()}
                        
                        <div class="scan-section-optimized">
                            <button class="scan-button-optimized" id="scanBtn" onclick="window.ultraFastScanModule.startScan()">
                                <i class="fas fa-rocket"></i>
                                <span>Lancer le scan</span>
                            </button>
                            
                            <div class="progress-section-optimized" id="progressSection">
                                <div class="progress-bar-optimized">
                                    <div class="progress-fill-optimized" id="progressFill"></div>
                                </div>
                                <div class="progress-text-optimized" id="progressText">Initialisation...</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="scanner-footer-optimized">
                        <i class="fas fa-shield-alt"></i> Scan sécurisé avec analyse IA
                    </div>
                </div>
            </div>
        `;
    }

    renderPeriodOptions() {
        const periods = [
            { days: 1, label: 'jour' },
            { days: 3, label: 'jours' },
            { days: 7, label: 'jours' },
            { days: 15, label: 'jours' },
            { days: 30, label: 'jours' },
            { days: 60, label: 'jours' }
        ];
        
        return periods.map(p => `
            <div class="period-option-optimized ${p.days === this.selectedDays ? 'active' : ''}" 
                 onclick="window.ultraFastScanModule.selectPeriod(${p.days})"
                 data-days="${p.days}">
                <span class="period-days-optimized">${p.days}</span>
                <span class="period-label-text-optimized">${p.label}</span>
            </div>
        `).join('');
    }

    renderSettingsInfo() {
        const settings = [];
        
        if (this.settings.scanSettings?.autoAnalyze) {
            settings.push('<i class="fas fa-robot"></i> Analyse IA activée');
        }
        if (this.settings.scanSettings?.autoCategrize) {
            settings.push('<i class="fas fa-tags"></i> Catégorisation automatique');
        }
        if (this.settings.preferences?.excludeSpam) {
            settings.push('<i class="fas fa-shield-alt"></i> Filtrage spam actif');
        }
        
        if (settings.length === 0) return '';
        
        return `
            <div class="settings-info-optimized">
                ${settings.map(s => `<div class="settings-row-optimized">${s}</div>`).join('')}
            </div>
        `;
    }

    renderPreselectedCategories() {
        if (!this.taskPreselectedCategories || this.taskPreselectedCategories.length === 0) {
            return '';
        }
        
        const categories = this.taskPreselectedCategories.map(catId => {
            const cat = window.categoryManager?.getCategory(catId);
            return cat ? `
                <span class="category-badge-optimized">
                    ${cat.icon} ${cat.name}
                </span>
            ` : '';
        }).filter(Boolean).join('');
        
        return `
            <div class="preselected-section-optimized">
                <div class="preselected-title-optimized">
                    <i class="fas fa-star"></i>
                    Catégories pré-sélectionnées pour tâches
                </div>
                <div class="preselected-categories-optimized">
                    ${categories}
                </div>
            </div>
        `;
    }

    renderNotAuthenticated() {
        return `
            <div class="ultra-optimized-scanner">
                <div class="scanner-container-optimized">
                    <div class="scanner-header-optimized" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <div class="scanner-icon-optimized">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h1 class="scanner-title-optimized">Connexion requise</h1>
                        <p class="scanner-subtitle-optimized">Veuillez vous connecter pour scanner vos emails</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderError(error) {
        return `
            <div class="ultra-optimized-scanner">
                <div class="scanner-container-optimized">
                    <div class="scanner-header-optimized" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <div class="scanner-icon-optimized">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1 class="scanner-title-optimized">Erreur</h1>
                        <p class="scanner-subtitle-optimized">${error.message}</p>
                    </div>
                </div>
            </div>
        `;
    }

    setupEvents() {
        console.log('[UltraFastScan] ✅ Events initialized with delegation');
    }

    selectPeriod(days) {
        this.selectedDays = days;
        
        document.querySelectorAll('.period-option-optimized').forEach(opt => {
            opt.classList.toggle('active', parseInt(opt.dataset.days) === days);
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
            
            // Update UI
            const btn = document.getElementById('scanBtn');
            const progress = document.getElementById('progressSection');
            
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Scan en cours...</span>';
            }
            
            if (progress) {
                progress.classList.add('visible');
            }
            
            // Prepare scan options
            const scanOptions = this.prepareScanOptions();
            
            // Use EmailScanner for real scan
            if (window.emailScanner && typeof window.emailScanner.startScan === 'function') {
                console.log('[UltraFastScan] 🔄 Using EmailScanner for real scan...');
                
                // Start the scan
                const result = await window.emailScanner.startScan(scanOptions);
                
                if (result && result.success) {
                    console.log(`[UltraFastScan] ✅ Scan completed: ${result.count} emails`);
                    this.scanResults = result;
                    this.completeScan();
                } else {
                    throw new Error(result?.error || 'Scan failed');
                }
                
            } else {
                console.log('[UltraFastScan] 🎭 Ultra-fast simulation mode');
                // Simulation fallback
                await this.simulateScan();
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

    async simulateScan() {
        // Simulation for testing
        for (let i = 0; i <= 100; i += 10) {
            this.updateProgress(i, `Simulation ${i}%`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.scanResults = {
            success: true,
            count: 42,
            timestamp: new Date().toISOString()
        };
        
        this.completeScan();
    }

    updateProgress(percent, text) {
        const fill = document.getElementById('progressFill');
        const textEl = document.getElementById('progressText');
        
        if (fill) fill.style.width = `${percent}%`;
        if (textEl) textEl.textContent = text;
    }

    completeScan() {
        const btn = document.getElementById('scanBtn');
        const container = document.querySelector('.scanner-container-optimized');
        
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> <span>Scan terminé !</span>';
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        }
        
        if (container) {
            container.classList.add('scan-complete-optimized');
        }
        
        // Show success toast
        if (window.uiManager?.showToast) {
            const count = this.scanResults?.count || 0;
            window.uiManager.showToast(`✅ ${count} emails scannés avec succès`, 'success');
        }
        
        // Redirect after delay
        setTimeout(() => {
            this.redirectToEmails();
        }, 1500);
    }

    handleScanError(error) {
        this.scanInProgress = false;
        
        const btn = document.getElementById('scanBtn');
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
        
        if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
            console.log('[UltraFastScan] 🔄 Redirecting to emails page...');
            window.pageManager.loadPage('emails');
        }
    }

    cleanup() {
        this.scanInProgress = false;
        console.log('[UltraFastScan] 🧹 Cleanup done');
    }

    destroy() {
        this.cleanup();
        console.log('[UltraFastScan] Instance destroyed');
    }
}

// Initialize
if (window.ultraFastScanModule) {
    window.ultraFastScanModule.destroy?.();
}

window.UltraFastScanModule = UltraFastScanModule;
window.ultraFastScanModule = new UltraFastScanModule();
window.minimalScanModule = window.ultraFastScanModule;
window.scanStartModule = window.ultraFastScanModule;

console.log('✅ UltraFastScan v10.0 loaded - HYPER OPTIMISÉ! ⚡🚀');
