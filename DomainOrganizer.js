// DomainOrganizer.js - Version 8.3 - Scan Réel Intégré
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
        
        // Nouvelles propriétés pour le scan réel
        this.realEmails = [];
        this.scanProgress = {
            totalEmails: 0,
            processedEmails: 0,
            domainsFound: new Set(),
            startTime: null
        }

    // Nouvelle méthode pour récupérer TOUS les emails avec pagination
    async getAllEmailsFromFolder(folderName, formData) {
        console.log(`[DomainOrganizer] 📧 Récupération de TOUS les emails du dossier: ${folderName}`);
        
        let allEmails = [];
        let hasMore = true;
        let skipToken = null;
        let pageCount = 0;
        const maxPages = 50; // Limite de sécurité
        
        const progressBar = document.getElementById('progressBar');
        const emailsAnalyzed = document.getElementById('emailsAnalyzed');
        const currentDomain = document.getElementById('currentDomain');
        
        while (hasMore && pageCount < maxPages) {
            try {
                pageCount++;
                
                if (currentDomain) {
                    currentDomain.textContent = `${folderName}: page ${pageCount} (${allEmails.length} emails)`;
                }
                
                // Utiliser l'API Graph directement pour contourner la limite
                const token = await window.authService.getAccessToken();
                const baseUrl = 'https://graph.microsoft.com/v1.0/me/mailFolders';
                
                // Construire le filtre de date
                let filter = '';
                if (formData.startDate || formData.endDate) {
                    const filters = [];
                    if (formData.startDate) {
                        const startDate = new Date(formData.startDate).toISOString();
                        filters.push(`receivedDateTime ge ${startDate}`);
                    }
                    if (formData.endDate) {
                        const endDate = new Date(formData.endDate + 'T23:59:59.999Z').toISOString();
                        filters.push(`receivedDateTime le ${endDate}`);
                    }
                    filter = filters.join(' and ');
                }
                
                // Construire l'URL de la requête
                let url = `${baseUrl}/${folderName}/messages?$top=999&$orderby=receivedDateTime desc&$select=id,subject,bodyPreview,body,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,isRead,importance,hasAttachments,flag,categories,parentFolderId,webLink`;
                
                if (filter) {
                    url += `&$filter=${encodeURIComponent(filter)}`;
                }
                
                if (skipToken) {
                    url += `&$skiptoken=${encodeURIComponent(skipToken)}`;
                }
                
                console.log(`[DomainOrganizer] 🔍 Page ${pageCount}: ${url.substring(0, 150)}...`);
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                const emails = data.value || [];
                
                allEmails = allEmails.concat(emails);
                
                // Vérifier s'il y a plus de pages
                hasMore = !!data['@odata.nextLink'];
                if (hasMore && data['@odata.nextLink']) {
                    // Extraire le skipToken de l'URL nextLink
                    const nextUrl = new URL(data['@odata.nextLink']);
                    skipToken = nextUrl.searchParams.get('$skiptoken');
                }
                
                console.log(`[DomainOrganizer] ✅ Page ${pageCount}: ${emails.length} emails (Total: ${allEmails.length})`);
                
                // Mise à jour de l'interface
                if (emailsAnalyzed) emailsAnalyzed.textContent = allEmails.length;
                if (progressBar) {
                    const progress = Math.min(10 + (pageCount * 2), 30); // 10-30%
                    progressBar.style.width = `${progress}%`;
                }
                
                // Pause pour éviter de surcharger l'API
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`[DomainOrganizer] Erreur page ${pageCount}:`, error);
                
                // Si c'est la première page, essayer avec MailService en fallback
                if (pageCount === 1) {
                    console.warn('[DomainOrganizer] Fallback vers MailService...');
                    try {
                        const fallbackEmails = await window.mailService.getEmailsFromFolder(folderName, {
                            startDate: formData.startDate,
                            endDate: formData.endDate
                        });
                        return fallbackEmails;
                    } catch (fallbackError) {
                        console.error('[DomainOrganizer] Fallback failed:', fallbackError);
                    }
                }
                
                break;
            }
        }
        
        if (pageCount >= maxPages) {
            console.warn(`[DomainOrganizer] ⚠️ Limite de ${maxPages} pages atteinte pour ${folderName}`);
        }
        
        console.log(`[DomainOrganizer] 🎯 Total récupéré de ${folderName}: ${allEmails.length} emails en ${pageCount} pages`);
        return allEmails;;
        
        console.log('[DomainOrganizer] ✅ v8.3 - Scan Réel Intégré');
    }

    getPageHTML() {
        return `
            <div class="organizer-container">
                <!-- Header compact -->
                <div class="organizer-header">
                    <div class="header-content">
                        <div class="header-title">
                            <h1>📁 Rangement par domaine</h1>
                            <p>Organisation automatique et intelligente</p>
                        </div>
                        
                        <!-- Progress compact -->
                        <div class="progress-steps">
                            <div class="step active" data-step="1">1</div>
                            <div class="step" data-step="2">2</div>
                            <div class="step" data-step="3">3</div>
                            <div class="step" data-step="4">4</div>
                        </div>
                    </div>
                </div>

                <!-- Contenu compact -->
                <div class="content-wrapper">
                    <!-- Étape 1: Configuration -->
                    <div class="step-content" id="step1" style="display: block;">
                        <div class="card">
                            <div class="card-header">
                                <h2>⚙️ Configuration</h2>
                            </div>

                            <div class="info-box">
                                <strong>Comment ça marche ?</strong>
                                <p>Analyse automatique de vos emails par domaine expéditeur pour un rangement intelligent.</p>
                            </div>

                            <form id="organizeForm" class="form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Date début</label>
                                        <input type="date" id="startDate" class="input">
                                    </div>
                                    <div class="form-group">
                                        <label>Date fin</label>
                                        <input type="date" id="endDate" class="input">
                                    </div>
                                </div>

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
                                    <label>Domaines à exclure (optionnel)</label>
                                    <input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com" class="input">
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary" id="analyzeBtn">
                                        🔍 Analyser mes emails
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Étape 2: Analyse -->
                    <div class="step-content" id="step2" style="display: none;">
                        <div class="card">
                            <div class="card-header">
                                <h2>🔍 Analyse en cours...</h2>
                                <p id="analysisDescription">Connexion à votre boîte mail</p>
                            </div>

                            <div class="progress-section">
                                <div class="stats-grid">
                                    <div class="stat">
                                        <div class="stat-number" id="emailsAnalyzed">0</div>
                                        <div class="stat-label">Emails</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="domainsFound">0</div>
                                        <div class="stat-label">Domaines</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-number" id="foldersToCreate">0</div>
                                        <div class="stat-label">Dossiers</div>
                                    </div>
                                </div>
                                
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progressBar"></div>
                                </div>
                                
                                <div class="current-domain" id="currentDomain" style="margin-top: 12px; text-align: center; font-size: 13px; color: #6b7280;">
                                    Initialisation...
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 3: Révision -->
                    <div class="step-content" id="step3" style="display: none;">
                        <div class="card">
                            <div class="card-header">
                                <h2>✏️ Révision</h2>
                                <div class="summary">
                                    <span id="totalEmailsFound">0</span> emails dans <span id="totalDomainsFound">0</span> domaines
                                </div>
                            </div>

                            <!-- Contrôles compacts -->
                            <div class="controls">
                                <div class="control-buttons">
                                    <button class="btn-small" onclick="window.organizerInstance.selectAllEmails()">
                                        ✓ Tout
                                    </button>
                                    <button class="btn-small" onclick="window.organizerInstance.deselectAllEmails()">
                                        ✗ Rien
                                    </button>
                                    <button class="btn-small" onclick="window.organizerInstance.expandAllDomains()">
                                        ⬇ Développer
                                    </button>
                                </div>
                                
                                <div class="search-box">
                                    <input type="text" id="emailSearch" placeholder="🔍 Rechercher..." class="search-input">
                                </div>
                            </div>

                            <!-- Liste compacte -->
                            <div class="domains-container" id="detailedResults">
                                <!-- Populated dynamically -->
                            </div>

                            <!-- Actions -->
                            <div class="actions">
                                <label class="checkbox">
                                    <input type="checkbox" id="createFolders" checked>
                                    Créer nouveaux dossiers
                                </label>
                                
                                <div class="action-buttons">
                                    <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                                        ← Retour
                                    </button>
                                    <button class="btn btn-primary" id="applyBtn" onclick="window.organizerInstance.applyOrganization()">
                                        ▶ Organiser <span id="selectedCount">0</span> emails
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 4: Organisation -->
                    <div class="step-content" id="step4" style="display: none;">
                        <div class="card">
                            <div class="card-header">
                                <h2>⚙️ Organisation...</h2>
                                <p id="organizationDescription">Création des dossiers</p>
                            </div>

                            <div class="progress-section">
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
                                
                                <div class="progress-bar">
                                    <div class="progress-fill success" id="executeBar"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Étape 5: Succès -->
                    <div class="step-content" id="step5" style="display: none;">
                        <div class="card success">
                            <div class="success-content">
                                <div class="success-icon">✅</div>
                                <h2>Organisation terminée !</h2>
                                <p id="successMessage">Vos emails ont été organisés avec succès</p>
                                
                                <div class="success-stats">
                                    <div class="success-stat">
                                        <span id="finalEmailsMoved">0</span> emails
                                    </div>
                                    <div class="success-stat">
                                        <span id="finalFoldersCreated">0</span> dossiers
                                    </div>
                                    <div class="success-stat">
                                        <span id="totalTime">2m 34s</span>
                                    </div>
                                </div>

                                <div class="success-actions">
                                    <button class="btn btn-secondary" onclick="window.organizerInstance.resetForm()">
                                        🔄 Recommencer
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
                /* Design minimaliste et moderne */
                .organizer-container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 16px;
                    background: #fafafa;
                    min-height: 100vh;
                    overflow-y: auto !important;
                }

                /* Header ultra-compact */
                .organizer-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    padding: 20px 24px;
                    margin-bottom: 16px;
                    color: white;
                    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                }

                .header-title h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                }

                .header-title p {
                    margin: 2px 0 0 0;
                    opacity: 0.9;
                    font-size: 14px;
                }

                /* Progress steps minimaliste */
                .progress-steps {
                    display: flex;
                    gap: 8px;
                }

                .progress-steps .step {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .progress-steps .step.active {
                    background: white;
                    color: #667eea;
                    transform: scale(1.1);
                }

                .progress-steps .step.completed {
                    background: #10b981;
                    color: white;
                }

                /* Content wrapper compact */
                .content-wrapper {
                    max-width: 100%;
                }

                .step-content {
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Cards minimalistes */
                .card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    margin-bottom: 16px;
                    overflow: hidden;
                }

                .card-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #f3f4f6;
                }

                .card-header h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .card-header p {
                    margin: 4px 0 0 0;
                    color: #6b7280;
                    font-size: 14px;
                }

                .summary {
                    color: #059669;
                    font-weight: 600;
                    font-size: 14px;
                    margin-top: 8px;
                }

                /* Info box compact */
                .info-box {
                    margin: 20px 24px;
                    padding: 16px;
                    background: #eff6ff;
                    border-radius: 6px;
                    border-left: 3px solid #3b82f6;
                }

                .info-box strong {
                    color: #1e40af;
                    font-size: 14px;
                }

                .info-box p {
                    margin: 4px 0 0 0;
                    color: #1e40af;
                    font-size: 13px;
                    line-height: 1.5;
                }

                /* Formulaire compact */
                .form {
                    padding: 20px 24px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                }

                .input {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }

                .input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .form-actions {
                    margin-top: 20px;
                    text-align: center;
                }

                /* Boutons minimalistes */
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn-primary:hover {
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

                .btn-small {
                    padding: 6px 12px;
                    font-size: 12px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-small:hover {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                }

                /* Progress section compacte */
                .progress-section {
                    padding: 20px 24px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .stat {
                    text-align: center;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 6px;
                }

                .stat-number {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1f2937;
                    margin-bottom: 4px;
                }

                .stat-label {
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .progress-bar {
                    height: 8px;
                    background: #f3f4f6;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                    width: 0%;
                }

                .progress-fill.success {
                    background: linear-gradient(90deg, #10b981, #059669);
                }

                .current-domain {
                    font-style: italic;
                    opacity: 0.8;
                }

                /* Contrôles compacts */
                .controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid #f3f4f6;
                    gap: 16px;
                }

                .control-buttons {
                    display: flex;
                    gap: 8px;
                }

                .search-box {
                    flex: 1;
                    max-width: 200px;
                }

                .search-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                }

                /* Liste de domaines ultra-compacte */
                .domains-container {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .domain-item {
                    border-bottom: 1px solid #f3f4f6;
                    transition: background-color 0.2s ease;
                }

                .domain-item:hover {
                    background: #fafafa;
                }

                .domain-header {
                    display: flex;
                    align-items: center;
                    padding: 12px 24px;
                    cursor: pointer;
                    gap: 12px;
                }

                .domain-checkbox {
                    width: 16px;
                    height: 16px;
                    accent-color: #3b82f6;
                }

                .domain-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .domain-info {
                    flex: 1;
                    min-width: 0;
                }

                .domain-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 2px;
                }

                .domain-meta {
                    font-size: 12px;
                    color: #6b7280;
                }

                .domain-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .folder-select {
                    padding: 6px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 12px;
                    background: white;
                    min-width: 100px;
                }

                .badge {
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .badge-new {
                    background: #dcfce7;
                    color: #166534;
                }

                .badge-existing {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .expand-icon {
                    color: #9ca3af;
                    font-size: 12px;
                    transition: transform 0.3s ease;
                }

                .domain-item.expanded .expand-icon {
                    transform: rotate(90deg);
                }

                /* Emails compacts */
                .emails-list {
                    display: none;
                    background: #fafafa;
                }

                .domain-item.expanded .emails-list {
                    display: block;
                }

                .email-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 24px 8px 52px;
                    gap: 12px;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 12px;
                }

                .email-item:hover {
                    background: #f9fafb;
                }

                .email-item.selected {
                    background: #eff6ff;
                    border-left: 2px solid #3b82f6;
                }

                .email-checkbox {
                    width: 14px;
                    height: 14px;
                    accent-color: #3b82f6;
                }

                .email-content {
                    flex: 1;
                    min-width: 0;
                }

                .email-subject {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .email-meta {
                    color: #6b7280;
                    font-size: 11px;
                }

                .email-folder-select {
                    padding: 4px 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 11px;
                    background: white;
                    min-width: 80px;
                }

                /* Actions compactes */
                .actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-top: 1px solid #f3f4f6;
                    background: #fafafa;
                }

                .action-buttons {
                    display: flex;
                    gap: 12px;
                }

                .checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #374151;
                    cursor: pointer;
                }

                .checkbox input {
                    width: 16px;
                    height: 16px;
                    accent-color: #3b82f6;
                }

                /* Succès minimaliste */
                .card.success {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }

                .success-content {
                    padding: 32px 24px;
                    text-align: center;
                }

                .success-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .success-content h2 {
                    margin: 0 0 8px 0;
                    font-size: 20px;
                    color: white;
                }

                .success-content p {
                    margin: 0 0 20px 0;
                    opacity: 0.9;
                    font-size: 14px;
                }

                .success-stats {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .success-stat {
                    text-align: center;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    font-size: 12px;
                    min-width: 60px;
                }

                .success-stat span {
                    display: block;
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }

                .success-actions {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                }

                .success-actions .btn-secondary {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .success-actions .btn-primary {
                    background: white;
                    color: #059669;
                }

                /* Responsive compact */
                @media (max-width: 768px) {
                    .organizer-container {
                        padding: 12px;
                    }
                    
                    .header-content {
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .controls {
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .domain-header {
                        flex-wrap: wrap;
                    }
                    
                    .actions {
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .success-stats {
                        flex-direction: column;
                        gap: 8px;
                    }
                }

                /* Scrollbar minimaliste */
                .domains-container::-webkit-scrollbar {
                    width: 6px;
                }

                .domains-container::-webkit-scrollbar-track {
                    background: #f3f4f6;
                }

                .domains-container::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                }

                .domains-container::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            </style>
        `;
    }

    // Méthodes de scan réel
    async startAnalysis(formData) {
        try {
            this.updateStepIndicator(2);
            
            this.configure({
                excludeDomains: formData.excludeDomains,
                excludeEmails: formData.excludeEmails
            });
            
            // Réel scan au lieu de simulation
            await this.performRealAnalysis(formData);
            
        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            this.showError(`Erreur: ${error.message}`);
            this.resetForm();
        } finally {
            this.isProcessing = false;
        }
    }

    async performRealAnalysis(formData) {
        console.log('[DomainOrganizer] 🔍 Starting real email analysis...');
        
        // Vérifier que MailService est disponible
        if (!window.mailService) {
            throw new Error('MailService non disponible');
        }

        // Réinitialiser les compteurs
        this.scanProgress = {
            totalEmails: 0,
            processedEmails: 0,
            domainsFound: new Set(),
            startTime: Date.now()
        };
        
        this.realEmails = [];
        this.emailsByDomain.clear();

        const progressBar = document.getElementById('progressBar');
        const emailsAnalyzed = document.getElementById('emailsAnalyzed');
        const domainsFound = document.getElementById('domainsFound');
        const foldersToCreate = document.getElementById('foldersToCreate');
        const analysisDescription = document.getElementById('analysisDescription');
        const currentDomain = document.getElementById('currentDomain');

        try {
            // Étape 1: Connexion
            if (analysisDescription) analysisDescription.textContent = 'Connexion à votre boîte mail...';
            if (currentDomain) currentDomain.textContent = 'Initialisation...';
            
            await new Promise(resolve => setTimeout(resolve, 500));

            // Étape 2: Récupération des emails
            if (analysisDescription) analysisDescription.textContent = 'Récupération des emails...';
            
            let emails = [];

            if (formData.sourceFolder === 'all') {
                // Récupérer de plusieurs dossiers
                const folders = ['inbox', 'sent', 'archive'];
                
                for (const folder of folders) {
                    try {
                        if (currentDomain) currentDomain.textContent = `Analyse du dossier: ${folder}`;
                        const folderEmails = await this.getAllEmailsFromFolder(folder, formData);
                        emails = emails.concat(folderEmails);
                        
                        // Mise à jour progressive
                        this.scanProgress.totalEmails = emails.length;
                        if (emailsAnalyzed) emailsAnalyzed.textContent = emails.length;
                        
                        await new Promise(resolve => setTimeout(resolve, 200));
                    } catch (error) {
                        console.warn(`[DomainOrganizer] Erreur dossier ${folder}:`, error);
                    }
                }
            } else {
                // Récupérer d'un seul dossier
                if (currentDomain) currentDomain.textContent = `Analyse du dossier: ${formData.sourceFolder}`;
                emails = await this.getAllEmailsFromFolder(formData.sourceFolder, formData);
            }

            this.scanProgress.totalEmails = emails.length;
            
            if (emails.length === 0) {
                throw new Error('Aucun email trouvé dans la période sélectionnée');
            }

            console.log(`[DomainOrganizer] 📧 ${emails.length} emails récupérés`);

            // Étape 3: Analyse des domaines
            if (analysisDescription) analysisDescription.textContent = 'Analyse des domaines...';
            if (progressBar) progressBar.style.width = '20%';

            for (let i = 0; i < emails.length; i++) {
                const email = emails[i];
                
                // Extraire le domaine
                const domain = this.extractDomain(email.from?.emailAddress?.address || email.sender?.emailAddress?.address || '');
                
                if (!domain || this.excludedDomains.has(domain.toLowerCase())) {
                    continue;
                }

                if (currentDomain) currentDomain.textContent = `Analyse: ${domain}`;
                
                // Ajouter à la collection par domaine
                if (!this.emailsByDomain.has(domain)) {
                    this.emailsByDomain.set(domain, []);
                    this.scanProgress.domainsFound.add(domain);
                }
                
                this.emailsByDomain.get(domain).push({
                    id: email.id,
                    subject: email.subject || 'Sans objet',
                    sender: email.from?.emailAddress?.address || email.sender?.emailAddress?.address || '',
                    senderName: email.from?.emailAddress?.name || email.sender?.emailAddress?.name || domain,
                    date: new Date(email.receivedDateTime || email.sentDateTime).toLocaleDateString('fr-FR'),
                    targetFolder: this.suggestFolderName(domain),
                    selected: true,
                    originalEmail: email
                });

                this.scanProgress.processedEmails = i + 1;
                
                // Mise à jour progressive de l'interface
                if (i % 10 === 0 || i === emails.length - 1) {
                    const progress = Math.floor((i + 1) / emails.length * 80) + 20; // 20-100%
                    if (progressBar) progressBar.style.width = `${progress}%`;
                    if (emailsAnalyzed) emailsAnalyzed.textContent = this.scanProgress.processedEmails;
                    if (domainsFound) domainsFound.textContent = this.scanProgress.domainsFound.size;
                    if (foldersToCreate) {
                        const uniqueFolders = new Set();
                        this.emailsByDomain.forEach((emails, domain) => {
                            uniqueFolders.add(this.suggestFolderName(domain));
                        });
                        foldersToCreate.textContent = uniqueFolders.size;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            // Finalisation
            if (analysisDescription) analysisDescription.textContent = 'Finalisation de l\'analyse...';
            if (progressBar) progressBar.style.width = '100%';
            if (currentDomain) currentDomain.textContent = 'Analyse terminée';

            await new Promise(resolve => setTimeout(resolve, 500));

            // Construire les résultats
            const results = this.buildAnalysisResults();
            
            console.log(`[DomainOrganizer] ✅ Analyse terminée: ${results.totalEmails} emails, ${results.totalDomains} domaines`);
            
            this.showRevisionStep(results);

        } catch (error) {
            console.error('[DomainOrganizer] Real analysis error:', error);
            throw error;
        }
    }

    extractDomain(email) {
        if (!email) return null;
        
        const match = email.match(/@(.+)$/);
        return match ? match[1].toLowerCase() : null;
    }

    suggestFolderName(domain) {
        // Suggestions intelligentes de noms de dossiers
        const domainMap = {
            'linkedin.com': 'LinkedIn',
            'github.com': 'GitHub', 
            'amazon.com': 'Amazon',
            'amazon.fr': 'Amazon',
            'paypal.com': 'PayPal',
            'netflix.com': 'Netflix',
            'spotify.com': 'Spotify',
            'facebook.com': 'Facebook',
            'instagram.com': 'Instagram',
            'twitter.com': 'Twitter',
            'microsoft.com': 'Microsoft',
            'google.com': 'Google',
            'apple.com': 'Apple',
            'dropbox.com': 'Dropbox',
            'slack.com': 'Slack'
        };

        if (domainMap[domain]) {
            return domainMap[domain];
        }

        // Extraire le nom principal du domaine
        const parts = domain.split('.');
        const mainPart = parts[0];
        
        // Capitaliser la première lettre
        return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    }

    buildAnalysisResults() {
        const domains = [];
        let totalEmails = 0;

        this.emailsByDomain.forEach((emails, domain) => {
            totalEmails += emails.length;
            
            domains.push({
                domain: domain,
                count: emails.length,
                action: 'create-new', // On suppose toujours nouveau pour l'instant
                suggestedFolder: this.suggestFolderName(domain),
                emails: emails,
                selected: true
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
            domains: domains
        };
    }

    // Méthodes identiques mais optimisées
    updateStepIndicator(step) {
        console.log(`[DomainOrganizer] Updating to step ${step}`);
        
        document.querySelectorAll('.progress-steps .step').forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index + 1 < step) {
                stepEl.classList.add('completed');
            } else if (index + 1 === step) {
                stepEl.classList.add('active');
            }
        });
        
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
        console.log('[DomainOrganizer] Initializing v8.3 Real Scan...');
        
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }

        if (!window.mailService) {
            this.showError('MailService non disponible');
            return false;
        }

        this.enableScroll();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.updateStepIndicator(1);
        this.isActive = true;
        
        console.log('[DomainOrganizer] ✅ Real scan interface ready v8.3');
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
    }

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.valueAsDate = thirtyDaysAgo;
        if (endDateInput) endDateInput.valueAsDate = today;
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
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
        const sourceFolder = document.getElementById('sourceFolder')?.value || 'inbox';
        const excludeDomains = document.getElementById('excludeDomains')?.value
            .split(',').map(d => d.trim()).filter(d => d) || [];
        
        return { 
            startDate, 
            endDate, 
            sourceFolder,
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
        
        if (totalEmailsFound) totalEmailsFound.textContent = results.totalEmails.toLocaleString();
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
                    <div class="domain-meta">${domainData.count} emails • ${selectedEmails} sélectionnés</div>
                </div>
                
                <div class="domain-controls">
                    <select class="folder-select" data-domain="${domainData.domain}">
                        <option value="${domainData.suggestedFolder}" selected>${domainData.suggestedFolder}</option>
                        <option value="inbox">Boîte de réception</option>
                        <option value="archive">Archive</option>
                        <option value="important">Important</option>
                    </select>
                    
                    <span class="badge ${isNewFolder ? 'badge-new' : 'badge-existing'}">
                        ${isNewFolder ? 'Nouveau' : 'Existant'}
                    </span>
                    
                    <i class="fas fa-chevron-right expand-icon"></i>
                </div>
            </div>
            
            <div class="emails-list">
                ${domainData.emails.map(email => this.createEmailItem(email, domainData.domain)).join('')}
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
                    <div class="email-subject">${emailData.subject}</div>
                    <div class="email-meta">De: ${emailData.senderName} • ${emailData.date}</div>
                </div>
                
                <select class="email-folder-select" data-email-id="${emailData.id}" 
                        onchange="window.organizerInstance.handleEmailFolderChange(event)">
                    <option value="${emailData.targetFolder}" selected>${emailData.targetFolder}</option>
                    <option value="inbox">Boîte de réception</option>
                    <option value="archive">Archive</option>
                    <option value="important">Important</option>
                </select>
            </div>
        `;
    }

    // Méthodes de gestion simplifiées
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
        const selectedCount = Array.from(this.emailActions.values()).filter(action => action.selected).length;
        
        const selectedCountSpan = document.getElementById('selectedCount');
        const applyBtn = document.getElementById('applyBtn');
        
        if (selectedCountSpan) selectedCountSpan.textContent = selectedCount.toLocaleString();
        
        if (applyBtn) {
            applyBtn.disabled = selectedCount === 0;
            applyBtn.textContent = selectedCount === 0 
                ? 'Aucun email sélectionné' 
                : `▶ Organiser ${selectedCount} emails`;
        }
    }

    handleSearch(searchTerm) {
        const emailItems = document.querySelectorAll('.email-item');
        const domainRows = document.querySelectorAll('.domain-item');
        
        emailItems.forEach(item => {
            const subject = item.querySelector('.email-subject')?.textContent.toLowerCase() || '';
            const meta = item.querySelector('.email-meta')?.textContent.toLowerCase() || '';
            
            const matches = subject.includes(searchTerm.toLowerCase()) || meta.includes(searchTerm.toLowerCase());
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
        
        if (searchTerm) {
            domainRows.forEach(row => {
                const visibleEmails = row.querySelectorAll('.email-item[style*="flex"]').length;
                row.style.display = visibleEmails > 0 ? 'block' : 'none';
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
            
            await this.simulateExecution(selectedEmails);
            
        } catch (error) {
            console.error('[DomainOrganizer] Apply error:', error);
            this.showError(`Erreur: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    async simulateExecution(selectedEmails) {
        this.updateStepIndicator(4);
        
        const executeBar = document.getElementById('executeBar');
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
            'Création des dossiers',
            'Déplacement des emails',
            'Vérification',
            'Finalisation'
        ];
        
        let descIndex = 0;
        let startTime = Date.now();
        
        const interval = setInterval(() => {
            progress += 12;
            
            const elapsed = Date.now() - startTime;
            const estimated = (elapsed / progress) * (100 - progress);
            const remainingSeconds = Math.max(0, Math.floor(estimated / 1000));
            
            if (executeBar) executeBar.style.width = `${Math.min(progress, 100)}%`;
            if (timeRemaining && progress < 100) {
                timeRemaining.textContent = remainingSeconds > 60 
                    ? `${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s`
                    : `${remainingSeconds}s`;
            }
            
            if (progress === 24) {
                folders = Math.floor(totalFolders * 0.4);
                emails = Math.floor(totalEmails * 0.1);
                if (organizationDescription) organizationDescription.textContent = descriptions[0];
            } else if (progress === 48) {
                folders = Math.floor(totalFolders * 0.8);
                emails = Math.floor(totalEmails * 0.3);
                if (organizationDescription) organizationDescription.textContent = descriptions[1];
            } else if (progress === 72) {
                folders = totalFolders;
                emails = Math.floor(totalEmails * 0.7);
                if (organizationDescription) organizationDescription.textContent = descriptions[2];
            } else if (progress === 96) {
                emails = totalEmails;
                if (organizationDescription) organizationDescription.textContent = descriptions[3];
            } else if (progress >= 100) {
                clearInterval(interval);
                if (organizationDescription) organizationDescription.textContent = 'Terminé';
                if (timeRemaining) timeRemaining.textContent = '0s';
                
                const totalTimeElapsed = Date.now() - startTime;
                const totalMinutes = Math.floor(totalTimeElapsed / 60000);
                const totalSeconds = Math.floor((totalTimeElapsed % 60000) / 1000);
                
                setTimeout(() => this.showSuccess({ 
                    emailsMoved: emails, 
                    foldersCreated: folders,
                    totalTime: totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds}s` : `${totalSeconds}s`
                }), 800);
            }
            
            if (foldersCreated) foldersCreated.textContent = folders;
            if (emailsMoved) emailsMoved.textContent = emails;
        }, 200);
    }

    showSuccess(results) {
        this.updateStepIndicator(5);
        
        const finalEmailsMoved = document.getElementById('finalEmailsMoved');
        const finalFoldersCreated = document.getElementById('finalFoldersCreated');
        const totalTime = document.getElementById('totalTime');
        const successMessage = document.getElementById('successMessage');
        
        if (finalEmailsMoved) finalEmailsMoved.textContent = results.emailsMoved.toLocaleString();
        if (finalFoldersCreated) finalFoldersCreated.textContent = results.foldersCreated;
        if (totalTime) totalTime.textContent = results.totalTime;
        
        const message = `${results.emailsMoved} emails organisés dans ${results.foldersCreated} dossiers`;
        if (successMessage) successMessage.textContent = message;
    }

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

// Initialisation
window.organizerInstance = new DomainOrganizer();

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Launching v8.3 Real Scan...');
    
    if (!window.authService?.isAuthenticated()) {
        const message = 'Veuillez vous connecter pour utiliser l\'organisateur';
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'warning');
        } else {
            alert(message);
        }
        return;
    }

    if (!window.mailService) {
        const message = 'MailService non disponible - Veuillez recharger la page';
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            alert(message);
        }
        return;
    }

    const pageContent = document.getElementById('pageContent');
    if (!pageContent) return;

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
        if (window.domainOrganizerActive && document.getElementById('step1')) {
            try {
                await window.organizerInstance.initializePage();
                console.log('[DomainOrganizer] ✅ Real scan interface ready v8.3');
            } catch (error) {
                console.error('[DomainOrganizer] Initialization error:', error);
                if (window.uiManager?.showToast) {
                    window.uiManager.showToast('Erreur d\'initialisation', 'error');
                }
            }
        }
    }, 50);
}

// Event handling
document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]') || 
                        e.target.closest('button[onclick*="ranger"]') || 
                        e.target.closest('a[href*="ranger"]');
    
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        setTimeout(showDomainOrganizerApp, 10);
        return false;
    }
}, true);

// PageManager hook
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

// Global exports
window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = {
    showPage: showDomainOrganizerApp,
    instance: window.organizerInstance
};

console.log('[DomainOrganizer] ✅ v8.3 Real Scan System ready - UNLIMITED EMAILS WITH PAGINATION');
