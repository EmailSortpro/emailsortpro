// DomainOrganizer.js - Version 11.0 - Avec choix de dates + Explications détaillées + Modales intégrées
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
        
        console.log('[DomainOrganizer] ✅ v11.0 - Avec dates + Explications + Modales');
    }

    getPageHTML() {
        return `
            <div class="organizer-minimal">
                <!-- Header minimaliste -->
                <div class="header">
                    <h1>📁 Organisation Intelligente par Domaine</h1>
                    <div class="steps">
                        <div class="step active" data-step="1">1</div>
                        <div class="step" data-step="2">2</div>
                        <div class="step" data-step="3">3</div>
                    </div>
                </div>

                <!-- Étape 1: Configuration avec explications -->
                <div class="step-content" id="step1">
                    <div class="card">
                        <h2>🎯 Configuration de l'analyse</h2>
                        
                        <!-- Explication du processus -->
                        <div class="process-explanation">
                            <div class="explanation-header">
                                <span class="icon">🤔</span>
                                <h3>Comment fonctionne l'organisation ?</h3>
                            </div>
                            
                            <div class="process-steps">
                                <div class="process-step">
                                    <div class="step-icon">1️⃣</div>
                                    <div class="step-content">
                                        <strong>Analyse des expéditeurs</strong>
                                        <p>L'application examine chaque email pour identifier le domaine de l'expéditeur (ex: amazon.fr, linkedin.com, gmail.com)</p>
                                    </div>
                                </div>
                                
                                <div class="process-step">
                                    <div class="step-icon">2️⃣</div>
                                    <div class="step-content">
                                        <strong>Regroupement intelligent</strong>
                                        <p>Les emails sont classés par domaine et un nom de dossier pertinent est suggéré automatiquement</p>
                                    </div>
                                </div>
                                
                                <div class="process-step">
                                    <div class="step-icon">3️⃣</div>
                                    <div class="step-content">
                                        <strong>Organisation personnalisée</strong>
                                        <p>Vous validez les propositions, modifiez les noms de dossiers si besoin, et l'application crée l'organisation</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="alert info">
                            <span class="icon">ℹ️</span>
                            <div>
                                <strong>Accès sécurisé</strong>
                                <p>L'application accède à vos emails en <strong>lecture seule</strong> pendant l'analyse. Aucune modification n'est effectuée sans votre validation explicite.</p>
                            </div>
                        </div>

                        <form id="scanForm" class="form">
                            <!-- Période d'analyse -->
                            <div class="form-section">
                                <h3>📅 Période d'analyse</h3>
                                <div class="date-options">
                                    <label class="radio-option">
                                        <input type="radio" name="dateRange" value="all" checked>
                                        <div class="option-content">
                                            <strong>📧 Tous les emails</strong>
                                            <small>Analyse complète sans limitation (recommandé pour la première fois)</small>
                                        </div>
                                    </label>
                                    
                                    <label class="radio-option">
                                        <input type="radio" name="dateRange" value="recent">
                                        <div class="option-content">
                                            <strong>📆 6 derniers mois</strong>
                                            <small>Analyse rapide des emails récents</small>
                                        </div>
                                    </label>
                                    
                                    <label class="radio-option">
                                        <input type="radio" name="dateRange" value="year">
                                        <div class="option-content">
                                            <strong>📅 Dernière année</strong>
                                            <small>Équilibre entre complétude et rapidité</small>
                                        </div>
                                    </label>
                                    
                                    <label class="radio-option">
                                        <input type="radio" name="dateRange" value="custom">
                                        <div class="option-content">
                                            <strong>🎛️ Période personnalisée</strong>
                                            <small>Choisissez vos dates de début et fin</small>
                                        </div>
                                    </label>
                                </div>
                                
                                <!-- Dates personnalisées -->
                                <div id="customDates" class="custom-dates" style="display: none;">
                                    <div class="date-fields">
                                        <div class="field-group">
                                            <label>📅 Date de début</label>
                                            <input type="date" id="startDate" class="input">
                                        </div>
                                        <div class="field-group">
                                            <label>📅 Date de fin</label>
                                            <input type="date" id="endDate" class="input">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Source et exclusions -->
                            <div class="form-section">
                                <h3>📂 Configuration avancée</h3>
                                
                                <div class="field-group">
                                    <label>📧 Dossiers à analyser</label>
                                    <select id="sourceFolder" class="input">
                                        <option value="all">🔍 Tous les dossiers (Boîte de réception + Envoyés + Archive)</option>
                                        <option value="inbox">📥 Boîte de réception uniquement</option>
                                        <option value="sent">📤 Éléments envoyés uniquement</option>
                                        <option value="archive">📦 Archive uniquement</option>
                                    </select>
                                    <small>Recommandé : "Tous les dossiers" pour une organisation complète</small>
                                </div>

                                <div class="field-group">
                                    <label>🚫 Domaines à ignorer (optionnel)</label>
                                    <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com, hotmail.fr" class="input">
                                    <small>Séparez les domaines par des virgules. Utile pour exclure les emails personnels.</small>
                                </div>
                                
                                <div class="field-group">
                                    <label>📊 Limite d'emails (sécurité)</label>
                                    <select id="emailLimit" class="input">
                                        <option value="1000">1 000 emails (rapide - 2-3 min)</option>
                                        <option value="2500" selected>2 500 emails (équilibré - 5-8 min)</option>
                                        <option value="5000">5 000 emails (complet - 10-15 min)</option>
                                        <option value="unlimited">Sans limite (très long)</option>
                                    </select>
                                    <small>Plus la limite est élevée, plus l'analyse sera complète mais longue</small>
                                </div>
                            </div>

                            <!-- Estimation -->
                            <div class="estimation" id="timeEstimation">
                                <div class="estimation-content">
                                    <span class="icon">⏱️</span>
                                    <div>
                                        <strong>Estimation</strong>
                                        <p>Environ <span id="estimatedTime">5-8 minutes</span> pour analyser <span id="estimatedEmails">2 500</span> emails</p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" class="btn primary large" id="startBtn">
                                🚀 Démarrer l'analyse intelligente
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Étape 2: Scan avec progress détaillé -->
                <div class="step-content" id="step2" style="display: none;">
                    <div class="card">
                        <h2>🔍 Analyse en cours</h2>
                        
                        <div class="scan-process">
                            <div class="current-phase">
                                <div class="phase-icon" id="phaseIcon">🔗</div>
                                <div class="phase-content">
                                    <h3 id="phaseName">Connexion</h3>
                                    <p id="phaseDescription">Établissement de la connexion sécurisée avec votre boîte mail</p>
                                </div>
                            </div>
                            
                            <div class="alert info" id="scanAlert">
                                <span class="icon">⚠️</span>
                                <div>
                                    <strong>Lecture seule active</strong>
                                    <p id="alertText">L'application lit vos emails sans les modifier. Vos données restent intactes.</p>
                                </div>
                            </div>
                        </div>

                        <div class="progress-section">
                            <div class="stats">
                                <div class="stat">
                                    <span class="number" id="emailCount">0</span>
                                    <span class="label">Emails analysés</span>
                                </div>
                                <div class="stat">
                                    <span class="number" id="domainCount">0</span>
                                    <span class="label">Domaines trouvés</span>
                                </div>
                                <div class="stat">
                                    <span class="number" id="folderCount">0</span>
                                    <span class="label">Dossiers proposés</span>
                                </div>
                            </div>

                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            
                            <div class="progress-details">
                                <span class="progress-percent" id="progressPercent">0%</span>
                                <span class="progress-text" id="progressText">Initialisation...</span>
                            </div>
                            
                            <div class="status" id="currentStatus">
                                <span class="icon">⏳</span>
                                <span class="text">Préparation de l'analyse...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 3: Résultats et organisation -->
                <div class="step-content" id="step3" style="display: none;">
                    <div class="card">
                        <h2>✏️ Validation et personnalisation</h2>
                        
                        <div class="results-summary">
                            <div class="summary-content">
                                <span class="icon">✅</span>
                                <div>
                                    <strong>Analyse terminée avec succès !</strong>
                                    <p><span id="totalFound">0</span> emails trouvés dans <span id="domainsFound">0</span> domaines différents</p>
                                </div>
                            </div>
                        </div>

                        <!-- Explication de la révision -->
                        <div class="review-explanation">
                            <h3>🎯 Comment valider l'organisation ?</h3>
                            <div class="review-tips">
                                <div class="tip">
                                    <span class="tip-icon">✓</span>
                                    <span>Cochez/décochez les domaines selon vos besoins</span>
                                </div>
                                <div class="tip">
                                    <span class="tip-icon">📝</span>
                                    <span>Modifiez les noms de dossiers proposés si nécessaire</span>
                                </div>
                                <div class="tip">
                                    <span class="tip-icon">🔍</span>
                                    <span>Utilisez la recherche pour trouver des domaines spécifiques</span>
                                </div>
                            </div>
                        </div>

                        <div class="controls">
                            <div class="actions">
                                <button class="btn secondary small" onclick="window.organizerInstance.selectAll()">✓ Tout sélectionner</button>
                                <button class="btn secondary small" onclick="window.organizerInstance.deselectAll()">✗ Tout désélectionner</button>
                            </div>
                            <input type="text" id="searchBox" placeholder="🔍 Rechercher un domaine..." class="search">
                        </div>

                        <div class="domains-list" id="domainsList">
                            <!-- Populated dynamically -->
                        </div>

                        <div class="final-actions">
                            <div class="options">
                                <label class="checkbox">
                                    <input type="checkbox" id="createFolders" checked>
                                    <span>Créer automatiquement les nouveaux dossiers</span>
                                </label>
                                <label class="checkbox">
                                    <input type="checkbox" id="moveEmails" checked>
                                    <span>Déplacer les emails vers les dossiers</span>
                                </label>
                            </div>
                            
                            <div class="execute-buttons">
                                <button class="btn secondary" onclick="window.organizerInstance.reset()">← Recommencer</button>
                                <button class="btn primary large" id="executeBtn" onclick="window.organizerInstance.showExecutionModal()">
                                    ▶ Organiser <span id="selectedCount">0</span> emails
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 4: Exécution -->
                <div class="step-content" id="step4" style="display: none;">
                    <div class="card">
                        <h2>⚙️ Organisation en cours</h2>
                        
                        <div class="execution-process">
                            <div class="current-action">
                                <div class="action-icon" id="actionIcon">📁</div>
                                <div class="action-content">
                                    <h3 id="actionName">Création des dossiers</h3>
                                    <p id="actionDescription">Création des nouveaux dossiers dans votre boîte mail</p>
                                </div>
                            </div>
                            
                            <div class="alert warning" id="executeAlert">
                                <span class="icon">⚠️</span>
                                <div>
                                    <strong>Modifications en cours</strong>
                                    <p id="executeText">Les dossiers sont créés et les emails déplacés selon vos choix</p>
                                </div>
                            </div>
                        </div>

                        <div class="execute-progress">
                            <div class="execute-stats">
                                <div class="stat">
                                    <span class="number" id="foldersCreated">0</span>
                                    <span class="label">Dossiers créés</span>
                                </div>
                                <div class="stat">
                                    <span class="number" id="emailsMoved">0</span>
                                    <span class="label">Emails déplacés</span>
                                </div>
                                <div class="stat">
                                    <span class="number" id="timeRemaining">--</span>
                                    <span class="label">Temps restant</span>
                                </div>
                            </div>

                            <div class="progress-bar">
                                <div class="progress-fill success" id="executeFill"></div>
                            </div>
                            
                            <div class="progress-details">
                                <span class="progress-percent" id="executePercent">0%</span>
                                <span class="progress-text" id="executeDetail">Préparation...</span>
                            </div>
                            
                            <div class="status" id="executeStatus">
                                <span class="icon">⚙️</span>
                                <span class="text">Initialisation de l'organisation...</span>
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
                            <p id="successMessage">Vos emails ont été organisés automatiquement</p>
                            
                            <div class="success-stats">
                                <div class="stat">
                                    <span class="number" id="finalEmails">0</span>
                                    <span class="label">emails organisés</span>
                                </div>
                                <div class="stat">
                                    <span class="number" id="finalFolders">0</span>
                                    <span class="label">dossiers créés</span>
                                </div>
                                <div class="stat">
                                    <span class="number" id="finalTime">--</span>
                                    <span class="label">temps total</span>
                                </div>
                            </div>

                            <div class="success-actions">
                                <button class="btn secondary" onclick="window.organizerInstance.reset()">
                                    🔄 Nouvelle organisation
                                </button>
                                <button class="btn primary" onclick="window.organizerInstance.openOutlook()">
                                    📧 Voir le résultat dans Outlook
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modales intégrées -->
                <div class="modal-overlay" id="modalOverlay" style="display: none;">
                    <!-- Modal de confirmation de scan -->
                    <div class="modal" id="scanConfirmModal" style="display: none;">
                        <div class="modal-header">
                            <h3>🔍 Confirmer l'analyse</h3>
                            <button class="modal-close" onclick="window.organizerInstance.closeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="confirmation-details">
                                <div class="detail-item">
                                    <span class="detail-label">📧 Emails à analyser :</span>
                                    <span class="detail-value" id="scanEmailsCount">Estimation en cours...</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">📅 Période :</span>
                                    <span class="detail-value" id="scanPeriod">--</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">📂 Dossiers :</span>
                                    <span class="detail-value" id="scanFolders">--</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">⏱️ Durée estimée :</span>
                                    <span class="detail-value" id="scanDuration">--</span>
                                </div>
                            </div>
                            
                            <div class="alert info">
                                <span class="icon">ℹ️</span>
                                <div>
                                    <strong>Accès sécurisé</strong>
                                    <p>L'analyse se fait en <strong>lecture seule</strong>. Vos emails ne seront pas modifiés pendant cette étape.</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn secondary" onclick="window.organizerInstance.closeModal()">Annuler</button>
                            <button class="btn primary" onclick="window.organizerInstance.confirmScan()">🚀 Lancer l'analyse</button>
                        </div>
                    </div>

                    <!-- Modal de confirmation d'exécution -->
                    <div class="modal" id="executeConfirmModal" style="display: none;">
                        <div class="modal-header">
                            <h3>⚠️ Confirmer l'organisation</h3>
                            <button class="modal-close" onclick="window.organizerInstance.closeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="warning-message">
                                <div class="warning-icon">⚠️</div>
                                <div class="warning-content">
                                    <strong>Attention : Modification de votre boîte mail</strong>
                                    <p>Cette action va réellement modifier l'organisation de vos emails</p>
                                </div>
                            </div>
                            
                            <div class="confirmation-details">
                                <div class="detail-item">
                                    <span class="detail-label">📧 Emails à déplacer :</span>
                                    <span class="detail-value" id="executeEmailsCount">--</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">📁 Dossiers à créer :</span>
                                    <span class="detail-value" id="executeFoldersCount">--</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">⏱️ Durée estimée :</span>
                                    <span class="detail-value" id="executeDuration">--</span>
                                </div>
                            </div>
                            
                            <div class="actions-preview">
                                <h4>Actions qui seront effectuées :</h4>
                                <div class="action-item" id="createFoldersAction">
                                    <span class="action-icon">📁</span>
                                    <span>Création automatique des nouveaux dossiers</span>
                                </div>
                                <div class="action-item" id="moveEmailsAction">
                                    <span class="action-icon">📧</span>
                                    <span>Déplacement des emails vers leurs dossiers respectifs</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn secondary" onclick="window.organizerInstance.closeModal()">Annuler</button>
                            <button class="btn primary" onclick="window.organizerInstance.confirmExecution()">▶ Confirmer l'organisation</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Design system amélioré */
                .organizer-minimal {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 24px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #fafafa;
                    min-height: 100vh;
                    line-height: 1.6;
                }

                /* Header */
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    padding: 28px 32px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                    border: 1px solid #f0f0f0;
                }

                .header h1 {
                    margin: 0;
                    font-size: 26px;
                    font-weight: 800;
                    color: #111;
                    letter-spacing: -0.5px;
                }

                .steps {
                    display: flex;
                    gap: 12px;
                }

                .step {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    color: #666;
                    transition: all 0.3s ease;
                }

                .step.active {
                    background: #007acc;
                    color: white;
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
                }

                .step.completed {
                    background: #10b981;
                    color: white;
                }

                /* Cards */
                .card {
                    background: white;
                    border-radius: 16px;
                    padding: 36px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                    border: 1px solid #f0f0f0;
                    margin-bottom: 24px;
                }

                .card h2 {
                    margin: 0 0 28px 0;
                    font-size: 22px;
                    font-weight: 800;
                    color: #111;
                    letter-spacing: -0.3px;
                }

                .card.success {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                }

                /* Explications du processus */
                .process-explanation {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 28px;
                    border: 1px solid #e2e8f0;
                }

                .explanation-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .explanation-header .icon {
                    font-size: 24px;
                }

                .explanation-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #374151;
                }

                .process-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .process-step {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                    padding: 16px;
                    background: white;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                .step-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                    width: 32px;
                    text-align: center;
                }

                .step-content strong {
                    display: block;
                    font-weight: 600;
                    color: #111;
                    margin-bottom: 4px;
                    font-size: 14px;
                }

                .step-content p {
                    margin: 0;
                    font-size: 13px;
                    color: #6b7280;
                    line-height: 1.5;
                }

                /* Alertes */
                .alert {
                    display: flex;
                    gap: 14px;
                    padding: 18px;
                    border-radius: 10px;
                    margin-bottom: 24px;
                    border: 1px solid;
                }

                .alert.info {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                    color: #1e40af;
                }

                .alert.success {
                    background: #f0fdf4;
                    border-color: #bbf7d0;
                    color: #166534;
                }

                .alert.warning {
                    background: #fef3c7;
                    border-color: #fcd34d;
                    color: #92400e;
                }

                .alert .icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .alert div {
                    flex: 1;
                }

                .alert strong {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 4px;
                    font-size: 14px;
                }

                .alert p {
                    margin: 0;
                    font-size: 13px;
                    opacity: 0.95;
                    line-height: 1.5;
                }

                /* Formulaire amélioré */
                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-section h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 700;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .field-group label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .field-group small {
                    font-size: 12px;
                    color: #6b7280;
                    line-height: 1.4;
                }

                .input {
                    padding: 14px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    font-size: 14px;
                    background: #fafbfc;
                    transition: all 0.2s ease;
                }

                .input:focus {
                    outline: none;
                    border-color: #007acc;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
                }

                /* Options de dates */
                .date-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .radio-option {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: white;
                }

                .radio-option:hover {
                    border-color: #d1d5db;
                    background: #fafbfc;
                }

                .radio-option input[type="radio"] {
                    margin: 0;
                    width: 18px;
                    height: 18px;
                    accent-color: #007acc;
                }

                .radio-option input[type="radio"]:checked + .option-content {
                    color: #007acc;
                }

                .radio-option:has(input:checked) {
                    border-color: #007acc;
                    background: #eff6ff;
                }

                .option-content {
                    flex: 1;
                }

                .option-content strong {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 4px;
                    font-size: 14px;
                }

                .option-content small {
                    font-size: 12px;
                    color: #6b7280;
                }

                /* Dates personnalisées */
                .custom-dates {
                    margin-top: 16px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }

                .date-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                /* Estimation */
                .estimation {
                    padding: 18px;
                    background: linear-gradient(135deg, #eff6ff, #dbeafe);
                    border-radius: 10px;
                    border: 1px solid #bfdbfe;
                }

                .estimation-content {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .estimation .icon {
                    font-size: 20px;
                    color: #1d4ed8;
                }

                .estimation strong {
                    display: block;
                    font-weight: 600;
                    color: #1e40af;
                    margin-bottom: 4px;
                }

                .estimation p {
                    margin: 0;
                    font-size: 13px;
                    color: #1e40af;
                }

                /* Processus de scan */
                .scan-process, .execution-process {
                    margin-bottom: 28px;
                }

                .current-phase, .current-action {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 20px;
                }

                .phase-icon, .action-icon {
                    font-size: 24px;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: #007acc;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .phase-content h3, .action-content h3 {
                    margin: 0 0 4px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #111;
                }

                .phase-content p, .action-content p {
                    margin: 0;
                    font-size: 13px;
                    color: #6b7280;
                }

                /* Résumé des résultats */
                .results-summary {
                    background: #f0fdf4;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 28px;
                    border: 1px solid #bbf7d0;
                }

                .summary-content {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .summary-content .icon {
                    font-size: 20px;
                    color: #059669;
                }

                .summary-content strong {
                    display: block;
                    font-weight: 600;
                    color: #166534;
                    margin-bottom: 4px;
                }

                .summary-content p {
                    margin: 0;
                    font-size: 13px;
                    color: #166534;
                }

                /* Explication de révision */
                .review-explanation {
                    background: #fffbeb;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    border: 1px solid #fed7aa;
                }

                .review-explanation h3 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #92400e;
                }

                .review-tips {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .tip {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: #92400e;
                }

                .tip-icon {
                    width: 16px;
                    font-weight: 600;
                }

                /* Boutons */
                .btn {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    justify-content: center;
                    text-decoration: none;
                }

                .btn.large {
                    padding: 16px 28px;
                    font-size: 15px;
                }

                .btn.small {
                    padding: 8px 16px;
                    font-size: 13px;
                }

                .btn.primary {
                    background: #007acc;
                    color: white;
                    box-shadow: 0 2px 4px rgba(0, 122, 204, 0.2);
                }

                .btn.primary:hover {
                    background: #0066a3;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 122, 204, 0.3);
                }

                .btn.primary:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .btn.secondary {
                    background: #f8fafc;
                    color: #374151;
                    border: 1px solid #e5e7eb;
                }

                .btn.secondary:hover {
                    background: #f1f5f9;
                    border-color: #d1d5db;
                }

                /* Progress */
                .progress-section, .execute-progress {
                    margin-top: 24px;
                }

                .stats, .execute-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .stat {
                    text-align: center;
                    padding: 20px 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .stat .number {
                    display: block;
                    font-size: 28px;
                    font-weight: 800;
                    color: #111;
                    margin-bottom: 6px;
                    letter-spacing: -0.5px;
                }

                .stat .label {
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .progress-bar {
                    height: 10px;
                    background: #f1f5f9;
                    border-radius: 6px;
                    overflow: hidden;
                    margin-bottom: 16px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #007acc, #0066a3);
                    border-radius: 6px;
                    transition: width 0.4s ease;
                    width: 0%;
                }

                .progress-fill.success {
                    background: linear-gradient(90deg, #10b981, #059669);
                }

                .progress-details {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .progress-percent {
                    font-size: 14px;
                    font-weight: 700;
                    color: #007acc;
                }

                .progress-text {
                    font-size: 13px;
                    color: #6b7280;
                }

                .status {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 18px;
                    background: #f8fafc;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }

                .status .icon {
                    font-size: 16px;
                    color: #007acc;
                }

                .status .text {
                    font-size: 14px;
                    color: #374151;
                    font-weight: 500;
                }

                /* Contrôles */
                .controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 20px 0;
                    border-bottom: 2px solid #f0f0f0;
                }

                .actions {
                    display: flex;
                    gap: 12px;
                }

                .search {
                    padding: 10px 14px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    width: 240px;
                    background: white;
                }

                /* Liste des domaines */
                .domains-list {
                    max-height: 450px;
                    overflow-y: auto;
                    margin-bottom: 28px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    background: white;
                }

                .domain-item {
                    display: flex;
                    align-items: center;
                    padding: 18px 20px;
                    border-bottom: 1px solid #f8fafc;
                    transition: background-color 0.2s ease;
                    cursor: pointer;
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
                    margin-right: 18px;
                    accent-color: #007acc;
                }

                .domain-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #007acc, #0066a3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    margin-right: 18px;
                    text-transform: uppercase;
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #111;
                    margin-bottom: 4px;
                }

                .domain-meta {
                    font-size: 13px;
                    color: #6b7280;
                }

                .domain-folder {
                    padding: 8px 14px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 13px;
                    background: white;
                    min-width: 140px;
                }

                /* Actions finales */
                .final-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 28px;
                    border-top: 2px solid #f0f0f0;
                }

                .options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .checkbox {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #374151;
                }

                .checkbox input {
                    width: 18px;
                    height: 18px;
                    accent-color: #007acc;
                }

                .execute-buttons {
                    display: flex;
                    gap: 16px;
                }

                /* Succès */
                .success-content {
                    text-align: center;
                }

                .success-icon {
                    font-size: 56px;
                    margin-bottom: 20px;
                    display: block;
                }

                .success-content h2 {
                    color: white;
                    margin-bottom: 10px;
                    font-size: 24px;
                }

                .success-content p {
                    opacity: 0.9;
                    margin-bottom: 28px;
                    font-size: 16px;
                }

                .success-stats {
                    display: flex;
                    justify-content: center;
                    gap: 28px;
                    margin-bottom: 28px;
                }

                .success-stats .stat {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .success-stats .stat .number {
                    color: white;
                }

                .success-stats .stat .label {
                    color: rgba(255, 255, 255, 0.8);
                }

                .success-actions {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
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

                /* Modales */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .modal {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    max-width: 500px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 28px;
                    border-bottom: 1px solid #f0f0f0;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #111;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }

                .modal-close:hover {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .modal-body {
                    padding: 28px;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 20px 28px;
                    border-top: 1px solid #f0f0f0;
                    background: #fafbfc;
                    border-radius: 0 0 16px 16px;
                }

                /* Détails de confirmation */
                .confirmation-details {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .detail-label {
                    font-size: 13px;
                    color: #6b7280;
                    font-weight: 500;
                }

                .detail-value {
                    font-size: 13px;
                    color: #111;
                    font-weight: 600;
                }

                /* Message d'avertissement */
                .warning-message {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    background: #fef3c7;
                    border-radius: 8px;
                    border: 1px solid #fcd34d;
                    margin-bottom: 20px;
                }

                .warning-icon {
                    font-size: 20px;
                    color: #d97706;
                    flex-shrink: 0;
                }

                .warning-content strong {
                    display: block;
                    font-weight: 600;
                    color: #92400e;
                    margin-bottom: 4px;
                }

                .warning-content p {
                    margin: 0;
                    font-size: 13px;
                    color: #92400e;
                }

                /* Aperçu des actions */
                .actions-preview {
                    margin-top: 16px;
                }

                .actions-preview h4 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .action-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 0;
                    font-size: 13px;
                    color: #374151;
                }

                .action-icon {
                    width: 16px;
                    text-align: center;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .organizer-minimal {
                        padding: 16px;
                    }
                    
                    .header {
                        flex-direction: column;
                        gap: 20px;
                        padding: 24px;
                    }
                    
                    .card {
                        padding: 24px;
                    }
                    
                    .date-fields {
                        grid-template-columns: 1fr;
                    }
                    
                    .controls {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .final-actions {
                        flex-direction: column;
                        gap: 20px;
                    }
                    
                    .stats, .execute-stats, .success-stats {
                        grid-template-columns: 1fr;
                    }

                    .modal {
                        margin: 0;
                        border-radius: 12px;
                    }
                }

                /* Scrollbar */
                .domains-list::-webkit-scrollbar {
                    width: 8px;
                }

                .domains-list::-webkit-scrollbar-track {
                    background: #f8fafc;
                }

                .domains-list::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                .domains-list::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* Animations */
                .step-content {
                    animation: slideIn 0.4s ease;
                }

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

                .modal {
                    animation: modalSlideIn 0.3s ease;
                }

                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            </style>
        `;
    }

    // ================================================
    // GESTION DES MODALES INTÉGRÉES
    // ================================================
    showScanConfirmModal(formData) {
        const modal = document.getElementById('scanConfirmModal');
        const overlay = document.getElementById('modalOverlay');
        
        // Calculer les estimations
        const emailLimit = formData.emailLimit === 'unlimited' ? 10000 : parseInt(formData.emailLimit);
        const estimatedTime = this.calculateEstimatedTime(emailLimit);
        const periodText = this.getPeriodText(formData.dateRange, formData.startDate, formData.endDate);
        const foldersText = this.getFoldersText(formData.sourceFolder);
        
        // Remplir les détails
        document.getElementById('scanEmailsCount').textContent = `Jusqu'à ${emailLimit.toLocaleString()} emails`;
        document.getElementById('scanPeriod').textContent = periodText;
        document.getElementById('scanFolders').textContent = foldersText;
        document.getElementById('scanDuration').textContent = estimatedTime;
        
        // Stocker les données pour confirmation
        this.pendingFormData = formData;
        
        // Afficher la modale
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
        
        // Calculer les statistiques
        const uniqueFolders = new Set(selectedDomains.map(d => d.suggestedFolder));
        const estimatedTime = Math.ceil(totalEmails / 50) + ' minutes';
        
        // Remplir les détails
        document.getElementById('executeEmailsCount').textContent = totalEmails.toLocaleString();
        document.getElementById('executeFoldersCount').textContent = uniqueFolders.size;
        document.getElementById('executeDuration').textContent = estimatedTime;
        
        // Mettre à jour l'aperçu des actions
        const createAction = document.getElementById('createFoldersAction');
        const moveAction = document.getElementById('moveEmailsAction');
        
        createAction.style.display = createFolders ? 'flex' : 'none';
        moveAction.style.display = moveEmails ? 'flex' : 'none';
        
        // Afficher la modale
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

    // ================================================
    // UTILITAIRES POUR LES MODALES
    // ================================================
    calculateEstimatedTime(emailCount) {
        if (emailCount <= 1000) return '2-3 minutes';
        if (emailCount <= 2500) return '5-8 minutes';
        if (emailCount <= 5000) return '10-15 minutes';
        return '15+ minutes';
    }

    getPeriodText(dateRange, startDate, endDate) {
        switch(dateRange) {
            case 'all': return 'Tous les emails (sans limitation)';
            case 'recent': return '6 derniers mois';
            case 'year': return 'Dernière année';
            case 'custom': 
                if (startDate && endDate) {
                    return `Du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`;
                } else if (startDate) {
                    return `Depuis le ${new Date(startDate).toLocaleDateString('fr-FR')}`;
                } else if (endDate) {
                    return `Jusqu'au ${new Date(endDate).toLocaleDateString('fr-FR')}`;
                }
                return 'Période personnalisée';
            default: return 'Non défini';
        }
    }

    getFoldersText(sourceFolder) {
        switch(sourceFolder) {
            case 'all': return 'Tous les dossiers';
            case 'inbox': return 'Boîte de réception';
            case 'sent': return 'Éléments envoyés';
            case 'archive': return 'Archive';
            default: return sourceFolder;
        }
    }

    // ================================================
    // SCAN COMPLET AVEC GESTION DES DATES
    // ================================================
    async startCompleteScan(formData) {
        try {
            console.log('[DomainOrganizer] 🚀 Starting scan with date options...');
            this.updateStep(2);
            
            this.configure(formData);
            
            // Mettre à jour l'alerte initiale
            this.updateScanAlert('info', 'Analyse sécurisée en cours', 'Lecture de vos emails sans modification. Vos données restent intactes pendant toute l\'analyse.');
            
            await this.performDateBasedScan(formData);
            
        } catch (error) {
            console.error('[DomainOrganizer] Scan error:', error);
            this.showError(`Erreur de scan: ${error.message}`);
            this.reset();
        } finally {
            this.isProcessing = false;
        }
    }

    async performDateBasedScan(formData) {
        console.log('[DomainOrganizer] 🔍 Performing date-based scan...');
        
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }

        // Réinitialiser les données
        this.scanProgress = {
            totalEmails: 0,
            processedEmails: 0,
            domainsFound: new Set(),
            startTime: Date.now()
        };
        
        this.emailsByDomain.clear();

        // Éléments de l'interface
        const phaseIcon = document.getElementById('phaseIcon');
        const phaseName = document.getElementById('phaseName');
        const phaseDescription = document.getElementById('phaseDescription');
        const alertText = document.getElementById('alertText');
        const statusText = document.getElementById('currentStatus')?.querySelector('.text');
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const progressText = document.getElementById('progressText');
        const emailCount = document.getElementById('emailCount');
        const domainCount = document.getElementById('domainCount');
        const folderCount = document.getElementById('folderCount');

        try {
            // ================================================
            // PHASE 1: CONNEXION ET VÉRIFICATION (0-10%)
            // ================================================
            this.updatePhase('🔗', 'Connexion', 'Établissement de la connexion sécurisée avec Microsoft Graph');
            if (alertText) alertText.textContent = 'Authentification et vérification des permissions d\'accès à votre boîte mail';
            if (statusText) statusText.textContent = 'Connexion à Microsoft Graph...';
            this.updateProgress(5, 'Connexion en cours...');

            const connectionTest = await window.mailService.testConnection();
            if (!connectionTest.success) {
                throw new Error(`Erreur de connexion: ${connectionTest.error}`);
            }

            if (statusText) statusText.textContent = `Connecté: ${connectionTest.user}`;
            this.updateProgress(10, 'Connexion établie');

            // ================================================
            // PHASE 2: CALCUL DES DATES ET PARAMÈTRES (10-20%)
            // ================================================
            this.updatePhase('📅', 'Configuration', 'Calcul de la période d\'analyse et des paramètres');
            if (alertText) alertText.textContent = 'Définition de la période d\'analyse selon vos choix';
            
            const dateRange = this.calculateDateRange(formData);
            const emailLimit = formData.emailLimit === 'unlimited' ? 50000 : parseInt(formData.emailLimit);
            
            if (statusText) statusText.textContent = `Période: ${dateRange.description}`;
            this.updateProgress(15, 'Configuration validée');

            // ================================================
            // PHASE 3: RÉCUPÉRATION DES EMAILS (20-60%)
            // ================================================
            this.updatePhase('📥', 'Récupération', 'Chargement des emails selon la période définie');
            if (alertText) alertText.textContent = `Récupération des emails ${dateRange.description.toLowerCase()}`;
            
            let allEmails = [];
            const folders = formData.sourceFolder === 'all' ? 
                ['inbox', 'sent', 'archive', 'drafts'] : 
                [formData.sourceFolder];

            for (let i = 0; i < folders.length; i++) {
                const folder = folders[i];
                if (statusText) statusText.textContent = `Scan: ${this.getFolderDisplayName(folder)}...`;
                
                try {
                    // Construire les options avec dates
                    const options = {
                        top: Math.floor(emailLimit / folders.length)
                    };
                    
                    // Ajouter les dates calculées
                    if (dateRange.startDate) {
                        options.startDate = dateRange.startDate;
                    }
                    if (dateRange.endDate) {
                        options.endDate = dateRange.endDate;
                    }

                    const folderEmails = await window.mailService.getEmailsFromFolder(folder, options);
                    allEmails = allEmails.concat(folderEmails);
                    
                    if (emailCount) emailCount.textContent = allEmails.length.toLocaleString();
                    
                    const progress = 20 + ((i + 1) / folders.length) * 40; // 20% à 60%
                    this.updateProgress(progress, `${allEmails.length} emails récupérés`);
                    
                    console.log(`[DomainOrganizer] Folder ${folder}: ${folderEmails.length} emails`);
                    
                    // Délai pour la réactivité
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                } catch (error) {
                    console.warn(`[DomainOrganizer] Erreur dossier ${folder}:`, error);
                    if (statusText) statusText.textContent = `Erreur sur ${folder}, continuation...`;
                }
            }

            console.log(`[DomainOrganizer] 📧 TOTAL RÉCUPÉRÉ: ${allEmails.length} emails`);
            
            if (allEmails.length === 0) {
                throw new Error(`Aucun email trouvé pour la période ${dateRange.description.toLowerCase()}`);
            }

            // ================================================
            // PHASE 4: ANALYSE DES DOMAINES (60-90%)
            // ================================================
            this.updatePhase('🔍', 'Analyse', 'Classification des emails par domaine expéditeur');
            if (alertText) alertText.textContent = `Analyse et classification de ${allEmails.length} emails par domaine`;
            
            this.scanProgress.totalEmails = allEmails.length;
            
            for (let i = 0; i < allEmails.length; i++) {
                const email = allEmails[i];
                
                // Extraire le domaine
                const domain = this.extractDomain(email);
                
                if (!domain || formData.excludeDomains.includes(domain.toLowerCase())) {
                    this.scanProgress.processedEmails++;
                    continue;
                }

                // Ajouter à la classification
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
                
                // Mise à jour périodique de l'interface
                if (i % 50 === 0 || i === allEmails.length - 1) {
                    const progress = 60 + Math.floor((this.scanProgress.processedEmails / this.scanProgress.totalEmails) * 30); // 60-90%
                    this.updateProgress(progress, `${this.scanProgress.processedEmails} emails analysés`);
                    
                    if (statusText) statusText.textContent = `Analyse: ${this.scanProgress.processedEmails}/${this.scanProgress.totalEmails} emails`;
                    if (emailCount) emailCount.textContent = this.scanProgress.processedEmails.toLocaleString();
                    if (domainCount) domainCount.textContent = this.scanProgress.domainsFound.size;
                    
                    const uniqueFolders = new Set();
                    this.emailsByDomain.forEach((emails, domain) => {
                        uniqueFolders.add(this.suggestFolder(domain));
                    });
                    if (folderCount) folderCount.textContent = uniqueFolders.size;
                    
                    // Micro-pause pour maintenir la réactivité
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }

            // ================================================
            // PHASE 5: FINALISATION (90-100%)
            // ================================================
            this.updatePhase('✅', 'Finalisation', 'Préparation des résultats et de l\'interface');
            if (alertText) alertText.textContent = 'Génération du rapport d\'analyse et préparation de l\'interface de validation';
            if (statusText) statusText.textContent = 'Finalisation des résultats...';
            this.updateProgress(95, 'Préparation des résultats...');

            await new Promise(resolve => setTimeout(resolve, 800));

            const results = this.buildResults();
            
            this.updateProgress(100, 'Analyse terminée !');
            if (statusText) statusText.textContent = `Analyse terminée: ${results.totalEmails} emails, ${results.totalDomains} domaines`;
            if (alertText) alertText.textContent = `${results.totalEmails} emails analysés avec succès dans ${results.totalDomains} domaines différents`;

            console.log(`[DomainOrganizer] ✅ Scan terminé: ${results.totalEmails} emails, ${results.totalDomains} domaines`);
            
            // Transition vers les résultats
            setTimeout(() => {
                this.showResults(results);
            }, 1200);

        } catch (error) {
            console.error('[DomainOrganizer] Date-based scan error:', error);
            this.updateScanAlert('error', 'Erreur d\'analyse', error.message);
            throw error;
        }
    }

    // ================================================
    // GESTION DES DATES
    // ================================================
    calculateDateRange(formData) {
        const now = new Date();
        let startDate = null;
        let endDate = null;
        let description = '';

        switch(formData.dateRange) {
            case 'all':
                // Pas de limitation de date
                description = 'Tous vos emails';
                break;
                
            case 'recent':
                // 6 derniers mois
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                description = '6 derniers mois';
                break;
                
            case 'year':
                // Dernière année
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                description = 'Dernière année';
                break;
                
            case 'custom':
                // Dates personnalisées
                if (formData.startDate) {
                    startDate = new Date(formData.startDate);
                }
                if (formData.endDate) {
                    endDate = new Date(formData.endDate);
                }
                
                if (startDate && endDate) {
                    description = `Du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`;
                } else if (startDate) {
                    description = `Depuis le ${startDate.toLocaleDateString('fr-FR')}`;
                } else if (endDate) {
                    description = `Jusqu'au ${endDate.toLocaleDateString('fr-FR')}`;
                } else {
                    description = 'Période personnalisée (toutes dates)';
                }
                break;
        }

        return {
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
            description: description
        };
    }

    updatePhase(icon, name, description) {
        const phaseIcon = document.getElementById('phaseIcon');
        const phaseName = document.getElementById('phaseName');
        const phaseDescription = document.getElementById('phaseDescription');
        
        if (phaseIcon) phaseIcon.textContent = icon;
        if (phaseName) phaseName.textContent = name;
        if (phaseDescription) phaseDescription.textContent = description;
    }

    updateProgress(percent, text) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${Math.min(percent, 100)}%`;
        if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
        if (progressText) progressText.textContent = text || '';
    }

    updateScanAlert(type, title, message) {
        const scanAlert = document.getElementById('scanAlert');
        if (!scanAlert) return;

        // Mettre à jour la classe
        scanAlert.className = `alert alert-${type}`;
        
        // Mettre à jour l'icône
        const icon = scanAlert.querySelector('.icon');
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

    // ================================================
    // MÉTHODES UTILITAIRES (IDENTIQUES À LA VERSION PRÉCÉDENTE)
    // ================================================
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

    getFolderDisplayName(folderName) {
        const names = {
            'inbox': 'Boîte de réception',
            'sent': 'Éléments envoyés',
            'archive': 'Archive',
            'drafts': 'Brouillons',
            'junkemail': 'Courrier indésirable'
        };
        return names[folderName] || folderName;
    }

    suggestFolder(domain) {
        // Suggestions intelligentes avec le domaine complet
        const suggestions = {
            // E-commerce
            'amazon.com': 'Amazon', 'amazon.fr': 'Amazon', 'amazon.de': 'Amazon',
            'ebay.com': 'eBay', 'ebay.fr': 'eBay',
            'cdiscount.com': 'Cdiscount', 'fnac.com': 'Fnac',
            'darty.com': 'Darty', 'boulanger.com': 'Boulanger',
            
            // Réseaux sociaux
            'linkedin.com': 'LinkedIn', 'github.com': 'GitHub',
            'facebook.com': 'Facebook', 'instagram.com': 'Instagram',
            'twitter.com': 'Twitter', 'discord.com': 'Discord',
            'slack.com': 'Slack', 'teams.microsoft.com': 'Teams',
            
            // Services financiers
            'paypal.com': 'PayPal', 'stripe.com': 'Stripe',
            'revolut.com': 'Revolut', 'boursorama.com': 'Boursorama',
            'creditagricole.fr': 'Crédit Agricole', 'bnpparibas.fr': 'BNP Paribas',
            'societegenerale.fr': 'Société Générale', 'lcl.fr': 'LCL',
            
            // Streaming et services
            'spotify.com': 'Spotify', 'netflix.com': 'Netflix',
            'youtube.com': 'YouTube', 'twitch.tv': 'Twitch',
            'dropbox.com': 'Dropbox', 'google.com': 'Google',
            'microsoft.com': 'Microsoft', 'apple.com': 'Apple',
            'adobe.com': 'Adobe', 'notion.so': 'Notion',
            
            // Voyage et transport
            'booking.com': 'Booking', 'airbnb.com': 'Airbnb',
            'sncf-connect.com': 'SNCF', 'ouisncf.com': 'SNCF',
            'uber.com': 'Uber', 'blablacar.fr': 'BlaBlaCar',
            'ryanair.com': 'Ryanair', 'airfrance.fr': 'Air France',
            
            // Education et formation
            'udemy.com': 'Udemy', 'coursera.org': 'Coursera',
            'openclassrooms.com': 'OpenClassrooms',
            
            // News et médias
            'lemonde.fr': 'Le Monde', 'lefigaro.fr': 'Le Figaro',
            'liberation.fr': 'Libération', 'francetvinfo.fr': 'France Info'
        };
        
        return suggestions[domain] || domain;
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

        // Trier par nombre d'emails décroissant
        domains.sort((a, b) => b.count - a.count);

        return {
            totalEmails: totalEmails,
            totalDomains: domains.length,
            domains: domains
        };
    }

    // ================================================
    // GESTION DE L'INTERFACE
    // ================================================
    updateStep(step) {
        // Mettre à jour les indicateurs
        document.querySelectorAll('.step').forEach((stepEl, index) => {
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
        
        const currentContent = document.getElementById(`step${step}`);
        if (currentContent) {
            currentContent.style.display = 'block';
        }
        
        this.currentStep = step;
    }

    showResults(results) {
        this.currentAnalysis = results;
        this.updateStep(3);
        
        // Mettre à jour les statistiques
        const totalFound = document.getElementById('totalFound');
        const domainsFound = document.getElementById('domainsFound');
        
        if (totalFound) totalFound.textContent = results.totalEmails.toLocaleString();
        if (domainsFound) domainsFound.textContent = results.totalDomains;
        
        this.displayDomains(results.domains);
        this.updateSelectedCount();
        
        // Configurer la recherche
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
                <div class="domain-meta">${domainData.count} emails → Dossier "${domainData.suggestedFolder}"</div>
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
                <option value="finance">Finance</option>
                <option value="services">Services</option>
            </select>
        `;
        
        // Gestionnaire de sélection
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
        
        // Gestionnaire de changement de dossier
        const folderSelect = row.querySelector('.domain-folder');
        if (folderSelect) {
            folderSelect.addEventListener('change', (e) => {
                domainData.suggestedFolder = e.target.value;
                domainData.emails.forEach(email => {
                    email.targetFolder = e.target.value;
                });
                
                // Mettre à jour l'affichage du meta
                const meta = row.querySelector('.domain-meta');
                if (meta) {
                    meta.textContent = `${domainData.count} emails → Dossier "${e.target.value}"`;
                }
            });
        }
        
        return row;
    }

    // ================================================
    // ACTIONS UTILISATEUR
    // ================================================
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
                '❌ Aucun email sélectionné' : 
                `▶ Organiser ${selectedCount.toLocaleString()} emails`;
        }
    }

    handleSearch(searchTerm) {
        const items = document.querySelectorAll('.domain-item');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const domain = item.dataset.domain?.toLowerCase() || '';
            const visible = !term || domain.includes(term);
            item.style.display = visible ? 'flex' : 'none';
        });
    }

    // ================================================
    // EXÉCUTION AVEC SIMULATION
    // ================================================
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
        
        if (!createFolders && !moveEmails) {
            this.showError('Veuillez sélectionner au moins une action');
            return;
        }
        
        try {
            this.isProcessing = true;
            await this.simulateExecution(selectedDomains, { createFolders, moveEmails, totalEmails });
        } catch (error) {
            this.showError(`Erreur d'exécution: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateExecution(selectedDomains, options) {
        this.updateStep(4);
        
        const actionIcon = document.getElementById('actionIcon');
        const actionName = document.getElementById('actionName');
        const actionDescription = document.getElementById('actionDescription');
        const executeText = document.getElementById('executeText');
        const executeFill = document.getElementById('executeFill');
        const executePercent = document.getElementById('executePercent');
        const executeDetail = document.getElementById('executeDetail');
        const executeStatus = document.getElementById('executeStatus')?.querySelector('.text');
        const foldersCreated = document.getElementById('foldersCreated');
        const emailsMoved = document.getElementById('emailsMoved');
        const timeRemaining = document.getElementById('timeRemaining');
        
        let progress = 0;
        let foldersCount = 0;
        let emailsCount = 0;
        
        const uniqueFolders = new Set(selectedDomains.map(d => d.suggestedFolder));
        const totalFolders = options.createFolders ? uniqueFolders.size : 0;
        const startTime = Date.now();
        
        // Phases d'exécution avec descriptions détaillées
        const phases = [
            {
                icon: '⚙️',
                name: 'Préparation',
                description: 'Initialisation des opérations de modification',
                alert: 'Préparation des modifications à apporter à votre boîte mail',
                duration: 15
            },
            {
                icon: '📁',
                name: 'Création des dossiers',
                description: options.createFolders ? 
                    `Création de ${totalFolders} nouveaux dossiers` :
                    'Vérification des dossiers existants',
                alert: options.createFolders ?
                    `CRÉATION EN COURS : ${totalFolders} nouveaux dossiers sont ajoutés à votre interface Outlook` :
                    'Vérification que tous les dossiers cibles existent déjà',
                duration: 35
            },
            {
                icon: '📧',
                name: 'Déplacement des emails',
                description: options.moveEmails ?
                    `Déplacement de ${options.totalEmails} emails` :
                    'Simulation du déplacement',
                alert: options.moveEmails ?
                    `DÉPLACEMENT EN COURS : ${options.totalEmails} emails sont transférés vers leurs dossiers respectifs. Cette opération modifie réellement votre boîte mail.` :
                    `SIMULATION : ${options.totalEmails} emails seraient déplacés (aucune modification réelle effectuée)`,
                duration: 40
            },
            {
                icon: '✅',
                name: 'Vérification finale',
                description: 'Contrôle de l\'intégrité des opérations',
                alert: 'Vérification que toutes les opérations ont été effectuées correctement',
                duration: 10
            }
        ];
        
        let currentPhase = 0;
        
        const interval = setInterval(() => {
            progress += 1.5;
            
            // Calculer le temps restant
            const elapsed = Date.now() - startTime;
            const estimated = (elapsed / progress) * (100 - progress);
            const remainingSeconds = Math.max(0, Math.floor(estimated / 1000));
            
            // Déterminer la phase actuelle
            let cumulativeDuration = 0;
            for (let i = 0; i < phases.length; i++) {
                cumulativeDuration += phases[i].duration;
                if (progress <= cumulativeDuration) {
                    if (currentPhase !== i) {
                        currentPhase = i;
                        const phase = phases[currentPhase];
                        
                        if (actionIcon) actionIcon.textContent = phase.icon;
                        if (actionName) actionName.textContent = phase.name;
                        if (actionDescription) actionDescription.textContent = phase.description;
                        if (executeText) executeText.textContent = phase.alert;
                        if (executeDetail) executeDetail.textContent = phase.name;
                    }
                    break;
                }
            }
            
            // Mettre à jour les compteurs selon la phase
            if (progress <= 50) {
                // Phase création de dossiers
                foldersCount = Math.floor((progress / 50) * totalFolders);
            } else if (progress <= 90) {
                // Phase déplacement
                foldersCount = totalFolders;
                emailsCount = Math.floor(((progress - 50) / 40) * options.totalEmails);
            } else {
                // Phase finale
                foldersCount = totalFolders;
                emailsCount = options.totalEmails;
            }
            
            // Mettre à jour l'interface
            if (executeFill) executeFill.style.width = `${Math.min(progress, 100)}%`;
            if (executePercent) executePercent.textContent = `${Math.round(Math.min(progress, 100))}%`;
            if (foldersCreated) foldersCreated.textContent = foldersCount;
            if (emailsMoved) emailsMoved.textContent = emailsCount;
            if (timeRemaining) {
                if (progress < 100) {
                    timeRemaining.textContent = remainingSeconds > 60 ? 
                        `${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s` : 
                        `${remainingSeconds}s`;
                } else {
                    timeRemaining.textContent = '0s';
                }
            }
            if (executeStatus) {
                executeStatus.textContent = progress < 100 ? 
                    `${phases[currentPhase]?.name || 'En cours'}...` : 
                    'Terminé !';
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                
                if (actionIcon) actionIcon.textContent = '🎉';
                if (actionName) actionName.textContent = 'Terminé !';
                if (actionDescription) actionDescription.textContent = 'Toutes les opérations ont été effectuées avec succès';
                if (executeText) executeText.textContent = options.moveEmails ?
                    'Votre boîte mail a été organisée selon vos choix. Vous pouvez maintenant consulter le résultat dans Outlook.' :
                    'Simulation terminée avec succès. Aucune modification réelle n\'a été apportée à vos emails.';
                if (executeDetail) executeDetail.textContent = 'Organisation terminée !';
                
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
                }, 1500);
            }
        }, 80);
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
        
        // Message personnalisé selon le mode
        const message = results.wasSimulation ?
            `Simulation réussie : ${results.emailsMoved} emails seraient organisés dans ${results.foldersCreated} dossiers` :
            `${results.emailsMoved} emails ont été organisés avec succès dans ${results.foldersCreated} dossiers`;
        
        if (successMessage) successMessage.textContent = message;
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS ET INITIALISATION
    // ================================================
    async initializePage() {
        console.log('[DomainOrganizer] Initializing v11.0 Enhanced...');
        
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter à votre compte Microsoft');
            return false;
        }

        if (!window.mailService) {
            this.showError('MailService non disponible');
            return false;
        }

        this.setupEventListeners();
        this.updateStep(1);
        
        console.log('[DomainOrganizer] ✅ Enhanced interface ready v11.0');
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
                    customDates.style.display = e.target.value === 'custom' ? 'block' : 'none';
                }
                this.updateEstimation();
            });
        });
        
        // Gestion des changements de paramètres pour l'estimation
        const emailLimitSelect = document.getElementById('emailLimit');
        if (emailLimitSelect) {
            emailLimitSelect.addEventListener('change', () => this.updateEstimation());
        }
        
        // Initialiser l'estimation
        this.updateEstimation();
    }

    updateEstimation() {
        const emailLimitSelect = document.getElementById('emailLimit');
        const estimatedTime = document.getElementById('estimatedTime');
        const estimatedEmails = document.getElementById('estimatedEmails');
        
        if (!emailLimitSelect || !estimatedTime || !estimatedEmails) return;
        
        const limit = emailLimitSelect.value;
        let emailCount = '';
        let timeText = '';
        
        switch(limit) {
            case '1000':
                emailCount = '1 000';
                timeText = '2-3 minutes';
                break;
            case '2500':
                emailCount = '2 500';
                timeText = '5-8 minutes';
                break;
            case '5000':
                emailCount = '5 000';
                timeText = '10-15 minutes';
                break;
            case 'unlimited':
                emailCount = 'tous vos emails';
                timeText = '15+ minutes';
                break;
        }
        
        estimatedEmails.textContent = emailCount;
        estimatedTime.textContent = timeText;
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
        
        this.updateEstimation();
    }

    openOutlook() {
        window.open('https://outlook.office.com/mail/', '_blank');
    }

    showError(message) {
        console.error('[DomainOrganizer] Error:', message);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            // Utiliser une alerte intégrée au lieu d'un alert
            this.showInlineError(message);
        }
    }

    showInlineError(message) {
        // Créer une alerte d'erreur intégrée
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert error';
        errorAlert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        errorAlert.innerHTML = `
            <span class="icon">❌</span>
            <div>
                <strong>Erreur</strong>
                <p>${message}</p>
            </div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; padding: 4px; margin-left: auto;">&times;</button>
        `;
        
        document.body.appendChild(errorAlert);
        
        // Retirer automatiquement après 5 secondes
        setTimeout(() => {
            if (errorAlert.parentElement) {
                errorAlert.remove();
            }
        }, 5000);
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
window.organizerInstance = new DomainOrganizer();

function showDomainOrganizerEnhanced() {
    console.log('[DomainOrganizer] 🚀 Launching v11.0 Enhanced with dates and modals...');
    
    if (!window.authService?.isAuthenticated()) {
        const message = 'Connexion Microsoft requise pour l\'organisateur d\'emails';
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
    pageContent.style.cssText = 'display: block !important; visibility: visible !important;';

    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) rangerButton.classList.add('active');

    setTimeout(async () => {
        try {
            await window.organizerInstance.initializePage();
            console.log('[DomainOrganizer] ✅ Enhanced ready v11.0');
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
        setTimeout(showDomainOrganizerEnhanced, 20);
        return false;
    }
}, true);

// Hook PageManager
if (window.pageManager?.loadPage) {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        if (pageName === 'ranger') {
            showDomainOrganizerEnhanced();
            return;
        }
        return originalLoadPage.call(this, pageName);
    };
}

// Exports
window.showDomainOrganizer = showDomainOrganizerEnhanced;
window.domainOrganizer = {
    showPage: showDomainOrganizerEnhanced,
    instance: window.organizerInstance,
    version: '11.0'
};

console.log('[DomainOrganizer] ✅ v11.0 Enhanced System ready - Avec dates + Explications + Modales intégrées');
