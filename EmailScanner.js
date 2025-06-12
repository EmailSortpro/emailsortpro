// EmailScanner.js - CENTRALISATEUR RESTRUCTURÉ v5.0
// Gestionnaire central de l'état et synchronisateur de tous les modules

class EmailScanner {
    constructor() {
        // État central
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = this.loadCentralSettings();
        
        // Abonnés aux changements
        this.subscribers = new Set();
        
        // État de synchronisation
        this.lastSettingsUpdate = Date.now();
        this.lastScanTimestamp = null;
        
        console.log('[EmailScanner] ✅ CENTRALISATEUR v5.0 - Gestionnaire central d\'état');
        
        // Initialisation immédiate
        this.initialize();
    }

    // ================================================
    // INITIALISATION ET CONFIGURATION CENTRALE
    // ================================================
    
    initialize() {
        this.setupEventListeners();
        this.validateDependencies();
        this.syncAllModules();
        
        // Auto-sync périodique pour détecter les changements externes
        setInterval(() => this.checkForExternalChanges(), 5000);
    }
    
    setupEventListeners() {
        // Écouter TOUS les changements de paramètres
        window.addEventListener('settingsChanged', (event) => {
            console.log('[EmailScanner] 🔄 Settings changed:', event.detail);
            this.handleSettingsChange(event.detail);
        });
        
        // Écouter les changements de localStorage directement
        window.addEventListener('storage', (event) => {
            if (event.key === 'categorySettings') {
                console.log('[EmailScanner] 🔄 LocalStorage changed, resyncing...');
                this.loadAndSyncSettings();
            }
        });
        
        // Écouter la visibilité de la page (retour depuis autre onglet)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForExternalChanges();
            }
        });
    }
    
    validateDependencies() {
        const required = ['categoryManager', 'mailService'];
        const missing = required.filter(dep => !window[dep]);
        
        if (missing.length > 0) {
            console.warn('[EmailScanner] ⚠️ Missing dependencies:', missing);
            // Retry dans 2 secondes
            setTimeout(() => this.validateDependencies(), 2000);
        } else {
            console.log('[EmailScanner] ✅ All dependencies available');
        }
    }

    // ================================================
    // GESTION CENTRALISÉE DES PARAMÈTRES
    // ================================================
    
    loadCentralSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            const settings = saved ? JSON.parse(saved) : this.getDefaultSettings();
            
            // Valider et nettoyer les paramètres
            return this.validateSettings(settings);
        } catch (error) {
            console.error('[EmailScanner] Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }
    
    getDefaultSettings() {
        return {
            // Paramètres de scan
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            
            // Paramètres de catégorisation
            preferences: {
                excludeSpam: true,
                detectCC: true,
                compactView: false,
                showNotifications: true
            },
            
            // Catégories actives
            activeCategories: null, // null = toutes actives
            
            // Catégories pré-sélectionnées pour tâches
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings'],
            
            // Automatisation
            automationSettings: {
                autoCreateTasks: false,
                groupTasksByDomain: false,
                skipDuplicates: true,
                autoAssignPriority: false
            },
            
            // Exclusions
            categoryExclusions: {
                domains: [],
                emails: []
            }
        };
    }
    
    validateSettings(settings) {
        const defaults = this.getDefaultSettings();
        
        // Fusionner avec les valeurs par défaut pour les clés manquantes
        const validated = this.deepMerge(defaults, settings);
        
        // Validations spécifiques
        if (!Array.isArray(validated.taskPreselectedCategories)) {
            validated.taskPreselectedCategories = defaults.taskPreselectedCategories;
        }
        
        if (!Number.isInteger(validated.scanSettings.defaultPeriod) || 
            validated.scanSettings.defaultPeriod < 1) {
            validated.scanSettings.defaultPeriod = 7;
        }
        
        return validated;
    }
    
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    // ================================================
    // SYNCHRONISATION CENTRALE
    // ================================================
    
    handleSettingsChange(detail) {
        const { type, value } = detail;
        
        // Mettre à jour les paramètres centraux
        this.updateCentralSettings(type, value);
        
        // Synchroniser tous les modules
        this.syncAllModules();
        
        // Re-traiter les emails si nécessaire
        if (this.shouldReprocessEmails(type)) {
            this.reprocessEmails();
        }
        
        // Notifier les abonnés
        this.notifySubscribers('settingsChanged', { type, value });
    }
    
    updateCentralSettings(type, value) {
        switch (type) {
            case 'scanSettings':
                this.settings.scanSettings = { ...this.settings.scanSettings, ...value };
                break;
            case 'preferences':
                this.settings.preferences = { ...this.settings.preferences, ...value };
                break;
            case 'activeCategories':
                this.settings.activeCategories = value;
                break;
            case 'taskPreselectedCategories':
                this.settings.taskPreselectedCategories = value;
                break;
            case 'automationSettings':
                this.settings.automationSettings = { ...this.settings.automationSettings, ...value };
                break;
            default:
                console.warn('[EmailScanner] Unknown settings type:', type);
        }
        
        // Sauvegarder immédiatement
        this.saveCentralSettings();
        this.lastSettingsUpdate = Date.now();
    }
    
    syncAllModules() {
        // Synchroniser CategoryManager
        if (window.categoryManager) {
            window.categoryManager.updateSettings({
                excludeSpam: this.settings.preferences.excludeSpam,
                detectCC: this.settings.preferences.detectCC,
                activeCategories: this.settings.activeCategories
            });
        }
        
        // Synchroniser AITaskAnalyzer
        if (window.aiTaskAnalyzer) {
            window.aiTaskAnalyzer.updatePreselectedCategories(
                this.settings.taskPreselectedCategories
            );
            window.aiTaskAnalyzer.updateAutomationSettings(
                this.settings.automationSettings
            );
        }
        
        console.log('[EmailScanner] 🔄 All modules synchronized');
    }
    
    shouldReprocessEmails(settingsType) {
        // Certains changements nécessitent de re-catégoriser les emails
        const reprocessTriggers = [
            'preferences', 
            'activeCategories'
        ];
        
        return reprocessTriggers.includes(settingsType) && this.emails.length > 0;
    }
    
    async reprocessEmails() {
        if (this.emails.length === 0) return;
        
        console.log('[EmailScanner] 🔄 Reprocessing emails with new settings...');
        
        // Re-catégoriser tous les emails
        this.emails.forEach(email => {
            const analysis = window.categoryManager?.analyzeEmail(email);
            if (analysis) {
                email.category = analysis.category || 'other';
                email.categoryScore = analysis.score || 0;
                email.categoryConfidence = analysis.confidence || 0;
                email.matchedPatterns = analysis.matchedPatterns || [];
                email.hasAbsolute = analysis.hasAbsolute || false;
            }
        });
        
        // Recalculer les catégories organisées
        this.organizeCategorizedEmails();
        
        // Notifier les changements
        this.notifySubscribers('emailsReprocessed', {
            total: this.emails.length,
            timestamp: Date.now()
        });
        
        console.log('[EmailScanner] ✅ Emails reprocessed');
    }
    
    checkForExternalChanges() {
        try {
            const currentSettings = this.loadCentralSettings();
            const settingsJson = JSON.stringify(currentSettings);
            const ourSettingsJson = JSON.stringify(this.settings);
            
            if (settingsJson !== ourSettingsJson) {
                console.log('[EmailScanner] 🔄 External settings change detected');
                this.settings = currentSettings;
                this.syncAllModules();
                this.notifySubscribers('externalSettingsChange', currentSettings);
            }
        } catch (error) {
            console.error('[EmailScanner] Error checking external changes:', error);
        }
    }

    // ================================================
    // GESTION DES ABONNÉS
    // ================================================
    
    subscribe(callback) {
        this.subscribers.add(callback);
        
        // Retourner une fonction de désabonnement
        return () => this.subscribers.delete(callback);
    }
    
    notifySubscribers(eventType, data) {
        this.subscribers.forEach(callback => {
            try {
                callback(eventType, data);
            } catch (error) {
                console.error('[EmailScanner] Error notifying subscriber:', error);
            }
        });
        
        // Émettre aussi un événement global
        window.dispatchEvent(new CustomEvent('emailScannerUpdate', {
            detail: { type: eventType, data }
        }));
    }

    // ================================================
    // SCAN AMÉLIORÉ AVEC SYNCHRONISATION
    // ================================================
    
    async scan(options = {}) {
        if (this.isScanning) {
            console.warn('[EmailScanner] Scan already in progress');
            return this.getCurrentResults();
        }

        try {
            this.isScanning = true;
            
            // S'assurer que tous les modules sont synchronisés AVANT le scan
            this.syncAllModules();
            
            // Utiliser les paramètres centraux
            const scanOptions = this.prepareScanOptions(options);
            
            console.log('[EmailScanner] 🚀 Starting centralized scan:', scanOptions);
            
            // Notifier le début
            this.notifySubscribers('scanStarted', scanOptions);
            
            // Étapes du scan
            await this.performScan(scanOptions);
            
            // Résultats finaux
            const results = this.getDetailedResults();
            this.lastScanTimestamp = Date.now();
            
            // Notifier la fin
            this.notifySubscribers('scanCompleted', results);
            
            return results;
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Scan error:', error);
            this.notifySubscribers('scanError', error);
            throw error;
        } finally {
            this.isScanning = false;
        }
    }
    
    prepareScanOptions(userOptions) {
        const centralSettings = this.settings.scanSettings;
        
        return {
            days: userOptions.days || centralSettings.defaultPeriod,
            folder: userOptions.folder || centralSettings.defaultFolder,
            onProgress: userOptions.onProgress || this.scanProgress,
            includeSpam: !this.settings.preferences.excludeSpam,
            maxEmails: userOptions.maxEmails || 1000,
            autoAnalyze: centralSettings.autoAnalyze,
            autoCategrize: centralSettings.autoCategrize
        };
    }
    
    async performScan(options) {
        // Réinitialiser
        this.reset();
        
        // Progression
        this.updateProgress('fetching', 'Récupération des emails...', { current: 0, total: 100 });
        
        // Vérifier les services requis
        if (!window.mailService) {
            throw new Error('MailService not available');
        }
        
        // Calculer les dates
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - options.days);
        
        // Récupérer les emails
        const emails = await window.mailService.getEmailsFromFolder(options.folder, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            top: options.maxEmails
        });
        
        this.emails = emails || [];
        console.log(`[EmailScanner] ✅ Fetched ${this.emails.length} emails`);
        
        if (this.emails.length === 0) {
            return;
        }
        
        // Catégoriser avec les paramètres actuels
        this.updateProgress('categorizing', 'Catégorisation intelligente...', { current: 0, total: this.emails.length });
        
        await this.categorizeWithCurrentSettings();
        
        this.updateProgress('complete', 'Scan terminé !');
    }
    
    async categorizeWithCurrentSettings() {
        if (!window.categoryManager) {
            console.warn('[EmailScanner] CategoryManager not available');
            return;
        }
        
        for (let i = 0; i < this.emails.length; i++) {
            const email = this.emails[i];
            
            try {
                const analysis = window.categoryManager.analyzeEmail(email);
                
                email.category = analysis.category || 'other';
                email.categoryScore = analysis.score || 0;
                email.categoryConfidence = analysis.confidence || 0;
                email.matchedPatterns = analysis.matchedPatterns || [];
                email.hasAbsolute = analysis.hasAbsolute || false;
                
            } catch (error) {
                console.error('[EmailScanner] Error categorizing email:', error);
                email.category = 'other';
                email.categoryError = error.message;
            }
            
            // Progression
            if (i % 10 === 0 || i === this.emails.length - 1) {
                this.updateProgress('categorizing', 
                    `Catégorisation: ${i + 1}/${this.emails.length}`, 
                    { current: i + 1, total: this.emails.length }
                );
            }
        }
        
        // Organiser par catégories
        this.organizeCategorizedEmails();
    }
    
    organizeCategorizedEmails() {
        this.categorizedEmails = {};
        
        // Initialiser toutes les catégories
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        this.categorizedEmails.other = [];
        
        // Répartir les emails
        this.emails.forEach(email => {
            const category = email.category || 'other';
            if (this.categorizedEmails[category]) {
                this.categorizedEmails[category].push(email);
            } else {
                this.categorizedEmails.other.push(email);
            }
        });
    }

    // ================================================
    // API PUBLIQUE CENTRALISÉE
    // ================================================
    
    // Paramètres
    getSettings() {
        return { ...this.settings }; // Copie pour éviter les mutations
    }
    
    getScanSettings() {
        return { ...this.settings.scanSettings };
    }
    
    getTaskPreselectedCategories() {
        return [...this.settings.taskPreselectedCategories];
    }
    
    updateSettings(type, value) {
        this.handleSettingsChange({ type, value });
    }
    
    // Données
    getAllEmails() {
        return this.emails;
    }
    
    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.emails;
        }
        return this.emails.filter(email => email.category === categoryId);
    }
    
    getCategorizedEmails() {
        return this.categorizedEmails;
    }
    
    getCurrentResults() {
        return this.getDetailedResults();
    }
    
    // État
    getState() {
        return {
            isScanning: this.isScanning,
            emailCount: this.emails.length,
            lastScan: this.lastScanTimestamp,
            lastSettingsUpdate: this.lastSettingsUpdate,
            settings: this.getSettings()
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    
    updateProgress(phase, message, progress = null) {
        const progressData = { phase, message, progress };
        
        if (this.scanProgress) {
            this.scanProgress(progressData);
        }
        
        this.notifySubscribers('scanProgress', progressData);
    }
    
    saveCentralSettings() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('[EmailScanner] Error saving settings:', error);
        }
    }
    
    loadAndSyncSettings() {
        this.settings = this.loadCentralSettings();
        this.syncAllModules();
        this.notifySubscribers('settingsReloaded', this.settings);
    }
    
    reset() {
        this.emails = [];
        this.categorizedEmails = {};
        this.organizeCategorizedEmails();
    }
    
    getDetailedResults() {
        const breakdown = {};
        let totalCategorized = 0;
        
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            if (catId !== 'other') {
                totalCategorized += emails.length;
            }
        });
        
        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            stats: {
                processed: this.emails.length,
                errors: this.emails.filter(e => e.categoryError).length,
                lastScan: this.lastScanTimestamp,
                settings: this.getSettings()
            },
            emails: this.emails
        };
    }
}

// Créer l'instance globale centralisée
window.emailScanner = new EmailScanner();

// API d'abonnement globale
window.subscribeToEmailScanner = (callback) => {
    return window.emailScanner.subscribe(callback);
};

console.log('✅ EmailScanner v5.0 CENTRALISÉ loaded');
