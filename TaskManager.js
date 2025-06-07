// TaskManager Pro v9.0 - Affichage Minimaliste sur 2 lignes

// =====================================
// ENHANCED TASK MANAGER CLASS
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
            console.log('[TaskManager] Initializing v9.0 - Affichage Minimaliste...');
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
                title: 'Valider la campagne marketing Q2',
                priority: 'high',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'sarah.martin@acme-corp.com',
                emailFromName: 'Sarah Martin',
                emailSubject: 'Validation campagne marketing Q2',
                emailDomain: 'acme-corp.com',
                tags: ['marketing', 'urgent'],
                client: 'ACME Corp',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                dueDate: '2025-06-08',
                method: 'ai'
            },
            {
                id: 'sample_2',
                title: 'Révision contrat partenariat',
                priority: 'medium',
                status: 'in-progress',
                category: 'work',
                hasEmail: false,
                tags: ['legal', 'contrat'],
                client: 'TechStart',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 3600000).toISOString(),
                dueDate: '2025-06-10',
                method: 'manual'
            },
            {
                id: 'sample_3',
                title: 'Préparer présentation board',
                priority: 'urgent',
                status: 'todo',
                category: 'presentation',
                hasEmail: true,
                emailFrom: 'ceo@innovex.fr',
                emailFromName: 'CEO Innovex',
                emailDomain: 'innovex.fr',
                tags: ['board', 'présentation'],
                client: 'Innovex',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                updatedAt: new Date(Date.now() - 3600000).toISOString(),
                dueDate: '2025-06-07',
                method: 'email'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    async createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email:', taskData.title);
        
        const taskId = taskData.id || this.generateId();
        
        const task = {
            id: taskId,
            title: taskData.title || 'Nouvelle tâche',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'email',
            
            // Données email essentielles
            emailFrom: taskData.emailFrom || email?.from?.emailAddress?.address,
            emailFromName: taskData.emailFromName || email?.from?.emailAddress?.name,
            emailSubject: taskData.emailSubject || email?.subject,
            emailDomain: taskData.emailDomain || (taskData.emailFrom ? taskData.emailFrom.split('@')[1] : ''),
            hasEmail: true,
            emailDate: taskData.emailDate || email?.receivedDateTime,
            
            // Métadonnées minimales
            tags: taskData.tags || [],
            client: taskData.client || 'Externe',
            
            // Timestamps
            createdAt: taskData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            method: taskData.method || 'ai'
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        console.log('[TaskManager] Task created successfully:', task.id);
        return task;
    }

    createTask(taskData) {
        console.log('[TaskManager] Creating normal task:', taskData.title || 'Untitled');
        
        const task = {
            id: taskData.id || this.generateId(),
            title: taskData.title || 'Nouvelle tâche',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'other',
            
            // Email info
            emailFrom: taskData.emailFrom || null,
            emailFromName: taskData.emailFromName || null,
            emailDomain: taskData.emailDomain || null,
            hasEmail: !!(taskData.emailFrom),
            emailDate: taskData.emailDate || taskData.createdAt,
            
            // Metadata
            tags: taskData.tags || [],
            client: taskData.client || 'Interne',
            
            // Timestamps
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
        
        if (filters.client && filters.client !== 'all') {
            filtered = filtered.filter(task => task.client === filters.client);
        }
        
        if (filters.tag && filters.tag !== 'all') {
            filtered = filtered.filter(task => 
                task.tags && Array.isArray(task.tags) && task.tags.includes(filters.tag)
            );
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
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
                sorted.sort((a, b) => {
                    const clientA = (a.client || 'ZZZ').toLowerCase();
                    const clientB = (b.client || 'ZZZ').toLowerCase();
                    return clientA.localeCompare(clientB);
                });
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
            }).length
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
// MINIMAL TASKS VIEW - 2 LIGNES MAX
// =====================================
class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            client: 'all',
            tag: 'all',
            search: '',
            sortBy: 'created'
        };
        
        this.selectedTasks = new Set();
        this.showCompleted = false;
        
        window.addEventListener('taskUpdate', () => {
            this.refreshView();
        });
    }

    render(container) {
        if (!container) {
            console.error('[TasksView] No container provided');
            return;
        }

        if (!window.taskManager || !window.taskManager.initialized) {
            container.innerHTML = `
                <div class="loading-state-minimal">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Chargement...</span>
                </div>
            `;
            
            setTimeout(() => {
                if (window.taskManager && window.taskManager.initialized) {
                    this.render(container);
                }
            }, 500);
            return;
        }

        const stats = window.taskManager.getStats();
        
        container.innerHTML = `
            <div class="tasks-minimal-page">
                <!-- Header compact -->
                <div class="tasks-header-minimal">
                    <div class="header-left">
                        <h1 class="tasks-title-minimal">Tâches</h1>
                        <span class="tasks-count-minimal">${stats.total}</span>
                    </div>
                    
                    <div class="header-center">
                        <div class="search-minimal">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   id="taskSearchInput"
                                   placeholder="Rechercher..." 
                                   value="${this.currentFilters.search}">
                        </div>
                    </div>
                    
                    <div class="header-right">
                        <button class="btn-minimal btn-primary" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            Nouveau
                        </button>
                    </div>
                </div>

                <!-- Filtres status compacts -->
                <div class="status-filters-minimal">
                    ${this.buildStatusFilters(stats)}
                </div>

                <!-- Liste des tâches -->
                <div class="tasks-list-minimal" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addMinimalStyles();
        this.setupEventListeners();
        console.log('[TasksView] Minimal interface rendered');
    }

    buildStatusFilters(stats) {
        const filters = [
            { id: 'all', name: 'Toutes', count: stats.total },
            { id: 'todo', name: 'À faire', count: stats.todo },
            { id: 'in-progress', name: 'En cours', count: stats.inProgress },
            { id: 'overdue', name: 'Retard', count: stats.overdue },
            { id: 'completed', name: 'Terminées', count: stats.completed }
        ];

        return filters.map(filter => `
            <button class="filter-pill ${this.isFilterActive(filter.id) ? 'active' : ''}" 
                    onclick="window.tasksView.quickFilter('${filter.id}')">
                ${filter.name} <span class="pill-count">${filter.count}</span>
            </button>
        `).join('');
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return `
                <div class="empty-state-minimal">
                    <i class="fas fa-inbox"></i>
                    <p>Aucune tâche trouvée</p>
                </div>
            `;
        }

        return filteredTasks.map(task => this.renderMinimalTask(task)).join('');
    }

    // AFFICHAGE MINIMALISTE SUR 2 LIGNES MAX
    renderMinimalTask(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityIcon = this.getPriorityIcon(task.priority);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-minimal ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <!-- Ligne 1: Priorité + Titre + Tags + Actions -->
                <div class="task-line-1">
                    <div class="task-priority priority-${task.priority}" title="Priorité ${task.priority}">
                        ${priorityIcon}
                    </div>
                    
                    <div class="task-title-minimal">
                        ${this.escapeHtml(task.title)}
                    </div>
                    
                    <div class="task-tags-minimal">
                        ${task.tags && task.tags.length > 0 ? 
                            task.tags.slice(0, 2).map(tag => `<span class="tag">#${tag}</span>`).join('') +
                            (task.tags.length > 2 ? `<span class="tag-more">+${task.tags.length - 2}</span>` : '')
                        : ''}
                    </div>
                    
                    <div class="task-actions-minimal">
                        ${task.status !== 'completed' ? `
                            <button class="action-btn complete" 
                                    onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                                    title="Terminer">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn delete" 
                                onclick="event.stopPropagation(); window.tasksView.confirmDeleteTask('${task.id}')"
                                title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Ligne 2: Client + Domaine + Date limite + Date création -->
                <div class="task-line-2">
                    <div class="task-client">
                        <i class="fas fa-building"></i>
                        ${task.client || 'Interne'}
                    </div>
                    
                    ${task.hasEmail && task.emailDomain ? `
                        <div class="task-domain">
                            <i class="fas fa-at"></i>
                            ${task.emailDomain}
                        </div>
                    ` : ''}
                    
                    ${dueDateInfo.html ? `
                        <div class="task-due-date ${dueDateInfo.class}">
                            <i class="fas fa-calendar"></i>
                            ${dueDateInfo.text}
                        </div>
                    ` : ''}
                    
                    <div class="task-created">
                        ${this.formatRelativeDate(task.createdAt)}
                    </div>
                </div>
            </div>
        `;
    }

    // Event handlers minimalistes
    handleTaskClick(event, taskId) {
        this.showTaskDetails(taskId);
    }

    quickFilter(filterId) {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            client: 'all',
            tag: 'all',
            search: this.currentFilters.search,
            sortBy: this.currentFilters.sortBy,
            overdue: false
        };

        switch (filterId) {
            case 'all':
                break;
            case 'todo':
            case 'in-progress':
            case 'completed':
                this.currentFilters.status = filterId;
                break;
            case 'overdue':
                this.currentFilters.overdue = true;
                break;
        }

        this.refreshView();
    }

    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        const uniqueId = 'task_details_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${this.escapeHtml(task.title)}</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove();">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="task-detail-grid">
                            <div class="detail-item">
                                <strong>Priorité:</strong>
                                <span class="priority-badge priority-${task.priority}">
                                    ${this.getPriorityIcon(task.priority)} ${this.getPriorityLabel(task.priority)}
                                </span>
                            </div>
                            <div class="detail-item">
                                <strong>Statut:</strong>
                                <span class="status-badge status-${task.status}">
                                    ${this.getStatusLabel(task.status)}
                                </span>
                            </div>
                            <div class="detail-item">
                                <strong>Client:</strong>
                                <span>${task.client || 'Interne'}</span>
                            </div>
                            ${task.dueDate ? `
                                <div class="detail-item">
                                    <strong>Échéance:</strong>
                                    <span>${new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                                </div>
                            ` : ''}
                            ${task.hasEmail ? `
                                <div class="detail-item">
                                    <strong>Email:</strong>
                                    <span>${task.emailFromName || task.emailFrom}</span>
                                </div>
                            ` : ''}
                            ${task.tags && task.tags.length > 0 ? `
                                <div class="detail-item">
                                    <strong>Tags:</strong>
                                    <span>${task.tags.map(tag => `#${tag}`).join(', ')}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="document.getElementById('${uniqueId}').remove();">
                            Fermer
                        </button>
                        ${task.status !== 'completed' ? `
                            <button class="btn-primary" onclick="window.tasksView.markComplete('${task.id}'); document.getElementById('${uniqueId}').remove();">
                                <i class="fas fa-check"></i> Marquer terminé
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    confirmDeleteTask(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        if (confirm(`Supprimer la tâche "${task.title}" ?`)) {
            window.taskManager.deleteTask(taskId);
            this.selectedTasks.delete(taskId);
            this.showToast('Tâche supprimée', 'success');
        }
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche terminée', 'success');
    }

    showCreateModal() {
        const uniqueId = 'create_task_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Nouvelle tâche</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove();">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Titre *</label>
                            <input type="text" id="new-task-title" placeholder="Titre de la tâche" />
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Priorité</label>
                                <select id="new-task-priority">
                                    <option value="low">Basse</option>
                                    <option value="medium" selected>Normale</option>
                                    <option value="high">Haute</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Client</label>
                                <input type="text" id="new-task-client" placeholder="Client/Projet" value="Interne" />
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Date d'échéance</label>
                            <input type="date" id="new-task-duedate" />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="document.getElementById('${uniqueId}').remove();">
                            Annuler
                        </button>
                        <button class="btn-primary" onclick="window.tasksView.createNewTask('${uniqueId}');">
                            <i class="fas fa-plus"></i> Créer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            document.getElementById('new-task-title')?.focus();
        }, 100);
    }

    createNewTask(modalId) {
        const title = document.getElementById('new-task-title')?.value?.trim();
        const priority = document.getElementById('new-task-priority')?.value;
        const client = document.getElementById('new-task-client')?.value?.trim();
        const dueDate = document.getElementById('new-task-duedate')?.value;

        if (!title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        const taskData = {
            title,
            priority,
            client: client || 'Interne',
            dueDate: dueDate || null,
            category: 'work',
            method: 'manual'
        };

        try {
            window.taskManager.createTask(taskData);
            document.getElementById(modalId).remove();
            
            this.showToast('Tâche créée', 'success');
            this.refreshView();
        } catch (error) {
            console.error('[TasksView] Error creating task:', error);
            this.showToast('Erreur', 'error');
        }
    }

    // Utility methods
    getPriorityIcon(priority) {
        const icons = { urgent: '🚨', high: '⚡', medium: '📌', low: '📄' };
        return icons[priority] || '📌';
    }

    getPriorityLabel(priority) {
        const labels = { urgent: 'Urgente', high: 'Haute', medium: 'Normale', low: 'Basse' };
        return labels[priority] || 'Normale';
    }

    getStatusLabel(status) {
        const labels = { todo: 'À faire', 'in-progress': 'En cours', completed: 'Terminé' };
        return labels[status] || 'À faire';
    }

    formatDueDate(dateString) {
        if (!dateString) return { html: '', text: '', class: '' };
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        let className = 'normal';
        let text = '';
        
        if (diffDays < 0) {
            className = 'overdue';
            text = `${Math.abs(diffDays)}j retard`;
        } else if (diffDays === 0) {
            className = 'today';
            text = 'Aujourd\'hui';
        } else if (diffDays === 1) {
            className = 'tomorrow';
            text = 'Demain';
        } else if (diffDays <= 7) {
            className = 'soon';
            text = `${diffDays}j`;
        } else {
            text = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
        
        return {
            html: text,
            text: text,
            class: className
        };
    }

    formatRelativeDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}min`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}h`;
        } else if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}j`;
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isFilterActive(filterId) {
        switch (filterId) {
            case 'all': return this.currentFilters.status === 'all' && !this.currentFilters.overdue;
            case 'todo': return this.currentFilters.status === 'todo';
            case 'in-progress': return this.currentFilters.status === 'in-progress';
            case 'completed': return this.currentFilters.status === 'completed';
            case 'overdue': return this.currentFilters.overdue;
            default: return false;
        }
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        const stats = window.taskManager.getStats();
        document.querySelector('.status-filters-minimal')?.innerHTML = this.buildStatusFilters(stats);
        document.querySelector('.tasks-count-minimal').textContent = stats.total;
    }

    showToast(message, type = 'info') {
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
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

    // STYLES MINIMALISTES
    addMinimalStyles() {
        if (document.getElementById('minimalTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'minimalTaskStyles';
        styles.textContent = `
            .tasks-minimal-page {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #fafafa;
                min-height: 100vh;
                padding: 16px;
            }
            
            .tasks-header-minimal {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 16px;
                background: white;
                border-radius: 8px;
                padding: 12px 16px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .header-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tasks-title-minimal {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .tasks-count-minimal {
                background: #e5e7eb;
                color: #6b7280;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .header-center {
                flex: 1;
                max-width: 300px;
            }
            
            .search-minimal {
                position: relative;
            }
            
            .search-minimal input {
                width: 100%;
                padding: 8px 12px 8px 32px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .search-minimal i {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
            }
            
            .btn-minimal {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .btn-minimal:hover {
                background: #f9fafb;
                border-color: #9ca3af;
            }
            
            .btn-minimal.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .btn-minimal.btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
            }
            
            .status-filters-minimal {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            
            .filter-pill {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                font-size: 13px;
                font-weight: 500;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .filter-pill:hover {
                border-color: #3b82f6;
                color: #3b82f6;
            }
            
            .filter-pill.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .pill-count {
                background: rgba(0,0,0,0.1);
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .filter-pill.active .pill-count {
                background: rgba(255,255,255,0.2);
            }
            
            .tasks-list-minimal {
                display: flex;
                flex-direction: column;
                gap: 2px;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .task-minimal {
                display: flex;
                flex-direction: column;
                padding: 12px 16px;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: all 0.2s ease;
                background: white;
            }
            
            .task-minimal:last-child {
                border-bottom: none;
            }
            
            .task-minimal:hover {
                background: #f8fafc;
            }
            
            .task-minimal.selected {
                background: #eff6ff;
                border-left: 3px solid #3b82f6;
            }
            
            .task-minimal.completed {
                opacity: 0.6;
            }
            
            .task-minimal.completed .task-title-minimal {
                text-decoration: line-through;
            }
            
            .task-line-1 {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 6px;
            }
            
            .task-priority {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                flex-shrink: 0;
            }
            
            .priority-urgent {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .priority-high {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .priority-medium {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .priority-low {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .task-title-minimal {
                flex: 1;
                font-weight: 600;
                color: #1f2937;
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .task-tags-minimal {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .tag {
                background: #e5e7eb;
                color: #6b7280;
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 10px;
                font-weight: 500;
            }
            
            .tag-more {
                background: #f3f4f6;
                color: #9ca3af;
                padding: 2px 4px;
                border-radius: 6px;
                font-size: 9px;
                font-weight: 500;
            }
            
            .task-actions-minimal {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .action-btn {
                width: 24px;
                height: 24px;
                border: none;
                border-radius: 4px;
                background: #f3f4f6;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                transition: all 0.2s ease;
            }
            
            .action-btn:hover {
                background: #e5e7eb;
            }
            
            .action-btn.complete:hover {
                background: #dcfce7;
                color: #16a34a;
            }
            
            .action-btn.delete:hover {
                background: #fef2f2;
                color: #dc2626;
            }
            
            .task-line-2 {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 12px;
                color: #6b7280;
            }
            
            .task-client,
            .task-domain,
            .task-due-date {
                display: flex;
                align-items: center;
                gap: 4px;
                white-space: nowrap;
            }
            
            .task-due-date.overdue {
                color: #dc2626;
                font-weight: 600;
            }
            
            .task-due-date.today {
                color: #d97706;
                font-weight: 600;
            }
            
            .task-due-date.soon {
                color: #059669;
                font-weight: 500;
            }
            
            .task-created {
                margin-left: auto;
                font-size: 11px;
                color: #9ca3af;
            }
            
            .loading-state-minimal {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 40px;
                color: #6b7280;
            }
            
            .empty-state-minimal {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .empty-state-minimal i {
                font-size: 32px;
                margin-bottom: 12px;
                color: #d1d5db;
            }
            
            /* Modal styles */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 8px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            
            .modal-header {
                padding: 16px 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 18px;
                color: #1f2937;
            }
            
            .modal-header button {
                background: none;
                border: none;
                font-size: 16px;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 16px 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            .modal-footer button {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                color: #374151;
                cursor: pointer;
                font-size: 14px;
            }
            
            .modal-footer .btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .task-detail-grid {
                display: grid;
                gap: 12px;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: #f9fafb;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .detail-item strong {
                color: #374151;
                font-weight: 600;
            }
            
            .priority-badge,
            .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 4px;
                font-weight: 500;
                color: #374151;
                font-size: 14px;
            }
            
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                background: white;
            }
            
            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .tasks-header-minimal {
                    flex-direction: column;
                    gap: 12px;
                    align-items: stretch;
                }
                
                .header-left,
                .header-center,
                .header-right {
                    width: 100%;
                }
                
                .header-center {
                    max-width: none;
                }
                
                .task-line-2 {
                    gap: 12px;
                    font-size: 11px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION
// =====================================
function initializeTaskManager() {
    console.log('[TaskManager] Initializing minimal v9.0...');
    
    if (!window.taskManager || !window.taskManager.initialized) {
        window.taskManager = new TaskManager();
    }
    
    if (!window.tasksView) {
        window.tasksView = new TasksView();
    }
    
    // Bind methods
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
    
    console.log('✅ TaskManager v9.0 Minimal loaded');
}

// Initialize
initializeTaskManager();

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TaskManager] DOM ready, ensuring initialization...');
    initializeTaskManager();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TaskManager] Fallback initialization...');
            initializeTaskManager();
        }
    }, 1000);
});
