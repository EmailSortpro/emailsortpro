// TaskManager Pro v11.0 - Interface Complètement Harmonisée

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
            console.log('[TaskManager] Initializing v11.0 - Interface harmonisée...');
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
                
                // Assurer que toutes les tâches ont les propriétés requises
                this.tasks = this.tasks.map(task => this.ensureTaskProperties(task));
            } else {
                console.log('[TaskManager] No saved tasks found, creating sample tasks');
                this.generateSampleTasks();
            }
        } catch (error) {
            console.error('[TaskManager] Error loading tasks:', error);
            this.tasks = [];
        }
    }

    ensureTaskProperties(task) {
        return {
            // Propriétés de base obligatoires
            id: task.id || this.generateId(),
            title: task.title || 'Tâche sans titre',
            description: task.description || '',
            priority: task.priority || 'medium',
            status: task.status || 'todo',
            dueDate: task.dueDate || null,
            category: task.category || 'other',
            
            // Métadonnées
            client: task.client || 'Interne',
            tags: Array.isArray(task.tags) ? task.tags : [],
            
            // Email info - ENRICHIES
            hasEmail: task.hasEmail || false,
            emailId: task.emailId || null,
            emailFrom: task.emailFrom || null,
            emailFromName: task.emailFromName || null,
            emailSubject: task.emailSubject || null,
            emailContent: task.emailContent || '',
            emailHtmlContent: task.emailHtmlContent || '',
            emailImages: Array.isArray(task.emailImages) ? task.emailImages : [],
            emailAttachments: Array.isArray(task.emailAttachments) ? task.emailAttachments : [],
            emailConversation: Array.isArray(task.emailConversation) ? task.emailConversation : [],
            emailDomain: task.emailDomain || null,
            emailDate: task.emailDate || null,
            emailReplied: task.emailReplied || false,
            needsReply: task.needsReply || false,
            hasAttachments: task.hasAttachments || false,
            
            // Données structurées IA
            summary: task.summary || '',
            actions: Array.isArray(task.actions) ? task.actions : [],
            keyInfo: Array.isArray(task.keyInfo) ? task.keyInfo : [],
            risks: Array.isArray(task.risks) ? task.risks : [],
            aiAnalysis: task.aiAnalysis || null,
            
            // Suggestions de réponse IA
            suggestedReplies: Array.isArray(task.suggestedReplies) ? task.suggestedReplies : this.generateBasicReplies(task),
            aiRepliesGenerated: task.aiRepliesGenerated || false,
            aiRepliesGeneratedAt: task.aiRepliesGeneratedAt || null,
            
            // Timestamps
            createdAt: task.createdAt || new Date().toISOString(),
            updatedAt: task.updatedAt || new Date().toISOString(),
            completedAt: task.completedAt || null,
            
            // Méthode de création
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
                description: 'Réponse professionnelle standard',
                generatedBy: 'basic-template',
                generatedAt: new Date().toISOString()
            },
            {
                tone: 'détaillé',
                subject: `Re: ${subject} - Réponse détaillée`,
                content: `Bonjour ${senderName},\n\nJe vous confirme la bonne réception de votre message.\n\nJ'étudie attentivement votre demande et je vous recontacte rapidement avec les éléments nécessaires.\n\nN'hésitez pas à me recontacter si vous avez des questions complémentaires.\n\nCordialement,\n[Votre nom]`,
                description: 'Réponse complète et détaillée',
                generatedBy: 'basic-template',
                generatedAt: new Date().toISOString()
            }
        ];
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
                emailImages: [
                    {
                        name: 'campagne-visuel-1.jpg',
                        url: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f0f9ff"/><text x="150" y="100" text-anchor="middle" fill="#3b82f6" font-family="Arial" font-size="16">Visuel Campagne Q2</text></svg>'),
                        size: '245 KB',
                        type: 'image/jpeg'
                    }
                ],
                tags: ['marketing', 'validation', 'q2'],
                client: 'ACME Corp',
                dueDate: '2025-06-20',
                needsReply: true,
                summary: 'Validation urgente de la campagne marketing Q2 avec budget de 50k€',
                actions: [
                    { text: 'Valider les visuels de la campagne', deadline: null },
                    { text: 'Confirmer le budget alloué', deadline: '2025-06-18' },
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
                title: 'Préparer présentation trimestrielle',
                description: 'Préparer la présentation des résultats Q1 pour le comité de direction',
                priority: 'medium',
                status: 'in-progress',
                category: 'work',
                client: 'Direction',
                dueDate: '2025-06-25',
                summary: 'Présentation des résultats trimestriels avec analyse des performances',
                actions: [
                    { text: 'Collecter les données financières', deadline: '2025-06-22' },
                    { text: 'Créer les graphiques', deadline: '2025-06-24' },
                    { text: 'Répéter la présentation', deadline: '2025-06-25' }
                ],
                keyInfo: [
                    'Résultats Q1 en hausse de 15%',
                    'Nouveau client majeur acquis',
                    'Équipe agrandie de 3 personnes'
                ],
                method: 'manual'
            },
            {
                id: 'sample_3',
                title: 'Répondre à Trainline - Offres Trenitalia',
                description: '📧 RÉSUMÉ EXÉCUTIF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDe: Trainline <no-reply@comms.trainline.com>\nObjet: 20 % offerts sur les nouveaux trajets Trenitalia !\n📮 Email marketing\n\n🎯 ACTIONS REQUISES:\n1. Évaluer l\'offre promotionnelle\n2. Planifier voyage en Italie si pertinent\n\n💡 INFORMATIONS CLÉS:\n• Réduction de 20% sur trajets Trenitalia\n• Promotion limitée dans le temps\n• Nouveaux trajets uniquement',
                priority: 'low',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'no-reply@comms.trainline.com',
                emailFromName: 'Trainline',
                emailSubject: '20 % offerts sur les nouveaux trajets Trenitalia !',
                emailDate: '2025-06-16T10:20:03Z',
                emailDomain: 'trainline.com',
                client: 'Trainline',
                dueDate: '2025-06-30',
                needsReply: false,
                summary: 'Offre promotionnelle Trainline pour trajets Trenitalia avec 20% de réduction',
                method: 'ai'
            }
        ];
        
        // Assurer les propriétés complètes pour chaque tâche
        this.tasks = sampleTasks.map(task => this.ensureTaskProperties(task));
        this.saveTasks();
    }

    // ================================================
    // MÉTHODES CRUD COMPLÈTES
    // ================================================
    
    createTask(taskData) {
        console.log('[TaskManager] Creating task:', taskData.title || 'Untitled');
        
        const task = this.ensureTaskProperties({
            ...taskData,
            id: taskData.id || this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        console.log('[TaskManager] Task created successfully:', task.id);
        return task;
    }

    updateTask(id, updates) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) {
            console.error('[TaskManager] Task not found for update:', id);
            return null;
        }
        
        this.tasks[index] = this.ensureTaskProperties({
            ...this.tasks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        if (updates.status === 'completed' && !this.tasks[index].completedAt) {
            this.tasks[index].completedAt = new Date().toISOString();
        }
        
        this.saveTasks();
        this.emitTaskUpdate('update', this.tasks[index]);
        
        console.log('[TaskManager] Task updated successfully:', id);
        return this.tasks[index];
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) {
            console.error('[TaskManager] Task not found for deletion:', id);
            return null;
        }
        
        const deleted = this.tasks.splice(index, 1)[0];
        this.saveTasks();
        this.emitTaskUpdate('delete', deleted);
        
        console.log('[TaskManager] Task deleted successfully:', id);
        return deleted;
    }

    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    getAllTasks() {
        return [...this.tasks];
    }

    // ================================================
    // MÉTHODES DE FILTRAGE ET TRI
    // ================================================
    
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
            case 'client':
                sorted.sort((a, b) => a.client.localeCompare(b.client));
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

    // ================================================
    // STATISTIQUES
    // ================================================
    
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

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
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
// TASKS VIEW - INTERFACE HARMONISÉE v11.0
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
        this.currentViewMode = 'normal'; // normal, minimal, detailed
        this.showCompleted = false;
        this.showAdvancedFilters = false;
        
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
                <div class="loading-state-harmonized">
                    <div class="loading-icon-harmonized">
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
        const visibleTasks = this.getVisibleTasks();
        const visibleCount = visibleTasks.length;
        
        container.innerHTML = `
            <div class="tasks-page-harmonized">
                <!-- Barre de recherche harmonisée -->
                <div class="search-bar-harmonized">
                    <div class="search-container-harmonized">
                        <i class="fas fa-search search-icon-harmonized"></i>
                        <input type="text" 
                               class="search-input-harmonized" 
                               id="taskSearchInput"
                               placeholder="Rechercher tâches, clients, contenus..." 
                               value="${this.currentFilters.search}">
                        ${this.currentFilters.search ? `
                            <button class="search-clear-harmonized" onclick="window.tasksView.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Barre d'actions harmonisée -->
                <div class="actions-bar-harmonized">
                    <div class="actions-left-harmonized">
                        <!-- Modes de vue harmonisés -->
                        <div class="view-modes-harmonized">
                            <button class="btn-harmonized view-mode ${this.currentViewMode === 'minimal' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('minimal')">
                                <i class="fas fa-th-list"></i>
                                <span>Minimal</span>
                            </button>
                            <button class="btn-harmonized view-mode ${this.currentViewMode === 'normal' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('normal')">
                                <i class="fas fa-list"></i>
                                <span>Normal</span>
                            </button>
                            <button class="btn-harmonized view-mode ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('detailed')">
                                <i class="fas fa-th-large"></i>
                                <span>Détaillé</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="actions-right-harmonized">
                        ${selectedCount > 0 ? `
                            <div class="selection-info-harmonized">
                                <i class="fas fa-check-square"></i>
                                <span>${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''}</span>
                                <button class="btn-harmonized clear-selection" onclick="window.tasksView.clearSelection()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        ` : ''}
                        
                        <button class="btn-harmonized ${visibleCount === 0 ? 'disabled' : ''}" 
                                onclick="window.tasksView.selectAllVisible()"
                                ${visibleCount === 0 ? 'disabled' : ''}>
                            <i class="fas fa-check-double"></i>
                            <span>Tout sélectionner</span>
                            ${visibleCount > 0 ? `<span class="count-badge">${visibleCount}</span>` : ''}
                        </button>
                        
                        <button class="btn-harmonized" onclick="window.tasksView.refreshTasks()">
                            <i class="fas fa-sync-alt"></i>
                            <span>Actualiser</span>
                        </button>
                        
                        ${selectedCount > 0 ? `
                            <button class="btn-harmonized primary" onclick="window.tasksView.showBulkActions()">
                                <i class="fas fa-cog"></i>
                                <span>Actions</span>
                                <span class="count-badge">${selectedCount}</span>
                            </button>
                        ` : ''}
                        
                        <button class="btn-harmonized primary" onclick="window.tasksView.showCreateModal()">
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
                </div>

                <!-- Filtres de statut harmonisés -->
                <div class="status-filters-harmonized">
                    ${this.buildHarmonizedStatusPills(stats)}
                </div>
                
                <!-- Panneau de filtres avancés -->
                <div class="advanced-filters-panel-harmonized ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFiltersPanel">
                    <div class="filters-grid-harmonized">
                        <div class="filter-group-harmonized">
                            <label class="filter-label-harmonized">
                                <i class="fas fa-flag"></i> Priorité
                            </label>
                            <select class="filter-select-harmonized" id="priorityFilter" 
                                    onchange="window.tasksView.updateFilter('priority', this.value)">
                                <option value="all" ${this.currentFilters.priority === 'all' ? 'selected' : ''}>Toutes</option>
                                <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                                <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>

                        <div class="filter-group-harmonized">
                            <label class="filter-label-harmonized">
                                <i class="fas fa-building"></i> Client
                            </label>
                            <select class="filter-select-harmonized" id="clientFilter" 
                                    onchange="window.tasksView.updateFilter('client', this.value)">
                                ${this.buildClientFilterOptions()}
                            </select>
                        </div>

                        <div class="filter-group-harmonized">
                            <label class="filter-label-harmonized">
                                <i class="fas fa-sort"></i> Trier par
                            </label>
                            <select class="filter-select-harmonized" id="sortByFilter" 
                                    onchange="window.tasksView.updateFilter('sortBy', this.value)">
                                <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Date création</option>
                                <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                                <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Date échéance</option>
                                <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre A-Z</option>
                                <option value="client" ${this.currentFilters.sortBy === 'client' ? 'selected' : ''}>Client</option>
                            </select>
                        </div>

                        <div class="filter-actions-harmonized">
                            <button class="btn-harmonized secondary" onclick="window.tasksView.resetAllFilters()">
                                <i class="fas fa-undo"></i> 
                                <span>Réinitialiser</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Container des tâches -->
                <div class="tasks-container-harmonized" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addHarmonizedStyles();
        this.setupEventListeners();
        console.log('[TasksView] Interface harmonisée rendue avec', visibleCount, 'tâches visibles');
    }

    buildHarmonizedStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Tous', icon: 'fas fa-list', count: stats.total },
            { id: 'todo', name: 'À faire', icon: 'fas fa-clock', count: stats.todo },
            { id: 'in-progress', name: 'En cours', icon: 'fas fa-play', count: stats.inProgress },
            { id: 'overdue', name: 'En retard', icon: 'fas fa-exclamation-triangle', count: stats.overdue },
            { id: 'needsReply', name: 'À répondre', icon: 'fas fa-reply', count: stats.needsReply },
            { id: 'completed', name: 'Terminées', icon: 'fas fa-check', count: stats.completed }
        ];

        return pills.map(pill => `
            <button class="btn-harmonized status-pill ${this.isFilterActive(pill.id) ? 'active' : ''}" 
                    data-filter="${pill.id}"
                    onclick="window.tasksView.quickFilter('${pill.id}')">
                <i class="${pill.icon}"></i>
                <span class="pill-count">${pill.count}</span>
                <span class="pill-label">${pill.name}</span>
            </button>
        `).join('');
    }

    renderTasksList() {
        const tasks = this.getVisibleTasks();
        
        if (tasks.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'minimal':
                return this.renderMinimalView(tasks);
            case 'detailed':
                return this.renderDetailedView(tasks);
            case 'normal':
            default:
                return this.renderNormalView(tasks);
        }
    }

    getVisibleTasks() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        return this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
    }

    // ================================================
    // VUE MINIMALISTE HARMONISÉE
    // ================================================
    
    renderMinimalView(tasks) {
        return `
            <div class="tasks-minimal-harmonized">
                ${tasks.map(task => this.renderMinimalTaskItem(task)).join('')}
            </div>
        `;
    }

    renderMinimalTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityInfo = this.getPriorityInfo(task.priority);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-minimal-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-indicator priority-${task.priority}" 
                     title="Priorité ${priorityInfo.label}">
                    <i class="${priorityInfo.icon}"></i>
                </div>
                
                <div class="task-content-minimal">
                    <div class="task-title-minimal">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta-minimal">
                        <div class="meta-group-minimal">
                            <span class="meta-item-minimal">
                                <i class="fas fa-building"></i>
                                <span>${this.escapeHtml(task.client)}</span>
                            </span>
                            <span class="meta-item-minimal ${dueDateInfo.className}">
                                <i class="fas fa-calendar"></i>
                                <span>${dueDateInfo.text || 'Pas d\'échéance'}</span>
                            </span>
                            ${task.hasEmail ? '<span class="meta-item-minimal email"><i class="fas fa-envelope"></i><span>Email</span></span>' : ''}
                            ${task.needsReply ? '<span class="meta-item-minimal reply"><i class="fas fa-reply"></i><span>Réponse</span></span>' : ''}
                            ${task.emailImages && task.emailImages.length > 0 ? `<span class="meta-item-minimal images"><i class="fas fa-image"></i><span>${task.emailImages.length}</span></span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="task-actions-minimal">
                    ${this.renderTaskActions(task, 'minimal')}
                </div>
            </div>
        `;
    }

    // ================================================
    // VUE NORMALE HARMONISÉE
    // ================================================
    
    renderNormalView(tasks) {
        return `
            <div class="tasks-normal-harmonized">
                ${tasks.map(task => this.renderNormalTaskItem(task)).join('')}
            </div>
        `;
    }

    renderNormalTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityInfo = this.getPriorityInfo(task.priority);
        const statusInfo = this.getStatusInfo(task.status);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-normal-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-bar priority-${task.priority}"></div>
                
                <div class="task-main-content">
                    <div class="task-header-normal">
                        <h3 class="task-title-normal">${this.escapeHtml(task.title)}</h3>
                        <div class="task-status-badges">
                            <span class="badge type-badge">
                                <i class="${task.hasEmail ? 'fas fa-envelope' : 'fas fa-tasks'}"></i>
                                <span>${task.hasEmail ? 'Email' : 'Tâche'}</span>
                            </span>
                            <span class="badge priority-badge priority-${task.priority}">
                                <i class="${priorityInfo.icon}"></i>
                                <span>${priorityInfo.label}</span>
                            </span>
                            <span class="badge deadline-badge ${dueDateInfo.className}">
                                <i class="fas fa-calendar"></i>
                                <span>${dueDateInfo.text || 'Pas d\'échéance'}</span>
                            </span>
                        </div>
                    </div>
                    
                    <div class="task-meta-normal">
                        <div class="meta-group-normal">
                            <span class="meta-item-normal">
                                <i class="fas fa-building"></i>
                                <span>${this.escapeHtml(task.client)}</span>
                            </span>
                            ${task.hasEmail && task.emailFromName ? `
                                <span class="meta-item-normal">
                                    <i class="fas fa-user"></i>
                                    <span>${this.escapeHtml(task.emailFromName)}</span>
                                </span>
                            ` : ''}
                            ${task.needsReply ? `
                                <span class="meta-item-normal reply-needed">
                                    <i class="fas fa-reply"></i>
                                    <span>Réponse requise</span>
                                </span>
                            ` : ''}
                            ${task.emailImages && task.emailImages.length > 0 ? `
                                <span class="meta-item-normal has-images">
                                    <i class="fas fa-image"></i>
                                    <span>${task.emailImages.length} image${task.emailImages.length > 1 ? 's' : ''}</span>
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="task-actions-normal">
                    ${this.renderTaskActions(task, 'normal')}
                </div>
            </div>
        `;
    }

    // ================================================
    // VUE DÉTAILLÉE HARMONISÉE
    // ================================================
    
    renderDetailedView(tasks) {
        return `
            <div class="tasks-detailed-harmonized">
                ${tasks.map(task => this.renderDetailedTaskItem(task)).join('')}
            </div>
        `;
    }

    renderDetailedTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityInfo = this.getPriorityInfo(task.priority);
        const statusInfo = this.getStatusInfo(task.status);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-detailed-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                
                <div class="task-detailed-header">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="task-indicators">
                        <div class="priority-indicator priority-${task.priority}" 
                             title="Priorité ${priorityInfo.label}">
                            <i class="${priorityInfo.icon}"></i>
                        </div>
                        <div class="status-indicator status-${task.status}" 
                             title="Statut ${statusInfo.label}">
                            <i class="${statusInfo.icon}"></i>
                        </div>
                    </div>
                </div>
                
                <div class="task-detailed-content">
                    <h3 class="task-title-detailed" onclick="window.tasksView.showTaskDetails('${task.id}')">${this.escapeHtml(task.title)}</h3>
                    ${task.description ? `
                        <p class="task-description-detailed">${this.escapeHtml(task.description.substring(0, 150))}${task.description.length > 150 ? '...' : ''}</p>
                    ` : ''}
                    
                    <div class="task-status-badges">
                        <span class="badge type-badge">
                            <i class="${task.hasEmail ? 'fas fa-envelope' : 'fas fa-tasks'}"></i>
                            <span>${task.hasEmail ? 'Email' : 'Tâche'}</span>
                        </span>
                        <span class="badge priority-badge priority-${task.priority}">
                            <i class="${priorityInfo.icon}"></i>
                            <span>${priorityInfo.label}</span>
                        </span>
                        <span class="badge deadline-badge ${dueDateInfo.className}">
                            <i class="fas fa-calendar"></i>
                            <span>${dueDateInfo.text || 'Pas d\'échéance'}</span>
                        </span>
                    </div>
                    
                    <div class="task-meta-detailed">
                        <div class="meta-group-detailed">
                            <span class="meta-item-detailed">
                                <i class="fas fa-building"></i>
                                <span>${this.escapeHtml(task.client)}</span>
                            </span>
                            ${task.hasEmail && task.emailFromName ? `
                                <span class="meta-item-detailed">
                                    <i class="fas fa-user"></i>
                                    <span>${this.escapeHtml(task.emailFromName)}</span>
                                </span>
                            ` : ''}
                            ${task.needsReply ? `
                                <span class="meta-item-detailed reply-needed">
                                    <i class="fas fa-reply"></i>
                                    <span>Réponse requise</span>
                                </span>
                            ` : ''}
                            ${task.emailImages && task.emailImages.length > 0 ? `
                                <span class="meta-item-detailed has-images">
                                    <i class="fas fa-image"></i>
                                    <span>${task.emailImages.length} image${task.emailImages.length > 1 ? 's' : ''}</span>
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="task-detailed-actions">
                    ${this.renderTaskActions(task, 'detailed')}
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTIONS HARMONISÉES
    // ================================================
    
    renderTaskActions(task, viewType = 'normal') {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="btn-harmonized success action-complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                    ${viewType === 'detailed' ? '<span>Terminé</span>' : ''}
                </button>
            `);
        }
        
        actions.push(`
            <button class="btn-harmonized secondary action-edit" 
                    onclick="event.stopPropagation(); window.tasksView.showEditModal('${task.id}')"
                    title="Modifier">
                <i class="fas fa-edit"></i>
                ${viewType === 'detailed' ? '<span>Modifier</span>' : ''}
            </button>
        `);
        
        actions.push(`
            <button class="btn-harmonized primary action-details" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye"></i>
                ${viewType === 'detailed' ? '<span>Détails</span>' : ''}
            </button>
        `);
        
        if (task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0) {
            actions.push(`
                <button class="btn-harmonized info action-reply" 
                        onclick="event.stopPropagation(); window.tasksView.showSuggestedReplies('${task.id}')"
                        title="Suggestions de réponse">
                    <i class="fas fa-reply"></i>
                    ${viewType === 'detailed' ? '<span>Réponses</span>' : ''}
                </button>
            `);
        }
        
        return actions.join('');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
    getPriorityInfo(priority) {
        const priorities = {
            urgent: { label: 'Urgente', icon: 'fas fa-exclamation-circle', color: '#ef4444' },
            high: { label: 'Haute', icon: 'fas fa-arrow-up', color: '#f97316' },
            medium: { label: 'Normale', icon: 'fas fa-minus', color: '#3b82f6' },
            low: { label: 'Basse', icon: 'fas fa-arrow-down', color: '#10b981' }
        };
        return priorities[priority] || priorities.medium;
    }

    getStatusInfo(status) {
        const statuses = {
            todo: { label: 'À faire', icon: 'fas fa-clock' },
            'in-progress': { label: 'En cours', icon: 'fas fa-play-circle' },
            completed: { label: 'Terminé', icon: 'fas fa-check-circle' }
        };
        return statuses[status] || statuses.todo;
    }

    formatDueDate(dateString) {
        if (!dateString) {
            return { text: '', className: 'no-deadline' };
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
        
        return { text, className };
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ================================================
    // INTERACTIONS
    // ================================================
    
    handleTaskClick(event, taskId) {
        if (event.target.type === 'checkbox' || event.target.closest('.task-actions-minimal, .task-actions-normal, .task-detailed-actions')) {
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
        
        this.updateSelectionUI();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.refreshView();
        this.showToast('Sélection effacée', 'info');
    }

    selectAllVisible() {
        const visibleTasks = this.getVisibleTasks();
        const allSelected = visibleTasks.length > 0 && visibleTasks.every(task => this.selectedTasks.has(task.id));
        
        if (allSelected) {
            visibleTasks.forEach(task => {
                this.selectedTasks.delete(task.id);
            });
            this.showToast(`${visibleTasks.length} tâches désélectionnées`, 'info');
        } else {
            visibleTasks.forEach(task => {
                this.selectedTasks.add(task.id);
            });
            this.showToast(`${visibleTasks.length} tâches sélectionnées`, 'success');
        }
        
        this.refreshView();
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { 
            status: 'completed',
            completedAt: new Date().toISOString()
        });
        this.showToast('Tâche marquée comme terminée', 'success');
        this.refreshView();
    }

    refreshTasks() {
        this.refreshView();
        this.showToast('Tâches actualisées', 'success');
    }

    // ================================================
    // FILTRES
    // ================================================
    
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
        
        document.querySelectorAll('.filter-select-harmonized').forEach(select => {
            if (select.querySelector('option[value="all"]')) {
                select.value = 'all';
            } else if (select.id === 'sortByFilter') {
                select.value = 'created';
            }
        });
        
        this.refreshView();
        this.showToast('Filtres réinitialisés', 'info');
    }

    toggleAdvancedFilters() {
        this.showAdvancedFilters = !this.showAdvancedFilters;
        
        const panel = document.getElementById('advancedFiltersPanel');
        const toggle = document.querySelector('.filters-toggle');
        
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

    // ================================================
    // RECHERCHE
    // ================================================
    
    handleSearch(value) {
        this.currentFilters.search = value.trim();
        this.refreshView();
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        this.refreshView();
    }

    // ================================================
    // MODALES
    // ================================================
    
    showTaskDetails(taskId) {
        // TODO: Implement task details modal
        console.log('Show task details for:', taskId);
    }

    showEditModal(taskId) {
        // TODO: Implement edit modal
        console.log('Show edit modal for:', taskId);
    }

    showCreateModal() {
        // TODO: Implement create modal
        console.log('Show create modal');
    }

    showBulkActions() {
        // TODO: Implement bulk actions modal
        console.log('Show bulk actions');
    }

    showSuggestedReplies(taskId) {
        // TODO: Implement suggested replies modal
        console.log('Show suggested replies for:', taskId);
    }

    // ================================================
    // UI UPDATES
    // ================================================
    
    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        const stats = window.taskManager.getStats();
        const pillsContainer = document.querySelector('.status-filters-harmonized');
        if (pillsContainer) {
            pillsContainer.innerHTML = this.buildHarmonizedStatusPills(stats);
        }
        
        this.updateSelectionUI();
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

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.currentFilters.search) {
            title = 'Aucun résultat trouvé';
            text = `Aucune tâche ne correspond à votre recherche "${this.currentFilters.search}"`;
            action = `
                <button class="btn-harmonized primary" onclick="window.tasksView.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.hasActiveFilters()) {
            title = 'Aucune tâche trouvée';
            text = 'Aucune tâche ne correspond à vos critères de filtrage.';
            action = `
                <button class="btn-harmonized primary" onclick="window.tasksView.resetAllFilters()">
                    <i class="fas fa-undo"></i>
                    <span>Réinitialiser les filtres</span>
                </button>
            `;
        } else {
            title = 'Aucune tâche';
            text = 'Vous n\'avez aucune tâche pour le moment.';
            action = `
                <button class="btn-harmonized primary" onclick="window.tasksView.showCreateModal()">
                    <i class="fas fa-plus"></i>
                    <span>Créer votre première tâche</span>
                </button>
            `;
        }
        
        return `
            <div class="empty-state-harmonized">
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

    showToast(message, type = 'info') {
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    // ================================================
    // STYLES HARMONISÉS v11.0
    // ================================================
    
    addHarmonizedStyles() {
        if (document.getElementById('harmonizedTaskStylesV11')) return;
        
        const styles = document.createElement('style');
        styles.id = 'harmonizedTaskStylesV11';
        styles.textContent = `
            /* Variables CSS Harmonisées v11.0 */
            :root {
                --btn-height: 44px;
                --btn-padding: 12px 16px;
                --btn-font-size: 14px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-gap: 8px;
                
                --icon-size: 16px;
                --icon-size-sm: 14px;
                --icon-size-lg: 20px;
                
                --spacing-xs: 4px;
                --spacing-sm: 8px;
                --spacing-md: 12px;
                --spacing-lg: 16px;
                --spacing-xl: 24px;
                
                --border-radius: 10px;
                --border-radius-sm: 6px;
                --border-radius-lg: 16px;
                
                --color-primary: #3b82f6;
                --color-primary-dark: #2563eb;
                --color-success: #10b981;
                --color-warning: #f59e0b;
                --color-danger: #ef4444;
                --color-info: #0ea5e9;
                --color-gray: #6b7280;
                --color-gray-light: #f3f4f6;
                --color-gray-dark: #374151;
                
                --bg-white: #ffffff;
                --bg-gray-50: #f9fafb;
                --bg-gray-100: #f3f4f6;
                
                --text-primary: #1f2937;
                --text-secondary: #6b7280;
                --text-muted: #9ca3af;
                
                --border-color: #e5e7eb;
                --border-color-light: #f3f4f6;
                
                --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                
                --transition: all 0.15s ease-in-out;
            }
            
            /* Reset et base */
            * {
                box-sizing: border-box;
            }
            
            /* Page principale harmonisée */
            .tasks-page-harmonized {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                min-height: 100vh;
                padding: var(--spacing-xl);
                color: var(--text-primary);
                font-size: var(--btn-font-size);
            }

            /* Barre de recherche harmonisée */
            .search-bar-harmonized {
                margin-bottom: var(--spacing-lg);
            }
            
            .search-container-harmonized {
                position: relative;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .search-input-harmonized {
                width: 100%;
                height: 52px;
                padding: 0 var(--spacing-xl) 0 52px;
                border: 2px solid var(--border-color);
                border-radius: 26px;
                font-size: 16px;
                background: var(--bg-white);
                transition: var(--transition);
                outline: none;
                box-shadow: var(--shadow-sm);
            }
            
            .search-input-harmonized:focus {
                border-color: var(--color-primary);
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), var(--shadow-sm);
            }
            
            .search-icon-harmonized {
                position: absolute;
                left: var(--spacing-lg);
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-secondary);
                font-size: var(--icon-size-lg);
                pointer-events: none;
            }
            
            .search-clear-harmonized {
                position: absolute;
                right: var(--spacing-lg);
                top: 50%;
                transform: translateY(-50%);
                background: var(--color-danger);
                color: var(--bg-white);
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
            
            .search-clear-harmonized:hover {
                background: #dc2626;
                transform: translateY(-50%) scale(1.1);
            }

            /* Boutons harmonisés - BASE COMMUNE */
            .btn-harmonized {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                height: var(--btn-height);
                padding: var(--btn-padding);
                background: var(--bg-white);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: var(--transition);
                box-shadow: var(--shadow-sm);
                position: relative;
                white-space: nowrap;
                text-decoration: none;
                outline: none;
            }
            
            .btn-harmonized i {
                font-size: var(--icon-size);
                flex-shrink: 0;
            }
            
            .btn-harmonized:hover:not(.disabled) {
                background: var(--bg-gray-50);
                border-color: var(--color-primary);
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }
            
            .btn-harmonized:active:not(.disabled) {
                transform: translateY(0);
                box-shadow: var(--shadow-sm);
            }
            
            /* Variantes de boutons */
            .btn-harmonized.primary {
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
                color: var(--bg-white);
                border-color: transparent;
            }
            
            .btn-harmonized.primary:hover {
                background: linear-gradient(135deg, var(--color-primary-dark) 0%, #1d4ed8 100%);
                transform: translateY(-2px);
            }
            
            .btn-harmonized.secondary {
                background: var(--bg-gray-100);
                color: var(--color-gray-dark);
            }
            
            .btn-harmonized.success {
                background: var(--color-success);
                color: var(--bg-white);
                border-color: transparent;
            }
            
            .btn-harmonized.success:hover {
                background: #059669;
            }
            
            .btn-harmonized.warning {
                background: var(--color-warning);
                color: var(--bg-white);
                border-color: transparent;
            }
            
            .btn-harmonized.warning:hover {
                background: #d97706;
            }
            
            .btn-harmonized.danger {
                background: var(--color-danger);
                color: var(--bg-white);
                border-color: transparent;
            }
            
            .btn-harmonized.danger:hover {
                background: #dc2626;
            }
            
            .btn-harmonized.info {
                background: var(--color-info);
                color: var(--bg-white);
                border-color: transparent;
            }
            
            .btn-harmonized.info:hover {
                background: #0284c7;
            }
            
            .btn-harmonized.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }
            
            /* Badges harmonisés */
            .count-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: var(--color-danger);
                color: var(--bg-white);
                font-size: 11px;
                font-weight: 700;
                padding: 3px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                border: 2px solid var(--bg-white);
                animation: badgePulse 2s ease-in-out infinite;
            }
            
            @keyframes badgePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            /* Barre d'actions harmonisée */
            .actions-bar-harmonized {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--spacing-lg);
                background: var(--bg-white);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                padding: var(--spacing-lg) var(--spacing-xl);
                margin-bottom: var(--spacing-lg);
                box-shadow: var(--shadow-sm);
            }
            
            .actions-left-harmonized,
            .actions-right-harmonized {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                flex-wrap: wrap;
            }
            
            /* Modes de vue harmonisés */
            .view-modes-harmonized {
                display: flex;
                background: var(--bg-gray-100);
                border: 1px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                padding: 2px;
                gap: 2px;
            }
            
            .btn-harmonized.view-mode {
                height: 40px;
                padding: 0 var(--spacing-md);
                background: transparent;
                border: none;
                box-shadow: none;
                color: var(--text-secondary);
                border-radius: calc(var(--btn-border-radius) - 2px);
                min-width: 80px;
            }
            
            .btn-harmonized.view-mode:hover {
                background: rgba(255, 255, 255, 0.8);
                color: var(--text-primary);
                box-shadow: none;
                transform: none;
            }
            
            .btn-harmonized.view-mode.active {
                background: var(--bg-white);
                color: var(--color-primary);
                box-shadow: var(--shadow-sm);
                font-weight: 700;
                transform: none;
            }
            
            /* Sélection info harmonisée */
            .selection-info-harmonized {
                display: flex;
                align-items: center;
                gap: var(--btn-gap);
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: var(--btn-border-radius);
                padding: var(--spacing-sm) var(--spacing-md);
                color: #1e40af;
                font-weight: 600;
                height: var(--btn-height);
            }
            
            .btn-harmonized.clear-selection {
                background: rgba(239, 68, 68, 0.1);
                color: var(--color-danger);
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                padding: 0;
                margin-left: var(--spacing-xs);
            }
            
            .btn-harmonized.clear-selection:hover {
                background: rgba(239, 68, 68, 0.2);
                transform: scale(1.1);
            }

            /* Filtres de statut harmonisés */
            .status-filters-harmonized {
                display: flex;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-xl);
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .btn-harmonized.status-pill {
                flex-direction: column;
                height: auto;
                min-height: 80px;
                padding: var(--spacing-md) var(--spacing-lg);
                min-width: 120px;
                gap: var(--spacing-sm);
            }
            
            .btn-harmonized.status-pill:hover {
                border-color: var(--color-primary);
                background: #f0f9ff;
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }
            
            .btn-harmonized.status-pill.active {
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
                color: var(--bg-white);
                border-color: var(--color-primary);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
            }
            
            .pill-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 3px var(--spacing-sm);
                border-radius: 12px;
                font-size: 12px;
                font-weight: 700;
                min-width: 20px;
                text-align: center;
            }
            
            .btn-harmonized.status-pill.active .pill-count {
                background: rgba(255, 255, 255, 0.3);
                color: var(--bg-white);
            }
            
            .pill-label {
                font-weight: 600;
                font-size: 13px;
                text-align: center;
            }

            /* Panneau de filtres avancés */
            .advanced-filters-panel-harmonized {
                background: var(--bg-white);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                margin-bottom: var(--spacing-xl);
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
                opacity: 0;
                box-shadow: var(--shadow-sm);
            }
            
            .advanced-filters-panel-harmonized.show {
                max-height: 200px;
                opacity: 1;
                padding: var(--spacing-xl);
            }
            
            .filters-grid-harmonized {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--spacing-lg);
                align-items: end;
            }
            
            .filter-group-harmonized {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
            
            .filter-label-harmonized {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-weight: 600;
                font-size: 13px;
                color: var(--text-primary);
            }
            
            .filter-label-harmonized i {
                font-size: var(--icon-size-sm);
            }
            
            .filter-select-harmonized {
                height: var(--btn-height);
                padding: 0 var(--spacing-lg);
                border: 1px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                background: var(--bg-white);
                font-size: var(--btn-font-size);
                color: var(--text-primary);
                cursor: pointer;
                transition: var(--transition);
            }
            
            .filter-select-harmonized:focus {
                outline: none;
                border-color: var(--color-primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            /* Container principal des tâches */
            .tasks-container-harmonized {
                background: transparent;
            }

            /* Éléments communs harmonisés */
            .task-checkbox {
                width: 20px;
                height: 20px;
                cursor: pointer;
                border-radius: var(--border-radius-sm);
                border: 2px solid var(--border-color);
                background: var(--bg-white);
                transition: var(--transition);
                appearance: none;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .task-checkbox:checked {
                background: var(--color-primary);
                border-color: var(--color-primary);
            }
            
            .task-checkbox:checked::after {
                content: '✓';
                color: var(--bg-white);
                font-size: 12px;
                font-weight: 700;
            }
            
            .priority-indicator {
                width: 24px;
                height: 24px;
                border-radius: var(--border-radius-sm);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                border: 2px solid;
                transition: var(--transition);
                flex-shrink: 0;
            }
            
            .priority-indicator i {
                font-size: 12px;
                line-height: 1;
            }
            
            .priority-indicator.priority-urgent {
                background: #fef2f2;
                color: var(--color-danger);
                border-color: #fecaca;
            }
            
            .priority-indicator.priority-high {
                background: #fef3c7;
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .priority-indicator.priority-medium {
                background: #eff6ff;
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .priority-indicator.priority-low {
                background: #f0fdf4;
                color: var(--color-success);
                border-color: #bbf7d0;
            }
            
            .priority-bar {
                width: 4px;
                height: 60px;
                border-radius: 2px;
                margin-right: var(--spacing-md);
                transition: var(--transition);
            }
            
            .priority-bar.priority-urgent {
                background: var(--color-danger);
            }
            
            .priority-bar.priority-high {
                background: var(--color-warning);
            }
            
            .priority-bar.priority-medium {
                background: var(--color-primary);
            }
            
            .priority-bar.priority-low {
                background: var(--color-success);
            }
            
            /* Badges harmonisés */
            .badge {
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-xs);
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--border-radius-sm);
                font-size: 11px;
                font-weight: 600;
                border: 1px solid;
                white-space: nowrap;
                flex-shrink: 0;
            }
            
            .badge i {
                font-size: 10px;
            }
            
            .badge.type-badge {
                background: var(--bg-gray-100);
                color: var(--color-gray);
                border-color: var(--border-color);
            }
            
            .badge.type-badge.email {
                background: #e0f2fe;
                color: #0891b2;
                border-color: #7dd3fc;
            }
            
            .badge.priority-badge.priority-urgent {
                background: #fef2f2;
                color: var(--color-danger);
                border-color: #fecaca;
            }
            
            .badge.priority-badge.priority-high {
                background: #fef3c7;
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .badge.priority-badge.priority-medium {
                background: #eff6ff;
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .badge.priority-badge.priority-low {
                background: #f0fdf4;
                color: var(--color-success);
                border-color: #bbf7d0;
            }
            
            .badge.deadline-badge.deadline-overdue {
                background: #fef2f2;
                color: var(--color-danger);
                border-color: #fecaca;
                animation: pulse 2s infinite;
            }
            
            .badge.deadline-badge.deadline-today {
                background: #fef3c7;
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .badge.deadline-badge.deadline-tomorrow {
                background: #fef3c7;
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .badge.deadline-badge.deadline-week {
                background: #eff6ff;
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .badge.deadline-badge.deadline-normal {
                background: var(--bg-gray-100);
                color: var(--color-gray);
                border-color: var(--border-color);
            }
            
            .badge.deadline-badge.no-deadline {
                background: var(--bg-gray-100);
                color: var(--text-muted);
                border-color: var(--border-color);
                font-style: italic;
            }

            /* Meta items harmonisés */
            .meta-item-minimal,
            .meta-item-normal,
            .meta-item-detailed {
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-size: 12px;
                color: var(--text-secondary);
                white-space: nowrap;
            }
            
            .meta-item-minimal i,
            .meta-item-normal i,
            .meta-item-detailed i {
                font-size: 10px;
                flex-shrink: 0;
            }
            
            .meta-item-minimal.reply,
            .meta-item-normal.reply-needed,
            .meta-item-detailed.reply-needed {
                color: var(--color-warning);
                font-weight: 600;
            }
            
            .meta-item-minimal.images,
            .meta-item-normal.has-images,
            .meta-item-detailed.has-images {
                color: #8b5cf6;
                font-weight: 600;
            }
            
            .meta-item-minimal.email {
                color: #0891b2;
                font-weight: 600;
            }
            
            .meta-item-minimal.deadline-overdue,
            .meta-item-normal .deadline-overdue,
            .meta-item-detailed .deadline-overdue {
                color: var(--color-danger);
                font-weight: 600;
            }
            
            .meta-item-minimal.deadline-today,
            .meta-item-minimal.deadline-tomorrow,
            .meta-item-normal .deadline-today,
            .meta-item-normal .deadline-tomorrow,
            .meta-item-detailed .deadline-today,
            .meta-item-detailed .deadline-tomorrow {
                color: var(--color-warning);
                font-weight: 600;
            }
            
            .meta-item-minimal.deadline-week,
            .meta-item-normal .deadline-week,
            .meta-item-detailed .deadline-week {
                color: var(--color-primary);
            }

            /* ===== VUE MINIMALISTE HARMONISÉE ===== */
            .tasks-minimal-harmonized {
                background: var(--bg-white);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                overflow: hidden;
                box-shadow: var(--shadow-sm);
            }
            
            .task-minimal-item {
                display: flex;
                align-items: center;
                padding: var(--spacing-md) var(--spacing-lg);
                cursor: pointer;
                transition: var(--transition);
                border-bottom: 1px solid var(--border-color-light);
                gap: var(--spacing-md);
                min-height: 60px;
            }
            
            .task-minimal-item:last-child {
                border-bottom: none;
            }
            
            .task-minimal-item:hover {
                background: var(--bg-gray-50);
                transform: translateY(-1px);
            }
            
            .task-minimal-item.selected {
                background: #eff6ff;
                border-left: 3px solid var(--color-primary);
            }
            
            .task-minimal-item.completed {
                opacity: 0.7;
            }
            
            .task-minimal-item.completed .task-title-minimal {
                text-decoration: line-through;
                color: var(--text-muted);
            }
            
            .task-content-minimal {
                flex: 1;
                min-width: 0;
            }
            
            .task-title-minimal {
                font-weight: 600;
                color: var(--text-primary);
                font-size: 15px;
                margin-bottom: var(--spacing-xs);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-meta-minimal {
                display: flex;
                align-items: center;
            }
            
            .meta-group-minimal {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                flex-wrap: wrap;
            }
            
            .task-actions-minimal {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }
            
            .task-actions-minimal .btn-harmonized {
                width: 32px;
                height: 32px;
                padding: 0;
                border-radius: var(--border-radius-sm);
            }

            /* ===== VUE NORMALE HARMONISÉE ===== */
            .tasks-normal-harmonized {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            
            .task-normal-item {
                display: flex;
                align-items: center;
                background: var(--bg-white);
                border: 1px solid var(--border-color);
                border-radius: 0;
                padding: var(--spacing-lg);
                cursor: pointer;
                transition: var(--transition);
                position: relative;
                min-height: 80px;
                border-bottom: 1px solid var(--border-color-light);
                gap: var(--spacing-md);
            }
            
            .task-normal-item:first-child {
                border-top-left-radius: var(--border-radius-lg);
                border-top-right-radius: var(--border-radius-lg);
            }
            
            .task-normal-item:last-child {
                border-bottom-left-radius: var(--border-radius-lg);
                border-bottom-right-radius: var(--border-radius-lg);
                border-bottom: 1px solid var(--border-color);
            }
            
            .task-normal-item:hover {
                background: var(--bg-gray-50);
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
                border-color: rgba(59, 130, 246, 0.2);
                border-left: 3px solid var(--color-primary);
                z-index: 1;
            }
            
            .task-normal-item.selected {
                background: #eff6ff;
                border-left: 4px solid var(--color-primary);
                border-color: var(--color-primary);
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 2;
            }
            
            .task-normal-item.completed {
                opacity: 0.8;
                background: #f0fdf4;
                border-left: 3px solid var(--color-success);
            }
            
            .task-normal-item.completed .task-title-normal {
                text-decoration: line-through;
                color: var(--text-muted);
            }
            
            .task-main-content {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
            
            .task-header-normal {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: var(--spacing-lg);
            }
            
            .task-title-normal {
                font-weight: 700;
                color: var(--text-primary);
                font-size: 16px;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-status-badges {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                flex-shrink: 0;
                flex-wrap: wrap;
            }
            
            .task-meta-normal {
                display: flex;
                align-items: center;
            }
            
            .meta-group-normal {
                display: flex;
                align-items: center;
                gap: var(--spacing-lg);
                flex-wrap: wrap;
            }
            
            .task-actions-normal {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }
            
            .task-actions-normal .btn-harmonized {
                width: 32px;
                height: 32px;
                padding: 0;
                border-radius: var(--border-radius-sm);
            }

            /* ===== VUE DÉTAILLÉE HARMONISÉE ===== */
            .tasks-detailed-harmonized {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: var(--spacing-xl);
            }
            
            .task-detailed-item {
                background: var(--bg-white);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                padding: var(--spacing-xl);
                transition: var(--transition);
                box-shadow: var(--shadow-sm);
                min-height: 250px;
                display: flex;
                flex-direction: column;
            }
            
            .task-detailed-item:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
                border-color: rgba(59, 130, 246, 0.3);
            }
            
            .task-detailed-item.selected {
                background: #eff6ff;
                border-color: var(--color-primary);
                box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
            }
            
            .task-detailed-item.completed {
                opacity: 0.8;
                background: #f0fdf4;
                border-color: var(--color-success);
            }
            
            .task-detailed-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: var(--spacing-lg);
            }
            
            .task-indicators {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }
            
            .status-indicator {
                width: 20px;
                height: 20px;
                border-radius: var(--border-radius-sm);
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-gray-100);
                color: var(--color-gray);
                border: 1px solid var(--border-color);
                flex-shrink: 0;
            }
            
            .status-indicator i {
                font-size: 10px;
                line-height: 1;
            }
            
            .task-detailed-content {
                flex: 1;
                margin-bottom: var(--spacing-lg);
            }
            
            .task-title-detailed {
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 var(--spacing-md) 0;
                line-height: 1.3;
                cursor: pointer;
                transition: var(--transition);
            }
            
            .task-title-detailed:hover {
                color: var(--color-primary);
            }
            
            .task-description-detailed {
                font-size: 14px;
                color: var(--text-secondary);
                line-height: 1.5;
                margin: 0 0 var(--spacing-lg) 0;
            }
            
            .task-meta-detailed {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
            
            .meta-group-detailed {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
            
            .task-detailed-actions {
                display: flex;
                gap: var(--spacing-sm);
                flex-wrap: wrap;
            }
            
            .task-detailed-actions .btn-harmonized {
                flex: 1;
                min-width: 100px;
            }

            /* État vide harmonisé */
            .empty-state-harmonized {
                text-align: center;
                padding: 60px 30px;
                background: var(--bg-white);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                box-shadow: var(--shadow-sm);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .empty-state-icon {
                font-size: 48px;
                margin-bottom: var(--spacing-xl);
                color: var(--text-muted);
                background: linear-gradient(135deg, var(--bg-gray-100) 0%, var(--border-color) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .empty-state-title {
                font-size: 22px;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: var(--spacing-md);
            }
            
            .empty-state-text {
                font-size: 15px;
                margin-bottom: var(--spacing-xl);
                max-width: 400px;
                line-height: 1.6;
                color: var(--text-secondary);
                font-weight: 500;
            }
            
            .loading-state-harmonized {
                text-align: center;
                padding: 60px 30px;
                background: var(--bg-white);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                box-shadow: var(--shadow-sm);
            }
            
            .loading-icon-harmonized {
                font-size: 32px;
                margin-bottom: var(--spacing-lg);
                color: var(--color-primary);
            }

            /* Responsive harmonisé */
            @media (max-width: 1200px) {
                .tasks-detailed-harmonized {
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                }
                
                .status-filters-harmonized {
                    justify-content: flex-start;
                }
                
                .btn-harmonized.status-pill {
                    min-width: 100px;
                }
            }
            
            @media (max-width: 1024px) {
                .actions-bar-harmonized {
                    flex-direction: column;
                    gap: var(--spacing-lg);
                    align-items: stretch;
                }
                
                .actions-left-harmonized,
                .actions-right-harmonized {
                    width: 100%;
                    justify-content: center;
                }
                
                .view-modes-harmonized {
                    width: 100%;
                    justify-content: space-around;
                }
                
                .filters-grid-harmonized {
                    grid-template-columns: 1fr;
                }
                
                .tasks-detailed-harmonized {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 768px) {
                .tasks-page-harmonized {
                    padding: var(--spacing-md);
                }
                
                .btn-harmonized.view-mode span,
                .btn-harmonized span:not(.pill-count):not(.pill-label) {
                    display: none;
                }
                
                .task-meta-normal .meta-group-normal,
                .task-meta-detailed .meta-group-detailed {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: var(--spacing-sm);
                }
                
                .task-status-badges {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .task-actions-normal .btn-harmonized,
                .task-actions-minimal .btn-harmonized {
                    width: 28px;
                    height: 28px;
                }
            }
            
            @media (max-width: 480px) {
                .status-filters-harmonized {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .btn-harmonized.status-pill {
                    min-width: auto;
                    flex-direction: row;
                    height: var(--btn-height);
                    justify-content: space-between;
                }
                
                .actions-right-harmonized {
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }
                
                .meta-group-minimal {
                    flex-direction: column;
                    gap: var(--spacing-xs);
                    align-items: flex-start;
                }
                
                .task-detailed-actions {
                    flex-direction: column;
                }
                
                .task-status-badges {
                    gap: var(--spacing-xs);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION
// =====================================

function initializeTaskManagerV11() {
    console.log('[TaskManager] Initializing v11.0 - Interface harmonisée...');
    
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
    
    console.log('✅ TaskManager v11.0 loaded - Interface complètement harmonisée');
}

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
