// DomainOrganizer.js - Version 8.1 - Interface Optimisée avec Scroll et Lisibilité
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
        
        console.log('[DomainOrganizer] ✅ v8.1 - Interface Optimisée');
    }

    getPageHTML() {
        return `
            <div class="organizer-container">
                <!-- Header avec progression des étapes -->
                <div class="organizer-header">
                    <div class="header-content">
                        <div class="header-left">
                            <div class="main-icon">
                                <i class="fas fa-folder-tree"></i>
                            </div>
                            <div class="header-info">
                                <h1>Rangement intelligent par domaine</h1>
                                <p class="header-subtitle">Organisez automatiquement vos emails avec un contrôle précis</p>
                            </div>
                        </div>
                        
                        <!-- Indicateur d'étapes -->
                        <div class="steps-indicator">
                            <div class="step active" data-step="1">
                                <div class="step-number">1</div>
                                <div class="step-label">Configuration</div>
                            </div>
                            <div class="step-separator"></div>
                            <div class="step" data-step="2">
                                <div class="step-number">2</div>
                                <div class="step-label">Analyse</div>
                            </div>
                            <div class="step-separator"></div>
                            <div class="step" data-step="3">
                                <div class="step-number">3</div>
                                <div class="step-label">Révision</div>
                            </div>
                            <div class="step-separator"></div>
                            <div class="step" data-step="4">
                                <div class="step-number">4</div>
                                <div class="step-label">Organisation</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenu des étapes -->
                <div class="steps-container">
                    <!-- Étape 1: Configuration -->
                    <div class="step-content" id="step1" style="display: block;">
                        <div class="content-card">
                            <div class="card-header">
                                <div class="card-icon">⚙️</div>
                                <div class="card-title">
                                    <h2>Configuration du scan</h2>
                                    <p>Définissez les paramètres de votre rangement automatique</p>
                                </div>
                            </div>

                            <div class="alert info">
                                <i class="fas fa-info-circle"></i>
                                <div class="alert-content">
                                    <strong>Comment ça marche ?</strong>
                                    <p>L'organisateur va analyser vos emails et les regrouper par domaine expéditeur (gmail.com, amazon.com, etc.). Vous pourrez ensuite choisir dans quel dossier déplacer chaque groupe d'emails.</p>
                                </div>
                            </div>

                            <form id="organizeForm" class="config-form">
                                <div class="form-section">
                                    <h3>📅 Période à analyser</h3>
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label>Date de début</label>
                                            <input type="date" id="startDate" class="form-input">
                                            <small>Emails à partir de cette date</small>
                                        </div>
                                        <div class="form-group">
                                            <label>Date de fin</label>
                                            <input type="date" id="endDate" class="form-input">
                                            <small>Emails jusqu'à cette date</small>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>🚫 Exclusions (optionnel)</h3>
                                    <div class="form-group">
                                        <label>Domaines à ignorer</label>
                                        <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com, hotmail.fr" class="form-input">
                                        <small>Ces domaines ne seront pas organisés (séparez par des virgules)</small>
                                    </div>
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary btn-large" id="analyzeBtn">
                                        <i class="fas fa-search"></i>
                                        Lancer l'analyse
                                        <small>Analyser mes emails</small>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Étape 2: Analyse -->
                    <div class="step-content" id="step2" style="display: none;">
                        <div class="content-card">
                            <div class="card-header">
                                <div class="card-icon animated">🔍</div>
                                <div class="card-title">
                                    <h2>Analyse en cours</h2>
                                    <p id="analysisDescription">Connexion à votre boîte mail...</p>
                                </div>
                            </div>

                            <div class="analysis-progress">
                                <div class="progress-info">
                                    <div class="progress-stats">
                                        <div class="stat">
                                            <div class="stat-icon">📧</div>
                                            <div class="stat-content">
                                                <div class="stat-number" id="emailsAnalyzed">0</div>
                                                <div class="stat-label">Emails analysés</div>
                                            </div>
                                        </div>
                                        <div class="stat">
                                            <div class="stat-icon">🌐</div>
                                            <div class="stat-content">
                                                <div class="stat-number" id="domainsFound">0</div>
                                                <div class="stat-label">Domaines détectés</div>
                                            </div>
                                        </div>
                                        <div class="stat">
                                            <div class="stat-icon">📁</div>
                                            <div class="stat-content">
                                                <div class="stat-number" id="foldersToCreate">0</div>
                                                <div class="stat-label">Dossiers à créer</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="progress-bar-container">
                                        <div class="progress-bar" id="progressBar"></div>
                                        <div class="progress-percent" id="progressPercent">0%</div>
                                    </div>
                                </div>
                            </div>

                            <div class="alert warning">
                                <i class="fas fa-clock"></i>
                                <div class="alert-content">
                                    <strong>Patientez pendant l'analyse...</strong>
                                    <p>Nous scannons vos emails pour identifier les domaines et préparer une organisation optimale. Cette étape peut prendre quelques instants selon le nombre d'emails.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 3: Révision -->
                    <div class="step-content" id="step3" style="display: none;">
                        <div class="content-card">
                            <div class="card-header">
                                <div class="card-icon">✏️</div>
                                <div class="card-title">
                                    <h2>Révision et ajustements</h2>
                                    <p>Vérifiez et personnalisez l'organisation proposée</p>
                                </div>
                            </div>

                            <div class="alert success">
                                <i class="fas fa-check-circle"></i>
                                <div class="alert-content">
                                    <strong>Analyse terminée !</strong>
                                    <p>Nous avons trouvé <span id="totalEmailsFound">0</span> emails dans <span id="totalDomainsFound">0</span> domaines différents. Vous pouvez maintenant ajuster l'organisation proposée.</p>
                                </div>
                            </div>

                            <!-- Résumé rapide -->
                            <div class="summary-cards">
                                <div class="summary-card">
                                    <div class="summary-icon">📧</div>
                                    <div class="summary-content">
                                        <div class="summary-number" id="summaryEmails">0</div>
                                        <div class="summary-label">Emails à organiser</div>
                                    </div>
                                </div>
                                <div class="summary-card">
                                    <div class="summary-icon">🌐</div>
                                    <div class="summary-content">
                                        <div class="summary-number" id="summaryDomains">0</div>
                                        <div class="summary-label">Domaines détectés</div>
                                    </div>
                                </div>
                                <div class="summary-card">
                                    <div class="summary-icon">📁</div>
                                    <div class="summary-content">
                                        <div class="summary-number" id="summarySelected">0</div>
                                        <div class="summary-label">Emails sélectionnés</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Contrôles rapides -->
                            <div class="quick-controls">
                                <div class="control-group">
                                    <button class="btn btn-secondary btn-small" onclick="window.organizerInstance.selectAllEmails()">
                                        <i class="fas fa-check-double"></i> Tout sélectionner
                                    </button>
                                    <button class="btn btn-secondary btn-small" onclick="window.organizerInstance.deselectAllEmails()">
                                        <i class="fas fa-times"></i> Tout désélectionner
                                    </button>
                                    <button class="btn btn-secondary btn-small" onclick="window.organizerInstance.expandAllDomains()">
                                        <i class="fas fa-expand-arrows-alt"></i> Développer tout
                                    </button>
                                </div>
                                
                                <div class="search-group">
                                    <div class="search-container">
                                        <i class="fas fa-search search-icon"></i>
                                        <input type="text" id="emailSearch" placeholder="Rechercher un email ou domaine..." class="search-input">
                                    </div>
                                </div>
                            </div>

                            <!-- Liste des domaines moderne -->
                            <div class="domains-list" id="detailedResults">
                                <!-- Populated dynamically -->
                            </div>

                            <!-- Actions -->
                            <div class="revision-actions">
                                <div class="action-left">
                                    <label class="checkbox-modern">
                                        <input type="checkbox" id="createFolders" checked>
                                        <span class="checkmark"></span>
                                        <span class="checkbox-label">Créer automatiquement les nouveaux dossiers</span>
                                    </label>
                                </div>
                                
                                <div class="action-right">
                                    <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                                        <i class="fas fa-arrow-left"></i>
                                        Retour à la configuration
                                    </button>
                                    <button class="btn btn-primary btn-large" id="applyBtn" onclick="window.organizerInstance.applyOrganization()">
                                        <i class="fas fa-play"></i>
                                        Commencer l'organisation
                                        <small><span id="selectedCount">0</span> emails sélectionnés</small>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 4: Organisation -->
                    <div class="step-content" id="step4" style="display: none;">
                        <div class="content-card">
                            <div class="card-header">
                                <div class="card-icon animated">⚙️</div>
                                <div class="card-title">
                                    <h2>Organisation en cours</h2>
                                    <p id="organizationDescription">Création des dossiers...</p>
                                </div>
                            </div>

                            <div class="organization-progress">
                                <div class="progress-info">
                                    <div class="progress-stats">
                                        <div class="stat">
                                            <div class="stat-icon">📁</div>
                                            <div class="stat-content">
                                                <div class="stat-number" id="foldersCreated">0</div>
                                                <div class="stat-label">Dossiers créés</div>
                                            </div>
                                        </div>
                                        <div class="stat">
                                            <div class="stat-icon">📧</div>
                                            <div class="stat-content">
                                                <div class="stat-number" id="emailsMoved">0</div>
                                                <div class="stat-label">Emails déplacés</div>
                                            </div>
                                        </div>
                                        <div class="stat">
                                            <div class="stat-icon">⏱️</div>
                                            <div class="stat-content">
                                                <div class="stat-number" id="timeRemaining">--</div>
                                                <div class="stat-label">Temps restant</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="progress-bar-container">
                                        <div class="progress-bar success" id="executeBar"></div>
                                        <div class="progress-percent" id="executePercent">0%</div>
                                    </div>
                                </div>
                            </div>

                            <div class="alert info">
                                <i class="fas fa-info-circle"></i>
                                <div class="alert-content">
                                    <strong>Organisation en cours...</strong>
                                    <p>Vos emails sont en train d'être organisés selon vos préférences. Vous pouvez fermer cette page en toute sécurité, l'opération continuera en arrière-plan.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 5: Succès -->
                    <div class="step-content" id="step5" style="display: none;">
                        <div class="content-card success-card">
                            <div class="success-header">
                                <div class="success-icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="success-content">
                                    <h2>Organisation terminée avec succès !</h2>
                                    <p id="successMessage">Vos emails ont été organisés dans leurs dossiers respectifs</p>
                                </div>
                            </div>

                            <div class="success-stats">
                                <div class="success-stat">
                                    <div class="success-stat-icon">📧</div>
                                    <div class="success-stat-content">
                                        <div class="success-stat-number" id="finalEmailsMoved">0</div>
                                        <div class="success-stat-label">Emails organisés</div>
                                    </div>
                                </div>
                                <div class="success-stat">
                                    <div class="success-stat-icon">📁</div>
                                    <div class="success-stat-content">
                                        <div class="success-stat-number" id="finalFoldersCreated">0</div>
                                        <div class="success-stat-label">Dossiers créés</div>
                                    </div>
                                </div>
                                <div class="success-stat">
                                    <div class="success-stat-icon">⏱️</div>
                                    <div class="success-stat-content">
                                        <div class="success-stat-number" id="totalTime">2m 34s</div>
                                        <div class="success-stat-label">Temps total</div>
                                    </div>
                                </div>
                            </div>

                            <div class="alert success">
                                <i class="fas fa-lightbulb"></i>
                                <div class="alert-content">
                                    <strong>Prochaines étapes recommandées</strong>
                                    <ul>
                                        <li>Vérifiez vos nouveaux dossiers dans Outlook</li>
                                        <li>Configurez des règles automatiques pour les futurs emails</li>
                                        <li>Relancez ce processus périodiquement pour maintenir l'organisation</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="success-actions">
                                <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                                    <i class="fas fa-redo"></i>
                                    Organiser d'autres emails
                                </button>
                                <button class="btn btn-primary btn-large" onclick="window.organizerInstance.exploreResults()">
                                    <i class="fas fa-external-link-alt"></i>
                                    Voir mes dossiers dans Outlook
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Variables et reset */
                .organizer-container {
                    --primary: #3b82f6;
                    --primary-dark: #2563eb;
                    --success: #10b981;
                    --success-dark: #059669;
                    --warning: #f59e0b;
                    --warning-light: #fef3c7;
                    --info: #0ea5e9;
                    --info-light: #e0f2fe;
                    --error: #ef4444;
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
                    
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
                    color: var(--gray-900);
                    line-height: 1.4;
                    width: 100%;
                    max-width: none;
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    background: var(--gray-50);
                    /* CORRECTION SCROLL CRITIQUE */
                    overflow-y: auto !important;
                    height: auto !important;
                    max-height: none !important;
                    position: relative !important;
                }

                /* Force le scroll sur tous les navigateurs */
                .organizer-container * {
                    box-sizing: border-box;
                }

                /* Header optimisé et fixe */
                .organizer-header {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    border-radius: 0 0 16px 16px;
                    padding: 24px 32px;
                    margin-bottom: 24px;
                    color: white;
                    box-shadow: 0 8px 32px -8px rgba(59, 130, 246, 0.4);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(20px);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .main-icon {
                    width: 56px;
                    height: 56px;
                    background: rgba(255, 255, 255, 0.25);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                }

                .header-info h1 {
                    margin: 0;
                    font-size: 32px;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.5px;
                }

                .header-subtitle {
                    margin: 6px 0 0 0;
                    opacity: 0.9;
                    font-size: 18px;
                    color: white;
                    font-weight: 500;
                }

                /* Indicateur d'étapes amélioré - TOUT EN BLANC */
                .steps-indicator {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 16px 24px;
                    border-radius: 50px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    opacity: 0.5;
                    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                    min-width: 70px;
                }

                .step.active {
                    opacity: 1;
                    transform: scale(1.05);
                }

                .step.completed {
                    opacity: 1;
                }

                .step-number {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--gray-200);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 16px;
                    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                    color: var(--gray-600);
                    border: 3px solid transparent;
                    position: relative;
                }

                .step.active .step-number {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 8px 24px -4px rgba(59, 130, 246, 0.4);
                    border-color: var(--primary);
                    transform: scale(1.1);
                }

                .step.completed .step-number {
                    background: var(--success);
                    color: white;
                    border-color: var(--success);
                }

                .step.completed .step-number::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .step-label {
                    font-size: 14px;
                    font-weight: 700;
                    white-space: nowrap;
                    color: var(--gray-700);
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .step.active .step-label {
                    color: var(--primary);
                }

                .step.completed .step-label {
                    color: var(--success);
                }

                .step-separator {
                    width: 40px;
                    height: 3px;
                    background: var(--gray-300);
                    border-radius: 2px;
                    position: relative;
                }

                .step.completed + .step-separator {
                    background: var(--success);
                }

                /* Container principal avec scroll optimal */
                .steps-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px 40px;
                    /* SCROLL AUTORISÉ */
                    overflow: visible;
                    min-height: calc(100vh - 200px);
                }

                /* Contenu des étapes */
                .step-content {
                    animation: slideIn 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
                    opacity: 0;
                    animation-fill-mode: forwards;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .content-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 12px 48px -12px rgba(0, 0, 0, 0.08);
                    border: 1px solid var(--gray-200);
                    overflow: hidden;
                    margin-bottom: 24px;
                    backdrop-filter: blur(20px);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 32px 40px;
                    border-bottom: 2px solid var(--gray-100);
                    background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
                }

                .card-icon {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: white;
                    box-shadow: 0 8px 32px -8px rgba(59, 130, 246, 0.3);
                }

                .card-title h2 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--gray-900);
                    letter-spacing: -0.5px;
                }

                .card-title p {
                    margin: 8px 0 0 0;
                    color: var(--gray-600);
                    font-size: 18px;
                    font-weight: 500;
                }

                /* Alertes plus visibles */
                .alert {
                    display: flex;
                    gap: 20px;
                    padding: 24px 32px;
                    border-radius: 16px;
                    margin: 24px 40px;
                    font-size: 16px;
                    line-height: 1.6;
                    border: 2px solid;
                }

                .alert.info {
                    background: linear-gradient(135deg, var(--info-light) 0%, white 100%);
                    border-color: var(--info);
                    color: var(--gray-800);
                }

                .alert.success {
                    background: linear-gradient(135deg, #d1fae5 0%, white 100%);
                    border-color: var(--success);
                    color: var(--gray-800);
                }

                .alert.warning {
                    background: linear-gradient(135deg, var(--warning-light) 0%, white 100%);
                    border-color: var(--warning);
                    color: var(--gray-800);
                }

                .alert i {
                    color: inherit;
                    font-size: 24px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .alert-content strong {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 800;
                    font-size: 18px;
                }

                .alert-content p {
                    margin: 0;
                    line-height: 1.7;
                    font-weight: 500;
                }

                /* Formulaire optimisé */
                .config-form {
                    padding: 40px;
                }

                .form-section {
                    margin-bottom: 32px;
                }

                .form-section h3 {
                    margin: 0 0 20px 0;
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--gray-800);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .form-group label {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--gray-700);
                }

                .form-input {
                    padding: 16px 20px;
                    border: 3px solid var(--gray-300);
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    background: white;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .form-group small {
                    font-size: 14px;
                    color: var(--gray-500);
                    font-weight: 500;
                }

                .form-actions {
                    display: flex;
                    justify-content: center;
                    margin-top: 40px;
                }

                /* Boutons modernisés */
                .btn {
                    padding: 14px 28px;
                    border: 2px solid;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
                    text-transform: none;
                    letter-spacing: 0.3px;
                    justify-content: center;
                    flex-direction: column;
                    min-height: 56px;
                }

                .btn-primary {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    border-color: var(--primary);
                    color: white;
                    box-shadow: 0 8px 24px -8px rgba(59, 130, 246, 0.4);
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px -8px rgba(59, 130, 246, 0.5);
                }

                .btn-secondary {
                    background: white;
                    border-color: var(--gray-300);
                    color: var(--gray-700);
                }

                .btn-secondary:hover {
                    background: var(--gray-50);
                    border-color: var(--gray-400);
                    transform: translateY(-1px);
                }

                .btn-large {
                    padding: 20px 40px;
                    font-size: 18px;
                    min-height: 80px;
                    border-radius: 16px;
                }

                .btn-large small {
                    font-size: 14px;
                    opacity: 0.9;
                    font-weight: 500;
                    margin-top: 4px;
                }

                .btn-small {
                    padding: 10px 20px;
                    font-size: 14px;
                    min-height: 40px;
                    flex-direction: row;
                }

                /* Progression optimisée */
                .analysis-progress,
                .organization-progress {
                    padding: 40px;
                }

                .progress-info {
                    margin-bottom: 32px;
                }

                .progress-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 24px;
                    background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
                    border-radius: 16px;
                    border: 2px solid var(--gray-200);
                    box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.05);
                }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                    box-shadow: 0 8px 24px -8px rgba(59, 130, 246, 0.3);
                }

                .stat-number {
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--gray-900);
                    margin-bottom: 4px;
                    letter-spacing: -0.5px;
                }

                .stat-label {
                    font-size: 14px;
                    color: var(--gray-600);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 700;
                }

                /* Barre de progression moderne */
                .progress-bar-container {
                    position: relative;
                    background: var(--gray-200);
                    border-radius: 50px;
                    height: 12px;
                    overflow: hidden;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
                    border-radius: 50px;
                    transition: width 0.3s ease;
                    position: relative;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                }

                .progress-bar.success {
                    background: linear-gradient(90deg, var(--success) 0%, var(--success-dark) 100%);
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                }

                .progress-percent {
                    position: absolute;
                    top: 50%;
                    right: 16px;
                    transform: translateY(-50%);
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--gray-700);
                }

                /* Cartes de résumé optimisées */
                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin: 32px 40px;
                }

                .summary-card {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 32px;
                    background: linear-gradient(135deg, white 0%, var(--gray-50) 100%);
                    border: 3px solid var(--gray-200);
                    border-radius: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.08);
                }

                .summary-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.12);
                    border-color: var(--primary);
                }

                .summary-icon {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: white;
                    box-shadow: 0 8px 24px -8px rgba(59, 130, 246, 0.3);
                }

                .summary-number {
                    font-size: 36px;
                    font-weight: 800;
                    color: var(--gray-900);
                    margin-bottom: 6px;
                    letter-spacing: -1px;
                }

                .summary-label {
                    font-size: 14px;
                    color: var(--gray-600);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 700;
                }

                /* Contrôles optimisés */
                .quick-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 40px;
                    border-top: 2px solid var(--gray-200);
                    border-bottom: 2px solid var(--gray-200);
                    background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .control-group {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .search-container {
                    position: relative;
                    width: 320px;
                }

                .search-input {
                    width: 100%;
                    padding: 16px 20px 16px 52px;
                    border: 3px solid var(--gray-300);
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 500;
                    background: white;
                    transition: all 0.2s ease;
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .search-icon {
                    position: absolute;
                    left: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--gray-400);
                    font-size: 18px;
                }

                /* Liste des domaines avec scroll */
                .domains-list {
                    max-height: 500px;
                    overflow-y: auto;
                    border-radius: 0 0 20px 20px;
                }

                .domain-item {
                    border-bottom: 2px solid var(--gray-100);
                    transition: all 0.2s ease;
                    background: white;
                }

                .domain-item:last-child {
                    border-bottom: none;
                }

                .domain-item:hover {
                    background: var(--gray-50);
                }

                .domain-header {
                    display: flex;
                    align-items: center;
                    padding: 24px 40px;
                    cursor: pointer;
                    gap: 24px;
                }

                .domain-checkbox {
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    accent-color: var(--primary);
                }

                .domain-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                    font-weight: 800;
                    text-transform: uppercase;
                    box-shadow: 0 8px 24px -8px rgba(59, 130, 246, 0.3);
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--gray-900);
                    margin-bottom: 8px;
                    letter-spacing: -0.3px;
                }

                .domain-meta {
                    display: flex;
                    gap: 24px;
                    font-size: 15px;
                    color: var(--gray-600);
                    font-weight: 600;
                }

                .domain-controls {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .folder-select {
                    padding: 12px 20px;
                    border: 3px solid var(--gray-300);
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    background: white;
                    min-width: 200px;
                }

                .badge {
                    padding: 8px 16px;
                    border-radius: 25px;
                    font-size: 12px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .badge-new {
                    background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
                    color: white;
                }

                .badge-existing {
                    background: var(--gray-200);
                    color: var(--gray-700);
                }

                .expand-icon {
                    color: var(--gray-400);
                    font-size: 18px;
                    transition: transform 0.3s ease;
                }

                .domain-item.expanded .expand-icon {
                    transform: rotate(90deg);
                }

                /* Emails avec meilleur contraste */
                .emails-list {
                    display: none;
                    background: var(--gray-50);
                    border-top: 3px solid var(--primary);
                }

                .domain-item.expanded .emails-list {
                    display: block;
                }

                .email-item {
                    display: flex;
                    align-items: center;
                    padding: 20px 40px 20px 88px;
                    gap: 20px;
                    border-bottom: 1px solid var(--gray-200);
                    font-size: 15px;
                    transition: all 0.2s ease;
                    min-height: 70px;
                    background: white;
                }

                .email-item:hover {
                    background: var(--gray-50);
                }

                .email-item.selected {
                    background: linear-gradient(135deg, #dbeafe 0%, white 100%);
                    border-left: 4px solid var(--primary);
                }

                .email-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    accent-color: var(--primary);
                }

                .email-content {
                    flex: 1;
                    min-width: 0;
                }

                .email-subject {
                    font-weight: 700;
                    color: var(--gray-900);
                    margin-bottom: 6px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 16px;
                }

                .email-meta {
                    color: var(--gray-600);
                    font-size: 14px;
                    font-weight: 600;
                }

                .email-folder-select {
                    padding: 10px 16px;
                    border: 3px solid var(--gray-300);
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    background: white;
                    min-width: 160px;
                }

                /* Actions optimisées */
                .revision-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 32px 40px;
                    border-top: 2px solid var(--gray-200);
                    background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
                    flex-wrap: wrap;
                    gap: 24px;
                }

                .action-right {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }

                /* Checkbox moderne */
                .checkbox-modern {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--gray-700);
                }

                .checkbox-modern input[type="checkbox"] {
                    width: 24px;
                    height: 24px;
                    accent-color: var(--primary);
                }

                /* Carte de succès */
                .success-card {
                    background: linear-gradient(135deg, var(--success), var(--success-dark));
                    color: white;
                    border: none;
                }

                .success-card .card-header {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .success-card .card-icon {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .success-card .card-title h2,
                .success-card .card-title p {
                    color: white;
                }

                .success-header {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    padding: 40px;
                    text-align: center;
                    justify-content: center;
                }

                .success-icon {
                    width: 80px;
                    height: 80px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 36px;
                    backdrop-filter: blur(10px);
                }

                .success-content h2 {
                    margin: 0 0 12px 0;
                    font-size: 28px;
                    font-weight: 800;
                }

                .success-content p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 18px;
                    font-weight: 500;
                }

                .success-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    padding: 0 40px 40px 40px;
                }

                .success-stat {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                }

                .success-stat-icon {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .success-stat-number {
                    font-size: 24px;
                    font-weight: 800;
                    margin-bottom: 4px;
                    letter-spacing: -0.5px;
                }

                .success-stat-label {
                    font-size: 12px;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 700;
                }

                .success-actions {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    padding: 0 40px 40px 40px;
                    flex-wrap: wrap;
                }

                .success-actions .btn-secondary {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.3);
                    color: white;
                    backdrop-filter: blur(10px);
                }

                .success-actions .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .success-actions .btn-primary {
                    background: white;
                    color: var(--success);
                    border-color: white;
                }

                .success-actions .btn-primary:hover {
                    background: var(--gray-50);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                }

                /* Animation des icônes */
                .animated {
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.05);
                    }
                }

                /* Scrollbar personnalisée moderne */
                .domains-list::-webkit-scrollbar {
                    width: 12px;
                }

                .domains-list::-webkit-scrollbar-track {
                    background: var(--gray-100);
                    border-radius: 6px;
                }

                .domains-list::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    border-radius: 6px;
                    border: 2px solid var(--gray-100);
                }

                .domains-list::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
                }

                /* Responsive optimisé */
                @media (max-width: 768px) {
                    .organizer-container {
                        padding: 0;
                    }
                    
                    .organizer-header {
                        border-radius: 0;
                        padding: 20px 16px;
                        margin-bottom: 16px;
                    }
                    
                    .header-content {
                        flex-direction: column;
                        text-align: center;
                        gap: 16px;
                    }
                    
                    .steps-indicator {
                        order: -1;
                        margin-bottom: 20px;
                        padding: 12px 16px;
                        gap: 12px;
                    }
                    
                    .step-number {
                        width: 32px;
                        height: 32px;
                        font-size: 14px;
                    }
                    
                    .step-label {
                        font-size: 12px;
                    }
                    
                    .steps-container {
                        padding: 0 16px 24px;
                    }
                    
                    .card-header {
                        padding: 24px 20px;
                    }
                    
                    .config-form {
                        padding: 20px;
                    }
                    
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .progress-stats {
                        grid-template-columns: 1fr;
                    }
                    
                    .summary-cards {
                        grid-template-columns: 1fr;
                        margin: 24px 20px;
                    }
                    
                    .quick-controls {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 20px;
                    }
                    
                    .search-container {
                        width: 100%;
                    }
                    
                    .domain-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        padding: 20px 16px;
                    }
                    
                    .domain-controls {
                        width: 100%;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 12px;
                    }
                    
                    .folder-select {
                        min-width: 140px;
                    }
                    
                    .email-item {
                        padding: 16px 20px 16px 48px;
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }
                    
                    .revision-actions {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 24px 20px;
                    }
                    
                    .action-right {
                        justify-content: center;
                        flex-direction: column;
                    }
                    
                    .success-stats {
                        grid-template-columns: 1fr;
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

                /* États des boutons */
                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none !important;
                }

                .btn:disabled:hover {
                    transform: none !important;
                    box-shadow: none !important;
                }
            </style>
        `;
    }

    // Méthodes de navigation entre étapes
    updateStepIndicator(step) {
        console.log(`[DomainOrganizer] Updating to step ${step}`);
        
        // Mettre à jour l'indicateur visuel
        document.querySelectorAll('.step').forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index + 1 < step) {
                stepEl.classList.add('completed');
            } else if (index + 1 === step) {
                stepEl.classList.add('active');
            }
        });
        
        // Masquer toutes les étapes
        document.querySelectorAll('.step-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Afficher l'étape courante
        const currentStepContent = document.getElementById(`step${step}`);
        if (currentStepContent) {
            currentStepContent.style.display = 'block';
        }
        
        this.currentStep = step;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v8.1 Optimized Interface...');
        
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }

        // CORRECTION SCROLL CRITIQUE - Force le scroll
        this.enableScroll();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.updateStepIndicator(1);
        this.isActive = true;
        
        console.log('[DomainOrganizer] ✅ Optimized interface initialized v8.1');
        return true;
    }

    enableScroll() {
        // Force le scroll sur tous les éléments
        const body = document.body;
        const html = document.documentElement;
        const pageContent = document.getElementById('pageContent');
        
        // Reset des styles qui bloquent le scroll
        [body, html].forEach(el => {
            if (el) {
                el.style.overflow = 'auto';
                el.style.overflowY = 'auto';
                el.style.height = 'auto';
                el.style.maxHeight = 'none';
                el.style.position = 'static';
                el.classList.remove('page-short-content', 'no-scroll');
            }
        });
        
        if (pageContent) {
            pageContent.style.overflow = 'visible';
            pageContent.style.overflowY = 'visible';
            pageContent.style.height = 'auto';
            pageContent.style.maxHeight = 'none';
            pageContent.style.position = 'relative';
        }
        
        // Force le recalcul de la layout
        window.dispatchEvent(new Event('resize'));
        
        console.log('[DomainOrganizer] ✅ Scroll enabled');
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
        
        console.log('[DomainOrganizer] Form submitted - Optimized UI');
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
        
        return { startDate, endDate, excludeDomains, excludeEmails: [] };
    }

    async startAnalysis(formData) {
        try {
            this.updateStepIndicator(2);
            
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
        console.log('[DomainOrganizer] Optimized analysis simulation...');
        
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const emailsAnalyzed = document.getElementById('emailsAnalyzed');
        const domainsFound = document.getElementById('domainsFound');
        const foldersToCreate = document.getElementById('foldersToCreate');
        const analysisDescription = document.getElementById('analysisDescription');
        
        let progress = 0;
        let emails = 0;
        let domains = 0;
        let folders = 0;
        
        const descriptions = [
            'Connexion à votre boîte mail...',
            'Récupération de la liste des emails...',
            'Analyse des domaines expéditeurs...',
            'Identification des dossiers existants...',
            'Calcul de l\'organisation optimale...',
            'Finalisation de l\'analyse...'
        ];
        
        let descIndex = 0;
        
        const interval = setInterval(() => {
            progress += 16;
            emails += Math.floor(Math.random() * 35) + 25;
            
            if (progress >= 32 && domains === 0) {
                domains = Math.floor(emails / 35) + 4;
                folders = Math.floor(domains * 0.7) + 1;
            }
            
            // Mise à jour de l'interface
            if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
            if (progressPercent) progressPercent.textContent = `${Math.min(progress, 100)}%`;
            if (emailsAnalyzed) emailsAnalyzed.textContent = emails;
            if (domainsFound) domainsFound.textContent = domains;
            if (foldersToCreate) foldersToCreate.textContent = folders;
            
            // Mise à jour de la description
            if (analysisDescription && descIndex < descriptions.length) {
                analysisDescription.textContent = descriptions[descIndex];
                descIndex++;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                if (analysisDescription) analysisDescription.textContent = 'Analyse terminée !';
                
                const results = this.generateOptimizedMockData(domains, emails, folders);
                setTimeout(() => this.showRevisionStep(results), 800);
            }
        }, 500);
    }

    generateOptimizedMockData(domainCount, totalEmails, foldersToCreate) {
        const mockDomains = [
            'linkedin.com', 'github.com', 'amazon.com', 'paypal.com', 'medium.com', 
            'stackoverflow.com', 'atlassian.com', 'slack.com', 'dropbox.com', 'spotify.com',
            'netflix.com', 'airbnb.com', 'booking.com', 'udemy.com', 'coursera.org',
            'microsoft.com', 'google.com', 'apple.com', 'salesforce.com', 'notion.so'
        ];
        
        const mockSubjects = [
            'Confirmation de votre commande',
            'Nouvelle notification importante',
            'Rapport mensuel disponible',
            'Invitation à rejoindre',
            'Mise à jour de sécurité',
            'Newsletter hebdomadaire',
            'Réservation confirmée',
            'Facture disponible',
            'Nouveau message',
            'Action requise',
            'Mise à jour du profil',
            'Abonnement activé',
            'Demande de connexion'
        ];
        
        const domains = [];
        let emailId = 1;
        let remainingEmails = totalEmails;
        
        for (let i = 0; i < domainCount && remainingEmails > 0; i++) {
            const domain = mockDomains[i % mockDomains.length];
            const emailCount = i === domainCount - 1 
                ? remainingEmails 
                : Math.min(Math.floor(Math.random() * 45) + 15, remainingEmails);
            
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
                    date: date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' }),
                    selected: true,
                    targetFolder: domain.split('.')[0]
                });
            }
            
            domains.push({
                domain: domain,
                count: emailCount,
                action: Math.random() > 0.35 ? 'create-new' : 'move-existing',
                suggestedFolder: domain.split('.')[0],
                emails: emails,
                selected: true
            });
        }
        
        return {
            totalEmails: totalEmails,
            totalDomains: domainCount,
            domainsToCreate: foldersToCreate,
            domains: domains.sort((a, b) => b.count - a.count)
        };
    }

    showRevisionStep(results) {
        console.log('[DomainOrganizer] Showing revision step with results:', results);
        
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
        
        // Mise à jour de l'étape
        this.updateStepIndicator(3);
        
        // Mise à jour des alertes avec résultats
        const totalEmailsFound = document.getElementById('totalEmailsFound');
        const totalDomainsFound = document.getElementById('totalDomainsFound');
        
        if (totalEmailsFound) totalEmailsFound.textContent = results.totalEmails.toLocaleString();
        if (totalDomainsFound) totalDomainsFound.textContent = results.totalDomains;
        
        // Mise à jour des cartes de résumé
        const summaryEmails = document.getElementById('summaryEmails');
        const summaryDomains = document.getElementById('summaryDomains');
        const summarySelected = document.getElementById('summarySelected');
        
        if (summaryEmails) summaryEmails.textContent = results.totalEmails.toLocaleString();
        if (summaryDomains) summaryDomains.textContent = results.totalDomains;
        
        const selectedCount = Array.from(this.emailActions.values()).filter(action => action.selected).length;
        if (summarySelected) summarySelected.textContent = selectedCount.toLocaleString();
        
        this.displayOptimizedDomains(results.domains);
        this.updateSelectedCount();
        
        // Assurer que le scroll fonctionne
        this.enableScroll();
    }

    displayOptimizedDomains(domains) {
        const container = document.getElementById('detailedResults');
        if (!container) return;
        
        container.innerHTML = '';
        
        domains.forEach(domain => {
            const domainRow = this.createOptimizedDomainRow(domain);
            container.appendChild(domainRow);
        });
    }

    createOptimizedDomainRow(domainData) {
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
                        <span>${domainData.count} emails</span>
                        <span>${selectedEmails} sélectionnés</span>
                        <span>Dossier: ${domainData.suggestedFolder}</span>
                    </div>
                </div>
                
                <div class="domain-controls">
                    <select class="folder-select" data-domain="${domainData.domain}">
                        <option value="${domainData.suggestedFolder}" selected>${domainData.suggestedFolder}</option>
                        <option value="inbox">📥 Boîte de réception</option>
                        <option value="archive">📁 Archive</option>
                        <option value="important">⭐ Important</option>
                        <option value="work">💼 Travail</option>
                        <option value="personal">👤 Personnel</option>
                    </select>
                    
                    <span class="badge ${isNewFolder ? 'badge-new' : 'badge-existing'}">
                        ${isNewFolder ? 'Nouveau dossier' : 'Dossier existant'}
                    </span>
                    
                    <i class="fas fa-chevron-right expand-icon"></i>
                </div>
            </div>
            
            <div class="emails-list">
                ${domainData.emails.map(email => this.createOptimizedEmailItem(email, domainData.domain)).join('')}
            </div>
        `;
        
        // Event listeners
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

    createOptimizedEmailItem(emailData, domain) {
        const isSelected = this.emailActions.get(emailData.id)?.selected;
        
        return `
            <div class="email-item ${isSelected ? 'selected' : ''}" data-email-id="${emailData.id}">
                <input type="checkbox" class="email-checkbox" data-email-id="${emailData.id}" 
                       ${isSelected ? 'checked' : ''}
                       onchange="window.organizerInstance.handleEmailToggle(event)">
                
                <div class="email-content">
                    <div class="email-subject">${emailData.subject}</div>
                    <div class="email-meta">
                        De: ${emailData.senderName} • ${emailData.date}
                    </div>
                </div>
                
                <select class="email-folder-select" data-email-id="${emailData.id}" 
                        onchange="window.organizerInstance.handleEmailFolderChange(event)">
                    <option value="${emailData.targetFolder}" selected>${emailData.targetFolder}</option>
                    <option value="inbox">📥 Boîte de réception</option>
                    <option value="archive">📁 Archive</option>
                    <option value="spam">🚫 Spam</option>
                    <option value="important">⭐ Important</option>
                    <option value="work">💼 Travail</option>
                    <option value="personal">👤 Personnel</option>
                </select>
            </div>
        `;
    }

    // Méthodes de gestion des interactions
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
            if (domain) {
                this.expandedDomains.add(domain);
            }
        });
    }

    collapseAllDomains() {
        document.querySelectorAll('.domain-item').forEach(row => {
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
                    if (emailCheckbox) {
                        emailCheckbox.checked = isChecked;
                    }
                    
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
        
        const emailItem = event.target.closest('.email-item');
        if (emailItem) {
            if (isChecked) {
                emailItem.classList.add('selected');
            } else {
                emailItem.classList.remove('selected');
            }
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
                    if (emailSelect) {
                        emailSelect.value = newFolder;
                    }
                });
            }
        }
    }

    updateSelectedCount() {
        const selectedCount = Array.from(this.emailActions.values()).filter(action => action.selected).length;
        
        const summarySelected = document.getElementById('summarySelected');
        const selectedCountSpan = document.getElementById('selectedCount');
        const applyBtn = document.getElementById('applyBtn');
        
        if (summarySelected) summarySelected.textContent = selectedCount.toLocaleString();
        if (selectedCountSpan) selectedCountSpan.textContent = selectedCount.toLocaleString();
        
        if (applyBtn) {
            applyBtn.disabled = selectedCount === 0;
            if (selectedCount === 0) {
                applyBtn.innerHTML = `
                    <i class="fas fa-play"></i>
                    Aucun email sélectionné
                    <small>Sélectionnez des emails à organiser</small>
                `;
            } else {
                applyBtn.innerHTML = `
                    <i class="fas fa-play"></i>
                    Commencer l'organisation
                    <small>${selectedCount.toLocaleString()} emails sélectionnés</small>
                `;
            }
        }
    }

    handleSearch(searchTerm) {
        const emailItems = document.querySelectorAll('.email-item');
        const domainRows = document.querySelectorAll('.domain-item');
        
        emailItems.forEach(item => {
            const subject = item.querySelector('.email-subject')?.textContent.toLowerCase() || '';
            const meta = item.querySelector('.email-meta')?.textContent.toLowerCase() || '';
            
            if (subject.includes(searchTerm.toLowerCase()) || meta.includes(searchTerm.toLowerCase())) {
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
            
            console.log('[DomainOrganizer] Applying optimized organization for', selectedEmails.length, 'emails');
            
            await this.simulateExecution(selectedEmails);
            
        } catch (error) {
            console.error('[DomainOrganizer] Apply error:', error);
            this.showError(`Erreur: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateExecution(selectedEmails) {
        console.log('[DomainOrganizer] Simulating execution with optimized progress...');
        
        this.updateStepIndicator(4);
        
        const executeBar = document.getElementById('executeBar');
        const executePercent = document.getElementById('executePercent');
        const foldersCreated = document.getElementById('foldersCreated');
        const emailsMoved = document.getElementById('emailsMoved');
        const timeRemaining = document.getElementById('timeRemaining');
        const organizationDescription = document.getElementById('organizationDescription');
        
        let progress = 0;
        let folders = 0;
        let emails = 0;
        
        const uniqueFolders = new Set(selectedEmails.map(email => email.targetFolder));
        const totalFolders = uniqueFolders.size;
        const totalEmails = selectedEmails.length;
        
        const descriptions = [
            'Création des dossiers...',
            'Préparation du déplacement...',
            'Déplacement des emails...',
            'Vérification de l\'organisation...',
            'Finalisation...'
        ];
        
        let descIndex = 0;
        let startTime = Date.now();
        
        const interval = setInterval(() => {
            progress += 8;
            
            // Calcul du temps restant
            const elapsed = Date.now() - startTime;
            const estimated = (elapsed / progress) * (100 - progress);
            const remainingSeconds = Math.max(0, Math.floor(estimated / 1000));
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            
            if (executeBar) executeBar.style.width = `${Math.min(progress, 100)}%`;
            if (executePercent) executePercent.textContent = `${Math.min(progress, 100)}%`;
            if (timeRemaining && progress < 100) {
                timeRemaining.textContent = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            }
            
            if (progress === 16) {
                folders = Math.floor(totalFolders * 0.3);
                emails = Math.floor(totalEmails * 0.1);
                if (organizationDescription) organizationDescription.textContent = descriptions[0];
                descIndex = 1;
            } else if (progress === 32) {
                folders = Math.floor(totalFolders * 0.6);
                emails = Math.floor(totalEmails * 0.2);
                if (organizationDescription) organizationDescription.textContent = descriptions[1];
                descIndex = 2;
            } else if (progress === 48) {
                folders = Math.floor(totalFolders * 0.8);
                emails = Math.floor(totalEmails * 0.4);
                if (organizationDescription) organizationDescription.textContent = descriptions[2];
                descIndex = 3;
            } else if (progress === 72) {
                folders = totalFolders;
                emails = Math.floor(totalEmails * 0.8);
                if (organizationDescription) organizationDescription.textContent = descriptions[3];
                descIndex = 4;
            } else if (progress === 88) {
                emails = totalEmails;
                if (organizationDescription) organizationDescription.textContent = descriptions[4];
            } else if (progress >= 100) {
                clearInterval(interval);
                folders = totalFolders;
                emails = totalEmails;
                if (organizationDescription) organizationDescription.textContent = 'Organisation terminée !';
                if (timeRemaining) timeRemaining.textContent = '0s';
                
                const totalTimeElapsed = Date.now() - startTime;
                const totalMinutes = Math.floor(totalTimeElapsed / 60000);
                const totalSeconds = Math.floor((totalTimeElapsed % 60000) / 1000);
                
                setTimeout(() => this.showSuccess({ 
                    emailsMoved: emails, 
                    foldersCreated: folders,
                    totalTime: totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds}s` : `${totalSeconds}s`
                }), 1000);
            }
            
            if (foldersCreated) foldersCreated.textContent = folders;
            if (emailsMoved) emailsMoved.textContent = emails;
        }, 300);
    }

    showSuccess(results) {
        console.log('[DomainOrganizer] Showing success with results:', results);
        
        this.updateStepIndicator(5);
        
        const finalEmailsMoved = document.getElementById('finalEmailsMoved');
        const finalFoldersCreated = document.getElementById('finalFoldersCreated');
        const totalTime = document.getElementById('totalTime');
        const successMessage = document.getElementById('successMessage');
        
        if (finalEmailsMoved) finalEmailsMoved.textContent = results.emailsMoved.toLocaleString();
        if (finalFoldersCreated) finalFoldersCreated.textContent = results.foldersCreated;
        if (totalTime) totalTime.textContent = results.totalTime || '2m 34s';
        
        const message = `${results.emailsMoved} emails ont été organisés dans ${results.foldersCreated} dossiers en ${results.totalTime}`;
        if (successMessage) successMessage.textContent = message;
        
        // Assurer que le scroll fonctionne toujours
        this.enableScroll();
    }

    resetForm() {
        this.updateStepIndicator(1);
        
        const form = document.getElementById('organizeForm');
        if (form) form.reset();
        
        this.setDefaultDates();
        this.emailActions.clear();
        this.selectedActions.clear();
        this.expandedDomains.clear();
        this.currentAnalysis = null;
        this.isProcessing = false;
        this.currentStep = 1;
        
        // Réactiver le scroll
        this.enableScroll();
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

    exploreResults() {
        window.open('https://outlook.office.com/mail/', '_blank');
    }
}

// Initialisation globale optimisée
window.organizerInstance = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ v8.1 Optimized Instance created');

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v8.1 Optimized Interface...');
    
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
    pageContent.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; overflow: visible !important; height: auto !important;';

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
                console.log('[DomainOrganizer] ✅ Optimized interface ready v8.1');
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
            }
        }
    }, 50);

    console.log('[DomainOrganizer] ✅ Optimized interface launched v8.1');
}

// Interception des événements
document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]') || 
                        e.target.closest('button[onclick*="ranger"]') || 
                        e.target.closest('a[href*="ranger"]');
    
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[DomainOrganizer] 🎯 Ranger click detected v8.1');
        setTimeout(showDomainOrganizerApp, 10);
        return false;
    }
}, true);

// Hook PageManager
if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        console.log(`[DomainOrganizer] 🔍 PageManager.loadPage: ${pageName}`);
        
        if (pageName === 'ranger') {
            console.log('[DomainOrganizer] 🎯 PageManager interception v8.1');
            showDomainOrganizerApp();
            return;
        }

        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                console.log('[DomainOrganizer] 🔧 PageManager error intercepted v8.1');
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
    
    console.log('[DomainOrganizer] ✅ PageManager hook installed v8.1');
}

// Exposer les fonctions globales
window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = {
    showPage: showDomainOrganizerApp,
    instance: window.organizerInstance
};

console.log('[DomainOrganizer] ✅ v8.1 Optimized System ready - Interface avec scroll corrigé et étapes lisibles');
