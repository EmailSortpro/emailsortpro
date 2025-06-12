// CategoryManager.js - Version 17.3 - Réparation synchronisation paramètres

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // NOUVEAU: Système de synchronisation renforcé
        this.syncInProgress = false;
        this.lastSyncTime = 0;
        this.syncCallbacks = new Set();
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.setupEventListeners();
        
        console.log('[CategoryManager] ✅ Version 17.3 - Réparation synchronisation paramètres');
        console.log('[CategoryManager] 📊 Paramètres initiaux:', this.settings);
        console.log('[CategoryManager] 📋 Catégories pré-sélectionnées:', this.settings.taskPreselectedCategories);
    }

    // ================================================
    // GESTION DES PARAMÈTRES CENTRALISÉE - RÉPARÉE
    // ================================================
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            const defaultSettings = this.getDefaultSettings();
            
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                const mergedSettings = { ...defaultSettings, ...parsedSettings };
                
                console.log('[CategoryManager] 📥 Paramètres chargés depuis localStorage');
                console.log('[CategoryManager] 🔧 Paramètres par défaut:', defaultSettings);
                console.log('[CategoryManager] 💾 Paramètres sauvegardés:', parsedSettings);
                console.log('[CategoryManager] 🔄 Paramètres fusionnés:', mergedSettings);
                
                return mergedSettings;
            } else {
                console.log('[CategoryManager] 🆕 Utilisation paramètres par défaut');
                return defaultSettings;
            }
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement paramètres:', error);
            const defaults = this.getDefaultSettings();
            console.log('[CategoryManager] 🔄 Fallback vers paramètres par défaut:', defaults);
            return defaults;
        }
    }

    saveSettings(newSettings = null) {
        try {
            if (this.syncInProgress) {
                console.log('[CategoryManager] ⏳ Sync en cours, ajout en queue');
                setTimeout(() => this.saveSettings(newSettings), 100);
                return;
            }
            
            this.syncInProgress = true;
            
            if (newSettings) {
                console.log('[CategoryManager] 📝 Mise à jour settings avec:', newSettings);
                this.settings = { ...this.settings, ...newSettings };
            }
            
            // Vérifier l'intégrité des paramètres
            this.validateSettings();
            
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            this.lastSyncTime = Date.now();
            
            console.log('[CategoryManager] 💾 Paramètres sauvegardés:', this.settings);
            console.log('[CategoryManager] 📋 Catégories pré-sélectionnées sauvées:', this.settings.taskPreselectedCategories);
            
            // Notifier tous les modules avec délai pour éviter les conflits
            setTimeout(() => {
                this.dispatchEvent('categorySettingsChanged', {
                    settings: this.settings,
                    source: 'CategoryManager',
                    timestamp: this.lastSyncTime
                });
                
                // Notifier les callbacks enregistrés
                this.syncCallbacks.forEach(callback => {
                    try {
                        callback(this.settings);
                    } catch (error) {
                        console.warn('[CategoryManager] Erreur callback sync:', error);
                    }
                });
                
                this.syncInProgress = false;
            }, 10);
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde paramètres:', error);
            this.syncInProgress = false;
        }
    }

    validateSettings() {
        // S'assurer que taskPreselectedCategories est un array
        if (!Array.isArray(this.settings.taskPreselectedCategories)) {
            console.warn('[CategoryManager] ⚠️ taskPreselectedCategories n\'est pas un array, correction');
            this.settings.taskPreselectedCategories = this.getDefaultSettings().taskPreselectedCategories;
        }
        
        // S'assurer que les objets nécessaires existent
        if (!this.settings.scanSettings) {
            this.settings.scanSettings = this.getDefaultSettings().scanSettings;
        }
        
        if (!this.settings.preferences) {
            this.settings.preferences = this.getDefaultSettings().preferences;
        }
        
        if (!this.settings.automationSettings) {
            this.settings.automationSettings = this.getDefaultSettings().automationSettings;
        }
        
        console.log('[CategoryManager] ✅ Paramètres validés');
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'],
            categoryExclusions: {
                domains: [],
                emails: []
            },
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            automationSettings: {
                autoCreateTasks: false,
                groupTasksByDomain: false,
                skipDuplicates: true,
                autoAssignPriority: false
            },
            preferences: {
                darkMode: false,
                compactView: false,
                showNotifications: true,
                excludeSpam: true,
                detectCC: true
            }
        };
    }

    // ================================================
    // MÉTHODES PUBLIQUES POUR LES AUTRES MODULES - RÉPARÉES
    // ================================================
    getSettings() {
        console.log('[CategoryManager] 📤 getSettings appelé, retour:', this.settings);
        return { ...this.settings };
    }

    updateSettings(newSettings) {
        console.log('[CategoryManager] 📥 updateSettings appelé avec:', newSettings);
        this.saveSettings(newSettings);
    }

    getTaskPreselectedCategories() {
        const categories = this.settings.taskPreselectedCategories || [];
        console.log('[CategoryManager] 📋 getTaskPreselectedCategories retourne:', categories);
        return [...categories];
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[CategoryManager] 🎯 updateTaskPreselectedCategories appelé avec:', categories);
        
        if (!Array.isArray(categories)) {
            console.error('[CategoryManager] ❌ categories doit être un array');
            return false;
        }
        
        const oldCategories = [...(this.settings.taskPreselectedCategories || [])];
        this.settings.taskPreselectedCategories = [...categories];
        
        console.log('[CategoryManager] 📊 Changement catégories:');
        console.log('  - Anciennes:', oldCategories);
        console.log('  - Nouvelles:', this.settings.taskPreselectedCategories);
        
        this.saveSettings();
        
        // Notification spéciale pour ce changement critique
        setTimeout(() => {
            this.dispatchEvent('taskPreselectedCategoriesChanged', {
                oldCategories,
                newCategories: [...this.settings.taskPreselectedCategories],
                source: 'CategoryManager'
            });
        }, 10);
        
        return true;
    }

    // ================================================
    // SYSTÈME DE CALLBACKS POUR SYNCHRONISATION
    // ================================================
    onSettingsChange(callback) {
        this.syncCallbacks.add(callback);
        console.log('[CategoryManager] 📞 Callback sync enregistré');
        return () => this.syncCallbacks.delete(callback);
    }

    // ================================================
    // FORCE SYNCHRONISATION - NOUVELLE MÉTHODE
    // ================================================
    forceSynchronization() {
        console.log('[CategoryManager] 🚀 Force synchronisation démarrée');
        
        // Recharger depuis localStorage pour éviter les désynchronisations
        const saved = localStorage.getItem('categorySettings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.getDefaultSettings(), ...parsed };
                this.validateSettings();
                
                console.log('[CategoryManager] 🔄 Settings rechargés:', this.settings);
                console.log('[CategoryManager] 📋 Catégories pré-sélectionnées rechargées:', this.settings.taskPreselectedCategories);
                
                // Notifier tous les modules
                setTimeout(() => {
                    this.dispatchEvent('forceSynchronization', {
                        settings: this.settings,
                        source: 'CategoryManager',
                        timestamp: Date.now()
                    });
                }, 10);
                
                return true;
            } catch (error) {
                console.error('[CategoryManager] ❌ Erreur force sync:', error);
                return false;
            }
        }
        
        return false;
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100
            },
            
            // CATÉGORIE CC - PRIORITÉ ÉLEVÉE
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90
            },
            
            // PRIORITÉ NORMALE POUR LES AUTRES
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité, connexions et authentification',
                priority: 50
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                priority: 50
            },
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire et demandes d\'action',
                priority: 50
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis et contrats',
                priority: 50
            },
            
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                priority: 50
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                priority: 50
            },
            
            reminders: {
                name: 'Relances',
                icon: '🔄',
                color: '#10b981',
                description: 'Rappels et suivis',
                priority: 50
            },
            
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion de projet',
                priority: 50
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                priority: 50
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                priority: 50
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques',
                priority: 50
            }
        };
        
        this.isInitialized = true;
        console.log('[CategoryManager] ✅ Catégories initialisées:', Object.keys(this.categories));
    }

    // ================================================
    // SYSTÈME DE DÉTECTION AVEC MOTS-CLÉS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS - PRIORITÉ MAXIMALE
            marketing_news: {
                absolute: [
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'cet email vous est envoyé', 'vous recevez cet email',
                    'limited offer', 'offre limitée', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente privée'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'abonné', 'subscriber', 'désinscription'
                ],
                weak: ['update', 'discover', 'new'],
                exclusions: []
            },

            // SÉCURITÉ
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'quelqu\'un s\'est connecté', 'connexion à votre compte',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'password reset', 'réinitialisation mot de passe'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe'
                ],
                weak: ['compte', 'account', 'accès'],
                exclusions: ['newsletter', 'unsubscribe', 'promotion']
            },

            // TÂCHES
            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable',
                    'urgence', 'urgent', 'très urgent',
                    'merci de faire', 'pouvez-vous faire', 'pourriez-vous faire',
                    'action à mener', 'à faire', 'à traiter',
                    'confirmation requise', 'approval needed'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'deadline', 'échéance'
                ],
                weak: ['demande', 'besoin', 'attente'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            // RÉUNIONS
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'conference call', 'rendez-vous', 'rdv'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment'
                ],
                weak: ['présentation', 'agenda'],
                exclusions: ['newsletter', 'promotion']
            },

            // COMMERCIAL
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale',
                    'proposition commerciale', 'business proposal',
                    'opportunité commerciale', 'nouveau client'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal'
                ],
                weak: ['offre', 'négociation'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            // FINANCE
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration',
                    'impôts', 'taxes', 'fiscal',
                    'comptabilité', 'accounting', 'bilan'
                ],
                strong: [
                    'montant', 'amount', 'total', 'facture',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'paiement', 'payment'
                ],
                weak: ['euro', 'dollar', 'prix'],
                exclusions: ['newsletter', 'marketing']
            },

            // RELANCES
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'suite à notre', 'faisant suite'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu'
                ],
                weak: ['previous', 'discussed'],
                exclusions: ['newsletter', 'marketing']
            },

            // SUPPORT
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'ticket de support', 'help desk'
                ],
                strong: [
                    'support', 'assistance', 'help desk',
                    'technical support', 'ticket'
                ],
                weak: ['help', 'aide', 'issue'],
                exclusions: ['newsletter', 'marketing']
            },

            // PROJETS
            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'kick off'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum'
                ],
                weak: ['development', 'phase'],
                exclusions: ['newsletter', 'marketing']
            },

            // RH
            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'onboarding',
                    'entretien annuel', 'performance review',
                    'recrutement', 'recruitment'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary',
                    'ressources humaines', 'human resources'
                ],
                weak: ['employee', 'staff'],
                exclusions: ['newsletter', 'marketing']
            },

            // INTERNE
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'memo interne',
                    'communication interne', 'note de service'
                ],
                strong: [
                    'internal', 'interne', 'company wide',
                    'personnel', 'staff'
                ],
                weak: ['annonce', 'announcement'],
                exclusions: ['newsletter', 'marketing', 'external']
            },

            // NOTIFICATIONS
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique',
                    'system notification', 'ceci est un message automatique'
                ],
                strong: [
                    'automated', 'automatic', 'system',
                    'notification', 'automatique'
                ],
                weak: ['notification', 'alert'],
                exclusions: ['newsletter', 'marketing']
            },

            // CC
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy'
                ],
                strong: ['information', 'copie', 'copy'],
                weak: ['fyi', 'info'],
                exclusions: []
            }
        };
    }

    // ================================================
    // ANALYSE PRINCIPALE D'EMAIL
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Filtrer les courriers indésirables si activé
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email);
        
        // Vérification CC en priorité si activé
        if (this.shouldDetectCC() && this.isInCC(email)) {
            // Vérifier si ce n'est pas du marketing malgré le CC
            const marketingCheck = this.analyzeCategory(content, this.weightedKeywords.marketing_news);
            if (marketingCheck.score >= 80) {
                return {
                    category: 'marketing_news',
                    score: marketingCheck.total,
                    confidence: this.calculateConfidence(marketingCheck),
                    matchedPatterns: marketingCheck.matches,
                    hasAbsolute: marketingCheck.hasAbsolute,
                    originallyCC: true
                };
            }
            
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'email_in_cc', type: 'detected', score: 100 }],
                hasAbsolute: true,
                isCC: true
            };
        }
        
        // Analyse normale
        const allResults = this.analyzeAllCategories(content);
        return this.selectByPriorityWithThreshold(allResults);
    }

    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        for (const [categoryId, keywords] of Object.entries(this.weightedKeywords)) {
            if (!activeCategories.includes(categoryId) && 
                categoryId !== 'marketing_news' && 
                categoryId !== 'cc') {
                continue;
            }
            
            const score = this.calculateScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                hasAbsolute: score.hasAbsolute,
                matches: score.matches,
                confidence: this.calculateConfidence(score),
                priority: this.categories[categoryId]?.priority || 50
            };
        }
        
        return results;
    }

    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return b.score - a.score;
            });
        
        const bestResult = sortedResults[0];
        
        if (bestResult) {
            return {
                category: bestResult.category,
                score: bestResult.score,
                confidence: bestResult.confidence,
                matchedPatterns: bestResult.matches,
                hasAbsolute: bestResult.hasAbsolute
            };
        }
        
        return {
            category: 'other',
            score: 0,
            confidence: 0,
            matchedPatterns: [],
            hasAbsolute: false
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Mots absolus (100 points)
        if (keywords.absolute) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                }
            }
        }
        
        // Mots forts (30 points)
        if (keywords.strong && matches.length < 5) {
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 30;
                    matches.push({ keyword, type: 'strong', score: 30 });
                }
            }
        }
        
        // Mots faibles (10 points) - seulement si pas de mots absolus
        if (keywords.weak && !hasAbsolute) {
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 10;
                    matches.push({ keyword, type: 'weak', score: 10 });
                }
            }
        }
        
        return { total: Math.max(0, totalScore), hasAbsolute, matches };
    }

    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        if (email.subject) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(5);
        }
        
        if (email.from?.emailAddress?.address) {
            allText += email.from.emailAddress.address + ' ';
        }
        if (email.from?.emailAddress?.name) {
            allText += email.from.emailAddress.name + ' ';
        }
        
        if (email.bodyPreview) {
            allText += email.bodyPreview + ' ';
        }
        if (email.body?.content) {
            allText += this.cleanHtml(email.body.content) + ' ';
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length
        };
    }

    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedText = text.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o');
        
        const normalizedKeyword = keyword.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o');
        
        return normalizedText.includes(normalizedKeyword);
    }

    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.85;
        if (score.total >= 100) return 0.80;
        if (score.total >= 80) return 0.75;
        if (score.total >= 60) return 0.70;
        if (score.total >= 40) return 0.60;
        if (score.total >= 30) return 0.55;
        return 0.40;
    }

    cleanHtml(html) {
        if (!html) return '';
        return html
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    // ================================================
    // DÉTECTION SPAM ET CC
    // ================================================
    isSpamEmail(email) {
        if (email.parentFolderId) {
            const folderInfo = email.parentFolderId.toLowerCase();
            if (folderInfo.includes('junk') || 
                folderInfo.includes('spam') || 
                folderInfo.includes('unwanted') ||
                folderInfo.includes('indésirable')) {
                return true;
            }
        }
        return false;
    }

    isInCC(email) {
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients)) {
            return false;
        }
        return email.ccRecipients.length > 0;
    }

    // ================================================
    // MÉTHODES PUBLIQUES
    // ================================================
    getCategories() {
        return this.categories;
    }
    
    getCategory(categoryId) {
        if (categoryId === 'all') {
            return { id: 'all', name: 'Tous', icon: '📧', color: '#1e293b' };
        }
        if (categoryId === 'other') {
            return { id: 'other', name: 'Non classé', icon: '❓', color: '#64748b' };
        }
        if (categoryId === 'spam') {
            return { id: 'spam', name: 'Spam', icon: '🚫', color: '#dc2626' };
        }
        return this.categories[categoryId] || null;
    }

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

    getScanSettings() {
        return this.settings.scanSettings;
    }

    getAutomationSettings() {
        return this.settings.automationSettings;
    }

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return this.settings.activeCategories;
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        this.settingsChangeHandler = (event) => {
            const { type, value } = event.detail;
            console.log(`[CategoryManager] 📥 Reçu changement: ${type}`, value);
            
            switch (type) {
                case 'preferences':
                    this.updateSettings({ preferences: { ...this.settings.preferences, ...value } });
                    break;
                case 'scanSettings':
                    this.updateSettings({ scanSettings: { ...this.settings.scanSettings, ...value } });
                    break;
                case 'automationSettings':
                    this.updateSettings({ automationSettings: { ...this.settings.automationSettings, ...value } });
                    break;
                case 'taskPreselectedCategories':
                    this.updateTaskPreselectedCategories(value);
                    break;
                case 'activeCategories':
                    this.updateSettings({ activeCategories: value });
                    break;
            }
        };

        window.addEventListener('settingsChanged', this.settingsChangeHandler);
        this.eventListenersSetup = true;
        
        console.log('[CategoryManager] ✅ Event listeners configurés');
    }

    dispatchEvent(eventName, detail) {
        try {
            const event = new CustomEvent(eventName, { detail });
            window.dispatchEvent(event);
            console.log(`[CategoryManager] 📤 Événement dispatché: ${eventName}`, detail);
        } catch (error) {
            console.error(`[CategoryManager] ❌ Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // DEBUG
    // ================================================
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }

    getDebugInfo() {
        return {
            settings: this.settings,
            taskPreselectedCategories: this.getTaskPreselectedCategories(),
            isInitialized: this.isInitialized,
            syncInProgress: this.syncInProgress,
            lastSyncTime: this.lastSyncTime,
            eventListenersSetup: this.eventListenersSetup,
            categoriesCount: Object.keys(this.categories).length,
            syncCallbacksCount: this.syncCallbacks.size
        };
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        if (this.settingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.settingsChangeHandler);
        }
        this.eventListenersSetup = false;
        this.syncCallbacks.clear();
    }

    destroy() {
        this.cleanup();
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        console.log('[CategoryManager] Instance détruite');
    }
}

// Créer l'instance globale avec nettoyage préalable
if (window.categoryManager) {
    window.categoryManager.destroy?.();
}

window.categoryManager = new CategoryManager();

console.log('✅ CategoryManager v17.3 loaded - Réparation synchronisation paramètres');
