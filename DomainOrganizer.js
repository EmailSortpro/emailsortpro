// ModernDomainOrganizer.js - Version corrigée avec gestion d'erreurs complète
// Interface compacte et optimisée

class ModernDomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.currentStep = 'introduction';
        this.scanResults = null;
        this.organizationPlan = new Map();
        this.allFolders = new Map();
        this.emailsByDomain = new Map();
        this.totalEmailsScanned = 0;
        this.expandedDomains = new Set();
        
        console.log('[ModernDomainOrganizer] ✅ Initialisé');
    }

    getPageHTML() {
        return `
            <div class="modern-organizer">
                <!-- Header avec progression -->
                <div class="organizer-header">
                    <div class="progress-steps">
                        <div class="step active" data-step="introduction">
                            <div class="step-circle">💡</div>
                            <span>Guide</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="configuration">
                            <div class="step-circle">⚙️</div>
                            <span>Config</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="scanning">
                            <div class="step-circle">🔍</div>
                            <span>Scan</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="plan">
                            <div class="step-circle">📋</div>
                            <span>Plan</span>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" data-step="execution">
                            <div class="step-circle">⚡</div>
                            <span>Action</span>
                        </div>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="organizer-main">
                    <div class="organizer-content">
                        <!-- Introduction compacte -->
                        <div class="step-content" id="step-introduction">
                            <div class="step-card intro-card">
                                <div class="card-header">
                                    <h2>🎯 Organisateur automatique par domaine</h2>
                                    <p>Créez automatiquement des dossiers par expéditeur (amazon.com, paypal.com...)</p>
                                </div>

                                <div class="intro-compact">
                                    <div class="process-flow">
                                        <div class="flow-step">
                                            <div class="flow-icon">⚙️</div>
                                            <span>Configuration</span>
                                        </div>
                                        <div class="flow-arrow">→</div>
                                        <div class="flow-step">
                                            <div class="flow-icon">🔍</div>
                                            <span>Analyse</span>
                                        </div>
                                        <div class="flow-arrow">→</div>
                                        <div class="flow-step">
                                            <div class="flow-icon">📋</div>
                                            <span>Édition</span>
                                        </div>
                                        <div class="flow-arrow">→</div>
                                        <div class="flow-step">
                                            <div class="flow-icon">⚡</div>
                                            <span>Exécution</span>
                                        </div>
                                    </div>

                                    <div class="example-compact">
                                        <div class="example-side">
                                            <h4>📥 Avant</h4>
                                            <div class="preview-box">
                                                <div class="preview-line">Amazon - Livraison</div>
                                                <div class="preview-line">PayPal - Paiement</div>
                                                <div class="preview-line">Amazon - Promo</div>
                                                <div class="preview-line">GitHub - Notification</div>
                                            </div>
                                        </div>
                                        <div class="example-arrow">→</div>
                                        <div class="example-side">
                                            <h4>📁 Après</h4>
                                            <div class="preview-box">
                                                <div class="preview-line">📁 amazon.com (2)</div>
                                                <div class="preview-line">📁 paypal.com (1)</div>
                                                <div class="preview-line">📁 github.com (1)</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="tips-compact">
                                        <div class="tip-item">
                                            <span class="tip-icon">🧪</span>
                                            <span><strong>Testez :</strong> Créez d'abord les dossiers seulement</span>
                                        </div>
                                        <div class="tip-item">
                                            <span class="tip-icon">📊</span>
                                            <span><strong>Seuil :</strong> 3+ emails par domaine recommandé</span>
                                        </div>
                                        <div class="tip-item">
                                            <span class="tip-icon">🚫</span>
                                            <span><strong>Exclusions :</strong> Gmail/Outlook déjà exclus</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="action-bar">
                                    <div></div>
                                    <button class="btn btn-primary btn-large" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                        <i class="fas fa-arrow-right"></i>
                                        Commencer l'organisation
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Configuration -->
                        <div class="step-content hidden" id="step-configuration">
                            <div class="step-card">
                                <div class="card-header">
                                    <h2>⚙️ Configuration</h2>
                                    <p>Paramétrez l'analyse selon vos besoins</p>
                                </div>

                                <div class="config-grid">
                                    <div class="config-group">
                                        <label>📅 Période d'analyse</label>
                                        <div class="date-row">
                                            <input type="date" id="startDate" title="Date de début">
                                            <span>→</span>
                                            <input type="date" id="endDate" title="Date de fin">
                                        </div>
                                    </div>

                                    <div class="config-group">
                                        <label>📊 Critères</label>
                                        <div class="criteria-row">
                                            <div class="input-group">
                                                <span>Min emails/domaine</span>
                                                <input type="number" id="minEmails" value="3" min="1" max="50">
                                            </div>
                                            <div class="input-group">
                                                <span>Limite scan</span>
                                                <select id="emailLimit">
                                                    <option value="0">Tous</option>
                                                    <option value="1000">1000</option>
                                                    <option value="2000">2000</option>
                                                    <option value="5000">5000</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="config-group">
                                        <label>🚫 Exclusions (optionnel)</label>
                                        <input type="text" id="excludeDomains" placeholder="domaine1.com, domaine2.com" 
                                               value="gmail.com, outlook.com, hotmail.com, hotmail.fr">
                                        <textarea id="excludeEmails" placeholder="email1@exemple.com&#10;email2@exemple.com" rows="2"></textarea>
                                    </div>
                                </div>

                                <div class="action-bar">
                                    <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('introduction')">
                                        <i class="fas fa-arrow-left"></i>
                                        Retour
                                    </button>
                                    <button class="btn btn-primary" id="startScanBtn">
                                        <i class="fas fa-search"></i>
                                        Analyser
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Scanning -->
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
                                            <span class="stat-label">Emails</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="foundDomains">0</span>
                                            <span class="stat-label">Domaines</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="existingFolders">0</span>
                                            <span class="stat-label">Existants</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="newFoldersNeeded">0</span>
                                            <span class="stat-label">Nouveaux</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Plan -->
                        <div class="step-content hidden" id="step-plan">
                            <div class="step-card plan-card">
                                <div class="card-header">
                                    <h2>📋 Plan d'organisation</h2>
                                    <p>Modifiez selon vos besoins</p>
                                </div>

                                <div class="plan-content">
                                    <div class="plan-summary" id="planSummary"></div>

                                    <div class="plan-controls">
                                        <div class="controls-row">
                                            <div class="search-box">
                                                <input type="text" id="domainSearch" placeholder="🔍 Rechercher..." 
                                                       onkeyup="window.modernDomainOrganizer.searchDomains(this.value)">
                                            </div>
                                            <div class="action-buttons">
                                                <button class="btn btn-outline btn-small" onclick="window.modernDomainOrganizer.selectAllDomains()">
                                                    ✅ Tout
                                                </button>
                                                <button class="btn btn-outline btn-small" onclick="window.modernDomainOrganizer.expandAllDomains()">
                                                    📂 Déplier
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="domains-container" id="domainsContainer"></div>

                                    <div class="execution-options">
                                        <div class="option-row">
                                            <label class="option-label">
                                                <input type="radio" name="executionType" value="folders-only">
                                                <span>📁 Créer dossiers seulement (test)</span>
                                            </label>
                                            <label class="option-label">
                                                <input type="radio" name="executionType" value="complete" checked>
                                                <span>⚡ Créer + Déplacer emails (complet)</span>
                                            </label>
                                        </div>
                                        <div class="selection-info">
                                            <span id="selectedEmailsText">0 emails sélectionnés</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="action-bar">
                                    <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                        <i class="fas fa-arrow-left"></i>
                                        Reconfigurer
                                    </button>
                                    <button class="btn btn-primary btn-large" id="executeSelectedBtn" onclick="window.modernDomainOrganizer.executeSelectedAction()">
                                        <i class="fas fa-play"></i>
                                        <span id="executeButtonText">Exécuter</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Execution -->
                        <div class="step-content hidden" id="step-execution">
                            <div class="step-card">
                                <div class="card-header">
                                    <h2>⚡ <span id="executionTitle">Exécution</span></h2>
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
                                            <span class="stat-label">Dossiers</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="emailsMoved">0</span>
                                            <span class="stat-label">Emails</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="domainsProcessed">0</span>
                                            <span class="stat-label">Domaines</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-number" id="errorsCount">0</span>
                                            <span class="stat-label">Erreurs</span>
                                        </div>
                                    </div>

                                    <div class="execution-log" id="executionLog"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Success -->
                        <div class="step-content hidden" id="step-success">
                            <div class="step-card success-card">
                                <div class="success-content">
                                    <div class="success-icon">🎉</div>
                                    <h2 id="successTitle">Terminé !</h2>
                                    <div class="success-report" id="successReport"></div>
                                </div>

                                <div class="action-bar">
                                    <button class="btn btn-outline" onclick="window.modernDomainOrganizer.goToStep('plan')">
                                        <i class="fas fa-arrow-left"></i>
                                        Retour
                                    </button>
                                    <button class="btn btn-primary" onclick="window.modernDomainOrganizer.restart()">
                                        <i class="fas fa-redo"></i>
                                        Recommencer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal d'édition -->
                <div class="email-modal hidden" id="emailModal">
                    <div class="email-modal-content">
                        <div class="email-modal-header">
                            <h3>📧 Édition email</h3>
                            <button class="modal-close" onclick="window.modernDomainOrganizer.closeEmailModal()">×</button>
                        </div>
                        <div class="email-modal-body" id="emailModalBody"></div>
                        <div class="email-modal-footer">
                            <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.closeEmailModal()">
                                Fermer
                            </button>
                            <button class="btn btn-primary" id="saveEmailBtn">
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .modern-organizer {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    box-sizing: border-box;
                }

                .organizer-header {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    flex-shrink: 0;
                }

                .organizer-main {
                    flex: 1;
                    overflow-y: auto;
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
                    gap: 6px;
                    min-width: 80px;
                    opacity: 0.5;
                    transition: opacity 0.3s;
                }

                .step.active, .step.completed {
                    opacity: 1;
                }

                .step-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: background 0.3s;
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
                    margin: 0 -5px;
                }

                .step span {
                    font-size: 12px;
                    font-weight: 500;
                    color: #6b7280;
                }

                .step.active span {
                    color: #1f2937;
                    font-weight: 600;
                }

                .step-content {
                    animation: fadeIn 0.3s ease;
                }

                .step-content.hidden {
                    display: none;
                }

                .step-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    min-height: 500px;
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .card-header h2 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    color: #1f2937;
                }

                .card-header p {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                }

                /* Introduction compacte */
                .intro-compact {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .process-flow {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .flow-step {
                    text-align: center;
                    min-width: 120px;
                }

                .flow-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .flow-step h4 {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0 0 4px 0;
                    color: #1f2937;
                }

                .flow-step p {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0;
                }

                .flow-arrow {
                    font-size: 16px;
                    color: #3b82f6;
                    font-weight: bold;
                }

                .example-compact {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 24px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .example-before, .example-after {
                    flex: 1;
                    max-width: 200px;
                }

                .example-before h4, .example-after h4 {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    color: #1f2937;
                }

                .inbox-preview, .folders-preview {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 12px;
                }

                .email-line, .folder-item {
                    font-size: 12px;
                    padding: 4px 0;
                    color: #374151;
                }

                .example-arrow {
                    font-size: 20px;
                    color: #3b82f6;
                    font-weight: bold;
                }

                .tips-compact h4 {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    color: #1f2937;
                }

                .tips-compact ul {
                    margin: 0;
                    padding-left: 16px;
                    list-style: none;
                }

                .tips-compact li {
                    font-size: 14px;
                    margin-bottom: 8px;
                    color: #374151;
                    position: relative;
                }

                .tips-compact li:before {
                    content: "•";
                    color: #3b82f6;
                    position: absolute;
                    left: -16px;
                }

                /* Configuration */
                .config-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .config-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .config-group label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .date-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .date-row input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .criteria-row {
                    display: flex;
                    gap: 16px;
                }

                .input-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .input-group span {
                    font-size: 12px;
                    color: #6b7280;
                }

                .input-group input, .input-group select {
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .config-group input[type="text"], .config-group textarea {
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    resize: none;
                }

                .config-group input:focus, .config-group select:focus, .config-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                /* Progress */
                .progress-container {
                    position: relative;
                    margin-bottom: 20px;
                }

                .progress-bar {
                    width: 100%;
                    height: 12px;
                    background: #e5e7eb;
                    border-radius: 6px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    width: 0%;
                    transition: width 0.4s ease;
                }

                .progress-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 10px;
                    font-weight: 600;
                    color: #1f2937;
                }

                .scan-stats, .execution-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .stat {
                    text-align: center;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                .stat-number {
                    display: block;
                    font-size: 20px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 11px;
                    color: #6b7280;
                    margin-top: 2px;
                }

                /* Plan */
                .plan-summary {
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    text-align: center;
                }

                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .summary-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .summary-label {
                    font-size: 12px;
                    color: #6b7280;
                }

                .plan-controls {
                    margin-bottom: 16px;
                }

                .controls-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .search-box {
                    flex: 1;
                    max-width: 300px;
                }

                .search-box input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                }

                .domains-container {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background: white;
                    max-height: 300px;
                    overflow-y: auto;
                    margin-bottom: 16px;
                }

                .domain-item {
                    border-bottom: 1px solid #f3f4f6;
                }

                .domain-item:last-child {
                    border-bottom: none;
                }

                .domain-header {
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .domain-header:hover {
                    background: #f9fafb;
                }

                .domain-checkbox {
                    width: 16px;
                    height: 16px;
                }

                .domain-expand {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 2px;
                    color: #6b7280;
                    font-size: 12px;
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1f2937;
                }

                .domain-stats {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 2px;
                }

                .domain-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .folder-input {
                    padding: 6px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 12px;
                    min-width: 120px;
                }

                .action-badge {
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
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

                .domain-content {
                    display: none;
                    padding: 0 16px 12px 40px;
                    background: #fafbfc;
                }

                .domain-content.expanded {
                    display: block;
                }

                .emails-list {
                    max-height: 200px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    background: white;
                }

                .email-item {
                    padding: 8px 12px;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                }

                .email-item:last-child {
                    border-bottom: none;
                }

                .email-checkbox {
                    width: 14px;
                    height: 14px;
                }

                .email-info {
                    flex: 1;
                    min-width: 0;
                }

                .email-subject {
                    font-weight: 500;
                    color: #1f2937;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .email-from {
                    font-size: 11px;
                    color: #6b7280;
                }

                .email-date {
                    font-size: 11px;
                    color: #9ca3af;
                }

                .execution-options {
                    background: #f0f9ff;
                    border: 1px solid #bae6fd;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                }

                .option-row {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .option-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 6px;
                    transition: background 0.2s;
                }

                .option-label:hover {
                    background: rgba(255, 255, 255, 0.7);
                }

                .option-label input[type="radio"] {
                    width: 16px;
                    height: 16px;
                }

                .selection-info {
                    text-align: center;
                    font-size: 14px;
                    font-weight: 500;
                    color: #0369a1;
                }

                /* Execution */
                .execution-log {
                    max-height: 150px;
                    overflow-y: auto;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 12px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 11px;
                }

                .log-entry {
                    margin-bottom: 2px;
                    color: #6b7280;
                    line-height: 1.3;
                }

                .log-entry.success { color: #059669; }
                .log-entry.error { color: #dc2626; }
                .log-entry.info { color: #3b82f6; }

                /* Success */
                .success-card {
                    text-align: center;
                }

                .success-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .success-report {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
                    text-align: left;
                    font-size: 14px;
                }

                .report-section {
                    margin-bottom: 12px;
                }

                .report-section h4 {
                    margin: 0 0 8px 0;
                    color: #065f46;
                    font-size: 14px;
                }

                .report-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .report-list li {
                    padding: 2px 0;
                    color: #047857;
                    font-size: 13px;
                }

                /* Modal */
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
                }

                .email-modal.hidden {
                    display: none;
                }

                .email-modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }

                .email-modal-header {
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f9fafb;
                }

                .email-modal-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 4px;
                }

                .email-modal-body {
                    padding: 16px;
                    max-height: 50vh;
                    overflow-y: auto;
                }

                .email-modal-footer {
                    padding: 16px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    background: #f9fafb;
                }

                /* Buttons */
                .action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-top: 24px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
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
                }

                .btn-small {
                    padding: 6px 12px;
                    font-size: 12px;
                }

                .btn-large {
                    padding: 14px 28px;
                    font-size: 16px;
                    font-weight: 700;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .modern-organizer {
                        padding: 8px;
                    }

                    .organizer-header {
                        padding: 12px;
                        margin-bottom: 12px;
                    }

                    .step-card {
                        padding: 16px;
                        height: calc(100vh - 180px);
                        min-height: 450px;
                    }

                    .plan-card {
                        height: calc(100vh - 180px);
                        min-height: 500px;
                    }

                    .card-header h2 {
                        font-size: 20px;
                    }

                    .process-flow {
                        flex-direction: column;
                        gap: 6px;
                    }

                    .flow-step {
                        min-width: auto;
                    }

                    .flow-arrow {
                        transform: rotate(90deg);
                        font-size: 12px;
                    }

                    .example-compact {
                        flex-direction: column;
                        gap: 12px;
                        padding: 12px;
                    }

                    .example-side {
                        max-width: 100%;
                    }

                    .example-arrow {
                        transform: rotate(90deg);
                        margin: 0;
                    }

                    .tip-item {
                        font-size: 12px;
                    }

                    .criteria-row {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .controls-row {
                        flex-direction: column;
                        gap: 8px;
                        padding: 8px;
                    }

                    .search-box {
                        max-width: 100%;
                    }

                    .action-buttons {
                        width: 100%;
                        justify-content: center;
                    }

                    .scan-stats, .execution-stats {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                    }

                    .plan-summary {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                        padding: 8px;
                    }

                    .summary-value {
                        font-size: 18px;
                    }

                    .option-row {
                        gap: 6px;
                    }

                    .option-label {
                        font-size: 13px;
                        padding: 4px;
                    }

                    .execution-options {
                        padding: 8px;
                    }

                    .domains-container {
                        max-height: 200px;
                    }

                    .domain-header {
                        flex-wrap: wrap;
                        gap: 8px;
                        padding: 12px;
                    }

                    .domain-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .btn-large {
                        padding: 10px 16px;
                        font-size: 14px;
                    }

                    .action-bar {
                        flex-direction: row;
                        gap: 8px;
                        padding: 8px 0 0 0;
                        margin-top: 8px;
                    }

                    .action-bar .btn {
                        flex: 1;
                        justify-content: center;
                        min-width: 0;
                    }

                    .btn {
                        padding: 8px 12px;
                        font-size: 13px;
                    }
                }

                .hidden {
                    display: none !important;
                }

                .error-message {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 12px;
                    border-radius: 6px;
                    margin: 8px 0;
                    font-size: 14px;
                }

                .warning-message {
                    background: #fef3cd;
                    border: 1px solid #fbbf24;
                    color: #92400e;
                    padding: 12px;
                    border-radius: 6px;
                    margin: 8px 0;
                    font-size: 14px;
                }

                .info-message {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    color: #1e40af;
                    padding: 12px;
                    border-radius: 6px;
                    margin: 8px 0;
                    font-size: 14px;
                }
            </style>
        `;
    }

    // Méthodes principales avec gestion d'erreurs renforcée
    async initializePage() {
        try {
            console.log('[ModernDomainOrganizer] Initialisation...');
            
            if (!window.authService?.isAuthenticated()) {
                this.showError('Veuillez vous connecter pour continuer');
                return false;
            }

            this.setupEventListeners();
            this.setDefaultDates();
            
            return true;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur initialisation:', error);
            this.showError('Erreur lors de l\'initialisation: ' + error.message);
            return false;
        }
    }

    setupEventListeners() {
        try {
            // Event listeners pour les boutons principaux
            const startBtn = document.getElementById('startScanBtn');
            const executeBtn = document.getElementById('executeSelectedBtn');
            const saveBtn = document.getElementById('saveEmailBtn');
            
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startAnalysis());
                console.log('[ModernDomainOrganizer] ✅ Event listener startScanBtn ajouté');
            }
            
            if (executeBtn) {
                executeBtn.addEventListener('click', () => this.executeSelectedAction());
                console.log('[ModernDomainOrganizer] ✅ Event listener executeSelectedBtn ajouté');
            }
            
            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveEmailChanges());
                console.log('[ModernDomainOrganizer] ✅ Event listener saveEmailBtn ajouté');
            }
            
            // Event listeners pour les types d'exécution
            document.querySelectorAll('input[name="executionType"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    console.log('[ModernDomainOrganizer] Type d\'exécution changé:', radio.value);
                    this.updateExecutionButton();
                });
            });
            
            console.log('[ModernDomainOrganizer] ✅ Tous les event listeners configurés');
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur setup listeners:', error);
        }
    }

    setDefaultDates() {
        try {
            const today = new Date();
            const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
            
            const startDate = document.getElementById('startDate');
            const endDate = document.getElementById('endDate');
            
            if (startDate) startDate.valueAsDate = thirtyDaysAgo;
            if (endDate) endDate.valueAsDate = today;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur dates par défaut:', error);
        }
    }

    goToStep(stepName) {
        try {
            document.querySelectorAll('.step-content').forEach(content => {
                content.classList.add('hidden');
            });

            const stepElement = document.getElementById(`step-${stepName}`);
            if (stepElement) {
                stepElement.classList.remove('hidden');
                this.updateStepProgress(stepName);
                this.currentStep = stepName;
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur navigation:', error);
        }
    }

    updateStepProgress(currentStep) {
        try {
            const steps = ['introduction', 'configuration', 'scanning', 'plan', 'execution'];
            const currentIndex = steps.indexOf(currentStep);

            document.querySelectorAll('.step').forEach((step, index) => {
                step.classList.remove('active', 'completed');
                
                if (index < currentIndex) {
                    step.classList.add('completed');
                } else if (index === currentIndex) {
                    step.classList.add('active');
                }
            });
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour progression:', error);
        }
    }

    updateExecutionButton() {
        try {
            const executionType = document.querySelector('input[name="executionType"]:checked')?.value;
            const buttonText = document.getElementById('executeButtonText');
            
            if (buttonText) {
                if (executionType === 'folders-only') {
                    buttonText.textContent = 'Créer dossiers';
                } else {
                    buttonText.textContent = 'Exécution complète';
                }
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour bouton:', error);
        }
    }

    executeSelectedAction() {
        try {
            const executionType = document.querySelector('input[name="executionType"]:checked')?.value;
            
            if (executionType === 'folders-only') {
                this.createFoldersOnly();
            } else {
                this.executeOrganization();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur action sélectionnée:', error);
            this.showError('Erreur lors de l\'exécution: ' + error.message);
        }
    }

    // Analyse avec gestion d'erreurs
    async startAnalysis() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.clearErrors();
            this.goToStep('scanning');
            
            const config = this.getConfigurationFromForm();
            if (!this.validateConfiguration(config)) {
                this.goToStep('configuration');
                return;
            }
            
            console.log('[ModernDomainOrganizer] Configuration:', config);
            
            // Reset
            this.emailsByDomain.clear();
            this.allFolders.clear();
            this.organizationPlan.clear();
            this.expandedDomains.clear();
            
            // Étapes avec gestion d'erreurs
            await this.executeWithProgress([
                { percent: 5, message: 'Chargement des dossiers...', action: () => this.loadAllFolders() },
                { percent: 20, message: 'Scan des emails...', action: () => this.scanEmails(config) },
                { percent: 70, message: 'Analyse des domaines...', action: (emails) => this.analyzeDomains(emails, config) },
                { percent: 90, message: 'Création du plan...', action: () => this.createOrganizationPlan() },
                { percent: 100, message: 'Terminé !', action: () => this.showOrganizationPlan() }
            ]);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur analyse:', error);
            this.showError('Erreur lors de l\'analyse: ' + error.message);
            this.goToStep('configuration');
        } finally {
            this.isProcessing = false;
        }
    }

    async executeWithProgress(steps) {
        let result = null;
        
        for (const step of steps) {
            try {
                this.updateProgress(step.percent, step.message);
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (step.action) {
                    result = await step.action(result);
                }
            } catch (error) {
                throw new Error(`${step.message} - ${error.message}`);
            }
        }
        
        return result;
    }

    validateConfiguration(config) {
        try {
            if (!config.startDate || !config.endDate) {
                this.showError('Veuillez sélectionner une période valide');
                return false;
            }
            
            const startDate = new Date(config.startDate);
            const endDate = new Date(config.endDate);
            
            if (startDate >= endDate) {
                this.showError('La date de début doit être antérieure à la date de fin');
                return false;
            }
            
            if (config.minEmails < 1 || config.minEmails > 100) {
                this.showError('Le nombre minimum d\'emails doit être entre 1 et 100');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur validation:', error);
            this.showError('Configuration invalide: ' + error.message);
            return false;
        }
    }

    getConfigurationFromForm() {
        try {
            const startDate = document.getElementById('startDate')?.value || '';
            const endDate = document.getElementById('endDate')?.value || '';
            const minEmails = parseInt(document.getElementById('minEmails')?.value) || 3;
            const emailLimit = parseInt(document.getElementById('emailLimit')?.value) || 0;
            
            const excludeDomains = (document.getElementById('excludeDomains')?.value || '')
                .split(',')
                .map(d => d.trim())
                .filter(d => d);
            
            const excludeEmails = (document.getElementById('excludeEmails')?.value || '')
                .split('\n')
                .map(e => e.trim())
                .filter(e => e);

            return { startDate, endDate, minEmails, emailLimit, excludeDomains, excludeEmails };
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur lecture config:', error);
            throw new Error('Impossible de lire la configuration');
        }
    }

    async loadAllFolders() {
        try {
            console.log('[ModernDomainOrganizer] Chargement des dossiers...');
            
            if (!window.mailService) {
                throw new Error('Service mail non disponible');
            }
            
            const folders = await window.mailService.getFolders();
            if (!Array.isArray(folders)) {
                throw new Error('Format de dossiers invalide');
            }
            
            this.allFolders.clear();
            
            folders.forEach(folder => {
                if (folder && folder.displayName) {
                    const folderKey = folder.displayName.toLowerCase().trim();
                    this.allFolders.set(folderKey, {
                        id: folder.id,
                        displayName: folder.displayName,
                        totalItemCount: folder.totalItemCount || 0,
                        parentFolderId: folder.parentFolderId
                    });
                    
                    console.log(`[ModernDomainOrganizer] Dossier: "${folder.displayName}"`);
                }
            });

            console.log(`[ModernDomainOrganizer] ✅ ${this.allFolders.size} dossiers chargés`);
            console.log('[ModernDomainOrganizer] Liste complète:', Array.from(this.allFolders.keys()));
            this.updateStat('existingFolders', this.allFolders.size);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur chargement dossiers:', error);
            throw new Error('Impossible de charger les dossiers: ' + error.message);
        }
    }

    async scanEmails(config) {
        try {
            console.log('[ModernDomainOrganizer] Scan des emails...');
            
            if (!window.mailService) {
                throw new Error('Service mail non disponible');
            }
            
            const scanLimit = config.emailLimit === 0 ? 10000 : config.emailLimit;
            
            const options = {
                top: Math.min(scanLimit, 10000), // Limitation de sécurité
                orderBy: 'receivedDateTime desc'
            };

            if (config.startDate) options.startDate = config.startDate;
            if (config.endDate) options.endDate = config.endDate;

            const emails = await window.mailService.getEmailsFromFolder('inbox', options);
            
            if (!Array.isArray(emails)) {
                throw new Error('Format d\'emails invalide');
            }
            
            console.log(`[ModernDomainOrganizer] ${emails.length} emails récupérés`);
            this.updateStat('scannedEmails', emails.length);
            
            return emails;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur scan emails:', error);
            throw new Error('Impossible de scanner les emails: ' + error.message);
        }
    }

    async analyzeDomains(emails, config) {
        try {
            const domainCounts = new Map();
            
            console.log(`[ModernDomainOrganizer] Analyse de ${emails.length} emails...`);
            
            for (const email of emails) {
                try {
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
                } catch (emailError) {
                    console.warn('[ModernDomainOrganizer] Erreur traitement email:', emailError);
                    // Continue avec l'email suivant
                }
            }

            // Filtrer par seuil minimum
            domainCounts.forEach((data, domain) => {
                if (data.count >= config.minEmails) {
                    this.emailsByDomain.set(domain, data);
                }
            });

            console.log(`[ModernDomainOrganizer] ${this.emailsByDomain.size} domaines valides trouvés`);
            this.updateStat('foundDomains', this.emailsByDomain.size);
            
            if (this.emailsByDomain.size === 0) {
                throw new Error('Aucun domaine trouvé avec le seuil configuré');
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur analyse domaines:', error);
            throw new Error('Erreur lors de l\'analyse des domaines: ' + error.message);
        }
    }

    createOrganizationPlan() {
        try {
            this.organizationPlan.clear();
            
            let newFoldersCount = 0;
            
            this.emailsByDomain.forEach((data, domain) => {
                try {
                    const existingFolder = this.findExistingFolder(domain);
                    
                    if (existingFolder) {
                        console.log(`[ModernDomainOrganizer] ✅ Dossier existant trouvé pour ${domain}: ${existingFolder.displayName}`);
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
                        console.log(`[ModernDomainOrganizer] 📁 Nouveau dossier nécessaire pour ${domain}`);
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
                } catch (domainError) {
                    console.warn(`[ModernDomainOrganizer] Erreur plan pour ${domain}:`, domainError);
                }
            });

            this.updateStat('newFoldersNeeded', newFoldersCount);
            console.log(`[ModernDomainOrganizer] Plan créé: ${this.organizationPlan.size} domaines, ${newFoldersCount} nouveaux dossiers`);
            
            if (this.organizationPlan.size === 0) {
                throw new Error('Aucun plan d\'organisation créé');
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur création plan:', error);
            throw new Error('Erreur lors de la création du plan: ' + error.message);
        }
    }

    showOrganizationPlan() {
        try {
            this.goToStep('plan');
            
            const summary = document.getElementById('planSummary');
            const container = document.getElementById('domainsContainer');
            
            if (!summary || !container) {
                throw new Error('Éléments d\'interface manquants');
            }
            
            this.displayPlanSummary(summary);
            this.displayDomainsWithEmails(container);
            this.updateTotalEmailsCount();
            this.updateExecutionButton();
            
            // Réattacher les event listeners après affichage
            setTimeout(() => {
                this.setupEventListeners();
            }, 100);
            
            console.log('[ModernDomainOrganizer] ✅ Plan d\'organisation affiché avec boutons');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage plan:', error);
            this.showError('Erreur lors de l\'affichage du plan: ' + error.message);
        }
    }

    displayPlanSummary(summary) {
        try {
            const totalEmails = Array.from(this.organizationPlan.values())
                .reduce((sum, plan) => sum + plan.emailCount, 0);
            
            const newFolders = Array.from(this.organizationPlan.values())
                .filter(plan => plan.action === 'create-new');
            
            const existingFolders = Array.from(this.organizationPlan.values())
                .filter(plan => plan.action === 'use-existing');

            summary.innerHTML = `
                <div class="summary-item">
                    <div class="summary-value">${this.organizationPlan.size}</div>
                    <div class="summary-label">Domaines</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${totalEmails.toLocaleString()}</div>
                    <div class="summary-label">Emails</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${newFolders.length}</div>
                    <div class="summary-label">Nouveaux</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${existingFolders.length}</div>
                    <div class="summary-label">Existants</div>
                </div>
            `;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage résumé:', error);
        }
    }

    displayDomainsWithEmails(container) {
        try {
            container.innerHTML = '';
            
            const sortedDomains = Array.from(this.organizationPlan.entries())
                .sort((a, b) => b[1].emailCount - a[1].emailCount);

            sortedDomains.forEach(([domain, plan]) => {
                try {
                    const domainElement = this.createDomainElement(domain, plan);
                    container.appendChild(domainElement);
                } catch (elementError) {
                    console.warn(`[ModernDomainOrganizer] Erreur élément ${domain}:`, elementError);
                }
            });
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage domaines:', error);
        }
    }

    createDomainElement(domain, plan) {
        try {
            const div = document.createElement('div');
            div.className = 'domain-item';
            div.dataset.domain = domain;
            
            const isExpanded = this.expandedDomains.has(domain);
            if (isExpanded) {
                div.classList.add('expanded');
            }

            const safeSubject = (email) => {
                try {
                    return email.subject || '(Sans sujet)';
                } catch {
                    return '(Erreur)';
                }
            };

            const safeFrom = (email) => {
                try {
                    return email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu';
                } catch {
                    return 'Inconnu';
                }
            };

            const safeDate = (email) => {
                try {
                    return new Date(email.receivedDateTime).toLocaleDateString();
                } catch {
                    return 'Date inconnue';
                }
            };

            div.innerHTML = `
                <div class="domain-header" onclick="window.modernDomainOrganizer.toggleDomain('${domain}')">
                    <input type="checkbox" class="domain-checkbox" ${plan.selected ? 'checked' : ''} 
                           onclick="event.stopPropagation(); window.modernDomainOrganizer.toggleDomainSelection('${domain}')" 
                           data-domain="${domain}">
                    
                    <button class="domain-expand">
                        <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'}"></i>
                    </button>
                    
                    <div class="domain-info">
                        <div class="domain-name">📧 ${domain}</div>
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
                        ${plan.emails.map((email) => `
                            <div class="email-item" data-email-id="${email.id}">
                                <input type="checkbox" class="email-checkbox" ${email.selected !== false ? 'checked' : ''} 
                                       onchange="window.modernDomainOrganizer.toggleEmailSelection('${domain}', '${email.id}')"
                                       data-domain="${domain}" data-email-id="${email.id}">
                                
                                <div class="email-info">
                                    <div class="email-subject" title="${safeSubject(email)}">
                                        ${safeSubject(email)}
                                    </div>
                                    <div class="email-from">De: ${safeFrom(email)}</div>
                                </div>
                                
                                <div class="email-date">${safeDate(email)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            return div;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur création élément domaine:', error);
            
            // Élément de fallback en cas d'erreur
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'domain-item error';
            fallbackDiv.innerHTML = `
                <div class="domain-header">
                    <div class="domain-info">
                        <div class="domain-name">❌ ${domain}</div>
                        <div class="domain-stats">Erreur d'affichage</div>
                    </div>
                </div>
            `;
            return fallbackDiv;
        }
    }

    // Gestion des interactions avec protection d'erreurs
    toggleDomain(domain) {
        try {
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
                    if (content) content.classList.add('expanded');
                    if (icon) icon.className = 'fas fa-chevron-down';
                } else {
                    domainElement.classList.remove('expanded');
                    if (content) content.classList.remove('expanded');
                    if (icon) icon.className = 'fas fa-chevron-right';
                }
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur toggle domaine:', error);
        }
    }

    toggleDomainSelection(domain) {
        try {
            const plan = this.organizationPlan.get(domain);
            if (plan) {
                plan.selected = !plan.selected;
                
                plan.emails.forEach(email => {
                    email.selected = plan.selected;
                });
                
                this.updateDomainDisplay(domain);
                this.updateTotalEmailsCount();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sélection domaine:', error);
        }
    }

    toggleEmailSelection(domain, emailId) {
        try {
            const plan = this.organizationPlan.get(domain);
            if (plan) {
                const email = plan.emails.find(e => e.id === emailId);
                if (email) {
                    email.selected = !email.selected;
                    
                    const selectedEmails = plan.emails.filter(e => e.selected !== false).length;
                    plan.selected = selectedEmails > 0;
                    
                    this.updateDomainDisplay(domain);
                    this.updateTotalEmailsCount();
                }
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sélection email:', error);
        }
    }

    updateFolderName(domain, newName) {
        try {
            if (!newName || newName.trim() === '') {
                this.showWarning('Le nom du dossier ne peut pas être vide');
                return;
            }
            
            const plan = this.organizationPlan.get(domain);
            if (plan) {
                const trimmedName = newName.trim();
                plan.targetFolder = trimmedName;
                
                console.log(`[ModernDomainOrganizer] 🔄 Mise à jour nom dossier pour ${domain}: "${trimmedName}"`);
                
                const existingFolder = this.findExistingFolderByName(trimmedName);
                if (existingFolder) {
                    console.log(`[ModernDomainOrganizer] ✅ Dossier existant trouvé: "${existingFolder.displayName}"`);
                    plan.action = 'use-existing';
                    plan.targetFolderId = existingFolder.id;
                } else {
                    console.log(`[ModernDomainOrganizer] 📁 Nouveau dossier sera créé: "${trimmedName}"`);
                    plan.action = 'create-new';
                    plan.targetFolderId = null;
                }
                
                const domainElement = document.querySelector(`[data-domain="${domain}"]`);
                if (domainElement) {
                    const badge = domainElement.querySelector('.action-badge');
                    if (badge) {
                        badge.className = `action-badge ${plan.action === 'create-new' ? 'action-new' : 'action-existing'}`;
                        badge.textContent = plan.action === 'create-new' ? 'Nouveau' : 'Existant';
                    }
                }
                
                this.displayPlanSummary(document.getElementById('planSummary'));
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour nom dossier:', error);
            this.showError('Erreur lors de la mise à jour du nom de dossier');
        }
    }

    updateDomainDisplay(domain) {
        try {
            const plan = this.organizationPlan.get(domain);
            if (!plan) return;
            
            const domainElement = document.querySelector(`[data-domain="${domain}"]`);
            if (domainElement) {
                const domainCheckbox = domainElement.querySelector('.domain-checkbox');
                if (domainCheckbox) domainCheckbox.checked = plan.selected;
                
                const selectedEmails = plan.emails.filter(e => e.selected !== false).length;
                const statsElement = domainElement.querySelector('.domain-stats');
                if (statsElement) {
                    statsElement.textContent = `${plan.emailCount} emails • ${selectedEmails} sélectionnés`;
                }
                
                plan.emails.forEach(email => {
                    const emailCheckbox = domainElement.querySelector(`[data-email-id="${email.id}"]`);
                    if (emailCheckbox) {
                        emailCheckbox.checked = email.selected !== false;
                    }
                });
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour affichage domaine:', error);
        }
    }

    updateTotalEmailsCount() {
        try {
            const totalSelected = Array.from(this.organizationPlan.values())
                .reduce((sum, plan) => {
                    if (plan.selected) {
                        return sum + plan.emails.filter(e => e.selected !== false).length;
                    }
                    return sum;
                }, 0);
            
            const element = document.getElementById('selectedEmailsText');
            if (element) {
                element.textContent = `${totalSelected.toLocaleString()} emails sélectionnés`;
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour total:', error);
        }
    }

    // Contrôles globaux
    expandAllDomains() {
        try {
            this.organizationPlan.forEach((plan, domain) => {
                this.expandedDomains.add(domain);
            });
            this.showOrganizationPlan();
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur déplier tout:', error);
        }
    }

    selectAllDomains() {
        try {
            this.organizationPlan.forEach((plan, domain) => {
                plan.selected = true;
                plan.emails.forEach(email => {
                    email.selected = true;
                });
                this.updateDomainDisplay(domain);
            });
            this.updateTotalEmailsCount();
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sélectionner tout:', error);
        }
    }

    // Recherche
    searchDomains(searchTerm) {
        try {
            const container = document.getElementById('domainsContainer');
            if (!container) return;
            
            const domainItems = container.querySelectorAll('.domain-item');
            let visibleCount = 0;
            
            domainItems.forEach(item => {
                try {
                    const domain = item.dataset.domain;
                    const domainName = item.querySelector('.domain-name')?.textContent?.toLowerCase() || '';
                    
                    if (!searchTerm || domainName.includes(searchTerm.toLowerCase())) {
                        item.classList.remove('hidden');
                        visibleCount++;
                    } else {
                        item.classList.add('hidden');
                    }
                } catch (itemError) {
                    console.warn('[ModernDomainOrganizer] Erreur item recherche:', itemError);
                }
            });
            
            if (visibleCount === 0 && searchTerm) {
                this.showSearchNoResults(searchTerm, container);
            } else {
                this.clearSearchNoResults(container);
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur recherche:', error);
        }
    }

    showSearchNoResults(searchTerm, container) {
        try {
            this.clearSearchNoResults(container);
            
            const message = document.createElement('div');
            message.className = 'search-no-results';
            message.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #6b7280;">
                    <p>Aucun domaine trouvé pour "${searchTerm}"</p>
                </div>
            `;
            container.appendChild(message);
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage no results:', error);
        }
    }

    clearSearchNoResults(container) {
        try {
            const existingMessage = container.querySelector('.search-no-results');
            if (existingMessage) {
                existingMessage.remove();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur clear no results:', error);
        }
    }

    // Création des dossiers seulement
    async createFoldersOnly() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.clearErrors();
            
            const selectedDomains = Array.from(this.organizationPlan.values()).filter(p => p.selected);
            const newFolders = selectedDomains.filter(p => p.action === 'create-new');
            
            if (newFolders.length === 0) {
                this.showWarning('Aucun nouveau dossier à créer');
                return;
            }
            
            this.goToStep('execution');
            document.getElementById('executionTitle').textContent = 'Création des dossiers';
            
            const results = {
                foldersCreated: 0,
                emailsMoved: 0,
                domainsProcessed: 0,
                errorsCount: 0,
                errors: [],
                createdFolders: []
            };
            
            this.addExecutionLog('📁 Début de la création des dossiers', 'info');
            
            const totalFolders = newFolders.length;
            let processed = 0;
            
            for (const plan of newFolders) {
                try {
                    this.updateExecutionProgress(
                        (processed / totalFolders) * 100,
                        `Création du dossier "${plan.targetFolder}"...`
                    );
                    
                    this.addExecutionLog(`📁 Création du dossier "${plan.targetFolder}"`, 'info');
                    await this.createFolder(plan.targetFolder);
                    
                    results.foldersCreated++;
                    results.createdFolders.push(plan.targetFolder);
                    this.updateExecutionStat('foldersCreated', results.foldersCreated);
                    
                    // Pause pour éviter les rate limits
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                } catch (error) {
                    console.error(`[ModernDomainOrganizer] Erreur création ${plan.targetFolder}:`, error);
                    this.addExecutionLog(`❌ Erreur pour "${plan.targetFolder}": ${error.message}`, 'error');
                    results.errors.push({ folder: plan.targetFolder, error: error.message });
                    results.errorsCount++;
                    this.updateExecutionStat('errorsCount', results.errorsCount);
                }
                
                processed++;
            }
            
            this.updateExecutionProgress(100, 'Création terminée !');
            this.addExecutionLog('✅ Création des dossiers terminée', 'success');
            
            // Recharger les dossiers
            try {
                await this.loadAllFolders();
                this.addExecutionLog('🔄 Liste des dossiers mise à jour', 'info');
            } catch (reloadError) {
                console.warn('[ModernDomainOrganizer] Erreur rechargement dossiers:', reloadError);
            }
            
            setTimeout(() => {
                document.getElementById('successTitle').textContent = 'Dossiers créés !';
                this.showFinalReport(results);
            }, 1000);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur création dossiers:', error);
            this.addExecutionLog(`❌ Erreur critique: ${error.message}`, 'error');
            this.showError('Erreur lors de la création des dossiers: ' + error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    // Exécution complète
    async executeOrganization() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.clearErrors();
            
            const selectedEmails = Array.from(this.organizationPlan.values())
                .reduce((sum, plan) => {
                    if (plan.selected) {
                        return sum + plan.emails.filter(e => e.selected !== false).length;
                    }
                    return sum;
                }, 0);
            
            if (selectedEmails === 0) {
                this.showWarning('Aucun email sélectionné à organiser');
                return;
            }
            
            this.goToStep('execution');
            document.getElementById('executionTitle').textContent = 'Organisation complète';
            
            const results = {
                foldersCreated: 0,
                emailsMoved: 0,
                domainsProcessed: 0,
                errorsCount: 0,
                errors: [],
                createdFolders: [],
                processedDomains: []
            };
            
            this.addExecutionLog('🚀 Début de l\'organisation complète', 'info');
            
            const folderActions = new Map();
            
            // Préparation des actions
            this.organizationPlan.forEach((plan, domain) => {
                if (!plan.selected) return;
                
                plan.emails.forEach(email => {
                    if (email.selected === false) return;
                    
                    let targetFolder, targetFolderId, action;
                    
                    if (email.customFolder) {
                        targetFolder = email.customFolder;
                        targetFolderId = email.customFolderId;
                        action = targetFolderId ? 'use-existing' : 'create-new';
                    } else {
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
            
            // Traitement de chaque dossier
            for (const [folderName, folderData] of folderActions) {
                try {
                    this.updateExecutionProgress(
                        (processed / totalFolders) * 100,
                        `Traitement du dossier "${folderName}"...`
                    );
                    
                    let targetFolderId = folderData.targetFolderId;
                    
                    // Création du dossier si nécessaire
                    if (folderData.action === 'create-new') {
                        this.addExecutionLog(`📁 Création du dossier "${folderName}"`, 'info');
                        const newFolder = await this.createFolder(folderName);
                        targetFolderId = newFolder.id;
                        results.foldersCreated++;
                        results.createdFolders.push(folderName);
                        this.updateExecutionStat('foldersCreated', results.foldersCreated);
                        
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } else {
                        this.addExecutionLog(`📁 Utilisation du dossier "${folderName}"`, 'info');
                    }
                    
                    // Déplacement des emails par lots
                    const batchSize = 10;
                    let moved = 0;
                    
                    for (let i = 0; i < folderData.emails.length; i += batchSize) {
                        const batch = folderData.emails.slice(i, i + batchSize);
                        
                        this.addExecutionLog(`📧 Déplacement de ${batch.length} emails vers "${folderName}"`, 'info');
                        await this.moveEmailBatch(batch, targetFolderId);
                        moved += batch.length;
                        results.emailsMoved += batch.length;
                        
                        this.updateExecutionStat('emailsMoved', results.emailsMoved);
                        
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }
                    
                    this.addExecutionLog(`✅ ${moved} emails déplacés vers "${folderName}"`, 'success');
                    
                } catch (error) {
                    console.error(`[ModernDomainOrganizer] Erreur ${folderName}:`, error);
                    this.addExecutionLog(`❌ Erreur pour "${folderName}": ${error.message}`, 'error');
                    results.errors.push({ folder: folderName, error: error.message });
                    results.errorsCount++;
                    this.updateExecutionStat('errorsCount', results.errorsCount);
                }
                
                processed++;
            }
            
            // Comptage des domaines traités
            this.organizationPlan.forEach((plan, domain) => {
                if (plan.selected && plan.emails.some(e => e.selected !== false)) {
                    results.domainsProcessed++;
                    const emailsProcessed = plan.emails.filter(e => e.selected !== false).length;
                    results.processedDomains.push(`${domain} (${emailsProcessed} emails)`);
                }
            });
            
            this.updateExecutionStat('domainsProcessed', results.domainsProcessed);
            
            this.updateExecutionProgress(100, 'Organisation terminée !');
            this.addExecutionLog('🎉 Organisation terminée avec succès !', 'success');
            
            setTimeout(() => {
                document.getElementById('successTitle').textContent = 'Organisation terminée !';
                this.showFinalReport(results);
            }, 1000);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur organisation:', error);
            this.addExecutionLog(`❌ Erreur critique: ${error.message}`, 'error');
            this.showError('Erreur lors de l\'organisation: ' + error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    async createFolder(folderName) {
        try {
            if (!window.authService?.isAuthenticated()) {
                throw new Error('Non authentifié');
            }
            
            // Vérification avant création
            console.log(`[ModernDomainOrganizer] 🔍 Vérification existence du dossier: "${folderName}"`);
            
            // Recharger la liste des dossiers pour s'assurer qu'elle est à jour
            await this.loadAllFolders();
            
            // Vérifier si le dossier existe déjà
            const existingFolder = this.findExistingFolderByName(folderName);
            if (existingFolder) {
                console.log(`[ModernDomainOrganizer] ✅ Dossier existe déjà: "${existingFolder.displayName}" (ID: ${existingFolder.id})`);
                return existingFolder;
            }
            
            console.log(`[ModernDomainOrganizer] 📁 Création du nouveau dossier: "${folderName}"`);
            
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
                const errorData = await response.json().catch(() => ({}));
                
                // Gestion spécifique de l'erreur "dossier existe déjà"
                if (response.status === 409 && errorData.error?.code === 'ErrorFolderExists') {
                    console.log(`[ModernDomainOrganizer] ⚠️ Le dossier "${folderName}" existe déjà selon l'API`);
                    
                    // Recharger et chercher le dossier existant
                    await this.loadAllFolders();
                    const foundFolder = this.findExistingFolderByName(folderName);
                    
                    if (foundFolder) {
                        console.log(`[ModernDomainOrganizer] ✅ Dossier existant trouvé après rechargement: "${foundFolder.displayName}"`);
                        return foundFolder;
                    } else {
                        // Créer un nom alternatif si on ne trouve toujours pas le dossier
                        const alternativeName = `${folderName}_${Date.now()}`;
                        console.log(`[ModernDomainOrganizer] 🔄 Tentative avec nom alternatif: "${alternativeName}"`);
                        
                        const retryResponse = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ displayName: alternativeName })
                        });
                        
                        if (retryResponse.ok) {
                            const result = await retryResponse.json();
                            console.log(`[ModernDomainOrganizer] ✅ Dossier créé avec nom alternatif: "${result.displayName}"`);
                            return result;
                        }
                    }
                }
                
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log(`[ModernDomainOrganizer] ✅ Nouveau dossier créé: "${result.displayName}" (ID: ${result.id})`);
            
            // Ajouter le nouveau dossier à notre cache
            this.allFolders.set(result.displayName.toLowerCase().trim(), {
                id: result.id,
                displayName: result.displayName,
                totalItemCount: 0,
                parentFolderId: result.parentFolderId
            });
            
            return result;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur création dossier:', error);
            throw new Error(`Impossible de créer le dossier "${folderName}": ${error.message}`);
        }
    }

    async moveEmailBatch(emails, targetFolderId) {
        try {
            if (!window.authService?.isAuthenticated()) {
                throw new Error('Non authentifié');
            }
            
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
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            
            // Vérifier les erreurs dans la réponse batch
            if (result.responses) {
                const errors = result.responses.filter(r => r.status >= 400);
                if (errors.length > 0) {
                    console.warn('[ModernDomainOrganizer] Erreurs batch:', errors);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur déplacement batch:', error);
            throw new Error(`Erreur lors du déplacement: ${error.message}`);
        }
    }

    showFinalReport(results) {
        try {
            this.goToStep('success');
            
            const report = document.getElementById('successReport');
            if (!report) return;
            
            let reportHTML = '<div class="report-section">';
            reportHTML += '<h4>📊 Résumé</h4>';
            reportHTML += '<ul class="report-list">';
            reportHTML += `<li>Emails déplacés: <strong>${results.emailsMoved.toLocaleString()}</strong></li>`;
            reportHTML += `<li>Domaines traités: <strong>${results.domainsProcessed}</strong></li>`;
            reportHTML += `<li>Dossiers créés: <strong>${results.foldersCreated}</strong></li>`;
            if (results.errorsCount > 0) {
                reportHTML += `<li>Erreurs: <strong>${results.errorsCount}</strong></li>`;
            }
            reportHTML += '</ul></div>';
            
            if (results.createdFolders.length > 0) {
                reportHTML += '<div class="report-section">';
                reportHTML += '<h4>✨ Nouveaux dossiers</h4>';
                reportHTML += '<ul class="report-list">';
                results.createdFolders.slice(0, 10).forEach(folder => {
                    reportHTML += `<li>📁 ${folder}</li>`;
                });
                if (results.createdFolders.length > 10) {
                    reportHTML += `<li><em>... et ${results.createdFolders.length - 10} autres</em></li>`;
                }
                reportHTML += '</ul></div>';
            }
            
            if (results.errors.length > 0) {
                reportHTML += '<div class="report-section">';
                reportHTML += '<h4>⚠️ Erreurs</h4>';
                reportHTML += '<ul class="report-list">';
                results.errors.slice(0, 5).forEach(error => {
                    reportHTML += `<li style="color: #dc2626;">${error.folder}: ${error.error}</li>`;
                });
                if (results.errors.length > 5) {
                    reportHTML += `<li><em>... et ${results.errors.length - 5} autres erreurs</em></li>`;
                }
                reportHTML += '</ul></div>';
            }
            
            report.innerHTML = reportHTML;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur rapport final:', error);
        }
    }

    // Utilitaires avec gestion d'erreurs
    updateProgress(percent, message) {
        try {
            const progressFill = document.getElementById('progressBar');
            const progressText = document.getElementById('progressPercent');
            const status = document.getElementById('scanStatus');

            if (progressFill) progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            if (progressText) progressText.textContent = `${Math.round(percent)}%`;
            if (status) status.textContent = message || 'En cours...';
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour progress:', error);
        }
    }

    updateStat(statId, value) {
        try {
            const element = document.getElementById(statId);
            if (element) {
                element.textContent = (value || 0).toLocaleString();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour stat:', error);
        }
    }

    updateExecutionProgress(percent, message) {
        try {
            const progressFill = document.getElementById('executionProgressBar');
            const progressText = document.getElementById('executionPercent');
            const status = document.getElementById('executionStatus');

            if (progressFill) progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            if (progressText) progressText.textContent = `${Math.round(percent)}%`;
            if (status) status.textContent = message || 'En cours...';
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour execution progress:', error);
        }
    }

    updateExecutionStat(statId, value) {
        try {
            const element = document.getElementById(statId);
            if (element) {
                element.textContent = (value || 0).toLocaleString();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour execution stat:', error);
        }
    }

    addExecutionLog(message, type = 'info') {
        try {
            const log = document.getElementById('executionLog');
            if (!log) return;
            
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
            
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
            
            // Limiter le nombre d'entrées pour éviter la surcharge
            const entries = log.querySelectorAll('.log-entry');
            if (entries.length > 100) {
                entries[0].remove();
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur ajout log:', error);
        }
    }

    // Gestion des erreurs et messages
    showError(message) {
        try {
            console.error('[ModernDomainOrganizer] Erreur:', message);
            this.showMessage(message, 'error');
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(message, 'error');
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage erreur:', error);
        }
    }

    showWarning(message) {
        try {
            console.warn('[ModernDomainOrganizer] Avertissement:', message);
            this.showMessage(message, 'warning');
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast(message, 'warning');
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage warning:', error);
        }
    }

    showMessage(message, type) {
        try {
            this.clearErrors();
            
            const currentCard = document.querySelector('.step-content:not(.hidden) .step-card');
            if (!currentCard) return;
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `${type}-message`;
            messageDiv.textContent = message;
            
            currentCard.insertBefore(messageDiv, currentCard.firstChild);
            
            // Auto-suppression après 5 secondes
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage message:', error);
        }
    }

    clearErrors() {
        try {
            document.querySelectorAll('.error-message, .warning-message, .info-message').forEach(el => {
                el.remove();
            });
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur clear errors:', error);
        }
    }

    // Extraction et validation des données
    extractDomain(email) {
        try {
            const address = email?.from?.emailAddress?.address;
            if (!address || typeof address !== 'string') return null;
            
            const parts = address.toLowerCase().split('@');
            return parts.length === 2 ? parts[1] : null;
        } catch (error) {
            return null;
        }
    }

    shouldExcludeDomain(domain, excludedDomains) {
        try {
            if (!domain || !Array.isArray(excludedDomains)) return false;
            
            return excludedDomains.some(excluded => {
                try {
                    return domain.toLowerCase().includes(excluded.toLowerCase());
                } catch {
                    return false;
                }
            });
        } catch (error) {
            return false;
        }
    }

    shouldExcludeEmail(email, excludedEmails) {
        try {
            const address = email?.from?.emailAddress?.address?.toLowerCase();
            if (!address || !Array.isArray(excludedEmails)) return false;
            
            return excludedEmails.some(excluded => {
                try {
                    return address.includes(excluded.toLowerCase());
                } catch {
                    return false;
                }
            });
        } catch (error) {
            return false;
        }
    }

    findExistingFolder(domain) {
        try {
            if (!domain) return null;
            
            const domainLower = domain.toLowerCase().trim();
            console.log(`[ModernDomainOrganizer] 🔍 Recherche dossier pour: "${domainLower}"`);
            
            // 1. Recherche exacte
            const exactMatch = this.allFolders.get(domainLower);
            if (exactMatch) {
                console.log(`[ModernDomainOrganizer] ✅ Correspondance exacte: "${exactMatch.displayName}"`);
                return exactMatch;
            }
            
            // 2. Recherche par partie principale du domaine
            const domainParts = domainLower.split('.');
            if (domainParts.length > 1) {
                const mainDomain = domainParts[0];
                const mainMatch = this.allFolders.get(mainDomain);
                if (mainMatch) {
                    console.log(`[ModernDomainOrganizer] ✅ Correspondance partielle: "${mainMatch.displayName}" pour ${mainDomain}`);
                    return mainMatch;
                }
            }
            
            // 3. Recherche inversée (nom de dossier contient le domaine)
            for (const [folderKey, folder] of this.allFolders) {
                if (folderKey.includes(domainLower)) {
                    console.log(`[ModernDomainOrganizer] ✅ Correspondance contient: "${folder.displayName}"`);
                    return folder;
                }
            }
            
            // 4. Recherche approximative (domaine contient nom de dossier)
            for (const [folderKey, folder] of this.allFolders) {
                if (domainLower.includes(folderKey) && folderKey.length > 3) { // Éviter les matches trop courts
                    console.log(`[ModernDomainOrganizer] ✅ Correspondance approximative: "${folder.displayName}"`);
                    return folder;
                }
            }
            
            console.log(`[ModernDomainOrganizer] ❌ Aucun dossier trouvé pour: "${domainLower}"`);
            return null;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur recherche dossier:', error);
            return null;
        }
    }

    findExistingFolderByName(name) {
        try {
            if (!name) return null;
            
            const nameLower = name.toLowerCase().trim();
            console.log(`[ModernDomainOrganizer] 🔍 Recherche dossier par nom: "${nameLower}"`);
            
            // Recherche exacte par nom
            for (const folder of this.allFolders.values()) {
                if (folder.displayName.toLowerCase().trim() === nameLower) {
                    console.log(`[ModernDomainOrganizer] ✅ Dossier trouvé par nom: "${folder.displayName}"`);
                    return folder;
                }
            }
            
            console.log(`[ModernDomainOrganizer] ❌ Aucun dossier trouvé pour le nom: "${nameLower}"`);
            return null;
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur recherche dossier par nom:', error);
            return null;
        }
    }

    // Modal management
    closeEmailModal() {
        try {
            const modal = document.getElementById('emailModal');
            if (modal) {
                modal.classList.add('hidden');
            }
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur fermeture modal:', error);
        }
    }

    saveEmailChanges() {
        try {
            // Placeholder pour l'édition d'emails (fonctionnalité avancée)
            this.closeEmailModal();
            this.showMessage('Fonctionnalité d\'édition en développement', 'info');
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sauvegarde email:', error);
        }
    }

    restart() {
        try {
            this.currentStep = 'introduction';
            this.scanResults = null;
            this.organizationPlan.clear();
            this.emailsByDomain.clear();
            this.expandedDomains.clear();
            this.totalEmailsScanned = 0;
            this.isProcessing = false;
            
            this.clearErrors();
            this.goToStep('introduction');
            this.setDefaultDates();
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur restart:', error);
        }
    }

    // Interface publique
    showPage() {
        try {
            console.log('[ModernDomainOrganizer] Affichage de la page...');
            
            if (!window.authService?.isAuthenticated()) {
                this.showError('Veuillez vous connecter pour continuer');
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
            
            // Mise à jour de la navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            const rangerButton = document.querySelector('[data-page="ranger"]');
            if (rangerButton) rangerButton.classList.add('active');
            
            console.log('[ModernDomainOrganizer] ✅ Page affichée');
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage page:', error);
            this.showError('Erreur lors de l\'affichage de la page: ' + error.message);
        }
    }
}

// Initialisation avec gestion d'erreurs
try {
    window.modernDomainOrganizer = new ModernDomainOrganizer();
    
    // Gestion autonome des événements
    document.addEventListener('DOMContentLoaded', function() {
        try {
            document.addEventListener('click', function(e) {
                const rangerButton = e.target.closest('[data-page="ranger"]');
                if (!rangerButton) return;
                
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                window.modernDomainOrganizer.showPage();
                return false;
            }, true);
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur setup événements:', error);
        }
    });
    
    // Fonction globale d'accès
    window.showModernDomainOrganizer = function() {
        try {
            window.modernDomainOrganizer.showPage();
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur fonction globale:', error);
        }
    };
    
    console.log('[ModernDomainOrganizer] ✅ Module chargé avec gestion d\'erreurs complète');
    
} catch (error) {
    console.error('[ModernDomainOrganizer] ❌ Erreur fatale lors du chargement:', error);
}
