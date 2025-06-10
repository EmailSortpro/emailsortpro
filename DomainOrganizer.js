// DomainOrganizer.js - Version 13.0 - Version complète et robuste
class DomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.emailsByDomain = new Map();
        this.currentStep = 1;
        this.analysisResults = null;
        this.selectedEmails = new Map();
        
        console.log('[DomainOrganizer] ✅ v13.0 - Version complète initialisée');
    }

    getPageHTML() {
        return `
            <div class="domain-organizer">
                <!-- Header avec progression -->
                <div class="header">
                    <div class="header-content">
                        <h1>📁 Organisation Intelligente par Domaine</h1>
                        <p>Organisez automatiquement vos emails par expéditeur</p>
                    </div>
                    <div class="progress-indicator">
                        <div class="step-indicator ${this.currentStep >= 1 ? 'active' : ''}" data-step="1">
                            <span class="step-number">1</span>
                            <span class="step-label">Configuration</span>
                        </div>
                        <div class="step-indicator ${this.currentStep >= 2 ? 'active' : ''}" data-step="2">
                            <span class="step-number">2</span>
                            <span class="step-label">Analyse</span>
                        </div>
                        <div class="step-indicator ${this.currentStep >= 3 ? 'active' : ''}" data-step="3">
                            <span class="step-number">3</span>
                            <span class="step-label">Organisation</span>
                        </div>
                    </div>
                </div>

                <!-- Étape 1: Configuration intuitive -->
                <div class="step-content ${this.currentStep === 1 ? 'active' : ''}" id="step-1">
                    <div class="card">
                        <div class="card-header">
                            <h2>🎯 Comment souhaitez-vous organiser vos emails ?</h2>
                            <p>L'outil va analyser vos emails et les classer automatiquement par domaine expéditeur</p>
                        </div>

                        <div class="explanation-section">
                            <div class="explanation-item">
                                <div class="explanation-icon">🔍</div>
                                <div class="explanation-content">
                                    <h3>Analyse intelligente</h3>
                                    <p>Détection automatique des domaines expéditeurs (ex: amazon.fr, linkedin.com)</p>
                                </div>
                            </div>
                            <div class="explanation-item">
                                <div class="explanation-icon">📂</div>
                                <div class="explanation-content">
                                    <h3>Création de dossiers</h3>
                                    <p>Création automatique de dossiers avec noms intelligents</p>
                                </div>
                            </div>
                            <div class="explanation-item">
                                <div class="explanation-icon">✨</div>
                                <div class="explanation-content">
                                    <h3>Organisation personnalisée</h3>
                                    <p>Vous validez et personnalisez avant toute modification</p>
                                </div>
                            </div>
                        </div>

                        <div class="config-section">
                            <h3>⚙️ Configuration de l'analyse</h3>
                            
                            <div class="config-grid">
                                <div class="config-item">
                                    <label>📅 Période d'analyse</label>
                                    <select id="dateRange" class="input">
                                        <option value="all">📧 Tous mes emails (recommandé)</option>
                                        <option value="year">📅 Dernière année</option>
                                        <option value="6months">🗓️ 6 derniers mois</option>
                                        <option value="3months">📆 3 derniers mois</option>
                                        <option value="month">🗓️ Dernier mois</option>
                                    </select>
                                </div>

                                <div class="config-item">
                                    <label>📂 Dossiers à analyser</label>
                                    <select id="sourceFolders" class="input">
                                        <option value="all">🔍 Tous les dossiers</option>
                                        <option value="inbox">📥 Boîte de réception</option>
                                        <option value="sent">📤 Éléments envoyés</option>
                                        <option value="custom">🎛️ Sélection personnalisée</option>
                                    </select>
                                </div>

                                <div class="config-item">
                                    <label>🚫 Domaines à exclure (optionnel)</label>
                                    <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com" class="input">
                                    <small>Séparez par des virgules</small>
                                </div>

                                <div class="config-item">
                                    <label>📊 Emails minimum par domaine</label>
                                    <select id="minEmailsPerDomain" class="input">
                                        <option value="1">1 email (tout inclure)</option>
                                        <option value="3" selected>3 emails minimum</option>
                                        <option value="5">5 emails minimum</option>
                                        <option value="10">10 emails minimum</option>
                                    </select>
                                </div>
                            </div>

                            <div class="info-alert">
                                <div class="alert-icon">ℹ️</div>
                                <div class="alert-content">
                                    <strong>Analyse sécurisée</strong>
                                    <p>L'analyse se fait en <strong>lecture seule</strong>. Aucun email ne sera modifié sans votre validation.</p>
                                </div>
                            </div>

                            <div class="action-buttons">
                                <button id="startAnalysis" class="btn-primary">
                                    🚀 Démarrer l'analyse
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 2: Analyse en cours -->
                <div class="step-content ${this.currentStep === 2 ? 'active' : ''}" id="step-2">
                    <div class="card">
                        <div class="card-header">
                            <h2>🔍 Analyse en cours</h2>
                            <p id="analysisStatus">Initialisation de l'analyse...</p>
                        </div>

                        <div class="analysis-progress">
                            <div class="progress-stats">
                                <div class="stat-box">
                                    <div class="stat-number" id="emailsScanned">0</div>
                                    <div class="stat-label">Emails analysés</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-number" id="domainsFound">0</div>
                                    <div class="stat-label">Domaines trouvés</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-number" id="foldersProposed">0</div>
                                    <div class="stat-label">Dossiers proposés</div>
                                </div>
                            </div>

                            <div class="progress-bar-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progressBar"></div>
                                </div>
                                <div class="progress-text">
                                    <span id="progressPercent">0%</span>
                                    <span id="progressDetail">Préparation...</span>
                                </div>
                            </div>

                            <div class="current-activity">
                                <div class="activity-icon">⏳</div>
                                <div class="activity-text" id="currentActivity">Connexion à votre boîte mail...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 3: Résultats et organisation -->
                <div class="step-content ${this.currentStep === 3 ? 'active' : ''}" id="step-3">
                    <div class="card">
                        <div class="card-header">
                            <h2>📋 Résultats de l'analyse</h2>
                            <div class="results-summary">
                                <span id="totalEmailsFound">0</span> emails trouvés dans 
                                <span id="totalDomainsFound">0</span> domaines différents
                            </div>
                        </div>

                        <div class="results-controls">
                            <div class="controls-left">
                                <button class="btn-secondary" onclick="window.organizerInstance.selectAllDomains()">
                                    ✓ Sélectionner tout
                                </button>
                                <button class="btn-secondary" onclick="window.organizerInstance.deselectAllDomains()">
                                    ✗ Désélectionner tout
                                </button>
                            </div>
                            <div class="controls-right">
                                <input type="text" id="domainSearch" placeholder="🔍 Rechercher un domaine..." class="search-input">
                            </div>
                        </div>

                        <div class="domains-list" id="domainsList">
                            <!-- Populated dynamically -->
                        </div>

                        <div class="organization-options">
                            <div class="options-grid">
                                <label class="option-checkbox">
                                    <input type="checkbox" id="createNewFolders" checked>
                                    <span class="checkmark"></span>
                                    <div class="option-content">
                                        <strong>Créer de nouveaux dossiers</strong>
                                        <small>Crée automatiquement les dossiers manquants</small>
                                    </div>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox" id="moveEmails" checked>
                                    <span class="checkmark"></span>
                                    <div class="option-content">
                                        <strong>Déplacer les emails</strong>
                                        <small>Déplace les emails vers leurs dossiers respectifs</small>
                                    </div>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox" id="preserveRead">
                                    <span class="checkmark"></span>
                                    <div class="option-content">
                                        <strong>Conserver l'état de lecture</strong>
                                        <small>Préserve si les emails sont lus ou non lus</small>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="final-actions">
                            <div class="action-summary">
                                <span id="selectedEmailsCount">0</span> emails sélectionnés dans 
                                <span id="selectedDomainsCount">0</span> domaines
                            </div>
                            <div class="action-buttons">
                                <button class="btn-secondary" onclick="window.organizerInstance.goBackToConfig()">
                                    ← Modifier la configuration
                                </button>
                                <button id="executeOrganization" class="btn-primary" onclick="window.organizerInstance.executeOrganization()">
                                    ▶️ Organiser les emails
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal de confirmation -->
                <div class="modal-overlay" id="confirmModal" style="display: none;">
                    <div class="modal">
                        <div class="modal-header">
                            <h3>⚠️ Confirmer l'organisation</h3>
                            <button class="modal-close" onclick="window.organizerInstance.closeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="confirmation-details">
                                <div class="detail-row">
                                    <span class="detail-label">📧 Emails à organiser :</span>
                                    <span class="detail-value" id="confirmEmailCount">0</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">📁 Dossiers à créer :</span>
                                    <span class="detail-value" id="confirmFolderCount">0</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">⏱️ Temps estimé :</span>
                                    <span class="detail-value" id="confirmTimeEstimate">--</span>
                                </div>
                            </div>

                            <div class="warning-message">
                                <div class="warning-icon">⚠️</div>
                                <div class="warning-content">
                                    <strong>Cette action va modifier votre boîte mail</strong>
                                    <p>Les emails sélectionnés seront déplacés vers leurs dossiers respectifs. Cette action ne peut pas être annulée automatiquement.</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="window.organizerInstance.closeModal()">
                                Annuler
                            </button>
                            <button class="btn-primary" onclick="window.organizerInstance.confirmOrganization()">
                                ✅ Confirmer l'organisation
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Toast notifications -->
                <div class="toast-container" id="toastContainer"></div>
            </div>

            <style>
                /* Design system moderne et robuste */
                .domain-organizer {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    background-color: #f8fafc;
                    min-height: 100vh;
                    line-height: 1.6;
                }

                /* Header */
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 16px;
                    padding: 24px 32px;
                    margin-bottom: 24px;
                    color: white;
                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
                }

                .header-content h1 {
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }

                .header-content p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 16px;
                }

                .progress-indicator {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 24px;
                }

                .step-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 16px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                    min-width: 120px;
                }

                .step-indicator.active {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .step-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                }

                .step-indicator.active .step-number {
                    background: white;
                    color: #667eea;
                }

                .step-label {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    opacity: 0.9;
                }

                /* Cards */
                .card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }

                .card-header {
                    padding: 32px;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                .card-header h2 {
                    margin: 0 0 8px 0;
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                }

                .card-header p {
                    margin: 0;
                    color: #64748b;
                    font-size: 16px;
                }

                .results-summary {
                    margin-top: 16px;
                    padding: 16px 20px;
                    background: #f0fdf4;
                    border-radius: 8px;
                    color: #166534;
                    font-weight: 600;
                    border: 1px solid #bbf7d0;
                }

                /* Step content */
                .step-content {
                    display: none;
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }

                .step-content.active {
                    display: block;
                    opacity: 1;
                }

                /* Explanation section */
                .explanation-section {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin: 32px 0;
                    padding: 0 32px;
                }

                .explanation-item {
                    display: flex;
                    gap: 16px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .explanation-icon {
                    font-size: 24px;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .explanation-content h3 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .explanation-content p {
                    margin: 0;
                    font-size: 14px;
                    color: #64748b;
                }

                /* Configuration section */
                .config-section {
                    padding: 32px;
                }

                .config-section h3 {
                    margin: 0 0 24px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .config-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .config-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .config-item label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .config-item small {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                .input {
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                    transition: border-color 0.3s ease;
                }

                .input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                /* Info alert */
                .info-alert {
                    display: flex;
                    gap: 12px;
                    padding: 16px 20px;
                    background: #eff6ff;
                    border-radius: 8px;
                    border: 1px solid #bfdbfe;
                    margin-bottom: 32px;
                }

                .alert-icon {
                    font-size: 20px;
                    color: #1d4ed8;
                    flex-shrink: 0;
                }

                .alert-content strong {
                    display: block;
                    color: #1e40af;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .alert-content p {
                    margin: 0;
                    color: #1e40af;
                    font-size: 14px;
                }

                /* Buttons */
                .btn-primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 16px 32px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                }

                .btn-primary:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .btn-secondary {
                    background: white;
                    color: #374151;
                    border: 2px solid #e5e7eb;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-secondary:hover {
                    border-color: #d1d5db;
                    background: #f9fafb;
                }

                .action-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                }

                /* Analysis progress */
                .analysis-progress {
                    padding: 32px;
                }

                .progress-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .stat-box {
                    text-align: center;
                    padding: 24px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .stat-number {
                    font-size: 32px;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 8px;
                    letter-spacing: -1px;
                }

                .stat-label {
                    font-size: 12px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                }

                .progress-bar-container {
                    margin-bottom: 24px;
                }

                .progress-bar {
                    height: 12px;
                    background: #f1f5f9;
                    border-radius: 6px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    border-radius: 6px;
                    transition: width 0.5s ease;
                    width: 0%;
                }

                .progress-text {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 500;
                }

                .current-activity {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .activity-icon {
                    font-size: 18px;
                    color: #667eea;
                }

                .activity-text {
                    font-size: 14px;
                    color: #374151;
                    font-weight: 500;
                }

                /* Results controls */
                .results-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 32px;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                .controls-left {
                    display: flex;
                    gap: 12px;
                }

                .search-input {
                    padding: 10px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    min-width: 250px;
                    background: white;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                /* Domains list */
                .domains-list {
                    max-height: 500px;
                    overflow-y: auto;
                    background: white;
                }

                .domain-row {
                    display: flex;
                    align-items: center;
                    padding: 20px 32px;
                    border-bottom: 1px solid #f1f5f9;
                    transition: background-color 0.3s ease;
                }

                .domain-row:hover {
                    background: #f8fafc;
                }

                .domain-row:last-child {
                    border-bottom: none;
                }

                .domain-checkbox {
                    width: 20px;
                    height: 20px;
                    margin-right: 20px;
                    accent-color: #667eea;
                    cursor: pointer;
                }

                .domain-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 18px;
                    font-weight: 700;
                    margin-right: 20px;
                    text-transform: uppercase;
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 4px;
                }

                .domain-stats {
                    font-size: 14px;
                    color: #64748b;
                }

                .domain-controls {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .folder-select {
                    padding: 8px 12px;
                    border: 2px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 14px;
                    background: white;
                    min-width: 180px;
                }

                .folder-select:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .expand-btn {
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .expand-btn:hover {
                    background: #f1f5f9;
                    color: #374151;
                }

                /* Email list */
                .emails-list {
                    display: none;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .emails-list.expanded {
                    display: block;
                }

                .email-row {
                    display: flex;
                    align-items: center;
                    padding: 12px 32px 12px 100px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                }

                .email-row:last-child {
                    border-bottom: none;
                }

                .email-checkbox {
                    width: 16px;
                    height: 16px;
                    margin-right: 16px;
                    accent-color: #667eea;
                }

                .email-info {
                    flex: 1;
                    min-width: 0;
                }

                .email-subject {
                    font-weight: 500;
                    color: #1e293b;
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .email-meta {
                    color: #64748b;
                    font-size: 12px;
                }

                .email-folder-select {
                    padding: 4px 8px;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    font-size: 12px;
                    background: white;
                    min-width: 120px;
                }

                /* Organization options */
                .organization-options {
                    padding: 32px;
                    border-top: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                .options-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .option-checkbox {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    border: 2px solid #e5e7eb;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .option-checkbox:hover {
                    border-color: #667eea;
                }

                .option-checkbox input[type="checkbox"] {
                    display: none;
                }

                .checkmark {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e5e7eb;
                    border-radius: 4px;
                    background: white;
                    position: relative;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .option-checkbox input[type="checkbox"]:checked + .checkmark {
                    background: #667eea;
                    border-color: #667eea;
                }

                .option-checkbox input[type="checkbox"]:checked + .checkmark::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                }

                .option-content strong {
                    display: block;
                    color: #1e293b;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .option-content small {
                    color: #64748b;
                    font-size: 12px;
                }

                /* Final actions */
                .final-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 32px;
                    border-top: 1px solid #f1f5f9;
                    background: white;
                }

                .action-summary {
                    font-size: 16px;
                    color: #374151;
                    font-weight: 500;
                }

                /* Modal */
                .modal-overlay {
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
                    backdrop-filter: blur(4px);
                }

                .modal {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 32px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .modal-close:hover {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .modal-body {
                    padding: 32px;
                }

                .confirmation-details {
                    margin-bottom: 24px;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                }

                .detail-row:last-child {
                    border-bottom: none;
                }

                .detail-label {
                    color: #64748b;
                    font-weight: 500;
                }

                .detail-value {
                    color: #1e293b;
                    font-weight: 600;
                }

                .warning-message {
                    display: flex;
                    gap: 12px;
                    padding: 20px;
                    background: #fef3c7;
                    border-radius: 8px;
                    border: 1px solid #fbbf24;
                }

                .warning-icon {
                    font-size: 20px;
                    color: #d97706;
                    flex-shrink: 0;
                }

                .warning-content strong {
                    display: block;
                    color: #92400e;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .warning-content p {
                    margin: 0;
                    color: #92400e;
                    font-size: 14px;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                    padding: 24px 32px;
                    border-top: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                /* Toast notifications */
                .toast-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1001;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .toast {
                    padding: 16px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    min-width: 300px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    animation: slideInRight 0.3s ease;
                }

                .toast.success {
                    background: #10b981;
                }

                .toast.error {
                    background: #ef4444;
                }

                .toast.warning {
                    background: #f59e0b;
                }

                .toast.info {
                    background: #3b82f6;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .domain-organizer {
                        padding: 16px;
                    }

                    .header {
                        padding: 20px;
                    }

                    .header-content h1 {
                        font-size: 24px;
                    }

                    .progress-indicator {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .step-indicator {
                        flex-direction: row;
                        min-width: auto;
                        width: 100%;
                    }

                    .explanation-section {
                        grid-template-columns: 1fr;
                        padding: 0 20px;
                    }

                    .config-grid {
                        grid-template-columns: 1fr;
                    }

                    .progress-stats {
                        grid-template-columns: 1fr;
                    }

                    .results-controls {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .final-actions {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .domain-row {
                        flex-wrap: wrap;
                        gap: 12px;
                    }

                    .domain-controls {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .modal {
                        width: 95%;
                        margin: 20px;
                    }

                    .options-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Scrollbar styling */
                .domains-list::-webkit-scrollbar,
                .emails-list::-webkit-scrollbar {
                    width: 8px;
                }

                .domains-list::-webkit-scrollbar-track,
                .emails-list::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }

                .domains-list::-webkit-scrollbar-thumb,
                .emails-list::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                .domains-list::-webkit-scrollbar-thumb:hover,
                .emails-list::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            </style>
        `;
    }

    // ================================================
    // INITIALISATION ET GESTION D'INTERFACE
    // ================================================
    async initialize() {
        console.log('[DomainOrganizer] Initializing v13.0...');
        
        // Vérifier l'authentification
        if (!window.authService?.isAuthenticated()) {
            this.showToast('Veuillez vous connecter à votre compte Microsoft', 'error');
            return false;
        }

        // Vérifier MailService
        if (!window.mailService) {
            this.showToast('Service de messagerie non disponible - Rechargez la page', 'error');
            return false;
        }

        this.setupEventListeners();
        this.updateStepDisplay(1);
        
        console.log('[DomainOrganizer] ✅ Interface ready v13.0');
        return true;
    }

    setupEventListeners() {
        // Bouton de démarrage de l'analyse
        const startBtn = document.getElementById('startAnalysis');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startAnalysis());
        }

        // Recherche dans les domaines
        const searchInput = document.getElementById('domainSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterDomains(e.target.value));
        }

        // Options d'organisation
        const checkboxes = ['createNewFolders', 'moveEmails', 'preserveRead'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.updateActionSummary());
            }
        });
    }

    updateStepDisplay(step) {
        this.currentStep = step;
        
        // Mettre à jour les indicateurs d'étapes
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index + 1 <= step);
        });

        // Afficher le bon contenu d'étape
        document.querySelectorAll('.step-content').forEach((content, index) => {
            if (index + 1 === step) {
                content.classList.add('active');
                content.style.display = 'block';
            } else {
                content.classList.remove('active');
                content.style.display = 'none';
            }
        });
    }

    // ================================================
    // ANALYSE RAPIDE ET ROBUSTE
    // ================================================
    async startAnalysis() {
        const startBtn = document.getElementById('startAnalysis');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = '🔄 Démarrage...';
        }

        try {
            const config = this.getAnalysisConfig();
            console.log('[DomainOrganizer] Starting analysis with config:', config);

            this.updateStepDisplay(2);
            this.showToast('Analyse démarrée', 'info');

            await this.performRobustAnalysis(config);

        } catch (error) {
            console.error('[DomainOrganizer] Analysis failed:', error);
            this.showToast(`Erreur d'analyse: ${error.message}`, 'error');
            this.updateStepDisplay(1);
        } finally {
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.textContent = '🚀 Démarrer l\'analyse';
            }
        }
    }

    getAnalysisConfig() {
        const dateRange = document.getElementById('dateRange')?.value || 'all';
        const sourceFolders = document.getElementById('sourceFolders')?.value || 'all';
        const excludeDomains = document.getElementById('excludeDomains')?.value
            .split(',').map(d => d.trim().toLowerCase()).filter(d => d) || [];
        const minEmailsPerDomain = parseInt(document.getElementById('minEmailsPerDomain')?.value) || 3;

        return {
            dateRange,
            sourceFolders,
            excludeDomains,
            minEmailsPerDomain
        };
    }

    async performRobustAnalysis(config) {
        const statusElement = document.getElementById('analysisStatus');
        const activityElement = document.getElementById('currentActivity');
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const progressDetail = document.getElementById('progressDetail');
        const emailsScanned = document.getElementById('emailsScanned');
        const domainsFound = document.getElementById('domainsFound');
        const foldersProposed = document.getElementById('foldersProposed');

        let progress = 0;

        const updateProgress = (percent, status, activity, detail) => {
            progress = Math.min(percent, 100);
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
            if (statusElement) statusElement.textContent = status;
            if (activityElement) activityElement.textContent = activity;
            if (progressDetail) progressDetail.textContent = detail;
        };

        try {
            // Étape 1: Connexion et validation (0-10%)
            updateProgress(5, 'Connexion en cours...', '🔗 Connexion à Microsoft Graph', 'Vérification des permissions');

            const connectionTest = await this.testConnectionWithTimeout();
            if (!connectionTest.success) {
                throw new Error(`Connexion impossible: ${connectionTest.error}`);
            }

            updateProgress(10, 'Connexion établie', `✅ Connecté: ${connectionTest.user}`, 'Préparation de l\'analyse');

            // Étape 2: Configuration et calculs (10-20%)
            updateProgress(15, 'Configuration de l\'analyse...', '⚙️ Calcul des paramètres', 'Définition de la période');

            const dateFilter = this.calculateDateFilter(config.dateRange);
            const foldersToScan = this.getFoldersToScan(config.sourceFolders);

            updateProgress(20, 'Configuration terminée', '📋 Paramètres validés', `${foldersToScan.length} dossiers à analyser`);

            // Étape 3: Récupération des emails (20-60%)
            updateProgress(25, 'Récupération des emails...', '📥 Chargement des données', 'Scan en cours...');

            const allEmails = await this.fetchEmailsFromFolders(foldersToScan, dateFilter, config, updateProgress);

            updateProgress(60, 'Emails récupérés', `📧 ${allEmails.length} emails chargés`, 'Début de l\'analyse');

            // Étape 4: Analyse des domaines (60-90%)
            updateProgress(65, 'Analyse des domaines...', '🔍 Classification en cours', 'Traitement des expéditeurs');

            this.emailsByDomain.clear();
            const domainStats = new Map();

            for (let i = 0; i < allEmails.length; i++) {
                const email = allEmails[i];
                const domainInfo = this.extractAndValidateDomain(email);
                
                if (!domainInfo || config.excludeDomains.includes(domainInfo.domain.toLowerCase())) {
                    continue;
                }

                // Valider le domaine selon la RFC
                if (!this.validateDomainName(domainInfo.domain)) {
                    console.warn(`[DomainOrganizer] Invalid domain skipped: ${domainInfo.domain}`);
                    continue;
                }

                if (!this.emailsByDomain.has(domainInfo.domain)) {
                    this.emailsByDomain.set(domainInfo.domain, []);
                    domainStats.set(domainInfo.domain, { count: 0, lastDate: null });
                }

                const emailData = {
                    id: email.id,
                    subject: email.subject || 'Sans objet',
                    sender: domainInfo.fullEmail,
                    senderName: domainInfo.senderName,
                    date: this.formatDate(email.receivedDateTime || email.sentDateTime),
                    targetFolder: this.generateSmartFolderName(domainInfo.domain),
                    selected: true,
                    originalEmail: email
                };

                this.emailsByDomain.get(domainInfo.domain).push(emailData);
                domainStats.get(domainInfo.domain).count++;

                // Mise à jour progressive
                if (i % 50 === 0 || i === allEmails.length - 1) {
                    const analyzeProgress = 65 + Math.floor((i / allEmails.length) * 25);
                    updateProgress(analyzeProgress, 'Analyse en cours...', 
                        `🔍 ${i + 1}/${allEmails.length} emails analysés`, 
                        `${domainStats.size} domaines trouvés`);
                    
                    if (emailsScanned) emailsScanned.textContent = (i + 1).toLocaleString();
                    if (domainsFound) domainsFound.textContent = domainStats.size;
                }
            }

            // Étape 5: Filtrage et finalisation (90-100%)
            updateProgress(92, 'Filtrage des résultats...', '🎯 Application des filtres', 'Validation des domaines');

            // Filtrer par nombre minimum d'emails
            for (const [domain, emails] of this.emailsByDomain.entries()) {
                if (emails.length < config.minEmailsPerDomain) {
                    this.emailsByDomain.delete(domain);
                    domainStats.delete(domain);
                }
            }

            // Trier les domaines par nombre d'emails
            const sortedDomains = Array.from(this.emailsByDomain.entries())
                .sort((a, b) => b[1].length - a[1].length);

            this.emailsByDomain = new Map(sortedDomains);

            updateProgress(98, 'Génération des résultats...', '📊 Préparation de l\'affichage', 'Finalisation');

            const results = this.buildAnalysisResults();

            updateProgress(100, 'Analyse terminée !', '✅ Analyse complète', 
                `${results.totalEmails} emails dans ${results.totalDomains} domaines`);

            if (emailsScanned) emailsScanned.textContent = results.totalEmails.toLocaleString();
            if (domainsFound) domainsFound.textContent = results.totalDomains;
            if (foldersProposed) foldersProposed.textContent = results.totalDomains;

            // Transition vers les résultats
            setTimeout(() => {
                this.showResults(results);
            }, 1000);

            this.showToast(`Analyse terminée: ${results.totalEmails} emails trouvés`, 'success');

        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            
            // En cas d'erreur, essayer de continuer avec des données partielles
            if (this.emailsByDomain.size > 0) {
                console.log('[DomainOrganizer] Continuing with partial data');
                const partialResults = this.buildAnalysisResults();
                this.showResults(partialResults);
                this.showToast(`Analyse partielle: ${partialResults.totalEmails} emails`, 'warning');
            } else {
                throw error;
            }
        }
    }

    async testConnectionWithTimeout() {
        try {
            return await Promise.race([
                window.mailService.testConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout de connexion')), 10000)
                )
            ]);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    calculateDateFilter(dateRange) {
        const now = new Date();
        let startDate = null;

        switch (dateRange) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case '3months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            case '6months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default: // 'all'
                startDate = null;
        }

        return {
            startDate: startDate ? startDate.toISOString() : null,
            endDate: null // Toujours jusqu'à maintenant
        };
    }

    getFoldersToScan(sourceFolders) {
        switch (sourceFolders) {
            case 'inbox':
                return ['inbox'];
            case 'sent':
                return ['sent'];
            case 'custom':
                // Pour l'instant, utiliser tous les dossiers principaux
                return ['inbox', 'sent', 'archive'];
            default: // 'all'
                return ['inbox', 'sent', 'archive', 'drafts'];
        }
    }

    async fetchEmailsFromFolders(folders, dateFilter, config, updateProgress) {
        const allEmails = [];
        const maxEmailsPerFolder = 2000; // Limite raisonnable

        for (let i = 0; i < folders.length; i++) {
            const folder = folders[i];
            
            try {
                updateProgress(
                    25 + (i / folders.length) * 35,
                    `Récupération: ${this.getFolderDisplayName(folder)}`,
                    `📁 Dossier ${i + 1}/${folders.length}`,
                    `Scan de ${folder}...`
                );

                const options = {
                    top: maxEmailsPerFolder
                };

                if (dateFilter.startDate) {
                    options.startDate = dateFilter.startDate;
                }

                // Récupération avec timeout
                const folderEmails = await Promise.race([
                    window.mailService.getEmailsFromFolder(folder, options),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error(`Timeout pour ${folder}`)), 30000)
                    )
                ]);

                allEmails.push(...folderEmails);

                console.log(`[DomainOrganizer] Folder ${folder}: ${folderEmails.length} emails`);

            } catch (error) {
                console.warn(`[DomainOrganizer] Error fetching ${folder}:`, error);
                // Continuer avec les autres dossiers
            }
        }

        return allEmails;
    }

    extractAndValidateDomain(email) {
        // Extraire l'email expéditeur
        const senderEmail = email.from?.emailAddress?.address || 
                            email.sender?.emailAddress?.address;
        
        if (!senderEmail || !senderEmail.includes('@')) {
            return null;
        }

        const senderName = email.from?.emailAddress?.name || 
                          email.sender?.emailAddress?.name || 
                          senderEmail;

        // Extraire le domaine complet après @
        const atIndex = senderEmail.lastIndexOf('@');
        const domain = senderEmail.substring(atIndex + 1).toLowerCase().trim();

        if (!domain) {
            return null;
        }

        return {
            domain: domain,
            fullEmail: senderEmail.toLowerCase(),
            senderName: senderName
        };
    }

    validateDomainName(domain) {
        // Validation RFC compliant du nom de domaine
        if (!domain || domain.length === 0 || domain.length > 253) {
            return false;
        }

        // Vérifier qu'il contient au moins un point (TLD)
        if (!domain.includes('.')) {
            return false;
        }

        // Regex pour valider le format du domaine
        const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
        
        if (!domainRegex.test(domain)) {
            return false;
        }

        // Vérifier que ce n'est pas une adresse IP
        const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        if (ipRegex.test(domain)) {
            return false;
        }

        return true;
    }

    generateSmartFolderName(domain) {
        // Mapping intelligent des domaines vers noms de dossiers
        const domainMappings = {
            // E-commerce
            'amazon.com': 'Amazon',
            'amazon.fr': 'Amazon',
            'amazon.de': 'Amazon',
            'amazon.co.uk': 'Amazon',
            'ebay.com': 'eBay',
            'ebay.fr': 'eBay',
            'cdiscount.com': 'Cdiscount',
            'fnac.com': 'Fnac',
            'darty.com': 'Darty',
            'boulanger.com': 'Boulanger',
            'zalando.fr': 'Zalando',
            'asos.com': 'ASOS',
            
            // Services financiers
            'paypal.com': 'PayPal',
            'stripe.com': 'Stripe',
            'wise.com': 'Wise',
            'revolut.com': 'Revolut',
            'boursorama.com': 'Boursorama',
            'creditagricole.fr': 'Crédit Agricole',
            'bnpparibas.fr': 'BNP Paribas',
            'societegenerale.fr': 'Société Générale',
            'lcl.fr': 'LCL',
            'labanquepostale.fr': 'La Banque Postale',
            
            // Réseaux sociaux et communication
            'linkedin.com': 'LinkedIn',
            'facebook.com': 'Facebook',
            'instagram.com': 'Instagram',
            'twitter.com': 'Twitter',
            'x.com': 'X (Twitter)',
            'discord.com': 'Discord',
            'slack.com': 'Slack',
            'teams.microsoft.com': 'Microsoft Teams',
            'zoom.us': 'Zoom',
            'whatsapp.com': 'WhatsApp',
            'telegram.org': 'Telegram',
            
            // Tech et services
            'github.com': 'GitHub',
            'gitlab.com': 'GitLab',
            'google.com': 'Google',
            'microsoft.com': 'Microsoft',
            'apple.com': 'Apple',
            'adobe.com': 'Adobe',
            'dropbox.com': 'Dropbox',
            'notion.so': 'Notion',
            'figma.com': 'Figma',
            'canva.com': 'Canva',
            
            // Streaming et média
            'netflix.com': 'Netflix',
            'spotify.com': 'Spotify',
            'deezer.com': 'Deezer',
            'youtube.com': 'YouTube',
            'twitch.tv': 'Twitch',
            'primevideo.com': 'Prime Video',
            'disneyplus.com': 'Disney+',
            'canalplus.com': 'Canal+',
            
            // Voyage et transport
            'booking.com': 'Booking',
            'airbnb.com': 'Airbnb',
            'sncf-connect.com': 'SNCF',
            'ouisncf.com': 'SNCF',
            'uber.com': 'Uber',
            'blablacar.fr': 'BlaBlaCar',
            'ryanair.com': 'Ryanair',
            'airfrance.fr': 'Air France',
            'booking.com': 'Booking',
            
            // Éducation
            'udemy.com': 'Udemy',
            'coursera.org': 'Coursera',
            'openclassrooms.com': 'OpenClassrooms',
            'edx.org': 'edX',
            
            // News et information
            'lemonde.fr': 'Le Monde',
            'lefigaro.fr': 'Le Figaro',
