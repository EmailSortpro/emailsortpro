// DomainOrganizer.js - Version 6.2.0 - Version compacte et robuste
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
        this.currentStep = 'configure';
        this.emailSelections = new Map();
        this.validationErrors = new Map();
        this.folderCreationQueue = new Map();
        console.log('[DomainOrganizer] ✅ v6.2 - Compacte et robuste');
    }

    getPageHTML() {
        return `<div class="domain-organizer-app">
<div class="organizer-header">
<h1><i class="fas fa-folder-tree"></i> Organisation par domaine</h1>
<div class="step-progress">
<div class="step active" data-step="configure">Configuration</div>
<div class="step" data-step="analyze">Analyse</div>
<div class="step" data-step="review">Validation</div>
<div class="step" data-step="execute">Exécution</div>
</div></div>

<div class="step-content active" id="configStep">
<div class="card"><h2>Configuration du rangement</h2>
<form id="organizeForm" class="config-form">
<div class="form-row">
<div class="form-group">
<label for="startDate">Date début</label>
<input type="date" id="startDate" name="startDate">
<span class="help-text">Emails à partir de cette date</span>
</div>
<div class="form-group">
<label for="endDate">Date fin</label>
<input type="date" id="endDate" name="endDate">
<span class="help-text">Emails jusqu'à cette date</span>
</div></div>

<div class="form-row">
<div class="form-group">
<label for="excludeDomains">Domaines à ignorer (optionnel)</label>
<input type="text" id="excludeDomains" placeholder="gmail.com, outlook.com">
<span class="help-text">Ces domaines ne seront pas organisés</span>
</div>
<div class="form-group">
<label for="excludeEmails">Emails spécifiques à ignorer (optionnel)</label>
<input type="text" id="excludeEmails" placeholder="boss@company.com">
<span class="help-text">Ces adresses ne seront pas déplacées</span>
</div></div>

<div class="form-actions">
<button type="submit" class="btn-primary" id="analyzeBtn">
<i class="fas fa-search"></i> Analyser les emails
</button></div></form></div></div>

<div class="step-content" id="analyzeStep">
<div class="card"><h2>Analyse en cours...</h2>
<div class="progress-section">
<div class="progress-info">
<span id="progressLabel">Initialisation</span>
<span id="progressPercent">0%</span>
</div>
<div class="progress-bar">
<div class="progress-fill" id="progressFill"></div>
</div>
<div class="progress-message" id="progressMessage">Préparation...</div>
</div></div></div>

<div class="step-content" id="reviewStep">
<div class="card"><h2>Validation de l'organisation</h2>

<div class="stats-section">
<div class="stat"><span class="stat-value" id="statEmails">0</span><span class="stat-label">Emails</span></div>
<div class="stat"><span class="stat-value" id="statDomains">0</span><span class="stat-label">Domaines</span></div>
<div class="stat"><span class="stat-value" id="statFolders">0</span><span class="stat-label">Dossiers</span></div>
<div class="stat"><span class="stat-value" id="statNew">0</span><span class="stat-label">Nouveaux</span></div>
</div>

<div class="global-controls">
<div class="control-group">
<button class="btn-secondary" onclick="window.organizerInstance.selectAllDomains()">
<i class="fas fa-check-square"></i> Tout sélectionner
</button>
<button class="btn-secondary" onclick="window.organizerInstance.deselectAllDomains()">
<i class="fas fa-square"></i> Tout désélectionner
</button></div>
<div class="validation-panel" id="validationPanel"></div>
</div>

<div class="domains-list" id="domainsList"></div>

<div class="final-actions">
<div class="summary-box">
<h3>Résumé des actions</h3>
<div class="summary-content">
<div class="summary-item"><strong id="summaryEmails">0</strong> emails seront déplacés</div>
<div class="summary-item"><strong id="summaryFolders">0</strong> dossiers seront créés</div>
<div class="summary-item"><strong id="summaryDomains">0</strong> domaines traités</div>
</div></div>

<div class="action-buttons">
<button class="btn-secondary" onclick="window.organizerInstance.goBack()">
<i class="fas fa-arrow-left"></i> Retour
</button>
<button class="btn-primary" id="executeBtn" onclick="window.organizerInstance.executeOrganization()" disabled>
<i class="fas fa-play"></i> Lancer l'organisation
</button></div></div></div></div>

<div class="step-content" id="executeStep">
<div class="card"><h2>Organisation en cours...</h2>
<div class="execution-progress">
<div class="current-operation">
<div class="operation-icon"><i class="fas fa-cogs fa-spin"></i></div>
<div class="operation-details">
<div class="operation-title" id="operationTitle">Initialisation...</div>
<div class="operation-subtitle" id="operationSubtitle">Préparation</div>
</div>
<div class="operation-status" id="operationStatus">En cours</div>
</div>

<div class="progress-section">
<div class="progress-info">
<span>Progression globale</span>
<span id="executionPercent">0%</span>
</div>
<div class="progress-bar">
<div class="progress-fill" id="executionProgressFill"></div>
</div></div>

<div class="execution-log">
<h3>Journal d'exécution</h3>
<div class="log-container" id="executionLog"></div>
</div></div></div></div>

<div class="step-content" id="resultsStep">
<div class="card">
<div class="success-header">
<div class="success-icon"><i class="fas fa-check-circle"></i></div>
<h2>Organisation terminée</h2>
<p>Votre boîte mail a été organisée selon vos préférences.</p>
</div>

<div class="results-summary">
<div class="result-stat">
<div class="result-value" id="finalEmailsMoved">0</div>
<div class="result-label">Emails déplacés</div>
</div>
<div class="result-stat">
<div class="result-value" id="finalFoldersCreated">0</div>
<div class="result-label">Dossiers créés</div>
</div>
<div class="result-stat">
<div class="result-value" id="finalErrors">0</div>
<div class="result-label">Erreurs</div>
</div></div>

<div class="results-actions">
<button class="btn-secondary" onclick="window.organizerInstance.resetForm()">
<i class="fas fa-redo"></i> Nouveau rangement
</button>
<button class="btn-primary" onclick="window.location.reload()">
<i class="fas fa-home"></i> Accueil
</button></div></div></div>
</div>

<style>
:root{--primary-color:#3b82f6;--primary-dark:#2563eb;--secondary-color:#64748b;--success-color:#10b981;--warning-color:#f59e0b;--danger-color:#ef4444;--gray-50:#f8fafc;--gray-100:#f1f5f9;--gray-200:#e2e8f0;--gray-300:#cbd5e1;--gray-500:#64748b;--gray-600:#475569;--gray-700:#334155;--gray-800:#1e293b;--gray-900:#0f172a;--border-radius:8px;--shadow:0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);--shadow-lg:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)}
.domain-organizer-app{max-width:1200px!important;margin:0 auto!important;padding:24px!important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif!important;color:var(--gray-900)!important;line-height:1.6!important;background:white!important;min-height:100vh!important}
.domain-organizer-app *{box-sizing:border-box!important}
.organizer-header{margin-bottom:32px!important;text-align:center!important;background:white!important;padding:20px 0!important}
.organizer-header h1{font-size:28px!important;font-weight:700!important;margin-bottom:16px!important;color:var(--gray-900)!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important}
.step-progress{display:flex!important;justify-content:center!important;gap:24px!important;margin:0 auto!important;max-width:600px!important;background:var(--gray-50)!important;padding:12px 20px!important;border-radius:var(--border-radius)!important}
.step{padding:12px 24px!important;border-radius:var(--border-radius)!important;font-weight:600!important;transition:all 0.3s ease!important;background:var(--gray-100)!important;color:var(--gray-500)!important;border:2px solid transparent!important}
.step.active{background:var(--primary-color)!important;color:white!important;box-shadow:var(--shadow)!important}
.step.completed{background:var(--success-color)!important;color:white!important}
.card{background:white!important;border-radius:var(--border-radius)!important;box-shadow:var(--shadow)!important;padding:32px!important;margin-bottom:24px!important;border:1px solid var(--gray-200)!important}
.step-content{display:none!important;opacity:0!important;transition:opacity 0.3s ease!important}
.step-content.active{display:block!important;opacity:1!important;animation:fadeIn 0.3s ease!important}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.config-form h2{font-size:24px!important;margin-bottom:24px!important;color:var(--gray-800)!important}
.form-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:24px!important;margin-bottom:24px!important}
.form-group{display:flex!important;flex-direction:column!important;gap:8px!important}
.form-group label{font-weight:600!important;color:var(--gray-700)!important;font-size:14px!important}
.form-group input{padding:12px 16px!important;border:2px solid var(--gray-200)!important;border-radius:var(--border-radius)!important;font-size:16px!important;transition:border-color 0.2s ease!important;background:white!important}
.form-group input:focus{outline:none!important;border-color:var(--primary-color)!important;box-shadow:0 0 0 3px rgb(59 130 246 / 0.1)!important}
.help-text{font-size:12px!important;color:var(--gray-500)!important}
.btn-primary,.btn-secondary{padding:12px 24px!important;border:none!important;border-radius:var(--border-radius)!important;font-weight:600!important;font-size:16px!important;cursor:pointer!important;transition:all 0.2s ease!important;display:inline-flex!important;align-items:center!important;gap:8px!important;text-decoration:none!important}
.btn-primary{background:var(--primary-color)!important;color:white!important}
.btn-primary:hover:not(:disabled){background:var(--primary-dark)!important;transform:translateY(-1px)!important;box-shadow:var(--shadow-lg)!important}
.btn-primary:disabled{background:var(--gray-300)!important;cursor:not-allowed!important;transform:none!important;box-shadow:none!important}
.btn-secondary{background:var(--gray-100)!important;color:var(--gray-700)!important;border:2px solid var(--gray-200)!important}
.btn-secondary:hover{background:var(--gray-200)!important;border-color:var(--gray-300)!important}
.form-actions{text-align:center!important;margin-top:32px!important}
.progress-section{margin:24px 0!important}
.progress-info{display:flex!important;justify-content:space-between!important;margin-bottom:8px!important;font-weight:600!important;color:var(--gray-700)!important}
.progress-bar{height:12px!important;background:var(--gray-200)!important;border-radius:6px!important;overflow:hidden!important}
.progress-fill{height:100%!important;background:var(--primary-color)!important;transition:width 0.3s ease!important;border-radius:6px!important}
.progress-message{margin-top:12px!important;text-align:center!important;color:var(--gray-600)!important;font-style:italic!important}
.stats-section{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:24px!important;margin-bottom:32px!important}
.stat{text-align:center!important;padding:20px!important;background:var(--gray-50)!important;border-radius:var(--border-radius)!important}
.stat-value{font-size:32px!important;font-weight:700!important;color:var(--primary-color)!important;display:block!important}
.stat-label{font-size:14px!important;color:var(--gray-600)!important;font-weight:500!important}
.global-controls{margin-bottom:24px!important;padding:20px!important;background:var(--gray-50)!important;border-radius:var(--border-radius)!important}
.control-group{display:flex!important;gap:16px!important;margin-bottom:16px!important}
.validation-panel{margin-top:16px!important}
.validation-error{background:#fef2f2!important;border:1px solid #fecaca!important;color:#dc2626!important;padding:12px 16px!important;border-radius:var(--border-radius)!important;margin-bottom:8px!important;display:flex!important;align-items:center!important;gap:8px!important;font-size:14px!important}
.domains-list{max-height:600px!important;overflow-y:auto!important;border:1px solid var(--gray-200)!important;border-radius:var(--border-radius)!important}
.domain-item{border-bottom:1px solid var(--gray-200)!important;transition:background-color 0.2s ease!important}
.domain-item:hover{background:var(--gray-50)!important}
.domain-item:last-child{border-bottom:none!important}
.domain-header{padding:24px 32px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;cursor:pointer!important}
.domain-info{display:flex!important;align-items:center!important;gap:16px!important;flex:1!important}
.domain-checkbox{width:20px!important;height:20px!important;cursor:pointer!important;accent-color:var(--primary-color)!important}
.domain-icon{width:40px!important;height:40px!important;background:var(--primary-color)!important;border-radius:var(--border-radius)!important;display:flex!important;align-items:center!important;justify-content:center!important;color:white!important;font-size:18px!important}
.domain-details{display:flex!important;flex-direction:column!important;gap:4px!important}
.domain-name{font-weight:700!important;font-size:18px!important;color:var(--gray-900)!important}
.domain-count{color:var(--gray-600)!important;font-size:14px!important}
.domain-actions{display:flex!important;align-items:center!important;gap:16px!important}
.folder-config{display:flex!important;flex-direction:column!important;gap:8px!important;min-width:200px!important}
.folder-select,.folder-input{padding:8px 12px!important;border:2px solid var(--gray-200)!important;border-radius:var(--border-radius)!important;font-size:14px!important;transition:border-color 0.2s ease!important}
.folder-select:focus,.folder-input:focus{outline:none!important;border-color:var(--primary-color)!important}
.action-badge{padding:4px 12px!important;border-radius:20px!important;font-size:12px!important;font-weight:600!important;text-transform:uppercase!important}
.action-new{background:#d1fae5!important;color:#065f46!important}
.action-existing{background:#dbeafe!important;color:#1e40af!important}
.final-actions{margin-top:32px!important;border-top:1px solid var(--gray-200)!important;padding-top:32px!important}
.summary-box{background:var(--gray-50)!important;border:1px solid var(--gray-200)!important;border-radius:var(--border-radius)!important;padding:24px!important;margin-bottom:24px!important}
.summary-box h3{margin-bottom:16px!important;color:var(--gray-800)!important}
.summary-content{display:flex!important;gap:32px!important}
.summary-item{font-size:16px!important;color:var(--gray-700)!important}
.summary-item strong{color:var(--primary-color)!important;font-weight:700!important}
.action-buttons{display:flex!important;justify-content:space-between!important;align-items:center!important}
.current-operation{display:flex!important;align-items:center!important;gap:16px!important;padding:24px!important;background:var(--gray-50)!important;border-radius:var(--border-radius)!important;margin-bottom:24px!important}
.operation-icon{width:48px!important;height:48px!important;background:var(--primary-color)!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;color:white!important;font-size:20px!important}
.operation-details{flex:1!important}
.operation-title{font-weight:700!important;font-size:18px!important;color:var(--gray-900)!important}
.operation-subtitle{color:var(--gray-600)!important;font-size:14px!important}
.operation-status{padding:8px 16px!important;background:var(--primary-color)!important;color:white!important;border-radius:20px!important;font-size:14px!important;font-weight:600!important}
.execution-log{margin-top:32px!important}
.execution-log h3{margin-bottom:16px!important;color:var(--gray-800)!important}
.log-container{max-height:300px!important;overflow-y:auto!important;background:var(--gray-900)!important;color:white!important;border-radius:var(--border-radius)!important;padding:16px!important;font-family:'Courier New',monospace!important;font-size:13px!important;line-height:1.4!important}
.log-entry{margin-bottom:4px!important;display:flex!important;align-items:center!important;gap:8px!important}
.log-entry.success{color:#4ade80!important}
.log-entry.error{color:#f87171!important}
.log-entry.warning{color:#fbbf24!important}
.log-entry.info{color:#60a5fa!important}
.success-header{text-align:center!important;margin-bottom:32px!important}
.success-icon{width:80px!important;height:80px!important;background:var(--success-color)!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;color:white!important;font-size:36px!important;margin:0 auto 16px auto!important}
.success-header h2{font-size:28px!important;color:var(--gray-900)!important;margin-bottom:8px!important}
.results-summary{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:24px!important;margin-bottom:32px!important}
.result-stat{text-align:center!important;padding:24px!important;background:var(--gray-50)!important;border-radius:var(--border-radius)!important}
.result-value{font-size:32px!important;font-weight:700!important;color:var(--success-color)!important}
.result-label{font-size:14px!important;color:var(--gray-600)!important;margin-top:4px!important}
.results-actions{display:flex!important;justify-content:center!important;gap:16px!important}
@media (max-width:768px){
.domain-organizer-app{padding:16px!important}
.form-row{grid-template-columns:1fr!important}
.stats-section{grid-template-columns:repeat(2,1fr)!important}
.control-group{flex-direction:column!important;gap:8px!important}
.domain-header{flex-direction:column!important;align-items:flex-start!important;gap:16px!important}
.domain-actions{width:100%!important;justify-content:space-between!important}
.summary-content{flex-direction:column!important;gap:16px!important}
.action-buttons{flex-direction:column!important;gap:16px!important}
.results-summary{grid-template-columns:1fr!important}
.step-progress{flex-direction:column!important;gap:8px!important}
}
</style>`;
    }

    async initializePage() {
        console.log('[DomainOrganizer] Initializing v6.2...');
        if (!window.authService?.isAuthenticated()) {
            this.showError('Veuillez vous connecter');
            return false;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        this.setupEventListeners();
        this.setDefaultDates();
        this.showStep('configure');
        return true;
    }

    setupEventListeners() {
        const form = document.getElementById('organizeForm');
        if (form) form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        if (startDateInput) startDateInput.valueAsDate = thirtyDaysAgo;
        if (endDateInput) endDateInput.valueAsDate = today;
    }

    showStep(stepName) {
        console.log(`[DomainOrganizer] Step: ${stepName}`);
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
            if (step.dataset.step === stepName) step.classList.add('active');
            else if (this.isStepCompleted(step.dataset.step, stepName)) step.classList.add('completed');
        });
        document.querySelectorAll('.step-content').forEach(content => content.classList.remove('active'));
        const activeStep = document.getElementById(`${stepName}Step`);
        if (activeStep) activeStep.classList.add('active');
        this.currentStep = stepName;
    }

    isStepCompleted(stepName, currentStep) {
        const steps = ['configure', 'analyze', 'review', 'execute'];
        return steps.indexOf(stepName) < steps.indexOf(currentStep);
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        if (this.isProcessing) return;
        const formData = this.getFormData();
        if (!formData.startDate && !formData.endDate) {
            this.showError('Veuillez sélectionner au moins une date');
            return;
        }
        await this.startAnalysis(formData);
    }

    getFormData() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const excludeDomains = document.getElementById('excludeDomains').value.split(',').map(d => d.trim()).filter(d => d);
        const excludeEmails = document.getElementById('excludeEmails').value.split(',').map(e => e.trim()).filter(e => e);
        return { startDate, endDate, excludeDomains, excludeEmails };
    }

    async startAnalysis(formData) {
        try {
            this.isProcessing = true;
            this.showStep('analyze');
            this.configure({
                excludeDomains: formData.excludeDomains,
                excludeEmails: formData.excludeEmails,
                onProgress: (progress) => this.updateAnalysisProgress(progress)
            });
            const results = await this.analyzeEmails({
                startDate: formData.startDate,
                endDate: formData.endDate,
                folders: ['inbox']
            });
            this.currentAnalysis = results;
            this.showValidationInterface(results);
        } catch (error) {
            console.error('[DomainOrganizer] Analysis error:', error);
            this.showError(`Erreur: ${error.message}`);
            this.showStep('configure');
        } finally {
            this.isProcessing = false;
        }
    }

    updateAnalysisProgress(progress) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const progressLabel = document.getElementById('progressLabel');
        const progressMessage = document.getElementById('progressMessage');
        if (progressFill) progressFill.style.width = `${progress.percent}%`;
        if (progressPercent) progressPercent.textContent = `${progress.percent}%`;
        if (progressLabel) progressLabel.textContent = progress.stage || 'Analyse';
        if (progressMessage) progressMessage.textContent = progress.message || 'Analyse en cours...';
    }

    showValidationInterface(results) {
        document.getElementById('statEmails').textContent = results.totalEmails.toLocaleString();
        document.getElementById('statDomains').textContent = results.totalDomains;
        document.getElementById('statFolders').textContent = results.totalDomains;
        document.getElementById('statNew').textContent = results.domainsToCreate;
        this.generateSimpleDomainsView(results.domains);
        this.prepareActions();
        this.validateConfiguration();
        this.updateSummary();
        this.showStep('review');
    }

    generateSimpleDomainsView(domains) {
        const container = document.getElementById('domainsList');
        if (!container) return;
        container.innerHTML = '';
        const sortedDomains = [...domains].sort((a, b) => b.count - a.count);
        sortedDomains.forEach((domain, index) => {
            const domainElement = this.createSimpleDomainElement(domain, index);
            container.appendChild(domainElement);
        });
    }

    createSimpleDomainElement(domainData, index) {
        const isNewFolder = domainData.action === 'create-new';
        const existingFolders = Array.from(this.existingFolders.values());
        const domainElement = document.createElement('div');
        domainElement.className = 'domain-item';
        domainElement.dataset.domain = domainData.domain;
        domainElement.innerHTML = `<div class="domain-header">
<div class="domain-info">
<input type="checkbox" class="domain-checkbox" data-domain="${domainData.domain}" onchange="window.organizerInstance.handleDomainToggle(event)" checked>
<div class="domain-icon"><i class="fas fa-at"></i></div>
<div class="domain-details">
<div class="domain-name">${domainData.domain}</div>
<div class="domain-count">${domainData.count} emails</div>
</div></div>
<div class="domain-actions">
<div class="folder-config">
${isNewFolder ? 
`<input type="text" class="folder-input" value="${domainData.suggestedFolder}" data-domain="${domainData.domain}" onchange="window.organizerInstance.handleFolderChange(event)" placeholder="Nom du dossier">` :
this.createFolderSelect(domainData, existingFolders)}
<select class="folder-select" data-domain="${domainData.domain}" onchange="window.organizerInstance.handleActionTypeChange(event)">
<option value="create-new" ${isNewFolder ? 'selected' : ''}>Créer nouveau dossier</option>
<option value="move-existing" ${!isNewFolder ? 'selected' : ''}>Utiliser dossier existant</option>
</select></div>
<span class="action-badge ${isNewFolder ? 'action-new' : 'action-existing'}">
${isNewFolder ? 'Nouveau' : 'Existant'}
</span></div></div>`;
        return domainElement;
    }

    handleDomainToggle(event) {
        const domain = event.target.dataset.domain;
        const isChecked = event.target.checked;
        if (this.selectedActions.has(domain)) {
            this.selectedActions.get(domain).selected = isChecked;
        }
        this.updateSummary();
        this.validateConfiguration();
    }

    handleActionTypeChange(event) {
        const domain = event.target.dataset.domain;
        const actionType = event.target.value;
        if (!this.selectedActions.has(domain)) return;
        const action = this.selectedActions.get(domain);
        action.action = actionType;
        this.updateDomainInterface(domain, actionType);
        this.updateSummary();
        this.validateConfiguration();
    }

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
        this.updateSummary();
        this.validateConfiguration();
    }

    selectAllDomains() {
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            this.handleDomainToggle({ target: checkbox });
        });
    }

    deselectAllDomains() {
        document.querySelectorAll('.domain-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            this.handleDomainToggle({ target: checkbox });
        });
    }

    validateConfiguration() {
        this.validationErrors.clear();
        const validationPanel = document.getElementById('validationPanel');
        if (!validationPanel) return;
        this.selectedActions.forEach((action, domain) => {
            if (!action.selected) return;
            if (action.action === 'create-new') {
                if (!action.targetFolder || action.targetFolder.trim() === '') {
                    this.validationErrors.set(domain, 'Le nom du dossier ne peut pas être vide');
                } else if (action.targetFolder.length > 255) {
                    this.validationErrors.set(domain, 'Le nom du dossier est trop long (max 255 caractères)');
                } else if (/[<>:"/\\|?*]/.test(action.targetFolder)) {
                    this.validationErrors.set(domain, 'Le nom du dossier contient des caractères invalides');
                }
            }
        });
        this.displayValidationErrors(validationPanel);
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = this.validationErrors.size > 0 || this.getSelectedDomainsCount() === 0;
        }
    }

    displayValidationErrors(container) {
        container.innerHTML = '';
        if (this.validationErrors.size === 0) return;
        this.validationErrors.forEach((error, domain) => {
            const errorElement = document.createElement('div');
            errorElement.className = 'validation-error';
            errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i><strong>${domain}:</strong> ${error}`;
            container.appendChild(errorElement);
        });
    }

    updateSummary() {
        const selectedActions = Array.from(this.selectedActions.values()).filter(action => action.selected);
        let totalEmails = 0;
        let newFolders = 0;
        selectedActions.forEach(action => {
            totalEmails += action.emailCount;
            if (action.action === 'create-new') newFolders++;
        });
        const summaryEmails = document.getElementById('summaryEmails');
        const summaryFolders = document.getElementById('summaryFolders');
        const summaryDomains = document.getElementById('summaryDomains');
        if (summaryEmails) summaryEmails.textContent = totalEmails.toLocaleString();
        if (summaryFolders) summaryFolders.textContent = newFolders;
        if (summaryDomains) summaryDomains.textContent = selectedActions.length;
    }

    getSelectedDomainsCount() {
        return Array.from(this.selectedActions.values()).filter(action => action.selected).length;
    }

    async executeOrganization() {
        if (this.isProcessing) return;
        try {
            this.isProcessing = true;
            this.showStep('execute');
            const actionsToApply = new Map();
            this.selectedActions.forEach((action, domain) => {
                if (action.selected) actionsToApply.set(domain, action);
            });
            if (actionsToApply.size === 0) {
                this.showError('Aucune action sélectionnée');
                this.showStep('review');
                return;
            }
            const results = await this.executeWithSimpleProgress(actionsToApply);
            this.showFinalResults(results);
        } catch (error) {
            console.error('[DomainOrganizer] Execute error:', error);
            this.showError(`Erreur: ${error.message}`);
            this.showStep('review');
        } finally {
            this.isProcessing = false;
        }
    }

    async executeWithSimpleProgress(domainActions) {
        const results = { success: 0, failed: 0, foldersCreated: 0, emailsMoved: 0, errors: [] };
        const totalDomains = domainActions.size;
        let processedDomains = 0;
        this.initializeExecutionLog();
        for (const [domain, action] of domainActions) {
            try {
                this.updateExecutionProgress(domain, action, processedDomains, totalDomains);
                this.addLogEntry(`🔄 Traitement de ${domain}...`, 'info');
                const result = await this.processDomainSimple(domain, action);
                if (result.success) {
                    results.success++;
                    results.emailsMoved += result.emailsMoved;
                    if (result.folderCreated) {
                        results.foldersCreated++;
                        this.addLogEntry(`✅ Dossier "${action.targetFolder}" créé`, 'success');
                    }
                    this.addLogEntry(`✅ ${result.emailsMoved} emails déplacés vers "${action.targetFolder}"`, 'success');
                } else {
                    results.failed++;
                    results.errors.push({ domain, error: result.error });
                    this.addLogEntry(`❌ Erreur pour ${domain}: ${result.error}`, 'error');
                }
            } catch (error) {
                results.failed++;
                results.errors.push({ domain, error: error.message });
                this.addLogEntry(`❌ Erreur critique pour ${domain}: ${error.message}`, 'error');
            }
            processedDomains++;
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        this.addLogEntry('🎉 Organisation terminée !', 'success');
        return results;
    }

    async processDomainSimple(domain, action) {
        const allEmails = this.emailsByDomain.get(domain) || [];
        const result = { success: false, emailsMoved: 0, folderCreated: false, error: null };
        if (allEmails.length === 0) {
            result.success = true;
            return result;
        }
        try {
            let targetFolderId;
            if (action.action === 'create-new') {
                const newFolder = await this.createFolder(action.targetFolder);
                targetFolderId = newFolder.id;
                result.folderCreated = true;
            } else if (action.existingFolderId) {
                targetFolderId = action.existingFolderId;
            } else {
                throw new Error('Aucun dossier de destination spécifié');
            }
            const batches = this.createBatches(allEmails, 20);
            for (const batch of batches) {
                await this.moveEmailBatch(batch, targetFolderId);
                result.emailsMoved += batch.length;
            }
            result.success = true;
        } catch (error) {
            result.error = error.message;
            console.error(`[DomainOrganizer] Error processing domain ${domain}:`, error);
        }
        return result;
    }

    updateExecutionProgress(currentDomain, currentAction, processed, total) {
        const operationTitle = document.getElementById('operationTitle');
        const operationSubtitle = document.getElementById('operationSubtitle');
        const operationStatus = document.getElementById('operationStatus');
        if (operationTitle) operationTitle.textContent = `Domaine: ${currentDomain}`;
        if (operationSubtitle) {
            const actionText = currentAction.action === 'create-new' 
                ? `Création du dossier "${currentAction.targetFolder}"`
                : `Déplacement vers "${currentAction.targetFolder}"`;
            operationSubtitle.textContent = actionText;
        }
        if (operationStatus) operationStatus.textContent = `${processed + 1}/${total}`;
        const percent = Math.round(((processed + 1) / total) * 100);
        const progressFill = document.getElementById('executionProgressFill');
        const progressPercent = document.getElementById('executionPercent');
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressPercent) progressPercent.textContent = `${percent}%`;
    }

    initializeExecutionLog() {
        const logContainer = document.getElementById('executionLog');
        if (logContainer) logContainer.innerHTML = '';
    }

    addLogEntry(message, type = 'info') {
        const logContainer = document.getElementById('executionLog');
        if (!logContainer) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const timestamp = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        entry.innerHTML = `<span style="opacity: 0.7;">[${timestamp}]</span><span>${message}</span>`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    showFinalResults(results) {
        document.getElementById('finalEmailsMoved').textContent = results.emailsMoved.toLocaleString();
        document.getElementById('finalFoldersCreated').textContent = results.foldersCreated;
        document.getElementById('finalErrors').textContent = results.failed;
        const errorsElement = document.getElementById('finalErrors');
        if (errorsElement && results.failed > 0) {
            errorsElement.style.color = 'var(--danger-color)';
        }
        this.showStep('results');
    }

    showError(message) {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    createFolderSelect(domainData, existingFolders) {
        const options = existingFolders.map(folder => 
            `<option value="${folder.id}" ${folder.displayName === domainData.suggestedFolder ? 'selected' : ''}>
                ${folder.displayName}
            </option>`
        ).join('');
        return `<select class="folder-select" data-domain="${domainData.domain}" onchange="window.organizerInstance.handleFolderChange(event)">${options}</select>`;
    }

    updateDomainInterface(domain, actionType) {
        const domainElement = document.querySelector(`[data-domain="${domain}"]`);
        if (!domainElement) return;
        const badge = domainElement.querySelector('.action-badge');
        if (badge) {
            const isNew = actionType === 'create-new';
            badge.className = `action-badge ${isNew ? 'action-new' : 'action-existing'}`;
            badge.textContent = isNew ? 'Nouveau' : 'Existant';
        }
    }

    goBack() { this.showStep('configure'); }

    resetForm() {
        this.showStep('configure');
        document.getElementById('organizeForm')?.reset();
        this.setDefaultDates();
        this.currentAnalysis = null;
        this.selectedActions.clear();
        this.emailSelections.clear();
        this.validationErrors.clear();
        this.folderCreationQueue.clear();
        this.isProcessing = false;
        console.log('[DomainOrganizer] Reset v6.2');
    }

    configure(options = {}) {
        const { excludeDomains = [], excludeEmails = [], onProgress = null, createFolders = true, maxEmailsPerBatch = 20 } = options;
        this.excludedDomains = new Set(excludeDomains.map(d => d.toLowerCase()));
        this.excludedEmails = new Set(excludeEmails.map(e => e.toLowerCase()));
        this.progressCallback = onProgress;
        this.createFolders = createFolders;
        this.maxEmailsPerBatch = maxEmailsPerBatch;
    }

    async analyzeEmails(filters = {}) {
        console.log('[DomainOrganizer] Starting analysis v6.2...');
        try {
            this.isProcessing = true;
            this.resetAnalysis();
            this.updateProgress({ percent: 10, message: 'Chargement des dossiers existants...', stage: 'Chargement des dossiers' });
            await this.loadExistingFolders();
            this.updateProgress({ percent: 30, message: 'Récupération des emails...', stage: 'Récupération des emails' });
            const emails = await this.fetchEmails(filters);
            this.updateProgress({ percent: 60, message: 'Analyse des domaines...', stage: 'Analyse des domaines' });
            await this.analyzeDomains(emails);
            this.updateProgress({ percent: 90, message: 'Génération de la structure...', stage: 'Structure proposée' });
            const results = this.finalizeAnalysis();
            this.updateProgress({ percent: 100, message: 'Analyse terminée', stage: 'Terminé' });
            return results;
        } catch (error) {
            console.error('[DomainOrganizer] Analysis failed:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    updateProgress(progress) { if (this.progressCallback) this.progressCallback(progress); }

    async loadExistingFolders() {
        try {
            const folders = await window.mailService.getFolders();
            this.existingFolders.clear();
            folders.forEach(folder => {
                this.existingFolders.set(folder.displayName.toLowerCase(), {
                    id: folder.id, displayName: folder.displayName, totalItemCount: folder.totalItemCount || 0
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
                const options = { top: 1000, orderBy: 'receivedDateTime desc' };
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
            if (!this.emailsByDomain.has(domain)) this.emailsByDomain.set(domain, []);
            this.emailsByDomain.get(domain).push(email);
            if (!this.domainAnalysis.has(domain)) {
                this.domainAnalysis.set(domain, {
                    domain: domain, count: 0, samples: [], existingFolder: null, suggestedFolder: null, action: 'none'
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
        if (this.existingFolders.has(domain)) return this.existingFolders.get(domain);
        const domainParts = domain.split('.');
        if (domainParts.length > 1) {
            const mainDomain = domainParts[0];
            if (this.existingFolders.has(mainDomain)) return this.existingFolders.get(mainDomain);
        }
        return null;
    }

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
        this.emailSelections.clear();
        this.validationErrors.clear();
        this.folderCreationQueue.clear();
    }

    finalizeAnalysis() {
        const results = {
            totalEmails: 0, totalDomains: this.domainAnalysis.size, totalFolders: this.domainAnalysis.size,
            domainsToCreate: 0, domainsWithExisting: 0, domains: []
        };
        this.domainAnalysis.forEach((analysis, domain) => {
            results.totalEmails += analysis.count;
            if (analysis.action === 'create-new') results.domainsToCreate++;
            else if (analysis.action === 'move-existing') results.domainsWithExisting++;
            results.domains.push({
                domain: domain, count: analysis.count, samples: analysis.samples, action: analysis.action,
                existingFolder: analysis.existingFolder, suggestedFolder: analysis.suggestedFolder
            });
        });
        results.domains.sort((a, b) => b.count - a.count);
        return results;
    }

    prepareActions() {
        this.selectedActions.clear();
        this.domainAnalysis.forEach((analysis, domain) => {
            if (analysis.count > 0) {
                this.selectedActions.set(domain, {
                    domain: domain, action: analysis.action, targetFolder: analysis.suggestedFolder,
                    existingFolderId: analysis.existingFolder?.id, emailCount: analysis.count, selected: true
                });
            }
        });
    }

    async createFolder(folderName) {
        const accessToken = await window.authService.getAccessToken();
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: folderName })
            });
            if (response.ok) return await response.json();
            if (response.status === 409) {
                const folders = await window.mailService.getFolders();
                const existingFolder = folders.find(f => f.displayName.toLowerCase() === folderName.toLowerCase());
                if (existingFolder) return existingFolder;
            }
            throw new Error(`Échec de création: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.error(`[DomainOrganizer] Error creating folder "${folderName}":`, error);
            throw error;
        }
    }

    async moveEmailBatch(emails, targetFolderId) {
        const accessToken = await window.authService.getAccessToken();
        const batchRequests = emails.map((email, index) => ({
            id: index.toString(), method: 'POST', url: `/me/messages/${email.id}/move`,
            body: { destinationId: targetFolderId }, headers: { 'Content-Type': 'application/json' }
        }));
        const response = await fetch('https://graph.microsoft.com/v1.0/$batch', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests: batchRequests })
        });
        if (!response.ok) throw new Error(`Échec du déplacement par lot: ${response.statusText}`);
        return await response.json();
    }
}

// Initialisation
window.organizerInstance = new DomainOrganizer();
console.log('[DomainOrganizer] ✅ v6.2 Compacte - Chargé');

function showDomainOrganizerApp() {
    console.log('[DomainOrganizer] 🚀 Lancement v6.2...');
    if (!window.authService?.isAuthenticated()) {
        if (window.uiManager?.showToast) window.uiManager.showToast('Veuillez vous connecter', 'warning');
        else alert('Veuillez vous connecter');
        return;
    }
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) {
        console.error('[DomainOrganizer] pageContent non trouvé');
        return;
    }
    window.domainOrganizerActive = true;
    pageContent.innerHTML = window.organizerInstance.getPageHTML();
    pageContent.style.cssText = 'display:block!important;visibility:visible!important;opacity:1!important';
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const rangerButton = document.querySelector('[data-page="ranger"]');
    if (rangerButton) {
        rangerButton.classList.add('active');
        if (rangerButton.parentElement) rangerButton.parentElement.classList.add('active');
    }
    setTimeout(async () => {
        if (window.domainOrganizerActive && document.getElementById('configStep')) {
            await window.organizerInstance.initializePage();
            console.log('[DomainOrganizer] ✅ Initialisé v6.2');
        }
    }, 100);
    console.log('[DomainOrganizer] ✅ Interface prête v6.2');
}

// Système d'interception multiple
document.addEventListener('click', function(e) {
    const rangerButton = e.target.closest('[data-page="ranger"]') || e.target.closest('button[onclick*="ranger"]') || e.target.closest('a[href*="ranger"]');
    if (rangerButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('[DomainOrganizer] 🎯 Clic Ranger détecté v6.2');
        setTimeout(showDomainOrganizerApp, 50);
        return false;
    }
}, true);

window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('Page ranger not found')) {
        console.log('[DomainOrganizer] 🔧 Erreur interceptée v6.2');
        e.preventDefault();
        setTimeout(showDomainOrganizerApp, 100);
    }
}, true);

window.addEventListener('unhandledrejection', function(e) {
    if (e.reason?.message?.includes('Page ranger not found')) {
        console.log('[DomainOrganizer] 🔧 Promise rejection interceptée v6.2');
        e.preventDefault();
        setTimeout(showDomainOrganizerApp, 100);
    }
});

if (window.pageManager && typeof window.pageManager.loadPage === 'function') {
    const originalLoadPage = window.pageManager.loadPage;
    window.pageManager.loadPage = function(pageName) {
        console.log(`[DomainOrganizer] 🔍 loadPage: ${pageName}`);
        if (pageName === 'ranger') {
            console.log('[DomainOrganizer] 🎯 Interception PageManager v6.2');
            showDomainOrganizerApp();
            return;
        }
        try {
            return originalLoadPage.call(this, pageName);
        } catch (error) {
            if (error.message?.includes('Page ranger not found')) {
                console.log('[DomainOrganizer] 🔧 Erreur PageManager interceptée v6.2');
                showDomainOrganizerApp();
                return;
            }
            throw error;
        }
    };
    console.log('[DomainOrganizer] ✅ Hook PageManager installé v6.2');
}

// Fonctions globales
window.showDomainOrganizer = showDomainOrganizerApp;
window.domainOrganizer = { showPage: showDomainOrganizerApp, instance: window.organizerInstance };
window.testDomainOrganizer = showDomainOrganizerApp;
window.addEventListener('beforeunload', () => { window.domainOrganizerActive = false; });

console.log('[DomainOrganizer] ✅ v6.2 Système complet configuré');
