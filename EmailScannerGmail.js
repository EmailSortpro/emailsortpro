// EmailScannerGmail.js - Scanner spécifique Gmail simplifié
// Version 1.0 - Adapté de l'architecture simplifiée

class EmailScannerGmail {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.provider = 'gmail';
        this.isScanning = false;
        this.scanProgress = null;
        this.settings = {};
        this.taskPreselectedCategories = [];
        
        // Métriques de scan
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };
        
        // Configuration spécifique Gmail
        this.gmailConfig = {
            maxEmails: 500, // Limite Gmail API
            batchSize: 50,
            defaultFolder: 'inbox'
        };
        
        this.initialize();
        console.log('[EmailScannerGmail] ✅ Scanner Gmail initialisé (simplifié)');
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        // Charger les paramètres depuis CategoryManager
        await this.loadSettings();
        
        // S'enregistrer pour les changements
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            this.changeListener = window.categoryManager.addChangeListener((type, value) => {
                console.log(`[EmailScannerGmail] 📨 Changement reçu: ${type}`, value);
                this.handleSettingsChange(type, value);
            });
        }
        
        console.log('[EmailScannerGmail] 🔗 Initialisation complète');
    }

    async loadSettings() {
        try {
            if (window.categoryManager) {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                console.log('[EmailScannerGmail] ✅ Paramètres chargés:', {
                    taskPreselectedCategories: this.taskPreselectedCategories
                });
            }
        } catch (error) {
            console.error('[EmailScannerGmail] ❌ Erreur chargement paramètres:', error);
            this.settings = {};
            this.taskPreselectedCategories = [];
        }
    }

    handleSettingsChange(type, value) {
        switch (type) {
            case 'taskPreselectedCategories':
                this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
                console.log('[EmailScannerGmail] 📋 Catégories pré-sélectionnées mises à jour:', this.taskPreselectedCategories);
                break;
            case 'activeCategories':
            case 'categoryExclusions':
            case 'preferences':
                this.settings[type] = value;
                break;
        }
    }

    // ================================================
    // MÉTHODE PRINCIPALE : SCAN SIMPLIFIÉ
    // ================================================
    async scan(options = {}) {
        if (this.isScanning) {
            console.warn('[EmailScannerGmail] Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = options.onProgress;
            this.scanMetrics.startTime = Date.now();

            console.log('[EmailScannerGmail] 🚀 Démarrage scan Gmail simplifié');
            console.log('[EmailScannerGmail] 📊 Options:', options);
            console.log('[EmailScannerGmail] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

            // Validation des services
            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            if (!window.categoryManager) {
                throw new Error('CategoryManager non disponible');
            }

            // Paramètres de scan adaptés Gmail
            const scanOptions = {
                days: options.days || 7,
                folder: options.folder || 'inbox',
                maxEmails: Math.min(options.maxEmails || this.gmailConfig.maxEmails, this.gmailConfig.maxEmails),
                includeSpam: options.includeSpam || false
            };

            // Calcul des dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - scanOptions.days);

            // Progression
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'fetching',
                    message: `Récupération des emails Gmail (${scanOptions.days} jours)...`,
                    progress: { current: 0, total: 100 }
                });
            }

            // Récupération des emails via MailService
            console.log('[EmailScannerGmail] 📧 Récupération emails Gmail...');
            const emails = await window.mailService.getEmailsFromFolder(scanOptions.folder, {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                top: scanOptions.maxEmails
            });

            this.emails = emails || [];
            console.log(`[EmailScannerGmail] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                return this.getDetailedResults();
            }

            // Catégorisation
            if (options.autoCategrize !== false) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: 'Catégorisation des emails...',
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmails();
            }

            const results = this.getDetailedResults();

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan Gmail terminé !',
                    results
                });
            }

            console.log('[EmailScannerGmail] ✅ Scan terminé:', {
                total: results.total,
                categorized: results.categorized,
                preselectedForTasks: results.stats.preselectedForTasks
            });

            return results;

        } catch (error) {
            console.error('[EmailScannerGmail] ❌ Erreur scan:', error);
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'error',
                    message: `Erreur: ${error.message}`,
                    error
                });
            }
            
            throw error;
        } finally {
            this.isScanning = false;
        }
    }

    // ================================================
    // CATÉGORISATION SIMPLIFIÉE
    // ================================================
    async categorizeEmails() {
        const total = this.emails.length;
        let processed = 0;

        console.log('[EmailScannerGmail] 🏷️ Début catégorisation simplifiée');
        console.log('[EmailScannerGmail] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

        // Traiter par batches
        for (let i = 0; i < this.emails.length; i += this.gmailConfig.batchSize) {
            const batch = this.emails.slice(i, i + this.gmailConfig.batchSize);

            for (const email of batch) {
                try {
                    // Analyse par CategoryManager
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    
                    // Marquer si pré-sélectionné pour tâches
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);

                    // Ajouter à la catégorie appropriée
                    if (!this.categorizedEmails[email.category]) {
                        this.categorizedEmails[email.category] = [];
                    }
                    this.categorizedEmails[email.category].push(email);

                    // Mise à jour des métriques
                    if (!this.scanMetrics.categoryDistribution[email.category]) {
                        this.scanMetrics.categoryDistribution[email.category] = 0;
                    }
                    this.scanMetrics.categoryDistribution[email.category]++;

                } catch (error) {
                    console.error('[EmailScannerGmail] Erreur catégorisation:', error);
                    email.category = 'other';
                    email.categoryError = error.message;
                }

                processed++;
            }

            // Mise à jour progression
            if (this.scanProgress && processed % 10 === 0) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            // Pause entre batches
            if (i < this.emails.length - this.gmailConfig.batchSize) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        this.scanMetrics.categorizedCount = processed;
        console.log('[EmailScannerGmail] ✅ Catégorisation terminée');
    }

    // ================================================
    // GESTION DES CLICS - SIMPLIFIÉE POUR GMAIL
    // ================================================
    handleEmailClick(event, emailId) {
        // Empêcher la propagation pour checkbox et actions
        if (event.target.type === 'checkbox' || 
            event.target.closest('.task-actions-harmonized')) {
            return;
        }

        // Simple clic = ouvrir modal (pas de double-clic pour Gmail)
        console.log('[EmailScannerGmail] 📧 Clic email, ouverture modal:', emailId);
        window.pageManager?.showEmailModal(emailId);
    }

    // ================================================
    // RÉSULTATS ET MÉTRIQUES
    // ================================================
    getDetailedResults() {
        const breakdown = {};
        let totalCategorized = 0;
        let totalPreselected = 0;

        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId !== 'other' && catId !== 'spam' && catId !== 'excluded') {
                totalCategorized += emails.length;
            }

            emails.forEach(email => {
                if (email.isPreselectedForTasks) {
                    totalPreselected++;
                }
            });
        });

        const scanDuration = this.scanMetrics.startTime ? 
            Math.round((Date.now() - this.scanMetrics.startTime) / 1000) : 0;

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: {
                processed: this.emails.length,
                errors: this.emails.filter(e => e.categoryError).length,
                preselectedForTasks: totalPreselected,
                categoriesUsed: Object.keys(breakdown).length,
                scanDuration: scanDuration
            },
            emails: this.emails,
            scanMetrics: this.scanMetrics,
            provider: 'gmail'
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    reset() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {}
        };

        // Initialiser toutes les catégories
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
            
            // Ajouter les catégories spéciales
            ['other', 'excluded', 'spam'].forEach(catId => {
                if (!this.categorizedEmails[catId]) {
                    this.categorizedEmails[catId] = [];
                }
            });
        }
    }

    getAllEmails() {
        return [...this.emails];
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return [...this.emails];
        }
        return this.emails.filter(email => email.category === categoryId);
    }

    getPreselectedEmails() {
        return this.emails.filter(email => email.isPreselectedForTasks);
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScannerGmail] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
    }

    getTaskPreselectedCategories() {
        return [...this.taskPreselectedCategories];
    }

    // ================================================
    // RECATÉGORISATION
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScannerGmail] Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScannerGmail] 🔄 Recatégorisation...');
        
        // Réinitialiser les catégories
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        // Recatégoriser
        await this.categorizeEmails();

        // Notifier les changements
        this.dispatchEvent('emailsRecategorized', {
            emails: this.emails,
            breakdown: this.getDetailedResults().breakdown,
            taskPreselectedCategories: this.taskPreselectedCategories,
            preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
        });
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'EmailScannerGmail',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`[EmailScannerGmail] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // CONFIGURATION SPÉCIFIQUE GMAIL
    // ================================================
    setScanLimits(limits) {
        if (limits) {
            this.gmailConfig = { ...this.gmailConfig, ...limits };
            console.log('[EmailScannerGmail] 🚀 Limites de scan mises à jour:', this.gmailConfig);
        }
    }

    getDebugInfo() {
        return {
            provider: 'gmail',
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: Object.values(this.categorizedEmails).reduce((sum, emails) => sum + emails.length, 0),
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: this.emails.filter(e => e.isPreselectedForTasks).length,
            settings: this.settings,
            gmailConfig: this.gmailConfig,
            scanMetrics: this.scanMetrics
        };
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        if (this.changeListener && typeof this.changeListener === 'function') {
            this.changeListener();
            this.changeListener = null;
        }
        
        this.emails = [];
        this.categorizedEmails = {};
        this.taskPreselectedCategories = [];
        this.scanProgress = null;
        
        console.log('[EmailScannerGmail] 🧹 Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        console.log('[EmailScannerGmail] Instance détruite');
    }
}

// Créer l'instance globale si elle n'existe pas
if (!window.emailScannerGmail) {
    window.emailScannerGmail = new EmailScannerGmail();
    window.EmailScannerGmail = EmailScannerGmail;
    console.log('✅ EmailScannerGmail loaded - Scanner simplifié pour Gmail');
}
