// TaskManager Pro v8.5 - Interface épurée avec vue sur une ligne

// =====================================
// ENHANCED TASK MANAGER CLASS - INCHANGÉ
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
            console.log('[TaskManager] Initializing v8.5 - Interface épurée...');
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
                description: '📧 RÉSUMÉ EXÉCUTIF\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDe: Sarah Martin (acme-corp.com)\nObjet: Demande de validation pour la campagne marketing Q2\n📮 Réponse attendue',
                priority: 'high',
                status: 'todo',
                category: 'email',
                hasEmail: true,
                emailFrom: 'sarah.martin@acme-corp.com',
                emailFromName: 'Sarah Martin',
                emailSubject: 'Validation campagne marketing Q2',
                emailDate: '2025-06-06T09:15:00Z',
                emailDomain: 'acme-corp.com',
                emailContent: 'Email complet...',
                emailHtmlContent: '<div>Contenu HTML...</div>',
                tags: ['marketing', 'validation', 'q2'],
                client: 'ACME Corp',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                needsReply: true,
                dueDate: '2025-06-08',
                summary: 'Validation urgente de la campagne marketing Q2 avec budget de 50k€',
                actions: [
                    { text: 'Valider les visuels de la campagne', deadline: null },
                    { text: 'Confirmer le budget alloué', deadline: '2025-06-07' }
                ],
                keyInfo: ['Budget proposé : 50k€', 'Cible : 25-45 ans'],
                risks: ['Deadline serrée pour le lancement'],
                suggestedReplies: [],
                method: 'ai'
            },
            {
                id: 'sample_2',
                title: 'Révision contrat prestataire',
                description: 'Relecture du contrat avec le nouveau prestataire IT',
                priority: 'medium',
                status: 'in-progress',
                category: 'work',
                hasEmail: false,
                client: 'Interne',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date().toISOString(),
                dueDate: '2025-06-10',
                method: 'manual'
            },
            {
                id: 'sample_3',
                title: 'Réunion équipe produit',
                description: 'Point hebdomadaire sur l\'avancement des projets',
                priority: 'low',
                status: 'completed',
                category: 'meeting',
                hasEmail: false,
                client: 'Équipe Produit',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                method: 'manual'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    // MÉTHODE PRINCIPALE POUR CRÉER UNE TÂCHE À PARTIR D'UN EMAIL - INCHANGÉE
    async createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email with AI-powered reply suggestions:', taskData.title);
        
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
        
        console.log('[TaskManager] Task created successfully with AI reply suggestions:', {
            id: task.id,
            hasEmailContent: !!task.emailContent,
            hasHtmlContent: !!task.emailHtmlContent,
            contentLength: task.emailContent?.length || 0,
            htmlContentLength: task.emailHtmlContent?.length || 0,
            hasActions: task.actions?.length || 0,
            hasKeyInfo: task.keyInfo?.length || 0,
            hasRisks: task.risks?.length || 0,
            hasSuggestedReplies: task.suggestedReplies?.length || 0,
            aiRepliesGenerated: task.aiRepliesGenerated
        });
        
        return task;
    }

    // TOUTES LES AUTRES MÉTHODES RESTENT IDENTIQUES...
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
// NOUVELLE VUE ÉPURÉE - UNE LIGNE PAR TÂCHE
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
        this.currentViewMode = 'clean';
        this.showCompleted = false;
        this.showAdvancedFilters = false;
        
        window.addEventListener('taskUpdate', () => {
            this.refreshView();
        });
    }

    // INTERFACE ÉPURÉE PRINCIPALE
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
        
        container.innerHTML = `
            <div class="tasks-page-clean">
                <!-- En-tête simplifié -->
                <div class="tasks-header-clean">
                    <div class="header-left">
                        <h1 class="tasks-title-clean">📋 Tâches</h1>
                        <span class="tasks-count-clean">${stats.total}</span>
                    </div>
                    
                    <div class="header-center">
                        <div class="search-wrapper-clean">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   class="search-input-clean" 
                                   id="taskSearchInput"
                                   placeholder="Rechercher..." 
                                   value="${this.currentFilters.search}">
                            ${this.currentFilters.search ? `
                                <button class="search-clear-clean" onclick="window.tasksView.clearSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="header-right">
                        <button class="btn-clean btn-primary-clean" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            Nouvelle
                        </button>
                    </div>
                </div>

                <!-- Filtres rapides -->
                <div class="quick-filters-clean">
                    ${this.buildQuickFilters(stats)}
                    <button class="btn-clean filters-toggle ${this.showAdvancedFilters ? 'active' : ''}" 
                            onclick="window.tasksView.toggleAdvancedFilters()">
                        <i class="fas fa-filter"></i>
                        Filtres
                        <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                    </button>
                </div>

                <!-- Filtres avancés -->
                <div class="advanced-filters-clean ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFiltersPanel">
                    <div class="filters-grid-clean">
                        <select class="filter-select-clean" id="priorityFilter" 
                                onchange="window.tasksView.updateFilter('priority', this.value)">
                            <option value="all">Toutes priorités</option>
                            <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>🚨 Urgente</option>
                            <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>⚡ Haute</option>
                            <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>📌 Normale</option>
                            <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>📄 Basse</option>
                        </select>

                        <select class="filter-select-clean" id="clientFilter" 
                                onchange="window.tasksView.updateFilter('client', this.value)">
                            ${this.buildClientFilterOptions()}
                        </select>

                        <select class="filter-select-clean" id="sortByFilter" 
                                onchange="window.tasksView.updateFilter('sortBy', this.value)">
                            <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Plus récentes</option>
                            <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Par priorité</option>
                            <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Par échéance</option>
                            <option value="sender" ${this.currentFilters.sortBy === 'sender' ? 'selected' : ''}>Par expéditeur</option>
                        </select>

                        <button class="btn-clean btn-secondary-clean" onclick="window.tasksView.resetAllFilters()">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                    </div>
                </div>

                <!-- Liste des tâches épurée -->
                <div class="tasks-list-clean" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addCleanStyles();
        this.setupEventListeners();
        console.log('[TasksView] Clean interface rendered');
    }

    // FILTRES RAPIDES COLORÉS
    buildQuickFilters(stats) {
        const filters = [
            { id: 'all', name: 'Toutes', icon: '📋', count: stats.total, color: 'gray' },
            { id: 'todo', name: 'À faire', icon: '⏳', count: stats.todo, color: 'blue' },
            { id: 'in-progress', name: 'En cours', icon: '🔄', count: stats.inProgress, color: 'orange' },
            { id: 'overdue', name: 'En retard', icon: '⚠️', count: stats.overdue, color: 'red' },
            { id: 'needsReply', name: 'À répondre', icon: '📧', count: stats.needsReply, color: 'purple' },
            { id: 'completed', name: 'Terminées', icon: '✅', count: stats.completed, color: 'green' }
        ];

        return filters.map(filter => `
            <button class="filter-pill-clean ${this.isFilterActive(filter.id) ? 'active' : ''} ${filter.color}" 
                    data-filter="${filter.id}"
                    onclick="window.tasksView.quickFilter('${filter.id}')">
                <span class="pill-icon">${filter.icon}</span>
                <span class="pill-text">${filter.name}</span>
                <span class="pill-count">${filter.count}</span>
            </button>
        `).join('');
    }

    // RENDU DE LA LISTE ÉPURÉE
    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        const filteredTasks = this.showCompleted ? tasks : tasks.filter(task => task.status !== 'completed');
        
        if (filteredTasks.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <div class="tasks-clean-container">
                <div class="tasks-table-header">
                    <div class="col-sender">Destinataire</div>
                    <div class="col-title">Titre</div>
                    <div class="col-deadline">Échéance</div>
                    <div class="col-type">Type</div>
                    <div class="col-actions">Actions</div>
                </div>
                ${filteredTasks.map(task => this.renderCleanTaskRow(task)).join('')}
            </div>
        `;
    }

    // LIGNE DE TÂCHE ÉPURÉE
    renderCleanTaskRow(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        
        // Destinataire
        const recipient = task.hasEmail ? 
            (task.emailFromName || task.emailFrom || 'Email') : 
            (task.client || 'Interne');
            
        // Échéance
        const deadline = this.formatDueDate(task.dueDate);
        
        // Type de tâche avec couleur
        const taskType = this.getTaskType(task);
        
        // Priorité avec couleur
        const priority = this.getPriorityInfo(task.priority);
        
        return `
            <div class="task-row-clean ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <div class="task-checkbox-wrapper">
                    <input type="checkbox" 
                           class="task-checkbox-clean" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                </div>
                
                <!-- Indicateur de priorité -->
                <div class="priority-bar priority-${task.priority}"></div>
                
                <!-- Destinataire/Client -->
                <div class="col-sender">
                    <div class="sender-info">
                        <div class="sender-name">${this.escapeHtml(recipient)}</div>
                        ${task.hasEmail ? `
                            <div class="sender-domain">@${task.emailDomain || 'email'}</div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Titre avec statut -->
                <div class="col-title">
                    <div class="title-wrapper">
                        <span class="status-dot status-${task.status}"></span>
                        <span class="task-title">${this.escapeHtml(task.title)}</span>
                        ${task.needsReply ? '<span class="reply-indicator">📧</span>' : ''}
                        ${task.aiRepliesGenerated ? '<span class="ai-indicator">🤖</span>' : ''}
                    </div>
                </div>
                
                <!-- Échéance -->
                <div class="col-deadline">
                    ${deadline.html}
                </div>
                
                <!-- Type de tâche -->
                <div class="col-type">
                    <span class="task-type-badge ${taskType.class}">
                        ${taskType.icon} ${taskType.name}
                    </span>
                </div>
                
                <!-- Actions rapides -->
                <div class="col-actions">
                    <div class="task-actions-clean">
                        ${this.renderQuickActions(task)}
                    </div>
                </div>
            </div>
        `;
    }

    // ACTIONS RAPIDES SIMPLIFIÉES
    renderQuickActions(task) {
        const actions = [];
        
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-clean complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        if (task.hasEmail && !task.emailReplied) {
            actions.push(`
                <button class="action-btn-clean reply" 
                        onclick="event.stopPropagation(); window.tasksView.replyToEmailWithAI('${task.id}')"
                        title="Répondre">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn-clean view" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // ÉTAT VIDE SIMPLIFIÉ
    renderEmptyState() {
        return `
            <div class="empty-state-clean">
                <div class="empty-icon">📭</div>
                <h3>Aucune tâche</h3>
                <p>${this.hasActiveFilters() ? 'Aucune tâche ne correspond à vos critères' : 'Vous n\'avez aucune tâche'}</p>
                ${this.hasActiveFilters() ? `
                    <button class="btn-clean btn-primary-clean" onclick="window.tasksView.resetAllFilters()">
                        <i class="fas fa-undo"></i> Réinitialiser
                    </button>
                ` : `
                    <button class="btn-clean btn-primary-clean" onclick="window.tasksView.showCreateModal()">
                        <i class="fas fa-plus"></i> Créer une tâche
                    </button>
                `}
            </div>
        `;
    }

    // UTILITAIRES POUR AFFICHAGE
    getTaskType(task) {
        if (task.hasEmail) {
            return { icon: '📧', name: 'Email', class: 'email' };
        }
        
        switch (task.category) {
            case 'meeting':
                return { icon: '🤝', name: 'Réunion', class: 'meeting' };
            case 'work':
                return { icon: '💼', name: 'Travail', class: 'work' };
            case 'personal':
                return { icon: '👤', name: 'Personnel', class: 'personal' };
            default:
                return { icon: '📝', name: 'Tâche', class: 'task' };
        }
    }

    getPriorityInfo(priority) {
        const priorities = {
            urgent: { icon: '🚨', name: 'Urgente', class: 'urgent' },
            high: { icon: '⚡', name: 'Haute', class: 'high' },
            medium: { icon: '📌', name: 'Normale', class: 'medium' },
            low: { icon: '📄', name: 'Basse', class: 'low' }
        };
        return priorities[priority] || priorities.medium;
    }

    formatDueDate(dateString) {
        if (!dateString) {
            return { html: '<span class="no-deadline">-</span>', text: '' };
        }
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        let className = 'deadline-normal';
        let text = '';
        
        if (diffDays < 0) {
            className = 'deadline-overdue';
            text = `Retard ${Math.abs(diffDays)}j`;
        } else if (diffDays === 0) {
            className = 'deadline-today';
            text = 'Aujourd\'hui';
        } else if (diffDays === 1) {
            className = 'deadline-tomorrow';
            text = 'Demain';
        } else if (diffDays <= 7) {
            className = 'deadline-soon';
            text = `${diffDays}j`;
        } else {
            text = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
        
        return {
            html: `<span class="deadline-badge ${className}">${text}</span>`,
            text: text
        };
    }

    // MÉTHODES D'INTERACTION SIMPLIFIÉES
    handleTaskClick(event, taskId) {
        this.showTaskDetails(taskId);
    }

    quickFilter(filterId) {
        // Reset tous les filtres sauf la recherche
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            client: 'all',
            tag: 'all',
            search: this.currentFilters.search,
            sortBy: this.currentFilters.sortBy,
            dateRange: 'all',
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

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.updateSelectionUI();
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche terminée', 'success');
    }

    // MÉTHODES RÉUTILISÉES DES FONCTIONNALITÉS AVANCÉES
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

    showTaskDetails(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        const uniqueId = 'task_details_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay-clean">
                <div class="modal-content-clean">
                    <div class="modal-header-clean">
                        <h2><i class="fas fa-tasks"></i> Détails de la tâche</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                class="modal-close-clean">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body-clean">
                        ${this.buildTaskDetailsContent(task)}
                    </div>
                    <div class="modal-footer-clean">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                class="btn-clean btn-secondary-clean">
                            Fermer
                        </button>
                        ${task.hasEmail && task.suggestedReplies && task.suggestedReplies.length > 0 ? `
                            <button onclick="window.tasksView.showSuggestedReplies('${task.id}');"
                                    class="btn-clean btn-primary-clean">
                                <i class="fas fa-reply"></i> Suggestions de réponse
                            </button>
                        ` : ''}
                        ${task.status !== 'completed' ? `
                            <button onclick="window.tasksView.markComplete('${task.id}'); document.getElementById('${uniqueId}').remove();"
                                    class="btn-clean btn-success-clean">
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
        const priority = this.getPriorityInfo(task.priority);
        const deadline = this.formatDueDate(task.dueDate);
        
        return `
            <div class="task-details-clean">
                <div class="details-header-clean">
                    <h1>${this.escapeHtml(task.title)}</h1>
                    <div class="details-meta-clean">
                        <span class="priority-badge priority-${task.priority}">
                            ${priority.icon} ${priority.name}
                        </span>
                        <span class="status-badge status-${task.status}">
                            ${this.getStatusIcon(task.status)} ${this.getStatusLabel(task.status)}
                        </span>
                        ${deadline.html}
                    </div>
                </div>

                ${task.hasEmail ? `
                    <div class="details-section-clean">
                        <h3><i class="fas fa-envelope"></i> Email</h3>
                        <div class="email-info-clean">
                            <div><strong>De:</strong> ${this.escapeHtml(task.emailFromName || task.emailFrom || 'Inconnu')}</div>
                            ${task.emailFrom ? `<div><strong>Email:</strong> ${this.escapeHtml(task.emailFrom)}</div>` : ''}
                            ${task.emailSubject ? `<div><strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject)}</div>` : ''}
                        </div>
                    </div>
                ` : ''}

                ${task.description && task.description !== task.title ? `
                    <div class="details-section-clean">
                        <h3><i class="fas fa-align-left"></i> Description</h3>
                        <div class="description-clean">
                            ${this.formatDescription(task.description)}
                        </div>
                    </div>
                ` : ''}

                ${task.actions && task.actions.length > 0 ? `
                    <div class="details-section-clean">
                        <h3><i class="fas fa-tasks"></i> Actions requises</h3>
                        <div class="actions-clean">
                            ${task.actions.map((action, idx) => `
                                <div class="action-item-clean">
                                    <span class="action-number">${idx + 1}</span>
                                    <span>${this.escapeHtml(action.text)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.keyInfo && task.keyInfo.length > 0 ? `
                    <div class="details-section-clean">
                        <h3><i class="fas fa-info-circle"></i> Informations clés</h3>
                        <div class="info-clean">
                            ${task.keyInfo.map(info => `
                                <div class="info-item-clean">• ${this.escapeHtml(info)}</div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${task.emailContent && task.emailContent.length > 100 ? `
                    <div class="details-section-clean">
                        <h3><i class="fas fa-envelope-open"></i> Contenu de l'email</h3>
                        <div class="email-content-clean">
                            ${this.formatEmailContent(task.emailContent)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showSuggestedReplies(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.suggestedReplies || task.suggestedReplies.length === 0) return;

        const uniqueId = 'replies_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay-clean">
                <div class="modal-content-clean large">
                    <div class="modal-header-clean">
                        <h2><i class="fas fa-reply-all"></i> Suggestions de réponse</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                class="modal-close-clean">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body-clean">
                        <div class="ai-info-clean">
                            <div class="ai-badge-clean">
                                <i class="fas fa-robot"></i>
                                Généré par Claude AI
                            </div>
                            <p>Suggestions personnalisées pour <strong>${task.emailFromName || 'l\'expéditeur'}</strong></p>
                        </div>
                        
                        <div class="replies-grid-clean">
                            ${task.suggestedReplies.map((reply, idx) => `
                                <div class="reply-card-clean">
                                    <div class="reply-header-clean">
                                        <span class="reply-tone-clean ${reply.tone}">
                                            ${this.getReplyToneIcon(reply.tone)} ${this.getReplyToneLabel(reply.tone)}
                                        </span>
                                        <div class="reply-actions-clean">
                                            <button class="btn-clean btn-small-clean" onclick="window.tasksView.copyReplyToClipboard(${idx}, '${taskId}')">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                            <button class="btn-clean btn-primary-clean btn-small-clean" onclick="window.tasksView.useReply('${taskId}', ${idx})">
                                                <i class="fas fa-paper-plane"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="reply-subject-clean">
                                        <strong>Sujet:</strong> ${this.escapeHtml(reply.subject)}
                                    </div>
                                    <div class="reply-content-clean">
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
            this.showToast('Réponse copiée !', 'success');
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
        
        this.showToast('Email de réponse ouvert', 'success');
        
        document.querySelectorAll('[id^="replies_modal_"], [id^="task_details_modal_"]').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
    }

    showCreateModal() {
        const uniqueId = 'create_task_modal_' + Date.now();
        
        const modalHTML = `
            <div id="${uniqueId}" class="modal-overlay-clean">
                <div class="modal-content-clean">
                    <div class="modal-header-clean">
                        <h2><i class="fas fa-plus"></i> Nouvelle tâche</h2>
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                class="modal-close-clean">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body-clean">
                        <div class="form-clean">
                            <div class="form-group-clean">
                                <label>Titre *</label>
                                <input type="text" id="new-task-title" class="form-input-clean" placeholder="Titre de la tâche" />
                            </div>
                            
                            <div class="form-group-clean">
                                <label>Description</label>
                                <textarea id="new-task-description" class="form-textarea-clean" rows="3" placeholder="Description..."></textarea>
                            </div>
                            
                            <div class="form-row-clean">
                                <div class="form-group-clean">
                                    <label>Priorité</label>
                                    <select id="new-task-priority" class="form-select-clean">
                                        <option value="low">📄 Basse</option>
                                        <option value="medium" selected>📌 Normale</option>
                                        <option value="high">⚡ Haute</option>
                                        <option value="urgent">🚨 Urgente</option>
                                    </select>
                                </div>
                                <div class="form-group-clean">
                                    <label>Échéance</label>
                                    <input type="date" id="new-task-duedate" class="form-input-clean" />
                                </div>
                            </div>
                            
                            <div class="form-group-clean">
                                <label>Client/Projet</label>
                                <input type="text" id="new-task-client" class="form-input-clean" placeholder="Client ou projet" value="Interne" />
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer-clean">
                        <button onclick="document.getElementById('${uniqueId}').remove(); document.body.style.overflow = 'auto';"
                                class="btn-clean btn-secondary-clean">
                            Annuler
                        </button>
                        <button onclick="window.tasksView.createNewTask('${uniqueId}');"
                                class="btn-clean btn-primary-clean">
                            <i class="fas fa-plus"></i> Créer
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
            method: 'manual'
        };

        try {
            const task = window.taskManager.createTask(taskData);
            document.getElementById(modalId).remove();
            document.body.style.overflow = 'auto';
            
            this.showToast('Tâche créée !', 'success');
            this.refreshView();
        } catch (error) {
            console.error('[TasksView] Error creating task:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    // UTILITAIRES
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

    buildClientFilterOptions() {
        const tasks = window.taskManager.getAllTasks();
        const clients = new Set();
        
        tasks.forEach(task => {
            if (task.client) {
                clients.add(task.client);
            }
        });
        
        let options = `<option value="all">Tous les clients</option>`;
        
        Array.from(clients).sort().forEach(client => {
            const count = tasks.filter(t => t.client === client).length;
            options += `<option value="${client}" ${this.currentFilters.client === client ? 'selected' : ''}>${client} (${count})</option>`;
        });
        
        return options;
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
            tag: 'all',
            search: '',
            sortBy: 'created',
            dateRange: 'all',
            overdue: false,
            needsReply: false
        };
        
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        document.querySelectorAll('.filter-select-clean').forEach(select => {
            if (select.querySelector('option[value="all"]')) {
                select.value = 'all';
            } else if (select.id === 'sortByFilter') {
                select.value = 'created';
            }
        });
        
        this.refreshView();
        this.showToast('Filtres réinitialisés', 'info');
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
        document.querySelectorAll('.quick-filters-clean').forEach(container => {
            container.innerHTML = this.buildQuickFilters(stats);
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

    // Utilitaires réutilisés
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
               this.currentFilters.client !== 'all' ||
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply;
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
            formel: '👔', informel: '😊', urgent: '🚨', 
            neutre: '📝', amical: '🤝', professionnel: '💼', 'détaillé': '📋'
        };
        return icons[tone] || '📝';
    }

    getReplyToneLabel(tone) {
        const labels = {
            formel: 'Formel', informel: 'Informel', urgent: 'Urgent', 
            neutre: 'Neutre', amical: 'Amical', professionnel: 'Professionnel', 'détaillé': 'Détaillé'
        };
        return labels[tone] || 'Neutre';
    }

    formatDescription(description) {
        if (!description) return '';
        
        if (description.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
            return `<div class="structured-desc">${description.replace(/\n/g, '<br>')}</div>`;
        } else {
            return `<div class="simple-desc">${this.escapeHtml(description).replace(/\n/g, '<br>')}</div>`;
        }
    }

    formatEmailContent(content) {
        if (!content) return '<p>Contenu non disponible</p>';
        
        const formattedContent = content
            .replace(/\n/g, '<br>')
            .replace(/Email de:/g, '<strong>Email de:</strong>')
            .replace(/Date:/g, '<strong>Date:</strong>')
            .replace(/Sujet:/g, '<strong>Sujet:</strong>');
            
        return `<div class="email-original">${formattedContent}</div>`;
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
            // Créer un toast simple
            const toast = document.createElement('div');
            toast.className = `toast-clean toast-${type}`;
            toast.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
                ${message}
            `;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 999999;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }

    // STYLES ÉPURÉS ET COLORÉS
    addCleanStyles() {
        if (document.getElementById('cleanTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'cleanTaskStyles';
        styles.textContent = `
            /* INTERFACE ÉPURÉE TASKMANAGER */
            .tasks-page-clean {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            /* EN-TÊTE */
            .tasks-header-clean {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
                background: white;
                padding: 20px 24px;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .header-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .tasks-title-clean {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .tasks-count-clean {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 700;
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .header-center {
                flex: 1;
                max-width: 400px;
                margin: 0 20px;
            }
            
            .search-wrapper-clean {
                position: relative;
                width: 100%;
            }
            
            .search-wrapper-clean i {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                font-size: 16px;
            }
            
            .search-input-clean {
                width: 100%;
                padding: 14px 20px 14px 48px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 15px;
                background: white;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .search-input-clean:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
                transform: translateY(-1px);
            }
            
            .search-clear-clean {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: #f3f4f6;
                border: none;
                border-radius: 6px;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #6b7280;
                transition: all 0.2s ease;
            }
            
            .search-clear-clean:hover {
                background: #e5e7eb;
                transform: translateY(-50%) scale(1.1);
            }
            
            /* BOUTONS */
            .btn-clean {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                border: none;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .btn-clean:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            }
            
            .btn-primary-clean {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
            }
            
            .btn-primary-clean:hover {
                background: linear-gradient(135deg, #5a67d8, #6c5ce7);
            }
            
            .btn-secondary-clean {
                background: white;
                color: #374151;
                border: 2px solid #e5e7eb;
            }
            
            .btn-secondary-clean:hover {
                background: #f9fafb;
                border-color: #d1d5db;
            }
            
            .btn-success-clean {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
            }
            
            .btn-small-clean {
                padding: 6px 12px;
                font-size: 12px;
            }
            
            /* FILTRES RAPIDES */
            .quick-filters-clean {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                margin-bottom: 20px;
                align-items: center;
            }
            
            .filter-pill-clean {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                border: 2px solid transparent;
                border-radius: 25px;
                background: white;
                color: #374151;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            
            .filter-pill-clean:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            }
            
            .filter-pill-clean.active {
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            }
            
            /* Couleurs des filtres */
            .filter-pill-clean.gray.active { background: linear-gradient(135deg, #6b7280, #4b5563); }
            .filter-pill-clean.blue.active { background: linear-gradient(135deg, #3b82f6, #2563eb); }
            .filter-pill-clean.orange.active { background: linear-gradient(135deg, #f59e0b, #d97706); }
            .filter-pill-clean.red.active { background: linear-gradient(135deg, #ef4444, #dc2626); }
            .filter-pill-clean.purple.active { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
            .filter-pill-clean.green.active { background: linear-gradient(135deg, #10b981, #059669); }
            
            .pill-icon {
                font-size: 16px;
            }
            
            .pill-text {
                font-weight: 600;
            }
            
            .pill-count {
                background: rgba(0,0,0,0.1);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 700;
                min-width: 20px;
                text-align: center;
            }
            
            .filter-pill-clean.active .pill-count {
                background: rgba(255,255,255,0.25);
            }
            
            .filters-toggle {
                background: #f8fafc;
                border: 2px solid #e5e7eb;
                color: #6b7280;
            }
            
            .filters-toggle.active {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-color: #667eea;
            }
            
            /* FILTRES AVANCÉS */
            .advanced-filters-clean {
                background: white;
                border-radius: 12px;
                margin-bottom: 20px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                max-height: 0;
                overflow: hidden;
                transition: all 0.4s ease;
                opacity: 0;
            }
            
            .advanced-filters-clean.show {
                max-height: 200px;
                opacity: 1;
                padding: 20px;
            }
            
            .filters-grid-clean {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                align-items: center;
            }
            
            .filter-select-clean {
                padding: 10px 14px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                font-size: 14px;
                color: #374151;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .filter-select-clean:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            /* TABLEAU ÉPURÉ */
            .tasks-clean-container {
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .tasks-table-header {
                display: grid;
                grid-template-columns: 200px 1fr 120px 100px 100px;
                gap: 16px;
                padding: 20px 24px;
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                border-bottom: 2px solid #e5e7eb;
                font-weight: 700;
                font-size: 13px;
                color: #374151;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .task-row-clean {
                display: grid;
                grid-template-columns: 24px 4px 200px 1fr 120px 100px 100px;
                gap: 12px;
                padding: 16px 20px;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: all 0.2s ease;
                align-items: center;
                position: relative;
            }
            
            .task-row-clean:hover {
                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                transform: translateX(4px);
                box-shadow: 0 2px 12px rgba(0,0,0,0.05);
            }
            
            .task-row-clean.selected {
                background: linear-gradient(135deg, #eff6ff, #dbeafe);
                border-left: 4px solid #3b82f6;
            }
            
            .task-row-clean.completed {
                opacity: 0.6;
            }
            
            .task-row-clean.completed .task-title {
                text-decoration: line-through;
            }
            
            .task-checkbox-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .task-checkbox-clean {
                width: 18px;
                height: 18px;
                cursor: pointer;
                accent-color: #667eea;
            }
            
            /* BARRE DE PRIORITÉ */
            .priority-bar {
                width: 4px;
                height: 100%;
                position: absolute;
                left: 0;
                top: 0;
                border-radius: 0 4px 4px 0;
            }
            
            .priority-urgent { background: linear-gradient(180deg, #ef4444, #dc2626); }
            .priority-high { background: linear-gradient(180deg, #f59e0b, #d97706); }
            .priority-medium { background: linear-gradient(180deg, #3b82f6, #2563eb); }
            .priority-low { background: linear-gradient(180deg, #10b981, #059669); }
            
            /* COLONNES */
            .col-sender {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .sender-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .sender-name {
                font-weight: 600;
                color: #1f2937;
                font-size: 14px;
            }
            
            .sender-domain {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .col-title {
                min-width: 0;
            }
            
            .title-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            
            .status-todo { background: #f59e0b; }
            .status-in-progress { background: #3b82f6; }
            .status-completed { background: #10b981; }
            
            .task-title {
                font-weight: 600;
                color: #1f2937;
                font-size: 15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .reply-indicator, .ai-indicator {
                font-size: 12px;
                opacity: 0.8;
            }
            
            .col-deadline {
                text-align: center;
            }
            
            .deadline-badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
            }
            
            .deadline-normal {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .deadline-soon {
                background: #fef3c7;
                color: #d97706;
            }
            
            .deadline-today {
                background: #fecaca;
                color: #dc2626;
            }
            
            .deadline-overdue {
                background: #fecaca;
                color: #dc2626;
                animation: pulse 2s infinite;
            }
            
            .no-deadline {
                color: #9ca3af;
                font-style: italic;
            }
            
            .col-type {
                text-align: center;
            }
            
            .task-type-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .task-type-badge.email {
                background: #e0f2fe;
                color: #0369a1;
            }
            
            .task-type-badge.meeting {
                background: #f3e8ff;
                color: #7c3aed;
            }
            
            .task-type-badge.work {
                background: #ecfdf5;
                color: #059669;
            }
            
            .task-type-badge.task {
                background: #fef3c7;
                color: #d97706;
            }
            
            .col-actions {
                text-align: center;
            }
            
            .task-actions-clean {
                display: flex;
                gap: 4px;
                justify-content: center;
            }
            
            .action-btn-clean {
                width: 32px;
                height: 32px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 13px;
            }
            
            .action-btn-clean:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .action-btn-clean.complete:hover {
                background: #10b981;
                border-color: #10b981;
                color: white;
            }
            
            .action-btn-clean.reply:hover {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
            }
            
            .action-btn-clean.view:hover {
                background: #f59e0b;
                border-color: #f59e0b;
                color: white;
            }
            
            /* ÉTAT VIDE */
            .empty-state-clean {
                text-align: center;
                padding: 80px 20px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            }
            
            .empty-icon {
                font-size: 64px;
                margin-bottom: 20px;
                opacity: 0.6;
            }
            
            .empty-state-clean h3 {
                font-size: 24px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .empty-state-clean p {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 24px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }
            
            /* MODALS */
            .modal-overlay-clean {
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
            
            .modal-content-clean {
                background: white;
                border-radius: 16px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .modal-content-clean.large {
                max-width: 800px;
            }
            
            .modal-header-clean {
                padding: 24px;
                border-bottom: 2px solid #f3f4f6;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                border-radius: 16px 16px 0 0;
            }
            
            .modal-header-clean h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .modal-close-clean {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #6b7280;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .modal-close-clean:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-body-clean {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer-clean {
                padding: 20px 24px;
                border-top: 2px solid #f3f4f6;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                background: #f8fafc;
                border-radius: 0 0 16px 16px;
            }
            
            /* DÉTAILS DE TÂCHE */
            .task-details-clean {
                max-width: none;
            }
            
            .details-header-clean {
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 2px solid #f3f4f6;
            }
            
            .details-header-clean h1 {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 12px 0;
                line-height: 1.3;
            }
            
            .details-meta-clean {
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
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .priority-badge.priority-urgent {
                background: #fecaca;
                color: #dc2626;
            }
            
            .priority-badge.priority-high {
                background: #fef3c7;
                color: #d97706;
            }
            
            .priority-badge.priority-medium {
                background: #dbeafe;
                color: #2563eb;
            }
            
            .priority-badge.priority-low {
                background: #dcfce7;
                color: #16a34a;
            }
            
            .status-badge.status-todo {
                background: #fef3c7;
                color: #d97706;
            }
            
            .status-badge.status-in-progress {
                background: #dbeafe;
                color: #2563eb;
            }
            
            .status-badge.status-completed {
                background: #dcfce7;
                color: #16a34a;
            }
            
            .details-section-clean {
                margin-bottom: 24px;
                background: #f8fafc;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
            }
            
            .details-section-clean h3 {
                margin: 0;
                padding: 16px 20px;
                background: white;
                border-bottom: 2px solid #e5e7eb;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .email-info-clean, .description-clean, .actions-clean, .info-clean, .email-content-clean {
                padding: 16px 20px;
            }
            
            .email-info-clean div {
                margin-bottom: 8px;
                font-size: 14px;
                color: #374151;
            }
            
            .description-clean .structured-desc {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 13px;
                line-height: 1.6;
                background: white;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .description-clean .simple-desc {
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
            }
            
            .actions-clean {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .action-item-clean {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                font-size: 14px;
                color: #374151;
            }
            
            .action-number {
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .info-clean {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .info-item-clean {
                font-size: 14px;
                color: #374151;
                line-height: 1.4;
            }
            
            .email-content-clean .email-original {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
                white-space: pre-wrap;
                background: white;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            /* SUGGESTIONS DE RÉPONSE */
            .ai-info-clean {
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border: 2px solid #7dd3fc;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .ai-badge-clean {
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
            
            .ai-info-clean p {
                margin: 0;
                color: #075985;
                font-size: 14px;
            }
            
            .replies-grid-clean {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .reply-card-clean {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                transition: all 0.2s ease;
            }
            
            .reply-card-clean:hover {
                border-color: #3b82f6;
                box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
                transform: translateY(-2px);
            }
            
            .reply-header-clean {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .reply-tone-clean {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                text-transform: capitalize;
            }
            
            .reply-tone-clean.formel, .reply-tone-clean.professionnel {
                background: #f3f4f6;
                color: #374151;
            }
            
            .reply-tone-clean.urgent {
                background: #fecaca;
                color: #dc2626;
            }
            
            .reply-tone-clean.neutre {
                background: #dbeafe;
                color: #2563eb;
            }
            
            .reply-tone-clean.détaillé {
                background: #fef3c7;
                color: #d97706;
            }
            
            .reply-actions-clean {
                display: flex;
                gap: 8px;
            }
            
            .reply-subject-clean {
                font-size: 14px;
                color: #4b5563;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .reply-content-clean {
                font-size: 13px;
                color: #374151;
                line-height: 1.6;
                white-space: pre-wrap;
                background: #f8fafc;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                max-height: 150px;
                overflow-y: auto;
            }
            
            /* FORMULAIRES */
            .form-clean {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .form-group-clean {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            
            .form-group-clean label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
            }
            
            .form-input-clean, .form-select-clean, .form-textarea-clean {
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                transition: all 0.2s ease;
            }
            
            .form-input-clean:focus, .form-select-clean:focus, .form-textarea-clean:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .form-row-clean {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            .form-textarea-clean {
                resize: vertical;
                min-height: 80px;
            }
            
            /* ANIMATIONS */
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            /* RESPONSIVE */
            @media (max-width: 1024px) {
                .tasks-table-header,
                .task-row-clean {
                    grid-template-columns: 24px 4px 150px 1fr 80px 80px 80px;
                    gap: 8px;
                }
                
                .tasks-header-clean {
                    padding: 16px 20px;
                }
                
                .tasks-title-clean {
                    font-size: 24px;
                }
            }
            
            @media (max-width: 768px) {
                .tasks-page-clean {
                    padding: 12px;
                }
                
                .tasks-header-clean {
                    flex-direction: column;
                    gap: 16px;
                    align-items: stretch;
                }
                
                .header-center {
                    margin: 0;
                    max-width: none;
                }
                
                .quick-filters-clean {
                    gap: 8px;
                }
                
                .filter-pill-clean {
                    padding: 8px 12px;
                    font-size: 12px;
                }
                
                .pill-text {
                    display: none;
                }
                
                .tasks-table-header {
                    display: none;
                }
                
                .task-row-clean {
                    grid-template-columns: 24px 4px 1fr 60px;
                    gap: 8px;
                    padding: 12px 16px;
                }
                
                .col-deadline,
                .col-type {
                    display: none;
                }
                
                .sender-name {
                    font-size: 13px;
                }
                
                .task-title {
                    font-size: 14px;
                }
                
                .form-row-clean {
                    grid-template-columns: 1fr;
                }
                
                .modal-content-clean {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// =====================================
// GLOBAL INITIALIZATION GARANTIE
// =====================================

function initializeTaskManager() {
    console.log('[TaskManager] Initializing global instances...');
    
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
    
    console.log('✅ TaskManager v8.5 loaded - Interface épurée avec vue sur une ligne');
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
