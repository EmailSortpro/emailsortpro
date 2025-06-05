// startscan.js - Version 5.1 - Scanner d'emails moderne avec résolution des problèmes

class ScanStartModule {
    constructor() {
        this.isInitialized = false;
        this.scanInProgress = false;
        this.selectedFolders = ['inbox'];
        this.selectedDays = 7;
        this.autoClassifyEmails = true;
        this.autoCreateTasks = true;
        this.excludedDomains = this.getExcludedDomains();
        
        this.scanSettings = {
            startDate: this.getStartDateFromDays(7),
            endDate: new Date().toISOString().split('T')[0],
            maxEmails: 1000
        };
        
        this.addModernStyles();
        console.log('[ScanStart] Module initialized - MODERN EMAIL SCANNER v5.1 with fixes');
    }

    getExcludedDomains() {
        try {
            const saved = localStorage.getItem('excludedDomains');
            return saved ? JSON.parse(saved) : ['newsletter.com', 'noreply.com', 'donotreply.com'];
        } catch (e) {
            return ['newsletter.com', 'noreply.com', 'donotreply.com'];
        }
    }

    getStartDateFromDays(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    async render(container) {
        console.log('[ScanStart] Rendering enhanced scanner interface...');
        
        try {
            this.addModernStyles();
            
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            // Vérifier et initialiser les services
            await this.checkAndInitializeServices();

            const userInfo = await this.getUserInfo();
            container.innerHTML = this.renderEnhancedScanInterface(userInfo);
            this.initializeEvents();
            this.isInitialized = true;
            
            // Force le rechargement des styles après le rendu
            setTimeout(() => {
                this.addModernStyles();
            }, 100);
            
            console.log('[ScanStart] ✅ Enhanced scanner interface ready');
            
        } catch (error) {
            console.error('[ScanStart] Error rendering interface:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    async checkAndInitializeServices() {
        console.log('[ScanStart] Checking and initializing services...');
        
        // Vérifier AuthService
        if (!window.authService) {
            throw new Error('Service d\'authentification non disponible');
        }
        
        if (!window.authService.isAuthenticated()) {
            throw new Error('Utilisateur non authentifié');
        }

        // Vérifier MailService
        if (!window.mailService) {
            throw new Error('Service de messagerie non disponible');
        }

        // Vérifier que la méthode existe
        if (typeof window.mailService.getEmailsFromFolder !== 'function') {
            throw new Error('Méthode de récupération des emails non disponible');
        }

        // Initialiser MailService si nécessaire
        try {
            if (!window.mailService.isInitialized) {
                console.log('[ScanStart] Initializing MailService...');
                await window.mailService.initialize();
                console.log('[ScanStart] ✅ MailService initialized successfully');
            }
        } catch (initError) {
            console.error('[ScanStart] MailService initialization error:', initError);
            throw new Error(`Impossible d'initialiser le service de messagerie: ${initError.message}`);
        }

        // Test de connexion rapide
        try {
            console.log('[ScanStart] Testing connection...');
            const connectionTest = await window.mailService.testConnection();
            if (!connectionTest.success) {
                throw new Error(`Test de connexion échoué: ${connectionTest.error}`);
            }
            console.log('[ScanStart] ✅ Connection test passed');
        } catch (testError) {
            console.error('[ScanStart] Connection test failed:', testError);
            throw new Error(`Test de connexion échoué: ${testError.message}`);
        }
    }

    renderEnhancedScanInterface(userInfo) {
        return `
            <div class="scanner-minimal">
                <!-- En-tête avec info utilisateur -->
                <div class="scanner-header">
                    <div class="user-welcome">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-info">
                            <h1 class="scanner-title">
                                <i class="fas fa-search"></i>
                                Scanner d'emails
                            </h1>
                            <p class="scanner-subtitle">Bonjour ${userInfo.displayName || 'Utilisateur'} • Analysez vos emails intelligemment</p>
                        </div>
                    </div>
                </div>
                
                <!-- Contenu principal -->
                <div class="scanner-content">
                    <!-- Configuration rapide -->
                    <div class="quick-config">
                        <div class="config-row">
                            <div class="config-item">
                                <label class="config-label">
                                    <i class="fas fa-calendar-alt"></i>
                                    Période à analyser
                                </label>
                                <div class="period-selector">
                                    <div class="period-chip" onclick="window.scanStartModule.selectDays(1)">1 jour</div>
                                    <div class="period-chip" onclick="window.scanStartModule.selectDays(3)">3 jours</div>
                                    <div class="period-chip selected" onclick="window.scanStartModule.selectDays(7)">7 jours</div>
                                    <div class="period-chip" onclick="window.scanStartModule.selectDays(30)">30 jours</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="config-row">
                            <div class="config-item">
                                <label class="config-label">
                                    <i class="fas fa-folder"></i>
                                    Dossiers à scanner
                                </label>
                                <div class="folders-selector">
                                    <div class="folder-chip selected" onclick="window.scanStartModule.toggleFolder('inbox')">
                                        <i class="fas fa-inbox"></i>
                                        Boîte de réception
                                    </div>
                                    <div class="folder-chip" onclick="window.scanStartModule.toggleFolder('junkemail')">
                                        <i class="fas fa-trash-alt"></i>
                                        Courrier indésirable
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="config-row">
                            <div class="config-item">
                                <label class="config-label">
                                    <i class="fas fa-robot"></i>
                                    Options intelligentes
                                </label>
                                <div class="ai-options">
                                    <div class="switch-option">
                                        <label class="switch">
                                            <input type="checkbox" id="autoClassify" 
                                                ${this.autoClassifyEmails ? 'checked' : ''}
                                                onchange="window.scanStartModule.toggleAutoClassify()">
                                            <span class="slider"></span>
                                        </label>
                                        <span class="option-label">Classification automatique par IA</span>
                                    </div>
                                    
                                    <div class="switch-option">
                                        <label class="switch">
                                            <input type="checkbox" id="autoTasks" 
                                                ${this.autoCreateTasks ? 'checked' : ''}
                                                onchange="window.scanStartModule.toggleAutoTasks()">
                                            <span class="slider"></span>
                                        </label>
                                        <span class="option-label">Création automatique de tâches</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Aperçu des paramètres -->
                    <div class="scan-preview">
                        <div class="preview-title">
                            <i class="fas fa-eye"></i>
                            Aperçu du scan
                        </div>
                        <div class="preview-content">
                            <div class="preview-item">
                                <span class="preview-label">Période :</span>
                                <span class="preview-value" id="previewPeriod">7 derniers jours</span>
                            </div>
                            <div class="preview-item">
                                <span class="preview-label">Dossiers :</span>
                                <span class="preview-value" id="previewFolders">Boîte de réception</span>
                            </div>
                            <div class="preview-item">
                                <span class="preview-label">IA activée :</span>
                                <span class="preview-value" id="previewAI">Classification + Tâches</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action de scan -->
                    <div id="scanAction" class="scan-action">
                        <button class="btn-scan" id="startScanBtn" onclick="window.scanStartModule.startEnhancedScan()">
                            <i class="fas fa-search"></i>
                            <span>Démarrer le scan intelligent</span>
                        </button>
                        
                        <div class="scan-info">
                            <div class="info-item">
                                <i class="fas fa-shield-alt"></i>
                                <span>Scan sécurisé via Microsoft Graph API</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <span>Durée estimée : 30 secondes à 2 minutes</span>
                            </div>
                        </div>
                        
                        <div class="advanced-options">
                            <button class="btn-link" onclick="window.scanStartModule.showAdvancedOptions()">
                                <i class="fas fa-cog"></i>
                                Options avancées
                            </button>
                        </div>
                    </div>
                    
                    <!-- Barre de progression -->
                    <div id="progressContainer" class="progress-container" style="display: none;">
                        <div class="progress-header">
                            <h3 id="progressTitle">Scan en cours...</h3>
                            <div id="progressPercentage" class="progress-percentage">0%</div>
                        </div>
                        <div class="progress-bar">
                            <div id="progressFill" class="progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="progress-details">
                            <div id="progressText" class="progress-text">Initialisation...</div>
                            <div id="progressStats" class="progress-stats"></div>
                        </div>
                        
                        <button id="cancelScanBtn" class="btn-cancel" onclick="window.scanStartModule.cancelScan()" style="display: none;">
                            <i class="fas fa-times"></i>
                            Annuler le scan
                        </button>
                    </div>
                </div>
                
                <!-- Guide d'utilisation -->
                <div class="usage-guide">
                    <div class="guide-title">
                        <i class="fas fa-lightbulb"></i>
                        Comment optimiser votre scan
                    </div>
                    <div class="guide-tips">
                        <div class="tip">
                            <div class="tip-icon">💡</div>
                            <div class="tip-content">
                                <div class="tip-title">Commencez par 7 jours</div>
                                <div class="tip-text">Pour un premier scan, analysez les 7 derniers jours pour des résultats rapides et pertinents</div>
                            </div>
                        </div>
                        <div class="tip">
                            <div class="tip-icon">🎯</div>
                            <div class="tip-content">
                                <div class="tip-title">Activez l'IA</div>
                                <div class="tip-text">La classification automatique vous fait gagner du temps en organisant vos emails par catégorie</div>
                            </div>
                        </div>
                        <div class="tip">
                            <div class="tip-icon">📋</div>
                            <div class="tip-content">
                                <div class="tip-title">Tâches automatiques</div>
                                <div class="tip-text">L'IA crée des tâches pour les emails nécessitant une action de votre part</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotAuthenticated() {
        return `
            <div class="scanner-minimal">
                <div class="auth-needed-modern">
                    <div class="auth-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h2>Connexion requise</h2>
                    <p>Connectez-vous à votre compte Microsoft pour accéder à vos emails</p>
                    <button class="btn-modern btn-auth" onclick="window.authService.login()">
                        <i class="fab fa-microsoft"></i>
                        <span>Se connecter avec Microsoft</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderError(error) {
        return `
            <div class="scanner-minimal">
                <div class="error-state-modern">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h2>Problème d'initialisation</h2>
                    <p>${error.message}</p>
                    <div class="error-details-modern">
                        <div class="error-detail-item">
                            <span class="detail-label">Service d'authentification:</span>
                            <span class="detail-status ${window.authService ? 'status-ok' : 'status-error'}">
                                ${window.authService ? '✓ Disponible' : '✗ Indisponible'}
                            </span>
                        </div>
                        <div class="error-detail-item">
                            <span class="detail-label">Utilisateur authentifié:</span>
                            <span class="detail-status ${window.authService?.isAuthenticated() ? 'status-ok' : 'status-error'}">
                                ${window.authService?.isAuthenticated() ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                        <div class="error-detail-item">
                            <span class="detail-label">Service de messagerie:</span>
                            <span class="detail-status ${window.mailService ? 'status-ok' : 'status-error'}">
                                ${window.mailService ? '✓ Disponible' : '✗ Indisponible'}
                            </span>
                        </div>
                        <div class="error-detail-item">
                            <span class="detail-label">MailService initialisé:</span>
                            <span class="detail-status ${window.mailService?.isInitialized ? 'status-ok' : 'status-error'}">
                                ${window.mailService?.isInitialized ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                    </div>
                    <div class="error-actions">
                        <button class="btn-modern btn-retry" onclick="window.location.reload()">
                            <i class="fas fa-redo"></i>
                            <span>Réessayer</span>
                        </button>
                        <button class="btn-modern btn-diagnose" onclick="window.scanStartModule.runDiagnostic()">
                            <i class="fas fa-stethoscope"></i>
                            <span>Diagnostic</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async getUserInfo() {
        try {
            if (window.authService?.isAuthenticated()) {
                return await window.authService.getUserInfo();
            }
            return { displayName: 'Utilisateur' };
        } catch (error) {
            console.warn('[ScanStart] Could not get user info:', error);
            return { displayName: 'Utilisateur' };
        }
    }

    // ====================================================
    // GESTION DES ÉVÉNEMENTS
    // ====================================================
    initializeEvents() {
        console.log('[ScanStart] Initializing enhanced events...');
        
        // Mettre à jour l'aperçu en temps réel
        setTimeout(() => {
            this.updatePreview();
        }, 100);
    }
    
    selectDays(days) {
        this.selectedDays = days;
        this.scanSettings.startDate = this.getStartDateFromDays(days);
        
        // Mettre à jour l'UI
        document.querySelectorAll('.period-chip').forEach(chip => {
            chip.classList.remove('selected');
        });
        
        const selectedChip = document.querySelector(`.period-chip[onclick*="selectDays(${days})"]`);
        if (selectedChip) {
            selectedChip.classList.add('selected');
        }
        
        this.updatePreview();
        console.log(`[ScanStart] Selected period: ${days} days`);
    }
    
    toggleFolder(folderId) {
        const folderChip = document.querySelector(`.folder-chip[onclick*="toggleFolder('${folderId}')"]`);
        
        if (this.selectedFolders.includes(folderId)) {
            // Ne pas désélectionner le dernier dossier
            if (this.selectedFolders.length > 1) {
                this.selectedFolders = this.selectedFolders.filter(id => id !== folderId);
                if (folderChip) folderChip.classList.remove('selected');
            }
        } else {
            this.selectedFolders.push(folderId);
            if (folderChip) folderChip.classList.add('selected');
        }
        
        this.updatePreview();
        console.log(`[ScanStart] Selected folders: ${this.selectedFolders.join(', ')}`);
    }
    
    toggleAutoClassify() {
        const checkbox = document.getElementById('autoClassify');
        this.autoClassifyEmails = checkbox ? checkbox.checked : this.autoClassifyEmails;
        this.updatePreview();
        console.log(`[ScanStart] Auto classify: ${this.autoClassifyEmails}`);
    }
    
    toggleAutoTasks() {
        const checkbox = document.getElementById('autoTasks');
        this.autoCreateTasks = checkbox ? checkbox.checked : this.autoCreateTasks;
        this.updatePreview();
        console.log(`[ScanStart] Auto tasks: ${this.autoCreateTasks}`);
    }
    
    updatePreview() {
        // Mettre à jour l'aperçu de la période
        const previewPeriod = document.getElementById('previewPeriod');
        if (previewPeriod) {
            previewPeriod.textContent = `${this.selectedDays} dernier${this.selectedDays > 1 ? 's' : ''} jour${this.selectedDays > 1 ? 's' : ''}`;
        }
        
        // Mettre à jour l'aperçu des dossiers
        const previewFolders = document.getElementById('previewFolders');
        if (previewFolders) {
            const folderNames = this.selectedFolders.map(f => this.getFolderName(f));
            previewFolders.textContent = folderNames.join(', ');
        }
        
        // Mettre à jour l'aperçu de l'IA
        const previewAI = document.getElementById('previewAI');
        if (previewAI) {
            const features = [];
            if (this.autoClassifyEmails) features.push('Classification');
            if (this.autoCreateTasks) features.push('Tâches');
            previewAI.textContent = features.length > 0 ? features.join(' + ') : 'Désactivée';
        }
    }

    showAdvancedOptions() {
        if (window.pageManager?.loadPage) {
            window.pageManager.loadPage('settings');
        } else {
            alert('Options avancées disponibles dans les paramètres');
        }
    }

    // ====================================================
    // FONCTION DE SCAN ENHANCED
    // ====================================================
    async startEnhancedScan() {
        if (this.scanInProgress) {
            return;
        }
        
        console.log('[ScanStart] 🚀 Starting enhanced scan with settings:', {
            days: this.selectedDays,
            folders: this.selectedFolders,
            autoClassify: this.autoClassifyEmails,
            autoCreateTasks: this.autoCreateTasks
        });
        
        try {
            this.scanInProgress = true;
            this.showProgressInterface();
            
            // Vérification finale des services
            await this.performFinalServiceCheck();
            
            // Sauvegarder les paramètres
            this.saveScanSettings();
            
            // Démarrer le scan avec gestion d'erreurs robuste
            await this.performEnhancedEmailScan();
            
        } catch (error) {
            console.error('[ScanStart] ❌ Enhanced scan error:', error);
            this.handleScanError(error);
        }
    }
    
    showProgressInterface() {
        const scanAction = document.getElementById('scanAction');
        const progressContainer = document.getElementById('progressContainer');
        
        if (scanAction) scanAction.style.display = 'none';
        if (progressContainer) {
            progressContainer.style.display = 'block';
            // Afficher le bouton d'annulation après 5 secondes
            setTimeout(() => {
                const cancelBtn = document.getElementById('cancelScanBtn');
                if (cancelBtn && this.scanInProgress) {
                    cancelBtn.style.display = 'block';
                }
            }, 5000);
        }
    }
    
    async performFinalServiceCheck() {
        this.updateProgress(5, 'Vérification des services', 'Connexion à Microsoft Graph API...');
        
        // Vérifications détaillées
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Service d\'authentification non disponible ou utilisateur non connecté');
        }
        
        if (!window.mailService) {
            throw new Error('Service de messagerie non disponible');
        }
        
        if (!window.mailService.isInitialized) {
            console.log('[ScanStart] MailService not initialized, initializing now...');
            await window.mailService.initialize();
        }
        
        // Test d'accès token
        try {
            const token = await window.authService.getAccessToken();
            if (!token) {
                throw new Error('Impossible d\'obtenir le token d\'accès');
            }
            console.log('[ScanStart] ✅ Access token obtained');
        } catch (tokenError) {
            throw new Error(`Erreur d\'authentification: ${tokenError.message}`);
        }
        
        // Test de connexion MailService
        try {
            const connectionTest = await window.mailService.testConnection();
            if (!connectionTest.success) {
                throw new Error(`Test de connexion échoué: ${connectionTest.error}`);
            }
            console.log('[ScanStart] ✅ MailService connection test passed');
        } catch (testError) {
            throw new Error(`Test de connexion échoué: ${testError.message}`);
        }
    }
    
    async performEnhancedEmailScan() {
        const startTime = Date.now();
        
        try {
            // Étape 1: Préparation
            this.updateProgress(10, 'Préparation du scan', 'Configuration des paramètres...');
            
            const filters = {
                startDate: this.scanSettings.startDate,
                endDate: this.scanSettings.endDate,
                folders: this.selectedFolders,
                maxEmails: 1000
            };
            
            console.log('[ScanStart] Scan filters:', filters);
            
            // Étape 2: Récupération des emails par dossier
            this.updateProgress(20, 'Récupération des emails', 'Téléchargement depuis Microsoft Outlook...');
            
            let allEmails = [];
            let totalEmailsFound = 0;
            
            for (let i = 0; i < this.selectedFolders.length; i++) {
                const folder = this.selectedFolders[i];
                const folderProgress = 20 + (i * 30);
                
                this.updateProgress(
                    folderProgress, 
                    `Scan du dossier ${this.getFolderName(folder)}`, 
                    `Récupération des messages...`,
                    `Dossier ${i + 1}/${this.selectedFolders.length}`
                );
                
                try {
                    const folderEmails = await window.mailService.getEmailsFromFolder(folder, {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        top: Math.floor(filters.maxEmails / this.selectedFolders.length)
                    });
                    
                    console.log(`[ScanStart] ✅ Récupéré ${folderEmails.length} emails du dossier ${folder}`);
                    totalEmailsFound += folderEmails.length;
                    allEmails = allEmails.concat(folderEmails);
                    
                    this.updateProgress(
                        folderProgress + 15, 
                        `Dossier ${this.getFolderName(folder)} traité`, 
                        `${folderEmails.length} emails récupérés`,
                        `Total: ${totalEmailsFound} emails`
                    );
                    
                } catch (folderError) {
                    console.error(`[ScanStart] ❌ Erreur dossier ${folder}:`, folderError);
                    
                    this.updateProgress(
                        folderProgress, 
                        `Problème avec ${this.getFolderName(folder)}`, 
                        `Erreur: ${folderError.message}`,
                        `Continuant avec les autres dossiers...`
                    );
                    
                    // Attendre un peu avant de continuer
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            
            // Vérifier si on a des emails
            if (allEmails.length === 0) {
                throw new Error(`Aucun email trouvé pour la période du ${this.formatDate(filters.startDate)} au ${this.formatDate(filters.endDate)}`);
            }
            
            console.log(`[ScanStart] ✅ Total emails récupérés: ${allEmails.length}`);
            
            // Étape 3: Classification si activée
            if (this.autoClassifyEmails) {
                this.updateProgress(70, 'Classification intelligente', 'Analyse par IA des emails...');
                allEmails = await this.categorizeEmailsWithProgress(allEmails);
            }
            
            // Étape 4: Création de tâches si activée
            if (this.autoCreateTasks) {
                this.updateProgress(85, 'Création de tâches', 'Identification des actions requises...');
                await this.createTasksFromEmailsWithProgress(allEmails);
            }
            
            // Étape 5: Finalisation
            this.updateProgress(95, 'Finalisation', 'Sauvegarde des résultats...');
            
            const scanResults = {
                date: new Date().toISOString(),
                folders: this.selectedFolders,
                days: this.selectedDays,
                total: allEmails.length,
                emails: allEmails,
                scanDuration: Date.now() - startTime,
                version: '5.1',
                autoClassified: this.autoClassifyEmails,
                tasksCreated: this.autoCreateTasks,
                filters: filters
            };
            
            // Sauvegarder les résultats
            await this.saveEnhancedScanResults(scanResults);
            
            // Finaliser avec succès
            this.updateProgress(100, 'Scan terminé !', `${allEmails.length} emails analysés avec succès`);
            
            setTimeout(() => {
                this.completeScanWithSuccess(scanResults);
            }, 1500);
            
        } catch (error) {
            console.error('[ScanStart] ❌ Erreur lors du scan enhanced:', error);
            throw error;
        }
    }
    
    async categorizeEmailsWithProgress(emails) {
        console.log(`[ScanStart] 🏷️ Classification de ${emails.length} emails...`);
        
        if (!window.categoryManager) {
            console.warn('[ScanStart] CategoryManager non disponible, classification ignorée');
            return emails;
        }
        
        const categorizedEmails = [];
        const batchSize = 10; // Traiter par lots de 10
        
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const progressPercent = 70 + Math.floor((i / emails.length) * 15);
            
            this.updateProgress(
                progressPercent, 
                'Classification intelligente', 
                `Analyse de l'email ${i + 1} à ${Math.min(i + batchSize, emails.length)}/${emails.length}`,
                `IA en cours...`
            );
            
            // Traiter le lot
            for (const email of batch) {
                try {
                    const categoryResult = window.categoryManager.analyzeEmail(email);
                    const categoryId = categoryResult.category || 'other';
                    
                    // Ajouter les données de catégorie
                    const categorizedEmail = {
                        ...email,
                        category: categoryId,
                        categoryResult: categoryResult
                    };
                    
                    categorizedEmails.push(categorizedEmail);
                } catch (categoryError) {
                    console.error('[ScanStart] Erreur classification email:', categoryError);
                    categorizedEmails.push({ ...email, category: 'other' });
                }
            }
            
            // Petite pause pour ne pas bloquer l'UI
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        return categorizedEmails;
    }
    
    async createTasksFromEmailsWithProgress(emails) {
        if (!window.taskManager || !window.aiTaskAnalyzer) {
            console.warn('[ScanStart] Services de tâches non disponibles, création ignorée');
            return;
        }
        
        console.log('[ScanStart] 📋 Création de tâches automatique...');
        
        // Filtrer les emails importants
        const importantEmails = emails.filter(email => {
            // Exclure les domaines bannis
            if (email.from?.emailAddress?.address) {
                const domain = email.from.emailAddress.address.split('@')[1];
                if (this.excludedDomains.includes(domain)) {
                    return false;
                }
            }
            
            // Inclure selon l'importance ou la catégorie
            return email.importance === 'high' || 
                   (email.category && !['marketing_news', 'notifications'].includes(email.category));
        });
        
        console.log(`[ScanStart] 📋 ${importantEmails.length} emails identifiés pour création de tâches`);
        
        // Limiter à 5 tâches maximum
        const selectedEmails = importantEmails.slice(0, 5);
        
        for (let i = 0; i < selectedEmails.length; i++) {
            const email = selectedEmails[i];
            
            this.updateProgress(
                85 + Math.floor((i / selectedEmails.length) * 8),
                'Création de tâches',
                `Création de la tâche ${i + 1}/${selectedEmails.length}`,
                `Analyse de: ${email.subject?.substring(0, 50) || 'Email sans sujet'}...`
            );
            
            try {
                // Analyser l'email pour créer une tâche
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email, {
                    quickMode: true
                });
                
                if (analysis && analysis.mainTask) {
                    const taskData = {
                        id: this.generateTaskId(),
                        title: analysis.mainTask.title,
                        description: analysis.mainTask.description,
                        priority: analysis.mainTask.priority,
                        dueDate: analysis.mainTask.dueDate,
                        status: 'todo',
                        emailId: email.id,
                        category: email.category || 'other',
                        createdAt: new Date().toISOString(),
                        aiGenerated: true,
                        method: 'enhanced-scan'
                    };
                    
                    window.taskManager.createTask(taskData);
                    console.log(`[ScanStart] ✅ Tâche créée: ${taskData.title}`);
                }
            } catch (error) {
                console.error('[ScanStart] Erreur création tâche:', error);
            }
            
            // Petite pause
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Sauvegarder les tâches
        window.taskManager.saveTasks();
    }
    
    async saveEnhancedScanResults(scanResults) {
        try {
            // Sauvegarder le résumé du scan
            const scanSummary = {
                date: scanResults.date,
                folders: scanResults.folders,
                days: scanResults.days,
                total: scanResults.total,
                scanDuration: scanResults.scanDuration,
                version: scanResults.version,
                autoClassified: scanResults.autoClassified,
                tasksCreated: scanResults.tasksCreated,
                filters: scanResults.filters
            };
            
            localStorage.setItem('lastScanData', JSON.stringify(scanSummary));
            console.log('[ScanStart] ✅ Scan summary saved');
            
            // Optimiser et sauvegarder les emails
            const optimizedEmails = this.optimizeEmailsForStorage(scanResults.emails);
            
            try {
                localStorage.setItem('scannedEmails', JSON.stringify(optimizedEmails));
                console.log('[ScanStart] ✅ Emails sauvegardés:', optimizedEmails.length);
                
            } catch (storageError) {
                console.warn('[ScanStart] ⚠️ Erreur de stockage, utilisation du mode compact:', storageError);
                
                // Version très compacte en cas d'erreur
                const compactEmails = scanResults.emails.slice(0, 200).map(email => ({
                    id: email.id,
                    subject: email.subject?.substring(0, 100) || 'Sans sujet',
                    from: email.from,
                    receivedDateTime: email.receivedDateTime,
                    category: email.category
                }));
                
                localStorage.setItem('scannedEmails', JSON.stringify(compactEmails));
                
                if (window.uiManager?.showToast) {
                    window.uiManager.showToast(
                        'Emails sauvegardés en mode compact (limite de stockage)',
                        'warning'
                    );
                }
            }
            
        } catch (error) {
            console.error('[ScanStart] ❌ Erreur critique de sauvegarde:', error);
            throw new Error('Impossible de sauvegarder les résultats du scan');
        }
        
        // Sauvegarder aussi dans EmailScanner si disponible
        if (window.emailScanner) {
            window.emailScanner.emails = scanResults.emails;
            console.log('[ScanStart] ✅ Emails also saved in EmailScanner');
        }
    }
    
    completeScanWithSuccess(scanResults) {
        // Notification de succès
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(
                `✅ Scan terminé ! ${scanResults.total} emails analysés en ${Math.round(scanResults.scanDuration / 1000)}s`, 
                'success',
                5000
            );
        }
        
        // Redirection vers les emails
        setTimeout(() => {
            if (window.pageManager?.loadPage) {
                window.pageManager.loadPage('emails');
            } else {
                console.log('[ScanStart] Navigation non disponible, affichage des résultats ici');
                this.showScanResultsInline(scanResults);
            }
        }, 2000);
    }
    
    showScanResultsInline(scanResults) {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.innerHTML = `
                <div class="scan-results-inline">
                    <div class="results-header">
                        <i class="fas fa-check-circle" style="color: #10b981; font-size: 48px;"></i>
                        <h3>Scan terminé avec succès !</h3>
                    </div>
                    <div class="results-stats">
                        <div class="stat-item">
                            <div class="stat-value">${scanResults.total}</div>
                            <div class="stat-label">Emails analysés</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${Math.round(scanResults.scanDuration / 1000)}s</div>
                            <div class="stat-label">Durée du scan</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${scanResults.folders.length}</div>
                            <div class="stat-label">Dossiers scannés</div>
                        </div>
                    </div>
                    <div class="results-actions">
                        <button class="btn-modern btn-primary" onclick="window.pageManager?.loadPage('emails') || window.location.reload()">
                            <i class="fas fa-envelope"></i>
                            Voir les emails
                        </button>
                        <button class="btn-modern btn-secondary" onclick="window.scanStartModule.resetScanInterface()">
                            <i class="fas fa-redo"></i>
                            Nouveau scan
                        </button>
                    </div>
                </div>
            `;
        }
    }

    handleScanError(error) {
        console.error('[ScanStart] Handling scan error:', error);
        
        this.updateProgress(
            0, 
            'Erreur de scan', 
            error.message,
            'Le scan a été interrompu'
        );
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(`Erreur: ${error.message}`, 'error', 8000);
        }
        
        // Afficher les options de récupération après 3 secondes
        setTimeout(() => {
            const progressContainer = document.getElementById('progressContainer');
            if (progressContainer) {
                progressContainer.innerHTML = `
                    <div class="scan-error-inline">
                        <div class="error-header">
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 48px;"></i>
                            <h3>Erreur pendant le scan</h3>
                        </div>
                        <div class="error-message">
                            <p>${error.message}</p>
                        </div>
                        <div class="error-actions">
                            <button class="btn-modern btn-retry" onclick="window.scanStartModule.resetScanInterface()">
                                <i class="fas fa-redo"></i>
                                Réessayer
                            </button>
                            <button class="btn-modern btn-diagnose" onclick="window.scanStartModule.runDiagnostic()">
                                <i class="fas fa-stethoscope"></i>
                                Diagnostic
                            </button>
                        </div>
                    </div>
                `;
            }
        }, 3000);
        
        this.scanInProgress = false;
    }

    cancelScan() {
        console.log('[ScanStart] Scan cancelled by user');
        
        this.scanInProgress = false;
        
        this.updateProgress(
            0, 
            'Scan annulé', 
            'Le scan a été annulé par l\'utilisateur',
            ''
        );
        
        setTimeout(() => {
            this.resetScanInterface();
        }, 2000);
    }

    async runDiagnostic() {
        console.log('[ScanStart] Running comprehensive diagnostic...');
        
        const diagnosticResults = {
            timestamp: new Date().toISOString(),
            authService: null,
            mailService: null,
            connectivity: null,
            configuration: null
        };
        
        // Test AuthService
        try {
            diagnosticResults.authService = {
                available: !!window.authService,
                authenticated: window.authService?.isAuthenticated() || false,
                diagnostic: window.authService?.getDiagnosticInfo?.() || null
            };
        } catch (e) {
            diagnosticResults.authService = { error: e.message };
        }
        
        // Test MailService
        try {
            diagnosticResults.mailService = {
                available: !!window.mailService,
                initialized: window.mailService?.isInitialized || false,
                diagnostic: window.mailService?.getDebugInfo?.() || null
            };
            
            if (window.mailService?.testConnection) {
                diagnosticResults.connectivity = await window.mailService.testConnection();
            }
        } catch (e) {
            diagnosticResults.mailService = { error: e.message };
        }
        
        // Test Configuration
        try {
            diagnosticResults.configuration = window.AppConfig?.getDebugInfo?.() || null;
        } catch (e) {
            diagnosticResults.configuration = { error: e.message };
        }
        
        console.group('🔍 DIAGNOSTIC COMPLET DU SCANNER');
        console.log('📊 Résultats:', diagnosticResults);
        console.groupEnd();
        
        // Afficher les résultats
        this.showDiagnosticResults(diagnosticResults);
    }
    
    showDiagnosticResults(results) {
        const content = `
            <div class="diagnostic-modal">
                <div class="diagnostic-header">
                    <h3>Diagnostic du scanner</h3>
                </div>
                <div class="diagnostic-content">
                    <div class="diagnostic-section">
                        <h4>🔐 Service d'authentification</h4>
                        <div class="diagnostic-item">
                            <span>Disponible:</span>
                            <span class="${results.authService?.available ? 'status-ok' : 'status-error'}">
                                ${results.authService?.available ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                        <div class="diagnostic-item">
                            <span>Authentifié:</span>
                            <span class="${results.authService?.authenticated ? 'status-ok' : 'status-error'}">
                                ${results.authService?.authenticated ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="diagnostic-section">
                        <h4>📧 Service de messagerie</h4>
                        <div class="diagnostic-item">
                            <span>Disponible:</span>
                            <span class="${results.mailService?.available ? 'status-ok' : 'status-error'}">
                                ${results.mailService?.available ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                        <div class="diagnostic-item">
                            <span>Initialisé:</span>
                            <span class="${results.mailService?.initialized ? 'status-ok' : 'status-error'}">
                                ${results.mailService?.initialized ? '✓ Oui' : '✗ Non'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="diagnostic-section">
                        <h4>🌐 Connectivité</h4>
                        <div class="diagnostic-item">
                            <span>Microsoft Graph:</span>
                            <span class="${results.connectivity?.success ? 'status-ok' : 'status-error'}">
                                ${results.connectivity?.success ? '✓ Accessible' : '✗ Inaccessible'}
                            </span>
                        </div>
                        ${results.connectivity?.error ? `
                        <div class="diagnostic-error">
                            Erreur: ${results.connectivity.error}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="diagnostic-actions">
                        <button class="btn-modern" onclick="window.uiManager?.closeModal?.()">Fermer</button>
                        <button class="btn-modern btn-primary" onclick="window.location.reload()">Actualiser</button>
                    </div>
                </div>
            </div>
        `;
        
        if (window.uiManager?.showModal) {
            window.uiManager.showModal(content, { title: 'Diagnostic', size: 'medium' });
        } else {
            alert('Diagnostic terminé. Consultez la console pour les détails.');
        }
    }

    // ====================================================
    // FONCTIONS UTILITAIRES
    // ====================================================
    updateProgress(progress, status, detail, stats = '') {
        const progressFill = document.getElementById('progressFill');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressTitle = document.getElementById('progressTitle');
        const progressText = document.getElementById('progressText');
        const progressStats = document.getElementById('progressStats');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressPercentage) progressPercentage.textContent = `${progress}%`;
        if (progressTitle) progressTitle.textContent = status;
        if (progressText) progressText.textContent = detail;
        if (progressStats && stats) progressStats.textContent = stats;
    }
    
    getFolderName(folderId) {
        const folderNames = {
            'inbox': 'Boîte de réception',
            'junkemail': 'Courrier indésirable',
            'sentitems': 'Éléments envoyés',
            'drafts': 'Brouillons',
            'archive': 'Archive'
        };
        return folderNames[folderId] || folderId;
    }
    
    resetScanInterface() {
        const scanAction = document.getElementById('scanAction');
        const progressContainer = document.getElementById('progressContainer');
        
        if (scanAction) scanAction.style.display = 'flex';
        if (progressContainer) progressContainer.style.display = 'none';
        
        this.scanInProgress = false;
        console.log('[ScanStart] ✅ Interface reset');
    }
    
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }
    
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    optimizeEmailsForStorage(emails) {
        return emails.map(email => ({
            id: email.id,
            subject: email.subject,
            from: email.from,
            receivedDateTime: email.receivedDateTime,
            bodyPreview: email.bodyPreview?.substring(0, 200),
            importance: email.importance,
            hasAttachments: email.hasAttachments,
            category: email.category,
            categoryResult: email.categoryResult,
            sourceFolder: email.sourceFolder
        }));
    }
    
    saveScanSettings() {
        try {
            const settings = {
                selectedDays: this.selectedDays,
                selectedFolders: this.selectedFolders,
                autoClassifyEmails: this.autoClassifyEmails,
                autoCreateTasks: this.autoCreateTasks,
                excludedDomains: this.excludedDomains,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('scanSettings', JSON.stringify(settings));
            console.log('[ScanStart] ✅ Settings saved');
        } catch (e) {
            console.warn('[ScanStart] Could not save settings:', e);
        }
    }
