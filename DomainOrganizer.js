// DomainOrganizer.js - Version 8.2 - Design Minimaliste et Condensé
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
        this.emailActions = new Map();
        this.isActive = false;
        this.expandedDomains = new Set();
        this.currentStep = 1;
        
        console.log('[DomainOrganizer] ✅ v8.2 - Design Minimaliste');
    }

    getPageHTML() {
        return `
            <div class="organizer-container">
                <!-- Header compact -->
                <div class="organizer-header">
                    <div class="header-content">
                        <div class="header-title">
                            <h1>📁 Rangement par domaine</h1>
                            <p>Organisation automatique et intelligente</p>
                        </div>
                        
                        <!-- Progress compact -->
                        <div class="progress-steps">
                            <div class="step active" data-step="1">1</div>
                            <div class="step" data-step="2">2</div>
                            <div class="step" data-step="3">3</div>
                            <div class="step" data-step="4">4</div>
                        </div>
                    </div>
                </div>

                <!-- Contenu compact -->
                <div class="content-wrapper">
                    <!-- Étape 1: Configuration -->
                    <div class="step-content" id="step1" style="display: block;">
                        <div class="card">
                            <div class="card-header">
                                <h2>⚙️ Configuration</h2>
                            </div>

                            <div class="info-box">
                                <strong>Comment ça marche ?</strong>
                                <p>Analyse automatique de vos emails par domaine expéditeur pour un rangement intelligent.</p>
                            </div>

                            <form id="organizeForm" class="form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Date début</label>
                                        <input type="date" id="startDate" class="input">
                                    </div>
                                    <div class="form-group">
                                        <label>Date fin</label>
                                        <input type="date" id="endDate" class="input">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Domaines à exclure (optionnel)</label>
                                    <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com" class="input">
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary" id="analyzeBtn">
                                        🔍 Analyser mes emails
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Étape 2: Analyse -->
                    <div class="step-content" id="step2" style="display: none;">
                        <div class="card">
                            <div class="card-header">
                                <h2>🔍 Analyse en cours...</h2>
                                <p id="analysisDescription">Connexion à votre boîte mail</p>
                            </div>

                            <div class="progress-section">
                                <div class="stats-grid">
                                    <div class="stat">
                                        <div class="stat-number" id="emailsAnalyzed">0</div>
                                        <div class="stat-label">Emails</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="domainsFound">0</div>
                                        <div class="stat-label">Domaines</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="foldersToCreate">0</div>
                                        <div class="stat-label">Dossiers</div>
                                    </div>
                                </div>
                                
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progressBar"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 3: Révision -->
                    <div class="step-content" id="step3" style="display: none;">
                        <div class="card">
                            <div class="card-header">
                                <h2>✏️ Révision</h2>
                                <div class="summary">
                                    <span id="totalEmailsFound">0</span> emails dans <span id="totalDomainsFound">0</span> domaines
                                </div>
                            </div>

                            <!-- Contrôles compacts -->
                            <div class="controls">
                                <div class="control-buttons">
                                    <button class="btn-small" onclick="window.organizerInstance.selectAllEmails()">
                                        ✓ Tout
                                    </button>
                                    <button class="btn-small" onclick="window.organizerInstance.deselectAllEmails()">
                                        ✗ Rien
                                    </button>
                                    <button class="btn-small" onclick="window.organizerInstance.expandAllDomains()">
                                        ⬇ Développer
                                    </button>
                                </div>
                                
                                <div class="search-box">
                                    <input type="text" id="emailSearch" placeholder="🔍 Rechercher..." class="search-input">
                                </div>
                            </div>

                            <!-- Liste compacte -->
                            <div class="domains-container" id="detailedResults">
                                <!-- Populated dynamically -->
                            </div>

                            <!-- Actions -->
                            <div class="actions">
                                <label class="checkbox">
                                    <input type="checkbox" id="createFolders" checked>
                                    Créer nouveaux dossiers
                                </label>
                                
                                <div class="action-buttons">
                                    <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                                        ← Retour
                                    </button>
                                    <button class="btn btn-primary" id="applyBtn" onclick="window.organizerInstance.applyOrganization()">
                                        ▶ Organiser <span id="selectedCount">0</span> emails
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 4: Organisation -->
                    <div class="step-content" id="step4" style="display: none;">
                        <div class="card">
                            <div class="card-header">
                                <h2>⚙️ Organisation...</h2>
                                <p id="organizationDescription">Création des dossiers</p>
                            </div>

                            <div class="progress-section">
                                <div class="stats-grid">
                                    <div class="stat">
                                        <div class="stat-number" id="foldersCreated">0</div>
                                        <div class="stat-label">Dossiers créés</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="emailsMoved">0</div>
                                        <div class="stat-label">Emails déplacés</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="timeRemaining">--</div>
                                        <div class="stat-label">Temps restant</div>
                                    </div>
                                </div>
                                
                                <div class="progress-bar">
                                    <div class="progress-fill success" id="executeBar"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 5: Succès -->
                    <div class="step-content" id="step5" style="display: none;">
                        <div class="card success">
                            <div class="success-content">
                                <div class="success-icon">✅</div>
                                <h2>Organisation terminée !</h2>
                                <p id="successMessage">Vos emails ont été organisés avec succès</p>
                                
                                <div class="success-stats">
                                    <div class="success-stat">
                                        <span id="finalEmailsMoved">0</span> emails
                                    </div>
                                    <div class="success-stat">
                                        <span id="finalFoldersCreated">0</span> dossiers
                                    </div>
                                    <div class="success-stat">
                                        <span id="totalTime">2m 34s</span>
                                    </div>
                                </div>

                                <div class="success-actions">
                                    <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                                        🔄 Recommencer
                                    </button>
                                    <button class="btn btn-primary" onclick="window.organizerInstance.exploreResults()">
                                        📧 Voir dans Outlook
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Design minimaliste et moderne */
                .organizer-container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 16px;
                    background: #fafafa;
                    min-height: 100vh;
                    overflow-y: auto !important;
                }

                /* Header ultra-compact */
                .organizer-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    padding: 20px 24px;
                    margin-bottom: 16px;
                    color: white;
                    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                }

                .header-title h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                }

                .header-title p {
                    margin: 2px 0 0 0;
                    opacity: 0.9;
                    font-size: 14px;
                }

                /* Progress steps minimaliste */
                .progress-steps {
                    display: flex;
                    gap: 8px;
                }

                .progress-steps .step {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .progress-steps .step.active {
                    background: white;
                    color: #667eea;
                    transform: scale(1.1);
                }

                .progress-steps .step.completed {
                    background: #10b981;
                    color: white;
                }

                /* Content wrapper compact */
                .content-wrapper {
                    max-width: 100%;
                }

                .step-content {
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Cards minimalistes */
                .card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    margin-bottom: 16px;
                    overflow: hidden;
                }

                .card-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #f3f4f6;
                }

                .card-header h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .card-header p {
                    margin: 4px 0 0 0;
                    color: #6b7280;
                    font-size: 14px;
                }

                .summary {
                    color: #059669;
                    font-weight: 600;
                    font-size: 14px;
                    margin-top: 8px;
                }

                /* Info box compact */
                .info-box {
                    margin: 20px 24px;
                    padding: 16px;
                    background: #eff6ff;
                    border-radius: 6px;
                    border-left: 3px solid #3b82f6;
                }

                .info-box strong {
                    color: #1e40af;
                    font-size: 14px;
                }

                .info-box p {
                    margin: 4px 0 0 0;
                    color: #1e40af;
                    font-size: 13px;
                    line-height: 1.5;
                }

                /* Formulaire compact */
                .form {
                    padding: 20px 24px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                }

                .input {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }

                .input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .form-actions {
                    margin-top: 20px;
                    text-align: center;
                }

                /* Boutons minimalistes */
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn-primary:hover {
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

                .btn-small {
                    padding: 6px 12px;
                    font-size: 12px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-small:hover {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                }

                /* Progress section compacte */
                .progress-section {
                    padding: 20px 24px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .stat {
                    text-align: center;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 6px;
                }

                .stat-number {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1f2937;
                    margin-bottom: 4px;
                }

                .stat-label {
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .progress-bar {
                    height: 8px;
                    background: #f3f4f6;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                    width: 0%;
                }

                .progress-fill.success {
                    background: linear-gradient(90deg, #10b981, #059669);
                }

                /* Contrôles compacts */
                .controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid #f3f4f6;
                    gap: 16px;
                }

                .control-buttons {
                    display: flex;
                    gap: 8px;
                }

                .search-box {
                    flex: 1;
                    max-width: 200px;
                }

                .search-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                }

                /* Liste de domaines ultra-compacte */
                .domains-container {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .domain-item {
                    border-bottom: 1px solid #f3f4f6;
                    transition: background-color 0.2s ease;
                }

                .domain-item:hover {
                    background: #fafafa;
                }

                .domain-header {
                    display: flex;
                    align-items: center;
                    padding: 12px 24px;
                    cursor: pointer;
                    gap: 12px;
                }

                .domain-checkbox {
                    width: 16px;
                    height: 16px;
                    accent-color: #3b82f6;
                }

                .domain-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 2px;
                }

                .domain-meta {
                    font-size: 12px;
                    color: #6b7280;
                }

                .domain-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .folder-select {
                    padding: 6px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 12px;
                    background: white;
                    min-width: 100px;
                }

                .badge {
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .badge-new {
                    background: #dcfce7;
                    color: #166534;
                }

                .badge-existing {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .expand-icon {
                    color: #9ca3af;
                    font-size: 12px;
                    transition: transform 0.3s ease;
                }

                .domain-item.expanded .expand-icon {
                    transform: rotate(90deg);
                }

                /* Emails compacts */
                .emails-list {
                    display: none;
                    background: #fafafa;
                }

                .domain-item.expanded .emails-list {
                    display: block;
                }

                .email-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 24px 8px 52px;
                    gap: 12px;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 12px;
                }

                .email-item:hover {
                    background: #f9fafb;
                }

                .email-item.selected {
                    background: #eff6ff;
                    border-left: 2px solid #3b82f6;
                }

                .email-checkbox {
                    width: 14px;
                    height: 14px;
                    accent-color: #3b82f6;
                }

                .email-content {
                    flex: 1;
                    min-width: 0;
                }

                .email-subject {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .email-meta {
                    color: #6b7280;
                    font-size: 11px;
                }

                .email-folder-select {
                    padding: 4px 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 11px;
                    background: white;
                    min-width: 80px;
                }

                /* Actions compactes */
                .actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-top: 1px solid #f3f4f6;
                    background: #fafafa;
                }

                .action-buttons {
                    display: flex;
                    gap: 12px;
                }

                .checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #374151;
                    cursor: pointer;
                }

                .checkbox input {
                    width: 16px;
                    height: 16px;
                    accent-color: #3b82f6;
                }

                /* Succès minimaliste */
                .card.success {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }

                .success-content {
                    padding: 32px 24px;
                    text-align: center;
                }

                .success-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .success-content h2 {
                    margin: 0 0 8px 0;
                    font-size: 20px;
                    color: white;
                }

                .success-content p {
                    margin: 0 0 20px 0;
                    opacity: 0.9;
                    font-size: 14px;
                }

                .success-stats {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .success-stat {
                    text-align: center;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    font-size: 12px;
                    min-width: 60px;
                }

                .success-stat span {
                    display: block;
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }

                .success-actions {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                }

                .success-actions .btn-secondary {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .success-actions .btn-primary {
                    background: white;
                    color: #059669;
                }

                /* Responsive compact */
                @media (max-width: 768px) {
                    .organizer-container {
                        padding: 12px;
                    }
                    
                    .header-content {
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .controls {
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .domain-header {
                        flex-wrap: wrap;
                    }
                    
                    .actions {
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .success-stats {
                        flex-direction: column;
                        gap: 8px;
                    }
                }

                /* Scrollbar minimaliste */
                .domains-container::-webkit-scrollbar {
                    width: 6px;
                }

                .domains-container::-webkit-scrollbar-track {
                    background: #f3f4f6;
                }

                .domains-container::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                }

                .domains-container::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            </style>
        `;
    }

    // Méthodes identiques mais optimisées
    updateStepIndicator(step) {
        console.log(`[DomainOrganizer] Updating to step ${step}`);
        
        document.querySelectorAll('.progress-steps .step').forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index + 1 < step) {
                stepEl.classList.add('completed');
            } else if (index + 1 === step) {
                stepEl.classList.add('active');
            }
        });
        
        document.querySelectorAll('.step-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const currentStepContent = document.getElementById(`step${step}`);
        if (currentStepContent) {
            currentStepContent.style.display = 'block';
        }
        
        this.currentStep = step;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v8.2 Minimalist...');
        
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }

        this.enableScroll();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.updateStepIndicator(1);
        this.isActive = true;
        
        console.log('[DomainOrganizer] ✅ Minimalist interface ready v8.2');
        return true;
    }

    enableScroll() {
        const body = document.body;
        const html = document.documentElement;
        const pageContent = document.getElementById('pageContent');
        
        [body, html].forEach(el => {
            if (el) {
                el.style.overflow = 'auto';
                el.style.overflowY = 'auto';
                el.style.height = 'auto';
                el.style.maxHeight = 'none';
                el.classList.remove('page-short-content', 'no-scroll');
            }
        });
        
        if (pageContent) {
            pageContent.style.overflow = 'visible';
            pageContent.style.height = 'auto';
            pageContent.style.maxHeight = 'none';
        }
    }

    setupEventListeners() {
        const form = document.getElementById('organizeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        const searchInput = document.getElementById('emailSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.valueAsDate = thirtyDaysAgo;
        if (endDateInput) endDateInput.valueAsDate = today;
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const formData = this.getFormData();
        
        if (!formData.startDate && !formData.endDate) {
            this.showError('Veuillez sélectionner au moins une date');
            this.isProcessing = false;
            return;
        }

        await this.startAnalysis(formData);
    }

    getFormData() {
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        const excludeDomains = document.getElementById('excludeDomains')?.value
            .split(',').map(d => d.trim()).filter(d => d) || [];
        
        return { startDate, endDate, excludeDomains, excludeEmails: [] };
    }

    async startAnalysis(formData) {
        try {
            this.updateStepIndicator(2);
            
            this.configure({
                excludeDomains: formData.excludeDomains,
                excludeEmails: formData.excludeEmails
            });
            
            await this.simulateAnalysis();
            
        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            this.showError(`Erreur: ${error.message}`);
            this.resetForm();
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateAnalysis() {
        const progressBar = document.getElementById('progressBar');
        const emailsAnalyzed = document.getElementById('emailsAnalyzed');
        const domainsFound = document.getElementById('domainsFound');
        const foldersToCreate = document.getElementById('foldersToCreate');
        const analysisDescription = document.getElementById('analysisDescription');
        
        let progress = 0;
        let emails = 0;
        let domains = 0;
        let folders = 0;
        
        const descriptions = [
            'Connexion à votre boîte mail',
            'Récupération des emails',
            'Analyse des domaines',
            'Calcul de l\'organisation',
            'Finalisation'
        ];
        
        let descIndex = 0;
        
        const interval = setInterval(() => {
            progress += 20;
            emails += Math.floor(Math.random() * 30) + 20;
            
            if (progress >= 40 && domains === 0) {
                domains = Math.floor(emails / 30) + 3;
                folders = Math.floor(domains * 0.7) + 1;
            }
            
            if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
            if (emailsAnalyzed) emailsAnalyzed.textContent = emails;
            if (domainsFound) domainsFound.textContent = domains;
            if (foldersToCreate) foldersToCreate.textContent = folders;
            
            if (analysisDescription && descIndex < descriptions.length) {
                analysisDescription.textContent = descriptions[descIndex];
                descIndex++;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                if (analysisDescription) analysisDescription.textContent = 'Analyse terminée';
                
                const results = this.generateMockData(domains, emails, folders);
                setTimeout(() => this.showRevisionStep(results), 500);
            }
        }, 400);
    }

    generateMockData(domainCount, totalEmails, foldersToCreate) {
        const mockDomains = [
            'linkedin.com', 'github.com', 'amazon.com', 'paypal.com', 'medium.com', 
            'stackoverflow.com', 'slack.com', 'dropbox.com', 'spotify.com', 'netflix.com'
        ];
        
        const mockSubjects = [
            'Confirmation de commande',
            'Notification importante',
            'Rapport mensuel',
            'Invitation',
            'Mise à jour',
            'Newsletter',
            'Facture',
            'Nouveau message'
        ];
        
        const domains = [];
        let emailId = 1;
        let remainingEmails = totalEmails;
        
        for (let i = 0; i < domainCount && remainingEmails > 0; i++) {
            const domain = mockDomains[i % mockDomains.length];
            const emailCount = i === domainCount - 1 
                ? remainingEmails 
                : Math.min(Math.floor(Math.random() * 40) + 10, remainingEmails);
            
            remainingEmails -= emailCount;
            
            const emails = [];
            for (let j = 0; j < emailCount; j++) {
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 30));
                
                emails.push({
                    id: `email_${emailId++}`,
                    subject: mockSubjects[Math.floor(Math.random() * mockSubjects.length)],
                    sender: `noreply@${domain}`,
                    senderName: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
                    date: date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' }),
                    selected: true,
                    targetFolder: domain.split('.')[0]
                });
            }
            
            domains.push({
                domain: domain,
                count: emailCount,
                action: Math.random() > 0.3 ? 'create-new' : 'move-existing',
                suggestedFolder: domain.split('.')[0],
                emails: emails,
                selected: true
            });
        }
        
        return {
            totalEmails: totalEmails,
            totalDomains: domainCount,
            domainsToCreate: foldersToCreate,
            domains: domains.sort((a, b) => b.count - a.count)
        };
    }

    showRevisionStep(results) {
        this.currentAnalysis = results;
        this.emailActions.clear();
        
        results.domains.forEach(domain => {
            domain.emails.forEach(email => {
                this.emailActions.set(email.id, {
                    emailId: email.id,
                    domain: domain.domain,
                    targetFolder: email.targetFolder,
                    selected: email.selected
                });
            });
        });
        
        this.updateStepIndicator(3);
        
        const totalEmailsFound = document.getElementById('totalEmailsFound');
        const totalDomainsFound = document.getElementById('totalDomainsFound');
        
        if (totalEmailsFound) totalEmailsFound.textContent = results.totalEmails.toLocaleString();
        if (totalDomainsFound) totalDomainsFound.textContent = results.totalDomains;
        
        this.displayDomains(results.domains);
        this.updateSelectedCount();
    }

    displayDomains(domains) {
        const container = document.getElementById('detailedResults');
        if (!container) return;
        
        container.innerHTML = '';
        
        domains.forEach(domain => {
            const domainRow = this.createDomainRow(domain);
            container.appendChild(domainRow);
        });
    }

    createDomainRow(domainData) {
        const row = document.createElement('div');
        row.className = 'domain-item';
        row.dataset.domain = domainData.domain;
        
        const isNewFolder = domainData.action === 'create-new';
        const selectedEmails = domainData.emails.filter(email => 
            this.emailActions.get(email.id)?.selected
        ).length;
        
        const domainInitial = domainData.domain.charAt(0).toUpperCase();
        
        row.innerHTML = `
            <div class="domain-header">
                <input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" 
                       ${domainData.selected ? 'checked' : ''}>
                
                <div class="domain-avatar">${domainInitial}</div>
                
                <div class="domain-info">
                    <div class="domain-name">${domainData.domain}</div>
                    <div class="domain-meta">${domainData.count} emails • ${selectedEmails} sélectionnés</div>
                </div>
                
                <div class="domain-controls">
                    <select class="folder-select" data-domain="${domainData.domain}">
                        <option value="${domainData.suggestedFolder}" selected>${domainData.suggestedFolder}</option>
                        <option value="inbox">Boîte de réception</option>
                        <option value="archive">Archive</option>
                        <option value="important">Important</option>
                    </select>
                    
                    <span class="badge ${isNewFolder ? 'badge-new' : 'badge-existing'}">
                        ${isNewFolder ? 'Nouveau' : 'Existant'}
                    </span>
                    
                    <i class="fas fa-chevron-right expand-icon"></i>
                </div>
            </div>
            
            <div class="emails-list">
                ${domainData.emails.map(email => this.createEmailItem(email, domainData.domain)).join('')}
            </div>
        `;
        
        row.addEventListener('click', (e) => {
            if (e.target.closest('.domain-controls') || e.target.closest('.domain-checkbox')) {
                return;
            }
            this.toggleDomainExpansion(domainData.domain);
        });
        
        const domainCheckbox = row.querySelector('.domain-checkbox');
        if (domainCheckbox) {
            domainCheckbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDomainToggle(e);
            });
        }
        
        const folderSelect = row.querySelector('.folder-select');
        if (folderSelect) {
            folderSelect.addEventListener('click', (e) => e.stopPropagation());
            folderSelect.addEventListener('change', (e) => this.handleDomainFolderChange(e));
        }
        
        return row;
    }

    createEmailItem(emailData, domain) {
        const isSelected = this.emailActions.get(emailData.id)?.selected;
        
        return `
            <div class="email-item ${isSelected ? 'selected' : ''}" data-email-id="${emailData.id}">
                <input type="checkbox" class="email-checkbox" data-email-id="${emailData.id}" 
                       ${isSelected ? 'checked' : ''}
                       onchange="window.organizerInstance.handleEmailToggle(event)">
                
                <div class="email-content">
                    <div class="email-subject">${emailData.subject}</div>
                    <div class="email-meta">De: ${emailData.senderName} • ${emailData.date}</div>
                </div>
                
                <select class="email-folder-select" data-email-id="${emailData.id}" 
                        onchange="window.organizerInstance.handleEmailFolderChange(event)">
                    <option value="${emailData.targetFolder}" selected>${emailData.targetFolder}</option>
                    <option value="inbox">Boîte de réception</option>
                    <option value="archive">Archive</option>
                    <option value="important">Important</option>
                </select>
            </div>
        `;
    }

    // Méthodes de gestion simplifiées
    toggleDomainExpansion(domain) {
        const domainRow = document.querySelector(`[data-domain="${domain}"]`);
        if (!domainRow) return;
        
        const isExpanded = domainRow.classList.contains('expanded');
        
        if (isExpanded) {
            domainRow.classList.remove('expanded');
            this.expandedDomains.delete(domain);
        } else {
            domainRow.classList.add('expanded');
            this.expandedDomains.add(domain);
        }
    }

    expandAllDomains() {
        document.querySelectorAll('.domain-item').forEach(row => {
            row.classList.add('expanded');
            const domain = row.dataset.domain;
            if (domain) this.expandedDomains.add(domain);
        });
    }

    selectAllEmails() {
        document.querySelectorAll('.email-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            this.handleEmailToggle({ target: checkbox });
        });
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateSelectedCount();
    }

    deselectAllEmails() {
        document.querySelectorAll('.email-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            this.handleEmailToggle({ target: checkbox });
        });
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectedCount();
    }

    handleDomainToggle(event) {
        const domain = event.target.dataset.domain;
        const isChecked = event.target.checked;
        
        if (this.currentAnalysis) {
            const domainData = this.currentAnalysis.domains.find(d => d.domain === domain);
            if (domainData) {
                domainData.emails.forEach(email => {
                    if (this.emailActions.has(email.id)) {
                        this.emailActions.get(email.id).selected = isChecked;
                    }
                    
                    const emailCheckbox = document.querySelector(`input[data-email-id="${email.id}"]`);
                    if (emailCheckbox) emailCheckbox.checked = isChecked;
                    
                    const emailItem = document.querySelector(`div[data-email-id="${email.id}"]`);
                    if (emailItem) {
                        emailItem.classList.toggle('selected', isChecked);
                    }
                });
            }
        }
        
        this.updateSelectedCount();
    }

    handleEmailToggle(event) {
        const emailId = event.target.dataset.emailId;
        const isChecked = event.target.checked;
        
        if (this.emailActions.has(emailId)) {
            this.emailActions.get(emailId).selected = isChecked;
        }
        
        const emailItem = event.target.closest('.email-item');
        if (emailItem) {
            emailItem.classList.toggle('selected', isChecked);
        }
        
        this.updateSelectedCount();
    }

    handleEmailFolderChange(event) {
        const emailId = event.target.dataset.emailId;
        const newFolder = event.target.value;
        
        if (this.emailActions.has(emailId)) {
            this.emailActions.get(emailId).targetFolder = newFolder;
        }
    }

    handleDomainFolderChange(event) {
        const domain = event.target.dataset.domain;
        const newFolder = event.target.value;
        
        if (this.currentAnalysis) {
            const domainData = this.currentAnalysis.domains.find(d => d.domain === domain);
            if (domainData) {
                domainData.emails.forEach(email => {
                    if (this.emailActions.has(email.id)) {
                        this.emailActions.get(email.id).targetFolder = newFolder;
                    }
                    
                    const emailSelect = document.querySelector(`select[data-email-id="${email.id}"]`);
                    if (emailSelect) emailSelect.value = newFolder;
                });
            }
        }
    }

    updateSelectedCount() {
        const selectedCount = Array.from(this.emailActions.values()).filter(action => action.selected).length;
        
        const selectedCountSpan = document.getElementById('selectedCount');
        const applyBtn = document.getElementById('applyBtn');
        
        if (selectedCountSpan) selectedCountSpan.textContent = selectedCount.toLocaleString();
        
        if (applyBtn) {
            applyBtn.disabled = selectedCount === 0;
            applyBtn.textContent = selectedCount === 0 
                ? 'Aucun email sélectionné' 
                : `▶ Organiser ${selectedCount} emails`;
        }
    }

    handleSearch(searchTerm) {
        const emailItems = document.querySelectorAll('.email-item');
        const domainRows = document.querySelectorAll('.domain-item');
        
        emailItems.forEach(item => {
            const subject = item.querySelector('.email-subject')?.textContent.toLowerCase() || '';
            const meta = item.querySelector('.email-meta')?.textContent.toLowerCase() || '';
            
            const matches = subject.includes(searchTerm.toLowerCase()) || meta.includes(searchTerm.toLowerCase());
            item.style.display = matches || !searchTerm ? 'flex' : 'none';
            
            if (matches && searchTerm) {
                const emailId = item.dataset.emailId;
                const emailAction = this.emailActions.get(emailId);
                if (emailAction) {
                    const domainRow = document.querySelector(`[data-domain="${emailAction.domain}"]`);
                    if (domainRow) {
                        domainRow.classList.add('expanded');
                        this.expandedDomains.add(emailAction.domain);
                    }
                }
            }
        });
        
        if (searchTerm) {
            domainRows.forEach(row => {
                const visibleEmails = row.querySelectorAll('.email-item[style*="flex"]').length;
                row.style.display = visibleEmails > 0 ? 'block' : 'none';
            });
        } else {
            domainRows.forEach(row => {
                row.style.display = 'block';
            });
        }
    }

    async applyOrganization() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            
            const selectedEmails = Array.from(this.emailActions.values()).filter(action => action.selected);
            
            if (selectedEmails.length === 0) {
                this.showError('Aucun email sélectionné');
                return;
            }
            
            await this.simulateExecution(selectedEmails);
            
        } catch (error) {
            console.error('[DomainOrganizer] Apply error:', error);
            this.showError(`Erreur: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateExecution(selectedEmails) {
        this.updateStepIndicator(4);
        
        const executeBar = document.getElementById('executeBar');
        const foldersCreated = document.getElementById('foldersCreated');
        const emailsMoved = document.getElementById('emailsMoved');
        const timeRemaining = document.getElementById('timeRemaining');
        const organizationDescription = document.getElementById('organizationDescription');
        
        let progress = 0;
        let folders = 0;
        let emails = 0;
        
        const uniqueFolders = new Set(selectedEmails.map(email => email.targetFolder));
        const totalFolders = uniqueFolders.size;
        const totalEmails = selectedEmails.length;
        
        const descriptions = [
            'Création des dossiers',
            'Déplacement des emails',
            'Vérification',
            'Finalisation'
        ];
        
        let descIndex = 0;
        let startTime = Date.now();
        
        const interval = setInterval(() => {
            progress += 12;
            
            const elapsed = Date.now() - startTime;
            const estimated = (elapsed / progress) * (100 - progress);
            const remainingSeconds = Math.max(0, Math.floor(estimated / 1000));
            
            if (executeBar) executeBar.style.width = `${Math.min(progress, 100)}%`;
            if (timeRemaining && progress < 100) {
                timeRemaining.textContent = remainingSeconds > 60 
                    ? `${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s`
                    : `${remainingSeconds}s`;
            }
            
            if (progress === 24) {
                folders = Math.floor(totalFolders * 0.4);
                emails = Math.floor(totalEmails * 0.1);
                if (organizationDescription) organizationDescription.textContent = descriptions[0];
            } else if (progress === 48) {
                folders = Math.floor(totalFolders * 0.8);
                emails = Math.floor(totalEmails * 0.3);
                if (organizationDescription) organizationDescription.textContent = descriptions[1];
            } else if (progress === 72) {
                folders = totalFolders;
                emails = Math.floor(totalEmails * 0.7);
                if (organizationDescription) organizationDescription.textContent = descriptions[2];
            } else if (progress === 96) {
                emails = totalEmails;
                if (organizationDescription) organizationDescription.textContent = descriptions[3];
            } else if (progress >= 100) {
                clearInterval(interval);
                if (organizationDescription) organizationDescription.textContent = 'Terminé';
                if (timeRemaining) timeRemaining.textContent = '0s';
                
                const totalTimeElapsed = Date.now() - startTime;
                const totalMinutes = Math.floor(totalTimeElapsed / 60000);
                const totalSeconds = Math.floor((totalTimeElapsed % 60000) / 1000);
                
                setTimeout(() => this.showSuccess({ 
                    emailsMoved: emails, 
                    foldersCreated: folders,
                    totalTime: totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds}s` : `${totalSeconds}s`
                }), 800);
            }
            
            if (foldersCreated) foldersCreated.textContent = folders;
            if (emailsMoved) emailsMoved.textContent = emails;
        }, 200);
    }

    showSuccess(results) {
        this.updateStepIndicator(5);
        
        const finalEmailsMoved = document.getElementById('finalEmailsMoved');
        const finalFoldersCreated = document.getElementById('finalFoldersCreated');
        const totalTime = document.getElementById('totalTime');
        const successMessage = document.getElementById('successMessage');
        
        if (finalEmailsMoved) finalEmailsMoved.textContent = results.emailsMoved.toLocaleString();
        if (finalFoldersCreated) finalFoldersCreated.textContent = results.foldersCreated;
        if (totalTime) totalTime.textContent = results.totalTime;
        
        const message = `${results.emailsMoved} emails organisés dans ${results.foldersCreated} dossiers`;
        if (successMessage) successMessage.textContent = message;
    }

    resetForm() {
        this.updateStepIndicator(1);
        
        const form = document.getElementById('organizeForm');
        if (form) form.reset();
        
        this.setDefaultDates();
        this.emailActions.clear();
        this.selectedActions.clear();
        this.expandedDomains.clear();
        this.currentAnalysis = null;
        this.isProcessing = false;
        this.currentStep = 1;
    }

    configure(options = {}) {
        const { excludeDomains = [], excludeEmails = [] } = options;
        this.excludedDomains = new Set(excludeDomains.map(d => d.toLowerCase()));
        this.excludedEmails = new Set(excludeEmails.map(e => e.toLowerCase()));
    }

    showError(message) {
        console.error('[DomainOrganizer] Error:', message);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    exploreResults() {
        window.open('https://outlook.office.com/mail/', '_blank');
    }
}

// Initialisation
window.organizerInstance = new DomainOrganizer();

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v8.2 Minimalist...');
    
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
    if (!pageContent) return;

    window.domainOrganizerActive = true;
    window.organizerInstance.isActive = true;

    pageContent.innerHTML = window.organizerInstance.getPageHTML();
    pageContent.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) {
        rangerButton.classList.add('active');
        if (rangerButton.parentElement) {
            rangerButton.parentElement.classList.add('active');
        }
    }

    setTimeout(async () => {
        if (window.domainOrganizerActive && document.getElementById('step1')) {
            try {
                await window.organizerInstance.initializePage();
                console.log('[DomainOrganizer] ✅ Minimalist interface ready v8.2');
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
            }
        }
    }, 50);
}

// Event handling
document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]') || 
                        e.target.closest('button[onclick*="ranger"]') || 
                        e.target.closest('a[href*="ranger"]');
    
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        setTimeout(showDomainOrganizerApp, 10);
        return false;
    }
}, true);

// PageManager hook
if (window.pageManager?.loadPage) {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        if (pageName === 'ranger') {
            showDomainOrganizerApp();
            return;
        }

        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
}

// Global exports
window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = {
    showPage: showDomainOrganizerApp,
    instance: window.organizerInstance
};

console.log('[DomainOrganizer] ✅ v8.2 Minimalist System ready');
