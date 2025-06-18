// ================================================
    // MÉTHODES UTILITAIRES ET HELPERS
    // ================================================
    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.85;
        if (score.total >= 100) return 0.80;
        if (score.total >= 80) return 0.75;
        if (score.total >= 60) return 0.70;
        if (score.total >= 40) return 0.60;
        if (score.total >= 25) return 0.50;
        return 0.40;
    }

    // ================================================
    // VÉRIFICATIONS RAPIDES
    // ================================================
    isSpamEmail(email) {
        if (email.parentFolderId?.toLowerCase().includes('junk')) return true;
        if (email.categories?.some(cat => cat.toLowerCase().includes('spam'))) return true;
        return false;
    }

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        if (exclusions.domains?.length) {
            return exclusions.domains.some(domain => content.domain.includes(domain.toLowerCase()));
        }
        return false;
    }

    // ================================================
    // INITIALISATION CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité, connexions et authentification',
                priority: 90, // Priorité très élevée
                isCustom: false
            },
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire et demandes d\'action',
                priority: 85, // Priorité très élevée
                isCustom: false
            },
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                priority: 80, // Priorité élevée
                isCustom: false
            },
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                priority: 75,
                isCustom: false
            },
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis et contrats',
                priority: 70,
                isCustom: false
            },
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion de projet',
                priority: 65,
                isCustom: false
            },
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                priority: 60,
                isCustom: false
            },
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 55,
                isCustom: false
            },
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                priority: 50,
                isCustom: false
            },
            reminders: {
                name: 'Relances',
                icon: '🔄',
                color: '#10b981',
                description: 'Rappels et suivis',
                priority: 45,
                isCustom: false
            },
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                priority: 40,
                isCustom: false
            },
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques',
                priority: 35,
                isCustom: false
            },
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 20, // PRIORITÉ RÉDUITE pour éviter domination
                isCustom: false
            }
        };
        
        this.isInitialized = true;
    }

    // ================================================
    // MÉTHODES DE SYNCHRONISATION
    // ================================================
    startOptimizedSync() {
        setInterval(() => {
            this.processSettingsChanges();
        }, 5000);
        
        this.setupImmediateSync();
    }

    setupImmediateSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'categorySettings') {
                console.log('[CategoryManager] 🔄 Changement localStorage détecté');
                this.reloadSettingsFromStorage();
                this.notifyAllModules('storageChange');
            }
        });
    }

    processSettingsChanges() {
        if (this.syncInProgress || this.syncQueue.length === 0) return;
        
        this.syncInProgress = true;
        
        try {
            while (this.syncQueue.length > 0) {
                const change = this.syncQueue.shift();
                this.applySettingChange(change);
            }
            
            this.lastSyncTimestamp = Date.now();
            
        } catch (error) {
            console.error('[CategoryManager] Erreur sync queue:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    applySettingChange(change) {
        const { type, value, notifyModules } = change;
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.settings.taskPreselectedCategories = [...value];
                break;
            case 'activeCategories':
                this.settings.activeCategories = value;
                break;
            case 'categoryExclusions':
                this.settings.categoryExclusions = { ...this.settings.categoryExclusions, ...value };
                break;
            case 'scanSettings':
                this.settings.scanSettings = { ...this.settings.scanSettings, ...value };
                break;
            case 'automationSettings':
                this.settings.automationSettings = { ...this.settings.automationSettings, ...value };
                break;
            case 'preferences':
                this.settings.preferences = { ...this.settings.preferences, ...value };
                break;
            default:
                this.settings = { ...this.settings, ...value };
        }
        
        this.saveSettingsToStorage();
        
        if (notifyModules !== false) {
            this.notifySpecificModules(type, value);
            this.notifyAllModules(type, value);
        }
    }

    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification: ${type}`);
        
        if (window.emailScanner) {
            switch (type) {
                case 'taskPreselectedCategories':
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    setTimeout(() => {
                        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                            window.emailScanner.recategorizeEmails?.();
                        }
                    }, 100);
                    break;
                    
                case 'activeCategories':
                    if (typeof window.emailScanner.updateSettings === 'function') {
                        window.emailScanner.updateSettings({ activeCategories: value });
                    }
                    setTimeout(() => {
                        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                            window.emailScanner.recategorizeEmails?.();
                        }
                    }, 100);
                    break;
            }
        }
        
        if (window.pageManager) {
            if (typeof window.pageManager.handleSettingsChanged === 'function') {
                window.pageManager.handleSettingsChanged({ settings: this.settings });
            }
        }
    }

    notifyAllModules(type, value) {
        setTimeout(() => {
            this.dispatchEvent('categorySettingsChanged', { 
                settings: this.settings,
                type,
                value,
                timestamp: Date.now()
            });
            
            this.dispatchEvent('settingsChanged', { 
                type, 
                value,
                source: 'CategoryManager',
                timestamp: Date.now()
            });
        }, 10);
        
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur listener:', error);
            }
        });
    }

    // ================================================
    // API PUBLIQUE
    // ================================================
    updateSettings(newSettings, notifyModules = true) {
        console.log('[CategoryManager] 📝 updateSettings:', newSettings);
        
        this.syncQueue.push({
            type: 'fullSettings',
            value: newSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateTaskPreselectedCategories(categories, notifyModules = true) {
        console.log('[CategoryManager] 📋 updateTaskPreselectedCategories:', categories);
        
        const normalizedCategories = Array.isArray(categories) ? [...categories] : [];
        
        this.syncQueue.push({
            type: 'taskPreselectedCategories',
            value: normalizedCategories,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
        
        return normalizedCategories;
    }

    updateActiveCategories(categories, notifyModules = true) {
        console.log('[CategoryManager] 🏷️ updateActiveCategories:', categories);
        
        this.syncQueue.push({
            type: 'activeCategories',
            value: categories,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    // ================================================
    // GETTERS
    // ================================================
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return [...this.settings.activeCategories];
    }

    isCategoryActive(categoryId) {
        const activeCategories = this.getActiveCategories();
        return activeCategories.includes(categoryId);
    }

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

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
        if (categoryId === 'excluded') {
            return { id: 'excluded', name: 'Exclu', icon: '🚫', color: '#6b7280' };
        }
        return this.categories[categoryId] || null;
    }

    getCategoryKeywords(categoryId) {
        return this.weightedKeywords[categoryId] || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            const defaultSettings = this.getDefaultSettings();
            
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                const mergedSettings = { ...defaultSettings, ...parsedSettings };
                console.log('[CategoryManager] ✅ Settings chargés');
                return mergedSettings;
            } else {
                console.log('[CategoryManager] 📝 Settings par défaut');
                return defaultSettings;
            }
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: [],
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

    saveSettingsToStorage() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde:', error);
        }
    }

    reloadSettingsFromStorage() {
        const oldSettings = { ...this.settings };
        this.settings = this.loadSettings();
        
        const changes = this.detectSettingsChanges(oldSettings, this.settings);
        changes.forEach(change => {
            this.notifySpecificModules(change.type, change.value);
        });
    }

    detectSettingsChanges(oldSettings, newSettings) {
        const changes = [];
        
        const criticalFields = [
            'taskPreselectedCategories',
            'activeCategories', 
            'categoryExclusions',
            'scanSettings',
            'automationSettings',
            'preferences'
        ];
        
        criticalFields.forEach(field => {
            const oldValue = JSON.stringify(oldSettings[field] || {});
            const newValue = JSON.stringify(newSettings[field] || {});
            
            if (oldValue !== newValue) {
                changes.push({
                    type: field,
                    value: newSettings[field],
                    oldValue: oldSettings[field]
                });
            }
        });
        
        return changes;
    }

    // ================================================
    // CATÉGORIES PERSONNALISÉES
    // ================================================
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            Object.entries(this.customCategories).forEach(([id, category]) => {
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30
                };
                
                if (category.keywords) {
                    this.weightedKeywords[id] = {
                        absolute: [...(category.keywords.absolute || [])],
                        strong: [...(category.keywords.strong || [])],
                        weak: [...(category.keywords.weak || [])],
                        exclusions: [...(category.keywords.exclusions || [])]
                    };
                } else {
                    this.weightedKeywords[id] = {
                        absolute: [],
                        strong: [],
                        weak: [],
                        exclusions: []
                    };
                }
            });
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories:', error);
            this.customCategories = {};
        }
    }

    // ================================================
    // EVENT LISTENERS
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) return;

        this.externalSettingsChangeHandler = (event) => {
            if (event.detail?.source === 'CategoryManager') return;
            
            const { type, value } = event.detail;
            console.log(`[CategoryManager] Reçu changement externe: ${type}`);
            
            this.syncQueue.push({
                type,
                value,
                notifyModules: false,
                timestamp: Date.now()
            });
            
            if (!this.syncInProgress) {
                this.processSettingsChanges();
            }
        };

        window.addEventListener('settingsChanged', this.externalSettingsChangeHandler);
        this.eventListenersSetup = true;
    }

    addChangeListener(callback) {
        this.changeListeners.add(callback);
        return () => this.changeListeners.delete(callback);
    }

    // ================================================
    // MÉTHODES DE TEST ET DEBUG
    // ================================================
    testEmail(subject, body = '', from = 'test@example.com', expectedCategory = null) {
        const testEmail = {
            subject: subject,
            body: { content: body },
            bodyPreview: body.substring(0, 100),
            from: { emailAddress: { address: from } },
            toRecipients: [{ emailAddress: { address: 'user@example.com' } }],
            receivedDateTime: new Date().toISOString()
        };
        
        const result = this.analyzeEmail(testEmail);
        
        console.log('\n[CategoryManager] TEST:');
        console.log(`📧 "${subject}"`);
        console.log(`🏷️ ${result.category} (${result.score}pts, ${Math.round(result.confidence * 100)}%)`);
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`❌ Expected ${expectedCategory}, got ${result.category}`);
        } else {
            console.log('✅ OK');
        }
        
        return result;
    }

    getPerformanceStats() {
        return {
            cache: {
                size: this.analysisCache.size,
                hits: this.cacheStats.hits,
                misses: this.cacheStats.misses,
                hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100
            }
        };
    }

    invalidateCache() {
        this.analysisCache.clear();
        this.cacheStats = { hits: 0, misses: 0 };
        console.log('[CategoryManager] 🧹 Cache invalidé');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'CategoryManager',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`[CategoryManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        this.analysisCache.clear();
        
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        if (this.externalSettingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.externalSettingsChangeHandler);
        }
        
        this.syncQueue = [];
        this.changeListeners.clear();
        this.eventListenersSetup = false;
        this.syncInProgress = false;
        
        console.log('[CategoryManager] 🧹 Nettoyage effectué');
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

// ================================================
// EMAILSCANNER - CORRECTION QUOTA LOCALSTORAGE
// ================================================

// Patch pour EmailScanner - sauvegarde compacte
if (window.emailScanner && typeof window.emailScanner.saveToStorage === 'function') {
    console.log('[CategoryManager] 🔧 Patch EmailScanner pour quota localStorage');
    
    // Remplacer la méthode saveToStorage par une version compacte
    window.emailScanner.saveToStorageCompact = function() {
        try {
            // Compacter les données emails - garder seulement l'essentiel
            const compactEmails = this.emails.map(email => ({
                id: email.id,
                subject: email.subject,
                from: email.from,
                receivedDateTime: email.receivedDateTime,
                category: email.category,
                categoryScore: email.categoryScore,
                isPreselectedForTasks: email.isPreselectedForTasks,
                isRead: email.isRead,
                hasAttachments: email.hasAttachments
                // Supprimer body, bodyPreview et autres gros champs
            }));
            
            const dataToStore = {
                emails: compactEmails,
                lastScanTimestamp: this.lastScanTimestamp,
                scanOptions: this.scanOptions,
                version: '3.1-compact',
                totalEmails: this.emails.length,
                compacted: true
            };
            
            localStorage.setItem('scanResults', JSON.stringify(dataToStore));
            console.log(`[EmailScanner] 💾 Données compactées sauvegardées (${compactEmails.length} emails)`);
        } catch (error) {
            console.error('[EmailScanner] Erreur sauvegarde compacte:', error);
            
            // Si même la version compacte échoue, essayer de sauver seulement les stats
            try {
                const statsOnly = {
                    lastScanTimestamp: this.lastScanTimestamp,
                    totalEmails: this.emails.length,
                    categoryCounts: this.getCategoryCounts(),
                    version: '3.1-stats-only'
                };
                localStorage.setItem('scanResults', JSON.stringify(statsOnly));
                console.log('[EmailScanner] 💾 Stats seulement sauvegardées');
            } catch (statsError) {
                console.error('[EmailScanner] Impossible de sauvegarder même les stats:', statsError);
                // Nettoyer localStorage si nécessaire
                this.clearOldData();
            }
        }
    };
    
    // Méthode pour nettoyer les anciennes données
    window.emailScanner.clearOldData = function() {
        try {
            console.log('[EmailScanner] 🧹 Nettoyage localStorage pour libérer de l\'espace');
            
            // Supprimer les clés potentiellement volumineuses
            const keysToCheck = [
                'scanResults', 'emailAnalysis', 'taskResults', 
                'categoryFilters', 'aiAnalysisResults'
            ];
            
            keysToCheck.forEach(key => {
                const item = localStorage.getItem(key);
                if (item && item.length > 100000) { // Si > 100KB
                    localStorage.removeItem(key);
                    console.log(`[EmailScanner] 🗑️ Supprimé ${key} (${Math.round(item.length/1000)}KB)`);
                }
            });
            
        } catch (error) {
            console.error('[EmailScanner] Erreur nettoyage:', error);
        }
    };
    
    // Remplacer la méthode originale
    window.emailScanner.saveToStorage = window.emailScanner.saveToStorageCompact;
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création instance ÉQUILIBRÉE v25.0...');
window.categoryManager = new CategoryManager();

// ================================================
// TESTS GLOBAUX
// ================================================
window.testCategoryManagerBalanced = function() {
    console.group('🧪 TEST CategoryManager ÉQUILIBRÉ v25.0');
    
    const tests = [
        { subject: "Alerte sécurité: Nouvelle connexion détectée", expected: "security" },
        { subject: "Action requise: Validation urgente de votre document", expected: "tasks" },
        { subject: "Facture #12345 - Paiement requis sous 7 jours", expected: "finance" },
        { subject: "Invitation Teams - Réunion équipe demain 14h", expected: "meetings" },
        { subject: "Proposition commerciale - Nouveau projet web", expected: "commercial" },
        { subject: "Update projet Alpha - Sprint 3 terminé avec succès", expected: "project" },
        { subject: "Bulletin de paie - Décembre 2024 disponible", expected: "hr" },
        { subject: "Ticket #789 - Votre problème a été résolu", expected: "support" },
        { subject: "Rappel: Réponse attendue pour le contrat client", expected: "reminders" },
        { subject: "Annonce interne: Nouvelle politique de télétravail", expected: "internal" },
        { subject: "Notification automatique - Ne pas répondre", expected: "notifications" },
        { subject: "Newsletter hebdo - Cliquez pour vous désabonner", expected: "marketing_news" },
        { subject: "Email ordinaire sans mots-clés spéciaux", expected: "other" }
    ];
    
    let successCount = 0;
    const startTime = performance.now();
    
    tests.forEach((test, index) => {
        const result = window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
        
        if (result.category === test.expected) {
            successCount++;
            console.log(`✅ Test ${index + 1}: ${test.expected}`);
        } else {
            console.log(`❌ Test ${index + 1}: Expected ${test.expected}, got ${result.category}`);
        }
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`\n📊 Résultats: ${successCount}/${tests.length} réussis`);
    console.log(`⚡ Performance: ${duration.toFixed(2)}ms total`);
    console.log(`📈 Taux de réussite: ${Math.round((successCount/tests.length)*100)}%`);
    
    const stats = window.categoryManager.getPerformanceStats();
    console.log('🎯 Cache:', stats.cache);
    
    console.groupEnd();
    
    return { 
        success: successCount === tests.length, 
        successRate: (successCount/tests.length)*100,
        testsRun: tests.length, 
        duration: duration
    };
};

window.fixEmailScannerQuota = function() {
    console.log('🔧 Application patch quota EmailScanner...');
    
    if (window.emailScanner) {
        // Nettoyer les anciennes données
        window.emailScanner.clearOldData();
        
        // Appliquer la sauvegarde compacte
        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
            window.emailScanner.saveToStorageCompact();
        }
        
        console.log('✅ Patch appliqué - EmailScanner utilisera la sauvegarde compacte');
        return { success: true, message: 'Quota localStorage optimisé' };
    }
    
    return { success: false, message: 'EmailScanner non trouvé' };
};

console.log('✅ CategoryManager ÉQUILIBRÉ v25.0 loaded!');
console.log('🧪 Fonctions disponibles:');
console.log('   - testCategoryManagerBalanced() : Test toutes catégories équilibrées');
console.log('   - fixEmailScannerQuota() : Corriger le quota localStorage');// CategoryManager.js - Version 25.0 - CORRECTION COMPLÈTE DES CATÉGORIES + QUOTA 🚀

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // Cache optimisé
        this.analysisCache = new Map();
        this.cacheMaxSize = 5000;
        this.cacheTTL = 300000;
        this.cacheStats = { hits: 0, misses: 0 };
        
        // Synchronisation
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.setupEventListeners();
        this.startOptimizedSync();
        
        console.log('[CategoryManager] ✅ Version 25.0 - Correction catégories + quota localStorage');
    }

    // ================================================
    // EXTRACTION DE CONTENU ÉQUILIBRÉE
    // ================================================
    extractCompleteContent(email) {
        const parts = [];
        
        // Sujet (pondération normale, pas excessive)
        if (email.subject?.trim()) {
            parts.push(email.subject.repeat(2)); // Réduit de 3 à 2
        }
        
        // Expéditeur
        if (email.from?.emailAddress?.address) {
            parts.push(email.from.emailAddress.address);
        }
        
        if (email.from?.emailAddress?.name) {
            parts.push(email.from.emailAddress.name);
        }
        
        // Corps de l'email
        if (email.bodyPreview) {
            parts.push(email.bodyPreview);
        }
        
        if (email.body?.content) {
            const cleanContent = this.fastHtmlClean(email.body.content);
            parts.push(cleanContent);
        }
        
        const rawText = parts.join(' ');
        const normalizedText = this.fastNormalize(rawText);
        
        return {
            text: normalizedText,
            subject: this.fastNormalize(email.subject || ''),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            senderName: this.fastNormalize(email.from?.emailAddress?.name || ''),
            senderEmail: email.from?.emailAddress?.address?.toLowerCase() || '',
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: normalizedText.length,
            rawSubject: email.subject || '',
            rawSenderName: email.from?.emailAddress?.name || ''
        };
    }

    fastNormalize(text) {
        if (!text) return '';
        return text.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    fastHtmlClean(html) {
        if (!html) return '';
        return html
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<\/p>/gi, ' ')
            .replace(/<\/div>/gi, ' ')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        const parts = email.split('@');
        return parts[1]?.toLowerCase() || 'unknown';
    }

    // ================================================
    // ANALYSE EMAIL CORRIGÉE - TOUTES CATÉGORIES
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Cache check
        const cached = this.getCachedAnalysis(email);
        if (cached) {
            this.cacheStats.hits++;
            return cached;
        }
        
        this.cacheStats.misses++;
        
        // Vérifications rapides
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            const result = { category: 'spam', score: 0, confidence: 0, isSpam: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        const content = this.extractCompleteContent(email);
        
        if (this.isGloballyExcluded(content, email)) {
            const result = { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Détection personnelle AVANT tout
        if (this.isPersonalEmail(content)) {
            const result = {
                category: this.categories.personal ? 'personal' : 'excluded',
                score: 100,
                confidence: 0.95,
                isPersonal: true
            };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Analyse CC
        const ccResult = this.analyzeCC(email, content);
        if (ccResult) {
            this.setCachedAnalysis(email, ccResult);
            return ccResult;
        }
        
        // CORRECTION PRINCIPALE: Analyse équilibrée de TOUTES les catégories
        const result = this.analyzeAllCategoriesBalanced(content, email);
        
        this.setCachedAnalysis(email, result);
        return result;
    }

    // ================================================
    // ANALYSE ÉQUILIBRÉE DE TOUTES LES CATÉGORIES
    // ================================================
    analyzeAllCategoriesBalanced(content, email) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // IMPORTANT: Analyser TOUTES les catégories avec pondération équitable
        for (const categoryId of activeCategories) {
            const keywords = this.weightedKeywords[categoryId];
            if (!keywords || this.isEmptyKeywords(keywords)) {
                continue;
            }
            
            const score = this.calculateScoreBalanced(content, keywords, categoryId);
            
            if (score.total > 0) {
                results[categoryId] = {
                    category: categoryId,
                    score: score.total,
                    hasAbsolute: score.hasAbsolute,
                    matches: score.matches,
                    confidence: this.calculateConfidence(score),
                    priority: this.categories[categoryId]?.priority || 50
                };
            }
        }
        
        return this.selectBestCategoryStrict(results);
    }

    // ================================================
    // CALCUL DE SCORE ÉQUILIBRÉ - SANS BIAIS NEWSLETTER
    // ================================================
    calculateScoreBalanced(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // CORRECTION: Pas de bonus spécial pour marketing_news
        const categoryBonus = this.getCategoryBonusBalanced(categoryId);
        if (categoryBonus > 0) {
            totalScore += categoryBonus;
            matches.push({ keyword: 'category_bonus', type: 'bonus', score: categoryBonus });
        }
        
        // Pénalité pour contenu personnel dans catégories pro
        if (this.hasPersonalContent(text) && this.isProfessionalCategory(categoryId)) {
            totalScore -= 50;
            matches.push({ keyword: 'personal_penalty', type: 'penalty', score: -50 });
        }
        
        // Test exclusions
        if (keywords.exclusions?.length) {
            for (const exclusion of keywords.exclusions) {
                if (this.fastTextSearch(text, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
                }
            }
        }
        
        // Test mots-clés absolus - SCORE RÉDUIT POUR ÉVITER NEWSLETTER DOMINANCE
        if (keywords.absolute?.length) {
            for (const keyword of keywords.absolute) {
                if (this.fastTextSearch(text, keyword)) {
                    // CORRECTION: Score absolu réduit pour équilibrer
                    const absoluteScore = categoryId === 'marketing_news' ? 60 : 80;
                    totalScore += absoluteScore;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: absoluteScore });
                    
                    // Bonus sujet réduit
                    if (this.fastTextSearch(content.subject, keyword)) {
                        const subjectBonus = categoryId === 'marketing_news' ? 20 : 30;
                        totalScore += subjectBonus;
                        matches.push({ keyword: keyword + '_subject', type: 'bonus', score: subjectBonus });
                    }
                }
            }
        }
        
        // Test mots-clés forts
        if (keywords.strong?.length) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.fastTextSearch(text, keyword)) {
                    totalScore += 35; // Score uniforme pour toutes catégories
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: 35 });
                    
                    if (strongMatches >= 3) break;
                }
            }
            
            if (strongMatches >= 2) {
                totalScore += 25;
                matches.push({ keyword: 'multiple_strong', type: 'bonus', score: 25 });
            }
        }
        
        // Test mots-clés faibles (limité)
        if (!hasAbsolute && totalScore < 80 && keywords.weak?.length) {
            let weakMatches = 0;
            for (const keyword of keywords.weak.slice(0, 8)) {
                if (this.fastTextSearch(text, keyword)) {
                    totalScore += 12;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 12 });
                    
                    if (weakMatches >= 4) break;
                }
            }
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    // ================================================
    // BONUS CATÉGORIE ÉQUILIBRÉS
    // ================================================
    getCategoryBonusBalanced(categoryId) {
        const bonuses = {
            'security': 20,      // Priorité élevée pour sécurité
            'finance': 18,       // Important pour finance
            'tasks': 22,         // Priorité max pour tâches
            'meetings': 16,      // Réunions importantes
            'commercial': 14,    // Commercial modéré
            'project': 16,       // Projets importants
            'hr': 15,           // RH modéré
            'support': 13,       // Support modéré
            'reminders': 12,     // Rappels modérés
            'internal': 11,      // Communication interne
            'notifications': 8,  // Notifications basses
            'marketing_news': 5, // BONUS RÉDUIT pour newsletter
            'cc': 10            // CC modéré
        };
        return bonuses[categoryId] || 0;
    }

    // ================================================
    // SÉLECTION STRICTE DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategoryStrict(results) {
        // SEUILS PLUS STRICTS pour avoir plus d'emails "other"
        const MIN_SCORE_THRESHOLD = 40; // Augmenté de 25 à 40
        const MIN_CONFIDENCE_THRESHOLD = 0.55; // Augmenté de 0.4 à 0.55
        
        const validResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD);
        
        if (validResults.length === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'below_threshold'
            };
        }
        
        // Tri par priorité réelle
        validResults.sort((a, b) => {
            // Si un seul a des mots absolus, il gagne
            if (a.hasAbsolute !== b.hasAbsolute) {
                return b.hasAbsolute - a.hasAbsolute;
            }
            
            // CORRECTION: Priorité catégorie AVANT score pour éviter newsletter dominance
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            
            // Puis score
            return b.score - a.score;
        });
        
        const best = validResults[0];
        
        // CORRECTION: Vérification supplémentaire pour marketing_news
        if (best.category === 'marketing_news' && best.score < 70) {
            // Si newsletter avec score faible, chercher alternative
            const alternatives = validResults.filter(r => r.category !== 'marketing_news' && r.score >= 35);
            if (alternatives.length > 0) {
                const alt = alternatives[0];
                return {
                    category: alt.category,
                    score: alt.score,
                    confidence: alt.confidence,
                    matchedPatterns: alt.matches,
                    hasAbsolute: alt.hasAbsolute,
                    reason: 'newsletter_alternative'
                };
            }
        }
        
        return {
            category: best.category,
            score: best.score,
            confidence: best.confidence,
            matchedPatterns: best.matches,
            hasAbsolute: best.hasAbsolute
        };
    }

    // ================================================
    // RECHERCHE TEXTE RAPIDE
    // ================================================
    fastTextSearch(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedKeyword = keyword.toLowerCase();
        
        // Recherche directe
        if (text.includes(normalizedKeyword)) return true;
        
        // Word boundaries pour mots courts
        if (normalizedKeyword.length <= 4) {
            const regex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
            return regex.test(text);
        }
        
        return false;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ================================================
    // DÉTECTIONS SPÉCIALISÉES
    // ================================================
    hasPersonalContent(text) {
        const personalKeywords = ['papa', 'maman', 'bises', 'bisous', 'famille'];
        return personalKeywords.some(keyword => text.includes(keyword));
    }

    isProfessionalCategory(categoryId) {
        return ['internal', 'hr', 'meetings', 'commercial', 'project'].includes(categoryId);
    }

    isPersonalEmail(content) {
        const personalIndicators = ['papa', 'maman', 'bises', 'bisous', 'famille', 'chéri', 'chérie'];
        const text = content.text;
        
        let personalScore = 0;
        for (const indicator of personalIndicators) {
            if (text.includes(indicator)) {
                personalScore += 10;
            }
        }
        
        return personalScore >= 20;
    }

    analyzeCC(email, content) {
        if (!this.shouldDetectCC()) return null;
        
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        if (isInCC && !isMainRecipient) {
            // Vérifier marketing mais avec seuil plus élevé
            if (this.isObviousMarketing(content)) {
                return {
                    category: 'marketing_news',
                    score: 80,
                    confidence: 0.85,
                    isCC: true
                };
            }
            
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                isCC: true
            };
        }
        
        return null;
    }

    isObviousMarketing(content) {
        const strongMarketingKeywords = [
            'unsubscribe', 'désabonner', 'newsletter', 'mailing list',
            'email preferences', 'promotional email', 'marketing email'
        ];
        
        let marketingScore = 0;
        for (const keyword of strongMarketingKeywords) {
            if (content.text.includes(keyword)) {
                marketingScore += 20;
            }
        }
        
        return marketingScore >= 40; // Seuil plus élevé
    }

    isMainRecipient(email) {
        return email.toRecipients && Array.isArray(email.toRecipients) && email.toRecipients.length > 0;
    }

    isInCC(email) {
        return email.ccRecipients && Array.isArray(email.ccRecipients) && email.ccRecipients.length > 0;
    }

    // ================================================
    // MOTS-CLÉS CORRIGÉS - MOINS GÉNÉRIQUES
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    // CORRECTION: Mots-clés très spécifiques newsletters
                    'unsubscribe', 'désabonner', 'opt out', 'opt-out',
                    'email preferences', 'gérer vos préférences',
                    'mailing list', 'newsletter', 'promotional email',
                    'marketing email', 'ne plus recevoir ces emails',
                    'this email was sent to', 'you are receiving this',
                    'email marketing', 'campaign email'
                ],
                strong: [
                    'promo', 'promotion', 'sale', 'soldes',
                    'exclusive offer', 'offre exclusive',
                    'limited time', 'temps limité'
                ],
                weak: ['discover', 'new', 'nouveau'],
                exclusions: ['facture', 'invoice', 'commande', 'order', 'paiement', 'payment']
            },

            security: {
                absolute: [
                    'security alert', 'alerte sécurité', 'alerte de sécurité',
                    'login alert', 'nouvelle connexion', 'new sign-in',
                    'verification code', 'code de vérification',
                    'two-factor', '2fa', 'authentification à deux facteurs',
                    'password reset', 'réinitialisation mot de passe',
                    'suspicious activity', 'activité suspecte',
                    'unauthorized access', 'accès non autorisé'
                ],
                strong: [
                    'sécurité', 'security', 'authentification', 'authentication',
                    'password', 'mot de passe', 'verify', 'vérification',
                    'compte sécurisé', 'secure account'
                ],
                weak: ['compte', 'account', 'login', 'connexion'],
                exclusions: ['newsletter', 'promotion', 'marketing', 'unsubscribe']
            },

            finance: {
                absolute: [
                    'facture', 'invoice', 'facture n°', 'invoice number',
                    'payment', 'paiement', 'virement', 'transfer',
                    'remboursement', 'refund', 'order confirmation',
                    'confirmation de commande', 'confirmation commande',
                    'n°commande', 'numéro commande', 'order number',
                    'livraison', 'delivery', 'shipping', 'expédition',
                    'receipt', 'reçu', 'transaction', 'bank statement'
                ],
                strong: [
                    'montant', 'amount', 'total', 'commande', 'order',
                    'achat', 'purchase', 'prix', 'price', 'cost',
                    'billing', 'facturation', 'finance', 'financial'
                ],
                weak: ['euro', 'dollar', 'money', 'argent'],
                exclusions: ['newsletter', 'promotion', 'marketing', 'unsubscribe']
            },

            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'urgent', 'urgence', 'urgent action',
                    'deadline', 'échéance', 'date limite',
                    'to do', 'à faire', 'task assigned',
                    'tâche assignée', 'please complete',
                    'veuillez compléter', 'validation requise',
                    'approval needed', 'approbation requise',
                    'response required', 'réponse requise'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'task',
                    'tâche', 'demande', 'request', 'correction',
                    'update required', 'mise à jour requise'
                ],
                weak: ['besoin', 'need', 'waiting', 'attente', 'pending'],
                exclusions: ['newsletter', 'marketing', 'famille', 'papa', 'maman']
            },

            meetings: {
                absolute: [
                    'meeting request', 'demande de réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'rendez-vous', 'appointment', 'rdv',
                    'conference call', 'conférence téléphonique',
                    'scheduled meeting', 'réunion programmée'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'conference', 'conférence',
                    'appointment', 'rendez-vous', 'agenda'
                ],
                weak: ['disponible', 'available', 'time', 'heure'],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },

            commercial: {
                absolute: [
                    'devis', 'quotation', 'quote', 'proposal',
                    'proposition commerciale', 'commercial proposal',
                    'contrat', 'contract', 'offre commerciale',
                    'business opportunity', 'opportunité commerciale',
                    'lead', 'prospect', 'customer inquiry'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'commercial',
                    'business', 'vente', 'sales', 'deal',
                    'opportunity', 'opportunité', 'negotiation'
                ],
                weak: ['discussion', 'projet', 'collaboration'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            project: {
                absolute: [
                    'project update', 'mise à jour projet',
                    'project status', 'statut projet',
                    'milestone', 'sprint', 'livrable', 'deliverable',
                    'gantt', 'roadmap', 'kickoff', 'project meeting',
                    'retrospective', 'stand-up', 'daily scrum'
                ],
                strong: [
                    'projet', 'project', 'développement', 'development',
                    'agile', 'scrum', 'kanban', 'milestone',
                    'sprint', 'iteration', 'feature'
                ],
                weak: ['phase', 'étape', 'planning', 'timeline'],
                exclusions: ['newsletter', 'famille', 'personnel']
            },

            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'pay slip',
                    'contrat de travail', 'employment contract',
                    'congés', 'leave request', 'vacation request',
                    'performance review', 'entretien annuel',
                    'human resources', 'ressources humaines',
                    'job offer', 'offre d\'emploi'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary', 'pay',
                    'ressources humaines', 'human resources',
                    'contrat', 'contract', 'emploi', 'job',
                    'employee', 'employé'
                ],
                weak: ['staff', 'personnel', 'équipe', 'team'],
                exclusions: ['newsletter', 'famille', 'personnel', 'papa', 'maman']
            },

            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'support ticket', 'ticket de support',
                    'helpdesk', 'help desk', 'technical support',
                    'support technique', 'issue resolved'
                ],
                strong: [
                    'support', 'assistance', 'help', 'aide',
                    'ticket', 'incident', 'problème', 'problem',
                    'issue', 'bug', 'error', 'erreur'
                ],
                weak: ['question', 'demande d\'aide', 'help request'],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },

            reminders: {
                absolute: [
                    'reminder', 'rappel', 'follow up', 'follow-up',
                    'relance', 'gentle reminder', 'rappel amical',
                    'following up', 'suite à notre', 'as discussed',
                    'comme convenu', 'pending response'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'pending', 'en attente', 'waiting'
                ],
                weak: ['encore', 'still', 'previous', 'précédent'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'all employees',
                    'company announcement', 'annonce interne',
                    'annonce entreprise', 'memo interne',
                    'internal memo', 'note de service',
                    'communication interne', 'internal communication'
                ],
                strong: [
                    'internal', 'interne', 'company', 'entreprise',
                    'société', 'annonce', 'announcement', 'memo',
                    'staff', 'personnel', 'employees'
                ],
                weak: ['information', 'update', 'news'],
                exclusions: ['newsletter', 'externe', 'external', 'client', 'customer']
            },

            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply',
                    'no-reply', 'donotreply', 'automated message',
                    'message automatique', 'notification automatique',
                    'system notification', 'auto-generated'
                ],
                strong: [
                    'automated', 'automatique', 'automatic',
                    'notification', 'alert', 'system', 'système'
                ],
                weak: ['info', 'information', 'update'],
                exclusions: ['urgent', 'action required', 'deadline']
            },

            cc: {
                absolute: [
                    'copie pour information', 'for your information',
                    'fyi', 'en copie', 'in copy', 'cc:',
                    'courtesy copy', 'copie de courtoisie'
                ],
                strong: ['information', 'copie', 'copy', 'cc'],
                weak: ['info', 'fyi'],
                exclusions: ['urgent', 'action required', 'deadline', 'facture', 'invoice']
            }
        };

        console.log('[CategoryManager] Mots-clés équilibrés initialisés');
    }

    // ================================================
    // MÉTHODES CACHE OPTIMISÉES POUR QUOTA
    // ================================================
    createCacheKey(email) {
        // Clé plus courte pour économiser l'espace
        const key = `${email.from?.emailAddress?.address || ''}|${(email.subject || '').substring(0, 30)}`;
        return this.hashString(key);
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    getCachedAnalysis(email) {
        const key = this.createCacheKey(email);
        const cached = this.analysisCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            return cached.result;
        }
        
        return null;
    }

    setCachedAnalysis(email, result) {
        const key = this.createCacheKey(email);
        
        if (this.analysisCache.size >= this.cacheMaxSize) {
            const firstKey = this.analysisCache.keys().next().value;
            this.analysisCache.delete(firstKey);
        }
        
        // Stocker seulement les infos essentielles pour économiser l'espace
        this.analysisCache.set(key, {
            result: {
                category: result.category,
                score: result.score,
                confidence: result.confidence,
                hasAbsolute: result.hasAbsolute
            },
            timestamp: Date.now()
        });
    }
