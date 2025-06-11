// ModernDomainOrganizer.js - Version avec édition individuelle par email
// Interface compacte et optimisée - ÉDITION PAR EMAIL AJOUTÉE

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
        this.currentEditingEmail = null;
        
        console.log('[ModernDomainOrganizer] ✅ Initialisé avec édition par email');
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
                                            <span class="tip-icon">✏️</span>
                                            <span><strong>Édition :</strong> Personnalisez le dossier de chaque email</span>
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

                        <!-- Plan - VERSION AVEC ÉDITION PAR EMAIL -->
                        <div class="step-content hidden" id="step-plan">
                            <div class="step-card plan-card-simple">
                                <!-- Header condensé -->
                                <div class="card-header-simple">
                                    <h2>📋 Plan d'organisation</h2>
                                </div>

                                <!-- Contenu principal -->
                                <div class="plan-content-simple">
                                    <!-- Stats + Options en ligne -->
                                    <div class="plan-top-bar">
                                        <div class="stats-simple" id="planSummary">
                                            <span><strong>16</strong> Domaines</span>
                                            <span><strong>145</strong> Emails</span>
                                            <span><strong>15</strong> Nouveaux</span>
                                        </div>
                                        <div class="options-simple">
                                            <label><input type="radio" name="executionType" value="folders-only"> 📁 Dossiers</label>
                                            <label><input type="radio" name="executionType" value="complete" checked> ⚡ Complet</label>
                                        </div>
                                        <div class="count-simple">
                                            <span id="selectedEmailsText">145 emails sélectionnés</span>
                                        </div>
                                    </div>

                                    <!-- Contrôles -->
                                    <div class="controls-simple">
                                        <button class="btn-xs" onclick="window.modernDomainOrganizer.selectAllDomains()">✅ Tout</button>
                                        <button class="btn-xs" onclick="window.modernDomainOrganizer.deselectAllDomains()">❌ Rien</button>
                                        <button class="btn-xs" onclick="window.modernDomainOrganizer.expandAllDomains()">📂 Déplier</button>
                                        <button class="btn-xs" onclick="window.modernDomainOrganizer.collapseAllDomains()">📁 Replier</button>
                                        <button class="btn-xs" onclick="window.modernDomainOrganizer.resetAllFolders()">🔄 Reset</button>
                                    </div>

                                    <!-- Liste des domaines avec hauteur fixe -->
                                    <div class="domains-wrapper">
                                        <div class="domains-container-simple" id="domainsContainer"></div>
                                    </div>
                                </div>

                                <!-- Boutons d'action FIXES en bas -->
                                <div class="action-bar-simple">
                                    <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                        ← Reconfigurer
                                    </button>
                                    <button class="btn btn-primary btn-execute" id="executeSelectedBtn" onclick="window.modernDomainOrganizer.executeSelectedAction()">
                                        <span id="executeButtonText">⚡ Exécuter</span>
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

                <!-- Modal d'édition d'email -->
                <div class="email-modal hidden" id="emailModal">
                    <div class="email-modal-content">
                        <div class="email-modal-header">
                            <h3>✏️ Édition du dossier de destination</h3>
                            <button class="modal-close" onclick="window.modernDomainOrganizer.closeEmailModal()">×</button>
                        </div>
                        <div class="email-modal-body" id="emailModalBody">
                            <!-- Contenu dynamique -->
                        </div>
                        <div class="email-modal-footer">
                            <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.closeEmailModal()">
                                Annuler
                            </button>
                            <button class="btn btn-primary" id="saveEmailBtn" onclick="window.modernDomainOrganizer.saveEmailChanges()">
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

                /* VERSION SIMPLIFIÉE - BOUTON GARANTI VISIBLE */
                .plan-card-simple {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    height: calc(100vh - 200px);
                    max-height: 600px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* Header condensé */
                .card-header-simple {
                    padding: 10px 16px;
                    flex-shrink: 0;
                    border-bottom: 1px solid #e5e7eb;
                    text-align: center;
                }

                .card-header-simple h2 {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                    color: #1f2937;
                }

                /* Contenu principal */
                .plan-content-simple {
                    flex: 1;
                    padding: 12px 16px 0 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    overflow: hidden;
                }

                /* Top bar avec stats + options */
                .plan-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 8px 12px;
                    flex-shrink: 0;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .stats-simple {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    font-size: 12px;
                    color: #374151;
                }

                .stats-simple strong {
                    font-size: 14px;
                    color: #1f2937;
                }

                .options-simple {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .options-simple label {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    color: #374151;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background: white;
                    border: 1px solid #d1d5db;
                    transition: all 0.2s;
                }

                .options-simple label:hover {
                    border-color: #3b82f6;
                    background: #f0f9ff;
                }

                .options-simple input[type="radio"] {
                    width: 12px;
                    height: 12px;
                }

                .count-simple {
                    font-size: 11px;
                    color: #0369a1;
                    font-weight: 500;
                    white-space: nowrap;
                }

                /* Contrôles */
                .controls-simple {
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    flex-shrink: 0;
                }

                .btn-xs {
                    padding: 4px 8px;
                    font-size: 10px;
                    border: 1px solid #d1d5db;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #374151;
                    transition: all 0.2s;
                }

                .btn-xs:hover {
                    background: #f9fafb;
                    border-color: #3b82f6;
                }

                /* Wrapper pour les domaines */
                .domains-wrapper {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                }

                .domains-container-simple {
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    background: white;
                    flex: 1;
                    overflow-y: auto;
                    min-height: 250px;
                    max-height: 400px;
                }

                /* Action bar FIXE en bas */
                .action-bar-simple {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-top: 2px solid #e5e7eb;
                    flex-shrink: 0;
                    background: #fafbfc;
                    border-radius: 0 0 12px 12px;
                    position: relative;
                    z-index: 10;
                }

                .btn-execute {
                    background: #3b82f6 !important;
                    color: white !important;
                    padding: 10px 20px !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    border-radius: 6px !important;
                    border: none !important;
                    cursor: pointer !important;
                    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
                    transition: all 0.2s !important;
                }

                .btn-execute:hover {
                    background: #2563eb !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
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

                .example-side {
                    flex: 1;
                    max-width: 200px;
                }

                .example-side h4 {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    color: #1f2937;
                }

                .preview-box {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 12px;
                }

                .preview-line {
                    font-size: 12px;
                    padding: 4px 0;
                    color: #374151;
                }

                .example-arrow {
                    font-size: 20px;
                    color: #3b82f6;
                    font-weight: bold;
                }

                .tips-compact {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .tip-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #374151;
                }

                .tip-icon {
                    font-size: 16px;
                    flex-shrink: 0;
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
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    text-align: center;
                    flex-shrink: 0;
                }

                .plan-controls {
                    flex-shrink: 0;
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

                /* NOUVEAU : Éléments pour l'édition par email */
                .email-folder-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    color: #6b7280;
                }

                .email-custom-folder {
                    background: #fef3c7;
                    color: #92400e;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-weight: 500;
                }

                .email-default-folder {
                    background: #e5e7eb;
                    color: #6b7280;
                    padding: 2px 6px;
                    border-radius: 3px;
                }

                .email-edit-btn {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .email-edit-btn:hover {
                    background: #2563eb;
                    transform: scale(1.05);
                }

                .execution-options {
                    background: #f0f9ff;
                    border: 1px solid #bae6fd;
                    border-radius: 8px;
                    padding: 16px;
                    flex-shrink: 0;
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

                /* Modal d'édition amélioré */
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
                    padding: 20px;
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

                /* Contenu du modal */
                .modal-email-info {
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 16px;
                }

                .modal-email-subject {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 6px;
                }

                .modal-email-from {
                    font-size: 14px;
                    color: #6b7280;
                    margin-bottom: 4px;
                }

                .modal-email-date {
                    font-size: 12px;
                    color: #9ca3af;
                }

                .modal-folder-section {
                    margin-bottom: 20px;
                }

                .modal-folder-section h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin: 0 0 10px 0;
                }

                .folder-option {
                    margin-bottom: 12px;
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .folder-option:hover {
                    border-color: #3b82f6;
                    background: #f0f9ff;
                }

                .folder-option.selected {
                    border-color: #3b82f6;
                    background: #eff6ff;
                }

                .folder-option-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                }

                .folder-option-radio {
                    width: 16px;
                    height: 16px;
                }

                .folder-option-name {
                    font-weight: 500;
                    color: #1f2937;
                }

                .folder-option-desc {
                    font-size: 12px;
                    color: #6b7280;
                    margin-left: 24px;
                }

                .custom-folder-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 14px;
                    margin-top: 8px;
                }

                .custom-folder-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                .folder-suggestions {
                    margin-top: 8px;
                    max-height: 120px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    background: white;
                }

                .folder-suggestion {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 12px;
                    color: #374151;
                }

                .folder-suggestion:hover {
                    background: #f9fafb;
                }

                .folder-suggestion:last-child {
                    border-bottom: none;
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
                        padding: 6px;
                    }

                    .organizer-header {
                        padding: 8px;
                        margin-bottom: 8px;
                    }

                    .step-card {
                        padding: 12px;
                        min-height: 400px;
                    }

                    /* Plan mobile simplifié */
                    .plan-card-simple {
                        height: calc(100vh - 160px);
                        max-height: none;
                    }

                    .card-header-simple {
                        padding: 8px 12px;
                    }

                    .card-header-simple h2 {
                        font-size: 16px;
                    }

                    .plan-content-simple {
                        padding: 8px 12px 0 12px;
                        gap: 8px;
                    }

                    .action-bar-simple {
                        padding: 10px 12px;
                    }

                    .plan-top-bar {
                        flex-direction: column;
                        gap: 8px;
                        padding: 6px;
                    }

                    .stats-simple {
                        gap: 10px;
                        justify-content: space-around;
                        width: 100%;
                        font-size: 11px;
                    }

                    .stats-simple strong {
                        font-size: 13px;
                    }

                    .options-simple {
                        gap: 8px;
                        justify-content: center;
                    }

                    .options-simple label {
                        font-size: 10px;
                        padding: 3px 6px;
                    }

                    .count-simple {
                        font-size: 10px;
                        text-align: center;
                    }

                    .controls-simple {
                        gap: 4px;
                    }

                    .btn-xs {
                        padding: 3px 6px;
                        font-size: 9px;
                    }

                    .domains-container-simple {
                        min-height: 200px;
                        max-height: 300px;
                    }

                    .btn-execute {
                        padding: 8px 16px !important;
                        font-size: 12px !important;
                    }

                    .domain-header {
                        padding: 8px 12px;
                        gap: 8px;
                    }

                    .domain-name {
                        font-size: 12px;
                    }

                    .domain-stats {
                        font-size: 10px;
                    }

                    .folder-input {
                        font-size: 10px;
                        padding: 4px 6px;
                        min-width: 80px;
                    }

                    .action-badge {
                        font-size: 8px;
                        padding: 1px 4px;
                    }

                    .emails-list {
                        max-height: 100px;
                    }

                    .email-item {
                        padding: 4px 8px;
                        font-size: 10px;
                    }

                    .domain-content {
                        padding: 0 12px 8px 28px;
                    }

                    .btn {
                        padding: 6px 12px;
                        font-size: 12px;
                    }

                    .btn-large {
                        padding: 8px 16px;
                        font-size: 13px;
                    }

                    .email-edit-btn {
                        padding: 2px 4px;
                        font-size: 8px;
                    }

                    .email-folder-info {
                        font-size: 8px;
                    }

                    .email-custom-folder, .email-default-folder {
                        padding: 1px 3px;
                        font-size: 8px;
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
                    
                    // Initialiser les propriétés personnalisées pour chaque email
                    email.selected = true; // Par défaut sélectionné
                    email.customFolder = null; // Dossier personnalisé
                    email.customFolderId = null; // ID du dossier personnalisé
                    
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
            
            console.log('[ModernDomainOrganizer] ✅ Plan d\'organisation affiché avec édition par email');
            
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
                <span><strong>${this.organizationPlan.size}</strong> Domaines</span>
                <span><strong>${totalEmails.toLocaleString()}</strong> Emails</span>
                <span><strong>${newFolders.length}</strong> Nouveaux</span>
                <span><strong>${existingFolders.length}</strong> Existants</span>
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

            // Fonction pour obtenir le dossier de destination d'un email
            const getEmailDestination = (email) => {
                if (email.customFolder) {
                    return {
                        folder: email.customFolder,
                        isCustom: true
                    };
                }
                return {
                    folder: plan.targetFolder,
                    isCustom: false
                };
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
                        ${plan.emails.map((email) => {
                            const destination = getEmailDestination(email);
                            return `
                                <div class="email-item" data-email-id="${email.id}">
                                    <input type="checkbox" class="email-checkbox" ${email.selected !== false ? 'checked' : ''} 
                                           onchange="window.modernDomainOrganizer.toggleEmailSelection('${domain}', '${email.id}')"
                                           data-domain="${domain}" data-email-id="${email.id}">
                                    
                                    <div class="email-info">
                                        <div class="email-subject" title="${safeSubject(email)}">
                                            ${safeSubject(email)}
                                        </div>
                                        <div class="email-from">De: ${safeFrom(email)}</div>
                                        <div class="email-folder-info">
                                            📁 <span class="${destination.isCustom ? 'email-custom-folder' : 'email-default-folder'}">
                                                ${destination.folder}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div class="email-date">${safeDate(email)}</div>
                                    
                                    <button class="email-edit-btn" onclick="window.modernDomainOrganizer.editEmailDestination('${domain}', '${email.id}')">
                                        ✏️
                                    </button>
                                </div>
                            `;
                        }).join('')}
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

    // NOUVELLE FONCTIONNALITÉ : Édition du dossier de destination par email
    editEmailDestination(domain, emailId) {
        try {
            const plan = this.organizationPlan.get(domain);
            if (!plan) {
                this.showError('Domaine non trouvé');
                return;
            }

            const email = plan.emails.find(e => e.id === emailId);
            if (!email) {
                this.showError('Email non trouvé');
                return;
            }

            this.currentEditingEmail = { domain, emailId, email };
            this.showEmailEditModal(email, plan);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur édition email:', error);
            this.showError('Erreur lors de l\'ouverture de l\'édition: ' + error.message);
        }
    }

    showEmailEditModal(email, plan) {
        try {
            const modal = document.getElementById('emailModal');
            const modalBody = document.getElementById('emailModalBody');
            
            if (!modal || !modalBody) {
                this.showError('Interface modal non disponible');
                return;
            }

            // Obtenir la liste des dossiers existants pour les suggestions
            const folderSuggestions = Array.from(this.allFolders.values())
                .slice(0, 10) // Limiter à 10 suggestions
                .map(folder => folder.displayName);

            const currentDestination = email.customFolder || plan.targetFolder;

            modalBody.innerHTML = `
                <div class="modal-email-info">
                    <div class="modal-email-subject">${email.subject || '(Sans sujet)'}</div>
                    <div class="modal-email-from">De: ${email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Inconnu'}</div>
                    <div class="modal-email-date">${new Date(email.receivedDateTime).toLocaleDateString()}</div>
                </div>

                <div class="modal-folder-section">
                    <h4>Choisir le dossier de destination :</h4>
                    
                    <div class="folder-option ${!email.customFolder ? 'selected' : ''}" onclick="window.modernDomainOrganizer.selectFolderOption('default')">
                        <div class="folder-option-header">
                            <input type="radio" name="folderChoice" value="default" class="folder-option-radio" ${!email.customFolder ? 'checked' : ''}>
                            <span class="folder-option-name">📁 ${plan.targetFolder}</span>
                        </div>
                        <div class="folder-option-desc">Dossier par défaut du domaine (${plan.action === 'create-new' ? 'sera créé' : 'existant'})</div>
                    </div>

                    <div class="folder-option ${email.customFolder ? 'selected' : ''}" onclick="window.modernDomainOrganizer.selectFolderOption('custom')">
                        <div class="folder-option-header">
                            <input type="radio" name="folderChoice" value="custom" class="folder-option-radio" ${email.customFolder ? 'checked' : ''}>
                            <span class="folder-option-name">✏️ Dossier personnalisé</span>
                        </div>
                        <div class="folder-option-desc">Spécifiez un dossier différent pour cet email</div>
                        
                        <input type="text" class="custom-folder-input" id="customFolderInput" 
                               value="${email.customFolder || ''}" 
                               placeholder="Nom du dossier personnalisé"
                               onkeyup="window.modernDomainOrganizer.updateCustomFolderPreview()"
                               ${email.customFolder ? '' : 'style="display: none;"'}>
                        
                        <div class="folder-suggestions" id="folderSuggestions" style="display: none;">
                            ${folderSuggestions.map(folder => `
                                <div class="folder-suggestion" onclick="window.modernDomainOrganizer.selectSuggestedFolder('${folder}')">
                                    📁 ${folder}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="modal-folder-section">
                    <h4>Aperçu :</h4>
                    <div id="folderPreview" style="padding: 8px; background: #f8fafc; border-radius: 4px; font-size: 12px; color: #374151;">
                        📧 Cet email sera déplacé vers: <strong>${currentDestination}</strong>
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
            
            // Focus sur l'input si mode personnalisé
            if (email.customFolder) {
                setTimeout(() => {
                    const input = document.getElementById('customFolderInput');
                    if (input) input.focus();
                }, 100);
            }

        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur affichage modal:', error);
            this.showError('Erreur lors de l\'affichage du modal: ' + error.message);
        }
    }

    selectFolderOption(optionType) {
        try {
            // Mettre à jour les styles visuels
            document.querySelectorAll('.folder-option').forEach(option => {
                option.classList.remove('selected');
            });

            const selectedOption = document.querySelector(`input[value="${optionType}"]`).closest('.folder-option');
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }

            // Gérer l'affichage de l'input personnalisé
            const customInput = document.getElementById('customFolderInput');
            const suggestions = document.getElementById('folderSuggestions');
            
            if (optionType === 'custom') {
                if (customInput) {
                    customInput.style.display = 'block';
                    customInput.focus();
                }
                if (suggestions) {
                    suggestions.style.display = 'block';
                }
            } else {
                if (customInput) {
                    customInput.style.display = 'none';
                }
                if (suggestions) {
                    suggestions.style.display = 'none';
                }
            }

            this.updateCustomFolderPreview();

        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sélection option:', error);
        }
    }

    selectSuggestedFolder(folderName) {
        try {
            const customInput = document.getElementById('customFolderInput');
            if (customInput) {
                customInput.value = folderName;
                this.updateCustomFolderPreview();
            }

            // Fermer les suggestions
            const suggestions = document.getElementById('folderSuggestions');
            if (suggestions) {
                suggestions.style.display = 'none';
            }

        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sélection suggestion:', error);
        }
    }

    updateCustomFolderPreview() {
        try {
            const preview = document.getElementById('folderPreview');
            const selectedOption = document.querySelector('input[name="folderChoice"]:checked')?.value;
            const customInput = document.getElementById('customFolderInput');
            
            if (!preview || !this.currentEditingEmail) return;

            const plan = this.organizationPlan.get(this.currentEditingEmail.domain);
            if (!plan) return;

            let targetFolder;
            let folderStatus = '';

            if (selectedOption === 'custom' && customInput?.value.trim()) {
                targetFolder = customInput.value.trim();
                const existingFolder = this.findExistingFolderByName(targetFolder);
                folderStatus = existingFolder ? ' (existant)' : ' (sera créé)';
            } else {
                targetFolder = plan.targetFolder;
                folderStatus = plan.action === 'create-new' ? ' (sera créé)' : ' (existant)';
            }

            preview.innerHTML = `📧 Cet email sera déplacé vers: <strong>${targetFolder}</strong><span style="color: #6b7280;">${folderStatus}</span>`;

        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur mise à jour aperçu:', error);
        }
    }

    saveEmailChanges() {
        try {
            if (!this.currentEditingEmail) {
                this.showError('Aucun email en cours d\'édition');
                return;
            }

            const selectedOption = document.querySelector('input[name="folderChoice"]:checked')?.value;
            const customInput = document.getElementById('customFolderInput');
            
            const plan = this.organizationPlan.get(this.currentEditingEmail.domain);
            const email = this.currentEditingEmail.email;
            
            if (!plan || !email) {
                this.showError('Données d\'email invalides');
                return;
            }

            // Sauvegarder les modifications
            if (selectedOption === 'custom' && customInput?.value.trim()) {
                const customFolder = customInput.value.trim();
                email.customFolder = customFolder;
                
                // Vérifier si le dossier existe
                const existingFolder = this.findExistingFolderByName(customFolder);
                email.customFolderId = existingFolder ? existingFolder.id : null;
                
                console.log(`[ModernDomainOrganizer] ✏️ Email ${email.id} configuré pour le dossier: "${customFolder}"`);
            } else {
                // Revenir au dossier par défaut
                email.customFolder = null;
                email.customFolderId = null;
                
                console.log(`[ModernDomainOrganizer] ✏️ Email ${email.id} reconfiguré pour le dossier par défaut: "${plan.targetFolder}"`);
            }

            // Fermer le modal
            this.closeEmailModal();
            
            // Rafraîchir l'affichage
            this.showOrganizationPlan();
            
            this.showMessage('Destination de l\'email mise à jour', 'info');

        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur sauvegarde email:', error);
            this.showError('Erreur lors de la sauvegarde: ' + error.message);
        }
    }

    // Contrôles globaux étendus
    resetAllFolders() {
        try {
            // Confirmation avant reset
            if (!confirm('Êtes-vous sûr de vouloir réinitialiser tous les dossiers personnalisés ?')) {
                return;
            }

            this.organizationPlan.forEach((plan) => {
                plan.emails.forEach(email => {
                    email.customFolder = null;
                    email.customFolderId = null;
                });
            });

            this.showOrganizationPlan();
            this.showMessage('Toutes les personnalisations ont été réinitialisées', 'info');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur reset dossiers:', error);
            this.showError('Erreur lors de la réinitialisation: ' + error.message);
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
                    const emailCheckbox = domainElement.querySelector(`input[data-email-id="${email.id}"]`);
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

    collapseAllDomains() {
        try {
            this.expandedDomains.clear();
            this.showOrganizationPlan();
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur replier tout:', error);
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

    deselectAllDomains() {
        try {
            this.organizationPlan.forEach((plan, domain) => {
                plan.selected = false;
                plan.emails.forEach(email => {
                    email.selected = false;
                });
                this.updateDomainDisplay(domain);
            });
            this.updateTotalEmailsCount();
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur désélectionner tout:', error);
        }
    }Veuillez vous connecter pour continuer');
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
                    buttonText.textContent = '📁 Créer dossiers';
                } else {
                    buttonText.textContent = '⚡ Exécution complète';
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
            this.showError('
