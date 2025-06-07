// TaskManager Pro v8.5 - Vue simplifiée avec informations essentielles

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
            console.log('[TaskManager] Initializing v8.5 - Vue simplifiée...');
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
                suggestedReplies: [
                    {
                        tone: 'formel',
                        subject: 'Re: Validation campagne marketing Q2 - Approuvé',
                        content: `Bonjour Sarah,\n\nMerci pour ce dossier complet sur la campagne marketing Q2.\n\nAprès examen des éléments fournis, je valide :\n✓ Les visuels créatifs - très bien conçus\n✓ Le budget de 50k€ - approuvé \n✓ Le calendrier de lancement - cohérent avec nos objectifs\n\nVous pouvez procéder au lancement en coordination avec l'équipe commerciale comme prévu.\n\nCordialement,\n[Votre nom]`
                    }
                ],
                method: 'ai'
            },
            {
                id: 'sample_2',
                title: 'Préparer présentation client TechFlow',
                description: 'Créer la présentation pour le rendez-vous client TechFlow du vendredi',
                priority: 'medium',
                status: 'in-progress',
                category: 'work',
                hasEmail: false,
                tags: ['présentation', 'client'],
                client: 'TechFlow',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                dueDate: '2025-06-09',
                actions: [
                    { text: 'Finaliser les slides', deadline: '2025-06-08' },
                    { text: 'Préparer la démo', deadline: '2025-06-09' }
                ],
                method: 'manual'
            },
            {
                id: 'sample_3',
                title: 'Review technique projet Alpha',
                description: 'Effectuer la review technique du nouveau module',
                priority: 'urgent',
                status: 'todo',
                category: 'dev',
                hasEmail: false,
                tags: ['review', 'technique', 'alpha'],
                client: 'Interne',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                updatedAt: new Date(Date.now() - 3600000).toISOString(),
                dueDate: '2025-06-07',
                actions: [
                    { text: 'Analyser le code', deadline: '2025-06-07' },
                    { text: 'Rédiger le rapport', deadline: '2025-06-07' }
                ],
                method: 'manual'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    // MÉTHODE PRINCIPALE POUR CRÉER UNE TÂCHE À PARTIR D'UN EMAIL - CORRIGÉE AVEC IA
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

    // NOUVELLE MÉTHODE POUR GÉNÉRER DES SUGGESTIONS DE RÉPONSE INTELLIGENTES VIA IA
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
// TASKS VIEW SIMPLIFIÉE - INFORMATIONS ESSENTIELLES
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
        this.currentViewMode = 'condensed';
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
        
        container.innerHTML = `
            <div class="tasks-page-modern">
                <!-- Barre principale -->
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
                        <button class="btn-large advanced-filters-toggle ${this.showAdvancedFilters ? 'active' : ''}" 
                                onclick="window.tasksView.toggleAdvancedFilters()">
                            <i class="fas fa-filter"></i>
                            <span class="btn-text-large">Filtres</span>
                        </button>
                        <button class="btn-large btn-primary-large" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            <span class="btn-text-large">Nouvelle tâche</span>
                        </button>
                    </div>
                </div>

                <!-- Filtres de statut -->
                <div class="status-filters-large">
                    ${this.buildLargeStatusPills(stats)}
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
                                <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Échéance</option>
                                <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre</option>
                                <option value="client" ${this.currentFilters.sortBy === 'client' ? 'selected' : ''}>Client</option>
                            </select>
                        </div>

                        <div class="filter-actions">
                            <button class="btn-small btn-secondary" onclick="window.tasksView.resetAllFilters()">
                                <i class="fas fa-undo"></i> Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tasks-container-modern" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        this.addSimplifiedTaskStyles();
        this.setupEventListeners();
        console.log('[TasksView] Simplified interface rendered');
    }

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

        return this.renderSimplifiedView(filteredTasks);
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
                    <button class="btn-large btn-primary-large" onclick="window.tasksView.resetAllFilters()">
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

    // VUE SIMPLIFIÉE AVEC INFORMATIONS ESSENTIELLES UNIQUEMENT
    renderSimplifiedView(tasks) {
        return `
            <div class="tasks-simplified-list">
                ${tasks.map(task => this.renderSimplifiedTaskItem(task)).join('')}
            </div>
        `;
    }

asks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityIcon = this.getPriorityIcon(task.priority);
        
        // Informations essentielles uniquement
        const client = task.client || 'Interne';
        const title = task.title;
        const deadline = this.formatDueDateSimple(task.dueDate);
        const mainAction = this.getMainAction(task);
        
        return `
            <div class="task-simplified ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <input type="checkbox" 
                       class="task-checkbox-simple" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                
                <div class="priority-dot priority-${task.priority}" title="Priorité ${task.priority}">
                    ${priorityIcon}
                </div>
                
                <div class="task-client-simple">
                    <span class="client-name">${this.escapeHtml(client)}</span>
                </div>
                
                <div class="task-title-simple">
                    <span class="title-text">${this.escapeHtml(title)}</span>
                    ${task.hasEmail ? '<i class="fas fa-envelope email-indicator" title="Email associé"></i>' : ''}
                </div>
                
                <div class="task-deadline-simple">
                    ${deadline.html}
                </div>
                
                <div class="task-action-simple">
                    <span class="action-text">${this.escapeHtml(mainAction)}</span>
                </div>
                
                <div class="task-tags-simple">
                    ${task.tags && task.tags.length > 0 ? 
                        task.tags.slice(0, 2).map(tag => `<span class="tag-simple">#${tag}</span>`).join('') +
                        (task.tags.length > 2 ? `<span class="tags-more-simple">+${task.tags.length - 2}</span>` : '')
                        : ''
                    }
                </div>
                
                <div class="task-actions-simple">
                    ${this.renderSimpleActions(task)}
                </div>
            </div>
        `;
    }

    // Actions simplifiées
    renderSimpleActions(task) {
        const actions = [];
        
        // Bouton principal selon l'état
        if (task.status !== 'completed') {
            actions.push(`
                <button class="action-btn-simple complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer comme terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        // Bouton de réponse pour les emails
        if (task.hasEmail && !task.emailReplied && task.status !== 'completed') {
            const hasAiSuggestions = task.suggestedReplies && task.suggestedReplies.length > 0;
            actions.push(`
                <button class="action-btn-simple reply ${hasAiSuggestions ? 'ai-powered' : ''}" 
                        onclick="event.stopPropagation(); window.tasksView.replyToEmailWithAI('${task.id}')"
                        title="${hasAiSuggestions ? 'Répondre avec suggestions IA' : 'Répondre à l\'email'}">
                    <i class="fas fa-reply"></i>
                    ${hasAiSuggestions ? '<i class="fas fa-robot ai-badge-mini"></i>' : ''}
                </button>
            `);
        }
        
        // Bouton détails
        actions.push(`
            <button class="action-btn-simple details" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir les détails">
                <i class="fas fa-eye"></i>
            </button>
        `);
        
        // Bouton suppression
        actions.push(`
            <button class="action-btn-simple delete" 
                    onclick="event.stopPropagation(); window.tasksView.confirmDeleteTask('${task.id}')"
                    title="Supprimer">
                <i class="fas fa-trash-alt"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // Utilitaires pour la vue simplifiée
    getMainAction(task) {
        if (task.actions && task.actions.length > 0) {
            return task.actions[0].text;
        }
        
        if (task.hasEmail && task.needsReply) {
            return 'Répondre à l\'email';
        }
        
        if (task.description && task.description.length > 0) {
            return task.description.substring(0, 50) + (task.description.length > 50 ? '...' : '');
        }
        
        return 'Aucune action définie';
    }

    formatDueDateSimple(dateString) {
        if (!dateString) {
            return { html: '<span class="no-deadline">-</span>', text: '' };
        }
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        let className = 'deadline-normal';
        let text = '';
        let icon = '📅';
        
        if (diffDays < 0) {
            className = 'deadline-overdue';
            text = `${Math.abs(diffDays)}j en retard`;
            icon = '🚨';
        } else if (diffDays === 0) {
            className = 'deadline-today';
            text = 'Aujourd\'hui';
            icon = '⚡';
        } else if (diffDays === 1) {
            className = 'deadline-tomorrow';
            text = 'Demain';
            icon = '📅';
        } else if (diffDays <= 7) {
            className = 'deadline-soon';
            text = `${diffDays}j`;
            icon = '📅';
        } else {
            text = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            icon = '📅';
        }
        
        return {
            html: `<span class="deadline-simple ${className}">${icon} ${text}</span>`,
            text: text
        };
    }

    // Toutes les autres méthodes restent identiques...
    
    handleTaskClick(event, taskId) {
        this.showTaskDetails(taskId);
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
                        <span class="client-badge-details">
                            <i class="fas fa-building"></i> ${task.client || 'Interne'}
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
                        <h3><i class="fas fa-reply-all"></i> Suggestions de Réponse Personnalisées</h3>
                        <div class="suggested-replies-container">
                            ${task.suggestedReplies.map((reply, idx) => `
                                <div class="suggested-reply-card">
                                    <div class="reply-header">
                                        <div class="reply-tone-badge ${reply.tone}">
                                            ${this.getReplyToneIcon(reply.tone)} ${this.getReplyToneLabel(reply.tone)}
                                        </div>
                                        <button class="copy-reply-btn" onclick="window.tasksView.copyReplyToClipboard(${idx}, '${task.id}')">
                                            <i class="fas fa-copy"></i> Copier
                                        </button>
                                    </div>
                                    <div class="reply-subject">
                                        <strong>Sujet:</strong> ${this.escapeHtml(reply.subject)}
                                    </div>
                                    <div class="reply-content">
                                        ${this.escapeHtml(reply.content).replace(/\n/g, '<br>')}
                                    </div>
                                    <div class="reply-actions">
                                        <button class="use-reply-btn" onclick="window.tasksView.useReply('${task.id}', ${idx})">
                                            <i class="fas fa-paper-plane"></i> Utiliser cette réponse
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
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

    // Méthodes de navigation et d'interaction
    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.refreshView();
    }

    clearSelection() {
        this.selectedTasks.clear();
        this.refreshView();
    }

    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche marquée comme terminée', 'success');
    }

    confirmDeleteTask(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;

        const modalHTML = `
            <div id="deleteConfirmModal" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); 
                        z-index: 99999999; display: flex; align-items: center; justify-content: center; 
                        padding: 20px; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 12px; max-width: 500px; width: 100%; 
                           box-shadow: 0 10px 40px rgba(0,0,0,0.3); border: 1px solid #e5e7eb;">
                    <div style="padding: 24px 24px 16px 24px; text-align: center;">
                        <div style="width: 64px; height: 64px; background: #fef2f2; border-radius: 50%; 
                                   display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 28px; color: #dc2626;"></i>
                        </div>
                        <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #1f2937;">Confirmer la suppression</h3>
                        <p style="margin: 0 0 16px 0; color: #6b7280; line-height: 1.5;">
                            Êtes-vous sûr de vouloir supprimer cette tâche ?
                        </p>
                        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                            <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">
                                ${this.escapeHtml(task.title)}
                            </div>
                            ${task.hasEmail ? `
                                <div style="font-size: 14px; color: #6b7280;">
                                    <i class="fas fa-envelope"></i> Email de ${task.emailFromName || task.emailFrom}
                                </div>
                            ` : ''}
                        </div>
                        <p style="margin: 0; font-size: 14px; color: #dc2626; font-weight: 500;">
                            ⚠️ Cette action est irréversible
                        </p>
                    </div>
                    <div style="padding: 16px 24px 24px 24px; display: flex; justify-content: center; gap: 12px;">
                        <button onclick="document.getElementById('deleteConfirmModal').remove(); document.body.style.overflow = 'auto';"
                                style="padding: 10px 20px; background: #f3f4f6; border: 1px solid #d1d5db; 
                                       border-radius: 8px; cursor: pointer; font-weight: 500; color: #374151;">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                        <button onclick="window.tasksView.executeDelete('${task.id}'); document.getElementById('deleteConfirmModal').remove();"
                                style="padding: 10px 20px; background: #dc2626; color: white; border: none; 
                                       border-radius: 8px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-trash-alt"></i> Supprimer définitivement
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    executeDelete(taskId) {
        window.taskManager.deleteTask(taskId);
        this.selectedTasks.delete(taskId);
        document.body.style.overflow = 'auto';
        this.showToast('Tâche supprimée définitivement', 'success');
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
                        <div class="ai-suggestions-info">
                            <div class="ai-badge">
                                <i class="fas fa-robot"></i>
                                <span>Suggestions générées par Claude AI</span>
                            </div>
                            <p>Ces réponses ont été personnalisées selon le contexte de l'email de <strong>${task.emailFromName || 'l\'expéditeur'}</strong></p>
                            ${task.aiRepliesGeneratedAt ? `
                                <p class="ai-generation-time">
                                    <i class="fas fa-clock"></i>
                                    Générées le ${new Date(task.aiRepliesGeneratedAt).toLocaleString('fr-FR')}
                                </p>
                            ` : ''}
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

    // Méthodes de filtrage et navigation
    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    toggleAdvancedFilters() {
        this.showAdvancedFilters = !this.showAdvancedFilters;
        
        const panel = document.getElementById('advancedFiltersPanel');
        const toggle = document.querySelector('.advanced-filters-toggle');
        
        if (panel) {
            panel.classList.toggle('show', this.showAdvancedFilters);
        }
        
        if (toggle) {
            toggle.classList.toggle('active', this.showAdvancedFilters);
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

    // Méthodes utilitaires
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
            amical: '🤝',
            professionnel: '👔',
            détaillé: '📄'
        };
        return icons[tone] || '📝';
    }

    getReplyToneLabel(tone) {
        const labels = {
            formel: 'Formel',
            informel: 'Informel',
            urgent: 'Urgent',
            neutre: 'Neutre',
            amical: 'Amical',
            professionnel: 'Professionnel',
            détaillé: 'Détaillé'
        };
        return labels[tone] || 'Neutre';
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

    formatEmailContent(content) {
        if (!content) return '<p>Contenu non disponible</p>';
        
        const formattedContent = content
            .replace(/\n/g, '<br>')
            .replace(/Email de:/g, '<strong>Email de:</strong>')
            .replace(/Date:/g, '<strong>Date:</strong>')
            .replace(/Sujet:/g, '<strong>Sujet:</strong>');
            
        return `<div class="email-original-content">${formattedContent}</div>`;
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
               this.currentFilters.client !== 'all' ||
               this.currentFilters.tag !== 'all' ||
               this.currentFilters.dateRange !== 'all' ||
               this.currentFilters.search !== '' ||
               this.currentFilters.overdue ||
               this.currentFilters.needsReply;
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

    // STYLES SIMPLIFIÉS POUR LA NOUVELLE VUE
    addSimplifiedTaskStyles() {
        if (document.getElementById('simplifiedTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'simplifiedTaskStyles';
        styles.textContent = `
            /* STYLES SIMPLIFIÉS POUR VUE TÂCHES */
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
            
            /* STYLES POUR FILTRES AVANCÉS */
            .advanced-filters-toggle {
                background: #f8fafc;
                border-color: #e2e8f0;
                color: #475569;
            }
            
            .advanced-filters-toggle:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
            }
            
            .advanced-filters-toggle.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .advanced-filters-panel {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 16px;
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
                opacity: 0;
            }
            
            .advanced-filters-panel.show {
                max-height: 500px;
                opacity: 1;
                padding: 20px;
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
                font-size: 14px;
                color: #374151;
            }
            
            .filter-select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                font-size: 14px;
                color: #374151;
                cursor: pointer;
                transition: border-color 0.2s ease;
            }
            
            .filter-select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .filter-actions {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .btn-small {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid;
            }
            
            .btn-small.btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border-color: #d1d5db;
            }
            
            .btn-small.btn-secondary:hover {
                background: #e5e7eb;
                border-color: #9ca3af;
            }
            
            /* VUE SIMPLIFIÉE DES TÂCHES */
            .tasks-simplified-list {
                display: flex;
                flex-direction: column;
                gap: 2px;
                background: #f9fafb;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .task-simplified {
                display: grid;
                grid-template-columns: 40px 30px 150px 1fr 120px 180px 120px;
                align-items: center;
                background: white;
                padding: 14px 18px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-bottom: 1px solid #f1f5f9;
                min-height: 56px;
                gap: 16px;
            }
            
            .task-simplified:last-child {
                border-bottom: none;
            }
            
            .task-simplified:hover {
                background: #f8fafc;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(148, 163, 184, 0.1);
                border-bottom-color: #e2e8f0;
            }
            
            .task-simplified.selected {
                background: #f0f9ff;
                border-left: 4px solid #0ea5e9;
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
            }
            
            .task-simplified.completed {
                opacity: 0.6;
            }
            
            .task-simplified.completed .title-text {
                text-decoration: line-through;
            }
            
            .task-checkbox-simple {
                cursor: pointer;
                width: 16px;
                height: 16px;
            }
            
            .priority-dot {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 600;
            }
            
            .priority-urgent {
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
                color: #dc2626;
                border: 1px solid #fca5a5;
                box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
            }
            
            .priority-high {
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
                color: #d97706;
                border: 1px solid #fbbf24;
                box-shadow: 0 2px 4px rgba(217, 119, 6, 0.1);
            }
            
            .priority-medium {
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                color: #0284c7;
                border: 1px solid #7dd3fc;
                box-shadow: 0 2px 4px rgba(2, 132, 199, 0.1);
            }
            
            .priority-low {
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                color: #16a34a;
                border: 1px solid #86efac;
                box-shadow: 0 2px 4px rgba(22, 163, 74, 0.1);
            }
            
            .task-client-simple {
                display: flex;
                align-items: center;
            }
            
            .client-name {
                font-size: 13px;
                font-weight: 600;
                color: #475569;
                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                padding: 6px 12px;
                border-radius: 8px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                border: 1px solid #e2e8f0;
                box-shadow: 0 1px 3px rgba(148, 163, 184, 0.1);
            }
            
            .task-title-simple {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
            }
            
            .title-text {
                font-weight: 600;
                color: #1e293b;
                font-size: 15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            }
            
            .email-indicator {
                color: #0ea5e9;
                font-size: 13px;
                flex-shrink: 0;
                margin-left: 8px;
            }
            
            .task-deadline-simple {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .deadline-simple {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 6px;
                white-space: nowrap;
            }
            
            .deadline-normal {
                color: #64748b;
                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                border: 1px solid #e2e8f0;
            }
            
            .deadline-soon {
                color: #d97706;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
                border: 1px solid #fbbf24;
            }
            
            .deadline-today {
                color: #dc2626;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
                border: 1px solid #fca5a5;
            }
            
            .deadline-tomorrow {
                color: #059669;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                border: 1px solid #86efac;
            }
            
            .deadline-overdue {
                color: #dc2626;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
                border: 1px solid #fca5a5;
                animation: pulseGlow 2s infinite;
            }
            
            @keyframes pulseGlow {
                0%, 100% { 
                    opacity: 1; 
                    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
                }
                50% { 
                    opacity: 0.8; 
                    box-shadow: 0 4px 8px rgba(220, 38, 38, 0.4);
                }
            }
            
            .no-deadline {
                color: #94a3b8;
                font-style: italic;
                font-size: 12px;
            }
            
            .no-tags {
                color: #94a3b8;
                font-style: italic;
                font-size: 12px;
            }
            
            .task-action-simple {
                min-width: 0;
            }
            
            .action-text {
                font-size: 13px;
                color: #6b7280;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .task-tags-simple {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-wrap: nowrap;
                overflow: hidden;
            }
            
            .tag-simple {
                background: linear-gradient(135deg, #0ea5e9, #0284c7);
                color: white;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                white-space: nowrap;
                border: 1px solid rgba(255,255,255,0.2);
                box-shadow: 0 1px 3px rgba(14, 165, 233, 0.2);
            }
            
            .tags-more-simple {
                background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                color: #64748b;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 500;
                white-space: nowrap;
                border: 1px solid #cbd5e1;
            }
            
            .task-actions-simple {
                display: flex;
                align-items: center;
                gap: 6px;
                justify-content: flex-end;
            }
            
            .action-btn-simple {
                width: 32px;
                height: 32px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                background: white;
                color: #64748b;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 13px;
                position: relative;
                box-shadow: 0 1px 3px rgba(148, 163, 184, 0.1);
            }
            
            .action-btn-simple:hover {
                background: #f8fafc;
                border-color: #cbd5e1;
                transform: translateY(-1px);
                box-shadow: 0 3px 6px rgba(148, 163, 184, 0.15);
            }
            
            .action-btn-simple.complete:hover {
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                border-color: #22c55e;
                color: #16a34a;
                box-shadow: 0 3px 6px rgba(34, 197, 94, 0.2);
            }
            
            .action-btn-simple.reply:hover {
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border-color: #0ea5e9;
                color: #0284c7;
                box-shadow: 0 3px 6px rgba(14, 165, 233, 0.2);
            }
            
            .action-btn-simple.reply.ai-powered {
                background: linear-gradient(135deg, #0ea5e9, #0284c7);
                color: white;
                border-color: #0369a1;
                box-shadow: 0 2px 4px rgba(14, 165, 233, 0.2);
            }
            
            .action-btn-simple.reply.ai-powered:hover {
                background: linear-gradient(135deg, #0284c7, #0369a1);
                border-color: #075985;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
            }
            
            .ai-badge-mini {
                position: absolute;
                top: -3px;
                right: -3px;
                background: #10b981;
                color: white;
                border-radius: 50%;
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
            }
            
            .action-btn-simple.details:hover {
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
                border-color: #f59e0b;
                color: #d97706;
                box-shadow: 0 3px 6px rgba(245, 158, 11, 0.2);
            }
            
            .action-btn-simple.delete:hover {
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
                border-color: #ef4444;
                color: #dc2626;
                box-shadow: 0 3px 6px rgba(239, 68, 68, 0.2);
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
            
            /* STYLES POUR LES MODALS ET DÉTAILS */
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
            
            .priority-badge, .status-badge, .client-badge-details {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
            }
            
            .client-badge-details {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
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
            
            /* STYLES POUR LES SUGGESTIONS DE RÉPONSE */
            .suggested-replies-section {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 1px solid #7dd3fc;
            }
            
            .suggested-replies-section h3 {
                background: #f0f9ff;
                border-bottom-color: #7dd3fc;
                color: #075985;
            }
            
            .suggested-replies-container {
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .suggested-reply-card {
                background: white;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 16px;
                transition: all 0.2s ease;
            }
            
            .suggested-reply-card:hover {
                border-color: #7dd3fc;
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
            }
            
            .reply-header {
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
            
            .reply-tone-badge.formel, .reply-tone-badge.professionnel {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .reply-tone-badge.urgent {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .reply-tone-badge.neutre, .reply-tone-badge.détaillé {
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }
            
            .reply-tone-badge.amical {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .copy-reply-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                color: #374151;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .copy-reply-btn:hover {
                background: #e5e7eb;
                border-color: #9ca3af;
            }
            
            .reply-subject {
                font-size: 14px;
                color: #4b5563;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .reply-content {
                font-size: 13px;
                color: #374151;
                line-height: 1.6;
                white-space: pre-wrap;
                background: #f8fafc;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
                margin-bottom: 12px;
            }
            
            .reply-actions {
                display: flex;
                justify-content: flex-end;
            }
            
            .use-reply-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .use-reply-btn:hover {
                background: #2563eb;
                transform: translateY(-1px);
                box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
            }
            
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
            
            .ai-generation-time {
                font-size: 12px;
                color: #6b7280;
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
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
            
            /* STYLES POUR EMAIL CONTENT */
            .email-content-section {
                padding: 16px 20px;
            }
            
            .email-content-tabs {
                display: flex;
                gap: 5px;
                margin-bottom: 16px;
                background: #f3f4f6;
                padding: 5px;
                border-radius: 8px;
            }
            
            .tab-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: transparent;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .tab-btn.active {
                background: white;
                color: #1f2937;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .tab-btn:hover:not(.active) {
                background: rgba(255,255,255,0.5);
                color: #374151;
            }
            
            .email-content-box {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                max-height: 500px;
                overflow-y: auto;
            }
            
            .email-content-view {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
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
            
            /* ANIMATIONS */
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.7;
                }
            }
            
            /* RESPONSIVE DESIGN */
            @media (max-width: 1200px) {
                .task-simplified {
                    grid-template-columns: 40px 30px 120px 1fr 100px 140px 100px;
                    gap: 12px;
                }
                
                .client-name {
                    font-size: 12px;
                    padding: 4px 8px;
                }
                
                .title-text {
                    font-size: 14px;
                }
            }
            
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
                .toolbar-right {
                    width: 100%;
                    max-width: none;
                }
                
                .toolbar-right {
                    justify-content: flex-end;
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
                
                .task-simplified {
                    grid-template-columns: 30px 24px 1fr 80px 80px;
                    padding: 12px 8px;
                    gap: 8px;
                }
                
                .task-client-simple,
                .task-tags-simple {
                    display: none;
                }
                
                .title-text {
                    font-size: 14px;
                }
                
                .deadline-simple {
                    font-size: 11px;
                    padding: 2px 6px;
                }
                
                .action-btn-simple {
                    width: 28px;
                    height: 28px;
                    font-size: 11px;
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
// GLOBAL INITIALIZATION
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
    
    console.log('✅ TaskManager v8.5 loaded - Vue simplifiée avec informations essentielles');
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
