// EmailScanner.js - Version 5.2 - Synchronisation temps réel fixée

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.settings = {};
        this.eventListenersSetup = false;
        
        // NOUVEAU: Gestion de la synchronisation temps réel
        this.lastSettingsSync = 0;
        this.syncInterval = null;
        this.taskPreselectedCategories = [];
        
        // Initialiser avec les paramètres du CategoryManager
        this.loadSettingsFromCategoryManager();
        this.setupEventListeners();
        this.startSyncMonitoring();
        
        console.log('[EmailScanner] ✅ Version 5.2 - Synchronisation temps réel fixée');
    }

    // ================================================
    // SURVEILLANCE DE SYNCHRONISATION - NOUVEAU
    // ================================================
    startSyncMonitoring() {
        // Vérifier la synchronisation toutes les 3 secondes
        this.syncInterval = setInterval(() => {
            this.checkSettingsSync();
        }, 3000);
    }

    checkSettingsSync() {
        const now = Date.now();
        if (now - this.lastSettingsSync < 2000) return; // Éviter les vérifications trop fréquentes
        
        this.lastSettingsSync = now;
        
        try {
            // Vérifier si les paramètres ont changé
            const currentSettings = this.getCurrentSettingsFromSource();
            const settingsChanged = this.hasSettingsChanged(currentSettings);
            
            if (settingsChanged) {
                console.log('[EmailScanner] 🔄 Changement de paramètres détecté, synchronisation...');
                this.synchronizeSettings(currentSettings);
            }
        } catch (error) {
            console.error('[EmailScanner] Erreur vérification sync:', error);
        }
    }

    getCurrentSettingsFromSource() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            return window.categoryManager.getSettings();
        }
        
        // Fallback localStorage
        try {
            return JSON.parse(localStorage.getItem('categorySettings') || '{}');
        } catch (error) {
            console.error('[EmailScanner] Erreur lecture settings:', error);
            return this.getDefaultSettings();
        }
    }

    hasSettingsChanged(newSettings) {
        // Comparer les paramètres critiques
        const currentTaskPreselected = this.taskPreselectedCategories || [];
        const newTaskPreselected = newSettings.taskPreselectedCategories || [];
        
        const currentStr = JSON.stringify([...currentTaskPreselected].sort());
        const newStr = JSON.stringify([...newTaskPreselected].sort());
        
        if (currentStr !== newStr) {
            console.log('[EmailScanner] 📋 Changement catégories pré-sélectionnées détecté');
            console.log('  - Ancien:', currentTaskPreselected);
            console.log('  - Nouveau:', newTaskPreselected);
            return true;
        }
        
        // Vérifier d'autres paramètres critiques
        const criticalSettings = ['scanSettings', 'preferences'];
        for (const key of criticalSettings) {
            const currentValue = JSON.stringify(this.settings[key] || {});
            const newValue = JSON.stringify(newSettings[key] || {});
            if (currentValue !== newValue) {
                console.log(`[EmailScanner] 🔧 Changement ${key} détecté`);
                return true;
            }
        }
        
        return false;
    }

    synchronizeSettings(newSettings) {
        console.log('[EmailScanner] 🚀 === SYNCHRONISATION PARAMÈTRES ===');
        
        // Sauvegarder les anciens paramètres pour comparaison
        const oldTaskPreselected = [...(this.taskPreselectedCategories || [])];
        
        // Mettre à jour les paramètres
        this.settings = { ...this.settings, ...newSettings };
        this.taskPreselectedCategories = newSettings.taskPreselectedCategories || [];
        
        console.log('[EmailScanner] 📊 Paramètres synchronisés:');
        console.log('  - Anciennes catégories pré-sélectionnées:', oldTaskPreselected);
        console.log('  - Nouvelles catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        // Si les catégories pré-sélectionnées ont changé et qu'on a des emails
        if (JSON.stringify(oldTaskPreselected.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort())) {
            if (this.emails.length > 0) {
                console.log('[EmailScanner] 🔄 Déclenchement re-catégorisation auto');
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 100);
            }
        }
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailScannerSynced', {
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories
            });
        }, 10);
        
        console.log('[EmailScanner] ✅ Synchronisation terminée');
    }

    // ================================================
    // SYNCHRONISATION AVEC CATEGORYMANAGER - AMÉLIORÉE
    // ================================================
    loadSettingsFromCategoryManager() {
        if (window.categoryManager && typeof window.categoryManager.getSettings === 'function') {
            this.settings = window.categoryManager.getSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
            console.log('[EmailScanner] Paramètres chargés depuis CategoryManager:', this.settings);
            console.log('[EmailScanner] Catégories pré-sélectionnées:', this.taskPreselectedCategories);
        } else {
            console.warn('[EmailScanner] CategoryManager non disponible, utilisation paramètres par défaut');
            this.settings = this.getDefaultSettings();
            this.taskPreselectedCategories = this.settings.taskPreselectedCategories || [];
        }
    }

    // ================================================
    // NOUVELLES MÉTHODES DE MISE À JOUR DIRECTE
    // ================================================
    updateTaskPreselectedCategories(categories) {
        console.log('[EmailScanner] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const oldCategories = [...(this.taskPreselectedCategories || [])];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        
        // Mettre à jour dans les settings généraux
        if (!this.settings) this.settings = {};
        this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        
        console.log('[EmailScanner] 📊 Changement catégories:');
        console.log('  - Anciennes:', oldCategories);
        console.log('  - Nouvelles:', this.taskPreselectedCategories);
        
        // Si on a des emails et que les catégories ont changé, re-catégoriser
        if (this.emails.length > 0 && JSON.stringify(oldCategories.sort()) !== JSON.stringify([...this.taskPreselectedCategories].sort())) {
            console.log('[EmailScanner] 🔄 Re-catégorisation nécessaire');
            setTimeout(() => {
                this.recategorizeEmails();
            }, 100);
        }
        
        return this.taskPreselectedCategories;
    }

    getTaskPreselectedCategories() {
        return [...(this.taskPreselectedCategories || [])];
    }

    forceSettingsReload() {
        console.log('[EmailScanner] 🔄 Rechargement forcé des paramètres');
        this.loadSettingsFromCategoryManager();
        
        // Notifier le changement
        setTimeout(() => {
            this.dispatchEvent('emailScannerSettingsReloaded', {
                settings: this.settings,
                taskPreselectedCategories: this.taskPreselectedCategories
            });
        }, 10);
    }

    // ================================================
    // GESTION DES ÉVÉNEMENTS - AMÉLIORÉE
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) {
            return; // Éviter les doublons
        }

        // Handlers pour éviter les fuites mémoire
        this.settingsChangeHandler = (event) => {
            console.log('[EmailScanner] 📨 Événement categorySettingsChanged reçu:', event.detail);
            if (event.detail && event.detail.settings) {
                this.synchronizeSettings(event.detail.settings);
            } else {
                // Fallback: recharger depuis la source
                this.forceSettingsReload();
            }
        };

        this.generalSettingsChangeHandler = (event) => {
            console.log('[EmailScanner] 📨 Événement settingsChanged reçu:', event.detail);
            const { type, value } = event.detail;
            
            switch (type) {
                case 'taskPreselectedCategories':
                    this.updateTaskPreselectedCategories(value);
                    break;
                case 'scanSettings':
                    if (this.settings) {
                        this.settings.scanSettings = { ...this.settings.scanSettings, ...value };
                    }
                    break;
                case 'preferences':
                    if (this.settings) {
                        this.settings.preferences = { ...this.settings.preferences, ...value };
                    }
                    break;
                default:
                    // Pour tout autre changement, recharger complètement
                    this.forceSettingsReload();
            }
        };

        // Nouvel événement pour synchronisation forcée
        this.forceSyncHandler = (event) => {
            console.log('[EmailScanner] 🚀 Synchronisation forcée demandée');
            this.forceSettingsReload();
            
            if (this.emails.length > 0) {
                setTimeout(() => {
                    this.recategorizeEmails();
                }, 100);
            }
        };

        // Ajouter les listeners
        window.addEventListener('categorySettingsChanged', this.settingsChangeHandler);
        window.addEventListener('settingsChanged', this.generalSettingsChangeHandler);
        window.addEventListener('forceSynchronization', this.forceSyncHandler);
        
        this.eventListenersSetup = true;
        console.log('[EmailScanner] Event listeners configurés avec synchronisation temps réel');
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE SCAN - AVEC SYNCHRONISATION
    // ================================================
    async scan(options = {}) {
        // FORCER la synchronisation avant le scan
        this.forceSettingsReload();
        
        // Merger les options avec les paramètres sauvegardés
        const scanSettings = this.settings.scanSettings || {};
        const mergedOptions = {
            days: options.days || scanSettings.defaultPeriod || 7,
            folder: options.folder || scanSettings.defaultFolder || 'inbox',
            onProgress: options.onProgress || null,
            includeSpam: options.includeSpam !== undefined ? options.includeSpam : !this.settings.preferences?.excludeSpam,
            maxEmails: options.maxEmails || 1000,
            autoAnalyze: options.autoAnalyze !== undefined ? options.autoAnalyze : scanSettings.autoAnalyze,
            autoCategrize: options.autoCategrize !== undefined ? options.autoCategrize : scanSettings.autoCategrize
        };

        if (this.isScanning) {
            console.warn('[EmailScanner] Scan déjà en cours');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = mergedOptions.onProgress;

            console.log('[EmailScanner] 🚀 Démarrage du scan avec options synchronisées:', mergedOptions);
            console.log('[EmailScanner] 📋 Catégories pré-sélectionnées actuelles:', this.taskPreselectedCategories);

            // Vérifier les services requis
            if (!window.mailService) {
                throw new Error('MailService non disponible');
            }

            if (!window.categoryManager) {
                throw new Error('CategoryManager non disponible');
            }

            // Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - mergedOptions.days);

            // Étape 1: Récupération des emails
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: `Récupération des emails des ${mergedOptions.days} derniers jours...`,
                    progress: { current: 0, total: 100 }
                });
            }

            console.log('[EmailScanner] 📧 Récupération des emails du dossier:', mergedOptions.folder);

            // Utiliser la bonne méthode du MailService
            let emails;
            if (typeof window.mailService.getEmailsFromFolder === 'function') {
                emails = await window.mailService.getEmailsFromFolder(mergedOptions.folder, {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    top: mergedOptions.maxEmails
                });
            } else if (typeof window.mailService.getEmails === 'function') {
                emails = await window.mailService.getEmails({
                    folder: mergedOptions.folder,
                    days: mergedOptions.days,
                    maxEmails: mergedOptions.maxEmails
                });
            } else {
                throw new Error('Aucune méthode de récupération d\'emails disponible dans MailService');
            }

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ ${this.emails.length} emails récupérés`);

            if (this.emails.length === 0) {
                console.warn('[EmailScanner] Aucun email trouvé dans la période spécifiée');
                return {
                    success: true,
                    total: 0,
                    categorized: 0,
                    breakdown: {},
                    stats: { processed: 0, errors: 0 },
                    emails: [],
                    taskPreselectedCategories: this.taskPreselectedCategories
                };
            }

            // Étape 2: Catégorisation automatique si activée
            if (mergedOptions.autoCategrize) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'categorizing',
                        message: 'Catégorisation intelligente des emails...',
                        progress: { current: 0, total: this.emails.length }
                    });
                }

                await this.categorizeEmails();
            }

            // Étape 3: Analyse IA si activée
            if (mergedOptions.autoAnalyze && window.aiTaskAnalyzer) {
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: 'Analyse IA pour la création de tâches...',
                        progress: { current: 0, total: Math.min(this.emails.length, 10) }
                    });
                }

                await this.analyzeForTasks();
            }

            // Étape 4: Calcul des résultats
            const results = this.getDetailedResults();

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            this.logScanResults(results);
            
            // Notifier les autres modules
            setTimeout(() => {
                this.dispatchEvent('scanCompleted', {
                    results,
                    emails: this.emails,
                    breakdown: results.breakdown,
                    taskPreselectedCategories: this.taskPreselectedCategories
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
    // CATÉGORISATION AVEC PRISE EN COMPTE PRÉ-SÉLECTION
    // ================================================
    async categorizeEmails() {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        console.log('[EmailScanner] 🏷️ Catégorisation de', total, 'emails avec CategoryManager');
        console.log('[EmailScanner] 📋 Catégories pré-sélectionnées pour tâches:', this.taskPreselectedCategories);

        const categoryStats = {};
        const categories = window.categoryManager.getCategories();
        
        // Initialiser les stats
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
        });
        categoryStats.other = 0;

        // Analyser chaque email avec traitement par lots pour les performances
        const batchSize = 50;
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, i + batchSize);
            
            for (const email of batch) {
                try {
                    // Utiliser CategoryManager pour analyser
                    const analysis = window.categoryManager.analyzeEmail(email);
                    
                    // Enrichir l'email avec les données de catégorisation
                    email.category = analysis.category || 'other';
                    email.categoryScore = analysis.score || 0;
                    email.categoryConfidence = analysis.confidence || 0;
                    email.matchedPatterns = analysis.matchedPatterns || [];
                    email.hasAbsolute = analysis.hasAbsolute || false;
                    email.isSpam = analysis.isSpam || false;
                    email.isCC = analysis.isCC || false;
                    
                    // NOUVEAU: Marquer si l'email est dans une catégorie pré-sélectionnée
                    email.isPreselectedForTasks = this.taskPreselectedCategories.includes(email.category);
                    
                    // Ajouter à la catégorie appropriée
                    const categoryId = email.category;
                    if (this.categorizedEmails[categoryId]) {
                        this.categorizedEmails[categoryId].push(email);
                        categoryStats[categoryId]++;
                    } else {
                        // Fallback vers 'other'
                        this.categorizedEmails.other.push(email);
                        categoryStats.other++;
                        console.warn(`[EmailScanner] Catégorie inconnue ${categoryId}, utilisation de 'other'`);
                    }

                    // Log pour les emails pré-sélectionnés
                    if (email.isPreselectedForTasks) {
                        console.log(`[EmailScanner] ⭐ Email pré-sélectionné pour tâche automatique:`, {
                            subject: email.subject?.substring(0, 50),
                            category: email.category,
                            confidence: Math.round(email.categoryConfidence * 100) + '%'
                        });
                    }

                } catch (error) {
                    console.error('[EmailScanner] ❌ Erreur catégorisation email:', error);
                    email.category = 'other';
                    email.categoryError = error.message;
                    email.isPreselectedForTasks = false;
                    this.categorizedEmails.other.push(email);
                    categoryStats.other++;
                    errors++;
                }

                processed++;
            }

            // Mise à jour progression par batch
            if (this.scanProgress && (i % (batchSize * 2) === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            // Petite pause pour éviter de bloquer l'UI
            if (i < this.emails.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        
        console.log('[EmailScanner] ✅ Catégorisation terminée');
        console.log('[EmailScanner] 📊 Distribution:', categoryStats);
        console.log('[EmailScanner] ⭐ Emails pré-sélectionnés pour tâches:', preselectedCount);
        console.log('[EmailScanner] ⚠️ Erreurs:', errors);
        
        this.logTopPatterns();
    }

    // ================================================
    // ANALYSE IA POUR TÂCHES - FOCUS SUR PRÉ-SÉLECTIONNÉS
    // ================================================
    async analyzeForTasks() {
        if (!window.aiTaskAnalyzer) {
            console.log('[EmailScanner] AITaskAnalyzer non disponible, skip analyse IA');
            return;
        }

        // Analyser en priorité les emails pré-sélectionnés
        const preselectedEmails = this.emails.filter(email => 
            email.isPreselectedForTasks && 
            email.categoryConfidence > 0.6
        ).slice(0, 8); // Limiter à 8 pour les performances
        
        // Compléter avec d'autres emails importants si besoin
        if (preselectedEmails.length < 5) {
            const otherEmails = this.emails.filter(email => 
                !email.isPreselectedForTasks && 
                email.categoryConfidence > 0.8 &&
                ['tasks', 'commercial', 'finance', 'meetings'].includes(email.category)
            ).slice(0, 5 - preselectedEmails.length);
            
            preselectedEmails.push(...otherEmails);
        }

        console.log(`[EmailScanner] 🤖 Analyse IA de ${preselectedEmails.length} emails prioritaires`);
        console.log(`[EmailScanner] ⭐ Dont ${preselectedEmails.filter(e => e.isPreselectedForTasks).length} pré-sélectionnés`);

        for (let i = 0; i < preselectedEmails.length; i++) {
            const email = preselectedEmails[i];
            
            try {
                const analysis = await window.aiTaskAnalyzer.analyzeEmailForTasks(email);
                email.aiAnalysis = analysis;
                email.taskSuggested = analysis?.mainTask?.title ? true : false;
                
                // Log spécial pour les emails pré-sélectionnés
                if (email.isPreselectedForTasks && email.taskSuggested) {
                    console.log(`[EmailScanner] ⭐🤖 Tâche suggérée pour email pré-sélectionné:`, {
                        subject: email.subject?.substring(0, 40),
                        category: email.category,
                        taskTitle: analysis.mainTask?.title?.substring(0, 40)
                    });
                }
                
                if (this.scanProgress) {
                    this.scanProgress({
                        phase: 'analyzing',
                        message: `Analyse IA: ${i + 1}/${preselectedEmails.length}`,
                        progress: { current: i + 1, total: preselectedEmails.length }
                    });
                }
                
                // Petite pause pour éviter de surcharger l'API
                if (i < preselectedEmails.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error('[EmailScanner] Erreur analyse IA:', error);
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
    // CALCUL DES RÉSULTATS - AVEC DONNÉES PRÉ-SÉLECTION
    // ================================================
    getDetailedResults() {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithAbsolute = 0;
        let totalWithTasks = 0;
        let totalPreselected = 0;

        // Compter par catégorie
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId !== 'other') {
                totalCategorized += emails.length;
                
                emails.forEach(email => {
                    if (email.categoryConfidence >= 0.8) {
                        totalWithHighConfidence++;
                    }
                    if (email.hasAbsolute) {
                        totalWithAbsolute++;
                    }
                    if (email.taskSuggested) {
                        totalWithTasks++;
                    }
                    if (email.isPreselectedForTasks) {
                        totalPreselected++;
                    }
                });
            }
        });

        const avgConfidence = this.calculateAverageConfidence();
        const avgScore = this.calculateAverageScore();

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
                absoluteMatches: totalWithAbsolute,
                taskSuggestions: totalWithTasks,
                preselectedForTasks: totalPreselected,
                averageConfidence: avgConfidence,
                averageScore: avgScore,
                categoriesUsed: Object.keys(breakdown).filter(cat => breakdown[cat] > 0).length,
                spamFiltered: this.emails.filter(e => e.isSpam).length,
                ccDetected: this.emails.filter(e => e.isCC).length
            },
            emails: this.emails,
            settings: this.settings
        };
    }

    // ================================================
    // LOGGING ET DEBUG - AVEC INFO PRÉ-SÉLECTION
    // ================================================
    logScanResults(results) {
        console.log('[EmailScanner] 📊 === RÉSULTATS FINAUX ===');
        console.log(`[EmailScanner] Total emails: ${results.total}`);
        console.log(`[EmailScanner] Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
        console.log(`[EmailScanner] Haute confiance: ${results.stats.highConfidence}`);
        console.log(`[EmailScanner] Matches absolus: ${results.stats.absoluteMatches}`);
        console.log(`[EmailScanner] Suggestions de tâches: ${results.stats.taskSuggestions}`);
        console.log(`[EmailScanner] ⭐ Pré-sélectionnés pour tâches: ${results.stats.preselectedForTasks}`);
        console.log(`[EmailScanner] Spam filtré: ${results.stats.spamFiltered}`);
        console.log(`[EmailScanner] CC détectés: ${results.stats.ccDetected}`);
        console.log(`[EmailScanner] Confiance moyenne: ${results.stats.averageConfidence}`);
        console.log(`[EmailScanner] Score moyen: ${results.stats.averageScore}`);
        console.log(`[EmailScanner] 📋 Catégories pré-sélectionnées: ${results.taskPreselectedCategories.join(', ')}`);
        
        console.log('[EmailScanner] Distribution par catégorie:');
        
        const categories = window.categoryManager?.getCategories() || {};
        const categoryOrder = Object.keys(categories).sort((a, b) => {
            return (categories[b].priority || 50) - (categories[a].priority || 50);
        });
        categoryOrder.push('other');
        
        categoryOrder.forEach(cat => {
            if (results.breakdown[cat] !== undefined && results.breakdown[cat] > 0) {
                const count = results.breakdown[cat];
                const percentage = Math.round((count / results.total) * 100);
                const categoryInfo = categories[cat] || { name: 'Autre', icon: '📌' };
                const isPreselected = this.taskPreselectedCategories.includes(cat);
                const preselectedMark = isPreselected ? ' ⭐' : '';
                console.log(`[EmailScanner]   ${categoryInfo.icon} ${categoryInfo.name}: ${count} emails (${percentage}%)${preselectedMark}`);
            }
        });
        
        console.log('[EmailScanner] ========================');
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES - AVEC FILTRAGE PRÉ-SÉLECTION
    // ================================================
    getAllEmails() {
        return [...this.emails]; // Retourner une copie pour éviter les modifications
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

    getPreselectedEmailsWithTaskSuggestions() {
        return this.emails.filter(email => email.isPreselectedForTasks && email.taskSuggested);
    }

    // ================================================
    // RECATÉGORISATION APRÈS CHANGEMENT DE PARAMÈTRES - AMÉLIORÉE
    // ================================================
    async recategorizeEmails() {
        if (this.emails.length === 0) {
            console.log('[EmailScanner] Aucun email à recatégoriser');
            return;
        }

        console.log('[EmailScanner] 🔄 Recatégorisation après changement de paramètres...');
        console.log('[EmailScanner] 📋 Nouvelles catégories pré-sélectionnées:', this.taskPreselectedCategories);
        
        // Vider les catégories actuelles
        Object.keys(this.categorizedEmails).forEach(cat => {
            this.categorizedEmails[cat] = [];
        });

        // Recatégoriser tous les emails
        await this.categorizeEmails();
        
        console.log('[EmailScanner] ✅ Recatégorisation terminée');
        
        // Notifier les autres modules
        setTimeout(() => {
            this.dispatchEvent('emailsRecategorized', {
                emails: this.emails,
                breakdown: this.getDetailedResults().breakdown,
                taskPreselectedCategories: this.taskPreselectedCategories,
                preselectedCount: this.emails.filter(e => e.isPreselectedForTasks).length
            });
        }, 10);
    }

    // ================================================
    // MÉTHODES DE MISE À JOUR DEPUIS AUTRES MODULES
    // ================================================
    updateSettings(newSettings) {
        console.log('[EmailScanner] 📝 Mise à jour settings:', newSettings);
        this.settings = { ...this.settings, ...newSettings };
        
        // Mettre à jour les catégories pré-sélectionnées si présentes
        if (newSettings.taskPreselectedCategories) {
            this.updateTaskPreselectedCategories(newSettings.taskPreselectedCategories);
        }
    }

    applyScanSettings(scanSettings) {
        console.log('[EmailScanner] 📝 Application scan settings:', scanSettings);
        this.settings.scanSettings = { ...this.settings.scanSettings, ...scanSettings };
    }

    updatePreferences(preferences) {
        console.log('[EmailScanner] 📝 Mise à jour préférences:', preferences);
        this.settings.preferences = { ...this.settings.preferences, ...preferences };
    }

    // ================================================
    // STATISTIQUES AVEC PRÉ-SÉLECTION
    // ================================================
    getDebugInfo() {
        const preselectedCount = this.emails.filter(e => e.isPreselectedForTasks).length;
        const preselectedWithTasks = this.emails.filter(e => e.isPreselectedForTasks && e.taskSuggested).length;
        
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
            avgConfidence: this.calculateAverageConfidence(),
            avgScore: this.calculateAverageScore(),
            settings: this.settings,
            hasTaskSuggestions: this.emails.filter(e => e.taskSuggested).length,
            categoryManagerAvailable: !!window.categoryManager,
            mailServiceAvailable: !!window.mailService,
            aiTaskAnalyzerAvailable: !!window.aiTaskAnalyzer,
            lastSettingsSync: this.lastSettingsSync,
            syncInterval: !!this.syncInterval
        };
    }

    getCategoryTrends(days = 7) {
        const trends = {};
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        this.emails.forEach(email => {
            const emailDate = new Date(email.receivedDateTime);
            if (emailDate >= cutoffDate) {
                const category = email.category || 'other';
                if (!trends[category]) {
                    trends[category] = { 
                        count: 0, 
                        confidence: 0, 
                        preselectedCount: 0,
                        taskSuggestedCount: 0
                    };
                }
                trends[category].count++;
                trends[category].confidence += (email.categoryConfidence || 0);
                
                if (email.isPreselectedForTasks) {
                    trends[category].preselectedCount++;
                }
                
                if (email.taskSuggested) {
                    trends[category].taskSuggestedCount++;
                }
            }
        });

        // Calculer les moyennes
        Object.keys(trends).forEach(cat => {
            if (trends[cat].count > 0) {
                trends[cat].avgConfidence = trends[cat].confidence / trends[cat].count;
                trends[cat].preselectedPercentage = Math.round((trends[cat].preselectedCount / trends[cat].count) * 100);
                trends[cat].taskSuggestedPercentage = Math.round((trends[cat].taskSuggestedCount / trends[cat].count) * 100);
            }
        });

        return trends;
    }

    // ================================================
    // EXPORT AVEC DONNÉES PRÉ-SÉLECTION
    // ================================================
    exportToJSON() {
        const data = {
            scanDate: new Date().toISOString(),
            totalEmails: this.emails.length,
            taskPreselectedCategories: [...this.taskPreselectedCategories],
            stats: this.getDetailedResults().stats,
            settings: this.settings,
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
                isPreselectedCategory: this.taskPreselectedCategories.includes(catId),
                avgScore: emails.length > 0 ? 
                    Math.round(emails.reduce((sum, e) => sum + (e.categoryScore || 0), 0) / emails.length) : 0
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
            hasAbsolute: email.hasAbsolute,
            taskSuggested: email.taskSuggested,
            isPreselectedForTasks: email.isPreselectedForTasks,
            isSpam: email.isSpam,
            isCC: email.isCC,
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

    // ================================================
    // NETTOYAGE ET DESTRUCTION - AVEC ARRÊT MONITORING
    // ================================================
    cleanup() {
        console.log('[EmailScanner] 🧹 Nettoyage des données...');
        
        // Arrêter le monitoring de synchronisation
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Nettoyer les event listeners
        if (this.settingsChangeHandler) {
            window.removeEventListener('categorySettingsChanged', this.settingsChangeHandler);
        }
        if (this.generalSettingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.generalSettingsChangeHandler);
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
        console.log('[EmailScanner] ✅ Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = {};
        console.log('[EmailScanner] Instance détruite');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[EmailScanner] Erreur dispatch ${eventName}:`, error);
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

    // Méthodes héritées existantes...
    reset() {
        console.log('[EmailScanner] 🔄 Réinitialisation...');
        this.emails = [];
        this.categorizedEmails = {};
        
        // Initialiser avec toutes les catégories du CategoryManager
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        // S'assurer que 'other' existe
        this.categorizedEmails.other = [];
        
        console.log('[EmailScanner] ✅ Réinitialisation terminée, catégories:', 
            Object.keys(this.categorizedEmails));
    }

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

    getCategorizedEmails() {
        return { ...this.categorizedEmails }; // Retourner une copie
    }

    getEmailById(emailId) {
        return this.emails.find(email => email.id === emailId);
    }

    searchEmails(query) {
        if (!query) return [...this.emails];

        const searchTerm = query.toLowerCase();
        
        return this.emails.filter(email => {
            const subject = (email.subject || '').toLowerCase();
            const body = (email.bodyPreview || '').toLowerCase();
            const from = (email.from?.emailAddress?.address || '').toLowerCase();
            const fromName = (email.from?.emailAddress?.name || '').toLowerCase();
            const category = (email.category || '').toLowerCase();

            return subject.includes(searchTerm) ||
                   body.includes(searchTerm) ||
                   from.includes(searchTerm) ||
                   fromName.includes(searchTerm) ||
                   category.includes(searchTerm);
        });
    }

    filterEmailsByConfidence(minConfidence = 0.7) {
        return this.emails.filter(email => 
            (email.categoryConfidence || 0) >= minConfidence
        );
    }

    getEmailGroups(categoryId = null, groupBy = 'sender') {
        const emails = categoryId ? 
            this.getEmailsByCategory(categoryId) : 
            this.emails;

        const groups = new Map();

        emails.forEach(email => {
            let key, name;
            
            if (groupBy === 'domain') {
                key = email.from?.emailAddress?.address?.split('@')[1] || 'unknown';
                name = key;
            } else {
                key = email.from?.emailAddress?.address || 'unknown';
                name = email.from?.emailAddress?.name || key.split('@')[0];
            }

            if (!groups.has(key)) {
                groups.set(key, {
                    sender: key,
                    name: name,
                    emails: [],
                    count: 0,
                    categories: new Set(),
                    latestDate: null,
                    totalScore: 0,
                    avgConfidence: 0,
                    hasTaskSuggestions: false,
                    preselectedCount: 0
                });
            }

            const group = groups.get(key);
            group.emails.push(email);
            group.count++;
            group.categories.add(email.category);
            group.totalScore += (email.categoryScore || 0);
            
            if (email.taskSuggested) {
                group.hasTaskSuggestions = true;
            }
            
            if (email.isPreselectedForTasks) {
                group.preselectedCount++;
            }

            const emailDate = new Date(email.receivedDateTime);
            if (!group.latestDate || emailDate > group.latestDate) {
                group.latestDate = emailDate;
            }
        });

        return Array.from(groups.values())
            .map(g => {
                const avgScore = g.count > 0 ? Math.round(g.totalScore / g.count) : 0;
                const avgConfidence = g.count > 0 ? 
                    g.emails.reduce((sum, e) => sum + (e.categoryConfidence || 0), 0) / g.count : 0;
                
                return {
                    ...g,
                    categories: Array.from(g.categories),
                    avgScore,
                    avgConfidence: Math.round(avgConfidence * 100) / 100,
                    preselectedPercentage: g.count > 0 ? Math.round((g.preselectedCount / g.count) * 100) : 0
                };
            })
            .sort((a, b) => b.count - a.count);
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

    exportToCSV() {
        const rows = [
            ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Patterns', 'Absolu', 'Tâche Suggérée', 'Pré-sélectionné']
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
                (email.matchedPatterns || []).length,
                email.hasAbsolute ? 'Oui' : 'Non',
                email.taskSuggested ? 'Oui' : 'Non',
                email.isPreselectedForTasks ? 'Oui' : 'Non'
            ]);
        });

        const csv = rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // Ajouter BOM pour UTF-8
        return '\ufeff' + csv;
    }

    async performBatchAction(emailIds, action) {
        console.log(`[EmailScanner] 🔄 Action ${action} sur ${emailIds.length} emails`);

        if (!window.mailService) {
            console.error('[EmailScanner] MailService non disponible');
            return;
        }

        try {
            switch (action) {
                case 'markAsRead':
                    if (typeof window.mailService.markAsRead === 'function') {
                        const promises = emailIds.map(id => window.mailService.markAsRead(id));
                        await Promise.allSettled(promises);
                    }
                    break;

                case 'delete':
                    if (typeof window.mailService.deleteEmails === 'function') {
                        await window.mailService.deleteEmails(emailIds);
                    }
                    break;

                case 'moveToSpam':
                    if (typeof window.mailService.moveToFolder === 'function') {
                        const spamPromises = emailIds.map(id => 
                            window.mailService.moveToFolder(id, 'junkemail')
                        );
                        await Promise.allSettled(spamPromises);
                    }
                    break;

                default:
                    console.warn(`[EmailScanner] Action inconnue: ${action}`);
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(`Action "${action}" effectuée sur ${emailIds.length} emails`, 'success');
            }
            
        } catch (error) {
            console.error(`[EmailScanner] Erreur action batch:`, error);
            if (window.uiManager) {
                window.uiManager.showToast(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    testCategorization(emailSample) {
        console.log('[EmailScanner] 🧪 === TEST CATEGORISATION ===');
        
        if (!window.categoryManager) {
            console.error('[EmailScanner] CategoryManager non disponible');
            return null;
        }
        
        const result = window.categoryManager.analyzeEmail(emailSample);
        console.log('Email:', emailSample.subject);
        console.log('Résultat:', result.category);
        console.log('Score:', result.score);
        console.log('Confiance:', Math.round(result.confidence * 100) + '%');
        console.log('Patterns:', result.matchedPatterns);
        console.log('Match absolu:', result.hasAbsolute ? '✅ OUI' : '❌ NON');
        console.log('Pré-sélectionné pour tâche:', this.taskPreselectedCategories.includes(result.category) ? '⭐ OUI' : '❌ NON');
        console.log('============================');
        
        return result;
    }

    optimizeMemory() {
        // Garder seulement les propriétés essentielles des emails
        this.emails.forEach(email => {
            delete email.body; // Supprimer le corps complet pour économiser la mémoire
            delete email.aiAnalysisError;
            delete email.categoryError;
        });
        
        console.log('[EmailScanner] 🚀 Mémoire optimisée');
    }

    enableDebugMode() {
        this.debugMode = true;
        if (window.categoryManager) {
            window.categoryManager.setDebugMode(true);
        }
        console.log('[EmailScanner] 🐛 Mode debug activé');
    }

    disableDebugMode() {
        this.debugMode = false;
        if (window.categoryManager) {
            window.categoryManager.setDebugMode(false);
        }
        console.log('[EmailScanner] Mode debug désactivé');
    }

    getTopSenders(limit = 10) {
        const senderCounts = {};
        
        this.emails.forEach(email => {
            const senderEmail = email.from?.emailAddress?.address;
            if (senderEmail) {
                if (!senderCounts[senderEmail]) {
                    senderCounts[senderEmail] = {
                        email: senderEmail,
                        name: email.from?.emailAddress?.name || senderEmail,
                        count: 0,
                        categories: new Set(),
                        hasTaskSuggestions: false,
                        preselectedCount: 0
                    };
                }
                senderCounts[senderEmail].count++;
                senderCounts[senderEmail].categories.add(email.category);
                if (email.taskSuggested) {
                    senderCounts[senderEmail].hasTaskSuggestions = true;
                }
                if (email.isPreselectedForTasks) {
                    senderCounts[senderEmail].preselectedCount++;
                }
            }
        });

        return Object.values(senderCounts)
            .map(sender => ({
                ...sender,
                categories: Array.from(sender.categories),
                preselectedPercentage: sender.count > 0 ? Math.round((sender.preselectedCount / sender.count) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}

// Créer l'instance globale avec nettoyage préalable
if (window.emailScanner) {
    window.emailScanner.destroy?.();
}

window.emailScanner = new EmailScanner();

// Méthodes utilitaires globales pour le debug
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner');
    
    const testEmail = {
        subject: "Newsletter hebdomadaire - Désabonnez-vous ici",
        from: { emailAddress: { address: "newsletter@example.com", name: "Example News" } },
        bodyPreview: "Voici votre newsletter avec un lien pour vous désinscrire",
        receivedDateTime: new Date().toISOString()
    };
    
    const result = window.emailScanner.testCategorization(testEmail);
    console.log('Debug Info:', window.emailScanner.getDebugInfo());
    
    console.groupEnd();
    return result;
};

window.debugEmailCategories = function() {
    console.group('📊 DEBUG Catégories');
    console.log('Settings:', window.emailScanner.settings);
    console.log('Task Preselected Categories:', window.emailScanner.taskPreselectedCategories);
    console.log('Emails total:', window.emailScanner.emails.length);
    console.log('Emails pré-sélectionnés:', window.emailScanner.getPreselectedEmails().length);
    console.log('Breakdown:', window.emailScanner.getDetailedResults().breakdown);
    console.log('Top senders:', window.emailScanner.getTopSenders(5));
    console.groupEnd();
};

console.log('✅ EmailScanner v5.2 loaded - Synchronisation temps réel fixée');
