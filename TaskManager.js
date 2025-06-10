// TaskManager Pro v10.0 - Interface Harmonisée avec Détails Structurés et Onglets

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
            console.log('[TaskManager] Initializing v10.0 - Interface Harmonisée avec Détails Structurés...');
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
[Votre nom]`,
                        generatedBy: 'ai-analysis',
                        generatedAt: new Date().toISOString()
                    },
                    {
                        tone: 'urgent',
                        subject: 'Re: Validation campagne marketing Q2 - Quelques ajustements',
                        content: `Bonjour Sarah,

Merci pour cette présentation de la campagne Q2.

Je valide globalement le projet avec quelques ajustements :
• Budget : OK pour 50k€
• Visuels : excellents, à conserver
• Calendrier : pouvons-nous avancer le lancement d'une semaine ?

Pouvez-vous me confirmer la faisabilité de cet ajustement ?

Cordialement,
[Votre nom]`,
                        generatedBy: 'ai-analysis',
                        generatedAt: new Date().toISOString()
                    }
                ],
                insights: {
                    keyInfo: ['Budget proposé : 50k€', 'Cible : 25-45 ans', 'Canaux : LinkedIn, Google Ads'],
                    risks: ['Deadline serrée pour le lancement', 'Coordination requise avec l\'équipe commerciale'],
                    opportunities: ['Campagne bien structurée', 'Budget cohérent avec les objectifs'],
                    emailTone: 'formel',
                    responseExpected: true,
                    attachments: [],
                    contacts: ['Sarah Martin <sarah.martin@acme-corp.com>'],
                    links: []
                },
                aiAnalysis: {
                    summary: 'Demande de validation pour la campagne marketing Q2 avec budget de 50k€',
                    importance: 'high',
                    confidence: 0.95,
                    method: 'ai-enhanced'
                },
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
                emailContent: `Email de: Bankin' <offres@bankin.com>
Date: ${new Date().toLocaleString('fr-FR')}
Sujet: Offre record : jusqu'à 260€ offerts

Bonjour,

Nous avons le plaisir de vous présenter notre offre exceptionnelle.

Jusqu'à 260€ offerts pour l'ouverture d'un nouveau compte :
- 80€ offerts à l'ouverture
- 180€ de bonus après 3 mois d'utilisation

Cette offre est valable jusqu'au 30 juin 2025.

Cordialement,
L'équipe Bankin'`,
                tags: ['finance', 'offre'],
                client: 'Bankin\'',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                updatedAt: new Date(Date.now() - 3600000).toISOString(),
                needsReply: false,
                dueDate: null,
                summary: 'Offre promotionnelle Bankin\' avec bonus jusqu\'à 260€',
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
                summary: 'Réunion de suivi mensuel pour le projet Alpha',
                method: 'manual'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    // =====================================
    // TASK CREATION METHODS
    // =====================================
    
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
            
            // Email metadata
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
            
            // AI Analysis data
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            insights: taskData.insights || this.generateBasicInsights(email, taskData),
            aiAnalysis: taskData.aiAnalysis || null,
            
            // Reply suggestions
            suggestedReplies: suggestedReplies,
            aiRepliesGenerated: suggestedReplies.length > 0,
            aiRepliesGeneratedAt: suggestedReplies.length > 0 ? new Date().toISOString() : null,
            
            // General metadata
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
            type: taskData.type || 'tâche',
            
            // Email data (if any)
            emailId: taskData.emailId || null,
            emailFrom: taskData.emailFrom || null,
            emailFromName: taskData.emailFromName || null,
            emailSubject: taskData.emailSubject || null,
            emailContent: taskData.emailContent || '',
            emailHtmlContent: taskData.emailHtmlContent || '',
            hasEmail: !!(taskData.emailId || taskData.emailFrom || taskData.emailContent),
            emailReplied: false,
            emailDate: taskData.emailDate || taskData.createdAt,
            needsReply: taskData.needsReply || false,
            
            // Analysis data
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            insights: taskData.insights || this.generateBasicInsights(null, taskData),
            suggestedReplies: taskData.suggestedReplies || [],
            
            // General metadata
            tags: taskData.tags || [],
            client: taskData.client || 'Interne',
            createdAt: taskData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            method: taskData.method || 'manual'
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.emitTaskUpdate('create', task);
        return task;
    }

    // =====================================
    // TASK OPERATIONS
    // =====================================

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

    // =====================================
    // FILTERING AND SORTING
    // =====================================

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

    // =====================================
    // AI REPLY GENERATION
    // =====================================

    async generateIntelligentReplySuggestions(email, taskData) {
        if (!window.aiTaskAnalyzer) {
            console.warn('[TaskManager] AITaskAnalyzer not available');
            return this.generateBasicReplySuggestions(email, taskData);
        }

        try {
            const senderName = email.from?.emailAddress?.name || taskData.emailFromName || 'l\'expéditeur';
            const senderEmail = email.from?.emailAddress?.address || taskData.emailFrom || '';
            const subject = email.subject || taskData.emailSubject || 'votre message';
            const content = email.body?.content || email.bodyPreview || taskData.emailContent || '';
            const urgency = taskData.priority || 'medium';
            const hasActions = taskData.actions && taskData.actions.length > 0;
            const keyInfo = taskData.keyInfo || [];
            const risks = taskData.risks || [];

            const replyPrompt = `Tu es un assistant expert en communication professionnelle. Génère 3 suggestions de réponse personnalisées pour cet email.

CONTEXTE DE L'EMAIL:
Expéditeur: ${senderName} <${senderEmail}>
Sujet: ${subject}
Priorité détectée: ${urgency}
Actions requises: ${hasActions ? 'Oui' : 'Non'}

CONTENU DE L'EMAIL:
${content}

${keyInfo.length > 0 ? `INFORMATIONS CLÉS IDENTIFIÉES:\n${keyInfo.map(info => `• ${info}`).join('\n')}\n` : ''}

${risks.length > 0 ? `POINTS D'ATTENTION:\n${risks.map(risk => `• ${risk}`).join('\n')}\n` : ''}

INSTRUCTIONS:
1. Analyse le contexte, le ton et l'urgence de l'email
2. Génère 3 réponses différentes adaptées au contexte
3. Varie les tons: professionnel, urgent si nécessaire, et une version plus détaillée
4. Personalise avec le nom de l'expéditeur et les éléments spécifiques mentionnés
5. Inclus des éléments concrets de l'email original

FORMAT DE RÉPONSE JSON:
{
  "suggestions": [
    {
      "tone": "professionnel",
      "subject": "Re: [sujet original]",
      "content": "Réponse complète et personnalisée...",
      "description": "Réponse professionnelle standard"
    },
    {
      "tone": "urgent",
      "subject": "Re: [sujet] - Traitement prioritaire",
      "content": "Réponse adaptée à l'urgence...",
      "description": "Réponse pour traitement urgent"
    },
    {
      "tone": "détaillé",
      "subject": "Re: [sujet] - Réponse détaillée",
      "content": "Réponse complète avec tous les détails...",
      "description": "Réponse complète et détaillée"
    }
  ]
}`;

            const aiResponse = await this.callAIForReplySuggestions(replyPrompt);
            
            if (aiResponse && aiResponse.suggestions && Array.isArray(aiResponse.suggestions)) {
                console.log('[TaskManager] AI generated', aiResponse.suggestions.length, 'reply suggestions');
                return aiResponse.suggestions.map(suggestion => ({
                    tone: suggestion.tone || 'neutre',
                    subject: suggestion.subject || `Re: ${subject}`,
                    content: suggestion.content || '',
                    description: suggestion.description || '',
                    generatedBy: 'claude-ai',
                    generatedAt: new Date().toISOString()
                }));
            } else {
                console.warn('[TaskManager] Invalid AI response format');
                return this.generateBasicReplySuggestions(email, taskData);
            }

        } catch (error) {
            console.error('[TaskManager] Error generating AI reply suggestions:', error);
            return this.generateBasicReplySuggestions(email, taskData);
        }
    }

    async callAIForReplySuggestions(prompt) {
        if (!window.aiTaskAnalyzer) {
            throw new Error('AITaskAnalyzer not available');
        }

        try {
            if (window.aiTaskAnalyzer.apiKey) {
                console.log('[TaskManager] Using Claude API for reply suggestions');
                return await this.callClaudeAPI(prompt);
            } else {
                console.log('[TaskManager] No API key, using local generation');
                return this.generateBasicReplySuggestionsFromPrompt(prompt);
            }
        } catch (error) {
            console.error('[TaskManager] AI API call failed:', error);
            throw error;
        }
    }

    async callClaudeAPI(prompt) {
        const apiUrl = 'https://api.anthropic.com/v1/messages';
        const apiKey = window.aiTaskAnalyzer.apiKey;
        
        if (window.aiTaskAnalyzer.useLocalProxy && window.aiTaskAnalyzer.localProxyUrl) {
            try {
                const response = await fetch(window.aiTaskAnalyzer.localProxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        apiKey: apiKey,
                        model: 'claude-3-haiku-20240307',
                        max_tokens: 2048,
                        messages: [{
                            role: 'user',
                            content: prompt
                        }],
                        temperature: 0.7,
                        system: "Tu es un expert en communication professionnelle. Tu génères des réponses email personnalisées et adaptées au contexte. Réponds toujours en JSON valide avec des suggestions pratiques et utilisables."
                    })
                });

                if (!response.ok) {
                    throw new Error(`Local proxy error: ${response.status}`);
                }

                const data = await response.json();
                return this.parseClaudeReplyResponse(data);
                
            } catch (error) {
                console.warn('[TaskManager] Local proxy failed, trying CORS solutions:', error);
            }
        }

        for (const proxyUrl of window.aiTaskAnalyzer.corsProxies) {
            try {
                const targetUrl = encodeURIComponent(apiUrl);
                const response = await fetch(proxyUrl + targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-haiku-20240307',
                        max_tokens: 2048,
                        messages: [{
                            role: 'user',
                            content: prompt
                        }],
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    throw new Error(`CORS proxy error: ${response.status}`);
                }

                const data = await response.json();
                return this.parseClaudeReplyResponse(data);
                
            } catch (error) {
                console.warn(`[TaskManager] CORS proxy ${proxyUrl} failed:`, error);
            }
        }

        throw new Error('All Claude API methods failed');
    }

    parseClaudeReplyResponse(response) {
        try {
            let jsonContent;
            
            if (typeof response === 'object' && response.content) {
                if (Array.isArray(response.content)) {
                    jsonContent = response.content[0]?.text || '';
                } else {
                    jsonContent = response.content;
                }
            } else if (typeof response === 'string') {
                jsonContent = response;
            } else {
                jsonContent = JSON.stringify(response);
            }
            
            const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in Claude response');
            }
            
            const parsed = JSON.parse(jsonMatch[0]);
            
            if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
                throw new Error('Invalid suggestions format');
            }
            
            return parsed;
            
        } catch (error) {
            console.error('[TaskManager] Parse Claude reply error:', error);
            throw error;
        }
    }

    generateBasicReplySuggestions(email, taskData) {
        const senderName = email.from?.emailAddress?.name || taskData.emailFromName || 'l\'expéditeur';
        const subject = email.subject || taskData.emailSubject || 'votre message';
        const urgency = taskData.priority || 'medium';
        const hasActions = taskData.actions && taskData.actions.length > 0;

        const suggestions = [];

        suggestions.push({
            tone: 'professionnel',
            subject: `Re: ${subject}`,
            content: `Bonjour ${senderName},

Merci pour votre message concernant "${subject}".

J'ai bien pris connaissance de votre demande et je m'en occupe rapidement. Je vous tiendrai informé de l'avancement.

${hasActions ? 'Je traite les points que vous avez mentionnés et je vous reviens avec les éléments demandés.' : ''}

Cordialement,
[Votre nom]`,
            description: 'Réponse professionnelle standard',
            generatedBy: 'local-fallback',
            generatedAt: new Date().toISOString()
        });

        if (urgency === 'urgent' || urgency === 'high') {
            suggestions.push({
                tone: 'urgent',
                subject: `Re: ${subject} - Traitement prioritaire`,
                content: `Bonjour ${senderName},

Je viens de prendre connaissance de votre message urgent.

Je comprends l'importance de cette demande et je la traite en priorité absolue. Je vous reviens dans les meilleurs délais avec une réponse complète.

${hasActions ? 'Toutes les actions nécessaires sont en cours de traitement.' : ''}

Je reste à votre disposition pour toute information complémentaire.

Cordialement,
[Votre nom]`,
                description: 'Réponse pour traitement urgent',
                generatedBy: 'local-fallback',
                generatedAt: new Date().toISOString()
            });
        }

        suggestions.push({
            tone: 'détaillé',
            subject: `Re: ${subject} - Confirmation de réception`,
            content: `Bonjour ${senderName},

Je vous confirme la bonne réception de votre message du ${new Date().toLocaleDateString('fr-FR')}.

${hasActions ? 'J\'ai identifié les actions suivantes à mettre en œuvre et je vais les traiter dans l\'ordre de priorité :' : 'J\'étudie attentivement votre demande et je prépare une réponse appropriée.'}

${taskData.actions ? taskData.actions.map((action, idx) => `${idx + 1}. ${action.text}`).join('\n') : ''}

Je vous tiendrai informé de l'avancement et je vous recontacte rapidement avec les éléments demandés.

N'hésitez pas à me recontacter si vous avez des questions complémentaires.

Cordialement,
[Votre nom]`,
            description: 'Réponse complète et détaillée',
            generatedBy: 'local-fallback',
            generatedAt: new Date().toISOString()
        });

        console.log('[TaskManager] Generated', suggestions.length, 'basic reply suggestions');
        return suggestions;
    }

    // =====================================
    // EMAIL CONTENT EXTRACTION
    // =====================================

    extractFullEmailContent(email, taskData) {
        console.log('[TaskManager] Extracting full email content...');
        
        if (taskData.emailContent && taskData.emailContent.length > 50) {
            console.log('[TaskManager] Using email content from taskData');
            return taskData.emailContent;
        }
        
        if (email?.body?.content) {
            console.log('[TaskManager] Using email body content');
            return this.cleanEmailContent(email.body.content);
        }
        
        if (email?.body?.type === 'html' && email?.body?.content) {
            console.log('[TaskManager] Using HTML email content');
            return this.convertHtmlToText(email.body.content);
        }
        
        if (email?.bodyPreview && email.bodyPreview.length > 20) {
            console.log('[TaskManager] Using extended email preview');
            return this.buildExtendedPreview(email);
        }
        
        console.log('[TaskManager] Building minimal email content');
        return this.buildMinimalEmailContent(email, taskData);
    }

    extractHtmlEmailContent(email, taskData) {
        console.log('[TaskManager] Extracting HTML email content...');
        
        if (taskData.emailHtmlContent && taskData.emailHtmlContent.length > 50) {
            console.log('[TaskManager] Using HTML email content from taskData');
            return taskData.emailHtmlContent;
        }
        
        if (email?.body?.contentType === 'html' && email?.body?.content) {
            console.log('[TaskManager] Using email HTML body content');
            return this.cleanHtmlEmailContent(email.body.content);
        }
        
        if (email?.body?.content) {
            console.log('[TaskManager] Converting text to HTML');
            return this.convertTextToHtml(email.body.content, email);
        }
        
        const textContent = this.extractFullEmailContent(email, taskData);
        return this.convertTextToHtml(textContent, email);
    }

    cleanEmailContent(content) {
        if (!content) return '';
        
        const cleanContent = content
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
            
        return cleanContent.length > 100 ? cleanContent : '';
    }

    cleanHtmlEmailContent(htmlContent) {
        if (!htmlContent) return '';
        
        let cleanHtml = htmlContent
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/style="[^"]*"/gi, (match) => {
                const safeStyles = match.match(/(color|background|font-size|font-weight|text-align|margin|padding|border):[^;]*/gi);
                return safeStyles ? `style="${safeStyles.join(';')}"` : '';
            });
        
        return `<div class="email-content-viewer" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            ${cleanHtml}
        </div>`;
    }

    convertTextToHtml(textContent, email) {
        if (!textContent) return '';
        
        const senderName = email?.from?.emailAddress?.name || 'Expéditeur';
        const senderEmail = email?.from?.emailAddress?.address || '';
        const subject = email?.subject || 'Sans sujet';
        const date = email?.receivedDateTime ? new Date(email.receivedDateTime).toLocaleString('fr-FR') : '';
        
        const htmlContent = textContent
            .replace(/\n/g, '<br>')
            .replace(/Email de:([^\n]+)/g, '<strong>De:</strong>$1')
            .replace(/Date:([^\n]+)/g, '<strong>Date:</strong>$1')
            .replace(/Sujet:([^\n]+)/g, '<strong>Sujet:</strong>$1')
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

    convertHtmlToText(htmlContent) {
        if (!htmlContent) return '';
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
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
        
        let content = `Email de: ${senderName} <${senderEmail}>
Date: ${formattedDate}
Sujet: ${subject}

`;

        if (taskData.summary) {
            content += `${taskData.summary}\n\n`;
        }
        
        if (taskData.actions && taskData.actions.length > 0) {
            content += `Actions mentionnées dans l'email:\n`;
            taskData.actions.forEach((action, idx) => {
                content += `${idx + 1}. ${action.text}\n`;
            });
            content += '\n';
        }
        
        if (taskData.keyInfo && taskData.keyInfo.length > 0) {
            content += `Informations importantes:\n`;
            taskData.keyInfo.forEach(info => {
                content += `• ${info}\n`;
            });
            content += '\n';
        }
        
        content += `[Contenu complet de l'email non disponible - Résumé généré par IA]`;
        
        return content;
    }

    // =====================================
    // UTILITY METHODS
    // =====================================

    generateBasicInsights(email, taskData) {
        return {
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            opportunities: [],
            emailTone: 'neutre',
            responseExpected: taskData.needsReply || false,
            attachments: [],
            contacts: email?.from ? [`${email.from.emailAddress.name} <${email.from.emailAddress.address}>`] : [],
            links: []
        };
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
// ENHANCED TASKS VIEW WITH STRUCTURED DETAILS
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
        this.showAdvancedFilters = false;
        this.hideExplanation = localStorage.getItem('hideTasksExplanation') === 'true';
        this.bulkActionsVisible = false;
        
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
        const visibleTasks = this.getVisibleTasks();
        const allVisible = visibleTasks.length > 0 && visibleTasks.every(task => this.selectedTasks.has(task.id));
        
        container.innerHTML = `
            <div class="tasks-page-harmonized">
                <!-- Texte explicatif harmonisé -->
                ${!this.hideExplanation ? `
                    <div class="explanation-text-harmonized">
                        <i class="fas fa-info-circle"></i>
                        <span>Cliquez sur vos tâches pour les sélectionner, puis utilisez les boutons d'action pour effectuer des opérations groupées comme marquer comme terminé, changer la priorité, ou supprimer. Vous pouvez également filtrer par statut ci-dessous.</span>
                        <button class="explanation-close-btn" onclick="window.tasksView.hideExplanationMessage()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}

                <!-- Barre de recherche pleine largeur -->
                <div class="search-bar-full-width">
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

                <!-- Barre de contrôles harmonisée -->
                <div class="controls-bar-harmonized">
                    <!-- Modes de vue -->
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
                    
                    <!-- Section Actions harmonisée -->
                    <div class="actions-section-harmonized">
                        <!-- Bouton Actions centralisé -->
                        <button class="btn-actions-harmonized ${selectedCount > 0 ? 'active' : ''}" 
                                onclick="window.tasksView.toggleBulkActionsPanel()"
                                ${selectedCount === 0 ? 'disabled' : ''}>
                            <i class="fas fa-bolt"></i>
                            <span>Actions</span>
                            ${selectedCount > 0 ? `<span class="action-count-badge">${selectedCount}</span>` : ''}
                            <i class="fas fa-chevron-${this.bulkActionsVisible ? 'up' : 'down'} action-chevron"></i>
                        </button>
                        
                        <!-- Boutons standards harmonisés -->
                        <button class="btn-harmonized btn-select-toggle" 
                                onclick="window.tasksView.toggleAllSelection()"
                                title="${allVisible ? 'Désélectionner tout' : 'Sélectionner tout'}">
                            <i class="fas ${allVisible ? 'fa-square-check' : 'fa-square'}"></i>
                            <span>${allVisible ? 'Désélectionner' : 'Sélectionner'}</span>
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
                </div>

                <!-- Panneau d'actions groupées harmonisé -->
                <div class="bulk-actions-panel ${this.bulkActionsVisible && selectedCount > 0 ? 'show' : ''}" id="bulkActionsPanel">
                    <div class="bulk-actions-content">
                        <div class="bulk-actions-header">
                            <div class="selection-info">
                                <i class="fas fa-check-square"></i>
                                <span class="selection-text">${selectedCount} tâche${selectedCount > 1 ? 's' : ''} sélectionnée${selectedCount > 1 ? 's' : ''}</span>
                                <button class="clear-selection-btn" onclick="window.tasksView.clearSelection()">
                                    <i class="fas fa-times"></i>
                                    <span>Effacer</span>
                                </button>
                            </div>
                        </div>
                        
                        <div class="bulk-actions-grid">
                            <button class="bulk-action-btn complete" onclick="window.tasksView.bulkMarkCompleted()">
                                <i class="fas fa-check-circle"></i>
                                <span>Marquer terminé</span>
                                <small>${selectedCount} tâche${selectedCount > 1 ? 's' : ''}</small>
                            </button>
                            
                            <button class="bulk-action-btn priority" onclick="window.tasksView.bulkChangePriority()">
                                <i class="fas fa-flag"></i>
                                <span>Changer priorité</span>
                                <small>Modifier toutes</small>
                            </button>
                            
                            <button class="bulk-action-btn status" onclick="window.tasksView.bulkChangeStatus()">
                                <i class="fas fa-tasks"></i>
                                <span>Changer statut</span>
                                <small>En cours, terminé...</small>
                            </button>
                            
                            <button class="bulk-action-btn archive" onclick="window.tasksView.bulkArchive()">
                                <i class="fas fa-archive"></i>
                                <span>Archiver</span>
                                <small>Marquer comme archivé</small>
                            </button>
                            
                            <button class="bulk-action-btn export" onclick="window.tasksView.bulkExport()">
                                <i class="fas fa-download"></i>
                                <span>Exporter CSV</span>
                                <small>Télécharger sélection</small>
                            </button>
                            
                            <button class="bulk-action-btn delete" onclick="window.tasksView.bulkDelete()">
                                <i class="fas fa-trash"></i>
                                <span>Supprimer</span>
                                <small>Action irréversible</small>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Filtres de statut harmonisés -->
                <div class="status-filters-harmonized">
                    ${this.buildStatusPills(stats)}
                </div>
                
                <!-- Filtres avancés harmonisés -->
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

        this.addHarmonizedStyles();
        this.setupEventListeners();
        console.log('[TasksView] Interface harmonisée rendered successfully');
    }

    // =====================================
    // TASK DETAILS WITH TABBED INTERFACE
    // =====================================

    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        const uniqueId = 'task_details_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 1200px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;">Détails de la tâche</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Onglets de navigation -->
                    <div class="task-details-tabs">
                        <button class="task-tab-btn active" onclick="window.tasksView.switchTab('overview', '${uniqueId}')">
                            <i class="fas fa-info-circle"></i> Vue d'ensemble
                        </button>
                        ${task.hasEmail ? `
                            <button class="task-tab-btn" onclick="window.tasksView.switchTab('email', '${uniqueId}')">
                                <i class="fas fa-envelope"></i> Email
                            </button>
                        ` : ''}
                        ${task.suggestedReplies && task.suggestedReplies.length > 0 ? `
                            <button class="task-tab-btn" onclick="window.tasksView.switchTab('replies', '${uniqueId}')">
                                <i class="fas fa-reply-all"></i> Réponses suggérées
                                <span class="tab-count">${task.suggestedReplies.length}</span>
                            </button>
                        ` : ''}
                        ${task.aiAnalysis ? `
                            <button class="task-tab-btn" onclick="window.tasksView.switchTab('analysis', '${uniqueId}')">
                                <i class="fas fa-robot"></i> Analyse IA
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Contenu des onglets -->
                    <div style="padding: 20px; overflow-y: auto; flex: 1;">
                        <!-- Vue d'ensemble -->
                        <div id="tab-overview-${uniqueId}" class="task-tab-content active">
                            ${this.buildTaskOverviewTab(task)}
                        </div>
                        
                        <!-- Onglet Email -->
                        ${task.hasEmail ? `
                            <div id="tab-email-${uniqueId}" class="task-tab-content">
                                ${this.buildTaskEmailTab(task)}
                            </div>
                        ` : ''}
                        
                        <!-- Onglet Réponses suggérées -->
                        ${task.suggestedReplies && task.suggestedReplies.length > 0 ? `
                            <div id="tab-replies-${uniqueId}" class="task-tab-content">
                                ${this.buildTaskRepliesTab(task)}
                            </div>
                        ` : ''}
                        
                        <!-- Onglet Analyse IA -->
                        ${task.aiAnalysis ? `
                            <div id="tab-analysis-${uniqueId}" class="task-tab-content">
                                ${this.buildTaskAnalysisTab(task)}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px;">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                            Fermer
                        </button>
                        ${task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0 ? `
                            <button onclick="window.tasksView.showSuggestedReplies('${task.id}');"
                                    style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-reply"></i> Voir suggestions de réponse
                            </button>
                        ` : ''}
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

    // =====================================
    // TAB CONTENT BUILDERS
    // =====================================

    buildTaskOverviewTab(task) {
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusLabel = this.getStatusLabel(task.status);
        const dueDateInfo = this.formatDueDateSimple(task.dueDate);
        
        return `
            <div class="task-overview-content">
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
                            ${task.emailDate ? `
                                <div class="email-detail-item">
                                    <strong>Date de réception:</strong>
                                    <span>${new Date(task.emailDate).toLocaleString('fr-FR')}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${task.summary && task.summary !== task.title ? `
                    <div class="details-section">
                        <h3><i class="fas fa-align-left"></i> Résumé</h3>
                        <div class="summary-content">
                            ${this.formatSummary(task.summary)}
                        </div>
                    </div>
                ` : ''}

                ${task.description && task.description !== task.title ? `
                    <div class="details-section">
                        <h3><i class="fas fa-file-alt"></i> Description</h3>
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

                ${task.insights && (task.insights.opportunities?.length > 0 || task.insights.contacts?.length > 0 || task.insights.links?.length > 0) ? `
                    <div class="details-section insights-section">
                        <h3><i class="fas fa-lightbulb"></i> Insights Supplémentaires</h3>
                        ${task.insights.opportunities && task.insights.opportunities.length > 0 ? `
                            <div class="insights-subsection">
                                <h4>Opportunités</h4>
                                <div class="opportunities-list">
                                    ${task.insights.opportunities.map(opp => `
                                        <div class="opportunity-item">
                                            <i class="fas fa-star"></i>
                                            <span>${this.escapeHtml(opp)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${task.insights.contacts && task.insights.contacts.length > 0 ? `
                            <div class="insights-subsection">
                                <h4>Contacts</h4>
                                <div class="contacts-list">
                                    ${task.insights.contacts.map(contact => `
                                        <div class="contact-item">
                                            <i class="fas fa-user"></i>
                                            <span>${this.escapeHtml(contact)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${task.insights.links && task.insights.links.length > 0 ? `
                            <div class="insights-subsection">
                                <h4>Liens</h4>
                                <div class="links-list">
                                    ${task.insights.links.map(link => `
                                        <div class="link-item">
                                            <i class="fas fa-link"></i>
                                            <a href="${link}" target="_blank">${this.escapeHtml(link)}</a>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="details-section metadata-section">
                    <h3><i class="fas fa-cog"></i> Métadonnées</h3>
                    <div class="metadata-grid">
                        <div class="metadata-item">
                            <strong>Créé le:</strong>
                            <span>${new Date(task.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="metadata-item">
                            <strong>Modifié le:</strong>
                            <span>${new Date(task.updatedAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="metadata-item">
                            <strong>Méthode:</strong>
                            <span>${task.method === 'ai' ? '🤖 IA' : task.method === 'manual' ? '✋ Manuel' : task.method}</span>
                        </div>
                        ${task.client ? `
                            <div class="metadata-item">
                                <strong>Client/Projet:</strong>
                                <span>${this.escapeHtml(task.client)}</span>
                            </div>
                        ` : ''}
                        ${task.tags && task.tags.length > 0 ? `
                            <div class="metadata-item">
                                <strong>Tags:</strong>
                                <div class="tags-list">
                                    ${task.tags.map(tag => `<span class="tag-item">${this.escapeHtml(tag)}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    buildTaskEmailTab(task) {
        if (!task.hasEmail) return '<p>Aucun email associé à cette tâche.</p>';
        
        return `
            <div class="task-email-content">
                <div class="email-header-details">
                    <h3><i class="fas fa-envelope"></i> Email Original</h3>
                    <div class="email-metadata">
                        <div class="email-meta-item">
                            <strong>De:</strong> ${this.escapeHtml(task.emailFromName || 'Inconnu')} &lt;${this.escapeHtml(task.emailFrom || '')}&gt;
                        </div>
                        <div class="email-meta-item">
                            <strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject || 'Sans sujet')}
                        </div>
                        <div class="email-meta-item">
                            <strong>Date:</strong> ${task.emailDate ? new Date(task.emailDate).toLocaleString('fr-FR') : 'Date inconnue'}
                        </div>
                        ${task.hasAttachments ? `
                            <div class="email-meta-item">
                                <strong>Pièces jointes:</strong> <i class="fas fa-paperclip"></i> Oui
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${task.emailHtmlContent && task.emailContent ? `
                    <div class="email-content-tabs">
                        <button class="email-tab-btn active" onclick="window.tasksView.switchEmailTab('html', '${task.id}')">
                            <i class="fas fa-eye"></i> Vue formatée
                        </button>
                        <button class="email-tab-btn" onclick="window.tasksView.switchEmailTab('text', '${task.id}')">
                            <i class="fas fa-code"></i> Vue texte
                        </button>
                    </div>
                    <div class="email-content-box">
                        <div id="email-html-${task.id}" class="email-content-view active">
                            ${task.emailHtmlContent}
                        </div>
                        <div id="email-text-${task.id}" class="email-content-view" style="display: none;">
                            ${this.formatEmailContent(task.emailContent)}
                        </div>
                    </div>
                ` : task.emailContent ? `
                    <div class="email-content-box">
                        ${this.formatEmailContent(task.emailContent)}
                    </div>
                ` : `
                    <div class="email-unavailable">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Le contenu de l'email n'est pas disponible.</p>
                    </div>
                `}
            </div>
        `;
    }

    buildTaskRepliesTab(task) {
        if (!task.suggestedReplies || task.suggestedReplies.length === 0) {
            return '<p>Aucune suggestion de réponse disponible.</p>';
        }
        
        return `
            <div class="task-replies-content">
                <div class="replies-header">
                    <h3><i class="fas fa-reply-all"></i> Suggestions de Réponse</h3>
                    <p class="replies-description">
                        ${task.suggestedReplies.length} suggestion${task.suggestedReplies.length > 1 ? 's' : ''} de réponse 
                        ${task.aiRepliesGenerated ? 'générée' + (task.suggestedReplies.length > 1 ? 's' : '') + ' par IA' : 'disponible' + (task.suggestedReplies.length > 1 ? 's' : '')}
                        ${task.aiRepliesGeneratedAt ? ` le ${new Date(task.aiRepliesGeneratedAt).toLocaleString('fr-FR')}` : ''}
                    </p>
                </div>
                
                <div class="replies-list">
                    ${task.suggestedReplies.map((reply, idx) => `
                        <div class="reply-suggestion-card-detailed">
                            <div class="reply-card-header-detailed">
                                <div class="reply-info">
                                    <div class="reply-tone-badge ${reply.tone}">
                                        ${this.getReplyToneIcon(reply.tone)} ${this.getReplyToneLabel(reply.tone)}
                                    </div>
                                    ${reply.description ? `
                                        <div class="reply-description">${this.escapeHtml(reply.description)}</div>
                                    ` : ''}
                                </div>
                                <div class="reply-actions">
                                    <button class="btn-sm btn-secondary" onclick="window.tasksView.copyReplyToClipboard(${idx}, '${task.id}')">
                                        <i class="fas fa-copy"></i> Copier
                                    </button>
                                    <button class="btn-sm btn-primary" onclick="window.tasksView.useReply('${task.id}', ${idx})">
                                        <i class="fas fa-paper-plane"></i> Utiliser
                                    </button>
                                </div>
                            </div>
                            
                            <div class="reply-subject-line">
                                <strong>Sujet:</strong> ${this.escapeHtml(reply.subject)}
                            </div>
                            
                            <div class="reply-content-full">
                                <pre class="reply-text">${this.escapeHtml(reply.content)}</pre>
                            </div>
                            
                            ${reply.generatedBy ? `
                                <div class="reply-metadata">
                                    <small>
                                        <i class="fas fa-info-circle"></i>
                                        Généré par: ${reply.generatedBy === 'claude-ai' ? '🤖 Claude AI' : reply.generatedBy}
                                        ${reply.generatedAt ? ` • ${new Date(reply.generatedAt).toLocaleString('fr-FR')}` : ''}
                                    </small>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div class="replies-footer">
                    <div class="replies-actions">
                        <button class="btn-harmonized btn-secondary" onclick="window.tasksView.regenerateReplies('${task.id}')">
                            <i class="fas fa-redo"></i> Régénérer les suggestions
                        </button>
                        ${task.hasEmail && task.emailFrom ? `
                            <button class="btn-harmonized btn-primary" onclick="window.tasksView.composeCustomReply('${task.id}')">
                                <i class="fas fa-edit"></i> Composer une réponse personnalisée
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    buildTaskAnalysisTab(task) {
        if (!task.aiAnalysis) {
            return '<p>Aucune analyse IA disponible pour cette tâche.</p>';
        }
        
        const analysis = task.aiAnalysis;
        
        return `
            <div class="task-analysis-content">
                <div class="analysis-header">
                    <h3><i class="fas fa-robot"></i> Analyse IA</h3>
                    <div class="analysis-metadata">
                        <span class="analysis-confidence">
                            <i class="fas fa-chart-bar"></i>
                            Confiance: ${Math.round((analysis.confidence || 0.7) * 100)}%
                        </span>
                        <span class="analysis-method">
                            <i class="fas fa-cog"></i>
                            Méthode: ${analysis.method || 'ai-enhanced'}
                        </span>
                        ${analysis.importance ? `
                            <span class="analysis-importance importance-${analysis.importance}">
                                <i class="fas fa-flag"></i>
                                Importance: ${this.getImportanceLabel(analysis.importance)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                ${analysis.summary ? `
                    <div class="analysis-section">
                        <h4><i class="fas fa-file-alt"></i> Résumé de l'analyse</h4>
                        <div class="analysis-summary">
                            ${this.escapeHtml(analysis.summary)}
                        </div>
                    </div>
                ` : ''}
                
                ${task.insights ? `
                    <div class="analysis-section">
                        <h4><i class="fas fa-lightbulb"></i> Insights détectés</h4>
                        <div class="insights-analysis-grid">
                            ${task.insights.emailTone ? `
                                <div class="insight-item">
                                    <strong>Ton de l'email:</strong>
                                    <span class="tone-badge tone-${task.insights.emailTone}">
                                        ${this.getToneIcon(task.insights.emailTone)} ${this.getToneLabel(task.insights.emailTone)}
                                    </span>
                                </div>
                            ` : ''}
                            <div class="insight-item">
                                <strong>Réponse attendue:</strong>
                                <span class="response-expected ${task.insights.responseExpected ? 'yes' : 'no'}">
                                    <i class="fas fa-${task.insights.responseExpected ? 'check' : 'times'}-circle"></i>
                                    ${task.insights.responseExpected ? 'Oui' : 'Non'}
                                </span>
                            </div>
                            ${task.insights.attachments && task.insights.attachments.length > 0 ? `
                                <div class="insight-item">
                                    <strong>Pièces jointes détectées:</strong>
                                    <span>${task.insights.attachments.join(', ')}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                ${analysis.actionsHighlighted && analysis.actionsHighlighted.length > 0 ? `
                    <div class="analysis-section">
                        <h4><i class="fas fa-bullseye"></i> Actions mises en évidence</h4>
                        <div class="highlighted-actions">
                            ${analysis.actionsHighlighted.map((action, idx) => `
                                <div class="highlighted-action-item">
                                    <div class="action-header">
                                        <span class="action-priority priority-${action.priority || 'medium'}">
                                            ${this.getPriorityIcon(action.priority || 'medium')}
                                        </span>
                                        <span class="action-text">${this.escapeHtml(action.action)}</span>
                                        ${action.deadline ? `
                                            <span class="action-deadline">⏰ ${this.formatDeadline(action.deadline)}</span>
                                        ` : ''}
                                    </div>
                                    <div class="action-location">
                                        <i class="fas fa-map-marker-alt"></i>
                                        ${this.escapeHtml(action.location)}
                                    </div>
                                    ${action.excerpt ? `
                                        <div class="action-excerpt">
                                            <em>"${this.escapeHtml(action.excerpt)}"</em>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${analysis.subtasks && analysis.subtasks.length > 0 ? `
                    <div class="analysis-section">
                        <h4><i class="fas fa-list-ul"></i> Sous-tâches suggérées</h4>
                        <div class="suggested-subtasks">
                            ${analysis.subtasks.map((subtask, idx) => `
                                <div class="subtask-item">
                                    <span class="subtask-priority priority-${subtask.priority || 'medium'}">
                                        ${this.getPriorityIcon(subtask.priority || 'medium')}
                                    </span>
                                    <span class="subtask-title">${this.escapeHtml(subtask.title)}</span>
                                    <button class="btn-xs btn-primary" onclick="window.tasksView.createSubtask('${task.id}', ${idx})">
                                        <i class="fas fa-plus"></i> Créer
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="analysis-footer">
                    <div class="analysis-actions">
                        <button class="btn-harmonized btn-secondary" onclick="window.tasksView.reanalyzeTask('${task.id}')">
                            <i class="fas fa-refresh"></i> Relancer l'analyse
                        </button>
                        <button class="btn-harmonized btn-primary" onclick="window.tasksView.exportAnalysis('${task.id}')">
                            <i class="fas fa-download"></i> Exporter l'analyse
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // =====================================
    // TAB SWITCHING FUNCTIONALITY
    // =====================================

    switchTab(tabName, modalId) {
        // Remove active class from all tabs and content
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.querySelectorAll('.task-tab-btn').forEach(btn => btn.classList.remove('active'));
        modal.querySelectorAll('.task-tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        const tabBtn = modal.querySelector(`[onclick*="'${tabName}'"]`);
        const tabContent = modal.querySelector(`#tab-${tabName}-${modalId}`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
    }

    switchEmailTab(tabType, taskId) {
        const tabs = document.querySelectorAll('.email-tab-btn');
        tabs.forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        
        const htmlView = document.getElementById(`email-html-${taskId}`);
        const textView = document.getElementById(`email-text-${taskId}`);
        
        if (tabType === 'html') {
            htmlView.style.display = 'block';
            htmlView.classList.add('active');
            textView.style.display = 'none';
            textView.classList.remove('active');
        } else {
            htmlView.style.display = 'none';
            htmlView.classList.remove('active');
            textView.style.display = 'block';
            textView.classList.add('active');
        }
    }

    // =====================================
    // CONTINUATION OF EXISTING METHODS...
    // =====================================

    // Selection methods
    toggleBulkActionsPanel() {
        this.bulkActionsVisible = !this.bulkActionsVisible;
        
        const panel = document.getElementById('bulkActionsPanel');
        const button = document.querySelector('.btn-actions-harmonized');
        const chevron = button?.querySelector('.action-chevron');
        
        if (panel) {
            panel.classList.toggle('show', this.bulkActionsVisible && this.selectedTasks.size > 0);
        }
        
        if (chevron) {
            chevron.classList.toggle('fa-chevron-down', !this.bulkActionsVisible);
            chevron.classList.toggle('fa-chevron-up', this.bulkActionsVisible);
        }
        
        if (button) {
            button.classList.toggle('expanded', this.bulkActionsVisible);
        }
    }
    
    hideExplanationMessage() {
        this.hideExplanation = true;
        localStorage.setItem('hideTasksExplanation', 'true');
        this.refreshTasksView();
    }
    
    toggleAllSelection() {
        const visibleTasks = this.getVisibleTasks();
        const allSelected = visibleTasks.length > 0 && visibleTasks.every(task => this.selectedTasks.has(task.id));
        
        if (allSelected) {
            visibleTasks.forEach(task => {
                this.selectedTasks.delete(task.id);
            });
            this.showToast('Tâches désélectionnées', 'info');
        } else {
            visibleTasks.forEach(task => {
                this.selectedTasks.add(task.id);
            });
            this.showToast(`${visibleTasks.length} tâches sélectionnées`, 'success');
        }
        
        this.refreshTasksView();
    }

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.refreshTasksView();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.bulkActionsVisible = false;
        this.refreshTasksView();
        this.showToast('Sélection effacée', 'info');
    }

    refreshTasksView() {
        const tasksContainer = document.querySelector('.tasks-container-harmonized');
        if (tasksContainer) {
            tasksContainer.innerHTML = this.renderTasksList();
        }
        this.updateControlsBar();
    }

    updateControlsBar() {
        const container = document.getElementById('tasksContainer')?.parentElement;
        if (container) {
            const searchInput = document.getElementById('taskSearchInput');
            const currentSearchValue = searchInput ? searchInput.value : this.currentFilters.search;
            
            this.render(container);
            
            setTimeout(() => {
                const newSearchInput = document.getElementById('taskSearchInput');
                if (newSearchInput && currentSearchValue) {
                    newSearchInput.value = currentSearchValue;
                }
            }, 100);
        }
    }

    getVisibleTasks() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        return filteredTasks;
    }

    // Bulk actions
    async bulkMarkCompleted() {
        const selectedTasks = Array.from(this.selectedTasks);
        if (selectedTasks.length === 0) return;
        
        selectedTasks.forEach(taskId => {
            window.taskManager.updateTask(taskId, { status: 'completed' });
        });
        
        this.showToast(`${selectedTasks.length} tâche(s) marquée(s) comme terminée(s)`, 'success');
        this.clearSelection();
        this.refreshView();
    }

    async bulkChangePriority() {
        const selectedTasks = Array.from(this.selectedTasks);
        if (selectedTasks.length === 0) return;
        
        const priority = prompt('Nouvelle priorité:\n1. 🚨 Urgente\n2. ⚡ Haute\n3. 📌 Normale\n4. 📄 Basse\n\nEntrez le numéro:');
        const priorities = ['', 'urgent', 'high', 'medium', 'low'];
        
        if (priority && priorities[parseInt(priority)]) {
            const newPriority = priorities[parseInt(priority)];
            selectedTasks.forEach(taskId => {
                window.taskManager.updateTask(taskId, { priority: newPriority });
            });
            this.showToast(`Priorité mise à jour pour ${selectedTasks.length} tâche(s)`, 'success');
            this.clearSelection();
            this.refreshView();
        }
    }

    async bulkChangeStatus() {
        const selectedTasks = Array.from(this.selectedTasks);
        if (selectedTasks.length === 0) return;
        
        const status = prompt('Nouveau statut:\n1. ⏳ À faire\n2. 🔄 En cours\n3. ✅ Terminé\n\nEntrez le numéro:');
        const statuses = ['', 'todo', 'in-progress', 'completed'];
        
        if (status && statuses[parseInt(status)]) {
            const newStatus = statuses[parseInt(status)];
            selectedTasks.forEach(taskId => {
                window.taskManager.updateTask(taskId, { status: newStatus });
            });
            this.showToast(`Statut mis à jour pour ${selectedTasks.length} tâche(s)`, 'success');
            this.clearSelection();
            this.refreshView();
        }
    }

    async bulkArchive() {
        const selectedTasks = Array.from(this.selectedTasks);
        if (selectedTasks.length === 0) return;
        
        if (confirm(`Archiver ${selectedTasks.length} tâche(s) ?`)) {
            selectedTasks.forEach(taskId => {
                window.taskManager.updateTask(taskId, { archived: true, status: 'completed' });
            });
            this.showToast(`${selectedTasks.length} tâche(s) archivée(s)`, 'success');
            this.clearSelection();
            this.refreshView();
        }
    }

    async bulkDelete() {
        const selectedTasks = Array.from(this.selectedTasks);
        if (selectedTasks.length === 0) return;
        
        if (confirm(`Supprimer définitivement ${selectedTasks.length} tâche(s) ?\n\nCette action est irréversible.`)) {
            selectedTasks.forEach(taskId => {
                window.taskManager.deleteTask(taskId);
            });
            this.showToast(`${selectedTasks.length} tâche(s) supprimée(s)`, 'success');
            this.clearSelection();
            this.refreshView();
        }
    }

    async bulkExport() {
        const selectedTasks = Array.from(this.selectedTasks);
        if (selectedTasks.length === 0) return;
        
        const tasks = selectedTasks.map(id => window.taskManager.getTask(id)).filter(Boolean);
        
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

    // Rendering methods
    buildStatusPills(stats) {
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

        switch (this.currentViewMode) {
            case 'flat':
                return this.renderFlatView(filteredTasks);
            case 'grouped-domain':
            case 'grouped-sender':
                return this.renderGroupedView(filteredTasks, this.currentViewMode);
            default:
                return this.renderFlatView(filteredTasks);
        }
    }

    renderFlatView(tasks) {
        return `
            <div class="tasks-list-harmonized">
                ${tasks.map(task => this.renderTaskItem(task)).join('')}
            </div>
        `;
    }

    renderTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        
        const recipient = task.hasEmail ? 
            (task.emailFromName || this.extractNameFromEmail(task.emailFrom) || 'Email inconnu') :
            (task.client !== 'Interne' ? task.client : task.type || 'Tâche');
            
        const taskTypeDisplay = this.getTaskTypeDisplay(task);
        const dueDateDisplay = this.formatDueDateSimple(task.dueDate);
        const priorityColor = this.getPriorityColor(task.priority);
        
        return `
            <div class="task-card-harmonized ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-bar-harmonized" style="background-color: ${priorityColor}"></div>
                
                <div class="task-main-content-harmonized">
                    <div class="task-header-harmonized">
                        <h3 class="task-title-harmonized">${this.escapeHtml(task.title)}</h3>
                        <div class="task-meta-harmonized">
                            <span class="task-type-badge-harmonized">${taskTypeDisplay.icon} ${taskTypeDisplay.label}</span>
                            ${dueDateDisplay.html}
                        </div>
                    </div>
                    
                    <div class="task-recipient-harmonized">
                        <i class="fas ${task.hasEmail ? 'fa-envelope' : 'fa-user'}"></i>
                        <span class="recipient-name-harmonized">${this.escapeHtml(recipient)}</span>
                        ${task.hasEmail && task.needsReply ? '<span class="reply-indicator-harmonized">• Réponse requise</span>' : ''}
                    </div>
                </div>
                
                <div class="task-actions-harmonized">
                    ${this.renderTaskActions(task)}
                </div>
            </div>
        `;
    }

    renderTaskActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-harmonized complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        if (task.hasEmail && !task.emailReplied && task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-harmonized reply" 
                        onclick="event.stopPropagation(); window.tasksView.replyToEmailWithAI('${task.id}')"
                        title="Répondre à l'email">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-harmonized details" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // Continue with remaining methods and CSS styles...
    // ... (rest of the existing methods remain the same)

    // Utility methods for formatting
    formatSummary(summary) {
        if (!summary) return '';
        return `<div class="summary-content">${this.escapeHtml(summary).replace(/\n/g, '<br>')}</div>`;
    }

    getImportanceLabel(importance) {
        const labels = { urgent: 'Urgente', high: 'Haute', medium: 'Normale', low: 'Basse' };
        return labels[importance] || 'Normale';
    }

    getToneIcon(tone) {
        const icons = { formel: '👔', informel: '😊', urgent: '🚨', neutre: '📝', amical: '🤝' };
        return icons[tone] || '📝';
    }

    getToneLabel(tone) {
        const labels = { formel: 'Formel', informel: 'Informel', urgent: 'Urgent', neutre: 'Neutre', amical: 'Amical' };
        return labels[tone] || 'Neutre';
    }

    // Continue with rest of existing methods...
    // ... (all other existing methods remain the same)

    addHarmonizedStyles() {
        if (document.getElementById('harmonizedTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'harmonizedTaskStyles';
        styles.textContent = `
            /* Variables CSS harmonisées */
            :root {
                --btn-height: 36px;
                --btn-padding: 0 12px;
                --btn-font-size: 13px;
                --btn-border-radius: 8px;
                --btn-font-weight: 600;
                --btn-gap: 6px;
                
                --input-height: 44px;
                --input-padding: 12px 16px;
                --input-font-size: 13px;
                
                --gap-xs: 4px;
                --gap-sm: 8px;
                --gap-md: 12px;
                --gap-lg: 16px;
                
                --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
                --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
                
                --transition: all 0.2s ease;
            }

            /* Interface principale */
            .tasks-page-harmonized {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: var(--gap-lg);
                font-size: var(--btn-font-size);
            }

            /* STYLES POUR LES ONGLETS */
            .task-details-tabs {
                display: flex;
                background: #f8fafc;
                border-bottom: 1px solid #e5e7eb;
                padding: 0;
                margin: 0;
                overflow-x: auto;
            }

            .task-tab-btn {
                background: none;
                border: none;
                padding: 16px 20px;
                font-size: 14px;
                font-weight: 600;
                color: #6b7280;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                white-space: nowrap;
                position: relative;
            }

            .task-tab-btn:hover {
                color: #374151;
                background: rgba(59, 130, 246, 0.05);
            }

            .task-tab-btn.active {
                color: #3b82f6;
                border-bottom-color: #3b82f6;
                background: rgba(59, 130, 246, 0.1);
            }

            .tab-count {
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 16px;
                text-align: center;
            }

            .task-tab-content {
                display: none;
            }

            .task-tab-content.active {
                display: block;
            }

            /* STYLES POUR LES SOUS-ONGLETS EMAIL */
            .email-content-tabs {
                display: flex;
                background: #f1f5f9;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 4px;
                margin-bottom: 16px;
                gap: 4px;
            }

            .email-tab-btn {
                background: none;
                border: none;
                padding: 8px 12px;
                font-size: 12px;
                font-weight: 600;
                color: #64748b;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                flex: 1;
                justify-content: center;
            }

            .email-tab-btn:hover {
                color: #475569;
                background: rgba(255, 255, 255, 0.5);
            }

            .email-tab-btn.active {
                color: #1e293b;
                background: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .email-content-view {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                max-height: 400px;
                overflow-y: auto;
                line-height: 1.6;
            }

            /* STYLES POUR LE CONTENU DES ONGLETS */
            .task-overview-content,
            .task-email-content,
            .task-replies-content,
            .task-analysis-content {
                max-height: 60vh;
                overflow-y: auto;
                padding-right: 8px;
            }

            .details-section {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }

            .details-section h3 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .details-section h3 i {
                color: #6366f1;
                font-size: 18px;
            }

            .details-header {
                margin-bottom: 24px;
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
                gap: 8px;
                flex-wrap: wrap;
            }

            .priority-badge,
            .status-badge {
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .priority-badge.priority-urgent {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }

            .priority-badge.priority-high {
                background: #fff7ed;
                color: #ea580c;
                border: 1px solid #fed7aa;
            }

            .priority-badge.priority-medium {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #dbeafe;
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
                background: #dbeafe;
                color: #2563eb;
                border: 1px solid #93c5fd;
            }

            .status-badge.status-completed {
                background: #dcfce7;
                color: #16a34a;
                border: 1px solid #86efac;
            }

            /* EMAIL DETAILS */
            .email-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 12px;
            }

            .email-detail-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 0;
                border-bottom: 1px solid #f3f4f6;
            }

            .email-detail-item strong {
                min-width: 100px;
                color: #374151;
                font-weight: 600;
            }

            .email-detail-item span {
                color: #6b7280;
                font-family: monospace;
                font-size: 13px;
            }

            /* ACTIONS LIST */
            .actions-list-details {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .action-item-details {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .action-item-details:hover {
                background: #f1f5f9;
                border-color: #d1d5db;
            }

            .action-number {
                background: #3b82f6;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 700;
                flex-shrink: 0;
            }

            .action-text {
                flex: 1;
                color: #374151;
                font-weight: 500;
            }

            .action-deadline {
                background: #fef3c7;
                color: #d97706;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
            }

            /* INFO GRID */
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 8px;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #f0f9ff;
                border: 1px solid #e0f2fe;
                border-radius: 6px;
                color: #0369a1;
                font-size: 13px;
            }

            .info-item i {
                color: #0ea5e9;
                font-size: 12px;
            }

            /* ATTENTION SECTION */
            .attention-section {
                border-left: 4px solid #f59e0b;
                background: #fffbeb;
            }

            .attention-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .attention-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #fef3c7;
                border: 1px solid #fde68a;
                border-radius: 6px;
                color: #92400e;
                font-weight: 500;
            }

            .attention-item i {
                color: #f59e0b;
            }

            /* REPLIES SECTION */
            .reply-suggestion-card-detailed {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                transition: all 0.2s ease;
            }

            .reply-suggestion-card-detailed:hover {
                border-color: #d1d5db;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .reply-card-header-detailed {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
                gap: 16px;
            }

            .reply-info {
                flex: 1;
            }

            .reply-tone-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 4px;
            }

            .reply-tone-badge.formel {
                background: #f3f4f6;
                color: #374151;
            }

            .reply-tone-badge.urgent {
                background: #fef2f2;
                color: #dc2626;
            }

            .reply-tone-badge.neutre {
                background: #f0f9ff;
                color: #0369a1;
            }

            .reply-description {
                color: #6b7280;
                font-size: 12px;
                font-style: italic;
            }

            .reply-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .btn-sm {
                padding: 6px 12px;
                font-size: 12px;
                border-radius: 6px;
                border: 1px solid;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 4px;
                font-weight: 600;
            }

            .btn-sm.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }

            .btn-sm.btn-secondary:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
            }

            .btn-sm.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-sm.btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
            }

            .reply-subject-line {
                margin-bottom: 12px;
                padding: 8px 12px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 13px;
            }

            .reply-content-full {
                margin-bottom: 12px;
            }

            .reply-text {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
                white-space: pre-wrap;
                margin: 0;
                max-height: 200px;
                overflow-y: auto;
            }

            .reply-metadata {
                padding-top: 8px;
                border-top: 1px solid #f3f4f6;
                color: #9ca3af;
                font-size: 11px;
            }

            /* ANALYSIS SECTION */
            .analysis-header {
                margin-bottom: 20px;
            }

            .analysis-metadata {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                margin-top: 8px;
            }

            .analysis-confidence,
            .analysis-method,
            .analysis-importance {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                color: #475569;
            }

            .analysis-importance.importance-urgent {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
            }

            .analysis-importance.importance-high {
                background: #fff7ed;
                color: #ea580c;
                border-color: #fed7aa;
            }

            .analysis-summary {
                background: #f0f9ff;
                border: 1px solid #e0f2fe;
                border-radius: 8px;
                padding: 16px;
                color: #0c4a6e;
                font-style: italic;
                line-height: 1.6;
            }

            .insights-analysis-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }

            .insight-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 13px;
            }

            .tone-badge {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
            }

            .tone-badge.tone-formel {
                background: #f3f4f6;
                color: #374151;
            }

            .tone-badge.tone-urgent {
                background: #fef2f2;
                color: #dc2626;
            }

            .tone-badge.tone-amical {
                background: #f0fdf4;
                color: #16a34a;
            }

            .response-expected {
                display: flex;
                align-items: center;
                gap: 4px;
                font-weight: 600;
            }

            .response-expected.yes {
                color: #16a34a;
            }

            .response-expected.no {
                color: #dc2626;
            }

            .highlighted-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .highlighted-action-item {
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 8px;
                padding: 16px;
            }

            .action-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                flex-wrap: wrap;
            }

            .action-priority {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: white;
                flex-shrink: 0;
            }

            .action-priority.priority-urgent {
                background: #dc2626;
            }

            .action-priority.priority-high {
                background: #ea580c;
            }

            .action-priority.priority-medium {
                background: #2563eb;
            }

            .action-priority.priority-low {
                background: #16a34a;
            }

            .action-location {
                color: #6b7280;
                font-size: 12px;
                margin-bottom: 4px;
            }

            .action-excerpt {
                color: #92400e;
                font-size: 13px;
                background: #fef3c7;
                padding: 8px;
                border-radius: 4px;
                border-left: 3px solid #f59e0b;
            }

            .suggested-subtasks {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .subtask-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            .subtask-item:hover {
                background: #f1f5f9;
                border-color: #d1d5db;
            }

            .subtask-priority {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                color: white;
                flex-shrink: 0;
            }

            .subtask-title {
                flex: 1;
                color: #374151;
                font-weight: 500;
            }

            .btn-xs {
                padding: 4px 8px;
                font-size: 11px;
                border-radius: 4px;
                border: 1px solid;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 3px;
                font-weight: 600;
            }

            .btn-xs.btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-xs.btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
            }

            /* METADATA SECTION */
            .metadata-section {
                background: #f9fafb;
                border-color: #e5e7eb;
            }

            .metadata-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .metadata-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: 8px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
            }

            .metadata-item strong {
                color: #374151;
                font-size: 12px;
                font-weight: 600;
            }

            .metadata-item span {
                color: #6b7280;
                font-size: 13px;
            }

            .tags-list {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-top: 4px;
            }

            .tag-item {
                background: #e0e7ff;
                color: #3730a3;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
            }

            /* INSIGHTS SUBSECTIONS */
            .insights-section {
                background: #f0f9ff;
                border-color: #e0f2fe;
            }

            .insights-subsection {
                margin-bottom: 16px;
            }

            .insights-subsection:last-child {
                margin-bottom: 0;
            }

            .insights-subsection h4 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: #0c4a6e;
            }

            .opportunities-list,
            .contacts-list,
            .links-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .opportunity-item,
            .contact-item,
            .link-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 8px;
                background: white;
                border: 1px solid #bae6fd;
                border-radius: 4px;
                font-size: 12px;
            }

            .opportunity-item i {
                color: #f59e0b;
            }

            .contact-item i {
                color: #3b82f6;
            }

            .link-item i {
                color: #6366f1;
            }

            .link-item a {
                color: #3b82f6;
                text-decoration: none;
                font-weight: 500;
            }

            .link-item a:hover {
                text-decoration: underline;
            }

            /* EMAIL CONTENT SECTION */
            .email-header-details {
                margin-bottom: 16px;
            }

            .email-metadata {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 8px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                margin-top: 12px;
            }

            .email-meta-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
            }

            .email-meta-item strong {
                min-width: 80px;
                color: #374151;
                font-weight: 600;
            }

            .email-content-box {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
            }

            .email-unavailable {
                text-align: center;
                padding: 40px 20px;
                color: #6b7280;
            }

            .email-unavailable i {
                font-size: 24px;
                color: #d1d5db;
                margin-bottom: 8px;
            }

            /* FOOTER ACTIONS */
            .replies-footer,
            .analysis-footer {
                margin-top: 20px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
            }

            .replies-actions,
            .analysis-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                flex-wrap: wrap;
            }

            /* Continuer avec les styles harmonisés existants */
            .explanation-text-harmonized {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: var(--btn-border-radius);
                padding: var(--gap-md);
                margin-bottom: var(--gap-md);
                display: flex;
                align-items: center;
                gap: var(--gap-md);
                color: #1e40af;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.5;
                position: relative;
            }

            .explanation-text-harmonized i {
                font-size: 16px;
                color: #3b82f6;
                flex-shrink: 0;
            }
            
            .explanation-close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                color: #3b82f6;
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
            
            .explanation-close-btn:hover {
                background: rgba(59, 130, 246, 0.2);
                transform: scale(1.1);
            }

            /* Barre de recherche pleine largeur */
            .search-bar-full-width {
                width: 100%;
                margin-bottom: var(--gap-md);
                height: var(--input-height);
            }
            
            .search-box-harmonized {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
            }
            
            .search-input-harmonized {
                width: 100%;
                height: var(--input-height);
                padding: 0 var(--gap-md) 0 44px;
                border: 1px solid #d1d5db;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                transition: var(--transition);
                box-sizing: border-box;
                outline: none;
                box-shadow: var(--shadow-sm);
            }
            
            .search-input-harmonized:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-icon-harmonized {
                position: absolute;
                left: var(--gap-md);
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                font-size: var(--btn-font-size);
                pointer-events: none;
            }
            
            .search-clear-harmonized {
                position: absolute;
                right: var(--gap-sm);
                top: 50%;
                transform: translateY(-50%);
                background: #ef4444;
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
                font-weight: 700;
                transition: var(--transition);
            }
            
            .search-clear-harmonized:hover {
                background: #dc2626;
                transform: translateY(-50%) scale(1.1);
            }

            /* Barre de contrôles harmonisée */
            .controls-bar-harmonized {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--gap-lg);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--btn-border-radius);
                padding: var(--gap-sm);
                margin-bottom: var(--gap-md);
                box-shadow: var(--shadow-sm);
                min-height: calc(var(--btn-height) + var(--gap-sm) * 2);
            }

            /* Modes de vue harmonisés */
            .view-modes-harmonized {
                display: flex;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: 2px;
                gap: 1px;
                height: var(--btn-height);
            }
            
            .view-mode-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                padding: var(--btn-padding);
                height: calc(var(--btn-height) - 4px);
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: var(--transition);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                white-space: nowrap;
                min-width: 90px;
                flex: 1;
            }
            
            .view-mode-harmonized:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
                transform: translateY(-1px);
            }
            
            .view-mode-harmonized.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-sm);
                font-weight: 700;
                transform: translateY(-1px);
            }

            /* Section Actions harmonisée */
            .actions-section-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-sm);
                height: var(--btn-height);
                flex-shrink: 0;
            }

            /* Bouton Actions harmonisé */
            .btn-actions-harmonized {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                padding: var(--btn-padding);
                height: var(--btn-height);
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: white;
                border: none;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
                min-width: 100px;
            }
            
            .btn-actions-harmonized:disabled {
                background: #e5e7eb;
                color: #9ca3af;
                cursor: not-allowed;
                box-shadow: none;
                opacity: 0.6;
            }
            
            .btn-actions-harmonized:not(:disabled):hover {
                background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
            }
            
            .btn-actions-harmonized.active {
                background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
                box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
                transform: translateY(-1px);
            }
            
            .action-count-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: white;
                font-size: 9px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 8px;
                min-width: 16px;
                text-align: center;
                border: 2px solid white;
                line-height: 1;
                animation: pulse 2s infinite;
            }
            
            .action-chevron {
                margin-left: 2px;
                font-size: 9px;
                transition: all 0.3s ease;
            }

            /* Boutons standards harmonisés */
            .btn-harmonized {
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                padding: var(--btn-padding);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                cursor: pointer;
                transition: var(--transition);
                white-space: nowrap;
                box-shadow: var(--shadow-sm);
                gap: var(--btn-gap);
                height: var(--btn-height);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-harmonized:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-md);
            }
            
            .btn-harmonized.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            }
            
            .btn-harmonized.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }
            
            .btn-harmonized.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-harmonized.btn-secondary:hover {
                background: #f1f5f9;
                color: #334155;
                border-color: #cbd5e1;
            }
            
            .btn-harmonized.btn-select-toggle {
                background: #f0f9ff;
                color: #0369a1;
                border-color: #0ea5e9;
            }
            
            .btn-harmonized.btn-select-toggle:hover {
                background: #e0f2fe;
                color: #0c4a6e;
                border-color: #0284c7;
            }

            /* Autres styles existants... */
            /* [Inclure tous les autres styles harmonisés du TaskManager original] */

            /* Animations */
            @keyframes pulse {
                0%, 100% { 
                    opacity: 1; 
                    transform: scale(1);
                }
                50% { 
                    opacity: 0.8; 
                    transform: scale(1.02);
                }
            }

            /* Responsive design harmonisé */
            @media (max-width: 1024px) {
                .controls-bar-harmonized {
                    flex-direction: column;
                    gap: var(--gap-sm);
                    align-items: stretch;
                    padding: var(--gap-sm);
                }
                
                .view-modes-harmonized {
                    width: 100%;
                    justify-content: space-around;
                    order: 1;
                }
                
                .actions-section-harmonized {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    order: 2;
                    gap: var(--gap-sm);
                }

                .task-details-tabs {
                    flex-wrap: wrap;
                    overflow-x: visible;
                }

                .task-tab-btn {
                    flex: 1;
                    min-width: 120px;
                }
            }
            
            @media (max-width: 768px) {
                .view-mode-harmonized span,
                .btn-harmonized span {
                    display: none;
                }
                
                .actions-section-harmonized {
                    gap: var(--gap-xs);
                }

                .task-overview-content,
                .task-email-content,
                .task-replies-content,
                .task-analysis-content {
                    max-height: 50vh;
                }

                .email-details-grid,
                .metadata-grid,
                .insights-analysis-grid {
                    grid-template-columns: 1fr;
                }

                .reply-card-header-detailed {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }

                .reply-actions {
                    width: 100%;
                    justify-content: flex-end;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Utility methods for the tabs
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

    getReplyToneIcon(tone) {
        const icons = {
            formel: '👔', informel: '😊', urgent: '🚨', neutre: '📝', amical: '🤝', détaillé: '📋'
        };
        return icons[tone] || '📝';
    }

    getReplyToneLabel(tone) {
        const labels = {
            formel: 'Formel', informel: 'Informel', urgent: 'Urgent', neutre: 'Neutre', 
            amical: 'Amical', détaillé: 'Détaillé', professionnel: 'Professionnel'
        };
        return labels[tone] || 'Neutre';
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

    // Tab action methods
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
            status: task.status === 'todo' ? 'in-progress' : task.status
        });
        
        this.showToast('Email de réponse ouvert dans votre client email', 'success');
        
        document.querySelectorAll('[id^="task_details_modal_"]').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
    }

    async regenerateReplies(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;

        this.showToast('Régénération des suggestions...', 'info');

        try {
            const newSuggestions = await window.taskManager.generateIntelligentReplySuggestions(
                { 
                    from: { emailAddress: { name: task.emailFromName, address: task.emailFrom } },
                    subject: task.emailSubject,
                    body: { content: task.emailContent }
                }, 
                task
            );
            
            if (newSuggestions && newSuggestions.length > 0) {
                window.taskManager.updateTask(taskId, { 
                    suggestedReplies: newSuggestions,
                    aiRepliesGenerated: true,
                    aiRepliesGeneratedAt: new Date().toISOString()
                });
                
                this.showToast('Nouvelles suggestions générées !', 'success');
                
                // Refresh the current modal
                document.querySelectorAll('[id^="task_details_modal_"]').forEach(el => el.remove());
                document.body.style.overflow = 'auto';
                this.showTaskDetails(taskId);
            } else {
                this.showToast('Impossible de générer de nouvelles suggestions', 'warning');
            }
            
        } catch (error) {
            console.error('[TasksView] Error regenerating suggestions:', error);
            this.showToast('Erreur lors de la régénération', 'error');
        }
    }

    composeCustomReply(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;

        const subject = `Re: ${task.emailSubject || 'Votre message'}`;
        const to = task.emailFrom;
        const body = `Bonjour ${task.emailFromName || ''},\n\n\n\nCordialement,\n[Votre nom]`;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
        
        this.showToast('Composition d\'email ouverte', 'success');
    }

    async reanalyzeTask(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !window.aiTaskAnalyzer) return;

        this.showToast('Nouvelle analyse en cours...', 'info');

        try {
            // Reconstruct email object
            const emailObj = {
                id: task.emailId || taskId,
                subject: task.emailSubject,
                from: { 
                    emailAddress: { 
                        name: task.emailFromName, 
                        address: task.emailFrom 
                    } 
                },
                body: { content: task.emailContent },
                receivedDateTime: task.emailDate,
                hasAttachments: task.hasAttachments
            };

            const newAnalysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(emailObj, { 
                useApi: true, 
                forceRefresh: true 
            });
            
            if (newAnalysis) {
                window.taskManager.updateTask(taskId, { 
                    aiAnalysis: newAnalysis,
                    summary: newAnalysis.summary,
                    actions: newAnalysis.actionPoints || [],
                    keyInfo: newAnalysis.insights?.keyInfo || [],
                    risks: newAnalysis.insights?.risks || [],
                    insights: newAnalysis.insights
                });
                
                this.showToast('Analyse mise à jour !', 'success');
                
                // Refresh the current modal
                document.querySelectorAll('[id^="task_details_modal_"]').forEach(el => el.remove());
                document.body.style.overflow = 'auto';
                this.showTaskDetails(taskId);
            } else {
                this.showToast('Impossible de relancer l\'analyse', 'warning');
            }
            
        } catch (error) {
            console.error('[TasksView] Error reanalyzing task:', error);
            this.showToast('Erreur lors de l\'analyse', 'error');
        }
    }

    exportAnalysis(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.aiAnalysis) return;

        const analysisData = {
            task: {
                id: task.id,
                title: task.title,
                priority: task.priority,
                status: task.status,
                createdAt: task.createdAt
            },
            analysis: task.aiAnalysis,
            insights: task.insights,
            actions: task.actions,
            keyInfo: task.keyInfo,
            risks: task.risks,
            suggestedReplies: task.suggestedReplies?.length || 0
        };

        const jsonContent = JSON.stringify(analysisData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `analyse_tache_${task.id}_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Analyse exportée', 'success');
    }

    createSubtask(parentTaskId, subtaskIndex) {
        const parentTask = window.taskManager.getTask(parentTaskId);
        if (!parentTask || !parentTask.aiAnalysis?.subtasks?.[subtaskIndex]) return;

        const subtask = parentTask.aiAnalysis.subtasks[subtaskIndex];
        
        const newTaskData = {
            title: `${subtask.title} (sous-tâche)`,
            description: `Sous-tâche générée à partir de: ${parentTask.title}`,
            priority: subtask.priority || 'medium',
            status: 'todo',
            category: parentTask.category,
            client: parentTask.client,
            tags: [...(parentTask.tags || []), 'sous-tâche'],
            method: 'ai-subtask'
        };

        const newTask = window.taskManager.createTask(newTaskData);
        
        this.showToast('Sous-tâche créée avec succès', 'success');
        this.refreshView();
    }

    // Continue with all existing methods from the original TasksView...
    // All the bulk actions, filtering, rendering, etc. methods remain the same

    // Placeholder for all existing methods that haven't been shown yet
    handleTaskClick(event, taskId) {
        this.showTaskDetails(taskId);
    }

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
        console.log('[TasksView] View mode changed to:', mode);
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

    // Include all other existing utility methods...
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

    // Continue with all other existing methods...
    // [All other methods from the original implementation remain the same]
    
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
        
        const clearBtn = document.querySelector('.search-clear-harmonized');
        if (clearBtn) {
            clearBtn.style.display = this.currentFilters.search ? 'flex' : 'none';
        }
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    // [Rest of the existing methods would continue here...]
    // Including all filtering, rendering, and utility methods
}

// =====================================
// GLOBAL INITIALIZATION
// =====================================

function initializeTaskManager() {
    console.log('[TaskManager] Initializing global instances v10.0 - Interface Harmonisée avec Détails Structurés...');
    
    if (!window.taskManager || !window.taskManager.initialized) {
        window.taskManager = new TaskManager();
    }
    
    if (!window.tasksView) {
        window.tasksView = new TasksView();
    }
    
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
    
    console.log('✅ TaskManager v10.0 loaded - Interface Harmonisée avec Détails Structurés');
}

initializeTaskManager();

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TaskManager] DOM ready, ensuring initialization...');
    initializeTaskManager();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.taskManager || !window.taskManager.initialized) {
            console.log('[TaskManager] Fallback initialization...');
            initializeTaskManager();
        }
    }, 1000);
});
