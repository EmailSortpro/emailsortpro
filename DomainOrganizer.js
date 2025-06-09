// DomainOrganizer.js - Version 5.0.0 - Interface harmonisée avec contrôle granulaire
// Vue sobre avec affichage systématique des emails et gestion d'erreurs renforcée

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
        this.emailSelections = new Map(); // Selection granulaire des emails
        this.validationErrors = new Map(); // Erreurs de validation
        this.folderCreationQueue = new Map(); // Queue pour création de dossiers
        
        console.log('[DomainOrganizer] ✅ Module initialized v5.0 - Interface harmonisée');
    }

    // ================================================
    // MÉTHODES D'INTERFACE - GESTION DE LA PAGE
    // ================================================
    
    getPageHTML() {
        return `
            <div class="organizer-container">
                <!-- En-tête simplifié -->
                <div class="organizer-header">
                    <h1>
                        <i class="fas fa-folder-tree"></i>
                        Organisation par domaine
                    </h1>
                    <div class="step-progress">
                        <div class="step active" data-step="configure">Configuration</div>
                        <div class="step" data-step="analyze">Analyse</div>
                        <div class="step" data-step="review">Validation</div>
                        <div class="step" data-step="execute">Exécution</div>
                    </div>
                </div>

                <!-- Étape 1: Configuration -->
                <div class="step-content active" id="configStep">
                    <div class="config-card">
                        <h2>Configuration du rangement</h2>
                        
                        <form id="organizeForm" class="config-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="startDate">Date début</label>
                                    <input type="date" id="startDate" name="startDate">
                                </div>
                                
                                <div class="form-group">
                                    <label for="endDate">Date fin</label>
                                    <input type="date" id="endDate" name="endDate">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="excludeDomains">Domaines à ignorer (optionnel)</label>
                                    <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com">
                                </div>
                                
                                <div class="form-group">
                                    <label for="excludeEmails">Emails spécifiques à ignorer (optionnel)</label>
                                    <input type="text" id="excludeEmails" placeholder="boss@company.com">
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn-primary" id="analyzeBtn">
                                    <i class="fas fa-search"></i>
                                    Analyser les emails
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Étape 2: Analyse en cours -->
                <div class="step-content" id="analyzeStep">
                    <div class="analysis-card">
                        <h2>Analyse en cours...</h2>
                        
                        <div class="progress-section">
                            <div class="progress-info">
                                <span id="progressLabel">Initialisation</span>
                                <span id="progressPercent">0%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <div class="progress-message" id="progressMessage">Préparation...</div>
                        </div>
                    </div>
                </div>

                <!-- Étape 3: Validation et contrôle -->
                <div class="step-content" id="reviewStep">
                    <div class="review-container">
                        <div class="review-header">
                            <h2>Validation de l'organisation</h2>
                            <div class="review-stats">
                                <div class="stat">
                                    <span class="stat-value" id="statEmails">0</span>
                                    <span class="stat-label">Emails</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value" id="statDomains">0</span>
                                    <span class="stat-label">Domaines</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value" id="statFolders">0</span>
                                    <span class="stat-label">Dossiers</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value" id="statNew">0</span>
                                    <span class="stat-label">Nouveaux</span>
                                </div>
                            </div>
                        </div>

                        <!-- Contrôles globaux -->
                        <div class="global-controls">
                            <div class="control-group">
                                <button class="btn-secondary" onclick="window.domainOrganizer.selectAllDomains()">
                                    <i class="fas fa-check-square"></i> Tout sélectionner
                                </button>
                                <button class="btn-secondary" onclick="window.domainOrganizer.deselectAllDomains()">
                                    <i class="fas fa-square"></i> Tout désélectionner
                                </button>
                            </div>
                            
                            <!-- Validation globale -->
                            <div class="validation-panel" id="validationPanel">
                                <!-- Erreurs de validation affichées ici -->
                            </div>
                        </div>

                        <!-- Liste des domaines -->
                        <div class="domains-list" id="domainsList">
                            <!-- Contenu généré dynamiquement -->
                        </div>

                        <!-- Actions finales -->
                        <div class="final-actions">
                            <div class="summary-box">
                                <h3>Résumé des actions</h3>
                                <div class="summary-content">
                                    <div class="summary-item">
                                        <strong id="summaryEmails">0</strong> emails seront déplacés
                                    </div>
                                    <div class="summary-item">
                                        <strong id="summaryFolders">0</strong> dossiers seront créés
                                    </div>
                                    <div class="summary-item">
                                        <strong id="summaryDomains">0</strong> domaines traités
                                    </div>
                                </div>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn-secondary" onclick="window.domainOrganizer.goBack()">
                                    <i class="fas fa-arrow-left"></i> Retour
                                </button>
                                <button class="btn-primary" id="executeBtn" onclick="window.domainOrganizer.executeOrganization()" disabled>
                                    <i class="fas fa-play"></i> Lancer l'organisation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 4: Exécution -->
                <div class="step-content" id="executeStep">
                    <div class="execution-card">
                        <h2>Organisation en cours...</h2>
                        
                        <div class="execution-progress">
                            <div class="current-operation">
                                <div class="operation-icon">
                                    <i class="fas fa-cogs fa-spin"></i>
                                </div>
                                <div class="operation-details">
                                    <div class="operation-title" id="operationTitle">Initialisation...</div>
                                    <div class="operation-subtitle" id="operationSubtitle">Préparation</div>
                                </div>
                                <div class="operation-status" id="operationStatus">En cours</div>
                            </div>
                            
                            <div class="progress-section">
                                <div class="progress-info">
                                    <span>Progression globale</span>
                                    <span id="executionPercent">0%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" id="executionProgressFill"></div>
                                </div>
                            </div>

                            <!-- Journal détaillé -->
                            <div class="execution-log">
                                <h3>Journal d'exécution</h3>
                                <div class="log-container" id="executionLog">
                                    <!-- Logs générés dynamiquement -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Résultats finaux -->
                <div class="step-content" id="resultsStep">
                    <div class="results-card">
                        <div class="results-header">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h2>Organisation terminée</h2>
                            <p>Votre boîte mail a été organisée selon vos préférences.</p>
                        </div>
                        
                        <div class="results-summary">
                            <div class="result-stat">
                                <div class="result-value" id="finalEmailsMoved">0</div>
                                <div class="result-label">Emails déplacés</div>
                            </div>
                            <div class="result-stat">
                                <div class="result-value" id="finalFoldersCreated">0</div>
                                <div class="result-label">Dossiers créés</div>
                            </div>
                            <div class="result-stat">
                                <div class="result-value" id="finalErrors">0</div>
                                <div class="result-label">Erreurs</div>
                            </div>
                        </div>

                        <div class="results-actions">
                            <button class="btn-secondary" onclick="window.domainOrganizer.resetForm()">
                                <i class="fas fa-redo"></i> Nouveau rangement
                            </button>
                            <button class="btn-primary" onclick="window.location.reload()">
                                <i class="fas fa-home"></i> Accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Variables CSS pour cohérence */
                :root {
                    --primary-color: #3b82f6;
                    --primary-dark: #2563eb;
                    --secondary-color: #64748b;
                    --success-color: #10b981;
                    --warning-color: #f59e0b;
                    --danger-color: #ef4444;
                    --gray-50: #f8fafc;
                    --gray-100: #f1f5f9;
                    --gray-200: #e2e8f0;
                    --gray-300: #cbd5e1;
                    --gray-500: #64748b;
                    --gray-600: #475569;
                    --gray-700: #334155;
                    --gray-800: #1e293b;
                    --gray-900: #0f172a;
                    --border-radius: 8px;
                    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                }

                /* Reset et base */
                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                .organizer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: var(--gray-900);
                    line-height: 1.6;
                }

                /* En-tête */
                .organizer-header {
                    margin-bottom: 32px;
                    text-align: center;
                }

                .organizer-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: var(--gray-900);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                }

                .step-progress {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin: 0 auto;
                    max-width: 600px;
                }

                .step {
                    padding: 12px 24px;
                    border-radius: var(--border-radius);
                    font-weight: 600;
                    transition: all 0.3s ease;
                    background: var(--gray-100);
                    color: var(--gray-500);
                    position: relative;
                }

                .step.active {
                    background: var(--primary-color);
                    color: white;
                }

                .step.completed {
                    background: var(--success-color);
                    color: white;
                }

                /* Cards */
                .config-card, .analysis-card, .results-card, .execution-card {
                    background: white;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow);
                    padding: 32px;
                    margin-bottom: 24px;
                }

                /* Contenu des étapes */
                .step-content {
                    display: none;
                }

                .step-content.active {
                    display: block;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Formulaire de configuration */
                .config-form h2 {
                    font-size: 24px;
                    margin-bottom: 24px;
                    color: var(--gray-800);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-weight: 600;
                    color: var(--gray-700);
                    font-size: 14px;
                }

                .form-group input {
                    padding: 12px 16px;
                    border: 2px solid var(--gray-200);
                    border-radius: var(--border-radius);
                    font-size: 16px;
                    transition: border-color 0.2s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
                }

                /* Boutons */
                .btn-primary, .btn-secondary {
                    padding: 12px 24px;
                    border: none;
                    border-radius: var(--border-radius);
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-lg);
                }

                .btn-primary:disabled {
                    background: var(--gray-300);
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .btn-secondary {
                    background: var(--gray-100);
                    color: var(--gray-700);
                    border: 2px solid var(--gray-200);
                }

                .btn-secondary:hover {
                    background: var(--gray-200);
                    border-color: var(--gray-300);
                }

                .form-actions {
                    text-align: center;
                    margin-top: 32px;
                }

                /* Progression */
                .progress-section {
                    margin: 24px 0;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: var(--gray-700);
                }

                .progress-bar {
                    height: 12px;
                    background: var(--gray-200);
                    border-radius: 6px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: var(--primary-color);
                    transition: width 0.3s ease;
                    border-radius: 6px;
                }

                .progress-message {
                    margin-top: 12px;
                    text-align: center;
                    color: var(--gray-600);
                    font-style: italic;
                }

                /* Validation et révision */
                .review-container {
                    background: white;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow);
                    overflow: hidden;
                }

                .review-header {
                    padding: 32px;
                    border-bottom: 1px solid var(--gray-200);
                }

                .review-header h2 {
                    font-size: 24px;
                    margin-bottom: 24px;
                    color: var(--gray-800);
                }

                .review-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }

                .stat {
                    text-align: center;
                    padding: 20px;
                    background: var(--gray-50);
                    border-radius: var(--border-radius);
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--primary-color);
                    display: block;
                }

                .stat-label {
                    font-size: 14px;
                    color: var(--gray-600);
                    font-weight: 500;
                }

                /* Contrôles globaux */
                .global-controls {
                    padding: 24px 32px;
                    border-bottom: 1px solid var(--gray-200);
                    background: var(--gray-50);
                }

                .control-group {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .validation-panel {
                    margin-top: 16px;
                }

                .validation-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 12px 16px;
                    border-radius: var(--border-radius);
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }

                /* Liste des domaines */
                .domains-list {
                    max-height: 600px;
                    overflow-y: auto;
                }

                .domain-item {
                    border-bottom: 1px solid var(--gray-200);
                    transition: background-color 0.2s ease;
                }

                .domain-item:hover {
                    background: var(--gray-50);
                }

                .domain-header {
                    padding: 24px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                }

                .domain-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 1;
                }

                .domain-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    accent-color: var(--primary-color);
                }

                .domain-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--primary-color);
                    border-radius: var(--border-radius);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 18px;
                }

                .domain-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .domain-name {
                    font-weight: 700;
                    font-size: 18px;
                    color: var(--gray-900);
                }

                .domain-count {
                    color: var(--gray-600);
                    font-size: 14px;
                }

                .domain-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .folder-config {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    min-width: 200px;
                }

                .folder-select, .folder-input {
                    padding: 8px 12px;
                    border: 2px solid var(--gray-200);
                    border-radius: var(--border-radius);
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }

                .folder-select:focus, .folder-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }

                .action-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .action-new {
                    background: #d1fae5;
                    color: #065f46;
                }

                .action-existing {
                    background: #dbeafe;
                    color: #1e40af;
                }

                /* Section des emails */
                .emails-section {
                    padding: 0 32px 24px 32px;
                    background: var(--gray-50);
                    display: none;
                }

                .emails-section.expanded {
                    display: block;
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from { max-height: 0; opacity: 0; }
                    to { max-height: 500px; opacity: 1; }
                }

                .emails-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding: 16px 0;
                    border-bottom: 1px solid var(--gray-200);
                }

                .emails-title {
                    font-weight: 600;
                    color: var(--gray-800);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .emails-controls {
                    display: flex;
                    gap: 12px;
                }

                .email-item {
                    background: white;
                    border: 1px solid var(--gray-200);
                    border-radius: var(--border-radius);
                    padding: 16px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.2s ease;
                }

                .email-item:hover {
                    box-shadow: var(--shadow);
                    transform: translateY(-1px);
                }

                .email-item.selected {
                    border-color: var(--primary-color);
                    background: #eff6ff;
                }

                .email-checkbox {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: var(--primary-color);
                }

                .email-content {
                    flex: 1;
                    min-width: 0;
                }

                .email-from {
                    font-weight: 600;
                    color: var(--gray-900);
                    font-size: 14px;
                    margin-bottom: 4px;
                }

                .email-subject {
                    color: var(--gray-700);
                    font-size: 14px;
                    margin-bottom: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .email-preview {
                    color: var(--gray-500);
                    font-size: 12px;
                    line-height: 1.4;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .email-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                }

                .email-date {
                    font-size: 12px;
                    color: var(--gray-500);
                    white-space: nowrap;
                }

                .email-folder-select {
                    padding: 6px 10px;
                    border: 1px solid var(--gray-200);
                    border-radius: 4px;
                    font-size: 12px;
                    min-width: 120px;
                }

                /* Actions finales */
                .final-actions {
                    padding: 32px;
                    border-top: 1px solid var(--gray-200);
                    background: white;
                }

                .summary-box {
                    background: var(--gray-50);
                    border: 1px solid var(--gray-200);
                    border-radius: var(--border-radius);
                    padding: 24px;
                    margin-bottom: 24px;
                }

                .summary-box h3 {
                    margin-bottom: 16px;
                    color: var(--gray-800);
                }

                .summary-content {
                    display: flex;
                    gap: 32px;
                }

                .summary-item {
                    font-size: 16px;
                    color: var(--gray-700);
                }

                .summary-item strong {
                    color: var(--primary-color);
                    font-weight: 700;
                }

                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                /* Exécution */
                .current-operation {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 24px;
                    background: var(--gray-50);
                    border-radius: var(--border-radius);
                    margin-bottom: 24px;
                }

                .operation-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 20px;
                }

                .operation-details {
                    flex: 1;
                }

                .operation-title {
                    font-weight: 700;
                    font-size: 18px;
                    color: var(--gray-900);
                }

                .operation-subtitle {
                    color: var(--gray-600);
                    font-size: 14px;
                }

                .operation-status {
                    padding: 8px 16px;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                }

                /* Journal d'exécution */
                .execution-log {
                    margin-top: 32px;
                }

                .execution-log h3 {
                    margin-bottom: 16px;
                    color: var(--gray-800);
                }

                .log-container {
                    max-height: 300px;
                    overflow-y: auto;
                    background: var(--gray-900);
                    color: white;
                    border-radius: var(--border-radius);
                    padding: 16px;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .log-entry {
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .log-entry.success {
                    color: #4ade80;
                }

                .log-entry.error {
                    color: #f87171;
                }

                .log-entry.warning {
                    color: #fbbf24;
                }

                .log-entry.info {
                    color: #60a5fa;
                }

                /* Résultats */
                .results-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .success-icon {
                    width: 80px;
                    height: 80px;
                    background: var(--success-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 36px;
                    margin: 0 auto 16px auto;
                }

                .results-header h2 {
                    font-size: 28px;
                    color: var(--gray-900);
                    margin-bottom: 8px;
                }

                .results-summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .result-stat {
                    text-align: center;
                    padding: 24px;
                    background: var(--gray-50);
                    border-radius: var(--border-radius);
                }

                .result-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--success-color);
                }

                .result-label {
                    font-size: 14px;
                    color: var(--gray-600);
                    margin-top: 4px;
                }

                .results-actions {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .organizer-container {
                        padding: 16px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .review-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .control-group {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .domain-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .domain-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .summary-content {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .action-buttons {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .results-summary {
                        grid-template-columns: 1fr;
                    }

                    .step-progress {
                        flex-direction: column;
                        gap: 8px;
                    }
                }

                /* Utilitaires */
                .hidden {
                    display: none !important;
                }

                .loading {
                    pointer-events: none;
                    opacity: 0.6;
                }

                .error-state {
                    border-color: var(--danger-color) !important;
                    background: #fef2f2 !important;
                }

                .success-state {
                    border-color: var(--success-color) !important;
                    background: #f0fdf4 !important;
                }
            </style>
        `;
    }

    // ================================================
    // INITIALISATION ET CONFIGURATION
    // ================================================
    
    async initializePage() {
        console.log('[DomainOrganizer] Initializing harmonized interface v5.0...');
        
        if (!window.authService?.isAuthenticated()) {
            window.uiManager?.showToast('Veuillez vous connecter pour utiliser cette fonctionnalité', 'warning');
            return false;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.showStep('configure');
        
        return true;
    }

    setupEventListeners() {
        // Formulaire principal
        const form = document.getElementById('organizeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
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
            content.classList.remove('active');
        });

        // Afficher l'étape active
        const stepId = `${stepName}Step`;
        const activeStep = document.getElementById(stepId);
        if (activeStep) {
            activeStep.classList.add('active');
        }

        this.currentStep = stepName;
    }

    isStepCompleted(stepName, currentStep) {
        const steps = ['configure', 'analyze', 'review', 'execute'];
        const stepIndex = steps.indexOf(stepName);
        const currentIndex = steps.indexOf(currentStep);
        return stepIndex < currentIndex;
    }

    // ================================================
    // GESTION DU FORMULAIRE ET ANALYSE
    // ================================================
    
    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
        const formData = this.getFormData();
        if (!formData.startDate && !formData.endDate) {
            this.showError('Veuillez sélectionner au moins une date');
            return;
        }
        
        await this.startAnalysis(formData);
    }

    getFormData() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const excludeDomains = document.getElementById('excludeDomains').value
            .split(',')
            .map(d => d.trim())
            .filter(d => d);
        const excludeEmails = document.getElementById('excludeEmails').value
            .split(',')
            .map(e => e.trim())
            .filter(e => e);
        
        return { startDate, endDate, excludeDomains, excludeEmails };
    }

    async startAnalysis(formData) {
        try {
            this.isProcessing = true;
            this.showStep('analyze');
            
            this.configure({
                excludeDomains: formData.excludeDomains,
                excludeEmails: formData.excludeEmails,
                onProgress: (progress) => this.updateAnalysisProgress(progress)
            });
            
            const results = await this.analyzeEmails({
                startDate: formData.startDate,
                endDate: formData.endDate,
                folders: ['inbox']
            });
            
            this.currentAnalysis = results;
            this.showValidationInterface(results);
            
        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            this.showError(`Erreur: ${error.message}`);
            this.showStep('configure');
        } finally {
            this.isProcessing = false;
        }
    }

    updateAnalysisProgress(progress) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const progressLabel = document.getElementById('progressLabel');
        const progressMessage = document.getElementById('progressMessage');
        
        if (progressFill) progressFill.style.width = `${progress.percent}%`;
        if (progressPercent) progressPercent.textContent = `${progress.percent}%`;
        if (progressLabel) progressLabel.textContent = progress.stage || 'Analyse';
        if (progressMessage) progressMessage.textContent = progress.message || 'Analyse en cours...';
    }

    // ================================================
    // INTERFACE DE VALIDATION HARMONISÉE
    // ================================================
    
    showValidationInterface(results) {
        // Mettre à jour les statistiques
        document.getElementById('statEmails').textContent = results.totalEmails.toLocaleString();
        document.getElementById('statDomains').textContent = results.totalDomains;
        document.getElementById('statFolders').textContent = results.totalDomains;
        document.getElementById('statNew').textContent = results.domainsToCreate;
        
        // Générer la liste des domaines avec emails visibles
        this.generateDomainsListWithEmails(results.domains);
        
        // Préparer les actions et valider
        this.prepareActions();
        this.validateConfiguration();
        this.updateSummary();
        
        // Passer à l'étape de révision
        this.showStep('review');
    }

    generateDomainsListWithEmails(domains) {
        const container = document.getElementById('domainsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Trier les domaines par nombre d'emails (décroissant)
        const sortedDomains = [...domains].sort((a, b) => b.count - a.count);
        
        sortedDomains.forEach((domain, index) => {
            const domainElement = this.createDomainElementWithEmails(domain, index);
            container.appendChild(domainElement);
        });
    }

    createDomainElementWithEmails(domainData, index) {
        const allEmails = this.emailsByDomain.get(domainData.domain) || [];
        const isNewFolder = domainData.action === 'create-new';
        const existingFolders = Array.from(this.existingFolders.values());
        
        const domainElement = document.createElement('div');
        domainElement.className = 'domain-item';
        domainElement.dataset.domain = domainData.domain;
        
        domainElement.innerHTML = `
            <div class="domain-header" onclick="window.domainOrganizer.toggleDomainEmails('${domainData.domain}')">
                <div class="domain-info">
                    <input type="checkbox" 
                           class="domain-checkbox" 
                           data-domain="${domainData.domain}" 
                           onclick="event.stopPropagation(); window.domainOrganizer.handleDomainToggle(event)" 
                           checked>
                    
                    <div class="domain-icon">
                        <i class="fas fa-at"></i>
                    </div>
                    
                    <div class="domain-details">
                        <div class="domain-name">${domainData.domain}</div>
                        <div class="domain-count">${domainData.count} emails</div>
                    </div>
                </div>
                
                <div class="domain-actions">
                    <div class="folder-config">
                        ${isNewFolder ? 
                            `<input type="text" 
                                    class="folder-input" 
                                    value="${domainData.suggestedFolder}" 
                                    data-domain="${domainData.domain}" 
                                    onclick="event.stopPropagation()"
                                    onchange="window.domainOrganizer.handleFolderChange(event)"
                                    placeholder="Nom du dossier">` :
                            this.createFolderSelect(domainData, existingFolders)
                        }
                        <div class="folder-type">
                            <select class="folder-select" 
                                    data-domain="${domainData.domain}" 
                                    onclick="event.stopPropagation()"
                                    onchange="window.domainOrganizer.handleActionTypeChange(event)">
                                <option value="create-new" ${isNewFolder ? 'selected' : ''}>Créer nouveau dossier</option>
                                <option value="move-existing" ${!isNewFolder ? 'selected' : ''}>Utiliser dossier existant</option>
                            </select>
                        </div>
                    </div>
                    
                    <span class="action-badge ${isNewFolder ? 'action-new' : 'action-existing'}">
                        ${isNewFolder ? 'Nouveau' : 'Existant'}
                    </span>
                    
                    <div class="expand-icon">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
            </div>
            
            <div class="emails-section" id="emails-${domainData.domain}">
                <div class="emails-header">
                    <div class="emails-title">
                        <i class="fas fa-envelope"></i>
                        Emails à déplacer (${allEmails.length})
                    </div>
                    <div class="emails-controls">
                        <button class="btn-secondary" onclick="window.domainOrganizer.selectAllEmailsInDomain('${domainData.domain}')">
                            <i class="fas fa-check-square"></i> Tout sélectionner
                        </button>
                        <button class="btn-secondary" onclick="window.domainOrganizer.deselectAllEmailsInDomain('${domainData.domain}')">
                            <i class="fas fa-square"></i> Tout désélectionner
                        </button>
                    </div>
                </div>
                
                <div class="emails-list">
                    ${this.renderEmailsForDomain(domainData.domain, allEmails)}
                </div>
            </div>
        `;
        
        return domainElement;
    }

    renderEmailsForDomain(domain, emails) {
        // Initialiser les sélections d'emails pour ce domaine
        if (!this.emailSelections.has(domain)) {
            this.emailSelections.set(domain, new Set());
            // Par défaut, tous les emails sont sélectionnés
            emails.forEach((email, index) => {
                const emailId = email.id || `email-${domain}-${index}`;
                this.emailSelections.get(domain).add(emailId);
            });
        }
        
        const existingFolders = Array.from(this.existingFolders.values());
        const domainAction = this.selectedActions.get(domain);
        
        return emails.map((email, index) => {
            const emailId = email.id || `email-${domain}-${index}`;
            const isSelected = this.emailSelections.get(domain).has(emailId);
            
            return `
                <div class="email-item ${isSelected ? 'selected' : ''}" data-email-id="${emailId}">
                    <input type="checkbox" 
                           class="email-checkbox" 
                           data-domain="${domain}" 
                           data-email-id="${emailId}"
                           ${isSelected ? 'checked' : ''}
                           onchange="window.domainOrganizer.handleEmailToggle(event)">
                    
                    <div class="email-content" onclick="window.domainOrganizer.toggleEmailSelection('${domain}', '${emailId}')">
                        <div class="email-from">${this.getEmailFrom(email)}</div>
                        <div class="email-subject">${email.subject || 'Sans sujet'}</div>
                        <div class="email-preview">${this.getEmailPreview(email)}</div>
                    </div>
                    
                    <div class="email-meta">
                        <div class="email-date">${this.formatEmailDate(email.receivedDateTime)}</div>
                        <select class="email-folder-select" 
                                data-domain="${domain}" 
                                data-email-id="${emailId}"
                                onchange="window.domainOrganizer.handleIndividualEmailFolderChange(event)">
                            <option value="domain-default" selected>📁 Dossier du domaine</option>
                            ${existingFolders.map(folder => 
                                `<option value="${folder.id}">📂 ${folder.displayName}</option>`
                            ).join('')}
                            <option value="custom">➕ Nouveau dossier...</option>
                        </select>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ================================================
    // GESTION DES INTERACTIONS
    // ================================================
    
    toggleDomainEmails(domain) {
        const emailsSection = document.getElementById(`emails-${domain}`);
        const expandIcon = document.querySelector(`[data-domain="${domain}"] .expand-icon i`);
        
        if (!emailsSection || !expandIcon) return;
        
        if (emailsSection.classList.contains('expanded')) {
            emailsSection.classList.remove('expanded');
            expandIcon.className = 'fas fa-chevron-down';
        } else {
            emailsSection.classList.add('expanded');
            expandIcon.className = 'fas fa-chevron-up';
        }
    }

    handleDomainToggle(event) {
        const domain = event.target.dataset.domain;
        const isChecked = event.target.checked;
        
        if (this.selectedActions.has(domain)) {
            this.selectedActions.get(domain).selected = isChecked;
        }
        
        this.updateSummary();
        this.validateConfiguration();
    }

    handleActionTypeChange(event) {
        const domain = event.target.dataset.domain;
        const actionType = event.target.value;
        
        if (!this.selectedActions.has(domain)) return;
        
        const action = this.selectedActions.get(domain);
        action.action = actionType;
        
        // Mettre à jour l'interface
        this.updateDomainInterface(domain, actionType);
        this.updateSummary();
        this.validateConfiguration();
    }

    handleFolderChange(event) {
        const domain = event.target.dataset.domain;
        const value = event.target.value;
        
        if (!this.selectedActions.has(domain)) return;
        
        const action = this.selectedActions.get(domain);
        
        if (event.target.tagName === 'INPUT') {
            action.targetFolder = value;
            action.action = 'create-new';
        } else {
            const selectedOption = event.target.options[event.target.selectedIndex];
            action.targetFolder = selectedOption.text;
            action.existingFolderId = value;
            action.action = 'move-existing';
        }
        
        this.updateSummary();
        this.validateConfiguration();
    }

    handleEmailToggle(event) {
        const domain = event.target.dataset.domain;
        const emailId = event.target.dataset.emailId;
        const isChecked = event.target.checked;
        
        this.toggleEmailSelection(domain, emailId, isChecked);
        this.updateSummary();
    }

    toggleEmailSelection(domain, emailId, forceState = null) {
        if (!this.emailSelections.has(domain)) {
            this.emailSelections.set(domain, new Set());
        }
        
        const domainEmails = this.emailSelections.get(domain);
        const shouldSelect = forceState !== null ? forceState : !domainEmails.has(emailId);
        
        if (shouldSelect) {
            domainEmails.add(emailId);
        } else {
            domainEmails.delete(emailId);
        }
        
        // Mettre à jour l'interface
        const emailItem = document.querySelector(`[data-email-id="${emailId}"]`);
        const checkbox = document.querySelector(`input[data-email-id="${emailId}"]`);
        
        if (emailItem) {
            emailItem.classList.toggle('selected', shouldSelect);
        }
        if (checkbox) {
            checkbox.checked = shouldSelect;
        }
    }

    selectAllEmailsInDomain(domain) {
        const allEmails = this.emailsByDomain.get(domain) || [];
        allEmails.forEach((email, index) => {
            const emailId = email.id || `email-${domain}-${index}`;
            this.toggleEmailSelection(domain, emailId, true);
        });
        this.updateSummary();
    }

    deselectAllEmailsInDomain(domain) {
        if (this.emailSelections.has(domain)) {
            this.emailSelections.get(domain).clear();
        }
        
        // Mettre à jour l'interface
        document.querySelectorAll(`input[data-domain="${domain}"]`).forEach(checkbox => {
            if (checkbox.dataset.emailId) {
                checkbox.checked = false;
                const emailItem = document.querySelector(`[data-email-id="${checkbox.dataset.emailId}"]`);
                if (emailItem) emailItem.classList.remove('selected');
            }
        });
        
        this.updateSummary();
    }

    selectAllDomains() {
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            this.handleDomainToggle({ target: checkbox });
        });
    }

    deselectAllDomains() {
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            this.handleDomainToggle({ target: checkbox });
        });
    }

    // ================================================
    // VALIDATION ET CONTRÔLE
    // ================================================
    
    validateConfiguration() {
        this.validationErrors.clear();
        const validationPanel = document.getElementById('validationPanel');
        
        if (!validationPanel) return;
        
        // Valider les actions sélectionnées
        this.selectedActions.forEach((action, domain) => {
            if (!action.selected) return;
            
            // Vérifier le nom du dossier
            if (action.action === 'create-new') {
                if (!action.targetFolder || action.targetFolder.trim() === '') {
                    this.validationErrors.set(domain, 'Le nom du dossier ne peut pas être vide');
                } else if (action.targetFolder.length > 255) {
                    this.validationErrors.set(domain, 'Le nom du dossier est trop long (max 255 caractères)');
                } else if (/[<>:"/\\|?*]/.test(action.targetFolder)) {
                    this.validationErrors.set(domain, 'Le nom du dossier contient des caractères invalides');
                }
            }
            
            // Vérifier qu'au moins un email est sélectionné
            const selectedEmails = this.emailSelections.get(domain)?.size || 0;
            if (selectedEmails === 0) {
                this.validationErrors.set(domain, 'Aucun email sélectionné pour ce domaine');
            }
        });
        
        // Afficher les erreurs
        this.displayValidationErrors(validationPanel);
        
        // Activer/désactiver le bouton d'exécution
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = this.validationErrors.size > 0 || this.getSelectedDomainsCount() === 0;
        }
    }

    displayValidationErrors(container) {
        container.innerHTML = '';
        
        if (this.validationErrors.size === 0) return;
        
        this.validationErrors.forEach((error, domain) => {
            const errorElement = document.createElement('div');
            errorElement.className = 'validation-error';
            errorElement.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <strong>${domain}:</strong> ${error}
            `;
            container.appendChild(errorElement);
        });
    }

    updateSummary() {
        const selectedActions = Array.from(this.selectedActions.values()).filter(action => action.selected);
        
        let totalEmails = 0;
        let newFolders = 0;
        
        selectedActions.forEach(action => {
            const selectedEmails = this.emailSelections.get(action.domain)?.size || 0;
            totalEmails += selectedEmails;
            
            if (action.action === 'create-new') {
                newFolders++;
            }
        });
        
        // Mettre à jour l'interface
        const summaryEmails = document.getElementById('summaryEmails');
        const summaryFolders = document.getElementById('summaryFolders');
        const summaryDomains = document.getElementById('summaryDomains');
        
        if (summaryEmails) summaryEmails.textContent = totalEmails.toLocaleString();
        if (summaryFolders) summaryFolders.textContent = newFolders;
        if (summaryDomains) summaryDomains.textContent = selectedActions.length;
    }

    getSelectedDomainsCount() {
        return Array.from(this.selectedActions.values()).filter(action => action.selected).length;
    }

    // ================================================
    // EXÉCUTION AVEC GESTION D'ERREURS RENFORCÉE
    // ================================================
    
    async executeOrganization() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.showStep('execute');
            
            const actionsToApply = new Map();
            this.selectedActions.forEach((action, domain) => {
                if (action.selected) {
                    const selectedEmails = this.emailSelections.get(domain) || new Set();
                    if (selectedEmails.size > 0) {
                        actionsToApply.set(domain, {
                            ...action,
                            selectedEmailIds: Array.from(selectedEmails)
                        });
                    }
                }
            });
            
            if (actionsToApply.size === 0) {
                this.showError('Aucune action sélectionnée');
                this.showStep('review');
                return;
            }
            
            const results = await this.executeWithDetailedProgress(actionsToApply);
            this.showFinalResults(results);
            
        } catch (error) {
            console.error('[DomainOrganizer] Execute error:', error);
            this.showError(`Erreur: ${error.message}`);
            this.showStep('review');
        } finally {
            this.isProcessing = false;
        }
    }

    async executeWithDetailedProgress(domainActions) {
        const results = {
            success: 0,
            failed: 0,
            foldersCreated: 0,
            emailsMoved: 0,
            errors: [],
            details: []
        };
        
        const totalDomains = domainActions.size;
        let processedDomains = 0;
        
        this.initializeExecutionLog();
        
        for (const [domain, action] of domainActions) {
            try {
                this.updateExecutionProgress(domain, action, processedDomains, totalDomains);
                this.addLogEntry(`🔄 Traitement de ${domain}...`, 'info');
                
                const result = await this.processDomainWithValidation(domain, action);
                
                if (result.success) {
                    results.success++;
                    results.emailsMoved += result.emailsMoved;
                    if (result.folderCreated) {
                        results.foldersCreated++;
                        this.addLogEntry(`✅ Dossier "${action.targetFolder}" créé`, 'success');
                    }
                    this.addLogEntry(`✅ ${result.emailsMoved} emails déplacés vers "${action.targetFolder}"`, 'success');
                } else {
                    results.failed++;
                    results.errors.push({ domain, error: result.error });
                    this.addLogEntry(`❌ Erreur pour ${domain}: ${result.error}`, 'error');
                }
                
                results.details.push(result);
                
            } catch (error) {
                results.failed++;
                results.errors.push({ domain, error: error.message });
                this.addLogEntry(`❌ Erreur critique pour ${domain}: ${error.message}`, 'error');
            }
            
            processedDomains++;
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        this.addLogEntry('🎉 Organisation terminée !', 'success');
        return results;
    }

    async processDomainWithValidation(domain, action) {
        const allEmails = this.emailsByDomain.get(domain) || [];
        const selectedEmailIds = new Set(action.selectedEmailIds);
        const emailsToMove = allEmails.filter((email, index) => {
            const emailId = email.id || `email-${domain}-${index}`;
            return selectedEmailIds.has(emailId);
        });
        
        const result = {
            domain,
            success: false,
            emailsMoved: 0,
            folderCreated: false,
            error: null,
            targetFolder: action.targetFolder
        };
        
        if (emailsToMove.length === 0) {
            result.success = true;
            return result;
        }
        
        try {
            let targetFolderId;
            
            // Créer le dossier si nécessaire
            if (action.action === 'create-new') {
                try {
                    const newFolder = await this.createFolderWithRetry(action.targetFolder);
                    targetFolderId = newFolder.id;
                    result.folderCreated = true;
                } catch (error) {
                    throw new Error(`Impossible de créer le dossier: ${error.message}`);
                }
            } else if (action.existingFolderId) {
                targetFolderId = action.existingFolderId;
            } else {
                throw new Error('Aucun dossier de destination spécifié');
            }
            
            // Déplacer les emails par lots
            const batches = this.createBatches(emailsToMove, 20);
            for (const batch of batches) {
                const batchResult = await this.moveEmailBatchWithRetry(batch, targetFolderId);
                result.emailsMoved += batchResult.successful;
                
                if (batchResult.failed > 0) {
                    this.addLogEntry(`⚠️ ${batchResult.failed} emails non déplacés dans ce lot`, 'warning');
                }
            }
            
            result.success = true;
            
        } catch (error) {
            result.error = error.message;
            console.error(`[DomainOrganizer] Error processing domain ${domain}:`, error);
        }
        
        return result;
    }

    async createFolderWithRetry(folderName, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.createFolder(folderName);
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                this.addLogEntry(`⚠️ Tentative ${attempt} échouée pour créer "${folderName}", retry...`, 'warning');
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    async moveEmailBatchWithRetry(emails, targetFolderId, maxRetries = 2) {
        const result = { successful: 0, failed: 0, errors: [] };
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const batchResult = await this.moveEmailBatch(emails, targetFolderId);
                
                // Analyser les résultats du batch
                if (batchResult.responses) {
                    batchResult.responses.forEach((response, index) => {
                        if (response.status >= 200 && response.status < 300) {
                            result.successful++;
                        } else {
                            result.failed++;
                            result.errors.push(`Email ${index}: ${response.status}`);
                        }
                    });
                } else {
                    result.successful = emails.length;
                }
                
                break; // Succès, sortir de la boucle de retry
                
            } catch (error) {
                if (attempt === maxRetries) {
                    result.failed = emails.length;
                    result.errors.push(error.message);
                } else {
                    this.addLogEntry(`⚠️ Tentative ${attempt} échouée pour déplacer les emails, retry...`, 'warning');
                    await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                }
            }
        }
        
        return result;
    }

    // ================================================
    // MÉTHODES D'AFFICHAGE ET UI
    // ================================================
    
    updateExecutionProgress(currentDomain, currentAction, processed, total) {
        const operationTitle = document.getElementById('operationTitle');
        const operationSubtitle = document.getElementById('operationSubtitle');
        const operationStatus = document.getElementById('operationStatus');
        
        if (operationTitle) operationTitle.textContent = `Domaine: ${currentDomain}`;
        if (operationSubtitle) {
            const actionText = currentAction.action === 'create-new' 
                ? `Création du dossier "${currentAction.targetFolder}"`
                : `Déplacement vers "${currentAction.targetFolder}"`;
            operationSubtitle.textContent = actionText;
        }
        if (operationStatus) operationStatus.textContent = `${processed + 1}/${total}`;
        
        // Progression globale
        const percent = Math.round(((processed + 1) / total) * 100);
        const progressFill = document.getElementById('executionProgressFill');
        const progressPercent = document.getElementById('executionPercent');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressPercent) progressPercent.textContent = `${percent}%`;
    }

    initializeExecutionLog() {
        const logContainer = document.getElementById('executionLog');
        if (logContainer) {
            logContainer.innerHTML = '';
        }
    }

    addLogEntry(message, type = 'info') {
        const logContainer = document.getElementById('executionLog');
        if (!logContainer) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        entry.innerHTML = `
            <span style="opacity: 0.7;">[${timestamp}]</span>
            <span>${message}</span>
        `;
        
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    showFinalResults(results) {
        // Mettre à jour les statistiques finales
        document.getElementById('finalEmailsMoved').textContent = results.emailsMoved.toLocaleString();
        document.getElementById('finalFoldersCreated').textContent = results.foldersCreated;
        document.getElementById('finalErrors').textContent = results.failed;
        
        // Changer la couleur du compteur d'erreurs si nécessaire
        const errorsElement = document.getElementById('finalErrors');
        if (errorsElement && results.failed > 0) {
            errorsElement.style.color = 'var(--danger-color)';
        }
        
        this.showStep('results');
    }

    showError(message) {
        window.uiManager?.showToast(message, 'error');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
    createFolderSelect(domainData, existingFolders) {
        const options = existingFolders.map(folder => 
            `<option value="${folder.id}" ${folder.displayName === domainData.suggestedFolder ? 'selected' : ''}>
                ${folder.displayName}
            </option>`
        ).join('');
        
        return `<select class="folder-select" data-domain="${domainData.domain}" onclick="event.stopPropagation()" onchange="window.domainOrganizer.handleFolderChange(event)">${options}</select>`;
    }

    updateDomainInterface(domain, actionType) {
        const domainElement = document.querySelector(`[data-domain="${domain}"]`);
        if (!domainElement) return;
        
        const folderConfig = domainElement.querySelector('.folder-config');
        const badge = domainElement.querySelector('.action-badge');
        
        if (badge) {
            const isNew = actionType === 'create-new';
            badge.className = `action-badge ${isNew ? 'action-new' : 'action-existing'}`;
            badge.textContent = isNew ? 'Nouveau' : 'Existant';
        }
        
        // Regénérer la configuration de dossier si nécessaire
        if (folderConfig && this.selectedActions.has(domain)) {
            const action = this.selectedActions.get(domain);
            // L'interface se met à jour automatiquement via les event listeners
        }
    }

    getEmailFrom(email) {
        return email.from?.emailAddress?.name || 
               email.from?.emailAddress?.address || 
               'Expéditeur inconnu';
    }

    getEmailPreview(email) {
        if (email.bodyPreview) {
            return email.bodyPreview.substring(0, 100);
        }
        return 'Aucun aperçu disponible';
    }

    formatEmailDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `${diffDays}j`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)}sem`;
        
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
        });
    }

    handleIndividualEmailFolderChange(event) {
        const domain = event.target.dataset.domain;
        const emailId = event.target.dataset.emailId;
        const selectedValue = event.target.value;
        
        if (selectedValue === 'custom') {
            const newFolderName = prompt('Nom du nouveau dossier:');
            if (newFolderName && newFolderName.trim()) {
                // Ajouter à la queue de création de dossiers
                if (!this.folderCreationQueue.has(newFolderName)) {
                    this.folderCreationQueue.set(newFolderName, new Set());
                }
                this.folderCreationQueue.get(newFolderName).add(`${domain}-${emailId}`);
                
                // Mettre à jour l'interface
                const option = document.createElement('option');
                option.value = `custom-${newFolderName}`;
                option.selected = true;
                option.textContent = `➕ ${newFolderName}`;
                
                event.target.insertBefore(option, event.target.lastElementChild);
                
                this.showSuccess(`Email configuré pour le dossier "${newFolderName}"`);
            } else {
                event.target.value = 'domain-default';
            }
        }
        
        this.validateConfiguration();
    }

    showSuccess(message) {
        window.uiManager?.showToast(message, 'success');
    }

    // ================================================
    // NAVIGATION ET CONTRÔLES
    // ================================================
    
    goBack() {
        this.showStep('configure');
    }

    resetForm() {
        // Revenir à l'étape de configuration
        this.showStep('configure');
        
        // Réinitialiser le formulaire
        document.getElementById('organizeForm')?.reset();
        
        // Remettre les dates par défaut
        this.setDefaultDates();
        
        // Réinitialiser les données
        this.currentAnalysis = null;
        this.selectedActions.clear();
        this.emailSelections.clear();
        this.validationErrors.clear();
        this.folderCreationQueue.clear();
        this.isProcessing = false;
        
        console.log('[DomainOrganizer] ✅ Form reset to initial state v5.0');
    }

    // ================================================
    // MÉTHODES HÉRITÉES ET COMPATIBILITÉ
    // ================================================
    
    configure(options = {}) {
        const {
            excludeDomains = [],
            excludeEmails = [],
            onProgress = null,
            createFolders = true,
            maxEmailsPerBatch = 20
        } = options;

        this.excludedDomains = new Set(excludeDomains.map(d => d.toLowerCase()));
        this.excludedEmails = new Set(excludeEmails.map(e => e.toLowerCase()));
        this.progressCallback = onProgress;
        this.createFolders = createFolders;
        this.maxEmailsPerBatch = maxEmailsPerBatch;
    }

    async analyzeEmails(filters = {}) {
        console.log('[DomainOrganizer] Starting analysis v5.0...');
        
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
        this.emailSelections.clear();
        this.validationErrors.clear();
        this.folderCreationQueue.clear();
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

    prepareActions() {
        this.selectedActions.clear();
        
        this.domainAnalysis.forEach((analysis, domain) => {
            if (analysis.count > 0) {
                this.selectedActions.set(domain, {
                    domain: domain,
                    action: analysis.action,
                    targetFolder: analysis.suggestedFolder,
                    existingFolderId: analysis.existingFolder?.id,
                    emailCount: analysis.count,
                    selected: true
                });
            }
        });
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
            
            throw new Error(`Échec de création: ${response.status} ${response.statusText}`);
            
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
        
        if (!response.ok) {
            throw new Error(`Échec du déplacement par lot: ${response.statusText}`);
        }
        
        return await response.json();
    }
}

// Créer l'instance globale
window.domainOrganizer = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ Module chargé - Version 5.0 Interface harmonisée');

// ================================================
// GESTION AUTONOME
// ================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[DomainOrganizer] Initialisation autonome v5.0...');
    
    document.addEventListener('click', function(e) {
        const rangerButton = e.target.closest('[data-page="ranger"]');
        if (!rangerButton) return;
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[DomainOrganizer] Bouton Ranger cliqué - v5.0');
        
        if (!window.authService?.isAuthenticated()) {
            window.uiManager?.showToast('Veuillez vous connecter pour utiliser cette fonctionnalité', 'warning');
            return;
        }
        
        window.domainOrganizer.showPage();
        return false;
    }, true);
});

window.domainOrganizer.showPage = function() {
    console.log('[DomainOrganizer] Affichage de la page v5.0...');
    
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
        this.emailSelections.clear();
        this.validationErrors.clear();
        this.folderCreationQueue.clear();
        
        await this.initializePage();
        console.log('[DomainOrganizer] ✅ Initialization complete v5.0');
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
    
    console.log('[DomainOrganizer] ✅ Page v5.0 affichée avec succès');
};

window.addEventListener('beforeunload', () => {
    window.domainOrganizerActive = false;
});

window.showDomainOrganizer = function() {
    window.domainOrganizer.showPage();
};
