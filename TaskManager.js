// TaskManager Pro - Système unifié de gestion des tâches avec emails intégrés
// Version 6.0 - Interface moderne avec filtres avancés et corrections z-index

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
            console.log('[TaskManager] Initializing v6.0...');
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
                console.log('[TaskManager] No saved tasks found');
                this.tasks = [];
            }
        } catch (error) {
            console.error('[TaskManager] Error loading tasks:', error);
            this.tasks = [];
        }
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
        
        // Extraire le contenu email complet - UNIFIÉ avec PageManager
        let emailContent = '';
        let emailContentType = 'text';
        let emailFullHtml = null;
        
        // 1. Si on a un objet email complet (depuis PageManager)
        if (taskData.email) {
            if (taskData.email.body?.content) {
                emailContent = taskData.email.body.content;
                emailContentType = taskData.email.body.contentType || 'html';
                emailFullHtml = taskData.email.body.content;
            } else if (taskData.email.bodyPreview) {
                emailContent = taskData.email.bodyPreview;
            }
        }
        
        // 2. Vérifier les propriétés directes (emailHtml prioritaire)
        if (taskData.emailHtml) {
            emailFullHtml = taskData.emailHtml;
            emailContent = taskData.emailHtml;
            emailContentType = 'html';
        } else if (taskData.emailFullHtml) {
            emailFullHtml = taskData.emailFullHtml;
            emailContent = taskData.emailFullHtml;
            emailContentType = 'html';
        }
        
        // 3. Si pas encore de contenu, utiliser les autres sources
        if (!emailContent) {
            // Chercher dans emailDetails
            if (taskData.emailDetails?.body) {
                emailContent = taskData.emailDetails.body;
                if (taskData.emailDetails.fullHtml) {
                    emailFullHtml = taskData.emailDetails.fullHtml;
                    emailContentType = 'html';
                }
            } else if (taskData.emailBody?.content) {
                emailContent = taskData.emailBody.content;
                emailContentType = taskData.emailBody.contentType || 'text';
                if (emailContentType === 'html') {
                    emailFullHtml = taskData.emailBody.content;
                }
            } else if (taskData.emailContent) {
                emailContent = taskData.emailContent;
            } else if (taskData.emailBodyPreview) {
                emailContent = taskData.emailBodyPreview;
            }
        }
        
        // 4. Si on n'a toujours pas de HTML mais que le contenu semble être du HTML
        if (!emailFullHtml && emailContent && this.isHtmlContent(emailContent)) {
            emailFullHtml = emailContent;
            emailContentType = 'html';
        }
        
        // 5. Extraire depuis aiAnalysis si disponible
        if (!emailContent && taskData.aiAnalysis?.emailMetadata?.fullContent) {
            emailContent = taskData.aiAnalysis.emailMetadata.fullContent;
            if (this.isHtmlContent(emailContent)) {
                emailFullHtml = emailContent;
                emailContentType = 'html';
            }
        }
        
        const task = {
            id: taskData.id || this.generateId(),
            title: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'other',
            
            // Email info complète - UNIFIÉ
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || taskData.emailDetails?.fromEmail || taskData.emailDetails?.from || null,
            emailFromName: taskData.emailFromName || taskData.emailDetails?.from || taskData.emailDetails?.fromName || null,
            emailSubject: taskData.emailSubject || taskData.emailDetails?.subject || null,
            emailDomain: this.extractDomain(taskData.emailFrom || taskData.emailDetails?.fromEmail),
            
            // Contenu email complet - PROPRIÉTÉS UNIFIÉES
            emailContent: emailContent,
            emailContentType: emailContentType,
            emailFullHtml: emailFullHtml,
            emailHtml: emailFullHtml, // Pour compatibilité
            emailBodyType: emailContentType, // Pour compatibilité
            
            // Métadonnées email
            hasEmail: !!(taskData.emailId || taskData.emailDetails || taskData.emailFrom || emailContent),
            emailReplied: false,
            emailDate: taskData.emailDate || taskData.emailDetails?.date || taskData.createdAt,
            hasAttachments: taskData.hasAttachments || taskData.emailDetails?.hasAttachments || taskData.emailHasAttachments || false,
            
            // AI Analysis complète
            aiAnalysis: taskData.aiAnalysis || null,
            aiGenerated: taskData.aiGenerated || false,
            
            // Sections structurées (depuis PageManager)
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            
            // Tags et metadata
            tags: taskData.tags || [],
            client: taskData.client || this.extractClient(taskData),
            
            // Timestamps
            createdAt: taskData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // Méthode de création
            method: taskData.method || 'manual',
            
            // Référence à l'email original si disponible
            originalEmail: taskData.email || taskData.originalEmail || null
        };
        
        console.log('[TaskManager] Created task with email content:', {
            hasContent: !!task.emailContent,
            hasHtml: !!task.emailFullHtml,
            contentLength: task.emailContent?.length || 0,
            htmlLength: task.emailFullHtml?.length || 0,
            bodyType: task.emailContentType,
            hasOriginalEmail: !!task.originalEmail
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        return task;
    }
    
    // Méthode helper pour détecter si le contenu est du HTML
    isHtmlContent(content) {
        if (!content) return false;
        
        // Patterns HTML courants
        const htmlPatterns = [
            /<html[^>]*>/i,
            /<body[^>]*>/i,
            /<div[^>]*>/i,
            /<p[^>]*>/i,
            /<br[^>]*>/i,
            /<img[^>]*>/i,
            /<table[^>]*>/i,
            /<span[^>]*>/i,
            /<a\s+href=/i
        ];
        
        return htmlPatterns.some(pattern => pattern.test(content));
    }
    
    // Méthode pour créer une tâche depuis PageManager avec l'email complet
    createTaskFromEmail(taskData, email) {
        console.log('[TaskManager] Creating task from email:', email);
        
        // Extraire le contenu complet de l'email
        let emailContent = '';
        let emailHtml = null;
        let emailContentType = 'text';
        
        // Récupérer le contenu depuis l'objet email
        if (email && email.body?.content) {
            emailContent = email.body.content;
            emailHtml = email.body.content;
            emailContentType = email.body.contentType || 'html';
        } else if (email && email.bodyPreview) {
            emailContent = email.bodyPreview;
        }
        
        // S'assurer que l'email complet est passé avec le bon format
        const enhancedTaskData = {
            ...taskData,
            email: email, // L'objet email complet
            originalEmail: email, // Garder une référence à l'email original
            emailId: email?.id || taskData.emailId,
            emailFrom: email?.from?.emailAddress?.address || taskData.emailFrom,
            emailFromName: email?.from?.emailAddress?.name || taskData.emailFromName,
            emailSubject: email?.subject || taskData.emailSubject,
            emailDate: email?.receivedDateTime || taskData.emailDate,
            hasAttachments: email?.hasAttachments || taskData.hasAttachments || false,
            // Passer explicitement le contenu complet
            emailContent: emailContent || taskData.emailContent || '',
            emailHtml: emailHtml,
            emailFullHtml: emailHtml,
            emailContentType: emailContentType,
            emailBodyType: emailContentType,
            // S'assurer que le flag hasEmail est correct
            hasEmail: true
        };
        
        return this.createTask(enhancedTaskData);
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

    markAsReplied(taskId) {
        return this.updateTask(taskId, {
            emailReplied: true,
            lastReplyDate: new Date().toISOString()
        });
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
        
        if (filters.hasEmail) {
            filtered = filtered.filter(task => task.hasEmail);
        }
        
        if (filters.needsReply) {
            filtered = filtered.filter(task => task.hasEmail && !task.emailReplied);
        }
        
        if (filters.sender && filters.sender !== 'all') {
            filtered = filtered.filter(task => task.emailFrom === filters.sender);
        }
        
        if (filters.overdue) {
            filtered = filtered.filter(task => {
                if (!task.dueDate || task.status === 'completed') return false;
                return new Date(task.dueDate) < new Date();
            });
        }
        
        // Filtre par tag
        if (filters.tag && filters.tag !== 'all') {
            filtered = filtered.filter(task => 
                task.tags && task.tags.includes(filters.tag)
            );
        }
        
        // Filtre par date
        if (filters.dateFilter && filters.dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            switch (filters.dateFilter) {
                case 'today':
                    filtered = filtered.filter(task => {
                        const taskDate = new Date(task.createdAt);
                        return taskDate >= today && taskDate < tomorrow;
                    });
                    break;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    filtered = filtered.filter(task => {
                        const taskDate = new Date(task.createdAt);
                        return taskDate >= weekAgo;
                    });
                    break;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    filtered = filtered.filter(task => {
                        const taskDate = new Date(task.createdAt);
                        return taskDate >= monthAgo;
                    });
                    break;
                case 'overdue':
                    filtered = filtered.filter(task => {
                        if (!task.dueDate || task.status === 'completed') return false;
                        return new Date(task.dueDate) < now;
                    });
                    break;
            }
        }
        
        // Recherche
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                (task.emailFromName && task.emailFromName.toLowerCase().includes(search)) ||
                (task.emailSubject && task.emailSubject.toLowerCase().includes(search)) ||
                (task.emailContent && task.emailContent.toLowerCase().includes(search)) ||
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
            needsReply: this.tasks.filter(t => t.hasEmail && !t.emailReplied && t.status !== 'completed').length,
            overdue: this.tasks.filter(t => {
                if (!t.dueDate || t.status === 'completed') return false;
                return new Date(t.dueDate) < new Date();
            }).length,
            // Pour la compatibilité avec PageManager
            byStatus: {
                todo: this.tasks.filter(t => t.status === 'todo').length,
                'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
                completed: this.tasks.filter(t => t.status === 'completed').length
            }
        };
        return stats;
    }

    getSenders() {
        const senders = new Map();
        this.tasks.forEach(task => {
            if (task.emailFrom) {
                const key = task.emailFrom;
                if (!senders.has(key)) {
                    senders.set(key, {
                        name: task.emailFromName || 'Inconnu',
                        email: task.emailFrom,
                        domain: task.emailDomain,
                        count: 0,
                        tasks: []
                    });
                }
                const sender = senders.get(key);
                sender.count++;
                sender.tasks.push(task.id);
            }
        });
        
        // Convertir en array et trier par nombre de tâches
        return Array.from(senders.entries())
            .map(([email, data]) => ({ email, ...data }))
            .sort((a, b) => b.count - a.count);
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
        
        const domain = this.extractDomain(taskData.emailFrom || taskData.emailDetails?.fromEmail);
        if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail')) {
            return domain.split('.')[0];
        }
        
        return 'Personnel';
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
// TASKS VIEW CLASS - MODERNISÉE
// =====================================
class TasksView {
    constructor() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            sender: 'all',
            search: '',
            sortBy: 'priority',
            overdue: false,
            needsReply: false
        };
        
        this.selectedTasks = new Set();
        this.currentTaskDetail = null;
        this.editMode = false;
        this.dropdownStates = new Map();
        
        // Écouter les mises à jour
        window.addEventListener('taskUpdate', () => {
            console.log('[TasksView] Task update detected, refreshing view');
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
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Chargement des tâches...</p>
                </div>
            `;
            
            // Réessayer après un court délai
            setTimeout(() => {
                if (window.taskManager && window.taskManager.initialized) {
                    this.render(container);
                } else {
                    console.error('[TasksView] TaskManager still not ready');
                    container.innerHTML = '<div class="error">Erreur de chargement du gestionnaire de tâches</div>';
                }
            }, 500);
            return;
        }

        // Récupérer toutes les tâches
        const allTasks = window.taskManager.getAllTasks();
        console.log('[TasksView] Rendering with', allTasks.length, 'tasks');

        // Générer le HTML complet de la page
        const pageHTML = `
            <div class="tasks-page">
                ${this.renderHeader()}
                ${this.renderStats()}
                ${this.renderFilters()}
                ${this.renderBulkActions()}
                <div id="tasksListContainer" class="tasks-list-container">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        // Injecter le HTML dans le container
        container.innerHTML = pageHTML;

        // Attacher les event listeners
        this.attachEventListeners();
        
        // Ajouter les styles si nécessaire
        this.addStyles();
        
        console.log('[TasksView] Page rendered successfully');
    }

    renderHeader() {
        return `
            <div class="page-header">
                <h1 class="page-title">Gestion des Tâches</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.tasksView.showCreateModal()">
                        <i class="fas fa-plus"></i> Nouvelle tâche
                    </button>
                </div>
            </div>
        `;
    }

    renderStats() {
        const stats = window.taskManager.getStats();
        
        return `
            <div class="stats-grid">
                <div class="stat-card" onclick="window.tasksView.setFilter('status', 'all')" style="--accent-color: var(--primary)">
                    <div class="stat-icon">
                        <i class="fas fa-list"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('status', 'todo')" style="--accent-color: var(--info)">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.todo}</div>
                        <div class="stat-label">À faire</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('status', 'in-progress')" style="--accent-color: var(--warning)">
                    <div class="stat-icon">
                        <i class="fas fa-spinner"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.inProgress}</div>
                        <div class="stat-label">En cours</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('status', 'completed')" style="--accent-color: var(--success)">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.completed}</div>
                        <div class="stat-label">Terminées</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('overdue', true)" style="--accent-color: var(--danger)">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.overdue}</div>
                        <div class="stat-label">En retard</div>
                    </div>
                </div>
                
                <div class="stat-card" onclick="window.tasksView.setFilter('needsReply', true)" style="--accent-color: var(--primary)">
                    <div class="stat-icon">
                        <i class="fas fa-reply"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.needsReply}</div>
                        <div class="stat-label">À répondre</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFilters() {
        const senders = window.taskManager.getSenders();
        const allTags = this.getAllTags();
        
        // Compter les filtres actifs
        let activeFilterCount = 0;
        if (this.currentFilters.status !== 'all') activeFilterCount++;
        if (this.currentFilters.priority !== 'all') activeFilterCount++;
        if (this.currentFilters.sender !== 'all') activeFilterCount++;
        if (this.currentFilters.dateFilter && this.currentFilters.dateFilter !== 'all') activeFilterCount++;
        if (this.currentFilters.tag && this.currentFilters.tag !== 'all') activeFilterCount++;
        if (this.currentFilters.search) activeFilterCount++;
        
        return `
            <div class="filters-section">
                <div class="filters-row">
                    <!-- Recherche toujours visible -->
                    <div class="search-wrapper inline-search">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               class="search-input" 
                               id="filter-search" 
                               placeholder="Rechercher..." 
                               value="${this.currentFilters.search}">
                        <button class="search-clear" 
                                id="searchClearBtn" 
                                style="display: ${this.currentFilters.search ? 'flex' : 'none'}"
                                onclick="window.tasksView.clearSearch()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="inline-filters">
                        <!-- Statut -->
                        <div class="filter-dropdown compact ${this.currentFilters.status !== 'all' ? 'has-filter' : ''}" id="statusDropdownCompact">
                            <button class="filter-button compact" onclick="window.tasksView.toggleDropdown('statusDropdownCompact')">
                                <i class="fas fa-tasks"></i>
                                <span>${this.getFilterLabel('status', this.currentFilters.status)}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-item ${this.currentFilters.status === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('status', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    Tous les statuts
                                </div>
                                <div class="dropdown-item ${this.currentFilters.status === 'todo' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('status', 'todo')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-clock"></i> À faire
                                </div>
                                <div class="dropdown-item ${this.currentFilters.status === 'in-progress' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('status', 'in-progress')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-spinner"></i> En cours
                                </div>
                                <div class="dropdown-item ${this.currentFilters.status === 'completed' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('status', 'completed')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-check-circle"></i> Terminées
                                </div>
                            </div>
                        </div>
                        
                        <!-- Priorité -->
                        <div class="filter-dropdown compact ${this.currentFilters.priority !== 'all' ? 'has-filter' : ''}" id="priorityDropdownCompact">
                            <button class="filter-button compact" onclick="window.tasksView.toggleDropdown('priorityDropdownCompact')">
                                <i class="fas fa-flag"></i>
                                <span>${this.getFilterLabel('priority', this.currentFilters.priority)}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-item ${this.currentFilters.priority === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    Toutes priorités
                                </div>
                                <div class="dropdown-item ${this.currentFilters.priority === 'urgent' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'urgent')">
                                    <i class="fas fa-check check-icon"></i>
                                    🚨 Urgent
                                </div>
                                <div class="dropdown-item ${this.currentFilters.priority === 'high' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'high')">
                                    <i class="fas fa-check check-icon"></i>
                                    ⚡ Haute
                                </div>
                                <div class="dropdown-item ${this.currentFilters.priority === 'medium' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'medium')">
                                    <i class="fas fa-check check-icon"></i>
                                    📌 Normale
                                </div>
                                <div class="dropdown-item ${this.currentFilters.priority === 'low' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('priority', 'low')">
                                    <i class="fas fa-check check-icon"></i>
                                    📄 Basse
                                </div>
                            </div>
                        </div>
                        
                        <!-- Expéditeurs -->
                        <div class="filter-dropdown compact ${this.currentFilters.sender !== 'all' ? 'has-filter' : ''}" id="senderDropdownCompact">
                            <button class="filter-button compact" onclick="window.tasksView.toggleDropdown('senderDropdownCompact')">
                                <i class="fas fa-user"></i>
                                <span>${this.getFilterLabel('sender', this.currentFilters.sender)}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-large">
                                <div class="dropdown-item ${this.currentFilters.sender === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('sender', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    Tous les expéditeurs
                                </div>
                                ${senders.length > 0 ? `
                                    <div class="dropdown-divider"></div>
                                    <div class="dropdown-section-title">Expéditeurs récents</div>
                                    ${senders.slice(0, 10).map(sender => `
                                        <div class="dropdown-item sender-item ${this.currentFilters.sender === sender.email ? 'active' : ''}" 
                                             onclick="window.tasksView.setFilter('sender', '${sender.email}')">
                                            <i class="fas fa-check check-icon"></i>
                                            <div class="sender-avatar">${sender.name.charAt(0).toUpperCase()}</div>
                                            <div class="sender-info">
                                                <div class="sender-name">${this.escapeHtml(sender.name)}</div>
                                                <div class="sender-email">${this.escapeHtml(sender.email)}</div>
                                            </div>
                                            <span class="sender-count">${sender.count}</span>
                                        </div>
                                    `).join('')}
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Dates -->
                        <div class="filter-dropdown compact ${this.currentFilters.dateFilter && this.currentFilters.dateFilter !== 'all' ? 'has-filter' : ''}" id="dateDropdownCompact">
                            <button class="filter-button compact" onclick="window.tasksView.toggleDropdown('dateDropdownCompact')">
                                <i class="fas fa-calendar"></i>
                                <span>${this.getFilterLabel('dateFilter', this.currentFilters.dateFilter || 'all')}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-item ${!this.currentFilters.dateFilter || this.currentFilters.dateFilter === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    Toutes les dates
                                </div>
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-item ${this.currentFilters.dateFilter === 'today' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'today')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-day"></i> Aujourd'hui
                                </div>
                                <div class="dropdown-item ${this.currentFilters.dateFilter === 'week' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'week')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-week"></i> Cette semaine
                                </div>
                                <div class="dropdown-item ${this.currentFilters.dateFilter === 'month' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'month')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-alt"></i> Ce mois
                                </div>
                                <div class="dropdown-item ${this.currentFilters.dateFilter === 'overdue' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('dateFilter', 'overdue')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-exclamation-triangle"></i> En retard
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tags -->
                        <div class="filter-dropdown compact ${this.currentFilters.tag && this.currentFilters.tag !== 'all' ? 'has-filter' : ''}" id="tagDropdownCompact">
                            <button class="filter-button compact" onclick="window.tasksView.toggleDropdown('tagDropdownCompact')">
                                <i class="fas fa-tags"></i>
                                <span>${this.getFilterLabel('tag', this.currentFilters.tag || 'all')}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-item ${!this.currentFilters.tag || this.currentFilters.tag === 'all' ? 'active' : ''}" 
                                     onclick="window.tasksView.setFilter('tag', 'all')">
                                    <i class="fas fa-check check-icon"></i>
                                    Tous les tags
                                </div>
                                ${allTags.length > 0 ? `
                                    <div class="dropdown-divider"></div>
                                    <div class="dropdown-section-title">Tags disponibles</div>
                                    ${allTags.map(tag => `
                                        <div class="dropdown-item tag-item ${this.currentFilters.tag === tag.name ? 'active' : ''}" 
                                             onclick="window.tasksView.setFilter('tag', '${tag.name}')">
                                            <i class="fas fa-check check-icon"></i>
                                            <i class="fas fa-tag"></i>
                                            <span class="tag-name">${this.escapeHtml(tag.name)}</span>
                                            <span class="tag-count">${tag.count}</span>
                                        </div>
                                    `).join('')}
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Tri -->
                        <div class="filter-dropdown compact" id="sortDropdownCompact">
                            <button class="filter-button compact sort-button" onclick="window.tasksView.toggleDropdown('sortDropdownCompact')">
                                <i class="fas fa-sort"></i>
                                <span>${this.getFilterLabel('sortBy', this.currentFilters.sortBy)}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-section-title">Trier par</div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'priority' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('priority')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-flag"></i> Priorité
                                </div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'dueDate' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('dueDate')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-check"></i> Échéance
                                </div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'created' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('created')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-plus"></i> Date de création
                                </div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'updated' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('updated')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-calendar-check"></i> Dernière modification
                                </div>
                                <div class="dropdown-item ${this.currentFilters.sortBy === 'alphabetical' ? 'active' : ''}" 
                                     onclick="window.tasksView.setSort('alphabetical')">
                                    <i class="fas fa-check check-icon"></i>
                                    <i class="fas fa-sort-alpha-down"></i> Alphabétique
                                </div>
                            </div>
                        </div>
                        
                        <button class="btn btn-secondary btn-sm reset-btn ${activeFilterCount > 0 ? 'visible' : ''}" 
                                onclick="window.tasksView.resetFilters()">
                            <i class="fas fa-times"></i> Réinitialiser (${activeFilterCount})
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getAllTags() {
        const tagsMap = new Map();
        
        window.taskManager.getAllTasks().forEach(task => {
            if (task.tags && task.tags.length > 0) {
                task.tags.forEach(tag => {
                    if (!tagsMap.has(tag)) {
                        tagsMap.set(tag, { name: tag, count: 0 });
                    }
                    tagsMap.get(tag).count++;
                });
            }
        });
        
        return Array.from(tagsMap.values()).sort((a, b) => b.count - a.count);
    }

    renderBulkActions() {
        const filteredTasks = window.taskManager.filterTasks(this.currentFilters);
        const allSelected = filteredTasks.length > 0 && 
            filteredTasks.every(task => this.selectedTasks.has(task.id));
        
        return `
            <div class="bulk-actions ${this.selectedTasks.size > 0 ? 'visible' : ''}" id="bulkActions">
                <div class="bulk-info">
                    <span class="selection-count">${this.selectedTasks.size}</span> tâche(s) sélectionnée(s)
                </div>
                <div class="bulk-buttons">
                    <button class="btn btn-secondary btn-sm" onclick="window.tasksView.toggleSelectAll()">
                        <i class="fas fa-check-square"></i> 
                        <span>${allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}</span>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.tasksView.deleteSelected()">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        console.log('[TasksView] Rendering', tasks.length, 'filtered tasks');
        
        if (tasks.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3 class="empty-state-title">Aucune tâche trouvée</h3>
                    <p class="empty-state-text">${this.currentFilters.search ? 'Aucun résultat pour votre recherche' : 'Créez une nouvelle tâche ou ajustez les filtres'}</p>
                    ${this.currentFilters.status !== 'all' || this.currentFilters.priority !== 'all' ? 
                        '<button class="btn btn-primary" onclick="window.tasksView.resetFilters()">Réinitialiser les filtres</button>' : 
                        '<button class="btn btn-primary" onclick="window.tasksView.showCreateModal()">Créer une tâche</button>'
                    }
                </div>
            `;
        }
        
        return `
            <div class="tasks-list">
                ${tasks.map(task => this.renderTaskItem(task)).join('')}
            </div>
        `;
    }

    renderTaskItem(task) {
        const isCompleted = task.status === 'completed';
        const hasAI = task.aiAnalysis && task.aiAnalysis.method;
        const needsReply = task.hasEmail && !task.emailReplied && !isCompleted;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
        const isSelected = this.selectedTasks.has(task.id);
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                
                <div class="task-checkbox">
                    <div class="custom-checkbox ${isCompleted ? 'checked' : ''}" 
                         onclick="event.stopPropagation(); window.tasksView.toggleTaskStatus('${task.id}')">
                        ${isCompleted ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                </div>
                
                <div class="task-select">
                    <div class="custom-checkbox ${isSelected ? 'checked' : ''}" 
                         onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                        ${isSelected ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                </div>
                
                <div class="task-content" onclick="window.tasksView.showTaskModal('${task.id}')">
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="task-badges">
                            <span class="priority-badge ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                            ${task.hasEmail ? '<span class="email-badge"><i class="fas fa-envelope"></i></span>' : ''}
                            ${hasAI ? '<span class="ai-badge"><i class="fas fa-robot"></i></span>' : ''}
                            ${needsReply ? '<span class="reply-badge"><i class="fas fa-reply"></i></span>' : ''}
                        </div>
                    </div>
                    
                    <div class="task-description">
                        ${task.description ? `<p>${this.escapeHtml(task.description).substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>` : ''}
                        ${task.tags && task.tags.length > 0 ? `
                            <div class="task-tags">
                                ${task.tags.map(tag => `
                                    <span class="task-tag" onclick="event.stopPropagation(); window.tasksView.setFilter('tag', '${tag}')">
                                        <i class="fas fa-tag"></i>
                                        ${this.escapeHtml(tag)}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="task-meta">
                        ${task.emailFromName ? `
                            <span class="meta-item">
                                <i class="fas fa-user"></i> ${this.escapeHtml(task.emailFromName)}
                            </span>
                        ` : ''}
                        
                        ${task.dueDate ? `
                            <span class="meta-item ${isOverdue ? 'overdue' : ''}">
                                <i class="fas fa-calendar"></i> ${this.formatDate(task.dueDate)}
                            </span>
                        ` : ''}
                        
                        <span class="meta-item">
                            <i class="fas fa-clock"></i> ${this.formatDate(task.createdAt)}
                        </span>
                    </div>
                </div>
                
                <div class="task-actions">
                    ${needsReply ? `
                        <button class="action-btn primary" 
                                onclick="event.stopPropagation(); window.tasksView.quickReply('${task.id}')"
                                title="Répondre rapidement">
                            <i class="fas fa-reply"></i>
                        </button>
                    ` : ''}
                    <button class="action-btn danger" 
                            onclick="event.stopPropagation(); window.tasksView.deleteTask('${task.id}')"
                            title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
// Remplacer la fonction showTaskModal dans TasksView (TaskManager.js)
// Remplacer dans TaskManager.js (TasksView class)
showTaskModal(taskId) {
    const task = window.taskManager.getTask(taskId);
    if (!task) return;
    
    // Nettoyer tout modal existant
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    
    this.currentTaskDetail = task;
    this.editMode = false;
    
    // Créer un nouvel id unique
    const uniqueId = 'task_detail_modal_' + Date.now();

    // Créer le modal avec style inline pour forcer l'affichage
    const modalHTML = `
        <div id="${uniqueId}" 
             style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                    z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                    padding: 20px; backdrop-filter: blur(4px);">
            <div style="background: white; border-radius: 12px; max-width: 1000px; width: 100%; 
                        max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <h2 id="modalTitle" style="margin: 0; font-size: 20px; color: white;">${this.escapeHtml(task.title)}</h2>
                    <input type="text" 
                           id="modalTitleInput" 
                           value="${this.escapeHtml(task.title)}"
                           style="display: none; width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                    <button onclick="window.tasksView.closeModalById('${uniqueId}');"
                            style="background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 20px; overflow-y: auto; flex: 1;">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <!-- Barre d'outils -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <div style="display: flex; gap: 12px;">
                                <button id="editModeBtn" onclick="window.tasksView.toggleEditMode();"
                                        style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                                    <i class="fas fa-edit"></i> Modifier
                                </button>
                                ${task.hasEmail && !task.emailReplied ? `
                                    <button onclick="window.tasksView.showReplySection();"
                                            style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                        <i class="fas fa-reply"></i> Répondre à l'email
                                    </button>
                                ` : ''}
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; 
                                             background: ${this.getPriorityBackground(task.priority)}; color: ${this.getPriorityColor(task.priority)};">
                                    ${this.getPriorityLabel(task.priority)}
                                </span>
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;
                                             background: ${this.getStatusBackground(task.status)}; color: ${this.getStatusColor(task.status)};">
                                    ${this.getStatusLabel(task.status)}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Contenu principal -->
                        <div style="display: flex; flex-direction: column; gap: 20px;">
                            ${task.hasEmail && task.emailFromName ? this.renderSenderContext(task) : ''}
                            
                            ${this.renderTaskSections(task)}
                            
                            ${task.hasEmail && (task.emailContent || task.emailFullHtml || task.emailHtml) ? this.renderEmailSection(task) : ''}
                            
                            ${this.renderMetadataSection(task)}
                        </div>
                    </div>
                </div>
                <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                    <div id="viewFooter">
                        <button onclick="window.tasksView.closeModalById('${uniqueId}');"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Fermer
                        </button>
                    </div>
                    <div id="editFooter" style="display: none;">
                        <button onclick="window.tasksView.cancelEdit();"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Annuler
                        </button>
                        <button onclick="window.tasksView.saveEdit();"
                                style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// Ajouter cette nouvelle méthode pour fermer par ID
closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Simplifier la fonction closeModal existante
closeModal(modalId) {
    document.querySelectorAll('.modal-overlay, [id^="task_detail_modal_"], [id^="email_modal_"], [id^="task_creation_modal_"]').forEach(el => el.remove());
    document.body.style.overflow = '';
}

// Ajouter ces méthodes d'aide pour les couleurs
getPriorityBackground(priority) {
    const backgrounds = {
        urgent: '#fee2e2',
        high: '#fef3c7', 
        medium: '#dbeafe',
        low: '#f3f4f6'
    };
    return backgrounds[priority] || '#f3f4f6';
}

getPriorityColor(priority) {
    const colors = {
        urgent: '#991b1b',
        high: '#92400e',
        medium: '#1e40af',
        low: '#4b5563'
    };
    return colors[priority] || '#4b5563';
}

getStatusBackground(status) {
    const backgrounds = {
        todo: '#dbeafe',
        'in-progress': '#fef3c7',
        completed: '#d1fae5'
    };
    return backgrounds[status] || '#f3f4f6';
}

getStatusColor(status) {
    const colors = {
        todo: '#1e40af',
        'in-progress': '#92400e',
        completed: '#065f46'
    };
    return colors[status] || '#4b5563';
}

// Remplacer la fonction showEmailModal dans PageManager.js

showEmailModal(emailId) {
    const email = this.getEmailById(emailId);
    if (!email) return;

    // Fermer modal existant s'il y en a un
    const existingModal = document.getElementById('emailDetailModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal element
    let modal = document.createElement('div');
    modal.id = 'emailDetailModal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = "10000004"; // Valeur très élevée
    modal.style.display = 'flex';

    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h2>Email Complet</h2>
                <button class="modal-close-btn" onclick="window.pageManager.closeEmailModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="email-detail-header">
                    <div class="email-detail-meta">
                        <div class="meta-row">
                            <span class="meta-label">De:</span>
                            <span>${email.from?.emailAddress?.name || ''} &lt;${email.from?.emailAddress?.address || ''}&gt;</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Date:</span>
                            <span>${new Date(email.receivedDateTime).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Sujet:</span>
                            <span>${email.subject || 'Sans sujet'}</span>
                        </div>
                    </div>
                </div>
                <div class="email-detail-body">
                    ${this.getEmailContent(email)}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="window.pageManager.closeEmailModal()">
                    Fermer
                </button>
                ${!this.createdTasks.has(emailId) ? `
                    <button class="btn btn-primary" onclick="window.pageManager.showTaskCreationModal('${emailId}')">
                        <i class="fas fa-tasks"></i> Créer une tâche
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Fonction auxiliaire pour le rendu du contenu (ajoutez cette fonction)
renderTaskModalContent(task) {
    return `
        <!-- Barre d'outils -->
        <div class="task-toolbar">
            <div class="toolbar-left">
                <button class="btn btn-secondary" id="editModeBtn" onclick="window.tasksView.toggleEditMode()">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                ${task.hasEmail && !task.emailReplied ? `
                    <button class="btn btn-primary" onclick="window.tasksView.showReplySection()">
                        <i class="fas fa-reply"></i> Répondre à l'email
                    </button>
                ` : ''}
            </div>
            <div class="toolbar-right">
                <span class="priority-badge ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                <span class="status-badge ${task.status}">${this.getStatusLabel(task.status)}</span>
                ${task.hasEmail ? '<span class="email-badge">📧 Email</span>' : ''}
                ${task.emailReplied ? '<span class="replied-badge">✅ Répondu</span>' : ''}
                ${task.aiGenerated ? `<span class="ai-badge">🤖 ${task.method || 'AI'}</span>` : ''}
            </div>
        </div>
        
        <!-- Contenu principal -->
        <div class="task-main-content">
            ${task.hasEmail && task.emailFromName ? this.renderSenderContext(task) : ''}
            
            ${this.renderTaskSections(task)}
            
            ${task.hasEmail && (task.emailContent || task.emailFullHtml || task.emailHtml) ? this.renderEmailSection(task) : ''}
            
            ${this.renderMetadataSection(task)}
            
            ${this.renderHistorySection(task)}
            
            ${task.aiAnalysis ? this.renderAIAnalysisUnified(task.aiAnalysis, task.id) : ''}
        </div>
    `;
}

// Remplacer les fonctions closeEmailModal et closeTaskModal dans PageManager.js

closeEmailModal() {
    const modal = document.getElementById('emailDetailModal');
    if (modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    }
}

closeTaskModal() {
    const modal = document.getElementById('taskCreationModal');
    if (modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    }
}

    // Rendu des sections structurées (synchronisé avec PageManager)
    renderTaskSections(task) {
        let html = '';
        
        // Debug pour voir les données
        console.log('[TasksView] Rendering task sections for:', task);
        
        // Vérifier si on a une description structurée (nouvelle méthode)
        const hasStructuredContent = task.summary || (task.actions && task.actions.length > 0) || 
                                   (task.keyInfo && task.keyInfo.length > 0) || 
                                   (task.risks && task.risks.length > 0);
        
        // Toujours afficher au moins la description
        if (task.summary || task.description) {
            html += `
                <div class="content-section">
                    <div class="section-header">
                        <i class="fas fa-clipboard-list"></i>
                        <h4>Résumé Exécutif</h4>
                    </div>
                    <div class="section-content">
                        <div id="summaryView" class="section-text">
                            ${this.formatSummary(task.summary || this.extractSummaryFromDescription(task.description))}
                        </div>
                        <textarea id="summaryEdit" 
                                  class="section-textarea" 
                                  rows="4"
                                  style="display: none;">${task.summary || this.extractSummaryFromDescription(task.description) || ''}</textarea>
                    </div>
                </div>
            `;
        }
        
        // Section Actions Requises
        if (task.actions && task.actions.length > 0) {
            html += `
                <div class="content-section">
                    <div class="section-header">
                        <i class="fas fa-tasks"></i>
                        <h4>Actions Requises</h4>
                    </div>
                    <div class="section-content">
                        <div id="actionsView" class="actions-list">
                            ${task.actions.map((action, idx) => `
                                <div class="action-item">
                                    <span class="action-number">${idx + 1}</span>
                                    <span class="action-text">${typeof action === 'string' ? action : action.text}</span>
                                    ${action.deadline ? `<span class="action-deadline">${action.deadline}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <div id="actionsEdit" style="display: none;">
                            ${task.actions.map((action, idx) => `
                                <div class="action-item-edit">
                                    <span class="action-number">${idx + 1}</span>
                                    <input type="text" 
                                           class="action-input" 
                                           value="${typeof action === 'string' ? action : action.text}" 
                                           data-action-index="${idx}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Section Informations Clés
        if (task.keyInfo && task.keyInfo.length > 0) {
            html += `
                <div class="content-section">
                    <div class="section-header">
                        <i class="fas fa-info-circle"></i>
                        <h4>Informations Clés</h4>
                    </div>
                    <div class="section-content">
                        <div class="info-grid">
                            ${task.keyInfo.map(info => `
                                <div class="info-item">
                                    <i class="fas fa-chevron-right"></i>
                                    <span>${info}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Section Points d'Attention
        if (task.risks && task.risks.length > 0) {
            html += `
                <div class="content-section attention-section">
                    <div class="section-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>Points d'Attention</h4>
                    </div>
                    <div class="section-content">
                        <div class="attention-list">
                            ${task.risks.map(risk => `
                                <div class="attention-item">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>${risk}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Si aucune section structurée, afficher la description simple
        if (!html && task.description) {
            html = `
                <div class="content-section">
                    <h3>Description</h3>
                    <div id="descriptionView" class="description-view">
                        ${this.formatDescription(task.description)}
                    </div>
                    <textarea id="descriptionEdit" 
                              class="form-textarea" 
                              rows="6"
                              style="display: none;">${task.description || ''}</textarea>
                </div>
            `;
        }
        
        return html;
    }

    // Méthodes de rendu (suite de la classe)
    renderSenderContext(task) {
        const senderName = task.emailFromName || 'Inconnu';
        const senderEmail = task.emailFrom || '';
        const senderDomain = task.emailDomain || '';
        const senderInitial = senderName.charAt(0).toUpperCase();
        
        return `
            <div class="sender-context-box">
                <div class="sender-avatar-small">${senderInitial}</div>
                <div class="sender-details">
                    <div class="sender-name-bold">${senderName}</div>
                    <div class="sender-email-small">${senderEmail}</div>
                    ${senderDomain ? `<div class="sender-domain">@${senderDomain}</div>` : ''}
                </div>
            </div>
        `;
    }

    renderEmailSection(task) {
        // Utiliser la logique unifiée pour récupérer le contenu
        let content = '';
        let isHtml = false;
        
        // 1. Priorité à l'email original si disponible
        if (task.originalEmail && task.originalEmail.body?.content) {
            content = task.originalEmail.body.content;
            isHtml = true;
        } 
        // 2. Sinon utiliser emailFullHtml ou emailHtml
        else if (task.emailFullHtml) {
            content = task.emailFullHtml;
            isHtml = true;
        } else if (task.emailHtml) {
            content = task.emailHtml;
            isHtml = true;
        } 
        // 3. Sinon utiliser emailContent
        else if (task.emailContent) {
            content = task.emailContent;
            isHtml = task.emailContentType === 'html' || window.taskManager.isHtmlContent(content);
        }
        
        // Si pas de contenu, afficher un message
        if (!content) {
            content = 'Aucun contenu disponible';
            isHtml = false;
        }
        
        console.log('[TasksView] Rendering email section:', {
            hasOriginalEmail: !!task.originalEmail,
            hasContent: !!content,
            contentLength: content.length,
            isHtml: isHtml,
            contentType: task.emailContentType
        });
        
        return `
            <div class="content-section email-section">
                <h3><i class="fas fa-envelope"></i> Email associé</h3>
                
                <div class="email-header-info">
                    <div class="email-field">
                        <strong>De:</strong> ${this.escapeHtml(task.emailFromName || '')} 
                        <span class="email-address">&lt;${this.escapeHtml(task.emailFrom || '')}&gt;</span>
                    </div>
                    <div class="email-field">
                        <strong>Objet:</strong> ${this.escapeHtml(task.emailSubject || 'Sans objet')}
                    </div>
                    <div class="email-field">
                        <strong>Date:</strong> ${this.formatDate(task.emailDate || task.createdAt)}
                    </div>
                    ${task.hasAttachments ? `
                        <div class="email-field">
                            <strong>Pièces jointes:</strong> <i class="fas fa-paperclip"></i> Oui
                        </div>
                    ` : ''}
                </div>
                
                <div class="email-content-container">
                    <div class="email-content-header">
                        <h4>Contenu de l'email</h4>
                        ${isHtml ? '<span class="email-type-badge">HTML</span>' : '<span class="email-type-badge">Texte</span>'}
                    </div>
                    <div class="email-content-box ${isHtml ? 'html-content' : 'text-content'}">
                        ${this.formatEmailContent(content, isHtml)}
                    </div>
                </div>
                
                <!-- Section de réponse (cachée par défaut) -->
                <div id="replySection" class="reply-section-integrated" style="display: none;">
                    ${this.renderUnifiedReplyInterface(task)}
                </div>
            </div>
        `;
    }

    formatEmailContent(content, isHtml = false) {
        if (!content) return '<p class="text-muted">Aucun contenu</p>';
        
        if (isHtml) {
            // Pour le contenu HTML, créer un conteneur sécurisé
            console.log('[TasksView] Formatting HTML email content');
            
            // Nettoyer le HTML mais préserver les images et la structure
            const cleanedHtml = this.sanitizeEmailHtml(content);
            
            return `
                <div class="email-html-container">
                    <div class="email-html-content">${cleanedHtml}</div>
                </div>
            `;
        } else {
            // Pour le texte brut
            const escaped = this.escapeHtml(content);
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const withLinks = escaped.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
            
            return `<div class="formatted-content">${withLinks.replace(/\n/g, '<br>')}</div>`;
        }
    }

    sanitizeEmailHtml(html) {
        // Nettoyer le HTML tout en préservant les images et la structure
        let cleaned = html
            // Supprimer les scripts
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // Supprimer les event handlers
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
            // Supprimer javascript: URLs
            .replace(/javascript:/gi, 'void:')
            // Supprimer les balises potentiellement dangereuses mais garder img
            .replace(/<(iframe|embed|object|form|input|textarea|button|select|script|link|meta|base)[^>]*>/gi, '')
            .replace(/<\/(iframe|embed|object|form|input|textarea|button|select|script|link|meta|base)>/gi, '');
            
        // Traiter les images pour s'assurer qu'elles sont visibles
        cleaned = cleaned.replace(/<img([^>]*)>/gi, (match, attributes) => {
            // S'assurer que les images ont des attributs sûrs
            let safeAttributes = attributes
                .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                .replace(/javascript:/gi, '');
                
            // Ajouter des styles pour assurer la visibilité
            if (!safeAttributes.includes('style=')) {
                safeAttributes += ' style="max-width: 100%; height: auto;"';
            }
            
            return `<img${safeAttributes}>`;
        });
        
        // Préserver les styles inline basiques (y compris pour les images)
        cleaned = cleaned.replace(/style\s*=\s*["']([^"']*)/gi, (match, styles) => {
            // Garder les styles sûrs et ceux nécessaires pour les images
            const safeStyles = styles
                .split(';')
                .filter(style => {
                    const prop = style.split(':')[0].trim().toLowerCase();
                    return ['color', 'background-color', 'background', 'font-size', 'font-weight', 
                            'text-align', 'margin', 'padding', 'width', 'height', 'max-width', 
                            'max-height', 'display', 'border', 'border-radius'].includes(prop);
                })
                .join(';');
            return safeStyles ? `style="${safeStyles}` : '';
        });
        
        // S'assurer que les liens dans les emails sont sûrs
        cleaned = cleaned.replace(/href\s*=\s*["']([^"']*)/gi, (match, url) => {
            if (url.startsWith('javascript:') || url.startsWith('data:')) {
                return 'href="#"';
            }
            return match;
        });
            
        return cleaned;
    }

    renderMetadataSection(task) {
        return `
            <div class="content-section metadata-section">
                <h3>Informations</h3>
                <div class="metadata-grid">
                    <div class="metadata-item">
                        <label>Échéance</label>
                        <div id="dueDateView" class="metadata-value">
                            ${task.dueDate ? this.formatDate(task.dueDate) : 'Non définie'}
                        </div>
                        <input type="date" 
                               id="dueDateEdit"
                               class="form-input"
                               value="${task.dueDate ? task.dueDate.split('T')[0] : ''}"
                               style="display: none;">
                    </div>
                    
                    <div class="metadata-item">
                        <label>Client</label>
                        <div id="clientView" class="metadata-value">
                            ${task.client || 'Non défini'}
                        </div>
                        <input type="text" 
                               id="clientEdit"
                               class="form-input"
                               value="${task.client || ''}"
                               style="display: none;">
                    </div>
                    
                    <div class="metadata-item">
                        <label>Catégorie</label>
                        <div id="categoryView" class="metadata-value">
                            ${task.category || 'Autre'}
                        </div>
                        <select id="categoryEdit" 
                                class="form-select"
                                style="display: none;">
                            <option value="tasks" ${task.category === 'tasks' ? 'selected' : ''}>Tâches</option>
                            <option value="email" ${task.category === 'email' ? 'selected' : ''}>Email</option>
                            <option value="project" ${task.category === 'project' ? 'selected' : ''}>Projet</option>
                            <option value="meeting" ${task.category === 'meeting' ? 'selected' : ''}>Réunion</option>
                            <option value="finance" ${task.category === 'finance' ? 'selected' : ''}>Finance</option>
                            <option value="client" ${task.category === 'client' ? 'selected' : ''}>Client</option>
                            <option value="other" ${task.category === 'other' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>
                    
                    <div class="metadata-item">
                        <label>Tags</label>
                        <div id="tagsView" class="metadata-value">
                            ${task.tags && task.tags.length > 0 ? 
                                task.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('') : 
                                'Aucun tag'}
                        </div>
                        <input type="text" 
                               id="tagsEdit"
                               class="form-input"
                               placeholder="tag1, tag2, tag3..."
                               value="${task.tags ? task.tags.join(', ') : ''}"
                               style="display: none;">
                    </div>
                </div>
                
                <!-- Sélecteurs en mode édition -->
                <div id="editSelectors" class="edit-selectors" style="display: none;">
                    <div class="selector-item">
                        <label>Priorité</label>
                        <select id="priorityEdit" class="form-select">
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                        </select>
                    </div>
                    <div class="selector-item">
                        <label>Statut</label>
                        <select id="statusEdit" class="form-select">
                            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>À faire</option>
                            <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>En cours</option>
                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Terminée</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    renderHistorySection(task) {
        return `
            <div class="content-section history-section">
                <h3>Historique</h3>
                <div class="history-items">
                    <div class="history-item">
                        <strong>Créée le</strong>
                        <span>${this.formatDate(task.createdAt)}</span>
                    </div>
                    <div class="history-item">
                        <strong>Modifiée le</strong>
                        <span>${this.formatDate(task.updatedAt)}</span>
                    </div>
                    ${task.completedAt ? `
                        <div class="history-item">
                            <strong>Terminée le</strong>
                            <span>${this.formatDate(task.completedAt)}</span>
                        </div>
                    ` : ''}
                    ${task.lastReplyDate ? `
                        <div class="history-item">
                            <strong>Répondu le</strong>
                            <span>${this.formatDate(task.lastReplyDate)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderUnifiedReplyInterface(task) {
        const suggestions = task.aiAnalysis?.suggestedReplies || this.generateDefaultReplies(task);
        
        return `
            <div class="reply-wrapper">
                <h4><i class="fas fa-reply"></i> Répondre à l'email</h4>
                
                <!-- Suggestions IA en ligne -->
                ${suggestions.length > 0 ? `
                    <div class="inline-suggestions">
                        <label>Utiliser une suggestion :</label>
                        <div class="suggestion-pills">
                            ${suggestions.map((sugg, idx) => `
                                <button class="suggestion-pill" 
                                        onclick="window.tasksView.applySuggestion(${idx})"
                                        title="${this.escapeHtml(sugg.content).substring(0, 100)}...">
                                    ${this.getReplyToneIcon(sugg.tone)} ${this.getReplyToneLabel(sugg.tone)}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Formulaire de réponse compact -->
                <form id="replyForm" class="compact-reply-form" onsubmit="window.tasksView.sendReply(event, '${task.id}')">
                    <div class="reply-fields">
                        <div class="field-row">
                            <label>À:</label>
                            <input type="email" 
                                   name="to" 
                                   id="replyTo"
                                   class="form-input" 
                                   value="${task.emailFrom || ''}" 
                                   required>
                        </div>
                        
                        <div class="field-row">
                            <label>Objet:</label>
                            <input type="text" 
                                   name="subject" 
                                   id="replySubject"
                                   class="form-input" 
                                   value="Re: ${task.emailSubject || 'Sans objet'}" 
                                   required>
                        </div>
                    </div>
                    
                    <div class="reply-content-area">
                        <textarea name="content" 
                                  id="replyContent"
                                  class="form-textarea" 
                                  rows="8" 
                                  placeholder="Votre réponse..."
                                  required>${suggestions.length > 0 ? suggestions[0].content : ''}</textarea>
                    </div>
                    
                    <div class="reply-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.tasksView.hideReplySection()">
                            Annuler
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Envoyer
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    renderAIAnalysisUnified(analysis, taskId) {
        if (!analysis) return '';
        
        return `
            <div class="content-section ai-section">
                <h3><i class="fas fa-robot"></i> Analyse IA</h3>
                
                ${analysis.summary ? `
                    <div class="ai-block">
                        <h4>Résumé</h4>
                        <p>${this.escapeHtml(analysis.summary)}</p>
                    </div>
                ` : ''}
                
                ${analysis.actionPoints?.length > 0 ? `
                    <div class="ai-block">
                        <h4>Actions suggérées</h4>
                        <ul class="action-list">
                            ${analysis.actionPoints.map(action => `
                                <li>${this.escapeHtml(action)}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${analysis.insights?.keyInfo?.length > 0 ? `
                    <div class="ai-block">
                        <h4>Informations clés</h4>
                        <ul class="info-list">
                            ${analysis.insights.keyInfo.map(info => `
                                <li>${this.escapeHtml(info)}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${analysis.insights?.risks?.length > 0 ? `
                    <div class="ai-block attention-block">
                        <h4>Points d'attention</h4>
                        <ul class="attention-list">
                            ${analysis.insights.risks.map(risk => `
                                <li><i class="fas fa-exclamation-circle"></i> ${this.escapeHtml(risk)}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="ai-metadata">
                    <span class="ai-method">Méthode: ${analysis.method || 'Inconnue'}</span>
                    ${analysis.confidence ? `<span class="ai-confidence">Confiance: ${Math.round(analysis.confidence * 100)}%</span>` : ''}
                </div>
            </div>
        `;
    }

    // Méthodes d'édition
    toggleEditMode() {
        this.editMode = !this.editMode;
        const btn = document.getElementById('editModeBtn');
        
        if (this.editMode) {
            // Activer le mode édition
            btn.innerHTML = '<i class="fas fa-times"></i> Annuler';
            btn.classList.add('active');
            
            // Titre
            document.getElementById('modalTitle').style.display = 'none';
            document.getElementById('modalTitleInput').style.display = 'block';
            
            // Sections structurées
            const viewElements = ['summaryView', 'actionsView', 'descriptionView', 'dueDateView', 'clientView', 'categoryView', 'tagsView'];
            const editElements = ['summaryEdit', 'actionsEdit', 'descriptionEdit', 'dueDateEdit', 'clientEdit', 'categoryEdit', 'tagsEdit'];
            
            viewElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.style.display = 'none';
            });
            
            editElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.style.display = 'block';
            });
            
            // Sélecteurs
            document.getElementById('editSelectors').style.display = 'flex';
            
            // Footer
            document.getElementById('viewFooter').style.display = 'none';
            document.getElementById('editFooter').style.display = 'flex';
            
        } else {
            this.cancelEdit();
        }
    }

    cancelEdit() {
        this.editMode = false;
        const btn = document.getElementById('editModeBtn');
        btn.innerHTML = '<i class="fas fa-edit"></i> Modifier';
        btn.classList.remove('active');
        
        // Restaurer l'affichage
        document.getElementById('modalTitle').style.display = 'block';
        document.getElementById('modalTitleInput').style.display = 'none';
        
        const viewElements = ['summaryView', 'actionsView', 'descriptionView', 'dueDateView', 'clientView', 'categoryView', 'tagsView'];
        const editElements = ['summaryEdit', 'actionsEdit', 'descriptionEdit', 'dueDateEdit', 'clientEdit', 'categoryEdit', 'tagsEdit'];
        
        viewElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'block';
        });
        
        editElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });
        
        document.getElementById('editSelectors').style.display = 'none';
        
        document.getElementById('viewFooter').style.display = 'flex';
        document.getElementById('editFooter').style.display = 'none';
    }

    saveEdit() {
        const task = this.currentTaskDetail;
        
        const updates = {
            title: document.getElementById('modalTitleInput').value,
            dueDate: document.getElementById('dueDateEdit').value || null,
            client: document.getElementById('clientEdit').value,
            category: document.getElementById('categoryEdit').value,
            tags: document.getElementById('tagsEdit').value ? 
                  document.getElementById('tagsEdit').value.split(',').map(t => t.trim()).filter(t => t) : [],
            priority: document.getElementById('priorityEdit').value,
            status: document.getElementById('statusEdit').value
        };
        
        // Gérer les sections structurées
        const summaryEdit = document.getElementById('summaryEdit');
        if (summaryEdit) {
            updates.summary = summaryEdit.value;
        }
        
        const descriptionEdit = document.getElementById('descriptionEdit');
        if (descriptionEdit) {
            updates.description = descriptionEdit.value;
        }
        
        // Gérer les actions
        const actionInputs = document.querySelectorAll('.action-input');
        if (actionInputs.length > 0) {
            updates.actions = Array.from(actionInputs).map(input => ({
                text: input.value,
                deadline: null // À améliorer si nécessaire
            }));
        }
        
        window.taskManager.updateTask(task.id, updates);
        
        // Fermer et rouvrir le modal pour rafraîchir
        this.closeModal('taskModal');
        setTimeout(() => {
            this.showTaskModal(task.id);
        }, 100);
    }

    // Gestion de la réponse email
    showReplySection() {
        const replySection = document.getElementById('replySection');
        if (replySection) {
            replySection.style.display = 'block';
            replySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('replyContent').focus();
        }
    }

    hideReplySection() {
        const replySection = document.getElementById('replySection');
        if (replySection) {
            replySection.style.display = 'none';
        }
    }

    applySuggestion(index) {
        const task = this.currentTaskDetail;
        const suggestions = task.aiAnalysis?.suggestedReplies || this.generateDefaultReplies(task);
        
        if (suggestions[index]) {
            const textarea = document.getElementById('replyContent');
            const subjectInput = document.getElementById('replySubject');
            if (textarea) {
                textarea.value = suggestions[index].content;
                textarea.focus();
            }
            if (subjectInput && suggestions[index].subject) {
                subjectInput.value = suggestions[index].subject;
            }
        }
    }

    async sendReply(event, taskId) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const to = formData.get('to');
        const subject = formData.get('subject');
        const content = formData.get('content');
        
        try {
            // Ouvrir le client email
            const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
            window.open(mailtoLink);
            
            // Marquer comme répondu
            window.taskManager.markAsReplied(taskId);
            
            // Rafraîchir
            this.closeModal('taskModal');
            setTimeout(() => {
                this.showTaskModal(taskId);
            }, 100);
            
            if (window.uiManager?.showToast) {
                window.uiManager.showToast('Email prêt à envoyer!', 'success');
            } else {
                alert('Email prêt à envoyer!');
            }
        } catch (error) {
            console.error('Erreur envoi email:', error);
            alert('Erreur lors de l\'envoi: ' + error.message);
        }
    }

// Remplacer dans TaskManager.js (TasksView class)
showCreateModal() {
    // Nettoyer tout modal existant
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    
    // Créer un nouvel id unique
    const uniqueId = 'create_task_modal_' + Date.now();

    // Créer le modal avec style inline pour forcer l'affichage
    const modalHTML = `
        <div id="${uniqueId}" 
             style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                    z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                    padding: 20px; backdrop-filter: blur(4px);">
            <div style="background: white; border-radius: 12px; max-width: 600px; width: 100%; 
                        max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 20px; color: white;">Nouvelle tâche</h2>
                    <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                            style="background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="createForm" onsubmit="window.tasksView.createTask(event); return false;">
                    <div style="padding: 20px; overflow-y: auto; flex: 1;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Titre <span style="color: #ef4444;">*</span></label>
                            <input type="text" 
                                   name="title" 
                                   style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;"
                                   placeholder="Titre de la tâche..."
                                   required>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Description</label>
                            <textarea name="description" 
                                      style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; min-height: 120px; font-size: 14px; resize: vertical;"
                                      placeholder="Description détaillée..."></textarea>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Priorité</label>
                                <select name="priority" style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                                    <option value="low">📄 Basse</option>
                                    <option value="medium" selected>📌 Normale</option>
                                    <option value="high">⚡ Haute</option>
                                    <option value="urgent">🚨 Urgente</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Date d'échéance</label>
                                <input type="date" 
                                       name="dueDate" 
                                       style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Client</label>
                            <input type="text" 
                                   name="client" 
                                   style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                   placeholder="Nom du client ou entreprise...">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Tags (séparés par des virgules)</label>
                            <input type="text" 
                                   name="tags" 
                                   style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                   placeholder="tag1, tag2, tag3...">
                        </div>
                    </div>
                    
                    <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Annuler
                        </button>
                        <button type="submit"
                                style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-plus"></i> Créer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Ajouter au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}
// Ajouter ces fonctions dans TasksView class (TaskManager.js)

// Rendu des sections de tâche
renderTaskSections(task) {
    let html = '';
    
    // Description
    if (task.summary || task.description) {
        html += `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <i class="fas fa-clipboard-list" style="color: #6b7280;"></i>
                    <h4 style="margin: 0; font-size: 15px; font-weight: 600;">Résumé Exécutif</h4>
                </div>
                <div style="padding: 16px;">
                    <div id="summaryView" style="font-size: 14px; line-height: 1.6; color: #374151;">
                        ${this.formatSummary(task.summary || this.extractSummaryFromDescription(task.description) || 'Aucune description')}
                    </div>
                    <textarea id="summaryEdit" 
                              style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; min-height: 100px; display: none;"
                              rows="4">${task.summary || this.extractSummaryFromDescription(task.description) || ''}</textarea>
                </div>
            </div>
        `;
    }
    
    // Actions
    if (task.actions && task.actions.length > 0) {
        html += `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <i class="fas fa-tasks" style="color: #6b7280;"></i>
                    <h4 style="margin: 0; font-size: 15px; font-weight: 600;">Actions Requises</h4>
                </div>
                <div style="padding: 16px;">
                    <div id="actionsView">
                        ${task.actions.map((action, idx) => `
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <span style="width: 24px; height: 24px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${idx + 1}</span>
                                <span style="font-size: 14px; color: #374151;">${typeof action === 'string' ? action : action.text}</span>
                                ${action.deadline ? `<span style="font-size: 12px; color: #ef4444; font-weight: 500;">${action.deadline}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    return html;
}

// Rendu de la section email
renderEmailSection(task) {
    // Utiliser la logique unifiée pour récupérer le contenu
    let content = '';
    let isHtml = false;
    
    // 1. Priorité à l'email original si disponible
    if (task.originalEmail && task.originalEmail.body?.content) {
        content = task.originalEmail.body.content;
        isHtml = true;
    } 
    // 2. Sinon utiliser emailFullHtml ou emailHtml
    else if (task.emailFullHtml) {
        content = task.emailFullHtml;
        isHtml = true;
    } else if (task.emailHtml) {
        content = task.emailHtml;
        isHtml = true;
    } 
    // 3. Sinon utiliser emailContent
    else if (task.emailContent) {
        content = task.emailContent;
        isHtml = task.emailContentType === 'html';
    }
    
    // Si pas de contenu, afficher un message
    if (!content) {
        content = 'Aucun contenu disponible';
        isHtml = false;
    }
    
    return `
        <div style="background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
            <h3 style="margin: 0; padding: 12px 16px; background: #e0f2fe; border-bottom: 1px solid #7dd3fc; font-size: 16px; color: #075985;">
                <i class="fas fa-envelope"></i> Email associé
            </h3>
            
            <div style="padding: 16px; background: white; border: 1px solid #bae6fd; border-radius: 6px; margin: 16px;">
                <div style="margin-bottom: 12px;">
                    <div style="margin-bottom: 4px;">
                        <strong>De:</strong> ${this.escapeHtml(task.emailFromName || '')} 
                        <span style="color: #6b7280;">&lt;${this.escapeHtml(task.emailFrom || '')}&gt;</span>
                    </div>
                    <div style="margin-bottom: 4px;">
                        <strong>Objet:</strong> ${this.escapeHtml(task.emailSubject || 'Sans objet')}
                    </div>
                    <div style="margin-bottom: 4px;">
                        <strong>Date:</strong> ${this.formatDate(task.emailDate || task.createdAt)}
                    </div>
                </div>
            </div>
            
            <div style="margin: 0 16px 16px 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px 6px 0 0; border-bottom: none;">
                    <h4 style="margin: 0; font-size: 14px; color: #075985;">Contenu de l'email</h4>
                    <span style="font-size: 11px; padding: 2px 8px; background: #dbeafe; color: #1e40af; border-radius: 12px;">
                        ${isHtml ? 'HTML' : 'Texte'}
                    </span>
                </div>
                <div style="max-height: 400px; overflow-y: auto; padding: 16px; background: white; border: 1px solid #bae6fd; border-radius: 0 0 6px 6px;">
                    ${isHtml ? 
                        `<div style="font-size: 14px; line-height: 1.6; color: #374151;">${this.sanitizeEmailHtml(content)}</div>` : 
                        `<div style="font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #374151;">${this.escapeHtml(content)}</div>`
                    }
                </div>
            </div>
        </div>
    `;
}

// Rendu de la section metadata
renderMetadataSection(task) {
    return `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
            <h3 style="margin: 0; padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 16px; color: #374151;">
                Informations
            </h3>
            
            <div style="padding: 16px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <div>
                        <label style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 4px;">
                            Échéance
                        </label>
                        <div id="dueDateView" style="font-size: 14px; color: #374151;">
                            ${task.dueDate ? this.formatDate(task.dueDate) : 'Non définie'}
                        </div>
                    </div>
                    
                    <div>
                        <label style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 4px;">
                            Client
                        </label>
                        <div id="clientView" style="font-size: 14px; color: #374151;">
                            ${task.client || 'Non défini'}
                        </div>
                    </div>
                    
                    <div>
                        <label style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 4px;">
                            Catégorie
                        </label>
                        <div id="categoryView" style="font-size: 14px; color: #374151;">
                            ${task.category || 'Autre'}
                        </div>
                    </div>
                    
                    <div>
                        <label style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 4px;">
                            Tags
                        </label>
                        <div id="tagsView" style="font-size: 14px; color: #374151;">
                            ${task.tags && task.tags.length > 0 ? 
                                task.tags.map(tag => `<span style="display: inline-block; padding: 2px 8px; background: #e5e7eb; color: #4b5563; border-radius: 12px; font-size: 12px; margin-right: 4px; margin-bottom: 4px;">${this.escapeHtml(tag)}</span>`).join('') : 
                                'Aucun tag'}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; color: #6b7280;">
                        <span><strong>Créée le</strong></span>
                        <span>${this.formatDate(task.createdAt)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; color: #6b7280;">
                        <span><strong>Modifiée le</strong></span>
                        <span>${this.formatDate(task.updatedAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Méthode pour renderSenderContext
renderSenderContext(task) {
    const senderName = task.emailFromName || 'Inconnu';
    const senderEmail = task.emailFrom || '';
    const senderDomain = task.emailDomain || '';
    const senderInitial = senderName.charAt(0).toUpperCase();
    
    return `
        <div style="display: flex; align-items: center; gap: 12px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600;">
                ${senderInitial}
            </div>
            <div>
                <div style="font-weight: 700; color: #1f2937; font-size: 16px;">${senderName}</div>
                <div style="font-size: 13px; color: #6b7280;">${senderEmail}</div>
                ${senderDomain ? `<div style="font-size: 12px; color: #9ca3af;">@${senderDomain}</div>` : ''}
            </div>
        </div>
    `;
}

// Fonction pour sanitizeEmailHtml
sanitizeEmailHtml(html) {
    if (!html) return '<p style="color: #9ca3af; font-style: italic;">Aucun contenu</p>';
    
    // Nettoyer le HTML tout en préservant les images et la structure
    let cleaned = html
        // Supprimer les scripts
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Supprimer les event handlers
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
        // Supprimer javascript: URLs
        .replace(/javascript:/gi, 'void:')
        // Supprimer les balises potentiellement dangereuses mais garder img
        .replace(/<(iframe|embed|object|form|input|textarea|button|select|script|link|meta|base)[^>]*>/gi, '')
        .replace(/<\/(iframe|embed|object|form|input|textarea|button|select|script|link|meta|base)>/gi, '');
        
    // Traiter les images pour s'assurer qu'elles sont visibles
    cleaned = cleaned.replace(/<img([^>]*)>/gi, (match, attributes) => {
        // S'assurer que les images ont des attributs sûrs
        let safeAttributes = attributes
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/javascript:/gi, '');
            
        // Ajouter des styles pour assurer la visibilité
        if (!safeAttributes.includes('style=')) {
            safeAttributes += ' style="max-width: 100%; height: auto;"';
        }
        
        return `<img${safeAttributes}>`;
    });
    
    return cleaned;
}

// Méthode formatSummary
formatSummary(summary) {
    if (!summary) return '<p style="color: #9ca3af; font-style: italic;">Aucun résumé</p>';
    
    // Traiter les sauts de ligne et les emojis
    return summary.split('\n').map(line => {
        if (line.includes('🚨')) {
            return `<p style="color: #ef4444; font-weight: 500;">${this.escapeHtml(line)}</p>`;
        } else if (line.includes('📮')) {
            return `<p style="color: #3b82f6; font-weight: 500;">${this.escapeHtml(line)}</p>`;
        } else {
            return `<p style="margin-bottom: 8px;">${this.escapeHtml(line)}</p>`;
        }
    }).join('');
}

// Méthode extractSummaryFromDescription
extractSummaryFromDescription(description) {
    if (!description) return '';
    
    // Chercher la section résumé dans la description
    const summaryMatch = description.match(/📧 RÉSUMÉ EXÉCUTIF\n━+\n([\s\S]*?)(?=\n\n|$)/);
    if (summaryMatch) {
        return summaryMatch[1].trim();
    }
    
    // Sinon, prendre les premières lignes
    const lines = description.split('\n').filter(line => line.trim());
    return lines.slice(0, 3).join('\n');
}
// Modifier la fonction createTask pour fermer le modal après création
createTask(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        status: 'todo',
        dueDate: formData.get('dueDate') || null,
        client: formData.get('client'),
        tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : []
    };
    
    window.taskManager.createTask(taskData);
    
    // Fermer tous les modaux
    document.querySelectorAll('[id^="create_task_modal_"]').forEach(el => el.remove());
    document.body.style.overflow = 'auto';
    
    // Rafraîchir la vue
    this.refreshView();
}
    createTask(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            status: 'todo',
            dueDate: formData.get('dueDate') || null,
            client: formData.get('client'),
            tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : []
        };
        
        window.taskManager.createTask(taskData);
        this.closeModal('createModal');
    }

    // Actions rapides
    quickReply(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        this.showTaskModal(taskId);
        setTimeout(() => {
            this.showReplySection();
        }, 100);
    }

    // Gestion de la sélection multiple
    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const allSelected = tasks.every(task => this.selectedTasks.has(task.id));
        
        if (allSelected) {
            this.selectedTasks.clear();
        } else {
            tasks.forEach(task => this.selectedTasks.add(task.id));
        }
        
        this.refreshView();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.querySelector('.selection-count');
        
        if (bulkActions) {
            bulkActions.classList.toggle('visible', this.selectedTasks.size > 0);
        }
        
        if (selectedCount) {
            selectedCount.textContent = this.selectedTasks.size;
        }
        
        // Mettre à jour le texte du bouton select all
        const filteredTasks = window.taskManager.filterTasks(this.currentFilters);
        const allSelected = filteredTasks.length > 0 && 
            filteredTasks.every(task => this.selectedTasks.has(task.id));
        
        const selectAllBtn = document.querySelector('#bulkActions .btn-secondary span');
        if (selectAllBtn) {
            selectAllBtn.textContent = allSelected ? 'Tout désélectionner' : 'Tout sélectionner';
        }
        
        // Mettre à jour les checkboxes
        document.querySelectorAll('.task-item').forEach(item => {
            const taskId = item.dataset.taskId;
            const isSelected = this.selectedTasks.has(taskId);
            item.classList.toggle('selected', isSelected);
            
            const checkbox = item.querySelector('.task-select .custom-checkbox');
            if (checkbox) {
                checkbox.classList.toggle('checked', isSelected);
                checkbox.innerHTML = isSelected ? '<i class="fas fa-check"></i>' : '';
            }
        });
    }

    deleteSelected() {
        const count = this.selectedTasks.size;
        if (count === 0) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${count} tâche(s) ?`)) {
            window.taskManager.deleteTasks(Array.from(this.selectedTasks));
            this.selectedTasks.clear();
            this.updateBulkActions();
        }
    }

    toggleTaskStatus(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
        window.taskManager.updateTask(taskId, { status: newStatus });
    }

    deleteTask(taskId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            window.taskManager.deleteTask(taskId);
            this.selectedTasks.delete(taskId);
            this.updateBulkActions();
        }
    }

closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }
}

    // Filtres et dropdowns
    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;
        
        const isOpen = dropdown.classList.contains('open');
        
        // Fermer tous les dropdowns
        document.querySelectorAll('.filter-dropdown').forEach(dd => {
            dd.classList.remove('open');
        });
        
        // Ouvrir/fermer le dropdown actuel
        if (!isOpen) {
            dropdown.classList.add('open');
        }
    }
    
    toggleFilters() {
        const container = document.getElementById('filtersContainer');
        if (container) {
            container.classList.toggle('collapsed');
        }
    }

    setFilter(filterType, value) {
        // Réinitialiser certains filtres si nécessaire
        if (filterType === 'status' || filterType === 'priority' || filterType === 'sender') {
            this.currentFilters.overdue = false;
            this.currentFilters.needsReply = false;
        }
        
        this.currentFilters[filterType] = value;
        
        // Fermer le dropdown
        document.querySelectorAll('.filter-dropdown').forEach(dd => {
            dd.classList.remove('open');
        });
        
        this.refreshView();
    }

    setSort(sortBy) {
        this.currentFilters.sortBy = sortBy;
        
        // Fermer le dropdown
        document.getElementById('sortDropdown')?.classList.remove('open');
        
        this.refreshView();
    }

    resetFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            sender: 'all',
            search: '',
            sortBy: 'priority',
            overdue: false,
            needsReply: false,
            dateFilter: 'all',
            tag: 'all'
        };
        
        // Réinitialiser le champ de recherche
        const searchInput = document.getElementById('filter-search');
        if (searchInput) searchInput.value = '';
        
        this.refreshView();
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('filter-search');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    refreshView() {
        const listContainer = document.getElementById('tasksListContainer');
        if (listContainer) {
            listContainer.innerHTML = this.renderTasksList();
        }
        
        // Mettre à jour les stats
        const pageHeader = document.querySelector('.page-header');
        if (pageHeader) {
            const statsHtml = this.renderStats();
            const existingStats = document.querySelector('.stats-grid');
            if (existingStats) {
                existingStats.outerHTML = statsHtml;
            }
        }
        
        // Mettre à jour les bulk actions
        const bulkActionsContainer = document.getElementById('bulkActions');
        if (bulkActionsContainer) {
            bulkActionsContainer.outerHTML = this.renderBulkActions();
        }
        
        this.updateBulkActions();
    }

    attachEventListeners() {
        // Recherche
        const searchInput = document.getElementById('filter-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    const searchClearBtn = document.getElementById('searchClearBtn');
                    if (searchClearBtn) {
                        searchClearBtn.style.display = e.target.value ? 'flex' : 'none';
                    }
                    this.refreshView();
                }, 300);
            });
        }
        
        // Fermer les dropdowns en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) {
                document.querySelectorAll('.filter-dropdown.open').forEach(dd => {
                    dd.classList.remove('open');
                });
            }
        });
    }

    // Méthodes utilitaires
    generateDefaultReplies(task) {
        const sender = task.emailFromName || 'l\'expéditeur';
        return [
            {
                tone: 'neutre',
                subject: `Re: ${task.emailSubject || 'Votre message'}`,
                content: `Bonjour ${sender},\n\nJ'ai bien reçu votre message et je vous en remercie.\n\nJe vais examiner votre demande et vous apporter une réponse dans les meilleurs délais.\n\nCordialement,`
            },
            {
                tone: 'formel',
                subject: `Re: ${task.emailSubject || 'Votre message'} - Confirmation`,
                content: `Bonjour ${sender},\n\nJe vous remercie pour votre message concernant "${task.emailSubject || 'votre demande'}".\n\nJe prends connaissance de votre demande et reviendrai vers vous prochainement avec les éléments demandés.\n\nJe vous prie d'agréer mes salutations distinguées.`
            },
            {
                tone: 'amical',
                subject: `Re: ${task.emailSubject || 'Votre message'}`,
                content: `Bonjour ${sender},\n\nMerci pour votre message !\n\nJe vais regarder ça de près et je reviens vers vous rapidement.\n\nBonne journée,`
            }
        ];
    }

    getFilterLabel(filterType, value) {
        const labels = {
            status: {
                all: 'Tous les statuts',
                todo: 'À faire',
                'in-progress': 'En cours',
                completed: 'Terminées'
            },
            priority: {
                all: 'Toutes priorités',
                urgent: '🚨 Urgent',
                high: '⚡ Haute',
                medium: '📌 Normale',
                low: '📄 Basse'
            },
            sortBy: {
                priority: 'Priorité',
                dueDate: 'Échéance',
                created: 'Date de création',
                updated: 'Dernière modification',
                alphabetical: 'Alphabétique'
            },
            dateFilter: {
                all: 'Toutes les dates',
                today: 'Aujourd\'hui',
                week: 'Cette semaine',
                month: 'Ce mois',
                overdue: 'En retard'
            },
            tag: {
                all: 'Tous les tags'
            }
        };
        
        if (filterType === 'sender') {
            if (value === 'all') return 'Tous les expéditeurs';
            const senders = window.taskManager.getSenders();
            const sender = senders.find(s => s.email === value);
            return sender ? sender.name : 'Tous les expéditeurs';
        }
        
        if (filterType === 'tag' && value !== 'all') {
            return value;
        }
        
        return labels[filterType]?.[value] || value;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDescription(text) {
        if (!text) return '';
        
        // Préserver les sauts de ligne et formater
        const escaped = this.escapeHtml(text);
        
        // Traiter les URLs comme des liens
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const withLinks = escaped.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
        
        // Conserver les sauts de ligne
        return `<div class="formatted-text">${withLinks.replace(/\n/g, '<br>')}</div>`;
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();
        
        if (isToday) {
            return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (isYesterday) {
            return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    extractSummaryFromDescription(description) {
        if (!description) return '';
        
        // Chercher la section résumé dans la description
        const summaryMatch = description.match(/📧 RÉSUMÉ EXÉCUTIF\n━+\n([\s\S]*?)(?=\n\n|$)/);
        if (summaryMatch) {
            return summaryMatch[1].trim();
        }
        
        // Sinon, prendre les premières lignes
        const lines = description.split('\n').filter(line => line.trim());
        return lines.slice(0, 3).join('\n');
    }

    formatSummary(summary) {
        if (!summary) return '<p class="text-muted">Aucun résumé</p>';
        
        // Traiter les sauts de ligne et les emojis
        return summary.split('\n').map(line => {
            if (line.includes('🚨')) {
                return `<p class="urgent-text">${this.escapeHtml(line)}</p>`;
            } else if (line.includes('📮')) {
                return `<p class="response-expected">${this.escapeHtml(line)}</p>`;
            } else {
                return `<p>${this.escapeHtml(line)}</p>`;
            }
        }).join('');
    }

    getPriorityLabel(priority) {
        const labels = {
            urgent: '🚨 Urgent',
            high: '⚡ Haute',
            medium: '📌 Normale',
            low: '📄 Basse'
        };
        return labels[priority] || '📌 Normale';
    }

    getStatusLabel(status) {
        const labels = {
            'todo': 'À faire',
            'in-progress': 'En cours',
            'completed': 'Terminée'
        };
        return labels[status] || status;
    }

    getReplyToneIcon(tone) {
        const icons = {
            formel: '👔',
            informel: '😊',
            urgent: '🚨',
            neutre: '📝',
            amical: '🤝'
        };
        return icons[tone] || '📝';
    }

    getReplyToneLabel(tone) {
        const labels = {
            formel: 'Formel',
            informel: 'Informel',
            urgent: 'Urgent',
            neutre: 'Neutre',
            amical: 'Amical'
        };
        return labels[tone] || 'Neutre';
    }

    // Styles
    addStyles() {
        if (document.getElementById('tasksViewStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'tasksViewStyles';
        styles.textContent = `
            /* Variables CSS */
            :root {
                --primary: #667eea;
                --primary-dark: #5a67d8;
                --primary-light: #7c3aed;
                --secondary: #64748b;
                --success: #10b981;
                --danger: #ef4444;
                --warning: #f59e0b;
                --info: #3b82f6;
                --dark: #1e293b;
                --light: #f8fafc;
                --gray-50: #f9fafb;
                --gray-100: #f3f4f6;
                --gray-200: #e5e7eb;
                --gray-300: #d1d5db;
                --gray-400: #9ca3af;
                --gray-500: #6b7280;
                --gray-600: #4b5563;
                --gray-700: #374151;
                --gray-800: #1f2937;
                --gray-900: #111827;
            }
            
            /* Tasks Page Styles */
            .tasks-page {
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            /* Header */
            .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                flex-wrap: wrap;
                gap: 16px;
            }
            
            .page-title {
                font-size: 32px;
                font-weight: 800;
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin: 0;
            }
            
            /* Stats Grid - Ligne unique */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 12px;
                margin-bottom: 24px;
            }
            
            .stat-card {
                background: white;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 2px solid transparent;
                position: relative;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--accent-color, var(--primary));
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                border-color: var(--accent-color, var(--primary));
            }
            
            .stat-card:hover::before {
                opacity: 1;
            }
            
            .stat-icon {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                background: var(--accent-color, var(--primary));
                background: linear-gradient(135deg, var(--accent-color, var(--primary)), var(--accent-color, var(--primary)));
                opacity: 0.1;
                color: var(--accent-color, var(--primary));
                font-size: 16px;
            }
            
            .stat-card:hover .stat-icon {
                opacity: 0.2;
            }
            
            .stat-content {
                flex: 1;
                min-width: 0;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: 700;
                line-height: 1;
                color: var(--gray-900);
            }
            
            .stat-label {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: var(--gray-500);
                margin-top: 2px;
            }
            
            /* Section des filtres */
            .filters-section {
                margin-bottom: 12px;
            }
            
            .filters-row {
                background: white;
                border-radius: 12px;
                padding: 12px 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .inline-search {
                flex: 0 1 200px;
                min-width: 150px;
            }
            
            .inline-search .search-input {
                padding: 8px 36px;
                font-size: 13px;
                height: 36px;
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
                font-size: 14px;
                pointer-events: none;
            }
            
            .search-clear {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--gray-200);
                border: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 10px;
                color: var(--gray-600);
                transition: all 0.2s ease;
            }
            
            .inline-filters {
                display: flex;
                gap: 6px;
                align-items: center;
                flex: 1;
                flex-wrap: wrap;
            }
            
            .filter-dropdown {
                position: relative;
            }
            
            .filter-dropdown.compact .filter-button {
                padding: 8px 10px;
                font-size: 12px;
                min-width: 0;
                height: 36px;
                border: 1px solid var(--gray-200);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .filter-dropdown.compact .filter-button > i:first-child {
                font-size: 12px;
                margin-right: 2px;
            }
            
            .filter-dropdown.compact .filter-button > span {
                max-width: 90px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .filter-dropdown.compact .filter-button > i:last-child {
                font-size: 10px;
                margin-left: 2px;
            }
            
            .filter-dropdown.has-filter .filter-button {
                background: linear-gradient(135deg, var(--primary), var(--primary-light));
                color: white;
                border-color: var(--primary);
            }
            
            .filter-dropdown.has-filter .filter-button i {
                color: white !important;
            }
            
            .reset-btn {
                padding: 8px 12px;
                height: 36px;
                font-size: 12px;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
                margin-left: auto;
            }
            
            .reset-btn.visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            /* Dropdown menu */
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                margin-top: 6px;
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                opacity: 0;
                transform: translateY(-10px);
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
                min-width: 180px;
                width: max-content;
            }
            
            /* Filters container (for advanced filters) */
            .filters-container {
                display: none;
            }
            
            .filter-search {
                width: 100%;
            }
            
            .search-wrapper {
                position: relative;
            }
            
            .search-input {
                width: 100%;
                padding: 10px 44px;
                border: 2px solid var(--gray-200);
                border-radius: 10px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: var(--gray-50);
            }
            
            .search-input:focus {
                outline: none;
                border-color: var(--primary);
                background: white;
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            }
            
            .search-icon {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
                font-size: 16px;
                pointer-events: none;
            }
            
            .search-clear {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--gray-200);
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 12px;
                color: var(--gray-600);
                transition: all 0.2s ease;
            }
            
            .search-clear:hover {
                background: var(--gray-300);
                color: var(--gray-700);
            }
            
            .filter-dropdowns {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 10px;
            }
            
            /* Dropdowns modernes */
            .filter-dropdown {
                position: relative;
            }
            
            .filter-dropdown.has-filter .filter-button {
                background: linear-gradient(135deg, var(--primary), var(--primary-light));
                color: white;
                border-color: var(--primary);
            }
            
            .filter-dropdown.has-filter .filter-button i {
                color: white !important;
            }
            
            .filter-button {
                width: 100%;
                padding: 9px 14px;
                border: 2px solid var(--gray-200);
                border-radius: 10px;
                background: var(--gray-50);
                font-size: 13px;
                font-weight: 500;
                color: var(--gray-700);
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
                white-space: nowrap;
                overflow: hidden;
            }
            
            .filter-button > i:first-child {
                margin-right: 4px;
                color: var(--gray-500);
                flex-shrink: 0;
            }
            
            .filter-button > span {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .filter-button.sort-button {
                background: linear-gradient(135deg, var(--gray-50), var(--gray-100));
                border-color: var(--gray-300);
            }
            
            .filter-button:hover {
                border-color: var(--gray-300);
                background: white;
            }
            
            .filter-dropdown.has-filter .filter-button:hover {
                background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            }
            
            .filter-button i:last-child {
                font-size: 12px;
                transition: transform 0.3s ease;
                flex-shrink: 0;
            }
            
            .filter-dropdown.open .filter-button {
                border-color: var(--primary);
                background: white;
                color: var(--primary);
            }
            
            .filter-dropdown.has-filter.open .filter-button {
                background: white;
                color: var(--primary);
            }
            
            .filter-dropdown.open .filter-button i {
                color: var(--primary) !important;
            }
            
            .filter-dropdown.open .filter-button i:last-child {
                transform: rotate(180deg);
            }
            
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                margin-top: 8px;
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                opacity: 0;
                transform: translateY(-10px);
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
                min-width: 200px;
            }
            
            .dropdown-menu-large {
                max-height: 400px;
            }
            
            .filter-dropdown.open .dropdown-menu {
                opacity: 1;
                transform: translateY(0);
                visibility: visible;
            }
            
            .dropdown-item {
                padding: 10px 16px;
                cursor: pointer;
                transition: background 0.2s ease;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .dropdown-item > i:nth-child(2) {
                color: var(--gray-500);
            }
            
            .dropdown-item:hover {
                background: var(--gray-50);
            }
            
            .dropdown-item.active {
                background: var(--primary);
                color: white;
            }
            
            .dropdown-item.active > i {
                color: white !important;
            }
            
            .dropdown-item .check-icon {
                font-size: 12px;
                opacity: 0;
                width: 16px;
                flex-shrink: 0;
            }
            
            .dropdown-item.active .check-icon {
                opacity: 1;
            }
            
            .dropdown-divider {
                height: 1px;
                background: var(--gray-200);
                margin: 8px 0;
            }
            
            .dropdown-section-title {
                font-size: 12px;
                font-weight: 600;
                color: var(--gray-500);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 8px 16px;
                background: var(--gray-50);
            }
            
            /* Sender items */
            .sender-item {
                padding: 8px 16px;
            }
            
            .sender-avatar {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .sender-info {
                flex: 1;
                min-width: 0;
                margin-left: 4px;
            }
            
            .sender-name {
                font-size: 13px;
                font-weight: 500;
                color: var(--gray-800);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .sender-email {
                font-size: 11px;
                color: var(--gray-500);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .sender-count {
                font-size: 11px;
                background: var(--gray-100);
                color: var(--gray-600);
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: 600;
                margin-left: auto;
            }
            
            .dropdown-item.active .sender-count {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            
            /* Actions groupées */
            .bulk-actions {
                background: white;
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(-10px);
                visibility: hidden;
                height: 0;
                margin-bottom: 0;
                padding: 0 16px;
            }
            
            .bulk-actions.visible {
                opacity: 1;
                transform: translateY(0);
                visibility: visible;
                height: auto;
                padding: 12px 16px;
                margin-bottom: 12px;
            }
            
            .bulk-info {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: var(--gray-700);
            }
            
            .selection-count {
                font-weight: 700;
                color: var(--primary);
                font-size: 16px;
            }
            
            .bulk-buttons {
                display: flex;
                gap: 8px;
            }
            
            /* Boutons modernes */
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                white-space: nowrap;
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .btn-primary:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            
            .btn-secondary {
                background: white;
                color: var(--gray-700);
                border: 1px solid var(--gray-200);
            }
            
            .btn-secondary:hover:not(:disabled) {
                background: var(--gray-50);
                border-color: var(--gray-300);
            }
            
            .btn-danger {
                background: var(--danger);
                color: white;
            }
            
            .btn-danger:hover:not(:disabled) {
                background: #dc2626;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            }
            
            .btn-sm {
                padding: 6px 12px;
                font-size: 13px;
            }
            
            /* Liste des tâches */
            .tasks-list-container {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .tasks-list {
                display: flex;
                flex-direction: column;
            }
            
            .task-item {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid var(--gray-100);
                transition: all 0.2s ease;
                cursor: pointer;
                position: relative;
            }
            
            .task-item:last-child {
                border-bottom: none;
            }
            
            .task-item:hover {
                background: var(--gray-50);
            }
            
            .task-item.selected {
                background: rgba(102, 126, 234, 0.05);
            }
            
            .task-item.completed {
                opacity: 0.6;
            }
            
            .task-item.completed .task-title {
                text-decoration: line-through;
            }
            
            .task-item.overdue {
                border-left: 3px solid var(--danger);
            }
            
            .task-checkbox, .task-select {
                margin-right: 12px;
            }
            
            .custom-checkbox {
                width: 20px;
                height: 20px;
                border: 2px solid var(--gray-300);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
            }
            
            .custom-checkbox:hover {
                border-color: var(--primary);
            }
            
            .custom-checkbox.checked {
                background: var(--primary);
                border-color: var(--primary);
            }
            
            .custom-checkbox.checked i {
                color: white;
                font-size: 12px;
            }
            
            .task-content {
                flex: 1;
                min-width: 0;
                padding-right: 16px;
            }
            
            .task-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 4px;
            }
            
            .task-title {
                font-weight: 600;
                color: var(--gray-900);
                margin: 0;
                font-size: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
                margin-right: 12px;
            }
            
            .task-badges {
                display: flex;
                gap: 6px;
                align-items: center;
                flex-shrink: 0;
            }
            
            .priority-badge {
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
            }
            
            .priority-badge.urgent {
                background: rgba(239, 68, 68, 0.1);
                color: var(--danger);
            }
            
            .priority-badge.high {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning);
            }
            
            .priority-badge.medium {
                background: rgba(59, 130, 246, 0.1);
                color: var(--info);
            }
            
            .priority-badge.low {
                background: var(--gray-100);
                color: var(--gray-600);
            }
            
            .email-badge, .ai-badge, .reply-badge {
                font-size: 14px;
                color: var(--gray-600);
            }
            
            .email-badge {
                color: var(--info);
            }
            
            .ai-badge {
                color: #8b5cf6;
            }
            
            .reply-badge {
                color: var(--warning);
            }
            
            .task-description {
                color: var(--gray-600);
                font-size: 14px;
                margin: 4px 0;
                line-height: 1.4;
            }
            
            .task-meta {
                display: flex;
                gap: 16px;
                font-size: 13px;
                color: var(--gray-500);
                margin-top: 8px;
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .meta-item.overdue {
                color: var(--danger);
                font-weight: 500;
            }
            
            .task-actions {
                display: flex;
                gap: 8px;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .task-item:hover .task-actions {
                opacity: 1;
            }
            
            .action-btn {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
            }
            
            .action-btn:hover {
                transform: scale(1.05);
            }
            
            .action-btn.primary {
                background: var(--info);
                color: white;
            }
            
            .action-btn.primary:hover {
                background: #2563eb;
            }
            
            .action-btn.danger {
                background: var(--danger);
                color: white;
            }
            
            .action-btn.danger:hover {
                background: #dc2626;
            }
            
            /* Empty State */
            .empty-state {
                text-align: center;
                padding: 80px 20px;
            }
            
            .empty-state-icon {
                font-size: 64px;
                color: var(--gray-300);
                margin-bottom: 24px;
            }
            
            .empty-state-title {
                font-size: 24px;
                font-weight: 700;
                color: var(--gray-800);
                margin-bottom: 8px;
            }
            
            .empty-state-text {
                font-size: 16px;
                color: var(--gray-500);
                margin-bottom: 24px;
            }
            
            /* Modal moderne - Z-index ultra élevé pour éviter les conflits */
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
                z-index: 999999;
                backdrop-filter: blur(4px);
                animation: fadeIn 0.3s ease;
                padding: 20px;
                overflow-y: auto;
            }
            
            /* Encore plus élevé pour les modaux de tâches */
            .modal-overlay-task {
                z-index: 9999999;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            .modal-container {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                animation: slideUp 0.3s ease;
                position: relative;
                margin: auto;
            }
            
            .modal-xlarge {
                max-width: 1000px;
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
                padding: 24px;
                border-bottom: 1px solid var(--gray-100);
                flex-shrink: 0;
                position: relative;
            }
            
            .modal-header.gradient-header {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                color: white;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                padding-right: 60px;
            }
            
            .modal-header.gradient-header h2 {
                color: white;
            }
            
            .modal-close {
                position: absolute;
                top: 24px;
                right: 24px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                color: white;
                z-index: 10;
            }
            
            .modal-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 24px;
                border-top: 1px solid var(--gray-100);
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                flex-shrink: 0;
            }
            
            /* Modal titre éditable */
            .modal-title-input {
                width: 100%;
                font-size: 20px;
                font-weight: 600;
                padding: 8px 12px;
                border: 1px solid var(--gray-300);
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.9);
                color: var(--gray-900);
            }
            
            .modal-title-input:focus {
                outline: none;
                border-color: white;
                background: white;
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
            }
            
            /* Task detail view */
            .unified-task-view {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .task-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: var(--gray-50);
                border-radius: 8px;
                border: 1px solid var(--gray-200);
                flex-wrap: wrap;
                gap: 12px;
            }
            
            .toolbar-left, .toolbar-right {
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .status-badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 13px;
                font-weight: 600;
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
            
            .replied-badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 13px;
                background: #d1fae5;
                color: #065f46;
            }
            
            /* Content Sections */
            .content-section {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 8px;
                overflow: hidden;
            }
            
            .content-section h3 {
                padding: 12px 16px;
                margin: 0;
                background: var(--gray-50);
                border-bottom: 1px solid var(--gray-200);
                font-size: 16px;
                font-weight: 600;
                color: var(--gray-800);
            }
            
            .section-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: var(--gray-50);
                border-bottom: 1px solid var(--gray-200);
            }
            
            .section-header i {
                font-size: 16px;
                color: var(--gray-600);
            }
            
            .section-header h4 {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                color: var(--gray-800);
            }
            
            .section-content {
                padding: 16px;
            }
            
            .section-text {
                font-size: 14px;
                line-height: 1.6;
                color: var(--gray-700);
            }
            
            .section-textarea {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid var(--gray-300);
                border-radius: 6px;
                font-size: 14px;
                line-height: 1.5;
                resize: vertical;
                min-height: 60px;
            }
            
            .section-textarea:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .urgent-text {
                color: var(--danger);
                font-weight: 500;
            }
            
            .response-expected {
                color: var(--info);
            }
            
            /* Actions List */
            .actions-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .action-item {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .action-number {
                width: 24px;
                height: 24px;
                background: var(--primary);
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
                color: var(--gray-700);
            }
            
            .action-deadline {
                font-size: 12px;
                color: var(--danger);
                font-weight: 500;
                white-space: nowrap;
            }
            
            .action-item-edit {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
            }
            
            .action-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid var(--gray-300);
                border-radius: 6px;
                font-size: 13px;
            }
            
            .action-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            /* Info Grid */
            .info-grid {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .info-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 13px;
                color: var(--gray-700);
                line-height: 1.4;
            }
            
            .info-item i {
                font-size: 10px;
                color: var(--gray-400);
                margin-top: 4px;
            }
            
            /* Attention Section */
            .attention-section {
                background: #fef3c7;
                border-color: #fbbf24;
            }
            
            .attention-section .section-header {
                background: #fef9e8;
                border-bottom-color: #fbbf24;
            }
            
            .attention-section .section-header i {
                color: var(--warning);
            }
            
            .attention-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .attention-item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 6px;
                padding: 10px 12px;
            }
            
            .attention-item i {
                font-size: 14px;
                color: var(--warning);
                margin-top: 2px;
            }
            
            .attention-item span {
                flex: 1;
                font-size: 13px;
                color: #92400e;
                line-height: 1.4;
            }
            
            /* Email Section */
            .email-section {
                background: #f0f9ff;
                border-color: #7dd3fc;
            }
            
            .email-section h3 {
                background: #e0f2fe;
                border-bottom-color: #7dd3fc;
                color: #075985;
            }
            
            .email-header-info {
                background: white;
                border: 1px solid #bae6fd;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 16px;
            }
            
            .email-field {
                font-size: 13px;
                color: var(--gray-700);
                margin-bottom: 4px;
            }
            
            .email-field:last-child {
                margin-bottom: 0;
            }
            
            .email-address {
                color: var(--gray-600);
            }
            
            .email-content-container {
                border: 1px solid #bae6fd;
                border-radius: 6px;
                overflow: hidden;
                background: white;
            }
            
            .email-content-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 16px;
                background: #f0f9ff;
                border-bottom: 1px solid #bae6fd;
            }
            
            .email-content-header h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: #075985;
            }
            
            .email-type-badge {
                font-size: 11px;
                padding: 2px 8px;
                background: #dbeafe;
                color: #1e40af;
                border-radius: 12px;
                font-weight: 600;
            }
            
            .email-content-box {
                padding: 16px;
                max-height: 600px;
                overflow-y: auto;
                position: relative;
                background: white;
            }
            
            .email-content-box.text-content {
                font-family: 'Courier New', monospace;
                white-space: pre-wrap;
            }
            
            .email-content-box.html-content {
                background: #fafafa;
            }
            
            .email-content-box::-webkit-scrollbar {
                width: 8px;
            }
            
            .email-content-box::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
            }
            
            .email-content-box::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 4px;
            }
            
            .email-content-box::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
            
            .formatted-content {
                font-size: 14px;
                line-height: 1.6;
                color: var(--gray-700);
                word-wrap: break-word;
            }
            
            .email-html-container {
                position: relative;
                overflow: visible;
                background: white;
                min-height: 200px;
            }
            
            .email-html-content {
                padding: 0;
                font-size: 14px;
                line-height: 1.6;
                color: var(--gray-700);
                overflow-x: auto;
                max-width: 100%;
            }
            
            .email-html-content * {
                max-width: 100% !important;
                height: auto !important;
            }
            
            .email-html-content img {
                max-width: 100% !important;
                height: auto !important;
                display: block;
                margin: 10px 0;
            }
            
            .email-html-content table {
                max-width: 100% !important;
                width: auto !important;
                border-collapse: collapse;
                margin: 10px 0;
            }
            
            .email-html-content td,
            .email-html-content th {
                padding: 4px 8px;
                border: 1px solid var(--gray-200);
            }
            
            /* Metadata Section */
            .metadata-section h3 {
                background: var(--gray-50);
                border-bottom: 1px solid var(--gray-200);
            }
            
            .metadata-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            
            .metadata-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .metadata-item label {
                font-size: 12px;
                font-weight: 600;
                color: var(--gray-600);
                text-transform: uppercase;
            }
            
            .metadata-value {
                font-size: 14px;
                color: var(--gray-800);
            }
            
            .tag {
                display: inline-block;
                padding: 2px 8px;
                background: var(--gray-200);
                color: var(--gray-700);
                border-radius: 12px;
                font-size: 12px;
                margin-right: 4px;
            }
            
            .edit-selectors {
                display: flex;
                gap: 16px;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid var(--gray-200);
            }
            
            .selector-item {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .selector-item label {
                font-size: 12px;
                font-weight: 600;
                color: var(--gray-600);
                text-transform: uppercase;
            }
            
            /* History Section */
            .history-section {
                background: var(--gray-50);
            }
            
            .history-items {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .history-item {
                display: flex;
                justify-content: space-between;
                font-size: 13px;
                color: var(--gray-600);
            }
            
            .history-item strong {
                font-weight: 600;
            }
            
            /* AI Section */
            .ai-section {
                background: #f3f4f6;
                border-color: var(--gray-400);
            }
            
            .ai-section h3 {
                background: #e5e7eb;
                border-bottom-color: var(--gray-400);
                color: var(--gray-600);
            }
            
            .ai-block {
                margin-bottom: 16px;
            }
            
            .ai-block:last-child {
                margin-bottom: 0;
            }
            
            .ai-block h4 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--gray-700);
            }
            
            .ai-block p {
                margin: 0;
                font-size: 13px;
                color: var(--gray-600);
                line-height: 1.5;
            }
            
            .action-list, .info-list {
                margin: 0;
                padding-left: 20px;
                font-size: 13px;
                color: var(--gray-600);
            }
            
            .action-list li, .info-list li {
                margin-bottom: 4px;
            }
            
            .ai-metadata {
                display: flex;
                gap: 16px;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid var(--gray-300);
                font-size: 12px;
                color: var(--gray-500);
            }
            
            /* Reply Section */
            .reply-section-integrated {
                margin-top: 20px;
                padding: 16px;
                background: #f0f9ff;
                border: 1px solid #7dd3fc;
                border-radius: 8px;
            }
            
            .reply-wrapper h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                color: #075985;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .inline-suggestions {
                margin-bottom: 16px;
            }
            
            .inline-suggestions label {
                display: block;
                margin-bottom: 8px;
                font-size: 13px;
                font-weight: 600;
                color: var(--gray-700);
            }
            
            .suggestion-pills {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .suggestion-pill {
                padding: 6px 12px;
                border: 1px solid var(--gray-300);
                border-radius: 20px;
                background: white;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .suggestion-pill:hover {
                background: var(--gray-50);
                border-color: var(--gray-400);
            }
            
            .compact-reply-form {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .reply-fields {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .field-row {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .field-row label {
                width: 60px;
                font-size: 13px;
                font-weight: 600;
                color: var(--gray-700);
            }
            
            .field-row .form-input {
                flex: 1;
            }
            
            .reply-content-area {
                margin-top: 8px;
            }
            
            .reply-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 12px;
            }
            
            /* Sender Context */
            .sender-context-box {
                display: flex;
                align-items: center;
                gap: 12px;
                background: var(--gray-100);
                border: 1px solid var(--gray-200);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 20px;
            }
            
            .sender-avatar-small {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, var(--primary), var(--primary-light));
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: 600;
            }
            
            .sender-details {
                flex: 1;
            }
            
            .sender-name-bold {
                font-weight: 700;
                color: var(--gray-800);
                font-size: 16px;
            }
            
            .sender-email-small {
                font-size: 13px;
                color: var(--gray-600);
            }
            
            .sender-domain {
                font-size: 12px;
                color: var(--gray-500);
                font-weight: 500;
            }
            
            /* Formulaires */
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: var(--gray-700);
                margin-bottom: 8px;
            }
            
            .form-input,
            .form-select,
            .form-textarea {
                width: 100%;
                padding: 10px 16px;
                border: 2px solid var(--gray-200);
                border-radius: 10px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: white;
            }
            
            .form-input:focus,
            .form-select:focus,
            .form-textarea:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            }
            
            .form-textarea {
                resize: vertical;
                min-height: 100px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            .required {
                color: var(--danger);
            }
            
            /* Loading */
            .loading-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--gray-200);
                border-radius: 50%;
                border-top-color: var(--primary);
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Responsive */
            @media (max-width: 1400px) {
                .inline-filters {
                    gap: 4px;
                }
                
                .filter-dropdown.compact .filter-button {
                    padding: 8px;
                    font-size: 11px;
                }
                
                .filter-dropdown.compact .filter-button > span {
                    max-width: 70px;
                }
                
                .filter-dropdown.compact .filter-button > i:first-child {
                    font-size: 11px;
                }
            }
            
            @media (max-width: 1200px) {
                .filters-row {
                    padding: 10px 12px;
                    gap: 8px;
                }
                
                .inline-search {
                    flex: 0 1 180px;
                }
                
                .filter-dropdown.compact .filter-button > span {
                    max-width: 60px;
                }
            }
            
            @media (max-width: 992px) {
                .filters-row {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 10px;
                }
                
                .inline-search {
                    width: 100%;
                    max-width: 100%;
                    flex: 1;
                }
                
                .inline-filters {
                    width: 100%;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 6px;
                }
                
                .filter-dropdown.compact .filter-button {
                    width: 100%;
                    justify-content: space-between;
                }
                
                .filter-dropdown.compact .filter-button > span {
                    max-width: none;
                }
                
                .reset-btn {
                    grid-column: 1 / -1;
                    width: 100%;
                    margin-left: 0;
                }
            }
            
            @media (max-width: 768px) {
                .tasks-page {
                    padding: 12px;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
                
                .stat-card {
                    padding: 12px;
                }
                
                .stat-value {
                    font-size: 20px;
                }
                
                .stat-label {
                    font-size: 10px;
                }
                
                .inline-filters {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .bulk-actions {
                    flex-direction: column;
                    align-items: stretch;
                    padding: 10px 12px;
                }
                
                .bulk-buttons {
                    width: 100%;
                    justify-content: stretch;
                }
                
                .bulk-buttons .btn {
                    flex: 1;
                }
                
                .task-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                
                .task-badges {
                    margin-top: 4px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .modal-container {
                    width: 95%;
                    margin: 10px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION
// =====================================

// Create global instances
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

console.log('✅ TaskManager v6.0 loaded - Interface moderne avec filtres avancés et corrections z-index');