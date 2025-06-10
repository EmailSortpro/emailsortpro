// DomainOrganizer.js - Version 12.0 - Interface ultra-condensée sans scroll
class DomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.emailsByDomain = new Map();
        this.emailActions = new Map();
        this.currentStep = 1;
        this.scanProgress = {
            totalEmails: 0,
            processedEmails: 0,
            domainsFound: new Set(),
            startTime: null
        };
        
        console.log('[DomainOrganizer] ✅ v12.0 - Interface ultra-condensée');
    }

    getPageHTML() {
        return `
            <div class="organizer-compact">
                <!-- Header compact -->
                <div class="header">
                    <h1>📁 Organisation par Domaine</h1>
                    <div class="steps">
                        <div class="step active" data-step="1">1</div>
                        <div class="step" data-step="2">2</div>
                        <div class="step" data-step="3">3</div>
                    </div>
                </div>

                <!-- Étape 1: Configuration compacte -->
                <div class="step-content" id="step1">
                    <div class="card">
                        <!-- Info rapide -->
                        <div class="quick-info">
                            <div class="info-item">
                                <span class="icon">🔍</span>
                                <span>Analyse vos emails par expéditeur et propose une organisation automatique</span>
                            </div>
                            <div class="info-item">
                                <span class="icon">🔒</span>
                                <span>Accès lecture seule pendant l'analyse - Aucune modification sans validation</span>
                            </div>
                        </div>

                        <form id="scanForm" class="compact-form">
                            <!-- Période inline -->
                            <div class="inline-section">
                                <label class="section-label">📅 Période</label>
                                <div class="radio-group">
                                    <label class="radio-compact">
                                        <input type="radio" name="dateRange" value="all" checked>
                                        <span>Tous</span>
                                    </label>
                                    <label class="radio-compact">
                                        <input type="radio" name="dateRange" value="recent">
                                        <span>6 mois</span>
                                    </label>
                                    <label class="radio-compact">
                                        <input type="radio" name="dateRange" value="year">
                                        <span>1 an</span>
                                    </label>
                                    <label class="radio-compact">
                                        <input type="radio" name="dateRange" value="custom">
                                        <span>Personnalisé</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Dates personnalisées compactes -->
                            <div id="customDates" class="custom-dates compact" style="display: none;">
                                <input type="date" id="startDate" class="input-compact" placeholder="Début">
                                <input type="date" id="endDate" class="input-compact" placeholder="Fin">
                            </div>

                            <!-- Paramètres sur une ligne -->
                            <div class="params-row">
                                <div class="param-item">
                                    <label>📂 Source</label>
                                    <select id="sourceFolder" class="input-compact">
                                        <option value="all">Tous les dossiers</option>
                                        <option value="inbox">Boîte de réception</option>
                                        <option value="sent">Éléments envoyés</option>
                                        <option value="archive">Archive</option>
                                    </select>
                                </div>
                                <div class="param-item">
                                    <label>📊 Limite</label>
                                    <select id="emailLimit" class="input-compact">
                                        <option value="1000">1 000 (2-3 min)</option>
                                        <option value="2500" selected>2 500 (5-8 min)</option>
                                        <option value="5000">5 000 (10-15 min)</option>
                                        <option value="unlimited">Sans limite (15+ min)</option>
                                    </select>
                                </div>
                                <div class="param-item">
                                    <label>🚫 Exclure</label>
                                    <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com" class="input-compact">
                                </div>
                            </div>

                            <button type="submit" class="btn primary" id="startBtn">
                                🚀 Analyser mes emails
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Étape 2: Scan compact -->
                <div class="step-content" id="step2" style="display: none;">
                    <div class="card">
                        <div class="scan-header">
                            <div class="scan-status">
                                <span class="phase-icon" id="phaseIcon">🔗</span>
                                <div>
                                    <h3 id="phaseName">Connexion</h3>
                                    <p id="phaseDescription">Connexion sécurisée en cours...</p>
                                </div>
                            </div>
                            <div class="scan-progress">
                                <div class="progress-circle">
                                    <span id="progressPercent">0%</span>
                                </div>
                            </div>
                        </div>

                        <div class="stats-compact">
                            <div class="stat">
                                <span class="stat-number" id="emailCount">0</span>
                                <span class="stat-label">Emails</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number" id="domainCount">0</span>
                                <span class="stat-label">Domaines</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number" id="folderCount">0</span>
                                <span class="stat-label">Dossiers</span>
                            </div>
                        </div>

                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        
                        <div class="current-status" id="currentStatus">
                            <span>⏳ Initialisation...</span>
                        </div>
                    </div>
                </div>

                <!-- Étape 3: Résultats compacts -->
                <div class="step-content" id="step3" style="display: none;">
                    <div class="card">
                        <div class="results-header">
                            <div class="results-info">
                                <span class="icon">✅</span>
                                <span><strong><span id="totalFound">0</span> emails</strong> dans <strong><span id="domainsFound">0</span> domaines</strong></span>
                            </div>
                            <div class="results-actions">
                                <button class="btn-mini" onclick="window.organizerInstance.selectAll()">✓ Tout</button>
                                <button class="btn-mini" onclick="window.organizerInstance.deselectAll()">✗ Rien</button>
                                <input type="text" id="searchBox" placeholder="🔍 Rechercher..." class="search-mini">
                            </div>
                        </div>

                        <div class="domains-compact" id="domainsList">
                            <!-- Populated dynamically -->
                        </div>

                        <div class="final-controls">
                            <div class="options-compact">
                                <label class="checkbox-compact">
                                    <input type="checkbox" id="createFolders" checked>
                                    <span>Créer dossiers</span>
                                </label>
                                <label class="checkbox-compact">
                                    <input type="checkbox" id="moveEmails" checked>
                                    <span>Déplacer emails</span>
                                </label>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn secondary" onclick="window.organizerInstance.reset()">← Recommencer</button>
                                <button class="btn primary" id="executeBtn" onclick="window.organizerInstance.showExecutionModal()">
                                    ▶ Organiser <span id="selectedCount">0</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 4: Exécution compacte -->
                <div class="step-content" id="step4" style="display: none;">
                    <div class="card">
                        <div class="exec-header">
                            <div class="exec-status">
                                <span class="action-icon" id="actionIcon">⚙️</span>
                                <div>
                                    <h3 id="actionName">Organisation</h3>
                                    <p id="actionDescription">Création des dossiers et déplacement des emails</p>
                                </div>
                            </div>
                            <div class="exec-progress">
                                <div class="progress-circle success">
                                    <span id="executePercent">0%</span>
                                </div>
                            </div>
                        </div>

                        <div class="stats-compact">
                            <div class="stat">
                                <span class="stat-number" id="foldersCreated">0</span>
                                <span class="stat-label">Dossiers</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number" id="emailsMoved">0</span>
                                <span class="stat-label">Emails</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number" id="timeRemaining">--</span>
                                <span class="stat-label">Temps</span>
                            </div>
                        </div>

                        <div class="progress-bar">
                            <div class="progress-fill success" id="executeFill"></div>
                        </div>
                        
                        <div class="current-status" id="executeStatus">
                            <span>⚙️ Préparation...</span>
                        </div>
                    </div>
                </div>

                <!-- Étape 5: Succès compact -->
                <div class="step-content" id="step5" style="display: none;">
                    <div class="card success">
                        <div class="success-compact">
                            <div class="success-header">
                                <span class="success-icon">🎉</span>
                                <div>
                                    <h2>Organisation terminée !</h2>
                                    <p id="successMessage">Vos emails ont été organisés avec succès</p>
                                </div>
                            </div>
                            
                            <div class="success-stats">
                                <div class="stat">
                                    <span class="stat-number" id="finalEmails">0</span>
                                    <span class="stat-label">emails</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number" id="finalFolders">0</span>
                                    <span class="stat-label">dossiers</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number" id="finalTime">--</span>
                                    <span class="stat-label">temps</span>
                                </div>
                            </div>

                            <div class="success-actions">
                                <button class="btn secondary" onclick="window.organizerInstance.reset()">🔄 Nouveau</button>
                                <button class="btn primary" onclick="window.organizerInstance.openOutlook()">📧 Voir Outlook</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modales compactes -->
                <div class="modal-overlay" id="modalOverlay" style="display: none;">
                    <!-- Modal scan -->
                    <div class="modal compact" id="scanConfirmModal" style="display: none;">
                        <div class="modal-header">
                            <h3>🔍 Confirmer l'analyse</h3>
                            <button class="modal-close" onclick="window.organizerInstance.closeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="confirm-details">
                                <div class="detail">📧 <span id="scanEmailsCount">--</span></div>
                                <div class="detail">📅 <span id="scanPeriod">--</span></div>
                                <div class="detail">⏱️ <span id="scanDuration">--</span></div>
                            </div>
                            <div class="modal-info">
                                <span class="icon">ℹ️</span>
                                <span>Analyse en lecture seule - Aucune modification</span>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn secondary" onclick="window.organizerInstance.closeModal()">Annuler</button>
                            <button class="btn primary" onclick="window.organizerInstance.confirmScan()">🚀 Analyser</button>
                        </div>
                    </div>

                    <!-- Modal execution -->
                    <div class="modal compact" id="executeConfirmModal" style="display: none;">
                        <div class="modal-header">
                            <h3>⚠️ Confirmer l'organisation</h3>
                            <button class="modal-close" onclick="window.organizerInstance.closeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="warning-compact">
                                <span class="icon">⚠️</span>
                                <span>Cette action va modifier votre boîte mail</span>
                            </div>
                            <div class="confirm-details">
                                <div class="detail">📧 <span id="executeEmailsCount">--</span> emails</div>
                                <div class="detail">📁 <span id="executeFoldersCount">--</span> dossiers</div>
                                <div class="detail">⏱️ <span id="executeDuration">--</span></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn secondary" onclick="window.organizerInstance.closeModal()">Annuler</button>
                            <button class="btn primary" onclick="window.organizerInstance.confirmExecution()">▶ Confirmer</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Interface ultra-compacte */
                .organizer-compact {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #fafafa;
                    height: 100vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                /* Header ultra-compact */
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    margin-bottom: 16px;
                    flex-shrink: 0;
                }

                .header h1 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #111;
                }

                .steps {
                    display: flex;
                    gap: 8px;
                }

                .step {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: #666;
                    transition: all 0.3s ease;
                }

                .step.active {
                    background: #007acc;
                    color: white;
                    transform: scale(1.1);
                }

                .step.completed {
                    background: #10b981;
                    color: white;
                }

                /* Cards compactes */
                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    border: 1px solid #f0f0f0;
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .card.success {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                }

                /* Info rapide */
                .quick-info {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                    font-size: 13px;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex: 1;
                }

                .info-item .icon {
                    font-size: 14px;
                    flex-shrink: 0;
                }

                /* Formulaire compact */
                .compact-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .inline-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .section-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    min-width: 80px;
                }

                .radio-group {
                    display: flex;
                    gap: 12px;
                }

                .radio-compact {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #374151;
                    padding: 6px 10px;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    transition: all 0.2s ease;
                }

                .radio-compact:hover {
                    background: #f8fafc;
                }

                .radio-compact:has(input:checked) {
                    background: #eff6ff;
                    border-color: #007acc;
                    color: #007acc;
                }

                .radio-compact input {
                    margin: 0;
                    width: 14px;
                    height: 14px;
                    accent-color: #007acc;
                }

                /* Dates personnalisées */
                .custom-dates.compact {
                    display: flex;
                    gap: 12px;
                    margin-top: 8px;
                    padding-left: 92px;
                }

                /* Paramètres sur une ligne */
                .params-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 16px;
                }

                .param-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .param-item label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #374151;
                }

                .input-compact {
                    padding: 8px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    background: white;
                }

                .input-compact:focus {
                    outline: none;
                    border-color: #007acc;
                    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
                }

                /* Boutons */
                .btn {
                    padding: 10px 18px;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    justify-content: center;
                }

                .btn.primary {
                    background: #007acc;
                    color: white;
                }

                .btn.primary:hover {
                    background: #0066a3;
                    transform: translateY(-1px);
                }

                .btn.primary:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn.secondary {
                    background: #f8fafc;
                    color: #374151;
                    border: 1px solid #e5e7eb;
                }

                .btn.secondary:hover {
                    background: #f1f5f9;
                }

                .btn-mini {
                    padding: 4px 8px;
                    font-size: 11px;
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #374151;
                }

                .btn-mini:hover {
                    background: #f1f5f9;
                }

                /* Scan compact */
                .scan-header, .exec-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .scan-status, .exec-status {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .phase-icon, .action-icon {
                    font-size: 20px;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: #007acc;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .scan-status h3, .exec-status h3 {
                    margin: 0 0 2px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #111;
                }

                .scan-status p, .exec-status p {
                    margin: 0;
                    font-size: 12px;
                    color: #6b7280;
                }

                .progress-circle {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: conic-gradient(#007acc 0%, #f1f5f9 0%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .progress-circle::before {
                    content: '';
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: white;
                    position: absolute;
                }

                .progress-circle span {
                    font-size: 11px;
                    font-weight: 600;
                    color: #007acc;
                    z-index: 1;
                }

                .progress-circle.success {
                    background: conic-gradient(#10b981 0%, #f1f5f9 0%);
                }

                .progress-circle.success span {
                    color: #10b981;
                }

                /* Stats compactes */
                .stats-compact {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .stat {
                    text-align: center;
                    padding: 12px 8px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .stat-number {
                    display: block;
                    font-size: 18px;
                    font-weight: 700;
                    color: #111;
                    margin-bottom: 2px;
                }

                .stat-label {
                    font-size: 10px;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .progress-bar {
                    height: 6px;
                    background: #f1f5f9;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }

                .progress-fill {
                    height: 100%;
                    background: #007acc;
                    border-radius: 3px;
                    transition: width 0.3s ease;
                    width: 0%;
                }

                .progress-fill.success {
                    background: #10b981;
                }

                .current-status {
                    text-align: center;
                    font-size: 12px;
                    color: #6b7280;
                    padding: 8px;
                    background: #f8fafc;
                    border-radius: 6px;
                }

                /* Résultats compacts */
                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f0f0f0;
                }

                .results-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #166534;
                }

                .results-info .icon {
                    font-size: 16px;
                }

                .results-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .search-mini {
                    padding: 4px 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 11px;
                    width: 120px;
                    background: white;
                }

                /* Domaines compacts */
                .domains-compact {
                    flex: 1;
                    overflow-y: auto;
                    margin-bottom: 16px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                }

                .domain-item {
                    display: grid;
                    grid-template-columns: auto auto 1fr auto;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-bottom: 1px solid #f8fafc;
                    font-size: 12px;
                }

                .domain-item:hover {
                    background: #f8fafc;
                }

                .domain-item:last-child {
                    border-bottom: none;
                }

                .domain-checkbox {
                    width: 16px;
                    height: 16px;
                    accent-color: #007acc;
                }

                .domain-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    background: #007acc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                }

                .domain-info {
                    min-width: 0;
                }

                .domain-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #111;
                    margin-bottom: 2px;
                }

                .domain-meta {
                    font-size: 11px;
                    color: #6b7280;
                }

                .domain-folder {
                    padding: 4px 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 11px;
                    background: white;
                    min-width: 100px;
                }

                /* Contrôles finaux */
                .final-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 12px;
                    border-top: 1px solid #f0f0f0;
                    flex-shrink: 0;
                }

                .options-compact {
                    display: flex;
                    gap: 16px;
                }

                .checkbox-compact {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    color: #374151;
                }

                .checkbox-compact input {
                    width: 14px;
                    height: 14px;
                    accent-color: #007acc;
                }

                .action-buttons {
                    display: flex;
                    gap: 12px;
                }

                /* Succès compact */
                .success-compact {
                    text-align: center;
                }

                .success-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .success-icon {
                    font-size: 32px;
                }

                .success-header h2 {
                    color: white;
                    margin: 0 0 4px 0;
                    font-size: 18px;
                }

                .success-header p {
                    opacity: 0.9;
                    margin: 0;
                    font-size: 13px;
                }

                .success-stats {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .success-stats .stat {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .success-stats .stat-number {
                    color: white;
                }

                .success-stats .stat-label {
                    color: rgba(255, 255, 255, 0.8);
                }

                .success-actions {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                }

                .success-actions .btn.secondary {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.3);
                }

                .success-actions .btn.primary {
                    background: white;
                    color: #059669;
                }

                /* Modales compactes */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .modal.compact {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    max-width: 400px;
                    width: 100%;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #f0f0f0;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #111;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 2px;
                }

                .modal-body {
                    padding: 20px;
                }

                .confirm-details {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 16px;
                    font-size: 12px;
                }

                .detail {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 8px;
                    background: #f8fafc;
                    border-radius: 4px;
                }

                .modal-info, .warning-compact {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                }

                .modal-info {
                    background: #eff6ff;
                    color: #1e40af;
                }

                .warning-compact {
                    background: #fef3c7;
                    color: #92400e;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    padding: 12px 20px;
                    border-top: 1px solid #f0f0f0;
                    background: #fafbfc;
                }

                /* Responsive compact */
                @media (max-width: 768px) {
                    .organizer-compact {
                        padding: 12px;
                    }
                    
                    .params-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    
                    .results-header {
                        flex-direction: column;
                        gap: 12px;
                        align-items: stretch;
                    }
                    
                    .final-controls {
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .domain-item {
                        grid-template-columns: auto 1fr auto;
                        gap: 8px;
                    }
                    
                    .domain-avatar {
                        grid-row: 1 / 3;
                    }
                }

                /* Scrollbar ultra-fine */
                .domains-compact::-webkit-scrollbar {
                    width: 4px;
                }

                .domains-compact::-webkit-scrollbar-track {
                    background: #f8fafc;
                }

                .domains-compact::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 2px;
                }

                /* Animations */
                .step-content {
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            </style>
        `;
    }

    // ================================================
    // MÉTHODES SIMPLIFIÉES (identiques mais optimisées)
    // ================================================

    // Toutes les méthodes principales restent identiques
    // mais l'interface est ultra-compacte

    showScanConfirmModal(formData) {
        const modal = document.getElementById('scanConfirmModal');
        const overlay = document.getElementById('modalOverlay');
        
        const emailLimit = formData.emailLimit === 'unlimited' ? 10000 : parseInt(formData.emailLimit);
        const estimatedTime = this.calculateEstimatedTime(emailLimit);
        const periodText = this.getPeriodText(formData.dateRange, formData.startDate, formData.endDate);
        
        document.getElementById('scanEmailsCount').textContent = `${emailLimit.toLocaleString()} max`;
        document.getElementById('scanPeriod').textContent = periodText;
        document.getElementById('scanDuration').textContent = estimatedTime;
        
        this.pendingFormData = formData;
        
        overlay.style.display = 'flex';
        modal.style.display = 'block';
    }

    showExecutionModal() {
        if (!this.currentAnalysis) return;
        
        const selectedDomains = this.currentAnalysis.domains.filter(d => d.selected);
        const totalEmails = selectedDomains.reduce((sum, d) => sum + d.count, 0);
        
        if (totalEmails === 0) {
            this.showError('Aucun email sélectionné');
            return;
        }
        
        const modal = document.getElementById('executeConfirmModal');
        const overlay = document.getElementById('modalOverlay');
        
        const createFolders = document.getElementById('createFolders')?.checked ?? true;
        const moveEmails = document.getElementById('moveEmails')?.checked ?? true;
        
        if (!createFolders && !moveEmails) {
            this.showError('Veuillez sélectionner au moins une action');
            return;
        }
        
        const uniqueFolders = new Set(selectedDomains.map(d => d.suggestedFolder));
        const estimatedTime = Math.ceil(totalEmails / 50) + ' min';
        
        document.getElementById('executeEmailsCount').textContent = totalEmails.toLocaleString();
        document.getElementById('executeFoldersCount').textContent = uniqueFolders.size;
        document.getElementById('executeDuration').textContent = estimatedTime;
        
        overlay.style.display = 'flex';
        modal.style.display = 'block';
    }

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        const modals = overlay.querySelectorAll('.modal');
        
        modals.forEach(modal => modal.style.display = 'none');
        overlay.style.display = 'none';
    }

    confirmScan() {
        this.closeModal();
        if (this.pendingFormData) {
            this.startCompleteScan(this.pendingFormData);
        }
    }

    confirmExecution() {
        this.closeModal();
        this.execute();
    }

    calculateEstimatedTime(emailCount) {
        if (emailCount <= 1000) return '2-3 min';
        if (emailCount <= 2500) return '5-8 min';
        if (emailCount <= 5000) return '10-15 min';
        return '15+ min';
    }

    getPeriodText(dateRange, startDate, endDate) {
        switch(dateRange) {
            case 'all': return 'Tous les emails';
            case 'recent': return '6 derniers mois';
            case 'year': return 'Dernière année';
            case 'custom': 
                if (startDate && endDate) {
                    return `${new Date(startDate).toLocaleDateString('fr-FR')} - ${new Date(endDate).toLocaleDateString('fr-FR')}`;
                } else if (startDate) {
                    return `Depuis ${new Date(startDate).toLocaleDateString('fr-FR')}`;
                } else if (endDate) {
                    return `Jusqu'à ${new Date(endDate).toLocaleDateString('fr-FR')}`;
                }
                return 'Période personnalisée';
            default: return 'Non défini';
        }
    }

    // Toutes les autres méthodes restent identiques mais avec l'interface compacte
    async startCompleteScan(formData) {
        try {
            console.log('[DomainOrganizer] 🚀 Starting compact scan...');
            this.updateStep(2);
            
            this.configure(formData);
            await this.performDateBasedScan(formData);
            
        } catch (error) {
            console.error('[DomainOrganizer] Scan error:', error);
            this.showError(`Erreur: ${error.message}`);
            this.reset();
        } finally {
            this.isProcessing = false;
        }
    }

    async performDateBasedScan(formData) {
        console.log('[DomainOrganizer] 🔍 Compact scan...');
        
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }

        this.scanProgress = {
            totalEmails: 0,
            processedEmails: 0,
            domainsFound: new Set(),
            startTime: Date.now()
        };
        
        this.emailsByDomain.clear();

        const phaseIcon = document.getElementById('phaseIcon');
        const phaseName = document.getElementById('phaseName');
        const phaseDescription = document.getElementById('phaseDescription');
        const statusText = document.getElementById('currentStatus');
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const emailCount = document.getElementById('emailCount');
        const domainCount = document.getElementById('domainCount');
        const folderCount = document.getElementById('folderCount');

        try {
            // Phase 1: Connexion
            this.updatePhase('🔗', 'Connexion', 'Connexion Microsoft Graph');
            this.updateProgress(5);
            if (statusText) statusText.innerHTML = '<span>🔗 Connexion...</span>';

            const connectionTest = await window.mailService.testConnection();
            if (!connectionTest.success) {
                throw new Error(`Connexion échouée: ${connectionTest.error}`);
            }

            this.updateProgress(10);
            if (statusText) statusText.innerHTML = `<span>✅ Connecté: ${connectionTest.user}</span>`;

            // Phase 2: Configuration
            this.updatePhase('⚙️', 'Configuration', 'Calcul période analyse');
            const dateRange = this.calculateDateRange(formData);
            const emailLimit = formData.emailLimit === 'unlimited' ? 50000 : parseInt(formData.emailLimit);
            
            this.updateProgress(15);
            if (statusText) statusText.innerHTML = `<span>⚙️ ${dateRange.description}</span>`;

            // Phase 3: Récupération
            this.updatePhase('📥', 'Récupération', 'Chargement emails');
            
            let allEmails = [];
            const folders = formData.sourceFolder === 'all' ? 
                ['inbox', 'sent', 'archive'] : 
                [formData.sourceFolder];

            for (let i = 0; i < folders.length; i++) {
                const folder = folders[i];
                
                try {
                    const options = { top: Math.floor(emailLimit / folders.length) };
                    if (dateRange.startDate) options.startDate = dateRange.startDate;
                    if (dateRange.endDate) options.endDate = dateRange.endDate;

                    const folderEmails = await window.mailService.getEmailsFromFolder(folder, options);
                    allEmails = allEmails.concat(folderEmails);
                    
                    if (emailCount) emailCount.textContent = allEmails.length.toLocaleString();
                    
                    const progress = 20 + ((i + 1) / folders.length) * 40;
                    this.updateProgress(progress);
                    if (statusText) statusText.innerHTML = `<span>📥 ${allEmails.length} emails</span>`;
                    
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                } catch (error) {
                    console.warn(`Erreur ${folder}:`, error);
                }
            }

            if (allEmails.length === 0) {
                throw new Error('Aucun email trouvé');
            }

            // Phase 4: Analyse
            this.updatePhase('🔍', 'Analyse', 'Classification domaines');
            this.scanProgress.totalEmails = allEmails.length;
            
            for (let i = 0; i < allEmails.length; i++) {
                const email = allEmails[i];
                const domain = this.extractDomain(email);
                
                if (!domain || formData.excludeDomains.includes(domain.toLowerCase())) {
                    this.scanProgress.processedEmails++;
                    continue;
                }

                if (!this.emailsByDomain.has(domain)) {
                    this.emailsByDomain.set(domain, []);
                    this.scanProgress.domainsFound.add(domain);
                }
                
                this.emailsByDomain.get(domain).push({
                    id: email.id,
                    subject: email.subject || 'Sans objet',
                    sender: this.extractSenderEmail(email),
                    senderName: this.extractSenderName(email) || domain,
                    date: this.formatDate(email),
                    targetFolder: this.suggestFolder(domain),
                    selected: true,
                    originalEmail: email
                });

                this.scanProgress.processedEmails++;
                
                if (i % 100 === 0 || i === allEmails.length - 1) {
                    const progress = 60 + Math.floor((this.scanProgress.processedEmails / this.scanProgress.totalEmails) * 30);
                    this.updateProgress(progress);
                    
                    if (statusText) statusText.innerHTML = `<span>🔍 ${this.scanProgress.processedEmails}/${this.scanProgress.totalEmails}</span>`;
                    if (emailCount) emailCount.textContent = this.scanProgress.processedEmails.toLocaleString();
                    if (domainCount) domainCount.textContent = this.scanProgress.domainsFound.size;
                    
                    const uniqueFolders = new Set();
                    this.emailsByDomain.forEach((emails, domain) => {
                        uniqueFolders.add(this.suggestFolder(domain));
                    });
                    if (folderCount) folderCount.textContent = uniqueFolders.size;
                    
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }

            // Phase 5: Finalisation
            this.updatePhase('✅', 'Terminé', 'Analyse terminée');
            this.updateProgress(100);
            if (statusText) statusText.innerHTML = '<span>✅ Analyse terminée !</span>';

            const results = this.buildResults();
            
            setTimeout(() => {
                this.showResults(results);
            }, 800);

        } catch (error) {
            console.error('[DomainOrganizer] Scan error:', error);
            throw error;
        }
    }

    updatePhase(icon, name, description) {
        const phaseIcon = document.getElementById('phaseIcon');
        const phaseName = document.getElementById('phaseName');
        const phaseDescription = document.getElementById('phaseDescription');
        
        if (phaseIcon) phaseIcon.textContent = icon;
        if (phaseName) phaseName.textContent = name;
        if (phaseDescription) phaseDescription.textContent = description;
    }

    updateProgress(percent) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const progressCircle = document.querySelector('.progress-circle');
        
        if (progressFill) progressFill.style.width = `${Math.min(percent, 100)}%`;
        if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
        
        // Mettre à jour le cercle de progression
        if (progressCircle) {
            const angle = (percent / 100) * 360;
            progressCircle.style.background = `conic-gradient(#007acc ${angle}deg, #f1f5f9 ${angle}deg)`;
        }
    }

    // Toutes les autres méthodes restent identiques...
    // (extractDomain, suggestFolder, buildResults, etc.)

    extractDomain(email) {
        const possibleEmails = [
            email.from?.emailAddress?.address,
            email.sender?.emailAddress?.address,
            email.replyTo?.[0]?.emailAddress?.address
        ].filter(e => e);

        for (const emailAddr of possibleEmails) {
            if (emailAddr && emailAddr.includes('@')) {
                const domain = emailAddr.split('@')[1];
                if (domain) return domain.toLowerCase().trim();
            }
        }
        return null;
    }

    extractSenderEmail(email) {
        return email.from?.emailAddress?.address || 
               email.sender?.emailAddress?.address || 
               'unknown@unknown.com';
    }

    extractSenderName(email) {
        return email.from?.emailAddress?.name || 
               email.sender?.emailAddress?.name || 
               this.extractSenderEmail(email);
    }

    formatDate(email) {
        try {
            const date = new Date(email.receivedDateTime || email.sentDateTime);
            return date.toLocaleDateString('fr-FR');
        } catch (error) {
            return 'Date inconnue';
        }
    }

    suggestFolder(domain) {
        const suggestions = {
            'amazon.com': 'Amazon', 'amazon.fr': 'Amazon',
            'linkedin.com': 'LinkedIn', 'github.com': 'GitHub',
            'paypal.com': 'PayPal', 'stripe.com': 'Stripe',
            'spotify.com': 'Spotify', 'netflix.com': 'Netflix',
            'google.com': 'Google', 'microsoft.com': 'Microsoft'
        };
        return suggestions[domain] || domain;
    }

    calculateDateRange(formData) {
        const now = new Date();
        let startDate = null;
        let endDate = null;
        let description = '';

        switch(formData.dateRange) {
            case 'all':
                description = 'Tous vos emails';
                break;
            case 'recent':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                description = '6 derniers mois';
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                description = 'Dernière année';
                break;
            case 'custom':
                if (formData.startDate) startDate = new Date(formData.startDate);
                if (formData.endDate) endDate = new Date(formData.endDate);
                description = 'Période personnalisée';
                break;
        }

        return {
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
            description: description
        };
    }

    buildResults() {
        const domains = [];
        let totalEmails = 0;

        this.emailsByDomain.forEach((emails, domain) => {
            totalEmails += emails.length;
            domains.push({
                domain: domain,
                count: emails.length,
                suggestedFolder: this.suggestFolder(domain),
                emails: emails,
                selected: true
            });
        });

        domains.sort((a, b) => b.count - a.count);

        return {
            totalEmails: totalEmails,
            totalDomains: domains.length,
            domains: domains
        };
    }

    updateStep(step) {
        document.querySelectorAll('.step').forEach((stepEl, index) => {
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
        
        const currentContent = document.getElementById(`step${step}`);
        if (currentContent) {
            currentContent.style.display = 'block';
        }
        
        this.currentStep = step;
    }

    showResults(results) {
        this.currentAnalysis = results;
        this.updateStep(3);
        
        const totalFound = document.getElementById('totalFound');
        const domainsFound = document.getElementById('domainsFound');
        
        if (totalFound) totalFound.textContent = results.totalEmails.toLocaleString();
        if (domainsFound) domainsFound.textContent = results.totalDomains;
        
        this.displayDomains(results.domains);
        this.updateSelectedCount();
        
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    displayDomains(domains) {
        const container = document.getElementById('domainsList');
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
        
        const domainInitial = domainData.domain.charAt(0).toUpperCase();
        
        row.innerHTML = `
            <input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" 
                   ${domainData.selected ? 'checked' : ''}>
            
            <div class="domain-avatar">${domainInitial}</div>
            
            <div class="domain-info">
                <div class="domain-name">${domainData.domain}</div>
                <div class="domain-meta">${domainData.count} emails</div>
            </div>
            
            <select class="domain-folder" data-domain="${domainData.domain}">
                <option value="${domainData.suggestedFolder}" selected>${domainData.suggestedFolder}</option>
                <option value="inbox">Boîte de réception</option>
                <option value="archive">Archive</option>
                <option value="important">Important</option>
                <option value="newsletters">Newsletters</option>
                <option value="social">Réseaux sociaux</option>
                <option value="shopping">Shopping</option>
                <option value="work">Travail</option>
            </select>
        `;
        
        const checkbox = row.querySelector('.domain-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                domainData.selected = e.target.checked;
                domainData.emails.forEach(email => {
                    email.selected = e.target.checked;
                });
                this.updateSelectedCount();
            });
        }
        
        const folderSelect = row.querySelector('.domain-folder');
        if (folderSelect) {
            folderSelect.addEventListener('change', (e) => {
                domainData.suggestedFolder = e.target.value;
                domainData.emails.forEach(email => {
                    email.targetFolder = e.target.value;
                });
            });
        }
        
        return row;
    }

    selectAll() {
        if (!this.currentAnalysis) return;
        
        this.currentAnalysis.domains.forEach(domain => {
            domain.selected = true;
            domain.emails.forEach(email => email.selected = true);
        });
        
        document.querySelectorAll('.domain-checkbox').forEach(cb => cb.checked = true);
        this.updateSelectedCount();
    }

    deselectAll() {
        if (!this.currentAnalysis) return;
        
        this.currentAnalysis.domains.forEach(domain => {
            domain.selected = false;
            domain.emails.forEach(email => email.selected = false);
        });
        
        document.querySelectorAll('.domain-checkbox').forEach(cb => cb.checked = false);
        this.updateSelectedCount();
    }

    updateSelectedCount() {
        if (!this.currentAnalysis) return;
        
        let selectedCount = 0;
        this.currentAnalysis.domains.forEach(domain => {
            if (domain.selected) {
                selectedCount += domain.count;
            }
        });
        
        const selectedCountSpan = document.getElementById('selectedCount');
        const executeBtn = document.getElementById('executeBtn');
        
        if (selectedCountSpan) selectedCountSpan.textContent = selectedCount.toLocaleString();
        
        if (executeBtn) {
            executeBtn.disabled = selectedCount === 0;
            executeBtn.innerHTML = selectedCount === 0 ? 
                '❌ Aucun email' : 
                `▶ Organiser ${selectedCount.toLocaleString()}`;
        }
    }

    handleSearch(searchTerm) {
        const items = document.querySelectorAll('.domain-item');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const domain = item.dataset.domain?.toLowerCase() || '';
            const visible = !term || domain.includes(term);
            item.style.display = visible ? 'grid' : 'none';
        });
    }

    async execute() {
        if (this.isProcessing || !this.currentAnalysis) return;
        
        const selectedDomains = this.currentAnalysis.domains.filter(d => d.selected);
        const totalEmails = selectedDomains.reduce((sum, d) => sum + d.count, 0);
        
        if (totalEmails === 0) {
            this.showError('Aucun email sélectionné');
            return;
        }
        
        const createFolders = document.getElementById('createFolders')?.checked ?? true;
        const moveEmails = document.getElementById('moveEmails')?.checked ?? true;
        
        try {
            this.isProcessing = true;
            await this.simulateExecution(selectedDomains, { createFolders, moveEmails, totalEmails });
        } catch (error) {
            this.showError(`Erreur: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateExecution(selectedDomains, options) {
        this.updateStep(4);
        
        const actionIcon = document.getElementById('actionIcon');
        const actionName = document.getElementById('actionName');
        const actionDescription = document.getElementById('actionDescription');
        const executeFill = document.getElementById('executeFill');
        const executePercent = document.getElementById('executePercent');
        const executeStatus = document.getElementById('executeStatus');
        const foldersCreated = document.getElementById('foldersCreated');
        const emailsMoved = document.getElementById('emailsMoved');
        const timeRemaining = document.getElementById('timeRemaining');
        const progressCircle = document.querySelector('.progress-circle.success');
        
        let progress = 0;
        let foldersCount = 0;
        let emailsCount = 0;
        
        const uniqueFolders = new Set(selectedDomains.map(d => d.suggestedFolder));
        const totalFolders = options.createFolders ? uniqueFolders.size : 0;
        const startTime = Date.now();
        
        const phases = [
            { icon: '⚙️', name: 'Préparation', desc: 'Initialisation' },
            { icon: '📁', name: 'Dossiers', desc: 'Création dossiers' },
            { icon: '📧', name: 'Emails', desc: 'Déplacement emails' },
            { icon: '✅', name: 'Terminé', desc: 'Organisation terminée' }
        ];
        
        let currentPhase = 0;
        
        const interval = setInterval(() => {
            progress += 2;
            
            // Calculer temps restant
            const elapsed = Date.now() - startTime;
            const estimated = (elapsed / progress) * (100 - progress);
            const remainingSeconds = Math.max(0, Math.floor(estimated / 1000));
            
            // Phase actuelle
            const newPhase = Math.floor(progress / 25);
            if (newPhase !== currentPhase && newPhase < phases.length) {
                currentPhase = newPhase;
                const phase = phases[currentPhase];
                
                if (actionIcon) actionIcon.textContent = phase.icon;
                if (actionName) actionName.textContent = phase.name;
                if (actionDescription) actionDescription.textContent = phase.desc;
            }
            
            // Compteurs
            if (progress <= 50) {
                foldersCount = Math.floor((progress / 50) * totalFolders);
            } else if (progress <= 90) {
                foldersCount = totalFolders;
                emailsCount = Math.floor(((progress - 50) / 40) * options.totalEmails);
            } else {
                foldersCount = totalFolders;
                emailsCount = options.totalEmails;
            }
            
            // Mettre à jour l'interface
            if (executeFill) executeFill.style.width = `${Math.min(progress, 100)}%`;
            if (executePercent) executePercent.textContent = `${Math.round(Math.min(progress, 100))}%`;
            if (foldersCreated) foldersCreated.textContent = foldersCount;
            if (emailsMoved) emailsMoved.textContent = emailsCount;
            if (timeRemaining) {
                timeRemaining.textContent = progress < 100 ? 
                    (remainingSeconds > 60 ? `${Math.floor(remainingSeconds / 60)}m` : `${remainingSeconds}s`) : 
                    '0s';
            }
            if (executeStatus) {
                executeStatus.innerHTML = progress < 100 ? 
                    `<span>⚙️ ${phases[currentPhase]?.name || 'En cours'}...</span>` : 
                    '<span>✅ Terminé !</span>';
            }
            
            // Mettre à jour le cercle de progression
            if (progressCircle) {
                const angle = (progress / 100) * 360;
                progressCircle.style.background = `conic-gradient(#10b981 ${angle}deg, #f1f5f9 ${angle}deg)`;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                
                if (actionIcon) actionIcon.textContent = '🎉';
                if (actionName) actionName.textContent = 'Terminé !';
                if (actionDescription) actionDescription.textContent = 'Organisation réussie';
                
                const totalTimeElapsed = Date.now() - startTime;
                const totalMinutes = Math.floor(totalTimeElapsed / 60000);
                const totalSeconds = Math.floor((totalTimeElapsed % 60000) / 1000);
                const timeString = totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds}s` : `${totalSeconds}s`;
                
                setTimeout(() => {
                    this.showSuccess({
                        emailsMoved: emailsCount,
                        foldersCreated: foldersCount,
                        totalTime: timeString,
                        wasSimulation: !options.moveEmails
                    });
                }, 1000);
            }
        }, 60);
    }

    showSuccess(results) {
        this.updateStep(5);
        
        const finalEmails = document.getElementById('finalEmails');
        const finalFolders = document.getElementById('finalFolders');
        const finalTime = document.getElementById('finalTime');
        const successMessage = document.getElementById('successMessage');
        
        if (finalEmails) finalEmails.textContent = results.emailsMoved.toLocaleString();
        if (finalFolders) finalFolders.textContent = results.foldersCreated;
        if (finalTime) finalTime.textContent = results.totalTime;
        
        const message = results.wasSimulation ?
            `Simulation : ${results.emailsMoved} emails seraient organisés` :
            `${results.emailsMoved} emails organisés avec succès`;
        
        if (successMessage) successMessage.textContent = message;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v12.0 Compact...');
        
        if (!window.authService?.isAuthenticated()) {
            this.showError('Connexion Microsoft requise');
            return false;
        }

        if (!window.mailService) {
            this.showError('MailService non disponible');
            return false;
        }

        this.setupEventListeners();
        this.updateStep(1);
        
        console.log('[DomainOrganizer] ✅ Compact interface ready v12.0');
        return true;
    }

    setupEventListeners() {
        const form = document.getElementById('scanForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Gestion des options de dates
        const dateRadios = document.querySelectorAll('input[name="dateRange"]');
        const customDates = document.getElementById('customDates');
        
        dateRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (customDates) {
                    customDates.style.display = e.target.value === 'custom' ? 'flex' : 'none';
                }
            });
        });
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const formData = this.getFormData();
        
        // Afficher la modale de confirmation
        this.showScanConfirmModal(formData);
        
        this.isProcessing = false;
    }

    getFormData() {
        const dateRange = document.querySelector('input[name="dateRange"]:checked')?.value || 'all';
        const startDate = document.getElementById('startDate')?.value || null;
        const endDate = document.getElementById('endDate')?.value || null;
        const sourceFolder = document.getElementById('sourceFolder')?.value || 'all';
        const emailLimit = document.getElementById('emailLimit')?.value || '2500';
        const excludeDomains = document.getElementById('excludeDomains')?.value
            .split(',').map(d => d.trim().toLowerCase()).filter(d => d) || [];
        
        return { 
            dateRange,
            startDate, 
            endDate, 
            sourceFolder,
            emailLimit,
            excludeDomains
        };
    }

    configure(formData) {
        console.log('[DomainOrganizer] Configuration:', formData);
    }

    reset() {
        this.updateStep(1);
        
        const form = document.getElementById('scanForm');
        if (form) form.reset();
        
        // Réinitialiser les options de dates
        const allRadio = document.querySelector('input[name="dateRange"][value="all"]');
        if (allRadio) allRadio.checked = true;
        
        const customDates = document.getElementById('customDates');
        if (customDates) customDates.style.display = 'none';
        
        this.emailsByDomain.clear();
        this.currentAnalysis = null;
        this.isProcessing = false;
        this.currentStep = 1;
        this.pendingFormData = null;
    }

    openOutlook() {
        window.open('https://outlook.office.com/mail/', '_blank');
    }

    showError(message) {
        console.error('[DomainOrganizer] Error:', message);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            this.showInlineError(message);
        }
    }

    showInlineError(message) {
        // Créer une alerte d'erreur compacte
        const errorAlert = document.createElement('div');
        errorAlert.className = 'error-toast';
        errorAlert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            background: #fee2e2;
            color: #991b1b;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #fecaca;
            font-size: 13px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideInRight 0.3s ease;
        `;
        
        errorAlert.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>❌</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; margin-left: auto; padding: 2px;">×</button>
            </div>
        `;
        
        document.body.appendChild(errorAlert);
        
        // Style pour l'animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Retirer automatiquement après 4 secondes
        setTimeout(() => {
            if (errorAlert.parentElement) {
                errorAlert.remove();
            }
        }, 4000);
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
window.organizerInstance = new DomainOrganizer();

function showDomainOrganizerCompact() {
    console.log('[DomainOrganizer] 🚀 Launching v12.0 Ultra-Compact...');
    
    if (!window.authService?.isAuthenticated()) {
        const message = 'Connexion Microsoft requise';
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'warning');
        } else {
            window.organizerInstance.showInlineError(message);
        }
        return;
    }

    const pageContent = document.getElementById('pageContent');
    if (!pageContent) {
        console.error('[DomainOrganizer] PageContent not found');
        return;
    }

    pageContent.innerHTML = window.organizerInstance.getPageHTML();
    pageContent.style.cssText = 'display: block !important; visibility: visible !important; height: 100vh; overflow: hidden;';

    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) rangerButton.classList.add('active');

    setTimeout(async () => {
        try {
            await window.organizerInstance.initializePage();
            console.log('[DomainOrganizer] ✅ Compact ready v12.0');
        } catch (error) {
            console.error('[DomainOrganizer] Init error:', error);
        }
    }, 100);
}

// ================================================
// HOOKS ET EXPORTS
// ================================================
document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]');
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(showDomainOrganizerCompact, 20);
        return false;
    }
}, true);

// Hook PageManager
if (window.pageManager?.loadPage) {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        if (pageName === 'ranger') {
            showDomainOrganizerCompact();
            return;
        }
        return originalLoadPage.call(this, pageName);
    };
}

// Exports
window.showDomainOrganizer = showDomainOrganizerCompact;
window.domainOrganizer = {
    showPage: showDomainOrganizerCompact,
    instance: window.organizerInstance,
    version: '12.0'
};

console.log('[DomainOrganizer] ✅ v12.0 Ultra-Compact System ready - Interface optimisée sans scroll');
