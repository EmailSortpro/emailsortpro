// PageManager.js - Fonctions corrigées pour synchronisation des paramètres
// Version 9.4 - CORRIGÉ avec gestion unifiée des tâches et synchronisation

// =====================================
// MÉTHODES CORRIGÉES À AJOUTER/REMPLACER DANS PAGEMANAGER
// =====================================

// 1. MÉTHODE onSettingsChanged - NOUVELLE
PageManager.prototype.onSettingsChanged = function(settings) {
    console.log('[PageManager] Settings changed, updating page manager...');
    
    // Mettre à jour les paramètres locaux
    this.currentSettings = {
        scanSettings: settings.scanSettings || {},
        taskPreselectedCategories: settings.taskPreselectedCategories || [],
        automationSettings: settings.automationSettings || {}
    };
    
    // Si on est sur la page scanner, rafraîchir l'interface
    if (this.currentPage === 'scanner') {
        console.log('[PageManager] Refreshing scanner page with new settings');
        this.loadPage('scanner');
    }
    
    // Si on est sur la page emails, mettre à jour les filtres
    if (this.currentPage === 'emails') {
        this.updateEmailFiltersWithSettings();
    }
    
    console.log('[PageManager] Settings updated:', {
        preselectedCategories: this.currentSettings.taskPreselectedCategories.length,
        autoCreateTasks: this.currentSettings.automationSettings.autoCreateTasks
    });
};

// 2. MÉTHODE updateEmailFiltersWithSettings - NOUVELLE
PageManager.prototype.updateEmailFiltersWithSettings = function() {
    const preselectedCategories = this.currentSettings?.taskPreselectedCategories || [];
    
    if (preselectedCategories.length > 0) {
        console.log('[PageManager] Updating email filters with preselected categories:', preselectedCategories);
        
        // Mettre en évidence les catégories pré-sélectionnées dans les filtres
        document.querySelectorAll('.category-pill-large').forEach(pill => {
            const categoryId = pill.dataset.category;
            if (preselectedCategories.includes(categoryId)) {
                pill.classList.add('preselected');
                
                // Ajouter un indicateur visuel
                if (!pill.querySelector('.preselected-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'preselected-indicator';
                    indicator.innerHTML = '🎯';
                    indicator.title = 'Catégorie pré-sélectionnée pour les tâches';
                    pill.appendChild(indicator);
                }
            } else {
                pill.classList.remove('preselected');
                const indicator = pill.querySelector('.preselected-indicator');
                if (indicator) indicator.remove();
            }
        });
    }
};

// 3. MÉTHODE renderScanner - CORRIGÉE AVEC SYNCHRONISATION
PageManager.prototype.renderScanner = async function(container) {
    console.log('[PageManager] Rendering scanner page...');
    
    // Charger les paramètres depuis CategoriesPage
    this.currentSettings = this.loadSettingsFromCategoriesPage();
    
    // Vérifier si le module ScanStart moderne est disponible et correctement initialisé
    if (window.scanStartModule && 
        typeof window.scanStartModule.render === 'function' && 
        window.scanStartModule.stylesAdded) {
        
        try {
            console.log('[PageManager] Using modern ScanStartModule with settings sync');
            
            // S'assurer que ScanStart a les bons paramètres
            if (window.scanStartModule.onSettingsChanged) {
                const settingsPayload = this.buildSettingsPayload();
                window.scanStartModule.onSettingsChanged(settingsPayload);
            }
            
            await window.scanStartModule.render(container);
            return;
        } catch (error) {
            console.error('[PageManager] Error with ScanStartModule, falling back:', error);
        }
    }
    
    // Fallback au scanner basique du PageManager
    console.log('[PageManager] Using fallback scanner interface with settings');
    this.renderBasicScanner(container);
};

// 4. MÉTHODE loadSettingsFromCategoriesPage - NOUVELLE
PageManager.prototype.loadSettingsFromCategoriesPage = function() {
    if (window.categoriesPage) {
        return {
            scanSettings: window.categoriesPage.getScanSettings(),
            taskPreselectedCategories: window.categoriesPage.getTaskPreselectedCategories(),
            automationSettings: window.categoriesPage.getAutomationSettings()
        };
    }
    
    // Fallback vers localStorage
    try {
        const saved = localStorage.getItem('categorySettings');
        if (saved) {
            const settings = JSON.parse(saved);
            return {
                scanSettings: settings.scanSettings || {},
                taskPreselectedCategories: settings.taskPreselectedCategories || [],
                automationSettings: settings.automationSettings || {}
            };
        }
    } catch (error) {
        console.warn('[PageManager] Error loading settings:', error);
    }
    
    return {
        scanSettings: { defaultPeriod: 7, defaultFolder: 'inbox', autoAnalyze: true, autoCategrize: true },
        taskPreselectedCategories: [],
        automationSettings: {}
    };
};

// 5. MÉTHODE buildSettingsPayload - NOUVELLE
PageManager.prototype.buildSettingsPayload = function() {
    return {
        scanSettings: this.currentSettings.scanSettings,
        taskPreselectedCategories: this.currentSettings.taskPreselectedCategories,
        automationSettings: this.currentSettings.automationSettings
    };
};

// 6. MÉTHODE renderBasicScanner - CORRIGÉE AVEC PARAMÈTRES
PageManager.prototype.renderBasicScanner = function(container) {
    const defaultPeriod = this.currentSettings?.scanSettings?.defaultPeriod || 7;
    const preselectedCount = this.currentSettings?.taskPreselectedCategories?.length || 0;
    const autoAnalyze = this.currentSettings?.scanSettings?.autoAnalyze !== false;
    
    // Badge de paramètres si applicable
    const settingsBadge = this.generateSettingsBadge(preselectedCount, autoAnalyze);
    
    container.innerHTML = `
        <div class="scanner-container">
            <div class="scanner-card">
                <div class="scanner-header">
                    <div class="scanner-icon" id="scannerIcon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h1 class="scanner-title">Scanner d'emails</h1>
                    <p class="scanner-subtitle">Analysez et organisez vos emails intelligemment</p>
                    ${settingsBadge}
                </div>

                <div class="scanner-body">
                    <!-- Configuration avec paramètres synchronisés -->
                    <div class="scan-controls">
                        <div class="control-group">
                            <label class="control-label">
                                <i class="fas fa-calendar-alt"></i> Période à analyser
                            </label>
                            <select class="control-select" id="scanDays">
                                <option value="1" ${defaultPeriod === 1 ? 'selected' : ''}>1 jour</option>
                                <option value="3" ${defaultPeriod === 3 ? 'selected' : ''}>3 jours</option>
                                <option value="7" ${defaultPeriod === 7 ? 'selected' : ''}>7 derniers jours</option>
                                <option value="15" ${defaultPeriod === 15 ? 'selected' : ''}>15 derniers jours</option>
                                <option value="30" ${defaultPeriod === 30 ? 'selected' : ''}>30 derniers jours</option>
                                <option value="90" ${defaultPeriod === 90 ? 'selected' : ''}>90 derniers jours</option>
                            </select>
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label">
                                <i class="fas fa-folder"></i> Dossier à scanner
                            </label>
                            <select class="control-select" id="scanFolder">
                                <option value="inbox" ${this.currentSettings?.scanSettings?.defaultFolder === 'inbox' ? 'selected' : ''}>Boîte de réception</option>
                                <option value="junkemail" ${this.currentSettings?.scanSettings?.defaultFolder === 'junkemail' ? 'selected' : ''}>Courrier indésirable</option>
                                <option value="all" ${this.currentSettings?.scanSettings?.defaultFolder === 'all' ? 'selected' : ''}>Tous les dossiers</option>
                            </select>
                        </div>
                        
                        ${preselectedCount > 0 ? `
                            <div class="preselected-info">
                                <i class="fas fa-info-circle"></i>
                                <span>${preselectedCount} catégorie${preselectedCount > 1 ? 's' : ''} pré-sélectionnée${preselectedCount > 1 ? 's' : ''} pour la création automatique de tâches</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Bouton de scan -->
                    <div class="scan-button-container">
                        <button class="scan-button" id="startScanBtn" onclick="window.pageManager.startBasicScanWithSettings()">
                            <i class="fas fa-search-plus"></i> 
                            <span>Démarrer le scan</span>
                        </button>
                    </div>
                    
                    <!-- Section de progression -->
                    <div class="progress-section" id="progressSection">
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="progressBar" style="width: 0%"></div>
                        </div>
                        <div class="progress-message" id="progressMessage">En attente...</div>
                        <div class="progress-details" id="progressDetails"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter les styles pour le scanner de base
    this.addBasicScannerStyles();
};

// 7. MÉTHODE generateSettingsBadge - NOUVELLE
PageManager.prototype.generateSettingsBadge = function(preselectedCount, autoAnalyze) {
    if (preselectedCount > 0 || autoAnalyze) {
        const badges = [];
        
        if (preselectedCount > 0) {
            badges.push(`${preselectedCount} catégorie${preselectedCount > 1 ? 's' : ''} pré-sélectionnée${preselectedCount > 1 ? 's' : ''}`);
        }
        
        if (autoAnalyze) {
            badges.push('IA activée');
        }
        
        return `
            <div class="settings-badge">
                <i class="fas fa-cog"></i>
                <span>${badges.join(' • ')}</span>
            </div>
        `;
    }
    
    return '';
};

// 8. MÉTHODE startBasicScanWithSettings - CORRIGÉE AVEC SYNCHRONISATION
PageManager.prototype.startBasicScanWithSettings = async function() {
    const days = parseInt(document.getElementById('scanDays').value);
    const folder = document.getElementById('scanFolder').value;
    const btn = document.getElementById('startScanBtn');
    const progressSection = document.getElementById('progressSection');
    const scannerIcon = document.getElementById('scannerIcon');

    // Vérifier l'authentification
    if (!window.authService?.isAuthenticated()) {
        window.uiManager.showToast('Veuillez vous connecter d\'abord', 'warning');
        return;
    }

    // Charger les paramètres les plus récents
    this.currentSettings = this.loadSettingsFromCategoriesPage();

    // Désactiver le bouton et afficher la progression
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Scan en cours...</span>';
    progressSection.classList.add('active');
    scannerIcon.classList.add('scanning');

    try {
        let results;
        
        // Préparer les options de scan avec synchronisation complète
        const scanOptions = {
            days,
            folder,
            autoAnalyze: this.currentSettings.scanSettings?.autoAnalyze !== false,
            autoCategrize: this.currentSettings.scanSettings?.autoCategrize !== false,
            preselectedCategories: this.currentSettings.taskPreselectedCategories || [],
            automationSettings: this.currentSettings.automationSettings || {},
            onProgress: (progress) => {
                this.updateBasicScanProgress(progress);
            }
        };

        console.log('[PageManager] Starting scan with synchronized options:', scanOptions);
        
        // Utiliser emailScanner si disponible
        if (window.emailScanner && window.mailService) {
            console.log('[PageManager] Starting scan with EmailScanner and settings');
            
            results = await window.emailScanner.scan(scanOptions);
            
            // Appliquer la création automatique de tâches si configurée
            if (this.currentSettings.automationSettings?.autoCreateTasks && 
                this.currentSettings.taskPreselectedCategories?.length > 0) {
                
                await this.handleAutomaticTaskCreation(results);
            }
            
        } else {
            // Mode démo si aucun service n'est disponible
            console.log('[PageManager] Running in demo mode with settings simulation');
            
            this.updateBasicScanProgress({ 
                progress: { current: 0, total: 30 }, 
                message: 'Génération d\'emails de démonstration...' 
            });
            
            // Simuler un scan
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            results = {
                emails: this.generateDemoEmailsWithSettings(30),
                total: 30,
                stats: { processed: 30, errors: 0 },
                preselectedCategoriesUsed: this.currentSettings.taskPreselectedCategories?.length || 0
            };
            
            this.updateBasicScanProgress({ 
                progress: { current: 30, total: 30 }, 
                message: 'Scan de démonstration terminé avec paramètres appliqués' 
            });
        }

        // Traiter les résultats
        if (results && results.emails) {
            // Classification automatique si pas encore fait
            if (window.categoryManager) {
                console.log('[PageManager] Applying final categorization...');
                this.updateBasicScanProgress({ 
                    message: 'Classification finale des emails...' 
                });
                
                results.emails.forEach(email => {
                    if (!email.category) {
                        const catResult = window.categoryManager.analyzeEmail(email);
                        email.category = catResult.category || 'other';
                    }
                    
                    // Marquer les emails des catégories pré-sélectionnées
                    if (this.currentSettings.taskPreselectedCategories?.includes(email.category)) {
                        email.isPreselected = true;
                    }
                });
            }

            // Sauvegarder les résultats avec informations de synchronisation
            this.temporaryEmailStorage = results.emails;
            this.lastScanData = {
                total: results.total || results.emails.length,
                categorized: results.emails.filter(e => e.category && e.category !== 'other').length,
                preselected: results.emails.filter(e => e.isPreselected).length,
                scanTime: new Date().toISOString(),
                duration: results.duration || 0,
                settingsUsed: this.currentSettings,
                tasksCreated: results.tasksCreated || 0
            };
            
            // Sauvegarder dans emailScanner si disponible
            if (window.emailScanner) {
                window.emailScanner.emails = results.emails;
            }

            // Notification de succès avec détails
            const message = this.buildSuccessMessage(results, this.lastScanData);
            window.uiManager.showToast(message, 'success');
            
            // Redirection vers les emails après un délai
            setTimeout(() => {
                this.loadPage('emails');
            }, 1500);

        } else {
            throw new Error('Aucun résultat obtenu du scan');
        }

    } catch (error) {
        console.error('[PageManager] Basic scan error:', error);
        window.uiManager.showToast(`Erreur de scan: ${error.message}`, 'error');
        
        // Restaurer l'interface
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-search-plus"></i> <span>Démarrer le scan</span>';
        progressSection.classList.remove('active');
        scannerIcon.classList.remove('scanning');
    }
};

// 9. MÉTHODE handleAutomaticTaskCreation - NOUVELLE
PageManager.prototype.handleAutomaticTaskCreation = async function(scanResults) {
    console.log('[PageManager] Handling automatic task creation...');
    
    if (!scanResults.emails || !window.taskManager) {
        console.warn('[PageManager] Cannot create tasks: missing emails or TaskManager');
        return;
    }
    
    try {
        // Filtrer les emails des catégories pré-sélectionnées
        const emailsForTasks = scanResults.emails.filter(email => 
            this.currentSettings.taskPreselectedCategories.includes(email.category)
        );
        
        if (emailsForTasks.length > 0) {
            this.updateBasicScanProgress({
                message: 'Création automatique de tâches...',
                progress: { current: 90, total: 100 }
            });
            
            console.log(`[PageManager] Creating ${emailsForTasks.length} tasks automatically`);
            
            // Vérifier que TaskManager est prêt
            if (!this.ensureTaskManagerReady()) {
                const ready = await this.waitForTaskManager();
                if (!ready) {
                    console.error('[PageManager] TaskManager not ready for automatic task creation');
                    return;
                }
            }
            
            let createdCount = 0;
            
            // Créer les tâches en batch
            for (const email of emailsForTasks) {
                try {
                    // Ajouter à la sélection
                    this.selectedEmails.add(email.id);
                    
                    // Marquer pour traitement automatique
                    email.autoTaskCreation = true;
                    
                    createdCount++;
                } catch (error) {
                    console.error('[PageManager] Error preparing email for task creation:', error);
                }
            }
            
            // Déclencher la création en batch si des emails sont sélectionnés
            if (this.selectedEmails.size > 0) {
                await this.createTasksFromSelection();
                scanResults.tasksCreated = createdCount;
                console.log(`[PageManager] Successfully created ${createdCount} tasks automatically`);
            }
            
        } else {
            console.log('[PageManager] No emails found in preselected categories for task creation');
        }
        
    } catch (error) {
        console.error('[PageManager] Error in automatic task creation:', error);
        scanResults.tasksCreated = 0;
    }
};

// 10. MÉTHODE buildSuccessMessage - NOUVELLE
PageManager.prototype.buildSuccessMessage = function(results, scanData) {
    let message = `✅ ${scanData.total} emails analysés`;
    
    if (scanData.preselected > 0) {
        message += ` • ${scanData.preselected} pré-sélectionnés`;
    }
    
    if (scanData.tasksCreated > 0) {
        message += ` • ${scanData.tasksCreated} tâches créées automatiquement`;
    }
    
    return message;
};

// 11. MÉTHODE generateDemoEmailsWithSettings - CORRIGÉE
PageManager.prototype.generateDemoEmailsWithSettings = function(count) {
    const emails = [];
    const preselectedCategories = this.currentSettings.taskPreselectedCategories || [];
    
    const demoData = [
        { subject: "Newsletter hebdomadaire", category: "marketing_news" },
        { subject: "Facture à payer urgente", category: "finance" },
        { subject: "Réunion demain à 14h", category: "meetings" },
        { subject: "Action requise: Validation document", category: "tasks" },
        { subject: "Confirmation de commande", category: "notifications" },
        { subject: "Relance: Document en attente", category: "reminders" },
        { subject: "Nouvelle opportunité commerciale", category: "commercial" },
        { subject: "Code de vérification", category: "security" }
    ];
    
    for (let i = 0; i < count; i++) {
        const template = demoData[i % demoData.length];
        const email = {
            id: `demo-${i}`,
            subject: `${template.subject} ${i + 1}`,
            bodyPreview: "Ceci est un email de démonstration...",
            from: {
                emailAddress: {
                    name: `Contact ${i + 1}`,
                    address: `contact${i + 1}@example.com`
                }
            },
            receivedDateTime: new Date(Date.now() - i * 3600000).toISOString(),
            hasAttachments: Math.random() > 0.7,
            category: template.category
        };
        
        // Marquer comme pré-sélectionné si la catégorie est dans les paramètres
        if (preselectedCategories.includes(email.category)) {
            email.isPreselected = true;
        }
        
        emails.push(email);
    }
    
    return emails;
};

// 12. MÉTHODE addBasicScannerStyles - MISE À JOUR AVEC STYLES SYNCHRONISATION
PageManager.prototype.addBasicScannerStyles = function() {
    if (document.getElementById('basicScannerStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'basicScannerStyles';
    styles.textContent = `
        /* Scanner avec paramètres synchronisés */
        .scanner-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 70vh;
            padding: 20px;
        }
        
        .scanner-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            padding: 40px;
            max-width: 600px;
            width: 100%;
            border: 1px solid #e5e7eb;
        }
        
        .scanner-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .scanner-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: white;
            margin: 0 auto 20px;
            transition: all 0.3s ease;
        }
        
        .scanner-icon.scanning {
            animation: scanPulse 2s infinite;
        }
        
        @keyframes scanPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .scanner-title {
            margin: 0 0 8px 0;
            font-size: 28px;
            color: #1f2937;
            font-weight: 700;
        }
        
        .scanner-subtitle {
            margin: 0 0 20px 0;
            color: #6b7280;
            font-size: 16px;
        }
        
        /* Badge de paramètres */
        .settings-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(102, 126, 234, 0.1);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 13px;
            color: #667eea;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .settings-badge i {
            font-size: 12px;
        }
        
        /* Info de pré-sélection */
        .preselected-info {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f0f9ff;
            border: 1px solid #7dd3fc;
            border-radius: 8px;
            padding: 12px;
            font-size: 14px;
            color: #075985;
            margin-top: 12px;
            font-weight: 500;
        }
        
        .preselected-info i {
            color: #0ea5e9;
        }
        
        .scan-controls {
            margin-bottom: 30px;
        }
        
        .control-group {
            margin-bottom: 20px;
        }
        
        .control-label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }
        
        .control-select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            background: white;
            transition: border-color 0.2s ease;
        }
        
        .control-select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .scan-button-container {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .scan-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            min-width: 200px;
            justify-content: center;
        }
        
        .scan-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .scan-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }
        
        .progress-section {
            opacity: 0;
            transition: opacity 0.3s ease;
            margin-top: 20px;
        }
        
        .progress-section.active {
            opacity: 1;
        }
        
        .progress-bar-container {
            background: #e5e7eb;
            border-radius: 8px;
            height: 10px;
            overflow: hidden;
            margin-bottom: 12px;
        }
        
        .progress-bar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100%;
            transition: width 0.5s ease;
            border-radius: 8px;
        }
        
        .progress-message {
            text-align: center;
            color: #4b5563;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .progress-details {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        
        /* Indicateurs de pré-sélection dans les emails */
        .category-pill-large.preselected {
            position: relative;
            border: 2px solid var(--cat-color, #667eea) !important;
        }
        
        .preselected-indicator {
            position: absolute;
            top: -5px;
            right: -5px;
            font-size: 12px;
            background: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    `;
    
    document.head.appendChild(styles);
};

console.log('✅ PageManager v9.4 - Fonctions corrigées pour synchronisation paramètres ajoutées');
