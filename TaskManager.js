// TaskManager Pro v10.0 - Version Complète Réécrite avec Harmonisation et Contenu Email Complet

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
            console.log('[TaskManager] Initializing v10.0 - Version complète réécrite...');
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
                emailImages: [
                    {
                        name: 'campagne-visuel-1.jpg',
                        url: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f0f9ff"/><text x="150" y="100" text-anchor="middle" fill="#3b82f6" font-family="Arial" font-size="16">Visuel Campagne Q2</text></svg>'),
                        size: '245 KB',
                        type: 'image/jpeg'
                    }
                ],
                emailConversation: [
                    {
                        from: 'sarah.martin@acme-corp.com',
                        fromName: 'Sarah Martin',
                        date: '2025-06-06T09:15:00Z',
                        subject: 'Validation campagne marketing Q2',
                        content: 'Bonjour,\n\nJ\'espère que vous allez bien. Je vous contacte concernant notre campagne marketing Q2 qui nécessite votre validation.\n\nNous avons préparé les éléments suivants :\n- Visuels créatifs pour les réseaux sociaux\n- Budget détaillé de 50k€\n- Calendrier de lancement\n\nPourriez-vous valider ces éléments avant vendredi ?\n\nMerci d\'avance,\nSarah Martin'
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
                emailContent: `Email de: Trainline <no-reply@comms.trainline.com>\nDate: 16/06/2025 10:20:03\nSujet: 20 % offerts sur les nouveaux trajets Trenitalia !\n\nBonjour,\n\nNous avons le plaisir de vous annoncer une offre exceptionnelle sur les trajets Trenitalia !\n\nBénéficiez de 20% de réduction sur tous les nouveaux trajets en Italie.\n\nCette offre est valable pour une durée limitée, ne la manquez pas !\n\nRéservez dès maintenant sur notre site ou application.\n\nL'équipe Trainline`,
                emailImages: [
                    {
                        name: 'paris-banner.jpg',
                        url: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><defs><linearGradient id="sunset" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" /><stop offset="100%" style="stop-color:#f97316;stop-opacity:1" /></linearGradient></defs><rect width="400" height="200" fill="url(#sunset)"/><polygon points="200,50 210,180 190,180" fill="#8b4513"/><circle cx="200" cy="40" r="8" fill="#d97706"/><text x="200" y="170" text-anchor="middle" fill="white" font-family="Georgia" font-size="24" font-weight="bold">Paris</text></svg>'),
                        size: '156 KB',
                        type: 'image/jpeg'
                    }
                ],
                emailConversation: [
                    {
                        from: 'no-reply@comms.trainline.com',
                        fromName: 'Trainline',
                        date: '2025-06-16T10:20:03Z',
                        subject: '20 % offerts sur les nouveaux trajets Trenitalia !',
                        content: 'Bonjour,\n\nNous avons le plaisir de vous annoncer une offre exceptionnelle sur les trajets Trenitalia !\n\nBénéficiez de 20% de réduction sur tous les nouveaux trajets en Italie.\n\nCette offre est valable pour une durée limitée, ne la manquez pas !\n\nRéservez dès maintenant sur notre site ou application.\n\nL\'équipe Trainline'
                    }
                ],
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

    createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email:', taskData.title);
        
        const enrichedData = this.extractCompleteEmailData(email, taskData);
        
        const task = this.ensureTaskProperties({
            ...taskData,
            ...enrichedData,
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

    extractCompleteEmailData(email, taskData) {
        if (!email) return taskData;

        const enrichedData = {
            ...taskData,
            emailContent: this.extractFullEmailContent(email, taskData),
            emailHtmlContent: this.extractHtmlEmailContent(email, taskData),
            emailImages: this.extractEmailImages(email),
            emailAttachments: this.extractEmailAttachments(email),
            emailConversation: this.extractEmailConversation(email)
        };

        return enrichedData;
    }

    extractEmailImages(email) {
        const images = [];
        
        if (email?.attachments) {
            email.attachments.forEach(attachment => {
                if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                    images.push({
                        name: attachment.name || 'image.jpg',
                        url: attachment.contentBytes ? `data:${attachment.contentType};base64,${attachment.contentBytes}` : null,
                        size: attachment.size ? this.formatFileSize(attachment.size) : 'Taille inconnue',
                        type: attachment.contentType,
                        id: attachment.id || `img_${Date.now()}`
                    });
                }
            });
        }

        // Extraire les images inline du HTML
        if (email?.body?.content && email.body.contentType === 'html') {
            const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
            let match;
            while ((match = imgRegex.exec(email.body.content)) !== null) {
                const src = match[1];
                if (src.startsWith('data:image/')) {
                    images.push({
                        name: `inline_image_${images.length + 1}.jpg`,
                        url: src,
                        size: 'Inline',
                        type: src.split(';')[0].split(':')[1],
                        id: `inline_${Date.now()}_${images.length}`
                    });
                }
            }
        }

        return images;
    }

    extractEmailAttachments(email) {
        const attachments = [];
        
        if (email?.attachments) {
            email.attachments.forEach(attachment => {
                if (!attachment.contentType || !attachment.contentType.startsWith('image/')) {
                    attachments.push({
                        name: attachment.name || 'fichier',
                        size: attachment.size ? this.formatFileSize(attachment.size) : 'Taille inconnue',
                        type: attachment.contentType || 'application/octet-stream',
                        id: attachment.id || `att_${Date.now()}`
                    });
                }
            });
        }

        return attachments;
    }

    extractEmailConversation(email) {
        const conversation = [];
        
        // Email principal
        if (email) {
            conversation.push({
                from: email.from?.emailAddress?.address || '',
                fromName: email.from?.emailAddress?.name || '',
                date: email.receivedDateTime || new Date().toISOString(),
                subject: email.subject || '',
                content: this.extractFullEmailContent(email, {}),
                isReply: false
            });
        }

        // TODO: Extraire les réponses précédentes du thread si disponible
        // Ceci nécessiterait une analyse du contenu pour détecter les réponses quotées

        return conversation;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
// TASKS VIEW - INTERFACE COMPLÈTE RÉÉCRITE
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
                <div class="loading-state-unified">
                    <div class="loading-icon-unified">
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
            <div class="tasks-page-unified">
                <!-- Barre de recherche unifiée -->
                <div class="search-bar-unified">
                    <div class="search-container-unified">
                        <i class="fas fa-search search-icon-unified"></i>
                        <input type="text" 
                               class="search-input-unified" 
                               id="taskSearchInput"
                               placeholder="Rechercher tâches, clients, contenus..." 
                               value="${this.currentFilters.search}">
                        ${this.currentFilters.search ? `
                            <button class="search-clear-unified" onclick="window.tasksView.clearSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Barre d'actions unifiée -->
                <div class="actions-bar-unified">
                    <!-- Modes de vue avec icônes unifiées -->
                    <div class="view-modes-unified">
                        <button class="view-mode-unified ${this.currentViewMode === 'minimal' ? 'active' : ''}" 
                                onclick="window.tasksView.changeViewMode('minimal')"
                                title="Vue minimaliste">
                            <i class="fas fa-th-list"></i>
                            <span>Minimal</span>
                        </button>
                        <button class="view-mode-unified ${this.currentViewMode === 'normal' ? 'active' : ''}" 
                                onclick="window.tasksView.changeViewMode('normal')"
                                title="Vue normale">
                            <i class="fas fa-list"></i>
                            <span>Normal</span>
                        </button>
                        <button class="view-mode-unified ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                onclick="window.tasksView.changeViewMode('detailed')"
                                title="Vue détaillée">
                            <i class="fas fa-th-large"></i>
                            <span>Détaillé</span>
                        </button>
                    </div>
                    
                    <!-- Actions principales avec icônes unifiées -->
                    <div class="main-actions-unified">
                        ${selectedCount > 0 ? `
                            <div class="selection-info-unified">
                                <i class="fas fa-check-square"></i>
                                <span>${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''}</span>
                                <button class="clear-selection-unified" onclick="window.tasksView.clearSelection()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        ` : ''}
                        
                        <button class="action-btn-unified ${visibleCount === 0 ? 'disabled' : ''}" 
                                onclick="window.tasksView.selectAllVisible()"
                                ${visibleCount === 0 ? 'disabled' : ''}
                                title="Sélectionner toutes les tâches affichées">
                            <i class="fas fa-check-double"></i>
                            <span>Tout sélectionner</span>
                            ${visibleCount > 0 ? `<span class="count-badge-unified">${visibleCount}</span>` : ''}
                        </button>
                        
                        <button class="action-btn-unified" onclick="window.tasksView.refreshTasks()">
                            <i class="fas fa-sync-alt"></i>
                            <span>Actualiser</span>
                        </button>
                        
                        ${selectedCount > 0 ? `
                            <button class="action-btn-unified primary" onclick="window.tasksView.showBulkActions()">
                                <i class="fas fa-cog"></i>
                                <span>Actions</span>
                                <span class="count-badge-unified">${selectedCount}</span>
                            </button>
                        ` : ''}
                        
                        <button class="action-btn-unified primary" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            <span>Nouvelle</span>
                        </button>
                        
                        <button class="action-btn-unified filters-toggle ${this.showAdvancedFilters ? 'active' : ''}" 
                                onclick="window.tasksView.toggleAdvancedFilters()">
                            <i class="fas fa-filter"></i>
                            <span>Filtres</span>
                            <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                        </button>
                    </div>
                </div>

                <!-- Filtres de statut unifiés -->
                <div class="status-filters-unified">
                    ${this.buildUnifiedStatusPills(stats)}
                </div>
                
                <!-- Panneau de filtres avancés -->
                <div class="advanced-filters-panel-unified ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFiltersPanel">
                    <div class="filters-grid-unified">
                        <div class="filter-group-unified">
                            <label class="filter-label-unified">
                                <i class="fas fa-flag"></i> Priorité
                            </label>
                            <select class="filter-select-unified" id="priorityFilter" 
                                    onchange="window.tasksView.updateFilter('priority', this.value)">
                                <option value="all" ${this.currentFilters.priority === 'all' ? 'selected' : ''}>Toutes</option>
                                <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                                <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                                <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                                <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            </select>
                        </div>

                        <div class="filter-group-unified">
                            <label class="filter-label-unified">
                                <i class="fas fa-building"></i> Client
                            </label>
                            <select class="filter-select-unified" id="clientFilter" 
                                    onchange="window.tasksView.updateFilter('client', this.value)">
                                ${this.buildClientFilterOptions()}
                            </select>
                        </div>

                        <div class="filter-group-unified">
                            <label class="filter-label-unified">
                                <i class="fas fa-sort"></i> Trier par
                            </label>
                            <select class="filter-select-unified" id="sortByFilter" 
                                    onchange="window.tasksView.updateFilter('sortBy', this.value)">
                                <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Date création</option>
                                <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                                <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Date échéance</option>
                                <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre A-Z</option>
                                <option value="client" ${this.currentFilters.sortBy === 'client' ? 'selected' : ''}>Client</option>
                            </select>
                        </div>

                        <div class="filter-actions-unified">
                            <button class="action-btn-unified secondary" onclick="window.tasksView.resetAllFilters()">
                                <i class="fas fa-undo"></i> Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Container des tâches -->
                <div class="tasks-container-unified" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addUnifiedTaskStyles();
        this.setupEventListeners();
        console.log('[TasksView] Interface unifiée rendue avec', visibleCount, 'tâches visibles');
    }

    buildUnifiedStatusPills(stats) {
        const pills = [
            { id: 'all', name: 'Tous', icon: 'fas fa-list', count: stats.total },
            { id: 'todo', name: 'À faire', icon: 'fas fa-clock', count: stats.todo },
            { id: 'in-progress', name: 'En cours', icon: 'fas fa-play', count: stats.inProgress },
            { id: 'overdue', name: 'En retard', icon: 'fas fa-exclamation-triangle', count: stats.overdue },
            { id: 'needsReply', name: 'À répondre', icon: 'fas fa-reply', count: stats.needsReply },
            { id: 'completed', name: 'Terminées', icon: 'fas fa-check', count: stats.completed }
        ];

        return pills.map(pill => `
            <button class="status-pill-unified ${this.isFilterActive(pill.id) ? 'active' : ''}" 
                    data-filter="${pill.id}"
                    onclick="window.tasksView.quickFilter('${pill.id}')">
                <div class="pill-header-unified">
                    <i class="${pill.icon}"></i>
                    <span class="pill-count-unified">${pill.count}</span>
                </div>
                <div class="pill-label-unified">${pill.name}</div>
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
    // VUE MINIMALISTE UNIFIÉE
    // ================================================
    
    renderMinimalView(tasks) {
        return `
            <div class="tasks-minimal-unified">
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
                       class="task-checkbox-unified" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-indicator-unified priority-${task.priority}" 
                     title="Priorité ${priorityInfo.label}">
                    <i class="${priorityInfo.icon}"></i>
                </div>
                
                <div class="task-content-minimal">
                    <div class="task-title-minimal">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta-minimal">
                        <span class="task-client-minimal">
                            <i class="fas fa-building"></i>
                            ${this.escapeHtml(task.client)}
                        </span>
                        <span class="task-deadline-minimal ${dueDateInfo.className}">
                            <i class="fas fa-calendar"></i>
                            ${dueDateInfo.text || 'Pas d\'échéance'}
                        </span>
                        ${task.hasEmail ? '<span class="email-indicator-minimal"><i class="fas fa-envelope"></i></span>' : ''}
                    </div>
                </div>
                
                <div class="task-actions-minimal">
                    ${this.renderMinimalActions(task)}
                </div>
            </div>
        `;
    }

    // ================================================
    // VUE NORMALE UNIFIÉE
    // ================================================
    
    renderNormalView(tasks) {
        return `
            <div class="tasks-normal-unified">
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
                       class="task-checkbox-unified" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-bar-unified priority-${task.priority}"></div>
                
                <div class="task-main-content">
                    <div class="task-header-normal">
                        <h3 class="task-title-normal">${this.escapeHtml(task.title)}</h3>
                        <div class="task-badges-normal">
                            <span class="type-badge-unified">
                                <i class="${task.hasEmail ? 'fas fa-envelope' : 'fas fa-tasks'}"></i>
                                ${task.hasEmail ? 'Email' : 'Tâche'}
                            </span>
                            <span class="deadline-badge-unified ${dueDateInfo.className}">
                                <i class="fas fa-calendar"></i>
                                ${dueDateInfo.text || 'Pas d\'échéance'}
                            </span>
                            <span class="priority-badge-unified priority-${task.priority}">
                                <i class="${priorityInfo.icon}"></i>
                                ${priorityInfo.label}
                            </span>
                        </div>
                    </div>
                    
                    <div class="task-meta-normal">
                        <div class="client-info-normal">
                            <i class="fas fa-building"></i>
                            <span>${this.escapeHtml(task.client)}</span>
                        </div>
                        ${task.hasEmail && task.emailFromName ? `
                            <div class="sender-info-normal">
                                <i class="fas fa-user"></i>
                                <span>${this.escapeHtml(task.emailFromName)}</span>
                            </div>
                        ` : ''}
                        ${task.hasEmail && task.needsReply ? `
                            <div class="reply-needed-normal">
                                <i class="fas fa-reply"></i>
                                <span>Réponse requise</span>
                            </div>
                        ` : ''}
                        ${task.hasEmail && task.emailImages && task.emailImages.length > 0 ? `
                            <div class="has-images-normal">
                                <i class="fas fa-image"></i>
                                <span>${task.emailImages.length} image${task.emailImages.length > 1 ? 's' : ''}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="task-actions-normal">
                    ${this.renderNormalActions(task)}
                </div>
            </div>
        `;
    }

    // ================================================
    // VUE DÉTAILLÉE UNIFIÉE
    // ================================================
    
    renderDetailedView(tasks) {
        return `
            <div class="tasks-detailed-unified">
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
                           class="task-checkbox-unified" 
                           ${isSelected ? 'checked' : ''}
                           onclick="window.tasksView.toggleTaskSelection('${task.id}')">
                    
                    <div class="task-indicators-detailed">
                        <div class="priority-indicator-unified priority-${task.priority}" 
                             title="Priorité ${priorityInfo.label}">
                            <i class="${priorityInfo.icon}"></i>
                        </div>
                        <div class="status-indicator-unified status-${task.status}" 
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
                    
                    <div class="task-badges-detailed">
                        <span class="type-badge-unified">
                            <i class="${task.hasEmail ? 'fas fa-envelope' : 'fas fa-tasks'}"></i>
                            ${task.hasEmail ? 'Email' : 'Tâche'}
                        </span>
                        <span class="deadline-badge-unified ${dueDateInfo.className}">
                            <i class="fas fa-calendar"></i>
                            ${dueDateInfo.text || 'Pas d\'échéance'}
                        </span>
                        <span class="priority-badge-unified priority-${task.priority}">
                            <i class="${priorityInfo.icon}"></i>
                            ${priorityInfo.label}
                        </span>
                    </div>
                    
                    <div class="task-meta-detailed">
                        <div class="meta-item-detailed">
                            <i class="fas fa-building"></i>
                            <span>${this.escapeHtml(task.client)}</span>
                        </div>
                        ${task.hasEmail && task.emailFromName ? `
                            <div class="meta-item-detailed">
                                <i class="fas fa-user"></i>
                                <span>${this.escapeHtml(task.emailFromName)}</span>
                            </div>
                        ` : ''}
                        ${task.hasEmail && task.needsReply ? `
                            <div class="meta-item-detailed reply-needed">
                                <i class="fas fa-reply"></i>
                                <span>Réponse requise</span>
                            </div>
                        ` : ''}
                        ${task.hasEmail && task.emailImages && task.emailImages.length > 0 ? `
                            <div class="meta-item-detailed has-images">
                                <i class="fas fa-image"></i>
                                <span>${task.emailImages.length} image${task.emailImages.length > 1 ? 's' : ''}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="task-detailed-actions">
                    ${this.renderDetailedActions(task)}
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTIONS POUR CHAQUE VUE - UNIFIÉES
    // ================================================
    
    renderMinimalActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-icon-unified complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-icon-unified edit" 
                    onclick="event.stopPropagation(); window.tasksView.showEditModal('${task.id}')"
                    title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
        `);
        
        return actions.join('');
    }

    renderNormalActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-icon-unified complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-icon-unified edit" 
                    onclick="event.stopPropagation(); window.tasksView.showEditModal('${task.id}')"
                    title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
        `);
        
        actions.push(`
            <button class="action-btn-icon-unified details" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        if (task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0) {
            actions.push(`
                <button class="action-btn-icon-unified reply" 
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
                <button class="action-btn-unified success" 
                        onclick="window.tasksView.markComplete('${task.id}')">
                    <i class="fas fa-check"></i>
                    <span>Terminé</span>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-unified primary" 
                    onclick="window.tasksView.showEditModal('${task.id}')">
                <i class="fas fa-edit"></i>
                <span>Modifier</span>
            </button>
        `);
        
        actions.push(`
            <button class="action-btn-unified secondary" 
                    onclick="window.tasksView.showTaskDetails('${task.id}')">
                <i class="fas fa-eye"></i>
                <span>Détails</span>
            </button>
        `);
        
        return actions.join('');
    }

    // ================================================
    // MODALES - DÉTAILS AVEC CONTENU EMAIL ENRICHI
    // ================================================
    
    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        const uniqueId = 'task_details_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container modal-xl">
                    <div class="modal-header">
                        <h2><i class="fas fa-eye"></i> Détails de la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildEnrichedTaskDetailsContent(task)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-secondary" onclick="window.tasksView.closeModal('${uniqueId}')">
                            Fermer
                        </button>
                        ${task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0 ? `
                            <button class="btn-modal btn-info" onclick="window.tasksView.showSuggestedReplies('${task.id}')">
                                <i class="fas fa-reply"></i> Voir suggestions
                            </button>
                        ` : ''}
                        <button class="btn-modal btn-primary" onclick="window.tasksView.closeModal('${uniqueId}'); window.tasksView.showEditModal('${task.id}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        ${task.status !== 'completed' ? `
                            <button class="btn-modal btn-success" onclick="window.tasksView.markComplete('${task.id}'); window.tasksView.closeModal('${uniqueId}')">
                                <i class="fas fa-check"></i> Terminé
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    buildEnrichedTaskDetailsContent(task) {
        const priorityInfo = this.getPriorityInfo(task.priority);
        const statusInfo = this.getStatusInfo(task.status);
        const dueDateInfo = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-details-enriched">
                <!-- En-tête de la tâche -->
                <div class="details-header-enriched">
                    <h1 class="task-title-enriched">${this.escapeHtml(task.title)}</h1>
                    <div class="task-badges-enriched">
                        <span class="priority-badge-unified priority-${task.priority}">
                            <i class="${priorityInfo.icon}"></i>
                            ${priorityInfo.label}
                        </span>
                        <span class="status-badge-unified status-${task.status}">
                            <i class="${statusInfo.icon}"></i>
                            ${statusInfo.label}
                        </span>
                        <span class="deadline-badge-unified ${dueDateInfo.className}">
                            <i class="fas fa-calendar"></i>
                            ${dueDateInfo.text || 'Pas d\'échéance'}
                        </span>
                        ${task.hasEmail ? `
                            <span class="type-badge-unified email">
                                <i class="fas fa-envelope"></i>
                                Email
                            </span>
                        ` : ''}
                    </div>
                </div>

                ${task.description ? `
                    <div class="details-section-enriched">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <div class="description-content-enriched">
                            ${this.formatDescription(task.description)}
                        </div>
                    </div>
                ` : ''}

                <!-- Informations générales -->
                <div class="details-section-enriched">
                    <h3><i class="fas fa-info-circle"></i> Informations Générales</h3>
                    <div class="info-grid-enriched">
                        <div class="info-item-enriched">
                            <strong>Client/Projet:</strong>
                            <span>${this.escapeHtml(task.client)}</span>
                        </div>
                        <div class="info-item-enriched">
                            <strong>Créé le:</strong>
                            <span>${new Date(task.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="info-item-enriched">
                            <strong>Dernière modification:</strong>
                            <span>${new Date(task.updatedAt).toLocaleString('fr-FR')}</span>
                        </div>
                        ${task.completedAt ? `
                            <div class="info-item-enriched">
                                <strong>Terminé le:</strong>
                                <span>${new Date(task.completedAt).toLocaleString('fr-FR')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${task.hasEmail ? `
                    <!-- Section Email Enrichie -->
                    <div class="details-section-enriched email-section">
                        <h3><i class="fas fa-envelope"></i> Informations Email</h3>
                        
                        <!-- Informations de base -->
                        <div class="email-info-enriched">
                            <div class="email-header-enriched">
                                <div class="sender-info-enriched">
                                    <div class="sender-avatar-enriched">
                                        ${task.emailFromName ? task.emailFromName.charAt(0).toUpperCase() : 'E'}
                                    </div>
                                    <div class="sender-details-enriched">
                                        <div class="sender-name-enriched">${this.escapeHtml(task.emailFromName || 'Expéditeur inconnu')}</div>
                                        <div class="sender-email-enriched">${this.escapeHtml(task.emailFrom || '')}</div>
                                    </div>
                                </div>
                                <div class="email-meta-enriched">
                                    <div class="email-date-enriched">
                                        <i class="fas fa-clock"></i>
                                        ${task.emailDate ? new Date(task.emailDate).toLocaleString('fr-FR') : 'Date inconnue'}
                                    </div>
                                    <div class="email-domain-enriched">
                                        <i class="fas fa-globe"></i>
                                        ${task.emailDomain || 'Domaine inconnu'}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="email-subject-enriched">
                                <strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject || 'Sans sujet')}
                            </div>
                            
                            <div class="email-flags-enriched">
                                ${task.needsReply ? `
                                    <span class="email-flag-enriched reply-needed">
                                        <i class="fas fa-reply"></i>
                                        Réponse requise
                                    </span>
                                ` : ''}
                                ${task.emailReplied ? `
                                    <span class="email-flag-enriched replied">
                                        <i class="fas fa-check"></i>
                                        Répondu
                                    </span>
                                ` : ''}
                                ${task.hasAttachments ? `
                                    <span class="email-flag-enriched has-attachments">
                                        <i class="fas fa-paperclip"></i>
                                        Pièces jointes
                                    </span>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Images de l'email -->
                        ${task.emailImages && task.emailImages.length > 0 ? `
                            <div class="email-images-enriched">
                                <h4><i class="fas fa-image"></i> Images (${task.emailImages.length})</h4>
                                <div class="images-grid-enriched">
                                    ${task.emailImages.map((img, idx) => `
                                        <div class="image-item-enriched" onclick="window.tasksView.showImageModal('${task.id}', ${idx})">
                                            <img src="${img.url}" alt="${img.name}" class="email-image-thumb" />
                                            <div class="image-info-enriched">
                                                <div class="image-name-enriched">${this.escapeHtml(img.name)}</div>
                                                <div class="image-size-enriched">${img.size}</div>
                                            </div>
                                            <div class="image-overlay-enriched">
                                                <i class="fas fa-search-plus"></i>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Pièces jointes -->
                        ${task.emailAttachments && task.emailAttachments.length > 0 ? `
                            <div class="email-attachments-enriched">
                                <h4><i class="fas fa-paperclip"></i> Pièces jointes (${task.emailAttachments.length})</h4>
                                <div class="attachments-list-enriched">
                                    ${task.emailAttachments.map(att => `
                                        <div class="attachment-item-enriched">
                                            <i class="fas fa-file"></i>
                                            <span class="attachment-name-enriched">${this.escapeHtml(att.name)}</span>
                                            <span class="attachment-size-enriched">${att.size}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Conversation complète -->
                        ${task.emailConversation && task.emailConversation.length > 0 ? `
                            <div class="email-conversation-enriched">
                                <h4><i class="fas fa-comments"></i> Conversation (${task.emailConversation.length} message${task.emailConversation.length > 1 ? 's' : ''})</h4>
                                <div class="conversation-thread-enriched">
                                    ${task.emailConversation.map((msg, idx) => `
                                        <div class="conversation-message-enriched ${idx === 0 ? 'latest' : ''}">
                                            <div class="message-header-enriched">
                                                <div class="message-sender-enriched">
                                                    <div class="message-avatar-enriched">
                                                        ${msg.fromName ? msg.fromName.charAt(0).toUpperCase() : 'E'}
                                                    </div>
                                                    <div class="message-details-enriched">
                                                        <span class="message-from-enriched">${this.escapeHtml(msg.fromName || msg.from || 'Expéditeur')}</span>
                                                        <span class="message-date-enriched">${new Date(msg.date).toLocaleString('fr-FR')}</span>
                                                    </div>
                                                </div>
                                                ${idx === 0 ? '<span class="latest-indicator-enriched">Le plus récent</span>' : ''}
                                            </div>
                                            <div class="message-content-enriched">
                                                ${this.formatEmailContent(msg.content)}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Contenu HTML complet de l'email -->
                        ${task.emailHtmlContent ? `
                            <div class="email-html-content-enriched">
                                <h4><i class="fas fa-code"></i> Contenu Complet</h4>
                                <div class="html-content-viewer-enriched" onclick="window.tasksView.toggleHtmlExpansion(this)">
                                    <div class="html-content-preview">
                                        ${task.emailHtmlContent}
                                    </div>
                                    <div class="expand-html-button">
                                        <i class="fas fa-expand"></i>
                                        Cliquer pour agrandir
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${task.actions && task.actions.length > 0 ? `
                    <div class="details-section-enriched">
                        <h3><i class="fas fa-tasks"></i> Actions Requises (${task.actions.length})</h3>
                        <div class="actions-list-enriched">
                            ${task.actions.map((action, idx) => `
                                <div class="action-item-enriched">
                                    <div class="action-number-enriched">${idx + 1}</div>
                                    <div class="action-content-enriched">
                                        <span class="action-text-enriched">${this.escapeHtml(action.text)}</span>
                                        ${action.deadline ? `
                                            <span class="action-deadline-enriched">
                                                <i class="fas fa-calendar"></i>
                                                ${this.formatDeadline(action.deadline)}
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.keyInfo && task.keyInfo.length > 0 ? `
                    <div class="details-section-enriched">
                        <h3><i class="fas fa-lightbulb"></i> Informations Clés (${task.keyInfo.length})</h3>
                        <div class="key-info-grid-enriched">
                            ${task.keyInfo.map(info => `
                                <div class="key-info-item-enriched">
                                    <i class="fas fa-check-circle"></i>
                                    <span>${this.escapeHtml(info)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.risks && task.risks.length > 0 ? `
                    <div class="details-section-enriched attention">
                        <h3><i class="fas fa-exclamation-triangle"></i> Points d'Attention (${task.risks.length})</h3>
                        <div class="risks-list-enriched">
                            ${task.risks.map(risk => `
                                <div class="risk-item-enriched">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>${this.escapeHtml(risk)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.suggestedReplies && task.suggestedReplies.length > 0 ? `
                    <div class="details-section-enriched suggestions">
                        <h3><i class="fas fa-reply-all"></i> Suggestions de Réponse (${task.suggestedReplies.length})</h3>
                        <div class="suggestions-preview-enriched">
                            <p>Cette tâche contient ${task.suggestedReplies.length} suggestion${task.suggestedReplies.length > 1 ? 's' : ''} de réponse personnalisée${task.suggestedReplies.length > 1 ? 's' : ''}.</p>
                            <button class="action-btn-unified primary" onclick="window.tasksView.showSuggestedReplies('${task.id}')">
                                <i class="fas fa-eye"></i>
                                <span>Voir toutes les suggestions</span>
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ================================================
    // INTERACTIONS ET SÉLECTIONS
    // ================================================
    
    selectAllVisible() {
        const visibleTasks = this.getVisibleTasks();
        const allSelected = visibleTasks.length > 0 && visibleTasks.every(task => this.selectedTasks.has(task.id));
        
        if (allSelected) {
            // Tout désélectionner
            visibleTasks.forEach(task => {
                this.selectedTasks.delete(task.id);
            });
            this.showToast(`${visibleTasks.length} tâches désélectionnées`, 'info');
        } else {
            // Tout sélectionner
            visibleTasks.forEach(task => {
                this.selectedTasks.add(task.id);
            });
            this.showToast(`${visibleTasks.length} tâches sélectionnées`, 'success');
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
        this.updateActionBar();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.refreshView();
        this.showToast('Sélection effacée', 'info');
    }

    handleTaskClick(event, taskId) {
        // Empêcher la propagation si c'est un clic sur checkbox ou actions
        if (event.target.type === 'checkbox' || event.target.closest('.task-actions-minimal, .task-actions-normal, .task-detailed-actions')) {
            return;
        }
        
        // Double-clic pour sélection, simple clic pour détails
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

    // ================================================
    // MODALES ADDITIONNELLES
    // ================================================
    
    showImageModal(taskId, imageIndex) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.emailImages || !task.emailImages[imageIndex]) return;

        const image = task.emailImages[imageIndex];
        const uniqueId = 'image_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay image-modal-overlay" onclick="window.tasksView.closeModal('${uniqueId}')">
                <div class="image-modal-container" onclick="event.stopPropagation()">
                    <div class="image-modal-header">
                        <h3>${this.escapeHtml(image.name)}</h3>
                        <div class="image-modal-info">
                            <span>${image.size}</span>
                            <span>${image.type}</span>
                        </div>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="image-modal-content">
                        <img src="${image.url}" alt="${image.name}" class="modal-image" />
                    </div>
                    <div class="image-modal-footer">
                        ${imageIndex > 0 ? `
                            <button class="btn-modal btn-secondary" onclick="window.tasksView.showImageModal('${taskId}', ${imageIndex - 1})">
                                <i class="fas fa-chevron-left"></i> Précédente
                            </button>
                        ` : ''}
                        ${imageIndex < task.emailImages.length - 1 ? `
                            <button class="btn-modal btn-secondary" onclick="window.tasksView.showImageModal('${taskId}', ${imageIndex + 1})">
                                Suivante <i class="fas fa-chevron-right"></i>
                            </button>
                        ` : ''}
                        <button class="btn-modal btn-primary" onclick="window.tasksView.downloadImage('${image.url}', '${image.name}')">
                            <i class="fas fa-download"></i> Télécharger
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    downloadImage(imageUrl, imageName) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = imageName;
        link.click();
    }

    toggleHtmlExpansion(element) {
        element.classList.toggle('expanded');
        const button = element.querySelector('.expand-html-button');
        const icon = button.querySelector('i');
        
        if (element.classList.contains('expanded')) {
            icon.className = 'fas fa-compress';
            button.innerHTML = '<i class="fas fa-compress"></i> Cliquer pour réduire';
        } else {
            icon.className = 'fas fa-expand';
            button.innerHTML = '<i class="fas fa-expand"></i> Cliquer pour agrandir';
        }
    }

    // ================================================
    // ACTIONS EN MASSE
    // ================================================
    
    showBulkActions() {
        if (this.selectedTasks.size === 0) return;
        
        const uniqueId = 'bulk_actions_modal_' + Date.now();
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i class="fas fa-cog"></i> Actions pour ${this.selectedTasks.size} tâche${this.selectedTasks.size > 1 ? 's' : ''}</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="bulk-actions-grid">
                            <button class="bulk-action-btn" onclick="window.tasksView.bulkComplete('${uniqueId}')">
                                <i class="fas fa-check-circle"></i>
                                <div class="bulk-action-info">
                                    <h4>Marquer comme terminé</h4>
                                    <p>Terminer toutes les tâches sélectionnées</p>
                                </div>
                            </button>
                            
                            <button class="bulk-action-btn" onclick="window.tasksView.bulkChangePriority('${uniqueId}')">
                                <i class="fas fa-flag"></i>
                                <div class="bulk-action-info">
                                    <h4>Changer la priorité</h4>
                                    <p>Modifier la priorité des tâches</p>
                                </div>
                            </button>
                            
                            <button class="bulk-action-btn" onclick="window.tasksView.bulkChangeStatus('${uniqueId}')">
                                <i class="fas fa-tasks"></i>
                                <div class="bulk-action-info">
                                    <h4>Changer le statut</h4>
                                    <p>Modifier le statut des tâches</p>
                                </div>
                            </button>
                            
                            <button class="bulk-action-btn" onclick="window.tasksView.bulkExport('${uniqueId}')">
                                <i class="fas fa-download"></i>
                                <div class="bulk-action-info">
                                    <h4>Exporter</h4>
                                    <p>Télécharger en CSV</p>
                                </div>
                            </button>
                            
                            <button class="bulk-action-btn danger" onclick="window.tasksView.bulkDelete('${uniqueId}')">
                                <i class="fas fa-trash"></i>
                                <div class="bulk-action-info">
                                    <h4>Supprimer</h4>
                                    <p>Supprimer définitivement</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    bulkComplete(modalId) {
        this.selectedTasks.forEach(taskId => {
            window.taskManager.updateTask(taskId, { 
                status: 'completed',
                completedAt: new Date().toISOString()
            });
        });
        
        this.showToast(`${this.selectedTasks.size} tâche(s) marquée(s) comme terminée(s)`, 'success');
        this.clearSelection();
        this.closeModal(modalId);
    }

    bulkDelete(modalId) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedTasks.size} tâche(s) ?\n\nCette action est irréversible.`)) {
            this.selectedTasks.forEach(taskId => {
                window.taskManager.deleteTask(taskId);
            });
            
            this.showToast(`${this.selectedTasks.size} tâche(s) supprimée(s)`, 'success');
            this.clearSelection();
            this.closeModal(modalId);
        }
    }

    bulkExport(modalId) {
        const tasks = Array.from(this.selectedTasks).map(id => window.taskManager.getTask(id)).filter(Boolean);
        
        const csvContent = [
            ['Titre', 'Description', 'Priorité', 'Statut', 'Échéance', 'Client', 'Email', 'Créé le'].join(','),
            ...tasks.map(task => [
                `"${task.title}"`,
                `"${task.description || ''}"`,
                task.priority,
                task.status,
                task.dueDate || '',
                task.client || '',
                task.hasEmail ? 'Oui' : 'Non',
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
        this.closeModal(modalId);
    }

    // ================================================
    // MÉTHODES D'ÉDITION ET CRÉATION
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
                        <h2><i class="fas fa-edit"></i> Modifier la tâche</h2>
                        <button class="modal-close" onclick="window.tasksView.closeModal('${uniqueId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${this.buildTaskForm(task)}
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
        
        // Focus sur le premier champ
        setTimeout(() => {
            const firstInput = document.querySelector(`#${uniqueId} input, #${uniqueId} textarea`);
            if (firstInput) firstInput.focus();
        }, 100);
    }

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
                        ${this.buildTaskForm()}
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
        
        // Focus sur le premier champ
        setTimeout(() => {
            const titleInput = document.getElementById('task-title');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    buildTaskForm(task = null) {
        const isEdit = !!task;
        
        return `
            <div class="task-form-unified">
                <div class="form-row-unified">
                    <div class="form-group-unified">
                        <label class="form-label-unified">
                            <i class="fas fa-heading"></i>
                            Titre de la tâche *
                        </label>
                        <input type="text" 
                               id="task-title" 
                               class="form-input-unified" 
                               placeholder="Titre de la tâche" 
                               value="${isEdit ? this.escapeHtml(task.title) : ''}" 
                               required />
                    </div>
                </div>
                
                <div class="form-row-unified">
                    <div class="form-group-unified">
                        <label class="form-label-unified">
                            <i class="fas fa-align-left"></i>
                            Description
                        </label>
                        <textarea id="task-description" 
                                  class="form-textarea-unified" 
                                  rows="4" 
                                  placeholder="Description détaillée...">${isEdit ? this.escapeHtml(task.description) : ''}</textarea>
                    </div>
                </div>
                
                <div class="form-row-unified">
                    <div class="form-group-unified">
                        <label class="form-label-unified">
                            <i class="fas fa-flag"></i>
                            Priorité
                        </label>
                        <select id="task-priority" class="form-select-unified">
                            <option value="low" ${isEdit && task.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                            <option value="medium" ${isEdit && task.priority === 'medium' ? 'selected' : (!isEdit ? 'selected' : '')}>📌 Normale</option>
                            <option value="high" ${isEdit && task.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="urgent" ${isEdit && task.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                        </select>
                    </div>
                    <div class="form-group-unified">
                        <label class="form-label-unified">
                            <i class="fas fa-tasks"></i>
                            Statut
                        </label>
                        <select id="task-status" class="form-select-unified">
                            <option value="todo" ${isEdit && task.status === 'todo' ? 'selected' : (!isEdit ? 'selected' : '')}>⏳ À faire</option>
                            <option value="in-progress" ${isEdit && task.status === 'in-progress' ? 'selected' : ''}>🔄 En cours</option>
                            <option value="completed" ${isEdit && task.status === 'completed' ? 'selected' : ''}>✅ Terminé</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row-unified">
                    <div class="form-group-unified">
                        <label class="form-label-unified">
                            <i class="fas fa-building"></i>
                            Client/Projet
                        </label>
                        <input type="text" 
                               id="task-client" 
                               class="form-input-unified" 
                               placeholder="Nom du client ou projet" 
                               value="${isEdit ? this.escapeHtml(task.client) : 'Interne'}" />
                    </div>
                    <div class="form-group-unified">
                        <label class="form-label-unified">
                            <i class="fas fa-calendar"></i>
                            Date d'échéance
                        </label>
                        <input type="date" 
                               id="task-duedate" 
                               class="form-input-unified" 
                               value="${isEdit && task.dueDate ? task.dueDate : ''}" />
                    </div>
                </div>
                
                ${isEdit && task.hasEmail ? `
                    <div class="form-section-unified">
                        <h3><i class="fas fa-envelope"></i> Informations Email</h3>
                        <div class="email-info-readonly-unified">
                            <div class="readonly-item-unified">
                                <strong>De:</strong> ${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')}
                            </div>
                            <div class="readonly-item-unified">
                                <strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject || 'Sans sujet')}
                            </div>
                            <div class="readonly-item-unified">
                                <label class="checkbox-label-unified">
                                    <input type="checkbox" id="task-needs-reply" ${task.needsReply ? 'checked' : ''} />
                                    <span class="checkbox-text-unified">Réponse requise</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    saveTaskChanges(taskId, modalId) {
        const title = document.getElementById('task-title')?.value?.trim();
        const description = document.getElementById('task-description')?.value?.trim();
        const priority = document.getElementById('task-priority')?.value;
        const status = document.getElementById('task-status')?.value;
        const client = document.getElementById('task-client')?.value?.trim();
        const dueDate = document.getElementById('task-duedate')?.value;
        const needsReply = document.getElementById('task-needs-reply')?.checked;

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

    createNewTask(modalId) {
        const title = document.getElementById('task-title')?.value?.trim();
        const description = document.getElementById('task-description')?.value?.trim();
        const priority = document.getElementById('task-priority')?.value;
        const dueDate = document.getElementById('task-duedate')?.value;
        const client = document.getElementById('task-client')?.value?.trim();

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

    // ================================================
    // MÉTHODES UTILITAIRES ET FORMATAGE
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

    formatDescription(description) {
        if (!description) return '';
        
        if (description.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
            return `<div class="structured-description-unified">${description.replace(/\n/g, '<br>')}</div>`;
        } else {
            return `<div class="simple-description-unified">${this.escapeHtml(description).replace(/\n/g, '<br>')}</div>`;
        }
    }

    formatEmailContent(content) {
        if (!content) return '<p>Contenu non disponible</p>';
        
        const formattedContent = content
            .replace(/\n/g, '<br>')
            .replace(/Email de:/g, '<strong>Email de:</strong>')
            .replace(/Date:/g, '<strong>Date:</strong>')
            .replace(/Sujet:/g, '<strong>Sujet:</strong>');
            
        return `<div class="email-content-formatted">${formattedContent}</div>`;
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

    // ================================================
    // GESTION DES FILTRES ET NAVIGATION
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
        
        // Reset UI elements
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        document.querySelectorAll('.filter-select-unified').forEach(select => {
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

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        // Mettre à jour les stats dans les pills
        const stats = window.taskManager.getStats();
        const pillsContainer = document.querySelector('.status-filters-unified');
        if (pillsContainer) {
            pillsContainer.innerHTML = this.buildUnifiedStatusPills(stats);
        }
        
        this.updateSelectionUI();
        this.updateActionBar();
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

    updateActionBar() {
        // Mettre à jour le bouton "Tout sélectionner"
        const selectAllBtn = document.querySelector('[onclick*="selectAllVisible"]');
        if (selectAllBtn) {
            const visibleTasks = this.getVisibleTasks();
            const allSelected = visibleTasks.length > 0 && visibleTasks.every(task => this.selectedTasks.has(task.id));
            
            const icon = selectAllBtn.querySelector('i');
            const span = selectAllBtn.querySelector('span');
            
            if (allSelected && visibleTasks.length > 0) {
                icon.className = 'fas fa-minus-square';
                span.textContent = 'Tout désélectionner';
            } else {
                icon.className = 'fas fa-check-double';
                span.textContent = 'Tout sélectionner';
            }
        }
        
        // Re-render la barre d'actions si nécessaire
        const actionsBar = document.querySelector('.actions-bar-unified');
        if (actionsBar && this.selectedTasks.size !== this.lastSelectedCount) {
            this.lastSelectedCount = this.selectedTasks.size;
            // Re-render complet uniquement si le nombre change significativement
            this.render(document.querySelector('.tasks-page-unified').parentNode);
        }
    }

    renderEmptyState() {
        let title, text, action = '';
        
        if (this.currentFilters.search) {
            title = 'Aucun résultat trouvé';
            text = `Aucune tâche ne correspond à votre recherche "${this.currentFilters.search}"`;
            action = `
                <button class="action-btn-unified primary" onclick="window.tasksView.clearSearch()">
                    <i class="fas fa-undo"></i>
                    <span>Effacer la recherche</span>
                </button>
            `;
        } else if (this.hasActiveFilters()) {
            title = 'Aucune tâche trouvée';
            text = 'Aucune tâche ne correspond à vos critères de filtrage.';
            action = `
                <button class="action-btn-unified primary" onclick="window.tasksView.resetAllFilters()">
                    <i class="fas fa-undo"></i>
                    <span>Réinitialiser les filtres</span>
                </button>
            `;
        } else {
            title = 'Aucune tâche';
            text = 'Vous n\'avez aucune tâche pour le moment.';
            action = `
                <button class="action-btn-unified primary" onclick="window.tasksView.showCreateModal()">
                    <i class="fas fa-plus"></i>
                    <span>Créer votre première tâche</span>
                </button>
            `;
        }
        
        return `
            <div class="empty-state-unified">
                <div class="empty-state-icon-unified">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3 class="empty-state-title-unified">${title}</h3>
                <p class="empty-state-text-unified">${text}</p>
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

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = 'auto';
    }

    showToast(message, type = 'info') {
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    // ================================================
    // STYLES UNIFIÉS
    // ================================================
    
    addUnifiedTaskStyles() {
        if (document.getElementById('unifiedTaskStylesV10')) return;
        
        const styles = document.createElement('style');
        styles.id = 'unifiedTaskStylesV10';
        styles.textContent = `
            /* Variables CSS Unifiées TaskManager v10.0 */
            :root {
                --icon-size-sm: 14px;
                --icon-size-md: 16px;
                --icon-size-lg: 20px;
                --icon-size-xl: 24px;
                
                --btn-height: 44px;
                --btn-padding: 0 16px;
                --btn-font-size: 14px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-gap: 8px;
                
                --card-padding: 16px;
                --card-border-radius: 12px;
                --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                --card-shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.12);
                
                --color-primary: #3b82f6;
                --color-primary-dark: #2563eb;
                --color-success: #10b981;
                --color-warning: #f59e0b;
                --color-danger: #ef4444;
                --color-gray: #6b7280;
                --color-gray-light: #f3f4f6;
                --color-gray-dark: #374151;
                
                --transition: all 0.2s ease;
                --border-color: #e5e7eb;
                --text-color: #1f2937;
                --text-muted: #6b7280;
            }
            
            /* Base unifiée */
            .tasks-page-unified {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                min-height: 100vh;
                padding: 20px;
                color: var(--text-color);
                font-size: var(--btn-font-size);
            }

            /* Barre de recherche unifiée */
            .search-bar-unified {
                margin-bottom: 16px;
            }
            
            .search-container-unified {
                position: relative;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .search-input-unified {
                width: 100%;
                height: 52px;
                padding: 0 24px 0 52px;
                border: 2px solid var(--border-color);
                border-radius: 26px;
                font-size: 16px;
                background: white;
                transition: var(--transition);
                outline: none;
                box-shadow: var(--card-shadow);
            }
            
            .search-input-unified:focus {
                border-color: var(--color-primary);
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), var(--card-shadow);
            }
            
            .search-icon-unified {
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-muted);
                font-size: var(--icon-size-lg);
                pointer-events: none;
            }
            
            .search-clear-unified {
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
            
            .search-clear-unified:hover {
                background: #dc2626;
                transform: translateY(-50%) scale(1.1);
            }

            /* Barre d'actions unifiée */
            .actions-bar-unified {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--card-border-radius);
                padding: 16px 20px;
                margin-bottom: 16px;
                box-shadow: var(--card-shadow);
            }
            
            .view-modes-unified {
                display: flex;
                background: var(--color-gray-light);
                border: 1px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                padding: 4px;
                gap: 2px;
            }
            
            .view-mode-unified {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                padding: 8px 16px;
                height: 36px;
                border: none;
                background: transparent;
                color: var(--text-muted);
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: var(--transition);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                white-space: nowrap;
            }
            
            .view-mode-unified i {
                font-size: var(--icon-size-md);
            }
            
            .view-mode-unified:hover {
                background: rgba(255, 255, 255, 0.8);
                color: var(--text-color);
            }
            
            .view-mode-unified.active {
                background: white;
                color: var(--color-primary);
                box-shadow: var(--card-shadow);
                font-weight: 700;
            }
            
            .main-actions-unified {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .action-btn-unified {
                display: flex;
                align-items: center;
                gap: var(--btn-gap);
                height: var(--btn-height);
                padding: var(--btn-padding);
                background: white;
                color: var(--text-color);
                border: 1px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: var(--transition);
                box-shadow: var(--card-shadow);
                position: relative;
                white-space: nowrap;
            }
            
            .action-btn-unified i {
                font-size: var(--icon-size-md);
            }
            
            .action-btn-unified:hover:not(.disabled) {
                background: var(--color-gray-light);
                border-color: var(--color-primary);
                transform: translateY(-1px);
                box-shadow: var(--card-shadow-hover);
            }
            
            .action-btn-unified.primary {
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
                color: white;
                border-color: transparent;
            }
            
            .action-btn-unified.primary:hover {
                background: linear-gradient(135deg, var(--color-primary-dark) 0%, #1d4ed8 100%);
                transform: translateY(-2px);
            }
            
            .action-btn-unified.secondary {
                background: var(--color-gray-light);
                color: var(--color-gray-dark);
            }
            
            .action-btn-unified.success {
                background: var(--color-success);
                color: white;
                border-color: transparent;
            }
            
            .action-btn-unified.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }
            
            .count-badge-unified {
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
                animation: badgePulse 2s ease-in-out infinite;
            }
            
            @keyframes badgePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .selection-info-unified {
                display: flex;
                align-items: center;
                gap: var(--btn-gap);
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: var(--btn-border-radius);
                padding: 8px 12px;
                color: #1e40af;
                font-weight: 600;
            }
            
            .selection-info-unified i {
                font-size: var(--icon-size-md);
            }
            
            .clear-selection-unified {
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
            
            .clear-selection-unified:hover {
                background: rgba(239, 68, 68, 0.2);
                transform: scale(1.1);
            }

            /* Filtres de statut unifiés */
            .status-filters-unified {
                display: flex;
                gap: 12px;
                margin-bottom: 20px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .status-pill-unified {
                display: flex;
                flex-direction: column;
                align-items: center;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--card-border-radius);
                padding: 12px 16px;
                cursor: pointer;
                transition: var(--transition);
                box-shadow: var(--card-shadow);
                min-width: 120px;
                position: relative;
            }
            
            .status-pill-unified:hover {
                border-color: var(--color-primary);
                background: #f0f9ff;
                transform: translateY(-2px);
                box-shadow: var(--card-shadow-hover);
            }
            
            .status-pill-unified.active {
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
                color: white;
                border-color: var(--color-primary);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
            }
            
            .pill-header-unified {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
            }
            
            .pill-header-unified i {
                font-size: var(--icon-size-md);
            }
            
            .pill-count-unified {
                background: rgba(0, 0, 0, 0.1);
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 700;
                min-width: 20px;
                text-align: center;
            }
            
            .status-pill-unified.active .pill-count-unified {
                background: rgba(255, 255, 255, 0.3);
                color: white;
            }
            
            .pill-label-unified {
                font-weight: 600;
                font-size: 13px;
                text-align: center;
            }

            /* Panneau de filtres avancés */
            .advanced-filters-panel-unified {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--card-border-radius);
                margin-bottom: 20px;
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
                opacity: 0;
                box-shadow: var(--card-shadow);
            }
            
            .advanced-filters-panel-unified.show {
                max-height: 200px;
                opacity: 1;
                padding: 20px;
            }
            
            .filters-grid-unified {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                align-items: end;
            }
            
            .filter-group-unified {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .filter-label-unified {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                font-size: 13px;
                color: var(--text-color);
            }
            
            .filter-label-unified i {
                font-size: var(--icon-size-sm);
            }
            
            .filter-select-unified {
                height: var(--btn-height);
                padding: 0 16px;
                border: 1px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                background: white;
                font-size: var(--btn-font-size);
                color: var(--text-color);
                cursor: pointer;
                transition: var(--transition);
            }
            
            .filter-select-unified:focus {
                outline: none;
                border-color: var(--color-primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .filter-actions-unified {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Container principal des tâches */
            .tasks-container-unified {
                background: transparent;
            }

            /* Éléments communs */
            .task-checkbox-unified {
                width: 20px;
                height: 20px;
                cursor: pointer;
                border-radius: 6px;
                border: 2px solid var(--border-color);
                background: white;
                transition: var(--transition);
                appearance: none;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .task-checkbox-unified:checked {
                background: var(--color-primary);
                border-color: var(--color-primary);
            }
            
            .task-checkbox-unified:checked::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: 700;
            }
            
            .priority-indicator-unified {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                border: 2px solid;
                transition: var(--transition);
            }
            
            .priority-indicator-unified i {
                font-size: var(--icon-size-sm);
            }
            
            .priority-indicator-unified.priority-urgent {
                background: #fef2f2;
                color: var(--color-danger);
                border-color: #fecaca;
            }
            
            .priority-indicator-unified.priority-high {
                background: #fef3c7;
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .priority-indicator-unified.priority-medium {
                background: #eff6ff;
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .priority-indicator-unified.priority-low {
                background: #f0fdf4;
                color: var(--color-success);
                border-color: #bbf7d0;
            }
            
            .priority-bar-unified {
                width: 4px;
                height: 60px;
                border-radius: 2px;
                margin-right: 12px;
                transition: var(--transition);
            }
            
            .priority-bar-unified.priority-urgent {
                background: var(--color-danger);
            }
            
            .priority-bar-unified.priority-high {
                background: var(--color-warning);
            }
            
            .priority-bar-unified.priority-medium {
                background: var(--color-primary);
            }
            
            .priority-bar-unified.priority-low {
                background: var(--color-success);
            }
            
            .type-badge-unified,
            .deadline-badge-unified,
            .priority-badge-unified,
            .status-badge-unified {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid;
                white-space: nowrap;
            }
            
            .type-badge-unified i,
            .deadline-badge-unified i,
            .priority-badge-unified i,
            .status-badge-unified i {
                font-size: 10px;
            }
            
            .type-badge-unified {
                background: var(--color-gray-light);
                color: var(--color-gray);
                border-color: var(--border-color);
            }
            
            .type-badge-unified.email {
                background: #e0f2fe;
                color: #0891b2;
                border-color: #7dd3fc;
            }
            
            .deadline-badge-unified.deadline-overdue {
                background: #fef2f2;
                color: var(--color-danger);
                border-color: #fecaca;
                animation: pulse 2s infinite;
            }
            
            .deadline-badge-unified.deadline-today {
                background: #fef3c7;
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .deadline-badge-unified.deadline-tomorrow {
                background: #fef3c7;
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .deadline-badge-unified.deadline-week {
                background: #eff6ff;
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .deadline-badge-unified.deadline-normal {
                background: var(--color-gray-light);
                color: var(--color-gray);
                border-color: var(--border-color);
            }
            
            .deadline-badge-unified.no-deadline {
                background: var(--color-gray-light);
                color: var(--text-muted);
                border-color: var(--border-color);
                font-style: italic;
            }
            
            .priority-badge-unified.priority-urgent {
                background: #fef2f2;
                color: var(--color-danger);
                border-color: #fecaca;
            }
            
            .priority-badge-unified.priority-high {
                background: #fef3c7;
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .priority-badge-unified.priority-medium {
                background: #eff6ff;
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .priority-badge-unified.priority-low {
                background: #f0fdf4;
                color: var(--color-success);
                border-color: #bbf7d0;
            }
            
            .status-badge-unified.status-todo {
                background: #fef3c7;
                color: var(--color-warning);
                border-color: #fde68a;
            }
            
            .status-badge-unified.status-in-progress {
                background: #eff6ff;
                color: var(--color-primary);
                border-color: #bfdbfe;
            }
            
            .status-badge-unified.status-completed {
                background: #f0fdf4;
                color: var(--color-success);
                border-color: #bbf7d0;
            }
            
            .action-btn-icon-unified {
                width: 36px;
                height: 36px;
                border: 1px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                background: white;
                color: var(--text-muted);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
                box-shadow: var(--card-shadow);
            }
            
            .action-btn-icon-unified i {
                font-size: var(--icon-size-sm);
            }
            
            .action-btn-icon-unified:hover {
                background: var(--color-gray-light);
                transform: translateY(-1px);
                box-shadow: var(--card-shadow-hover);
            }
            
            .action-btn-icon-unified.complete:hover {
                background: #dcfce7;
                border-color: var(--color-success);
                color: var(--color-success);
            }
            
            .action-btn-icon-unified.edit:hover {
                background: #fef3c7;
                border-color: var(--color-warning);
                color: var(--color-warning);
            }
            
            .action-btn-icon-unified.details:hover {
                background: #f3e8ff;
                border-color: #8b5cf6;
                color: #8b5cf6;
            }
            
            .action-btn-icon-unified.reply:hover {
                background: #dbeafe;
                border-color: var(--color-primary);
                color: var(--color-primary);
            }

            /* ===== VUE MINIMALISTE ===== */
            .tasks-minimal-unified {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--card-border-radius);
                overflow: hidden;
                box-shadow: var(--card-shadow);
            }
            
            .task-minimal-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                cursor: pointer;
                transition: var(--transition);
                border-bottom: 1px solid #f8fafc;
                gap: 12px;
                min-height: 60px;
            }
            
            .task-minimal-item:last-child {
                border-bottom: none;
            }
            
            .task-minimal-item:hover {
                background: #f8fafc;
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
                color: var(--text-color);
                font-size: 15px;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-meta-minimal {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 12px;
                color: var(--text-muted);
            }
            
            .task-client-minimal,
            .task-deadline-minimal {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .task-client-minimal i,
            .task-deadline-minimal i {
                font-size: 10px;
            }
            
            .task-deadline-minimal.deadline-overdue {
                color: var(--color-danger);
                font-weight: 600;
            }
            
            .task-deadline-minimal.deadline-today,
            .task-deadline-minimal.deadline-tomorrow {
                color: var(--color-warning);
                font-weight: 600;
            }
            
            .task-deadline-minimal.deadline-week {
                color: var(--color-primary);
            }
            
            .email-indicator-minimal {
                color: #0891b2;
            }
            
            .task-actions-minimal {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            /* ===== VUE NORMALE ===== */
            .tasks-normal-unified {
                display: flex;
                flex-direction: column;
                gap: 0;
            }
            
            .task-normal-item {
                display: flex;
                align-items: center;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: var(--transition);
                position: relative;
                min-height: 80px;
                border-bottom: 1px solid #f1f5f9;
                gap: 12px;
            }
            
            .task-normal-item:first-child {
                border-top-left-radius: var(--card-border-radius);
                border-top-right-radius: var(--card-border-radius);
            }
            
            .task-normal-item:last-child {
                border-bottom-left-radius: var(--card-border-radius);
                border-bottom-right-radius: var(--card-border-radius);
                border-bottom: 1px solid var(--border-color);
            }
            
            .task-normal-item:hover {
                background: #f8fafc;
                transform: translateY(-1px);
                box-shadow: var(--card-shadow-hover);
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
                gap: 8px;
            }
            
            .task-header-normal {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 16px;
            }
            
            .task-title-normal {
                font-weight: 700;
                color: var(--text-color);
                font-size: 16px;
                margin: 0;
                line-height: 1.3;
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .task-badges-normal {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-shrink: 0;
            }
            
            .task-meta-normal {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 13px;
                color: var(--text-muted);
                flex-wrap: wrap;
            }
            
            .client-info-normal,
            .sender-info-normal,
            .reply-needed-normal,
            .has-images-normal {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .client-info-normal i,
            .sender-info-normal i,
            .reply-needed-normal i,
            .has-images-normal i {
                font-size: 12px;
            }
            
            .reply-needed-normal {
                color: var(--color-warning);
                font-weight: 600;
            }
            
            .has-images-normal {
                color: #8b5cf6;
                font-weight: 600;
            }
            
            .task-actions-normal {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            /* ===== VUE DÉTAILLÉE ===== */
            .tasks-detailed-unified {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: 20px;
            }
            
            .task-detailed-item {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--card-border-radius);
                padding: 20px;
                transition: var(--transition);
                box-shadow: var(--card-shadow);
                min-height: 250px;
                display: flex;
                flex-direction: column;
            }
            
            .task-detailed-item:hover {
                transform: translateY(-2px);
                box-shadow: var(--card-shadow-hover);
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
                margin-bottom: 16px;
            }
            
            .task-indicators-detailed {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .status-indicator-unified {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--color-gray-light);
                color: var(--color-gray);
                border: 1px solid var(--border-color);
            }
            
            .status-indicator-unified i {
                font-size: 12px;
            }
            
            .task-detailed-content {
                flex: 1;
                margin-bottom: 16px;
            }
            
            .task-title-detailed {
                font-size: 18px;
                font-weight: 700;
                color: var(--text-color);
                margin: 0 0 12px 0;
                line-height: 1.3;
                cursor: pointer;
                transition: var(--transition);
            }
            
            .task-title-detailed:hover {
                color: var(--color-primary);
            }
            
            .task-description-detailed {
                font-size: 14px;
                color: var(--text-muted);
                line-height: 1.5;
                margin: 0 0 16px 0;
            }
            
            .task-badges-detailed {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 12px;
            }
            
            .task-meta-detailed {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .meta-item-detailed {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--text-muted);
            }
            
            .meta-item-detailed i {
                font-size: 12px;
                width: 16px;
            }
            
            .meta-item-detailed.reply-needed {
                color: var(--color-warning);
                font-weight: 600;
            }
            
            .meta-item-detailed.has-images {
                color: #8b5cf6;
                font-weight: 600;
            }
            
            .task-detailed-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            /* ===== MODALES ===== */
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
            
            .modal-container.modal-xl {
                max-width: 1200px;
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
                color: var(--text-color);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .modal-header h2 i {
                font-size: var(--icon-size-lg);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: var(--text-muted);
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
            }
            
            .modal-close:hover {
                background: var(--color-gray-light);
                color: var(--text-color);
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
                gap: 8px;
                padding: 12px 20px;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                border: 1px solid;
                white-space: nowrap;
            }
            
            .btn-modal i {
                font-size: var(--icon-size-sm);
            }
            
            .btn-modal.btn-primary {
                background: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
            }
            
            .btn-modal.btn-primary:hover {
                background: var(--color-primary-dark);
                border-color: var(--color-primary-dark);
                transform: translateY(-1px);
            }
            
            .btn-modal.btn-secondary {
                background: var(--color-gray-light);
                color: var(--text-color);
                border-color: var(--border-color);
            }
            
            .btn-modal.btn-secondary:hover {
                background: #e5e7eb;
                border-color: #9ca3af;
            }
            
            .btn-modal.btn-success {
                background: var(--color-success);
                color: white;
                border-color: var(--color-success);
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

            /* ===== DÉTAILS DE TÂCHE ENRICHIS ===== */
            .task-details-enriched {
                max-width: none;
            }
            
            .details-header-enriched {
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .task-title-enriched {
                font-size: 24px;
                font-weight: 700;
                color: var(--text-color);
                margin: 0 0 12px 0;
                line-height: 1.3;
            }
            
            .task-badges-enriched {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .details-section-enriched {
                margin-bottom: 24px;
                background: #f9fafb;
                border: 1px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                overflow: hidden;
            }
            
            .details-section-enriched h3 {
                margin: 0;
                padding: 16px 20px;
                background: white;
                border-bottom: 1px solid var(--border-color);
                font-size: 16px;
                font-weight: 600;
                color: var(--text-color);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .details-section-enriched h3 i {
                font-size: var(--icon-size-md);
            }
            
            .details-section-enriched.email-section {
                background: #f8fafc;
                border-color: #e2e8f0;
            }
            
            .details-section-enriched.email-section h3 {
                background: #f8fafc;
                border-bottom-color: #e2e8f0;
                color: var(--text-color);
            }
            
            .details-section-enriched.attention {
                background: #fef3c7;
                border-color: #fbbf24;
            }
            
            .details-section-enriched.attention h3 {
                background: #fef9e8;
                border-bottom-color: #fbbf24;
                color: #92400e;
            }
            
            .details-section-enriched.suggestions {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-color: #7dd3fc;
            }
            
            .details-section-enriched.suggestions h3 {
                background: #f0f9ff;
                border-bottom-color: #7dd3fc;
                color: #075985;
            }
            
            .description-content-enriched,
            .info-grid-enriched,
            .email-info-enriched,
            .actions-list-enriched,
            .key-info-grid-enriched,
            .risks-list-enriched,
            .suggestions-preview-enriched {
                padding: 16px 20px;
            }
            
            .structured-description-unified {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 13px;
                line-height: 1.6;
                background: white;
                padding: 16px;
                border-radius: 6px;
                border: 1px solid var(--border-color);
            }
            
            .simple-description-unified {
                font-size: 14px;
                line-height: 1.6;
                color: var(--text-color);
            }
            
            .info-grid-enriched {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }
            
            .info-item-enriched {
                display: flex;
                gap: 12px;
                font-size: 14px;
                color: var(--text-color);
                line-height: 1.4;
            }
            
            .info-item-enriched strong {
                min-width: 120px;
                color: var(--text-color);
                font-weight: 600;
            }

            /* Section Email Enrichie */
            .email-header-enriched {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding: 12px 16px;
                background: white;
                border-radius: 6px;
                border: 1px solid var(--border-color);
            }
            
            .sender-info-enriched {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .sender-avatar-enriched {
                width: 40px;
                height: 40px;
                background: var(--color-gray-light);
                color: var(--text-color);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: 600;
                border: 1px solid var(--border-color);
            }
            
            .sender-details-enriched {
                display: flex;
                flex-direction: column;
            }
            
            .sender-name-enriched {
                font-weight: 600;
                color: var(--text-color);
                font-size: 16px;
            }
            
            .sender-email-enriched {
                font-size: 13px;
                color: var(--text-muted);
            }
            
            .email-meta-enriched {
                display: flex;
                flex-direction: column;
                gap: 6px;
                text-align: right;
            }
            
            .email-date-enriched,
            .email-domain-enriched {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                color: var(--text-muted);
            }
            
            .email-date-enriched i,
            .email-domain-enriched i {
                font-size: 12px;
            }
            
            .email-subject-enriched {
                font-size: 13px;
                color: var(--text-color);
                margin-bottom: 12px;
                padding: 10px 12px;
                background: white;
                border-radius: 4px;
                border: 1px solid var(--border-color);
                font-weight: 500;
            }
            
            .email-flags-enriched {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .email-flag-enriched {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .email-flag-enriched.reply-needed {
                background: #fef3c7;
                color: var(--color-warning);
                border: 1px solid #fde68a;
            }
            
            .email-flag-enriched.replied {
                background: #dcfce7;
                color: var(--color-success);
                border: 1px solid #bbf7d0;
            }
            
            .email-flag-enriched.has-attachments {
                background: #f3e8ff;
                color: #8b5cf6;
                border: 1px solid #e9d5ff;
            }
            
            .email-flag-enriched i {
                font-size: 11px;
            }

            /* Images de l'email */
            .email-images-enriched h4,
            .email-attachments-enriched h4,
            .email-conversation-enriched h4,
            .email-html-content-enriched h4 {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-color);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .images-grid-enriched {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 12px;
            }
            
            .image-item-enriched {
                position: relative;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                overflow: hidden;
                cursor: pointer;
                transition: var(--transition);
                aspect-ratio: 4/3;
            }
            
            .image-item-enriched:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }
            
            .email-image-thumb {
                width: 100%;
                height: 120px;
                object-fit: cover;
                display: block;
            }
            
            .image-info-enriched {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                color: white;
                padding: 8px;
            }
            
            .image-name-enriched {
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 2px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .image-size-enriched {
                font-size: 10px;
                opacity: 0.8;
            }
            
            .image-overlay-enriched {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: var(--icon-size-lg);
                opacity: 0;
                transition: var(--transition);
            }
            
            .image-item-enriched:hover .image-overlay-enriched {
                opacity: 1;
            }

            /* Pièces jointes */
            .attachments-list-enriched {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .attachment-item-enriched {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 10px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                font-size: 12px;
            }
            
            .attachment-item-enriched i {
                font-size: var(--icon-size-sm);
                color: var(--text-muted);
            }
            
            .attachment-name-enriched {
                flex: 1;
                font-weight: 500;
                color: var(--text-color);
            }
            
            .attachment-size-enriched {
                color: var(--text-muted);
                font-size: 12px;
            }

            /* Conversation */
            .conversation-thread-enriched {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .conversation-message-enriched {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                padding: 12px;
                position: relative;
            }
            
            .conversation-message-enriched.latest {
                border-color: var(--color-primary);
                box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
            }
            
            .message-header-enriched {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .message-sender-enriched {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .message-avatar-enriched {
                width: 28px;
                height: 28px;
                background: var(--color-gray-light);
                color: var(--text-color);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid var(--border-color);
            }
            
            .message-details-enriched {
                display: flex;
                flex-direction: column;
            }
            
            .message-from-enriched {
                font-weight: 600;
                color: var(--text-color);
                font-size: 14px;
            }
            
            .message-date-enriched {
                font-size: 12px;
                color: var(--text-muted);
            }
            
            .latest-indicator-enriched {
                background: var(--color-primary);
                color: white;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 600;
            }
            
            .message-content-enriched {
                font-size: 14px;
                line-height: 1.6;
                color: var(--text-color);
            }
            
            .email-content-formatted {
                font-family: inherit;
                line-height: 1.6;
            }

            /* Contenu HTML */
            .html-content-viewer-enriched {
                position: relative;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                overflow: hidden;
                cursor: pointer;
                transition: var(--transition);
            }
            
            .html-content-preview {
                max-height: 200px;
                overflow: hidden;
                padding: 12px;
            }
            
            .html-content-viewer-enriched.expanded .html-content-preview {
                max-height: none;
                overflow: visible;
            }
            
            .expand-html-button {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(107, 114, 128, 0.9));
                color: white;
                padding: 8px 12px;
                text-align: center;
                font-size: 11px;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
            }
            
            .html-content-viewer-enriched.expanded .expand-html-button {
                position: static;
                background: var(--color-gray-light);
                color: var(--text-color);
            }

            /* Actions et informations */
            .actions-list-enriched {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .action-item-enriched {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: white;
                border-radius: 6px;
                border: 1px solid var(--border-color);
            }
            
            .action-number-enriched {
                width: 28px;
                height: 28px;
                background: var(--color-primary);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .action-content-enriched {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .action-text-enriched {
                font-size: 14px;
                color: var(--text-color);
                font-weight: 500;
            }
            
            .action-deadline-enriched {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: var(--color-danger);
                font-weight: 600;
                background: #fef2f2;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #fecaca;
                width: fit-content;
            }
            
            .action-deadline-enriched i {
                font-size: 10px;
            }
            
            .key-info-grid-enriched {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .key-info-item-enriched {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                font-size: 14px;
                color: var(--text-color);
                line-height: 1.4;
                padding: 8px 12px;
                background: white;
                border-radius: 6px;
                border: 1px solid var(--border-color);
            }
            
            .key-info-item-enriched i {
                font-size: 12px;
                color: var(--color-success);
                margin-top: 2px;
            }
            
            .risks-list-enriched {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .risk-item-enriched {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 6px;
                padding: 10px 12px;
            }
            
            .risk-item-enriched i {
                font-size: 14px;
                color: var(--color-warning);
                margin-top: 2px;
            }
            
            .risk-item-enriched span {
                flex: 1;
                font-size: 13px;
                color: #92400e;
                line-height: 1.4;
            }

            /* Modal d'image */
            .image-modal-overlay {
                background: rgba(0, 0, 0, 0.9);
            }
            
            .image-modal-container {
                background: white;
                border-radius: 16px;
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            }
            
            .image-modal-header {
                padding: 16px 20px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .image-modal-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--text-color);
            }
            
            .image-modal-info {
                display: flex;
                gap: 12px;
                font-size: 12px;
                color: var(--text-muted);
            }
            
            .image-modal-content {
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                max-height: 70vh;
                overflow: hidden;
            }
            
            .modal-image {
                max-width: 100%;
                max-height: 100%;
                border-radius: var(--btn-border-radius);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }
            
            .image-modal-footer {
                padding: 16px 20px;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            /* Actions en masse */
            .bulk-actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
            }
            
            .bulk-action-btn {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 20px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--card-border-radius);
                cursor: pointer;
                transition: var(--transition);
                text-align: left;
            }
            
            .bulk-action-btn:hover {
                border-color: var(--color-primary);
                transform: translateY(-2px);
                box-shadow: var(--card-shadow-hover);
            }
            
            .bulk-action-btn.danger:hover {
                border-color: var(--color-danger);
                background: #fef2f2;
            }
            
            .bulk-action-btn i {
                font-size: var(--icon-size-xl);
                color: var(--color-primary);
                width: 40px;
                text-align: center;
            }
            
            .bulk-action-btn.danger i {
                color: var(--color-danger);
            }
            
            .bulk-action-info h4 {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--text-color);
            }
            
            .bulk-action-info p {
                margin: 0;
                font-size: 13px;
                color: var(--text-muted);
                line-height: 1.4;
            }

            /* Formulaires */
            .task-form-unified {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .form-row-unified {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            .form-row-unified .form-group-unified:only-child {
                grid-column: 1 / -1;
            }
            
            .form-group-unified {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .form-label-unified {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: var(--text-color);
                font-size: 14px;
            }
            
            .form-label-unified i {
                font-size: var(--icon-size-sm);
            }
            
            .form-input-unified,
            .form-select-unified,
            .form-textarea-unified {
                padding: 12px 16px;
                border: 2px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                background: white;
                transition: var(--transition);
                font-family: inherit;
                color: var(--text-color);
            }
            
            .form-input-unified:focus,
            .form-select-unified:focus,
            .form-textarea-unified:focus {
                outline: none;
                border-color: var(--color-primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-textarea-unified {
                resize: vertical;
                min-height: 80px;
            }
            
            .form-section-unified {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
            }
            
            .form-section-unified h3 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--text-color);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .form-section-unified h3 i {
                font-size: var(--icon-size-md);
            }
            
            .email-info-readonly-unified {
                background: #f8fafc;
                border: 1px solid var(--border-color);
                border-radius: var(--btn-border-radius);
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .readonly-item-unified {
                font-size: 14px;
                color: var(--text-color);
            }
            
            .readonly-item-unified strong {
                font-weight: 600;
                margin-right: 8px;
            }
            
            .checkbox-label-unified {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            
            .checkbox-text-unified {
                font-size: 14px;
                color: var(--text-color);
            }

            /* État vide */
            .empty-state-unified {
                text-align: center;
                padding: 60px 30px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 20px;
                box-shadow: var(--card-shadow);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .empty-state-icon-unified {
                font-size: 48px;
                margin-bottom: 20px;
                color: var(--text-muted);
                background: linear-gradient(135deg, var(--color-gray-light) 0%, var(--border-color) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .empty-state-title-unified {
                font-size: 22px;
                font-weight: 700;
                color: var(--text-color);
                margin-bottom: 12px;
            }
            
            .empty-state-text-unified {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                line-height: 1.6;
                color: var(--text-muted);
                font-weight: 500;
            }
            
            .loading-state-unified {
                text-align: center;
                padding: 60px 30px;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 20px;
                box-shadow: var(--card-shadow);
            }
            
            .loading-icon-unified {
                font-size: 32px;
                margin-bottom: 16px;
                color: var(--color-primary);
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .tasks-detailed-unified {
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                }
                
                .status-filters-unified {
                    justify-content: flex-start;
                }
                
                .status-pill-unified {
                    min-width: 100px;
                }
            }
            
            @media (max-width: 1024px) {
                .actions-bar-unified {
                    flex-direction: column;
                    gap: 16px;
                    align-items: stretch;
                }
                
                .view-modes-unified {
                    width: 100%;
                    justify-content: space-around;
                }
                
                .main-actions-unified {
                    width: 100%;
                    justify-content: center;
                }
                
                .filters-grid-unified {
                    grid-template-columns: 1fr;
                }
                
                .tasks-detailed-unified {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 768px) {
                .tasks-page-unified {
                    padding: 12px;
                }
                
                .view-mode-unified span,
                .action-btn-unified span {
                    display: none;
                }
                
                .form-row-unified {
                    grid-template-columns: 1fr;
                }
                
                .task-meta-normal {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .task-badges-normal,
                .task-badges-detailed {
                    flex-direction: column;
                    align-items: flex-start;
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
                
                .images-grid-enriched {
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                }
                
                .email-header-enriched {
                    flex-direction: column;
                    gap: 12px;
                }
                
                .email-meta-enriched {
                    text-align: left;
                }
            }
            
            @media (max-width: 480px) {
                .status-filters-unified {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .status-pill-unified {
                    min-width: auto;
                }
                
                .main-actions-unified {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .task-meta-minimal {
                    flex-direction: column;
                    gap: 4px;
                }
                
                .bulk-actions-grid {
                    grid-template-columns: 1fr;
                }
                
                .task-badges-enriched {
                    flex-direction: column;
                    gap: 6px;
                }
                
                .images-grid-enriched {
                    grid-template-columns: 1fr;
                }
                
                .conversation-thread-enriched {
                    gap: 12px;
                }
                
                .message-header-enriched {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
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
    console.log('[TaskManager] Initializing v10.0 - Version complète réécrite...');
    
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
    
    console.log('✅ TaskManager v10.0 loaded - Version complète réécrite avec harmonisation et contenu email enrichi');
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
