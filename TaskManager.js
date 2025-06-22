// TaskManager Pro v11 - Optimisé avec nouveaux statuts et checklist

class TaskManager {
    constructor() {
        this.tasks = [];
        this.initialized = false;
        this.selectedTasks = new Set();
        this.init();
    }

    async init() {
        try {
            await this.loadTasks();
            this.initialized = true;
            console.log('[TM] Init OK:', this.tasks.length, 'tasks');
        } catch (e) {
            console.error('[TM] Init error:', e);
            this.tasks = [];
            this.initialized = true;
        }
    }

    async loadTasks() {
        try {
            const saved = localStorage.getItem('emailsort_tasks');
            if (saved) {
                this.tasks = JSON.parse(saved).map(t => this.ensureTaskProps(t));
            } else {
                this.generateSampleTasks();
            }
        } catch (e) {
            console.error('[TM] Load error:', e);
            this.tasks = [];
        }
    }

    ensureTaskProps(t) {
        const now = new Date().toISOString();
        return {
            id: t.id || this.genId(),
            title: t.title || 'Tâche sans titre',
            description: t.description || '',
            priority: t.priority || 'medium',
            status: t.status || 'todo', // todo, in-progress, completed, waiting, follow-up, blocked
            dueDate: t.dueDate || null,
            category: t.category || 'other',
            client: t.client || 'Interne',
            tags: t.tags || [],
            
            // Checklist
            checklist: t.checklist || [],
            checklistProgress: t.checklistProgress || 0,
            
            // Email
            hasEmail: t.hasEmail || false,
            emailId: t.emailId || null,
            emailFrom: t.emailFrom || null,
            emailFromName: t.emailFromName || null,
            emailSubject: t.emailSubject || null,
            emailContent: t.emailContent || '',
            emailHtmlContent: t.emailHtmlContent || '',
            emailDomain: t.emailDomain || null,
            emailDate: t.emailDate || null,
            emailReplied: t.emailReplied || false,
            needsReply: t.needsReply || false,
            hasAttachments: t.hasAttachments || false,
            
            // IA
            summary: t.summary || '',
            actions: t.actions || [],
            keyInfo: t.keyInfo || [],
            risks: t.risks || [],
            aiAnalysis: t.aiAnalysis || null,
            suggestedReplies: t.suggestedReplies || (t.hasEmail ? this.genBasicReplies(t) : []),
            aiRepliesGenerated: t.aiRepliesGenerated || false,
            aiRepliesGeneratedAt: t.aiRepliesGeneratedAt || null,
            
            // Timestamps
            createdAt: t.createdAt || now,
            updatedAt: t.updatedAt || now,
            completedAt: t.completedAt || null,
            method: t.method || 'manual'
        };
    }

    genBasicReplies(t) {
        if (!t.hasEmail || !t.emailFrom) return [];
        const name = t.emailFromName || t.emailFrom.split('@')[0] || 'l\'expéditeur';
        const subj = t.emailSubject || 'votre message';
        const now = new Date().toISOString();
        
        return [
            {
                tone: 'professionnel',
                subject: `Re: ${subj}`,
                content: `Bonjour ${name},\n\nMerci pour votre message concernant "${subj}".\n\nJ'ai bien pris connaissance de votre demande et je m'en occupe rapidement.\n\nCordialement,\n[Votre nom]`,
                description: 'Réponse professionnelle standard',
                generatedBy: 'basic-template',
                generatedAt: now
            },
            {
                tone: 'détaillé',
                subject: `Re: ${subj} - Réponse détaillée`,
                content: `Bonjour ${name},\n\nJe vous confirme la bonne réception de votre message.\n\nJ'étudie attentivement votre demande et je vous recontacte rapidement avec les éléments nécessaires.\n\nN'hésitez pas à me recontacter si vous avez des questions complémentaires.\n\nCordialement,\n[Votre nom]`,
                description: 'Réponse complète et détaillée',
                generatedBy: 'basic-template',
                generatedAt: now
            }
        ];
    }

    generateSampleTasks() {
        this.tasks = [
            {
                id: 's1',
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
                dueDate: '2025-06-20',
                needsReply: true,
                summary: 'Validation urgente de la campagne marketing Q2 avec budget de 50k€',
                actions: [
                    { text: 'Valider les visuels de la campagne', deadline: null },
                    { text: 'Confirmer le budget alloué', deadline: '2025-06-18' },
                    { text: 'Définir les dates de lancement', deadline: null }
                ],
                keyInfo: ['Budget proposé : 50k€', 'Cible : 25-45 ans', 'Canaux : LinkedIn, Google Ads'],
                risks: ['Deadline serrée pour le lancement', 'Coordination avec l\'équipe commerciale requise'],
                checklist: [
                    { id: 'c1', text: 'Réviser les visuels', checked: false },
                    { id: 'c2', text: 'Analyser le budget', checked: false },
                    { id: 'c3', text: 'Coordonner avec commercial', checked: false }
                ],
                method: 'ai'
            },
            {
                id: 's2',
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
                keyInfo: ['Résultats Q1 en hausse de 15%', 'Nouveau client majeur acquis', 'Équipe agrandie de 3 personnes'],
                checklist: [
                    { id: 'c1', text: 'Données financières', checked: true },
                    { id: 'c2', text: 'Graphiques', checked: false }
                ],
                checklistProgress: 50,
                method: 'manual'
            },
            {
                id: 's3',
                title: 'Projet en attente de validation client',
                priority: 'high',
                status: 'waiting',
                category: 'work',
                client: 'TechCorp',
                description: 'En attente de retour client sur la proposition technique',
                dueDate: '2025-06-30',
                method: 'manual'
            },
            {
                id: 's4',
                title: 'Relancer fournisseur pour devis',
                priority: 'urgent',
                status: 'follow-up',
                category: 'work',
                client: 'Interne',
                description: 'Relancer le fournisseur pour obtenir le devis matériel',
                checklist: [
                    { id: 'c1', text: 'Email envoyé', checked: true },
                    { id: 'c2', text: 'Relance téléphonique', checked: false }
                ],
                checklistProgress: 50,
                method: 'manual'
            },
            {
                id: 's5',
                title: 'Migration serveur bloquée',
                priority: 'urgent',
                status: 'blocked',
                category: 'work',
                client: 'IT',
                description: 'Migration bloquée en attente des accès administrateur',
                dueDate: '2025-06-18',
                risks: ['Retard sur le planning', 'Impact sur les autres projets'],
                method: 'manual'
            }
        ].map(t => this.ensureTaskProps(t));
        
        this.saveTasks();
    }

    // CRUD
    createTask(data) {
        const task = this.ensureTaskProps({
            ...data,
            id: data.id || this.genId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emit('create', task);
        return task;
    }

    createTaskFromEmail(data, email = null) {
        const task = this.ensureTaskProps({
            ...data,
            id: data.id || this.genId(),
            hasEmail: true,
            emailContent: this.extractEmailContent(email, data),
            emailHtmlContent: this.extractHtmlContent(email, data),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emit('create', task);
        return task;
    }

    updateTask(id, updates) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1) return null;
        
        // Mise à jour checklist progress si checklist modifiée
        if (updates.checklist) {
            const checked = updates.checklist.filter(item => item.checked).length;
            updates.checklistProgress = updates.checklist.length > 0 
                ? Math.round((checked / updates.checklist.length) * 100) 
                : 0;
        }
        
        this.tasks[idx] = this.ensureTaskProps({
            ...this.tasks[idx],
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        if (updates.status === 'completed' && !this.tasks[idx].completedAt) {
            this.tasks[idx].completedAt = new Date().toISOString();
        }
        
        this.saveTasks();
        this.emit('update', this.tasks[idx]);
        return this.tasks[idx];
    }

    deleteTask(id) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1) return null;
        
        const deleted = this.tasks.splice(idx, 1)[0];
        this.saveTasks();
        this.emit('delete', deleted);
        return deleted;
    }

    getTask(id) {
        return this.tasks.find(t => t.id === id);
    }

    getAllTasks() {
        return [...this.tasks];
    }

    // Checklist
    addChecklistItem(taskId, text) {
        const task = this.getTask(taskId);
        if (!task) return null;
        
        const item = {
            id: 'chk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: text,
            checked: false
        };
        
        const checklist = [...(task.checklist || []), item];
        return this.updateTask(taskId, { checklist });
    }

    toggleChecklistItem(taskId, itemId) {
        const task = this.getTask(taskId);
        if (!task || !task.checklist) return null;
        
        const checklist = task.checklist.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        
        return this.updateTask(taskId, { checklist });
    }

    removeChecklistItem(taskId, itemId) {
        const task = this.getTask(taskId);
        if (!task || !task.checklist) return null;
        
        const checklist = task.checklist.filter(item => item.id !== itemId);
        return this.updateTask(taskId, { checklist });
    }

    // Filtrage & Tri
    filterTasks(filters = {}) {
        let filtered = [...this.tasks];
        
        const filterMap = {
            status: (t, v) => v === 'all' ? true : t.status === v,
            priority: (t, v) => v === 'all' ? true : t.priority === v,
            category: (t, v) => v === 'all' ? true : t.category === v,
            client: (t, v) => v === 'all' ? true : t.client === v,
            search: (t, v) => !v ? true : [t.title, t.description, t.emailFromName, t.client]
                .filter(Boolean).some(s => s.toLowerCase().includes(v.toLowerCase())),
            overdue: (t, v) => !v ? true : (t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < new Date()),
            needsReply: (t, v) => !v ? true : (t.needsReply || (t.hasEmail && !t.emailReplied && t.status !== 'completed'))
        };
        
        Object.entries(filters).forEach(([key, value]) => {
            if (filterMap[key] && value) {
                filtered = filtered.filter(t => filterMap[key](t, value));
            }
        });
        
        return this.sortTasks(filtered, filters.sortBy || 'created');
    }

    sortTasks(tasks, sortBy) {
        const sorted = [...tasks];
        const sortMap = {
            priority: (a, b) => {
                const order = { urgent: 0, high: 1, medium: 2, low: 3 };
                return order[a.priority] - order[b.priority];
            },
            dueDate: (a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            },
            title: (a, b) => a.title.localeCompare(b.title),
            client: (a, b) => a.client.localeCompare(b.client),
            updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
            created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            progress: (a, b) => (b.checklistProgress || 0) - (a.checklistProgress || 0)
        };
        
        sorted.sort(sortMap[sortBy] || sortMap.created);
        return sorted;
    }

    // Stats
    getStats() {
        const byStatus = {
            todo: 0,
            'in-progress': 0,
            completed: 0,
            waiting: 0,
            'follow-up': 0,
            blocked: 0
        };
        
        this.tasks.forEach(t => {
            if (byStatus[t.status] !== undefined) byStatus[t.status]++;
        });

        return {
            total: this.tasks.length,
            byStatus,
            todo: byStatus.todo,
            inProgress: byStatus['in-progress'],
            completed: byStatus.completed,
            waiting: byStatus.waiting,
            followUp: byStatus['follow-up'],
            blocked: byStatus.blocked,
            overdue: this.tasks.filter(t => 
                t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < new Date()
            ).length,
            needsReply: this.tasks.filter(t => 
                t.needsReply || (t.hasEmail && !t.emailReplied && t.status !== 'completed')
            ).length
        };
    }

    // Utils
    genId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    extractEmailContent(email, data) {
        if (data.emailContent?.length > 50) return data.emailContent;
        if (email?.body?.content) return this.cleanText(email.body.content);
        if (email?.bodyPreview) return email.bodyPreview;
        return data.emailContent || '';
    }

    extractHtmlContent(email, data) {
        if (data.emailHtmlContent?.length > 50) return data.emailHtmlContent;
        if (email?.body?.contentType === 'html' && email?.body?.content) {
            return this.cleanHtml(email.body.content);
        }
        return this.textToHtml(this.extractEmailContent(email, data), email);
    }

    cleanText(content) {
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

    cleanHtml(html) {
        if (!html) return '';
        return `<div class="email-content-viewer" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${
            html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '')
                .replace(/javascript:/gi, '')
        }</div>`;
    }

    textToHtml(text, email) {
        if (!text) return '';
        const info = {
            name: email?.from?.emailAddress?.name || 'Expéditeur',
            email: email?.from?.emailAddress?.address || '',
            subject: email?.subject || 'Sans sujet',
            date: email?.receivedDateTime ? new Date(email.receivedDateTime).toLocaleString('fr-FR') : ''
        };
        
        const content = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        return `<div class="email-content-viewer" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                    <strong>De:</strong> ${info.name} &lt;${info.email}&gt;<br>
                    <strong>Date:</strong> ${info.date}<br>
                    <strong>Sujet:</strong> ${info.subject}
                </div>
            </div>
            <div style="font-size: 14px; line-height: 1.8;">${content}</div>
        </div>`;
    }

    saveTasks() {
        try {
            localStorage.setItem('emailsort_tasks', JSON.stringify(this.tasks));
            return true;
        } catch (e) {
            console.error('[TM] Save error:', e);
            return false;
        }
    }

    emit(action, task) {
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('taskUpdate', {
                detail: { action, task }
            }));
        }
    }
}

// Vue des tâches optimisée
class TasksView {
    constructor() {
        this.filters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            search: '',
            sortBy: 'created'
        };
        
        this.selectedTasks = new Set();
        this.viewMode = 'normal';
        this.showCompleted = false;
        this.showAdvFilters = false;
        
        window.addEventListener('taskUpdate', () => this.refresh());
    }

    render(container) {
        if (!container) return;

        if (!window.taskManager?.initialized) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-icon"><i class="fas fa-spinner fa-spin"></i></div>
                    <p>Chargement des tâches...</p>
                </div>
            `;
            setTimeout(() => {
                if (window.taskManager?.initialized) this.render(container);
            }, 500);
            return;
        }

        const stats = window.taskManager.getStats();
        const selCount = this.selectedTasks.size;
        
        container.innerHTML = `
            <div class="tasks-page-v11">
                <div class="controls-section">
                    <!-- Ligne 1 : Recherche compacte + Modes vue + Actions principales -->
                    <div class="main-controls-line">
                        <div class="search-section-compact">
                            <div class="search-box-compact">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" 
                                       class="search-input-compact" 
                                       id="taskSearchInput"
                                       placeholder="Rechercher..." 
                                       value="${this.filters.search}">
                                ${this.filters.search ? `
                                    <button class="search-clear" onclick="window.tasksView.clearSearch()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <div class="view-modes">
                            ${['minimal', 'normal', 'detailed'].map(mode => `
                                <button class="view-mode ${this.viewMode === mode ? 'active' : ''}" 
                                        onclick="window.tasksView.changeViewMode('${mode}')">
                                    ${mode === 'minimal' ? 'Minimal' : mode === 'normal' ? 'Normal' : 'Détaillé'}
                                </button>
                            `).join('')}
                        </div>

                        <div class="main-actions">
                            ${selCount > 0 ? `
                                <div class="selection-panel">
                                    <span class="selection-count">${selCount}</span>
                                    <button class="btn-action btn-clear" onclick="window.tasksView.clearSelection()" title="Effacer">
                                        <i class="fas fa-times"></i>
                                    </button>
                                    <button class="btn-action btn-bulk" onclick="window.tasksView.bulkActions()" title="Actions">
                                        <i class="fas fa-tasks"></i>
                                        <span class="count-badge">${selCount}</span>
                                    </button>
                                </div>
                            ` : ''}
                            
                            <button class="btn-action btn-select-all" onclick="window.tasksView.selectAllVisible()" title="Tout sélectionner">
                                <i class="fas fa-check-square"></i>
                            </button>

                            <button class="btn-action btn-refresh" onclick="window.tasksView.refreshTasks()" title="Actualiser">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            
                            <button class="btn-action btn-new" onclick="window.tasksView.showCreateModal()" title="Nouvelle tâche">
                                <i class="fas fa-plus"></i>
                            </button>
                            
                            <button class="btn-action btn-filters ${this.showAdvFilters ? 'active' : ''}" 
                                    onclick="window.tasksView.toggleAdvFilters()" 
                                    title="Filtres avancés">
                                <i class="fas fa-filter"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Ligne 2 : Filtres de statuts uniquement -->
                    <div class="status-filters-line">
                        <div class="status-filters">
                            ${this.buildStatusPills(stats)}
                        </div>
                    </div>
                </div>

                <!-- Filtres avancés -->
                <div class="advanced-filters-panel ${this.showAdvFilters ? 'show' : ''}" id="advFiltersPanel">
                    <div class="adv-filters-grid">
                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-flag"></i> Priorité
                            </label>
                            <select class="filter-select" onchange="window.tasksView.updateFilter('priority', this.value)">
                                <option value="all">Toutes</option>
                                ${['urgent', 'high', 'medium', 'low'].map(p => `
                                    <option value="${p}" ${this.filters.priority === p ? 'selected' : ''}>
                                        ${this.getPriorityIcon(p)} ${this.getPriorityLabel(p)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-building"></i> Client
                            </label>
                            <select class="filter-select" onchange="window.tasksView.updateFilter('client', this.value)">
                                ${this.buildClientOptions()}
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="fas fa-sort"></i> Trier par
                            </label>
                            <select class="filter-select" onchange="window.tasksView.updateFilter('sortBy', this.value)">
                                ${[
                                    ['created', 'Date création'],
                                    ['priority', 'Priorité'],
                                    ['dueDate', 'Échéance'],
                                    ['title', 'Titre A-Z'],
                                    ['client', 'Client'],
                                    ['progress', 'Progression']
                                ].map(([v, l]) => `
                                    <option value="${v}" ${this.filters.sortBy === v ? 'selected' : ''}>${l}</option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="filter-actions">
                            <button class="btn-action btn-reset" onclick="window.tasksView.resetFilters()">
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
        this.setupListeners();
    }

    buildStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Tous', icon: '📋', count: stats.total },
            { id: 'todo', name: 'À faire', icon: '⏳', count: stats.todo },
            { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.inProgress },
            { id: 'waiting', name: 'En attente', icon: '⏸️', count: stats.waiting },
            { id: 'follow-up', name: 'À relancer', icon: '🔔', count: stats.followUp },
            { id: 'blocked', name: 'Bloqué', icon: '🚫', count: stats.blocked },
            { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue },
            { id: 'needsReply', name: 'À répondre', icon: '📧', count: stats.needsReply },
            { id: 'completed', name: 'Terminées', icon: '✅', count: stats.completed }
        ];

        return pills.map(p => `
            <button class="status-pill ${this.isFilterActive(p.id) ? 'active' : ''}" 
                    onclick="window.tasksView.quickFilter('${p.id}')"
                    title="${p.name}: ${p.count}">
                <span class="pill-icon">${p.icon}</span>
                <span class="pill-text">${p.name}</span>
                <span class="pill-count">${p.count}</span>
            </button>
        `).join('');
    }

    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.filters);
        const filtered = this.showCompleted ? tasks : tasks.filter(t => t.status !== 'completed');
        
        if (filtered.length === 0) return this.renderEmpty();

        switch (this.viewMode) {
            case 'minimal': return this.renderMinimal(filtered);
            case 'detailed': return this.renderDetailed(filtered);
            default: return this.renderNormal(filtered);
        }
    }

    renderMinimal(tasks) {
        return `
            <div class="tasks-minimal-list">
                ${tasks.map(t => this.renderMinimalTask(t)).join('')}
            </div>
        `;
    }

    renderMinimalTask(t) {
        const sel = this.selectedTasks.has(t.id);
        const done = t.status === 'completed';
        const due = this.formatDueDate(t.dueDate);
        
        return `
            <div class="task-minimal ${done ? 'completed' : ''} ${sel ? 'selected' : ''}" 
                 data-task-id="${t.id}"
                 onclick="window.tasksView.handleClick(event, '${t.id}')">
                
                <div class="task-content-line">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${sel ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleSelect('${t.id}')">
                    
                    <div class="task-info">
                        <span class="task-title">${this.esc(t.title)}</span>
                        <span class="task-client">${this.esc(t.client === 'Externe' ? (t.emailFromName || t.emailFrom || 'Société') : t.client)}</span>
                    </div>
                    
                    <div class="task-meta">
                        ${t.checklist && t.checklist.length > 0 ? `
                            <span class="checklist-progress" title="${t.checklistProgress}% complété">
                                <i class="fas fa-tasks"></i> ${t.checklistProgress}%
                            </span>
                        ` : ''}
                        <span class="task-deadline ${due.className}">
                            ${due.text || 'Pas d\'échéance'}
                        </span>
                    </div>
                    
                    <div class="task-actions">
                        ${this.renderActions(t)}
                    </div>
                </div>
            </div>
        `;
    }

    renderNormal(tasks) {
        return `
            <div class="tasks-normal-list">
                ${tasks.map(t => this.renderNormalTask(t)).join('')}
            </div>
        `;
    }

    renderNormalTask(t) {
        const sel = this.selectedTasks.has(t.id);
        const done = t.status === 'completed';
        const due = this.formatDueDate(t.dueDate);
        
        return `
            <div class="task-normal ${done ? 'completed' : ''} ${sel ? 'selected' : ''}" 
                 data-task-id="${t.id}"
                 onclick="window.tasksView.handleClick(event, '${t.id}')">
                
                <div class="task-content-line">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${sel ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleSelect('${t.id}')">
                    
                    <div class="priority-bar" style="background-color: ${this.getPriorityColor(t.priority)}"></div>
                    
                    <div class="task-main">
                        <div class="task-header">
                            <h3 class="task-title">${this.esc(t.title)}</h3>
                            <div class="task-badges">
                                <span class="status-badge status-${t.status}">
                                    ${this.getStatusIcon(t.status)} ${this.getStatusLabel(t.status)}
                                </span>
                                ${t.checklist && t.checklist.length > 0 ? `
                                    <span class="checklist-badge" title="${t.checklistProgress}% complété">
                                        <i class="fas fa-tasks"></i> ${t.checklist.filter(i => i.checked).length}/${t.checklist.length}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="task-details">
                            <span class="task-client">
                                ${this.esc(t.client === 'Externe' ? (t.emailFromName || t.emailFrom || 'Société') : t.client)}
                            </span>
                            <span class="task-deadline ${due.className}">
                                ${due.text || 'Pas d\'échéance'}
                            </span>
                        </div>
                        
                        ${t.checklist && t.checklist.length > 0 ? `
                            <div class="task-checklist-inline">
                                ${t.checklist.slice(0, 3).map(item => `
                                    <label class="checklist-item-inline ${item.checked ? 'checked' : ''}"
                                           onclick="event.stopPropagation()">
                                        <input type="checkbox" 
                                               ${item.checked ? 'checked' : ''}
                                               onchange="event.stopPropagation(); window.tasksView.toggleCheckItem('${t.id}', '${item.id}')">
                                        <span>${this.esc(item.text)}</span>
                                    </label>
                                `).join('')}
                                ${t.checklist.length > 3 ? `
                                    <span class="checklist-more">+${t.checklist.length - 3} autres...</span>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="task-actions">
                        ${this.renderActions(t)}
                        <button class="action-btn add-check" 
                                onclick="event.stopPropagation(); window.tasksView.quickAddCheckItem('${t.id}')"
                                title="Ajouter checklist">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderDetailed(tasks) {
        return `
            <div class="tasks-detailed-grid">
                ${tasks.map(t => this.renderDetailedTask(t)).join('')}
            </div>
        `;
    }

    renderDetailedTask(t) {
        const sel = this.selectedTasks.has(t.id);
        const done = t.status === 'completed';
        const due = this.formatDueDate(t.dueDate);
        
        return `
            <div class="task-detailed ${done ? 'completed' : ''} ${sel ? 'selected' : ''}" 
                 data-task-id="${t.id}">
                
                <div class="task-detailed-header">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${sel ? 'checked' : ''}
                           onclick="window.tasksView.toggleSelect('${t.id}')">
                    
                    <div class="task-badges-group">
                        <span class="priority-badge priority-${t.priority}">
                            ${this.getPriorityIcon(t.priority)} ${this.getPriorityLabel(t.priority)}
                        </span>
                        <span class="status-badge status-${t.status}">
                            ${this.getStatusIcon(t.status)} ${this.getStatusLabel(t.status)}
                        </span>
                    </div>
                </div>
                
                <div class="task-detailed-content">
                    <h3 class="task-title" onclick="window.tasksView.showDetails('${t.id}')">${this.esc(t.title)}</h3>
                    <p class="task-description">${this.esc(t.description.substring(0, 150))}${t.description.length > 150 ? '...' : ''}</p>
                    
                    ${t.checklist && t.checklist.length > 0 ? `
                        <div class="checklist-preview">
                            <div class="checklist-progress-bar">
                                <div class="progress-fill" style="width: ${t.checklistProgress}%"></div>
                            </div>
                            <span class="checklist-info">
                                <i class="fas fa-tasks"></i> ${t.checklist.filter(i => i.checked).length}/${t.checklist.length} tâches
                            </span>
                        </div>
                    ` : ''}
                    
                    <div class="task-meta-grid">
                        <div class="meta-item">
                            <span>${this.esc(t.client === 'Externe' ? (t.emailFromName || t.emailFrom || 'Société') : t.client)}</span>
                        </div>
                        <div class="meta-item deadline-centered ${due.className}">
                            <span>${due.text || 'Pas d\'échéance'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="task-detailed-actions">
                    ${this.renderDetailedActions(t)}
                </div>
            </div>
        `;
    }

    renderActions(t) {
        const actions = [];
        
        if (t.status !== 'completed') {
            actions.push(`
                <button class="action-btn complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${t.id}')"
                        title="Terminer">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn edit" 
                    onclick="event.stopPropagation(); window.tasksView.showEditModal('${t.id}')"
                    title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
        `);
        
        actions.push(`
            <button class="action-btn details" 
                    onclick="event.stopPropagation(); window.tasksView.showDetails('${t.id}')"
                    title="Détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        if (t.hasEmail && t.suggestedReplies?.length > 0) {
            actions.push(`
                <button class="action-btn reply" 
                        onclick="event.stopPropagation(); window.tasksView.showReplies('${t.id}')"
                        title="Réponses">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        return actions.join('');
    }

    renderDetailedActions(t) {
        const actions = [];
        
        if (t.status !== 'completed') {
            actions.push(`
                <button class="btn-detailed complete" 
                        onclick="window.tasksView.markComplete('${t.id}')">
                    <i class="fas fa-check"></i>
                    Terminé
                </button>
            `);
        }
        
        actions.push(`
            <button class="btn-detailed edit" 
                    onclick="window.tasksView.showEditModal('${t.id}')">
                <i class="fas fa-edit"></i>
                Modifier
            </button>
        `);
        
        actions.push(`
            <button class="btn-detailed details" 
                    onclick="window.tasksView.showDetails('${t.id}')">
                <i class="fas fa-eye"></i>
                Détails
            </button>
        `);
        
        return actions.join('');
    }

    // Modales
    showCreateModal() {
        this.closeModals();
        
        const id = 'create_modal_' + Date.now();
        const html = `
            <div id="${id}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus"></i> Créer une nouvelle tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildCreateForm()}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${id}')">
                            Annuler
                        </button>
                        <button class="btn-modal btn-primary" onclick="window.tasksView.createTask('${id}')">
                            <i class="fas fa-plus"></i> Créer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const input = document.getElementById('new-task-title');
            if (input) input.focus();
        }, 100);
    }

    buildCreateForm() {
        return `
            <div class="form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Titre *</label>
                        <input type="text" id="new-task-title" class="form-input" 
                               placeholder="Titre de la tâche" required />
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="new-task-desc" class="form-textarea" rows="4" 
                                  placeholder="Description..."></textarea>
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
                        <label>Statut</label>
                        <select id="new-task-status" class="form-select">
                            <option value="todo" selected>⏳ À faire</option>
                            <option value="in-progress">🔄 En cours</option>
                            <option value="waiting">⏸️ En attente</option>
                            <option value="follow-up">🔔 À relancer</option>
                            <option value="blocked">🚫 Bloqué</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Client/Projet</label>
                        <input type="text" id="new-task-client" class="form-input" 
                               placeholder="Client" value="Interne" />
                    </div>
                    <div class="form-group">
                        <label>Échéance</label>
                        <input type="date" id="new-task-due" class="form-input" />
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-tasks"></i> Checklist initiale</h3>
                    <div id="new-checklist-items"></div>
                    <button type="button" class="btn-add-checklist" onclick="window.tasksView.addChecklistInput()">
                        <i class="fas fa-plus"></i> Ajouter un élément
                    </button>
                </div>
            </div>
        `;
    }

    addChecklistInput() {
        const container = document.getElementById('new-checklist-items');
        const id = 'chk_input_' + Date.now();
        container.insertAdjacentHTML('beforeend', `
            <div class="checklist-input-row" id="${id}">
                <input type="text" class="checklist-input" placeholder="Élément de checklist">
                <button type="button" class="btn-remove-checklist" onclick="document.getElementById('${id}').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
    }

    createTask(modalId) {
        const title = document.getElementById('new-task-title')?.value?.trim();
        const desc = document.getElementById('new-task-desc')?.value?.trim();
        const priority = document.getElementById('new-task-priority')?.value;
        const status = document.getElementById('new-task-status')?.value;
        const due = document.getElementById('new-task-due')?.value;
        const client = document.getElementById('new-task-client')?.value?.trim();

        if (!title) {
            this.toast('Le titre est requis', 'warning');
            return;
        }

        // Récupérer les éléments de checklist
        const checklist = [];
        document.querySelectorAll('#new-checklist-items .checklist-input').forEach(input => {
            const text = input.value.trim();
            if (text) {
                checklist.push({
                    id: 'chk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    text: text,
                    checked: false
                });
            }
        });

        const data = {
            title,
            description: desc || '',
            priority,
            status,
            dueDate: due || null,
            client: client || 'Interne',
            category: 'work',
            checklist,
            checklistProgress: 0,
            method: 'manual'
        };

        try {
            window.taskManager.createTask(data);
            this.closeModal(modalId);
            this.toast('Tâche créée', 'success');
            this.refresh();
        } catch (e) {
            console.error('[TV] Create error:', e);
            this.toast('Erreur lors de la création', 'error');
        }
    }

    showEditModal(taskId) {
        const t = window.taskManager.getTask(taskId);
        if (!t) return;

        this.closeModals();
        
        const id = 'edit_modal_' + Date.now();
        const html = `
            <div id="${id}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-edit"></i> Modifier la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildEditForm(t)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${id}')">
                            Annuler
                        </button>
                        <button class="btn-modal btn-primary" onclick="window.tasksView.saveTask('${t.id}', '${id}')">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
    }

    buildEditForm(t) {
        return `
            <div class="form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Titre *</label>
                        <input type="text" id="edit-title" class="form-input" 
                               value="${this.esc(t.title)}" required />
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="edit-desc" class="form-textarea" rows="4">${this.esc(t.description)}</textarea>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Priorité</label>
                        <select id="edit-priority" class="form-select">
                            ${['low', 'medium', 'high', 'urgent'].map(p => `
                                <option value="${p}" ${t.priority === p ? 'selected' : ''}>
                                    ${this.getPriorityIcon(p)} ${this.getPriorityLabel(p)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Statut</label>
                        <select id="edit-status" class="form-select">
                            ${['todo', 'in-progress', 'waiting', 'follow-up', 'blocked', 'completed'].map(s => `
                                <option value="${s}" ${t.status === s ? 'selected' : ''}>
                                    ${this.getStatusIcon(s)} ${this.getStatusLabel(s)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Client/Projet</label>
                        <input type="text" id="edit-client" class="form-input" 
                               value="${this.esc(t.client)}" />
                    </div>
                    <div class="form-group">
                        <label>Échéance</label>
                        <input type="date" id="edit-due" class="form-input" 
                               value="${t.dueDate || ''}" />
                    </div>
                </div>
                
                ${t.hasEmail ? `
                    <div class="form-section">
                        <h3><i class="fas fa-envelope"></i> Email</h3>
                        <div class="email-info-ro">
                            <div><strong>De:</strong> ${this.esc(t.emailFromName || t.emailFrom || 'Inconnu')}</div>
                            <div><strong>Sujet:</strong> ${this.esc(t.emailSubject || 'Sans sujet')}</div>
                            <div>
                                <label>
                                    <input type="checkbox" id="edit-needs-reply" ${t.needsReply ? 'checked' : ''} />
                                    Réponse requise
                                </label>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <div class="form-section">
                    <h3><i class="fas fa-tasks"></i> Checklist</h3>
                    <div id="edit-checklist-items">
                        ${(t.checklist || []).map(item => `
                            <div class="checklist-edit-row" data-id="${item.id}">
                                <input type="checkbox" ${item.checked ? 'checked' : ''} 
                                       onchange="window.tasksView.toggleCheckItem('${t.id}', '${item.id}')">
                                <input type="text" class="checklist-input" value="${this.esc(item.text)}">
                                <button type="button" class="btn-remove-checklist" 
                                        onclick="window.tasksView.removeCheckItem('${t.id}', '${item.id}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" class="btn-add-checklist" 
                            onclick="window.tasksView.addCheckItemToTask('${t.id}')">
                        <i class="fas fa-plus"></i> Ajouter un élément
                    </button>
                </div>
            </div>
        `;
    }

    toggleCheckItem(taskId, itemId) {
        window.taskManager.toggleChecklistItem(taskId, itemId);
        this.refresh();
    }

    quickAddCheckItem(taskId) {
        const text = prompt('Nouvel élément de checklist:');
        if (!text) return;
        
        window.taskManager.addChecklistItem(taskId, text);
        this.refresh();
        this.toast('Élément ajouté', 'success');
    }

    removeCheckItem(taskId, itemId) {
        window.taskManager.removeChecklistItem(taskId, itemId);
        document.querySelector(`.checklist-edit-row[data-id="${itemId}"]`)?.remove();
    }

    addCheckItemToTask(taskId) {
        const text = prompt('Nouvel élément de checklist:');
        if (!text) return;
        
        const task = window.taskManager.addChecklistItem(taskId, text);
        if (task) {
            // Rafraîchir la liste
            const container = document.getElementById('edit-checklist-items');
            const newItem = task.checklist[task.checklist.length - 1];
            container.insertAdjacentHTML('beforeend', `
                <div class="checklist-edit-row" data-id="${newItem.id}">
                    <input type="checkbox" ${newItem.checked ? 'checked' : ''} 
                           onchange="window.tasksView.toggleCheckItem('${taskId}', '${newItem.id}')">
                    <input type="text" class="checklist-input" value="${this.esc(newItem.text)}">
                    <button type="button" class="btn-remove-checklist" 
                            onclick="window.tasksView.removeCheckItem('${taskId}', '${newItem.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
        }
    }

    saveTask(taskId, modalId) {
        const title = document.getElementById('edit-title')?.value?.trim();
        const desc = document.getElementById('edit-desc')?.value?.trim();
        const priority = document.getElementById('edit-priority')?.value;
        const status = document.getElementById('edit-status')?.value;
        const client = document.getElementById('edit-client')?.value?.trim();
        const due = document.getElementById('edit-due')?.value;
        const needsReply = document.getElementById('edit-needs-reply')?.checked;

        if (!title) {
            this.toast('Le titre est requis', 'warning');
            return;
        }

        // Récupérer la checklist mise à jour
        const checklist = [];
        document.querySelectorAll('#edit-checklist-items .checklist-edit-row').forEach(row => {
            const id = row.dataset.id;
            const text = row.querySelector('.checklist-input').value.trim();
            const checked = row.querySelector('input[type="checkbox"]').checked;
            if (text) {
                checklist.push({ id, text, checked });
            }
        });

        const updates = {
            title,
            description: desc,
            priority,
            status,
            client: client || 'Interne',
            dueDate: due || null,
            needsReply: needsReply || false,
            checklist
        };

        try {
            window.taskManager.updateTask(taskId, updates);
            this.closeModal(modalId);
            this.toast('Tâche mise à jour', 'success');
            this.refresh();
        } catch (e) {
            console.error('Update error:', e);
            this.toast('Erreur lors de la mise à jour', 'error');
        }
    }

    showDetails(taskId) {
        const t = window.taskManager.getTask(taskId);
        if (!t) return;

        this.closeModals();
        
        const id = 'details_modal_' + Date.now();
        const html = `
            <div id="${id}" class="modal-overlay">
                <div class="modal-container modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-eye"></i> Détails de la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildDetailsContent(t)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${id}')">
                            Fermer
                        </button>
                        ${t.hasEmail && t.suggestedReplies?.length > 0 ? `
                            <button class="btn-modal btn-info" onclick="window.tasksView.showReplies('${t.id}')">
                                <i class="fas fa-reply"></i> Suggestions
                            </button>
                        ` : ''}
                        <button class="btn-modal btn-primary" onclick="window.tasksView.closeModal('${id}'); window.tasksView.showEditModal('${t.id}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        ${t.status !== 'completed' ? `
                            <button class="btn-modal btn-success" onclick="window.tasksView.markComplete('${t.id}'); window.tasksView.closeModal('${id}')">
                                <i class="fas fa-check"></i> Terminer
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
    }

    buildDetailsContent(t) {
        const due = this.formatDueDate(t.dueDate);
        
        return `
            <div class="task-details-content">
                <div class="details-header">
                    <h1 class="task-title-details">${this.esc(t.title)}</h1>
                    <div class="task-meta-badges">
                        <span class="priority-badge-details priority-${t.priority}">
                            ${this.getPriorityIcon(t.priority)} ${this.getPriorityLabel(t.priority)}
                        </span>
                        <span class="status-badge-details status-${t.status}">
                            ${this.getStatusIcon(t.status)} ${this.getStatusLabel(t.status)}
                        </span>
                        <span class="deadline-badge-details ${due.className}">
                            <i class="fas fa-calendar"></i>
                            ${due.text || 'Pas d\'échéance'}
                        </span>
                    </div>
                </div>

                ${t.description ? `
                    <div class="details-section">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <div class="description-content">
                            ${this.formatDesc(t.description)}
                        </div>
                    </div>
                ` : ''}

                <div class="details-section">
                    <h3><i class="fas fa-info-circle"></i> Informations</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Client:</strong>
                            <span>${this.esc(t.client)}</span>
                        </div>
                        <div class="info-item">
                            <strong>Créé le:</strong>
                            <span>${new Date(t.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="info-item">
                            <strong>Modifié le:</strong>
                            <span>${new Date(t.updatedAt).toLocaleString('fr-FR')}</span>
                        </div>
                        ${t.completedAt ? `
                            <div class="info-item">
                                <strong>Terminé le:</strong>
                                <span>${new Date(t.completedAt).toLocaleString('fr-FR')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${t.checklist && t.checklist.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-tasks"></i> Checklist (${t.checklistProgress}% complété)</h3>
                        <div class="checklist-detailed">
                            <div class="checklist-progress-bar-lg">
                                <div class="progress-fill" style="width: ${t.checklistProgress}%"></div>
                            </div>
                            <div class="checklist-items">
                                ${t.checklist.map(item => `
                                    <div class="checklist-item ${item.checked ? 'checked' : ''}">
                                        <i class="fas fa-${item.checked ? 'check-square' : 'square'}"></i>
                                        <span>${this.esc(item.text)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${t.hasEmail ? `
                    <div class="details-section">
                        <h3><i class="fas fa-envelope"></i> Email</h3>
                        <div class="email-details-grid">
                            <div class="email-detail-item">
                                <strong>De:</strong>
                                <span>${this.esc(t.emailFromName || t.emailFrom || 'Inconnu')}</span>
                            </div>
                            ${t.emailFrom ? `
                                <div class="email-detail-item">
                                    <strong>Email:</strong>
                                    <span>${this.esc(t.emailFrom)}</span>
                                </div>
                            ` : ''}
                            ${t.emailSubject ? `
                                <div class="email-detail-item">
                                    <strong>Sujet:</strong>
                                    <span>${this.esc(t.emailSubject)}</span>
                                </div>
                            ` : ''}
                            <div class="email-detail-item">
                                <strong>Réponse requise:</strong>
                                <span>${t.needsReply ? '✅ Oui' : '❌ Non'}</span>
                            </div>
                        </div>
                        
                        ${t.emailContent?.length > 100 ? `
                            <div class="email-content-section">
                                <h4>Contenu</h4>
                                <div class="email-content-box">
                                    ${t.emailHtmlContent || this.formatEmailContent(t.emailContent)}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${t.actions?.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-tasks"></i> Actions</h3>
                        <div class="actions-list-details">
                            ${t.actions.map((a, i) => `
                                <div class="action-item-details">
                                    <span class="action-number">${i + 1}</span>
                                    <span class="action-text">${this.esc(a.text)}</span>
                                    ${a.deadline ? `
                                        <span class="action-deadline">${this.formatDeadline(a.deadline)}</span>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${t.keyInfo?.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-lightbulb"></i> Infos clés</h3>
                        <div class="key-info-grid">
                            ${t.keyInfo.map(info => `
                                <div class="key-info-item">
                                    <i class="fas fa-chevron-right"></i>
                                    <span>${this.esc(info)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${t.risks?.length > 0 ? `
                    <div class="details-section attention-section">
                        <h3><i class="fas fa-exclamation-triangle"></i> Points d'attention</h3>
                        <div class="attention-list">
                            ${t.risks.map(risk => `
                                <div class="attention-item">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>${this.esc(risk)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showReplies(taskId) {
        const t = window.taskManager.getTask(taskId);
        if (!t || !t.suggestedReplies?.length) return;

        this.closeModals();
        
        const id = 'replies_modal_' + Date.now();
        const html = `
            <div id="${id}" class="modal-overlay">
                <div class="modal-container modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-reply-all"></i> Suggestions de Réponse</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="ai-suggestions-info">
                            <div class="ai-badge">
                                <i class="fas fa-robot"></i>
                                <span>Suggestions IA</span>
                            </div>
                            <p>Pour ${t.emailFromName || 'l\'expéditeur'}</p>
                        </div>
                        
                        <div class="replies-list">
                            ${t.suggestedReplies.map((r, i) => `
                                <div class="reply-card">
                                    <div class="reply-card-header">
                                        <div class="reply-tone-badge ${r.tone}">
                                            ${this.getReplyToneIcon(r.tone)} ${this.getReplyToneLabel(r.tone)}
                                        </div>
                                        <div class="reply-card-actions">
                                            <button class="btn-sm btn-secondary" onclick="window.tasksView.copyReply(${i}, '${taskId}')">
                                                <i class="fas fa-copy"></i> Copier
                                            </button>
                                            <button class="btn-sm btn-primary" onclick="window.tasksView.useReply('${taskId}', ${i})">
                                                <i class="fas fa-paper-plane"></i> Utiliser
                                            </button>
                                        </div>
                                    </div>
                                    <div class="reply-subject-line">
                                        <strong>Sujet:</strong> ${this.esc(r.subject)}
                                    </div>
                                    <div class="reply-content-preview">
                                        ${this.esc(r.content).replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${id}')">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        document.body.style.overflow = 'hidden';
    }

    async copyReply(idx, taskId) {
        const t = window.taskManager.getTask(taskId);
        if (!t?.suggestedReplies?.[idx]) return;

        const r = t.suggestedReplies[idx];
        const text = `Sujet: ${r.subject}\n\n${r.content}`;
        
        try {
            await navigator.clipboard.writeText(text);
            this.toast('Copié!', 'success');
        } catch (e) {
            console.error('Copy error:', e);
            this.toast('Erreur copie', 'error');
        }
    }

    useReply(taskId, idx) {
        const t = window.taskManager.getTask(taskId);
        if (!t?.suggestedReplies?.[idx]) return;

        const r = t.suggestedReplies[idx];
        const mailtoLink = `mailto:${t.emailFrom}?subject=${encodeURIComponent(r.subject)}&body=${encodeURIComponent(r.content)}`;
        
        window.open(mailtoLink);
        
        window.taskManager.updateTask(taskId, { 
            emailReplied: true,
            needsReply: false,
            status: t.status === 'todo' ? 'in-progress' : t.status
        });
        
        this.toast('Email ouvert', 'success');
        this.closeModals();
        this.refresh();
    }

    // Interactions
    selectAllVisible() {
        const tasks = window.taskManager.filterTasks(this.filters);
        const filtered = this.showCompleted ? tasks : tasks.filter(t => t.status !== 'completed');
        
        if (filtered.length === 0) {
            this.toast('Aucune tâche', 'info');
            return;
        }

        const allSel = filtered.every(t => this.selectedTasks.has(t.id));
        
        if (allSel) {
            filtered.forEach(t => this.selectedTasks.delete(t.id));
            this.toast('Désélectionné', 'info');
        } else {
            filtered.forEach(t => this.selectedTasks.add(t.id));
            this.toast(`${filtered.length} sélectionnée(s)`, 'success');
        }
        
        this.refresh();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.refresh();
        this.toast('Sélection effacée', 'info');
    }

    toggleSelect(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.refresh();
    }

    bulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const actions = [
            'Terminer',
            'Changer priorité',
            'Changer statut',
            'Supprimer',
            'Exporter'
        ];
        
        const action = prompt(`Actions pour ${this.selectedTasks.size} tâche(s):\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nNuméro:`);
        
        if (!action) return;
        
        const idx = parseInt(action) - 1;
        
        switch (idx) {
            case 0: // Terminer
                this.selectedTasks.forEach(id => {
                    window.taskManager.updateTask(id, { 
                        status: 'completed',
                        completedAt: new Date().toISOString()
                    });
                });
                this.toast(`${this.selectedTasks.size} terminée(s)`, 'success');
                this.clearSelection();
                break;
                
            case 1: // Priorité
                const p = prompt('Priorité:\n1. Basse\n2. Normale\n3. Haute\n4. Urgente\n\nNuméro:');
                const priorities = ['', 'low', 'medium', 'high', 'urgent'];
                if (p && priorities[parseInt(p)]) {
                    this.selectedTasks.forEach(id => {
                        window.taskManager.updateTask(id, { priority: priorities[parseInt(p)] });
                    });
                    this.toast('Priorité mise à jour', 'success');
                    this.clearSelection();
                }
                break;
                
            case 2: // Statut
                const s = prompt('Statut:\n1. À faire\n2. En cours\n3. En attente\n4. À relancer\n5. Bloqué\n6. Terminé\n\nNuméro:');
                const statuses = ['', 'todo', 'in-progress', 'waiting', 'follow-up', 'blocked', 'completed'];
                if (s && statuses[parseInt(s)]) {
                    this.selectedTasks.forEach(id => {
                        const updates = { status: statuses[parseInt(s)] };
                        if (updates.status === 'completed') {
                            updates.completedAt = new Date().toISOString();
                        }
                        window.taskManager.updateTask(id, updates);
                    });
                    this.toast('Statut mis à jour', 'success');
                    this.clearSelection();
                }
                break;
                
            case 3: // Supprimer
                if (confirm(`Supprimer ${this.selectedTasks.size} tâche(s) ?`)) {
                    this.selectedTasks.forEach(id => {
                        window.taskManager.deleteTask(id);
                    });
                    this.toast(`${this.selectedTasks.size} supprimée(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 4: // Exporter
                this.exportSelected();
                break;
        }
    }

    exportSelected() {
        const tasks = Array.from(this.selectedTasks).map(id => window.taskManager.getTask(id)).filter(Boolean);
        
        const csv = [
            ['Titre', 'Description', 'Priorité', 'Statut', 'Échéance', 'Client', 'Créé le', 'Progression'].join(','),
            ...tasks.map(t => [
                `"${t.title}"`,
                `"${t.description || ''}"`,
                t.priority,
                t.status,
                t.dueDate || '',
                t.client || '',
                new Date(t.createdAt).toLocaleDateString('fr-FR'),
                t.checklistProgress || 0
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `taches_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.toast('Export terminé', 'success');
        this.clearSelection();
    }

    // Utils
    changeViewMode(mode) {
        this.viewMode = mode;
        this.refresh();
    }

    clearSearch() {
        this.filters.search = '';
        const input = document.getElementById('taskSearchInput');
        if (input) input.value = '';
        this.refresh();
    }

    quickFilter(filterId) {
        this.filters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            search: this.filters.search,
            sortBy: this.filters.sortBy,
            overdue: false,
            needsReply: false
        };

        switch (filterId) {
            case 'all': break;
            case 'todo':
            case 'in-progress':
            case 'waiting':
            case 'follow-up':
            case 'blocked':
            case 'completed':
                this.filters.status = filterId;
                break;
            case 'overdue':
                this.filters.overdue = true;
                break;
            case 'needsReply':
                this.filters.needsReply = true;
                break;
        }

        this.refresh();
    }

    updateFilter(type, value) {
        this.filters[type] = value;
        this.refresh();
    }

    resetFilters() {
        this.filters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            search: '',
            sortBy: 'created'
        };
        
        const input = document.getElementById('taskSearchInput');
        if (input) input.value = '';
        
        document.querySelectorAll('.filter-select').forEach(sel => {
            if (sel.querySelector('option[value="all"]')) {
                sel.value = 'all';
            } else if (sel.id === 'sortByFilter') {
                sel.value = 'created';
            }
        });
        
        this.refresh();
        this.toast('Filtres réinitialisés', 'info');
    }

    toggleAdvFilters() {
        this.showAdvFilters = !this.showAdvFilters;
        
        const panel = document.getElementById('advFiltersPanel');
        const toggle = document.querySelector('.btn-filters');
        
        if (panel) panel.classList.toggle('show', this.showAdvFilters);
        if (toggle) {
            toggle.classList.toggle('active', this.showAdvFilters);
            const chevron = toggle.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (chevron) {
                chevron.classList.toggle('fa-chevron-down', !this.showAdvFilters);
                chevron.classList.toggle('fa-chevron-up', this.showAdvFilters);
            }
        }
    }

    buildClientOptions() {
        const tasks = window.taskManager.getAllTasks();
        const clients = new Set();
        
        tasks.forEach(t => {
            if (t.client) clients.add(t.client);
        });
        
        let opts = `<option value="all" ${this.filters.client === 'all' ? 'selected' : ''}>Tous</option>`;
        
        Array.from(clients).sort().forEach(c => {
            const count = tasks.filter(t => t.client === c).length;
            opts += `<option value="${c}" ${this.filters.client === c ? 'selected' : ''}>${c} (${count})</option>`;
        });
        
        return opts;
    }

    refresh() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        const stats = window.taskManager.getStats();
        document.querySelectorAll('.status-filters').forEach(c => {
            c.innerHTML = this.buildStatusPills(stats);
        });
        
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        const count = this.selectedTasks.size;
        const actionsDiv = document.querySelector('.main-actions');
        
        if (actionsDiv) {
            const existing = actionsDiv.querySelector('.selection-panel');
            
            if (count > 0) {
                const html = `
                    <div class="selection-panel">
                        <span class="selection-count">${count} sélectionné(s)</span>
                        <button class="btn-action btn-clear" onclick="window.tasksView.clearSelection()" title="Effacer">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn-action btn-bulk" onclick="window.tasksView.bulkActions()" title="Actions">
                            Actions
                            <span class="count-badge">${count}</span>
                        </button>
                    </div>
                `;
                
                if (existing) {
                    existing.outerHTML = html;
                } else {
                    actionsDiv.insertAdjacentHTML('afterbegin', html);
                }
            } else if (existing) {
                existing.remove();
            }
        }
    }

    setupListeners() {
        const input = document.getElementById('taskSearchInput');
        if (input) {
            let timeout;
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    }

    handleSearch(value) {
        this.filters.search = value.trim();
        this.refresh();
    }

    handleClick(e, taskId) {
        if (e.target.type === 'checkbox' || e.target.closest('.task-actions')) return;
        
        const now = Date.now();
        const last = this.lastClick || 0;
        
        if (now - last < 300) {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSelect(taskId);
            this.lastClick = 0;
            return;
        }
        
        this.lastClick = now;
        
        setTimeout(() => {
            if (Date.now() - this.lastClick >= 250) {
                this.showDetails(taskId);
            }
        }, 250);
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { 
            status: 'completed',
            completedAt: new Date().toISOString()
        });
        this.toast('Tâche terminée', 'success');
        this.refresh();
    }

    refreshTasks() {
        this.refresh();
        this.toast('Actualisé', 'success');
    }

    renderEmpty() {
        let title, text, action = '';
        
        if (this.filters.search) {
            title = 'Aucun résultat';
            text = `Aucune tâche pour "${this.filters.search}"`;
            action = `<button class="btn-action btn-primary" onclick="window.tasksView.clearSearch()">
                <i class="fas fa-undo"></i> Effacer recherche
            </button>`;
        } else if (this.hasActiveFilters()) {
            title = 'Aucune tâche';
            text = 'Aucune tâche ne correspond.';
            action = `<button class="btn-action btn-primary" onclick="window.tasksView.resetFilters()">
                <i class="fas fa-undo"></i> Réinitialiser
            </button>`;
        } else {
            title = 'Aucune tâche';
            text = 'Créez votre première tâche.';
            action = `<button class="btn-action btn-primary" onclick="window.tasksView.showCreateModal()">
                <i class="fas fa-plus"></i> Créer
            </button>`;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-tasks"></i></div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-text">${text}</p>
                ${action}
            </div>
        `;
    }

    isFilterActive(filterId) {
        switch (filterId) {
            case 'all': return this.filters.status === 'all' && !this.filters.overdue && !this.filters.needsReply;
            case 'todo':
            case 'in-progress':
            case 'waiting':
            case 'follow-up':
            case 'blocked':
            case 'completed':
                return this.filters.status === filterId;
            case 'overdue': return this.filters.overdue;
            case 'needsReply': return this.filters.needsReply;
            default: return false;
        }
    }

    hasActiveFilters() {
        return this.filters.status !== 'all' ||
               this.filters.priority !== 'all' ||
               this.filters.category !== 'all' ||
               this.filters.client !== 'all' ||
               this.filters.search !== '' ||
               this.filters.overdue ||
               this.filters.needsReply;
    }

    getPriorityIcon(p) {
        return { urgent: '🚨', high: '⚡', medium: '📌', low: '📄' }[p] || '📌';
    }

    getPriorityColor(p) {
        return { urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#10b981' }[p] || '#3b82f6';
    }

    getPriorityLabel(p) {
        return { urgent: 'Urgente', high: 'Haute', medium: 'Normale', low: 'Basse' }[p] || 'Normale';
    }

    getStatusIcon(s) {
        return { 
            todo: '⏳', 
            'in-progress': '🔄', 
            completed: '✅',
            waiting: '⏸️',
            'follow-up': '🔔',
            blocked: '🚫'
        }[s] || '⏳';
    }

    getStatusLabel(s) {
        return { 
            todo: 'À faire', 
            'in-progress': 'En cours', 
            completed: 'Terminé',
            waiting: 'En attente',
            'follow-up': 'À relancer',
            blocked: 'Bloqué'
        }[s] || 'À faire';
    }

    getReplyToneIcon(tone) {
        return {
            professionnel: '👔',
            formel: '👔',
            informel: '😊',
            urgent: '🚨',
            neutre: '📝',
            amical: '🤝',
            détaillé: '📋'
        }[tone] || '📝';
    }

    getReplyToneLabel(tone) {
        return {
            professionnel: 'Professionnel',
            formel: 'Formel',
            informel: 'Informel',
            urgent: 'Urgent',
            neutre: 'Neutre',
            amical: 'Amical',
            détaillé: 'Détaillé'
        }[tone] || 'Neutre';
    }

    formatDueDate(date) {
        if (!date) return { html: '', text: '', className: 'no-deadline' };
        
        const d = new Date(date);
        const now = new Date();
        const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        
        let className = 'deadline-normal';
        let text = '';
        
        if (days < 0) {
            className = 'deadline-overdue';
            text = `Retard ${Math.abs(days)}j`;
        } else if (days === 0) {
            className = 'deadline-today';
            text = 'Aujourd\'hui';
        } else if (days === 1) {
            className = 'deadline-tomorrow';
            text = 'Demain';
        } else if (days <= 7) {
            className = 'deadline-week';
            text = `${days}j`;
        } else {
            text = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
        
        return { html: `<span class="deadline-badge ${className}">📅 ${text}</span>`, text, className };
    }

    formatDeadline(deadline) {
        if (!deadline) return '';
        
        try {
            const d = new Date(deadline);
            const now = new Date();
            const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
            
            if (days < 0) return `Échue ${Math.abs(days)}j`;
            if (days === 0) return 'Aujourd\'hui';
            if (days === 1) return 'Demain';
            if (days <= 7) return `${days}j`;
            return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        } catch (e) {
            return deadline;
        }
    }

    formatDesc(desc) {
        if (!desc) return '';
        
        if (desc.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
            return `<div class="structured-desc">${desc.replace(/\n/g, '<br>')}</div>`;
        }
        return `<div class="simple-desc">${this.esc(desc).replace(/\n/g, '<br>')}</div>`;
    }

    formatEmailContent(content) {
        if (!content) return '<p>Contenu non disponible</p>';
        
        return `<div class="email-original-content">${content
            .replace(/\n/g, '<br>')
            .replace(/Email de:/g, '<strong>Email de:</strong>')
            .replace(/Date:/g, '<strong>Date:</strong>')
            .replace(/Sujet:/g, '<strong>Sujet:</strong>')}</div>`;
    }

    esc(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toast(msg, type = 'info') {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(msg, type);
        } else {
            console.log(`[Toast] ${type}: ${msg}`);
        }
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.remove();
        document.body.style.overflow = 'auto';
    }

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
    }

    addStyles() {
        if (document.getElementById('tmv11Styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'tmv11Styles';
        styles.textContent = `
            :root {
                --primary: #3b82f6;
                --primary-h: #2563eb;
                --success: #10b981;
                --warning: #f59e0b;
                --danger: #ef4444;
                --text-p: #1f2937;
                --text-s: #6b7280;
                --bg-p: #ffffff;
                --bg-s: #f8fafc;
                --border: #e5e7eb;
                --radius: 8px;
                --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
                --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
                --trans: all 0.2s ease;
            }

            .tasks-page-v11 {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 16px;
                font-size: 14px;
            }

            .controls-section {
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .main-controls-line {
                display: flex;
                align-items: center;
                gap: 16px;
                width: 100%;
            }

            .search-section-compact { flex: 0 0 200px; }
            .search-box-compact { position: relative; display: flex; align-items: center; height: 36px; }
            .search-input-compact {
                width: 100%;
                height: 36px;
                padding: 0 12px 0 36px;
                border: 2px solid var(--border);
                border-radius: 8px;
                font-size: 13px;
                background: white;
                transition: var(--trans);
                outline: none;
            }
            .search-input-compact:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
            .search-icon { position: absolute; left: 12px; color: var(--text-s); pointer-events: none; z-index: 1; font-size: 12px; }
            .search-clear {
                position: absolute;
                right: 8px;
                background: var(--danger);
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                transition: var(--trans);
            }
            .search-clear:hover { background: #dc2626; transform: scale(1.1); }

            .view-modes {
                display: flex;
                background: var(--bg-s);
                border: 1px solid var(--border);
                border-radius: 6px;
                padding: 2px;
                gap: 2px;
                flex-shrink: 0;
            }
            .view-mode {
                padding: 6px 12px;
                border: none;
                background: transparent;
                color: var(--text-s);
                border-radius: 4px;
                cursor: pointer;
                transition: var(--trans);
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
                height: 32px;
            }
            .view-mode:hover { background: rgba(255,255,255,0.8); color: var(--text-p); }
            .view-mode.active { background: white; color: var(--text-p); box-shadow: var(--shadow-sm); }

            .main-actions { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: flex-end; }
            .selection-panel {
                display: flex;
                align-items: center;
                gap: 6px;
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: 6px;
                padding: 6px 10px;
                color: #1e40af;
                font-weight: 600;
                font-size: 12px;
                height: 36px;
            }
            .selection-count { font-size: 12px; }

            .btn-action {
                height: 36px;
                padding: 0 12px;
                border: 1px solid var(--border);
                border-radius: 6px;
                background: white;
                color: var(--text-p);
                font-size: 20px;
                cursor: pointer;
                transition: var(--trans);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                min-width: 36px;
            }
            .btn-action:hover { background: var(--bg-s); border-color: var(--primary); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
            .btn-action.btn-new { background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%); color: white; border-color: transparent; }
            .btn-action.btn-new:hover { background: linear-gradient(135deg, var(--primary-h) 0%, #5856eb 100%); }
            .btn-action.btn-bulk { background: var(--success); color: white; border-color: transparent; padding: 0 10px; }
            .btn-action.btn-bulk:hover { background: #059669; }
            .btn-action.btn-clear { width: 32px; padding: 0; background: var(--bg-s); color: var(--text-s); }
            .btn-action.btn-clear:hover { background: var(--danger); color: white; }
            .btn-action.btn-filters.active { background: #eff6ff; color: var(--primary); border-color: var(--primary); }
            .btn-action i { font-size: 14px; }

            .count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--danger);
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 10px;
                min-width: 16px;
                text-align: center;
                border: 2px solid white;
            }

            .status-filters-line { display: flex; align-items: center; width: 100%; }
            .status-filters { display: flex; gap: 6px; flex: 1; flex-wrap: wrap; justify-content: center; }
            .status-pill {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 6px 10px;
                background: white;
                border: 1px solid var(--border);
                border-radius: 6px;
                cursor: pointer;
                transition: var(--trans);
                font-size: 11px;
                font-weight: 600;
                color: var(--text-p);
                min-width: 85px;
                justify-content: space-between;
                height: 32px;
            }
            .status-pill:hover { border-color: var(--primary); background: #f0f9ff; transform: translateY(-1px); box-shadow: var(--shadow-sm); }
            .status-pill.active { background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%); color: white; border-color: var(--primary); box-shadow: var(--shadow-md); }
            .status-pill.active .pill-count { background: rgba(255,255,255,0.3); color: white; }
            .pill-icon { font-size: 12px; }
            .pill-text { flex: 1; text-align: center; font-size: 10px; }
            .pill-count { background: rgba(0,0,0,0.1); padding: 1px 4px; border-radius: 4px; font-size: 10px; font-weight: 700; min-width: 16px; text-align: center; }

            .advanced-filters-panel {
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 12px;
                margin-bottom: 16px;
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
                opacity: 0;
            }
            .advanced-filters-panel.show { max-height: 200px; opacity: 1; padding: 20px; }
            .adv-filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: end; }
            .filter-group { display: flex; flex-direction: column; gap: 6px; }
            .filter-label { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 12px; color: var(--text-p); }
            .filter-select {
                height: 44px;
                padding: 0 12px;
                border: 1px solid var(--border);
                border-radius: 8px;
                background: white;
                font-size: 13px;
                color: var(--text-p);
                cursor: pointer;
                transition: var(--trans);
            }
            .filter-select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
            .btn-reset { background: var(--bg-s); color: var(--text-s); }
            .btn-reset:hover { background: var(--border); color: var(--text-p); }

            .tasks-container { background: transparent; }

            /* Vue minimaliste */
            .tasks-minimal-list { display: flex; flex-direction: column; gap: 2px; background: rgba(255,255,255,0.8); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm); }
            .task-minimal { background: white; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: var(--trans); }
            .task-minimal:last-child { border-bottom: none; }
            .task-minimal:hover { background: var(--bg-s); transform: translateY(-1px); box-shadow: var(--shadow-md); }
            .task-minimal.selected { background: #eff6ff; border-left: 3px solid var(--primary); }
            .task-minimal.completed { opacity: 0.6; }
            .task-minimal.completed .task-title { text-decoration: line-through; }

            .task-content-line { display: flex; align-items: center; padding: 12px 16px; gap: 12px; height: 56px; }
            .task-checkbox { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }
            .task-info { flex: 1; display: flex; align-items: center; gap: 16px; min-width: 0; }
            .task-title { font-weight: 600; color: var(--text-p); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 2; }
            .task-client { font-size: 12px; color: var(--text-s); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
            .task-meta { display: flex; align-items: center; justify-content: center; flex-shrink: 0; gap: 12px; }
            .checklist-progress { font-size: 12px; color: var(--primary); font-weight: 500; display: flex; align-items: center; gap: 4px; }
            .task-deadline { font-size: 12px; font-weight: 500; white-space: nowrap; text-align: center; }
            .deadline-overdue { color: var(--danger); font-weight: 600; }
            .deadline-today { color: var(--warning); font-weight: 600; }
            .deadline-tomorrow { color: var(--warning); }
            .deadline-week { color: var(--primary); }
            .deadline-normal { color: var(--text-s); }
            .no-deadline { color: #9ca3af; font-style: italic; }

            .task-actions { display: flex; gap: 4px; flex-shrink: 0; }
            .action-btn {
                width: 32px;
                height: 32px;
                border: 1px solid var(--border);
                border-radius: 6px;
                background: white;
                color: var(--text-s);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--trans);
                font-size: 12px;
            }
            .action-btn:hover { background: var(--bg-s); border-color: var(--text-s); transform: translateY(-1px); }
            .action-btn.complete:hover { background: #dcfce7; border-color: var(--success); color: var(--success); }
            .action-btn.edit:hover { background: #fef3c7; border-color: var(--warning); color: var(--warning); }
            .action-btn.details:hover { background: #f3e8ff; border-color: #8b5cf6; color: #8b5cf6; }
            .action-btn.reply:hover { background: #eff6ff; border-color: var(--primary); color: var(--primary); }

            /* Vue normale avec checklist inline */
            .task-checklist-inline {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px dashed var(--border);
            }
            .checklist-item-inline {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: var(--text-s);
                cursor: pointer;
                padding: 2px 0;
                transition: var(--trans);
            }
            .checklist-item-inline:hover { color: var(--text-p); }
            .checklist-item-inline.checked { color: #16a34a; text-decoration: line-through; }
            .checklist-item-inline input[type="checkbox"] {
                width: 14px;
                height: 14px;
                cursor: pointer;
                flex-shrink: 0;
            }
            .checklist-item-inline span {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .checklist-more {
                font-size: 11px;
                color: var(--primary);
                font-weight: 500;
                padding: 2px 0;
            }
            .action-btn.add-check {
                background: #f0f9ff;
                color: var(--primary);
                border-color: #bfdbfe;
            }
            .action-btn.add-check:hover {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }
            .tasks-normal-list { display: flex; flex-direction: column; gap: 0; }
            .task-normal { background: rgba(255,255,255,0.95); border-bottom: 1px solid var(--border); cursor: pointer; transition: var(--trans); }
            .task-normal:first-child { border-top-left-radius: 12px; border-top-right-radius: 12px; }
            .task-normal:last-child { border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; border-bottom: none; }
            .task-normal:hover { background: white; transform: translateY(-1px); box-shadow: var(--shadow-md); border-color: rgba(59,130,246,0.2); z-index: 1; position: relative; }
            .task-normal.selected { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid var(--primary); z-index: 2; position: relative; }
            .task-normal.completed { opacity: 0.75; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
            .task-normal.completed .task-title { text-decoration: line-through; color: var(--text-s); }
            .task-normal .task-content-line { padding: 16px; height: 72px; }
            .priority-bar { width: 4px; height: 48px; border-radius: 2px; margin-right: 12px; flex-shrink: 0; }
            .task-main { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
            .task-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
            .task-normal .task-title { font-size: 15px; font-weight: 700; color: var(--text-p); margin: 0; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
            .task-badges { display: flex; gap: 6px; flex-shrink: 0; }
            .status-badge, .checklist-badge {
                padding: 3px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                border: 1px solid;
            }
            .status-badge.status-todo { background: #fef3c7; color: #d97706; border-color: #fde68a; }
            .status-badge.status-in-progress { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
            .status-badge.status-completed { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
            .status-badge.status-waiting { background: #f3f4f6; color: #6b7280; border-color: #d1d5db; }
            .status-badge.status-follow-up { background: #fef3c7; color: #d97706; border-color: #fde68a; }
            .status-badge.status-blocked { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
            .checklist-badge { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
            .task-details { display: flex; align-items: center; gap: 16px; font-size: 12px; color: var(--text-s); }

            /* Vue détaillée */
            .tasks-detailed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
            .task-detailed {
                background: rgba(255,255,255,0.95);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 12px;
                padding: 16px;
                transition: var(--trans);
                box-shadow: var(--shadow-sm);
                display: flex;
                flex-direction: column;
                min-height: 200px;
            }
            .task-detailed:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: rgba(59,130,246,0.3); }
            .task-detailed.selected { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-color: var(--primary); }
            .task-detailed.completed { opacity: 0.8; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
            .task-detailed-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
            .task-badges-group { display: flex; gap: 6px; flex: 1; }
            .priority-badge, .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
            }
            .priority-badge.priority-urgent { background: #fef2f2; color: #dc2626; }
            .priority-badge.priority-high { background: #fef3c7; color: #d97706; }
            .priority-badge.priority-medium { background: #eff6ff; color: #2563eb; }
            .priority-badge.priority-low { background: #f0fdf4; color: #16a34a; }
            .task-detailed-content { flex: 1; margin-bottom: 12px; }
            .task-detailed .task-title { font-size: 16px; font-weight: 700; color: var(--text-p); margin: 0 0 8px 0; line-height: 1.3; cursor: pointer; transition: color 0.2s ease; }
            .task-detailed .task-title:hover { color: var(--primary); }
            .task-description { font-size: 13px; color: var(--text-s); line-height: 1.5; margin: 0 0 12px 0; }
            .checklist-preview { margin: 12px 0; }
            .checklist-progress-bar { width: 100%; height: 6px; background: var(--bg-s); border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
            .progress-fill { height: 100%; background: var(--primary); transition: width 0.3s ease; }
            .checklist-info { font-size: 12px; color: var(--text-s); display: flex; align-items: center; gap: 4px; }
            .task-meta-grid { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
            .meta-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; }
            .meta-item.deadline-centered { flex: 1; text-align: center; justify-content: center; }
            .task-detailed-actions { display: flex; gap: 8px; flex-wrap: wrap; }
            .btn-detailed {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--trans);
                border: 1px solid;
                white-space: nowrap;
            }
            .btn-detailed.complete { background: var(--success); color: white; border-color: var(--success); }
            .btn-detailed.complete:hover { background: #059669; border-color: #059669; }
            .btn-detailed.edit { background: var(--primary); color: white; border-color: var(--primary); }
            .btn-detailed.edit:hover { background: var(--primary-h); border-color: var(--primary-h); }
            .btn-detailed.details { background: var(--bg-s); color: var(--text-p); border-color: var(--border); }
            .btn-detailed.details:hover { background: var(--border); border-color: var(--text-s); }

            /* État vide */
            .empty-state {
                text-align: center;
                padding: 60px 30px;
                background: rgba(255,255,255,0.8);
                border-radius: 16px;
                box-shadow: var(--shadow-sm);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .empty-state-icon { font-size: 48px; margin-bottom: 20px; color: #d1d5db; }
            .empty-state-title { font-size: 20px; font-weight: 700; color: var(--text-p); margin-bottom: 12px; }
            .empty-state-text { font-size: 14px; margin-bottom: 24px; max-width: 400px; line-height: 1.6; color: var(--text-s); }

            /* Modales */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.75);
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
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            .modal-container.modal-large { max-width: 1000px; }
            .modal-header {
                padding: 24px;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: var(--text-p); display: flex; align-items: center; gap: 8px; }
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: var(--text-s);
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--trans);
            }
            .modal-close:hover { background: var(--bg-s); color: var(--text-p); }
            .modal-content { padding: 24px; overflow-y: auto; flex: 1; }
            .modal-footer {
                padding: 24px;
                border-top: 1px solid var(--border);
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
                transition: var(--trans);
                border: 1px solid;
                white-space: nowrap;
            }
            .btn-modal.btn-primary { background: var(--primary); color: white; border-color: var(--primary); }
            .btn-modal.btn-primary:hover { background: var(--primary-h); border-color: var(--primary-h); transform: translateY(-1px); }
            .btn-modal.btn-secondary { background: var(--bg-s); color: var(--text-p); border-color: var(--border); }
            .btn-modal.btn-secondary:hover { background: var(--border); border-color: var(--text-s); }
            .btn-modal.btn-success { background: var(--success); color: white; border-color: var(--success); }
            .btn-modal.btn-success:hover { background: #059669; border-color: #059669; transform: translateY(-1px); }
            .btn-modal.btn-info { background: #0ea5e9; color: white; border-color: #0ea5e9; }
            .btn-modal.btn-info:hover { background: #0284c7; border-color: #0284c7; transform: translateY(-1px); }

            /* Formulaires */
            .form { display: flex; flex-direction: column; gap: 20px; }
            .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .form-row .form-group:only-child { grid-column: 1 / -1; }
            .form-group { display: flex; flex-direction: column; gap: 6px; }
            .form-group label { font-weight: 600; color: var(--text-p); font-size: 14px; }
            .form-input, .form-select, .form-textarea {
                padding: 12px 16px;
                border: 2px solid var(--border);
                border-radius: 8px;
                font-size: 14px;
                background: white;
                transition: border-color 0.2s ease;
                font-family: inherit;
            }
            .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
            .form-textarea { resize: vertical; min-height: 80px; font-family: inherit; }
            .form-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
            .form-section h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: var(--text-p); display: flex; align-items: center; gap: 8px; }
            .email-info-ro { background: var(--bg-s); border: 1px solid var(--border); border-radius: 8px; padding: 16px; font-size: 14px; color: var(--text-p); }
            .email-info-ro > div { margin-bottom: 8px; }
            .email-info-ro > div:last-child { margin-bottom: 0; }

            /* Checklist */
            .checklist-input-row, .checklist-edit-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            .checklist-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid var(--border);
                border-radius: 6px;
                font-size: 13px;
            }
            .btn-add-checklist {
                background: var(--bg-s);
                border: 1px dashed var(--primary);
                color: var(--primary);
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: var(--trans);
            }
            .btn-add-checklist:hover { background: #eff6ff; border-style: solid; }
            .btn-remove-checklist {
                background: var(--bg-s);
                border: 1px solid var(--border);
                color: var(--text-s);
                width: 32px;
                height: 32px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--trans);
            }
            .btn-remove-checklist:hover { background: var(--danger); color: white; border-color: var(--danger); }

            /* Détails tâche */
            .task-details-content { max-width: none; }
            .details-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
            .task-title-details { font-size: 24px; font-weight: 700; color: var(--text-p); margin: 0 0 12px 0; line-height: 1.3; }
            .task-meta-badges { display: flex; gap: 12px; flex-wrap: wrap; }
            .priority-badge-details, .status-badge-details, .deadline-badge-details {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
            }
            .priority-badge-details.priority-urgent { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            .priority-badge-details.priority-high { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
            .priority-badge-details.priority-medium { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
            .priority-badge-details.priority-low { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
            .status-badge-details.status-todo { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
            .status-badge-details.status-in-progress { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
            .status-badge-details.status-completed { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
            .status-badge-details.status-waiting { background: #f3f4f6; color: #6b7280; border: 1px solid #d1d5db; }
            .status-badge-details.status-follow-up { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
            .status-badge-details.status-blocked { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            .deadline-badge-details.deadline-overdue { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            .deadline-badge-details.deadline-today { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
            .deadline-badge-details.deadline-tomorrow { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
            .deadline-badge-details.deadline-week { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
            .deadline-badge-details.deadline-normal { background: var(--bg-s); color: #64748b; border: 1px solid var(--border); }
            .deadline-badge-details.no-deadline { background: var(--bg-s); color: #9ca3af; border: 1px solid #d1d5db; font-style: italic; }
            
            .details-section {
                margin-bottom: 24px;
                background: var(--bg-s);
                border: 1px solid var(--border);
                border-radius: 8px;
                overflow: hidden;
            }
            .details-section h3 {
                margin: 0;
                padding: 16px 20px;
                background: white;
                border-bottom: 1px solid var(--border);
                font-size: 16px;
                font-weight: 600;
                color: var(--text-p);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .description-content { padding: 16px 20px; }
            .structured-desc { font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 13px; line-height: 1.6; background: white; padding: 16px; border-radius: 6px; border: 1px solid var(--border); }
            .simple-desc { font-size: 14px; line-height: 1.6; color: var(--text-p); }
            .info-grid { padding: 16px 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; }
            .info-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--text-p); line-height: 1.4; }
            .info-item strong { min-width: 120px; color: var(--text-p); }
            
            /* Checklist détaillée */
            .checklist-detailed { padding: 16px 20px; }
            .checklist-progress-bar-lg { width: 100%; height: 10px; background: var(--border); border-radius: 5px; overflow: hidden; margin-bottom: 16px; }
            .checklist-items { display: flex; flex-direction: column; gap: 8px; }
            .checklist-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: white;
                border-radius: 6px;
                border: 1px solid var(--border);
                font-size: 14px;
                color: var(--text-p);
            }
            .checklist-item.checked { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; text-decoration: line-through; }
            .checklist-item i { font-size: 14px; }
            
            .email-details-grid { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
            .email-detail-item { display: flex; gap: 12px; font-size: 14px; }
            .email-detail-item strong { min-width: 80px; color: var(--text-p); }
            .email-content-section { padding: 16px 20px; }
            .email-content-section h4 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: var(--text-p); }
            .email-content-box { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 16px; max-height: 300px; overflow-y: auto; }
            .email-content-viewer { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .email-original-content { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: var(--text-p); white-space: pre-wrap; }
            .email-original-content strong { color: var(--text-p); font-weight: 600; }
            
            .actions-list-details { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
            .action-item-details {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                background: white;
                border-radius: 6px;
                border: 1px solid var(--border);
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
            .action-text { flex: 1; font-size: 14px; color: var(--text-p); }
            .action-deadline { font-size: 12px; color: #dc2626; font-weight: 600; background: #fef2f2; padding: 4px 8px; border-radius: 4px; border: 1px solid #fecaca; }
            
            .key-info-grid { padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; }
            .key-info-item { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; color: var(--text-p); line-height: 1.4; }
            
            .attention-section { background: #fef3c7; border-color: #fbbf24; }
            .attention-section h3 { background: #fef9e8; border-bottom-color: #fbbf24; color: #92400e; }
            .attention-list { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
            .attention-item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 6px;
                padding: 10px 12px;
            }
            .attention-item i { font-size: 14px; color: #f59e0b; margin-top: 2px; }
            .attention-item span { flex: 1; font-size: 13px; color: #92400e; line-height: 1.4; }

            /* Suggestions réponse */
            .ai-suggestions-info { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #7dd3fc; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
            .ai-badge { display: inline-flex; align-items: center; gap: 8px; background: #0ea5e9; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
            .ai-suggestions-info p { margin: 0; color: #075985; font-size: 14px; }
            .replies-list { display: flex; flex-direction: column; gap: 16px; }
            .reply-card { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 16px; transition: var(--trans); }
            .reply-card:hover { border-color: var(--primary); box-shadow: 0 2px 8px rgba(59,130,246,0.1); }
            .reply-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
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
            .reply-tone-badge.professionnel, .reply-tone-badge.formel { background: var(--bg-s); color: var(--text-p); border: 1px solid var(--border); }
            .reply-tone-badge.urgent { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            .reply-tone-badge.neutre { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
            .reply-tone-badge.amical { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
            .reply-tone-badge.détaillé { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
            .reply-card-actions { display: flex; gap: 8px; }
            .btn-sm {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: var(--trans);
                border: 1px solid;
            }
            .btn-sm.btn-secondary { background: var(--bg-s); color: var(--text-p); border-color: var(--border); }
            .btn-sm.btn-secondary:hover { background: var(--border); border-color: var(--text-s); }
            .btn-sm.btn-primary { background: var(--primary); color: white; border-color: var(--primary); }
            .btn-sm.btn-primary:hover { background: var(--primary-h); border-color: var(--primary-h); transform: translateY(-1px); }
            .reply-subject-line { font-size: 13px; color: #4b5563; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
            .reply-content-preview { font-size: 13px; color: var(--text-p); line-height: 1.6; white-space: pre-wrap; background: var(--bg-s); padding: 12px; border-radius: 6px; border: 1px solid var(--border); max-height: 150px; overflow-y: auto; }

            @media (max-width: 1024px) {
                .main-controls-line { flex-direction: column; gap: 12px; align-items: stretch; }
                .search-section { max-width: none; }
                .main-actions { justify-content: center; width: 100%; }
                .views-filters-line { flex-direction: column; gap: 12px; align-items: stretch; }
                .view-modes { align-self: center; }
                .status-filters { justify-content: center; }
                .status-pill { min-width: 90px; }
                .tasks-detailed-grid { grid-template-columns: 1fr; }
            }

            @media (max-width: 768px) {
                .controls-section { padding: 16px; }
                .task-content-line { padding: 12px; height: auto; min-height: 56px; }
                .task-info { flex-direction: column; align-items: flex-start; gap: 4px; }
                .task-normal .task-content-line { height: auto; min-height: 72px; }
                .task-header { flex-direction: column; align-items: flex-start; gap: 8px; }
                .task-badges { align-self: flex-end; }
                .main-actions { flex-direction: column; gap: 8px; }
                .selection-panel { justify-content: center; }
                .status-filters { flex-direction: column; gap: 6px; }
                .status-pill { min-width: auto; width: 100%; justify-content: space-between; }
            }

            @media (max-width: 480px) {
                .tasks-page-v11 { padding: 8px; }
                .controls-section { padding: 12px; gap: 12px; }
                .btn-action { height: 40px; font-size: 12px; padding: 0 12px; }
                .task-content-line { padding: 8px; gap: 8px; }
                .task-actions { flex-direction: column; gap: 2px; }
                .action-btn { width: 28px; height: 28px; font-size: 11px; }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialisation globale
function initTaskManagerV11() {
    console.log('[TM] Init v11...');
    
    if (!window.taskManager || !window.taskManager.initialized) {
        window.taskManager = new TaskManager();
    }
    
    if (!window.tasksView) {
        window.tasksView = new TasksView();
    }
    
    // Bind methods
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
    
    console.log('✅ TaskManager v11 loaded');
}

// Init immédiate + DOM ready
initTaskManagerV11();

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TM] DOM ready...');
    initTaskManagerV11();
});

// Fallback
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TM] Fallback init...');
            initTaskManagerV11();
        }
    }, 1000);
});
