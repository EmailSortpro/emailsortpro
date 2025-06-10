// ModernDomainOrganizer.js - Version moderne et intuitive
// Interface étape par étape avec design minimaliste

class ModernDomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.currentStep = 'configuration';
        this.scanResults = null;
        this.selectedDomains = new Map();
        this.allFolders = new Map();
        this.emailsByDomain = new Map();
        this.totalEmailsScanned = 0;
        
        // Configuration par défaut
        this.config = {
            excludeDomains: ['gmail.com', 'outlook.com', 'hotmail.com'],
            excludeEmails: [],
            minEmailsPerDomain: 2,
            scanAllFolders: true
        };
        
        console.log('[ModernDomainOrganizer] ✅ Initialisé');
    }

    // ================================================
    // INTERFACE PRINCIPALE
    // ================================================

    getPageHTML() {
        return `
            <div class="modern-organizer">
                <!-- Header avec progression -->
                <div class="organizer-header">
                    <div class="progress-steps">
                        <div class="step active" data-step="configuration">
                            <div class="step-circle">1</div>
                            <span>Configuration</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="scanning">
                            <div class="step-circle">2</div>
                            <span>Analyse</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="review">
                            <div class="step-circle">3</div>
                            <span>Vérification</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="execution">
                            <div class="step-circle">4</div>
                            <span>Application</span>
                        </div>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="organizer-content">
                    <!-- Étape 1: Configuration -->
                    <div class="step-content" id="step-configuration">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>🎯 Configuration du rangement</h2>
                                <p>Personnalisez l'analyse selon vos besoins</p>
                            </div>

                            <div class="config-grid">
                                <div class="config-section">
                                    <h3>📧 Emails à analyser</h3>
                                    <div class="form-group">
                                        <label>Période d'analyse</label>
                                        <div class="date-range">
                                            <input type="date" id="startDate" placeholder="Date de début">
                                            <span>→</span>
                                            <input type="date" id="endDate" placeholder="Date de fin">
                                        </div>
                                        <div class="help-text">
                                            💡 Laissez vide pour analyser tous les emails
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>Nombre minimum d'emails par domaine</label>
                                        <input type="number" id="minEmails" value="2" min="1" max="50">
                                        <div class="help-text">
                                            🎯 Ignorer les domaines avec peu d'emails
                                        </div>
                                    </div>
                                </div>

                                <div class="config-section">
                                    <h3>🚫 Exclusions</h3>
                                    <div class="form-group">
                                        <label>Domaines à ignorer</label>
                                        <div class="tag-input" id="excludeDomainsContainer">
                                            <input type="text" id="excludeDomainInput" placeholder="Ajouter un domaine...">
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>Emails spécifiques à ignorer</label>
                                        <div class="tag-input" id="excludeEmailsContainer">
                                            <input type="text" id="excludeEmailInput" placeholder="email@exemple.com">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-primary" id="startScanBtn">
                                    <i class="fas fa-search"></i>
                                    Démarrer l'analyse
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 2: Scanning -->
                    <div class="step-content hidden" id="step-scanning">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>🔍 Analyse en cours</h2>
                                <p>Scan de votre boîte mail en cours...</p>
                            </div>

                            <div class="scan-progress">
                                <div class="progress-ring">
                                    <div class="progress-circle">
                                        <div class="progress-value" id="progressPercent">0%</div>
                                    </div>
                                </div>

                                <div class="scan-stats">
                                    <div class="stat">
                                        <span class="stat-number" id="scannedEmails">0</span>
                                        <span class="stat-label">Emails analysés</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-number" id="foundDomains">0</span>
                                        <span class="stat-label">Domaines trouvés</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-number" id="scannedFolders">0</span>
                                        <span class="stat-label">Dossiers scannés</span>
                                    </div>
                                </div>

                                <div class="scan-status" id="scanStatus">
                                    Initialisation...
                                </div>

                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="progressBar"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 3: Review -->
                    <div class="step-content hidden" id="step-review">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>📋 Vérification et personnalisation</h2>
                                <p>Vérifiez et modifiez les actions proposées</p>
                            </div>

                            <div class="review-summary" id="reviewSummary">
                                <!-- Rempli dynamiquement -->
                            </div>

                            <div class="domains-container" id="domainsContainer">
                                <!-- Rempli dynamiquement -->
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                    <i class="fas fa-arrow-left"></i>
                                    Retour
                                </button>
                                <button class="btn btn-primary" id="proceedBtn">
                                    <i class="fas fa-arrow-right"></i>
                                    Continuer
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 4: Execution -->
                    <div class="step-content hidden" id="step-execution">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>⚠️ Confirmation finale</h2>
                                <p>Dernière vérification avant application</p>
                            </div>

                            <div class="warning-box">
                                <div class="warning-icon">⚠️</div>
                                <div class="warning-content">
                                    <h3>Attention - Action irréversible</h3>
                                    <p>Vous êtes sur le point de déplacer <strong id="totalEmailsToMove">0</strong> emails vers <strong id="totalFoldersToCreate">0</strong> dossiers.</p>
                                    <div class="warning-actions" id="warningActions">
                                        <!-- Rempli dynamiquement -->
                                    </div>
                                </div>
                            </div>

                            <div class="confirmation-checklist">
                                <label class="checkbox-item">
                                    <input type="checkbox" id="confirmBackup">
                                    <span class="checkmark"></span>
                                    J'ai sauvegardé mes données importantes
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" id="confirmActions">
                                    <span class="checkmark"></span>
                                    J'ai vérifié les actions à effectuer
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" id="confirmUnderstand">
                                    <span class="checkmark"></span>
                                    Je comprends que cette action est irréversible
                                </label>
                            </div>

                            <div class="execution-progress hidden" id="executionProgress">
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="executionProgressBar"></div>
                                </div>
                                <div class="execution-status" id="executionStatus">
                                    Préparation...
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('review')">
                                    <i class="fas fa-arrow-left"></i>
                                    Retour
                                </button>
                                <button class="btn btn-danger" id="executeBtn" disabled>
                                    <i class="fas fa-play"></i>
                                    Appliquer le rangement
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Success -->
                    <div class="step-content hidden" id="step-success">
                        <div class="step-card success-card">
                            <div class="success-animation">
                                <div class="success-circle">
                                    <i class="fas fa-check"></i>
                                </div>
                            </div>
                            
                            <div class="success-content">
                                <h2>🎉 Rangement terminé !</h2>
                                <p>Vos emails ont été organisés avec succès</p>
                                
                                <div class="success-stats" id="successStats">
                                    <!-- Rempli dynamiquement -->
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-primary" onclick="window.modernDomainOrganizer.restart()">
                                    <i class="fas fa-redo"></i>
                                    Nouveau rangement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            ${this.getStyles()}
        `;
    }

    getStyles() {
        return `
            <style>
                .modern-organizer {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                }

                /* Header avec progression */
                .organizer-header {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }

                .progress-steps {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    min-width: 120px;
                    opacity: 0.5;
                    transition: all 0.3s ease;
                }

                .step.active {
                    opacity: 1;
                }

                .step.completed {
                    opacity: 1;
                }

                .step-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #6b7280;
                    transition: all 0.3s ease;
                }

                .step.active .step-circle {
                    background: #3b82f6;
                    color: white;
                }

                .step.completed .step-circle {
                    background: #10b981;
                    color: white;
                }

                .step-line {
                    flex: 1;
                    height: 2px;
                    background: #e5e7eb;
                    margin: 0 -10px;
                }

                .step span {
                    font-size: 14px;
                    font-weight: 500;
                    color: #6b7280;
                }

                .step.active span {
                    color: #1f2937;
                }

                /* Contenu des étapes */
                .step-content {
                    animation: fadeIn 0.3s ease-in-out;
                }

                .step-content.hidden {
                    display: none;
                }

                .step-card {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .card-header h2 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    color: #1f2937;
                }

                .card-header p {
                    font-size: 16px;
                    color: #6b7280;
                    margin: 0;
                }

                /* Configuration */
                .config-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                    margin-bottom: 32px;
                }

                .config-section h3 {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                    color: #1f2937;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 6px;
                }

                .form-group input[type="date"],
                .form-group input[type="number"],
                .form-group input[type="text"] {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .date-range {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .date-range span {
                    color: #6b7280;
                    font-weight: 500;
                }

                .help-text {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                /* Tag input */
                .tag-input {
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    padding: 8px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    min-height: 48px;
                    align-items: center;
                }

                .tag-input input {
                    border: none;
                    outline: none;
                    flex: 1;
                    min-width: 120px;
                    padding: 4px;
                }

                .tag {
                    background: #eff6ff;
                    color: #1d4ed8;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .tag-remove {
                    cursor: pointer;
                    opacity: 0.7;
                }

                .tag-remove:hover {
                    opacity: 1;
                }

                /* Scanning */
                .scan-progress {
                    text-align: center;
                    padding: 40px 0;
                }

                .progress-ring {
                    position: relative;
                    margin: 0 auto 32px;
                    width: 120px;
                    height: 120px;
                }

                .progress-circle {
                    width: 120px;
                    height: 120px;
                    border: 8px solid #e5e7eb;
                    border-top: 8px solid #3b82f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: spin 1s linear infinite;
                }

                .progress-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .scan-stats {
                    display: flex;
                    justify-content: center;
                    gap: 48px;
                    margin-bottom: 24px;
                }

                .stat {
                    text-align: center;
                }

                .stat-number {
                    display: block;
                    font-size: 24px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 14px;
                    color: #6b7280;
                }

                .scan-status {
                    font-size: 16px;
                    color: #6b7280;
                    margin-bottom: 24px;
                }

                .progress-bar-container {
                    width: 100%;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    width: 0%;
                    transition: width 0.3s ease;
                }

                /* Review */
                .review-summary {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .summary-item {
                    text-align: center;
                }

                .summary-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .summary-label {
                    font-size: 14px;
                    color: #6b7280;
                }

                .domains-container {
                    max-height: 500px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                }

                .domain-item {
                    padding: 16px;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: background-color 0.2s ease;
                }

                .domain-item:hover {
                    background: #f9fafb;
                }

                .domain-item:last-child {
                    border-bottom: none;
                }

                .domain-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-weight: 600;
                    color: #1f2937;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .domain-count {
                    font-size: 12px;
                    color: #6b7280;
                }

                .domain-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .folder-input {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    min-width: 150px;
                }

                .email-preview-btn {
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .email-preview-btn:hover {
                    background: #e5e7eb;
                }

                /* Email preview modal */
                .email-preview-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .email-preview-content {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    margin: 20px;
                }

                .email-item {
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .email-subject {
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .email-from {
                    font-size: 14px;
                    color: #6b7280;
                }

                /* Warning box */
                .warning-box {
                    background: #fef3cd;
                    border: 1px solid #fbbf24;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .warning-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .warning-content h3 {
                    margin: 0 0 8px 0;
                    color: #92400e;
                }

                .warning-content p {
                    margin: 0 0 12px 0;
                    color: #92400e;
                }

                .confirmation-checklist {
                    margin-bottom: 24px;
                }

                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 0;
                    cursor: pointer;
                }

                .checkbox-item input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }

                /* Buttons */
                .action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    margin-top: 32px;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #2563eb;
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                .btn-danger {
                    background: #dc2626;
                    color: white;
                }

                .btn-danger:hover:not(:disabled) {
                    background: #b91c1c;
                }

                /* Success */
                .success-card {
                    text-align: center;
                }

                .success-animation {
                    margin-bottom: 24px;
                }

                .success-circle {
                    width: 80px;
                    height: 80px;
                    background: #10b981;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                    animation: bounce 0.6s ease-in-out;
                }

                .success-circle i {
                    font-size: 32px;
                    color: white;
                }

                .success-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 20px;
                    margin: 24px 0;
                    padding: 20px;
                    background: #f0fdf4;
                    border-radius: 12px;
                }

                /* Animations */
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% { transform: scale(1); }
                    40%, 43% { transform: scale(1.1); }
                    70% { transform: scale(1.05); }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .modern-organizer {
                        padding: 16px;
                    }

                    .config-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }

                    .scan-stats {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .progress-steps {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .step-line {
                        display: none;
                    }

                    .action-bar {
                        flex-direction: column;
                    }
                }

                .hidden {
                    display: none !important;
                }
            </style>
        `;
    }

    // ================================================
    // GESTION DES ÉTAPES
    // ================================================

    async initializePage() {
        console.log('[ModernDomainOrganizer] Initialisation de la page...');
        
        if (!window.authService?.isAuthenticated()) {
            window.uiManager?.showToast('Veuillez vous connecter pour utiliser cette fonctionnalité', 'warning');
            return false;
        }

        this.setupEventListeners();
        this.setDefaultDates();
        this.initializeTagInputs();
        
        return true;
    }

    setupEventListeners() {
        // Configuration
        document.getElementById('startScanBtn')?.addEventListener('click', () => this.startScan());
        
        // Review
        document.getElementById('proceedBtn')?.addEventListener('click', () => this.goToStep('execution'));
        
        // Execution
        document.getElementById('executeBtn')?.addEventListener('click', () => this.executeOrganization());
        
        // Checkboxes de confirmation
        const checkboxes = ['confirmBackup', 'confirmActions', 'confirmUnderstand'];
        checkboxes.forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.updateExecuteButton());
        });
    }

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate) startDate.valueAsDate = thirtyDaysAgo;
        if (endDate) endDate.valueAsDate = today;
    }

    initializeTagInputs() {
        this.initializeTagInput('excludeDomainsContainer', 'excludeDomainInput', this.config.excludeDomains);
        this.initializeTagInput('excludeEmailsContainer', 'excludeEmailInput', this.config.excludeEmails);
    }

    initializeTagInput(containerId, inputId, initialTags) {
        const container = document.getElementById(containerId);
        const input = document.getElementById(inputId);
        
        if (!container || !input) return;

        // Ajouter les tags initiaux
        initialTags.forEach(tag => this.addTag(container, input, tag));

        // Event listeners
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = input.value.trim();
                if (value) {
                    this.addTag(container, input, value);
                    input.value = '';
                }
            }
        });

        input.addEventListener('blur', () => {
            const value = input.value.trim();
            if (value) {
                this.addTag(container, input, value);
                input.value = '';
            }
        });
    }

    addTag(container, input, value) {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${value}
            <span class="tag-remove" onclick="this.parentElement.remove()">×</span>
        `;
        container.insertBefore(tag, input);
    }

    goToStep(stepName) {
        // Cacher toutes les étapes
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Afficher l'étape demandée
        document.getElementById(`step-${stepName}`)?.classList.remove('hidden');

        // Mettre à jour la progression
        this.updateStepProgress(stepName);
        this.currentStep = stepName;
    }

    updateStepProgress(currentStep) {
        const steps = ['configuration', 'scanning', 'review', 'execution'];
        const currentIndex = steps.indexOf(currentStep);

        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index < currentIndex) {
                step.classList.add('completed');
            } else if (index === currentIndex) {
                step.classList.add('active');
            }
        });
    }

    // ================================================
    // SCAN DES EMAILS
    // ================================================

    async startScan() {
        try {
            this.isProcessing = true;
            this.goToStep('scanning');
            
            // Récupérer la configuration
            const config = this.getConfigurationFromForm();
            
            // Réinitialiser les données
            this.emailsByDomain.clear();
            this.selectedDomains.clear();
            this.totalEmailsScanned = 0;
            
            // Démarrer le scan
            await this.performFullScan(config);
            
            // Préparer les résultats
            this.prepareScanResults();
            
            // Passer à l'étape de review
            setTimeout(() => this.goToStep('review'), 1000);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur lors du scan:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            this.goToStep('configuration');
        } finally {
            this.isProcessing = false;
        }
    }

    getConfigurationFromForm() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const minEmails = parseInt(document.getElementById('minEmails').value) || 2;
        
        // Récupérer les tags d'exclusion
        const excludeDomains = Array.from(document.querySelectorAll('#excludeDomainsContainer .tag'))
            .map(tag => tag.textContent.replace('×', '').trim());
        
        const excludeEmails = Array.from(document.querySelectorAll('#excludeEmailsContainer .tag'))
            .map(tag => tag.textContent.replace('×', '').trim());

        return {
            startDate,
            endDate,
            minEmails,
            excludeDomains,
            excludeEmails
        };
    }

    async performFullScan(config) {
        // 1. Charger tous les dossiers
        await this.loadAllFolders();
        this.updateScanProgress(10, 'Dossiers chargés');

        // 2. Scanner tous les dossiers
        const allEmails = await this.scanAllFolders(config);
        this.updateScanProgress(60, 'Emails récupérés');

        // 3. Analyser les domaines
        await this.analyzeDomains(allEmails, config);
        this.updateScanProgress(90, 'Analyse des domaines');

        // 4. Finaliser
        this.updateScanProgress(100, 'Scan terminé');
    }

    async loadAllFolders() {
        try {
            const folders = await window.mailService.getFolders();
            this.allFolders.clear();
            
            folders.forEach(folder => {
                this.allFolders.set(folder.id, {
                    id: folder.id,
                    displayName: folder.displayName,
                    totalItemCount: folder.totalItemCount || 0,
                    parentFolderId: folder.parentFolderId
                });
            });

            console.log(`[ModernDomainOrganizer] ${this.allFolders.size} dossiers chargés`);
            this.updateScanStat('scannedFolders', this.allFolders.size);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur chargement dossiers:', error);
            throw error;
        }
    }

    async scanAllFolders(config) {
        const allEmails = [];
        const foldersToScan = ['inbox', 'sentitems', 'archive'];
        
        for (const folderName of foldersToScan) {
            try {
                const emails = await this.scanFolder(folderName, config);
                allEmails.push(...emails);
                
                console.log(`[ModernDomainOrganizer] ${emails.length} emails de ${folderName}`);
            } catch (error) {
                console.warn(`[ModernDomainOrganizer] Erreur scan ${folderName}:`, error);
            }
        }

        this.totalEmailsScanned = allEmails.length;
        this.updateScanStat('scannedEmails', this.totalEmailsScanned);
        
        return allEmails;
    }

    async scanFolder(folderName, config) {
        const emails = [];
        let skip = 0;
        const batchSize = 200;
        let hasMore = true;

        while (hasMore && emails.length < 10000) { // Limite de sécurité
            try {
                const options = {
                    top: batchSize,
                    skip: skip,
                    orderBy: 'receivedDateTime desc'
                };

                if (config.startDate) options.startDate = config.startDate;
                if (config.endDate) options.endDate = config.endDate;

                const batch = await window.mailService.getEmailsFromFolder(folderName, options);
                
                if (batch.length === 0) {
                    hasMore = false;
                } else {
                    emails.push(...batch);
                    skip += batchSize;
                    
                    // Mise à jour en temps réel
                    this.updateScanStat('scannedEmails', emails.length);
                    this.updateScanProgress(
                        20 + (skip / 1000) * 20, // 20-40% pour le scan
                        `Scan de ${folderName}: ${emails.length} emails`
                    );
                }
                
                // Pause pour éviter les rate limits
                if (batch.length === batchSize) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.warn(`[ModernDomainOrganizer] Erreur batch ${skip}:`, error);
                break;
            }
        }

        return emails;
    }

    async analyzeDomains(emails, config) {
        const domainCounts = new Map();
        
        for (const email of emails) {
            const domain = this.extractDomain(email);
            if (!domain) continue;
            
            // Vérifier les exclusions
            if (this.shouldExcludeDomain(domain, config.excludeDomains)) continue;
            if (this.shouldExcludeEmail(email, config.excludeEmails)) continue;
            
            // Compter les emails par domaine
            if (!domainCounts.has(domain)) {
                domainCounts.set(domain, {
                    count: 0,
                    emails: [],
                    samples: []
                });
            }
            
            const domainData = domainCounts.get(domain);
            domainData.count++;
            domainData.emails.push(email);
            
            // Garder quelques échantillons
            if (domainData.samples.length < 5) {
                domainData.samples.push({
                    subject: email.subject,
                    from: email.from?.emailAddress?.name || email.from?.emailAddress?.address,
                    receivedDateTime: email.receivedDateTime
                });
            }
        }

        // Filtrer par nombre minimum d'emails
        domainCounts.forEach((data, domain) => {
            if (data.count >= config.minEmails) {
                this.emailsByDomain.set(domain, data);
            }
        });

        this.updateScanStat('foundDomains', this.emailsByDomain.size);
    }

    updateScanProgress(percent, message) {
        const progressPercent = document.getElementById('progressPercent');
        const progressBar = document.getElementById('progressBar');
        const scanStatus = document.getElementById('scanStatus');

        if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (scanStatus) scanStatus.textContent = message;
    }

    updateScanStat(statId, value) {
        const element = document.getElementById(statId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }

    // ================================================
    // REVIEW ET PRÉPARATION
    // ================================================

    prepareScanResults() {
        const summary = document.getElementById('reviewSummary');
        const container = document.getElementById('domainsContainer');
        
        if (!summary || !container) return;

        // Résumé
        const totalEmails = Array.from(this.emailsByDomain.values())
            .reduce((sum, data) => sum + data.count, 0);
        
        const newFolders = Array.from(this.emailsByDomain.keys())
            .filter(domain => !this.findExistingFolder(domain)).length;

        summary.innerHTML = `
            <div class="summary-item">
                <div class="summary-value">${this.emailsByDomain.size}</div>
                <div class="summary-label">Domaines trouvés</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${totalEmails.toLocaleString()}</div>
                <div class="summary-label">Emails à organiser</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${newFolders}</div>
                <div class="summary-label">Nouveaux dossiers</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${this.emailsByDomain.size - newFolders}</div>
                <div class="summary-label">Dossiers existants</div>
            </div>
        `;

        // Liste des domaines
        container.innerHTML = '';
        const sortedDomains = Array.from(this.emailsByDomain.entries())
            .sort((a, b) => b[1].count - a[1].count);

        sortedDomains.forEach(([domain, data]) => {
            const domainElement = this.createDomainElement(domain, data);
            container.appendChild(domainElement);
        });
    }

    createDomainElement(domain, data) {
        const div = document.createElement('div');
        div.className = 'domain-item';
        
        const existingFolder = this.findExistingFolder(domain);
        const suggestedFolder = existingFolder?.displayName || domain;
        
        // Initialiser la sélection
        this.selectedDomains.set(domain, {
            selected: true,
            targetFolder: suggestedFolder,
            isNewFolder: !existingFolder,
            existingFolderId: existingFolder?.id
        });

        div.innerHTML = `
            <input type="checkbox" class="domain-checkbox" checked data-domain="${domain}">
            <div class="domain-info">
                <div class="domain-name" onclick="window.modernDomainOrganizer.showEmailPreview('${domain}')">
                    📧 ${domain}
                    <i class="fas fa-eye" title="Voir les emails"></i>
                </div>
                <div class="domain-count">${data.count} emails</div>
            </div>
            <div class="domain-actions">
                <input type="text" class="folder-input" value="${suggestedFolder}" 
                       data-domain="${domain}" placeholder="Nom du dossier">
                <button class="email-preview-btn" onclick="window.modernDomainOrganizer.showEmailPreview('${domain}')">
                    Voir emails (${data.count})
                </button>
            </div>
        `;

        // Event listeners
        const checkbox = div.querySelector('.domain-checkbox');
        checkbox.addEventListener('change', (e) => {
            const selection = this.selectedDomains.get(domain);
            if (selection) selection.selected = e.target.checked;
        });

        const folderInput = div.querySelector('.folder-input');
        folderInput.addEventListener('input', (e) => {
            const selection = this.selectedDomains.get(domain);
            if (selection) {
                selection.targetFolder = e.target.value;
                selection.isNewFolder = !this.findExistingFolderByName(e.target.value);
            }
        });

        return div;
    }

    showEmailPreview(domain) {
        const data = this.emailsByDomain.get(domain);
        if (!data) return;

        const modal = document.createElement('div');
        modal.className = 'email-preview-modal';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        const emails = data.emails.slice(0, 10); // Limiter à 10 emails
        const emailsHtml = emails.map(email => `
            <div class="email-item">
                <div class="email-subject">${email.subject || '(Pas de sujet)'}</div>
                <div class="email-from">De: ${email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu'}</div>
                <div class="email-from">Reçu: ${new Date(email.receivedDateTime).toLocaleDateString()}</div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="email-preview-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3>Emails de ${domain} (${data.count} total)</h3>
                    <button onclick="this.closest('.email-preview-modal').remove()" 
                            style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                </div>
                ${emailsHtml}
                ${data.emails.length > 10 ? `<p style="text-align: center; color: #6b7280; margin-top: 16px;">Et ${data.emails.length - 10} autres emails...</p>` : ''}
            </div>
        `;

        document.body.appendChild(modal);
    }

    // ================================================
    // EXÉCUTION
    // ================================================

    updateExecuteButton() {
        const checkboxes = ['confirmBackup', 'confirmActions', 'confirmUnderstand'];
        const allChecked = checkboxes.every(id => document.getElementById(id)?.checked);
        
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = !allChecked;
        }
    }

    async executeOrganization() {
        try {
            this.isProcessing = true;
            
            // Afficher la progression
            document.getElementById('executionProgress').classList.remove('hidden');
            
            // Préparer les actions
            const actions = this.prepareExecutionActions();
            
            // Exécuter
            const results = await this.performOrganization(actions);
            
            // Afficher le succès
            this.showSuccess(results);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur exécution:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    prepareExecutionActions() {
        const actions = [];
        
        this.selectedDomains.forEach((selection, domain) => {
            if (selection.selected) {
                const data = this.emailsByDomain.get(domain);
                if (data && data.emails.length > 0) {
                    actions.push({
                        domain,
                        emails: data.emails,
                        targetFolder: selection.targetFolder,
                        isNewFolder: selection.isNewFolder,
                        existingFolderId: selection.existingFolderId
                    });
                }
            }
        });

        return actions;
    }

    async performOrganization(actions) {
        const results = {
            success: 0,
            failed: 0,
            emailsMoved: 0,
            foldersCreated: 0,
            errors: []
        };

        const total = actions.length;
        
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            
            try {
                this.updateExecutionProgress(
                    (i / total) * 100,
                    `Traitement de ${action.domain}...`
                );

                // Créer le dossier si nécessaire
                let targetFolderId = action.existingFolderId;
                
                if (action.isNewFolder) {
                    const newFolder = await this.createFolder(action.targetFolder);
                    targetFolderId = newFolder.id;
                    results.foldersCreated++;
                }

                // Déplacer les emails par lots
                const batchSize = 20;
                for (let j = 0; j < action.emails.length; j += batchSize) {
                    const batch = action.emails.slice(j, j + batchSize);
                    await this.moveEmailBatch(batch, targetFolderId);
                    results.emailsMoved += batch.length;
                    
                    // Pause entre les lots
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                results.success++;
                
            } catch (error) {
                console.error(`[ModernDomainOrganizer] Erreur ${action.domain}:`, error);
                results.failed++;
                results.errors.push({ domain: action.domain, error: error.message });
            }
        }

        this.updateExecutionProgress(100, 'Rangement terminé !');
        return results;
    }

    updateExecutionProgress(percent, message) {
        const progressBar = document.getElementById('executionProgressBar');
        const status = document.getElementById('executionStatus');

        if (progressBar) progressBar.style.width = `${percent}%`;
        if (status) status.textContent = message;
    }

    async createFolder(folderName) {
        const accessToken = await window.authService.getAccessToken();
        
        const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ displayName: folderName })
        });
        
        if (!response.ok) {
            throw new Error(`Impossible de créer le dossier: ${response.statusText}`);
        }
        
        return await response.json();
    }

    async moveEmailBatch(emails, targetFolderId) {
        const accessToken = await window.authService.getAccessToken();
        
        const batchRequests = emails.map((email, index) => ({
            id: index.toString(),
            method: 'POST',
            url: `/me/messages/${email.id}/move`,
            body: { destinationId: targetFolderId },
            headers: { 'Content-Type': 'application/json' }
        }));
        
        const response = await fetch('https://graph.microsoft.com/v1.0/$batch', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests: batchRequests })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur déplacement: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Vérifier les erreurs dans la réponse batch
        const failures = result.responses?.filter(r => r.status >= 400) || [];
        if (failures.length > 0) {
            console.warn('[ModernDomainOrganizer] Échecs partiels:', failures);
        }
        
        return result;
    }

    showSuccess(results) {
        const stats = document.getElementById('successStats');
        if (stats) {
            stats.innerHTML = `
                <div class="summary-item">
                    <div class="summary-value">${results.emailsMoved.toLocaleString()}</div>
                    <div class="summary-label">Emails déplacés</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${results.foldersCreated}</div>
                    <div class="summary-label">Dossiers créés</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${results.success}</div>
                    <div class="summary-label">Domaines traités</div>
                </div>
                ${results.failed > 0 ? `
                <div class="summary-item">
                    <div class="summary-value" style="color: #dc2626;">${results.failed}</div>
                    <div class="summary-label">Échecs</div>
                </div>
                ` : ''}
            `;
        }

        this.goToStep('success');
    }

    restart() {
        this.currentStep = 'configuration';
        this.scanResults = null;
        this.selectedDomains.clear();
        this.emailsByDomain.clear();
        this.totalEmailsScanned = 0;
        
        this.goToStep('configuration');
        this.setDefaultDates();
    }

    // ================================================
    // UTILITAIRES
    // ================================================

    extractDomain(email) {
        try {
            const address = email.from?.emailAddress?.address;
            if (!address) return null;
            return address.toLowerCase().split('@')[1] || null;
        } catch (error) {
            return null;
        }
    }

    shouldExcludeDomain(domain, excludedDomains) {
        return excludedDomains.some(excluded => 
            domain.toLowerCase().includes(excluded.toLowerCase())
        );
    }

    shouldExcludeEmail(email, excludedEmails) {
        const address = email.from?.emailAddress?.address?.toLowerCase();
        if (!address) return false;
        
        return excludedEmails.some(excluded => 
            address.includes(excluded.toLowerCase())
        );
    }

    findExistingFolder(domain) {
        // Recherche exacte
        for (const folder of this.allFolders.values()) {
            if (folder.displayName.toLowerCase() === domain.toLowerCase()) {
                return folder;
            }
        }
        
        // Recherche partielle
        const domainParts = domain.split('.');
        if (domainParts.length > 1) {
            const mainDomain = domainParts[0];
            for (const folder of this.allFolders.values()) {
                if (folder.displayName.toLowerCase() === mainDomain.toLowerCase()) {
                    return folder;
                }
            }
        }
        
        return null;
    }

    findExistingFolderByName(name) {
        for (const folder of this.allFolders.values()) {
            if (folder.displayName.toLowerCase() === name.toLowerCase()) {
                return folder;
            }
        }
        return null;
    }

    // ================================================
    // INTERFACE PUBLIQUE
    // ================================================

    showPage() {
        console.log('[ModernDomainOrganizer] Affichage de la page...');
        
        if (!window.authService?.isAuthenticated()) {
            window.uiManager?.showToast('Veuillez vous connecter', 'warning');
            return;
        }
        
        // Masquer la page de login
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
        
        // Afficher le contenu
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.innerHTML = this.getPageHTML();
        }
        
        // Initialiser
        this.initializePage();
        
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const rangerButton = document.querySelector('[data-page="ranger"]');
        if (rangerButton) rangerButton.classList.add('active');
        
        console.log('[ModernDomainOrganizer] ✅ Page affichée');
    }
}

// Initialisation
window.modernDomainOrganizer = new ModernDomainOrganizer();

// Gestion autonome
document.addEventListener('DOMContentLoaded', function() {
    console.log('[ModernDomainOrganizer] Initialisation autonome...');
    
    // Intercepter les clics sur le bouton Ranger
    document.addEventListener('click', function(e) {
        const rangerButton = e.target.closest('[data-page="ranger"]');
        if (!rangerButton) return;
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[ModernDomainOrganizer] Clic sur Ranger intercepté');
        window.modernDomainOrganizer.showPage();
        
        return false;
    }, true);
});

// Fonction globale d'accès
window.showModernDomainOrganizer = function() {
    window.modernDomainOrganizer.showPage();
};

console.log('[ModernDomainOrganizer] ✅ Module moderne chargé');
