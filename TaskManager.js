// TaskManager Pro v12 - Version propre et alignée

class TaskManager {
    constructor() {
        this.tasks = [];
        this.initialized = false;
        this.selectedTasks = new Set();
        this.init();
    }

    async init() {
        try {
            await this.loadTasks();
            this.initialized = true;
            console.log('[TM] Init OK:', this.tasks.length, 'tasks');
        } catch (e) {
            console.error('[TM] Init error:', e);
            this.tasks = [];
            this.initialized = true;
        }
    }

    async loadTasks() {
        try {
            const saved = localStorage.getItem('emailsort_tasks');
            if (saved) {
                this.tasks = JSON.parse(saved).map(t => this.ensureTaskProps(t));
            } else {
                this.generateSampleTasks();
            }
        } catch (e) {
            console.error('[TM] Load error:', e);
            this.tasks = [];
        }
    }

    ensureTaskProps(t) {
        const now = new Date().toISOString();
        return {
            id: t.id || this.genId(),
            title: t.title || 'Tâche sans titre',
            description: t.description || '',
            priority: t.priority || 'medium',
            status: t.status || 'todo',
            dueDate: t.dueDate || null,
            category: t.category || 'other',
            client: t.client || 'Interne',
            tags: t.tags || [],
            
            // Checklist
            checklist: t.checklist || [],
            checklistProgress: t.checklistProgress || 0,
            
            // Email
            hasEmail: t.hasEmail || false,
            emailId: t.emailId || null,
            emailFrom: t.emailFrom || null,
            emailFromName: t.emailFromName || null,
            emailSubject: t.emailSubject || null,
            emailContent: t.emailContent || '',
            needsReply: t.needsReply || false,
            
            // Timestamps
            createdAt: t.createdAt || now,
            updatedAt: t.updatedAt || now,
            completedAt: t.completedAt || null,
            method: t.method || 'manual'
        };
    }

    generateSampleTasks() {
        this.tasks = [
            {
                id: 's1',
                title: 'Répondre à l\'équipe marketing sur la campagne Q2',
                description: 'Validation urgente de la campagne marketing Q2 avec budget de 50k€',
                priority: 'high',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'sarah.martin@acme-corp.com',
                emailFromName: 'Sarah Martin',
                emailSubject: 'Validation campagne marketing Q2',
                client: 'ACME Corp',
                dueDate: '2025-06-20',
                needsReply: true,
                checklist: [
                    { id: 'c1', text: 'Réviser les visuels', checked: false },
                    { id: 'c2', text: 'Analyser le budget', checked: false },
                    { id: 'c3', text: 'Coordonner avec commercial', checked: false }
                ],
                checklistProgress: 0
            },
            {
                id: 's2',
                title: 'Préparer présentation trimestrielle',
                description: 'Préparer la présentation des résultats Q1 pour le comité de direction',
                priority: 'medium',
                status: 'in-progress',
                category: 'work',
                client: 'Direction',
                dueDate: '2025-06-25',
                checklist: [
                    { id: 'c1', text: 'Données financières', checked: true },
                    { id: 'c2', text: 'Graphiques', checked: false }
                ],
                checklistProgress: 50
            },
            {
                id: 's3',
                title: 'Projet en attente de validation client',
                priority: 'high',
                status: 'waiting',
                category: 'work',
                client: 'TechCorp',
                description: 'En attente de retour client sur la proposition technique',
                dueDate: '2025-06-30'
            },
            {
                id: 's4',
                title: 'Relancer fournisseur pour devis',
                priority: 'urgent',
                status: 'follow-up',
                category: 'work',
                client: 'Interne',
                description: 'Relancer le fournisseur pour obtenir le devis matériel'
            },
            {
                id: 's5',
                title: 'Migration serveur bloquée',
                priority: 'urgent',
                status: 'blocked',
                category: 'work',
                client: 'IT',
                description: 'Migration bloquée en attente des accès administrateur',
                dueDate: '2025-06-18'
            }
        ].map(t => this.ensureTaskProps(t));
        
        this.saveTasks();
    }

    // CRUD
    createTask(data) {
        const task = this.ensureTaskProps({
            ...data,
            id: data.id || this.genId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emit('create', task);
        return task;
    }

    updateTask(id, updates) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1) return null;
        
        if (updates.checklist) {
            const checked = updates.checklist.filter(item => item.checked).length;
            updates.checklistProgress = updates.checklist.length > 0 
                ? Math.round((checked / updates.checklist.length) * 100) 
                : 0;
        }
        
        this.tasks[idx] = this.ensureTaskProps({
            ...this.tasks[idx],
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        if (updates.status === 'completed' && !this.tasks[idx].completedAt) {
            this.tasks[idx].completedAt = new Date().toISOString();
        }
        
        this.saveTasks();
        this.emit('update', this.tasks[idx]);
        return this.tasks[idx];
    }

    deleteTask(id) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1) return null;
        
        const deleted = this.tasks.splice(idx, 1)[0];
        this.saveTasks();
        this.emit('delete', deleted);
        return deleted;
    }

    getTask(id) {
        return this.tasks.find(t => t.id === id);
    }

    getAllTasks() {
        return [...this.tasks];
    }

    // Checklist
    addChecklistItem(taskId, text) {
        const task = this.getTask(taskId);
        if (!task) return null;
        
        const item = {
            id: 'chk_' + Date.now(),
            text: text,
            checked: false
        };
        
        const checklist = [...(task.checklist || []), item];
        return this.updateTask(taskId, { checklist });
    }

    toggleChecklistItem(taskId, itemId) {
        const task = this.getTask(taskId);
        if (!task || !task.checklist) return null;
        
        const checklist = task.checklist.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        
        return this.updateTask(taskId, { checklist });
    }

    // Filtrage
    filterTasks(filters = {}) {
        let filtered = [...this.tasks];
        
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(t => t.status === filters.status);
        }
        
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(t => t.priority === filters.priority);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(search) ||
                t.description.toLowerCase().includes(search) ||
                (t.client && t.client.toLowerCase().includes(search))
            );
        }
        
        if (filters.overdue) {
            filtered = filtered.filter(t => 
                t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < new Date()
            );
        }
        
        if (filters.needsReply) {
            filtered = filtered.filter(t => t.needsReply && t.status !== 'completed');
        }
        
        return this.sortTasks(filtered, filters.sortBy || 'created');
    }

    sortTasks(tasks, sortBy) {
        const sorted = [...tasks];
        
        switch (sortBy) {
            case 'priority':
                const order = { urgent: 0, high: 1, medium: 2, low: 3 };
                sorted.sort((a, b) => order[a.priority] - order[b.priority]);
                break;
            case 'dueDate':
                sorted.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'created':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return sorted;
    }

    // Stats
    getStats() {
        const byStatus = {
            todo: 0,
            'in-progress': 0,
            completed: 0,
            waiting: 0,
            'follow-up': 0,
            blocked: 0
        };
        
        this.tasks.forEach(t => {
            if (byStatus[t.status] !== undefined) byStatus[t.status]++;
        });

        return {
            total: this.tasks.length,
            byStatus,
            overdue: this.tasks.filter(t => 
                t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < new Date()
            ).length,
            needsReply: this.tasks.filter(t => 
                t.needsReply && t.status !== 'completed'
            ).length
        };
    }

    // Utils
    genId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveTasks() {
        try {
            localStorage.setItem('emailsort_tasks', JSON.stringify(this.tasks));
            return true;
        } catch (e) {
            console.error('[TM] Save error:', e);
            return false;
        }
    }

    emit(action, task) {
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('taskUpdate', {
                detail: { action, task }
            }));
        }
    }
}

// Vue des tâches - Design propre sur 2 lignes
class TasksView {
    constructor() {
        this.filters = {
            status: 'all',
            priority: 'all',
            search: '',
            sortBy: 'created'
        };
        
        this.selectedTasks = new Set();
        this.viewMode = 'normal';
        this.showAdvFilters = false;
        
        window.addEventListener('taskUpdate', () => this.refresh());
    }

    render(container) {
        if (!container) return;

        if (!window.taskManager?.initialized) {
            container.innerHTML = `
                <div class="loading-container">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Chargement...</p>
                </div>
            `;
            setTimeout(() => {
                if (window.taskManager?.initialized) this.render(container);
            }, 500);
            return;
        }

        const stats = window.taskManager.getStats();
        
        container.innerHTML = `
            <div class="task-manager-v12">
                <!-- Barre de contrôle principale -->
                <div class="control-bar">
                    <!-- Ligne 1: Recherche + Modes + Actions -->
                    <div class="control-row-1">
                        <!-- Recherche -->
                        <div class="search-container">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   id="searchInput"
                                   placeholder="Rechercher des tâches..." 
                                   value="${this.filters.search}">
                            ${this.filters.search ? `
                                <button class="clear-search" onclick="window.tasksView.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>

                        <!-- Modes de vue -->
                        <div class="view-modes">
                            ${['minimal', 'normal', 'detailed'].map(mode => `
                                <button class="view-btn ${this.viewMode === mode ? 'active' : ''}" 
                                        onclick="window.tasksView.setViewMode('${mode}')">
                                    ${mode === 'minimal' ? 'Minimal' : mode === 'normal' ? 'Normal' : 'Détaillé'}
                                </button>
                            `).join('')}
                        </div>

                        <!-- Actions -->
                        <div class="action-buttons">
                            ${this.selectedTasks.size > 0 ? `
                                <div class="selection-info">
                                    <span>${this.selectedTasks.size} sélectionné(s)</span>
                                    <button class="btn-icon" onclick="window.tasksView.clearSelection()" title="Effacer">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            ` : ''}
                            
                            <button class="btn-primary" onclick="window.tasksView.showCreateModal()">
                                <i class="fas fa-plus"></i>
                                Nouvelle tâche
                            </button>
                            
                            <button class="btn-icon" onclick="window.tasksView.refresh()" title="Actualiser">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            
                            <button class="btn-icon ${this.showAdvFilters ? 'active' : ''}" 
                                    onclick="window.tasksView.toggleFilters()" 
                                    title="Filtres">
                                <i class="fas fa-filter"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Ligne 2: Filtres de statut -->
                    <div class="control-row-2">
                        <div class="status-filters">
                            ${this.renderStatusFilters(stats)}
                        </div>
                    </div>
                </div>

                <!-- Filtres avancés -->
                ${this.showAdvFilters ? `
                    <div class="advanced-filters">
                        <select class="filter-select" onchange="window.tasksView.updateFilter('priority', this.value)">
                            <option value="all">Toutes priorités</option>
                            <option value="urgent" ${this.filters.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                            <option value="high" ${this.filters.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${this.filters.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${this.filters.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>
                        
                        <select class="filter-select" onchange="window.tasksView.updateFilter('sortBy', this.value)">
                            <option value="created" ${this.filters.sortBy === 'created' ? 'selected' : ''}>Date création</option>
                            <option value="priority" ${this.filters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                            <option value="dueDate" ${this.filters.sortBy === 'dueDate' ? 'selected' : ''}>Échéance</option>
                        </select>
                        
                        <button class="btn-reset" onclick="window.tasksView.resetFilters()">
                            <i class="fas fa-undo"></i> Réinitialiser
                        </button>
                    </div>
                ` : ''}

                <!-- Liste des tâches -->
                <div class="tasks-list">
                    ${this.renderTasks()}
                </div>
            </div>
        `;

        this.addStyles();
        this.attachEvents();
    }

    renderStatusFilters(stats) {
        const filters = [
            { id: 'all', label: 'Toutes', icon: '📋', count: stats.total },
            { id: 'todo', label: 'À faire', icon: '⏳', count: stats.byStatus.todo },
            { id: 'in-progress', label: 'En cours', icon: '🔄', count: stats.byStatus['in-progress'] },
            { id: 'waiting', label: 'En attente', icon: '⏸️', count: stats.byStatus.waiting },
            { id: 'follow-up', label: 'À relancer', icon: '🔔', count: stats.byStatus['follow-up'] },
            { id: 'blocked', label: 'Bloqué', icon: '🚫', count: stats.byStatus.blocked },
            { id: 'overdue', label: 'En retard', icon: '⚠️', count: stats.overdue, special: true },
            { id: 'needsReply', label: 'À répondre', icon: '📧', count: stats.needsReply, special: true },
            { id: 'completed', label: 'Terminé', icon: '✅', count: stats.byStatus.completed }
        ];

        return filters.map(f => `
            <button class="status-filter ${this.isFilterActive(f.id) ? 'active' : ''}" 
                    onclick="window.tasksView.filterByStatus('${f.id}')">
                <span class="filter-icon">${f.icon}</span>
                <span class="filter-label">${f.label}</span>
                <span class="filter-count">${f.count}</span>
            </button>
        `).join('');
    }

    renderTasks() {
        const tasks = window.taskManager.filterTasks(this.filters);
        
        if (tasks.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>Aucune tâche trouvée</h3>
                    <p>Créez une nouvelle tâche ou modifiez vos filtres</p>
                </div>
            `;
        }

        switch (this.viewMode) {
            case 'minimal':
                return this.renderMinimalView(tasks);
            case 'detailed':
                return this.renderDetailedView(tasks);
            default:
                return this.renderNormalView(tasks);
        }
    }

    renderNormalView(tasks) {
        return tasks.map(task => `
            <div class="task-item ${task.status === 'completed' ? 'completed' : ''} ${this.selectedTasks.has(task.id) ? 'selected' : ''}"
                 data-task-id="${task.id}">
                
                <input type="checkbox" 
                       class="task-select" 
                       ${this.selectedTasks.has(task.id) ? 'checked' : ''}
                       onchange="window.tasksView.toggleSelect('${task.id}')">
                
                <div class="task-priority-bar" style="background: ${this.getPriorityColor(task.priority)}"></div>
                
                <div class="task-content">
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="task-badges">
                            <span class="badge badge-${task.status}">
                                ${this.getStatusIcon(task.status)} ${this.getStatusLabel(task.status)}
                            </span>
                            ${task.checklist.length > 0 ? `
                                <span class="badge badge-checklist">
                                    <i class="fas fa-tasks"></i> ${task.checklist.filter(i => i.checked).length}/${task.checklist.length}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="task-meta">
                        <span class="meta-client">${this.escapeHtml(task.client)}</span>
                        ${task.dueDate ? `
                            <span class="meta-date ${this.getDueDateClass(task.dueDate)}">
                                <i class="far fa-calendar"></i> ${this.formatDate(task.dueDate)}
                            </span>
                        ` : ''}
                    </div>
                    
                    ${task.checklist.length > 0 ? `
                        <div class="task-checklist">
                            ${task.checklist.slice(0, 3).map(item => `
                                <label class="checklist-item ${item.checked ? 'checked' : ''}">
                                    <input type="checkbox" 
                                           ${item.checked ? 'checked' : ''}
                                           onchange="window.tasksView.toggleCheckItem('${task.id}', '${item.id}')">
                                    <span>${this.escapeHtml(item.text)}</span>
                                </label>
                            `).join('')}
                            ${task.checklist.length > 3 ? `
                                <span class="checklist-more">+${task.checklist.length - 3} autres...</span>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="task-actions">
                    ${task.status !== 'completed' ? `
                        <button class="btn-action" onclick="window.tasksView.completeTask('${task.id}')" title="Terminer">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-action" onclick="window.tasksView.showEditModal('${task.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action" onclick="window.tasksView.showDetails('${task.id}')" title="Détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action" onclick="window.tasksView.addCheckItem('${task.id}')" title="Ajouter checklist">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderMinimalView(tasks) {
        return tasks.map(task => `
            <div class="task-item-minimal ${task.status === 'completed' ? 'completed' : ''} ${this.selectedTasks.has(task.id) ? 'selected' : ''}">
                <input type="checkbox" 
                       class="task-select" 
                       ${this.selectedTasks.has(task.id) ? 'checked' : ''}
                       onchange="window.tasksView.toggleSelect('${task.id}')">
                
                <span class="priority-dot" style="background: ${this.getPriorityColor(task.priority)}"></span>
                
                <span class="task-title">${this.escapeHtml(task.title)}</span>
                
                <span class="task-client">${this.escapeHtml(task.client)}</span>
                
                ${task.dueDate ? `
                    <span class="task-date ${this.getDueDateClass(task.dueDate)}">
                        ${this.formatDate(task.dueDate)}
                    </span>
                ` : '<span></span>'}
                
                <div class="task-actions">
                    ${task.status !== 'completed' ? `
                        <button class="btn-action-sm" onclick="window.tasksView.completeTask('${task.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-action-sm" onclick="window.tasksView.showDetails('${task.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderDetailedView(tasks) {
        return `
            <div class="tasks-grid">
                ${tasks.map(task => `
                    <div class="task-card ${task.status === 'completed' ? 'completed' : ''} ${this.selectedTasks.has(task.id) ? 'selected' : ''}">
                        <div class="card-header">
                            <input type="checkbox" 
                                   ${this.selectedTasks.has(task.id) ? 'checked' : ''}
                                   onchange="window.tasksView.toggleSelect('${task.id}')">
                            <div class="card-badges">
                                <span class="badge-priority priority-${task.priority}">
                                    ${this.getPriorityIcon(task.priority)} ${this.getPriorityLabel(task.priority)}
                                </span>
                                <span class="badge-status status-${task.status}">
                                    ${this.getStatusIcon(task.status)} ${this.getStatusLabel(task.status)}
                                </span>
                            </div>
                        </div>
                        
                        <h3 class="card-title">${this.escapeHtml(task.title)}</h3>
                        
                        <p class="card-description">${this.escapeHtml(task.description || 'Pas de description')}</p>
                        
                        <div class="card-meta">
                            <div>${this.escapeHtml(task.client)}</div>
                            ${task.dueDate ? `
                                <div class="${this.getDueDateClass(task.dueDate)}">
                                    <i class="far fa-calendar"></i> ${this.formatDate(task.dueDate)}
                                </div>
                            ` : ''}
                        </div>
                        
                        ${task.checklist.length > 0 ? `
                            <div class="card-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${task.checklistProgress}%"></div>
                                </div>
                                <span class="progress-text">${task.checklistProgress}% complété</span>
                            </div>
                        ` : ''}
                        
                        <div class="card-actions">
                            ${task.status !== 'completed' ? `
                                <button class="btn-card" onclick="window.tasksView.completeTask('${task.id}')">
                                    <i class="fas fa-check"></i> Terminer
                                </button>
                            ` : ''}
                            <button class="btn-card" onclick="window.tasksView.showEditModal('${task.id}')">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Méthodes d'interaction
    setViewMode(mode) {
        this.viewMode = mode;
        this.refresh();
    }

    filterByStatus(status) {
        this.filters = {
            ...this.filters,
            status: 'all',
            overdue: false,
            needsReply: false
        };

        if (status === 'overdue') {
            this.filters.overdue = true;
        } else if (status === 'needsReply') {
            this.filters.needsReply = true;
        } else {
            this.filters.status = status;
        }

        this.refresh();
    }

    updateFilter(type, value) {
        this.filters[type] = value;
        this.refresh();
    }

    clearSearch() {
        this.filters.search = '';
        this.refresh();
    }

    toggleFilters() {
        this.showAdvFilters = !this.showAdvFilters;
        this.refresh();
    }

    resetFilters() {
        this.filters = {
            status: 'all',
            priority: 'all',
            search: '',
            sortBy: 'created'
        };
        this.refresh();
    }

    toggleSelect(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.refresh();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.refresh();
    }

    completeTask(taskId) {
        window.taskManager.updateTask(taskId, { 
            status: 'completed',
            completedAt: new Date().toISOString()
        });
        this.showToast('Tâche terminée', 'success');
    }

    toggleCheckItem(taskId, itemId) {
        window.taskManager.toggleChecklistItem(taskId, itemId);
        this.refresh();
    }

    addCheckItem(taskId) {
        const text = prompt('Nouvel élément:');
        if (text) {
            window.taskManager.addChecklistItem(taskId, text);
            this.refresh();
        }
    }

    showEditModal(taskId) {
        alert('Modal d\'édition pour la tâche ' + taskId);
    }

    showDetails(taskId) {
        alert('Détails de la tâche ' + taskId);
    }

    showCreateModal() {
        const title = prompt('Titre de la nouvelle tâche:');
        if (title) {
            window.taskManager.createTask({ title });
            this.showToast('Tâche créée', 'success');
        }
    }

    refresh() {
        const container = document.querySelector('.task-manager-v12')?.parentElement;
        if (container) this.render(container);
    }

    attachEvents() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.refresh();
                }, 300);
            });
        }
    }

    // Utilitaires
    isFilterActive(filterId) {
        if (filterId === 'all') return this.filters.status === 'all' && !this.filters.overdue && !this.filters.needsReply;
        if (filterId === 'overdue') return this.filters.overdue;
        if (filterId === 'needsReply') return this.filters.needsReply;
        return this.filters.status === filterId;
    }

    getPriorityColor(priority) {
        const colors = {
            urgent: '#ef4444',
            high: '#f97316', 
            medium: '#3b82f6',
            low: '#10b981'
        };
        return colors[priority] || '#6b7280';
    }

    getPriorityIcon(priority) {
        return { urgent: '🚨', high: '⚡', medium: '📌', low: '📄' }[priority] || '📌';
    }

    getPriorityLabel(priority) {
        return { urgent: 'Urgente', high: 'Haute', medium: 'Normale', low: 'Basse' }[priority] || 'Normale';
    }

    getStatusIcon(status) {
        const icons = {
            todo: '⏳',
            'in-progress': '🔄',
            completed: '✅',
            waiting: '⏸️',
            'follow-up': '🔔',
            blocked: '🚫'
        };
        return icons[status] || '⏳';
    }

    getStatusLabel(status) {
        const labels = {
            todo: 'À faire',
            'in-progress': 'En cours',
            completed: 'Terminé',
            waiting: 'En attente',
            'follow-up': 'À relancer',
            blocked: 'Bloqué'
        };
        return labels[status] || 'À faire';
    }

    getDueDateClass(date) {
        if (!date) return '';
        const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return 'overdue';
        if (days === 0) return 'today';
        if (days <= 3) return 'soon';
        return '';
    }

    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        
        if (days < -1) return `${Math.abs(days)}j de retard`;
        if (days === -1) return 'Hier';
        if (days === 0) return 'Aujourd\'hui';
        if (days === 1) return 'Demain';
        if (days <= 7) return `Dans ${days}j`;
        
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        console.log(`[${type}] ${message}`);
    }

    addStyles() {
        if (document.getElementById('taskManagerV12Styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'taskManagerV12Styles';
        styles.textContent = `
            .task-manager-v12 {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #1f2937;
                background: #f8fafc;
                min-height: 100vh;
                padding: 20px;
            }

            /* Barre de contrôle */
            .control-bar {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                margin-bottom: 20px;
            }

            /* Ligne 1 */
            .control-row-1 {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 16px;
            }

            .search-container {
                flex: 1;
                max-width: 400px;
                position: relative;
                display: flex;
                align-items: center;
            }

            .search-container i {
                position: absolute;
                left: 16px;
                color: #9ca3af;
                pointer-events: none;
            }

            .search-container input {
                width: 100%;
                height: 44px;
                padding: 0 44px 0 44px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-size: 14px;
                transition: all 0.2s;
            }

            .search-container input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .clear-search {
                position: absolute;
                right: 12px;
                background: #ef4444;
                color: white;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: all 0.2s;
            }

            .clear-search:hover {
                background: #dc2626;
                transform: scale(1.1);
            }

            .view-modes {
                display: flex;
                background: #f3f4f6;
                padding: 4px;
                border-radius: 8px;
                gap: 4px;
            }

            .view-btn {
                padding: 8px 16px;
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .view-btn:hover {
                background: white;
                color: #1f2937;
            }

            .view-btn.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .action-buttons {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .selection-info {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #dbeafe;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #1e40af;
            }

            .btn-primary {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-primary:hover {
                background: #2563eb;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }

            .btn-icon {
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-icon:hover {
                background: #f3f4f6;
                border-color: #d1d5db;
                color: #1f2937;
            }

            .btn-icon.active {
                background: #eff6ff;
                border-color: #3b82f6;
                color: #3b82f6;
            }

            /* Ligne 2 */
            .control-row-2 {
                display: flex;
                align-items: center;
            }

            .status-filters {
                display: flex;
                gap: 8px;
                flex: 1;
                overflow-x: auto;
                padding: 2px 0;
            }

            .status-filter {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #4b5563;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
                flex: 1;
                min-width: 130px;
                justify-content: center;
            }

            .status-filter:hover {
                background: #f9fafb;
                border-color: #3b82f6;
                transform: translateY(-1px);
            }

            .status-filter.active {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }

            .filter-icon {
                font-size: 16px;
            }

            .filter-count {
                background: rgba(0,0,0,0.1);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 700;
            }

            .status-filter.active .filter-count {
                background: rgba(255,255,255,0.3);
            }

            /* Filtres avancés */
            .advanced-filters {
                background: white;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .filter-select {
                flex: 1;
                height: 40px;
                padding: 0 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                color: #1f2937;
                background: white;
                cursor: pointer;
            }

            .btn-reset {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-reset:hover {
                background: #e5e7eb;
                color: #1f2937;
            }

            /* Liste des tâches */
            .tasks-list {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                overflow: hidden;
            }

            /* Vue normale */
            .task-item {
                display: flex;
                align-items: flex-start;
                padding: 16px 20px;
                border-bottom: 1px solid #f3f4f6;
                transition: all 0.2s;
                gap: 16px;
            }

            .task-item:hover {
                background: #f9fafb;
            }

            .task-item.selected {
                background: #eff6ff;
            }

            .task-item.completed {
                opacity: 0.7;
            }

            .task-select {
                width: 20px;
                height: 20px;
                margin-top: 2px;
                cursor: pointer;
            }

            .task-priority-bar {
                width: 4px;
                height: 60px;
                border-radius: 2px;
                flex-shrink: 0;
            }

            .task-content {
                flex: 1;
                min-width: 0;
            }

            .task-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
                gap: 12px;
            }

            .task-title {
                font-size: 15px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            }

            .task-item.completed .task-title {
                text-decoration: line-through;
                color: #9ca3af;
            }

            .task-badges {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .badge {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
            }

            .badge-todo { background: #fef3c7; color: #d97706; }
            .badge-in-progress { background: #dbeafe; color: #1e40af; }
            .badge-completed { background: #d1fae5; color: #059669; }
            .badge-waiting { background: #f3f4f6; color: #6b7280; }
            .badge-follow-up { background: #fed7aa; color: #ea580c; }
            .badge-blocked { background: #fee2e2; color: #dc2626; }
            .badge-checklist { background: #e0e7ff; color: #4f46e5; }

            .task-meta {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 13px;
                color: #6b7280;
                margin-bottom: 8px;
            }

            .meta-date.overdue { color: #ef4444; font-weight: 600; }
            .meta-date.today { color: #f59e0b; font-weight: 600; }
            .meta-date.soon { color: #3b82f6; }

            .task-checklist {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px dashed #e5e7eb;
            }

            .checklist-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #4b5563;
                cursor: pointer;
            }

            .checklist-item.checked {
                color: #10b981;
                text-decoration: line-through;
            }

            .checklist-item input {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }

            .checklist-more {
                font-size: 12px;
                color: #3b82f6;
                font-weight: 500;
            }

            .task-actions {
                display: flex;
                gap: 8px;
                align-items: flex-start;
                flex-shrink: 0;
            }

            .btn-action {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-action:hover {
                background: #f3f4f6;
                border-color: #d1d5db;
                color: #1f2937;
                transform: translateY(-1px);
            }

            /* Vue minimale */
            .task-item-minimal {
                display: flex;
                align-items: center;
                padding: 12px 20px;
                border-bottom: 1px solid #f3f4f6;
                gap: 12px;
                transition: all 0.2s;
            }

            .task-item-minimal:hover {
                background: #f9fafb;
            }

            .task-item-minimal.selected {
                background: #eff6ff;
            }

            .priority-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .task-item-minimal .task-title {
                flex: 2;
                font-size: 14px;
                font-weight: 500;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .task-item-minimal .task-client {
                flex: 1;
                font-size: 13px;
                color: #6b7280;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .task-item-minimal .task-date {
                font-size: 13px;
                color: #6b7280;
                min-width: 100px;
                text-align: right;
            }

            .btn-action-sm {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 6px;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-action-sm:hover {
                background: #f3f4f6;
                border-color: #e5e7eb;
                color: #1f2937;
            }

            /* Vue détaillée */
            .tasks-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 16px;
                padding: 20px;
            }

            .task-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                transition: all 0.2s;
            }

            .task-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            }

            .task-card.selected {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .card-badges {
                display: flex;
                gap: 6px;
            }

            .badge-priority,
            .badge-status {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
            }

            .priority-urgent { background: #fee2e2; color: #dc2626; }
            .priority-high { background: #fed7aa; color: #ea580c; }
            .priority-medium { background: #dbeafe; color: #1e40af; }
            .priority-low { background: #d1fae5; color: #059669; }

            .status-todo { background: #fef3c7; color: #d97706; }
            .status-in-progress { background: #dbeafe; color: #1e40af; }
            .status-completed { background: #d1fae5; color: #059669; }
            .status-waiting { background: #f3f4f6; color: #6b7280; }
            .status-follow-up { background: #fed7aa; color: #ea580c; }
            .status-blocked { background: #fee2e2; color: #dc2626; }

            .card-title {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
            }

            .card-description {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.5;
                margin: 0 0 16px 0;
            }

            .card-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 13px;
                color: #6b7280;
                margin-bottom: 16px;
            }

            .card-progress {
                margin-bottom: 16px;
            }

            .progress-bar {
                height: 8px;
                background: #f3f4f6;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 8px;
            }

            .progress-fill {
                height: 100%;
                background: #3b82f6;
                transition: width 0.3s;
            }

            .progress-text {
                font-size: 12px;
                color: #6b7280;
            }

            .card-actions {
                display: flex;
                gap: 8px;
            }

            .btn-card {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 8px 16px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #4b5563;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-card:hover {
                background: #e5e7eb;
                color: #1f2937;
            }

            /* État vide */
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 80px 20px;
                text-align: center;
            }

            .empty-state i {
                font-size: 48px;
                color: #e5e7eb;
                margin-bottom: 16px;
            }

            .empty-state h3 {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
            }

            .empty-state p {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
            }

            /* Loading */
            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                gap: 16px;
            }

            .loading-container i {
                font-size: 32px;
                color: #3b82f6;
            }

            .loading-container p {
                font-size: 14px;
                color: #6b7280;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .control-row-1 {
                    flex-wrap: wrap;
                }

                .search-container {
                    max-width: 100%;
                    flex: 1 1 100%;
                    order: -1;
                    margin-bottom: 12px;
                }

                .status-filters {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .status-filter {
                    min-width: 110px;
                }

                .tasks-grid {
                    grid-template-columns: 1fr;
                    padding: 12px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialisation
function initTaskManagerV12() {
    console.log('[TM] Init v12 - Clean design...');
    
    if (!window.taskManager || !window.taskManager.initialized) {
        window.taskManager = new TaskManager();
    }
    
    if (!window.tasksView) {
        window.tasksView = new TasksView();
    }
    
    console.log('✅ TaskManager v12 loaded');
}

// Init
initTaskManagerV12();

document.addEventListener('DOMContentLoaded', () => {
    initTaskManagerV12();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            initTaskManagerV12();
        }
    }, 1000);
});
