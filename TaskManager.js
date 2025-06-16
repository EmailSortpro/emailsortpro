// TaskManager Pro v11.0 - Design Uniforme Moderne et Minimaliste

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
            console.log('[TaskManager] Initializing v11.0 - Design uniforme moderne...');
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
                emailContent: `Email de: Sarah Martin <sarah.martin@acme-corp.com>\nDate: ${new Date().toLocaleString('fr-FR')}\nSujet: Validation campagne marketing Q2\n\nBonjour,\n\nJ'espère que vous allez bien. Je vous contacte concernant notre campagne marketing Q2 qui nécessite votre validation.\n\nNous avons préparé les éléments suivants :\n- Visuels créatifs pour les réseaux sociaux\n- Budget détaillé de 50k€\n- Calendrier de lancement\n\nPourriez-vous valider ces éléments avant vendredi ? Nous devons coordonner avec l'équipe commerciale pour le lancement.\n\nMerci d'avance,\nSarah Martin`,
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
                emailContent: `Email de: Trainline <no-reply@comms.trainline.com>\nDate: 16/06/2025 10:20:03\nSujet: 20 % offerts sur les nouveaux trajets Trenitalia !\n\nBonjour,\n\nNous avons le plaisir de vous annoncer une offre exceptionnelle sur les trajets Trenitalia !\n\nBénéficiez de 20% de réduction sur tous les nouveaux trajets en Italie.\n\nCette offre est valable pour une durée limitée, ne la manquez pas !\n\nRéservez dès maintenant sur notre site ou application.\n\nL'équipe Trainline`,
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
// TASKS VIEW - INTERFACE MODERNE UNIFIÉE
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
        if (!container) {
            console.error('[TasksView] No container provided');
            return;
        }

        if (!window.taskManager || !window.taskManager.initialized) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner">
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
            <div class="tasks-interface">
                <!-- Barre de recherche moderne -->
                <div class="search-section">
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               class="search-input" 
                               id="taskSearchInput"
                               placeholder="Rechercher tâches, clients, contenus..." 
                               value="${this.currentFilters.search}">
                        ${this.currentFilters.search ? `
                            <button class="search-clear" onclick="window.tasksView.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Barre d'actions unifiée -->
                <div class="actions-bar">
                    <!-- Section gauche - Modes de vue -->
                    <div class="view-controls">
                        <div class="btn-group">
                            <button class="btn ${this.currentViewMode === 'minimal' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('minimal')">
                                <i class="fas fa-th-list"></i>
                                <span>Minimal</span>
                            </button>
                            <button class="btn ${this.currentViewMode === 'normal' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('normal')">
                                <i class="fas fa-list"></i>
                                <span>Normal</span>
                            </button>
                            <button class="btn ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('detailed')">
                                <i class="fas fa-th-large"></i>
                                <span>Détaillé</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Section droite - Actions principales -->
                    <div class="main-controls">
                        ${selectedCount > 0 ? `
                            <div class="selection-info">
                                <i class="fas fa-check-square"></i>
                                <span>${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''}</span>
                                <button class="btn-clear" onclick="window.tasksView.clearSelection()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        ` : ''}
                        
                        <button class="btn ${visibleCount === 0 ? 'disabled' : ''}" 
                                onclick="window.tasksView.selectAllVisible()"
                                ${visibleCount === 0 ? 'disabled' : ''}>
                            <i class="fas fa-check-double"></i>
                            <span>Tout sélectionner</span>
                            ${visibleCount > 0 ? `<span class="count-badge">${visibleCount}</span>` : ''}
                        </button>
                        
                        <button class="btn" onclick="window.tasksView.refreshTasks()">
                            <i class="fas fa-sync-alt"></i>
                            <span>Actualiser</span>
                        </button>
                        
                        ${selectedCount > 0 ? `
                            <button class="btn btn-primary" onclick="window.tasksView.showBulkActions()">
                                <i class="fas fa-cog"></i>
                                <span>Actions</span>
                                <span class="count-badge">${selectedCount}</span>
                            </button>
                        ` : ''}
                        
                        <button class="btn btn-primary" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            <span>Nouvelle</span>
                        </button>
                        
                        <button class="btn ${this.showAdvancedFilters ? 'active' : ''}" 
                                onclick="window.tasksView.toggleAdvancedFilters()">
                            <i class="fas fa-filter"></i>
                            <span>Filtres</span>
                            <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                        </button>
                    </div>
                </div>

                <!-- Filtres de statut modernes -->
                <div class="status-filters">
                    ${this.buildStatusCards(stats)}
                </div>
                
                <!-- Panneau de filtres avancés -->
                <div class="advanced-filters ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFiltersPanel">
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-flag"></i>
                                <span>Priorité</span>
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
                                <i class="fas fa-building"></i>
                                <span>Client</span>
                            </label>
                            <select class="filter-select" id="clientFilter" 
                                    onchange="window.tasksView.updateFilter('client', this.value)">
                                ${this.buildClientFilterOptions()}
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-sort"></i>
                                <span>Trier par</span>
                            </label>
                            <select class="filter-select" id="sortByFilter" 
                                    onchange="window.tasksView.updateFilter('sortBy', this.value)">
                                <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Date création</option>
                                <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                                <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Date échéance</option>
                                <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre A-Z</option>
                                <option value="client" ${this.currentFilters.sortBy === 'client' ? 'selected' : ''}>Client</option>
                            </select>
                        </div>

                        <div class="filter-actions">
                            <button class="btn" onclick="window.tasksView.resetAllFilters()">
                                <i class="fas fa-undo"></i>
                                <span>Réinitialiser</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Container des tâches -->
                <div class="tasks-container" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addModernStyles();
        this.setupEventListeners();
        console.log('[TasksView] Interface moderne rendue avec', visibleCount, 'tâches visibles');
    }

    buildStatusCards(stats) {
        const cards = [
            { id: 'all', name: 'Tous', icon: 'fas fa-list', count: stats.total, color: 'blue' },
            { id: 'todo', name: 'À faire', icon: 'fas fa-clock', count: stats.todo, color: 'orange' },
            { id: 'in-progress', name: 'En cours', icon: 'fas fa-play', count: stats.inProgress, color: 'blue' },
            { id: 'overdue', name: 'En retard', icon: 'fas fa-exclamation-triangle', count: stats.overdue, color: 'red' },
            { id: 'needsReply', name: 'À répondre', icon: 'fas fa-reply', count: stats.needsReply, color: 'purple' },
            { id: 'completed', name: 'Terminées', icon: 'fas fa-check', count: stats.completed, color: 'green' }
        ];

        return cards.map(card => `
            <button class="status-card ${this.isFilterActive(card.id) ? 'active' : ''}" 
                    data-filter="${card.id}"
                    onclick="window.tasksView.quickFilter('${card.id}')">
                <div class="card-icon ${card.color}">
                    <i class="${card.icon}"></i>
                </div>
                <div class="card-content">
                    <div class="card-count">${card.count}</div>
                    <div class="card-label">${card.name}</div>
                </div>
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
    // VUE MINIMALISTE MODERNE
    // ================================================
    
    renderMinimalView(tasks) {
        return `
            <div class="tasks-minimal">
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
            <div class="task-item minimal ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-indicator ${task.priority}">
                    <i class="${priorityInfo.icon}"></i>
                </div>
                
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="meta-item">
                            <i class="fas fa-building"></i>
                            <span>${this.escapeHtml(task.client)}</span>
                        </span>
                        <span class="meta-item ${dueDateInfo.className}">
                            <i class="fas fa-calendar"></i>
                            <span>${dueDateInfo.text || 'Pas d\'échéance'}</span>
                        </span>
                        ${task.hasEmail ? '<span class="meta-item email"><i class="fas fa-envelope"></i></span>' : ''}
                    </div>
                </div>
                
                <div class="task-actions">
                    ${this.renderTaskActions(task, 'minimal')}
                </div>
            </div>
        `;
    }

    // ================================================
    // VUE NORMALE MODERNE
    // ================================================
    
    renderNormalView(tasks) {
        return `
            <div class="tasks-normal">
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
            <div class="task-item normal ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-bar ${task.priority}"></div>
                
                <div class="task-main">
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="task-badges">
                            <div class="badge-row">
                                <span class="badge type">
                                    <i class="${task.hasEmail ? 'fas fa-envelope' : 'fas fa-tasks'}"></i>
                                    <span>${task.hasEmail ? 'Email' : 'Tâche'}</span>
                                </span>
                                <span class="badge deadline ${dueDateInfo.className}">
                                    <i class="fas fa-calendar"></i>
                                    <span>${dueDateInfo.text || 'Pas d\'échéance'}</span>
                                </span>
                                <span class="badge priority ${task.priority}">
                                    <i class="${priorityInfo.icon}"></i>
                                    <span>${priorityInfo.label}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="task-meta">
                        <div class="meta-row">
                            <span class="meta-item">
                                <i class="fas fa-building"></i>
                                <span>${this.escapeHtml(task.client)}</span>
                            </span>
                            ${task.hasEmail && task.emailFromName ? `
                                <span class="meta-item">
                                    <i class="fas fa-user"></i>
                                    <span>${this.escapeHtml(task.emailFromName)}</span>
                                </span>
                            ` : ''}
                            ${task.hasEmail && task.needsReply ? `
                                <span class="meta-item reply-needed">
                                    <i class="fas fa-reply"></i>
                                    <span>Réponse requise</span>
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="task-actions">
                    ${this.renderTaskActions(task, 'normal')}
                </div>
            </div>
        `;
    }

    // ================================================
    // VUE DÉTAILLÉE MODERNE
    // ================================================
    
    renderDetailedView(tasks) {
        return `
            <div class="tasks-detailed">
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
            <div class="task-card ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                
                <div class="card-header">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="task-indicators">
                        <div class="priority-indicator ${task.priority}">
                            <i class="${priorityInfo.icon}"></i>
                        </div>
                        <div class="status-indicator ${task.status}">
                            <i class="${statusInfo.icon}"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card-content">
                    <h3 class="task-title" onclick="window.tasksView.showTaskDetails('${task.id}')">${this.escapeHtml(task.title)}</h3>
                    ${task.description ? `
                        <p class="task-description">${this.escapeHtml(task.description.substring(0, 120))}${task.description.length > 120 ? '...' : ''}</p>
                    ` : ''}
                    
                    <div class="card-badges">
                        <div class="badge-row">
                            <span class="badge type">
                                <i class="${task.hasEmail ? 'fas fa-envelope' : 'fas fa-tasks'}"></i>
                                <span>${task.hasEmail ? 'Email' : 'Tâche'}</span>
                            </span>
                            <span class="badge deadline ${dueDateInfo.className}">
                                <i class="fas fa-calendar"></i>
                                <span>${dueDateInfo.text || 'Pas d\'échéance'}</span>
                            </span>
                            <span class="badge priority ${task.priority}">
                                <i class="${priorityInfo.icon}"></i>
                                <span>${priorityInfo.label}</span>
                            </span>
                        </div>
                    </div>
                    
                    <div class="card-meta">
                        <div class="meta-row">
                            <span class="meta-item">
                                <i class="fas fa-building"></i>
                                <span>${this.escapeHtml(task.client)}</span>
                            </span>
                            ${task.hasEmail && task.emailFromName ? `
                                <span class="meta-item">
                                    <i class="fas fa-user"></i>
                                    <span>${this.escapeHtml(task.emailFromName)}</span>
                                </span>
                            ` : ''}
                        </div>
                        ${task.hasEmail && task.needsReply ? `
                            <div class="meta-row">
                                <span class="meta-item reply-needed">
                                    <i class="fas fa-reply"></i>
                                    <span>Réponse requise</span>
                                </span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="card-actions">
                    ${this.renderTaskActions(task, 'detailed')}
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTIONS UNIFIÉES
    // ================================================
    
    renderTaskActions(task, viewType) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                    ${viewType === 'detailed' ? '<span>Terminé</span>' : ''}
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn edit" 
                    onclick="event.stopPropagation(); window.tasksView.showEditModal('${task.id}')"
                    title="Modifier">
                <i class="fas fa-edit"></i>
                ${viewType === 'detailed' ? '<span>Modifier</span>' : ''}
            </button>
        `);
        
        if (viewType !== 'minimal') {
            actions.push(`
                <button class="action-btn details" 
                        onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                        title="Voir les détails">
                    <i class="fas fa-eye"></i>
                    ${viewType === 'detailed' ? '<span>Détails</span>' : ''}
                </button>
            `);
        }
        
        if (task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0) {
            actions.push(`
                <button class="action-btn reply" 
                        onclick="event.stopPropagation(); window.tasksView.showSuggestedReplies('${task.id}')"
                        title="Suggestions de réponse">
                    <i class="fas fa-reply"></i>
                    ${viewType === 'detailed' ? '<span>Répondre</span>' : ''}
                </button>
            `);
        }
        
        return actions.join('');
    }

    // ================================================
    // MÉTHODES UTILITAIRES ET FORMATAGE
    // ================================================
    
    getPriorityInfo(priority) {
        const priorities = {
            urgent: { label: 'Urgente', icon: 'fas fa-exclamation-circle' },
            high: { label: 'Haute', icon: 'fas fa-arrow-up' },
            medium: { label: 'Normale', icon: 'fas fa-minus' },
            low: { label: 'Basse', icon: 'fas fa-arrow-down' }
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
        
        let className = 'normal';
        let text = '';
        
        if (diffDays < 0) {
            className = 'overdue';
            text = `En retard de ${Math.abs(diffDays)}j`;
        } else if (diffDays === 0) {
            className = 'today';
            text = 'Aujourd\'hui';
        } else if (diffDays === 1) {
            className = 'tomorrow';
            text = 'Demain';
        } else if (diffDays <= 7) {
            className = 'week';
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
    // INTERACTIONS ET NAVIGATION
    // ================================================
    
    selectAllVisible() {
        const visibleTasks = this.getVisibleTasks();
        const allSelected = visibleTasks.length > 0 && visibleTasks.every(task => this.selectedTasks.has(task.id));
        
        if (allSelected) {
            visibleTasks.forEach(task => {
                this.selectedTasks.delete(task.id);
            });
        } else {
            visibleTasks.forEach(task => {
                this.selectedTasks.add(task.id);
            });
        }
        
        this.refreshView();
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
    }

    handleTaskClick(event, taskId) {
        if (event.target.type === 'checkbox' || event.target.closest('.task-actions, .action-btn')) {
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
        
        document.querySelectorAll('.filter-select').forEach(select => {
            if (select.querySelector('option[value="all"]')) {
                select.value = 'all';
            } else if (select.id === 'sortByFilter') {
                select.value = 'created';
            }
        });
        
        this.refreshView();
    }

    toggleAdvancedFilters() {
        this.showAdvancedFilters = !this.showAdvancedFilters;
        
        const panel = document.getElementById('advancedFiltersPanel');
        const toggle = document.querySelector('[onclick*="toggleAdvancedFilters"]');
        
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

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { 
            status: 'completed',
            completedAt: new Date().toISOString()
        });
        this.refreshView();
    }

    refreshTasks() {
        this.refreshView();
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        const stats = window.taskManager.getStats();
        const statusContainer = document.querySelector('.status-filters');
        if (statusContainer) {
            statusContainer.innerHTML = this.buildStatusCards(stats);
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
                <button class="btn btn-primary" onclick="window.tasksView.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.hasActiveFilters()) {
            title = 'Aucune tâche trouvée';
            text = 'Aucune tâche ne correspond à vos critères de filtrage.';
            action = `
                <button class="btn btn-primary" onclick="window.tasksView.resetAllFilters()">
                    <i class="fas fa-undo"></i>
                    <span>Réinitialiser les filtres</span>
                </button>
            `;
        } else {
            title = 'Aucune tâche';
            text = 'Vous n\'avez aucune tâche pour le moment.';
            action = `
                <button class="btn btn-primary" onclick="window.tasksView.showCreateModal()">
                    <i class="fas fa-plus"></i>
                    <span>Créer votre première tâche</span>
                </button>
            `;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3>${title}</h3>
                <p>${text}</p>
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

    // Méthodes de modal (simplifiées pour l'exemple)
    showTaskDetails(taskId) {
        console.log('Showing details for task:', taskId);
        // Implementation complète dans la version finale
    }

    showEditModal(taskId) {
        console.log('Editing task:', taskId);
        // Implementation complète dans la version finale
    }

    showCreateModal() {
        console.log('Creating new task');
        // Implementation complète dans la version finale
    }

    showBulkActions() {
        console.log('Showing bulk actions for selected tasks');
        // Implementation complète dans la version finale
    }

    showSuggestedReplies(taskId) {
        console.log('Showing suggested replies for task:', taskId);
        // Implementation complète dans la version finale
    }

    // ================================================
    // STYLES MODERNES UNIFIÉS
    // ================================================
    
    addModernStyles() {
        if (document.getElementById('modernTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modernTaskStyles';
        styles.textContent = `
            /* Variables modernes */
            :root {
                --btn-height: 44px;
                --btn-padding: 0 16px;
                --btn-font-size: 14px;
                --btn-border-radius: 12px;
                --btn-font-weight: 600;
                --btn-gap: 8px;
                
                --card-padding: 20px;
                --card-radius: 16px;
                --card-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
                --card-shadow-hover: 0 8px 32px rgba(0, 0, 0, 0.12);
                
                --color-primary: #3b82f6;
                --color-primary-dark: #2563eb;
                --color-success: #10b981;
                --color-warning: #f59e0b;
                --color-danger: #ef4444;
                --color-purple: #8b5cf6;
                
                --color-gray-50: #f9fafb;
                --color-gray-100: #f3f4f6;
                --color-gray-200: #e5e7eb;
                --color-gray-300: #d1d5db;
                --color-gray-400: #9ca3af;
                --color-gray-500: #6b7280;
                --color-gray-600: #4b5563;
                --color-gray-700: #374151;
                --color-gray-800: #1f2937;
                --color-gray-900: #111827;
                
                --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                --border-radius: 12px;
                --spacing-xs: 4px;
                --spacing-sm: 8px;
                --spacing-md: 16px;
                --spacing-lg: 24px;
                --spacing-xl: 32px;
            }
            
            /* Reset et base */
            * {
                box-sizing: border-box;
            }
            
            /* Interface principale */
            .tasks-interface {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                min-height: 100vh;
                padding: var(--spacing-lg);
                color: var(--color-gray-800);
                font-size: var(--btn-font-size);
                line-height: 1.5;
            }

            /* Barre de recherche moderne */
            .search-section {
                margin-bottom: var(--spacing-md);
            }
            
            .search-container {
                position: relative;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .search-input {
                width: 100%;
                height: 56px;
                padding: 0 var(--spacing-lg) 0 56px;
                border: 2px solid var(--color-gray-200);
                border-radius: 28px;
                font-size: 16px;
                background: white;
                transition: var(--transition);
                outline: none;
                box-shadow: var(--card-shadow);
                font-weight: 500;
            }
            
            .search-input:focus {
                border-color: var(--color-primary);
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), var(--card-shadow);
            }
            
            .search-icon {
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--color-gray-400);
                font-size: 18px;
                pointer-events: none;
            }
            
            .search-clear {
                position: absolute;
                right: 16px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--color-danger);
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
                transform: translateY(-50%) scale(1.1);
            }

            /* Barre d'actions moderne */
            .actions-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--spacing-lg);
                background: white;
                border: 1px solid var(--color-gray-200);
                border-radius: var(--card-radius);
                padding: var(--spacing-md) var(--spacing-lg);
                margin-bottom: var(--spacing-md);
                box-shadow: var(--card-shadow);
            }
            
            /* Groupes de boutons unifiés */
            .btn-group {
                display: flex;
                background: var(--color-gray-100);
                border: 1px solid var(--color-gray-200);
                border-radius: var(--btn-border-radius);
                padding: 4px;
                gap: 2px;
            }
            
            .view-controls,
            .main-controls {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                flex-wrap: wrap;
            }
            
            /* Boutons modernes unifiés */
            .btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                height: var(--btn-height);
                padding: var(--btn-padding);
                background: white;
                color: var(--color-gray-700);
                border: 1px solid var(--color-gray-200);
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: var(--transition);
                box-shadow: var(--card-shadow);
                position: relative;
                white-space: nowrap;
                min-width: 120px;
                font-family: inherit;
            }
            
            .btn i {
                font-size: 16px;
                flex-shrink: 0;
            }
            
            .btn:hover:not(.disabled) {
                background: var(--color-gray-50);
                border-color: var(--color-primary);
                transform: translateY(-1px);
                box-shadow: var(--card-shadow-hover);
            }
            
            .btn.active {
                background: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
                box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
            }
            
            .btn.btn-primary {
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
                color: white;
                border-color: transparent;
            }
            
            .btn.btn-primary:hover {
                background: linear-gradient(135deg, var(--color-primary-dark) 0%, #1d4ed8 100%);
                transform: translateY(-2px);
            }
            
            .btn.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }
            
            /* Groupes de boutons dans btn-group */
            .btn-group .btn {
                min-width: 100px;
                border-radius: calc(var(--btn-border-radius) - 2px);
                border: none;
                background: transparent;
                color: var(--color-gray-600);
                box-shadow: none;
            }
            
            .btn-group .btn:hover {
                background: rgba(255, 255, 255, 0.8);
                color: var(--color-gray-800);
                transform: none;
                box-shadow: var(--card-shadow);
            }
            
            .btn-group .btn.active {
                background: white;
                color: var(--color-primary);
                box-shadow: var(--card-shadow);
                font-weight: 700;
            }
            
            /* Badges de comptage */
            .count-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: var(--color-danger);
                color: white;
                font-size: 11px;
                font-weight: 700;
                padding: 3px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                border: 2px solid white;
                animation: pulse 2s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            /* Info de sélection */
            .selection-info {
                display: flex;
                align-items: center;
                gap: var(--btn-gap);
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: var(--btn-border-radius);
                padding: var(--spacing-sm) var(--spacing-md);
                color: #1e40af;
                font-weight: 600;
                min-width: auto;
            }
            
            .btn-clear {
                background: rgba(239, 68, 68, 0.1);
                color: var(--color-danger);
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
                margin-left: 4px;
            }
            
            .btn-clear:hover {
                background: rgba(239, 68, 68, 0.2);
                transform: scale(1.1);
            }

            /* Cartes de statut modernes */
            .status-filters {
                display: flex;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .status-card {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                background: white;
                border: 1px solid var(--color-gray-200);
                border-radius: var(--card-radius);
                padding: var(--spacing-md) var(--spacing-lg);
                cursor: pointer;
                transition: var(--transition);
                box-shadow: var(--card-shadow);
                min-width: 140px;
                font-family: inherit;
                font-size: var(--btn-font-size);
            }
            
            .status-card:hover {
                border-color: var(--color-primary);
                background: #f8fafc;
                transform: translateY(-2px);
                box-shadow: var(--card-shadow-hover);
            }
            
            .status-card.active {
                background: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
            }
            
            .card-icon {
                width: 44px;
                height: 44px;
                border-radius: var(--border-radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .card-icon.blue {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                color: var(--color-primary);
            }
            
            .card-icon.orange {
                background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
                color: var(--color-warning);
            }
            
            .card-icon.red {
                background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
                color: var(--color-danger);
            }
            
            .card-icon.green {
                background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
                color: var(--color-success);
            }
            
            .card-icon.purple {
                background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
                color: var(--color-purple);
            }
            
            .status-card.active .card-icon {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            
            .card-content {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .card-count {
                font-size: 24px;
                font-weight: 700;
                line-height: 1;
            }
            
            .card-label {
                font-size: 13px;
                font-weight: 600;
                opacity: 0.8;
            }

            /* Filtres avancés */
            .advanced-filters {
                background: white;
                border: 1px solid var(--color-gray-200);
                border-radius: var(--card-radius);
                margin-bottom: var(--spacing-lg);
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                opacity: 0;
                box-shadow: var(--card-shadow);
            }
            
            .advanced-filters.show {
                max-height: 200px;
                opacity: 1;
                padding: var(--spacing-lg);
            }
            
            .filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--spacing-md);
                align-items: end;
            }
            
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
            
            .filter-label {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-weight: 600;
                font-size: 13px;
                color: var(--color-gray-700);
            }
            
            .filter-select {
                height: var(--btn-height);
                padding: 0 var(--spacing-md);
                border: 1px solid var(--color-gray-200);
                border-radius: var(--btn-border-radius);
                background: white;
                font-size: var(--btn-font-size);
                color: var(--color-gray-700);
                cursor: pointer;
                transition: var(--transition);
                font-family: inherit;
                font-weight: 500;
            }
            
            .filter-select:focus {
                outline: none;
                border-color: var(--color-primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .filter-actions {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Container principal des tâches */
            .tasks-container {
                background: transparent;
            }

            /* Checkbox moderne */
            .task-checkbox {
                width: 20px;
                height: 20px;
                cursor: pointer;
                border-radius: 6px;
                border: 2px solid var(--color-gray-300);
                background: white;
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
                color: white;
                font-size: 12px;
                font-weight: 700;
            }

            /* Indicateurs de priorité modernes */
            .priority-indicator {
                width: 32px;
                height: 32px;
                border-radius: var(--spacing-sm);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                border: 2px solid;
                transition: var(--transition);
                flex-shrink: 0;
            }
            
            .priority-indicator i {
                font-size: 14px;
                line-height: 1;
            }
            
            .priority-indicator.urgent {
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                color: var(--color-danger);
                border-color: #fecaca;
            }
            
            .priority-indicator.high {
                background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .priority-indicator.medium {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .priority-indicator.low {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                color: var(--color-success);
                border-color: #bbf7d0;
            }
            
            .priority-bar {
                width: 4px;
                height: 100%;
                border-radius: 2px;
                margin-right: var(--spacing-md);
                transition: var(--transition);
                flex-shrink: 0;
            }
            
            .priority-bar.urgent { background: var(--color-danger); }
            .priority-bar.high { background: var(--color-warning); }
            .priority-bar.medium { background: var(--color-primary); }
            .priority-bar.low { background: var(--color-success); }

            /* Badges modernes unifiés */
            .badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid;
                white-space: nowrap;
                line-height: 1;
            }
            
            .badge i {
                font-size: 11px;
                flex-shrink: 0;
            }
            
            .badge.type {
                background: var(--color-gray-100);
                color: var(--color-gray-600);
                border-color: var(--color-gray-200);
            }
            
            .badge.type:has(i.fa-envelope) {
                background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
                color: #0891b2;
                border-color: #7dd3fc;
            }
            
            .badge.deadline.overdue {
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                color: var(--color-danger);
                border-color: #fecaca;
                animation: pulse 2s infinite;
            }
            
            .badge.deadline.today,
            .badge.deadline.tomorrow {
                background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .badge.deadline.week {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .badge.deadline.normal,
            .badge.deadline.no-deadline {
                background: var(--color-gray-100);
                color: var(--color-gray-500);
                border-color: var(--color-gray-200);
            }
            
            .badge.priority.urgent {
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                color: var(--color-danger);
                border-color: #fecaca;
            }
            
            .badge.priority.high {
                background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .badge.priority.medium {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .badge.priority.low {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                color: var(--color-success);
                border-color: #bbf7d0;
            }

            /* Actions des tâches modernes */
            .action-btn {
                width: 36px;
                height: 36px;
                border: 1px solid var(--color-gray-200);
                border-radius: var(--spacing-sm);
                background: white;
                color: var(--color-gray-500);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: var(--transition);
                box-shadow: var(--card-shadow);
                flex-shrink: 0;
                font-size: 13px;
                font-weight: 600;
                padding: 0 8px;
                min-width: 36px;
                font-family: inherit;
            }
            
            .action-btn i {
                font-size: 14px;
                line-height: 1;
                flex-shrink: 0;
            }
            
            .action-btn span {
                white-space: nowrap;
            }
            
            .action-btn:hover {
                background: var(--color-gray-50);
                transform: translateY(-1px);
                box-shadow: var(--card-shadow-hover);
            }
            
            .action-btn.complete:hover {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                border-color: var(--color-success);
                color: var(--color-success);
            }
            
            .action-btn.edit:hover {
                background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
                border-color: var(--color-warning);
                color: var(--color-warning);
            }
            
            .action-btn.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: var(--color-purple);
                color: var(--color-purple);
            }
            
            .action-btn.reply:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: var(--color-primary);
                color: var(--color-primary);
            }

            /* ===== VUE MINIMALISTE MODERNE ===== */
            .tasks-minimal {
                background: white;
                border: 1px solid var(--color-gray-200);
                border-radius: var(--card-radius);
                overflow: hidden;
                box-shadow: var(--card-shadow);
            }
            
            .task-item.minimal {
                display: flex;
                align-items: center;
                padding: var(--spacing-md) var(--spacing-lg);
                cursor: pointer;
                transition: var(--transition);
                border-bottom: 1px solid var(--color-gray-100);
                gap: var(--spacing-md);
                min-height: 72px;
            }
            
            .task-item.minimal:last-child {
                border-bottom: none;
            }
            
            .task-item.minimal:hover {
                background: var(--color-gray-50);
                transform: translateY(-1px);
            }
            
            .task-item.minimal.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid var(--color-primary);
            }
            
            .task-item.minimal.completed {
                opacity: 0.7;
            }
            
            .task-item.minimal.completed .task-title {
                text-decoration: line-through;
                color: var(--color-gray-500);
            }
            
            .task-content {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            
            .task-title {
                font-weight: 600;
                color: var(--color-gray-800);
                font-size: 15px;
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                line-height: 1.3;
            }
            
            .task-meta {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                font-size: 12px;
                color: var(--color-gray-500);
                flex-wrap: wrap;
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 4px;
                white-space: nowrap;
            }
            
            .meta-item i {
                font-size: 11px;
                flex-shrink: 0;
            }
            
            .meta-item.overdue {
                color: var(--color-danger);
                font-weight: 600;
            }
            
            .meta-item.today,
            .meta-item.tomorrow {
                color: var(--color-warning);
                font-weight: 600;
            }
            
            .meta-item.week {
                color: var(--color-primary);
            }
            
            .meta-item.email {
                color: #0891b2;
            }
            
            .meta-item.reply-needed {
                color: var(--color-warning);
                font-weight: 600;
            }
            
            .task-actions {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }

            /* ===== VUE NORMALE MODERNE ===== */
            .tasks-normal {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            
            .task-item.normal {
                display: flex;
                align-items: center;
                background: white;
                border: 1px solid var(--color-gray-200);
                border-radius: 0;
                padding: var(--spacing-lg);
                cursor: pointer;
                transition: var(--transition);
                position: relative;
                min-height: 96px;
                border-bottom: 1px solid var(--color-gray-100);
                gap: var(--spacing-md);
            }
            
            .task-item.normal:first-child {
                border-top-left-radius: var(--card-radius);
                border-top-right-radius: var(--card-radius);
            }
            
            .task-item.normal:last-child {
                border-bottom-left-radius: var(--card-radius);
                border-bottom-right-radius: var(--card-radius);
                border-bottom: 1px solid var(--color-gray-200);
            }
            
            .task-item.normal:hover {
                background: var(--color-gray-50);
                transform: translateY(-1px);
                box-shadow: var(--card-shadow-hover);
                border-color: rgba(59, 130, 246, 0.2);
                border-left: 4px solid var(--color-primary);
                z-index: 1;
            }
            
            .task-item.normal.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid var(--color-primary);
                border-color: var(--color-primary);
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
                z-index: 2;
            }
            
            .task-item.normal.completed {
                opacity: 0.8;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 4px solid var(--color-success);
            }
            
            .task-item.normal.completed .task-title {
                text-decoration: line-through;
                color: var(--color-gray-500);
            }
            
            .task-main {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
            
            .task-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: var(--spacing-md);
            }
            
            .task-item.normal .task-title {
                font-weight: 700;
                color: var(--color-gray-800);
                font-size: 16px;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-badges {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
                flex-shrink: 0;
            }
            
            .badge-row {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                flex-wrap: wrap;
            }
            
            .meta-row {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                font-size: 13px;
                color: var(--color-gray-500);
                flex-wrap: wrap;
            }

            /* ===== VUE DÉTAILLÉE MODERNE ===== */
            .tasks-detailed {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: var(--spacing-lg);
            }
            
            .task-card {
                background: white;
                border: 1px solid var(--color-gray-200);
                border-radius: var(--card-radius);
                padding: var(--spacing-lg);
                transition: var(--transition);
                box-shadow: var(--card-shadow);
                min-height: 280px;
                display: flex;
                flex-direction: column;
            }
            
            .task-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--card-shadow-hover);
                border-color: rgba(59, 130, 246, 0.3);
            }
            
            .task-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-color: var(--color-primary);
                box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
            }
            
            .task-card.completed {
                opacity: 0.8;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-color: var(--color-success);
            }
            
            .card-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: var(--spacing-md);
            }
            
            .task-indicators {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }
            
            .status-indicator {
                width: 24px;
                height: 24px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--color-gray-100);
                color: var(--color-gray-500);
                border: 1px solid var(--color-gray-200);
                flex-shrink: 0;
            }
            
            .status-indicator i {
                font-size: 12px;
                line-height: 1;
            }
            
            .card-content {
                flex: 1;
                margin-bottom: var(--spacing-md);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
            
            .task-card .task-title {
                font-size: 18px;
                font-weight: 700;
                color: var(--color-gray-800);
                margin: 0 0 var(--spacing-sm) 0;
                line-height: 1.3;
                cursor: pointer;
                transition: var(--transition);
            }
            
            .task-card .task-title:hover {
                color: var(--color-primary);
            }
            
            .task-description {
                font-size: 14px;
                color: var(--color-gray-600);
                line-height: 1.5;
                margin: 0 0 var(--spacing-md) 0;
            }
            
            .card-badges {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
                margin-bottom: var(--spacing-sm);
            }
            
            .card-meta {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
            }
            
            .card-actions {
                display: flex;
                gap: var(--spacing-sm);
                flex-wrap: wrap;
            }
            
            .card-actions .action-btn {
                min-width: auto;
                flex: 1;
                min-width: 80px;
            }

            /* État vide moderne */
            .empty-state {
                text-align: center;
                padding: var(--spacing-xl) var(--spacing-lg);
                background: white;
                border: 1px solid var(--color-gray-200);
                border-radius: var(--spacing-lg);
                box-shadow: var(--card-shadow);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                max-width: 500px;
                margin: 0 auto;
            }
            
            .empty-icon {
                font-size: 64px;
                margin-bottom: var(--spacing-lg);
                color: var(--color-gray-300);
                background: linear-gradient(135deg, var(--color-gray-200) 0%, var(--color-gray-300) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .empty-state h3 {
                font-size: 24px;
                font-weight: 700;
                color: var(--color-gray-800);
                margin-bottom: var(--spacing-sm);
            }
            
            .empty-state p {
                font-size: 16px;
                margin-bottom: var(--spacing-lg);
                max-width: 400px;
                line-height: 1.6;
                color: var(--color-gray-600);
                font-weight: 500;
            }
            
            .loading-state {
                text-align: center;
                padding: var(--spacing-xl) var(--spacing-lg);
                background: white;
                border: 1px solid var(--color-gray-200);
                border-radius: var(--spacing-lg);
                box-shadow: var(--card-shadow);
                max-width: 400px;
                margin: 0 auto;
            }
            
            .loading-spinner {
                font-size: 32px;
                margin-bottom: var(--spacing-md);
                color: var(--color-primary);
            }

            /* Responsive moderne */
            @media (max-width: 1200px) {
                .tasks-detailed {
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                }
                
                .status-filters {
                    justify-content: flex-start;
                }
                
                .status-card {
                    min-width: 120px;
                }
            }
            
            @media (max-width: 1024px) {
                .actions-bar {
                    flex-direction: column;
                    gap: var(--spacing-md);
                    align-items: stretch;
                }
                
                .view-controls,
                .main-controls {
                    width: 100%;
                    justify-content: center;
                }
                
                .filters-grid {
                    grid-template-columns: 1fr;
                }
                
                .tasks-detailed {
                    grid-template-columns: 1fr;
                }
                
                .btn {
                    min-width: 100px;
                }
            }
            
            @media (max-width: 768px) {
                .tasks-interface {
                    padding: var(--spacing-md);
                }
                
                .btn span {
                    display: none;
                }
                
                .btn {
                    min-width: 44px;
                    padding: 0 var(--spacing-sm);
                }
                
                .btn-group .btn {
                    min-width: 44px;
                }
                
                .task-meta,
                .meta-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: var(--spacing-xs);
                }
                
                .badge-row {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .card-actions .action-btn {
                    min-width: 36px;
                }
                
                .card-actions .action-btn span {
                    display: none;
                }
            }
            
            @media (max-width: 480px) {
                .status-filters {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .status-card {
                    min-width: auto;
                }
                
                .main-controls {
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }
                
                .task-meta {
                    flex-direction: column;
                    gap: var(--spacing-xs);
                }
                
                .task-card {
                    min-height: auto;
                }
                
                .card-actions {
                    justify-content: center;
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
    console.log('[TaskManager] Initializing v11.0 - Design uniforme moderne...');
    
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
    
    console.log('✅ TaskManager v11.0 loaded - Design uniforme moderne et minimaliste');
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
