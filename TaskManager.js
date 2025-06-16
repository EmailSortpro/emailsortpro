// TaskManager Pro v10.0 - Boutons Harmonisés avec Rectangle Blanc Étendu

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
            console.log('[TaskManager] Initializing v10.0 - Boutons harmonisés...');
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
            
            // Email info
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
            
            // Données structurées IA
            summary: task.summary || '',
            actions: Array.isArray(task.actions) ? task.actions : [],
            keyInfo: Array.isArray(task.keyInfo) ? task.keyInfo : [],
            risks: Array.isArray(task.risks) ? task.risks : [],
            aiAnalysis: task.aiAnalysis || null,
            
            // Suggestions de réponse IA (obligatoires)
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
                title: 'Répondre à Jean Dupont - Devis urgent',
                description: 'Jean Dupont demande un devis pour un projet de refonte website',
                priority: 'urgent',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'jean.dupont@example.com',
                emailFromName: 'Jean Dupont',
                emailSubject: 'Demande de devis - Refonte site web',
                emailDate: '2025-06-15T14:30:00Z',
                emailDomain: 'example.com',
                client: 'Jean Dupont',
                dueDate: '2025-06-17',
                needsReply: true,
                summary: 'Demande de devis urgent pour refonte complète du site web',
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

    createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email:', taskData.title);
        
        const fullEmailContent = this.extractFullEmailContent(email, taskData);
        const htmlEmailContent = this.extractHtmlEmailContent(email, taskData);
        
        const task = this.ensureTaskProperties({
            ...taskData,
            id: taskData.id || this.generateId(),
            hasEmail: true,
            emailContent: fullEmailContent,
            emailHtmlContent: htmlEmailContent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        console.log('[TaskManager] Email task created successfully:', task.id);
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

    extractFullEmailContent(email, taskData) {
        if (taskData.emailContent && taskData.emailContent.length > 50) {
            return taskData.emailContent;
        }
        
        if (email?.body?.content) {
            return this.cleanEmailContent(email.body.content);
        }
        
        if (email?.bodyPreview) {
            return email.bodyPreview;
        }
        
        return taskData.emailContent || '';
    }

    extractHtmlEmailContent(email, taskData) {
        if (taskData.emailHtmlContent && taskData.emailHtmlContent.length > 50) {
            return taskData.emailHtmlContent;
        }
        
        if (email?.body?.contentType === 'html' && email?.body?.content) {
            return this.cleanHtmlEmailContent(email.body.content);
        }
        
        return this.convertTextToHtml(this.extractFullEmailContent(email, taskData), email);
    }

    cleanEmailContent(content) {
        if (!content) return '';
        
        return content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();
    }

    cleanHtmlEmailContent(htmlContent) {
        if (!htmlContent) return '';
        
        let cleanHtml = htmlContent
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
        
        return `<div class="email-content-viewer" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${cleanHtml}</div>`;
    }

    convertTextToHtml(textContent, email) {
        if (!textContent) return '';
        
        const senderName = email?.from?.emailAddress?.name || 'Expéditeur';
        const senderEmail = email?.from?.emailAddress?.address || '';
        const subject = email?.subject || 'Sans sujet';
        const date = email?.receivedDateTime ? new Date(email.receivedDateTime).toLocaleString('fr-FR') : '';
        
        const htmlContent = textContent
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        return `<div class="email-content-viewer" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                    <strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;<br>
                    <strong>Date:</strong> ${date}<br>
                    <strong>Sujet:</strong> ${subject}
                </div>
            </div>
            <div style="font-size: 14px; line-height: 1.8;">
                ${htmlContent}
            </div>
        </div>`;
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
// TASKS VIEW - INTERFACE HARMONISÉE
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
                <!-- RECTANGLE BLANC HARMONISÉ ÉTENDU -->
                <div class="controls-section-extended">
                    <!-- Ligne 1 : Recherche étendue -->
                    <div class="search-line-extended">
                        <div class="search-box-extended">
                            <i class="fas fa-search search-icon-extended"></i>
                            <input type="text" 
                                   class="search-input-extended" 
                                   id="taskSearchInput"
                                   placeholder="Rechercher tâches..." 
                                   value="${this.currentFilters.search}">
                            ${this.currentFilters.search ? `
                                <button class="search-clear-extended" onclick="window.tasksView.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Ligne 2 : Boutons harmonisés SANS icônes -->
                    <div class="buttons-line-extended">
                        <!-- Modes de vue harmonisés -->
                        <div class="view-modes-extended">
                            <button class="view-mode-extended ${this.currentViewMode === 'minimal' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('minimal')"
                                    title="Vue minimaliste">
                                Minimal
                            </button>
                            <button class="view-mode-extended ${this.currentViewMode === 'normal' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('normal')"
                                    title="Vue normale">
                                Normal
                            </button>
                            <button class="view-mode-extended ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('detailed')"
                                    title="Vue détaillée">
                                Détaillé
                            </button>
                        </div>
                        
                        <!-- Actions principales harmonisées -->
                        <div class="action-buttons-extended">
                            ${selectedCount > 0 ? `
                                <div class="selection-info-extended">
                                    <span class="selection-count-extended">${selectedCount} sélectionné(s)</span>
                                    <button class="btn-clear-selection-extended" onclick="window.tasksView.clearSelection()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <button class="btn-extended btn-primary" onclick="window.tasksView.bulkActions()">
                                    Actions
                                    <span class="count-badge-extended">${selectedCount}</span>
                                </button>
                            ` : ''}
                            
                            <button class="btn-extended btn-secondary" onclick="window.tasksView.refreshTasks()">
                                Actualiser
                            </button>
                            
                            <button class="btn-extended btn-primary" onclick="window.tasksView.showCreateModal()">
                                Nouvelle
                            </button>
                            
                            <button class="btn-extended filters-toggle ${this.showAdvancedFilters ? 'active' : ''}" 
                                    onclick="window.tasksView.toggleAdvancedFilters()">
                                Filtres
                                <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Ligne 3 : Filtres de statut harmonisés -->
                    <div class="status-filters-extended">
                        ${this.buildExtendedStatusPills(stats)}
                    </div>
                </div>

                <!-- Filtres avancés -->
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
                                <option value="client" ${this.currentFilters.sortBy === 'client' ? 'selected' : ''}>Client</option>
                            </select>
                        </div>

                        <div class="filter-actions">
                            <button class="btn-extended btn-secondary" onclick="window.tasksView.resetAllFilters()">
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tasks-container-harmonized" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addExtendedTaskStyles();
        this.setupEventListeners();
        console.log('[TasksView] Interface harmonisée étendue rendue');
    }

    buildExtendedStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Tous', icon: '📋', count: stats.total },
            { id: 'todo', name: 'À faire', icon: '⏳', count: stats.todo },
            { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.inProgress },
            { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue },
            { id: 'needsReply', name: 'À répondre', icon: '📧', count: stats.needsReply },
            { id: 'completed', name: 'Terminées', icon: '✅', count: stats.completed }
        ];

        return pills.map(pill => `
            <button class="status-pill-extended ${this.isFilterActive(pill.id) ? 'active' : ''}" 
                    data-filter="${pill.id}"
                    onclick="window.tasksView.quickFilter('${pill.id}')">
                <span class="pill-icon-extended">${pill.icon}</span>
                <span class="pill-text-extended">${pill.name}</span>
                <span class="pill-count-extended">${pill.count}</span>
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
        const priorityIcon = this.getPriorityIcon(task.priority);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-minimal ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-minimal" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="task-priority-minimal priority-${task.priority}" title="Priorité ${task.priority}">
                    <span class="priority-icon-centered">${priorityIcon}</span>
                </div>
                
                <div class="task-content-minimal">
                    <span class="task-title-minimal">${this.escapeHtml(task.title)}</span>
                    <span class="task-client-minimal">${this.escapeHtml(task.client)}</span>
                    <span class="task-deadline-minimal ${dueDateInfo.className}">
                        ${dueDateInfo.text || 'Pas d\'échéance'}
                    </span>
                </div>
                
                <div class="task-actions-minimal">
                    ${this.renderMinimalActions(task)}
                </div>
            </div>
        `;
    }

    renderNormalView(tasks) {
        return `
            <div class="tasks-harmonized-list">
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
        
        return `
            <div class="task-harmonized-card ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-bar-harmonized" 
                     style="background-color: ${this.getPriorityColor(task.priority)}"></div>
                
                <div class="task-main-content-harmonized">
                    <div class="task-header-harmonized">
                        <h3 class="task-title-harmonized">${this.escapeHtml(task.title)}</h3>
                        <div class="task-meta-harmonized">
                            <span class="task-type-badge-harmonized">
                                ${task.hasEmail ? '📧 Email' : '📋 Tâche'}
                            </span>
                            <span class="deadline-badge-harmonized ${dueDateInfo.className}">
                                ${dueDateInfo.html || '<span class="no-deadline">Pas d\'échéance</span>'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="task-recipient-harmonized">
                        <i class="fas fa-building task-icon-centered"></i>
                        <span class="recipient-name-harmonized">${this.escapeHtml(task.client)}</span>
                        ${task.hasEmail && task.needsReply ? '<span class="reply-indicator-harmonized">• Réponse requise</span>' : ''}
                        ${task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0 ? '<span class="has-suggestions">• Suggestions IA</span>' : ''}
                    </div>
                </div>
                
                <div class="task-actions-harmonized">
                    ${this.renderNormalActions(task)}
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
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusIcon = this.getStatusIcon(task.status);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-detailed-card ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}">
                
                <div class="task-detailed-header">
                    <input type="checkbox" 
                           class="task-checkbox-detailed" 
                           ${isSelected ? 'checked' : ''}
                           onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="task-priority-detailed priority-${task.priority}">
                        <span class="priority-icon-centered">${priorityIcon}</span>
                    </div>
                    
                    <div class="task-status-detailed status-${task.status}">
                        <span class="status-icon-centered">${statusIcon}</span>
                    </div>
                </div>
                
                <div class="task-detailed-content">
                    <h3 class="task-title-detailed" onclick="window.tasksView.showTaskDetails('${task.id}')">${this.escapeHtml(task.title)}</h3>
                    <p class="task-description-detailed">${this.escapeHtml(task.description.substring(0, 100))}${task.description.length > 100 ? '...' : ''}</p>
                    
                    <div class="task-meta-detailed">
                        <div class="task-client-detailed">
                            <i class="fas fa-building task-icon-centered"></i>
                            ${this.escapeHtml(task.client)}
                        </div>
                        <div class="task-deadline-detailed ${dueDateInfo.className}">
                            <i class="fas fa-calendar task-icon-centered"></i>
                            ${dueDateInfo.text || 'Pas d\'échéance'}
                        </div>
                    </div>
                    
                    ${task.hasEmail ? `
                        <div class="task-email-info">
                            <i class="fas fa-envelope task-icon-centered"></i>
                            <span>${task.emailFromName || 'Email'}</span>
                            ${task.needsReply ? '<span class="reply-needed">Réponse requise</span>' : ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="task-detailed-actions">
                    ${this.renderDetailedActions(task)}
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTIONS POUR CHAQUE VUE
    // ================================================
    
    renderMinimalActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-minimal complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check action-icon-centered"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-minimal edit" 
                    onclick="event.stopPropagation(); window.tasksView.showEditModal('${task.id}')"
                    title="Modifier">
                <i class="fas fa-edit action-icon-centered"></i>
            </button>
        `);
        
        return actions.join('');
    }

    renderNormalActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-harmonized complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check action-icon-centered"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-harmonized edit" 
                    onclick="event.stopPropagation(); window.tasksView.showEditModal('${task.id}')"
                    title="Modifier la tâche">
                <i class="fas fa-edit action-icon-centered"></i>
            </button>
        `);
        
        actions.push(`
            <button class="action-btn-harmonized details" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye action-icon-centered"></i>
            </button>
        `);
        
        if (task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0) {
            actions.push(`
                <button class="action-btn-harmonized reply" 
                        onclick="event.stopPropagation(); window.tasksView.showSuggestedReplies('${task.id}')"
                        title="Suggestions de réponse">
                    <i class="fas fa-reply action-icon-centered"></i>
                </button>
            `);
        }
        
        return actions.join('');
    }

    renderDetailedActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="btn-detailed btn-success" 
                        onclick="window.tasksView.markComplete('${task.id}')">
                    <i class="fas fa-check action-icon-centered"></i>
                    Terminé
                </button>
            `);
        }
        
        actions.push(`
            <button class="btn-detailed btn-primary" 
                    onclick="window.tasksView.showEditModal('${task.id}')">
                <i class="fas fa-edit action-icon-centered"></i>
                Modifier
            </button>
        `);
        
        actions.push(`
            <button class="btn-detailed btn-secondary" 
                    onclick="window.tasksView.showTaskDetails('${task.id}')">
                <i class="fas fa-eye action-icon-centered"></i>
                Détails
            </button>
        `);
        
        return actions.join('');
    }

    // ================================================
    // MODALES - ÉDITION ET DÉTAILS (reste inchangé)
    // ================================================
    
    showEditModal(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'edit_task_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-edit modal-icon-centered"></i> Modifier la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times modal-icon-centered"></i>
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
                            <i class="fas fa-save modal-icon-centered"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Focus sur le premier champ
        setTimeout(() => {
            const firstInput = document.querySelector(`#${uniqueId} input, #${uniqueId} textarea`);
            if (firstInput) firstInput.focus();
        }, 100);
    }

    buildEditForm(task) {
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
                        <label>Priorité</label>
                        <select id="edit-priority" class="form-select">
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Statut</label>
                        <select id="edit-status" class="form-select">
                            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>⏳ À faire</option>
                            <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>🔄 En cours</option>
                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>✅ Terminé</option>
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
                
                ${task.hasEmail ? `
                    <div class="form-section">
                        <h3><i class="fas fa-envelope modal-icon-centered"></i> Informations Email</h3>
                        <div class="email-info-readonly">
                            <div><strong>De:</strong> ${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')}</div>
                            <div><strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject || 'Sans sujet')}</div>
                            <div>
                                <label>
                                    <input type="checkbox" id="edit-needs-reply" ${task.needsReply ? 'checked' : ''} />
                                    Réponse requise
                                </label>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Les autres méthodes restent identiques mais avec les icônes centrées ajoutées...
    // [Le reste du code continue avec les mêmes méthodes mais en ajoutant la classe "centered" aux icônes]

    // ================================================
    // MÉTHODES UTILITAIRES (inchangées)
    // ================================================
    
    saveTaskChanges(taskId, modalId) {
        const title = document.getElementById('edit-title')?.value?.trim();
        const description = document.getElementById('edit-description')?.value?.trim();
        const priority = document.getElementById('edit-priority')?.value;
        const status = document.getElementById('edit-status')?.value;
        const client = document.getElementById('edit-client')?.value?.trim();
        const dueDate = document.getElementById('edit-duedate')?.value;
        const needsReply = document.getElementById('edit-needs-reply')?.checked;

        if (!title) {
            this.showToast('Le titre est requis', 'warning');
            return;
        }

        const updates = {
            title,
            description,
            priority,
            status,
            client: client || 'Interne',
            dueDate: dueDate || null,
            needsReply: needsReply || false
        };

        try {
            window.taskManager.updateTask(taskId, updates);
            this.closeModal(modalId);
            this.showToast('Tâche mise à jour avec succès', 'success');
            this.refreshView();
        } catch (error) {
            console.error('Error updating task:', error);
            this.showToast('Erreur lors de la mise à jour', 'error');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = 'auto';
    }

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.currentFilters.search) {
            title = 'Aucun résultat trouvé';
            text = `Aucune tâche ne correspond à votre recherche "${this.currentFilters.search}"`;
            action = `
                <button class="btn-extended btn-primary" onclick="window.tasksView.clearSearch()">
                    <i class="fas fa-undo action-icon-centered"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.hasActiveFilters()) {
            title = 'Aucune tâche trouvée';
            text = 'Aucune tâche ne correspond à vos critères de filtrage.';
            action = `
                <button class="btn-extended btn-primary" onclick="window.tasksView.resetAllFilters()">
                    <i class="fas fa-undo action-icon-centered"></i>
                    <span>Réinitialiser les filtres</span>
                </button>
            `;
        } else {
            title = 'Aucune tâche';
            text = 'Vous n\'avez aucune tâche pour le moment.';
            action = `
                <button class="btn-extended btn-primary" onclick="window.tasksView.showCreateModal()">
                    <i class="fas fa-plus action-icon-centered"></i>
                    <span>Créer votre première tâche</span>
                </button>
            `;
        }
        
        return `
            <div class="empty-state-harmonized">
                <div class="empty-state-icon-harmonized">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3 class="empty-state-title-harmonized">${title}</h3>
                <p class="empty-state-text-harmonized">${text}</p>
                ${action}
            </div>
        `;
    }

    // Toutes les autres méthodes restent identiques...
    // (Je continue avec les méthodes existantes pour ne pas dépasser la limite)

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

    getPriorityIcon(priority) {
        const icons = { urgent: '🚨', high: '⚡', medium: '📌', low: '📄' };
        return icons[priority] || '📌';
    }

    getPriorityColor(priority) {
        const colors = { urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#10b981' };
        return colors[priority] || '#3b82f6';
    }

    getStatusIcon(status) {
        const icons = { todo: '⏳', 'in-progress': '🔄', completed: '✅' };
        return icons[status] || '⏳';
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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    // Méthodes simplifiées pour éviter la duplication
    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.refreshView();
        this.showToast('Sélection effacée', 'info');
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    quickFilter(filterId) {
        // Reset filters
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

        // Apply specific filter
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

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        // Mettre à jour les stats dans les pills
        const stats = window.taskManager.getStats();
        document.querySelectorAll('.status-filters-extended').forEach(container => {
            container.innerHTML = this.buildExtendedStatusPills(stats);
        });
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

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.refreshView();
    }

    handleTaskClick(event, taskId) {
        if (event.target.type === 'checkbox') {
            return;
        }
        
        if (event.target.closest('.task-actions-harmonized, .task-actions-minimal, .task-detailed-actions')) {
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

    bulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const actions = [
            'Marquer comme terminé',
            'Changer la priorité',
            'Changer le statut',
            'Supprimer',
            'Exporter'
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
                const status = prompt('Nouveau statut:\n1. À faire\n2. En cours\n3. Terminé\n\nEntrez le numéro:');
                const statuses = ['', 'todo', 'in-progress', 'completed'];
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
                
            case 4: // Exporter
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
        this.clearSelection();
    }

    showCreateModal() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'create_task_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus modal-icon-centered"></i> Créer une nouvelle tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times modal-icon-centered"></i>
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
                            <i class="fas fa-plus modal-icon-centered"></i> Créer la tâche
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const titleInput = document.getElementById('new-task-title');
            if (titleInput) titleInput.focus();
        }, 100);
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
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Client/Projet</label>
                        <input type="text" id="new-task-client" class="form-input" 
                               placeholder="Nom du client ou projet" value="Interne" />
                    </div>
                </div>
            </div>
        `;
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
            description: description || '',
            priority,
            dueDate: dueDate || null,
            client: client || 'Interne',
            category: 'work',
            method: 'manual'
        };

        try {
            const task = window.taskManager.createTask(taskData);
            this.closeModal(modalId);
            
            this.showToast('Tâche créée avec succès', 'success');
            this.refreshView();
        } catch (error) {
            console.error('[TasksView] Error creating task:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
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
                        <h2><i class="fas fa-eye modal-icon-centered"></i> Détails de la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times modal-icon-centered"></i>
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
                                <i class="fas fa-reply modal-icon-centered"></i> Voir suggestions de réponse
                            </button>
                        ` : ''}
                        <button class="btn-modal btn-primary" onclick="window.tasksView.closeModal('${uniqueId}'); window.tasksView.showEditModal('${task.id}')">
                            <i class="fas fa-edit modal-icon-centered"></i> Modifier
                        </button>
                        ${task.status !== 'completed' ? `
                            <button class="btn-modal btn-success" onclick="window.tasksView.markComplete('${task.id}'); window.tasksView.closeModal('${uniqueId}')">
                                <i class="fas fa-check modal-icon-centered"></i> Marquer terminé
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
                <div class="details-header">
                    <h1 class="task-title-details">${this.escapeHtml(task.title)}</h1>
                    <div class="task-meta-badges">
                        <span class="priority-badge priority-${task.priority}">
                            ${priorityIcon} ${this.getPriorityLabel(task.priority)}
                        </span>
                        <span class="status-badge status-${task.status}">
                            ${this.getStatusIcon(task.status)} ${statusLabel}
                        </span>
                        <span class="deadline-badge ${dueDateInfo.className}">
                            <i class="fas fa-calendar modal-icon-centered"></i>
                            ${dueDateInfo.text || 'Pas d\'échéance définie'}
                        </span>
                    </div>
                </div>

                ${task.description ? `
                    <div class="details-section">
                        <h3><i class="fas fa-align-left modal-icon-centered"></i> Description</h3>
                        <div class="description-content">
                            ${this.formatDescription(task.description)}
                        </div>
                    </div>
                ` : ''}

                <div class="details-section">
                    <h3><i class="fas fa-info-circle modal-icon-centered"></i> Informations Générales</h3>
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
                    </div>
                </div>

                ${task.hasEmail ? `
                    <div class="details-section">
                        <h3><i class="fas fa-envelope modal-icon-centered"></i> Informations Email</h3>
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
                        <h3><i class="fas fa-tasks modal-icon-centered"></i> Actions Requises</h3>
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
                        <h3><i class="fas fa-lightbulb modal-icon-centered"></i> Informations Clés</h3>
                        <div class="key-info-grid">
                            ${task.keyInfo.map(info => `
                                <div class="key-info-item">
                                    <i class="fas fa-chevron-right modal-icon-centered"></i>
                                    <span>${this.escapeHtml(info)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.risks && task.risks.length > 0 ? `
                    <div class="details-section attention-section">
                        <h3><i class="fas fa-exclamation-triangle modal-icon-centered"></i> Points d'Attention</h3>
                        <div class="attention-list">
                            ${task.risks.map(risk => `
                                <div class="attention-item">
                                    <i class="fas fa-exclamation-circle modal-icon-centered"></i>
                                    <span>${this.escapeHtml(risk)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
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

    getPriorityLabel(priority) {
        const labels = { urgent: 'Urgente', high: 'Haute', medium: 'Normale', low: 'Basse' };
        return labels[priority] || 'Normale';
    }

    getStatusLabel(status) {
        const labels = { todo: 'À faire', 'in-progress': 'En cours', completed: 'Terminé' };
        return labels[status] || 'À faire';
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
                        <h2><i class="fas fa-reply-all modal-icon-centered"></i> Suggestions de Réponse</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times modal-icon-centered"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="ai-suggestions-info">
                            <div class="ai-badge">
                                <i class="fas fa-robot modal-icon-centered"></i>
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
                                                <i class="fas fa-copy modal-icon-centered"></i> Copier
                                            </button>
                                            <button class="btn-sm btn-primary" onclick="window.tasksView.useReply('${taskId}', ${idx})">
                                                <i class="fas fa-paper-plane modal-icon-centered"></i> Utiliser
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
        
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
        
        this.refreshView();
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

    addExtendedTaskStyles() {
        if (document.getElementById('extendedTaskStylesV10')) return;
        
        const styles = document.createElement('style');
        styles.id = 'extendedTaskStylesV10';
        styles.textContent = `
            /* Variables CSS pour TaskManager v10.0 */
            :root {
                --btn-height: 42px;
                --btn-padding-horizontal: 16px;
                --btn-font-size: 13px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-gap: 8px;
                --card-height: 76px;
                --card-padding: 14px;
                --card-border-radius: 12px;
                --action-btn-size: 36px;
                --gap-small: 8px;
                --gap-medium: 12px;
                --gap-large: 16px;
                --transition-speed: 0.2s;
                --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: var(--gap-large);
                font-size: var(--btn-font-size);
            }

            /* RECTANGLE BLANC ÉTENDU HARMONISÉ */
            .controls-section-extended {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-large);
                margin-bottom: var(--gap-medium);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                display: flex;
                flex-direction: column;
                gap: var(--gap-large);
            }

            /* LIGNE 1 : Recherche étendue */
            .search-line-extended {
                width: 100%;
                display: flex;
                justify-content: center;
            }
            
            .search-box-extended {
                position: relative;
                width: 100%;
                max-width: 800px;
                height: calc(var(--btn-height) + 8px);
                display: flex;
                align-items: center;
            }
            
            .search-input-extended {
                width: 100%;
                height: 100%;
                padding: 0 var(--gap-large) 0 56px;
                border: 2px solid #e5e7eb;
                border-radius: calc(var(--btn-border-radius) + 4px);
                font-size: calc(var(--btn-font-size) + 2px);
                background: #f9fafb;
                transition: all var(--transition-speed) ease;
                outline: none;
                font-weight: 500;
                color: #374151;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .search-input-extended:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05);
                transform: translateY(-1px);
            }
            
            .search-input-extended::placeholder {
                color: #9ca3af;
                font-weight: 400;
            }
            
            .search-icon-extended {
                position: absolute;
                left: var(--gap-large);
                color: #6b7280;
                pointer-events: none;
                font-size: 18px;
                z-index: 1;
            }
            
            .search-input-extended:focus + .search-icon-extended {
                color: #3b82f6;
            }
            
            .search-clear-extended {
                position: absolute;
                right: var(--gap-medium);
                background: #ef4444;
                color: white;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: all var(--transition-speed) ease;
                box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
            }
            
            .search-clear-extended:hover {
                background: #dc2626;
                transform: scale(1.1);
                box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
            }

            /* LIGNE 2 : Boutons harmonisés SANS icônes - ALIGNEMENT CORRIGÉ */
            .buttons-line-extended {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--gap-large);
                width: 100%;
                min-height: var(--btn-height);
            }
            
            /* Modes de vue étendus SANS icônes - ALIGNEMENT PARFAIT */
            .view-modes-extended {
                display: flex;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: 4px;
                gap: 2px;
                height: var(--btn-height);
                flex-shrink: 0;
                align-items: center;
            }
            
            .view-mode-extended {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 var(--btn-padding-horizontal);
                height: calc(var(--btn-height) - 8px);
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                min-width: 100px;
                white-space: nowrap;
                line-height: 1;
                text-align: center;
            }
            
            .view-mode-extended:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
                transform: translateY(-1px);
            }
            
            .view-mode-extended.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
                font-weight: 700;
                transform: translateY(-1px);
            }
            
            /* Actions étendues SANS icônes - ALIGNEMENT PARFAIT */
            .action-buttons-extended {
                display: flex;
                align-items: center;
                gap: var(--gap-medium);
                flex: 1;
                justify-content: flex-end;
                height: var(--btn-height);
            }
            
            .btn-extended {
                height: var(--btn-height);
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                padding: 0 var(--btn-padding-horizontal);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                box-shadow: var(--shadow-base);
                position: relative;
                white-space: nowrap;
                flex-shrink: 0;
                line-height: 1;
                text-align: center;
                min-height: var(--btn-height);
            }
            
            .btn-extended:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-extended.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                font-weight: 700;
            }
            
            .btn-extended.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }
            
            .btn-extended.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-extended.btn-secondary:hover {
                background: #f1f5f9;
                color: #334155;
                border-color: #cbd5e1;
            }
            
            .selection-info-extended {
                height: var(--btn-height);
                padding: 0 var(--btn-padding-horizontal);
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                color: #1e40af;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                line-height: 1;
                text-align: center;
            }
            
            .btn-clear-selection-extended {
                background: #f3f4f6;
                color: #6b7280;
                border: none;
                width: var(--btn-height);
                min-width: var(--btn-height);
                height: var(--btn-height);
                padding: 0;
                border-radius: var(--btn-border-radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-speed) ease;
                line-height: 1;
            }
            
            .btn-clear-selection-extended:hover {
                background: #e5e7eb;
                color: #374151;
            }
            
            .count-badge-extended {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 3px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                border: 2px solid white;
                animation: badgePulse 2s ease-in-out infinite;
            }
            
            @keyframes badgePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .filters-toggle {
                position: relative;
            }
            
            .filters-toggle.active {
                background: #eff6ff;
                color: #1e40af;
                border-color: #3b82f6;
            }

            /* LIGNE 3 : Filtres de statut étendus - ALIGNEMENT PARFAIT */
            .status-filters-extended {
                display: flex;
                gap: var(--gap-small);
                flex-wrap: wrap;
                width: 100%;
                justify-content: center;
                align-items: center;
            }
            
            .status-pill-extended {
                height: 48px;
                padding: var(--gap-small);
                font-size: 12px;
                font-weight: 700;
                flex: 0 1 calc(16.666% - var(--gap-small));
                min-width: 140px;
                max-width: 200px;
                border-radius: var(--btn-border-radius);
                box-shadow: var(--shadow-base);
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                cursor: pointer;
                position: relative;
                gap: var(--gap-small);
                line-height: 1;
            }
            
            .pill-icon-extended {
                font-size: 14px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .pill-text-extended {
                font-weight: 700;
                font-size: 12px;
                line-height: 1;
                text-align: center;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .pill-count-extended {
                background: rgba(0, 0, 0, 0.1);
                padding: 3px 8px;
                border-radius: 8px;
                font-size: 10px;
                font-weight: 800;
                min-width: 20px;
                text-align: center;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }
            
            .status-pill-extended:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
            }
            
            .status-pill-extended.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                transform: translateY(-2px);
            }
            
            .status-pill-extended.active .pill-count-extended {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }

            /* FILTRES AVANCÉS */
            .advanced-filters-panel {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                margin-bottom: var(--gap-large);
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
                opacity: 0;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            }
            
            .advanced-filters-panel.show {
                max-height: 200px;
                opacity: 1;
                padding: var(--gap-large);
            }
            
            .advanced-filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--gap-medium);
                align-items: end;
            }
            
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: var(--gap-small);
            }
            
            .filter-label {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                font-weight: 600;
                font-size: 12px;
                color: #374151;
            }
            
            .filter-select {
                height: var(--btn-height);
                padding: 0 var(--gap-medium);
                border: 1px solid #d1d5db;
                border-radius: var(--btn-border-radius);
                background: white;
                font-size: var(--btn-font-size);
                color: #374151;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
            }
            
            .filter-select:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
            }
            
            .filter-actions {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--gap-small);
            }

            /* TÂCHES AVEC ICÔNES CENTRÉES */
            .tasks-container-harmonized {
                background: transparent;
            }

            /* ICÔNES CENTRÉES - Classes utilitaires */
            .task-icon-centered,
            .action-icon-centered,
            .modal-icon-centered,
            .priority-icon-centered,
            .status-icon-centered {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                text-align: center;
                vertical-align: middle;
            }

            /* VUE MINIMALISTE avec icônes centrées */
            .tasks-minimal-list {
                display: flex;
                flex-direction: column;
                gap: 2px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: var(--card-border-radius);
                overflow: hidden;
                box-shadow: var(--shadow-base);
            }
            
            .task-minimal {
                display: flex;
                align-items: center;
                background: white;
                padding: 12px 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-bottom: 1px solid #f3f4f6;
                min-height: 50px;
                gap: 12px;
            }
            
            .task-minimal:last-child {
                border-bottom: none;
            }
            
            .task-minimal:hover {
                background: #f9fafb;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .task-minimal.selected {
                background: #eff6ff;
                border-left: 3px solid #3b82f6;
            }
            
            .task-minimal.completed {
                opacity: 0.6;
            }
            
            .task-minimal.completed .task-title-minimal {
                text-decoration: line-through;
            }
            
            .task-checkbox-minimal {
                width: 16px;
                height: 16px;
                cursor: pointer;
                flex-shrink: 0;
            }
            
            .task-priority-minimal {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .task-priority-minimal.priority-urgent {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .task-priority-minimal.priority-high {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .task-priority-minimal.priority-medium {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .task-priority-minimal.priority-low {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .task-content-minimal {
                flex: 1;
                display: grid;
                grid-template-columns: 2fr 1fr 1fr;
                gap: 12px;
                align-items: center;
                min-width: 0;
            }
            
            .task-title-minimal {
                font-weight: 600;
                color: #1f2937;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-client-minimal {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-deadline-minimal {
                font-size: 12px;
                font-weight: 500;
                text-align: right;
                white-space: nowrap;
            }
            
            .task-deadline-minimal.deadline-overdue {
                color: #dc2626;
                font-weight: 600;
            }
            
            .task-deadline-minimal.deadline-today {
                color: #d97706;
                font-weight: 600;
            }
            
            .task-deadline-minimal.deadline-tomorrow {
                color: #d97706;
            }
            
            .task-deadline-minimal.deadline-week {
                color: #2563eb;
            }
            
            .task-deadline-minimal.deadline-normal {
                color: #6b7280;
            }
            
            .task-deadline-minimal.no-deadline {
                color: #9ca3af;
                font-style: italic;
            }
            
            .task-actions-minimal {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-shrink: 0;
            }
            
            .action-btn-minimal {
                width: 28px;
                height: 28px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 12px;
            }
            
            .action-btn-minimal:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
                transform: translateY(-1px);
            }
            
            .action-btn-minimal.complete:hover {
                background: #dcfce7;
                border-color: #16a34a;
                color: #16a34a;
            }
            
            .action-btn-minimal.edit:hover {
                background: #fef3c7;
                border-color: #d97706;
                color: #d97706;
            }

            /* VUE NORMALE avec icônes centrées */
            .tasks-harmonized-list {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            
            .task-harmonized-card {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                min-height: var(--card-height);
                max-height: var(--card-height);
                border-bottom: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:first-child {
                border-top-left-radius: var(--card-border-radius);
                border-top-right-radius: var(--card-border-radius);
                border-top: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:last-child {
                border-bottom-left-radius: var(--card-border-radius);
                border-bottom-right-radius: var(--card-border-radius);
                border-bottom: 1px solid #e5e7eb;
            }
            
            .task-harmonized-card:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 1;
            }
            
            .task-harmonized-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 2;
            }
            
            .task-harmonized-card.completed {
                opacity: 0.75;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid #22c55e;
            }
            
            .task-harmonized-card.completed .task-title-harmonized {
                text-decoration: line-through;
                color: #6b7280;
            }
            
            .task-checkbox-harmonized {
                margin-right: var(--gap-medium);
                cursor: pointer;
                width: 20px;
                height: 20px;
                border-radius: 6px;
                border: 2px solid #d1d5db;
                background: white;
                transition: all var(--transition-speed) ease;
                flex-shrink: 0;
                appearance: none;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .task-checkbox-harmonized:checked {
                background: #6366f1;
                border-color: #6366f1;
            }
            
            .task-checkbox-harmonized:checked::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: 700;
            }
            
            .priority-bar-harmonized {
                width: 4px;
                height: 56px;
                border-radius: 2px;
                margin-right: var(--gap-medium);
                transition: all 0.3s ease;
                flex-shrink: 0;
            }
            
            .task-main-content-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                height: 100%;
            }
            
            .task-header-harmonized {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: var(--gap-medium);
                margin-bottom: 4px;
            }
            
            .task-title-harmonized {
                font-weight: 700;
                color: #1f2937;
                font-size: 15px;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-meta-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
            }
            
            .task-type-badge-harmonized,
            .deadline-badge-harmonized {
                display: flex;
                align-items: center;
                gap: 3px;
                background: #f8fafc;
                color: #64748b;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid #e2e8f0;
                white-space: nowrap;
            }
            
            .deadline-badge-harmonized.deadline-overdue {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
                animation: pulse 2s infinite;
            }
            
            .deadline-badge-harmonized.deadline-today {
                background: #fef3c7;
                color: #d97706;
                border-color: #fde68a;
            }
            
            .deadline-badge-harmonized.deadline-tomorrow {
                background: #fef3c7;
                color: #d97706;
                border-color: #fde68a;
            }
            
            .deadline-badge-harmonized.deadline-week {
                background: #eff6ff;
                color: #2563eb;
                border-color: #bfdbfe;
            }
            
            .deadline-badge-harmonized.deadline-normal {
                background: #f8fafc;
                color: #64748b;
                border-color: #e2e8f0;
            }
            
            .deadline-badge-harmonized.no-deadline {
                background: #f3f4f6;
                color: #9ca3af;
                border-color: #d1d5db;
                font-style: italic;
            }
            
            .no-deadline {
                color: #9ca3af;
                font-style: italic;
                font-size: 10px;
            }
            
            .task-recipient-harmonized {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }
            
            .recipient-name-harmonized {
                font-weight: 600;
                color: #374151;
            }
            
            .reply-indicator-harmonized {
                color: #dc2626;
                font-weight: 600;
                font-size: 10px;
            }
            
            .has-suggestions {
                color: #8b5cf6;
                font-weight: 600;
                font-size: 10px;
            }
            
            .task-actions-harmonized {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: var(--gap-medium);
                flex-shrink: 0;
            }
            
            .action-btn-harmonized {
                width: var(--action-btn-size);
                height: var(--action-btn-size);
                border: 2px solid transparent;
                border-radius: var(--btn-border-radius);
                background: rgba(255, 255, 255, 0.9);
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 13px;
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            }
            
            .action-btn-harmonized:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .action-btn-harmonized.complete {
                color: #16a34a;
            }
            
            .action-btn-harmonized.complete:hover {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                border-color: #16a34a;
                color: #15803d;
            }
            
            .action-btn-harmonized.edit {
                color: #d97706;
            }
            
            .action-btn-harmonized.edit:hover {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-color: #d97706;
                color: #92400e;
            }
            
            .action-btn-harmonized.details {
                color: #8b5cf6;
            }
            
            .action-btn-harmonized.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: #8b5cf6;
                color: #7c3aed;
            }
            
            .action-btn-harmonized.reply {
                color: #3b82f6;
            }
            
            .action-btn-harmonized.reply:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
                color: #2563eb;
            }

            /* VUE DÉTAILLÉE avec icônes centrées */
            .tasks-detailed-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: var(--gap-large);
            }
            
            .task-detailed-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-large);
                transition: all 0.3s ease;
                box-shadow: var(--shadow-base);
                min-height: 200px;
                display: flex;
                flex-direction: column;
            }
            
            .task-detailed-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-hover);
                border-color: rgba(99, 102, 241, 0.3);
            }
            
            .task-detailed-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-color: #3b82f6;
                box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
            }
            
            .task-detailed-card.completed {
                opacity: 0.8;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-color: #22c55e;
            }
            
            .task-detailed-header {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                margin-bottom: var(--gap-medium);
            }
            
            .task-checkbox-detailed {
                width: 18px;
                height: 18px;
                cursor: pointer;
                flex-shrink: 0;
            }
            
            .task-priority-detailed {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .task-priority-detailed.priority-urgent {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .task-priority-detailed.priority-high {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .task-priority-detailed.priority-medium {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .task-priority-detailed.priority-low {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .task-status-detailed {
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
                flex-shrink: 0;
            }
            
            .task-detailed-content {
                flex: 1;
                margin-bottom: var(--gap-medium);
            }
            
            .task-title-detailed {
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 var(--gap-small) 0;
                line-height: 1.3;
                cursor: pointer;
                transition: color 0.2s ease;
            }
            
            .task-title-detailed:hover {
                color: #3b82f6;
            }
            
            .task-description-detailed {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.5;
                margin: 0 0 var(--gap-medium) 0;
            }
            
            .task-meta-detailed {
                display: flex;
                flex-direction: column;
                gap: var(--gap-small);
                margin-bottom: var(--gap-medium);
            }
            
            .task-client-detailed,
            .task-deadline-detailed {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                font-size: 13px;
                font-weight: 500;
            }
            
            .task-client-detailed {
                color: #6b7280;
            }
            
            .task-deadline-detailed.deadline-overdue {
                color: #dc2626;
                font-weight: 600;
            }
            
            .task-deadline-detailed.deadline-today {
                color: #d97706;
                font-weight: 600;
            }
            
            .task-deadline-detailed.deadline-tomorrow {
                color: #d97706;
            }
            
            .task-deadline-detailed.deadline-week {
                color: #2563eb;
            }
            
            .task-deadline-detailed.deadline-normal {
                color: #6b7280;
            }
            
            .task-deadline-detailed.no-deadline {
                color: #9ca3af;
                font-style: italic;
            }
            
            .task-email-info {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                font-size: 13px;
                color: #6b7280;
                padding: var(--gap-small);
                background: #f8fafc;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
            }
            
            .reply-needed {
                background: #fef3c7;
                color: #d97706;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                border: 1px solid #fde68a;
            }
            
            .task-detailed-actions {
                display: flex;
                gap: var(--gap-small);
                flex-wrap: wrap;
            }
            
            .btn-detailed {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                padding: 8px 14px;
                border-radius: var(--btn-border-radius);
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid;
                white-space: nowrap;
            }
            
            .btn-detailed.btn-success {
                background: #16a34a;
                color: white;
                border-color: #16a34a;
            }
            
            .btn-detailed.btn-success:hover {
                background: #15803d;
                border-color: #15803d;
                transform: translateY(-1px);
            }
            
            .btn-detailed.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .btn-detailed.btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
                transform: translateY(-1px);
            }
            
            .btn-detailed.btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border-color: #d1d5db;
            }
            
            .btn-detailed.btn-secondary:hover {
                background: #e5e7eb;
                border-color: #9ca3af;
            }

            /* MODALES avec icônes centrées */
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
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: var(--gap-small);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #6b7280;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-content {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            .btn-modal {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid;
                white-space: nowrap;
            }
            
            .btn-modal.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .btn-modal.btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
                transform: translateY(-1px);
            }
            
            .btn-modal.btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border-color: #d1d5db;
            }
            
            .btn-modal.btn-secondary:hover {
                background: #e5e7eb;
                border-color: #9ca3af;
            }
            
            .btn-modal.btn-success {
                background: #16a34a;
                color: white;
                border-color: #16a34a;
            }
            
            .btn-modal.btn-success:hover {
                background: #15803d;
                border-color: #15803d;
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
                gap: var(--gap-large);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--gap-medium);
            }
            
            .form-row .form-group:only-child {
                grid-column: 1 / -1;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: var(--gap-small);
            }
            
            .form-group label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
            }
            
            .form-input,
            .form-select,
            .form-textarea {
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
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
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-textarea {
                resize: vertical;
                min-height: 80px;
                font-family: inherit;
            }
            
            .form-section {
                margin-top: var(--gap-large);
                padding-top: var(--gap-large);
                border-top: 1px solid #e5e7eb;
            }
            
            .form-section h3 {
                margin: 0 0 var(--gap-medium) 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: var(--gap-small);
            }
            
            .email-info-readonly {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: var(--gap-medium);
                font-size: 14px;
                color: #374151;
            }
            
            .email-info-readonly > div {
                margin-bottom: var(--gap-small);
            }
            
            .email-info-readonly > div:last-child {
                margin-bottom: 0;
            }

            /* DÉTAILS DES TÂCHES */
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
            
            .priority-badge,
            .status-badge,
            .deadline-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
            }
            
            .priority-badge.priority-urgent {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .priority-badge.priority-high {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .priority-badge.priority-medium {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .priority-badge.priority-low {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .status-badge.status-todo {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .status-badge.status-in-progress {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .status-badge.status-completed {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .deadline-badge.deadline-overdue {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .deadline-badge.deadline-today {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .deadline-badge.deadline-tomorrow {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .deadline-badge.deadline-week {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .deadline-badge.deadline-normal {
                background: #f8fafc;
                color: #64748b;
                border: 1px solid #e2e8f0;
            }
            
            .deadline-badge.no-deadline {
                background: #f3f4f6;
                color: #9ca3af;
                border: 1px solid #d1d5db;
                font-style: italic;
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
                color: #374151;
                line-height: 1.4;
            }
            
            .info-item strong {
                min-width: 120px;
                color: #1f2937;
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
            
            .email-content-section {
                padding: 16px 20px;
            }
            
            .email-content-section h4 {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }
            
            .email-content-box {
                background: white;
                border: 1px solid #e5e7eb;
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
                color: #374151;
                white-space: pre-wrap;
            }
            
            .email-original-content strong {
                color: #1f2937;
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
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                transition: all 0.2s ease;
            }
            
            .reply-suggestion-card:hover {
                border-color: #3b82f6;
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
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
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
                transition: all 0.2s ease;
                border: 1px solid;
            }
            
            .btn-sm.btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border-color: #d1d5db;
            }
            
            .btn-sm.btn-secondary:hover {
                background: #e5e7eb;
                border-color: #9ca3af;
            }
            
            .btn-sm.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .btn-sm.btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
                transform: translateY(-1px);
            }
            
            .reply-subject-line {
                font-size: 13px;
                color: #4b5563;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .reply-content-preview {
                font-size: 13px;
                color: #374151;
                line-height: 1.6;
                white-space: pre-wrap;
                background: #f8fafc;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
                max-height: 150px;
                overflow-y: auto;
            }

            /* ÉTAT VIDE */
            .empty-state-harmonized {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .empty-state-icon-harmonized {
                font-size: 48px;
                margin-bottom: 20px;
                color: #d1d5db;
            }
            
            .empty-state-title-harmonized {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-text-harmonized {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
            }

            /* RESPONSIVE */
            @media (max-width: 1200px) {
                .status-pill-extended {
                    flex: 0 1 calc(20% - var(--gap-small));
                    min-width: 110px;
                    max-width: 170px;
                    height: 46px;
                }
                
                .tasks-detailed-grid {
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                }
            }
            
            @media (max-width: 1024px) {
                .buttons-line-extended {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                }
                
                .view-modes-extended {
                    width: 100%;
                    justify-content: space-around;
                }
                
                .action-buttons-extended {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .status-pill-extended {
                    flex: 0 1 calc(25% - var(--gap-small));
                    min-width: 90px;
                    max-width: 150px;
                    height: 44px;
                }
                
                .task-content-minimal {
                    grid-template-columns: 1fr auto;
                    gap: 8px;
                }
                
                .task-client-minimal {
                    grid-column: 1 / -1;
                    font-size: 11px;
                }
                
                .tasks-detailed-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 768px) {
                .status-pill-extended {
                    flex: 0 1 calc(33.333% - var(--gap-small));
                    min-width: 80px;
                    max-width: 130px;
                    height: 42px;
                    font-size: 11px;
                }
                
                .view-mode-extended {
                    min-width: 80px;
                    font-size: 12px;
                }
                
                .btn-extended {
                    padding: 0 12px;
                    font-size: 12px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .task-meta-harmonized .task-type-badge-harmonized {
                    display: none;
                }
                
                .modal-container {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }
                
                .modal-header,
                .modal-content,
                .modal-footer {
                    padding: 16px;
                }
            }
            
            @media (max-width: 480px) {
                .status-pill-extended {
                    flex: 0 1 calc(50% - 4px);
                    min-width: 70px;
                    max-width: 120px;
                    height: 40px;
                    font-size: 10px;
                }
                
                .controls-section-extended {
                    padding: var(--gap-medium);
                    gap: var(--gap-medium);
                }
                
                .action-buttons-extended {
                    flex-direction: column;
                    gap: 4px;
                    align-items: stretch;
                }
                
                .action-buttons-extended > * {
                    width: 100%;
                    justify-content: center;
                }
                
                .task-content-minimal {
                    grid-template-columns: 1fr;
                    gap: 4px;
                }
                
                .task-deadline-minimal {
                    text-align: left;
                    font-size: 11px;
                }
                
                .task-meta-badges {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .info-grid {
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

function initializeTaskManagerV10() {
    console.log('[TaskManager] Initializing v10.0 - Boutons harmonisés...');
    
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
    
    console.log('✅ TaskManager v10.0 loaded - Boutons harmonisés avec rectangle blanc étendu');
}

// Initialisation immédiate ET sur DOMContentLoaded
initializeTaskManagerV10();

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TaskManager] DOM ready, ensuring initialization...');
    initializeTaskManagerV10();
});

// Fallback sur window.load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TaskManager] Fallback initialization...');
            initializeTaskManagerV10();
        }
    }, 1000);
});
