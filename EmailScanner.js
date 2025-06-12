// EmailScanner.js - Version 5.1 - Simplifié et corrigé

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.scanSettings = {};
        this.preselectedCategories = [];
        this.debugMode = false;
        
        this.initializeSettings();
        this.setupEventListeners();
        
        console.log('[EmailScanner] ✅ Version 5.1 - Centralisateur d\'actions scan & catégorisation - CORRIGÉ');
    }

    // ================================================
    // INITIALISATION
    // ================================================
    initializeSettings() {
        try {
            if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
                const settings = window.categoryManager.getSettings();
                this.scanSettings = settings.scanSettings || this.getDefaultScanSettings();
                this.preselectedCategories = settings.taskPreselectedCategories || [];
                console.log('[EmailScanner] Paramètres chargés depuis CategoryManager');
            } else {
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
    // LISTENERS
    // ================================================
    setupEventListeners() {
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

        window.addEventListener('requestScan', (event) => {
            const { options } = event.detail;
            console.log('[EmailScanner] Demande de scan reçue:', options);
            this.handleScanRequest(options);
        });

        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[EmailScanner] Changements CategoryManager reçus:', event.detail);
            if (event.detail.settings) {
                this.syncWithCategoryManager(event.detail.settings);
            }
        });

        console.log('[EmailScanner] Event listeners configurés');
    }

    // ================================================
    // SYNCHRONISATION
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
    // MÉTHODES DE MISE À JOUR
    // ================================================
    updateScanSettings(settings) {
        this.scanSettings = { ...this.scanSettings, ...settings };
        console.log('[EmailScanner] Paramètres de scan mis à jour:', this.scanSettings);
    }

    updatePreselectedCategories(categories) {
        this.preselectedCategories = categories || [];
        console.log('[EmailScanner] Catégories pré-sélectionnées mises à jour:', this.preselectedCategories);
        this.notifyPreselectionChange();
    }

    updateUserPreferences(preferences) {
        console.log('[EmailScanner] Préférences utilisateur mises à jour:', preferences);
        
        if (window.categoryManager && typeof window.categoryManager.updatePreferences === 'function') {
            window.categoryManager.updatePreferences(preferences);
        }
    }

    // ================================================
    // NOTIFICATION
    // ================================================
    notifyPreselectionChange() {
        window.dispatchEvent(new CustomEvent('preselectedCategoriesChanged', {
            detail: { categories: this.preselectedCategories }
        }));
    }

    // ================================================
    // GESTION DES DEMANDES DE SCAN
    // ================================================
    async handleScanRequest(options = {}) {
        try {
            const scanOptions = {
                days: options.days || this.scanSettings.defaultPeriod,
                folder: options.folder || this.scanSettings.defaultFolder,
                autoAnalyze: this.scanSettings.autoAnalyze,
                autoCategrize: this.scanSettings.autoCategrize,
                ...options
            };

            console.log('[EmailScanner] Démarrage du scan avec options fusionnées:', scanOptions);
            
            const results = await this.scan(scanOptions);
            
            window.dispatchEvent(new CustomEvent('scanCompleted', {
                detail: { results, preselectedCategories: this.preselectedCategories }
            }));
            
            return results;
            
        } catch (error) {
            console.error('[EmailScanner] Erreur lors du scan:', error);
            
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

            // Vérifications
            if (!window.mailService) {
                throw new Error('MailService not available');
            }

            if (!window.categoryManager) {
                throw new Error('CategoryManager not available');
            }

            // Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            // Récupérer les emails
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
                console.warn('[EmailScanner] No emails found');
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

            // Catégoriser les emails
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'categorizing',
                    message: 'Analyse et catégorisation intelligente des emails...',
                    progress: { current: 0, total: this.emails.length }
                });
            }

            await this.categorizeEmailsEnhanced();

            // Calculer les résultats
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
    // RÉINITIALISATION
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
    // CATÉGORISATION
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
                
                // Enrichir l'email
                email.category = analysis.category || 'other';
                email.categoryScore = analysis.score || 0;
                email.categoryConfidence = analysis.confidence || 0;
                email.matchedPatterns = analysis.matchedPatterns || [];
                email.hasAbsolute = analysis.hasAbsolute || false;
                
                // Marquer si pré-sélectionné
                email.isPreselected = this.preselectedCategories.includes(email.category);
                
                // Ajouter à la catégorie
                const categoryId = email.category;
                if (this.categorizedEmails[categoryId]) {
                    this.categorizedEmails[categoryId].push(email);
                    categoryStats[categoryId]++;
                } else {
                    this.categorizedEmails.other.push(email);
                    categoryStats.other++;
                    console.warn(`[EmailScanner] Unknown category ${categoryId}, using 'other'`);
                }

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
    }

    // ================================================
    // MÉTHODES POUR PAGEMANAGER
    // ================================================
    getPreselectedEmails() {
        return this.emails.filter(email => email.isPreselected);
    }

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

    toggleEmailPreselection(emailId, isPreselected) {
        const email = this.emails.find(e => e.id === emailId);
        if (email) {
            email.isPreselected = isPreselected;
            console.log(`[EmailScanner] Email ${emailId} ${isPreselected ? 'marqué' : 'démarqué'} comme pré-sélectionné`);
        }
    }

    // ================================================
    // RÉSULTATS DÉTAILLÉS
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
    // MÉTHODES PUBLIQUES
    // ================================================
    updatePreselectedCategoriesFromPageManager(categories) {
        console.log('[EmailScanner] Mise à jour des catégories pré-sélectionnées depuis PageManager:', categories);
        this.updatePreselectedCategories(categories);
        
        if (this.emails.length > 0) {
            this.emails.forEach(email => {
                email.isPreselected = this.preselectedCategories.includes(email.category);
            });
            
            console.log(`[EmailScanner] ${this.getPreselectedEmails().length} emails marqués comme pré-sélectionnés`);
        }
    }

    getCurrentScanSettings() {
        return { ...this.scanSettings };
    }

    getCurrentPreselectedCategories() {
        return [...this.preselectedCategories];
    }

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
