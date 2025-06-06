// PageManager.js - Version 9.1 - Optimisé avec navigation fixe et scan corrigé

class PageManager {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.temporaryEmailStorage = [];
        this.lastScanData = null;
        
        // Page renderers
        this.pages = {
            dashboard: (container) => this.renderDashboard(container),
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container)
        };
        
        this.init();
    }

    init() {
        console.log('[PageManager] Initialized v9.1 - Fixed navigation and scanner');
    }

    // =====================================
    // PAGE LOADING - CORRIGÉ POUR NAVIGATION FIXE
    // =====================================
    async loadPage(pageName) {
        console.log(`[PageManager] Loading page: ${pageName}`);

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManager] Page content container not found');
            return;
        }

        // NE PAS cacher la navigation - juste mettre à jour l'état actif
        this.updateNavigation(pageName);
        
        // Afficher le loading seulement pour le contenu
        this.showPageLoading();

        try {
            // Vider le contenu de la page
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} not found`);
            }

            this.hidePageLoading();

        } catch (error) {
            console.error(`[PageManager] Error loading page:`, error);
            this.hidePageLoading();
            window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="empty-state-title">Erreur de chargement</h3>
                    <p class="empty-state-text">${error.message}</p>
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('dashboard')">
                        Retour au tableau de bord
                    </button>
                </div>
            `;
        }
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    showPageLoading() {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="page-loading">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Chargement...</p>
                </div>
            `;
        }
    }

    hidePageLoading() {
        // Ne rien faire de spécial, le contenu sera remplacé
    }

    // =====================================
    // SCANNER PAGE - CORRIGÉ POUR UTILISER STARTSCAN
    // =====================================
    async renderScanner(container) {
        console.log('[PageManager] Rendering scanner page...');
        
        // Attendre que le module ScanStart soit prêt
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            if (window.scanStartModule && 
                window.scanStartModule.stylesAdded && 
                typeof window.scanStartModule.render === 'function') {
                
                try {
                    console.log('[PageManager] Using ScanStartModule for scanner');
                    await window.scanStartModule.render(container);
                    return;
                } catch (error) {
                    console.error('[PageManager] Error with ScanStartModule:', error);
                    break;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // Fallback au scanner basique si ScanStart n'est pas disponible
        console.log('[PageManager] Using fallback scanner interface');
        this.renderBasicScanner(container);
    }

    renderBasicScanner(container) {
        container.innerHTML = `
            <div class="scanner-fallback">
                <div class="scanner-card">
                    <div class="scanner-header">
                        <div class="scanner-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h1 class="scanner-title">Scanner d'emails</h1>
                        <p class="scanner-subtitle">Analysez et organisez vos emails intelligemment</p>
                    </div>

                    <div class="scanner-body">
                        <!-- Configuration simple -->
                        <div class="scan-controls">
                            <div class="control-group">
                                <label class="control-label">
                                    <i class="fas fa-calendar-alt"></i> Période à analyser
                                </label>
                                <select class="control-select" id="scanDays">
                                    <option value="7">7 derniers jours</option>
                                    <option value="30" selected>30 derniers jours</option>
                                    <option value="90">90 derniers jours</option>
                                </select>
                            </div>
                            
                            <div class="control-group">
                                <label class="control-label">
                                    <i class="fas fa-folder"></i> Dossier à scanner
                                </label>
                                <select class="control-select" id="scanFolder">
                                    <option value="inbox" selected>Boîte de réception</option>
                                    <option value="junkemail">Courrier indésirable</option>
                                </select>
                            </div>
                        </div>

                        <!-- Bouton de scan -->
                        <div class="scan-button-container">
                            <button class="scan-button" id="startBasicScanBtn" onclick="window.pageManager.startBasicScan()">
                                <i class="fas fa-search-plus"></i> 
                                <span>Démarrer le scan</span>
                            </button>
                        </div>
                        
                        <!-- Guide rapide -->
                        <div class="scan-info">
                            <div class="info-card">
                                <div class="info-icon">💡</div>
                                <div class="info-content">
                                    <h4>Commencez par 30 jours</h4>
                                    <p>Idéal pour un premier scan complet et efficace</p>
                                </div>
                            </div>
                            <div class="info-card">
                                <div class="info-icon">🎯</div>
                                <div class="info-content">
                                    <h4>Classification automatique</h4>
                                    <p>Vos emails seront organisés par catégorie</p>
                                </div>
                            </div>
                        </div>

                        <!-- Section de progression -->
                        <div class="progress-section" id="basicProgressSection">
                            <div class="progress-bar-container">
                                <div class="progress-bar" id="basicProgressBar" style="width: 0%"></div>
                            </div>
                            <div class="progress-message" id="basicProgressMessage">En attente...</div>
                            <div class="progress-details" id="basicProgressDetails"></div>
                        </div>
                    </div>
                    
                    <!-- Footer avec info -->
                    <div class="scanner-footer">
                        <div class="scanner-note">
                            <i class="fas fa-shield-alt"></i>
                            <span>Connexion sécurisée via Microsoft Graph API</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter les styles pour le scanner de base
        this.addBasicScannerStyles();
    }

    async startBasicScan() {
        const days = parseInt(document.getElementById('scanDays').value);
        const folder = document.getElementById('scanFolder').value;
        const btn = document.getElementById('startBasicScanBtn');
        const progressSection = document.getElementById('basicProgressSection');

        // Vérifier l'authentification
        if (!window.authService?.isAuthenticated()) {
            window.uiManager.showToast('Veuillez vous connecter d\'abord', 'warning');
            return;
        }

        // Désactiver le bouton et afficher la progression
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Scan en cours...</span>';
        progressSection.classList.add('active');

        try {
            let results;
            
            // Utiliser emailScanner si disponible
            if (window.emailScanner && window.mailService) {
                console.log('[PageManager] Starting scan with EmailScanner');
                
                results = await window.emailScanner.scan({
                    days,
                    folder,
                    onProgress: (progress) => {
                        this.updateBasicScanProgress(progress);
                    }
                });
                
            } else {
                // Mode démo si aucun service n'est disponible
                console.log('[PageManager] Running in demo mode - no services available');
                
                this.updateBasicScanProgress({ 
                    phase: 'fetching',
                    message: 'Génération d\'emails de démonstration...' 
                });
                
                // Simuler un scan
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                results = {
                    success: true,
                    emails: this.generateDemoEmails(30),
                    total: 30,
                    categorized: 25,
                    stats: { processed: 30, errors: 0 }
                };
                
                this.updateBasicScanProgress({ 
                    phase: 'complete',
                    message: 'Scan de démonstration terminé' 
                });
            }

            // Traiter les résultats
            if (results && results.success) {
                // Classification automatique si pas déjà fait
                if (window.categoryManager && results.emails) {
                    console.log('[PageManager] Categorizing emails...');
                    this.updateBasicScanProgress({ 
                        phase: 'categorizing',
                        message: 'Classification des emails...' 
                    });
                    
                    results.emails.forEach(email => {
                        if (!email.category) {
                            const catResult = window.categoryManager.analyzeEmail(email);
                            email.category = catResult.category || 'other';
                        }
                    });
                }

                // Sauvegarder les résultats
                this.temporaryEmailStorage = results.emails;
                this.lastScanData = {
                    total: results.total || results.emails.length,
                    categorized: results.categorized || results.emails.filter(e => e.category && e.category !== 'other').length,
                    scanTime: new Date().toISOString(),
                    duration: results.duration || 0
                };
                
                // Sauvegarder dans emailScanner si disponible
                if (window.emailScanner) {
                    window.emailScanner.emails = results.emails;
                }

                // Notification de succès
                window.uiManager.showToast(
                    `✅ ${results.emails.length} emails scannés avec succès!`, 
                    'success'
                );
                
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
        }
    }

    updateBasicScanProgress(progress) {
        const progressBar = document.getElementById('basicProgressBar');
        const progressMessage = document.getElementById('basicProgressMessage');
        const progressDetails = document.getElementById('basicProgressDetails');

        if (progress.progress) {
            const percent = Math.round((progress.progress.current / progress.progress.total) * 100);
            if (progressBar) progressBar.style.width = percent + '%';
            if (progressDetails) progressDetails.textContent = `${progress.progress.current}/${progress.progress.total} emails`;
        }

        if (progress.message && progressMessage) {
            progressMessage.textContent = progress.message;
        }
    }

    generateDemoEmails(count) {
        const emails = [];
        const subjects = [
            "Newsletter hebdomadaire - Nouvelles offres",
            "Facture à régler - Échéance proche", 
            "Réunion prévue demain à 14h",
            "Confirmation de votre commande #12345",
            "Rappel: Document à signer avant vendredi",
            "Alerte sécurité: Nouvelle connexion détectée",
            "Proposition commerciale - Nouveau projet",
            "Relance: Devis en attente de validation",
            "Support technique: Ticket #789 résolu",
            "Communication interne: Changement d'horaires"
        ];
        
        const categories = ['marketing_news', 'finance', 'meetings', 'notifications', 'tasks', 'security', 'commercial', 'reminders', 'support', 'internal'];
        
        for (let i = 0; i < count; i++) {
            const subjectIndex = i % subjects.length;
            emails.push({
                id: `demo-${i}`,
                subject: subjects[subjectIndex],
                bodyPreview: "Ceci est un email de démonstration avec du contenu d'exemple...",
                from: {
                    emailAddress: {
                        name: `Contact ${i + 1}`,
                        address: `contact${i + 1}@example.com`
                    }
                },
                receivedDateTime: new Date(Date.now() - i * 3600000).toISOString(),
                hasAttachments: Math.random() > 0.7,
                category: categories[i % categories.length]
            });
        }
        
        return emails;
    }

    addBasicScannerStyles() {
        if (document.getElementById('basicScannerStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'basicScannerStyles';
        styles.textContent = `
            /* Scanner de base styles */
            .scanner-fallback {
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
            
            .scanner-title {
                margin: 0 0 8px 0;
                font-size: 28px;
                color: #1f2937;
                font-weight: 700;
            }
            
            .scanner-subtitle {
                margin: 0;
                color: #6b7280;
                font-size: 16px;
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
            
            .scan-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 30px;
            }
            
            .info-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                text-align: center;
            }
            
            .info-icon {
                font-size: 24px;
                margin-bottom: 8px;
            }
            
            .info-content h4 {
                margin: 0 0 4px 0;
                font-size: 14px;
                color: #1f2937;
                font-weight: 600;
            }
            
            .info-content p {
                margin: 0;
                font-size: 12px;
                color: #6b7280;
                line-height: 1.3;
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
            
            .scanner-footer {
                margin-top: 30px;
                text-align: center;
            }
            
            .scanner-note {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                color: #6b7280;
                font-size: 13px;
                padding: 8px 16px;
                background: #f9fafb;
                border-radius: 20px;
                border: 1px solid #e5e7eb;
            }
            
            .scanner-note i {
                color: #10b981;
            }
            
            /* Page loading styles */
            .page-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 300px;
                color: #6b7280;
            }
            
            .loading-spinner {
                font-size: 24px;
                margin-bottom: 15px;
                color: #667eea;
            }
            
            @media (max-width: 640px) {
                .scanner-card {
                    padding: 30px 20px;
                }
                
                .scan-info {
                    grid-template-columns: 1fr;
                }
                
                .scanner-title {
                    font-size: 24px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // =====================================
    // EMAILS PAGE - CONSERVÉ IDENTIQUE
    // =====================================
    async renderEmails(container) {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        // Initialize view mode - grouped by domain by default
        this.currentViewMode = this.currentViewMode || 'grouped-domain';
        this.currentCategory = this.currentCategory || 'all';

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            
            container.innerHTML = `
                <div class="page-header">
                    <h1>Emails</h1>
                    <div class="page-actions">
                        ${this.selectedEmails.size > 0 ? `
                            <div class="selection-info">
                                <span class="selection-count">${this.selectedEmails.size} sélectionné(s)</span>
                                <button class="btn btn-secondary btn-small" onclick="window.pageManager.clearSelection()">
                                    <i class="fas fa-times"></i> Désélectionner
                                </button>
                            </div>
                            <button class="btn btn-primary" onclick="window.pageManager.createTasksFromSelection()">
                                <i class="fas fa-tasks"></i> Créer tâches
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="window.pageManager.refreshEmails()">
                            <i class="fas fa-sync"></i> Actualiser
                        </button>
                    </div>
                </div>

                <!-- Barre de recherche -->
                <div class="search-bar-container">
                    <div class="search-bar">
                        <div class="search-input-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   class="search-input" 
                                   id="emailSearchInput"
                                   placeholder="Rechercher par expéditeur, sujet, contenu..." 
                                   value="${this.searchTerm}">
                            <button class="search-clear-btn" id="searchClearBtn" 
                                    style="display: ${this.searchTerm ? 'flex' : 'none'}"
                                    onclick="window.pageManager.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Toolbar with view modes -->
                <div class="emails-toolbar">
                    <div class="emails-info">
                        <span class="emails-count">${totalEmails} emails</span>
                    </div>
                    <div class="view-controls">
                        <div class="view-mode-group">
                            <button class="view-mode-btn ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                    data-mode="grouped-domain"
                                    onclick="window.pageManager.changeViewMode('grouped-domain')">
                                <i class="fas fa-globe"></i>
                                <span class="btn-text">Par domaine</span>
                            </button>
                            <button class="view-mode-btn ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                    data-mode="grouped-sender"
                                    onclick="window.pageManager.changeViewMode('grouped-sender')">
                                <i class="fas fa-user"></i>
                                <span class="btn-text">Par expéditeur</span>
                            </button>
                            <button class="view-mode-btn ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                    data-mode="flat"
                                    onclick="window.pageManager.changeViewMode('flat')">
                                <i class="fas fa-list"></i>
                                <span class="btn-text">Liste complète</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Filtres de catégories -->
                <div class="category-pills-container">
                    <div class="category-pills-row">
                        ${this.buildCategoryPills(categoryCounts, totalEmails, categories, this.currentCategory)}
                    </div>
                </div>

                <div id="emailsList"></div>
            `;

            this.addEmailStyles();
            this.setupEmailsEventListeners();
            this.renderEmailsList(this.currentViewMode, this.currentCategory);
        };

        renderEmailsPage();
        
        // Auto-analyze first emails if enabled
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            setTimeout(() => {
                this.analyzeFirstEmails(emails.slice(0, 5));
            }, 1000);
        }
    }

    renderEmailsList(viewMode = 'condensed', category = 'all') {
        const container = document.getElementById('emailsList');
        if (!container) return;

        let emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        
        // Apply filters
        if (category !== 'all') {
            emails = emails.filter(email => (email.category || 'other') === category);
        }
        
        if (this.searchTerm) {
            emails = emails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        if (emails.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3 class="empty-state-title">Aucun email trouvé</h3>
                    <p class="empty-state-text">
                        ${this.searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun email dans cette catégorie'}
                    </p>
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i> Scanner vos emails
                    </button>
                </div>
            `;
            return;
        }

        // Render based on view mode
        if (viewMode === 'flat') {
            container.innerHTML = `
                <div class="emails-condensed-list">
                    ${emails.map(email => this.renderCondensedEmailItem(email)).join('')}
                </div>
            `;
        } else if (viewMode === 'grouped-domain' || viewMode === 'grouped-sender') {
            const groups = this.createEmailGroups(emails, viewMode);
            container.innerHTML = `
                <div class="senders-list">
                    ${groups.map(group => this.renderEmailGroup(group, viewMode)).join('')}
                </div>
            `;
            setTimeout(() => {
                this.setupGroupToggles();
            }, 100);
        }
    }

    // =====================================
    // DASHBOARD
    // =====================================
    async renderDashboard(container) {
        const scanData = this.lastScanData;
        const taskStats = window.taskManager?.getStats() || {
            total: 0,
            byStatus: { todo: 0, 'in-progress': 0, completed: 0 },
            overdue: 0
        };
        
        const aiConfigured = window.aiTaskAnalyzer?.isConfigured() || false;
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Tableau de bord</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i> Nouveau scan
                    </button>
                </div>
            </div>

            ${!aiConfigured ? `
                <div class="ai-banner">
                    <div class="ai-banner-icon"><i class="fas fa-magic"></i></div>
                    <div class="ai-banner-content">
                        <h3>Activez l'IA pour des suggestions intelligentes</h3>
                        <p>Configurez Claude AI pour analyser vos emails automatiquement</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                        Configurer
                    </button>
                </div>
            ` : ''}

            <div class="grid grid-4">
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-tasks',
                    label: 'Tâches totales',
                    value: taskStats.total,
                    color: 'var(--primary)'
                })}
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-clock',
                    label: 'À faire',
                    value: taskStats.byStatus.todo,
                    color: 'var(--info)'
                })}
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-check-circle',
                    label: 'Terminées',
                    value: taskStats.byStatus.completed,
                    color: 'var(--success)'
                })}
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-exclamation-circle',
                    label: 'En retard',
                    value: taskStats.overdue,
                    color: 'var(--danger)'
                })}
            </div>

            ${scanData ? this.renderScanStats(scanData) : this.renderWelcome()}
        `;
    }

    renderWelcome() {
        return `
            <div class="card">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-envelope-open-text"></i>
                    </div>
                    <h2 class="empty-state-title">Bienvenue!</h2>
                    <p class="empty-state-text">
                        Commencez par scanner vos emails pour les organiser automatiquement.
                    </p>
                    <button class="btn btn-primary btn-large" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i> Démarrer le scan
                    </button>
                </div>
            </div>
        `;
    }

    renderScanStats(scanData) {
        const categories = window.categoryManager?.getCategories() || {};
        
        let html = `
            <div class="card">
                <h3>Résultats du dernier scan</h3>
                <div class="scan-stats">
                    <p>${scanData.total} emails analysés - ${scanData.categorized} catégorisés</p>
                    <p class="scan-time">Scanné le ${new Date(scanData.scanTime).toLocaleString('fr-FR')}</p>
                </div>
                <div class="scan-actions">
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('emails')">
                        <i class="fas fa-envelope"></i> Voir les emails
                    </button>
                    <button class="btn btn-secondary" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i> Nouveau scan
                    </button>
                </div>
            </div>
        `;
        
        return html;
    }

    // =====================================
    // OTHER PAGES - CONSERVÉES IDENTIQUES
    // =====================================
    async renderTasks(container) {
        if (window.tasksView && window.tasksView.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>Tâches</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="empty-state-title">Aucune tâche</h3>
                    <p class="empty-state-text">Créez des tâches à partir de vos emails</p>
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('emails')">
                        <i class="fas fa-envelope"></i> Voir les emails
                    </button>
                </div>
            `;
        }
    }

    async renderCategories(container) {
        const categories = window.categoryManager?.getCategories() || {};
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Catégories</h1>
            </div>
            
            <div class="categories-grid">
                ${Object.entries(categories).map(([id, cat]) => `
                    <div class="card category-card">
                        <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color}">
                            ${cat.icon}
                        </div>
                        <h3>${cat.name}</h3>
                        <p>${cat.description || ''}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderSettings(container) {
        // Utiliser CategoriesPage pour la page Paramètres
        if (window.categoriesPage) {
            window.categoriesPage.render(container);
        } else {
            // Fallback si CategoriesPage n'est pas chargé
            container.innerHTML = `
                <div class="page-header">
                    <h1>Paramètres</h1>
                </div>
                
                <div class="card">
                    <h3>Configuration IA</h3>
                    <button class="btn btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                        <i class="fas fa-cog"></i> Configurer Claude AI
                    </button>
                </div>
                
                <div class="card">
                    <h3>Gestion des Catégories</h3>
                    <p>Le module de gestion avancée des catégories n'est pas chargé.</p>
                </div>
            `;
        }
    }

    // =====================================
    // MÉTHODES UTILITAIRES CONSERVÉES
    // =====================================
    getTemporaryEmails() {
        return this.temporaryEmailStorage || [];
    }

    calculateCategoryCounts(emails) {
        const counts = {};
        emails.forEach(email => {
            const cat = email.category || 'other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }

    buildCategoryPills(categoryCounts, totalEmails, categories, currentCategory) {
        let pills = `
            <button class="category-pill-compact ${currentCategory === 'all' ? 'active' : ''}" 
                    data-category="all"
                    onclick="window.pageManager.filterByCategory('all')">
                <span>📧</span>
                <span>Tous</span>
                <span class="category-pill-count">${totalEmails}</span>
            </button>
        `;
        
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                pills += `
                    <button class="category-pill-compact ${currentCategory === catId ? 'active' : ''}" 
                            data-category="${catId}"
                            onclick="window.pageManager.filterByCategory('${catId}')"
                            style="--cat-color: ${category.color}">
                        <span>${category.icon}</span>
                        <span>${category.name}</span>
                        <span class="category-pill-count">${count}</span>
                    </button>
                `;
            }
        });
        
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            pills += `
                <button class="category-pill-compact ${currentCategory === 'other' ? 'active' : ''}" 
                        data-category="other"
                        onclick="window.pageManager.filterByCategory('other')">
                    <span>📌</span>
                    <span>Autre</span>
                    <span class="category-pill-count">${otherCount}</span>
                </button>
            `;
        }
        
        return pills;
    }

    renderCondensedEmailItem(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Unknown';
        const senderInitial = senderName.charAt(0).toUpperCase();
        const formattedDate = this.formatEmailDate(email.receivedDateTime);
        
        return `
            <div class="email-condensed ${isSelected ? 'selected' : ''}" 
                 data-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="email-checkbox-condensed" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="sender-avatar-condensed">${senderInitial}</div>
                
                <div class="email-content-condensed">
                    <div class="email-line-one">
                        <span class="sender-name-condensed">${senderName}</span>
                        <span class="email-date-condensed">${formattedDate}</span>
                    </div>
                    <div class="email-subject-condensed">${email.subject || 'Sans sujet'}</div>
                </div>
                
                <div class="email-actions-condensed">
                    ${hasTask ? 
                        '<i class="fas fa-check-circle task-created-icon" title="Tâche créée"></i>' : 
                        '<i class="fas fa-plus-circle create-task-icon" title="Créer une tâche" onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal(\'' + email.id + '\')"></i>'
                    }
                </div>
            </div>
        `;
    }

    createEmailGroups(emails, groupMode) {
        const groups = {};
        
        emails.forEach(email => {
            let groupKey;
            let groupName;
            let groupAvatar;
            
            if (groupMode === 'grouped-domain') {
                const domain = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                groupKey = domain;
                groupName = domain;
                groupAvatar = domain.charAt(0).toUpperCase();
            } else {
                const senderEmail = email.from?.emailAddress?.address || 'unknown';
                const senderName = email.from?.emailAddress?.name || senderEmail;
                groupKey = senderEmail;
                groupName = senderName;
                groupAvatar = senderName.charAt(0).toUpperCase();
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    key: groupKey,
                    name: groupName,
                    avatar: groupAvatar,
                    emails: [],
                    count: 0,
                    latestDate: null
                };
            }
            
            groups[groupKey].emails.push(email);
            groups[groupKey].count++;
            
            const emailDate = new Date(email.receivedDateTime);
            if (!groups[groupKey].latestDate || emailDate > groups[groupKey].latestDate) {
                groups[groupKey].latestDate = emailDate;
            }
        });
        
        return Object.values(groups).sort((a, b) => {
            if (!a.latestDate && !b.latestDate) return 0;
            if (!a.latestDate) return 1;
            if (!b.latestDate) return -1;
            return b.latestDate - a.latestDate;
        });
    }

    renderEmailGroup(group, groupType = 'sender') {
        const displayName = groupType === 'grouped-domain' ? 
            `@${group.name}` : 
            group.name;
            
        const icon = groupType === 'grouped-domain' ? 
            '<i class="fas fa-globe"></i>' : 
            group.avatar;
        
        return `
            <div class="sender-line" data-sender="${group.key}">
                <div class="sender-line-content" 
                     data-group-key="${group.key}">
                    <div class="sender-avatar">
                        ${icon}
                    </div>
                    <div class="sender-info">
                        <div class="sender-name">${displayName}</div>
                    </div>
                    <div class="sender-meta">
                        <span class="sender-count">${group.count}</span>
                        <span class="sender-date">${this.formatEmailDate(group.latestDate)}</span>
                    </div>
                    <div class="sender-toggle">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
                <div class="sender-emails" style="display: none;">
                    <div class="emails-container">
                        ${group.emails.map(email => this.renderCondensedEmailItem(email)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // =====================================
    // EVENT HANDLERS
    // =====================================
    setupEmailsEventListeners() {
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    }

    setupGroupToggles() {
        const senderLines = document.querySelectorAll('.sender-line');
        
        senderLines.forEach((senderLine) => {
            const lineContent = senderLine.querySelector('.sender-line-content');
            
            if (!lineContent) return;
            
            lineContent.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const groupKey = senderLine.dataset.sender;
                this.toggleEmailGroup(groupKey);
            });
        });
    }

    toggleEmailGroup(groupKey) {
        const senderLine = document.querySelector(`[data-sender="${groupKey}"]`);
        if (!senderLine) return;
        
        const emailsContainer = senderLine.querySelector('.sender-emails');
        const toggle = senderLine.querySelector('.sender-toggle i');
        
        if (!emailsContainer || !toggle) return;
        
        const isHidden = emailsContainer.style.display === 'none' || !emailsContainer.style.display;
        
        if (isHidden) {
            emailsContainer.style.display = 'block';
            toggle.classList.remove('fa-chevron-right');
            toggle.classList.add('fa-chevron-down');
            senderLine.classList.add('expanded');
        } else {
            emailsContainer.style.display = 'none';
            toggle.classList.remove('fa-chevron-down');
            toggle.classList.add('fa-chevron-right');
            senderLine.classList.remove('expanded');
        }
    }

    handleEmailClick(event, emailId) {
        // Si on clique sur l'email condensé, afficher les détails
        this.showEmailModal(emailId);
    }

    showEmailModal(emailId) {
        const email = this.getEmailById(emailId);
        if (!email) return;

        // Nettoyer tout modal existant
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        // Créer un nouvel id unique
        const uniqueId = 'email_modal_' + Date.now();

        // Créer le modal avec style inline pour forcer l'affichage
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 800px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;">Email Complet</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 20px; overflow-y: auto; flex: 1;">
                        <div style="margin-bottom: 20px;">
                            <div style="margin-bottom: 10px;">
                                <span style="font-weight: bold;">De:</span>
                                <span>${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</span>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <span style="font-weight: bold;">Date:</span>
                                <span>${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <span style="font-weight: bold;">Sujet:</span>
                                <span>${email.subject || 'Sans sujet'}</span>
                            </div>
                        </div>
                        <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb;">
                            ${this.getEmailContent(email)}
                        </div>
                    </div>
                    <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Fermer
                        </button>
                        ${!this.createdTasks.has(emailId) ? `
                            <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.showTaskCreationModal('${emailId}');"
                                    style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-tasks"></i> Créer une tâche
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    // =====================================
    // UTILITAIRES EXISTANTS
    // =====================================
    changeViewMode(mode) {
        this.currentViewMode = mode;
        
        // Update active button
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Re-render list
        this.renderEmailsList(mode, this.currentCategory);
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        
        document.querySelectorAll('.category-pill-compact').forEach(pill => {
            pill.classList.remove('active');
        });
        
        const activePill = document.querySelector(`[data-category="${categoryId}"]`);
        if (activePill) {
            activePill.classList.add('active');
        }
        
        this.renderEmailsList(this.currentViewMode, categoryId);
    }

    handleSearch(term) {
        this.searchTerm = term.trim();
        const currentCategory = document.querySelector('.category-pill-compact.active')?.dataset.category || 'all';
        this.renderEmailsList(this.currentViewMode, currentCategory);
        
        const clearBtn = document.getElementById('searchClearBtn');
        if (clearBtn) {
            clearBtn.style.display = this.searchTerm ? 'flex' : 'none';
        }
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        const currentCategory = document.querySelector('.category-pill-compact.active')?.dataset.category || 'all';
        this.renderEmailsList(this.currentViewMode, currentCategory);
    }

    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        // Re-render emails page to update header
        this.renderEmails(document.getElementById('pageContent'));
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.renderEmails(document.getElementById('pageContent'));
    }

    async refreshEmails() {
        window.uiManager.showLoading('Actualisation...');
        
        try {
            const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
            
            if (emails.length > 0 && window.categoryManager) {
                // Re-categorize emails
                emails.forEach(email => {
                    const result = window.categoryManager.analyzeEmail(email);
                    email.category = result.category || 'other';
                });
            }
            
            await this.loadPage('emails');
            window.uiManager.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            window.uiManager.hideLoading();
            window.uiManager.showToast('Erreur d\'actualisation', 'error');
        }
    }

    getEmailById(emailId) {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        return emails.find(e => e.id === emailId);
    }

    getEmailContent(email) {
        if (email.body?.content) {
            return email.body.content;
        }
        return `<p>${email.bodyPreview || 'Aucun contenu'}</p>`;
    }

    formatEmailDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}h`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }

    matchesSearch(email, searchTerm) {
        if (!searchTerm) return true;
        
        const search = searchTerm.toLowerCase();
        const subject = (email.subject || '').toLowerCase();
        const sender = (email.from?.emailAddress?.name || '').toLowerCase();
        const senderEmail = (email.from?.emailAddress?.address || '').toLowerCase();
        const preview = (email.bodyPreview || '').toLowerCase();
        
        return subject.includes(search) || 
               sender.includes(search) || 
               senderEmail.includes(search) || 
               preview.includes(search);
    }

    analyzeFirstEmails(emails) {
        // Stub pour l'analyse automatique
        console.log('[PageManager] Auto-analyzing first emails (stub)');
    }

    showTaskCreationModal(emailId) {
        // Stub pour la création de tâches
        console.log('[PageManager] Task creation modal (stub) for email:', emailId);
        window.uiManager.showToast('Fonctionnalité de création de tâches à implémenter', 'info');
    }

    createTasksFromSelection() {
        // Stub pour la création de tâches en lot
        console.log('[PageManager] Bulk task creation (stub)');
        window.uiManager.showToast('Création de tâches en lot à implémenter', 'info');
    }

    // =====================================
    // STYLES
    // =====================================
    addEmailStyles() {
        if (document.getElementById('emailPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'emailPageStyles';
        styles.textContent = `
            /* Email page styles */
            .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .page-header h1 {
                margin: 0;
                color: #1f2937;
                font-size: 28px;
                font-weight: 700;
            }
            
            .page-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .btn {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                color: #374151;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
                text-decoration: none;
            }
            
            .btn:hover {
                background: #f9fafb;
                border-color: #9ca3af;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
            }
            
            .btn-secondary {
                background: #6b7280;
                color: white;
                border-color: #6b7280;
            }
            
            .btn-secondary:hover {
                background: #4b5563;
                border-color: #4b5563;
            }
            
            .btn-small {
                padding: 6px 12px;
                font-size: 12px;
            }
            
            .btn-large {
                padding: 16px 24px;
                font-size: 16px;
            }
            
            .search-bar-container {
                margin-bottom: 20px;
            }
            
            .search-bar {
                max-width: 500px;
            }
            
            .search-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                color: #6b7280;
                z-index: 1;
            }
            
            .search-input {
                width: 100%;
                padding: 12px 40px 12px 40px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: white;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-clear-btn {
                position: absolute;
                right: 12px;
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                display: none;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
            }
            
            .emails-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 20px 0;
                padding: 0 4px;
            }
            
            .emails-count {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .view-mode-group {
                display: flex;
                background: #f3f4f6;
                border-radius: 8px;
                padding: 4px;
                gap: 4px;
            }
            
            .view-mode-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
                font-weight: 500;
            }
            
            .view-mode-btn:hover {
                background: #e5e7eb;
                color: #374151;
            }
            
            .view-mode-btn.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .category-pills-container {
                margin: 20px 0;
            }
            
            .category-pills-row {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .category-pill-compact {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
            }
            
            .category-pill-compact:hover {
                border-color: var(--cat-color, #667eea);
                background: var(--cat-color, #667eea)10;
            }
            
            .category-pill-compact.active {
                background: var(--cat-color, #667eea);
                color: white;
                border-color: var(--cat-color, #667eea);
            }
            
            .category-pill-count {
                background: rgba(0,0,0,0.1);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .emails-condensed-list {
                display: flex;
                flex-direction: column;
                gap: 2px;
                background: #f9fafb;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .email-condensed {
                display: flex;
                align-items: center;
                background: white;
                padding: 12px 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .email-condensed:last-child {
                border-bottom: none;
            }
            
            .email-condensed:hover {
                background: #f9fafb;
            }
            
            .email-condensed.selected {
                background: #eff6ff;
                border-left: 3px solid #3b82f6;
            }
            
            .email-checkbox-condensed {
                margin-right: 12px;
                cursor: pointer;
            }
            
            .sender-avatar-condensed {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .email-content-condensed {
                flex: 1;
                min-width: 0;
            }
            
            .email-line-one {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2px;
            }
            
            .sender-name-condensed {
                font-weight: 600;
                color: #1f2937;
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-right: 8px;
            }
            
            .email-date-condensed {
                font-size: 12px;
                color: #6b7280;
                flex-shrink: 0;
            }
            
            .email-subject-condensed {
                font-size: 13px;
                color: #4b5563;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .email-actions-condensed {
                margin-left: 12px;
                display: flex;
                align-items: center;
            }
            
            .task-created-icon {
                color: #10b981;
                font-size: 18px;
            }
            
            .create-task-icon {
                color: #6b7280;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .create-task-icon:hover {
                color: #10b981;
                transform: scale(1.1);
            }
            
            .senders-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .sender-line {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.2s ease;
            }
            
            .sender-line:hover {
                border-color: #d1d5db;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .sender-line.expanded {
                border-color: #667eea;
            }
            
            .sender-line-content {
                display: flex;
                align-items: center;
                padding: 16px;
                cursor: pointer;
                user-select: none;
            }
            
            .sender-avatar {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 16px;
                margin-right: 12px;
            }
            
            .sender-info {
                flex: 1;
            }
            
            .sender-name {
                font-weight: 600;
                color: #1f2937;
                font-size: 15px;
            }
            
            .sender-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-right: 12px;
            }
            
            .sender-count {
                background: #f3f4f6;
                color: #4b5563;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .sender-date {
                color: #6b7280;
                font-size: 13px;
            }
            
            .sender-toggle {
                color: #6b7280;
                font-size: 14px;
                transition: transform 0.2s ease;
            }
            
            .sender-emails {
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
            }
            
            .emails-container {
                padding: 8px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #9ca3af;
            }
            
            .empty-state-title {
                font-size: 20px;
                color: #374151;
                margin-bottom: 8px;
                font-weight: 600;
            }
            
            .empty-state-text {
                font-size: 16px;
                margin-bottom: 24px;
                line-height: 1.5;
            }
            
            .grid {
                display: grid;
                gap: 20px;
            }
            
            .grid-4 {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
            
            .card {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }
            
            .card h3 {
                margin: 0 0 15px 0;
                color: #1f2937;
                font-size: 18px;
                font-weight: 600;
            }
            
            .scan-stats {
                margin-bottom: 20px;
            }
            
            .scan-stats p {
                margin: 8px 0;
                color: #4b5563;
            }
            
            .scan-time {
                font-size: 14px;
                color: #6b7280;
            }
            
            .scan-actions {
                display: flex;
                gap: 10px;
            }
            
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .category-card {
                text-align: center;
                padding: 30px;
            }
            
            .category-card .category-icon {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                margin: 0 auto 20px;
            }
            
            .category-card h3 {
                margin: 0 0 8px 0;
                color: #1f2937;
            }
            
            .category-card p {
                margin: 0;
                color: #6b7280;
            }
            
            .ai-banner {
                display: flex;
                align-items: center;
                gap: 16px;
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid #fbbf24;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
            }
            
            .ai-banner-icon {
                font-size: 48px;
                color: #f59e0b;
            }
            
            .ai-banner-content h3 {
                margin: 0 0 4px 0;
                color: #92400e;
            }
            
            .ai-banner-content p {
                margin: 0;
                color: #78350f;
            }
            
            .selection-info {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #eff6ff;
                padding: 8px 12px;
                border-radius: 6px;
                border: 1px solid #bfdbfe;
            }
            
            .selection-count {
                font-size: 14px;
                color: #1e40af;
                font-weight: 500;
            }
            
            @media (max-width: 768px) {
                .page-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                }
                
                .page-actions {
                    flex-wrap: wrap;
                }
                
                .emails-toolbar {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                }
                
                .view-mode-group {
                    align-self: stretch;
                    justify-content: center;
                }
                
                .view-mode-btn .btn-text {
                    display: none;
                }
                
                .category-pills-row {
                    justify-content: center;
                }
                
                .email-line-one {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 2px;
                }
                
                .sender-meta {
                    flex-direction: column;
                    gap: 4px;
                }
                
                .grid-4 {
                    grid-template-columns: 1fr;
                }
                
                .ai-banner {
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Create global instance
window.pageManager = new PageManager();

// Bind methods
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v9.1 loaded - Fixed navigation and scanner integration');
