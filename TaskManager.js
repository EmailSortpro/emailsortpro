// TaskManager Pro v8.0 - Style PageManager Moderne
// Interface inspirée du PageManager avec design minimaliste et moderne

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
            console.log('[TaskManager] Initializing v8.0 - Modern PageManager Style...');
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
                description: '📧 RÉSUMÉ EXÉCUTIF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDe: Sarah Martin (acme-corp.com)\nObjet: Demande de validation pour la campagne marketing Q2\n📮 Réponse attendue\n\n🎯 ACTIONS REQUISES:\n1. Valider les visuels de la campagne\n2. Confirmer le budget alloué\n3. Définir les dates de lancement\n\n💡 INFORMATIONS CLÉS:\n• Budget proposé : 50k€\n• Cible : 25-45 ans\n• Canaux : LinkedIn, Google Ads\n\n⚠️ POINTS D\'ATTENTION:\n• Deadline serrée pour le lancement\n• Coordination avec l\'équipe commerciale requise',
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
                createdAt: new Date(Date.now() - 86400000).toISOString(), // Hier
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                needsReply: true,
                dueDate: '2025-06-08',
                summary: 'Validation urgente de la campagne marketing Q2 avec budget de 50k€',
                actions: [
                    { text: 'Valider les visuels de la campagne', deadline: null },
                    { text: 'Confirmer le budget alloué', deadline: '2025-06-07' },
                    { text: 'Définir les dates de lancement', deadline: null }
                ],
                keyInfo: [
                    'Budget proposé : 50k€',
                    'Cible : 25-45 ans',
                    'Canaux : LinkedIn, Google Ads'
                ],
                risks: [
                    'Deadline serrée pour le lancement',
                    'Coordination avec l\'équipe commerciale requise'
                ],
                method: 'ai'
            },
            {
                id: 'sample_2',
                title: 'Finaliser le contrat avec TechStart Solutions',
                description: '📧 RÉSUMÉ EXÉCUTIF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDe: Michel Dubois (techstart.fr)\nObjet: Finalisation contrat - Derniers ajustements\n\n🎯 ACTIONS REQUISES:\n1. Relire les clauses de confidentialité\n2. Valider les conditions de paiement\n3. Organiser la signature électronique\n\n💡 INFORMATIONS CLÉS:\n• Montant du contrat : 75k€\n• Durée : 12 mois\n• Date de démarrage prévue : 15 juin',
                priority: 'urgent',
                status: 'in-progress',
                category: 'client',
                hasEmail: true,
                emailFrom: 'michel.dubois@techstart.fr',
                emailFromName: 'Michel Dubois',
                emailSubject: 'Finalisation contrat - Derniers ajustements',
                emailDate: '2025-06-06T14:30:00Z',
                emailDomain: 'techstart.fr',
                tags: ['contrat', 'signature', 'techstart'],
                client: 'TechStart Solutions',
                createdAt: new Date(Date.now() - 43200000).toISOString(), // 12h
                updatedAt: new Date(Date.now() - 43200000).toISOString(),
                needsReply: false,
                dueDate: '2025-06-07',
                summary: 'Finalisation urgente du contrat de 75k€ avec TechStart Solutions',
                method: 'ai'
            },
            {
                id: 'sample_3',
                title: 'Préparer la présentation pour l\'investisseur',
                description: 'Création d\'une présentation complète pour le meeting avec l\'investisseur prévu vendredi.',
                priority: 'medium',
                status: 'todo',
                category: 'project',
                hasEmail: false,
                tags: ['présentation', 'investisseur', 'pitch'],
                client: 'Interne',
                createdAt: new Date(Date.now() - 7200000).toISOString(), // 2h
                updatedAt: new Date(Date.now() - 7200000).toISOString(),
                needsReply: false,
                dueDate: '2025-06-09',
                method: 'manual'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    createTaskFromEmail(taskData, email) {
        const task = {
            id: taskData.id || this.generateId(),
            title: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'email',
            
            // Email info - COMPLET
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || email?.from?.emailAddress?.address,
            emailFromName: taskData.emailFromName || email?.from?.emailAddress?.name,
            emailSubject: taskData.emailSubject || email?.subject,
            emailContent: this.getEmailContent(email),
            emailDomain: taskData.emailDomain || (taskData.emailFrom ? taskData.emailFrom.split('@')[1] : ''),
            hasEmail: true,
            emailReplied: false,
            emailDate: taskData.emailDate || email?.receivedDateTime,
            needsReply: taskData.needsReply || false,
            hasAttachments: email?.hasAttachments || false,
            
            // Structured data from AI
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            aiAnalysis: taskData.aiAnalysis || null,
            
            // Metadata
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
        return task;
    }

    getEmailContent(email) {
        if (!email) return '';
        
        // Essayer d'extraire le contenu de l'email
        if (email.body?.content) {
            return email.body.content;
        } else if (email.bodyPreview) {
            return email.bodyPreview;
        } else {
            // Construire un contenu minimal
            return `Email de: ${email.from?.emailAddress?.name || 'Inconnu'} <${email.from?.emailAddress?.address || ''}>
Date: ${email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleString('fr-FR') : ''}
Sujet: ${email.subject || 'Sans sujet'}

${email.bodyPreview || 'Contenu non disponible'}`;
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
            case 'sender':
                sorted.sort((a, b) => {
                    const senderA = (a.emailFromName || a.emailFrom || 'ZZZ').toLowerCase();
                    const senderB = (b.emailFromName || b.emailFrom || 'ZZZ').toLowerCase();
                    return senderA.localeCompare(senderB);
                });
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
// MODERN TASKS VIEW - STYLE PAGEMANAGER
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
        this.currentViewMode = 'condensed'; // condensed, detailed, kanban
        this.showCompleted = false; // Par défaut, masquer les terminées
        
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
                <!-- Barre principale unifiée style PageManager -->
                <div class="tasks-main-toolbar">
                    <div class="toolbar-left">
                        <h1 class="tasks-title">Tâches</h1>
                        <span class="tasks-count-large">${stats.total} tâche${stats.total > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div class="toolbar-center">
                        <!-- Barre de recherche -->
                        <div class="search-wrapper-large">
                            <i class="fas fa-search search-icon-large"></i>
                            <input type="text" 
                                   class="search-input-large" 
                                   id="taskSearchInput"
                                   placeholder="Rechercher dans les tâches..." 
                                   value="${this.currentFilters.search}">
                            <button class="search-clear-large" id="searchClearBtn" 
                                    style="display: ${this.currentFilters.search ? 'flex' : 'none'}"
                                    onclick="window.tasksView.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="toolbar-center-right">
                        <!-- Modes de vue -->
                        <div class="view-modes-large">
                            <button class="btn-large ${this.currentViewMode === 'condensed' ? 'active' : ''}" 
                                    data-mode="condensed"
                                    onclick="window.tasksView.changeViewMode('condensed')">
                                <i class="fas fa-list"></i>
                                <span class="btn-text-large">Condensé</span>
                            </button>
                            <button class="btn-large ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                    data-mode="detailed"
                                    onclick="window.tasksView.changeViewMode('detailed')">
                                <i class="fas fa-th-large"></i>
                                <span class="btn-text-large">Détaillé</span>
                            </button>
                            <button class="btn-large ${this.currentViewMode === 'kanban' ? 'active' : ''}" 
                                    data-mode="kanban"
                                    onclick="window.tasksView.changeViewMode('kanban')">
                                <i class="fas fa-columns"></i>
                                <span class="btn-text-large">Kanban</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="toolbar-right">
                        ${this.selectedTasks.size > 0 ? `
                            <div class="selection-info-large">
                                <span class="selection-count-large">${this.selectedTasks.size} sélectionné(s)</span>
                                <button class="btn-large btn-secondary-large" onclick="window.tasksView.clearSelection()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <button class="btn-large btn-primary-large" onclick="window.tasksView.bulkActions()">
                                <i class="fas fa-cog"></i>
                                <span class="btn-text-large">Actions</span>
                            </button>
                        ` : ''}
                        <button class="btn-large btn-primary-large" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            <span class="btn-text-large">Nouvelle tâche</span>
                        </button>
                    </div>
                </div>

                <!-- Filtres de statut grands -->
                <div class="status-filters-large">
                    ${this.buildLargeStatusPills(stats)}
                </div>

                <!-- Filtres avancés -->
                <div class="advanced-filters" ${this.hasAdvancedFilters() ? 'style="display: block;"' : ''}>
                    <div class="filter-row-modern">
                        <select class="filter-select-modern" onchange="window.tasksView.setFilter('priority', this.value)">
                            <option value="all">🏷️ Toutes priorités</option>
                            <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>🚨 Urgent</option>
                            <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>
                        
                        <select class="filter-select-modern" onchange="window.tasksView.setFilter('category', this.value)">
                            <option value="all">📁 Toutes catégories</option>
                            <option value="email" ${this.currentFilters.category === 'email' ? 'selected' : ''}>📧 Email</option>
                            <option value="client" ${this.currentFilters.category === 'client' ? 'selected' : ''}>🤝 Client</option>
                            <option value="project" ${this.currentFilters.category === 'project' ? 'selected' : ''}>📁 Projet</option>
                            <option value="other" ${this.currentFilters.category === 'other' ? 'selected' : ''}>📋 Autre</option>
                        </select>
                        
                        <select class="filter-select-modern" onchange="window.tasksView.setSort(this.value)">
                            <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>🕒 Plus récent</option>
                            <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>🎯 Priorité</option>
                            <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>📅 Échéance</option>
                            <option value="sender" ${this.currentFilters.sortBy === 'sender' ? 'selected' : ''}>👤 Expéditeur</option>
                            <option value="client" ${this.currentFilters.sortBy === 'client' ? 'selected' : ''}>🏢 Client</option>
                        </select>
                        
                        <label class="toggle-large">
                            <input type="checkbox" ${this.showCompleted ? 'checked' : ''} 
                                   onchange="window.tasksView.toggleCompleted(this.checked)">
                            <span>Afficher terminées</span>
                        </label>
                        
                        <button class="btn-large btn-secondary-large" onclick="window.tasksView.toggleAdvancedFilters()">
                            <i class="fas fa-filter"></i>
                            <span class="btn-text-large">Filtres</span>
                        </button>
                        
                        ${this.hasActiveFilters() ? `
                            <button class="btn-large btn-secondary-large" onclick="window.tasksView.resetFilters()">
                                <i class="fas fa-undo"></i>
                                <span class="btn-text-large">Reset</span>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Container des tâches -->
                <div class="tasks-container-modern" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addModernTaskStyles();
        this.setupEventListeners();
        console.log('[TasksView] Modern interface rendered');
    }

    buildLargeStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Toutes', icon: '📋', count: stats.total },
            { id: 'todo', name: 'À faire', icon: '⏳', count: stats.todo },
            { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.inProgress },
            { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue },
            { id: 'needsReply', name: 'À répondre', icon: '📧', count: stats.needsReply },
            { id: 'completed', name: 'Terminées', icon: '✅', count: stats.completed }
        ];

        return pills.map(pill => `
            <button class="btn-large status-pill-large ${this.isFilterActive(pill.id) ? 'active' : ''}" 
                    data-filter="${pill.id}"
                    onclick="window.tasksView.quickFilter('${pill.id}')">
                <span class="pill-icon-large">${pill.icon}</span>
                <span class="pill-text-large">${pill.name}</span>
                <span class="pill-count-large">${pill.count}</span>
            </button>
        `).join('');
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

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'detailed':
                return this.renderDetailedView(filteredTasks);
            case 'kanban':
                return this.renderKanbanView(filteredTasks);
            case 'condensed':
            default:
                return this.renderCondensedView(filteredTasks);
        }
    }

    renderEmptyState() {
        return `
            <div class="empty-state-modern">
                <div class="empty-state-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3 class="empty-state-title">Aucune tâche trouvée</h3>
                <p class="empty-state-text">
                    ${this.hasActiveFilters() ? 'Aucune tâche ne correspond à vos critères' : 'Vous n\'avez aucune tâche'}
                </p>
                ${this.hasActiveFilters() ? `
                    <button class="btn-large btn-primary-large" onclick="window.tasksView.resetFilters()">
                        <i class="fas fa-undo"></i>
                        <span>Réinitialiser les filtres</span>
                    </button>
                ` : `
                    <button class="btn-large btn-primary-large" onclick="window.tasksView.showCreateModal()">
                        <i class="fas fa-plus"></i>
                        <span>Créer votre première tâche</span>
                    </button>
                `}
            </div>
        `;
    }

    renderCondensedView(tasks) {
        return `
            <div class="tasks-condensed-list">
                ${tasks.map(task => this.renderCondensedTaskItem(task)).join('')}
            </div>
        `;
    }

    renderCondensedTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusIcon = this.getStatusIcon(task.status);
        
        // Client/Domain info
        const clientInfo = task.hasEmail ? 
            `@${task.emailDomain || 'email'}` : 
            task.client || 'Interne';
            
        // Due date info
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-condensed ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-condensed" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <!-- Priority + Status indicators -->
                <div class="task-indicators">
                    <div class="priority-indicator priority-${task.priority}" title="Priorité ${task.priority}">
                        ${priorityIcon}
                    </div>
                    <div class="status-indicator status-${task.status}" title="Statut: ${task.status}">
                        ${statusIcon}
                    </div>
                </div>
                
                <div class="task-content-condensed">
                    <div class="task-header-line">
                        <span class="task-title-large">${this.escapeHtml(task.title)}</span>
                        <div class="task-meta-right">
                            <span class="client-badge">${clientInfo}</span>
                            ${dueDateInfo.html}
                            <span class="task-date-large">${this.formatRelativeDate(task.createdAt)}</span>
                        </div>
                    </div>
                    
                    ${task.hasEmail ? `
                        <div class="task-email-line">
                            <i class="fas fa-envelope"></i>
                            <span class="email-from">${this.escapeHtml(task.emailFromName || task.emailFrom || 'Email')}</span>
                            ${task.needsReply || (task.hasEmail && !task.emailReplied && task.status !== 'completed') ? 
                                '<span class="reply-needed">📧 Réponse requise</span>' : ''
                            }
                        </div>
                    ` : ''}
                </div>
                
                <div class="task-actions-condensed">
                    ${this.renderQuickActions(task)}
                </div>
            </div>
        `;
    }

    renderDetailedView(tasks) {
        return `
            <div class="tasks-detailed-grid">
                ${tasks.map(task => this.renderDetailedTaskCard(task)).join('')}
            </div>
        `;
    }

    renderDetailedTaskCard(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityIcon = this.getPriorityIcon(task.priority);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-card-detailed ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <!-- Card Header -->
                <div class="task-card-header">
                    <div class="card-header-left">
                        <input type="checkbox" 
                               class="task-checkbox" 
                               ${isSelected ? 'checked' : ''}
                               onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                        <div class="priority-indicator priority-${task.priority}">
                            ${priorityIcon}
                        </div>
                    </div>
                    <div class="card-header-right">
                        <span class="status-badge status-${task.status}">
                            ${this.getStatusLabel(task.status)}
                        </span>
                    </div>
                </div>
                
                <!-- Card Content -->
                <div class="task-card-content">
                    <h3 class="task-card-title">${this.escapeHtml(task.title)}</h3>
                    
                    ${task.hasEmail ? `
                        <div class="task-email-info-card">
                            <div class="email-sender">
                                <i class="fas fa-envelope"></i>
                                <span>${this.escapeHtml(task.emailFromName || task.emailFrom || 'Email')}</span>
                                ${task.emailDomain ? `<span class="email-domain">@${task.emailDomain}</span>` : ''}
                            </div>
                            ${task.emailSubject && task.emailSubject !== task.title ? `
                                <div class="email-subject">
                                    <strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject)}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    ${task.description && task.description !== task.title ? `
                        <div class="task-description-card">
                            ${this.formatDescription(task.description)}
                        </div>
                    ` : ''}
                    
                    ${task.actions && task.actions.length > 0 ? `
                        <div class="task-actions-list">
                            <h4>Actions requises:</h4>
                            ${task.actions.slice(0, 3).map((action, idx) => `
                                <div class="action-item-card">
                                    <span class="action-number">${idx + 1}</span>
                                    <span class="action-text">${this.escapeHtml(action.text)}</span>
                                    ${action.deadline ? `<span class="action-deadline">${this.formatDeadline(action.deadline)}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Card Footer -->
                <div class="task-card-footer">
                    <div class="footer-left">
                        <span class="client-info">${task.client || 'Interne'}</span>
                        ${dueDateInfo.html}
                    </div>
                    <div class="footer-right">
                        ${this.renderQuickActions(task)}
                    </div>
                </div>
            </div>
        `;
    }

    renderKanbanView(tasks) {
        const columns = [
            { id: 'todo', title: 'À faire', icon: '⏳' },
            { id: 'in-progress', title: 'En cours', icon: '🔄' },
            { id: 'completed', title: 'Terminé', icon: '✅' }
        ];

        const tasksByStatus = {
            'todo': tasks.filter(t => t.status === 'todo'),
            'in-progress': tasks.filter(t => t.status === 'in-progress'),
            'completed': tasks.filter(t => t.status === 'completed')
        };

        return `
            <div class="kanban-board">
                ${columns.map(column => `
                    <div class="kanban-column" data-status="${column.id}">
                        <div class="kanban-header">
                            <span class="kanban-icon">${column.icon}</span>
                            <span class="kanban-title">${column.title}</span>
                            <span class="kanban-count">${tasksByStatus[column.id].length}</span>
                        </div>
                        <div class="kanban-cards">
                            ${tasksByStatus[column.id].map(task => this.renderKanbanCard(task)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderKanbanCard(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const priorityIcon = this.getPriorityIcon(task.priority);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="kanban-card ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <div class="kanban-card-header">
                    <input type="checkbox" 
                           class="task-checkbox-small" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                    <div class="priority-indicator priority-${task.priority}">
                        ${priorityIcon}
                    </div>
                </div>
                
                <div class="kanban-card-content">
                    <h4 class="kanban-card-title">${this.escapeHtml(task.title)}</h4>
                    
                    ${task.hasEmail ? `
                        <div class="kanban-email-info">
                            <i class="fas fa-envelope"></i>
                            <span>${this.escapeHtml(task.emailFromName || task.emailFrom || 'Email')}</span>
                        </div>
                    ` : ''}
                    
                    <div class="kanban-card-meta">
                        <span class="client-small">${task.client || 'Interne'}</span>
                        ${dueDateInfo.text ? `<span class="due-date-small">${dueDateInfo.text}</span>` : ''}
                    </div>
                </div>
                
                <div class="kanban-card-actions">
                    ${this.renderQuickActions(task, true)}
                </div>
            </div>
        `;
    }

    renderQuickActions(task, minimal = false) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-modern complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        if (task.hasEmail && !task.emailReplied && task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-modern reply" 
                        onclick="event.stopPropagation(); window.tasksView.replyToEmail('${task.id}')"
                        title="Répondre à l'email">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        if (!minimal) {
            actions.push(`
                <button class="action-btn-modern edit" 
                        onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                        title="Voir les détails">
                    <i class="fas fa-eye"></i>
                </button>
            `);
            
            // Bouton pour voir l'email complet si c'est une tâche email
            if (task.hasEmail) {
                actions.push(`
                    <button class="action-btn-modern email" 
                            onclick="event.stopPropagation(); window.tasksView.showEmailModal('${task.id}')"
                            title="Voir l'email complet">
                        <i class="fas fa-envelope-open"></i>
                    </button>
                `);
            }
        }
        
        actions.push(`
            <button class="action-btn-modern delete" 
                    onclick="event.stopPropagation(); window.tasksView.deleteTask('${task.id}')"
                    title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // Event handlers et interactions
    handleTaskClick(event, taskId) {
        if (this.currentViewMode === 'condensed') {
            this.showTaskDetails(taskId);
        } else {
            this.toggleTaskSelection(taskId);
        }
    }

    quickFilter(filterId) {
        // Reset other filters
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            search: this.currentFilters.search,
            sortBy: this.currentFilters.sortBy,
            overdue: false,
            needsReply: false
        };

        // Apply the selected filter
        switch (filterId) {
            case 'all':
                // Already reset above
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

    changeViewMode(mode) {
        this.currentViewMode = mode;
        
        // Update active button
        document.querySelectorAll('.btn-large[data-mode]').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Re-render list
        this.refreshView();
    }

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        
        this.updateSelectionUI();
        
        // Re-render to update toolbar
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

    deleteTask(taskId) {
        if (confirm('Supprimer cette tâche ?')) {
            window.taskManager.deleteTask(taskId);
            this.selectedTasks.delete(taskId);
            this.showToast('Tâche supprimée', 'success');
        }
    }

    showEmailModal(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;

        // Modal de l'email complet - style PageManager
        const uniqueId = 'email_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 900px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;">Email Complet</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 20px; overflow-y: auto; flex: 1;">
                        ${this.buildEmailContent(task)}
                    </div>
                    <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Fermer
                        </button>
                        ${task.hasEmail && !task.emailReplied && task.status !== 'completed' ? `
                            <button onclick="window.tasksView.replyToEmailFromModal('${task.id}'); document.getElementById('${uniqueId}').remove();"
                                    style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-reply"></i> Répondre
                            </button>
                        ` : ''}
                        <button onclick="window.tasksView.showTaskDetails('${task.id}'); document.getElementById('${uniqueId}').remove();"
                                style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-tasks"></i> Voir la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildEmailContent(task) {
        const senderName = task.emailFromName || 'Inconnu';
        const senderEmail = task.emailFrom || '';
        const formattedDate = task.emailDate ? new Date(task.emailDate).toLocaleString('fr-FR') : '';
        
        return `
            <div class="email-modal-content">
                <!-- Email Header -->
                <div class="email-header-section">
                    <div class="email-header-row">
                        <div class="email-sender-info">
                            <div class="sender-avatar-email">${senderName.charAt(0).toUpperCase()}</div>
                            <div class="sender-details-email">
                                <div class="sender-name-email">${this.escapeHtml(senderName)}</div>
                                <div class="sender-email-address">${this.escapeHtml(senderEmail)}</div>
                                ${task.emailDomain ? `<div class="sender-domain-email">@${task.emailDomain}</div>` : ''}
                            </div>
                        </div>
                        <div class="email-meta-info">
                            <div class="email-date-full">${formattedDate}</div>
                            ${task.hasAttachments ? '<div class="attachment-indicator"><i class="fas fa-paperclip"></i> Pièces jointes</div>' : ''}
                            ${task.needsReply || (task.hasEmail && !task.emailReplied && task.status !== 'completed') ? 
                                '<div class="reply-status-indicator"><i class="fas fa-exclamation-circle"></i> Réponse requise</div>' : ''
                            }
                        </div>
                    </div>
                    
                    <div class="email-subject-section">
                        <h3 class="email-subject-full">
                            <i class="fas fa-envelope"></i>
                            ${this.escapeHtml(task.emailSubject || 'Sans sujet')}
                        </h3>
                    </div>
                </div>

                <!-- Email Body -->
                <div class="email-body-section">
                    <h4><i class="fas fa-align-left"></i> Contenu de l'email</h4>
                    <div class="email-content-display">
                        ${this.formatEmailContent(task.emailContent)}
                    </div>
                </div>

                <!-- Quick Actions Section -->
                <div class="email-actions-section">
                    <h4><i class="fas fa-bolt"></i> Actions rapides</h4>
                    <div class="quick-actions-grid">
                        ${task.hasEmail && !task.emailReplied && task.status !== 'completed' ? `
                            <button class="quick-action-btn reply-btn" onclick="window.tasksView.replyToEmailFromModal('${task.id}')">
                                <i class="fas fa-reply"></i>
                                <span>Répondre</span>
                            </button>
                        ` : ''}
                        <button class="quick-action-btn forward-btn" onclick="window.tasksView.forwardEmail('${task.id}')">
                            <i class="fas fa-share"></i>
                            <span>Transférer</span>
                        </button>
                        ${task.status !== 'completed' ? `
                            <button class="quick-action-btn complete-btn" onclick="window.tasksView.markCompleteFromModal('${task.id}')">
                                <i class="fas fa-check"></i>
                                <span>Marquer terminé</span>
                            </button>
                        ` : ''}
                        <button class="quick-action-btn copy-btn" onclick="window.tasksView.copyEmailContent('${task.id}')">
                            <i class="fas fa-copy"></i>
                            <span>Copier le contenu</span>
                        </button>
                    </div>
                </div>

                <!-- Related Task Info -->
                <div class="related-task-section">
                    <h4><i class="fas fa-link"></i> Tâche associée</h4>
                    <div class="task-link-card">
                        <div class="task-link-header">
                            <div class="priority-indicator priority-${task.priority}">
                                ${this.getPriorityIcon(task.priority)}
                            </div>
                            <div class="task-link-info">
                                <div class="task-link-title">${this.escapeHtml(task.title)}</div>
                                <div class="task-link-meta">
                                    <span class="status-badge status-${task.status}">
                                        ${this.getStatusIcon(task.status)} ${this.getStatusLabel(task.status)}
                                    </span>
                                    <span class="task-link-date">Créée le ${new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        </div>
                        <button class="view-task-btn" onclick="window.tasksView.showTaskDetails('${task.id}')">
                            <i class="fas fa-external-link-alt"></i>
                            Voir la tâche complète
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    formatEmailContent(content) {
        if (!content) return '<p class="no-content">Contenu non disponible</p>';
        
        // Si c'est du contenu structuré de notre système
        if (content.includes('📧 RÉSUMÉ EXÉCUTIF') || content.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
            return `<div class="structured-email-content">${content.replace(/\n/g, '<br>')}</div>`;
        }
        
        // Nettoyer et formater le contenu HTML/texte
        let formattedContent = this.escapeHtml(content);
        
        // Convertir les sauts de ligne
        formattedContent = formattedContent.replace(/\n/g, '<br>');
        
        // Détecter et formater les URLs
        formattedContent = formattedContent.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" class="email-link">$1</a>'
        );
        
        // Détecter et formater les emails
        formattedContent = formattedContent.replace(
            /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
            '<a href="mailto:$1" class="email-link">$1</a>'
        );
        
        return `<div class="email-text-content">${formattedContent}</div>`;
    }

    replyToEmailFromModal(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        const subject = `Re: ${task.emailSubject || 'Votre message'}`;
        const to = task.emailFrom;
        
        // Créer un contenu de réponse plus intelligent
        const originalDate = task.emailDate ? new Date(task.emailDate).toLocaleDateString('fr-FR') : '';
        const senderName = task.emailFromName || task.emailFrom;
        
        const body = `Bonjour${senderName !== task.emailFrom ? ' ' + senderName : ''},

Merci pour votre message${originalDate ? ' du ' + originalDate : ''}.

[Votre réponse ici]

Cordialement,
[Votre nom]

---
Message original :
De: ${senderName} <${task.emailFrom}>
Date: ${originalDate}
Objet: ${task.emailSubject || 'Sans sujet'}`;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
        
        // Marquer comme répondu
        window.taskManager.updateTask(taskId, { emailReplied: true });
        this.showToast('Email de réponse ouvert', 'success');
        
        // Fermer le modal
        document.querySelectorAll('[id^="email_modal_"]').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
    }

    forwardEmail(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        const subject = `Fwd: ${task.emailSubject || 'Email transféré'}`;
        const senderName = task.emailFromName || task.emailFrom;
        const originalDate = task.emailDate ? new Date(task.emailDate).toLocaleDateString('fr-FR') : '';
        
        const body = `[Message transféré]

---
De: ${senderName} <${task.emailFrom}>
Date: ${originalDate}
Objet: ${task.emailSubject || 'Sans sujet'}

${task.emailContent || 'Contenu non disponible'}`;
        
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
        
        this.showToast('Email de transfert ouvert', 'success');
    }

    markCompleteFromModal(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche marquée comme terminée', 'success');
        
        // Fermer le modal et rafraîchir
        document.querySelectorAll('[id^="email_modal_"]').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
        this.refreshView();
    }

    async copyEmailContent(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        const senderName = task.emailFromName || task.emailFrom;
        const originalDate = task.emailDate ? new Date(task.emailDate).toLocaleDateString('fr-FR') : '';
        
        const content = `Email de: ${senderName} <${task.emailFrom}>
Date: ${originalDate}
Sujet: ${task.emailSubject || 'Sans sujet'}

${task.emailContent || 'Contenu non disponible'}`;
        
        try {
            await navigator.clipboard.writeText(content);
            this.showToast('Contenu de l\'email copié', 'success');
        } catch (error) {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Contenu de l\'email copié', 'success');
        }
    }
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        // Modal des détails de la tâche - style PageManager
        const uniqueId = 'task_details_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 800px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;">Détails de la tâche</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 20px; overflow-y: auto; flex: 1;">
                        ${this.buildTaskDetailsContent(task)}
                    </div>
                    <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Fermer
                        </button>
                        ${task.status !== 'completed' ? `
                            <button onclick="window.tasksView.markComplete('${task.id}'); document.getElementById('${uniqueId}').remove();"
                                    style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
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
            <div class="task-details-content">
                <!-- Header -->
                <div class="details-header">
                    <h1 class="task-title-details">${this.escapeHtml(task.title)}</h1>
                    <div class="task-meta-badges">
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
                    <!-- Email Info -->
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
                            ${task.emailDate ? `
                                <div class="email-detail-item">
                                    <strong>Date:</strong>
                                    <span>${new Date(task.emailDate).toLocaleString('fr-FR')}</span>
                                </div>
                            ` : ''}
                            ${task.needsReply || (task.hasEmail && !task.emailReplied && task.status !== 'completed') ? `
                                <div class="email-detail-item reply-status">
                                    <strong>Statut:</strong>
                                    <span class="needs-reply">📧 Réponse requise</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${task.description && task.description !== task.title ? `
                    <!-- Description -->
                    <div class="details-section">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <div class="description-content">
                            ${this.formatDescription(task.description)}
                        </div>
                    </div>
                ` : ''}

                ${task.actions && task.actions.length > 0 ? `
                    <!-- Actions Required -->
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
                    <!-- Key Information -->
                    <div class="details-section">
                        <h3><i class="fas fa-info-circle"></i> Informations Clés</h3>
                        <div class="key-info-list">
                            ${task.keyInfo.map(info => `
                                <div class="key-info-item">
                                    <i class="fas fa-chevron-right"></i>
                                    <span>${this.escapeHtml(info)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.risks && task.risks.length > 0 ? `
                    <!-- Points of Attention -->
                    <div class="details-section attention-section">
                        <h3><i class="fas fa-exclamation-triangle"></i> Points d'Attention</h3>
                        <div class="risks-list">
                            ${task.risks.map(risk => `
                                <div class="risk-item">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>${this.escapeHtml(risk)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Metadata -->
                <div class="details-section">
                    <h3><i class="fas fa-cog"></i> Informations Système</h3>
                    <div class="metadata-grid">
                        <div class="metadata-item">
                            <strong>Client:</strong>
                            <span>${task.client || 'Interne'}</span>
                        </div>
                        <div class="metadata-item">
                            <strong>Catégorie:</strong>
                            <span>${this.getCategoryLabel(task.category)}</span>
                        </div>
                        <div class="metadata-item">
                            <strong>Créé le:</strong>
                            <span>${new Date(task.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="metadata-item">
                            <strong>Modifié le:</strong>
                            <span>${new Date(task.updatedAt).toLocaleString('fr-FR')}</span>
                        </div>
                        ${task.method ? `
                            <div class="metadata-item">
                                <strong>Méthode:</strong>
                                <span>${task.method === 'ai' ? '🤖 IA' : '✋ Manuel'}</span>
                            </div>
                        ` : ''}
                        ${task.tags && task.tags.length > 0 ? `
                            <div class="metadata-item">
                                <strong>Tags:</strong>
                                <div class="tags-list">
                                    ${task.tags.map(tag => `<span class="tag-item">${tag}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    showCreateModal() {
        const uniqueId = 'create_task_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 600px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;">Nouvelle tâche</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form onsubmit="window.tasksView.createTask(event, '${uniqueId}')">
                        <div style="padding: 20px; overflow-y: auto; flex: 1;">
                            <div class="form-group">
                                <label>Titre *</label>
                                <input type="text" name="title" required placeholder="Titre de la tâche" class="form-input">
                            </div>
                            
                            <div class="form-group">
                                <label>Description</label>
                                <textarea name="description" rows="4" placeholder="Description détaillée..." class="form-input"></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Priorité</label>
                                    <select name="priority" class="form-input">
                                        <option value="low">📄 Basse</option>
                                        <option value="medium" selected>📌 Normale</option>
                                        <option value="high">⚡ Haute</option>
                                        <option value="urgent">🚨 Urgente</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>Catégorie</label>
                                    <select name="category" class="form-input">
                                        <option value="other">📋 Autre</option>
                                        <option value="email">📧 Email</option>
                                        <option value="client">🤝 Client</option>
                                        <option value="project">📁 Projet</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Client</label>
                                    <input type="text" name="client" placeholder="Nom du client..." class="form-input">
                                </div>
                                
                                <div class="form-group">
                                    <label>Date d'échéance</label>
                                    <input type="date" name="dueDate" class="form-input">
                                </div>
                            </div>
                        </div>
                        
                        <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                            <button type="button" onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                    style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                                Annuler
                            </button>
                            <button type="submit"
                                    style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-plus"></i> Créer la tâche
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    createTask(event, modalId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            category: formData.get('category'),
            client: formData.get('client'),
            dueDate: formData.get('dueDate') || null
        };
        
        window.taskManager.createTask(taskData);
        document.getElementById(modalId).remove();
        document.body.style.overflow = 'auto';
        this.showToast('Tâche créée avec succès', 'success');
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

    getCategoryLabel(category) {
        const labels = { email: '📧 Email', client: '🤝 Client', project: '📁 Projet', other: '📋 Autre' };
        return labels[category] || 'Autre';
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
            html: `<span class="due-date-badge ${className}">📅 ${text}</span>`,
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

    formatDeadline(deadline) {
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

    formatDescription(description) {
        if (!description) return '';
        
        // Si c'est une description structurée (avec des sections), la formater
        if (description.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
            return `<div class="structured-description">${description.replace(/\n/g, '<br>')}</div>`;
        } else {
            return `<div class="simple-description">${this.escapeHtml(description).replace(/\n/g, '<br>')}</div>`;
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event handlers
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

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
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

    toggleAdvancedFilters() {
        const filtersDiv = document.querySelector('.advanced-filters');
        if (filtersDiv) {
            const isVisible = filtersDiv.style.display === 'block';
            filtersDiv.style.display = isVisible ? 'none' : 'block';
        }
    }

    hasAdvancedFilters() {
        return this.currentFilters.priority !== 'all' || 
               this.currentFilters.category !== 'all' || 
               this.currentFilters.sortBy !== 'created';
    }

    hasActiveFilters() {
        return this.currentFilters.status !== 'all' ||
               this.currentFilters.priority !== 'all' ||
               this.currentFilters.category !== 'all' ||
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply;
    }

    resetFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            search: '',
            sortBy: 'created',
            overdue: false,
            needsReply: false
        };
        
        // Clear search input
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        this.refreshView();
    }

    bulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const actions = [
            { label: '✅ Marquer comme terminé', action: 'complete' },
            { label: '🔄 Marquer en cours', action: 'in-progress' },
            { label: '⏳ Marquer à faire', action: 'todo' },
            { label: '🗑️ Supprimer', action: 'delete' }
        ];
        
        const actionsHTML = actions.map(action => 
            `<button onclick="window.tasksView.executeBulkAction('${action.action}')">${action.label}</button>`
        ).join('');
        
        // Simple prompt for now
        const action = prompt(`Actions groupées (${this.selectedTasks.size} tâches):\n1. Complete\n2. In-progress\n3. Todo\n4. Delete\n\nEntrez le numéro:`);
        
        switch (action) {
            case '1': this.executeBulkAction('complete'); break;
            case '2': this.executeBulkAction('in-progress'); break;
            case '3': this.executeBulkAction('todo'); break;
            case '4': this.executeBulkAction('delete'); break;
        }
    }

    executeBulkAction(action) {
        if (this.selectedTasks.size === 0) return;
        
        let count = 0;
        
        this.selectedTasks.forEach(taskId => {
            if (action === 'delete') {
                if (confirm(`Supprimer ${this.selectedTasks.size} tâche(s) ?`)) {
                    window.taskManager.deleteTask(taskId);
                    count++;
                }
            } else {
                window.taskManager.updateTask(taskId, { status: action });
                count++;
            }
        });
        
        if (count > 0) {
            this.selectedTasks.clear();
            this.showToast(`${count} tâche(s) mise(s) à jour`, 'success');
            this.render(document.querySelector('.tasks-page-modern')?.parentElement);
        }
    }

    updateSelectionUI() {
        document.querySelectorAll('[data-task-id]').forEach(item => {
            const taskId = item.dataset.taskId;
            const isSelected = this.selectedTasks.has(taskId);
            
            item.classList.toggle('selected', isSelected);
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = isSelected;
        });
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        // Update status pills
        const stats = window.taskManager.getStats();
        document.querySelectorAll('.status-filters-large').forEach(container => {
            container.innerHTML = this.buildLargeStatusPills(stats);
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-modern toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    addModernTaskStyles() {
        if (document.getElementById('modernTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modernTaskStyles';
        styles.textContent = `
            /* Reset et base */
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f8fafc;
                min-height: 100vh;
                padding: 0;
            }

            /* Toolbar principal - Style PageManager */
            .tasks-main-toolbar {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 4px 0 2px 0;
                border: none;
                margin: 0 0 4px 0;
                min-height: 48px;
                background: transparent;
            }
            
            .toolbar-left {
                display: flex;
                align-items: baseline;
                gap: 8px;
                min-width: 160px;
                flex-shrink: 0;
            }
            
            .tasks-title {
                margin: 0;
                font-size: 26px;
                font-weight: 700;
                color: #1f2937;
            }
            
            .tasks-count-large {
                font-size: 15px;
                color: #6b7280;
                font-weight: 600;
                background: #f3f4f6;
                padding: 5px 12px;
                border-radius: 14px;
            }
            
            .toolbar-center {
                flex: 1;
                max-width: 450px;
                min-width: 280px;
            }
            
            .search-wrapper-large {
                position: relative;
                width: 100%;
            }
            
            .search-input-large {
                width: 100%;
                padding: 14px 18px 14px 48px;
                border: 1px solid #d1d5db;
                border-radius: 12px;
                font-size: 15px;
                background: white;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .search-input-large:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .search-icon-large {
                position: absolute;
                left: 18px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                font-size: 17px;
            }
            
            .search-clear-large {
                position: absolute;
                right: 14px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 5px;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .search-clear-large:hover {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .toolbar-center-right {
                flex-shrink: 0;
            }
            
            .view-modes-large {
                display: flex;
                gap: 5px;
                background: #f3f4f6;
                padding: 5px;
                border-radius: 10px;
            }
            
            .toolbar-right {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-shrink: 0;
            }
            
            .selection-info-large {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 14px;
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 10px;
                font-size: 14px;
                color: #1e40af;
            }
            
            .selection-count-large {
                font-weight: 600;
            }

            /* Boutons AGRANDIS - Style PageManager */
            .btn-large {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                border: 1px solid #d1d5db;
                border-radius: 10px;
                background: white;
                color: #374151;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                white-space: nowrap;
                min-height: 46px;
                box-sizing: border-box;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .btn-large:hover {
                background: #f9fafb;
                border-color: #9ca3af;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: 0 3px 6px rgba(0,0,0,0.1);
            }
            
            .btn-large.active {
                background: #667eea;
                color: white;
                border-color: #667eea;
                box-shadow: 0 3px 8px rgba(102, 126, 234, 0.25);
            }
            
            .btn-large.btn-primary-large {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
            
            .btn-large.btn-primary-large:hover {
                background: #5a67d8;
                border-color: #5a67d8;
                transform: translateY(-1px);
                box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
            }
            
            .btn-large.btn-secondary-large {
                background: #f9fafb;
                color: #4b5563;
                border-color: #d1d5db;
            }
            
            .btn-large.btn-secondary-large:hover {
                background: #f3f4f6;
                color: #374151;
                transform: translateY(-1px);
            }
            
            .btn-text-large {
                font-weight: 600;
            }

            /* Status Pills - Style PageManager */
            .status-filters-large {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin: 0 0 16px 0;
                padding: 0;
                background: transparent;
                border: none;
            }
            
            .status-pill-large {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 12px 20px;
                border: 1px solid #d1d5db;
                border-radius: 10px;
                background: white;
                color: #374151;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 46px;
                box-sizing: border-box;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .status-pill-large:hover {
                border-color: #667eea;
                background: #667eea12;
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(0,0,0,0.12);
            }
            
            .status-pill-large.active {
                background: #667eea;
                color: white;
                border-color: #667eea;
                transform: translateY(-1px);
                box-shadow: 0 3px 10px rgba(0,0,0,0.15);
            }
            
            .pill-icon-large {
                font-size: 17px;
            }
            
            .pill-text-large {
                font-weight: 600;
                font-size: 15px;
            }
            
            .pill-count-large {
                background: rgba(0,0,0,0.1);
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 13px;
                font-weight: 700;
                min-width: 22px;
                text-align: center;
            }
            
            .status-pill-large.active .pill-count-large {
                background: rgba(255,255,255,0.25);
            }

            /* Advanced Filters */
            .advanced-filters {
                background: white;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                display: none;
            }
            
            .filter-row-modern {
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .filter-select-modern {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                font-size: 14px;
                cursor: pointer;
                min-width: 150px;
            }
            
            .filter-select-modern:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .toggle-large {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #4b5563;
                cursor: pointer;
            }
            
            .toggle-large input[type="checkbox"] {
                cursor: pointer;
            }

            /* Tasks Container */
            .tasks-container-modern {
                background: transparent;
            }

            /* Loading State */
            .loading-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .loading-icon {
                font-size: 48px;
                margin-bottom: 16px;
                color: #667eea;
            }

            /* Empty State */
            .empty-state-modern {
                text-align: center;
                padding: 60px 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .empty-state-icon {
                font-size: 64px;
                color: #d1d5db;
                margin-bottom: 20px;
            }
            
            .empty-state-title {
                margin: 0 0 8px 0;
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .empty-state-text {
                margin: 0 0 24px 0;
                color: #6b7280;
                font-size: 16px;
            }

            /* Condensed View */
            .tasks-condensed-list {
                display: flex;
                flex-direction: column;
                gap: 3px;
                background: #f9fafb;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .task-condensed {
                display: flex;
                align-items: center;
                background: white;
                padding: 16px 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-bottom: 1px solid #f3f4f6;
                min-height: 60px;
            }
            
            .task-condensed:last-child {
                border-bottom: none;
            }
            
            .task-condensed:hover {
                background: #f9fafb;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .task-condensed.selected {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
            }
            
            .task-condensed.completed {
                opacity: 0.6;
            }
            
            .task-condensed.completed .task-title-large {
                text-decoration: line-through;
            }
            
            .task-checkbox-condensed {
                margin-right: 16px;
                cursor: pointer;
                width: 18px;
                height: 18px;
            }
            
            .task-indicators {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-right: 16px;
            }
            
            .priority-indicator {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
            }
            
            .priority-indicator.priority-urgent {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .priority-indicator.priority-high {
                background: #fef3c7;
                color: #d97706;
            }
            
            .priority-indicator.priority-medium {
                background: #e0e7ff;
                color: #5b21b6;
            }
            
            .priority-indicator.priority-low {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .status-indicator {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .status-indicator.status-todo {
                background: #fef3c7;
                color: #d97706;
            }
            
            .status-indicator.status-in-progress {
                background: #dbeafe;
                color: #2563eb;
            }
            
            .status-indicator.status-completed {
                background: #dcfce7;
                color: #16a34a;
            }
            
            .task-content-condensed {
                flex: 1;
                min-width: 0;
            }
            
            .task-header-line {
                display: flex;
                align-items: center;
                width: 100%;
                gap: 16px;
                margin-bottom: 4px;
            }
            
            .task-title-large {
                font-weight: 700;
                color: #1f2937;
                font-size: 16px;
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-right: 16px;
            }
            
            .task-meta-right {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
            }
            
            .client-badge {
                background: #f3f4f6;
                color: #4b5563;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .due-date-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
            }
            
            .due-date-normal {
                background: #f3f4f6;
                color: #4b5563;
            }
            
            .due-date-soon {
                background: #fef3c7;
                color: #d97706;
            }
            
            .due-date-tomorrow {
                background: #fed7aa;
                color: #ea580c;
            }
            
            .due-date-today {
                background: #fecaca;
                color: #dc2626;
            }
            
            .due-date-overdue {
                background: #fee2e2;
                color: #dc2626;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .task-date-large {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .task-email-line {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #6b7280;
            }
            
            .email-from {
                font-weight: 500;
            }
            
            .reply-needed {
                background: #fee2e2;
                color: #dc2626;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .task-actions-condensed {
                margin-left: 16px;
                display: flex;
                align-items: center;
                gap: 6px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .task-condensed:hover .task-actions-condensed {
                opacity: 1;
            }
            
            .action-btn-modern {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .action-btn-modern.complete {
                background: #dcfce7;
                color: #16a34a;
            }
            
            .action-btn-modern.reply {
                background: #dbeafe;
                color: #2563eb;
            }
            
            .action-btn-modern.edit {
                background: #fef3c7;
                color: #d97706;
            }
            
            .action-btn-modern.email {
                background: #e0f2fe;
                color: #0277bd;
            }
            
            .action-btn-modern.delete {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .action-btn-modern:hover {
                transform: scale(1.1);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            /* Detailed View */
            .tasks-detailed-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                gap: 16px;
            }
            
            .task-card-detailed {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .task-card-detailed:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .task-card-detailed.selected {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .task-card-detailed.completed {
                opacity: 0.7;
            }
            
            .task-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .card-header-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .task-checkbox {
                cursor: pointer;
                width: 18px;
                height: 18px;
            }
            
            .status-badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-badge.status-todo {
                background: #fef3c7;
                color: #92400e;
            }
            
            .status-badge.status-in-progress {
                background: #dbeafe;
                color: #1e40af;
            }
            
            .status-badge.status-completed {
                background: #dcfce7;
                color: #166534;
            }
            
            .task-card-content {
                padding: 16px;
            }
            
            .task-card-title {
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                line-height: 1.4;
            }
            
            .task-email-info-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 10px 12px;
                margin-bottom: 12px;
                font-size: 13px;
            }
            
            .email-sender {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 4px;
            }
            
            .email-domain {
                color: #6b7280;
                font-size: 11px;
            }
            
            .email-subject {
                color: #4b5563;
                font-size: 12px;
            }
            
            .task-description-card {
                color: #4b5563;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 12px;
            }
            
            .structured-description {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 10px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                white-space: pre-wrap;
            }
            
            .simple-description {
                line-height: 1.6;
            }
            
            .task-actions-list {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 6px;
                padding: 10px 12px;
                margin-bottom: 12px;
            }
            
            .task-actions-list h4 {
                margin: 0 0 8px 0;
                font-size: 13px;
                color: #075985;
                font-weight: 600;
            }
            
            .action-item-card {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
                font-size: 12px;
            }
            
            .action-item-card:last-child {
                margin-bottom: 0;
            }
            
            .action-number {
                width: 20px;
                height: 20px;
                background: #0ea5e9;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .action-text {
                flex: 1;
                color: #374151;
            }
            
            .action-deadline {
                color: #dc2626;
                font-weight: 500;
                font-size: 11px;
            }
            
            .task-card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #f9fafb;
                border-top: 1px solid #f3f4f6;
            }
            
            .footer-left {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: #6b7280;
            }
            
            .client-info {
                font-weight: 500;
            }
            
            .footer-right {
                display: flex;
                gap: 4px;
            }

            /* Kanban View */
            .kanban-board {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                align-items: start;
            }
            
            .kanban-column {
                background: #f8fafc;
                border-radius: 12px;
                padding: 16px;
                min-height: 500px;
            }
            
            .kanban-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 2px solid #e5e7eb;
            }
            
            .kanban-icon {
                font-size: 20px;
            }
            
            .kanban-title {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                flex: 1;
            }
            
            .kanban-count {
                background: #667eea;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .kanban-cards {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .kanban-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .kanban-card:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .kanban-card.selected {
                border-color: #3b82f6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            }
            
            .kanban-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .task-checkbox-small {
                cursor: pointer;
                width: 16px;
                height: 16px;
            }
            
            .kanban-card-content {
                margin-bottom: 10px;
            }
            
            .kanban-card-title {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                line-height: 1.3;
            }
            
            .kanban-email-info {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 8px;
            }
            
            .kanban-card-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
            }
            
            .client-small {
                background: #f3f4f6;
                color: #4b5563;
                padding: 2px 6px;
                border-radius: 8px;
                font-weight: 500;
            }
            
            .due-date-small {
                color: #6b7280;
                font-weight: 500;
            }
            
            .kanban-card-actions {
                display: flex;
                gap: 4px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .kanban-card:hover .kanban-card-actions {
                opacity: 1;
            }

            /* Task Details Modal */
            .task-details-content {
                max-width: none;
            }
            
            .details-header {
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .task-title-details {
                margin: 0 0 12px 0;
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                line-height: 1.3;
            }
            
            .task-meta-badges {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .priority-badge {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .priority-badge.priority-urgent {
                background: #fee2e2;
                color: #991b1b;
            }
            
            .priority-badge.priority-high {
                background: #fef3c7;
                color: #92400e;
            }
            
            .priority-badge.priority-medium {
                background: #e0e7ff;
                color: #4338ca;
            }
            
            .priority-badge.priority-low {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .details-section {
                margin-bottom: 24px;
                padding: 16px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
            }
            
            .details-section h3 {
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .details-section.attention-section {
                background: #fef9e8;
                border-color: #fbbf24;
            }
            
            .email-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }
            
            .email-detail-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .email-detail-item strong {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            
            .email-detail-item span {
                font-size: 14px;
                color: #1f2937;
                word-break: break-word;
            }
            
            .email-detail-item.reply-status .needs-reply {
                color: #dc2626;
                font-weight: 600;
            }
            
            .description-content {
                line-height: 1.6;
                color: #374151;
            }
            
            .actions-list-details {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .action-item-details {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
            }
            
            .key-info-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .key-info-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 14px;
                color: #374151;
                line-height: 1.4;
            }
            
            .key-info-item i {
                font-size: 10px;
                color: #9ca3af;
                margin-top: 4px;
            }
            
            .risks-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .risk-item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 6px;
                padding: 10px 12px;
            }
            
            .risk-item i {
                font-size: 14px;
                color: #f59e0b;
                margin-top: 2px;
            }
            
            .risk-item span {
                flex: 1;
                font-size: 13px;
                color: #92400e;
                line-height: 1.4;
            }
            
            .metadata-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }
            
            .metadata-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .metadata-item strong {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            
            .metadata-item span {
                font-size: 14px;
                color: #1f2937;
            }
            
            .tags-list {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }
            
            .tag-item {
                background: #e0e7ff;
                color: #4338ca;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
            }

            /* Email Modal Styles */
            .email-modal-content {
                font-family: inherit;
            }
            
            .email-header-section {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .email-header-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }
            
            .email-sender-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .sender-avatar-email {
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
            
            .sender-details-email {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .sender-name-email {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .sender-email-address {
                font-size: 14px;
                color: #6b7280;
            }
            
            .sender-domain-email {
                font-size: 12px;
                color: #9ca3af;
                font-weight: 500;
            }
            
            .email-meta-info {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 4px;
                font-size: 13px;
            }
            
            .email-date-full {
                color: #4b5563;
                font-weight: 500;
            }
            
            .attachment-indicator {
                color: #d97706;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .reply-status-indicator {
                color: #dc2626;
                display: flex;
                align-items: center;
                gap: 4px;
                font-weight: 600;
            }
            
            .email-subject-section {
                border-top: 1px solid #e5e7eb;
                padding-top: 12px;
            }
            
            .email-subject-full {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .email-body-section {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .email-body-section h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .email-content-display {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 16px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .structured-email-content {
                font-family: 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.4;
                white-space: pre-wrap;
                color: #374151;
            }
            
            .email-text-content {
                line-height: 1.6;
                color: #374151;
            }
            
            .no-content {
                color: #9ca3af;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }
            
            .email-link {
                color: #2563eb;
                text-decoration: underline;
            }
            
            .email-link:hover {
                color: #1d4ed8;
            }
            
            .email-actions-section {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .email-actions-section h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
                color: #075985;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .quick-actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 12px;
            }
            
            .quick-action-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 12px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
                font-weight: 500;
            }
            
            .quick-action-btn i {
                font-size: 18px;
            }
            
            .reply-btn {
                background: #dbeafe;
                color: #1e40af;
            }
            
            .reply-btn:hover {
                background: #bfdbfe;
                transform: translateY(-1px);
            }
            
            .forward-btn {
                background: #fef3c7;
                color: #92400e;
            }
            
            .forward-btn:hover {
                background: #fde68a;
                transform: translateY(-1px);
            }
            
            .complete-btn {
                background: #dcfce7;
                color: #166534;
            }
            
            .complete-btn:hover {
                background: #bbf7d0;
                transform: translateY(-1px);
            }
            
            .copy-btn {
                background: #f3f4f6;
                color: #4b5563;
            }
            
            .copy-btn:hover {
                background: #e5e7eb;
                transform: translateY(-1px);
            }
            
            .related-task-section {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
            }
            
            .related-task-section h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .task-link-card {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .task-link-header {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .task-link-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .task-link-title {
                font-weight: 600;
                color: #1f2937;
                font-size: 14px;
            }
            
            .task-link-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
            }
            
            .task-link-date {
                color: #6b7280;
            }
            
            .view-task-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: background 0.2s;
            }
            
            .view-task-btn:hover {
                background: #5a67d8;
            }

            /* Form Elements */
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
            
            .form-input {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            /* Toast Notifications */
            .toast-modern {
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
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .toast-modern.show {
                transform: translateX(0);
            }
            
            .toast-modern.toast-success {
                border-color: #10b981;
                background: #ecfdf5;
                color: #065f46;
            }
            
            .toast-modern.toast-error {
                border-color: #ef4444;
                background: #fef2f2;
                color: #991b1b;
            }
            
            .toast-modern.toast-info {
                border-color: #3b82f6;
                background: #eff6ff;
                color: #1e40af;
            }

            /* Responsive Design */
            @media (max-width: 1024px) {
                .tasks-detailed-grid {
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                }
                
                .kanban-board {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                
                .kanban-column {
                    min-height: auto;
                }
                
                .quick-actions-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (max-width: 768px) {
                .tasks-main-toolbar {
                    flex-direction: column;
                    gap: 10px;
                    align-items: stretch;
                    padding: 4px 0 2px 0;
                    margin: 0 0 6px 0;
                }
                
                .toolbar-left,
                .toolbar-center,
                .toolbar-center-right,
                .toolbar-right {
                    width: 100%;
                    max-width: none;
                }
                
                .toolbar-right {
                    justify-content: flex-end;
                }
                
                .view-modes-large {
                    justify-content: center;
                }
                
                .status-filters-large {
                    padding: 0;
                    gap: 8px;
                    margin: 0 0 12px 0;
                }
                
                .btn-large {
                    padding: 10px 16px;
                    font-size: 14px;
                    min-height: 42px;
                }
                
                .status-pill-large {
                    padding: 10px 16px;
                    font-size: 14px;
                    min-height: 42px;
                }
                
                .btn-text-large {
                    display: none;
                }
                
                .pill-text-large {
                    display: none;
                }
                
                .tasks-title {
                    font-size: 22px;
                }
                
                .tasks-count-large {
                    font-size: 13px;
                    padding: 4px 10px;
                }
                
                .search-input-large {
                    padding: 12px 14px 12px 40px;
                    font-size: 14px;
                }
                
                .search-icon-large {
                    left: 14px;
                    font-size: 15px;
                }
                
                .task-condensed {
                    padding: 12px 16px;
                    min-height: 50px;
                }
                
                .task-header-line {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                }
                
                .task-title-large {
                    width: 100%;
                    white-space: normal;
                    line-height: 1.3;
                }
                
                .task-meta-right {
                    width: 100%;
                    justify-content: space-between;
                }
                
                .task-actions-condensed {
                    opacity: 1;
                    margin-left: 8px;
                }
                
                .tasks-detailed-grid {
                    grid-template-columns: 1fr;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .filter-row-modern {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 8px;
                }
                
                .filter-select-modern {
                    min-width: auto;
                }
                
                .email-details-grid,
                .metadata-grid {
                    grid-template-columns: 1fr;
                }
                
                .quick-actions-grid {
                    grid-template-columns: 1fr;
                }
                
                .email-header-row {
                    flex-direction: column;
                    gap: 12px;
                }
                
                .email-meta-info {
                    align-items: flex-start;
                }
                
                .task-link-card {
                    flex-direction: column;
                    gap: 12px;
                    align-items: stretch;
                }
                
                .view-task-btn {
                    align-self: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION
// =====================================

// Remplacer les instances existantes
if (window.taskManager) {
    const oldTasks = window.taskManager.getAllTasks();
    window.taskManager = new TaskManager();
    // Conserver les tâches existantes si elles existent
    if (oldTasks && oldTasks.length > 0) {
        window.taskManager.tasks = oldTasks;
        window.taskManager.saveTasks();
    }
} else {
    window.taskManager = new TaskManager();
}

if (window.tasksView) {
    window.tasksView = new TasksView();
} else {
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

console.log('✅ TaskManager v8.0 loaded - Style PageManager moderne avec interface optimisée');
