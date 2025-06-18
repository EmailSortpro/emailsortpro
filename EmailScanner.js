// EmailScanner.js - Version 3.0 - MODULE DE SCAN FONCTIONNEL 🚀
console.log('[EmailScanner] 🚀 Loading EmailScanner.js v3.0 - FUNCTIONAL SCAN MODULE...');

// Vérifier si EmailScanner existe déjà et le nettoyer
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
        console.log('[EmailScanner] ✅ Module initialisé v3.0');
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

            // Récupérer les emails
            const emails = await this.fetchEmails();
            console.log(`[EmailScanner] 📧 ${emails.length} emails récupérés`);

            // Catégoriser les emails
            if (this.scanOptions.autoCategrize) {
                await this.categorizeEmails(emails);
            }

            // Stocker les emails
            this.emails = emails;
            this.lastScanTimestamp = new Date().toISOString();
            
            // Sauvegarder en localStorage
            this.saveToStorage();

            // Notifier les autres modules
            this.notifyScanCompleted();

            // Cacher le loading
            if (window.uiManager) {
                window.uiManager.hideLoading();
                window.uiManager.showToast(`${emails.length} emails scannés avec succès`, 'success');
            }

            return {
                success: true,
                count: emails.length,
                emails: emails,
                timestamp: this.lastScanTimestamp
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
        
        // Utiliser le MailService unifié
        if (!window.mailService) {
            throw new Error('Service de messagerie non disponible');
        }

        const provider = await this.getActiveProvider();
        console.log('[EmailScanner] Provider actif:', provider);

        // Calculer la date de début
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - this.scanOptions.days);

        try {
            // Récupérer les emails via MailService
            const emails = await window.mailService.getEmails({
                folder: this.scanOptions.folder,
                startDate: startDate.toISOString(),
                includeBody: true,
                maxResults: 1000
            });

            console.log(`[EmailScanner] ✅ ${emails.length} emails récupérés`);
            return emails;

        } catch (error) {
            console.error('[EmailScanner] Erreur récupération emails:', error);
            throw error;
        }
    }

    // ================================================
    // CATÉGORISATION DES EMAILS
    // ================================================
    async categorizeEmails(emails) {
        console.log('[EmailScanner] 🏷️ Catégorisation de', emails.length, 'emails...');
        
        if (!window.categoryManager) {
            console.warn('[EmailScanner] CategoryManager non disponible');
            return;
        }

        const taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
        console.log('[EmailScanner] Catégories pré-sélectionnées:', taskPreselectedCategories);

        let categorizedCount = 0;
        const startTime = performance.now();

        for (const email of emails) {
            try {
                // Analyser l'email avec CategoryManager
                const analysis = window.categoryManager.analyzeEmail(email);
                
                if (analysis && analysis.category !== 'other') {
                    email.category = analysis.category;
                    email.categoryScore = analysis.score;
                    email.categoryConfidence = analysis.confidence;
                    categorizedCount++;
                }

                // Marquer si pré-sélectionné pour tâches
                email.isPreselectedForTasks = taskPreselectedCategories.includes(email.category);

            } catch (error) {
                console.error('[EmailScanner] Erreur catégorisation email:', error);
            }
        }

        const endTime = performance.now();
        console.log(`[EmailScanner] ✅ ${categorizedCount} emails catégorisés en ${(endTime - startTime).toFixed(2)}ms`);
    }

    // ================================================
    // RECATÉGORISATION
    // ================================================
    async recategorizeEmails() {
        console.log('[EmailScanner] 🔄 Recatégorisation des emails...');
        
        if (this.emails.length === 0) return;

        await this.categorizeEmails(this.emails);
        this.saveToStorage();
        
        // Notifier les autres modules
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
        // Vérifier Microsoft
        if (window.authService?.isAuthenticated()) {
            return true;
        }

        // Vérifier Google
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
    saveToStorage() {
        try {
            const dataToStore = {
                emails: this.emails,
                lastScanTimestamp: this.lastScanTimestamp,
                scanOptions: this.scanOptions,
                version: '3.0'
            };
            
            localStorage.setItem('scanResults', JSON.stringify(dataToStore));
            console.log('[EmailScanner] 💾 Données sauvegardées');
        } catch (error) {
            console.error('[EmailScanner] Erreur sauvegarde:', error);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('scanResults');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.version === '3.0' && Array.isArray(data.emails)) {
                    this.emails = data.emails;
                    this.lastScanTimestamp = data.lastScanTimestamp;
                    this.scanOptions = { ...this.scanOptions, ...data.scanOptions };
                    console.log(`[EmailScanner] 📂 ${this.emails.length} emails chargés depuis le cache`);
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

            // Créer et télécharger le fichier
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
    // ACTIONS BATCH
    // ================================================
    async performBatchAction(emailIds, action) {
        console.log(`[EmailScanner] 🔄 Action batch: ${action} sur ${emailIds.length} emails`);
        
        if (!Array.isArray(emailIds) || emailIds.length === 0) {
            return { success: false, error: 'Aucun email sélectionné' };
        }

        try {
            switch (action) {
                case 'markAsRead':
                    await this.markEmailsAsRead(emailIds);
                    break;
                case 'markAsUnread':
                    await this.markEmailsAsUnread(emailIds);
                    break;
                case 'archive':
                    await this.archiveEmails(emailIds);
                    break;
                case 'delete':
                    await this.deleteEmails(emailIds);
                    break;
                default:
                    throw new Error(`Action inconnue: ${action}`);
            }

            return { success: true, count: emailIds.length };
        } catch (error) {
            console.error('[EmailScanner] Erreur action batch:', error);
            return { success: false, error: error.message };
        }
    }

    async markEmailsAsRead(emailIds) {
        // TODO: Implémenter avec l'API
        console.log('[EmailScanner] Marquer comme lu:', emailIds);
        
        // Mise à jour locale
        emailIds.forEach(id => {
            const email = this.getEmailById(id);
            if (email) {
                email.isRead = true;
            }
        });
        
        this.saveToStorage();
    }

    async markEmailsAsUnread(emailIds) {
        // TODO: Implémenter avec l'API
        console.log('[EmailScanner] Marquer comme non lu:', emailIds);
        
        // Mise à jour locale
        emailIds.forEach(id => {
            const email = this.getEmailById(id);
            if (email) {
                email.isRead = false;
            }
        });
        
        this.saveToStorage();
    }

    async archiveEmails(emailIds) {
        // TODO: Implémenter avec l'API
        console.log('[EmailScanner] Archiver:', emailIds);
        
        // Retirer de la liste locale
        this.emails = this.emails.filter(email => !emailIds.includes(email.id));
        this.saveToStorage();
        
        this.notifyEmailsUpdated();
    }

    async deleteEmails(emailIds) {
        // TODO: Implémenter avec l'API
        console.log('[EmailScanner] Supprimer:', emailIds);
        
        // Retirer de la liste locale
        this.emails = this.emails.filter(email => !emailIds.includes(email.id));
        this.saveToStorage();
        
        this.notifyEmailsUpdated();
    }

    // ================================================
    // RECHERCHE ET FILTRAGE
    // ================================================
    searchEmails(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return this.emails;
        }

        const term = searchTerm.toLowerCase();
        
        return this.emails.filter(email => {
            const subject = (email.subject || '').toLowerCase();
            const from = (email.from?.emailAddress?.name || '').toLowerCase();
            const fromEmail = (email.from?.emailAddress?.address || '').toLowerCase();
            const preview = (email.bodyPreview || '').toLowerCase();
            
            return subject.includes(term) ||
                   from.includes(term) ||
                   fromEmail.includes(term) ||
                   preview.includes(term);
        });
    }

    filterEmails(filters) {
        let filtered = [...this.emails];

        // Filtre par catégorie
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(email => 
                filters.category === 'other' 
                    ? (!email.category || email.category === 'other')
                    : email.category === filters.category
            );
        }

        // Filtre par date
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            filtered = filtered.filter(email => 
                new Date(email.receivedDateTime) >= startDate
            );
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            filtered = filtered.filter(email => 
                new Date(email.receivedDateTime) <= endDate
            );
        }

        // Filtre par expéditeur
        if (filters.sender) {
            const sender = filters.sender.toLowerCase();
            filtered = filtered.filter(email => {
                const fromName = (email.from?.emailAddress?.name || '').toLowerCase();
                const fromEmail = (email.from?.emailAddress?.address || '').toLowerCase();
                return fromName.includes(sender) || fromEmail.includes(sender);
            });
        }

        // Filtre par pièces jointes
        if (filters.hasAttachments !== undefined) {
            filtered = filtered.filter(email => 
                email.hasAttachments === filters.hasAttachments
            );
        }

        // Filtre par importance
        if (filters.importance) {
            filtered = filtered.filter(email => 
                email.importance === filters.importance
            );
        }

        // Filtre par status de lecture
        if (filters.isRead !== undefined) {
            filtered = filtered.filter(email => 
                email.isRead === filters.isRead
            );
        }

        return filtered;
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
    // STATISTIQUES
    // ================================================
    getStatistics() {
        const stats = {
            totalEmails: this.emails.length,
            categories: {},
            senders: {},
            dates: {},
            hasAttachments: 0,
            isRead: 0,
            isUnread: 0,
            preselectedForTasks: 0
        };

        this.emails.forEach(email => {
            // Catégories
            const category = email.category || 'other';
            stats.categories[category] = (stats.categories[category] || 0) + 1;

            // Expéditeurs
            const sender = email.from?.emailAddress?.address || 'unknown';
            stats.senders[sender] = (stats.senders[sender] || 0) + 1;

            // Dates (par jour)
            const date = new Date(email.receivedDateTime).toLocaleDateString('fr-FR');
            stats.dates[date] = (stats.dates[date] || 0) + 1;

            // Autres stats
            if (email.hasAttachments) stats.hasAttachments++;
            if (email.isRead) stats.isRead++;
            else stats.isUnread++;
            if (email.isPreselectedForTasks) stats.preselectedForTasks++;
        });

        // Top 10 expéditeurs
        stats.topSenders = Object.entries(stats.senders)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([sender, count]) => ({ sender, count }));

        return stats;
    }

    // ================================================
    // MÉTHODES DE MISE À JOUR DES PARAMÈTRES
    // ================================================
    updateSettings(newSettings) {
        console.log('[EmailScanner] 🔧 Mise à jour des paramètres:', newSettings);
        
        if (newSettings.activeCategories) {
            // Recatégoriser si les catégories actives changent
            this.recategorizeEmails();
        }
        
        if (newSettings.taskPreselectedCategories) {
            // Mettre à jour les flags de présélection
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        this.emails.forEach(email => {
            email.isPreselectedForTasks = categories.includes(email.category);
        });
        
        this.saveToStorage();
        this.notifyEmailsUpdated();
    }

    // ================================================
    // DÉDUPLICATION
    // ================================================
    findDuplicates() {
        const duplicates = new Map();
        const seen = new Map();

        this.emails.forEach(email => {
            // Créer une clé unique basée sur plusieurs critères
            const key = `${email.from?.emailAddress?.address}|${email.subject}|${email.receivedDateTime}`;
            
            if (seen.has(key)) {
                if (!duplicates.has(key)) {
                    duplicates.set(key, [seen.get(key)]);
                }
                duplicates.get(key).push(email);
            } else {
                seen.set(key, email);
            }
        });

        return duplicates;
    }

    removeDuplicates() {
        const duplicates = this.findDuplicates();
        const toRemove = [];

        duplicates.forEach((emailGroup) => {
            // Garder le premier, supprimer les autres
            toRemove.push(...emailGroup.slice(1).map(e => e.id));
        });

        if (toRemove.length > 0) {
            this.emails = this.emails.filter(email => !toRemove.includes(email.id));
            this.duplicatesFound = toRemove.length;
            this.saveToStorage();
            this.notifyEmailsUpdated();
            
            console.log(`[EmailScanner] 🧹 ${toRemove.length} doublons supprimés`);
        }

        return toRemove.length;
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
console.log('[EmailScanner] 🚀 Création instance globale...');
window.emailScanner = new EmailScanner();

console.log('✅ EmailScanner v3.0 loaded - Module de scan fonctionnel!');
