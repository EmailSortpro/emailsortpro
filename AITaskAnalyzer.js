// AITaskAnalyzer.js - Enhanced Version avec vraie analyse IA Claude

class AITaskAnalyzer {
    constructor() {
        // Configuration pour l'API Claude via proxy
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-haiku-20240307';
        this.maxTokens = 4096;
        
        // Solutions pour contourner CORS
        this.corsProxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://proxy.cors.sh/'
        ];
        
        // Configuration du proxy local (recommandé)
        this.localProxyUrl = 'http://localhost:3001/api/claude';
        this.useLocalProxy = true;
        
        // Clé API
        this.apiKey = localStorage.getItem('claude_api_key') || '';
        
        // Mode de fonctionnement
        this.mode = 'hybrid'; // 'api-only', 'local-only', 'hybrid'
        this.apiAvailable = false;
        this.lastApiTest = null;
        
        // Cache des analyses
        this.analysisCache = new Map();
        this.responseCache = new Map();
        this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
        
        // Initialiser le générateur de réponses IA
        this.responseGenerator = new AIEmailResponseGenerator();
        
        // Templates de prompts optimisés pour l'analyse complète
        this.promptTemplates = {
            emailAnalysis: this.getEnhancedEmailAnalysisPrompt()
        };
        
        // Patterns d'analyse locale améliorés (fallback)
        this.analysisPatterns = {
            actions: [
                { regex: /merci de (.+)/gi, type: 'request', weight: 3 },
                { regex: /veuillez (.+)/gi, type: 'request', weight: 3 },
                { regex: /pourriez-vous (.+)/gi, type: 'question', weight: 2 },
                { regex: /pouvez-vous (.+)/gi, type: 'question', weight: 2 },
                { regex: /please (.+)/gi, type: 'request', weight: 3 },
                { regex: /could you (.+)/gi, type: 'question', weight: 2 },
                { regex: /can you (.+)/gi, type: 'question', weight: 2 },
                { regex: /would you (.+)/gi, type: 'question', weight: 2 },
                { regex: /il faut (.+)/gi, type: 'requirement', weight: 3 },
                { regex: /nous devons (.+)/gi, type: 'requirement', weight: 3 },
                { regex: /we need to (.+)/gi, type: 'requirement', weight: 3 },
                { regex: /we must (.+)/gi, type: 'requirement', weight: 3 },
                { regex: /à faire\s*:?\s*(.+)/gi, type: 'todo', weight: 4 },
                { regex: /to do\s*:?\s*(.+)/gi, type: 'todo', weight: 4 },
                { regex: /action requise\s*:?\s*(.+)/gi, type: 'action', weight: 4 },
                { regex: /action required\s*:?\s*(.+)/gi, type: 'action', weight: 4 },
                { regex: /deadline\s*:?\s*(.+)/gi, type: 'deadline', weight: 5 },
                { regex: /due date\s*:?\s*(.+)/gi, type: 'deadline', weight: 5 },
                { regex: /avant le (.+)/gi, type: 'deadline', weight: 4 },
                { regex: /by (.+)/gi, type: 'deadline', weight: 4 },
                { regex: /before (.+)/gi, type: 'deadline', weight: 4 },
                { regex: /d'ici (.+)/gi, type: 'deadline', weight: 4 }
            ],
            urgency: [
                { regex: /urgent/gi, weight: 10 },
                { regex: /asap/gi, weight: 10 },
                { regex: /immédiat/gi, weight: 10 },
                { regex: /immediate/gi, weight: 10 },
                { regex: /critique/gi, weight: 8 },
                { regex: /critical/gi, weight: 8 },
                { regex: /important/gi, weight: 6 },
                { regex: /priorité/gi, weight: 6 },
                { regex: /priority/gi, weight: 6 },
                { regex: /aujourd'hui/gi, weight: 8 },
                { regex: /today/gi, weight: 8 },
                { regex: /ce soir/gi, weight: 8 },
                { regex: /tonight/gi, weight: 8 },
                { regex: /demain/gi, weight: 5 },
                { regex: /tomorrow/gi, weight: 5 },
                { regex: /cette semaine/gi, weight: 3 },
                { regex: /this week/gi, weight: 3 },
                { regex: /dès que possible/gi, weight: 7 },
                { regex: /as soon as possible/gi, weight: 7 },
                { regex: /au plus vite/gi, weight: 7 },
                { regex: /rapidement/gi, weight: 5 },
                { regex: /quickly/gi, weight: 5 },
                { regex: /délai/gi, weight: 6 },
                { regex: /échéance/gi, weight: 7 },
                { regex: /deadline/gi, weight: 8 }
            ]
        };
        
        // Initialisation
        this.init();
    }

    async init() {
        console.log('[AITaskAnalyzer] Initializing Enhanced version with real AI...');
        
        // Vérifier si une clé API est stockée
        if (this.apiKey) {
            console.log('[AITaskAnalyzer] API key found, will use real AI analysis');
            this.apiAvailable = true;
        } else {
            console.log('[AITaskAnalyzer] No API key configured, using enhanced local analysis');
        }
    }

    isConfigured() {
        return true; // Toujours true car on a le fallback local
    }

    // ================================================
    // MÉTHODE PRINCIPALE - Compatible avec TaskManager
    // ================================================
    
    async analyzeEmailForTasks(email, options = {}) {
        console.log('[AITaskAnalyzer] Starting enhanced analysis for:', email.subject);
        
        // Vérifier le cache
        const cacheKey = `analysis_${email.id}`;
        const cached = this.getFromCache(cacheKey);
        if (cached && !options.forceRefresh) {
            console.log('[AITaskAnalyzer] Returning cached analysis');
            return cached;
        }

        try {
            let analysis;
            
            // Si l'API est demandée et qu'on a une clé
            if ((options.useApi || this.mode === 'api-only' || this.mode === 'hybrid') && this.apiKey) {
                try {
                    console.log('[AITaskAnalyzer] Attempting real AI analysis...');
                    analysis = await this.performRealAIAnalysis(email);
                    console.log('[AITaskAnalyzer] Real AI analysis completed successfully');
                } catch (apiError) {
                    console.log('[AITaskAnalyzer] AI API failed, falling back to enhanced local:', apiError.message);
                    analysis = await this.performEnhancedLocalAnalysis(email);
                }
            } else {
                // Utiliser l'analyse locale par défaut
                analysis = await this.performEnhancedLocalAnalysis(email);
            }
            
            // Enrichir l'analyse avec les métadonnées de l'email
            analysis.emailId = email.id;
            analysis.analyzedAt = new Date().toISOString();
            analysis.emailMetadata = {
                sender: email.from?.emailAddress?.name || 'Unknown',
                senderEmail: email.from?.emailAddress?.address || '',
                subject: email.subject || 'No subject',
                date: email.receivedDateTime,
                hasAttachments: email.hasAttachments || false,
                fullContent: this.extractEmailContent(email),
                webLink: email.webLink || null
            };
            
            // Générer les vraies réponses IA si possible
            if (this.apiKey && (analysis.method === 'claude-ai' || options.generateReplies)) {
                try {
                    console.log('[AITaskAnalyzer] Generating real AI responses...');
                    const aiResponses = await this.generateRealAIResponses(email, analysis);
                    if (aiResponses && aiResponses.length > 0) {
                        analysis.suggestedReplies = aiResponses;
                        analysis.aiRepliesGenerated = true;
                        analysis.aiRepliesGeneratedAt = new Date().toISOString();
                        console.log(`[AITaskAnalyzer] Generated ${aiResponses.length} real AI responses`);
                    }
                } catch (error) {
                    console.log('[AITaskAnalyzer] AI response generation failed, using fallback');
                    analysis.suggestedReplies = this.generateBasicReplies(analysis.emailMetadata);
                }
            } else {
                analysis.suggestedReplies = this.generateBasicReplies(analysis.emailMetadata);
            }
            
            // Mettre en cache
            this.setCache(cacheKey, analysis);
            
            return analysis;

        } catch (error) {
            console.error('[AITaskAnalyzer] Analysis error:', error);
            // Retourner une analyse basique en cas d'erreur
            return this.createBasicAnalysis(email);
        }
    }

    // ================================================
    // NOUVELLE ANALYSE IA RÉELLE
    // ================================================
    
    async performRealAIAnalysis(email) {
        const emailContent = this.extractEmailContent(email);
        const emailMetadata = this.extractEmailMetadata(email);
        
        try {
            // Utiliser le nouveau générateur pour l'analyse complète
            const result = await this.responseGenerator.processEmailForResponses(email, {
                generateReplies: true,
                userPreferences: { language: 'fr' }
            });
            
            if (result.success && result.analysis) {
                // Convertir l'analyse IA au format TaskManager
                return this.convertAIAnalysisToTaskFormat(result.analysis, result.responses, email);
            } else {
                throw new Error('AI analysis failed: ' + (result.error || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('[AITaskAnalyzer] Real AI analysis error:', error);
            throw error;
        }
    }

    async generateRealAIResponses(email, analysis) {
        try {
            const responses = await this.responseGenerator.generatePersonalizedResponses(email, null, {
                userPreferences: { language: 'fr' },
                businessContext: 'professional'
            });
            
            return responses.map(response => ({
                tone: response.tone || 'professionnel',
                subject: response.subject,
                content: response.content,
                description: response.description || this.getToneDescription(response.tone),
                generatedBy: 'claude-ai',
                generatedAt: response.generatedAt,
                confidence: response.confidence || 0.85,
                keyPoints: response.keyPoints || [],
                callToAction: response.callToAction,
                estimatedImpact: response.estimatedImpact,
                wordCount: response.wordCount,
                readingTime: response.readingTime
            }));
            
        } catch (error) {
            console.error('[AITaskAnalyzer] Real AI response generation error:', error);
            return null;
        }
    }

    convertAIAnalysisToTaskFormat(aiAnalysis, aiResponses, email) {
        const emailMetadata = this.extractEmailMetadata(email);
        
        // Convertir l'analyse IA au format attendu par TaskManager
        const taskAnalysis = {
            summary: aiAnalysis.summary || 'Analyse générée par IA',
            importance: this.mapUrgencyToImportance(aiAnalysis.urgencyAssessment?.level),
            
            // Actions extraites de l'analyse IA
            actionsHighlighted: this.extractActionsFromAIAnalysis(aiAnalysis),
            
            // Tâche principale enrichie
            mainTask: this.createMainTaskFromAIAnalysis(aiAnalysis, email, emailMetadata),
            
            // Sous-tâches basées sur les demandes explicites
            subtasks: this.createSubtasksFromAIAnalysis(aiAnalysis),
            
            // Points d'action détaillés
            actionPoints: this.createActionPointsFromAIAnalysis(aiAnalysis),
            
            // Insights enrichis
            insights: {
                keyInfo: aiAnalysis.contentAnalysis?.keyInformation?.map(info => info.content) || [],
                risks: aiAnalysis.risks?.map(risk => risk.description) || [],
                opportunities: aiAnalysis.opportunities?.map(opp => opp.description) || [],
                emailTone: aiAnalysis.senderAnalysis?.emotionalTone || 'neutre',
                responseExpected: aiAnalysis.contentAnalysis?.followUpNeeded || true,
                attachments: aiAnalysis.contentAnalysis?.attachments ? [aiAnalysis.contentAnalysis.attachments] : [],
                contacts: this.extractContacts(this.extractEmailContent(email)),
                links: this.extractLinks(this.extractEmailContent(email))
            },
            
            // Extraits importants
            importantExcerpts: this.createImportantExcerpts(aiAnalysis),
            
            // Métadonnées
            emailMetadata: emailMetadata,
            category: this.mapBusinessContextToCategory(aiAnalysis.contextualInsights?.businessContext),
            suggestedDeadline: this.extractDeadlineFromAIAnalysis(aiAnalysis),
            tags: this.generateTagsFromAIAnalysis(aiAnalysis, email),
            
            // Informations sur la méthode
            method: 'claude-ai',
            confidence: aiAnalysis.confidence || 0.9,
            aiAnalysis: aiAnalysis, // Stocker l'analyse complète
            
            // Réponses IA si disponibles
            suggestedReplies: aiResponses || []
        };
        
        return taskAnalysis;
    }

    extractActionsFromAIAnalysis(aiAnalysis) {
        const actions = [];
        
        // Actions explicites
        if (aiAnalysis.contentAnalysis?.explicitRequests) {
            aiAnalysis.contentAnalysis.explicitRequests.forEach((request, index) => {
                actions.push({
                    action: request.request,
                    location: `Demande explicite ${index + 1}`,
                    excerpt: request.actionRequired || request.request,
                    deadline: request.deadline,
                    type: 'explicit',
                    priority: this.mapUrgencyToPriority(request.urgency)
                });
            });
        }
        
        // Actions implicites
        if (aiAnalysis.contentAnalysis?.implicitRequests) {
            aiAnalysis.contentAnalysis.implicitRequests.forEach((request, index) => {
                actions.push({
                    action: request.request,
                    location: `Demande implicite ${index + 1}`,
                    excerpt: request.reasoning,
                    deadline: null,
                    type: 'implicit',
                    priority: 'medium'
                });
            });
        }
        
        return actions;
    }

    createMainTaskFromAIAnalysis(aiAnalysis, email, emailMetadata) {
        const mainPurpose = aiAnalysis.contentAnalysis?.mainPurpose || 'Traiter cet email';
        const priority = this.mapUrgencyToImportance(aiAnalysis.urgencyAssessment?.level);
        const deadline = this.extractDeadlineFromAIAnalysis(aiAnalysis);
        
        // Créer une description enrichie
        let description = `📧 EMAIL ANALYSÉ PAR IA CLAUDE\n`;
        description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        description += `De: ${emailMetadata.senderName} (${emailMetadata.senderEmail})\n`;
        description += `Sujet: ${emailMetadata.subject}\n`;
        description += `Date: ${new Date(emailMetadata.date).toLocaleString('fr-FR')}\n\n`;
        
        description += `🎯 OBJECTIF PRINCIPAL:\n${mainPurpose}\n\n`;
        
        if (aiAnalysis.contentAnalysis?.secondaryPurposes?.length > 0) {
            description += `📋 OBJECTIFS SECONDAIRES:\n`;
            aiAnalysis.contentAnalysis.secondaryPurposes.forEach(purpose => {
                description += `• ${purpose}\n`;
            });
            description += `\n`;
        }
        
        if (aiAnalysis.urgencyAssessment?.reasoning) {
            description += `⏰ URGENCE: ${aiAnalysis.urgencyAssessment.level.toUpperCase()}\n`;
            description += `Justification: ${aiAnalysis.urgencyAssessment.reasoning}\n\n`;
        }
        
        if (aiAnalysis.responseStrategy?.suggestedApproach) {
            description += `💡 APPROCHE SUGGÉRÉE:\n${aiAnalysis.responseStrategy.suggestedApproach}\n\n`;
        }
        
        description += `📝 CONTENU COMPLET DE L'EMAIL:\n`;
        description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        description += this.extractEmailContent(email);
        description += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        return {
            title: this.cleanTitle(mainPurpose),
            priority: priority,
            dueDate: deadline,
            description: description,
            emailId: email.id,
            emailSubject: emailMetadata.subject,
            emailSender: emailMetadata.senderName,
            emailDate: emailMetadata.date,
            hasFullContent: true,
            aiGenerated: true
        };
    }

    createSubtasksFromAIAnalysis(aiAnalysis) {
        const subtasks = [];
        
        // Sous-tâches basées sur les points clés à adresser
        if (aiAnalysis.responseStrategy?.keyPointsToAddress) {
            aiAnalysis.responseStrategy.keyPointsToAddress.slice(0, 3).forEach(point => {
                subtasks.push({
                    title: this.cleanTitle(point),
                    priority: 'medium'
                });
            });
        }
        
        // Sous-tâches basées sur les informations nécessaires
        if (aiAnalysis.responseStrategy?.informationNeeded) {
            aiAnalysis.responseStrategy.informationNeeded.slice(0, 2).forEach(info => {
                subtasks.push({
                    title: `Clarifier: ${this.cleanTitle(info)}`,
                    priority: 'high'
                });
            });
        }
        
        return subtasks.slice(0, 3); // Maximum 3 sous-tâches
    }

    createActionPointsFromAIAnalysis(aiAnalysis) {
        const actionPoints = [];
        
        // Points d'action explicites
        if (aiAnalysis.contentAnalysis?.explicitRequests) {
            aiAnalysis.contentAnalysis.explicitRequests.forEach(request => {
                actionPoints.push(`${request.actionRequired || request.request} (Explicite)`);
            });
        }
        
        // Points d'action suggérés
        if (aiAnalysis.responseStrategy?.keyPointsToAddress) {
            aiAnalysis.responseStrategy.keyPointsToAddress.forEach(point => {
                actionPoints.push(point);
            });
        }
        
        return actionPoints.slice(0, 5); // Maximum 5 points d'action
    }

    createImportantExcerpts(aiAnalysis) {
        const excerpts = [];
        
        // Informations clés critiques
        if (aiAnalysis.contentAnalysis?.keyInformation) {
            aiAnalysis.contentAnalysis.keyInformation
                .filter(info => info.importance === 'critical' || info.importance === 'high')
                .forEach(info => {
                    excerpts.push({
                        text: info.content,
                        context: info.context || 'Information critique',
                        actionRequired: info.importance === 'critical',
                        priority: info.importance
                    });
                });
        }
        
        // Risques identifiés
        if (aiAnalysis.risks) {
            aiAnalysis.risks
                .filter(risk => risk.impact === 'high')
                .forEach(risk => {
                    excerpts.push({
                        text: risk.description,
                        context: `Risque ${risk.type}`,
                        actionRequired: true,
                        priority: 'high'
                    });
                });
        }
        
        return excerpts.slice(0, 5);
    }

    // ================================================
    // MÉTHODES DE MAPPING ET UTILITAIRES
    // ================================================
    
    mapUrgencyToImportance(urgencyLevel) {
        const mapping = {
            'urgent': 'urgent',
            'high': 'high',
            'medium': 'medium',
            'low': 'low'
        };
        return mapping[urgencyLevel] || 'medium';
    }

    mapUrgencyToPriority(urgencyLevel) {
        const mapping = {
            'urgent': 'urgent',
            'high': 'high',
            'medium': 'medium',
            'low': 'low'
        };
        return mapping[urgencyLevel] || 'medium';
    }

    mapBusinessContextToCategory(businessContext) {
        if (!businessContext) return 'email';
        
        const context = businessContext.toLowerCase();
        if (context.includes('réunion') || context.includes('meeting')) return 'meeting';
        if (context.includes('finance') || context.includes('budget')) return 'finance';
        if (context.includes('projet') || context.includes('project')) return 'project';
        if (context.includes('client') || context.includes('customer')) return 'client';
        if (context.includes('sécurité') || context.includes('security')) return 'security';
        
        return 'email';
    }

    extractDeadlineFromAIAnalysis(aiAnalysis) {
        // Chercher dans les demandes explicites
        if (aiAnalysis.contentAnalysis?.explicitRequests) {
            for (const request of aiAnalysis.contentAnalysis.explicitRequests) {
                if (request.deadline) {
                    return this.validateDate(request.deadline);
                }
            }
        }
        
        // Utiliser le délai suggéré par l'IA
        if (aiAnalysis.urgencyAssessment?.timeframe) {
            return this.convertTimeframeToDate(aiAnalysis.urgencyAssessment.timeframe);
        }
        
        return null;
    }

    generateTagsFromAIAnalysis(aiAnalysis, email) {
        const tags = new Set();
        
        // Tags basés sur l'analyse
        if (aiAnalysis.urgencyAssessment?.level) {
            tags.add(aiAnalysis.urgencyAssessment.level);
        }
        
        if (aiAnalysis.senderAnalysis?.relationshipType) {
            tags.add(aiAnalysis.senderAnalysis.relationshipType);
        }
        
        if (aiAnalysis.contextualInsights?.businessContext) {
            const context = aiAnalysis.contextualInsights.businessContext.toLowerCase();
            if (context.includes('urgent')) tags.add('urgent');
            if (context.includes('projet')) tags.add('projet');
            if (context.includes('client')) tags.add('client');
        }
        
        // Tags basés sur l'email
        const domain = email.from?.emailAddress?.address?.split('@')[1]?.split('.')[0];
        if (domain && domain.length > 2 && !['gmail', 'outlook', 'yahoo', 'hotmail'].includes(domain)) {
            tags.add(domain.toLowerCase());
        }
        
        return Array.from(tags).slice(0, 5);
    }

    convertTimeframeToDate(timeframe) {
        const today = new Date();
        
        if (/immédiat|aujourd'hui|today/i.test(timeframe)) {
            return today.toISOString().split('T')[0];
        }
        
        if (/demain|tomorrow/i.test(timeframe)) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }
        
        if (/24.*h/i.test(timeframe)) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }
        
        if (/48.*h/i.test(timeframe)) {
            const dayAfter = new Date(today);
            dayAfter.setDate(dayAfter.getDate() + 2);
            return dayAfter.toISOString().split('T')[0];
        }
        
        if (/semaine|week/i.test(timeframe)) {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return nextWeek.toISOString().split('T')[0];
        }
        
        return null;
    }

    cleanTitle(title) {
        if (!title) return 'Tâche sans titre';
        
        return title
            .replace(/^(re|tr|fwd?):\s*/i, '')
            .replace(/^\w+\s*:\s*/, '') // Enlever "Action:", "TODO:", etc.
            .trim()
            .substring(0, 100);
    }

    getToneDescription(tone) {
        const descriptions = {
            'professional': 'Réponse professionnelle et formelle',
            'professionnel': 'Réponse professionnelle et formelle',
            'detailed': 'Réponse complète et détaillée',
            'détaillé': 'Réponse complète et détaillée',
            'concise': 'Réponse concise et directe',
            'urgent': 'Réponse adaptée au caractère urgent',
            'friendly': 'Réponse chaleureuse et accessible',
            'amical': 'Réponse chaleureuse et accessible'
        };
        return descriptions[tone] || 'Réponse personnalisée';
    }

    // ================================================
    // MÉTHODES EXISTANTES PRÉSERVÉES (pour compatibilité)
    // ================================================
    
    async performEnhancedLocalAnalysis(email) {
        const subject = email.subject || '';
        const content = this.extractEmailContent(email);
        const sender = email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Unknown';
        const senderEmail = email.from?.emailAddress?.address || '';
        const fullText = (subject + ' ' + content).toLowerCase();
        
        // 1. Extraire toutes les actions et informations importantes
        const extractedActions = this.extractDetailedActions(content);
        const urgencyScore = this.calculateUrgencyScore(fullText, subject);
        const category = this.detectCategory(fullText, senderEmail);
        const extractedDates = this.extractAllDates(fullText);
        const keyPhrases = this.extractKeyPhrases(fullText);
        const attachments = this.extractAttachments(content);
        const contacts = this.extractContacts(content);
        const links = this.extractLinks(content);
        
        // 2. Générer un résumé intelligent
        const summary = this.generateIntelligentSummary(subject, content, extractedActions, urgencyScore);
        
        // 3. Déterminer l'importance
        const importance = urgencyScore > 70 ? 'urgent' : 
                          urgencyScore > 50 ? 'high' : 
                          urgencyScore > 30 ? 'medium' : 'low';
        
        // 4. Identifier et mettre en évidence les actions
        const actionsHighlighted = this.highlightDetailedActions(content, extractedActions);
        
        // 5. Créer la tâche principale avec TOUT le contenu
        const mainTask = this.createEnhancedMainTask(email, subject, content, sender, importance, extractedDates[0]);
        
        // 6. Générer des sous-tâches intelligentes
        const subtasks = this.generateIntelligentSubtasks(extractedActions, category);
        
        // 7. Points d'action détaillés
        const actionPoints = this.generateDetailedActionPoints(extractedActions, content);
        
        // 8. Générer des suggestions de réponse contextuelles
        const suggestedReplies = this.generateBasicReplies({
            senderName: sender,
            senderEmail: senderEmail,
            subject: subject,
            date: email.receivedDateTime
        });
        
        // 9. Extraire les insights
        const insights = this.extractDetailedInsights(content, category, urgencyScore, extractedActions, attachments, contacts, links);
        
        // 10. Extraire les passages importants
        const importantExcerpts = this.extractImportantPassages(content, extractedActions);
        
        // 11. Suggérer une deadline appropriée
        const suggestedDeadline = extractedDates[0] || this.suggestAppropriateDeadline(urgencyScore, category);
        
        // 12. Générer des tags pertinents
        const tags = this.generateRelevantTags(email, category, keyPhrases, sender);
        
        return {
            summary: summary,
            importance: importance,
            actionsHighlighted: actionsHighlighted,
            mainTask: mainTask,
            subtasks: subtasks,
            actionPoints: actionPoints,
            suggestedReplies: suggestedReplies,
            insights: insights,
            importantExcerpts: importantExcerpts,
            category: category,
            suggestedDeadline: suggestedDeadline,
            tags: tags,
            method: 'local-enhanced',
            confidence: this.calculateConfidence(extractedActions, urgencyScore)
        };
    }

    generateBasicReplies(emailMetadata) {
        const senderName = emailMetadata.senderName || emailMetadata.senderEmail?.split('@')[0] || 'l\'expéditeur';
        const subject = emailMetadata.subject || 'votre message';
        
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

    extractEmailMetadata(email) {
        return {
            senderName: email.from?.emailAddress?.name || 'Expéditeur',
            senderEmail: email.from?.emailAddress?.address || '',
            subject: email.subject || 'Sans sujet',
            date: email.receivedDateTime ? new Date(email.receivedDateTime).toISOString() : new Date().toISOString(),
            hasAttachments: email.hasAttachments || false,
            importance: email.importance || 'normal'
        };
    }

    // ================================================
    // GESTION DES PROMPTS IA
    // ================================================
    
    getEnhancedEmailAnalysisPrompt() {
        return `Tu es un assistant expert en communication professionnelle et analyse d'emails. Analyse cet email de manière exhaustive pour créer une tâche complète dans un système de gestion.

EMAIL À ANALYSER:
De: {senderName} <{senderEmail}>
Sujet: {subject}
Date: {date}
Contenu: {content}

ANALYSE REQUISE (format JSON TaskManager):
{
  "summary": "Résumé exécutif en 2-3 phrases précises",
  "importance": "urgent|high|medium|low",
  "actionsHighlighted": [
    {
      "action": "Action spécifique requise",
      "location": "Emplacement dans l'email",
      "excerpt": "Citation exacte",
      "deadline": "YYYY-MM-DD ou null",
      "type": "request|question|deadline|action",
      "priority": "urgent|high|medium|low"
    }
  ],
  "mainTask": {
    "title": "Titre concis et clair de la tâche principale (max 100 caractères)",
    "priority": "urgent|high|medium|low",
    "dueDate": "YYYY-MM-DD ou null",
    "description": "Description complète incluant TOUT le contexte de l'email"
  },
  "subtasks": [
    {
      "title": "Sous-tâche spécifique",
      "priority": "high|medium|low"
    }
  ],
  "actionPoints": [
    "Point d'action précis 1",
    "Point d'action précis 2"
  ],
  "insights": {
    "keyInfo": ["Information clé 1", "Information clé 2"],
    "risks": ["Risque identifié"],
    "opportunities": ["Opportunité détectée"],
    "emailTone": "formel|urgent|amical|neutre",
    "responseExpected": true|false,
    "attachments": ["Pièces jointes mentionnées"],
    "contacts": ["Contacts extraits"],
    "links": ["Liens importants"]
  },
  "importantExcerpts": [
    {
      "text": "Citation exacte importante",
      "context": "Pourquoi c'est important",
      "actionRequired": true|false,
      "priority": "high|medium|low"
    }
  ],
  "category": "email|meeting|finance|project|client|security|tasks",
  "suggestedDeadline": "YYYY-MM-DD ou null",
  "tags": ["tag1", "tag2", "tag3"]
}

EXIGENCES:
1. Analyse TOUT le contenu de l'email
2. Identifie TOUTES les demandes explicites et implicites
3. Propose des délais réalistes
4. Adapte l'urgence au contexte
5. Inclus le contenu complet dans la description
6. Sois précis et actionnable`;
    }

    // ================================================
    // MÉTHODES EXISTANTES PRÉSERVÉES (inchangées)
    // ================================================
    
    extractEmailContent(email) {
        let content = '';
        
        if (email.body && email.body.content) {
            content = email.body.content;
        } else if (email.bodyPreview) {
            content = email.bodyPreview;
        }
        
        if (content.includes('<') && content.includes('>')) {
            content = content
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>/gi, '\n')
                .replace(/<p[^>]*>/gi, '\n')
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .replace(/\n\s*\n/g, '\n\n')
                .replace(/[ \t]+/g, ' ')
                .trim();
        }
        
        return content;
    }

    // Toutes les autres méthodes existantes sont préservées...
    // (extractDetailedActions, calculateUrgencyScore, detectCategory, etc.)
    
    extractDetailedActions(content) {
        const actions = [];
        const lines = content.split(/[\n.!?]+/);
        
        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();
            if (trimmedLine.length < 10) return;
            
            this.analysisPatterns.actions.forEach(pattern => {
                const matches = trimmedLine.match(pattern.regex);
                if (matches) {
                    matches.forEach(match => {
                        const actionText = match.replace(pattern.regex, '$1').trim();
                        if (actionText.length > 5) {
                            actions.push({
                                text: actionText,
                                type: pattern.type,
                                weight: pattern.weight,
                                line: lineIndex + 1,
                                fullMatch: match,
                                context: trimmedLine
                            });
                        }
                    });
                }
            });
        });
        
        return actions
            .sort((a, b) => b.weight - a.weight)
            .filter((action, index, self) => 
                index === self.findIndex(a => a.text === action.text)
            );
    }

    calculateUrgencyScore(text, subject) {
        let score = 0;
        
        if (/urgent|asap|important/i.test(subject)) {
            score += 20;
        }
        
        this.analysisPatterns.urgency.forEach(pattern => {
            const matches = text.match(pattern.regex);
            if (matches) {
                score += pattern.weight * matches.length;
            }
        });
        
        const dates = this.extractAllDates(text);
        if (dates.length > 0) {
            const firstDate = new Date(dates[0]);
            const today = new Date();
            const daysDiff = Math.ceil((firstDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 0) score += 20;
            else if (daysDiff <= 1) score += 15;
            else if (daysDiff <= 3) score += 10;
            else if (daysDiff <= 7) score += 5;
        }
        
        return Math.min(score, 100);
    }

    detectCategory(text, senderEmail) {
        const categories = {
            meeting: ['meeting', 'réunion', 'call', 'visio', 'rendez-vous', 'agenda', 'calendrier', 'zoom', 'teams'],
            finance: ['facture', 'invoice', 'payment', 'paiement', 'devis', 'budget', 'comptabilité', 'remboursement'],
            project: ['projet', 'project', 'sprint', 'milestone', 'roadmap', 'planning', 'livrable'],
            client: ['client', 'customer', 'prospect', 'commercial', 'contrat', 'proposition'],
            security: ['sécurité', 'security', 'password', 'mot de passe', 'connexion', 'authentification'],
            tasks: ['tâche', 'task', 'action', 'todo', 'assignment', 'livrable']
        };
        
        let bestCategory = 'email';
        let bestScore = 0;
        
        Object.entries(categories).forEach(([cat, keywords]) => {
            let score = 0;
            keywords.forEach(keyword => {
                if (text.includes(keyword)) score += 2;
            });
            
            if (score > bestScore) {
                bestCategory = cat;
                bestScore = score;
            }
        });
        
        return bestCategory;
    }

    extractAllDates(text) {
        const dates = [];
        const today = new Date();
        
        const datePatterns = [
            { 
                regex: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g, 
                handler: (match) => {
                    const [_, day, month, year] = match;
                    const fullYear = year.length === 2 ? '20' + year : year;
                    return new Date(fullYear, month - 1, day);
                }
            },
            { regex: /aujourd'hui/gi, handler: () => new Date(today) },
            { regex: /today/gi, handler: () => new Date(today) },
            { regex: /demain/gi, handler: () => {
                const date = new Date(today);
                date.setDate(date.getDate() + 1);
                return date;
            }},
            { regex: /tomorrow/gi, handler: () => {
                const date = new Date(today);
                date.setDate(date.getDate() + 1);
                return date;
            }}
        ];
        
        datePatterns.forEach(({ regex, handler }) => {
            const matches = [...text.matchAll(regex)];
            matches.forEach(match => {
                try {
                    const date = handler(match);
                    if (date && !isNaN(date.getTime()) && date >= today) {
                        dates.push(date.toISOString().split('T')[0]);
                    }
                } catch (e) {}
            });
        });
        
        return [...new Set(dates)].sort();
    }

    // Toutes les autres méthodes utilitaires existantes...
    generateIntelligentSummary(subject, content, actions, urgencyScore) {
        let summary = '';
        
        if (urgencyScore > 70) {
            summary = '🚨 URGENT: ';
        } else if (urgencyScore > 50) {
            summary = '⚡ Important: ';
        } else if (actions.length > 3) {
            summary = '📋 Multiple actions: ';
        }
        
        const cleanSubject = subject.replace(/^(re|tr|fwd?):\s*/i, '').trim();
        summary += cleanSubject;
        
        if (actions.length > 0) {
            const mainAction = actions[0];
            if (!summary.toLowerCase().includes(mainAction.text.toLowerCase())) {
                summary += '. ' + mainAction.fullMatch;
            }
        } else {
            const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
            if (sentences.length > 0 && !sentences[0].toLowerCase().includes(cleanSubject.toLowerCase())) {
                summary += '. ' + sentences[0].trim();
            }
        }
        
        if (summary.length > 200) {
            summary = summary.substring(0, 197) + '...';
        }
        
        return summary;
    }

    highlightDetailedActions(content, extractedActions) {
        const highlighted = [];
        const lines = content.split('\n');
        
        extractedActions.forEach(action => {
            const lineIndex = action.line - 1;
            if (lines[lineIndex]) {
                highlighted.push({
                    action: action.fullMatch,
                    location: `Ligne ${action.line}`,
                    excerpt: action.context,
                    deadline: action.type === 'deadline' ? this.extractDateFromText(action.text) : null,
                    type: action.type,
                    priority: action.weight >= 4 ? 'high' : action.weight >= 2 ? 'medium' : 'low'
                });
            }
        });
        
        return highlighted.slice(0, 10);
    }

    createEnhancedMainTask(email, subject, content, sender, priority, dueDate) {
        let title = subject.replace(/^(re|tr|fwd?):\s*/i, '').trim();
        
        if (title.length < 10 || /^(hello|bonjour|urgent|important|update|mise à jour)$/i.test(title)) {
            const actionMatch = content.match(/merci de .+|veuillez .+|il faut .+|à faire .+/i);
            if (actionMatch) {
                title = actionMatch[0].substring(0, 80);
            } else {
                title = `Traiter l'email de ${sender}`;
            }
        }
        
        // Créer une description complète incluant TOUT le contenu de l'email
        let fullDescription = `📧 Email de: ${sender}\n`;
        fullDescription += `📅 Date: ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}\n`;
        fullDescription += `📋 Sujet: ${subject}\n\n`;
        fullDescription += `📝 CONTENU COMPLET DE L'EMAIL:\n`;
        fullDescription += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        fullDescription += content;
        fullDescription += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Ajouter les pièces jointes si présentes
        if (email.hasAttachments) {
            fullDescription += `📎 Pièces jointes: Oui\n\n`;
        }
        
        // Ajouter un résumé des actions
        const sentences = content.split(/[.!?]+/)
            .filter(s => s.trim().length > 20)
            .slice(0, 3);
        
        if (sentences.length > 0) {
            fullDescription += `📌 RÉSUMÉ DES POINTS CLÉS:\n`;
            sentences.forEach(s => {
                fullDescription += `• ${s.trim()}\n`;
            });
        }
        
        return {
            title: title.substring(0, 100),
            priority: priority,
            dueDate: dueDate,
            description: fullDescription,
            emailId: email.id,
            emailSubject: subject,
            emailSender: sender,
            emailDate: email.receivedDateTime,
            hasFullContent: true
        };
    }

    generateIntelligentSubtasks(actions, category) {
        const subtasks = [];
        
        actions.slice(0, 3).forEach(action => {
            if (action.text.length > 10 && action.text.length < 80) {
                subtasks.push({
                    title: this.capitalizeFirst(action.text),
                    priority: action.weight >= 4 ? 'high' : 'medium'
                });
            }
        });
        
        const contextualSubtasks = {
            meeting: [
                { title: 'Confirmer la participation', priority: 'high' },
                { title: 'Préparer les documents pour la réunion', priority: 'medium' }
            ],
            finance: [
                { title: 'Vérifier les montants et détails', priority: 'high' },
                { title: 'Préparer les justificatifs', priority: 'medium' }
            ],
            project: [
                { title: 'Réviser les livrables', priority: 'high' },
                { title: 'Mettre à jour le planning', priority: 'medium' }
            ]
        };
        
        if (subtasks.length < 2 && contextualSubtasks[category]) {
            const toAdd = 3 - subtasks.length;
            subtasks.push(...contextualSubtasks[category].slice(0, toAdd));
        }
        
        return subtasks.slice(0, 3);
    }

    generateDetailedActionPoints(actions, content) {
        const actionPoints = [];
        
        actions.forEach(action => {
            let point = this.capitalizeFirst(action.text);
            if (action.line) {
                point += ` (Ligne ${action.line})`;
            }
            actionPoints.push(point);
        });
        
        if (actionPoints.length < 3) {
            if (/répondre|reply|response/i.test(content)) {
                actionPoints.push('Répondre à cet email');
            }
            if (/document|fichier|pièce jointe|attachment/i.test(content)) {
                actionPoints.push('Examiner les documents mentionnés');
            }
        }
        
        return actionPoints.slice(0, 5);
    }

    extractDetailedInsights(content, category, urgencyScore, actions, attachments, contacts, links) {
        const insights = {
            keyInfo: [],
            risks: [],
            opportunities: [],
            emailTone: 'neutre',
            responseExpected: true,
            attachments: attachments,
            contacts: contacts,
            links: links
        };
        
        // Détecter le ton de l'email
        if (urgencyScore > 70 || /urgent|critique|immédiat/i.test(content)) {
            insights.emailTone = 'urgent';
        } else if (/cordialement|sincèrement|respectueusement/i.test(content)) {
            insights.emailTone = 'formel';
        } else if (/salut|coucou|bisous|à\+/i.test(content)) {
            insights.emailTone = 'amical';
        }
        
        // Extraire les informations clés
        const keyPatterns = [
            { regex: /date\s*:\s*([^\n]+)/gi, type: 'Date' },
            { regex: /heure\s*:\s*([^\n]+)/gi, type: 'Heure' },
            { regex: /lieu\s*:\s*([^\n]+)/gi, type: 'Lieu' },
            { regex: /montant\s*:\s*([^\n]+)/gi, type: 'Montant' },
            { regex: /référence\s*:\s*([^\n]+)/gi, type: 'Référence' }
        ];
        
        keyPatterns.forEach(pattern => {
            const matches = content.match(pattern.regex);
            if (matches) {
                matches.forEach(match => {
                    insights.keyInfo.push(`${pattern.type}: ${match.replace(pattern.regex, '$1').trim()}`);
                });
            }
        });
        
        // Identifier les risques
        if (urgencyScore > 60 || actions.some(a => a.type === 'deadline')) {
            insights.risks.push('Délai serré ou échéance proche');
        }
        if (/problème|issue|erreur|bug|incident|retard/i.test(content)) {
            insights.risks.push('Problème ou incident mentionné');
        }
        
        // Identifier les opportunités
        if (/opportunité|opportunity|nouveau|croissance|expansion/i.test(content)) {
            insights.opportunities.push('Nouvelle opportunité d\'affaires');
        }
        
        insights.responseExpected = actions.length > 0 || 
            /répondre|reply|merci de|veuillez|pourriez-vous|svp|s'il vous plaît|please/i.test(content);
        
        return insights;
    }

    extractImportantPassages(content, actions) {
        const excerpts = [];
        const lines = content.split('\n');
        const processedLines = new Set();
        
        actions.forEach(action => {
            if (!processedLines.has(action.line - 1)) {
                excerpts.push({
                    text: action.context,
                    context: `Action ${action.type} identifiée`,
                    actionRequired: true,
                    priority: action.weight >= 4 ? 'high' : 'medium'
                });
                processedLines.add(action.line - 1);
            }
        });
        
        const importantPatterns = [
            { regex: /important|urgent|critique|attention/i, context: 'Information critique' },
            { regex: /deadline|échéance|date limite/i, context: 'Deadline mentionnée' },
            { regex: /\d+[,.\s]?\d*\s*[€$£]/i, context: 'Montant financier' }
        ];
        
        lines.forEach((line, index) => {
            if (processedLines.has(index) || line.trim().length < 20) return;
            
            for (const pattern of importantPatterns) {
                if (pattern.regex.test(line)) {
                    excerpts.push({
                        text: line.trim(),
                        context: pattern.context,
                        actionRequired: false,
                        priority: 'medium'
                    });
                    processedLines.add(index);
                    break;
                }
            }
        });
        
        return excerpts.slice(0, 5);
    }

    suggestAppropriateDeadline(urgencyScore, category) {
        const today = new Date();
        let daysToAdd = 7;
        
        if (urgencyScore > 80) {
            daysToAdd = 0;
        } else if (urgencyScore > 60) {
            daysToAdd = 1;
        } else if (urgencyScore > 40) {
            daysToAdd = 3;
        } else if (urgencyScore > 20) {
            daysToAdd = 5;
        }
        
        const categoryAdjustments = {
            meeting: -2,
            finance: -1,
            security: -3,
            client: -1
        };
        
        if (categoryAdjustments[category] !== undefined) {
            daysToAdd = Math.max(0, daysToAdd + categoryAdjustments[category]);
        }
        
        const deadline = new Date(today);
        deadline.setDate(deadline.getDate() + daysToAdd);
        
        if (deadline.getDay() === 6) deadline.setDate(deadline.getDate() + 2);
        if (deadline.getDay() === 0) deadline.setDate(deadline.getDate() + 1);
        
        return deadline.toISOString().split('T')[0];
    }

    generateRelevantTags(email, category, keyPhrases, sender) {
        const tags = new Set();
        
        if (category !== 'other') {
            tags.add(category);
        }
        
        const urgencyScore = this.calculateUrgencyScore(
            email.subject + ' ' + this.extractEmailContent(email), 
            email.subject
        );
        
        if (urgencyScore > 60) {
            tags.add('urgent');
        } else if (urgencyScore > 40) {
            tags.add('important');
        }
        
        const domain = email.from?.emailAddress?.address?.split('@')[1]?.split('.')[0];
        if (domain && domain.length > 2 && !['gmail', 'outlook', 'yahoo', 'hotmail'].includes(domain)) {
            tags.add(domain.toLowerCase());
        }
        
        return Array.from(tags).slice(0, 5);
    }

    extractKeyPhrases(text) {
        const phrases = [];
        
        const patterns = [
            /il faut .{5,50}/gi,
            /nous devons .{5,50}/gi,
            /merci de .{5,50}/gi,
            /veuillez .{5,50}/gi,
            /important.{0,50}/gi,
            /urgent.{0,50}/gi
        ];
        
        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const cleaned = match.trim().replace(/[.!?]+$/, '');
                    if (cleaned.length > 10 && cleaned.length < 100) {
                        phrases.push(cleaned);
                    }
                });
            }
        });
        
        return [...new Set(phrases)].slice(0, 5);
    }

    extractAttachments(content) {
        const attachments = [];
        const patterns = [
            /pièce[s]? jointe[s]?/gi,
            /document[s]? joint[s]?/gi,
            /ci-joint/gi,
            /attachment[s]?/gi,
            /attached/gi,
            /fichier[s]? joint[s]?/gi
        ];
        
        patterns.forEach(pattern => {
            if (pattern.test(content)) {
                attachments.push('Documents mentionnés dans l\'email');
            }
        });
        
        return [...new Set(attachments)];
    }

    extractContacts(content) {
        const contacts = [];
        
        // Patterns pour les emails
        const emailPattern = /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g;
        const emails = content.match(emailPattern) || [];
        emails.forEach(email => contacts.push(`Email: ${email}`));
        
        // Patterns pour les téléphones
        const phonePatterns = [
            /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
            /\d{2}[-.\s]\d{2}[-.\s]\d{2}[-.\s]\d{2}[-.\s]\d{2}/g
        ];
        
        phonePatterns.forEach(pattern => {
            const phones = content.match(pattern) || [];
            phones.forEach(phone => {
                if (phone.length >= 10) {
                    contacts.push(`Tél: ${phone}`);
                }
            });
        });
        
        return [...new Set(contacts)];
    }

    extractLinks(content) {
        const links = [];
        const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        const urls = content.match(urlPattern) || [];
        
        urls.forEach(url => {
            links.push(url);
        });
        
        return [...new Set(links)];
    }

    extractDateFromText(text) {
        const dates = this.extractAllDates(text);
        return dates[0] || null;
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    validateDate(dateStr) {
        if (!dateStr) return null;
        
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        } catch (e) {}
        
        return null;
    }

    calculateConfidence(actions, urgencyScore) {
        let confidence = 0.7;
        
        if (actions.length > 5) confidence += 0.1;
        else if (actions.length > 3) confidence += 0.05;
        
        if (urgencyScore > 70 || urgencyScore < 20) confidence += 0.1;
        
        const highPriorityActions = actions.filter(a => a.weight >= 4).length;
        if (highPriorityActions > 2) confidence += 0.05;
        
        return Math.min(confidence, 0.95);
    }

    createBasicAnalysis(email) {
        const subject = email.subject || 'Email sans sujet';
        const sender = email.from?.emailAddress?.name || 'Expéditeur inconnu';
        const content = this.extractEmailContent(email);
        
        return {
            summary: `Email de ${sender}: ${subject}`,
            importance: 'medium',
            actionsHighlighted: [],
            mainTask: {
                title: `Examiner: ${subject}`,
                priority: 'medium',
                dueDate: null,
                description: `Email reçu de ${sender}\n\nContenu:\n${content}`,
                emailId: email.id,
                hasFullContent: true
            },
            subtasks: [],
            actionPoints: ['Lire et analyser cet email', 'Déterminer les actions nécessaires'],
            suggestedReplies: [{
                tone: 'neutre',
                subject: `Re: ${subject}`,
                content: `Bonjour,\n\nJ'ai bien reçu votre message et je vous recontacte rapidement.\n\nCordialement`,
                generatedBy: 'fallback',
                generatedAt: new Date().toISOString()
            }],
            insights: {
                keyInfo: [],
                risks: [],
                opportunities: [],
                emailTone: 'neutre',
                responseExpected: true,
                attachments: [],
                contacts: [],
                links: []
            },
            importantExcerpts: [],
            emailMetadata: {
                sender: sender,
                senderEmail: email.from?.emailAddress?.address || '',
                subject: subject,
                date: email.receivedDateTime,
                hasAttachments: email.hasAttachments || false,
                fullContent: content
            },
            category: 'other',
            suggestedDeadline: null,
            tags: [],
            method: 'basic-fallback',
            confidence: 0.5
        };
    }

    // ================================================
    // GESTION DU CACHE
    // ================================================
    
    getFromCache(key) {
        const cached = this.analysisCache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.analysisCache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    setCache(key, data) {
        this.analysisCache.set(key, {
            data,
            timestamp: Date.now()
        });
        
        if (this.analysisCache.size > 100) {
            const firstKey = this.analysisCache.keys().next().value;
            this.analysisCache.delete(firstKey);
        }
    }

    // ================================================
    // CONFIGURATION ET INTERFACE
    // ================================================
    
    showConfigurationModal() {
        const content = `
            <div class="ai-config-modal">
                <div class="ai-config-header">
                    <i class="fas fa-robot"></i>
                    <h3>Configuration de l'analyse IA Claude Enhanced</h3>
                </div>
                
                <div class="ai-config-body">
                    <div class="ai-status-card ${this.apiKey ? 'active' : 'inactive'}">
                        <div class="ai-status-icon">
                            <i class="fas fa-${this.apiKey ? 'check' : 'times'}-circle"></i>
                        </div>
                        <div class="ai-status-content">
                            <h4>Status: ${this.apiKey ? 'Configuré' : 'Non configuré'}</h4>
                            <p>${this.apiKey ? 'Claude AI est prêt pour l\'analyse complète' : 'Configurez votre clé API pour activer l\'IA'}</p>
                        </div>
                    </div>
                    
                    <div class="ai-features">
                        <h4>Fonctionnalités Enhanced:</h4>
                        <ul>
                            <li><i class="fas fa-check"></i> Analyse IA complète avec Claude</li>
                            <li><i class="fas fa-check"></i> Génération de vraies réponses personnalisées</li>
                            <li><i class="fas fa-check"></i> Extraction intelligente des actions et insights</li>
                            <li><i class="fas fa-check"></i> Évaluation contextuelle de l'urgence</li>
                            <li><i class="fas fa-check"></i> Fallback intelligent si l'API échoue</li>
                            <li><i class="fas fa-check"></i> Cache optimisé pour les performances</li>
                        </ul>
                    </div>
                    
                    <div class="ai-api-config">
                        <h4>Configuration API Claude:</h4>
                        <div class="form-group">
                            <label class="form-label">Clé API Anthropic</label>
                            <input type="password" class="form-input" id="api-key-input" 
                                   placeholder="sk-ant-api..." value="${this.apiKey}">
                            <small>Obtenez votre clé sur <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a></small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <input type="checkbox" id="use-local-proxy" ${this.useLocalProxy ? 'checked' : ''}>
                                Utiliser un proxy local (recommandé)
                            </label>
                            <input type="text" class="form-input" id="proxy-url-input" 
                                   placeholder="http://localhost:3001/api/claude" 
                                   value="${this.localProxyUrl}"
                                   ${!this.useLocalProxy ? 'disabled' : ''}>
                            <small>Un proxy local évite les problèmes CORS. Voir la documentation pour la configuration.</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Mode d'analyse</label>
                            <select id="ai-mode-select" class="form-input">
                                <option value="hybrid" ${this.mode === 'hybrid' ? 'selected' : ''}>Hybride (IA + Local)</option>
                                <option value="api-only" ${this.mode === 'api-only' ? 'selected' : ''}>IA Claude uniquement</option>
                                <option value="local-only" ${this.mode === 'local-only' ? 'selected' : ''}>Analyse locale uniquement</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="ai-stats-section">
                        <h4>Statistiques d'utilisation:</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Cache analyses:</span>
                                <span class="stat-value">${this.analysisCache.size}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Cache réponses:</span>
                                <span class="stat-value">${this.responseCache.size}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Modèle IA:</span>
                                <span class="stat-value">${this.model}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-test-section">
                        <button class="btn btn-secondary" onclick="window.aiTaskAnalyzer.testConfiguration()">
                            <i class="fas fa-flask"></i> Tester la configuration
                        </button>
                        <button class="btn btn-warning" onclick="window.aiTaskAnalyzer.clearCache()">
                            <i class="fas fa-trash"></i> Vider le cache
                        </button>
                        <div id="test-result" style="margin-top: 10px;"></div>
                    </div>
                </div>
            </div>
        `;
        
        const footer = `
            <button class="btn btn-secondary" onclick="window.uiManager.closeModal()">Annuler</button>
            <button class="btn btn-primary" onclick="window.aiTaskAnalyzer.saveConfiguration()">
                <i class="fas fa-save"></i> Sauvegarder
            </button>
        `;
        
        window.uiManager.showModal(content, {
            title: 'Configuration Claude AI Enhanced',
            footer: footer,
            size: 'medium'
        });
        
        // Gérer le toggle du proxy local
        document.getElementById('use-local-proxy')?.addEventListener('change', (e) => {
            document.getElementById('proxy-url-input').disabled = !e.target.checked;
        });
    }

    // Tester la configuration avec vraie analyse
    async testConfiguration() {
        const resultDiv = document.getElementById('test-result');
        if (!resultDiv) return;
        
        resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Test en cours...';
        
        try {
            // Test email plus complexe
            const testEmail = {
                id: 'test-' + Date.now(),
                subject: 'URGENT: Validation du budget Q2 - Échéance aujourd\'hui',
                body: { 
                    content: `Bonjour,

J'espère que vous allez bien. Je vous contacte concernant la validation du budget Q2 qui doit absolument être finalisée aujourd'hui.

Pouvez-vous s'il vous plaît:
1. Valider les montants pour le marketing (50k€)
2. Confirmer l'allocation R&D (75k€) 
3. Approuver les dépenses IT (25k€)

Cette validation est critique pour notre présentation en comité de direction demain matin. Sans votre accord, nous risquons de reporter le lancement de nos nouveaux projets.

Merci de me confirmer avant 17h aujourd'hui.

Cordialement,
Marie Dupont
Directrice Financière`
                },
                from: { 
                    emailAddress: { 
                        name: 'Marie Dupont', 
                        address: 'marie.dupont@company.com' 
                    } 
                },
                receivedDateTime: new Date().toISOString(),
                hasAttachments: false
            };
            
            const analysis = await this.analyzeEmailForTasks(testEmail, { 
                useApi: true, 
                generateReplies: true 
            });
            
            let resultHTML = '';
            
            if (analysis.method === 'claude-ai') {
                resultHTML = `
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i> 
                        <strong>IA Claude opérationnelle!</strong><br>
                        Méthode: ${analysis.method}<br>
                        Confiance: ${Math.round(analysis.confidence * 100)}%<br>
                        Actions détectées: ${analysis.actionsHighlighted?.length || 0}<br>
                        Réponses générées: ${analysis.suggestedReplies?.length || 0}
                    </div>
                `;
            } else if (analysis.method && analysis.method.includes('local')) {
                resultHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i> 
                        IA non accessible, analyse locale utilisée.<br>
                        Méthode: ${analysis.method}<br>
                        Confiance: ${Math.round(analysis.confidence * 100)}%
                    </div>
                `;
            } else {
                resultHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> 
                        Analyse effectuée avec succès.<br>
                        Méthode: ${analysis.method}<br>
                        Résumé: ${analysis.summary}
                    </div>
                `;
            }
            
            resultDiv.innerHTML = resultHTML;
            
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-times-circle"></i> 
                    Erreur lors du test: ${error.message}
                </div>
            `;
        }
    }

    // Sauvegarder la configuration
    saveConfiguration() {
        const apiKeyInput = document.getElementById('api-key-input');
        const proxyUrlInput = document.getElementById('proxy-url-input');
        const useLocalProxy = document.getElementById('use-local-proxy');
        const modeSelect = document.getElementById('ai-mode-select');
        
        if (apiKeyInput) {
            this.apiKey = apiKeyInput.value.trim();
            if (this.apiKey) {
                localStorage.setItem('claude_api_key', this.apiKey);
                this.apiAvailable = true;
                // Mettre à jour le générateur de réponses aussi
                if (this.responseGenerator) {
                    this.responseGenerator.setApiKey(this.apiKey);
                }
            } else {
                localStorage.removeItem('claude_api_key');
                this.apiAvailable = false;
            }
        }
        
        if (proxyUrlInput) {
            this.localProxyUrl = proxyUrlInput.value.trim();
            if (this.responseGenerator) {
                this.responseGenerator.localProxyUrl = this.localProxyUrl;
            }
        }
        
        if (useLocalProxy) {
            this.useLocalProxy = useLocalProxy.checked;
            if (this.responseGenerator) {
                this.responseGenerator.useLocalProxy = this.useLocalProxy;
            }
        }
        
        if (modeSelect) {
            this.mode = modeSelect.value;
        }
        
        window.uiManager.closeModal();
        window.uiManager.showToast('Configuration Enhanced sauvegardée avec succès', 'success');
    }

    clearCache() {
        this.analysisCache.clear();
        this.responseCache.clear();
        if (this.responseGenerator) {
            this.responseGenerator.clearCache();
        }
        window.uiManager.showToast('Cache vidé avec succès', 'success');
        
        // Mettre à jour l'affichage des stats si la modale est ouverte
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Cache analyses:</span>
                    <span class="stat-value">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Cache réponses:</span>
                    <span class="stat-value">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Modèle IA:</span>
                    <span class="stat-value">${this.model}</span>
                </div>
            `;
        }
    }

    // ================================================
    // MÉTHODES DE COMPATIBILITÉ ET UTILITAIRES
    // ================================================
    
    // Analyser plusieurs emails en batch
    async batchAnalyze(emails, options = {}) {
        const results = [];
        const total = emails.length;
        
        for (let i = 0; i < emails.length; i++) {
            try {
                const analysis = await this.analyzeEmailForTasks(emails[i], {
                    ...options,
                    useApi: this.apiKey && (this.mode === 'hybrid' || this.mode === 'api-only')
                });
                
                results.push({
                    email: emails[i],
                    analysis: analysis
                });
                
                if (options.onProgress) {
                    options.onProgress({
                        current: i + 1,
                        total: total,
                        percentage: Math.round(((i + 1) / total) * 100)
                    });
                }
                
                // Pause pour éviter le rate limiting
                if (this.apiKey && analysis.method === 'claude-ai') {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error(`[AITaskAnalyzer] Error analyzing email ${i}:`, error);
                results.push({
                    email: emails[i],
                    analysis: this.createBasicAnalysis(emails[i]),
                    error: true
                });
            }
        }
        
        return results;
    }

    // Obtenir un résumé rapide (compatible)
    async getQuickSummary(email) {
        const analysis = await this.analyzeEmailForTasks(email, { quickMode: true });
        return analysis.summary;
    }

    // Obtenir les stats d'utilisation (enhanced)
    getUsageStats() {
        return {
            analysisCache: this.analysisCache.size,
            responseCache: this.responseCache.size,
            apiConfigured: !!this.apiKey,
            apiAvailable: this.apiAvailable,
            model: this.apiKey ? this.model : 'Local Analysis Enhanced',
            method: this.mode,
            lastApiTest: this.lastApiTest,
            responseGeneratorStats: this.responseGenerator ? this.responseGenerator.getUsageStats() : null
        };
    }

    // Méthodes de compatibilité (pour éviter les erreurs)
    localTaskAnalysis(email) {
        return this.performEnhancedLocalAnalysis(email);
    }

    enhancedLocalAnalysis(email) {
        return this.performEnhancedLocalAnalysis(email);
    }

    // Régénérer les réponses IA pour une tâche existante
    async regenerateAIResponses(email, options = {}) {
        if (!this.apiKey) {
            console.warn('[AITaskAnalyzer] No API key configured for AI response generation');
            return this.generateBasicReplies(this.extractEmailMetadata(email));
        }

        try {
            console.log('[AITaskAnalyzer] Regenerating AI responses...');
            const responses = await this.generateRealAIResponses(email, null);
            
            if (responses && responses.length > 0) {
                console.log(`[AITaskAnalyzer] Successfully regenerated ${responses.length} AI responses`);
                return responses;
            } else {
                console.warn('[AITaskAnalyzer] AI response generation returned empty results');
                return this.generateBasicReplies(this.extractEmailMetadata(email));
            }
        } catch (error) {
            console.error('[AITaskAnalyzer] Error regenerating AI responses:', error);
            return this.generateBasicReplies(this.extractEmailMetadata(email));
        }
    }

    // Configuration du proxy local (pour les développeurs)
    getProxySetupInstructions() {
        return `
// Créez un serveur proxy local avec Node.js
// Installez: npm install express cors axios

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/claude', async (req, res) => {
    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: req.body.model,
            max_tokens: req.body.max_tokens,
            messages: req.body.messages,
            temperature: req.body.temperature,
            system: req.body.system
        }, {
            headers: {
                'x-api-key': req.body.apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.message
        });
    }
});

app.listen(3001, () => {
    console.log('Proxy server running on http://localhost:3001');
});
        `;
    }
}

// ================================================
// CLASSE INTÉGRÉE POUR LES RÉPONSES IA (Embedded)
// ================================================

class AIEmailResponseGenerator {
    constructor() {
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-haiku-20240307';
        this.maxTokens = 4096;
        
        this.corsProxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://proxy.cors.sh/'
        ];
        
        this.localProxyUrl = 'http://localhost:3001/api/claude';
        this.useLocalProxy = true;
        this.apiKey = localStorage.getItem('claude_api_key') || '';
        
        this.responseCache = new Map();
        this.cacheTimeout = 15 * 60 * 1000;
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('claude_api_key', apiKey);
    }

    async processEmailForResponses(email, options = {}) {
        try {
            const responses = await this.generatePersonalizedResponses(email, null, options);
            return {
                analysis: null,
                responses: responses,
                processedAt: new Date().toISOString(),
                success: true
            };
        } catch (error) {
            console.error('[AIEmailResponseGenerator] Processing error:', error);
            return {
                analysis: null,
                responses: [],
                processedAt: new Date().toISOString(),
                error: error.message,
                success: false
            };
        }
    }

    async generatePersonalizedResponses(email, analysis = null, options = {}) {
        const cacheKey = `responses_${email.id || Date.now()}_${JSON.stringify(options)}`;
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const emailContent = this.extractEmailContent(email);
            const emailMetadata = this.extractEmailMetadata(email);
            
            const responses = await Promise.all([
                this.generateResponse(emailContent, emailMetadata, 'professional'),
                this.generateResponse(emailContent, emailMetadata, 'detailed'),
                this.generateResponse(emailContent, emailMetadata, 'concise'),
                this.generateResponse(emailContent, emailMetadata, 'friendly')
            ]);
            
            const filteredResponses = responses.filter(r => r && r.content);
            
            const enrichedResponses = filteredResponses.map((response, index) => ({
                ...response,
                id: `response_${Date.now()}_${index}`,
                generatedAt: new Date().toISOString(),
                generatedBy: 'claude-ai',
                confidence: 0.85,
                wordCount: response.content.split(' ').length,
                readingTime: Math.ceil(response.content.split(' ').length / 200)
            }));
            
            this.setCache(cacheKey, enrichedResponses);
            return enrichedResponses;
            
        } catch (error) {
            console.error('[AIEmailResponseGenerator] Generation error:', error);
            return this.createFallbackResponses(email);
        }
    }

    async generateResponse(emailContent, emailMetadata, tone) {
        try {
            const prompt = this.buildResponsePrompt(emailContent, emailMetadata, tone);
            const rawResponse = await this.callClaudeAPI(prompt);
            
            return this.parseResponseGeneration(rawResponse, tone);
        } catch (error) {
            console.error(`[AIEmailResponseGenerator] Error generating ${tone} response:`, error);
            return null;
        }
    }

    buildResponsePrompt(emailContent, emailMetadata, tone) {
        const toneInstructions = this.getToneInstructions(tone);
        
        return `Tu es un expert en communication professionnelle. Génère une réponse ${tone} à cet email.

EMAIL ORIGINAL:
De: ${emailMetadata.senderName} <${emailMetadata.senderEmail}>
Sujet: ${emailMetadata.subject}
Contenu: ${emailContent}

INSTRUCTIONS POUR RÉPONSE ${tone.toUpperCase()}:
${toneInstructions}

Génère une réponse au format JSON:
{
  "subject": "Re: [sujet approprié]",
  "content": "Contenu complet de la réponse email",
  "tone": "${tone}",
  "keyPoints": ["Point clé 1", "Point clé 2"],
  "reasoning": "Justification des choix",
  "callToAction": "Action attendue",
  "description": "Description du type de réponse"
}

IMPORTANT: La réponse DOIT être spécifique à ce email, pas générique.`;
    }

    getToneInstructions(tone) {
        const instructions = {
            professional: 'Ton professionnel, formel, structure business claire',
            detailed: 'Réponse complète abordant tous les points, détaillée',
            concise: 'Réponse courte, directe, efficace',
            friendly: 'Ton chaleureux, accessible mais professionnel'
        };
        return instructions[tone] || instructions.professional;
    }

    async callClaudeAPI(prompt) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        if (this.useLocalProxy && this.localProxyUrl) {
            try {
                return await this.callViaLocalProxy(prompt);
            } catch (error) {
                console.log('[AIEmailResponseGenerator] Local proxy failed, trying CORS...');
            }
        }

        for (const proxyUrl of this.corsProxies) {
            try {
                return await this.callViaCORSProxy(prompt, proxyUrl);
            } catch (error) {
                console.log(`[AIEmailResponseGenerator] CORS proxy ${proxyUrl} failed`);
            }
        }

        return await this.callDirectAPI(prompt);
    }

    async callViaLocalProxy(prompt) {
        const response = await fetch(this.localProxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: this.apiKey,
                model: this.model,
                max_tokens: this.maxTokens,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`Local proxy error: ${response.status}`);
        }

        return await response.json();
    }

    async callViaCORSProxy(prompt, proxyUrl) {
        const targetUrl = encodeURIComponent(this.apiUrl);
        
        const response = await fetch(proxyUrl + targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: this.maxTokens,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`CORS proxy error: ${response.status}`);
        }

        return await response.json();
    }

    async callDirectAPI(prompt) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: this.maxTokens,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`Direct API error: ${response.status}`);
        }

        return await response.json();
    }

    parseResponseGeneration(response, tone) {
        try {
            let content = '';
            
            if (response.content && Array.isArray(response.content)) {
                content = response.content[0]?.text || '';
            } else if (response.content) {
                content = response.content;
            } else if (typeof response === 'string') {
                content = response;
            }

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return this.createResponseFromPlainText(content, tone);
            }

            const parsed = JSON.parse(jsonMatch[0]);
            
            return {
                subject: parsed.subject || `Re: ${tone} response`,
                content: parsed.content || 'Réponse générée automatiquement',
                tone: parsed.tone || tone,
                keyPoints: parsed.keyPoints || [],
                reasoning: parsed.reasoning || 'Réponse générée par IA',
                callToAction: parsed.callToAction || 'Aucune action spécifique',
                description: parsed.description || this.getToneDescription(tone)
            };
            
        } catch (error) {
            console.error('[AIEmailResponseGenerator] Parse error:', error);
            return this.createResponseFromPlainText(response.content || response, tone);
        }
    }

    createResponseFromPlainText(content, tone) {
        return {
            subject: `Re: ${tone} response`,
            content: content || 'Réponse générée automatiquement',
            tone: tone,
            keyPoints: ['Réponse extraite du texte'],
            reasoning: 'Extraction automatique',
            callToAction: 'Veuillez réviser',
            description: this.getToneDescription(tone)
        };
    }

    getToneDescription(tone) {
        const descriptions = {
            professional: 'Réponse professionnelle et formelle',
            detailed: 'Réponse complète et détaillée',
            concise: 'Réponse concise et directe',
            friendly: 'Réponse chaleureuse et accessible'
        };
        return descriptions[tone] || 'Réponse personnalisée';
    }

    createFallbackResponses(email) {
        const emailMetadata = this.extractEmailMetadata(email);
        const senderName = emailMetadata.senderName || 'l\'expéditeur';
        const subject = emailMetadata.subject || 'votre message';
        
        return [{
            id: `fallback_response_${Date.now()}`,
            subject: `Re: ${subject}`,
            content: `Bonjour ${senderName},\n\nMerci pour votre message.\n\nJe vous recontacte rapidement.\n\nCordialement`,
            tone: 'professional',
            keyPoints: ['Accusé de réception'],
            reasoning: 'Réponse de fallback',
            callToAction: 'Attendre la réponse',
            description: 'Réponse standard',
            generatedAt: new Date().toISOString(),
            generatedBy: 'fallback-system',
            confidence: 0.6,
            wordCount: 15,
            readingTime: 1
        }];
    }

    extractEmailContent(email) {
        let content = '';
        
        if (email.body && email.body.content) {
            content = email.body.content;
        } else if (email.bodyPreview) {
            content = email.bodyPreview;
        }
        
        if (content.includes('<') && content.includes('>')) {
            content = content
                .replace(/<[^>]+>/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/\s+/g, ' ')
                .trim();
        }
        
        return content;
    }

    extractEmailMetadata(email) {
        return {
            senderName: email.from?.emailAddress?.name || 'Expéditeur',
            senderEmail: email.from?.emailAddress?.address || '',
            subject: email.subject || 'Sans sujet',
            date: email.receivedDateTime || new Date().toISOString()
        };
    }

    getFromCache(key) {
        const cached = this.responseCache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.responseCache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    setCache(key, data) {
        this.responseCache.set(key, {
            data,
            timestamp: Date.now()
        });
        
        if (this.responseCache.size > 50) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }
    }

    clearCache() {
        this.responseCache.clear();
    }

    getUsageStats() {
        return {
            responseCache: this.responseCache.size,
            apiConfigured: !!this.apiKey,
            model: this.model
        };
    }
}

// ================================================
// INITIALISATION GLOBALE ENHANCED
// ================================================

window.aiTaskAnalyzer = new AITaskAnalyzer();

// Fonction globale pour régénérer les vraies réponses IA
window.generateRealAIResponses = async function(taskId, options = {}) {
    if (!window.aiTaskAnalyzer) {
        console.error('[AIResponses] Analyzer not initialized');
        return null;
    }
    
    const task = window.taskManager.getTask(taskId);
    if (!task || !task.hasEmail) {
        console.error('[AIResponses] Task not found or not an email task');
        return null;
    }
    
    try {
        // Construire un objet email à partir de la tâche
        const emailObject = {
            id: task.emailId || task.id,
            subject: task.emailSubject,
            body: { content: task.emailContent },
            bodyPreview: task.emailContent,
            from: {
                emailAddress: {
                    name: task.emailFromName,
                    address: task.emailFrom
                }
            },
            receivedDateTime: task.emailDate,
            hasAttachments: task.hasAttachments
        };
        
        // Régénérer avec l'IA
        const responses = await window.aiTaskAnalyzer.regenerateAIResponses(emailObject, options);
        
        if (responses && responses.length > 0) {
            // Mettre à jour la tâche
            const updates = {
                suggestedReplies: responses,
                aiRepliesGenerated: true,
                aiRepliesGeneratedAt: new Date().toISOString(),
                needsAIReplies: false
            };
            
            window.taskManager.updateTask(taskId, updates);
            
            console.log(`[AIResponses] Successfully regenerated ${responses.length} AI responses`);
            return { responses, success: true };
        } else {
            console.warn('[AIResponses] No responses generated');
            return { responses: [], success: false };
        }
        
    } catch (error) {
        console.error('[AIResponses] Error:', error);
        return { error: error.message, success: false };
    }
};

console.log('✅ AITaskAnalyzer Enhanced loaded - Real AI analysis with Claude integration');
