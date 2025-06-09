// DomainOrganizer.js - Version 4.0.0 - Interface hiérarchique avec contrôle granulaire
// Permet de voir les domaines regroupés et de les déplier pour contrôler l'organisation

class DomainOrganizer {
    constructor() {
        // État du module
        this.isProcessing = false;
        this.existingFolders = new Map();
        this.domainAnalysis = new Map();
        this.emailsByDomain = new Map();
        this.excludedDomains = new Set();
        this.excludedEmails = new Set();
        this.progressCallback = null;
        
        // État de l'interface
        this.currentAnalysis = null;
        this.selectedActions = new Map();
        this.currentStep = 'configure';
        this.expandedDomains = new Set(); // Domaines dépliés
        this.folderStructure = new Map(); // Structure de dossiers proposée
        
        console.log('[DomainOrganizer] ✅ Module initialized v4.0');
    }

    // ================================================
    // MÉTHODES D'INTERFACE - GESTION DE LA PAGE
    // ================================================
    
    /**
     * Génère le HTML de la page
     */
    getPageHTML() {
        return `
            <div class="container" style="max-width: 1000px; margin: 40px auto; padding: 0 20px;">
                <!-- En-tête avec étapes -->
                <div class="steps-header">
                    <h1>
                        <i class="fas fa-folder-tree"></i>
                        Rangement par domaine
                    </h1>
                    <div class="steps-indicator">
                        <div class="step active" data-step="configure">
                            <div class="step-number">1</div>
                            <div class="step-label">Config</div>
                        </div>
                        <div class="step" data-step="analyze">
                            <div class="step-number">2</div>
                            <div class="step-label">Analyse</div>
                        </div>
                        <div class="step" data-step="review">
                            <div class="step-number">3</div>
                            <div class="step-label">Organisation</div>
                        </div>
                        <div class="step" data-step="execute">
                            <div class="step-number">4</div>
                            <div class="step-label">Action</div>
                        </div>
                    </div>
                </div>

                <!-- Étape 1: Configuration -->
                <div class="step-content" id="configStep" style="display: block;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-cog"></i>
                            Configuration du rangement
                        </h2>
                        
                        <div class="info-box info-primary">
                            <i class="fas fa-info-circle"></i>
                            <div>
                                <strong>Rangement hiérarchique par domaine</strong><br>
                                Cette fonctionnalité organise vos emails en créant une structure hiérarchique. 
                                Vous pourrez contrôler précisément où chaque domaine et sous-domaine sera rangé.
                            </div>
                        </div>
                        
                        <form id="organizeForm">
                            <div class="form-section">
                                <h4><i class="fas fa-calendar"></i> Période à analyser</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="startDate">Date début</label>
                                        <input type="date" id="startDate" name="startDate">
                                        <span class="help-text">Emails à partir de cette date</span>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="endDate">Date fin</label>
                                        <input type="date" id="endDate" name="endDate">
                                        <span class="help-text">Emails jusqu'à cette date</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4><i class="fas fa-sitemap"></i> Options d'organisation</h4>
                                <div class="organization-options">
                                    <div class="option-group">
                                        <label class="option-label">
                                            <input type="radio" name="organizationType" value="hierarchical" checked>
                                            <div class="option-content">
                                                <strong>Organisation hiérarchique</strong>
                                                <span>Créer des dossiers par domaine avec contrôle de l'architecture</span>
                                            </div>
                                        </label>
                                    </div>
                                    <div class="option-group">
                                        <label class="option-label">
                                            <input type="radio" name="organizationType" value="flat">
                                            <div class="option-content">
                                                <strong>Organisation plate</strong>
                                                <span>Un dossier par domaine, tous au même niveau</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4><i class="fas fa-filter"></i> Exclusions (optionnel)</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="excludeDomains">Domaines à ignorer</label>
                                        <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com">
                                        <span class="help-text">Ces domaines ne seront pas rangés</span>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="excludeEmails">Emails spécifiques à ignorer</label>
                                        <input type="text" id="excludeEmails" placeholder="boss@entreprise.com">
                                        <span class="help-text">Ces adresses ne seront pas rangées</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 20px;">
                                <button type="submit" class="btn btn-primary btn-large" id="analyzeBtn">
                                    <i class="fas fa-search"></i>
                                    Analyser les emails
                                    <span class="btn-subtitle">Étape 1 • Aucune modification pour l'instant</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Étape 2: Analyse en cours -->
                <div class="step-content" id="analyzeStep" style="display: none;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-chart-line"></i>
                            Analyse en cours...
                        </h2>
                        
                        <div class="analysis-progress">
                            <div class="current-action">
                                <div class="spinner"></div>
                                <div id="currentActionText">Préparation...</div>
                            </div>
                            
                            <div class="progress-section">
                                <div class="progress-header">
                                    <span id="progressLabel">Initialisation</span>
                                    <span id="progressPercent">0%</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar" id="progressBar" style="width: 0%"></div>
                                </div>
                            </div>
                            
                            <div class="analysis-steps">
                                <div class="analysis-step" id="step-folders">
                                    <i class="fas fa-folder pending"></i>
                                    <span>Dossiers existants</span>
                                    <div class="step-status pending">En attente</div>
                                </div>
                                <div class="analysis-step" id="step-emails">
                                    <i class="fas fa-envelope pending"></i>
                                    <span>Récupération emails</span>
                                    <div class="step-status pending">En attente</div>
                                </div>
                                <div class="analysis-step" id="step-domains">
                                    <i class="fas fa-at pending"></i>
                                    <span>Analyse domaines</span>
                                    <div class="step-status pending">En attente</div>
                                </div>
                                <div class="analysis-step" id="step-structure">
                                    <i class="fas fa-sitemap pending"></i>
                                    <span>Structure proposée</span>
                                    <div class="step-status pending">En attente</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 3: Organisation hiérarchique -->
                <div class="step-content" id="reviewStep" style="display: none;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-sitemap"></i>
                            Organisation proposée
                        </h2>

                        <div class="stats-section">
                            <div class="stats-row">
                                <div class="stat">
                                    <div class="stat-value" id="statEmails">0</div>
                                    <div class="stat-label">Emails</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value" id="statDomains">0</div>
                                    <div class="stat-label">Domaines</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value" id="statFolders">0</div>
                                    <div class="stat-label">Dossiers</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value" id="statNew">0</div>
                                    <div class="stat-label">Nouveaux</div>
                                </div>
                            </div>
                        </div>

                        <div class="controls-section">
                            <div class="controls-header">
                                <h3>Structure de dossiers</h3>
                                <div class="controls-actions">
                                    <button class="btn btn-secondary btn-sm" onclick="window.domainOrganizer.expandAll()">
                                        <i class="fas fa-expand-arrows-alt"></i>
                                        Tout déplier
                                    </button>
                                    <button class="btn btn-secondary btn-sm" onclick="window.domainOrganizer.collapseAll()">
                                        <i class="fas fa-compress-arrows-alt"></i>
                                        Tout replier
                                    </button>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="selectAll" checked>
                                        Tout sélectionner
                                    </label>
                                </div>
                            </div>
                            
                            <div class="info-box info-tip">
                                <i class="fas fa-lightbulb"></i>
                                <div>
                                    <strong>Conseil :</strong> Cliquez sur les domaines pour les déplier et voir les détails. 
                                    Vous pouvez modifier le dossier de destination, créer des sous-dossiers ou désactiver certains domaines.
                                </div>
                            </div>
                        </div>

                        <div class="hierarchy-section">
                            <div class="hierarchy-container" id="hierarchyContainer">
                                <!-- Structure hiérarchique générée dynamiquement -->
                            </div>
                            
                            <!-- Fallback: tableau classique si la hiérarchie ne fonctionne pas -->
                            <div class="results-table-container" id="fallbackTable" style="display: none;">
                                <table class="results-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 30px"></th>
                                            <th>Domaine</th>
                                            <th style="width: 50px">Nb</th>
                                            <th style="width: 140px">Dossier</th>
                                            <th style="width: 60px">Type</th>
                                            <th style="width: 80px">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="resultsTableBody">
                                        <!-- Populated dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Section de confirmation -->
                        <div class="confirmation-section">
                            <div class="warning-box">
                                <div class="warning-icon">
                                    <i class="fas fa-info-circle"></i>
                                </div>
                                <div class="warning-content">
                                    <h3>Résumé des actions</h3>
                                    <div class="summary-preview">
                                        <div class="summary-item">
                                            <span><strong id="confirmTotalEmails">0</strong> emails seront déplacés</span>
                                        </div>
                                        <div class="summary-item">
                                            <span><strong id="confirmNewFolders">0</strong> nouveaux dossiers seront créés</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="action-section">
                            <div class="options-row">
                                <div class="checkbox-group">
                                    <input type="checkbox" id="createFolders" checked>
                                    <label for="createFolders">Créer les nouveaux dossiers</label>
                                </div>
                                
                                <div class="checkbox-group">
                                    <input type="checkbox" id="finalConfirmation">
                                    <label for="finalConfirmation">
                                        <strong>Je confirme cette organisation</strong>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn btn-secondary" onclick="window.domainOrganizer.goBack()">
                                    <i class="fas fa-arrow-left"></i>
                                    Retour
                                </button>
                                <button class="btn btn-danger" id="executeBtn" onclick="window.domainOrganizer.executeOrganization()" disabled>
                                    <i class="fas fa-play"></i>
                                    Lancer le rangement
                                    <span class="btn-subtitle">Action irréversible</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 4: Exécution -->
                <div class="step-content" id="executeStep" style="display: none;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-cogs"></i>
                            Rangement en cours...
                        </h2>
                        
                        <div class="execution-progress">
                            <div class="current-domain">
                                <div class="domain-icon">
                                    <i class="fas fa-at"></i>
                                </div>
                                <div class="domain-info">
                                    <div class="domain-name" id="currentDomainName">Initialisation...</div>
                                    <div class="domain-action" id="currentDomainAction">Préparation</div>
                                </div>
                                <div class="domain-status">
                                    <div class="spinner small"></div>
                                </div>
                            </div>
                            
                            <div class="overall-progress">
                                <div class="progress-header">
                                    <span>Progression</span>
                                    <span id="executionPercent">0%</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar" id="executionProgressBar" style="width: 0%"></div>
                                </div>
                            </div>

                            <div class="execution-log">
                                <h4>Journal</h4>
                                <div class="log-container" id="executionLog">
                                    <!-- Populated dynamically -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Résultats finaux -->
                <div class="step-content" id="resultsStep" style="display: none;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-check-circle" style="color: #10b981;"></i>
                            Organisation terminée !
                        </h2>
                        
                        <div class="success-summary">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="success-content">
                                <h3>Succès !</h3>
                                <p>Votre boîte mail a été organisée selon vos préférences.</p>
                            </div>
                        </div>

                        <div class="final-stats">
                            <div class="final-stat">
                                <div class="stat-icon success"><i class="fas fa-envelope"></i></div>
                                <div class="stat-details">
                                    <div class="stat-value" id="finalEmailsMoved">0</div>
                                    <div class="stat-label">Emails déplacés</div>
                                </div>
                            </div>
                            <div class="final-stat">
                                <div class="stat-icon success"><i class="fas fa-folder-plus"></i></div>
                                <div class="stat-details">
                                    <div class="stat-value" id="finalFoldersCreated">0</div>
                                    <div class="stat-label">Dossiers créés</div>
                                </div>
                            </div>
                        </div>

                        <div class="action-buttons">
                            <button class="btn btn-secondary" onclick="window.domainOrganizer.resetForm()">
                                <i class="fas fa-redo"></i>
                                Nouveau
                            </button>
                            <button class="btn btn-primary" onclick="window.location.reload()">
                                <i class="fas fa-home"></i>
                                Accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Styles généraux */
                * { box-sizing: border-box; }
                
                .container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: #1f2937;
                    line-height: 1.6;
                }

                /* En-tête avec étapes */
                .steps-header {
                    text-align: center;
                    margin-bottom: 12px;
                }

                .steps-header h1 {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: #111827;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .steps-indicator {
                    display: flex;
                    justify-content: center;
                    gap: 14px;
                    margin: 0 auto;
                    max-width: 450px;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    opacity: 0.4;
                    transition: opacity 0.3s ease;
                }

                .step.active {
                    opacity: 1;
                }

                .step.completed {
                    opacity: 0.8;
                }

                .step-number {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #e5e7eb;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    margin-bottom: 4px;
                    transition: all 0.3s ease;
                    font-size: 12px;
                }

                .step.active .step-number {
                    background: #3b82f6;
                    color: white;
                }

                .step.completed .step-number {
                    background: #10b981;
                    color: white;
                }

                .step-label {
                    font-size: 10px;
                    font-weight: 500;
                    color: #6b7280;
                }

                /* Cards */
                .card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    padding: 16px;
                    margin-bottom: 12px;
                }

                .card-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #111827;
                }

                /* Info boxes */
                .info-box {
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 12px;
                    display: flex;
                    gap: 6px;
                    font-size: 13px;
                }

                .info-primary {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    color: #1d4ed8;
                }

                .info-tip {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #15803d;
                }

                /* Options d'organisation */
                .organization-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .option-group {
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 16px;
                    transition: border-color 0.2s ease;
                }

                .option-group:hover {
                    border-color: #3b82f6;
                }

                .option-label {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    cursor: pointer;
                    margin: 0;
                }

                .option-label input[type="radio"] {
                    margin-top: 2px;
                    flex-shrink: 0;
                }

                .option-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .option-content strong {
                    font-size: 14px;
                    color: #111827;
                }

                .option-content span {
                    font-size: 12px;
                    color: #6b7280;
                }

                /* Formulaires */
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .form-section {
                    margin-bottom: 20px;
                }

                .form-section h4 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .form-group label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #374151;
                }

                .form-group input[type="date"],
                .form-group input[type="text"] {
                    padding: 6px 10px;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    font-size: 13px;
                    transition: border-color 0.2s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .help-text {
                    font-size: 11px;
                    color: #6b7280;
                    margin-top: 2px;
                }

                /* Boutons */
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    text-decoration: none;
                }

                .btn-sm {
                    padding: 6px 12px;
                    font-size: 12px;
                }

                .btn-large {
                    padding: 12px 20px;
                    font-size: 14px;
                    flex-direction: column;
                    gap: 4px;
                }

                .btn-subtitle {
                    font-size: 11px;
                    opacity: 0.9;
                    font-weight: 400;
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

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Progression d'analyse */
                .analysis-progress {
                    text-align: center;
                }

                .current-action {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e5e7eb;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .spinner.small {
                    width: 20px;
                    height: 20px;
                    border-width: 2px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .progress-section {
                    margin-bottom: 32px;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-weight: 600;
                }

                .progress {
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    background: #3b82f6;
                    transition: width 0.3s ease;
                }

                .analysis-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    text-align: left;
                }

                .analysis-step {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .analysis-step i {
                    width: 20px;
                    text-align: center;
                }

                .analysis-step i.pending {
                    color: #6b7280;
                }

                .analysis-step i.active {
                    color: #3b82f6;
                }

                .analysis-step i.completed {
                    color: #10b981;
                }

                .step-status {
                    margin-left: auto;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                .step-status.pending {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .step-status.active {
                    background: #dbeafe;
                    color: #3b82f6;
                }

                .step-status.completed {
                    background: #d1fae5;
                    color: #10b981;
                }

                /* Statistiques */
                .stats-section {
                    margin-bottom: 20px;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .stat {
                    text-align: center;
                }

                .stat-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                }

                .stat-label {
                    font-size: 12px;
                    color: #6b7280;
                }

                /* Section de contrôles */
                .controls-section {
                    margin-bottom: 20px;
                }

                .controls-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .controls-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .controls-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                }

                /* Structure hiérarchique */
                .hierarchy-section {
                    margin-bottom: 20px;
                }

                .hierarchy-container {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    max-height: 500px;
                    overflow-y: auto;
                    background: white;
                }

                .domain-group {
                    border-bottom: 1px solid #f3f4f6;
                }

                .domain-group:last-child {
                    border-bottom: none;
                }

                .domain-header {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    position: relative;
                }

                .domain-header:hover {
                    background: #f9fafb;
                }

                .domain-header.expanded {
                    background: #f0f9ff;
                    border-bottom: 1px solid #e0f2fe;
                }

                .domain-toggle {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 8px;
                    color: #6b7280;
                    transition: transform 0.2s ease;
                }

                .domain-toggle.expanded {
                    transform: rotate(90deg);
                }

                .domain-info {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .domain-name {
                    font-weight: 600;
                    color: #111827;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .domain-icon {
                    width: 16px;
                    height: 16px;
                    background: #3b82f6;
                    border-radius: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 10px;
                }

                .email-count {
                    background: #dbeafe;
                    color: #1d4ed8;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .domain-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .folder-preview {
                    font-size: 12px;
                    color: #6b7280;
                    padding: 4px 8px;
                    background: #f3f4f6;
                    border-radius: 4px;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .action-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 600;
                    text-align: center;
                }

                .action-new {
                    background: #d1fae5;
                    color: #065f46;
                }

                .action-existing {
                    background: #e0e7ff;
                    color: #3730a3;
                }

                .domain-checkbox {
                    margin-left: 8px;
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }

                /* Détails du domaine */
                .domain-details {
                    padding: 0 16px 16px 44px;
                    background: #fafbfb;
                    border-top: 1px solid #e0f2fe;
                    display: none;
                }

                .domain-details.expanded {
                    display: block;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .detail-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .detail-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .folder-input {
                    padding: 8px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 13px;
                    transition: border-color 0.2s ease;
                    background: white;
                }

                .folder-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .folder-select {
                    padding: 8px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 13px;
                    background: white;
                    cursor: pointer;
                }

                .email-samples {
                    margin-top: 12px;
                }

                .email-samples h5 {
                    margin: 0 0 8px 0;
                    font-size: 12px;
                    font-weight: 600;
                    color: #374151;
                }

                .sample-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .sample-item {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    padding: 8px;
                    font-size: 11px;
                }

                .sample-from {
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 2px;
                }

                .sample-subject {
                    color: #6b7280;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* Sections d'action */
                .action-section {
                    border-top: 1px solid #e5e7eb;
                    padding-top: 16px;
                }

                .options-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    gap: 16px;
                }

                .checkbox-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .checkbox-group input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }

                .checkbox-group label {
                    cursor: pointer;
                    font-size: 14px;
                }

                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                }

                /* Section de confirmation */
                .confirmation-section {
                    margin: 16px 0;
                }

                .summary-preview {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-top: 8px;
                }

                .summary-preview .summary-item {
                    font-size: 13px;
                    color: #92400e;
                }

                /* Avertissements */
                .warning-box {
                    background: #fef3c7;
                    border: 1px solid #f59e0b;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                    display: flex;
                    gap: 12px;
                }

                .warning-icon {
                    flex-shrink: 0;
                    width: 32px;
                    height: 32px;
                    background: #3b82f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                }

                .warning-content h3 {
                    margin: 0 0 8px 0;
                    color: #92400e;
                    font-size: 16px;
                }

                /* Exécution */
                .execution-progress {
                    text-align: center;
                }

                .current-domain {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .domain-icon {
                    width: 40px;
                    height: 40px;
                    background: #3b82f6;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                }

                .domain-info {
                    flex: 1;
                    text-align: left;
                }

                .domain-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                }

                .domain-action {
                    font-size: 13px;
                    color: #6b7280;
                }

                .overall-progress {
                    margin-bottom: 20px;
                }

                .execution-log {
                    text-align: left;
                }

                .execution-log h4 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    color: #374151;
                }

                .log-container {
                    max-height: 200px;
                    overflow-y: auto;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 12px;
                }

                .log-entry {
                    padding: 4px 0;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .log-entry.success {
                    color: #10b981;
                }

                .log-entry.error {
                    color: #dc2626;
                }

                .log-entry.info {
                    color: #6b7280;
                }

                /* Résultats finaux */
                .success-summary {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .success-icon {
                    width: 60px;
                    height: 60px;
                    background: #10b981;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                    margin: 0 auto 12px auto;
                }

                .success-content h3 {
                    font-size: 20px;
                    color: #111827;
                    margin: 0 0 6px 0;
                }

                .success-content p {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 0;
                }

                .final-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .final-stat {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #f0fdf4;
                    border-radius: 8px;
                }

                .stat-icon.success {
                    background: #10b981;
                    color: white;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .container {
                        margin: 16px auto;
                        padding: 0 12px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-row {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }

                    .controls-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .controls-actions {
                        justify-content: space-between;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                    }

                    .action-buttons {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .final-stats {
                        grid-template-columns: 1fr;
                    }

                    .domain-details {
                        padding: 0 12px 12px 32px;
                    }
                }

                /* Animations */
                .domain-group {
                    transition: all 0.2s ease;
                }

                .domain-details {
                    transition: all 0.3s ease;
                }

                .folder-input, .folder-select {
                    transition: all 0.2s ease;
                }

                .domain-header {
                    transition: all 0.2s ease;
                }
            </style>
        `;
    }

    /**
     * Initialise la page et les event listeners
     */
    async initializePage() {
        console.log('[DomainOrganizer] Initializing page v4.0...');
        
        // Vérifier l'authentification
        if (!window.authService?.isAuthenticated()) {
            window.uiManager?.showToast('Veuillez vous connecter pour utiliser cette fonctionnalité', 'warning');
            return false;
        }
        
        // Attendre un peu que le DOM soit complètement rendu
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Configurer les event listeners
        this.setupEventListeners();
        
        // Définir les dates par défaut
        this.setDefaultDates();
        
        // Forcer l'affichage de l'étape de configuration
        this.forceShowConfigStep();
        
        return true;
    }

    /**
     * Force l'affichage de l'étape de configuration
     */
    forceShowConfigStep() {
        console.log('[DomainOrganizer] Forcing display of config step...');
        
        // Cacher toutes les étapes
        document.querySelectorAll('.step-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Afficher configStep spécifiquement
        const configStep = document.getElementById('configStep');
        if (configStep) {
            configStep.style.display = 'block';
            this.currentStep = 'configure';
            
            // Mettre à jour l'indicateur d'étapes
            document.querySelectorAll('.step').forEach(step => {
                step.classList.remove('active', 'completed');
                if (step.dataset.step === 'configure') {
                    step.classList.add('active');
                }
            });
            
            console.log('[DomainOrganizer] ✅ Configuration step is now visible');
        } else {
            console.error('[DomainOrganizer] ❌ configStep element not found in DOM');
        }
    }

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
        // Formulaire principal
        const form = document.getElementById('organizeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => this.handleSelectAll(e));
        }

        // Confirmation finale
        const finalConfirmation = document.getElementById('finalConfirmation');
        if (finalConfirmation) {
            finalConfirmation.addEventListener('change', (e) => {
                const executeBtn = document.getElementById('executeBtn');
                if (executeBtn) {
                    executeBtn.disabled = !e.target.checked;
                }
            });
        }
    }

    /**
     * Définit les dates par défaut
     */
    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.valueAsDate = thirtyDaysAgo;
        if (endDateInput) endDateInput.valueAsDate = today;
    }

    /**
     * Affiche une étape spécifique
     */
    showStep(stepName) {
        console.log(`[DomainOrganizer] Showing step: ${stepName}`);
        
        // Mettre à jour l'indicateur d'étapes
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
            if (step.dataset.step === stepName) {
                step.classList.add('active');
            } else if (this.isStepCompleted(step.dataset.step, stepName)) {
                step.classList.add('completed');
            }
        });

        // Cacher toutes les étapes
        document.querySelectorAll('.step-content').forEach(content => {
            content.style.display = 'none';
        });

        // Afficher l'étape active
        const stepId = `${stepName}Step`;
        const activeStep = document.getElementById(stepId);
        if (activeStep) {
            activeStep.style.display = 'block';
            console.log(`[DomainOrganizer] ✅ Step ${stepName} displayed`);
        } else {
            console.error(`[DomainOrganizer] ❌ Step element not found: ${stepId}`);
        }

        this.currentStep = stepName;
    }

    /**
     * Vérifie si une étape est complétée
     */
    isStepCompleted(stepName, currentStep) {
        const steps = ['configure', 'analyze', 'review', 'execute'];
        const stepIndex = steps.indexOf(stepName);
        const currentIndex = steps.indexOf(currentStep);
        return stepIndex < currentIndex;
    }

    /**
     * Gère la soumission du formulaire
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
        // Récupérer les données du formulaire
        const formData = this.getFormData();
        if (!formData.startDate && !formData.endDate) {
            window.uiManager?.showToast('Veuillez sélectionner au moins une date', 'warning');
            return;
        }
        
        await this.startAnalysis(formData);
    }

    /**
     * Récupère les données du formulaire
     */
    getFormData() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const organizationType = document.querySelector('input[name="organizationType"]:checked')?.value || 'hierarchical';
        const excludeDomains = document.getElementById('excludeDomains').value
            .split(',')
            .map(d => d.trim())
            .filter(d => d);
        const excludeEmails = document.getElementById('excludeEmails').value
            .split(',')
            .map(e => e.trim())
            .filter(e => e);
        
        return { startDate, endDate, organizationType, excludeDomains, excludeEmails };
    }

    /**
     * Lance l'analyse
     */
    async startAnalysis(formData) {
        try {
            this.isProcessing = true;
            this.showStep('analyze');
            
            // Configurer le module
            this.configure({
                excludeDomains: formData.excludeDomains,
                excludeEmails: formData.excludeEmails,
                organizationType: formData.organizationType,
                onProgress: (progress) => this.updateAnalysisProgress(progress)
            });
            
            // Lancer l'analyse
            const results = await this.analyzeEmails({
                startDate: formData.startDate,
                endDate: formData.endDate,
                folders: ['inbox']
            });
            
            this.currentAnalysis = results;
            this.showHierarchicalResults(results);
            
        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            this.resetForm();
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Met à jour la progression de l'analyse
     */
    updateAnalysisProgress(progress) {
        // Mettre à jour la barre de progression
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const progressLabel = document.getElementById('progressLabel');
        const currentActionText = document.getElementById('currentActionText');
        
        if (progressBar) progressBar.style.width = `${progress.percent}%`;
        if (progressPercent) progressPercent.textContent = `${progress.percent}%`;
        if (progressLabel) progressLabel.textContent = progress.stage || 'Analyse';
        if (currentActionText) currentActionText.textContent = progress.message || 'Analyse en cours...';
        
        // Mettre à jour les étapes
        this.updateAnalysisSteps(progress.stage);
    }

    /**
     * Met à jour les étapes d'analyse
     */
    updateAnalysisSteps(currentStage) {
        const stageMapping = {
            'Chargement des dossiers': 'step-folders',
            'Récupération des emails': 'step-emails', 
            'Analyse des domaines': 'step-domains',
            'Structure proposée': 'step-structure'
        };
        
        const currentStepId = stageMapping[currentStage];
        
        Object.entries(stageMapping).forEach(([stage, stepId]) => {
            const stepElement = document.getElementById(stepId);
            if (!stepElement) return;
            
            const icon = stepElement.querySelector('i');
            const status = stepElement.querySelector('.step-status');
            
            if (stage === currentStage) {
                icon.className = 'fas fa-spinner fa-spin active';
                status.textContent = 'En cours';
                status.className = 'step-status active';
            } else if (this.isStageCompleted(stage, currentStage)) {
                icon.className = 'fas fa-check completed';
                status.textContent = 'Terminé';
                status.className = 'step-status completed';
            }
        });
    }

    /**
     * Vérifie si une étape est terminée
     */
    isStageCompleted(stage, currentStage) {
        const stages = [
            'Chargement des dossiers',
            'Récupération des emails',
            'Analyse des domaines',
            'Structure proposée'
        ];
        
        const stageIndex = stages.indexOf(stage);
        const currentIndex = stages.indexOf(currentStage);
        return stageIndex < currentIndex;
    }

    /**
     * Affiche les résultats hiérarchiques
     */
    showHierarchicalResults(results) {
        // Mettre à jour les statistiques
        document.getElementById('statEmails').textContent = results.totalEmails.toLocaleString();
        document.getElementById('statDomains').textContent = results.totalDomains;
        document.getElementById('statFolders').textContent = results.totalFolders || results.totalDomains;
        document.getElementById('statNew').textContent = results.domainsToCreate;
        
        // Générer la structure hiérarchique
        this.generateHierarchicalView(results.domains);
        
        // Préparer les actions
        this.prepareActions();
        
        // Mettre à jour le résumé
        this.updateActionSummary();
        
        // Passer à l'étape de révision
        this.showStep('review');
    }

    /**
     * Génère la vue hiérarchique
     */
    generateHierarchicalView(domains) {
        const container = document.getElementById('hierarchyContainer');
        const fallbackTable = document.getElementById('fallbackTable');
        
        if (!container) {
            console.warn('[DomainOrganizer] hierarchyContainer not found, using fallback');
            this.generateFallbackTable(domains);
            return;
        }
        
        container.innerHTML = '';
        
        // Vérifier si nous devons utiliser la vue hiérarchique ou le tableau
        const organizationType = this.organizationType || 'hierarchical';
        
        if (organizationType === 'flat' || domains.length > 50) {
            // Utiliser le tableau pour de nombreux domaines ou organisation plate
            this.generateFallbackTable(domains);
            if (fallbackTable) fallbackTable.style.display = 'block';
            container.style.display = 'none';
            return;
        }
        
        // Afficher la vue hiérarchique
        if (fallbackTable) fallbackTable.style.display = 'none';
        container.style.display = 'block';
        
        // Trier les domaines par nombre d'emails (décroissant)
        const sortedDomains = [...domains].sort((a, b) => b.count - a.count);
        
        sortedDomains.forEach((domain, index) => {
            const domainElement = this.createDomainElement(domain, index);
            container.appendChild(domainElement);
        });
    }

    /**
     * Génère le tableau de fallback
     */
    generateFallbackTable(domains) {
        const tbody = document.getElementById('resultsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        domains.forEach((domain, index) => {
            const row = this.createDomainRow(domain, index);
            tbody.appendChild(row);
        });
    }

    /**
     * Crée une ligne de domaine pour le tableau
     */
    createDomainRow(domainData, index) {
        const row = document.createElement('tr');
        row.dataset.domain = domainData.domain;
        
        const isNewFolder = domainData.action === 'create-new';
        const existingFolders = Array.from(this.existingFolders.values());
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" checked>
            </td>
            <td>
                <div class="domain-name">
                    <i class="fas fa-at" style="color: #6b7280; font-size: 12px;"></i>
                    ${domainData.domain}
                </div>
            </td>
            <td>
                <span class="email-count">${domainData.count}</span>
            </td>
            <td>
                ${isNewFolder ? 
                    `<input type="text" class="folder-select" value="${domainData.suggestedFolder}" 
                            data-domain="${domainData.domain}">` :
                    this.createFolderSelect(domainData, existingFolders)
                }
            </td>
            <td>
                <span class="action-badge ${isNewFolder ? 'action-new' : 'action-existing'}">
                    ${isNewFolder ? 'Nouveau' : 'Existant'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="window.domainOrganizer.showEmailPreview('${domainData.domain}')" title="Voir les emails">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        // Event listeners
        const checkbox = row.querySelector('.domain-checkbox');
        checkbox.addEventListener('change', (e) => this.handleDomainToggle(e));
        
        const folderInput = row.querySelector('.folder-select, input[type="text"]');
        if (folderInput) {
            folderInput.addEventListener('change', (e) => this.handleFolderChange(e));
        }
        
        return row;
    }

    /**
     * Crée un élément de domaine
     */
    createDomainElement(domainData, index) {
        const domainGroup = document.createElement('div');
        domainGroup.className = 'domain-group';
        domainGroup.dataset.domain = domainData.domain;
        
        const isExpanded = this.expandedDomains.has(domainData.domain);
        const isNewFolder = domainData.action === 'create-new';
        
        domainGroup.innerHTML = `
            <div class="domain-header ${isExpanded ? 'expanded' : ''}" onclick="window.domainOrganizer.toggleDomain('${domainData.domain}')">
                <div class="domain-toggle ${isExpanded ? 'expanded' : ''}">
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="domain-info">
                    <div class="domain-name">
                        <div class="domain-icon">
                            <i class="fas fa-at"></i>
                        </div>
                        ${domainData.domain}
                    </div>
                    <span class="email-count">${domainData.count}</span>
                </div>
                <div class="domain-actions">
                    <div class="folder-preview">${domainData.suggestedFolder}</div>
                    <span class="action-badge ${isNewFolder ? 'action-new' : 'action-existing'}">
                        ${isNewFolder ? 'Nouveau' : 'Existant'}
                    </span>
                    <input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" 
                           onclick="event.stopPropagation(); window.domainOrganizer.handleDomainToggle(event)" checked>
                </div>
            </div>
            <div class="domain-details ${isExpanded ? 'expanded' : ''}" id="details-${domainData.domain}">
                ${this.generateDomainDetails(domainData)}
            </div>
        `;
        
        return domainGroup;
    }

    /**
     * Génère les détails d'un domaine
     */
    generateDomainDetails(domainData) {
        const existingFolders = Array.from(this.existingFolders.values());
        const isNewFolder = domainData.action === 'create-new';
        const allEmails = this.emailsByDomain.get(domainData.domain) || [];
        
        return `
            <div class="details-grid">
                <div class="detail-group">
                    <label class="detail-label">
                        <i class="fas fa-folder"></i>
                        Dossier de destination
                    </label>
                    ${isNewFolder ? 
                        `<input type="text" class="folder-input" value="${domainData.suggestedFolder}" 
                                data-domain="${domainData.domain}" onchange="window.domainOrganizer.handleFolderChange(event)">` :
                        this.createFolderSelect(domainData, existingFolders)
                    }
                </div>
                <div class="detail-group">
                    <label class="detail-label">
                        <i class="fas fa-info-circle"></i>
                        Type d'action
                    </label>
                    <select class="folder-select" data-domain="${domainData.domain}" onchange="window.domainOrganizer.handleActionTypeChange(event)">
                        <option value="create-new" ${isNewFolder ? 'selected' : ''}>Créer nouveau dossier</option>
                        <option value="move-existing" ${!isNewFolder ? 'selected' : ''}>Utiliser dossier existant</option>
                    </select>
                </div>
            </div>
            
            <div class="email-management">
                <div class="emails-header">
                    <h5>
                        <i class="fas fa-envelope"></i> 
                        Emails (${allEmails.length} au total)
                    </h5>
                    <div class="email-controls">
                        <button class="btn btn-sm btn-secondary" onclick="window.domainOrganizer.selectAllEmailsInDomain('${domainData.domain}')">
                            <i class="fas fa-check-square"></i> Tout sélectionner
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="window.domainOrganizer.deselectAllEmailsInDomain('${domainData.domain}')">
                            <i class="fas fa-square"></i> Tout désélectionner
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="window.domainOrganizer.showAllEmails('${domainData.domain}')">
                            <i class="fas fa-list"></i> Voir tous (${allEmails.length})
                        </button>
                    </div>
                </div>
                
                <div class="email-samples">
                    <div class="sample-list" id="emails-${domainData.domain}">
                        ${this.renderEmailList(domainData.domain, allEmails.slice(0, 5))}
                    </div>
                    ${allEmails.length > 5 ? `
                        <div class="load-more">
                            <button class="btn btn-sm btn-secondary" onclick="window.domainOrganizer.loadMoreEmails('${domainData.domain}')">
                                <i class="fas fa-chevron-down"></i>
                                Voir plus (${allEmails.length - 5} emails restants)
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Rend la liste des emails
     */
    renderEmailList(domain, emails) {
        return emails.map((email, index) => {
            const emailId = email.id || `email-${domain}-${index}`;
            const isSelected = this.isEmailSelected(domain, emailId);
            
            return `
                <div class="email-item ${isSelected ? 'selected' : ''}" data-email-id="${emailId}">
                    <div class="email-checkbox-container">
                        <input type="checkbox" 
                               class="email-checkbox" 
                               data-domain="${domain}" 
                               data-email-id="${emailId}"
                               ${isSelected ? 'checked' : ''}
                               onchange="window.domainOrganizer.handleEmailToggle(event)">
                    </div>
                    <div class="email-content" onclick="window.domainOrganizer.toggleEmailSelection('${domain}', '${emailId}')">
                        <div class="email-header">
                            <span class="email-from">${email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Expéditeur inconnu'}</span>
                            <span class="email-date">${this.formatEmailDate(email.receivedDateTime)}</span>
                        </div>
                        <div class="email-subject">${email.subject || 'Sans sujet'}</div>
                        <div class="email-preview">${this.getEmailPreview(email)}</div>
                    </div>
                    <div class="email-actions">
                        <select class="email-folder-select" 
                                data-domain="${domain}" 
                                data-email-id="${emailId}"
                                onchange="window.domainOrganizer.handleIndividualEmailFolderChange(event)"
                                onclick="event.stopPropagation()">
                            <option value="default">Dossier par défaut</option>
                            ${this.generateFolderOptionsForEmail(domain)}
                        </select>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Génère les options de dossiers pour un email individuel
     */
    generateFolderOptionsForEmail(domain) {
        const existingFolders = Array.from(this.existingFolders.values());
        const domainAction = this.selectedActions.get(domain);
        
        let options = '';
        
        // Option par défaut (dossier du domaine)
        if (domainAction) {
            options += `<option value="domain-default" selected>📁 ${domainAction.targetFolder}</option>`;
        }
        
        // Dossiers existants
        existingFolders.forEach(folder => {
            options += `<option value="${folder.id}">📂 ${folder.displayName}</option>`;
        });
        
        // Option pour nouveau dossier
        options += `<option value="custom">➕ Nouveau dossier...</option>`;
        
        return options;
    }

    /**
     * Affiche tous les emails d'un domaine dans une modale
     */
    showAllEmails(domain) {
        const allEmails = this.emailsByDomain.get(domain) || [];
        const domainData = this.domainAnalysis.get(domain);
        
        // Créer une modale pour tous les emails
        this.createAllEmailsModal(domain, domainData, allEmails);
    }

    /**
     * Crée une modale pour afficher tous les emails
     */
    createAllEmailsModal(domain, domainData, allEmails) {
        // Supprimer toute modale existante
        const existingModal = document.getElementById('allEmailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'allEmailsModal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content large-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>
                            <i class="fas fa-at"></i>
                            Tous les emails de ${domain}
                        </h3>
                        <div class="modal-controls">
                            <button class="btn btn-sm btn-secondary" onclick="window.domainOrganizer.selectAllEmailsInModal('${domain}')">
                                <i class="fas fa-check-square"></i> Tout sélectionner
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="window.domainOrganizer.deselectAllEmailsInModal('${domain}')">
                                <i class="fas fa-square"></i> Tout désélectionner
                            </button>
                            <button class="modal-close" onclick="this.closest('#allEmailsModal').remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div class="emails-stats">
                            <span><strong>${allEmails.length}</strong> emails au total</span>
                            <span>Dossier proposé: <strong>${domainData.suggestedFolder}</strong></span>
                            <span id="selectedCount-${domain}">
                                <strong>${this.getSelectedEmailsCount(domain)}</strong> sélectionnés
                            </span>
                        </div>
                        
                        <div class="all-emails-list" id="allEmailsList-${domain}">
                            ${this.renderEmailList(domain, allEmails)}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('#allEmailsModal').remove()">
                            Fermer
                        </button>
                        <button class="btn btn-primary" onclick="window.domainOrganizer.applyEmailSelections('${domain}')">
                            <i class="fas fa-check"></i>
                            Appliquer les sélections
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter les styles étendus
        this.addExtendedModalStyles();
        
        document.body.appendChild(modal);
    }

    /**
     * Ajoute les styles étendus pour les modales
     */
    addExtendedModalStyles() {
        if (document.getElementById('extendedModalStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'extendedModalStyles';
        style.textContent = `
            .large-modal {
                max-width: 90vw;
                max-height: 90vh;
                width: 1000px;
            }
            
            .modal-controls {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .emails-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
                padding: 12px;
                background: #f8fafc;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .all-emails-list {
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .email-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                margin-bottom: 8px;
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .email-item:hover {
                background: #f9fafb;
                border-color: #d1d5db;
            }
            
            .email-item.selected {
                background: #eff6ff;
                border-color: #3b82f6;
            }
            
            .email-checkbox-container {
                display: flex;
                align-items: flex-start;
                padding-top: 2px;
            }
            
            .email-checkbox {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
            
            .email-content {
                flex: 1;
                min-width: 0;
            }
            
            .email-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
            }
            
            .email-from {
                font-weight: 600;
                color: #111827;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 200px;
            }
            
            .email-date {
                font-size: 12px;
                color: #6b7280;
                flex-shrink: 0;
            }
            
            .email-subject {
                font-weight: 500;
                color: #374151;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .email-preview {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.3;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            .email-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-width: 150px;
            }
            
            .email-folder-select {
                padding: 4px 8px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 12px;
                background: white;
                cursor: pointer;
            }
            
            .load-more {
                text-align: center;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #e5e7eb;
            }
            
            .email-management {
                margin-top: 16px;
            }
            
            .emails-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                flex-wrap: wrap;
                gap: 12px;
            }
            
            .emails-header h5 {
                margin: 0;
                font-size: 14px;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .email-controls {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Formate la date d'un email
     */
    formatEmailDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
        
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    /**
     * Obtient un aperçu du contenu de l'email
     */
    getEmailPreview(email) {
        if (email.bodyPreview) {
            return email.bodyPreview.substring(0, 150) + '...';
        }
        return 'Aucun aperçu disponible';
    }

    /**
     * Vérifie si un email est sélectionné
     */
    isEmailSelected(domain, emailId) {
        if (!this.selectedEmails) {
            this.selectedEmails = new Map();
        }
        
        if (!this.selectedEmails.has(domain)) {
            this.selectedEmails.set(domain, new Set());
        }
        
        return this.selectedEmails.get(domain).has(emailId);
    }

    /**
     * Gère la sélection d'un email individuel
     */
    handleEmailToggle(event) {
        const domain = event.target.dataset.domain;
        const emailId = event.target.dataset.emailId;
        const isChecked = event.target.checked;
        
        this.toggleEmailSelection(domain, emailId, isChecked);
    }

    /**
     * Toggle la sélection d'un email
     */
    toggleEmailSelection(domain, emailId, forceState = null) {
        if (!this.selectedEmails) {
            this.selectedEmails = new Map();
        }
        
        if (!this.selectedEmails.has(domain)) {
            this.selectedEmails.set(domain, new Set());
        }
        
        const domainEmails = this.selectedEmails.get(domain);
        const shouldSelect = forceState !== null ? forceState : !domainEmails.has(emailId);
        
        if (shouldSelect) {
            domainEmails.add(emailId);
        } else {
            domainEmails.delete(emailId);
        }
        
        // Mettre à jour l'interface
        this.updateEmailSelectionUI(domain, emailId, shouldSelect);
        this.updateEmailSelectionCount(domain);
    }

    /**
     * Met à jour l'interface de sélection d'un email
     */
    updateEmailSelectionUI(domain, emailId, isSelected) {
        // Mettre à jour la checkbox
        const checkbox = document.querySelector(`input[data-email-id="${emailId}"]`);
        if (checkbox) {
            checkbox.checked = isSelected;
        }
        
        // Mettre à jour l'apparence de l'item
        const emailItem = document.querySelector(`[data-email-id="${emailId}"]`);
        if (emailItem) {
            if (isSelected) {
                emailItem.classList.add('selected');
            } else {
                emailItem.classList.remove('selected');
            }
        }
    }

    /**
     * Met à jour le compteur d'emails sélectionnés
     */
    updateEmailSelectionCount(domain) {
        const count = this.getSelectedEmailsCount(domain);
        const counter = document.getElementById(`selectedCount-${domain}`);
        if (counter) {
            counter.innerHTML = `<strong>${count}</strong> sélectionnés`;
        }
    }

    /**
     * Obtient le nombre d'emails sélectionnés pour un domaine
     */
    getSelectedEmailsCount(domain) {
        if (!this.selectedEmails || !this.selectedEmails.has(domain)) {
            return 0;
        }
        return this.selectedEmails.get(domain).size;
    }

    /**
     * Sélectionne tous les emails d'un domaine
     */
    selectAllEmailsInDomain(domain) {
        const allEmails = this.emailsByDomain.get(domain) || [];
        allEmails.forEach(email => {
            const emailId = email.id || `email-${domain}-${allEmails.indexOf(email)}`;
            this.toggleEmailSelection(domain, emailId, true);
        });
    }

    /**
     * Désélectionne tous les emails d'un domaine
     */
    deselectAllEmailsInDomain(domain) {
        if (this.selectedEmails && this.selectedEmails.has(domain)) {
            const emailIds = Array.from(this.selectedEmails.get(domain));
            emailIds.forEach(emailId => {
                this.toggleEmailSelection(domain, emailId, false);
            });
        }
    }

    /**
     * Sélectionne tous les emails dans la modale
     */
    selectAllEmailsInModal(domain) {
        this.selectAllEmailsInDomain(domain);
    }

    /**
     * Désélectionne tous les emails dans la modale
     */
    deselectAllEmailsInModal(domain) {
        this.deselectAllEmailsInDomain(domain);
    }

    /**
     * Applique les sélections d'emails
     */
    applyEmailSelections(domain) {
        const selectedCount = this.getSelectedEmailsCount(domain);
        const totalCount = (this.emailsByDomain.get(domain) || []).length;
        
        // Mettre à jour l'action du domaine
        if (this.selectedActions.has(domain)) {
            const action = this.selectedActions.get(domain);
            action.selectedEmailsCount = selectedCount;
            action.emailCount = selectedCount; // Utiliser seulement les emails sélectionnés
        }
        
        // Fermer la modale
        document.getElementById('allEmailsModal')?.remove();
        
        // Mettre à jour le résumé
        this.updateActionSummary();
        
        // Afficher un message de confirmation
        window.uiManager?.showToast(
            `${selectedCount} emails sélectionnés sur ${totalCount} pour ${domain}`, 
            'success'
        );
    }

    /**
     * Gère le changement de dossier pour un email individuel
     */
    handleIndividualEmailFolderChange(event) {
        const domain = event.target.dataset.domain;
        const emailId = event.target.dataset.emailId;
        const selectedValue = event.target.value;
        
        if (selectedValue === 'custom') {
            const newFolderName = prompt('Nom du nouveau dossier:');
            if (newFolderName) {
                this.setEmailCustomFolder(domain, emailId, newFolderName);
            } else {
                // Remettre la valeur par défaut si annulé
                event.target.value = 'default';
            }
        } else {
            this.setEmailFolder(domain, emailId, selectedValue);
        }
    }

    /**
     * Définit un dossier personnalisé pour un email
     */
    setEmailCustomFolder(domain, emailId, folderName) {
        if (!this.individualEmailFolders) {
            this.individualEmailFolders = new Map();
        }
        
        this.individualEmailFolders.set(`${domain}-${emailId}`, {
            type: 'custom',
            folderName: folderName
        });
        
        window.uiManager?.showToast(`Email configuré pour aller dans "${folderName}"`, 'success');
    }

    /**
     * Définit le dossier pour un email individuel
     */
    setEmailFolder(domain, emailId, folderId) {
        if (!this.individualEmailFolders) {
            this.individualEmailFolders = new Map();
        }
        
        if (folderId === 'default' || folderId === 'domain-default') {
            // Supprimer la configuration individuelle
            this.individualEmailFolders.delete(`${domain}-${emailId}`);
        } else {
            // Configurer le dossier spécifique
            const folder = this.existingFolders.get(folderId) || 
                          Array.from(this.existingFolders.values()).find(f => f.id === folderId);
            
            if (folder) {
                this.individualEmailFolders.set(`${domain}-${emailId}`, {
                    type: 'existing',
                    folderId: folderId,
                    folderName: folder.displayName
                });
            }
        }
    }

    /**
     * Charge plus d'emails pour un domaine
     */
    loadMoreEmails(domain) {
        const allEmails = this.emailsByDomain.get(domain) || [];
        const container = document.getElementById(`emails-${domain}`);
        if (!container) return;
        
        // Remplacer tout le contenu par tous les emails
        container.innerHTML = this.renderEmailList(domain, allEmails);
        
        // Supprimer le bouton "Voir plus"
        const loadMoreButton = container.parentElement.querySelector('.load-more');
        if (loadMoreButton) {
            loadMoreButton.remove();
        }
    }

    /**
     * Crée un select de dossiers pour les dossiers existants
     */
    createFolderSelect(domainData, existingFolders) {
        const options = existingFolders.map(folder => 
            `<option value="${folder.id}" ${folder.displayName === domainData.suggestedFolder ? 'selected' : ''}>
                ${folder.displayName}
            </option>`
        ).join('');
        
        return `<select class="folder-select" data-domain="${domainData.domain}" onchange="window.domainOrganizer.handleFolderChange(event)">${options}</select>`;
    }

    /**
     * Toggle l'expansion d'un domaine
     */
    toggleDomain(domain) {
        const domainGroup = document.querySelector(`[data-domain="${domain}"]`);
        const domainHeader = domainGroup.querySelector('.domain-header');
        const domainToggle = domainGroup.querySelector('.domain-toggle');
        const domainDetails = domainGroup.querySelector('.domain-details');
        
        const isExpanded = this.expandedDomains.has(domain);
        
        if (isExpanded) {
            // Replier
            this.expandedDomains.delete(domain);
            domainHeader.classList.remove('expanded');
            domainToggle.classList.remove('expanded');
            domainDetails.classList.remove('expanded');
            domainDetails.style.display = 'none';
        } else {
            // Déplier
            this.expandedDomains.add(domain);
            domainHeader.classList.add('expanded');
            domainToggle.classList.add('expanded');
            domainDetails.classList.add('expanded');
            domainDetails.style.display = 'block';
        }
    }

    /**
     * Déplier tous les domaines
     */
    expandAll() {
        const domains = Array.from(this.domainAnalysis.keys());
        domains.forEach(domain => {
            if (!this.expandedDomains.has(domain)) {
                this.toggleDomain(domain);
            }
        });
    }

    /**
     * Replier tous les domaines
     */
    collapseAll() {
        const domains = Array.from(this.expandedDomains);
        domains.forEach(domain => {
            this.toggleDomain(domain);
        });
    }

    /**
     * Gère le changement de type d'action
     */
    handleActionTypeChange(event) {
        const domain = event.target.dataset.domain;
        const actionType = event.target.value;
        
        if (!this.selectedActions.has(domain)) return;
        
        const action = this.selectedActions.get(domain);
        action.action = actionType;
        
        // Mettre à jour l'interface
        this.updateDomainDetailsInterface(domain, actionType);
        this.updateActionSummary();
    }

    /**
     * Met à jour l'interface des détails du domaine
     */
    updateDomainDetailsInterface(domain, actionType) {
        const detailsContainer = document.getElementById(`details-${domain}`);
        if (!detailsContainer) return;
        
        const domainData = this.domainAnalysis.get(domain);
        if (!domainData) return;
        
        // Mettre à jour le contenu
        detailsContainer.innerHTML = this.generateDomainDetails({
            ...domainData,
            action: actionType
        });
        
        // Mettre à jour le badge dans l'en-tête
        const domainGroup = document.querySelector(`[data-domain="${domain}"]`);
        const badge = domainGroup.querySelector('.action-badge');
        if (badge) {
            const isNew = actionType === 'create-new';
            badge.className = `action-badge ${isNew ? 'action-new' : 'action-existing'}`;
            badge.textContent = isNew ? 'Nouveau' : 'Existant';
        }
        
        // Mettre à jour l'aperçu du dossier
        const preview = domainGroup.querySelector('.folder-preview');
        if (preview && actionType === 'create-new') {
            preview.textContent = domainData.suggestedFolder;
        }
    }

    /**
     * Gère le changement de dossier
     */
    handleFolderChange(event) {
        const domain = event.target.dataset.domain;
        const value = event.target.value;
        
        if (!this.selectedActions.has(domain)) return;
        
        const action = this.selectedActions.get(domain);
        
        if (event.target.tagName === 'INPUT') {
            // Nouveau nom de dossier
            action.targetFolder = value;
            action.action = 'create-new';
        } else {
            // Dossier existant sélectionné
            const selectedOption = event.target.options[event.target.selectedIndex];
            action.targetFolder = selectedOption.text;
            action.existingFolderId = value;
            action.action = 'move-existing';
        }
        
        // Mettre à jour l'aperçu dans l'en-tête
        const domainGroup = document.querySelector(`[data-domain="${domain}"]`);
        const preview = domainGroup.querySelector('.folder-preview');
        if (preview) {
            preview.textContent = action.targetFolder;
        }
        
        this.updateActionSummary();
    }

    /**
     * Gère le toggle d'un domaine
     */
    handleDomainToggle(event) {
        const domain = event.target.dataset.domain;
        const isChecked = event.target.checked;
        
        if (this.selectedActions.has(domain)) {
            this.selectedActions.get(domain).selected = isChecked;
        }
        
        this.updateActionSummary();
    }

    /**
     * Gère le select all
     */
    handleSelectAll(event) {
        const isChecked = event.target.checked;
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
            this.handleDomainToggle({ target: checkbox });
        });
    }

    /**
     * Met à jour le résumé des actions
     */
    updateActionSummary() {
        const selectedActions = Array.from(this.selectedActions.values())
            .filter(action => action.selected);
        
        const totalEmails = selectedActions.reduce((sum, action) => sum + action.emailCount, 0);
        const newFolders = selectedActions.filter(action => action.action === 'create-new').length;
        
        // Mettre à jour les éléments de confirmation
        const confirmTotalEmails = document.getElementById('confirmTotalEmails');
        const confirmNewFolders = document.getElementById('confirmNewFolders');
        
        if (confirmTotalEmails) confirmTotalEmails.textContent = totalEmails.toLocaleString();
        if (confirmNewFolders) confirmNewFolders.textContent = newFolders;
    }

    /**
     * Prépare les actions
     */
    prepareActions() {
        this.selectedActions.clear();
        const actions = this.getPreparedActions();
        actions.forEach((action, domain) => {
            this.selectedActions.set(domain, action);
        });
    }

    /**
     * Navigation - Retour
     */
    goBack() {
        this.forceShowConfigStep();
    }

    /**
     * Exécute l'organisation
     */
    async executeOrganization() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.showStep('execute');
            
            const actionsToApply = new Map();
            this.selectedActions.forEach((action, domain) => {
                if (action.selected) {
                    actionsToApply.set(domain, action);
                }
            });
            
            if (actionsToApply.size === 0) {
                window.uiManager?.showToast('Aucune action sélectionnée', 'warning');
                this.showStep('review');
                return;
            }
            
            const createFolders = document.getElementById('createFolders')?.checked ?? true;
            this.configure({ createFolders });
            
            const startTime = Date.now();
            const results = await this.executeOrganizationWithProgress(actionsToApply);
            const endTime = Date.now();
            
            results.timeElapsed = Math.round((endTime - startTime) / 1000);
            this.showFinalResults(results);
            
        } catch (error) {
            console.error('[DomainOrganizer] Execute error:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            this.showStep('review');
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Exécute l'organisation avec progression détaillée
     */
    async executeOrganizationWithProgress(domainActions) {
        const results = {
            success: 0,
            failed: 0,
            foldersCreated: 0,
            emailsMoved: 0,
            errors: [],
            actions: []
        };
        
        const totalDomains = domainActions.size;
        let processedDomains = 0;
        
        // Initialiser le log
        this.initializeExecutionLog();
        
        for (const [domain, action] of domainActions) {
            try {
                // Mettre à jour l'interface
                this.updateExecutionProgress(domain, action, processedDomains, totalDomains);
                
                this.addLogEntry(`Traitement de ${domain}...`, 'info');
                
                const result = await this.processDomain(domain, action);
                
                if (result.success) {
                    results.success++;
                    results.emailsMoved += result.emailsMoved;
                    if (result.folderCreated) {
                        results.foldersCreated++;
                        this.addLogEntry(`✓ Dossier "${action.targetFolder}" créé`, 'success');
                    }
                    this.addLogEntry(`✓ ${result.emailsMoved} emails déplacés vers "${action.targetFolder}"`, 'success');
                    
                    results.actions.push({
                        domain: domain,
                        action: action.action,
                        targetFolder: action.targetFolder,
                        emailCount: result.emailsMoved,
                        folderCreated: result.folderCreated,
                        success: true
                    });
                } else {
                    results.failed++;
                    results.errors.push({ domain, error: result.error });
                    this.addLogEntry(`✗ Erreur pour ${domain}: ${result.error}`, 'error');
                    
                    results.actions.push({
                        domain: domain,
                        action: action.action,
                        targetFolder: action.targetFolder,
                        emailCount: 0,
                        folderCreated: false,
                        success: false,
                        error: result.error
                    });
                }
                
            } catch (error) {
                results.failed++;
                results.errors.push({ domain, error: error.message });
                this.addLogEntry(`✗ Erreur pour ${domain}: ${error.message}`, 'error');
                
                results.actions.push({
                    domain: domain,
                    action: action.action,
                    targetFolder: action.targetFolder,
                    emailCount: 0,
                    folderCreated: false,
                    success: false,
                    error: error.message
                });
            }
            
            processedDomains++;
            
            // Petit délai pour que l'utilisateur puisse suivre
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        this.addLogEntry('Rangement terminé !', 'success');
        
        return results;
    }

    /**
     * Initialise le log d'exécution
     */
    initializeExecutionLog() {
        const logContainer = document.getElementById('executionLog');
        if (logContainer) {
            logContainer.innerHTML = '';
        }
    }

    /**
     * Ajoute une entrée au log
     */
    addLogEntry(message, type = 'info') {
        const logContainer = document.getElementById('executionLog');
        if (!logContainer) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const time = new Date().toLocaleTimeString();
        entry.innerHTML = `
            <span style="opacity: 0.7;">[${time}]</span>
            <span>${message}</span>
        `;
        
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    /**
     * Met à jour la progression d'exécution
     */
    updateExecutionProgress(currentDomain, currentAction, processed, total) {
        // Mettre à jour le domaine actuel
        const domainName = document.getElementById('currentDomainName');
        const domainAction = document.getElementById('currentDomainAction');
        
        if (domainName) domainName.textContent = currentDomain;
        if (domainAction) {
            const actionText = currentAction.action === 'create-new' 
                ? `Création du dossier "${currentAction.targetFolder}"`
                : `Déplacement vers "${currentAction.targetFolder}"`;
            domainAction.textContent = actionText;
        }
        
        // Mettre à jour la progression globale
        const percent = Math.round((processed / total) * 100);
        const progressBar = document.getElementById('executionProgressBar');
        const progressPercent = document.getElementById('executionPercent');
        
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressPercent) progressPercent.textContent = `${percent}%`;
    }

    /**
     * Affiche les résultats finaux
     */
    showFinalResults(results) {
        // Mettre à jour les statistiques finales
        document.getElementById('finalEmailsMoved').textContent = results.emailsMoved.toLocaleString();
        document.getElementById('finalFoldersCreated').textContent = results.foldersCreated;
        
        this.showStep('results');
    }

    /**
     * Réinitialise le formulaire
     */
    resetForm() {
        // Revenir à l'étape de configuration
        this.forceShowConfigStep();
        
        // Réinitialiser le formulaire
        document.getElementById('organizeForm')?.reset();
        
        // Remettre les dates par défaut
        this.setDefaultDates();
        
        // Réinitialiser les données
        this.currentAnalysis = null;
        this.selectedActions.clear();
        this.expandedDomains.clear();
        this.folderStructure.clear();
        this.isProcessing = false;
        
        console.log('[DomainOrganizer] ✅ Form reset to initial state');
    }

    // ================================================
    // CONFIGURATION ET INITIALISATION
    // ================================================
    
    configure(options = {}) {
        const {
            excludeDomains = [],
            excludeEmails = [],
            organizationType = 'hierarchical',
            onProgress = null,
            createFolders = true,
            maxEmailsPerBatch = 50
        } = options;

        this.excludedDomains = new Set(excludeDomains.map(d => d.toLowerCase()));
        this.excludedEmails = new Set(excludeEmails.map(e => e.toLowerCase()));
        this.organizationType = organizationType;
        this.progressCallback = onProgress;
        this.createFolders = createFolders;
        this.maxEmailsPerBatch = maxEmailsPerBatch;
    }

    // ================================================
    // ANALYSE DES EMAILS
    // ================================================
    
    async analyzeEmails(filters = {}) {
        console.log('[DomainOrganizer] Starting analysis...');
        
        try {
            this.isProcessing = true;
            this.resetAnalysis();
            
            this.updateProgress({ 
                percent: 10, 
                message: 'Chargement des dossiers existants...',
                stage: 'Chargement des dossiers'
            });
            await this.loadExistingFolders();
            
            this.updateProgress({ 
                percent: 30, 
                message: 'Récupération des emails...',
                stage: 'Récupération des emails'
            });
            const emails = await this.fetchEmails(filters);
            
            this.updateProgress({ 
                percent: 60, 
                message: 'Analyse des domaines...',
                stage: 'Analyse des domaines'
            });
            await this.analyzeDomains(emails);
            
            this.updateProgress({ 
                percent: 90, 
                message: 'Génération de la structure...',
                stage: 'Structure proposée'
            });
            const results = this.finalizeAnalysis();
            
            this.updateProgress({ 
                percent: 100, 
                message: 'Analyse terminée',
                stage: 'Terminé'
            });
            
            return results;
            
        } catch (error) {
            console.error('[DomainOrganizer] Analysis failed:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    updateProgress(progress) {
        if (this.progressCallback) {
            this.progressCallback(progress);
        }
    }

    async loadExistingFolders() {
        try {
            const folders = await window.mailService.getFolders();
            this.existingFolders.clear();
            
            folders.forEach(folder => {
                this.existingFolders.set(folder.displayName.toLowerCase(), {
                    id: folder.id,
                    displayName: folder.displayName,
                    totalItemCount: folder.totalItemCount || 0
                });
            });
            
            console.log(`[DomainOrganizer] Loaded ${this.existingFolders.size} folders`);
        } catch (error) {
            console.error('[DomainOrganizer] Error loading folders:', error);
            throw error;
        }
    }

    async fetchEmails(filters) {
        const { startDate, endDate, folders = ['inbox'] } = filters;
        const allEmails = [];
        
        for (const folder of folders) {
            try {
                const options = {
                    top: 1000,
                    orderBy: 'receivedDateTime desc'
                };
                
                if (startDate) options.startDate = startDate;
                if (endDate) options.endDate = endDate;
                
                const emails = await window.mailService.getEmailsFromFolder(folder, options);
                allEmails.push(...emails);
                
                console.log(`[DomainOrganizer] Fetched ${emails.length} emails from ${folder}`);
            } catch (error) {
                console.warn(`[DomainOrganizer] Error fetching from ${folder}:`, error);
            }
        }
        
        return allEmails;
    }

    async analyzeDomains(emails) {
        this.domainAnalysis.clear();
        this.emailsByDomain.clear();
        
        for (const email of emails) {
            const domain = this.extractDomain(email);
            if (!domain || this.shouldExclude(domain, email)) continue;
            
            if (!this.emailsByDomain.has(domain)) {
                this.emailsByDomain.set(domain, []);
            }
            this.emailsByDomain.get(domain).push(email);
            
            if (!this.domainAnalysis.has(domain)) {
                this.domainAnalysis.set(domain, {
                    domain: domain,
                    count: 0,
                    samples: [],
                    existingFolder: null,
                    suggestedFolder: null,
                    action: 'none'
                });
            }
            
            const analysis = this.domainAnalysis.get(domain);
            analysis.count++;
            
            if (analysis.samples.length < 3) {
                analysis.samples.push({
                    subject: email.subject,
                    from: email.from?.emailAddress?.name || email.from?.emailAddress?.address
                });
            }
        }
        
        this.domainAnalysis.forEach((analysis, domain) => {
            this.determineDomainAction(domain, analysis);
        });
    }

    determineDomainAction(domain, analysis) {
        const existingFolder = this.findExistingFolder(domain);
        
        if (existingFolder) {
            analysis.existingFolder = existingFolder;
            analysis.suggestedFolder = existingFolder.displayName;
            analysis.action = 'move-existing';
        } else {
            analysis.suggestedFolder = domain;
            analysis.action = 'create-new';
        }
    }

    findExistingFolder(domain) {
        if (this.existingFolders.has(domain)) {
            return this.existingFolders.get(domain);
        }
        
        const domainParts = domain.split('.');
        if (domainParts.length > 1) {
            const mainDomain = domainParts[0];
            if (this.existingFolders.has(mainDomain)) {
                return this.existingFolders.get(mainDomain);
            }
        }
        
        return null;
    }

    // ================================================
    // EXÉCUTION DES ACTIONS
    // ================================================
    
    async processDomain(domain, action) {
        const emails = this.emailsByDomain.get(domain) || [];
        const result = { success: false, emailsMoved: 0, folderCreated: false, error: null };
        
        if (emails.length === 0) {
            result.success = true;
            return result;
        }
        
        try {
            let targetFolderId;
            
            if (action.action === 'create-new' && this.createFolders) {
                try {
                    const newFolder = await this.createFolder(action.targetFolder);
                    targetFolderId = newFolder.id;
                    result.folderCreated = true;
                } catch (error) {
                    console.error(`[DomainOrganizer] Failed to create folder for ${domain}:`, error);
                    if (action.existingFolderId) {
                        targetFolderId = action.existingFolderId;
                    } else {
                        throw new Error(`Could not create or find folder for ${domain}`);
                    }
                }
            } else if (action.existingFolderId) {
                targetFolderId = action.existingFolderId;
            } else {
                throw new Error(`No target folder specified for ${domain}`);
            }
            
            const batches = this.createBatches(emails, this.maxEmailsPerBatch);
            for (const batch of batches) {
                await this.moveEmailBatch(batch, targetFolderId);
                result.emailsMoved += batch.length;
            }
            
            result.success = true;
            
        } catch (error) {
            result.error = error.message;
            console.error(`[DomainOrganizer] Error processing domain ${domain}:`, error);
        }
        
        return result;
    }

    async createFolder(folderName) {
        const accessToken = await window.authService.getAccessToken();
        
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ displayName: folderName })
            });
            
            if (response.ok) {
                return await response.json();
            }
            
            if (response.status === 409) {
                // Dossier existe déjà, le chercher
                const folders = await window.mailService.getFolders();
                const existingFolder = folders.find(f => 
                    f.displayName.toLowerCase() === folderName.toLowerCase()
                );
                if (existingFolder) {
                    return existingFolder;
                }
            }
            
            throw new Error(`Failed to create folder: ${response.status} ${response.statusText}`);
            
        } catch (error) {
            console.error(`[DomainOrganizer] Error creating folder "${folderName}":`, error);
            throw error;
        }
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
        
        if (!response.ok) throw new Error(`Batch move failed: ${response.statusText}`);
        
        return await response.json();
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
    extractDomain(email) {
        try {
            if (!email.from?.emailAddress?.address) return null;
            const emailAddress = email.from.emailAddress.address.toLowerCase();
            return emailAddress.split('@')[1] || null;
        } catch (error) {
            return null;
        }
    }

    shouldExclude(domain, email) {
        if (this.excludedDomains.has(domain.toLowerCase())) return true;
        
        const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
        if (emailAddress && this.excludedEmails.has(emailAddress)) return true;
        
        return false;
    }

    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    resetAnalysis() {
        this.domainAnalysis.clear();
        this.emailsByDomain.clear();
        this.expandedDomains.clear();
        this.folderStructure.clear();
    }

    finalizeAnalysis() {
        const results = {
            totalEmails: 0,
            totalDomains: this.domainAnalysis.size,
            totalFolders: this.domainAnalysis.size,
            domainsToCreate: 0,
            domainsWithExisting: 0,
            domains: []
        };
        
        this.domainAnalysis.forEach((analysis, domain) => {
            results.totalEmails += analysis.count;
            
            if (analysis.action === 'create-new') results.domainsToCreate++;
            else if (analysis.action === 'move-existing') results.domainsWithExisting++;
            
            results.domains.push({
                domain: domain,
                count: analysis.count,
                samples: analysis.samples,
                action: analysis.action,
                existingFolder: analysis.existingFolder,
                suggestedFolder: analysis.suggestedFolder
            });
        });
        
        results.domains.sort((a, b) => b.count - a.count);
        return results;
    }

    getPreparedActions() {
        const actions = new Map();
        
        this.domainAnalysis.forEach((analysis, domain) => {
            if (analysis.count > 0) {
                actions.set(domain, {
                    domain: domain,
                    action: analysis.action,
                    targetFolder: analysis.suggestedFolder,
                    existingFolderId: analysis.existingFolder?.id,
                    emailCount: analysis.count,
                    selected: true
                });
            }
        });
        
        return actions;
    }
}

// Créer l'instance globale
window.domainOrganizer = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ Module chargé - Version 4.0 hiérarchique');

// ================================================
// GESTION AUTONOME - Sans PageManager
// ================================================

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DomainOrganizer] Initialisation autonome v4.0...');
    
    // Écouter directement les clics sur le bouton "Ranger"
    document.addEventListener('click', function(e) {
        const rangerButton = e.target.closest('[data-page="ranger"]');
        if (!rangerButton) return;
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[DomainOrganizer] Bouton Ranger cliqué - v4.0');
        
        if (!window.authService?.isAuthenticated()) {
            window.uiManager?.showToast('Veuillez vous connecter pour utiliser cette fonctionnalité', 'warning');
            return;
        }
        
        window.domainOrganizer.showPage();
        return false;
    }, true);
});

// Méthode pour afficher la page directement
window.domainOrganizer.showPage = function() {
    console.log('[DomainOrganizer] Affichage de la page v4.0...');
    
    const loginPage = document.getElementById('loginPage');
    if (loginPage) loginPage.style.display = 'none';
    
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) {
        console.error('[DomainOrganizer] Element pageContent non trouvé');
        return;
    }
    
    pageContent.style.display = 'block';
    window.domainOrganizerActive = true;
    
    pageContent.innerHTML = this.getPageHTML();
    
    setTimeout(async () => {
        if (!window.domainOrganizerActive || !document.getElementById('configStep')) {
            console.warn('[DomainOrganizer] Content was overwritten, re-injecting...');
            pageContent.innerHTML = this.getPageHTML();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.isProcessing = false;
        this.currentStep = 'configure';
        this.currentAnalysis = null;
        this.selectedActions.clear();
        this.expandedDomains.clear();
        
        await this.initializePage();
        console.log('[DomainOrganizer] ✅ Initialization complete v4.0');
    }, 300);
    
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) {
        rangerButton.classList.add('active');
    }
    
    const mainNav = document.getElementById('mainNav');
    if (mainNav) mainNav.style.display = 'flex';
    
    console.log('[DomainOrganizer] ✅ Page v4.0 affichée avec succès');
};

window.addEventListener('beforeunload', () => {
    window.domainOrganizerActive = false;
});

window.showDomainOrganizer = function() {
    window.domainOrganizer.showPage();
};
