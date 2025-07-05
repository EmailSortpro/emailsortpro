<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskManager Pro v13</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Variables CSS pour TaskManager v13 */
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

        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }

        /* Loading State */
        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
            color: var(--text-secondary);
        }

        .loading-icon {
            font-size: 48px;
            margin-bottom: 16px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Toast Notifications */
        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: var(--shadow-md);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 100000;
            max-width: 400px;
        }

        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        .toast.success {
            border-left: 4px solid var(--success-color);
        }

        .toast.error {
            border-left: 4px solid var(--danger-color);
        }

        .toast.warning {
            border-left: 4px solid var(--warning-color);
        }

        .toast.info {
            border-left: 4px solid var(--primary-color);
        }

        .toast-icon {
            font-size: 20px;
        }

        .toast.success .toast-icon { color: var(--success-color); }
        .toast.error .toast-icon { color: var(--danger-color); }
        .toast.warning .toast-icon { color: var(--warning-color); }
        .toast.info .toast-icon { color: var(--primary-color); }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.75);
            z-index: 99999;
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

        /* Email Reply Modal Styles */
        .email-reply-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .email-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .email-field label {
            font-weight: 600;
            color: var(--text-primary);
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .email-recipients {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            min-height: 44px;
            padding: 8px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            background: white;
            align-items: center;
            cursor: text;
            transition: border-color 0.2s ease;
        }

        .email-recipients:focus-within {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .email-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            font-size: 13px;
            color: var(--text-primary);
            max-width: 200px;
        }

        .email-chip .email-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .email-chip .remove-chip {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        .email-chip .remove-chip:hover {
            background: var(--danger-color);
            color: white;
        }

        .email-input-inline {
            flex: 1;
            border: none;
            outline: none;
            font-size: 14px;
            min-width: 200px;
            padding: 4px;
        }

        .email-subject-input,
        .email-body-textarea {
            padding: 12px 16px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 14px;
            background: white;
            transition: border-color 0.2s ease;
            font-family: inherit;
        }

        .email-subject-input:focus,
        .email-body-textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .email-body-textarea {
            min-height: 300px;
            resize: vertical;
        }

        .email-toolbar {
            display: flex;
            gap: 8px;
            padding: 8px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin-bottom: -12px;
        }

        .toolbar-btn {
            width: 32px;
            height: 32px;
            border: 1px solid var(--border-color);
            background: white;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            color: var(--text-secondary);
        }

        .toolbar-btn:hover {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        .email-attachments {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .attachment-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 13px;
        }

        .original-email-section {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            margin-top: 12px;
        }

        .original-email-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .btn-toggle-original {
            background: none;
            border: none;
            color: var(--primary-color);
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .original-email-content {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
            border-left: 3px solid var(--border-color);
            padding-left: 12px;
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <div id="app"></div>

    <script>
        // =====================================
        // TASK MANAGER CLASS v13
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
                    console.log('[TaskManager] Initializing v13.0...');
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
                    const saved = localStorage.getItem('taskmanager_v13_tasks');
                    if (saved) {
                        this.tasks = JSON.parse(saved);
                        console.log(`[TaskManager] Loaded ${this.tasks.length} tasks from storage`);
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
                    id: task.id || this.generateId(),
                    title: task.title || 'Tâche sans titre',
                    description: task.description || '',
                    priority: task.priority || 'medium',
                    status: task.status || 'todo',
                    dueDate: task.dueDate || null,
                    category: task.category || 'other',
                    client: task.client || 'Interne',
                    tags: Array.isArray(task.tags) ? task.tags : [],
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
                    emailTo: task.emailTo || [], // Nouveau: destinataires
                    emailCc: task.emailCc || [], // Nouveau: CC
                    emailBcc: task.emailBcc || [], // Nouveau: BCC
                    emailReplies: task.emailReplies || [], // Nouveau: historique des réponses
                    summary: task.summary || '',
                    actions: Array.isArray(task.actions) ? task.actions : [],
                    keyInfo: Array.isArray(task.keyInfo) ? task.keyInfo : [],
                    risks: Array.isArray(task.risks) ? task.risks : [],
                    checklist: Array.isArray(task.checklist) ? task.checklist : [],
                    createdAt: task.createdAt || new Date().toISOString(),
                    updatedAt: task.updatedAt || new Date().toISOString(),
                    completedAt: task.completedAt || null,
                    method: task.method || 'manual'
                };
            }

            generateSampleTasks() {
                const sampleTasks = [
                    {
                        id: 'sample_1',
                        title: 'Répondre à l\'équipe marketing sur la campagne Q2',
                        description: 'L\'équipe marketing attend une validation pour la campagne du deuxième trimestre. Budget proposé de 50k€.',
                        priority: 'high',
                        status: 'todo',
                        category: 'email',
                        hasEmail: true,
                        emailFrom: 'sarah.martin@acme-corp.com',
                        emailFromName: 'Sarah Martin',
                        emailSubject: 'Validation campagne marketing Q2',
                        emailDate: '2025-01-06T09:15:00Z',
                        emailDomain: 'acme-corp.com',
                        emailContent: 'Bonjour,\n\nNous avons finalisé la proposition pour la campagne marketing Q2 et nous aurions besoin de votre validation.\n\nBudget proposé : 50 000€\nCibles : 25-45 ans, CSP+\nCanaux : LinkedIn, Google Ads, Facebook\n\nMerci de nous confirmer votre accord rapidement car nous devons lancer la campagne avant fin janvier.\n\nCordialement,\nSarah Martin\nDirectrice Marketing\nACME Corp',
                        emailTo: ['vous@entreprise.com'],
                        emailCc: ['marketing@acme-corp.com'],
                        client: 'ACME Corp',
                        dueDate: '2025-01-20',
                        needsReply: true,
                        summary: 'Validation urgente de la campagne marketing Q2 avec budget de 50k€',
                        actions: [
                            { text: 'Valider les visuels de la campagne', deadline: null },
                            { text: 'Confirmer le budget alloué', deadline: '2025-01-18' },
                            { text: 'Définir les dates de lancement', deadline: null }
                        ],
                        checklist: [
                            { id: 'cl1', text: 'Analyser les visuels proposés', completed: false },
                            { id: 'cl2', text: 'Vérifier le budget disponible', completed: true },
                            { id: 'cl3', text: 'Valider avec la direction', completed: false }
                        ],
                        method: 'email'
                    },
                    {
                        id: 'sample_2',
                        title: 'Préparer présentation trimestrielle',
                        description: 'Préparer la présentation des résultats Q1 pour le comité de direction',
                        priority: 'medium',
                        status: 'in-progress',
                        category: 'work',
                        client: 'Direction',
                        dueDate: '2025-01-25',
                        summary: 'Présentation des résultats trimestriels avec analyse des performances',
                        actions: [
                            { text: 'Collecter les données financières', deadline: '2025-01-22' },
                            { text: 'Créer les graphiques', deadline: '2025-01-24' }
                        ],
                        checklist: [
                            { id: 'cl4', text: 'Rassembler données Q1', completed: true },
                            { id: 'cl5', text: 'Créer slides PowerPoint', completed: false }
                        ],
                        method: 'manual'
                    },
                    {
                        id: 'sample_3',
                        title: 'Répondre à Jean Dupont - Devis urgent',
                        description: 'Jean Dupont demande un devis pour un projet de refonte website',
                        priority: 'urgent',
                        status: 'relance',
                        category: 'email',
                        hasEmail: true,
                        emailFrom: 'jean.dupont@example.com',
                        emailFromName: 'Jean Dupont',
                        emailSubject: 'Demande de devis - Refonte site web',
                        emailDate: '2025-01-15T14:30:00Z',
                        emailContent: 'Bonjour,\n\nJe souhaiterais obtenir un devis pour la refonte complète de notre site web d\'entreprise.\n\nNos besoins :\n- Design moderne et responsive\n- Intégration CMS\n- Optimisation SEO\n- Formation de notre équipe\n\nPourriez-vous me faire parvenir une proposition chiffrée rapidement ?\n\nCordialement,\nJean Dupont',
                        emailTo: ['vous@entreprise.com'],
                        emailDomain: 'example.com',
                        client: 'Jean Dupont',
                        dueDate: '2025-01-17',
                        needsReply: true,
                        summary: 'Demande de devis urgent pour refonte complète du site web',
                        checklist: [
                            { id: 'cl7', text: 'Évaluer complexité du projet', completed: true },
                            { id: 'cl8', text: 'Chiffrer les coûts', completed: false }
                        ],
                        method: 'email'
                    }
                ];
                
                this.tasks = sampleTasks.map(task => this.ensureTaskProperties(task));
                this.saveTasks();
            }

            // CRUD Methods
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
                
                const emailInfo = this.extractEmailInfo(email, taskData);
                
                const task = this.ensureTaskProperties({
                    ...taskData,
                    ...emailInfo,
                    id: taskData.id || this.generateId(),
                    hasEmail: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                
                this.tasks.push(task);
                this.saveTasks();
                this.emitTaskUpdate('create', task);
                
                console.log('[TaskManager] Email task created successfully:', task.id);
                return task;
            }

            extractEmailInfo(email, taskData) {
                const info = {
                    client: null,
                    emailFrom: null,
                    emailFromName: null,
                    emailDomain: null,
                    emailSubject: null,
                    emailDate: null,
                    emailTo: [],
                    emailCc: [],
                    emailBcc: []
                };

                if (email) {
                    // Extract sender info
                    if (email.from?.emailAddress?.address) {
                        info.emailFrom = email.from.emailAddress.address;
                        info.emailDomain = email.from.emailAddress.address.split('@')[1] || null;
                        info.emailFromName = email.from.emailAddress.name || null;
                    }

                    // Extract recipients
                    if (email.toRecipients) {
                        info.emailTo = email.toRecipients.map(r => r.emailAddress?.address || r.address).filter(Boolean);
                    }
                    if (email.ccRecipients) {
                        info.emailCc = email.ccRecipients.map(r => r.emailAddress?.address || r.address).filter(Boolean);
                    }
                    if (email.bccRecipients) {
                        info.emailBcc = email.bccRecipients.map(r => r.emailAddress?.address || r.address).filter(Boolean);
                    }

                    info.emailSubject = email.subject || null;
                    info.emailDate = email.receivedDateTime || null;
                }

                // Merge with taskData
                Object.keys(info).forEach(key => {
                    if (!info[key] && taskData[key]) {
                        info[key] = taskData[key];
                    }
                });

                // Determine client name
                if (info.emailFromName && info.emailFromName.trim()) {
                    info.client = info.emailFromName.trim();
                } else if (info.emailDomain) {
                    info.client = this.formatDomainAsClient(info.emailDomain);
                } else {
                    info.client = 'Externe';
                }

                return info;
            }

            formatDomainAsClient(domain) {
                if (!domain) return 'Externe';
                const cleanDomain = domain.replace(/^(www\.|mail\.|smtp\.|mx\.)/, '');
                const parts = cleanDomain.split('.');
                const mainName = parts[0];
                return mainName.charAt(0).toUpperCase() + mainName.slice(1).toLowerCase();
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

            // Email reply functionality
            addEmailReply(taskId, replyData) {
                const task = this.getTask(taskId);
                if (!task) return null;

                const reply = {
                    id: this.generateId(),
                    to: replyData.to || [],
                    cc: replyData.cc || [],
                    bcc: replyData.bcc || [],
                    subject: replyData.subject || '',
                    body: replyData.body || '',
                    sentAt: new Date().toISOString(),
                    status: 'sent'
                };

                const emailReplies = [...(task.emailReplies || []), reply];
                
                return this.updateTask(taskId, {
                    emailReplies,
                    emailReplied: true,
                    needsReply: false,
                    status: task.status === 'todo' ? 'in-progress' : task.status
                });
            }

            // Query methods
            getTask(id) {
                return this.tasks.find(task => task.id === id);
            }

            getAllTasks() {
                return [...this.tasks];
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

            getAllClients() {
                const clients = new Set(['Interne']);
                this.tasks.forEach(task => {
                    if (task.client && task.client.trim()) {
                        clients.add(task.client.trim());
                    }
                });
                return Array.from(clients).sort();
            }

            getAllCategories() {
                const categories = new Set();
                this.tasks.forEach(task => {
                    if (task.category && task.category.trim()) {
                        categories.add(task.category.trim());
                    }
                });
                const standardCategories = ['email', 'work', 'meeting', 'training', 'other'];
                standardCategories.forEach(cat => categories.add(cat));
                return Array.from(categories).sort();
            }

            getStats() {
                const byStatus = {
                    todo: this.tasks.filter(t => t.status === 'todo').length,
                    'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
                    'relance': this.tasks.filter(t => t.status === 'relance').length,
                    'bloque': this.tasks.filter(t => t.status === 'bloque').length,
                    'reporte': this.tasks.filter(t => t.status === 'reporte').length,
                    completed: this.tasks.filter(t => t.status === 'completed').length
                };

                const byCategory = {};
                this.getAllCategories().forEach(category => {
                    byCategory[category] = this.tasks.filter(t => t.category === category).length;
                });

                return {
                    total: this.tasks.length,
                    byStatus,
                    byCategory,
                    todo: byStatus.todo,
                    inProgress: byStatus['in-progress'],
                    relance: byStatus.relance,
                    bloque: byStatus.bloque,
                    reporte: byStatus.reporte,
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

            // Utility methods
            generateId() {
                return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }

            saveTasks() {
                try {
                    localStorage.setItem('taskmanager_v13_tasks', JSON.stringify(this.tasks));
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
        // TASKS VIEW CLASS v13
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
                
                this.showStatusFilters = false;
                this.showCategoryFilters = false;
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
                    <div class="tasks-page-v13">
                        ${this.renderControlsSection(stats, selectedCount)}
                        ${this.renderFiltersSection(stats)}
                        <div class="tasks-container" id="tasksContainer">
                            ${this.renderTasksList()}
                        </div>
                    </div>
                `;

                this.addStyles();
                this.setupEventListeners();
            }

            renderControlsSection(stats, selectedCount) {
                return `
                    <div class="main-controls-section">
                        <div class="search-and-actions-line">
                            <div class="search-section">
                                <div class="search-box">
                                    <i class="fas fa-search search-icon"></i>
                                    <input type="text" 
                                           class="search-input" 
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

                            <div class="all-actions-line">
                                ${selectedCount > 0 ? `
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
                                ` : ''}
                                
                                <button class="btn-action btn-select-all" onclick="window.tasksView.selectAllVisible()" title="Sélectionner toutes les tâches visibles">
                                    <i class="fas fa-check-square"></i>
                                    Tout sélectionner
                                </button>

                                <button class="btn-action btn-refresh" onclick="window.tasksView.refreshTasks()" title="Actualiser">
                                    <i class="fas fa-sync-alt"></i>
                                    Actualiser
                                </button>
                                
                                <button class="btn-new-task" onclick="window.tasksView.showCreateModal()" title="Créer une nouvelle tâche">
                                    <i class="fas fa-plus"></i>
                                    Nouvelle tâche
                                </button>
                                
                                <div class="current-date">
                                    <i class="fas fa-calendar-day"></i>
                                    <span id="currentDateDisplay">${new Date().toLocaleDateString('fr-FR', { 
                                        weekday: 'short', 
                                        day: 'numeric', 
                                        month: 'short' 
                                    })}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="view-and-controls-line">
                            <div class="view-modes">
                                <button class="view-mode ${this.currentViewMode === 'minimal' ? 'active' : ''}" 
                                        onclick="window.tasksView.changeViewMode('minimal')"
                                        title="Vue minimaliste">
                                    Minimal
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'normal' ? 'active' : ''}" 
                                        onclick="window.tasksView.changeViewMode('normal')"
                                        title="Vue normale">
                                    Normal
                                </button>
                                <button class="view-mode ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                        onclick="window.tasksView.changeViewMode('detailed')"
                                        title="Vue détaillée">
                                    Détaillé
                                </button>
                            </div>
                            
                            <div class="filter-toggles">
                                <button class="filter-toggle ${this.showStatusFilters ? 'active' : ''}" 
                                        onclick="window.tasksView.toggleStatusFilters()"
                                        title="Afficher/Masquer filtres statuts">
                                    <i class="fas fa-tasks"></i>
                                    Statuts
                                    <i class="fas fa-chevron-${this.showStatusFilters ? 'up' : 'down'}"></i>
                                </button>
                                
                                <button class="filter-toggle ${this.showCategoryFilters ? 'active' : ''}" 
                                        onclick="window.tasksView.toggleCategoryFilters()"
                                        title="Afficher/Masquer filtres catégories">
                                    <i class="fas fa-folder"></i>
                                    Catégories
                                    <i class="fas fa-chevron-${this.showCategoryFilters ? 'up' : 'down'}"></i>
                                </button>
                                
                                <button class="filter-toggle ${this.showAdvancedFilters ? 'active' : ''}" 
                                        onclick="window.tasksView.toggleAdvancedFilters()"
                                        title="Afficher/Masquer filtres avancés">
                                    <i class="fas fa-filter"></i>
                                    Filtres
                                    <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                                </button>
                            </div>
                            
                            <div class="new-and-sort">
                                <div class="sort-quick">
                                    <label class="sort-label">
                                        <i class="fas fa-sort"></i> Trier :
                                    </label>
                                    <select class="sort-select" id="quickSortSelect" 
                                            onchange="window.tasksView.updateFilter('sortBy', this.value)">
                                        <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Date création</option>
                                        <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                                        <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Date échéance</option>
                                        <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre A-Z</option>
                                        <option value="client" ${this.currentFilters.sortBy === 'client' ? 'selected' : ''}>Client</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            renderFiltersSection(stats) {
                return `
                    <div class="filters-conditional-section">
                        <div class="status-filters-panel ${this.showStatusFilters ? 'show' : ''}" id="statusFiltersPanel">
                            <div class="filter-section-header">
                                <div class="filter-group-title">
                                    <i class="fas fa-tasks"></i>
                                    <span>Filtres par Statut</span>
                                </div>
                                <button class="btn-reset-section" onclick="window.tasksView.resetStatusFilters()" title="Réinitialiser filtres statuts">
                                    <i class="fas fa-undo"></i>
                                </button>
                            </div>
                            <div class="status-filters">
                                ${this.buildStatusPills(stats)}
                            </div>
                        </div>
                        
                        <div class="category-filters-panel ${this.showCategoryFilters ? 'show' : ''}" id="categoryFiltersPanel">
                            <div class="filter-section-header">
                                <div class="filter-group-title">
                                    <i class="fas fa-folder"></i>
                                    <span>Filtres par Catégorie</span>
                                </div>
                                <button class="btn-reset-section" onclick="window.tasksView.resetCategoryFilters()" title="Réinitialiser filtres catégories">
                                    <i class="fas fa-undo"></i>
                                </button>
                            </div>
                            <div class="category-filters">
                                ${this.buildCategoryPills(stats)}
                            </div>
                        </div>
                        
                        <div class="advanced-filters-panel ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFiltersPanel">
                            <div class="filter-section-header">
                                <div class="filter-group-title">
                                    <i class="fas fa-filter"></i>
                                    <span>Filtres Avancés</span>
                                </div>
                                <button class="btn-reset-section" onclick="window.tasksView.resetAdvancedFilters()" title="Réinitialiser filtres avancés">
                                    <i class="fas fa-undo"></i>
                                </button>
                            </div>
                            <div class="advanced-filters-grid">
                                <div class="filter-group">
                                    <label class="filter-label">
                                        <i class="fas fa-flag"></i> Priorité
                                    </label>
                                    <select class="filter-select" id="priorityFilter" 
                                            onchange="window.tasksView.updateFilter('priority', this.value)">
                                        <option value="all" ${this.currentFilters.priority === 'all' ? 'selected' : ''}>🏳️ Toutes priorités</option>
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
                                
                                <div class="filter-actions">
                                    <button class="btn-reset" onclick="window.tasksView.resetAllFilters()" title="Réinitialiser tous les filtres">
                                        <i class="fas fa-undo"></i>
                                        Reset Global
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            buildStatusPills(stats) {
                const pills = [
                    { id: 'all', name: 'Tous', icon: '📋', count: stats.total, color: '#6b7280' },
                    { id: 'todo', name: 'À faire', icon: '⏳', count: stats.todo, color: '#d97706' },
                    { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.inProgress, color: '#2563eb' },
                    { id: 'relance', name: 'Relance', icon: '🔔', count: stats.relance, color: '#dc2626' },
                    { id: 'bloque', name: 'Bloqué', icon: '🚫', count: stats.bloque, color: '#6b7280' },
                    { id: 'reporte', name: 'Reporté', icon: '⏰', count: stats.reporte, color: '#0ea5e9' },
                    { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue, color: '#ef4444' },
                    { id: 'needsReply', name: 'À répondre', icon: '📧', count: stats.needsReply, color: '#8b5cf6' },
                    { id: 'completed', name: 'Terminé', icon: '✅', count: stats.completed, color: '#16a34a' }
                ];

                return pills.map(pill => `
                    <button class="status-pill ${this.isStatusFilterActive(pill.id) ? 'active' : ''}" 
                            data-filter="${pill.id}"
                            onclick="window.tasksView.quickStatusFilter('${pill.id}')"
                            title="${pill.name}: ${pill.count} tâche(s)"
                            style="--pill-color: ${pill.color}">
                        <span class="pill-icon">${pill.icon}</span>
                        <span class="pill-text">${pill.name}</span>
                        <span class="pill-count">${pill.count}</span>
                    </button>
                `).join('');
            }

            buildCategoryPills(stats) {
                const categories = window.taskManager?.getAllCategories() || [];
                const categoryConfig = {
                    email: { name: 'Email', icon: '📧', color: '#3b82f6' },
                    work: { name: 'Travail', icon: '💼', color: '#059669' },
                    meeting: { name: 'Réunion', icon: '👥', color: '#8b5cf6' },
                    training: { name: 'Formation', icon: '📚', color: '#f59e0b' },
                    other: { name: 'Autre', icon: '📝', color: '#6b7280' }
                };

                const pills = [
                    { id: 'all', name: 'Toutes', icon: '📁', count: stats.total, color: '#6b7280' }
                ];

                categories.forEach(category => {
                    const config = categoryConfig[category] || { name: category, icon: '📄', color: '#6b7280' };
                    const count = stats.byCategory[category] || 0;
                    
                    pills.push({
                        id: category,
                        name: config.name,
                        icon: config.icon,
                        count: count,
                        color: config.color
                    });
                });

                return pills.map(pill => `
                    <button class="category-pill ${this.isCategoryFilterActive(pill.id) ? 'active' : ''}" 
                            data-filter="${pill.id}"
                            onclick="window.tasksView.quickCategoryFilter('${pill.id}')"
                            title="${pill.name}: ${pill.count} tâche(s)"
                            style="--pill-color: ${pill.color}">
                        <span class="pill-icon">${pill.icon}</span>
                        <span class="pill-text">${pill.name}</span>
                        <span class="pill-count">${pill.count}</span>
                    </button>
                `).join('');
            }

            buildClientFilterOptions() {
                const allClients = window.taskManager?.getAllClients() || [];
                
                let options = `<option value="all" ${this.currentFilters.client === 'all' ? 'selected' : ''}>🏢 Tous les clients</option>`;
                
                allClients.forEach(client => {
                    const count = window.taskManager.tasks.filter(t => t.client === client).length;
                    const isSelected = this.currentFilters.client === client ? 'selected' : '';
                    const clientIcon = client === 'Interne' ? '🏢 ' : '👤 ';
                    
                    options += `<option value="${this.escapeHtml(client)}" ${isSelected}>${clientIcon}${this.escapeHtml(client)} (${count})</option>`;
                });
                
                return options;
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
                const displayClient = this.getDisplayClient(task);
                
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
                                <span class="task-client">${displayClient.icon} ${this.escapeHtml(displayClient.name)}</span>
                            </div>
                            
                            <div class="task-meta">
                                <span class="task-status-badge status-${task.status}">
                                    ${this.getStatusIcon(task.status)} ${this.getStatusLabel(task.status)}
                                </span>
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
                const checklistProgress = this.getChecklistProgress(task.checklist);
                const displayClient = this.getDisplayClient(task);
                
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
                                        <span class="status-badge status-${task.status}">
                                            ${statusIcon} ${this.getStatusLabel(task.status)}
                                        </span>
                                        ${checklistProgress.total > 0 ? `
                                            <span class="checklist-badge">
                                                <i class="fas fa-check-square"></i>
                                                ${checklistProgress.completed}/${checklistProgress.total}
                                            </span>
                                        ` : ''}
                                        ${task.hasEmail ? `
                                            <span class="email-badge">
                                                📧 Email
                                            </span>
                                        ` : ''}
                                        ${task.emailReplied ? `
                                            <span class="replied-badge">
                                                ✉️ Répondu
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                                
                                <div class="task-details">
                                    <span class="task-client">
                                        ${displayClient.icon} ${this.escapeHtml(displayClient.name)}
                                    </span>
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
                const checklistProgress = this.getChecklistProgress(task.checklist);
                const displayClient = this.getDisplayClient(task);
                
                return `
                    <div class="task-detailed ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                         data-task-id="${task.id}">
                        
                        <div class="task-detailed-header">
                            <input type="checkbox" 
                                   class="task-checkbox" 
                                   ${isSelected ? 'checked' : ''}
                                   onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                            
                            <div class="task-badges-group">
                                <span class="priority-badge priority-${task.priority}">
                                    ${this.getPriorityIcon(task.priority)} ${this.getPriorityLabel(task.priority)}
                                </span>
                                <span class="status-badge status-${task.status}">
                                    ${this.getStatusIcon(task.status)} ${this.getStatusLabel(task.status)}
                                </span>
                                ${task.hasEmail ? `
                                    <span class="email-badge">
                                        📧 Email
                                    </span>
                                ` : ''}
                                ${task.emailReplied ? `
                                    <span class="replied-badge">
                                        ✉️ Répondu
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="task-detailed-content">
                            <h3 class="task-title" onclick="window.tasksView.showTaskDetails('${task.id}')">${this.escapeHtml(task.title)}</h3>
                            <p class="task-description">${this.escapeHtml(task.description.substring(0, 150))}${task.description.length > 150 ? '...' : ''}</p>
                            
                            ${checklistProgress.total > 0 ? `
                                <div class="checklist-summary">
                                    <div class="checklist-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${(checklistProgress.completed / checklistProgress.total) * 100}%"></div>
                                        </div>
                                        <span class="progress-text">${checklistProgress.completed}/${checklistProgress.total} tâches</span>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="task-meta-grid">
                                <div class="meta-item">
                                    <span>${displayClient.icon} ${this.escapeHtml(displayClient.name)}</span>
                                </div>
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
                
                if (task.hasEmail && task.needsReply && !task.emailReplied) {
                    actions.push(`
                        <button class="action-btn reply" 
                                onclick="event.stopPropagation(); window.tasksView.showReplyModal('${task.id}')"
                                title="Répondre à l'email">
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
                
                if (task.hasEmail && task.needsReply && !task.emailReplied) {
                    actions.push(`
                        <button class="btn-detailed reply" 
                                onclick="window.tasksView.showReplyModal('${task.id}')">
                            <i class="fas fa-reply"></i>
                            Répondre
                        </button>
                    `);
                }
                
                return actions.join('');
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

            // Email Reply Modal
            showReplyModal(taskId) {
                const task = window.taskManager.getTask(taskId);
                if (!task || !task.hasEmail) return;

                document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
                
                const uniqueId = 'reply_modal_' + Date.now();
                
                // Prepare default recipients
                const defaultTo = task.emailFrom ? [task.emailFrom] : [];
                const defaultCc = task.emailCc || [];
                
                const modalHTML = `
                    <div id="${uniqueId}" class="modal-overlay">
                        <div class="modal-container modal-large">
                            <div class="modal-header">
                                <h2><i class="fas fa-reply"></i> Répondre à l'email</h2>
                                <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="modal-content">
                                <div class="email-reply-form">
                                    <div class="email-field">
                                        <label>
                                            <i class="fas fa-user"></i> À :
                                        </label>
                                        <div class="email-recipients" id="toRecipients" onclick="window.tasksView.focusEmailInput('toRecipients')">
                                            ${defaultTo.map(email => this.createEmailChip(email, 'toRecipients')).join('')}
                                            <input type="email" class="email-input-inline" id="toInput" 
                                                   placeholder="Ajouter un destinataire..." 
                                                   onkeydown="window.tasksView.handleEmailInput(event, 'toRecipients')"
                                                   onblur="window.tasksView.addEmailFromInput('toRecipients')">
                                        </div>
                                    </div>

                                    <div class="email-field">
                                        <label>
                                            <i class="fas fa-users"></i> Cc :
                                        </label>
                                        <div class="email-recipients" id="ccRecipients" onclick="window.tasksView.focusEmailInput('ccRecipients')">
                                            ${defaultCc.map(email => this.createEmailChip(email, 'ccRecipients')).join('')}
                                            <input type="email" class="email-input-inline" id="ccInput" 
                                                   placeholder="Ajouter en copie..." 
                                                   onkeydown="window.tasksView.handleEmailInput(event, 'ccRecipients')"
                                                   onblur="window.tasksView.addEmailFromInput('ccRecipients')">
                                        </div>
                                    </div>

                                    <div class="email-field">
                                        <label>
                                            <i class="fas fa-user-secret"></i> Cci :
                                        </label>
                                        <div class="email-recipients" id="bccRecipients" onclick="window.tasksView.focusEmailInput('bccRecipients')">
                                            <input type="email" class="email-input-inline" id="bccInput" 
                                                   placeholder="Ajouter en copie cachée..." 
                                                   onkeydown="window.tasksView.handleEmailInput(event, 'bccRecipients')"
                                                   onblur="window.tasksView.addEmailFromInput('bccRecipients')">
                                        </div>
                                    </div>

                                    <div class="email-field">
                                        <label>
                                            <i class="fas fa-heading"></i> Sujet :
                                        </label>
                                        <input type="text" class="email-subject-input" id="emailSubject" 
                                               value="Re: ${this.escapeHtml(task.emailSubject || 'Sans sujet')}" />
                                    </div>

                                    <div class="email-field">
                                        <label>
                                            <i class="fas fa-envelope"></i> Message :
                                        </label>
                                        <div class="email-toolbar">
                                            <button class="toolbar-btn" onclick="window.tasksView.formatText('bold')" title="Gras">
                                                <i class="fas fa-bold"></i>
                                            </button>
                                            <button class="toolbar-btn" onclick="window.tasksView.formatText('italic')" title="Italique">
                                                <i class="fas fa-italic"></i>
                                            </button>
                                            <button class="toolbar-btn" onclick="window.tasksView.formatText('underline')" title="Souligné">
                                                <i class="fas fa-underline"></i>
                                            </button>
                                            <button class="toolbar-btn" onclick="window.tasksView.insertTemplate()" title="Insérer un modèle">
                                                <i class="fas fa-file-alt"></i>
                                            </button>
                                        </div>
                                        <textarea class="email-body-textarea" id="emailBody" 
                                                  placeholder="Écrivez votre message ici...">${this.getDefaultReplyBody(task)}</textarea>
                                    </div>

                                    <div class="original-email-section">
                                        <div class="original-email-header">
                                            <span>Email original</span>
                                            <button class="btn-toggle-original" onclick="window.tasksView.toggleOriginalEmail('${taskId}')">
                                                <i class="fas fa-chevron-down"></i>
                                                Afficher
                                            </button>
                                        </div>
                                        <div class="original-email-content" id="originalEmail_${taskId}" style="display: none;">
                                            <strong>De:</strong> ${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')}<br>
                                            <strong>Date:</strong> ${task.emailDate ? new Date(task.emailDate).toLocaleString('fr-FR') : 'Non disponible'}<br>
                                            <strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject || 'Sans sujet')}<br><br>
                                            ${this.escapeHtml(task.emailContent).replace(/\n/g, '<br>')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                                    Annuler
                                </button>
                                <button class="btn-modal btn-primary" onclick="window.tasksView.sendReply('${taskId}', '${uniqueId}')">
                                    <i class="fas fa-paper-plane"></i> Envoyer
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                document.body.insertAdjacentHTML('beforeend', modalHTML);
                document.body.style.overflow = 'hidden';
                
                // Focus on body textarea
                setTimeout(() => {
                    const bodyTextarea = document.getElementById('emailBody');
                    if (bodyTextarea) {
                        bodyTextarea.focus();
                        bodyTextarea.setSelectionRange(0, 0);
                    }
                }, 100);
            }

            createEmailChip(email, containerId) {
                const chipId = 'chip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                return `
                    <div class="email-chip" id="${chipId}">
                        <span class="email-text">${this.escapeHtml(email)}</span>
                        <button class="remove-chip" onclick="window.tasksView.removeEmailChip('${chipId}', '${containerId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            }

            focusEmailInput(containerId) {
                const inputId = containerId.replace('Recipients', 'Input');
                const input = document.getElementById(inputId);
                if (input) input.focus();
            }

            handleEmailInput(event, containerId) {
                if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault();
                    this.addEmailFromInput(containerId);
                } else if (event.key === 'Backspace' && event.target.value === '') {
                    // Remove last chip if backspace on empty input
                    const container = document.getElementById(containerId);
                    const chips = container.querySelectorAll('.email-chip');
                    if (chips.length > 0) {
                        chips[chips.length - 1].remove();
                    }
                }
            }

            addEmailFromInput(containerId) {
                const inputId = containerId.replace('Recipients', 'Input');
                const input = document.getElementById(inputId);
                if (!input) return;

                const email = input.value.trim();
                if (email && this.isValidEmail(email)) {
                    const container = document.getElementById(containerId);
                    const chipHTML = this.createEmailChip(email, containerId);
                    input.insertAdjacentHTML('beforebegin', chipHTML);
                    input.value = '';
                } else if (email) {
                    this.showToast('Adresse email invalide', 'warning');
                    input.focus();
                }
            }

            removeEmailChip(chipId, containerId) {
                const chip = document.getElementById(chipId);
                if (chip) chip.remove();
                
                // Focus input after removal
                this.focusEmailInput(containerId);
            }

            isValidEmail(email) {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
            }

            getDefaultReplyBody(task) {
                const senderName = task.emailFromName || task.emailFrom?.split('@')[0] || 'l\'expéditeur';
                return `Bonjour ${senderName},\n\n\n\nCordialement,\n[Votre nom]`;
            }

            formatText(command) {
                const textarea = document.getElementById('emailBody');
                if (!textarea) return;

                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selectedText = textarea.value.substring(start, end);
                
                let formattedText = selectedText;
                switch (command) {
                    case 'bold':
                        formattedText = `**${selectedText}**`;
                        break;
                    case 'italic':
                        formattedText = `*${selectedText}*`;
                        break;
                    case 'underline':
                        formattedText = `__${selectedText}__`;
                        break;
                }
                
                textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
                textarea.focus();
                textarea.setSelectionRange(start, start + formattedText.length);
            }

            insertTemplate() {
                const templates = [
                    {
                        name: 'Réponse professionnelle',
                        text: 'Bonjour,\n\nMerci pour votre message. J\'ai bien pris connaissance de votre demande.\n\n[Votre réponse]\n\nJe reste à votre disposition pour toute information complémentaire.\n\nCordialement,\n[Votre nom]'
                    },
                    {
                        name: 'Accusé de réception',
                        text: 'Bonjour,\n\nJe vous confirme la bonne réception de votre email.\n\nJe reviens vers vous dans les plus brefs délais.\n\nCordialement,\n[Votre nom]'
                    },
                    {
                        name: 'Demande d\'informations',
                        text: 'Bonjour,\n\nPour pouvoir traiter votre demande, j\'aurais besoin des informations suivantes :\n\n- [Information 1]\n- [Information 2]\n- [Information 3]\n\nMerci de me les faire parvenir dès que possible.\n\nCordialement,\n[Votre nom]'
                    }
                ];

                const templateChoice = prompt(
                    'Choisir un modèle :\n\n' + 
                    templates.map((t, i) => `${i + 1}. ${t.name}`).join('\n') +
                    '\n\nEntrez le numéro du modèle :'
                );

                if (templateChoice && templates[parseInt(templateChoice) - 1]) {
                    const textarea = document.getElementById('emailBody');
                    if (textarea) {
                        textarea.value = templates[parseInt(templateChoice) - 1].text;
                        textarea.focus();
                    }
                }
            }

            toggleOriginalEmail(taskId) {
                const content = document.getElementById(`originalEmail_${taskId}`);
                const button = content.parentElement.querySelector('.btn-toggle-original i');
                
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    button.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    button.parentElement.childNodes[1].textContent = ' Masquer';
                } else {
                    content.style.display = 'none';
                    button.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    button.parentElement.childNodes[1].textContent = ' Afficher';
                }
            }

            getEmailRecipients(containerId) {
                const container = document.getElementById(containerId);
                if (!container) return [];
                
                const emails = [];
                container.querySelectorAll('.email-chip .email-text').forEach(span => {
                    emails.push(span.textContent);
                });
                
                // Also check if there's text in the input
                const inputId = containerId.replace('Recipients', 'Input');
                const input = document.getElementById(inputId);
                if (input && input.value.trim() && this.isValidEmail(input.value.trim())) {
                    emails.push(input.value.trim());
                }
                
                return emails;
            }

            async sendReply(taskId, modalId) {
                const to = this.getEmailRecipients('toRecipients');
                const cc = this.getEmailRecipients('ccRecipients');
                const bcc = this.getEmailRecipients('bccRecipients');
                const subject = document.getElementById('emailSubject')?.value || '';
                const body = document.getElementById('emailBody')?.value || '';

                if (to.length === 0) {
                    this.showToast('Veuillez ajouter au moins un destinataire', 'warning');
                    return;
                }

                if (!body.trim()) {
                    this.showToast('Le message ne peut pas être vide', 'warning');
                    return;
                }

                // Simulate sending email (in real app, this would call an API)
                try {
                    // Add reply to task
                    window.taskManager.addEmailReply(taskId, {
                        to,
                        cc,
                        bcc,
                        subject,
                        body
                    });

                    this.closeModal(modalId);
                    this.showToast('Email envoyé avec succès', 'success');
                    
                    // Refresh view to update task status
                    this.refreshView();
                } catch (error) {
                    console.error('Error sending email:', error);
                    this.showToast('Erreur lors de l\'envoi de l\'email', 'error');
                }
            }

            // Create/Edit Modal
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
                
                setTimeout(() => {
                    const titleInput = document.getElementById('new-task-title');
                    if (titleInput) titleInput.focus();
                }, 100);
            }

            buildCreateForm() {
                const categories = window.taskManager?.getAllCategories() || [];
                
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
                                <label>Statut</label>
                                <select id="new-task-status" class="form-select">
                                    <option value="todo" selected>⏳ À faire</option>
                                    <option value="in-progress">🔄 En cours</option>
                                    <option value="relance">🔔 Relancé</option>
                                    <option value="bloque">🚫 Bloqué</option>
                                    <option value="reporte">⏰ Reporté</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Catégorie</label>
                                <select id="new-task-category" class="form-select">
                                    ${categories.map(cat => `
                                        <option value="${cat}" ${cat === 'work' ? 'selected' : ''}>${this.getCategoryLabel(cat)}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Client/Projet</label>
                                <input type="text" id="new-task-client" class="form-input" 
                                       placeholder="Nom du client ou projet" value="Interne" />
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date d'échéance</label>
                                <input type="date" id="new-task-duedate" class="form-input" />
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <div class="section-header">
                                <h3><i class="fas fa-check-square"></i> Liste de contrôle</h3>
                                <button type="button" class="btn-add-checklist" onclick="window.tasksView.addChecklistItem('new-task-checklist')">
                                    <i class="fas fa-plus"></i> Ajouter
                                </button>
                            </div>
                            <div id="new-task-checklist" class="checklist-container">
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
                
                if (task.checklist && task.checklist.length > 0) {
                    setTimeout(() => {
                        task.checklist.forEach(item => {
                            this.addChecklistItem('edit-task-checklist', item.text, item.completed);
                        });
                    }, 100);
                }
            }

            buildEditForm(task) {
                const categories = window.taskManager?.getAllCategories() || [];
                
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
                                    <option value="relance" ${task.status === 'relance' ? 'selected' : ''}>🔔 Relancé</option>
                                    <option value="bloque" ${task.status === 'bloque' ? 'selected' : ''}>🚫 Bloqué</option>
                                    <option value="reporte" ${task.status === 'reporte' ? 'selected' : ''}>⏰ Reporté</option>
                                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>✅ Terminé</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Catégorie</label>
                                <select id="edit-category" class="form-select">
                                    ${categories.map(cat => `
                                        <option value="${cat}" ${task.category === cat ? 'selected' : ''}>${this.getCategoryLabel(cat)}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Client/Projet</label>
                                <input type="text" id="edit-client" class="form-input" 
                                       value="${this.escapeHtml(task.client)}" />
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date d'échéance</label>
                                <input type="date" id="edit-duedate" class="form-input" 
                                       value="${task.dueDate || ''}" />
                            </div>
                        </div>
                        
                        ${task.hasEmail ? `
                            <div class="form-section">
                                <h3><i class="fas fa-envelope"></i> Informations Email</h3>
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
                        
                        <div class="form-section">
                            <div class="section-header">
                                <h3><i class="fas fa-check-square"></i> Liste de contrôle</h3>
                                <button type="button" class="btn-add-checklist" onclick="window.tasksView.addChecklistItem('edit-task-checklist')">
                                    <i class="fas fa-plus"></i> Ajouter
                                </button>
                            </div>
                            <div id="edit-task-checklist" class="checklist-container">
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
                                ${task.hasEmail && task.needsReply && !task.emailReplied ? `
                                    <button class="btn-modal btn-info" onclick="window.tasksView.showReplyModal('${task.id}')">
                                        <i class="fas fa-reply"></i> Répondre
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
                const checklistProgress = this.getChecklistProgress(task.checklist);
                
                return `
                    <div class="task-details-modern">
                        <div class="task-header-modern">
                            <div class="task-title-section">
                                <h1 class="task-title-main">${this.escapeHtml(task.title)}</h1>
                                <div class="task-id-ref">ID: ${task.id}</div>
                            </div>
                            <div class="task-status-section">
                                <span class="priority-badge-modern priority-${task.priority}">
                                    ${priorityIcon} ${this.getPriorityLabel(task.priority)}
                                </span>
                                <span class="status-badge-modern status-${task.status}">
                                    ${this.getStatusIcon(task.status)} ${statusLabel}
                                </span>
                            </div>
                        </div>

                        <div class="task-info-grid">
                            <div class="info-card">
                                <div class="info-card-header">
                                    <i class="fas fa-building"></i>
                                    <span>Client/Projet</span>
                                </div>
                                <div class="info-card-content">
                                    ${this.getDisplayClient(task).icon} ${this.escapeHtml(task.client)}
                                </div>
                            </div>

                            <div class="info-card">
                                <div class="info-card-header">
                                    <i class="fas fa-folder"></i>
                                    <span>Catégorie</span>
                                </div>
                                <div class="info-card-content">
                                    ${this.getCategoryIcon(task.category)} ${this.getCategoryName(task.category)}
                                </div>
                            </div>

                            <div class="info-card ${dueDateInfo.className}">
                                <div class="info-card-header">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>Échéance</span>
                                </div>
                                <div class="info-card-content">
                                    ${dueDateInfo.text || 'Aucune échéance définie'}
                                </div>
                            </div>

                            <div class="info-card">
                                <div class="info-card-header">
                                    <i class="fas fa-clock"></i>
                                    <span>Dates</span>
                                </div>
                                <div class="info-card-content">
                                    <div class="date-item">Créé: ${new Date(task.createdAt).toLocaleString('fr-FR')}</div>
                                    <div class="date-item">Modifié: ${new Date(task.updatedAt).toLocaleString('fr-FR')}</div>
                                    ${task.completedAt ? `<div class="date-item">Terminé: ${new Date(task.completedAt).toLocaleString('fr-FR')}</div>` : ''}
                                </div>
                            </div>
                        </div>

                        ${task.description ? `
                            <div class="section-modern">
                                <div class="section-header-modern">
                                    <i class="fas fa-align-left"></i>
                                    <span>Description</span>
                                </div>
                                <div class="section-content-modern">
                                    <div class="description-modern">
                                        ${this.formatDescription(task.description)}
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        ${task.checklist && task.checklist.length > 0 ? `
                            <div class="section-modern">
                                <div class="section-header-modern">
                                    <i class="fas fa-check-square"></i>
                                    <span>Liste de contrôle</span>
                                    <div class="progress-indicator">
                                        ${checklistProgress.completed}/${checklistProgress.total} terminées
                                    </div>
                                </div>
                                <div class="section-content-modern">
                                    <div class="checklist-modern">
                                        <div class="progress-bar-modern">
                                            <div class="progress-fill-modern" style="width: ${checklistProgress.total > 0 ? (checklistProgress.completed / checklistProgress.total) * 100 : 0}%"></div>
                                        </div>
                                        <div class="checklist-items-modern">
                                            ${task.checklist.map(item => `
                                                <div class="checklist-item-modern ${item.completed ? 'completed' : ''}">
                                                    <div class="check-indicator">
                                                        <i class="fas ${item.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                                                    </div>
                                                    <span class="item-text-modern">${this.escapeHtml(item.text)}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        ${task.hasEmail ? `
                            <div class="section-modern email-section">
                                <div class="section-header-modern">
                                    <i class="fas fa-envelope"></i>
                                    <span>Informations Email</span>
                                    ${task.needsReply && !task.emailReplied ? '<span class="reply-required">Réponse requise</span>' : ''}
                                    ${task.emailReplied ? '<span class="email-replied">✅ Répondu</span>' : ''}
                                </div>
                                <div class="section-content-modern">
                                    <div class="email-header-modern">
                                        <div class="email-meta-grid">
                                            <div class="email-meta-item">
                                                <strong>De:</strong>
                                                <span>${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')}</span>
                                            </div>
                                            <div class="email-meta-item">
                                                <strong>Email:</strong>
                                                <span>${this.escapeHtml(task.emailFrom || 'Non disponible')}</span>
                                            </div>
                                            <div class="email-meta-item">
                                                <strong>Sujet:</strong>
                                                <span>${this.escapeHtml(task.emailSubject || 'Sans sujet')}</span>
                                            </div>
                                            <div class="email-meta-item">
                                                <strong>Date:</strong>
                                                <span>${task.emailDate ? new Date(task.emailDate).toLocaleString('fr-FR') : 'Non disponible'}</span>
                                            </div>
                                            <div class="email-meta-item">
                                                <strong>Domaine:</strong>
                                                <span>${task.emailDomain || 'Non disponible'}</span>
                                            </div>
                                            <div class="email-meta-item">
                                                <strong>Répondu:</strong>
                                                <span class="${task.emailReplied ? 'replied' : 'not-replied'}">
                                                    ${task.emailReplied ? '✅ Oui' : '❌ Non'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    ${task.emailContent ? `
                                        <div class="email-content-modern">
                                            <div class="email-content-header">
                                                <i class="fas fa-file-alt"></i>
                                                <span>Contenu de l'email</span>
                                                <button class="btn-toggle-email" onclick="window.tasksView.toggleEmailContent('${task.id}')">
                                                    <i class="fas fa-chevron-down"></i>
                                                </button>
                                            </div>
                                            <div class="email-content-body" id="emailContent_${task.id}">
                                                ${this.formatEmailContentModern(task.emailContent)}
                                            </div>
                                        </div>
                                    ` : ''}

                                    ${task.emailReplies && task.emailReplies.length > 0 ? `
                                        <div class="email-replies-section">
                                            <div class="replies-header">
                                                <i class="fas fa-history"></i>
                                                <span>Historique des réponses (${task.emailReplies.length})</span>
                                            </div>
                                            <div class="replies-list">
                                                ${task.emailReplies.map(reply => `
                                                    <div class="reply-item">
                                                        <div class="reply-meta">
                                                            <span class="reply-date">${new Date(reply.sentAt).toLocaleString('fr-FR')}</span>
                                                            <span class="reply-to">À: ${reply.to.join(', ')}</span>
                                                        </div>
                                                        <div class="reply-subject">${this.escapeHtml(reply.subject)}</div>
                                                        <div class="reply-body">${this.escapeHtml(reply.body).replace(/\n/g, '<br>')}</div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}

                        ${task.actions && task.actions.length > 0 ? `
                            <div class="section-modern">
                                <div class="section-header-modern">
                                    <i class="fas fa-tasks"></i>
                                    <span>Actions Requises</span>
                                    <div class="actions-count">${task.actions.length} action(s)</div>
                                </div>
                                <div class="section-content-modern">
                                    <div class="actions-modern">
                                        ${task.actions.map((action, idx) => `
                                            <div class="action-item-modern">
                                                <div class="action-number">${idx + 1}</div>
                                                <div class="action-content">
                                                    <div class="action-text">${this.escapeHtml(action.text)}</div>
                                                    ${action.deadline ? `
                                                        <div class="action-deadline">${this.formatDeadline(action.deadline)}</div>
                                                    ` : ''}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }

            // Helper methods
            addChecklistItem(containerId, text = '', completed = false) {
                const container = document.getElementById(containerId);
                if (!container) return;
                
                const itemId = 'cl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                const itemHTML = `
                    <div class="checklist-item" data-item-id="${itemId}">
                        <input type="checkbox" class="checklist-checkbox" ${completed ? 'checked' : ''}>
                        <input type="text" class="checklist-input" placeholder="Élément de la liste..." value="${text}">
                        <button type="button" class="btn-remove-checklist" onclick="window.tasksView.removeChecklistItem('${itemId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                container.insertAdjacentHTML('beforeend', itemHTML);
                
                const newInput = container.querySelector(`[data-item-id="${itemId}"] .checklist-input`);
                if (newInput && !text) {
                    newInput.focus();
                }
            }

            removeChecklistItem(itemId) {
                const item = document.querySelector(`[data-item-id="${itemId}"]`);
                if (item) {
                    item.remove();
                }
            }

            getChecklistFromForm(containerId) {
                const container = document.getElementById(containerId);
                if (!container) return [];
                
                const items = [];
                container.querySelectorAll('.checklist-item').forEach(item => {
                    const checkbox = item.querySelector('.checklist-checkbox');
                    const input = item.querySelector('.checklist-input');
                    const text = input.value.trim();
                    
                    if (text) {
                        items.push({
                            id: item.dataset.itemId,
                            text: text,
                            completed: checkbox.checked
                        });
                    }
                });
                
                return items;
            }

            createNewTask(modalId) {
                const title = document.getElementById('new-task-title')?.value?.trim();
                const description = document.getElementById('new-task-description')?.value?.trim();
                const priority = document.getElementById('new-task-priority')?.value;
                const status = document.getElementById('new-task-status')?.value;
                const category = document.getElementById('new-task-category')?.value;
                const client = document.getElementById('new-task-client')?.value?.trim();
                const dueDate = document.getElementById('new-task-duedate')?.value;
                const checklist = this.getChecklistFromForm('new-task-checklist');

                if (!title) {
                    this.showToast('Le titre est requis', 'warning');
                    return;
                }

                const taskData = {
                    title,
                    description: description || '',
                    priority,
                    status,
                    category: category || 'other',
                    dueDate: dueDate || null,
                    client: client || 'Interne',
                    checklist: checklist,
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

            saveTaskChanges(taskId, modalId) {
                const title = document.getElementById('edit-title')?.value?.trim();
                const description = document.getElementById('edit-description')?.value?.trim();
                const priority = document.getElementById('edit-priority')?.value;
                const status = document.getElementById('edit-status')?.value;
                const category = document.getElementById('edit-category')?.value;
                const client = document.getElementById('edit-client')?.value?.trim();
                const dueDate = document.getElementById('edit-duedate')?.value;
                const needsReply = document.getElementById('edit-needs-reply')?.checked;
                const checklist = this.getChecklistFromForm('edit-task-checklist');

                if (!title) {
                    this.showToast('Le titre est requis', 'warning');
                    return;
                }

                const updates = {
                    title,
                    description,
                    priority,
                    status,
                    category: category || 'other',
                    client: client || 'Interne',
                    dueDate: dueDate || null,
                    needsReply: needsReply || false,
                    checklist: checklist
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

            // Filter and action methods
            toggleStatusFilters() {
                this.showStatusFilters = !this.showStatusFilters;
                this.updateFilterPanels();
            }

            toggleCategoryFilters() {
                this.showCategoryFilters = !this.showCategoryFilters;
                this.updateFilterPanels();
            }

            toggleAdvancedFilters() {
                this.showAdvancedFilters = !this.showAdvancedFilters;
                this.updateFilterPanels();
            }

            updateFilterPanels() {
                const statusPanel = document.getElementById('statusFiltersPanel');
                const categoryPanel = document.getElementById('categoryFiltersPanel');
                const advancedPanel = document.getElementById('advancedFiltersPanel');
                
                if (statusPanel) {
                    statusPanel.classList.toggle('show', this.showStatusFilters);
                }
                
                if (categoryPanel) {
                    categoryPanel.classList.toggle('show', this.showCategoryFilters);
                }
                
                if (advancedPanel) {
                    advancedPanel.classList.toggle('show', this.showAdvancedFilters);
                }
            }

            quickStatusFilter(filterId) {
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
                    case 'relance':
                    case 'bloque':
                    case 'reporte':
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

            quickCategoryFilter(filterId) {
                this.currentFilters.category = filterId === 'all' ? 'all' : filterId;
                this.refreshView();
            }

            updateFilter(filterType, value) {
                this.currentFilters[filterType] = value;
                this.refreshView();
            }

            clearSearch() {
                this.currentFilters.search = '';
                const searchInput = document.getElementById('taskSearchInput');
                if (searchInput) searchInput.value = '';
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
                this.showToast('Tous les filtres réinitialisés', 'info');
            }

            resetStatusFilters() {
                this.currentFilters.status = 'all';
                this.currentFilters.overdue = false;
                this.currentFilters.needsReply = false;
                this.refreshView();
                this.showToast('Filtres statuts réinitialisés', 'info');
            }

            resetCategoryFilters() {
                this.currentFilters.category = 'all';
                this.refreshView();
                this.showToast('Filtres catégories réinitialisés', 'info');
            }

            resetAdvancedFilters() {
                this.currentFilters.priority = 'all';
                this.currentFilters.client = 'all';
                
                const priorityFilter = document.getElementById('priorityFilter');
                const clientFilter = document.getElementById('clientFilter');
                
                if (priorityFilter) priorityFilter.value = 'all';
                if (clientFilter) clientFilter.value = 'all';
                
                this.refreshView();
                this.showToast('Filtres avancés réinitialisés', 'info');
            }

            // Selection methods
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

            toggleTaskSelection(taskId) {
                if (this.selectedTasks.has(taskId)) {
                    this.selectedTasks.delete(taskId);
                } else {
                    this.selectedTasks.add(taskId);
                }
                this.refreshView();
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
                        const status = prompt('Nouveau statut:\n1. À faire\n2. En cours\n3. Relancé\n4. Bloqué\n5. Reporté\n6. Terminé\n\nEntrez le numéro:');
                        const statuses = ['', 'todo', 'in-progress', 'relance', 'bloque', 'reporte', 'completed'];
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

            // Task actions
            markComplete(taskId) {
                window.taskManager.updateTask(taskId, { 
                    status: 'completed',
                    completedAt: new Date().toISOString()
                });
                this.showToast('Tâche marquée comme terminée', 'success');
                this.refreshView();
            }

            handleTaskClick(event, taskId) {
                if (event.target.type === 'checkbox') {
                    return;
                }
                
                if (event.target.closest('.task-actions')) {
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

            changeViewMode(mode) {
                this.currentViewMode = mode;
                this.refreshView();
            }

            refreshTasks() {
                this.refreshView();
                this.showToast('Tâches actualisées', 'success');
            }

            refreshView() {
                const container = document.getElementById('tasksContainer');
                if (container) {
                    container.innerHTML = this.renderTasksList();
                }
                
                const stats = window.taskManager.getStats();
                document.querySelectorAll('.status-filters').forEach(container => {
                    container.innerHTML = this.buildStatusPills(stats);
                });
                
                document.querySelectorAll('.category-filters').forEach(container => {
                    container.innerHTML = this.buildCategoryPills(stats);
                });
                
                const clientFilter = document.getElementById('clientFilter');
                if (clientFilter) {
                    clientFilter.innerHTML = this.buildClientFilterOptions();
                }
                
                this.updateSelectionUI();
                this.updateFilterPanels();
                this.updateCurrentDate();
            }

            updateSelectionUI() {
                const selectedCount = this.selectedTasks.size;
                const allActionsDiv = document.querySelector('.all-actions-line');
                
                if (allActionsDiv) {
                    const existingPanel = allActionsDiv.querySelector('.selection-panel');
                    
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
                            allActionsDiv.insertAdjacentHTML('afterbegin', selectionHTML);
                        }
                    } else {
                        if (existingPanel) {
                            existingPanel.remove();
                        }
                    }
                }
            }

            updateCurrentDate() {
                const dateDisplay = document.getElementById('currentDateDisplay');
                if (dateDisplay) {
                    dateDisplay.textContent = new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                    });
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

            closeModal(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.remove();
                }
                document.body.style.overflow = 'auto';
            }

            toggleEmailContent(taskId) {
                const content = document.getElementById(`emailContent_${taskId}`);
                const toggle = document.querySelector(`[onclick="window.tasksView.toggleEmailContent('${taskId}')"] i`);
                
                if (content && toggle) {
                    const isVisible = content.style.display !== 'none';
                    content.style.display = isVisible ? 'none' : 'block';
                    toggle.classList.toggle('fa-chevron-down', isVisible);
                    toggle.classList.toggle('fa-chevron-up', !isVisible);
                }
            }

            // Utility methods
            hasActiveFilters() {
                return this.currentFilters.status !== 'all' ||
                       this.currentFilters.priority !== 'all' ||
                       this.currentFilters.category !== 'all' ||
                       this.currentFilters.client !== 'all' ||
                       this.currentFilters.search !== '' ||
                       this.currentFilters.overdue ||
                       this.currentFilters.needsReply;
            }

            isStatusFilterActive(filterId) {
                switch (filterId) {
                    case 'all': return this.currentFilters.status === 'all' && !this.currentFilters.overdue && !this.currentFilters.needsReply;
                    case 'todo': return this.currentFilters.status === 'todo';
                    case 'in-progress': return this.currentFilters.status === 'in-progress';
                    case 'relance': return this.currentFilters.status === 'relance';
                    case 'bloque': return this.currentFilters.status === 'bloque';
                    case 'reporte': return this.currentFilters.status === 'reporte';
                    case 'completed': return this.currentFilters.status === 'completed';
                    case 'overdue': return this.currentFilters.overdue;
                    case 'needsReply': return this.currentFilters.needsReply;
                    default: return false;
                }
            }

            isCategoryFilterActive(filterId) {
                return this.currentFilters.category === filterId;
            }

            getChecklistProgress(checklist) {
                if (!Array.isArray(checklist)) return { completed: 0, total: 0 };
                
                const total = checklist.length;
                const completed = checklist.filter(item => item.completed).length;
                
                return { completed, total };
            }

            getDisplayClient(task) {
                let clientName = task.client || 'Interne';
                let clientIcon = '🏢';

                if (task.hasEmail) {
                    if (task.emailFromName && task.emailFromName.trim() && task.emailFromName !== task.emailFrom) {
                        clientName = task.emailFromName;
                        clientIcon = '👤';
                    } else if (task.emailFrom) {
                        if (task.client && task.client !== 'Externe' && task.client !== 'Interne') {
                            clientName = task.client;
                            clientIcon = '🏢';
                        } else {
                            const domain = task.emailFrom.split('@')[1];
                            clientName = window.taskManager?.formatDomainAsClient(domain) || task.emailFrom;
                            clientIcon = '📧';
                        }
                    }
                } else {
                    if (clientName === 'Interne') {
                        clientIcon = '🏢';
                    } else {
                        clientIcon = '👤';
                    }
                }

                return {
                    name: clientName,
                    icon: clientIcon
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
                    'relance': '🔔',
                    'bloque': '🚫',
                    'reporte': '⏰',
                    completed: '✅' 
                };
                return icons[status] || '⏳';
            }

            getStatusLabel(status) {
                const labels = { 
                    todo: 'À faire', 
                    'in-progress': 'En cours', 
                    'relance': 'Relancé',
                    'bloque': 'Bloqué',
                    'reporte': 'Reporté',
                    completed: 'Terminé' 
                };
                return labels[status] || 'À faire';
            }

            getCategoryLabel(category) {
                const labels = {
                    email: '📧 Email',
                    work: '💼 Travail',
                    meeting: '👥 Réunion',
                    training: '📚 Formation',
                    other: '📝 Autre'
                };
                return labels[category] || `📄 ${category}`;
            }

            getCategoryIcon(category) {
                const icons = {
                    email: '📧',
                    work: '💼',
                    meeting: '👥',
                    training: '📚',
                    other: '📝'
                };
                return icons[category] || '📄';
            }

            getCategoryName(category) {
                const names = {
                    email: 'Email',
                    work: 'Travail',
                    meeting: 'Réunion',
                    training: 'Formation',
                    other: 'Autre'
                };
                return names[category] || category;
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

            formatDescription(description) {
                if (!description) return '';
                return `<div class="simple-description">${this.escapeHtml(description).replace(/\n/g, '<br>')}</div>`;
            }

            formatEmailContentModern(content) {
                if (!content) return '<p>Contenu non disponible</p>';
                
                const cleanContent = content
                    .replace(/\n/g, '<br>')
                    .replace(/Email de:/g, '<strong>Email de:</strong>')
                    .replace(/Date:/g, '<strong>Date:</strong>')
                    .replace(/Sujet:/g, '<strong>Sujet:</strong>');
                    
                return `<div class="email-content-display">${cleanContent}</div>`;
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

            showToast(message, type = 'info') {
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                
                const iconMap = {
                    success: 'fa-check-circle',
                    error: 'fa-exclamation-circle',
                    warning: 'fa-exclamation-triangle',
                    info: 'fa-info-circle'
                };
                
                toast.innerHTML = `
                    <i class="fas ${iconMap[type]} toast-icon"></i>
                    <span>${message}</span>
                `;
                
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.classList.add('show');
                }, 100);
                
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }, 3000);
            }

            // Styles
            addStyles() {
                if (document.getElementById('taskStyles_v13')) return;
                
                const styles = document.createElement('style');
                styles.id = 'taskStyles_v13';
                styles.textContent = `
                    .tasks-page-v13 {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                        min-height: 100vh;
                        padding: 16px;
                        font-size: 14px;
                    }

                    /* Main Controls Section */
                    .main-controls-section {
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

                    .search-and-actions-line {
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        width: 100%;
                    }

                    .search-section {
                        flex: 1;
                        max-width: 300px;
                        flex-shrink: 0;
                    }

                    .all-actions-line {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        flex-wrap: nowrap;
                        flex: 1;
                        justify-content: flex-end;
                    }

                    .search-box {
                        position: relative;
                        display: flex;
                        align-items: center;
                        height: 44px;
                    }

                    .search-input {
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

                    .search-input:focus {
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

                    .btn-new-task {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 10px 20px;
                        background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 700;
                        cursor: pointer;
                        transition: var(--transition);
                        box-shadow: var(--shadow-sm);
                        white-space: nowrap;
                    }

                    .btn-new-task:hover {
                        background: linear-gradient(135deg, #059669 0%, #047857 100%);
                        transform: translateY(-2px);
                        box-shadow: var(--shadow-md);
                    }

                    .current-date {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px 16px;
                        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        color: var(--text-primary);
                        font-size: 13px;
                        font-weight: 600;
                        white-space: nowrap;
                        flex-shrink: 0;
                    }

                    .current-date i {
                        color: var(--primary-color);
                        font-size: 14px;
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

                    /* View and Controls Line */
                    .view-and-controls-line {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                        width: 100%;
                        flex-wrap: wrap;
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

                    .filter-toggles {
                        display: flex;
                        gap: 8px;
                        flex-shrink: 0;
                    }

                    .filter-toggle {
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
                        white-space: nowrap;
                    }

                    .filter-toggle:hover {
                        border-color: var(--primary-color);
                        background: #f0f9ff;
                        transform: translateY(-1px);
                        box-shadow: var(--shadow-sm);
                    }

                    .filter-toggle.active {
                        background: linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%);
                        color: white;
                        border-color: var(--primary-color);
                        box-shadow: var(--shadow-md);
                    }

                    .new-and-sort {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        flex-shrink: 0;
                    }

                    .sort-quick {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        flex-shrink: 0;
                    }

                    .sort-label {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-weight: 600;
                        color: var(--text-primary);
                        font-size: 13px;
                        white-space: nowrap;
                    }

                    .sort-select {
                        height: 36px;
                        padding: 0 12px;
                        border: 1px solid var(--border-color);
                        border-radius: 6px;
                        background: white;
                        font-size: 13px;
                        color: var(--text-primary);
                        cursor: pointer;
                        transition: var(--transition);
                        min-width: 140px;
                    }

                    /* Filters Section */
                    .filters-conditional-section {
                        display: flex;
                        flex-direction: column;
                        gap: 0;
                        margin-bottom: 16px;
                    }

                    .status-filters-panel,
                    .category-filters-panel,
                    .advanced-filters-panel {
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 12px;
                        max-height: 0;
                        overflow: hidden;
                        transition: all 0.3s ease;
                        opacity: 0;
                        margin-bottom: 0;
                    }

                    .status-filters-panel.show,
                    .category-filters-panel.show,
                    .advanced-filters-panel.show {
                        max-height: 400px;
                        opacity: 1;
                        padding: 20px;
                        margin-bottom: 12px;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                        overflow: visible;
                    }

                    .filter-section-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 16px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid var(--border-color);
                    }

                    .filter-group-title {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-weight: 700;
                        color: var(--text-primary);
                        font-size: 14px;
                    }

                    .btn-reset-section {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        padding: 6px 12px;
                        background: var(--bg-secondary);
                        color: var(--text-secondary);
                        border: 1px solid var(--border-color);
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: var(--transition);
                    }

                    .btn-reset-section:hover {
                        background: var(--border-color);
                        color: var(--text-primary);
                        transform: translateY(-1px);
                    }

                    .status-filters,
                    .category-filters {
                        display: flex;
                        flex-direction: row;
                        gap: 8px;
                        flex-wrap: wrap;
                        justify-content: flex-start;
                        align-items: center;
                        width: 100%;
                    }

                    .status-pill,
                    .category-pill {
                        display: inline-flex;
                        flex-direction: row;
                        align-items: center;
                        gap: 6px;
                        padding: 8px 12px;
                        background: white;
                        border: 2px solid var(--border-color);
                        border-radius: 8px;
                        cursor: pointer;
                        transition: var(--transition);
                        font-size: 11px;
                        font-weight: 600;
                        color: var(--text-primary);
                        min-width: 80px;
                        max-width: 140px;
                        justify-content: space-between;
                        position: relative;
                        overflow: hidden;
                        flex-shrink: 0;
                        margin: 3px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }

                    .status-pill:hover,
                    .category-pill:hover {
                        border-color: var(--pill-color, var(--primary-color));
                        background: rgba(59, 130, 246, 0.05);
                        transform: translateY(-1px);
                        box-shadow: var(--shadow-sm);
                    }

                    .status-pill.active,
                    .category-pill.active {
                        background: var(--pill-color, var(--primary-color));
                        color: white;
                        border-color: var(--pill-color, var(--primary-color));
                        box-shadow: var(--shadow-md);
                    }

                    .pill-icon {
                        font-size: 14px;
                    }

                    .pill-text {
                        flex: 1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .pill-count {
                        background: rgba(0, 0, 0, 0.1);
                        padding: 2px 6px;
                        border-radius: 10px;
                        font-size: 10px;
                        min-width: 20px;
                        text-align: center;
                    }

                    .status-pill.active .pill-count,
                    .category-pill.active .pill-count {
                        background: rgba(255, 255, 255, 0.3);
                        color: white;
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
                        height: 36px;
                        padding: 0 12px;
                        border: 1px solid var(--border-color);
                        border-radius: 6px;
                        background: white;
                        font-size: 12px;
                        color: var(--text-primary);
                        cursor: pointer;
                        transition: var(--transition);
                        min-width: 160px;
                    }

                    .btn-reset {
                        height: 36px;
                        padding: 0 12px;
                        border: 1px solid var(--border-color);
                        border-radius: 6px;
                        background: var(--bg-secondary);
                        color: var(--text-secondary);
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: var(--transition);
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        white-space: nowrap;
                    }

                    .btn-reset:hover {
                        background: var(--border-color);
                        color: var(--text-primary);
                        transform: translateY(-1px);
                    }

                    /* Tasks Container */
                    .tasks-container {
                        background: transparent;
                    }

                    /* Minimal View */
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
                        gap: 8px;
                        flex-shrink: 0;
                    }

                    .task-status-badge {
                        font-size: 11px;
                        font-weight: 600;
                        padding: 3px 6px;
                        border-radius: 4px;
                        white-space: nowrap;
                    }

                    .task-status-badge.status-todo {
                        background: #fef3c7;
                        color: #d97706;
                    }

                    .task-status-badge.status-in-progress {
                        background: #eff6ff;
                        color: #2563eb;
                    }

                    .task-status-badge.status-relance {
                        background: #fef2f2;
                        color: #dc2626;
                    }

                    .task-status-badge.status-bloque {
                        background: #f3f4f6;
                        color: #6b7280;
                    }

                    .task-status-badge.status-reporte {
                        background: #f0f9ff;
                        color: #0ea5e9;
                    }

                    .task-status-badge.status-completed {
                        background: #f0fdf4;
                        color: #16a34a;
                    }

                    .task-deadline {
                        font-size: 12px;
                        font-weight: 500;
                        white-space: nowrap;
                        text-align: center;
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

                    /* Normal View */
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

                    .status-badge,
                    .checklist-badge,
                    .email-badge,
                    .replied-badge {
                        padding: 3px 6px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: 600;
                        border: 1px solid;
                        display: flex;
                        align-items: center;
                        gap: 3px;
                    }

                    .checklist-badge {
                        background: #f3e8ff;
                        color: #8b5cf6;
                        border-color: #c4b5fd;
                    }

                    .email-badge {
                        background: #eff6ff;
                        color: #2563eb;
                        border-color: #bfdbfe;
                    }

                    .replied-badge {
                        background: #f0fdf4;
                        color: #16a34a;
                        border-color: #bbf7d0;
                    }

                    .task-details {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        font-size: 12px;
                        color: var(--text-secondary);
                    }

                    /* Detailed View */
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
                        padding: 3px 6px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: 600;
                        border: 1px solid;
                        display: flex;
                        align-items: center;
                        gap: 3px;
                    }

                    .priority-badge.priority-urgent {
                        background: #fef2f2;
                        color: #dc2626;
                        border-color: #fecaca;
                    }

                    .priority-badge.priority-high {
                        background: #fef3c7;
                        color: #d97706;
                        border-color: #fde68a;
                    }

                    .priority-badge.priority-medium {
                        background: #eff6ff;
                        color: #2563eb;
                        border-color: #bfdbfe;
                    }

                    .priority-badge.priority-low {
                        background: #f0fdf4;
                        color: #16a34a;
                        border-color: #bbf7d0;
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

                    .checklist-summary {
                        margin-bottom: 12px;
                        padding: 8px;
                        background: rgba(139, 92, 246, 0.05);
                        border: 1px solid rgba(139, 92, 246, 0.2);
                        border-radius: 6px;
                    }

                    .checklist-progress {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .progress-bar {
                        flex: 1;
                        height: 6px;
                        background: #e5e7eb;
                        border-radius: 3px;
                        overflow: hidden;
                    }

                    .progress-fill {
                        height: 100%;
                        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
                        transition: width 0.3s ease;
                    }

                    .progress-text {
                        font-size: 11px;
                        font-weight: 600;
                        color: #8b5cf6;
                        white-space: nowrap;
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

                    .btn-detailed.reply {
                        background: #0ea5e9;
                        color: white;
                        border-color: #0ea5e9;
                    }

                    .btn-detailed.reply:hover {
                        background: #0284c7;
                        border-color: #0284c7;
                    }

                    /* Empty State */
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

                    .btn-action.btn-primary {
                        background: var(--primary-color);
                        color: white;
                        border-color: var(--primary-color);
                    }

                    .btn-action.btn-primary:hover {
                        background: var(--primary-hover);
                        border-color: var(--primary-hover);
                    }

                    /* Forms */
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

                    .section-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                    }

                    .btn-add-checklist {
                        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: var(--transition);
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }

                    .btn-add-checklist:hover {
                        background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
                        transform: translateY(-1px);
                    }

                    .checklist-container {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        min-height: 40px;
                        padding: 8px;
                        border: 2px dashed #d1d5db;
                        border-radius: 8px;
                        background: #f9fafb;
                    }

                    .checklist-container:empty::before {
                        content: "Aucun élément dans la liste. Cliquez sur 'Ajouter' pour commencer.";
                        color: #9ca3af;
                        font-style: italic;
                        font-size: 13px;
                        text-align: center;
                        padding: 16px;
                        display: block;
                    }

                    .checklist-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px;
                        background: white;
                        border: 1px solid var(--border-color);
                        border-radius: 6px;
                        transition: var(--transition);
                    }

                    .checklist-item:hover {
                        border-color: var(--primary-color);
                        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
                    }

                    .checklist-checkbox {
                        width: 16px;
                        height: 16px;
                        flex-shrink: 0;
                        cursor: pointer;
                    }

                    .checklist-input {
                        flex: 1;
                        border: none;
                        outline: none;
                        font-size: 14px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        background: transparent;
                        transition: background-color 0.2s ease;
                    }

                    .checklist-input:focus {
                        background: #f8fafc;
                    }

                    .btn-remove-checklist {
                        background: #fef2f2;
                        color: #dc2626;
                        border: 1px solid #fecaca;
                        width: 28px;
                        height: 28px;
                        border-radius: 4px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        transition: var(--transition);
                        flex-shrink: 0;
                    }

                    .btn-remove-checklist:hover {
                        background: #fee2e2;
                        border-color: #fca5a5;
                        transform: scale(1.05);
                    }

                    .email-info-readonly {
                        background: var(--bg-secondary);
                        padding: 12px;
                        border-radius: 6px;
                        font-size: 13px;
                        line-height: 1.6;
                    }

                    .email-info-readonly div {
                        margin-bottom: 8px;
                    }

                    .email-info-readonly div:last-child {
                        margin-bottom: 0;
                    }

                    /* Task Details Modal */
                    .task-details-modern {
                        max-width: none;
                        padding: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }

                    .task-header-modern {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding: 24px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-radius: 12px 12px 0 0;
                        margin-bottom: 0;
                    }

                    .task-title-section h1.task-title-main {
                        font-size: 28px;
                        font-weight: 700;
                        margin: 0 0 8px 0;
                        line-height: 1.2;
                        color: white;
                    }

                    .task-id-ref {
                        font-size: 13px;
                        opacity: 0.8;
                        font-family: 'Monaco', monospace;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 4px 8px;
                        border-radius: 4px;
                        display: inline-block;
                    }

                    .task-status-section {
                        display: flex;
                        gap: 12px;
                        flex-direction: column;
                        align-items: flex-end;
                    }

                    .priority-badge-modern,
                    .status-badge-modern {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 600;
                        background: rgba(255, 255, 255, 0.9);
                        color: var(--text-primary);
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }

                    .task-info-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 16px;
                        padding: 24px;
                        background: #f8fafc;
                    }

                    .info-card {
                        background: white;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        padding: 20px;
                        transition: var(--transition);
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    }

                    .info-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                        border-color: var(--primary-color);
                    }

                    .info-card.deadline-overdue {
                        border-left: 4px solid var(--danger-color);
                        background: linear-gradient(135deg, #fef2f2 0%, white 100%);
                    }

                    .info-card.deadline-today {
                        border-left: 4px solid var(--warning-color);
                        background: linear-gradient(135deg, #fffbeb 0%, white 100%);
                    }

                    .info-card-header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 12px;
                        color: var(--text-secondary);
                        font-size: 14px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .info-card-header i {
                        color: var(--primary-color);
                        font-size: 16px;
                    }

                    .info-card-content {
                        font-size: 16px;
                        font-weight: 600;
                        color: var(--text-primary);
                        line-height: 1.4;
                    }

                    .date-item {
                        font-size: 14px;
                        margin-bottom: 6px;
                        display: flex;
                        justify-content: space-between;
                    }

                    .date-item:before {
                        content: "•";
                        color: var(--primary-color);
                        margin-right: 8px;
                    }

                    .section-modern {
                        background: white;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        margin-bottom: 20px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    }

                    .section-header-modern {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 16px 24px;
                        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                        border-bottom: 1px solid var(--border-color);
                        font-weight: 700;
                        color: var(--text-primary);
                    }

                    .section-header-modern i {
                        color: var(--primary-color);
                        margin-right: 8px;
                        font-size: 16px;
                    }

                    .section-content-modern {
                        padding: 24px;
                    }

                    .progress-indicator,
                    .actions-count,
                    .info-count,
                    .risks-count,
                    .replies-count {
                        background: var(--primary-color);
                        color: white;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                    }

                    .reply-required {
                        background: var(--danger-color);
                        color: white;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                        animation: pulse 2s infinite;
                    }

                    .email-replied {
                        background: var(--success-color);
                        color: white;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                    }

                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.7; }
                    }

                    .description-modern {
                        background: #f8fafc;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        padding: 20px;
                        font-size: 15px;
                        line-height: 1.6;
                        color: var(--text-primary);
                    }

                    .checklist-modern {
                        background: #f8fafc;
                        border-radius: 8px;
                        padding: 20px;
                    }

                    .progress-bar-modern {
                        width: 100%;
                        height: 8px;
                        background: #e2e8f0;
                        border-radius: 4px;
                        overflow: hidden;
                        margin-bottom: 20px;
                    }

                    .progress-fill-modern {
                        height: 100%;
                        background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
                        transition: width 0.3s ease;
                    }

                    .checklist-items-modern {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    .checklist-item-modern {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: white;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        transition: var(--transition);
                    }

                    .checklist-item-modern:hover {
                        border-color: var(--primary-color);
                        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
                    }

                    .checklist-item-modern.completed {
                        background: #f0fdf4;
                        border-color: var(--success-color);
                    }

                    .check-indicator i {
                        font-size: 16px;
                        color: #9ca3af;
                    }

                    .checklist-item-modern.completed .check-indicator i {
                        color: var(--success-color);
                    }

                    .item-text-modern {
                        flex: 1;
                        font-size: 15px;
                        color: var(--text-primary);
                    }

                    .checklist-item-modern.completed .item-text-modern {
                        text-decoration: line-through;
                        color: var(--text-secondary);
                    }

                    .email-section {
                        border-left: 4px solid var(--primary-color);
                    }

                    .email-header-modern {
                        background: #f8fafc;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 20px;
                    }

                    .email-meta-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 16px;
                    }

                    .email-meta-item {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }

                    .email-meta-item strong {
                        font-size: 12px;
                        color: var(--text-secondary);
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .email-meta-item span {
                        font-size: 14px;
                        color: var(--text-primary);
                        font-weight: 500;
                    }

                    .email-meta-item .replied {
                        color: var(--success-color);
                        font-weight: 600;
                    }

                    .email-meta-item .not-replied {
                        color: var(--danger-color);
                        font-weight: 600;
                    }

                    .email-content-modern {
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .email-content-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px 16px;
                        background: #f8fafc;
                        border-bottom: 1px solid var(--border-color);
                        font-weight: 600;
                        color: var(--text-primary);
                    }

                    .btn-toggle-email {
                        background: none;
                        border: none;
                        color: var(--primary-color);
                        cursor: pointer;
                        padding: 4px;
                        border-radius: 4px;
                        transition: var(--transition);
                    }

                    .btn-toggle-email:hover {
                        background: var(--primary-color);
                        color: white;
                    }

                    .email-content-body {
                        padding: 20px;
                        background: white;
                        max-height: 400px;
                        overflow-y: auto;
                    }

                    .email-content-display {
                        font-size: 14px;
                        line-height: 1.6;
                        color: var(--text-primary);
                    }

                    .email-replies-section {
                        margin-top: 20px;
                        padding: 20px;
                        background: #f8fafc;
                        border-radius: 8px;
                    }

                    .replies-header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 16px;
                        font-weight: 600;
                        color: var(--text-primary);
                    }

                    .replies-list {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    .reply-item {
                        background: white;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        padding: 16px;
                        position: relative;
                    }

                    .reply-meta {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                        font-size: 12px;
                        color: var(--text-secondary);
                    }

                    .reply-subject {
                        font-weight: 600;
                        color: var(--text-primary);
                        margin-bottom: 8px;
                    }

                    .reply-body {
                        font-size: 14px;
                        color: var(--text-primary);
                        line-height: 1.5;
                    }

                    .actions-modern {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    .action-item-modern {
                        display: flex;
                        align-items: flex-start;
                        gap: 16px;
                        padding: 16px;
                        background: #f8fafc;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        transition: var(--transition);
                    }

                    .action-item-modern:hover {
                        border-color: var(--primary-color);
                        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
                    }

                    .action-number {
                        width: 32px;
                        height: 32px;
                        background: var(--primary-color);
                        color: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        font-weight: 700;
                        flex-shrink: 0;
                    }

                    .action-content {
                        flex: 1;
                    }

                    .action-text {
                        font-size: 15px;
                        color: var(--text-primary);
                        font-weight: 500;
                        margin-bottom: 8px;
                        line-height: 1.4;
                    }

                    .action-deadline {
                        font-size: 12px;
                        color: var(--danger-color);
                        font-weight: 600;
                        background: #fef2f2;
                        padding: 4px 8px;
                        border-radius: 4px;
                        display: inline-block;
                    }

                    /* Responsive */
                    @media (max-width: 1024px) {
                        .search-and-actions-line {
                            flex-direction: column;
                            gap: 12px;
                            align-items: stretch;
                        }

                        .search-section {
                            max-width: none;
                        }

                        .all-actions-line {
                            justify-content: center;
                            flex-wrap: wrap;
                        }

                        .view-and-controls-line {
                            flex-direction: column;
                            gap: 12px;
                            align-items: stretch;
                        }

                        .tasks-detailed-grid {
                            grid-template-columns: 1fr;
                        }
                    }

                    @media (max-width: 768px) {
                        .main-controls-section {
                            padding: 16px;
                        }

                        .filter-toggles {
                            flex-direction: column;
                            width: 100%;
                        }

                        .filter-toggle {
                            justify-content: center;
                        }

                        .new-and-sort {
                            flex-direction: column;
                            gap: 8px;
                            width: 100%;
                        }

                        .btn-new-task {
                            width: 100%;
                            justify-content: center;
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

                        .task-header-modern {
                            flex-direction: column;
                            gap: 16px;
                            align-items: flex-start;
                        }

                        .task-info-grid {
                            grid-template-columns: 1fr;
                            padding: 16px;
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
        // APP INITIALIZATION
        // =====================================
        function initializeApp() {
            console.log('[App] Initializing TaskManager v13...');
            
            // Create instances
            window.taskManager = new TaskManager();
            window.tasksView = new TasksView();
            
            // Setup app container
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = '<div id="tasksContainer"></div>';
                
                // Wait for TaskManager to initialize
                const checkInit = setInterval(() => {
                    if (window.taskManager.initialized) {
                        clearInterval(checkInit);
                        window.tasksView.render(document.getElementById('tasksContainer'));
                    }
                }, 100);
            }
        }

        // Start the app
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
    </script>
</body>
</html>
