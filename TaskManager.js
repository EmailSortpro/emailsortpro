// TaskManager Pro - Système unifié de gestion des tâches avec emails intégrés
// Version 6.1 - Interface ergonomique avec filtres corrigés et meilleure lisibilité

// =====================================
// TASK MANAGER CLASS
// =====================================
class TaskManager {
    constructor() {
        this.tasks = [];
        this.initialized = false;
        this.selectedTasks = new Set();
        this.init();
    }

    async init() {
        try {
            console.log('[TaskManager] Initializing v6.1...');
            await this.loadTasks();
            this.initialized = true;
            console.log('[TaskManager] Initialization complete with', this.tasks.length, 'tasks');
        } catch (error) {
            console.error('[TaskManager] Initialization error:', error);
            this.tasks = [];
            this.initialized = true;
        }
    }

    async loadTasks() {
        try {
            const saved = localStorage.getItem('emailsort_tasks');
            if (saved) {
                this.tasks = JSON.parse(saved);
                console.log(`[TaskManager] Loaded ${this.tasks.length} tasks from storage`);
            } else {
                console.log('[TaskManager] No saved tasks found');
                this.tasks = [];
            }
        } catch (error) {
            console.error('[TaskManager] Error loading tasks:', error);
            this.tasks = [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('emailsort_tasks', JSON.stringify(this.tasks));
            console.log(`[TaskManager] Saved ${this.tasks.length} tasks`);
            return true;
        } catch (error) {
            console.error('[TaskManager] Error saving tasks:', error);
            return false;
        }
    }

    createTask(taskData) {
        console.log('[TaskManager] Creating task with data:', taskData);
        
        // Extraire le contenu email complet - UNIFIÉ avec PageManager
        let emailContent = '';
        let emailContentType = 'text';
        let emailFullHtml = null;
        
        // 1. Si on a un objet email complet (depuis PageManager)
        if (taskData.email) {
            if (taskData.email.body?.content) {
                emailContent = taskData.email.body.content;
                emailContentType = taskData.email.body.contentType || 'html';
                emailFullHtml = taskData.email.body.content;
            } else if (taskData.email.bodyPreview) {
                emailContent = taskData.email.bodyPreview;
            }
        }
        
        // 2. Vérifier les propriétés directes (emailHtml prioritaire)
        if (taskData.emailHtml) {
            emailFullHtml = taskData.emailHtml;
            emailContent = taskData.emailHtml;
            emailContentType = 'html';
        } else if (taskData.emailFullHtml) {
            emailFullHtml = taskData.emailFullHtml;
            emailContent = taskData.emailFullHtml;
            emailContentType = 'html';
        }
        
        // 3. Si pas encore de contenu, utiliser les autres sources
        if (!emailContent) {
            // Chercher dans emailDetails
            if (taskData.emailDetails?.body) {
                emailContent = taskData.emailDetails.body;
                if (taskData.emailDetails.fullHtml) {
                    emailFullHtml = taskData.emailDetails.fullHtml;
                    emailContentType = 'html';
                }
            } else if (taskData.emailBody?.content) {
                emailContent = taskData.emailBody.content;
                emailContentType = taskData.emailBody.contentType || 'text';
                if (emailContentType === 'html') {
                    emailFullHtml = taskData.emailBody.content;
                }
            } else if (taskData.emailContent) {
                emailContent = taskData.emailContent;
            } else if (taskData.emailBodyPreview) {
                emailContent = taskData.emailBodyPreview;
            }
        }
        
        // 4. Si on n'a toujours pas de HTML mais que le contenu semble être du HTML
        if (!emailFullHtml && emailContent && this.isHtmlContent(emailContent)) {
            emailFullHtml = emailContent;
            emailContentType = 'html';
        }
        
        // 5. Extraire depuis aiAnalysis si disponible
        if (!emailContent && taskData.aiAnalysis?.emailMetadata?.fullContent) {
            emailContent = taskData.aiAnalysis.emailMetadata.fullContent;
            if (this.isHtmlContent(emailContent)) {
                emailFullHtml = emailContent;
                emailContentType = 'html';
            }
        }
        
        const task = {
            id: taskData.id || this.generateId(),
            title: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'other',
            
            // Email info complète - UNIFIÉ
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || taskData.emailDetails?.fromEmail || taskData.emailDetails?.from || null,
            emailFromName: taskData.emailFromName || taskData.emailDetails?.from || taskData.emailDetails?.fromName || null,
            emailSubject: taskData.emailSubject || taskData.emailDetails?.subject || null,
            emailDomain: this.extractDomain(taskData.emailFrom || taskData.emailDetails?.fromEmail),
            
            // Contenu email complet - PROPRIÉTÉS UNIFIÉES
            emailContent: emailContent,
            emailContentType: emailContentType,
            emailFullHtml: emailFullHtml,
            emailHtml: emailFullHtml, // Pour compatibilité
            emailBodyType: emailContentType, // Pour compatibilité
            
            // Métadonnées email
            hasEmail: !!(taskData.emailId || taskData.emailDetails || taskData.emailFrom || emailContent),
            emailReplied: false,
            emailDate: taskData.emailDate || taskData.emailDetails?.date || taskData.createdAt,
            hasAttachments: taskData.hasAttachments || taskData.emailDetails?.hasAttachments || taskData.emailHasAttachments || false,
            
            // AI Analysis complète
            aiAnalysis: taskData.aiAnalysis || null,
            aiGenerated: taskData.aiGenerated || false,
            
            // Sections structurées (depuis PageManager)
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            
            // Tags et metadata
            tags: taskData.tags || [],
            client: taskData.client || this.extractClient(taskData),
            
            // Timestamps
            createdAt: taskData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // Méthode de création
            method: taskData.method || 'manual',
            
            // Référence à l'email original si disponible
            originalEmail: taskData.email || taskData.originalEmail || null
        };
        
        console.log('[TaskManager] Created task with email content:', {
            hasContent: !!task.emailContent,
            hasHtml: !!task.emailFullHtml,
            contentLength: task.emailContent?.length || 0,
            htmlLength: task.emailFullHtml?.length || 0,
            bodyType: task.emailContentType,
            hasOriginalEmail: !!task.originalEmail
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        return task;
    }
    
    // Méthode helper pour détecter si le contenu est du HTML
    isHtmlContent(content) {
        if (!content) return false;
        
        // Patterns HTML courants
        const htmlPatterns = [
            /<html[^>]*>/i,
            /<body[^>]*>/i,
            /<div[^>]*>/i,
            /<p[^>]*>/i,
            /<br[^>]*>/i,
            /<img[^>]*>/i,
            /<table[^>]*>/i,
            /<span[^>]*>/i,
            /<a\s+href=/i
        ];
        
        return htmlPatterns.some(pattern => pattern.test(content));
    }
    
    // Méthode pour créer une tâche depuis PageManager avec l'email complet
    createTaskFromEmail(taskData, email) {
        console.log('[TaskManager] Creating task from email:', email);
        
        // Extraire le contenu complet de l'email
        let emailContent = '';
        let emailHtml = null;
        let emailContentType = 'text';
        
        // Récupérer le contenu depuis l'objet email
        if (email && email.body?.content) {
            emailContent = email.body.content;
            emailHtml = email.body.content;
            emailContentType = email.body.contentType || 'html';
        } else if (email && email.bodyPreview) {
            emailContent = email.bodyPreview;
        }
        
        // S'assurer que l'email complet est passé avec le bon format
        const enhancedTaskData = {
            ...taskData,
            email: email, // L'objet email complet
            originalEmail: email, // Garder une référence à l'email original
            emailId: email?.id || taskData.emailId,
            emailFrom: email?.from?.emailAddress?.address || taskData.emailFrom,
            emailFromName: email?.from?.emailAddress?.name || taskData.emailFromName,
            emailSubject: email?.subject || taskData.emailSubject,
            emailDate: email?.receivedDateTime || taskData.emailDate,
            hasAttachments: email?.hasAttachments || taskData.hasAttachments || false,
            // Passer explicitement le contenu complet
            emailContent: emailContent || taskData.emailContent || '',
            emailHtml: emailHtml,
            emailFullHtml: emailHtml,
            emailContentType: emailContentType,
            emailBodyType: emailContentType,
            // S'assurer que le flag hasEmail est correct
            hasEmail: true
        };
        
        return this.createTask(enhancedTaskData);
    }

    updateTask(id, updates) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) return null;
        
        this.tasks[index] = {
            ...this.tasks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        if (updates.status === 'completed' && !this.tasks[index].completedAt) {
            this.tasks[index].completedAt = new Date().toISOString();
        }
        
        this.saveTasks();
        this.emitTaskUpdate('update', this.tasks[index]);
        
        return this.tasks[index];
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) return null;
        
        const deleted = this.tasks.splice(index, 1)[0];
        this.saveTasks();
        this.emitTaskUpdate('delete', deleted);
        
        return deleted;
    }

    deleteTasks(ids) {
        const deletedTasks = [];
        ids.forEach(id => {
            const index = this.tasks.findIndex(task => task.id === id);
            if (index !== -1) {
                deletedTasks.push(this.tasks.splice(index, 1)[0]);
            }
        });
        
        if (deletedTasks.length > 0) {
            this.saveTasks();
            this.emitTaskUpdate('bulk-delete', deletedTasks);
        }
        
        return deletedTasks;
    }

    markAsReplied(taskId) {
        return this.updateTask(taskId, {
            emailReplied: true,
            lastReplyDate: new Date().toISOString()
        });
    }

    filterTasks(filters = {}) {
        let filtered = [...this.tasks];
        
        // Filtres de base
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }
        
        if (filters.hasEmail) {
            filtered = filtered.filter(task => task.hasEmail);
        }
        
        if (filters.needsReply) {
            filtered = filtered.filter(task => task.hasEmail && !task.emailReplied);
        }
        
        if (filters.sender && filters.sender !== 'all') {
            filtered = filtered.filter(task => task.emailFrom === filters.sender);
        }
        
        if (filters.overdue) {
            filtered = filtered.filter(task => {
                if (!task.dueDate || task.status === 'completed') return false;
                return new Date(task.dueDate) < new Date();
            });
        }
        
        // Filtre par tag
        if (filters.tag && filters.tag !== 'all') {
            filtered = filtered.filter(task => 
                task.tags && task.tags.includes(filters.tag)
            );
        }
        
        // Filtre par date
        if (filters.dateFilter && filters.dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            switch (filters.dateFilter) {
                case 'today':
                    filtered = filtered.filter(task => {
                        const taskDate = new Date(task.createdAt);
                        return taskDate >= today && taskDate < tomorrow;
                    });
                    break;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    filtered = filtered.filter(task => {
                        const taskDate = new Date(task.createdAt);
                        return taskDate >= weekAgo;
                    });
                    break;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    filtered = filtered.filter(task => {
                        const taskDate = new Date(task.createdAt);
                        return taskDate >= monthAgo;
                    });
                    break;
                case 'overdue':
                    filtered = filtered.filter(task => {
                        if (!task.dueDate || task.status === 'completed') return false;
                        return new Date(task.dueDate) < now;
                    });
                    break;
            }
        }
        
        // Recherche
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                (task.emailFromName && task.emailFromName.toLowerCase().includes(search)) ||
                (task.emailSubject && task.emailSubject.toLowerCase().includes(search)) ||
                (task.emailContent && task.emailContent.toLowerCase().includes(search)) ||
                (task.tags && task.tags.some(tag => tag.toLowerCase().includes(search)))
            );
        }
        
        // Tri
        filtered = this.sortTasks(filtered, filters.sortBy || 'priority');
        
        return filtered;
    }

    sortTasks(tasks, sortBy) {
        const sorted = [...tasks];
        
        switch (sortBy) {
            case 'priority':
                const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'dueDate':
                sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'created':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'updated':
                sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'alphabetical':
                sorted.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
                break;
        }
        
        return sorted;
    }

    getStats() {
        const stats = {
            total: this.tasks.length,
            todo: this.tasks.filter(t => t.status === 'todo').length,
            inProgress: this.tasks.filter(t => t.status === 'in-progress').length,
            completed: this.tasks.filter(t => t.status === 'completed').length,
            withEmail: this.tasks.filter(t => t.hasEmail).length,
            needsReply: this.tasks.filter(t => t.hasEmail && !t.emailReplied && t.status !== 'completed').length,
            overdue: this.tasks.filter(t => {
                if (!t.dueDate || t.status === 'completed') return false;
                return new Date(t.dueDate) < new Date();
            }).length,
            // Pour la compatibilité avec PageManager
            byStatus: {
                todo: this.tasks.filter(t => t.status === 'todo').length,
                'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
                completed: this.tasks.filter(t => t.status === 'completed').length
            }
        };
        return stats;
    }

    getSenders() {
        const senders = new Map();
        this.tasks.forEach(task => {
            if (task.emailFrom) {
                const key = task.emailFrom;
                if (!senders.has(key)) {
                    senders.set(key, {
                        name: task.emailFromName || 'Inconnu',
                        email: task.emailFrom,
                        domain: task.emailDomain,
                        count: 0,
                        tasks: []
                    });
                }
                const sender = senders.get(key);
                sender.count++;
                sender.tasks.push(task.id);
            }
        });
        
        // Convertir en array et trier par nombre de tâches
        return Array.from(senders.entries())
            .map(([email, data]) => ({ email, ...data }))
            .sort((a, b) => b.count - a.count);
    }

    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    getAllTasks() {
        return [...this.tasks];
    }

    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    extractDomain(email) {
        if (!email) return null;
        const parts = email.split('@');
        return parts.length > 1 ? parts[1] : null;
    }

    extractClient(taskData) {
        if (taskData.client) return taskData.client;
        
        const domain = this.extractDomain(taskData.emailFrom || taskData.emailDetails?.fromEmail);
        if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail')) {
            return domain.split('.')[0];
        }
        
        return 'Personnel';
    }

    emitTaskUpdate(action, task) {
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('taskUpdate', {
                detail: { action, task }
            }));
        }
    }
}

// =====================================
// TASKS VIEW CLASS - ERGONOMIE AMÉLIORÉE
// =====================================
class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            sender: 'all',
            search: '',
            sortBy: 'priority',
            overdue: false,
            needsReply: false
        };
        
        this.selectedTasks = new Set();
        this.currentTaskDetail = null;
        this.editMode = false;
        this.dropdownStates = new Map();
        
        // Écouter les mises à jour
        window.addEventListener('taskUpdate', () => {
            console.log('[TasksView] Task update detected, refreshing view');
            this.refreshView();
        });
        
        // Fermer les dropdowns en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    render(container) {
        if (!container) {
            console.error('[TasksView] No container provided');
            return;
        }

        // Attendre l'initialisation du TaskManager
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TasksView] Waiting for TaskManager initialization...');
            
            container.innerHTML = `
                <div class="loading-state">
                    <div class="modal-footer">
                        <div id="viewFooter">
                            <button class="btn btn-secondary btn-large" 
                                    onclick="window.tasksView.closeModalById('${uniqueId}');">
                                <span>Fermer</span>
                            </button>
                        </div>
                        <div id="editFooter" style="display: none;">
                            <button class="btn btn-secondary btn-large" 
                                    onclick="window.tasksView.cancelEdit();">
                                <span>Annuler</span>
                            </button>
                            <button class="btn btn-primary btn-large" 
                                    onclick="window.tasksView.saveEdit();">
                                <i class="fas fa-save"></i> 
                                <span>Enregistrer</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    // Ajouter cette nouvelle méthode pour fermer par ID
    closeModalById(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }

    // Rendu des sections de tâche avec style amélioré
    renderTaskSections(task) {
        let html = '';
        
        // Description
        if (task.summary || task.description) {
            html += `
                <div class="content-section">
                    <div class="section-header">
                        <i class="fas fa-clipboard-list"></i>
                        <h4>Résumé Exécutif</h4>
                    </div>
                    <div class="section-content">
                        <div id="summaryView" class="section-text">
                            ${this.formatSummary(task.summary || this.extractSummaryFromDescription(task.description) || 'Aucune description')}
                        </div>
                        <textarea id="summaryEdit" 
                                  class="form-textarea form-textarea-large"
                                  style="display: none;"
                                  rows="6">${task.summary || this.extractSummaryFromDescription(task.description) || ''}</textarea>
                    </div>
                </div>
            `;
        }
        
        // Actions
        if (task.actions && task.actions.length > 0) {
            html += `
                <div class="content-section">
                    <div class="section-header">
                        <i class="fas fa-tasks"></i>
                        <h4>Actions Requises</h4>
                    </div>
                    <div class="section-content">
                        <div id="actionsView" class="actions-list">
                            ${task.actions.map((action, idx) => `
                                <div class="action-item">
                                    <span class="action-number">${idx + 1}</span>
                                    <span class="action-text">${typeof action === 'string' ? action : action.text}</span>
                                    ${action.deadline ? `<span class="action-deadline">${action.deadline}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <div id="actionsEdit" style="display: none;">
                            ${task.actions.map((action, idx) => `
                                <div class="action-item-edit">
                                    <span class="action-number">${idx + 1}</span>
                                    <input type="text" 
                                           class="form-input form-input-large action-input" 
                                           value="${typeof action === 'string' ? action : action.text}" 
                                           data-action-index="${idx}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    // Rendu de la section email avec style amélioré
    renderEmailSection(task) {
        let content = '';
        let isHtml = false;
        
        // Logique unifiée pour récupérer le contenu
        if (task.originalEmail && task.originalEmail.body?.content) {
            content = task.originalEmail.body.content;
            isHtml = true;
        } else if (task.emailFullHtml) {
            content = task.emailFullHtml;
            isHtml = true;
        } else if (task.emailHtml) {
            content = task.emailHtml;
            isHtml = true;
        } else if (task.emailContent) {
            content = task.emailContent;
            isHtml = task.emailContentType === 'html';
        }
        
        if (!content) {
            content = 'Aucun contenu disponible';
            isHtml = false;
        }
        
        return `
            <div class="content-section email-section">
                <div class="section-header">
                    <i class="fas fa-envelope"></i>
                    <h4>Email associé</h4>
                </div>
                
                <div class="section-content">
                    <div class="email-header-info">
                        <div class="email-field">
                            <span class="field-label">De:</span>
                            <span class="field-value">
                                ${this.escapeHtml(task.emailFromName || '')} 
                                <span class="email-address">&lt;${this.escapeHtml(task.emailFrom || '')}&gt;</span>
                            </span>
                        </div>
                        <div class="email-field">
                            <span class="field-label">Objet:</span>
                            <span class="field-value">${this.escapeHtml(task.emailSubject || 'Sans objet')}</span>
                        </div>
                        <div class="email-field">
                            <span class="field-label">Date:</span>
                            <span class="field-value">${this.formatDate(task.emailDate || task.createdAt)}</span>
                        </div>
                        ${task.hasAttachments ? `
                            <div class="email-field">
                                <span class="field-label">Pièces jointes:</span>
                                <span class="field-value">
                                    <i class="fas fa-paperclip"></i> Oui
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="email-content-container">
                        <div class="email-content-header">
                            <h5>Contenu de l'email</h5>
                            <span class="email-type-badge">${isHtml ? 'HTML' : 'Texte'}</span>
                        </div>
                        <div class="email-content-box ${isHtml ? 'html-content' : 'text-content'}">
                            ${this.formatEmailContent(content, isHtml)}
                        </div>
                    </div>
                    
                    <!-- Section de réponse (cachée par défaut) -->
                    <div id="replySection" class="reply-section-integrated" style="display: none;">
                        ${this.renderReplyInterface(task)}
                    </div>
                </div>
            </div>
        `;
    }

    // Interface de réponse améliorée
    renderReplyInterface(task) {
        const suggestions = task.aiAnalysis?.suggestedReplies || this.generateDefaultReplies(task);
        
        return `
            <div class="reply-wrapper">
                <h5><i class="fas fa-reply"></i> Répondre à l'email</h5>
                
                <!-- Suggestions IA -->
                ${suggestions.length > 0 ? `
                    <div class="reply-suggestions">
                        <label class="suggestions-label">Utiliser une suggestion :</label>
                        <div class="suggestion-pills">
                            ${suggestions.map((sugg, idx) => `
                                <button class="suggestion-pill" 
                                        onclick="window.tasksView.applySuggestion(${idx})"
                                        title="${this.escapeHtml(sugg.content).substring(0, 100)}...">
                                    ${this.getReplyToneIcon(sugg.tone)} 
                                    <span>${this.getReplyToneLabel(sugg.tone)}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Formulaire de réponse -->
                <form id="replyForm" class="reply-form" onsubmit="window.tasksView.sendReply(event, '${task.id}')">
                    <div class="reply-fields">
                        <div class="field-group">
                            <label class="field-label">À:</label>
                            <input type="email" 
                                   name="to" 
                                   id="replyTo"
                                   class="form-input form-input-large" 
                                   value="${task.emailFrom || ''}" 
                                   required>
                        </div>
                        
                        <div class="field-group">
                            <label class="field-label">Objet:</label>
                            <input type="text" 
                                   name="subject" 
                                   id="replySubject"
                                   class="form-input form-input-large" 
                                   value="Re: ${task.emailSubject || 'Sans objet'}" 
                                   required>
                        </div>
                    </div>
                    
                    <div class="reply-content-area">
                        <label class="field-label">Message:</label>
                        <textarea name="content" 
                                  id="replyContent"
                                  class="form-textarea form-textarea-large" 
                                  rows="10" 
                                  placeholder="Votre réponse..."
                                  required>${suggestions.length > 0 ? suggestions[0].content : ''}</textarea>
                    </div>
                    
                    <div class="reply-actions">
                        <button type="button" 
                                class="btn btn-secondary btn-large" 
                                onclick="window.tasksView.hideReplySection()">
                            <span>Annuler</span>
                        </button>
                        <button type="submit" class="btn btn-primary btn-large">
                            <i class="fas fa-paper-plane"></i> 
                            <span>Envoyer</span>
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    // Rendu de la section metadata amélioré
    renderMetadataSection(task) {
        return `
            <div class="content-section metadata-section">
                <div class="section-header">
                    <i class="fas fa-info-circle"></i>
                    <h4>Informations</h4>
                </div>
                
                <div class="section-content">
                    <div class="metadata-grid">
                        <div class="metadata-item">
                            <label class="metadata-label">Échéance</label>
                            <div id="dueDateView" class="metadata-value">
                                ${task.dueDate ? this.formatDate(task.dueDate) : 'Non définie'}
                            </div>
                            <input type="date" 
                                   id="dueDateEdit"
                                   class="form-input form-input-large"
                                   value="${task.dueDate ? task.dueDate.split('T')[0] : ''}"
                                   style="display: none;">
                        </div>
                        
                        <div class="metadata-item">
                            <label class="metadata-label">Client</label>
                            <div id="clientView" class="metadata-value">
                                ${task.client || 'Non défini'}
                            </div>
                            <input type="text" 
                                   id="clientEdit"
                                   class="form-input form-input-large"
                                   value="${task.client || ''}"
                                   style="display: none;">
                        </div>
                        
                        <div class="metadata-item">
                            <label class="metadata-label">Catégorie</label>
                            <div id="categoryView" class="metadata-value">
                                ${task.category || 'Autre'}
                            </div>
                            <select id="categoryEdit" 
                                    class="form-select form-select-large"
                                    style="display: none;">
                                <option value="tasks" ${task.category === 'tasks' ? 'selected' : ''}>Tâches</option>
                                <option value="email" ${task.category === 'email' ? 'selected' : ''}>Email</option>
                                <option value="project" ${task.category === 'project' ? 'selected' : ''}>Projet</option>
                                <option value="meeting" ${task.category === 'meeting' ? 'selected' : ''}>Réunion</option>
                                <option value="finance" ${task.category === 'finance' ? 'selected' : ''}>Finance</option>
                                <option value="client" ${task.category === 'client' ? 'selected' : ''}>Client</option>
                                <option value="other" ${task.category === 'other' ? 'selected' : ''}>Autre</option>
                            </select>
                        </div>
                        
                        <div class="metadata-item">
                            <label class="metadata-label">Tags</label>
                            <div id="tagsView" class="metadata-value">
                                ${task.tags && task.tags.length > 0 ? 
                                    task.tags.map(tag => `<span class="tag-display">${this.escapeHtml(tag)}</span>`).join('') : 
                                    'Aucun tag'}
                            </div>
                            <input type="text" 
                                   id="tagsEdit"
                                   class="form-input form-input-large"
                                   placeholder="tag1, tag2, tag3..."
                                   value="${task.tags ? task.tags.join(', ') : ''}"
                                   style="display: none;">
                        </div>
                    </div>
                    
                    <!-- Sélecteurs en mode édition -->
                    <div id="editSelectors" class="edit-selectors" style="display: none;">
                        <div class="selector-item">
                            <label class="selector-label">Priorité</label>
                            <select id="priorityEdit" class="form-select form-select-large">
                                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                            </select>
                        </div>
                        <div class="selector-item">
                            <label class="selector-label">Statut</label>
                            <select id="statusEdit" class="form-select form-select-large">
                                <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>À faire</option>
                                <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>En cours</option>
                                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Terminée</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Historique -->
                    <div class="history-section">
                        <h5>Historique</h5>
                        <div class="history-items">
                            <div class="history-item">
                                <span class="history-label">Créée le</span>
                                <span class="history-value">${this.formatDate(task.createdAt)}</span>
                            </div>
                            <div class="history-item">
                                <span class="history-label">Modifiée le</span>
                                <span class="history-value">${this.formatDate(task.updatedAt)}</span>
                            </div>
                            ${task.completedAt ? `
                                <div class="history-item">
                                    <span class="history-label">Terminée le</span>
                                    <span class="history-value">${this.formatDate(task.completedAt)}</span>
                                </div>
                            ` : ''}
                            ${task.lastReplyDate ? `
                                <div class="history-item">
                                    <span class="history-label">Répondu le</span>
                                    <span class="history-value">${this.formatDate(task.lastReplyDate)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Rendu du contexte expéditeur amélioré
    renderSenderContext(task) {
        const senderName = task.emailFromName || 'Inconnu';
        const senderEmail = task.emailFrom || '';
        const senderDomain = task.emailDomain || '';
        const senderInitial = senderName.charAt(0).toUpperCase();
        
        return `
            <div class="sender-context-box">
                <div class="sender-avatar-large">${senderInitial}</div>
                <div class="sender-details">
                    <div class="sender-name-large">${senderName}</div>
                    <div class="sender-email-large">${senderEmail}</div>
                    ${senderDomain ? `<div class="sender-domain-large">@${senderDomain}</div>` : ''}
                </div>
            </div>
        `;
    }

    // Méthodes d'édition
    toggleEditMode() {
        this.editMode = !this.editMode;
        const btn = document.getElementById('editModeBtn');
        
        if (this.editMode) {
            // Activer le mode édition
            btn.innerHTML = '<i class="fas fa-times"></i> <span>Annuler</span>';
            btn.classList.add('active');
            
            // Titre
            document.getElementById('modalTitle').style.display = 'none';
            document.getElementById('modalTitleInput').style.display = 'block';
            
            // Sections structurées
            const viewElements = ['summaryView', 'actionsView', 'descriptionView', 'dueDateView', 'clientView', 'categoryView', 'tagsView'];
            const editElements = ['summaryEdit', 'actionsEdit', 'descriptionEdit', 'dueDateEdit', 'clientEdit', 'categoryEdit', 'tagsEdit'];
            
            viewElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.style.display = 'none';
            });
            
            editElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.style.display = 'block';
            });
            
            // Sélecteurs
            const editSelectors = document.getElementById('editSelectors');
            if (editSelectors) editSelectors.style.display = 'flex';
            
            // Footer
            document.getElementById('viewFooter').style.display = 'none';
            document.getElementById('editFooter').style.display = 'flex';
            
        } else {
            this.cancelEdit();
        }
    }

    cancelEdit() {
        this.editMode = false;
        const btn = document.getElementById('editModeBtn');
        btn.innerHTML = '<i class="fas fa-edit"></i> <span>Modifier</span>';
        btn.classList.remove('active');
        
        // Restaurer l'affichage
        document.getElementById('modalTitle').style.display = 'block';
        document.getElementById('modalTitleInput').style.display = 'none';
        
        const viewElements = ['summaryView', 'actionsView', 'descriptionView', 'dueDateView', 'clientView', 'categoryView', 'tagsView'];
        const editElements = ['summaryEdit', 'actionsEdit', 'descriptionEdit', 'dueDateEdit', 'clientEdit', 'categoryEdit', 'tagsEdit'];
        
        viewElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'block';
        });
        
        editElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });
        
        const editSelectors = document.getElementById('editSelectors');
        if (editSelectors) editSelectors.style.display = 'none';
        
        document.getElementById('viewFooter').style.display = 'flex';
        document.getElementById('editFooter').style.display = 'none';
    }

    saveEdit() {
        const task = this.currentTaskDetail;
        
        const updates = {
            title: document.getElementById('modalTitleInput').value,
            dueDate: document.getElementById('dueDateEdit').value || null,
            client: document.getElementById('clientEdit').value,
            category: document.getElementById('categoryEdit').value,
            tags: document.getElementById('tagsEdit').value ? 
                  document.getElementById('tagsEdit').value.split(',').map(t => t.trim()).filter(t => t) : [],
            priority: document.getElementById('priorityEdit').value,
            status: document.getElementById('statusEdit').value
        };
        
        // Gérer les sections structurées
        const summaryEdit = document.getElementById('summaryEdit');
        if (summaryEdit) {
            updates.summary = summaryEdit.value;
        }
        
        const descriptionEdit = document.getElementById('descriptionEdit');
        if (descriptionEdit) {
            updates.description = descriptionEdit.value;
        }
        
        // Gérer les actions
        const actionInputs = document.querySelectorAll('.action-input');
        if (actionInputs.length > 0) {
            updates.actions = Array.from(actionInputs).map(input => ({
                text: input.value,
                deadline: null
            }));
        }
        
        window.taskManager.updateTask(task.id, updates);
        
        // Fermer et rouvrir le modal pour rafraîchir
        this.closeModalById(document.querySelector('[id^="task_detail_modal_"]').id);
        setTimeout(() => {
            this.showTaskModal(task.id);
        }, 100);
    }

    // Gestion des actions
    createTask(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            status: 'todo',
            dueDate: formData.get('dueDate') || null,
            client: formData.get('client'),
            tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : []
        };
        
        window.taskManager.createTask(taskData);
        
        // Fermer tous les modaux
        document.querySelectorAll('[id^="create_task_modal_"]').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
        
        // Rafraîchir la vue
        this.refreshView();
    }

    quickReply(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        this.showTaskModal(taskId);
        setTimeout(() => {
            this.showReplySection();
        }, 100);
    }

    showReplySection() {
        const replySection = document.getElementById('replySection');
        if (replySection) {
            replySection.style.display = 'block';
            replySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('replyContent').focus();
        }
    }

    hideReplySection() {
        const replySection = document.getElementById('replySection');
        if (replySection) {
            replySection.style.display = 'none';
        }
    }

    applySuggestion(index) {
        const task = this.currentTaskDetail;
        const suggestions = task.aiAnalysis?.suggestedReplies || this.generateDefaultReplies(task);
        
        if (suggestions[index]) {
            const textarea = document.getElementById('replyContent');
            const subjectInput = document.getElementById('replySubject');
            if (textarea) {
                textarea.value = suggestions[index].content;
                textarea.focus();
            }
            if (subjectInput && suggestions[index].subject) {
                subjectInput.value = suggestions[index].subject;
            }
        }
    }

    async sendReply(event, taskId) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const to = formData.get('to');
        const subject = formData.get('subject');
        const content = formData.get('content');
        
        try {
            // Ouvrir le client email
            const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
            window.open(mailtoLink);
            
            // Marquer comme répondu
            window.taskManager.markAsReplied(taskId);
            
            // Rafraîchir
            this.closeModalById(document.querySelector('[id^="task_detail_modal_"]').id);
            setTimeout(() => {
                this.showTaskModal(taskId);
            }, 100);
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Email prêt à envoyer!', 'success');
            } else {
                alert('Email prêt à envoyer!');
            }
        } catch (error) {
            console.error('Erreur envoi email:', error);
            alert('Erreur lors de l\'envoi: ' + error.message);
        }
    }

    // Gestion de la sélection multiple
    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const allSelected = tasks.every(task => this.selectedTasks.has(task.id));
        
        if (allSelected) {
            this.selectedTasks.clear();
        } else {
            tasks.forEach(task => this.selectedTasks.add(task.id));
        }
        
        this.refreshView();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.querySelector('.selection-count');
        
        if (bulkActions) {
            bulkActions.classList.toggle('visible', this.selectedTasks.size > 0);
        }
        
        if (selectedCount) {
            selectedCount.textContent = this.selectedTasks.size;
        }
        
        // Mettre à jour le texte du bouton select all
        const filteredTasks = window.taskManager.filterTasks(this.currentFilters);
        const allSelected = filteredTasks.length > 0 && 
            filteredTasks.every(task => this.selectedTasks.has(task.id));
        
        const selectAllBtn = document.querySelector('#bulkActions .btn-secondary span');
        if (selectAllBtn) {
            selectAllBtn.textContent = allSelected ? 'Tout désélectionner' : 'Tout sélectionner';
        }
        
        // Mettre à jour les checkboxes
        document.querySelectorAll('.task-item').forEach(item => {
            const taskId = item.dataset.taskId;
            const isSelected = this.selectedTasks.has(taskId);
            item.classList.toggle('selected', isSelected);
            
            const checkbox = item.querySelector('.task-select .custom-checkbox');
            if (checkbox) {
                checkbox.classList.toggle('checked', isSelected);
                checkbox.innerHTML = isSelected ? '<i class="fas fa-check"></i>' : '';
            }
        });
    }

    deleteSelected() {
        const count = this.selectedTasks.size;
        if (count === 0) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${count} tâche(s) ?`)) {
            window.taskManager.deleteTasks(Array.from(this.selectedTasks));
            this.selectedTasks.clear();
            this.updateBulkActions();
        }
    }

    toggleTaskStatus(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
        window.taskManager.updateTask(taskId, { status: newStatus });
    }

    deleteTask(taskId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            window.taskManager.deleteTask(taskId);
            this.selectedTasks.delete(taskId);
            this.updateBulkActions();
        }
    }

    // Filtres
    setFilter(filterType, value) {
        // Réinitialiser certains filtres si nécessaire
        if (filterType === 'status' || filterType === 'priority' || filterType === 'sender') {
            this.currentFilters.overdue = false;
            this.currentFilters.needsReply = false;
        }
        
        this.currentFilters[filterType] = value;
        
        // Fermer le dropdown
        this.closeAllDropdowns();
        
        this.refreshView();
    }

    setSort(sortBy) {
        this.currentFilters.sortBy = sortBy;
        this.closeAllDropdowns();
        this.refreshView();
    }

    resetFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            sender: 'all',
            search: '',
            sortBy: 'priority',
            overdue: false,
            needsReply: false,
            dateFilter: 'all',
            tag: 'all'
        };
        
        // Réinitialiser le champ de recherche
        const searchInput = document.getElementById('filter-search');
        if (searchInput) searchInput.value = '';
        
        this.refreshView();
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('filter-search');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    refreshView() {
        const listContainer = document.getElementById('tasksListContainer');
        if (listContainer) {
            listContainer.innerHTML = this.renderTasksList();
        }
        
        // Mettre à jour les stats
        const pageHeader = document.querySelector('.page-header');
        if (pageHeader) {
            const statsHtml = this.renderStats();
            const existingStats = document.querySelector('.stats-grid');
            if (existingStats) {
                existingStats.outerHTML = statsHtml;
            }
        }
        
        // Mettre à jour les bulk actions
        const bulkActionsContainer = document.getElementById('bulkActions');
        if (bulkActionsContainer) {
            bulkActionsContainer.outerHTML = this.renderBulkActions();
        }
        
        this.updateBulkActions();
    }

    attachEventListeners() {
        // Recherche
        const searchInput = document.getElementById('filter-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    const searchClearBtn = document.getElementById('searchClearBtn');
                    if (searchClearBtn) {
                        searchClearBtn.style.display = e.target.value ? 'flex' : 'none';
                    }
                    this.refreshView();
                }, 300);
            });
        }
    }

    // Méthodes utilitaires
    generateDefaultReplies(task) {
        const sender = task.emailFromName || 'l\'expéditeur';
        return [
            {
                tone: 'neutre',
                subject: `Re: ${task.emailSubject || 'Votre message'}`,
                content: `Bonjour ${sender},\n\nJ'ai bien reçu votre message et je vous en remercie.\n\nJe vais examiner votre demande et vous apporter une réponse dans les meilleurs délais.\n\nCordialement,`
            },
            {
                tone: 'formel',
                subject: `Re: ${task.emailSubject || 'Votre message'} - Confirmation`,
                content: `Bonjour ${sender},\n\nJe vous remercie pour votre message concernant "${task.emailSubject || 'votre demande'}".\n\nJe prends connaissance de votre demande et reviendrai vers vous prochainement avec les éléments demandés.\n\nJe vous prie d'agréer mes salutations distinguées.`
            },
            {
                tone: 'amical',
                subject: `Re: ${task.emailSubject || 'Votre message'}`,
                content: `Bonjour ${sender},\n\nMerci pour votre message !\n\nJe vais regarder ça de près et je reviens vers vous rapidement.\n\nBonne journée,`
            }
        ];
    }

    getFilterLabel(filterType, value) {
        const labels = {
            status: {
                all: 'Tous les statuts',
                todo: 'À faire',
                'in-progress': 'En cours',
                completed: 'Terminées'
            },
            priority: {
                all: 'Toutes priorités',
                urgent: '🚨 Urgent',
                high: '⚡ Haute',
                medium: '📌 Normale',
                low: '📄 Basse'
            },
            sortBy: {
                priority: 'Priorité',
                dueDate: 'Échéance',
                created: 'Date de création',
                updated: 'Dernière modification',
                alphabetical: 'Alphabétique'
            },
            dateFilter: {
                all: 'Toutes les dates',
                today: 'Aujourd\'hui',
                week: 'Cette semaine',
                month: 'Ce mois',
                overdue: 'En retard'
            },
            tag: {
                all: 'Tous les tags'
            }
        };
        
        if (filterType === 'sender') {
            if (value === 'all') return 'Tous les expéditeurs';
            const senders = window.taskManager.getSenders();
            const sender = senders.find(s => s.email === value);
            return sender ? sender.name : 'Tous les expéditeurs';
        }
        
        if (filterType === 'tag' && value !== 'all') {
            return value;
        }
        
        return labels[filterType]?.[value] || value;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatEmailContent(content, isHtml = false) {
        if (!content) return '<p style="color: #9ca3af; font-style: italic;">Aucun contenu</p>';
        
        if (isHtml) {
            console.log('[TasksView] Formatting HTML email content');
            const cleanedHtml = this.sanitizeEmailHtml(content);
            return `<div class="email-html-content">${cleanedHtml}</div>`;
        } else {
            const escaped = this.escapeHtml(content);
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const withLinks = escaped.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
            return `<div class="formatted-content">${withLinks.replace(/\n/g, '<br>')}</div>`;
        }
    }

    sanitizeEmailHtml(html) {
        if (!html) return '<p style="color: #9ca3af; font-style: italic;">Aucun contenu</p>';
        
        let cleaned = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
            .replace(/javascript:/gi, 'void:')
            .replace(/<(iframe|embed|object|form|input|textarea|button|select|script|link|meta|base)[^>]*>/gi, '')
            .replace(/<\/(iframe|embed|object|form|input|textarea|button|select|script|link|meta|base)>/gi, '');
            
        cleaned = cleaned.replace(/<img([^>]*)>/gi, (match, attributes) => {
            let safeAttributes = attributes
                .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                .replace(/javascript:/gi, '');
                
            if (!safeAttributes.includes('style=')) {
                safeAttributes += ' style="max-width: 100%; height: auto;"';
            }
            
            return `<img${safeAttributes}>`;
        });
        
        return cleaned;
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();
        
        if (isToday) {
            return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (isYesterday) {
            return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    extractSummaryFromDescription(description) {
        if (!description) return '';
        
        const summaryMatch = description.match(/📧 RÉSUMÉ EXÉCUTIF\n━+\n([\s\S]*?)(?=\n\n|$)/);
        if (summaryMatch) {
            return summaryMatch[1].trim();
        }
        
        const lines = description.split('\n').filter(line => line.trim());
        return lines.slice(0, 3).join('\n');
    }

    formatSummary(summary) {
        if (!summary) return '<p style="color: #9ca3af; font-style: italic;">Aucun résumé</p>';
        
        return summary.split('\n').map(line => {
            if (line.includes('🚨')) {
                return `<p style="color: #ef4444; font-weight: 500; margin-bottom: 8px;">${this.escapeHtml(line)}</p>`;
            } else if (line.includes('📮')) {
                return `<p style="color: #3b82f6; font-weight: 500; margin-bottom: 8px;">${this.escapeHtml(line)}</p>`;
            } else {
                return `<p style="margin-bottom: 8px; line-height: 1.6;">${this.escapeHtml(line)}</p>`;
            }
        }).join('');
    }

    getPriorityLabel(priority) {
        const labels = {
            urgent: '🚨 Urgent',
            high: '⚡ Haute',
            medium: '📌 Normale',
            low: '📄 Basse'
        };
        return labels[priority] || '📌 Normale';
    }

    getStatusLabel(status) {
        const labels = {
            'todo': 'À faire',
            'in-progress': 'En cours',
            'completed': 'Terminée'
        };
        return labels[status] || status;
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

    // Styles ergonomiques améliorés
    addStyles() {
        if (document.getElementById('tasksViewStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'tasksViewStyles';
        styles.textContent = `
            /* Variables CSS améliorées */
            :root {
                --primary: #667eea;
                --primary-dark: #5a67d8;
                --primary-light: #7c3aed;
                --secondary: #64748b;
                --success: #10b981;
                --danger: #ef4444;
                --warning: #f59e0b;
                --info: #3b82f6;
                --dark: #1e293b;
                --light: #f8fafc;
                --gray-50: #f9fafb;
                --gray-100: #f3f4f6;
                --gray-200: #e5e7eb;
                --gray-300: #d1d5db;
                --gray-400: #9ca3af;
                --gray-500: #6b7280;
                --gray-600: #4b5563;
                --gray-700: #374151;
                --gray-800: #1f2937;
                --gray-900: #111827;
                
                /* Nouvelles variables pour l'ergonomie */
                --text-base: 16px;
                --text-sm: 14px;
                --text-lg: 18px;
                --text-xl: 20px;
                --spacing-xs: 8px;
                --spacing-sm: 12px;
                --spacing-md: 16px;
                --spacing-lg: 24px;
                --spacing-xl: 32px;
                --border-radius: 12px;
                --border-radius-lg: 16px;
                --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
                --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
                --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.2);
            }
            
            /* Tasks Page Styles */
            .tasks-page {
                padding: var(--spacing-lg);
                max-width: 1600px;
                margin: 0 auto;
                font-size: var(--text-base);
                line-height: 1.6;
            }
            
            /* Header amélioré */
            .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-xl);
                flex-wrap: wrap;
                gap: var(--spacing-md);
                padding-bottom: var(--spacing-lg);
            }
            
            .page-title {
                font-size: 36px;
                font-weight: 800;
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin: 0;
                letter-spacing: -0.02em;
            }
            
            /* Stats Grid amélioré */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-xl);
            }
            
            .stat-card {
                background: white;
                border-radius: var(--border-radius);
                padding: var(--spacing-lg);
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 2px solid transparent;
                position: relative;
                overflow: hidden;
                box-shadow: var(--shadow-sm);
                min-height: 80px;
            }
            
            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--accent-color, var(--primary));
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
                border-color: var(--accent-color, var(--primary));
            }
            
            .stat-card:hover::before {
                opacity: 1;
            }
            
            .stat-icon {
                width: 56px;
                height: 56px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--border-radius);
                background: var(--accent-color, var(--primary));
                background: linear-gradient(135deg, var(--accent-color, var(--primary)), var(--accent-color, var(--primary)));
                opacity: 0.1;
                color: var(--accent-color, var(--primary));
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .stat-card:hover .stat-icon {
                opacity: 0.2;
            }
            
            .stat-content {
                flex: 1;
                min-width: 0;
            }
            
            .stat-value {
                font-size: 32px;
                font-weight: 700;
                line-height: 1;
                color: var(--gray-900);
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: var(--gray-500);
            }
            
            /* Section des filtres ergonomique */
            .filters-section {
                margin-bottom: var(--spacing-lg);
            }
            
            .filters-container {
                background: white;
                border-radius: var(--border-radius-lg);
                padding: var(--spacing-lg);
                box-shadow: var(--shadow-sm);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }
            
            .search-section {
                width: 100%;
            }
            
            .search-wrapper {
                position: relative;
                max-width: 400px;
            }
            
            .search-input {
                width: 100%;
                padding: 16px 52px 16px 48px;
                border: 2px solid var(--gray-200);
                border-radius: var(--border-radius);
                font-size: var(--text-base);
                transition: all 0.3s ease;
                background: var(--gray-50);
                min-height: 52px;
            }
            
            .search-input:focus {
                outline: none;
                border-color: var(--primary);
                background: white;
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            }
            
            .search-icon {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
                font-size: 18px;
                pointer-events: none;
            }
            
            .search-clear {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--gray-200);
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
                color: var(--gray-600);
                transition: all 0.2s ease;
            }
            
            .search-clear:hover {
                background: var(--gray-300);
                color: var(--gray-700);
            }
            
            /* Grille des filtres */
            .filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--spacing-md);
                align-items: start;
            }
            
            /* Dropdowns modernes et ergonomiques */
            .filter-dropdown {
                position: relative;
                width: 100%;
            }
            
            .filter-dropdown.has-filter .filter-button {
                background: linear-gradient(135deg, var(--primary), var(--primary-light));
                color: white;
                border-color: var(--primary);
            }
            
            .filter-dropdown.has-filter .filter-button .button-icon,
            .filter-dropdown.has-filter .filter-button .chevron-icon {
                color: white !important;
            }
            
            .filter-button {
                width: 100%;
                padding: 16px 18px;
                border: 2px solid var(--gray-200);
                border-radius: var(--border-radius);
                background: var(--gray-50);
                font-size: var(--text-base);
                font-weight: 500;
                color: var(--gray-700);
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 52px;
                text-align: left;
            }
            
            .button-content {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                min-width: 0;
            }
            
            .button-icon {
                font-size: 16px;
                color: var(--gray-500);
                flex-shrink: 0;
            }
            
            .button-text {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 500;
            }
            
            .chevron-icon {
                font-size: 14px;
                transition: transform 0.3s ease;
                flex-shrink: 0;
                color: var(--gray-400);
            }
            
            .filter-button.sort-button {
                background: linear-gradient(135deg, var(--gray-50), var(--gray-100));
                border-color: var(--gray-300);
            }
            
            .filter-button:hover {
                border-color: var(--gray-300);
                background: white;
                box-shadow: var(--shadow-sm);
            }
            
            .filter-dropdown.has-filter .filter-button:hover {
                background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            }
            
            .filter-dropdown.open .filter-button {
                border-color: var(--primary);
                background: white;
                color: var(--primary);
                box-shadow: var(--shadow-sm);
            }
            
            .filter-dropdown.has-filter.open .filter-button {
                background: white;
                color: var(--primary);
            }
            
            .filter-dropdown.open .filter-button .button-icon,
            .filter-dropdown.open .filter-button .chevron-icon {
                color: var(--primary) !important;
            }
            
            .filter-dropdown.open .filter-button .chevron-icon {
                transform: rotate(180deg);
            }
            
            /* Dropdown menu amélioré */
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                margin-top: 8px;
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                opacity: 0;
                transform: translateY(-10px);
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
                max-height: 400px;
                overflow-y: auto;
                min-width: 220px;
            }
            
            .dropdown-menu-large {
                max-height: 500px;
                min-width: 300px;
            }
            
            .filter-dropdown.open .dropdown-menu {
                opacity: 1;
                transform: translateY(0);
                visibility: visible;
            }
            
            .dropdown-item {
                padding: 14px 18px;
                cursor: pointer;
                transition: background 0.2s ease;
                font-size: var(--text-base);
                display: flex;
                align-items: center;
                gap: 12px;
                min-height: 48px;
            }
            
            .dropdown-item .item-icon {
                color: var(--gray-500);
                font-size: 14px;
            }
            
            .dropdown-item:hover {
                background: var(--gray-50);
            }
            
            .dropdown-item.active {
                background: var(--primary);
                color: white;
            }
            
            .dropdown-item.active .item-icon,
            .dropdown-item.active .check-icon {
                color: white !important;
            }
            
            .dropdown-item .check-icon {
                font-size: 14px;
                opacity: 0;
                width: 20px;
                flex-shrink: 0;
                color: var(--primary);
            }
            
            .dropdown-item.active .check-icon {
                opacity: 1;
            }
            
            .dropdown-divider {
                height: 1px;
                background: var(--gray-200);
                margin: 8px 0;
            }
            
            .dropdown-section-title {
                font-size: 13px;
                font-weight: 600;
                color: var(--gray-500);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 12px 18px 8px 18px;
                background: var(--gray-50);
                border-bottom: 1px solid var(--gray-100);
            }
            
            /* Priority labels colorés */
            .priority-label.urgent {
                color: var(--danger);
                font-weight: 600;
            }
            
            .priority-label.high {
                color: var(--warning);
                font-weight: 600;
            }
            
            .priority-label.medium {
                color: var(--info);
                font-weight: 600;
            }
            
            .priority-label.low {
                color: var(--gray-600);
                font-weight: 600;
            }
            
            /* Sender items améliorés */
            .sender-item {
                padding: 12px 18px;
                align-items: center;
            }
            
            .sender-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .sender-info {
                flex: 1;
                min-width: 0;
                margin-left: 8px;
            }
            
            .sender-name {
                font-size: var(--text-base);
                font-weight: 500;
                color: var(--gray-800);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 2px;
            }
            
            .sender-email {
                font-size: 13px;
                color: var(--gray-500);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .sender-count {
                font-size: 13px;
                background: var(--gray-100);
                color: var(--gray-600);
                padding: 4px 10px;
                border-radius: 16px;
                font-weight: 600;
                margin-left: auto;
                flex-shrink: 0;
            }
            
            .dropdown-item.active .sender-count {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            
            /* Tag items */
            .tag-item {
                align-items: center;
            }
            
            .tag-name {
                flex: 1;
                font-weight: 500;
            }
            
            .tag-count {
                font-size: 13px;
                background: var(--gray-100);
                color: var(--gray-600);
                padding: 4px 8px;
                border-radius: 12px;
                font-weight: 600;
                margin-left: auto;
            }
            
            /* Reset section */
            .reset-section {
                display: flex;
                justify-content: flex-end;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
            }
            
            .reset-section.visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            /* Actions groupées améliorées */
            .bulk-actions {
                background: white;
                border-radius: var(--border-radius);
                padding: var(--spacing-md) var(--spacing-lg);
                margin-bottom: var(--spacing-md);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--spacing-md);
                box-shadow: var(--shadow-sm);
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(-10px);
                visibility: hidden;
                height: 0;
                margin-bottom: 0;
                padding: 0 var(--spacing-lg);
                border: 2px solid var(--primary);
            }
            
            .bulk-actions.visible {
                opacity: 1;
                transform: translateY(0);
                visibility: visible;
                height: auto;
                padding: var(--spacing-md) var(--spacing-lg);
                margin-bottom: var(--spacing-md);
            }
            
            .bulk-info {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-size: var(--text-base);
                color: var(--gray-700);
                font-weight: 500;
            }
            
            .selection-count {
                font-weight: 700;
                color: var(--primary);
                font-size: var(--text-lg);
            }
            
            .bulk-buttons {
                display: flex;
                gap: var(--spacing-sm);
            }
            
            /* Boutons améliorés avec tailles ergonomiques */
            .btn {
                padding: 12px 20px;
                border: none;
                border-radius: var(--border-radius);
                font-size: var(--text-base);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-xs);
                text-decoration: none;
                white-space: nowrap;
                min-height: 44px;
                line-height: 1.2;
            }
            
            .btn-large {
                padding: 16px 24px;
                font-size: var(--text-lg);
                min-height: 52px;
                gap: 10px;
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .btn-primary:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            
            .btn-secondary {
                background: white;
                color: var(--gray-700);
                border: 2px solid var(--gray-200);
            }
            
            .btn-secondary:hover:not(:disabled) {
                background: var(--gray-50);
                border-color: var(--gray-300);
            }
            
            .btn-danger {
                background: var(--danger);
                color: white;
            }
            
            .btn-danger:hover:not(:disabled) {
                background: #dc2626;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            }
            
            .reset-btn {
                background: var(--gray-100);
                color: var(--gray-700);
                border: 2px solid var(--gray-200);
            }
            
            .reset-btn:hover {
                background: var(--gray-200);
                border-color: var(--gray-300);
            }
            
            /* Liste des tâches améliorée */
            .tasks-list-container {
                background: white;
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: var(--shadow-sm);
            }
            
            .tasks-list {
                display: flex;
                flex-direction: column;
            }
            
            .task-item {
                display: flex;
                align-items: center;
                padding: var(--spacing-lg) var(--spacing-xl);
                border-bottom: 1px solid var(--gray-100);
                transition: all 0.2s ease;
                cursor: pointer;
                position: relative;
                min-height: 80px;
            }
            
            .task-item:last-child {
                border-bottom: none;
            }
            
            .task-item:hover {
                background: var(--gray-50);
            }
            
            .task-item.selected {
                background: rgba(102, 126, 234, 0.05);
                border-left: 4px solid var(--primary);
            }
            
            .task-item.completed {
                opacity: 0.6;
            }
            
            .task-item.completed .task-title {
                text-decoration: line-through;
            }
            
            .task-item.overdue {
                border-left: 4px solid var(--danger);
                background: rgba(239, 68, 68, 0.02);
            }
            
            .task-checkbox, .task-select {
                margin-right: var(--spacing-md);
            }
            
            .custom-checkbox {
                width: 24px;
                height: 24px;
                border: 2px solid var(--gray-300);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
            }
            
            .custom-checkbox:hover {
                border-color: var(--primary);
                background: var(--gray-50);
            }
            
            .custom-checkbox.checked {
                background: var(--primary);
                border-color: var(--primary);
            }
            
            .custom-checkbox.checked i {
                color: white;
                font-size: 14px;
            }
            
            .task-content {
                flex: 1;
                min-width: 0;
                padding-right: var(--spacing-md);
            }
            
            .task-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .task-title {
                font-weight: 600;
                color: var(--gray-900);
                margin: 0;
                font-size: var(--text-lg);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
                margin-right: var(--spacing-md);
                line-height: 1.3;
            }
            
            .task-badges {
                display: flex;
                gap: var(--spacing-xs);
                align-items: center;
                flex-shrink: 0;
            }
            
            .priority-badge {
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
            }
            
            .priority-badge.urgent {
                background: rgba(239, 68, 68, 0.1);
                color: var(--danger);
            }
            
            .priority-badge.high {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning);
            }
            
            .priority-badge.medium {
                background: rgba(59, 130, 246, 0.1);
                color: var(--info);
            }
            
            .priority-badge.low {
                background: var(--gray-100);
                color: var(--gray-600);
            }
            
            .email-badge, .ai-badge, .reply-badge {
                font-size: 16px;
                color: var(--gray-600);
                padding: 4px;
            }
            
            .email-badge {
                color: var(--info);
            }
            
            .ai-badge {
                color: #8b5cf6;
            }
            
            .reply-badge {
                color: var(--warning);
            }
            
            .task-description {
                color: var(--gray-600);
                font-size: var(--text-base);
                margin: 8px 0;
                line-height: 1.5;
            }
            
            .task-tags {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                margin-top: 8px;
            }
            
            .task-tag {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                background: var(--gray-100);
                color: var(--gray-700);
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .task-tag:hover {
                background: var(--primary);
                color: white;
            }
            
            .task-meta {
                display: flex;
                gap: var(--spacing-md);
                font-size: 14px;
                color: var(--gray-500);
                margin-top: 8px;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .meta-item.overdue {
                color: var(--danger);
                font-weight: 500;
            }
            
            .task-actions {
                display: flex;
                gap: var(--spacing-xs);
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .task-item:hover .task-actions {
                opacity: 1;
            }
            
            .action-btn {
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 16px;
            }
            
            .action-btn:hover {
                transform: scale(1.05);
            }
            
            .action-btn.primary {
                background: var(--info);
                color: white;
            }
            
            .action-btn.primary:hover {
                background: #2563eb;
            }
            
            .action-btn.danger {
                background: var(--danger);
                color: white;
            }
            
            .action-btn.danger:hover {
                background: #dc2626;
            }
            
            /* Empty State amélioré */
            .empty-state {
                text-align: center;
                padding: 100px 20px;
            }
            
            .empty-state-icon {
                font-size: 80px;
                color: var(--gray-300);
                margin-bottom: var(--spacing-xl);
            }
            
            .empty-state-title {
                font-size: 28px;
                font-weight: 700;
                color: var(--gray-800);
                margin-bottom: var(--spacing-sm);
            }
            
            .empty-state-text {
                font-size: var(--text-lg);
                color: var(--gray-500);
                margin-bottom: var(--spacing-xl);
                line-height: 1.6;
            }
            
            /* Modal amélioré avec z-index ultra élevé */
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
                z-index: 999999;
                backdrop-filter: blur(4px);
                animation: fadeIn 0.3s ease;
                padding: 20px;
                overflow-y: auto;
            }
            
            .task-modal {
                z-index: 9999999;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            .modal-container {
                background: white;
                border-radius: var(--border-radius-lg);
                width: 90%;
                max-width: 700px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: var(--shadow-lg);
                animation: slideUp 0.3s ease;
                position: relative;
                margin: auto;
            }
            
            .modal-large {
                max-width: 800px;
            }
            
            .modal-xlarge {
                max-width: 1200px;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .modal-header {
                padding: var(--spacing-xl);
                border-bottom: 1px solid var(--gray-100);
                flex-shrink: 0;
                position: relative;
                min-height: 80px;
            }
            
            .modal-header.gradient-header {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                color: white;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                padding-right: 80px;
                line-height: 1.3;
            }
            
            .modal-header.gradient-header h2 {
                color: white;
            }
            
            .modal-close {
                position: absolute;
                top: var(--spacing-xl);
                right: var(--spacing-xl);
                background: rgba(255, 255, 255, 0.2);
                border: none;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                color: white;
                z-index: 10;
                font-size: 18px;
            }
            
            .modal-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            .modal-body {
                padding: var(--spacing-xl);
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: var(--spacing-xl);
                border-top: 1px solid var(--gray-100);
                display: flex;
                justify-content: flex-end;
                gap: var(--spacing-md);
                flex-shrink: 0;
                min-height: 80px;
                align-items: center;
            }
            
            /* Modal titre éditable */
            .modal-title-input {
                width: 100%;
                font-size: 24px;
                font-weight: 600;
                padding: 12px 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.9);
                color: var(--gray-900);
            }
            
            .modal-title-input:focus {
                outline: none;
                border-color: white;
                background: white;
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
            }
            
            /* Task detail view amélioré */
            .task-detail-container {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }
            
            .task-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-lg);
                background: var(--gray-50);
                border-radius: var(--border-radius);
                border: 1px solid var(--gray-200);
                flex-wrap: wrap;
                gap: var(--spacing-md);
                min-height: 80px;
            }
            
            .toolbar-left, .toolbar-right {
                display: flex;
                gap: var(--spacing-md);
                align-items: center;
                flex-wrap: wrap;
            }
            
            .task-main-content {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }
            
            /* Badges plus grands */
            .priority-badge-large,
            .status-badge-large,
            .email-badge-large,
            .replied-badge-large,
            .ai-badge-large {
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                white-space: nowrap;
            }
            
            .status-badge-large.todo {
                background: #dbeafe;
                color: #1e40af;
            }
            
            .status-badge-large.in-progress {
                background: #fef3c7;
                color: #92400e;
            }
            
            .status-badge-large.completed {
                background: #d1fae5;
                color: #065f46;
            }
            
            .replied-badge-large {
                background: #d1fae5;
                color: #065f46;
            }
            
            .email-badge-large {
                background: #dbeafe;
                color: #1e40af;
            }
            
            .ai-badge-large {
                background: #ede9fe;
                color: #7c3aed;
            }
            
            /* Content Sections améliorées */
            .content-section {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: var(--shadow-sm);
            }
            
            .section-header {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-md) var(--spacing-lg);
                background: var(--gray-50);
                border-bottom: 1px solid var(--gray-200);
            }
            
            .section-header i {
                font-size: 18px;
                color: var(--gray-600);
            }
            
            .section-header h4 {
                margin: 0;
                font-size: var(--text-lg);
                font-weight: 600;
                color: var(--gray-800);
            }
            
            .section-content {
                padding: var(--spacing-lg);
            }
            
            .section-text {
                font-size: var(--text-base);
                line-height: 1.6;
                color: var(--gray-700);
            }
            
            /* Actions List améliorée */
            .actions-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }
            
            .action-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-sm);
            }
            
            .action-number {
                width: 32px;
                height: 32px;
                background: var(--primary);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .action-text {
                flex: 1;
                font-size: var(--text-base);
                color: var(--gray-700);
                line-height: 1.5;
            }
            
            .action-deadline {
                font-size: 13px;
                color: var(--danger);
                font-weight: 500;
                white-space: nowrap;
            }
            
            .action-item-edit {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-sm);
            }
            
            /* Email Section améliorée */
            .email-section {
                background: #f0f9ff;
                border-color: #7dd3fc;
            }
            
            .email-section .section-header {
                background: #e0f2fe;
                border-bottom-color: #7dd3fc;
                color: #075985;
            }
            
            .email-header-info {
                background: white;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: var(--spacing-md);
                margin-bottom: var(--spacing-md);
            }
            
            .email-field {
                font-size: var(--text-base);
                color: var(--gray-700);
                margin-bottom: 8px;
                display: flex;
                gap: var(--spacing-sm);
            }
            
            .email-field:last-child {
                margin-bottom: 0;
            }
            
            .field-label {
                font-weight: 600;
                min-width: 80px;
                flex-shrink: 0;
            }
            
            .field-value {
                flex: 1;
            }
            
            .email-address {
                color: var(--gray-600);
            }
            
            .email-content-container {
                border: 1px solid #bae6fd;
                border-radius: 8px;
                overflow: hidden;
                background: white;
            }
            
            .email-content-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-md) var(--spacing-lg);
                background: #f0f9ff;
                border-bottom: 1px solid #bae6fd;
            }
            
            .email-content-header h5 {
                margin: 0;
                font-size: var(--text-base);
                font-weight: 600;
                color: #075985;
            }
            
            .email-type-badge {
                font-size: 12px;
                padding: 4px 10px;
                background: #dbeafe;
                color: #1e40af;
                border-radius: 12px;
                font-weight: 600;
            }
            
            .email-content-box {
                padding: var(--spacing-lg);
                max-height: 600px;
                overflow-y: auto;
                position: relative;
                background: white;
                font-size: var(--text-base);
                line-height: 1.6;
            }
            
            .email-content-box.text-content {
                font-family: 'Courier New', monospace;
                white-space: pre-wrap;
            }
            
            .email-content-box.html-content {
                background: #fafafa;
            }
            
            .email-html-content {
                padding: 0;
                font-size: var(--text-base);
                line-height: 1.6;
                color: var(--gray-700);
                overflow-x: auto;
                max-width: 100%;
            }
            
            /* Metadata Section améliorée */
            .metadata-section .section-header {
                background: var(--gray-50);
                border-bottom: 1px solid var(--gray-200);
            }
            
            .metadata-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: var(--spacing-lg);
                margin-bottom: var(--spacing-lg);
            }
            
            .metadata-item {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .metadata-label {
                font-size: 13px;
                font-weight: 600;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .metadata-value {
                font-size: var(--text-base);
                color: var(--gray-800);
                font-weight: 500;
            }
            
            .tag-display {
                display: inline-block;
                padding: 4px 10px;
                background: var(--gray-200);
                color: var(--gray-700);
                border-radius: 12px;
                font-size: 13px;
                margin-right: 6px;
                margin-bottom: 4px;
            }
            
            .edit-selectors {
                display: flex;
                gap: var(--spacing-lg);
                padding-top: var(--spacing-lg);
                border-top: 1px solid var(--gray-200);
            }
            
            .selector-item {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .selector-label {
                font-size: 13px;
                font-weight: 600;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* History Section */
            .history-section {
                margin-top: var(--spacing-lg);
                padding-top: var(--spacing-lg);
                border-top: 1px solid var(--gray-200);
            }
            
            .history-section h5 {
                margin: 0 0 var(--spacing-md) 0;
                font-size: var(--text-lg);
                font-weight: 600;
                color: var(--gray-800);
            }
            
            .history-items {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
            
            .history-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: var(--text-base);
                color: var(--gray-600);
                padding: 8px 0;
            }
            
            .history-label {
                font-weight: 600;
            }
            
            .history-value {
                color: var(--gray-700);
            }
            
            /* Sender Context amélioré */
            .sender-context-box {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                background: var(--gray-100);
                border: 1px solid var(--gray-200);
                border-radius: var(--border-radius);
                padding: var(--spacing-lg);
                margin-bottom: var(--spacing-lg);
            }
            
            .sender-avatar-large {
                width: 64px;
                height: 64px;
                background: linear-gradient(135deg, var(--primary), var(--primary-light));
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .sender-details {
                flex: 1;
            }
            
            .sender-name-large {
                font-weight: 700;
                color: var(--gray-800);
                font-size: var(--text-xl);
                margin-bottom: 4px;
            }
            
            .sender-email-large {
                font-size: var(--text-base);
                color: var(--gray-600);
                margin-bottom: 2px;
            }
            
            .sender-domain-large {
                font-size: 14px;
                color: var(--gray-500);
                font-weight: 500;
            }
            
            /* Reply Section améliorée */
            .reply-section-integrated {
                margin-top: var(--spacing-lg);
                padding: var(--spacing-lg);
                background: #f0f9ff;
                border: 2px solid #7dd3fc;
                border-radius: var(--border-radius);
            }
            
            .reply-wrapper h5 {
                margin: 0 0 var(--spacing-lg) 0;
                font-size: var(--text-xl);
                color: #075985;
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }
            
            .reply-suggestions {
                margin-bottom: var(--spacing-lg);
            }
            
            .suggestions-label {
                display: block;
                margin-bottom: var(--spacing-sm);
                font-size: var(--text-base);
                font-weight: 600;
                color: var(--gray-700);
            }
            
            .suggestion-pills {
                display: flex;
                gap: var(--spacing-sm);
                flex-wrap: wrap;
            }
            
            .suggestion-pill {
                padding: 12px 16px;
                border: 2px solid var(--gray-300);
                border-radius: 20px;
                background: white;
                font-size: var(--text-base);
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                min-height: 44px;
            }
            
            .suggestion-pill:hover {
                background: var(--gray-50);
                border-color: var(--gray-400);
                transform: translateY(-1px);
            }
            
            .reply-form {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }
            
            .reply-fields {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }
            
            .field-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .reply-content-area {
                margin-top: var(--spacing-sm);
            }
            
            .reply-actions {
                display: flex;
                justify-content: flex-end;
                gap: var(--spacing-md);
                margin-top: var(--spacing-md);
            }
            
            /* Formulaires améliorés */
            .form-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: var(--spacing-lg);
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .form-group.full-width {
                grid-column: 1 / -1;
            }
            
            .form-label {
                display: block;
                font-size: var(--text-base);
                font-weight: 600;
                color: var(--gray-700);
            }
            
            .form-input,
            .form-select,
            .form-textarea {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid var(--gray-200);
                border-radius: var(--border-radius);
                font-size: var(--text-base);
                transition: all 0.3s ease;
                background: white;
                min-height: 44px;
            }
            
            .form-input-large,
            .form-select-large {
                padding: 16px 20px;
                font-size: var(--text-lg);
                min-height: 52px;
            }
            
            .form-textarea-large {
                padding: 16px 20px;
                font-size: var(--text-base);
                line-height: 1.6;
            }
            
            .form-input:focus,
            .form-select:focus,
            .form-textarea:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            }
            
            .form-textarea {
                resize: vertical;
                min-height: 100px;
                font-family: inherit;
            }
            
            .required {
                color: var(--danger);
            }
            
            /* Loading amélioré */
            .loading-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 100px;
            }
            
            .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid var(--gray-200);
                border-radius: 50%;
                border-top-color: var(--primary);
                animation: spin 1s linear infinite;
                margin-bottom: var(--spacing-lg);
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Responsive amélioré */
            @media (max-width: 1400px) {
                .filters-grid {
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                }
            }
            
            @media (max-width: 1200px) {
                .filters-grid {
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                }
                
                .stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                }
            }
            
            @media (max-width: 992px) {
                .filters-container {
                    padding: var(--spacing-md);
                }
                
                .filters-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-sm);
                }
                
                .search-wrapper {
                    max-width: 100%;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .bulk-actions {
                    flex-direction: column;
                    align-items: stretch;
                    gap: var(--spacing-sm);
                }
                
                .bulk-buttons {
                    width: 100%;
                    justify-content: stretch;
                }
                
                .bulk-buttons .btn {
                    flex: 1;
                }
                
                .task-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .task-badges {
                    margin-top: 8px;
                }
                
                .form-grid {
                    grid-template-columns: 1fr;
                }
                
                .modal-container {
                    width: 95%;
                    margin: 10px;
                }
                
                .modal-xlarge {
                    max-width: 95%;
                }
                
                .toolbar-left,
                .toolbar-right {
                    width: 100%;
                    justify-content: center;
                }
                
                .metadata-grid {
                    grid-template-columns: 1fr;
                }
                
                .edit-selectors {
                    flex-direction: column;
                    gap: var(--spacing-md);
                }
            }
            
            @media (max-width: 768px) {
                .tasks-page {
                    padding: var(--spacing-md);
                }
                
                .page-title {
                    font-size: 28px;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                    gap: var(--spacing-sm);
                }
                
                .stat-card {
                    padding: var(--spacing-md);
                    min-height: 60px;
                }
                
                .stat-value {
                    font-size: 24px;
                }
                
                .stat-icon {
                    width: 40px;
                    height: 40px;
                    font-size: 18px;
                }
                
                .filters-container {
                    padding: var(--spacing-sm);
                    gap: var(--spacing-md);
                }
                
                .filters-grid {
                    grid-template-columns: 1fr;
                }
                
                .task-item {
                    padding: var(--spacing-md);
                    min-height: 60px;
                }
                
                .task-title {
                    font-size: var(--text-base);
                }
                
                .modal-header,
                .modal-body,
                .modal-footer {
                    padding: var(--spacing-md);
                }
                
                .modal-header h2 {
                    font-size: 22px;
                    padding-right: 60px;
                }
                
                .modal-close {
                    width: 36px;
                    height: 36px;
                    top: var(--spacing-md);
                    right: var(--spacing-md);
                }
                
                .task-toolbar {
                    padding: var(--spacing-md);
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .toolbar-left,
                .toolbar-right {
                    justify-content: space-between;
                }
                
                .sender-avatar-large {
                    width: 48px;
                    height: 48px;
                    font-size: 20px;
                }
                
                .sender-name-large {
                    font-size: var(--text-lg);
                }
                
                .sender-email-large {
                    font-size: var(--text-sm);
                }
            }
            
            @media (max-width: 480px) {
                :root {
                    --text-base: 15px;
                    --text-lg: 17px;
                    --text-xl: 19px;
                    --spacing-xs: 6px;
                    --spacing-sm: 10px;
                    --spacing-md: 14px;
                    --spacing-lg: 20px;
                    --spacing-xl: 28px;
                }
                
                .page-title {
                    font-size: 24px;
                }
                
                .btn-large {
                    padding: 14px 20px;
                    font-size: var(--text-base);
                }
                
                .task-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: var(--spacing-sm);
                }
                
                .task-checkbox,
                .task-select {
                    margin-right: 0;
                    align-self: flex-start;
                }
                
                .task-content {
                    padding-right: 0;
                }
                
                .task-actions {
                    opacity: 1;
                    justify-content: flex-end;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION
// =====================================

// Create global instances
if (!window.taskManager) {
    window.taskManager = new TaskManager();
}

if (!window.tasksView) {
    window.tasksView = new TasksView();
}

// Bind methods to prevent context issues
Object.getOwnPropertyNames(TaskManager.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.taskManager[name] === 'function') {
        window.taskManager[name] = window.taskManager[name].bind(window.taskManager);
    }
});

Object.getOwnPropertyNames(TasksView.prototype).forEach(name => {
    if (name !== 'constructor' && typeof window.tasksView[name] === 'function') {
        window.tasksView[name] = window.tasksView[name].bind(window.tasksView);
    }
});

console.log('✅ TaskManager v6.1 loaded - Interface ergonomique avec filtres corrigés et meilleure lisibilité');spinner"></div>
                    <p>Chargement des tâches...</p>
                </div>
            `;
            
            // Réessayer après un court délai
            setTimeout(() => {
                if (window.taskManager && window.taskManager.initialized) {
                    this.render(container);
                } else {
                    console.error('[TasksView] TaskManager still not ready');
                    container.innerHTML = '<div class="error">Erreur de chargement du gestionnaire de tâches</div>';
                }
            }, 500);
            return;
        }

        // Récupérer toutes les tâches
        const allTasks = window.taskManager.getAllTasks();
        console.log('[TasksView] Rendering with', allTasks.length, 'tasks');

        // Générer le HTML complet de la page
        const pageHTML = `
            <div class="tasks-page">
                ${this.renderHeader()}
                ${this.renderStats()}
                ${this.renderFilters()}
                ${this.renderBulkActions()}
                <div id="tasksListContainer" class="tasks-list-container">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        // Injecter le HTML dans le container
        container.innerHTML = pageHTML;

        // Attacher les event listeners
        this.attachEventListeners();
        
        // Ajouter les styles si nécessaire
        this.addStyles();
        
        console.log('[TasksView] Page rendered successfully');
    }

    renderHeader() {
        return `
            <div class="page-header">
                <h1 class="page-title">Gestion des Tâches</h1>
                <div class="page-actions">
                    <button class="btn btn-primary btn-large" onclick="window.tasksView.showCreateModal()">
                        <i class="fas fa-plus"></i> Nouvelle tâche
                    </button>
                </div>
            </div>
        `;
    }

    renderStats() {
        const stats = window.taskManager.getStats();
        
        return `
            <div class="stats-grid">
                <div class="stat-card" onclick="window.tasksView.setFilter('status', 'all')" style="--accent-color: var(--primary)">
                    <div class="stat-icon">
                        <i class="fas fa-list"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('status', 'todo')" style="--accent-color: var(--info)">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.todo}</div>
                        <div class="stat-label">À faire</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('status', 'in-progress')" style="--accent-color: var(--warning)">
                    <div class="stat-icon">
                        <i class="fas fa-spinner"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.inProgress}</div>
                        <div class="stat-label">En cours</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('status', 'completed')" style="--accent-color: var(--success)">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.completed}</div>
                        <div class="stat-label">Terminées</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('overdue', true)" style="--accent-color: var(--danger)">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.overdue}</div>
                        <div class="stat-label">En retard</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('needsReply', true)" style="--accent-color: var(--primary)">
                    <div class="stat-icon">
                        <i class="fas fa-reply"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.needsReply}</div>
                        <div class="stat-label">À répondre</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFilters() {
        const senders = window.taskManager.getSenders();
        const allTags = this.getAllTags();
        
        // Compter les filtres actifs
        let activeFilterCount = 0;
        if (this.currentFilters.status !== 'all') activeFilterCount++;
        if (this.currentFilters.priority !== 'all') activeFilterCount++;
        if (this.currentFilters.sender !== 'all') activeFilterCount++;
        if (this.currentFilters.dateFilter && this.currentFilters.dateFilter !== 'all') activeFilterCount++;
        if (this.currentFilters.tag && this.currentFilters.tag !== 'all') activeFilterCount++;
        if (this.currentFilters.search) activeFilterCount++;
        
        return `
            <div class="filters-section">
                <div class="filters-container">
                    <!-- Recherche -->
                    <div class="search-section">
                        <div class="search-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   class="search-input" 
                                   id="filter-search" 
                                   placeholder="Rechercher dans les tâches..." 
                                   value="${this.currentFilters.search}">
                            <button class="search-clear" 
                                    id="searchClearBtn" 
                                    style="display: ${this.currentFilters.search ? 'flex' : 'none'}"
                                    onclick="window.tasksView.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Filtres -->
                    <div class="filters-grid">
                        <!-- Statut -->
                        <div class="filter-dropdown ${this.currentFilters.status !== 'all' ? 'has-filter' : ''}" id="statusDropdown">
                            <button class="filter-button" onclick="window.tasksView.toggleDropdown('statusDropdown')">
                                <div class="button-content">
                                    <i class="fas fa-tasks button-icon"></i>
                                    <span class="button-text">${this.getFilterLabel('status', this.currentFilters.status)}</span>
                                    <i class="fas fa-chevron-down chevron-icon"></i>
                                </div>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-item ${this.currentFilters.status === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('status', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    <span>Tous les statuts</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.status === 'todo' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('status', 'todo')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-clock item-icon"></i>
                                    <span>À faire</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.status === 'in-progress' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('status', 'in-progress')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-spinner item-icon"></i>
                                    <span>En cours</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.status === 'completed' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('status', 'completed')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-check-circle item-icon"></i>
                                    <span>Terminées</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Priorité -->
                        <div class="filter-dropdown ${this.currentFilters.priority !== 'all' ? 'has-filter' : ''}" id="priorityDropdown">
                            <button class="filter-button" onclick="window.tasksView.toggleDropdown('priorityDropdown')">
                                <div class="button-content">
                                    <i class="fas fa-flag button-icon"></i>
                                    <span class="button-text">${this.getFilterLabel('priority', this.currentFilters.priority)}</span>
                                    <i class="fas fa-chevron-down chevron-icon"></i>
                                </div>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-item ${this.currentFilters.priority === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    <span>Toutes priorités</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.priority === 'urgent' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'urgent')">
                                    <i class="fas fa-check check-icon"></i>
                                    <span class="priority-label urgent">🚨 Urgent</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.priority === 'high' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'high')">
                                    <i class="fas fa-check check-icon"></i>
                                    <span class="priority-label high">⚡ Haute</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.priority === 'medium' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'medium')">
                                    <i class="fas fa-check check-icon"></i>
                                    <span class="priority-label medium">📌 Normale</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.priority === 'low' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'low')">
                                    <i class="fas fa-check check-icon"></i>
                                    <span class="priority-label low">📄 Basse</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Expéditeurs -->
                        <div class="filter-dropdown ${this.currentFilters.sender !== 'all' ? 'has-filter' : ''}" id="senderDropdown">
                            <button class="filter-button" onclick="window.tasksView.toggleDropdown('senderDropdown')">
                                <div class="button-content">
                                    <i class="fas fa-user button-icon"></i>
                                    <span class="button-text">${this.getFilterLabel('sender', this.currentFilters.sender)}</span>
                                    <i class="fas fa-chevron-down chevron-icon"></i>
                                </div>
                            </button>
                            <div class="dropdown-menu dropdown-menu-large">
                                <div class="dropdown-item ${this.currentFilters.sender === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('sender', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    <span>Tous les expéditeurs</span>
                                </div>
                                ${senders.length > 0 ? `
                                    <div class="dropdown-divider"></div>
                                    <div class="dropdown-section-title">Expéditeurs récents</div>
                                    ${senders.slice(0, 10).map(sender => `
                                        <div class="dropdown-item sender-item ${this.currentFilters.sender === sender.email ? 'active' : ''}" 
                                             onclick="window.tasksView.setFilter('sender', '${sender.email}')">
                                            <i class="fas fa-check check-icon"></i>
                                            <div class="sender-avatar">${sender.name.charAt(0).toUpperCase()}</div>
                                            <div class="sender-info">
                                                <div class="sender-name">${this.escapeHtml(sender.name)}</div>
                                                <div class="sender-email">${this.escapeHtml(sender.email)}</div>
                                            </div>
                                            <span class="sender-count">${sender.count}</span>
                                        </div>
                                    `).join('')}
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Dates -->
                        <div class="filter-dropdown ${this.currentFilters.dateFilter && this.currentFilters.dateFilter !== 'all' ? 'has-filter' : ''}" id="dateDropdown">
                            <button class="filter-button" onclick="window.tasksView.toggleDropdown('dateDropdown')">
                                <div class="button-content">
                                    <i class="fas fa-calendar button-icon"></i>
                                    <span class="button-text">${this.getFilterLabel('dateFilter', this.currentFilters.dateFilter || 'all')}</span>
                                    <i class="fas fa-chevron-down chevron-icon"></i>
                                </div>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-item ${!this.currentFilters.dateFilter || this.currentFilters.dateFilter === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    <span>Toutes les dates</span>
                                </div>
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-item ${this.currentFilters.dateFilter === 'today' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'today')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-day item-icon"></i>
                                    <span>Aujourd'hui</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.dateFilter === 'week' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'week')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-week item-icon"></i>
                                    <span>Cette semaine</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.dateFilter === 'month' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'month')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-alt item-icon"></i>
                                    <span>Ce mois</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.dateFilter === 'overdue' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'overdue')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-exclamation-triangle item-icon"></i>
                                    <span>En retard</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tags -->
                        <div class="filter-dropdown ${this.currentFilters.tag && this.currentFilters.tag !== 'all' ? 'has-filter' : ''}" id="tagDropdown">
                            <button class="filter-button" onclick="window.tasksView.toggleDropdown('tagDropdown')">
                                <div class="button-content">
                                    <i class="fas fa-tags button-icon"></i>
                                    <span class="button-text">${this.getFilterLabel('tag', this.currentFilters.tag || 'all')}</span>
                                    <i class="fas fa-chevron-down chevron-icon"></i>
                                </div>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-item ${!this.currentFilters.tag || this.currentFilters.tag === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('tag', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    <span>Tous les tags</span>
                                </div>
                                ${allTags.length > 0 ? `
                                    <div class="dropdown-divider"></div>
                                    <div class="dropdown-section-title">Tags disponibles</div>
                                    ${allTags.map(tag => `
                                        <div class="dropdown-item tag-item ${this.currentFilters.tag === tag.name ? 'active' : ''}" 
                                             onclick="window.tasksView.setFilter('tag', '${tag.name}')">
                                            <i class="fas fa-check check-icon"></i>
                                            <i class="fas fa-tag item-icon"></i>
                                            <span class="tag-name">${this.escapeHtml(tag.name)}</span>
                                            <span class="tag-count">${tag.count}</span>
                                        </div>
                                    `).join('')}
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Tri -->
                        <div class="filter-dropdown" id="sortDropdown">
                            <button class="filter-button sort-button" onclick="window.tasksView.toggleDropdown('sortDropdown')">
                                <div class="button-content">
                                    <i class="fas fa-sort button-icon"></i>
                                    <span class="button-text">${this.getFilterLabel('sortBy', this.currentFilters.sortBy)}</span>
                                    <i class="fas fa-chevron-down chevron-icon"></i>
                                </div>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-section-title">Trier par</div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'priority' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('priority')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-flag item-icon"></i>
                                    <span>Priorité</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'dueDate' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('dueDate')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-check item-icon"></i>
                                    <span>Échéance</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'created' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('created')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-plus item-icon"></i>
                                    <span>Date de création</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'updated' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('updated')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-check item-icon"></i>
                                    <span>Dernière modification</span>
                                </div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'alphabetical' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('alphabetical')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-sort-alpha-down item-icon"></i>
                                    <span>Alphabétique</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bouton reset -->
                    <div class="reset-section ${activeFilterCount > 0 ? 'visible' : ''}">
                        <button class="btn btn-secondary btn-large reset-btn" onclick="window.tasksView.resetFilters()">
                            <i class="fas fa-times"></i> 
                            <span>Réinitialiser (${activeFilterCount})</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getAllTags() {
        const tagsMap = new Map();
        
        window.taskManager.getAllTasks().forEach(task => {
            if (task.tags && task.tags.length > 0) {
                task.tags.forEach(tag => {
                    if (!tagsMap.has(tag)) {
                        tagsMap.set(tag, { name: tag, count: 0 });
                    }
                    tagsMap.get(tag).count++;
                });
            }
        });
        
        return Array.from(tagsMap.values()).sort((a, b) => b.count - a.count);
    }

    renderBulkActions() {
        const filteredTasks = window.taskManager.filterTasks(this.currentFilters);
        const allSelected = filteredTasks.length > 0 && 
            filteredTasks.every(task => this.selectedTasks.has(task.id));
        
        return `
            <div class="bulk-actions ${this.selectedTasks.size > 0 ? 'visible' : ''}" id="bulkActions">
                <div class="bulk-info">
                    <span class="selection-count">${this.selectedTasks.size}</span> tâche(s) sélectionnée(s)
                </div>
                <div class="bulk-buttons">
                    <button class="btn btn-secondary btn-large" onclick="window.tasksView.toggleSelectAll()">
                        <i class="fas fa-check-square"></i> 
                        <span>${allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}</span>
                    </button>
                    <button class="btn btn-danger btn-large" onclick="window.tasksView.deleteSelected()">
                        <i class="fas fa-trash"></i> 
                        <span>Supprimer</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        console.log('[TasksView] Rendering', tasks.length, 'filtered tasks');
        
        if (tasks.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3 class="empty-state-title">Aucune tâche trouvée</h3>
                    <p class="empty-state-text">${this.currentFilters.search ? 'Aucun résultat pour votre recherche' : 'Créez une nouvelle tâche ou ajustez les filtres'}</p>
                    ${this.currentFilters.status !== 'all' || this.currentFilters.priority !== 'all' ? 
                        '<button class="btn btn-primary btn-large" onclick="window.tasksView.resetFilters()">Réinitialiser les filtres</button>' : 
                        '<button class="btn btn-primary btn-large" onclick="window.tasksView.showCreateModal()">Créer une tâche</button>'
                    }
                </div>
            `;
        }
        
        return `
            <div class="tasks-list">
                ${tasks.map(task => this.renderTaskItem(task)).join('')}
            </div>
        `;
    }

    renderTaskItem(task) {
        const isCompleted = task.status === 'completed';
        const hasAI = task.aiAnalysis && task.aiAnalysis.method;
        const needsReply = task.hasEmail && !task.emailReplied && !isCompleted;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
        const isSelected = this.selectedTasks.has(task.id);
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                
                <div class="task-checkbox">
                    <div class="custom-checkbox ${isCompleted ? 'checked' : ''}" 
                         onclick="event.stopPropagation(); window.tasksView.toggleTaskStatus('${task.id}')">
                        ${isCompleted ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                </div>
                
                <div class="task-select">
                    <div class="custom-checkbox ${isSelected ? 'checked' : ''}" 
                         onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                        ${isSelected ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                </div>
                
                <div class="task-content" onclick="window.tasksView.showTaskModal('${task.id}')">
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="task-badges">
                            <span class="priority-badge ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                            ${task.hasEmail ? '<span class="email-badge"><i class="fas fa-envelope"></i></span>' : ''}
                            ${hasAI ? '<span class="ai-badge"><i class="fas fa-robot"></i></span>' : ''}
                            ${needsReply ? '<span class="reply-badge"><i class="fas fa-reply"></i></span>' : ''}
                        </div>
                    </div>
                    
                    <div class="task-description">
                        ${task.description ? `<p>${this.escapeHtml(task.description).substring(0, 150)}${task.description.length > 150 ? '...' : ''}</p>` : ''}
                        ${task.tags && task.tags.length > 0 ? `
                            <div class="task-tags">
                                ${task.tags.map(tag => `
                                    <span class="task-tag" onclick="event.stopPropagation(); window.tasksView.setFilter('tag', '${tag}')">
                                        <i class="fas fa-tag"></i>
                                        ${this.escapeHtml(tag)}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="task-meta">
                        ${task.emailFromName ? `
                            <span class="meta-item">
                                <i class="fas fa-user"></i> 
                                <span>${this.escapeHtml(task.emailFromName)}</span>
                            </span>
                        ` : ''}
                        
                        ${task.dueDate ? `
                            <span class="meta-item ${isOverdue ? 'overdue' : ''}">
                                <i class="fas fa-calendar"></i> 
                                <span>${this.formatDate(task.dueDate)}</span>
                            </span>
                        ` : ''}
                        
                        <span class="meta-item">
                            <i class="fas fa-clock"></i> 
                            <span>${this.formatDate(task.createdAt)}</span>
                        </span>
                    </div>
                </div>
                
                <div class="task-actions">
                    ${needsReply ? `
                        <button class="action-btn primary" 
                                onclick="event.stopPropagation(); window.tasksView.quickReply('${task.id}')"
                                title="Répondre rapidement">
                            <i class="fas fa-reply"></i>
                        </button>
                    ` : ''}
                    <button class="action-btn danger" 
                            onclick="event.stopPropagation(); window.tasksView.deleteTask('${task.id}')"
                            title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Gestion des dropdowns améliorée
    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;
        
        const isOpen = dropdown.classList.contains('open');
        
        // Fermer tous les dropdowns
        this.closeAllDropdowns();
        
        // Ouvrir/fermer le dropdown actuel
        if (!isOpen) {
            dropdown.classList.add('open');
            this.positionDropdown(dropdown);
        }
    }
    
    closeAllDropdowns() {
        document.querySelectorAll('.filter-dropdown.open').forEach(dd => {
            dd.classList.remove('open');
        });
    }
    
    positionDropdown(dropdown) {
        const menu = dropdown.querySelector('.dropdown-menu');
        if (!menu) return;
        
        // Reset styles pour calculer la position
        menu.style.left = '';
        menu.style.right = '';
        menu.style.transform = '';
        
        const rect = dropdown.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Si le menu dépasse à droite, l'aligner à droite
        if (rect.left + menuRect.width > viewportWidth - 20) {
            menu.style.right = '0';
            menu.style.left = 'auto';
        }
        
        // Si le menu est trop grand, ajuster la hauteur
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom - 10;
        
        if (menuRect.height > spaceBelow && spaceBelow < 200) {
            menu.style.maxHeight = Math.max(spaceBelow - 20, 150) + 'px';
        }
    }

    // Modal de création avec style amélioré
    showCreateModal() {
        // Nettoyer tout modal existant
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        // Créer un nouvel id unique
        const uniqueId = 'create_task_modal_' + Date.now();

        // Créer le modal avec style inline pour forcer l'affichage
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay task-modal">
                <div class="modal-container modal-large">
                    <div class="modal-header gradient-header">
                        <h2>Nouvelle tâche</h2>
                        <button class="modal-close" onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="createForm" onsubmit="window.tasksView.createTask(event); return false;">
                        <div class="modal-body">
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label class="form-label">
                                        Titre <span class="required">*</span>
                                    </label>
                                    <input type="text" 
                                           name="title" 
                                           class="form-input form-input-large"
                                           placeholder="Titre de la tâche..."
                                           required>
                                </div>
                                
                                <div class="form-group full-width">
                                    <label class="form-label">Description</label>
                                    <textarea name="description" 
                                              class="form-textarea form-textarea-large"
                                              rows="5"
                                              placeholder="Description détaillée..."></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Priorité</label>
                                    <select name="priority" class="form-select form-select-large">
                                        <option value="low">📄 Basse</option>
                                        <option value="medium" selected>📌 Normale</option>
                                        <option value="high">⚡ Haute</option>
                                        <option value="urgent">🚨 Urgente</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Date d'échéance</label>
                                    <input type="date" 
                                           name="dueDate" 
                                           class="form-input form-input-large">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Client</label>
                                    <input type="text" 
                                           name="client" 
                                           class="form-input form-input-large"
                                           placeholder="Nom du client ou entreprise...">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Tags</label>
                                    <input type="text" 
                                           name="tags" 
                                           class="form-input form-input-large"
                                           placeholder="tag1, tag2, tag3...">
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" 
                                    class="btn btn-secondary btn-large"
                                    onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';">
                                Annuler
                            </button>
                            <button type="submit" class="btn btn-primary btn-large">
                                <i class="fas fa-plus"></i> Créer la tâche
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    // Modal de détail avec style amélioré
    showTaskModal(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
        // Nettoyer tout modal existant
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        this.currentTaskDetail = task;
        this.editMode = false;
        
        // Créer un nouvel id unique
        const uniqueId = 'task_detail_modal_' + Date.now();

        // Créer le modal avec style amélioré
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay task-modal">
                <div class="modal-container modal-xlarge">
                    <div class="modal-header gradient-header">
                        <h2 id="modalTitle">${this.escapeHtml(task.title)}</h2>
                        <input type="text" 
                               id="modalTitleInput" 
                               value="${this.escapeHtml(task.title)}"
                               class="modal-title-input"
                               style="display: none;">
                        <button class="modal-close" onclick="window.tasksView.closeModalById('${uniqueId}');">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="task-detail-container">
                            <!-- Barre d'outils -->
                            <div class="task-toolbar">
                                <div class="toolbar-left">
                                    <button id="editModeBtn" 
                                            class="btn btn-secondary btn-large" 
                                            onclick="window.tasksView.toggleEditMode();">
                                        <i class="fas fa-edit"></i> 
                                        <span>Modifier</span>
                                    </button>
                                    ${task.hasEmail && !task.emailReplied ? `
                                        <button class="btn btn-primary btn-large" 
                                                onclick="window.tasksView.showReplySection();">
                                            <i class="fas fa-reply"></i> 
                                            <span>Répondre à l'email</span>
                                        </button>
                                    ` : ''}
                                </div>
                                <div class="toolbar-right">
                                    <span class="priority-badge-large ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                                    <span class="status-badge-large ${task.status}">${this.getStatusLabel(task.status)}</span>
                                    ${task.hasEmail ? '<span class="email-badge-large">📧 Email</span>' : ''}
                                    ${task.emailReplied ? '<span class="replied-badge-large">✅ Répondu</span>' : ''}
                                    ${task.aiGenerated ? `<span class="ai-badge-large">🤖 ${task.method || 'AI'}</span>` : ''}
                                </div>
                            </div>
                            
                            <!-- Contenu principal -->
                            <div class="task-main-content">
                                ${task.hasEmail && task.emailFromName ? this.renderSenderContext(task) : ''}
                                
                                ${this.renderTaskSections(task)}
                                
                                ${task.hasEmail && (task.emailContent || task.emailFullHtml || task.emailHtml) ? this.renderEmailSection(task) : ''}
                                
                                ${this.renderMetadataSection(task)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="
