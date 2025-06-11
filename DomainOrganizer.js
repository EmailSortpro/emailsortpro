// ModernDomainOrganizer.js - Version optimisée et corrigée
// Interface compacte avec scan efficace

class ModernDomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.currentStep = 'configuration';
        this.scanResults = null;
        this.organizationPlan = new Map();
        this.allFolders = new Map();
        this.emailsByDomain = new Map();
        this.totalEmailsScanned = 0;
        
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
                            <span>Plan</span>
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
                                <h2>🎯 Configuration du rangement</h2>
                                <p>Le système va analyser vos emails et créer automatiquement les dossiers nécessaires</p>
                            </div>

                            <div class="config-compact">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Date de début</label>
                                        <input type="date" id="startDate">
                                    </div>
                                    <div class="form-group">
                                        <label>Date de fin</label>
                                        <input type="date" id="endDate">
                                    </div>
                                    <div class="form-group">
                                        <label>Min emails/domaine</label>
                                        <input type="number" id="minEmails" value="3" min="1" max="20">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Domaines à exclure (optionnel)</label>
                                    <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com" 
                                           value="gmail.com, outlook.com, hotmail.com">
                                </div>

                                <div class="form-group">
                                    <label>Emails spécifiques à exclure (optionnel)</label>
                                    <textarea id="excludeEmails" placeholder="noreply@exemple.com&#10;contact@service.com" rows="2"></textarea>
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-primary" id="startScanBtn">
                                    <i class="fas fa-search"></i>
                                    Analyser et créer le plan
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 2: Scanning -->
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
                                        <span class="stat-label">Dossiers existants</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-number" id="newFoldersNeeded">0</span>
                                        <span class="stat-label">Nouveaux</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 3: Plan -->
                    <div class="step-content hidden" id="step-plan">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>📋 Plan d'organisation</h2>
                                <p>Voici ce qui sera effectué</p>
                            </div>

                            <div class="plan-summary" id="planSummary">
                                <!-- Rempli dynamiquement -->
                            </div>

                            <div class="plan-sections">
                                <div class="plan-section" id="existingSection">
                                    <h3>📁 Dossiers existants utilisés</h3>
                                    <div class="plan-list" id="existingList"></div>
                                </div>

                                <div class="plan-section" id="newSection">
                                    <h3>✨ Nouveaux dossiers à créer</h3>
                                    <div class="plan-list" id="newList"></div>
                                </div>
                            </div>

                            <div class="warning-box">
                                <div class="warning-icon">⚠️</div>
                                <div>
                                    <strong>Attention :</strong> Cette action va déplacer <strong id="totalEmailsCount">0</strong> emails vers leurs dossiers.
                                </div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-secondary" onclick="window.modernDomainOrganizer.goToStep('configuration')">
                                    Retour
                                </button>
                                <button class="btn btn-primary" id="executeBtn">
                                    Exécuter maintenant
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 4: Execution -->
                    <div class="step-content hidden" id="step-execution">
                        <div class="step-card">
                            <div class="card-header">
                                <h2>⚡ Exécution en cours</h2>
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

                                <div class="execution-log" id="executionLog"></div>
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
                                <h2>🎉 Rangement terminé !</h2>
                                <div class="success-report" id="successReport"></div>
                            </div>

                            <div class="action-bar">
                                <button class="btn btn-primary" onclick="window.modernDomainOrganizer.restart()">
                                    <i class="fas fa-redo"></i>
                                    Nouveau rangement
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
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                    height: 100vh;
                    overflow-y: auto;
                }

                /* Header compact */
                .organizer-header {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
                    transition: all 0.3s ease;
                }

                .step.active, .step.completed {
                    opacity: 1;
                }

                .step-circle {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #6b7280;
                    font-size: 14px;
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
                }

                /* Contenu compact */
                .step-content {
                    animation: fadeIn 0.3s ease;
                }

                .step-content.hidden {
                    display: none;
                }

                .step-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .card-header h2 {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0 0 6px 0;
                    color: #1f2937;
                }

                .card-header p {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                }

                /* Configuration compacte */
                .config-compact {
                    margin-bottom: 20px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 120px;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .form-group label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #374151;
                }

                .form-group input,
                .form-group textarea {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.2s;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                .form-group textarea {
                    resize: vertical;
                    font-family: inherit;
                }

                /* Progress bars */
                .progress-container {
                    position: relative;
                    width: 100%;
                    margin-bottom: 16px;
                }

                .progress-bar {
                    width: 100%;
                    height: 12px;
                    background: #e5e7eb;
                    border-radius: 6px;
                    overflow: hidden;
                    position: relative;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    width: 0%;
                    transition: width 0.3s ease;
                    border-radius: 6px;
                }

                .progress-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 11px;
                    font-weight: 600;
                    color: #1f2937;
                }

                /* Stats compactes */
                .scan-stats, .execution-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .stat {
                    text-align: center;
                    padding: 8px;
                    background: #f8fafc;
                    border-radius: 6px;
                }

                .stat-number {
                    display: block;
                    font-size: 18px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 11px;
                    color: #6b7280;
                }

                /* Plan compact */
                .plan-summary {
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    text-align: center;
                }

                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .summary-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .summary-label {
                    font-size: 11px;
                    color: #6b7280;
                }

                .plan-sections {
                    margin-bottom: 16px;
                }

                .plan-section {
                    margin-bottom: 16px;
                }

                .plan-section h3 {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    color: #1f2937;
                }

                .plan-list {
                    max-height: 150px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    background: #fafafa;
                }

                .plan-item {
                    padding: 8px 12px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 13px;
                }

                .plan-item:last-child {
                    border-bottom: none;
                }

                .plan-item-name {
                    font-weight: 500;
                    color: #1f2937;
                }

                .plan-item-count {
                    color: #6b7280;
                    font-size: 12px;
                }

                /* Warning compact */
                .warning-box {
                    background: #fef3cd;
                    border: 1px solid #fbbf24;
                    border-radius: 8px;
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    color: #92400e;
                }

                .warning-icon {
                    font-size: 16px;
                    flex-shrink: 0;
                }

                /* Execution log */
                .execution-log {
                    max-height: 120px;
                    overflow-y: auto;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 8px;
                    font-family: monospace;
                    font-size: 11px;
                    margin-top: 12px;
                }

                .log-entry {
                    margin-bottom: 2px;
                    color: #6b7280;
                }

                .log-entry.success { color: #059669; }
                .log-entry.error { color: #dc2626; }
                .log-entry.info { color: #3b82f6; }

                /* Buttons */
                .action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-top: 20px;
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
                    transition: all 0.2s ease;
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
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                /* Success compact */
                .success-card {
                    text-align: center;
                }

                .success-animation {
                    margin-bottom: 16px;
                }

                .success-circle {
                    width: 60px;
                    height: 60px;
                    background: #10b981;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                    animation: bounce 0.6s ease;
                }

                .success-circle i {
                    font-size: 24px;
                    color: white;
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
                    margin: 0 0 6px 0;
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

                /* Animations */
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
                        padding: 12px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }

                    .scan-stats, .execution-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .plan-summary {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .progress-steps {
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .step-line {
                        display: none;
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
    // ANALYSE OPTIMISÉE
    // ================================================

    async startAnalysis() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.goToStep('scanning');
            
            const config = this.getConfigurationFromForm();
            console.log('[ModernDomainOrganizer] Configuration:', config);
            
            // Réinitialiser
            this.emailsByDomain.clear();
            this.allFolders.clear();
            this.organizationPlan.clear();
            
            // Étape 1: Charger les dossiers (15%)
            this.updateProgress(5, 'Chargement des dossiers...');
            await this.loadAllFolders();
            this.updateProgress(15, 'Dossiers chargés');

            // Étape 2: Scanner les emails (15% -> 70%)
            this.updateProgress(20, 'Début du scan des emails...');
            const emails = await this.scanEmails(config);
            this.updateProgress(70, `${emails.length} emails scannés`);

            // Étape 3: Analyser les domaines (70% -> 85%)
            this.updateProgress(75, 'Analyse des domaines...');
            await this.analyzeDomains(emails, config);
            this.updateProgress(85, 'Domaines analysés');

            // Étape 4: Créer le plan (85% -> 100%)
            this.updateProgress(90, 'Création du plan...');
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
        
        const excludeDomains = document.getElementById('excludeDomains').value
            .split(',')
            .map(d => d.trim())
            .filter(d => d);
        
        const excludeEmails = document.getElementById('excludeEmails').value
            .split('\n')
            .map(e => e.trim())
            .filter(e => e);

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

    async scanEmails(config) {
        const allEmails = [];
        
        // Scanner seulement la boîte de réception pour éviter les doublons
        try {
            console.log('[ModernDomainOrganizer] Scan de la boîte de réception...');
            
            const options = {
                top: 500, // Limiter pour éviter les timeouts
                orderBy: 'receivedDateTime desc'
            };

            if (config.startDate) options.startDate = config.startDate;
            if (config.endDate) options.endDate = config.endDate;

            // Une seule requête pour éviter la boucle infinie
            const emails = await window.mailService.getEmailsFromFolder('inbox', options);
            allEmails.push(...emails);
            
            console.log(`[ModernDomainOrganizer] ${emails.length} emails récupérés`);
            this.updateStat('scannedEmails', emails.length);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur scan inbox:', error);
            throw error;
        }

        return allEmails;
    }

    async analyzeDomains(emails, config) {
        const domainCounts = new Map();
        
        console.log(`[ModernDomainOrganizer] Analyse de ${emails.length} emails...`);
        
        for (const email of emails) {
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
        }

        // Filtrer par nombre minimum d'emails
        domainCounts.forEach((data, domain) => {
            if (data.count >= config.minEmails) {
                this.emailsByDomain.set(domain, data);
            }
        });

        console.log(`[ModernDomainOrganizer] ${this.emailsByDomain.size} domaines valides trouvés`);
        this.updateStat('foundDomains', this.emailsByDomain.size);
    }

    createOrganizationPlan() {
        this.organizationPlan.clear();
        
        let newFoldersCount = 0;
        
        this.emailsByDomain.forEach((data, domain) => {
            const existingFolder = this.findExistingFolder(domain);
            
            if (existingFolder) {
                this.organizationPlan.set(domain, {
                    domain,
                    action: 'use-existing',
                    targetFolder: existingFolder.displayName,
                    targetFolderId: existingFolder.id,
                    emailCount: data.count,
                    emails: data.emails
                });
            } else {
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
        console.log(`[ModernDomainOrganizer] Plan créé: ${this.organizationPlan.size} domaines`);
    }

    showOrganizationPlan() {
        this.goToStep('plan');
        
        const summary = document.getElementById('planSummary');
        const existingList = document.getElementById('existingList');
        const newList = document.getElementById('newList');
        
        if (!summary || !existingList || !newList) return;
        
        const totalEmails = Array.from(this.organizationPlan.values())
            .reduce((sum, plan) => sum + plan.emailCount, 0);
        
        const newFolders = Array.from(this.organizationPlan.values())
            .filter(plan => plan.action === 'create-new');
        
        const existingFolders = Array.from(this.organizationPlan.values())
            .filter(plan => plan.action === 'use-existing');

        // Résumé
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
                <div class="summary-label">Nouveaux dossiers</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${existingFolders.length}</div>
                <div class="summary-label">Dossiers existants</div>
            </div>
        `;

        // Dossiers existants
        if (existingFolders.length > 0) {
            existingList.innerHTML = existingFolders.map(plan => `
                <div class="plan-item">
                    <div class="plan-item-name">📁 ${plan.targetFolder}</div>
                    <div class="plan-item-count">${plan.emailCount} emails de ${plan.domain}</div>
                </div>
            `).join('');
        } else {
            existingList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">Aucun dossier existant correspondant</div>';
        }

        // Nouveaux dossiers
        if (newFolders.length > 0) {
            newList.innerHTML = newFolders.map(plan => `
                <div class="plan-item">
                    <div class="plan-item-name">✨ ${plan.targetFolder}</div>
                    <div class="plan-item-count">${plan.emailCount} emails de ${plan.domain}</div>
                </div>
            `).join('');
        } else {
            newList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">Aucun nouveau dossier nécessaire</div>';
        }

        document.getElementById('totalEmailsCount').textContent = totalEmails.toLocaleString();
    }

    // ================================================
    // EXÉCUTION
    // ================================================

    async executeOrganization() {
        if (this.isProcessing) return;
        
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
            
            this.addExecutionLog('🚀 Début de l\'organisation', 'info');
            
            const totalDomains = this.organizationPlan.size;
            let processed = 0;
            
            for (const [domain, plan] of this.organizationPlan) {
                try {
                    this.updateExecutionProgress(
                        (processed / totalDomains) * 100,
                        `Traitement de ${domain}...`
                    );
                    
                    let targetFolderId = plan.targetFolderId;
                    
                    if (plan.action === 'create-new') {
                        this.addExecutionLog(`📁 Création du dossier "${plan.targetFolder}"`, 'info');
                        const newFolder = await this.createFolder(plan.targetFolder);
                        targetFolderId = newFolder.id;
                        results.foldersCreated++;
                        results.createdFolders.push(plan.targetFolder);
                        this.updateExecutionStat('foldersCreated', results.foldersCreated);
                    }
                    
                    // Déplacer les emails par petits lots
                    const batchSize = 10;
                    let moved = 0;
                    
                    for (let i = 0; i < plan.emails.length; i += batchSize) {
                        const batch = plan.emails.slice(i, i + batchSize);
                        await this.moveEmailBatch(batch, targetFolderId);
                        moved += batch.length;
                        results.emailsMoved += batch.length;
                        
                        this.updateExecutionStat('emailsMoved', results.emailsMoved);
                        
                        // Pause pour éviter les rate limits
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }
                    
                    this.addExecutionLog(`✅ ${moved} emails de ${domain} déplacés`, 'success');
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
            this.addExecutionLog('🎉 Organisation terminée avec succès !', 'success');
            
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
        reportHTML += '<h4>📊 Résumé</h4>';
        reportHTML += '<ul class="report-list">';
        reportHTML += `<li>Emails organisés: <strong>${results.emailsMoved.toLocaleString()}</strong></li>`;
        reportHTML += `<li>Domaines traités: <strong>${results.domainsProcessed}</strong></li>`;
        reportHTML += `<li>Dossiers créés: <strong>${results.foldersCreated}</strong></li>`;
        reportHTML += '</ul></div>';
        
        if (results.createdFolders.length > 0) {
            reportHTML += '<div class="report-section">';
            reportHTML += '<h4>✨ Nouveaux dossiers</h4>';
            reportHTML += '<ul class="report-list">';
            results.createdFolders.slice(0, 10).forEach(folder => {
                reportHTML += `<li>📁 ${folder}</li>`;
            });
            if (results.createdFolders.length > 10) {
                reportHTML += `<li>... et ${results.createdFolders.length - 10} autres</li>`;
            }
            reportHTML += '</ul></div>';
        }
        
        if (results.errors.length > 0) {
            reportHTML += '<div class="report-section">';
            reportHTML += '<h4>⚠️ Erreurs</h4>';
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
        const progressFill = document.getElementById('progressBar');
        const progressText = document.getElementById('progressPercent');
        const status = document.getElementById('scanStatus');

        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${Math.round(percent)}%`;
        if (status) status.textContent = message;
    }

    updateStat(statId, value) {
        const element = document.getElementById(statId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }

    updateExecutionProgress(percent, message) {
        const progressFill = document.getElementById('executionProgressBar');
        const progressText = document.getElementById('executionPercent');
        const status = document.getElementById('executionStatus');

        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${Math.round(percent)}%`;
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
        return excludedDomains.some(excluded => 
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

console.log('[ModernDomainOrganizer] ✅ Module optimisé chargé');
