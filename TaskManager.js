// TaskManager Pro v9.0 - Interface moderne épurée

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
            console.log('[TaskManager] Initializing v9.0 - Interface moderne épurée...');
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
                description: 'Validation des éléments de campagne marketing pour le Q2, incluant visuels, budget de 50k€ et planning de lancement. Coordination avec l\'équipe commerciale requise.',
                priority: 'high',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'sarah.martin@acme-corp.com',
                emailFromName: 'Sarah Martin',
                emailSubject: 'Validation campagne marketing Q2',
                emailDate: '2025-06-06T09:15:00Z',
                emailDomain: 'acme-corp.com',
                tags: ['marketing', 'validation', 'q2'],
                client: 'ACME Corp',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                needsReply: true,
                dueDate: '2025-06-08',
                method: 'ai'
            },
            {
                id: 'sample_2',
                title: 'Révision du contrat client TechStart',
                description: 'Analyser les termes du nouveau contrat et proposer des amendements.',
                priority: 'medium',
                status: 'in-progress',
                category: 'legal',
                hasEmail: false,
                tags: ['contrat', 'legal', 'techstart'],
                client: 'TechStart',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 43200000).toISOString(),
                dueDate: '2025-06-10',
                method: 'manual'
            },
            {
                id: 'sample_3',
                title: 'Préparation présentation board',
                description: 'Slides pour la présentation du board trimestriel avec métriques et projections.',
                priority: 'urgent',
                status: 'todo',
                category: 'presentation',
                hasEmail: false,
                tags: ['présentation', 'board', 'urgent'],
                client: 'Interne',
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                updatedAt: new Date(Date.now() - 7200000).toISOString(),
                dueDate: '2025-06-07',
                method: 'manual'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    // MÉTHODE PRINCIPALE POUR CRÉER UNE TÂCHE À PARTIR D'UN EMAIL
    async createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email:', taskData.title);
        
        const taskId = taskData.id || this.generateId();
        
        const task = {
            id: taskId,
            title: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'email',
            
            // DONNÉES EMAIL
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || (email?.from?.emailAddress?.address),
            emailFromName: taskData.emailFromName || (email?.from?.emailAddress?.name),
            emailSubject: taskData.emailSubject || email?.subject,
            emailDomain: taskData.emailDomain || (taskData.emailFrom ? taskData.emailFrom.split('@')[1] : ''),
            hasEmail: true,
            emailReplied: false,
            emailDate: taskData.emailDate || email?.receivedDateTime,
            needsReply: taskData.needsReply !== false,
            hasAttachments: email?.hasAttachments || false,
            
            // MÉTADONNÉES
            tags: taskData.tags || [],
            client: taskData.client || 'Externe',
            
            // TIMESTAMPS
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
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'other',
            
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || null,
            emailFromName: taskData.emailFromName || null,
            emailSubject: taskData.emailSubject || null,
            hasEmail: !!(taskData.emailId || taskData.emailFrom),
            emailReplied: false,
            emailDate: taskData.emailDate || taskData.createdAt,
            needsReply: taskData.needsReply || false,
            
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
        
        // Status filter
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        
        // Priority filter
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }
        
        // Category filter
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(task => task.category === filters.category);
        }
        
        // Client filter
        if (filters.client && filters.client !== 'all') {
            filtered = filtered.filter(task => task.client === filters.client);
        }
        
        // Tag filter
        if (filters.tag && filters.tag !== 'all') {
            filtered = filtered.filter(task => 
                task.tags && Array.isArray(task.tags) && task.tags.includes(filters.tag)
            );
        }
        
        // Search filter
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                (task.emailFromName && task.emailFromName.toLowerCase().includes(search)) ||
                (task.client && task.client.toLowerCase().includes(search)) ||
                (task.tags && task.tags.some(tag => tag.toLowerCase().includes(search)))
            );
        }
        
        // Special filters
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
// MODERN TASKS VIEW - INTERFACE ÉPURÉE
// =====================================
class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all', 
            category: 'all',
            client: 'all',
            tag: 'all',
            search: '',
            sortBy: 'created',
            dateRange: 'all'
        };
        
        this.selectedTasks = new Set();
        this.currentViewMode = 'condensed';
        this.showCompleted = false;
        this.showAdvancedFilters = false;
        
        window.addEventListener('taskUpdate', () => {
            this.refreshView();
        });
    }

    // MÉTHODE PRINCIPALE POUR RENDRE L'INTERFACE
    render(container) {
        if (!container) {
            console.error('[TasksView] No container provided');
            return;
        }

        if (!window.taskManager || !window.taskManager.initialized) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-icon">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Chargement des tâches...</p>
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
            <div class="tasks-page-modern">
                <!-- Barre principale -->
                <div class="tasks-main-toolbar">
                    <div class="toolbar-left">
                        <h1 class="tasks-title">Tâches</h1>
                        <span class="tasks-count">${stats.total} tâche${stats.total > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div class="toolbar-center">
                        <div class="search-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   class="search-input" 
                                   id="taskSearchInput"
                                   placeholder="Rechercher dans les tâches..." 
                                   value="${this.currentFilters.search}">
                            <button class="search-clear" id="searchClearBtn" 
                                    style="display: ${this.currentFilters.search ? 'flex' : 'none'}"
                                    onclick="window.tasksView.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="toolbar-right">
                        ${this.selectedTasks.size > 0 ? `
                            <div class="selection-info">
                                <span class="selection-count">${this.selectedTasks.size} sélectionné(s)</span>
                                <button class="btn-secondary" onclick="window.tasksView.clearSelection()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <button class="btn-primary" onclick="window.tasksView.bulkActions()">
                                <i class="fas fa-cog"></i>
                                <span>Actions</span>
                            </button>
                        ` : ''}
                        <button class="btn-primary" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            <span>Nouvelle tâche</span>
                        </button>
                    </div>
                </div>

                <!-- Filtres de statut -->
                <div class="status-filters">
                    ${this.buildStatusPills(stats)}
                    <button class="btn-filters ${this.showAdvancedFilters ? 'active' : ''}" 
                            onclick="window.tasksView.toggleAdvancedFilters()">
                        <i class="fas fa-filter"></i>
                        <span>Filtres</span>
                        <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                    </button>
                </div>

                <!-- Filtres avancés -->
                <div class="advanced-filters ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFiltersPanel">
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label><i class="fas fa-flag"></i> Priorité</label>
                            <select id="priorityFilter" onchange="window.tasksView.updateFilter('priority', this.value)">
                                <option value="all" ${this.currentFilters.priority === 'all' ? 'selected' : ''}>Toutes</option>
                                <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                                <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label><i class="fas fa-building"></i> Client</label>
                            <select id="clientFilter" onchange="window.tasksView.updateFilter('client', this.value)">
                                ${this.buildClientFilterOptions()}
                            </select>
                        </div>

                        <div class="filter-group">
                            <label><i class="fas fa-sort"></i> Trier par</label>
                            <select id="sortByFilter" onchange="window.tasksView.updateFilter('sortBy', this.value)">
                                <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Date création</option>
                                <option value="updated" ${this.currentFilters.sortBy === 'updated' ? 'selected' : ''}>Dernière modif</option>
                                <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                                <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Date échéance</option>
                                <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre A-Z</option>
                            </select>
                        </div>

                        <div class="filter-actions">
                            <button class="btn-secondary btn-sm" onclick="window.tasksView.resetAllFilters()">
                                <i class="fas fa-undo"></i> Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tasks-container" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addModernStyles();
        this.setupEventListeners();
        console.log('[TasksView] Modern interface rendered');
    }

    buildStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Toutes', icon: '📋', count: stats.total },
            { id: 'todo', name: 'À faire', icon: '⏳', count: stats.todo },
            { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.inProgress },
            { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue },
            { id: 'needsReply', name: 'À répondre', icon: '📧', count: stats.needsReply },
            { id: 'completed', name: 'Terminées', icon: '✅', count: stats.completed }
        ];

        return pills.map(pill => `
            <button class="status-pill ${this.isFilterActive(pill.id) ? 'active' : ''}" 
                    data-filter="${pill.id}"
                    onclick="window.tasksView.quickFilter('${pill.id}')">
                <span class="pill-icon">${pill.icon}</span>
                <span class="pill-text">${pill.name}</span>
                <span class="pill-count">${pill.count}</span>
            </button>
        `).join('');
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return this.renderEmptyState();
        }

        return this.renderCondensedView(filteredTasks);
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3>Aucune tâche trouvée</h3>
                <p>
                    ${this.hasActiveFilters() ? 'Aucune tâche ne correspond à vos critères' : 'Vous n\'avez aucune tâche'}
                </p>
                ${this.hasActiveFilters() ? `
                    <button class="btn-primary" onclick="window.tasksView.resetAllFilters()">
                        <i class="fas fa-undo"></i>
                        <span>Réinitialiser les filtres</span>
                    </button>
                ` : `
                    <button class="btn-primary" onclick="window.tasksView.showCreateModal()">
                        <i class="fas fa-plus"></i>
                        <span>Créer votre première tâche</span>
                    </button>
                `}
            </div>
        `;
    }

    renderCondensedView(tasks) {
        return `
            <div class="tasks-list">
                ${tasks.map(task => this.renderTaskItem(task)).join('')}
            </div>
        `;
    }

    // NOUVEAU RENDU DE TÂCHE MODERNE SUR 2 LIGNES MAX
    renderTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusIcon = this.getStatusIcon(task.status);
        
        const clientInfo = task.hasEmail ? 
            `@${task.emailDomain || 'email'}` : 
            task.client || 'Interne';
            
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="task-indicators">
                    <div class="priority-indicator priority-${task.priority}" title="Priorité ${task.priority}">
                        ${priorityIcon}
                    </div>
                </div>
                
                <div class="task-content">
                    <div class="task-main-line">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="task-meta">
                            <span class="client-badge">${clientInfo}</span>
                            ${dueDateInfo.html}
                            <span class="task-date">${this.formatRelativeDate(task.createdAt)}</span>
                        </div>
                    </div>
                    
                    <div class="task-sub-line">
                        ${task.hasEmail ? `
                            <div class="email-info">
                                <i class="fas fa-envelope"></i>
                                <span class="email-from">${this.escapeHtml(task.emailFromName || task.emailFrom || 'Email')}</span>
                                ${task.needsReply ? '<span class="needs-reply">Réponse requise</span>' : ''}
                            </div>
                        ` : task.description ? `
                            <div class="task-description">
                                ${this.escapeHtml(task.description.substring(0, 100))}${task.description.length > 100 ? '...' : ''}
                            </div>
                        ` : ''}
                        
                        <div class="task-tags">
                            ${task.tags && task.tags.length > 0 ? task.tags.slice(0, 3).map(tag => `
                                <span class="task-tag" onclick="event.stopPropagation(); window.tasksView.filterByTag('${tag}')">#${tag}</span>
                            `).join('') : ''}
                            ${task.tags && task.tags.length > 3 ? `<span class="tags-more">+${task.tags.length - 3}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="task-actions">
                    ${this.renderQuickActions(task)}
                </div>
            </div>
        `;
    }

    renderQuickActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn view" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        actions.push(`
            <button class="action-btn delete" 
                    onclick="event.stopPropagation(); window.tasksView.confirmDeleteTask('${task.id}')"
                    title="Supprimer">
                <i class="fas fa-trash-alt"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // MÉTHODE POUR CONFIRMATION DE SUPPRESSION
    confirmDeleteTask(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        const modalHTML = `
            <div id="deleteConfirmModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="warning-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3>Confirmer la suppression</h3>
                        <p>Êtes-vous sûr de vouloir supprimer cette tâche ?</p>
                        <div class="task-preview">
                            <div class="task-title-preview">${this.escapeHtml(task.title)}</div>
                            ${task.hasEmail ? `
                                <div class="task-email-preview">
                                    <i class="fas fa-envelope"></i> Email de ${task.emailFromName || task.emailFrom}
                                </div>
                            ` : ''}
                        </div>
                        <p class="warning-text">⚠️ Cette action est irréversible</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="document.getElementById('deleteConfirmModal').remove(); document.body.style.overflow = 'auto';">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                        <button class="btn-danger" onclick="window.tasksView.executeDelete('${task.id}'); document.getElementById('deleteConfirmModal').remove();">
                            <i class="fas fa-trash-alt"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    executeDelete(taskId) {
        window.taskManager.deleteTask(taskId);
        this.selectedTasks.delete(taskId);
        document.body.style.overflow = 'auto';
        this.showToast('Tâche supprimée définitivement', 'success');
    }

    // MÉTHODE POUR FILTRER PAR TAG
    filterByTag(tag) {
        this.currentFilters.tag = tag;
        this.showAdvancedFilters = true;
        
        const tagFilter = document.getElementById('tagFilter');
        if (tagFilter) {
            tagFilter.value = tag;
        }
        
        this.refreshView();
        this.showToast(`Filtré par tag: #${tag}`, 'info');
    }

    // Event handlers
    handleTaskClick(event, taskId) {
        this.showTaskDetails(taskId);
    }

    quickFilter(filterId) {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            search: this.currentFilters.search,
            sortBy: this.currentFilters.sortBy,
            overdue: false,
            needsReply: false
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
            case 'needsReply':
                this.currentFilters.needsReply = true;
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
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2>Détails de la tâche</h2>
                        <button class="modal-close" onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${this.buildTaskDetailsContent(task)}
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';">
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
        document.body.style.overflow = 'hidden';
    }

    buildTaskDetailsContent(task) {
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusLabel = this.getStatusLabel(task.status);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-details">
                <div class="details-header">
                    <h1 class="task-title-large">${this.escapeHtml(task.title)}</h1>
                    <div class="task-badges">
                        <span class="priority-badge priority-${task.priority}">
                            ${priorityIcon} ${this.getPriorityLabel(task.priority)}
                        </span>
                        <span class="status-badge status-${task.status}">
                            ${this.getStatusIcon(task.status)} ${statusLabel}
                        </span>
                        ${dueDateInfo.html}
                    </div>
                </div>

                ${task.hasEmail ? `
                    <div class="details-section">
                        <h3><i class="fas fa-envelope"></i> Informations Email</h3>
                        <div class="email-info-grid">
                            <div class="info-item">
                                <strong>Expéditeur:</strong>
                                <span>${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')}</span>
                            </div>
                            ${task.emailFrom ? `
                                <div class="info-item">
                                    <strong>Email:</strong>
                                    <span>${this.escapeHtml(task.emailFrom)}</span>
                                </div>
                            ` : ''}
                            ${task.emailSubject ? `
                                <div class="info-item">
                                    <strong>Sujet:</strong>
                                    <span>${this.escapeHtml(task.emailSubject)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${task.description ? `
                    <div class="details-section">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <div class="description-content">
                            ${this.escapeHtml(task.description).replace(/\n/g, '<br>')}
                        </div>
                    </div>
                ` : ''}

                ${task.tags && task.tags.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-tags"></i> Tags</h3>
                        <div class="tags-list">
                            ${task.tags.map(tag => `
                                <span class="task-tag-large">#${tag}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="details-section">
                    <h3><i class="fas fa-info-circle"></i> Informations</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Client:</strong>
                            <span>${task.client || 'Non spécifié'}</span>
                        </div>
                        <div class="info-item">
                            <strong>Créée le:</strong>
                            <span>${new Date(task.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="info-item">
                            <strong>Modifiée le:</strong>
                            <span>${new Date(task.updatedAt).toLocaleString('fr-FR')}</span>
                        </div>
                        ${task.completedAt ? `
                            <div class="info-item">
                                <strong>Terminée le:</strong>
                                <span>${new Date(task.completedAt).toLocaleString('fr-FR')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
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

    getStatusIcon(status) {
        const icons = { todo: '⏳', 'in-progress': '🔄', completed: '✅' };
        return icons[status] || '⏳';
    }

    getStatusLabel(status) {
        const labels = { todo: 'À faire', 'in-progress': 'En cours', completed: 'Terminé' };
        return labels[status] || 'À faire';
    }

    formatDueDate(dateString) {
        if (!dateString) return { html: '', text: '' };
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        let className = 'due-date-normal';
        let text = '';
        
        if (diffDays < 0) {
            className = 'due-date-overdue';
            text = `En retard de ${Math.abs(diffDays)}j`;
        } else if (diffDays === 0) {
            className = 'due-date-today';
            text = 'Aujourd\'hui';
        } else if (diffDays === 1) {
            className = 'due-date-tomorrow';
            text = 'Demain';
        } else if (diffDays <= 7) {
            className = 'due-date-soon';
            text = `${diffDays}j`;
        } else {
            text = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
        
        return {
            html: `<span class="due-date ${className}">📅 ${text}</span>`,
            text: text
        };
    }

    formatRelativeDate(dateString) {
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
            return date.toLocaleDateString('fr-FR');
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
            case 'all': return this.currentFilters.status === 'all' && !this.currentFilters.overdue && !this.currentFilters.needsReply;
            case 'todo': return this.currentFilters.status === 'todo';
            case 'in-progress': return this.currentFilters.status === 'in-progress';
            case 'completed': return this.currentFilters.status === 'completed';
            case 'overdue': return this.currentFilters.overdue;
            case 'needsReply': return this.currentFilters.needsReply;
            default: return false;
        }
    }

    hasActiveFilters() {
        return this.currentFilters.status !== 'all' ||
               this.currentFilters.priority !== 'all' ||
               this.currentFilters.category !== 'all' ||
               this.currentFilters.client !== 'all' ||
               this.currentFilters.tag !== 'all' ||
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply;
    }

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        
        this.render(document.querySelector('.tasks-page-modern')?.parentElement);
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.render(document.querySelector('.tasks-page-modern')?.parentElement);
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche marquée comme terminée', 'success');
    }

    showCreateModal() {
        const uniqueId = 'create_task_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Créer une nouvelle tâche</h2>
                        <button class="modal-close" onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Titre de la tâche *</label>
                            <input type="text" id="new-task-title" class="form-input" placeholder="Titre de la tâche" />
                        </div>
                        
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="new-task-description" class="form-textarea" rows="4" placeholder="Description détaillée..."></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Priorité</label>
                                <select id="new-task-priority" class="form-select">
                                    <option value="low">📄 Basse</option>
                                    <option value="medium" selected>📌 Normale</option>
                                    <option value="high">⚡ Haute</option>
                                    <option value="urgent">🚨 Urgente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Date d'échéance</label>
                                <input type="date" id="new-task-duedate" class="form-input" />
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Client/Projet</label>
                            <input type="text" id="new-task-client" class="form-input" placeholder="Nom du client ou projet" value="Interne" />
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';">
                            Annuler
                        </button>
                        <button class="btn-primary" onclick="window.tasksView.createNewTask('${uniqueId}');">
                            <i class="fas fa-plus"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const titleInput = document.getElementById('new-task-title');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    createNewTask(modalId) {
        const title = document.getElementById('new-task-title')?.value?.trim();
        const description = document.getElementById('new-task-description')?.value?.trim();
        const priority = document.getElementById('new-task-priority')?.value;
        const dueDate = document.getElementById('new-task-duedate')?.value;
        const client = document.getElementById('new-task-client')?.value?.trim();

        if (!title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        const taskData = {
            title,
            description,
            priority,
            dueDate: dueDate || null,
            client: client || 'Interne',
            category: 'work',
            method: 'manual'
        };

        try {
            const task = window.taskManager.createTask(taskData);
            document.getElementById(modalId).remove();
            document.body.style.overflow = 'auto';
            
            this.showToast('Tâche créée avec succès', 'success');
            this.refreshView();
        } catch (error) {
            console.error('[TasksView] Error creating task:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    toggleAdvancedFilters() {
        this.showAdvancedFilters = !this.showAdvancedFilters;
        
        const panel = document.getElementById('advancedFiltersPanel');
        const toggle = document.querySelector('.btn-filters');
        
        if (panel) {
            panel.classList.toggle('show', this.showAdvancedFilters);
        }
        
        if (toggle) {
            toggle.classList.toggle('active', this.showAdvancedFilters);
            const chevron = toggle.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (chevron) {
                chevron.classList.toggle('fa-chevron-down', !this.showAdvancedFilters);
                chevron.classList.toggle('fa-chevron-up', this.showAdvancedFilters);
            }
        }
    }

    buildClientFilterOptions() {
        const tasks = window.taskManager.getAllTasks();
        const clients = new Set();
        
        tasks.forEach(task => {
            if (task.client) {
                clients.add(task.client);
            }
        });
        
        let options = `<option value="all" ${this.currentFilters.client === 'all' ? 'selected' : ''}>Tous les clients</option>`;
        
        Array.from(clients).sort().forEach(client => {
            const count = tasks.filter(t => t.client === client).length;
            options += `<option value="${client}" ${this.currentFilters.client === client ? 'selected' : ''}>${client} (${count})</option>`;
        });
        
        return options;
    }

    updateFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.refreshView();
    }

    resetAllFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            tag: 'all',
            search: '',
            sortBy: 'created',
            dateRange: 'all',
            overdue: false,
            needsReply: false
        };
        
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        document.querySelectorAll('.form-select').forEach(select => {
            if (select.querySelector('option[value="all"]')) {
                select.value = 'all';
            } else if (select.id === 'sortByFilter') {
                select.value = 'created';
            }
        });
        
        this.refreshView();
        this.showToast('Filtres réinitialisés', 'info');
    }

    bulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const actions = [
            'Marquer comme terminé',
            'Changer la priorité',
            'Supprimer'
        ];
        
        const action = prompt(`Actions disponibles pour ${this.selectedTasks.size} tâche(s):\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nEntrez le numéro de l'action:`);
        
        if (!action) return;
        
        const actionIndex = parseInt(action) - 1;
        
        switch (actionIndex) {
            case 0:
                this.selectedTasks.forEach(taskId => {
                    window.taskManager.updateTask(taskId, { status: 'completed' });
                });
                this.showToast(`${this.selectedTasks.size} tâche(s) marquée(s) comme terminée(s)`, 'success');
                this.clearSelection();
                break;
                
            case 1:
                const priority = prompt('Nouvelle priorité:\n1. Basse\n2. Normale\n3. Haute\n4. Urgente\n\nEntrez le numéro:');
                const priorities = ['', 'low', 'medium', 'high', 'urgent'];
                if (priority && priorities[parseInt(priority)]) {
                    this.selectedTasks.forEach(taskId => {
                        window.taskManager.updateTask(taskId, { priority: priorities[parseInt(priority)] });
                    });
                    this.showToast(`Priorité mise à jour pour ${this.selectedTasks.size} tâche(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 2:
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedTasks.size} tâche(s) ?`)) {
                    this.selectedTasks.forEach(taskId => {
                        window.taskManager.deleteTask(taskId);
                    });
                    this.showToast(`${this.selectedTasks.size} tâche(s) supprimée(s)`, 'success');
                    this.clearSelection();
                }
                break;
        }
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        const stats = window.taskManager.getStats();
        document.querySelectorAll('.status-filters').forEach(container => {
            container.innerHTML = this.buildStatusPills(stats);
        });
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
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    }

    handleSearch(value) {
        this.currentFilters.search = value.trim();
        this.refreshView();
        
        const clearBtn = document.getElementById('searchClearBtn');
        if (clearBtn) {
            clearBtn.style.display = this.currentFilters.search ? 'flex' : 'none';
        }
    }

    // STYLES MODERNES ÉPURÉS
    addModernStyles() {
        if (document.getElementById('modernTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modernTaskStyles';
        styles.textContent = `
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f8fafc;
                min-height: 100vh;
                padding: 0;
            }
            
            /* Barre d'outils principale */
            .tasks-main-toolbar {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 20px 0;
                margin-bottom: 20px;
                background: white;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .toolbar-left {
                display: flex;
                align-items: baseline;
                gap: 12px;
                flex-shrink: 0;
            }
            
            .tasks-title {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
            }
            
            .tasks-count {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
                background: #f3f4f6;
                padding: 4px 12px;
                border-radius: 12px;
            }
            
            .toolbar-center {
                flex: 1;
                max-width: 400px;
            }
            
            .search-wrapper {
                position: relative;
                width: 100%;
            }
            
            .search-input {
                width: 100%;
                padding: 12px 16px 12px 44px;
                border: 1px solid #d1d5db;
                border-radius: 10px;
                font-size: 14px;
                background: white;
                transition: border-color 0.2s ease;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-icon {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                font-size: 16px;
            }
            
            .search-clear {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            
            .search-clear:hover {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .toolbar-right {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
            }
            
            .selection-info {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 8px;
                font-size: 14px;
                color: #1e40af;
            }
            
            .selection-count {
                font-weight: 600;
            }
            
            /* Boutons */
            .btn-primary, .btn-secondary, .btn-danger {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                border: 1px solid;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
            }
            
            .btn-secondary {
                background: white;
                color: #374151;
                border-color: #d1d5db;
            }
            
            .btn-secondary:hover {
                background: #f9fafb;
                border-color: #9ca3af;
            }
            
            .btn-danger {
                background: #dc2626;
                color: white;
                border-color: #dc2626;
            }
            
            .btn-danger:hover {
                background: #b91c1c;
                border-color: #b91c1c;
            }
            
            .btn-sm {
                padding: 6px 12px;
                font-size: 12px;
            }
            
            /* Filtres de statut */
            .status-filters {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                margin-bottom: 20px;
                align-items: center;
            }
            
            .status-pill {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                background: white;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .status-pill:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                color: #1e40af;
            }
            
            .status-pill.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .pill-icon {
                font-size: 16px;
            }
            
            .pill-count {
                background: rgba(0,0,0,0.1);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 600;
                min-width: 20px;
                text-align: center;
            }
            
            .status-pill.active .pill-count {
                background: rgba(255,255,255,0.25);
            }
            
            .btn-filters {
                background: white;
                color: #6b7280;
                border-color: #d1d5db;
                margin-left: auto;
            }
            
            .btn-filters.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            /* Filtres avancés */
            .advanced-filters {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 20px;
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
                opacity: 0;
            }
            
            .advanced-filters.show {
                max-height: 200px;
                opacity: 1;
                padding: 20px;
            }
            
            .filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                align-items: end;
            }
            
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            
            .filter-group label {
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 600;
                font-size: 14px;
                color: #374151;
            }
            
            .filter-group select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                font-size: 14px;
                color: #374151;
                cursor: pointer;
            }
            
            .filter-group select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .filter-actions {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Liste des tâches */
            .tasks-list {
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                overflow: hidden;
            }
            
            .task-item {
                display: flex;
                align-items: flex-start;
                padding: 16px 20px;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: all 0.2s ease;
                gap: 16px;
            }
            
            .task-item:last-child {
                border-bottom: none;
            }
            
            .task-item:hover {
                background: #f9fafb;
            }
            
            .task-item.selected {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
            }
            
            .task-item.completed {
                opacity: 0.6;
            }
            
            .task-item.completed .task-title {
                text-decoration: line-through;
            }
            
            .task-checkbox {
                margin-top: 2px;
                cursor: pointer;
                width: 16px;
                height: 16px;
                flex-shrink: 0;
            }
            
            .task-indicators {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .priority-indicator {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 600;
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
            
            .task-content {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .task-main-line {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
            }
            
            .task-title {
                font-weight: 600;
                color: #1f2937;
                font-size: 16px;
                margin: 0;
                line-height: 1.4;
                flex: 1;
            }
            
            .task-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
                font-size: 12px;
            }
            
            .client-badge {
                background: #f3f4f6;
                color: #6b7280;
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .due-date {
                display: flex;
                align-items: center;
                gap: 2px;
                font-weight: 500;
                padding: 2px 6px;
                border-radius: 12px;
                white-space: nowrap;
            }
            
            .due-date-normal {
                color: #6b7280;
                background: #f9fafb;
            }
            
            .due-date-soon {
                color: #d97706;
                background: #fef3c7;
            }
            
            .due-date-today {
                color: #dc2626;
                background: #fef2f2;
            }
            
            .due-date-overdue {
                color: #dc2626;
                background: #fef2f2;
                animation: pulse 2s infinite;
            }
            
            .task-date {
                color: #9ca3af;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .task-sub-line {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                font-size: 14px;
                color: #6b7280;
            }
            
            .email-info {
                display: flex;
                align-items: center;
                gap: 6px;
                flex: 1;
            }
            
            .email-from {
                font-weight: 500;
            }
            
            .needs-reply {
                background: #fef3c7;
                color: #d97706;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .task-description {
                flex: 1;
                color: #6b7280;
                line-height: 1.4;
            }
            
            .task-tags {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-shrink: 0;
            }
            
            .task-tag {
                background: #3b82f6;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .task-tag:hover {
                background: #2563eb;
                transform: translateY(-1px);
            }
            
            .tags-more {
                background: #f3f4f6;
                color: #6b7280;
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 10px;
                font-weight: 500;
            }
            
            .task-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .action-btn {
                width: 28px;
                height: 28px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 12px;
            }
            
            .action-btn:hover {
                background: #f9fafb;
                border-color: #9ca3af;
            }
            
            .action-btn.complete:hover {
                background: #dcfce7;
                border-color: #16a34a;
                color: #16a34a;
            }
            
            .action-btn.view:hover {
                background: #dbeafe;
                border-color: #2563eb;
                color: #2563eb;
            }
            
            .action-btn.delete:hover {
                background: #fef2f2;
                border-color: #dc2626;
                color: #dc2626;
            }
            
            /* État vide */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .empty-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }
            
            .empty-state h3 {
                font-size: 20px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .empty-state p {
                font-size: 16px;
                margin-bottom: 24px;
                line-height: 1.5;
            }
            
            /* Modals */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.75);
                z-index: 99999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                backdrop-filter: blur(4px);
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            
            .modal-large {
                max-width: 800px;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
            }
            
            .modal-header h2, .modal-header h3 {
                margin: 0;
                font-size: 20px;
                color: #1f2937;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #6b7280;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .warning-icon {
                width: 64px;
                height: 64px;
                background: #fef2f2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                color: #dc2626;
                font-size: 28px;
            }
            
            .task-preview {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                margin: 16px 0;
                text-align: left;
            }
            
            .task-title-preview {
                font-weight: 600;
                color: #374151;
                margin-bottom: 4px;
            }
            
            .task-email-preview {
                font-size: 14px;
                color: #6b7280;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .warning-text {
                font-size: 14px;
                color: #dc2626;
                font-weight: 500;
                margin: 16px 0 0 0;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-actions {
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            /* Formulaires */
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 6px;
                font-weight: 600;
                color: #374151;
                font-size: 14px;
            }
            
            .form-input, .form-select, .form-textarea {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                background: white;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
            }
            
            .form-input:focus, .form-select:focus, .form-textarea:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            .form-textarea {
                resize: vertical;
                min-height: 80px;
            }
            
            /* Détails de tâche */
            .task-details {
                max-width: none;
            }
            
            .details-header {
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .task-title-large {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 12px 0;
                line-height: 1.3;
            }
            
            .task-badges {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .priority-badge, .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .details-section {
                margin-bottom: 24px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .details-section h3 {
                margin: 0;
                padding: 16px 20px;
                background: white;
                border-bottom: 1px solid #e5e7eb;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .email-info-grid, .info-grid {
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .info-item {
                display: flex;
                gap: 12px;
                font-size: 14px;
            }
            
            .info-item strong {
                min-width: 100px;
                color: #374151;
                flex-shrink: 0;
            }
            
            .description-content {
                padding: 16px 20px;
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
            }
            
            .tags-list {
                padding: 16px 20px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .task-tag-large {
                background: #3b82f6;
                color: white;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 500;
            }
            
            /* États de chargement */
            .loading-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px;
                color: #6b7280;
            }
            
            .loading-icon {
                font-size: 32px;
                margin-bottom: 16px;
                color: #3b82f6;
            }
            
            /* Animations */
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .tasks-main-toolbar {
                    flex-direction: column;
                    gap: 16px;
                    align-items: stretch;
                    padding: 16px 0;
                }
                
                .toolbar-left, .toolbar-center, .toolbar-right {
                    width: 100%;
                    justify-content: center;
                }
                
                .status-filters {
                    gap: 8px;
                    justify-content: center;
                }
                
                .status-pill .pill-text {
                    display: none;
                }
                
                .task-item {
                    padding: 12px 16px;
                    gap: 12px;
                }
                
                .task-main-line {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .task-meta {
                    justify-content: space-between;
                    width: 100%;
                }
                
                .task-sub-line {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .task-tags {
                    width: 100%;
                    justify-content: flex-start;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .filters-grid {
                    grid-template-columns: 1fr;
                }
                
                .modal-content {
                    margin: 10px;
                    max-width: calc(100% - 20px);
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
    console.log('[TaskManager] Initializing v9.0 - Interface moderne épurée...');
    
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
    
    console.log('✅ TaskManager v9.0 loaded - Interface moderne épurée');
}

// Initialisation
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
