// DomainOrganizer.js - Version condensée avec visualisation des emails

class ModernDomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.currentStats = { totalEmails: 0, domainsFound: 0, foldersCreated: 0, emailsMoved: 0 };
        this.domainAnalysis = new Map();
        this.processedEmailIds = new Set();
        this.createdFolders = new Map();
        this.expandedDomains = new Set();
        
        console.log('[ModernDomainOrganizer] ✅ Module condensé initialisé');
    }

    async show() {
        console.log('[ModernDomainOrganizer] 📁 Affichage condensé...');
        
        try {
            if (!window.authService?.isAuthenticated()) {
                throw new Error('Non authentifié');
            }
            
            await this.renderCondensedPage();
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur:', error);
            this.showError(error.message);
        }
    }

    async renderCondensedPage() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        pageContent.innerHTML = this.getCondensedHTML();
        this.attachEventListeners();
        
        console.log('[ModernDomainOrganizer] ✅ Interface condensée chargée');
    }

    getCondensedHTML() {
        return `
            <div class="organizer-condensed" style="max-width: 1200px; margin: 0 auto; padding: 16px;">
                
                <!-- En-tête condensé -->
                <div style="display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-folder-tree" style="font-size: 24px;"></i>
                        <div>
                            <h1 style="font-size: 20px; font-weight: 700; margin: 0;">Rangement par Domaine</h1>
                            <p style="font-size: 13px; margin: 0; opacity: 0.9;">Analyse, organise et visualise tes emails</p>
                        </div>
                    </div>
                    
                    <!-- Actions rapides -->
                    <div style="display: flex; gap: 8px;">
                        <button id="quickAnalyzeBtn" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-search"></i> Analyser
                        </button>
                        <button id="quickOrganizeBtn" disabled style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: not-allowed; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-folder-plus"></i> Organiser
                        </button>
                    </div>
                </div>

                <!-- Stats compactes + Filtres -->
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; margin-bottom: 20px;">
                    
                    <!-- Stats en ligne -->
                    <div style="display: flex; gap: 12px; background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <div class="stat-compact" style="text-align: center; min-width: 80px;">
                            <div id="totalEmailsCount" style="font-size: 20px; font-weight: 700; color: #3b82f6;">0</div>
                            <div style="font-size: 11px; color: #6b7280; font-weight: 500;">EMAILS</div>
                        </div>
                        <div style="width: 1px; background: #e5e7eb;"></div>
                        <div class="stat-compact" style="text-align: center; min-width: 80px;">
                            <div id="domainsFoundCount" style="font-size: 20px; font-weight: 700; color: #10b981;">0</div>
                            <div style="font-size: 11px; color: #6b7280; font-weight: 500;">DOMAINES</div>
                        </div>
                        <div style="width: 1px; background: #e5e7eb;"></div>
                        <div class="stat-compact" style="text-align: center; min-width: 80px;">
                            <div id="foldersCreatedCount" style="font-size: 20px; font-weight: 700; color: #f59e0b;">0</div>
                            <div style="font-size: 11px; color: #6b7280; font-weight: 500;">DOSSIERS</div>
                        </div>
                        <div style="width: 1px; background: #e5e7eb;"></div>
                        <div class="stat-compact" style="text-align: center; min-width: 80px;">
                            <div id="emailsMovedCount" style="font-size: 20px; font-weight: 700; color: #8b5cf6;">0</div>
                            <div style="font-size: 11px; color: #6b7280; font-weight: 500;">RANGÉS</div>
                        </div>
                    </div>
                    
                    <!-- Filtres de tri -->
                    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 12px;">
                        <label style="font-size: 12px; color: #6b7280; font-weight: 500;">TRI:</label>
                        <select id="sortFilter" style="border: 1px solid #d1d5db; border-radius: 4px; padding: 4px 8px; font-size: 12px; background: white; color: #374151;">
                            <option value="count">Plus d'emails</option>
                            <option value="domain">Nom de domaine</option>
                            <option value="recent">Plus récents</option>
                            <option value="oldest">Plus anciens</option>
                        </select>
                        <label style="font-size: 12px; color: #6b7280; font-weight: 500;">MIN:</label>
                        <input id="minEmailsFilter" type="number" min="1" value="5" style="border: 1px solid #d1d5db; border-radius: 4px; padding: 4px 8px; font-size: 12px; width: 60px;">
                    </div>
                </div>

                <!-- Barre de progression intégrée -->
                <div id="progressSection" style="display: none; background: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span id="progressLabel" style="font-size: 13px; font-weight: 600; color: #374151;">En cours...</span>
                        <span id="progressPercentage" style="font-size: 13px; font-weight: 600; color: #374151;">0%</span>
                    </div>
                    <div style="background: #f3f4f6; border-radius: 4px; height: 6px; overflow: hidden;">
                        <div id="progressBar" style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                    </div>
                    <div id="progressStatus" style="font-size: 11px; color: #6b7280; margin-top: 6px; text-align: center;">Initialisation...</div>
                </div>

                <!-- Liste condensée des domaines avec emails -->
                <div id="domainsContainer" style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
                    <div style="padding: 20px; text-align: center; color: #6b7280;">
                        <i class="fas fa-search" style="font-size: 32px; margin-bottom: 12px; color: #d1d5db;"></i>
                        <p style="margin: 0; font-size: 14px;">Cliquez sur "Analyser" pour détecter les domaines</p>
                    </div>
                </div>

                <!-- Messages d'état -->
                <div id="statusMessages" style="margin-top: 16px;"></div>
            </div>

            <style>
                .domain-item {
                    border-bottom: 1px solid #f3f4f6;
                    transition: background-color 0.2s ease;
                }
                
                .domain-item:hover {
                    background-color: #f9fafb;
                }
                
                .domain-item:last-child {
                    border-bottom: none;
                }
                
                .email-list {
                    background-color: #f8fafc;
                    border-top: 1px solid #e5e7eb;
                }
                
                .email-item {
                    border-bottom: 1px solid #e5e7eb;
                    transition: background-color 0.15s ease;
                }
                
                .email-item:hover {
                    background-color: #f1f5f9;
                }
                
                .email-item:last-child {
                    border-bottom: none;
                }
                
                .stat-compact:hover {
                    transform: scale(1.05);
                    transition: transform 0.2s ease;
                }
                
                #quickOrganizeBtn:not(:disabled) {
                    background: rgba(255,255,255,0.3) !important;
                    border: 1px solid rgba(255,255,255,0.5) !important;
                    color: white !important;
                    cursor: pointer !important;
                }
            </style>
        `;
    }

    attachEventListeners() {
        // Boutons d'action
        document.getElementById('quickAnalyzeBtn')?.addEventListener('click', () => this.startFullProcess());
        document.getElementById('quickOrganizeBtn')?.addEventListener('click', () => this.startOrganization());
        
        // Filtres
        document.getElementById('sortFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('minEmailsFilter')?.addEventListener('input', () => this.applyFilters());
    }

    async startFullProcess() {
        if (this.isProcessing) return;
        
        console.log('[ModernDomainOrganizer] 🚀 Début du processus complet');
        
        this.isProcessing = true;
        this.resetData();
        this.showProgress();
        this.disableButton('quickAnalyzeBtn');
        
        try {
            // Phase 1: Analyse
            await this.performAnalysis();
            
            // Phase 2: Affichage
            this.displayResults();
            this.enableButton('quickOrganizeBtn');
            
            this.showStatusMessage('✅ Analyse terminée ! Vous pouvez maintenant organiser.', 'success');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur:', error);
            this.showStatusMessage('❌ Erreur: ' + error.message, 'error');
        } finally {
            this.hideProgress();
            this.enableButton('quickAnalyzeBtn');
            this.isProcessing = false;
        }
    }

    async performAnalysis() {
        // Étape 1: Récupération
        this.updateProgress(20, 'Récupération des emails...');
        const emails = await this.getEmailsFromInbox();
        
        // Étape 2: Analyse
        this.updateProgress(60, 'Analyse des domaines...');
        this.analyzeEmailDomains(emails);
        
        // Étape 3: Finalisation
        this.updateProgress(90, 'Tri des résultats...');
        this.sortDomainsByCount();
        
        this.updateProgress(100, 'Terminé !');
    }

    async getEmailsFromInbox() {
        try {
            const emails = await window.mailService.getEmailsFromFolder('inbox', 1500);
            
            const uniqueEmails = emails.filter(email => {
                if (this.processedEmailIds.has(email.id)) return false;
                this.processedEmailIds.add(email.id);
                return true;
            });
            
            this.updateStats({ totalEmails: uniqueEmails.length });
            return uniqueEmails;
            
        } catch (error) {
            throw new Error('Impossible de récupérer les emails: ' + error.message);
        }
    }

    analyzeEmailDomains(emails) {
        emails.forEach((email, index) => {
            try {
                const senderEmail = email.from?.emailAddress?.address;
                if (senderEmail && senderEmail.includes('@')) {
                    const domain = senderEmail.split('@')[1].toLowerCase().trim();
                    
                    if (domain && domain.length > 0 && !domain.includes(' ')) {
                        this.addEmailToDomain(domain, email);
                    }
                }
                
                if (index % 100 === 0) {
                    this.updateStats({
                        totalEmails: index + 1,
                        domainsFound: this.domainAnalysis.size
                    });
                }
                
            } catch (error) {
                console.warn('[ModernDomainOrganizer] Erreur email:', email.id);
            }
        });
        
        this.updateStats({
            totalEmails: emails.length,
            domainsFound: this.domainAnalysis.size
        });
    }

    addEmailToDomain(domain, email) {
        if (!this.domainAnalysis.has(domain)) {
            this.domainAnalysis.set(domain, {
                domain: domain,
                emails: [],
                count: 0,
                firstSeen: email.receivedDateTime || email.sentDateTime,
                lastSeen: email.receivedDateTime || email.sentDateTime,
                folderCreated: false,
                folderId: null
            });
        }
        
        const domainData = this.domainAnalysis.get(domain);
        domainData.emails.push(email);
        domainData.count++;
        
        // Mettre à jour les dates
        const emailDate = email.receivedDateTime || email.sentDateTime;
        if (emailDate) {
            if (emailDate < domainData.firstSeen) domainData.firstSeen = emailDate;
            if (emailDate > domainData.lastSeen) domainData.lastSeen = emailDate;
        }
    }

    displayResults() {
        const container = document.getElementById('domainsContainer');
        if (!container) return;
        
        const filteredDomains = this.getFilteredDomains();
        
        if (filteredDomains.length === 0) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #6b7280;">
                    <i class="fas fa-filter" style="font-size: 32px; margin-bottom: 12px; color: #d1d5db;"></i>
                    <p style="margin: 0; font-size: 14px;">Aucun domaine trouvé avec les filtres actuels</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredDomains.map(domain => this.createDomainHTML(domain)).join('');
    }

    createDomainHTML(domainData) {
        const isExpanded = this.expandedDomains.has(domainData.domain);
        const percentage = ((domainData.count / this.currentStats.totalEmails) * 100).toFixed(1);
        const firstDate = new Date(domainData.firstSeen).toLocaleDateString('fr-FR');
        const lastDate = new Date(domainData.lastSeen).toLocaleDateString('fr-FR');
        
        return `
            <div class="domain-item">
                <!-- En-tête du domaine -->
                <div style="padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="modernDomainOrganizer.toggleDomain('${domainData.domain}')">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'}" style="color: #6b7280; font-size: 12px; width: 12px;"></i>
                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">
                                ${domainData.domain.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #1f2937; font-size: 16px;">${domainData.domain}</div>
                            <div style="color: #6b7280; font-size: 12px; display: flex; align-items: center; gap: 16px; margin-top: 2px;">
                                <span><i class="fas fa-envelope" style="margin-right: 4px;"></i>${domainData.count} emails (${percentage}%)</span>
                                <span><i class="fas fa-calendar" style="margin-right: 4px;"></i>${firstDate} → ${lastDate}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${domainData.folderCreated ? 
                            '<span style="background: #dcfce7; color: #059669; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;"><i class="fas fa-check"></i> Organisé</span>' :
                            '<span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;"><i class="fas fa-clock"></i> En attente</span>'
                        }
                        <button onclick="event.stopPropagation(); modernDomainOrganizer.organizeSingleDomain('${domainData.domain}')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-folder-plus"></i> Organiser
                        </button>
                    </div>
                </div>
                
                <!-- Liste des emails (expandable) -->
                ${isExpanded ? this.createEmailsListHTML(domainData) : ''}
            </div>
        `;
    }

    createEmailsListHTML(domainData) {
        const sortedEmails = domainData.emails
            .sort((a, b) => new Date(b.receivedDateTime || b.sentDateTime) - new Date(a.receivedDateTime || a.sentDateTime))
            .slice(0, 20); // Limiter à 20 emails pour la performance
        
        return `
            <div class="email-list" style="background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
                <div style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; background: #f1f5f9;">
                    <div style="font-size: 12px; font-weight: 600; color: #374151; display: flex; justify-content: between;">
                        <span>📧 Emails récents (${Math.min(sortedEmails.length, 20)}/${domainData.count})</span>
                        ${domainData.count > 20 ? '<span style="color: #6b7280;">... et ' + (domainData.count - 20) + ' autres</span>' : ''}
                    </div>
                </div>
                ${sortedEmails.map(email => this.createEmailItemHTML(email)).join('')}
            </div>
        `;
    }

    createEmailItemHTML(email) {
        const date = new Date(email.receivedDateTime || email.sentDateTime);
        const dateStr = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const isRead = email.isRead;
        const hasAttachments = email.hasAttachments;
        const importance = email.importance;
        
        return `
            <div class="email-item" style="padding: 12px 20px; display: flex; align-items: center; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 6px; min-width: 120px;">
                    <i class="fas fa-${isRead ? 'envelope-open' : 'envelope'}" style="color: ${isRead ? '#6b7280' : '#3b82f6'}; font-size: 12px;"></i>
                    ${hasAttachments ? '<i class="fas fa-paperclip" style="color: #6b7280; font-size: 10px;"></i>' : ''}
                    ${importance === 'high' ? '<i class="fas fa-exclamation" style="color: #ef4444; font-size: 10px;"></i>' : ''}
                    <span style="font-size: 11px; color: #6b7280; font-weight: 500;">${dateStr}</span>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; font-weight: ${isRead ? '500' : '600'}; color: ${isRead ? '#6b7280' : '#1f2937'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${email.subject || 'Sans objet'}
                    </div>
                    <div style="font-size: 11px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                        ${email.bodyPreview || 'Aperçu non disponible'}
                    </div>
                </div>
                <button onclick="modernDomainOrganizer.openEmail('${email.webLink}')" style="background: #f3f4f6; border: 1px solid #d1d5db; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">
                    <i class="fas fa-external-link-alt"></i> Voir
                </button>
            </div>
        `;
    }

    toggleDomain(domain) {
        if (this.expandedDomains.has(domain)) {
            this.expandedDomains.delete(domain);
        } else {
            this.expandedDomains.add(domain);
        }
        this.displayResults();
    }

    openEmail(webLink) {
        if (webLink) {
            window.open(webLink, '_blank');
        }
    }

    getFilteredDomains() {
        const sortFilter = document.getElementById('sortFilter')?.value || 'count';
        const minEmails = parseInt(document.getElementById('minEmailsFilter')?.value) || 5;
        
        let domains = Array.from(this.domainAnalysis.values())
            .filter(domain => domain.count >= minEmails);
        
        switch (sortFilter) {
            case 'domain':
                domains.sort((a, b) => a.domain.localeCompare(b.domain));
                break;
            case 'recent':
                domains.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
                break;
            case 'oldest':
                domains.sort((a, b) => new Date(a.firstSeen) - new Date(b.firstSeen));
                break;
            default: // count
                domains.sort((a, b) => b.count - a.count);
        }
        
        return domains;
    }

    applyFilters() {
        this.displayResults();
    }

    async organizeSingleDomain(domain) {
        const domainData = this.domainAnalysis.get(domain);
        if (!domainData) return;
        
        this.showStatusMessage(`🔄 Organisation de ${domain} en cours...`, 'info');
        
        try {
            await this.createFolderForDomain(domainData);
            await this.moveEmailsToFolder(domainData);
            
            this.updateStats({ 
                foldersCreated: this.currentStats.foldersCreated + 1,
                emailsMoved: this.currentStats.emailsMoved + domainData.count 
            });
            
            this.displayResults();
            this.showStatusMessage(`✅ ${domain} organisé avec succès !`, 'success');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur organisation:', error);
            this.showStatusMessage(`❌ Erreur avec ${domain}: ${error.message}`, 'error');
        }
    }

    async startOrganization() {
        if (this.isProcessing || this.domainAnalysis.size === 0) return;
        
        this.isProcessing = true;
        this.showProgress();
        this.disableButton('quickOrganizeBtn');
        
        try {
            const domains = Array.from(this.domainAnalysis.values());
            
            for (let i = 0; i < domains.length; i++) {
                const domainData = domains[i];
                const progress = ((i + 1) / domains.length) * 100;
                
                this.updateProgress(progress, `Organisation de ${domainData.domain}...`);
                
                await this.createFolderForDomain(domainData);
                await this.moveEmailsToFolder(domainData);
                
                this.updateStats({ 
                    foldersCreated: this.currentStats.foldersCreated + 1,
                    emailsMoved: this.currentStats.emailsMoved + domainData.count
                });
            }
            
            this.displayResults();
            this.showStatusMessage('✅ Tous les domaines ont été organisés !', 'success');
            
        } catch (error) {
            this.showStatusMessage('❌ Erreur: ' + error.message, 'error');
        } finally {
            this.hideProgress();
            this.enableButton('quickOrganizeBtn');
            this.isProcessing = false;
        }
    }

    async createFolderForDomain(domainData) {
        if (domainData.folderCreated) return;
        
        try {
            const folderName = `📧 ${domainData.domain}`;
            
            if (this.createdFolders.has(domainData.domain)) {
                domainData.folderId = this.createdFolders.get(domainData.domain);
                domainData.folderCreated = true;
                return;
            }
            
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await window.authService.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ displayName: folderName })
            });
            
            if (response.ok) {
                const folder = await response.json();
                domainData.folderId = folder.id;
                domainData.folderCreated = true;
                this.createdFolders.set(domainData.domain, folder.id);
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            throw new Error(`Impossible de créer le dossier pour ${domainData.domain}`);
        }
    }

    async moveEmailsToFolder(domainData) {
        if (!domainData.folderId || domainData.emails.length === 0) return;
        
        const batchSize = 5;
        const batches = [];
        
        for (let i = 0; i < domainData.emails.length; i += batchSize) {
            batches.push(domainData.emails.slice(i, i + batchSize));
        }
        
        for (const batch of batches) {
            await Promise.all(batch.map(email => this.moveEmailToFolder(email.id, domainData.folderId)));
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
                body: JSON.stringify({ destinationId: folderId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.warn('[ModernDomainOrganizer] Erreur déplacement:', emailId);
        }
    }

    sortDomainsByCount() {
        const sortedEntries = Array.from(this.domainAnalysis.entries())
            .sort(([, a], [, b]) => b.count - a.count);
        this.domainAnalysis = new Map(sortedEntries);
    }

    // Méthodes utilitaires
    resetData() {
        this.domainAnalysis.clear();
        this.processedEmailIds.clear();
        this.expandedDomains.clear();
        this.currentStats = { totalEmails: 0, domainsFound: 0, foldersCreated: 0, emailsMoved: 0 };
        this.updateStats(this.currentStats);
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
        const section = document.getElementById('progressSection');
        if (section) section.style.display = 'block';
    }

    hideProgress() {
        const section = document.getElementById('progressSection');
        if (section) section.style.display = 'none';
    }

    updateProgress(percentage, status) {
        const bar = document.getElementById('progressBar');
        const percent = document.getElementById('progressPercentage');
        const statusEl = document.getElementById('progressStatus');
        
        if (bar) bar.style.width = Math.min(100, Math.max(0, percentage)) + '%';
        if (percent) percent.textContent = Math.round(percentage) + '%';
        if (statusEl) statusEl.textContent = status;
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
        const container = document.getElementById('statusMessages');
        if (!container) return;
        
        const colors = {
            success: { bg: '#dcfce7', border: '#059669', text: '#065f46' },
            error: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' },
            info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
        };
        
        const style = colors[type] || colors.info;
        
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            background: ${style.bg}; border: 1px solid ${style.border}; color: ${style.text};
            padding: 12px 16px; border-radius: 6px; margin-bottom: 8px; font-size: 13px; font-weight: 500;
        `;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        setTimeout(() => messageEl.remove(), 4000);
    }

    showError(message) {
        this.showStatusMessage(message, 'error');
    }
}

// Initialisation
console.log('[ModernDomainOrganizer] 🚀 Chargement module condensé...');
window.modernDomainOrganizer = new ModernDomainOrganizer();

// Intercepter navigation
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item[data-page="ranger"]');
    if (navItem) {
        console.log('[ModernDomainOrganizer] 📁 Navigation vers Ranger');
        e.preventDefault();
        e.stopPropagation();
        
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');
        
        window.modernDomainOrganizer.show();
    }
});

console.log('[ModernDomainOrganizer] ✅ Module condensé prêt');
