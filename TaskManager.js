// TaskManager v11 - Version Optimisée avec Checklist et Statuts Étendus
// =====================================================================

class TaskManager {
    constructor() {
        this.tasks = [];
        this.initialized = false;
        this.selectedTasks = new Set();
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            search: '',
            sortBy: 'created'
        };
        this.init();
    }

    async init() {
        try {
            console.log('[TaskManager] Initializing v11...');
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
            const saved = localStorage.getItem('taskmanager_v11');
            if (saved) {
                this.tasks = JSON.parse(saved).map(task => this.ensureTaskProperties(task));
            } else {
                this.generateSampleTasks();
            }
        } catch (error) {
            console.error('[TaskManager] Error loading tasks:', error);
            this.tasks = [];
        }
    }

    ensureTaskProperties(task) {
        return {
            // Propriétés de base
            id: task.id || this.generateId(),
            title: task.title || 'Tâche sans titre',
            description: task.description || '',
            priority: task.priority || 'medium',
            status: task.status || 'todo',
            dueDate: task.dueDate || null,
            category: task.category || 'other',
            client: task.client || 'Interne',
            tags: Array.isArray(task.tags) ? task.tags : [],
            
            // Statuts étendus
            relanceDate: task.relanceDate || null,
            relanceCount: task.relanceCount || 0,
            waitingReason: task.waitingReason || '',
            
            // Email
            hasEmail: task.hasEmail || false,
            emailId: task.emailId || null,
            emailFrom: task.emailFrom || null,
            emailFromName: task.emailFromName || null,
            emailSubject: task.emailSubject || null,
            emailContent: task.emailContent || '',
            emailHtmlContent: task.emailHtmlContent || '',
            emailDomain: task.emailDomain || null,
            emailDate: task.emailDate || null,
            emailReplied: task.emailReplied || false,
            needsReply: task.needsReply || false,
            hasAttachments: task.hasAttachments || false,
            
            // Checklist
            checklist: Array.isArray(task.checklist) ? task.checklist : [],
            checklistComplete: task.checklistComplete || false,
            
            // Commentaires
            comments: Array.isArray(task.comments) ? task.comments : [],
            
            // IA
            summary: task.summary || '',
            actions: Array.isArray(task.actions) ? task.actions : [],
            keyInfo: Array.isArray(task.keyInfo) ? task.keyInfo : [],
            risks: Array.isArray(task.risks) ? task.risks : [],
            aiAnalysis: task.aiAnalysis || null,
            suggestedReplies: Array.isArray(task.suggestedReplies) ? task.suggestedReplies : [],
            
            // Timestamps
            createdAt: task.createdAt || new Date().toISOString(),
            updatedAt: task.updatedAt || new Date().toISOString(),
            completedAt: task.completedAt || null,
            
            // Méthode
            method: task.method || 'manual'
        };
    }

    generateSampleTasks() {
        this.tasks = [
            {
                id: 'sample_1',
                title: 'Répondre à l\'équipe marketing sur la campagne Q2',
                description: 'Validation de la campagne marketing avec budget de 50k€',
                priority: 'high',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'sarah.martin@acme-corp.com',
                emailFromName: 'Sarah Martin',
                emailSubject: 'Validation campagne marketing Q2',
                emailDate: new Date().toISOString(),
                emailContent: 'Bonjour,\n\nJ\'ai besoin de votre validation pour la campagne Q2...',
                client: 'ACME Corp',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                needsReply: true,
                checklist: [
                    { id: 1, text: 'Valider les visuels de la campagne', completed: false },
                    { id: 2, text: 'Confirmer le budget alloué', completed: false },
                    { id: 3, text: 'Définir les dates de lancement', completed: false }
                ],
                comments: [
                    { id: 1, text: 'À discuter avec l\'équipe commerciale', author: 'Moi', date: new Date().toISOString() }
                ]
            }
        ].map(task => this.ensureTaskProperties(task));
        
        this.saveTasks();
    }

    // =====================================
    // CRUD Operations
    // =====================================

    createTask(taskData) {
        const task = this.ensureTaskProperties({
            ...taskData,
            id: taskData.id || this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        return task;
    }

    updateTask(id, updates) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) return null;
        
        // Gestion des statuts spéciaux
        if (updates.status === 'relanced' && !updates.relanceDate) {
            updates.relanceDate = new Date().toISOString();
            updates.relanceCount = (this.tasks[index].relanceCount || 0) + 1;
        }
        
        if (updates.status === 'completed' && !this.tasks[index].completedAt) {
            updates.completedAt = new Date().toISOString();
        }
        
        // Mise à jour de la checklist
        if (updates.checklist) {
            const totalItems = updates.checklist.length;
            const completedItems = updates.checklist.filter(item => item.completed).length;
            updates.checklistComplete = totalItems > 0 && totalItems === completedItems;
        }
        
        this.tasks[index] = this.ensureTaskProperties({
            ...this.tasks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
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

    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    getAllTasks() {
        return [...this.tasks];
    }

    // =====================================
    // Checklist Management
    // =====================================

    addChecklistItem(taskId, text) {
        const task = this.getTask(taskId);
        if (!task) return null;
        
        const newItem = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        task.checklist.push(newItem);
        this.updateTask(taskId, { checklist: task.checklist });
        return newItem;
    }

    updateChecklistItem(taskId, itemId, updates) {
        const task = this.getTask(taskId);
        if (!task) return null;
        
        const item = task.checklist.find(i => i.id === itemId);
        if (!item) return null;
        
        Object.assign(item, updates);
        this.updateTask(taskId, { checklist: task.checklist });
        return item;
    }

    removeChecklistItem(taskId, itemId) {
        const task = this.getTask(taskId);
        if (!task) return null;
        
        task.checklist = task.checklist.filter(item => item.id !== itemId);
        this.updateTask(taskId, { checklist: task.checklist });
        return true;
    }

    // =====================================
    // Comments Management
    // =====================================

    addComment(taskId, text, author = 'Moi') {
        const task = this.getTask(taskId);
        if (!task) return null;
        
        const newComment = {
            id: Date.now(),
            text: text,
            author: author,
            date: new Date().toISOString()
        };
        
        task.comments.push(newComment);
        this.updateTask(taskId, { comments: task.comments });
        return newComment;
    }

    deleteComment(taskId, commentId) {
        const task = this.getTask(taskId);
        if (!task) return null;
        
        task.comments = task.comments.filter(comment => comment.id !== commentId);
        this.updateTask(taskId, { comments: task.comments });
        return true;
    }

    // =====================================
    // Filtering and Sorting
    // =====================================

    filterTasks(filters = {}) {
        let filtered = [...this.tasks];
        
        // Filtre par statut
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        
        // Filtre par priorité
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }
        
        // Filtre par client
        if (filters.client && filters.client !== 'all') {
            filtered = filtered.filter(task => task.client === filters.client);
        }
        
        // Filtre par recherche
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                task.client.toLowerCase().includes(search) ||
                (task.emailFromName && task.emailFromName.toLowerCase().includes(search))
            );
        }
        
        // Filtre tâches en retard
        if (filters.overdue) {
            filtered = filtered.filter(task => {
                if (!task.dueDate || task.status === 'completed') return false;
                return new Date(task.dueDate) < new Date();
            });
        }
        
        // Filtre tâches relancées
        if (filters.relanced) {
            filtered = filtered.filter(task => task.status === 'relanced');
        }
        
        // Filtre tâches en attente
        if (filters.waiting) {
            filtered = filtered.filter(task => task.status === 'waiting');
        }
        
        // Filtre tâches avec checklist incomplète
        if (filters.checklistIncomplete) {
            filtered = filtered.filter(task => 
                task.checklist.length > 0 && !task.checklistComplete
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
                
            case 'client':
                sorted.sort((a, b) => a.client.localeCompare(b.client));
                break;
                
            case 'status':
                const statusOrder = { urgent: 0, todo: 1, 'in-progress': 2, relanced: 3, waiting: 4, completed: 5 };
                sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
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

    // =====================================
    // Statistics
    // =====================================

    getStats() {
        const stats = {
            total: this.tasks.length,
            byStatus: {
                todo: this.tasks.filter(t => t.status === 'todo').length,
                'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
                completed: this.tasks.filter(t => t.status === 'completed').length,
                relanced: this.tasks.filter(t => t.status === 'relanced').length,
                waiting: this.tasks.filter(t => t.status === 'waiting').length
            },
            byPriority: {
                urgent: this.tasks.filter(t => t.priority === 'urgent').length,
                high: this.tasks.filter(t => t.priority === 'high').length,
                medium: this.tasks.filter(t => t.priority === 'medium').length,
                low: this.tasks.filter(t => t.priority === 'low').length
            },
            overdue: this.tasks.filter(t => {
                if (!t.dueDate || t.status === 'completed') return false;
                return new Date(t.dueDate) < new Date();
            }).length,
            needsReply: this.tasks.filter(t => t.needsReply && !t.emailReplied).length,
            withChecklist: this.tasks.filter(t => t.checklist.length > 0).length,
            checklistIncomplete: this.tasks.filter(t => 
                t.checklist.length > 0 && !t.checklistComplete
            ).length
        };
        
        return stats;
    }

    // =====================================
    // Utility Methods
    // =====================================

    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveTasks() {
        try {
            localStorage.setItem('taskmanager_v11', JSON.stringify(this.tasks));
            return true;
        } catch (error) {
            console.error('[TaskManager] Error saving tasks:', error);
            return false;
        }
    }

    emitTaskUpdate(action, task) {
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('taskUpdate', {
                detail: { action, task, timestamp: new Date().toISOString() }
            }));
        }
    }

    exportTasks(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.tasks, null, 2);
        } else if (format === 'csv') {
            const headers = ['ID', 'Titre', 'Description', 'Statut', 'Priorité', 'Client', 'Échéance', 'Créé le'];
            const rows = this.tasks.map(task => [
                task.id,
                `"${task.title}"`,
                `"${task.description}"`,
                task.status,
                task.priority,
                `"${task.client}"`,
                task.dueDate || '',
                new Date(task.createdAt).toLocaleDateString('fr-FR')
            ]);
            
            return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        }
    }

    importTasks(data, format = 'json') {
        try {
            if (format === 'json') {
                const tasks = JSON.parse(data);
                if (Array.isArray(tasks)) {
                    this.tasks = tasks.map(task => this.ensureTaskProperties(task));
                    this.saveTasks();
                    return { success: true, count: this.tasks.length };
                }
            }
            return { success: false, error: 'Format invalide' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// =====================================
// TasksView - Interface utilisateur optimisée
// =====================================

class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            search: '',
            sortBy: 'created',
            overdue: false,
            relanced: false,
            waiting: false,
            checklistIncomplete: false
        };
        
        this.selectedTasks = new Set();
        this.currentViewMode = 'normal'; // normal, compact, detailed
        
        // Écouter les mises à jour
        window.addEventListener('taskUpdate', () => this.refreshView());
    }

    render(container) {
        if (!container || !window.taskManager?.initialized) {
            console.error('[TasksView] Container manquant ou TaskManager non initialisé');
            return;
        }

        const stats = window.taskManager.getStats();
        
        container.innerHTML = `
            <div class="tasks-interface">
                ${this.renderControls(stats)}
                <div id="tasksContainer" class="tasks-container">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    renderControls(stats) {
        return `
            <div class="controls-panel">
                <!-- Ligne 1: Recherche + Actions -->
                <div class="controls-line-1">
                    <div class="search-section">
                        <div class="search-box">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   class="search-input" 
                                   id="taskSearchInput"
                                   placeholder="Rechercher une tâche..." 
                                   value="${this.currentFilters.search}">
                            ${this.currentFilters.search ? `
                                <button class="search-clear" onclick="window.tasksView.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <div class="main-actions">
                        ${this.selectedTasks.size > 0 ? `
                            <div class="selection-info">
                                <span>${this.selectedTasks.size} sélectionné(s)</span>
                                <button class="btn btn-sm" onclick="window.tasksView.clearSelection()">
                                    <i class="fas fa-times"></i>
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="window.tasksView.bulkActions()">
                                    Actions
                                </button>
                            </div>
                        ` : ''}
                        
                        <button class="btn btn-primary" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            Nouvelle tâche
                        </button>
                        
                        <button class="btn" onclick="window.tasksView.refreshView()">
                            <i class="fas fa-sync-alt"></i>
                            Actualiser
                        </button>
                        
                        <button class="btn" onclick="window.tasksView.showFiltersModal()">
                            <i class="fas fa-filter"></i>
                            Filtres avancés
                        </button>
                    </div>
                </div>
                
                <!-- Ligne 2: Modes de vue + Filtres de statut -->
                <div class="controls-line-2">
                    <div class="view-modes">
                        <button class="view-mode ${this.currentViewMode === 'compact' ? 'active' : ''}" 
                                onclick="window.tasksView.changeViewMode('compact')">
                            Compact
                        </button>
                        <button class="view-mode ${this.currentViewMode === 'normal' ? 'active' : ''}" 
                                onclick="window.tasksView.changeViewMode('normal')">
                            Normal
                        </button>
                        <button class="view-mode ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                onclick="window.tasksView.changeViewMode('detailed')">
                            Détaillé
                        </button>
                    </div>
                    
                    <div class="status-filters">
                        ${this.renderStatusPills(stats)}
                    </div>
                </div>
            </div>
        `;
    }

    renderStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Toutes', icon: '📋', count: stats.total },
            { id: 'todo', name: 'À faire', icon: '⏳', count: stats.byStatus.todo },
            { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.byStatus['in-progress'] },
            { id: 'relanced', name: 'Relancé', icon: '📨', count: stats.byStatus.relanced },
            { id: 'waiting', name: 'En attente', icon: '⌛', count: stats.byStatus.waiting },
            { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue },
            { id: 'completed', name: 'Terminées', icon: '✅', count: stats.byStatus.completed }
        ];

        return pills.map(pill => `
            <button class="status-pill ${this.isFilterActive(pill.id) ? 'active' : ''}" 
                    onclick="window.tasksView.quickFilter('${pill.id}')">
                <span class="pill-icon">${pill.icon}</span>
                <span class="pill-text">${pill.name}</span>
                <span class="pill-count">${pill.count}</span>
            </button>
        `).join('');
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        
        if (tasks.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'compact':
                return `<div class="tasks-list-compact">${tasks.map(task => this.renderCompactTask(task)).join('')}</div>`;
            case 'detailed':
                return `<div class="tasks-grid-detailed">${tasks.map(task => this.renderDetailedTask(task)).join('')}</div>`;
            case 'normal':
            default:
                return `<div class="tasks-list-normal">${tasks.map(task => this.renderNormalTask(task)).join('')}</div>`;
        }
    }

    renderCompactTask(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const checklistProgress = this.getChecklistProgress(task);
        
        return `
            <div class="task-compact ${task.status} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                
                <span class="task-title">${this.escapeHtml(task.title)}</span>
                <span class="task-client">${this.escapeHtml(task.client)}</span>
                ${checklistProgress ? `<span class="checklist-progress">${checklistProgress}</span>` : ''}
                
                <div class="task-actions">
                    ${this.renderQuickActions(task)}
                </div>
            </div>
        `;
    }

    renderNormalTask(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        const checklistProgress = this.getChecklistProgress(task);
        
        return `
            <div class="task-normal ${task.status} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                <div class="task-header">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="task-content">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="task-meta">
                            <span class="status-badge ${task.status}">${this.getStatusLabel(task.status)}</span>
                            <span class="priority-badge ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                            <span class="client-info">${this.escapeHtml(task.client)}</span>
                            ${dueDateInfo}
                            ${checklistProgress ? `<span class="checklist-info">📋 ${checklistProgress}</span>` : ''}
                            ${task.relanceCount > 0 ? `<span class="relance-count">🔄 ${task.relanceCount}</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="task-actions">
                        ${this.renderTaskActions(task)}
                    </div>
                </div>
            </div>
        `;
    }

    renderDetailedTask(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        const checklistProgress = this.getChecklistProgress(task);
        
        return `
            <div class="task-detailed ${task.status} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                <div class="task-detailed-header">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                    <div class="task-badges">
                        <span class="status-badge ${task.status}">${this.getStatusLabel(task.status)}</span>
                        <span class="priority-badge ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                    </div>
                </div>
                
                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                
                ${task.description ? `
                    <p class="task-description">${this.escapeHtml(task.description.substring(0, 150))}${task.description.length > 150 ? '...' : ''}</p>
                ` : ''}
                
                <div class="task-info-grid">
                    <div class="info-item">
                        <i class="fas fa-building"></i>
                        <span>${this.escapeHtml(task.client)}</span>
                    </div>
                    ${dueDateInfo ? `
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            ${dueDateInfo}
                        </div>
                    ` : ''}
                    ${checklistProgress ? `
                        <div class="info-item">
                            <i class="fas fa-tasks"></i>
                            <span>${checklistProgress}</span>
                        </div>
                    ` : ''}
                    ${task.comments.length > 0 ? `
                        <div class="info-item">
                            <i class="fas fa-comments"></i>
                            <span>${task.comments.length} comment(s)</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="task-detailed-actions">
                    ${this.renderDetailedActions(task)}
                </div>
            </div>
        `;
    }

    renderQuickActions(task) {
        return `
            <button class="action-btn" onclick="window.tasksView.showTaskDetails('${task.id}')" title="Détails">
                <i class="fas fa-eye"></i>
            </button>
            ${task.status !== 'completed' ? `
                <button class="action-btn" onclick="window.tasksView.markComplete('${task.id}')" title="Terminer">
                    <i class="fas fa-check"></i>
                </button>
            ` : ''}
        `;
    }

    renderTaskActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn" onclick="window.tasksView.markComplete('${task.id}')" title="Terminer">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        if (task.status === 'todo' || task.status === 'in-progress') {
            actions.push(`
                <button class="action-btn" onclick="window.tasksView.markRelanced('${task.id}')" title="Relancer">
                    <i class="fas fa-redo"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn" onclick="window.tasksView.showEditModal('${task.id}')" title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn" onclick="window.tasksView.showTaskDetails('${task.id}')" title="Détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    renderDetailedActions(task) {
        return `
            ${task.status !== 'completed' ? `
                <button class="btn btn-sm btn-success" onclick="window.tasksView.markComplete('${task.id}')">
                    <i class="fas fa-check"></i> Terminer
                </button>
            ` : ''}
            <button class="btn btn-sm btn-primary" onclick="window.tasksView.showEditModal('${task.id}')">
                <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="btn btn-sm" onclick="window.tasksView.showTaskDetails('${task.id}')">
                <i class="fas fa-eye"></i> Détails
            </button>
        `;
    }

    // =====================================
    // Modal Management
    // =====================================

    showCreateModal() {
        const modalContent = `
            <h2><i class="fas fa-plus"></i> Créer une nouvelle tâche</h2>
            <form id="createTaskForm" onsubmit="window.tasksView.handleCreateTask(event); return false;">
                ${this.renderTaskForm()}
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="window.tasksView.closeModal()">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Créer
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
    }

    showEditModal(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
        const modalContent = `
            <h2><i class="fas fa-edit"></i> Modifier la tâche</h2>
            <form id="editTaskForm" onsubmit="window.tasksView.handleEditTask(event, '${taskId}'); return false;">
                ${this.renderTaskForm(task)}
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="window.tasksView.closeModal()">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Enregistrer
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
    }

    renderTaskForm(task = null) {
        return `
            <div class="form-group">
                <label>Titre *</label>
                <input type="text" name="title" class="form-input" value="${task?.title || ''}" required>
            </div>
            
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" class="form-textarea" rows="3">${task?.description || ''}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Statut</label>
                    <select name="status" class="form-select">
                        <option value="todo" ${task?.status === 'todo' ? 'selected' : ''}>⏳ À faire</option>
                        <option value="in-progress" ${task?.status === 'in-progress' ? 'selected' : ''}>🔄 En cours</option>
                        <option value="relanced" ${task?.status === 'relanced' ? 'selected' : ''}>📨 Relancé</option>
                        <option value="waiting" ${task?.status === 'waiting' ? 'selected' : ''}>⌛ En attente</option>
                        <option value="completed" ${task?.status === 'completed' ? 'selected' : ''}>✅ Terminé</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Priorité</label>
                    <select name="priority" class="form-select">
                        <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        <option value="medium" ${task?.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                        <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                        <option value="urgent" ${task?.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Client</label>
                    <input type="text" name="client" class="form-input" value="${task?.client || 'Interne'}">
                </div>
                
                <div class="form-group">
                    <label>Date d'échéance</label>
                    <input type="date" name="dueDate" class="form-input" value="${task?.dueDate || ''}">
                </div>
            </div>
            
            ${task?.status === 'waiting' ? `
                <div class="form-group">
                    <label>Raison de l'attente</label>
                    <input type="text" name="waitingReason" class="form-input" value="${task?.waitingReason || ''}" 
                           placeholder="Ex: En attente de validation client">
                </div>
            ` : ''}
            
            <div class="checklist-section">
                <div class="checklist-header">
                    <h3><i class="fas fa-tasks"></i> Checklist</h3>
                    <button type="button" class="btn btn-sm" onclick="window.tasksView.addChecklistField()">
                        <i class="fas fa-plus"></i> Ajouter
                    </button>
                </div>
                <div id="checklistFields">
                    ${task?.checklist ? task.checklist.map((item, index) => `
                        <div class="checklist-field" data-id="${item.id}">
                            <input type="checkbox" ${item.completed ? 'checked' : ''}>
                            <input type="text" value="${this.escapeHtml(item.text)}" placeholder="Élément de checklist">
                            <button type="button" class="btn-remove" onclick="window.tasksView.removeChecklistField(this)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
    }

    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
        const modalContent = `
            <h2><i class="fas fa-eye"></i> ${this.escapeHtml(task.title)}</h2>
            
            <div class="task-details-content">
                <div class="details-header">
                    <div class="badges-group">
                        <span class="status-badge ${task.status}">${this.getStatusLabel(task.status)}</span>
                        <span class="priority-badge ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                        ${task.relanceCount > 0 ? `<span class="relance-badge">Relancé ${task.relanceCount} fois</span>` : ''}
                    </div>
                </div>
                
                ${task.description ? `
                    <div class="details-section">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <p>${this.escapeHtml(task.description)}</p>
                    </div>
                ` : ''}
                
                <div class="details-section">
                    <h3><i class="fas fa-info-circle"></i> Informations</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Client:</strong> ${this.escapeHtml(task.client)}
                        </div>
                        <div class="info-item">
                            <strong>Créé le:</strong> ${this.formatDateTime(task.createdAt)}
                        </div>
                        ${task.dueDate ? `
                            <div class="info-item">
                                <strong>Échéance:</strong> ${this.formatDate(new Date(task.dueDate))}
                            </div>
                        ` : ''}
                        ${task.relanceDate ? `
                            <div class="info-item">
                                <strong>Dernière relance:</strong> ${this.formatDateTime(task.relanceDate)}
                            </div>
                        ` : ''}
                        ${task.waitingReason ? `
                            <div class="info-item">
                                <strong>En attente:</strong> ${this.escapeHtml(task.waitingReason)}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${task.hasEmail ? `
                    <div class="details-section email-section">
                        <h3><i class="fas fa-envelope"></i> Email</h3>
                        <div class="email-header">
                            <strong>De:</strong> ${this.escapeHtml(task.emailFromName || task.emailFrom)}<br>
                            <strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject)}
                        </div>
                        ${task.emailContent ? `
                            <div class="email-content">${this.escapeHtml(task.emailContent)}</div>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${task.checklist && task.checklist.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-tasks"></i> Checklist (${this.getChecklistProgress(task)})</h3>
                        <div class="checklist-view">
                            ${task.checklist.map(item => `
                                <div class="checklist-item ${item.completed ? 'completed' : ''}">
                                    <input type="checkbox" ${item.completed ? 'checked' : ''} 
                                           onchange="window.tasksView.toggleChecklistItemStatus('${task.id}', ${item.id})">
                                    <span>${this.escapeHtml(item.text)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="details-section">
                    <h3><i class="fas fa-comments"></i> Commentaires (${task.comments.length})</h3>
                    <div class="comments-list">
                        ${task.comments.map(comment => `
                            <div class="comment-item">
                                <div class="comment-header">
                                    <strong>${this.escapeHtml(comment.author)}</strong>
                                    <span class="comment-date">${this.formatDateTime(comment.date)}</span>
                                </div>
                                <div class="comment-text">${this.escapeHtml(comment.text)}</div>
                            </div>
                        `).join('') || '<p class="no-comments">Aucun commentaire</p>'}
                    </div>
                    
                    <div class="add-comment-form">
                        <textarea id="newComment" class="form-textarea" rows="2" placeholder="Ajouter un commentaire..."></textarea>
                        <button class="btn btn-sm btn-primary" onclick="window.tasksView.addComment('${task.id}')">
                            <i class="fas fa-paper-plane"></i> Envoyer
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="window.tasksView.closeModal()">Fermer</button>
                ${task.status !== 'completed' ? `
                    <button class="btn btn-success" onclick="window.tasksView.markComplete('${task.id}'); window.tasksView.closeModal();">
                        <i class="fas fa-check"></i> Marquer comme terminé
                    </button>
                ` : ''}
                <button class="btn btn-primary" onclick="window.tasksView.closeModal(); window.tasksView.showEditModal('${task.id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
            </div>
        `;
        
        this.showModal(modalContent, 'large');
    }

    showModal(content, size = 'medium') {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal ${size}">
                <button class="modal-close" onclick="window.tasksView.closeModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.querySelector('.modal-overlay')?.remove();
        document.body.style.overflow = 'auto';
    }

    // =====================================
    // Event Handlers
    // =====================================

    handleCreateTask(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            client: formData.get('client'),
            dueDate: formData.get('dueDate'),
            waitingReason: formData.get('waitingReason') || '',
            checklist: this.getChecklistFromForm()
        };
        
        window.taskManager.createTask(taskData);
        this.closeModal();
        this.refreshView();
        this.showToast('Tâche créée avec succès', 'success');
    }

    handleEditTask(event, taskId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const updates = {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            client: formData.get('client'),
            dueDate: formData.get('dueDate'),
            waitingReason: formData.get('waitingReason') || '',
            checklist: this.getChecklistFromForm()
        };
        
        window.taskManager.updateTask(taskId, updates);
        this.closeModal();
        this.refreshView();
        this.showToast('Tâche mise à jour', 'success');
    }

    getChecklistFromForm() {
        const checklist = [];
        document.querySelectorAll('#checklistFields .checklist-field').forEach((field, index) => {
            const checkbox = field.querySelector('input[type="checkbox"]');
            const text = field.querySelector('input[type="text"]').value.trim();
            
            if (text) {
                checklist.push({
                    id: field.dataset.id || Date.now() + index,
                    text: text,
                    completed: checkbox.checked
                });
            }
        });
        return checklist;
    }

    addChecklistField() {
        const container = document.getElementById('checklistFields');
        const field = document.createElement('div');
        field.className = 'checklist-field';
        field.innerHTML = `
            <input type="checkbox">
            <input type="text" placeholder="Élément de checklist">
            <button type="button" class="btn-remove" onclick="window.tasksView.removeChecklistField(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(field);
    }

    removeChecklistField(button) {
        button.closest('.checklist-field').remove();
    }

    toggleChecklistItemStatus(taskId, itemId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
        const item = task.checklist.find(i => i.id === itemId);
        if (item) {
            window.taskManager.updateChecklistItem(taskId, itemId, { completed: !item.completed });
            this.closeModal();
            this.showTaskDetails(taskId);
        }
    }

    addComment(taskId) {
        const textarea = document.getElementById('newComment');
        const text = textarea.value.trim();
        
        if (text) {
            window.taskManager.addComment(taskId, text);
            this.closeModal();
            this.showTaskDetails(taskId);
        }
    }

    // =====================================
    // Actions
    // =====================================

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.refreshView();
        this.showToast('Tâche marquée comme terminée', 'success');
    }

    markRelanced(taskId) {
        window.taskManager.updateTask(taskId, { 
            status: 'relanced',
            relanceDate: new Date().toISOString()
        });
        this.refreshView();
        this.showToast('Tâche relancée', 'info');
    }

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.refreshView();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.refreshView();
    }

    bulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const actions = [
            { label: 'Marquer comme terminé', action: () => this.bulkComplete() },
            { label: 'Changer le statut', action: () => this.bulkChangeStatus() },
            { label: 'Changer la priorité', action: () => this.bulkChangePriority() },
            { label: 'Supprimer', action: () => this.bulkDelete() }
        ];
        
        const modalContent = `
            <h2><i class="fas fa-tasks"></i> Actions groupées (${this.selectedTasks.size} tâches)</h2>
            <div class="bulk-actions-list">
                ${actions.map((action, index) => `
                    <button class="bulk-action-btn" onclick="window.tasksView.executeBulkAction(${index})">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="window.tasksView.closeModal()">Annuler</button>
            </div>
        `;
        
        this.bulkActionsCallbacks = actions.map(a => a.action);
        this.showModal(modalContent);
    }

    executeBulkAction(index) {
        if (this.bulkActionsCallbacks && this.bulkActionsCallbacks[index]) {
            this.bulkActionsCallbacks[index]();
        }
    }

    bulkComplete() {
        this.selectedTasks.forEach(taskId => {
            window.taskManager.updateTask(taskId, { status: 'completed' });
        });
        this.clearSelection();
        this.closeModal();
        this.refreshView();
        this.showToast(`${this.selectedTasks.size} tâches marquées comme terminées`, 'success');
    }

    bulkDelete() {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedTasks.size} tâches ?`)) {
            this.selectedTasks.forEach(taskId => {
                window.taskManager.deleteTask(taskId);
            });
            this.clearSelection();
            this.closeModal();
            this.refreshView();
            this.showToast('Tâches supprimées', 'success');
        }
    }

    // =====================================
    // Filters
    // =====================================

    quickFilter(filterId) {
        this.currentFilters = {
            ...this.currentFilters,
            status: 'all',
            overdue: false,
            relanced: false,
            waiting: false,
            checklistIncomplete: false
        };

        switch (filterId) {
            case 'todo':
            case 'in-progress':
            case 'completed':
                this.currentFilters.status = filterId;
                break;
            case 'relanced':
                this.currentFilters.status = 'relanced';
                this.currentFilters.relanced = true;
                break;
            case 'waiting':
                this.currentFilters.status = 'waiting';
                this.currentFilters.waiting = true;
                break;
            case 'overdue':
                this.currentFilters.overdue = true;
                break;
        }

        this.refreshView();
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
    }

    clearSearch() {
        this.currentFilters.search = '';
        document.getElementById('taskSearchInput').value = '';
        this.refreshView();
    }

    // =====================================
    // Utilities
    // =====================================

    setupEventListeners() {
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    this.refreshView();
                }, 300);
            });
        }
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        const controlsContainer = document.querySelector('.tasks-interface');
        if (controlsContainer) {
            const stats = window.taskManager.getStats();
            controlsContainer.querySelector('.controls-panel').outerHTML = this.renderControls(stats);
            this.setupEventListeners();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    renderEmptyState() {
        const hasFilters = this.currentFilters.search || 
                          this.currentFilters.status !== 'all' ||
                          this.currentFilters.overdue ||
                          this.currentFilters.relanced ||
                          this.currentFilters.waiting;

        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3>Aucune tâche trouvée</h3>
                <p>${hasFilters ? 'Aucune tâche ne correspond à vos critères' : 'Commencez par créer votre première tâche'}</p>
                ${hasFilters ? `
                    <button class="btn btn-primary" onclick="window.tasksView.resetFilters()">
                        <i class="fas fa-undo"></i> Réinitialiser les filtres
                    </button>
                ` : `
                    <button class="btn btn-primary" onclick="window.tasksView.showCreateModal()">
                        <i class="fas fa-plus"></i> Créer une tâche
                    </button>
                `}
            </div>
        `;
    }

    resetFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            search: '',
            sortBy: 'created',
            overdue: false,
            relanced: false,
            waiting: false,
            checklistIncomplete: false
        };
        this.refreshView();
    }

    isFilterActive(filterId) {
        switch (filterId) {
            case 'all': 
                return this.currentFilters.status === 'all' && 
                       !this.currentFilters.overdue &&
                       !this.currentFilters.relanced &&
                       !this.currentFilters.waiting;
            case 'todo':
            case 'in-progress':
            case 'completed':
                return this.currentFilters.status === filterId;
            case 'relanced':
                return this.currentFilters.relanced || this.currentFilters.status === 'relanced';
            case 'waiting':
                return this.currentFilters.waiting || this.currentFilters.status === 'waiting';
            case 'overdue':
                return this.currentFilters.overdue;
            default:
                return false;
        }
    }

    getChecklistProgress(task) {
        if (!task.checklist || task.checklist.length === 0) return null;
        const completed = task.checklist.filter(item => item.completed).length;
        return `${completed}/${task.checklist.length}`;
    }

    getStatusLabel(status) {
        const labels = {
            'todo': '⏳ À faire',
            'in-progress': '🔄 En cours',
            'completed': '✅ Terminé',
            'relanced': '📨 Relancé',
            'waiting': '⌛ En attente'
        };
        return labels[status] || status;
    }

    getPriorityLabel(priority) {
        const labels = {
            'urgent': '🚨 Urgent',
            'high': '⚡ Haute',
            'medium': '📌 Normale',
            'low': '📄 Basse'
        };
        return labels[priority] || priority;
    }

    formatDate(date) {
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Aujourd\'hui';
        if (diffDays === 1) return 'Demain';
        if (diffDays === -1) return 'Hier';
        if (diffDays < 0) return `En retard de ${Math.abs(diffDays)}j`;
        if (diffDays <= 7) return `Dans ${diffDays}j`;
        
        return date.toLocaleDateString('fr-FR');
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDueDate(dueDateString) {
        if (!dueDateString) return '';
        
        const date = new Date(dueDateString);
        const formatted = this.formatDate(date);
        const isOverdue = date < new Date();
        
        return `<span class="${isOverdue ? 'text-danger' : ''}">${formatted}</span>`;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// =====================================
// Initialisation
// =====================================

function initializeTaskManager() {
    console.log('[TaskManager] Initializing v11...');
    
    // Créer les instances
    if (!window.taskManager) {
        window.taskManager = new TaskManager();
    }
    
    if (!window.tasksView) {
        window.tasksView = new TasksView();
    }
    
    // S'assurer que toutes les méthodes sont bindées correctement
    const bindMethods = (obj, className) => {
        Object.getOwnPropertyNames(className.prototype).forEach(name => {
            if (name !== 'constructor' && typeof obj[name] === 'function') {
                obj[name] = obj[name].bind(obj);
            }
        });
    };
    
    bindMethods(window.taskManager, TaskManager);
    bindMethods(window.tasksView, TasksView);
    
    console.log('✅ TaskManager v11 loaded successfully');
}

// Auto-initialisation
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTaskManager);
    } else {
        initializeTaskManager();
    }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaskManager, TasksView };
}
