// TaskManager Pro v9.1 - Interface Épurée et Moderne avec ligne explicative

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
            console.log('[TaskManager] Initializing v9.1 - Interface avec aide...');
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
            // Utiliser une variable en mémoire au lieu de localStorage
            if (!window.taskManagerMemoryStore) {
                console.log('[TaskManager] No saved tasks found, creating sample tasks');
                this.generateSampleTasks();
                window.taskManagerMemoryStore = this.tasks;
            } else {
                this.tasks = window.taskManagerMemoryStore;
                console.log(`[TaskManager] Loaded ${this.tasks.length} tasks from memory`);
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
[Votre nom]`
                    }
                ],
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
                tags: ['finance', 'offre'],
                client: 'Bankin\'',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                updatedAt: new Date(Date.now() - 3600000).toISOString(),
                needsReply: false,
                dueDate: null,
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
                method: 'manual'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

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
            
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            aiAnalysis: taskData.aiAnalysis || null,
            
            suggestedReplies: suggestedReplies,
            aiRepliesGenerated: suggestedReplies.length > 0,
            aiRepliesGeneratedAt: suggestedReplies.length > 0 ? new Date().toISOString() : null,
            
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
            
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            suggestedReplies: taskData.suggestedReplies || [],
            
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
            // Sauvegarder en mémoire au lieu de localStorage
            window.taskManagerMemoryStore = this.tasks;
            console.log(`[TaskManager] Saved ${this.tasks.length} tasks in memory`);
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
// MODERN TASKS VIEW - INTERFACE ÉPURÉE AVEC LIGNE EXPLICATIVE
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
        this.showAdvancedFilters = true;
        this.showHelpLine = true; // Nouvelle propriété pour la ligne d'aide
        
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
                <!-- Ligne explicative identique aux emails -->
                ${this.showHelpLine ? this.renderHelpLine() : ''}
                
                <!-- Barre de contrôles harmonisée -->
                <div class="controls-bar-harmonized">
                    <!-- Section recherche -->
                    <div class="search-section-harmonized">
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
                    
                    <!-- Modes de vue harmonisés -->
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
                    
                    <!-- Actions principales harmonisées -->
                    <div class="action-buttons-harmonized">
                        ${selectedCount > 0 ? `
                            <div class="selection-info-harmonized">
                                <span class="selection-count-harmonized">${selectedCount} sélectionné(s)</span>
                                <button class="btn-harmonized btn-clear-selection" onclick="window.tasksView.clearSelection()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <button class="btn-harmonized btn-primary" onclick="window.tasksView.bulkActions()">
                                <i class="fas fa-cog"></i>
                                <span>Actions</span>
                                <span class="count-badge-harmonized">${selectedCount}</span>
                            </button>
                        ` : ''}
                        
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

                <!-- Filtres de statut harmonisés -->
                <div class="status-filters-harmonized">
                    ${this.buildHarmonizedStatusPills(stats)}
                </div>
                
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

        this.addHarmonizedTaskStyles();
        this.setupEventListeners();
        console.log('[TasksView] Harmonized interface with help line rendered');
    }

    renderHelpLine() {
        return `
            <div class="help-line-tasks">
                <div class="help-content-tasks">
                    <i class="fas fa-info-circle help-icon-tasks"></i>
                    <div class="help-text-tasks">
                        <span class="help-main-text-tasks">Gérez vos tâches en sélectionnant celles qui vous intéressent, puis utilisez les boutons d'action pour les traiter, répondre aux emails ou les organiser. Vous pouvez également filtrer par statut ci-dessous.</span>
                    </div>
                </div>
                <button class="help-close-tasks" onclick="window.tasksView.hideHelpLine()" title="Masquer cette aide">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    hideHelpLine() {
        this.showHelpLine = false;
        const helpLine = document.querySelector('.help-line-tasks');
        if (helpLine) {
            helpLine.style.opacity = '0';
            helpLine.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                helpLine.remove();
            }, 300);
        }
    }

    buildHarmonizedStatusPills(stats) {
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
            <div class="tasks-harmonized-list">
                ${tasks.map(task => this.renderHarmonizedTaskItem(task)).join('')}
            </div>
        `;
    }

    renderGroupedView(tasks, groupMode) {
        const groups = this.createTaskGroups(tasks, groupMode);
        
        return `
            <div class="tasks-grouped-harmonized">
                ${groups.map(group => this.renderTaskGroup(group, groupMode)).join('')}
            </div>
        `;
    }

    renderTaskGroup(group, groupType) {
        const displayName = groupType === 'grouped-domain' ? `@${group.name}` : group.name;
        const avatarColor = this.generateAvatarColor(group.name);
        
        return `
            <div class="task-group-harmonized" data-group-key="${group.key}">
                <div class="group-header-harmonized" onclick="window.tasksView.toggleGroup('${group.key}')">
                    <div class="group-avatar-harmonized" style="background: ${avatarColor}">
                        ${groupType === 'grouped-domain' ? 
                            '<i class="fas fa-globe"></i>' : 
                            group.name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="group-info-harmonized">
                        <div class="group-name-harmonized">${displayName}</div>
                        <div class="group-meta-harmonized">${group.count} tâche${group.count > 1 ? 's' : ''} • ${this.formatRelativeDate(group.latestDate)}</div>
                    </div>
                    <div class="group-expand-harmonized">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="group-content-harmonized" style="display: none;">
                    ${group.tasks.map(task => this.renderHarmonizedTaskItem(task)).join('')}
                </div>
            </div>
        `;
    }

    createTaskGroups(tasks, groupMode) {
        const groups = {};
        
        tasks.forEach(task => {
            let groupKey, groupName;
            
            if (groupMode === 'grouped-domain') {
                if (task.hasEmail && task.emailDomain) {
                    groupKey = task.emailDomain;
                    groupName = task.emailDomain;
                } else {
                    groupKey = 'internal';
                    groupName = 'Tâches internes';
                }
            } else { // grouped-sender
                if (task.hasEmail && task.emailFromName) {
                    groupKey = task.emailFrom || task.emailFromName;
                    groupName = task.emailFromName;
                } else {
                    groupKey = task.client || 'internal';
                    groupName = task.client || 'Tâches internes';
                }
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    key: groupKey,
                    name: groupName,
                    tasks: [],
                    count: 0,
                    latestDate: null
                };
            }
            
            groups[groupKey].tasks.push(task);
            groups[groupKey].count++;
            
            const taskDate = new Date(task.createdAt);
            if (!groups[groupKey].latestDate || taskDate > groups[groupKey].latestDate) {
                groups[groupKey].latestDate = taskDate;
            }
        });
        
        return Object.values(groups).sort((a, b) => {
            if (!a.latestDate && !b.latestDate) return 0;
            if (!a.latestDate) return 1;
            if (!b.latestDate) return -1;
            return b.latestDate - a.latestDate;
        });
    }

    toggleGroup(groupKey) {
        const group = document.querySelector(`[data-group-key="${groupKey}"]`);
        if (!group) return;
        
        const content = group.querySelector('.group-content-harmonized');
        const icon = group.querySelector('.group-expand-harmonized i');
        const header = group.querySelector('.group-header-harmonized');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            group.classList.add('expanded');
            header.classList.add('expanded-header');
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            group.classList.remove('expanded');
            header.classList.remove('expanded-header');
        }
    }

    generateAvatarColor(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = Math.abs(hash) % 360;
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 45 + (Math.abs(hash) % 15);
        
        return `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness + 10}%))`;
    }

    formatRelativeDate(date) {
        if (!date) return 'Date inconnue';
        
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Aujourd\'hui';
        if (days === 1) return 'Hier';
        if (days < 7) return `Il y a ${days} jours`;
        if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
        return date.toLocaleDateString('fr-FR');
    }

    renderEmptyState() {
        return `
            <div class="empty-state-harmonized">
                <div class="empty-state-icon-harmonized">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3 class="empty-state-title-harmonized">Aucune tâche trouvée</h3>
                <p class="empty-state-text-harmonized">
                    ${this.hasActiveFilters() ? 'Aucune tâche ne correspond à vos critères' : 'Vous n\'avez aucune tâche'}
                </p>
                ${this.hasActiveFilters() ? `
                    <button class="btn-harmonized btn-primary" onclick="window.tasksView.resetAllFilters()">
                        <i class="fas fa-undo"></i>
                        <span>Réinitialiser les filtres</span>
                    </button>
                ` : `
                    <button class="btn-harmonized btn-primary" onclick="window.tasksView.showCreateModal()">
                        <i class="fas fa-plus"></i>
                        <span>Créer votre première tâche</span>
                    </button>
                `}
            </div>
        `;
    }

    renderHarmonizedTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        
        // Destinataire : priorité email > client > type
        const recipient = task.hasEmail ? 
            (task.emailFromName || this.extractNameFromEmail(task.emailFrom) || 'Email inconnu') :
            (task.client !== 'Interne' ? task.client : task.type || 'Tâche');
            
        // Type visuel clair
        const taskTypeDisplay = this.getTaskTypeDisplay(task);
        
        // Deadline formatting
        const dueDateDisplay = this.formatDueDateSimple(task.dueDate);
        
        // Priority color
        const priorityColor = this.getPriorityColor(task.priority);
        
        return `
            <div class="task-harmonized-card ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <!-- Checkbox de sélection harmonisé -->
                <input type="checkbox" 
                       class="task-checkbox-harmonized" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <!-- Indicateur de priorité harmonisé -->
                <div class="priority-bar-harmonized" style="background-color: ${priorityColor}"></div>
                
                <!-- Contenu principal harmonisé et centré -->
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
                
                <!-- Actions rapides harmonisées -->
                <div class="task-actions-harmonized">
                    ${this.renderHarmonizedActions(task)}
                </div>
            </div>
        `;
    }

    renderHarmonizedActions(task) {
        const actions = [];
        
        // Bouton principal selon l'état
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-harmonized complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        // Bouton répondre pour les emails
        if (task.hasEmail && !task.emailReplied && task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-harmonized reply" 
                        onclick="event.stopPropagation(); window.tasksView.replyToEmailWithAI('${task.id}')"
                        title="Répondre à l'email">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        // Bouton détails
        actions.push(`
            <button class="action-btn-harmonized details" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // NOUVELLES FONCTIONS UTILITAIRES POUR L'AFFICHAGE ÉPURÉ
    getTaskTypeDisplay(task) {
        if (task.hasEmail) {
            return { 
                icon: '📧', 
                label: 'Email' 
            };
        }
        
        switch (task.category) {
            case 'meeting':
                return { icon: '🗓️', label: 'Réunion' };
            case 'call':
                return { icon: '📞', label: 'Appel' };
            case 'document':
                return { icon: '📄', label: 'Document' };
            case 'project':
                return { icon: '🎯', label: 'Projet' };
            default:
                return { icon: '✓', label: task.type || 'Tâche' };
        }
    }

    getPriorityColor(priority) {
        const colors = {
            urgent: '#ef4444',   // Rouge vif
            high: '#f97316',     // Orange
            medium: '#3b82f6',   // Bleu
            low: '#10b981'       // Vert
        };
        return colors[priority] || colors.medium;
    }

    formatDueDateSimple(dateString) {
        if (!dateString) {
            return { html: '<span class="no-deadline-harmonized">Pas d\'échéance</span>', text: '' };
        }
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        let className = 'deadline-normal-harmonized';
        let text = '';
        let bgColor = '#f3f4f6';
        let textColor = '#6b7280';
        
        if (diffDays < 0) {
            className = 'deadline-overdue-harmonized';
            text = `En retard (${Math.abs(diffDays)}j)`;
            bgColor = '#fef2f2';
            textColor = '#dc2626';
        } else if (diffDays === 0) {
            className = 'deadline-today-harmonized';
            text = 'Aujourd\'hui';
            bgColor = '#fef3c7';
            textColor = '#d97706';
        } else if (diffDays === 1) {
            className = 'deadline-tomorrow-harmonized';
            text = 'Demain';
            bgColor = '#fef3c7';
            textColor = '#d97706';
        } else if (diffDays <= 7) {
            className = 'deadline-week-harmonized';
            text = `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
            bgColor = '#eff6ff';
            textColor = '#2563eb';
        } else {
            text = date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
        
        return {
            html: `<span class="deadline-badge-harmonized ${className}" style="background-color: ${bgColor}; color: ${textColor};">
                📅 ${text}
            </span>`,
            text: text
        };
    }

    extractNameFromEmail(email) {
        if (!email) return null;
        
        // Extraire le nom avant @ et le formatter
        const namePart = email.split('@')[0];
        if (!namePart) return null;
        
        // Remplacer points et underscores par espaces, capitaliser
        return namePart
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // MÉTHODES EXISTANTES ADAPTÉES
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

    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        const uniqueId = 'task_details_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 1000px; width: 100%; 
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

    buildTaskDetailsContent(task) {
        const priorityIcon = this.getPriorityIcon(task.priority);
        const statusLabel = this.getStatusLabel(task.status);
        const dueDateInfo = this.formatDueDateSimple(task.dueDate);
        
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

                ${task.suggestedReplies && task.suggestedReplies.length > 0 ? `
                    <div class="details-section suggested-replies-section">
                        <h3><i class="fas fa-reply-all"></i> Suggestions de Réponse</h3>
                        <div class="suggested-replies-container">
                            ${task.suggestedReplies.slice(0, 2).map((reply, idx) => `
                                <div class="suggested-reply-card-compact">
                                    <div class="reply-header-compact">
                                        <span class="reply-tone-badge ${reply.tone}">
                                            ${this.getReplyToneIcon(reply.tone)} ${this.getReplyToneLabel(reply.tone)}
                                        </span>
                                        <button class="use-reply-btn-compact" onclick="window.tasksView.useReply('${task.id}', ${idx})">
                                            <i class="fas fa-paper-plane"></i> Utiliser
                                        </button>
                                    </div>
                                    <div class="reply-preview">
                                        ${this.escapeHtml(reply.content.substring(0, 150))}${reply.content.length > 150 ? '...' : ''}
                                    </div>
                                </div>
                            `).join('')}
                            ${task.suggestedReplies.length > 2 ? `
                                <button class="show-all-replies-btn" onclick="window.tasksView.showSuggestedReplies('${task.id}')">
                                    Voir toutes les suggestions (${task.suggestedReplies.length})
                                </button>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${task.emailContent && task.emailContent.length > 100 ? `
                    <div class="details-section">
                        <h3><i class="fas fa-envelope-open"></i> Contenu de l'Email</h3>
                        <div class="email-content-section">
                            ${task.emailHtmlContent ? `
                                <div class="email-content-tabs">
                                    <button class="tab-btn active" onclick="window.tasksView.switchEmailTab('html', '${task.id}')">
                                        <i class="fas fa-eye"></i> Vue formatée
                                    </button>
                                    <button class="tab-btn" onclick="window.tasksView.switchEmailTab('text', '${task.id}')">
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
                            ` : `
                                <div class="email-content-box">
                                    ${this.formatEmailContent(task.emailContent)}
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // MÉTHODES UTILITAIRES CONSERVÉES
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

    formatEmailContent(content) {
        if (!content) return '<p>Contenu non disponible</p>';
        
        const formattedContent = content
            .replace(/\n/g, '<br>')
            .replace(/Email de:/g, '<strong>Email de:</strong>')
            .replace(/Date:/g, '<strong>Date:</strong>')
            .replace(/Sujet:/g, '<strong>Sujet:</strong>');
            
        return `<div class="email-original-content">${formattedContent}</div>`;
    }

    switchEmailTab(tabType, taskId) {
        const tabs = document.querySelectorAll('.tab-btn');
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

    showSuggestedReplies(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.suggestedReplies || task.suggestedReplies.length === 0) return;

        const uniqueId = 'replies_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 800px; width: 100%; 
                           max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
                    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 20px;"><i class="fas fa-reply-all"></i> Suggestions de Réponse</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                style="background: none; border: none; font-size: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 20px; overflow-y: auto; flex: 1;">
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
            status: task.status === 'todo' ? 'in-progress' : task.status
        });
        
        this.showToast('Email de réponse ouvert dans votre client email', 'success');
        
        document.querySelectorAll('[id^="replies_modal_"], [id^="task_details_modal_"]').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
    }

    async replyToEmailWithAI(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        if (task.suggestedReplies && task.suggestedReplies.length > 0) {
            this.showSuggestedReplies(taskId);
            return;
        }
        
        try {
            this.showToast('Génération de suggestions IA...', 'info');
            
            const newSuggestions = await window.taskManager.generateIntelligentReplySuggestions(
                { 
                    from: { emailAddress: { name: task.emailFromName, address: task.emailFrom } },
                    subject: task.emailSubject,
                    body: { content: task.emailContent },
                    bodyPreview: task.emailContent
                }, 
                task
            );
            
            if (newSuggestions && newSuggestions.length > 0) {
                window.taskManager.updateTask(taskId, { 
                    suggestedReplies: newSuggestions,
                    aiRepliesGenerated: true,
                    aiRepliesGeneratedAt: new Date().toISOString()
                });
                
                this.showToast('Suggestions IA générées !', 'success');
                this.showSuggestedReplies(taskId);
                this.refreshView();
            } else {
                this.showToast('Impossible de générer des suggestions', 'warning');
                this.replyToEmailBasic(taskId);
            }
            
        } catch (error) {
            console.error('[TasksView] Error generating AI suggestions:', error);
            this.showToast('Erreur IA, réponse basique', 'warning');
            this.replyToEmailBasic(taskId);
        }
    }

    replyToEmailBasic(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        const subject = `Re: ${task.emailSubject || 'Votre message'}`;
        const to = task.emailFrom;
        const body = `Bonjour ${task.emailFromName || ''},\n\nMerci pour votre message.\n\nCordialement,`;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
        
        window.taskManager.updateTask(taskId, { emailReplied: true });
        this.showToast('Email de réponse ouvert', 'success');
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche marquée comme terminée', 'success');
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

    updateSelectionUI() {
        document.querySelectorAll('[data-task-id]').forEach(item => {
            const taskId = item.dataset.taskId;
            const isSelected = this.selectedTasks.has(taskId);
            
            item.classList.toggle('selected', isSelected);
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = isSelected;
        });
    }

    showCreateModal() {
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
            type: 'tâche',
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
            case 0:
                this.selectedTasks.forEach(taskId => {
                    window.taskManager.updateTask(taskId, { status: 'completed' });
                });
                this.showToast(`${this.selectedTasks.size} tâche(s) marquée(s) comme terminée(s)`, 'success');
                this.clearSelection();
                break;
                
            case 1:
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
                
            case 2:
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedTasks.size} tâche(s) ?`)) {
                    this.selectedTasks.forEach(taskId => {
                        window.taskManager.deleteTask(taskId);
                    });
                    this.showToast(`${this.selectedTasks.size} tâche(s) supprimée(s)`, 'success');
                    this.clearSelection();
                }
                break;
                
            case 3:
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

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
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

    refreshTasks() {
        this.refreshView();
        this.showToast('Tâches actualisées', 'success');
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

    updateFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.refreshView();
        console.log('[TasksView] Filter updated:', filterType, '=', value);
    }

    resetAllFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            tag: 'all',
            search: '',
            sortBy: 'created',
            dateRange: 'all',
            overdue: false,
            needsReply: false
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
               this.currentFilters.tag !== 'all' ||
               this.currentFilters.dateRange !== 'all' ||
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply;
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        const stats = window.taskManager.getStats();
        document.querySelectorAll('.status-filters-harmonized').forEach(container => {
            container.innerHTML = this.buildHarmonizedStatusPills(stats);
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
        
        const clearBtn = document.querySelector('.search-clear-harmonized');
        if (clearBtn) {
            clearBtn.style.display = this.currentFilters.search ? 'flex' : 'none';
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // STYLES HARMONISÉS ET UNIFORMISÉS AVEC CENTRAGE PARFAIT + LIGNE D'AIDE
    addHarmonizedTaskStyles() {
        if (document.getElementById('harmonizedTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'harmonizedTaskStyles';
        styles.textContent = `
            /* ===== LIGNE D'AIDE IDENTIQUE AUX EMAILS ===== */
            .help-line-tasks {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: 1px solid #93c5fd;
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .help-line-tasks::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, #3b82f6, transparent);
            }
            
            .help-content-tasks {
                display: flex;
                align-items: center;
                gap: 16px;
                flex: 1;
                min-width: 0;
            }
            
            .help-icon-tasks {
                color: #2563eb;
                font-size: 20px;
                flex-shrink: 0;
                background: rgba(255, 255, 255, 0.8);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
            }
            
            .help-text-tasks {
                flex: 1;
                min-width: 0;
            }
            
            .help-main-text-tasks {
                color: #1e40af;
                font-size: 14px;
                font-weight: 600;
                line-height: 1.5;
                display: block;
                text-align: left;
            }
            
            .help-close-tasks {
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid #bfdbfe;
                border-radius: 8px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #3b82f6;
                font-size: 12px;
                flex-shrink: 0;
            }
            
            .help-close-tasks:hover {
                background: white;
                border-color: #93c5fd;
                transform: scale(1.1);
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
            }

            /* ===== HARMONISATION ABSOLUE DE TOUS LES BOUTONS AVEC CENTRAGE PARFAIT ===== */
            
            /* Variables CSS pour cohérence parfaite */
            :root {
                /* TAILLES UNIFIÉES POUR TOUS LES BOUTONS */
                --btn-height: 44px;
                --btn-padding-horizontal: 16px;
                --btn-padding-vertical: 0;
                --btn-font-size: 13px;
                --btn-border-radius: 10px;
                --btn-font-weight: 600;
                --btn-line-height: 1;
                --btn-gap: 8px;
                
                /* MÊME HAUTEUR POUR TOUS LES PILLS */
                --pill-height: 44px;
                --pill-padding-horizontal: 16px;
                --pill-padding-vertical: 0;
                --pill-font-size: 13px;
                --pill-border-radius: 10px;
                
                /* CARTES ET AUTRES ÉLÉMENTS - ESPACEMENTS RÉDUITS */
                --card-height: 76px;
                --card-padding: 14px;
                --card-border-radius: 12px;
                
                /* INPUTS HARMONISÉS */
                --input-height: 44px;
                --input-padding: 12px 16px;
                --input-font-size: 13px;
                
                /* BOUTONS D'ACTION */
                --action-btn-size: 36px;
                --action-btn-font-size: 13px;
                
                /* ESPACEMENTS UNIFORMES */
                --gap-tiny: 4px;
                --gap-small: 8px;
                --gap-medium: 12px;
                --gap-large: 16px;
                --gap-xl: 20px;
                
                /* PROPRIÉTÉS COMMUNES */
                --border-width: 1px;
                --transition-speed: 0.2s;
                --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.05);
                --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
                --shadow-primary: 0 4px 12px rgba(99, 102, 241, 0.25);
            }
            
            /* CLASSE DE BASE POUR TOUS LES BOUTONS AVEC CENTRAGE PARFAIT */
            .btn-base,
            .btn-harmonized,
            .view-mode-harmonized,
            .status-pill-harmonized {
                /* DIMENSIONS EXACTES */
                height: var(--btn-height);
                min-height: var(--btn-height);
                max-height: var(--btn-height);
                
                /* PADDING UNIFORME */
                padding: var(--btn-padding-vertical) var(--btn-padding-horizontal);
                
                /* TYPOGRAPHIE IDENTIQUE ET CENTRÉE */
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                line-height: var(--btn-line-height);
                text-align: center;
                
                /* APPARENCE UNIFIÉE */
                border: var(--border-width) solid transparent;
                border-radius: var(--btn-border-radius);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                text-decoration: none;
                white-space: nowrap;
                box-sizing: border-box;
                
                /* DISPOSITION FLEX UNIFIÉE AVEC CENTRAGE PARFAIT */
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                
                /* COMPORTEMENT */
                user-select: none;
                outline: none;
                position: relative;
                
                /* CENTRAGE VERTICAL ET HORIZONTAL PARFAIT */
                vertical-align: middle;
            }
            
            /* STYLES SPÉCIFIQUES POUR CHAQUE TYPE DE BOUTON */
            .btn-harmonized {
                background: white;
                color: #374151;
                border-color: #e5e7eb;
                box-shadow: var(--shadow-base);
                min-width: fit-content;
            }
            
            .btn-harmonized:hover {
                background: #f9fafb;
                border-color: #6366f1;
                color: #1f2937;
                transform: translateY(-1px);
                box-shadow: var(--shadow-hover);
            }
            
            .btn-harmonized:active {
                transform: translateY(0);
                box-shadow: var(--shadow-base);
            }
            
            /* BOUTON PRIMARY - MÊME TAILLE */
            .btn-harmonized.btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: var(--shadow-primary);
            }
            
            .btn-harmonized.btn-primary:hover {
                background: linear-gradient(135deg, #5856eb 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
            }
            
            /* BOUTON SECONDARY - MÊME TAILLE */
            .btn-harmonized.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-harmonized.btn-secondary:hover {
                background: #f1f5f9;
                color: #334155;
                border-color: #cbd5e1;
                transform: translateY(-1px);
            }
            
            /* BOUTON CLEAR SELECTION - CARRÉ PARFAIT CENTRÉ */
            .btn-harmonized.btn-clear-selection {
                background: #f3f4f6;
                color: #6b7280;
                border: none;
                width: var(--btn-height);
                height: var(--btn-height);
                min-width: var(--btn-height);
                max-width: var(--btn-height);
                padding: 0;
                border-radius: var(--btn-border-radius);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-harmonized.btn-clear-selection:hover {
                background: #e5e7eb;
                color: #374151;
                transform: translateY(-1px);
            }
            
            /* BOUTON FILTERS TOGGLE */
            .btn-harmonized.filters-toggle {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-harmonized.filters-toggle:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
                transform: translateY(-1px);
            }
            
            .btn-harmonized.filters-toggle.active {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-color: transparent;
                box-shadow: var(--shadow-primary);
            }
            
            /* MODES DE VUE - EXACTEMENT LA MÊME TAILLE ET PARFAITEMENT CENTRÉS */
            .view-mode-harmonized {
                background: transparent;
                color: #6b7280;
                border-color: transparent;
                min-width: 120px;
                flex: 1;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .view-mode-harmonized:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
                transform: translateY(-1px);
            }
            
            .view-mode-harmonized.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
                font-weight: 700;
                transform: translateY(-1px);
            }
            
            /* STATUS PILLS - EXACTEMENT LA MÊME TAILLE ET CENTRÉS */
            .status-pill-harmonized {
                background: white;
                color: #374151;
                border-color: #e5e7eb;
                box-shadow: var(--shadow-base);
                min-width: fit-content;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .status-pill-harmonized:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
            }
            
            .status-pill-harmonized.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                transform: translateY(-1px);
            }
            
            /* CONTAINER DES MODES DE VUE AVEC CENTRAGE */
            .view-modes-harmonized {
                display: flex;
                background: #f8fafc;
                border: var(--border-width) solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: var(--gap-tiny);
                gap: 2px;
                height: var(--btn-height);
                box-sizing: border-box;
                align-items: center;
                justify-content: center;
            }
            
            /* INFO DE SÉLECTION PARFAITEMENT CENTRÉE */
            .selection-info-harmonized {
                height: var(--btn-height);
                padding: var(--btn-padding-vertical) var(--btn-padding-horizontal);
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border: var(--border-width) solid #93c5fd;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                color: #1e40af;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
                box-sizing: border-box;
                white-space: nowrap;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                text-align: center;
            }
            
            /* BADGE DE COMPTAGE CENTRÉ */
            .count-badge-harmonized {
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
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* ICÔNES ET TEXTE DANS LES PILLS AVEC CENTRAGE PARFAIT */
            .pill-icon-harmonized {
                font-size: var(--btn-font-size);
                line-height: 1;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .pill-text-harmonized {
                font-weight: var(--btn-font-weight);
                line-height: 1;
                flex-shrink: 0;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .pill-count-harmonized {
                background: rgba(0, 0, 0, 0.1);
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                min-width: 20px;
                text-align: center;
                line-height: 1;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .status-pill-harmonized.active .pill-count-harmonized {
                background: rgba(255, 255, 255, 0.25);
            }
            
            .selection-count-harmonized {
                font-weight: 700;
                flex-shrink: 0;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Interface principale */
            .tasks-page-modern {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: var(--gap-large);
                font-size: var(--btn-font-size);
            }
            
            /* ===== BARRE DE CONTRÔLES AVEC ALIGNEMENT PARFAIT ===== */
            .controls-bar-harmonized {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--gap-large);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: var(--border-width) solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                padding: var(--gap-medium);
                margin-bottom: var(--gap-medium);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                min-height: calc(var(--btn-height) + var(--gap-medium) * 2);
                box-sizing: border-box;
            }
            
            /* SECTION RECHERCHE - HAUTEUR EXACTE ET CENTRÉE */
            .search-section-harmonized {
                flex: 0 0 300px;
                height: var(--btn-height);
                display: flex;
                align-items: center;
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
                height: var(--btn-height);
                padding: 0 var(--gap-medium) 0 44px;
                border: var(--border-width) solid #d1d5db;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                background: #f9fafb;
                transition: all var(--transition-speed) ease;
                box-sizing: border-box;
                line-height: var(--btn-line-height);
                outline: none;
                text-align: left;
                vertical-align: middle;
            }
            
            .search-input-harmonized:focus {
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .search-input-harmonized::placeholder {
                color: #9ca3af;
                font-weight: 500;
            }
            
            .search-icon-harmonized {
                position: absolute;
                left: var(--gap-medium);
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .search-clear-harmonized {
                position: absolute;
                right: var(--gap-small);
                top: 50%;
                transform: translateY(-50%);
                background: #ef4444;
                color: white;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 700;
                transition: all var(--transition-speed) ease;
                outline: none;
            }
            
            .search-clear-harmonized:hover {
                background: #dc2626;
                transform: translateY(-50%) scale(1.1);
            }
            
            /* MODES DE VUE PARFAITEMENT ALIGNÉS ET CENTRÉS */
            .view-modes-harmonized {
                display: flex;
                background: #f8fafc;
                border: var(--border-width) solid #e2e8f0;
                border-radius: var(--btn-border-radius);
                padding: var(--gap-tiny);
                gap: 2px;
                height: var(--btn-height);
                box-sizing: border-box;
                align-items: center;
                justify-content: center;
            }
            
            .view-mode-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--btn-gap);
                padding: 0 var(--btn-padding-horizontal);
                height: calc(var(--btn-height) - var(--gap-small));
                border: none;
                background: transparent;
                color: #6b7280;
                border-radius: calc(var(--btn-border-radius) - 2px);
                cursor: pointer;
                transition: all var(--transition-speed) ease;
                font-size: var(--btn-font-size);
                font-weight: var(--btn-font-weight);
                white-space: nowrap;
                box-sizing: border-box;
                min-width: 120px;
                flex: 1;
                text-align: center;
            }
            
            .view-mode-harmonized:hover {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
                transform: translateY(-1px);
            }
            
            .view-mode-harmonized.active {
                background: white;
                color: #1f2937;
                box-shadow: var(--shadow-base);
                font-weight: 700;
                transform: translateY(-1px);
            }
            
            /* ACTIONS PRINCIPALES - TOUTES À LA MÊME HAUTEUR ET CENTRÉES */
            .action-buttons-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                height: var(--btn-height);
                flex-shrink: 0;
            }
            
            /* TOUS les boutons dans action-buttons-harmonized DOIVENT avoir la même hauteur ET être centrés */
            .action-buttons-harmonized > *,
            .action-buttons-harmonized .btn-harmonized,
            .action-buttons-harmonized .selection-info-harmonized {
                height: var(--btn-height);
                min-height: var(--btn-height);
                max-height: var(--btn-height);
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* ===== FILTRES DE STATUT ÉLARGIS SUR TOUTE LA LIGNE ===== */
            .status-filters-harmonized {
                display: flex;
                gap: var(--gap-small);
                margin-bottom: var(--gap-medium);
                flex-wrap: nowrap;
                align-items: center;
                justify-content: stretch;
                width: 100%;
            }
            
            /* TOUS les pills de statut ÉLARGIS pour occuper toute la ligne */
            .status-filters-harmonized .status-pill-harmonized {
                height: 48px;
                min-height: 48px;
                max-height: 48px;
                padding: var(--btn-padding-vertical) 16px;
                font-size: 14px;
                font-weight: 700;
                flex: 1;
                min-width: 0;
                box-sizing: border-box;
                border-radius: 12px;
                box-shadow: var(--shadow-base);
                transition: all var(--transition-speed) ease;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            
            .status-pill-harmonized:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
            }
            
            .status-pill-harmonized.active {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-color: #3b82f6;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                transform: translateY(-2px);
            }
            
            /* ALIGNEMENT PARFAIT DU CONTENU DANS LES PILLS AVEC CENTRAGE */
            .pill-icon-harmonized {
                font-size: 16px;
                line-height: 1;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .pill-text-harmonized {
                font-weight: 700;
                line-height: 1;
                flex-shrink: 0;
                text-align: center;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .pill-count-harmonized {
                background: rgba(0, 0, 0, 0.1);
                padding: 6px 10px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 800;
                min-width: 24px;
                text-align: center;
                line-height: 1;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .status-pill-harmonized.active .pill-count-harmonized {
                background: rgba(255, 255, 255, 0.25);
            }
            
            /* Panneau de filtres avancés - TOUJOURS VISIBLE PAR DÉFAUT */
            .advanced-filters-panel {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                margin-bottom: var(--gap-large);
                max-height: 200px;
                overflow: visible;
                transition: all 0.3s ease;
                opacity: 1;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                padding: var(--gap-large);
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
                height: var(--input-height);
                padding: var(--input-padding);
                border: 1px solid #d1d5db;
                border-radius: var(--btn-border-radius);
                background: white;
                font-size: var(--input-font-size);
                color: #374151;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
                box-sizing: border-box;
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
            
            /* ===== CARTES DE TÂCHES SANS ESPACEMENT ET PARFAITEMENT CENTRÉES ===== */
            .tasks-harmonized-list {
                display: flex;
                flex-direction: column;
                gap: 0;
                background: transparent;
            }
            
            .task-harmonized-card {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: var(--border-width) solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                box-shadow: none;
                overflow: hidden;
                min-height: var(--card-height);
                max-height: var(--card-height);
                box-sizing: border-box;
                border-bottom: 1px solid #e5e7eb;
            }
            
            /* PREMIER ET DERNIER ÉLÉMENT AVEC BORDURES ARRONDIES */
            .task-harmonized-card:first-child {
                border-top-left-radius: var(--card-border-radius);
                border-top-right-radius: var(--card-border-radius);
                border-top: var(--border-width) solid #e5e7eb;
            }
            
            .task-harmonized-card:last-child {
                border-bottom-left-radius: var(--card-border-radius);
                border-bottom-right-radius: var(--card-border-radius);
                border-bottom: var(--border-width) solid #e5e7eb;
            }
            
            .task-harmonized-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .task-harmonized-card:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 1;
            }
            
            .task-harmonized-card:hover::before {
                opacity: 1;
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
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: 700;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .priority-bar-harmonized {
                width: 4px;
                height: 56px;
                border-radius: 2px;
                margin-right: var(--gap-medium);
                transition: all 0.3s ease;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                flex-shrink: 0;
            }
            
            .task-harmonized-card:hover .priority-bar-harmonized {
                height: 60px;
                width: 5px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
            }
            
            .task-main-content-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: var(--gap-tiny);
                height: 100%;
            }
            
            .task-header-harmonized {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: var(--gap-medium);
                margin-bottom: var(--gap-tiny);
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
                text-align: left;
                display: flex;
                align-items: center;
            }
            
            .task-meta-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                flex-shrink: 0;
            }
            
            .task-type-badge-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 3px;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                color: #475569;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: var(--border-width) solid #e2e8f0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                white-space: nowrap;
                line-height: 1;
                text-align: center;
            }
            
            .deadline-badge-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 3px;
                font-size: 10px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 6px;
                white-space: nowrap;
                border: var(--border-width) solid;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                line-height: 1;
                text-align: center;
            }
            
            .deadline-normal-harmonized {
                background: #f8fafc;
                color: #64748b;
                border-color: #e2e8f0;
            }
            
            .deadline-week-harmonized {
                background: #eff6ff;
                color: #2563eb;
                border-color: #bfdbfe;
            }
            
            .deadline-today-harmonized, .deadline-tomorrow-harmonized {
                background: #fef3c7;
                color: #d97706;
                border-color: #fde68a;
            }
            
            .deadline-overdue-harmonized {
                background: #fef2f2;
                color: #dc2626;
                border-color: #fecaca;
                animation: pulse 2s infinite;
            }
            
            .no-deadline-harmonized {
                color: #9ca3af;
                font-style: italic;
                font-size: 10px;
                text-align: center;
            }
            
            .task-recipient-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-tiny);
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }
            
            .task-recipient-harmonized i {
                color: #9ca3af;
                font-size: 12px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .recipient-name-harmonized {
                font-weight: 600;
                color: #374151;
                text-align: left;
                display: flex;
                align-items: center;
            }
            
            .reply-indicator-harmonized {
                color: #dc2626;
                font-weight: 600;
                font-size: 10px;
                text-align: center;
            }
            
            .task-actions-harmonized {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-tiny);
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
                font-size: var(--action-btn-font-size);
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                flex-shrink: 0;
                text-align: center;
            }
            
            .action-btn-harmonized:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .action-btn-harmonized.complete {
                color: #16a34a;
                border-color: transparent;
            }
            
            .action-btn-harmonized.complete:hover {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                border-color: #16a34a;
                color: #15803d;
            }
            
            .action-btn-harmonized.reply {
                color: #3b82f6;
                border-color: transparent;
            }
            
            .action-btn-harmonized.reply:hover {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
                color: #2563eb;
            }
            
            .action-btn-harmonized.details {
                color: #8b5cf6;
                border-color: transparent;
            }
            
            .action-btn-harmonized.details:hover {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border-color: #8b5cf6;
                color: #7c3aed;
            }

            /* ===== VUE GROUPÉE IDENTIQUE À LA VUE LISTE ===== */
            .tasks-grouped-harmonized {
                display: flex;
                flex-direction: column;
                gap: 0;
                background: transparent;
            }
            
            .task-group-harmonized {
                background: transparent;
                border: none;
                border-radius: 0;
                overflow: visible;
                box-shadow: none;
                margin: 0;
                padding: 0;
            }
            
            .group-header-harmonized {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: var(--border-width) solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                box-shadow: none;
                overflow: hidden;
                min-height: var(--card-height);
                max-height: var(--card-height);
                box-sizing: border-box;
                border-bottom: 1px solid #e5e7eb;
                gap: var(--gap-medium);
            }
            
            /* PREMIER ET DERNIER EN-TÊTE AVEC BORDURES ARRONDIES */
            .task-group-harmonized:first-child .group-header-harmonized {
                border-top-left-radius: var(--card-border-radius);
                border-top-right-radius: var(--card-border-radius);
                border-top: var(--border-width) solid #e5e7eb;
            }
            
            .task-group-harmonized:last-child .group-header-harmonized:not(.expanded-header) {
                border-bottom-left-radius: var(--card-border-radius);
                border-bottom-right-radius: var(--card-border-radius);
                border-bottom: var(--border-width) solid #e5e7eb;
            }
            
            .group-header-harmonized::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .group-header-harmonized:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 1;
            }
            
            .group-header-harmonized:hover::before {
                opacity: 1;
            }
            
            .task-group-harmonized.expanded .group-header-harmonized {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 2;
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
            }
            
            .group-avatar-harmonized {
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
                color: white;
                font-weight: 700;
                font-size: 12px;
                margin-right: var(--gap-medium);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            
            .group-info-harmonized {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: var(--gap-tiny);
                height: 100%;
            }
            
            .group-name-harmonized {
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
                text-align: left;
                display: flex;
                align-items: center;
            }
            
            .group-meta-harmonized {
                display: flex;
                align-items: center;
                gap: var(--gap-tiny);
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
            }
            
            .group-expand-harmonized {
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
                font-size: var(--action-btn-font-size);
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                flex-shrink: 0;
                text-align: center;
                margin-left: var(--gap-medium);
            }
            
            .group-expand-harmonized:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                color: #374151;
            }
            
            .task-group-harmonized.expanded .group-expand-harmonized {
                transform: rotate(180deg) translateY(-1px);
                color: #3b82f6;
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                border-color: #3b82f6;
            }
            
            .group-content-harmonized {
                background: transparent;
                margin: 0;
                padding: 0;
                display: none;
            }
            
            .task-group-harmonized.expanded .group-content-harmonized {
                display: block;
            }
            
            /* TÂCHES DANS LES GROUPES - IDENTIQUES À LA VUE LISTE */
            .group-content-harmonized .task-harmonized-card {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: var(--border-width) solid rgba(255, 255, 255, 0.2);
                border-radius: 0;
                padding: var(--card-padding);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                box-shadow: none;
                overflow: hidden;
                min-height: var(--card-height);
                max-height: var(--card-height);
                box-sizing: border-box;
                border-bottom: 1px solid #e5e7eb;
                margin: 0;
            }
            
            .group-content-harmonized .task-harmonized-card:last-child {
                border-bottom-left-radius: var(--card-border-radius);
                border-bottom-right-radius: var(--card-border-radius);
                border-bottom: var(--border-width) solid #e5e7eb;
            }
            
            .group-content-harmonized .task-harmonized-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .group-content-harmonized .task-harmonized-card:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                border-color: rgba(99, 102, 241, 0.2);
                border-left: 3px solid #6366f1;
                z-index: 1;
            }
            
            .group-content-harmonized .task-harmonized-card:hover::before {
                opacity: 1;
            }
            
            .group-content-harmonized .task-harmonized-card.selected {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #3b82f6;
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                z-index: 2;
            }
            
            .group-content-harmonized .task-harmonized-card.completed {
                opacity: 0.75;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 3px solid #22c55e;
            }
            
            /* ===== ÉTAT VIDE HARMONISÉ ET CENTRÉ ===== */
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
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .empty-state-title-harmonized {
                font-size: 22px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 12px;
                background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-align: center;
            }
            
            .empty-state-text-harmonized {
                font-size: 15px;
                margin-bottom: 24px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
                line-height: 1.6;
                color: #6b7280;
                font-weight: 500;
                text-align: center;
            }
            
            /* ===== CONTAINER PRINCIPAL ===== */
            .tasks-container-harmonized {
                background: transparent;
            }
            
            /* ===== FORMULAIRES HARMONISÉS ET CENTRÉS ===== */
            .form-group {
                margin-bottom: var(--gap-large);
            }
            
            .form-group label {
                display: block;
                margin-bottom: var(--gap-small);
                font-weight: 700;
                color: #374151;
                font-size: var(--input-font-size);
                text-align: left;
            }
            
            .form-input, .form-select, .form-textarea {
                width: 100%;
                height: var(--input-height);
                padding: var(--input-padding);
                border: 2px solid #e5e7eb;
                border-radius: var(--btn-border-radius);
                font-size: var(--input-font-size);
                background: white;
                transition: all 0.2s ease;
                font-weight: 500;
                color: #374151;
                box-sizing: border-box;
                text-align: left;
            }
            
            .form-textarea {
                height: auto;
                min-height: 80px;
                resize: vertical;
                font-family: inherit;
            }
            
            .form-input:focus, .form-select:focus, .form-textarea:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                background: #fafafa;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--gap-large);
            }
            
            /* ===== DÉTAILS DES TÂCHES HARMONISÉS ===== */
            .task-details-content {
                max-width: none;
            }
            
            .details-header {
                margin-bottom: 32px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f3f4f6;
                text-align: center;
            }
            
            .task-title-details {
                font-size: 28px;
                font-weight: 800;
                color: #1f2937;
                margin: 0 0 16px 0;
                line-height: 1.2;
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-align: center;
            }
            
            .task-meta-badges {
                display: flex;
                gap: var(--gap-large);
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
            }
            
            .priority-badge, .status-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-small);
                padding: var(--btn-padding);
                height: var(--btn-height);
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: 700;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border: 2px solid;
                box-sizing: border-box;
                text-align: center;
            }
            
            .priority-urgent {
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                color: #dc2626;
                border-color: #fecaca;
            }
            
            .priority-high {
                background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
                color: #d97706;
                border-color: #fde68a;
            }
            
            .priority-medium {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                color: #2563eb;
                border-color: #bfdbfe;
            }
            
            .priority-low {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                color: #16a34a;
                border-color: #bbf7d0;
            }
            
            .status-todo {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                color: #d97706;
                border-color: #f59e0b;
            }
            
            .status-in-progress {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                color: #2563eb;
                border-color: #3b82f6;
            }
            
            .status-completed {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                color: #16a34a;
                border-color: #22c55e;
            }
            
            .details-section {
                margin-bottom: 32px;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--card-border-radius);
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            }
            
            .details-section h3 {
                margin: 0;
                padding: 20px 24px;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border-bottom: 1px solid #e2e8f0;
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: var(--gap-medium);
                text-align: left;
            }
            
            .email-details-grid {
                padding: 20px 24px;
                display: flex;
                flex-direction: column;
                gap: var(--gap-large);
            }
            
            .email-detail-item {
                display: flex;
                gap: var(--gap-large);
                font-size: 15px;
                padding: 12px 16px;
                background: #f8fafc;
                border-radius: 10px;
                border: 1px solid #e2e8f0;
                align-items: center;
            }
            
            .email-detail-item strong {
                min-width: 100px;
                color: #374151;
                font-weight: 700;
                text-align: left;
            }
            
            .email-detail-item span {
                color: #4b5563;
                font-weight: 500;
                text-align: left;
                flex: 1;
            }
            
            .description-content {
                padding: 20px 24px;
            }
            
            .structured-description {
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                font-size: 14px;
                line-height: 1.6;
                background: #f8fafc;
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                color: #374151;
                text-align: left;
            }
            
            .simple-description {
                font-size: 15px;
                line-height: 1.7;
                color: #374151;
                font-weight: 500;
                text-align: left;
            }
            
            .actions-list-details {
                padding: 20px 24px;
                display: flex;
                flex-direction: column;
                gap: var(--gap-large);
            }
            
            .action-item-details {
                display: flex;
                align-items: center;
                gap: var(--gap-large);
                padding: 16px 20px;
                background: #f8fafc;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                transition: all 0.2s ease;
            }
            
            .action-item-details:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
            
            .action-number {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 700;
                flex-shrink: 0;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                text-align: center;
            }
            
            .action-text {
                flex: 1;
                font-size: 15px;
                color: #374151;
                font-weight: 600;
                text-align: left;
            }
            
            .action-deadline {
                font-size: 12px;
                color: #dc2626;
                font-weight: 700;
                background: #fef2f2;
                padding: 6px 12px;
                border-radius: 8px;
                border: 1px solid #fecaca;
                text-align: center;
            }
            
            .info-grid {
                padding: 20px 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .info-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                font-size: 15px;
                color: #374151;
                line-height: 1.5;
                padding: 12px 16px;
                background: #f8fafc;
                border-radius: 10px;
                border: 1px solid #e2e8f0;
                font-weight: 500;
            }
            
            .info-item i {
                color: #6366f1;
                margin-top: 2px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .info-item span {
                text-align: left;
                flex: 1;
            }
            
            .attention-section {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-color: #f59e0b;
            }
            
            .attention-section h3 {
                background: linear-gradient(135deg, #fef9e8 0%, #fef3c7 100%);
                border-bottom-color: #f59e0b;
                color: #92400e;
            }
            
            .attention-list {
                padding: 20px 24px;
                display: flex;
                flex-direction: column;
                gap: 14px;
            }
            
            .attention-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 12px;
                padding: 16px 20px;
                transition: all 0.2s ease;
            }
            
            .attention-item:hover {
                background: #fef9e8;
                border-color: #f59e0b;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
            }
            
            .attention-item i {
                font-size: 16px;
                color: #f59e0b;
                margin-top: 2px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .attention-item span {
                flex: 1;
                font-size: 14px;
                color: #92400e;
                line-height: 1.5;
                font-weight: 600;
                text-align: left;
            }
            
            /* ===== SUGGESTIONS DE RÉPONSE HARMONISÉES ===== */
            .suggested-replies-section {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-color: #0ea5e9;
            }
            
            .suggested-replies-section h3 {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-bottom-color: #0ea5e9;
                color: #075985;
            }
            
            .suggested-replies-container {
                padding: 20px 24px;
                display: flex;
                flex-direction: column;
                gap: var(--gap-large);
            }
            
            .suggested-reply-card-compact {
                background: white;
                border: 1px solid #bae6fd;
                border-radius: 12px;
                padding: var(--gap-large);
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
            }
            
            .suggested-reply-card-compact:hover {
                border-color: #0ea5e9;
                box-shadow: 0 4px 16px rgba(14, 165, 233, 0.15);
                transform: translateY(-1px);
            }
            
            .reply-header-compact {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .reply-tone-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-small);
                padding: var(--btn-padding);
                height: var(--btn-height);
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: 700;
                text-transform: capitalize;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                box-sizing: border-box;
                text-align: center;
            }
            
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
            
            .use-reply-btn-compact {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-small);
                padding: var(--btn-padding);
                height: var(--btn-height);
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                box-sizing: border-box;
                text-align: center;
            }
            
            .use-reply-btn-compact:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }
            
            .reply-preview {
                font-size: 13px;
                color: #374151;
                line-height: 1.5;
                background: #f8fafc;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                font-weight: 500;
                text-align: left;
            }
            
            .show-all-replies-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-small);
                padding: var(--btn-padding);
                height: var(--btn-height);
                background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                color: #475569;
                border: 2px solid #cbd5e1;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
                width: 100%;
                box-sizing: border-box;
            }
            
            .show-all-replies-btn:hover {
                background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
                border-color: #94a3b8;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(71, 85, 105, 0.15);
            }
            
            /* ===== CONTENU EMAIL HARMONISÉ ===== */
            .email-content-section {
                padding: 20px 24px;
            }
            
            .email-content-tabs {
                display: flex;
                gap: 6px;
                margin-bottom: 20px;
                background: #f3f4f6;
                padding: 6px;
                border-radius: 12px;
            }
            
            .tab-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-small);
                padding: var(--btn-padding);
                height: var(--btn-height);
                background: transparent;
                border: none;
                border-radius: var(--btn-border-radius);
                font-size: var(--btn-font-size);
                font-weight: 600;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s ease;
                flex: 1;
                box-sizing: border-box;
                text-align: center;
            }
            
            .tab-btn.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .tab-btn:hover:not(.active) {
                background: rgba(255, 255, 255, 0.5);
                color: #374151;
            }
            
            .email-content-box {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                max-height: 500px;
                overflow-y: auto;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            }
            
            .email-content-view {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.7;
                color: #374151;
                font-weight: 500;
                text-align: left;
            }
            
            .email-content-viewer {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.7;
                color: #333;
                text-align: left;
            }
            
            .email-original-content {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.7;
                color: #374151;
                white-space: pre-wrap;
                font-weight: 500;
                text-align: left;
            }
            
            .email-original-content strong {
                color: #1f2937;
                font-weight: 700;
            }
            
            /* ===== MODAL REPLIES HARMONISÉES ===== */
            .replies-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .reply-suggestion-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: var(--card-border-radius);
                padding: 20px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            }
            
            .reply-suggestion-card:hover {
                border-color: #6366f1;
                box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
                transform: translateY(-2px);
            }
            
            .reply-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--gap-large);
            }
            
            .reply-card-actions {
                display: flex;
                gap: 12px;
            }
            
            .btn-sm {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-small);
                padding: 8px 12px;
                height: 32px;
                border-radius: var(--btn-border-radius);
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid;
                box-sizing: border-box;
                text-align: center;
            }
            
            .btn-sm.btn-secondary {
                background: #f8fafc;
                color: #475569;
                border-color: #e2e8f0;
            }
            
            .btn-sm.btn-secondary:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
                transform: translateY(-1px);
            }
            
            .btn-sm.btn-primary {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border-color: transparent;
                box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
            }
            
            .btn-sm.btn-primary:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(59, 130, 246, 0.3);
            }
            
            .reply-subject-line {
                font-size: 14px;
                color: #4b5563;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e5e7eb;
                font-weight: 600;
                text-align: left;
            }
            
            .reply-content-preview {
                font-size: 14px;
                color: #374151;
                line-height: 1.6;
                white-space: pre-wrap;
                background: #f8fafc;
                padding: var(--gap-large);
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                max-height: 200px;
                overflow-y: auto;
                font-weight: 500;
                text-align: left;
            }
            
            /* ===== RESPONSIVE AVEC LIGNE D'AIDE ADAPTATIFS ===== */
            @media (max-width: 1200px) {
                :root {
                    --btn-height: 42px;
                    --card-height: 84px;
                    --action-btn-size: 34px;
                }
                
                .help-line-tasks {
                    padding: 14px 18px;
                    margin-bottom: 14px;
                    gap: 14px;
                }
                
                .help-icon-tasks {
                    width: 36px;
                    height: 36px;
                    font-size: 18px;
                }
                
                .help-main-text-tasks {
                    font-size: 13px;
                }
                
                .help-close-tasks {
                    width: 30px;
                    height: 30px;
                    font-size: 11px;
                }
                
                .status-filters-harmonized .status-pill-harmonized {
                    height: 44px;
                    min-height: 44px;
                    max-height: 44px;
                    font-size: 13px;
                    flex: 1;
                    min-width: 0;
                }
                
                .controls-bar-harmonized {
                    gap: var(--gap-medium);
                }
                
                .search-section-harmonized {
                    flex: 0 0 250px;
                }
                
                .view-mode-harmonized {
                    min-width: 100px;
                }
                
                /* MAINTENIR l'harmonisation sur tablette */
                .action-buttons-harmonized > *,
                .view-modes-harmonized .view-mode-harmonized {
                    height: var(--btn-height);
                    min-height: var(--btn-height);
                    max-height: var(--btn-height);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
            
            @media (max-width: 1024px) {
                :root {
                    --btn-height: 40px;
                    --card-height: 80px;
                    --action-btn-size: 32px;
                    --gap-small: 6px;
                    --gap-medium: 10px;
                    --gap-large: 14px;
                }
                
                .help-line-tasks {
                    padding: 12px 16px;
                    margin-bottom: 12px;
                    gap: 12px;
                    flex-direction: column;
                    text-align: center;
                }
                
                .help-content-tasks {
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;
                }
                
                .help-icon-tasks {
                    width: 32px;
                    height: 32px;
                    font-size: 16px;
                    align-self: center;
                }
                
                .help-main-text-tasks {
                    font-size: 12px;
                    text-align: center;
                }
                
                .help-close-tasks {
                    width: 28px;
                    height: 28px;
                    font-size: 10px;
                    align-self: center;
                }
                
                .status-filters-harmonized .status-pill-harmonized {
                    height: 40px;
                    min-height: 40px;
                    max-height: 40px;
                    font-size: 12px;
                    flex: 1;
                    min-width: 0;
                    padding: 0 12px;
                }
                
                .controls-bar-harmonized {
                    flex-direction: column;
                    gap: var(--gap-medium);
                    align-items: stretch;
                    padding: var(--gap-large);
                }
                
                .search-section-harmonized {
                    flex: none;
                    width: 100%;
                    order: 1;
                    height: var(--btn-height);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .view-modes-harmonized {
                    width: 100%;
                    justify-content: space-around;
                    order: 2;
                    height: var(--btn-height);
                    display: flex;
                    align-items: center;
                }
                
                .action-buttons-harmonized {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    order: 3;
                    height: auto;
                    min-height: var(--btn-height);
                    display: flex;
                    align-items: center;
                }
                
                .view-mode-harmonized {
                    flex: 1;
                    min-width: 80px;
                    height: calc(var(--btn-height) - var(--gap-small));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .status-filters-harmonized {
                    justify-content: center;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .advanced-filters-grid {
                    grid-template-columns: 1fr;
                }
                
                /* FORCER l'harmonisation sur tablette */
                .action-buttons-harmonized > * {
                    height: var(--btn-height) !important;
                    min-height: var(--btn-height) !important;
                    max-height: var(--btn-height) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
            }
            
            @media (max-width: 768px) {
                :root {
                    --btn-height: 38px;
                    --btn-padding-horizontal: 14px;
                    --btn-font-size: 12px;
                    --card-height: 76px;
                    --card-padding: 12px;
                    --action-btn-size: 30px;
                    --action-btn-font-size: 12px;
                }
                
                .help-line-tasks {
                    padding: 10px 14px;
                    margin-bottom: 10px;
                    gap: 10px;
                    border-radius: 10px;
                }
                
                .help-icon-tasks {
                    width: 28px;
                    height: 28px;
                    font-size: 14px;
                }
                
                .help-main-text-tasks {
                    font-size: 11px;
                    line-height: 1.4;
                }
                
                .help-close-tasks {
                    width: 24px;
                    height: 24px;
                    font-size: 9px;
                }
                
                .status-filters-harmonized {
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .status-filters-harmonized .status-pill-harmonized {
                    height: 36px;
                    min-height: 36px;
                    max-height: 36px;
                    font-size: 11px;
                    flex: 1 1 calc(50% - 4px);
                    min-width: 0;
                    padding: 0 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                
                .view-mode-harmonized span,
                .btn-harmonized span {
                    display: none;
                }
                
                .view-mode-harmonized {
                    min-width: 38px;
                    padding: 0 var(--gap-small);
                    height: calc(var(--btn-height) - var(--gap-small));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                
                .pill-text-harmonized {
                    display: none;
                }
                
                .task-header-harmonized {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: var(--gap-tiny);
                    margin-bottom: var(--gap-small);
                }
                
                .task-title-harmonized {
                    font-size: 13px;
                    white-space: normal;
                    line-height: 1.4;
                    max-height: 2.8em;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    text-align: left;
                }
                
                .task-meta-harmonized {
                    width: 100%;
                    justify-content: space-between;
                    display: flex;
                    align-items: center;
                }
                
                .priority-bar-harmonized {
                    height: 44px;
                    margin-right: var(--gap-small);
                }
                
                .task-actions-harmonized {
                    margin-left: var(--gap-small);
                    gap: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* FORCER l'harmonisation sur mobile */
                .action-buttons-harmonized > * {
                    height: var(--btn-height) !important;
                    min-height: var(--btn-height) !important;
                    max-height: var(--btn-height) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-align: center !important;
                }
            }
            
            @media (max-width: 480px) {
                :root {
                    --btn-height: 36px;
                    --btn-padding-horizontal: 12px;
                    --btn-font-size: 11px;
                    --card-height: 72px;
                    --card-padding: 10px;
                    --action-btn-size: 28px;
                    --action-btn-font-size: 11px;
                    --gap-tiny: 2px;
                    --gap-small: 4px;
                    --gap-medium: 8px;
                    --gap-large: 12px;
                }
                
                .help-line-tasks {
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    gap: 8px;
                    border-radius: 8px;
                }
                
                .help-icon-tasks {
                    width: 24px;
                    height: 24px;
                    font-size: 12px;
                }
                
                .help-main-text-tasks {
                    font-size: 10px;
                    line-height: 1.3;
                }
                
                .help-close-tasks {
                    width: 20px;
                    height: 20px;
                    font-size: 8px;
                }
                
                .status-filters-harmonized .status-pill-harmonized {
                    height: 32px;
                    min-height: 32px;
                    max-height: 32px;
                    font-size: 10px;
                    flex: 1 1 calc(50% - 2px);
                    min-width: 0;
                    padding: 0 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                
                .tasks-page-modern {
                    padding: var(--gap-medium);
                }
                
                .controls-bar-harmonized {
                    padding: var(--gap-medium);
                }
                
                .task-title-harmonized {
                    font-size: 12px;
                    text-align: left;
                }
                
                .task-type-badge-harmonized {
                    font-size: 9px;
                    padding: 3px 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                
                .deadline-badge-harmonized {
                    font-size: 8px;
                    padding: 3px 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                
                .task-recipient-harmonized {
                    font-size: 10px;
                }
                
                .priority-bar-harmonized {
                    width: 3px;
                    height: 36px;
                    margin-right: var(--gap-small);
                }
                
                .task-checkbox-harmonized {
                    width: 16px;
                    height: 16px;
                    margin-right: var(--gap-small);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .pill-count-harmonized {
                    padding: 2px 4px;
                    font-size: 9px;
                    min-width: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                
                .search-clear-harmonized {
                    width: 24px;
                    height: 24px;
                    font-size: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* FORCER l'harmonisation sur petit mobile */
                .action-buttons-harmonized > *,
                .view-modes-harmonized .view-mode-harmonized {
                    height: var(--btn-height) !important;
                    min-height: var(--btn-height) !important;
                    max-height: var(--btn-height) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-align: center !important;
                }
                
                .view-mode-harmonized {
                    height: calc(var(--btn-height) - var(--gap-small)) !important;
                }
            }
            
            @media (max-width: 360px) {
                :root {
                    --btn-height: 34px;
                    --card-height: 68px;
                    --action-btn-size: 26px;
                }
                
                .help-line-tasks {
                    padding: 6px 10px;
                    margin-bottom: 6px;
                    gap: 6px;
                    border-radius: 6px;
                }
                
                .help-icon-tasks {
                    width: 20px;
                    height: 20px;
                    font-size: 10px;
                }
                
                .help-main-text-tasks {
                    font-size: 9px;
                    line-height: 1.2;
                }
                
                .help-close-tasks {
                    width: 18px;
                    height: 18px;
                    font-size: 7px;
                }
                
                .status-filters-harmonized .status-pill-harmonized {
                    height: 30px;
                    min-height: 30px;
                    max-height: 30px;
                    font-size: 9px;
                    flex: 1 1 calc(33.33% - 3px);
                    min-width: 0;
                    padding: 0 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                
                .view-modes-harmonized {
                    gap: 1px;
                }
                
                .view-mode-harmonized {
                    min-width: 34px;
                    padding: 0 4px;
                    height: calc(var(--btn-height) - var(--gap-small)) !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                
                .status-filters-harmonized {
                    gap: 4px;
                    justify-content: center;
                }
                
                .action-buttons-harmonized {
                    gap: 4px;
                    justify-content: center;
                }
                
                /* FORCER l'harmonisation sur très petit écran */
                .action-buttons-harmonized > * {
                    height: var(--btn-height) !important;
                    min-height: var(--btn-height) !important;
                    max-height: var(--btn-height) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-align: center !important;
                }
            }
            
            /* ===== ANIMATIONS ===== */
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
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .task-harmonized-card {
                animation: fadeInUp 0.3s ease-out;
            }
            
            .help-line-tasks {
                animation: fadeInUp 0.4s ease-out;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION
// =====================================

function initializeTaskManager() {
    console.log('[TaskManager] Initializing global instances v9.1...');
    
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
    
    console.log('✅ TaskManager v9.1 loaded - Interface harmonisée avec ligne explicative');
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
