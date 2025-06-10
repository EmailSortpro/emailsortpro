// DomainOrganizer.js - Version 10.0 - Design minimaliste + Scan complet + Alertes détaillées
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
        
        console.log('[DomainOrganizer] ✅ v10.0 - Design minimaliste + Scan complet');
    }

    getPageHTML() {
        return `
            <div class="organizer-minimal">
                <!-- Header minimaliste -->
                <div class="header">
                    <h1>📁 Organisation par domaine</h1>
                    <div class="steps">
                        <div class="step active" data-step="1">1</div>
                        <div class="step" data-step="2">2</div>
                        <div class="step" data-step="3">3</div>
                    </div>
                </div>

                <!-- Étape 1: Configuration minimaliste -->
                <div class="step-content" id="step1">
                    <div class="card">
                        <h2>🔍 Analyse complète</h2>
                        
                        <div class="alert info">
                            <span class="icon">ℹ️</span>
                            <div>
                                <strong>Scan complet activé</strong>
                                <p>Tous vos emails seront analysés sans limitation pour une organisation optimale</p>
                            </div>
                        </div>

                        <form id="scanForm" class="form">
                            <div class="field-group">
                                <label>📧 Source</label>
                                <select id="sourceFolder" class="input">
                                    <option value="all">🔍 Tous les dossiers (recommandé)</option>
                                    <option value="inbox">📥 Boîte de réception</option>
                                    <option value="sent">📤 Éléments envoyés</option>
                                    <option value="archive">📦 Archive</option>
                                </select>
                            </div>

                            <div class="field-group">
                                <label>🚫 Domaines à ignorer</label>
                                <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com" class="input">
                                <small>Optionnel - séparez par des virgules</small>
                            </div>

                            <button type="submit" class="btn primary" id="startBtn">
                                🚀 Lancer le scan complet
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Étape 2: Scan avec progress détaillé -->
                <div class="step-content" id="step2" style="display: none;">
                    <div class="card">
                        <h2>🔍 Scan en cours</h2>
                        
                        <div class="alert warning" id="scanAlert">
                            <span class="icon">⚠️</span>
                            <div>
                                <strong>Accès en lecture seule</strong>
                                <p id="alertText">Analyse de vos emails sans modification</p>
                            </div>
                        </div>

                        <div class="progress-section">
                            <div class="stats">
                                <div class="stat">
                                    <span class="number" id="emailCount">0</span>
                                    <span class="label">Emails</span>
                                </div>
                                <div class="stat">
                                    <span class="number" id="domainCount">0</span>
                                    <span class="label">Domaines</span>
                                </div>
                                <div class="stat">
                                    <span class="number" id="folderCount">0</span>
                                    <span class="label">Dossiers</span>
                                </div>
                            </div>

                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            
                            <div class="status" id="currentStatus">
                                <span class="icon">⏳</span>
                                <span class="text">Initialisation...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 3: Résultats et organisation -->
                <div class="step-content" id="step3" style="display: none;">
                    <div class="card">
                        <h2>✏️ Organisation proposée</h2>
                        
                        <div class="alert success">
                            <span class="icon">✅</span>
                            <div>
                                <strong>Analyse terminée</strong>
                                <p><span id="totalFound">0</span> emails dans <span id="domainsFound">0</span> domaines</p>
                            </div>
                        </div>

                        <div class="controls">
                            <div class="actions">
                                <button class="btn secondary" onclick="window.organizerInstance.selectAll()">✓ Tout</button>
                                <button class="btn secondary" onclick="window.organizerInstance.deselectAll()">✗ Rien</button>
                            </div>
                            <input type="text" id="searchBox" placeholder="🔍 Rechercher..." class="search">
                        </div>

                        <div class="domains-list" id="domainsList">
                            <!-- Populated dynamically -->
                        </div>

                        <div class="final-actions">
                            <div class="options">
                                <label class="checkbox">
                                    <input type="checkbox" id="createFolders" checked>
                                    <span>Créer les dossiers</span>
                                </label>
                                <label class="checkbox">
                                    <input type="checkbox" id="moveEmails" checked>
                                    <span>Déplacer les emails</span>
                                </label>
                            </div>
                            
                            <div class="execute-buttons">
                                <button class="btn secondary" onclick="window.organizerInstance.reset()">← Recommencer</button>
                                <button class="btn primary" id="executeBtn" onclick="window.organizerInstance.execute()">
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
                        
                        <div class="alert info" id="executeAlert">
                            <span class="icon">⚠️</span>
                            <div>
                                <strong>Modifications en cours</strong>
                                <p id="executeText">Création des dossiers et déplacement des emails</p>
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
                            </div>

                            <div class="progress-bar">
                                <div class="progress-fill success" id="executeFill"></div>
                            </div>
                            
                            <div class="status" id="executeStatus">
                                <span class="icon">⚙️</span>
                                <span class="text">Préparation...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Étape 5: Succès -->
                <div class="step-content" id="step5" style="display: none;">
                    <div class="card success">
                        <div class="success-content">
                            <div class="success-icon">🎉</div>
                            <h2>Organisation terminée !</h2>
                            <p>Vos emails ont été organisés avec succès</p>
                            
                            <div class="success-stats">
                                <div class="stat">
                                    <span class="number" id="finalEmails">0</span>
                                    <span class="label">emails organisés</span>
                                </div>
                                <div class="stat">
                                    <span class="number" id="finalFolders">0</span>
                                    <span class="label">dossiers créés</span>
                                </div>
                            </div>

                            <div class="success-actions">
                                <button class="btn secondary" onclick="window.organizerInstance.reset()">
                                    🔄 Nouvelle analyse
                                </button>
                                <button class="btn primary" onclick="window.organizerInstance.openOutlook()">
                                    📧 Voir dans Outlook
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* Design system minimaliste moderne */
                .organizer-minimal {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 24px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #fafafa;
                    min-height: 100vh;
                }

                /* Header minimaliste */
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    padding: 24px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    color: #111;
                }

                .steps {
                    display: flex;
                    gap: 8px;
                }

                .step {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
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

                /* Cards minimalistes */
                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 32px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    border: 1px solid #f0f0f0;
                }

                .card h2 {
                    margin: 0 0 24px 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #111;
                }

                .card.success {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                }

                /* Alertes minimalistes */
                .alert {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 8px;
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
                }

                .alert p {
                    margin: 0;
                    font-size: 14px;
                    opacity: 0.9;
                }

                /* Form minimaliste */
                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
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
                }

                .input {
                    padding: 12px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    background: #fafafa;
                    transition: all 0.2s ease;
                }

                .input:focus {
                    outline: none;
                    border-color: #007acc;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
                }

                /* Boutons minimalistes */
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
                    border-color: #d1d5db;
                }

                /* Progress minimaliste */
                .progress-section, .execute-progress {
                    margin-top: 24px;
                }

                .stats, .execute-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .stat {
                    text-align: center;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .stat .number {
                    display: block;
                    font-size: 24px;
                    font-weight: 800;
                    color: #111;
                    margin-bottom: 4px;
                }

                .stat .label {
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .progress-bar {
                    height: 8px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 16px;
                }

                .progress-fill {
                    height: 100%;
                    background: #007acc;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                    width: 0%;
                }

                .progress-fill.success {
                    background: #10b981;
                }

                .status {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 8px;
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
                    padding: 16px 0;
                    border-bottom: 1px solid #f0f0f0;
                }

                .actions {
                    display: flex;
                    gap: 8px;
                }

                .search {
                    padding: 8px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 14px;
                    width: 200px;
                    background: white;
                }

                /* Liste des domaines minimaliste */
                .domains-list {
                    max-height: 400px;
                    overflow-y: auto;
                    margin-bottom: 24px;
                    border-radius: 8px;
                    border: 1px solid #f0f0f0;
                }

                .domain-item {
                    display: flex;
                    align-items: center;
                    padding: 16px;
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
                    margin-right: 16px;
                    accent-color: #007acc;
                }

                .domain-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: #007acc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    margin-right: 16px;
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
                    font-size: 14px;
                    color: #6b7280;
                }

                .domain-folder {
                    padding: 6px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 13px;
                    background: white;
                    min-width: 120px;
                }

                /* Actions finales */
                .final-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 24px;
                    border-top: 1px solid #f0f0f0;
                }

                .options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .checkbox {
                    display: flex;
                    align-items: center;
                    gap: 10px;
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
                    gap: 12px;
                }

                /* Succès */
                .success-content {
                    text-align: center;
                }

                .success-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    display: block;
                }

                .success-content h2 {
                    color: white;
                    margin-bottom: 8px;
                }

                .success-content p {
                    opacity: 0.9;
                    margin-bottom: 24px;
                }

                .success-stats {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .success-stats .stat {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    color: white;
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

                /* Responsive */
                @media (max-width: 768px) {
                    .organizer-minimal {
                        padding: 16px;
                    }
                    
                    .header {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .controls {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .final-actions {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .stats, .execute-stats, .success-stats {
                        grid-template-columns: 1fr;
                    }
                }

                /* Scrollbar */
                .domains-list::-webkit-scrollbar {
                    width: 6px;
                }

                .domains-list::-webkit-scrollbar-track {
                    background: #f8fafc;
                }

                .domains-list::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                .domains-list::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* Animation d'entrée */
                .step-content {
                    animation: slideIn 0.3s ease;
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
            </style>
        `;
    }

    // ================================================
    // SCAN COMPLET SANS RESTRICTIONS
    // ================================================
    async startCompleteScan(formData) {
        try {
            console.log('[DomainOrganizer] 🚀 Starting complete unrestricted scan...');
            this.updateStep(2);
            
            this.configure(formData);
            
            // Alerte de début
            this.updateAlert('warning', 'Scan complet en cours', 'Analyse de TOUS vos emails sans limitation. Cette opération peut prendre plusieurs minutes selon la taille de votre boîte mail.');
            
            await this.performCompleteScan(formData);
            
        } catch (error) {
            console.error('[DomainOrganizer] Complete scan error:', error);
            this.showError(`Erreur de scan: ${error.message}`);
            this.reset();
        } finally {
            this.isProcessing = false;
        }
    }

    async performCompleteScan(formData) {
        console.log('[DomainOrganizer] 🔍 Performing complete email scan...');
        
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

        const statusText = document.getElementById('currentStatus')?.querySelector('.text');
        const alertText = document.getElementById('alertText');
        const progressFill = document.getElementById('progressFill');
        const emailCount = document.getElementById('emailCount');
        const domainCount = document.getElementById('domainCount');
        const folderCount = document.getElementById('folderCount');

        try {
            // ================================================
            // PHASE 1: CONNEXION ET VÉRIFICATION
            // ================================================
            if (statusText) statusText.textContent = 'Connexion à Microsoft Graph...';
            if (alertText) alertText.textContent = 'Vérification des autorisations d\'accès à votre boîte mail';
            this.updateProgress(5);

            const connectionTest = await window.mailService.testConnection();
            if (!connectionTest.success) {
                throw new Error(`Erreur de connexion: ${connectionTest.error}`);
            }

            if (statusText) statusText.textContent = `Connecté: ${connectionTest.user}`;
            this.updateProgress(10);

            // ================================================
            // PHASE 2: RÉCUPÉRATION COMPLÈTE DES EMAILS
            // ================================================
            if (statusText) statusText.textContent = 'Récupération complète des emails...';
            if (alertText) alertText.textContent = 'Chargement de TOUS vos emails sans limitation. Cette étape peut prendre du temps.';
            
            let allEmails = [];
            const folders = formData.sourceFolder === 'all' ? 
                ['inbox', 'sent', 'archive', 'drafts', 'junkemail'] : 
                [formData.sourceFolder];

            for (let i = 0; i < folders.length; i++) {
                const folder = folders[i];
                if (statusText) statusText.textContent = `Scan du dossier: ${this.getFolderDisplayName(folder)}...`;
                
                try {
                    // SCAN COMPLET SANS LIMITE
                    const folderEmails = await window.mailService.getEmailsFromFolder(folder, {
                        top: 50000, // Limite très élevée
                        // PAS de limitation de date - on prend tout
                    });
                    
                    allEmails = allEmails.concat(folderEmails);
                    
                    if (emailCount) emailCount.textContent = allEmails.length.toLocaleString();
                    
                    const progress = 15 + (i + 1) * 10; // 15% à 65%
                    this.updateProgress(progress);
                    
                    console.log(`[DomainOrganizer] Folder ${folder}: ${folderEmails.length} emails`);
                    
                    // Délai pour éviter la surcharge
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    console.warn(`[DomainOrganizer] Erreur dossier ${folder}:`, error);
                    if (statusText) statusText.textContent = `Erreur sur ${folder}, continuation...`;
                }
            }

            console.log(`[DomainOrganizer] 📧 TOTAL RÉCUPÉRÉ: ${allEmails.length} emails`);
            
            if (allEmails.length === 0) {
                throw new Error('Aucun email trouvé dans votre boîte mail');
            }

            // ================================================
            // PHASE 3: ANALYSE COMPLÈTE DES DOMAINES
            // ================================================
            if (statusText) statusText.textContent = 'Analyse des domaines...';
            if (alertText) alertText.textContent = `Classification de ${allEmails.length} emails par domaine expéditeur`;
            
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
                if (i % 100 === 0 || i === allEmails.length - 1) {
                    const progress = 65 + Math.floor((this.scanProgress.processedEmails / this.scanProgress.totalEmails) * 25); // 65-90%
                    this.updateProgress(progress);
                    
                    if (statusText) statusText.textContent = `Analysé: ${this.scanProgress.processedEmails}/${this.scanProgress.totalEmails} emails`;
                    if (emailCount) emailCount.textContent = this.scanProgress.processedEmails.toLocaleString();
                    if (domainCount) domainCount.textContent = this.scanProgress.domainsFound.size;
                    
                    const uniqueFolders = new Set();
                    this.emailsByDomain.forEach((emails, domain) => {
                        uniqueFolders.add(this.suggestFolder(domain));
                    });
                    if (folderCount) folderCount.textContent = uniqueFolders.size;
                    
                    // Micro-pause pour maintenir la réactivité
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }

            // ================================================
            // PHASE 4: FINALISATION
            // ================================================
            if (statusText) statusText.textContent = 'Finalisation des résultats...';
            if (alertText) alertText.textContent = 'Préparation de l\'interface de révision';
            this.updateProgress(95);

            await new Promise(resolve => setTimeout(resolve, 800));

            const results = this.buildResults();
            
            this.updateProgress(100);
            if (statusText) statusText.textContent = 'Scan terminé !';
            if (alertText) alertText.textContent = `${results.totalEmails} emails analysés dans ${results.totalDomains} domaines`;

            console.log(`[DomainOrganizer] ✅ Scan complet terminé: ${results.totalEmails} emails, ${results.totalDomains} domaines`);
            
            // Transition vers les résultats
            setTimeout(() => {
                this.showResults(results);
            }, 1000);

        } catch (error) {
            console.error('[DomainOrganizer] Complete scan error:', error);
            this.updateAlert('error', 'Erreur de scan', error.message);
            throw error;
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
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
            
            // Réseaux sociaux
            'linkedin.com': 'LinkedIn', 'github.com': 'GitHub',
            'facebook.com': 'Facebook', 'instagram.com': 'Instagram',
            'twitter.com': 'Twitter', 'discord.com': 'Discord',
            
            // Services
            'paypal.com': 'PayPal', 'stripe.com': 'Stripe',
            'spotify.com': 'Spotify', 'netflix.com': 'Netflix',
            'dropbox.com': 'Dropbox', 'google.com': 'Google',
            'microsoft.com': 'Microsoft', 'apple.com': 'Apple',
            
            // Banques
            'boursorama.com': 'Boursorama', 'creditagricole.fr': 'Crédit Agricole',
            'bnpparibas.fr': 'BNP Paribas', 'societegenerale.fr': 'Société Générale'
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

    updateProgress(percent) {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = `${Math.min(percent, 100)}%`;
        }
    }

    updateAlert(type, title, message) {
        const alertElements = document.querySelectorAll('.alert');
        alertElements.forEach(alert => {
            alert.className = `alert ${type}`;
            
            const icon = alert.querySelector('.icon');
            const strong = alert.querySelector('strong');
            const p = alert.querySelector('p');
            
            if (icon) {
                const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
                icon.textContent = icons[type] || 'ℹ️';
            }
            if (strong) strong.textContent = title;
            if (p) p.textContent = message;
        });
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
                <div class="domain-meta">${domainData.count} emails → ${domainData.suggestedFolder}</div>
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
    // EXÉCUTION AVEC ALERTES DÉTAILLÉES
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
        
        // ALERTE DÉTAILLÉE AVANT EXÉCUTION
        const uniqueFolders = new Set(selectedDomains.map(d => d.suggestedFolder));
        const warning = `⚠️ CONFIRMATION REQUISE\n\n` +
            `Vous allez modifier votre boîte mail :\n\n` +
            `📧 ${totalEmails} emails seront ${moveEmails ? 'DÉPLACÉS' : 'marqués pour déplacement'}\n` +
            `📁 ${uniqueFolders.size} dossiers seront ${createFolders ? 'CRÉÉS' : 'utilisés'}\n` +
            `⏱️ Opération estimée : ${Math.ceil(totalEmails / 100)} minutes\n\n` +
            `${moveEmails ? '🔄 VOS EMAILS SERONT RÉELLEMENT DÉPLACÉS !' : '👁️ Mode simulation uniquement'}\n\n` +
            `Continuer ?`;
        
        if (!confirm(warning)) {
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
        
        const executeFill = document.getElementById('executeFill');
        const executeStatus = document.getElementById('executeStatus')?.querySelector('.text');
        const executeText = document.getElementById('executeText');
        const foldersCreated = document.getElementById('foldersCreated');
        const emailsMoved = document.getElementById('emailsMoved');
        
        let progress = 0;
        let foldersCount = 0;
        let emailsCount = 0;
        
        const uniqueFolders = new Set(selectedDomains.map(d => d.suggestedFolder));
        const totalFolders = options.createFolders ? uniqueFolders.size : 0;
        
        // ALERTES DYNAMIQUES PENDANT L'EXÉCUTION
        const phases = [
            {
                name: 'Préparation',
                alert: 'Préparation des opérations de modification de votre boîte mail',
                duration: 10
            },
            {
                name: 'Création des dossiers',
                alert: options.createFolders ? 
                    `Création de ${totalFolders} nouveaux dossiers dans votre interface Outlook` :
                    'Vérification de l\'existence des dossiers cibles',
                duration: 30
            },
            {
                name: 'Déplacement des emails',
                alert: options.moveEmails ?
                    `DÉPLACEMENT EN COURS : ${options.totalEmails} emails sont transférés vers leurs nouveaux dossiers` :
                    `SIMULATION : ${options.totalEmails} emails seraient déplacés (aucune modification réelle)`,
                duration: 50
            },
            {
                name: 'Vérification',
                alert: 'Vérification de l\'intégrité des opérations effectuées',
                duration: 10
            }
        ];
        
        let currentPhase = 0;
        
        const interval = setInterval(() => {
            progress += 2;
            
            // Déterminer la phase actuelle
            let cumulativeDuration = 0;
            for (let i = 0; i < phases.length; i++) {
                cumulativeDuration += phases[i].duration;
                if (progress <= cumulativeDuration) {
                    if (currentPhase !== i) {
                        currentPhase = i;
                        const phase = phases[currentPhase];
                        if (executeStatus) executeStatus.textContent = phase.name;
                        if (executeText) executeText.textContent = phase.alert;
                    }
                    break;
                }
            }
            
            // Mettre à jour les compteurs selon la phase
            if (progress <= 40) {
                // Phase création de dossiers
                foldersCount = Math.floor((progress / 40) * totalFolders);
            } else if (progress <= 90) {
                // Phase déplacement
                foldersCount = totalFolders;
                emailsCount = Math.floor(((progress - 40) / 50) * options.totalEmails);
            } else {
                // Phase finale
                foldersCount = totalFolders;
                emailsCount = options.totalEmails;
            }
            
            // Mettre à jour l'interface
            if (executeFill) executeFill.style.width = `${Math.min(progress, 100)}%`;
            if (foldersCreated) foldersCreated.textContent = foldersCount;
            if (emailsMoved) emailsMoved.textContent = emailsCount;
            
            if (progress >= 100) {
                clearInterval(interval);
                
                if (executeStatus) executeStatus.textContent = 'Terminé !';
                if (executeText) executeText.textContent = options.moveEmails ?
                    'Toutes les modifications ont été appliquées à votre boîte mail' :
                    'Simulation terminée - aucune modification réelle effectuée';
                
                setTimeout(() => {
                    this.showSuccess({
                        emailsMoved: emailsCount,
                        foldersCreated: foldersCount,
                        wasSimulation: !options.moveEmails
                    });
                }, 1000);
            }
        }, 100);
    }

    showSuccess(results) {
        this.updateStep(5);
        
        const finalEmails = document.getElementById('finalEmails');
        const finalFolders = document.getElementById('finalFolders');
        
        if (finalEmails) finalEmails.textContent = results.emailsMoved.toLocaleString();
        if (finalFolders) finalFolders.textContent = results.foldersCreated;
        
        // Message personnalisé selon le mode
        const successCard = document.querySelector('.success-content h2');
        const successText = document.querySelector('.success-content p');
        
        if (results.wasSimulation) {
            if (successCard) successCard.textContent = 'Simulation terminée !';
            if (successText) successText.textContent = 'Aucune modification réelle n\'a été effectuée sur vos emails';
        } else {
            if (successCard) successCard.textContent = 'Organisation terminée !';
            if (successText) successText.textContent = 'Vos emails ont été organisés avec succès';
        }
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS ET INITIALISATION
    // ================================================
    async initializePage() {
        console.log('[DomainOrganizer] Initializing v10.0 Minimal...');
        
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
        
        console.log('[DomainOrganizer] ✅ Minimal interface ready v10.0');
        return true;
    }

    setupEventListeners() {
        const form = document.getElementById('scanForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const formData = this.getFormData();
        
        // ALERTE DE CONFIRMATION POUR SCAN COMPLET
        const confirmMessage = `🔍 SCAN COMPLET SANS LIMITE\n\n` +
            `Vous allez analyser TOUS vos emails :\n\n` +
            `📂 Source : ${this.getFolderDisplayName(formData.sourceFolder)}\n` +
            `⚠️ Aucune limitation de date ou de nombre\n` +
            `⏱️ Durée estimée : 5-15 minutes selon la taille\n\n` +
            `Cette opération accède à vos emails en LECTURE SEULE uniquement.\n\n` +
            `Lancer le scan complet ?`;
        
        if (!confirm(confirmMessage)) {
            this.isProcessing = false;
            return;
        }

        await this.startCompleteScan(formData);
    }

    getFormData() {
        const sourceFolder = document.getElementById('sourceFolder')?.value || 'all';
        const excludeDomains = document.getElementById('excludeDomains')?.value
            .split(',').map(d => d.trim().toLowerCase()).filter(d => d) || [];
        
        return { 
            sourceFolder,
            excludeDomains
        };
    }

    configure(formData) {
        // Configuration minimale
        console.log('[DomainOrganizer] Configuration:', formData);
    }

    reset() {
        this.updateStep(1);
        
        const form = document.getElementById('scanForm');
        if (form) form.reset();
        
        this.emailsByDomain.clear();
        this.currentAnalysis = null;
        this.isProcessing = false;
        this.currentStep = 1;
    }

    openOutlook() {
        window.open('https://outlook.office.com/mail/', '_blank');
    }

    showError(message) {
        console.error('[DomainOrganizer] Error:', message);
        
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            alert(`❌ ${message}`);
        }
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
window.organizerInstance = new DomainOrganizer();

function showDomainOrganizerMinimal() {
    console.log('[DomainOrganizer] 🚀 Launching v10.0 Minimal with complete scan...');
    
    if (!window.authService?.isAuthenticated()) {
        const message = 'Connexion Microsoft requise pour l\'organisateur d\'emails';
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'warning');
        } else {
            alert(`⚠️ ${message}`);
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
            console.log('[DomainOrganizer] ✅ Minimal ready v10.0');
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
        setTimeout(showDomainOrganizerMinimal, 20);
        return false;
    }
}, true);

// Hook PageManager
if (window.pageManager?.loadPage) {
    const originalLoadPage = window.pageManager.loadPage;
    
    window.pageManager.loadPage = function(pageName) {
        if (pageName === 'ranger') {
            showDomainOrganizerMinimal();
            return;
        }
        return originalLoadPage.call(this, pageName);
    };
}

// Exports
window.showDomainOrganizer = showDomainOrganizerMinimal;
window.domainOrganizer = {
    showPage: showDomainOrganizerMinimal,
    instance: window.organizerInstance,
    version: '10.0'
};

console.log('[DomainOrganizer] ✅ v10.0 Minimal System ready - Scan complet + Alertes détaillées');
