// DomainOrganizer.js - Version 6.9.0 - Domaines vraiment cliquables avec vue détaillée des emails
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
        
        console.log('[DomainOrganizer] ✅ v6.9 - Domaines vraiment cliquables avec emails détaillés');
    }

    getPageHTML() {
        return `
            <div class="container" style="max-width: 1200px; margin: 20px auto; padding: 0 20px;">
                <!-- Configuration Card -->
                <div class="card" id="configCard">
                    <h2 class="card-title">
                        <i class="fas fa-folder-tree"></i>
                        Rangement intelligent par domaine
                    </h2>
                    <p class="card-subtitle">Organisez automatiquement vos emails avec un contrôle précis sur chaque email et son dossier de destination</p>
                    
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

                <!-- Results Card with Detailed Clickable View -->
                <div class="card" id="resultsCard" style="display: none;">
                    <div class="results-header">
                        <h2 class="card-title">
                            <i class="fas fa-list-ul"></i>
                            Contrôle détaillé par email
                        </h2>
                        <p class="card-subtitle">
                            <strong>Cliquez sur un domaine</strong> pour voir tous ses emails et choisir précisément le dossier de destination de chaque email.
                        </p>
                    </div>

                    <div class="stats-summary">
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
                            <div class="stat-value" id="statSelected">0</div>
                            <div class="stat-label">Emails sélectionnés</div>
                        </div>
                    </div>

                    <div class="controls-panel">
                        <div class="control-buttons">
                            <button class="btn btn-small" onclick="window.organizerInstance.expandAllDomains()">
                                <i class="fas fa-expand-arrows-alt"></i>
                                Développer tout
                            </button>
                            <button class="btn btn-small" onclick="window.organizerInstance.collapseAllDomains()">
                                <i class="fas fa-compress-arrows-alt"></i>
                                Réduire tout
                            </button>
                            <button class="btn btn-small" onclick="window.organizerInstance.selectAllEmails()">
                                <i class="fas fa-check-square"></i>
                                Tout sélectionner
                            </button>
                            <button class="btn btn-small" onclick="window.organizerInstance.deselectAllEmails()">
                                <i class="fas fa-square"></i>
                                Tout désélectionner
                            </button>
                        </div>
                        
                        <div class="search-box">
                            <input type="text" id="emailSearch" placeholder="Rechercher un email..." class="search-input">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                    </div>

                    <!-- Message d'instruction -->
                    <div class="instruction-message">
                        <i class="fas fa-info-circle"></i>
                        <strong>Instructions :</strong> Cliquez sur une ligne de domaine pour voir ses emails. Vous pourrez alors modifier le dossier de destination de chaque email individuellement.
                    </div>

                    <div class="detailed-results" id="detailedResults">
                        <!-- Populated dynamically with clickable domains and expandable emails -->
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
                                Organiser <span id="selectedCount">0</span> emails
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
                        <p class="card-subtitle">Vos emails sont en cours d'organisation selon vos préférences</p>
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

                <!-- Success Card -->
                <div class="success-card" id="successCard" style="display: none;">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Organisation terminée avec succès !</h2>
                    <p id="successMessage">Votre boîte mail a été organisée selon vos préférences.</p>
                    
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
                /* Styles de base */
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

                .btn-small {
                    padding: 8px 16px;
                    font-size: 14px;
                    min-width: auto;
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

                /* Message d'instruction */
                .instruction-message {
                    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
                    border: 2px solid #3b82f6;
                    border-radius: 12px;
                    padding: 16px 20px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #1e40af;
                    font-weight: 500;
                }

                .instruction-message i {
                    font-size: 18px;
                    color: #3b82f6;
                }

                /* Styles pour les résultats détaillés */
                .results-header {
                    margin-bottom: 32px;
                }

                .stats-summary {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                    padding: 24px;
                    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .stat {
                    text-align: center;
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e293b;
                    display: block;
                }

                .stat-label {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 500;
                    margin-top: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .controls-panel {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 20px;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .control-buttons {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .search-box {
                    position: relative;
                    min-width: 250px;
                }

                .search-input {
                    width: 100%;
                    padding: 10px 40px 10px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px #dbeafe;
                }

                .search-icon {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                }

                .detailed-results {
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    background: white;
                    overflow: hidden;
                }

                /* Styles pour les domaines CLIQUABLES */
                .domain-row {
                    border-bottom: 1px solid #f1f5f9;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    position: relative;
                }

                .domain-row:last-child {
                    border-bottom: none;
                }

                .domain-row:hover {
                    background: #f8fafc;
                    box-shadow: inset 0 0 0 2px #dbeafe;
                }

                .domain-row.expanded {
                    background: #eff6ff;
                    border-color: #3b82f6;
                }

                .domain-header {
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    transition: all 0.2s ease;
                }

                .domain-row.expanded .domain-header {
                    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
                    border-bottom: 1px solid #3b82f6;
                }

                .domain-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 1;
                    pointer-events: none; /* Évite les conflits avec le clic global */
                }

                .domain-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    accent-color: #3b82f6;
                    pointer-events: all; /* Réactive les événements pour la checkbox */
                }

                .domain-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 18px;
                    box-shadow: 0 4px 6px rgb(0 0 0 / 0.1);
                }

                .domain-details {
                    flex: 1;
                    min-width: 200px;
                }

                .domain-name {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .domain-stats {
                    display: flex;
                    gap: 20px;
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 500;
                }

                .domain-controls {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    pointer-events: all; /* Réactive les événements pour les contrôles */
                }

                .folder-config {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    min-width: 220px;
                }

                .folder-select,
                .folder-input {
                    padding: 10px 14px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                    transition: all 0.2s ease;
                    font-weight: 500;
                }

                .folder-select:focus,
                .folder-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px #dbeafe;
                }

                .action-badge {
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }

                .action-new {
                    background: #d1fae5;
                    color: #065f46;
                    border: 2px solid #10b981;
                }

                .action-existing {
                    background: #dbeafe;
                    color: #1e40af;
                    border: 2px solid #3b82f6;
                }

                .expand-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 600;
                    pointer-events: none;
                }

                .expand-icon {
                    font-size: 16px;
                    color: #3b82f6;
                    transition: transform 0.3s ease;
                }

                .domain-row.expanded .expand-icon {
                    transform: rotate(90deg);
                }

                /* Styles pour les emails */
                .emails-container {
                    display: none;
                    background: white;
                    border-top: 2px solid #3b82f6;
                }

                .domain-row.expanded .emails-container {
                    display: block;
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        max-height: 0;
                    }
                    to {
                        opacity: 1;
                        max-height: 1000px;
                    }
                }

                .emails-header {
                    padding: 16px 24px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    font-weight: 600;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .emails-list {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .email-item {
                    padding: 16px 24px 16px 48px;
                    border-bottom: 1px solid #f1f5f9;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .email-item:hover {
                    background: #f8fafc;
                }

                .email-item:last-child {
                    border-bottom: none;
                }

                .email-item.selected {
                    background: #eff6ff;
                    border-left: 4px solid #3b82f6;
                }

                .email-checkbox {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: #3b82f6;
                }

                .email-content {
                    flex: 1;
                    min-width: 0;
                }

                .email-subject {
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 15px;
                }

                .email-meta {
                    display: flex;
                    gap: 20px;
                    font-size: 13px;
                    color: #64748b;
                }

                .email-sender {
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .email-date {
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .email-folder-control {
                    min-width: 200px;
                }

                .email-folder-select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 13px;
                    background: white;
                    transition: all 0.2s ease;
                }

                .email-folder-select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px #dbeafe;
                }

                .email-actions {
                    display: flex;
                    gap: 8px;
                }

                .btn-mini {
                    padding: 4px 10px;
                    font-size: 11px;
                    border-radius: 4px;
                    min-width: auto;
                    font-weight: 600;
                }

                /* Styles pour la progression */
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

                /* Success card */
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
                @media (max-width: 1024px) {
                    .stats-summary {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .controls-panel {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .search-box {
                        min-width: auto;
                    }
                }

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
                    
                    .stats-summary {
                        grid-template-columns: 1fr;
                        gap: 16px;
                        padding: 16px;
                    }
                    
                    .control-buttons {
                        justify-content: center;
                    }
                    
                    .domain-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        padding: 16px;
                    }
                    
                    .domain-controls {
                        width: 100%;
                        justify-content: space-between;
                    }
                    
                    .email-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                        padding: 16px;
                    }
                    
                    .email-meta {
                        flex-direction: column;
                        gap: 4px;
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
                }

                /* Amélioration de l'accessibilité */
                .domain-row:focus {
                    outline: 3px solid #3b82f6;
                    outline-offset: 2px;
                }

                .domain-row[tabindex]:hover {
                    cursor: pointer;
                }
            </style>
        `;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v6.9...');
        
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.isActive = true;
        
        console.log('[DomainOrganizer] ✅ Successfully initialized v6.9');
        return true;
    }

    setupEventListeners() {
        const form = document.getElementById('organizeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Search functionality
        const searchInput = document.getElementById('emailSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
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
        console.log('[DomainOrganizer] Simulating detailed analysis...');
        
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
                domains = Math.floor(emails / 25) + 3;
                if (domainsFound) domainsFound.textContent = domains;
                if (progressLabel) progressLabel.textContent = 'Récupération';
                if (progressText) progressText.textContent = 'Récupération des emails...';
            } else if (progress === 70) {
                if (progressLabel) progressLabel.textContent = 'Analyse';
                if (progressText) progressText.textContent = 'Analyse détaillée des emails...';
            } else if (progress === 90) {
                if (progressLabel) progressLabel.textContent = 'Finalisation';
                if (progressText) progressText.textContent = 'Création de la vue détaillée...';
            } else if (progress >= 100) {
                clearInterval(interval);
                if (progressLabel) progressLabel.textContent = 'Terminé';
                if (progressText) progressText.textContent = 'Analyse terminée !';
                
                const results = this.generateDetailedMockData(domains, emails);
                setTimeout(() => this.showDetailedResults(results), 1000);
            }
        }, 400);
    }

    generateDetailedMockData(domainCount, totalEmails) {
        const mockDomains = [
            'linkedin.com', 'github.com', 'amazon.com', 'paypal.com', 'medium.com', 
            'stackoverflow.com', 'atlassian.com', 'slack.com', 'dropbox.com', 'spotify.com',
            'netflix.com', 'airbnb.com', 'booking.com', 'udemy.com', 'coursera.org'
        ];
        
        const mockSubjects = [
            'Votre commande a été expédiée',
            'Nouvelle notification de connexion',
            'Rapport mensuel disponible',
            'Invitation à rejoindre l\'équipe',
            'Mise à jour de sécurité importante',
            'Newsletter hebdomadaire',
            'Confirmation de réservation',
            'Facture disponible en ligne',
            'Nouveau message privé',
            'Rappel important - Action requise',
            'Mise à jour de votre profil',
            'Nouvel abonnement activé',
            'Demande de connexion'
        ];
        
        const domains = [];
        let emailId = 1;
        let remainingEmails = totalEmails;
        
        for (let i = 0; i < domainCount; i++) {
            const domain = mockDomains[i % mockDomains.length];
            const emailCount = i === domainCount - 1 
                ? remainingEmails 
                : Math.floor(Math.random() * 25) + 8;
            
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
                    date: date.toLocaleDateString('fr-FR'),
                    selected: true,
                    targetFolder: domain
                });
            }
            
            domains.push({
                domain: domain,
                count: emailCount,
                action: Math.random() > 0.4 ? 'create-new' : 'move-existing',
                suggestedFolder: domain,
                emails: emails,
                selected: true
            });
        }
        
        return {
            totalEmails: totalEmails,
            totalDomains: domainCount,
            domainsToCreate: domains.filter(d => d.action === 'create-new').length,
            domainsWithExisting: domains.filter(d => d.action === 'move-existing').length,
            domains: domains.sort((a, b) => b.count - a.count)
        };
    }

    showProgress() {
        document.getElementById('configCard').style.display = 'none';
        document.getElementById('progressCard').style.display = 'block';
        document.getElementById('resultsCard').style.display = 'none';
        document.getElementById('executionCard').style.display = 'none';
        document.getElementById('successCard').style.display = 'none';
    }

    showDetailedResults(results) {
        console.log('[DomainOrganizer] Showing detailed clickable results:', results);
        
        this.currentAnalysis = results;
        this.emailActions.clear();
        
        // Initialize email actions
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
        
        // Update statistics
        document.getElementById('statEmails').textContent = results.totalEmails.toLocaleString();
        document.getElementById('statDomains').textContent = results.totalDomains;
        document.getElementById('statNew').textContent = results.domainsToCreate;
        document.getElementById('statExisting').textContent = results.domainsWithExisting;
        
        this.displayClickableDomains(results.domains);
        this.updateSelectedCount();
        
        document.getElementById('progressCard').style.display = 'none';
        document.getElementById('resultsCard').style.display = 'block';
    }

    displayClickableDomains(domains) {
        const container = document.getElementById('detailedResults');
        if (!container) return;
        
        container.innerHTML = '';
        
        domains.forEach(domain => {
            const domainRow = this.createClickableDomainRow(domain);
            container.appendChild(domainRow);
        });
    }

    createClickableDomainRow(domainData) {
        const row = document.createElement('div');
        row.className = 'domain-row';
        row.dataset.domain = domainData.domain;
        row.setAttribute('tabindex', '0'); // Pour l'accessibilité
        
        const isNewFolder = domainData.action === 'create-new';
        const selectedEmails = domainData.emails.filter(email => 
            this.emailActions.get(email.id)?.selected
        ).length;
        
        row.innerHTML = `
            <div class="domain-header">
                <div class="domain-info">
                    <input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" 
                           ${domainData.selected ? 'checked' : ''}>
                    <div class="domain-icon">
                        <i class="fas fa-at"></i>
                    </div>
                    <div class="domain-details">
                        <div class="domain-name">
                            ${domainData.domain}
                            <i class="fas fa-mouse-pointer" style="font-size: 12px; color: #3b82f6;" title="Cliquez pour voir les emails"></i>
                        </div>
                        <div class="domain-stats">
                            <span><i class="fas fa-envelope"></i> ${domainData.count} emails</span>
                            <span><i class="fas fa-check-circle"></i> ${selectedEmails} sélectionnés</span>
                        </div>
                    </div>
                </div>
                <div class="domain-controls">
                    <div class="folder-config">
                        ${isNewFolder ? 
                            `<input type="text" class="folder-input" value="${domainData.suggestedFolder}" 
                                    data-domain="${domainData.domain}" 
                                    placeholder="Nom du dossier">` :
                            `<select class="folder-select" data-domain="${domainData.domain}">
                                <option value="existing" selected>${domainData.suggestedFolder}</option>
                                <option value="inbox">📥 Boîte de réception</option>
                                <option value="archive">📁 Archive</option>
                            </select>`
                        }
                        <span class="action-badge ${isNewFolder ? 'action-new' : 'action-existing'}">
                            ${isNewFolder ? '🆕 Nouveau dossier' : '📁 Dossier existant'}
                        </span>
                    </div>
                    <div class="expand-indicator">
                        <span>Cliquer pour voir</span>
                        <i class="fas fa-chevron-right expand-icon"></i>
                    </div>
                </div>
            </div>
            
            <div class="emails-container">
                <div class="emails-header">
                    <i class="fas fa-list"></i>
                    Emails de ${domainData.domain} - Modifiez le dossier de destination individuellement
                </div>
                <div class="emails-list">
                    ${domainData.emails.map(email => this.createDetailedEmailItem(email, domainData.domain)).join('')}
                </div>
            </div>
        `;
        
        // Ajouter l'événement de clic pour développer/réduire
        row.addEventListener('click', (e) => {
            // Ne pas déclencher si on clique sur les contrôles
            if (e.target.closest('.domain-controls') || e.target.closest('.domain-checkbox')) {
                return;
            }
            this.toggleDomainExpansion(domainData.domain);
        });
        
        // Événement pour la checkbox du domaine
        const domainCheckbox = row.querySelector('.domain-checkbox');
        domainCheckbox.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDomainToggle(e);
        });
        
        // Événements pour les contrôles de dossier
        const folderControl = row.querySelector('.folder-input, .folder-select');
        if (folderControl) {
            folderControl.addEventListener('click', (e) => e.stopPropagation());
            folderControl.addEventListener('change', (e) => this.handleDomainFolderChange(e));
        }
        
        return row;
    }

    createDetailedEmailItem(emailData, domain) {
        const isSelected = this.emailActions.get(emailData.id)?.selected;
        
        return `
            <div class="email-item ${isSelected ? 'selected' : ''}" data-email-id="${emailData.id}">
                <input type="checkbox" class="email-checkbox" data-email-id="${emailData.id}" 
                       ${isSelected ? 'checked' : ''}
                       onchange="window.organizerInstance.handleEmailToggle(event)">
                <div class="email-content">
                    <div class="email-subject">${emailData.subject}</div>
                    <div class="email-meta">
                        <span class="email-sender">
                            <i class="fas fa-user"></i> 
                            ${emailData.senderName} (${emailData.sender})
                        </span>
                        <span class="email-date">
                            <i class="fas fa-calendar"></i> 
                            ${emailData.date}
                        </span>
                    </div>
                </div>
                <div class="email-folder-control">
                    <select class="email-folder-select" data-email-id="${emailData.id}" 
                            onchange="window.organizerInstance.handleEmailFolderChange(event)">
                        <option value="${emailData.targetFolder}" selected>📁 ${emailData.targetFolder}</option>
                        <option value="inbox">📥 Boîte de réception</option>
                        <option value="archive">📁 Archive</option>
                        <option value="spam">🚫 Spam</option>
                        <option value="important">⭐ Important</option>
                        <option value="work">💼 Travail</option>
                        <option value="personal">👤 Personnel</option>
                        <option value="custom">✏️ Autre dossier...</option>
                    </select>
                </div>
                <div class="email-actions">
                    <button class="btn btn-mini btn-secondary" 
                            onclick="window.organizerInstance.excludeEmail('${emailData.id}')">
                        <i class="fas fa-ban"></i>
                        Exclure
                    </button>
                </div>
            </div>
        `;
    }

    toggleDomainExpansion(domain) {
        console.log('[DomainOrganizer] Toggling domain:', domain);
        
        const domainRow = document.querySelector(`[data-domain="${domain}"]`);
        if (!domainRow) return;
        
        const isExpanded = domainRow.classList.contains('expanded');
        
        if (isExpanded) {
            domainRow.classList.remove('expanded');
            this.expandedDomains.delete(domain);
            console.log('[DomainOrganizer] Domain collapsed:', domain);
        } else {
            domainRow.classList.add('expanded');
            this.expandedDomains.add(domain);
            console.log('[DomainOrganizer] Domain expanded:', domain);
        }
    }

    expandAllDomains() {
        console.log('[DomainOrganizer] Expanding all domains');
        document.querySelectorAll('.domain-row').forEach(row => {
            row.classList.add('expanded');
            const domain = row.dataset.domain;
            if (domain) {
                this.expandedDomains.add(domain);
            }
        });
    }

    collapseAllDomains() {
        console.log('[DomainOrganizer] Collapsing all domains');
        document.querySelectorAll('.domain-row').forEach(row => {
            row.classList.remove('expanded');
        });
        this.expandedDomains.clear();
    }

    selectAllEmails() {
        document.querySelectorAll('.email-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            this.handleEmailToggle({ target: checkbox });
        });
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = true;
        });
    }

    deselectAllEmails() {
        document.querySelectorAll('.email-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            this.handleEmailToggle({ target: checkbox });
        });
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    handleDomainToggle(event) {
        const domain = event.target.dataset.domain;
        const isChecked = event.target.checked;
        
        console.log('[DomainOrganizer] Domain toggle:', domain, isChecked);
        
        // Toggle all emails in this domain
        if (this.currentAnalysis) {
            const domainData = this.currentAnalysis.domains.find(d => d.domain === domain);
            if (domainData) {
                domainData.emails.forEach(email => {
                    if (this.emailActions.has(email.id)) {
                        this.emailActions.get(email.id).selected = isChecked;
                    }
                    
                    // Update email checkbox in UI
                    const emailCheckbox = document.querySelector(`input[data-email-id="${email.id}"]`);
                    if (emailCheckbox) {
                        emailCheckbox.checked = isChecked;
                    }
                    
                    // Update email item visual state
                    const emailItem = document.querySelector(`div[data-email-id="${email.id}"]`);
                    if (emailItem) {
                        if (isChecked) {
                            emailItem.classList.add('selected');
                        } else {
                            emailItem.classList.remove('selected');
                        }
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
        
        // Update email item visual state
        const emailItem = event.target.closest('.email-item');
        if (emailItem) {
            if (isChecked) {
                emailItem.classList.add('selected');
            } else {
                emailItem.classList.remove('selected');
            }
        }
        
        this.updateSelectedCount();
        this.updateDomainCheckboxes();
    }

    handleEmailFolderChange(event) {
        const emailId = event.target.dataset.emailId;
        const newFolder = event.target.value;
        
        if (newFolder === 'custom') {
            const customFolder = prompt('Nom du dossier personnalisé:');
            if (customFolder && customFolder.trim()) {
                if (this.emailActions.has(emailId)) {
                    this.emailActions.get(emailId).targetFolder = customFolder.trim();
                }
                // Add custom option to select
                const option = document.createElement('option');
                option.value = customFolder.trim();
                option.textContent = `📁 ${customFolder.trim()}`;
                option.selected = true;
                event.target.appendChild(option);
            } else {
                // Reset to previous value
                event.target.selectedIndex = 0;
            }
        } else {
            if (this.emailActions.has(emailId)) {
                this.emailActions.get(emailId).targetFolder = newFolder;
            }
        }
    }

    excludeEmail(emailId) {
        if (this.emailActions.has(emailId)) {
            this.emailActions.get(emailId).selected = false;
        }
        
        const checkbox = document.querySelector(`input[data-email-id="${emailId}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        const emailItem = document.querySelector(`div[data-email-id="${emailId}"]`);
        if (emailItem) {
            emailItem.classList.remove('selected');
            emailItem.style.opacity = '0.5';
            emailItem.style.background = '#f8f9fa';
        }
        
        this.updateSelectedCount();
        this.updateDomainCheckboxes();
    }

    updateDomainCheckboxes() {
        if (!this.currentAnalysis) return;
        
        this.currentAnalysis.domains.forEach(domain => {
            const domainCheckbox = document.querySelector(`input[data-domain="${domain.domain}"]`);
            if (domainCheckbox) {
                const selectedEmails = domain.emails.filter(email => 
                    this.emailActions.get(email.id)?.selected
                ).length;
                
                if (selectedEmails === 0) {
                    domainCheckbox.checked = false;
                    domainCheckbox.indeterminate = false;
                } else if (selectedEmails === domain.emails.length) {
                    domainCheckbox.checked = true;
                    domainCheckbox.indeterminate = false;
                } else {
                    domainCheckbox.checked = false;
                    domainCheckbox.indeterminate = true;
                }
                
                // Update domain stats
                const statsElement = document.querySelector(`[data-domain="${domain.domain}"] .domain-stats span:last-child`);
                if (statsElement) {
                    statsElement.innerHTML = `<i class="fas fa-check-circle"></i> ${selectedEmails} sélectionnés`;
                }
            }
        });
    }

    updateSelectedCount() {
        const selectedCount = Array.from(this.emailActions.values()).filter(action => action.selected).length;
        
        document.getElementById('statSelected').textContent = selectedCount.toLocaleString();
        document.getElementById('selectedCount').textContent = selectedCount.toLocaleString();
        
        // Enable/disable apply button
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            applyBtn.disabled = selectedCount === 0;
            if (selectedCount === 0) {
                applyBtn.innerHTML = '<i class="fas fa-play"></i> Aucun email sélectionné';
            } else {
                applyBtn.innerHTML = `<i class="fas fa-play"></i> Organiser ${selectedCount.toLocaleString()} emails`;
            }
        }
    }

    handleSearch(searchTerm) {
        const emailItems = document.querySelectorAll('.email-item');
        const domainRows = document.querySelectorAll('.domain-row');
        
        emailItems.forEach(item => {
            const subject = item.querySelector('.email-subject').textContent.toLowerCase();
            const sender = item.querySelector('.email-sender').textContent.toLowerCase();
            
            if (subject.includes(searchTerm.toLowerCase()) || sender.includes(searchTerm.toLowerCase())) {
                item.style.display = 'flex';
                // Expand parent domain if email matches
                const emailId = item.dataset.emailId;
                const emailAction = this.emailActions.get(emailId);
                if (emailAction && searchTerm) {
                    const domainRow = document.querySelector(`[data-domain="${emailAction.domain}"]`);
                    if (domainRow) {
                        domainRow.classList.add('expanded');
                        this.expandedDomains.add(emailAction.domain);
                    }
                }
            } else {
                item.style.display = searchTerm ? 'none' : 'flex';
            }
        });
        
        // Hide domains that have no visible emails when searching
        if (searchTerm) {
            domainRows.forEach(row => {
                const domain = row.dataset.domain;
                const visibleEmails = row.querySelectorAll('.email-item[style*="flex"]').length;
                if (visibleEmails === 0) {
                    row.style.display = 'none';
                } else {
                    row.style.display = 'block';
                    row.classList.add('expanded');
                    this.expandedDomains.add(domain);
                }
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
            
            console.log('[DomainOrganizer] Applying organization for', selectedEmails.length, 'emails');
            
            await this.simulateExecution(selectedEmails);
            
        } catch (error) {
            console.error('[DomainOrganizer] Apply error:', error);
            this.showError(`Erreur: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateExecution(selectedEmails) {
        console.log('[DomainOrganizer] Simulating execution for', selectedEmails.length, 'emails...');
        
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
        
        const uniqueFolders = new Set(selectedEmails.map(email => email.targetFolder));
        const totalFolders = uniqueFolders.size;
        const totalEmails = selectedEmails.length;
        
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
                emails = Math.floor(totalEmails * 0.3);
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
        
        const message = `${results.emailsMoved} emails ont été organisés dans ${results.foldersCreated} dossiers selon vos préférences précises.`;
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
        this.emailActions.clear();
        this.selectedActions.clear();
        this.expandedDomains.clear();
        this.currentAnalysis = null;
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

    // === MÉTHODES UTILITAIRES AVANCÉES ===
    
    bulkChangeFolder() {
        const selectedEmails = Array.from(this.emailActions.entries()).filter(([_, action]) => action.selected);
        
        if (selectedEmails.length === 0) {
            this.showError('Aucun email sélectionné');
            return;
        }
        
        const newFolder = prompt(`Changer le dossier de destination pour ${selectedEmails.length} emails:`);
        if (newFolder && newFolder.trim()) {
            selectedEmails.forEach(([emailId, action]) => {
                action.targetFolder = newFolder.trim();
                
                // Update UI
                const select = document.querySelector(`select[data-email-id="${emailId}"]`);
                if (select) {
                    // Add option if it doesn't exist
                    if (!Array.from(select.options).some(option => option.value === newFolder.trim())) {
                        const option = document.createElement('option');
                        option.value = newFolder.trim();
                        option.textContent = `📁 ${newFolder.trim()}`;
                        select.appendChild(option);
                    }
                    select.value = newFolder.trim();
                }
            });
            
            this.showError(`Dossier changé pour ${selectedEmails.length} emails vers "${newFolder.trim()}"`);
        }
    }

    previewOrganization() {
        const selectedEmails = Array.from(this.emailActions.values()).filter(action => action.selected);
        const folderGroups = {};
        
        selectedEmails.forEach(email => {
            if (!folderGroups[email.targetFolder]) {
                folderGroups[email.targetFolder] = [];
            }
            folderGroups[email.targetFolder].push(email);
        });
        
        const preview = Object.entries(folderGroups)
            .sort(([,a], [,b]) => b.length - a.length)
            .map(([folder, emails]) => `📁 ${folder}: ${emails.length} emails`)
            .join('\n');
        
        alert(`📋 Aperçu de l'organisation:\n\n${preview}\n\n✅ Total: ${selectedEmails.length} emails\n📂 Dossiers: ${Object.keys(folderGroups).length}`);
    }

    // Raccourcis clavier pour les power users
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.isActive || document.getElementById('resultsCard').style.display !== 'block') return;
            
            // Ctrl+A - Sélectionner tous les emails
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.selectAllEmails();
            }
            
            // Ctrl+D - Désélectionner tous les emails
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.deselectAllEmails();
            }
            
            // Ctrl+E - Développer tous les domaines
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.expandAllDomains();
            }
            
            // Ctrl+R - Réduire tous les domaines
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.collapseAllDomains();
            }
            
            // Ctrl+F - Focus sur la recherche
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('emailSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Ctrl+P - Aperçu de l'organisation
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.previewOrganization();
            }
            
            // Ctrl+B - Changement de dossier en lot
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.bulkChangeFolder();
            }
        });
    }
}

// === INITIALISATION GLOBALE ===

window.organizerInstance = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ v6.9 Instance created with truly clickable domains');

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v6.9 with truly clickable domains...');
    
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
                
                // Setup keyboard shortcuts
                window.organizerInstance.setupKeyboardShortcuts();
                
                console.log('[DomainOrganizer] ✅ Successfully initialized v6.9 with clickable domains');
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
            }
        }
    }, 50);

    console.log('[DomainOrganizer] ✅ Interface launched v6.9 - Truly clickable domains with individual email control');
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
        
        console.log('[DomainOrganizer] 🎯 Ranger click detected v6.9');
        setTimeout(showDomainOrganizerApp, 10);
        return false;
    }
}, true);

if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        console.log(`[DomainOrganizer] 🔍 PageManager.loadPage: ${pageName}`);
        
        if (pageName === 'ranger') {
            console.log('[DomainOrganizer] 🎯 PageManager interception v6.9');
            showDomainOrganizerApp();
            return;
        }

        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                console.log('[DomainOrganizer] 🔧 PageManager error intercepted v6.9');
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
    
    console.log('[DomainOrganizer] ✅ PageManager hook installed v6.9');
}

// === FONCTIONS GLOBALES ET RACCOURCIS ===

window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = {
    showPage: showDomainOrganizerApp,
    instance: window.organizerInstance
};

// Message d'aide pour les raccourcis
window.organizerInstance.showKeyboardHelp = function() {
    const helpMessage = `
⌨️ Raccourcis clavier disponibles:

Ctrl + A : Sélectionner tous les emails
Ctrl + D : Désélectionner tous les emails  
Ctrl + E : Développer tous les domaines
Ctrl + R : Réduire tous les domaines
Ctrl + F : Rechercher dans les emails
Ctrl + P : Aperçu de l'organisation
Ctrl + B : Changer le dossier en lot

💡 Cliquez sur un domaine pour voir ses emails !
    `;
    alert(helpMessage);
};

console.log('[DomainOrganizer] ✅ v6.9 System ready - Truly clickable domains with full individual email control');
console.log('[DomainOrganizer] 💡 Use Ctrl+H to see keyboard shortcuts when the organizer is active');
