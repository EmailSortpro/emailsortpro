// EmailScanner.js - Version 5.1 - CENTRALISATEUR D'ACTIONS SCAN & CATÉGORISATION - CORRIGÉ

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.scanSettings = {};
        this.preselectedCategories = [];
        this.debugMode = false;
        
        // Initialiser dès le chargement
        this.initializeSettings();
        this.setupEventListeners();
        
        console.log('[EmailScanner] ✅ Version 5.1 - Centralisateur d\'actions scan & catégorisation - CORRIGÉ');
    }

    // ================================================
    // INITIALISATION ET SYNCHRONISATION AVEC LES PARAMÈTRES
    // ================================================
    initializeSettings() {
        try {
            // Charger les paramètres depuis CategoryManager
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                const settings = window.categoryManager.getSettings();
                this.scanSettings = settings.scanSettings || this.getDefaultScanSettings();
                this.preselectedCategories = settings.taskPreselectedCategories || [];
                console.log('[EmailScanner] Paramètres chargés depuis CategoryManager:', {
                    scanSettings: this.scanSettings,
                    preselectedCategories: this.preselectedCategories
                });
            } else {
                // Fallback: essayer localStorage
                try {
                    const saved = localStorage.getItem('categorySettings');
                    if (saved) {
                        const settings = JSON.parse(saved);
                        this.scanSettings = settings.scanSettings || this.getDefaultScanSettings();
                        this.preselectedCategories = settings.taskPreselectedCategories || [];
                        console.log('[EmailScanner] Paramètres chargés depuis localStorage');
                    } else {
                        this.scanSettings = this.getDefaultScanSettings();
                        this.preselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
                        console.log('[EmailScanner] Paramètres par défaut utilisés');
                    }
                } catch (error) {
                    console.warn('[EmailScanner] Erreur chargement localStorage:', error);
                    this.scanSettings = this.getDefaultScanSettings();
                    this.preselectedCategories = ['tasks', 'commercial', 'finance', 'meetings'];
                }
            }
        } catch (error) {
            console.error('[EmailScanner] Erreur initialisation paramètres:', error);
            this.scanSettings = this.getDefaultScanSettings();
            this.preselectedCategories = [];
        }
    }

    getDefaultScanSettings() {
        return {
            defaultPeriod: 7,
            defaultFolder: 'inbox',
            autoAnalyze: true,
            autoCategrize: true
        };
    }

    // ================================================
    // LISTENERS POUR SYNCHRONISATION AVEC PAGEMANAGER ET CATEGORIESPAGE
    // ================================================
    setupEventListeners() {
        // Écouter les changements de paramètres
        window.addEventListener('settingsChanged', (event) => {
            const { type, value } = event.detail;
            console.log(`[EmailScanner] Reçu changement de paramètres: ${type}`, value);
            
            switch (type) {
                case 'scanSettings':
                    this.updateScanSettings(value);
                    break;
                case 'taskPreselectedCategories':
                    this.updatePreselectedCategories(value);
                    break;
                case 'preferences':
                    this.updateUserPreferences(value);
                    break;
            }
        });

        // Écouter les demandes de scan depuis PageManager
        window.addEventListener('requestScan', (event) => {
            const { options } = event.detail;
            console.log('[EmailScanner] Demande de scan reçue:', options);
            this.handleScanRequest(options);
        });

        // Écouter les changements depuis CategoryManager
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[EmailScanner] Changements CategoryManager reçus:', event.detail);
            if (event.detail.settings) {
                this.syncWithCategoryManager(event.detail.settings);
            }
        });

        console.log('[EmailScanner] Event listeners configurés');
    }

    // ================================================
    // SYNCHRONISATION AVEC CATEGORYMANAGER
    // ================================================
    syncWithCategoryManager(settings) {
        try {
            console.log('[EmailScanner] 🔄 Synchronisation avec CategoryManager');
            
            if (settings.scanSettings) {
                this.scanSettings = { ...this.scanSettings, ...settings.scanSettings };
                console.log('[EmailScanner] Paramètres de scan mis à jour:', this.scanSettings);
            }
            
            if (settings.taskPreselectedCategories) {
                this.preselectedCategories = [...settings.taskPreselectedCategories];
                console.log('[EmailScanner] Catégories pré-sélectionnées mises à jour:', this.preselectedCategories);
            }
            
            this.notifyPreselectionChange();
        } catch (error) {
            console.error('[EmailScanner] Erreur synchronisation CategoryManager:', error);
        }
    }

    // ================================================
    // MÉTHODES DE MISE À JOUR DES PARAMÈTRES
    // ================================================
    updateScanSettings(settings) {
        this.scanSettings = { ...this.scanSettings, ...settings };
        console.log('[EmailScanner] Paramètres de scan mis à jour:', this.scanSettings);
    }

    updatePreselectedCategories(categories) {
        this.preselectedCategories = categories || [];
        console.log('[EmailScanner] Catégories pré-sélectionnées mises à jour:', this.preselectedCategories);
        
        // Notifier PageManager des nouvelles catégories pré-sélectionnées
        this.notifyPreselectionChange();
    }

    updateUserPreferences(preferences) {
        console.log('[EmailScanner] Préférences utilisateur mises à jour:', preferences);
        
        // Mettre à jour CategoryManager si nécessaire
        if (window.categoryManager && typeof window.categoryManager.updatePreferences === 'function') {
            window.categoryManager.updatePreferences(preferences);
        }
    }

    // ================================================
    // NOTIFICATION DES CHANGEMENTS VERS PAGEMANAGER
    // ================================================
    notifyPreselectionChange() {
        // Émettre un événement pour PageManager
        window.dispatchEvent(new CustomEvent('preselectedCategoriesChanged', {
            detail: { categories: this.preselectedCategories }
        }));
    }

    // ================================================
    // GESTION DES DEMANDES DE SCAN
    // ================================================
    async handleScanRequest(options = {}) {
        try {
            // Fusionner avec les paramètres par défaut
            const scanOptions = {
                days: options.days || this.scanSettings.defaultPeriod,
                folder: options.folder || this.scanSettings.defaultFolder,
                autoAnalyze: this.scanSettings.autoAnalyze,
                autoCategrize: this.scanSettings.autoCategrize,
                ...options
            };

            console.log('[EmailScanner] Démarrage du scan avec options fusionnées:', scanOptions);
            
            // Lancer le scan
            const results = await this.scan(scanOptions);
            
            // Notifier PageManager du succès
            window.dispatchEvent(new CustomEvent('scanCompleted', {
                detail: { results, preselectedCategories: this.preselectedCategories }
            }));
            
            return results;
            
        } catch (error) {
            console.error('[EmailScanner] Erreur lors du scan:', error);
            
            // Notifier PageManager de l'erreur
            window.dispatchEvent(new CustomEvent('scanError', {
                detail: { error: error.message }
            }));
            
            throw error;
        }
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE SCAN
    // ================================================
    async scan(options = {}) {
        const {
            days = this.scanSettings.defaultPeriod,
            folder = this.scanSettings.defaultFolder,
            onProgress = null,
            includeSpam = true,
            maxEmails = 1000
        } = options;

        if (this.isScanning) {
            console.warn('[EmailScanner] Scan already in progress');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = onProgress;

            console.log('[EmailScanner] 🚀 Starting scan with options:', {
                days,
                folder,
                maxEmails,
                includeSpam,
                preselectedCategories: this.preselectedCategories
            });

            // Étape 1: Vérifier les services requis
            if (!window.mailService) {
                throw new Error('MailService not available');
            }

            if (!window.categoryManager) {
                throw new Error('CategoryManager not available');
            }

            // Étape 2: Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            // Étape 3: Récupérer les emails
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: 'Récupération des emails depuis votre boîte...',
                    progress: { current: 0, total: 100 }
                });
            }

            console.log('[EmailScanner] 📧 Fetching emails from folder:', folder);

            const emails = await window.mailService.getEmailsFromFolder(folder, {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                top: maxEmails
            });

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ Fetched ${this.emails.length} emails from ${folder}`);

            if (this.emails.length === 0) {
                console.warn('[EmailScanner] No emails found in the specified period');
                return {
                    success: true,
                    total: 0,
                    categorized: 0,
                    breakdown: {},
                    stats: { processed: 0, errors: 0 },
                    emails: [],
                    preselectedCategories: this.preselectedCategories,
                    preselectedStats: this.getPreselectedStats()
                };
            }

            // Étape 4: Catégoriser les emails
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'categorizing',
                    message: 'Analyse et catégorisation intelligente des emails...',
                    progress: { current: 0, total: this.emails.length }
                });
            }

            await this.categorizeEmailsEnhanced();

            // Étape 5: Calculer les résultats avec marquage des catégories pré-sélectionnées
            const results = this.getDetailedResults();

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            this.logCategoryDistribution(results);
            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Scan error:', error);
            
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
    // RÉINITIALISATION COMPLÈTE
    // ================================================
    reset() {
        console.log('[EmailScanner] 🔄 Resetting scanner...');
        this.emails = [];
        this.categorizedEmails = {};
        
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        this.categorizedEmails.other = [];
        
        console.log('[EmailScanner] ✅ Reset complete, categories initialized:', 
            Object.keys(this.categorizedEmails));
    }

    // ================================================
    // CATÉGORISATION AVEC MARQUAGE DES CATÉGORIES PRÉ-SÉLECTIONNÉES
    // ================================================
    async categorizeEmailsEnhanced() {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        console.log('[EmailScanner] 🏷️ Starting enhanced categorization of', total, 'emails');
        console.log('[EmailScanner] Catégories pré-sélectionnées:', this.preselectedCategories);

        const categoryStats = {};
        const categories = window.categoryManager.getCategories();
        
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
        });
        categoryStats.other = 0;

        // Analyser chaque email
        for (let i = 0; i < this.emails.length; i++) {
            const email = this.emails[i];
            
            try {
                // Analyser avec CategoryManager
                const analysis = window.categoryManager.analyzeEmail(email);
                
                // Enrichir l'email avec les données de catégorisation
                email.category = analysis.category || 'other';
                email.categoryScore = analysis.score || 0;
                email.categoryConfidence = analysis.confidence || 0;
                email.matchedPatterns = analysis.matchedPatterns || [];
                email.hasAbsolute = analysis.hasAbsolute || false;
                
                // NOUVEAU : Marquer si la catégorie est pré-sélectionnée
                email.isPreselected = this.preselectedCategories.includes(email.category);
                
                // Ajouter à la catégorie appropriée
                const categoryId = email.category;
                if (this.categorizedEmails[categoryId]) {
                    this.categorizedEmails[categoryId].push(email);
                    categoryStats[categoryId]++;
                } else {
                    this.categorizedEmails.other.push(email);
                    categoryStats.other++;
                    console.warn(`[EmailScanner] Unknown category ${categoryId}, using 'other'`);
                }

                // Log spécial pour les emails pré-sélectionnés
                if (email.isPreselected && this.debugMode) {
                    console.log(`[EmailScanner] 🎯 Email pré-sélectionné (${categoryId}):`, {
                        subject: email.subject?.substring(0, 50),
                        score: email.categoryScore,
                        confidence: email.categoryConfidence
                    });
                }

            } catch (error) {
                console.error('[EmailScanner] ❌ Error categorizing email:', error);
                email.category = 'other';
                email.categoryError = error.message;
                email.isPreselected = false;
                this.categorizedEmails.other.push(email);
                categoryStats.other++;
                errors++;
            }

            processed++;
            if (this.scanProgress && (processed % 10 === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }
        }

        console.log('[EmailScanner] ✅ Categorization complete');
        console.log('[EmailScanner] 📊 Category distribution:', categoryStats);
        console.log('[EmailScanner] 🎯 Emails pré-sélectionnés:', 
            this.emails.filter(e => e.isPreselected).length);
        console.log('[EmailScanner] ⚠️ Errors during categorization:', errors);
        
        this.logTopPatterns();
    }

    // ================================================
    // MÉTHODES POUR PAGEMANAGER - GESTION DES EMAILS PRÉ-SÉLECTIONNÉS
    // ================================================
    
    /**
     * Retourne tous les emails des catégories pré-sélectionnées
     */
    getPreselectedEmails() {
        return this.emails.filter(email => email.isPreselected);
    }

    /**
     * Retourne les emails par catégorie avec marquage pré-sélection
     */
    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.emails;
        }
        
        const emails = this.emails.filter(email => email.category === categoryId);
        return emails.map(email => ({
            ...email,
            isPreselected: this.preselectedCategories.includes(email.category)
        }));
    }

    /**
     * Retourne les statistiques des catégories pré-sélectionnées
     */
    getPreselectedStats() {
        const preselectedEmails = this.getPreselectedEmails();
        const stats = {
            total: preselectedEmails.length,
            byCategory: {}
        };

        this.preselectedCategories.forEach(catId => {
            const categoryEmails = preselectedEmails.filter(e => e.category === catId);
            stats.byCategory[catId] = {
                count: categoryEmails.length,
                avgScore: categoryEmails.length > 0 ? 
                    Math.round(categoryEmails.reduce((sum, e) => sum + (e.categoryScore || 0), 0) / categoryEmails.length) : 0,
                avgConfidence: categoryEmails.length > 0 ?
                    Math.round(categoryEmails.reduce((sum, e) => sum + (e.categoryConfidence || 0), 0) / categoryEmails.length * 100) / 100 : 0
            };
        });

        return stats;
    }

    /**
     * Marque/démarque manuellement un email comme pré-sélectionné (pour PageManager)
     */
    toggleEmailPreselection(emailId, isPreselected) {
        const email = this.emails.find(e => e.id === emailId);
        if (email) {
            email.isPreselected = isPreselected;
            console.log(`[EmailScanner] Email ${emailId} ${isPreselected ? 'marqué' : 'démarqué'} comme pré-sélectionné`);
        }
    }

    // ================================================
    // RÉSULTATS DÉTAILLÉS AVEC INFORMATIONS PRÉ-SÉLECTION
    // ================================================
    getDetailedResults() {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithAbsolute = 0;
        let totalPreselected = 0;

        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            const preselectedCount = emails.filter(e => e.isPreselected).length;
            
            breakdown[catId] = {
                total: emails.length,
                preselected: preselectedCount,
                isPreselectedCategory: this.preselectedCategories.includes(catId)
            };
            
            if (catId !== 'other') {
                totalCategorized += emails.length;
                totalPreselected += preselectedCount;
                
                emails.forEach(email => {
                    if (email.categoryConfidence >= 0.8) {
                        totalWithHighConfidence++;
                    }
                    if (email.hasAbsolute) {
                        totalWithAbsolute++;
                    }
                });
            }
        });

        const avgConfidence = this.calculateAverageConfidence();
        const avgScore = this.calculateAverageScore();
        const preselectedStats = this.getPreselectedStats();

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            preselected: totalPreselected,
            breakdown,
            preselectedCategories: this.preselectedCategories,
            preselectedStats,
            stats: {
                processed: this.emails.length,
                errors: this.emails.filter(e => e.categoryError).length,
                highConfidence: totalWithHighConfidence,
                absoluteMatches: totalWithAbsolute,
                averageConfidence: avgConfidence,
                averageScore: avgScore,
                categoriesUsed: Object.keys(breakdown).filter(cat => breakdown[cat].total > 0).length,
                preselectedEmailsCount: totalPreselected
            },
            emails: this.emails
        };
    }

    // ================================================
    // MÉTHODES POUR LA GESTION DES ACTIONS EN BATCH (POUR PAGEMANAGER)
    // ================================================
    
    /**
     * Créer des tâches pour tous les emails pré-sélectionnés
     */
    async createTasksForPreselectedEmails() {
        const preselectedEmails = this.getPreselectedEmails();
        
        if (preselectedEmails.length === 0) {
            console.warn('[EmailScanner] Aucun email pré-sélectionné pour création de tâches');
            return { created: 0, errors: 0 };
        }

        console.log(`[EmailScanner] Création de tâches pour ${preselectedEmails.length} emails pré-sélectionnés`);

        let created = 0;
        let errors = 0;

        for (const email of preselectedEmails) {
            try {
                // Utiliser AITaskAnalyzer si disponible
                if (window.aiTaskAnalyzer && typeof window.aiTaskAnalyzer.analyzeEmailForTasks === 'function') {
                    const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                    
                    if (analysis && window.taskManager) {
                        const taskData = this.buildTaskDataFromAnalysis(email, analysis);
                        const task = window.taskManager.createTaskFromEmail(taskData, email);
                        created++;
                        
                        console.log(`[EmailScanner] Tâche créée pour email: ${email.subject?.substring(0, 50)}`);
                    }
                } else {
                    console.warn('[EmailScanner] AITaskAnalyzer non disponible pour', email.id);
                    errors++;
                }
            } catch (error) {
                console.error('[EmailScanner] Erreur création tâche pour email:', email.id, error);
                errors++;
            }
        }

        console.log(`[EmailScanner] Création de tâches terminée: ${created} créées, ${errors} erreurs`);
        
        return { created, errors };
    }

    /**
     * Construire les données de tâche à partir de l'analyse
     */
    buildTaskDataFromAnalysis(email, analysis) {
        const senderName = email.from?.emailAddress?.name || 'Inconnu';
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderDomain = senderEmail.split('@')[1] || 'unknown';
        
        return {
            id: this.generateTaskId(),
            title: analysis.mainTask?.title || `Email de ${senderName}`,
            description: analysis.mainTask?.description || analysis.summary || '',
            priority: analysis.mainTask?.priority || 'medium',
            dueDate: analysis.mainTask?.dueDate || null,
            status: 'todo',
            emailId: email.id,
            category: email.category || 'other',
            createdAt: new Date().toISOString(),
            aiGenerated: true,
            emailFrom: senderEmail,
            emailFromName: senderName,
            emailSubject: email.subject,
            emailDomain: senderDomain,
            emailDate: email.receivedDateTime,
            hasAttachments: email.hasAttachments || false,
            aiAnalysis: analysis,
            tags: [senderDomain, analysis.importance, ...(analysis.tags || [])].filter(Boolean),
            method: 'ai',
            isFromPreselectedCategory: true
        };
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // ================================================
    // MÉTHODES D'ACCÈS
    // ================================================
    getAllEmails() {
        return this.emails;
    }

    getCategorizedEmails() {
        return this.categorizedEmails;
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    logTopPatterns() {
        const patternFrequency = {};
        
        this.emails.forEach(email => {
            if (email.matchedPatterns && email.matchedPatterns.length > 0) {
                email.matchedPatterns.forEach(pattern => {
                    const key = `${pattern.type}:${pattern.keyword}`;
                    patternFrequency[key] = (patternFrequency[key] || 0) + 1;
                });
            }
        });
        
        const topPatterns = Object.entries(patternFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        if (topPatterns.length > 0) {
            console.log('[EmailScanner] 🔍 Top 10 patterns détectés:');
            topPatterns.forEach(([pattern, count]) => {
                console.log(`  - ${pattern}: ${count} fois`);
            });
        }
    }

    calculateAverageConfidence() {
        if (this.emails.length === 0) return 0;
        
        const totalConfidence = this.emails.reduce((sum, email) => {
            return sum + (email.categoryConfidence || 0);
        }, 0);
        
        return Math.round((totalConfidence / this.emails.length) * 100) / 100;
    }

    calculateAverageScore() {
        if (this.emails.length === 0) return 0;
        
        const totalScore = this.emails.reduce((sum, email) => {
            return sum + (email.categoryScore || 0);
        }, 0);
        
        return Math.round(totalScore / this.emails.length);
    }

    logCategoryDistribution(results) {
        console.log('[EmailScanner] 📊 === RÉSULTATS FINAUX ===');
        console.log(`[EmailScanner] Total emails: ${results.total}`);
        console.log(`[EmailScanner] Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
        console.log(`[EmailScanner] Pré-sélectionnés: ${results.preselected} (${Math.round((results.preselected / results.total) * 100)}%)`);
        console.log(`[EmailScanner] Haute confiance: ${results.stats.highConfidence}`);
        console.log(`[EmailScanner] Matches absolus: ${results.stats.absoluteMatches}`);
        console.log(`[EmailScanner] Confiance moyenne: ${results.stats.averageConfidence}`);
        console.log(`[EmailScanner] Score moyen: ${results.stats.averageScore}`);
        console.log('[EmailScanner] Distribution par catégorie:');
        
        const categories = window.categoryManager?.getCategories() || {};
        const categoryOrder = Object.keys(categories).sort((a, b) => {
            return (categories[b].priority || 50) - (categories[a].priority || 50);
        });
        
        categoryOrder.push('other');
        
        categoryOrder.forEach(cat => {
            const breakdown = results.breakdown[cat];
            if (breakdown && breakdown.total > 0) {
                const percentage = Math.round((breakdown.total / results.total) * 100);
                const categoryInfo = categories[cat] || { name: 'Autre', icon: '📌' };
                const preselectedMark = breakdown.isPreselectedCategory ? ' 🎯' : '';
                const preselectedCount = breakdown.preselected > 0 ? ` (${breakdown.preselected} pré-sélectionnés)` : '';
                
                console.log(`[EmailScanner]   ${categoryInfo.icon} ${categoryInfo.name}${preselectedMark}: ${breakdown.total} emails (${percentage}%)${preselectedCount}`);
            }
        });
        
        console.log('[EmailScanner] ========================');
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    getDebugInfo() {
        const preselectedStats = this.getPreselectedStats();
        
        return {
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: Object.values(this.categorizedEmails)
                .reduce((sum, emails) => sum + emails.length, 0),
            categories: Object.keys(this.categorizedEmails)
                .filter(cat => this.categorizedEmails[cat].length > 0),
            avgConfidence: this.calculateAverageConfidence(),
            avgScore: this.calculateAverageScore(),
            preselectedCategories: this.preselectedCategories,
            preselectedEmailsCount: this.getPreselectedEmails().length,
            preselectedStats,
            scanSettings: this.scanSettings
        };
    }

    enableDebugMode() {
        this.debugMode = true;
        console.log('[EmailScanner] 🐛 Debug mode enabled');
    }

    disableDebugMode() {
        this.debugMode = false;
        console.log('[EmailScanner] Debug mode disabled');
    }

    // ================================================
    // MÉTHODES PUBLIQUES POUR PAGEMANAGER
    // ================================================
    
    /**
     * Méthode appelée par PageManager pour mettre à jour les catégories pré-sélectionnées
     */
    updatePreselectedCategoriesFromPageManager(categories) {
        console.log('[EmailScanner] Mise à jour des catégories pré-sélectionnées depuis PageManager:', categories);
        this.updatePreselectedCategories(categories);
        
        // Re-marquer tous les emails existants
        if (this.emails.length > 0) {
            this.emails.forEach(email => {
                email.isPreselected = this.preselectedCategories.includes(email.category);
            });
            
            console.log(`[EmailScanner] ${this.getPreselectedEmails().length} emails marqués comme pré-sélectionnés`);
        }
    }

    /**
     * Obtenir les paramètres de scan actuels
     */
    getCurrentScanSettings() {
        return { ...this.scanSettings };
    }

    /**
     * Obtenir les catégories pré-sélectionnées actuelles
     */
    getCurrentPreselectedCategories() {
        return [...this.preselectedCategories];
    }

    /**
     * Forcer la synchronisation avec CategoryManager
     */
    forceSettingsReload() {
        console.log('[EmailScanner] 🔄 Force reload des paramètres');
        this.initializeSettings();
    }
}

// Créer l'instance globale
window.emailScanner = new EmailScanner();

// Méthodes de test global
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v5.1');
    
    const debugInfo = window.emailScanner.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    
    const testEmail = {
        subject: "Newsletter hebdomadaire - Désabonnez-vous ici",
        from: { emailAddress: { address: "newsletter@example.com", name: "Example News" } },
        bodyPreview: "Voici votre newsletter avec un lien pour vous désinscrire",
        receivedDateTime: new Date().toISOString()
    };
    
    if (window.categoryManager) {
        const result = window.categoryManager.analyzeEmail(testEmail);
        console.log('Test Result:', result);
    }
    
    console.groupEnd();
    return debugInfo;
};

console.log('✅ EmailScanner v5.1 loaded - Centralisateur d\'actions scan & catégorisation - CORRIGÉ');
