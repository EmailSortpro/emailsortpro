// DomainOrganizer.js - Version intuitive avec étapes explicites
// Version 3.0.0 - Interface guidée et sécurisée

class DomainOrganizer {
    constructor() {
        // État du module
        this.isProcessing = false;
        this.existingFolders = new Map();
        this.domainAnalysis = new Map();
        this.emailsByDomain = new Map();
        this.excludedDomains = new Set();
        this.excludedEmails = new Set();
        this.progressCallback = null;
        
        // État de l'interface
        this.currentAnalysis = null;
        this.selectedActions = new Map();
        this.currentStep = 'configure'; // configure, analyze, review, confirm, execute, results
        
        console.log('[DomainOrganizer] ✅ Module initialized');
    }

    // ================================================
    // MÉTHODES D'INTERFACE - GESTION DE LA PAGE
    // ================================================
    
    /**
     * Génère le HTML de la page
     */
    getPageHTML() {
        return `
            <div class="container" style="max-width: 900px; margin: 40px auto; padding: 0 20px;">
                <!-- En-tête avec étapes -->
                <div class="steps-header">
                    <h1>
                        <i class="fas fa-folder-tree"></i>
                        Rangement automatique par domaine
                    </h1>
                    <div class="steps-indicator">
                        <div class="step active" data-step="configure">
                            <div class="step-number">1</div>
                            <div class="step-label">Configuration</div>
                        </div>
                        <div class="step" data-step="analyze">
                            <div class="step-number">2</div>
                            <div class="step-label">Analyse</div>
                        </div>
                        <div class="step" data-step="review">
                            <div class="step-number">3</div>
                            <div class="step-label">Révision</div>
                        </div>
                        <div class="step" data-step="confirm">
                            <div class="step-number">4</div>
                            <div class="step-label">Confirmation</div>
                        </div>
                        <div class="step" data-step="execute">
                            <div class="step-number">5</div>
                            <div class="step-label">Exécution</div>
                        </div>
                    </div>
                </div>

                <!-- Étape 1: Configuration -->
                <div class="step-content" id="configStep" style="display: block;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-cog"></i>
                            Configuration du rangement
                        </h2>
                        
                        <div class="info-box info-primary">
                            <i class="fas fa-info-circle"></i>
                            <div>
                                <strong>Comment ça marche ?</strong><br>
                                Nous allons analyser vos emails et les regrouper automatiquement par domaine expéditeur 
                                (ex: tous les emails de @amazon.com dans un dossier "amazon.com").
                            </div>
                        </div>
                        
                        <form id="organizeForm">
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
                                    <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com, hotmail.com">
                                    <span class="help-text">Ces domaines ne seront pas rangés (séparer par des virgules)</span>
                                </div>
                                
                                <div class="form-group full-width">
                                    <label for="excludeEmails">
                                        <i class="fas fa-user-slash"></i>
                                        Emails spécifiques à exclure (optionnel)
                                    </label>
                                    <textarea id="excludeEmails" placeholder="contact@important.com&#10;boss@company.com"></textarea>
                                    <span class="help-text">Ces adresses email ne seront pas rangées (une par ligne)</span>
                                </div>
                            </div>
                            
                            <div class="expected-outcome">
                                <h4><i class="fas fa-eye"></i> À quoi s'attendre ?</h4>
                                <ul>
                                    <li>Nous allons scanner vos emails dans la période sélectionnée</li>
                                    <li>Chaque domaine sera analysé (nombre d'emails, exemples)</li>
                                    <li>Vous pourrez choisir les dossiers de destination</li>
                                    <li>Aucun email ne sera déplacé sans votre accord final</li>
                                </ul>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-large" id="analyzeBtn">
                                <i class="fas fa-search"></i>
                                Commencer l'analyse
                                <span class="btn-subtitle">Étape 1/5</span>
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Étape 2: Analyse en cours -->
                <div class="step-content" id="analyzeStep" style="display: none;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-chart-line"></i>
                            Analyse en cours...
                        </h2>
                        
                        <div class="analysis-progress">
                            <div class="current-action">
                                <div class="spinner"></div>
                                <div id="currentActionText">Préparation de l'analyse...</div>
                            </div>
                            
                            <div class="progress-section">
                                <div class="progress-header">
                                    <span id="progressLabel">Initialisation</span>
                                    <span id="progressPercent">0%</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar" id="progressBar" style="width: 0%"></div>
                                </div>
                            </div>
                            
                            <div class="analysis-steps">
                                <div class="analysis-step" id="step-folders">
                                    <i class="fas fa-folder pending"></i>
                                    <span>Chargement des dossiers existants</span>
                                    <div class="step-status pending">En attente</div>
                                </div>
                                <div class="analysis-step" id="step-emails">
                                    <i class="fas fa-envelope pending"></i>
                                    <span>Récupération des emails</span>
                                    <div class="step-status pending">En attente</div>
                                </div>
                                <div class="analysis-step" id="step-domains">
                                    <i class="fas fa-at pending"></i>
                                    <span>Analyse des domaines</span>
                                    <div class="step-status pending">En attente</div>
                                </div>
                                <div class="analysis-step" id="step-suggestions">
                                    <i class="fas fa-lightbulb pending"></i>
                                    <span>Génération des suggestions</span>
                                    <div class="step-status pending">En attente</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 3: Révision des résultats -->
                <div class="step-content" id="reviewStep" style="display: none;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-chart-bar"></i>
                            Résultats de l'analyse
                        </h2>

                        <div class="stats-section">
                            <div class="stats-row">
                                <div class="stat">
                                    <div class="stat-icon"><i class="fas fa-envelope"></i></div>
                                    <div class="stat-details">
                                        <div class="stat-value" id="statEmails">0</div>
                                        <div class="stat-label">Emails trouvés</div>
                                    </div>
                                </div>
                                <div class="stat">
                                    <div class="stat-icon"><i class="fas fa-at"></i></div>
                                    <div class="stat-details">
                                        <div class="stat-value" id="statDomains">0</div>
                                        <div class="stat-label">Domaines uniques</div>
                                    </div>
                                </div>
                                <div class="stat">
                                    <div class="stat-icon"><i class="fas fa-folder-plus"></i></div>
                                    <div class="stat-details">
                                        <div class="stat-value" id="statNew">0</div>
                                        <div class="stat-label">Nouveaux dossiers</div>
                                    </div>
                                </div>
                                <div class="stat">
                                    <div class="stat-icon"><i class="fas fa-folder"></i></div>
                                    <div class="stat-details">
                                        <div class="stat-value" id="statExisting">0</div>
                                        <div class="stat-label">Dossiers existants</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="info-box info-success">
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <strong>Révision nécessaire</strong><br>
                                Vérifiez les suggestions ci-dessous. Vous pouvez modifier les dossiers de destination 
                                ou désélectionner des domaines avant de continuer.
                            </div>
                        </div>

                        <div class="results-section">
                            <div class="results-header">
                                <div class="results-title">
                                    <h3>Domaines trouvés</h3>
                                    <span class="select-controls">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="selectAll" checked>
                                            Tout sélectionner
                                        </label>
                                    </span>
                                </div>
                            </div>
                            
                            <div class="results-table-container">
                                <table class="results-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 40px"></th>
                                            <th>Domaine</th>
                                            <th style="width: 80px">Emails</th>
                                            <th style="width: 250px">Dossier de destination</th>
                                            <th style="width: 120px">Action</th>
                                            <th style="width: 40px">Aperçu</th>
                                        </tr>
                                    </thead>
                                    <tbody id="resultsTableBody">
                                        <!-- Populated dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="action-section">
                            <div class="checkbox-group">
                                <input type="checkbox" id="createFolders" checked>
                                <label for="createFolders">
                                    <strong>Créer automatiquement les nouveaux dossiers</strong>
                                    <span class="checkbox-help">Les dossiers manquants seront créés dans votre boîte mail</span>
                                </label>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn btn-secondary" onclick="window.domainOrganizer.goBack()">
                                    <i class="fas fa-arrow-left"></i>
                                    Retour
                                </button>
                                <button class="btn btn-primary btn-large" id="reviewBtn" onclick="window.domainOrganizer.proceedToConfirmation()">
                                    <i class="fas fa-arrow-right"></i>
                                    Continuer vers la confirmation
                                    <span class="btn-subtitle">Étape 3/5</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 4: Confirmation -->
                <div class="step-content" id="confirmStep" style="display: none;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
                            Confirmation des actions
                        </h2>
                        
                        <div class="warning-box">
                            <div class="warning-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="warning-content">
                                <h3>Attention : Actions irréversibles</h3>
                                <p>Les actions suivantes vont être effectuées et <strong>ne pourront pas être annulées automatiquement</strong> :</p>
                                <ul id="actionsPreview">
                                    <!-- Populated dynamically -->
                                </ul>
                                <p class="warning-note">
                                    <i class="fas fa-info-circle"></i>
                                    Vous pourrez toujours déplacer manuellement les emails plus tard, 
                                    mais cette opération automatique ne peut pas être annulée.
                                </p>
                            </div>
                        </div>

                        <div class="confirmation-summary">
                            <h3>Récapitulatif des actions</h3>
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <div class="summary-icon"><i class="fas fa-envelope"></i></div>
                                    <div class="summary-text">
                                        <strong id="confirmTotalEmails">0</strong> emails seront déplacés
                                    </div>
                                </div>
                                <div class="summary-item">
                                    <div class="summary-icon"><i class="fas fa-folder-plus"></i></div>
                                    <div class="summary-text">
                                        <strong id="confirmNewFolders">0</strong> nouveaux dossiers seront créés
                                    </div>
                                </div>
                                <div class="summary-item">
                                    <div class="summary-icon"><i class="fas fa-clock"></i></div>
                                    <div class="summary-text">
                                        Temps estimé : <strong id="estimatedTime">quelques secondes</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="final-confirmation">
                            <label class="checkbox-label large">
                                <input type="checkbox" id="finalConfirmation">
                                <div class="checkbox-content">
                                    <strong>Je confirme vouloir effectuer ces actions</strong>
                                    <span>J'ai vérifié les actions et je comprends qu'elles sont irréversibles</span>
                                </div>
                            </label>
                        </div>

                        <div class="action-buttons">
                            <button class="btn btn-secondary" onclick="window.domainOrganizer.goToReview()">
                                <i class="fas fa-arrow-left"></i>
                                Retour aux résultats
                            </button>
                            <button class="btn btn-danger btn-large" id="executeBtn" onclick="window.domainOrganizer.executeOrganization()" disabled>
                                <i class="fas fa-play"></i>
                                Lancer le rangement
                                <span class="btn-subtitle">Étape 4/5</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Étape 5: Exécution -->
                <div class="step-content" id="executeStep" style="display: none;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-cogs"></i>
                            Rangement en cours...
                        </h2>
                        
                        <div class="execution-progress">
                            <div class="current-domain">
                                <div class="domain-icon">
                                    <i class="fas fa-at"></i>
                                </div>
                                <div class="domain-info">
                                    <div class="domain-name" id="currentDomainName">Initialisation...</div>
                                    <div class="domain-action" id="currentDomainAction">Préparation</div>
                                </div>
                                <div class="domain-status">
                                    <div class="spinner small"></div>
                                </div>
                            </div>
                            
                            <div class="overall-progress">
                                <div class="progress-header">
                                    <span>Progression globale</span>
                                    <span id="executionPercent">0%</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar" id="executionProgressBar" style="width: 0%"></div>
                                </div>
                                <div class="progress-details">
                                    <span id="executionStatus">0 domaines traités sur 0</span>
                                </div>
                            </div>

                            <div class="execution-log">
                                <h4>Journal des actions</h4>
                                <div class="log-container" id="executionLog">
                                    <!-- Populated dynamically -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Résultats finaux -->
                <div class="step-content" id="resultsStep" style="display: none;">
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-check-circle" style="color: #10b981;"></i>
                            Rangement terminé !
                        </h2>
                        
                        <div class="success-summary">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="success-content">
                                <h3>Félicitations !</h3>
                                <p>Votre boîte mail a été organisée avec succès.</p>
                            </div>
                        </div>

                        <div class="final-stats">
                            <div class="final-stat">
                                <div class="stat-icon success"><i class="fas fa-envelope"></i></div>
                                <div class="stat-details">
                                    <div class="stat-value" id="finalEmailsMoved">0</div>
                                    <div class="stat-label">Emails déplacés</div>
                                </div>
                            </div>
                            <div class="final-stat">
                                <div class="stat-icon success"><i class="fas fa-folder-plus"></i></div>
                                <div class="stat-details">
                                    <div class="stat-value" id="finalFoldersCreated">0</div>
                                    <div class="stat-label">Dossiers créés</div>
                                </div>
                            </div>
                            <div class="final-stat">
                                <div class="stat-icon success"><i class="fas fa-clock"></i></div>
                                <div class="stat-details">
                                    <div class="stat-value" id="finalTimeElapsed">0s</div>
                                    <div class="stat-label">Temps écoulé</div>
                                </div>
                            </div>
                        </div>

                        <div class="actions-summary">
                            <h3>Récapitulatif détaillé</h3>
                            <div class="actions-list" id="finalActionsList">
                                <!-- Populated dynamically -->
                            </div>
                        </div>

                        <div class="next-steps">
                            <h4><i class="fas fa-lightbulb"></i> Prochaines étapes suggérées</h4>
                            <ul>
                                <li>Vérifiez vos nouveaux dossiers dans votre client email</li>
                                <li>Configurez des règles automatiques pour les nouveaux emails</li>
                                <li>Répétez cette opération régulièrement pour maintenir l'organisation</li>
                            </ul>
                        </div>

                        <div class="action-buttons">
                            <button class="btn btn-secondary" onclick="window.domainOrganizer.resetForm()">
                                <i class="fas fa-redo"></i>
                                Nouveau rangement
                            </button>
                            <button class="btn btn-primary" onclick="window.location.reload()">
                                <i class="fas fa-home"></i>
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Styles généraux */
                * { box-sizing: border-box; }
                
                .container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: #1f2937;
                    line-height: 1.6;
                }

                /* En-tête avec étapes */
                .steps-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .steps-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 24px;
                    color: #111827;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                }

                .steps-indicator {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin: 0 auto;
                    max-width: 600px;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    opacity: 0.4;
                    transition: opacity 0.3s ease;
                }

                .step.active {
                    opacity: 1;
                }

                .step.completed {
                    opacity: 0.8;
                }

                .step-number {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #e5e7eb;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    margin-bottom: 8px;
                    transition: all 0.3s ease;
                }

                .step.active .step-number {
                    background: #3b82f6;
                    color: white;
                }

                .step.completed .step-number {
                    background: #10b981;
                    color: white;
                }

                .step-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #6b7280;
                }

                /* Cards */
                .card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    padding: 32px;
                    margin-bottom: 24px;
                }

                .card-title {
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #111827;
                }

                /* Info boxes */
                .info-box {
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                    display: flex;
                    gap: 12px;
                }

                .info-primary {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    color: #1d4ed8;
                }

                .info-success {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #166534;
                }

                /* Formulaires */
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 24px;
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
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .form-group input[type="date"],
                .form-group input[type="text"],
                .form-group textarea {
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                    font-family: inherit;
                }

                .help-text {
                    font-size: 12px;
                    color: #6b7280;
                }

                /* Résultats attendus */
                .expected-outcome {
                    background: #f9fafb;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                }

                .expected-outcome h4 {
                    margin: 0 0 12px 0;
                    color: #374151;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .expected-outcome ul {
                    margin: 0;
                    padding-left: 20px;
                }

                .expected-outcome li {
                    margin-bottom: 8px;
                    color: #6b7280;
                }

                /* Boutons */
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

                .btn-large {
                    padding: 16px 32px;
                    font-size: 16px;
                    flex-direction: column;
                    gap: 4px;
                }

                .btn-subtitle {
                    font-size: 12px;
                    opacity: 0.8;
                    font-weight: 400;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #2563eb;
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                .btn-danger {
                    background: #dc2626;
                    color: white;
                }

                .btn-danger:hover:not(:disabled) {
                    background: #b91c1c;
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Progression d'analyse */
                .analysis-progress {
                    text-align: center;
                }

                .current-action {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e5e7eb;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .spinner.small {
                    width: 20px;
                    height: 20px;
                    border-width: 2px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .progress-section {
                    margin-bottom: 32px;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-weight: 600;
                }

                .progress {
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    background: #3b82f6;
                    transition: width 0.3s ease;
                }

                .analysis-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    text-align: left;
                }

                .analysis-step {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .analysis-step i {
                    width: 20px;
                    text-align: center;
                }

                .analysis-step i.pending {
                    color: #6b7280;
                }

                .analysis-step i.active {
                    color: #3b82f6;
                }

                .analysis-step i.completed {
                    color: #10b981;
                }

                .step-status {
                    margin-left: auto;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                .step-status.pending {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .step-status.active {
                    background: #dbeafe;
                    color: #3b82f6;
                }

                .step-status.completed {
                    background: #d1fae5;
                    color: #10b981;
                }

                /* Statistiques */
                .stats-section {
                    margin-bottom: 32px;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    padding: 24px;
                    background: #f8fafc;
                    border-radius: 12px;
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    background: #e0e7ff;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3730a3;
                    font-size: 20px;
                }

                .stat-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                }

                .stat-label {
                    font-size: 14px;
                    color: #6b7280;
                }

                /* Tableau de résultats */
                .results-section {
                    margin-bottom: 32px;
                }

                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .results-title h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                }

                .results-table-container {
                    max-height: 500px;
                    overflow-y: auto;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                }

                .results-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }

                .results-table th {
                    text-align: left;
                    padding: 16px;
                    border-bottom: 2px solid #e5e7eb;
                    font-weight: 600;
                    color: #374151;
                    background: #f9fafb;
                    position: sticky;
                    top: 0;
                }

                .results-table td {
                    padding: 16px;
                    border-bottom: 1px solid #f3f4f6;
                    vertical-align: middle;
                }

                .domain-name {
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .email-count {
                    background: #dbeafe;
                    color: #1d4ed8;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 600;
                    text-align: center;
                    display: inline-block;
                }

                .folder-select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 2px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 14px;
                    background: white;
                }

                .action-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 600;
                    text-align: center;
                }

                .action-new {
                    background: #d1fae5;
                    color: #065f46;
                }

                .action-existing {
                    background: #e0e7ff;
                    color: #3730a3;
                }

                .preview-btn {
                    background: #f3f4f6;
                    border: none;
                    border-radius: 6px;
                    padding: 6px;
                    cursor: pointer;
                    color: #6b7280;
                }

                .preview-btn:hover {
                    background: #e5e7eb;
                }

                /* Sections d'action */
                .action-section {
                    border-top: 2px solid #e5e7eb;
                    padding-top: 24px;
                }

                .checkbox-group {
                    margin-bottom: 24px;
                }

                .checkbox-group input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .checkbox-group label {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    cursor: pointer;
                }

                .checkbox-help {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: normal;
                    display: block;
                    margin-top: 4px;
                }

                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                }

                /* Avertissements */
                .warning-box {
                    background: #fef3c7;
                    border: 2px solid #f59e0b;
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 32px;
                    display: flex;
                    gap: 16px;
                }

                .warning-icon {
                    flex-shrink: 0;
                    width: 48px;
                    height: 48px;
                    background: #f59e0b;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 20px;
                }

                .warning-content h3 {
                    margin: 0 0 12px 0;
                    color: #92400e;
                    font-size: 18px;
                }

                .warning-content p {
                    margin: 0 0 16px 0;
                    color: #92400e;
                }

                .warning-content ul {
                    margin: 0 0 16px 0;
                    padding-left: 20px;
                    color: #92400e;
                }

                .warning-note {
                    background: #fbbf24;
                    padding: 12px;
                    border-radius: 6px;
                    color: #78350f !important;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Récapitulatif de confirmation */
                .confirmation-summary {
                    margin-bottom: 32px;
                }

                .confirmation-summary h3 {
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    color: #111827;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .summary-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .summary-icon {
                    width: 40px;
                    height: 40px;
                    background: #3b82f6;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .summary-text {
                    color: #374151;
                }

                /* Confirmation finale */
                .final-confirmation {
                    margin-bottom: 32px;
                }

                .checkbox-label.large {
                    padding: 20px;
                    background: #f9fafb;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    transition: border-color 0.2s ease;
                }

                .checkbox-label.large:hover {
                    border-color: #3b82f6;
                }

                .checkbox-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .checkbox-content strong {
                    font-size: 16px;
                    color: #111827;
                }

                .checkbox-content span {
                    font-size: 14px;
                    color: #6b7280;
                    font-weight: normal;
                }

                /* Exécution */
                .execution-progress {
                    text-align: center;
                }

                .current-domain {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 24px;
                    background: #f8fafc;
                    border-radius: 12px;
                    margin-bottom: 32px;
                }

                .domain-icon {
                    width: 48px;
                    height: 48px;
                    background: #3b82f6;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 20px;
                }

                .domain-info {
                    flex: 1;
                    text-align: left;
                }

                .domain-name {
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                }

                .domain-action {
                    font-size: 14px;
                    color: #6b7280;
                }

                .overall-progress {
                    margin-bottom: 32px;
                }

                .progress-details {
                    text-align: center;
                    margin-top: 8px;
                    font-size: 14px;
                    color: #6b7280;
                }

                .execution-log {
                    text-align: left;
                }

                .execution-log h4 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    color: #374151;
                }

                .log-container {
                    max-height: 300px;
                    overflow-y: auto;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                }

                .log-entry {
                    padding: 8px 0;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .log-entry.success {
                    color: #10b981;
                }

                .log-entry.error {
                    color: #dc2626;
                }

                .log-entry.info {
                    color: #6b7280;
                }

                /* Résultats finaux */
                .success-summary {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .success-icon {
                    width: 80px;
                    height: 80px;
                    background: #10b981;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 32px;
                    margin: 0 auto 16px auto;
                }

                .success-content h3 {
                    font-size: 24px;
                    color: #111827;
                    margin: 0 0 8px 0;
                }

                .success-content p {
                    color: #6b7280;
                    font-size: 16px;
                    margin: 0;
                }

                .final-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .final-stat {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    background: #f0fdf4;
                    border-radius: 12px;
                }

                .stat-icon.success {
                    background: #10b981;
                    color: white;
                }

                .actions-summary {
                    margin-bottom: 32px;
                }

                .actions-summary h3 {
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    color: #111827;
                }

                .actions-list {
                    background: #f9fafb;
                    border-radius: 8px;
                    padding: 20px;
                }

                .action-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #e5e7eb;
                }

                .action-item:last-child {
                    border-bottom: none;
                }

                .action-details {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .action-icon {
                    width: 32px;
                    height: 32px;
                    background: #e0e7ff;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3730a3;
                }

                .action-text {
                    font-weight: 600;
                    color: #374151;
                }

                .action-count {
                    background: #dbeafe;
                    color: #1d4ed8;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .next-steps {
                    background: #eff6ff;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 32px;
                }

                .next-steps h4 {
                    margin: 0 0 12px 0;
                    color: #1d4ed8;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .next-steps ul {
                    margin: 0;
                    padding-left: 20px;
                }

                .next-steps li {
                    color: #1e40af;
                    margin-bottom: 8px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .container {
                        margin: 20px auto;
                        padding: 0 16px;
                    }

                    .steps-indicator {
                        gap: 12px;
                    }

                    .step-number {
                        width: 32px;
                        height: 32px;
                        font-size: 14px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-row {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                    }

                    .stat {
                        flex-direction: column;
                        text-align: center;
                        gap: 8px;
                    }

                    .action-buttons {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .summary-grid {
                        grid-template-columns: 1fr;
                    }

                    .final-stats {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    }

    /**
     * Initialise la page et les event listeners
     */
    async initializePage() {
        console.log('[DomainOrganizer] Initializing page...');
        
        // Vérifier l'authentification
        if (!window.authService?.isAuthenticated()) {
            window.uiManager?.showToast('Veuillez vous connecter pour utiliser cette fonctionnalité', 'warning');
            return false;
        }
        
        // Configurer les event listeners
        this.setupEventListeners();
        
        // Définir les dates par défaut
        this.setDefaultDates();
        
        // Afficher l'étape initiale
        this.showStep('configure');
        
        return true;
    }

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
        // Formulaire principal
        const form = document.getElementById('organizeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => this.handleSelectAll(e));
        }

        // Confirmation finale
        const finalConfirmation = document.getElementById('finalConfirmation');
        if (finalConfirmation) {
            finalConfirmation.addEventListener('change', (e) => {
                const executeBtn = document.getElementById('executeBtn');
                if (executeBtn) {
                    executeBtn.disabled = !e.target.checked;
                }
            });
        }
    }

    /**
     * Définit les dates par défaut
     */
    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.valueAsDate = thirtyDaysAgo;
        if (endDateInput) endDateInput.valueAsDate = today;
    }

    /**
     * Affiche une étape spécifique
     */
    showStep(stepName) {
        console.log(`[DomainOrganizer] Showing step: ${stepName}`);
        
        // Mettre à jour l'indicateur d'étapes
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
            if (step.dataset.step === stepName) {
                step.classList.add('active');
            } else if (this.isStepCompleted(step.dataset.step, stepName)) {
                step.classList.add('completed');
            }
        });

        // Cacher toutes les étapes
        document.querySelectorAll('.step-content').forEach(content => {
            content.style.display = 'none';
        });

        // Afficher l'étape active
        const activeStep = document.getElementById(`${stepName}Step`);
        if (activeStep) {
            activeStep.style.display = 'block';
            console.log(`[DomainOrganizer] ✅ Step ${stepName} displayed`);
        } else {
            console.error(`[DomainOrganizer] ❌ Step element not found: ${stepName}Step`);
        }

        this.currentStep = stepName;
    }

    /**
     * Vérifie si une étape est complétée
     */
    isStepCompleted(stepName, currentStep) {
        const steps = ['configure', 'analyze', 'review', 'confirm', 'execute'];
        const stepIndex = steps.indexOf(stepName);
        const currentIndex = steps.indexOf(currentStep);
        return stepIndex < currentIndex;
    }

    /**
     * Gère la soumission du formulaire
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
        const formData = this.getFormData();
        await this.startAnalysis(formData);
    }

    /**
     * Récupère les données du formulaire
     */
    getFormData() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const excludeDomains = document.getElementById('excludeDomains').value
            .split(',')
            .map(d => d.trim())
            .filter(d => d);
        const excludeEmails = document.getElementById('excludeEmails').value
            .split('\n')
            .map(e => e.trim())
            .filter(e => e);
        
        return { startDate, endDate, excludeDomains, excludeEmails };
    }

    /**
     * Lance l'analyse
     */
    async startAnalysis(formData) {
        try {
            this.isProcessing = true;
            this.showStep('analyze');
            
            // Configurer le module
            this.configure({
                excludeDomains: formData.excludeDomains,
                excludeEmails: formData.excludeEmails,
                onProgress: (progress) => this.updateAnalysisProgress(progress)
            });
            
            // Lancer l'analyse
            const results = await this.analyzeEmails({
                startDate: formData.startDate,
                endDate: formData.endDate,
                folders: ['inbox']
            });
            
            this.currentAnalysis = results;
            this.showResults(results);
            
        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            this.resetForm();
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Met à jour la progression de l'analyse
     */
    updateAnalysisProgress(progress) {
        // Mettre à jour la barre de progression
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const progressLabel = document.getElementById('progressLabel');
        const currentActionText = document.getElementById('currentActionText');
        
        if (progressBar) progressBar.style.width = `${progress.percent}%`;
        if (progressPercent) progressPercent.textContent = `${progress.percent}%`;
        if (progressLabel) progressLabel.textContent = progress.stage || 'Analyse';
        if (currentActionText) currentActionText.textContent = progress.message || 'Analyse en cours...';
        
        // Mettre à jour les étapes
        this.updateAnalysisSteps(progress.stage);
    }

    /**
     * Met à jour les étapes d'analyse
     */
    updateAnalysisSteps(currentStage) {
        const stageMapping = {
            'Chargement des dossiers': 'step-folders',
            'Récupération des emails': 'step-emails', 
            'Analyse des domaines': 'step-domains',
            'Génération des suggestions': 'step-suggestions'
        };
        
        const currentStepId = stageMapping[currentStage];
        
        Object.entries(stageMapping).forEach(([stage, stepId]) => {
            const stepElement = document.getElementById(stepId);
            if (!stepElement) return;
            
            const icon = stepElement.querySelector('i');
            const status = stepElement.querySelector('.step-status');
            
            if (stage === currentStage) {
                icon.className = 'fas fa-spinner fa-spin active';
                status.textContent = 'En cours';
                status.className = 'step-status active';
            } else if (this.isStageCompleted(stage, currentStage)) {
                icon.className = 'fas fa-check completed';
                status.textContent = 'Terminé';
                status.className = 'step-status completed';
            }
        });
    }

    /**
     * Vérifie si une étape est terminée
     */
    isStageCompleted(stage, currentStage) {
        const stages = [
            'Chargement des dossiers',
            'Récupération des emails',
            'Analyse des domaines',
            'Génération des suggestions'
        ];
        
        const stageIndex = stages.indexOf(stage);
        const currentIndex = stages.indexOf(currentStage);
        return stageIndex < currentIndex;
    }

    /**
     * Affiche les résultats
     */
    showResults(results) {
        // Mettre à jour les statistiques
        document.getElementById('statEmails').textContent = results.totalEmails.toLocaleString();
        document.getElementById('statDomains').textContent = results.totalDomains;
        document.getElementById('statNew').textContent = results.domainsToCreate;
        document.getElementById('statExisting').textContent = results.domainsWithExisting;
        
        // Afficher le tableau
        this.displayDomainsTable(results.domains);
        
        // Préparer les actions
        this.prepareActions();
        
        // Passer à l'étape de révision
        this.showStep('review');
    }

    /**
     * Affiche le tableau des domaines
     */
    displayDomainsTable(domains) {
        const tbody = document.getElementById('resultsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        domains.forEach((domain, index) => {
            const row = this.createDomainRow(domain, index);
            tbody.appendChild(row);
        });
    }

    /**
     * Crée une ligne de domaine
     */
    createDomainRow(domainData, index) {
        const row = document.createElement('tr');
        row.dataset.domain = domainData.domain;
        
        const isNewFolder = domainData.action === 'create-new';
        const existingFolders = Array.from(this.existingFolders.values());
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" checked>
            </td>
            <td>
                <div class="domain-name">
                    <i class="fas fa-at" style="color: #6b7280; font-size: 14px;"></i>
                    ${domainData.domain}
                </div>
            </td>
            <td>
                <span class="email-count">${domainData.count}</span>
            </td>
            <td>
                ${isNewFolder ? 
                    `<input type="text" class="folder-select" value="${domainData.suggestedFolder}" 
                            data-domain="${domainData.domain}">` :
                    this.createFolderSelect(domainData, existingFolders)
                }
            </td>
            <td>
                <span class="action-badge ${isNewFolder ? 'action-new' : 'action-existing'}">
                    ${isNewFolder ? 'Nouveau dossier' : 'Dossier existant'}
                </span>
            </td>
            <td>
                <button class="preview-btn" onclick="window.domainOrganizer.showPreview('${domainData.domain}')" title="Voir les exemples d'emails">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        // Event listeners
        const checkbox = row.querySelector('.domain-checkbox');
        checkbox.addEventListener('change', (e) => this.handleDomainToggle(e));
        
        const folderInput = row.querySelector('.folder-select, input[type="text"]');
        if (folderInput) {
            folderInput.addEventListener('change', (e) => this.handleFolderChange(e));
        }
        
        return row;
    }

    /**
     * Crée un select de dossiers
     */
    createFolderSelect(domainData, existingFolders) {
        const options = existingFolders.map(folder => 
            `<option value="${folder.id}" ${folder.displayName === domainData.suggestedFolder ? 'selected' : ''}>
                ${folder.displayName}
            </option>`
        ).join('');
        
        return `<select class="folder-select" data-domain="${domainData.domain}">${options}</select>`;
    }

    /**
     * Affiche un aperçu des emails pour un domaine
     */
    showPreview(domain) {
        const domainData = this.domainAnalysis.get(domain);
        if (!domainData || !domainData.samples) return;
        
        const samples = domainData.samples.slice(0, 3);
        let previewText = `Exemples d'emails de ${domain}:\n\n`;
        
        samples.forEach((sample, index) => {
            previewText += `${index + 1}. De: ${sample.from}\n`;
            previewText += `   Sujet: ${sample.subject}\n\n`;
        });
        
        alert(previewText);
    }

    /**
     * Gère le toggle d'un domaine
     */
    handleDomainToggle(event) {
        const domain = event.target.dataset.domain;
        const isChecked = event.target.checked;
        
        if (this.selectedActions.has(domain)) {
            this.selectedActions.get(domain).selected = isChecked;
        }
    }

    /**
     * Gère le changement de dossier
     */
    handleFolderChange(event) {
        const domain = event.target.dataset.domain;
        const value = event.target.value;
        
        if (!this.selectedActions.has(domain)) return;
        
        const action = this.selectedActions.get(domain);
        
        if (event.target.tagName === 'INPUT') {
            action.targetFolder = value;
            action.action = 'create-new';
        } else {
            const selectedOption = event.target.options[event.target.selectedIndex];
            action.targetFolder = selectedOption.text;
            action.existingFolderId = value;
            action.action = 'move-existing';
        }
    }

    /**
     * Gère le select all
     */
    handleSelectAll(event) {
        const isChecked = event.target.checked;
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
            this.handleDomainToggle({ target: checkbox });
        });
    }

    /**
     * Prépare les actions
     */
    prepareActions() {
        this.selectedActions.clear();
        const actions = this.getPreparedActions();
        actions.forEach((action, domain) => {
            this.selectedActions.set(domain, action);
        });
    }

    /**
     * Navigation - Retour
     */
    goBack() {
        this.showStep('configure');
    }

    /**
     * Navigation - Vers confirmation
     */
    proceedToConfirmation() {
        const selectedCount = Array.from(this.selectedActions.values())
            .filter(action => action.selected).length;
        
        if (selectedCount === 0) {
            window.uiManager?.showToast('Veuillez sélectionner au moins un domaine à traiter', 'warning');
            return;
        }
        
        this.showConfirmation();
    }

    /**
     * Affiche l'étape de confirmation
     */
    showConfirmation() {
        // Calculer les statistiques
        const selectedActions = Array.from(this.selectedActions.values())
            .filter(action => action.selected);
        
        const totalEmails = selectedActions.reduce((sum, action) => sum + action.emailCount, 0);
        const newFolders = selectedActions.filter(action => action.action === 'create-new').length;
        const estimatedTime = this.calculateEstimatedTime(totalEmails, newFolders);
        
        // Mettre à jour les éléments de confirmation
        document.getElementById('confirmTotalEmails').textContent = totalEmails.toLocaleString();
        document.getElementById('confirmNewFolders').textContent = newFolders;
        document.getElementById('estimatedTime').textContent = estimatedTime;
        
        // Générer la liste des actions
        this.generateActionsPreview(selectedActions);
        
        // Réinitialiser la confirmation
        const finalConfirmation = document.getElementById('finalConfirmation');
        if (finalConfirmation) {
            finalConfirmation.checked = false;
        }
        
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = true;
        }
        
        this.showStep('confirm');
    }

    /**
     * Calcule le temps estimé
     */
    calculateEstimatedTime(emailCount, folderCount) {
        // Estimation basée sur l'expérience : 
        // - 1 seconde par nouveau dossier
        // - 0.1 seconde par email à déplacer
        const seconds = folderCount * 1 + emailCount * 0.1;
        
        if (seconds < 60) {
            return `${Math.ceil(seconds)} secondes`;
        } else if (seconds < 3600) {
            return `${Math.ceil(seconds / 60)} minutes`;
        } else {
            return `${Math.ceil(seconds / 3600)} heures`;
        }
    }

    /**
     * Génère l'aperçu des actions
     */
    generateActionsPreview(selectedActions) {
        const actionsPreview = document.getElementById('actionsPreview');
        if (!actionsPreview) return;
        
        actionsPreview.innerHTML = '';
        
        const newFolders = selectedActions.filter(action => action.action === 'create-new');
        const existingFolders = selectedActions.filter(action => action.action === 'move-existing');
        
        if (newFolders.length > 0) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${newFolders.length} nouveaux dossiers</strong> seront créés : ${newFolders.map(a => a.targetFolder).join(', ')}`;
            actionsPreview.appendChild(li);
        }
        
        if (existingFolders.length > 0) {
            const totalEmails = existingFolders.reduce((sum, action) => sum + action.emailCount, 0);
            const li = document.createElement('li');
            li.innerHTML = `<strong>${totalEmails} emails</strong> seront déplacés vers des dossiers existants`;
            actionsPreview.appendChild(li);
        }
        
        const newFolderEmails = newFolders.reduce((sum, action) => sum + action.emailCount, 0);
        if (newFolderEmails > 0) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${newFolderEmails} emails</strong> seront déplacés vers les nouveaux dossiers`;
            actionsPreview.appendChild(li);
        }
    }

    /**
     * Navigation - Retour aux résultats
     */
    goToReview() {
        this.showStep('review');
    }

    /**
     * Exécute l'organisation
     */
    async executeOrganization() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.showStep('execute');
            
            const actionsToApply = new Map();
            this.selectedActions.forEach((action, domain) => {
                if (action.selected) {
                    actionsToApply.set(domain, action);
                }
            });
            
            const createFolders = document.getElementById('createFolders')?.checked ?? true;
            this.configure({ createFolders });
            
            const startTime = Date.now();
            const results = await this.executeOrganizationWithProgress(actionsToApply);
            const endTime = Date.now();
            
            results.timeElapsed = Math.round((endTime - startTime) / 1000);
            this.showFinalResults(results);
            
        } catch (error) {
            console.error('[DomainOrganizer] Execute error:', error);
            window.uiManager?.showToast(`Erreur: ${error.message}`, 'error');
            this.goToReview();
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Exécute l'organisation avec progression détaillée
     */
    async executeOrganizationWithProgress(domainActions) {
        const results = {
            success: 0,
            failed: 0,
            foldersCreated: 0,
            emailsMoved: 0,
            errors: [],
            actions: []
        };
        
        const totalDomains = domainActions.size;
        let processedDomains = 0;
        
        // Initialiser le log
        this.initializeExecutionLog();
        
        for (const [domain, action] of domainActions) {
            try {
                // Mettre à jour l'interface
                this.updateExecutionProgress(domain, action, processedDomains, totalDomains);
                
                this.addLogEntry(`Traitement de ${domain}...`, 'info');
                
                const result = await this.processDomain(domain, action);
                
                if (result.success) {
                    results.success++;
                    results.emailsMoved += result.emailsMoved;
                    if (result.folderCreated) {
                        results.foldersCreated++;
                        this.addLogEntry(`✓ Dossier "${action.targetFolder}" créé`, 'success');
                    }
                    this.addLogEntry(`✓ ${result.emailsMoved} emails déplacés vers "${action.targetFolder}"`, 'success');
                    
                    results.actions.push({
                        domain: domain,
                        action: action.action,
                        targetFolder: action.targetFolder,
                        emailCount: result.emailsMoved,
                        folderCreated: result.folderCreated,
                        success: true
                    });
                } else {
                    results.failed++;
                    results.errors.push({ domain, error: result.error });
                    this.addLogEntry(`✗ Erreur pour ${domain}: ${result.error}`, 'error');
                    
                    results.actions.push({
                        domain: domain,
                        action: action.action,
                        targetFolder: action.targetFolder,
                        emailCount: 0,
                        folderCreated: false,
                        success: false,
                        error: result.error
                    });
                }
                
            } catch (error) {
                results.failed++;
                results.errors.push({ domain, error: error.message });
                this.addLogEntry(`✗ Erreur pour ${domain}: ${error.message}`, 'error');
            }
            
            processedDomains++;
            
            // Petit délai pour que l'utilisateur puisse suivre
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        this.addLogEntry('Rangement terminé !', 'success');
        
        return results;
    }

    /**
     * Initialise le log d'exécution
     */
    initializeExecutionLog() {
        const logContainer = document.getElementById('executionLog');
        if (logContainer) {
            logContainer.innerHTML = '';
        }
    }

    /**
     * Ajoute une entrée au log
     */
    addLogEntry(message, type = 'info') {
        const logContainer = document.getElementById('executionLog');
        if (!logContainer) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const time = new Date().toLocaleTimeString();
        entry.innerHTML = `
            <span style="opacity: 0.7;">[${time}]</span>
            <span>${message}</span>
        `;
        
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    /**
     * Met à jour la progression d'exécution
     */
    updateExecutionProgress(currentDomain, currentAction, processed, total) {
        // Mettre à jour le domaine actuel
        const domainName = document.getElementById('currentDomainName');
        const domainAction = document.getElementById('currentDomainAction');
        
        if (domainName) domainName.textContent = currentDomain;
        if (domainAction) {
            const actionText = currentAction.action === 'create-new' 
                ? `Création du dossier "${currentAction.targetFolder}"`
                : `Déplacement vers "${currentAction.targetFolder}"`;
            domainAction.textContent = actionText;
        }
        
        // Mettre à jour la progression globale
        const percent = Math.round((processed / total) * 100);
        const progressBar = document.getElementById('executionProgressBar');
        const progressPercent = document.getElementById('executionPercent');
        const progressStatus = document.getElementById('executionStatus');
        
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressPercent) progressPercent.textContent = `${percent}%`;
        if (progressStatus) progressStatus.textContent = `${processed} domaines traités sur ${total}`;
    }

    /**
     * Affiche les résultats finaux
     */
    showFinalResults(results) {
        // Mettre à jour les statistiques finales
        document.getElementById('finalEmailsMoved').textContent = results.emailsMoved.toLocaleString();
        document.getElementById('finalFoldersCreated').textContent = results.foldersCreated;
        document.getElementById('finalTimeElapsed').textContent = `${results.timeElapsed}s`;
        
        // Générer le récapitulatif détaillé
        this.generateFinalActionsList(results.actions);
        
        this.showStep('results');
    }

    /**
     * Génère la liste finale des actions
     */
    generateFinalActionsList(actions) {
        const actionsList = document.getElementById('finalActionsList');
        if (!actionsList) return;
        
        actionsList.innerHTML = '';
        
        actions.forEach(action => {
            const item = document.createElement('div');
            item.className = 'action-item';
            
            const iconClass = action.success ? 'fa-check-circle' : 'fa-times-circle';
            const iconColor = action.success ? '#10b981' : '#dc2626';
            
            item.innerHTML = `
                <div class="action-details">
                    <div class="action-icon" style="background: ${action.success ? '#d1fae5' : '#fee2e2'}; color: ${iconColor};">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div>
                        <div class="action-text">${action.domain}</div>
                        <div style="font-size: 12px; color: #6b7280;">
                            ${action.success ? 
                                `Déplacé vers "${action.targetFolder}"${action.folderCreated ? ' (nouveau dossier)' : ''}` :
                                `Erreur: ${action.error}`
                            }
                        </div>
                    </div>
                </div>
                <div class="action-count">${action.emailCount} emails</div>
            `;
            
            actionsList.appendChild(item);
        });
    }

    /**
     * Réinitialise le formulaire
     */
    resetForm() {
        this.showStep('configure');
        document.getElementById('organizeForm')?.reset();
        
        this.setDefaultDates();
        this.currentAnalysis = null;
        this.selectedActions.clear();
        this.isProcessing = false;
    }

    // ================================================
    // CONFIGURATION ET INITIALISATION
    // ================================================
    
    configure(options = {}) {
        const {
            excludeDomains = [],
            excludeEmails = [],
            onProgress = null,
            createFolders = true,
            maxEmailsPerBatch = 50
        } = options;

        this.excludedDomains = new Set(excludeDomains.map(d => d.toLowerCase()));
        this.excludedEmails = new Set(excludeEmails.map(e => e.toLowerCase()));
        this.progressCallback = onProgress;
        this.createFolders = createFolders;
        this.maxEmailsPerBatch = maxEmailsPerBatch;
    }

    // ================================================
    // ANALYSE DES EMAILS
    // ================================================
    
    async analyzeEmails(filters = {}) {
        console.log('[DomainOrganizer] Starting analysis...');
        
        try {
            this.isProcessing = true;
            this.resetAnalysis();
            
            this.updateProgress({ 
                percent: 10, 
                message: 'Chargement des dossiers existants...',
                stage: 'Chargement des dossiers'
            });
            await this.loadExistingFolders();
            
            this.updateProgress({ 
                percent: 30, 
                message: 'Récupération des emails...',
                stage: 'Récupération des emails'
            });
            const emails = await this.fetchEmails(filters);
            
            this.updateProgress({ 
                percent: 60, 
                message: 'Analyse des domaines...',
                stage: 'Analyse des domaines'
            });
            await this.analyzeDomains(emails);
            
            this.updateProgress({ 
                percent: 90, 
                message: 'Génération des suggestions...',
                stage: 'Génération des suggestions'
            });
            const results = this.finalizeAnalysis();
            
            this.updateProgress({ 
                percent: 100, 
                message: 'Analyse terminée',
                stage: 'Terminé'
            });
            
            return results;
            
        } catch (error) {
            console.error('[DomainOrganizer] Analysis failed:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    updateProgress(progress) {
        if (this.progressCallback) {
            this.progressCallback(progress);
        }
    }

    async loadExistingFolders() {
        try {
            const folders = await window.mailService.getFolders();
            this.existingFolders.clear();
            
            folders.forEach(folder => {
                this.existingFolders.set(folder.displayName.toLowerCase(), {
                    id: folder.id,
                    displayName: folder.displayName,
                    totalItemCount: folder.totalItemCount || 0
                });
            });
            
            console.log(`[DomainOrganizer] Loaded ${this.existingFolders.size} folders`);
        } catch (error) {
            console.error('[DomainOrganizer] Error loading folders:', error);
            throw error;
        }
    }

    async fetchEmails(filters) {
        const { startDate, endDate, folders = ['inbox'] } = filters;
        const allEmails = [];
        
        for (const folder of folders) {
            try {
                const options = {
                    top: 1000,
                    orderBy: 'receivedDateTime desc'
                };
                
                if (startDate) options.startDate = startDate;
                if (endDate) options.endDate = endDate;
                
                const emails = await window.mailService.getEmailsFromFolder(folder, options);
                allEmails.push(...emails);
                
                console.log(`[DomainOrganizer] Fetched ${emails.length} emails from ${folder}`);
            } catch (error) {
                console.warn(`[DomainOrganizer] Error fetching from ${folder}:`, error);
            }
        }
        
        return allEmails;
    }

    async analyzeDomains(emails) {
        this.domainAnalysis.clear();
        this.emailsByDomain.clear();
        
        for (const email of emails) {
            const domain = this.extractDomain(email);
            if (!domain || this.shouldExclude(domain, email)) continue;
            
            if (!this.emailsByDomain.has(domain)) {
                this.emailsByDomain.set(domain, []);
            }
            this.emailsByDomain.get(domain).push(email);
            
            if (!this.domainAnalysis.has(domain)) {
                this.domainAnalysis.set(domain, {
                    domain: domain,
                    count: 0,
                    samples: [],
                    existingFolder: null,
                    suggestedFolder: null,
                    action: 'none'
                });
            }
            
            const analysis = this.domainAnalysis.get(domain);
            analysis.count++;
            
            if (analysis.samples.length < 3) {
                analysis.samples.push({
                    subject: email.subject,
                    from: email.from?.emailAddress?.name || email.from?.emailAddress?.address
                });
            }
        }
        
        this.domainAnalysis.forEach((analysis, domain) => {
            this.determineDomainAction(domain, analysis);
        });
    }

    determineDomainAction(domain, analysis) {
        const existingFolder = this.findExistingFolder(domain);
        
        if (existingFolder) {
            analysis.existingFolder = existingFolder;
            analysis.suggestedFolder = existingFolder.displayName;
            analysis.action = 'move-existing';
        } else {
            analysis.suggestedFolder = domain;
            analysis.action = 'create-new';
        }
    }

    findExistingFolder(domain) {
        if (this.existingFolders.has(domain)) {
            return this.existingFolders.get(domain);
        }
        
        const domainParts = domain.split('.');
        if (domainParts.length > 1) {
            const mainDomain = domainParts[0];
            if (this.existingFolders.has(mainDomain)) {
                return this.existingFolders.get(mainDomain);
            }
        }
        
        return null;
    }

    // ================================================
    // EXÉCUTION DES ACTIONS
    // ================================================
    
    async processDomain(domain, action) {
        const emails = this.emailsByDomain.get(domain) || [];
        const result = { success: false, emailsMoved: 0, folderCreated: false, error: null };
        
        if (emails.length === 0) {
            result.success = true;
            return result;
        }
        
        try {
            let targetFolderId;
            
            if (action.action === 'create-new' && this.createFolders) {
                const newFolder = await this.createFolder(action.targetFolder);
                targetFolderId = newFolder.id;
                result.folderCreated = true;
            } else if (action.existingFolderId) {
                targetFolderId = action.existingFolderId;
            } else {
                throw new Error('No target folder specified');
            }
            
            const batches = this.createBatches(emails, this.maxEmailsPerBatch);
            for (const batch of batches) {
                await this.moveEmailBatch(batch, targetFolderId);
                result.emailsMoved += batch.length;
            }
            
            result.success = true;
        } catch (error) {
            result.error = error.message;
        }
        
        return result;
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
        
        if (!response.ok) throw new Error(`Failed to create folder: ${response.statusText}`);
        
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
        
        if (!response.ok) throw new Error(`Batch move failed: ${response.statusText}`);
        
        return await response.json();
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
    extractDomain(email) {
        try {
            if (!email.from?.emailAddress?.address) return null;
            const emailAddress = email.from.emailAddress.address.toLowerCase();
            return emailAddress.split('@')[1] || null;
        } catch (error) {
            return null;
        }
    }

    shouldExclude(domain, email) {
        if (this.excludedDomains.has(domain.toLowerCase())) return true;
        
        const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
        if (emailAddress && this.excludedEmails.has(emailAddress)) return true;
        
        return false;
    }

    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    resetAnalysis() {
        this.domainAnalysis.clear();
        this.emailsByDomain.clear();
    }

    finalizeAnalysis() {
        const results = {
            totalEmails: 0,
            totalDomains: this.domainAnalysis.size,
            domainsToCreate: 0,
            domainsWithExisting: 0,
            domains: []
        };
        
        this.domainAnalysis.forEach((analysis, domain) => {
            results.totalEmails += analysis.count;
            
            if (analysis.action === 'create-new') results.domainsToCreate++;
            else if (analysis.action === 'move-existing') results.domainsWithExisting++;
            
            results.domains.push({
                domain: domain,
                count: analysis.count,
                samples: analysis.samples,
                action: analysis.action,
                existingFolder: analysis.existingFolder,
                suggestedFolder: analysis.suggestedFolder
            });
        });
        
        results.domains.sort((a, b) => b.count - a.count);
        return results;
    }

    getPreparedActions() {
        const actions = new Map();
        
        this.domainAnalysis.forEach((analysis, domain) => {
            if (analysis.count > 0) {
                actions.set(domain, {
                    domain: domain,
                    action: analysis.action,
                    targetFolder: analysis.suggestedFolder,
                    existingFolderId: analysis.existingFolder?.id,
                    emailCount: analysis.count,
                    selected: true
                });
            }
        });
        
        return actions;
    }
}

// Créer l'instance globale
window.domainOrganizer = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ Module chargé - Version intuitive');

// ================================================
// GESTION AUTONOME - Sans PageManager
// ================================================

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DomainOrganizer] Initialisation autonome...');
    
    // Écouter directement les clics sur le bouton "Ranger" avec une priorité élevée
    document.addEventListener('click', function(e) {
        const rangerButton = e.target.closest('[data-page="ranger"]');
        if (!rangerButton) return;
        
        // IMPORTANT : Empêcher TOUS les autres handlers
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[DomainOrganizer] Bouton Ranger cliqué - Gestion exclusive');
        
        // Vérifier l'authentification
        if (!window.authService?.isAuthenticated()) {
            window.uiManager?.showToast('Veuillez vous connecter pour utiliser cette fonctionnalité', 'warning');
            return;
        }
        
        // Afficher directement l'interface
        window.domainOrganizer.showPage();
        
        return false;
    }, true);
});

// Alternative : Remplacer le comportement du bouton au chargement
window.addEventListener('load', function() {
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) {
        // Cloner le bouton pour supprimer tous les event listeners existants
        const newButton = rangerButton.cloneNode(true);
        rangerButton.parentNode.replaceChild(newButton, rangerButton);
        
        // Ajouter notre propre listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('[DomainOrganizer] Clic direct sur Ranger');
            
            if (!window.authService?.isAuthenticated()) {
                window.uiManager?.showToast('Veuillez vous connecter', 'warning');
                return;
            }
            
            window.domainOrganizer.showPage();
        });
        
        console.log('[DomainOrganizer] ✅ Bouton Ranger reconfiguré pour gestion directe');
    }
});

// Méthode pour afficher la page directement
window.domainOrganizer.showPage = function() {
    console.log('[DomainOrganizer] Affichage de la page de rangement...');
    
    // Cacher la page de login
    const loginPage = document.getElementById('loginPage');
    if (loginPage) loginPage.style.display = 'none';
    
    // Récupérer le conteneur principal
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) {
        console.error('[DomainOrganizer] Element pageContent non trouvé');
        return;
    }
    
    // Afficher le conteneur
    pageContent.style.display = 'block';
    
    // Injecter notre HTML
    pageContent.innerHTML = this.getPageHTML();
    
    // Initialiser la page
    this.initializePage();
    
    // Force l'affichage de l'étape de configuration
    setTimeout(() => {
        const configStep = document.getElementById('configStep');
        if (configStep) {
            configStep.style.display = 'block';
            console.log('[DomainOrganizer] ✅ Configuration step forced to display');
        } else {
            console.error('[DomainOrganizer] ❌ configStep element not found');
        }
        
        // Debug: afficher tous les éléments step-content
        const allSteps = document.querySelectorAll('.step-content');
        console.log('[DomainOrganizer] All step elements found:', allSteps.length);
        allSteps.forEach((step, index) => {
            console.log(`Step ${index}: id=${step.id}, display=${step.style.display}`);
        });
    }, 100);
    
    // Mettre à jour la navigation active
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) {
        rangerButton.classList.add('active');
    }
    
    // Afficher la navigation si cachée
    const mainNav = document.getElementById('mainNav');
    if (mainNav) mainNav.style.display = 'flex';
    
    console.log('[DomainOrganizer] ✅ Page affichée avec succès');
};

// Exposer une méthode globale pour l'appel direct
window.showDomainOrganizer = function() {
    window.domainOrganizer.showPage();
};
