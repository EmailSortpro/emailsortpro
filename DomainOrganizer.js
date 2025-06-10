// DomainOrganizer.js - Version 14.0 - Version finale sans erreurs
class DomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.emailsByDomain = new Map();
        this.currentStep = 1;
        this.analysisResults = null;
        this.isLoaded = false;
        
        console.log('[DomainOrganizer] ✅ v14.0 - Version finale sans erreurs');
    }

    getPageHTML() {
        return `
            <div class="domain-organizer-wrapper">
                <!-- Header professionnel -->
                <div class="organizer-header">
                    <div class="header-content">
                        <div class="header-title">
                            <h1>📁 Organisation Intelligente par Domaine</h1>
                            <p>Organisez automatiquement vos emails par expéditeur</p>
                        </div>
                        <div class="steps-progress">
                            <div class="step-item ${this.currentStep === 1 ? 'active' : ''}" data-step="1">
                                <div class="step-circle">1</div>
                                <span>Configuration</span>
                            </div>
                            <div class="step-item ${this.currentStep === 2 ? 'active' : ''}" data-step="2">
                                <div class="step-circle">2</div>
                                <span>Analyse</span>
                            </div>
                            <div class="step-item ${this.currentStep === 3 ? 'active' : ''}" data-step="3">
                                <div class="step-circle">3</div>
                                <span>Organisation</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="organizer-content">
                    <!-- Étape 1: Configuration -->
                    <div class="step-panel ${this.currentStep === 1 ? 'active' : ''}" id="step-config">
                        <div class="panel-card">
                            <div class="card-header">
                                <h2>🎯 Configuration de l'analyse</h2>
                                <p>Définissez les paramètres pour analyser et organiser vos emails</p>
                            </div>

                            <div class="explanation-grid">
                                <div class="explanation-card">
                                    <div class="card-icon">🔍</div>
                                    <h3>Analyse intelligente</h3>
                                    <p>Détection automatique des domaines expéditeurs (amazon.fr, linkedin.com, etc.)</p>
                                </div>
                                <div class="explanation-card">
                                    <div class="card-icon">📂</div>
                                    <h3>Création de dossiers</h3>
                                    <p>Génération automatique de noms de dossiers pertinents</p>
                                </div>
                                <div class="explanation-card">
                                    <div class="card-icon">✨</div>
                                    <h3>Validation complète</h3>
                                    <p>Vous contrôlez et validez chaque modification avant application</p>
                                </div>
                            </div>

                            <div class="config-form">
                                <div class="form-section">
                                    <h3>📅 Période d'analyse</h3>
                                    <div class="radio-group">
                                        <label class="radio-option">
                                            <input type="radio" name="period" value="all" checked>
                                            <span class="radio-mark"></span>
                                            <div class="option-content">
                                                <strong>Tous mes emails</strong>
                                                <small>Analyse complète recommandée</small>
                                            </div>
                                        </label>
                                        <label class="radio-option">
                                            <input type="radio" name="period" value="year">
                                            <span class="radio-mark"></span>
                                            <div class="option-content">
                                                <strong>Dernière année</strong>
                                                <small>Emails des 12 derniers mois</small>
                                            </div>
                                        </label>
                                        <label class="radio-option">
                                            <input type="radio" name="period" value="6months">
                                            <span class="radio-mark"></span>
                                            <div class="option-content">
                                                <strong>6 derniers mois</strong>
                                                <small>Analyse rapide et récente</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>📂 Sources à analyser</h3>
                                    <select id="sourceFolders" class="form-input">
                                        <option value="all">🔍 Tous les dossiers (recommandé)</option>
                                        <option value="inbox">📥 Boîte de réception uniquement</option>
                                        <option value="sent">📤 Éléments envoyés uniquement</option>
                                    </select>
                                </div>

                                <div class="form-section">
                                    <h3>⚙️ Options avancées</h3>
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label>🚫 Domaines à exclure</label>
                                            <input type="text" id="excludeDomains" class="form-input" placeholder="gmail.com, outlook.com">
                                            <small>Séparez par des virgules (optionnel)</small>
                                        </div>
                                        <div class="form-group">
                                            <label>📊 Emails minimum par domaine</label>
                                            <select id="minEmails" class="form-input">
                                                <option value="1">1 email (tout inclure)</option>
                                                <option value="3" selected>3 emails minimum</option>
                                                <option value="5">5 emails minimum</option>
                                                <option value="10">10 emails minimum</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="security-notice">
                                    <div class="notice-icon">🔒</div>
                                    <div class="notice-content">
                                        <strong>Analyse sécurisée</strong>
                                        <p>L'analyse se fait en <strong>lecture seule</strong>. Aucun email ne sera modifié sans votre validation explicite.</p>
                                    </div>
                                </div>

                                <div class="form-actions">
                                    <button id="startAnalysisBtn" class="btn-primary">
                                        🚀 Démarrer l'analyse
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 2: Analyse -->
                    <div class="step-panel ${this.currentStep === 2 ? 'active' : ''}" id="step-analysis">
                        <div class="panel-card">
                            <div class="card-header">
                                <h2>🔍 Analyse en cours</h2>
                                <p id="analysisStatusText">Initialisation de l'analyse...</p>
                            </div>

                            <div class="analysis-progress">
                                <div class="progress-stats">
                                    <div class="stat-card">
                                        <div class="stat-number" id="emailsAnalyzed">0</div>
                                        <div class="stat-label">Emails analysés</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number" id="domainsDiscovered">0</div>
                                        <div class="stat-label">Domaines trouvés</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number" id="foldersToCreate">0</div>
                                        <div class="stat-label">Dossiers proposés</div>
                                    </div>
                                </div>

                                <div class="progress-container">
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="progressBar"></div>
                                    </div>
                                    <div class="progress-info">
                                        <span id="progressPercent">0%</span>
                                        <span id="progressStatus">Préparation...</span>
                                    </div>
                                </div>

                                <div class="current-task">
                                    <div class="task-icon">⏳</div>
                                    <div class="task-text" id="currentTask">Connexion à votre boîte mail...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 3: Résultats -->
                    <div class="step-panel ${this.currentStep === 3 ? 'active' : ''}" id="step-results">
                        <div class="panel-card">
                            <div class="card-header">
                                <h2>📋 Résultats et organisation</h2>
                                <div class="results-summary">
                                    <span id="totalEmailsFound">0</span> emails trouvés dans 
                                    <span id="totalDomainsFound">0</span> domaines différents
                                </div>
                            </div>

                            <div class="results-toolbar">
                                <div class="toolbar-left">
                                    <button class="btn-tool" onclick="window.organizerInstance.selectAll()">
                                        ✓ Tout sélectionner
                                    </button>
                                    <button class="btn-tool" onclick="window.organizerInstance.deselectAll()">
                                        ✗ Tout désélectionner
                                    </button>
                                </div>
                                <div class="toolbar-right">
                                    <input type="text" id="searchDomains" class="search-input" placeholder="🔍 Rechercher un domaine...">
                                </div>
                            </div>

                            <div class="domains-container" id="domainsContainer">
                                <!-- Domaines générés dynamiquement -->
                            </div>

                            <div class="organization-settings">
                                <h3>⚙️ Options d'organisation</h3>
                                <div class="settings-grid">
                                    <label class="setting-option">
                                        <input type="checkbox" id="createFolders" checked>
                                        <span class="setting-checkmark"></span>
                                        <div class="setting-content">
                                            <strong>Créer les nouveaux dossiers</strong>
                                            <small>Crée automatiquement les dossiers manquants</small>
                                        </div>
                                    </label>
                                    <label class="setting-option">
                                        <input type="checkbox" id="moveEmails" checked>
                                        <span class="setting-checkmark"></span>
                                        <div class="setting-content">
                                            <strong>Déplacer les emails</strong>
                                            <small>Déplace les emails vers leurs dossiers</small>
                                        </div>
                                    </label>
                                    <label class="setting-option">
                                        <input type="checkbox" id="preserveStatus">
                                        <span class="setting-checkmark"></span>
                                        <div class="setting-content">
                                            <strong>Préserver l'état de lecture</strong>
                                            <small>Conserve si les emails sont lus ou non</small>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div class="final-actions">
                                <div class="selection-summary">
                                    <span id="selectedEmailsCount">0</span> emails sélectionnés dans 
                                    <span id="selectedDomainsCount">0</span> domaines
                                </div>
                                <div class="action-buttons">
                                    <button class="btn-secondary" onclick="window.organizerInstance.backToConfig()">
                                        ← Modifier la configuration
                                    </button>
                                    <button id="organizeBtn" class="btn-primary" onclick="window.organizerInstance.showConfirmation()">
                                        ▶️ Organiser les emails
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal de confirmation -->
                <div class="modal-backdrop" id="confirmationModal" style="display: none;">
                    <div class="modal-dialog">
                        <div class="modal-header">
                            <h3>⚠️ Confirmer l'organisation</h3>
                            <button class="modal-close" onclick="window.organizerInstance.hideConfirmation()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="confirmation-summary">
                                <div class="summary-item">
                                    <span class="summary-label">📧 Emails à organiser :</span>
                                    <span class="summary-value" id="confirmEmailCount">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">📁 Dossiers à créer :</span>
                                    <span class="summary-value" id="confirmFolderCount">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">⏱️ Temps estimé :</span>
                                    <span class="summary-value" id="confirmTimeEstimate">--</span>
                                </div>
                            </div>

                            <div class="warning-box">
                                <div class="warning-icon">⚠️</div>
                                <div class="warning-content">
                                    <strong>Cette action va modifier votre boîte mail</strong>
                                    <p>Les emails sélectionnés seront déplacés vers leurs dossiers respectifs. Cette action ne peut pas être annulée automatiquement.</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="window.organizerInstance.hideConfirmation()">
                                Annuler
                            </button>
                            <button class="btn-primary" onclick="window.organizerInstance.executeOrganization()">
                                ✅ Confirmer l'organisation
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Notifications toast -->
                <div class="toast-notifications" id="toastNotifications"></div>
            </div>

            <style>
                /* Styles modernes et complets */
                .domain-organizer-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #f8fafc;
                    min-height: 100vh;
                    line-height: 1.6;
                }

                /* Header */
                .organizer-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    padding: 32px;
                    margin-bottom: 32px;
                    color: white;
                    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 40px;
                }

                .header-title h1 {
                    margin: 0 0 8px 0;
                    font-size: 32px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }

                .header-title p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 18px;
                }

                .steps-progress {
                    display: flex;
                    gap: 24px;
                }

                .step-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 16px 20px;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                    min-width: 120px;
                }

                .step-item.active {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-4px);
                }

                .step-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
                }

                .step-item.active .step-circle {
                    background: white;
                    color: #667eea;
                }

                .step-item span {
                    font-size: 14px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                /* Contenu principal */
                .organizer-content {
                    position: relative;
                }

                .step-panel {
                    display: none;
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }

                .step-panel.active {
                    display: block;
                    opacity: 1;
                }

                .panel-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }

                .card-header {
                    padding: 40px;
                    border-bottom: 1px solid #f1f5f9;
                    background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
                }

                .card-header h2 {
                    margin: 0 0 12px 0;
                    font-size: 28px;
                    font-weight: 800;
                    color: #1e293b;
                    letter-spacing: -0.5px;
                }

                .card-header p {
                    margin: 0;
                    color: #64748b;
                    font-size: 18px;
                }

                .results-summary {
                    margin-top: 20px;
                    padding: 20px 24px;
                    background: #f0fdf4;
                    border-radius: 12px;
                    color: #166534;
                    font-weight: 600;
                    font-size: 16px;
                    border: 1px solid #bbf7d0;
                }

                /* Grille d'explication */
                .explanation-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 24px;
                    padding: 40px;
                    background: #fafbfc;
                }

                .explanation-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 32px 24px;
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    transition: transform 0.3s ease;
                }

                .explanation-card:hover {
                    transform: translateY(-4px);
                }

                .card-icon {
                    font-size: 32px;
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                }

                .explanation-card h3 {
                    margin: 0 0 12px 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b;
                }

                .explanation-card p {
                    margin: 0;
                    font-size: 15px;
                    color: #64748b;
                    line-height: 1.5;
                }

                /* Formulaire */
                .config-form {
                    padding: 40px;
                }

                .form-section {
                    margin-bottom: 40px;
                }

                .form-section h3 {
                    margin: 0 0 20px 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                }

                .radio-group {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .radio-option {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .radio-option:hover {
                    border-color: #667eea;
                    background: #f0f4ff;
                }

                .radio-option input[type="radio"] {
                    display: none;
                }

                .radio-mark {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e2e8f0;
                    border-radius: 50%;
                    background: white;
                    position: relative;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .radio-option input[type="radio"]:checked + .radio-mark {
                    border-color: #667eea;
                    background: #667eea;
                }

                .radio-option input[type="radio"]:checked + .radio-mark::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: white;
                }

                .option-content strong {
                    display: block;
                    color: #1e293b;
                    font-weight: 600;
                    margin-bottom: 4px;
                    font-size: 16px;
                }

                .option-content small {
                    color: #64748b;
                    font-size: 14px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 16px;
                    font-weight: 600;
                    color: #374151;
                }

                .form-group small {
                    font-size: 14px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                .form-input {
                    padding: 16px 20px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    font-size: 16px;
                    background: white;
                    transition: border-color 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                }

                /* Notice de sécurité */
                .security-notice {
                    display: flex;
                    gap: 16px;
                    padding: 24px;
                    background: #eff6ff;
                    border-radius: 12px;
                    border: 1px solid #bfdbfe;
                    margin-bottom: 40px;
                }

                .notice-icon {
                    font-size: 24px;
                    color: #1d4ed8;
                    flex-shrink: 0;
                }

                .notice-content strong {
                    display: block;
                    color: #1e40af;
                    font-weight: 700;
                    margin-bottom: 8px;
                    font-size: 16px;
                }

                .notice-content p {
                    margin: 0;
                    color: #1e40af;
                    font-size: 15px;
                }

                /* Boutons */
                .btn-primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 18px 36px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
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
                    padding: 14px 28px;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-secondary:hover {
                    border-color: #d1d5db;
                    background: #f9fafb;
                    transform: translateY(-1px);
                }

                .btn-tool {
                    background: #f8fafc;
                    color: #374151;
                    border: 1px solid #e2e8f0;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-tool:hover {
                    background: #f1f5f9;
                    border-color: #d1d5db;
                }

                .form-actions {
                    display: flex;
                    justify-content: center;
                }

                /* Progression d'analyse */
                .analysis-progress {
                    padding: 40px;
                }

                .progress-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 40px;
                }

                .stat-card {
                    text-align: center;
                    padding: 32px 24px;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                }

                .stat-number {
                    font-size: 36px;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 8px;
                    letter-spacing: -1px;
                }

                .stat-label {
                    font-size: 14px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                }

                .progress-container {
                    margin-bottom: 32px;
                }

                .progress-bar {
                    height: 16px;
                    background: #f1f5f9;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-bottom: 16px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    border-radius: 8px;
                    transition: width 0.5s ease;
                    width: 0%;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 16px;
                    color: #64748b;
                    font-weight: 600;
                }

                .current-task {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px 24px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .task-icon {
                    font-size: 20px;
                    color: #667eea;
                }

                .task-text {
                    font-size: 16px;
                    color: #374151;
                    font-weight: 600;
                }

                /* Barre d'outils des résultats */
                .results-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 40px;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                .toolbar-left {
                    display: flex;
                    gap: 12px;
                }

                .search-input {
                    padding: 12px 20px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 15px;
                    min-width: 300px;
                    background: white;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                /* Conteneur des domaines */
                .domains-container {
                    max-height: 500px;
                    overflow-y: auto;
                    background: white;
                }

                .domain-item {
                    display: flex;
                    align-items: center;
                    padding: 24px 40px;
                    border-bottom: 1px solid #f1f5f9;
                    transition: background-color 0.3s ease;
                }

                .domain-item:hover {
                    background: #f8fafc;
                }

                .domain-item:last-child {
                    border-bottom: none;
                }

                .domain-checkbox {
                    width: 20px;
                    height: 20px;
                    margin-right: 24px;
                    accent-color: #667eea;
                    cursor: pointer;
                }

                .domain-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 20px;
                    font-weight: 700;
                    margin-right: 24px;
                    text-transform: uppercase;
                }

                .domain-details {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 4px;
                }

                .domain-info {
                    font-size: 15px;
                    color: #64748b;
                }

                .domain-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .folder-selector {
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                    min-width: 200px;
                }

                .folder-selector:focus {
                    outline: none;
                    border-color: #667eea;
                }

                /* Paramètres d'organisation */
                .organization-settings {
                    padding: 40px;
                    border-top: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                .organization-settings h3 {
                    margin: 0 0 24px 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                }

                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 20px;
                }

                .setting-option {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 24px;
                    background: white;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .setting-option:hover {
                    border-color: #667eea;
                }

                .setting-option input[type="checkbox"] {
                    display: none;
                }

                .setting-checkmark {
                    width: 24px;
                    height: 24px;
                    border: 2px solid #e2e8f0;
                    border-radius: 6px;
                    background: white;
                    position: relative;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .setting-option input[type="checkbox"]:checked + .setting-checkmark {
                    background: #667eea;
                    border-color: #667eea;
                }

                .setting-option input[type="checkbox"]:checked + .setting-checkmark::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                }

                .setting-content strong {
                    display: block;
                    color: #1e293b;
                    font-weight: 700;
                    margin-bottom: 6px;
                    font-size: 16px;
                }

                .setting-content small {
                    color: #64748b;
                    font-size: 14px;
                }

                /* Actions finales */
                .final-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 40px;
                    border-top: 1px solid #f1f5f9;
                    background: white;
                }

                .selection-summary {
                    font-size: 18px;
                    color: #374151;
                    font-weight: 600;
                }

                .action-buttons {
                    display: flex;
                    gap: 20px;
                }

                /* Modal */
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(8px);
                }

                .modal-dialog {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                    max-width: 520px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 32px 40px 24px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 28px;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .modal-close:hover {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .modal-body {
                    padding: 32px 40px;
                }

                .confirmation-summary {
                    margin-bottom: 32px;
                }

                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 0;
                    border-bottom: 1px solid #f1f5f9;
                }

                .summary-item:last-child {
                    border-bottom: none;
                }

                .summary-label {
                    color: #64748b;
                    font-weight: 600;
                    font-size: 15px;
                }

                .summary-value {
                    color: #1e293b;
                    font-weight: 700;
                    font-size: 16px;
                }

                .warning-box {
                    display: flex;
                    gap: 16px;
                    padding: 24px;
                    background: #fef3c7;
                    border-radius: 12px;
                    border: 1px solid #fbbf24;
                }

                .warning-icon {
                    font-size: 24px;
                    color: #d97706;
                    flex-shrink: 0;
                }

                .warning-content strong {
                    display: block;
                    color: #92400e;
                    font-weight: 700;
                    margin-bottom: 8px;
                    font-size: 16px;
                }

                .warning-content p {
                    margin: 0;
                    color: #92400e;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                    padding: 24px 40px 32px;
                    border-top: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                /* Notifications toast */
                .toast-notifications {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    z-index: 1001;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .toast {
                    padding: 16px 24px;
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    min-width: 320px;
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
                    animation: slideInRight 0.4s ease;
                    cursor: pointer;
                }

                .toast.success {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .toast.error {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }

                .toast.warning {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }

                .toast.info {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
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
                    .domain-organizer-wrapper {
                        padding: 16px;
                    }

                    .organizer-header {
                        padding: 24px;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 24px;
                    }

                    .header-title h1 {
                        font-size: 28px;
                    }

                    .steps-progress {
                        width: 100%;
                        justify-content: center;
                    }

                    .step-item {
                        min-width: 100px;
                    }

                    .explanation-grid {
                        grid-template-columns: 1fr;
                        padding: 24px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .progress-stats {
                        grid-template-columns: 1fr;
                    }

                    .results-toolbar {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .search-input {
                        min-width: 100%;
                    }

                    .final-actions {
                        flex-direction: column;
                        gap: 20px;
                    }

                    .domain-item {
                        flex-wrap: wrap;
                        gap: 16px;
                    }

                    .domain-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .modal-dialog {
                        width: 95%;
                        margin: 20px;
                    }

                    .settings-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Scrollbar */
                .domains-container::-webkit-scrollbar {
                    width: 8px;
                }

                .domains-container::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }

                .domains-container::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                .domains-container::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            </style>
        `;
    }

    // ================================================
    // MÉTHODES D'INITIALISATION
    // ================================================
    async initialize() {
        console.log('[DomainOrganizer] Initializing v14.0...');
        
        if (!this.validateEnvironment()) {
            return false;
        }

        this.setupEventHandlers();
        this.updateStepDisplay(1);
        this.isLoaded = true;
        
        console.log('[DomainOrganizer] ✅ Interface ready v14.0');
        return true;
    }

    validateEnvironment() {
        if (!window.authService?.isAuthenticated()) {
            this.showNotification('Veuillez vous connecter à votre compte Microsoft', 'error');
            return false;
        }

        if (!window.mailService) {
            this.showNotification('Service de messagerie non disponible', 'error');
            return false;
        }

        return true;
    }

    setupEventHandlers() {
        // Bouton de démarrage
        const startBtn = document.getElementById('startAnalysisBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startAnalysis());
        }

        // Recherche
        const searchInput = document.getElementById('searchDomains');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterDomains(e.target.value));
        }

        // Options d'organisation
        const checkboxes = ['createFolders', 'moveEmails', 'preserveStatus'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.updateSelectionSummary());
            }
        });
    }

    updateStepDisplay(step) {
        this.currentStep = step;
        
        // Mettre à jour les indicateurs
        document.querySelectorAll('.step-item').forEach((item, index) => {
            item.classList.toggle('active', index + 1 === step);
        });

        // Afficher le bon panneau
        document.querySelectorAll('.step-panel').forEach((panel, index) => {
            if (index + 1 === step) {
                panel.classList.add('active');
                panel.style.display = 'block';
            } else {
                panel.classList.remove('active');
                panel.style.display = 'none';
            }
        });
    }

    // ================================================
    // ANALYSE DES EMAILS
    // ================================================
    async startAnalysis() {
        const startBtn = document.getElementById('startAnalysisBtn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = '🔄 Démarrage...';
        }

        try {
            const config = this.getAnalysisConfig();
            console.log('[DomainOrganizer] Starting analysis:', config);

            this.updateStepDisplay(2);
            this.showNotification('Analyse démarrée', 'info');

            await this.performAnalysis(config);

        } catch (error) {
            console.error('[DomainOrganizer] Analysis failed:', error);
            this.showNotification(`Erreur: ${error.message}`, 'error');
            this.updateStepDisplay(1);
        } finally {
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.textContent = '🚀 Démarrer l\'analyse';
            }
        }
    }

    getAnalysisConfig() {
        const period = document.querySelector('input[name="period"]:checked')?.value || 'all';
        const sourceFolders = document.getElementById('sourceFolders')?.value || 'all';
        const excludeDomains = document.getElementById('excludeDomains')?.value
            .split(',').map(d => d.trim().toLowerCase()).filter(d => d) || [];
        const minEmails = parseInt(document.getElementById('minEmails')?.value) || 3;

        return { period, sourceFolders, excludeDomains, minEmails };
    }

    async performAnalysis(config) {
        const statusText = document.getElementById('analysisStatusText');
        const currentTask = document.getElementById('currentTask');
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const progressStatus = document.getElementById('progressStatus');
        const emailsAnalyzed = document.getElementById('emailsAnalyzed');
        const domainsDiscovered = document.getElementById('domainsDiscovered');
        const foldersToCreate = document.getElementById('foldersToCreate');

        let progress = 0;

        const updateProgress = (percent, status, task) => {
            progress = Math.min(percent, 100);
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
            if (statusText) statusText.textContent = status;
            if (currentTask) currentTask.textContent = task;
            if (progressStatus) progressStatus.textContent = status;
        };

        try {
            // Étape 1: Connexion
            updateProgress(10, 'Connexion en cours...', '🔗 Connexion à Microsoft Graph');

            const connectionTest = await this.testConnection();
            if (!connectionTest.success) {
                throw new Error('Connexion impossible');
            }

            updateProgress(20, 'Connexion établie', `✅ Connecté: ${connectionTest.user}`);

            // Étape 2: Récupération
            updateProgress(30, 'Récupération des emails...', '📥 Chargement des données');

            const emails = await this.fetchEmails(config, updateProgress);
            
            updateProgress(70, 'Analyse des domaines...', '🔍 Classification en cours');

            // Étape 3: Analyse
            this.emailsByDomain.clear();
            const domainStats = new Map();

            for (let i = 0; i < emails.length; i++) {
                const email = emails[i];
                const domainInfo = this.extractDomainInfo(email);
                
                if (!domainInfo || config.excludeDomains.includes(domainInfo.domain)) {
                    continue;
                }

                if (!this.emailsByDomain.has(domainInfo.domain)) {
                    this.emailsByDomain.set(domainInfo.domain, []);
                    domainStats.set(domainInfo.domain, 0);
                }

                this.emailsByDomain.get(domainInfo.domain).push({
                    id: email.id,
                    subject: email.subject || 'Sans objet',
                    sender: domainInfo.email,
                    senderName: domainInfo.name,
                    date: this.formatDate(email.receivedDateTime || email.sentDateTime),
                    targetFolder: this.generateFolderName(domainInfo.domain),
                    selected: true,
                    originalEmail: email
                });

                domainStats.set(domainInfo.domain, domainStats.get(domainInfo.domain) + 1);

                // Mise à jour progressive
                if (i % 50 === 0 || i === emails.length - 1) {
                    const analyzeProgress = 70 + Math.floor((i / emails.length) * 25);
                    updateProgress(analyzeProgress, 'Analyse en cours...', `🔍 ${i + 1}/${emails.length} emails`);
                    
                    if (emailsAnalyzed) emailsAnalyzed.textContent = (i + 1).toLocaleString();
                    if (domainsDiscovered) domainsDiscovered.textContent = domainStats.size;
                }
            }

            // Filtrage
            for (const [domain, emails] of this.emailsByDomain.entries()) {
                if (emails.length < config.minEmails) {
                    this.emailsByDomain.delete(domain);
                }
            }

            updateProgress(100, 'Analyse terminée !', '✅ Résultats prêts');

            const results = this.buildResults();
            
            if (emailsAnalyzed) emailsAnalyzed.textContent = results.totalEmails.toLocaleString();
            if (domainsDiscovered) domainsDiscovered.textContent = results.totalDomains;
            if (foldersToCreate) foldersToCreate.textContent = results.totalDomains;

            setTimeout(() => {
                this.showResults(results);
            }, 1000);

            this.showNotification(`Analyse terminée: ${results.totalEmails} emails`, 'success');

        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            return await Promise.race([
                window.mailService.testConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 10000)
                )
            ]);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async fetchEmails(config, updateProgress) {
        const folders = this.getFolders(config.sourceFolders);
        const dateFilter = this.getDateFilter(config.period);
        const allEmails = [];

        for (let i = 0; i < folders.length; i++) {
            const folder = folders[i];
            
            try {
                updateProgress(
                    30 + (i / folders.length) * 40,
                    `Récupération: ${folder}`,
                    `📁 Dossier ${i + 1}/${folders.length}`
                );

                const options = { top: 3000 };
                if (dateFilter.startDate) {
                    options.startDate = dateFilter.startDate;
                }

                const folderEmails = await Promise.race([
                    window.mailService.getEmailsFromFolder(folder, options),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error(`Timeout ${folder}`)), 30000)
                    )
                ]);

                allEmails.push(...folderEmails);

            } catch (error) {
                console.warn(`[DomainOrganizer] Error fetching ${folder}:`, error);
            }
        }

        return allEmails;
    }

    getFolders(sourceFolders) {
        switch (sourceFolders) {
            case 'inbox': return ['inbox'];
            case 'sent': return ['sent'];
            default: return ['inbox', 'sent', 'archive'];
        }
    }

    getDateFilter(period) {
        const now = new Date();
        let startDate = null;

        switch (period) {
            case '6months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                startDate = null;
        }

        return {
            startDate: startDate ? startDate.toISOString() : null
        };
    }

    extractDomainInfo(email) {
        const senderEmail = email.from?.emailAddress?.address || 
                           email.sender?.emailAddress?.address;
        
        if (!senderEmail || !senderEmail.includes('@')) {
            return null;
        }

        const domain = senderEmail.split('@')[1].toLowerCase();
        const name = email.from?.emailAddress?.name || 
                    email.sender?.emailAddress?.name || 
                    senderEmail;

        return { domain, email: senderEmail, name };
    }

    generateFolderName(domain) {
        const mappings = {
            'amazon.com': 'Amazon', 'amazon.fr': 'Amazon',
            'linkedin.com': 'LinkedIn', 'github.com': 'GitHub',
            'paypal.com': 'PayPal', 'google.com': 'Google',
            'microsoft.com': 'Microsoft', 'netflix.com': 'Netflix',
            'spotify.com': 'Spotify', 'facebook.com': 'Facebook'
        };

        if (mappings[domain]) {
            return mappings[domain];
        }

        // Génération intelligente
        const parts = domain.split('.');
        if (parts.length >= 2) {
            const name = parts[0].replace(/[-_]/g, ' ');
            return name.charAt(0).toUpperCase() + name.slice(1);
        }

        return domain;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        } catch (error) {
            return 'Date inconnue';
        }
    }

    buildResults() {
        const domains = [];
        let totalEmails = 0;

        this.emailsByDomain.forEach((emails, domain) => {
            totalEmails += emails.length;
            domains.push({
                domain,
                count: emails.length,
                emails,
                folderName: emails[0]?.targetFolder || this.generateFolderName(domain),
                selected: true
            });
        });

        domains.sort((a, b) => b.count - a.count);

        return {
            totalEmails,
            totalDomains: domains.length,
            domains
        };
    }

    // ================================================
    // AFFICHAGE DES RÉSULTATS
    // ================================================
    showResults(results) {
        this.analysisResults = results;
        this.updateStepDisplay(3);

        const totalEmailsElement = document.getElementById('totalEmailsFound');
        const totalDomainsElement = document.getElementById('totalDomainsFound');

        if (totalEmailsElement) totalEmailsElement.textContent = results.totalEmails.toLocaleString();
        if (totalDomainsElement) totalDomainsElement.textContent = results.totalDomains;

        this.displayDomains(results.domains);
        this.updateSelectionSummary();
    }

    displayDomains(domains) {
        const container = document.getElementById('domainsContainer');
        if (!container) return;

        container.innerHTML = '';

        domains.forEach(domainData => {
            const domainElement = this.createDomainElement(domainData);
            container.appendChild(domainElement);
        });
    }

    createDomainElement(domainData) {
        const element = document.createElement('div');
        element.className = 'domain-item';
        element.dataset.domain = domainData.domain;

        const initial = domainData.domain.charAt(0).toUpperCase();

        element.innerHTML = `
            <input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" 
                   ${domainData.selected ? 'checked' : ''}>
            
            <div class="domain-avatar">${initial}</div>
            
            <div class="domain-details">
                <div class="domain-name">${domainData.domain}</div>
                <div class="domain-info">${domainData.count} emails</div>
            </div>
            
            <div class="domain-actions">
                <select class="folder-selector" data-domain="${domainData.domain}">
                    <option value="${domainData.folderName}" selected>${domainData.folderName}</option>
                    <option value="Archive">Archive</option>
                    <option value="Important">Important</option>
                    <option value="Newsletters">Newsletters</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Travail">Travail</option>
                    <option value="Finance">Finance</option>
                </select>
            </div>
        `;

        // Event listeners
        const checkbox = element.querySelector('.domain-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => this.handleDomainToggle(e));
        }

        const selector = element.querySelector('.folder-selector');
        if (selector) {
            selector.addEventListener('change', (e) => this.handleFolderChange(e));
        }

        return element;
    }

    handleDomainToggle(event) {
        const domain = event.target.dataset.domain;
        const isSelected = event.target.checked;

        if (this.analysisResults) {
            const domainData = this.analysisResults.domains.find(d => d.domain === domain);
            if (domainData) {
                domainData.selected = isSelected;
                domainData.emails.forEach(email => {
                    email.selected = isSelected;
                });
            }
        }

        this.updateSelectionSummary();
    }

    handleFolderChange(event) {
        const domain = event.target.dataset.domain;
        const newFolder = event.target.value;

        if (this.analysisResults) {
            const domainData = this.analysisResults.domains.find(d => d.domain === domain);
            if (domainData) {
                domainData.folderName = newFolder;
                domainData.emails.forEach(email => {
                    email.targetFolder = newFolder;
                });
            }
        }

        this.showNotification(`Dossier "${newFolder}" assigné à ${domain}`, 'info');
    }

    selectAll() {
        if (!this.analysisResults) return;

        this.analysisResults.domains.forEach(domain => {
            domain.selected = true;
            domain.emails.forEach(email => email.selected = true);
        });

        document.querySelectorAll('.domain-checkbox').forEach(cb => cb.checked = true);
        this.updateSelectionSummary();
        this.showNotification('Tous les domaines sélectionnés', 'info');
    }
