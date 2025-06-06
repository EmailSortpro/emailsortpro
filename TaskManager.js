// TaskManager Pro v7.1 - Version Minimaliste & Fonctionnelle
// Interface simple inspirée de l'existant avec améliorations subtiles

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
            console.log('[TaskManager] Initializing v7.1...');
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
                console.log('[TaskManager] No saved tasks found, creating sample task');
                this.generateSampleTask();
            }
        } catch (error) {
            console.error('[TaskManager] Error loading tasks:', error);
            this.tasks = [];
        }
    }

    generateSampleTask() {
        const sampleTask = {
            id: 'sample_1',
            title: '[Contractualisation] Demande de documents J-7 - EmailSortPro - PARIS ET COMPAGNIE',
            description: 'Email de: Pole Incubation Paris&Co - Date: 06/06/2025 10:27:39 - Sujet: [Contractualisation] Demande de documents J...',
            priority: 'medium',
            status: 'todo',
            category: 'email',
            hasEmail: true,
            emailFrom: 'pole.incubation@parisandco.com',
            emailFromName: 'Pole Incubation Paris&Co',
            emailSubject: '[Contractualisation] Demande de documents J-7',
            emailDate: '2025-06-06T10:27:39Z',
            tags: ['contractualisation', 'documents'],
            client: 'PARIS ET COMPAGNIE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            needsReply: false
        };
        
        this.tasks = [sampleTask];
        this.saveTasks();
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
        const task = {
            id: taskData.id || this.generateId(),
            title: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'other',
            
            // Email info
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || null,
            emailFromName: taskData.emailFromName || null,
            emailSubject: taskData.emailSubject || null,
            emailContent: taskData.emailContent || '',
            hasEmail: !!(taskData.emailId || taskData.emailFrom || taskData.emailContent),
            emailReplied: false,
            emailDate: taskData.emailDate || taskData.createdAt,
            needsReply: taskData.needsReply || false,
            
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
        
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(task => task.category === filters.category);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                (task.emailFromName && task.emailFromName.toLowerCase().includes(search))
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
            case 'created':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return sorted;
    }

    getStats() {
        return {
            total: this.tasks.length,
            todo: this.tasks.filter(t => t.status === 'todo').length,
            inProgress: this.tasks.filter(t => t.status === 'in-progress').length,
            completed: this.tasks.filter(t => t.status === 'completed').length,
            overdue: this.tasks.filter(t => {
                if (!t.dueDate || t.status === 'completed') return false;
                return new Date(t.dueDate) < new Date();
            }).length,
            needsReply: this.tasks.filter(t => t.needsReply || (t.hasEmail && !t.emailReplied && t.status !== 'completed')).length
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

    emitTaskUpdate(action, task) {
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('taskUpdate', {
                detail: { action, task }
            }));
        }
    }
}

// =====================================
// TASKS VIEW CLASS - MINIMALISTE
// =====================================
class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all', 
            category: 'all',
            search: '',
            sortBy: 'created'
        };
        
        this.selectedTasks = new Set();
        this.showCompleted = true;
        
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
                <div style="text-align: center; padding: 40px;">
                    <div style="margin-bottom: 16px;">⏳</div>
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
            <div class="task-manager-minimal">
                <!-- Header simple -->
                <div class="header-minimal">
                    <h1>Gestionnaire de Tâches</h1>
                    <div class="header-stats">
                        <span>${stats.todo} tâche${stats.todo > 1 ? 's' : ''} en attente</span>
                    </div>
                    <button class="btn-new-task" onclick="window.tasksView.showCreateModal()">
                        + Nouvelle tâche
                    </button>
                </div>

                <!-- Stats en ligne -->
                <div class="stats-row">
                    <div class="stat-item ${this.currentFilters.status === 'todo' ? 'active' : ''}" 
                         onclick="window.tasksView.quickFilter('status', 'todo')">
                        <div class="stat-number">${stats.todo}</div>
                        <div class="stat-label">À FAIRE</div>
                    </div>
                    <div class="stat-item ${this.currentFilters.status === 'in-progress' ? 'active' : ''}" 
                         onclick="window.tasksView.quickFilter('status', 'in-progress')">
                        <div class="stat-number">${stats.inProgress}</div>
                        <div class="stat-label">EN COURS</div>
                    </div>
                    <div class="stat-item" onclick="window.tasksView.quickFilter('overdue', true)">
                        <div class="stat-number">${stats.overdue}</div>
                        <div class="stat-label">EN RETARD</div>
                    </div>
                    <div class="stat-item" onclick="window.tasksView.quickFilter('needsReply', true)">
                        <div class="stat-number">${stats.needsReply}</div>
                        <div class="stat-label">À RÉPONDRE</div>
                    </div>
                    <div class="stat-item ${this.currentFilters.status === 'completed' ? 'active' : ''}" 
                         onclick="window.tasksView.quickFilter('status', 'completed')">
                        <div class="stat-number">${stats.completed}</div>
                        <div class="stat-label">TERMINÉES</div>
                    </div>
                </div>

                <!-- Recherche et filtres -->
                <div class="filters-simple">
                    <div class="search-box">
                        <input type="text" id="searchInput" placeholder="Rechercher dans les tâches..." 
                               value="${this.currentFilters.search}"
                               onkeyup="window.tasksView.handleSearch(this.value)">
                    </div>
                    
                    <div class="filter-row">
                        <select id="priorityFilter" onchange="window.tasksView.setFilter('priority', this.value)">
                            <option value="all">🏷️ Toutes priorités</option>
                            <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                            <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>
                        
                        <select id="categoryFilter" onchange="window.tasksView.setFilter('category', this.value)">
                            <option value="all">📁 Toutes catégories</option>
                            <option value="email" ${this.currentFilters.category === 'email' ? 'selected' : ''}>📧 Email</option>
                            <option value="client" ${this.currentFilters.category === 'client' ? 'selected' : ''}>🤝 Client</option>
                            <option value="project" ${this.currentFilters.category === 'project' ? 'selected' : ''}>📁 Projet</option>
                            <option value="other" ${this.currentFilters.category === 'other' ? 'selected' : ''}>📋 Autre</option>
                        </select>
                        
                        <select id="sortFilter" onchange="window.tasksView.setSort(this.value)">
                            <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>🔄 Plus récent</option>
                            <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>🎯 Priorité</option>
                        </select>
                        
                        <label class="toggle-completed">
                            <input type="checkbox" ${this.showCompleted ? 'checked' : ''} 
                                   onchange="window.tasksView.toggleCompleted(this.checked)">
                            Afficher terminées
                        </label>
                        
                        ${this.hasActiveFilters() ? `
                            <button class="reset-btn" onclick="window.tasksView.resetFilters()">
                                ↺ Réinitialiser
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Liste des tâches -->
                <div class="tasks-container" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addMinimalStyles();
        console.log('[TasksView] Minimal interface rendered');
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return `
                <div class="empty-state">
                    <div style="font-size: 48px; margin-bottom: 16px;">📬</div>
                    <h3>Aucune tâche trouvée</h3>
                    <p>Aucune tâche ne correspond à vos critères.</p>
                    ${this.hasActiveFilters() ? `
                        <button class="btn-primary" onclick="window.tasksView.resetFilters()">
                            Réinitialiser les filtres
                        </button>
                    ` : `
                        <button class="btn-primary" onclick="window.tasksView.showCreateModal()">
                            Créer une tâche
                        </button>
                    `}
                </div>
            `;
        }

        return `
            <div class="tasks-list">
                ${filteredTasks.map(task => this.renderTaskItem(task)).join('')}
            </div>
        `;
    }

    renderTaskItem(task) {
        const isCompleted = task.status === 'completed';
        const isSelected = this.selectedTasks.has(task.id);
        const priorityIcon = this.getPriorityIcon(task.priority);
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.selectTask('${task.id}')">
                
                <!-- Checkbox de sélection -->
                <div class="task-checkbox" onclick="event.stopPropagation(); window.tasksView.toggleSelection('${task.id}')">
                    <input type="checkbox" ${isSelected ? 'checked' : ''}>
                </div>

                <!-- Indicateur de priorité -->
                <div class="priority-indicator ${task.priority}">${priorityIcon}</div>

                <!-- Contenu principal -->
                <div class="task-content">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    
                    ${task.hasEmail ? `
                        <div class="task-email-info">
                            📧 Email de: ${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')} 
                            ${task.emailDate ? `📅 Date: ${this.formatShortDate(task.emailDate)}` : ''}
                            ${task.emailSubject ? `📝 Sujet: ${this.escapeHtml(task.emailSubject)}` : ''}
                        </div>
                    ` : ''}
                    
                    ${task.description && task.description !== task.title ? `
                        <div class="task-description">${this.escapeHtml(task.description)}</div>
                    ` : ''}
                </div>

                <!-- Actions -->
                <div class="task-actions">
                    ${task.status !== 'completed' ? `
                        <button class="action-btn complete" 
                                onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                                title="Marquer comme terminé">
                            ✓
                        </button>
                    ` : ''}
                    
                    ${task.hasEmail && !task.emailReplied ? `
                        <button class="action-btn reply" 
                                onclick="event.stopPropagation(); window.tasksView.replyToEmail('${task.id}')"
                                title="Répondre à l'email">
                            ↩
                        </button>
                    ` : ''}
                    
                    <button class="action-btn edit" 
                            onclick="event.stopPropagation(); window.tasksView.editTask('${task.id}')"
                            title="Modifier">
                        ✏
                    </button>
                    
                    <button class="action-btn delete" 
                            onclick="event.stopPropagation(); window.tasksView.deleteTask('${task.id}')"
                            title="Supprimer">
                        🗑
                    </button>
                </div>
            </div>
        `;
    }

    // Méthodes d'interaction
    quickFilter(filterType, value) {
        if (this.currentFilters[filterType] === value) {
            this.currentFilters[filterType] = filterType === 'status' ? 'all' : false;
        } else {
            this.currentFilters[filterType] = value;
            
            // Reset autres filtres rapides
            if (filterType === 'status') {
                this.currentFilters.overdue = false;
                this.currentFilters.needsReply = false;
            } else if (filterType === 'overdue' || filterType === 'needsReply') {
                this.currentFilters.status = 'all';
            }
        }
        
        this.refreshView();
    }

    handleSearch(value) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.currentFilters.search = value;
            this.refreshView();
        }, 300);
    }

    setFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.refreshView();
    }

    setSort(sortBy) {
        this.currentFilters.sortBy = sortBy;
        this.refreshView();
    }

    toggleCompleted(show) {
        this.showCompleted = show;
        this.refreshView();
    }

    resetFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            search: '',
            sortBy: 'created'
        };
        this.refreshView();
    }

    hasActiveFilters() {
        return this.currentFilters.status !== 'all' ||
               this.currentFilters.priority !== 'all' ||
               this.currentFilters.category !== 'all' ||
               this.currentFilters.search !== '';
    }

    selectTask(taskId) {
        // Pour l'instant, juste sélectionner
        this.toggleSelection(taskId);
    }

    toggleSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        document.querySelectorAll('.task-item').forEach(item => {
            const taskId = item.dataset.taskId;
            const isSelected = this.selectedTasks.has(taskId);
            
            item.classList.toggle('selected', isSelected);
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = isSelected;
        });
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche marquée comme terminée', 'success');
    }

    replyToEmail(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        const subject = `Re: ${task.emailSubject || 'Votre message'}`;
        const to = task.emailFrom;
        const body = `Bonjour,\n\nMerci pour votre message.\n\nCordialement,`;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
        
        window.taskManager.updateTask(taskId, { emailReplied: true });
        this.showToast('Email de réponse ouvert', 'success');
    }

    editTask(taskId) {
        this.showToast('Fonctionnalité d\'édition à venir', 'info');
    }

    deleteTask(taskId) {
        if (confirm('Supprimer cette tâche ?')) {
            window.taskManager.deleteTask(taskId);
            this.selectedTasks.delete(taskId);
            this.showToast('Tâche supprimée', 'success');
        }
    }

    showCreateModal() {
        const modalHTML = `
            <div class="modal-overlay" onclick="window.tasksView.closeModal()">
                <div class="modal-simple" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Nouvelle tâche</h3>
                        <button onclick="window.tasksView.closeModal()">×</button>
                    </div>
                    
                    <form onsubmit="window.tasksView.createTask(event)">
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Titre *</label>
                                <input type="text" name="title" required placeholder="Titre de la tâche">
                            </div>
                            
                            <div class="form-group">
                                <label>Description</label>
                                <textarea name="description" rows="3" placeholder="Description..."></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Priorité</label>
                                    <select name="priority">
                                        <option value="low">📄 Basse</option>
                                        <option value="medium" selected>📌 Normale</option>
                                        <option value="high">⚡ Haute</option>
                                        <option value="urgent">🚨 Urgente</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>Catégorie</label>
                                    <select name="category">
                                        <option value="other">📋 Autre</option>
                                        <option value="email">📧 Email</option>
                                        <option value="client">🤝 Client</option>
                                        <option value="project">📁 Projet</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Client</label>
                                <input type="text" name="client" placeholder="Nom du client...">
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" onclick="window.tasksView.closeModal()">Annuler</button>
                            <button type="submit" class="btn-primary">Créer</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    createTask(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            category: formData.get('category'),
            client: formData.get('client')
        };
        
        window.taskManager.createTask(taskData);
        this.closeModal();
        this.showToast('Tâche créée avec succès', 'success');
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        // Mettre à jour les stats
        const stats = window.taskManager.getStats();
        const statsItems = document.querySelectorAll('.stat-item .stat-number');
        if (statsItems.length >= 5) {
            statsItems[0].textContent = stats.todo;
            statsItems[1].textContent = stats.inProgress;
            statsItems[2].textContent = stats.overdue;
            statsItems[3].textContent = stats.needsReply;
            statsItems[4].textContent = stats.completed;
        }
    }

    // Utilitaires
    getPriorityIcon(priority) {
        const icons = {
            urgent: '🚨',
            high: '⚡',
            medium: '📌',
            low: '📄'
        };
        return icons[priority] || '📌';
    }

    formatShortDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    addMinimalStyles() {
        if (document.getElementById('minimalStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'minimalStyles';
        styles.textContent = `
            /* Reset et variables */
            * { box-sizing: border-box; }
            
            .task-manager-minimal {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8fafc;
                min-height: 100vh;
            }

            /* Header simple */
            .header-minimal {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                padding: 16px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                color: white;
            }

            .header-minimal h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
            }

            .header-stats {
                font-size: 14px;
                opacity: 0.9;
            }

            .btn-new-task {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }

            .btn-new-task:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-1px);
            }

            /* Stats en ligne */
            .stats-row {
                display: flex;
                gap: 12px;
                margin-bottom: 24px;
                overflow-x: auto;
                padding: 4px;
            }

            .stat-item {
                background: white;
                border-radius: 8px;
                padding: 16px 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid transparent;
                min-width: 120px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .stat-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }

            .stat-item.active {
                border-color: #667eea;
                background: #f0f4ff;
            }

            .stat-number {
                font-size: 24px;
                font-weight: 800;
                color: #1a202c;
                margin-bottom: 4px;
            }

            .stat-label {
                font-size: 11px;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* Filtres simples */
            .filters-simple {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .search-box {
                margin-bottom: 16px;
            }

            .search-box input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.2s;
            }

            .search-box input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .filter-row {
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
            }

            .filter-row select {
                padding: 8px 12px;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                background: white;
                font-size: 14px;
                cursor: pointer;
            }

            .toggle-completed {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #64748b;
                cursor: pointer;
            }

            .reset-btn {
                background: #fee2e2;
                color: #dc2626;
                border: 1px solid #fecaca;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .reset-btn:hover {
                background: #fecaca;
            }

            /* Container des tâches */
            .tasks-container {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .tasks-list {
                display: flex;
                flex-direction: column;
            }

            /* Tâche individuelle */
            .task-item {
                display: flex;
                align-items: flex-start;
                padding: 16px 20px;
                border-bottom: 1px solid #f1f5f9;
                cursor: pointer;
                transition: all 0.2s;
                gap: 12px;
            }

            .task-item:hover {
                background: #f8fafc;
            }

            .task-item.selected {
                background: #f0f4ff;
                border-left: 4px solid #667eea;
            }

            .task-item.completed {
                opacity: 0.6;
            }

            .task-item.completed .task-title {
                text-decoration: line-through;
            }

            .task-checkbox {
                margin-top: 2px;
            }

            .task-checkbox input {
                cursor: pointer;
                transform: scale(1.2);
            }

            .priority-indicator {
                font-size: 16px;
                margin-top: 2px;
            }

            .task-content {
                flex: 1;
                min-width: 0;
            }

            .task-title {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1a202c;
                line-height: 1.4;
            }

            .task-email-info {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 6px;
                line-height: 1.4;
            }

            .task-description {
                font-size: 14px;
                color: #64748b;
                line-height: 1.4;
            }

            .task-actions {
                display: flex;
                gap: 6px;
                opacity: 0;
                transition: opacity 0.2s;
            }

            .task-item:hover .task-actions {
                opacity: 1;
            }

            .action-btn {
                width: 28px;
                height: 28px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .action-btn.complete {
                background: #dcfce7;
                color: #16a34a;
            }

            .action-btn.reply {
                background: #dbeafe;
                color: #2563eb;
            }

            .action-btn.edit {
                background: #fef3c7;
                color: #d97706;
            }

            .action-btn.delete {
                background: #fee2e2;
                color: #dc2626;
            }

            .action-btn:hover {
                transform: scale(1.1);
            }

            /* Empty state */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
            }

            .empty-state h3 {
                margin: 16px 0 8px 0;
                color: #374151;
            }

            .empty-state p {
                color: #6b7280;
                margin-bottom: 24px;
            }

            /* Modal simple */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }

            .modal-simple {
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            }

            .modal-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 700;
            }

            .modal-header button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
            }

            .modal-body {
                padding: 20px;
            }

            .modal-footer {
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

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

            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }

            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .btn-primary {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: background 0.2s;
            }

            .btn-primary:hover {
                background: #5a67d8;
            }

            .modal-footer button {
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            }

            .modal-footer button[type="button"] {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            /* Toast notifications */
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                z-index: 1100;
                max-width: 300px;
            }

            .toast.show {
                transform: translateX(0);
            }

            .toast.toast-success {
                border-color: #10b981;
                background: #ecfdf5;
                color: #065f46;
            }

            .toast.toast-error {
                border-color: #ef4444;
                background: #fef2f2;
                color: #991b1b;
            }

            .toast.toast-info {
                border-color: #3b82f6;
                background: #eff6ff;
                color: #1e40af;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .task-manager-minimal {
                    padding: 16px;
                }

                .header-minimal {
                    flex-direction: column;
                    gap: 12px;
                    text-align: center;
                }

                .stats-row {
                    flex-direction: column;
                    gap: 8px;
                }

                .stat-item {
                    min-width: auto;
                }

                .filter-row {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 8px;
                }

                .filter-row select {
                    width: 100%;
                }

                .task-item {
                    flex-direction: column;
                    gap: 8px;
                    align-items: stretch;
                }

                .task-actions {
                    opacity: 1;
                    justify-content: center;
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

// Créer les instances globales
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

console.log('✅ TaskManager v7.1 loaded - Version minimaliste et fonctionnelle');
