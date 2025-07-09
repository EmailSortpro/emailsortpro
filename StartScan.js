// StartScan.js - Version 11.0 - Scanner non bloquant optimisé

console.log('[StartScan] 🚀 Loading StartScan.js v11.0...');

class MinimalScanModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedDays = 7;
        this.stylesAdded = false;
        this.scanStartTime = null;
        this.currentProvider = null;
        this.scanResults = null;
        this.abortController = null;
        
        // Intégration avec les paramètres
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        
        console.log('[StartScan] Scanner v11.0 initialized - Non bloquant');
        this.detectAuthProvider();
        this.loadSettingsFromCategoryManager();
        this.addMinimalStyles();
    }

    // ================================================
    // DÉTECTION DU PROVIDER D'AUTHENTIFICATION
    // ================================================
    detectAuthProvider() {
        console.log('[StartScan] 🔍 Détection du provider d\'authentification...');
        
        // 1. Vérifier Google Auth
        if (window.googleAuthService && window.googleAuthService.isAuthenticated()) {
            this.currentProvider = 'google';
            console.log('[StartScan] ✅ Authentifié avec Google/Gmail');
            return;
        }
        
        // 2. Vérifier Microsoft Auth
        if (window.authService && window.authService.isAuthenticated()) {
            this.currentProvider = 'microsoft';
            console.log('[StartScan] ✅ Authentifié avec Microsoft/Outlook');
            return;
        }
        
        // 3. Vérifier l'app principale
        if (window.app && window.app.currentProvider) {
            this.currentProvider = window.app.currentProvider;
            console.log('[StartScan] ✅ Provider depuis app:', this.currentProvider);
            return;
        }
        
        // 4. Fallback sur le dernier provider
        const lastProvider = sessionStorage.getItem('lastAuthProvider');
        if (lastProvider === 'google' || lastProvider === 'microsoft') {
            this.currentProvider = lastProvider;
            console.log('[StartScan] ⚠️ Utilisation du dernier provider:', lastProvider);
            return;
        }
        
        console.log('[StartScan] ❌ Aucun provider détecté');
        this.currentProvider = null;
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
    // ================================================
    loadSettingsFromCategoryManager() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[StartScan] ✅ Paramètres chargés depuis CategoryManager');
                
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
                    console.warn('[StartScan] ⚠️ Erreur chargement localStorage:', error);
                }
            }
            
            this.lastSettingsSync = Date.now();
        } catch (error) {
            console.error('[StartScan] ❌ Erreur chargement paramètres:', error);
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

    // ================================================
    // RENDU DU SCANNER
    // ================================================
    addMinimalStyles() {
        if (this.stylesAdded || document.getElementById('minimal-scan-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'minimal-scan-styles';
        styles.textContent = `
            /* Scanner Ultra-Minimaliste v11.0 */
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
            
            .provider-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                color: white;
                margin-bottom: 20px;
            }
            
            .provider-badge.google {
                background: linear-gradient(135deg, #4285f4, #34a853);
            }
            
            .provider-badge.microsoft {
                background: linear-gradient(135deg, #0078d4, #106ebe);
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
            
            .scan-button-minimal:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button-minimal:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .cancel-button {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                margin-top: 10px;
            }
            
            .cancel-button:hover {
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
            }
            
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
            
            .error-state {
                background: rgba(239, 68, 68, 0.1);
                color: #dc2626;
                padding: 20px;
                border-radius: 10px;
                margin-top: 20px;
            }
        `;
        
        document.head.appendChild(styles);
        this.stylesAdded = true;
        console.log('[StartScan] ✅ Styles v11.0 ajoutés');
    }

    async render(container) {
        console.log('[StartScan] 🎯 Rendu du scanner v11.0...');
        
        try {
            this.addMinimalStyles();
            
            // Re-détecter le provider
            this.detectAuthProvider();
            
            if (!this.currentProvider) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            await this.checkServices();
            container.innerHTML = this.renderMinimalScanner();
            this.initializeEvents();
            this.isInitialized = true;
            
            console.log('[StartScan] ✅ Scanner v11.0 rendu avec succès');
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur lors du rendu:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    renderMinimalScanner() {
        const providerName = this.currentProvider === 'google' ? 'Gmail' : 'Outlook';
        const providerIcon = this.currentProvider === 'google' ? 'fab fa-google' : 'fab fa-microsoft';
        
        return `
            <div class="minimal-scanner">
                <div class="scanner-card-minimal">
                    <div class="scanner-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <h1 class="scanner-title">Scanner Email</h1>
                    <p class="scanner-subtitle">Récupérez et organisez vos emails automatiquement</p>
                    
                    <div class="provider-badge ${this.currentProvider}">
                        <i class="${providerIcon}"></i>
                        <span>Connecté via ${providerName}</span>
                    </div>
                    
                    <div class="duration-section">
                        <div class="duration-label">Période d'analyse</div>
                        <div class="duration-options">
                            ${this.renderDurationOptions()}
                        </div>
                    </div>
                    
                    <button class="scan-button-minimal" id="minimalScanBtn" onclick="window.minimalScanModule.startScan()">
                        <i class="fas fa-play"></i>
                        <span>Démarrer le scan</span>
                    </button>
                    
                    <div class="progress-section-minimal" id="progressSection">
                        <div class="progress-bar-minimal">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">Initialisation...</div>
                        <div class="progress-status" id="progressStatus">Préparation du scan</div>
                        
                        <button class="scan-button-minimal cancel-button" id="cancelScanBtn" onclick="window.minimalScanModule.cancelScan()" style="display: none;">
                            <i class="fas fa-stop"></i>
                            <span>Annuler le scan</span>
                        </button>
                    </div>
                    
                    <div class="scan-info">
                        <div class="scan-info-main">
                            <i class="fas fa-shield-alt"></i>
                            <span>Scan sécurisé et privé</span>
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
            return `
                <button class="duration-option ${isSelected ? 'selected' : ''}" 
                        onclick="window.minimalScanModule.selectDuration(${option.value})" 
                        data-days="${option.value}">
                    ${option.label}
                </button>
            `;
        }).join('');
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
                    
                    <button class="scan-button-minimal" onclick="window.minimalScanModule.handleLogin('google')" style="margin-bottom: 15px;">
                        <i class="fab fa-google"></i>
                        <span>Se connecter avec Gmail</span>
                    </button>
                    
                    <button class="scan-button-minimal" onclick="window.minimalScanModule.handleLogin('microsoft')">
                        <i class="fab fa-microsoft"></i>
                        <span>Se connecter avec Outlook</span>
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
        if (!this.currentProvider) {
            throw new Error('Aucune authentification détectée');
        }
        
        if (this.currentProvider === 'google') {
            if (!window.googleAuthService || !window.googleAuthService.isAuthenticated()) {
                throw new Error('Authentification Google requise');
            }
        } else if (this.currentProvider === 'microsoft') {
            if (!window.authService || !window.authService.isAuthenticated()) {
                throw new Error('Authentification Microsoft requise');
            }
        }
    }

    initializeEvents() {
        console.log('[StartScan] ✅ Événements initialisés');
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
        
        console.log(`[StartScan] ✅ Durée sélectionnée: ${days} jours`);
    }

    async handleLogin(provider) {
        console.log('[StartScan] Tentative de connexion:', provider);
        
        try {
            if (provider === 'google' && window.googleAuthService) {
                await window.googleAuthService.login();
            } else if (provider === 'microsoft' && window.authService) {
                await window.authService.login();
            } else {
                console.error('[StartScan] Service d\'authentification non disponible pour:', provider);
            }
        } catch (error) {
            console.error('[StartScan] Erreur de connexion:', error);
        }
    }

    // ================================================
    // SCAN PRINCIPAL NON BLOQUANT
    // ================================================
    async startScan() {
        if (this.scanInProgress) {
            console.log('[StartScan] Scan déjà en cours');
            return;
        }
        
        console.log('[StartScan] 🚀 Démarrage du scan v11.0 non bloquant');
        
        try {
            this.scanInProgress = true;
            this.scanStartTime = Date.now();
            this.abortController = new AbortController();
            
            const progressSection = document.getElementById('progressSection');
            if (progressSection) {
                progressSection.classList.add('visible');
            }
            
            const scanBtn = document.getElementById('minimalScanBtn');
            if (scanBtn) {
                scanBtn.disabled = true;
                scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Scan en cours...</span>';
            }
            
            // Afficher le bouton d'annulation
            const cancelBtn = document.getElementById('cancelScanBtn');
            if (cancelBtn) {
                cancelBtn.style.display = 'block';
            }
            
            // Préparer les options de scan
            const scanOptions = {
                days: this.selectedDays,
                provider: this.currentProvider,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                onProgress: (progress) => this.updateProgress(progress.progress || 0, progress.message || '', progress.phase || ''),
                abortSignal: this.abortController.signal
            };
            
            console.log('[StartScan] 📊 Options de scan:', scanOptions);
            
            // Lancer le scan de manière asynchrone
            const results = await this.executeScanAsync(scanOptions);
            
            if (results) {
                this.scanResults = results;
                console.log('[StartScan] ✅ Scan terminé:', results);
                this.completeScan();
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('[StartScan] ⚠️ Scan annulé par l\'utilisateur');
                this.showScanCancelled();
            } else {
                console.error('[StartScan] ❌ Erreur de scan:', error);
                this.showScanError(error);
            }
        } finally {
            this.scanInProgress = false;
            this.abortController = null;
        }
    }

    async executeScanAsync(scanOptions) {
        console.log('[StartScan] 🔄 Exécution du scan asynchrone...');
        
        try {
            // Étape 1: Initialiser MailService
            this.updateProgress(10, 'Initialisation du service mail...', 'init');
            await this.initializeMailService();
            
            // Vérifier l'annulation
            if (scanOptions.abortSignal?.aborted) {
                throw new Error('Scan annulé');
            }
            
            // Étape 2: Récupérer les emails par batch
            this.updateProgress(20, 'Récupération des emails...', 'fetching');
            const emails = await this.fetchEmailsBatched(scanOptions);
            
            // Vérifier l'annulation
            if (scanOptions.abortSignal?.aborted) {
                throw new Error('Scan annulé');
            }
            
            // Étape 3: Catégoriser les emails
            this.updateProgress(60, 'Catégorisation des emails...', 'categorizing');
            const categorizedEmails = await this.categorizeEmailsBatched(emails, scanOptions);
            
            // Vérifier l'annulation
            if (scanOptions.abortSignal?.aborted) {
                throw new Error('Scan annulé');
            }
            
            // Étape 4: Analyser pour les tâches (optionnel et rapide)
            this.updateProgress(80, 'Analyse rapide pour les tâches...', 'analyzing');
            const analyzedEmails = await this.quickAnalyzeForTasks(categorizedEmails, scanOptions);
            
            // Étape 5: Finaliser
            this.updateProgress(100, 'Finalisation...', 'complete');
            
            return {
                success: true,
                total: emails.length,
                categorized: categorizedEmails.length,
                analyzed: analyzedEmails.length,
                provider: this.currentProvider,
                taskPreselectedCategories: [...scanOptions.taskPreselectedCategories],
                emails: analyzedEmails,
                scanDuration: Math.floor((Date.now() - this.scanStartTime) / 1000),
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur exécution scan:', error);
            throw error;
        }
    }

    async initializeMailService() {
        console.log('[StartScan] 🔧 Initialisation MailService...');
        
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }
        
        try {
            await window.mailService.initialize();
            console.log('[StartScan] ✅ MailService initialisé');
        } catch (error) {
            console.error('[StartScan] ❌ Erreur initialisation MailService:', error);
            throw new Error('Impossible d\'initialiser le service mail');
        }
    }

    async fetchEmailsBatched(scanOptions) {
        console.log('[StartScan] 📧 Récupération des emails par batch...');
        
        try {
            // Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - scanOptions.days);
            
            let emails = [];
            
            // Utiliser la méthode getMessages avec limite raisonnable
            if (window.mailService && typeof window.mailService.getMessages === 'function') {
                console.log('[StartScan] 📬 Utilisation de getMessages...');
                
                const folder = this.currentProvider === 'google' ? 'INBOX' : 'inbox';
                
                // Récupérer les emails par batch de 50
                const batchSize = 50;
                let offset = 0;
                let hasMore = true;
                
                while (hasMore && emails.length < 200) { // Limite à 200 emails max
                    // Vérifier l'annulation
                    if (scanOptions.abortSignal?.aborted) {
                        throw new Error('Scan annulé');
                    }
                    
                    const batch = await window.mailService.getMessages(folder, {
                        top: batchSize,
                        skip: offset,
                        filter: this.buildDateFilter(startDate, endDate)
                    });
                    
                    if (batch && batch.length > 0) {
                        emails = emails.concat(batch);
                        offset += batch.length;
                        hasMore = batch.length === batchSize;
                        
                        // Mettre à jour le progrès
                        const progress = 20 + Math.min(30, (emails.length / 200) * 30);
                        this.updateProgress(progress, `${emails.length} emails récupérés...`, 'fetching');
                        
                        // Pause courte pour ne pas bloquer l'UI
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } else {
                        hasMore = false;
                    }
                }
                
                console.log(`[StartScan] ✅ ${emails.length} emails récupérés`);
            }
            
            // Filtrer les emails valides
            emails = emails.filter(email => email && email.subject && email.from);
            
            return emails;
            
        } catch (error) {
            console.error('[StartScan] ❌ Erreur récupération emails:', error);
            throw error;
        }
    }

    buildDateFilter(startDate, endDate) {
        if (this.currentProvider === 'microsoft') {
            return `receivedDateTime ge ${startDate.toISOString()} and receivedDateTime le ${endDate.toISOString()}`;
        } else {
            // Gmail utilise une syntaxe différente
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            return `after:${startStr} before:${endStr}`;
        }
    }

    async categorizeEmailsBatched(emails, scanOptions) {
        console.log('[StartScan] 🏷️ Catégorisation des emails par batch...');
        
        if (!window.categoryManager) {
            console.warn('[StartScan] ⚠️ CategoryManager non disponible');
            return emails;
        }
        
        const batchSize = 20;
        let categorizedCount = 0;
        let preselectedCount = 0;
        
        for (let i = 0; i < emails.length; i += batchSize) {
            // Vérifier l'annulation
            if (scanOptions.abortSignal?.aborted) {
                throw new Error('Scan annulé');
            }
            
            const batch = emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // Analyser l'email avec CategoryManager
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    // Appliquer les résultats
                    email.category = analysis.category || email.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isExcluded = analysis.isExcluded || false;
                    
                    // Vérifier si l'email est pré-sélectionné pour les tâches
                    email.isPreselectedForTasks = scanOptions.taskPreselectedCategories.includes(email.category);
                    
                    if (email.isPreselectedForTasks) {
                        preselectedCount++;
                    }
                    
                    categorizedCount++;
                    
                } catch (error) {
                    console.error('[StartScan] ❌ Erreur catégorisation email:', error);
                    email.category = email.category || 'other';
                    email.isPreselectedForTasks = false;
                }
            }
            
            // Mise à jour du progrès
            const progress = 60 + Math.round((categorizedCount / emails.length) * 20);
            this.updateProgress(progress, `Catégorisation: ${categorizedCount}/${emails.length}`, 'categorizing');
            
            // Pause courte pour ne pas bloquer l'UI
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log(`[StartScan] ✅ ${categorizedCount} emails catégorisés, ${preselectedCount} pré-sélectionnés`);
        return emails;
    }

    async quickAnalyzeForTasks(emails, scanOptions) {
        console.log('[StartScan] 🤖 Analyse rapide pour les tâches...');
        
        // Pour l'instant, on marque juste les emails pré-sélectionnés
        // L'analyse IA complète sera faite dans la page emails
        let markedCount = 0;
        
        emails.forEach(email => {
            if (email.isPreselectedForTasks) {
                email.suggestedForTask = true;
                markedCount++;
            }
        });
        
        console.log(`[StartScan] ✅ ${markedCount} emails marqués pour tâches`);
        return emails;
    }

    cancelScan() {
        console.log('[StartScan] ⚠️ Annulation du scan demandée');
        
        if (this.abortController) {
            this.abortController.abort();
        }
    }

    updateProgress(percent, text, status) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressStatus = document.getElementById('progressStatus');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = text;
        if (progressStatus) progressStatus.textContent = status;
        
        console.log(`[StartScan] 📊 Progress: ${percent}% - ${text}`);
    }

    completeScan() {
        console.log('[StartScan] 🎉 Scan terminé avec succès');
        
        setTimeout(() => {
            const scanBtn = document.getElementById('minimalScanBtn');
            if (scanBtn) {
                scanBtn.innerHTML = `<i class="fas fa-check"></i> <span>Scan terminé !</span>`;
                scanBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
            
            const cancelBtn = document.getElementById('cancelScanBtn');
            if (cancelBtn) {
                cancelBtn.style.display = 'none';
            }
            
            setTimeout(() => {
                this.redirectToResults();
            }, 1500);
        }, 500);
    }

    showScanCancelled() {
        console.log('[StartScan] ⚠️ Scan annulé');
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Scan annulé</p>
                </div>
            `;
        }
        
        this.resetScanner();
    }

    redirectToResults() {
        this.scanInProgress = false;
        
        // Préparer les résultats essentiels
        const essentialResults = {
            success: true,
            total: this.scanResults?.total || 0,
            categorized: this.scanResults?.categorized || 0,
            analyzed: this.scanResults?.analyzed || 0,
            provider: this.currentProvider,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedForTasks: this.scanResults?.emails?.filter(e => e.isPreselectedForTasks)?.length || 0,
            scanDuration: this.scanResults?.scanDuration || 0,
            timestamp: Date.now()
        };
        
        // Stocker les résultats
        try {
            sessionStorage.setItem('scanResults', JSON.stringify(essentialResults));
            sessionStorage.setItem('lastScanProvider', this.currentProvider);
            
            // Stocker les emails dans EmailScanner
            if (window.emailScanner && this.scanResults?.emails) {
                window.emailScanner.emails = this.scanResults.emails;
                window.emailScanner.startScanSynced = true;
            }
            
        } catch (error) {
            console.warn('[StartScan] ⚠️ Erreur stockage résultats:', error);
        }
        
        // Notifier les autres modules
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('scanCompleted', {
                detail: {
                    results: essentialResults,
                    emails: this.scanResults?.emails || [],
                    source: 'StartScan',
                    timestamp: Date.now()
                }
            }));
        }, 100);
        
        // Afficher une notification
        if (window.uiManager?.showToast) {
            const message = `✅ ${essentialResults.total} emails scannés • ${essentialResults.preselectedForTasks} pré-sélectionnés`;
            window.uiManager.showToast(message, 'success', 4000);
        }
        
        // Redirection intelligente
        setTimeout(() => {
            console.log('[StartScan] 🚀 Redirection vers la page emails...');
            
            if (this.currentProvider === 'google' && window.pageManagerGmail) {
                window.pageManagerGmail.loadPage('emails');
            } else if (window.pageManager) {
                window.pageManager.loadPage('emails');
            } else {
                console.warn('[StartScan] ⚠️ Aucun PageManager disponible');
            }
        }, 500);
    }

    showScanError(error) {
        console.error('[StartScan] ❌ Erreur de scan:', error);
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.innerHTML = `
                <div class="error-state">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                        Erreur de scan
                    </div>
                    <div style="font-size: 12px; margin-bottom: 16px;">
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
        
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.classList.remove('visible');
        }
        
        const scanBtn = document.getElementById('minimalScanBtn');
        if (scanBtn) {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="fas fa-play"></i> <span>Démarrer le scan</span>';
            scanBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
        
        const cancelBtn = document.getElementById('cancelScanBtn');
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
        
        this.updateProgress(0, 'Initialisation...', 'Préparation du scan');
        
        console.log('[StartScan] 🔄 Scanner réinitialisé');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            scanInProgress: this.scanInProgress,
            selectedDays: this.selectedDays,
            currentProvider: this.currentProvider,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            settings: this.settings,
            scanResults: this.scanResults,
            version: '11.0'
        };
    }

    cleanup() {
        this.scanInProgress = false;
        this.isInitialized = false;
        this.scanResults = null;
        if (this.abortController) {
            this.abortController.abort();
        }
        console.log('[StartScan] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.currentProvider = null;
        console.log('[StartScan] Instance détruite');
    }
}

// Créer l'instance globale
if (window.minimalScanModule) {
    window.minimalScanModule.destroy?.();
}

window.MinimalScanModule = MinimalScanModule;
window.minimalScanModule = new MinimalScanModule();
window.scanStartModule = window.minimalScanModule;

console.log('[StartScan] ✅ Scanner v11.0 chargé - Non bloquant avec annulation!');
