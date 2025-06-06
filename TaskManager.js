// TaskManager Pro v8.3 - CORRIGÉ avec contenu email complet et sections structurées

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
            console.log('[TaskManager] Initializing v8.3 - CORRIGÉ avec contenu email complet...');
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
                method: 'ai'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    // MÉTHODE PRINCIPALE POUR CRÉER UNE TÂCHE À PARTIR D'UN EMAIL - CORRIGÉE
    createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email with full content:', taskData.title);
        
        // Assurer un ID unique
        const taskId = taskData.id || this.generateId();
        
        // EXTRAIRE LE CONTENU COMPLET DE L'EMAIL
        const fullEmailContent = this.extractFullEmailContent(email, taskData);
        
        // Construire la tâche complète avec toutes les données email
        const task = {
            id: taskId,
            title: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'todo',
            dueDate: taskData.dueDate || null,
            category: taskData.category || 'email',
            
            // DONNÉES EMAIL COMPLÈTES AVEC CONTENU
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || (email?.from?.emailAddress?.address),
            emailFromName: taskData.emailFromName || (email?.from?.emailAddress?.name),
            emailSubject: taskData.emailSubject || email?.subject,
            emailContent: fullEmailContent, // CONTENU COMPLET
            emailDomain: taskData.emailDomain || (taskData.emailFrom ? taskData.emailFrom.split('@')[1] : ''),
            hasEmail: true,
            emailReplied: false,
            emailDate: taskData.emailDate || email?.receivedDateTime,
            needsReply: taskData.needsReply || false,
            hasAttachments: email?.hasAttachments || false,
            
            // DONNÉES STRUCTURÉES DE L'IA - COMPLÈTES
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            aiAnalysis: taskData.aiAnalysis || null,
            
            // MÉTADONNÉES
            tags: taskData.tags || [],
            client: taskData.client || 'Externe',
            
            // TIMESTAMPS
            createdAt: taskData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            method: taskData.method || 'ai'
        };
        
        // Ajouter la tâche
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        console.log('[TaskManager] Task created successfully with full content:', {
            id: task.id,
            hasEmailContent: !!task.emailContent,
            contentLength: task.emailContent?.length || 0,
            hasActions: task.actions?.length || 0,
            hasKeyInfo: task.keyInfo?.length || 0,
            hasRisks: task.risks?.length || 0
        });
        
        return task;
    }

    // NOUVELLE MÉTHODE POUR EXTRAIRE LE CONTENU COMPLET DE L'EMAIL
    extractFullEmailContent(email, taskData) {
        console.log('[TaskManager] Extracting full email content...');
        
        // Priorité 1: Contenu passé directement dans taskData
        if (taskData.emailContent && taskData.emailContent.length > 50) {
            console.log('[TaskManager] Using email content from taskData');
            return taskData.emailContent;
        }
        
        // Priorité 2: Contenu complet de l'email
        if (email?.body?.content) {
            console.log('[TaskManager] Using email body content');
            return this.cleanEmailContent(email.body.content);
        }
        
        // Priorité 3: Contenu HTML de l'email (si disponible)
        if (email?.body?.type === 'html' && email?.body?.content) {
            console.log('[TaskManager] Using HTML email content');
            return this.convertHtmlToText(email.body.content);
        }
        
        // Priorité 4: Preview de l'email étendu
        if (email?.bodyPreview && email.bodyPreview.length > 20) {
            console.log('[TaskManager] Using extended email preview');
            return this.buildExtendedPreview(email);
        }
        
        // Priorité 5: Construire un contenu minimal mais complet
        console.log('[TaskManager] Building minimal email content');
        return this.buildMinimalEmailContent(email, taskData);
    }

    cleanEmailContent(content) {
        if (!content) return '';
        
        // Nettoyer le contenu HTML et garder seulement le texte
        const cleanContent = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprimer scripts
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Supprimer styles
            .replace(/<[^>]*>/g, ' ') // Supprimer toutes les balises HTML
            .replace(/&nbsp;/g, ' ') // Remplacer &nbsp;
            .replace(/&amp;/g, '&') // Remplacer &amp;
            .replace(/&lt;/g, '<') // Remplacer &lt;
            .replace(/&gt;/g, '>') // Remplacer &gt;
            .replace(/&quot;/g, '"') // Remplacer &quot;
            .replace(/\s+/g, ' ') // Normaliser les espaces
            .trim();
            
        return cleanContent.length > 100 ? cleanContent : '';
    }

    convertHtmlToText(htmlContent) {
        if (!htmlContent) return '';
        
        // Créer un élément temporaire pour extraire le texte
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Extraire le texte propre
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        return textContent.trim();
    }

    buildExtendedPreview(email) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const subject = email.subject || 'Sans sujet';
        const date = email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleString('fr-FR') : '';
        const preview = email.bodyPreview || '';
        
        return `Email de: ${senderName} <${senderEmail}>
Date: ${date}
Sujet: ${subject}

${preview}

[Contenu complet non disponible - Aperçu seulement]`;
    }

    buildMinimalEmailContent(email, taskData) {
        const senderName = taskData.emailFromName || email?.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = taskData.emailFrom || email?.from?.emailAddress?.address || '';
        const subject = taskData.emailSubject || email?.subject || 'Sans sujet';
        const date = taskData.emailDate || email?.receivedDateTime;
        const formattedDate = date ? new Date(date).toLocaleString('fr-FR') : 'Date inconnue';
        
        // Construire un contenu basé sur l'analyse IA si disponible
        let content = `Email de: ${senderName} <${senderEmail}>
Date: ${formattedDate}
Sujet: ${subject}

`;

        // Ajouter le résumé s'il existe
        if (taskData.summary) {
            content += `${taskData.summary}\n\n`;
        }
        
        // Ajouter les actions s'elles existent
        if (taskData.actions && taskData.actions.length > 0) {
            content += `Actions mentionnées dans l'email:\n`;
            taskData.actions.forEach((action, idx) => {
                content += `${idx + 1}. ${action.text}\n`;
            });
            content += '\n';
        }
        
        // Ajouter les informations clés
        if (taskData.keyInfo && taskData.keyInfo.length > 0) {
            content += `Informations importantes:\n`;
            taskData.keyInfo.forEach(info => {
                content += `• ${info}\n`;
            });
            content += '\n';
        }
        
        // Ajouter un message si le contenu complet n'est pas disponible
        content += `[Contenu complet de l'email non disponible - Résumé généré par IA]`;
        
        return content;
    }

    // MÉTHODE ALTERNATIVE POUR CRÉER UNE TÂCHE NORMALE
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
            
            // Structured data (ajout pour unifier avec PageManager)
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            
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
// MODERN TASKS VIEW - AVEC AFFICHAGE CONTENU COMPLET
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
        this.currentViewMode = 'condensed';
        this.showCompleted = false;
        
        window.addEventListener('taskUpdate', () => {
            this.refreshView();
        });
    }

    // MÉTHODE PRINCIPALE POUR RENDRE L'INTERFACE - IDENTIQUE À PAGEMANAGER
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
        
        // INTERFACE IDENTIQUE À PAGEMANAGER - MÊME STRUCTURE
        container.innerHTML = `
            <div class="tasks-page-modern">
                <!-- Barre principale IDENTIQUE à PageManager -->
                <div class="tasks-main-toolbar">
                    <div class="toolbar-left">
                        <h1 class="tasks-title">Tâches</h1>
                        <span class="tasks-count-large">${stats.total} tâche${stats.total > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div class="toolbar-center">
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

                <!-- Filtres de statut IDENTIQUES à PageManager -->
                <div class="status-filters-large">
                    ${this.buildLargeStatusPills(stats)}
                </div>

                <div class="tasks-container-modern" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        // UTILISER LES MÊMES STYLES QUE PAGEMANAGER
        this.addModernTaskStyles();
        this.setupEventListeners();
        console.log('[TasksView] Modern interface rendered with PageManager styling');
    }

    // MÉTHODES IDENTIQUES À PAGEMANAGER
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

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return this.renderEmptyState();
        }

        switch (this.currentViewMode) {
            case 'detailed':
                return this.renderDetailedView(filteredTasks);
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

    // RENDU IDENTIQUE À L'INTERFACE EMAIL DE PAGEMANAGER
    renderCondensedTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusIcon = this.getStatusIcon(task.status);
        
        const clientInfo = task.hasEmail ? 
            `@${task.emailDomain || 'email'}` : 
            task.client || 'Interne';
            
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-condensed ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-condensed" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
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

    // Event handlers et interactions IDENTIQUES À PAGEMANAGER
    handleTaskClick(event, taskId) {
        if (this.currentViewMode === 'condensed') {
            this.showTaskDetails(taskId);
        } else {
            this.toggleTaskSelection(taskId);
        }
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
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 900px; width: 100%; 
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

    // CONTENU DES DÉTAILS AVEC CONTENU EMAIL COMPLET
    buildTaskDetailsContent(task) {
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusLabel = this.getStatusLabel(task.status);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-details-content">
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
                        </div>
                    </div>
                ` : ''}

                ${task.description && task.description !== task.title ? `
                    <div class="details-section">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <div class="description-content">
                            ${this.formatDescription(task.description)}
                        </div>
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
                        <h3><i class="fas fa-info-circle"></i> Informations Clés</h3>
                        <div class="info-grid">
                            ${task.keyInfo.map(info => `
                                <div class="info-item">
                                    <i class="fas fa-chevron-right"></i>
                                    <span>${this.escapeHtml(info)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.risks && task.risks.length > 0 ? `
                    <div class="details-section attention-section">
                        <h3><i class="fas fa-exclamation-triangle"></i> Points d'Attention</h3>
                        <div class="attention-list">
                            ${task.risks.map(risk => `
                                <div class="attention-item">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>${this.escapeHtml(risk)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.emailContent && task.emailContent.length > 100 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-envelope-open"></i> Contenu de l'Email</h3>
                        <div class="email-content-section">
                            <div class="email-content-box">
                                ${this.formatEmailContent(task.emailContent)}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // NOUVELLE MÉTHODE POUR FORMATER LE CONTENU EMAIL
    formatEmailContent(content) {
        if (!content) return '<p>Contenu non disponible</p>';
        
        // Préserver la structure de l'email
        const formattedContent = content
            .replace(/\n/g, '<br>')
            .replace(/Email de:/g, '<strong>Email de:</strong>')
            .replace(/Date:/g, '<strong>Date:</strong>')
            .replace(/Sujet:/g, '<strong>Sujet:</strong>');
            
        return `<div class="email-original-content">${formattedContent}</div>`;
    }

    // Utility methods IDENTIQUES À PAGEMANAGER
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

    formatDescription(description) {
        if (!description) return '';
        
        if (description.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
            return `<div class="structured-description">${description.replace(/\n/g, '<br>')}</div>`;
        } else {
            return `<div class="simple-description">${this.escapeHtml(description).replace(/\n/g, '<br>')}</div>`;
        }
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
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply;
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        
        document.querySelectorAll('.btn-large[data-mode]').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
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

    showCreateModal() {
        // Implementation for creating new tasks
        const uniqueId = 'create_task_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 600px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;">Créer une nouvelle tâche</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 20px; overflow-y: auto; flex: 1;">
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
                    <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Annuler
                        </button>
                        <button onclick="window.tasksView.createNewTask('${uniqueId}');"
                                style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-plus"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Focus sur le titre
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
        
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        this.refreshView();
    }

    bulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const actions = [
            'Marquer comme terminé',
            'Changer la priorité',
            'Supprimer',
            'Exporter'
        ];
        
        const action = prompt(`Actions disponibles pour ${this.selectedTasks.size} tâche(s):\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nEntrez le numéro de l'action:`);
        
        if (!action) return;
        
        const actionIndex = parseInt(action) - 1;
        
        switch (actionIndex) {
            case 0: // Marquer comme terminé
                this.selectedTasks.forEach(taskId => {
                    window.taskManager.updateTask(taskId, { status: 'completed' });
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
                
            case 2: // Supprimer
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedTasks.size} tâche(s) ?`)) {
                    this.selectedTasks.forEach(taskId => {
                        window.taskManager.deleteTask(taskId);
                    });
                    this.showToast(`${this.selectedTasks.size} tâche(s) supprimée(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 3: // Exporter
                this.exportSelectedTasks();
                break;
        }
    }

    exportSelectedTasks() {
        const tasks = Array.from(this.selectedTasks).map(id => window.taskManager.getTask(id)).filter(Boolean);
        
        const csvContent = [
            ['Titre', 'Description', 'Priorité', 'Statut', 'Échéance', 'Client', 'Créé le'].join(','),
            ...tasks.map(task => [
                `"${task.title}"`,
                `"${task.description || ''}"`,
                task.priority,
                task.status,
                task.dueDate || '',
                task.client || '',
                new Date(task.createdAt).toLocaleDateString('fr-FR')
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `taches_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Export terminé', 'success');
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
        
        const stats = window.taskManager.getStats();
        document.querySelectorAll('.status-filters-large').forEach(container => {
            container.innerHTML = this.buildLargeStatusPills(stats);
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

    // STYLES IDENTIQUES À PAGEMANAGER + STYLES POUR CONTENU EMAIL
    addModernTaskStyles() {
        // Utiliser les styles existants de PageManager s'ils sont déjà présents
        if (document.getElementById('optimizedEmailPageStyles')) {
            console.log('[TasksView] Using existing PageManager styles');
            return;
        }
        
        if (document.getElementById('modernTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modernTaskStyles';
        styles.textContent = `
            /* STYLES IDENTIQUES À PAGEMANAGER */
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f8fafc;
                min-height: 100vh;
                padding: 0;
            }
            
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
                opacity: 0.7;
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
                align-items: center;
                gap: 8px;
                margin-right: 16px;
                flex-shrink: 0;
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
                border: 1px solid #d1d5db;
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
            }
            
            .task-title-large {
                font-weight: 700;
                color: #1f2937;
                font-size: 16px;
                white-space: nowrap;
                flex-shrink: 0;
                min-width: 250px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .task-meta-right {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
                margin-left: auto;
            }
            
            .client-badge {
                background: #f3f4f6;
                color: #6b7280;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
            }
            
            .due-date-badge {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 13px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 6px;
                white-space: nowrap;
            }
            
            .due-date-normal {
                color: #6b7280;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
            }
            
            .due-date-soon {
                color: #d97706;
                background: #fef3c7;
                border: 1px solid #fde68a;
            }
            
            .due-date-today {
                color: #dc2626;
                background: #fef2f2;
                border: 1px solid #fecaca;
            }
            
            .due-date-overdue {
                color: #dc2626;
                background: #fef2f2;
                border: 1px solid #fecaca;
                animation: pulse 2s infinite;
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
                margin-top: 4px;
                font-size: 14px;
                color: #6b7280;
            }
            
            .email-from {
                font-weight: 500;
            }
            
            .reply-needed {
                background: #fef3c7;
                color: #d97706;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid #fde68a;
            }
            
            .task-actions-condensed {
                margin-left: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .action-btn-modern {
                width: 32px;
                height: 32px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 14px;
            }
            
            .action-btn-modern:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
                transform: translateY(-1px);
            }
            
            .action-btn-modern.complete:hover {
                background: #dcfce7;
                border-color: #16a34a;
                color: #16a34a;
            }
            
            .action-btn-modern.reply:hover {
                background: #dbeafe;
                border-color: #2563eb;
                color: #2563eb;
            }
            
            .action-btn-modern.edit:hover {
                background: #fef3c7;
                border-color: #d97706;
                color: #d97706;
            }
            
            .action-btn-modern.delete:hover {
                background: #fef2f2;
                border-color: #dc2626;
                color: #dc2626;
            }
            
            .empty-state-modern {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }
            
            .empty-state-title {
                font-size: 24px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-text {
                font-size: 16px;
                margin-bottom: 24px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
                line-height: 1.5;
            }
            
            /* Form styles pour les modals */
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
            }
            
            .form-input:focus, .form-select:focus, .form-textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
            
            /* Task details modal styles */
            .task-details-content {
                max-width: none;
            }
            
            .details-header {
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .task-title-details {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 12px 0;
                line-height: 1.3;
            }
            
            .task-meta-badges {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .priority-badge, .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 14px;
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
                color: #374151;
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
                border: 1px solid #e5e7eb;
            }
            
            .simple-description {
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
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
                border: 1px solid #e5e7eb;
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
                color: #374151;
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
            
            .info-grid {
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .info-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 14px;
                color: #374151;
                line-height: 1.4;
            }
            
            .attention-section {
                background: #fef3c7;
                border-color: #fbbf24;
            }
            
            .attention-section h3 {
                background: #fef9e8;
                border-bottom-color: #fbbf24;
                color: #92400e;
            }
            
            .attention-list {
                padding: 16px 20px;
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
                color: #f59e0b;
                margin-top: 2px;
            }
            
            .attention-item span {
                flex: 1;
                font-size: 13px;
                color: #92400e;
                line-height: 1.4;
            }
            
            /* NOUVEAUX STYLES POUR LE CONTENU EMAIL */
            .email-content-section {
                padding: 16px 20px;
            }
            
            .email-content-box {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .email-original-content {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
                white-space: pre-wrap;
            }
            
            .email-original-content strong {
                color: #1f2937;
                font-weight: 600;
            }
            
            /* Responsive */
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
                
                .task-condensed {
                    padding: 12px 16px;
                    min-height: 50px;
                }
                
                .task-indicators {
                    margin-right: 12px;
                }
                
                .task-header-line {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                }
                
                .task-title-large {
                    min-width: auto;
                    font-size: 15px;
                }
                
                .task-meta-right {
                    width: 100%;
                    justify-content: space-between;
                    margin-left: 0;
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
// GLOBAL INITIALIZATION GARANTIE
// =====================================

// Fonction d'initialisation garantie
function initializeTaskManager() {
    console.log('[TaskManager] Initializing global instances...');
    
    // Créer ou réinitialiser TaskManager
    if (!window.taskManager || !window.taskManager.initialized) {
        window.taskManager = new TaskManager();
    }
    
    // Créer ou réinitialiser TasksView  
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
    
    console.log('✅ TaskManager v8.3 CORRIGÉ loaded - Avec contenu email complet et sections structurées');
}

// Initialisation immédiate ET sur DOMContentLoaded
initializeTaskManager();

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TaskManager] DOM ready, ensuring initialization...');
    initializeTaskManager();
});

// Fallback sur window.load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TaskManager] Fallback initialization...');
            initializeTaskManager();
        }
    }, 1000);
});
