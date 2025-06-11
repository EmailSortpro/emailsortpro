// ModernDomainOrganizer.js - Version étendue avec édition complète
// Interface large avec modification des dossiers et visualisation des emails

class ModernDomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.currentStep = 'configuration';
        this.scanResults = null;
        this.organizationPlan = new Map();
        this.allFolders = new Map();
        this.emailsByDomain = new Map();
        this.totalEmailsScanned = 0;
        this.expandedDomains = new Set();
        
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
                        <div class="step" data-step="plan">
                            <div class="step-circle">3</div>
                            <span>Plan & Édition</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="execution">
                            <div class="step-circle">4</div>
                            <span>Exécution</span>
                        </div>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="organizer-content">
                    <!-- Étape 1: Configuration -->
                    <div class="step-content" id="step-configuration">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>🎯 Configuration du rangement automatique</h2>
                                <p>Le système va analyser vos emails, détecter les dossiers existants et créer un plan personnalisable</p>
                            </div>

                            <div class="config-section">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Date de début</label>
                                        <input type="date" id="startDate">
                                    </div>
                                    <div class="form-group">
                                        <label>Date de fin</label>
                                        <input type="date" id="endDate">
                                    </div>
                                    <div class="form-group">
                                        <label>Min emails/domaine</label>
                                        <input type="number" id="minEmails" value="3" min="1" max="50">
                                    </div>
                                    <div class="form-group">
                                        <label>Limite d'emails à scanner</label>
                                        <select id="emailLimit">
                                            <option value="500">500 emails (rapide)</option>
                                            <option value="1000">1000 emails (normal)</option>
                                            <option value="2000">2000 emails (complet)</option>
                                            <option value="0">Tous les emails (très lent)</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Domaines à exclure (optionnel)</label>
                                    <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com" 
                                           value="gmail.com, outlook.com, hotmail.com">
                                    <div class="help-text">Séparez par des virgules</div>
                                </div>

                                <div class="form-group">
                                    <label>Emails spécifiques à exclure (optionnel)</label>
                                    <textarea id="excludeEmails" placeholder="noreply@exemple.com&#10;contact@service.com" rows="3"></textarea>
                                    <div class="help-text">Un email par ligne</div>
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-primary" id="startScanBtn">
                                    <i class="fas fa-search"></i>
                                    Analyser et créer le plan
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 2: Scanning -->
                    <div class="step-content hidden" id="step-scanning">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>🔍 Analyse en cours</h2>
                                <p id="scanStatus">Initialisation...</p>
                            </div>

                            <div class="scan-progress">
                                <div class="progress-container">
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="progressBar"></div>
                                    </div>
                                    <div class="progress-text" id="progressPercent">0%</div>
                                </div>

                                <div class="scan-stats">
                                    <div class="stat">
                                        <span class="stat-number" id="scannedEmails">0</span>
                                        <span class="stat-label">Emails scannés</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-number" id="foundDomains">0</span>
                                        <span class="stat-label">Domaines trouvés</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-number" id="existingFolders">0</span>
                                        <span class="stat-label">Dossiers existants</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-number" id="newFoldersNeeded">0</span>
                                        <span class="stat-label">Nouveaux dossiers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 3: Plan et Édition -->
                    <div class="step-content hidden" id="step-plan">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>📋 Plan d'organisation - Édition complète</h2>
                                <p>Modifiez les noms de dossiers, visualisez et gérez chaque email individuellement</p>
                            </div>

                            <div class="plan-summary" id="planSummary">
                                <!-- Rempli dynamiquement -->
                            </div>

                            <div class="plan-controls">
                                <div class="control-group">
                                    <button class="btn btn-outline" onclick="window.modernDomainOrganizer.expandAllDomains()">
                                        <i class="fas fa-expand-alt"></i>
                                        Tout déplier
                                    </button>
                                    <button class="btn btn-outline" onclick="window.modernDomainOrganizer.collapseAllDomains()">
                                        <i class="fas fa-compress-alt"></i>
                                        Tout replier
                                    </button>
                                </div>
                                <div class="control-group">
                                    <button class="btn btn-outline" onclick="window.modernDomainOrganizer.selectAllDomains()">
                                        <i class="fas fa-check-square"></i>
                                        Tout sélectionner
                                    </button>
                                    <button class="btn btn-outline" onclick="window.modernDomainOrganizer.deselectAllDomains()">
                                        <i class="fas fa-square"></i>
                                        Tout désélectionner
                                    </button>
                                </div>
                            </div>

                            <div class="domains-container" id="domainsContainer">
                                <!-- Rempli dynamiquement -->
                            </div>

                            <div class="warning-box">
                                <div class="warning-icon">⚠️</div>
                                <div>
                                    <strong>Attention :</strong> Cette action va déplacer <strong id="totalEmailsCount">0</strong> emails sélectionnés vers leurs dossiers.
                                    <br>Vérifiez bien vos modifications avant de continuer.
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                    <i class="fas fa-arrow-left"></i>
                                    Retour configuration
                                </button>
                                <button class="btn btn-primary" id="executeBtn">
                                    <i class="fas fa-play"></i>
                                    Exécuter le plan
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 4: Execution -->
                    <div class="step-content hidden" id="step-execution">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>⚡ Exécution automatique</h2>
                                <p id="executionStatus">Préparation...</p>
                            </div>

                            <div class="execution-progress">
                                <div class="progress-container">
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="executionProgressBar"></div>
                                    </div>
                                    <div class="progress-text" id="executionPercent">0%</div>
                                </div>

                                <div class="execution-stats">
                                    <div class="stat">
                                        <span class="stat-number" id="foldersCreated">0</span>
                                        <span class="stat-label">Dossiers créés</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-number" id="emailsMoved">0</span>
                                        <span class="stat-label">Emails déplacés</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-number" id="domainsProcessed">0</span>
                                        <span class="stat-label">Domaines traités</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-number" id="emailsSkipped">0</span>
                                        <span class="stat-label">Emails ignorés</span>
                                    </div>
                                </div>

                                <div class="execution-log" id="executionLog"></div>
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
                                <h2>🎉 Rangement terminé avec succès !</h2>
                                <div class="success-report" id="successReport"></div>
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

                <!-- Modal d'édition d'email -->
                <div class="email-modal hidden" id="emailModal">
                    <div class="email-modal-content">
                        <div class="email-modal-header">
                            <h3>📧 Détails de l'email</h3>
                            <button class="modal-close" onclick="window.modernDomainOrganizer.closeEmailModal()">×</button>
                        </div>
                        <div class="email-modal-body" id="emailModalBody">
                            <!-- Contenu dynamique -->
                        </div>
                        <div class="email-modal-footer">
                            <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.closeEmailModal()">
                                Fermer
                            </button>
                            <button class="btn btn-primary" id="saveEmailBtn">
                                Sauvegarder les modifications
                            </button>
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
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    min-height: 100vh;
                    height: auto;
                    overflow-y: auto;
                }

                /* Header étendu */
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
                    min-width: 140px;
                    opacity: 0.5;
                    transition: all 0.3s ease;
                }

                .step.active, .step.completed {
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
                    font-size: 16px;
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
                    text-align: center;
                }

                .step.active span {
                    color: #1f2937;
                }

                /* Contenu étendu */
                .step-content {
                    animation: fadeIn 0.4s ease;
                }

                .step-content.hidden {
                    display: none;
                }

                .step-card {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    min-height: 60vh;
                    max-height: none;
                    height: auto;
                    overflow: visible;
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .card-header h2 {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    color: #1f2937;
                }

                .card-header p {
                    font-size: 16px;
                    color: #6b7280;
                    margin: 0;
                }

                /* Configuration étendue */
                .config-section {
                    max-width: 800px;
                    margin: 0 auto 32px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 150px 200px;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.2s;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .form-group textarea {
                    resize: vertical;
                    font-family: inherit;
                }

                .help-text {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                /* Progress bars */
                .progress-container {
                    position: relative;
                    width: 100%;
                    margin-bottom: 24px;
                }

                .progress-bar {
                    width: 100%;
                    height: 16px;
                    background: #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    width: 0%;
                    transition: width 0.4s ease;
                    border-radius: 8px;
                }

                .progress-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 12px;
                    font-weight: 600;
                    color: #1f2937;
                }

                /* Stats étendues */
                .scan-stats, .execution-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .stat {
                    text-align: center;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                .stat-number {
                    display: block;
                    font-size: 24px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                /* Plan étendu */
                .plan-summary {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    text-align: center;
                }

                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
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

                /* Contrôles du plan */
                .plan-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 16px;
                    background: #f9fafb;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                .control-group {
                    display: flex;
                    gap: 12px;
                }

                /* Conteneur des domaines */
                .domains-container {
                    height: auto;
                    max-height: none;
                    overflow: visible;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    background: white;
                    margin-bottom: 24px;
                }

                .domain-item {
                    border-bottom: 1px solid #f3f4f6;
                    transition: all 0.2s ease;
                }

                .domain-item:last-child {
                    border-bottom: none;
                }

                .domain-item.expanded {
                    background: #fafbfc;
                }

                .domain-header {
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .domain-header:hover {
                    background: #f9fafb;
                }

                .domain-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }

                .domain-expand {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    color: #6b7280;
                    transition: color 0.2s ease;
                }

                .domain-expand:hover {
                    color: #374151;
                    background: #e5e7eb;
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1f2937;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .domain-stats {
                    font-size: 14px;
                    color: #6b7280;
                    margin-top: 4px;
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
                    min-width: 180px;
                    transition: border-color 0.2s ease;
                }

                .folder-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                .action-badge {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .action-new {
                    background: #d1fae5;
                    color: #065f46;
                }

                .action-existing {
                    background: #e0e7ff;
                    color: #3730a3;
                }

                /* Contenu du domaine */
                .domain-content {
                    display: none;
                    padding: 0 20px 20px 60px;
                    border-top: 1px solid #e5e7eb;
                    background: #fafbfc;
                }

                .domain-content.expanded {
                    display: block;
                }

                .emails-list {
                    height: auto;
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background: white;
                }

                .email-item {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: background-color 0.2s ease;
                }

                .email-item:hover {
                    background: #f9fafb;
                }

                .email-item:last-child {
                    border-bottom: none;
                }

                .email-checkbox {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }

                .email-info {
                    flex: 1;
                    min-width: 0;
                }

                .email-subject {
                    font-size: 14px;
                    font-weight: 500;
                    color: #1f2937;
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .email-from {
                    font-size: 12px;
                    color: #6b7280;
                }

                .email-date {
                    font-size: 12px;
                    color: #9ca3af;
                    white-space: nowrap;
                }

                .email-actions {
                    display: flex;
                    gap: 8px;
                }

                /* Modal d'email */
                .email-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }

                .email-modal.hidden {
                    display: none;
                }

                .email-modal-content {
                    background: white;
                    border-radius: 16px;
                    max-width: 800px;
                    max-height: 80vh;
                    width: 90%;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }

                .email-modal-header {
                    padding: 24px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f9fafb;
                }

                .email-modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 4px;
                    border-radius: 4px;
                    transition: color 0.2s ease;
                }

                .modal-close:hover {
                    color: #374151;
                    background: #e5e7eb;
                }

                .email-modal-body {
                    padding: 24px;
                    max-height: 60vh;
                    overflow-y: auto;
                }

                .email-modal-footer {
                    padding: 24px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    background: #f9fafb;
                }

                .email-field {
                    margin-bottom: 16px;
                }

                .email-field label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 6px;
                }

                .email-field input,
                .email-field select,
                .email-field textarea {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .email-field textarea {
                    min-height: 100px;
                    resize: vertical;
                    font-family: inherit;
                }

                /* Warning étendu */
                .warning-box {
                    background: #fef3cd;
                    border: 1px solid #fbbf24;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 24px;
                    font-size: 14px;
                    color: #92400e;
                }

                .warning-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                /* Execution log étendu */
                .execution-log {
                    max-height: 200px;
                    overflow-y: auto;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 12px;
                    margin-top: 20px;
                }

                .log-entry {
                    margin-bottom: 4px;
                    color: #6b7280;
                    line-height: 1.4;
                }

                .log-entry.success { color: #059669; }
                .log-entry.error { color: #dc2626; }
                .log-entry.info { color: #3b82f6; }

                /* Buttons étendus */
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

                .btn-outline {
                    background: transparent;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .btn-outline:hover {
                    background: #f9fafb;
                    border-color: #9ca3af;
                }

                .btn-small {
                    padding: 6px 12px;
                    font-size: 12px;
                }

                /* Success étendu */
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
                    animation: bounce 0.6s ease;
                }

                .success-circle i {
                    font-size: 32px;
                    color: white;
                }

                .success-report {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    text-align: left;
                }

                .report-section {
                    margin-bottom: 20px;
                }

                .report-section h4 {
                    margin: 0 0 12px 0;
                    color: #065f46;
                    font-size: 16px;
                }

                .report-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .report-list li {
                    padding: 4px 0;
                    color: #047857;
                    font-size: 14px;
                    display: flex;
                    justify-content: space-between;
                }

                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% { transform: scale(1); }
                    40%, 43% { transform: scale(1.1); }
                    70% { transform: scale(1.05); }
                }

                /* Responsive */
                @media (max-width: 1200px) {
                    .modern-organizer {
                        max-width: 1000px;
                        padding: 16px;
                    }
                }

                @media (max-width: 768px) {
                    .modern-organizer {
                        padding: 12px;
                    }

                    .step-card {
                        padding: 20px;
                        min-height: 50vh;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .scan-stats, .execution-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .plan-summary {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .progress-steps {
                        flex-wrap: wrap;
                        gap: 12px;
                    }

                    .step-line {
                        display: none;
                    }

                    .plan-controls {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .domain-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                        padding: 16px;
                    }

                    .domain-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .email-modal-content {
                        width: 95%;
                        margin: 20px;
                        max-height: 90vh;
                    }

                    .domains-container {
                        border-radius: 8px;
                    }

                    .emails-list {
                        max-height: 300px;
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
        console.log('[ModernDomainOrganizer] Initialisation...');
        
        if (!window.authService?.isAuthenticated()) {
            window.uiManager?.showToast('Veuillez vous connecter', 'warning');
            return false;
        }

        this.setupEventListeners();
        this.setDefaultDates();
        
        return true;
    }

    setupEventListeners() {
        document.getElementById('startScanBtn')?.addEventListener('click', () => this.startAnalysis());
        document.getElementById('executeBtn')?.addEventListener('click', () => this.executeOrganization());
        document.getElementById('saveEmailBtn')?.addEventListener('click', () => this.saveEmailChanges());
    }

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate) startDate.valueAsDate = thirtyDaysAgo;
        if (endDate) endDate.valueAsDate = today;
    }

    goToStep(stepName) {
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.add('hidden');
        });

        document.getElementById(`step-${stepName}`)?.classList.remove('hidden');
        this.updateStepProgress(stepName);
        this.currentStep = stepName;
    }

    updateStepProgress(currentStep) {
        const steps = ['configuration', 'scanning', 'plan', 'execution'];
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
    // ANALYSE OPTIMISÉE
    // ================================================

    async startAnalysis() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.goToStep('scanning');
            
            const config = this.getConfigurationFromForm();
            console.log('[ModernDomainOrganizer] Configuration:', config);
            
            // Réinitialiser
            this.emailsByDomain.clear();
            this.allFolders.clear();
            this.organizationPlan.clear();
            this.expandedDomains.clear();
            
            // Étape 1: Charger les dossiers (15%)
            this.updateProgress(5, 'Chargement des dossiers...');
            await this.loadAllFolders();
            this.updateProgress(15, 'Dossiers chargés');

            // Étape 2: Scanner les emails (15% -> 70%)
            this.updateProgress(20, 'Début du scan des emails...');
            const emails = await this.scanEmails(config);
            this.updateProgress(70, `${emails.length} emails scannés`);

            // Étape 3: Analyser les domaines (70% -> 85%)
            this.updateProgress(75, 'Analyse des domaines...');
            await this.analyzeDomains(emails, config);
            this.updateProgress(85, 'Domaines analysés');

            // Étape 4: Créer le plan (85% -> 100%)
            this.updateProgress(90, 'Création du plan...');
            this.createOrganizationPlan();
            this.updateProgress(100, 'Plan créé');

            // Afficher le plan
            setTimeout(() => this.showOrganizationPlan(), 1000);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur analyse:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            this.goToStep('configuration');
        } finally {
            this.isProcessing = false;
        }
    }

    getConfigurationFromForm() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const minEmails = parseInt(document.getElementById('minEmails').value) || 3;
        const emailLimit = parseInt(document.getElementById('emailLimit').value);
        
        const excludeDomains = document.getElementById('excludeDomains').value
            .split(',')
            .map(d => d.trim())
            .filter(d => d);
        
        const excludeEmails = document.getElementById('excludeEmails').value
            .split('\n')
            .map(e => e.trim())
            .filter(e => e);

        return { startDate, endDate, minEmails, emailLimit, excludeDomains, excludeEmails };
    }

    async loadAllFolders() {
        try {
            const folders = await window.mailService.getFolders();
            this.allFolders.clear();
            
            folders.forEach(folder => {
                this.allFolders.set(folder.displayName.toLowerCase(), {
                    id: folder.id,
                    displayName: folder.displayName,
                    totalItemCount: folder.totalItemCount || 0
                });
            });

            console.log(`[ModernDomainOrganizer] ${this.allFolders.size} dossiers chargés`);
            this.updateStat('existingFolders', this.allFolders.size);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur chargement dossiers:', error);
            throw error;
        }
    }

    async scanEmails(config) {
        const allEmails = [];
        
        try {
            console.log(`[ModernDomainOrganizer] Scan avec limite: ${config.emailLimit === 0 ? 'tous les emails' : config.emailLimit + ' emails'}`);
            
            // Scanner sans limitation par défaut
            const scanLimit = config.emailLimit === 0 ? 10000 : config.emailLimit; // Limite pratique de 10k pour éviter les timeouts
            
            const options = {
                top: scanLimit,
                orderBy: 'receivedDateTime desc'
            };

            if (config.startDate) options.startDate = config.startDate;
            if (config.endDate) options.endDate = config.endDate;

            const emails = await window.mailService.getEmailsFromFolder('inbox', options);
            allEmails.push(...emails);
            
            console.log(`[ModernDomainOrganizer] ${emails.length} emails récupérés`);
            this.updateStat('scannedEmails', emails.length);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur scan inbox:', error);
            throw error;
        }

        return allEmails;
    }

    async analyzeDomains(emails, config) {
        const domainCounts = new Map();
        
        console.log(`[ModernDomainOrganizer] Analyse de ${emails.length} emails...`);
        
        for (const email of emails) {
            const domain = this.extractDomain(email);
            if (!domain) continue;
            
            if (this.shouldExcludeDomain(domain, config.excludeDomains)) continue;
            if (this.shouldExcludeEmail(email, config.excludeEmails)) continue;
            
            if (!domainCounts.has(domain)) {
                domainCounts.set(domain, {
                    count: 0,
                    emails: []
                });
            }
            
            const domainData = domainCounts.get(domain);
            domainData.count++;
            domainData.emails.push(email);
        }

        // Filtrer par nombre minimum d'emails
        domainCounts.forEach((data, domain) => {
            if (data.count >= config.minEmails) {
                this.emailsByDomain.set(domain, data);
            }
        });

        console.log(`[ModernDomainOrganizer] ${this.emailsByDomain.size} domaines valides trouvés`);
        this.updateStat('foundDomains', this.emailsByDomain.size);
    }

    createOrganizationPlan() {
        this.organizationPlan.clear();
        
        let newFoldersCount = 0;
        
        this.emailsByDomain.forEach((data, domain) => {
            const existingFolder = this.findExistingFolder(domain);
            
            if (existingFolder) {
                this.organizationPlan.set(domain, {
                    domain,
                    action: 'use-existing',
                    targetFolder: existingFolder.displayName,
                    targetFolderId: existingFolder.id,
                    emailCount: data.count,
                    emails: data.emails,
                    selected: true
                });
            } else {
                this.organizationPlan.set(domain, {
                    domain,
                    action: 'create-new',
                    targetFolder: domain,
                    targetFolderId: null,
                    emailCount: data.count,
                    emails: data.emails,
                    selected: true
                });
                newFoldersCount++;
            }
        });

        this.updateStat('newFoldersNeeded', newFoldersCount);
        console.log(`[ModernDomainOrganizer] Plan créé: ${this.organizationPlan.size} domaines`);
    }

    showOrganizationPlan() {
        this.goToStep('plan');
        
        const summary = document.getElementById('planSummary');
        const container = document.getElementById('domainsContainer');
        
        if (!summary || !container) return;
        
        this.displayPlanSummary(summary);
        this.displayDomainsWithEmails(container);
    }

    displayPlanSummary(summary) {
        const totalEmails = Array.from(this.organizationPlan.values())
            .reduce((sum, plan) => sum + plan.emailCount, 0);
        
        const newFolders = Array.from(this.organizationPlan.values())
            .filter(plan => plan.action === 'create-new');
        
        const existingFolders = Array.from(this.organizationPlan.values())
            .filter(plan => plan.action === 'use-existing');

        summary.innerHTML = `
            <div class="summary-item">
                <div class="summary-value">${this.organizationPlan.size}</div>
                <div class="summary-label">Domaines trouvés</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${totalEmails.toLocaleString()}</div>
                <div class="summary-label">Total emails</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${newFolders.length}</div>
                <div class="summary-label">Nouveaux dossiers</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${existingFolders.length}</div>
                <div class="summary-label">Dossiers existants</div>
            </div>
        `;

        this.updateTotalEmailsCount();
    }

    displayDomainsWithEmails(container) {
        container.innerHTML = '';
        
        // Trier les domaines par nombre d'emails (décroissant)
        const sortedDomains = Array.from(this.organizationPlan.entries())
            .sort((a, b) => b[1].emailCount - a[1].emailCount);

        sortedDomains.forEach(([domain, plan]) => {
            const domainElement = this.createDomainElement(domain, plan);
            container.appendChild(domainElement);
        });
    }

    createDomainElement(domain, plan) {
        const div = document.createElement('div');
        div.className = 'domain-item';
        div.dataset.domain = domain;
        
        const isExpanded = this.expandedDomains.has(domain);
        if (isExpanded) {
            div.classList.add('expanded');
        }

        div.innerHTML = `
            <div class="domain-header" onclick="window.modernDomainOrganizer.toggleDomain('${domain}')">
                <input type="checkbox" class="domain-checkbox" ${plan.selected ? 'checked' : ''} 
                       onclick="event.stopPropagation(); window.modernDomainOrganizer.toggleDomainSelection('${domain}')" 
                       data-domain="${domain}">
                
                <button class="domain-expand">
                    <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'}"></i>
                </button>
                
                <div class="domain-info">
                    <div class="domain-name">
                        📧 ${domain}
                    </div>
                    <div class="domain-stats">
                        ${plan.emailCount} emails • ${plan.emails.filter(e => e.selected !== false).length} sélectionnés
                    </div>
                </div>
                
                <div class="domain-actions" onclick="event.stopPropagation()">
                    <input type="text" class="folder-input" value="${plan.targetFolder}" 
                           placeholder="Nom du dossier" data-domain="${domain}"
                           onchange="window.modernDomainOrganizer.updateFolderName('${domain}', this.value)">
                    
                    <span class="action-badge ${plan.action === 'create-new' ? 'action-new' : 'action-existing'}">
                        ${plan.action === 'create-new' ? 'Nouveau' : 'Existant'}
                    </span>
                </div>
            </div>
            
            <div class="domain-content ${isExpanded ? 'expanded' : ''}">
                <div class="emails-list">
                    ${this.createEmailsList(domain, plan.emails)}
                </div>
            </div>
        `;

        return div;
    }

    createEmailsList(domain, emails) {
        return emails.map((email, index) => `
            <div class="email-item" data-email-id="${email.id}">
                <input type="checkbox" class="email-checkbox" ${email.selected !== false ? 'checked' : ''} 
                       onchange="window.modernDomainOrganizer.toggleEmailSelection('${domain}', '${email.id}')"
                       data-domain="${domain}" data-email-id="${email.id}">
                
                <div class="email-info">
                    <div class="email-subject" title="${email.subject || '(Pas de sujet)'}">
                        ${email.subject || '(Pas de sujet)'}
                    </div>
                    <div class="email-from">
                        De: ${email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu'}
                    </div>
                </div>
                
                <div class="email-date">
                    ${new Date(email.receivedDateTime).toLocaleDateString()}
                </div>
                
                <div class="email-actions">
                    <button class="btn btn-outline btn-small" 
                            onclick="window.modernDomainOrganizer.editEmail('${domain}', '${email.id}')">
                        <i class="fas fa-edit"></i>
                        Éditer
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ================================================
    // GESTION DES DOMAINES ET EMAILS
    // ================================================

    toggleDomain(domain) {
        if (this.expandedDomains.has(domain)) {
            this.expandedDomains.delete(domain);
        } else {
            this.expandedDomains.add(domain);
        }
        
        const domainElement = document.querySelector(`[data-domain="${domain}"]`);
        if (domainElement) {
            const content = domainElement.querySelector('.domain-content');
            const icon = domainElement.querySelector('.domain-expand i');
            
            if (this.expandedDomains.has(domain)) {
                domainElement.classList.add('expanded');
                content.classList.add('expanded');
                icon.className = 'fas fa-chevron-down';
            } else {
                domainElement.classList.remove('expanded');
                content.classList.remove('expanded');
                icon.className = 'fas fa-chevron-right';
            }
        }
    }

    toggleDomainSelection(domain) {
        const plan = this.organizationPlan.get(domain);
        if (plan) {
            plan.selected = !plan.selected;
            
            // Mettre à jour tous les emails de ce domaine
            plan.emails.forEach(email => {
                email.selected = plan.selected;
            });
            
            // Mettre à jour l'affichage
            this.updateDomainDisplay(domain);
            this.updateTotalEmailsCount();
        }
    }

    toggleEmailSelection(domain, emailId) {
        const plan = this.organizationPlan.get(domain);
        if (plan) {
            const email = plan.emails.find(e => e.id === emailId);
            if (email) {
                email.selected = !email.selected;
                
                // Mettre à jour le statut du domaine
                const selectedEmails = plan.emails.filter(e => e.selected !== false).length;
                plan.selected = selectedEmails > 0;
                
                // Mettre à jour l'affichage
                this.updateDomainDisplay(domain);
                this.updateTotalEmailsCount();
            }
        }
    }

    updateFolderName(domain, newName) {
        const plan = this.organizationPlan.get(domain);
        if (plan) {
            plan.targetFolder = newName;
            
            // Vérifier si c'est un dossier existant
            const existingFolder = this.findExistingFolderByName(newName);
            if (existingFolder) {
                plan.action = 'use-existing';
                plan.targetFolderId = existingFolder.id;
            } else {
                plan.action = 'create-new';
                plan.targetFolderId = null;
            }
            
            // Mettre à jour l'affichage du badge
            const domainElement = document.querySelector(`[data-domain="${domain}"]`);
            if (domainElement) {
                const badge = domainElement.querySelector('.action-badge');
                badge.className = `action-badge ${plan.action === 'create-new' ? 'action-new' : 'action-existing'}`;
                badge.textContent = plan.action === 'create-new' ? 'Nouveau' : 'Existant';
            }
            
            this.displayPlanSummary(document.getElementById('planSummary'));
        }
    }

    updateDomainDisplay(domain) {
        const plan = this.organizationPlan.get(domain);
        if (!plan) return;
        
        const domainElement = document.querySelector(`[data-domain="${domain}"]`);
        if (domainElement) {
            // Mettre à jour la checkbox du domaine
            const domainCheckbox = domainElement.querySelector('.domain-checkbox');
            domainCheckbox.checked = plan.selected;
            
            // Mettre à jour les stats
            const selectedEmails = plan.emails.filter(e => e.selected !== false).length;
            const statsElement = domainElement.querySelector('.domain-stats');
            statsElement.textContent = `${plan.emailCount} emails • ${selectedEmails} sélectionnés`;
            
            // Mettre à jour les checkboxes des emails
            plan.emails.forEach(email => {
                const emailCheckbox = domainElement.querySelector(`[data-email-id="${email.id}"]`);
                if (emailCheckbox) {
                    emailCheckbox.checked = email.selected !== false;
                }
            });
        }
    }

    updateTotalEmailsCount() {
        const totalSelected = Array.from(this.organizationPlan.values())
            .reduce((sum, plan) => {
                if (plan.selected) {
                    return sum + plan.emails.filter(e => e.selected !== false).length;
                }
                return sum;
            }, 0);
        
        const element = document.getElementById('totalEmailsCount');
        if (element) {
            element.textContent = totalSelected.toLocaleString();
        }
    }

    // ================================================
    // CONTRÔLES GLOBAUX
    // ================================================

    expandAllDomains() {
        this.organizationPlan.forEach((plan, domain) => {
            this.expandedDomains.add(domain);
        });
        this.showOrganizationPlan();
    }

    collapseAllDomains() {
        this.expandedDomains.clear();
        this.showOrganizationPlan();
    }

    selectAllDomains() {
        this.organizationPlan.forEach((plan, domain) => {
            plan.selected = true;
            plan.emails.forEach(email => {
                email.selected = true;
            });
            this.updateDomainDisplay(domain);
        });
        this.updateTotalEmailsCount();
    }

    deselectAllDomains() {
        this.organizationPlan.forEach((plan, domain) => {
            plan.selected = false;
            plan.emails.forEach(email => {
                email.selected = false;
            });
            this.updateDomainDisplay(domain);
        });
        this.updateTotalEmailsCount();
    }

    // ================================================
    // ÉDITION D'EMAIL
    // ================================================

    editEmail(domain, emailId) {
        const plan = this.organizationPlan.get(domain);
        if (!plan) return;
        
        const email = plan.emails.find(e => e.id === emailId);
        if (!email) return;
        
        this.showEmailModal(domain, email);
    }

    showEmailModal(domain, email) {
        const modal = document.getElementById('emailModal');
        const modalBody = document.getElementById('emailModalBody');
        
        if (!modal || !modalBody) return;
        
        modalBody.innerHTML = `
            <div class="email-field">
                <label>Sujet</label>
                <input type="text" id="emailSubject" value="${email.subject || ''}" readonly>
            </div>
            
            <div class="email-field">
                <label>Expéditeur</label>
                <input type="text" id="emailFrom" value="${email.from?.emailAddress?.address || ''}" readonly>
            </div>
            
            <div class="email-field">
                <label>Date de réception</label>
                <input type="text" id="emailDate" value="${new Date(email.receivedDateTime).toLocaleString()}" readonly>
            </div>
            
            <div class="email-field">
                <label>Dossier de destination</label>
                <select id="emailTargetFolder">
                    <option value="keep-domain">Garder avec le domaine (${domain})</option>
                    <option value="custom">Dossier personnalisé</option>
                    ${Array.from(this.allFolders.values()).map(folder => 
                        `<option value="${folder.id}">${folder.displayName}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="email-field" id="customFolderField" style="display: none;">
                <label>Nom du dossier personnalisé</label>
                <input type="text" id="customFolderName" placeholder="Nom du nouveau dossier">
            </div>
            
            <div class="email-field">
                <label>Action</label>
                <select id="emailAction">
                    <option value="move">Déplacer cet email</option>
                    <option value="skip">Ignorer cet email</option>
                </select>
            </div>
            
            <div class="email-field">
                <label>Aperçu du contenu</label>
                <textarea id="emailPreview" readonly rows="4">${email.bodyPreview || 'Pas d\'aperçu disponible'}</textarea>
            </div>
        `;
        
        // Event listeners pour le modal
        const targetFolderSelect = document.getElementById('emailTargetFolder');
        const customFolderField = document.getElementById('customFolderField');
        
        targetFolderSelect.addEventListener('change', () => {
            if (targetFolderSelect.value === 'custom') {
                customFolderField.style.display = 'block';
            } else {
                customFolderField.style.display = 'none';
            }
        });
        
        // Stocker les données pour la sauvegarde
        modal.dataset.domain = domain;
        modal.dataset.emailId = email.id;
        
        modal.classList.remove('hidden');
    }

    closeEmailModal() {
        const modal = document.getElementById('emailModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    saveEmailChanges() {
        const modal = document.getElementById('emailModal');
        const domain = modal.dataset.domain;
        const emailId = modal.dataset.emailId;
        
        const plan = this.organizationPlan.get(domain);
        if (!plan) return;
        
        const email = plan.emails.find(e => e.id === emailId);
        if (!email) return;
        
        const targetFolder = document.getElementById('emailTargetFolder').value;
        const customFolderName = document.getElementById('customFolderName').value;
        const action = document.getElementById('emailAction').value;
        
        // Mettre à jour l'email
        if (action === 'skip') {
            email.selected = false;
            email.customAction = 'skip';
        } else {
            email.selected = true;
            email.customAction = 'move';
            
            if (targetFolder === 'custom' && customFolderName) {
                email.customFolder = customFolderName;
                email.customFolderId = null;
            } else if (targetFolder !== 'keep-domain') {
                const folder = Array.from(this.allFolders.values()).find(f => f.id === targetFolder);
                if (folder) {
                    email.customFolder = folder.displayName;
                    email.customFolderId = folder.id;
                }
            } else {
                // Garder avec le domaine
                delete email.customFolder;
                delete email.customFolderId;
            }
        }
        
        // Mettre à jour l'affichage
        this.updateDomainDisplay(domain);
        this.updateTotalEmailsCount();
        
        this.closeEmailModal();
        window.uiManager?.showToast('Modifications sauvegardées', 'success');
    }

    // ================================================
    // EXÉCUTION
    // ================================================

    async executeOrganization() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.goToStep('execution');
            
            const results = {
                foldersCreated: 0,
                emailsMoved: 0,
                domainsProcessed: 0,
                emailsSkipped: 0,
                errors: [],
                createdFolders: [],
                processedDomains: []
            };
            
            this.addExecutionLog('🚀 Début de l\'organisation automatique', 'info');
            
            // Collecter tous les emails sélectionnés par dossier cible
            const folderActions = new Map();
            
            this.organizationPlan.forEach((plan, domain) => {
                if (!plan.selected) return;
                
                plan.emails.forEach(email => {
                    if (email.selected === false || email.customAction === 'skip') {
                        results.emailsSkipped++;
                        return;
                    }
                    
                    let targetFolder, targetFolderId, action;
                    
                    if (email.customFolder) {
                        // Email avec dossier personnalisé
                        targetFolder = email.customFolder;
                        targetFolderId = email.customFolderId;
                        action = targetFolderId ? 'use-existing' : 'create-new';
                    } else {
                        // Email suit le plan du domaine
                        targetFolder = plan.targetFolder;
                        targetFolderId = plan.targetFolderId;
                        action = plan.action;
                    }
                    
                    if (!folderActions.has(targetFolder)) {
                        folderActions.set(targetFolder, {
                            targetFolder,
                            targetFolderId,
                            action,
                            emails: []
                        });
                    }
                    
                    folderActions.get(targetFolder).emails.push(email);
                });
            });
            
            const totalFolders = folderActions.size;
            let processed = 0;
            
            for (const [folderName, folderData] of folderActions) {
                try {
                    this.updateExecutionProgress(
                        (processed / totalFolders) * 100,
                        `Traitement du dossier "${folderName}"...`
                    );
                    
                    let targetFolderId = folderData.targetFolderId;
                    
                    // Créer le dossier si nécessaire
                    if (folderData.action === 'create-new') {
                        this.addExecutionLog(`📁 Création du dossier "${folderName}"`, 'info');
                        const newFolder = await this.createFolder(folderName);
                        targetFolderId = newFolder.id;
                        results.foldersCreated++;
                        results.createdFolders.push(folderName);
                        this.updateExecutionStat('foldersCreated', results.foldersCreated);
                    } else {
                        this.addExecutionLog(`📁 Utilisation du dossier existant "${folderName}"`, 'info');
                    }
                    
                    // Déplacer les emails par petits lots
                    const batchSize = 10;
                    let moved = 0;
                    
                    for (let i = 0; i < folderData.emails.length; i += batchSize) {
                        const batch = folderData.emails.slice(i, i + batchSize);
                        await this.moveEmailBatch(batch, targetFolderId);
                        moved += batch.length;
                        results.emailsMoved += batch.length;
                        
                        this.updateExecutionStat('emailsMoved', results.emailsMoved);
                        
                        // Pause pour éviter les rate limits
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }
                    
                    this.addExecutionLog(`✅ ${moved} emails déplacés vers "${folderName}"`, 'success');
                    
                } catch (error) {
                    console.error(`[ModernDomainOrganizer] Erreur ${folderName}:`, error);
                    this.addExecutionLog(`❌ Erreur pour le dossier "${folderName}": ${error.message}`, 'error');
                    results.errors.push({ folder: folderName, error: error.message });
                }
                
                processed++;
            }
            
            // Compter les domaines traités
            this.organizationPlan.forEach((plan, domain) => {
                if (plan.selected && plan.emails.some(e => e.selected !== false && e.customAction !== 'skip')) {
                    results.domainsProcessed++;
                    const emailsProcessed = plan.emails.filter(e => e.selected !== false && e.customAction !== 'skip').length;
                    results.processedDomains.push(`${domain} (${emailsProcessed} emails)`);
                }
            });
            
            this.updateExecutionStat('domainsProcessed', results.domainsProcessed);
            this.updateExecutionStat('emailsSkipped', results.emailsSkipped);
            
            this.updateExecutionProgress(100, 'Organisation terminée !');
            this.addExecutionLog('🎉 Organisation automatique terminée avec succès !', 'success');
            
            setTimeout(() => this.showFinalReport(results), 1500);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur exécution:', error);
            this.addExecutionLog(`❌ Erreur critique: ${error.message}`, 'error');
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
        }
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
            throw new Error(`Impossible de créer le dossier "${folderName}": ${response.statusText}`);
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
        
        return await response.json();
    }

    showFinalReport(results) {
        this.goToStep('success');
        
        const report = document.getElementById('successReport');
        if (!report) return;
        
        let reportHTML = '<div class="report-section">';
        reportHTML += '<h4>📊 Résumé de l\'organisation</h4>';
        reportHTML += '<ul class="report-list">';
        reportHTML += `<li><span>Emails déplacés:</span> <strong>${results.emailsMoved.toLocaleString()}</strong></li>`;
        reportHTML += `<li><span>Emails ignorés:</span> <strong>${results.emailsSkipped.toLocaleString()}</strong></li>`;
        reportHTML += `<li><span>Domaines traités:</span> <strong>${results.domainsProcessed}</strong></li>`;
        reportHTML += `<li><span>Dossiers créés:</span> <strong>${results.foldersCreated}</strong></li>`;
        reportHTML += '</ul></div>';
        
        if (results.createdFolders.length > 0) {
            reportHTML += '<div class="report-section">';
            reportHTML += '<h4>✨ Nouveaux dossiers créés</h4>';
            reportHTML += '<ul class="report-list">';
            results.createdFolders.slice(0, 15).forEach(folder => {
                reportHTML += `<li>📁 ${folder}</li>`;
            });
            if (results.createdFolders.length > 15) {
                reportHTML += `<li><em>... et ${results.createdFolders.length - 15} autres dossiers</em></li>`;
            }
            reportHTML += '</ul></div>';
        }
        
        if (results.processedDomains.length > 0) {
            reportHTML += '<div class="report-section">';
            reportHTML += '<h4>📧 Domaines organisés</h4>';
            reportHTML += '<ul class="report-list">';
            results.processedDomains.slice(0, 10).forEach(domain => {
                reportHTML += `<li>${domain}</li>`;
            });
            if (results.processedDomains.length > 10) {
                reportHTML += `<li><em>... et ${results.processedDomains.length - 10} autres domaines</em></li>`;
            }
            reportHTML += '</ul></div>';
        }
        
        if (results.errors.length > 0) {
            reportHTML += '<div class="report-section">';
            reportHTML += '<h4>⚠️ Erreurs rencontrées</h4>';
            reportHTML += '<ul class="report-list">';
            results.errors.forEach(error => {
                reportHTML += `<li style="color: #dc2626;">${error.folder}: ${error.error}</li>`;
            });
            reportHTML += '</ul></div>';
        }
        
        report.innerHTML = reportHTML;
    }

    // ================================================
    // UTILITAIRES
    // ================================================

    updateProgress(percent, message) {
        const progressFill = document.getElementById('progressBar');
        const progressText = document.getElementById('progressPercent');
        const status = document.getElementById('scanStatus');

        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${Math.round(percent)}%`;
        if (status) status.textContent = message;
    }

    updateStat(statId, value) {
        const element = document.getElementById(statId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }

    updateExecutionProgress(percent, message) {
        const progressFill = document.getElementById('executionProgressBar');
        const progressText = document.getElementById('executionPercent');
        const status = document.getElementById('executionStatus');

        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${Math.round(percent)}%`;
        if (status) status.textContent = message;
    }

    updateExecutionStat(statId, value) {
        const element = document.getElementById(statId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }

    addExecutionLog(message, type = 'info') {
        const log = document.getElementById('executionLog');
        if (!log) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

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
        if (this.allFolders.has(domain.toLowerCase())) {
            return this.allFolders.get(domain.toLowerCase());
        }
        
        // Recherche partielle
        const domainParts = domain.split('.');
        if (domainParts.length > 1) {
            const mainDomain = domainParts[0];
            if (this.allFolders.has(mainDomain.toLowerCase())) {
                return this.allFolders.get(mainDomain.toLowerCase());
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

    restart() {
        this.currentStep = 'configuration';
        this.scanResults = null;
        this.organizationPlan.clear();
        this.emailsByDomain.clear();
        this.expandedDomains.clear();
        this.totalEmailsScanned = 0;
        
        this.goToStep('configuration');
        this.setDefaultDates();
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
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
        
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.style.display = 'block';
            pageContent.innerHTML = this.getPageHTML();
        }
        
        this.initializePage();
        
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
    document.addEventListener('click', function(e) {
        const rangerButton = e.target.closest('[data-page="ranger"]');
        if (!rangerButton) return;
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        window.modernDomainOrganizer.showPage();
        return false;
    }, true);
});

window.showModernDomainOrganizer = function() {
    window.modernDomainOrganizer.showPage();
};

console.log('[ModernDomainOrganizer] ✅ Module étendu avec édition complète chargé');
