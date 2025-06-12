// CategoryManager.js - Version 18.0 - Réécriture complète avec synchronisation parfaite

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // NOUVEAU: Système de synchronisation ultra-robuste
        this.syncState = {
            lastUpdate: 0,
            syncInProgress: false,
            pendingUpdates: [],
            watchers: new Set(),
            lockVersion: 0
        };
        
        this.init();
        console.log('[CategoryManager] ✅ Version 18.0 - Réécriture complète avec synchronisation parfaite');
    }

    async init() {
        try {
            // 1. Charger les paramètres en premier
            await this.loadSettings();
            
            // 2. Initialiser les catégories
            this.initializeCategories();
            
            // 3. Charger les catégories personnalisées
            this.loadCustomCategories();
            
            // 4. Initialiser la détection par mots-clés
            this.initializeWeightedDetection();
            
            // 5. Configurer la synchronisation
            this.setupSynchronization();
            
            // 6. Marquer comme initialisé
            this.isInitialized = true;
            
            console.log('[CategoryManager] 🎯 Initialisation complète terminée');
            
            // 7. Démarrer la surveillance
            this.startSyncWatcher();
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur d\'initialisation:', error);
            throw error;
        }
    }

    // ================================================
    // SYSTÈME DE SYNCHRONISATION ULTRA-ROBUSTE
    // ================================================
    async loadSettings() {
        console.log('[CategoryManager] 📚 Chargement des paramètres...');
        
        try {
            // Essayer localStorage d'abord
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = { ...this.getDefaultSettings(), ...JSON.parse(saved) };
                console.log('[CategoryManager] ✅ Paramètres chargés depuis localStorage');
            } else {
                this.settings = this.getDefaultSettings();
                console.log('[CategoryManager] 📝 Paramètres par défaut utilisés');
                
                // Sauvegarder immédiatement les paramètres par défaut
                await this.saveSettings();
            }
            
            this.syncState.lastUpdate = Date.now();
            return this.settings;
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
            return this.settings;
        }
    }

    async saveSettings(newSettings = null) {
        return new Promise((resolve) => {
            if (this.syncState.syncInProgress) {
                console.log('[CategoryManager] ⏳ Sauvegarde en attente...');
                this.syncState.pendingUpdates.push({ newSettings, resolve });
                return;
            }
            
            this.syncState.syncInProgress = true;
            this.syncState.lockVersion++;
            
            try {
                console.log('[CategoryManager] 💾 === SAUVEGARDE SÉCURISÉE ===');
                
                if (newSettings) {
                    this.settings = { ...this.settings, ...newSettings };
                }
                
                // Valider les paramètres avant sauvegarde
                this.validateSettings();
                
                // Sauvegarder dans localStorage
                localStorage.setItem('categorySettings', JSON.stringify(this.settings));
                
                // Mettre à jour l'état de synchronisation
                this.syncState.lastUpdate = Date.now();
                
                console.log('[CategoryManager] 💾 Paramètres sauvegardés:', this.settings);
                
                // Notifier TOUS les watchers
                this.notifyAllWatchers();
                
                // Dispatcher l'événement global
                setTimeout(() => {
                    this.dispatchEvent('categorySettingsChanged', {
                        settings: { ...this.settings },
                        timestamp: this.syncState.lastUpdate,
                        lockVersion: this.syncState.lockVersion,
                        source: 'CategoryManager'
                    });
                }, 10);
                
                resolve(this.settings);
                
            } catch (error) {
                console.error('[CategoryManager] ❌ Erreur sauvegarde:', error);
                resolve(null);
            } finally {
                this.syncState.syncInProgress = false;
                
                // Traiter les sauvegardes en attente
                this.processPendingUpdates();
            }
        });
    }

    validateSettings() {
        // Valider la structure des paramètres
        if (!this.settings.taskPreselectedCategories) {
            this.settings.taskPreselectedCategories = [];
        }
        
        if (!Array.isArray(this.settings.taskPreselectedCategories)) {
            this.settings.taskPreselectedCategories = [];
        }
        
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

    processPendingUpdates() {
        if (this.syncState.pendingUpdates.length > 0) {
            const pending = this.syncState.pendingUpdates.shift();
            console.log('[CategoryManager] 🔄 Traitement sauvegarde en attente...');
            
            setTimeout(() => {
                this.saveSettings(pending.newSettings).then(pending.resolve);
            }, 50);
        }
    }

    // ================================================
    // SURVEILLANCE CONTINUE
    // ================================================
    startSyncWatcher() {
        // Surveiller les changements toutes les 2 secondes
        setInterval(() => {
            this.checkExternalChanges();
        }, 2000);
        
        console.log('[CategoryManager] 👁️ Surveillance démarrée');
    }

    checkExternalChanges() {
        try {
            const stored = localStorage.getItem('categorySettings');
            if (!stored) return;
            
            const storedSettings = JSON.parse(stored);
            const storedTime = storedSettings._lastModified || 0;
            
            // Si les paramètres stockés sont plus récents que les nôtres
            if (storedTime > this.syncState.lastUpdate) {
                console.log('[CategoryManager] 🔄 Changements externes détectés, resynchronisation...');
                this.loadSettings();
                this.notifyAllWatchers();
            }
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur vérification changements:', error);
        }
    }

    // ================================================
    // SYSTÈME DE WATCHERS
    // ================================================
    addWatcher(callback) {
        this.syncState.watchers.add(callback);
        console.log(`[CategoryManager] 👁️ Watcher ajouté (total: ${this.syncState.watchers.size})`);
        
        // Appeler immédiatement le callback avec l'état actuel
        try {
            callback(this.settings);
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur callback watcher:', error);
        }
    }

    removeWatcher(callback) {
        this.syncState.watchers.delete(callback);
        console.log(`[CategoryManager] 👁️ Watcher supprimé (total: ${this.syncState.watchers.size})`);
    }

    notifyAllWatchers() {
        console.log(`[CategoryManager] 📢 Notification de ${this.syncState.watchers.size} watchers`);
        
        this.syncState.watchers.forEach(callback => {
            try {
                callback({ ...this.settings });
            } catch (error) {
                console.error('[CategoryManager] ❌ Erreur notification watcher:', error);
            }
        });
    }

    // ================================================
    // MÉTHODES PUBLIQUES SYNCHRONISÉES
    // ================================================
    getSettings() {
        // Toujours retourner une copie pour éviter les modifications directes
        return JSON.parse(JSON.stringify(this.settings));
    }

    async updateSettings(newSettings) {
        console.log('[CategoryManager] 🔄 Mise à jour des paramètres:', newSettings);
        
        // Ajouter un timestamp de modification
        const timestampedSettings = {
            ...newSettings,
            _lastModified: Date.now()
        };
        
        const result = await this.saveSettings(timestampedSettings);
        
        // Forcer la synchronisation de tous les modules
        setTimeout(() => {
            this.forceSyncAllModules();
        }, 100);
        
        return result;
    }

    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }

    async updateTaskPreselectedCategories(categories) {
        console.log('[CategoryManager] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const validCategories = Array.isArray(categories) ? categories : [];
        
        await this.updateSettings({
            taskPreselectedCategories: validCategories
        });
        
        return validCategories;
    }

    getScanSettings() {
        return { ...this.settings.scanSettings };
    }

    async updateScanSettings(scanSettings) {
        console.log('[CategoryManager] 🔍 Mise à jour paramètres de scan:', scanSettings);
        
        await this.updateSettings({
            scanSettings: { ...this.settings.scanSettings, ...scanSettings }
        });
    }

    async updateScanSetting(key, value) {
        console.log(`[CategoryManager] 🔍 Mise à jour paramètre de scan: ${key} = ${value}`);
        
        const newScanSettings = { ...this.settings.scanSettings };
        newScanSettings[key] = value;
        
        await this.updateScanSettings(newScanSettings);
    }

    getAutomationSettings() {
        return { ...this.settings.automationSettings };
    }

    async updateAutomationSettings(automationSettings) {
        console.log('[CategoryManager] 🤖 Mise à jour paramètres d\'automatisation:', automationSettings);
        
        await this.updateSettings({
            automationSettings: { ...this.settings.automationSettings, ...automationSettings }
        });
    }

    getPreferences() {
        return { ...this.settings.preferences };
    }

    async updatePreferences(preferences) {
        console.log('[CategoryManager] ⚙️ Mise à jour préférences:', preferences);
        
        await this.updateSettings({
            preferences: { ...this.settings.preferences, ...preferences }
        });
    }

    // ================================================
    // SYNCHRONISATION FORCÉE DE TOUS LES MODULES
    // ================================================
    forceSyncAllModules() {
        console.log('[CategoryManager] 🚀 === SYNCHRONISATION FORCÉE TOUS MODULES ===');
        
        const currentSettings = this.getSettings();
        const modules = this.getAllModules();
        
        modules.forEach(module => {
            try {
                this.syncModule(module, currentSettings);
            } catch (error) {
                console.error(`[CategoryManager] ❌ Erreur sync ${module.name}:`, error);
            }
        });
        
        // Dispatcher un événement global de synchronisation
        setTimeout(() => {
            this.dispatchEvent('categoryManagerFullSync', {
                settings: currentSettings,
                timestamp: Date.now(),
                modulesSynced: modules.length
            });
        }, 50);
        
        console.log('[CategoryManager] ✅ === SYNCHRONISATION FORCÉE TERMINÉE ===');
    }

    getAllModules() {
        return [
            {
                name: 'EmailScanner',
                instance: window.emailScanner,
                syncMethods: ['updateSettings', 'updateTaskPreselectedCategories', 'forceSettingsReload']
            },
            {
                name: 'CategoriesPage',
                instance: window.categoriesPage,
                syncMethods: ['forceSynchronization']
            },
            {
                name: 'MinimalScanModule',
                instance: window.minimalScanModule,
                syncMethods: ['updateSettings']
            },
            {
                name: 'PageManager',
                instance: window.pageManager,
                syncMethods: ['forceSynchronization']
            },
            {
                name: 'AITaskAnalyzer',
                instance: window.aiTaskAnalyzer,
                syncMethods: ['updatePreselectedCategories', 'updateAutomationSettings']
            }
        ].filter(module => module.instance); // Seulement les modules disponibles
    }

    syncModule(module, settings) {
        console.log(`[CategoryManager] 🔄 Synchronisation ${module.name}...`);
        
        module.syncMethods.forEach(methodName => {
            if (typeof module.instance[methodName] === 'function') {
                try {
                    // Appeler la méthode appropriée avec les bons paramètres
                    if (methodName === 'updateTaskPreselectedCategories' || methodName === 'updatePreselectedCategories') {
                        module.instance[methodName](settings.taskPreselectedCategories || []);
                    } else if (methodName === 'updateAutomationSettings') {
                        module.instance[methodName](settings.automationSettings || {});
                    } else if (methodName === 'updateSettings') {
                        module.instance[methodName](settings);
                    } else {
                        module.instance[methodName]();
                    }
                    
                    console.log(`[CategoryManager] ✅ ${module.name}.${methodName} exécuté`);
                } catch (error) {
                    console.error(`[CategoryManager] ❌ Erreur ${module.name}.${methodName}:`, error);
                }
            } else {
                console.log(`[CategoryManager] ⚠️ ${module.name}.${methodName} non disponible`);
            }
        });
    }

    // ================================================
    // CONFIGURATION DE LA SYNCHRONISATION
    // ================================================
    setupSynchronization() {
        if (this.eventListenersSetup) return;
        
        // Listener pour les changements externes
        this.settingsChangeHandler = (event) => {
            if (event.detail?.source === 'CategoryManager') return; // Éviter les boucles
            
            console.log('[CategoryManager] 📨 Changement externe reçu:', event.detail);
            
            // Recharger les paramètres si nécessaire
            if (event.detail?.settings) {
                const externalTimestamp = event.detail.timestamp || 0;
                if (externalTimestamp > this.syncState.lastUpdate) {
                    console.log('[CategoryManager] 🔄 Mise à jour depuis source externe');
                    this.settings = { ...this.settings, ...event.detail.settings };
                    this.syncState.lastUpdate = externalTimestamp;
                    this.notifyAllWatchers();
                }
            }
        };
        
        window.addEventListener('settingsChanged', this.settingsChangeHandler);
        window.addEventListener('forceSynchronization', () => {
            console.log('[CategoryManager] 🚀 Synchronisation forcée demandée');
            this.forceSyncAllModules();
        });
        
        this.eventListenersSetup = true;
        console.log('[CategoryManager] 🎧 Listeners de synchronisation configurés');
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
        
        console.log('[CategoryManager] 🏷️ Catégories initialisées:', Object.keys(this.categories));
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            // Intégrer les catégories personnalisées dans les catégories principales
            Object.entries(this.customCategories).forEach(([id, category]) => {
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30
                };
            });
            
            console.log('[CategoryManager] 🎨 Catégories personnalisées chargées:', Object.keys(this.customCategories));
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] 💾 Catégories personnalisées sauvegardées');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde catégories personnalisées:', error);
        }
    }

    // ================================================
    // SYSTÈME DE DÉTECTION PAR MOTS-CLÉS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'paramétrez vos choix', 'parametrez vos choix',
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
                weak: ['update', 'discover', 'new', 'choix'],
                exclusions: []
            },
            
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
        
        console.log('[CategoryManager] 🔍 Détection par mots-clés initialisée');
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
        
        if (this.debugMode) {
            console.log('[CategoryManager] Scores par catégorie:');
            sortedResults.forEach(r => {
                console.log(`  - ${r.category}: ${r.score}pts (priority: ${r.priority}, confidence: ${r.confidence})`);
            });
        }
        
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

    getCategories() {
        return { ...this.categories };
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

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return this.settings.activeCategories;
    }

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    // ================================================
    // MÉTHODES DE DÉTECTION
    // ================================================
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
        
        if (email.toRecipients && Array.isArray(email.toRecipients)) {
            email.toRecipients.forEach(recipient => {
                if (recipient.emailAddress?.address) {
                    allText += recipient.emailAddress.address + ' ';
                }
                if (recipient.emailAddress?.name) {
                    allText += recipient.emailAddress.name + ' ';
                }
            });
        }
        
        if (email.ccRecipients && Array.isArray(email.ccRecipients)) {
            email.ccRecipients.forEach(recipient => {
                if (recipient.emailAddress?.address) {
                    allText += recipient.emailAddress.address + ' ';
                }
                if (recipient.emailAddress?.name) {
                    allText += recipient.emailAddress.name + ' ';
                }
            });
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

    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        if (keywords.exclusions) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    if (categoryId === 'marketing_news') {
                        totalScore -= 20;
                    } else {
                        totalScore -= 100;
                    }
                }
            }
        }
        
        if (keywords.absolute) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 50 });
                    }
                }
            }
        }
        
        if (keywords.strong && matches.length < 5) {
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 30;
                    matches.push({ keyword, type: 'strong', score: 30 });
                }
            }
        }
        
        if (keywords.weak && !hasAbsolute) {
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 10;
                    matches.push({ keyword, type: 'weak', score: 10 });
                }
            }
        }
        
        this.applyDomainBonus(content, categoryId, matches, totalScore);
        
        return { total: Math.max(0, totalScore), hasAbsolute, matches };
    }

    applyDomainBonus(content, categoryId, matches, totalScore) {
        const domainBonuses = {
            security: ['microsoft', 'google', 'apple', 'security'],
            finance: ['gouv.fr', 'impots', 'bank', 'paypal'],
            marketing_news: ['newsletter', 'mailchimp', 'campaign', 'marketing'],
            notifications: ['noreply', 'notification', 'donotreply']
        };
        
        if (domainBonuses[categoryId]) {
            for (const domainKeyword of domainBonuses[categoryId]) {
                if (content.domain.includes(domainKeyword)) {
                    const bonus = categoryId === 'marketing_news' ? 30 : 50;
                    totalScore += bonus;
                    matches.push({ keyword: `${domainKeyword}_domain`, type: 'domain', score: bonus });
                    break;
                }
            }
        }
    }

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

    cleanHtml(html) {
        if (!html) return '';
        return html
            .replace(/<a[^>]*>(.*?)<\/a>/gi, ' $1 ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedText = text.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/'/g, '\'')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ');
        
        const normalizedKeyword = keyword.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/'/g, '\'')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ');
        
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
        
        if (email.categories && Array.isArray(email.categories)) {
            const hasSpamCategory = email.categories.some(cat => 
                cat.toLowerCase().includes('spam') ||
                cat.toLowerCase().includes('junk') ||
                cat.toLowerCase().includes('indésirable')
            );
            if (hasSpamCategory) return true;
        }
        
        return false;
    }

    isInCC(email) {
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients)) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) {
            return email.ccRecipients.length > 0;
        }
        
        return email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
    }

    getCurrentUserEmail() {
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName;
            }
        } catch (e) {
            console.warn('[CategoryManager] Impossible de récupérer l\'email utilisateur');
        }
        return null;
    }

    // ================================================
    // ÉVÉNEMENTS ET UTILITAIRES
    // ================================================
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[CategoryManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        if (this.settingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.settingsChangeHandler);
        }
        this.eventListenersSetup = false;
        this.syncState.watchers.clear();
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

console.log('✅ CategoryManager v18.0 loaded - Réécriture complète avec synchronisation parfaite');
