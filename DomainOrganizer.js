// ModernDomainOrganizer.js - Version automatique avec détection intelligente
// Détecte automatiquement les dossiers existants et organise intelligemment

class ModernDomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.currentStep = 'configuration';
        this.scanResults = null;
        this.organizationPlan = new Map();
        this.allFolders = new Map();
        this.emailsByDomain = new Map();
        this.totalEmailsScanned = 0;
        
        // Configuration par défaut
        this.config = {
            excludeDomains: ['gmail.com', 'outlook.com', 'hotmail.com'],
            excludeEmails: [],
            minEmailsPerDomain: 3,
            scanAllFolders: true
        };
        
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
                            <span>Plan d'action</span>
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
                                <p>Le système va analyser vos emails, détecter les dossiers existants et créer un plan d'organisation intelligent</p>
                            </div>

                            <div class="config-grid">
                                <div class="config-section">
                                    <h3>📧 Emails à analyser</h3>
                                    <div class="form-group">
                                        <label>Période d'analyse</label>
                                        <div class="date-range">
                                            <input type="date" id="startDate" placeholder="Date de début">
                                            <span>→</span>
                                            <input type="date" id="endDate" placeholder="Date de fin">
                                        </div>
                                        <div class="help-text">
                                            💡 Laissez vide pour analyser tous les emails
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>Nombre minimum d'emails par domaine</label>
                                        <input type="number" id="minEmails" value="3" min="1" max="50">
                                        <div class="help-text">
                                            🎯 Ignorer les domaines avec peu d'emails (recommandé: 3+)
                                        </div>
                                    </div>
                                </div>

                                <div class="config-section">
                                    <h3>🚫 Exclusions automatiques</h3>
                                    <div class="form-group">
                                        <label>Domaines à ignorer</label>
                                        <div class="tag-input" id="excludeDomainsContainer">
                                            <input type="text" id="excludeDomainInput" placeholder="Ajouter un domaine...">
                                        </div>
                                        <div class="help-text">
                                            🔧 Les grands fournisseurs sont déjà exclus par défaut
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>Emails spécifiques à ignorer</label>
                                        <div class="tag-input" id="excludeEmailsContainer">
                                            <input type="text" id="excludeEmailInput" placeholder="email@exemple.com">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="info-box">
                                <div class="info-icon">ℹ️</div>
                                <div class="info-content">
                                    <h4>Comment ça fonctionne ?</h4>
                                    <ul>
                                        <li><strong>Détection intelligente</strong> : Le système scanne vos dossiers existants</li>
                                        <li><strong>Correspondance automatique</strong> : Les emails sont associés aux dossiers correspondants</li>
                                        <li><strong>Création sélective</strong> : Seuls les nouveaux dossiers nécessaires sont créés</li>
                                        <li><strong>Organisation respectueuse</strong> : Vos dossiers existants sont préservés</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-primary" id="startScanBtn">
                                    <i class="fas fa-magic"></i>
                                    Analyser et créer le plan
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 2: Scanning -->
                    <div class="step-content hidden" id="step-scanning">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>🔍 Analyse intelligente en cours</h2>
                                <p>Scan complet de votre boîte mail et détection des dossiers...</p>
                            </div>

                            <div class="scan-progress">
                                <div class="progress-ring">
                                    <div class="progress-circle">
                                        <div class="progress-value" id="progressPercent">0%</div>
                                    </div>
                                </div>

                                <div class="scan-stats">
                                    <div class="stat">
                                        <span class="stat-number" id="scannedEmails">0</span>
                                        <span class="stat-label">Emails analysés</span>
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

                                <div class="scan-status" id="scanStatus">
                                    Initialisation...
                                </div>

                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="progressBar"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 3: Plan d'action -->
                    <div class="step-content hidden" id="step-plan">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>📋 Plan d'organisation automatique</h2>
                                <p>Voici ce qui sera effectué automatiquement après votre confirmation</p>
                            </div>

                            <div class="plan-summary" id="planSummary">
                                <!-- Rempli dynamiquement -->
                            </div>

                            <div class="plan-details">
                                <div class="plan-section" id="existingFoldersSection">
                                    <h3>📁 Dossiers existants utilisés</h3>
                                    <div class="plan-list" id="existingFoldersList">
                                        <!-- Rempli dynamiquement -->
                                    </div>
                                </div>

                                <div class="plan-section" id="newFoldersSection">
                                    <h3>✨ Nouveaux dossiers à créer</h3>
                                    <div class="plan-list" id="newFoldersList">
                                        <!-- Rempli dynamiquement -->
                                    </div>
                                </div>

                                <div class="plan-section" id="emailMovesSection">
                                    <h3>📧 Aperçu des déplacements</h3>
                                    <div class="plan-preview" id="emailMovesList">
                                        <!-- Rempli dynamiquement -->
                                    </div>
                                </div>
                            </div>

                            <div class="warning-box">
                                <div class="warning-icon">⚠️</div>
                                <div class="warning-content">
                                    <h3>Confirmation requise</h3>
                                    <p>Cette action va déplacer <strong id="totalEmailsCount">0</strong> emails vers leurs dossiers appropriés.</p>
                                    <p>Vos emails seront organisés automatiquement selon le plan ci-dessus.</p>
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                    <i class="fas fa-arrow-left"></i>
                                    Modifier la configuration
                                </button>
                                <button class="btn btn-primary" id="executeBtn">
                                    <i class="fas fa-play"></i>
                                    Exécuter le plan automatiquement
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 4: Execution -->
                    <div class="step-content hidden" id="step-execution">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>⚡ Exécution automatique</h2>
                                <p>Organisation de vos emails en cours...</p>
                            </div>

                            <div class="execution-progress">
                                <div class="progress-ring">
                                    <div class="progress-circle">
                                        <div class="progress-value" id="executionPercent">0%</div>
                                    </div>
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
                                </div>

                                <div class="execution-status" id="executionStatus">
                                    Préparation...
                                </div>

                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="executionProgressBar"></div>
                                </div>

                                <div class="execution-log" id="executionLog">
                                    <!-- Log en temps réel -->
                                </div>
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
                                <h2>🎉 Organisation terminée avec succès !</h2>
                                <p>Vos emails ont été automatiquement organisés</p>
                                
                                <div class="success-report" id="successReport">
                                    <!-- Rapport détaillé -->
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-primary" onclick="window.modernDomainOrganizer.restart()">
                                    <i class="fas fa-redo"></i>
                                    Nouvelle organisation
                                </button>
                            </div>
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
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                }

                /* Header avec progression */
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
                    min-width: 120px;
                    opacity: 0.5;
                    transition: all 0.3s ease;
                }

                .step.active {
                    opacity: 1;
                }

                .step.completed {
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
                    transition: all 0.3s ease;
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
                }

                .step.active span {
                    color: #1f2937;
                }

                /* Contenu des étapes */
                .step-content {
                    animation: fadeIn 0.3s ease-in-out;
                }

                .step-content.hidden {
                    display: none;
                }

                .step-card {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .card-header h2 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    color: #1f2937;
                }

                .card-header p {
                    font-size: 16px;
                    color: #6b7280;
                    margin: 0;
                }

                /* Configuration */
                .config-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                    margin-bottom: 32px;
                }

                .config-section h3 {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                    color: #1f2937;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 6px;
                }

                .form-group input[type="date"],
                .form-group input[type="number"],
                .form-group input[type="text"] {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .date-range {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .date-range span {
                    color: #6b7280;
                    font-weight: 500;
                }

                .help-text {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                /* Info box */
                .info-box {
                    background: #f0f9ff;
                    border: 1px solid #bae6fd;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .info-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .info-content h4 {
                    margin: 0 0 12px 0;
                    color: #0c4a6e;
                }

                .info-content ul {
                    margin: 0;
                    padding-left: 20px;
                    color: #0c4a6e;
                }

                .info-content li {
                    margin-bottom: 6px;
                }

                /* Tag input */
                .tag-input {
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    padding: 8px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    min-height: 48px;
                    align-items: center;
                }

                .tag-input input {
                    border: none;
                    outline: none;
                    flex: 1;
                    min-width: 120px;
                    padding: 4px;
                }

                .tag {
                    background: #eff6ff;
                    color: #1d4ed8;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .tag-remove {
                    cursor: pointer;
                    opacity: 0.7;
                }

                .tag-remove:hover {
                    opacity: 1;
                }

                /* Scanning */
                .scan-progress, .execution-progress {
                    text-align: center;
                    padding: 40px 0;
                }

                .progress-ring {
                    position: relative;
                    margin: 0 auto 32px;
                    width: 120px;
                    height: 120px;
                }

                .progress-circle {
                    width: 120px;
                    height: 120px;
                    border: 8px solid #e5e7eb;
                    border-top: 8px solid #3b82f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: spin 1s linear infinite;
                }

                .progress-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .scan-stats, .execution-stats {
                    display: flex;
                    justify-content: center;
                    gap: 48px;
                    margin-bottom: 24px;
                }

                .stat {
                    text-align: center;
                }

                .stat-number {
                    display: block;
                    font-size: 24px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 14px;
                    color: #6b7280;
                }

                .scan-status, .execution-status {
                    font-size: 16px;
                    color: #6b7280;
                    margin-bottom: 24px;
                }

                .progress-bar-container {
                    width: 100%;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    width: 0%;
                    transition: width 0.3s ease;
                }

                /* Plan d'action */
                .plan-summary {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 16px;
                }

                .summary-item {
                    text-align: center;
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

                .plan-details {
                    margin-bottom: 24px;
                }

                .plan-section {
                    margin-bottom: 24px;
                }

                .plan-section h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: #1f2937;
                }

                .plan-list {
                    max-height: 200px;
                    overflow-y: auto;
                }

                .plan-item {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .plan-item-info {
                    flex: 1;
                }

                .plan-item-name {
                    font-weight: 500;
                    color: #1f2937;
                }

                .plan-item-count {
                    font-size: 12px;
                    color: #6b7280;
                }

                .plan-item-action {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                }

                .action-new {
                    background: #d1fae5;
                    color: #065f46;
                }

                .action-existing {
                    background: #e0e7ff;
                    color: #3730a3;
                }

                .plan-preview {
                    max-height: 300px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    background: #fafafa;
                }

                .move-preview {
                    padding: 8px 0;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 14px;
                }

                .move-preview:last-child {
                    border-bottom: none;
                }

                .move-from {
                    color: #6b7280;
                }

                .move-to {
                    color: #3b82f6;
                    font-weight: 500;
                }

                /* Warning box */
                .warning-box {
                    background: #fef3cd;
                    border: 1px solid #fbbf24;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .warning-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .warning-content h3 {
                    margin: 0 0 8px 0;
                    color: #92400e;
                }

                .warning-content p {
                    margin: 0 0 8px 0;
                    color: #92400e;
                }

                /* Execution log */
                .execution-log {
                    max-height: 200px;
                    overflow-y: auto;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 20px;
                    font-family: monospace;
                    font-size: 12px;
                }

                .log-entry {
                    margin-bottom: 4px;
                    color: #6b7280;
                }

                .log-entry.success {
                    color: #059669;
                }

                .log-entry.error {
                    color: #dc2626;
                }

                .log-entry.info {
                    color: #3b82f6;
                }

                /* Buttons */
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

                /* Success */
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
                    animation: bounce 0.6s ease-in-out;
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
                    margin-bottom: 16px;
                }

                .report-section h4 {
                    margin: 0 0 8px 0;
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
                    display: flex;
                    justify-content: space-between;
                }

                /* Animations */
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% { transform: scale(1); }
                    40%, 43% { transform: scale(1.1); }
                    70% { transform: scale(1.05); }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .modern-organizer {
                        padding: 16px;
                    }

                    .config-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }

                    .scan-stats, .execution-stats {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .progress-steps {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .step-line {
                        display: none;
                    }

                    .action-bar {
                        flex-direction: column;
                    }

                    .plan-summary {
                        grid-template-columns: 1fr 1fr;
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
        this.initializeTagInputs();
        
        return true;
    }

    setupEventListeners() {
        document.getElementById('startScanBtn')?.addEventListener('click', () => this.startAnalysis());
        document.getElementById('executeBtn')?.addEventListener('click', () => this.executeOrganization());
    }

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate) startDate.valueAsDate = thirtyDaysAgo;
        if (endDate) endDate.valueAsDate = today;
    }

    initializeTagInputs() {
        this.initializeTagInput('excludeDomainsContainer', 'excludeDomainInput', this.config.excludeDomains);
        this.initializeTagInput('excludeEmailsContainer', 'excludeEmailInput', this.config.excludeEmails);
    }

    initializeTagInput(containerId, inputId, initialTags) {
        const container = document.getElementById(containerId);
        const input = document.getElementById(inputId);
        
        if (!container || !input) return;

        initialTags.forEach(tag => this.addTag(container, input, tag));

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = input.value.trim();
                if (value) {
                    this.addTag(container, input, value);
                    input.value = '';
                }
            }
        });

        input.addEventListener('blur', () => {
            const value = input.value.trim();
            if (value) {
                this.addTag(container, input, value);
                input.value = '';
            }
        });
    }

    addTag(container, input, value) {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${value}
            <span class="tag-remove" onclick="this.parentElement.remove()">×</span>
        `;
        container.insertBefore(tag, input);
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
    // ANALYSE INTELLIGENTE
    // ================================================

    async startAnalysis() {
        try {
            this.isProcessing = true;
            this.goToStep('scanning');
            
            const config = this.getConfigurationFromForm();
            
            // Étape 1: Charger les dossiers existants
            await this.loadAllFolders();
            this.updateProgress(15, 'Dossiers existants chargés');

            // Étape 2: Scanner les emails
            const emails = await this.scanAllEmails(config);
            this.updateProgress(50, 'Emails scannés');

            // Étape 3: Analyser les domaines
            await this.analyzeDomains(emails, config);
            this.updateProgress(75, 'Domaines analysés');

            // Étape 4: Créer le plan d'organisation
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
        
        const excludeDomains = Array.from(document.querySelectorAll('#excludeDomainsContainer .tag'))
            .map(tag => tag.textContent.replace('×', '').trim());
        
        const excludeEmails = Array.from(document.querySelectorAll('#excludeEmailsContainer .tag'))
            .map(tag => tag.textContent.replace('×', '').trim());

        return { startDate, endDate, minEmails, excludeDomains, excludeEmails };
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

    async scanAllEmails(config) {
        const allEmails = [];
        const foldersToScan = ['inbox', 'sentitems'];
        
        for (const folderName of foldersToScan) {
            try {
                const emails = await this.scanFolderCompletely(folderName, config);
                allEmails.push(...emails);
                
                this.updateStat('scannedEmails', allEmails.length);
                this.updateProgress(
                    20 + (allEmails.length / 2000) * 30,
                    `${allEmails.length} emails scannés`
                );
                
            } catch (error) {
                console.warn(`[ModernDomainOrganizer] Erreur scan ${folderName}:`, error);
            }
        }

        return allEmails;
    }

    async scanFolderCompletely(folderName, config) {
        const emails = [];
        let skip = 0;
        const batchSize = 100;
        let hasMore = true;

        while (hasMore) {
            try {
                const options = {
                    top: batchSize,
                    skip: skip,
                    orderBy: 'receivedDateTime desc'
                };

                if (config.startDate) options.startDate = config.startDate;
                if (config.endDate) options.endDate = config.endDate;

                const batch = await window.mailService.getEmailsFromFolder(folderName, options);
                
                if (batch.length === 0) {
                    hasMore = false;
                } else {
                    emails.push(...batch);
                    skip += batchSize;
                    
                    // Pause pour éviter les rate limits
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.warn(`[ModernDomainOrganizer] Erreur batch ${skip}:`, error);
                break;
            }
        }

        return emails;
    }

    async analyzeDomains(emails, config) {
        const domainCounts = new Map();
        
        for (const email of emails) {
            const domain = this.extractDomain(email);
            if (!domain) continue;
            
            if (this.shouldExcludeDomain(domain, config.excludeDomains)) continue;
            if (this.shouldExcludeEmail(email, config.excludeEmails)) continue;
            
            if (!domainCounts.has(domain)) {
                domainCounts.set(domain, {
                    count: 0,
                    emails: [],
                    samples: []
                });
            }
            
            const domainData = domainCounts.get(domain);
            domainData.count++;
            domainData.emails.push(email);
            
            if (domainData.samples.length < 3) {
                domainData.samples.push({
                    subject: email.subject,
                    from: email.from?.emailAddress?.name || email.from?.emailAddress?.address
                });
            }
        }

        // Filtrer par nombre minimum d'emails
        domainCounts.forEach((data, domain) => {
            if (data.count >= config.minEmails) {
                this.emailsByDomain.set(domain, data);
            }
        });

        this.updateStat('foundDomains', this.emailsByDomain.size);
    }

    createOrganizationPlan() {
        this.organizationPlan.clear();
        
        let newFoldersCount = 0;
        let existingFoldersCount = 0;
        
        this.emailsByDomain.forEach((data, domain) => {
            const existingFolder = this.findExistingFolder(domain);
            
            if (existingFolder) {
                // Utiliser le dossier existant
                this.organizationPlan.set(domain, {
                    domain,
                    action: 'use-existing',
                    targetFolder: existingFolder.displayName,
                    targetFolderId: existingFolder.id,
                    emailCount: data.count,
                    emails: data.emails
                });
                existingFoldersCount++;
            } else {
                // Créer un nouveau dossier
                this.organizationPlan.set(domain, {
                    domain,
                    action: 'create-new',
                    targetFolder: domain,
                    targetFolderId: null,
                    emailCount: data.count,
                    emails: data.emails
                });
                newFoldersCount++;
            }
        });

        this.updateStat('newFoldersNeeded', newFoldersCount);
        console.log(`[ModernDomainOrganizer] Plan créé: ${existingFoldersCount} existants, ${newFoldersCount} nouveaux`);
    }

    showOrganizationPlan() {
        this.goToStep('plan');
        
        // Résumé
        this.displayPlanSummary();
        
        // Dossiers existants
        this.displayExistingFolders();
        
        // Nouveaux dossiers
        this.displayNewFolders();
        
        // Aperçu des déplacements
        this.displayEmailMoves();
    }

    displayPlanSummary() {
        const summary = document.getElementById('planSummary');
        if (!summary) return;
        
        const totalEmails = Array.from(this.organizationPlan.values())
            .reduce((sum, plan) => sum + plan.emailCount, 0);
        
        const newFolders = Array.from(this.organizationPlan.values())
            .filter(plan => plan.action === 'create-new').length;
        
        const existingFolders = Array.from(this.organizationPlan.values())
            .filter(plan => plan.action === 'use-existing').length;

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
                <div class="summary-value">${newFolders}</div>
                <div class="summary-label">Nouveaux dossiers</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${existingFolders}</div>
                <div class="summary-label">Dossiers existants</div>
            </div>
        `;

        document.getElementById('totalEmailsCount').textContent = totalEmails.toLocaleString();
    }

    displayExistingFolders() {
        const container = document.getElementById('existingFoldersList');
        if (!container) return;
        
        const existingPlans = Array.from(this.organizationPlan.values())
            .filter(plan => plan.action === 'use-existing');
        
        if (existingPlans.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">Aucun dossier existant correspondant</p>';
            return;
        }
        
        container.innerHTML = existingPlans.map(plan => `
            <div class="plan-item">
                <div class="plan-item-info">
                    <div class="plan-item-name">📁 ${plan.targetFolder}</div>
                    <div class="plan-item-count">${plan.emailCount} emails de ${plan.domain}</div>
                </div>
                <div class="plan-item-action action-existing">Utiliser existant</div>
            </div>
        `).join('');
    }

    displayNewFolders() {
        const container = document.getElementById('newFoldersList');
        if (!container) return;
        
        const newPlans = Array.from(this.organizationPlan.values())
            .filter(plan => plan.action === 'create-new');
        
        if (newPlans.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">Aucun nouveau dossier nécessaire</p>';
            return;
        }
        
        container.innerHTML = newPlans.map(plan => `
            <div class="plan-item">
                <div class="plan-item-info">
                    <div class="plan-item-name">✨ ${plan.targetFolder}</div>
                    <div class="plan-item-count">${plan.emailCount} emails de ${plan.domain}</div>
                </div>
                <div class="plan-item-action action-new">Créer nouveau</div>
            </div>
        `).join('');
    }

    displayEmailMoves() {
        const container = document.getElementById('emailMovesList');
        if (!container) return;
        
        const moves = Array.from(this.organizationPlan.values())
            .slice(0, 10) // Limiter l'aperçu
            .map(plan => `
                <div class="move-preview">
                    <span class="move-from">${plan.emailCount} emails de ${plan.domain}</span>
                    <span style="margin: 0 8px;">→</span>
                    <span class="move-to">${plan.targetFolder}</span>
                </div>
            `).join('');
        
        container.innerHTML = moves + 
            (this.organizationPlan.size > 10 ? 
                `<div class="move-preview" style="text-align: center; color: #6b7280;">
                    ... et ${this.organizationPlan.size - 10} autres domaines
                </div>` : '');
    }

    // ================================================
    // EXÉCUTION AUTOMATIQUE
    // ================================================

    async executeOrganization() {
        try {
            this.isProcessing = true;
            this.goToStep('execution');
            
            const results = {
                foldersCreated: 0,
                emailsMoved: 0,
                domainsProcessed: 0,
                errors: [],
                createdFolders: [],
                processedDomains: []
            };
            
            this.addExecutionLog('🚀 Début de l\'organisation automatique', 'info');
            
            const totalDomains = this.organizationPlan.size;
            let processed = 0;
            
            for (const [domain, plan] of this.organizationPlan) {
                try {
                    this.updateExecutionProgress(
                        (processed / totalDomains) * 100,
                        `Traitement de ${domain}...`
                    );
                    
                    // Créer le dossier si nécessaire
                    let targetFolderId = plan.targetFolderId;
                    
                    if (plan.action === 'create-new') {
                        this.addExecutionLog(`📁 Création du dossier "${plan.targetFolder}"`, 'info');
                        const newFolder = await this.createFolder(plan.targetFolder);
                        targetFolderId = newFolder.id;
                        results.foldersCreated++;
                        results.createdFolders.push(plan.targetFolder);
                        this.updateExecutionStat('foldersCreated', results.foldersCreated);
                    } else {
                        this.addExecutionLog(`📁 Utilisation du dossier existant "${plan.targetFolder}"`, 'info');
                    }
                    
                    // Déplacer les emails par lots
                    const batchSize = 15;
                    let moved = 0;
                    
                    for (let i = 0; i < plan.emails.length; i += batchSize) {
                        const batch = plan.emails.slice(i, i + batchSize);
                        await this.moveEmailBatch(batch, targetFolderId);
                        moved += batch.length;
                        results.emailsMoved += batch.length;
                        
                        this.updateExecutionStat('emailsMoved', results.emailsMoved);
                        
                        // Pause entre les lots
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                    
                    this.addExecutionLog(`✅ ${moved} emails de ${domain} déplacés vers "${plan.targetFolder}"`, 'success');
                    results.processedDomains.push(`${domain} (${moved} emails)`);
                    
                } catch (error) {
                    console.error(`[ModernDomainOrganizer] Erreur ${domain}:`, error);
                    this.addExecutionLog(`❌ Erreur pour ${domain}: ${error.message}`, 'error');
                    results.errors.push({ domain, error: error.message });
                }
                
                processed++;
                results.domainsProcessed = processed;
                this.updateExecutionStat('domainsProcessed', processed);
            }
            
            this.updateExecutionProgress(100, 'Organisation terminée !');
            this.addExecutionLog('🎉 Organisation automatique terminée avec succès !', 'success');
            
            // Afficher le rapport final
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
        reportHTML += `<li><span>Emails organisés:</span> <strong>${results.emailsMoved.toLocaleString()}</strong></li>`;
        reportHTML += `<li><span>Domaines traités:</span> <strong>${results.domainsProcessed}</strong></li>`;
        reportHTML += `<li><span>Dossiers créés:</span> <strong>${results.foldersCreated}</strong></li>`;
        reportHTML += '</ul></div>';
        
        if (results.createdFolders.length > 0) {
            reportHTML += '<div class="report-section">';
            reportHTML += '<h4>✨ Nouveaux dossiers créés</h4>';
            reportHTML += '<ul class="report-list">';
            results.createdFolders.forEach(folder => {
                reportHTML += `<li>📁 ${folder}</li>`;
            });
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
                reportHTML += `<li style="color: #6b7280;">... et ${results.processedDomains.length - 10} autres</li>`;
            }
            reportHTML += '</ul></div>';
        }
        
        if (results.errors.length > 0) {
            reportHTML += '<div class="report-section">';
            reportHTML += '<h4>⚠️ Erreurs rencontrées</h4>';
            reportHTML += '<ul class="report-list">';
            results.errors.forEach(error => {
                reportHTML += `<li style="color: #dc2626;">${error.domain}: ${error.error}</li>`;
            });
            reportHTML += '</ul></div>';
        }
        
        report.innerHTML = reportHTML;
    }

    // ================================================
    // UTILITAIRES
    // ================================================

    updateProgress(percent, message) {
        const progressPercent = document.getElementById('progressPercent');
        const progressBar = document.getElementById('progressBar');
        const scanStatus = document.getElementById('scanStatus');

        if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (scanStatus) scanStatus.textContent = message;
    }

    updateStat(statId, value) {
        const element = document.getElementById(statId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }

    updateExecutionProgress(percent, message) {
        const progressPercent = document.getElementById('executionPercent');
        const progressBar = document.getElementById('executionProgressBar');
        const status = document.getElementById('executionStatus');

        if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
        if (progressBar) progressBar.style.width = `${percent}%`;
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
        const allExcluded = [...this.config.excludeDomains, ...excludedDomains];
        return allExcluded.some(excluded => 
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

    restart() {
        this.currentStep = 'configuration';
        this.scanResults = null;
        this.organizationPlan.clear();
        this.emailsByDomain.clear();
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

console.log('[ModernDomainOrganizer] ✅ Module automatique chargé');
