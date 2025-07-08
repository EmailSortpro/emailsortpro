// StartScan.js - Version 10.0 - Détection Gmail/Outlook automatique

console.log('[StartScan] 🚀 Loading StartScan.js v10.0 - Gmail/Outlook Detection...');

class MinimalScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        this.emailProvider = null; // 'gmail' ou 'outlook'
        
        // Intégration avec les paramètres
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        console.log('[MinimalScan] Scanner v10.0 initialized - Provider Detection');
        this.detectEmailProvider();
        this.loadSettingsFromCategoryManager();
        this.addMinimalStyles();
    }

    // ================================================
    // DÉTECTION DU FOURNISSEUR EMAIL
    // ================================================
    detectEmailProvider() {
        try {
            // Vérification des éléments spécifiques Gmail
            const gmailIndicators = [
                '.gmail_default', // div principal Gmail
                '[data-app-title="Gmail"]',
                '.nH.aqJ', // conteneur Gmail
                'div[role="main"][jsname]', // structure Gmail
                '.T-I.T-I-KE.L3' // bouton composer Gmail
            ];
            
            // Vérification des éléments spécifiques Outlook
            const outlookIndicators = [
                '[data-app-name="Mail"]',
                '.ms-FocusZone[data-app-name]',
                '[aria-label*="Outlook"]',
                '.od-SuiteNav-header',
                '[data-app-id="Mail"]'
            ];

            // Vérification URL
            const hostname = window.location.hostname.toLowerCase();
            const pathname = window.location.pathname.toLowerCase();

            // Détection par URL d'abord
            if (hostname.includes('mail.google.com') || hostname.includes('gmail.com')) {
                this.emailProvider = 'gmail';
                console.log('[MinimalScan] 📧 Gmail détecté via URL');
                return;
            }

            if (hostname.includes('outlook.office.com') || hostname.includes('outlook.live.com') || 
                hostname.includes('outlook.office365.com')) {
                this.emailProvider = 'outlook';
                console.log('[MinimalScan] 📧 Outlook détecté via URL');
                return;
            }

            // Détection par éléments DOM
            let gmailScore = 0;
            let outlookScore = 0;

            gmailIndicators.forEach(selector => {
                if (document.querySelector(selector)) {
                    gmailScore++;
                    console.log('[MinimalScan] 🔍 Gmail indicator found:', selector);
                }
            });

            outlookIndicators.forEach(selector => {
                if (document.querySelector(selector)) {
                    outlookScore++;
                    console.log('[MinimalScan] 🔍 Outlook indicator found:', selector);
                }
            });

            // Vérification meta tags et title
            const pageTitle = document.title.toLowerCase();
            if (pageTitle.includes('gmail') || pageTitle.includes('google mail')) {
                gmailScore += 2;
            }
            if (pageTitle.includes('outlook') || pageTitle.includes('office 365')) {
                outlookScore += 2;
            }

            // Détection par scripts chargés
            const scripts = Array.from(document.scripts);
            scripts.forEach(script => {
                if (script.src) {
                    if (script.src.includes('gmail') || script.src.includes('mail.google')) {
                        gmailScore++;
                    }
                    if (script.src.includes('outlook') || script.src.includes('office')) {
                        outlookScore++;
                    }
                }
            });

            // Décision finale
            if (gmailScore > outlookScore && gmailScore > 0) {
                this.emailProvider = 'gmail';
                console.log(`[MinimalScan] 📧 Gmail détecté (score: ${gmailScore} vs ${outlookScore})`);
            } else if (outlookScore > 0) {
                this.emailProvider = 'outlook';
                console.log(`[MinimalScan] 📧 Outlook détecté (score: ${outlookScore} vs ${gmailScore})`);
            } else {
                // Fallback: vérification approfondie
                this.emailProvider = this.deepProviderDetection();
            }

            // Stocker la détection
            if (this.emailProvider) {
                localStorage.setItem('detectedEmailProvider', this.emailProvider);
                console.log(`[MinimalScan] ✅ Provider détecté et sauvegardé: ${this.emailProvider}`);
            }

        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur détection provider:', error);
            
            // Fallback: essayer de récupérer depuis localStorage
            const stored = localStorage.getItem('detectedEmailProvider');
            if (stored && ['gmail', 'outlook'].includes(stored)) {
                this.emailProvider = stored;
                console.log(`[MinimalScan] 📦 Provider récupéré depuis localStorage: ${stored}`);
            } else {
                this.emailProvider = 'outlook'; // Fallback par défaut
                console.log('[MinimalScan] ⚠️ Fallback vers Outlook par défaut');
            }
        }
    }

    deepProviderDetection() {
        // Vérification approfondie si la détection simple échoue
        
        // Observer les changements DOM pour détecter les interfaces
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Vérifier les nouveaux éléments ajoutés
                            if (node.classList && (
                                node.classList.contains('gmail_default') ||
                                node.querySelector('.gmail_default')
                            )) {
                                this.emailProvider = 'gmail';
                                observer.disconnect();
                                console.log('[MinimalScan] 📧 Gmail détecté via MutationObserver');
                            }
                            
                            if (node.getAttribute && (
                                node.getAttribute('data-app-name') === 'Mail' ||
                                node.querySelector('[data-app-name="Mail"]')
                            )) {
                                this.emailProvider = 'outlook';
                                observer.disconnect();
                                console.log('[MinimalScan] 📧 Outlook détecté via MutationObserver');
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Arrêter l'observer après 5 secondes
        setTimeout(() => {
            observer.disconnect();
            if (!this.emailProvider) {
                this.emailProvider = 'outlook'; // Fallback final
                console.log('[MinimalScan] ⏰ Timeout détection, fallback vers Outlook');
            }
        }, 5000);

        return this.emailProvider;
    }

    // ================================================
    // CHARGEMENT DU BON PAGEMANAGER
    // ================================================
    async loadCorrectPageManager() {
        if (!this.emailProvider) {
            console.warn('[MinimalScan] ⚠️ Provider non détecté, utilisation d\'Outlook par défaut');
            this.emailProvider = 'outlook';
        }

        try {
            if (this.emailProvider === 'gmail') {
                await this.loadGmailPageManager();
            } else {
                await this.loadOutlookPageManager();
            }
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur chargement PageManager:', error);
            // Fallback vers PageManager général
            if (window.pageManager) {
                console.log('[MinimalScan] 📦 Utilisation PageManager existant comme fallback');
            }
        }
    }

    async loadGmailPageManager() {
        console.log('[MinimalScan] 📧 Chargement PageManager Gmail...');
        
        // Vérifier si PageManagerGmail existe déjà
        if (window.pageManagerGmail) {
            console.log('[MinimalScan] ✅ PageManagerGmail déjà disponible');
            window.pageManager = window.pageManagerGmail;
            return;
        }

        // Si le code PageManagerGmail n'est pas encore chargé, on peut soit:
        // 1. Le charger dynamiquement
        // 2. Utiliser le PageManager existant en mode Gmail
        
        if (window.PageManagerGmail) {
            console.log('[MinimalScan] 🔄 Création instance PageManagerGmail...');
            window.pageManagerGmail = new PageManagerGmail();
            window.pageManager = window.pageManagerGmail;
        } else {
            console.log('[MinimalScan] ⚠️ PageManagerGmail non disponible, configuration Gmail sur PageManager standard');
            if (window.pageManager) {
                window.pageManager.provider = 'gmail';
                window.pageManager.isGmail = true;
            }
        }
    }

    async loadOutlookPageManager() {
        console.log('[MinimalScan] 📧 Chargement PageManager Outlook...');
        
        // Utiliser le PageManager existant pour Outlook
        if (window.pageManager) {
            window.pageManager.provider = 'outlook';
            window.pageManager.isGmail = false;
            console.log('[MinimalScan] ✅ PageManager configuré pour Outlook');
        } else {
            console.warn('[MinimalScan] ⚠️ PageManager standard non disponible');
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
            /* Scanner Ultra-Minimaliste v10.0 - Gmail/Outlook */
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
            
            .minimal-scanner.gmail-mode {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
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
            
            .scanner-icon.gmail-mode {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
            }
            
            .provider-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 20px;
                padding: 6px 16px;
                font-size: 14px;
                font-weight: 600;
                color: #1e40af;
                margin-bottom: 20px;
            }
            
            .provider-badge.gmail {
                background: rgba(66, 133, 244, 0.1);
                border-color: rgba(66, 133, 244, 0.2);
                color: #1a73e8;
            }
            
            .provider-badge.outlook {
                background: rgba(0, 120, 212, 0.1);
                border-color: rgba(0, 120, 212, 0.2);
                color: #0078d4;
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
            
            .step.active.gmail-mode .step-number {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
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
            
            .step.active.gmail-mode .step-label {
                color: #1a73e8;
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
            
            .duration-option.selected.gmail-mode {
                border-color: #4285f4;
                background: #4285f4;
                box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
            }
            
            .duration-option:hover:not(.selected) {
                border-color: #9ca3af;
                transform: translateY(-1px);
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
            
            .scan-button-minimal.gmail-mode {
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
            }
            
            .scan-button-minimal:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button-minimal.gmail-mode:hover:not(:disabled) {
                box-shadow: 0 8px 25px rgba(66, 133, 244, 0.4);
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
            
            .success-badge.gmail-mode {
                background: #34a853;
                box-shadow: 0 2px 8px rgba(52, 168, 83, 0.4);
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
            
            .progress-fill.gmail-mode {
                background: linear-gradient(90deg, #4285f4 0%, #34a853 100%);
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
            
            .scan-info.gmail-mode {
                background: rgba(66, 133, 244, 0.1);
                color: #1a73e8;
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
            
            .scan-info-details.gmail-mode {
                color: #34a853;
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
        console.log('[MinimalScan] ✅ Styles v10.0 ajoutés');
    }

    async render(container) {
        console.log('[MinimalScan] 🎯 Rendu du scanner v10.0...');
        
        try {
            this.addMinimalStyles();
            this.checkSettingsUpdate();
            
            // Charger le bon PageManager
            await this.loadCorrectPageManager();
            
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            await this.checkServices();
            
            container.innerHTML = this.renderMinimalScanner();
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log('[MinimalScan] ✅ Scanner v10.0 rendu avec succès');
            
        } catch (error) {
            console.error('[MinimalScan] ❌ Erreur lors du rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderMinimalScanner() {
        const isGmail = this.emailProvider === 'gmail';
        const providerClass = isGmail ? 'gmail-mode' : '';
        const providerIcon = isGmail ? '🎯' : '📧';
        const providerName = isGmail ? 'Gmail' : 'Outlook';
        const gradientColors = isGmail ? 
            'linear-gradient(135deg, #4285f4 0%, #34a853 100%)' : 
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

        return `
            <div class="minimal-scanner ${providerClass}">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon ${providerClass}">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <div class="provider-badge ${this.emailProvider}">
                        <span>${providerIcon}</span>
                        <span>Détecté: ${providerName}</span>
                    </div>
                    
                    <h1 class="scanner-title">Scanner Email ${providerName}</h1>
                    <p class="scanner-subtitle">Organisez vos emails automatiquement avec IA</p>
                    
                    <div id="preselected-categories-display">
                        ${this.renderPreselectedCategories()}
                    </div>
                    
                    <div class="steps-container">
                        <div class="step active ${providerClass}" id="step1">
                            <div class="step-number">1</div>
                            <div class="step-label">Sélection</div>
                        </div>
                        <div class="step ${providerClass}" id="step2">
                            <div class="step-number">2</div>
                            <div class="step-label">Analyse</div>
                        </div>
                        <div class="step ${providerClass}" id="step3">
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
                    
                    <button class="scan-button-minimal ${providerClass}" id="minimalScanBtn" onclick="window.minimalScanModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Démarrer l'analyse ${providerName}</span>
                    </button>
                    
                    <div class="progress-section-minimal" id="progressSection">
                        <div class="progress-bar-minimal">
                            <div class="progress-fill ${providerClass}" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus">Préparation du scan ${providerName}</div>
                    </div>
                    
                    <div class="scan-info ${providerClass}">
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
            { value: 30, label: '30 jours' }
        ];
        
        const providerClass = this.emailProvider === 'gmail' ? 'gmail-mode' : '';
        
        return options.map(option => {
            const isSelected = option.value === this.selectedDays;
            return `
                <button class="duration-option ${isSelected ? 'selected' : ''} ${providerClass}" 
                        onclick="window.minimalScanModule.selectDuration(${option.value})" 
                        data-days="${option.value}">
                    ${option.label}
                </button>
            `;
        }).join('');
    }

    renderScanInfoDetails() {
        let details = [];
        
        // Ajouter info sur le provider détecté
        details.push(`${this.emailProvider === 'gmail' ? 'Gmail' : 'Outlook'} détecté`);
        
        if (this.taskPreselectedCategories.length > 0) {
            details.push(`${this.taskPreselectedCategories.length} catégorie(s) pour tâches automatiques`);
        }
        
        if (this.settings.scanSettings?.autoAnalyze) {
            details.push('Analyse IA activée');
        }
        
        if (this.settings.preferences?.excludeSpam) {
            details.push('Filtrage spam actif');
        }
        
        const providerClass = this.emailProvider === 'gmail' ? 'gmail-mode' : '';
        
        return details.length > 0 ? 
            `<div class="scan-info-details ${providerClass}">${details.join(' • ')}</div>` :
            `<div class="scan-info-details ${providerClass}">Configuration par défaut</div>`;
    }

    renderNotAuthenticated() {
        const isGmail = this.emailProvider === 'gmail';
        const providerName = isGmail ? 'Gmail' : 'Microsoft';
        const providerIcon = isGmail ? 'fab fa-google' : 'fab fa-microsoft';
        const gradientColors = isGmail ? 
            'linear-gradient(135deg, #4285f4 0%, #34a853 100%)' : 
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

        return `
            <div class="minimal-scanner ${isGmail ? 'gmail-mode' : ''}">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon ${isGmail ? 'gmail-mode' : ''}">
                        <i class="fas fa-lock"></i>
                    </div>
                    
                    <div class="provider-badge ${this.emailProvider}">
                        <span>${isGmail ? '🎯' : '📧'}</span>
                        <span>Provider: ${providerName}</span>
                    </div>
                    
                    <h1 class="scanner-title">Connexion ${providerName} requise</h1>
                    <p class="scanner-subtitle">Connectez-vous pour analyser vos emails ${isGmail ? 'Gmail' : 'Outlook'}</p>
                    
                    <button class="scan-button-minimal ${isGmail ? 'gmail-mode' : ''}" onclick="window.authService.login()">
                        <i class="${providerIcon}"></i>
                        <span>Se connecter à ${providerName}</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderError(error) {
        const isGmail = this.emailProvider === 'gmail';
        return `
            <div class="minimal-scanner ${isGmail ? 'gmail-mode' : ''}">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon ${isGmail ? 'gmail-mode' : ''}" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
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
        
        // Vérifier les services spécifiques au provider
        if (this.emailProvider === 'gmail') {
            if (!window.emailScannerGmail && !window.mailService) {
                console.warn('[MinimalScan] ⚠️ EmailScannerGmail non disponible');
            }
        } else {
            if (!window.mailService) {
                console.warn('[MinimalScan] ⚠️ MailService non disponible');
            }
        }
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
        
        console.log(`[MinimalScan] 🚀 Démarrage du scan ${this.emailProvider?.toUpperCase()}`);
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
                scanBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Analyse ${this.emailProvider} en cours...</span>`;
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
            provider: this.emailProvider,
            onProgress: (progress) => this.updateProgress(progress.progress?.current || 0, progress.message || '', progress.phase || '')
        };
        
        if (this.taskPreselectedCategories.length > 0) {
            baseOptions.taskPreselectedCategories = [...this.taskPreselectedCategories];
        }
        
        console.log(`[MinimalScan] 📊 Options de scan ${this.emailProvider}:`, baseOptions);
        return baseOptions;
    }

    async executeScan(scanOptions) {
        try {
            // Choisir le bon scanner selon le provider
            let scanner = null;
            
            if (this.emailProvider === 'gmail' && window.emailScannerGmail) {
                scanner = window.emailScannerGmail;
                console.log('[MinimalScan] 🎯 Utilisation EmailScannerGmail');
            } else if (window.emailScanner) {
                scanner = window.emailScanner;
                console.log('[MinimalScan] 📧 Utilisation EmailScanner standard');
            }
            
            if (scanner && typeof scanner.scan === 'function') {
                console.log(`[MinimalScan] 🔄 Scan réel ${this.emailProvider} en cours...`);
                
                const results = await scanner.scan(scanOptions);
                this.scanResults = results;
                
                console.log(`[MinimalScan] ✅ Scan ${this.emailProvider} terminé:`, results);
                
                if (results.stats?.preselectedForTasks > 0) {
                    console.log(`[MinimalScan] ⭐ ${results.stats.preselectedForTasks} emails pré-sélectionnés pour tâches`);
                }
                
            } else {
                console.log(`[MinimalScan] 🎭 Mode simulation ${this.emailProvider}`);
                
                // Simulation adaptée au provider
                for (let i = 0; i <= 100; i += 10) {
                    this.updateProgress(i, `Analyse ${this.emailProvider} ${i}%`, `Simulation ${this.emailProvider} en cours`);
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                this.scanResults = {
                    success: true,
                    total: 150,
                    categorized: 130,
                    provider: this.emailProvider,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    stats: { 
                        preselectedForTasks: this.taskPreselectedCategories.length > 0 ? 25 : 0,
                        taskSuggestions: 20
                    }
                };
            }
        } catch (error) {
            console.error(`[MinimalScan] ❌ Erreur scan ${this.emailProvider}:`, error);
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
                const providerName = this.emailProvider === 'gmail' ? 'Gmail' : 'Outlook';
                
                scanBtn.innerHTML = `<i class="fas fa-check"></i> <span>Scan ${providerName} terminé !</span>`;
                scanBtn.style.background = this.emailProvider === 'gmail' ? 
                    'linear-gradient(135deg, #34a853 0%, #4285f4 100%)' :
                    'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                
                if (preselectedCount > 0) {
                    scanBtn.style.position = 'relative';
                    const badgeClass = this.emailProvider === 'gmail' ? 'gmail-mode' : '';
                    scanBtn.insertAdjacentHTML('beforeend', `
                        <span class="success-badge ${badgeClass}">
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
            provider: this.emailProvider,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            timestamp: Date.now()
        };
        
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
        } catch (error) {
            console.warn('[MinimalScan] Erreur stockage:', error);
        }
        
        if (window.uiManager?.showToast) {
            const providerName = this.emailProvider === 'gmail' ? 'Gmail' : 'Outlook';
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
                    <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">Erreur de scan ${this.emailProvider}</div>
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
            const providerName = this.emailProvider === 'gmail' ? 'Gmail' : 'Outlook';
            const providerClass = this.emailProvider === 'gmail' ? 'gmail-mode' : '';
            
            scanBtn.disabled = false;
            scanBtn.innerHTML = `<i class="fas fa-play"></i> <span>Démarrer l'analyse ${providerName}</span>`;
            scanBtn.style.background = this.emailProvider === 'gmail' ? 
                'linear-gradient(135deg, #4285f4 0%, #34a853 100%)' :
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            scanBtn.className = `scan-button-minimal ${providerClass}`;
            
            const badge = scanBtn.querySelector('.success-badge');
            if (badge) badge.remove();
        }
        
        this.updateProgress(0, 'Initialisation...', `Préparation du scan ${this.emailProvider}`);
        
        this.loadSettingsFromCategoryManager();
        this.updatePreselectedCategoriesDisplay();
        
        console.log(`[MinimalScan] 🔄 Scanner ${this.emailProvider} réinitialisé`);
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
            emailProvider: this.emailProvider,
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            lastSettingsSync: this.lastSettingsSync,
            scanResults: this.scanResults,
            pageManagerLoaded: {
                gmail: !!window.pageManagerGmail,
                standard: !!window.pageManager
            }
        };
    }

    cleanup() {
        if (this.settingsCheckInterval) {
            clearInterval(this.settingsCheckInterval);
            this.settingsCheckInterval = null;
        }
        
        this.scanInProgress = false;
        this.isInitialized = false;
        
        console.log('[MinimalScan] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.emailProvider = null;
        console.log('[MinimalScan] Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.minimalScanModule) {
    window.minimalScanModule.destroy?.();
}

window.MinimalScanModule = MinimalScanModule;
window.minimalScanModule = new MinimalScanModule();
window.scanStartModule = window.minimalScanModule;

// Fonction de debug globale
window.debugEmailProvider = function() {
    return {
        detected: window.minimalScanModule?.emailProvider,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        debugInfo: window.minimalScanModule?.getDebugInfo()
    };
};

console.log('[StartScan] ✅ Scanner v10.0 chargé - Détection Gmail/Outlook automatique!');
console.log('[StartScan] 📧 Provider détecté:', window.minimalScanModule?.emailProvider);
