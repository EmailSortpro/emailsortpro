// TaskManager Pro v8.4 - CORRIGÉ avec affichage email complet et suggestions de réponse

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
            console.log('[TaskManager] Initializing v8.4 - CORRIGÉ avec affichage email complet...');
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
                // NOUVEAU: Contenu HTML complet de l'email
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
                // NOUVEAU: Suggestions de réponse personnalisées
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
                    },
                    {
                        tone: 'urgent',
                        subject: 'Re: Validation campagne marketing Q2 - Questions urgentes',
                        content: `Bonjour Sarah,

J'ai examiné le dossier campagne Q2 avec attention.

Avant validation finale, j'ai quelques questions urgentes :

1. Budget 50k€ : quelle répartition LinkedIn vs Google Ads ?
2. Cible 25-45 ans : avez-vous les personas détaillés ?
3. Coordination commerciale : qui est le référent côté vente ?

Pouvons-nous organiser un point rapidement demain pour clarifier ces aspects ?

Dans l'attente de votre retour,
[Votre nom]`
                    }
                ],
                method: 'ai'
            }
        ];
        
        this.tasks = sampleTasks;
        this.saveTasks();
    }

    // MÉTHODE PRINCIPALE POUR CRÉER UNE TÂCHE À PARTIR D'UN EMAIL - CORRIGÉE AVEC IA
    async createTaskFromEmail(taskData, email = null) {
        console.log('[TaskManager] Creating task from email with AI-powered reply suggestions:', taskData.title);
        
        // Assurer un ID unique
        const taskId = taskData.id || this.generateId();
        
        // EXTRAIRE LE CONTENU COMPLET DE L'EMAIL
        const fullEmailContent = this.extractFullEmailContent(email, taskData);
        const htmlEmailContent = this.extractHtmlEmailContent(email, taskData);
        
        // GÉNÉRER DES SUGGESTIONS DE RÉPONSE VIA IA SI NÉCESSAIRE
        let suggestedReplies = taskData.suggestedReplies || [];
        
        // Si pas de suggestions fournies et qu'on a un email, générer via IA
        if ((!suggestedReplies || suggestedReplies.length === 0) && 
            (email || taskData.emailFrom) && 
            window.aiTaskAnalyzer) {
            
            try {
                console.log('[TaskManager] Generating AI-powered reply suggestions...');
                suggestedReplies = await this.generateIntelligentReplySuggestions(email || taskData, taskData);
                console.log('[TaskManager] Generated', suggestedReplies.length, 'AI reply suggestions');
            } catch (error) {
                console.warn('[TaskManager] AI reply generation failed:', error);
                // Générer des suggestions de base en fallback
                suggestedReplies = this.generateBasicReplySuggestions(email || taskData, taskData);
            }
        }
        
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
            emailContent: fullEmailContent, // CONTENU COMPLET TEXTE
            emailHtmlContent: htmlEmailContent, // NOUVEAU: CONTENU HTML COMPLET
            emailDomain: taskData.emailDomain || (taskData.emailFrom ? taskData.emailFrom.split('@')[1] : ''),
            hasEmail: true,
            emailReplied: false,
            emailDate: taskData.emailDate || email?.receivedDateTime,
            needsReply: taskData.needsReply !== false, // Par défaut true pour les emails
            hasAttachments: email?.hasAttachments || false,
            
            // DONNÉES STRUCTURÉES DE L'IA - COMPLÈTES
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            aiAnalysis: taskData.aiAnalysis || null,
            
            // NOUVEAU: Suggestions de réponse personnalisées IA
            suggestedReplies: suggestedReplies,
            aiRepliesGenerated: suggestedReplies.length > 0,
            aiRepliesGeneratedAt: suggestedReplies.length > 0 ? new Date().toISOString() : null,
            
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

            // Construire un prompt spécialisé pour la génération de réponses
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

            // Appeler l'IA pour générer les suggestions
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

    // MÉTHODE POUR APPELER L'IA CLAUDE SPÉCIFIQUEMENT POUR LES RÉPONSES
    async callAIForReplySuggestions(prompt) {
        if (!window.aiTaskAnalyzer) {
            throw new Error('AITaskAnalyzer not available');
        }

        // Utiliser la même infrastructure que AITaskAnalyzer mais avec un prompt spécialisé
        try {
            // Vérifier si l'API est configurée
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

    // APPEL À L'API CLAUDE POUR LES SUGGESTIONS DE RÉPONSE
    async callClaudeAPI(prompt) {
        const apiUrl = 'https://api.anthropic.com/v1/messages';
        const apiKey = window.aiTaskAnalyzer.apiKey;
        
        // Essayer d'abord le proxy local si disponible
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

        // Essayer les solutions CORS en fallback
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

    // PARSER LA RÉPONSE DE CLAUDE POUR LES SUGGESTIONS
    parseClaudeReplyResponse(response) {
        try {
            let jsonContent;
            
            // Gérer différents formats de réponse
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
            
            // Extraire le JSON de la réponse
            const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in Claude response');
            }
            
            const parsed = JSON.parse(jsonMatch[0]);
            
            // Valider la structure
            if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
                throw new Error('Invalid suggestions format');
            }
            
            return parsed;
            
        } catch (error) {
            console.error('[TaskManager] Parse Claude reply error:', error);
            throw error;
        }
    }

    // SUGGESTIONS DE BASE EN FALLBACK
    generateBasicReplySuggestions(email, taskData) {
        const senderName = email.from?.emailAddress?.name || taskData.emailFromName || 'l\'expéditeur';
        const subject = email.subject || taskData.emailSubject || 'votre message';
        const urgency = taskData.priority || 'medium';
        const hasActions = taskData.actions && taskData.actions.length > 0;

        const suggestions = [];

        // Réponse professionnelle standard
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

        // Réponse urgente si nécessaire
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

        // Réponse de confirmation détaillée
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

    // NOUVELLE MÉTHODE POUR EXTRAIRE LE CONTENU HTML COMPLET
    extractHtmlEmailContent(email, taskData) {
        console.log('[TaskManager] Extracting HTML email content...');
        
        // Priorité 1: Contenu HTML passé directement dans taskData
        if (taskData.emailHtmlContent && taskData.emailHtmlContent.length > 50) {
            console.log('[TaskManager] Using HTML email content from taskData');
            return taskData.emailHtmlContent;
        }
        
        // Priorité 2: Contenu HTML de l'email
        if (email?.body?.contentType === 'html' && email?.body?.content) {
            console.log('[TaskManager] Using email HTML body content');
            return this.cleanHtmlEmailContent(email.body.content);
        }
        
        // Priorité 3: Contenu de l'email (même si text, on peut le formater)
        if (email?.body?.content) {
            console.log('[TaskManager] Converting text to HTML');
            return this.convertTextToHtml(email.body.content, email);
        }
        
        // Priorité 4: Construire un HTML à partir du contenu texte
        const textContent = this.extractFullEmailContent(email, taskData);
        return this.convertTextToHtml(textContent, email);
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

    // NOUVELLE MÉTHODE POUR NETTOYER LE CONTENU HTML
    cleanHtmlEmailContent(htmlContent) {
        if (!htmlContent) return '';
        
        // Nettoyer le HTML en gardant la structure visuelle
        let cleanHtml = htmlContent
            // Supprimer les scripts et styles dangereux
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '') // Supprimer les événements JS
            .replace(/javascript:/gi, '') // Supprimer javascript:
            
            // Nettoyer les attributs dangereux
            .replace(/style="[^"]*"/gi, (match) => {
                // Garder seulement les styles de mise en forme de base
                const safeStyles = match.match(/(color|background|font-size|font-weight|text-align|margin|padding|border):[^;]*/gi);
                return safeStyles ? `style="${safeStyles.join(';')}"` : '';
            });
        
        // Encapsuler dans un conteneur sécurisé
        return `<div class="email-content-viewer" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            ${cleanHtml}
        </div>`;
    }

    // NOUVELLE MÉTHODE POUR CONVERTIR TEXTE EN HTML
    convertTextToHtml(textContent, email) {
        if (!textContent) return '';
        
        const senderName = email?.from?.emailAddress?.name || 'Expéditeur';
        const senderEmail = email?.from?.emailAddress?.address || '';
        const subject = email?.subject || 'Sans sujet';
        const date = email?.receivedDateTime ? new Date(email.receivedDateTime).toLocaleString('fr-FR') : '';
        
        // Créer un HTML formaté à partir du texte
        const htmlContent = textContent
            .replace(/\n/g, '<br>')
            .replace(/Email de:([^\n]+)/g, '<strong>De:</strong>$1')
            .replace(/Date:([^\n]+)/g, '<strong>Date:</strong>$1')
            .replace(/Sujet:([^\n]+)/g, '<strong>Sujet:</strong>$1')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **texte** -> bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // *texte* -> italic
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>'); // Links
        
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
            emailHtmlContent: taskData.emailHtmlContent || '', // NOUVEAU
            hasEmail: !!(taskData.emailId || taskData.emailFrom || taskData.emailContent),
            emailReplied: false,
            emailDate: taskData.emailDate || taskData.createdAt,
            needsReply: taskData.needsReply || false,
            
            // Structured data (ajout pour unifier avec PageManager)
            summary: taskData.summary || '',
            actions: taskData.actions || [],
            keyInfo: taskData.keyInfo || [],
            risks: taskData.risks || [],
            suggestedReplies: taskData.suggestedReplies || [], // NOUVEAU
            
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
        
        // Status filter
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        
        // Priority filter
        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }
        
        // Category filter
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(task => task.category === filters.category);
        }
        
        // Client filter
        if (filters.client && filters.client !== 'all') {
            filtered = filtered.filter(task => task.client === filters.client);
        }
        
        // Tag filter
        if (filters.tag && filters.tag !== 'all') {
            filtered = filtered.filter(task => 
                task.tags && Array.isArray(task.tags) && task.tags.includes(filters.tag)
            );
        }
        
        // Date range filter
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
        
        // Search filter
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
        
        // Special filters
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
// TASKSVIEW COMPLÈTEMENT RÉÉCRITE - INTERFACE EXACTE EMAILSORTPRO
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

    // MÉTHODE RENDER PRINCIPALE - INTERFACE EMAILSORTPRO
    render(container) {
        if (!container) {
            console.error('[TasksView] No container provided');
            return;
        }

        if (!window.taskManager || !window.taskManager.initialized) {
            container.innerHTML = `
                <div class="loading-wrapper">
                    <div class="loading-spinner"></div>
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
        
        // INTERFACE IDENTIQUE À EMAILSORTPRO
        container.innerHTML = `
            <div class="tasks-page">
                <!-- En-tête avec titre et compteur -->
                <div class="tasks-header">
                    <div class="tasks-title-section">
                        <h1 class="page-title">Tâches</h1>
                        <span class="tasks-counter">${stats.total} tâche${stats.total > 1 ? 's' : ''}</span>
                    </div>
                    
                    <!-- Barre de recherche -->
                    <div class="search-section">
                        <div class="search-container">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   class="search-input" 
                                   id="taskSearchInput"
                                   placeholder="Rechercher dans les tâches..." 
                                   value="${this.currentFilters.search}">
                        </div>
                    </div>
                    
                    <!-- Actions à droite -->
                    <div class="header-actions">
                        <div class="view-modes">
                            <button class="view-mode-btn ${this.currentViewMode === 'condensed' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('condensed')"
                                    title="Vue condensée">
                                <i class="fas fa-th-list"></i>
                                <span>Condensé</span>
                            </button>
                            <button class="view-mode-btn ${this.currentViewMode === 'detailed' ? 'active' : ''}" 
                                    onclick="window.tasksView.changeViewMode('detailed')"
                                    title="Vue détaillée">
                                <i class="fas fa-th-large"></i>
                                <span>Détaillé</span>
                            </button>
                        </div>
                        
                        <button class="new-task-btn" onclick="window.tasksView.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            <span>Nouvelle tâche</span>
                        </button>
                    </div>
                </div>

                <!-- Filtres de statut (pills comme EmailSortPro) -->
                <div class="status-filters">
                    ${this.renderStatusPills(stats)}
                </div>

                <!-- Filtres avancés (rétractable) -->
                <div class="advanced-filters-toggle" onclick="window.tasksView.toggleAdvancedFilters()">
                    <i class="fas fa-filter"></i>
                    <span>Filtres avancés</span>
                    <i class="fas fa-chevron-${this.showAdvancedFilters ? 'up' : 'down'}"></i>
                    ${this.getActiveFiltersCount() > 0 ? `<span class="active-filters-badge">${this.getActiveFiltersCount()}</span>` : ''}
                </div>

                <div class="advanced-filters ${this.showAdvancedFilters ? 'show' : ''}" id="advancedFilters">
                    <div class="filters-row">
                        <select class="filter-select" id="priorityFilter" onchange="window.tasksView.updateFilter('priority', this.value)">
                            <option value="all">Toutes priorités</option>
                            <option value="urgent" ${this.currentFilters.priority === 'urgent' ? 'selected' : ''}>Urgente</option>
                            <option value="high" ${this.currentFilters.priority === 'high' ? 'selected' : ''}>Haute</option>
                            <option value="medium" ${this.currentFilters.priority === 'medium' ? 'selected' : ''}>Normale</option>
                            <option value="low" ${this.currentFilters.priority === 'low' ? 'selected' : ''}>Basse</option>
                        </select>
                        
                        <select class="filter-select" id="clientFilter" onchange="window.tasksView.updateFilter('client', this.value)">
                            ${this.buildClientFilterOptions()}
                        </select>
                        
                        <select class="filter-select" id="sortByFilter" onchange="window.tasksView.updateFilter('sortBy', this.value)">
                            <option value="created" ${this.currentFilters.sortBy === 'created' ? 'selected' : ''}>Plus récentes</option>
                            <option value="priority" ${this.currentFilters.sortBy === 'priority' ? 'selected' : ''}>Priorité</option>
                            <option value="dueDate" ${this.currentFilters.sortBy === 'dueDate' ? 'selected' : ''}>Échéance</option>
                            <option value="title" ${this.currentFilters.sortBy === 'title' ? 'selected' : ''}>Titre A-Z</option>
                        </select>
                        
                        <button class="reset-filters-btn" onclick="window.tasksView.resetAllFilters()">
                            <i class="fas fa-undo"></i>
                            Réinitialiser
                        </button>
                    </div>
                </div>

                <!-- Liste des tâches -->
                <div class="tasks-container" id="tasksContainer">
                    ${this.renderTasksList()}
                </div>
            </div>
        `;

        // Appliquer les styles
        this.addTaskStyles();
        this.setupEventListeners();
        console.log('[TasksView] Interface EmailSortPro rendered');
    }

    // PILLS DE STATUT IDENTIQUES À EMAILSORTPRO
    renderStatusPills(stats) {
        const pills = [
            { id: 'all', label: 'Toutes', icon: '📋', count: stats.total, color: '#6366f1' },
            { id: 'todo', label: 'À faire', icon: '⏳', count: stats.todo, color: '#3b82f6' },
            { id: 'in-progress', label: 'En cours', icon: '🔄', count: stats.inProgress, color: '#f59e0b' },
            { id: 'overdue', label: 'En retard', icon: '⚠️', count: stats.overdue, color: '#ef4444' },
            { id: 'needsReply', label: 'À répondre', icon: '💬', count: stats.needsReply, color: '#8b5cf6' },
            { id: 'completed', label: 'Terminées', icon: '✅', count: stats.completed, color: '#10b981' }
        ];

        return pills.map(pill => `
            <button class="status-pill ${this.isStatusActive(pill.id) ? 'active' : ''}" 
                    style="--pill-color: ${pill.color}"
                    onclick="window.tasksView.filterByStatus('${pill.id}')">
                <span class="pill-icon">${pill.icon}</span>
                <span class="pill-label">${pill.label}</span>
                <span class="pill-count">${pill.count}</span>
            </button>
        `).join('');
    }

    // RENDU DE LA LISTE DES TÂCHES
    renderTasksList() {
        const tasks = window.taskManager.filterTasks(this.currentFilters);
        
        if (tasks.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <div class="tasks-list">
                ${tasks.map(task => this.renderTaskItem(task)).join('')}
            </div>
        `;
    }

    // RENDU D'UNE TÂCHE INDIVIDUELLE - STYLE EMAILSORTPRO
    renderTaskItem(task) {
        const isSelected = this.selectedTasks.has(task.id);
        const isCompleted = task.status === 'completed';
        const priorityColor = this.getPriorityColor(task.priority);
        
        // Informations principales
        const senderInfo = task.hasEmail ? 
            (task.emailFromName || task.emailFrom?.split('@')[0] || 'Email') : 
            (task.client || 'Interne');
        
        const timeInfo = this.formatTimeInfo(task.createdAt);
        const badges = this.getBadges(task);
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" 
                 data-task-id="${task.id}"
                 onclick="window.tasksView.handleTaskClick(event, '${task.id}')">
                
                <!-- Checkbox -->
                <div class="task-checkbox">
                    <input type="checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); window.tasksView.toggleTaskSelection('${task.id}')">
                </div>
                
                <!-- Contenu principal -->
                <div class="task-content">
                    <div class="task-title" style="border-left: 3px solid ${priorityColor}">
                        ${this.escapeHtml(task.title)}
                    </div>
                    <div class="task-meta">
                        <span class="task-sender">${this.escapeHtml(senderInfo)}</span>
                        ${badges.length > 0 ? `<span class="task-badges">${badges.join(' ')}</span>` : ''}
                        <span class="task-time">${timeInfo}</span>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="task-actions">
                    ${this.renderTaskActions(task)}
                </div>
            </div>
        `;
    }

    // ACTIONS DE LA TÂCHE
    renderTaskActions(task) {
        const actions = [];
        
        // Répondre (si email non répondu)
        if (task.hasEmail && !task.emailReplied && task.status !== 'completed') {
            actions.push(`
                <button class="task-action reply" 
                        onclick="event.stopPropagation(); window.tasksView.replyToEmail('${task.id}')"
                        title="Répondre">
                    <i class="fas fa-reply"></i>
                </button>
            `);
        }
        
        // Marquer terminé
        if (task.status !== 'completed') {
            actions.push(`
                <button class="task-action complete" 
                        onclick="event.stopPropagation(); window.tasksView.markComplete('${task.id}')"
                        title="Marquer terminé">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        // Plus d'options
        actions.push(`
            <button class="task-action more" 
                    onclick="event.stopPropagation(); window.tasksView.showTaskDetails('${task.id}')"
                    title="Voir détails">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        `);
        
        return actions.join('');
    }

    // ÉTAT VIDE
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h3>Aucune tâche trouvée</h3>
                <p>${this.hasActiveFilters() ? 'Aucune tâche ne correspond à vos critères' : 'Vous n\'avez aucune tâche'}</p>
                ${this.hasActiveFilters() ? `
                    <button class="btn-primary" onclick="window.tasksView.resetAllFilters()">
                        Réinitialiser les filtres
                    </button>
                ` : `
                    <button class="btn-primary" onclick="window.tasksView.showCreateModal()">
                        Créer votre première tâche
                    </button>
                `}
            </div>
        `;
    }

    // MÉTHODES UTILITAIRES
    getPriorityColor(priority) {
        const colors = {
            urgent: '#ef4444',
            high: '#f59e0b',
            medium: '#3b82f6',
            low: '#10b981'
        };
        return colors[priority] || colors.medium;
    }

    getBadges(task) {
        const badges = [];
        
        if (task.hasEmail && !task.emailReplied) {
            badges.push('<span class="badge email">📧</span>');
        }
        
        if (task.suggestedReplies && task.suggestedReplies.length > 0) {
            badges.push('<span class="badge ai">🤖</span>');
        }
        
        if (task.hasAttachments) {
            badges.push('<span class="badge attachment">📎</span>');
        }
        
        return badges;
    }

    formatTimeInfo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) { // < 1h
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 86400000) { // < 1j
            return `${Math.floor(diff / 3600000)}h`;
        } else if (diff < 604800000) { // < 1 semaine
            return `${Math.floor(diff / 86400000)}j`;
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    }

    // GESTION DES ÉVÉNEMENTS
    handleTaskClick(event, taskId) {
        if (event.ctrlKey || event.metaKey) {
            this.toggleTaskSelection(taskId);
        } else {
            this.showTaskDetails(taskId);
        }
    }

    filterByStatus(statusId) {
        // Reset autres filtres
        this.currentFilters = {
            ...this.currentFilters,
            status: 'all',
            overdue: false,
            needsReply: false
        };

        // Appliquer le nouveau filtre
        switch (statusId) {
            case 'all':
                break;
            case 'todo':
            case 'in-progress':
            case 'completed':
                this.currentFilters.status = statusId;
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

    isStatusActive(statusId) {
        switch (statusId) {
            case 'all':
                return this.currentFilters.status === 'all' && !this.currentFilters.overdue && !this.currentFilters.needsReply;
            case 'todo':
            case 'in-progress': 
            case 'completed':
                return this.currentFilters.status === statusId;
            case 'overdue':
                return this.currentFilters.overdue;
            case 'needsReply':
                return this.currentFilters.needsReply;
            default:
                return false;
        }
    }

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

    changeViewMode(mode) {
        this.currentViewMode = mode;
        this.refreshView();
    }

    toggleAdvancedFilters() {
        this.showAdvancedFilters = !this.showAdvancedFilters;
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
            tag: 'all',
            search: '',
            sortBy: 'created',
            dateRange: 'all',
            overdue: false,
            needsReply: false
        };
        
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        
        this.refreshView();
    }

    getActiveFiltersCount() {
        let count = 0;
        if (this.currentFilters.status !== 'all') count++;
        if (this.currentFilters.priority !== 'all') count++;
        if (this.currentFilters.client !== 'all') count++;
        if (this.currentFilters.search !== '') count++;
        if (this.currentFilters.overdue) count++;
        if (this.currentFilters.needsReply) count++;
        return count;
    }

    hasActiveFilters() {
        return this.getActiveFiltersCount() > 0;
    }

    buildClientFilterOptions() {
        const tasks = window.taskManager.getAllTasks();
        const clients = new Set();
        tasks.forEach(task => {
            if (task.client) clients.add(task.client);
        });
        
        let options = '<option value="all">Tous les clients</option>';
        Array.from(clients).sort().forEach(client => {
            const selected = this.currentFilters.client === client ? 'selected' : '';
            options += `<option value="${client}" ${selected}>${client}</option>`;
        });
        
        return options;
    }

    // ACTIONS SUR LES TÂCHES
    markComplete(taskId) {
        window.taskManager.updateTask(taskId, { status: 'completed' });
        this.showToast('Tâche marquée comme terminée', 'success');
    }

    replyToEmail(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task || !task.hasEmail) return;
        
        if (task.suggestedReplies && task.suggestedReplies.length > 0) {
            this.showSuggestedReplies(taskId);
        } else {
            this.replyToEmailBasic(taskId);
        }
    }

    replyToEmailBasic(taskId) {
        const task = window.taskManager.getTask(taskId);
        if (!task) return;
        
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

        // Modal simple pour les détails
        const modalHTML = `
            <div class="modal-overlay" onclick="this.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>Détails de la tâche</h2>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h3>${this.escapeHtml(task.title)}</h3>
                        ${task.description ? `<p>${this.escapeHtml(task.description)}</p>` : ''}
                        ${task.hasEmail ? `
                            <div class="email-info">
                                <strong>Email de:</strong> ${this.escapeHtml(task.emailFromName || task.emailFrom)}
                                ${task.emailSubject ? `<br><strong>Sujet:</strong> ${this.escapeHtml(task.emailSubject)}` : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Fermer</button>
                        ${task.status !== 'completed' ? `
                            <button class="btn-primary" onclick="window.tasksView.markComplete('${task.id}'); this.closest('.modal-overlay').remove();">
                                Marquer terminé
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    showSuggestedReplies(taskId) {
        // Implémentation des suggestions de réponse
        console.log('Affichage des suggestions pour:', taskId);
    }

    showCreateModal() {
        // Modal de création de tâche
        console.log('Création d\'une nouvelle tâche');
    }

    clearSearch() {
        this.currentFilters.search = '';
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) searchInput.value = '';
        this.refreshView();
    }

    refreshView() {
        const container = document.getElementById('tasksContainer');
        if (container) {
            container.innerHTML = this.renderTasksList();
        }
        
        // Mettre à jour les pills de statut
        const stats = window.taskManager.getStats();
        const statusContainer = document.querySelector('.status-filters');
        if (statusContainer) {
            statusContainer.innerHTML = this.renderStatusPills(stats);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value.trim();
                    this.refreshView();
                }, 300);
            });
        }
    }

    showToast(message, type = 'info') {
        if (window.uiManager && window.uiManager.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // STYLES CSS COMPLETS
    addTaskStyles() {
        if (document.getElementById('emailSortProTaskStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'emailSortProTaskStyles';
        styles.textContent = `
            /* Variables */
            :root {
                --primary-color: #6366f1;
                --success-color: #10b981;
                --warning-color: #f59e0b;
                --danger-color: #ef4444;
                --purple-color: #8b5cf6;
                --gray-50: #f9fafb;
                --gray-100: #f3f4f6;
                --gray-200: #e5e7eb;
                --gray-300: #d1d5db;
                --gray-400: #9ca3af;
                --gray-500: #6b7280;
                --gray-600: #4b5563;
                --gray-700: #374151;
                --gray-900: #111827;
                --border-radius: 8px;
                --box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            /* Page principale */
            .tasks-page {
                background: var(--gray-50);
                min-height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 20px;
            }
            
            /* En-tête */
            .tasks-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .tasks-title-section {
                display: flex;
                align-items: baseline;
                gap: 12px;
            }
            
            .page-title {
                font-size: 28px;
                font-weight: 700;
                color: var(--gray-900);
                margin: 0;
            }
            
            .tasks-counter {
                background: var(--gray-200);
                color: var(--gray-600);
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .search-section {
                flex: 1;
                max-width: 400px;
            }
            
            .search-container {
                position: relative;
            }
            
            .search-input {
                width: 100%;
                padding: 10px 16px 10px 40px;
                border: 1px solid var(--gray-300);
                border-radius: var(--border-radius);
                font-size: 14px;
                background: white;
                transition: border-color 0.2s;
            }
            
            .search-input:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
                font-size: 14px;
            }
            
            .header-actions {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .view-modes {
                display: flex;
                background: var(--gray-100);
                border-radius: var(--border-radius);
                padding: 2px;
            }
            
            .view-mode-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border: none;
                background: transparent;
                border-radius: 6px;
                color: var(--gray-600);
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .view-mode-btn.active {
                background: white;
                color: var(--gray-900);
                box-shadow: var(--box-shadow);
            }
            
            .new-task-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: var(--border-radius);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .new-task-btn:hover {
                background: #5856eb;
            }
            
            /* Filtres de statut */
            .status-filters {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            
            .status-pill {
                display: flex;
                align-items: center;
                gap: 8px;
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: 20px;
                padding: 8px 16px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
                font-weight: 500;
                color: var(--gray-700);
            }
            
            .status-pill:hover {
                border-color: var(--pill-color);
                background: var(--gray-50);
            }
            
            .status-pill.active {
                background: var(--pill-color);
                border-color: var(--pill-color);
                color: white;
            }
            
            .pill-count {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                min-width: 20px;
                text-align: center;
            }
            
            .status-pill.active .pill-count {
                background: rgba(255, 255, 255, 0.2);
            }
            
            /* Filtres avancés */
            .advanced-filters-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: var(--border-radius);
                padding: 10px 16px;
                cursor: pointer;
                margin-bottom: 16px;
                font-size: 14px;
                color: var(--gray-700);
                transition: all 0.2s;
                position: relative;
            }
            
            .advanced-filters-toggle:hover {
                background: var(--gray-50);
            }
            
            .active-filters-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--danger-color);
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
                min-width: 18px;
                text-align: center;
            }
            
            .advanced-filters {
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: var(--border-radius);
                margin-bottom: 16px;
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .advanced-filters.show {
                max-height: 200px;
                padding: 16px;
            }
            
            .filters-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                align-items: center;
            }
            
            .filter-select {
                padding: 8px 12px;
                border: 1px solid var(--gray-300);
                border-radius: var(--border-radius);
                background: white;
                font-size: 14px;
                color: var(--gray-700);
            }
            
            .reset-filters-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                background: var(--gray-100);
                border: 1px solid var(--gray-300);
                border-radius: var(--border-radius);
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                color: var(--gray-700);
                transition: background-color 0.2s;
            }
            
            .reset-filters-btn:hover {
                background: var(--gray-200);
            }
            
            /* Container des tâches */
            .tasks-container {
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: var(--border-radius);
                box-shadow: var(--box-shadow);
            }
            
            .tasks-list {
                display: flex;
                flex-direction: column;
            }
            
            /* Tâche individuelle */
            .task-item {
                display: flex;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid var(--gray-100);
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .task-item:last-child {
                border-bottom: none;
            }
            
            .task-item:hover {
                background: var(--gray-50);
            }
            
            .task-item.selected {
                background: rgba(99, 102, 241, 0.05);
                border-left: 3px solid var(--primary-color);
            }
            
            .task-item.completed {
                opacity: 0.6;
            }
            
            .task-item.completed .task-title {
                text-decoration: line-through;
            }
            
            .task-checkbox {
                margin-right: 12px;
            }
            
            .task-checkbox input {
                width: 16px;
                height: 16px;
                cursor: pointer;
            }
            
            .task-content {
                flex: 1;
                min-width: 0;
            }
            
            .task-title {
                font-size: 15px;
                font-weight: 600;
                color: var(--gray-900);
                margin-bottom: 4px;
                padding-left: 8px;
                border-left-width: 3px;
                border-left-style: solid;
            }
            
            .task-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 13px;
                color: var(--gray-500);
                flex-wrap: wrap;
            }
            
            .task-sender {
                font-weight: 500;
                color: var(--gray-600);
            }
            
            .task-badges {
                display: flex;
                gap: 4px;
            }
            
            .badge {
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 10px;
                background: var(--gray-100);
            }
            
            .badge.email {
                background: rgba(99, 102, 241, 0.1);
                color: var(--primary-color);
            }
            
            .badge.ai {
                background: rgba(139, 92, 246, 0.1);
                color: var(--purple-color);
            }
            
            .task-actions {
                display: flex;
                gap: 4px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .task-item:hover .task-actions {
                opacity: 1;
            }
            
            .task-action {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 6px;
                background: var(--gray-100);
                color: var(--gray-600);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-size: 13px;
            }
            
            .task-action:hover {
                background: var(--gray-200);
            }
            
            .task-action.reply:hover {
                background: rgba(99, 102, 241, 0.1);
                color: var(--primary-color);
            }
            
            .task-action.complete:hover {
                background: rgba(16, 185, 129, 0.1);
                color: var(--success-color);
            }
            
            /* État vide */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: var(--gray-500);
            }
            
            .empty-icon {
                font-size: 48px;
                color: var(--gray-300);
                margin-bottom: 16px;
            }
            
            .empty-state h3 {
                font-size: 18px;
                color: var(--gray-700);
                margin-bottom: 8px;
            }
            
            .empty-state p {
                margin-bottom: 24px;
            }
            
            /* Boutons */
            .btn-primary {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: var(--border-radius);
                font-size: 14px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .btn-primary:hover {
                background: #5856eb;
            }
            
            .btn-secondary {
                background: var(--gray-100);
                color: var(--gray-700);
                border: 1px solid var(--gray-300);
                padding: 10px 20px;
                border-radius: var(--border-radius);
                font-size: 14px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .btn-secondary:hover {
                background: var(--gray-200);
            }
            
            /* Loading */
            .loading-wrapper {
                text-align: center;
                padding: 60px 20px;
                color: var(--gray-500);
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--gray-200);
                border-top: 3px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Modal */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: var(--border-radius);
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--gray-200);
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                color: var(--gray-900);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                color: var(--gray-400);
                cursor: pointer;
                padding: 4px;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 20px;
                border-top: 1px solid var(--gray-200);
            }
            
            .email-info {
                background: var(--gray-50);
                padding: 12px;
                border-radius: var(--border-radius);
                margin-top: 12px;
                font-size: 14px;
                color: var(--gray-700);
                line-height: 1.5;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .tasks-page {
                    padding: 12px;
                }
                
                .tasks-header {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
                
                .search-section {
                    max-width: none;
                }
                
                .header-actions {
                    justify-content: space-between;
                }
                
                .page-title {
                    font-size: 24px;
                }
                
                .status-filters {
                    gap: 6px;
                }
                
                .status-pill {
                    padding: 6px 12px;
                    font-size: 13px;
                }
                
                .pill-label {
                    display: none;
                }
                
                .task-item {
                    padding: 12px;
                }
                
                .task-title {
                    font-size: 14px;
                }
                
                .task-meta {
                    font-size: 12px;
                }
                
                .task-actions {
                    opacity: 1;
                }
                
                .view-mode-btn span {
                    display: none;
                }
                
                .new-task-btn span {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// INITIALISATION GLOBALE
function initializeTasksView() {
    console.log('[TasksView] Initializing EmailSortPro interface...');
    
    if (!window.tasksView) {
        window.tasksView = new TasksView();
    }
    
    // Bind methods
    Object.getOwnPropertyNames(TasksView.prototype).forEach(name => {
        if (name !== 'constructor' && typeof window.tasksView[name] === 'function') {
            window.tasksView[name] = window.tasksView[name].bind(window.tasksView);
        }
    });
    
    console.log('✅ TasksView EmailSortPro interface loaded');
}

// Initialisation
initializeTasksView();
document.addEventListener('DOMContentLoaded', initializeTasksView);
window.addEventListener('load', () => {
    setTimeout(initializeTasksView, 500);
});
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
    
    console.log('✅ TaskManager v8.4 CORRIGÉ loaded - Avec affichage email complet et suggestions de réponse personnalisées');
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
