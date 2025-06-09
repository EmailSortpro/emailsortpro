// TaskManager Pro v9.1 - Interface Épurée et Moderne avec ligne explicative

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
            console.log('[TaskManager] Initializing v9.1 - Interface avec aide...');
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
            // Utiliser une variable en mémoire au lieu de localStorage
            if (!window.taskManagerMemoryStore) {
                console.log('[TaskManager] No saved tasks found, creating sample tasks');
                this.generateSampleTasks();
                window.taskManagerMemoryStore = this.tasks;
            } else {
                this.tasks = window.taskManagerMemoryStore;
                console.log(`[TaskManager] Loaded ${this.tasks.length} tasks from memory`);
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
                title: 'Validation campagne marketing Q2',
                description: '📧 RÉSUMÉ EXÉCUTIF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDe: Sarah Martin (acme-corp.com)\nObjet: Demande de validation pour la campagne marketing Q2\n📮 Réponse attendue\n\n🎯 ACTIONS REQUISES:\n1. Valider les visuels de la campagne\n2. Confirmer le budget alloué\n3. Définir les dates de lancement\n\n💡 INFORMATIONS CLÉS:\n• Budget proposé : 50k€\n• Cible : 25-45 ans\n• Canaux : LinkedIn, Google Ads\n\n⚠️ POINTS D\'ATTENTION:\n• Deadline serrée pour le lancement\n• Coordination avec l\'équipe commerciale requise',
                priority: 'high',
                status: 'todo',
                category: 'email',
                type: 'email',
                hasEmail: true,
                emailFrom: 'sarah.martin@acme-corp.com',
                emailFromName: 'Sarah Martin',
                emailSubject: 'Validation campagne marketing Q2',
                emailDate: '2025-06-06T09:15:00Z',
                emailDomain: 'acme-corp.com',
                emailContent: `Email de: Sarah Martin <sarah.martin@acme-corp.com>
Date: ${new Date().toLocaleString('fr-FR')}
Sujet: Validation campagne marketing Q2

Bonjour,

J'espère que vous allez bien. Je vous contacte concernant notre campagne marketing Q2 qui nécessite votre validation.

Nous avons préparé les éléments suivants :
- Visuels créatifs pour les réseaux sociaux
- Budget détaillé de 50k€
- Calendrier de lancement

Pourriez-vous valider ces éléments avant vendredi ? Nous devons coordonner avec l'équipe commerciale pour le lancement.

Merci d'avance,
Sarah Martin`,
                emailHtmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">ACME Corp</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Marketing Department</p>
                    </div>
                    <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                        <p>Bonjour,</p>
                        <p>J'espère que vous allez bien. Je vous contacte concernant notre <strong>campagne marketing Q2</strong> qui nécessite votre validation.</p>
                        <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #1f2937;">Éléments préparés :</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>Visuels créatifs pour les réseaux sociaux</li>
                                <li><strong>Budget détaillé de 50k€</strong></li>
                                <li>Calendrier de lancement</li>
                            </ul>
                        </div>
                        <p><strong>Pourriez-vous valider ces éléments avant vendredi ?</strong> Nous devons coordonner avec l'équipe commerciale pour le lancement.</p>
                        <p style="margin-top: 30px;">Merci d'avance,<br><strong>Sarah Martin</strong></p>
                    </div>
                </div>`,
                tags: ['marketing', 'validation', 'q2'],
                client: 'ACME Corp',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
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
                suggestedReplies: [
                    {
                        tone: 'formel',
                        subject: 'Re: Validation campagne marketing Q2 - Approuvé',
                        content: `Bonjour Sarah,

Merci pour ce dossier complet sur la campagne marketing Q2.

Après examen des éléments fournis, je valide :
✓ Les visuels créatifs - très bien conçus
✓ Le budget de 50k€ - approuvé 
✓ Le calendrier de lancement - cohérent avec nos objectifs

Vous pouvez procéder au lancement en coordination avec l'équipe commerciale comme prévu.

Excellente initiative, félicitations à toute l'équipe !

Cordialement,
[Votre nom]`
                    }
                ],
                method: 'ai'
            },
            {
                id: 'sample_2',
                title: 'Proposition commerciale Bankin\'',
                description: 'Offre record jusqu\'à 260€ offerts',
                priority: 'medium',
                status: 'todo',
                category: 'email',
                type: 'email',
                hasEmail: true,
                emailFrom: 'offres@bankin.com',
                emailFromName: 'Bankin\'',
                emailSubject: 'Offre record : jusqu\'à 260€ offerts',
                emailDate: '2025-06-06T14:30:00Z',
                emailDomain: 'bankin.com',
                tags: ['finance', 'offre'],
                client: 'Bankin\'',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                updatedAt: new Date(Date.now() - 3600000).toISOString(),
                needsReply: false,
                dueDate: null,
                method: 'ai'
            },
            {
                id: 'sample_3',
                title: 'Réunion équipe projet Alpha',
                description: 'Point mensuel sur l\'avancement du projet Alpha',
                priority: 'high',
                status: 'in-progress',
                category: 'meeting',
                type: 'réunion',
                hasEmail: false,
                client: 'Interne',
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                updatedAt: new Date(Date.now() - 1800000).toISOString(),
                dueDate: '2025-06-09',
                method: 'manual'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    // Toutes les autres méthodes TaskManager restent EXACTEMENT identiques...
    async createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email:', taskData.title);
        
        const taskId = taskData.id || this.generateId();
        const fullEmailContent = this.extractFullEmailContent(email, taskData);
        const htmlEmailContent = this.extractHtmlEmailContent(email, taskData);
        
        let suggestedReplies = taskData.suggestedReplies || [];
        
        if ((!suggestedReplies || suggestedReplies.length === 0) && 
            (email || taskData.emailFrom) && 
            window.aiTaskAnalyzer) {
            
            try {
                console.log('[TaskManager] Generating AI-powered reply suggestions...');
                suggestedReplies = await this.generateIntelligentReplySuggestions(email || taskData, taskData);
                console.log('[TaskManager] Generated', suggestedReplies.length, 'AI reply suggestions');
            } catch (error) {
                console.warn('[TaskManager] AI reply generation failed:', error);
                suggestedReplies = this.generateBasicReplySuggestions(email || taskData, taskData);
            }
        }
        
        const task = {
            id: taskId,
            title: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'email',
            type: taskData.type || 'email',
            
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || (email?.from?.emailAddress?.address),
            emailFromName: taskData.emailFromName || (email?.from?.emailAddress?.name),
            emailSubject: taskData.emailSubject || email?.subject,
            emailContent: fullEmailContent,
            emailHtmlContent: htmlEmailContent,
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
            aiAnalysis: taskData.aiAnalysis || null,
            
            suggestedReplies: suggestedReplies,
            aiRepliesGenerated: suggestedReplies.length > 0,
            aiRepliesGeneratedAt: suggestedReplies.length > 0 ? new Date().toISOString() : null,
            
            tags: taskData.tags || [],
            client: taskData.client || 'Externe',
            
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

    // Autres méthodes exactement comme dans l'original
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
        
        if (filters.tag && filters.tag !== 'all') {
            filtered = filtered.filter(task => 
                task.tags && Array.isArray(task.tags) && task.tags.includes(filters.tag)
            );
        }
        
        if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            
            filtered = filtered.filter(task => {
                const taskDate = new Date(task.createdAt);
                
                switch (filters.dateRange) {
                    case 'today':
                        return taskDate >= today;
                    case 'week':
                        return taskDate >= weekStart;
                    case 'month':
                        return taskDate >= monthStart;
                    case 'older':
                        return taskDate < monthStart;
                    default:
                        return true;
                }
            });
        }
        
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
            // Sauvegarder en mémoire au lieu de localStorage
            window.taskManagerMemoryStore = this.tasks;
            console.log(`[TaskManager] Saved ${this.tasks.length} tasks in memory`);
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
// MODERN TASKS VIEW - INTERFACE SIMPLE
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
        this.currentViewMode = 'flat';
        this.showCompleted = false;
        this.showAdvancedFilters = true;
        this.showHelpLine = true;
        
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
        const selectedCount = this.selectedTasks.size;
        
        container.innerHTML = `
            <div class="tasks-page-modern">
                <!-- Ligne explicative EN PREMIÈRE LIGNE -->
                ${this.showHelpLine ? this.renderHelpLine() : ''}

                <!-- Barre de contrôles compacte harmonisée -->
                <div class="controls-bar-compact-harmonized">
                    <!-- Modes de vue harmonisés -->
                    <div class="view-modes-harmonized">
                        <button class="view-mode-harmonized ${this.currentViewMode === 'flat' ? 'active' : ''}" 
                                onclick="window.tasksView.changeViewMode('flat')"
                                title="Liste">
                            <i class="fas fa-list"></i>
                            <span>Liste</span>
                        </button>
                        <button class="view-mode-harmonized ${this.currentViewMode === 'grouped-domain' ? 'active' : ''}" 
                                onclick="window.tasksView.changeViewMode('grouped-domain')"
                                title="Par domaine">
                            <i class="fas fa-globe"></i>
                            <span>Domaine</span>
                        </button>
                        <button class="view-mode-harmonized ${this.currentViewMode === 'grouped-sender' ? 'active' : ''}" 
                                onclick="window.tasksView.changeViewMode('grouped-sender')"
                                title="Par expéditeur">
                            <i class="fas fa-user"></i>
                            <span>Expéditeur</span>
                        </button>
                    </div>
                    
                    <!-- Actions principales harmonisées AVEC SÉLECTION SUR DEUX LIGNES -->
                    <div class="action-buttons-harmonized">
                        <!-- Ligne principale toujours visible -->
                        <div class="main-actions-line">
                            <button class="btn-harmonized btn-secondary" onclick="window.tasksView.selectAllVisible()">
                                <i class="fas fa-check-square"></i>
                                <span>Tout sélectionner</span>
                            </button>
                            
                            <button class="btn-harmonized btn-secondary" onclick="window.tasksView.refreshTasks()">
                                <i class="fas fa-sync-alt"></i>
                                <span>Actualiser</span>
                            </button>
                            
                            <button class="btn-harmonized btn-primary" onclick="window.tasksView.showCreateModal()">
                                <i class="fas fa-plus"></i>
                                <span>Nouvelle</span>
                            </button>
                            
                            <button class="btn-harmonized filters-toggle ${this.showAdvancedFilters ? 'active' : ''}" 
                                    onclick="window.tasksView.toggleAdvancedFilters()">
                                <i class="fas fa-filter"></i>
                                <span>Filtres</span>
                                <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                            </button>
                        </div>
                        
                        <!-- Ligne de sélection qui apparaît quand il y a des éléments sélectionnés -->
                        ${selectedCount > 0 ? `
                            <div class="selection-actions-line">
                                <div class="selection-info-harmonized">
                                    <span class="selection-count-harmonized">${selectedCount} sélectionné(s)</span>
                                    <button class="btn-harmonized btn-clear-selection" onclick="window.tasksView.clearSelection()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <button class="btn-harmonized btn-success" onclick="window.tasksView.bulkMarkComplete()">
                                    <i class="fas fa-check"></i>
                                    <span>Terminer</span>
                                </button>
                                <button class="btn-harmonized btn-warning" onclick="window.tasksView.bulkDelete()">
                                    <i class="fas fa-trash"></i>
                                    <span>Supprimer</span>
                                </button>
                                <button class="btn-harmonized btn-primary" onclick="window.tasksView.bulkActions()">
                                    <i class="fas fa-cog"></i>
                                    <span>Plus</span>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Filtres de statut avec recherche intégrée -->
                <div class="status-filters-with-search-harmonized">
                    <!-- Section recherche intégrée -->
                    <div class="search-section-inline-harmonized">
                        <div class="search-box-harmonized">
                            <i class="fas fa-search search-icon-harmonized"></i>
                            <input type="text" 
                                   class="search-input-harmonized" 
                                   id="taskSearchInput"
                                   placeholder="Rechercher tâches..." 
                                   value="${this.currentFilters.search}">
                            ${this.currentFilters.search ? `
                                <button class="search-clear-harmonized" onclick="window.tasksView.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Pills de statut -->
                    <div class="status-pills-row-harmonized">
                        ${this.buildHarmonizedStatusPills(stats)}
                    </div>
                </div>
                
                <div class="advanced-filters-panel ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFiltersPanel">
                    <div class="advanced-filters-grid">
                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-flag"></i> Priorité
                            </label>
                            <select class="filter-select" id="priorityFilter" 
                                    onchange="window.tasksView.updateFilter('priority', this.value)">
                                <option value="all" ${this.currentFilters.priority === 'all' ? 'selected' : ''}>Toutes</option>
                                <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                                <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-building"></i> Client
                            </label>
                            <select class="filter-select" id="clientFilter" 
                                    onchange="window.tasksView.updateFilter('client', this.value)">
                                ${this.buildClientFilterOptions()}
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-sort"></i> Trier par
                            </label>
                            <select class="filter-select" id="sortByFilter" 
                                    onchange="window.tasksView.updateFilter('sortBy', this.value)">
                                <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Date création</option>
                                <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                                <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Date échéance</option>
                                <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre A-Z</option>
                            </select>
                        </div>

                        <div class="filter-actions">
                            <button class="btn-harmonized btn-secondary" onclick="window.tasksView.resetAllFilters()">
                                <i class="fas fa-undo"></i> Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tasks-container-harmonized" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addStyles();
        this.setupEventListeners();
        console.log('[TasksView] Interface rendered successfully');
    }

    renderHelpLine() {
        return `
            <div class="help-line-tasks">
                <div class="help-content-tasks">
                    <i class="fas fa-info-circle help-icon-tasks"></i>
                    <div class="help-text-tasks">
                        <span class="help-main-text-tasks">Gérez vos tâches en sélectionnant celles qui vous intéressent, puis utilisez les boutons d'action pour les traiter, répondre aux emails ou les organiser. Vous pouvez également filtrer par statut ci-dessous.</span>
                    </div>
                </div>
                <button class="help-close-tasks" onclick="window.tasksView.hideHelpLine()" title="Masquer cette aide">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    hideHelpLine() {
        this.showHelpLine = false;
        const helpLine = document.querySelector('.help-line-tasks');
        if (helpLine) {
            helpLine.style.opacity = '0';
            helpLine.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                helpLine.remove();
            }, 300);
        }
    }

    buildHarmonizedStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Tous', icon: '📧', count: stats.total },
            { id: 'todo', name: 'À faire', icon: '⏳', count: stats.todo },
            { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.inProgress },
            { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue },
            { id: 'needsReply', name: 'À répondre', icon: '📧', count: stats.needsReply },
            { id: 'completed', name: 'Terminées', icon: '✅', count: stats.completed }
        ];

        return pills.map(pill => `
            <button class="status-pill-harmonized ${this.isFilterActive(pill.id) ? 'active' : ''}" 
                    data-filter="${pill.id}"
                    onclick="window.tasksView.quickFilter('${pill.id}')">
                <span class="pill-icon-harmonized">${pill.icon}</span>
                <span class="pill-text-harmonized">${pill.name}</span>
                <span class="pill-count-harmonized">${pill.count}</span>
            </button>
        `).join('');
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return this.renderEmptyState();
        }

        return this.renderFlatView(filteredTasks);
    }

    renderFlatView(tasks) {
        return `
            <div class="tasks-list">
                ${tasks.map(task => this.renderTaskItem(task)).join('')}
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3>Aucune tâche trouvée</h3>
                <p>
                    ${this.hasActiveFilters() ? 'Aucune tâche ne correspond à vos critères' : 'Vous n\'avez aucune tâche'}
                </p>
                ${this.hasActiveFilters() ? `
                    <button class="btn-harmonized btn-primary" onclick="window.tasksView.resetAllFilters()">
                        <i class="fas fa-undo"></i>
                        <span>Réinitialiser les filtres</span>
                    </button>
                ` : `
                    <button class="btn-harmonized btn-primary" onclick="window.tasksView.showCreateModal()">
                        <i class="fas fa-plus"></i>
                        <span>Créer votre première tâche</span>
                    </button>
                `}
            </div>
        `;
    }

    renderTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        
        const recipient = task.hasEmail ? 
            (task.emailFromName || task.emailFrom || 'Email inconnu') :
            (task.client !== 'Interne' ? task.client : task.type || 'Tâche');
            
        const priorityColor = this.getPriorityColor(task.priority);
        
        return `
            <div class="task-card ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-bar" style="background-color: ${priorityColor}"></div>
                
                <div class="task-content">
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="task-meta">
                            <span class="task-type">${task.hasEmail ? '📧 Email' : '✓ Tâche'}</span>
                        </div>
                    </div>
                    
                    <div class="task-recipient">
                        <i class="fas ${task.hasEmail ? 'fa-envelope' : 'fa-user'}"></i>
                        <span>${this.escapeHtml(recipient)}</span>
                        ${task.hasEmail && task.needsReply ? '<span class="reply-needed">• Réponse requise</span>' : ''}
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
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        if (task.hasEmail && !task.emailReplied && task.status !== 'completed') {
            actions.push(`
                <button class="action-btn reply" 
                        onclick="event.stopPropagation(); window.tasksView.replyToEmail('${task.id}')"
                        title="Répondre à l'email">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn details" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    getPriorityColor(priority) {
        const colors = {
            urgent: '#ef4444',
            high: '#f97316',
            medium: '#3b82f6',
            low: '#10b981'
        };
        return colors[priority] || colors.medium;
    }

    // Méthodes de base pour l'interface
    handleTaskClick(event, taskId) {
        this.showTaskDetails(taskId);
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
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

    selectAllVisible() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const visibleTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        visibleTasks.forEach(task => {
            this.selectedTasks.add(task.id);
        });
        
        this.render(document.querySelector('.tasks-page-modern')?.parentElement);
        this.showToast(`${visibleTasks.length} tâche(s) sélectionnée(s)`, 'info');
    }

    bulkMarkComplete() {
        if (this.selectedTasks.size === 0) return;
        
        if (confirm(`Marquer ${this.selectedTasks.size} tâche(s) comme terminée(s) ?`)) {
            this.selectedTasks.forEach(taskId => {
                window.taskManager.updateTask(taskId, { status: 'completed' });
            });
            
            this.showToast(`${this.selectedTasks.size} tâche(s) marquée(s) comme terminée(s)`, 'success');
            this.clearSelection();
        }
    }

    bulkDelete() {
        if (this.selectedTasks.size === 0) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedTasks.size} tâche(s) ?`)) {
            this.selectedTasks.forEach(taskId => {
                window.taskManager.deleteTask(taskId);
            });
            
            this.showToast(`${this.selectedTasks.size} tâche(s) supprimée(s)`, 'success');
            this.clearSelection();
        }
    }

    bulkActions() {
        alert('Actions en lot - À implémenter');
    }

    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
        alert(`Détails de la tâche: ${task.title}\n\nStatus: ${task.status}\nPriorité: ${task.priority}`);
    }

    replyToEmail(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        const subject = `Re: ${task.emailSubject || 'Votre message'}`;
        const body = `Bonjour,\n\nMerci pour votre message.\n\nCordialement,`;
        const mailtoLink = `mailto:${task.emailFrom}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.open(mailtoLink);
        window.taskManager.updateTask(taskId, { emailReplied: true });
        this.showToast('Email de réponse ouvert', 'success');
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche marquée comme terminée', 'success');
    }

    showCreateModal() {
        alert('Créer une nouvelle tâche - À implémenter');
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    toggleAdvancedFilters() {
        this.showAdvancedFilters = !this.showAdvancedFilters;
        this.render(document.querySelector('.tasks-page-modern')?.parentElement);
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        const stats = window.taskManager.getStats();
        document.querySelectorAll('.status-pills-row-harmonized').forEach(container => {
            container.innerHTML = this.buildHarmonizedStatusPills(stats);
        });
    }

    refreshTasks() {
        this.refreshView();
        this.showToast('Tâches actualisées', 'success');
    }

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
        
        this.refreshView();
        this.showToast('Filtres réinitialisés', 'info');
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
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply;
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
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addStyles() {
        if (document.getElementById('taskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'taskStyles';
        styles.textContent = `
            /* Interface simple et fonctionnelle */
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 16px;
                font-size: 13px;
            }

            .help-line-tasks {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            }

            .help-content-tasks {
                display: flex;
                align-items: center;
                gap: 16px;
                flex: 1;
            }

            .help-icon-tasks {
                color: #2563eb;
                font-size: 20px;
                background: rgba(255, 255, 255, 0.8);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .help-main-text-tasks {
                color: #1e40af;
                font-size: 14px;
                font-weight: 600;
                line-height: 1.5;
            }

            .help-close-tasks {
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid #bfdbfe;
                border-radius: 8px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #3b82f6;
                font-size: 12px;
            }

            .controls-bar-compact-harmonized {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 12px;
                padding: 12px;
                margin-bottom: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            }

            .view-modes-harmonized {
                display: flex;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                padding: 4px;
                gap: 2px;
            }

            .view-mode-harmonized {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: transparent;
                border: none;
                border-radius: 8px;
                color: #6b7280;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
            }

            .view-mode-harmonized.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            .action-buttons-harmonized {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .main-actions-line,
            .selection-actions-line {
                display: flex;
                align-items: center;
                gap: 8px;
                height: 44px;
            }

            .selection-actions-line {
                background: rgba(59, 130, 246, 0.05);
                padding: 8px;
                border-radius: 10px;
                border: 1px solid rgba(59, 130, 246, 0.2);
                animation: slideInDown 0.3s ease-out;
            }

            .btn-harmonized {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 0 16px;
                height: 44px;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                background: white;
                color: #374151;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-harmonized:hover {
                background: #f9fafb;
                border-color: #6366f1;
                transform: translateY(-1px);
            }

            .btn-harmonized.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
            }

            .btn-harmonized.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }

            .btn-harmonized.btn-success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border-color: transparent;
            }

            .btn-harmonized.btn-warning {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                border-color: transparent;
            }

            .btn-clear-selection {
                width: 44px;
                height: 44px;
                min-width: 44px;
                padding: 0;
                background: #f3f4f6;
                color: #6b7280;
                border: none;
            }

            .selection-info-harmonized {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 0 16px;
                height: 44px;
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: 10px;
                color: #1e40af;
                font-size: 13px;
                font-weight: 600;
            }

            .status-filters-with-search-harmonized {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 12px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            }

            .search-section-inline-harmonized {
                flex: 0 0 300px;
            }

            .search-box-harmonized {
                position: relative;
                width: 100%;
            }

            .search-input-harmonized {
                width: 100%;
                height: 44px;
                padding: 0 12px 0 44px;
                border: 1px solid #d1d5db;
                border-radius: 10px;
                font-size: 13px;
                background: #f9fafb;
                outline: none;
            }

            .search-icon-harmonized {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                pointer-events: none;
            }

            .status-pills-row-harmonized {
                display: flex;
                gap: 8px;
                flex: 1;
                justify-content: stretch;
            }

            .status-pill-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 0 14px;
                height: 44px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                color: #374151;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                flex: 1;
                white-space: nowrap;
            }

            .status-pill-harmonized:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
            }

            .status-pill-harmonized.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
            }

            .pill-count-harmonized {
                background: rgba(0, 0, 0, 0.1);
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 800;
                min-width: 20px;
                text-align: center;
            }

            .status-pill-harmonized.active .pill-count-harmonized {
                background: rgba(255, 255, 255, 0.25);
            }

            .advanced-filters-panel {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 12px;
                margin-bottom: 16px;
                padding: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            }

            .advanced-filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                align-items: end;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .filter-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                font-size: 12px;
                color: #374151;
            }

            .filter-select {
                height: 44px;
                padding: 12px 16px;
                border: 1px solid #d1d5db;
                border-radius: 10px;
                background: white;
                font-size: 13px;
                color: #374151;
                cursor: pointer;
            }

            .tasks-list {
                display: flex;
                flex-direction: column;
                gap: 0;
                background: transparent;
            }

            .task-card {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-height: 76px;
                border-bottom: 1px solid #e5e7eb;
            }

            .task-card:first-child {
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
                border-top: 1px solid #e5e7eb;
            }

            .task-card:last-child {
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            .task-card:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-left: 3px solid #6366f1;
            }

            .task-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
            }

            .task-checkbox {
                margin-right: 12px;
                width: 20px;
                height: 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                cursor: pointer;
                appearance: none;
            }

            .task-checkbox:checked {
                background: #6366f1;
                border-color: #6366f1;
            }

            .priority-bar {
                width: 4px;
                height: 56px;
                border-radius: 2px;
                margin-right: 12px;
            }

            .task-content {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .task-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 12px;
            }

            .task-title {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .task-type {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                color: #475569;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid #e2e8f0;
                white-space: nowrap;
            }

            .task-recipient {
                display: flex;
                align-items: center;
                gap: 4px;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
            }

            .task-recipient i {
                color: #9ca3af;
                font-size: 12px;
            }

            .reply-needed {
                color: #dc2626;
                font-weight: 600;
                font-size: 10px;
            }

            .task-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: 12px;
            }

            .action-btn {
                width: 36px;
                height: 36px;
                border: 2px solid transparent;
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.9);
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 13px;
            }

            .action-btn:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .action-btn.complete {
                color: #16a34a;
            }

            .action-btn.complete:hover {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                border-color: #16a34a;
            }

            .action-btn.reply {
                color: #3b82f6;
            }

            .action-btn.reply:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
            }

            .action-btn.details {
                color: #8b5cf6;
            }

            .action-btn.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: #8b5cf6;
            }

            .empty-state {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
            }

            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }

            .empty-state h3 {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }

            .empty-state p {
                font-size: 15px;
                margin-bottom: 24px;
                color: #6b7280;
                font-weight: 500;
            }

            .loading-state {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 20px;
            }

            .loading-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #6366f1;
            }

            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @media (max-width: 768px) {
                .controls-bar-compact-harmonized {
                    flex-direction: column;
                    gap: 12px;
                }

                .status-filters-with-search-harmonized {
                    flex-direction: column;
                    gap: 12px;
                }

                .search-section-inline-harmonized {
                    flex: none;
                    width: 100%;
                }

                .status-pills-row-harmonized {
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .status-pill-harmonized {
                    flex: 1 1 calc(50% - 4px);
                    min-width: 0;
                }

                .view-mode-harmonized span {
                    display: none;
                }

                .btn-harmonized span {
                    display: none;
                }

                .pill-text-harmonized {
                    display: none;
                }

                .task-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }

                .task-title {
                    font-size: 13px;
                    white-space: normal;
                    line-height: 1.4;
                    max-height: 2.8em;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION - VERSION SIMPLIFIÉE
// =====================================

function initializeTaskManager() {
    console.log('[TaskManager] Initializing global instances v9.1...');
    
    try {
        if (!window.taskManager || !window.taskManager.initialized) {
            window.taskManager = new TaskManager();
        }
        
        if (!window.tasksView) {
            window.tasksView = new TasksView();
        }
        
        // Bind methods safely
        if (window.taskManager) {
            Object.getOwnPropertyNames(TaskManager.prototype).forEach(name => {
                if (name !== 'constructor' && typeof window.taskManager[name] === 'function') {
                    window.taskManager[name] = window.taskManager[name].bind(window.taskManager);
                }
            });
        }

        if (window.tasksView) {
            Object.getOwnPropertyNames(TasksView.prototype).forEach(name => {
                if (name !== 'constructor' && typeof window.tasksView[name] === 'function') {
                    window.tasksView[name] = window.tasksView[name].bind(window.tasksView);
                }
            });
        }
        
        console.log('✅ TaskManager v9.1 loaded - Interface simple et fonctionnelle');
    } catch (error) {
        console.error('[TaskManager] Initialization error:', error);
    }
}

// Initialize immediately
initializeTaskManager();

// Also initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[TaskManager] DOM ready, ensuring initialization...');
    initializeTaskManager();
});

// Fallback initialization
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TaskManager] Fallback initialization...');
            initializeTaskManager();
        }
    }, 1000);
});
