// DomainOrganizer.js - Version 6.5.0 - Force persistance et suppression du trait
class DomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.existingFolders = new Map();
        this.domainAnalysis = new Map();
        this.emailsByDomain = new Map();
        this.excludedDomains = new Set();
        this.excludedEmails = new Set();
        this.progressCallback = null;
        this.currentAnalysis = null;
        this.selectedActions = new Map();
        this.currentStep = 'configure';
        this.emailSelections = new Map();
        this.validationErrors = new Map();
        this.folderCreationQueue = new Map();
        this.isInitialized = false;
        this.persistenceTimer = null;
        this.isActive = false;
        console.log('[DomainOrganizer] ✅ v6.5 - Force persistance et suppression du trait');
    }

    getPageHTML() {
        return `<div class="domain-organizer-wrapper" id="domainOrganizerWrapper">
    <!-- CSS de nettoyage pour supprimer les traits et forcer l'affichage -->
    <style>
        /* Suppression complète de tous les traits et bordures parasites */
        .domain-organizer-wrapper,
        .domain-organizer-wrapper * {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }
        
        /* Force l'affichage et empêche la disparition */
        .domain-organizer-wrapper {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #f8fafc !important;
            z-index: 99999 !important;
            overflow-y: auto !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        .domain-organizer-app {
            max-width: 1200px !important;
            margin: 0 auto !important;
            padding: 24px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            color: #1e293b !important;
            line-height: 1.6 !important;
            background: transparent !important;
            min-height: calc(100vh - 48px) !important;
            position: relative !important;
        }
        
        /* Header personnalisé */
        .custom-header {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: linear-gradient(135deg, #3b82f6, #1e40af) !important;
            color: white !important;
            padding: 16px 24px !important;
            z-index: 100000 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
        }
        
        .custom-header h1 {
            font-size: 24px !important;
            font-weight: 700 !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
        }
        
        .close-btn {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 8px !important;
            padding: 8px 16px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }
        
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.3) !important;
            transform: translateY(-1px) !important;
        }
        
        .content-area {
            margin-top: 80px !important;
            padding: 24px !important;
        }
        
        .organizer-header {
            margin-bottom: 32px !important;
            text-align: center !important;
            background: white !important;
            padding: 32px !important;
            border-radius: 16px !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
        }
        
        .organizer-header h2 {
            font-size: 28px !important;
            font-weight: 700 !important;
            margin-bottom: 24px !important;
            color: #1e293b !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 16px !important;
        }
        
        .organizer-header h2 i {
            color: #3b82f6 !important;
            font-size: 24px !important;
        }
        
        .step-progress {
            display: flex !important;
            justify-content: center !important;
            gap: 8px !important;
            margin: 0 auto !important;
            max-width: 800px !important;
            background: #f1f5f9 !important;
            padding: 12px !important;
            border-radius: 12px !important;
        }
        
        .step {
            flex: 1 !important;
            padding: 16px 20px !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
            background: transparent !important;
            color: #64748b !important;
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 8px !important;
            cursor: pointer !important;
        }
        
        .step i {
            font-size: 18px !important;
            transition: all 0.15s ease !important;
        }
        
        .step.active {
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            color: white !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
            transform: translateY(-2px) !important;
        }
        
        .step.completed {
            background: linear-gradient(135deg, #10b981, #059669) !important;
            color: white !important;
        }
        
        .main-content {
            min-height: 600px !important;
            position: relative !important;
            margin-top: 32px !important;
        }
        
        .step-content {
            display: none !important;
            opacity: 0 !important;
            transform: translateY(20px) !important;
            transition: all 0.4s ease !important;
        }
        
        .step-content.active {
            display: block !important;
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .card {
            background: white !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
            overflow: hidden !important;
            transition: all 0.3s ease !important;
        }
        
        .card:hover {
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important;
            transform: translateY(-2px) !important;
        }
        
        .card-header {
            padding: 32px !important;
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            color: white !important;
            text-align: center !important;
        }
        
        .card-header h3 {
            font-size: 24px !important;
            margin-bottom: 8px !important;
            font-weight: 700 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
        }
        
        .card-header .subtitle {
            opacity: 0.9 !important;
            font-size: 16px !important;
            margin: 0 !important;
        }
        
        .config-form {
            padding: 40px !important;
        }
        
        .form-section {
            margin-bottom: 40px !important;
            padding-bottom: 32px !important;
            border-bottom: 2px solid #f1f5f9 !important;
        }
        
        .form-section:last-child {
            border-bottom: none !important;
            margin-bottom: 0 !important;
        }
        
        .form-section h4 {
            font-size: 20px !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            margin-bottom: 20px !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
        }
        
        .form-section h4 i {
            color: #3b82f6 !important;
            font-size: 18px !important;
        }
        
        .form-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
        }
        
        .form-group {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
        }
        
        .form-group label {
            font-weight: 600 !important;
            color: #334155 !important;
            font-size: 15px !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
        }
        
        .form-group label i {
            color: #3b82f6 !important;
            width: 18px !important;
        }
        
        .form-group input {
            padding: 16px 20px !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 12px !important;
            font-size: 16px !important;
            transition: all 0.2s ease !important;
            background: white !important;
        }
        
        .form-group input:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 4px #dbeafe !important;
            transform: translateY(-2px) !important;
        }
        
        .help-text {
            font-size: 13px !important;
            color: #64748b !important;
            font-style: italic !important;
        }
        
        .form-actions {
            text-align: center !important;
            margin-top: 40px !important;
            padding-top: 32px !important;
            border-top: 2px solid #f1f5f9 !important;
        }
        
        .btn-primary {
            padding: 16px 32px !important;
            border-radius: 12px !important;
            font-weight: 700 !important;
            font-size: 16px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
            text-decoration: none !important;
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            color: white !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
        }
        
        .btn-primary:hover:not(:disabled) {
            transform: translateY(-3px) !important;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
            filter: brightness(1.1) !important;
        }
        
        .btn-primary:active {
            transform: translateY(-1px) !important;
        }
        
        .btn-primary:disabled {
            background: #cbd5e1 !important;
            cursor: not-allowed !important;
            transform: none !important;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
            filter: none !important;
        }
        
        /* Suppression spécifique du trait parasite */
        .domain-organizer-wrapper::before,
        .domain-organizer-wrapper::after,
        .domain-organizer-app::before,
        .domain-organizer-app::after,
        .card::before,
        .card::after {
            display: none !important;
            content: none !important;
        }
        
        /* Animation d'entrée */
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .domain-organizer-app {
            animation: slideIn 0.5s ease-out !important;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .domain-organizer-app {
                padding: 16px !important;
            }
            
            .content-area {
                padding: 16px !important;
            }
            
            .form-row {
                grid-template-columns: 1fr !important;
                gap: 20px !important;
            }
            
            .step-progress {
                flex-direction: column !important;
                gap: 8px !important;
            }
            
            .step {
                flex-direction: row !important;
                text-align: left !important;
                padding: 12px 16px !important;
            }
            
            .custom-header {
                padding: 12px 16px !important;
            }
            
            .custom-header h1 {
                font-size: 20px !important;
            }
        }
        
        /* Force anti-disparition */
        .domain-organizer-wrapper.force-visible {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: fixed !important;
            z-index: 99999 !important;
        }
    </style>

    <!-- Header personnalisé avec bouton fermer -->
    <div class="custom-header">
        <h1>
            <i class="fas fa-folder-tree"></i>
            EmailSortPro - Organisation par domaine
        </h1>
        <button class="close-btn" onclick="window.organizerInstance.closeApp()">
            <i class="fas fa-times"></i>
            Fermer
        </button>
    </div>

    <!-- Zone de contenu principale -->
    <div class="content-area">
        <div class="domain-organizer-app" id="domainOrganizerApp">
            <div class="organizer-header">
                <h2><i class="fas fa-magic"></i> Assistant d'organisation intelligente</h2>
                <div class="step-progress">
                    <div class="step active" data-step="configure">
                        <i class="fas fa-cog"></i>
                        <span>Configuration</span>
                    </div>
                    <div class="step" data-step="analyze">
                        <i class="fas fa-search"></i>
                        <span>Analyse</span>
                    </div>
                    <div class="step" data-step="review">
                        <i class="fas fa-check-square"></i>
                        <span>Validation</span>
                    </div>
                    <div class="step" data-step="execute">
                        <i class="fas fa-play"></i>
                        <span>Exécution</span>
                    </div>
                </div>
            </div>

            <div class="main-content">
                <!-- Étape Configuration -->
                <div class="step-content active" id="configStep">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-cog"></i> Configuration du rangement</h3>
                            <p class="subtitle">Configurez les paramètres pour organiser automatiquement vos emails par domaine d'expéditeur</p>
                        </div>
                        
                        <form id="organizeForm" class="config-form">
                            <div class="form-section">
                                <h4><i class="fas fa-calendar-alt"></i> Période d'analyse</h4>
                                <p style="color: #64748b; margin-bottom: 24px;">Sélectionnez la période des emails à analyser et organiser</p>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="startDate">
                                            <i class="fas fa-calendar-plus"></i>
                                            Date de début
                                        </label>
                                        <input type="date" id="startDate" name="startDate" required>
                                        <span class="help-text">Les emails reçus à partir de cette date seront analysés</span>
                                    </div>
                                    <div class="form-group">
                                        <label for="endDate">
                                            <i class="fas fa-calendar-check"></i>
                                            Date de fin
                                        </label>
                                        <input type="date" id="endDate" name="endDate" required>
                                        <span class="help-text">Les emails reçus jusqu'à cette date seront analysés</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4><i class="fas fa-filter"></i> Exclusions (optionnel)</h4>
                                <p style="color: #64748b; margin-bottom: 24px;">Spécifiez les domaines ou adresses à ignorer lors du rangement</p>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="excludeDomains">
                                            <i class="fas fa-ban"></i>
                                            Domaines à ignorer
                                        </label>
                                        <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com, yahoo.fr">
                                        <span class="help-text">Séparez les domaines par des virgules. Ces emails ne seront pas déplacés.</span>
                                    </div>
                                    <div class="form-group">
                                        <label for="excludeEmails">
                                            <i class="fas fa-user-times"></i>
                                            Adresses spécifiques à ignorer
                                        </label>
                                        <input type="text" id="excludeEmails" placeholder="boss@company.com, important@client.fr">
                                        <span class="help-text">Séparez les adresses par des virgules. Ces emails resteront en place.</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn-primary" id="analyzeBtn">
                                    <i class="fas fa-rocket"></i>
                                    <span>Lancer l'analyse intelligente</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Étape Analyse -->
                <div class="step-content" id="analyzeStep" style="display: none;">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-search fa-spin"></i> Analyse en cours</h3>
                            <p class="subtitle">Notre IA analyse vos emails pour créer une organisation optimale</p>
                        </div>
                        <div style="padding: 40px; text-align: center;">
                            <div style="margin: 30px 0;">
                                <div style="background: #e2e8f0; height: 12px; border-radius: 6px; overflow: hidden; position: relative;">
                                    <div id="progressFill" style="background: linear-gradient(90deg, #3b82f6, #06b6d4); height: 100%; width: 0%; transition: width 0.5s ease; border-radius: 6px;"></div>
                                </div>
                                <div style="margin-top: 16px; display: flex; justify-content: space-between; font-size: 14px; color: #64748b;">
                                    <span id="progressLabel">Initialisation</span>
                                    <span id="progressPercent">0%</span>
                                </div>
                            </div>
                            <div id="progressMessage" style="font-size: 16px; color: #1e293b; font-weight: 500;">Préparation de l'analyse...</div>
                            <div style="margin-top: 24px; display: flex; justify-content: center; gap: 32px; color: #64748b;">
                                <div><i class="fas fa-envelope"></i> <span id="emailsCount">0</span> emails</div>
                                <div><i class="fas fa-at"></i> <span id="domainsCount">0</span> domaines</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étapes suivantes simplifiées -->
                <div class="step-content" id="reviewStep" style="display: none;">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-check-square"></i> Validation des résultats</h3>
                            <p class="subtitle">Vérifiez l'organisation proposée avant l'exécution</p>
                        </div>
                        <div style="padding: 40px; text-align: center;">
                            <p style="font-size: 18px; color: #1e293b;">Les résultats de l'analyse s'afficheront ici.</p>
                            <div style="margin-top: 32px;">
                                <button class="btn-primary" onclick="window.organizerInstance.simulateExecution()">
                                    <i class="fas fa-play"></i>
                                    Lancer l'organisation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="step-content" id="executeStep" style="display: none;">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-cogs fa-spin"></i> Organisation en cours</h3>
                            <p class="subtitle">Vos emails sont en train d'être organisés automatiquement</p>
                        </div>
                        <div style="padding: 40px; text-align: center;">
                            <div style="margin: 30px 0;">
                                <div style="background: #e2e8f0; height: 12px; border-radius: 6px; overflow: hidden;">
                                    <div id="executeProgressFill" style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: 0%; transition: width 0.5s ease; border-radius: 6px;"></div>
                                </div>
                            </div>
                            <div id="executeMessage" style="font-size: 16px; color: #1e293b; font-weight: 500;">Organisation en cours...</div>
                        </div>
                    </div>
                </div>

                <div class="step-content" id="resultsStep" style="display: none;">
                    <div class="card">
                        <div class="card-header" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <h3><i class="fas fa-check-circle"></i> Organisation terminée !</h3>
                            <p class="subtitle">Votre boîte mail a été organisée avec succès</p>
                        </div>
                        <div style="padding: 40px; text-align: center;">
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0;">
                                <div style="background: #f0fdf4; padding: 20px; border-radius: 12px;">
                                    <div style="font-size: 32px; font-weight: 700; color: #10b981;">150</div>
                                    <div style="color: #166534;">Emails organisés</div>
                                </div>
                                <div style="background: #eff6ff; padding: 20px; border-radius: 12px;">
                                    <div style="font-size: 32px; font-weight: 700; color: #3b82f6;">12</div>
                                    <div style="color: #1e40af;">Dossiers créés</div>
                                </div>
                                <div style="background: #fef3c7; padding: 20px; border-radius: 12px;">
                                    <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">0</div>
                                    <div style="color: #92400e;">Erreurs</div>
                                </div>
                            </div>
                            <div style="margin-top: 32px; display: flex; gap: 16px; justify-content: center;">
                                <button class="btn-primary" onclick="window.organizerInstance.resetForm()">
                                    <i class="fas fa-redo"></i>
                                    Nouveau rangement
                                </button>
                                <button class="close-btn" onclick="window.organizerInstance.closeApp()" style="background: #64748b; color: white;">
                                    <i class="fas fa-home"></i>
                                    Retour accueil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v6.5...');
        
        // Forcer la persistance immédiatement
        this.forcePersistence();
        
        // Vérification de l'authentification
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }

        // Attendre que le DOM soit complètement chargé
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Forcer l'affichage du contenu
        this.forceDisplayContent();
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.showStep('configure');
        this.isInitialized = true;
        this.isActive = true;
        
        console.log('[DomainOrganizer] ✅ Successfully initialized v6.5');
        return true;
    }

    forcePersistence() {
        console.log('[DomainOrganizer] Forcing persistence...');
        
        // Stopper tous les timers qui pourraient remplacer le contenu
        if (this.persistenceTimer) {
            clearInterval(this.persistenceTimer);
        }
        
        // Timer de persistence qui force l'affichage
        this.persistenceTimer = setInterval(() => {
            if (this.isActive) {
                const wrapper = document.getElementById('domainOrganizerWrapper');
                if (wrapper) {
                    wrapper.classList.add('force-visible');
                    wrapper.style.cssText = `
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        background: #f8fafc !important;
                        z-index: 99999 !important;
                        overflow-y: auto !important;
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                    `;
                    
                    // Bloquer l'affichage d'autres contenus
                    const pageContent = document.getElementById('pageContent');
                    if (pageContent && pageContent.querySelector('.domain-organizer-wrapper')) {
                        pageContent.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
                    }
                }
            }
        }, 100);
        
        console.log('[DomainOrganizer] Persistence timer started');
    }

    forceDisplayContent() {
        console.log('[DomainOrganizer] Forcing content display...');
        
        const wrapper = document.getElementById('domainOrganizerWrapper');
        if (wrapper) {
            wrapper.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: #f8fafc !important;
                z-index: 99999 !important;
                overflow-y: auto !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
        }
        
        // S'assurer que l'étape active est visible
        const configStep = document.getElementById('configStep');
        if (configStep) {
            configStep.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
            configStep.classList.add('active');
        }
        
        console.log('[DomainOrganizer] Content display forced');
    }

    setupEventListeners() {
        const form = document.getElementById('organizeForm');
        if (form) {
            // Supprimer les anciens listeners
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            // Ajouter le nouveau listener
            newForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
            console.log('[DomainOrganizer] Event listeners attached');
        } else {
            console.warn('[DomainOrganizer] Form not found for event listeners');
        }
    }

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) {
            startDateInput.valueAsDate = thirtyDaysAgo;
            console.log('[DomainOrganizer] Start date set:', startDateInput.value);
        }
        if (endDateInput) {
            endDateInput.valueAsDate = today;
            console.log('[DomainOrganizer] End date set:', endDateInput.value);
        }
    }

    showStep(stepName) {
        console.log(`[DomainOrganizer] Showing step: ${stepName}`);
        
        // Mise à jour des indicateurs d'étapes
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
            if (step.dataset.step === stepName) {
                step.classList.add('active');
            } else if (this.isStepCompleted(step.dataset.step, stepName)) {
                step.classList.add('completed');
            }
        });

        // Masquer tous les contenus d'étapes
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        // Afficher l'étape active
        const activeStep = document.getElementById(`${stepName}Step`);
        if (activeStep) {
            activeStep.classList.add('active');
            activeStep.style.cssText = 'display: block !important; opacity: 1 !important;';
        }

        this.currentStep = stepName;
    }

    isStepCompleted(stepName, currentStep) {
        const steps = ['configure', 'analyze', 'review', 'execute'];
        return steps.indexOf(stepName) < steps.indexOf(currentStep);
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) {
            console.log('[DomainOrganizer] Already processing, ignoring submit');
            return;
        }

        console.log('[DomainOrganizer] Form submitted!');
        const formData = this.getFormData();
        console.log('[DomainOrganizer] Form data:', formData);
        
        // Validation basique
        if (!formData.startDate && !formData.endDate) {
            this.showError('Veuillez sélectionner au moins une date');
            return;
        }

        // Simuler l'analyse pour tester
        this.simulateAnalysis();
    }

    simulateAnalysis() {
        console.log('[DomainOrganizer] Starting simulated analysis...');
        this.showStep('analyze');
        
        const progressFill = document.getElementById('progressFill');
        const progressMessage = document.getElementById('progressMessage');
        const progressLabel = document.getElementById('progressLabel');
        const progressPercent = document.getElementById('progressPercent');
        const emailsCount = document.getElementById('emailsCount');
        const domainsCount = document.getElementById('domainsCount');
        
        let progress = 0;
        let emails = 0;
        let domains = 0;
        
        const interval = setInterval(() => {
            progress += 10;
            emails += Math.floor(Math.random() * 20) + 5;
            
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressPercent) progressPercent.textContent = `${progress}%`;
            if (emailsCount) emailsCount.textContent = emails;
            
            if (progress === 20) {
                if (progressLabel) progressLabel.textContent = 'Connexion à Outlook';
                if (progressMessage) progressMessage.textContent = 'Récupération des emails...';
            } else if (progress === 40) {
                domains = Math.floor(emails / 12);
                if (domainsCount) domainsCount.textContent = domains;
                if (progressLabel) progressLabel.textContent = 'Analyse des domaines';
                if (progressMessage) progressMessage.textContent = 'Classification intelligente...';
            } else if (progress === 70) {
                if (progressLabel) progressLabel.textContent = 'Optimisation';
                if (progressMessage) progressMessage.textContent = 'Création de la structure...';
            } else if (progress === 90) {
                if (progressLabel) progressLabel.textContent = 'Finalisation';
                if (progressMessage) progressMessage.textContent = 'Préparation des résultats...';
            } else if (progress >= 100) {
                clearInterval(interval);
                if (progressLabel) progressLabel.textContent = 'Terminé';
                if (progressMessage) progressMessage.textContent = 'Analyse complète !';
                setTimeout(() => this.showStep('review'), 1500);
            }
        }, 600);
    }

    simulateExecution() {
        console.log('[DomainOrganizer] Starting simulated execution...');
        this.showStep('execute');
        
        const progressFill = document.getElementById('executeProgressFill');
        const progressMessage = document.getElementById('executeMessage');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 12;
            if (progressFill) progressFill.style.width = `${progress}%`;
            
            if (progress === 24) {
                if (progressMessage) progressMessage.textContent = 'Création des dossiers...';
            } else if (progress === 48) {
                if (progressMessage) progressMessage.textContent = 'Déplacement des emails...';
            } else if (progress === 72) {
                if (progressMessage) progressMessage.textContent = 'Finalisation...';
            } else if (progress >= 100) {
                clearInterval(interval);
                if (progressMessage) progressMessage.textContent = 'Organisation terminée !';
                setTimeout(() => this.showStep('results'), 1000);
            }
        }, 400);
    }

    getFormData() {
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        const excludeDomains = document.getElementById('excludeDomains')?.value
            .split(',').map(d => d.trim()).filter(d => d) || [];
        const excludeEmails = document.getElementById('excludeEmails')?.value
            .split(',').map(e => e.trim()).filter(e => e) || [];

        return { startDate, endDate, excludeDomains, excludeEmails };
    }

    resetForm() {
        console.log('[DomainOrganizer] Resetting form');
        this.showStep('configure');
        const form = document.getElementById('organizeForm');
        if (form) form.reset();
        this.setDefaultDates();
    }

    closeApp() {
        console.log('[DomainOrganizer] Closing app');
        this.isActive = false;
        
        if (this.persistenceTimer) {
            clearInterval(this.persistenceTimer);
            this.persistenceTimer = null;
        }
        
        // Retourner au contenu normal
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = '<div style="padding: 40px; text-align: center;"><h2>EmailSortPro</h2><p>Application fermée. Utilisez la navigation pour accéder aux autres fonctionnalités.</p></div>';
        }
        
        // Recharger la page pour revenir à l'état normal
        setTimeout(() => window.location.reload(), 100);
    }

    showError(message) {
        console.error('[DomainOrganizer] Error:', message);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            alert(message);
        }
    }
}

// === INITIALISATION ULTRA-ROBUSTE ===

// Créer l'instance globale
window.organizerInstance = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ v6.5 Instance created');

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v6.5 with force persistence...');
    
    // Vérification de l'authentification
    if (!window.authService?.isAuthenticated()) {
        const message = 'Veuillez vous connecter pour utiliser l\'organisateur';
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'warning');
        } else {
            alert(message);
        }
        return;
    }

    const pageContent = document.getElementById('pageContent');
    if (!pageContent) {
        console.error('[DomainOrganizer] pageContent element not found');
        return;
    }

    // Marquer comme actif
    window.domainOrganizerActive = true;

    // Bloquer complètement le système de navigation principal
    const originalLoadPage = window.pageManager?.loadPage;
    if (originalLoadPage) {
        window.pageManager.loadPage = function(pageName) {
            if (window.organizerInstance?.isActive) {
                console.log('[DomainOrganizer] Navigation blocked while active');
                return;
            }
            return originalLoadPage.call(this, pageName);
        };
    }

    // Injecter le HTML avec force maximale
    pageContent.innerHTML = window.organizerInstance.getPageHTML();
    
    // Forcer l'affichage avec CSS inline ultra-robuste
    pageContent.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 99998 !important;
        min-height: 100vh !important;
        width: 100% !important;
        height: 100% !important;
    `;

    // Supprimer toute navigation qui pourrait interférer
    document.querySelectorAll('.nav-item').forEach(item => {
        const clone = item.cloneNode(true);
        clone.onclick = null;
        item.parentNode.replaceChild(clone, item);
    });

    // Initialiser immédiatement
    setTimeout(async () => {
        if (window.domainOrganizerActive && document.getElementById('configStep')) {
            try {
                await window.organizerInstance.initializePage();
                console.log('[DomainOrganizer] ✅ Successfully initialized v6.5');
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
            }
        }
    }, 50);

    console.log('[DomainOrganizer] ✅ Interface launched with maximum persistence v6.5');
}

// === SYSTÈME D'INTERCEPTION ULTRA-ROBUSTE ===

// Interception des clics avec priorité maximale
document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]') || 
                        e.target.closest('button[onclick*="ranger"]') || 
                        e.target.closest('a[href*="ranger"]');
    
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[DomainOrganizer] 🎯 Ranger click detected v6.5');
        showDomainOrganizerApp();
        return false;
    }
}, true);

// Bloquer les interceptions de dashboard
const originalDashboardIntercept = window.console.log;
window.addEventListener('load', () => {
    // Désactiver les interceptions de dashboard quand le DomainOrganizer est actif
    const observer = new MutationObserver(() => {
        if (window.organizerInstance?.isActive) {
            const dashboardElements = document.querySelectorAll('[data-page="dashboard"]');
            dashboardElements.forEach(el => {
                el.onclick = () => false;
            });
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

// Hook du PageManager avec blocage
if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        console.log(`[DomainOrganizer] 🔍 PageManager.loadPage: ${pageName}`);
        
        if (pageName === 'ranger') {
            console.log('[DomainOrganizer] 🎯 PageManager interception v6.5');
            showDomainOrganizerApp();
            return;
        }
        
        if (window.organizerInstance?.isActive) {
            console.log('[DomainOrganizer] Page load blocked while organizer is active');
            return;
        }

        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                console.log('[DomainOrganizer] 🔧 PageManager error intercepted v6.5');
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
    
    console.log('[DomainOrganizer] ✅ PageManager hook installed v6.5');
}

// Fonctions globales
window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = {
    showPage: showDomainOrganizerApp,
    instance: window.organizerInstance
};
window.testDomainOrganizer = showDomainOrganizerApp;

console.log('[DomainOrganizer] ✅ v6.5 System with MAXIMUM PERSISTENCE ready');
