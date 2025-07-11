// CategoryManager.js - Version 22.0 - Détection Newsletter Prioritaire
// Simplifié : Les newsletters sont toujours détectées en premier

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // Système de synchronisation renforcé
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        // Initialisation immédiate et synchrone
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.initializeFilters();
        
        // Marquer comme initialisé
        this.isInitialized = true;
        
        // Setup asynchrone
        setTimeout(() => {
            this.setupEventListeners();
            this.startAutoSync();
        }, 10);
        
        console.log('[CategoryManager] ✅ Version 22.0 - Détection Newsletter Prioritaire');
    }

    // ================================================
    // SYSTÈME DE SYNCHRONISATION AUTOMATIQUE
    // ================================================
    startAutoSync() {
        if (this.syncInterval) return;
        
        this.syncInterval = setInterval(() => {
            this.processSettingsChanges();
        }, 2000);
        
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
        
        console.log(`[CategoryManager] 📝 Application changement: ${type}`, value);
        
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

    // ================================================
    // MÉTHODES DE NOTIFICATION RENFORCÉES
    // ================================================
    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification spécialisée: ${type}`);
        
        // EmailScanner - PRIORITÉ ABSOLUE
        if (window.emailScanner) {
            switch (type) {
                case 'taskPreselectedCategories':
                    console.log('[CategoryManager] → EmailScanner: taskPreselectedCategories');
                    if (typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
                        window.emailScanner.updateTaskPreselectedCategories(value);
                    }
                    setTimeout(() => {
                        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                            console.log('[CategoryManager] → EmailScanner: Déclenchement re-catégorisation');
                            window.emailScanner.recategorizeEmails?.();
                        }
                    }, 100);
                    break;
                    
                case 'activeCategories':
                    console.log('[CategoryManager] → EmailScanner: activeCategories');
                    if (typeof window.emailScanner.updateSettings === 'function') {
                        window.emailScanner.updateSettings({ activeCategories: value });
                    }
                    setTimeout(() => {
                        if (window.emailScanner.emails && window.emailScanner.emails.length > 0) {
                            window.emailScanner.recategorizeEmails?.();
                        }
                    }, 100);
                    break;
                    
                case 'categoryExclusions':
                case 'preferences':
                    if (typeof window.emailScanner.updateSettings === 'function') {
                        window.emailScanner.updateSettings({ [type]: value });
                    }
                    break;
            }
        }
        
        // AITaskAnalyzer
        if (window.aiTaskAnalyzer) {
            if (type === 'taskPreselectedCategories') {
                console.log('[CategoryManager] → AITaskAnalyzer: taskPreselectedCategories');
                if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
            }
            if (type === 'automationSettings') {
                console.log('[CategoryManager] → AITaskAnalyzer: automationSettings');
                if (typeof window.aiTaskAnalyzer.updateAutomationSettings === 'function') {
                    window.aiTaskAnalyzer.updateAutomationSettings(value);
                }
            }
        }
        
        // StartScan/MinimalScanModule
        if (window.minimalScanModule || window.scanStartModule || window.unifiedScanModule) {
            const scanner = window.unifiedScanModule || window.minimalScanModule || window.scanStartModule;
            if (type === 'taskPreselectedCategories' || type === 'scanSettings') {
                console.log('[CategoryManager] → ScanModule:', type);
                if (typeof scanner.updateSettings === 'function') {
                    scanner.updateSettings({ [type]: value });
                }
            }
        }
        
        // PageManager
        if (window.pageManager) {
            console.log('[CategoryManager] → PageManager:', type);
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
    // API PUBLIQUE POUR CHANGEMENTS DE PARAMÈTRES
    // ================================================
    updateSettings(newSettings, notifyModules = true) {
        console.log('[CategoryManager] 📝 updateSettings appelé:', newSettings);
        
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
        
        this.invalidateTaskCategoriesCache();
        
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

    updateCategoryExclusions(exclusions, notifyModules = true) {
        console.log('[CategoryManager] 🚫 updateCategoryExclusions:', exclusions);
        
        this.syncQueue.push({
            type: 'categoryExclusions',
            value: exclusions,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updatePreferences(preferences, notifyModules = true) {
        console.log('[CategoryManager] ⚙️ updatePreferences:', preferences);
        
        this.syncQueue.push({
            type: 'preferences',
            value: preferences,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateScanSettings(scanSettings, notifyModules = true) {
        console.log('[CategoryManager] 🔍 updateScanSettings:', scanSettings);
        
        this.syncQueue.push({
            type: 'scanSettings',
            value: scanSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateAutomationSettings(automationSettings, notifyModules = true) {
        console.log('[CategoryManager] 🤖 updateAutomationSettings:', automationSettings);
        
        this.syncQueue.push({
            type: 'automationSettings',
            value: automationSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    // ================================================
    // GESTION DES PARAMÈTRES CENTRALISÉE RENFORCÉE
    // ================================================
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            const defaultSettings = this.getDefaultSettings();
            
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                const mergedSettings = { ...defaultSettings, ...parsedSettings };
                console.log('[CategoryManager] ✅ Settings chargés depuis localStorage');
                return mergedSettings;
            } else {
                console.log('[CategoryManager] 📝 Utilisation settings par défaut');
                return defaultSettings;
            }
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement paramètres:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettingsToStorage() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            console.log('[CategoryManager] 💾 Settings sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde paramètres:', error);
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

    getDefaultSettings() {
        return {
            activeCategories: null, // null = toutes actives
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: [], // VIDE par défaut
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

    // ================================================
    // MÉTHODES PUBLIQUES POUR LES AUTRES MODULES
    // ================================================
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        const now = Date.now();
        const CACHE_DURATION = 10000; // 10 secondes
        
        if (this._taskCategoriesCache && 
            this._taskCategoriesCacheTime && 
            (now - this._taskCategoriesCacheTime) < CACHE_DURATION) {
            return [...this._taskCategoriesCache];
        }
        
        const categories = this.settings.taskPreselectedCategories || [];
        
        this._taskCategoriesCache = [...categories];
        this._taskCategoriesCacheTime = now;
        
        if (!this._lastLoggedTaskCategories || 
            JSON.stringify(this._lastLoggedTaskCategories) !== JSON.stringify(categories)) {
            console.log('[CategoryManager] 📋 Catégories tâches mises à jour:', categories);
            this._lastLoggedTaskCategories = [...categories];
        }
        
        return [...categories];
    }

    invalidateTaskCategoriesCache() {
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        console.log('[CategoryManager] 🔄 Cache des catégories tâches invalidé');
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            const allCategories = Object.keys(this.categories);
            console.log('[CategoryManager] Toutes catégories actives:', allCategories);
            return allCategories;
        }
        
        return [...this.settings.activeCategories];
    }

    isCategoryActive(categoryId) {
        const activeCategories = this.getActiveCategories();
        return activeCategories.includes(categoryId);
    }

    getScanSettings() {
        return { ...this.settings.scanSettings };
    }

    getAutomationSettings() {
        return { ...this.settings.automationSettings };
    }

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    // ================================================
    // SYSTÈME D'ÉCOUTE POUR AUTRES MODULES
    // ================================================
    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    removeChangeListener(callback) {
        this.changeListeners.delete(callback);
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] Catégories personnalisées sauvegardées');
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde catégories personnalisées:', error);
        }
    }

    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            this.customCategories = saved ? JSON.parse(saved) : {};
            
            console.log('[CategoryManager] 📁 Chargement catégories personnalisées...');
            
            Object.entries(this.customCategories).forEach(([id, category]) => {
                this.categories[id] = {
                    ...category,
                    isCustom: true
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
                
                const totalKeywords = this.getTotalKeywordsCount(id);
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" (${id}):`);
                console.log(`  - Mots-clés: ${totalKeywords}`);
                
                if (totalKeywords === 0) {
                    console.warn(`  ⚠️ AUCUN MOT-CLÉ - La catégorie ne pourra pas détecter d'emails!`);
                }
                
                if (this.settings.activeCategories === null) {
                    console.log(`  ✅ Catégorie active par défaut`);
                } else if (Array.isArray(this.settings.activeCategories)) {
                    if (!this.settings.activeCategories.includes(id)) {
                        console.log(`  ➕ Ajout aux catégories actives`);
                        this.settings.activeCategories.push(id);
                        this.saveSettingsToStorage();
                    }
                }
            });
            
            console.log('[CategoryManager] 📊 Résumé:');
            console.log('  - Catégories personnalisées chargées:', Object.keys(this.customCategories).length);
            console.log('  - Total catégories:', Object.keys(this.categories).length);
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    getTotalKeywordsCount(categoryId) {
        const keywords = this.weightedKeywords[categoryId];
        if (!keywords) return 0;
        
        return (keywords.absolute?.length || 0) + 
               (keywords.strong?.length || 0) + 
               (keywords.weak?.length || 0) + 
               (keywords.exclusions?.length || 0);
    }

    createCustomCategory(categoryData) {
        const id = this.generateCategoryId(categoryData.name);
        
        const category = {
            id: id,
            name: categoryData.name,
            icon: categoryData.icon || '📂',
            color: categoryData.color || '#6366f1',
            description: categoryData.description || '',
            createdAt: new Date().toISOString(),
            isCustom: true,
            keywords: categoryData.keywords || { absolute: [], strong: [], weak: [], exclusions: [] }
        };

        this.customCategories[id] = category;
        this.categories[id] = category;
        
        this.weightedKeywords[id] = {
            absolute: category.keywords.absolute || [],
            strong: category.keywords.strong || [],
            weak: category.keywords.weak || [],
            exclusions: category.keywords.exclusions || []
        };

        this.saveCustomCategories();
        
        setTimeout(() => {
            this.dispatchEvent('categoryCreated', { categoryId: id, category });
        }, 10);

        console.log('[CategoryManager] Catégorie personnalisée créée:', category);
        return category;
    }

    updateCustomCategory(categoryId, updates) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        const updatedCategory = {
            ...this.customCategories[categoryId],
            ...updates,
            keywords: updates.keywords || this.customCategories[categoryId].keywords,
            updatedAt: new Date().toISOString()
        };

        this.customCategories[categoryId] = updatedCategory;
        this.categories[categoryId] = updatedCategory;
        
        if (updates.keywords) {
            this.weightedKeywords[categoryId] = {
                absolute: updates.keywords.absolute || [],
                strong: updates.keywords.strong || [],
                weak: updates.keywords.weak || [],
                exclusions: updates.keywords.exclusions || []
            };
        }

        this.saveCustomCategories();
        
        setTimeout(() => {
            this.dispatchEvent('categoryUpdated', { categoryId, category: updatedCategory });
        }, 10);

        console.log('[CategoryManager] Catégorie mise à jour:', categoryId);
        return updatedCategory;
    }

    deleteCustomCategory(categoryId) {
        if (!this.customCategories[categoryId]) {
            throw new Error('Catégorie personnalisée non trouvée');
        }

        if (this.settings.taskPreselectedCategories?.includes(categoryId)) {
            const newPreselected = this.settings.taskPreselectedCategories.filter(id => id !== categoryId);
            this.updateTaskPreselectedCategories(newPreselected);
        }

        if (this.settings.activeCategories?.includes(categoryId)) {
            const newActive = this.settings.activeCategories.filter(id => id !== categoryId);
            this.updateActiveCategories(newActive);
        }

        delete this.customCategories[categoryId];
        delete this.categories[categoryId];
        delete this.weightedKeywords[categoryId];

        this.saveCustomCategories();
        
        setTimeout(() => {
            this.dispatchEvent('categoryDeleted', { categoryId });
        }, 10);

        console.log('[CategoryManager] Catégorie supprimée:', categoryId);
    }

    generateCategoryId(name) {
        const base = name.toLowerCase()
            .replace(/[àâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        let id = 'custom_' + base;
        let counter = 1;
        
        while (this.categories[id] || this.customCategories[id]) {
            id = `custom_${base}_${counter}`;
            counter++;
        }
        
        return id;
    }

    getCustomCategories() {
        return { ...this.customCategories };
    }

    // ================================================
    // GESTION DES MOTS-CLÉS PAR CATÉGORIE
    // ================================================
    updateCategoryKeywords(categoryId, keywords) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }

        console.log(`[CategoryManager] Mise à jour mots-clés pour ${categoryId}:`, keywords);

        this.weightedKeywords[categoryId] = {
            absolute: keywords.absolute || [],
            strong: keywords.strong || [],
            weak: keywords.weak || [],
            exclusions: keywords.exclusions || []
        };

        if (this.customCategories[categoryId]) {
            this.customCategories[categoryId].keywords = this.weightedKeywords[categoryId];
            this.saveCustomCategories();
        }

        console.log(`[CategoryManager] Mots-clés mis à jour pour ${categoryId}`);
        
        setTimeout(() => {
            this.dispatchEvent('keywordsUpdated', { categoryId, keywords: this.weightedKeywords[categoryId] });
        }, 10);
    }

    getCategoryKeywords(categoryId) {
        const keywords = this.weightedKeywords[categoryId];
        if (!keywords) {
            return {
                absolute: [],
                strong: [],
                weak: [],
                exclusions: []
            };
        }
        
        return {
            absolute: keywords.absolute || [],
            strong: keywords.strong || [],
            weak: keywords.weak || [],
            exclusions: keywords.exclusions || []
        };
    }

    addKeywordToCategory(categoryId, keyword, type = 'strong') {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }

        if (!this.weightedKeywords[categoryId]) {
            this.weightedKeywords[categoryId] = { absolute: [], strong: [], weak: [], exclusions: [] };
        }

        if (!this.weightedKeywords[categoryId][type]) {
            this.weightedKeywords[categoryId][type] = [];
        }

        const normalizedKeyword = keyword.toLowerCase().trim();
        if (!this.weightedKeywords[categoryId][type].includes(normalizedKeyword)) {
            this.weightedKeywords[categoryId][type].push(normalizedKeyword);
            this.updateCategoryKeywords(categoryId, this.weightedKeywords[categoryId]);
        }
    }

    removeKeywordFromCategory(categoryId, keyword, type) {
        if (!this.categories[categoryId] || !this.weightedKeywords[categoryId]) {
            return;
        }

        if (this.weightedKeywords[categoryId][type]) {
            const normalizedKeyword = keyword.toLowerCase().trim();
            this.weightedKeywords[categoryId][type] = this.weightedKeywords[categoryId][type].filter(k => k !== normalizedKeyword);
            this.updateCategoryKeywords(categoryId, this.weightedKeywords[categoryId]);
        }
    }

    getAllKeywords() {
        return { ...this.weightedKeywords };
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            // NEWSLETTER & MARKETING - Toujours analysé en premier
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                isCustom: false
            },
            
            // CATÉGORIE CC
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                isCustom: false
            },
            
            // RESSOURCES HUMAINES
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines et recrutement',
                isCustom: false
            },
            
            // COMMERCIAL
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités commerciales, devis et contrats',
                isCustom: false
            },
            
            // AUTRES CATÉGORIES
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité, connexions et authentification',
                isCustom: false
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                isCustom: false
            },
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire et demandes d\'action',
                isCustom: false
            },
            
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                isCustom: false
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                isCustom: false
            },
            
            reminders: {
                name: 'Relances',
                icon: '🔄',
                color: '#10b981',
                description: 'Rappels et suivis',
                isCustom: false
            },
            
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion de projet',
                isCustom: false
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                isCustom: false
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques',
                isCustom: false
            }
        };
        
        this.isInitialized = true;
    }

    // ================================================
    // INITIALISATION DES MOTS-CLÉS PONDÉRÉS - VERSION SIMPLIFIÉE
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS - Détection newsletter améliorée
            marketing_news: {
                absolute: [
                    // Mots-clés de désabonnement standards
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'paramétrez vos choix', 'parametrez vos choix',
                    
                    // Headers et footers typiques des newsletters
                    'list-unsubscribe', 'list-unsubscribe-post', 'unsubscribe link',
                    'one-click unsubscribe', 'click here to unsubscribe',
                    'manage email preferences', 'update email preferences',
                    'remove from mailing list', 'remove from list',
                    
                    // Termes newsletter/marketing
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'limited offer', 'offre limitée', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente privée',
                    'ventes en ligne', 'vente en ligne', 'shopping',
                    'disable these notifications', 'turn off notifications',
                    'manage notifications', 'notification settings',
                    'email settings', 'communication preferences',
                    'update your preferences', 'modify your subscription',
                    
                    // Patterns marketing additionnels
                    'marketing email', 'promotional email', 'bulk email',
                    'mass email', 'campaign email', 'automated email',
                    'marketing message', 'promotional message',
                    'if you no longer wish', 'to stop receiving',
                    'email sent by', 'sent on behalf of',
                    
                    // Footer patterns pour Outlook
                    'why am i receiving this', 'pourquoi je reçois',
                    'you received this email because', 'vous recevez cet email',
                    'to opt out', 'pour vous désabonner',
                    'update subscription', 'mettre à jour abonnement',
                    'email frequency', 'fréquence des emails'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount', 'réduction',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'exclusive', 'special', 'limited', 'new', 'nouveau',
                    'boutique', 'shopping', 'acheter', 'commander',
                    'offre', 'promotion', 'remise', 'solde',
                    'notifications', 'alerts', 'updates', 'subscribe',
                    'flash sale', 'early access', 'vip', 'member'
                ],
                weak: ['update', 'discover', 'new', 'nouveauté', 'découvrir', 'news'],
                exclusions: ['facture', 'invoice', 'payment', 'contract']
            },

            // RESSOURCES HUMAINES
            hr: {
                absolute: [
                    'ressources humaines', 'human resources', 'département rh', 'service rh',
                    'hr department', 'hr team', 'équipe rh', 'direction rh',
                    'offre d\'emploi', 'job offer', 'job opening', 'poste à pourvoir',
                    'nous recrutons', 'we are hiring', 'recrutement', 'recruitment',
                    'candidature', 'application', 'postuler', 'apply now',
                    'cv reçu', 'resume received', 'profil correspond',
                    'entretien rh', 'hr interview', 'entretien recrutement',
                    'onboarding', 'intégration', 'nouveau collaborateur',
                    'bulletin de paie', 'payslip', 'fiche de paie',
                    'congés', 'leave request', 'demande de congés',
                    'entretien annuel', 'performance review', 'évaluation annuelle',
                    'formation obligatoire', 'mandatory training',
                    'contrat de travail', 'employment contract',
                    'mutuelle entreprise', 'company health insurance',
                    'tickets restaurant', 'meal vouchers',
                    'note de frais', 'expense report',
                    'attestation employeur', 'employment certificate'
                ],
                strong: [
                    'rh', 'hr', 'recrutement', 'recruitment', 'recruiter', 'recruteur',
                    'talent', 'candidat', 'candidate', 'emploi', 'job', 'poste',
                    'embauche', 'hiring', 'salaire', 'salary', 'paie', 'payroll',
                    'congés', 'vacation', 'absence', 'formation', 'training',
                    'carrière', 'career', 'évolution', 'promotion',
                    'collaborateur', 'employee', 'personnel', 'staff'
                ],
                weak: ['équipe', 'team', 'entreprise', 'company', 'organisation'],
                exclusions: [
                    'client', 'customer', 'prospect', 'lead', 'opportunity',
                    'devis', 'quotation', 'proposal', 'marché', 'deal',
                    'vente', 'sales', 'commercial', 'business development',
                    'famille', 'family', 'papa', 'maman', 'personnel', 'personal',
                    'bises', 'bisous', 'familial'
                ]
            },

            // COMMERCIAL
            commercial: {
                absolute: [
                    'devis commercial', 'commercial quotation', 'proposal',
                    'proposition commerciale', 'business proposal',
                    'contrat commercial', 'commercial contract',
                    'bon de commande', 'purchase order',
                    'offre commerciale', 'commercial offer',
                    'opportunity', 'opportunité commerciale', 'lead qualifié',
                    'qualified lead', 'prospect chaud', 'hot prospect',
                    'nouveau client potentiel', 'new potential customer',
                    'closing', 'signature contrat', 'contract signing',
                    'négociation commerciale', 'business negotiation',
                    'rendez-vous commercial', 'sales meeting',
                    'démonstration produit', 'product demo',
                    'présentation commerciale', 'sales presentation'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity', 'opportunité',
                    'commercial', 'business', 'marché', 'deal', 'contrat',
                    'vente', 'sales', 'négociation', 'closing', 'signature',
                    'revenue', 'chiffre affaires', 'commission', 'marge',
                    'partenariat', 'partnership', 'distributeur', 'revendeur'
                ],
                weak: ['offre', 'proposition', 'discussion', 'projet', 'collaboration'],
                exclusions: [
                    'ressources humaines', 'human resources', 'rh', 'hr',
                    'recrutement', 'recruitment', 'candidature', 'cv',
                    'entretien rh', 'hr interview', 'onboarding',
                    'bulletin de paie', 'payslip', 'congés', 'formation rh',
                    'newsletter', 'marketing', 'promotion', 'unsubscribe',
                    'ventes en ligne', 'shopping', 'boutique en ligne'
                ]
            },

            // SÉCURITÉ
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'password reset', 'réinitialisation mot de passe',
                    'unusual activity', 'activité inhabituelle',
                    'security alert', 'alerte sécurité'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe',
                    'connexion', 'login', 'access', 'accès'
                ],
                weak: ['compte', 'account', 'protection'],
                exclusions: ['newsletter', 'unsubscribe', 'promotion']
            },

            // TÂCHES
            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable',
                    'urgence', 'urgent', 'très urgent',
                    'demande update', 'update request', 'mise à jour demandée',
                    'demande de mise à jour', 'update needed', 'mise a jour requise',
                    'correction requise', 'à corriger', 'please review',
                    'merci de valider', 'validation requise', 'approval needed',
                    'action immédiate', 'immediate action', 'urgent action'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'update', 'mise à jour', 'demande', 'request',
                    'task', 'tâche', 'todo', 'à faire',
                    'correction', 'corriger', 'modifier', 'révision',
                    'deadline', 'échéance', 'due', 'livrable'
                ],
                weak: ['demande', 'besoin', 'attente', 'request', 'need', 'waiting'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'unsubscribe', 'papa', 'maman', 'famille']
            },

            // RÉUNIONS
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'rendez-vous', 'appointment', 'rdv',
                    'webinar', 'webinaire', 'conférence en ligne'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment', 'agenda',
                    'conférence', 'conference', 'call', 'visio',
                    'participants', 'attendees', 'invités'
                ],
                weak: ['présentation', 'agenda', 'disponible', 'available'],
                exclusions: ['newsletter', 'promotion', 'marketing', 'papa', 'maman', 'famille']
            },

            // FINANCE
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement', 'refund',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration',
                    'n°commande', 'numéro commande', 'order number',
                    'numéro de commande', 'commande n°', 'commande numéro',
                    'livraison commande', 'commande expédiée',
                    'confirmation commande', 'order confirmation',
                    'échéance paiement', 'payment due', 'date limite paiement'
                ],
                strong: [
                    'montant', 'amount', 'total', 'facture',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'commande', 'order', 'achat', 'vente',
                    'livraison', 'delivery', 'expédition', 'shipping',
                    'prix', 'price', 'coût', 'cost', 'paiement', 'payment'
                ],
                weak: ['euro', 'dollar', 'prix', 'payment', 'transaction'],
                exclusions: ['newsletter', 'marketing', 'spam', 'promotion', 'soldes', 'ventes en ligne']
            },

            // PROJETS
            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'retrospective', 'roadmap',
                    'document corrigé', 'version corrigée', 'corrections apportées',
                    'cahier des charges', 'specifications', 'requirements'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'jira',
                    'development', 'développement',
                    'document', 'présentation', 'correction',
                    'planning', 'timeline', 'deliverable'
                ],
                weak: ['development', 'phase', 'étape', 'planning', 'présentation'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'papa', 'maman', 'famille', 'bises']
            },

            // RELANCES
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'as discussed',
                    'suite à notre échange', 'further to our discussion'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu', 'discussed', 'pending',
                    'attente', 'waiting', 'réponse', 'response'
                ],
                weak: ['previous', 'discussed', 'encore', 'still'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            // SUPPORT
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'demande de support',
                    'assistance technique', 'technical support'
                ],
                strong: [
                    'support', 'assistance', 'help desk',
                    'technical support', 'ticket', 'incident',
                    'problème', 'problem', 'issue', 'bug',
                    'résolution', 'resolution', 'fix'
                ],
                weak: ['help', 'aide', 'issue', 'question'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },

            // COMMUNICATION INTERNE
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'memo interne',
                    'communication interne', 'note de service',
                    'à tous', 'to all employees', 'all hands',
                    'company wide', 'entreprise entière'
                ],
                strong: [
                    'internal', 'interne', 'company wide',
                    'personnel', 'staff', 'équipe',
                    'annonce', 'announcement', 'memo',
                    'policy', 'politique', 'procédure'
                ],
                weak: ['annonce', 'announcement', 'information', 'update'],
                exclusions: ['newsletter', 'marketing', 'external', 'client', 'papa', 'maman', 'famille', 'bises']
            },

            // NOTIFICATIONS
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique',
                    'system notification', 'ceci est un message automatique',
                    'no-reply@', 'donotreply@', 'automatic notification'
                ],
                strong: [
                    'automated', 'automatic', 'system',
                    'notification', 'automatique', 'alert'
                ],
                weak: ['notification', 'alert', 'info'],
                exclusions: ['newsletter', 'marketing', 'urgent']
            },

            // EN COPIE
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy',
                    'pour info', 'pour information'
                ],
                strong: ['information', 'copie', 'copy', 'cc'],
                weak: ['fyi', 'info'],
                exclusions: [
                    'commande', 'order', 'facture', 'invoice',
                    'urgent', 'action required', 'payment'
                ]
            }
        };

        console.log('[CategoryManager] Mots-clés par défaut initialisés pour', Object.keys(this.weightedKeywords).length, 'catégories');
    }

    // ================================================
    // ANALYSE D'EMAIL PRINCIPALE - VERSION SIMPLIFIÉE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // ÉTAPE 1: Toujours vérifier les newsletters en premier
        const newsletterCheck = this.checkNewsletter(email);
        if (newsletterCheck.isNewsletter) {
            return {
                category: 'marketing_news',
                score: newsletterCheck.score,
                confidence: newsletterCheck.confidence,
                matchedPatterns: newsletterCheck.patterns,
                hasAbsolute: true,
                gmailUnsubscribe: newsletterCheck.gmailUnsubscribe || false
            };
        }
        
        // ÉTAPE 2: Vérifications standards
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email);
        
        if (this.isGloballyExcluded(content, email)) {
            return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
        }
        
        if (this.isPersonalEmail(content, email)) {
            if (this.categories.personal || this.customCategories.personal) {
                return {
                    category: 'personal',
                    score: 100,
                    confidence: 0.95,
                    matchedPatterns: [{ keyword: 'personal_email_detected', type: 'absolute', score: 100 }],
                    hasAbsolute: true,
                    isPersonal: true
                };
            } else {
                return { category: 'excluded', score: 0, confidence: 0, isExcluded: true, reason: 'personal' };
            }
        }
        
        // ÉTAPE 3: Vérifier si en copie
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
            const allResults = this.analyzeAllCategories(content);
            const bestNonCC = Object.values(allResults)
                .filter(r => r.category !== 'cc')
                .sort((a, b) => b.score - a.score)[0];
            
            if (bestNonCC && bestNonCC.score >= 100 && bestNonCC.hasAbsolute) {
                return {
                    category: bestNonCC.category,
                    score: bestNonCC.score,
                    confidence: bestNonCC.confidence,
                    matchedPatterns: bestNonCC.matches,
                    hasAbsolute: bestNonCC.hasAbsolute,
                    isCC: true
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
        
        // ÉTAPE 4: Analyse normale des autres catégories
        const allResults = this.analyzeAllCategories(content);
        const selectedResult = this.selectBestCategory(allResults);
        
        if (!selectedResult || selectedResult.category === 'other' || selectedResult.score === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'no_category_matched'
            };
        }
        
        return selectedResult;
    }

    // NOUVELLE MÉTHODE: Vérification newsletter prioritaire
    checkNewsletter(email) {
        const patterns = [];
        let score = 0;
        let hasUnsubscribe = false;
        let gmailUnsubscribe = false;
        
        // 1. Vérifier le bouton Gmail (EmailScanner s'en occupe déjà)
        if (email.hasGmailUnsubscribe) {
            gmailUnsubscribe = true;
            score += 200;
            patterns.push({ keyword: 'gmail_unsubscribe_button', type: 'absolute', score: 200 });
            hasUnsubscribe = true;
        }
        
        // 2. Extraire le contenu complet
        const content = this.extractCompleteContent(email);
        const text = content.text.toLowerCase();
        
        // 3. Vérifier les mots-clés de désabonnement
        const unsubscribeKeywords = [
            'unsubscribe', 'se désinscrire', 'se desinscrire', 'désabonner', 'opt-out',
            'opt out', 'gérer vos préférences', 'manage preferences', 'email preferences',
            'ne plus recevoir', 'stop emails', 'update subscription'
        ];
        
        for (const keyword of unsubscribeKeywords) {
            if (text.includes(keyword)) {
                score += 100;
                patterns.push({ keyword, type: 'absolute', score: 100 });
                hasUnsubscribe = true;
                break;
            }
        }
        
        // 4. Vérifier les patterns typiques de newsletter
        const newsletterPatterns = [
            'newsletter', 'mailing list', 'this email was sent to',
            'you are receiving this', 'promotional email', 'marketing email',
            'sent on behalf of', 'why am i receiving this'
        ];
        
        for (const pattern of newsletterPatterns) {
            if (text.includes(pattern)) {
                score += 50;
                patterns.push({ keyword: pattern, type: 'strong', score: 50 });
            }
        }
        
        // 5. Vérifier les domaines marketing connus
        const marketingDomains = [
            'mailchimp', 'sendinblue', 'mailjet', 'campaign', 'newsletter',
            'marketing', 'promo', 'deals', 'shop', 'store'
        ];
        
        const domain = content.domain;
        for (const marketingDomain of marketingDomains) {
            if (domain.includes(marketingDomain)) {
                score += 40;
                patterns.push({ keyword: `${marketingDomain}_domain`, type: 'domain', score: 40 });
                break;
            }
        }
        
        // Décision finale
        const isNewsletter = hasUnsubscribe || score >= 100;
        const confidence = isNewsletter ? Math.min(0.99, 0.5 + (score / 400)) : 0;
        
        return {
            isNewsletter,
            score,
            confidence,
            patterns,
            gmailUnsubscribe
        };
    }

    isPersonalEmail(content, email) {
        const personalIndicators = [
            'papa', 'maman', 'mamie', 'papy', 'papi',
            'chéri', 'chérie', 'mon amour', 'ma chérie',
            'bises', 'bisous', 'gros bisous', 'je t\'embrasse',
            'famille', 'familial', 'personnel', 'personal'
        ];
        
        const professionalCounterIndicators = [
            'ressources humaines', 'human resources', 'rh',
            'contrat', 'contract', 'entreprise', 'company',
            'professionnel', 'professional', 'business'
        ];
        
        const text = content.text.toLowerCase();
        
        let personalScore = 0;
        personalIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                personalScore += 10;
            }
        });
        
        let professionalScore = 0;
        professionalCounterIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                professionalScore += 10;
            }
        });
        
        return personalScore > 20 && professionalScore < 10;
    }

    isMainRecipient(email) {
        if (!email.toRecipients || !Array.isArray(email.toRecipients)) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) {
            return email.toRecipients.length > 0;
        }
        
        return email.toRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
    }

    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        const customCategoryIds = Object.keys(this.customCategories);
        
        if (this.debugMode) {
            console.log('[CategoryManager] 🎯 Analyse avec:');
            console.log('  - Catégories actives:', activeCategories);
            console.log('  - Catégories personnalisées:', customCategoryIds);
        }
        
        // Analyser toutes les catégories (sauf marketing_news déjà vérifié)
        const allCategoriesToAnalyze = new Set([
            ...Object.keys(this.weightedKeywords).filter(cat => cat !== 'marketing_news'),
            ...customCategoryIds
        ]);
        
        for (const categoryId of allCategoriesToAnalyze) {
            const isActive = activeCategories.includes(categoryId);
            const isCustom = customCategoryIds.includes(categoryId);
            const isSpecial = ['cc'].includes(categoryId);
            
            if (!isActive && !isCustom && !isSpecial) {
                continue;
            }
            
            if (!this.categories[categoryId]) {
                console.warn(`[CategoryManager] ⚠️ Catégorie ${categoryId} non trouvée`);
                continue;
            }
            
            let keywords = this.weightedKeywords[categoryId];
            
            if (isCustom && (!keywords || this.isEmptyKeywords(keywords))) {
                const customCat = this.customCategories[categoryId];
                if (customCat && customCat.keywords) {
                    keywords = customCat.keywords;
                    this.weightedKeywords[categoryId] = keywords;
                }
            }
            
            if (!keywords || this.isEmptyKeywords(keywords)) {
                if (isCustom) {
                    console.warn(`[CategoryManager] ⚠️ Catégorie personnalisée ${categoryId} (${this.categories[categoryId]?.name}) sans mots-clés`);
                }
                continue;
            }
            
            const score = this.calculateScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                hasAbsolute: score.hasAbsolute,
                matches: score.matches,
                confidence: this.calculateConfidence(score),
                isCustom: isCustom
            };
            
            if (this.debugMode && score.total > 0) {
                console.log(`[CategoryManager] 📊 ${categoryId}: ${score.total}pts (${score.matches.length} matches)`);
            }
        }
        
        return results;
    }

    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

    selectBestCategory(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // Priorité aux mots absolus
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Ensuite par score
                return b.score - a.score;
            });
        
        if (this.debugMode) {
            console.log('[CategoryManager] 📊 Scores par catégorie:');
            sortedResults.forEach(r => {
                console.log(`  - ${r.category}: ${r.score}pts (confidence: ${r.confidence}, hasAbsolute: ${r.hasAbsolute})`);
            });
        }
        
        const bestResult = sortedResults[0];
        
        if (bestResult) {
            console.log(`[CategoryManager] ✅ Catégorie sélectionnée: ${bestResult.category} (${bestResult.score}pts, ${Math.round(bestResult.confidence * 100)}%)`);
            return {
                category: bestResult.category,
                score: bestResult.score,
                confidence: bestResult.confidence,
                matchedPatterns: bestResult.matches,
                hasAbsolute: bestResult.hasAbsolute
            };
        }
        
        console.log('[CategoryManager] 📌 Aucune catégorie correspondante, classification "other"');
        return {
            category: 'other',
            score: 0,
            confidence: 0,
            matchedPatterns: [],
            hasAbsolute: false,
            reason: 'below_threshold'
        };
    }

    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Pénalité pour contenu personnel
        const personalIndicators = ['papa', 'maman', 'bises', 'bisous', 'famille'];
        const hasPersonalContent = personalIndicators.some(indicator => text.includes(indicator));
        
        if (hasPersonalContent && ['internal', 'hr', 'meetings', 'commercial'].includes(categoryId)) {
            totalScore -= 50;
            matches.push({ keyword: 'personal_content_penalty', type: 'penalty', score: -50 });
        }
        
        // Test des exclusions en premier
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    let penalty = 50;
                    
                    if (personalIndicators.includes(exclusion) && 
                        ['internal', 'hr', 'meetings', 'commercial'].includes(categoryId)) {
                        penalty = 100;
                    }
                    
                    totalScore -= penalty;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -penalty });
                }
            }
        }
        
        // Test des mots-clés absolus
        if (keywords.absolute && keywords.absolute.length > 0) {
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
        
        // Test des mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 40;
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: 40 });
                    
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 20;
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 20 });
                    }
                }
            }
            
            if (strongMatches >= 2) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong_matches', type: 'bonus', score: 30 });
            }
        }
        
        // Test des mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            let weakMatches = 0;
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 15;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                }
            }
            
            if (weakMatches >= 3) {
                totalScore += 20;
                matches.push({ keyword: 'multiple_weak_matches', type: 'bonus', score: 20 });
            }
        }
        
        // Appliquer bonus de domaine
        this.applyDomainBonus(content, categoryId, matches, totalScore);
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    applyDomainBonus(content, categoryId, matches, totalScore) {
        const domainBonuses = {
            security: ['microsoft', 'google', 'apple', 'security', 'auth', '2fa', 'verification'],
            finance: ['gouv.fr', 'impots', 'bank', 'paypal', 'stripe', 'invoice', 'billing'],
            marketing_news: ['newsletter', 'mailchimp', 'campaign', 'marketing', 'sendinblue', 'mailjet'],
            notifications: ['noreply', 'notification', 'donotreply', 'automated', 'system'],
            project: ['github', 'gitlab', 'jira', 'asana', 'trello', 'confluence', 'bitbucket'],
            hr: ['workday', 'bamboohr', 'adp', 'payroll', 'hr', 'recruiting', 'linkedin', 'indeed'],
            meetings: ['zoom', 'teams', 'meet', 'webex', 'gotomeeting', 'calendar'],
            support: ['zendesk', 'freshdesk', 'helpdesk', 'support', 'ticket'],
            commercial: ['salesforce', 'hubspot', 'pipedrive', 'crm']
        };
        
        if (domainBonuses[categoryId]) {
            for (const domainKeyword of domainBonuses[categoryId]) {
                if (content.domain.includes(domainKeyword)) {
                    const bonus = 40;
                    totalScore += bonus;
                    matches.push({ keyword: `${domainKeyword}_domain`, type: 'domain', score: bonus });
                    break;
                }
            }
        }
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(10);
        } else {
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet ';
        }
        
        if (email.from?.emailAddress?.address) {
            allText += (email.from.emailAddress.address + ' ').repeat(3);
        }
        if (email.from?.emailAddress?.name) {
            allText += (email.from.emailAddress.name + ' ').repeat(3);
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
            const cleanedBody = this.cleanHtml(email.body.content);
            allText += cleanedBody + ' ';
            
            const importantWords = cleanedBody.match(/\b[A-Z]{2,}\b/g);
            if (importantWords) {
                allText += importantWords.join(' ') + ' ';
            }
        }
        
        const contextClues = this.extractContextClues(email);
        allText += contextClues + ' ';
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length,
            hasNoSubject: !email.subject || !email.subject.trim(),
            rawSubject: email.subject || ''
        };
    }

    extractContextClues(email) {
        let clues = '';
        
        const subject = email.subject || '';
        if (subject.match(/^(RE:|FW:|Fwd:|Tr:)/i)) {
            clues += ' conversation reply response ';
        }
        
        const body = email.body?.content || email.bodyPreview || '';
        if (body.match(/ci-joint|attached|attachment|pièce jointe|document/i)) {
            clues += ' document attachment piece jointe ';
        }
        
        if (body.match(/\b(papa|maman|bises|bisous)\b/i)) {
            clues += ' famille family personal personnel ';
        }
        
        if (body.match(/\b(commande|order|facture|invoice|livraison|delivery|n°|numéro)\b/i)) {
            clues += ' commerce order commande achat vente ';
        }
        
        if (body.match(/\b(cv|resume|candidature|application|entretien|interview|poste|position)\b/i)) {
            clues += ' recruitment recrutement hr rh candidat ';
        }
        
        return clues;
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
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[éèêëÉÈÊË]/gi, 'e')
            .replace(/[àâäÀÂÄ]/gi, 'a')
            .replace(/[ùûüÙÛÜ]/gi, 'u')
            .replace(/[çÇ]/gi, 'c')
            .replace(/[îïÎÏ]/gi, 'i')
            .replace(/[ôöÔÖ]/gi, 'o')
            .replace(/['']/g, "'")
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        const normalizedKeyword = keyword.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[éèêëÉÈÊË]/gi, 'e')
            .replace(/[àâäÀÂÄ]/gi, 'a')
            .replace(/[ùûüÙÛÜ]/gi, 'u')
            .replace(/[çÇ]/gi, 'c')
            .replace(/[îïÎÏ]/gi, 'i')
            .replace(/[ôöÔÖ]/gi, 'o')
            .replace(/['']/g, "'")
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
        
        return wordBoundaryRegex.test(normalizedText) || normalizedText.includes(normalizedKeyword);
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\    selectBestCategory(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // Priorité aux mots absolus
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Ensuite par score
                return b.score - a.score;
            });
        
        if (this.debugMode) {
            console.log('[CategoryManager] 📊 Scores par catég');
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
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        
        if (!currentUserEmail) {
            console.log('[CategoryManager] ⚠️ Email utilisateur non trouvé');
            return false;
        }
        
        const isInToList = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        }) || false;
        
        const isInCCList = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        const result = isInCCList && !isInToList;
        
        if (result) {
            console.log('[CategoryManager] 📋 Email en CC détecté (pas destinataire principal):', {
                subject: email.subject?.substring(0, 50),
                inTo: isInToList,
                inCC: isInCCList
            });
        }
        
        return result;
    }

    getCurrentUserEmail() {
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName || parsed.mail;
            }
            
            const msalAccounts = JSON.parse(localStorage.getItem('msal.account.keys') || '[]');
            if (msalAccounts.length > 0) {
                const firstAccount = localStorage.getItem(msalAccounts[0]);
                if (firstAccount) {
                    const account = JSON.parse(firstAccount);
                    return account.username || account.preferred_username;
                }
            }
            
            if (window.authService && typeof window.authService.getCurrentUser === 'function') {
                const user = window.authService.getCurrentUser();
                if (user) {
                    return user.email || user.userPrincipalName || user.username;
                }
            }
            
        } catch (e) {
            console.warn('[CategoryManager] Impossible de récupérer l\'email utilisateur:', e);
        }
        return null;
    }

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        if (exclusions.domains && exclusions.domains.length > 0) {
            for (const domain of exclusions.domains) {
                if (content.domain.includes(domain.toLowerCase())) {
                    return true;
                }
            }
        }
        
        if (exclusions.emails && exclusions.emails.length > 0) {
            const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
            if (emailAddress && exclusions.emails.includes(emailAddress)) {
                return true;
            }
        }
        
        return false;
    }

    // ================================================
    // GESTION DES FILTRES PAR CATÉGORIE
    // ================================================
    getCategoryFilters(categoryId) {
        if (!this.categories[categoryId]) {
            return {
                includeDomains: [],
                excludeDomains: [],
                includeEmails: [],
                excludeEmails: []
            };
        }
        
        const filters = this.categoryFilters?.[categoryId] || this.categories[categoryId].filters || {
            includeDomains: [],
            excludeDomains: [],
            includeEmails: [],
            excludeEmails: []
        };
        
        return {
            includeDomains: filters.includeDomains || [],
            excludeDomains: filters.excludeDomains || [],
            includeEmails: filters.includeEmails || [],
            excludeEmails: filters.excludeEmails || []
        };
    }

    updateCategoryFilters(categoryId, filters) {
        if (!this.categories[categoryId]) {
            throw new Error('Catégorie non trouvée');
        }
        
        console.log(`[CategoryManager] Mise à jour filtres pour ${categoryId}:`, filters);
        
        if (!this.categoryFilters) {
            this.categoryFilters = {};
        }
        
        this.categoryFilters[categoryId] = {
            includeDomains: filters.includeDomains || [],
            excludeDomains: filters.excludeDomains || [],
            includeEmails: filters.includeEmails || [],
            excludeEmails: filters.excludeEmails || []
        };
        
        if (this.customCategories[categoryId]) {
            this.customCategories[categoryId].filters = this.categoryFilters[categoryId];
            this.saveCustomCategories();
        } else {
            this.saveCategoryFilters();
        }
        
        console.log(`[CategoryManager] Filtres mis à jour pour ${categoryId}`);
        
        setTimeout(() => {
            this.dispatchEvent('categoryFiltersUpdated', { 
                categoryId, 
                filters: this.categoryFilters[categoryId] 
            });
        }, 10);
    }

    saveCategoryFilters() {
        try {
            localStorage.setItem('categoryFilters', JSON.stringify(this.categoryFilters || {}));
            console.log('[CategoryManager] Filtres de catégories sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde filtres:', error);
        }
    }

    loadCategoryFilters() {
        try {
            const saved = localStorage.getItem('categoryFilters');
            this.categoryFilters = saved ? JSON.parse(saved) : {};
            console.log('[CategoryManager] Filtres de catégories chargés');
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement filtres:', error);
            this.categoryFilters = {};
        }
    }

    initializeFilters() {
        this.loadCategoryFilters();
        console.log('[CategoryManager] Filtres initialisés');
    }

    // ================================================
    // MÉTHODES PUBLIQUES
    // ================================================
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
        if (categoryId === 'personal') {
            return { id: 'personal', name: 'Personnel', icon: '👤', color: '#ec4899' };
        }
        return this.categories[categoryId] || null;
    }
    
    getCategoryStats() {
        const stats = {
            totalCategories: Object.keys(this.categories).length,
            customCategories: Object.keys(this.customCategories).length,
            activeCategories: this.getActiveCategories().length,
            preselectedCategories: this.settings.taskPreselectedCategories?.length || 0,
            totalKeywords: 0,
            absoluteKeywords: 0,
            strongKeywords: 0,
            weakKeywords: 0,
            exclusionKeywords: 0
        };
        
        for (const keywords of Object.values(this.weightedKeywords)) {
            if (keywords.absolute) stats.absoluteKeywords += keywords.absolute.length;
            if (keywords.strong) stats.strongKeywords += keywords.strong.length;
            if (keywords.weak) stats.weakKeywords += keywords.weak.length;
            if (keywords.exclusions) stats.exclusionKeywords += keywords.exclusions.length;
        }
        
        stats.totalKeywords = stats.absoluteKeywords + stats.strongKeywords + stats.weakKeywords + stats.exclusionKeywords;
        return stats;
    }

    // ================================================
    // MÉTHODES DE TEST ET DEBUG
    // ================================================
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }
    
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
        
        console.log('\n[CategoryManager] TEST RESULT:');
        console.log(`Subject: "${subject}"`);
        console.log(`From: ${from}`);
        console.log(`Category: ${result.category} (expected: ${expectedCategory || 'any'})`);
        console.log(`Score: ${result.score}pts`);
        console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`Matches:`, result.matchedPatterns);
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`❌ FAILED - Expected ${expectedCategory}, got ${result.category}`);
        } else {
            console.log('✅ SUCCESS');
        }
        
        return result;
    }

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC COMPLET CategoryManager');
        
        console.group('📂 Catégories');
        const allCategories = Object.keys(this.categories);
        const customCategories = Object.keys(this.customCategories);
        const activeCategories = this.getActiveCategories();
        
        console.log('Total catégories:', allCategories.length);
        console.log('Catégories standard:', allCategories.filter(c => !this.categories[c].isCustom).length);
        console.log('Catégories personnalisées:', customCategories.length);
        console.log('Catégories actives:', activeCategories.length);
        
        customCategories.forEach(catId => {
            const cat = this.categories[catId];
            const keywords = this.weightedKeywords[catId];
            const isActive = activeCategories.includes(catId);
            const keywordCount = this.getTotalKeywordsCount(catId);
            
            console.log(`\n${cat.icon} ${cat.name} (${catId}):`);
            console.log('  - Active:', isActive ? '✅' : '❌');
            console.log('  - Mots-clés:', keywordCount);
            
            if (keywordCount === 0) {
                console.warn('  ⚠️ AUCUN MOT-CLÉ DÉFINI!');
            }
        });
        console.groupEnd();
        
        console.group('📊 Efficacité des catégories');
        Object.entries(this.weightedKeywords).forEach(([catId, keywords]) => {
            const totalKeywords = this.getTotalKeywordsCount(catId);
            const absoluteCount = keywords.absolute?.length || 0;
            const efficiency = totalKeywords > 0 ? Math.round((absoluteCount / totalKeywords) * 100) : 0;
            
            if (efficiency < 30 && totalKeywords > 0) {
                const cat = this.categories[catId];
                console.warn(`⚠️ ${cat.icon} ${cat.name}: ${efficiency}% d'efficacité (${absoluteCount} absolus sur ${totalKeywords} total)`);
            }
        });
        console.groupEnd();
        
        console.group('🔄 État de synchronisation');
        console.log('Queue de sync:', this.syncQueue.length);
        console.log('Sync en cours:', this.syncInProgress);
        console.log('Dernière sync:', new Date(this.lastSyncTimestamp).toLocaleTimeString());
        console.log('Listeners actifs:', this.changeListeners.size);
        console.groupEnd();
        
        console.group('💡 Recommandations');
        const emptyCats = allCategories.filter(catId => this.getTotalKeywordsCount(catId) === 0);
        if (emptyCats.length > 0) {
            console.warn('Catégories sans mots-clés:', emptyCats);
        }
        
        const inefficientCats = Object.entries(this.weightedKeywords)
            .filter(([catId, keywords]) => {
                const total = this.getTotalKeywordsCount(catId);
                const absolute = keywords.absolute?.length || 0;
                return total > 0 && (absolute / total) < 0.3;
            })
            .map(([catId]) => this.categories[catId]?.name || catId);
        
        if (inefficientCats.length > 0) {
            console.warn('Catégories peu efficaces (< 30% mots absolus):', inefficientCats);
            console.log('→ Ajoutez plus de mots-clés absolus pour améliorer la détection');
        }
        console.groupEnd();
        
        console.groupEnd();
        
        return {
            totalCategories: allCategories.length,
            customCategories: customCategories.length,
            activeCategories: activeCategories.length,
            emptyCategoriesCount: emptyCats.length,
            inefficientCategoriesCount: inefficientCats.length
        };
    }

    // ================================================
    // MÉTHODES DE VALIDATION
    // ================================================
    validateKeywords(keywords) {
        const errors = [];
        const types = ['absolute', 'strong', 'weak', 'exclusions'];
        
        types.forEach(type => {
            if (keywords[type] && !Array.isArray(keywords[type])) {
                errors.push(`${type} doit être un tableau`);
            }
            
            if (keywords[type]) {
                keywords[type].forEach((keyword, index) => {
                    if (typeof keyword !== 'string') {
                        errors.push(`${type}[${index}] doit être une chaîne`);
                    }
                    if (keyword.length < 2) {
                        errors.push(`${type}[${index}] trop court (min 2 caractères)`);
                    }
                    if (keyword.length > 100) {
                        errors.push(`${type}[${index}] trop long (max 100 caractères)`);
                    }
                });
            }
        });
        
        return errors;
    }

    sanitizeKeywords(keywords) {
        const sanitized = {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
        
        Object.keys(sanitized).forEach(type => {
            if (keywords[type] && Array.isArray(keywords[type])) {
                sanitized[type] = keywords[type]
                    .filter(k => typeof k === 'string' && k.trim().length >= 2)
                    .map(k => k.trim().toLowerCase())
                    .filter((k, index, arr) => arr.indexOf(k) === index);
            }
        });
        
        return sanitized;
    }

    // ================================================
    // MÉTHODES DE NETTOYAGE
    // ================================================
    cleanupOrphanedKeywords() {
        const validCategoryIds = Object.keys(this.categories);
        const orphanedIds = Object.keys(this.weightedKeywords)
            .filter(id => !validCategoryIds.includes(id));
        
        orphanedIds.forEach(id => {
            console.log(`[CategoryManager] Suppression mots-clés orphelins pour: ${id}`);
            delete this.weightedKeywords[id];
        });
        
        return orphanedIds.length;
    }

    rebuildKeywordsIndex() {
        console.log('[CategoryManager] Reconstruction de l\'index des mots-clés...');
        
        this.initializeWeightedDetection();
        
        Object.entries(this.customCategories).forEach(([id, category]) => {
            if (category.keywords) {
                this.weightedKeywords[id] = this.sanitizeKeywords(category.keywords);
            }
        });
        
        console.log('[CategoryManager] Index des mots-clés reconstruit');
    }

    // ================================================
    // MÉTHODES DE DEBUG AMÉLIORÉES
    // ================================================
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            syncInProgress: this.syncInProgress,
            syncQueueLength: this.syncQueue.length,
            lastSyncTimestamp: this.lastSyncTimestamp,
            changeListenersCount: this.changeListeners.size,
            eventListenersSetup: this.eventListenersSetup,
            settings: this.settings,
            taskPreselectedCategories: this.getTaskPreselectedCategories(),
            activeCategories: this.getActiveCategories(),
            totalCategories: Object.keys(this.categories).length,
            customCategoriesCount: Object.keys(this.customCategories).length
        };
    }

    forceSyncAllModules() {
        console.log('[CategoryManager] 🚀 === SYNCHRONISATION FORCÉE TOUS MODULES ===');
        
        const criticalSettings = [
            'taskPreselectedCategories',
            'activeCategories',
            'categoryExclusions',
            'scanSettings',
            'automationSettings',
            'preferences'
        ];
        
        criticalSettings.forEach(settingType => {
            const value = this.settings[settingType];
            if (value !== undefined) {
                console.log(`[CategoryManager] 🔄 Force sync: ${settingType}`, value);
                this.notifySpecificModules(settingType, value);
            }
        });
        
        this.notifyAllModules('fullSync', this.settings);
        
        console.log('[CategoryManager] ✅ Synchronisation forcée terminée');
    }

    testSynchronization() {
        console.group('🧪 TEST SYNCHRONISATION CategoryManager');
        
        const debugInfo = this.getDebugInfo();
        console.log('Debug Info:', debugInfo);
        
        const originalCategories = [...this.getTaskPreselectedCategories()];
        const testCategories = ['tasks', 'commercial'];
        
        console.log('Test: Modification taskPreselectedCategories');
        console.log('Avant:', originalCategories);
        
        this.updateTaskPreselectedCategories(testCategories);
        
        setTimeout(() => {
            const newCategories = this.getTaskPreselectedCategories();
            console.log('Après:', newCategories);
            
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            console.log('EmailScanner a:', emailScannerCategories);
            
            const isSync = JSON.stringify(newCategories.sort()) === JSON.stringify(emailScannerCategories.sort());
            console.log('Synchronisation:', isSync ? '✅ OK' : '❌ ÉCHEC');
            
            this.updateTaskPreselectedCategories(originalCategories);
            
            console.groupEnd();
        }, 500);
        
        return true;
    }

    // ================================================
    // EXPORT/IMPORT
    // ================================================
    exportKeywords() {
        const data = {
            exportDate: new Date().toISOString(),
            categories: {},
            customCategories: this.customCategories
        };

        Object.entries(this.categories).forEach(([id, category]) => {
            data.categories[id] = {
                name: category.name,
                description: category.description,
                keywords: this.getCategoryKeywords(id)
            };
        });

        return JSON.stringify(data, null, 2);
    }

    importKeywords(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.categories) {
                Object.entries(data.categories).forEach(([categoryId, categoryData]) => {
                    if (this.categories[categoryId] && categoryData.keywords) {
                        this.updateCategoryKeywords(categoryId, categoryData.keywords);
                    }
                });
            }

            if (data.customCategories) {
                Object.entries(data.customCategories).forEach(([categoryId, categoryData]) => {
                    if (!this.customCategories[categoryId]) {
                        this.createCustomCategory(categoryData);
                    }
                });
            }

            console.log('[CategoryManager] Mots-clés importés avec succès');
            return true;
            
        } catch (error) {
            console.error('[CategoryManager] Erreur import mots-clés:', error);
            return false;
        }
    }

    // ================================================
    // LISTENERS POUR ÉVÉNEMENTS
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        this.externalSettingsChangeHandler = (event) => {
            if (event.detail?.source === 'CategoryManager') {
                return;
            }
            
            const { type, value } = event.detail;
            console.log(`[CategoryManager] Reçu changement externe: ${type}`, value);
            
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
        
        console.log('[CategoryManager] Event listeners configurés (anti-boucle)');
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
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

    // ================================================
    // MÉTHODES UTILITAIRES FINALES
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
}

// ================================================
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v22.0...');
window.categoryManager = new CategoryManager();

// ================================================
// MÉTHODES DE TEST GLOBALES
// ================================================
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v22.0');
    
    const tests = [
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", expected: "marketing_news" },
        { subject: "Action requise: Confirmer votre commande", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte", expected: "security" },
        { subject: "Facture #12345 - Échéance dans 3 jours", expected: "finance" },
        { subject: "Réunion équipe prévue pour demain", expected: "meetings" },
        { subject: "Offre d'emploi: Développeur Senior", from: "recrutement@entreprise.com", expected: "hr" },
        { subject: "Nouvelle opportunité commerciale", from: "commercial@client.com", expected: "commercial" },
        { subject: "Votre candidature a été retenue", body: "Nous avons le plaisir de vous informer que votre CV a retenu notre attention", expected: "hr" },
        { subject: "Promotion spéciale", body: "Cliquez ici pour vous désinscrire de nos emails", expected: "marketing_news" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, test.body || '', test.from || 'test@example.com', test.expected);
    });
    
    console.log('Stats:', window.categoryManager.getCategoryStats());
    console.log('Debug Info:', window.categoryManager.getDebugInfo());
    
    window.categoryManager.testSynchronization();
    
    console.groupEnd();
    return { success: true, testsRun: tests.length };
};

window.debugCategoryKeywords = function() {
    console.group('🔍 DEBUG Mots-clés v22.0');
    const allKeywords = window.categoryManager.getAllKeywords();
    
    Object.entries(allKeywords).forEach(([categoryId, keywords]) => {
        const category = window.categoryManager.getCategory(categoryId);
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        if (total > 0) {
            console.log(`${category?.icon || '📂'} ${category?.name || categoryId}: ${total} mots-clés`);
            if (keywords.absolute?.length) console.log(`  Absolus: ${keywords.absolute.slice(0, 5).join(', ')}...`);
            if (keywords.strong?.length) console.log(`  Forts: ${keywords.strong.slice(0, 5).join(', ')}...`);
            if (keywords.weak?.length) console.log(`  Faibles: ${keywords.weak.slice(0, 5).join(', ')}...`);
            if (keywords.exclusions?.length) console.log(`  Exclusions: ${keywords.exclusions.slice(0, 5).join(', ')}...`);
        }
    });
    
    console.groupEnd();
};

window.testCategorySync = function() {
    return window.categoryManager.testSynchronization();
};

window.forceCategorySync = function() {
    window.categoryManager.forceSyncAllModules();
    return { success: true, message: 'Synchronisation forcée effectuée' };
};

console.log('✅ CategoryManager v22.0 loaded - Détection Newsletter Prioritaire!');
