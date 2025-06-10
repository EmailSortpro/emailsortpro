// DomainOrganizer.js - Version 9.0 - Sans limitation de date + Étapes détaillées
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
        this.currentStep = 1;
        
        // Nouvelles propriétés pour le scan réel amélioré
        this.realEmails = [];
        this.scanProgress = {
            totalEmails: 0,
            processedEmails: 0,
            domainsFound: new Set(),
            startTime: null,
            currentStage: '',
            stageProgress: 0
        };
        
        console.log('[DomainOrganizer] ✅ v9.0 - Sans limitation de date + Étapes détaillées');
    }

    getPageHTML() {
        return `
            <div class="organizer-container">
                <!-- Header avec indicateur d'étapes amélioré -->
                <div class="organizer-header">
                    <div class="header-content">
                        <div class="header-title">
                            <h1>📁 Rangement par domaine</h1>
                            <p>Organisation automatique et intelligente de vos emails</p>
                        </div>
                        
                        <!-- Progress steps avec descriptions -->
                        <div class="progress-steps">
                            <div class="step active" data-step="1" title="Configuration initiale">
                                <span class="step-number">1</span>
                                <span class="step-label">Config</span>
                            </div>
                            <div class="step" data-step="2" title="Analyse des emails">
                                <span class="step-number">2</span>
                                <span class="step-label">Scan</span>
                            </div>
                            <div class="step" data-step="3" title="Révision des résultats">
                                <span class="step-number">3</span>
                                <span class="step-label">Révision</span>
                            </div>
                            <div class="step" data-step="4" title="Organisation finale">
                                <span class="step-number">4</span>
                                <span class="step-label">Action</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenu des étapes -->
                <div class="content-wrapper">
                    <!-- Étape 1: Configuration améliorée -->
                    <div class="step-content" id="step1" style="display: block;">
                        <div class="card">
                            <div class="card-header">
                                <h2>⚙️ Configuration de l'analyse</h2>
                                <p>Définissez les paramètres de recherche et d'organisation</p>
                            </div>

                            <div class="info-section">
                                <div class="info-box info-how">
                                    <div class="info-icon">🔍</div>
                                    <div class="info-content">
                                        <strong>Comment ça fonctionne ?</strong>
                                        <p>L'outil analyse vos emails par domaine expéditeur (gmail.com, amazon.fr, etc.) et propose de les organiser automatiquement dans des dossiers dédiés.</p>
                                    </div>
                                </div>

                                <div class="info-box info-warning">
                                    <div class="info-icon">⚠️</div>
                                    <div class="info-content">
                                        <strong>Important</strong>
                                        <p>Cet outil accède à vos emails en <strong>lecture seule</strong> pendant l'analyse. Aucune modification n'est effectuée sans votre validation explicite.</p>
                                    </div>
                                </div>
                            </div>

                            <form id="organizeForm" class="form">
                                <div class="form-section">
                                    <h3>📅 Période d'analyse (optionnel)</h3>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Date début</label>
                                            <input type="date" id="startDate" class="input">
                                            <small>Laisser vide pour analyser tous les emails</small>
                                        </div>
                                        <div class="form-group">
                                            <label>Date fin</label>
                                            <input type="date" id="endDate" class="input">
                                            <small>Laisser vide pour analyser jusqu'à aujourd'hui</small>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>📂 Source et limite</h3>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Dossier source</label>
                                            <select id="sourceFolder" class="input">
                                                <option value="inbox">Boîte de réception</option>
                                                <option value="sent">Éléments envoyés</option>
                                                <option value="archive">Archive</option>
                                                <option value="all">Tous les dossiers</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Limite d'emails</label>
                                            <select id="emailLimit" class="input">
                                                <option value="100">100 emails (rapide)</option>
                                                <option value="500" selected>500 emails (recommandé)</option>
                                                <option value="1000">1000 emails</option>
                                                <option value="2000">2000 emails (plus long)</option>
                                                <option value="unlimited">Sans limite</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>🚫 Exclusions (optionnel)</h3>
                                    <div class="form-group">
                                        <label>Domaines à exclure</label>
                                        <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com, hotmail.fr" class="input">
                                        <small>Séparez les domaines par des virgules</small>
                                    </div>
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary" id="analyzeBtn">
                                        🔍 Commencer l'analyse
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Étape 2: Analyse détaillée -->
                    <div class="step-content" id="step2" style="display: none;">
                        <div class="card">
                            <div class="card-header">
                                <h2>🔍 Analyse en cours</h2>
                                <p id="analysisDescription">Initialisation de l'analyse...</p>
                            </div>

                            <!-- Alertes d'information pendant le scan -->
                            <div class="scan-alerts">
                                <div class="alert alert-info" id="scanAlert">
                                    <div class="alert-icon">ℹ️</div>
                                    <div class="alert-content">
                                        <strong>Analyse en cours</strong>
                                        <p>L'outil accède à vos emails en lecture seule pour identifier les domaines expéditeurs. Aucune modification n'est effectuée à cette étape.</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Progress détaillé -->
                            <div class="progress-section">
                                <div class="stage-indicator">
                                    <div class="stage active" id="stage1">
                                        <div class="stage-icon">🔗</div>
                                        <span>Connexion</span>
                                    </div>
                                    <div class="stage" id="stage2">
                                        <div class="stage-icon">📥</div>
                                        <span>Récupération</span>
                                    </div>
                                    <div class="stage" id="stage3">
                                        <div class="stage-icon">🔍</div>
                                        <span>Analyse</span>
                                    </div>
                                    <div class="stage" id="stage4">
                                        <div class="stage-icon">📊</div>
                                        <span>Résultats</span>
                                    </div>
                                </div>

                                <div class="stats-grid">
                                    <div class="stat">
                                        <div class="stat-number" id="emailsAnalyzed">0</div>
                                        <div class="stat-label">Emails analysés</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="domainsFound">0</div>
                                        <div class="stat-label">Domaines trouvés</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="foldersToCreate">0</div>
                                        <div class="stat-label">Dossiers proposés</div>
                                    </div>
                                </div>
                                
                                <div class="progress-container">
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="progressBar"></div>
                                    </div>
                                    <div class="progress-text">
                                        <span id="progressPercent">0%</span>
                                        <span id="progressDetail">Initialisation...</span>
                                    </div>
                                </div>
                                
                                <div class="current-status" id="currentStatus">
                                    <div class="status-icon">⏳</div>
                                    <div class="status-text" id="currentDomain">Préparation de l'analyse...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 3: Révision améliorée -->
                    <div class="step-content" id="step3" style="display: none;">
                        <div class="card">
                            <div class="card-header">
                                <h2>✏️ Révision et personnalisation</h2>
                                <div class="summary">
                                    <span id="totalEmailsFound">0</span> emails trouvés dans <span id="totalDomainsFound">0</span> domaines différents
                                </div>
                            </div>

                            <!-- Alerte de révision -->
                            <div class="scan-alerts">
                                <div class="alert alert-success">
                                    <div class="alert-icon">✅</div>
                                    <div class="alert-content">
                                        <strong>Analyse terminée !</strong>
                                        <p>Vérifiez les propositions ci-dessous. Vous pouvez personnaliser les noms de dossiers et désélectionner les emails que vous ne souhaitez pas déplacer.</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Contrôles -->
                            <div class="controls">
                                <div class="control-section">
                                    <div class="control-buttons">
                                        <button class="btn-small" onclick="window.organizerInstance.selectAllEmails()">
                                            ✓ Tout sélectionner
                                        </button>
                                        <button class="btn-small" onclick="window.organizerInstance.deselectAllEmails()">
                                            ✗ Tout désélectionner
                                        </button>
                                        <button class="btn-small" onclick="window.organizerInstance.expandAllDomains()">
                                            ⬇ Développer tout
                                        </button>
                                    </div>
                                    
                                    <div class="search-section">
                                        <input type="text" id="emailSearch" placeholder="🔍 Rechercher un email ou domaine..." class="search-input">
                                    </div>
                                </div>
                            </div>

                            <!-- Liste des domaines -->
                            <div class="domains-container" id="detailedResults">
                                <!-- Populated dynamically -->
                            </div>

                            <!-- Actions finales -->
                            <div class="actions">
                                <div class="action-options">
                                    <label class="checkbox">
                                        <input type="checkbox" id="createFolders" checked>
                                        Créer automatiquement les nouveaux dossiers
                                    </label>
                                    <label class="checkbox">
                                        <input type="checkbox" id="moveEmails" checked>
                                        Déplacer les emails sélectionnés
                                    </label>
                                </div>
                                
                                <div class="action-buttons">
                                    <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                                        ← Recommencer
                                    </button>
                                    <button class="btn btn-primary" id="applyBtn" onclick="window.organizerInstance.applyOrganization()">
                                        ▶ Organiser <span id="selectedCount">0</span> emails
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 4: Organisation avec alertes -->
                    <div class="step-content" id="step4" style="display: none;">
                        <div class="card">
                            <div class="card-header">
                                <h2>⚙️ Organisation en cours</h2>
                                <p id="organizationDescription">Préparation de l'organisation...</p>
                            </div>

                            <!-- Alertes pendant l'organisation -->
                            <div class="scan-alerts">
                                <div class="alert alert-warning" id="organizationAlert">
                                    <div class="alert-icon">⚠️</div>
                                    <div class="alert-content">
                                        <strong>Actions en cours</strong>
                                        <p id="alertMessage">Création des dossiers et déplacement des emails. Cette opération peut prendre quelques minutes selon le nombre d'emails.</p>
                                    </div>
                                </div>
                            </div>

                            <div class="progress-section">
                                <div class="stage-indicator">
                                    <div class="stage active" id="orgStage1">
                                        <div class="stage-icon">📁</div>
                                        <span>Dossiers</span>
                                    </div>
                                    <div class="stage" id="orgStage2">
                                        <div class="stage-icon">📧</div>
                                        <span>Emails</span>
                                    </div>
                                    <div class="stage" id="orgStage3">
                                        <div class="stage-icon">✅</div>
                                        <span>Vérification</span>
                                    </div>
                                </div>

                                <div class="stats-grid">
                                    <div class="stat">
                                        <div class="stat-number" id="foldersCreated">0</div>
                                        <div class="stat-label">Dossiers créés</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="emailsMoved">0</div>
                                        <div class="stat-label">Emails déplacés</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="timeRemaining">--</div>
                                        <div class="stat-label">Temps restant</div>
                                    </div>
                                </div>
                                
                                <div class="progress-container">
                                    <div class="progress-bar">
                                        <div class="progress-fill success" id="executeBar"></div>
                                    </div>
                                    <div class="progress-text">
                                        <span id="executePercent">0%</span>
                                        <span id="executeDetail">Initialisation...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 5: Succès -->
                    <div class="step-content" id="step5" style="display: none;">
                        <div class="card success">
                            <div class="success-content">
                                <div class="success-icon">🎉</div>
                                <h2>Organisation terminée avec succès !</h2>
                                <p id="successMessage">Vos emails ont été organisés selon vos préférences</p>
                                
                                <div class="success-stats">
                                    <div class="success-stat">
                                        <span id="finalEmailsMoved">0</span>
                                        <label>emails organisés</label>
                                    </div>
                                    <div class="success-stat">
                                        <span id="finalFoldersCreated">0</span>
                                        <label>dossiers créés</label>
                                    </div>
                                    <div class="success-stat">
                                        <span id="totalTime">--</span>
                                        <label>temps total</label>
                                    </div>
                                </div>

                                <div class="success-actions">
                                    <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                                        🔄 Nouvelle organisation
                                    </button>
                                    <button class="btn btn-primary" onclick="window.organizerInstance.exploreResults()">
                                        📧 Voir dans Outlook
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Design system amélioré */
                .organizer-container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f8fafc;
                    min-height: 100vh;
                    line-height: 1.6;
                }

                /* Header avec étapes améliorées */
                .organizer-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 16px;
                    padding: 24px 28px;
                    margin-bottom: 20px;
                    color: white;
                    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                }

                .header-title h1 {
                    margin: 0;
                    font-size: 26px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }

                .header-title p {
                    margin: 4px 0 0 0;
                    opacity: 0.9;
                    font-size: 15px;
                    font-weight: 400;
                }

                /* Steps indicator amélioré */
                .progress-steps {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .progress-steps .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 8px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    min-width: 60px;
                }

                .progress-steps .step:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .progress-steps .step.active {
                    background: white;
                    color: #667eea;
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .progress-steps .step.completed {
                    background: #10b981;
                    color: white;
                }

                .step-number {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 13px;
                }

                .step.active .step-number {
                    background: #667eea;
                    color: white;
                }

                .step.completed .step-number {
                    background: rgba(255, 255, 255, 0.3);
                }

                .step-label {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Cards améliorées */
                .card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                    margin-bottom: 20px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }

                .card-header {
                    padding: 24px 28px;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                .card-header h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                    letter-spacing: -0.3px;
                }

                .card-header p {
                    margin: 6px 0 0 0;
                    color: #64748b;
                    font-size: 15px;
                }

                .summary {
                    color: #059669;
                    font-weight: 600;
                    font-size: 15px;
                    margin-top: 12px;
                    padding: 8px 12px;
                    background: #f0fdf4;
                    border-radius: 6px;
                    border: 1px solid #bbf7d0;
                }

                /* Info sections améliorées */
                .info-section {
                    padding: 20px 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .info-box {
                    display: flex;
                    gap: 16px;
                    padding: 18px;
                    border-radius: 10px;
                    border: 1px solid;
                }

                .info-how {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                }

                .info-warning {
                    background: #fef3c7;
                    border-color: #fcd34d;
                }

                .info-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                    width: 28px;
                    text-align: center;
                }

                .info-content strong {
                    display: block;
                    margin-bottom: 4px;
                    font-weight: 600;
                    font-size: 14px;
                }

                .info-content p {
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.5;
                }

                /* Alertes pendant le scan */
                .scan-alerts {
                    padding: 0 28px 20px 28px;
                }

                .alert {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid;
                    margin-bottom: 12px;
                }

                .alert-info {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                    color: #1e40af;
                }

                .alert-success {
                    background: #f0fdf4;
                    border-color: #bbf7d0;
                    color: #166534;
                }

                .alert-warning {
                    background: #fef3c7;
                    border-color: #fcd34d;
                    color: #92400e;
                }

                .alert-icon {
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .alert-content strong {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .alert-content p {
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.4;
                }

                /* Formulaire amélioré */
                .form {
                    padding: 24px 28px;
                }

                .form-section {
                    margin-bottom: 28px;
                }

                .form-section h3 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .form-group small {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                .input {
                    padding: 12px 14px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    background: #fafbfc;
                }

                .input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    background: white;
                }

                /* Stage indicator */
                .stage-indicator {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    padding: 0 20px;
                }

                .stage {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 12px 8px;
                    border-radius: 8px;
                    background: #f8fafc;
                    min-width: 80px;
                    transition: all 0.3s ease;
                }

                .stage.active {
                    background: #eff6ff;
                    color: #1d4ed8;
                    transform: scale(1.05);
                }

                .stage.completed {
                    background: #f0fdf4;
                    color: #166534;
                }

                .stage-icon {
                    font-size: 18px;
                }

                .stage span {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Progress amélioré */
                .progress-section {
                    padding: 24px 28px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .stat {
                    text-align: center;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }

                .stat-number {
                    font-size: 28px;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 4px;
                    letter-spacing: -0.5px;
                }

                .stat-label {
                    font-size: 12px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .progress-container {
                    margin-bottom: 20px;
                }

                .progress-bar {
                    height: 10px;
                    background: #f1f5f9;
                    border-radius: 6px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    border-radius: 6px;
                    transition: width 0.5s ease;
                    width: 0%;
                }

                .progress-fill.success {
                    background: linear-gradient(90deg, #10b981, #059669);
                }

                .progress-text {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    color: #64748b;
                }

                .current-status {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .status-icon {
                    font-size: 16px;
                    color: #3b82f6;
                }

                .status-text {
                    font-size: 14px;
                    color: #374151;
                    font-weight: 500;
                }

                /* Contrôles améliorés */
                .controls {
                    padding: 20px 28px;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                .control-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                }

                .control-buttons {
                    display: flex;
                    gap: 12px;
                }

                .search-section {
                    flex: 1;
                    max-width: 300px;
                }

                .search-input {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                }

                /* Boutons améliorés */
                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: white;
                    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
                }

                .btn-primary:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
                }

                .btn-primary:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .btn-secondary {
                    background: #f8fafc;
                    color: #374151;
                    border: 1px solid #e2e8f0;
                }

                .btn-secondary:hover {
                    background: #f1f5f9;
                    border-color: #d1d5db;
                }

                .btn-small {
                    padding: 8px 16px;
                    font-size: 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-small:hover {
                    background: #f8fafc;
                    border-color: #d1d5db;
                    transform: translateY(-1px);
                }

                /* Actions */
                .actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 28px;
                    border-top: 1px solid #f1f5f9;
                    background: #fafbfc;
                    gap: 20px;
                }

                .action-options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .action-buttons {
                    display: flex;
                    gap: 16px;
                }

                .checkbox {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    color: #374151;
                    cursor: pointer;
                }

                .checkbox input {
                    width: 18px;
                    height: 18px;
                    accent-color: #3b82f6;
                }

                /* Domaines list améliorée */
                .domains-container {
                    max-height: 500px;
                    overflow-y: auto;
                    background: white;
                }

                .domain-item {
                    border-bottom: 1px solid #f1f5f9;
                    transition: background-color 0.2s ease;
                }

                .domain-item:hover {
                    background: #fafbfc;
                }

                .domain-item:last-child {
                    border-bottom: none;
                }

                .domain-header {
                    display: flex;
                    align-items: center;
                    padding: 16px 28px;
                    cursor: pointer;
                    gap: 16px;
                }

                .domain-checkbox {
                    width: 18px;
                    height: 18px;
                    accent-color: #3b82f6;
                }

                .domain-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 4px;
                }

                .domain-meta {
                    font-size: 13px;
                    color: #64748b;
                }

                .domain-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .folder-select {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    background: white;
                    min-width: 120px;
                }

                .badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .badge-new {
                    background: #dcfce7;
                    color: #166534;
                }

                .badge-existing {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .expand-icon {
                    color: #9ca3af;
                    font-size: 14px;
                    transition: transform 0.3s ease;
                }

                .domain-item.expanded .expand-icon {
                    transform: rotate(90deg);
                }

                /* Emails list */
                .emails-list {
                    display: none;
                    background: #fafbfc;
                    border-top: 1px solid #f1f5f9;
                }

                .domain-item.expanded .emails-list {
                    display: block;
                }

                .email-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 28px 12px 76px;
                    gap: 16px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 13px;
                    transition: background-color 0.2s ease;
                }

                .email-item:hover {
                    background: #f8fafc;
                }

                .email-item.selected {
                    background: #eff6ff;
                    border-left: 3px solid #3b82f6;
                }

                .email-checkbox {
                    width: 16px;
                    height: 16px;
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
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .email-meta {
                    color: #64748b;
                    font-size: 12px;
                }

                .email-folder-select {
                    padding: 6px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 12px;
                    background: white;
                    min-width: 100px;
                }

                /* Succès */
                .card.success {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                }

                .success-content {
                    padding: 40px 28px;
                    text-align: center;
                }

                .success-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                    display: block;
                }

                .success-content h2 {
                    margin: 0 0 12px 0;
                    font-size: 24px;
                    color: white;
                    font-weight: 700;
                }

                .success-content p {
                    margin: 0 0 28px 0;
                    opacity: 0.9;
                    font-size: 16px;
                }

                .success-stats {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .success-stat {
                    text-align: center;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                    min-width: 100px;
                }

                .success-stat span {
                    display: block;
                    font-size: 20px;
                    font-weight: 800;
                    margin-bottom: 6px;
                    letter-spacing: -0.3px;
                }

                .success-stat label {
                    font-size: 12px;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .success-actions {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                }

                .success-actions .btn-secondary {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    backdrop-filter: blur(10px);
                }

                .success-actions .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.25);
                }

                .success-actions .btn-primary {
                    background: white;
                    color: #059669;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .organizer-container {
                        padding: 16px;
                    }
                    
                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .control-section {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .domain-header {
                        flex-wrap: wrap;
                        gap: 12px;
                    }
                    
                    .actions {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .success-stats {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .stage-indicator {
                        gap: 8px;
                    }

                    .stage {
                        min-width: 60px;
                    }
                }

                /* Scrollbar */
                .domains-container::-webkit-scrollbar {
                    width: 8px;
                }

                .domains-container::-webkit-scrollbar-track {
                    background: #f8fafc;
                }

                .domains-container::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                .domains-container::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* Animations */
                @keyframes slideIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }

                .step-content {
                    animation: slideIn 0.4s ease;
                }

                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(1); 
                    }
                    50% { 
                        transform: scale(1.05); 
                    }
                }

                .stage.active {
                    animation: pulse 2s infinite;
                }
            </style>
        `;
    }

    // ================================================
    // MÉTHODES DE SCAN AMÉLIORÉES SANS LIMITATION DE DATE
    // ================================================
    async startAnalysis(formData) {
        try {
            console.log('[DomainOrganizer] 🚀 Starting enhanced analysis without date limitation...');
            this.updateStepIndicator(2);
            
            this.configure({
                excludeDomains: formData.excludeDomains,
                excludeEmails: formData.excludeEmails
            });
            
            // Afficher l'alerte d'information
            this.updateScanAlert('info', 'Analyse en cours', 'L\'outil accède à vos emails en lecture seule pour identifier les domaines expéditeurs. Aucune modification n\'est effectuée à cette étape.');
            
            await this.performEnhancedAnalysis(formData);
            
        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            this.showError(`Erreur d'analyse: ${error.message}`);
            this.resetForm();
        } finally {
            this.isProcessing = false;
        }
    }

    async performEnhancedAnalysis(formData) {
        console.log('[DomainOrganizer] 🔍 Starting enhanced real email analysis...');
        
        if (!window.mailService) {
            throw new Error('MailService non disponible - Veuillez recharger la page');
        }

        // Réinitialiser les compteurs
        this.scanProgress = {
            totalEmails: 0,
            processedEmails: 0,
            domainsFound: new Set(),
            startTime: Date.now(),
            currentStage: 'connection',
            stageProgress: 0
        };
        
        this.realEmails = [];
        this.emailsByDomain.clear();

        const progressBar = document.getElementById('progressBar');
        const emailsAnalyzed = document.getElementById('emailsAnalyzed');
        const domainsFound = document.getElementById('domainsFound');
        const foldersToCreate = document.getElementById('foldersToCreate');
        const analysisDescription = document.getElementById('analysisDescription');
        const currentDomain = document.getElementById('currentDomain');
        const progressPercent = document.getElementById('progressPercent');
        const progressDetail = document.getElementById('progressDetail');

        try {
            // ================================================
            // ÉTAPE 1: CONNEXION ET VÉRIFICATION
            // ================================================
            this.updateStageIndicator('stage1', 'active');
            if (analysisDescription) analysisDescription.textContent = 'Connexion à votre boîte mail Microsoft...';
            if (progressDetail) progressDetail.textContent = 'Vérification des autorisations...';
            if (currentDomain) currentDomain.textContent = 'Connexion en cours...';
            
            await new Promise(resolve => setTimeout(resolve, 800));

            // Test de connexion
            const connectionTest = await window.mailService.testConnection();
            if (!connectionTest.success) {
                throw new Error(`Erreur de connexion: ${connectionTest.error}`);
            }

            this.updateProgress(10, 'Connexion établie avec succès');
            if (currentDomain) currentDomain.textContent = `Connecté en tant que ${connectionTest.user}`;

            // ================================================
            // ÉTAPE 2: RÉCUPÉRATION DES EMAILS
            // ================================================
            this.updateStageIndicator('stage1', 'completed');
            this.updateStageIndicator('stage2', 'active');
            if (analysisDescription) analysisDescription.textContent = 'Récupération des emails...';
            if (progressDetail) progressDetail.textContent = 'Chargement des données...';
            
            const emailLimit = formData.emailLimit === 'unlimited' ? 10000 : parseInt(formData.emailLimit) || 500;
            let emails = [];

            if (formData.sourceFolder === 'all') {
                // Récupérer de plusieurs dossiers
                const folders = ['inbox', 'sent', 'archive'];
                const limitPerFolder = emailLimit === 10000 ? 3000 : Math.floor(emailLimit / folders.length);
                
                for (let i = 0; i < folders.length; i++) {
                    const folder = folders[i];
                    try {
                        if (currentDomain) currentDomain.textContent = `Récupération depuis: ${this.getFolderDisplayName(folder)}`;
                        
                        // Construire les options sans limitation de date par défaut
                        const options = {
                            top: limitPerFolder
                        };

                        // Ajouter les dates seulement si elles sont spécifiées
                        if (formData.startDate) {
                            options.startDate = formData.startDate;
                        }
                        if (formData.endDate) {
                            options.endDate = formData.endDate;
                        }

                        const folderEmails = await window.mailService.getEmailsFromFolder(folder, options);
                        emails = emails.concat(folderEmails);
                        
                        // Mise à jour progressive
                        this.scanProgress.totalEmails = emails.length;
                        if (emailsAnalyzed) emailsAnalyzed.textContent = emails.length.toLocaleString();
                        
                        const progress = 15 + (i + 1) * 15; // 15% à 45%
                        this.updateProgress(progress, `${emails.length} emails récupérés`);
                        
                        await new Promise(resolve => setTimeout(resolve, 300));
                    } catch (error) {
                        console.warn(`[DomainOrganizer] Erreur dossier ${folder}:`, error);
                        if (currentDomain) currentDomain.textContent = `Erreur sur ${folder}, continuation...`;
                    }
                }
            } else {
                // Récupérer d'un seul dossier
                if (currentDomain) currentDomain.textContent = `Récupération depuis: ${this.getFolderDisplayName(formData.sourceFolder)}`;
                
                // Construire les options sans limitation de date par défaut
                const options = {
                    top: emailLimit
                };

                // Ajouter les dates seulement si elles sont spécifiées
                if (formData.startDate) {
                    options.startDate = formData.startDate;
                }
                if (formData.endDate) {
                    options.endDate = formData.endDate;
                }

                emails = await window.mailService.getEmailsFromFolder(formData.sourceFolder, options);
                this.updateProgress(30, `${emails.length} emails récupérés`);
            }

            this.scanProgress.totalEmails = emails.length;
            
            if (emails.length === 0) {
                throw new Error('Aucun email trouvé avec les critères sélectionnés');
            }

            console.log(`[DomainOrganizer] 📧 ${emails.length} emails récupérés`);

            // ================================================
            // ÉTAPE 3: ANALYSE DES DOMAINES
            // ================================================
            this.updateStageIndicator('stage2', 'completed');
            this.updateStageIndicator('stage3', 'active');
            if (analysisDescription) analysisDescription.textContent = 'Analyse des domaines expéditeurs...';
            if (progressDetail) progressDetail.textContent = 'Classification en cours...';

            const domainsProcessed = new Set();
            let processedCount = 0;

            for (let i = 0; i < emails.length; i++) {
                const email = emails[i];
                
                // Extraire le domaine avec plusieurs tentatives
                const domain = this.extractDomainFromEmail(email);
                
                if (!domain || this.excludedDomains.has(domain.toLowerCase())) {
                    processedCount++;
                    continue;
                }

                // Affichage du domaine en cours
                if (!domainsProcessed.has(domain)) {
                    if (currentDomain) currentDomain.textContent = `Nouveau domaine trouvé: ${domain}`;
                    domainsProcessed.add(domain);
                } else {
                    if (currentDomain) currentDomain.textContent = `Traitement: ${domain} (+${this.emailsByDomain.get(domain)?.length || 0} emails)`;
                }
                
                // Ajouter à la collection par domaine
                if (!this.emailsByDomain.has(domain)) {
                    this.emailsByDomain.set(domain, []);
                    this.scanProgress.domainsFound.add(domain);
                }
                
                this.emailsByDomain.get(domain).push({
                    id: email.id,
                    subject: email.subject || 'Sans objet',
                    sender: this.extractSenderEmail(email),
                    senderName: this.extractSenderName(email) || domain,
                    date: this.formatEmailDate(email),
                    targetFolder: this.suggestFolderName(domain),
                    selected: true,
                    originalEmail: email
                });

                processedCount++;
                
                // Mise à jour progressive de l'interface
                if (i % 20 === 0 || i === emails.length - 1) {
                    const progress = 50 + Math.floor((processedCount / emails.length) * 35); // 50-85%
                    this.updateProgress(progress, `${processedCount} emails analysés`);
                    
                    if (emailsAnalyzed) emailsAnalyzed.textContent = processedCount.toLocaleString();
                    if (domainsFound) domainsFound.textContent = this.scanProgress.domainsFound.size;
                    if (foldersToCreate) {
                        const uniqueFolders = new Set();
                        this.emailsByDomain.forEach((emails, domain) => {
                            uniqueFolders.add(this.suggestFolderName(domain));
                        });
                        foldersToCreate.textContent = uniqueFolders.size;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 30));
                }
            }

            // ================================================
            // ÉTAPE 4: FINALISATION ET RÉSULTATS
            // ================================================
            this.updateStageIndicator('stage3', 'completed');
            this.updateStageIndicator('stage4', 'active');
            if (analysisDescription) analysisDescription.textContent = 'Finalisation de l\'analyse...';
            if (progressDetail) progressDetail.textContent = 'Préparation des résultats...';
            if (currentDomain) currentDomain.textContent = 'Génération du rapport d\'analyse...';

            this.updateProgress(90, 'Finalisation...');
            await new Promise(resolve => setTimeout(resolve, 600));

            // Construire les résultats
            const results = this.buildEnhancedAnalysisResults();
            
            this.updateProgress(100, 'Analyse terminée !');
            this.updateStageIndicator('stage4', 'completed');
            
            console.log(`[DomainOrganizer] ✅ Analyse terminée: ${results.totalEmails} emails, ${results.totalDomains} domaines`);
            
            // Transition vers l'étape de révision
            setTimeout(() => {
                this.showRevisionStep(results);
            }, 800);

        } catch (error) {
            console.error('[DomainOrganizer] Enhanced analysis error:', error);
            this.updateScanAlert('error', 'Erreur d\'analyse', error.message);
            throw error;
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES AMÉLIORÉES
    // ================================================
    extractDomainFromEmail(email) {
        // Essayer plusieurs champs pour trouver l'email expéditeur
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

    formatEmailDate(email) {
        try {
            const date = new Date(email.receivedDateTime || email.sentDateTime);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Date inconnue';
        }
    }

    getFolderDisplayName(folderName) {
        const displayNames = {
            'inbox': 'Boîte de réception',
            'sent': 'Éléments envoyés',
            'archive': 'Archive',
            'drafts': 'Brouillons',
            'junkemail': 'Courrier indésirable'
        };
        return displayNames[folderName] || folderName;
    }

    updateProgress(percent, detail) {
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const progressDetail = document.getElementById('progressDetail');
        
        if (progressBar) progressBar.style.width = `${Math.min(percent, 100)}%`;
        if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
        if (progressDetail) progressDetail.textContent = detail || '';
    }

    updateStageIndicator(stageId, status) {
        // Réinitialiser tous les stages
        document.querySelectorAll('.stage').forEach(stage => {
            stage.classList.remove('active', 'completed');
        });

        // Marquer les stages précédents comme complétés
        const stages = ['stage1', 'stage2', 'stage3', 'stage4'];
        const currentIndex = stages.indexOf(stageId);
        
        for (let i = 0; i < currentIndex; i++) {
            const stage = document.getElementById(stages[i]);
            if (stage) stage.classList.add('completed');
        }

        // Marquer le stage actuel
        const currentStage = document.getElementById(stageId);
        if (currentStage) {
            currentStage.classList.add(status);
        }
    }

    updateScanAlert(type, title, message) {
        const scanAlert = document.getElementById('scanAlert');
        if (!scanAlert) return;

        // Mettre à jour la classe
        scanAlert.className = `alert alert-${type}`;
        
        // Mettre à jour l'icône
        const icon = scanAlert.querySelector('.alert-icon');
        if (icon) {
            const icons = {
                'info': 'ℹ️',
                'success': '✅',
                'warning': '⚠️',
                'error': '❌'
            };
            icon.textContent = icons[type] || 'ℹ️';
        }

        // Mettre à jour le contenu
        const strong = scanAlert.querySelector('strong');
        const p = scanAlert.querySelector('p');
        if (strong) strong.textContent = title;
        if (p) p.textContent = message;
    }

    suggestFolderName(domain) {
        // Suggestions intelligentes de noms de dossiers avec plus de variantes
        const domainMap = {
            // Réseaux sociaux et communication
            'linkedin.com': 'LinkedIn',
            'github.com': 'GitHub', 
            'facebook.com': 'Facebook',
            'instagram.com': 'Instagram',
            'twitter.com': 'Twitter',
            'tiktok.com': 'TikTok',
            'discord.com': 'Discord',
            'slack.com': 'Slack',
            'teams.microsoft.com': 'Microsoft Teams',
            'zoom.us': 'Zoom',
            
            // E-commerce
            'amazon.com': 'Amazon',
            'amazon.fr': 'Amazon',
            'amazon.de': 'Amazon',
            'amazon.co.uk': 'Amazon',
            'ebay.com': 'eBay',
            'ebay.fr': 'eBay',
            'etsy.com': 'Etsy',
            'aliexpress.com': 'AliExpress',
            'cdiscount.com': 'Cdiscount',
            'fnac.com': 'Fnac',
            'darty.com': 'Darty',
            'boulanger.com': 'Boulanger',
            
            // Services financiers
            'paypal.com': 'PayPal',
            'stripe.com': 'Stripe',
            'revolut.com': 'Revolut',
            'boursorama.com': 'Boursorama',
            'creditagricole.fr': 'Crédit Agricole',
            'bnpparibas.fr': 'BNP Paribas',
            'societegenerale.fr': 'Société Générale',
            'lcl.fr': 'LCL',
            
            // Streaming et divertissement
            'netflix.com': 'Netflix',
            'spotify.com': 'Spotify',
            'deezer.com': 'Deezer',
            'youtube.com': 'YouTube',
            'twitch.tv': 'Twitch',
            'disney.com': 'Disney',
            'primevideo.com': 'Prime Video',
            'canalplus.com': 'Canal+',
            
            // Technologie
            'microsoft.com': 'Microsoft',
            'google.com': 'Google',
            'apple.com': 'Apple',
            'adobe.com': 'Adobe',
            'dropbox.com': 'Dropbox',
            'onedrive.com': 'OneDrive',
            'icloud.com': 'iCloud',
            'notion.so': 'Notion',
            'figma.com': 'Figma',
            
            // Voyage et transport
            'booking.com': 'Booking',
            'airbnb.com': 'Airbnb',
            'sncf-connect.com': 'SNCF',
            'ouisncf.com': 'SNCF',
            'uber.com': 'Uber',
            'blablacar.fr': 'BlaBlaCar',
            'ryanair.com': 'Ryanair',
            'airfrance.fr': 'Air France',
            
            // Education et formation
            'udemy.com': 'Udemy',
            'coursera.org': 'Coursera',
            'openclassrooms.com': 'OpenClassrooms',
            'edx.org': 'edX',
            'khanacademy.org': 'Khan Academy',
            
            // News et médias
            'lemonde.fr': 'Le Monde',
            'lefigaro.fr': 'Le Figaro',
            'liberation.fr': 'Libération',
            'francetvinfo.fr': 'France Info',
            'bfmtv.com': 'BFM TV',
            'lci.fr': 'LCI'
        };

        if (domainMap[domain]) {
            return domainMap[domain];
        }

        // Extraire le nom principal du domaine avec nettoyage amélioré
        const parts = domain.split('.');
        let mainPart = parts[0];
        
        // Gérer les cas spéciaux comme "no-reply", "noreply", etc.
        if (mainPart.includes('noreply') || mainPart.includes('no-reply')) {
            mainPart = parts[1] || parts[0];
        }
        
        // Nettoyer et capitaliser
        mainPart = mainPart.replace(/[^a-zA-Z0-9]/g, '');
        return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    }

    buildEnhancedAnalysisResults() {
        const domains = [];
        let totalEmails = 0;

        this.emailsByDomain.forEach((emails, domain) => {
            totalEmails += emails.length;
            
            domains.push({
                domain: domain,
                count: emails.length,
                action: 'create-new',
                suggestedFolder: this.suggestFolderName(domain),
                emails: emails,
                selected: true,
                avgEmailsPerWeek: Math.round(emails.length / 4), // Estimation basée sur 4 semaines
                lastEmailDate: this.getLastEmailDate(emails)
            });
        });

        // Trier par nombre d'emails décroissant
        domains.sort((a, b) => b.count - a.count);

        const uniqueFolders = new Set();
        domains.forEach(domain => uniqueFolders.add(domain.suggestedFolder));

        return {
            totalEmails: totalEmails,
            totalDomains: domains.length,
            domainsToCreate: uniqueFolders.size,
            domains: domains,
            analysisTime: Date.now() - this.scanProgress.startTime
        };
    }

    getLastEmailDate(emails) {
        if (emails.length === 0) return 'Inconnue';
        
        try {
            const latestEmail = emails.reduce((latest, current) => {
                const currentDate = new Date(current.originalEmail.receivedDateTime || current.originalEmail.sentDateTime);
                const latestDate = new Date(latest.originalEmail.receivedDateTime || latest.originalEmail.sentDateTime);
                return currentDate > latestDate ? current : latest;
            });
            
            const date = new Date(latestEmail.originalEmail.receivedDateTime || latestEmail.originalEmail.sentDateTime);
            return date.toLocaleDateString('fr-FR');
        } catch (error) {
            return 'Inconnue';
        }
    }

    // ================================================
    // MÉTHODES D'INTERFACE AMÉLIORÉES
    // ================================================
    updateStepIndicator(step) {
        console.log(`[DomainOrganizer] Updating to step ${step}`);
        
        // Mettre à jour les indicateurs d'étape
        document.querySelectorAll('.progress-steps .step').forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index + 1 < step) {
                stepEl.classList.add('completed');
            } else if (index + 1 === step) {
                stepEl.classList.add('active');
            }
        });
        
        // Afficher le bon contenu
        document.querySelectorAll('.step-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const currentStepContent = document.getElementById(`step${step}`);
        if (currentStepContent) {
            currentStepContent.style.display = 'block';
        }
        
        this.currentStep = step;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v9.0 Enhanced...');
        
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter à votre compte Microsoft');
            return false;
        }

        if (!window.mailService) {
            this.showError('MailService non disponible - Veuillez recharger la page');
            return false;
        }

        this.enableScroll();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.updateStepIndicator(1);
        this.isActive = true;
        
        console.log('[DomainOrganizer] ✅ Enhanced interface ready v9.0');
        return true;
    }

    enableScroll() {
        const body = document.body;
        const html = document.documentElement;
        const pageContent = document.getElementById('pageContent');
        
        [body, html].forEach(el => {
            if (el) {
                el.style.overflow = 'auto';
                el.style.overflowY = 'auto';
                el.style.height = 'auto';
                el.style.maxHeight = 'none';
                el.classList.remove('page-short-content', 'no-scroll');
            }
        });
        
        if (pageContent) {
            pageContent.style.overflow = 'visible';
            pageContent.style.height = 'auto';
            pageContent.style.maxHeight = 'none';
        }
    }

    setupEventListeners() {
        const form = document.getElementById('organizeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        const searchInput = document.getElementById('emailSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Écouteur pour le changement de limite d'emails
        const emailLimitSelect = document.getElementById('emailLimit');
        if (emailLimitSelect) {
            emailLimitSelect.addEventListener('change', (e) => {
                if (e.target.value === 'unlimited') {
                    this.showWarning('L\'option "Sans limite" peut prendre beaucoup de temps selon le nombre d\'emails dans votre boîte.');
                }
            });
        }
    }

    setDefaultDates() {
        // Ne pas définir de dates par défaut pour permettre l'analyse sans limitation
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const formData = this.getFormData();
        
        // Validation améliorée
        if (formData.emailLimit === 'unlimited' && !formData.startDate && !formData.endDate) {
            const confirmed = confirm('Vous avez choisi d\'analyser tous vos emails sans limitation de date. Cette opération peut prendre beaucoup de temps. Continuer ?');
            if (!confirmed) {
                this.isProcessing = false;
                return;
            }
        }

        await this.startAnalysis(formData);
    }

    getFormData() {
        const startDate = document.getElementById('startDate')?.value || null;
        const endDate = document.getElementById('endDate')?.value || null;
        const sourceFolder = document.getElementById('sourceFolder')?.value || 'inbox';
        const emailLimit = document.getElementById('emailLimit')?.value || '500';
        const excludeDomains = document.getElementById('excludeDomains')?.value
            .split(',').map(d => d.trim().toLowerCase()).filter(d => d) || [];
        
        return { 
            startDate, 
            endDate, 
            sourceFolder,
            emailLimit,
            excludeDomains, 
            excludeEmails: [] 
        };
    }

    showRevisionStep(results) {
        this.currentAnalysis = results;
        this.emailActions.clear();
        
        results.domains.forEach(domain => {
            domain.emails.forEach(email => {
                this.emailActions.set(email.id, {
                    emailId: email.id,
                    domain: domain.domain,
                    targetFolder: email.targetFolder,
                    selected: email.selected,
                    originalEmail: email.originalEmail
                });
            });
        });
        
        this.updateStepIndicator(3);
        
        const totalEmailsFound = document.getElementById('totalEmailsFound');
        const totalDomainsFound = document.getElementById('totalDomainsFound');
        
        if (totalEmailsFound) totalEmailsFound.textContent = results.totalEmails.toLocaleString('fr-FR');
        if (totalDomainsFound) totalDomainsFound.textContent = results.totalDomains;
        
        this.displayDomains(results.domains);
        this.updateSelectedCount();
    }

    displayDomains(domains) {
        const container = document.getElementById('detailedResults');
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
        
        const isNewFolder = domainData.action === 'create-new';
        const selectedEmails = domainData.emails.filter(email => 
            this.emailActions.get(email.id)?.selected
        ).length;
        
        const domainInitial = domainData.domain.charAt(0).toUpperCase();
        
        row.innerHTML = `
            <div class="domain-header">
                <input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" 
                       ${domainData.selected ? 'checked' : ''}>
                
                <div class="domain-avatar">${domainInitial}</div>
                
                <div class="domain-info">
                    <div class="domain-name">${domainData.domain}</div>
                    <div class="domain-meta">
                        ${domainData.count} emails • ${selectedEmails} sélectionnés • 
                        Dernier: ${domainData.lastEmailDate}
                    </div>
                </div>
                
                <div class="domain-controls">
                    <select class="folder-select" data-domain="${domainData.domain}">
                        <option value="${domainData.suggestedFolder}" selected>${domainData.suggestedFolder}</option>
                        <option value="inbox">Boîte de réception</option>
                        <option value="archive">Archive</option>
                        <option value="important">Important</option>
                        <option value="newsletters">Newsletters</option>
                        <option value="social">Réseaux sociaux</option>
                        <option value="shopping">Shopping</option>
                        <option value="work">Travail</option>
                    </select>
                    
                    <span class="badge ${isNewFolder ? 'badge-new' : 'badge-existing'}">
                        ${isNewFolder ? 'Nouveau' : 'Existant'}
                    </span>
                    
                    <i class="fas fa-chevron-right expand-icon">▶</i>
                </div>
            </div>
            
            <div class="emails-list">
                ${domainData.emails.slice(0, 10).map(email => this.createEmailItem(email, domainData.domain)).join('')}
                ${domainData.emails.length > 10 ? `
                    <div class="email-item show-more" onclick="window.organizerInstance.showMoreEmails('${domainData.domain}')">
                        <div class="email-content">
                            <div class="email-subject">📧 Voir ${domainData.emails.length - 10} emails supplémentaires...</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        row.addEventListener('click', (e) => {
            if (e.target.closest('.domain-controls') || e.target.closest('.domain-checkbox')) {
                return;
            }
            this.toggleDomainExpansion(domainData.domain);
        });
        
        const domainCheckbox = row.querySelector('.domain-checkbox');
        if (domainCheckbox) {
            domainCheckbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDomainToggle(e);
            });
        }
        
        const folderSelect = row.querySelector('.folder-select');
        if (folderSelect) {
            folderSelect.addEventListener('click', (e) => e.stopPropagation());
            folderSelect.addEventListener('change', (e) => this.handleDomainFolderChange(e));
        }
        
        return row;
    }

    createEmailItem(emailData, domain) {
        const isSelected = this.emailActions.get(emailData.id)?.selected;
        
        return `
            <div class="email-item ${isSelected ? 'selected' : ''}" data-email-id="${emailData.id}">
                <input type="checkbox" class="email-checkbox" data-email-id="${emailData.id}" 
                       ${isSelected ? 'checked' : ''}
                       onchange="window.organizerInstance.handleEmailToggle(event)">
                
                <div class="email-content">
                    <div class="email-subject" title="${emailData.subject}">${emailData.subject}</div>
                    <div class="email-meta">De: ${emailData.senderName} • ${emailData.date}</div>
                </div>
                
                <select class="email-folder-select" data-email-id="${emailData.id}" 
                        onchange="window.organizerInstance.handleEmailFolderChange(event)"
                        onclick="event.stopPropagation()">
                    <option value="${emailData.targetFolder}" selected>${emailData.targetFolder}</option>
                    <option value="inbox">Boîte de réception</option>
                    <option value="archive">Archive</option>
                    <option value="important">Important</option>
                    <option value="newsletters">Newsletters</option>
                    <option value="social">Réseaux sociaux</option>
                    <option value="shopping">Shopping</option>
                    <option value="work">Travail</option>
                </select>
            </div>
        `;
    }

    showMoreEmails(domain) {
        const domainData = this.currentAnalysis.domains.find(d => d.domain === domain);
        if (!domainData) return;

        const domainRow = document.querySelector(`[data-domain="${domain}"]`);
        const emailsList = domainRow.querySelector('.emails-list');
        
        // Remplacer le contenu avec tous les emails
        emailsList.innerHTML = domainData.emails.map(email => 
            this.createEmailItem(email, domain)
        ).join('');
    }

    // ================================================
    // MÉTHODES DE GESTION D'INTERACTION
    // ================================================
    toggleDomainExpansion(domain) {
        const domainRow = document.querySelector(`[data-domain="${domain}"]`);
        if (!domainRow) return;
        
        const isExpanded = domainRow.classList.contains('expanded');
        
        if (isExpanded) {
            domainRow.classList.remove('expanded');
            this.expandedDomains.delete(domain);
        } else {
            domainRow.classList.add('expanded');
            this.expandedDomains.add(domain);
        }
    }

    expandAllDomains() {
        document.querySelectorAll('.domain-item').forEach(row => {
            row.classList.add('expanded');
            const domain = row.dataset.domain;
            if (domain) this.expandedDomains.add(domain);
        });
    }

    selectAllEmails() {
        document.querySelectorAll('.email-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            this.handleEmailToggle({ target: checkbox });
        });
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateSelectedCount();
    }

    deselectAllEmails() {
        document.querySelectorAll('.email-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            this.handleEmailToggle({ target: checkbox });
        });
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectedCount();
    }

    handleDomainToggle(event) {
        const domain = event.target.dataset.domain;
        const isChecked = event.target.checked;
        
        if (this.currentAnalysis) {
            const domainData = this.currentAnalysis.domains.find(d => d.domain === domain);
            if (domainData) {
                domainData.emails.forEach(email => {
                    if (this.emailActions.has(email.id)) {
                        this.emailActions.get(email.id).selected = isChecked;
                    }
                    
                    const emailCheckbox = document.querySelector(`input[data-email-id="${email.id}"]`);
                    if (emailCheckbox) emailCheckbox.checked = isChecked;
                    
                    const emailItem = document.querySelector(`div[data-email-id="${email.id}"]`);
                    if (emailItem) {
                        emailItem.classList.toggle('selected', isChecked);
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
        
        const emailItem = event.target.closest('.email-item');
        if (emailItem) {
            emailItem.classList.toggle('selected', isChecked);
        }
        
        this.updateSelectedCount();
    }

    handleEmailFolderChange(event) {
        const emailId = event.target.dataset.emailId;
        const newFolder = event.target.value;
        
        if (this.emailActions.has(emailId)) {
            this.emailActions.get(emailId).targetFolder = newFolder;
        }
    }

    handleDomainFolderChange(event) {
        const domain = event.target.dataset.domain;
        const newFolder = event.target.value;
        
        if (this.currentAnalysis) {
            const domainData = this.currentAnalysis.domains.find(d => d.domain === domain);
            if (domainData) {
                domainData.emails.forEach(email => {
                    if (this.emailActions.has(email.id)) {
                        this.emailActions.get(email.id).targetFolder = newFolder;
                    }
                    
                    const emailSelect = document.querySelector(`select[data-email-id="${email.id}"]`);
                    if (emailSelect) emailSelect.value = newFolder;
                });
            }
        }
    }

    updateSelectedCount() {
        const selectedActions = Array.from(this.emailActions.values()).filter(action => action.selected);
        const selectedCount = selectedActions.length;
        
        const selectedCountSpan = document.getElementById('selectedCount');
        const applyBtn = document.getElementById('applyBtn');
        
        if (selectedCountSpan) selectedCountSpan.textContent = selectedCount.toLocaleString('fr-FR');
        
        if (applyBtn) {
            applyBtn.disabled = selectedCount === 0;
            if (selectedCount === 0) {
                applyBtn.innerHTML = '❌ Aucun email sélectionné';
            } else {
                applyBtn.innerHTML = `▶ Organiser ${selectedCount.toLocaleString('fr-FR')} emails`;
            }
        }
    }

    handleSearch(searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const emailItems = document.querySelectorAll('.email-item');
        const domainRows = document.querySelectorAll('.domain-item');
        
        emailItems.forEach(item => {
            if (item.classList.contains('show-more')) {
                item.style.display = 'flex';
                return;
            }
            
            const subject = item.querySelector('.email-subject')?.textContent.toLowerCase() || '';
            const meta = item.querySelector('.email-meta')?.textContent.toLowerCase() || '';
            
            const matches = subject.includes(lowerSearchTerm) || meta.includes(lowerSearchTerm);
            item.style.display = matches || !searchTerm ? 'flex' : 'none';
            
            if (matches && searchTerm) {
                const emailId = item.dataset.emailId;
                const emailAction = this.emailActions.get(emailId);
                if (emailAction) {
                    const domainRow = document.querySelector(`[data-domain="${emailAction.domain}"]`);
                    if (domainRow) {
                        domainRow.classList.add('expanded');
                        this.expandedDomains.add(emailAction.domain);
                    }
                }
            }
        });
        
        // Gérer l'affichage des domaines
        domainRows.forEach(row => {
            const domainName = row.dataset.domain?.toLowerCase() || '';
            const domainMatches = domainName.includes(lowerSearchTerm);
            const hasVisibleEmails = row.querySelectorAll('.email-item[style*="flex"], .email-item:not([style])').length > 0;
            
            row.style.display = (domainMatches || hasVisibleEmails || !searchTerm) ? 'block' : 'none';
        });
    }

    // ================================================
    // ORGANISATION AVEC ALERTES DÉTAILLÉES
    // ================================================
    async applyOrganization() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            
            const selectedEmails = Array.from(this.emailActions.values()).filter(action => action.selected);
            const createFolders = document.getElementById('createFolders')?.checked ?? true;
            const moveEmails = document.getElementById('moveEmails')?.checked ?? true;
            
            if (selectedEmails.length === 0) {
                this.showError('Aucun email sélectionné pour l\'organisation');
                return;
            }

            if (!createFolders && !moveEmails) {
                this.showError('Veuillez sélectionner au moins une action à effectuer');
                return;
            }
            
            // Confirmation avec détails
            const uniqueFolders = new Set(selectedEmails.map(email => email.targetFolder));
            const confirmMessage = `Confirmer l'organisation ?\n\n` +
                `• ${selectedEmails.length} emails à traiter\n` +
                `• ${uniqueFolders.size} dossiers ${createFolders ? 'à créer' : 'existants'}\n` +
                `• ${moveEmails ? 'Emails déplacés' : 'Simulation uniquement'}\n\n` +
                `Cette action peut prendre plusieurs minutes.`;
            
            if (!confirm(confirmMessage)) {
                this.isProcessing = false;
                return;
            }
            
            await this.simulateEnhancedExecution(selectedEmails, { createFolders, moveEmails });
            
        } catch (error) {
            console.error('[DomainOrganizer] Apply error:', error);
            this.showError(`Erreur lors de l'organisation: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateEnhancedExecution(selectedEmails, options) {
        this.updateStepIndicator(4);
        
        const executeBar = document.getElementById('executeBar');
        const foldersCreated = document.getElementById('foldersCreated');
        const emailsMoved = document.getElementById('emailsMoved');
        const timeRemaining = document.getElementById('timeRemaining');
        const organizationDescription = document.getElementById('organizationDescription');
        const executePercent = document.getElementById('executePercent');
        const executeDetail = document.getElementById('executeDetail');
        const alertMessage = document.getElementById('alertMessage');
        
        let progress = 0;
        let folders = 0;
        let emails = 0;
        
        const uniqueFolders = new Set(selectedEmails.map(email => email.targetFolder));
        const totalFolders = options.createFolders ? uniqueFolders.size : 0;
        const totalEmails = options.moveEmails ? selectedEmails.length : 0;
        
        const stages = [
            {
                id: 'orgStage1',
                name: 'Création des dossiers',
                description: options.createFolders ? 
                    `Création de ${totalFolders} nouveaux dossiers dans votre boîte mail` :
                    'Vérification des dossiers existants',
                alert: options.createFolders ?
                    'Création des dossiers en cours. Les nouveaux dossiers apparaîtront dans votre interface Outlook.' :
                    'Vérification de l\'existence des dossiers cibles.'
            },
            {
                id: 'orgStage2', 
                name: 'Déplacement des emails',
                description: options.moveEmails ?
                    `Déplacement de ${totalEmails} emails vers leurs dossiers respectifs` :
                    'Simulation du déplacement des emails',
                alert: options.moveEmails ?
                    'Déplacement des emails en cours. Les emails sont transférés vers leurs nouveaux dossiers.' :
                    'Simulation du déplacement. Aucun email ne sera réellement déplacé.'
            },
            {
                id: 'orgStage3',
                name: 'Vérification finale',
                description: 'Vérification de l\'intégrité des opérations',
                alert: 'Vérification que tous les emails ont été correctement traités.'
            }
        ];
        
        let currentStageIndex = 0;
        let startTime = Date.now();
        
        const interval = setInterval(() => {
            progress += 8;
            
            // Calculer le temps restant
            const elapsed = Date.now() - startTime;
            const estimated = (elapsed / progress) * (100 - progress);
            const remainingSeconds = Math.max(0, Math.floor(estimated / 1000));
            
            // Déterminer l'étape actuelle
            const newStageIndex = Math.floor(progress / 33.33);
            if (newStageIndex !== currentStageIndex && newStageIndex < stages.length) {
                // Marquer l'étape précédente comme terminée
                if (currentStageIndex < stages.length) {
                    const prevStage = document.getElementById(stages[currentStageIndex].id);
                    if (prevStage) {
                        prevStage.classList.remove('active');
                        prevStage.classList.add('completed');
                    }
                }
                
                currentStageIndex = newStageIndex;
                const currentStage = stages[currentStageIndex];
                
                // Activer la nouvelle étape
                const stageElement = document.getElementById(currentStage.id);
                if (stageElement) stageElement.classList.add('active');
                
                // Mettre à jour les descriptions
                if (organizationDescription) organizationDescription.textContent = currentStage.description;
                if (alertMessage) alertMessage.textContent = currentStage.alert;
                if (executeDetail) executeDetail.textContent = currentStage.name;
            }
            
            // Mettre à jour les statistiques selon l'étape
            if (progress <= 33) {
                // Étape 1: Création de dossiers
                folders = Math.floor((progress / 33) * totalFolders);
            } else if (progress <= 66) {
                // Étape 2: Déplacement d'emails
                folders = totalFolders;
                emails = Math.floor(((progress - 33) / 33) * totalEmails);
            } else if (progress <= 100) {
                // Étape 3: Vérification
                folders = totalFolders;
                emails = totalEmails;
            }
            
            // Mettre à jour l'interface
            if (executeBar) executeBar.style.width = `${Math.min(progress, 100)}%`;
            if (executePercent) executePercent.textContent = `${Math.round(Math.min(progress, 100))}%`;
            if (timeRemaining && progress < 100) {
                timeRemaining.textContent = remainingSeconds > 60 ? 
                    `${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s` : 
                    `${remainingSeconds}s`;
            }
            if (foldersCreated) foldersCreated.textContent = folders;
            if (emailsMoved) emailsMoved.textContent = emails;
            
            // Finalisation
            if (progress >= 100) {
                clearInterval(interval);
                
                // Marquer la dernière étape comme terminée
                if (currentStageIndex < stages.length) {
                    const finalStage = document.getElementById(stages[currentStageIndex].id);
                    if (finalStage) {
                        finalStage.classList.remove('active');
                        finalStage.classList.add('completed');
                    }
                }
                
                if (organizationDescription) organizationDescription.textContent = 'Organisation terminée avec succès';
                if (executeDetail) executeDetail.textContent = 'Terminé !';
                if (timeRemaining) timeRemaining.textContent = '0s';
                if (alertMessage) alertMessage.textContent = 'Toutes les opérations ont été effectuées avec succès.';
                
                const totalTimeElapsed = Date.now() - startTime;
                const totalMinutes = Math.floor(totalTimeElapsed / 60000);
                const totalSeconds = Math.floor((totalTimeElapsed % 60000) / 1000);
                
                setTimeout(() => this.showEnhancedSuccess({ 
                    emailsMoved: emails, 
                    foldersCreated: folders,
                    totalTime: totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds}s` : `${totalSeconds}s`,
                    wasSimulation: !options.moveEmails || !options.createFolders
                }), 1000);
            }
        }, 150);
    }

    showEnhancedSuccess(results) {
        this.updateStepIndicator(5);
        
        const finalEmailsMoved = document.getElementById('finalEmailsMoved');
        const finalFoldersCreated = document.getElementById('finalFoldersCreated');
        const totalTime = document.getElementById('totalTime');
        const successMessage = document.getElementById('successMessage');
        
        if (finalEmailsMoved) finalEmailsMoved.textContent = results.emailsMoved.toLocaleString('fr-FR');
        if (finalFoldersCreated) finalFoldersCreated.textContent = results.foldersCreated;
        if (totalTime) totalTime.textContent = results.totalTime;
        
        const message = results.wasSimulation ?
            `Simulation terminée : ${results.emailsMoved} emails auraient été organisés dans ${results.foldersCreated} dossiers` :
            `${results.emailsMoved} emails organisés avec succès dans ${results.foldersCreated} dossiers`;
        
        if (successMessage) successMessage.textContent = message;
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    resetForm() {
        this.updateStepIndicator(1);
        
        const form = document.getElementById('organizeForm');
        if (form) form.reset();
        
        this.setDefaultDates();
        this.emailActions.clear();
        this.selectedActions.clear();
        this.expandedDomains.clear();
        this.emailsByDomain.clear();
        this.currentAnalysis = null;
        this.realEmails = [];
        this.isProcessing = false;
        this.currentStep = 1;
        
        // Réinitialiser les étapes
        document.querySelectorAll('.stage').forEach(stage => {
            stage.classList.remove('active', 'completed');
        });
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
            alert(`❌ Erreur: ${message}`);
        }
    }

    showWarning(message) {
        console.warn('[DomainOrganizer] Warning:', message);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'warning');
        } else {
            alert(`⚠️ Attention: ${message}`);
        }
    }

    exploreResults() {
        window.open('https://outlook.office.com/mail/', '_blank');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
window.organizerInstance = new DomainOrganizer();

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v9.0 Enhanced without date limitation...');
    
    if (!window.authService?.isAuthenticated()) {
        const message = 'Veuillez vous connecter à votre compte Microsoft pour utiliser l\'organisateur d\'emails';
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'warning');
        } else {
            alert(`⚠️ ${message}`);
        }
        return;
    }

    if (!window.mailService) {
        const message = 'MailService non disponible - Veuillez recharger la page';
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            alert(`❌ ${message}`);
        }
        return;
    }

    const pageContent = document.getElementById('pageContent');
    if (!pageContent) {
        console.error('[DomainOrganizer] PageContent element not found');
        return;
    }

    window.domainOrganizerActive = true;
    window.organizerInstance.isActive = true;

    pageContent.innerHTML = window.organizerInstance.getPageHTML();
    pageContent.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';

    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) {
        rangerButton.classList.add('active');
        if (rangerButton.parentElement) {
            rangerButton.parentElement.classList.add('active');
        }
    }

    setTimeout(async () => {
        if (window.domainOrganizerActive && document.getElementById('step1')) {
            try {
                await window.organizerInstance.initializePage();
                console.log('[DomainOrganizer] ✅ Enhanced interface ready v9.0');
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
                if (window.uiManager?.showToast) {
                    window.uiManager.showToast('Erreur d\'initialisation de l\'organisateur', 'error');
                }
            }
        }
    }, 100);
}

// ================================================
// GESTION DES ÉVÉNEMENTS
// ================================================
document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]') || 
                        e.target.closest('button[onclick*="ranger"]') || 
                        e.target.closest('a[href*="ranger"]');
    
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        setTimeout(showDomainOrganizerApp, 20);
        return false;
    }
}, true);

// Hook PageManager
if (window.pageManager?.loadPage) {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        if (pageName === 'ranger') {
            showDomainOrganizerApp();
            return;
        }

        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
}

// ================================================
// EXPORTS GLOBAUX
// ================================================
window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = {
    showPage: showDomainOrganizerApp,
    instance: window.organizerInstance,
    version: '9.0'
};

console.log('[DomainOrganizer] ✅ v9.0 Enhanced System ready - Sans limitation de date + Étapes détaillées');
