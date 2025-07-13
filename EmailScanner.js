// EmailScanner.js - Version 13.0 - Catégorisation complètement refaite
// Correction complète du système de catégorisation avec priorités strictes

console.log('[EmailScanner] 🚀 Loading EmailScanner.js v13.0 - Catégorisation refaite...');

class EmailScanner {
    constructor() {
        this.emails = [];
        this.isScanning = false;
        this.taskPreselectedCategories = [];
        this.currentProgress = null;
        this.onProgressCallback = null;
        
        // Nouveau système de catégorisation avec patterns exclusifs
        this.categorizationRules = this.initCategorizationRules();
        
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
        
        console.log('[EmailScanner] ✅ Scanner v13.0 initialized - Catégorisation refaite');
        this.initialize();
    }

    // ================================================
    // NOUVEAU SYSTÈME DE CATÉGORISATION
    // ================================================
    initCategorizationRules() {
        // Règles avec priorités et patterns exclusifs
        return [
            // PRIORITÉ 1: Marketing & Newsletters - DOIT ÊTRE VÉRIFIÉ EN PREMIER
            {
                category: 'marketing_news',
                priority: 1,
                name: 'Marketing & Newsletters',
                icon: '📰',
                color: '#8b5cf6',
                // Patterns qui FORCENT cette catégorie
                mustHavePatterns: [
                    // Patterns de désabonnement (TRÈS IMPORTANT)
                    /se\s+d[eé]sabonner/i,
                    /se\s+d[eé]sinscrire/i,
                    /d[eé]sabonner/i,
                    /d[eé]sinscrire/i,
                    /unsubscribe/i,
                    /opt[\s-]?out/i,
                    /stop\s+receiving/i,
                    /ne\s+plus\s+recevoir/i,
                    /g[eé]rer\s+(vos\s+)?pr[eé]f[eé]rences/i,
                    /g[eé]rer\s+les\s+param[eè]tres/i,
                    /email\s+preferences/i,
                    /notification\s+settings/i,
                    /manage\s+notifications/i,
                    /update\s+your\s+preferences/i,
                    /modify\s+your\s+subscription/i,
                    /newsletter/i,
                    /mailing\s+list/i,
                    /this\s+email\s+was\s+sent\s+to/i,
                    /you\s+are\s+receiving\s+this/i,
                    /vous\s+ne\s+souhaitez\s+plus\s+recevoir/i,
                    /param[eé]trez\s+vos\s+choix/i,
                    /politique\s+de\s+confidentialit[eé]/i,
                    /privacy\s+policy/i
                ],
                // Headers spéciaux
                headerIndicators: [
                    'List-Unsubscribe',
                    'List-Unsubscribe-Post',
                    'X-Campaign-Id',
                    'X-Mailchimp-Campaign'
                ],
                // Labels Gmail
                gmailLabels: ['CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', 'CATEGORY_SOCIAL', 'CATEGORY_FORUMS'],
                // Domaines typiques
                domainPatterns: [
                    /mailchimp/i,
                    /sendgrid/i,
                    /mailgun/i,
                    /campaign/i,
                    /newsletter/i,
                    /marketing/i,
                    /promo/i,
                    /noreply/i,
                    /no-reply/i,
                    /donotreply/i
                ]
            },

            // PRIORITÉ 2: Ressources Humaines (après Marketing pour éviter les faux positifs)
            {
                category: 'hr',
                priority: 2,
                name: 'Ressources Humaines',
                icon: '👥',
                color: '#10b981',
                mustHavePatterns: [
                    /votre\s+candidature/i,
                    /your\s+application/i,
                    /suite\s+(de\s+)?votre\s+candidature/i,
                    /processus\s+de\s+recrutement/i,
                    /recruitment\s+process/i,
                    /offre\s+d'emploi/i,
                    /job\s+offer/i,
                    /poste\s+(de|à\s+pourvoir)/i,
                    /entretien/i,
                    /interview/i,
                    /customer\s+success\s+manager/i,
                    /responsable\s+succ[eè]s\s+client/i,
                    /charg[eé]e?\s+de\s+recrutement/i,
                    /ressources\s+humaines/i,
                    /human\s+resources/i,
                    /bulletin\s+de\s+paie/i,
                    /fiche\s+de\s+paie/i,
                    /payslip/i,
                    /cong[eé]s/i,
                    /onboarding/i
                ],
                // NE PAS catégoriser en HR si ces patterns sont présents
                excludeIfContains: [
                    /se\s+d[eé]sabonner/i,
                    /unsubscribe/i,
                    /newsletter/i,
                    /vous\s+recevez\s+ce/i,
                    /this\s+email\s+was\s+sent/i
                ]
            },

            // PRIORITÉ 3: Finance & Comptabilité
            {
                category: 'finance',
                priority: 3,
                name: 'Finance & Comptabilité',
                icon: '💰',
                color: '#f59e0b',
                mustHavePatterns: [
                    /facture\s*(n[°o]|num[eé]ro)/i,
                    /invoice\s*(number|#)/i,
                    /montant.*€/i,
                    /total.*€/i,
                    /paiement/i,
                    /payment/i,
                    /virement/i,
                    /pr[eé]l[eè]vement/i,
                    /remboursement/i,
                    /refund/i,
                    /relev[eé]\s+bancaire/i,
                    /bank\s+statement/i,
                    /commande\s*(n[°o]|num[eé]ro)/i,
                    /order\s*(number|#)/i,
                    /facture.*disponible/i,
                    /invoice.*available/i
                ],
                excludeIfContains: [
                    /se\s+d[eé]sabonner/i,
                    /unsubscribe/i,
                    /newsletter/i
                ]
            },

            // PRIORITÉ 4: Réunions & Rendez-vous
            {
                category: 'meetings',
                priority: 4,
                name: 'Réunions & Rendez-vous',
                icon: '📅',
                color: '#3b82f6',
                mustHavePatterns: [
                    /invitation\s+[àa]\s+une\s+r[eé]union/i,
                    /meeting\s+invitation/i,
                    /meeting\s+request/i,
                    /teams\s+meeting/i,
                    /zoom\s+meeting/i,
                    /google\s+meet/i,
                    /rendez-vous/i,
                    /appointment/i,
                    /agenda/i,
                    /ordre\s+du\s+jour/i,
                    /conf[eé]rence/i,
                    /visioconf[eé]rence/i,
                    /video\s+call/i,
                    /calendrier/i,
                    /calendar/i,
                    /planifier/i,
                    /schedule/i
                ],
                excludeIfContains: [
                    /se\s+d[eé]sabonner/i,
                    /unsubscribe/i,
                    /newsletter/i,
                    /facture/i,
                    /invoice/i
                ]
            },

            // PRIORITÉ 5: Sécurité
            {
                category: 'security',
                priority: 5,
                name: 'Sécurité',
                icon: '🔒',
                color: '#dc2626',
                mustHavePatterns: [
                    /alerte\s+de\s+connexion/i,
                    /nouvelle\s+connexion/i,
                    /new\s+sign[\s-]?in/i,
                    /activit[eé]\s+suspecte/i,
                    /suspicious\s+activity/i,
                    /code\s+de\s+v[eé]rification/i,
                    /verification\s+code/i,
                    /two[\s-]?factor/i,
                    /2fa/i,
                    /authentification/i,
                    /authentication/i,
                    /password\s+reset/i,
                    /r[eé]initialisation.*mot\s+de\s+passe/i,
                    /security\s+alert/i,
                    /alerte\s+de\s+s[eé]curit[eé]/i
                ]
            },

            // PRIORITÉ 6: Actions & Tâches
            {
                category: 'tasks',
                priority: 6,
                name: 'Actions & Tâches',
                icon: '✅',
                color: '#ef4444',
                mustHavePatterns: [
                    /action\s+requise/i,
                    /action\s+required/i,
                    /action\s+needed/i,
                    /veuillez\s+compl[eé]ter/i,
                    /please\s+complete/i,
                    /t[âa]che\s+assign[eé]e/i,
                    /task\s+assigned/i,
                    /[eé]ch[eé]ance/i,
                    /deadline/i,
                    /due\s+date/i,
                    /urgent/i,
                    /asap/i,
                    /prioritaire/i,
                    /validation\s+requise/i,
                    /approval\s+needed/i,
                    /signature\s+requise/i
                ],
                excludeIfContains: [
                    /se\s+d[eé]sabonner/i,
                    /unsubscribe/i,
                    /newsletter/i
                ]
            },

            // PRIORITÉ 7: Commercial & Ventes
            {
                category: 'commercial',
                priority: 7,
                name: 'Commercial & Ventes',
                icon: '💼',
                color: '#059669',
                mustHavePatterns: [
                    /opportunit[eé]\s+commerciale/i,
                    /business\s+opportunity/i,
                    /demande\s+de\s+devis/i,
                    /quote\s+request/i,
                    /proposition\s+commerciale/i,
                    /contrat\s+commercial/i,
                    /sales\s+contract/i,
                    /bon\s+de\s+commande/i,
                    /purchase\s+order/i,
                    /offre\s+commerciale/i
                ]
            },

            // PRIORITÉ 8: Support & Assistance
            {
                category: 'support',
                priority: 8,
                name: 'Support & Assistance',
                icon: '🛠️',
                color: '#ea580c',
                mustHavePatterns: [
                    /ticket\s*[#n°]/i,
                    /ticket\s+(de\s+)?support/i,
                    /support\s+ticket/i,
                    /case\s*[#n°]/i,
                    /incident\s*[#n°]/i,
                    /probl[eè]me\s+r[eé]solu/i,
                    /issue\s+resolved/i,
                    /demande\s+d'assistance/i,
                    /support\s+request/i
                ]
            },

            // PRIORITÉ 9: Projets
            {
                category: 'project',
                priority: 9,
                name: 'Gestion de Projet',
                icon: '📊',
                color: '#06b6d4',
                mustHavePatterns: [
                    /projet\s+\w+/i,
                    /project\s+update/i,
                    /milestone/i,
                    /avancement\s+du\s+projet/i,
                    /project\s+status/i,
                    /sprint/i,
                    /livrable/i,
                    /gantt/i,
                    /kickoff/i,
                    /roadmap/i,
                    /jira/i,
                    /github\s+issue/i,
                    /pull\s+request/i,
                    /merge\s+request/i
                ]
            },

            // PRIORITÉ 10: Notifications
            {
                category: 'notifications',
                priority: 10,
                name: 'Notifications Système',
                icon: '🔔',
                color: '#94a3b8',
                mustHavePatterns: [
                    /ceci\s+est\s+un\s+message\s+automatique/i,
                    /this\s+is\s+an\s+automated\s+message/i,
                    /notification\s+syst[eè]me/i,
                    /system\s+notification/i,
                    /alerte\s+syst[eè]me/i,
                    /message\s+g[eé]n[eé]r[eé]\s+automatiquement/i,
                    /automatically\s+generated/i
                ]
            },

            // PRIORITÉ 11: Rappels
            {
                category: 'reminders',
                priority: 11,
                name: 'Rappels & Relances',
                icon: '🔄',
                color: '#22c55e',
                mustHavePatterns: [
                    /^reminder:/i,
                    /^rappel:/i,
                    /follow[\s-]?up/i,
                    /relance/i,
                    /rappel\s+amical/i,
                    /friendly\s+reminder/i,
                    /gentle\s+reminder/i,
                    /je\s+reviens\s+vers\s+vous/i,
                    /circling\s+back/i,
                    /comme\s+convenu/i,
                    /as\s+discussed/i
                ]
            },

            // PRIORITÉ 12: Logistique
            {
                category: 'logistics',
                priority: 12,
                name: 'Logistique & Livraisons',
                icon: '📦',
                color: '#84cc16',
                mustHavePatterns: [
                    /commande\s+exp[eé]di[eé]e/i,
                    /order\s+shipped/i,
                    /colis\s+exp[eé]di[eé]/i,
                    /num[eé]ro\s+de\s+suivi/i,
                    /tracking\s+number/i,
                    /livraison\s+pr[eé]vue/i,
                    /delivery\s+scheduled/i,
                    /colis\s+livr[eé]/i,
                    /package\s+delivered/i
                ]
            },

            // PRIORITÉ 13: Communication Interne
            {
                category: 'internal',
                priority: 13,
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                mustHavePatterns: [
                    /all\s+staff/i,
                    /tout\s+le\s+personnel/i,
                    /annonce\s+interne/i,
                    /[àa]\s+tous\s+les\s+collaborateurs/i,
                    /to\s+all\s+employees/i,
                    /communication\s+interne/i,
                    /company\s+announcement/i,
                    /note\s+de\s+service/i,
                    /message\s+de\s+la\s+direction/i
                ]
            },

            // PRIORITÉ 14: En Copie
            {
                category: 'cc',
                priority: 14,
                name: 'En Copie (CC)',
                icon: '📋',
                color: '#64748b',
                mustHavePatterns: [
                    /copie\s+pour\s+information/i,
                    /for\s+your\s+information/i,
                    /\bfyi\b/i,
                    /pour\s+information/i,
                    /en\s+copie\s+pour\s+information/i,
                    /cc\s*:\s*pour\s+info/i,
                    /mis\s+en\s+copie/i,
                    /courtesy\s+copy/i
                ]
            }
        ];
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
        
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v13.0 ===');
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
            mailOptions.days = options.days;
        } else if (options.days === -1) {
            mailOptions.maxResults = 1000; // Limite raisonnable
        }
        
        const emails = await window.mailService.getMessages(options.folder || 'inbox', mailOptions);
        
        console.log(`[EmailScanner] ✅ ${emails.length} emails récupérés depuis MailService`);
        
        // Normaliser les emails et enrichir avec les infos supplémentaires
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
        
        // Créer un email normalisé avec toutes les infos
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
            // Informations pour améliorer la catégorisation
            _categorizationHints: {
                hasUnsubscribeHeader,
                gmailLabels: labels,
                isPromotional: hasPromotionsLabel || hasUpdatesLabel || hasSocialLabel || hasForumsLabel,
                listHeaders: {
                    unsubscribe: listUnsubscribe,
                    unsubscribePost: listUnsubscribePost
                },
                allHeaders: headers
            }
        };
        
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
            '$select': 'id,conversationId,receivedDateTime,subject,body,bodyPreview,importance,isRead,hasAttachments,from,toRecipients,ccRecipients,internetMessageHeaders',
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
            // Préserver les hints de catégorisation s'ils existent
            _categorizationHints: email._categorizationHints || {},
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
    // NOUVELLE MÉTHODE DE CATÉGORISATION V13.0
    // ================================================
    async categorizeEmails(options) {
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION v13.0 ===');
        console.log('[EmailScanner] 📊 Total emails:', this.emails.length);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        const breakdown = {};
        let categorizedCount = 0;
        let preselectedCount = 0;
        let marketingNewsCount = 0;
        let otherCount = 0;
        const errors = [];
        const debugSamples = [];
        
        for (let i = 0; i < this.emails.length; i++) {
            const email = this.emails[i];
            
            try {
                // Extraire tout le contenu pour analyse
                const emailContent = this.extractFullEmailContent(email);
                
                // Appliquer le nouveau système de catégorisation
                const category = this.categorizeEmail(emailContent, email);
                
                // Assigner la catégorie
                email.category = category.id;
                email.categoryScore = category.score;
                email.categoryConfidence = category.confidence;
                email.categoryMatchReason = category.matchReason;
                
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
                    marketingNewsCount++;
                }
                if (email.category === 'other') {
                    otherCount++;
                }
                
                // Debug: collecter des échantillons pour vérification
                if (debugSamples.length < 10 && (
                    email.category === 'marketing_news' || 
                    (email.category === 'hr' && emailContent.toLowerCase().includes('désabonner'))
                )) {
                    debugSamples.push({
                        subject: email.subject,
                        from: email.from?.emailAddress?.address,
                        category: email.category,
                        reason: email.categoryMatchReason,
                        hasUnsubscribe: emailContent.toLowerCase().includes('désabonner') || 
                                       emailContent.toLowerCase().includes('unsubscribe')
                    });
                }
                
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur catégorisation email:', error);
                email.category = 'other';
                email.categoryScore = 0;
                email.categoryConfidence = 0;
                email.isPreselectedForTasks = false;
                errors.push({ email: email.subject, error: error.message });
                otherCount++;
            }
            
            // Mise à jour progression
            if (i % 10 === 0) {
                const progress = Math.round((i / this.emails.length) * 100);
                this.updateProgress(progress, `Catégorisation ${i}/${this.emails.length}`, 'categorize');
            }
        }
        
        // Afficher le résumé
        console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
        console.log('[EmailScanner] 📊 Distribution complète:', breakdown);
        console.log('[EmailScanner] 📰 Marketing & Newsletters:', marketingNewsCount);
        console.log('[EmailScanner] ❓ Non classés (other):', otherCount);
        console.log('[EmailScanner] ⭐ Total pré-sélectionnés:', preselectedCount);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors.length);
        
        // Afficher les échantillons de debug
        if (debugSamples.length > 0) {
            console.log('[EmailScanner] 🔍 === ÉCHANTILLONS DEBUG ===');
            debugSamples.forEach((sample, index) => {
                console.log(`[EmailScanner] 📧 Échantillon ${index + 1}:`, sample);
            });
        }
        
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
            errors,
            debugInfo: {
                marketingNewsCount,
                otherCount,
                samples: debugSamples
            }
        };
    }

    // NOUVELLE MÉTHODE : Extraction complète du contenu
    extractFullEmailContent(email) {
        let content = '';
        
        // Sujet (très important, répété pour plus de poids)
        if (email.subject) {
            content += (email.subject + ' ').repeat(3);
        }
        
        // Corps de l'email
        if (email.bodyPreview) {
            content += email.bodyPreview + ' ';
        }
        
        if (email.body?.content) {
            const cleanBody = email.body.content
                .replace(/<[^>]+>/g, ' ')
                .replace(/&[^;]+;/g, ' ');
            content += cleanBody + ' ';
        }
        
        // Adresse expéditeur
        if (email.from?.emailAddress?.address) {
            content += email.from.emailAddress.address + ' ';
        }
        
        // Inclure les hints de catégorisation s'ils existent
        if (email._categorizationHints) {
            // Headers de désabonnement
            if (email._categorizationHints.listHeaders?.unsubscribe) {
                content += ' unsubscribe_header_present ';
            }
            
            // Labels Gmail
            if (email._categorizationHints.gmailLabels) {
                content += email._categorizationHints.gmailLabels.join(' ') + ' ';
            }
            
            // Indicateur promotionnel
            if (email._categorizationHints.isPromotional) {
                content += ' promotional_indicator ';
            }
        }
        
        return content.toLowerCase();
    }

    // NOUVELLE MÉTHODE : Catégorisation avec règles prioritaires
    categorizeEmail(content, email) {
        // Parcourir les règles dans l'ordre de priorité
        for (const rule of this.categorizationRules) {
            // Vérifier d'abord les exclusions
            if (rule.excludeIfContains) {
                let excluded = false;
                for (const excludePattern of rule.excludeIfContains) {
                    if (excludePattern.test(content)) {
                        excluded = true;
                        break;
                    }
                }
                if (excluded) continue;
            }
            
            // Vérifier les patterns obligatoires
            for (const pattern of rule.mustHavePatterns) {
                if (pattern.test(content)) {
                    return {
                        id: rule.category,
                        score: 100,
                        confidence: 0.95,
                        matchReason: `Pattern match: ${pattern.source}`
                    };
                }
            }
            
            // Vérifier les headers spéciaux (pour marketing_news)
            if (rule.headerIndicators && email._categorizationHints?.allHeaders) {
                const headers = email._categorizationHints.allHeaders;
                for (const headerName of rule.headerIndicators) {
                    if (headers.some(h => h.name.toLowerCase() === headerName.toLowerCase())) {
                        return {
                            id: rule.category,
                            score: 95,
                            confidence: 0.93,
                            matchReason: `Header indicator: ${headerName}`
                        };
                    }
                }
            }
            
            // Vérifier les labels Gmail (pour marketing_news)
            if (rule.gmailLabels && email._categorizationHints?.gmailLabels) {
                const emailLabels = email._categorizationHints.gmailLabels;
                for (const label of rule.gmailLabels) {
                    if (emailLabels.includes(label)) {
                        return {
                            id: rule.category,
                            score: 90,
                            confidence: 0.90,
                            matchReason: `Gmail label: ${label}`
                        };
                    }
                }
            }
            
            // Vérifier les patterns de domaine
            if (rule.domainPatterns && email.from?.emailAddress?.address) {
                const fromAddress = email.from.emailAddress.address.toLowerCase();
                for (const domainPattern of rule.domainPatterns) {
                    if (domainPattern.test(fromAddress)) {
                        return {
                            id: rule.category,
                            score: 85,
                            confidence: 0.88,
                            matchReason: `Domain pattern: ${domainPattern.source}`
                        };
                    }
                }
            }
        }
        
        // Si aucune règle ne correspond, catégoriser comme "other"
        return {
            id: 'other',
            score: 0,
            confidence: 0.5,
            matchReason: 'No pattern matched'
        };
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
                // Vérifier que la méthode existe
                if (typeof window.aiTaskAnalyzer.analyze === 'function') {
                    const analysis = await window.aiTaskAnalyzer.analyze(email);
                    if (analysis) {
                        email.aiAnalysis = analysis;
                        analyzedCount++;
                        
                        if (analysis.shouldCreateTask) {
                            taskSuggestions++;
                        }
                    }
                } else if (typeof window.aiTaskAnalyzer.analyzeEmailForTask === 'function') {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTask(email);
                    if (analysis) {
                        email.aiAnalysis = analysis;
                        analyzedCount++;
                        
                        if (analysis.shouldCreateTask) {
                            taskSuggestions++;
                        }
                    }
                } else {
                    console.warn('[EmailScanner] ⚠️ Aucune méthode d\'analyse IA disponible');
                    break;
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
                categoryMatchReason: email.categoryMatchReason,
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
            'Catégorie', 'Score', 'Confiance', 'Raison', 'Pré-sélectionné',
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
            this.escapeCSV(email.categoryMatchReason || ''),
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
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée');
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    debugCategorization(emailIndex = 0) {
        if (!this.emails || this.emails.length === 0) {
            console.log('[EmailScanner] ❌ Aucun email à débugger');
            return;
        }
        
        const email = this.emails[emailIndex];
        if (!email) {
            console.log('[EmailScanner] ❌ Email non trouvé à l\'index', emailIndex);
            return;
        }
        
        console.group('[EmailScanner] 🔍 DEBUG CATÉGORISATION');
        console.log('Email original:', {
            subject: email.subject,
            from: email.from?.emailAddress?.address,
            bodyPreview: email.bodyPreview?.substring(0, 100) + '...',
            _categorizationHints: email._categorizationHints
        });
        
        // Extraire le contenu complet
        const content = this.extractFullEmailContent(email);
        console.log('Contenu extrait (200 premiers caractères):', content.substring(0, 200) + '...');
        
        // Tester chaque règle
        console.log('\n📋 Test des règles de catégorisation:');
        for (const rule of this.categorizationRules) {
            console.group(`Règle: ${rule.category} (priorité ${rule.priority})`);
            
            // Vérifier les exclusions
            if (rule.excludeIfContains) {
                for (const excludePattern of rule.excludeIfContains) {
                    if (excludePattern.test(content)) {
                        console.log('❌ EXCLU par pattern:', excludePattern.source);
                        console.groupEnd();
                        continue;
                    }
                }
            }
            
            // Vérifier les patterns
            let matched = false;
            for (const pattern of rule.mustHavePatterns) {
                if (pattern.test(content)) {
                    console.log('✅ MATCH pattern:', pattern.source);
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                console.log('❌ Aucun pattern matché');
            }
            
            console.groupEnd();
        }
        
        // Résultat final
        const category = this.categorizeEmail(content, email);
        console.log('\n📊 Résultat final:', {
            category: category.id,
            score: category.score,
            confidence: category.confidence,
            reason: category.matchReason
        });
        
        console.groupEnd();
    }
    
    // Méthode pour vérifier les emails mal catégorisés
    debugMiscategorized() {
        console.group('[EmailScanner] 🔍 DEBUG EMAILS MAL CATÉGORISÉS');
        
        // Chercher les emails qui contiennent des patterns de désabonnement
        const suspectEmails = this.emails.filter(email => {
            const content = this.extractFullEmailContent(email);
            const hasUnsubscribe = /d[eé]sabonner|unsubscribe|newsletter/i.test(content);
            return hasUnsubscribe && email.category !== 'marketing_news';
        });
        
        console.log(`Emails suspects (contiennent désabonnement mais pas en marketing_news): ${suspectEmails.length}`);
        
        suspectEmails.slice(0, 5).forEach((email, index) => {
            console.log(`\n📧 Email suspect ${index + 1}:`, {
                subject: email.subject,
                from: email.from?.emailAddress?.address,
                category: email.category,
                score: email.categoryScore,
                reason: email.categoryMatchReason,
                bodyPreview: email.bodyPreview?.substring(0, 100) + '...'
            });
        });
        
        // Statistiques par catégorie
        console.log('\n📊 Distribution des catégories:');
        const distribution = {};
        this.emails.forEach(email => {
            distribution[email.category] = (distribution[email.category] || 0) + 1;
        });
        
        Object.entries(distribution)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                const percentage = ((count / this.emails.length) * 100).toFixed(1);
                console.log(`${category}: ${count} emails (${percentage}%)`);
            });
        
        console.groupEnd();
    }
    
    // Méthode pour tester un email spécifique
    testEmail(emailData) {
        console.group('[EmailScanner] 🧪 TEST EMAIL');
        
        const testEmail = {
            subject: emailData.subject || '',
            bodyPreview: emailData.body || '',
            body: { content: emailData.body || '' },
            from: { 
                emailAddress: { 
                    address: emailData.from || 'test@example.com' 
                } 
            },
            _categorizationHints: emailData.hints || {}
        };
        
        const content = this.extractFullEmailContent(testEmail);
        const category = this.categorizeEmail(content, testEmail);
        
        console.log('Email de test:', testEmail);
        console.log('Résultat catégorisation:', category);
        
        console.groupEnd();
        
        return category;
    }
    
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
