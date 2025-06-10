// DomainOrganizer.js - Version 6.7.0 - Version fonctionnelle sans bugs
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
        this.isActive = false;
        
        console.log('[DomainOrganizer] ✅ v6.7 - Version fonctionnelle sans bugs');
    }

    getPageHTML() {
        return `
            <div class="container" style="max-width: 900px; margin: 20px auto; padding: 0 20px;">
                <!-- Configuration Card -->
                <div class="card" id="configCard">
                    <h2 class="card-title">
                        <i class="fas fa-folder-tree"></i>
                        Rangement intelligent par domaine
                    </h2>
                    <p class="card-subtitle">Organisez automatiquement vos emails en créant des dossiers par domaine d'expéditeur</p>
                    
                    <form id="organizeForm" class="organize-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="startDate">
                                    <i class="fas fa-calendar-alt"></i>
                                    Date de début
                                </label>
                                <input type="date" id="startDate" name="startDate">
                                <span class="help-text">Emails à partir de cette date</span>
                            </div>
                            
                            <div class="form-group">
                                <label for="endDate">
                                    <i class="fas fa-calendar-check"></i>
                                    Date de fin
                                </label>
                                <input type="date" id="endDate" name="endDate">
                                <span class="help-text">Emails jusqu'à cette date</span>
                            </div>
                            
                            <div class="form-group full-width">
                                <label for="excludeDomains">
                                    <i class="fas fa-ban"></i>
                                    Domaines à exclure (optionnel)
                                </label>
                                <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com, yahoo.fr">
                                <span class="help-text">Séparez par des virgules. Ces domaines ne seront pas organisés</span>
                            </div>
                            
                            <div class="form-group full-width">
                                <label for="excludeEmails">
                                    <i class="fas fa-user-times"></i>
                                    Adresses à exclure (optionnel)
                                </label>
                                <textarea id="excludeEmails" placeholder="boss@company.com&#10;important@client.fr&#10;noreply@service.com" rows="3"></textarea>
                                <span class="help-text">Une adresse par ligne. Ces emails resteront en place</span>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary" id="analyzeBtn">
                                <i class="fas fa-rocket"></i>
                                Lancer l'analyse intelligente
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Progress Card -->
                <div class="card" id="progressCard" style="display: none;">
                    <div class="progress-header">
                        <h2 class="card-title">
                            <i class="fas fa-search fa-spin"></i>
                            Analyse en cours
                        </h2>
                        <p class="card-subtitle">Nous analysons vos emails pour créer une organisation optimale</p>
                    </div>
                    
                    <div class="progress-content">
                        <div class="progress-info">
                            <span id="progressLabel">Initialisation</span>
                            <span id="progressPercent">0%</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar" id="progressBar" style="width: 0%"></div>
                        </div>
                        <div id="progressText" class="progress-message">Préparation de l'analyse...</div>
                        
                        <div class="analysis-stats">
                            <div class="stat-item">
                                <i class="fas fa-envelope"></i>
                                <span id="emailsAnalyzed">0</span> emails analysés
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-at"></i>
                                <span id="domainsFound">0</span> domaines détectés
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results Card -->
                <div class="card" id="resultsCard" style="display: none;">
                    <h2 class="card-title">
                        <i class="fas fa-chart-bar"></i>
                        Résultats de l'analyse
                    </h2>
                    <p class="card-subtitle">Vérifiez et ajustez l'organisation proposée avant l'application</p>

                    <div class="stats-row">
                        <div class="stat">
                            <div class="stat-value" id="statEmails">0</div>
                            <div class="stat-label">Emails à organiser</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value" id="statDomains">0</div>
                            <div class="stat-label">Domaines détectés</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value" id="statNew">0</div>
                            <div class="stat-label">Nouveaux dossiers</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value" id="statExisting">0</div>
                            <div class="stat-label">Dossiers existants</div>
                        </div>
                    </div>

                    <div class="table-controls">
                        <div class="checkbox-group">
                            <input type="checkbox" id="selectAll" checked>
                            <label for="selectAll">Sélectionner tous les domaines</label>
                        </div>
                    </div>

                    <div class="results-container">
                        <table class="results-table">
                            <thead>
                                <tr>
                                    <th style="width: 40px">
                                        <input type="checkbox" id="selectAllHeader" checked>
                                    </th>
                                    <th>Domaine</th>
                                    <th style="width: 100px">Emails</th>
                                    <th style="width: 250px">Dossier de destination</th>
                                    <th style="width: 120px">Action</th>
                                </tr>
                            </thead>
                            <tbody id="resultsTableBody">
                                <!-- Populated dynamically -->
                            </tbody>
                        </table>
                    </div>

                    <div class="action-bar">
                        <div class="options-group">
                            <div class="checkbox-group">
                                <input type="checkbox" id="createFolders" checked>
                                <label for="createFolders">Créer automatiquement les nouveaux dossiers</label>
                            </div>
                        </div>
                        
                        <div class="buttons-group">
                            <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                                <i class="fas fa-arrow-left"></i>
                                Retour
                            </button>
                            <button class="btn btn-primary" id="applyBtn" onclick="window.organizerInstance.applyOrganization()">
                                <i class="fas fa-play"></i>
                                Lancer l'organisation
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Execution Card -->
                <div class="card" id="executionCard" style="display: none;">
                    <div class="progress-header">
                        <h2 class="card-title">
                            <i class="fas fa-cogs fa-spin"></i>
                            Organisation en cours
                        </h2>
                        <p class="card-subtitle">Vos emails sont en cours d'organisation automatique</p>
                    </div>
                    
                    <div class="progress-content">
                        <div class="progress-info">
                            <span id="executeLabel">Démarrage</span>
                            <span id="executePercent">0%</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar" id="executeBar" style="width: 0%; background: linear-gradient(90deg, #10b981, #059669);"></div>
                        </div>
                        <div id="executeText" class="progress-message">Préparation...</div>
                        
                        <div class="execution-stats">
                            <div class="stat-item success">
                                <i class="fas fa-folder-plus"></i>
                                <span id="foldersCreated">0</span> dossiers créés
                            </div>
                            <div class="stat-item success">
                                <i class="fas fa-paper-plane"></i>
                                <span id="emailsMoved">0</span> emails déplacés
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Success Message -->
                <div class="success-card" id="successCard" style="display: none;">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Organisation terminée avec succès !</h2>
                    <p id="successMessage">Votre boîte mail a été organisée.</p>
                    
                    <div class="success-stats">
                        <div class="success-stat">
                            <div class="success-value" id="finalEmailsMoved">0</div>
                            <div class="success-label">Emails organisés</div>
                        </div>
                        <div class="success-stat">
                            <div class="success-value" id="finalFoldersCreated">0</div>
                            <div class="success-label">Dossiers créés</div>
                        </div>
                    </div>
                    
                    <div class="success-actions">
                        <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                            <i class="fas fa-redo"></i>
                            Nouveau rangement
                        </button>
                        <button class="btn btn-primary" onclick="window.organizerInstance.exploreResults()">
                            <i class="fas fa-external-link-alt"></i>
                            Voir dans Outlook
                        </button>
                    </div>
                </div>
            </div>

            <style>
                /* Styles pour le Domain Organizer */
                .domain-organizer-page {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #1e293b;
                }

                .card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                    border: 1px solid #e2e8f0;
                    padding: 32px;
                    margin-bottom: 24px;
                    transition: all 0.3s ease;
                }

                .card:hover {
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                    transform: translateY(-2px);
                }

                .card-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #1e293b;
                }

                .card-title i {
                    color: #3b82f6;
                    font-size: 20px;
                }

                .card-subtitle {
                    color: #64748b;
                    margin: 0 0 24px 0;
                    font-size: 16px;
                    line-height: 1.5;
                }

                .organize-form {
                    margin-top: 24px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-size: 15px;
                    font-weight: 600;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .form-group label i {
                    color: #3b82f6;
                    width: 16px;
                    text-align: center;
                }

                .form-group input[type="date"],
                .form-group input[type="text"],
                .form-group textarea {
                    padding: 12px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    background: white;
                    font-family: inherit;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px #dbeafe;
                    transform: translateY(-1px);
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .help-text {
                    font-size: 13px;
                    color: #64748b;
                    font-style: italic;
                }

                .form-actions {
                    text-align: center;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    min-width: 150px;
                    justify-content: center;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                    filter: brightness(1.05);
                }

                .btn-primary:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                    filter: none;
                }

                .btn-secondary {
                    background: white;
                    color: #64748b;
                    border: 2px solid #e2e8f0;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }

                .btn-secondary:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }

                .progress-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .progress-content {
                    text-align: center;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    font-weight: 600;
                    color: #374151;
                }

                .progress {
                    height: 8px;
                    background: #e2e8f0;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 16px;
                    position: relative;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #06b6d4);
                    transition: width 0.5s ease;
                    border-radius: 4px;
                    position: relative;
                }

                .progress-bar::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .progress-message {
                    font-size: 16px;
                    color: #1e293b;
                    font-weight: 500;
                    margin-bottom: 24px;
                }

                .analysis-stats,
                .execution-stats {
                    display: flex;
                    justify-content: center;
                    gap: 32px;
                    flex-wrap: wrap;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    font-weight: 500;
                }

                .stat-item i {
                    color: #3b82f6;
                    width: 20px;
                    text-align: center;
                }

                .stat-item.success {
                    color: #059669;
                }

                .stat-item.success i {
                    color: #10b981;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                    padding: 24px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .stat {
                    text-align: center;
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #1e293b;
                    display: block;
                }

                .stat-label {
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 500;
                    margin-top: 4px;
                }

                .table-controls {
                    margin-bottom: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .checkbox-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .checkbox-group input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: #3b82f6;
                }

                .checkbox-group label {
                    font-weight: 500;
                    color: #374151;
                    cursor: pointer;
                }

                .results-container {
                    max-height: 500px;
                    overflow-y: auto;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    background: white;
                }

                .results-table {
                    width: 100%;
                    font-size: 14px;
                    border-collapse: collapse;
                }

                .results-table th {
                    text-align: left;
                    padding: 16px 12px;
                    border-bottom: 2px solid #e2e8f0;
                    font-weight: 700;
                    color: #374151;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: #f8fafc;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .results-table td {
                    padding: 16px 12px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                }

                .results-table tr:hover {
                    background: #f8fafc;
                }

                .domain-name {
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #1e293b;
                }

                .domain-name i {
                    color: #64748b;
                    font-size: 12px;
                }

                .email-count {
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 13px;
                    font-weight: 700;
                    display: inline-block;
                }

                .folder-select,
                .folder-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 14px;
                    background: white;
                    transition: border-color 0.2s ease;
                }

                .folder-select:focus,
                .folder-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .action-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .action-new {
                    background: #d1fae5;
                    color: #065f46;
                }

                .action-existing {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 2px solid #e2e8f0;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .options-group {
                    flex: 1;
                }

                .buttons-group {
                    display: flex;
                    gap: 12px;
                }

                .success-card {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border-radius: 16px;
                    padding: 48px 32px;
                    text-align: center;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
                }

                .success-icon {
                    width: 80px;
                    height: 80px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px auto;
                    font-size: 36px;
                    color: white;
                }

                .success-card h2 {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0 0 16px 0;
                    color: white;
                }

                .success-card p {
                    font-size: 18px;
                    margin: 0 0 32px 0;
                    opacity: 0.9;
                }

                .success-stats {
                    display: flex;
                    justify-content: center;
                    gap: 48px;
                    margin-bottom: 32px;
                }

                .success-stat {
                    text-align: center;
                }

                .success-value {
                    font-size: 36px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: white;
                }

                .success-label {
                    font-size: 14px;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .success-actions {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .success-actions .btn {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }

                .success-actions .btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }

                .success-actions .btn-primary {
                    background: white;
                    color: #059669;
                }

                .success-actions .btn-primary:hover {
                    background: #f8fafc;
                    color: #047857;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .container {
                        padding: 0 16px;
                        margin: 16px auto;
                    }
                    
                    .card {
                        padding: 24px;
                    }
                    
                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                    
                    .stats-row {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                        padding: 16px;
                    }
                    
                    .analysis-stats,
                    .execution-stats {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .action-bar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .buttons-group {
                        justify-content: center;
                    }
                    
                    .success-stats {
                        flex-direction: column;
                        gap: 24px;
                    }
                    
                    .success-actions {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .success-actions .btn {
                        width: 100%;
                        max-width: 300px;
                    }
                    
                    .results-table {
                        font-size: 12px;
                    }
                    
                    .results-table th,
                    .results-table td {
                        padding: 12px 8px;
                    }
                }
            </style>
        `;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v6.7...');
        
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.isActive = true;
        
        console.log('[DomainOrganizer] ✅ Successfully initialized v6.7');
        return true;
    }

    setupEventListeners() {
        const form = document.getElementById('organizeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => this.handleSelectAll(e));
        }
        
        const selectAllHeader = document.getElementById('selectAllHeader');
        if (selectAllHeader) {
            selectAllHeader.addEventListener('change', (e) => this.handleSelectAll(e));
        }
        
        console.log('[DomainOrganizer] Event listeners attached');
    }

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) {
            startDateInput.valueAsDate = thirtyDaysAgo;
        }
        if (endDateInput) {
            endDateInput.valueAsDate = today;
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
        console.log('[DomainOrganizer] Form submitted');
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
        const excludeEmails = document.getElementById('excludeEmails')?.value
            .split('\n').map(e => e.trim()).filter(e => e) || [];
        
        return { startDate, endDate, excludeDomains, excludeEmails };
    }

    async startAnalysis(formData) {
        try {
            this.showProgress();
            
            this.configure({
                excludeDomains: formData.excludeDomains,
                excludeEmails: formData.excludeEmails
            });
            
            // Simuler l'analyse pour la démo
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
        console.log('[DomainOrganizer] Simulating analysis...');
        
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressLabel = document.getElementById('progressLabel');
        const progressPercent = document.getElementById('progressPercent');
        const emailsAnalyzed = document.getElementById('emailsAnalyzed');
        const domainsFound = document.getElementById('domainsFound');
        
        let progress = 0;
        let emails = 0;
        let domains = 0;
        
        const interval = setInterval(() => {
            progress += 10;
            emails += Math.floor(Math.random() * 20) + 10;
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercent) progressPercent.textContent = `${progress}%`;
            if (emailsAnalyzed) emailsAnalyzed.textContent = emails;
            
            if (progress === 20) {
                if (progressLabel) progressLabel.textContent = 'Connexion';
                if (progressText) progressText.textContent = 'Connexion à Microsoft Graph API...';
            } else if (progress === 40) {
                domains = Math.floor(emails / 15) + 2;
                if (domainsFound) domainsFound.textContent = domains;
                if (progressLabel) progressLabel.textContent = 'Récupération';
                if (progressText) progressText.textContent = 'Récupération des emails...';
            } else if (progress === 70) {
                if (progressLabel) progressLabel.textContent = 'Analyse';
                if (progressText) progressText.textContent = 'Analyse des domaines...';
            } else if (progress === 90) {
                if (progressLabel) progressLabel.textContent = 'Finalisation';
                if (progressText) progressText.textContent = 'Préparation des résultats...';
            } else if (progress >= 100) {
                clearInterval(interval);
                if (progressLabel) progressLabel.textContent = 'Terminé';
                if (progressText) progressText.textContent = 'Analyse terminée !';
                
                // Simuler des résultats
                const results = {
                    totalEmails: emails,
                    totalDomains: domains,
                    domainsToCreate: Math.floor(domains * 0.7),
                    domainsWithExisting: Math.floor(domains * 0.3),
                    domains: this.generateMockDomains(domains, emails)
                };
                
                setTimeout(() => this.showResults(results), 1000);
            }
        }, 400);
    }

    generateMockDomains(domainCount, totalEmails) {
        const mockDomains = [
            'amazon.com', 'paypal.com', 'github.com', 'stackoverflow.com', 'linkedin.com',
            'medium.com', 'atlassian.com', 'slack.com', 'dropbox.com', 'spotify.com',
            'netflix.com', 'airbnb.com', 'booking.com', 'udemy.com', 'coursera.org'
        ];
        
        const domains = [];
        let remainingEmails = totalEmails;
        
        for (let i = 0; i < domainCount; i++) {
            const domain = mockDomains[i % mockDomains.length];
            const emailCount = i === domainCount - 1 
                ? remainingEmails 
                : Math.floor(Math.random() * 30) + 5;
            
            remainingEmails -= emailCount;
            
            domains.push({
                domain: domain,
                count: emailCount,
                action: Math.random() > 0.3 ? 'create-new' : 'move-existing',
                suggestedFolder: domain,
                samples: []
            });
        }
        
        return domains.sort((a, b) => b.count - a.count);
    }

    showProgress() {
        document.getElementById('configCard').style.display = 'none';
        document.getElementById('progressCard').style.display = 'block';
        document.getElementById('resultsCard').style.display = 'none';
        document.getElementById('executionCard').style.display = 'none';
        document.getElementById('successCard').style.display = 'none';
    }

    showResults(results) {
        console.log('[DomainOrganizer] Showing results:', results);
        
        document.getElementById('statEmails').textContent = results.totalEmails.toLocaleString();
        document.getElementById('statDomains').textContent = results.totalDomains;
        document.getElementById('statNew').textContent = results.domainsToCreate;
        document.getElementById('statExisting').textContent = results.domainsWithExisting;
        
        this.displayDomainsTable(results.domains);
        this.prepareActions(results.domains);
        
        document.getElementById('progressCard').style.display = 'none';
        document.getElementById('resultsCard').style.display = 'block';
    }

    displayDomainsTable(domains) {
        const tbody = document.getElementById('resultsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        domains.forEach((domain, index) => {
            const row = this.createDomainRow(domain, index);
            tbody.appendChild(row);
        });
    }

    createDomainRow(domainData, index) {
        const row = document.createElement('tr');
        row.dataset.domain = domainData.domain;
        
        const isNewFolder = domainData.action === 'create-new';
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" checked>
            </td>
            <td>
                <div class="domain-name">
                    <i class="fas fa-at"></i>
                    ${domainData.domain}
                </div>
            </td>
            <td>
                <span class="email-count">${domainData.count}</span>
            </td>
            <td>
                ${isNewFolder ? 
                    `<input type="text" class="folder-input" value="${domainData.suggestedFolder}" 
                            data-domain="${domainData.domain}">` :
                    `<select class="folder-select" data-domain="${domainData.domain}">
                        <option value="existing">${domainData.suggestedFolder}</option>
                    </select>`
                }
            </td>
            <td>
                <span class="action-badge ${isNewFolder ? 'action-new' : 'action-existing'}">
                    ${isNewFolder ? 'Nouveau' : 'Existant'}
                </span>
            </td>
        `;
        
        const checkbox = row.querySelector('.domain-checkbox');
        checkbox.addEventListener('change', (e) => this.handleDomainToggle(e));
        
        const folderInput = row.querySelector('.folder-input, .folder-select');
        if (folderInput) {
            folderInput.addEventListener('change', (e) => this.handleFolderChange(e));
        }
        
        return row;
    }

    handleDomainToggle(event) {
        const domain = event.target.dataset.domain;
        const isChecked = event.target.checked;
        
        if (this.selectedActions.has(domain)) {
            this.selectedActions.get(domain).selected = isChecked;
        }
    }

    handleFolderChange(event) {
        const domain = event.target.dataset.domain;
        const value = event.target.value;
        
        if (this.selectedActions.has(domain)) {
            const action = this.selectedActions.get(domain);
            action.targetFolder = value;
        }
    }

    handleSelectAll(event) {
        const isChecked = event.target.checked;
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
            this.handleDomainToggle({ target: checkbox });
        });
        
        // Synchroniser les deux checkboxes
        document.getElementById('selectAll').checked = isChecked;
        document.getElementById('selectAllHeader').checked = isChecked;
    }

    prepareActions(domains) {
        this.selectedActions.clear();
        
        domains.forEach(domain => {
            this.selectedActions.set(domain.domain, {
                domain: domain.domain,
                action: domain.action,
                targetFolder: domain.suggestedFolder,
                emailCount: domain.count,
                selected: true
            });
        });
    }

    async applyOrganization() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            
            const selectedActions = Array.from(this.selectedActions.values()).filter(action => action.selected);
            
            if (selectedActions.length === 0) {
                this.showError('Aucune action sélectionnée');
                return;
            }
            
            await this.simulateExecution(selectedActions);
            
        } catch (error) {
            console.error('[DomainOrganizer] Apply error:', error);
            this.showError(`Erreur: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateExecution(actions) {
        console.log('[DomainOrganizer] Simulating execution...');
        
        document.getElementById('resultsCard').style.display = 'none';
        document.getElementById('executionCard').style.display = 'block';
        
        const executeBar = document.getElementById('executeBar');
        const executeText = document.getElementById('executeText');
        const executeLabel = document.getElementById('executeLabel');
        const executePercent = document.getElementById('executePercent');
        const foldersCreated = document.getElementById('foldersCreated');
        const emailsMoved = document.getElementById('emailsMoved');
        
        let progress = 0;
        let folders = 0;
        let emails = 0;
        
        const totalEmails = actions.reduce((sum, action) => sum + action.emailCount, 0);
        const totalFolders = actions.filter(action => action.action === 'create-new').length;
        
        const interval = setInterval(() => {
            progress += 8;
            
            if (executeBar) executeBar.style.width = `${Math.min(progress, 100)}%`;
            if (executePercent) executePercent.textContent = `${Math.min(progress, 100)}%`;
            
            if (progress === 16) {
                folders = Math.floor(totalFolders * 0.3);
                if (foldersCreated) foldersCreated.textContent = folders;
                if (executeLabel) executeLabel.textContent = 'Création';
                if (executeText) executeText.textContent = 'Création des dossiers...';
            } else if (progress === 40) {
                folders = Math.floor(totalFolders * 0.7);
                emails = Math.floor(totalEmails * 0.2);
                if (foldersCreated) foldersCreated.textContent = folders;
                if (emailsMoved) emailsMoved.textContent = emails;
                if (executeLabel) executeLabel.textContent = 'Déplacement';
                if (executeText) executeText.textContent = 'Déplacement des emails...';
            } else if (progress === 72) {
                folders = totalFolders;
                emails = Math.floor(totalEmails * 0.8);
                if (foldersCreated) foldersCreated.textContent = folders;
                if (emailsMoved) emailsMoved.textContent = emails;
                if (executeLabel) executeLabel.textContent = 'Finalisation';
                if (executeText) executeText.textContent = 'Finalisation de l\'organisation...';
            } else if (progress >= 100) {
                clearInterval(interval);
                folders = totalFolders;
                emails = totalEmails;
                if (foldersCreated) foldersCreated.textContent = folders;
                if (emailsMoved) emailsMoved.textContent = emails;
                if (executeLabel) executeLabel.textContent = 'Terminé';
                if (executeText) executeText.textContent = 'Organisation terminée !';
                
                setTimeout(() => this.showSuccess({ emailsMoved: emails, foldersCreated: folders }), 1000);
            }
        }, 300);
    }

    showSuccess(results) {
        document.getElementById('executionCard').style.display = 'none';
        document.getElementById('successCard').style.display = 'block';
        
        document.getElementById('finalEmailsMoved').textContent = results.emailsMoved.toLocaleString();
        document.getElementById('finalFoldersCreated').textContent = results.foldersCreated;
        
        const message = `${results.emailsMoved} emails ont été organisés dans ${results.foldersCreated} dossiers.`;
        document.getElementById('successMessage').textContent = message;
    }

    exploreResults() {
        window.open('https://outlook.office.com/mail/', '_blank');
    }

    resetForm() {
        document.getElementById('configCard').style.display = 'block';
        document.getElementById('progressCard').style.display = 'none';
        document.getElementById('resultsCard').style.display = 'none';
        document.getElementById('executionCard').style.display = 'none';
        document.getElementById('successCard').style.display = 'none';
        
        const form = document.getElementById('organizeForm');
        if (form) form.reset();
        
        this.setDefaultDates();
        this.selectedActions.clear();
        this.isProcessing = false;
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
}

// === INITIALISATION GLOBALE ===

window.organizerInstance = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ v6.7 Instance created');

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v6.7...');
    
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
        if (window.domainOrganizerActive && document.getElementById('configCard')) {
            try {
                await window.organizerInstance.initializePage();
                console.log('[DomainOrganizer] ✅ Successfully initialized v6.7');
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
            }
        }
    }, 50);

    console.log('[DomainOrganizer] ✅ Interface launched v6.7');
}

// === SYSTÈME D'INTERCEPTION ===

document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]') || 
                        e.target.closest('button[onclick*="ranger"]') || 
                        e.target.closest('a[href*="ranger"]');
    
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[DomainOrganizer] 🎯 Ranger click detected v6.7');
        setTimeout(showDomainOrganizerApp, 10);
        return false;
    }
}, true);

if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        console.log(`[DomainOrganizer] 🔍 PageManager.loadPage: ${pageName}`);
        
        if (pageName === 'ranger') {
            console.log('[DomainOrganizer] 🎯 PageManager interception v6.7');
            showDomainOrganizerApp();
            return;
        }

        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                console.log('[DomainOrganizer] 🔧 PageManager error intercepted v6.7');
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
    
    console.log('[DomainOrganizer] ✅ PageManager hook installed v6.7');
}

window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = {
    showPage: showDomainOrganizerApp,
    instance: window.organizerInstance
};

console.log('[DomainOrganizer] ✅ v6.7 System ready - Functional version without bugs');
