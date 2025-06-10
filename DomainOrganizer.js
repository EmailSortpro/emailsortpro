// DomainOrganizer.js - Module de rangement complet avec création de dossiers

class ModernDomainOrganizer {
    constructor() {
        this.isAnalyzing = false;
        this.isOrganizing = false;
        this.currentStats = {
            totalEmails: 0,
            domainsFound: 0,
            foldersCreated: 0,
            emailsMoved: 0
        };
        
        this.domainAnalysis = new Map();
        this.processedEmailIds = new Set();
        this.createdFolders = new Map(); // Cache des dossiers créés
        
        console.log('[ModernDomainOrganizer] ✅ Initialisé v2.0');
    }

    async show() {
        console.log('[ModernDomainOrganizer] 📁 Affichage du module de rangement...');
        
        try {
            if (!window.authService?.isAuthenticated()) {
                throw new Error('Utilisateur non authentifié');
            }
            
            await this.renderPage();
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur:', error);
            this.showError('Erreur de chargement: ' + error.message);
        }
    }

    async renderPage() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        pageContent.innerHTML = this.getPageHTML();
        this.attachEventListeners();
        await this.loadInitialStats();
        
        console.log('[ModernDomainOrganizer] ✅ Page affichée');
    }

    getPageHTML() {
        return `
            <div class="domain-organizer-container" style="max-width: 1100px; margin: 0 auto; padding: 20px;">
                
                <!-- En-tête avec icône -->
                <div class="page-header" style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px 28px; border-radius: 16px; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3); margin-bottom: 16px;">
                        <i class="fas fa-folder-tree" style="font-size: 28px;"></i>
                        <div>
                            <div style="font-size: 22px; font-weight: 700;">Rangement Intelligent</div>
                            <div style="font-size: 14px; opacity: 0.9;">Organisation par domaine d'expéditeur</div>
                        </div>
                    </div>
                </div>

                <!-- Statistiques en temps réel -->
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;">
                    <div class="stat-card" style="background: white; padding: 24px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                        <div id="totalEmailsCount" style="font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 6px;">0</div>
                        <div style="font-size: 13px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Emails analysés</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 24px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                        <div id="domainsFoundCount" style="font-size: 28px; font-weight: 700; color: #10b981; margin-bottom: 6px;">0</div>
                        <div style="font-size: 13px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Domaines trouvés</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 24px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                        <div id="foldersCreatedCount" style="font-size: 28px; font-weight: 700; color: #f59e0b; margin-bottom: 6px;">0</div>
                        <div style="font-size: 13px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Dossiers créés</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 24px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                        <div id="emailsMovedCount" style="font-size: 28px; font-weight: 700; color: #8b5cf6; margin-bottom: 6px;">0</div>
                        <div style="font-size: 13px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Emails rangés</div>
                    </div>
                </div>

                <!-- Zone d'action principale -->
                <div class="action-section" style="background: white; padding: 32px; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e5e7eb; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
                    
                    <!-- Boutons d'action -->
                    <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
                        <button id="analyzeBtn" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 28px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3); transition: all 0.2s ease; min-width: 180px; justify-content: center;">
                            <i class="fas fa-search"></i>
                            <span>Analyser</span>
                        </button>
                        
                        <button id="organizeBtn" disabled style="background: #d1d5db; color: #9ca3af; padding: 14px 28px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: not-allowed; display: flex; align-items: center; gap: 10px; min-width: 180px; justify-content: center;">
                            <i class="fas fa-folder-plus"></i>
                            <span>Organiser</span>
                        </button>
                    </div>

                    <!-- Barre de progression -->
                    <div id="progressSection" style="display: none;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span id="progressLabel" style="font-size: 15px; font-weight: 600; color: #374151;">Analyse en cours...</span>
                            <span id="progressPercentage" style="font-size: 15px; font-weight: 600; color: #374151;">0%</span>
                        </div>
                        <div style="background: #e5e7eb; border-radius: 8px; height: 12px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                            <div id="progressBar" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 100%; width: 0%; transition: width 0.4s ease; border-radius: 8px; position: relative;">
                                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%); animation: shimmer 2s infinite;"></div>
                            </div>
                        </div>
                        <div id="progressStatus" style="font-size: 13px; color: #6b7280; margin-top: 12px; text-align: center; font-style: italic;">Initialisation...</div>
                    </div>
                </div>

                <!-- Résultats de l'analyse -->
                <div id="analysisResults" style="display: none;">
                    <div style="background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 24px; border-bottom: 1px solid #e5e7eb;">
                            <h3 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0; display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-chart-bar" style="color: #10b981;"></i>
                                Domaines détectés
                                <span id="domainCount" style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">0</span>
                            </h3>
                        </div>
                        <div id="domainsContainer" style="padding: 24px; max-height: 500px; overflow-y: auto;">
                            <!-- Les domaines seront affichés ici -->
                        </div>
                    </div>
                </div>

                <!-- Messages d'état -->
                <div id="statusMessages" style="margin-top: 20px;">
                    <!-- Messages dynamiques -->
                </div>
            </div>

            <style>
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
                    transition: all 0.2s ease;
                }
                
                #analyzeBtn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
                }
                
                #organizeBtn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
                }
                
                #organizeBtn:not(:disabled) {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                    color: white !important;
                    cursor: pointer !important;
                }
            </style>
        `;
    }

    attachEventListeners() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const organizeBtn = document.getElementById('organizeBtn');
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.startAnalysis());
        }
        
        if (organizeBtn) {
            organizeBtn.addEventListener('click', () => this.startOrganization());
        }
    }

    async loadInitialStats() {
        try {
            const folders = await window.mailService.getFolders();
            console.log('[ModernDomainOrganizer] 📂', folders.length, 'dossiers disponibles');
        } catch (error) {
            console.warn('[ModernDomainOrganizer] Erreur chargement initial:', error);
        }
    }

    async startAnalysis() {
        if (this.isAnalyzing) return;
        
        console.log('[ModernDomainOrganizer] 🔍 Début de l\'analyse...');
        
        this.isAnalyzing = true;
        this.resetData();
        this.showProgress();
        this.disableButton('analyzeBtn');
        
        try {
            await this.performAnalysis();
            this.showAnalysisResults();
            this.enableOrganizeButton();
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur analyse:', error);
            this.showStatusMessage('Erreur lors de l\'analyse: ' + error.message, 'error');
        } finally {
            this.hideProgress();
            this.enableButton('analyzeBtn');
            this.isAnalyzing = false;
        }
    }

    async performAnalysis() {
        // Étape 1: Récupération des emails
        this.updateProgress(10, 'Récupération des emails...');
        const emails = await this.getEmailsFromInbox();
        
        // Étape 2: Analyse des domaines
        this.updateProgress(40, 'Analyse des domaines...');
        this.analyzeEmailDomains(emails);
        
        // Étape 3: Tri et finalisation
        this.updateProgress(80, 'Tri des résultats...');
        this.sortDomainsByCount();
        
        this.updateProgress(100, 'Analyse terminée !');
        
        console.log('[ModernDomainOrganizer] ✅ Analyse terminée:', {
            emails: this.currentStats.totalEmails,
            domaines: this.currentStats.domainsFound
        });
    }

    async getEmailsFromInbox() {
        console.log('[ModernDomainOrganizer] 📧 Récupération des emails...');
        
        try {
            // Récupérer maximum 2000 emails pour éviter les timeouts
            const emails = await window.mailService.getEmailsFromFolder('inbox', 2000);
            
            // Filtrer les doublons
            const uniqueEmails = emails.filter(email => {
                if (this.processedEmailIds.has(email.id)) {
                    return false;
                }
                this.processedEmailIds.add(email.id);
                return true;
            });
            
            this.updateStats({ totalEmails: uniqueEmails.length });
            console.log('[ModernDomainOrganizer] ✅', uniqueEmails.length, 'emails uniques récupérés');
            
            return uniqueEmails;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur récupération:', error);
            throw new Error('Impossible de récupérer les emails: ' + error.message);
        }
    }

    analyzeEmailDomains(emails) {
        console.log('[ModernDomainOrganizer] 🔍 Analyse de', emails.length, 'emails...');
        
        let processedCount = 0;
        
        emails.forEach(email => {
            try {
                const senderEmail = email.from?.emailAddress?.address;
                if (senderEmail && senderEmail.includes('@')) {
                    const domain = senderEmail.split('@')[1].toLowerCase().trim();
                    
                    if (domain && domain.length > 0 && !domain.includes(' ')) {
                        this.addEmailToDomain(domain, email);
                    }
                }
                
                processedCount++;
                
                // Mise à jour des stats tous les 200 emails
                if (processedCount % 200 === 0) {
                    this.updateStats({
                        totalEmails: processedCount,
                        domainsFound: this.domainAnalysis.size
                    });
                }
                
            } catch (error) {
                console.warn('[ModernDomainOrganizer] Erreur traitement email:', email.id, error);
            }
        });
        
        // Mise à jour finale
        this.updateStats({
            totalEmails: emails.length,
            domainsFound: this.domainAnalysis.size
        });
        
        console.log('[ModernDomainOrganizer] ✅', this.domainAnalysis.size, 'domaines trouvés');
    }

    addEmailToDomain(domain, email) {
        if (!this.domainAnalysis.has(domain)) {
            this.domainAnalysis.set(domain, {
                domain: domain,
                emails: [],
                count: 0,
                folderCreated: false,
                folderId: null
            });
        }
        
        const domainData = this.domainAnalysis.get(domain);
        domainData.emails.push(email);
        domainData.count++;
    }

    sortDomainsByCount() {
        const sortedEntries = Array.from(this.domainAnalysis.entries())
            .sort(([, a], [, b]) => b.count - a.count);
        
        this.domainAnalysis = new Map(sortedEntries);
    }

    showAnalysisResults() {
        const resultsSection = document.getElementById('analysisResults');
        const domainsContainer = document.getElementById('domainsContainer');
        const domainCount = document.getElementById('domainCount');
        
        if (!resultsSection || !domainsContainer || !domainCount) return;
        
        domainCount.textContent = this.domainAnalysis.size;
        
        if (this.domainAnalysis.size === 0) {
            domainsContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                    <i class="fas fa-inbox" style="font-size: 64px; margin-bottom: 20px; color: #d1d5db;"></i>
                    <h3 style="font-size: 20px; margin-bottom: 12px; color: #374151;">Aucun domaine détecté</h3>
                    <p style="font-size: 16px; margin: 0; line-height: 1.5;">Vérifiez que votre boîte de réception contient des emails avec des expéditeurs valides.</p>
                </div>
            `;
        } else {
            domainsContainer.innerHTML = this.generateDomainsHTML();
        }
        
        resultsSection.style.display = 'block';
    }

    generateDomainsHTML() {
        return Array.from(this.domainAnalysis.values()).map(domainData => {
            const percentage = ((domainData.count / this.currentStats.totalEmails) * 100).toFixed(1);
            
            return `
                <div class="domain-item" style="display: flex; align-items: center; justify-content: space-between; padding: 20px; margin-bottom: 16px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border: 1px solid #e5e7eb;">
                    <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                            ${domainData.domain.charAt(0).toUpperCase()}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: #1f2937; font-size: 18px; margin-bottom: 4px;">${domainData.domain}</div>
                            <div style="color: #6b7280; font-size: 14px; display: flex; align-items: center; gap: 12px;">
                                <span><i class="fas fa-envelope" style="margin-right: 6px;"></i>${domainData.count} emails</span>
                                <span><i class="fas fa-chart-pie" style="margin-right: 6px;"></i>${percentage}%</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${domainData.folderCreated ? 
                            '<span style="background: #dcfce7; color: #059669; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;"><i class="fas fa-check"></i> Organisé</span>' :
                            '<span style="background: #fef3c7; color: #d97706; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;"><i class="fas fa-clock"></i> En attente</span>'
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    enableOrganizeButton() {
        const organizeBtn = document.getElementById('organizeBtn');
        if (organizeBtn && this.domainAnalysis.size > 0) {
            organizeBtn.disabled = false;
            organizeBtn.style.cursor = 'pointer';
        }
    }

    async startOrganization() {
        if (this.isOrganizing || this.domainAnalysis.size === 0) return;
        
        console.log('[ModernDomainOrganizer] 📁 Début de l\'organisation...');
        
        this.isOrganizing = true;
        this.showProgress();
        this.disableButton('organizeBtn');
        
        try {
            await this.performOrganization();
            this.showStatusMessage('✅ Organisation terminée avec succès !', 'success');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur organisation:', error);
            this.showStatusMessage('❌ Erreur lors de l\'organisation: ' + error.message, 'error');
        } finally {
            this.hideProgress();
            this.enableButton('organizeBtn');
            this.isOrganizing = false;
        }
    }

    async performOrganization() {
        const domains = Array.from(this.domainAnalysis.values());
        const totalDomains = domains.length;
        
        this.updateProgress(0, 'Création des dossiers...');
        
        for (let i = 0; i < domains.length; i++) {
            const domainData = domains[i];
            const progress = ((i + 1) / totalDomains) * 100;
            
            try {
                this.updateProgress(progress, `Organisation de ${domainData.domain}...`);
                
                // Créer le dossier pour ce domaine
                await this.createFolderForDomain(domainData);
                
                // Déplacer les emails
                await this.moveEmailsToFolder(domainData);
                
                this.updateStats({ 
                    foldersCreated: this.currentStats.foldersCreated + 1,
                    emailsMoved: this.currentStats.emailsMoved + domainData.count
                });
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur domaine', domainData.domain, ':', error);
            }
        }
        
        this.updateProgress(100, 'Organisation terminée !');
    }

    async createFolderForDomain(domainData) {
        try {
            const folderName = `📧 ${domainData.domain}`;
            
            // Vérifier si le dossier existe déjà
            if (this.createdFolders.has(domainData.domain)) {
                domainData.folderId = this.createdFolders.get(domainData.domain);
                domainData.folderCreated = true;
                return;
            }
            
            // Créer le dossier via l'API Microsoft Graph
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await window.authService.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    displayName: folderName
                })
            });
            
            if (response.ok) {
                const folder = await response.json();
                domainData.folderId = folder.id;
                domainData.folderCreated = true;
                this.createdFolders.set(domainData.domain, folder.id);
                
                console.log('[ModernDomainOrganizer] ✅ Dossier créé:', folderName);
            } else {
                throw new Error(`Erreur HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur création dossier:', error);
            throw new Error(`Impossible de créer le dossier pour ${domainData.domain}`);
        }
    }

    async moveEmailsToFolder(domainData) {
        if (!domainData.folderId || domainData.emails.length === 0) return;
        
        try {
            // Déplacer les emails par lots de 10 pour éviter les timeouts
            const batchSize = 10;
            const batches = [];
            
            for (let i = 0; i < domainData.emails.length; i += batchSize) {
                batches.push(domainData.emails.slice(i, i + batchSize));
            }
            
            for (const batch of batches) {
                await Promise.all(batch.map(email => this.moveEmailToFolder(email.id, domainData.folderId)));
            }
            
            console.log('[ModernDomainOrganizer] ✅', domainData.emails.length, 'emails déplacés pour', domainData.domain);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur déplacement emails:', error);
            throw new Error(`Erreur lors du déplacement des emails pour ${domainData.domain}`);
        }
    }

    async moveEmailToFolder(emailId, folderId) {
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${emailId}/move`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await window.authService.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    destinationId: folderId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.warn('[ModernDomainOrganizer] Erreur déplacement email:', emailId, error);
        }
    }

    // Méthodes utilitaires
    resetData() {
        this.domainAnalysis.clear();
        this.processedEmailIds.clear();
        this.currentStats = { totalEmails: 0, domainsFound: 0, foldersCreated: 0, emailsMoved: 0 };
        this.updateStats(this.currentStats);
        
        const resultsSection = document.getElementById('analysisResults');
        if (resultsSection) resultsSection.style.display = 'none';
    }

    updateStats(newStats) {
        Object.assign(this.currentStats, newStats);
        
        const elements = {
            totalEmailsCount: this.currentStats.totalEmails,
            domainsFoundCount: this.currentStats.domainsFound,
            foldersCreatedCount: this.currentStats.foldersCreated,
            emailsMovedCount: this.currentStats.emailsMoved
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value.toLocaleString();
        });
    }

    showProgress() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) progressSection.style.display = 'block';
    }

    hideProgress() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) progressSection.style.display = 'none';
    }

    updateProgress(percentage, status) {
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressStatus = document.getElementById('progressStatus');
        
        if (progressBar) progressBar.style.width = Math.min(100, Math.max(0, percentage)) + '%';
        if (progressPercentage) progressPercentage.textContent = Math.round(percentage) + '%';
        if (progressStatus) progressStatus.textContent = status;
    }

    disableButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
        }
    }

    enableButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    }

    showStatusMessage(message, type = 'info') {
        const statusMessages = document.getElementById('statusMessages');
        if (!statusMessages) return;
        
        const colors = {
            success: { bg: '#dcfce7', border: '#059669', text: '#065f46' },
            error: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' },
            info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
        };
        
        const style = colors[type] || colors.info;
        
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            background: ${style.bg};
            border: 1px solid ${style.border};
            color: ${style.text};
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 12px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        messageEl.textContent = message;
        
        statusMessages.appendChild(messageEl);
        
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }

    showError(message) {
        this.showStatusMessage(message, 'error');
        console.error('[ModernDomainOrganizer] Erreur:', message);
    }
}

// Initialisation automatique
console.log('[ModernDomainOrganizer] 🚀 Chargement du module...');

// Créer l'instance globale
window.modernDomainOrganizer = new ModernDomainOrganizer();

// Intercepter les clics sur le bouton "Ranger"
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item[data-page="ranger"]');
    if (navItem) {
        console.log('[ModernDomainOrganizer] 📁 Clic sur Ranger intercepté');
        e.preventDefault();
        e.stopPropagation();
        
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');
        
        // Afficher la page
        window.modernDomainOrganizer.show();
    }
});

console.log('[ModernDomainOrganizer] ✅ Module chargé et prêt');
