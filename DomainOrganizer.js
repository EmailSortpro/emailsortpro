// DomainOrganizer.js - Version 7.0 - Interface Ultra-Moderne et Compacte
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
        
        console.log('[DomainOrganizer] ✅ v7.0 - Interface Ultra-Moderne et Compacte');
    }

    getPageHTML() {
        return `
            <div class="modern-organizer" style="max-width: 1400px; margin: 0 auto; padding: 16px;">
                <!-- Configuration moderne compacte -->
                <div class="modern-card" id="configCard">
                    <div class="card-header">
                        <div class="header-icon">📁</div>
                        <div class="header-content">
                            <h2>Rangement intelligent</h2>
                            <p>Organisation automatique par domaine</p>
                        </div>
                    </div>
                    
                    <form id="organizeForm" class="compact-form">
                        <div class="form-row">
                            <div class="input-group">
                                <label>📅 Du</label>
                                <input type="date" id="startDate" class="modern-input">
                            </div>
                            <div class="input-group">
                                <label>📅 Au</label>
                                <input type="date" id="endDate" class="modern-input">
                            </div>
                            <div class="input-group">
                                <label>🚫 Exclure</label>
                                <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com" class="modern-input">
                            </div>
                            <button type="submit" class="launch-btn" id="analyzeBtn">
                                <span class="btn-icon">🚀</span>
                                Analyser
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Progression ultra-compacte -->
                <div class="modern-card" id="progressCard" style="display: none;">
                    <div class="progress-compact">
                        <div class="progress-info">
                            <div class="progress-icon">⚡</div>
                            <div class="progress-details">
                                <div class="progress-label" id="progressLabel">Analyse</div>
                                <div class="progress-stats">
                                    <span id="emailsAnalyzed">0</span> emails · 
                                    <span id="domainsFound">0</span> domaines
                                </div>
                            </div>
                            <div class="progress-percent" id="progressPercent">0%</div>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="progressBar"></div>
                        </div>
                    </div>
                </div>

                <!-- Résultats ultra-compacts -->
                <div class="modern-card" id="resultsCard" style="display: none;">
                    <!-- Header avec stats inline -->
                    <div class="results-header">
                        <div class="stats-inline">
                            <div class="stat-chip">
                                <span class="stat-number" id="statEmails">0</span>
                                <span class="stat-text">emails</span>
                            </div>
                            <div class="stat-chip">
                                <span class="stat-number" id="statDomains">0</span>
                                <span class="stat-text">domaines</span>
                            </div>
                            <div class="stat-chip">
                                <span class="stat-number" id="statSelected">0</span>
                                <span class="stat-text">sélectionnés</span>
                            </div>
                        </div>
                        
                        <div class="action-toolbar">
                            <div class="toolbar-group">
                                <button class="tool-btn" onclick="window.organizerInstance.expandAllDomains()" title="Développer tout">
                                    <span>⬇</span>
                                </button>
                                <button class="tool-btn" onclick="window.organizerInstance.collapseAllDomains()" title="Réduire tout">
                                    <span>⬆</span>
                                </button>
                                <button class="tool-btn" onclick="window.organizerInstance.selectAllEmails()" title="Tout sélectionner">
                                    <span>☑</span>
                                </button>
                                <button class="tool-btn" onclick="window.organizerInstance.deselectAllEmails()" title="Désélectionner">
                                    <span>☐</span>
                                </button>
                            </div>
                            
                            <div class="search-compact">
                                <input type="text" id="emailSearch" placeholder="🔍 Rechercher..." class="search-input-compact">
                            </div>
                        </div>
                    </div>

                    <!-- Liste ultra-compacte des domaines -->
                    <div class="domains-container" id="detailedResults">
                        <!-- Populated dynamically -->
                    </div>

                    <!-- Actions footer -->
                    <div class="actions-footer">
                        <div class="footer-left">
                            <label class="checkbox-compact">
                                <input type="checkbox" id="createFolders" checked>
                                <span class="checkmark"></span>
                                Créer les dossiers manquants
                            </label>
                        </div>
                        <div class="footer-right">
                            <button class="btn-secondary" onclick="window.organizerInstance.resetForm()">
                                ← Retour
                            </button>
                            <button class="btn-primary" id="applyBtn" onclick="window.organizerInstance.applyOrganization()">
                                Organiser <span id="selectedCount">0</span> emails →
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Execution moderne -->
                <div class="modern-card" id="executionCard" style="display: none;">
                    <div class="execution-header">
                        <div class="execution-icon">⚙️</div>
                        <div class="execution-info">
                            <h3 id="executeLabel">Organisation</h3>
                            <div class="execution-stats">
                                <span id="foldersCreated">0</span> dossiers · 
                                <span id="emailsMoved">0</span> emails traités
                            </div>
                        </div>
                        <div class="execution-percent" id="executePercent">0%</div>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar success" id="executeBar"></div>
                    </div>
                </div>

                <!-- Success ultra-moderne -->
                <div class="success-modern" id="successCard" style="display: none;">
                    <div class="success-content">
                        <div class="success-icon">✅</div>
                        <div class="success-info">
                            <h2>Organisation terminée</h2>
                            <p id="successMessage">Vos emails ont été organisés avec succès</p>
                            <div class="success-stats">
                                <span><strong id="finalEmailsMoved">0</strong> emails traités</span>
                                <span><strong id="finalFoldersCreated">0</strong> dossiers créés</span>
                            </div>
                        </div>
                        <div class="success-actions">
                            <button class="btn-secondary" onclick="window.organizerInstance.resetForm()">
                                🔄 Nouveau scan
                            </button>
                            <button class="btn-primary" onclick="window.organizerInstance.exploreResults()">
                                📧 Voir dans Outlook
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Reset et base moderne */
                .modern-organizer {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
                    color: #0f172a;
                    font-size: 14px;
                    line-height: 1.5;
                    --primary: #3b82f6;
                    --success: #10b981;
                    --gray-50: #f8fafc;
                    --gray-100: #f1f5f9;
                    --gray-200: #e2e8f0;
                    --gray-300: #cbd5e1;
                    --gray-400: #94a3b8;
                    --gray-500: #64748b;
                    --gray-900: #0f172a;
                }

                .modern-card {
                    background: white;
                    border: 1px solid var(--gray-200);
                    border-radius: 12px;
                    margin-bottom: 16px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                    transition: all 0.2s ease;
                }

                .modern-card:hover {
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }

                /* Header compact */
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px;
                    border-bottom: 1px solid var(--gray-100);
                }

                .header-icon {
                    font-size: 24px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary), #2563eb);
                    border-radius: 10px;
                    color: white;
                }

                .header-content h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--gray-900);
                }

                .header-content p {
                    margin: 0;
                    font-size: 13px;
                    color: var(--gray-500);
                }

                /* Formulaire ultra-compact */
                .compact-form {
                    padding: 20px;
                }

                .form-row {
                    display: flex;
                    gap: 12px;
                    align-items: end;
                    flex-wrap: wrap;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 140px;
                    flex: 1;
                }

                .input-group label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--gray-600);
                }

                .modern-input {
                    padding: 8px 12px;
                    border: 1px solid var(--gray-300);
                    border-radius: 6px;
                    font-size: 13px;
                    transition: all 0.2s ease;
                    background: white;
                }

                .modern-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
                }

                .launch-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: linear-gradient(135deg, var(--primary), #2563eb);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    height: fit-content;
                }

                .launch-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgb(59 130 246 / 0.3);
                }

                .btn-icon {
                    font-size: 14px;
                }

                /* Progression ultra-compacte */
                .progress-compact {
                    padding: 16px 20px;
                }

                .progress-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .progress-icon {
                    font-size: 18px;
                    animation: pulse 2s infinite;
                }

                .progress-details {
                    flex: 1;
                }

                .progress-label {
                    font-weight: 600;
                    color: var(--gray-900);
                    font-size: 14px;
                }

                .progress-stats {
                    font-size: 12px;
                    color: var(--gray-500);
                }

                .progress-percent {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--primary);
                }

                .progress-bar-container {
                    height: 4px;
                    background: var(--gray-200);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), #06b6d4);
                    border-radius: 2px;
                    transition: width 0.5s ease;
                    width: 0%;
                }

                .progress-bar.success {
                    background: linear-gradient(90deg, var(--success), #059669);
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                /* Header des résultats compact */
                .results-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--gray-100);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .stats-inline {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .stat-chip {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    background: var(--gray-50);
                    border: 1px solid var(--gray-200);
                    border-radius: 20px;
                    font-size: 12px;
                }

                .stat-number {
                    font-weight: 700;
                    color: var(--gray-900);
                }

                .stat-text {
                    color: var(--gray-500);
                }

                .action-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .toolbar-group {
                    display: flex;
                    gap: 2px;
                    background: var(--gray-100);
                    border-radius: 6px;
                    padding: 2px;
                }

                .tool-btn {
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: transparent;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    transition: all 0.2s ease;
                }

                .tool-btn:hover {
                    background: white;
                    box-shadow: 0 1px 2px rgb(0 0 0 / 0.1);
                }

                .search-compact {
                    position: relative;
                }

                .search-input-compact {
                    width: 200px;
                    padding: 6px 10px;
                    border: 1px solid var(--gray-300);
                    border-radius: 6px;
                    font-size: 12px;
                    background: var(--gray-50);
                }

                .search-input-compact:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                }

                /* Liste des domaines ultra-compacte */
                .domains-container {
                    max-height: 500px;
                    overflow-y: auto;
                }

                .domain-compact {
                    border-bottom: 1px solid var(--gray-100);
                    transition: all 0.2s ease;
                }

                .domain-compact:hover {
                    background: var(--gray-50);
                }

                .domain-compact.expanded {
                    background: #eff6ff;
                    border-color: var(--primary);
                }

                .domain-header-compact {
                    display: flex;
                    align-items: center;
                    padding: 12px 20px;
                    cursor: pointer;
                    gap: 12px;
                }

                .domain-checkbox-compact {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: var(--primary);
                }

                .domain-info-compact {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                }

                .domain-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, var(--primary), #2563eb);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .domain-details-compact {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name-compact {
                    font-weight: 600;
                    color: var(--gray-900);
                    font-size: 14px;
                    margin-bottom: 2px;
                }

                .domain-meta {
                    display: flex;
                    gap: 12px;
                    font-size: 11px;
                    color: var(--gray-500);
                }

                .domain-controls-compact {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .folder-select-compact {
                    padding: 4px 8px;
                    border: 1px solid var(--gray-300);
                    border-radius: 4px;
                    font-size: 11px;
                    background: white;
                    min-width: 100px;
                }

                .badge-compact {
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .badge-new {
                    background: #dcfce7;
                    color: #166534;
                }

                .badge-existing {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .expand-indicator {
                    color: var(--gray-400);
                    font-size: 12px;
                    transition: transform 0.3s ease;
                }

                .domain-compact.expanded .expand-indicator {
                    transform: rotate(90deg);
                }

                /* Emails ultra-compacts */
                .emails-compact {
                    display: none;
                    background: white;
                    border-top: 1px solid #dbeafe;
                }

                .domain-compact.expanded .emails-compact {
                    display: block;
                }

                .email-compact {
                    display: flex;
                    align-items: center;
                    padding: 8px 20px 8px 52px;
                    gap: 8px;
                    border-bottom: 1px solid var(--gray-100);
                    font-size: 12px;
                    transition: all 0.2s ease;
                }

                .email-compact:hover {
                    background: var(--gray-50);
                }

                .email-compact.selected {
                    background: #eff6ff;
                    border-left: 3px solid var(--primary);
                }

                .email-checkbox-compact {
                    width: 14px;
                    height: 14px;
                    cursor: pointer;
                    accent-color: var(--primary);
                }

                .email-content-compact {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .email-subject-compact {
                    font-weight: 500;
                    color: var(--gray-900);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 300px;
                    flex-shrink: 0;
                }

                .email-meta-compact {
                    color: var(--gray-500);
                    font-size: 11px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .email-folder-compact {
                    flex-shrink: 0;
                }

                .email-folder-select {
                    padding: 2px 6px;
                    border: 1px solid var(--gray-300);
                    border-radius: 3px;
                    font-size: 10px;
                    background: white;
                    min-width: 80px;
                }

                /* Actions footer */
                .actions-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-top: 1px solid var(--gray-100);
                    background: var(--gray-50);
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .checkbox-compact {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    color: var(--gray-700);
                }

                .checkbox-compact input {
                    width: 16px;
                    height: 16px;
                    accent-color: var(--primary);
                }

                .footer-right {
                    display: flex;
                    gap: 8px;
                }

                .btn-secondary {
                    padding: 8px 16px;
                    border: 1px solid var(--gray-300);
                    background: white;
                    color: var(--gray-700);
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-secondary:hover {
                    background: var(--gray-50);
                    border-color: var(--gray-400);
                }

                .btn-primary {
                    padding: 8px 16px;
                    background: linear-gradient(135deg, var(--primary), #2563eb);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgb(59 130 246 / 0.3);
                }

                .btn-primary:disabled {
                    background: var(--gray-300);
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                /* Execution moderne */
                .execution-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    margin-bottom: 8px;
                }

                .execution-icon {
                    font-size: 20px;
                    animation: spin 2s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .execution-info {
                    flex: 1;
                }

                .execution-info h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--gray-900);
                }

                .execution-stats {
                    font-size: 12px;
                    color: var(--gray-500);
                }

                .execution-percent {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--success);
                }

                /* Success moderne */
                .success-modern {
                    background: linear-gradient(135deg, var(--success), #059669);
                    color: white;
                    border-radius: 12px;
                    margin-bottom: 16px;
                }

                .success-content {
                    padding: 24px;
                    text-align: center;
                }

                .success-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    display: block;
                }

                .success-info h2 {
                    margin: 0 0 8px 0;
                    font-size: 20px;
                    font-weight: 600;
                }

                .success-info p {
                    margin: 0 0 16px 0;
                    opacity: 0.9;
                    font-size: 14px;
                }

                .success-stats {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin-bottom: 20px;
                    font-size: 13px;
                    opacity: 0.9;
                }

                .success-actions {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .success-actions .btn-secondary {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.3);
                    color: white;
                }

                .success-actions .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .success-actions .btn-primary {
                    background: white;
                    color: var(--success);
                }

                .success-actions .btn-primary:hover {
                    background: var(--gray-50);
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .modern-organizer {
                        padding: 12px;
                    }
                    
                    .form-row {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .input-group {
                        min-width: auto;
                    }
                    
                    .results-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .action-toolbar {
                        justify-content: space-between;
                    }
                    
                    .search-input-compact {
                        width: 150px;
                    }
                    
                    .email-content-compact {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                    }
                    
                    .email-subject-compact {
                        max-width: none;
                        white-space: normal;
                        overflow: visible;
                        text-overflow: unset;
                    }
                    
                    .actions-footer {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .footer-right {
                        justify-content: center;
                    }
                    
                    .success-stats {
                        flex-direction: column;
                        gap: 8px;
                    }
                    
                    .success-actions {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .success-actions button {
                        width: 100%;
                        max-width: 200px;
                    }
                }

                /* Améliorations pour la densité */
                .domains-container::-webkit-scrollbar {
                    width: 6px;
                }

                .domains-container::-webkit-scrollbar-track {
                    background: var(--gray-100);
                }

                .domains-container::-webkit-scrollbar-thumb {
                    background: var(--gray-300);
                    border-radius: 3px;
                }

                .domains-container::-webkit-scrollbar-thumb:hover {
                    background: var(--gray-400);
                }

                /* Animations subtiles */
                .modern-card {
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .domain-compact {
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            </style>
        `;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v7.0 Modern...');
        
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.isActive = true;
        
        console.log('[DomainOrganizer] ✅ Modern interface initialized v7.0');
        return true;
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
        
        console.log('[DomainOrganizer] Form submitted - Modern UI');
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
            this.showProgress();
            
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
        console.log('[DomainOrganizer] Modern analysis simulation...');
        
        const progressBar = document.getElementById('progressBar');
        const progressLabel = document.getElementById('progressLabel');
        const progressPercent = document.getElementById('progressPercent');
        const emailsAnalyzed = document.getElementById('emailsAnalyzed');
        const domainsFound = document.getElementById('domainsFound');
        
        let progress = 0;
        let emails = 0;
        let domains = 0;
        
        const interval = setInterval(() => {
            progress += 15;
            emails += Math.floor(Math.random() * 30) + 20;
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercent) progressPercent.textContent = `${progress}%`;
            if (emailsAnalyzed) emailsAnalyzed.textContent = emails;
            
            if (progress === 30) {
                domains = Math.floor(emails / 30) + 3;
                if (domainsFound) domainsFound.textContent = domains;
                if (progressLabel) progressLabel.textContent = 'Connexion Graph API';
            } else if (progress === 60) {
                if (progressLabel) progressLabel.textContent = 'Analyse des domaines';
            } else if (progress === 90) {
                if (progressLabel) progressLabel.textContent = 'Finalisation';
            } else if (progress >= 105) {
                clearInterval(interval);
                if (progressLabel) progressLabel.textContent = 'Terminé';
                
                const results = this.generateModernMockData(domains, emails);
                setTimeout(() => this.showModernResults(results), 400);
            }
        }, 300);
    }

    generateModernMockData(domainCount, totalEmails) {
        const mockDomains = [
            'linkedin.com', 'github.com', 'amazon.com', 'paypal.com', 'medium.com', 
            'stackoverflow.com', 'atlassian.com', 'slack.com', 'dropbox.com', 'spotify.com',
            'netflix.com', 'airbnb.com', 'booking.com', 'udemy.com', 'coursera.org',
            'microsoft.com', 'google.com', 'apple.com', 'salesforce.com', 'notion.so'
        ];
        
        const mockSubjects = [
            'Confirmation de commande #12345',
            'Nouvelle notification',
            'Rapport mensuel disponible',
            'Invitation équipe',
            'Mise à jour sécurité',
            'Newsletter',
            'Réservation confirmée',
            'Facture en ligne',
            'Message privé',
            'Action requise',
            'Profil mis à jour',
            'Abonnement activé',
            'Demande de connexion',
            'Nouveau commentaire',
            'Rappel important'
        ];
        
        const domains = [];
        let emailId = 1;
        let remainingEmails = totalEmails;
        
        for (let i = 0; i < domainCount && remainingEmails > 0; i++) {
            const domain = mockDomains[i % mockDomains.length];
            const emailCount = i === domainCount - 1 
                ? remainingEmails 
                : Math.min(Math.floor(Math.random() * 40) + 10, remainingEmails);
            
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
                action: Math.random() > 0.3 ? 'create-new' : 'move-existing',
                suggestedFolder: domain.split('.')[0],
                emails: emails,
                selected: true
            });
        }
        
        return {
            totalEmails: totalEmails,
            totalDomains: domainCount,
            domainsToCreate: domains.filter(d => d.action === 'create-new').length,
            domains: domains.sort((a, b) => b.count - a.count)
        };
    }

    showProgress() {
        const configCard = document.getElementById('configCard');
        const progressCard = document.getElementById('progressCard');
        const resultsCard = document.getElementById('resultsCard');
        
        if (configCard) configCard.style.display = 'none';
        if (progressCard) progressCard.style.display = 'block';
        if (resultsCard) resultsCard.style.display = 'none';
    }

    showModernResults(results) {
        console.log('[DomainOrganizer] Showing modern results:', results);
        
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
        
        // Update statistics
        const statEmails = document.getElementById('statEmails');
        const statDomains = document.getElementById('statDomains');
        const statSelected = document.getElementById('statSelected');
        
        if (statEmails) statEmails.textContent = results.totalEmails.toLocaleString();
        if (statDomains) statDomains.textContent = results.totalDomains;
        
        const selectedCount = Array.from(this.emailActions.values()).filter(action => action.selected).length;
        if (statSelected) statSelected.textContent = selectedCount.toLocaleString();
        
        this.displayModernDomains(results.domains);
        this.updateSelectedCount();
        
        // Show results card
        const progressCard = document.getElementById('progressCard');
        const resultsCard = document.getElementById('resultsCard');
        
        if (progressCard) progressCard.style.display = 'none';
        if (resultsCard) resultsCard.style.display = 'block';
    }

    displayModernDomains(domains) {
        const container = document.getElementById('detailedResults');
        if (!container) return;
        
        container.innerHTML = '';
        
        domains.forEach(domain => {
            const domainRow = this.createModernDomainRow(domain);
            container.appendChild(domainRow);
        });
    }

    createModernDomainRow(domainData) {
        const row = document.createElement('div');
        row.className = 'domain-compact';
        row.dataset.domain = domainData.domain;
        
        const isNewFolder = domainData.action === 'create-new';
        const selectedEmails = domainData.emails.filter(email => 
            this.emailActions.get(email.id)?.selected
        ).length;
        
        const domainInitial = domainData.domain.charAt(0).toUpperCase();
        
        row.innerHTML = `
            <div class="domain-header-compact">
                <input type="checkbox" class="domain-checkbox-compact" data-domain="${domainData.domain}" 
                       ${domainData.selected ? 'checked' : ''}>
                
                <div class="domain-info-compact">
                    <div class="domain-avatar">${domainInitial}</div>
                    <div class="domain-details-compact">
                        <div class="domain-name-compact">${domainData.domain}</div>
                        <div class="domain-meta">
                            <span>${domainData.count} emails</span>
                            <span>${selectedEmails} sélectionnés</span>
                        </div>
                    </div>
                </div>
                
                <div class="domain-controls-compact">
                    <select class="folder-select-compact" data-domain="${domainData.domain}">
                        <option value="${domainData.suggestedFolder}" selected>${domainData.suggestedFolder}</option>
                        <option value="inbox">📥 Boîte de réception</option>
                        <option value="archive">📁 Archive</option>
                        <option value="important">⭐ Important</option>
                    </select>
                    
                    <span class="badge-compact ${isNewFolder ? 'badge-new' : 'badge-existing'}">
                        ${isNewFolder ? 'Nouveau' : 'Existant'}
                    </span>
                    
                    <span class="expand-indicator">▶</span>
                </div>
            </div>
            
            <div class="emails-compact">
                ${domainData.emails.map(email => this.createModernEmailItem(email, domainData.domain)).join('')}
            </div>
        `;
        
        // Event listeners
        row.addEventListener('click', (e) => {
            if (e.target.closest('.domain-controls-compact') || e.target.closest('.domain-checkbox-compact')) {
                return;
            }
            this.toggleDomainExpansion(domainData.domain);
        });
        
        const domainCheckbox = row.querySelector('.domain-checkbox-compact');
        if (domainCheckbox) {
            domainCheckbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDomainToggle(e);
            });
        }
        
        const folderSelect = row.querySelector('.folder-select-compact');
        if (folderSelect) {
            folderSelect.addEventListener('click', (e) => e.stopPropagation());
            folderSelect.addEventListener('change', (e) => this.handleDomainFolderChange(e));
        }
        
        return row;
    }

    createModernEmailItem(emailData, domain) {
        const isSelected = this.emailActions.get(emailData.id)?.selected;
        
        return `
            <div class="email-compact ${isSelected ? 'selected' : ''}" data-email-id="${emailData.id}">
                <input type="checkbox" class="email-checkbox-compact" data-email-id="${emailData.id}" 
                       ${isSelected ? 'checked' : ''}
                       onchange="window.organizerInstance.handleEmailToggle(event)">
                
                <div class="email-content-compact">
                    <div class="email-subject-compact">${emailData.subject}</div>
                    <div class="email-meta-compact">
                        ${emailData.senderName} • ${emailData.date}
                    </div>
                </div>
                
                <div class="email-folder-compact">
                    <select class="email-folder-select" data-email-id="${emailData.id}" 
                            onchange="window.organizerInstance.handleEmailFolderChange(event)">
                        <option value="${emailData.targetFolder}" selected>${emailData.targetFolder}</option>
                        <option value="inbox">📥 Boîte</option>
                        <option value="archive">📁 Archive</option>
                        <option value="spam">🚫 Spam</option>
                        <option value="important">⭐ Important</option>
                    </select>
                </div>
            </div>
        `;
    }

    // Méthodes de gestion (reprises et adaptées)
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
        document.querySelectorAll('.domain-compact').forEach(row => {
            row.classList.add('expanded');
            const domain = row.dataset.domain;
            if (domain) {
                this.expandedDomains.add(domain);
            }
        });
    }

    collapseAllDomains() {
        document.querySelectorAll('.domain-compact').forEach(row => {
            row.classList.remove('expanded');
        });
        this.expandedDomains.clear();
    }

    selectAllEmails() {
        document.querySelectorAll('.email-checkbox-compact').forEach(checkbox => {
            checkbox.checked = true;
            this.handleEmailToggle({ target: checkbox });
        });
        document.querySelectorAll('.domain-checkbox-compact').forEach(checkbox => {
            checkbox.checked = true;
        });
    }

    deselectAllEmails() {
        document.querySelectorAll('.email-checkbox-compact').forEach(checkbox => {
            checkbox.checked = false;
            this.handleEmailToggle({ target: checkbox });
        });
        document.querySelectorAll('.domain-checkbox-compact').forEach(checkbox => {
            checkbox.checked = false;
        });
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
        
        const emailItem = event.target.closest('.email-compact');
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
        
        const statSelected = document.getElementById('statSelected');
        const selectedCountSpan = document.getElementById('selectedCount');
        const applyBtn = document.getElementById('applyBtn');
        
        if (statSelected) statSelected.textContent = selectedCount.toLocaleString();
        if (selectedCountSpan) selectedCountSpan.textContent = selectedCount.toLocaleString();
        
        if (applyBtn) {
            applyBtn.disabled = selectedCount === 0;
            if (selectedCount === 0) {
                applyBtn.innerHTML = 'Aucun email sélectionné';
            } else {
                applyBtn.innerHTML = `Organiser ${selectedCount.toLocaleString()} emails →`;
            }
        }
    }

    handleSearch(searchTerm) {
        const emailItems = document.querySelectorAll('.email-compact');
        const domainRows = document.querySelectorAll('.domain-compact');
        
        emailItems.forEach(item => {
            const subject = item.querySelector('.email-subject-compact')?.textContent.toLowerCase() || '';
            const meta = item.querySelector('.email-meta-compact')?.textContent.toLowerCase() || '';
            
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
                const visibleEmails = row.querySelectorAll('.email-compact[style*="flex"]').length;
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
            
            console.log('[DomainOrganizer] Applying modern organization for', selectedEmails.length, 'emails');
            
            await this.simulateExecution(selectedEmails);
            
        } catch (error) {
            console.error('[DomainOrganizer] Apply error:', error);
            this.showError(`Erreur: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateExecution(selectedEmails) {
        const resultsCard = document.getElementById('resultsCard');
        const executionCard = document.getElementById('executionCard');
        
        if (resultsCard) resultsCard.style.display = 'none';
        if (executionCard) executionCard.style.display = 'block';
        
        const executeBar = document.getElementById('executeBar');
        const executeLabel = document.getElementById('executeLabel');
        const executePercent = document.getElementById('executePercent');
        const foldersCreated = document.getElementById('foldersCreated');
        const emailsMoved = document.getElementById('emailsMoved');
        
        let progress = 0;
        let folders = 0;
        let emails = 0;
        
        const uniqueFolders = new Set(selectedEmails.map(email => email.targetFolder));
        const totalFolders = uniqueFolders.size;
        const totalEmails = selectedEmails.length;
        
        const interval = setInterval(() => {
            progress += 12;
            
            if (executeBar) executeBar.style.width = `${Math.min(progress, 100)}%`;
            if (executePercent) executePercent.textContent = `${Math.min(progress, 100)}%`;
            
            if (progress === 24) {
                folders = Math.floor(totalFolders * 0.4);
                emails = Math.floor(totalEmails * 0.2);
                if (foldersCreated) foldersCreated.textContent = folders;
                if (emailsMoved) emailsMoved.textContent = emails;
                if (executeLabel) executeLabel.textContent = 'Création dossiers';
            } else if (progress === 60) {
                folders = totalFolders;
                emails = Math.floor(totalEmails * 0.7);
                if (foldersCreated) foldersCreated.textContent = folders;
                if (emailsMoved) emailsMoved.textContent = emails;
                if (executeLabel) executeLabel.textContent = 'Déplacement emails';
            } else if (progress >= 100) {
                clearInterval(interval);
                folders = totalFolders;
                emails = totalEmails;
                if (foldersCreated) foldersCreated.textContent = folders;
                if (emailsMoved) emailsMoved.textContent = emails;
                if (executeLabel) executeLabel.textContent = 'Terminé';
                
                setTimeout(() => this.showSuccess({ emailsMoved: emails, foldersCreated: folders }), 800);
            }
        }, 200);
    }

    showSuccess(results) {
        const executionCard = document.getElementById('executionCard');
        const successCard = document.getElementById('successCard');
        
        if (executionCard) executionCard.style.display = 'none';
        if (successCard) successCard.style.display = 'block';
        
        const finalEmailsMoved = document.getElementById('finalEmailsMoved');
        const finalFoldersCreated = document.getElementById('finalFoldersCreated');
        const successMessage = document.getElementById('successMessage');
        
        if (finalEmailsMoved) finalEmailsMoved.textContent = results.emailsMoved.toLocaleString();
        if (finalFoldersCreated) finalFoldersCreated.textContent = results.foldersCreated;
        
        const message = `${results.emailsMoved} emails organisés dans ${results.foldersCreated} dossiers`;
        if (successMessage) successMessage.textContent = message;
    }

    resetForm() {
        const configCard = document.getElementById('configCard');
        const progressCard = document.getElementById('progressCard');
        const resultsCard = document.getElementById('resultsCard');
        const executionCard = document.getElementById('executionCard');
        const successCard = document.getElementById('successCard');
        
        if (configCard) configCard.style.display = 'block';
        if (progressCard) progressCard.style.display = 'none';
        if (resultsCard) resultsCard.style.display = 'none';
        if (executionCard) executionCard.style.display = 'none';
        if (successCard) successCard.style.display = 'none';
        
        const form = document.getElementById('organizeForm');
        if (form) form.reset();
        
        this.setDefaultDates();
        this.emailActions.clear();
        this.selectedActions.clear();
        this.expandedDomains.clear();
        this.currentAnalysis = null;
        this.isProcessing = false;
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

// Initialisation globale moderne
window.organizerInstance = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ v7.0 Modern Ultra-Compact Instance created');

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v7.0 Modern Ultra-Compact...');
    
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
    pageContent.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) {
        rangerButton.classList.add('active');
        if (rangerButton.parentElement) {
            rangerButton.parentElement.classList.add('active');
        }
    }

    setTimeout(async () => {
        if (window.domainOrganizerActive && document.getElementById('configCard')) {
            try {
                await window.organizerInstance.initializePage();
                console.log('[DomainOrganizer] ✅ Modern interface ready v7.0');
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
            }
        }
    }, 50);

    console.log('[DomainOrganizer] ✅ Modern ultra-compact interface launched v7.0');
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
        
        console.log('[DomainOrganizer] 🎯 Ranger click detected v7.0');
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
            console.log('[DomainOrganizer] 🎯 PageManager interception v7.0');
            showDomainOrganizerApp();
            return;
        }

        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                console.log('[DomainOrganizer] 🔧 PageManager error intercepted v7.0');
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
    
    console.log('[DomainOrganizer] ✅ PageManager hook installed v7.0');
}

// Exposer les fonctions globales
window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = {
    showPage: showDomainOrganizerApp,
    instance: window.organizerInstance
};

console.log('[DomainOrganizer] ✅ v7.0 Modern Ultra-Compact System ready - Densité maximale avec design moderne');
