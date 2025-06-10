// DomainOrganizer.js - Version avancée avec contrôle total

class ModernDomainOrganizer {
    constructor() {
        this.isProcessing = false;
        this.currentStats = { totalEmails: 0, domainsFound: 0, foldersCreated: 0, emailsMoved: 0 };
        this.domainAnalysis = new Map();
        this.processedEmailIds = new Set();
        this.createdFolders = new Map();
        this.expandedDomains = new Set();
        this.selectedEmails = new Map(); // Pour la sélection multiple
        this.customFolderNames = new Map(); // Noms de dossiers personnalisés
        
        console.log('[ModernDomainOrganizer] ✅ Module avancé initialisé');
    }

    async show() {
        console.log('[ModernDomainOrganizer] 📁 Affichage module avancé...');
        
        try {
            if (!window.authService?.isAuthenticated()) {
                throw new Error('Non authentifié');
            }
            
            await this.renderAdvancedPage();
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur:', error);
            this.showError(error.message);
        }
    }

    async renderAdvancedPage() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        pageContent.innerHTML = this.getAdvancedHTML();
        this.attachEventListeners();
        this.initializeDatePickers();
        
        console.log('[ModernDomainOrganizer] ✅ Interface avancée chargée');
    }

    getAdvancedHTML() {
        const today = new Date();
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        
        return `
            <div class="organizer-advanced" style="max-width: 1400px; margin: 0 auto; padding: 16px;">
                
                <!-- En-tête avec contrôles avancés -->
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);">
                    <div style="display: flex; align-items: center; justify-content: between; gap: 20px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-folder-tree" style="font-size: 28px;"></i>
                            <div>
                                <h1 style="font-size: 22px; font-weight: 700; margin: 0;">Rangement Avancé</h1>
                                <p style="font-size: 14px; margin: 0; opacity: 0.9;">Contrôle total sur l'organisation de tes emails</p>
                            </div>
                        </div>
                        
                        <!-- Contrôles de dates -->
                        <div style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.15); padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
                            <label style="font-size: 12px; font-weight: 600; opacity: 0.9;">PÉRIODE:</label>
                            <input id="startDate" type="date" value="${monthAgo.toISOString().split('T')[0]}" style="border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; padding: 6px 8px; font-size: 12px; background: rgba(255,255,255,0.9); color: #374151;">
                            <span style="color: rgba(255,255,255,0.8);">→</span>
                            <input id="endDate" type="date" value="${today.toISOString().split('T')[0]}" style="border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; padding: 6px 8px; font-size: 12px; background: rgba(255,255,255,0.9); color: #374151;">
                        </div>
                        
                        <!-- Actions principales -->
                        <div style="display: flex; gap: 8px;">
                            <button id="advancedAnalyzeBtn" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-search"></i> Analyser Période
                            </button>
                            <button id="advancedOrganizeBtn" disabled style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: not-allowed; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-magic"></i> Organiser Tout
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Panneau de contrôle condensé -->
                <div style="display: grid; grid-template-columns: 1fr auto auto auto; gap: 16px; margin-bottom: 20px;">
                    
                    <!-- Stats dynamiques -->
                    <div style="display: flex; gap: 12px; background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <div class="stat-compact" style="text-align: center; min-width: 70px;">
                            <div id="totalEmailsCount" style="font-size: 18px; font-weight: 700; color: #3b82f6;">0</div>
                            <div style="font-size: 10px; color: #6b7280; font-weight: 500;">EMAILS</div>
                        </div>
                        <div style="width: 1px; background: #e5e7eb;"></div>
                        <div class="stat-compact" style="text-align: center; min-width: 70px;">
                            <div id="domainsFoundCount" style="font-size: 18px; font-weight: 700; color: #10b981;">0</div>
                            <div style="font-size: 10px; color: #6b7280; font-weight: 500;">DOMAINES</div>
                        </div>
                        <div style="width: 1px; background: #e5e7eb;"></div>
                        <div class="stat-compact" style="text-align: center; min-width: 70px;">
                            <div id="foldersCreatedCount" style="font-size: 18px; font-weight: 700; color: #f59e0b;">0</div>
                            <div style="font-size: 10px; color: #6b7280; font-weight: 500;">DOSSIERS</div>
                        </div>
                        <div style="width: 1px; background: #e5e7eb;"></div>
                        <div class="stat-compact" style="text-align: center; min-width: 70px;">
                            <div id="emailsMovedCount" style="font-size: 18px; font-weight: 700; color: #8b5cf6;">0</div>
                            <div style="font-size: 10px; color: #6b7280; font-weight: 500;">DÉPLACÉS</div>
                        </div>
                    </div>
                    
                    <!-- Filtres -->
                    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px;">
                        <label style="font-size: 11px; color: #6b7280; font-weight: 600;">DOMAINE:</label>
                        <input id="domainFilter" type="text" placeholder="Filtrer..." style="border: 1px solid #d1d5db; border-radius: 4px; padding: 4px 6px; font-size: 11px; width: 80px;">
                        <label style="font-size: 11px; color: #6b7280; font-weight: 600;">MIN:</label>
                        <input id="minEmailsFilter" type="number" min="1" value="2" placeholder="Min" style="border: 1px solid #d1d5db; border-radius: 4px; padding: 4px 6px; font-size: 11px; width: 50px;">
                    </div>
                    
                    <!-- Exclusions -->
                    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px;">
                        <label style="font-size: 11px; color: #6b7280; font-weight: 600;">EXCLURE:</label>
                        <input id="excludeFilter" type="text" placeholder="@spam.com, @promo.fr" style="border: 1px solid #d1d5db; border-radius: 4px; padding: 4px 6px; font-size: 11px; width: 120px;">
                        <button id="clearFiltersBtn" style="background: #6b7280; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">
                            <i class="fas fa-eraser"></i> Reset
                        </button>
                    </div>
                    
                    <!-- Actions sélection -->
                    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px;">
                        <span id="selectedCount" style="font-size: 11px; color: #6b7280; font-weight: 600;">0 sélectionné(s)</span>
                        <button id="moveSelectedBtn" disabled style="background: #e5e7eb; color: #9ca3af; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: not-allowed;">
                            <i class="fas fa-arrow-right"></i> Déplacer
                        </button>
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

                <!-- Liste avancée des domaines -->
                <div id="domainsContainer" style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
                    <div style="padding: 40px; text-align: center; color: #6b7280;">
                        <i class="fas fa-calendar-alt" style="font-size: 32px; margin-bottom: 12px; color: #d1d5db;"></i>
                        <p style="margin: 0; font-size: 14px;">Sélectionnez une période et cliquez sur "Analyser Période"</p>
                    </div>
                </div>

                <!-- Messages d'état -->
                <div id="statusMessages" style="margin-top: 16px;"></div>
            </div>

            <!-- Modal de personnalisation du dossier -->
            <div id="folderModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
                <div style="background: white; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937;">Personnaliser le dossier</h3>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">DOMAINE:</label>
                        <input id="modalDomain" readonly style="width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; font-size: 14px; background: #f9fafb; color: #6b7280;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">NOM DU DOSSIER:</label>
                        <input id="modalFolderName" style="width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; font-size: 14px;" placeholder="Nom personnalisé...">
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button onclick="modernDomainOrganizer.closeFolderModal()" style="background: #f3f4f6; border: 1px solid #d1d5db; color: #374151; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer;">Annuler</button>
                        <button onclick="modernDomainOrganizer.saveFolderName()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">Sauvegarder</button>
                    </div>
                </div>
            </div>

            <!-- Modal de déplacement d'emails -->
            <div id="moveModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
                <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-height: 80vh; overflow-y: auto;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937;">Déplacer les emails sélectionnés</h3>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">DESTINATION:</label>
                        <select id="modalDestination" style="width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; font-size: 14px;">
                            <option value="">Choisir un dossier...</option>
                        </select>
                    </div>
                    <div id="modalEmailsList" style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 16px; background: #f9fafb;">
                        <!-- Liste des emails sélectionnés -->
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button onclick="modernDomainOrganizer.closeMoveModal()" style="background: #f3f4f6; border: 1px solid #d1d5db; color: #374151; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer;">Annuler</button>
                        <button onclick="modernDomainOrganizer.executeMove()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">Déplacer</button>
                    </div>
                </div>
            </div>

            <style>
                .domain-item { border-bottom: 1px solid #f3f4f6; transition: background-color 0.2s ease; }
                .domain-item:hover { background-color: #f9fafb; }
                .domain-item:last-child { border-bottom: none; }
                .email-list { background-color: #f8fafc; border-top: 1px solid #e5e7eb; }
                .email-item { border-bottom: 1px solid #e5e7eb; transition: background-color 0.15s ease; }
                .email-item:hover { background-color: #f1f5f9; }
                .email-item:last-child { border-bottom: none; }
                .email-item.selected { background-color: #dbeafe !important; border-color: #3b82f6; }
                .stat-compact:hover { transform: scale(1.05); transition: transform 0.2s ease; }
                
                #advancedOrganizeBtn:not(:disabled) {
                    background: rgba(255,255,255,0.3) !important;
                    border: 1px solid rgba(255,255,255,0.5) !important;
                    color: white !important;
                    cursor: pointer !important;
                }
                
                #moveSelectedBtn:not(:disabled) {
                    background: #3b82f6 !important;
                    color: white !important;
                    cursor: pointer !important;
                }
                
                #folderModal.show, #moveModal.show {
                    display: flex !important;
                }
                
                /* Assurer que les éléments sont cliquables */
                button, select, input[type="date"], input[type="number"], input[type="checkbox"] {
                    pointer-events: auto;
                    z-index: 1;
                }
                
                /* Modal overlay clickable */
                #folderModal, #moveModal {
                    pointer-events: auto;
                }
                
                #folderModal > div, #moveModal > div {
                    pointer-events: auto;
                }
                
                /* Navigation cliquable */
                .nav-item {
                    pointer-events: auto;
                    cursor: pointer;
                }
                
                /* Boutons toujours cliquables */
                .domain-item button,
                .email-item button,
                #advancedAnalyzeBtn,
                #advancedOrganizeBtn,
                #moveSelectedBtn {
                    pointer-events: auto;
                    z-index: 2;
                }
            </style>
        `;
    }

    attachEventListeners() {
        // Boutons principaux
        document.getElementById('advancedAnalyzeBtn')?.addEventListener('click', () => this.startAnalysisWithDateRange());
        document.getElementById('advancedOrganizeBtn')?.addEventListener('click', () => this.startFullOrganization());
        
        // Filtres
        document.getElementById('domainFilter')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('minEmailsFilter')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('excludeFilter')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => this.clearFilters());
        
        // Sélection multiple
        document.getElementById('moveSelectedBtn')?.addEventListener('click', () => this.openMoveModal());
        
        // Dates
        document.getElementById('startDate')?.addEventListener('change', () => this.validateDateRange());
        document.getElementById('endDate')?.addEventListener('change', () => this.validateDateRange());
    }

    initializeDatePickers() {
        this.validateDateRange();
    }

    validateDateRange() {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            this.showStatusMessage('⚠️ La date de début doit être antérieure à la date de fin', 'error');
            return false;
        }
        
        return true;
    }

    async startAnalysisWithDateRange() {
        if (this.isProcessing || !this.validateDateRange()) return;
        
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        
        if (!startDate || !endDate) {
            this.showStatusMessage('⚠️ Veuillez sélectionner une période complète', 'error');
            return;
        }
        
        console.log('[ModernDomainOrganizer] 🗓️ Analyse période:', startDate, '→', endDate);
        
        this.isProcessing = true;
        this.resetData();
        this.showProgress();
        this.disableButton('advancedAnalyzeBtn');
        
        try {
            await this.performAnalysisWithDateRange(startDate, endDate);
            this.displayAdvancedResults();
            this.enableButton('advancedOrganizeBtn');
            
            const daysCount = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
            this.showStatusMessage(`✅ Analyse terminée ! ${daysCount} jours analysés.`, 'success');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur:', error);
            this.showStatusMessage('❌ Erreur: ' + error.message, 'error');
        } finally {
            this.hideProgress();
            this.enableButton('advancedAnalyzeBtn');
            this.isProcessing = false;
        }
    }

    async performAnalysisWithDateRange(startDate, endDate) {
        // Étape 1: Récupération avec filtre de dates - INBOX + SPAM
        this.updateProgress(10, 'Récupération des emails de la période...');
        
        const inboxEmails = await this.getEmailsFromFolderWithDateRange('inbox', startDate, endDate);
        this.updateProgress(30, 'Récupération des indésirables...');
        
        const spamEmails = await this.getEmailsFromFolderWithDateRange('junkemail', startDate, endDate);
        
        // Combiner tous les emails
        const allEmails = [...inboxEmails, ...spamEmails];
        console.log('[ModernDomainOrganizer] 📧 Total emails récupérés:', allEmails.length, '(Inbox:', inboxEmails.length, '+ Spam:', spamEmails.length, ')');
        
        // Étape 2: Analyse
        this.updateProgress(60, 'Analyse des domaines...');
        this.analyzeEmailDomains(allEmails);
        
        // Étape 3: Finalisation
        this.updateProgress(90, 'Tri des résultats...');
        this.sortDomainsByCount();
        
        this.updateProgress(100, 'Terminé !');
    }

    async getEmailsFromFolderWithDateRange(folderId, startDate, endDate) {
        try {
            // Construire le filtre de dates pour l'API Microsoft Graph
            const startISO = new Date(startDate + 'T00:00:00.000Z').toISOString();
            const endISO = new Date(endDate + 'T23:59:59.999Z').toISOString();
            
            console.log('[ModernDomainOrganizer] 📅 Dossier:', folderId, 'Période:', startISO, '→', endISO);
            
            // Récupérer TOUS les emails de la période sans limitation
            const emails = await this.getAllEmailsInDateRangeFromFolder(folderId, startISO, endISO);
            
            const uniqueEmails = emails.filter(email => {
                if (this.processedEmailIds.has(email.id)) return false;
                this.processedEmailIds.add(email.id);
                return true;
            });
            
            console.log('[ModernDomainOrganizer] ✅', uniqueEmails.length, 'emails uniques de', folderId);
            
            return uniqueEmails;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur dossier', folderId, ':', error);
            return []; // Retourner un tableau vide en cas d'erreur
        }
    }

    async getAllEmailsInDateRangeFromFolder(folderId, startDate, endDate) {
        console.log('[ModernDomainOrganizer] 🔄 Récupération complète de', folderId, 'sans limitation...');
        
        let allEmails = [];
        let nextLink = null;
        let pageCount = 0;
        const maxPages = 100; // Limite de sécurité augmentée
        
        do {
            try {
                const token = await window.authService.getAccessToken();
                
                // Construire l'URL avec filtre de dates
                let url;
                if (nextLink) {
                    url = nextLink;
                } else {
                    const filter = `receivedDateTime ge ${startDate} and receivedDateTime le ${endDate}`;
                    const select = 'id,subject,bodyPreview,body,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,isRead,importance,hasAttachments,flag,categories,parentFolderId,webLink';
                    url = `https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}/messages?$top=1000&$orderby=receivedDateTime desc&$select=${select}&$filter=${encodeURIComponent(filter)}`;
                }
                
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!response.ok) {
                    if (response.status === 504) {
                        console.warn('[ModernDomainOrganizer] ⏱️ Timeout 504 - continuer avec les emails récupérés');
                        break;
                    } else if (response.status === 429) {
                        console.warn('[ModernDomainOrganizer] ⏱️ Rate limit - pause 5 secondes');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        continue;
                    } else {
                        throw new Error(`HTTP ${response.status}`);
                    }
                }
                
                const data = await response.json();
                const pageEmails = data.value || [];
                allEmails = allEmails.concat(pageEmails);
                nextLink = data['@odata.nextLink'];
                pageCount++;
                
                // Mise à jour du progrès
                if (folderId === 'inbox') {
                    this.updateProgress(10 + (pageCount * 2), `Récupération inbox... ${allEmails.length} emails`);
                } else {
                    this.updateProgress(30 + (pageCount * 2), `Récupération ${folderId}... ${allEmails.length} emails`);
                }
                
                console.log('[ModernDomainOrganizer] 📄 Page', pageCount, 'de', folderId, ':', pageEmails.length, 'emails (Total:', allEmails.length, ')');
                
                // Pause plus longue entre les requêtes pour éviter les timeouts
                if (nextLink) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                
            } catch (error) {
                console.error('[ModernDomainOrganizer] Erreur page', pageCount + 1, 'de', folderId, ':', error);
                if (error.message.includes('504') || error.message.includes('timeout')) {
                    console.log('[ModernDomainOrganizer] ⏹️ Arrêt à cause du timeout - continuer avec', allEmails.length, 'emails');
                    break;
                }
                // Pour d'autres erreurs, continuer si on a déjà des emails
                if (allEmails.length > 0) {
                    console.log('[ModernDomainOrganizer] ⏹️ Continuer avec', allEmails.length, 'emails récupérés');
                    break;
                } else {
                    throw error;
                }
            }
            
        } while (nextLink && pageCount < maxPages);
        
        console.log('[ModernDomainOrganizer] ✅ Récupération', folderId, 'terminée:', allEmails.length, 'emails sur', pageCount, 'pages');
        return allEmails;
    }

    analyzeEmailDomains(emails) {
        console.log('[ModernDomainOrganizer] 🔍 Analyse de', emails.length, 'emails...');
        
        emails.forEach((email, index) => {
            try {
                const senderEmail = email.from?.emailAddress?.address;
                if (senderEmail && senderEmail.includes('@')) {
                    const domain = senderEmail.split('@')[1].toLowerCase().trim();
                    
                    if (domain && domain.length > 0 && !domain.includes(' ')) {
                        this.addEmailToDomain(domain, email);
                    }
                }
                
                if (index % 500 === 0) {
                    this.updateStats({
                        totalEmails: index + 1,
                        domainsFound: this.domainAnalysis.size
                    });
                }
                
            } catch (error) {
                console.warn('[ModernDomainOrganizer] Erreur email:', email.id);
            }
        });
        
        // Mise à jour finale des stats
        this.updateStats({
            totalEmails: emails.length,
            domainsFound: this.domainAnalysis.size
        });
        
        // Mettre à jour l'interface de sélection après avoir ajouté tous les emails
        this.updateSelectionUI();
        
        console.log('[ModernDomainOrganizer] ✅', this.domainAnalysis.size, 'domaines trouvés,', this.selectedEmails.size, 'emails sélectionnés par défaut');
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
        
        // Sélectionner automatiquement tous les emails par défaut
        this.selectedEmails.set(email.id, { emailId: email.id, domain });
        
        // Mettre à jour les dates
        const emailDate = email.receivedDateTime || email.sentDateTime;
        if (emailDate) {
            if (emailDate < domainData.firstSeen) domainData.firstSeen = emailDate;
            if (emailDate > domainData.lastSeen) domainData.lastSeen = emailDate;
        }
    }

    displayAdvancedResults() {
        const container = document.getElementById('domainsContainer');
        if (!container) return;
        
        const filteredDomains = this.getFilteredDomains();
        
        if (filteredDomains.length === 0) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #6b7280;">
                    <i class="fas fa-filter" style="font-size: 32px; margin-bottom: 12px; color: #d1d5db;"></i>
                    <p style="margin: 0; font-size: 14px;">Aucun domaine trouvé avec les critères actuels</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredDomains.map(domain => this.createAdvancedDomainHTML(domain)).join('');
    }

    createAdvancedDomainHTML(domainData) {
        const isExpanded = this.expandedDomains.has(domainData.domain);
        const percentage = ((domainData.count / this.currentStats.totalEmails) * 100).toFixed(1);
        const firstDate = new Date(domainData.firstSeen).toLocaleDateString('fr-FR');
        const lastDate = new Date(domainData.lastSeen).toLocaleDateString('fr-FR');
        const customName = this.customFolderNames.get(domainData.domain) || `📧 ${domainData.domain}`;
        
        // Vérifier si c'est un nouveau dossier (pas encore créé)
        const isNewFolder = !domainData.folderCreated && !this.createdFolders.has(domainData.domain);
        
        return `
            <div class="domain-item">
                <!-- En-tête du domaine avec contrôles avancés -->
                <div style="padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1; cursor: pointer;" onclick="modernDomainOrganizer.toggleDomain('${domainData.domain}')">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'}" style="color: #6b7280; font-size: 12px; width: 12px;"></i>
                            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px;">
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
                    
                    <!-- Contrôles avancés -->
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <!-- Nom du dossier personnalisé avec indicateur nouveau -->
                        <div style="display: flex; align-items: center; gap: 6px; background: #f8fafc; padding: 6px 10px; border-radius: 6px; border: 1px solid #e5e7eb; position: relative;">
                            ${isNewFolder ? '<span style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; border-radius: 50%; width: 12px; height: 12px; font-size: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700;">N</span>' : ''}
                            <i class="fas fa-folder" style="color: #6b7280; font-size: 12px;"></i>
                            <span style="font-size: 11px; color: #374151; font-weight: 500; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${customName}</span>
                            <button onclick="event.stopPropagation(); modernDomainOrganizer.editFolderName('${domainData.domain}')" style="background: none; border: none; color: #6b7280; cursor: pointer; padding: 2px;">
                                <i class="fas fa-edit" style="font-size: 10px;"></i>
                            </button>
                        </div>
                        
                        <!-- Statut -->
                        ${domainData.folderCreated ? 
                            '<span style="background: #dcfce7; color: #059669; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;"><i class="fas fa-check"></i> Organisé</span>' :
                            `<span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;"><i class="fas fa-${isNewFolder ? 'plus' : 'clock'}"></i> ${isNewFolder ? 'Nouveau' : 'En attente'}</span>`
                        }
                        
                        <!-- Actions -->
                        <button onclick="event.stopPropagation(); modernDomainOrganizer.organizeSingleDomain('${domainData.domain}')" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-folder-plus"></i> Organiser
                        </button>
                    </div>
                </div>
                
                <!-- Liste des emails avec sélection multiple -->
                ${isExpanded ? this.createAdvancedEmailsListHTML(domainData) : ''}
            </div>
        `;
    }

    createAdvancedEmailsListHTML(domainData) {
        const sortedEmails = domainData.emails
            .sort((a, b) => new Date(b.receivedDateTime || b.sentDateTime) - new Date(a.receivedDateTime || a.sentDateTime));
        
        return `
            <div class="email-list" style="background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
                <div style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; background: #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 12px; font-weight: 600; color: #374151;">
                        📧 Tous les emails (${sortedEmails.length})
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="modernDomainOrganizer.selectAllEmails('${domainData.domain}')" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">
                            <i class="fas fa-check-square"></i> Tout sélectionner
                        </button>
                        <button onclick="modernDomainOrganizer.unselectAllEmails('${domainData.domain}')" style="background: #6b7280; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">
                            <i class="fas fa-square"></i> Tout déselectionner
                        </button>
                    </div>
                </div>
                ${sortedEmails.map(email => this.createAdvancedEmailItemHTML(email, domainData.domain)).join('')}
            </div>
        `;
    }

    createAdvancedEmailItemHTML(email, domain) {
        const date = new Date(email.receivedDateTime || email.sentDateTime);
        const dateStr = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const isRead = email.isRead;
        const hasAttachments = email.hasAttachments;
        const importance = email.importance;
        
        // Par défaut, tous les emails sont sélectionnés
        const isSelected = this.selectedEmails.has(email.id);
        
        return `
            <div class="email-item ${isSelected ? 'selected' : ''}" style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer;" onclick="modernDomainOrganizer.toggleEmailByClick('${email.id}', '${domain}')">
                <!-- Checkbox de sélection -->
                <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="event.stopPropagation(); modernDomainOrganizer.toggleEmailSelection('${email.id}', '${domain}', this.checked)" style="cursor: pointer;">
                
                <!-- Métadonnées -->
                <div style="display: flex; align-items: center; gap: 6px; min-width: 130px;">
                    <i class="fas fa-${isRead ? 'envelope-open' : 'envelope'}" style="color: ${isRead ? '#6b7280' : '#3b82f6'}; font-size: 12px;"></i>
                    ${hasAttachments ? '<i class="fas fa-paperclip" style="color: #6b7280; font-size: 10px;"></i>' : ''}
                    ${importance === 'high' ? '<i class="fas fa-exclamation" style="color: #ef4444; font-size: 10px;"></i>' : ''}
                    <span style="font-size: 11px; color: #6b7280; font-weight: 500;">${dateStr}</span>
                </div>
                
                <!-- Contenu de l'email -->
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; font-weight: ${isRead ? '500' : '600'}; color: ${isRead ? '#6b7280' : '#1f2937'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${email.subject || 'Sans objet'}
                    </div>
                    <div style="font-size: 11px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                        ${email.bodyPreview || 'Aperçu non disponible'}
                    </div>
                </div>
                
                <!-- Actions individuelles -->
                <div style="display: flex; gap: 4px;">
                    <button onclick="event.stopPropagation(); modernDomainOrganizer.openEmail('${email.webLink}')" style="background: #f3f4f6; border: 1px solid #d1d5db; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">
                        <i class="fas fa-external-link-alt"></i> Voir
                    </button>
                    <button onclick="event.stopPropagation(); modernDomainOrganizer.moveIndividualEmail('${email.id}', '${domain}')" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">
                        <i class="fas fa-arrow-right"></i> Déplacer
                    </button>
                </div>
            </div>
        `;
    }

    // Gestion de la sélection multiple
    toggleEmailSelection(emailId, domain, isSelected) {
        if (isSelected) {
            this.selectedEmails.set(emailId, { emailId, domain });
        } else {
            this.selectedEmails.delete(emailId);
        }
        
        this.updateSelectionUI();
    }

    toggleEmailByClick(emailId, domain) {
        const isCurrentlySelected = this.selectedEmails.has(emailId);
        this.toggleEmailSelection(emailId, domain, !isCurrentlySelected);
        
        // Mettre à jour la checkbox correspondante
        const checkbox = document.querySelector(`input[onchange*="${emailId}"]`);
        if (checkbox) {
            checkbox.checked = !isCurrentlySelected;
        }
    }

    selectAllEmails(domain) {
        const domainData = this.domainAnalysis.get(domain);
        if (!domainData) return;
        
        domainData.emails.forEach(email => {
            this.selectedEmails.set(email.id, { emailId: email.id, domain });
        });
        
        this.displayAdvancedResults();
        this.updateSelectionUI();
    }

    unselectAllEmails(domain) {
        const domainData = this.domainAnalysis.get(domain);
        if (!domainData) return;
        
        domainData.emails.forEach(email => {
            this.selectedEmails.delete(email.id);
        });
        
        this.displayAdvancedResults();
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        const selectedCount = this.selectedEmails.size;
        const selectedCountEl = document.getElementById('selectedCount');
        const moveBtn = document.getElementById('moveSelectedBtn');
        
        if (selectedCountEl) {
            selectedCountEl.textContent = `${selectedCount} sélectionné(s)`;
        }
        
        if (moveBtn) {
            moveBtn.disabled = selectedCount === 0;
        }
    }

    // Gestion des modals
    editFolderName(domain) {
        const modal = document.getElementById('folderModal');
        const domainInput = document.getElementById('modalDomain');
        const folderInput = document.getElementById('modalFolderName');
        
        if (modal && domainInput && folderInput) {
            domainInput.value = domain;
            folderInput.value = this.customFolderNames.get(domain) || `📧 ${domain}`;
            modal.style.display = 'flex';
            modal.classList.add('show');
            folderInput.focus();
            folderInput.select();
        }
    }

    closeFolderModal() {
        const modal = document.getElementById('folderModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    }

    saveFolderName() {
        const domainInput = document.getElementById('modalDomain');
        const folderInput = document.getElementById('modalFolderName');
        
        if (domainInput && folderInput) {
            const domain = domainInput.value;
            const folderName = folderInput.value.trim();
            
            if (folderName && folderName.length > 0) {
                this.customFolderNames.set(domain, folderName);
                this.displayAdvancedResults();
                this.showStatusMessage(`✅ Nom du dossier mis à jour pour ${domain}`, 'success');
                this.closeFolderModal();
            } else {
                this.showStatusMessage('⚠️ Veuillez entrer un nom de dossier valide', 'error');
            }
        }
    }

    async openMoveModal() {
        if (this.selectedEmails.size === 0) {
            this.showStatusMessage('⚠️ Aucun email sélectionné', 'error');
            return;
        }
        
        const modal = document.getElementById('moveModal');
        const destinationSelect = document.getElementById('modalDestination');
        const emailsList = document.getElementById('modalEmailsList');
        
        if (!modal || !destinationSelect || !emailsList) return;
        
        // Charger les dossiers disponibles
        try {
            this.showStatusMessage('🔄 Chargement des dossiers...', 'info');
            
            const folders = await window.mailService.getFolders();
            destinationSelect.innerHTML = '<option value="">Choisir un dossier...</option>';
            
            folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.id;
                option.textContent = folder.displayName;
                destinationSelect.appendChild(option);
            });
            
            // Afficher la liste des emails sélectionnés
            const selectedEmailsArray = Array.from(this.selectedEmails.values());
            emailsList.innerHTML = selectedEmailsArray.map(({ emailId, domain }) => {
                const domainData = this.domainAnalysis.get(domain);
                const email = domainData?.emails.find(e => e.id === emailId);
                
                if (!email) return '';
                
                return `
                    <div style="padding: 8px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 12px; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${email.subject || 'Sans objet'}</div>
                            <div style="font-size: 10px; color: #6b7280;">De: ${domain}</div>
                        </div>
                        <button onclick="modernDomainOrganizer.removeFromSelection('${emailId}')" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 9px; cursor: pointer; margin-left: 8px; flex-shrink: 0;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            }).join('');
            
            modal.style.display = 'flex';
            modal.classList.add('show');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur chargement dossiers:', error);
            this.showStatusMessage('❌ Erreur lors du chargement des dossiers', 'error');
        }
    }

    closeMoveModal() {
        const modal = document.getElementById('moveModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    }

    removeFromSelection(emailId) {
        this.selectedEmails.delete(emailId);
        this.updateSelectionUI();
        this.displayAdvancedResults();
        
        // Mettre à jour la modal
        if (this.selectedEmails.size === 0) {
            this.closeMoveModal();
        } else {
            this.openMoveModal();
        }
    }

    async executeMove() {
        const destinationSelect = document.getElementById('modalDestination');
        const destinationId = destinationSelect?.value;
        
        if (!destinationId || this.selectedEmails.size === 0) {
            this.showStatusMessage('⚠️ Veuillez sélectionner un dossier de destination', 'error');
            return;
        }
        
        console.log('[ModernDomainOrganizer] 🚀 Début déplacement:', this.selectedEmails.size, 'emails vers', destinationId);
        
        this.closeMoveModal();
        this.showProgress();
        this.disableButton('moveSelectedBtn');
        
        try {
            const selectedEmailsArray = Array.from(this.selectedEmails.keys());
            const totalEmails = selectedEmailsArray.length;
            let movedCount = 0;
            let errorCount = 0;
            
            console.log('[ModernDomainOrganizer] 📧 Emails à déplacer:', selectedEmailsArray);
            
            for (let i = 0; i < selectedEmailsArray.length; i++) {
                const emailId = selectedEmailsArray[i];
                const progress = ((i + 1) / totalEmails) * 100;
                
                this.updateProgress(progress, `Déplacement ${i + 1}/${totalEmails}...`);
                
                try {
                    await this.moveEmailToFolder(emailId, destinationId);
                    movedCount++;
                    console.log('[ModernDomainOrganizer] ✅ Email déplacé:', emailId);
                } catch (error) {
                    errorCount++;
                    console.error('[ModernDomainOrganizer] ❌ Erreur déplacement:', emailId, error);
                }
                
                // Petite pause pour éviter la limitation API
                if (i < selectedEmailsArray.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
            
            // Nettoyer la sélection et rafraîchir
            this.selectedEmails.clear();
            this.updateSelectionUI();
            this.updateStats({ emailsMoved: this.currentStats.emailsMoved + movedCount });
            
            // Message de résultat
            if (errorCount === 0) {
                this.showStatusMessage(`✅ ${movedCount} emails déplacés avec succès !`, 'success');
            } else {
                this.showStatusMessage(`⚠️ ${movedCount} déplacés, ${errorCount} erreurs`, 'error');
            }
            
            // Rafraîchir l'affichage
            setTimeout(() => {
                this.displayAdvancedResults();
            }, 1000);
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur globale déplacement:', error);
            this.showStatusMessage('❌ Erreur lors du déplacement: ' + error.message, 'error');
        } finally {
            this.hideProgress();
            this.enableButton('moveSelectedBtn');
        }
    }

    async moveIndividualEmail(emailId, domain) {
        try {
            // Créer le dossier pour ce domaine s'il n'existe pas
            const domainData = this.domainAnalysis.get(domain);
            if (!domainData) return;
            
            if (!domainData.folderCreated) {
                await this.createFolderForDomain(domainData);
            }
            
            if (domainData.folderId) {
                await this.moveEmailToFolder(emailId, domainData.folderId);
                this.updateStats({ emailsMoved: this.currentStats.emailsMoved + 1 });
                this.showStatusMessage(`✅ Email déplacé vers ${domainData.domain}`, 'success');
            }
            
        } catch (error) {
            this.showStatusMessage('❌ Erreur lors du déplacement: ' + error.message, 'error');
        }
    }

    // Méthodes existantes adaptées...
    toggleDomain(domain) {
        if (this.expandedDomains.has(domain)) {
            this.expandedDomains.delete(domain);
        } else {
            this.expandedDomains.add(domain);
        }
        this.displayAdvancedResults();
    }

    openEmail(webLink) {
        if (webLink) {
            window.open(webLink, '_blank');
        }
    }

    getFilteredDomains() {
        const domainFilter = document.getElementById('domainFilter')?.value.toLowerCase().trim() || '';
        const minEmails = parseInt(document.getElementById('minEmailsFilter')?.value) || 2;
        const excludeFilter = document.getElementById('excludeFilter')?.value.toLowerCase().trim() || '';
        
        // Parser les exclusions (séparées par virgule)
        const excludeDomains = excludeFilter.split(',').map(d => d.trim()).filter(d => d.length > 0);
        
        let domains = Array.from(this.domainAnalysis.values())
            .filter(domain => {
                // Filtre par nombre minimum d'emails
                if (domain.count < minEmails) return false;
                
                // Filtre par nom de domaine
                if (domainFilter && !domain.domain.toLowerCase().includes(domainFilter)) return false;
                
                // Filtre d'exclusion
                if (excludeDomains.length > 0) {
                    const isExcluded = excludeDomains.some(excludeDomain => {
                        if (excludeDomain.startsWith('@')) {
                            return domain.domain.toLowerCase() === excludeDomain.substring(1);
                        } else {
                            return domain.domain.toLowerCase().includes(excludeDomain);
                        }
                    });
                    if (isExcluded) return false;
                }
                
                return true;
            });
        
        // Tri par nombre d'emails (décroissant)
        domains.sort((a, b) => b.count - a.count);
        
        return domains;
    }

    clearFilters() {
        const domainFilter = document.getElementById('domainFilter');
        const excludeFilter = document.getElementById('excludeFilter');
        const minEmailsFilter = document.getElementById('minEmailsFilter');
        
        if (domainFilter) domainFilter.value = '';
        if (excludeFilter) excludeFilter.value = '';
        if (minEmailsFilter) minEmailsFilter.value = '2';
        
        this.applyFilters();
        this.showStatusMessage('✅ Filtres remis à zéro', 'info');
    }

    applyFilters() {
        this.displayAdvancedResults();
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
            
            this.displayAdvancedResults();
            this.showStatusMessage(`✅ ${domain} organisé avec succès !`, 'success');
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur organisation:', error);
            this.showStatusMessage(`❌ Erreur avec ${domain}: ${error.message}`, 'error');
        }
    }

    async startFullOrganization() {
        if (this.isProcessing || this.domainAnalysis.size === 0) return;
        
        this.isProcessing = true;
        this.showProgress();
        this.disableButton('advancedOrganizeBtn');
        
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
            
            this.displayAdvancedResults();
            this.showStatusMessage('✅ Tous les domaines ont été organisés !', 'success');
            
        } catch (error) {
            this.showStatusMessage('❌ Erreur: ' + error.message, 'error');
        } finally {
            this.hideProgress();
            this.enableButton('advancedOrganizeBtn');
            this.isProcessing = false;
        }
    }

    async createFolderForDomain(domainData) {
        if (domainData.folderCreated) return;
        
        try {
            const folderName = this.customFolderNames.get(domainData.domain) || `📧 ${domainData.domain}`;
            
            if (this.createdFolders.has(domainData.domain)) {
                domainData.folderId = this.createdFolders.get(domainData.domain);
                domainData.folderCreated = true;
                return;
            }
            
            // Vérifier d'abord si le dossier existe déjà
            const existingFolder = await this.checkIfFolderExists(folderName);
            if (existingFolder) {
                console.log('[ModernDomainOrganizer] 📁 Dossier existant trouvé:', folderName);
                domainData.folderId = existingFolder.id;
                domainData.folderCreated = true;
                this.createdFolders.set(domainData.domain, existingFolder.id);
                return;
            }
            
            // Créer le dossier avec gestion d'erreur 409
            const token = await window.authService.getAccessToken();
            
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
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
                
            } else if (response.status === 409) {
                // Conflit - le dossier existe déjà, essayer de le retrouver
                console.log('[ModernDomainOrganizer] ⚠️ Conflit 409 - dossier existe déjà, recherche...');
                const existingFolder = await this.findFolderByName(folderName);
                if (existingFolder) {
                    domainData.folderId = existingFolder.id;
                    domainData.folderCreated = true;
                    this.createdFolders.set(domainData.domain, existingFolder.id);
                    console.log('[ModernDomainOrganizer] ✅ Dossier existant trouvé après 409:', folderName);
                } else {
                    throw new Error(`Dossier en conflit mais introuvable: ${folderName}`);
                }
                
            } else {
                const errorText = await response.text();
                console.error('[ModernDomainOrganizer] Erreur création dossier:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] Erreur création dossier pour', domainData.domain, ':', error);
            throw new Error(`Impossible de créer le dossier pour ${domainData.domain}: ${error.message}`);
        }
    }

    async checkIfFolderExists(folderName) {
        try {
            const token = await window.authService.getAccessToken();
            const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const folder = data.value.find(f => f.displayName === folderName);
                return folder || null;
            }
        } catch (error) {
            console.warn('[ModernDomainOrganizer] Erreur vérification dossier:', error);
        }
        return null;
    }

    async findFolderByName(folderName) {
        try {
            const token = await window.authService.getAccessToken();
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/mailFolders?$filter=displayName eq '${encodeURIComponent(folderName)}'`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.value.length > 0 ? data.value[0] : null;
            }
        } catch (error) {
            console.warn('[ModernDomainOrganizer] Erreur recherche dossier:', error);
        }
        return null;
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
            console.log('[ModernDomainOrganizer] 🔄 Déplacement email:', emailId, 'vers dossier:', folderId);
            
            const token = await window.authService.getAccessToken();
            
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${emailId}/move`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    destinationId: folderId 
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[ModernDomainOrganizer] Erreur API:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('[ModernDomainOrganizer] ✅ Email déplacé avec succès:', result);
            
            return result;
            
        } catch (error) {
            console.error('[ModernDomainOrganizer] ❌ Erreur déplacement email:', emailId, error);
            throw error;
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
        this.selectedEmails.clear();
        this.currentStats = { totalEmails: 0, domainsFound: 0, foldersCreated: 0, emailsMoved: 0 };
        this.updateStats(this.currentStats);
        this.updateSelectionUI();
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
console.log('[ModernDomainOrganizer] 🚀 Chargement module avancé...');
window.modernDomainOrganizer = new ModernDomainOrganizer();

// Intercepter navigation
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item[data-page="ranger"]');
    if (navItem) {
        console.log('[ModernDomainOrganizer] 📁 Navigation vers Ranger Avancé');
        e.preventDefault();
        e.stopPropagation();
        
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');
        
        window.modernDomainOrganizer.show();
    }
});

console.log('[ModernDomainOrganizer] ✅ Module avancé prêt avec contrôle total');
