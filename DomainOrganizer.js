// DomainOrganizer.js - Version 6.3.0 - Version structurée et stable
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
        console.log('[DomainOrganizer] ✅ v6.3 - Version structurée et stable');
    }

    getPageHTML() {
        return `<div class="domain-organizer-app" id="domainOrganizerApp">
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
                        <h3>Période d'analyse</h3>
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
                        <h3>Exclusions (optionnel)</h3>
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

        <!-- Étape Analyse -->
        <div class="step-content" id="analyzeStep">
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-search fa-spin"></i> Analyse en cours</h2>
                    <p class="subtitle">Nous analysons vos emails pour proposer une organisation</p>
                </div>
                
                <div class="progress-section">
                    <div class="progress-info">
                        <span id="progressLabel">Initialisation</span>
                        <span id="progressPercent">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-message" id="progressMessage">Préparation de l'analyse...</div>
                </div>

                <div class="analysis-details">
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>Emails analysés: <strong id="emailsAnalyzed">0</strong></span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-at"></i>
                        <span>Domaines trouvés: <strong id="domainsFound">0</strong></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Étape Validation -->
        <div class="step-content" id="reviewStep">
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-check-square"></i> Validation de l'organisation</h2>
                    <p class="subtitle">Vérifiez et ajustez l'organisation proposée</p>
                </div>

                <div class="stats-section">
                    <div class="stat-card">
                        <div class="stat-icon email">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="statEmails">0</div>
                            <div class="stat-label">Emails</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon domain">
                            <i class="fas fa-at"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="statDomains">0</div>
                            <div class="stat-label">Domaines</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon folder">
                            <i class="fas fa-folder"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="statFolders">0</div>
                            <div class="stat-label">Dossiers</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon new">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="statNew">0</div>
                            <div class="stat-label">Nouveaux</div>
                        </div>
                    </div>
                </div>

                <div class="controls-section">
                    <div class="global-controls">
                        <button class="btn-secondary" onclick="window.organizerInstance.selectAllDomains()">
                            <i class="fas fa-check-square"></i>
                            <span>Tout sélectionner</span>
                        </button>
                        <button class="btn-secondary" onclick="window.organizerInstance.deselectAllDomains()">
                            <i class="fas fa-square"></i>
                            <span>Tout désélectionner</span>
                        </button>
                    </div>
                    
                    <div class="validation-panel" id="validationPanel"></div>
                </div>

                <div class="domains-container">
                    <div class="domains-header">
                        <h3><i class="fas fa-list"></i> Domaines détectés</h3>
                        <span class="domains-count" id="domainsCount">0 domaines</span>
                    </div>
                    <div class="domains-list" id="domainsList"></div>
                </div>

                <div class="summary-section">
                    <div class="summary-box">
                        <h3><i class="fas fa-clipboard-list"></i> Résumé des actions</h3>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-value" id="summaryEmails">0</div>
                                <div class="summary-label">emails seront déplacés</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value" id="summaryFolders">0</div>
                                <div class="summary-label">dossiers seront créés</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value" id="summaryDomains">0</div>
                                <div class="summary-label">domaines traités</div>
                            </div>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button class="btn-secondary" onclick="window.organizerInstance.goBack()">
                            <i class="fas fa-arrow-left"></i>
                            <span>Retour</span>
                        </button>
                        <button class="btn-primary" id="executeBtn" onclick="window.organizerInstance.executeOrganization()" disabled>
                            <i class="fas fa-play"></i>
                            <span>Lancer l'organisation</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Étape Exécution -->
        <div class="step-content" id="executeStep">
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-cogs fa-spin"></i> Organisation en cours</h2>
                    <p class="subtitle">L'organisation de votre boîte mail est en cours</p>
                </div>

                <div class="execution-status">
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
                </div>

                <div class="execution-log">
                    <div class="log-header">
                        <h3><i class="fas fa-terminal"></i> Journal d'exécution</h3>
                        <button class="btn-small" onclick="window.organizerInstance.clearLog()">
                            <i class="fas fa-trash"></i>
                            Effacer
                        </button>
                    </div>
                    <div class="log-container" id="executionLog"></div>
                </div>
            </div>
        </div>

        <!-- Étape Résultats -->
        <div class="step-content" id="resultsStep">
            <div class="card">
                <div class="success-header">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Organisation terminée avec succès</h2>
                    <p>Votre boîte mail a été organisée selon vos préférences.</p>
                </div>

                <div class="results-summary">
                    <div class="result-card success">
                        <div class="result-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="result-content">
                            <div class="result-value" id="finalEmailsMoved">0</div>
                            <div class="result-label">Emails déplacés</div>
                        </div>
                    </div>
                    <div class="result-card info">
                        <div class="result-icon">
                            <i class="fas fa-folder-plus"></i>
                        </div>
                        <div class="result-content">
                            <div class="result-value" id="finalFoldersCreated">0</div>
                            <div class="result-label">Dossiers créés</div>
                        </div>
                    </div>
                    <div class="result-card warning">
                        <div class="result-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="result-content">
                            <div class="result-value" id="finalErrors">0</div>
                            <div class="result-label">Erreurs</div>
                        </div>
                    </div>
                </div>

                <div class="results-actions">
                    <button class="btn-secondary" onclick="window.organizerInstance.resetForm()">
                        <i class="fas fa-redo"></i>
                        <span>Nouveau rangement</span>
                    </button>
                    <button class="btn-primary" onclick="window.location.reload()">
                        <i class="fas fa-home"></i>
                        <span>Retour accueil</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
/* Variables CSS */
:root {
    --primary-color: #3b82f6;
    --primary-dark: #2563eb;
    --primary-light: #dbeafe;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --info-color: #06b6d4;
    
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1e293b;
    --gray-900: #0f172a;
    
    --border-radius: 12px;
    --border-radius-sm: 8px;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    
    --transition-fast: 0.15s ease;
    --transition: 0.3s ease;
    --transition-slow: 0.5s ease;
}

/* Reset et base */
.domain-organizer-app {
    max-width: 1400px !important;
    margin: 0 auto !important;
    padding: 24px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    color: var(--gray-900) !important;
    line-height: 1.6 !important;
    background: var(--gray-50) !important;
    min-height: calc(100vh - 48px) !important;
    animation: fadeIn var(--transition) ease !important;
}

.domain-organizer-app * {
    box-sizing: border-box !important;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Header */
.organizer-header {
    margin-bottom: 32px !important;
    text-align: center !important;
    background: white !important;
    padding: 32px !important;
    border-radius: var(--border-radius) !important;
    box-shadow: var(--shadow) !important;
    border: 1px solid var(--gray-200) !important;
}

.organizer-header h1 {
    font-size: 32px !important;
    font-weight: 700 !important;
    margin-bottom: 24px !important;
    color: var(--gray-900) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 16px !important;
}

.organizer-header h1 i {
    color: var(--primary-color) !important;
    font-size: 28px !important;
}

/* Navigation par étapes */
.step-progress {
    display: flex !important;
    justify-content: center !important;
    gap: 8px !important;
    margin: 0 auto !important;
    max-width: 800px !important;
    background: var(--gray-100) !important;
    padding: 8px !important;
    border-radius: var(--border-radius) !important;
}

.step {
    flex: 1 !important;
    padding: 16px 20px !important;
    border-radius: var(--border-radius-sm) !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    transition: all var(--transition) ease !important;
    background: transparent !important;
    color: var(--gray-500) !important;
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
    transition: all var(--transition-fast) ease !important;
}

.step.active {
    background: var(--primary-color) !important;
    color: white !important;
    box-shadow: var(--shadow) !important;
    transform: translateY(-2px) !important;
}

.step.completed {
    background: var(--success-color) !important;
    color: white !important;
    border-color: var(--success-color) !important;
}

.step:hover:not(.active) {
    background: var(--gray-200) !important;
    color: var(--gray-700) !important;
}

/* Contenu principal */
.main-content {
    min-height: 600px !important;
    position: relative !important;
}

.step-content {
    display: none !important;
    opacity: 0 !important;
    transform: translateX(20px) !important;
    transition: all var(--transition) ease !important;
}

.step-content.active {
    display: block !important;
    opacity: 1 !important;
    transform: translateX(0) !important;
    animation: slideIn var(--transition) ease !important;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

/* Cards */
.card {
    background: white !important;
    border-radius: var(--border-radius) !important;
    box-shadow: var(--shadow) !important;
    border: 1px solid var(--gray-200) !important;
    overflow: hidden !important;
    transition: all var(--transition) ease !important;
}

.card:hover {
    box-shadow: var(--shadow-lg) !important;
}

.card-header {
    padding: 32px !important;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)) !important;
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

/* Formulaires */
.config-form {
    padding: 32px !important;
}

.form-section {
    margin-bottom: 32px !important;
    padding-bottom: 24px !important;
    border-bottom: 1px solid var(--gray-200) !important;
}

.form-section:last-child {
    border-bottom: none !important;
    margin-bottom: 0 !important;
}

.form-section h3 {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: var(--gray-800) !important;
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
    color: var(--gray-700) !important;
    font-size: 14px !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}

.form-group label i {
    color: var(--primary-color) !important;
    width: 16px !important;
}

.form-group input {
    padding: 12px 16px !important;
    border: 2px solid var(--gray-200) !important;
    border-radius: var(--border-radius-sm) !important;
    font-size: 16px !important;
    transition: all var(--transition-fast) ease !important;
    background: white !important;
}

.form-group input:focus {
    outline: none !important;
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 3px var(--primary-light) !important;
    transform: translateY(-1px) !important;
}

.help-text {
    font-size: 12px !important;
    color: var(--gray-500) !important;
    font-style: italic !important;
}

/* Boutons */
.btn-primary, .btn-secondary, .btn-small {
    padding: 12px 24px !important;
    border: none !important;
    border-radius: var(--border-radius-sm) !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    cursor: pointer !important;
    transition: all var(--transition-fast) ease !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    text-decoration: none !important;
    position: relative !important;
    overflow: hidden !important;
}

.btn-small {
    padding: 8px 16px !important;
    font-size: 14px !important;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)) !important;
    color: white !important;
    box-shadow: var(--shadow) !important;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: var(--shadow-lg) !important;
    filter: brightness(1.1) !important;
}

.btn-primary:active {
    transform: translateY(0) !important;
}

.btn-primary:disabled {
    background: var(--gray-300) !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
    filter: none !important;
}

.btn-secondary {
    background: white !important;
    color: var(--gray-700) !important;
    border: 2px solid var(--gray-200) !important;
    box-shadow: var(--shadow-sm) !important;
}

.btn-secondary:hover {
    background: var(--gray-50) !important;
    border-color: var(--gray-300) !important;
    transform: translateY(-1px) !important;
    box-shadow: var(--shadow) !important;
}

.form-actions {
    text-align: center !important;
    margin-top: 32px !important;
    padding-top: 24px !important;
    border-top: 1px solid var(--gray-200) !important;
}

/* Progression */
.progress-section {
    margin: 24px 32px !important;
}

.progress-info {
    display: flex !important;
    justify-content: space-between !important;
    margin-bottom: 8px !important;
    font-weight: 600 !important;
    color: var(--gray-700) !important;
}

.progress-bar {
    height: 8px !important;
    background: var(--gray-200) !important;
    border-radius: 4px !important;
    overflow: hidden !important;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1) !important;
}

.progress-fill {
    height: 100% !important;
    background: linear-gradient(90deg, var(--primary-color), var(--info-color)) !important;
    transition: width var(--transition-slow) ease !important;
    border-radius: 4px !important;
    position: relative !important;
}

.progress-fill::after {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent) !important;
    animation: shimmer 2s infinite !important;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.progress-message {
    margin-top: 12px !important;
    text-align: center !important;
    color: var(--gray-600) !important;
    font-style: italic !important;
}

.analysis-details {
    padding: 24px 32px !important;
    display: flex !important;
    justify-content: center !important;
    gap: 32px !important;
    background: var(--gray-50) !important;
}

.detail-item {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    color: var(--gray-700) !important;
    font-weight: 500 !important;
}

.detail-item i {
    color: var(--primary-color) !important;
    width: 20px !important;
}

/* Statistiques */
.stats-section {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 24px !important;
    padding: 32px !important;
}

.stat-card {
    background: white !important;
    border: 2px solid var(--gray-200) !important;
    border-radius: var(--border-radius) !important;
    padding: 24px !important;
    text-align: center !important;
    transition: all var(--transition) ease !important;
    position: relative !important;
    overflow: hidden !important;
}

.stat-card::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 4px !important;
    background: var(--primary-color) !important;
}

.stat-card:hover {
    transform: translateY(-4px) !important;
    box-shadow: var(--shadow-lg) !important;
    border-color: var(--primary-color) !important;
}

.stat-icon {
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 20px !important;
    margin: 0 auto 16px auto !important;
    color: white !important;
}

.stat-icon.email { background: var(--primary-color) !important; }
.stat-icon.domain { background: var(--info-color) !important; }
.stat-icon.folder { background: var(--warning-color) !important; }
.stat-icon.new { background: var(--success-color) !important; }

.stat-value {
    font-size: 32px !important;
    font-weight: 700 !important;
    color: var(--gray-900) !important;
    margin-bottom: 4px !important;
}

.stat-label {
    font-size: 14px !important;
    color: var(--gray-600) !important;
    font-weight: 500 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

/* Contrôles */
.controls-section {
    padding: 0 32px 24px 32px !important;
}

.global-controls {
    display: flex !important;
    gap: 16px !important;
    margin-bottom: 24px !important;
    justify-content: center !important;
}

.validation-panel {
    min-height: 40px !important;
}

.validation-error {
    background: #fef2f2 !important;
    border: 1px solid #fecaca !important;
    color: #dc2626 !important;
    padding: 12px 16px !important;
    border-radius: var(--border-radius-sm) !important;
    margin-bottom: 8px !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-size: 14px !important;
    animation: shake 0.5s ease !important;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

/* Liste des domaines */
.domains-container {
    padding: 0 32px 32px 32px !important;
}

.domains-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 16px !important;
    padding-bottom: 12px !important;
    border-bottom: 2px solid var(--gray-200) !important;
}

.domains-header h3 {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: var(--gray-800) !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}

.domains-count {
    background: var(--primary-light) !important;
    color: var(--primary-dark) !important;
    padding: 4px 12px !important;
    border-radius: 20px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
}

.domains-list {
    max-height: 500px !important;
    overflow-y: auto !important;
    border: 2px solid var(--gray-200) !important;
    border-radius: var(--border-radius) !important;
    background: white !important;
}

.domain-item {
    border-bottom: 1px solid var(--gray-200) !important;
    transition: all var(--transition-fast) ease !important;
}

.domain-item:hover {
    background: var(--gray-50) !important;
}

.domain-item:last-child {
    border-bottom: none !important;
}

.domain-header {
    padding: 20px 24px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    cursor: pointer !important;
}

.domain-info {
    display: flex !important;
    align-items: center !important;
    gap: 16px !important;
    flex: 1 !important;
}

.domain-checkbox {
    width: 20px !important;
    height: 20px !important;
    cursor: pointer !important;
    accent-color: var(--primary-color) !important;
}

.domain-icon {
    width: 40px !important;
    height: 40px !important;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)) !important;
    border-radius: var(--border-radius-sm) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: white !important;
    font-size: 16px !important;
    box-shadow: var(--shadow) !important;
}

.domain-details {
    display: flex !important;
    flex-direction: column !important;
    gap: 4px !important;
}

.domain-name {
    font-weight: 700 !important;
    font-size: 16px !important;
    color: var(--gray-900) !important;
}

.domain-count {
    color: var(--gray-600) !important;
    font-size: 14px !important;
}

.domain-actions {
    display: flex !important;
    align-items: center !important;
    gap: 16px !important;
}

.folder-config {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    min-width: 200px !important;
}

.folder-select, .folder-input {
    padding: 8px 12px !important;
    border: 2px solid var(--gray-200) !important;
    border-radius: var(--border-radius-sm) !important;
    font-size: 14px !important;
    transition: all var(--transition-fast) ease !important;
    background: white !important;
}

.folder-select:focus, .folder-input:focus {
    outline: none !important;
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 3px var(--primary-light) !important;
}

.action-badge {
    padding: 6px 12px !important;
    border-radius: 20px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

.action-new {
    background: #d1fae5 !important;
    color: #065f46 !important;
}

.action-existing {
    background: #dbeafe !important;
    color: #1e40af !important;
}

/* Résumé */
.summary-section {
    padding: 32px !important;
    background: var(--gray-50) !important;
}

.summary-box {
    background: white !important;
    border: 2px solid var(--gray-200) !important;
    border-radius: var(--border-radius) !important;
    padding: 24px !important;
    margin-bottom: 24px !important;
    box-shadow: var(--shadow) !important;
}

.summary-box h3 {
    margin-bottom: 16px !important;
    color: var(--gray-800) !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}

.summary-grid {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 24px !important;
}

.summary-item {
    text-align: center !important;
    padding: 16px !important;
    background: var(--gray-50) !important;
    border-radius: var(--border-radius-sm) !important;
}

.summary-value {
    font-size: 24px !important;
    font-weight: 700 !important;
    color: var(--primary-color) !important;
    margin-bottom: 4px !important;
}

.summary-label {
    font-size: 14px !important;
    color: var(--gray-600) !important;
}

.action-buttons {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 16px !important;
}

/* Exécution */
.execution-status {
    padding: 32px !important;
}

.current-operation {
    display: flex !important;
    align-items: center !important;
    gap: 20px !important;
    padding: 24px !important;
    background: var(--gray-50) !important;
    border-radius: var(--border-radius) !important;
    margin-bottom: 24px !important;
    border: 2px solid var(--gray-200) !important;
}

.operation-icon {
    width: 56px !important;
    height: 56px !important;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)) !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: white !important;
    font-size: 24px !important;
    box-shadow: var(--shadow) !important;
}

.operation-details {
    flex: 1 !important;
}

.operation-title {
    font-weight: 700 !important;
    font-size: 18px !important;
    color: var(--gray-900) !important;
    margin-bottom: 4px !important;
}

.operation-subtitle {
    color: var(--gray-600) !important;
    font-size: 14px !important;
}

.operation-status {
    padding: 8px 16px !important;
    background: var(--success-color) !important;
    color: white !important;
    border-radius: 20px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    white-space: nowrap !important;
}

/* Journal */
.execution-log {
    padding: 32px !important;
    background: var(--gray-50) !important;
}

.log-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 16px !important;
}

.log-header h3 {
    color: var(--gray-800) !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}

.log-container {
    max-height: 300px !important;
    overflow-y: auto !important;
    background: var(--gray-900) !important;
    color: white !important;
    border-radius: var(--border-radius) !important;
    padding: 16px !important;
    font-family: 'Courier New', monospace !important;
    font-size: 13px !important;
    line-height: 1.4 !important;
    box-shadow: var(--shadow) !important;
}

.log-entry {
    margin-bottom: 4px !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 2px 0 !important;
}

.log-entry.success { color: #4ade80 !important; }
.log-entry.error { color: #f87171 !important; }
.log-entry.warning { color: #fbbf24 !important; }
.log-entry.info { color: #60a5fa !important; }

/* Résultats finaux */
.success-header {
    text-align: center !important;
    padding: 40px 32px !important;
    background: linear-gradient(135deg, var(--success-color), #059669) !important;
    color: white !important;
}

.success-icon {
    width: 80px !important;
    height: 80px !important;
    background: rgba(255, 255, 255, 0.2) !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: white !important;
    font-size: 36px !important;
    margin: 0 auto 16px auto !important;
    backdrop-filter: blur(10px) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
}

.success-header h2 {
    font-size: 28px !important;
    margin-bottom: 8px !important;
    font-weight: 700 !important;
}

.success-header p {
    opacity: 0.9 !important;
    font-size: 16px !important;
}

.results-summary {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 24px !important;
    padding: 32px !important;
}

.result-card {
    background: white !important;
    border-radius: var(--border-radius) !important;
    padding: 24px !important;
    text-align: center !important;
    box-shadow: var(--shadow) !important;
    border: 2px solid var(--gray-200) !important;
    transition: all var(--transition) ease !important;
    position: relative !important;
    overflow: hidden !important;
}

.result-card::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 4px !important;
}

.result-card.success::before { background: var(--success-color) !important; }
.result-card.info::before { background: var(--info-color) !important; }
.result-card.warning::before { background: var(--warning-color) !important; }

.result-card:hover {
    transform: translateY(-4px) !important;
    box-shadow: var(--shadow-lg) !important;
}

.result-icon {
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 20px !important;
    margin: 0 auto 16px auto !important;
    color: white !important;
}

.result-card.success .result-icon { background: var(--success-color) !important; }
.result-card.info .result-icon { background: var(--info-color) !important; }
.result-card.warning .result-icon { background: var(--warning-color) !important; }

.result-value {
    font-size: 32px !important;
    font-weight: 700 !important;
    margin-bottom: 4px !important;
}

.result-card.success .result-value { color: var(--success-color) !important; }
.result-card.info .result-value { color: var(--info-color) !important; }
.result-card.warning .result-value { color: var(--warning-color) !important; }

.result-label {
    font-size: 14px !important;
    color: var(--gray-600) !important;
    font-weight: 500 !important;
}

.results-actions {
    display: flex !important;
    justify-content: center !important;
    gap: 16px !important;
    padding: 32px !important;
}

/* Responsive */
@media (max-width: 1024px) {
    .stats-section {
        grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .summary-grid {
        grid-template-columns: 1fr !important;
    }
    
    .results-summary {
        grid-template-columns: 1fr !important;
    }
}

@media (max-width: 768px) {
    .domain-organizer-app {
        padding: 16px !important;
    }
    
    .form-row {
        grid-template-columns: 1fr !important;
    }
    
    .stats-section {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
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
    
    .global-controls {
        flex-direction: column !important;
        gap: 8px !important;
    }
    
    .domain-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 16px !important;
    }
    
    .domain-actions {
        width: 100% !important;
        justify-content: space-between !important;
    }
    
    .action-buttons {
        flex-direction: column !important;
        gap: 12px !important;
    }
    
    .results-actions {
        flex-direction: column !important;
    }
    
    .analysis-details {
        flex-direction: column !important;
        gap: 16px !important;
        text-align: center !important;
    }
    
    .current-operation {
        flex-direction: column !important;
        text-align: center !important;
        gap: 16px !important;
    }
}

/* Animations d'amélioration */
@media (prefers-reduced-motion: no-preference) {
    .btn-primary, .btn-secondary {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .domain-item {
        transition: all 0.15s ease !important;
    }
}

/* Scrollbar personnalisée */
.domains-list::-webkit-scrollbar,
.log-container::-webkit-scrollbar {
    width: 8px !important;
}

.domains-list::-webkit-scrollbar-track,
.log-container::-webkit-scrollbar-track {
    background: var(--gray-100) !important;
    border-radius: 4px !important;
}

.domains-list::-webkit-scrollbar-thumb,
.log-container::-webkit-scrollbar-thumb {
    background: var(--gray-400) !important;
    border-radius: 4px !important;
}

.domains-list::-webkit-scrollbar-thumb:hover,
.log-container::-webkit-scrollbar-thumb:hover {
    background: var(--gray-500) !important;
}

/* États de chargement */
.loading {
    position: relative !important;
    overflow: hidden !important;
}

.loading::after {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: -100% !important;
    width: 100% !important;
    height: 100% !important;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent) !important;
    animation: loading 1.5s infinite !important;
}

@keyframes loading {
    0% { left: -100%; }
    100% { left: 100%; }
}

/* Focus visible pour l'accessibilité */
*:focus-visible {
    outline: 2px solid var(--primary-color) !important;
    outline-offset: 2px !important;
}
</style>`;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v6.3...');
        
        // Vérification de l'authentification
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }

        // Attendre que le DOM soit complètement chargé
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Vérifier que les éléments sont présents
        if (!document.getElementById('organizeForm')) {
            console.error('[DomainOrganizer] Form not found, retrying...');
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        this.setupEventListeners();
        this.setDefaultDates();
        this.showStep('configure');
        this.isInitialized = true;
        
        console.log('[DomainOrganizer] ✅ Successfully initialized v6.3');
        return true;
    }

    setupEventListeners() {
        const form = document.getElementById('organizeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
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
        }
        if (endDateInput) {
            endDateInput.valueAsDate = today;
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
        });

        // Afficher l'étape active
        const activeStep = document.getElementById(`${stepName}Step`);
        if (activeStep) {
            activeStep.classList.add('active');
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

        const formData = this.getFormData();
        
        // Validation basique
        if (!formData.startDate && !formData.endDate) {
            this.showError('Veuillez sélectionner au moins une date');
            return;
        }

        console.log('[DomainOrganizer] Starting analysis with:', formData);
        await this.startAnalysis(formData);
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

    async startAnalysis(formData) {
        try {
            this.isProcessing = true;
            this.showStep('analyze');

            // Configuration de l'organisateur
            this.configure({
                excludeDomains: formData.excludeDomains,
                excludeEmails: formData.excludeEmails,
                onProgress: (progress) => this.updateAnalysisProgress(progress)
            });

            // Lancement de l'analyse
            const results = await this.analyzeEmails({
                startDate: formData.startDate,
                endDate: formData.endDate,
                folders: ['inbox']
            });

            this.currentAnalysis = results;
            this.showValidationInterface(results);

        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            this.showError(`Erreur lors de l'analyse: ${error.message}`);
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
        const emailsAnalyzed = document.getElementById('emailsAnalyzed');
        const domainsFound = document.getElementById('domainsFound');

        if (progressFill) progressFill.style.width = `${progress.percent}%`;
        if (progressPercent) progressPercent.textContent = `${progress.percent}%`;
        if (progressLabel) progressLabel.textContent = progress.stage || 'Analyse';
        if (progressMessage) progressMessage.textContent = progress.message || 'Analyse en cours...';
        
        if (progress.emailsAnalyzed !== undefined && emailsAnalyzed) {
            emailsAnalyzed.textContent = progress.emailsAnalyzed.toLocaleString();
        }
        if (progress.domainsFound !== undefined && domainsFound) {
            domainsFound.textContent = progress.domainsFound;
        }
    }

    showValidationInterface(results) {
        console.log('[DomainOrganizer] Showing validation interface with results:', results);

        // Mise à jour des statistiques
        const statElements = {
            statEmails: results.totalEmails,
            statDomains: results.totalDomains,
            statFolders: results.totalDomains,
            statNew: results.domainsToCreate
        };

        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = typeof value === 'number' ? value.toLocaleString() : value;
            }
        });

        // Mise à jour du compteur de domaines
        const domainsCount = document.getElementById('domainsCount');
        if (domainsCount) {
            domainsCount.textContent = `${results.totalDomains} domaines`;
        }

        // Génération de la liste des domaines
        this.generateDomainsView(results.domains);
        this.prepareActions();
        this.validateConfiguration();
        this.updateSummary();
        
        this.showStep('review');
    }

    generateDomainsView(domains) {
        const container = document.getElementById('domainsList');
        if (!container) {
            console.error('[DomainOrganizer] Domains list container not found');
            return;
        }

        container.innerHTML = '';
        
        // Trier les domaines par nombre d'emails (décroissant)
        const sortedDomains = [...domains].sort((a, b) => b.count - a.count);

        sortedDomains.forEach((domain, index) => {
            const domainElement = this.createDomainElement(domain, index);
            container.appendChild(domainElement);
        });

        console.log(`[DomainOrganizer] Generated ${sortedDomains.length} domain elements`);
    }

    createDomainElement(domainData, index) {
        const isNewFolder = domainData.action === 'create-new';
        const existingFolders = Array.from(this.existingFolders.values());
        
        const domainElement = document.createElement('div');
        domainElement.className = 'domain-item';
        domainElement.dataset.domain = domainData.domain;

        domainElement.innerHTML = `
            <div class="domain-header">
                <div class="domain-info">
                    <input type="checkbox" class="domain-checkbox" 
                           data-domain="${domainData.domain}" 
                           onchange="window.organizerInstance.handleDomainToggle(event)" 
                           checked>
                    <div class="domain-icon">
                        <i class="fas fa-at"></i>
                    </div>
                    <div class="domain-details">
                        <div class="domain-name">${domainData.domain}</div>
                        <div class="domain-count">${domainData.count.toLocaleString()} emails</div>
                    </div>
                </div>
                <div class="domain-actions">
                    <div class="folder-config">
                        ${isNewFolder ? 
                            `<input type="text" class="folder-input" 
                                    value="${domainData.suggestedFolder}" 
                                    data-domain="${domainData.domain}" 
                                    onchange="window.organizerInstance.handleFolderChange(event)" 
                                    placeholder="Nom du dossier">` :
                            this.createFolderSelect(domainData, existingFolders)
                        }
                        <select class="folder-select" 
                                data-domain="${domainData.domain}" 
                                onchange="window.organizerInstance.handleActionTypeChange(event)">
                            <option value="create-new" ${isNewFolder ? 'selected' : ''}>Créer nouveau dossier</option>
                            <option value="move-existing" ${!isNewFolder ? 'selected' : ''}>Utiliser dossier existant</option>
                        </select>
                    </div>
                    <span class="action-badge ${isNewFolder ? 'action-new' : 'action-existing'}">
                        ${isNewFolder ? 'Nouveau' : 'Existant'}
                    </span>
                </div>
            </div>
        `;

        return domainElement;
    }

    createFolderSelect(domainData, existingFolders) {
        const options = existingFolders.map(folder => 
            `<option value="${folder.id}" ${folder.displayName === domainData.suggestedFolder ? 'selected' : ''}>
                ${folder.displayName}
            </option>`
        ).join('');
        
        return `<select class="folder-select" data-domain="${domainData.domain}" onchange="window.organizerInstance.handleFolderChange(event)">${options}</select>`;
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

    updateDomainInterface(domain, actionType) {
        const domainElement = document.querySelector(`[data-domain="${domain}"]`);
        if (!domainElement) return;

        const badge = domainElement.querySelector('.action-badge');
        if (badge) {
            const isNew = actionType === 'create-new';
            badge.className = `action-badge ${isNew ? 'action-new' : 'action-existing'}`;
            badge.textContent = isNew ? 'Nouveau' : 'Existant';
        }

        // Mettre à jour l'interface de sélection de dossier
        const folderConfig = domainElement.querySelector('.folder-config');
        const existingFolders = Array.from(this.existingFolders.values());
        const action = this.selectedActions.get(domain);
        
        if (folderConfig && action) {
            const isNewFolder = actionType === 'create-new';
            folderConfig.innerHTML = `
                ${isNewFolder ? 
                    `<input type="text" class="folder-input" 
                            value="${action.targetFolder}" 
                            data-domain="${domain}" 
                            onchange="window.organizerInstance.handleFolderChange(event)" 
                            placeholder="Nom du dossier">` :
                    this.createFolderSelect(action, existingFolders)
                }
                <select class="folder-select" 
                        data-domain="${domain}" 
                        onchange="window.organizerInstance.handleActionTypeChange(event)">
                    <option value="create-new" ${isNewFolder ? 'selected' : ''}>Créer nouveau dossier</option>
                    <option value="move-existing" ${!isNewFolder ? 'selected' : ''}>Utiliser dossier existant</option>
                </select>
            `;
        }
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

    validateConfiguration() {
        this.validationErrors.clear();
        const validationPanel = document.getElementById('validationPanel');
        
        if (!validationPanel) return;

        // Valider chaque action sélectionnée
        this.selectedActions.forEach((action, domain) => {
            if (!action.selected) return;

            if (action.action === 'create-new') {
                if (!action.targetFolder || action.targetFolder.trim() === '') {
                    this.validationErrors.set(domain, 'Le nom du dossier ne peut pas être vide');
                } else if (action.targetFolder.length > 255) {
                    this.validationErrors.set(domain, 'Le nom du dossier est trop long (max 255 caractères)');
                } else if (/[<>:"/\\|?*]/.test(action.targetFolder)) {
                    this.validationErrors.set(domain, 'Le nom du dossier contient des caractères invalides');
                }
            }
        });

        this.displayValidationErrors(validationPanel);
        
        // Activer/désactiver le bouton d'exécution
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            const hasErrors = this.validationErrors.size > 0;
            const hasSelection = this.getSelectedDomainsCount() > 0;
            executeBtn.disabled = hasErrors || !hasSelection;
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
            totalEmails += action.emailCount;
            if (action.action === 'create-new') newFolders++;
        });

        // Mise à jour des éléments du résumé
        const summaryElements = {
            summaryEmails: totalEmails.toLocaleString(),
            summaryFolders: newFolders,
            summaryDomains: selectedActions.length
        };

        Object.entries(summaryElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    getSelectedDomainsCount() {
        return Array.from(this.selectedActions.values()).filter(action => action.selected).length;
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

    async executeOrganization() {
        if (this.isProcessing) {
            console.log('[DomainOrganizer] Already processing, ignoring execute');
            return;
        }

        try {
            this.isProcessing = true;
            this.showStep('execute');

            // Préparer les actions à appliquer
            const actionsToApply = new Map();
            this.selectedActions.forEach((action, domain) => {
                if (action.selected) {
                    actionsToApply.set(domain, action);
                }
            });

            if (actionsToApply.size === 0) {
                this.showError('Aucune action sélectionnée');
                this.showStep('review');
                return;
            }

            console.log(`[DomainOrganizer] Executing organization for ${actionsToApply.size} domains`);
            
            const results = await this.executeWithProgress(actionsToApply);
            this.showFinalResults(results);

        } catch (error) {
            console.error('[DomainOrganizer] Execute error:', error);
            this.showError(`Erreur lors de l'exécution: ${error.message}`);
            this.showStep('review');
        } finally {
            this.isProcessing = false;
        }
    }

    async executeWithProgress(domainActions) {
        const results = {
            success: 0,
            failed: 0,
            foldersCreated: 0,
            emailsMoved: 0,
            errors: []
        };

        const totalDomains = domainActions.size;
        let processedDomains = 0;

        this.initializeExecutionLog();
        this.addLogEntry('🚀 Début de l\'organisation des emails', 'info');

        for (const [domain, action] of domainActions) {
            try {
                this.updateExecutionProgress(domain, action, processedDomains, totalDomains);
                this.addLogEntry(`🔄 Traitement de ${domain}...`, 'info');

                const result = await this.processDomain(domain, action);
                
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

            } catch (error) {
                results.failed++;
                results.errors.push({ domain, error: error.message });
                this.addLogEntry(`❌ Erreur critique pour ${domain}: ${error.message}`, 'error');
            }

            processedDomains++;
            
            // Pause pour éviter la surcharge de l'API
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        this.addLogEntry('🎉 Organisation terminée !', 'success');
        return results;
    }

    async processDomain(domain, action) {
        const allEmails = this.emailsByDomain.get(domain) || [];
        const result = {
            success: false,
            emailsMoved: 0,
            folderCreated: false,
            error: null
        };

        if (allEmails.length === 0) {
            result.success = true;
            return result;
        }

        try {
            let targetFolderId;

            // Créer ou récupérer le dossier cible
            if (action.action === 'create-new') {
                const newFolder = await this.createFolder(action.targetFolder);
                targetFolderId = newFolder.id;
                result.folderCreated = true;
            } else if (action.existingFolderId) {
                targetFolderId = action.existingFolderId;
            } else {
                throw new Error('Aucun dossier de destination spécifié');
            }

            // Déplacer les emails par lots
            const batches = this.createBatches(allEmails, 20);
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

    updateExecutionProgress(currentDomain, currentAction, processed, total) {
        const operationTitle = document.getElementById('operationTitle');
        const operationSubtitle = document.getElementById('operationSubtitle');
        const operationStatus = document.getElementById('operationStatus');

        if (operationTitle) {
            operationTitle.textContent = `Domaine: ${currentDomain}`;
        }
        
        if (operationSubtitle) {
            const actionText = currentAction.action === 'create-new' 
                ? `Création du dossier "${currentAction.targetFolder}"`
                : `Déplacement vers "${currentAction.targetFolder}"`;
            operationSubtitle.textContent = actionText;
        }
        
        if (operationStatus) {
            operationStatus.textContent = `${processed + 1}/${total}`;
        }

        // Mise à jour de la barre de progression
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

    clearLog() {
        const logContainer = document.getElementById('executionLog');
        if (logContainer) {
            logContainer.innerHTML = '';
        }
    }

    showFinalResults(results) {
        console.log('[DomainOrganizer] Showing final results:', results);

        // Mise à jour des statistiques finales
        const finalElements = {
            finalEmailsMoved: results.emailsMoved.toLocaleString(),
            finalFoldersCreated: results.foldersCreated,
            finalErrors: results.failed
        };

        Object.entries(finalElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                // Couleur spéciale pour les erreurs
                if (id === 'finalErrors' && results.failed > 0) {
                    element.style.color = 'var(--danger-color)';
                }
            }
        });

        this.showStep('results');
    }

    goBack() {
        this.showStep('configure');
    }

    resetForm() {
        console.log('[DomainOrganizer] Resetting form');
        
        this.showStep('configure');
        
        // Reset du formulaire
        const form = document.getElementById('organizeForm');
        if (form) form.reset();
        
        this.setDefaultDates();
        
        // Reset des données
        this.currentAnalysis = null;
        this.selectedActions.clear();
        this.emailSelections.clear();
        this.validationErrors.clear();
        this.folderCreationQueue.clear();
        this.isProcessing = false;
        
        console.log('[DomainOrganizer] Reset completed');
    }

    showError(message) {
        console.error('[DomainOrganizer] Error:', message);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    // === MÉTHODES CORE DE L'ORGANISATEUR ===

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

        console.log('[DomainOrganizer] Configured with options:', {
            excludedDomains: this.excludedDomains.size,
            excludedEmails: this.excludedEmails.size,
            maxEmailsPerBatch: this.maxEmailsPerBatch
        });
    }

    async analyzeEmails(filters = {}) {
        console.log('[DomainOrganizer] Starting analysis v6.3...');
        
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
                stage: 'Analyse des domaines',
                emailsAnalyzed: emails.length
            });
            
            await this.analyzeDomains(emails);

            this.updateProgress({
                percent: 90,
                message: 'Génération de la structure...',
                stage: 'Structure proposée',
                domainsFound: this.domainAnalysis.size
            });
            
            const results = this.finalizeAnalysis();

            this.updateProgress({
                percent: 100,
                message: 'Analyse terminée',
                stage: 'Terminé'
            });

            console.log('[DomainOrganizer] Analysis completed:', results);
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
            console.log('[DomainOrganizer] Loading existing folders...');
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

        console.log('[DomainOrganizer] Fetching emails with filters:', filters);

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

        console.log(`[DomainOrganizer] Total emails fetched: ${allEmails.length}`);
        return allEmails;
    }

    async analyzeDomains(emails) {
        console.log('[DomainOrganizer] Analyzing domains...');
        
        this.domainAnalysis.clear();
        this.emailsByDomain.clear();

        for (const email of emails) {
            const domain = this.extractDomain(email);
            if (!domain || this.shouldExclude(domain, email)) {
                continue;
            }

            // Grouper les emails par domaine
            if (!this.emailsByDomain.has(domain)) {
                this.emailsByDomain.set(domain, []);
            }
            this.emailsByDomain.get(domain).push(email);

            // Analyser le domaine
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

            // Garder quelques échantillons d'emails
            if (analysis.samples.length < 3) {
                analysis.samples.push({
                    subject: email.subject,
                    from: email.from?.emailAddress?.name || email.from?.emailAddress?.address
                });
            }
        }

        // Déterminer l'action pour chaque domaine
        this.domainAnalysis.forEach((analysis, domain) => {
            this.determineDomainAction(domain, analysis);
        });

        console.log(`[DomainOrganizer] Analyzed ${this.domainAnalysis.size} domains`);
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
        // Recherche exacte
        if (this.existingFolders.has(domain)) {
            return this.existingFolders.get(domain);
        }

        // Recherche par nom principal du domaine
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
            if (!email.from?.emailAddress?.address) {
                return null;
            }
            
            const emailAddress = email.from.emailAddress.address.toLowerCase();
            return emailAddress.split('@')[1] || null;
        } catch (error) {
            return null;
        }
    }

    shouldExclude(domain, email) {
        // Vérifier les domaines exclus
        if (this.excludedDomains.has(domain.toLowerCase())) {
            return true;
        }

        // Vérifier les emails spécifiques exclus
        const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
        if (emailAddress && this.excludedEmails.has(emailAddress)) {
            return true;
        }

        return false;
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
            
            if (analysis.action === 'create-new') {
                results.domainsToCreate++;
            } else if (analysis.action === 'move-existing') {
                results.domainsWithExisting++;
            }

            results.domains.push({
                domain: domain,
                count: analysis.count,
                samples: analysis.samples,
                action: analysis.action,
                existingFolder: analysis.existingFolder,
                suggestedFolder: analysis.suggestedFolder
            });
        });

        // Trier par nombre d'emails (décroissant)
        results.domains.sort((a, b) => b.count - a.count);

        return results;
    }

    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    async createFolder(folderName) {
        const accessToken = await window.authService.getAccessToken();
        
        try {
            console.log(`[DomainOrganizer] Creating folder: ${folderName}`);
            
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    displayName: folderName
                })
            });

            if (response.ok) {
                const folder = await response.json();
                console.log(`[DomainOrganizer] Folder created successfully: ${folderName}`);
                return folder;
            }

            // Si le dossier existe déjà
            if (response.status === 409) {
                console.log(`[DomainOrganizer] Folder already exists: ${folderName}`);
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
            body: {
                destinationId: targetFolderId
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }));

        const response = await fetch('https://graph.microsoft.com/v1.0/$batch', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: batchRequests
            })
        });

        if (!response.ok) {
            throw new Error(`Échec du déplacement par lot: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`[DomainOrganizer] Batch move completed for ${emails.length} emails`);
        return result;
    }
}

// === INITIALISATION ET GESTION GLOBALE ===

// Créer l'instance globale
window.organizerInstance = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ v6.3 Instance created');

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v6.3...');
    
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
    
    // S'assurer que le contenu est visible
    pageContent.style.cssText = 'display:block!important;visibility:visible!important;opacity:1!important';

    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) {
        rangerButton.classList.add('active');
        if (rangerButton.parentElement) {
            rangerButton.parentElement.classList.add('active');
        }
    }

    // Initialiser après un délai pour s'assurer que le DOM est prêt
    setTimeout(async () => {
        if (window.domainOrganizerActive && document.getElementById('configStep')) {
            try {
                await window.organizerInstance.initializePage();
                console.log('[DomainOrganizer] ✅ Successfully initialized v6.3');
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
            }
        }
    }, 150);

    console.log('[DomainOrganizer] ✅ Interface ready v6.3');
}

// === SYSTÈME D'INTERCEPTION POUR LA NAVIGATION ===

// Interception des clics
document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]') || 
                        e.target.closest('button[onclick*="ranger"]') || 
                        e.target.closest('a[href*="ranger"]');
    
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[DomainOrganizer] 🎯 Ranger click detected v6.3');
        setTimeout(showDomainOrganizerApp, 50);
        return false;
    }
}, true);

// Interception des erreurs JavaScript
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('Page ranger not found')) {
        console.log('[DomainOrganizer] 🔧 Error intercepted v6.3');
        e.preventDefault();
        setTimeout(showDomainOrganizerApp, 100);
    }
}, true);

// Interception des promesses rejetées
window.addEventListener('unhandledrejection', function(e) {
    if (e.reason?.message?.includes('Page ranger not found')) {
        console.log('[DomainOrganizer] 🔧 Promise rejection intercepted v6.3');
        e.preventDefault();
        setTimeout(showDomainOrganizerApp, 100);
    }
});

// Hook du PageManager si disponible
if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        console.log(`[DomainOrganizer] 🔍 PageManager.loadPage: ${pageName}`);
        
        if (pageName === 'ranger') {
            console.log('[DomainOrganizer] 🎯 PageManager interception v6.3');
            showDomainOrganizerApp();
            return;
        }

        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                console.log('[DomainOrganizer] 🔧 PageManager error intercepted v6.3');
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
    
    console.log('[DomainOrganizer] ✅ PageManager hook installed v6.3');
}

// === FONCTIONS GLOBALES ET UTILITAIRES ===

// Fonctions globales pour l'accès externe
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

// Message de succès final
console.log('[DomainOrganizer] ✅ v6.3 System fully configured and ready')
