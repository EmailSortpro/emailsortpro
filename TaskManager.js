// TaskManager v11 - Version Optimisée avec Checklist et Statuts Étendus
// =====================================================================

class TaskManager {
    constructor() {
        this.tasks = [];
        this.initialized = false;
        this.selectedTasks = new Set();
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
            const saved = localStorage.getItem('emailsort_tasks');
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
            suggestedReplies: Array.isArray(task.suggestedReplies) ? task.suggestedReplies : this.generateBasicReplies(task),
            
            // Timestamps
            createdAt: task.createdAt || new Date().toISOString(),
            updatedAt: task.updatedAt || new Date().toISOString(),
            completedAt: task.completedAt || null,
            
            // Méthode
            method: task.method || 'manual'
        };
    }

    generateBasicReplies(task) {
        if (!task.hasEmail || !task.emailFrom) return [];
        
        const senderName = task.emailFromName || task.emailFrom.split('@')[0] || 'l\'expéditeur';
        const subject = task.emailSubject || 'votre message';
        
        return [
            {
                tone: 'professionnel',
                subject: `Re: ${subject}`,
                content: `Bonjour ${senderName},\n\nMerci pour votre message concernant "${subject}".\n\nJ'ai bien pris connaissance de votre demande et je m'en occupe rapidement.\n\nCordialement,\n[Votre nom]`,
                description: 'Réponse professionnelle standard'
            }
        ];
    }

    generateSampleTasks() {
        this.tasks = [
            {
                id: 'sample_1',
                title: 'Répondre à l\'équipe marketing sur la campagne Q2',
                description: '📧 RÉSUMÉ EXÉCUTIF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDe: Sarah Martin (acme-corp.com)\nObjet: Demande de validation pour la campagne marketing Q2\n📮 Réponse attendue\n\n🎯 ACTIONS REQUISES:\n1. Valider les visuels de la campagne\n2. Confirmer le budget alloué\n3. Définir les dates de lancement\n\n💡 INFORMATIONS CLÉS:\n• Budget proposé : 50k€\n• Cible : 25-45 ans\n• Canaux : LinkedIn, Google Ads\n\n⚠️ POINTS D\'ATTENTION:\n• Deadline serrée pour le lancement\n• Coordination avec l\'équipe commerciale requise',
                priority: 'high',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'sarah.martin@acme-corp.com',
                emailFromName: 'Sarah Martin',
                emailSubject: 'Validation campagne marketing Q2',
                emailDate: new Date().toISOString(),
                emailDomain: 'acme-corp.com',
                emailContent: `Email de: Sarah Martin <sarah.martin@acme-corp.com>\nDate: ${new Date().toLocaleString('fr-FR')}\nSujet: Validation campagne marketing Q2\n\nBonjour,\n\nJ'espère que vous allez bien. Je vous contacte concernant notre campagne marketing Q2 qui nécessite votre validation.\n\nNous avons préparé les éléments suivants :\n- Visuels créatifs pour les réseaux sociaux\n- Budget détaillé de 50k€\n- Calendrier de lancement\n\nPourriez-vous valider ces éléments avant vendredi ? Nous devons coordonner avec l'équipe commerciale pour le lancement.\n\nMerci d'avance,\nSarah Martin`,
                client: 'ACME Corp',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                needsReply: true,
                checklist: [
                    { id: 1, text: 'Valider les visuels de la campagne', completed: false },
                    { id: 2, text: 'Confirmer le budget alloué', completed: false },
                    { id: 3, text: 'Définir les dates de lancement', completed: false }
                ],
                comments: []
            }
        ].map(task => this.ensureTaskProperties(task));
        
        this.saveTasks();
    }

    // CRUD Operations
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

    // Checklist Management
    addChecklistItem(taskId, text) {
        const task = this.getTask(taskId);
        if (!task) return null;
        
        const newItem = {
            id: Date.now(),
            text: text,
            completed: false
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

    // Comments Management
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

    // Filtering and Sorting
    filterTasks(filters = {}) {
        let filtered = [...this.tasks];
        
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
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
            case 'created':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return sorted;
    }

    // Statistics
    getStats() {
        const byStatus = {
            todo: this.tasks.filter(t => t.status === 'todo').length,
            'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
            completed: this.tasks.filter(t => t.status === 'completed').length,
            relanced: this.tasks.filter(t => t.status === 'relanced').length,
            waiting: this.tasks.filter(t => t.status === 'waiting').length
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

    // Utility Methods
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveTasks() {
        try {
            localStorage.setItem('emailsort_tasks', JSON.stringify(this.tasks));
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
// TasksView - Interface utilisateur
// =====================================

class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            search: '',
            sortBy: 'created'
        };
        
        this.selectedTasks = new Set();
        this.currentViewMode = 'normal';
        this.showCompleted = false;
        this.showAdvancedFilters = false;
        
        window.addEventListener('taskUpdate', () => {
            this.refreshView();
        });
    }

    render(container) {
        if (!container || !window.taskManager?.initialized) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-icon">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Chargement des tâches...</p>
                </div>
            `;
            return;
        }

        const stats = window.taskManager.getStats();
        
        container.innerHTML = `
            <div class="tasks-page-corrected">
                <!-- RECTANGLE BLANC HARMONISÉ - DEUX LIGNES -->
                <div class="controls-section-corrected">
                    <!-- Ligne 1 : Recherche + Actions principales -->
                    <div class="main-controls-line">
                        <div class="search-section">
                            <div class="search-box-corrected">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" 
                                       class="search-input-corrected" 
                                       id="taskSearchInput"
                                       placeholder="Rechercher tâches..." 
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
                                <div class="selection-panel">
                                    <span class="selection-count">${this.selectedTasks.size} sélectionné(s)</span>
                                    <button class="btn-action btn-clear" onclick="window.tasksView.clearSelection()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                    <button class="btn-action btn-bulk" onclick="window.tasksView.bulkActions()">
                                        Actions
                                        <span class="count-badge">${this.selectedTasks.size}</span>
                                    </button>
                                </div>
                            ` : ''}
                            
                            <button class="btn-action btn-select-all" onclick="window.tasksView.selectAllVisible()">
                                <i class="fas fa-check-square"></i>
                                Tout sélectionner
                            </button>

                            <button class="btn-action btn-refresh" onclick="window.tasksView.refreshTasks()">
                                <i class="fas fa-sync-alt"></i>
                                Actualiser
                            </button>
                            
                            <button class="btn-action btn-new" onclick="window.tasksView.showCreateModal()">
                                <i class="fas fa-plus"></i>
                                Nouvelle
                            </button>
                            
                            <button class="btn-action btn-filters ${this.showAdvancedFilters ? 'active' : ''}" 
                                    onclick="window.tasksView.toggleAdvancedFilters()">
                                <i class="fas fa-filter"></i>
                                Filtres
                                <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Ligne 2 : Modes de vue + Filtres de statut -->
                    <div class="views-filters-line">
                        <div class="view-modes">
                            <button class="view-mode ${this.currentViewMode === 'minimal' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('minimal')">
                                Minimal
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
                            ${this.buildStatusPills(stats)}
                        </div>
                    </div>
                </div>

                <!-- Filtres avancés -->
                <div class="advanced-filters-panel ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFiltersPanel">
                    <div class="advanced-filters-grid">
                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-flag"></i> Priorité
                            </label>
                            <select class="filter-select" onchange="window.tasksView.updateFilter('priority', this.value)">
                                <option value="all">Toutes</option>
                                <option value="urgent">🚨 Urgente</option>
                                <option value="high">⚡ Haute</option>
                                <option value="medium">📌 Normale</option>
                                <option value="low">📄 Basse</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-building"></i> Client
                            </label>
                            <select class="filter-select" onchange="window.tasksView.updateFilter('client', this.value)">
                                ${this.buildClientFilterOptions()}
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-sort"></i> Trier par
                            </label>
                            <select class="filter-select" onchange="window.tasksView.updateFilter('sortBy', this.value)">
                                <option value="created">Date création</option>
                                <option value="priority">Priorité</option>
                                <option value="dueDate">Date échéance</option>
                            </select>
                        </div>

                        <div class="filter-actions">
                            <button class="btn-action btn-reset" onclick="window.tasksView.resetAllFilters()">
                                <i class="fas fa-undo"></i>
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tasks-container" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addStyles();
        this.setupEventListeners();
    }

    buildStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Tous', icon: '📋', count: stats.total },
            { id: 'todo', name: 'À faire', icon: '⏳', count: stats.todo },
            { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.inProgress },
            { id: 'relanced', name: 'Relancé', icon: '📨', count: stats.byStatus?.relanced || 0 },
            { id: 'waiting', name: 'En attente', icon: '⌛', count: stats.byStatus?.waiting || 0 },
            { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue },
            { id: 'needsReply', name: 'À répondre', icon: '📧', count: stats.needsReply },
            { id: 'completed', name: 'Terminées', icon: '✅', count: stats.completed }
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
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'minimal':
                return this.renderMinimalView(filteredTasks);
            case 'detailed':
                return this.renderDetailedView(filteredTasks);
            case 'normal':
            default:
                return this.renderNormalView(filteredTasks);
        }
    }

    renderMinimalView(tasks) {
        return `
            <div class="tasks-minimal-list">
                ${tasks.map(task => this.renderMinimalTaskItem(task)).join('')}
            </div>
        `;
    }

    renderMinimalTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const dueDateInfo = this.formatDueDate(task.dueDate);
        const checklistProgress = this.getChecklistProgress(task);
        
        return `
            <div class="task-minimal ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <div class="task-content-line">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="task-info">
                        <span class="task-title">${this.escapeHtml(task.title)}</span>
                        <span class="task-client">${this.escapeHtml(task.client)}</span>
                    </div>
                    
                    <div class="task-meta">
                        ${checklistProgress ? `<span class="checklist-progress">📋 ${checklistProgress}</span>` : ''}
                        <span class="task-deadline ${dueDateInfo.className}">
                            ${dueDateInfo.text || 'Pas d\'échéance'}
                        </span>
                    </div>
                    
                    <div class="task-actions">
                        ${this.renderTaskActions(task)}
                    </div>
                </div>
            </div>
        `;
    }

    renderNormalView(tasks) {
        return `
            <div class="tasks-normal-list">
                ${tasks.map(task => this.renderNormalTaskItem(task)).join('')}
            </div>
        `;
    }

    renderNormalTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusIcon = this.getStatusIcon(task.status);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        const checklistProgress = this.getChecklistProgress(task);
        
        return `
            <div class="task-normal ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <div class="task-content-line">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="priority-bar" style="background-color: ${this.getPriorityColor(task.priority)}"></div>
                    
                    <div class="task-main">
                        <div class="task-header">
                            <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                            <div class="task-badges">
                                <span class="status-badge ${task.status}">${this.getStatusLabel(task.status)}</span>
                                ${task.relanceCount > 0 ? `<span class="relance-badge">Relancé ${task.relanceCount}x</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="task-details">
                            <span class="task-client">
                                ${this.escapeHtml(task.client)}
                            </span>
                            ${checklistProgress ? `<span class="checklist-info">📋 ${checklistProgress}</span>` : ''}
                            <span class="task-deadline ${dueDateInfo.className}">
                                ${dueDateInfo.text || 'Pas d\'échéance'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="task-actions">
                        ${this.renderTaskActions(task)}
                    </div>
                </div>
            </div>
        `;
    }

    renderDetailedView(tasks) {
        return `
            <div class="tasks-detailed-grid">
                ${tasks.map(task => this.renderDetailedTaskItem(task)).join('')}
            </div>
        `;
    }

    renderDetailedTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const dueDateInfo = this.formatDueDate(task.dueDate);
        const checklistProgress = this.getChecklistProgress(task);
        
        return `
            <div class="task-detailed ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                
                <div class="task-detailed-header">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="task-badges-group">
                        <span class="status-badge ${task.status}">${this.getStatusLabel(task.status)}</span>
                        <span class="priority-badge ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                    </div>
                </div>
                
                <div class="task-detailed-content">
                    <h3 class="task-title" onclick="window.tasksView.showTaskDetails('${task.id}')">${this.escapeHtml(task.title)}</h3>
                    <p class="task-description">${this.escapeHtml(task.description.substring(0, 150))}${task.description.length > 150 ? '...' : ''}</p>
                    
                    <div class="task-meta-grid">
                        <div class="meta-item">
                            <span>${this.escapeHtml(task.client)}</span>
                        </div>
                        ${checklistProgress ? `
                            <div class="meta-item">
                                <span>📋 ${checklistProgress}</span>
                            </div>
                        ` : ''}
                        <div class="meta-item deadline-centered ${dueDateInfo.className}">
                            <span>${dueDateInfo.text || 'Pas d\'échéance'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="task-detailed-actions">
                    ${this.renderDetailedActions(task)}
                </div>
            </div>
        `;
    }

    renderTaskActions(task) {
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
        
        if (task.status === 'todo' || task.status === 'in-progress') {
            actions.push(`
                <button class="action-btn relance" 
                        onclick="event.stopPropagation(); window.tasksView.markRelanced('${task.id}')"
                        title="Relancer">
                    <i class="fas fa-redo"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn edit" 
                    onclick="event.stopPropagation(); window.tasksView.showEditModal('${task.id}')"
                    title="Modifier la tâche">
                <i class="fas fa-edit"></i>
            </button>
        `);
        
        actions.push(`
            <button class="action-btn details" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        if (task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0) {
            actions.push(`
                <button class="action-btn reply" 
                        onclick="event.stopPropagation(); window.tasksView.showSuggestedReplies('${task.id}')"
                        title="Suggestions de réponse">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        return actions.join('');
    }

    renderDetailedActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="btn-detailed complete" 
                        onclick="window.tasksView.markComplete('${task.id}')">
                    <i class="fas fa-check"></i>
                    Terminé
                </button>
            `);
        }
        
        actions.push(`
            <button class="btn-detailed edit" 
                    onclick="window.tasksView.showEditModal('${task.id}')">
                <i class="fas fa-edit"></i>
                Modifier
            </button>
        `);
        
        actions.push(`
            <button class="btn-detailed details" 
                    onclick="window.tasksView.showTaskDetails('${task.id}')">
                <i class="fas fa-eye"></i>
                Détails
            </button>
        `);
        
        return actions.join('');
    }

    // Modal Methods
    showCreateModal() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'create_task_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus"></i> Créer une nouvelle tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildCreateForm()}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Annuler
                        </button>
                        <button class="btn-modal btn-primary" onclick="window.tasksView.createNewTask('${uniqueId}')">
                            <i class="fas fa-plus"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildCreateForm() {
        return `
            <div class="create-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Titre de la tâche *</label>
                        <input type="text" id="new-task-title" class="form-input" 
                               placeholder="Titre de la tâche" required />
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="new-task-description" class="form-textarea" rows="4" 
                                  placeholder="Description détaillée..."></textarea>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Statut</label>
                        <select id="new-task-status" class="form-select">
                            <option value="todo" selected>⏳ À faire</option>
                            <option value="in-progress">🔄 En cours</option>
                            <option value="relanced">📨 Relancé</option>
                            <option value="waiting">⌛ En attente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priorité</label>
                        <select id="new-task-priority" class="form-select">
                            <option value="low">📄 Basse</option>
                            <option value="medium" selected>📌 Normale</option>
                            <option value="high">⚡ Haute</option>
                            <option value="urgent">🚨 Urgente</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Client/Projet</label>
                        <input type="text" id="new-task-client" class="form-input" 
                               placeholder="Nom du client ou projet" value="Interne" />
                    </div>
                    <div class="form-group">
                        <label>Date d'échéance</label>
                        <input type="date" id="new-task-duedate" class="form-input" />
                    </div>
                </div>
                
                <!-- Section Email -->
                <div class="email-attach-section">
                    <div class="email-attach-header">
                        <h3><i class="fas fa-envelope"></i> Email attaché</h3>
                        <button type="button" class="btn-attach-email" onclick="window.tasksView.showEmailAttachModal()">
                            <i class="fas fa-paperclip"></i> Attacher un email
                        </button>
                    </div>
                    <div id="attachedEmailInfo" class="attached-email-info" style="display: none;">
                        <div class="email-preview">
                            <div class="email-preview-header">
                                <strong>De:</strong> <span id="emailFromPreview"></span><br>
                                <strong>Sujet:</strong> <span id="emailSubjectPreview"></span>
                            </div>
                            <button type="button" class="btn-remove-email" onclick="window.tasksView.removeAttachedEmail()">
                                <i class="fas fa-times"></i> Retirer
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="checklist-section">
                    <div class="checklist-header">
                        <h3 class="checklist-title">
                            <i class="fas fa-tasks"></i> Checklist
                        </h3>
                        <button type="button" class="btn-add-checklist" onclick="window.tasksView.addChecklistItem()">
                            <i class="fas fa-plus"></i> Ajouter
                        </button>
                    </div>
                    <div class="checklist-items" id="newTaskChecklist">
                        <!-- Les items seront ajoutés ici dynamiquement -->
                    </div>
                </div>
            </div>
        `;
    }

    showEditModal(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'edit_task_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-edit"></i> Modifier la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildEditForm(task)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Annuler
                        </button>
                        <button class="btn-modal btn-primary" onclick="window.tasksView.saveTaskChanges('${task.id}', '${uniqueId}')">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildEditForm(task) {
        // Préparer l'email attaché si la tâche en a un
        if (task.hasEmail) {
            this.tempAttachedEmail = {
                hasEmail: true,
                emailId: task.emailId,
                emailFrom: task.emailFrom,
                emailFromName: task.emailFromName,
                emailSubject: task.emailSubject,
                emailContent: task.emailContent,
                emailDate: task.emailDate,
                emailDomain: task.emailDomain,
                needsReply: task.needsReply,
                emailReplied: task.emailReplied,
                hasAttachments: task.hasAttachments
            };
        }
        
        return `
            <div class="edit-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Titre de la tâche *</label>
                        <input type="text" id="edit-title" class="form-input" 
                               value="${this.escapeHtml(task.title)}" required />
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="edit-description" class="form-textarea" rows="4">${this.escapeHtml(task.description)}</textarea>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Statut</label>
                        <select id="edit-status" class="form-select">
                            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>⏳ À faire</option>
                            <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>🔄 En cours</option>
                            <option value="relanced" ${task.status === 'relanced' ? 'selected' : ''}>📨 Relancé</option>
                            <option value="waiting" ${task.status === 'waiting' ? 'selected' : ''}>⌛ En attente</option>
                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>✅ Terminé</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priorité</label>
                        <select id="edit-priority" class="form-select">
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Client/Projet</label>
                        <input type="text" id="edit-client" class="form-input" 
                               value="${this.escapeHtml(task.client)}" />
                    </div>
                    <div class="form-group">
                        <label>Date d'échéance</label>
                        <input type="date" id="edit-duedate" class="form-input" 
                               value="${task.dueDate || ''}" />
                    </div>
                </div>
                
                <!-- Section Email -->
                <div class="email-attach-section">
                    <div class="email-attach-header">
                        <h3><i class="fas fa-envelope"></i> Email attaché</h3>
                        ${!task.hasEmail ? `
                            <button type="button" class="btn-attach-email" onclick="window.tasksView.showEmailAttachModal()">
                                <i class="fas fa-paperclip"></i> Attacher un email
                            </button>
                        ` : ''}
                    </div>
                    <div id="attachedEmailInfo" class="attached-email-info" style="${task.hasEmail ? 'display: block;' : 'display: none;'}">
                        <div class="email-preview">
                            <div class="email-preview-header">
                                <strong>De:</strong> <span id="emailFromPreview">${task.hasEmail ? this.escapeHtml(task.emailFromName + ' <' + task.emailFrom + '>') : ''}</span><br>
                                <strong>Sujet:</strong> <span id="emailSubjectPreview">${task.hasEmail ? this.escapeHtml(task.emailSubject) : ''}</span>
                                ${task.hasEmail ? `
                                    <br><label style="margin-top: 8px;">
                                        <input type="checkbox" id="edit-needs-reply" ${task.needsReply ? 'checked' : ''} />
                                        Réponse requise
                                    </label>
                                ` : ''}
                            </div>
                            ${!task.hasEmail ? `
                                <button type="button" class="btn-remove-email" onclick="window.tasksView.removeAttachedEmail()">
                                    <i class="fas fa-times"></i> Retirer
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="checklist-section">
                    <div class="checklist-header">
                        <h3 class="checklist-title">
                            <i class="fas fa-tasks"></i> Checklist
                        </h3>
                        <button type="button" class="btn-add-checklist" onclick="window.tasksView.addChecklistItem()">
                            <i class="fas fa-plus"></i> Ajouter
                        </button>
                    </div>
                    <div class="checklist-items" id="editTaskChecklist">
                        ${task.checklist.map(item => `
                            <div class="checklist-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
                                <input type="checkbox" ${item.completed ? 'checked' : ''} 
                                       onchange="window.tasksView.toggleChecklistItem(this)">
                                <input type="text" value="${this.escapeHtml(item.text)}" 
                                       placeholder="Élément de checklist">
                                <button class="checklist-remove" onclick="window.tasksView.removeChecklistItem(this)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'task_details_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-eye"></i> Détails de la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildTaskDetailsContent(task)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Fermer
                        </button>
                        ${task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0 ? `
                            <button class="btn-modal btn-info" onclick="window.tasksView.showSuggestedReplies('${task.id}')">
                                <i class="fas fa-reply"></i> Voir suggestions de réponse
                            </button>
                        ` : ''}
                        <button class="btn-modal btn-primary" onclick="window.tasksView.closeModal('${uniqueId}'); window.tasksView.showEditModal('${task.id}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        ${task.status !== 'completed' ? `
                            <button class="btn-modal btn-success" onclick="window.tasksView.markComplete('${task.id}'); window.tasksView.closeModal('${uniqueId}')">
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
        const checklistProgress = this.getChecklistProgress(task);
        
        return `
            <div class="task-details-content">
                <div class="details-header">
                    <h1 class="task-title-details">${this.escapeHtml(task.title)}</h1>
                    <div class="task-meta-badges">
                        <span class="priority-badge-details priority-${task.priority}">
                            ${priorityIcon} ${this.getPriorityLabel(task.priority)}
                        </span>
                        <span class="status-badge-details status-${task.status}">
                            ${this.getStatusIcon(task.status)} ${statusLabel}
                        </span>
                        <span class="deadline-badge-details ${dueDateInfo.className}">
                            <i class="fas fa-calendar"></i>
                            ${dueDateInfo.text || 'Pas d\'échéance définie'}
                        </span>
                        ${task.relanceCount > 0 ? `
                            <span class="relance-badge-details">
                                <i class="fas fa-redo"></i>
                                Relancé ${task.relanceCount} fois
                            </span>
                        ` : ''}
                    </div>
                </div>

                ${task.description ? `
                    <div class="details-section">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <div class="description-content">
                            ${this.formatDescription(task.description)}
                        </div>
                    </div>
                ` : ''}

                <div class="details-section">
                    <h3><i class="fas fa-info-circle"></i> Informations Générales</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Client/Projet:</strong>
                            <span>${this.escapeHtml(task.client)}</span>
                        </div>
                        <div class="info-item">
                            <strong>Créé le:</strong>
                            <span>${new Date(task.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="info-item">
                            <strong>Dernière modification:</strong>
                            <span>${new Date(task.updatedAt).toLocaleString('fr-FR')}</span>
                        </div>
                        ${task.completedAt ? `
                            <div class="info-item">
                                <strong>Terminé le:</strong>
                                <span>${new Date(task.completedAt).toLocaleString('fr-FR')}</span>
                            </div>
                        ` : ''}
                        ${task.relanceDate ? `
                            <div class="info-item">
                                <strong>Dernière relance:</strong>
                                <span>${new Date(task.relanceDate).toLocaleString('fr-FR')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${task.checklist && task.checklist.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-tasks"></i> Checklist ${checklistProgress ? `(${checklistProgress})` : ''}</h3>
                        <div class="checklist-detail-items">
                            ${task.checklist.map(item => `
                                <div class="checklist-detail-item ${item.completed ? 'completed' : ''}">
                                    <input type="checkbox" 
                                           ${item.completed ? 'checked' : ''} 
                                           onchange="window.tasksView.updateChecklistItemStatus('${task.id}', ${item.id}, this.checked)">
                                    <span>${this.escapeHtml(item.text)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.hasEmail ? `
                    <div class="details-section">
                        <h3><i class="fas fa-envelope"></i> Informations Email</h3>
                        <div class="email-details-grid">
                            <div class="email-detail-item">
                                <strong>Expéditeur:</strong>
                                <span>${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')}</span>
                            </div>
                            ${task.emailFrom ? `
                                <div class="email-detail-item">
                                    <strong>Email:</strong>
                                    <span>${this.escapeHtml(task.emailFrom)}</span>
                                </div>
                            ` : ''}
                            ${task.emailSubject ? `
                                <div class="email-detail-item">
                                    <strong>Sujet:</strong>
                                    <span>${this.escapeHtml(task.emailSubject)}</span>
                                </div>
                            ` : ''}
                            <div class="email-detail-item">
                                <strong>Réponse requise:</strong>
                                <span>${task.needsReply ? '✅ Oui' : '❌ Non'}</span>
                            </div>
                        </div>
                        
                        ${task.emailContent && task.emailContent.length > 100 ? `
                            <div class="email-content-section">
                                <h4>Contenu de l'email</h4>
                                <div class="email-content-box">
                                    ${task.emailHtmlContent || this.formatEmailContent(task.emailContent)}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${task.actions && task.actions.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-tasks"></i> Actions Requises</h3>
                        <div class="actions-list-details">
                            ${task.actions.map((action, idx) => `
                                <div class="action-item-details">
                                    <span class="action-number">${idx + 1}</span>
                                    <span class="action-text">${this.escapeHtml(action.text)}</span>
                                    ${action.deadline ? `
                                        <span class="action-deadline">${this.formatDeadline(action.deadline)}</span>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.keyInfo && task.keyInfo.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-lightbulb"></i> Informations Clés</h3>
                        <div class="key-info-grid">
                            ${task.keyInfo.map(info => `
                                <div class="key-info-item">
                                    <i class="fas fa-chevron-right"></i>
                                    <span>${this.escapeHtml(info)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="details-section">
                    <h3><i class="fas fa-comments"></i> Commentaires</h3>
                    <div class="comments-list">
                        ${task.comments && task.comments.length > 0 ? 
                            task.comments.map(comment => `
                                <div class="comment-item">
                                    <div class="comment-header">
                                        <strong>${this.escapeHtml(comment.author || 'Anonyme')}</strong>
                                        <span class="comment-date">${new Date(comment.date).toLocaleString('fr-FR')}</span>
                                    </div>
                                    <div class="comment-text">${this.escapeHtml(comment.text)}</div>
                                </div>
                            `).join('') : '<p class="no-comments">Aucun commentaire</p>'
                        }
                    </div>
                    <div class="add-comment-form">
                        <textarea id="newComment" class="form-textarea" rows="3" placeholder="Ajouter un commentaire..."></textarea>
                        <button class="btn-modal btn-primary" onclick="window.tasksView.addComment('${task.id}')">
                            <i class="fas fa-paper-plane"></i> Envoyer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showSuggestedReplies(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.suggestedReplies || task.suggestedReplies.length === 0) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'replies_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-reply-all"></i> Suggestions de Réponse</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="ai-suggestions-info">
                            <div class="ai-badge">
                                <i class="fas fa-robot"></i>
                                <span>Suggestions générées automatiquement</span>
                            </div>
                            <p>Réponses personnalisées pour l'email de <strong>${task.emailFromName || 'l\'expéditeur'}</strong></p>
                        </div>
                        
                        <div class="replies-list">
                            ${task.suggestedReplies.map((reply, idx) => `
                                <div class="reply-suggestion-card">
                                    <div class="reply-card-header">
                                        <div class="reply-tone-badge ${reply.tone}">
                                            ${this.getReplyToneIcon(reply.tone)} ${this.getReplyToneLabel(reply.tone)}
                                        </div>
                                        <div class="reply-card-actions">
                                            <button class="btn-sm btn-secondary" onclick="window.tasksView.copyReplyToClipboard(${idx}, '${taskId}')">
                                                <i class="fas fa-copy"></i> Copier
                                            </button>
                                            <button class="btn-sm btn-primary" onclick="window.tasksView.useReply('${taskId}', ${idx})">
                                                <i class="fas fa-paper-plane"></i> Utiliser
                                            </button>
                                        </div>
                                    </div>
                                    <div class="reply-subject-line">
                                        <strong>Sujet:</strong> ${this.escapeHtml(reply.subject)}
                                    </div>
                                    <div class="reply-content-preview">
                                        ${this.escapeHtml(reply.content).replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    // Event Handlers
    addChecklistItem() {
        const container = document.getElementById('newTaskChecklist') || document.getElementById('editTaskChecklist');
        if (!container) return;
        
        const itemId = Date.now();
        const itemHTML = `
            <div class="checklist-item" data-id="${itemId}">
                <input type="checkbox" onchange="window.tasksView.toggleChecklistItem(this)">
                <input type="text" placeholder="Nouvel élément de checklist">
                <button class="checklist-remove" onclick="window.tasksView.removeChecklistItem(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', itemHTML);
    }

    removeChecklistItem(button) {
        button.closest('.checklist-item').remove();
    }

    toggleChecklistItem(checkbox) {
        const item = checkbox.closest('.checklist-item');
        item.classList.toggle('completed', checkbox.checked);
    }

    updateChecklistItemStatus(taskId, itemId, completed) {
        window.taskManager.updateChecklistItem(taskId, itemId, { completed });
        this.refreshView();
    }

    // Email temporaire attaché
    tempAttachedEmail = null;

    showModal(content, size = 'medium') {
        // Supprimer les modales existantes
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container ${size === 'large' ? 'modal-large' : ''}">
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

    closeModal(modalId) {
        if (modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.remove();
        } else {
            document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        }
        document.body.style.overflow = 'auto';
    }

    showEmailAttachModal() {
        const modalContent = `
            <h2><i class="fas fa-envelope"></i> Attacher un email</h2>
            <div class="email-attach-form">
                <div class="form-group">
                    <label>Type d'email</label>
                    <select id="emailType" class="form-select" onchange="window.tasksView.toggleEmailFields()">
                        <option value="search">Rechercher dans la boîte mail</option>
                        <option value="manual">Saisie manuelle</option>
                        <option value="paste">Coller un email</option>
                    </select>
                </div>
                
                <div id="searchEmailFields">
                    <div class="form-group">
                        <label>Rechercher un email</label>
                        <div class="email-search-box">
                            <input type="text" id="emailSearchQuery" class="form-input" 
                                   placeholder="Rechercher par expéditeur, sujet ou contenu..."
                                   onkeyup="window.tasksView.searchEmails(event)">
                            <button type="button" class="btn-search-email" onclick="window.tasksView.searchEmails()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="email-search-filters">
                        <label>
                            <input type="radio" name="emailFolder" value="inbox" checked> Boîte de réception
                        </label>
                        <label>
                            <input type="radio" name="emailFolder" value="sent"> Envoyés
                        </label>
                        <label>
                            <input type="radio" name="emailFolder" value="all"> Tous
                        </label>
                    </div>
                    
                    <div id="emailSearchResults" class="email-search-results">
                        <div class="search-info">Entrez un terme de recherche pour afficher les emails</div>
                    </div>
                </div>
                
                <div id="manualEmailFields" style="display: none;">
                    <div class="form-group">
                        <label>De (Email) *</label>
                        <input type="email" id="emailFrom" class="form-input" placeholder="exemple@domaine.com">
                    </div>
                    
                    <div class="form-group">
                        <label>Nom de l'expéditeur</label>
                        <input type="text" id="emailFromName" class="form-input" placeholder="Nom Prénom">
                    </div>
                    
                    <div class="form-group">
                        <label>Sujet *</label>
                        <input type="text" id="emailSubject" class="form-input" placeholder="Sujet de l'email">
                    </div>
                    
                    <div class="form-group">
                        <label>Contenu de l'email</label>
                        <textarea id="emailContent" class="form-textarea" rows="6" placeholder="Contenu du message..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="needsReply"> Réponse requise
                        </label>
                    </div>
                </div>
                
                <div id="pasteEmailFields" style="display: none;">
                    <div class="form-group">
                        <label>Coller l'email complet (avec en-têtes)</label>
                        <textarea id="emailPaste" class="form-textarea" rows="10" 
                                  placeholder="Collez ici l'email complet avec les en-têtes (De:, À:, Sujet:, etc.)"></textarea>
                    </div>
                    <button type="button" class="btn btn-secondary" onclick="window.tasksView.parseEmailContent()">
                        <i class="fas fa-magic"></i> Analyser l'email
                    </button>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal()">
                    Annuler
                </button>
                <button class="btn-modal btn-primary" onclick="window.tasksView.attachEmail()">
                    <i class="fas fa-paperclip"></i> Attacher
                </button>
            </div>
        `;
        
        this.showModal(modalContent);
    }

    toggleEmailFields() {
        const emailType = document.getElementById('emailType').value;
        const searchFields = document.getElementById('searchEmailFields');
        const manualFields = document.getElementById('manualEmailFields');
        const pasteFields = document.getElementById('pasteEmailFields');
        
        // Cacher tous les champs
        searchFields.style.display = 'none';
        manualFields.style.display = 'none';
        pasteFields.style.display = 'none';
        
        // Afficher le bon ensemble de champs
        switch(emailType) {
            case 'search':
                searchFields.style.display = 'block';
                break;
            case 'manual':
                manualFields.style.display = 'block';
                break;
            case 'paste':
                pasteFields.style.display = 'block';
                break;
        }
    }

    searchEmails(event) {
        // Si c'est un keyup, ne chercher que si c'est Enter
        if (event && event.type === 'keyup' && event.key !== 'Enter') {
            return;
        }

        const query = document.getElementById('emailSearchQuery').value.trim();
        const folder = document.querySelector('input[name="emailFolder"]:checked').value;
        
        if (!query) {
            document.getElementById('emailSearchResults').innerHTML = 
                '<div class="search-info">Entrez un terme de recherche pour afficher les emails</div>';
            return;
        }

        // Afficher un loader
        document.getElementById('emailSearchResults').innerHTML = 
            '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Recherche en cours...</div>';

        // Simuler une recherche d'emails (à remplacer par l'API réelle)
        setTimeout(() => {
            const mockEmails = this.getMockEmails(query, folder);
            this.displayEmailSearchResults(mockEmails);
        }, 500);
    }

    getMockEmails(query, folder) {
        // Simulation d'emails pour la démo
        // À remplacer par un appel API réel vers votre serveur mail
        const allEmails = [
            {
                id: 'email1',
                from: 'sarah.martin@acme-corp.com',
                fromName: 'Sarah Martin',
                subject: 'Validation campagne marketing Q2',
                preview: 'Bonjour, j\'ai besoin de votre validation pour la campagne Q2...',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                folder: 'inbox',
                hasAttachments: true
            },
            {
                id: 'email2',
                from: 'jean.dupont@example.com',
                fromName: 'Jean Dupont',
                subject: 'Demande de devis urgent',
                preview: 'Pourriez-vous me faire parvenir un devis pour...',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                folder: 'inbox',
                hasAttachments: false
            },
            {
                id: 'email3',
                from: 'vous@votreentreprise.com',
                fromName: 'Vous',
                to: 'client@example.com',
                subject: 'Re: Proposition commerciale',
                preview: 'Suite à notre conversation, voici la proposition...',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                folder: 'sent',
                hasAttachments: true
            }
        ];

        // Filtrer par dossier
        let emails = allEmails;
        if (folder !== 'all') {
            emails = emails.filter(e => e.folder === folder);
        }

        // Filtrer par recherche
        const searchLower = query.toLowerCase();
        emails = emails.filter(e => 
            e.from.toLowerCase().includes(searchLower) ||
            e.fromName.toLowerCase().includes(searchLower) ||
            e.subject.toLowerCase().includes(searchLower) ||
            e.preview.toLowerCase().includes(searchLower)
        );

        return emails;
    }

    displayEmailSearchResults(emails) {
        const resultsDiv = document.getElementById('emailSearchResults');
        
        if (emails.length === 0) {
            resultsDiv.innerHTML = '<div class="search-info">Aucun email trouvé</div>';
            return;
        }

        const resultsHTML = emails.map(email => `
            <div class="email-result-item ${this.selectedEmailId === email.id ? 'selected' : ''}" 
                 data-email-id="${email.id}"
                 onclick="window.tasksView.selectEmailResult('${email.id}', ${JSON.stringify(email).replace(/"/g, '&quot;')})">
                <div class="email-result-header">
                    <div class="email-result-from">
                        <strong>${this.escapeHtml(email.fromName || email.from)}</strong>
                        <span class="email-address">&lt;${this.escapeHtml(email.from || email.to)}&gt;</span>
                    </div>
                    <div class="email-result-date">
                        ${this.formatEmailDate(email.date)}
                        ${email.hasAttachments ? '<i class="fas fa-paperclip"></i>' : ''}
                    </div>
                </div>
                <div class="email-result-subject">${this.escapeHtml(email.subject)}</div>
                <div class="email-result-preview">${this.escapeHtml(email.preview)}</div>
            </div>
        `).join('');

        resultsDiv.innerHTML = `
            <div class="search-results-header">${emails.length} email(s) trouvé(s)</div>
            <div class="email-results-list">${resultsHTML}</div>
        `;
    }

    selectEmailResult(emailId, emailData) {
        // Marquer comme sélectionné
        this.selectedEmailId = emailId;
        document.querySelectorAll('.email-result-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.emailId === emailId);
        });

        // Stocker les données de l'email sélectionné
        this.selectedEmailData = emailData;
    }

    attachEmail() {
        const emailType = document.getElementById('emailType').value;
        
        if (emailType === 'search') {
            if (!this.selectedEmailData) {
                this.showToast('Veuillez sélectionner un email', 'warning');
                return;
            }
            
            // Utiliser l'email sélectionné
            this.tempAttachedEmail = {
                hasEmail: true,
                emailId: this.selectedEmailData.id,
                emailFrom: this.selectedEmailData.from || this.selectedEmailData.to,
                emailFromName: this.selectedEmailData.fromName || this.selectedEmailData.from.split('@')[0],
                emailSubject: this.selectedEmailData.subject,
                emailContent: this.selectedEmailData.preview, // À remplacer par le contenu complet via API
                emailDate: this.selectedEmailData.date,
                emailDomain: (this.selectedEmailData.from || this.selectedEmailData.to).split('@')[1] || '',
                needsReply: this.selectedEmailData.folder === 'inbox',
                emailReplied: false,
                hasAttachments: this.selectedEmailData.hasAttachments
            };
            
            // Afficher l'info de l'email attaché
            this.showAttachedEmailInfo();
            this.closeModal();
            this.showToast('Email attaché avec succès', 'success');
            
            // Réinitialiser la sélection
            this.selectedEmailId = null;
            this.selectedEmailData = null;
            
        } else if (emailType === 'manual') {
            // Code existant pour la saisie manuelle
            const emailFrom = document.getElementById('emailFrom').value.trim();
            const emailFromName = document.getElementById('emailFromName').value.trim();
            const emailSubject = document.getElementById('emailSubject').value.trim();
            const emailContent = document.getElementById('emailContent').value.trim();
            const needsReply = document.getElementById('needsReply').checked;
            
            if (!emailFrom || !emailSubject) {
                this.showToast('L\'email et le sujet sont requis', 'warning');
                return;
            }
            
            this.tempAttachedEmail = {
                hasEmail: true,
                emailFrom,
                emailFromName: emailFromName || emailFrom.split('@')[0],
                emailSubject,
                emailContent,
                emailDate: new Date().toISOString(),
                emailDomain: emailFrom.split('@')[1] || '',
                needsReply,
                emailReplied: false
            };
            
            this.showAttachedEmailInfo();
            this.closeModal();
            this.showToast('Email attaché avec succès', 'success');
        }
    }

    formatEmailDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffHours < 24) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffHours < 48) {
            return 'Hier';
        } else if (diffHours < 168) { // 7 jours
            return date.toLocaleDateString('fr-FR', { weekday: 'long' });
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    showAttachedEmailInfo() {
        const infoDiv = document.getElementById('attachedEmailInfo');
        const fromPreview = document.getElementById('emailFromPreview');
        const subjectPreview = document.getElementById('emailSubjectPreview');
        
        if (this.tempAttachedEmail && infoDiv && fromPreview && subjectPreview) {
            fromPreview.textContent = this.tempAttachedEmail.emailFromName + ' <' + this.tempAttachedEmail.emailFrom + '>';
            subjectPreview.textContent = this.tempAttachedEmail.emailSubject;
            infoDiv.style.display = 'block';
        }
    }

    removeAttachedEmail() {
        this.tempAttachedEmail = null;
        const infoDiv = document.getElementById('attachedEmailInfo');
        if (infoDiv) {
            infoDiv.style.display = 'none';
        }
        this.showToast('Email retiré', 'info');
    }

    createNewTask(modalId) {
        const title = document.getElementById('new-task-title')?.value?.trim();
        const description = document.getElementById('new-task-description')?.value?.trim();
        const status = document.getElementById('new-task-status')?.value;
        const priority = document.getElementById('new-task-priority')?.value;
        const dueDate = document.getElementById('new-task-duedate')?.value;
        const client = document.getElementById('new-task-client')?.value?.trim();

        if (!title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        // Récupérer la checklist
        const checklist = [];
        document.querySelectorAll('#newTaskChecklist .checklist-item').forEach((item, index) => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const text = item.querySelector('input[type="text"]').value.trim();
            if (text) {
                checklist.push({
                    id: parseInt(item.dataset.id) || index + 1,
                    text: text,
                    completed: checkbox.checked
                });
            }
        });

        const taskData = {
            title,
            description: description || '',
            status,
            priority,
            dueDate: dueDate || null,
            client: client || 'Interne',
            category: 'work',
            method: 'manual',
            checklist
        };

        // Ajouter les infos email si un email est attaché
        if (this.tempAttachedEmail) {
            Object.assign(taskData, this.tempAttachedEmail);
            taskData.category = 'email';
            // Si le client n'est pas défini, utiliser le domaine de l'email
            if (taskData.client === 'Interne' && this.tempAttachedEmail.emailDomain) {
                taskData.client = this.tempAttachedEmail.emailDomain.split('.')[0].toUpperCase();
            }
        }

        try {
            const task = window.taskManager.createTask(taskData);
            this.tempAttachedEmail = null; // Réinitialiser
            this.closeModal(modalId);
            this.showToast('Tâche créée avec succès', 'success');
            this.refreshView();
        } catch (error) {
            console.error('[TasksView] Error creating task:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    saveTaskChanges(taskId, modalId) {
        const title = document.getElementById('edit-title')?.value?.trim();
        const description = document.getElementById('edit-description')?.value?.trim();
        const status = document.getElementById('edit-status')?.value;
        const priority = document.getElementById('edit-priority')?.value;
        const client = document.getElementById('edit-client')?.value?.trim();
        const dueDate = document.getElementById('edit-duedate')?.value;
        const needsReply = document.getElementById('edit-needs-reply')?.checked;

        if (!title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        // Récupérer la checklist
        const checklist = [];
        document.querySelectorAll('#editTaskChecklist .checklist-item').forEach((item, index) => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const text = item.querySelector('input[type="text"]').value.trim();
            if (text) {
                checklist.push({
                    id: parseInt(item.dataset.id) || Date.now() + index,
                    text: text,
                    completed: checkbox.checked
                });
            }
        });

        const updates = {
            title,
            description,
            status,
            priority,
            client: client || 'Interne',
            dueDate: dueDate || null,
            needsReply: needsReply || false,
            checklist
        };

        // Ajouter les infos email si un nouvel email est attaché
        if (this.tempAttachedEmail) {
            Object.assign(updates, this.tempAttachedEmail);
            updates.category = 'email';
        }

        try {
            window.taskManager.updateTask(taskId, updates);
            this.tempAttachedEmail = null; // Réinitialiser
            this.closeModal(modalId);
            this.showToast('Tâche mise à jour avec succès', 'success');
            this.refreshView();
        } catch (error) {
            console.error('Error updating task:', error);
            this.showToast('Erreur lors de la mise à jour', 'error');
        }
    }

    addComment(taskId) {
        const textarea = document.getElementById('newComment');
        const text = textarea.value.trim();
        
        if (!text) {
            this.showToast('Le commentaire ne peut pas être vide', 'warning');
            return;
        }
        
        window.taskManager.addComment(taskId, text);
        textarea.value = '';
        this.showToast('Commentaire ajouté', 'success');
        
        // Rafraîchir la modal des détails
        this.closeModal();
        setTimeout(() => this.showTaskDetails(taskId), 100);
    }

    // Actions
    handleTaskClick(event, taskId) {
        if (event.target.type === 'checkbox' || event.target.closest('.task-actions')) {
            return;
        }
        
        const now = Date.now();
        const lastClick = this.lastTaskClick || 0;
        
        if (now - lastClick < 300) {
            event.preventDefault();
            event.stopPropagation();
            this.toggleTaskSelection(taskId);
            this.lastTaskClick = 0;
            return;
        }
        
        this.lastTaskClick = now;
        
        setTimeout(() => {
            if (Date.now() - this.lastTaskClick >= 250) {
                this.showTaskDetails(taskId);
            }
        }, 250);
    }

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.refreshView();
    }

    selectAllVisible() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            this.showToast('Aucune tâche à sélectionner', 'info');
            return;
        }

        const allSelected = filteredTasks.every(task => this.selectedTasks.has(task.id));
        
        if (allSelected) {
            filteredTasks.forEach(task => this.selectedTasks.delete(task.id));
            this.showToast('Toutes les tâches désélectionnées', 'info');
        } else {
            filteredTasks.forEach(task => this.selectedTasks.add(task.id));
            this.showToast(`${filteredTasks.length} tâche(s) sélectionnée(s)`, 'success');
        }
        
        this.refreshView();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.refreshView();
        this.showToast('Sélection effacée', 'info');
    }

    bulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const actions = [
            'Marquer comme terminé',
            'Changer la priorité',
            'Changer le statut',
            'Supprimer'
        ];
        
        const action = prompt(`Actions disponibles pour ${this.selectedTasks.size} tâche(s):\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nEntrez le numéro de l'action:`);
        
        if (!action) return;
        
        const actionIndex = parseInt(action) - 1;
        
        switch (actionIndex) {
            case 0: // Marquer comme terminé
                this.selectedTasks.forEach(taskId => {
                    window.taskManager.updateTask(taskId, { 
                        status: 'completed',
                        completedAt: new Date().toISOString()
                    });
                });
                this.showToast(`${this.selectedTasks.size} tâche(s) marquée(s) comme terminée(s)`, 'success');
                this.clearSelection();
                break;
                
            case 1: // Changer la priorité
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
                
            case 2: // Changer le statut
                const status = prompt('Nouveau statut:\n1. À faire\n2. En cours\n3. Relancé\n4. En attente\n5. Terminé\n\nEntrez le numéro:');
                const statuses = ['', 'todo', 'in-progress', 'relanced', 'waiting', 'completed'];
                if (status && statuses[parseInt(status)]) {
                    this.selectedTasks.forEach(taskId => {
                        const updates = { status: statuses[parseInt(status)] };
                        if (updates.status === 'completed') {
                            updates.completedAt = new Date().toISOString();
                        }
                        window.taskManager.updateTask(taskId, updates);
                    });
                    this.showToast(`Statut mis à jour pour ${this.selectedTasks.size} tâche(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 3: // Supprimer
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedTasks.size} tâche(s) ?\n\nCette action est irréversible.`)) {
                    this.selectedTasks.forEach(taskId => {
                        window.taskManager.deleteTask(taskId);
                    });
                    this.showToast(`${this.selectedTasks.size} tâche(s) supprimée(s)`, 'success');
                    this.clearSelection();
                }
                break;
        }
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { 
            status: 'completed',
            completedAt: new Date().toISOString()
        });
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

    refreshTasks() {
        this.refreshView();
        this.showToast('Tâches actualisées', 'success');
    }

    async copyReplyToClipboard(replyIndex, taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.suggestedReplies || !task.suggestedReplies[replyIndex]) return;

        const reply = task.suggestedReplies[replyIndex];
        const text = `Sujet: ${reply.subject}\n\n${reply.content}`;
        
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Réponse copiée dans le presse-papiers', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showToast('Erreur lors de la copie', 'error');
        }
    }

    useReply(taskId, replyIndex) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.suggestedReplies || !task.suggestedReplies[replyIndex]) return;

        const reply = task.suggestedReplies[replyIndex];
        const subject = reply.subject;
        const body = reply.content;
        const to = task.emailFrom;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.open(mailtoLink);
        
        window.taskManager.updateTask(taskId, { 
            emailReplied: true,
            needsReply: false,
            status: task.status === 'todo' ? 'in-progress' : task.status
        });
        
        this.showToast('Email de réponse ouvert dans votre client email', 'success');
        this.closeModal();
        this.refreshView();
    }

    // Filters
    quickFilter(filterId) {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
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
            case 'relanced':
            case 'waiting':
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
            search: '',
            sortBy: 'created'
        };
        
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        this.refreshView();
        this.showToast('Filtres réinitialisés', 'info');
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

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    // Utility Methods
    buildClientFilterOptions() {
        const tasks = window.taskManager.getAllTasks();
        const clients = new Set();
        
        tasks.forEach(task => {
            if (task.client) {
                clients.add(task.client);
            }
        });
        
        let options = `<option value="all">Tous les clients</option>`;
        
        Array.from(clients).sort().forEach(client => {
            const count = tasks.filter(t => t.client === client).length;
            options += `<option value="${client}">${client} (${count})</option>`;
        });
        
        return options;
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
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        // Mettre à jour les stats dans les pills
        const stats = window.taskManager.getStats();
        document.querySelectorAll('.status-filters').forEach(container => {
            container.innerHTML = this.buildStatusPills(stats);
        });
        
        // Mettre à jour l'affichage des actions de sélection
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        const selectedCount = this.selectedTasks.size;
        const mainActionsDiv = document.querySelector('.main-actions');
        
        if (mainActionsDiv) {
            const existingPanel = mainActionsDiv.querySelector('.selection-panel');
            
            if (selectedCount > 0) {
                const selectionHTML = `
                    <div class="selection-panel">
                        <span class="selection-count">${selectedCount} sélectionné(s)</span>
                        <button class="btn-action btn-clear" onclick="window.tasksView.clearSelection()" title="Effacer sélection">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn-action btn-bulk" onclick="window.tasksView.bulkActions()" title="Actions groupées">
                            Actions
                            <span class="count-badge">${selectedCount}</span>
                        </button>
                    </div>
                `;
                
                if (existingPanel) {
                    existingPanel.outerHTML = selectionHTML;
                } else {
                    mainActionsDiv.insertAdjacentHTML('afterbegin', selectionHTML);
                }
            } else {
                if (existingPanel) {
                    existingPanel.remove();
                }
            }
        }
    }

    closeModal(modalId) {
        if (modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.remove();
        } else {
            document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        }
        document.body.style.overflow = 'auto';
    }

    showToast(message, type = 'info') {
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation' : 'info'}-circle"></i>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.currentFilters.search) {
            title = 'Aucun résultat trouvé';
            text = `Aucune tâche ne correspond à votre recherche "${this.currentFilters.search}"`;
            action = `
                <button class="btn-action btn-primary" onclick="window.tasksView.clearSearch()">
                    <i class="fas fa-undo"></i>
                    Effacer la recherche
                </button>
            `;
        } else if (this.hasActiveFilters()) {
            title = 'Aucune tâche trouvée';
            text = 'Aucune tâche ne correspond à vos critères de filtrage.';
            action = `
                <button class="btn-action btn-primary" onclick="window.tasksView.resetAllFilters()">
                    <i class="fas fa-undo"></i>
                    Réinitialiser les filtres
                </button>
            `;
        } else {
            title = 'Aucune tâche';
            text = 'Vous n\'avez aucune tâche pour le moment.';
            action = `
                <button class="btn-action btn-primary" onclick="window.tasksView.showCreateModal()">
                    <i class="fas fa-plus"></i>
                    Créer votre première tâche
                </button>
            `;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-text">${text}</p>
                ${action}
            </div>
        `;
    }

    hasActiveFilters() {
        return this.currentFilters.status !== 'all' ||
               this.currentFilters.priority !== 'all' ||
               this.currentFilters.category !== 'all' ||
               this.currentFilters.client !== 'all' ||
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply;
    }

    isFilterActive(filterId) {
        switch (filterId) {
            case 'all': return this.currentFilters.status === 'all' && !this.currentFilters.overdue && !this.currentFilters.needsReply;
            case 'todo':
            case 'in-progress':
            case 'completed':
            case 'relanced':
            case 'waiting':
                return this.currentFilters.status === filterId;
            case 'overdue': return this.currentFilters.overdue;
            case 'needsReply': return this.currentFilters.needsReply;
            default: return false;
        }
    }

    getChecklistProgress(task) {
        if (!task.checklist || task.checklist.length === 0) return '';
        const completed = task.checklist.filter(item => item.completed).length;
        return `${completed}/${task.checklist.length}`;
    }

    formatDescription(description) {
        if (!description) return '';
        
        if (description.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
            return `<div class="structured-description">${description.replace(/\n/g, '<br>')}</div>`;
        } else {
            return `<div class="simple-description">${this.escapeHtml(description).replace(/\n/g, '<br>')}</div>`;
        }
    }

    formatEmailContent(content) {
        if (!content) return '<p>Contenu non disponible</p>';
        
        const formattedContent = content
            .replace(/\n/g, '<br>')
            .replace(/Email de:/g, '<strong>Email de:</strong>')
            .replace(/Date:/g, '<strong>Date:</strong>')
            .replace(/Sujet:/g, '<strong>Sujet:</strong>');
            
        return `<div class="email-original-content">${formattedContent}</div>`;
    }

    formatDeadline(deadline) {
        if (!deadline) return '';
        
        try {
            const deadlineDate = new Date(deadline);
            const now = new Date();
            const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                return `Échue il y a ${Math.abs(diffDays)}j`;
            } else if (diffDays === 0) {
                return 'Aujourd\'hui';
            } else if (diffDays === 1) {
                return 'Demain';
            } else if (diffDays <= 7) {
                return `${diffDays}j`;
            } else {
                return deadlineDate.toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short' 
                });
            }
        } catch (error) {
            return deadline;
        }
    }

    formatDueDate(dateString) {
        if (!dateString) {
            return { 
                html: '', 
                text: '', 
                className: 'no-deadline' 
            };
        }
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        let className = 'deadline-normal';
        let text = '';
        
        if (diffDays < 0) {
            className = 'deadline-overdue';
            text = `En retard de ${Math.abs(diffDays)}j`;
        } else if (diffDays === 0) {
            className = 'deadline-today';
            text = 'Aujourd\'hui';
        } else if (diffDays === 1) {
            className = 'deadline-tomorrow';
            text = 'Demain';
        } else if (diffDays <= 7) {
            className = 'deadline-week';
            text = `${diffDays}j`;
        } else {
            text = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
        
        return {
            html: `<span class="deadline-badge ${className}">📅 ${text}</span>`,
            text: text,
            className: className
        };
    }

    getPriorityIcon(priority) {
        const icons = { urgent: '🚨', high: '⚡', medium: '📌', low: '📄' };
        return icons[priority] || '📌';
    }

    getPriorityColor(priority) {
        const colors = { urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#10b981' };
        return colors[priority] || '#3b82f6';
    }

    getPriorityLabel(priority) {
        const labels = { urgent: 'Urgente', high: 'Haute', medium: 'Normale', low: 'Basse' };
        return labels[priority] || 'Normale';
    }

    getStatusIcon(status) {
        const icons = { 
            todo: '⏳', 
            'in-progress': '🔄', 
            completed: '✅',
            relanced: '📨',
            waiting: '⌛'
        };
        return icons[status] || '⏳';
    }

    getStatusLabel(status) {
        const labels = { 
            todo: 'À faire', 
            'in-progress': 'En cours', 
            completed: 'Terminé',
            relanced: 'Relancé',
            waiting: 'En attente'
        };
        return labels[status] || 'À faire';
    }

    getReplyToneIcon(tone) {
        const icons = {
            professionnel: '👔',
            formel: '👔',
            informel: '😊',
            urgent: '🚨',
            neutre: '📝',
            amical: '🤝',
            détaillé: '📋'
        };
        return icons[tone] || '📝';
    }

    getReplyToneLabel(tone) {
        const labels = {
            professionnel: 'Professionnel',
            formel: 'Formel',
            informel: 'Informel',
            urgent: 'Urgent',
            neutre: 'Neutre',
            amical: 'Amical',
            détaillé: 'Détaillé'
        };
        return labels[tone] || 'Neutre';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addStyles() {
        if (document.getElementById('taskManagerStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'taskManagerStyles';
        styles.textContent = `
            /* Variables CSS pour TaskManager v11 */
            :root {
                --primary-color: #3b82f6;
                --primary-hover: #2563eb;
                --success-color: #10b981;
                --warning-color: #f59e0b;
                --danger-color: #ef4444;
                --text-primary: #1f2937;
                --text-secondary: #6b7280;
                --bg-primary: #ffffff;
                --bg-secondary: #f8fafc;
                --border-color: #e5e7eb;
                --border-radius: 8px;
                --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
                --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
                --transition: all 0.2s ease;
            }

            .tasks-page-corrected {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 16px;
                font-size: 14px;
            }

            /* RECTANGLE BLANC PRINCIPAL - 2 LIGNES */
            .controls-section-corrected {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            /* LIGNE 1 */
            .main-controls-line {
                display: flex;
                align-items: center;
                gap: 20px;
                width: 100%;
            }

            .search-section {
                flex: 1;
                max-width: 400px;
            }

            .search-box-corrected {
                position: relative;
                display: flex;
                align-items: center;
                height: 44px;
            }

            .search-input-corrected {
                width: 100%;
                height: 44px;
                padding: 0 16px 0 44px;
                border: 2px solid var(--border-color);
                border-radius: 10px;
                font-size: 14px;
                background: white;
                transition: var(--transition);
                outline: none;
            }

            .search-input-corrected:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .search-icon {
                position: absolute;
                left: 16px;
                color: var(--text-secondary);
                pointer-events: none;
                z-index: 1;
            }

            .search-clear {
                position: absolute;
                right: 12px;
                background: var(--danger-color);
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
                transition: var(--transition);
            }

            .search-clear:hover {
                background: #dc2626;
                transform: scale(1.1);
            }

            .main-actions {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }

            .selection-panel {
                display: flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: 8px;
                padding: 8px 12px;
                color: #1e40af;
                font-weight: 600;
                font-size: 13px;
            }

            .btn-action {
                height: 44px;
                padding: 0 16px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: white;
                color: var(--text-primary);
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                white-space: nowrap;
                position: relative;
            }

            .btn-action:hover {
                background: var(--bg-secondary);
                border-color: var(--primary-color);
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }

            .btn-action.btn-new {
                background: linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%);
                color: white;
                border-color: transparent;
            }

            .btn-action.btn-new:hover {
                background: linear-gradient(135deg, var(--primary-hover) 0%, #5856eb 100%);
            }

            .btn-action.btn-bulk {
                background: var(--success-color);
                color: white;
                border-color: transparent;
            }

            .btn-action.btn-bulk:hover {
                background: #059669;
            }

            .btn-action.btn-clear {
                width: 44px;
                padding: 0;
                background: var(--bg-secondary);
                color: var(--text-secondary);
            }

            .btn-action.btn-clear:hover {
                background: var(--danger-color);
                color: white;
            }

            .btn-action.btn-filters.active {
                background: #eff6ff;
                color: var(--primary-color);
                border-color: var(--primary-color);
            }

            .count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--danger-color);
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 16px;
                text-align: center;
                border: 2px solid white;
            }

            /* LIGNE 2 */
            .views-filters-line {
                display: flex;
                align-items: center;
                gap: 20px;
                width: 100%;
            }

            .view-modes {
                display: flex;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 3px;
                gap: 2px;
                flex-shrink: 0;
            }

            .view-mode {
                padding: 8px 16px;
                border: none;
                background: transparent;
                color: var(--text-secondary);
                border-radius: 6px;
                cursor: pointer;
                transition: var(--transition);
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
            }

            .view-mode:hover {
                background: rgba(255, 255, 255, 0.8);
                color: var(--text-primary);
            }

            .view-mode.active {
                background: white;
                color: var(--text-primary);
                box-shadow: var(--shadow-sm);
            }

            .status-filters {
                display: flex;
                gap: 8px;
                flex: 1;
                flex-wrap: wrap;
                justify-content: center;
            }

            .status-pill {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                cursor: pointer;
                transition: var(--transition);
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary);
                min-width: 100px;
                justify-content: space-between;
            }

            .status-pill:hover {
                border-color: var(--primary-color);
                background: #f0f9ff;
                transform: translateY(-1px);
                box-shadow: var(--shadow-sm);
            }

            .status-pill.active {
                background: linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%);
                color: white;
                border-color: var(--primary-color);
                box-shadow: var(--shadow-md);
            }

            .status-pill.active .pill-count {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }

            .pill-icon {
                font-size: 14px;
            }

            .pill-text {
                flex: 1;
                text-align: center;
                font-size: 11px;
            }

            .pill-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
                min-width: 20px;
                text-align: center;
            }

            /* FILTRES AVANCÉS */
            .advanced-filters-panel {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                margin-bottom: 16px;
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
                opacity: 0;
            }

            .advanced-filters-panel.show {
                max-height: 200px;
                opacity: 1;
                padding: 20px;
            }

            .advanced-filters-grid {
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

            .filter-label {
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 600;
                font-size: 12px;
                color: var(--text-primary);
            }

            .filter-select {
                height: 44px;
                padding: 0 12px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: white;
                font-size: 13px;
                color: var(--text-primary);
                cursor: pointer;
                transition: var(--transition);
            }

            .filter-select:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }

            .btn-reset {
                background: var(--bg-secondary);
                color: var(--text-secondary);
            }

            .btn-reset:hover {
                background: var(--border-color);
                color: var(--text-primary);
            }

            /* CONTENEUR DES TÂCHES */
            .tasks-container {
                background: transparent;
            }

            /* VUE MINIMALE */
            .tasks-minimal-list {
                display: flex;
                flex-direction: column;
                gap: 2px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow-sm);
            }

            .task-minimal {
                background: white;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: var(--transition);
            }

            .task-minimal:last-child {
                border-bottom: none;
            }

            .task-minimal:hover {
                background: var(--bg-secondary);
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }

            .task-minimal.selected {
                background: #eff6ff;
                border-left: 3px solid var(--primary-color);
            }

            .task-minimal.completed {
                opacity: 0.6;
            }

            .task-minimal.completed .task-title {
                text-decoration: line-through;
            }

            .task-content-line {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                gap: 12px;
                height: 56px;
            }

            .task-checkbox {
                width: 18px;
                height: 18px;
                cursor: pointer;
                flex-shrink: 0;
            }

            .task-info {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 16px;
                min-width: 0;
            }

            .task-title {
                font-weight: 600;
                color: var(--text-primary);
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 2;
            }

            .task-client {
                font-size: 12px;
                color: var(--text-secondary);
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            }

            .task-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
            }

            .checklist-progress {
                font-size: 12px;
                color: var(--text-secondary);
                font-weight: 500;
            }

            .task-deadline {
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
            }

            .task-deadline.deadline-overdue {
                color: var(--danger-color);
                font-weight: 600;
            }

            .task-deadline.deadline-today {
                color: var(--warning-color);
                font-weight: 600;
            }

            .task-deadline.deadline-tomorrow {
                color: var(--warning-color);
            }

            .task-deadline.deadline-week {
                color: var(--primary-color);
            }

            .task-deadline.deadline-normal {
                color: var(--text-secondary);
            }

            .task-deadline.no-deadline {
                color: #9ca3af;
                font-style: italic;
            }

            .task-actions {
                display: flex;
                gap: 4px;
                flex-shrink: 0;
            }

            .action-btn {
                width: 32px;
                height: 32px;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                background: white;
                color: var(--text-secondary);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
                font-size: 12px;
            }

            .action-btn:hover {
                background: var(--bg-secondary);
                border-color: var(--text-secondary);
                transform: translateY(-1px);
            }

            .action-btn.complete:hover {
                background: #dcfce7;
                border-color: var(--success-color);
                color: var(--success-color);
            }

            .action-btn.relance:hover {
                background: #f3e8ff;
                border-color: #8b5cf6;
                color: #8b5cf6;
            }

            .action-btn.edit:hover {
                background: #fef3c7;
                border-color: var(--warning-color);
                color: var(--warning-color);
            }

            .action-btn.details:hover {
                background: #f3e8ff;
                border-color: #8b5cf6;
                color: #8b5cf6;
            }

            .action-btn.reply:hover {
                background: #eff6ff;
                border-color: var(--primary-color);
                color: var(--primary-color);
            }

            /* VUE NORMALE */
            .tasks-normal-list {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            .task-normal {
                background: rgba(255, 255, 255, 0.95);
                border-bottom: 1px solid var(--border-color);
                cursor: pointer;
                transition: var(--transition);
            }

            .task-normal:first-child {
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }

            .task-normal:last-child {
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
                border-bottom: none;
            }

            .task-normal:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
                border-color: rgba(59, 130, 246, 0.2);
                z-index: 1;
                position: relative;
            }

            .task-normal.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid var(--primary-color);
                z-index: 2;
                position: relative;
            }

            .task-normal.completed {
                opacity: 0.75;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            }

            .task-normal.completed .task-title {
                text-decoration: line-through;
                color: var(--text-secondary);
            }

            .task-normal .task-content-line {
                padding: 16px;
                height: 72px;
            }

            .priority-bar {
                width: 4px;
                height: 48px;
                border-radius: 2px;
                margin-right: 12px;
                flex-shrink: 0;
            }

            .task-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-width: 0;
            }

            .task-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .task-normal .task-title {
                font-size: 15px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            }

            .task-badges {
                display: flex;
                gap: 6px;
                flex-shrink: 0;
            }

            .status-badge {
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                white-space: nowrap;
            }

            .status-badge.todo {
                background: #fef3c7;
                color: #d97706;
            }

            .status-badge.in-progress {
                background: #eff6ff;
                color: #2563eb;
            }

            .status-badge.completed {
                background: #f0fdf4;
                color: #16a34a;
            }

            .status-badge.relanced {
                background: #f3e8ff;
                color: #8b5cf6;
            }

            .status-badge.waiting {
                background: #fee2e2;
                color: #dc2626;
            }

            .relance-badge {
                background: #f3e8ff;
                color: #8b5cf6;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }

            .task-details {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 12px;
                color: var(--text-secondary);
            }

            .checklist-info {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            /* VUE DÉTAILLÉE */
            .tasks-detailed-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 16px;
            }

            .task-detailed {
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 16px;
                transition: var(--transition);
                box-shadow: var(--shadow-sm);
                display: flex;
                flex-direction: column;
                min-height: 200px;
            }

            .task-detailed:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
                border-color: rgba(59, 130, 246, 0.3);
            }

            .task-detailed.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-color: var(--primary-color);
            }

            .task-detailed.completed {
                opacity: 0.8;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            }

            .task-detailed-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            }

            .task-badges-group {
                display: flex;
                gap: 6px;
                flex: 1;
            }

            .priority-badge {
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }

            .priority-badge.urgent {
                background: #fef2f2;
                color: #dc2626;
            }

            .priority-badge.high {
                background: #fef3c7;
                color: #d97706;
            }

            .priority-badge.medium {
                background: #eff6ff;
                color: #2563eb;
            }

            .priority-badge.low {
                background: #f0fdf4;
                color: #16a34a;
            }

            .task-detailed-content {
                flex: 1;
                margin-bottom: 12px;
            }

            .task-detailed .task-title {
                font-size: 16px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 8px 0;
                line-height: 1.3;
                cursor: pointer;
                transition: color 0.2s ease;
            }

            .task-detailed .task-title:hover {
                color: var(--primary-color);
            }

            .task-description {
                font-size: 13px;
                color: var(--text-secondary);
                line-height: 1.5;
                margin: 0 0 12px 0;
            }

            .task-meta-grid {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                font-weight: 500;
            }

            .meta-item.deadline-centered {
                flex: 1;
                text-align: center;
                justify-content: center;
            }

            .task-detailed-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .btn-detailed {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                border: 1px solid;
                white-space: nowrap;
            }

            .btn-detailed.complete {
                background: var(--success-color);
                color: white;
                border-color: var(--success-color);
            }

            .btn-detailed.complete:hover {
                background: #059669;
                border-color: #059669;
            }

            .btn-detailed.edit {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }

            .btn-detailed.edit:hover {
                background: var(--primary-hover);
                border-color: var(--primary-hover);
            }

            .btn-detailed.details {
                background: var(--bg-secondary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }

            .btn-detailed.details:hover {
                background: var(--border-color);
                border-color: var(--text-secondary);
            }

            /* ÉTAT VIDE */
            .empty-state {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 16px;
                box-shadow: var(--shadow-sm);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }

            .empty-state-title {
                font-size: 20px;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 12px;
            }

            .empty-state-text {
                font-size: 14px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: var(--text-secondary);
            }

            /* MODALES */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.75);
                z-index: 99999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                backdrop-filter: blur(4px);
            }
            
            .modal-container {
                background: white;
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }
            
            .modal-container.modal-large {
                max-width: 1000px;
            }
            
            .modal-header {
                padding: 24px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: var(--text-secondary);
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
            }
            
            .modal-close:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
            
            .modal-content {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 24px;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            .btn-modal {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                border: 1px solid;
                white-space: nowrap;
            }
            
            .btn-modal.btn-primary {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .btn-modal.btn-primary:hover {
                background: var(--primary-hover);
                border-color: var(--primary-hover);
                transform: translateY(-1px);
            }
            
            .btn-modal.btn-secondary {
                background: var(--bg-secondary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }
            
            .btn-modal.btn-secondary:hover {
                background: var(--border-color);
                border-color: var(--text-secondary);
            }
            
            .btn-modal.btn-success {
                background: var(--success-color);
                color: white;
                border-color: var(--success-color);
            }
            
            .btn-modal.btn-success:hover {
                background: #059669;
                border-color: #059669;
                transform: translateY(-1px);
            }
            
            .btn-modal.btn-info {
                background: #0ea5e9;
                color: white;
                border-color: #0ea5e9;
            }
            
            .btn-modal.btn-info:hover {
                background: #0284c7;
                border-color: #0284c7;
                transform: translateY(-1px);
            }

            /* FORMULAIRES */
            .edit-form,
            .create-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            .form-row .form-group:only-child {
                grid-column: 1 / -1;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            
            .form-group label {
                font-weight: 600;
                color: var(--text-primary);
                font-size: 14px;
            }
            
            .form-input,
            .form-select,
            .form-textarea {
                padding: 12px 16px;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-size: 14px;
                background: white;
                transition: border-color 0.2s ease;
                font-family: inherit;
            }
            
            .form-input:focus,
            .form-select:focus,
            .form-textarea:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-textarea {
                resize: vertical;
                min-height: 80px;
                font-family: inherit;
            }
            
            .form-section {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
            }
            
            .form-section h3 {
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .email-info-readonly {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 16px;
                font-size: 14px;
                color: var(--text-primary);
            }
            
            .email-info-readonly > div {
                margin-bottom: 8px;
            }
            
            .email-info-readonly > div:last-child {
                margin-bottom: 0;
            }

            /* CHECKLIST */
            .checklist-section {
                margin-top: 20px;
                padding: 16px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
            }

            .checklist-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .checklist-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0;
            }

            .btn-add-checklist {
                padding: 6px 12px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: var(--transition);
            }

            .btn-add-checklist:hover {
                background: var(--primary-hover);
                transform: translateY(-1px);
            }

            .checklist-items {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .checklist-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                transition: var(--transition);
            }

            .checklist-item:hover {
                border-color: var(--primary-color);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .checklist-item input[type="checkbox"] {
                width: 16px;
                height: 16px;
                cursor: pointer;
                flex-shrink: 0;
            }

            .checklist-item input[type="text"] {
                flex: 1;
                border: none;
                background: transparent;
                font-size: 14px;
                color: var(--text-primary);
                outline: none;
            }

            .checklist-item.completed input[type="text"] {
                text-decoration: line-through;
                color: var(--text-secondary);
            }

            .checklist-remove {
                background: none;
                border: none;
                color: var(--danger-color);
                cursor: pointer;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.2s;
                padding: 4px;
            }

            .checklist-item:hover .checklist-remove {
                opacity: 1;
            }

            .checklist-detail-items {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .checklist-detail-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 6px;
            }

            .checklist-detail-item.completed {
                opacity: 0.7;
            }

            .checklist-detail-item.completed span {
                text-decoration: line-through;
                color: var(--text-secondary);
            }

            /* DÉTAILS DES TÂCHES */
            .task-details-content {
                max-width: none;
            }
            
            .details-header {
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .task-title-details {
                font-size: 24px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 12px 0;
                line-height: 1.3;
            }
            
            .task-meta-badges {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .priority-badge-details,
            .status-badge-details,
            .deadline-badge-details,
            .relance-badge-details {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
            }
            
            .priority-badge-details.priority-urgent {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .priority-badge-details.priority-high {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .priority-badge-details.priority-medium {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .priority-badge-details.priority-low {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .status-badge-details.status-todo {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .status-badge-details.status-in-progress {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .status-badge-details.status-completed {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .status-badge-details.status-relanced {
                background: #f3e8ff;
                color: #8b5cf6;
                border: 1px solid #e9d5ff;
            }
            
            .status-badge-details.status-waiting {
                background: #fee2e2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .deadline-badge-details.deadline-overdue {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .deadline-badge-details.deadline-today {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .deadline-badge-details.deadline-tomorrow {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .deadline-badge-details.deadline-week {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .deadline-badge-details.deadline-normal {
                background: var(--bg-secondary);
                color: #64748b;
                border: 1px solid var(--border-color);
            }
            
            .deadline-badge-details.no-deadline {
                background: var(--bg-secondary);
                color: #9ca3af;
                border: 1px solid #d1d5db;
                font-style: italic;
            }
            
            .relance-badge-details {
                background: #f3e8ff;
                color: #8b5cf6;
                border: 1px solid #e9d5ff;
            }
            
            .details-section {
                margin-bottom: 24px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
            
            .details-section h3 {
                margin: 0;
                padding: 16px 20px;
                background: white;
                border-bottom: 1px solid var(--border-color);
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .description-content {
                padding: 16px 20px;
            }
            
            .structured-description {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 13px;
                line-height: 1.6;
                background: white;
                padding: 16px;
                border-radius: 6px;
                border: 1px solid var(--border-color);
            }
            
            .simple-description {
                font-size: 14px;
                line-height: 1.6;
                color: var(--text-primary);
            }
            
            .info-grid {
                padding: 16px 20px;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                color: var(--text-primary);
                line-height: 1.4;
            }
            
            .info-item strong {
                min-width: 120px;
                color: var(--text-primary);
            }
            
            .email-details-grid {
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .email-detail-item {
                display: flex;
                gap: 12px;
                font-size: 14px;
            }
            
            .email-detail-item strong {
                min-width: 80px;
                color: var(--text-primary);
            }
            
            .email-content-section {
                padding: 16px 20px;
            }
            
            .email-content-section h4 {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .email-content-box {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 16px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .email-content-viewer {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            
            .email-original-content {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: var(--text-primary);
                white-space: pre-wrap;
            }
            
            .email-original-content strong {
                color: var(--text-primary);
                font-weight: 600;
            }
            
            .actions-list-details {
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .action-item-details {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                background: white;
                border-radius: 6px;
                border: 1px solid var(--border-color);
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
            
            .action-text {
                flex: 1;
                font-size: 14px;
                color: var(--text-primary);
            }
            
            .action-deadline {
                font-size: 12px;
                color: #dc2626;
                font-weight: 600;
                background: #fef2f2;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #fecaca;
            }
            
            .key-info-grid {
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .key-info-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 14px;
                color: var(--text-primary);
                line-height: 1.4;
            }

            /* COMMENTAIRES */
            .comments-list {
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .comment-item {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 12px;
            }

            .comment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 12px;
                color: var(--text-secondary);
            }

            .comment-date {
                font-size: 11px;
            }

            .comment-text {
                font-size: 14px;
                color: var(--text-primary);
                line-height: 1.5;
            }

            .no-comments {
                text-align: center;
                color: var(--text-secondary);
                font-style: italic;
                padding: 20px;
            }

            .add-comment-form {
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            /* SUGGESTIONS DE RÉPONSE */
            .ai-suggestions-info {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 1px solid #7dd3fc;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .ai-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: #0ea5e9;
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .ai-suggestions-info p {
                margin: 0;
                color: #075985;
                font-size: 14px;
            }
            
            .replies-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .reply-suggestion-card {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 16px;
                transition: var(--transition);
            }
            
            .reply-suggestion-card:hover {
                border-color: var(--primary-color);
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
            }
            
            .reply-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .reply-tone-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                text-transform: capitalize;
            }
            
            .reply-tone-badge.professionnel,
            .reply-tone-badge.formel {
                background: var(--bg-secondary);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
            }
            
            .reply-tone-badge.urgent {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .reply-tone-badge.neutre {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .reply-tone-badge.amical {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .reply-tone-badge.détaillé {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .reply-card-actions {
                display: flex;
                gap: 8px;
            }
            
            .btn-sm {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition);
                border: 1px solid;
            }
            
            .btn-sm.btn-secondary {
                background: var(--bg-secondary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }
            
            .btn-sm.btn-secondary:hover {
                background: var(--border-color);
                border-color: var(--text-secondary);
            }
            
            .btn-sm.btn-primary {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .btn-sm.btn-primary:hover {
                background: var(--primary-hover);
                border-color: var(--primary-hover);
                transform: translateY(-1px);
            }
            
            .reply-subject-line {
                font-size: 13px;
                color: #4b5563;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .reply-content-preview {
                font-size: 13px;
                color: var(--text-primary);
                line-height: 1.6;
                white-space: pre-wrap;
                background: var(--bg-secondary);
                padding: 12px;
                border-radius: 6px;
                border: 1px solid var(--border-color);
                max-height: 150px;
                overflow-y: auto;
            }

            /* TOAST */
            .toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 16px 24px;
                background: var(--text-primary);
                color: white;
                border-radius: 8px;
                box-shadow: var(--shadow-md);
                display: flex;
                align-items: center;
                gap: 12px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                z-index: 100000;
            }

            .toast.show {
                opacity: 1;
                transform: translateX(0);
            }

            .toast.success {
                background: var(--success-color);
            }

            .toast.error {
                background: var(--danger-color);
            }

            .toast.warning {
                background: var(--warning-color);
            }

            .toast.info {
                background: var(--primary-color);
            }

            /* RESPONSIVE */
            @media (max-width: 1024px) {
                .main-controls-line {
                    flex-direction: column;
                    gap: 12px;
                    align-items: stretch;
                }

                .search-section {
                    max-width: none;
                }

                .main-actions {
                    justify-content: center;
                    width: 100%;
                }

                .views-filters-line {
                    flex-direction: column;
                    gap: 12px;
                    align-items: stretch;
                }

                .view-modes {
                    align-self: center;
                }

                .status-filters {
                    justify-content: center;
                }

                .status-pill {
                    min-width: 90px;
                }

                .tasks-detailed-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .controls-section-corrected {
                    padding: 16px;
                }

                .task-content-line {
                    padding: 12px;
                    height: auto;
                    min-height: 56px;
                }

                .task-info {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }

                .task-normal .task-content-line {
                    height: auto;
                    min-height: 72px;
                }

                .task-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }

                .task-badges {
                    align-self: flex-end;
                }

                .main-actions {
                    flex-direction: column;
                    gap: 8px;
                }

                .selection-panel {
                    justify-content: center;
                }

                .status-filters {
                    flex-direction: column;
                    gap: 6px;
                }

                .status-pill {
                    min-width: auto;
                    width: 100%;
                    justify-content: space-between;
                }

                .modal-container {
                    margin: 0;
                    max-height: 100vh;
                    border-radius: 0;
                }
            }

            @media (max-width: 480px) {
                .tasks-page-corrected {
                    padding: 8px;
                }

                .controls-section-corrected {
                    padding: 12px;
                    gap: 12px;
                }

                .btn-action {
                    height: 40px;
                    font-size: 12px;
                    padding: 0 12px;
                }

                .task-content-line {
                    padding: 8px;
                    gap: 8px;
                }

                .task-actions {
                    flex-direction: column;
                    gap: 2px;
                }

                .action-btn {
                    width: 28px;
                    height: 28px;
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
// Initialisation
// =====================================

function initializeTaskManagerV11() {
    console.log('[TaskManager] Initializing v11...');
    
    if (!window.taskManager || !window.taskManager.initialized) {
        window.taskManager = new TaskManager();
    }
    
    if (!window.tasksView) {
        window.tasksView = new TasksView();
    }
    
    // Bind methods pour éviter les erreurs de contexte
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
    
    // IMPORTANT: S'assurer que les méthodes sont accessibles globalement pour les onclick
    window.tasksView.showEmailAttachModal = window.tasksView.showEmailAttachModal.bind(window.tasksView);
    window.tasksView.toggleEmailFields = window.tasksView.toggleEmailFields.bind(window.tasksView);
    window.tasksView.searchEmails = window.tasksView.searchEmails.bind(window.tasksView);
    window.tasksView.parseEmailContent = window.tasksView.parseEmailContent.bind(window.tasksView);
    window.tasksView.attachEmail = window.tasksView.attachEmail.bind(window.tasksView);
    window.tasksView.removeAttachedEmail = window.tasksView.removeAttachedEmail.bind(window.tasksView);
    window.tasksView.selectEmailResult = window.tasksView.selectEmailResult.bind(window.tasksView);
    
    // IMPORTANT: Chercher et utiliser le conteneur existant pour l'affichage
    const renderTasksView = () => {
        // Chercher le conteneur des tâches (même logique que l'original)
        let container = document.querySelector('#tasksContainer');
        
        // Si pas trouvé, chercher dans la zone principale
        if (!container) {
            container = document.querySelector('.content-area');
        }
        
        // Si pas trouvé, chercher le main content
        if (!container) {
            container = document.querySelector('#mainContent');
        }
        
        // Si pas trouvé, utiliser le body avec un conteneur
        if (!container) {
            const body = document.body;
            // Vérifier si on n'a pas déjà créé le conteneur
            container = document.getElementById('taskManagerContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'taskManagerContainer';
                container.style.cssText = 'width: 100%; min-height: 100vh;';
                body.appendChild(container);
            }
        }
        
        // Rendre l'interface des tâches
        if (container) {
            window.tasksView.render(container);
            console.log('✅ TaskManager v11 interface rendered');
        } else {
            console.error('❌ No container found for TaskManager');
        }
    };
    
    // Attendre que le taskManager soit initialisé
    const checkAndRender = () => {
        if (window.taskManager && window.taskManager.initialized) {
            renderTasksView();
        } else {
            setTimeout(checkAndRender, 100);
        }
    };
    
    checkAndRender();
    
    console.log('✅ TaskManager v11 loaded - Version optimisée avec checklist et statuts étendus');
}

// Fonction pour afficher manuellement les tâches (si besoin)
window.showTasks = function() {
    const container = document.querySelector('#mainContent') || document.querySelector('.content-area') || document.body;
    if (window.tasksView && container) {
        window.tasksView.render(container);
    }
};

// Initialisation immédiate ET sur DOMContentLoaded
initializeTaskManagerV11();

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TaskManager] DOM ready, ensuring initialization...');
    initializeTaskManagerV11();
});

// Fallback sur window.load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TaskManager] Fallback initialization...');
            initializeTaskManagerV11();
        }
    }, 1000);
});
