// EmailScanner.js - Version 11.0 - Scanner d'emails corrigé
// Catégorisation plus précise, gestion des emails "other"

console.log('[EmailScanner] 🚀 Loading EmailScanner.js v11.0 - Catégorisation corrigée...');

class EmailScanner {
    constructor() {
        this.emails = [];
        this.isScanning = false;
        this.taskPreselectedCategories = [];
        this.currentProgress = null;
        this.onProgressCallback = null;
        
        // Cache de catégorisation
        this.categorizationCache = new Map();
        
        // Paramètres par défaut
        this.defaultOptions = {
            days: 7,
            folder: 'inbox',
            maxEmails: 500,
            autoAnalyze: true,
            autoCategrize: true,
            includeSpam: false,
            detectCC: true
        };
        
        // Statistiques
        this.stats = {
            total: 0,
            categorized: 0,
            analyzed: 0,
            errors: 0,
            preselectedForTasks: 0
        };
        
        console.log('[EmailScanner] ✅ Scanner v11.0 initialized - Catégorisation corrigée');
        this.initialize();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        console.log('[EmailScanner] 🔧 Initializing...');
        
        try {
            // Charger les catégories pré-sélectionnées
            await this.loadTaskPreselectedCategories();
            
            // S'abonner aux changements de paramètres
            this.setupEventListeners();
            
            console.log('[EmailScanner] ✅ Initialization complete');
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Initialization error:', error);
        }
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
    // ================================================
    async loadTaskPreselectedCategories() {
        try {
            if (window.categoryManager?.getTaskPreselectedCategories) {
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                console.log('[EmailScanner] ✅ Catégories pré-sélectionnées chargées:', this.taskPreselectedCategories);
            } else {
                // Fallback localStorage
                const settings = localStorage.getItem('categorySettings');
                if (settings) {
                    const parsed = JSON.parse(settings);
                    this.taskPreselectedCategories = parsed.taskPreselectedCategories || [];
                }
            }
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur chargement catégories:', error);
            this.taskPreselectedCategories = [];
        }
    }

    setupEventListeners() {
        // Écouter les changements de catégories pré-sélectionnées
        window.addEventListener('settingsChanged', (e) => {
            if (e.detail?.type === 'taskPreselectedCategories') {
                console.log('[EmailScanner] 📝 Mise à jour catégories pré-sélectionnées:', e.detail.value);
                this.updateTaskPreselectedCategories(e.detail.value);
            }
        });
        
        // Écouter les changements du CategoryManager
        if (window.categoryManager?.addChangeListener) {
            window.categoryManager.addChangeListener((type, value) => {
                if (type === 'taskPreselectedCategories') {
                    this.updateTaskPreselectedCategories(value);
                }
            });
        }
    }

    updateTaskPreselectedCategories(categories) {
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        console.log('[EmailScanner] ✅ Catégories synchronisées:', this.taskPreselectedCategories);
        
        // Recatégoriser les emails existants si nécessaire
        if (this.emails.length > 0) {
            this.recategorizeEmails();
        }
    }

    // ================================================
    // SCAN PRINCIPAL
    // ================================================
    async scan(options = {}) {
        if (this.isScanning) {
            console.warn('[EmailScanner] ⚠️ Scan déjà en cours');
            return null;
        }
        
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v11.0 ===');
        console.log('[EmailScanner] 📊 Options:', options);
        
        try {
            this.isScanning = true;
            this.reset();
            
            // Synchroniser les catégories avant le scan
            await this.loadTaskPreselectedCategories();
            console.log('[EmailScanner] ✅ Catégories synchronisées:', this.taskPreselectedCategories);
            
            // Merger les options
            const scanOptions = { ...this.defaultOptions, ...options };
            
            // Conserver le callback de progression
            if (options.onProgress) {
                this.onProgressCallback = options.onProgress;
            }
            
            // Récupérer les emails
            this.updateProgress(0, 'Récupération des emails...', 'fetch');
            const emails = await this.fetchEmails(scanOptions);
            
            if (!emails || emails.length === 0) {
                throw new Error('Aucun email trouvé');
            }
            
            console.log('[EmailScanner] ✅', emails.length, 'emails récupérés');
            
            // Catégoriser si demandé
            if (scanOptions.autoCategrize !== false) {
                await this.categorizeEmails(scanOptions);
            }
            
            // Analyser avec l'IA si demandé
            if (scanOptions.autoAnalyze && window.aiTaskAnalyzer) {
                await this.analyzeWithAI(scanOptions);
            }
            
            // Calculer les statistiques finales
            const stats = this.calculateStats();
            
            // Résultats complets
            const results = {
                success: true,
                total: this.emails.length,
                categorized: stats.categorized,
                analyzed: stats.analyzed,
                breakdown: stats.breakdown,
                taskPreselectedCategories: [...this.taskPreselectedCategories],
                stats: {
                    ...stats,
                    preselectedForTasks: stats.preselectedForTasks,
                    taskSuggestions: stats.taskSuggestions
                },
                provider: scanOptions.provider || this.detectProvider(),
                timestamp: Date.now()
            };
            
            console.log('[EmailScanner] 🎉 === SCAN TERMINÉ ===');
            console.log('[EmailScanner] 📊 Résultats:', {
                total: results.total,
                categorized: results.categorized,
                preselectedForTasks: results.stats.preselectedForTasks
            });
            
            // Dispatcher l'événement
            this.dispatchScanCompleted(results);
            
            return results;
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur scan:', error);
            this.stats.errors++;
            
            return {
                success: false,
                error: error.message,
                total: this.emails.length,
                stats: this.stats
            };
            
        } finally {
            this.isScanning = false;
            this.onProgressCallback = null;
        }
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS
    // ================================================
    async fetchEmails(options) {
        console.log('[EmailScanner] 📬 Récupération des emails via MailService...');
        
        try {
            // Utiliser MailService s'il est disponible
            if (window.mailService?.getMessages) {
                const emails = await this.fetchViaMailService(options);
                if (emails && emails.length > 0) {
                    this.emails = emails;
                    return emails;
                }
            }
            
            // Fallback vers les services spécifiques
            if (options.provider === 'gmail' && window.googleAuthService) {
                return await this.fetchGmailEmails(options);
            } else if (options.provider === 'outlook' && window.authService) {
                return await this.fetchOutlookEmails(options);
            }
            
            throw new Error('Aucun service de récupération d\'emails disponible');
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur récupération emails:', error);
            throw error;
        }
    }

    async fetchViaMailService(options) {
        console.log('[EmailScanner] 📧 Utilisation de MailService...');
        
        const mailOptions = {
            maxResults: options.maxEmails || 500,
            includeSpam: options.includeSpam === true
        };
        
        // Ajouter le filtre de date si spécifié
        if (options.days && options.days > 0 && options.days !== -1) {
            // Pour MailService, on peut passer directement days
            mailOptions.days = options.days;
        } else if (options.days === -1) {
            // -1 signifie tous les emails
            mailOptions.maxResults = 1000; // Limite raisonnable
        }
        
        const emails = await window.mailService.getMessages(options.folder || 'inbox', mailOptions);
        
        console.log(`[EmailScanner] ✅ ${emails.length} emails récupérés depuis MailService`);
        
        // Normaliser les emails
        return emails.map(email => this.normalizeEmail(email));
    }

    async fetchGmailEmails(options) {
        console.log('[EmailScanner] 📧 Récupération emails Gmail...');
        
        // Vérifier si on a un token Google valide
        if (!window.googleAuthService?.isAuthenticated()) {
            throw new Error('Non authentifié avec Google');
        }
        
        // Utiliser MailService qui gère Gmail correctement
        if (window.mailService) {
            console.log('[EmailScanner] Utilisation de MailService pour Gmail...');
            
            // S'assurer que MailService est sur Gmail
            const currentProvider = window.mailService.getCurrentProvider();
            if (currentProvider !== 'google' && currentProvider !== 'gmail') {
                await window.mailService.setProvider('google');
            }
            
            // Options pour MailService
            const mailOptions = {
                maxResults: options.maxEmails || 500,
                includeSpam: options.includeSpam === true
            };
            
            // Ajouter le filtre de date
            if (options.days && options.days > 0) {
                mailOptions.days = options.days;
            }
            
            const emails = await window.mailService.getMessages('INBOX', mailOptions);
            console.log(`[EmailScanner] ✅ ${emails.length} emails Gmail récupérés via MailService`);
            
            return emails.map(email => ({
                ...this.normalizeEmail(email),
                provider: 'gmail'
            }));
        }
        
        // Fallback : utiliser l'API Gmail directement
        console.log('[EmailScanner] Fallback: API Gmail directe...');
        const token = await window.googleAuthService.getAccessToken();
        if (!token) {
            throw new Error('Pas de token Google disponible');
        }
        
        // Construire la requête Gmail
        const params = new URLSearchParams({
            maxResults: Math.min(options.maxEmails || 500, 500).toString()
        });
        
        // Construire la query
        let query = '';
        if (options.days && options.days > 0) {
            const date = new Date();
            date.setDate(date.getDate() - options.days);
            query = `after:${date.toISOString().split('T')[0]}`;
        }
        
        if (!options.includeSpam) {
            query = query ? `${query} -in:spam` : '-in:spam';
        }
        
        if (query) {
            params.append('q', query);
        }
        
        // Récupérer la liste des messages
        const listResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        if (!listResponse.ok) {
            throw new Error(`Gmail API error: ${listResponse.status}`);
        }
        
        const listData = await listResponse.json();
        const messageIds = listData.messages || [];
        
        console.log(`[EmailScanner] ${messageIds.length} messages trouvés`);
        
        // Récupérer les détails de chaque message
        const emails = [];
        for (let i = 0; i < messageIds.length; i += 5) {
            const batch = messageIds.slice(i, i + 5);
            const promises = batch.map(msg => this.fetchGmailMessage(msg.id, token));
            const results = await Promise.all(promises);
            emails.push(...results.filter(e => e !== null));
            
            // Mise à jour progression
            const progress = Math.round((i / messageIds.length) * 100);
            this.updateProgress(progress, `Récupération ${i}/${messageIds.length} emails`, 'fetch');
        }
        
        console.log(`[EmailScanner] ✅ ${emails.length} emails Gmail récupérés`);
        
        return emails.map(email => ({
            ...email,
            provider: 'gmail'
        }));
    }
    
    async fetchGmailMessage(messageId, token) {
        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                return null;
            }
            
            const message = await response.json();
            return this.convertGmailMessage(message);
            
        } catch (error) {
            console.error(`[EmailScanner] Erreur message ${messageId}:`, error);
            return null;
        }
    }
    
    convertGmailMessage(gmailMessage) {
        const headers = gmailMessage.payload?.headers || [];
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
        
        // Extraire le contenu
        const content = this.extractGmailContent(gmailMessage.payload);
        
        // Parser les adresses email
        const fromHeader = getHeader('From');
        const fromParsed = this.parseEmailAddress(fromHeader);
        
        // IMPORTANT: Détecter les headers de désabonnement
        const listUnsubscribe = getHeader('List-Unsubscribe');
        const listUnsubscribePost = getHeader('List-Unsubscribe-Post');
        const hasUnsubscribeHeader = !!(listUnsubscribe || listUnsubscribePost);
        
        // Ajouter les labels Gmail pour améliorer la détection
        const labels = gmailMessage.labelIds || [];
        const hasPromotionsLabel = labels.includes('CATEGORY_PROMOTIONS');
        const hasUpdatesLabel = labels.includes('CATEGORY_UPDATES');
        const hasForumsLabel = labels.includes('CATEGORY_FORUMS');
        const hasSocialLabel = labels.includes('CATEGORY_SOCIAL');
        
        // Créer un email normalisé
        const normalizedEmail = {
            id: gmailMessage.id,
            subject: getHeader('Subject') || 'Sans sujet',
            from: {
                emailAddress: {
                    name: fromParsed.name,
                    address: fromParsed.address
                }
            },
            toRecipients: this.parseRecipients(getHeader('To')),
            ccRecipients: this.parseRecipients(getHeader('Cc')),
            receivedDateTime: new Date(parseInt(gmailMessage.internalDate)).toISOString(),
            bodyPreview: gmailMessage.snippet || '',
            body: {
                content: content.html || content.text || '',
                contentType: content.html ? 'html' : 'text'
            },
            hasAttachments: content.hasAttachments,
            importance: gmailMessage.labelIds?.includes('IMPORTANT') ? 'high' : 'normal',
            isRead: !gmailMessage.labelIds?.includes('UNREAD'),
            // Nouveaux champs pour améliorer la détection
            hasUnsubscribeHeader: hasUnsubscribeHeader,
            gmailLabels: labels,
            isPromotional: hasPromotionsLabel || hasUpdatesLabel,
            listHeaders: {
                unsubscribe: listUnsubscribe,
                unsubscribePost: listUnsubscribePost
            }
        };
        
        // Si on a un header de désabonnement, ajouter une indication dans le contenu pour la catégorisation
        if (hasUnsubscribeHeader) {
            normalizedEmail._unsubscribeIndicator = '[HAS_UNSUBSCRIBE_HEADER]';
        }
        
        return normalizedEmail;
    }
    
    extractGmailContent(payload) {
        let text = '';
        let html = '';
        let hasAttachments = false;
        
        if (!payload) return { text, html, hasAttachments };
        
        const extractFromPart = (part) => {
            if (part.filename && part.filename.length > 0) {
                hasAttachments = true;
                return;
            }
            
            if (part.body?.data) {
                const decoded = this.base64Decode(part.body.data);
                if (part.mimeType === 'text/plain') {
                    text = decoded;
                } else if (part.mimeType === 'text/html') {
                    html = decoded;
                }
            }
            
            if (part.parts && Array.isArray(part.parts)) {
                part.parts.forEach(subPart => extractFromPart(subPart));
            }
        };
        
        extractFromPart(payload);
        
        return { text, html, hasAttachments };
    }
    
    base64Decode(data) {
        try {
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64 + '=='.substring(0, (4 - base64.length % 4) % 4);
            return decodeURIComponent(escape(atob(padded)));
        } catch (error) {
            console.error('[EmailScanner] Erreur décodage base64:', error);
            return '';
        }
    }
    
    parseEmailAddress(emailString) {
        if (!emailString) return { name: '', address: '' };
        
        const match = emailString.match(/^"?([^"<]*?)"?\s*<?([^>]+)>?$/);
        
        if (match) {
            return {
                name: match[1].trim(),
                address: match[2].trim()
            };
        }
        
        return {
            name: '',
            address: emailString.trim()
        };
    }
    
    parseRecipients(recipientString) {
        if (!recipientString) return [];
        
        const recipients = [];
        const parts = recipientString.split(',');
        
        parts.forEach(part => {
            const parsed = this.parseEmailAddress(part.trim());
            if (parsed.address) {
                recipients.push({
                    emailAddress: {
                        name: parsed.name,
                        address: parsed.address
                    }
                });
            }
        });
        
        return recipients;
    }

    async fetchOutlookEmails(options) {
        console.log('[EmailScanner] 📧 Récupération emails Outlook...');
        
        // Vérifier l'authentification
        if (!window.authService?.isAuthenticated()) {
            throw new Error('Non authentifié avec Microsoft');
        }
        
        // Utiliser MailService qui gère Outlook correctement
        if (window.mailService) {
            console.log('[EmailScanner] Utilisation de MailService pour Outlook...');
            
            // S'assurer que MailService est sur Outlook
            const currentProvider = window.mailService.getCurrentProvider();
            if (currentProvider !== 'microsoft' && currentProvider !== 'outlook') {
                await window.mailService.setProvider('microsoft');
            }
            
            // Options pour MailService
            const mailOptions = {
                maxResults: options.maxEmails || 500,
                includeSpam: options.includeSpam === true
            };
            
            // Ajouter le filtre de date
            if (options.days && options.days > 0) {
                mailOptions.days = options.days;
            }
            
            const emails = await window.mailService.getMessages(options.folder || 'inbox', mailOptions);
            console.log(`[EmailScanner] ✅ ${emails.length} emails Outlook récupérés via MailService`);
            
            return emails.map(email => ({
                ...this.normalizeEmail(email),
                provider: 'outlook'
            }));
        }
        
        // Fallback : utiliser l'API Graph directement
        console.log('[EmailScanner] Fallback: API Graph directe...');
        const token = await window.authService.getAccessToken();
        if (!token) {
            throw new Error('Pas de token Microsoft disponible');
        }
        
        // Construire les paramètres
        const params = new URLSearchParams({
            '$top': Math.min(options.maxEmails || 500, 999).toString(),
            '$select': 'id,conversationId,receivedDateTime,subject,body,bodyPreview,importance,isRead,hasAttachments,from,toRecipients,ccRecipients',
            '$orderby': 'receivedDateTime desc'
        });
        
        // Ajouter le filtre de date
        if (options.days && options.days > 0) {
            const date = new Date();
            date.setDate(date.getDate() - options.days);
            params.append('$filter', `receivedDateTime ge ${date.toISOString()}`);
        }
        
        const response = await fetch(
            `https://graph.microsoft.com/v1.0/me/mailFolders/${options.folder || 'inbox'}/messages?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Microsoft Graph API error: ${response.status}`);
        }
        
        const data = await response.json();
        const emails = data.value || [];
        
        console.log(`[EmailScanner] ✅ ${emails.length} emails Outlook récupérés`);
        
        return emails.map(email => ({
            ...this.normalizeEmail(email),
            provider: 'outlook'
        }));
    }

    normalizeEmail(email) {
        // S'assurer que l'email a une structure cohérente
        const normalized = {
            id: email.id || email.messageId || `email_${Date.now()}_${Math.random()}`,
            subject: email.subject || 'Sans sujet',
            from: email.from || { emailAddress: { address: 'unknown@unknown.com' } },
            toRecipients: email.toRecipients || [],
            ccRecipients: email.ccRecipients || [],
            receivedDateTime: email.receivedDateTime || new Date().toISOString(),
            bodyPreview: email.bodyPreview || '',
            body: email.body || { content: '', contentType: 'text' },
            hasAttachments: email.hasAttachments || false,
            importance: email.importance || 'normal',
            isRead: email.isRead !== false,
            provider: email.provider || this.detectProvider(),
            // Préserver les indicateurs de newsletter/marketing
            hasUnsubscribeHeader: email.hasUnsubscribeHeader || false,
            gmailLabels: email.gmailLabels || [],
            isPromotional: email.isPromotional || false,
            listHeaders: email.listHeaders || {},
            _unsubscribeIndicator: email._unsubscribeIndicator || '',
            // Champs de catégorisation (seront remplis plus tard)
            category: null,
            categoryScore: 0,
            categoryConfidence: 0,
            isPreselectedForTasks: false,
            aiAnalysis: null
        };
        
        return normalized;
    }

    // ================================================
    // CATÉGORISATION AMÉLIORÉE
    // ================================================
    async categorizeEmails(options) {
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION ===');
        console.log('[EmailScanner] 📊 Total emails:', this.emails.length);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        if (!window.categoryManager?.analyzeEmail) {
            console.warn('[EmailScanner] ⚠️ CategoryManager non disponible');
            return;
        }
        
        const breakdown = {};
        let categorizedCount = 0;
        let preselectedCount = 0;
        let newsletterCount = 0;
        const errors = [];
        
        for (let i = 0; i < this.emails.length; i++) {
            const email = this.emails[i];
            
            try {
                // Vérifier le cache d'abord
                const cacheKey = this.getCategorizationCacheKey(email);
                const cached = this.categorizationCache.get(cacheKey);
                
                if (cached && cached.version === window.categoryManager.version) {
                    // Utiliser le résultat en cache
                    email.category = cached.category;
                    email.categoryScore = cached.score;
                    email.categoryConfidence = cached.confidence;
                } else {
                    // AMÉLIORATION: Pré-traiter l'email pour la détection newsletter
                    const enhancedEmail = this.enhanceEmailForCategorization(email);
                    
                    // Analyser l'email
                    const analysis = window.categoryManager.analyzeEmail(enhancedEmail);
                    
                    // IMPORTANT: S'assurer qu'on a toujours une catégorie
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    
                    // Mettre en cache
                    this.categorizationCache.set(cacheKey, {
                        category: email.category,
                        score: email.categoryScore,
                        confidence: email.categoryConfidence,
                        version: window.categoryManager.version || 1
                    });
                }
                
                // Vérifier si pré-sélectionné pour tâches
                email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
                
                // Compter par catégorie
                breakdown[email.category] = (breakdown[email.category] || 0) + 1;
                
                // Statistiques
                categorizedCount++;
                if (email.isPreselectedForTasks) {
                    preselectedCount++;
                }
                if (email.category === 'marketing_news') {
                    newsletterCount++;
                }
                
                // Log pour debug si newsletter détectée via header
                if (email.hasUnsubscribeHeader && email.category !== 'marketing_news') {
                    console.log(`[EmailScanner] ⚠️ Email avec header unsubscribe mais catégorie ${email.category}:`, email.subject);
                }
                
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur catégorisation email:', error);
                email.category = 'other';
                email.categoryScore = 0;
                email.categoryConfidence = 0;
                email.isPreselectedForTasks = false;
                errors.push({ email: email.subject, error: error.message });
            }
            
            // Mise à jour progression
            if (i % 10 === 0) {
                const progress = Math.round((i / this.emails.length) * 100);
                this.updateProgress(progress, `Catégorisation ${i}/${this.emails.length}`, 'categorize');
            }
        }
        
        // Afficher le résumé
        console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
        console.log('[EmailScanner] 📊 Distribution:', breakdown);
        console.log('[EmailScanner] 📰 Newsletters détectées:', newsletterCount);
        console.log('[EmailScanner] ⭐ Total pré-sélectionnés:', preselectedCount);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors.length);
        
        // Log détaillé pour les catégories pré-sélectionnées
        Object.entries(breakdown).forEach(([category, count]) => {
            if (this.taskPreselectedCategories.includes(category)) {
                console.log(`[EmailScanner] ⭐ ${category}: ${count} emails pré-sélectionnés`);
            }
        });
        
        // Mettre à jour les stats
        this.stats.categorized = categorizedCount;
        this.stats.preselectedForTasks = preselectedCount;
        this.stats.breakdown = breakdown;
        
        return {
            categorized: categorizedCount,
            breakdown,
            preselectedForTasks: preselectedCount,
            errors
        };
    }

    enhanceEmailForCategorization(email) {
        // Créer une copie de l'email pour ne pas modifier l'original
        const enhanced = { ...email };
        
        // Si l'email a un header de désabonnement, ajouter des indicateurs forts
        if (email.hasUnsubscribeHeader) {
            // Ajouter des mots-clés au sujet et au corps pour forcer la détection
            enhanced.subject = `[NEWSLETTER] ${email.subject || ''}`;
            enhanced.bodyPreview = `[UNSUBSCRIBE_HEADER_DETECTED] ${email.bodyPreview || ''}`;
            
            // Enrichir le contenu du corps
            if (enhanced.body && enhanced.body.content) {
                enhanced.body.content = `[HAS_UNSUBSCRIBE_HEADER] [NEWSLETTER] ${enhanced.body.content}`;
            }
        }
        
        // Si l'email a des labels Gmail promotionnels
        if (email.isPromotional || (email.gmailLabels && 
            (email.gmailLabels.includes('CATEGORY_PROMOTIONS') || 
             email.gmailLabels.includes('CATEGORY_UPDATES')))) {
            enhanced.subject = `[PROMOTIONAL] ${enhanced.subject || ''}`;
            enhanced.bodyPreview = `[GMAIL_PROMOTIONAL] ${enhanced.bodyPreview || ''}`;
        }
        
        // Ajouter l'indicateur de désabonnement s'il existe
        if (email._unsubscribeIndicator) {
            enhanced.bodyPreview = `${email._unsubscribeIndicator} ${enhanced.bodyPreview || ''}`;
        }
        
        return enhanced;
    }

    getCategorizationCacheKey(email) {
        // Créer une clé unique basée sur le contenu important de l'email
        const key = `${email.subject}_${email.from?.emailAddress?.address}_${email.bodyPreview?.substring(0, 100)}`;
        return key.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    // ================================================
    // ANALYSE IA
    // ================================================
    async analyzeWithAI(options) {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] ⚠️ AITaskAnalyzer non disponible');
            return;
        }
        
        console.log('[EmailScanner] 🤖 Analyse IA des emails...');
        
        // Filtrer les emails à analyser (priorité aux pré-sélectionnés)
        const emailsToAnalyze = this.emails
            .filter(email => {
                // Toujours analyser les emails pré-sélectionnés
                if (email.isPreselectedForTasks) return true;
                
                // Analyser les emails avec un score élevé
                if (email.categoryScore >= 80) return true;
                
                // Analyser certaines catégories importantes
                const importantCategories = ['tasks', 'meetings', 'commercial', 'project'];
                if (importantCategories.includes(email.category)) return true;
                
                return false;
            })
            .slice(0, 50); // Limiter à 50 emails maximum
        
        console.log(`[EmailScanner] 🤖 Analyse IA de ${emailsToAnalyze.length} emails`);
        console.log(`[EmailScanner] ⭐ Dont ${emailsToAnalyze.filter(e => e.isPreselectedForTasks).length} pré-sélectionnés`);
        
        let analyzedCount = 0;
        let taskSuggestions = 0;
        
        for (const email of emailsToAnalyze) {
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmail(email);
                if (analysis) {
                    email.aiAnalysis = analysis;
                    analyzedCount++;
                    
                    if (analysis.shouldCreateTask) {
                        taskSuggestions++;
                    }
                }
            } catch (error) {
                console.error('[EmailScanner] Erreur analyse IA:', error);
            }
            
            // Mise à jour progression
            const progress = Math.round((analyzedCount / emailsToAnalyze.length) * 100);
            this.updateProgress(progress, `Analyse IA ${analyzedCount}/${emailsToAnalyze.length}`, 'ai');
        }
        
        console.log('[EmailScanner] ✅ Analyse IA terminée');
        console.log('[EmailScanner] 📊 Tâches suggérées:', taskSuggestions);
        console.log('[EmailScanner] ⭐ Dont pré-sélectionnées:', emailsToAnalyze.filter(e => e.isPreselectedForTasks && e.aiAnalysis?.shouldCreateTask).length);
        
        this.stats.analyzed = analyzedCount;
        this.stats.taskSuggestions = taskSuggestions;
        
        return {
            analyzed: analyzedCount,
            taskSuggestions
        };
    }

    // ================================================
    // RECATÉGORISATION
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) return;
        
        console.log('[EmailScanner] 🔄 Recatégorisation des emails...');
        
        // Réinitialiser les catégories
        this.emails.forEach(email => {
            email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
        });
        
        // Recalculer les stats
        this.calculateStats();
        
        // Dispatcher l'événement
        window.dispatchEvent(new CustomEvent('emailsRecategorized', {
            detail: {
                total: this.emails.length,
                preselectedForTasks: this.stats.preselectedForTasks
            }
        }));
    }

    // ================================================
    // STATISTIQUES
    // ================================================
    calculateStats() {
        const stats = {
            total: this.emails.length,
            categorized: 0,
            analyzed: 0,
            preselectedForTasks: 0,
            taskSuggestions: 0,
            breakdown: {}
        };
        
        this.emails.forEach(email => {
            if (email.category) {
                stats.categorized++;
                stats.breakdown[email.category] = (stats.breakdown[email.category] || 0) + 1;
            }
            
            if (email.isPreselectedForTasks) {
                stats.preselectedForTasks++;
            }
            
            if (email.aiAnalysis) {
                stats.analyzed++;
                if (email.aiAnalysis.shouldCreateTask) {
                    stats.taskSuggestions++;
                }
            }
        });
        
        this.stats = { ...this.stats, ...stats };
        return stats;
    }

    // ================================================
    // EXPORT DES RÉSULTATS
    // ================================================
    exportResults(format = 'json') {
        console.log(`[EmailScanner] 📥 Export des résultats en ${format}...`);
        
        if (format === 'csv') {
            return this.exportToCSV();
        } else {
            return this.exportToJSON();
        }
    }

    exportToJSON() {
        const data = {
            scanDate: new Date().toISOString(),
            stats: this.stats,
            taskPreselectedCategories: this.taskPreselectedCategories,
            emails: this.emails.map(email => ({
                id: email.id,
                subject: email.subject,
                from: email.from?.emailAddress?.address,
                fromName: email.from?.emailAddress?.name,
                receivedDateTime: email.receivedDateTime,
                category: email.category,
                categoryScore: email.categoryScore,
                categoryConfidence: email.categoryConfidence,
                isPreselectedForTasks: email.isPreselectedForTasks,
                hasAttachments: email.hasAttachments,
                importance: email.importance,
                isRead: email.isRead,
                shouldCreateTask: email.aiAnalysis?.shouldCreateTask || false,
                taskTitle: email.aiAnalysis?.taskTitle || '',
                taskPriority: email.aiAnalysis?.priority || ''
            }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, `email-scan-${new Date().toISOString().split('T')[0]}.json`);
    }

    exportToCSV() {
        const headers = [
            'Date', 'Sujet', 'Expéditeur', 'Email Expéditeur', 
            'Catégorie', 'Score', 'Confiance', 'Pré-sélectionné',
            'Pièces jointes', 'Importance', 'Lu', 
            'Tâche suggérée', 'Titre tâche', 'Priorité'
        ];
        
        const rows = this.emails.map(email => [
            new Date(email.receivedDateTime).toLocaleString('fr-FR'),
            this.escapeCSV(email.subject),
            this.escapeCSV(email.from?.emailAddress?.name || ''),
            this.escapeCSV(email.from?.emailAddress?.address || ''),
            email.category || 'other',
            email.categoryScore || 0,
            Math.round((email.categoryConfidence || 0) * 100) + '%',
            email.isPreselectedForTasks ? 'Oui' : 'Non',
            email.hasAttachments ? 'Oui' : 'Non',
            email.importance || 'normal',
            email.isRead ? 'Oui' : 'Non',
            email.aiAnalysis?.shouldCreateTask ? 'Oui' : 'Non',
            this.escapeCSV(email.aiAnalysis?.taskTitle || ''),
            email.aiAnalysis?.priority || ''
        ]);
        
        const csv = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
        
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        this.downloadFile(blob, `email-scan-${new Date().toISOString().split('T')[0]}.csv`);
    }

    escapeCSV(str) {
        if (!str) return '';
        // Échapper les guillemets et encadrer si nécessaire
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`[EmailScanner] ✅ Export terminé: ${filename}`);
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    updateProgress(percent, message, phase) {
        this.currentProgress = {
            percent,
            message,
            phase,
            current: Math.round((percent / 100) * this.emails.length),
            total: this.emails.length
        };
        
        if (this.onProgressCallback) {
            this.onProgressCallback({
                progress: this.currentProgress,
                message,
                phase
            });
        }
    }

    detectProvider() {
        // Détecter le provider actuel
        if (window.mailService?.getCurrentProvider) {
            const provider = window.mailService.getCurrentProvider();
            if (provider === 'google') return 'gmail';
            if (provider === 'microsoft') return 'outlook';
            return provider;
        }
        
        if (window.googleAuthService?.isAuthenticated?.()) {
            return 'gmail';
        }
        
        if (window.authService?.isAuthenticated?.()) {
            return 'outlook';
        }
        
        return 'unknown';
    }

    dispatchScanCompleted(results) {
        // Dispatcher l'événement scanCompleted
        window.dispatchEvent(new CustomEvent('scanCompleted', {
            detail: {
                results,
                emails: this.emails,
                breakdown: results.breakdown,
                taskPreselectedCategories: results.taskPreselectedCategories,
                preselectedCount: results.stats.preselectedForTasks,
                provider: results.provider
            }
        }));
    }

    reset() {
        console.log('[EmailScanner] 🔄 Réinitialisation...');
        
        this.emails = [];
        this.currentProgress = null;
        this.stats = {
            total: 0,
            categorized: 0,
            analyzed: 0,
            errors: 0,
            preselectedForTasks: 0,
            taskSuggestions: 0
        };
        
        // Nettoyer le cache de catégorisation périodiquement
        if (this.categorizationCache.size > 1000) {
            this.categorizationCache.clear();
        }
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée');
    }

    // ================================================
    // MÉTHODES PUBLIQUES
    // ================================================
    getEmails() {
        return [...this.emails];
    }

    getEmailsByCategory(category) {
        return this.emails.filter(email => email.category === category);
    }

    getPreselectedEmails() {
        return this.emails.filter(email => email.isPreselectedForTasks);
    }

    getTaskPreselectedCategories() {
        return [...this.taskPreselectedCategories];
    }

    updateSettings(settings) {
        console.log('[EmailScanner] 📝 Mise à jour des paramètres:', settings);
        
        if (settings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(settings.taskPreselectedCategories);
        }
        
        if (settings.scanSettings) {
            this.defaultOptions = { ...this.defaultOptions, ...settings.scanSettings };
        }
    }

    getStats() {
        return { ...this.stats };
    }

    isScanning() {
        return this.isScanning;
    }

    getProgress() {
        return this.currentProgress;
    }
}

// ================================================
// INSTANCE GLOBALE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
    window.emailScanner.reset?.();
}

window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v11.0 loaded - Catégorisation corrigée');
