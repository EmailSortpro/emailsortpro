// TaskManager Pro v7.0 - Interface Optimisée User-Friendly
// Interface moderne, intuitive avec filtres intelligents et affichage optimisé

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
            console.log('[TaskManager] Initializing v7.0...');
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
                console.log('[TaskManager] No saved tasks found, generating sample data');
                this.generateSampleData();
            }
        } catch (error) {
            console.error('[TaskManager] Error loading tasks:', error);
            this.tasks = [];
        }
    }

    generateSampleData() {
        const sampleTasks = [
            {
                id: 'sample_1',
                title: 'Révision contrat client Premium',
                description: 'Revoir les termes du contrat annuel avec modifications demandées',
                priority: 'urgent',
                status: 'todo',
                dueDate: new Date(Date.now() + 86400000).toISOString(),
                category: 'client',
                hasEmail: true,
                emailFrom: 'marie.dupont@entreprise.com',
                emailFromName: 'Marie Dupont',
                emailSubject: 'Révision urgente contrat 2025',
                tags: ['contrat', 'urgent', 'client-premium'],
                client: 'Entreprise SAS',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                updatedAt: new Date().toISOString(),
                needsReply: true
            },
            {
                id: 'sample_2',
                title: 'Préparation présentation Q1',
                description: 'Créer la présentation des résultats du premier trimestre',
                priority: 'high',
                status: 'in-progress',
                dueDate: new Date(Date.now() + 172800000).toISOString(),
                category: 'project',
                hasEmail: false,
                tags: ['présentation', 'q1', 'résultats'],
                client: 'Interne',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'sample_3',
                title: 'Formation équipe développement',
                description: 'Organiser la session de formation sur les nouvelles technologies',
                priority: 'medium',
                status: 'completed',
                category: 'meeting',
                hasEmail: true,
                emailFrom: 'tech@formation.fr',
                emailFromName: 'Centre Formation Tech',
                emailSubject: 'Confirmation formation équipe',
                tags: ['formation', 'équipe', 'tech'],
                client: 'Interne',
                completedAt: new Date(Date.now() - 43200000).toISOString(),
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        this.tasks = sampleTasks;
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
        console.log('[TaskManager] Creating task with data:', taskData);
        
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
            emailDomain: this.extractDomain(taskData.emailFrom),
            emailContent: taskData.emailContent || '',
            emailFullHtml: taskData.emailFullHtml || null,
            hasEmail: !!(taskData.emailId || taskData.emailFrom || taskData.emailContent),
            emailReplied: false,
            emailDate: taskData.emailDate || taskData.createdAt,
            hasAttachments: taskData.hasAttachments || false,
            needsReply: taskData.needsReply || false,
            
            // Metadata
            tags: taskData.tags || [],
            client: taskData.client || this.extractClient(taskData),
            
            // Timestamps
            createdAt: taskData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // AI Analysis
            aiAnalysis: taskData.aiAnalysis || null,
            aiGenerated: taskData.aiGenerated || false,
            
            // Method
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

    filterTasks(filters = {}) {
        let filtered = [...this.tasks];
        
        // Filtres de base
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }
        
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(task => task.category === filters.category);
        }
        
        if (filters.hasEmail) {
            filtered = filtered.filter(task => task.hasEmail);
        }
        
        if (filters.needsReply) {
            filtered = filtered.filter(task => task.needsReply || (task.hasEmail && !task.emailReplied));
        }
        
        if (filters.overdue) {
            filtered = filtered.filter(task => {
                if (!task.dueDate || task.status === 'completed') return false;
                return new Date(task.dueDate) < new Date();
            });
        }
        
        if (filters.tag && filters.tag !== 'all') {
            filtered = filtered.filter(task => 
                task.tags && task.tags.includes(filters.tag)
            );
        }
        
        // Recherche
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                (task.emailFromName && task.emailFromName.toLowerCase().includes(search)) ||
                (task.emailSubject && task.emailSubject.toLowerCase().includes(search)) ||
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
            needsReply: this.tasks.filter(t => t.needsReply || (t.hasEmail && !t.emailReplied && t.status !== 'completed')).length,
            overdue: this.tasks.filter(t => {
                if (!t.dueDate || t.status === 'completed') return false;
                return new Date(t.dueDate) < new Date();
            }).length,
            urgent: this.tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
        };
        return stats;
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
        
        const domain = this.extractDomain(taskData.emailFrom);
        if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail')) {
            return domain.split('.')[0];
        }
        
        return 'Interne';
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
// TASKS VIEW CLASS - INTERFACE OPTIMISÉE
// =====================================
class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            search: '',
            sortBy: 'priority',
            overdue: false,
            needsReply: false,
            hasEmail: false
        };
        
        this.selectedTasks = new Set();
        this.currentTaskDetail = null;
        this.viewMode = 'cards'; // 'cards' ou 'list'
        this.showCompletedTasks = true;
        
        // Écouter les mises à jour
        window.addEventListener('taskUpdate', () => {
            this.refreshView();
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
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Chargement de vos tâches...</p>
                </div>
            `;
            
            setTimeout(() => {
                if (window.taskManager && window.taskManager.initialized) {
                    this.render(container);
                } else {
                    container.innerHTML = '<div class="error-message">Erreur de chargement du gestionnaire de tâches</div>';
                }
            }, 500);
            return;
        }

        // Générer le HTML de la page
        const pageHTML = `
            <div class="task-manager-app">
                ${this.renderHeader()}
                ${this.renderQuickStats()}
                ${this.renderSmartFilters()}
                ${this.renderViewControls()}
                ${this.renderBulkActions()}
                <div id="tasksContainer" class="tasks-container">
                    ${this.renderTasksDisplay()}
                </div>
            </div>
        `;

        container.innerHTML = pageHTML;
        this.attachEventListeners();
        this.addModernStyles();
        
        console.log('[TasksView] Modern interface rendered successfully');
    }

    renderHeader() {
        const stats = window.taskManager.getStats();
        
        return `
            <div class="app-header">
                <div class="header-content">
                    <div class="header-title">
                        <h1 class="main-title">
                            <i class="fas fa-tasks title-icon"></i>
                            Gestionnaire de Tâches
                        </h1>
                        <p class="subtitle">${stats.total} tâche${stats.total > 1 ? 's' : ''} • ${stats.todo} en attente</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-primary btn-new-task" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            <span>Nouvelle tâche</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuickStats() {
        const stats = window.taskManager.getStats();
        
        return `
            <div class="quick-stats">
                <div class="stat-card ${this.currentFilters.status === 'todo' ? 'active' : ''}" 
                     onclick="window.tasksView.quickFilter('status', 'todo')">
                    <div class="stat-icon todo-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.todo}</div>
                        <div class="stat-label">À faire</div>
                    </div>
                </div>

                <div class="stat-card ${this.currentFilters.status === 'in-progress' ? 'active' : ''}" 
                     onclick="window.tasksView.quickFilter('status', 'in-progress')">
                    <div class="stat-icon progress-icon">
                        <i class="fas fa-play-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.inProgress}</div>
                        <div class="stat-label">En cours</div>
                    </div>
                </div>

                <div class="stat-card ${this.currentFilters.overdue ? 'active' : ''}" 
                     onclick="window.tasksView.quickFilter('overdue', true)">
                    <div class="stat-icon urgent-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.overdue}</div>
                        <div class="stat-label">En retard</div>
                    </div>
                </div>

                <div class="stat-card ${this.currentFilters.needsReply ? 'active' : ''}" 
                     onclick="window.tasksView.quickFilter('needsReply', true)">
                    <div class="stat-icon reply-icon">
                        <i class="fas fa-reply"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.needsReply}</div>
                        <div class="stat-label">À répondre</div>
                    </div>
                </div>

                <div class="stat-card ${this.currentFilters.status === 'completed' ? 'active' : ''}" 
                     onclick="window.tasksView.quickFilter('status', 'completed')">
                    <div class="stat-icon completed-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.completed}</div>
                        <div class="stat-label">Terminées</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSmartFilters() {
        const hasActiveFilters = this.hasActiveFilters();
        
        return `
            <div class="smart-filters">
                <div class="search-section">
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               id="globalSearch" 
                               class="search-input" 
                               placeholder="Rechercher dans les tâches..."
                               value="${this.currentFilters.search}"
                               autocomplete="off">
                        <button class="search-clear ${this.currentFilters.search ? 'visible' : ''}" 
                                id="searchClear"
                                onclick="window.tasksView.clearSearch()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="filter-chips">
                    <div class="filter-group">
                        <div class="filter-chip-container">
                            <button class="filter-chip ${this.currentFilters.priority !== 'all' ? 'active' : ''}" 
                                    id="priorityFilter" 
                                    onclick="window.tasksView.toggleFilterMenu('priority')">
                                <i class="fas fa-flag"></i>
                                <span>${this.getFilterDisplayName('priority', this.currentFilters.priority)}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="filter-menu" id="priorityMenu">
                                <div class="filter-option ${this.currentFilters.priority === 'all' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'all')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>Toutes priorités</span>
                                </div>
                                <div class="filter-option ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'urgent')">
                                    <i class="fas fa-check check-mark"></i>
                                    <div class="priority-option urgent">
                                        <span class="priority-icon">🚨</span>
                                        <span>Urgent</span>
                                    </div>
                                </div>
                                <div class="filter-option ${this.currentFilters.priority === 'high' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'high')">
                                    <i class="fas fa-check check-mark"></i>
                                    <div class="priority-option high">
                                        <span class="priority-icon">⚡</span>
                                        <span>Haute</span>
                                    </div>
                                </div>
                                <div class="filter-option ${this.currentFilters.priority === 'medium' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'medium')">
                                    <i class="fas fa-check check-mark"></i>
                                    <div class="priority-option medium">
                                        <span class="priority-icon">📌</span>
                                        <span>Normale</span>
                                    </div>
                                </div>
                                <div class="filter-option ${this.currentFilters.priority === 'low' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'low')">
                                    <i class="fas fa-check check-mark"></i>
                                    <div class="priority-option low">
                                        <span class="priority-icon">📄</span>
                                        <span>Basse</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="filter-chip-container">
                            <button class="filter-chip ${this.currentFilters.category !== 'all' ? 'active' : ''}" 
                                    id="categoryFilter" 
                                    onclick="window.tasksView.toggleFilterMenu('category')">
                                <i class="fas fa-folder"></i>
                                <span>${this.getFilterDisplayName('category', this.currentFilters.category)}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="filter-menu" id="categoryMenu">
                                <div class="filter-option ${this.currentFilters.category === 'all' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('category', 'all')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>Toutes catégories</span>
                                </div>
                                <div class="filter-option ${this.currentFilters.category === 'client' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('category', 'client')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>🤝 Client</span>
                                </div>
                                <div class="filter-option ${this.currentFilters.category === 'project' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('category', 'project')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>📁 Projet</span>
                                </div>
                                <div class="filter-option ${this.currentFilters.category === 'meeting' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('category', 'meeting')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>🗓️ Réunion</span>
                                </div>
                                <div class="filter-option ${this.currentFilters.category === 'email' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setFilter('category', 'email')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>📧 Email</span>
                                </div>
                            </div>
                        </div>

                        <div class="filter-chip-container">
                            <button class="filter-chip" 
                                    id="sortFilter" 
                                    onclick="window.tasksView.toggleFilterMenu('sort')">
                                <i class="fas fa-sort"></i>
                                <span>${this.getFilterDisplayName('sortBy', this.currentFilters.sortBy)}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="filter-menu" id="sortMenu">
                                <div class="filter-option ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setSort('priority')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>🎯 Priorité</span>
                                </div>
                                <div class="filter-option ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setSort('dueDate')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>📅 Échéance</span>
                                </div>
                                <div class="filter-option ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setSort('created')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>🆕 Plus récent</span>
                                </div>
                                <div class="filter-option ${this.currentFilters.sortBy === 'alphabetical' ? 'selected' : ''}" 
                                     onclick="window.tasksView.setSort('alphabetical')">
                                    <i class="fas fa-check check-mark"></i>
                                    <span>🔤 Alphabétique</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="filter-actions">
                        <button class="reset-filters-btn ${hasActiveFilters ? 'visible' : ''}" 
                                onclick="window.tasksView.resetAllFilters()">
                            <i class="fas fa-undo"></i>
                            <span>Réinitialiser</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderViewControls() {
        return `
            <div class="view-controls">
                <div class="view-toggle">
                    <button class="view-btn ${this.viewMode === 'cards' ? 'active' : ''}" 
                            onclick="window.tasksView.setViewMode('cards')"
                            title="Vue cartes">
                        <i class="fas fa-th-large"></i>
                    </button>
                    <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" 
                            onclick="window.tasksView.setViewMode('list')"
                            title="Vue liste">
                        <i class="fas fa-list"></i>
                    </button>
                </div>

                <div class="view-options">
                    <label class="toggle-completed">
                        <input type="checkbox" 
                               ${this.showCompletedTasks ? 'checked' : ''} 
                               onchange="window.tasksView.toggleCompletedTasks(this.checked)">
                        <span class="toggle-slider"></span>
                        <span class="toggle-label">Afficher terminées</span>
                    </label>
                </div>
            </div>
        `;
    }

    renderBulkActions() {
        return `
            <div class="bulk-actions ${this.selectedTasks.size > 0 ? 'visible' : ''}" id="bulkActions">
                <div class="bulk-selection-info">
                    <span class="selection-count">${this.selectedTasks.size}</span>
                    <span class="selection-text">tâche${this.selectedTasks.size > 1 ? 's' : ''} sélectionnée${this.selectedTasks.size > 1 ? 's' : ''}</span>
                </div>
                <div class="bulk-action-buttons">
                    <button class="bulk-btn bulk-btn-secondary" onclick="window.tasksView.clearSelection()">
                        <i class="fas fa-times"></i>
                        Désélectionner
                    </button>
                    <button class="bulk-btn bulk-btn-primary" onclick="window.tasksView.bulkMarkComplete()">
                        <i class="fas fa-check"></i>
                        Marquer terminé
                    </button>
                    <button class="bulk-btn bulk-btn-danger" onclick="window.tasksView.bulkDelete()">
                        <i class="fas fa-trash"></i>
                        Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    renderTasksDisplay() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        
        // Filtrer les tâches terminées si nécessaire
        const filteredTasks = this.showCompletedTasks ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return this.renderEmptyState();
        }

        if (this.viewMode === 'cards') {
            return this.renderTaskCards(filteredTasks);
        } else {
            return this.renderTaskList(filteredTasks);
        }
    }

    renderEmptyState() {
        const hasFilters = this.hasActiveFilters() || !this.showCompletedTasks;
        
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-title">
                    ${hasFilters ? 'Aucune tâche trouvée' : 'Aucune tâche pour le moment'}
                </h3>
                <p class="empty-description">
                    ${hasFilters ? 
                        'Aucune tâche ne correspond à vos critères de recherche.' : 
                        'Commencez par créer votre première tâche.'}
                </p>
                <div class="empty-actions">
                    ${hasFilters ? 
                        '<button class="btn-secondary" onclick="window.tasksView.resetAllFilters()">Réinitialiser les filtres</button>' :
                        '<button class="btn-primary" onclick="window.tasksView.showCreateModal()">Créer une tâche</button>'
                    }
                </div>
            </div>
        `;
    }

    renderTaskCards(tasks) {
        return `
            <div class="tasks-grid">
                ${tasks.map(task => this.renderTaskCard(task)).join('')}
            </div>
        `;
    }

    renderTaskCard(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        const needsReply = task.needsReply || (task.hasEmail && !task.emailReplied && task.status !== 'completed');
        
        return `
            <div class="task-card ${task.status} ${isSelected ? 'selected' : ''} ${isOverdue ? 'overdue' : ''}"
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleCardClick(event, '${task.id}')">
                
                <div class="card-header">
                    <div class="card-checkbox" onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                        <div class="custom-checkbox ${isSelected ? 'checked' : ''}">
                            ${isSelected ? '<i class="fas fa-check"></i>' : ''}
                        </div>
                    </div>
                    
                    <div class="priority-indicator ${task.priority}"></div>
                    
                    <div class="card-actions">
                        ${task.status !== 'completed' ? `
                            <button class="card-action-btn" 
                                    onclick="event.stopPropagation(); window.tasksView.quickToggleStatus('${task.id}')"
                                    title="Marquer comme terminé">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        ${needsReply ? `
                            <button class="card-action-btn reply-btn" 
                                    onclick="event.stopPropagation(); window.tasksView.quickReply('${task.id}')"
                                    title="Répondre">
                                <i class="fas fa-reply"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="card-content">
                    <h3 class="card-title">${this.escapeHtml(task.title)}</h3>
                    
                    ${task.description ? `
                        <p class="card-description">${this.escapeHtml(task.description.substring(0, 120))}${task.description.length > 120 ? '...' : ''}</p>
                    ` : ''}
                    
                    <div class="card-badges">
                        <span class="status-badge ${task.status}">
                            ${this.getStatusIcon(task.status)} ${this.getStatusLabel(task.status)}
                        </span>
                        ${task.hasEmail ? '<span class="feature-badge email"><i class="fas fa-envelope"></i></span>' : ''}
                        ${needsReply ? '<span class="feature-badge reply"><i class="fas fa-reply"></i></span>' : ''}
                        ${task.aiGenerated ? '<span class="feature-badge ai"><i class="fas fa-robot"></i></span>' : ''}
                    </div>
                    
                    ${task.tags && task.tags.length > 0 ? `
                        <div class="card-tags">
                            ${task.tags.slice(0, 3).map(tag => `
                                <span class="tag-chip">${this.escapeHtml(tag)}</span>
                            `).join('')}
                            ${task.tags.length > 3 ? `<span class="tag-more">+${task.tags.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>

                <div class="card-footer">
                    ${task.client && task.client !== 'Interne' ? `
                        <div class="card-client">
                            <i class="fas fa-building"></i>
                            <span>${this.escapeHtml(task.client)}</span>
                        </div>
                    ` : ''}
                    
                    ${task.dueDate ? `
                        <div class="card-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatRelativeDate(task.dueDate)}</span>
                        </div>
                    ` : ''}
                    
                    <div class="card-meta">
                        <span class="card-created">${this.formatRelativeDate(task.createdAt)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderTaskList(tasks) {
        return `
            <div class="tasks-list">
                <div class="list-header">
                    <div class="list-header-cell select-all">
                        <div class="custom-checkbox ${this.isAllSelected(tasks) ? 'checked' : ''}"
                             onclick="window.tasksView.toggleSelectAll()">
                            ${this.isAllSelected(tasks) ? '<i class="fas fa-check"></i>' : ''}
                        </div>
                    </div>
                    <div class="list-header-cell title">Tâche</div>
                    <div class="list-header-cell priority">Priorité</div>
                    <div class="list-header-cell status">Statut</div>
                    <div class="list-header-cell client">Client</div>
                    <div class="list-header-cell due-date">Échéance</div>
                    <div class="list-header-cell actions">Actions</div>
                </div>
                
                <div class="list-body">
                    ${tasks.map(task => this.renderTaskListItem(task)).join('')}
                </div>
            </div>
        `;
    }

    renderTaskListItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        const needsReply = task.needsReply || (task.hasEmail && !task.emailReplied && task.status !== 'completed');
        
        return `
            <div class="list-row ${task.status} ${isSelected ? 'selected' : ''} ${isOverdue ? 'overdue' : ''}"
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleRowClick(event, '${task.id}')">
                
                <div class="list-cell select">
                    <div class="custom-checkbox ${isSelected ? 'checked' : ''}"
                         onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                        ${isSelected ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                </div>

                <div class="list-cell title">
                    <div class="task-title-container">
                        <div class="task-title">${this.escapeHtml(task.title)}</div>
                        <div class="task-indicators">
                            ${task.hasEmail ? '<i class="fas fa-envelope indicator-email" title="Email associé"></i>' : ''}
                            ${needsReply ? '<i class="fas fa-reply indicator-reply" title="Réponse requise"></i>' : ''}
                            ${task.aiGenerated ? '<i class="fas fa-robot indicator-ai" title="Généré par IA"></i>' : ''}
                        </div>
                    </div>
                </div>

                <div class="list-cell priority">
                    <span class="priority-badge ${task.priority}">
                        ${this.getPriorityIcon(task.priority)} ${this.getPriorityLabel(task.priority)}
                    </span>
                </div>

                <div class="list-cell status">
                    <span class="status-badge ${task.status}">
                        ${this.getStatusIcon(task.status)} ${this.getStatusLabel(task.status)}
                    </span>
                </div>

                <div class="list-cell client">
                    <span class="client-name">${this.escapeHtml(task.client || 'Interne')}</span>
                </div>

                <div class="list-cell due-date">
                    ${task.dueDate ? `
                        <span class="due-date ${isOverdue ? 'overdue' : ''}">
                            ${this.formatRelativeDate(task.dueDate)}
                        </span>
                    ` : '<span class="no-due-date">-</span>'}
                </div>

                <div class="list-cell actions">
                    <div class="action-buttons">
                        ${task.status !== 'completed' ? `
                            <button class="action-btn complete-btn" 
                                    onclick="event.stopPropagation(); window.tasksView.quickToggleStatus('${task.id}')"
                                    title="Marquer comme terminé">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        ${needsReply ? `
                            <button class="action-btn reply-btn" 
                                    onclick="event.stopPropagation(); window.tasksView.quickReply('${task.id}')"
                                    title="Répondre">
                                <i class="fas fa-reply"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn delete-btn" 
                                onclick="event.stopPropagation(); window.tasksView.deleteTask('${task.id}')"
                                title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Méthodes d'interaction
    handleCardClick(event, taskId) {
        if (event.target.closest('.card-checkbox') || event.target.closest('.card-action-btn')) {
            return;
        }
        this.showTaskModal(taskId);
    }

    handleRowClick(event, taskId) {
        if (event.target.closest('.custom-checkbox') || event.target.closest('.action-btn')) {
            return;
        }
        this.showTaskModal(taskId);
    }

    quickFilter(filterType, value) {
        // Reset other quick filters
        if (filterType === 'status') {
            this.currentFilters.overdue = false;
            this.currentFilters.needsReply = false;
        } else if (filterType === 'overdue' || filterType === 'needsReply') {
            this.currentFilters.status = 'all';
        }
        
        // Toggle or set filter
        if (this.currentFilters[filterType] === value) {
            this.currentFilters[filterType] = filterType === 'status' ? 'all' : false;
        } else {
            this.currentFilters[filterType] = value;
        }
        
        this.refreshView();
    }

    toggleFilterMenu(filterType) {
        const menu = document.getElementById(filterType + 'Menu');
        const allMenus = document.querySelectorAll('.filter-menu');
        
        // Fermer tous les autres menus
        allMenus.forEach(m => {
            if (m !== menu) m.classList.remove('open');
        });
        
        // Toggle le menu actuel
        if (menu) {
            menu.classList.toggle('open');
        }
    }

    setFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.closeAllFilterMenus();
        this.refreshView();
    }

    setSort(sortBy) {
        this.currentFilters.sortBy = sortBy;
        this.closeAllFilterMenus();
        this.refreshView();
    }

    closeAllFilterMenus() {
        document.querySelectorAll('.filter-menu').forEach(menu => {
            menu.classList.remove('open');
        });
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    resetAllFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            search: '',
            sortBy: 'priority',
            overdue: false,
            needsReply: false,
            hasEmail: false
        };
        
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.value = '';
        
        this.refreshView();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        this.refreshView();
    }

    toggleCompletedTasks(show) {
        this.showCompletedTasks = show;
        this.refreshView();
    }

    // Gestion de la sélection
    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.updateSelectionUI();
    }

    toggleSelectAll() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const visibleTasks = this.showCompletedTasks ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (this.isAllSelected(visibleTasks)) {
            this.selectedTasks.clear();
        } else {
            visibleTasks.forEach(task => this.selectedTasks.add(task.id));
        }
        
        this.updateSelectionUI();
    }

    isAllSelected(tasks) {
        return tasks.length > 0 && tasks.every(task => this.selectedTasks.has(task.id));
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        // Mettre à jour les checkboxes
        document.querySelectorAll('[data-task-id]').forEach(element => {
            const taskId = element.dataset.taskId;
            const isSelected = this.selectedTasks.has(taskId);
            
            element.classList.toggle('selected', isSelected);
            
            const checkbox = element.querySelector('.custom-checkbox');
            if (checkbox) {
                checkbox.classList.toggle('checked', isSelected);
                checkbox.innerHTML = isSelected ? '<i class="fas fa-check"></i>' : '';
            }
        });
        
        // Mettre à jour les actions groupées
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) {
            bulkActions.classList.toggle('visible', this.selectedTasks.size > 0);
            
            const countElement = bulkActions.querySelector('.selection-count');
            if (countElement) {
                countElement.textContent = this.selectedTasks.size;
            }
            
            const textElement = bulkActions.querySelector('.selection-text');
            if (textElement) {
                textElement.textContent = `tâche${this.selectedTasks.size > 1 ? 's' : ''} sélectionnée${this.selectedTasks.size > 1 ? 's' : ''}`;
            }
        }
    }

    // Actions groupées
    bulkMarkComplete() {
        if (this.selectedTasks.size === 0) return;
        
        const selectedIds = Array.from(this.selectedTasks);
        selectedIds.forEach(id => {
            window.taskManager.updateTask(id, { status: 'completed' });
        });
        
        this.clearSelection();
        this.showToast(`${selectedIds.length} tâche${selectedIds.length > 1 ? 's' : ''} marquée${selectedIds.length > 1 ? 's' : ''} comme terminée${selectedIds.length > 1 ? 's' : ''}`, 'success');
    }

    bulkDelete() {
        if (this.selectedTasks.size === 0) return;
        
        const count = this.selectedTasks.size;
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${count} tâche${count > 1 ? 's' : ''} ?`)) {
            window.taskManager.deleteTasks(Array.from(this.selectedTasks));
            this.clearSelection();
            this.showToast(`${count} tâche${count > 1 ? 's' : ''} supprimée${count > 1 ? 's' : ''}`, 'success');
        }
    }

    // Actions rapides
    quickToggleStatus(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
        window.taskManager.updateTask(taskId, { status: newStatus });
        
        const statusText = newStatus === 'completed' ? 'terminée' : 'réactivée';
        this.showToast(`Tâche ${statusText}`, 'success');
    }

    deleteTask(taskId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            window.taskManager.deleteTask(taskId);
            this.selectedTasks.delete(taskId);
            this.updateSelectionUI();
            this.showToast('Tâche supprimée', 'success');
        }
    }

    quickReply(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        // Ouvrir le client email avec les données pré-remplies
        const subject = `Re: ${task.emailSubject || 'Votre message'}`;
        const to = task.emailFrom;
        const body = `Bonjour,\n\nMerci pour votre message concernant "${task.title}".\n\n\n\nCordialement,`;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
        
        // Marquer comme répondu
        window.taskManager.updateTask(taskId, { emailReplied: true });
        this.showToast('Email de réponse ouvert', 'success');
    }

    showTaskModal(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
        this.currentTaskDetail = task;
        
        // Créer le modal avec un ID unique
        const modalId = 'taskModal_' + Date.now();
        
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay" onclick="window.tasksView.closeModal('${modalId}')">
                <div class="task-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">${this.escapeHtml(task.title)}</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${modalId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="task-detail-content">
                            ${this.renderTaskDetail(task)}
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.tasksView.closeModal('${modalId}')">
                            Fermer
                        </button>
                        <button class="btn-primary" onclick="window.tasksView.editTask('${task.id}')">
                            <i class="fas fa-edit"></i>
                            Modifier
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    renderTaskDetail(task) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        const needsReply = task.needsReply || (task.hasEmail && !task.emailReplied && task.status !== 'completed');
        
        return `
            <div class="task-detail">
                <div class="task-detail-header">
                    <div class="task-status-info">
                        <span class="status-badge ${task.status}">
                            ${this.getStatusIcon(task.status)} ${this.getStatusLabel(task.status)}
                        </span>
                        <span class="priority-badge ${task.priority}">
                            ${this.getPriorityIcon(task.priority)} ${this.getPriorityLabel(task.priority)}
                        </span>
                        ${task.hasEmail ? '<span class="feature-badge email"><i class="fas fa-envelope"></i> Email</span>' : ''}
                        ${needsReply ? '<span class="feature-badge reply"><i class="fas fa-reply"></i> À répondre</span>' : ''}
                    </div>
                </div>
                
                ${task.description ? `
                    <div class="detail-section">
                        <h4>Description</h4>
                        <p class="task-description">${this.escapeHtml(task.description)}</p>
                    </div>
                ` : ''}
                
                <div class="detail-section">
                    <h4>Informations</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Client</label>
                            <span>${this.escapeHtml(task.client || 'Interne')}</span>
                        </div>
                        <div class="info-item">
                            <label>Catégorie</label>
                            <span>${this.getCategoryLabel(task.category)}</span>
                        </div>
                        ${task.dueDate ? `
                            <div class="info-item">
                                <label>Échéance</label>
                                <span class="${isOverdue ? 'overdue' : ''}">${this.formatDate(task.dueDate)}</span>
                            </div>
                        ` : ''}
                        <div class="info-item">
                            <label>Créé le</label>
                            <span>${this.formatDate(task.createdAt)}</span>
                        </div>
                    </div>
                </div>
                
                ${task.tags && task.tags.length > 0 ? `
                    <div class="detail-section">
                        <h4>Tags</h4>
                        <div class="tags-display">
                            ${task.tags.map(tag => `<span class="tag-chip">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${task.hasEmail ? this.renderEmailInfo(task) : ''}
            </div>
        `;
    }

    renderEmailInfo(task) {
        return `
            <div class="detail-section email-info">
                <h4><i class="fas fa-envelope"></i> Email associé</h4>
                <div class="email-details">
                    ${task.emailFromName ? `
                        <div class="email-field">
                            <label>Expéditeur</label>
                            <span>${this.escapeHtml(task.emailFromName)} &lt;${this.escapeHtml(task.emailFrom || '')}&gt;</span>
                        </div>
                    ` : ''}
                    ${task.emailSubject ? `
                        <div class="email-field">
                            <label>Objet</label>
                            <span>${this.escapeHtml(task.emailSubject)}</span>
                        </div>
                    ` : ''}
                    ${task.emailDate ? `
                        <div class="email-field">
                            <label>Date</label>
                            <span>${this.formatDate(task.emailDate)}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${(task.needsReply || (task.hasEmail && !task.emailReplied)) ? `
                    <div class="email-actions">
                        <button class="btn-primary" onclick="window.tasksView.quickReply('${task.id}')">
                            <i class="fas fa-reply"></i>
                            Répondre maintenant
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showCreateModal() {
        const modalId = 'createModal_' + Date.now();
        
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay" onclick="window.tasksView.closeModal('${modalId}')">
                <div class="create-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">Nouvelle tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${modalId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="createTaskForm" onsubmit="window.tasksView.createTask(event, '${modalId}')">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Titre <span class="required">*</span></label>
                                <input type="text" name="title" class="form-input" required 
                                       placeholder="Titre de la tâche...">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea name="description" class="form-textarea" rows="4" 
                                          placeholder="Description détaillée..."></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Priorité</label>
                                    <select name="priority" class="form-select">
                                        <option value="low">📄 Basse</option>
                                        <option value="medium" selected>📌 Normale</option>
                                        <option value="high">⚡ Haute</option>
                                        <option value="urgent">🚨 Urgente</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Catégorie</label>
                                    <select name="category" class="form-select">
                                        <option value="other">Autre</option>
                                        <option value="client">🤝 Client</option>
                                        <option value="project">📁 Projet</option>
                                        <option value="meeting">🗓️ Réunion</option>
                                        <option value="email">📧 Email</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Date d'échéance</label>
                                    <input type="date" name="dueDate" class="form-input">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Client</label>
                                    <input type="text" name="client" class="form-input" 
                                           placeholder="Nom du client...">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Tags (séparés par des virgules)</label>
                                <input type="text" name="tags" class="form-input" 
                                       placeholder="tag1, tag2, tag3...">
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="window.tasksView.closeModal('${modalId}')">
                                Annuler
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i>
                                Créer la tâche
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Focus sur le premier champ
        setTimeout(() => {
            const titleInput = document.querySelector('#createTaskForm input[name="title"]');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    createTask(event, modalId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            category: formData.get('category'),
            dueDate: formData.get('dueDate') || null,
            client: formData.get('client'),
            tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : []
        };
        
        window.taskManager.createTask(taskData);
        this.closeModal(modalId);
        this.showToast('Tâche créée avec succès', 'success');
    }

    editTask(taskId) {
        // Pour l'instant, on ferme le modal et on peut implémenter l'édition plus tard
        this.closeModal();
        this.showToast('Fonctionnalité d\'édition en cours de développement', 'info');
    }

    closeModal(modalId) {
        const modal = modalId ? document.getElementById(modalId) : document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }

    // Méthodes utilitaires
    hasActiveFilters() {
        return this.currentFilters.status !== 'all' ||
               this.currentFilters.priority !== 'all' ||
               this.currentFilters.category !== 'all' ||
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply ||
               this.currentFilters.hasEmail;
    }

    getFilterDisplayName(filterType, value) {
        const displayNames = {
            priority: {
                all: 'Toutes priorités',
                urgent: '🚨 Urgent',
                high: '⚡ Haute',
                medium: '📌 Normale',
                low: '📄 Basse'
            },
            category: {
                all: 'Toutes catégories',
                client: '🤝 Client',
                project: '📁 Projet',
                meeting: '🗓️ Réunion',
                email: '📧 Email',
                other: 'Autre'
            },
            sortBy: {
                priority: '🎯 Priorité',
                dueDate: '📅 Échéance',
                created: '🆕 Plus récent',
                updated: '🔄 Modifié',
                alphabetical: '🔤 Alphabétique'
            }
        };
        
        return displayNames[filterType]?.[value] || value;
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
            urgent: 'Urgent',
            high: 'Haute',
            medium: 'Normale',
            low: 'Basse'
        };
        return labels[priority] || 'Normale';
    }

    getStatusIcon(status) {
        const icons = {
            todo: '⏳',
            'in-progress': '⚡',
            completed: '✅'
        };
        return icons[status] || '⏳';
    }

    getStatusLabel(status) {
        const labels = {
            todo: 'À faire',
            'in-progress': 'En cours',
            completed: 'Terminée'
        };
        return labels[status] || 'À faire';
    }

    getCategoryLabel(category) {
        const labels = {
            client: '🤝 Client',
            project: '📁 Projet',
            meeting: '🗓️ Réunion',
            email: '📧 Email',
            other: 'Autre'
        };
        return labels[category] || 'Autre';
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatRelativeDate(dateStr) {
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Aujourd\'hui';
        if (diffDays === 1) return 'Demain';
        if (diffDays === -1) return 'Hier';
        if (diffDays > 0) return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        if (diffDays < 0) return `Il y a ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
        
        return this.formatDate(dateStr);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        // Créer le toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Ajouter au DOM
        document.body.appendChild(toast);
        
        // Animation d'apparition
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Suppression automatique
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksDisplay();
        }
        
        // Mettre à jour les stats
        const quickStats = document.querySelector('.quick-stats');
        if (quickStats) {
            quickStats.outerHTML = this.renderQuickStats();
        }
        
        // Mettre à jour les filtres
        const smartFilters = document.querySelector('.smart-filters');
        if (smartFilters) {
            smartFilters.outerHTML = this.renderSmartFilters();
        }
        
        // Mettre à jour les actions groupées
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) {
            bulkActions.outerHTML = this.renderBulkActions();
        }
        
        this.updateSelectionUI();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Recherche globale
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    const searchClear = document.getElementById('searchClear');
                    if (searchClear) {
                        searchClear.classList.toggle('visible', e.target.value.length > 0);
                    }
                    this.refreshView();
                }, 300);
            });
        }
        
        // Fermer les menus en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-chip-container')) {
                this.closeAllFilterMenus();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.showCreateModal();
                        break;
                    case 'f':
                        e.preventDefault();
                        const searchInput = document.getElementById('globalSearch');
                        if (searchInput) searchInput.focus();
                        break;
                }
            }
        });
    }

    addModernStyles() {
        if (document.getElementById('modernTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modernTaskStyles';
        styles.textContent = `
            /* Variables CSS modernes */
            :root {
                --primary-500: #6366f1;
                --primary-600: #5048e5;
                --primary-50: #eef2ff;
                --success-500: #10b981;
                --success-50: #ecfdf5;
                --warning-500: #f59e0b;
                --warning-50: #fffbeb;
                --danger-500: #ef4444;
                --danger-50: #fef2f2;
                --gray-900: #111827;
                --gray-800: #1f2937;
                --gray-700: #374151;
                --gray-600: #4b5563;
                --gray-500: #6b7280;
                --gray-400: #9ca3af;
                --gray-300: #d1d5db;
                --gray-200: #e5e7eb;
                --gray-100: #f3f4f6;
                --gray-50: #f9fafb;
                --white: #ffffff;
                
                --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                
                --radius-sm: 0.375rem;
                --radius-md: 0.5rem;
                --radius-lg: 0.75rem;
                --radius-xl: 1rem;
            }

            /* Reset et base */
            * {
                box-sizing: border-box;
            }

            .task-manager-app {
                min-height: 100vh;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 1.5rem;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            /* Header moderne */
            .app-header {
                margin-bottom: 2rem;
            }

            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap;
                gap: 1rem;
            }

            .header-title {
                flex: 1;
                min-width: 300px;
            }

            .main-title {
                font-size: 2.5rem;
                font-weight: 800;
                color: var(--gray-900);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                line-height: 1.2;
            }

            .title-icon {
                background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .subtitle {
                font-size: 1.125rem;
                color: var(--gray-600);
                margin: 0.5rem 0 0 0;
                font-weight: 500;
            }

            .header-actions {
                display: flex;
                gap: 0.75rem;
                align-items: center;
            }

            /* Boutons modernes */
            .btn-primary {
                background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
                color: var(--white);
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: var(--radius-lg);
                font-weight: 600;
                font-size: 0.875rem;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
                box-shadow: var(--shadow-sm);
                text-decoration: none;
            }

            .btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
                background: linear-gradient(135deg, var(--primary-600), var(--primary-500));
            }

            .btn-secondary {
                background: var(--white);
                color: var(--gray-700);
                border: 1px solid var(--gray-300);
                padding: 0.75rem 1.5rem;
                border-radius: var(--radius-lg);
                font-weight: 600;
                font-size: 0.875rem;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
                text-decoration: none;
            }

            .btn-secondary:hover {
                background: var(--gray-50);
                border-color: var(--gray-400);
            }

            .btn-new-task {
                font-size: 1rem;
                padding: 1rem 2rem;
                box-shadow: var(--shadow-lg);
            }

            .btn-new-task:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-xl);
            }

            /* Stats rapides */
            .quick-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .stat-card {
                background: var(--white);
                border-radius: var(--radius-xl);
                padding: 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                box-shadow: var(--shadow-sm);
                position: relative;
                overflow: hidden;
            }

            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--gray-200);
                transition: all 0.3s ease;
            }

            .stat-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
                border-color: var(--primary-200);
            }

            .stat-card.active {
                border-color: var(--primary-500);
                background: linear-gradient(135deg, var(--primary-50), var(--white));
            }

            .stat-card.active::before {
                background: var(--primary-500);
            }

            .stat-icon {
                width: 3rem;
                height: 3rem;
                border-radius: var(--radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                flex-shrink: 0;
            }

            .todo-icon {
                background: linear-gradient(135deg, #dbeafe, #bfdbfe);
                color: #1e40af;
            }

            .progress-icon {
                background: linear-gradient(135deg, #fef3c7, #fde68a);
                color: #92400e;
            }

            .urgent-icon {
                background: linear-gradient(135deg, #fecaca, #fca5a5);
                color: #dc2626;
            }

            .reply-icon {
                background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
                color: #5b21b6;
            }

            .completed-icon {
                background: linear-gradient(135deg, #d1fae5, #a7f3d0);
                color: #065f46;
            }

            .stat-content {
                flex: 1;
                min-width: 0;
            }

            .stat-number {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                line-height: 1;
                margin-bottom: 0.25rem;
            }

            .stat-label {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.025em;
            }

            /* Filtres intelligents */
            .smart-filters {
                background: var(--white);
                border-radius: var(--radius-xl);
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                box-shadow: var(--shadow-sm);
            }

            .search-section {
                margin-bottom: 1.5rem;
            }

            .search-container {
                position: relative;
                max-width: 400px;
            }

            .search-input {
                width: 100%;
                padding: 0.875rem 1rem 0.875rem 2.75rem;
                border: 2px solid var(--gray-200);
                border-radius: var(--radius-lg);
                font-size: 1rem;
                background: var(--gray-50);
                transition: all 0.2s ease;
            }

            .search-input:focus {
                outline: none;
                border-color: var(--primary-500);
                background: var(--white);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .search-icon {
                position: absolute;
                left: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
                font-size: 1.125rem;
                pointer-events: none;
            }

            .search-clear {
                position: absolute;
                right: 0.75rem;
                top: 50%;
                transform: translateY(-50%);
                background: var(--gray-300);
                border: none;
                width: 1.5rem;
                height: 1.5rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 0.75rem;
                color: var(--gray-600);
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease;
            }

            .search-clear.visible {
                opacity: 1;
                visibility: visible;
            }

            .search-clear:hover {
                background: var(--gray-400);
                color: var(--white);
            }

            /* Filter chips */
            .filter-chips {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .filter-group {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
                flex: 1;
            }

            .filter-chip-container {
                position: relative;
            }

            .filter-chip {
                background: var(--gray-100);
                color: var(--gray-700);
                border: 1px solid var(--gray-200);
                padding: 0.625rem 1rem;
                border-radius: var(--radius-lg);
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
                white-space: nowrap;
            }

            .filter-chip:hover {
                background: var(--gray-200);
                border-color: var(--gray-300);
            }

            .filter-chip.active {
                background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
                color: var(--white);
                border-color: var(--primary-500);
            }

            .filter-chip i:last-child {
                font-size: 0.75rem;
                transition: transform 0.2s ease;
            }

            .filter-chip-container:hover .filter-chip i:last-child {
                transform: rotate(180deg);
            }

            /* Filter menus */
            .filter-menu {
                position: absolute;
                top: 100%;
                left: 0;
                margin-top: 0.5rem;
                background: var(--white);
                border: 1px solid var(--gray-200);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease;
                z-index: 50;
                min-width: 200px;
                max-height: 300px;
                overflow-y: auto;
            }

            .filter-menu.open {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .filter-option {
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: background 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-size: 0.875rem;
                color: var(--gray-700);
            }

            .filter-option:hover {
                background: var(--gray-50);
            }

            .filter-option.selected {
                background: var(--primary-50);
                color: var(--primary-700);
            }

            .check-mark {
                opacity: 0;
                font-size: 0.75rem;
                color: var(--primary-500);
                width: 1rem;
                flex-shrink: 0;
            }

            .filter-option.selected .check-mark {
                opacity: 1;
            }

            .priority-option {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .priority-icon {
                font-size: 1rem;
            }

            /* Filter actions */
            .filter-actions {
                display: flex;
                gap: 0.5rem;
            }

            .reset-filters-btn {
                background: var(--danger-50);
                color: var(--danger-700);
                border: 1px solid var(--danger-200);
                padding: 0.625rem 1rem;
                border-radius: var(--radius-lg);
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
                opacity: 0;
                visibility: hidden;
                transform: scale(0.95);
            }

            .reset-filters-btn.visible {
                opacity: 1;
                visibility: visible;
                transform: scale(1);
            }

            .reset-filters-btn:hover {
                background: var(--danger-100);
                border-color: var(--danger-300);
            }

            /* View controls */
            .view-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                flex-wrap: wrap;
                gap: 1rem;
            }

            .view-toggle {
                display: flex;
                background: var(--white);
                border: 1px solid var(--gray-200);
                border-radius: var(--radius-lg);
                overflow: hidden;
                box-shadow: var(--shadow-sm);
            }

            .view-btn {
                background: none;
                border: none;
                padding: 0.75rem 1rem;
                cursor: pointer;
                color: var(--gray-600);
                transition: all 0.2s ease;
                font-size: 1rem;
            }

            .view-btn:hover {
                background: var(--gray-50);
                color: var(--gray-800);
            }

            .view-btn.active {
                background: var(--primary-500);
                color: var(--white);
            }

            .view-options {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            /* Toggle moderne */
            .toggle-completed {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                user-select: none;
            }

            .toggle-completed input {
                display: none;
            }

            .toggle-slider {
                width: 3rem;
                height: 1.5rem;
                background: var(--gray-300);
                border-radius: 1rem;
                position: relative;
                transition: all 0.3s ease;
            }

            .toggle-slider::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 1.25rem;
                height: 1.25rem;
                background: var(--white);
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: var(--shadow-sm);
            }

            .toggle-completed input:checked + .toggle-slider {
                background: var(--primary-500);
            }

            .toggle-completed input:checked + .toggle-slider::before {
                transform: translateX(1.5rem);
            }

            .toggle-label {
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--gray-700);
            }

            /* Bulk actions */
            .bulk-actions {
                background: linear-gradient(135deg, var(--primary-50), var(--white));
                border: 1px solid var(--primary-200);
                border-radius: var(--radius-lg);
                padding: 1rem 1.5rem;
                margin-bottom: 1.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            }

            .bulk-actions.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .bulk-selection-info {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: var(--gray-700);
                font-weight: 500;
            }

            .selection-count {
                font-size: 1.25rem;
                font-weight: 800;
                color: var(--primary-600);
            }

            .bulk-action-buttons {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }

            .bulk-btn {
                padding: 0.5rem 1rem;
                border-radius: var(--radius-md);
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
                border: none;
            }

            .bulk-btn-primary {
                background: var(--primary-500);
                color: var(--white);
            }

            .bulk-btn-primary:hover {
                background: var(--primary-600);
            }

            .bulk-btn-secondary {
                background: var(--white);
                color: var(--gray-700);
                border: 1px solid var(--gray-300);
            }

            .bulk-btn-secondary:hover {
                background: var(--gray-50);
            }

            .bulk-btn-danger {
                background: var(--danger-500);
                color: var(--white);
            }

            .bulk-btn-danger:hover {
                background: var(--danger-600);
            }

            /* Tasks container */
            .tasks-container {
                background: var(--white);
                border-radius: var(--radius-xl);
                overflow: hidden;
                box-shadow: var(--shadow-sm);
                min-height: 400px;
            }

            /* Tasks grid (vue cartes) */
            .tasks-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 1.5rem;
                padding: 1.5rem;
            }

            .task-card {
                background: var(--white);
                border: 1px solid var(--gray-200);
                border-radius: var(--radius-lg);
                overflow: hidden;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
            }

            .task-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
                border-color: var(--primary-300);
            }

            .task-card.selected {
                border-color: var(--primary-500);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .task-card.overdue {
                border-left: 4px solid var(--danger-500);
            }

            .task-card.completed {
                opacity: 0.7;
            }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 1rem 1rem 0 1rem;
                gap: 0.75rem;
            }

            .card-checkbox {
                margin-top: 0.25rem;
            }

            .custom-checkbox {
                width: 1.25rem;
                height: 1.25rem;
                border: 2px solid var(--gray-300);
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--white);
                flex-shrink: 0;
            }

            .custom-checkbox:hover {
                border-color: var(--primary-400);
            }

            .custom-checkbox.checked {
                background: var(--primary-500);
                border-color: var(--primary-500);
                color: var(--white);
            }

            .custom-checkbox i {
                font-size: 0.75rem;
            }

            .priority-indicator {
                width: 4px;
                height: 1.5rem;
                border-radius: 2px;
                flex-shrink: 0;
            }

            .priority-indicator.urgent {
                background: var(--danger-500);
            }

            .priority-indicator.high {
                background: var(--warning-500);
            }

            .priority-indicator.medium {
                background: var(--primary-500);
            }

            .priority-indicator.low {
                background: var(--gray-400);
            }

            .card-actions {
                display: flex;
                gap: 0.5rem;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .task-card:hover .card-actions {
                opacity: 1;
            }

            .card-action-btn {
                width: 2rem;
                height: 2rem;
                border: none;
                border-radius: var(--radius-md);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                transition: all 0.2s ease;
                background: var(--gray-100);
                color: var(--gray-600);
            }

            .card-action-btn:hover {
                background: var(--gray-200);
                color: var(--gray-800);
                transform: scale(1.05);
            }

            .card-action-btn.reply-btn {
                background: var(--primary-100);
                color: var(--primary-600);
            }

            .card-action-btn.reply-btn:hover {
                background: var(--primary-200);
                color: var(--primary-700);
            }

            .card-content {
                padding: 0 1rem 1rem 1rem;
            }

            .card-title {
                font-size: 1.125rem;
                font-weight: 700;
                color: var(--gray-900);
                margin: 0 0 0.5rem 0;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .card-description {
                font-size: 0.875rem;
                color: var(--gray-600);
                line-height: 1.5;
                margin: 0 0 1rem 0;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .card-badges {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }

            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: var(--radius-md);
                font-size: 0.75rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .status-badge.todo {
                background: #dbeafe;
                color: #1e40af;
            }

            .status-badge.in-progress {
                background: #fef3c7;
                color: #92400e;
            }

            .status-badge.completed {
                background: #d1fae5;
                color: #065f46;
            }

            .feature-badge {
                width: 1.5rem;
                height: 1.5rem;
                border-radius: var(--radius-sm);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
            }

            .feature-badge.email {
                background: #e0e7ff;
                color: #5b21b6;
            }

            .feature-badge.reply {
                background: #fef3c7;
                color: #92400e;
            }

            .feature-badge.ai {
                background: #f3e8ff;
                color: #7c3aed;
            }

            .card-tags {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }

            .tag-chip {
                padding: 0.25rem 0.5rem;
                background: var(--gray-100);
                color: var(--gray-700);
                border-radius: var(--radius-sm);
                font-size: 0.75rem;
                font-weight: 500;
            }

            .tag-more {
                padding: 0.25rem 0.5rem;
                background: var(--primary-100);
                color: var(--primary-700);
                border-radius: var(--radius-sm);
                font-size: 0.75rem;
                font-weight: 600;
            }

            .card-footer {
                padding: 0 1rem 1rem 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 0.5rem;
                font-size: 0.75rem;
                color: var(--gray-500);
            }

            .card-client {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-weight: 500;
            }

            .card-due-date {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-weight: 500;
            }

            .card-due-date.overdue {
                color: var(--danger-600);
                font-weight: 600;
            }

            .card-meta {
                font-size: 0.75rem;
                color: var(--gray-400);
            }

            /* Tasks list (vue liste) */
            .tasks-list {
                display: flex;
                flex-direction: column;
            }

            .list-header {
                display: grid;
                grid-template-columns: 3rem 1fr 120px 120px 150px 120px 100px;
                gap: 1rem;
                padding: 1rem 1.5rem;
                background: var(--gray-50);
                border-bottom: 1px solid var(--gray-200);
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--gray-700);
                text-transform: uppercase;
                letter-spacing: 0.025em;
            }

            .list-header-cell {
                display: flex;
                align-items: center;
            }

            .list-body {
                display: flex;
                flex-direction: column;
            }

            .list-row {
                display: grid;
                grid-template-columns: 3rem 1fr 120px 120px 150px 120px 100px;
                gap: 1rem;
                padding: 1rem 1.5rem;
                border-bottom: 1px solid var(--gray-100);
                transition: all 0.2s ease;
                cursor: pointer;
                align-items: center;
            }

            .list-row:hover {
                background: var(--gray-50);
            }

            .list-row.selected {
                background: var(--primary-50);
                border-color: var(--primary-200);
            }

            .list-row.overdue {
                border-left: 4px solid var(--danger-500);
            }

            .list-row.completed {
                opacity: 0.7;
            }

            .list-cell {
                display: flex;
                align-items: center;
                min-width: 0;
            }

            .task-title-container {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                min-width: 0;
                flex: 1;
            }

            .task-title {
                font-weight: 600;
                color: var(--gray-900);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            }

            .task-indicators {
                display: flex;
                gap: 0.25rem;
                flex-shrink: 0;
            }

            .task-indicators i {
                font-size: 0.875rem;
            }

            .indicator-email {
                color: var(--primary-500);
            }

            .indicator-reply {
                color: var(--warning-500);
            }

            .indicator-ai {
                color: var(--purple-500);
            }

            .priority-badge {
                padding: 0.25rem 0.75rem;
                border-radius: var(--radius-md);
                font-size: 0.75rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.25rem;
                white-space: nowrap;
            }

            .priority-badge.urgent {
                background: #fecaca;
                color: #dc2626;
            }

            .priority-badge.high {
                background: #fde68a;
                color: #d97706;
            }

            .priority-badge.medium {
                background: #dbeafe;
                color: #2563eb;
            }

            .priority-badge.low {
                background: var(--gray-200);
                color: var(--gray-600);
            }

            .client-name {
                font-weight: 500;
                color: var(--gray-700);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .due-date {
                font-weight: 500;
                color: var(--gray-700);
                white-space: nowrap;
            }

            .due-date.overdue {
                color: var(--danger-600);
                font-weight: 600;
            }

            .no-due-date {
                color: var(--gray-400);
            }

            .action-buttons {
                display: flex;
                gap: 0.5rem;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .list-row:hover .action-buttons {
                opacity: 1;
            }

            .action-btn {
                width: 1.75rem;
                height: 1.75rem;
                border: none;
                border-radius: var(--radius-sm);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
                transition: all 0.2s ease;
            }

            .complete-btn {
                background: var(--success-100);
                color: var(--success-600);
            }

            .complete-btn:hover {
                background: var(--success-200);
                color: var(--success-700);
            }

            .reply-btn {
                background: var(--primary-100);
                color: var(--primary-600);
            }

            .reply-btn:hover {
                background: var(--primary-200);
                color: var(--primary-700);
            }

            .delete-btn {
                background: var(--danger-100);
                color: var(--danger-600);
            }

            .delete-btn:hover {
                background: var(--danger-200);
                color: var(--danger-700);
            }

            /* Empty state */
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                text-align: center;
            }

            .empty-icon {
                font-size: 4rem;
                color: var(--gray-300);
                margin-bottom: 1.5rem;
            }

            .empty-title {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--gray-800);
                margin: 0 0 0.5rem 0;
            }

            .empty-description {
                font-size: 1rem;
                color: var(--gray-600);
                margin: 0 0 2rem 0;
                max-width: 400px;
                line-height: 1.5;
            }

            .empty-actions {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                justify-content: center;
            }

            /* Modal moderne */
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
                z-index: 1000;
                backdrop-filter: blur(4px);
                padding: 1rem;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .task-modal,
            .create-modal {
                background: var(--white);
                border-radius: var(--radius-xl);
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: var(--shadow-xl);
                animation: slideUp 0.3s ease;
                overflow: hidden;
            }

            .task-modal {
                max-width: 800px;
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
                padding: 1.5rem;
                border-bottom: 1px solid var(--gray-200);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
                color: var(--white);
            }

            .modal-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin: 0;
                color: var(--white);
                flex: 1;
                margin-right: 1rem;
            }

            .modal-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--white);
                font-size: 1.125rem;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .modal-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }

            .modal-body {
                padding: 1.5rem;
                flex: 1;
                overflow-y: auto;
            }

            .modal-footer {
                padding: 1.5rem;
                border-top: 1px solid var(--gray-200);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                background: var(--gray-50);
            }

            /* Task detail */
            .task-detail {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .task-detail-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .task-status-info {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }

            .detail-section {
                background: var(--gray-50);
                border-radius: var(--radius-lg);
                padding: 1.5rem;
            }

            .detail-section h4 {
                font-size: 1.125rem;
                font-weight: 700;
                color: var(--gray-900);
                margin: 0 0 1rem 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .task-description {
                font-size: 1rem;
                line-height: 1.6;
                color: var(--gray-700);
                margin: 0;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }

            .info-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .info-item label {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.025em;
            }

            .info-item span {
                font-size: 1rem;
                color: var(--gray-900);
                font-weight: 500;
            }

            .tags-display {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .email-info {
                background: linear-gradient(135deg, var(--primary-50), var(--white));
                border: 1px solid var(--primary-200);
            }

            .email-info h4 {
                color: var(--primary-700);
            }

            .email-details {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .email-field {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .email-field label {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--primary-600);
                text-transform: uppercase;
                letter-spacing: 0.025em;
            }

            .email-field span {
                font-size: 0.875rem;
                color: var(--gray-700);
            }

            .email-actions {
                padding-top: 1rem;
                border-top: 1px solid var(--primary-200);
            }

            /* Forms */
            .form-group {
                margin-bottom: 1.5rem;
            }

            .form-label {
                display: block;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--gray-700);
                margin-bottom: 0.5rem;
            }

            .required {
                color: var(--danger-500);
            }

            .form-input,
            .form-select,
            .form-textarea {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 2px solid var(--gray-200);
                border-radius: var(--radius-lg);
                font-size: 1rem;
                transition: all 0.2s ease;
                background: var(--white);
            }

            .form-input:focus,
            .form-select:focus,
            .form-textarea:focus {
                outline: none;
                border-color: var(--primary-500);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .form-textarea {
                resize: vertical;
                min-height: 120px;
                line-height: 1.5;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }

            /* Loading */
            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                text-align: center;
            }

            .loading-spinner {
                width: 3rem;
                height: 3rem;
                border: 3px solid var(--gray-200);
                border-radius: 50%;
                border-top-color: var(--primary-500);
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loading-text {
                font-size: 1.125rem;
                color: var(--gray-600);
                font-weight: 500;
                margin: 0;
            }

            .error-message {
                background: var(--danger-50);
                color: var(--danger-700);
                border: 1px solid var(--danger-200);
                border-radius: var(--radius-lg);
                padding: 1rem;
                text-align: center;
                font-weight: 500;
            }

            /* Toast notifications */
            .toast {
                position: fixed;
                bottom: 1.5rem;
                right: 1.5rem;
                background: var(--white);
                border: 1px solid var(--gray-200);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                z-index: 1100;
                max-width: 400px;
            }

            .toast.show {
                transform: translateX(0);
            }

            .toast-success {
                border-color: var(--success-200);
                background: var(--success-50);
                color: var(--success-800);
            }

            .toast-error {
                border-color: var(--danger-200);
                background: var(--danger-50);
                color: var(--danger-800);
            }

            .toast-info {
                border-color: var(--primary-200);
                background: var(--primary-50);
                color: var(--primary-800);
            }

            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 500;
            }

            /* Responsive design */
            @media (max-width: 1024px) {
                .tasks-grid {
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1rem;
                    padding: 1rem;
                }

                .list-header,
                .list-row {
                    grid-template-columns: 2.5rem 1fr 100px 100px 80px;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                }

                .list-header-cell:nth-child(5),
                .list-cell:nth-child(5),
                .list-header-cell:nth-child(6),
                .list-cell:nth-child(6) {
                    display: none;
                }
            }

            @media (max-width: 768px) {
                .task-manager-app {
                    padding: 1rem;
                }

                .main-title {
                    font-size: 2rem;
                }

                .header-content {
                    flex-direction: column;
                    align-items: stretch;
                }

                .header-title {
                    min-width: auto;
                    text-align: center;
                }

                .quick-stats {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                }

                .stat-card {
                    padding: 1rem;
                }

                .stat-number {
                    font-size: 1.5rem;
                }

                .filter-chips {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 1rem;
                }

                .filter-group {
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .filter-chip {
                    justify-content: space-between;
                    width: 100%;
                }

                .view-controls {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 1rem;
                }

                .tasks-grid {
                    grid-template-columns: 1fr;
                    padding: 1rem;
                }

                .list-header,
                .list-row {
                    grid-template-columns: 2rem 1fr 60px;
                    gap: 0.5rem;
                    padding: 0.75rem;
                }

                .list-header-cell:nth-child(n+4),
                .list-cell:nth-child(n+4) {
                    display: none;
                }

                .task-title-container {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.25rem;
                }

                .task-indicators {
                    margin-top: 0.25rem;
                }

                .bulk-actions {
                    flex-direction: column;
                    gap: 1rem;
                }

                .bulk-action-buttons {
                    justify-content: stretch;
                }

                .bulk-btn {
                    flex: 1;
                    justify-content: center;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }

                .modal-overlay {
                    padding: 0.5rem;
                }

                .task-modal,
                .create-modal {
                    max-height: 95vh;
                }

                .modal-body {
                    padding: 1rem;
                }

                .modal-footer {
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .modal-footer .btn-primary,
                .modal-footer .btn-secondary {
                    width: 100%;
                    justify-content: center;
                }

                .info-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 480px) {
                .task-manager-app {
                    padding: 0.75rem;
                }

                .main-title {
                    font-size: 1.75rem;
                }

                .quick-stats {
                    grid-template-columns: 1fr;
                }

                .stat-card {
                    padding: 0.75rem;
                }

                .smart-filters {
                    padding: 1rem;
                }

                .search-container {
                    max-width: 100%;
                }

                .tasks-grid {
                    padding: 0.75rem;
                }

                .task-card {
                    border-radius: var(--radius-md);
                }

                .card-header,
                .card-content {
                    padding: 0.75rem;
                }

                .card-footer {
                    padding: 0 0.75rem 0.75rem 0.75rem;
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

console.log('✅ TaskManager v7.0 loaded - Interface optimisée user-friendly avec design moderne');
