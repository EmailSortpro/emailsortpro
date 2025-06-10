// DomainOrganizer.js - Version corrigée sans boucle infinie

class ModernDomainOrganizer {
    constructor() {
        this.isLoading = false;
        this.currentStats = {
            totalEmails: 0,
            domainsFound: 0,
            foldersScanned: 0
        };
        this.emailCache = new Map(); // Cache pour éviter les doublons
        this.domainAnalysis = new Map(); // Analyse des domaines
        this.processedEmailIds = new Set(); // IDs des emails déjà traités
        this.loadingStartTime = null;
        this.progressInterval = null;
        
        console.log('[ModernDomainOrganizer] ✅ Initialisé');
    }

    async show() {
        console.log('[ModernDomainOrganizer] Affichage de la page...');
        
        try {
            // Vérifier l'authentification
            if (!window.authService?.isAuthenticated()) {
                console.error('[ModernDomainOrganizer] Utilisateur non authentifié');
                return;
            }
            
            await this.initializePage();
            console.log('[ModernDomainOrganizer] ✅ Page affichée');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur lors de l\'affichage:', error);
            this.showError('Erreur lors du chargement de la page');
        }
    }

    async initializePage() {
        console.log('[ModernDomainOrganizer] Initialisation de la page...');
        
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            throw new Error('Page content not found');
        }

        pageContent.innerHTML = this.createPageHTML();
        
        // Attacher les événements
        this.attachEventListeners();
        
        // Charger les données initiales
        await this.loadInitialData();
    }

    createPageHTML() {
        return `
            <div class="domain-organizer-container" style="max-width: 1000px; margin: 0 auto; padding: 20px;">
                <!-- En-tête moderne -->
                <div class="page-header" style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3); margin-bottom: 16px;">
                        <i class="fas fa-folder-tree" style="font-size: 24px;"></i>
                        <span style="font-size: 20px; font-weight: 600;">Ranger par Domaine</span>
                    </div>
                    <p style="color: #64748b; font-size: 16px; margin: 0;">Organisez vos emails par domaine d'expéditeur automatiquement</p>
                </div>

                <!-- Statistiques en temps réel -->
                <div class="stats-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div id="totalEmailsCount" style="font-size: 24px; font-weight: 600; color: #3b82f6; margin-bottom: 4px;">0</div>
                        <div style="font-size: 14px; color: #64748b; font-weight: 500;">Emails analysés</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div id="domainsFoundCount" style="font-size: 24px; font-weight: 600; color: #10b981; margin-bottom: 4px;">0</div>
                        <div style="font-size: 14px; color: #64748b; font-weight: 500;">Domaines trouvés</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div id="foldersScannedCount" style="font-size: 24px; font-weight: 600; color: #f59e0b; margin-bottom: 4px;">0</div>
                        <div style="font-size: 14px; color: #64748b; font-weight: 500;">Dossiers scannés</div>
                    </div>
                </div>

                <!-- Zone de contrôle -->
                <div class="control-section" style="background: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    
                    <!-- Bouton principal -->
                    <div style="text-align: center; margin-bottom: 20px;">
                        <button id="startAnalysisBtn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3); transition: all 0.15s ease;">
                            <i class="fas fa-search"></i>
                            <span>Analyser les emails</span>
                        </button>
                    </div>

                    <!-- Barre de progression NORMALE -->
                    <div id="progressSection" style="display: none; margin-top: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 14px; font-weight: 500; color: #374151;">Analyse en cours...</span>
                            <span id="progressPercentage" style="font-size: 14px; font-weight: 500; color: #374151;">0%</span>
                        </div>
                        <div style="background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
                            <div id="progressBar" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 100%; width: 0%; transition: width 0.3s ease; border-radius: 4px;"></div>
                        </div>
                        <div id="progressStatus" style="font-size: 12px; color: #6b7280; margin-top: 8px; text-align: center;">Initialisation...</div>
                    </div>
                </div>

                <!-- Résultats -->
                <div id="resultsSection" style="display: none;">
                    <div style="background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
                            <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-list" style="color: #10b981;"></i>
                                Domaines détectés
                            </h3>
                        </div>
                        <div id="domainsContainer" style="padding: 20px;">
                            <!-- Les domaines seront affichés ici -->
                        </div>
                    </div>
                </div>

                <!-- Section d'erreur -->
                <div id="errorSection" style="display: none; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 16px; border-radius: 8px; margin-top: 20px;">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: 500; margin-bottom: 8px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Erreur</span>
                    </div>
                    <div id="errorMessage"></div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const startBtn = document.getElementById('startAnalysisBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startAnalysis());
        }
    }

    async loadInitialData() {
        try {
            // Charger les dossiers disponibles
            const folders = await window.mailService.getFolders();
            this.updateStats({ foldersScanned: folders.length });
            console.log('[ModernDomainOrganizer]', folders.length, 'dossiers chargés');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur chargement initial:', error);
        }
    }

    async startAnalysis() {
        if (this.isLoading) {
            console.log('[ModernDomainOrganizer] Analyse déjà en cours');
            return;
        }
        
        console.log('[ModernDomainOrganizer] 🚀 Début de l\'analyse');
        
        this.isLoading = true;
        this.loadingStartTime = Date.now();
        
        // Reset des données
        this.emailCache.clear();
        this.domainAnalysis.clear();
        this.processedEmailIds.clear();
        this.currentStats = { totalEmails: 0, domainsFound: 0, foldersScanned: 0 };
        
        this.showProgressSection();
        this.updateProgress(0, 'Initialisation de l\'analyse...');
        
        try {
            await this.performCompleteAnalysis();
            this.showResults();
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur analyse:', error);
            this.showError('Erreur lors de l\'analyse: ' + error.message);
        } finally {
            this.hideProgressSection();
            this.isLoading = false;
        }
    }

    async performCompleteAnalysis() {
        console.log('[ModernDomainOrganizer] 📊 Analyse complète des emails');
        
        // Étape 1: Obtenir les dossiers
        this.updateProgress(10, 'Chargement des dossiers...');
        const folders = await window.mailService.getFolders();
        this.updateStats({ foldersScanned: folders.length });
        
        // Étape 2: Analyser la boîte de réception principalement
        this.updateProgress(20, 'Analyse de la boîte de réception...');
        const inboxEmails = await this.getEmailsFromFolder('inbox');
        
        // Étape 3: Traiter les emails et extraire les domaines
        this.updateProgress(50, 'Extraction des domaines...');
        this.processEmailsForDomains(inboxEmails);
        
        // Étape 4: Finaliser l'analyse
        this.updateProgress(90, 'Finalisation de l\'analyse...');
        this.finalizeAnalysis();
        
        this.updateProgress(100, 'Analyse terminée !');
        
        console.log('[ModernDomainOrganizer] ✅ Analyse terminée:', {
            emails: this.currentStats.totalEmails,
            domaines: this.currentStats.domainsFound,
            dossiers: this.currentStats.foldersScanned
        });
    }

    async getEmailsFromFolder(folderId, maxEmails = 1000) {
        console.log('[ModernDomainOrganizer] 📬 Récupération emails du dossier:', folderId);
        
        try {
            // IMPORTANT: Utiliser une seule requête avec limite
            const emails = await window.mailService.getEmailsFromFolder(folderId, maxEmails);
            
            // Filtrer les doublons par ID
            const uniqueEmails = emails.filter(email => {
                if (this.processedEmailIds.has(email.id)) {
                    return false;
                }
                this.processedEmailIds.add(email.id);
                return true;
            });
            
            console.log('[ModernDomainOrganizer] ✅ Emails uniques récupérés:', uniqueEmails.length);
            return uniqueEmails;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur récupération emails:', error);
            return [];
        }
    }

    processEmailsForDomains(emails) {
        console.log('[ModernDomainOrganizer] 🔍 Traitement', emails.length, 'emails pour extraction domaines');
        
        emails.forEach((email, index) => {
            try {
                // Extraire le domaine de l'expéditeur
                const senderEmail = email.from?.emailAddress?.address;
                if (senderEmail && senderEmail.includes('@')) {
                    const domain = senderEmail.split('@')[1].toLowerCase();
                    
                    if (domain && domain.length > 0) {
                        // Ajouter au cache email
                        this.emailCache.set(email.id, {
                            ...email,
                            domain: domain
                        });
                        
                        // Mettre à jour l'analyse des domaines
                        if (!this.domainAnalysis.has(domain)) {
                            this.domainAnalysis.set(domain, {
                                domain: domain,
                                emailCount: 0,
                                emails: [],
                                firstSeen: email.receivedDateTime,
                                lastSeen: email.receivedDateTime
                            });
                        }
                        
                        const domainData = this.domainAnalysis.get(domain);
                        domainData.emailCount++;
                        domainData.emails.push(email.id);
                        
                        // Mettre à jour les dates
                        if (email.receivedDateTime < domainData.firstSeen) {
                            domainData.firstSeen = email.receivedDateTime;
                        }
                        if (email.receivedDateTime > domainData.lastSeen) {
                            domainData.lastSeen = email.receivedDateTime;
                        }
                    }
                }
                
                // Mettre à jour les stats régulièrement
                if (index % 100 === 0) {
                    this.updateStats({
                        totalEmails: this.emailCache.size,
                        domainsFound: this.domainAnalysis.size
                    });
                }
                
            } catch (error) {
                console.warn('[ModernDomainOrganizer] Erreur traitement email:', email.id, error);
            }
        });
        
        // Mise à jour finale des stats
        this.updateStats({
            totalEmails: this.emailCache.size,
            domainsFound: this.domainAnalysis.size
        });
        
        console.log('[ModernDomainOrganizer] ✅ Domaines extraits:', this.domainAnalysis.size);
    }

    finalizeAnalysis() {
        // Trier les domaines par nombre d'emails (décroissant)
        const sortedDomains = Array.from(this.domainAnalysis.values())
            .sort((a, b) => b.emailCount - a.emailCount);
        
        // Mettre à jour la Map avec l'ordre trié
        this.domainAnalysis.clear();
        sortedDomains.forEach(domainData => {
            this.domainAnalysis.set(domainData.domain, domainData);
        });
        
        console.log('[ModernDomainOrganizer] 📈 Top 10 domaines:', 
            sortedDomains.slice(0, 10).map(d => `${d.domain}: ${d.emailCount} emails`));
    }

    showResults() {
        const resultsSection = document.getElementById('resultsSection');
        const domainsContainer = document.getElementById('domainsContainer');
        
        if (!resultsSection || !domainsContainer) return;
        
        if (this.domainAnalysis.size === 0) {
            domainsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #6b7280;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; color: #d1d5db;"></i>
                    <h3 style="font-size: 18px; margin-bottom: 8px; color: #374151;">Aucun domaine trouvé</h3>
                    <p style="font-size: 14px; margin: 0;">Vérifiez que vos emails contiennent des expéditeurs valides.</p>
                </div>
            `;
        } else {
            domainsContainer.innerHTML = this.generateDomainsHTML();
        }
        
        resultsSection.style.display = 'block';
    }

    generateDomainsHTML() {
        const domains = Array.from(this.domainAnalysis.values());
        
        return domains.map(domainData => {
            return `
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #f9fafb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
                                ${domainData.domain.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #1f2937; font-size: 16px;">${domainData.domain}</div>
                                <div style="color: #6b7280; font-size: 12px;">${domainData.emailCount} email${domainData.emailCount > 1 ? 's' : ''}</div>
                            </div>
                        </div>
                        <button onclick="modernDomainOrganizer.organizeDomain('${domainData.domain}')" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            <i class="fas fa-folder-plus"></i>
                            <span>Organiser</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats(newStats) {
        Object.assign(this.currentStats, newStats);
        
        // Mettre à jour l'affichage
        const totalEmailsEl = document.getElementById('totalEmailsCount');
        const domainsFoundEl = document.getElementById('domainsFoundCount');
        const foldersScannedEl = document.getElementById('foldersScannedCount');
        
        if (totalEmailsEl) totalEmailsEl.textContent = this.currentStats.totalEmails.toLocaleString();
        if (domainsFoundEl) domainsFoundEl.textContent = this.currentStats.domainsFound.toLocaleString();
        if (foldersScannedEl) foldersScannedEl.textContent = this.currentStats.foldersScanned.toLocaleString();
    }

    showProgressSection() {
        const progressSection = document.getElementById('progressSection');
        const startBtn = document.getElementById('startAnalysisBtn');
        
        if (progressSection) progressSection.style.display = 'block';
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Analyse en cours...</span>';
        }
    }

    hideProgressSection() {
        const progressSection = document.getElementById('progressSection');
        const startBtn = document.getElementById('startAnalysisBtn');
        
        if (progressSection) progressSection.style.display = 'none';
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-search"></i><span>Analyser les emails</span>';
        }
    }

    updateProgress(percentage, status) {
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressStatus = document.getElementById('progressStatus');
        
        if (progressBar) progressBar.style.width = percentage + '%';
        if (progressPercentage) progressPercentage.textContent = Math.round(percentage) + '%';
        if (progressStatus) progressStatus.textContent = status;
    }

    showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorSection && errorMessage) {
            errorMessage.textContent = message;
            errorSection.style.display = 'block';
        }
        
        console.error('[ModernDomainOrganizer] Erreur:', message);
    }

    async organizeDomain(domain) {
        console.log('[ModernDomainOrganizer] 📁 Organisation du domaine:', domain);
        
        try {
            // Ici vous pouvez implémenter la logique d'organisation
            // Par exemple, créer un dossier et déplacer les emails
            
            if (window.uiManager) {
                window.uiManager.showToast(`Organisation du domaine ${domain} en cours...`, 'info');
            }
            
            // TODO: Implémenter la logique d'organisation
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur organisation:', error);
            if (window.uiManager) {
                window.uiManager.showToast('Erreur lors de l\'organisation', 'error');
            }
        }
    }
}

// Initialisation autonome
if (typeof window !== 'undefined') {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[ModernDomainOrganizer] Initialisation autonome...');
            window.modernDomainOrganizer = new ModernDomainOrganizer();
        });
    } else {
        console.log('[ModernDomainOrganizer] Initialisation autonome...');
        window.modernDomainOrganizer = new ModernDomainOrganizer();
    }
    
    console.log('[ModernDomainOrganizer] ✅ Module moderne chargé');
}
