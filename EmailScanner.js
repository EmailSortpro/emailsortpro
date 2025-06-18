// EmailScanner.js - Version 4.0 - CORRECTION TOTALE QUOTA + CATÉGORISATION 🚀

console.log('[EmailScanner] 🚀 Loading EmailScanner.js v4.0 - TOTAL FIX...');

// Nettoyer instance existante
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage instance existante...');
    try {
        if (typeof window.emailScanner.destroy === 'function') {
            window.emailScanner.destroy();
        }
        delete window.emailScanner;
    } catch (error) {
        console.warn('[EmailScanner] Erreur nettoyage:', error);
    }
}

class EmailScanner {
    constructor() {
        this.emails = [];
        this.isScanning = false;
        this.scanProgress = 0;
        this.categorizedEmails = new Map();
        this.duplicatesFound = 0;
        this.conversationGroups = new Map();
        this.lastScanTimestamp = null;
        this.scanOptions = {
            days: 30,
            folder: 'inbox',
            autoAnalyze: true,
            autoCategrize: true,
            excludeSpam: true
        };
        
        this.init();
    }

    init() {
        console.log('[EmailScanner] ✅ Module initialisé v4.0');
        this.loadFromStorage();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Écouter les changements de paramètres
        window.addEventListener('categorySettingsChanged', (event) => {
            console.log('[EmailScanner] Paramètres de catégories changés');
            if (this.emails.length > 0 && event.detail?.type === 'taskPreselectedCategories') {
                this.recategorizeEmails();
            }
        });
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE SCAN
    // ================================================
    async scan(options = {}) {
        return this.startScan(options);
    }

    async startScan(options = {}) {
        if (this.isScanning) {
            console.warn('[EmailScanner] Scan déjà en cours');
            return null;
        }

        console.log('[EmailScanner] 🔍 Démarrage du scan avec options:', options);
        
        this.isScanning = true;
        this.scanProgress = 0;
        this.scanOptions = { ...this.scanOptions, ...options };
        
        try {
            // Vérifier l'authentification
            const isAuthenticated = await this.checkAuthentication();
            if (!isAuthenticated) {
                throw new Error('Non authentifié');
            }

            // Afficher le loading
            if (window.uiManager) {
                window.uiManager.showLoading('Scan des emails en cours...');
            }

            // Notifier le début du scan
            if (options.onProgress) {
                options.onProgress({
                    progress: { current: 10 },
                    message: 'Connexion à votre boîte mail...',
                    phase: 'Connexion'
                });
            }

            // Récupérer les emails
            const emails = await this.fetchEmails();
            console.log(`[EmailScanner] 📧 ${emails.length} emails récupérés`);

            if (options.onProgress) {
                options.onProgress({
                    progress: { current: 50 },
                    message: `${emails.length} emails trouvés, analyse en cours...`,
                    phase: 'Analyse'
                });
            }

            // Catégoriser les emails - CORRECTION PRINCIPALE
            if (this.scanOptions.autoCategrize) {
                await this.categorizeEmailsFixed(emails);
            }

            if (options.onProgress) {
                options.onProgress({
                    progress: { current: 90 },
                    message: 'Finalisation des résultats...',
                    phase: 'Finalisation'
                });
            }

            // Stocker les emails
            this.emails = emails;
            this.lastScanTimestamp = new Date().toISOString();
            
            // Sauvegarder avec nouvelle méthode optimisée
            this.saveToStorageOptimized();

            // Calculer les statistiques
            const stats = this.calculateStats(emails, options.taskPreselectedCategories);

            // Notifier les autres modules
            this.notifyScanCompleted();

            if (options.onProgress) {
                options.onProgress({
                    progress: { current: 100 },
                    message: 'Scan terminé !',
                    phase: 'Terminé'
                });
            }

            // Cacher le loading
            if (window.uiManager) {
                window.uiManager.hideLoading();
                window.uiManager.showToast(`${emails.length} emails scannés avec succès`, 'success');
            }

            return {
                success: true,
                total: emails.length,
                categorized: emails.filter(e => e.category && e.category !== 'other').length,
                emails: emails,
                timestamp: this.lastScanTimestamp,
                stats: stats,
                taskPreselectedCategories: options.taskPreselectedCategories || []
            };

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur scan:', error);
            
            if (window.uiManager) {
                window.uiManager.hideLoading();
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }

            return {
                success: false,
                error: error.message
            };
        } finally {
            this.isScanning = false;
            this.scanProgress = 100;
        }
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS
    // ================================================
    async fetchEmails() {
        console.log('[EmailScanner] 📨 Récupération des emails...');
        
        if (!window.mailService) {
            throw new Error('Service de messagerie non disponible');
        }

        const provider = await this.getActiveProvider();
        console.log('[EmailScanner] Provider actif:', provider);

        try {
            let emails = [];
            
            if (!window.mailService.isInitialized) {
                console.log('[EmailScanner] 🔄 MailService non initialisé, initialisation...');
                await window.mailService.initialize();
                console.log('[EmailScanner] ✅ MailService initialisé');
            }
            
            if (provider === 'microsoft' && typeof window.mailService.getMicrosoftEmails === 'function') {
                console.log('[EmailScanner] Utilisation de getMicrosoftEmails');
                
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - this.scanOptions.days);
                
                const filter = `receivedDateTime ge ${startDate.toISOString()}`;
                
                const options = {
                    top: 1000,
                    select: 'id,subject,from,receivedDateTime,bodyPreview,body,hasAttachments,importance,categories,isRead,toRecipients,ccRecipients',
                    filter: filter,
                    orderby: 'receivedDateTime desc'
                };
                
                console.log('[EmailScanner] Options Microsoft:', options);
                
                const response = await window.mailService.getMicrosoftEmails(
                    this.scanOptions.folder || 'inbox',
                    options
                );
                
                console.log('[EmailScanner] Réponse Microsoft:', response);
                
                if (response) {
                    if (Array.isArray(response)) {
                        emails = response;
                    } else if (response.value && Array.isArray(response.value)) {
                        emails = response.value;
                    } else if (response.emails && Array.isArray(response.emails)) {
                        emails = response.emails;
                    } else {
                        console.warn('[EmailScanner] Format de réponse inattendu:', response);
                        emails = [];
                    }
                }
                
            } else if (provider === 'google' && typeof window.mailService.getGmailEmails === 'function') {
                console.log('[EmailScanner] Utilisation de getGmailEmails');
                
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - this.scanOptions.days);
                
                const options = {
                    labelIds: ['INBOX'],
                    maxResults: 1000,
                    q: `after:${startDate.toISOString().split('T')[0]}`
                };
                
                console.log('[EmailScanner] Options Gmail:', options);
                
                const response = await window.mailService.getGmailEmails(options);
                
                console.log('[EmailScanner] Réponse Gmail:', response);
                
                if (response) {
                    if (Array.isArray(response)) {
                        emails = response;
                    } else if (response.messages && Array.isArray(response.messages)) {
                        emails = response.messages;
                    } else if (response.emails && Array.isArray(response.emails)) {
                        emails = response.emails;
                    } else {
                        emails = [];
                    }
                }
                
            } else if (typeof window.mailService.getEmailsFromFolder === 'function') {
                console.log('[EmailScanner] Fallback vers getEmailsFromFolder');
                
                const folderName = this.scanOptions.folder || 'inbox';
                const options = {
                    days: this.scanOptions.days,
                    limit: 1000
                };
                
                console.log('[EmailScanner] Appel getEmailsFromFolder:', { folderName, options });
                
                const response = await window.mailService.getEmailsFromFolder(folderName, options);
                
                console.log('[EmailScanner] Réponse getEmailsFromFolder:', response);
                
                if (response) {
                    if (Array.isArray(response)) {
                        emails = response;
                    } else if (response.emails && Array.isArray(response.emails)) {
                        emails = response.emails;
                    } else if (response.value && Array.isArray(response.value)) {
                        emails = response.value;
                    } else {
                        emails = [];
                    }
                }
            } else {
                throw new Error('Aucune méthode de récupération des emails disponible');
            }

            if (!Array.isArray(emails)) {
                console.warn('[EmailScanner] Conversion en tableau nécessaire');
                emails = [];
            }

            console.log(`[EmailScanner] ✅ ${emails.length} emails récupérés`);
            return emails;

        } catch (error) {
            console.error('[EmailScanner] Erreur récupération emails:', error);
            
            if (error.message?.includes('auth') || error.message?.includes('token') || error.status === 401) {
                throw new Error('Erreur d\'authentification. Veuillez vous reconnecter.');
            }
            
            if (error.message?.includes('network') || error.message?.includes('fetch')) {
                throw new Error('Erreur de connexion. Vérifiez votre connexion internet.');
            }
            
            throw new Error(`Erreur lors de la récupération des emails: ${error.message}`);
        }
    }

    // ================================================
    // CATÉGORISATION CORRIGÉE
    // ================================================
    async categorizeEmailsFixed(emails) {
        console.log('[EmailScanner] 🏷️ Catégorisation CORRIGÉE de', emails.length, 'emails...');
        
        // VÉRIFICATION CRITIQUE CategoryManager
        if (!window.categoryManager) {
            console.error('[EmailScanner] ❌ CategoryManager NON DISPONIBLE');
            console.log('[EmailScanner] 📋 Emails sans catégorisation - marquage comme "other"');
            
            // Marquer tous comme 'other' si pas de CategoryManager
            emails.forEach(email => {
                email.category = 'other';
                email.categoryScore = 0;
                email.categoryConfidence = 0;
                email.isPreselectedForTasks = false;
            });
            return;
        }

        if (typeof window.categoryManager.analyzeEmail !== 'function') {
            console.error('[EmailScanner] ❌ Méthode analyzeEmail NON DISPONIBLE');
            emails.forEach(email => {
                email.category = 'other';
                email.categoryScore = 0;
                email.categoryConfidence = 0;
                email.isPreselectedForTasks = false;
            });
            return;
        }

        console.log('[EmailScanner] ✅ CategoryManager DISPONIBLE et FONCTIONNEL');

        // Récupérer les catégories pré-sélectionnées
        let taskPreselectedCategories = [];
        try {
            if (typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
                taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
            }
        } catch (error) {
            console.warn('[EmailScanner] Erreur récupération catégories pré-sélectionnées:', error);
        }
        
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', taskPreselectedCategories);

        let categorizedCount = 0;
        let preselectedCount = 0;
        let otherCount = 0;
        let marketingCount = 0;
        const startTime = performance.now();

        // Traitement par batches pour optimiser
        const batchSize = 50;
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // Analyser l'email avec CategoryManager
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    if (analysis && analysis.category) {
                        email.category = analysis.category;
                        email.categoryScore = analysis.score || 0;
                        email.categoryConfidence = analysis.confidence || 0;
                        
                        // Compteurs pour debug
                        if (analysis.category !== 'other') {
                            categorizedCount++;
                        } else {
                            otherCount++;
                        }
                        
                        if (analysis.category === 'marketing_news') {
                            marketingCount++;
                        }
                        
                        // Marquer si pré-sélectionné pour tâches
                        if (taskPreselectedCategories.includes(analysis.category)) {
                            email.isPreselectedForTasks = true;
                            preselectedCount++;
                        } else {
                            email.isPreselectedForTasks = false;
                        }
                    } else {
                        // Si pas d'analyse, marquer comme 'other'
                        email.category = 'other';
                        email.categoryScore = 0;
                        email.categoryConfidence = 0;
                        email.isPreselectedForTasks = false;
                        otherCount++;
                    }

                } catch (error) {
                    console.error('[EmailScanner] Erreur catégorisation email:', error);
                    // En cas d'erreur, mettre des valeurs par défaut
                    email.category = 'other';
                    email.categoryScore = 0;
                    email.categoryConfidence = 0;
                    email.isPreselectedForTasks = false;
                    otherCount++;
                }
            }
            
            // Log de progression tous les 100 emails
            if (i > 0 && i % 100 === 0) {
                console.log(`[EmailScanner] 📊 Progression: ${i}/${emails.length} emails traités`);
            }
        }

        const endTime = performance.now();
        console.log(`[EmailScanner] ✅ Catégorisation CORRIGÉE terminée:`);
        console.log(`   - ${categorizedCount} emails catégorisés`);
        console.log(`   - ${otherCount} emails "other"`);
        console.log(`   - ${marketingCount} emails "marketing_news"`);
        console.log(`   - ${preselectedCount} emails pré-sélectionnés pour tâches`);
        console.log(`   - Durée: ${(endTime - startTime).toFixed(2)}ms`);
        
        // Alerte si trop de marketing
        if (marketingCount > emails.length * 0.8) {
            console.warn(`[EmailScanner] ⚠️ ALERTE: ${marketingCount} emails en marketing_news (${Math.round(marketingCount/emails.length*100)}%) - Possible sur-catégorisation`);
        }
    }

    // ================================================
    // SAUVEGARDE OPTIMISÉE QUOTA
    // ================================================
    saveToStorageOptimized() {
        try {
            console.log('[EmailScanner] 💾 Sauvegarde optimisée en cours...');
            
            // Version ultra-compacte pour éviter quota
            const compactEmails = this.emails.slice(0, 200).map(email => ({
                id: email.id,
                subject: (email.subject || '').substring(0, 60),
                from: {
                    emailAddress: {
                        address: email.from?.emailAddress?.address || '',
                        name: (email.from?.emailAddress?.name || '').substring(0, 25)
                    }
                },
                receivedDateTime: email.receivedDateTime,
                category: email.category,
                categoryScore: email.categoryScore,
                isPreselectedForTasks: email.isPreselectedForTasks,
                isRead: email.isRead,
                hasAttachments: email.hasAttachments,
                bodyPreview: (email.bodyPreview || '').substring(0, 100)
            }));

            const dataToStore = {
                emails: compactEmails,
                lastScanTimestamp: this.lastScanTimestamp,
                scanOptions: {
                    days: this.scanOptions.days,
                    folder: this.scanOptions.folder
                },
                version: '4.0-optimized',
                totalEmails: this.emails.length,
                categoryCounts: this.getCategoryCounts()
            };

            const dataString = JSON.stringify(dataToStore);
            const sizeKB = Math.round(dataString.length / 1024);
            
            console.log(`[EmailScanner] 📊 Taille données: ${sizeKB}KB`);
            
            // Vérifier la taille avant stockage
            if (dataString.length > 3 * 1024 * 1024) { // 3MB limit
                console.warn('[EmailScanner] ⚠️ Données trop volumineuses, réduction drastique...');
                
                // Version micro-compacte
                const microCompact = {
                    emails: compactEmails.slice(0, 50).map(email => ({
                        id: email.id,
                        subject: (email.subject || '').substring(0, 30),
                        from: email.from?.emailAddress?.address || '',
                        receivedDateTime: email.receivedDateTime,
                        category: email.category,
                        isPreselectedForTasks: email.isPreselectedForTasks
                    })),
                    lastScanTimestamp: this.lastScanTimestamp,
                    totalEmails: this.emails.length,
                    categoryCounts: this.getCategoryCounts(),
                    version: '4.0-micro'
                };
                
                localStorage.setItem('scanResults', JSON.stringify(microCompact));
                console.log(`[EmailScanner] 💾 Version micro-compacte sauvegardée (${microCompact.emails.length} emails)`);
            } else {
                localStorage.setItem('scanResults', dataString);
                console.log(`[EmailScanner] 💾 Version optimisée sauvegardée (${compactEmails.length} emails, ${sizeKB}KB)`);
            }
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur sauvegarde optimisée:', error);
            
            // Dernier recours - sauver seulement les stats essentielles
            try {
                const statsOnly = {
                    lastScanTimestamp: this.lastScanTimestamp,
                    totalEmails: this.emails.length,
                    categoryCounts: this.getCategoryCounts(),
                    version: '4.0-stats-only'
                };
                localStorage.setItem('scanResults', JSON.stringify(statsOnly));
                console.log('[EmailScanner] 💾 Stats seulement sauvegardées (mode survie)');
                
                // Nettoyer localStorage pour libérer de l'espace
                this.clearOldStorageData();
            } catch (finalError) {
                console.error('[EmailScanner] ❌ Impossible de sauvegarder même les stats:', finalError);
            }
        }
    }

    // Méthode de nettoyage localStorage
    clearOldStorageData() {
        console.log('[EmailScanner] 🧹 Nettoyage localStorage d\'urgence...');
        
        const keysToCheck = [
            'emailAnalysis', 'taskResults', 'categoryFilters', 
            'aiAnalysisResults', 'emailCache', 'oldScanResults'
        ];
        
        keysToCheck.forEach(key => {
            try {
                const item = localStorage.getItem(key);
                if (item && item.length > 10000) { // Si > 10KB
                    localStorage.removeItem(key);
                    console.log(`[EmailScanner] 🗑️ Supprimé ${key} (${Math.round(item.length/1000)}KB)`);
                }
            } catch (e) {
                console.warn(`[EmailScanner] Erreur nettoyage ${key}:`, e);
            }
        });
    }

    // Méthode de sauvegarde classique (fallback)
    saveToStorage() {
        this.saveToStorageOptimized();
    }

    // ================================================
    // CALCUL DES STATISTIQUES
    // ================================================
    calculateStats(emails, taskPreselectedCategories = []) {
        const stats = {
            total: emails.length,
            categorized: 0,
            preselectedForTasks: 0,
            taskSuggestions: 0,
            byCategory: {}
        };

        emails.forEach(email => {
            if (email.category && email.category !== 'other') {
                stats.categorized++;
                stats.byCategory[email.category] = (stats.byCategory[email.category] || 0) + 1;
            }

            if (email.isPreselectedForTasks || taskPreselectedCategories.includes(email.category)) {
                stats.preselectedForTasks++;
            }

            if (email.importance === 'high' || email.category === 'tasks' || email.category === 'reminders') {
                stats.taskSuggestions++;
            }
        });

        return stats;
    }

    // ================================================
    // RECATÉGORISATION
    // ================================================
    async recategorizeEmails() {
        console.log('[EmailScanner] 🔄 Recatégorisation des emails...');
        
        if (this.emails.length === 0) return;

        await this.categorizeEmailsFixed(this.emails);
        this.saveToStorageOptimized();
        
        this.dispatchEvent('emailsRecategorized', {
            count: this.emails.length,
            timestamp: new Date().toISOString()
        });
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES
    // ================================================
    getAllEmails() {
        return [...this.emails];
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    getEmailsByCategory(categoryId) {
        return this.emails.filter(email => email.category === categoryId);
    }

    getEmailsBySender(senderEmail) {
        return this.emails.filter(email => 
            email.from?.emailAddress?.address === senderEmail
        );
    }

    getEmailsCount() {
        return this.emails.length;
    }

    getCategoryCounts() {
        const counts = {};
        this.emails.forEach(email => {
            const category = email.category || 'other';
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }

    // ================================================
    // AUTHENTIFICATION
    // ================================================
    async checkAuthentication() {
        if (window.authService?.isAuthenticated()) {
            return true;
        }

        if (window.googleAuthService?.isAuthenticated()) {
            return true;
        }

        return false;
    }

    async getActiveProvider() {
        if (window.authService?.isAuthenticated()) {
            return 'microsoft';
        }
        if (window.googleAuthService?.isAuthenticated()) {
            return 'google';
        }
        return null;
    }

    // ================================================
    // STOCKAGE LOCAL
    // ================================================
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('scanResults');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.version && data.version.startsWith('4.0') && Array.isArray(data.emails)) {
                    this.emails = data.emails;
                    this.lastScanTimestamp = data.lastScanTimestamp;
                    this.scanOptions = { ...this.scanOptions, ...data.scanOptions };
                    console.log(`[EmailScanner] 📂 ${this.emails.length} emails chargés depuis le cache v${data.version}`);
                }
            }
        } catch (error) {
            console.error('[EmailScanner] Erreur chargement cache:', error);
        }
    }

    clearStorage() {
        try {
            localStorage.removeItem('scanResults');
            this.emails = [];
            this.lastScanTimestamp = null;
            console.log('[EmailScanner] 🧹 Cache effacé');
        } catch (error) {
            console.error('[EmailScanner] Erreur effacement cache:', error);
        }
    }

    // ================================================
    // EXPORT DES RÉSULTATS
    // ================================================
    exportResults(format = 'csv') {
        if (this.emails.length === 0) {
            window.uiManager?.showToast('Aucun email à exporter', 'warning');
            return;
        }

        try {
            let content = '';
            let filename = `emails_export_${new Date().toISOString().split('T')[0]}`;
            let mimeType = '';

            if (format === 'csv') {
                content = this.generateCSV();
                filename += '.csv';
                mimeType = 'text/csv;charset=utf-8;';
            } else if (format === 'json') {
                content = JSON.stringify(this.emails, null, 2);
                filename += '.json';
                mimeType = 'application/json;charset=utf-8;';
            }

            const blob = new Blob([content], { type: mimeType });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);

            window.uiManager?.showToast('Export réussi', 'success');
        } catch (error) {
            console.error('[EmailScanner] Erreur export:', error);
            window.uiManager?.showToast('Erreur lors de l\'export', 'error');
        }
    }

    generateCSV() {
        const headers = ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Score', 'Pré-sélectionné'];
        const rows = [headers];

        this.emails.forEach(email => {
            const row = [
                new Date(email.receivedDateTime).toLocaleString('fr-FR'),
                email.from?.emailAddress?.name || '',
                email.from?.emailAddress?.address || '',
                (email.subject || '').replace(/"/g, '""'),
                email.category || 'other',
                email.categoryScore || 0,
                email.isPreselectedForTasks ? 'Oui' : 'Non'
            ];
            rows.push(row.map(cell => `"${cell}"`));
        });

        return rows.map(row => row.join(',')).join('\n');
    }

    // ================================================
    // NOTIFICATIONS ET ÉVÉNEMENTS
    // ================================================
    notifyScanCompleted() {
        console.log('[EmailScanner] 📢 Notification scan terminé');
        
        this.dispatchEvent('scanCompleted', {
            success: true,
            count: this.emails.length,
            emails: this.emails,
            timestamp: this.lastScanTimestamp
        });

        this.dispatchEvent('emailsUpdated', {
            count: this.emails.length,
            timestamp: this.lastScanTimestamp
        });
    }

    notifyEmailsUpdated() {
        this.dispatchEvent('emailsUpdated', {
            count: this.emails.length,
            timestamp: new Date().toISOString()
        });
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, {
                detail: {
                    ...detail,
                    source: 'EmailScanner'
                }
            }));
        } catch (error) {
            console.error(`[EmailScanner] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // MÉTHODES DE MISE À JOUR DES PARAMÈTRES
    // ================================================
    updateSettings(newSettings) {
        console.log('[EmailScanner] 🔧 Mise à jour des paramètres:', newSettings);
        
        if (newSettings.activeCategories) {
            this.recategorizeEmails();
        }
        
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        this.emails.forEach(email => {
            email.isPreselectedForTasks = categories.includes(email.category);
        });
        
        this.saveToStorageOptimized();
        this.notifyEmailsUpdated();
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        this.emails = [];
        this.categorizedEmails.clear();
        this.conversationGroups.clear();
        this.isScanning = false;
        this.scanProgress = 0;
        console.log('[EmailScanner] 🧹 Nettoyage effectué');
    }

    destroy() {
        this.cleanup();
        this.clearStorage();
        console.log('[EmailScanner] Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
console.log('[EmailScanner] 🚀 Création instance globale v4.0...');
window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v4.0 loaded - CORRECTION TOTALE quota + catégorisation!');
