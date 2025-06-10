// DomainOrganizer.js - Version 6.4.0 - Correction affichage du contenu
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
        console.log('[DomainOrganizer] ✅ v6.4 - Correction affichage du contenu');
    }

    getPageHTML() {
        return `<div class="domain-organizer-app" id="domainOrganizerApp">
    <!-- CSS Inline pour s'assurer qu'il est chargé -->
    <style>
        .domain-organizer-app {
            max-width: 1200px !important;
            margin: 0 auto !important;
            padding: 24px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            color: #1e293b !important;
            line-height: 1.6 !important;
            background: #f8fafc !important;
            min-height: calc(100vh - 48px) !important;
        }
        
        .organizer-header {
            margin-bottom: 32px !important;
            text-align: center !important;
            background: white !important;
            padding: 32px !important;
            border-radius: 12px !important;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important;
            border: 1px solid #e2e8f0 !important;
        }
        
        .organizer-header h1 {
            font-size: 32px !important;
            font-weight: 700 !important;
            margin-bottom: 24px !important;
            color: #1e293b !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 16px !important;
        }
        
        .organizer-header h1 i {
            color: #3b82f6 !important;
            font-size: 28px !important;
        }
        
        .step-progress {
            display: flex !important;
            justify-content: center !important;
            gap: 8px !important;
            margin: 0 auto !important;
            max-width: 800px !important;
            background: #f1f5f9 !important;
            padding: 8px !important;
            border-radius: 12px !important;
        }
        
        .step {
            flex: 1 !important;
            padding: 16px 20px !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
            background: transparent !important;
            color: #64748b !important;
            border: 2px solid transparent !important;
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
            background: #3b82f6 !important;
            color: white !important;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important;
            transform: translateY(-2px) !important;
        }
        
        .step.completed {
            background: #10b981 !important;
            color: white !important;
            border-color: #10b981 !important;
        }
        
        .main-content {
            min-height: 600px !important;
            position: relative !important;
            margin-top: 32px !important;
        }
        
        .step-content {
            display: none !important;
            opacity: 0 !important;
            transform: translateX(20px) !important;
            transition: all 0.3s ease !important;
        }
        
        .step-content.active {
            display: block !important;
            opacity: 1 !important;
            transform: translateX(0) !important;
        }
        
        .card {
            background: white !important;
            border-radius: 12px !important;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important;
            border: 1px solid #e2e8f0 !important;
            overflow: hidden !important;
            transition: all 0.3s ease !important;
        }
        
        .card-header {
            padding: 32px !important;
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            color: white !important;
            text-align: center !important;
        }
        
        .card-header h2 {
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
            padding: 32px !important;
        }
        
        .form-section {
            margin-bottom: 32px !important;
            padding-bottom: 24px !important;
            border-bottom: 1px solid #e2e8f0 !important;
        }
        
        .form-section:last-child {
            border-bottom: none !important;
            margin-bottom: 0 !important;
        }
        
        .form-section h3 {
            font-size: 18px !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            margin-bottom: 16px !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }
        
        .form-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 24px !important;
        }
        
        .form-group {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
        }
        
        .form-group label {
            font-weight: 600 !important;
            color: #334155 !important;
            font-size: 14px !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }
        
        .form-group label i {
            color: #3b82f6 !important;
            width: 16px !important;
        }
        
        .form-group input {
            padding: 12px 16px !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            transition: all 0.15s ease !important;
            background: white !important;
        }
        
        .form-group input:focus {
            outline: none !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px #dbeafe !important;
            transform: translateY(-1px) !important;
        }
        
        .help-text {
            font-size: 12px !important;
            color: #64748b !important;
            font-style: italic !important;
        }
        
        .form-actions {
            text-align: center !important;
            margin-top: 32px !important;
            padding-top: 24px !important;
            border-top: 1px solid #e2e8f0 !important;
        }
        
        .btn-primary {
            padding: 12px 24px !important;
            border: none !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            font-size: 16px !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            text-decoration: none !important;
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            color: white !important;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important;
        }
        
        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
            filter: brightness(1.1) !important;
        }
        
        .btn-primary:disabled {
            background: #cbd5e1 !important;
            cursor: not-allowed !important;
            transform: none !important;
            box-shadow: none !important;
            filter: none !important;
        }
        
        @media (max-width: 768px) {
            .domain-organizer-app {
                padding: 16px !important;
            }
            
            .form-row {
                grid-template-columns: 1fr !important;
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
        }
    </style>

    <div class="organizer-header">
        <h1><i class="fas fa-folder-tree"></i> Organisation par domaine</h1>
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
                    <h2><i class="fas fa-cog"></i> Configuration du rangement</h2>
                    <p class="subtitle">Configurez les paramètres pour organiser vos emails par domaine</p>
                </div>
                
                <form id="organizeForm" class="config-form">
                    <div class="form-section">
                        <h3><i class="fas fa-calendar-alt"></i> Période d'analyse</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="startDate">
                                    <i class="fas fa-calendar-alt"></i>
                                    Date de début
                                </label>
                                <input type="date" id="startDate" name="startDate" required>
                                <span class="help-text">Emails à partir de cette date</span>
                            </div>
                            <div class="form-group">
                                <label for="endDate">
                                    <i class="fas fa-calendar-alt"></i>
                                    Date de fin
                                </label>
                                <input type="date" id="endDate" name="endDate" required>
                                <span class="help-text">Emails jusqu'à cette date</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3><i class="fas fa-filter"></i> Exclusions (optionnel)</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="excludeDomains">
                                    <i class="fas fa-ban"></i>
                                    Domaines à ignorer
                                </label>
                                <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com">
                                <span class="help-text">Ces domaines ne seront pas organisés</span>
                            </div>
                            <div class="form-group">
                                <label for="excludeEmails">
                                    <i class="fas fa-user-times"></i>
                                    Emails spécifiques à ignorer
                                </label>
                                <input type="text" id="excludeEmails" placeholder="boss@company.com">
                                <span class="help-text">Ces adresses ne seront pas déplacées</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-primary" id="analyzeBtn">
                            <i class="fas fa-search"></i>
                            <span>Analyser les emails</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Autres étapes cachées -->
        <div class="step-content" id="analyzeStep" style="display: none;">
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-search fa-spin"></i> Analyse en cours</h2>
                    <p class="subtitle">Nous analysons vos emails pour proposer une organisation</p>
                </div>
                <div style="padding: 32px; text-align: center;">
                    <p>L'analyse des emails est en cours...</p>
                    <div style="margin: 20px 0;">
                        <div style="background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div id="progressFill" style="background: #3b82f6; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                    <div id="progressMessage">Initialisation...</div>
                </div>
            </div>
        </div>

        <div class="step-content" id="reviewStep" style="display: none;">
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-check-square"></i> Validation</h2>
                    <p class="subtitle">Résultats de l'analyse</p>
                </div>
                <div style="padding: 32px;">
                    <p>Les résultats de l'analyse s'afficheront ici.</p>
                </div>
            </div>
        </div>

        <div class="step-content" id="executeStep" style="display: none;">
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-cogs fa-spin"></i> Exécution</h2>
                    <p class="subtitle">Organisation en cours</p>
                </div>
                <div style="padding: 32px;">
                    <p>L'organisation des emails est en cours...</p>
                </div>
            </div>
        </div>

        <div class="step-content" id="resultsStep" style="display: none;">
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <h2><i class="fas fa-check-circle"></i> Terminé</h2>
                    <p class="subtitle">Organisation terminée avec succès</p>
                </div>
                <div style="padding: 32px;">
                    <p>Votre boîte mail a été organisée avec succès !</p>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v6.4...');
        
        // Vérification de l'authentification
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }

        // Attendre que le DOM soit complètement chargé
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Forcer l'affichage du contenu
        this.forceDisplayContent();
        
        // Vérifier que les éléments sont présents
        if (!document.getElementById('organizeForm')) {
            console.error('[DomainOrganizer] Form not found, retrying...');
            await new Promise(resolve => setTimeout(resolve, 300));
            this.forceDisplayContent();
        }

        this.setupEventListeners();
        this.setDefaultDates();
        this.showStep('configure');
        this.isInitialized = true;
        
        console.log('[DomainOrganizer] ✅ Successfully initialized v6.4');
        return true;
    }

    forceDisplayContent() {
        console.log('[DomainOrganizer] Forcing content display...');
        
        // S'assurer que le main-content est visible
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
        }
        
        // S'assurer que l'étape active est visible
        const configStep = document.getElementById('configStep');
        if (configStep) {
            configStep.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
            configStep.classList.add('active');
        }
        
        // S'assurer que la card est visible
        const card = configStep?.querySelector('.card');
        if (card) {
            card.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
        }
        
        // S'assurer que le formulaire est visible
        const form = document.getElementById('organizeForm');
        if (form) {
            form.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
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
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progressFill) progressFill.style.width = `${progress}%`;
            
            if (progress === 30) {
                if (progressMessage) progressMessage.textContent = 'Récupération des emails...';
            } else if (progress === 60) {
                if (progressMessage) progressMessage.textContent = 'Analyse des domaines...';
            } else if (progress === 90) {
                if (progressMessage) progressMessage.textContent = 'Finalisation...';
            } else if (progress >= 100) {
                clearInterval(interval);
                if (progressMessage) progressMessage.textContent = 'Analyse terminée !';
                setTimeout(() => this.showStep('review'), 1000);
            }
        }, 500);
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

    showError(message) {
        console.error('[DomainOrganizer] Error:', message);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    // Méthodes simplifiées pour les autres fonctionnalités
    configure(options = {}) {
        console.log('[DomainOrganizer] Configured with options:', options);
    }

    async analyzeEmails(filters = {}) {
        console.log('[DomainOrganizer] Analyzing emails with filters:', filters);
        // Implémentation simplifiée pour les tests
        return {
            totalEmails: 150,
            totalDomains: 12,
            domainsToCreate: 8,
            domains: []
        };
    }

    async executeOrganization() {
        console.log('[DomainOrganizer] Executing organization...');
        this.showStep('execute');
        
        // Simulation d'exécution
        setTimeout(() => {
            this.showStep('results');
        }, 3000);
    }

    resetForm() {
        console.log('[DomainOrganizer] Resetting form');
        this.showStep('configure');
        const form = document.getElementById('organizeForm');
        if (form) form.reset();
        this.setDefaultDates();
    }
}

// === INITIALISATION SIMPLIFIÉE ===

// Créer l'instance globale
window.organizerInstance = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ v6.4 Instance created');

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v6.4...');
    
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

    // Injecter le HTML
    pageContent.innerHTML = window.organizerInstance.getPageHTML();
    
    // S'assurer que le contenu est visible avec force
    pageContent.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 1 !important;
        min-height: 100vh !important;
    `;

    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) {
        rangerButton.classList.add('active');
        if (rangerButton.parentElement) {
            rangerButton.parentElement.classList.add('active');
        }
    }

    // Initialiser avec un délai plus court et plusieurs tentatives
    let initAttempts = 0;
    const maxAttempts = 3;
    
    const tryInitialize = async () => {
        initAttempts++;
        console.log(`[DomainOrganizer] Initialization attempt ${initAttempts}/${maxAttempts}`);
        
        if (window.domainOrganizerActive && document.getElementById('configStep')) {
            try {
                const success = await window.organizerInstance.initializePage();
                if (success) {
                    console.log('[DomainOrganizer] ✅ Successfully initialized v6.4');
                    return;
                }
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
            }
        }
        
        if (initAttempts < maxAttempts) {
            setTimeout(tryInitialize, 200);
        } else {
            console.error('[DomainOrganizer] Failed to initialize after maximum attempts');
        }
    };

    setTimeout(tryInitialize, 100);
    console.log('[DomainOrganizer] ✅ Interface ready v6.4');
}

// === SYSTÈME D'INTERCEPTION ===

// Interception des clics
document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]') || 
                        e.target.closest('button[onclick*="ranger"]') || 
                        e.target.closest('a[href*="ranger"]');
    
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[DomainOrganizer] 🎯 Ranger click detected v6.4');
        setTimeout(showDomainOrganizerApp, 50);
        return false;
    }
}, true);

// Hook du PageManager si disponible
if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        console.log(`[DomainOrganizer] 🔍 PageManager.loadPage: ${pageName}`);
        
        if (pageName === 'ranger') {
            console.log('[DomainOrganizer] 🎯 PageManager interception v6.4');
            showDomainOrganizerApp();
            return;
        }

        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                console.log('[DomainOrganizer] 🔧 PageManager error intercepted v6.4');
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
    
    console.log('[DomainOrganizer] ✅ PageManager hook installed v6.4');
}

// Fonctions globales
window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = {
    showPage: showDomainOrganizerApp,
    instance: window.organizerInstance
};
window.testDomainOrganizer = showDomainOrganizerApp;

// Nettoyage au déchargement de la page
window.addEventListener('beforeunload', () => {
    window.domainOrganizerActive = false;
});

console.log('[DomainOrganizer] ✅ v6.4 System fully configured and ready');
