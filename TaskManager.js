// TaskManager Pro v12.0 - Interface Réorganisée avec Filtres Fixés

// =====================================
// ENHANCED TASK MANAGER CLASS (INCHANGÉ)
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
            console.log('[TaskManager] Initializing v12.0 - Interface réorganisée...');
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
            
            // NOUVEAU: Checklist
            checklist: Array.isArray(task.checklist) ? task.checklist : [],
            
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
                checklist: [
                    { id: 'cl1', text: 'Analyser les visuels proposés', completed: false },
                    { id: 'cl2', text: 'Vérifier le budget disponible', completed: true },
                    { id: 'cl3', text: 'Valider avec la direction', completed: false }
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
                checklist: [
                    { id: 'cl4', text: 'Rassembler données Q1', completed: true },
                    { id: 'cl5', text: 'Créer slides PowerPoint', completed: false },
                    { id: 'cl6', text: 'Préparer discours', completed: false }
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
                emailDate: '2025-06-15T14:30:00Z',
                emailDomain: 'example.com',
                client: 'Jean Dupont',
                dueDate: '2025-06-17',
                needsReply: true,
                summary: 'Demande de devis urgent pour refonte complète du site web',
                checklist: [
                    { id: 'cl7', text: 'Évaluer complexité du projet', completed: true },
                    { id: 'cl8', text: 'Chiffrer les coûts', completed: false },
                    { id: 'cl9', text: 'Envoyer devis détaillé', completed: false }
                ],
                method: 'ai'
            },
            {
                id: 'sample_4',
                title: 'Appel client - Projet mobile app',
                description: 'Rendez-vous téléphonique pour discuter des spécifications de l\'application mobile',
                priority: 'medium',
                status: 'todo',
                category: 'meeting',
                client: 'TechStart',
                dueDate: '2025-06-24',
                method: 'manual'
            },
            {
                id: 'sample_5',
                title: 'Formation équipe développement',
                description: 'Session de formation sur les nouvelles technologies React 18',
                priority: 'low',
                status: 'reporte',
                category: 'training',
                client: 'Interne',
                dueDate: '2025-07-01',
                method: 'manual'
            }
        ];
        
        // Assurer les propriétés complètes pour chaque tâche
        this.tasks = sampleTasks.map(task => this.ensureTaskProperties(task));
        this.saveTasks();
    }

    // ================================================
    // MÉTHODES CRUD COMPLÈTES (INCHANGÉES)
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
        
        // CORRECTION CRITIQUE: Extraire correctement les informations client depuis l'email
        const emailInfo = this.extractEmailClientInfo(email, taskData);
        
        const task = this.ensureTaskProperties({
            ...taskData,
            id: taskData.id || this.generateId(),
            hasEmail: true,
            emailContent: fullEmailContent,
            emailHtmlContent: htmlEmailContent,
            
            // Informations client extraites de l'email
            client: emailInfo.client || taskData.client || 'Externe',
            emailFrom: emailInfo.emailFrom || taskData.emailFrom,
            emailFromName: emailInfo.emailFromName || taskData.emailFromName,
            emailDomain: emailInfo.emailDomain || taskData.emailDomain,
            emailSubject: emailInfo.emailSubject || taskData.emailSubject,
            emailDate: emailInfo.emailDate || taskData.emailDate,
            
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        
        console.log('[TaskManager] Email task created successfully:', task.id, 'Client:', task.client);
        return task;
    }

    // NOUVELLE MÉTHODE: Extraction intelligente des informations client depuis l'email
    extractEmailClientInfo(email, taskData) {
        const info = {
            client: null,
            emailFrom: null,
            emailFromName: null,
            emailDomain: null,
            emailSubject: null,
            emailDate: null
        };

        console.log('[TaskManager] 🔍 Extraction infos email:', email ? 'Email fourni' : 'Pas d\'email', taskData);

        // Priorité 1: Depuis l'objet email fourni
        if (email) {
            console.log('[TaskManager] 📧 Traitement email object:', email);
            
            // Adresse email de l'expéditeur
            if (email.from?.emailAddress?.address) {
                info.emailFrom = email.from.emailAddress.address;
                info.emailDomain = email.from.emailAddress.address.split('@')[1] || null;
                console.log('[TaskManager] ✅ Email FROM extrait:', info.emailFrom, 'Domaine:', info.emailDomain);
            } else if (email.from?.address) {
                info.emailFrom = email.from.address;
                info.emailDomain = email.from.address.split('@')[1] || null;
                console.log('[TaskManager] ✅ Email FROM (format alternatif):', info.emailFrom);
            }

            // Nom de l'expéditeur
            if (email.from?.emailAddress?.name) {
                info.emailFromName = email.from.emailAddress.name;
                console.log('[TaskManager] ✅ Nom expéditeur:', info.emailFromName);
            } else if (email.from?.name) {
                info.emailFromName = email.from.name;
            }

            // Sujet de l'email
            if (email.subject) {
                info.emailSubject = email.subject;
                console.log('[TaskManager] ✅ Sujet email:', info.emailSubject);
            }

            // Date de l'email
            if (email.receivedDateTime) {
                info.emailDate = email.receivedDateTime;
                console.log('[TaskManager] ✅ Date email:', info.emailDate);
            }
        }

        // Priorité 2: Depuis taskData (données PageManager)
        if (!info.emailFrom && taskData.emailFrom) {
            info.emailFrom = taskData.emailFrom;
            info.emailDomain = taskData.emailFrom.split('@')[1] || null;
            console.log('[TaskManager] 📋 Email FROM depuis taskData:', info.emailFrom);
        }

        if (!info.emailFromName && taskData.emailFromName) {
            info.emailFromName = taskData.emailFromName;
            console.log('[TaskManager] 📋 Nom depuis taskData:', info.emailFromName);
        }

        if (!info.emailSubject && taskData.emailSubject) {
            info.emailSubject = taskData.emailSubject;
        }

        if (!info.emailDate && taskData.emailDate) {
            info.emailDate = taskData.emailDate;
        }

        if (!info.emailDomain && taskData.emailDomain) {
            info.emailDomain = taskData.emailDomain;
        }

        // Priorité 3: Essayer d'extraire depuis le contenu email
        if (!info.emailFrom && (taskData.emailContent || email?.body?.content)) {
            const content = taskData.emailContent || email.body.content || '';
            const emailMatch = content.match(/(?:De:|From:|Email de:)\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
            if (emailMatch) {
                info.emailFrom = emailMatch[1];
                info.emailDomain = emailMatch[1].split('@')[1];
                console.log('[TaskManager] 🔍 Email extrait du contenu:', info.emailFrom);
            }
        }

        // Déterminer le nom du client
        if (info.emailFromName && info.emailFromName.trim() && info.emailFromName !== info.emailFrom) {
            // Utiliser le nom de la personne si disponible
            info.client = info.emailFromName.trim();
        } else if (info.emailDomain) {
            // Sinon, utiliser le domaine de l'email
            info.client = this.formatDomainAsClient(info.emailDomain);
        } else if (info.emailFrom) {
            // En dernier recours, utiliser l'email complet
            info.client = info.emailFrom.split('@')[0] || 'Externe';
        } else {
            // Valeur par défaut
            info.client = 'Externe';
        }

        console.log('[TaskManager] 🎯 Client final déterminé:', info.client);
        console.log('[TaskManager] 📊 Infos complètes:', info);

        return info;
    }

    // NOUVELLE MÉTHODE: Formatage intelligent du domaine en nom de client
    formatDomainAsClient(domain) {
        if (!domain) return 'Externe';

        // Supprimer les sous-domaines courants
        const cleanDomain = domain.replace(/^(www\.|mail\.|smtp\.|mx\.)/, '');
        
        // Extraire le nom principal (sans l'extension)
        const parts = cleanDomain.split('.');
        const mainName = parts[0];
        
        // Capitaliser la première lettre
        const formatted = mainName.charAt(0).toUpperCase() + mainName.slice(1).toLowerCase();
        
        console.log('[TaskManager] 🏢 Domaine formaté:', domain, '->', formatted);
        return formatted;
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

    updateChecklist(taskId, checklistUpdates) {
        const task = this.getTask(taskId);
        if (!task) return null;
        
        const updatedChecklist = checklistUpdates.map(item => ({
            id: item.id || this.generateChecklistId(),
            text: item.text || '',
            completed: item.completed || false
        }));
        
        return this.updateTask(taskId, { checklist: updatedChecklist });
    }

    generateChecklistId() {
        return 'cl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
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
    // MÉTHODES DE FILTRAGE ET TRI AMÉLIORÉES
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

    // NOUVELLE MÉTHODE: Synchronisation avec EmailScanner pour récupérer les clients d'emails
    syncClientsFromEmailScanner() {
        console.log('[TaskManager] 🔄 Synchronisation clients depuis EmailScanner...');
        
        if (!window.emailScanner || !window.emailScanner.getAllEmails) {
            console.log('[TaskManager] ⚠️ EmailScanner non disponible');
            return [];
        }

        const emails = window.emailScanner.getAllEmails();
        const emailClients = new Set();
        
        emails.forEach(email => {
            if (email.from?.emailAddress?.address) {
                const emailFrom = email.from.emailAddress.address;
                const emailFromName = email.from.emailAddress.name;
                const domain = emailFrom.split('@')[1];
                
                // Utiliser le nom de la personne en priorité, sinon le domaine formaté
                const clientName = (emailFromName && emailFromName.trim() && emailFromName !== emailFrom) 
                    ? emailFromName.trim()
                    : this.formatDomainAsClient(domain);
                    
                emailClients.add(clientName);
                console.log('[TaskManager] 📧 Client email détecté:', clientName, 'depuis', emailFrom);
            }
        });

        const uniqueEmailClients = Array.from(emailClients);
        console.log('[TaskManager] ✅ Clients emails synchronisés:', uniqueEmailClients.length, uniqueEmailClients);
        
        return uniqueEmailClients;
    }

    // MÉTHODE AMÉLIORÉE: Obtenir tous les clients (tâches + emails)
    getAllClients() {
        // Clients depuis les tâches existantes
        const taskClients = new Set();
        this.tasks.forEach(task => {
            if (task.client && task.client.trim() && task.client !== 'Interne') {
                taskClients.add(task.client.trim());
            }
        });

        // Clients depuis les emails scannés
        const emailClients = this.syncClientsFromEmailScanner();
        
        // Fusionner les deux listes
        const allClients = new Set([...taskClients, ...emailClients]);
        
        // Toujours inclure "Interne" en premier
        const sortedClients = ['Interne', ...Array.from(allClients).filter(c => c !== 'Interne').sort()];
        
        console.log('[TaskManager] 📊 Tous les clients disponibles:', sortedClients.length, sortedClients);
        return sortedClients;
    }

    // NOUVELLE MÉTHODE: Obtenir toutes les catégories uniques
    getAllCategories() {
        const categories = new Set();
        this.tasks.forEach(task => {
            if (task.category && task.category.trim()) {
                categories.add(task.category.trim());
            }
        });
        
        // Ajouter des catégories standard si elles n'existent pas
        const standardCategories = ['email', 'work', 'meeting', 'training', 'other'];
        standardCategories.forEach(cat => categories.add(cat));
        
        return Array.from(categories).sort();
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

    // ================================================
    // MÉTHODES UTILITAIRES (INCHANGÉES)
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
// TASKS VIEW v12.0 - INTERFACE RÉORGANISÉE
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
        
        // NOUVEAU: État des filtres conditionnels
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
            <div class="tasks-page-v12">
                <!-- SECTION CONTRÔLES PRINCIPALE -->
                <div class="main-controls-section">
                    <!-- Ligne 1 : Recherche + Actions principales + Nouvelle tâche + Date -->
                    <div class="search-and-actions-line">
                        <!-- Recherche -->
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

                        <!-- Actions principales + Nouvelle tâche + Date sur une seule ligne -->
                        <div class="all-actions-line">
                            <!-- Sélection info et actions -->
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
                            
                            <!-- Bouton Sélectionner tout -->
                            <button class="btn-action btn-select-all" onclick="window.tasksView.selectAllVisible()" title="Sélectionner toutes les tâches visibles">
                                <i class="fas fa-check-square"></i>
                                Tout sélectionner
                            </button>

                            <!-- Actualiser -->
                            <button class="btn-action btn-refresh" onclick="window.tasksView.refreshTasks()" title="Actualiser">
                                <i class="fas fa-sync-alt"></i>
                                Actualiser
                            </button>
                            
                            <!-- Nouvelle tâche (bouton proéminent) -->
                            <button class="btn-new-task" onclick="window.tasksView.showCreateModal()" title="Créer une nouvelle tâche">
                                <i class="fas fa-plus"></i>
                                Nouvelle tâche
                            </button>
                            
                            <!-- Date actuelle -->
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
                    
                    <!-- Ligne 2 : Modes de vue + Nouvelle tâche + Filtres -->
                    <div class="view-and-controls-line">
                        <!-- Modes de vue -->
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
                        
                        <!-- Boutons de filtres groupés -->
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
                        
                        <!-- Nouvelle tâche + Tri -->
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

                <!-- SECTION FILTRES CONDITIONNELS -->
                <div class="filters-conditional-section">
                    <!-- Filtres de statut (conditionnels) -->
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
                    
                    <!-- Filtres de catégories (conditionnels) -->
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
                    
                    <!-- Filtres supplémentaires (conditionnels) -->
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

                <div class="tasks-container" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addV12Styles();
        this.setupEventListeners();
        console.log('[TasksView] Interface v12.0 - Filtres réorganisés rendue');
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

    // NOUVEAU: Construction dynamique des options de filtrage client AMÉLIORÉE
    buildClientFilterOptions() {
        const allClients = window.taskManager?.getAllClients() || [];
        
        let options = `<option value="all" ${this.currentFilters.client === 'all' ? 'selected' : ''}>🏢 Tous les clients</option>`;
        
        allClients.forEach(client => {
            const count = window.taskManager.tasks.filter(t => t.client === client).length;
            const isSelected = this.currentFilters.client === client ? 'selected' : '';
            
            // Ajouter une icône pour différencier les types de clients
            let clientIcon = '';
            if (client === 'Interne') {
                clientIcon = '🏢 ';
            } else if (client.includes('@')) {
                clientIcon = '📧 ';
            } else {
                clientIcon = '👤 ';
            }
            
            options += `<option value="${this.escapeHtml(client)}" ${isSelected}>${clientIcon}${this.escapeHtml(client)} (${count})</option>`;
        });
        
        console.log('[TasksView] 🔄 Options client mises à jour:', allClients.length, 'clients');
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
        const priorityIcon = this.getPriorityIcon(task.priority);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        // CORRECTION: Affichage intelligent du client
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
        
        // CORRECTION: Affichage intelligent du client
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

    // NOUVELLE MÉTHODE: Déterminer l'affichage intelligent du client
    getDisplayClient(task) {
        let clientName = task.client || 'Interne';
        let clientIcon = '🏢';

        if (task.hasEmail) {
            // Pour les tâches créées depuis des emails
            if (task.emailFromName && task.emailFromName.trim() && task.emailFromName !== task.emailFrom) {
                // Utiliser le nom de la personne
                clientName = task.emailFromName;
                clientIcon = '👤';
            } else if (task.emailFrom) {
                // Utiliser l'email ou le domaine
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
            // Pour les tâches manuelles
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
        
        // CORRECTION: Affichage intelligent du client
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

    // NOUVEAU: Calcul du progrès de la checklist
    getChecklistProgress(checklist) {
        if (!Array.isArray(checklist)) return { completed: 0, total: 0 };
        
        const total = checklist.length;
        const completed = checklist.filter(item => item.completed).length;
        
        return { completed, total };
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

    // ================================================
    // MÉTHODES D'INTERACTION
    // ================================================

    selectAllVisible() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            this.showToast('Aucune tâche à sélectionner', 'info');
            return;
        }

        // Si toutes les tâches visibles sont déjà sélectionnées, on les désélectionne
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

    // NOUVELLE MÉTHODE: Filtrage rapide par statut
    quickStatusFilter(filterId) {
        // Reset filters sauf search et sortBy
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

        // Apply specific status filter
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

    // NOUVELLE MÉTHODE: Filtrage rapide par catégorie
    quickCategoryFilter(filterId) {
        // Reset category filter
        this.currentFilters.category = filterId === 'all' ? 'all' : filterId;
        this.refreshView();
    }

    updateFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.refreshView();
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
            } else if (select.id === 'quickSortSelect') {
                select.value = 'created';
            }
        });
        
        this.refreshView();
        this.showToast('Tous les filtres réinitialisés', 'info');
    }

    // NOUVELLES MÉTHODES: Gestion des filtres conditionnels
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
        
        // Mettre à jour les boutons toggle
        document.querySelectorAll('.filter-toggle').forEach(btn => {
            const chevron = btn.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (btn.onclick.toString().includes('toggleStatusFilters')) {
                btn.classList.toggle('active', this.showStatusFilters);
                if (chevron) {
                    chevron.classList.toggle('fa-chevron-down', !this.showStatusFilters);
                    chevron.classList.toggle('fa-chevron-up', this.showStatusFilters);
                }
            } else if (btn.onclick.toString().includes('toggleCategoryFilters')) {
                btn.classList.toggle('active', this.showCategoryFilters);
                if (chevron) {
                    chevron.classList.toggle('fa-chevron-down', !this.showCategoryFilters);
                    chevron.classList.toggle('fa-chevron-up', this.showCategoryFilters);
                }
            } else if (btn.onclick.toString().includes('toggleAdvancedFilters')) {
                btn.classList.toggle('active', this.showAdvancedFilters);
                if (chevron) {
                    chevron.classList.toggle('fa-chevron-down', !this.showAdvancedFilters);
                    chevron.classList.toggle('fa-chevron-up', this.showAdvancedFilters);
                }
            }
        });
    }

    // NOUVELLES MÉTHODES: Reset spécifiques
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
        
        // Mettre à jour les selects
        const priorityFilter = document.getElementById('priorityFilter');
        const clientFilter = document.getElementById('clientFilter');
        
        if (priorityFilter) priorityFilter.value = 'all';
        if (clientFilter) clientFilter.value = 'all';
        
        this.refreshView();
        this.showToast('Filtres avancés réinitialisés', 'info');
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
        
        document.querySelectorAll('.category-filters').forEach(container => {
            container.innerHTML = this.buildCategoryPills(stats);
        });
        
        // Mettre à jour les options de filtrage client dynamiquement
        const clientFilter = document.getElementById('clientFilter');
        if (clientFilter) {
            clientFilter.innerHTML = this.buildClientFilterOptions();
        }
        
        // Mettre à jour l'affichage des actions de sélection
        this.updateSelectionUI();
        
        // Mettre à jour l'état des panneaux de filtres
        this.updateFilterPanels();
        
        // Mettre à jour la date affichée
        this.updateCurrentDate();
    }

    updateSelectionUI() {
        const selectedCount = this.selectedTasks.size;
        const allActionsDiv = document.querySelector('.all-actions-line');
        
        if (allActionsDiv) {
            // Rechercher le panneau de sélection existant
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

    // ================================================
    // MODALES COMPLÈTES AVEC CHECKLIST (CODE INCHANGÉ)
    // ================================================

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
                
                <!-- NOUVEAU: Section Checklist -->
                <div class="form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-check-square"></i> Liste de contrôle</h3>
                        <button type="button" class="btn-add-checklist" onclick="window.tasksView.addChecklistItem('new-task-checklist')">
                            <i class="fas fa-plus"></i> Ajouter
                        </button>
                    </div>
                    <div id="new-task-checklist" class="checklist-container">
                        <!-- Items de checklist seront ajoutés ici -->
                    </div>
                </div>
            </div>
        `;
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
        
        // Focus sur le nouveau champ
        const newInput = container.querySelector(`[data-item-id="${itemId}"] .checklist-input`);
        if (newInput) {
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
        
        // Ajouter les éléments de checklist existants
        if (task.checklist && task.checklist.length > 0) {
            setTimeout(() => {
                task.checklist.forEach(item => {
                    this.addChecklistItem('edit-task-checklist', item.text, item.completed);
                });
            }, 100);
        }
        
        setTimeout(() => {
            const firstInput = document.querySelector(`#${uniqueId} input, #${uniqueId} textarea`);
            if (firstInput) firstInput.focus();
        }, 200);
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
                
                <!-- NOUVEAU: Section Checklist -->
                <div class="form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-check-square"></i> Liste de contrôle</h3>
                        <button type="button" class="btn-add-checklist" onclick="window.tasksView.addChecklistItem('edit-task-checklist')">
                            <i class="fas fa-plus"></i> Ajouter
                        </button>
                    </div>
                    <div id="edit-task-checklist" class="checklist-container">
                        <!-- Items de checklist seront ajoutés par JavaScript -->
                    </div>
                </div>
            </div>
        `;
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
        const checklistProgress = this.getChecklistProgress(task.checklist);
        
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
                        <span class="category-badge-details">
                            ${this.getCategoryIcon(task.category)} ${this.getCategoryName(task.category)}
                        </span>
                        <span class="deadline-badge-details ${dueDateInfo.className}">
                            <i class="fas fa-calendar"></i>
                            ${dueDateInfo.text || 'Pas d\'échéance définie'}
                        </span>
                        ${checklistProgress.total > 0 ? `
                            <span class="checklist-badge-details">
                                <i class="fas fa-check-square"></i>
                                ${checklistProgress.completed}/${checklistProgress.total} tâches
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

                ${task.checklist && task.checklist.length > 0 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-check-square"></i> Liste de contrôle</h3>
                        <div class="checklist-details">
                            <div class="checklist-progress-bar">
                                <div class="progress-track">
                                    <div class="progress-fill" style="width: ${checklistProgress.total > 0 ? (checklistProgress.completed / checklistProgress.total) * 100 : 0}%"></div>
                                </div>
                                <span class="progress-label">${checklistProgress.completed}/${checklistProgress.total} terminées</span>
                            </div>
                            <div class="checklist-items-readonly">
                                ${task.checklist.map(item => `
                                    <div class="checklist-item-readonly ${item.completed ? 'completed' : ''}">
                                        <i class="fas ${item.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                                        <span class="item-text">${this.escapeHtml(item.text)}</span>
                                    </div>
                                `).join('')}
                            </div>
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
                            <strong>Catégorie:</strong>
                            <span>${this.getCategoryIcon(task.category)} ${this.getCategoryName(task.category)}</span>
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
            </div>
        `;
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

    bulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const actions = [
            'Marquer comme terminé',
            'Changer la priorité',
            'Changer le statut',
            'Changer la catégorie',
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
                
            case 3: // Changer la catégorie
                const categories = window.taskManager.getAllCategories();
                const categoryPrompt = `Nouvelle catégorie:\n${categories.map((cat, i) => `${i + 1}. ${this.getCategoryName(cat)}`).join('\n')}\n\nEntrez le numéro:`;
                const categoryChoice = prompt(categoryPrompt);
                if (categoryChoice && categories[parseInt(categoryChoice) - 1]) {
                    const newCategory = categories[parseInt(categoryChoice) - 1];
                    this.selectedTasks.forEach(taskId => {
                        window.taskManager.updateTask(taskId, { category: newCategory });
                    });
                    this.showToast(`Catégorie mise à jour pour ${this.selectedTasks.size} tâche(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 4: // Supprimer
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedTasks.size} tâche(s) ?\n\nCette action est irréversible.`)) {
                    this.selectedTasks.forEach(taskId => {
                        window.taskManager.deleteTask(taskId);
                    });
                    this.showToast(`${this.selectedTasks.size} tâche(s) supprimée(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 5: // Exporter
                this.exportSelectedTasks();
                break;
        }
    }

    exportSelectedTasks() {
        const tasks = Array.from(this.selectedTasks).map(id => window.taskManager.getTask(id)).filter(Boolean);
        
        const csvContent = [
            ['Titre', 'Description', 'Priorité', 'Statut', 'Catégorie', 'Échéance', 'Client', 'Créé le'].join(','),
            ...tasks.map(task => [
                `"${task.title}"`,
                `"${task.description || ''}"`,
                task.priority,
                task.status,
                task.category,
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

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = 'auto';
    }

    // ================================================
    // STYLES CSS v12.0 - INTERFACE RÉORGANISÉE
    // ================================================

    addV12Styles() {
        if (document.getElementById('taskStyles_v12')) return;
        
        const styles = document.createElement('style');
        styles.id = 'taskStyles_v12';
        styles.textContent = `
            /* Variables CSS pour TaskManager v12.0 */
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

            .tasks-page-v12 {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 16px;
                font-size: 14px;
            }

            /* ================================================ */
            /* SECTION CONTRÔLES PRINCIPALE */
            /* ================================================ */
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

            /* Ligne 1 : Recherche + Actions principales sur une seule ligne */
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

            /* NOUVELLE CLASSE : Toutes les actions sur une ligne horizontale */
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

            /* CORRECTION : Style pour la ligne d'actions horizontale */
            .all-actions-line .selection-panel,
            .all-actions-line .btn-action,
            .all-actions-line .btn-new-task,
            .all-actions-line .current-date {
                flex-shrink: 0;
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

            .selection-count {
                white-space: nowrap;
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

            .btn-new-task i {
                font-size: 16px;
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

            /* Ligne 2 : Modes de vue + Filtres + Nouvelle + Tri */
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

            /* Boutons de filtres groupés */
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

            .filter-toggle i:first-child {
                font-size: 14px;
            }

            .filter-toggle i:last-child {
                font-size: 10px;
                margin-left: 4px;
            }

            /* Nouvelle tâche + Tri */
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

            .sort-select:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }

            /* ================================================ */
            /* SECTION FILTRES CONDITIONNELS */
            /* ================================================ */
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
                max-height: 200px;
                opacity: 1;
                padding: 20px;
                margin-bottom: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
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

            .filter-group-title i {
                font-size: 16px;
                color: var(--primary-color);
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

            /* Filtres de statut dans panel conditionnel */
            .status-filters-panel .status-filters {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            /* Filtres de catégories dans panel conditionnel */
            .category-filters-panel .category-filters {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            /* Filtres avancés dans panel conditionnel */
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

            .filter-select:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }

            .filter-actions {
                display: flex;
                align-items: end;
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

            /* Filtres de statut */
            .status-filters {
                display: flex;
                gap: 8px;
                flex: 1;
                flex-wrap: wrap;
            }

            .status-pill {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: white;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                cursor: pointer;
                transition: var(--transition);
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary);
                min-width: 90px;
                justify-content: space-between;
                position: relative;
                overflow: hidden;
            }

            .status-pill:hover {
                border-color: var(--pill-color, var(--primary-color));
                background: rgba(59, 130, 246, 0.05);
                transform: translateY(-1px);
                box-shadow: var(--shadow-sm);
            }

            .status-pill.active {
                background: var(--pill-color, var(--primary-color));
                color: white;
                border-color: var(--pill-color, var(--primary-color));
                box-shadow: var(--shadow-md);
            }

            .status-pill.active .pill-count {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }

            .pill-icon {
                font-size: 14px;
                flex-shrink: 0;
            }

            .pill-text {
                flex: 1;
                text-align: center;
                font-size: 11px;
                white-space: nowrap;
            }

            .pill-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
                min-width: 20px;
                text-align: center;
                flex-shrink: 0;
            }

            /* Filtres de catégories */
            .category-filters {
                display: flex;
                gap: 8px;
                flex: 1;
                flex-wrap: wrap;
            }

            .category-pill {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: white;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                cursor: pointer;
                transition: var(--transition);
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary);
                min-width: 90px;
                justify-content: space-between;
                position: relative;
                overflow: hidden;
            }

            .category-pill:hover {
                border-color: var(--pill-color, var(--primary-color));
                background: rgba(59, 130, 246, 0.05);
                transform: translateY(-1px);
                box-shadow: var(--shadow-sm);
            }

            .category-pill.active {
                background: var(--pill-color, var(--primary-color));
                color: white;
                border-color: var(--pill-color, var(--primary-color));
                box-shadow: var(--shadow-md);
            }

            .category-pill.active .pill-count {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }

            /* ================================================ */
            /* CONTENEUR DES TÂCHES */
            /* ================================================ */
            .tasks-container {
                background: transparent;
            }

            /* VUE MINIMALISTE - UNE LIGNE PAR TÂCHE */
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

            /* VUE NORMALE - UNE LIGNE PAR TÂCHE AMÉLIORÉE */
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
            .email-badge {
                padding: 3px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                border: 1px solid;
                display: flex;
                align-items: center;
                gap: 3px;
            }

            .status-badge.status-todo {
                background: #fef3c7;
                color: #d97706;
                border-color: #fde68a;
            }

            .status-badge.status-in-progress {
                background: #eff6ff;
                color: #2563eb;
                border-color: #bfdbfe;
            }

            .status-badge.status-relance {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }

            .status-badge.status-bloque {
                background: #f3f4f6;
                color: #6b7280;
                border-color: #d1d5db;
            }

            .status-badge.status-reporte {
                background: #f0f9ff;
                color: #0ea5e9;
                border-color: #7dd3fc;
            }

            .status-badge.status-completed {
                background: #f0fdf4;
                color: #16a34a;
                border-color: #bbf7d0;
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

            .task-details {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 12px;
                color: var(--text-secondary);
            }

            .task-client,
            .task-normal .task-deadline {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            /* VUE DÉTAILLÉE - GRILLE DE CARTES */
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

            /* NOUVEAU: Checklist dans vue détaillée */
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

            .meta-item.deadline-centered {
                flex: 1;
                text-align: center;
                justify-content: center;
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                font-weight: 500;
            }

            .meta-item.email-meta {
                color: var(--primary-color);
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

            /* ================================================ */
            /* MODALES COMPLÈTES (REPRISES DE v11) */
            /* ================================================ */
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

            /* NOUVEAU: Checklist dans les formulaires */
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

            /* ... (Styles pour détails tâches, suggestions réponses, etc.) ... */
            /* Ces styles sont identiques à v11, je les abrège pour l'espace */

            /* ================================================ */
            /* RESPONSIVE DESIGN */
            /* ================================================ */
            @media (max-width: 1024px) {
                .search-and-actions-line {
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

                .view-and-controls-line {
                    flex-direction: column;
                    gap: 12px;
                    align-items: stretch;
                }

                .view-modes {
                    align-self: center;
                }

                .filter-toggles {
                    justify-content: center;
                }

                .new-and-sort {
                    justify-content: center;
                }

                .tasks-detailed-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .main-controls-section,
                .filters-conditional-section {
                    padding: 16px;
                }

                .view-and-controls-line {
                    gap: 8px;
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

                .sort-quick {
                    justify-content: center;
                    width: 100%;
                }

                .sort-select {
                    min-width: auto;
                    flex: 1;
                }

                .advanced-filters-grid {
                    grid-template-columns: 1fr;
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

                .status-filters,
                .category-filters {
                    flex-direction: column;
                    gap: 6px;
                }

                .status-pill,
                .category-pill {
                    min-width: auto;
                    width: 100%;
                    justify-content: space-between;
                }
            }

            @media (max-width: 480px) {
                .tasks-page-v12 {
                    padding: 8px;
                }

                .main-controls-section {
                    padding: 12px;
                    gap: 12px;
                }

                .status-filters-panel.show,
                .category-filters-panel.show,
                .advanced-filters-panel.show {
                    padding: 12px;
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
            }

                .main-actions {
                    flex-direction: column;
                    gap: 8px;
                }

                .selection-panel {
                    justify-content: center;
                }

                .status-filters,
                .category-filters {
                    flex-direction: column;
                    gap: 6px;
                }

                .status-pill,
                .category-pill {
                    min-width: auto;
                    width: 100%;
                    justify-content: space-between;
                }
            }

            @media (max-width: 480px) {
                .tasks-page-v12 {
                    padding: 8px;
                }

                .main-controls-section {
                    padding: 12px;
                    gap: 12px;
                }

                .status-filters-panel.show,
                .category-filters-panel.show,
                .advanced-filters-panel.show {
                    padding: 12px;
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
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION v12.0
// =====================================

function initializeTaskManagerV12() {
    console.log('[TaskManager] Initializing v12.0 - Interface avec boutons filtres...');
    
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
    
    console.log('✅ TaskManager v12.0 loaded - Interface avec boutons filtres conditionnels');
}

// Initialisation immédiate ET sur DOMContentLoaded
initializeTaskManagerV12();

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TaskManager] DOM ready, ensuring initialization...');
    initializeTaskManagerV12();
});

// Fallback sur window.load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TaskManager] Fallback initialization...');
            initializeTaskManagerV12();
        }
    }, 1000);
});
