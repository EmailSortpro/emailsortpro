// PageManager.js - Version 9.0 - Optimisée avec affichage condensé et descriptions enrichies

class PageManager {
    constructor() {
        // Core state
        this.currentPage = null;
        this.selectedEmails = new Set();
        this.aiAnalysisResults = new Map();
        this.createdTasks = new Map();
        this.autoAnalyzeEnabled = true;
        this.searchTerm = '';
        this.temporaryEmailStorage = [];
        this.lastScanData = null;
        
        // Page renderers
        this.pages = {
            dashboard: (container) => this.renderDashboard(container),
            scanner: (container) => this.renderScanner(container),
            emails: (container) => this.renderEmails(container),
            tasks: (container) => this.renderTasks(container),
            categories: (container) => this.renderCategories(container),
            settings: (container) => this.renderSettings(container)
        };
        
        this.init();
    }

    init() {
        console.log('[PageManager] Initialized v9.0 - Optimized with condensed display');
    }

    // =====================================
    // PAGE LOADING
    // =====================================
    async loadPage(pageName) {
        console.log(`[PageManager] Loading page: ${pageName}`);

        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            console.error('[PageManager] Page content container not found');
            return;
        }

        this.updateNavigation(pageName);
        window.uiManager.showLoading(`Chargement ${pageName}...`);

        try {
            pageContent.innerHTML = '';
            
            if (this.pages[pageName]) {
                await this.pages[pageName](pageContent);
                this.currentPage = pageName;
            } else {
                throw new Error(`Page ${pageName} not found`);
            }

            window.uiManager.hideLoading();

        } catch (error) {
            console.error(`[PageManager] Error loading page:`, error);
            window.uiManager.hideLoading();
            window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            
            pageContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="empty-state-title">Erreur de chargement</h3>
                    <p class="empty-state-text">${error.message}</p>
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('dashboard')">
                        Retour au tableau de bord
                    </button>
                </div>
            `;
        }
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // =====================================
    // EMAILS PAGE - CONDENSED VIEW
    // =====================================
    async renderEmails(container) {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        const categories = window.categoryManager?.getCategories() || {};
        
        // Initialize view mode - grouped by domain by default
        this.currentViewMode = this.currentViewMode || 'grouped-domain';
        this.currentCategory = this.currentCategory || 'all';

        const renderEmailsPage = () => {
            const categoryCounts = this.calculateCategoryCounts(emails);
            const totalEmails = emails.length;
            
            container.innerHTML = `
                <div class="page-header">
                    <h1>Emails</h1>
                    <div class="page-actions">
                        ${this.selectedEmails.size > 0 ? `
                            <div class="selection-info">
                                <span class="selection-count">${this.selectedEmails.size} sélectionné(s)</span>
                                <button class="btn btn-secondary btn-small" onclick="window.pageManager.clearSelection()">
                                    <i class="fas fa-times"></i> Désélectionner
                                </button>
                            </div>
                            <button class="btn btn-primary" onclick="window.pageManager.createTasksFromSelection()">
                                <i class="fas fa-tasks"></i> Créer tâches
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="window.pageManager.refreshEmails()">
                            <i class="fas fa-sync"></i> Actualiser
                        </button>
                    </div>
                </div>

                <!-- Barre de recherche -->
                <div class="search-bar-container">
                    <div class="search-bar">
                        <div class="search-input-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   class="search-input" 
                                   id="emailSearchInput"
                                   placeholder="Rechercher par expéditeur, sujet, contenu..." 
                                   value="${this.searchTerm}">
                            <button class="search-clear-btn" id="searchClearBtn" 
                                    style="display: ${this.searchTerm ? 'flex' : 'none'}"
                                    onclick="window.pageManager.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Toolbar with view modes -->
                <div class="emails-toolbar">
                    <div class="emails-info">
                        <span class="emails-count">${totalEmails} emails</span>
                    </div>
                    <div class="view-controls">
                        <div class="view-mode-group">
                            <button class="view-mode-btn ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                    data-mode="grouped-domain"
                                    onclick="window.pageManager.changeViewMode('grouped-domain')">
                                <i class="fas fa-globe"></i>
                                <span class="btn-text">Par domaine</span>
                            </button>
                            <button class="view-mode-btn ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                    data-mode="grouped-sender"
                                    onclick="window.pageManager.changeViewMode('grouped-sender')">
                                <i class="fas fa-user"></i>
                                <span class="btn-text">Par expéditeur</span>
                            </button>
                            <button class="view-mode-btn ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                    data-mode="flat"
                                    onclick="window.pageManager.changeViewMode('flat')">
                                <i class="fas fa-list"></i>
                                <span class="btn-text">Liste complète</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Filtres de catégories -->
                <div class="category-pills-container">
                    <div class="category-pills-row">
                        ${this.buildCategoryPills(categoryCounts, totalEmails, categories, this.currentCategory)}
                    </div>
                </div>

                <div id="emailsList"></div>
            `;

            this.addEmailStyles();
            this.setupEmailsEventListeners();
            this.renderEmailsList(this.currentViewMode, this.currentCategory);
        };

        renderEmailsPage();
        
        // Auto-analyze first emails if enabled
        if (this.autoAnalyzeEnabled && emails.length > 0) {
            setTimeout(() => {
                this.analyzeFirstEmails(emails.slice(0, 5));
            }, 1000);
        }
    }

    renderEmailsList(viewMode = 'condensed', category = 'all') {
        const container = document.getElementById('emailsList');
        if (!container) return;

        let emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        
        // Apply filters
        if (category !== 'all') {
            emails = emails.filter(email => (email.category || 'other') === category);
        }
        
        if (this.searchTerm) {
            emails = emails.filter(email => this.matchesSearch(email, this.searchTerm));
        }
        
        if (emails.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3 class="empty-state-title">Aucun email trouvé</h3>
                    <p class="empty-state-text">
                        ${this.searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun email dans cette catégorie'}
                    </p>
                </div>
            `;
            return;
        }

        // Render based on view mode
        if (viewMode === 'flat') {
            container.innerHTML = `
                <div class="emails-condensed-list">
                    ${emails.map(email => this.renderCondensedEmailItem(email)).join('')}
                </div>
            `;
        } else if (viewMode === 'grouped-domain' || viewMode === 'grouped-sender') {
            const groups = this.createEmailGroups(emails, viewMode);
            container.innerHTML = `
                <div class="senders-list">
                    ${groups.map(group => this.renderEmailGroup(group, viewMode)).join('')}
                </div>
            `;
            setTimeout(() => {
                this.setupGroupToggles();
            }, 100);
        }
    }

    renderCondensedEmailItem(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Unknown';
        const senderInitial = senderName.charAt(0).toUpperCase();
        const formattedDate = this.formatEmailDate(email.receivedDateTime);
        
        return `
            <div class="email-condensed ${isSelected ? 'selected' : ''}" 
                 data-id="${email.id}"
                 onclick="window.pageManager.handleEmailClick(event, '${email.id}')">
                
                <input type="checkbox" 
                       class="email-checkbox-condensed" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                
                <div class="sender-avatar-condensed">${senderInitial}</div>
                
                <div class="email-content-condensed">
                    <div class="email-line-one">
                        <span class="sender-name-condensed">${senderName}</span>
                        <span class="email-date-condensed">${formattedDate}</span>
                    </div>
                    <div class="email-subject-condensed">${email.subject || 'Sans sujet'}</div>
                </div>
                
                <div class="email-actions-condensed">
                    ${hasTask ? 
                        '<i class="fas fa-check-circle task-created-icon" title="Tâche créée"></i>' : 
                        '<i class="fas fa-plus-circle create-task-icon" title="Créer une tâche" onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal(\'' + email.id + '\')"></i>'
                    }
                </div>
            </div>
        `;
    }

    renderDetailedEmailItem(email) {
        const isSelected = this.selectedEmails.has(email.id);
        const aiAnalysis = this.aiAnalysisResults.get(email.id);
        const hasTask = this.createdTasks.has(email.id);
        const categoryInfo = this.getCategoryInfo(email.category || 'other');
        const formattedDate = this.formatEmailDate(email.receivedDateTime);
        const senderName = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Unknown';
        
        return `
            <div class="email-item ${isSelected ? 'selected' : ''} ${aiAnalysis ? 'has-ai' : ''}" 
                 data-id="${email.id}">
                
                <div class="email-selection">
                    <input type="checkbox" 
                           class="email-checkbox" 
                           data-email-id="${email.id}"
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.pageManager.toggleEmailSelection('${email.id}')">
                </div>
                
                <div class="email-main" onclick="window.pageManager.showEmailDetails('${email.id}')">
                    <div class="email-header">
                        <div class="email-sender">${senderName}</div>
                        <div class="email-date">${formattedDate}</div>
                    </div>
                    <div class="email-subject">${email.subject || 'Sans sujet'}</div>
                    <div class="email-preview">${email.bodyPreview || ''}</div>
                    <div class="email-footer">
                        <span class="category-badge" style="background: ${categoryInfo.color}20; color: ${categoryInfo.color}">
                            ${categoryInfo.icon} ${categoryInfo.name}
                        </span>
                        ${aiAnalysis ? '<span class="ai-badge"><i class="fas fa-robot"></i> Analysé</span>' : ''}
                        ${hasTask ? '<span class="task-badge"><i class="fas fa-check"></i> Tâche créée</span>' : ''}
                    </div>
                </div>
                
                <div class="email-actions">
                    <button class="email-action-btn" 
                            onclick="event.stopPropagation(); window.pageManager.showEmailModal('${email.id}')"
                            title="Voir l'email complet">
                        <i class="fas fa-envelope-open"></i>
                    </button>
                    
                    ${hasTask ? `
                        <button class="email-action-btn task-created" 
                                onclick="event.stopPropagation(); window.pageManager.openCreatedTask('${email.id}')"
                                title="Ouvrir la tâche">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    ` : `
                        <button class="email-action-btn create-task" 
                                onclick="event.stopPropagation(); window.pageManager.showTaskCreationModal('${email.id}')"
                                title="Créer une tâche">
                            <i class="fas fa-plus-circle"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    handleEmailClick(event, emailId) {
        // Si on clique sur l'email condensé, afficher les détails
        this.showEmailModal(emailId);
    }

// Remplacer la fonction showTaskCreationModal dans PageManager.js

// Remplacer dans PageManager.js
async showTaskCreationModal(emailId) {
    const email = this.getEmailById(emailId);
    if (!email) return;

    // Nettoyer tout modal existant
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    
    // Get or create AI analysis
    let analysis;
    try {
        window.uiManager.showLoading('Analyse de l\'email...');
        analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email, {
            useApi: true
        });
        this.aiAnalysisResults.set(emailId, analysis);
        window.uiManager.hideLoading();
    } catch (error) {
        window.uiManager.hideLoading();
        window.uiManager.showToast('Erreur d\'analyse', 'error');
        return;
    }

    // Créer un nouvel id unique
    const uniqueId = 'task_creation_modal_' + Date.now();

    // Créer le modal avec style inline pour forcer l'affichage
    const modalHTML = `
        <div id="${uniqueId}" 
             style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                    z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                    padding: 20px; backdrop-filter: blur(4px);">
            <div style="background: white; border-radius: 12px; max-width: 900px; width: 100%; 
                        max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 20px;">Créer une tâche à partir de cet email</h2>
                    <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                            style="background: none; border: none; font-size: 20px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 20px; overflow-y: auto; flex: 1;">
                    ${this.buildEnhancedTaskCreationModal(email, analysis)}
                </div>
                <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                            style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                        Annuler
                    </button>
                    <button onclick="window.pageManager.createTaskFromModal('${emailId}'); document.getElementById('${uniqueId}').remove();"
                            style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-check"></i> Créer la tâche
                    </button>
                </div>
            </div>
        </div>
    `;

    // Ajouter au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// Simplifier la fonction de fermeture
closeTaskModal() {
    document.querySelectorAll('[id^="task_creation_modal_"]').forEach(el => el.remove());
    document.body.style.overflow = 'auto';
}

    buildEnhancedTaskCreationModal(email, analysis) {
        // Extract sender info
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || '';
        
        // Enhanced task title with sender context
        const enhancedTitle = analysis.mainTask.title.includes(senderName) ? 
            analysis.mainTask.title : 
            `${analysis.mainTask.title} - ${senderName}`;
        
        // Create structured task data
        const taskData = this.createStructuredTaskData(email, analysis, senderName, senderDomain);

        return `
            <div class="task-creation-form">
                <div class="ai-suggestion-banner">
                    <i class="fas fa-robot"></i>
                    <span>Analyse intelligente par Claude AI</span>
                </div>
                
                <!-- Sender Context -->
                <div class="sender-context-box">
                    <div class="sender-avatar-small">${senderName.charAt(0).toUpperCase()}</div>
                    <div class="sender-details">
                        <div class="sender-name-bold">${senderName}</div>
                        <div class="sender-email-small">${senderEmail}</div>
                        <div class="sender-domain">@${senderDomain}</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Titre de la tâche</label>
                    <input type="text" id="task-title" class="form-input" 
                           value="${enhancedTitle}" />
                </div>
                
                <!-- Structured Task Sections -->
                <div class="task-sections-container">
                    <!-- Executive Summary Section -->
                    <div class="task-section">
                        <div class="section-header">
                            <i class="fas fa-clipboard-list"></i>
                            <h4>Résumé Exécutif</h4>
                        </div>
                        <div class="section-content">
                            <textarea id="task-summary" class="section-textarea" rows="4">${taskData.summary}</textarea>
                        </div>
                    </div>
                    
                    <!-- Actions Required Section -->
                    ${taskData.actions.length > 0 ? `
                        <div class="task-section">
                            <div class="section-header">
                                <i class="fas fa-tasks"></i>
                                <h4>Actions Requises</h4>
                            </div>
                            <div class="section-content">
                                <div class="actions-list">
                                    ${taskData.actions.map((action, idx) => `
                                        <div class="action-item">
                                            <span class="action-number">${idx + 1}</span>
                                            <input type="text" class="action-input" 
                                                   value="${action.text}" 
                                                   data-action-index="${idx}">
                                            ${action.deadline ? `<span class="action-deadline">${action.deadline}</span>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Key Information Section -->
                    ${taskData.keyInfo.length > 0 ? `
                        <div class="task-section">
                            <div class="section-header">
                                <i class="fas fa-info-circle"></i>
                                <h4>Informations Clés</h4>
                            </div>
                            <div class="section-content">
                                <div class="info-grid">
                                    ${taskData.keyInfo.map(info => `
                                        <div class="info-item">
                                            <i class="fas fa-chevron-right"></i>
                                            <span>${info}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Points of Attention Section -->
                    ${taskData.risks.length > 0 ? `
                        <div class="task-section attention-section">
                            <div class="section-header">
                                <i class="fas fa-exclamation-triangle"></i>
                                <h4>Points d'Attention</h4>
                            </div>
                            <div class="section-content">
                                <div class="attention-list">
                                    ${taskData.risks.map(risk => `
                                        <div class="attention-item">
                                            <i class="fas fa-exclamation-circle"></i>
                                            <span>${risk}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Priorité</label>
                        <select id="task-priority" class="form-select">
                            <option value="urgent" ${analysis.mainTask.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                            <option value="high" ${analysis.mainTask.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${analysis.mainTask.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${analysis.mainTask.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date d'échéance</label>
                        <input type="date" id="task-duedate" class="form-input" 
                               value="${analysis.mainTask.dueDate || ''}" />
                    </div>
                </div>
                
                <!-- AI Generated Smart Replies -->
                ${this.renderSmartReplies(analysis, email)}
                
                <!-- Separated Tasks Section -->
                ${this.renderSeparatedTasks(analysis)}
                
                <!-- Email Context Collapsible -->
                <div class="email-context-section">
                    <button class="context-toggle-btn" onclick="window.pageManager.toggleEmailContext()">
                        <i class="fas fa-chevron-right" id="context-toggle-icon"></i>
                        <span>Afficher le contenu original de l'email</span>
                    </button>
                    <div class="email-context-content" id="email-context-content" style="display: none;">
                        <div class="context-header">
                            <div class="context-meta">
                                <strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;<br>
                                <strong>Date:</strong> ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}<br>
                                <strong>Sujet:</strong> ${email.subject || 'Sans sujet'}
                            </div>
                        </div>
                        <div class="context-body">
                            ${this.getEmailContent(email)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createStructuredTaskData(email, analysis, senderName, senderDomain) {
        // Summary
        const summary = `De: ${senderName} (${senderDomain})
Objet: ${analysis.summary || email.subject}
${analysis.importance === 'urgent' || analysis.mainTask.priority === 'urgent' ? '🚨 URGENT - Action immédiate requise' : ''}
${analysis.insights?.responseExpected ? '📮 Réponse attendue' : ''}`;

        // Actions
        const actions = analysis.actionsHighlighted?.map(action => ({
            text: action.action,
            deadline: action.deadline
        })) || analysis.actionPoints?.map(point => ({
            text: point,
            deadline: null
        })) || [];

        // Key Info
        const keyInfo = analysis.insights?.keyInfo || [];

        // Risks
        const risks = analysis.insights?.risks || [];

        return {
            summary,
            actions: actions.slice(0, 5), // Limit to 5 actions
            keyInfo: keyInfo.slice(0, 5), // Limit to 5 key info
            risks: risks.slice(0, 3) // Limit to 3 risks
        };
    }

    createExecutiveSummary(email, analysis, senderName, senderDomain) {
        const lines = [];
        
        // Sender and context
        lines.push(`De: ${senderName} (${senderDomain})`);
        
        // Main subject/request
        const mainTopic = analysis.summary || `Email concernant: ${email.subject}`;
        lines.push(`Objet: ${mainTopic}`);
        
        // Key action or request
        if (analysis.actionsHighlighted?.length > 0) {
            lines.push(`Action principale: ${analysis.actionsHighlighted[0].action}`);
        } else if (analysis.actionPoints?.length > 0) {
            lines.push(`Point clé: ${analysis.actionPoints[0]}`);
        }
        
        // Urgency
        if (analysis.importance === 'urgent' || analysis.mainTask.priority === 'urgent') {
            lines.push('🚨 URGENT - Action immédiate requise');
        } else if (analysis.importance === 'high' || analysis.mainTask.priority === 'high') {
            lines.push('⚡ Priorité élevée');
        }
        
        // Response expectation
        if (analysis.insights?.responseExpected) {
            lines.push(`📮 Réponse attendue${analysis.mainTask.dueDate ? ` avant le ${new Date(analysis.mainTask.dueDate).toLocaleDateString('fr-FR')}` : ''}`);
        }
        
        return lines.join('\n');
    }

    renderSmartReplies(analysis, email) {
        // Filter and enhance suggested replies
        const validReplies = (analysis.suggestedReplies || [])
            .filter(reply => !this.isGenericReply(reply))
            .slice(0, 3);

        if (validReplies.length === 0) {
            // Generate contextual replies if none exist
            validReplies.push(...this.generateContextualReplies(email, analysis));
        }

        if (validReplies.length === 0) {
            return `
                <div class="no-reply-suggestion">
                    <p><i class="fas fa-info-circle"></i> Pas de réponse suggérée - Une réponse personnalisée est recommandée</p>
                </div>
            `;
        }

        return `
            <div class="smart-replies-section">
                <h4><i class="fas fa-reply-all"></i> Réponses intelligentes suggérées</h4>
                ${validReplies.map((reply, index) => `
                    <div class="smart-reply-card">
                        <div class="reply-header">
                            <span class="reply-tone-badge ${reply.tone}">
                                ${this.getReplyToneIcon(reply.tone)} ${this.getReplyToneLabel(reply.tone)}
                            </span>
                            <button class="btn btn-small btn-secondary" onclick="window.pageManager.copyReply('${email.id}', ${index})">
                                <i class="fas fa-copy"></i> Copier
                            </button>
                        </div>
                        <div class="reply-subject"><strong>Objet:</strong> ${reply.subject}</div>
                        <div class="reply-preview">${reply.content}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateContextualReplies(email, analysis) {
        const replies = [];
        const senderName = email.from?.emailAddress?.name || 'l\'expéditeur';
        const subject = email.subject || 'votre message';
        
        // Analyze the email context to generate ultra-personalized replies
        const hasDeadline = analysis.actionsHighlighted?.some(a => a.deadline) || analysis.mainTask.dueDate;
        const isUrgent = analysis.importance === 'urgent' || analysis.mainTask.priority === 'urgent';
        const hasMultipleActions = analysis.actionPoints?.length > 2;
        
        // Professional acknowledgment
        if (isUrgent) {
            replies.push({
                tone: 'urgent',
                subject: `Re: ${subject} - Pris en charge`,
                content: `Bonjour ${senderName},

Je viens de prendre connaissance de votre message urgent concernant "${subject}".

Je comprends l'importance de cette demande et je m'en occupe immédiatement. Je vous tiendrai informé de l'avancement dans les prochaines heures.

${hasDeadline ? 'Je note bien l\'échéance mentionnée et ferai mon possible pour la respecter.' : ''}

Cordialement,
[Votre nom]`
            });
        }
        
        // Detailed action plan response
        if (hasMultipleActions) {
            const actionsList = analysis.actionPoints.slice(0, 3).map((a, i) => `${i + 1}. ${a}`).join('\n');
            replies.push({
                tone: 'formel',
                subject: `Re: ${subject} - Plan d'action`,
                content: `Bonjour ${senderName},

J'ai bien reçu votre email et j'ai identifié les points suivants à traiter :

${actionsList}

Je vais procéder méthodiquement à chacune de ces actions et je vous tiendrai informé de l'avancement.

${hasDeadline ? 'Je prends note de l\'échéance et organiserai mon travail en conséquence.' : 'Je reviendrai vers vous avec un planning détaillé.'}

Bien cordialement,
[Votre nom]`
            });
        }
        
        // Clarification request if needed
        if (analysis.insights?.risks?.length > 0 || analysis.insights?.keyInfo?.length < 2) {
            replies.push({
                tone: 'neutre',
                subject: `Re: ${subject} - Demande de précisions`,
                content: `Bonjour ${senderName},

Merci pour votre message concernant "${subject}".

Pour m'assurer de bien répondre à vos attentes, j'aurais besoin de quelques précisions supplémentaires :

${analysis.insights?.risks?.length > 0 ? '- ' + analysis.insights.risks[0] : ''}
${analysis.actionPoints?.length > 0 ? '- Concernant "' + analysis.actionPoints[0] + '", pourriez-vous me préciser vos attentes ?' : ''}

Je reste à votre disposition pour en discuter.

Cordialement,
[Votre nom]`
            });
        }
        
        return replies;
    }

    renderSeparatedTasks(analysis) {
        if (!analysis.subtasks || analysis.subtasks.length === 0) {
            return '';
        }

        return `
            <div class="separated-tasks-section">
                <h4><i class="fas fa-tasks"></i> Tâches séparées suggérées</h4>
                <p class="section-description">L'IA a identifié ces actions qui pourraient être gérées comme des tâches distinctes :</p>
                <div class="subtasks-list">
                    ${analysis.subtasks.map((subtask, index) => `
                        <div class="subtask-item">
                            <input type="checkbox" id="subtask-${index}" checked>
                            <label for="subtask-${index}">
                                <span class="subtask-title">${subtask.title}</span>
                                <span class="subtask-priority priority-${subtask.priority}">
                                    ${this.getPriorityIcon(subtask.priority)} ${this.getPriorityLabel(subtask.priority)}
                                </span>
                            </label>
                        </div>
                    `).join('')}
                </div>
                <p class="section-note">
                    <i class="fas fa-info-circle"></i> 
                    Ces tâches seront créées séparément si sélectionnées
                </p>
            </div>
        `;
    }

    toggleEmailContext() {
        const content = document.getElementById('email-context-content');
        const icon = document.getElementById('context-toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
        }
    }

 async createTaskFromModal(emailId) {
    const email = this.getEmailById(emailId);
    const analysis = this.aiAnalysisResults.get(emailId);
    
    if (!email || !analysis) {
        window.uiManager.showToast('Données manquantes', 'error');
        return;
    }

    const title = document.getElementById('task-title')?.value;
    const priority = document.getElementById('task-priority')?.value;
    const dueDate = document.getElementById('task-duedate')?.value;

    if (!title) {
        window.uiManager.showToast('Le titre est requis', 'warning');
        return;
    }

    // Build description from structured sections
    let description = '';
    
    // Summary
    const summaryText = document.getElementById('task-summary')?.value;
    if (summaryText) {
        description += `📧 RÉSUMÉ EXÉCUTIF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${summaryText}\n\n`;
    }
    
    // Actions
    const actionInputs = document.querySelectorAll('.action-input');
    if (actionInputs.length > 0) {
        description += `🎯 ACTIONS REQUISES:\n`;
        actionInputs.forEach((input, idx) => {
            if (input.value.trim()) {
                description += `${idx + 1}. ${input.value.trim()}\n`;
            }
        });
        description += '\n';
    }
    
    // Key info (read-only)
    const taskData = this.createStructuredTaskData(email, analysis, 
        email.from?.emailAddress?.name || 'Inconnu',
        email.from?.emailAddress?.address?.split('@')[1] || ''
    );
    
    if (taskData.keyInfo.length > 0) {
        description += `💡 INFORMATIONS CLÉS:\n`;
        taskData.keyInfo.forEach(info => {
            description += `• ${info}\n`;
        });
        description += '\n';
    }
    
    if (taskData.risks.length > 0) {
        description += `⚠️ POINTS D'ATTENTION:\n`;
        taskData.risks.forEach(risk => {
            description += `• ${risk}\n`;
        });
    }

    // Extract sender info
    const senderName = email.from?.emailAddress?.name || 'Inconnu';
    const senderEmail = email.from?.emailAddress?.address || '';
    const senderDomain = senderEmail.split('@')[1] || 'unknown';

    try {
        // Create main task with COMPLETE email data
        const mainTaskData = {
            id: this.generateTaskId(),
            title,
            description,
            priority,
            dueDate,
            status: 'todo',
            emailId: emailId,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            aiGenerated: true,
            
            // Email details - FORMAT IMPORTANT
            emailFrom: senderEmail,
            emailFromName: senderName,
            emailSubject: email.subject,
            emailDomain: senderDomain,
            emailDate: email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            
            // AI Analysis
            aiAnalysis: analysis,
            
            // Tags
            tags: [
                senderDomain,
                analysis.importance,
                ...(analysis.tags || [])
            ].filter(Boolean),
            
            // Structured sections for unified view
            summary: summaryText || taskData.summary,
            actions: taskData.actions,
            keyInfo: taskData.keyInfo,
            risks: taskData.risks,
            method: 'ai'
        };

        // IMPORTANT: Use createTaskFromEmail to ensure email content is preserved
        const mainTask = window.taskManager.createTaskFromEmail(mainTaskData, email);
        
        // Create selected subtasks
        const selectedSubtasks = [];
        analysis.subtasks?.forEach((subtask, index) => {
            const checkbox = document.getElementById(`subtask-${index}`);
            if (checkbox && checkbox.checked) {
                const subtaskData = {
                    id: this.generateTaskId(),
                    title: subtask.title,
                    description: `Sous-tâche de: ${title}\n\nContexte: ${analysis.summary}`,
                    priority: subtask.priority,
                    dueDate: dueDate,
                    status: 'todo',
                    parentTaskId: mainTask.id,
                    emailId: emailId,
                    category: email.category || 'other',
                    createdAt: new Date().toISOString(),
                    aiGenerated: true,
                    hasEmail: true,
                    emailContent: `Sous-tâche de: ${title}\n\nContexte: ${analysis.summary}`
                };
                
                // Create subtask - it will inherit email data
                const createdSubtask = window.taskManager.createTask(subtaskData);
                selectedSubtasks.push(createdSubtask);
            }
        });
        
        window.taskManager.saveTasks();
        this.createdTasks.set(emailId, mainTask.id);
        
        this.closeTaskModal();
        window.uiManager.showToast(`Tâche créée avec succès${selectedSubtasks.length > 0 ? ` (+${selectedSubtasks.length} sous-tâches)` : ''}`, 'success');
        
        // Update email display
        this.renderEmailsList(this.currentViewMode, this.currentCategory);
        
    } catch (error) {
        console.error('Error creating task:', error);
        window.uiManager.showToast('Erreur lors de la création', 'error');
    }
}

    // Helper methods
    isGenericReply(reply) {
        const genericPhrases = [
            "j'ai bien reçu votre message",
            "je prends connaissance",
            "je vous reviens rapidement",
            "merci pour votre message",
            "j'accuse réception",
            "bien noté"
        ];
        
        const content = reply.content.toLowerCase();
        return genericPhrases.some(phrase => content.includes(phrase)) && 
               content.length < 300;
    }

    getReplyToneIcon(tone) {
        const icons = {
            formel: '👔',
            informel: '😊',
            urgent: '🚨',
            neutre: '📝',
            amical: '🤝'
        };
        return icons[tone] || '📝';
    }

    getReplyToneLabel(tone) {
        const labels = {
            formel: 'Formel',
            informel: 'Informel',
            urgent: 'Urgent',
            neutre: 'Neutre',
            amical: 'Amical'
        };
        return labels[tone] || 'Neutre';
    }

    getPriorityIcon(priority) {
        const icons = {
            urgent: '🚨',
            high: '⚡',
            medium: '📌',
            low: '📄'
        };
        return icons[priority] || '📌';
    }

    getPriorityLabel(priority) {
        const labels = {
            urgent: 'Urgente',
            high: 'Haute',
            medium: 'Normale',
            low: 'Basse'
        };
        return labels[priority] || 'Normale';
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        
        // Update active button
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Re-render list
        this.renderEmailsList(mode, this.currentCategory);
    }

    // Other existing methods remain unchanged...
    buildCategoryPills(categoryCounts, totalEmails, categories, currentCategory) {
        let pills = `
            <button class="category-pill-compact ${currentCategory === 'all' ? 'active' : ''}" 
                    data-category="all"
                    onclick="window.pageManager.filterByCategory('all')">
                <span>📧</span>
                <span>Tous</span>
                <span class="category-pill-count">${totalEmails}</span>
            </button>
        `;
        
        Object.entries(categories).forEach(([catId, category]) => {
            const count = categoryCounts[catId] || 0;
            if (count > 0) {
                pills += `
                    <button class="category-pill-compact ${currentCategory === catId ? 'active' : ''}" 
                            data-category="${catId}"
                            onclick="window.pageManager.filterByCategory('${catId}')"
                            style="--cat-color: ${category.color}">
                        <span>${category.icon}</span>
                        <span>${category.name}</span>
                        <span class="category-pill-count">${count}</span>
                    </button>
                `;
            }
        });
        
        const otherCount = categoryCounts.other || 0;
        if (otherCount > 0) {
            pills += `
                <button class="category-pill-compact ${currentCategory === 'other' ? 'active' : ''}" 
                        data-category="other"
                        onclick="window.pageManager.filterByCategory('other')">
                    <span>📌</span>
                    <span>Autre</span>
                    <span class="category-pill-count">${otherCount}</span>
                </button>
            `;
        }
        
        return pills;
    }

    createEmailGroups(emails, groupMode) {
        const groups = {};
        
        emails.forEach(email => {
            let groupKey;
            let groupName;
            let groupAvatar;
            
            if (groupMode === 'grouped-domain') {
                const domain = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                groupKey = domain;
                groupName = domain;
                groupAvatar = domain.charAt(0).toUpperCase();
            } else {
                const senderEmail = email.from?.emailAddress?.address || 'unknown';
                const senderName = email.from?.emailAddress?.name || senderEmail;
                groupKey = senderEmail;
                groupName = senderName;
                groupAvatar = senderName.charAt(0).toUpperCase();
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    key: groupKey,
                    name: groupName,
                    avatar: groupAvatar,
                    emails: [],
                    count: 0,
                    latestDate: null
                };
            }
            
            groups[groupKey].emails.push(email);
            groups[groupKey].count++;
            
            const emailDate = new Date(email.receivedDateTime);
            if (!groups[groupKey].latestDate || emailDate > groups[groupKey].latestDate) {
                groups[groupKey].latestDate = emailDate;
            }
        });
        
        return Object.values(groups).sort((a, b) => {
            if (!a.latestDate && !b.latestDate) return 0;
            if (!a.latestDate) return 1;
            if (!b.latestDate) return -1;
            return b.latestDate - a.latestDate;
        });
    }

    renderEmailGroup(group, groupType = 'sender') {
        const displayName = groupType === 'grouped-domain' ? 
            `@${group.name}` : 
            group.name;
            
        const icon = groupType === 'grouped-domain' ? 
            '<i class="fas fa-globe"></i>' : 
            group.avatar;
        
        return `
            <div class="sender-line" data-sender="${group.key}">
                <div class="sender-line-content" 
                     data-group-key="${group.key}">
                    <div class="sender-avatar">
                        ${icon}
                    </div>
                    <div class="sender-info">
                        <div class="sender-name">${displayName}</div>
                    </div>
                    <div class="sender-meta">
                        <span class="sender-count">${group.count}</span>
                        <span class="sender-date">${this.formatEmailDate(group.latestDate)}</span>
                    </div>
                    <div class="sender-toggle">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
                <div class="sender-emails" style="display: none;">
                    <div class="emails-container">
                        ${group.emails.map(email => this.renderCondensedEmailItem(email)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    setupGroupToggles() {
        const senderLines = document.querySelectorAll('.sender-line');
        
        senderLines.forEach((senderLine) => {
            const lineContent = senderLine.querySelector('.sender-line-content');
            
            if (!lineContent) return;
            
            lineContent.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const groupKey = senderLine.dataset.sender;
                this.toggleEmailGroup(groupKey);
            });
        });
    }

    toggleEmailGroup(groupKey) {
        const senderLine = document.querySelector(`[data-sender="${groupKey}"]`);
        if (!senderLine) return;
        
        const emailsContainer = senderLine.querySelector('.sender-emails');
        const toggle = senderLine.querySelector('.sender-toggle i');
        
        if (!emailsContainer || !toggle) return;
        
        const isHidden = emailsContainer.style.display === 'none' || !emailsContainer.style.display;
        
        if (isHidden) {
            emailsContainer.style.display = 'block';
            toggle.classList.remove('fa-chevron-right');
            toggle.classList.add('fa-chevron-down');
            senderLine.classList.add('expanded');
        } else {
            emailsContainer.style.display = 'none';
            toggle.classList.remove('fa-chevron-down');
            toggle.classList.add('fa-chevron-right');
            senderLine.classList.remove('expanded');
        }
    }
// Remplacer dans PageManager.js
showEmailModal(emailId) {
    const email = this.getEmailById(emailId);
    if (!email) return;

    // Nettoyer tout modal existant
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    
    // Créer un nouvel id unique
    const uniqueId = 'email_modal_' + Date.now();

    // Créer le modal avec style inline pour forcer l'affichage
    const modalHTML = `
        <div id="${uniqueId}" 
             style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                    z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                    padding: 20px; backdrop-filter: blur(4px);">
            <div style="background: white; border-radius: 12px; max-width: 800px; width: 100%; 
                       max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 20px;">Email Complet</h2>
                    <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                            style="background: none; border: none; font-size: 20px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 20px; overflow-y: auto; flex: 1;">
                    <div style="margin-bottom: 20px;">
                        <div style="margin-bottom: 10px;">
                            <span style="font-weight: bold;">De:</span>
                            <span>${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</span>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <span style="font-weight: bold;">Date:</span>
                            <span>${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <span style="font-weight: bold;">Sujet:</span>
                            <span>${email.subject || 'Sans sujet'}</span>
                        </div>
                    </div>
                    <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb;">
                        ${this.getEmailContent(email)}
                    </div>
                </div>
                <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                            style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                        Fermer
                    </button>
                    ${!this.createdTasks.has(emailId) ? `
                        <button onclick="document.getElementById('${uniqueId}').remove(); window.pageManager.showTaskCreationModal('${emailId}');"
                                style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-tasks"></i> Créer une tâche
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Ajouter au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// Simplifier la fonction de fermeture
closeEmailModal() {
    document.querySelectorAll('[id^="email_modal_"]').forEach(el => el.remove());
    document.body.style.overflow = 'auto';
}

    closeEmailModal() {
        const modal = document.getElementById('emailDetailModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    closeTaskModal() {
        const modal = document.getElementById('taskCreationModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // =====================================
    // SELECTION MANAGEMENT
    // =====================================
    toggleEmailSelection(emailId) {
        if (this.selectedEmails.has(emailId)) {
            this.selectedEmails.delete(emailId);
        } else {
            this.selectedEmails.add(emailId);
        }
        
        // Re-render emails page to update header
        this.renderEmails(document.getElementById('pageContent'));
    }

    clearSelection() {
        this.selectedEmails.clear();
        this.renderEmails(document.getElementById('pageContent'));
    }

async createTasksFromSelection() {
    if (this.selectedEmails.size === 0) return;
    
    let created = 0;
    
    for (const emailId of this.selectedEmails) {
        const email = this.getEmailById(emailId);
        if (!email || this.createdTasks.has(emailId)) continue;
        
        // Get analysis
        let analysis = this.aiAnalysisResults.get(emailId);
        if (!analysis) {
            try {
                analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                this.aiAnalysisResults.set(emailId, analysis);
            } catch (error) {
                continue;
            }
        }
        
        // Extract sender info
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || 'unknown';
        
        // Create task data
        const taskData = {
            id: this.generateTaskId(),
            title: analysis.mainTask.title,
            description: analysis.mainTask.description,
            priority: analysis.mainTask.priority,
            dueDate: analysis.mainTask.dueDate,
            status: 'todo',
            emailId: emailId,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            aiGenerated: true,
            
            // Email details
            emailFrom: senderEmail,
            emailFromName: senderName,
            emailSubject: email.subject,
            emailDomain: senderDomain,
            emailDate: email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            
            // AI Analysis
            aiAnalysis: analysis,
            
            // Tags
            tags: [
                senderDomain,
                analysis.importance,
                ...(analysis.tags || [])
            ].filter(Boolean)
        };
        
        // Use createTaskFromEmail to ensure email content is preserved
        const task = window.taskManager.createTaskFromEmail(taskData, email);
        this.createdTasks.set(emailId, task.id);
        created++;
    }
    
    if (created > 0) {
        window.taskManager.saveTasks();
        window.uiManager.showToast(`${created} tâches créées`, 'success');
        this.clearSelection();
    }
}

    async copyReply(emailId, replyIndex) {
        const analysis = this.aiAnalysisResults.get(emailId);
        const reply = analysis?.suggestedReplies?.[replyIndex];
        
        if (!reply) return;

        const text = `Objet: ${reply.subject}\n\n${reply.content}`;
        
        try {
            await navigator.clipboard.writeText(text);
            window.uiManager.showToast('Réponse copiée', 'success');
        } catch (error) {
            window.uiManager.showToast('Erreur de copie', 'error');
        }
    }

    // =====================================
    // HELPERS
    // =====================================
    getEmailById(emailId) {
        const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
        return emails.find(e => e.id === emailId);
    }

    getEmailContent(email) {
        if (email.body?.content) {
            return email.body.content;
        }
        return `<p>${email.bodyPreview || 'Aucun contenu'}</p>`;
    }

    formatEmailDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}h`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }

    getCategoryInfo(categoryId) {
        if (categoryId === 'other') {
            return { name: 'Autre', icon: '📌', color: '#6B7280' };
        }
        
        const category = window.categoryManager?.getCategory(categoryId);
        if (category) {
            return {
                name: category.name,
                icon: category.icon,
                color: category.color
            };
        }
        
        return { name: categoryId, icon: '📂', color: '#6B7280' };
    }

    calculateCategoryCounts(emails) {
        const counts = {};
        emails.forEach(email => {
            const cat = email.category || 'other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }

    matchesSearch(email, searchTerm) {
        if (!searchTerm) return true;
        
        const search = searchTerm.toLowerCase();
        const subject = (email.subject || '').toLowerCase();
        const sender = (email.from?.emailAddress?.name || '').toLowerCase();
        const senderEmail = (email.from?.emailAddress?.address || '').toLowerCase();
        const preview = (email.bodyPreview || '').toLowerCase();
        
        return subject.includes(search) || 
               sender.includes(search) || 
               senderEmail.includes(search) || 
               preview.includes(search);
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    getTemporaryEmails() {
        return this.temporaryEmailStorage || [];
    }

    openCreatedTask(emailId) {
        const taskId = this.createdTasks.get(emailId);
        if (!taskId) return;
        
        this.loadPage('tasks').then(() => {
            setTimeout(() => {
                if (window.tasksView?.showTaskDetails) {
                    window.tasksView.showTaskDetails(taskId);
                }
            }, 100);
        });
    }

    async analyzeFirstEmails(emails) {
        for (const email of emails) {
            if (!this.aiAnalysisResults.has(email.id)) {
                try {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email, {
                        useApi: false,
                        quickMode: true
                    });
                    this.aiAnalysisResults.set(email.id, analysis);
                } catch (error) {
                    console.error('Auto-analysis error:', error);
                }
            }
        }
        
        // Update display
        const currentCategory = document.querySelector('.category-pill-compact.active')?.dataset.category || 'all';
        this.renderEmailsList(this.currentViewMode, currentCategory);
    }

    // =====================================
    // EVENT HANDLERS
    // =====================================
    setupEmailsEventListeners() {
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    }

    handleSearch(term) {
        this.searchTerm = term.trim();
        const currentCategory = document.querySelector('.category-pill-compact.active')?.dataset.category || 'all';
        this.renderEmailsList(this.currentViewMode, currentCategory);
        
        const clearBtn = document.getElementById('searchClearBtn');
        if (clearBtn) {
            clearBtn.style.display = this.searchTerm ? 'flex' : 'none';
        }
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('emailSearchInput');
        if (searchInput) searchInput.value = '';
        const currentCategory = document.querySelector('.category-pill-compact.active')?.dataset.category || 'all';
        this.renderEmailsList(this.currentViewMode, currentCategory);
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        
        document.querySelectorAll('.category-pill-compact').forEach(pill => {
            pill.classList.remove('active');
        });
        
        const activePill = document.querySelector(`[data-category="${categoryId}"]`);
        if (activePill) {
            activePill.classList.add('active');
        }
        
        this.renderEmailsList(this.currentViewMode, categoryId);
    }

    async refreshEmails() {
        window.uiManager.showLoading('Actualisation...');
        
        try {
            const emails = window.emailScanner?.getAllEmails() || this.getTemporaryEmails() || [];
            
            if (emails.length > 0 && window.categoryManager) {
                // Re-categorize emails
                emails.forEach(email => {
                    const result = window.categoryManager.analyzeEmail(email);
                    email.category = result.category || 'other';
                });
            }
            
            await this.loadPage('emails');
            window.uiManager.showToast('Emails actualisés', 'success');
            
        } catch (error) {
            window.uiManager.hideLoading();
            window.uiManager.showToast('Erreur d\'actualisation', 'error');
        }
    }

    showEmailDetails(emailId) {
        this.showEmailModal(emailId);
    }

    // =====================================
    // DASHBOARD
    // =====================================
    async renderDashboard(container) {
        const scanData = this.lastScanData;
        const taskStats = window.taskManager?.getStats() || {
            total: 0,
            byStatus: { todo: 0, 'in-progress': 0, completed: 0 },
            overdue: 0
        };
        
        const aiConfigured = window.aiTaskAnalyzer?.isConfigured() || false;
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Tableau de bord</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i> Nouveau scan
                    </button>
                </div>
            </div>

            ${!aiConfigured ? `
                <div class="ai-banner">
                    <div class="ai-banner-icon"><i class="fas fa-magic"></i></div>
                    <div class="ai-banner-content">
                        <h3>Activez l'IA pour des suggestions intelligentes</h3>
                        <p>Configurez Claude AI pour analyser vos emails automatiquement</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                        Configurer
                    </button>
                </div>
            ` : ''}

            <div class="grid grid-4">
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-tasks',
                    label: 'Tâches totales',
                    value: taskStats.total,
                    color: 'var(--primary)'
                })}
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-clock',
                    label: 'À faire',
                    value: taskStats.byStatus.todo,
                    color: 'var(--info)'
                })}
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-check-circle',
                    label: 'Terminées',
                    value: taskStats.byStatus.completed,
                    color: 'var(--success)'
                })}
                ${window.uiManager.createStatCard({
                    icon: 'fas fa-exclamation-circle',
                    label: 'En retard',
                    value: taskStats.overdue,
                    color: 'var(--danger)'
                })}
            </div>

            ${scanData ? this.renderScanStats(scanData) : this.renderWelcome()}
        `;
    }

    renderWelcome() {
        return `
            <div class="card">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-envelope-open-text"></i>
                    </div>
                    <h2 class="empty-state-title">Bienvenue!</h2>
                    <p class="empty-state-text">
                        Commencez par scanner vos emails pour les organiser automatiquement.
                    </p>
                    <button class="btn btn-primary btn-large" onclick="window.pageManager.loadPage('scanner')">
                        <i class="fas fa-search"></i> Démarrer le scan
                    </button>
                </div>
            </div>
        `;
    }

    renderScanStats(scanData) {
        const categories = window.categoryManager?.getCategories() || {};
        
        let html = `
            <div class="card">
                <h3>Résultats du dernier scan</h3>
                <div class="scan-stats">
                    <p>${scanData.total} emails analysés - ${scanData.categorized} catégorisés</p>
                </div>
            </div>
        `;
        
        return html;
    }

async renderScanner(container) {
    console.log('[PageManager] Rendering scanner page...');
    
    // Vérifier si le module ScanStart moderne est disponible et correctement initialisé
    if (window.scanStartModule && 
        typeof window.scanStartModule.render === 'function' && 
        window.scanStartModule.stylesAdded) {
        
        try {
            console.log('[PageManager] Using modern ScanStartModule');
            await window.scanStartModule.render(container);
            return;
        } catch (error) {
            console.error('[PageManager] Error with ScanStartModule, falling back:', error);
        }
    }
    
    // Si le module moderne n'est pas disponible, attendre un peu et réessayer
    if (window.scanStartModule && !window.scanStartModule.stylesAdded) {
        console.log('[PageManager] ScanStartModule detected but not ready, waiting...');
        
        // Attendre que le module soit prêt
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts && (!window.scanStartModule.stylesAdded || !window.scanStartModule.isInitialized)) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        // Réessayer après l'attente
        if (window.scanStartModule.stylesAdded && typeof window.scanStartModule.render === 'function') {
            try {
                console.log('[PageManager] Using ScanStartModule after wait');
                await window.scanStartModule.render(container);
                return;
            } catch (error) {
                console.error('[PageManager] Error with ScanStartModule after wait:', error);
            }
        }
    }
    
    // Fallback au scanner basique du PageManager
    console.log('[PageManager] Using fallback scanner interface');
    this.renderBasicScanner(container);
}

renderBasicScanner(container) {
    container.innerHTML = `
        <div class="scanner-container">
            <div class="scanner-card">
                <div class="scanner-header">
                    <div class="scanner-icon" id="scannerIcon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h1 class="scanner-title">Scanner d'emails</h1>
                    <p class="scanner-subtitle">Analysez et organisez vos emails intelligemment</p>
                </div>

                <div class="scanner-body">
                    <!-- Configuration simple -->
                    <div class="scan-controls">
                        <div class="control-group">
                            <label class="control-label">
                                <i class="fas fa-calendar-alt"></i> Période à analyser
                            </label>
                            <select class="control-select" id="scanDays">
                                <option value="7" selected>7 derniers jours</option>
                                <option value="30">30 derniers jours</option>
                                <option value="90">90 derniers jours</option>
                            </select>
                        </div>
                        
                        <div class="control-group">
                            <label class="control-label">
                                <i class="fas fa-folder"></i> Dossier à scanner
                            </label>
                            <select class="control-select" id="scanFolder">
                                <option value="inbox" selected>Boîte de réception</option>
                                <option value="junkemail">Courrier indésirable</option>
                            </select>
                        </div>
                    </div>

                    <!-- Bouton de scan -->
                    <div class="scan-button-container">
                        <button class="scan-button" id="startScanBtn" onclick="window.pageManager.startBasicScan()">
                            <i class="fas fa-search-plus"></i> 
                            <span>Démarrer le scan</span>
                        </button>
                    </div>
                    
                    <!-- Guide rapide -->
                    <div class="scan-info">
                        <div class="info-card">
                            <div class="info-icon">💡</div>
                            <div class="info-content">
                                <h4>Commencez par 7 jours</h4>
                                <p>Idéal pour un premier scan rapide et efficace</p>
                            </div>
                        </div>
                        <div class="info-card">
                            <div class="info-icon">🎯</div>
                            <div class="info-content">
                                <h4>Classification automatique</h4>
                                <p>Vos emails seront organisés par catégorie</p>
                            </div>
                        </div>
                    </div>

                    <!-- Section de progression -->
                    <div class="progress-section" id="progressSection">
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="progressBar" style="width: 0%"></div>
                        </div>
                        <div class="progress-message" id="progressMessage">En attente...</div>
                        <div class="progress-details" id="progressDetails"></div>
                    </div>
                </div>
                
                <!-- Footer avec info -->
                <div class="scanner-footer">
                    <div class="scanner-note">
                        <i class="fas fa-shield-alt"></i>
                        <span>Connexion sécurisée via Microsoft Graph API</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter les styles pour le scanner de base
    this.addBasicScannerStyles();
}


async startBasicScan() {
    const days = parseInt(document.getElementById('scanDays').value);
    const folder = document.getElementById('scanFolder').value;
    const btn = document.getElementById('startScanBtn');
    const progressSection = document.getElementById('progressSection');
    const scannerIcon = document.getElementById('scannerIcon');

    // Vérifier l'authentification
    if (!window.authService?.isAuthenticated()) {
        window.uiManager.showToast('Veuillez vous connecter d\'abord', 'warning');
        return;
    }

    // Désactiver le bouton et afficher la progression
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Scan en cours...</span>';
    progressSection.classList.add('active');
    scannerIcon.classList.add('scanning');

    try {
        let results;
        
        // Utiliser emailScanner si disponible
        if (window.emailScanner && window.mailService) {
            console.log('[PageManager] Starting scan with EmailScanner');
            
            results = await window.emailScanner.scan({
                days,
                folder,
                onProgress: (progress) => {
                    this.updateBasicScanProgress(progress);
                }
            });
            
        } else if (window.scanStartModule?.startScanProgrammatically) {
            // Essayer d'utiliser le module moderne en mode programmatique
            console.log('[PageManager] Using ScanStartModule programmatically');
            
            results = await window.scanStartModule.startScanProgrammatically({
                days,
                folders: [folder],
                autoClassify: true,
                autoCreateTasks: false
            });
            
        } else {
            // Mode démo si aucun service n'est disponible
            console.log('[PageManager] Running in demo mode');
            
            this.updateBasicScanProgress({ 
                progress: { current: 0, total: 30 }, 
                message: 'Génération d\'emails de démonstration...' 
            });
            
            // Simuler un scan
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            results = {
                emails: this.generateDemoEmails(30),
                total: 30,
                stats: { processed: 30, errors: 0 }
            };
            
            this.updateBasicScanProgress({ 
                progress: { current: 30, total: 30 }, 
                message: 'Scan de démonstration terminé' 
            });
        }

        // Traiter les résultats
        if (results && results.emails) {
            // Classification automatique
            if (window.categoryManager) {
                console.log('[PageManager] Categorizing emails...');
                this.updateBasicScanProgress({ 
                    message: 'Classification des emails...' 
                });
                
                results.emails.forEach(email => {
                    const catResult = window.categoryManager.analyzeEmail(email);
                    email.category = catResult.category || 'other';
                });
            }

            // Sauvegarder les résultats
            this.temporaryEmailStorage = results.emails;
            this.lastScanData = {
                total: results.total || results.emails.length,
                categorized: results.emails.filter(e => e.category && e.category !== 'other').length,
                scanTime: new Date().toISOString(),
                duration: results.duration || 0
            };
            
            // Sauvegarder dans emailScanner si disponible
            if (window.emailScanner) {
                window.emailScanner.emails = results.emails;
            }

            // Notification de succès
            window.uiManager.showToast(
                `✅ ${results.emails.length} emails scannés avec succès!`, 
                'success'
            );
            
            // Redirection vers les emails après un délai
            setTimeout(() => {
                this.loadPage('emails');
            }, 1500);

        } else {
            throw new Error('Aucun résultat obtenu du scan');
        }

    } catch (error) {
        console.error('[PageManager] Basic scan error:', error);
        window.uiManager.showToast(`Erreur de scan: ${error.message}`, 'error');
        
        // Restaurer l'interface
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-search-plus"></i> <span>Démarrer le scan</span>';
        progressSection.classList.remove('active');
        scannerIcon.classList.remove('scanning');
    }
}

addBasicScannerStyles() {
    if (document.getElementById('basicScannerStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'basicScannerStyles';
    styles.textContent = `
        .scanner-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 70vh;
            padding: 20px;
        }
        
        .scanner-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            padding: 40px;
            max-width: 600px;
            width: 100%;
            border: 1px solid #e5e7eb;
        }
        
        .scanner-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .scanner-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: white;
            margin: 0 auto 20px;
            transition: all 0.3s ease;
        }
        
        .scanner-icon.scanning {
            animation: scanPulse 2s infinite;
        }
        
        @keyframes scanPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .scanner-title {
            margin: 0 0 8px 0;
            font-size: 28px;
            color: #1f2937;
            font-weight: 700;
        }
        
        .scanner-subtitle {
            margin: 0;
            color: #6b7280;
            font-size: 16px;
        }
        
        .scan-controls {
            margin-bottom: 30px;
        }
        
        .control-group {
            margin-bottom: 20px;
        }
        
        .control-label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }
        
        .control-select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            background: white;
            transition: border-color 0.2s ease;
        }
        
        .control-select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .scan-button-container {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .scan-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            min-width: 200px;
            justify-content: center;
        }
        
        .scan-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .scan-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }
        
        .scan-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 30px;
        }
        
        .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
        }
        
        .info-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }
        
        .info-content h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #1f2937;
            font-weight: 600;
        }
        
        .info-content p {
            margin: 0;
            font-size: 12px;
            color: #6b7280;
            line-height: 1.3;
        }
        
        .progress-section {
            opacity: 0;
            transition: opacity 0.3s ease;
            margin-top: 20px;
        }
        
        .progress-section.active {
            opacity: 1;
        }
        
        .progress-bar-container {
            background: #e5e7eb;
            border-radius: 8px;
            height: 10px;
            overflow: hidden;
            margin-bottom: 12px;
        }
        
        .progress-bar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100%;
            transition: width 0.5s ease;
            border-radius: 8px;
        }
        
        .progress-message {
            text-align: center;
            color: #4b5563;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .progress-details {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        
        .scanner-footer {
            margin-top: 30px;
            text-align: center;
        }
        
        .scanner-note {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            font-size: 13px;
            padding: 8px 16px;
            background: #f9fafb;
            border-radius: 20px;
            border: 1px solid #e5e7eb;
        }
        
        .scanner-note i {
            color: #10b981;
        }
        
        @media (max-width: 640px) {
            .scanner-card {
                padding: 30px 20px;
            }
            
            .scan-info {
                grid-template-columns: 1fr;
            }
            
            .scanner-title {
                font-size: 24px;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

updateBasicScanProgress(progress) {
    const progressBar = document.getElementById('progressBar');
    const progressMessage = document.getElementById('progressMessage');
    const progressDetails = document.getElementById('progressDetails');

    if (progress.progress) {
        const percent = Math.round((progress.progress.current / progress.progress.total) * 100);
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressDetails) progressDetails.textContent = `${progress.progress.current}/${progress.progress.total} emails`;
    }

    if (progress.message && progressMessage) {
        progressMessage.textContent = progress.message;
    }
}


    async startScan() {
        const days = parseInt(document.getElementById('scanDays').value);
        const btn = document.getElementById('startScanBtn');
        const progressSection = document.getElementById('progressSection');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scan en cours...';
        progressSection.classList.add('active');

        try {
            let results;
            
            // Check if we have email service
            if (window.mailService && window.emailScanner) {
                results = await window.emailScanner.scan({
                    days,
                    folder: 'inbox',
                    onProgress: (progress) => {
                        this.updateScanProgress(progress);
                    }
                });
            } else {
                // Demo mode
                results = {
                    emails: this.generateDemoEmails(30),
                    total: 30,
                    stats: { processed: 30, errors: 0 }
                };
                this.updateScanProgress({ progress: { current: 30, total: 30 }, message: 'Scan terminé' });
            }

            // Categorize emails
            if (window.categoryManager && results.emails) {
                results.emails.forEach(email => {
                    const catResult = window.categoryManager.analyzeEmail(email);
                    email.category = catResult.category || 'other';
                });
            }

            // Save results
            this.temporaryEmailStorage = results.emails;
            this.lastScanData = {
                total: results.total,
                categorized: results.emails.filter(e => e.category !== 'other').length,
                scanTime: new Date().toISOString()
            };
            
            if (window.emailScanner) {
                window.emailScanner.emails = results.emails;
            }

            window.uiManager.showToast(`${results.total} emails scannés`, 'success');
            
            setTimeout(() => {
                this.loadPage('emails');
            }, 1000);

        } catch (error) {
            console.error('Scan error:', error);
            window.uiManager.showToast('Erreur de scan', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-search-plus"></i> Scanner';
        }
    }

    updateScanProgress(progress) {
        const progressBar = document.getElementById('progressBar');
        const progressMessage = document.getElementById('progressMessage');

        if (progress.progress) {
            const percent = Math.round((progress.progress.current / progress.progress.total) * 100);
            progressBar.style.width = percent + '%';
        }

        if (progress.message) {
            progressMessage.textContent = progress.message;
        }
    }

    generateDemoEmails(count) {
        const emails = [];
        const subjects = [
            "Newsletter hebdomadaire",
            "Facture à payer",
            "Réunion demain à 14h",
            "Confirmation de commande",
            "Rappel: Document à signer"
        ];
        
        for (let i = 0; i < count; i++) {
            emails.push({
                id: `demo-${i}`,
                subject: subjects[i % subjects.length],
                bodyPreview: "Ceci est un email de démonstration...",
                from: {
                    emailAddress: {
                        name: `Contact ${i}`,
                        address: `contact${i}@example.com`
                    }
                },
                receivedDateTime: new Date(Date.now() - i * 3600000).toISOString(),
                hasAttachments: Math.random() > 0.7,
                category: 'other'
            });
        }
        
        return emails;
    }

    // =====================================
    // OTHER PAGES
    // =====================================
    async renderTasks(container) {
        if (window.tasksView && window.tasksView.render) {
            window.tasksView.render(container);
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>Tâches</h1>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3 class="empty-state-title">Aucune tâche</h3>
                    <p class="empty-state-text">Créez des tâches à partir de vos emails</p>
                </div>
            `;
        }
    }

    async renderCategories(container) {
        const categories = window.categoryManager?.getCategories() || {};
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Catégories</h1>
            </div>
            
            <div class="categories-grid">
                ${Object.entries(categories).map(([id, cat]) => `
                    <div class="card category-card">
                        <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color}">
                            ${cat.icon}
                        </div>
                        <h3>${cat.name}</h3>
                        <p>${cat.description || ''}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

async renderSettings(container) {
    // Utiliser CategoriesPage pour la page Paramètres
    if (window.categoriesPage) {
        window.categoriesPage.render(container);
    } else {
        // Fallback si CategoriesPage n'est pas chargé
        container.innerHTML = `
            <div class="page-header">
                <h1>Paramètres</h1>
            </div>
            
            <div class="card">
                <h3>Configuration IA</h3>
                <button class="btn btn-primary" onclick="window.aiTaskAnalyzer?.showConfigurationModal()">
                    <i class="fas fa-cog"></i> Configurer Claude AI
                </button>
            </div>
            
            <div class="card">
                <h3>Gestion des Catégories</h3>
                <p>Le module de gestion avancée des catégories n'est pas chargé.</p>
            </div>
        `;
    }
}

    // =====================================
    // STYLES
    // =====================================
    addEmailStyles() {
        if (document.getElementById('emailPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'emailPageStyles';
        styles.textContent = `
            /* Condensed Email View */
            .emails-condensed-list {
                display: flex;
                flex-direction: column;
                gap: 2px;
                background: #f9fafb;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .email-condensed {
                display: flex;
                align-items: center;
                background: white;
                padding: 12px 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .email-condensed:last-child {
                border-bottom: none;
            }
            
            .email-condensed:hover {
                background: #f9fafb;
            }
            
            .email-condensed.selected {
                background: #eff6ff;
                border-left: 3px solid #3b82f6;
            }
            
            .email-checkbox-condensed {
                margin-right: 12px;
                cursor: pointer;
            }
            
            .sender-avatar-condensed {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .email-content-condensed {
                flex: 1;
                min-width: 0;
            }
            
            .email-line-one {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2px;
            }
            
            .sender-name-condensed {
                font-weight: 600;
                color: #1f2937;
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-right: 8px;
            }
            
            .email-date-condensed {
                font-size: 12px;
                color: #6b7280;
                flex-shrink: 0;
            }
            
            .email-subject-condensed {
                font-size: 13px;
                color: #4b5563;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .email-actions-condensed {
                margin-left: 12px;
                display: flex;
                align-items: center;
            }
            
            .task-created-icon {
                color: #10b981;
                font-size: 18px;
            }
            
            .create-task-icon {
                color: #6b7280;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .create-task-icon:hover {
                color: #10b981;
                transform: scale(1.1);
            }
            
            /* Detailed Email View (existing styles) */
            .email-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .email-item {
                display: flex;
                align-items: center;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                transition: all 0.2s ease;
            }
            
            .email-item:hover {
                border-color: #d1d5db;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .email-item.selected {
                background: #f3f4f6;
                border-color: #667eea;
            }
            
            .email-item.has-ai {
                border-left: 3px solid #667eea;
            }
            
            .email-selection {
                margin-right: 12px;
            }
            
            .email-main {
                flex: 1;
                cursor: pointer;
                min-width: 0;
            }
            
            .email-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
            }
            
            .email-sender {
                font-weight: 600;
                color: #1f2937;
            }
            
            .email-date {
                font-size: 12px;
                color: #6b7280;
            }
            
            .email-subject {
                font-weight: 500;
                color: #374151;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .email-preview {
                font-size: 13px;
                color: #6b7280;
                margin-bottom: 8px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .email-footer {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .category-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .ai-badge, .task-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .ai-badge {
                background: #e0e7ff;
                color: #4338ca;
            }
            
            .task-badge {
                background: #d1fae5;
                color: #065f46;
            }
            
            .email-actions {
                display: flex;
                gap: 8px;
                margin-left: 12px;
            }
            
            .email-action-btn {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
            }
            
            .email-action-btn:hover {
                transform: scale(1.05);
            }
            
            .email-action-btn:first-child {
                background: #6b7280;
                color: white;
            }
            
            .email-action-btn:first-child:hover {
                background: #4b5563;
            }
            
            .email-action-btn.create-task {
                background: #10b981;
                color: white;
            }
            
            .email-action-btn.create-task:hover {
                background: #059669;
            }
            
            .email-action-btn.task-created {
                background: #3b82f6;
                color: white;
            }
            
            .email-action-btn.task-created:hover {
                background: #2563eb;
            }
            
            /* Task Creation Modal - Structured Sections */
            .task-sections-container {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin: 20px 0;
            }
            
            .task-section {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .task-section.attention-section {
                background: #fef3c7;
                border-color: #fbbf24;
            }
            
            .section-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: white;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .attention-section .section-header {
                background: #fef9e8;
                border-bottom-color: #fbbf24;
            }
            
            .section-header i {
                font-size: 16px;
                color: #6b7280;
            }
            
            .attention-section .section-header i {
                color: #f59e0b;
            }
            
            .section-header h4 {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .section-content {
                padding: 16px;
            }
            
            .section-textarea {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 13px;
                line-height: 1.5;
                resize: vertical;
                min-height: 60px;
            }
            
            .section-textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .actions-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .action-item {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .action-number {
                width: 24px;
                height: 24px;
                background: #667eea;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .action-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 13px;
            }
            
            .action-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .action-deadline {
                font-size: 12px;
                color: #dc2626;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .info-grid {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .info-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 13px;
                color: #374151;
                line-height: 1.4;
            }
            
            .info-item i {
                font-size: 10px;
                color: #9ca3af;
                margin-top: 4px;
            }
            
            .attention-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .attention-item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 6px;
                padding: 10px 12px;
            }
            
            .attention-item i {
                font-size: 14px;
                color: #f59e0b;
                margin-top: 2px;
            }
            
            .attention-item span {
                flex: 1;
                font-size: 13px;
                color: #92400e;
                line-height: 1.4;
            }
            
            
            /* Sender Context Box */
            .sender-context-box {
                display: flex;
                align-items: center;
                gap: 12px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 20px;
            }
            
            .sender-avatar-small {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: 600;
            }
            
            .sender-details {
                flex: 1;
            }
            
            .sender-name-bold {
                font-weight: 700;
                color: #1f2937;
                font-size: 16px;
            }
            
            .sender-email-small {
                font-size: 13px;
                color: #6b7280;
            }
            
            .sender-domain {
                font-size: 12px;
                color: #9ca3af;
                font-weight: 500;
            }
            
            /* Smart Replies Section */
            .smart-replies-section {
                background: #f0f9ff;
                border: 1px solid #7dd3fc;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
            }
            
            .smart-replies-section h4 {
                margin: 0 0 12px 0;
                color: #075985;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 16px;
            }
            
            .smart-reply-card {
                background: white;
                border: 1px solid #bae6fd;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 12px;
            }
            
            .smart-reply-card:last-child {
                margin-bottom: 0;
            }
            
            .reply-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .reply-tone-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .reply-tone-badge.formel {
                background: #e5e7eb;
                color: #374151;
            }
            
            .reply-tone-badge.informel {
                background: #fef3c7;
                color: #92400e;
            }
            
            .reply-tone-badge.urgent {
                background: #fee2e2;
                color: #991b1b;
            }
            
            .reply-tone-badge.neutre {
                background: #e0e7ff;
                color: #4338ca;
            }
            
            .reply-tone-badge.amical {
                background: #d1fae5;
                color: #065f46;
            }
            
            .reply-subject {
                font-size: 13px;
                color: #4b5563;
                margin-bottom: 8px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .reply-preview {
                font-size: 13px;
                color: #374151;
                white-space: pre-wrap;
                line-height: 1.5;
            }
            
            .no-reply-suggestion {
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                text-align: center;
            }
            
            .no-reply-suggestion p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }
            
            /* Separated Tasks Section */
            .separated-tasks-section {
                background: #f0fdf4;
                border: 1px solid #86efac;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
            }
            
            .separated-tasks-section h4 {
                margin: 0 0 8px 0;
                color: #166534;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 16px;
            }
            
            .section-description {
                font-size: 13px;
                color: #15803d;
                margin-bottom: 12px;
            }
            
            .subtasks-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .subtask-item {
                display: flex;
                align-items: center;
                background: white;
                border: 1px solid #bbf7d0;
                border-radius: 6px;
                padding: 10px 12px;
            }
            
            .subtask-item input[type="checkbox"] {
                margin-right: 10px;
            }
            
            .subtask-item label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                cursor: pointer;
            }
            
            .subtask-title {
                color: #15803d;
                font-size: 14px;
            }
            
            .subtask-priority {
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: 600;
            }
            
            .subtask-priority.priority-urgent {
                background: #fee2e2;
                color: #991b1b;
            }
            
            .subtask-priority.priority-high {
                background: #fef3c7;
                color: #92400e;
            }
            
            .subtask-priority.priority-medium {
                background: #e0e7ff;
                color: #4338ca;
            }
            
            .subtask-priority.priority-low {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .section-note {
                font-size: 12px;
                color: #15803d;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            /* Email Context Section */
            .email-context-section {
                margin-top: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .context-toggle-btn {
                width: 100%;
                padding: 12px 16px;
                background: #f9fafb;
                border: none;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-size: 14px;
                color: #4b5563;
                transition: background 0.2s ease;
            }
            
            .context-toggle-btn:hover {
                background: #f3f4f6;
            }
            
            .email-context-content {
                background: white;
                border-top: 1px solid #e5e7eb;
            }
            
            .context-header {
                padding: 12px 16px;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
                color: #4b5563;
            }
            
            .context-body {
                padding: 16px;
                max-height: 300px;
                overflow-y: auto;
                font-size: 14px;
                line-height: 1.5;
                color: #374151;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 6px;
                font-weight: 600;
                color: #374151;
            }
            
            .form-input, .form-select, .form-textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .form-input:focus, .form-select:focus, .form-textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            /* Modal Styles */
   .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000000; /* Valeur ultra haute pour éviter les conflits */
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;
    padding: 20px;
    overflow-y: auto;
}
            
            .modal-container {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
            
            .modal-container.modal-large {
                max-width: 900px;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                color: #1f2937;
            }
            
            .modal-close-btn {
                background: none;
                border: none;
                font-size: 20px;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .modal-close-btn:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            /* View Controls */
            .emails-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 20px 0;
                padding: 0 4px;
            }
            
            .emails-info {
                display: flex;
                gap: 12px;
                color: #6b7280;
                font-size: 14px;
            }
            
            .view-controls {
                display: flex;
                gap: 12px;
            }
            
            .view-mode-group {
                display: flex;
                background: #f3f4f6;
                border-radius: 8px;
                padding: 4px;
                gap: 4px;
            }
            
            .view-mode-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
                font-weight: 500;
            }
            
            .view-mode-btn:hover {
                background: #e5e7eb;
                color: #374151;
            }
            
            .view-mode-btn.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .btn-text {
                display: inline;
            }
            
            @media (max-width: 640px) {
                .btn-text {
                    display: none;
                }
            }
            
            /* Grouped View Styles */
            .senders-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .sender-line {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.2s ease;
            }
            
            .sender-line:hover {
                border-color: #d1d5db;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .sender-line.expanded {
                border-color: #667eea;
            }
            
            .sender-line-content {
                display: flex;
                align-items: center;
                padding: 16px;
                cursor: pointer;
                user-select: none;
            }
            
            .sender-avatar {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 16px;
                margin-right: 12px;
            }
            
            .sender-info {
                flex: 1;
            }
            
            .sender-name {
                font-weight: 600;
                color: #1f2937;
                font-size: 15px;
            }
            
            .sender-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-right: 12px;
            }
            
            .sender-count {
                background: #f3f4f6;
                color: #4b5563;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .sender-date {
                color: #6b7280;
                font-size: 13px;
            }
            
            .sender-toggle {
                color: #6b7280;
                font-size: 14px;
                transition: transform 0.2s ease;
            }
            
            .sender-emails {
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
            }
            
            .emails-container {
                padding: 8px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            /* Category Pills */
            .category-pills-container {
                margin: 20px 0;
            }
            
            .category-pills-row {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .category-pill-compact {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
            }
            
            .category-pill-compact:hover {
                border-color: var(--cat-color, #667eea);
                background: var(--cat-color, #667eea)10;
            }
            
            .category-pill-compact.active {
                background: var(--cat-color, #667eea);
                color: white;
                border-color: var(--cat-color, #667eea);
            }
            
            .category-pill-count {
                background: rgba(0,0,0,0.1);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }
            
            /* AI Banner */
            .ai-banner {
                display: flex;
                align-items: center;
                gap: 16px;
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid #fbbf24;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
            }
            
            .ai-banner-icon {
                font-size: 48px;
                color: #f59e0b;
            }
            
            .ai-banner-content h3 {
                margin: 0 0 4px 0;
                color: #92400e;
            }
            
            .ai-banner-content p {
                margin: 0;
                color: #78350f;
            }
            
            /* Scanner Styles */
            .scanner-container {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 600px;
            }
            
            .scanner-card {
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                padding: 40px;
                max-width: 600px;
                width: 100%;
            }
            
            .scanner-header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .scanner-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                color: white;
                margin: 0 auto 20px;
            }
            
            .scanner-icon.scanning {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .scanner-title {
                margin: 0 0 8px 0;
                font-size: 28px;
                color: #1f2937;
            }
            
            .scanner-subtitle {
                margin: 0;
                color: #6b7280;
            }
            
            .scan-controls {
                margin-bottom: 30px;
            }
            
            .control-group {
                margin-bottom: 20px;
            }
            
            .control-label {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                font-weight: 600;
                color: #374151;
            }
            
            .control-select {
                width: 100%;
                padding: 10px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
            }
            
            .scan-button-container {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .scan-button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 16px 32px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .scan-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
            }
            
            .scan-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .progress-section {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .progress-section.active {
                opacity: 1;
            }
            
            .progress-bar-container {
                background: #e5e7eb;
                border-radius: 8px;
                height: 8px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            
            .progress-bar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100%;
                transition: width 0.3s ease;
            }
            
            .progress-message {
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            
            /* Categories Page */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .category-card {
                text-align: center;
                padding: 30px;
            }
            
            .category-card .category-icon {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                margin: 0 auto 20px;
            }
            
            .category-card h3 {
                margin: 0 0 8px 0;
                color: #1f2937;
            }
            
            .category-card p {
                margin: 0;
                color: #6b7280;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Create global instance
window.pageManager = new PageManager();

// Bind methods
Object.getOwnPropertyNames(PageManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.pageManager[name] === 'function') {
        window.pageManager[name] = window.pageManager[name].bind(window.pageManager);
    }
});

console.log('✅ PageManager v9.0 loaded - Optimized with condensed display');
