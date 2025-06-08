// =====================================
// TASKMANAGER COMPLET RÉÉCRIT - INTERFACE EMAILSORTPRO
// =====================================

// =====================================
// ENHANCED TASK MANAGER CLASS (CONSERVÉE)
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
            console.log('[TaskManager] Initializing...');
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
                console.log('[TaskManager] No saved tasks found, creating sample tasks');
                this.generateSampleTasks();
            }
        } catch (error) {
            console.error('[TaskManager] Error loading tasks:', error);
            this.tasks = [];
        }
    }

    generateSampleTasks() {
        const sampleTasks = [
            {
                id: 'sample_1',
                title: 'Répondre à l\'équipe marketing sur la campagne Q2',
                description: 'Validation des visuels et du budget 50k€ pour la campagne marketing Q2',
                priority: 'high',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'sarah.martin@acme-corp.com',
                emailFromName: 'Sarah Martin',
                emailSubject: 'Validation campagne marketing Q2',
                emailDate: '2025-06-06T09:15:00Z',
                emailDomain: 'acme-corp.com',
                emailContent: `Bonjour,\n\nJ'espère que vous allez bien. Je vous contacte concernant notre campagne marketing Q2 qui nécessite votre validation.\n\nMerci d'avance,\nSarah Martin`,
                tags: ['marketing', 'validation', 'q2'],
                client: 'ACME Corp',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                needsReply: true,
                dueDate: '2025-06-08',
                summary: 'Validation urgente de la campagne marketing Q2 avec budget de 50k€',
                actions: [
                    { text: 'Valider les visuels de la campagne', deadline: null },
                    { text: 'Confirmer le budget alloué', deadline: '2025-06-07' }
                ],
                suggestedReplies: [
                    {
                        tone: 'formel',
                        subject: 'Re: Validation campagne marketing Q2 - Approuvé',
                        content: `Bonjour Sarah,\n\nMerci pour ce dossier complet.\n\nJe valide l'ensemble des éléments proposés.\n\nCordialement`
                    }
                ],
                method: 'ai'
            },
            {
                id: 'sample_2',
                title: 'Finaliser le rapport trimestriel',
                description: 'Compilation des données Q1 pour le rapport de direction',
                priority: 'medium',
                status: 'in-progress',
                category: 'work',
                hasEmail: false,
                client: 'Interne',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date().toISOString(),
                dueDate: '2025-06-10',
                method: 'manual'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email:', taskData.title);
        
        const taskId = taskData.id || this.generateId();
        const fullEmailContent = this.extractFullEmailContent(email, taskData);
        
        const task = {
            id: taskId,
            title: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'email',
            
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || (email?.from?.emailAddress?.address),
            emailFromName: taskData.emailFromName || (email?.from?.emailAddress?.name),
            emailSubject: taskData.emailSubject || email?.subject,
            emailContent: fullEmailContent,
            emailDomain: taskData.emailDomain || (taskData.emailFrom ? taskData.emailFrom.split('@')[1] : ''),
            hasEmail: true,
            emailReplied: false,
            emailDate: taskData.emailDate || email?.receivedDateTime,
            needsReply: taskData.needsReply !== false,
            hasAttachments: email?.hasAttachments || false,
            
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            suggestedReplies: taskData.suggestedReplies || [],
            
            tags: taskData.tags || [],
            client: taskData.client || 'Externe',
            
            createdAt: taskData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            method: taskData.method || 'ai'
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        return task;
    }

    extractFullEmailContent(email, taskData) {
        if (taskData.emailContent && taskData.emailContent.length > 50) {
            return taskData.emailContent;
        }
        
        if (email?.body?.content) {
            return this.cleanEmailContent(email.body.content);
        }
        
        if (email?.bodyPreview && email.bodyPreview.length > 20) {
            return this.buildExtendedPreview(email);
        }
        
        return this.buildMinimalEmailContent(email, taskData);
    }

    cleanEmailContent(content) {
        if (!content) return '';
        
        const cleanContent = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();
            
        return cleanContent.length > 100 ? cleanContent : '';
    }

    buildExtendedPreview(email) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const subject = email.subject || 'Sans sujet';
        const date = email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleString('fr-FR') : '';
        const preview = email.bodyPreview || '';
        
        return `Email de: ${senderName} <${senderEmail}>
Date: ${date}
Sujet: ${subject}

${preview}

[Contenu complet non disponible - Aperçu seulement]`;
    }

    buildMinimalEmailContent(email, taskData) {
        const senderName = taskData.emailFromName || email?.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = taskData.emailFrom || email?.from?.emailAddress?.address || '';
        const subject = taskData.emailSubject || email?.subject || 'Sans sujet';
        const date = taskData.emailDate || email?.receivedDateTime;
        const formattedDate = date ? new Date(date).toLocaleString('fr-FR') : 'Date inconnue';
        
        let content = `Email de: ${senderName} <${senderEmail}>
Date: ${formattedDate}
Sujet: ${subject}

`;

        if (taskData.summary) {
            content += `${taskData.summary}\n\n`;
        }
        
        if (taskData.actions && taskData.actions.length > 0) {
            content += `Actions mentionnées dans l'email:\n`;
            taskData.actions.forEach((action, idx) => {
                content += `${idx + 1}. ${action.text}\n`;
            });
            content += '\n';
        }
        
        content += `[Contenu complet de l'email non disponible - Résumé généré par IA]`;
        
        return content;
    }

    createTask(taskData) {
        console.log('[TaskManager] Creating normal task:', taskData.title || 'Untitled');
        
        const task = {
            id: taskData.id || this.generateId(),
            title: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'other',
            
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || null,
            emailFromName: taskData.emailFromName || null,
            emailSubject: taskData.emailSubject || null,
            emailContent: taskData.emailContent || '',
            hasEmail: !!(taskData.emailId || taskData.emailFrom || taskData.emailContent),
            emailReplied: false,
            emailDate: taskData.emailDate || taskData.createdAt,
            needsReply: taskData.needsReply || false,
            
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            suggestedReplies: taskData.suggestedReplies || [],
            
            tags: taskData.tags || [],
            client: taskData.client || 'Interne',
            
            createdAt: taskData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            method: taskData.method || 'manual'
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        return task;
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

    filterTasks(filters = {}) {
        let filtered = [...this.tasks];
        
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }
        
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(task => task.category === filters.category);
        }
        
        if (filters.client && filters.client !== 'all') {
            filtered = filtered.filter(task => task.client === filters.client);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                (task.emailFromName && task.emailFromName.toLowerCase().includes(search)) ||
                (task.client && task.client.toLowerCase().includes(search))
            );
        }
        
        if (filters.overdue) {
            filtered = filtered.filter(task => {
                if (!task.dueDate || task.status === 'completed') return false;
                return new Date(task.dueDate) < new Date();
            });
        }
        
        if (filters.needsReply) {
            filtered = filtered.filter(task => 
                task.needsReply || (task.hasEmail && !task.emailReplied && task.status !== 'completed')
            );
        }
        
        return this.sortTasks(filtered, filters.sortBy || 'created');
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
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'title':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'updated':
                sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'created':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return sorted;
    }

    getStats() {
        const byStatus = {
            todo: this.tasks.filter(t => t.status === 'todo').length,
            'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
            completed: this.tasks.filter(t => t.status === 'completed').length
        };

        return {
            total: this.tasks.length,
            byStatus,
            todo: byStatus.todo,
            inProgress: byStatus['in-progress'],
            completed: byStatus.completed,
            overdue: this.tasks.filter(t => {
                if (!t.dueDate || t.status === 'completed') return false;
                return new Date(t.dueDate) < new Date();
            }).length,
            needsReply: this.tasks.filter(t => 
                t.needsReply || (t.hasEmail && !t.emailReplied && t.status !== 'completed')
            ).length
        };
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

    emitTaskUpdate(action, task) {
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('taskUpdate', {
                detail: { action, task }
            }));
        }
    }
}

// =====================================
// TASKSVIEW COMPLÈTEMENT RÉÉCRITE - STYLE EMAILSORTPRO
// =====================================
class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            client: 'all',
            search: '',
            sortBy: 'created',
            overdue: false,
            needsReply: false
        };
        
        this.selectedTasks = new Set();
        this.currentViewMode = 'condensed';
        this.showAdvancedFilters = false;
        
        window.addEventListener('taskUpdate', () => {
            this.refreshView();
        });
    }

    // MÉTHODE RENDER PRINCIPALE - STYLE EMAILSORTPRO
    render(container) {
        if (!container) {
            console.error('[TasksView] No container provided');
            return;
        }

        if (!window.taskManager || !window.taskManager.initialized) {
            container.innerHTML = this.renderLoading();
            setTimeout(() => {
                if (window.taskManager && window.taskManager.initialized) {
                    this.render(container);
                }
            }, 500);
            return;
        }

        const stats = window.taskManager.getStats();
        
        container.innerHTML = `
            <div class="emailsort-tasks">
                ${this.renderHeader(stats)}
                ${this.renderStatusFilters(stats)}
                ${this.renderAdvancedFilters()}
                ${this.renderTasksList()}
            </div>
        `;

        this.addStyles();
        this.setupEventListeners();
        console.log('[TasksView] EmailSortPro interface rendered');
    }

    renderLoading() {
        return `
            <div class="emailsort-loading">
                <div class="loading-spinner"></div>
                <p>Chargement des tâches...</p>
            </div>
        `;
    }

    renderHeader(stats) {
        return `
            <div class="emailsort-header">
                <div class="header-left">
                    <h1 class="page-title">Tâches</h1>
                    <span class="task-count">${stats.total} tâche${stats.total > 1 ? 's' : ''}</span>
                </div>
                
                <div class="header-center">
                    <div class="search-box">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               class="search-input" 
                               id="taskSearchInput"
                               placeholder="Rechercher dans les tâches..." 
                               value="${this.currentFilters.search}">
                    </div>
                </div>
                
                <div class="header-right">
                    <div class="view-toggle">
                        <button class="view-btn ${this.currentViewMode === 'condensed' ? 'active' : ''}" 
                                onclick="window.tasksView.setViewMode('condensed')"
                                title="Vue condensée">
                            <i class="fas fa-th-list"></i>
                            <span>Condensé</span>
                        </button>
                        <button class="view-btn ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                onclick="window.tasksView.setViewMode('detailed')"
                                title="Vue détaillée">
                            <i class="fas fa-th-large"></i>
                            <span>Détaillé</span>
                        </button>
                    </div>
                    
                    <button class="new-task-btn" onclick="window.tasksView.showCreateModal()">
                        <i class="fas fa-plus"></i>
                        <span>Nouvelle tâche</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderStatusFilters(stats) {
        const filters = [
            { id: 'all', label: 'Toutes', icon: '📋', count: stats.total, color: '#6366f1' },
            { id: 'todo', label: 'À faire', icon: '⏳', count: stats.todo, color: '#3b82f6' },
            { id: 'in-progress', label: 'En cours', icon: '🔄', count: stats.inProgress, color: '#f59e0b' },
            { id: 'overdue', label: 'En retard', icon: '⚠️', count: stats.overdue, color: '#ef4444' },
            { id: 'needsReply', label: 'À répondre', icon: '💬', count: stats.needsReply, color: '#8b5cf6' },
            { id: 'completed', label: 'Terminées', icon: '✅', count: stats.completed, color: '#10b981' }
        ];

        const filtersHtml = filters.map(filter => `
            <button class="status-filter ${this.isStatusActive(filter.id) ? 'active' : ''}" 
                    style="--filter-color: ${filter.color}"
                    onclick="window.tasksView.filterByStatus('${filter.id}')">
                <span class="filter-icon">${filter.icon}</span>
                <span class="filter-label">${filter.label}</span>
                <span class="filter-count">${filter.count}</span>
            </button>
        `).join('');

        return `
            <div class="status-filters">
                ${filtersHtml}
            </div>
        `;
    }

    renderAdvancedFilters() {
        const activeCount = this.getActiveFiltersCount();
        
        return `
            <div class="advanced-filters-section">
                <button class="advanced-toggle ${this.showAdvancedFilters ? 'open' : ''}" 
                        onclick="window.tasksView.toggleAdvancedFilters()">
                    <i class="fas fa-filter"></i>
                    <span>Filtres avancés</span>
                    <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                    ${activeCount > 0 ? `<span class="filter-badge">${activeCount}</span>` : ''}
                </button>
                
                <div class="advanced-filters ${this.showAdvancedFilters ? 'show' : ''}">
                    <div class="filters-grid">
                        <select class="filter-select" id="priorityFilter" onchange="window.tasksView.updateFilter('priority', this.value)">
                            <option value="all">Toutes priorités</option>
                            <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>🔴 Urgente</option>
                            <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>🟠 Haute</option>
                            <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>🔵 Normale</option>
                            <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>🟢 Basse</option>
                        </select>
                        
                        <select class="filter-select" id="clientFilter" onchange="window.tasksView.updateFilter('client', this.value)">
                            ${this.buildClientOptions()}
                        </select>
                        
                        <select class="filter-select" id="sortFilter" onchange="window.tasksView.updateFilter('sortBy', this.value)">
                            <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Plus récentes</option>
                            <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                            <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Échéance</option>
                            <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre A-Z</option>
                        </select>
                        
                        <button class="reset-btn" onclick="window.tasksView.resetFilters()">
                            <i class="fas fa-undo"></i>
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        
        if (tasks.length === 0) {
            return this.renderEmptyState();
        }

        const tasksHtml = tasks.map(task => this.renderTask(task)).join('');
        
        return `
            <div class="tasks-container">
                <div class="tasks-list">
                    ${tasksHtml}
                </div>
            </div>
        `;
    }

    renderTask(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityColor = this.getPriorityColor(task.priority);
        
        const senderInfo = task.hasEmail ? 
            (task.emailFromName || task.emailFrom?.split('@')[0] || 'Email') : 
            (task.client || 'Interne');
        
        const timeInfo = this.formatTime(task.createdAt);
        const badges = this.getBadges(task);
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <div class="task-checkbox">
                    <input type="checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleSelection('${task.id}')">
                </div>
                
                <div class="task-content">
                    <div class="task-title" style="border-left: 3px solid ${priorityColor}">
                        ${this.escapeHtml(task.title)}
                    </div>
                    <div class="task-meta">
                        <span class="task-sender">${this.escapeHtml(senderInfo)}</span>
                        ${badges}
                        <span class="task-time">${timeInfo}</span>
                    </div>
                </div>
                
                <div class="task-actions">
                    ${this.renderTaskActions(task)}
                </div>
            </div>
        `;
    }

    renderTaskActions(task) {
        const actions = [];
        
        if (task.hasEmail && !task.emailReplied && task.status !== 'completed') {
            actions.push(`
                <button class="task-action reply" 
                        onclick="event.stopPropagation(); window.tasksView.replyToEmail('${task.id}')"
                        title="Répondre">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="task-action complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="task-action more" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Plus d'options">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        `);
        
        return actions.join('');
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3>Aucune tâche trouvée</h3>
                <p>${this.hasActiveFilters() ? 'Aucune tâche ne correspond à vos critères' : 'Vous n\'avez aucune tâche'}</p>
                ${this.hasActiveFilters() ? `
                    <button class="btn-primary" onclick="window.tasksView.resetFilters()">
                        Réinitialiser les filtres
                    </button>
                ` : `
                    <button class="btn-primary" onclick="window.tasksView.showCreateModal()">
                        Créer votre première tâche
                    </button>
                `}
            </div>
        `;
    }

    // MÉTHODES UTILITAIRES
    getPriorityColor(priority) {
        const colors = {
            urgent: '#ef4444',
            high: '#f59e0b', 
            medium: '#3b82f6',
            low: '#10b981'
        };
        return colors[priority] || colors.medium;
    }

    getBadges(task) {
        const badges = [];
        
        if (task.hasEmail && !task.emailReplied) {
            badges.push('<span class="badge email">📧</span>');
        }
        
        if (task.suggestedReplies && task.suggestedReplies.length > 0) {
            badges.push('<span class="badge ai">🤖</span>');
        }
        
        if (task.hasAttachments) {
            badges.push('<span class="badge attachment">📎</span>');
        }
        
        return badges.length > 0 ? `<span class="task-badges">${badges.join('')}</span>` : '';
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}h`;
        } else if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}j`;
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    buildClientOptions() {
        const tasks = window.taskManager.getAllTasks();
        const clients = new Set();
        tasks.forEach(task => {
            if (task.client) clients.add(task.client);
        });
        
        let options = '<option value="all">Tous les clients</option>';
        Array.from(clients).sort().forEach(client => {
            const selected = this.currentFilters.client === client ? 'selected' : '';
            options += `<option value="${client}" ${selected}>${client}</option>`;
        });
        
        return options;
    }

    // GESTION DES ÉVÉNEMENTS
    handleTaskClick(event, taskId) {
        if (event.ctrlKey || event.metaKey) {
            this.toggleSelection(taskId);
        } else {
            this.showTaskDetails(taskId);
        }
    }

    filterByStatus(statusId) {
        this.currentFilters = {
            ...this.currentFilters,
            status: 'all',
            overdue: false,
            needsReply: false
        };

        switch (statusId) {
            case 'all':
                break;
            case 'todo':
            case 'in-progress':
            case 'completed':
                this.currentFilters.status = statusId;
                break;
            case 'overdue':
                this.currentFilters.overdue = true;
                break;
            case 'needsReply':
                this.currentFilters.needsReply = true;
                break;
        }

        this.refreshView();
    }

    isStatusActive(statusId) {
        switch (statusId) {
            case 'all':
                return this.currentFilters.status === 'all' && !this.currentFilters.overdue && !this.currentFilters.needsReply;
            case 'todo':
            case 'in-progress':
            case 'completed':
                return this.currentFilters.status === statusId;
            case 'overdue':
                return this.currentFilters.overdue;
            case 'needsReply':
                return this.currentFilters.needsReply;
            default:
                return false;
        }
    }

    toggleSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.refreshView();
    }

    setViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
    }

    toggleAdvancedFilters() {
        this.showAdvancedFilters = !this.showAdvancedFilters;
        this.refreshView();
    }

    updateFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.refreshView();
    }

    resetFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            client: 'all',
            search: '',
            sortBy: 'created',
            overdue: false,
            needsReply: false
        };
        
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        this.refreshView();
    }

    getActiveFiltersCount() {
        let count = 0;
        if (this.currentFilters.status !== 'all') count++;
        if (this.currentFilters.priority !== 'all') count++;
        if (this.currentFilters.client !== 'all') count++;
        if (this.currentFilters.search !== '') count++;
        if (this.currentFilters.overdue) count++;
        if (this.currentFilters.needsReply) count++;
        return count;
    }

    hasActiveFilters() {
        return this.getActiveFiltersCount() > 0;
    }

    // ACTIONS SUR LES TÂCHES
    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche marquée comme terminée', 'success');
    }

    replyToEmail(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        const subject = `Re: ${task.emailSubject || 'Votre message'}`;
        const to = task.emailFrom;
        const body = `Bonjour ${task.emailFromName || ''},\n\nMerci pour votre message.\n\nCordialement,`;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
        
        window.taskManager.updateTask(taskId, { emailReplied: true });
        this.showToast('Email de réponse ouvert', 'success');
    }

    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        const modalHtml = `
            <div class="modal-overlay" onclick="this.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>Détails de la tâche</h2>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h3>${this.escapeHtml(task.title)}</h3>
                        ${task.description ? `<p>${this.escapeHtml(task.description)}</p>` : ''}
                        ${task.hasEmail ? `
                            <div class="email-info">
                                <strong>Email de:</strong> ${this.escapeHtml(task.emailFromName || task.emailFrom)}<br>
                                ${task.emailSubject ? `<strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject)}` : ''}
                            </div>
                        ` : ''}
                        ${task.actions && task.actions.length > 0 ? `
                            <div class="task-actions-list">
                                <strong>Actions requises:</strong>
                                <ul>
                                    ${task.actions.map(action => `<li>${this.escapeHtml(action.text)}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Fermer</button>
                        ${task.status !== 'completed' ? `
                            <button class="btn-primary" onclick="window.tasksView.markComplete('${task.id}'); this.closest('.modal-overlay').remove();">
                                Marquer terminé
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    showCreateModal() {
        console.log('Création d\'une nouvelle tâche');
    }

    refreshView() {
        const container = document.querySelector('.emailsort-tasks');
        if (container) {
            this.render(container.parentElement);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value.trim();
                    this.refreshView();
                }, 300);
            });
        }
    }

    showToast(message, type = 'info') {
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // STYLES CSS EMAILSORTPRO
    addStyles() {
        if (document.getElementById('emailSortProStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'emailSortProStyles';
        styles.textContent = `
            /* Variables EmailSortPro */
            :root {
                --primary: #6366f1;
                --blue: #3b82f6;
                --orange: #f59e0b;
                --red: #ef4444;
                --purple: #8b5cf6;
                --green: #10b981;
                --gray-50: #f9fafb;
                --gray-100: #f3f4f6;
                --gray-200: #e5e7eb;
                --gray-300: #d1d5db;
                --gray-400: #9ca3af;
                --gray-500: #6b7280;
                --gray-600: #4b5563;
                --gray-700: #374151;
                --gray-900: #111827;
                --radius: 8px;
                --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            /* Page principale */
            .emailsort-tasks {
                background: var(--gray-50);
                min-height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            /* En-tête */
            .emailsort-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .header-left {
                display: flex;
                align-items: baseline;
                gap: 12px;
            }
            
            .page-title {
                font-size: 28px;
                font-weight: 700;
                color: var(--gray-900);
                margin: 0;
            }
            
            .task-count {
                background: var(--gray-200);
                color: var(--gray-600);
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .header-center {
                flex: 1;
                max-width: 400px;
            }
            
            .search-box {
                position: relative;
            }
            
            .search-input {
                width: 100%;
                padding: 10px 16px 10px 40px;
                border: 1px solid var(--gray-300);
                border-radius: var(--radius);
                font-size: 14px;
                background: white;
                transition: border-color 0.2s;
            }
            
            .search-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
                font-size: 14px;
            }
            
            .header-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .view-toggle {
                display: flex;
                background: var(--gray-100);
                border-radius: var(--radius);
                padding: 2px;
            }
            
            .view-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border: none;
                background: transparent;
                border-radius: 6px;
                color: var(--gray-600);
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .view-btn.active {
                background: white;
                color: var(--gray-900);
                box-shadow: var(--shadow);
            }
            
            .new-task-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                background: var(--primary);
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: var(--radius);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .new-task-btn:hover {
                background: #5856eb;
            }
            
            /* Filtres de statut */
            .status-filters {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            
            .status-filter {
                display: flex;
                align-items: center;
                gap: 8px;
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: 20px;
                padding: 8px 16px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
                font-weight: 500;
                color: var(--gray-700);
            }
            
            .status-filter:hover {
                border-color: var(--filter-color);
                background: var(--gray-50);
            }
            
            .status-filter.active {
                background: var(--filter-color);
                border-color: var(--filter-color);
                color: white;
            }
            
            .filter-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                min-width: 20px;
                text-align: center;
            }
            
            .status-filter.active .filter-count {
                background: rgba(255, 255, 255, 0.2);
            }
            
            /* Filtres avancés */
            .advanced-filters-section {
                margin-bottom: 16px;
            }
            
            .advanced-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: var(--radius);
                padding: 10px 16px;
                cursor: pointer;
                font-size: 14px;
                color: var(--gray-700);
                transition: all 0.2s;
                position: relative;
                width: auto;
            }
            
            .advanced-toggle:hover {
                background: var(--gray-50);
            }
            
            .filter-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--red);
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
                min-width: 18px;
                text-align: center;
            }
            
            .advanced-filters {
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: var(--radius);
                margin-top: 8px;
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .advanced-filters.show {
                max-height: 200px;
                padding: 16px;
            }
            
            .filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                align-items: center;
            }
            
            .filter-select {
                padding: 8px 12px;
                border: 1px solid var(--gray-300);
                border-radius: var(--radius);
                background: white;
                font-size: 14px;
                color: var(--gray-700);
            }
            
            .reset-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                background: var(--gray-100);
                border: 1px solid var(--gray-300);
                border-radius: var(--radius);
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                color: var(--gray-700);
                transition: background-color 0.2s;
            }
            
            .reset-btn:hover {
                background: var(--gray-200);
            }
            
            /* Container des tâches */
            .tasks-container {
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: var(--radius);
                box-shadow: var(--shadow);
            }
            
            .tasks-list {
                display: flex;
                flex-direction: column;
            }
            
            /* Tâche individuelle */
            .task-item {
                display: flex;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid var(--gray-100);
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .task-item:last-child {
                border-bottom: none;
            }
            
            .task-item:hover {
                background: var(--gray-50);
            }
            
            .task-item:hover .task-actions {
                opacity: 1;
            }
            
            .task-item.selected {
                background: rgba(99, 102, 241, 0.05);
                border-left: 3px solid var(--primary);
            }
            
            .task-item.completed {
                opacity: 0.6;
            }
            
            .task-item.completed .task-title {
                text-decoration: line-through;
            }
            
            .task-checkbox {
                margin-right: 12px;
            }
            
            .task-checkbox input {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
            
            .task-content {
                flex: 1;
                min-width: 0;
            }
            
            .task-title {
                font-size: 15px;
                font-weight: 600;
                color: var(--gray-900);
                margin-bottom: 4px;
                padding-left: 8px;
                border-left-width: 3px;
                border-left-style: solid;
            }
            
            .task-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 13px;
                color: var(--gray-500);
                flex-wrap: wrap;
            }
            
            .task-sender {
                font-weight: 500;
                color: var(--gray-600);
            }
            
            .task-badges {
                display: flex;
                gap: 4px;
            }
            
            .badge {
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 10px;
                background: var(--gray-100);
            }
            
            .badge.email {
                background: rgba(99, 102, 241, 0.1);
                color: var(--primary);
            }
            
            .badge.ai {
                background: rgba(139, 92, 246, 0.1);
                color: var(--purple);
            }
            
            .task-actions {
                display: flex;
                gap: 4px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .task-action {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 6px;
                background: var(--gray-100);
                color: var(--gray-600);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-size: 13px;
            }
            
            .task-action:hover {
                background: var(--gray-200);
            }
            
            .task-action.reply:hover {
                background: rgba(99, 102, 241, 0.1);
                color: var(--primary);
            }
            
            .task-action.complete:hover {
                background: rgba(16, 185, 129, 0.1);
                color: var(--green);
            }
            
            /* État vide */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: var(--gray-500);
            }
            
            .empty-icon {
                font-size: 48px;
                color: var(--gray-300);
                margin-bottom: 16px;
            }
            
            .empty-state h3 {
                font-size: 18px;
                color: var(--gray-700);
                margin-bottom: 8px;
            }
            
            .empty-state p {
                margin-bottom: 24px;
            }
            
            /* Boutons */
            .btn-primary {
                background: var(--primary);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: var(--radius);
                font-size: 14px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .btn-primary:hover {
                background: #5856eb;
            }
            
            .btn-secondary {
                background: var(--gray-100);
                color: var(--gray-700);
                border: 1px solid var(--gray-300);
                padding: 10px 20px;
                border-radius: var(--radius);
                font-size: 14px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .btn-secondary:hover {
                background: var(--gray-200);
            }
            
            /* Loading */
            .emailsort-loading {
                text-align: center;
                padding: 60px 20px;
                color: var(--gray-500);
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--gray-200);
                border-top: 3px solid var(--primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Modal */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: var(--radius);
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--gray-200);
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                color: var(--gray-900);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                color: var(--gray-400);
                cursor: pointer;
                padding: 4px;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 20px;
                border-top: 1px solid var(--gray-200);
            }
            
            .email-info {
                background: var(--gray-50);
                padding: 12px;
                border-radius: var(--radius);
                margin-top: 12px;
                font-size: 14px;
                color: var(--gray-700);
                line-height: 1.5;
            }
            
            .task-actions-list {
                margin-top: 16px;
            }
            
            .task-actions-list ul {
                margin-top: 8px;
                padding-left: 20px;
            }
            
            .task-actions-list li {
                margin-bottom: 4px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .emailsort-tasks {
                    padding: 12px;
                }
                
                .emailsort-header {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
                
                .header-center {
                    max-width: none;
                }
                
                .header-right {
                    justify-content: space-between;
                }
                
                .page-title {
                    font-size: 24px;
                }
                
                .status-filters {
                    gap: 6px;
                }
                
                .status-filter {
                    padding: 6px 12px;
                    font-size: 13px;
                }
                
                .filter-label {
                    display: none;
                }
                
                .task-item {
                    padding: 12px;
                }
                
                .task-title {
                    font-size: 14px;
                }
                
                .task-meta {
                    font-size: 12px;
                }
                
                .task-actions {
                    opacity: 1;
                }
                
                .view-btn span {
                    display: none;
                }
                
                .new-task-btn span {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// INITIALISATION GLOBALE
// =====================================
function initializeCompleteTaskManager() {
    console.log('[TaskManager] Initializing complete rewrite...');
    
    // Créer TaskManager
    if (!window.taskManager || !window.taskManager.initialized) {
        window.taskManager = new TaskManager();
    }
    
    // Créer TasksView
    if (!window.tasksView) {
        window.tasksView = new TasksView();
    }
    
    // Bind des méthodes
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
    
    console.log('✅ TaskManager complet réécrit - Interface EmailSortPro');
}

// Initialisation
initializeCompleteTaskManager();
document.addEventListener('DOMContentLoaded', initializeCompleteTaskManager);
window.addEventListener('load', () => {
    setTimeout(initializeCompleteTaskManager, 500);
});
