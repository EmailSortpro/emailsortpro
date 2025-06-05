// startscan.js - Version 5.0 - Scanner d'emails moderne, minimaliste et en une seule vue

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
        console.log('[ScanStart] Module initialized - MODERN MINIMAL EMAIL SCANNER v5.0');
    }

    getExcludedDomains() {
        // Récupérer les domaines exclus des paramètres ou utiliser des valeurs par défaut
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
        console.log('[ScanStart] Rendering modern minimal scanner interface...');
        
        try {
            // Toujours ajouter les styles d'abord pour s'assurer qu'ils sont appliqués
            this.addModernStyles();
            
            if (!window.authService?.isAuthenticated()) {
                container.innerHTML = this.renderNotAuthenticated();
                return;
            }

            // Vérifier que MailService est disponible
            await this.checkServices();

            const userInfo = await this.getUserInfo();
            container.innerHTML = this.renderMinimalScanInterface(userInfo);
            this.initializeEvents();
            this.isInitialized = true;
            
            // Force le rechargement des styles après le rendu
            setTimeout(() => {
                // Réappliquer les styles pour s'assurer qu'ils sont prioritaires
                this.addModernStyles();
            }, 100);
            
            console.log('[ScanStart] ✅ Modern minimal scanner interface ready');
            
        } catch (error) {
            console.error('[ScanStart] Error rendering interface:', error);
            container.innerHTML = this.renderError(error);
        }
    }

    async checkServices() {
        console.log('[ScanStart] Checking required services...');
        
        // Vérifier AuthService
        if (!window.authService) {
            throw new Error('AuthService not available');
        }
        
        if (!window.authService.isAuthenticated()) {
            throw new Error('User not authenticated');
        }

        // Vérifier MailService
        if (!window.mailService) {
            throw new Error('MailService not available');
        }

        // Vérifier que la méthode existe
        if (typeof window.mailService.getEmailsFromFolder !== 'function') {
            throw new Error('MailService.getEmailsFromFolder method not available');
        }

        // Initialiser MailService si nécessaire
        try {
            await window.mailService.initialize();
            console.log('[ScanStart] ✅ MailService initialized');
        } catch (initError) {
            console.warn('[ScanStart] MailService initialization warning:', initError);
        }
    }

    renderMinimalScanInterface(userInfo) {
        return `
            <div class="scanner-minimal">
                <!-- En-tête -->
                <div class="scanner-header">
                    <h1 class="scanner-title">
                        <i class="fas fa-search"></i>
                        Scanner d'emails
                    </h1>
                    <p class="scanner-subtitle">Retrouvez et organisez vos emails importants en quelques secondes</p>
                </div>
                
                <!-- Contenu principal -->
                <div class="scanner-content">
                    <!-- Onglets de configuration -->
                    <div class="scan-tabs">
                        <div class="scan-tab active" data-tab="period">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Période</span>
                        </div>
                        <div class="scan-tab" data-tab="folders">
                            <i class="fas fa-folder"></i>
                            <span>Dossiers</span>
                        </div>
                        <div class="scan-tab" data-tab="automation">
                            <i class="fas fa-robot"></i>
                            <span>Automatisation</span>
                        </div>
                    </div>
                    
                    <!-- Contenu des onglets -->
                    <div class="tab-content">
                        <!-- Onglet Période -->
                        <div class="tab-pane active" id="period-tab">
                            <div class="period-selector">
                                <div class="period-chip" onclick="window.scanStartModule.selectDays(1)">1 jour</div>
                                <div class="period-chip" onclick="window.scanStartModule.selectDays(3)">3 jours</div>
                                <div class="period-chip selected" onclick="window.scanStartModule.selectDays(7)">7 jours</div>
                                <div class="period-chip" onclick="window.scanStartModule.selectDays(15)">15 jours</div>
                                <div class="period-chip" onclick="window.scanStartModule.selectDays(30)">30 jours</div>
                            </div>
                        </div>
                        
                        <!-- Onglet Dossiers -->
                        <div class="tab-pane" id="folders-tab">
                            <div class="folders-selector">
                                <div class="folder-chip selected" onclick="window.scanStartModule.toggleFolder('inbox')">
                                    <i class="fas fa-inbox"></i>
                                    Boîte de réception
                                </div>
                                <div class="folder-chip" onclick="window.scanStartModule.toggleFolder('junkemail')">
                                    <i class="fas fa-trash-alt"></i>
                                    Spam
                                </div>
                            </div>
                        </div>
                        
                        <!-- Onglet Automatisation -->
                        <div class="tab-pane" id="automation-tab">
                            <div class="ai-options">
                                <div class="switch-option">
                                    <label class="switch">
                                        <input type="checkbox" id="autoClassify" 
                                            ${this.autoClassifyEmails ? 'checked' : ''}
                                            onchange="window.scanStartModule.toggleAutoClassify()">
                                        <span class="slider"></span>
                                    </label>
                                    <span class="option-label">Classement automatique</span>
                                </div>
                                
                                <div class="switch-option">
                                    <label class="switch">
                                        <input type="checkbox" id="autoTasks" 
                                            ${this.autoCreateTasks ? 'checked' : ''}
                                            onchange="window.scanStartModule.toggleAutoTasks()">
                                        <span class="slider"></span>
                                    </label>
                                    <span class="option-label">Créer des tâches</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action de scan -->
                    <div id="scanAction" class="scan-action">
                        <button class="btn-scan" id="startScanBtn" onclick="window.scanStartModule.startRealScan()">
                            <i class="fas fa-search"></i>
                            <span>Lancer le scan</span>
                        </button>
                        
                        <div class="settings-shortcut">
                            <a href="#" class="settings-link" onclick="window.scanStartModule.showSettingsPromo()">
                                <i class="fas fa-cog"></i>
                                <span>Configurer vos catégories et mots-clés</span>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Barre de progression -->
                    <div id="progressContainer" class="progress-container" style="display: none;">
                        <div class="progress-bar">
                            <div id="progressFill" class="progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="progress-status">
                            <div id="progressPercentage" class="progress-percentage">0%</div>
                            <div id="progressText" class="progress-text">Initialisation...</div>
                        </div>
                    </div>
                    
                    <!-- Comment ça marche -->
                    <div class="how-it-works">
                        <div class="process-title">
                            <i class="fas fa-magic"></i>
                            Comment fonctionne le scanner
                        </div>
                        <div class="process-steps">
                            <div class="process-step">
                                <div class="step-number">1</div>
                                <div class="step-title">Analyse des emails</div>
                                <div class="step-description">Le scanner parcourt vos emails pour identifier les messages importants</div>
                            </div>
                            
                            <div class="process-step">
                                <div class="step-number">2</div>
                                <div class="step-title">Détection par mots-clés</div>
                                <div class="step-description">Les emails sont classés selon vos catégories et mots-clés configurés</div>
                            </div>
                            
                            <div class="process-step">
                                <div class="step-number">3</div>
                                <div class="step-title">Classification automatique</div>
                                <div class="step-description">L'IA attribue chaque email à la catégorie la plus pertinente</div>
                            </div>
                            
                            <div class="process-step">
                                <div class="step-number">4</div>
                                <div class="step-title">Création de tâches</div>
                                <div class="step-description">Des tâches sont créées pour les emails nécessitant une action de votre part</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal de promotion des paramètres -->
            <div id="settingsPromoModal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">Pourquoi configurer avant de scanner ?</h3>
                        <button class="modal-close" onclick="window.scanStartModule.closeSettingsPromo()">×</button>
                    </div>
                    
                    <div class="settings-promo-content">
                        <div class="settings-benefit">
                            <div class="benefit-icon">
                                <i class="fas fa-key"></i>
                            </div>
                            <div class="benefit-text">
                                <div class="benefit-title">Personnalisez vos mots-clés</div>
                                <div class="benefit-description">Définissez des mots-clés spécifiques pour chaque catégorie afin de classer vos emails avec précision selon vos besoins</div>
                            </div>
                        </div>
                        
                        <div class="settings-benefit">
                            <div class="benefit-icon">
                                <i class="fas fa-filter"></i>
                            </div>
                            <div class="benefit-text">
                                <div class="benefit-title">Créez des règles d'exclusion</div>
                                <div class="benefit-description">Excluez certains expéditeurs ou domaines pour éviter de traiter les emails non pertinents comme les newsletters</div>
                            </div>
                        </div>
                        
                        <div class="settings-benefit">
                            <div class="benefit-icon">
                                <i class="fas fa-check-square"></i>
                            </div>
                            <div class="benefit-text">
                                <div class="benefit-title">Automatisez la création de tâches</div>
                                <div class="benefit-description">Configurez quelles catégories d'emails génèrent automatiquement des tâches et avec quelle priorité</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary-modal" onclick="window.scanStartModule.closeSettingsPromo()">Plus tard</button>
                        <button class="btn-modal btn-primary-modal" onclick="window.scanStartModule.goToSettings()">Configurer maintenant</button>
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
                    <h2>Impossible d'initialiser le scanner</h2>
                    <p>${error.message}</p>
                    <div class="error-details-modern">
                        <div class="error-detail-item">
                            <span class="detail-label">Service d'authentification:</span>
                            <span class="detail-status ${window.authService ? 'status-ok' : 'status-error'}">
                                ${window.authService ? '✓ Disponible' : '✗ Indisponible'}
                            </span>
                        </div>
                        <div class="error-detail-item">
                            <span class="detail-label">Service de messagerie:</span>
                            <span class="detail-status ${window.mailService ? 'status-ok' : 'status-error'}">
                                ${window.mailService ? '✓ Disponible' : '✗ Indisponible'}
                            </span>
                        </div>
                    </div>
                    <button class="btn-modern btn-retry" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        <span>Réessayer</span>
                    </button>
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
    // GESTION DES ONGLETS
    // ====================================================
    initializeEvents() {
        console.log('[ScanStart] Initializing events for minimal UI...');
        
        // Initialiser les gestionnaires d'événements pour les onglets
        setTimeout(() => {
            const tabs = document.querySelectorAll('.scan-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchTab(tab.dataset.tab);
                });
            });
        }, 100);
    }
    
    switchTab(tabId) {
        console.log(`[ScanStart] Switching to tab: ${tabId}`);
        
        // Mettre à jour les onglets actifs
        document.querySelectorAll('.scan-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.scan-tab[data-tab="${tabId}"]`)?.classList.add('active');
        
        // Mettre à jour le contenu des onglets
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`)?.classList.add('active');
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
        
        console.log(`[ScanStart] Selected folders: ${this.selectedFolders.join(', ')}`);
    }
    
    toggleAutoClassify() {
        const checkbox = document.getElementById('autoClassify');
        this.autoClassifyEmails = checkbox ? checkbox.checked : this.autoClassifyEmails;
        console.log(`[ScanStart] Auto classify: ${this.autoClassifyEmails}`);
    }
    
    toggleAutoTasks() {
        const checkbox = document.getElementById('autoTasks');
        this.autoCreateTasks = checkbox ? checkbox.checked : this.autoCreateTasks;
        console.log(`[ScanStart] Auto tasks: ${this.autoCreateTasks}`);
    }
    
    toggleCategory(element) {
        if (element) {
            element.classList.toggle('selected');
            console.log(`[ScanStart] Category toggled: ${element.textContent.trim()}`);
        }
    }
    
    loadCategoriesFromSettings() {
        const categoriesContainer = document.getElementById('dynamicCategories');
        if (!categoriesContainer) return;
        
        // Charger les catégories depuis CategoryManager
        let categories = [];
        
        if (window.categoryManager && window.categoryManager.getCategories) {
            const allCategories = window.categoryManager.getCategories();
            
            // Récupérer les catégories pré-sélectionnées pour les tâches
            let preselectedCategories = [];
            try {
                const settings = JSON.parse(localStorage.getItem('categorySettings')) || {};
                preselectedCategories = settings.taskPreselectedCategories || [];
            } catch (e) {
                console.warn('[ScanStart] Error loading preselected categories:', e);
            }
            
            // Transformer en format utilisable
            categories = Object.entries(allCategories).map(([id, cat]) => ({
                id: id,
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                bgColor: `${cat.color}20`,
                selected: preselectedCategories.includes(id)
            }));
        } else {
            // Catégories par défaut si CategoryManager n'est pas disponible
            categories = [
                { id: 'urgent', name: 'Urgent', icon: '🔥', color: '#b91c1c', bgColor: '#fee2e280', selected: true },
                { id: 'work', name: 'Travail', icon: '💼', color: '#1e40af', bgColor: '#dbeafe80', selected: true },
                { id: 'finance', name: 'Finance', icon: '💰', color: '#166534', bgColor: '#dcfce780', selected: true },
                { id: 'personal', name: 'Personnel', icon: '👤', color: '#7c3aed', bgColor: '#ede9fe80', selected: false },
                { id: 'admin', name: 'Administratif', icon: '📋', color: '#475569', bgColor: '#f1f5f980', selected: false },
            ];
        }
        
        // Limiter à 5 catégories maximum pour éviter la surcharge
        categories = categories.slice(0, 5);
        
        // Générer le HTML des catégories
        categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = `category-chip${category.selected ? ' selected' : ''}`;
            categoryElement.style.background = category.bgColor;
            categoryElement.style.color = category.color;
            categoryElement.onclick = function() { window.scanStartModule.toggleCategory(this); };
            categoryElement.innerHTML = `<span>${category.icon}</span> ${category.name}`;
            categoryElement.dataset.categoryId = category.id;
            
            categoriesContainer.appendChild(categoryElement);
        });
        
        console.log(`[ScanStart] Loaded ${categories.length} categories from settings`);
    }
    
    showSettingsPromo() {
        const modal = document.getElementById('settingsPromoModal');
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    closeSettingsPromo() {
        const modal = document.getElementById('settingsPromoModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    goToSettings() {
        this.closeSettingsPromo();
        if (window.pageManager?.loadPage) {
            window.pageManager.loadPage('settings');
        } else {
            console.warn('[ScanStart] PageManager not available for settings navigation');
            alert('Page de paramètres non disponible');
        }
    }

    // ====================================================
    // FONCTION DE SCAN RÉEL
    // ====================================================
    async startRealScan() {
        if (this.scanInProgress) {
            return;
        }
        
        // Récupérer les catégories sélectionnées
        const selectedCategoryIds = this.getSelectedCategoryIds();
        
        console.log('[ScanStart] 🚀 Starting minimal scan with settings:', {
            days: this.selectedDays,
            folders: this.selectedFolders,
            autoClassify: this.autoClassifyEmails,
            autoCreateTasks: this.autoCreateTasks,
            selectedCategories: selectedCategoryIds
        });
        
        try {
            this.scanInProgress = true;
            
            const scanAction = document.getElementById('scanAction');
            const progressContainer = document.getElementById('progressContainer');
            
            if (scanAction) scanAction.style.display = 'none';
            if (progressContainer) progressContainer.style.display = 'block';
            
            // Vérification finale des services
            await this.finalServiceCheck();
            
            // Sauvegarder les catégories sélectionnées
            this.saveSelectedCategories(selectedCategoryIds);
            
            // Démarrer le scan réel
            await this.performRealEmailScan(selectedCategoryIds);
            
        } catch (error) {
            console.error('[ScanStart] ❌ Scan error:', error);
            this.updateProgress(0, 'Erreur de scan', error.message);
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }
            
            setTimeout(() => {
                this.resetScanInterface();
            }, 3000);
        }
    }
    
    getSelectedCategoryIds() {
        // Pour cette version simplifiée sans catégories, on utilise les catégories
        // pré-sélectionnées des paramètres par défaut
        try {
            const settings = JSON.parse(localStorage.getItem('categorySettings')) || {};
            return settings.taskPreselectedCategories || [];
        } catch (e) {
            console.warn('[ScanStart] Error loading selected categories:', e);
            return [];
        }
    }
    
    saveSelectedCategories(categoryIds) {
        try {
            // Mettre à jour les catégories pré-sélectionnées dans les paramètres
            const settings = JSON.parse(localStorage.getItem('categorySettings')) || {};
            settings.taskPreselectedCategories = categoryIds;
            localStorage.setItem('categorySettings', JSON.stringify(settings));
            
            console.log(`[ScanStart] Saved ${categoryIds.length} selected categories to settings`);
        } catch (e) {
            console.warn('[ScanStart] Error saving selected categories:', e);
        }
    }
    
    async finalServiceCheck() {
        this.updateProgress(5, 'Vérification des services', 'Connexion à Microsoft Graph...');
        
        // Vérifications de base
        if (!window.authService || !window.authService.isAuthenticated()) {
            throw new Error('Service d\'authentification non disponible');
        }
        
        if (!window.mailService) {
            throw new Error('Service de messagerie non disponible');
        }
        
        if (typeof window.mailService.getEmailsFromFolder !== 'function') {
            throw new Error('Fonction de scan non disponible');
        }
        
        // Test d'accès token
        try {
            const token = await window.authService.getAccessToken();
            if (!token) {
                throw new Error('Impossible d\'obtenir le token d\'accès');
            }
        } catch (tokenError) {
            throw new Error(`Erreur d\'authentification: ${tokenError.message}`);
        }
    }
    
    async performRealEmailScan(selectedCategoryIds) {
        const startTime = Date.now();
        
        try {
            // Étape 1: Connexion
            this.updateProgress(10, 'Connexion établie', 'Préparation du scan...');
            
            // Étape 2: Construction des filtres
            this.updateProgress(20, 'Configuration', 'Définition des critères de recherche...');
            
            const filters = {
                startDate: this.scanSettings.startDate,
                endDate: this.scanSettings.endDate,
                folders: this.selectedFolders,
                maxEmails: 1000
            };
            
            // Étape 3: Récupération des emails
            this.updateProgress(30, 'Récupération des emails', 'Téléchargement depuis votre boîte mail...');
            
            let allEmails = [];
            
            for (let i = 0; i < this.selectedFolders.length; i++) {
                const folder = this.selectedFolders[i];
                const folderProgress = 30 + (i * 15);
                
                this.updateProgress(
                    folderProgress, 
                    `Scan du dossier ${this.getFolderName(folder)}`, 
                    `Récupération des messages...`
                );
                
                try {
                    const folderEmails = await window.mailService.getEmailsFromFolder(folder, {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        top: Math.floor(filters.maxEmails / this.selectedFolders.length)
                    });
                    
                    console.log(`[ScanStart] ✅ Récupéré ${folderEmails.length} emails du dossier ${folder}`);
                    allEmails = allEmails.concat(folderEmails);
                    
                } catch (folderError) {
                    console.error(`[ScanStart] ❌ Erreur dossier ${folder}:`, folderError);
                    
                    this.updateProgress(
                        folderProgress, 
                        `Problème avec ${this.getFolderName(folder)}`, 
                        `${folderError.message}`
                    );
                    
                    // Continuer avec les autres dossiers
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            // Vérifier si on a des emails
            if (allEmails.length === 0) {
                throw new Error('Aucun email trouvé pour la période sélectionnée');
            }
            
            // Étape 4: Classification si activée
            if (this.autoClassifyEmails) {
                this.updateProgress(75, 'Classification des emails', 'Analyse par intelligence artificielle...');
                allEmails = await this.categorizeEmails(allEmails);
            }
            
            // Étape 5: Création de tâches si activée
            if (this.autoCreateTasks) {
                this.updateProgress(85, 'Création de tâches', 'Identification des actions requises...');
                await this.createTasksFromEmails(allEmails, selectedCategoryIds);
            }
            
            // Étape 6: Finalisation
            this.updateProgress(95, 'Finalisation', 'Préparation de l\'affichage...');
            
            const scanResults = {
                date: new Date().toISOString(),
                folders: this.selectedFolders,
                days: this.selectedDays,
                total: allEmails.length,
                emails: allEmails,
                scanDuration: Date.now() - startTime,
                version: '5.0',
                autoClassified: this.autoClassifyEmails,
                tasksCreated: this.autoCreateTasks,
                selectedCategories: selectedCategoryIds
            };
            
            // Sauvegarder les résultats
            this.saveRealScanResults(scanResults);
            
            // Finaliser
            this.updateProgress(100, 'Scan terminé !', `${allEmails.length} emails analysés avec succès`);
            
            setTimeout(() => {
                this.completeRealScan(scanResults);
            }, 1000);
            
        } catch (error) {
            console.error('[ScanStart] ❌ Erreur lors du scan:', error);
            throw error;
        }
    }
    
    async categorizeEmails(emails) {
        console.log(`[ScanStart] 🏷️ Classification de ${emails.length} emails...`);
        
        const categorizedEmails = [];
        
        // Récupérer les catégories
        const categories = window.categoryManager?.getCategories() || {};
        
        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            
            // Mettre à jour progression toutes les 10 emails
            if (i % 10 === 0) {
                const progressPercent = 75 + Math.floor((i / emails.length) * 10);
                this.updateProgress(
                    progressPercent, 
                    'Classification en cours', 
                    `Analyse de l'email ${i + 1}/${emails.length}`
                );
            }
            
            // Utiliser CategoryManager pour analyser l'email
            let categoryResult = { category: 'other' };
            
            if (window.categoryManager) {
                try {
                    categoryResult = window.categoryManager.analyzeEmail(email);
                } catch (categoryError) {
                    console.error('[ScanStart] Erreur classification:', categoryError);
                }
            }
            
            // Assigner la catégorie
            const categoryId = categoryResult.category || 'other';
            const categoryData = categories[categoryId] || { name: 'Autres', icon: '📌', color: '#6B7280' };
            
            // Ajouter les données de catégorie à l'email
            const categorizedEmail = {
                ...email,
                category: categoryId,
                categoryName: categoryData.name,
                categoryIcon: categoryData.icon,
                categoryColor: categoryData.color
            };
            
            categorizedEmails.push(categorizedEmail);
        }
        
        return categorizedEmails;
    }
    
    async createTasksFromEmails(emails, selectedCategoryIds) {
        if (!window.taskManager || !window.aiTaskAnalyzer) {
            console.warn('[ScanStart] Création de tâches ignorée - services requis non disponibles');
            return;
        }
        
        console.log('[ScanStart] 📋 Création de tâches automatique...');
        
        // Filtrer les emails importants en fonction des catégories sélectionnées
        const importantEmails = emails.filter(email => {
            // Vérifier les domaines exclus
            if (email.from?.emailAddress?.address) {
                const domain = email.from.emailAddress.address.split('@')[1];
                if (this.excludedDomains.includes(domain)) {
                    return false;
                }
            }
            
            // Filtrer selon la catégorie si classifié
            if (email.category && selectedCategoryIds.length > 0) {
                return selectedCategoryIds.includes(email.category);
            }
            
            return email.importance === 'high';
        });
        
        console.log(`[ScanStart] 📋 ${importantEmails.length} emails importants identifiés pour création de tâches`);
        
        // Limiter le nombre de tâches à créer
        const maxTasksToCreate = Math.min(importantEmails.length, 5);
        const selectedEmails = importantEmails.slice(0, maxTasksToCreate);
        
        // Créer les tâches
        for (let i = 0; i < selectedEmails.length; i++) {
            const email = selectedEmails[i];
            
            this.updateProgress(
                85 + Math.floor((i / selectedEmails.length) * 5),
                'Création de tâches',
                `Tâche ${i + 1}/${selectedEmails.length} en cours de création`
            );
            
            try {
                // Analyse de l'email pour tâche
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email, {
                    quickMode: true
                });
                
                // Créer la tâche
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
                        method: 'auto-scan'
                    };
                    
                    window.taskManager.createTask(taskData);
                }
            } catch (error) {
                console.error('[ScanStart] Erreur création tâche:', error);
            }
        }
        
        // Sauvegarder les tâches
        window.taskManager.saveTasks();
    }
    
    saveRealScanResults(scanResults) {
        try {
            // Sauvegarder les données du scan
            const scanSummary = {
                date: scanResults.date,
                folders: scanResults.folders,
                days: scanResults.days,
                total: scanResults.total,
                scanDuration: scanResults.scanDuration,
                version: scanResults.version,
                autoClassified: scanResults.autoClassified,
                tasksCreated: scanResults.tasksCreated,
                selectedCategories: scanResults.selectedCategories
            };
            
            localStorage.setItem('lastScanData', JSON.stringify(scanSummary));
            
            // Optimiser les emails avant sauvegarde
            const optimizedEmails = this.optimizeEmailsForStorage(scanResults.emails);
            
            try {
                localStorage.setItem('scannedEmails', JSON.stringify(optimizedEmails));
                console.log('[ScanStart] ✅ Emails sauvegardés:', optimizedEmails.length);
                
            } catch (storageError) {
                console.warn('[ScanStart] ⚠️ Erreur de stockage:', storageError);
                
                // Fallback: version simplifiée
                const essentialEmails = this.createEssentialEmailData(scanResults.emails);
                localStorage.setItem('scannedEmails', JSON.stringify(essentialEmails));
                
                if (window.uiManager?.showToast) {
                    window.uiManager.showToast(
                        'Emails sauvegardés en mode compact en raison de la taille',
                        'warning'
                    );
                }
            }
            
        } catch (error) {
            console.error('[ScanStart] ❌ Erreur critique de sauvegarde:', error);
        }
        
        // Sauvegarder les emails dans EmailScanner si disponible
        if (window.emailScanner) {
            window.emailScanner.emails = scanResults.emails;
        }
    }
    
    optimizeEmailsForStorage(emails) {
        return emails.map(email => ({
            id: email.id,
            subject: email.subject,
            from: email.from,
            receivedDateTime: email.receivedDateTime,
            bodyPreview: email.bodyPreview,
            importance: email.importance,
            hasAttachments: email.hasAttachments,
            category: email.category,
            categoryName: email.categoryName,
            categoryIcon: email.categoryIcon,
            categoryColor: email.categoryColor,
            sourceFolder: email.sourceFolder || email.parentFolderId
        }));
    }
    
    createEssentialEmailData(emails) {
        return emails.slice(0, 500).map(email => ({
            id: email.id,
            subject: email.subject ? email.subject.substring(0, 100) : 'Sans sujet',
            from: email.from,
            receivedDateTime: email.receivedDateTime,
            category: email.category,
            categoryName: email.categoryName,
            categoryIcon: email.categoryIcon,
            categoryColor: email.categoryColor
        }));
    }
    
    completeRealScan(scanResults) {
        // Notification de succès
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(
                `✅ Scan terminé ! ${scanResults.total} emails analysés`, 
                'success'
            );
        }
        
        // Redirection vers les emails
        setTimeout(() => {
            if (window.pageManager?.loadPage) {
                window.pageManager.loadPage('emails');
            }
        }, 1500);
    }

    // ====================================================
    // FONCTIONS UTILITAIRES
    // ====================================================
    updateProgress(progress, status, detail) {
        const progressFill = document.getElementById('progressFill');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressPercentage) progressPercentage.textContent = `${progress}%`;
        if (progressText) progressText.textContent = detail;
    }
    
    getFolderName(folderId) {
        const folderNames = {
            'inbox': 'Boîte de réception',
            'junkemail': 'Spam',
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

    addModernStyles() {
        if (document.getElementById('scan-minimal-styles')) {
            // Si les styles existent déjà, les supprimer d'abord pour éviter les doublons
            const existingStyles = document.getElementById('scan-minimal-styles');
            if (existingStyles) {
                existingStyles.remove();
            }
        }

        const styles = document.createElement('style');
        styles.id = 'scan-minimal-styles';
        styles.textContent = `
            /* Styles Scanner Minimaliste avec Onglets */
            :root {
                --primary: #6366f1;
                --primary-light: #818cf8;
                --primary-dark: #4f46e5;
                --success: #10b981;
                --warning: #f59e0b;
                --danger: #ef4444;
                --gray: #9ca3af;
                --light: #f3f4f6;
                --dark: #1f2937;
            }
            
            .scanner-minimal {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 780px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                overflow: hidden;
            }
            
            .scanner-header {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                padding: 30px;
                color: #ffffff !important;
                position: relative;
                text-align: center;
            }
            
            .scanner-title {
                font-size: 28px;
                font-weight: 700;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                color: #ffffff !important;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            }
            
            .scanner-title i {
                color: #ffffff !important;
            }
            
            .scanner-subtitle {
                font-size: 16px;
                font-weight: 400;
                margin: 10px 0 0;
                color: #ffffff !important;
                opacity: 1;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            .scanner-content {
                padding: 0;
            }
            
            /* Onglets */
            .scan-tabs {
                display: flex;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                padding: 0;
            }
            
            .scan-tab {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px 10px;
                font-size: 15px;
                color: var(--gray);
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                gap: 8px;
            }
            
            .scan-tab i {
                font-size: 18px;
            }
            
            .scan-tab:hover {
                color: var(--primary);
                background: rgba(99, 102, 241, 0.05);
            }
            
            .scan-tab.active {
                color: var(--primary);
                font-weight: 600;
            }
            
            .scan-tab.active::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 25%;
                width: 50%;
                height: 3px;
                background: var(--primary);
                border-radius: 3px 3px 0 0;
            }
            
            /* Contenu des onglets */
            .tab-content {
                padding: 24px;
            }
            
            .tab-pane {
                display: none;
            }
            
            .tab-pane.active {
                display: block;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .period-selector {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .period-chip {
                background: var(--light);
                border: 1px solid transparent;
                border-radius: 30px;
                padding: 10px 20px;
                font-size: 16px;
                font-weight: 500;
                color: var(--gray);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .period-chip:hover {
                background: #e5e7eb;
                color: var(--dark);
                transform: translateY(-2px);
            }
            
            .period-chip.selected {
                background: rgba(99, 102, 241, 0.1);
                color: var(--primary-dark);
                border-color: var(--primary-light);
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
            }
            
            .folders-selector {
                display: flex;
                gap: 16px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .folder-chip {
                display: flex;
                align-items: center;
                gap: 10px;
                background: var(--light);
                border: 1px solid transparent;
                border-radius: 12px;
                padding: 14px 24px;
                font-size: 16px;
                font-weight: 500;
                color: var(--gray);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .folder-chip:hover {
                background: #e5e7eb;
                color: var(--dark);
                transform: translateY(-2px);
            }
            
            .folder-chip.selected {
                background: rgba(99, 102, 241, 0.1);
                color: var(--primary-dark);
                border-color: var(--primary-light);
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
            }
            
            .folder-chip i {
                font-size: 18px;
            }
            
            .ai-options {
                display: flex;
                flex-direction: column;
                gap: 24px;
                max-width: 400px;
                margin: 0 auto;
            }
            
            .switch-option {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 10px;
                border-radius: 12px;
                background: #f9fafb;
                transition: all 0.2s ease;
            }
            
            .switch-option:hover {
                background: #f3f4f6;
                transform: translateY(-2px);
            }
            
            .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 26px;
                flex-shrink: 0;
            }
            
            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #e5e7eb;
                transition: .3s;
                border-radius: 26px;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
            }
            
            input:checked + .slider {
                background-color: var(--primary);
            }
            
            input:checked + .slider:before {
                transform: translateX(24px);
            }
            
            .option-label {
                font-size: 16px;
                color: var(--dark);
                font-weight: 500;
            }
            
            .scan-action {
                padding: 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .btn-scan {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 16px 40px;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 14px rgba(99, 102, 241, 0.2);
            }
            
            .btn-scan:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
            }
            
            .btn-scan i {
                font-size: 20px;
            }
            
            .settings-shortcut {
                margin-top: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .settings-link {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--primary);
                text-decoration: none;
                font-size: 18px;
                font-weight: 600;
                transition: all 0.2s ease;
                padding: 8px 16px;
                border-radius: 8px;
            }
            
            .settings-link:hover {
                text-decoration: underline;
                background: rgba(99, 102, 241, 0.1);
            }
            
            .settings-link i {
                font-size: 18px;
            }
            
            .progress-container {
                padding: 30px;
            }
            
            .progress-bar {
                height: 10px;
                background: var(--light);
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 16px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-light), var(--primary));
                border-radius: 5px;
                transition: width 0.4s ease;
                width: 0%;
            }
            
            .progress-status {
                display: flex;
                justify-content: space-between;
                font-size: 16px;
                align-items: center;
            }
            
            .progress-percentage {
                font-weight: 600;
                color: var(--primary);
                font-size: 18px;
            }
            
            .progress-text {
                color: var(--gray);
            }
            
            .how-it-works {
                padding: 24px 30px;
                background: #f9fafb;
                border-top: 1px solid #e2e8f0;
                font-size: 14px;
                color: var(--gray);
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .process-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--dark);
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .process-steps {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: space-between;
            }
            
            .process-step {
                flex: 1;
                min-width: 150px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding: 15px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease;
            }
            
            .process-step:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
            }
            
            .step-number {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: var(--primary);
                color: white;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 12px;
                font-size: 16px;
            }
            
            .step-title {
                font-weight: 600;
                color: var(--dark);
                margin-bottom: 8px;
                font-size: 15px;
            }
            
            .step-description {
                font-size: 13px;
                line-height: 1.5;
                color: var(--gray);
            }
            
            /* Modal styles for settings promo */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-container {
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 24px;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .modal-overlay.show .modal-container {
                transform: translateY(0);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .modal-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--dark);
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: var(--gray);
                font-size: 20px;
                cursor: pointer;
            }
            
            .settings-promo-content {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .settings-benefit {
                display: flex;
                gap: 12px;
                align-items: flex-start;
                padding: 12px;
                border-radius: 8px;
                background: #f9fafb;
            }
            
            .benefit-icon {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                background: var(--primary-light);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }
            
            .benefit-text {
                flex: 1;
            }
            
            .benefit-title {
                font-weight: 600;
                color: var(--dark);
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .benefit-description {
                font-size: 13px;
                color: var(--gray);
                line-height: 1.4;
            }
            
            .modal-footer {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
            }
            
            .btn-modal {
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .btn-primary-modal {
                background: var(--primary);
                color: white;
                border: none;
            }
            
            .btn-primary-modal:hover {
                background: var(--primary-dark);
            }
            
            .btn-secondary-modal {
                background: var(--light);
                color: var(--dark);
                border: none;
                margin-right: 10px;
            }
            
            .btn-secondary-modal:hover {
                background: #e5e7eb;
            }
            
            /* Authentication and Error States */
            .auth-needed-modern, .error-state-modern {
                padding: 48px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
            }
            
            .auth-icon, .error-icon {
                width: 80px;
                height: 80px;
                background: #f3f4f6;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: var(--gray);
                margin-bottom: 24px;
            }
            
            .error-icon {
                color: var(--danger);
                background: #fee2e2;
            }
            
            .auth-needed-modern h2, .error-state-modern h2 {
                margin: 0 0 12px 0;
                font-size: 24px;
                color: var(--dark);
            }
            
            .auth-needed-modern p, .error-state-modern p {
                color: var(--gray);
                max-width: 400px;
                margin: 0 auto 32px;
                line-height: 1.6;
            }
            
            .btn-modern {
                padding: 12px 24px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }
            
            .btn-auth {
                background: #0078d4;
                color: white;
            }
            
            .btn-auth:hover {
                background: #006cbe;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 120, 212, 0.2);
            }
            
            .btn-retry {
                background: var(--light);
                color: var(--dark);
            }
            
            .btn-retry:hover {
                background: #e5e7eb;
            }
            
            .error-details-modern {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
                margin: 0 auto 32px;
                width: 100%;
                max-width: 400px;
                text-align: left;
            }
            
            .error-detail-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .detail-label {
                color: var(--gray);
            }
            
            .detail-status {
                font-weight: 500;
            }
            
            .status-ok {
                color: var(--success);
            }
            
            .status-error {
                color: var(--danger);
            }
            
            /* Responsive Styles */
            @media (max-width: 768px) {
                .config-grid {
                    grid-template-columns: 1fr;
                }
                
                .period-selector, .folders-selector {
                    flex-wrap: wrap;
                }
                
                .process-steps {
                    flex-direction: column;
                    align-items: center;
                }
                
                .process-step {
                    width: 100%;
                    max-width: 250px;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Remplacer l'instance existante
if (window.scanStartModule) {
    console.log('[ScanStart] Replacing existing module with MODERN MINIMAL scanner in one view...');
}

window.scanStartModule = new ScanStartModule();

console.log('✅ ScanStart.js v5.0 - Scanner minimaliste en une seule vue chargé');