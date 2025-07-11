// EmailScanner.js - Version 11.1 - Correction compatibilité et gestion CategoryManager

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        this.startScanSynced = false;
        
        // Système de synchronisation
        this.taskPreselectedCategories = [];
        this.lastSettingsSync = 0;
        this.syncInterval = null;
        this.changeListener = null;
        
        // Métriques de performance
        this.scanMetrics = {
            startTime: null,
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {},
            preselectedCount: 0
        };
        
        console.log('[EmailScanner] ✅ Version 11.1 - Correction compatibilité');
        this.initializeWithSync();
    }

    // ================================================
    // INITIALISATION AVEC SYNCHRONISATION
    // ================================================
    async initializeWithSync() {
        console.log('[EmailScanner] 🔧 Initialisation avec synchronisation...');
        
        // 1. Charger les paramètres
        await this.loadSettingsFromCategoryManager();
        
        // 2. S'enregistrer comme listener SI CategoryManager est disponible
        if (window.categoryManager) {
            this.registerAsChangeListener();
        }
        
        // 3. Démarrer la surveillance
        this.startRealTimeSync();
        
        // 4. Setup event listeners
        this.setupEventListeners();
        
        console.log('[EmailScanner] ✅ Initialisation terminée');
    }

    registerAsChangeListener() {
        if (window.categoryManager && typeof window.categoryManager.addChangeListener === 'function') {
            this.changeListener = window.categoryManager.addChangeListener((type, value, fullSettings) => {
                console.log(`[EmailScanner] 📨 Changement CategoryManager: ${type}`, value);
                this.handleCategoryManagerChange(type, value, fullSettings);
            });
            
            console.log('[EmailScanner] 👂 Listener CategoryManager enregistré');
        }
    }

    handleCategoryManagerChange(type, value, fullSettings) {
        console.log(`[EmailScanner] 🔄 Traitement changement: ${type}`);
        
        const needsRecategorization = [
            'taskPreselectedCategories',
            'activeCategories',
            'categoryExclusions',
            'preferences'
        ].includes(type);
        
        switch (type) {
            case 'taskPreselectedCategories':
                console.log('[EmailScanner] 📋 Catégories pré-sélectionnées mises à jour:', value);
                this.taskPreselectedCategories = Array.isArray(value) ? [...value] : [];
                this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
                break;
                
            case 'activeCategories':
                console.log('[EmailScanner] 🏷️ Catégories actives mises à jour:', value);
                this.settings.activeCategories = value;
                break;
                
            case 'categoryExclusions':
                console.log('[EmailScanner] 🚫 Exclusions mises à jour:', value);
                this.settings.categoryExclusions = { ...this.settings.categoryExclusions, ...value };
                break;
                
            case 'scanSettings':
                console.log('[EmailScanner] 🔍 Paramètres scan mis à jour:', value);
                this.settings.scanSettings = { ...this.settings.scanSettings, ...value };
                break;
                
            case 'preferences':
                console.log('[EmailScanner] ⚙️ Préférences mises à jour:', value);
                this.settings.preferences = { ...this.settings.preferences, ...value };
                break;
                
            case 'fullSync':
            case 'fullSettings':
                console.log('[EmailScanner] 🔄 Synchronisation complète');
                this.settings = { ...this.settings, ...fullSettings };
                this.taskPreselectedCategories = fullSettings.taskPreselectedCategories || [];
                break;
        }
        
        // Re-catégoriser si nécessaire
        if (needsRecategorization && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Re-catégorisation automatique déclenchée');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailScannerSynced', {
                type,
                value,
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories,
                emailCount: this.emails.length
            });
        }, 10);
    }

    startRealTimeSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Vérifier périodiquement si CategoryManager est maintenant disponible
        this.syncInterval = setInterval(() => {
            if (window.categoryManager && !this.changeListener) {
                console.log('[EmailScanner] 🔄 CategoryManager détecté, enregistrement du listener');
                this.registerAsChangeListener();
                this.loadSettingsFromCategoryManager();
            }
            this.checkAndSyncSettings();
        }, 5000);
    }

    async checkAndSyncSettings() {
        if (!window.categoryManager) return;
        
        try {
            const currentManagerCategories = window.categoryManager.getTaskPreselectedCategories();
            const currentManagerSettings = window.categoryManager.getSettings();
            
            // Vérifier si les catégories ont changé
            const categoriesChanged = JSON.stringify([...this.taskPreselectedCategories].sort()) !== 
                                    JSON.stringify([...currentManagerCategories].sort());
            
            if (categoriesChanged) {
                console.log('[EmailScanner] 🔄 Désynchronisation détectée, correction...');
                console.log('  - EmailScanner:', this.taskPreselectedCategories);
                console.log('  - CategoryManager:', currentManagerCategories);
                
                // Synchroniser
                this.taskPreselectedCategories = [...currentManagerCategories];
                this.settings = { ...this.settings, ...currentManagerSettings };
                
                // Re-catégoriser si nécessaire
                if (this.emails.length > 0) {
                    console.log('[EmailScanner] 🔄 Re-catégorisation après synchronisation');
                    await this.recategorizeEmails();
                }
                
                console.log('[EmailScanner] ✅ Synchronisation corrigée');
            }
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur vérification sync:', error);
        }
    }

    // ================================================
    // CHARGEMENT DES PARAMÈTRES
    // ================================================
    async loadSettingsFromCategoryManager() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            try {
                this.settings = window.categoryManager.getSettings();
                this.taskPreselectedCategories = window.categoryManager.getTaskPreselectedCategories();
                
                console.log('[EmailScanner] ✅ Paramètres chargés depuis CategoryManager');
                console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
                
                this.lastSettingsSync = Date.now();
                return true;
                
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur chargement CategoryManager:', error);
                return this.loadSettingsFromFallback();
            }
        } else {
            console.warn('[EmailScanner] ⚠️ CategoryManager non disponible, utilisation fallback');
            return this.loadSettingsFromFallback();
        }
    }

    loadSettingsFromFallback() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = JSON.parse(saved);
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[EmailScanner] 📦 Paramètres chargés depuis localStorage');
            } else {
                this.settings = this.getDefaultSettings();
                this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
                console.log('[EmailScanner] 📝 Utilisation paramètres par défaut');
            }
            
            this.lastSettingsSync = Date.now();
            return true;
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur fallback:', error);
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = [];
            return false;
        }
    }

    getDefaultSettings() {
        return {
            scanSettings: {
                defaultPeriod: 7,
                defaultFolder: 'inbox',
                autoAnalyze: true,
                autoCategrize: true
            },
            taskPreselectedCategories: [],
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            },
            activeCategories: null,
            categoryExclusions: {
                domains: [],
                emails: []
            }
        };
    }

    // ================================================
    // MÉTHODES DE MISE À JOUR
    // ================================================
    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        // Mettre à jour dans les settings
        if (!this.settings) this.settings = {};
        this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        
        const hasChanged = JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort());
        
        if (hasChanged && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Changement détecté, re-catégorisation...');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.taskPreselectedCategories;
    }

    updateSettings(newSettings) {
        console.log('[EmailScanner] 📝 Mise à jour des paramètres:', newSettings);
        
        const oldSettings = { ...this.settings };
        this.settings = { ...this.settings, ...newSettings };
        
        // Traitement spécial pour les catégories pré-sélectionnées
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
        
        // Vérifier si re-catégorisation nécessaire
        const criticalChanges = [
            'activeCategories',
            'categoryExclusions',
            'preferences'
        ].some(key => {
            return JSON.stringify(oldSettings[key]) !== JSON.stringify(newSettings[key]);
        });
        
        if (criticalChanges && this.emails.length > 0) {
            console.log('[EmailScanner] 🔄 Changements critiques détectés, re-catégorisation...');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.settings;
    }

    getTaskPreselectedCategories() {
        const now = Date.now();
        const CACHE_DURATION = 30000; // 30 secondes
        
        if (this._categoriesCache && 
            this._categoriesCacheTime && 
            (now - this._categoriesCacheTime) < CACHE_DURATION) {
            return [...this._categoriesCache];
        }
        
        // Synchroniser avec CategoryManager si disponible
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const managerCategories = window.categoryManager.getTaskPreselectedCategories();
            
            this._categoriesCache = [...managerCategories];
            this._categoriesCacheTime = now;
            
            // Mettre à jour locale si différent
            if (JSON.stringify([...this.taskPreselectedCategories].sort()) !== JSON.stringify([...managerCategories].sort())) {
                this.taskPreselectedCategories = [...managerCategories];
            }
            
            return [...managerCategories];
        }
        
        return [...this.taskPreselectedCategories];
    }

    getSettings() {
        return { ...this.settings };
    }

    // ================================================
    // MÉTHODE SCAN PRINCIPALE AVEC MAILSERVICE
    // ================================================
    async scan(options = {}) {
        console.log('[EmailScanner] 🚀 === DÉMARRAGE DU SCAN v11.1 ===');
        
        // Vérifier si CategoryManager est disponible, sinon attendre un peu
        if (!window.categoryManager) {
            console.log('[EmailScanner] ⏳ Attente de CategoryManager...');
            
            // Attendre jusqu'à 3 secondes pour CategoryManager
            let waited = 0;
            while (!window.categoryManager && waited < 3000) {
                await new Promise(resolve => setTimeout(resolve, 100));
                waited += 100;
            }
            
            if (!window.categoryManager) {
                console.warn('[EmailScanner] ⚠️ CategoryManager non disponible après 3s, utilisation mode dégradé');
                // Continuer avec les paramètres par défaut
            } else {
                console.log('[EmailScanner] ✅ CategoryManager trouvé après', waited, 'ms');
                await this.loadSettingsFromCategoryManager();
            }
        }
        
        // Synchronisation pré-scan si CategoryManager est disponible
        if (window.categoryManager && typeof window.categoryManager.getTaskPreselectedCategories === 'function') {
            const freshCategories = window.categoryManager.getTaskPreselectedCategories();
            this.taskPreselectedCategories = [...freshCategories];
            console.log('[EmailScanner] ✅ Catégories synchronisées:', this.taskPreselectedCategories);
        }
        
        // Préparer les options
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            maxEmails: options.maxEmails || 500,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize,
            taskPreselectedCategories: options.taskPreselectedCategories || [...this.taskPreselectedCategories],
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            provider: options.provider || 'microsoft'
        };

        if (this.isScanning) {
            console.warn('[EmailScanner] ⚠️ Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;
            this.scanMetrics.startTime = Date.now();

            console.log('[EmailScanner] 📊 Options de scan:', mergedOptions);
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);

            // Vérifier les services
            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            // Étape 1: Récupérer les emails via MailService
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: 'Récupération des emails...',
                    progress: { current: 0, total: 100 }
                });
            }

            console.log('[EmailScanner] 📧 Récupération des emails via MailService...');
            const emails = await this.fetchEmailsFromMailService(mergedOptions);
            
            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                console.warn('[EmailScanner] ⚠️ Aucun email trouvé');
                return this.buildEmptyResults(mergedOptions);
            }

            // Étape 2: Catégoriser les emails SEULEMENT si CategoryManager est disponible
            if (mergedOptions.autoCategrize && window.categoryManager) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: 'Catégorisation des emails...',
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmails();
            } else if (mergedOptions.autoCategrize && !window.categoryManager) {
                console.warn('[EmailScanner] ⚠️ Catégorisation demandée mais CategoryManager non disponible');
                // Appliquer une catégorisation basique
                this.applyBasicCategorization();
            }

            // Étape 3: Analyser pour les tâches (optionnel)
            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: 'Analyse IA pour les tâches...',
                        progress: { current: 0, total: 10 }
                    });
                }

                await this.analyzeForTasks();
            }

            // Marquer comme synchronisé avec StartScan
            this.startScanSynced = true;

            // Construire les résultats
            const results = this.getDetailedResults(mergedOptions);

            console.log('[EmailScanner] 🎉 === SCAN TERMINÉ ===');
            console.log('[EmailScanner] 📊 Résultats:', {
                total: results.total,
                categorized: results.categorized,
                preselectedForTasks: results.stats.preselectedForTasks
            });

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            // Notifier les autres modules
            setTimeout(() => {
                this.dispatchEvent('scanCompleted', {
                    results,
                    emails: this.emails,
                    breakdown: results.breakdown,
                    taskPreselectedCategories: [...this.taskPreselectedCategories],
                    preselectedCount: results.stats.preselectedForTasks,
                    scanMetrics: this.scanMetrics
                });
            }, 10);

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur de scan:', error);
            
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
    // CATÉGORISATION BASIQUE (FALLBACK)
    // ================================================
    applyBasicCategorization() {
        console.log('[EmailScanner] 🏷️ Application catégorisation basique (mode dégradé)');
        
        this.emails.forEach(email => {
            email.category = 'other';
            email.categoryScore = 0;
            email.categoryConfidence = 0;
            email.matchedPatterns = [];
            email.hasAbsolute = false;
            email.isSpam = false;
            email.isCC = false;
            email.isExcluded = false;
            email.isPreselectedForTasks = false;
            
            // Ajouter à la catégorie 'other'
            if (!this.categorizedEmails.other) {
                this.categorizedEmails.other = [];
            }
            this.categorizedEmails.other.push(email);
        });
        
        this.scanMetrics.categorizedCount = this.emails.length;
        this.scanMetrics.categoryDistribution = { other: this.emails.length };
        this.scanMetrics.preselectedCount = 0;
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS VIA MAILSERVICE - AMÉLIORÉE POUR GMAIL
    // ================================================
    async fetchEmailsFromMailService(options) {
        console.log('[EmailScanner] 📬 Récupération des emails via MailService...');
        
        try {
            // Initialiser MailService si nécessaire
            if (!window.mailService.isInitialized()) {
                console.log('[EmailScanner] 🔧 Initialisation MailService...');
                await window.mailService.initialize();
            }

            // Détecter le provider
            const provider = options.provider || this.detectEmailProvider();
            console.log('[EmailScanner] 📧 Provider détecté:', provider);

            // Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            
            // Si days est -1, récupérer tous les emails (limite raisonnable)
            if (options.days === -1) {
                startDate.setFullYear(endDate.getFullYear() - 5); // 5 ans max
            } else {
                startDate.setDate(endDate.getDate() - options.days);
            }

            // Construire le filtre de date selon le provider
            const dateFilter = this.buildDateFilter(startDate, endDate, provider);

            // Options spécifiques pour Gmail
            const fetchOptions = {
                top: options.maxEmails || 500,
                filter: dateFilter,
                days: options.days === -1 ? 1825 : options.days // 5 ans en jours
            };

            // Pour Gmail, demander les headers supplémentaires
            if (provider === 'gmail') {
                fetchOptions.includeHeaders = true;
                fetchOptions.includeLabels = true;
                fetchOptions.includeCategories = true;
                fetchOptions.maxResults = options.maxEmails || 500; // Gmail utilise maxResults
            }

            // Récupérer les emails via MailService
            const emails = await window.mailService.getMessages(options.folder, fetchOptions);

            // Post-traitement pour Gmail
            if (provider === 'gmail') {
                emails.forEach(email => {
                    this.enrichGmailEmail(email);
                });
            }

            console.log(`[EmailScanner] ✅ ${emails.length} emails récupérés depuis MailService`);
            return emails;

        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur récupération emails:', error);
            throw error;
        }
    }

    detectEmailProvider() {
        // Détecter le provider basé sur les informations disponibles
        if (window.authService && typeof window.authService.getCurrentProvider === 'function') {
            return window.authService.getCurrentProvider();
        }
        
        // Vérifier les indices dans localStorage
        const msalKeys = Object.keys(localStorage).filter(key => key.includes('msal'));
        if (msalKeys.length > 0) {
            return 'microsoft';
        }
        
        const googleKeys = Object.keys(localStorage).filter(key => 
            key.includes('google') || key.includes('gapi') || key.includes('gmail')
        );
        if (googleKeys.length > 0) {
            return 'gmail';
        }
        
        return 'microsoft'; // Par défaut
    }

    enrichGmailEmail(email) {
        // Enrichir l'email avec les données spécifiques Gmail
        
        // 1. Extraire les labels Gmail
        if (email.labelIds) {
            email.gmailLabels = email.labelIds;
            
            // Détecter les catégories Gmail standard
            const categoryLabels = {
                'CATEGORY_PROMOTIONS': 'PROMOTIONS',
                'CATEGORY_SOCIAL': 'SOCIAL',
                'CATEGORY_UPDATES': 'UPDATES',
                'CATEGORY_FORUMS': 'FORUMS',
                'CATEGORY_PERSONAL': 'PERSONAL'
            };
            
            for (const labelId of email.labelIds) {
                if (categoryLabels[labelId]) {
                    email.gmailCategories = categoryLabels[labelId];
                    break;
                }
            }
        }
        
        // 2. Extraire les headers importants
        if (email.payload && email.payload.headers) {
            email.internetMessageHeaders = email.payload.headers.map(header => ({
                name: header.name,
                value: header.value
            }));
            
            // Chercher spécifiquement List-Unsubscribe
            const unsubscribeHeader = email.payload.headers.find(
                h => h.name.toLowerCase() === 'list-unsubscribe' || 
                     h.name.toLowerCase() === 'list-unsubscribe-post'
            );
            
            if (unsubscribeHeader) {
                email.hasUnsubscribeHeader = true;
                email.unsubscribeInfo = unsubscribeHeader.value;
            }
        }
        
        // 3. Normaliser la structure pour CategoryManager
        if (!email.from && email.payload && email.payload.headers) {
            const fromHeader = email.payload.headers.find(h => h.name.toLowerCase() === 'from');
            if (fromHeader) {
                const match = fromHeader.value.match(/^(.*?)\s*<(.+?)>$/);
                if (match) {
                    email.from = {
                        emailAddress: {
                            name: match[1].replace(/"/g, '').trim(),
                            address: match[2]
                        }
                    };
                } else {
                    email.from = {
                        emailAddress: {
                            address: fromHeader.value
                        }
                    };
                }
            }
        }
        
        // 4. Normaliser subject
        if (!email.subject && email.payload && email.payload.headers) {
            const subjectHeader = email.payload.headers.find(h => h.name.toLowerCase() === 'subject');
            if (subjectHeader) {
                email.subject = subjectHeader.value;
            }
        }
        
        // 5. Normaliser body
        if (!email.body && email.payload) {
            email.body = this.extractGmailBody(email.payload);
            email.bodyPreview = email.body?.content?.substring(0, 255) || '';
        }
        
        // 6. Normaliser les destinataires
        if (!email.toRecipients && email.payload && email.payload.headers) {
            const toHeader = email.payload.headers.find(h => h.name.toLowerCase() === 'to');
            if (toHeader) {
                email.toRecipients = this.parseEmailAddresses(toHeader.value);
            }
        }
        
        if (!email.ccRecipients && email.payload && email.payload.headers) {
            const ccHeader = email.payload.headers.find(h => h.name.toLowerCase() === 'cc');
            if (ccHeader) {
                email.ccRecipients = this.parseEmailAddresses(ccHeader.value);
            }
        }
        
        // 7. Normaliser la date
        if (!email.receivedDateTime && email.internalDate) {
            email.receivedDateTime = new Date(parseInt(email.internalDate)).toISOString();
        }
        
        return email;
    }

    extractGmailBody(payload) {
        let textContent = '';
        let htmlContent = '';
        
        const extractParts = (parts) => {
            if (!parts) return;
            
            parts.forEach(part => {
                if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                    textContent += this.decodeBase64(part.body.data) + '\n';
                } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
                    htmlContent += this.decodeBase64(part.body.data);
                } else if (part.parts) {
                    extractParts(part.parts);
                }
            });
        };
        
        if (payload.parts) {
            extractParts(payload.parts);
        } else if (payload.body && payload.body.data) {
            const content = this.decodeBase64(payload.body.data);
            if (payload.mimeType === 'text/html') {
                htmlContent = content;
            } else {
                textContent = content;
            }
        }
        
        return {
            content: htmlContent || textContent,
            contentType: htmlContent ? 'html' : 'text'
        };
    }

    decodeBase64(data) {
        try {
            // Gmail utilise base64url, convertir en base64 standard
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            return decodeURIComponent(escape(atob(base64)));
        } catch (e) {
            console.error('[EmailScanner] Erreur décodage base64:', e);
            return '';
        }
    }

    parseEmailAddresses(addressString) {
        if (!addressString) return [];
        
        const addresses = [];
        const regex = /(?:"?([^"]*)"?\s*)?<?([^<>]+@[^<>]+)>?/g;
        let match;
        
        while ((match = regex.exec(addressString)) !== null) {
            addresses.push({
                emailAddress: {
                    name: match[1]?.trim() || '',
                    address: match[2].trim()
                }
            });
        }
        
        return addresses;
    }

    buildDateFilter(startDate, endDate, provider) {
        if (provider === 'microsoft' || provider === 'outlook') {
            return `receivedDateTime ge ${startDate.toISOString()} and receivedDateTime le ${endDate.toISOString()}`;
        } else if (provider === 'gmail') {
            // Format Gmail: after:2024/12/01 before:2024/12/31
            const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '/');
            const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '/');
            return `after:${startStr} before:${endStr}`;
        } else {
            // Format générique
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            return `after:${startStr} before:${endStr}`;
        }
    }

    // ================================================
    // CATÉGORISATION DES EMAILS - AMÉLIORÉE
    // ================================================
    async categorizeEmails(overridePreselectedCategories = null) {
        // Vérifier si CategoryManager est disponible
        if (!window.categoryManager) {
            console.warn('[EmailScanner] ⚠️ CategoryManager non disponible pour la catégorisation');
            this.applyBasicCategorization();
            return;
        }
        
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        const taskPreselectedCategories = overridePreselectedCategories || this.taskPreselectedCategories || [];
        
        console.log('[EmailScanner] 🏷️ === DÉBUT CATÉGORISATION ===');
        console.log('[EmailScanner] 📊 Total emails:', total);
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', taskPreselectedCategories);

        const categoryStats = {};
        const preselectedStats = {};
        const providerStats = { gmail: 0, microsoft: 0, other: 0 };
        
        // Initialiser les statistiques
        taskPreselectedCategories.forEach(catId => {
            preselectedStats[catId] = 0;
        });

        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // Détecter le provider de l'email
                    const emailProvider = this.detectEmailProviderFromEmail(email);
                    email.provider = emailProvider;
                    providerStats[emailProvider] = (providerStats[emailProvider] || 0) + 1;
                    
                    // Pré-traitement pour Gmail si nécessaire
                    if (emailProvider === 'gmail' && !email.normalized) {
                        this.enrichGmailEmail(email);
                        email.normalized = true;
                    }
                    
                    // Analyser l'email avec CategoryManager
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    // Appliquer les résultats
                    const finalCategory = analysis.category || 'other';
                    email.category = finalCategory;
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    email.isExcluded = analysis.isExcluded || false;
                    email.gmailUnsubscribe = analysis.gmailUnsubscribe || false;
                    
                    // Marquer comme pré-sélectionné pour les tâches
                    email.isPreselectedForTasks = taskPreselectedCategories.includes(finalCategory);
                    
                    if (email.isPreselectedForTasks) {
                        preselectedStats[finalCategory] = (preselectedStats[finalCategory] || 0) + 1;
                    }
                    
                    // Ajouter à la catégorie
                    if (!this.categorizedEmails[finalCategory]) {
                        this.categorizedEmails[finalCategory] = [];
                    }
                    this.categorizedEmails[finalCategory].push(email);
                    
                    categoryStats[finalCategory] = (categoryStats[finalCategory] || 0) + 1;

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation:', error);
                    
                    // Valeurs par défaut
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    email.categoryScore = 0;
                    email.categoryConfidence = 0;
                    email.matchedPatterns = [];
                    
                    if (!this.categorizedEmails.other) {
                        this.categorizedEmails.other = [];
                    }
                    this.categorizedEmails.other.push(email);
                    categoryStats.other = (categoryStats.other || 0) + 1;
                    errors++;
                }

                processed++;
            }

            // Mettre à jour le progrès
            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            // Pause courte pour éviter le blocage
            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        this.scanMetrics.categorizedCount = processed;
        this.scanMetrics.categoryDistribution = categoryStats;
        this.scanMetrics.preselectedCount = preselectedCount;
        this.scanMetrics.preselectedStats = preselectedStats;
        this.scanMetrics.errors = errors;
        this.scanMetrics.providerStats = providerStats;
        
        console.log('[EmailScanner] ✅ === CATÉGORISATION TERMINÉE ===');
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] ⭐ Total pré-sélectionnés:', preselectedCount);
        console.log('[EmailScanner] 📧 Providers:', providerStats);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors);
        
        // Log des pré-sélectionnés par catégorie
        Object.entries(preselectedStats).forEach(([catId, count]) => {
            if (count > 0) {
                console.log(`[EmailScanner] ⭐ ${catId}: ${count} emails pré-sélectionnés`);
            }
        });
        
        // Log des emails Gmail avec bouton désabonnement
        const gmailUnsubscribeCount = this.emails.filter(e => e.gmailUnsubscribe).length;
        if (gmailUnsubscribeCount > 0) {
            console.log(`[EmailScanner] 🔔 Gmail unsubscribe: ${gmailUnsubscribeCount} emails avec bouton désabonnement`);
        }
    }

    detectEmailProviderFromEmail(email) {
        // Détecter basé sur la structure de l'email
        if (email.id && email.id.includes('-')) {
            // IDs Microsoft ont des tirets
            return 'microsoft';
        } else if (email.id && /^[a-f0-9]{16}$/.test(email.id)) {
            // IDs Gmail sont hexadécimaux
            return 'gmail';
        } else if (email.labelIds || email.payload || email.gmailCategories) {
            // Propriétés spécifiques Gmail
            return 'gmail';
        } else if (email.parentFolderId || email.categories) {
            // Propriétés spécifiques Microsoft
            return 'microsoft';
        }
        
        return 'other';
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] ⚠️ AITaskAnalyzer non disponible');
            return;
        }

        // Priorité aux emails pré-sélectionnés
        const preselectedEmails = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).sort((a, b) => b.categoryConfidence - a.categoryConfidence);
        
        // Autres emails avec haute confiance
        const additionalEmails = this.emails.filter(email => 
            !email.isPreselectedForTasks && 
            email.categoryConfidence > 0.8
        ).slice(0, Math.max(0, 10 - preselectedEmails.length));
        
        const emailsToAnalyze = [...preselectedEmails.slice(0, 10), ...additionalEmails];

        console.log(`[EmailScanner] 🤖 Analyse IA de ${emailsToAnalyze.length} emails`);
        console.log(`[EmailScanner] ⭐ Dont ${emailsToAnalyze.filter(e => e.isPreselectedForTasks).length} pré-sélectionnés`);

        for (let i = 0; i < emailsToAnalyze.length; i++) {
            const email = emailsToAnalyze[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA: ${i + 1}/${emailsToAnalyze.length}`,
                        progress: { current: i + 1, total: emailsToAnalyze.length }
                    });
                }
                
                if (i < emailsToAnalyze.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error('[EmailScanner] ❌ Erreur analyse IA:', error);
                email.aiAnalysisError = error.message;
            }
        }

        const totalSuggested = this.emails.filter(e => e.taskSuggested).length;
        const preselectedSuggested = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;

        console.log('[EmailScanner] ✅ Analyse IA terminée');
        console.log('[EmailScanner] 📊 Tâches suggérées:', totalSuggested);
        console.log('[EmailScanner] ⭐ Dont pré-sélectionnées:', preselectedSuggested);
    }

    // ================================================
    // CONSTRUCTION DES RÉSULTATS
    // ================================================
    buildEmptyResults(options) {
        return {
            success: true,
            total: 0,
            categorized: 0,
            breakdown: {},
            stats: { 
                processed: 0, 
                errors: 0,
                preselectedForTasks: 0,
                highConfidence: 0,
                taskSuggestions: 0
            },
            emails: [],
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            scanMetrics: this.scanMetrics,
            provider: options.provider
        };
    }

    getDetailedResults(options = {}) {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithTasks = 0;
        let totalPreselected = 0;
        let totalSpam = 0;
        let totalExcluded = 0;

        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId === 'spam') {
                totalSpam += emails.length;
            } else if (catId === 'excluded') {
                totalExcluded += emails.length;
            } else if (catId !== 'other') {
                totalCategorized += emails.length;
            }
            
            emails.forEach(email => {
                if (email.categoryConfidence >= 0.8) {
                    totalWithHighConfidence++;
                }
                if (email.taskSuggested) {
                    totalWithTasks++;
                }
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
                highConfidence: totalWithHighConfidence,
                taskSuggestions: totalWithTasks,
                preselectedForTasks: totalPreselected,
                spamFiltered: totalSpam,
                excluded: totalExcluded,
                scanDuration: scanDuration
            },
            emails: this.emails,
            settings: this.settings,
            scanMetrics: this.scanMetrics,
            provider: options.provider,
            startScanSynced: this.startScanSynced
        };
    }

    // ================================================
    // RE-CATÉGORISATION
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] ⚠️ Aucun email à recatégoriser');
            return;
        }
        
        if (!window.categoryManager) {
            console.warn('[EmailScanner] ⚠️ CategoryManager non disponible pour recatégorisation');
            return;
        }

        console.log('[EmailScanner] 🔄 === DÉBUT RE-CATÉGORISATION ===');
        console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        // Réinitialiser les métriques
        this.scanMetrics.startTime = Date.now();
        this.scanMetrics.categorizedCount = 0;
        this.scanMetrics.categoryDistribution = {};
        
        // Vider les catégories actuelles
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        // Recatégoriser tous les emails
        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Re-catégorisation terminée');
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getDetailedResults().breakdown,
                taskPreselectedCategories: this.taskPreselectedCategories,
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length,
                scanMetrics: this.scanMetrics
            });
        }, 10);
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES
    // ================================================
    getAllEmails() {
        return [...this.emails];
    }

    getEmails() {
        return this.getAllEmails();
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

    getEmailsWithTaskSuggestions() {
        return this.emails.filter(email => email.taskSuggested);
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    getCategorizedEmails() {
        return { ...this.categorizedEmails };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    reset() {
        console.log('[EmailScanner] 🔄 Réinitialisation...');
        
        this.emails = [];
        this.categorizedEmails = {};
        
        this.scanMetrics = {
            startTime: Date.now(),
            categorizedCount: 0,
            keywordMatches: {},
            categoryDistribution: {},
            preselectedCount: 0
        };
        
        // Initialiser avec toutes les catégories si CategoryManager disponible
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        // Catégories spéciales
        ['other', 'excluded', 'spam', 'personal'].forEach(catId => {
            if (!this.categorizedEmails[catId]) {
                this.categorizedEmails[catId] = [];
            }
        });
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée');
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'EmailScanner',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`[EmailScanner] ❌ Erreur dispatch ${eventName}:`, error);
        }
    }

    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        // Écouter les événements externes
        this.keywordsUpdateHandler = (event) => {
            console.log('[EmailScanner] 🔑 Mots-clés mis à jour:', event.detail.categoryId);
            if (this.emails.length > 0 && window.categoryManager) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 200);
            }
        };

        this.forceSyncHandler = (event) => {
            if (event.detail?.source === 'EmailScanner') {
                return;
            }
            
            console.log('[EmailScanner] 🚀 Synchronisation forcée demandée');
            this.forceSettingsReload();
            
            if (this.emails.length > 0 && window.categoryManager) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 100);
            }
        };

        window.addEventListener('keywordsUpdated', this.keywordsUpdateHandler);
        window.addEventListener('forceSynchronization', this.forceSyncHandler);
        
        this.eventListenersSetup = true;
        console.log('[EmailScanner] ✅ Event listeners configurés');
    }

    forceSettingsReload() {
        console.log('[EmailScanner] 🔄 === RECHARGEMENT FORCÉ DES PARAMÈTRES ===');
        
        return this.loadSettingsFromCategoryManager().then(() => {
            console.log('[EmailScanner] ✅ Rechargement terminé');
            console.log('[EmailScanner] ⭐ Catégories pré-sélectionnées:', this.taskPreselectedCategories);
            
            setTimeout(() => {
                this.dispatchEvent('emailScannerSettingsReloaded', {
                    settings: this.settings,
                    taskPreselectedCategories: this.taskPreselectedCategories
                });
            }, 10);
            
            return this.settings;
        });
    }

    // ================================================
    // MÉTHODES D'EXPORT
    // ================================================
    exportToJSON() {
        const data = {
            scanDate: new Date().toISOString(),
            totalEmails: this.emails.length,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: this.getDetailedResults().stats,
            settings: this.settings,
            scanMetrics: this.scanMetrics,
            categories: {},
            emails: []
        };

        // Ajouter le résumé par catégorie
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            const categoryInfo = window.categoryManager?.getCategory(catId) || 
                { name: catId, icon: '📂' };
            
            const preselectedInCategory = emails.filter(e => e.isPreselectedForTasks).length;
            
            data.categories[catId] = {
                name: categoryInfo.name,
                icon: categoryInfo.icon,
                count: emails.length,
                percentage: Math.round((emails.length / this.emails.length) * 100),
                preselectedCount: preselectedInCategory,
                isPreselectedCategory: this.taskPreselectedCategories.includes(catId)
            };
        });

        // Ajouter les détails des emails
        data.emails = this.emails.map(email => ({
            id: email.id,
            date: email.receivedDateTime,
            from: {
                name: email.from?.emailAddress?.name,
                email: email.from?.emailAddress?.address
            },
            subject: email.subject,
            category: email.category,
            confidence: email.categoryConfidence,
            score: email.categoryScore,
            taskSuggested: email.taskSuggested,
            isPreselectedForTasks: email.isPreselectedForTasks,
            isSpam: email.isSpam,
            isExcluded: email.isExcluded,
            patterns: email.matchedPatterns?.map(p => ({
                type: p.type,
                keyword: p.keyword,
                score: p.score
            })),
            aiAnalysis: email.aiAnalysis ? {
                summary: email.aiAnalysis.summary,
                importance: email.aiAnalysis.importance,
                hasTask: !!email.aiAnalysis.mainTask
            } : null
        }));

        return JSON.stringify(data, null, 2);
    }

    exportToCSV() {
        const rows = [
            ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Tâche Suggérée', 'Pré-sélectionné', 'Spam', 'Exclus']
        ];

        this.emails.forEach(email => {
            const categoryInfo = window.categoryManager?.getCategory(email.category) || 
                { name: email.category || 'other' };
            
            rows.push([
                new Date(email.receivedDateTime).toLocaleString('fr-FR'),
                email.from?.emailAddress?.name || '',
                email.from?.emailAddress?.address || '',
                email.subject || 'Sans sujet',
                categoryInfo.name,
                Math.round((email.categoryConfidence || 0) * 100) + '%',
                email.categoryScore || 0,
                email.taskSuggested ? 'Oui' : 'Non',
                email.isPreselectedForTasks ? 'Oui' : 'Non',
                email.isSpam ? 'Oui' : 'Non',
                email.isExcluded ? 'Oui' : 'Non'
            ]);
        });

        const csv = rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        return '\ufeff' + csv;
    }

    exportResults(format = 'csv') {
        console.log('[EmailScanner] 📤 Export des résultats en', format);
        
        if (this.emails.length === 0) {
            if (window.uiManager) {
                window.uiManager.showToast('Aucune donnée à exporter', 'warning');
            }
            return;
        }

        try {
            let content, filename, mimeType;

            if (format === 'csv') {
                content = this.exportToCSV();
                filename = `email_scan_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv;charset=utf-8;';
            } else {
                content = this.exportToJSON();
                filename = `email_scan_${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json;charset=utf-8;';
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            if (window.uiManager) {
                window.uiManager.showToast(`${this.emails.length} emails exportés`, 'success');
            }
            
        } catch (error) {
            console.error('[EmailScanner] ❌ Erreur export:', error);
            if (window.uiManager) {
                window.uiManager.showToast('Erreur lors de l\'export', 'error');
            }
        }
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    getDebugInfo() {
        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        const preselectedWithTasks = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;
        const gmailEmails = this.emails.filter(e => e.provider === 'gmail').length;
        const gmailUnsubscribe = this.emails.filter(e => e.gmailUnsubscribe).length;
        
        return {
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: Object.values(this.categorizedEmails)
                .reduce((sum, emails) => sum + emails.length, 0),
            categories: Object.keys(this.categorizedEmails)
                .filter(cat => this.categorizedEmails[cat].length > 0),
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            preselectedEmailsCount: preselectedCount,
            preselectedWithTasksCount: preselectedWithTasks,
            gmailEmailsCount: gmailEmails,
            gmailUnsubscribeCount: gmailUnsubscribe,
            providerStats: this.scanMetrics.providerStats || {},
            settings: this.settings,
            hasTaskSuggestions: this.emails.filter(e => e.taskSuggested).length,
            categoryManagerAvailable: !!window.categoryManager,
            mailServiceAvailable: !!window.mailService,
            aiTaskAnalyzerAvailable: !!window.aiTaskAnalyzer,
            lastSettingsSync: this.lastSettingsSync,
            syncInterval: !!this.syncInterval,
            scanMetrics: this.scanMetrics,
            startScanSynced: this.startScanSynced,
            changeListener: !!this.changeListener,
            version: '11.1'
        };
    }

    testCategorization(emailSample) {
        console.log('[EmailScanner] 🧪 === TEST CATEGORISATION ===');
        
        if (!window.categoryManager) {
            console.error('[EmailScanner] ❌ CategoryManager non disponible');
            return null;
        }
        
        // Simuler enrichissement Gmail si nécessaire
        if (!emailSample.from && emailSample.sender) {
            emailSample.from = { emailAddress: { address: emailSample.sender } };
        }
        
        const result = window.categoryManager.analyzeEmail(emailSample);
        const isPreselected = this.taskPreselectedCategories.includes(result.category);
        
        console.log('Email:', emailSample.subject);
        console.log('Provider:', this.detectEmailProviderFromEmail(emailSample));
        console.log('Résultat:', result.category);
        console.log('Score:', result.score);
        console.log('Confiance:', Math.round(result.confidence * 100) + '%');
        console.log('Patterns:', result.matchedPatterns);
        console.log('Gmail Unsubscribe:', result.gmailUnsubscribe ? '✅' : '❌');
        console.log('Pré-sélectionné:', isPreselected ? '⭐ OUI' : '❌ NON');
        console.log('============================');
        
        return { ...result, isPreselectedForTasks: isPreselected };
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        console.log('[EmailScanner] 🧹 Nettoyage des données...');
        
        // Arrêter le monitoring de synchronisation
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Nettoyer le listener CategoryManager
        if (this.changeListener && typeof this.changeListener === 'function') {
            this.changeListener();
            this.changeListener = null;
        }
        
        // Nettoyer les event listeners
        if (this.keywordsUpdateHandler) {
            window.removeEventListener('keywordsUpdated', this.keywordsUpdateHandler);
        }
        if (this.forceSyncHandler) {
            window.removeEventListener('forceSynchronization', this.forceSyncHandler);
        }
        this.eventListenersSetup = false;
        
        // Nettoyer les données
        this.emails = [];
        this.categorizedEmails = {};
        this.taskPreselectedCategories = [];
        this.scanProgress = null;
        this.scanMetrics = { 
            startTime: null, 
            categorizedCount: 0, 
            keywordMatches: {}, 
            categoryDistribution: {},
            preselectedCount: 0
        };
        
        console.log('[EmailScanner] ✅ Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        this.isScanning = false;
        this.startScanSynced = false;
        console.log('[EmailScanner] ❌ Instance détruite');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
    window.emailScanner.destroy?.();
}

console.log('[EmailScanner] 🚀 Création nouvelle instance v11.1...');
window.emailScanner = new EmailScanner();

// ================================================
// FONCTIONS UTILITAIRES GLOBALES - AMÉLIORÉES
// ================================================
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v11.1');
    
    const testEmails = [
        {
            subject: "Newsletter hebdomadaire - Désabonnez-vous ici",
            from: { emailAddress: { address: "newsletter@example.com", name: "Example News" } },
            bodyPreview: "Voici votre newsletter avec un lien pour vous désinscrire",
            receivedDateTime: new Date().toISOString()
        },
        {
            subject: "Action requise: Confirmer votre commande urgent",
            from: { emailAddress: { address: "orders@shop.com", name: "Shop Orders" } },
            bodyPreview: "Veuillez compléter votre commande dans les plus brefs délais",
            receivedDateTime: new Date().toISOString()
        },
        {
            subject: "Offre d'emploi: Développeur Senior",
            from: { emailAddress: { address: "recrutement@entreprise.com", name: "RH Entreprise" } },
            bodyPreview: "Nous recherchons un développeur senior pour rejoindre notre équipe",
            receivedDateTime: new Date().toISOString()
        },
        {
            subject: "Test Gmail avec headers",
            from: { emailAddress: { address: "promo@company.com", name: "Company Promo" } },
            internetMessageHeaders: [
                { name: "List-Unsubscribe", value: "<mailto:unsubscribe@company.com>" }
            ],
            gmailCategories: "PROMOTIONS",
            receivedDateTime: new Date().toISOString()
        }
    ];
    
    testEmails.forEach(email => {
        window.emailScanner.testCategorization(email);
    });
    
    console.log('Debug Info:', window.emailScanner.getDebugInfo());
    console.log('Catégories pré-sélectionnées:', window.emailScanner.getTaskPreselectedCategories());
    
    console.groupEnd();
    return { success: true, testsRun: testEmails.length };
};

window.debugEmailCategories = function() {
    console.group('📊 DEBUG Catégories v11.1');
    console.log('Settings:', window.emailScanner.settings);
    console.log('Task Preselected Categories:', window.emailScanner.taskPreselectedCategories);
    console.log('Emails total:', window.emailScanner.emails.length);
    console.log('Emails pré-sélectionnés:', window.emailScanner.getPreselectedEmails().length);
    console.log('Breakdown:', window.emailScanner.getDetailedResults().breakdown);
    console.log('Debug complet:', window.emailScanner.getDebugInfo());
    
    // Stats par provider
    const providerStats = {};
    window.emailScanner.emails.forEach(email => {
        const provider = email.provider || 'unknown';
        providerStats[provider] = (providerStats[provider] || 0) + 1;
    });
    console.log('Emails par provider:', providerStats);
    
    // Stats Gmail unsubscribe
    const gmailUnsubscribe = window.emailScanner.emails.filter(e => e.gmailUnsubscribe);
    console.log('Gmail unsubscribe:', gmailUnsubscribe.length);
    
    console.groupEnd();
};

window.testGmailCompatibility = function() {
    console.group('🧪 TEST Compatibilité Gmail');
    
    const gmailEmail = {
        id: '1234567890abcdef',
        labelIds: ['INBOX', 'CATEGORY_PROMOTIONS'],
        payload: {
            headers: [
                { name: 'From', value: 'Recrutement HR <hr@company.com>' },
                { name: 'Subject', value: 'Votre candidature a été retenue' },
                { name: 'To', value: 'user@gmail.com' },
                { name: 'List-Unsubscribe', value: '<mailto:unsubscribe@company.com>' }
            ],
            parts: [{
                mimeType: 'text/plain',
                body: {
                    data: btoa('Nous avons le plaisir de vous informer que votre CV a retenu notre attention pour le poste de développeur.')
                }
            }]
        },
        internalDate: Date.now().toString()
    };
    
    // Enrichir l'email
    window.emailScanner.enrichGmailEmail(gmailEmail);
    console.log('Email enrichi:', gmailEmail);
    
    // Tester la catégorisation
    const result = window.emailScanner.testCategorization(gmailEmail);
    console.log('Résultat catégorisation:', result);
    
    console.groupEnd();
    return { success: true, email: gmailEmail, result };
};

window.testEmailScannerSync = function() {
    console.group('🔄 TEST SYNCHRONISATION EmailScanner');
    
    const debugInfo = window.emailScanner.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    
    // Forcer synchronisation
    window.emailScanner.forceSettingsReload();
    
    setTimeout(() => {
        const newDebugInfo = window.emailScanner.getDebugInfo();
        console.log('Après sync:', newDebugInfo);
        console.groupEnd();
    }, 500);
    
    return debugInfo;
};

window.forceEmailScannerSync = function() {
    window.emailScanner.forceSettingsReload();
    if (window.emailScanner.emails.length > 0) {
        window.emailScanner.recategorizeEmails();
    }
    return { success: true, message: 'Synchronisation EmailScanner forcée' };
};

console.log('✅ EmailScanner v11.1 loaded - Correction compatibilité et gestion CategoryManager!');
