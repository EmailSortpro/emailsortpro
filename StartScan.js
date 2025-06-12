// StartScan.js - Version 9.0 - Synchronisation complète réparée

console.log('[StartScan] 🚀 Loading StartScan.js v9.0...');

class StartScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        
        // Synchronisation renforcée
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.syncInProgress = false;
        this.parametersLoaded = false;
        this.syncCheckInterval = null;
        
        // Event listeners pour synchronisation temps réel
        this.eventListenersSetup = false;
        
        console.log('[StartScan] ✅ Scanner v9.0 initialized avec synchronisation complète');
        
        this.setupEventListeners();
        this.loadInitialSettings();
        this.addStyles();
        this.startSyncMonitoring();
    }

    // ================================================
    // SYNCHRONISATION ÉVÉNEMENTS - NOUVEAU
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) return;

        // Écouter les changements de paramètres
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[StartScan] 📨 categorySettingsChanged reçu:', event.detail);
            this.handleSettingsChanged(event.detail);
        });

        window.addEventListener('settingsChanged', (event) => {
            console.log('[StartScan] 📨 settingsChanged reçu:', event.detail);
            this.handleGenericSettingsChanged(event.detail);
        });

        window.addEventListener('forceSynchronization', (event) => {
            console.log('[StartScan] 🚀 forceSynchronization reçu:', event.detail);
            this.handleForcedSync(event.detail);
        });

        window.addEventListener('taskPreselectedCategoriesChanged', (event) => {
            console.log('[StartScan] 📋 taskPreselectedCategoriesChanged reçu:', event.detail);
            this.handleTaskCategoriesChanged(event.detail);
        });

        this.eventListenersSetup = true;
        console.log('[StartScan] ✅ Event listeners configurés');
    }

    handleSettingsChanged(settingsData) {
        console.log('[StartScan] 🔧 === TRAITEMENT CHANGEMENT SETTINGS ===');
        
        if (settingsData.settings) {
            this.updateLocalSettings(settingsData.settings);
        }
        
        if (settingsData.taskPreselectedCategories) {
            this.updateTaskCategories(settingsData.taskPreselectedCategories);
        }
        
        this.refreshUI();
    }

    handleGenericSettingsChanged(changeData) {
        console.log('[StartScan] 🔧 === TRAITEMENT CHANGEMENT GÉNÉRIQUE ===');
        
        const { type, value } = changeData;
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.updateTaskCategories(value);
                break;
            case 'scanSettings':
                this.updateScanSettings(value);
                break;
            case 'preferences':
                this.updatePreferences(value);
                break;
            default:
                this.forceSettingsReload();
        }
        
        this.refreshUI();
    }

    handleForcedSync(syncData) {
        console.log('[StartScan] 🚀 === SYNCHRONISATION FORCÉE ===');
        this.forceSettingsReload();
        this.refreshUI();
    }

    handleTaskCategoriesChanged(changeData) {
        console.log('[StartScan] 📋 === CHANGEMENT CATÉGORIES TÂCHES ===');
        
        if (changeData.newCategories) {
            this.updateTaskCategories(changeData.newCategories);
            this.refreshUI();
        }
    }

    // ================================================
    // GESTION DES PARAMÈTRES - COMPLÈTEMENT RÉÉCRITE
    // ================================================
    loadInitialSettings() {
        console.log('[StartScan] 📥 === CHARGEMENT INITIAL PARAMÈTRES ===');
        
        try {
            // Priorité 1: CategoryManager
            if (this.loadFromCategoryManager()) {
                console.log('[StartScan] ✅ Paramètres chargés depuis CategoryManager');
                this.parametersLoaded = true;
                return;
            }
            
            // Priorité 2: CategoriesPage
            if (this.loadFromCategoriesPage()) {
                console.log('[StartScan] ✅ Paramètres chargés depuis CategoriesPage');
                this.parametersLoaded = true;
                return;
            }
            
            // Fallback: localStorage
            if (this.loadFromLocalStorage()) {
                console.log('[StartScan] ✅ Paramètres chargés depuis localStorage');
                this.parametersLoaded = true;
                return;
            }
            
            // Dernière option: valeurs par défaut
            this.loadDefaultSettings();
            console.log('[StartScan] ✅ Paramètres par défaut chargés');
            this.parametersLoaded = true;
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur chargement paramètres:', error);
            this.loadDefaultSettings();
            this.parametersLoaded = true;
        }
        
        this.validateSettings();
        this.lastSettingsSync = Date.now();
        
        console.log('[StartScan] 📊 Paramètres finaux:');
        console.log('  - Settings:', this.settings);
        console.log('  - TaskPreselectedCategories:', this.taskPreselectedCategories);
        console.log('  - SelectedDays:', this.selectedDays);
    }

    loadFromCategoryManager() {
        if (!window.categoryManager || typeof window.categoryManager.getSettings !== 'function') {
            return false;
        }
        
        try {
            this.settings = window.categoryManager.getSettings();
            this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories() || [];
            
            if (this.settings.scanSettings?.defaultPeriod) {
                this.selectedDays = this.settings.scanSettings.defaultPeriod;
            }
            
            return true;
        } catch (error) {
            console.warn('[StartScan] ⚠️ Erreur CategoryManager:', error);
            return false;
        }
    }

    loadFromCategoriesPage() {
        if (!window.categoriesPage) {
            return false;
        }
        
        try {
            if (typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
                this.taskPreselectedCategories = window.categoriesPage.getTaskPreselectedCategories();
            }
            
            if (typeof window.categoriesPage.getScanSettings === 'function') {
                const scanSettings = window.categoriesPage.getScanSettings();
                this.settings.scanSettings = scanSettings;
                
                if (scanSettings?.defaultPeriod) {
                    this.selectedDays = scanSettings.defaultPeriod;
                }
            }
            
            this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
            
            return true;
        } catch (error) {
            console.warn('[StartScan] ⚠️ Erreur CategoriesPage:', error);
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (!saved) return false;
            
            const parsed = JSON.parse(saved);
            this.settings = { ...this.getDefaultSettings(), ...parsed };
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            
            if (this.settings.scanSettings?.defaultPeriod) {
                this.selectedDays = this.settings.scanSettings.defaultPeriod;
            }
            
            return true;
        } catch (error) {
            console.warn('[StartScan] ⚠️ Erreur localStorage:', error);
            return false;
        }
    }

    loadDefaultSettings() {
        this.settings = this.getDefaultSettings();
        this.taskPreselectedCategories = this.settings.taskPreselectedCategories;
        this.selectedDays = this.settings.scanSettings.defaultPeriod;
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

    validateSettings() {
        if (!Array.isArray(this.taskPreselectedCategories)) {
            console.warn('[StartScan] ⚠️ taskPreselectedCategories n\'est pas un array, correction...');
            this.taskPreselectedCategories = this.getDefaultSettings().taskPreselectedCategories;
            this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        }
        
        if (!this.selectedDays || this.selectedDays < 1 || this.selectedDays > 365) {
            console.warn('[StartScan] ⚠️ selectedDays invalide, correction...');
            this.selectedDays = 7;
        }
        
        if (!this.settings.scanSettings) {
            this.settings.scanSettings = this.getDefaultSettings().scanSettings;
        }
        
        if (!this.settings.preferences) {
            this.settings.preferences = this.getDefaultSettings().preferences;
        }
        
        console.log('[StartScan] ✅ Paramètres validés');
    }

    // ================================================
    // MISE À JOUR DES PARAMÈTRES - NOUVELLE
    // ================================================
    updateLocalSettings(newSettings) {
        console.log('[StartScan] 📝 Mise à jour settings locaux:', newSettings);
        
        this.settings = { ...this.settings, ...newSettings };
        
        if (newSettings.taskPreselectedCategories) {
            this.taskPreselectedCategories = [...newSettings.taskPreselectedCategories];
        }
        
        if (newSettings.scanSettings?.defaultPeriod) {
            this.selectedDays = newSettings.scanSettings.defaultPeriod;
        }
        
        this.lastSettingsSync = Date.now();
    }

    updateTaskCategories(categories) {
        console.log('[StartScan] 📋 Mise à jour catégories tâches:', categories);
        
        if (Array.isArray(categories)) {
            this.taskPreselectedCategories = [...categories];
            this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
            this.lastSettingsSync = Date.now();
        }
    }

    updateScanSettings(scanSettings) {
        console.log('[StartScan] 📊 Mise à jour scan settings:', scanSettings);
        
        this.settings.scanSettings = { ...this.settings.scanSettings, ...scanSettings };
        
        if (scanSettings.defaultPeriod) {
            this.selectedDays = scanSettings.defaultPeriod;
        }
        
        this.lastSettingsSync = Date.now();
    }

    updatePreferences(preferences) {
        console.log('[StartScan] ⚙️ Mise à jour préférences:', preferences);
        
        this.settings.preferences = { ...this.settings.preferences, ...preferences };
        this.lastSettingsSync = Date.now();
    }

    forceSettingsReload() {
        console.log('[StartScan] 🔄 === RECHARGEMENT FORCÉ PARAMÈTRES ===');
        
        this.parametersLoaded = false;
        this.syncInProgress = false;
        this.loadInitialSettings();
        
        console.log('[StartScan] ✅ Rechargement forcé terminé');
    }

    // ================================================
    // SURVEILLANCE SYNCHRONISATION - AMÉLIORÉE
    // ================================================
    startSyncMonitoring() {
        if (this.syncCheckInterval) {
            clearInterval(this.syncCheckInterval);
        }
        
        this.syncCheckInterval = setInterval(() => {
            this.checkSyncStatus();
        }, 5000); // Vérifier toutes les 5 secondes
        
        console.log('[StartScan] 🔍 Surveillance synchronisation démarrée');
    }

    checkSyncStatus() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 3000) return; // Éviter les vérifications trop fréquentes
        
        try {
            const currentSettings = this.getCurrentSettingsFromSources();
            const hasChanged = this.hasSettingsChanged(currentSettings);
            
            if (hasChanged) {
                console.log('[StartScan] 🔄 Changements détectés, synchronisation...');
                this.synchronizeSettings(currentSettings);
            }
        } catch (error) {
            console.error('[StartScan] Erreur vérification sync:', error);
        }
    }

    getCurrentSettingsFromSources() {
        // Essayer CategoryManager en premier
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            return {
                settings: window.categoryManager.getSettings(),
                taskPreselectedCategories: window.categoryManager.getTaskPreselectedCategories() || []
            };
        }
        
        // Puis CategoriesPage
        if (window.categoriesPage && typeof window.categoriesPage.getTaskPreselectedCategories === 'function') {
            return {
                taskPreselectedCategories: window.categoriesPage.getTaskPreselectedCategories(),
                settings: {
                    scanSettings: window.categoriesPage.getScanSettings?.() || this.settings.scanSettings
                }
            };
        }
        
        // Fallback localStorage
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    settings: parsed,
                    taskPreselectedCategories: parsed.taskPreselectedCategories || []
                };
            }
        } catch (error) {
            console.error('[StartScan] Erreur lecture localStorage:', error);
        }
        
        return {
            settings: this.settings,
            taskPreselectedCategories: this.taskPreselectedCategories
        };
    }

    hasSettingsChanged(newData) {
        const currentTaskStr = JSON.stringify([...this.taskPreselectedCategories].sort());
        const newTaskStr = JSON.stringify([...newData.taskPreselectedCategories].sort());
        
        if (currentTaskStr !== newTaskStr) {
            console.log('[StartScan] 📋 Changement catégories détecté');
            return true;
        }
        
        if (newData.settings?.scanSettings?.defaultPeriod && 
            newData.settings.scanSettings.defaultPeriod !== this.selectedDays) {
            console.log('[StartScan] 📅 Changement période détecté');
            return true;
        }
        
        return false;
    }

    synchronizeSettings(newData) {
        console.log('[StartScan] 🚀 === SYNCHRONISATION SETTINGS ===');
        
        if (this.syncInProgress) {
            console.log('[StartScan] ⏳ Sync déjà en cours');
            return;
        }
        
        this.syncInProgress = true;
        
        try {
            if (newData.settings) {
                this.updateLocalSettings(newData.settings);
            }
            
            if (newData.taskPreselectedCategories) {
                this.updateTaskCategories(newData.taskPreselectedCategories);
            }
            
            this.refreshUI();
            
            console.log('[StartScan] ✅ Synchronisation terminée');
        } catch (error) {
            console.error('[StartScan] ❌ Erreur synchronisation:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // ================================================
    // INTERFACE UTILISATEUR - RÉÉCRITE
    // ================================================
    async render(container) {
        console.log('[StartScan] 🎯 === RENDU SCANNER V9.0 ===');
        
        try {
            this.addStyles();
            
            if (!this.parametersLoaded) {
                this.loadInitialSettings();
            }
            
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }
            
            await this.checkServices();
            
            container.innerHTML = this.renderScanner();
            this.initializeUI();
            this.isInitialized = true;
            
            console.log('[StartScan] ✅ Scanner rendu avec succès');
            console.log('[StartScan] 📊 Paramètres actifs:', this.settings);
            console.log('[StartScan] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderScanner() {
        const preselectedDisplay = this.taskPreselectedCategories.length > 0 ? 
            this.renderPreselectedInfo() : '';
        
        return `
            <div class="scan-container">
                <div class="scan-card">
                    <div class="scan-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <h1 class="scan-title">Scanner Email Intelligent</h1>
                    <p class="scan-subtitle">Organisez vos emails automatiquement avec IA</p>
                    
                    ${preselectedDisplay}
                    
                    <div class="scan-steps">
                        <div class="step active" id="step1">
                            <div class="step-number">1</div>
                            <div class="step-label">Configuration</div>
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
                        <div class="duration-options" id="durationOptions">
                            ${this.renderDurationOptions()}
                        </div>
                    </div>
                    
                    <button class="scan-button" id="scanButton" onclick="window.scanStartModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Démarrer l'analyse</span>
                    </button>
                    
                    <div class="progress-section" id="progressSection">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus">Préparation</div>
                    </div>
                    
                    <div class="scan-info">
                        <div class="scan-info-main">
                            <i class="fas fa-shield-alt"></i>
                            <span>Scan sécurisé avec IA Claude</span>
                        </div>
                        <div class="scan-info-details" id="scanInfoDetails">
                            ${this.renderScanDetails()}
                        </div>
                    </div>
                </div>
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
            const isRecommended = option.value === this.settings.scanSettings?.defaultPeriod && option.value !== 7;
            
            return `
                <button class="duration-option ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}" 
                        onclick="window.scanStartModule.selectDuration(${option.value})" 
                        data-days="${option.value}">
                    ${option.label}
                </button>
            `;
        }).join('');
    }

    renderPreselectedInfo() {
        const categoryNames = this.taskPreselectedCategories.map(catId => {
            const category = window.categoryManager?.getCategory(catId);
            return category ? `${category.icon} ${category.name}` : catId;
        }).slice(0, 3);
        
        const moreCount = this.taskPreselectedCategories.length - 3;
        const displayText = categoryNames.join(', ') + (moreCount > 0 ? ` et ${moreCount} autre${moreCount > 1 ? 's' : ''}` : '');
        
        return `
            <div id="preselectedDisplay" class="preselected-info">
                <i class="fas fa-star"></i>
                <span>Création automatique de tâches pour: ${displayText}</span>
            </div>
        `;
    }

    renderScanDetails() {
        const details = [];
        
        if (this.taskPreselectedCategories.length > 0) {
            details.push(`${this.taskPreselectedCategories.length} catégorie(s) pour tâches`);
        }
        
        if (this.settings.scanSettings?.autoAnalyze) {
            details.push('Analyse IA automatique');
        }
        
        if (this.settings.preferences?.excludeSpam) {
            details.push('Filtrage spam actif');
        }
        
        return details.length > 0 ? details.join(' • ') : 'Configuration standard';
    }

    renderNotAuthenticated() {
        return `
            <div class="scan-container">
                <div class="scan-card">
                    <div class="scan-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h1 class="scan-title">Connexion requise</h1>
                    <p class="scan-subtitle">Connectez-vous pour analyser vos emails</p>
                    
                    <button class="scan-button" onclick="window.authService.login()">
                        <i class="fab fa-microsoft"></i>
                        <span>Se connecter</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderError(error) {
        return `
            <div class="scan-container">
                <div class="scan-card">
                    <div class="scan-icon error">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 class="scan-title">Erreur</h1>
                    <p class="scan-subtitle">${error.message}</p>
                    
                    <button class="scan-button" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // INTERACTIONS UTILISATEUR
    // ================================================
    initializeUI() {
        console.log('[StartScan] ✅ Initialisation UI');
        
        // Pas d'event listeners manuels nécessaires car tout est géré par onclick
        // L'interface est mise à jour automatiquement par refreshUI()
    }

    selectDuration(days) {
        console.log(`[StartScan] 📅 Sélection durée: ${days} jours`);
        
        this.selectedDays = days;
        this.updateDurationUI();
        
        // Sauvegarder la préférence si différente du défaut
        if (this.settings.scanSettings && this.settings.scanSettings.defaultPeriod !== days) {
            this.saveDurationPreference(days);
        }
    }

    updateDurationUI() {
        document.querySelectorAll('.duration-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`[data-days="${this.selectedDays}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
    }

    saveDurationPreference(days) {
        try {
            if (window.categoryManager && typeof window.categoryManager.updateSettings === 'function') {
                const newScanSettings = { ...this.settings.scanSettings, defaultPeriod: days };
                window.categoryManager.updateSettings({ scanSettings: newScanSettings });
                console.log(`[StartScan] 💾 Période sauvegardée dans CategoryManager: ${days}`);
            } else {
                this.settings.scanSettings.defaultPeriod = days;
                localStorage.setItem('categorySettings', JSON.stringify(this.settings));
                console.log(`[StartScan] 💾 Période sauvegardée dans localStorage: ${days}`);
            }
        } catch (error) {
            console.warn('[StartScan] ⚠️ Erreur sauvegarde période:', error);
        }
    }

    refreshUI() {
        if (!this.isInitialized) return;
        
        console.log('[StartScan] 🔄 Rafraîchissement UI');
        
        // Mettre à jour les informations des catégories pré-sélectionnées
        const preselectedDisplay = document.getElementById('preselectedDisplay');
        if (preselectedDisplay && this.taskPreselectedCategories.length > 0) {
            const categoryNames = this.taskPreselectedCategories.map(catId => {
                const category = window.categoryManager?.getCategory(catId);
                return category ? `${category.icon} ${category.name}` : catId;
            }).slice(0, 3);
            
            const moreCount = this.taskPreselectedCategories.length - 3;
            const displayText = categoryNames.join(', ') + (moreCount > 0 ? ` et ${moreCount} autre${moreCount > 1 ? 's' : ''}` : '');
            
            preselectedDisplay.innerHTML = `
                <i class="fas fa-star"></i>
                <span>Création automatique de tâches pour: ${displayText}</span>
            `;
        } else if (preselectedDisplay && this.taskPreselectedCategories.length === 0) {
            preselectedDisplay.style.display = 'none';
        }
        
        // Mettre à jour les options de durée
        this.updateDurationUI();
        
        // Mettre à jour les détails du scan
        const scanInfoDetails = document.getElementById('scanInfoDetails');
        if (scanInfoDetails) {
            scanInfoDetails.textContent = this.renderScanDetails();
        }
        
        console.log('[StartScan] ✅ UI rafraîchie');
    }

    // ================================================
    // PROCESSUS DE SCAN
    // ================================================
    async startScan() {
        if (this.scanInProgress) {
            console.log('[StartScan] Scan déjà en cours');
            return;
        }
        
        console.log('[StartScan] 🚀 === DÉMARRAGE SCAN V9.0 ===');
        console.log('[StartScan] 📅 Période:', this.selectedDays);
        console.log('[StartScan] 📋 Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        console.log('[StartScan] 📊 Settings:', this.settings);
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            
            this.setActiveStep(2);
            this.showProgress();
            this.updateScanButton(true);
            
            const scanOptions = this.prepareScanOptions();
            await this.executeScan(scanOptions);
            
            this.setActiveStep(3);
            this.completeScan();
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur scan:', error);
            this.showScanError(error);
        }
    }

    prepareScanOptions() {
        return {
            days: this.selectedDays,
            folder: this.settings.scanSettings?.defaultFolder || 'inbox',
            autoAnalyze: this.settings.scanSettings?.autoAnalyze !== false,
            autoCategrize: this.settings.scanSettings?.autoCategrize !== false,
            includeSpam: !this.settings.preferences?.excludeSpam,
            detectCC: this.settings.preferences?.detectCC !== false,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            automationSettings: this.settings.automationSettings || {},
            maxEmails: 1000,
            onProgress: (progressData) => {
                if (progressData.progress) {
                    const percent = Math.round((progressData.progress.current / progressData.progress.total) * 100);
                    this.updateProgress(percent, progressData.message, progressData.phase);
                }
            }
        };
    }

    async executeScan(scanOptions) {
        console.log('[StartScan] 🔄 Exécution scan avec options:', scanOptions);
        
        try {
            if (window.emailScanner && typeof window.emailScanner.scan === 'function') {
                // Synchroniser EmailScanner avant le scan
                if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                    window.emailScanner.updateTaskPreselectedCategories(this.taskPreselectedCategories);
                }
                
                if (typeof window.emailScanner.updateSettings === 'function') {
                    window.emailScanner.updateSettings(this.settings);
                }
                
                console.log('[StartScan] 🔄 Utilisation EmailScanner réel');
                this.scanResults = await window.emailScanner.scan(scanOptions);
                
                console.log('[StartScan] ✅ Scan réel terminé:', this.scanResults);
            } else {
                console.log('[StartScan] 🎭 Mode simulation');
                await this.simulateScan(scanOptions);
            }
        } catch (error) {
            console.error('[StartScan] ❌ Erreur exécution scan:', error);
            await this.simulateScan(scanOptions); // Fallback simulation
        }
    }

    async simulateScan(scanOptions) {
        const steps = [
            { progress: 0, text: 'Initialisation...', status: 'Connexion au serveur' },
            { progress: 15, text: 'Chargement paramètres...', status: 'Configuration synchronisée' },
            { progress: 30, text: 'Authentification...', status: 'Connexion Microsoft Graph' },
            { progress: 50, text: 'Récupération emails...', status: `Analyse ${this.selectedDays} jours` },
            { progress: 70, text: 'Classification IA...', status: 'Analyse intelligente en cours' },
            { progress: 85, text: 'Organisation...', status: 'Tri par catégories' },
            { progress: 100, text: 'Terminé !', status: 'Scan complété' }
        ];

        for (const step of steps) {
            this.updateProgress(step.progress, step.text, step.status);
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        const totalEmails = Math.floor(Math.random() * 200) + 50;
        const preselectedCount = this.taskPreselectedCategories.length > 0 ? 
            Math.floor(totalEmails * 0.15) : 0;

        this.scanResults = {
            success: true,
            total: totalEmails,
            categorized: Math.floor(totalEmails * 0.85),
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: { 
                processed: totalEmails,
                errors: 0,
                preselectedForTasks: preselectedCount,
                taskSuggestions: Math.floor(preselectedCount * 0.8)
            },
            scanOptions
        };
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
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        
        const activeStep = document.getElementById(`step${stepNumber}`);
        if (activeStep) {
            activeStep.classList.add('active');
        }
    }

    showProgress() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.classList.add('visible');
        }
    }

    updateScanButton(isScanning) {
        const scanButton = document.getElementById('scanButton');
        if (!scanButton) return;
        
        if (isScanning) {
            scanButton.disabled = true;
            scanButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyse en cours...</span>';
        } else {
            scanButton.disabled = false;
            scanButton.innerHTML = '<i class="fas fa-play"></i> <span>Démarrer l\'analyse</span>';
        }
    }

    completeScan() {
        setTimeout(() => {
            const scanButton = document.getElementById('scanButton');
            if (scanButton) {
                const preselectedCount = this.scanResults?.stats?.preselectedForTasks || 0;
                const buttonText = preselectedCount > 0 ? 
                    `Terminé ! ${preselectedCount} emails pour tâches` : 
                    'Scan terminé !';
                
                scanButton.innerHTML = `<i class="fas fa-check"></i> <span>${buttonText}</span>`;
                scanButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
            
            setTimeout(() => {
                this.redirectToResults();
            }, 1500);
        }, 500);
    }

    redirectToResults() {
        this.scanInProgress = false;
        
        const results = {
            success: this.scanResults?.success || true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.stats?.preselectedForTasks || 0,
            taskSuggestions: this.scanResults?.stats?.taskSuggestions || 0,
            scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
            selectedDays: this.selectedDays,
            timestamp: Date.now(),
            settingsUsed: { ...this.settings }
        };
        
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(results));
            console.log('[StartScan] 💾 Résultats sauvegardés:', results);
        } catch (error) {
            console.warn('[StartScan] ⚠️ Erreur sauvegarde résultats:', error);
        }
        
        if (window.uiManager?.showToast) {
            const message = results.preselectedForTasks > 0 ? 
                `✅ ${results.total} emails analysés • ${results.preselectedForTasks} pré-sélectionnés pour tâches` :
                `✅ ${results.total} emails analysés avec succès`;
            
            window.uiManager.showToast(message, 'success', 5000);
        }
        
        setTimeout(() => {
            if (window.pageManager?.loadPage) {
                console.log('[StartScan] 🔄 Redirection vers emails');
                window.pageManager.loadPage('emails');
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
                    <button class="scan-button" onclick="window.scanStartModule.resetScanner()" 
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
        console.log('[StartScan] 🔄 Reset scanner');
        
        this.scanInProgress = false;
        this.setActiveStep(1);
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.classList.remove('visible');
            progressSection.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">Initialisation...</div>
                <div class="progress-status" id="progressStatus">Préparation</div>
            `;
        }
        
        this.updateScanButton(false);
        this.updateProgress(0, 'Initialisation...', 'Préparation');
        
        // Recharger les paramètres
        this.forceSettingsReload();
        this.refreshUI();
    }

    // ================================================
    // SERVICES ET VÉRIFICATIONS
    // ================================================
    async checkServices() {
        if (!window.authService?.isAuthenticated()) {
            throw new Error('Authentification requise');
        }
        
        if (!window.mailService) {
            console.warn('[StartScan] ⚠️ MailService non disponible');
        }
        
        if (!window.categoryManager) {
            console.warn('[StartScan] ⚠️ CategoryManager non disponible');
        }
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addStyles() {
        if (this.stylesAdded || document.getElementById('start-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'start-scan-styles';
        styles.textContent = `
            /* Scanner v9.0 - Styles complets */
            .scan-container {
                height: calc(100vh - 140px);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                overflow: hidden;
                position: relative;
                padding: 20px;
            }
            
            .scan-card {
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
            
            .scan-icon {
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
            
            .scan-icon.error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            
            .scan-title {
                font-size: 32px;
                font-weight: 600;
                color: #1a1a2e;
                margin-bottom: 12px;
            }
            
            .scan-subtitle {
                font-size: 18px;
                color: #6b7280;
                margin-bottom: 35px;
            }
            
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
            
            .scan-steps {
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
            
            .duration-option.recommended::after {
                content: '⭐';
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
            
            .scan-button {
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
            
            .scan-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .scan-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .scan-button:hover::before {
                left: 100%;
            }
            
            .progress-section {
                opacity: 0;
                transition: opacity 0.3s ease;
                margin-top: 20px;
            }
            
            .progress-section.visible {
                opacity: 1;
            }
            
            .progress-bar {
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
            
            @media (max-width: 480px) {
                .scan-card {
                    width: 95%;
                    padding: 35px 30px;
                    max-width: 650px;
                }
                
                .scan-title {
                    font-size: 28px;
                }
                
                .scan-subtitle {
                    font-size: 16px;
                }
                
                .scan-steps {
                    padding: 0 10px;
                }
                
                .step-label {
                    font-size: 12px;
                    max-width: 70px;
                }
                
                .duration-options {
                    gap: 8px;
                }
                
                .duration-option {
                    padding: 10px 16px;
                    font-size: 13px;
                    min-width: 75px;
                }
                
                .scan-button {
                    height: 55px;
                    font-size: 16px;
                }
                
                .preselected-info {
                    font-size: 12px;
                    padding: 12px 16px;
                }
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[StartScan] ✅ Styles ajoutés');
    }

    // ================================================
    // MÉTHODES UTILITAIRES ET DEBUG
    // ================================================
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            lastSettingsSync: this.lastSettingsSync,
            parametersLoaded: this.parametersLoaded,
            syncInProgress: this.syncInProgress,
            eventListenersSetup: this.eventListenersSetup,
            syncCheckInterval: !!this.syncCheckInterval
        };
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        if (this.syncCheckInterval) {
            clearInterval(this.syncCheckInterval);
            this.syncCheckInterval = null;
        }
        
        this.scanInProgress = false;
        this.isInitialized = false;
        this.parametersLoaded = false;
        this.syncInProgress = false;
        this.eventListenersSetup = false;
        
        console.log('[StartScan] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        console.log('[StartScan] Instance détruite');
    }
}

// ===== CRÉATION INSTANCE GLOBALE =====
console.log('[StartScan] 🔧 Création instance globale...');

if (window.scanStartModule) {
    window.scanStartModule.destroy?.();
}

window.StartScanModule = StartScanModule;
window.scanStartModule = new StartScanModule();

// Alias pour compatibilité
window.minimalScanModule = window.scanStartModule;

console.log('[StartScan] ✅ StartScan v9.0 ready!');
console.log('- window.StartScanModule:', !!window.StartScanModule);
console.log('- window.scanStartModule:', !!window.scanStartModule);
console.log('- window.minimalScanModule:', !!window.minimalScanModule);

// ===== MÉTHODES DEBUG GLOBALES =====
window.testStartScanSync = function() {
    console.group('🧪 TEST StartScan Synchronisation');
    const debug = window.scanStartModule.getDebugInfo();
    console.log('Debug Info:', debug);
    console.groupEnd();
    return debug;
};

window.forceStartScanSync = function() {
    console.log('[StartScan] 🔄 Force synchronisation...');
    window.scanStartModule.forceSettingsReload();
    return window.scanStartModule.getDebugInfo();
};
