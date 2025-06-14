// CategoryManager.js - Version 20.0 - Synchronisation complètement fixée

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // NOUVEAU: Système de synchronisation renforcé
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.setupEventListeners();
        
        // NOUVEAU: Démarrer la synchronisation automatique
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 20.0 - Synchronisation complètement fixée');
    }

    // ================================================
    // NOUVEAU SYSTÈME DE SYNCHRONISATION AUTOMATIQUE
    // ================================================
    startAutoSync() {
        // Synchronisation automatique toutes les 2 secondes
        setInterval(() => {
            this.processSettingsChanges();
        }, 2000);
        
        // Synchronisation immédiate lors des changements
        this.setupImmediateSync();
    }

    setupImmediateSync() {
        // Écouter les changements dans localStorage
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
        
        // Appliquer le changement dans les settings locaux
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
        
        // Sauvegarder immédiatement
        this.saveSettingsToStorage();
        
        // Notifier les modules si demandé
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
                    // Forcer la re-catégorisation
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
        if (window.minimalScanModule || window.scanStartModule) {
            const scanner = window.minimalScanModule || window.scanStartModule;
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
        // Dispatch événements globaux
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
        
        // Notifier les listeners enregistrés
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
        
        // Ajouter à la queue de synchronisation
        this.syncQueue.push({
            type: 'fullSettings',
            value: newSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        // Traitement immédiat si pas en cours
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

updateTaskPreselectedCategories(categories, notifyModules = true) {
    console.log('[CategoryManager] 📋 updateTaskPreselectedCategories:', categories);
    
    const normalizedCategories = Array.isArray(categories) ? [...categories] : [];
    
    // Invalider le cache
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

runDiagnostics() {
    console.group('🏥 DIAGNOSTIC COMPLET CategoryManager');
    
    // 1. Vérifier les catégories
    console.group('📂 Catégories');
    const allCategories = Object.keys(this.categories);
    const customCategories = Object.keys(this.customCategories);
    const activeCategories = this.getActiveCategories();
    
    console.log('Total catégories:', allCategories.length);
    console.log('Catégories standard:', allCategories.filter(c => !this.categories[c].isCustom).length);
    console.log('Catégories personnalisées:', customCategories.length);
    console.log('Catégories actives:', activeCategories.length);
    
    // Vérifier les catégories personnalisées
    customCategories.forEach(catId => {
        const cat = this.categories[catId];
        const keywords = this.weightedKeywords[catId];
        const isActive = activeCategories.includes(catId);
        const keywordCount = this.getTotalKeywordsCount(catId);
        
        console.log(`\n${cat.icon} ${cat.name} (${catId}):`);
        console.log('  - Active:', isActive ? '✅' : '❌');
        console.log('  - Priorité:', cat.priority);
        console.log('  - Mots-clés:', keywordCount);
        
        if (keywordCount === 0) {
            console.warn('  ⚠️ AUCUN MOT-CLÉ DÉFINI!');
        }
    });
    console.groupEnd();
    
    // 2. Vérifier l'efficacité des catégories
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
    
    // 3. Vérifier la synchronisation
    console.group('🔄 État de synchronisation');
    console.log('Queue de sync:', this.syncQueue.length);
    console.log('Sync en cours:', this.syncInProgress);
    console.log('Dernière sync:', new Date(this.lastSyncTimestamp).toLocaleTimeString());
    console.log('Listeners actifs:', this.changeListeners.size);
    console.groupEnd();
    
    // 4. Recommandations
    console.group('💡 Recommandations');
    
    // Catégories sans mots-clés
    const emptyCats = allCategories.filter(catId => this.getTotalKeywordsCount(catId) === 0);
    if (emptyCats.length > 0) {
        console.warn('Catégories sans mots-clés:', emptyCats);
    }
    
    // Catégories peu efficaces
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
        
        // Détecter les changements et notifier
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
    // MÉTHODES PUBLIQUES POUR LES AUTRES MODULES - RENFORCÉES
    // ================================================
    getSettings() {
        // Toujours retourner une copie fraîche
        return JSON.parse(JSON.stringify(this.settings));
    }

getTaskPreselectedCategories() {
    // Vérifier le cache avec une durée de vie de 10 secondes
    const now = Date.now();
    const CACHE_DURATION = 10000; // 10 secondes
    
    if (this._taskCategoriesCache && 
        this._taskCategoriesCacheTime && 
        (now - this._taskCategoriesCacheTime) < CACHE_DURATION) {
        // Retourner depuis le cache sans logger
        return [...this._taskCategoriesCache];
    }
    
    // Récupérer les catégories fraîches
    const categories = this.settings.taskPreselectedCategories || [];
    
    // Mettre à jour le cache
    this._taskCategoriesCache = [...categories];
    this._taskCategoriesCacheTime = now;
    
    // Log seulement si changement ou première fois
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
    // Si activeCategories est null, toutes les catégories sont actives
    if (!this.settings.activeCategories) {
        // Retourner TOUTES les catégories (standard + personnalisées)
        const allCategories = Object.keys(this.categories);
        console.log('[CategoryManager] Toutes catégories actives:', allCategories);
        return allCategories;
    }
    
    // Sinon retourner seulement les catégories marquées comme actives
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
        
        // Retourner une fonction pour supprimer le listener
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    removeChangeListener(callback) {
        this.changeListeners.delete(callback);
    }

    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] Catégories personnalisées sauvegardées');
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde catégories personnalisées:', error);
        }
    }
// CategoryManager.js - Amélioration de loadCustomCategories() (remplacer vers ligne 490)

loadCustomCategories() {
    try {
        const saved = localStorage.getItem('customCategories');
        this.customCategories = saved ? JSON.parse(saved) : {};
        
        console.log('[CategoryManager] 📁 Chargement catégories personnalisées...');
        
        // Intégrer les catégories personnalisées APRÈS l'initialisation des mots-clés par défaut
        Object.entries(this.customCategories).forEach(([id, category]) => {
            // Ajouter la catégorie avec toutes ses propriétés
            this.categories[id] = {
                ...category,
                isCustom: true,
                priority: category.priority || 30
            };
            
            // IMPORTANT: S'assurer que les mots-clés sont correctement initialisés
            if (!this.weightedKeywords[id]) {
                this.weightedKeywords[id] = {
                    absolute: [],
                    strong: [],
                    weak: [],
                    exclusions: []
                };
            }
            
            // Fusionner les mots-clés sauvegardés
            if (category.keywords) {
                this.weightedKeywords[id] = {
                    absolute: [...new Set([...(this.weightedKeywords[id].absolute || []), ...(category.keywords.absolute || [])])],
                    strong: [...new Set([...(this.weightedKeywords[id].strong || []), ...(category.keywords.strong || [])])],
                    weak: [...new Set([...(this.weightedKeywords[id].weak || []), ...(category.keywords.weak || [])])],
                    exclusions: [...new Set([...(this.weightedKeywords[id].exclusions || []), ...(category.keywords.exclusions || [])])]
                };
            }
            
            const totalKeywords = this.getTotalKeywordsCount(id);
            console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" (${id}):`);
            console.log(`  - Priorité: ${category.priority || 30}`);
            console.log(`  - Mots-clés: ${totalKeywords}`);
            if (totalKeywords === 0) {
                console.warn(`  ⚠️ AUCUN MOT-CLÉ - La catégorie ne pourra pas détecter d'emails!`);
            }
            
            // Ajouter automatiquement aux catégories actives si pas déjà présent
            if (this.settings.activeCategories && !this.settings.activeCategories.includes(id)) {
                console.log(`[CategoryManager] ➕ Ajout automatique de "${category.name}" aux catégories actives`);
                this.settings.activeCategories.push(id);
                this.saveSettingsToStorage();
            }
        });
        
        console.log('[CategoryManager] 📊 Résumé chargement:');
        console.log('  - Catégories personnalisées:', Object.keys(this.customCategories).length);
        console.log('  - Total catégories actives:', Object.keys(this.categories).length);
        console.log('  - Catégories avec mots-clés:', Object.keys(this.weightedKeywords).filter(id => this.getTotalKeywordsCount(id) > 0).length);
        
        // NOUVEAU: Vérifier et alerter pour les catégories sans mots-clés
        const categoriesWithoutKeywords = Object.entries(this.categories)
            .filter(([id, cat]) => cat.isCustom && this.getTotalKeywordsCount(id) === 0)
            .map(([id, cat]) => ({ id, name: cat.name }));
        
        if (categoriesWithoutKeywords.length > 0) {
            console.warn('[CategoryManager] ⚠️ Catégories personnalisées sans mots-clés:');
            categoriesWithoutKeywords.forEach(cat => {
                console.warn(`  - ${cat.name} (${cat.id})`);
            });
            console.log('[CategoryManager] 💡 Utilisez la page Paramètres > Catégories pour ajouter des mots-clés');
        }
        
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
            priority: categoryData.priority || 30,
            createdAt: new Date().toISOString(),
            isCustom: true,
            keywords: categoryData.keywords || { absolute: [], strong: [], weak: [], exclusions: [] }
        };

        this.customCategories[id] = category;
        this.categories[id] = category;
        
        // Initialiser les mots-clés
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

        // Mise à jour avec préservation des mots-clés
        const updatedCategory = {
            ...this.customCategories[categoryId],
            ...updates,
            keywords: updates.keywords || this.customCategories[categoryId].keywords,
            updatedAt: new Date().toISOString()
        };

        this.customCategories[categoryId] = updatedCategory;
        this.categories[categoryId] = updatedCategory;
        
        // Mettre à jour les mots-clés si fournis
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

        // Retirer des catégories pré-sélectionnées si présente
        if (this.settings.taskPreselectedCategories?.includes(categoryId)) {
            const newPreselected = this.settings.taskPreselectedCategories.filter(id => id !== categoryId);
            this.updateTaskPreselectedCategories(newPreselected);
        }

        // Retirer des catégories actives si présente
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
    // GESTION DES MOTS-CLÉS PAR CATÉGORIE (inchangé)
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

        // Si c'est une catégorie personnalisée, sauvegarder
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
    // INITIALISATION DES CATÉGORIES (inchangé)
    // ================================================
    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100,
                isCustom: false
            },
            
            // CATÉGORIE CC - PRIORITÉ ÉLEVÉE
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité, connexions et authentification',
                priority: 50,
                isCustom: false
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                priority: 50,
                isCustom: false
            },
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire et demandes d\'action',
                priority: 50,
                isCustom: false
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis et contrats',
                priority: 50,
                isCustom: false
            },
            
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                priority: 50,
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
                priority: 50,
                isCustom: false
            },
            
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion de projet',
                priority: 50,
                isCustom: false
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                priority: 50,
                isCustom: false
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                priority: 50,
                isCustom: false
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques',
                priority: 50,
                isCustom: false
            }
        };
        
        this.isInitialized = true;
    }

// CategoryManager.js - Méthode initializeWeightedDetection() complète (remplacer vers ligne 650)

initializeWeightedDetection() {
    this.weightedKeywords = {
        marketing_news: {
            absolute: [
                'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                'email preferences', 'préférences email', 'preferences email',
                'ne plus recevoir', 'stop emails', 'arreter les emails',
                'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                'paramétrez vos choix', 'parametrez vos choix',
                'newsletter', 'mailing list', 'mailing',
                'this email was sent to', 'you are receiving this',
                'limited offer', 'offre limitée', 'special offer',
                'promotion', 'promo', 'soldes', 'vente privée'
            ],
            strong: [
                'promo', 'deal', 'offer', 'sale', 'discount',
                'newsletter', 'mailing', 'campaign', 'marketing',
                'exclusive', 'special', 'limited', 'new'
            ],
            weak: ['update', 'discover', 'new'],
            exclusions: []
        },

        security: {
            absolute: [
                'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                'activité suspecte', 'suspicious activity', 'login alert',
                'new sign-in', 'sign in detected', 'connexion détectée',
                'code de vérification', 'verification code', 'security code',
                'two-factor', '2fa', 'authentification', 'authentication',
                'password reset', 'réinitialisation mot de passe'
            ],
            strong: [
                'sécurité', 'security', 'vérification', 'verify',
                'authentification', 'password', 'mot de passe'
            ],
            weak: ['compte', 'account', 'accès'],
            exclusions: ['newsletter', 'unsubscribe', 'promotion']
        },

        tasks: {
            absolute: [
                'action required', 'action requise', 'action needed',
                'please complete', 'veuillez compléter', 'to do',
                'task assigned', 'tâche assignée', 'deadline',
                'due date', 'échéance', 'livrable',
                'urgence', 'urgent', 'très urgent',
                'demande update', 'update request', 'mise à jour demandée',
                'demande de mise à jour', 'update needed', 'mise a jour requise'
            ],
            strong: [
                'urgent', 'asap', 'priority', 'priorité',
                'complete', 'compléter', 'action', 'faire',
                'update', 'mise à jour', 'demande', 'request',
                'task', 'tâche', 'todo', 'à faire'
            ],
            weak: ['demande', 'besoin', 'attente', 'request', 'need', 'waiting'],
            exclusions: ['newsletter', 'marketing', 'promotion', 'unsubscribe']
        },

        meetings: {
            absolute: [
                'demande de réunion', 'meeting request', 'réunion',
                'schedule a meeting', 'planifier une réunion',
                'invitation réunion', 'meeting invitation',
                'teams meeting', 'zoom meeting', 'google meet',
                'rendez-vous', 'appointment', 'rdv'
            ],
            strong: [
                'meeting', 'réunion', 'schedule', 'planifier',
                'calendar', 'calendrier', 'appointment', 'agenda',
                'conférence', 'conference', 'call'
            ],
            weak: ['présentation', 'agenda', 'disponible', 'available'],
            exclusions: ['newsletter', 'promotion', 'marketing']
        },

        commercial: {
            absolute: [
                'devis', 'quotation', 'proposal', 'proposition',
                'contrat', 'contract', 'bon de commande',
                'purchase order', 'offre commerciale',
                'opportunity', 'opportunité', 'lead'
            ],
            strong: [
                'client', 'customer', 'prospect', 'opportunity',
                'commercial', 'business', 'marché', 'deal',
                'vente', 'sales', 'négociation'
            ],
            weak: ['offre', 'négociation', 'discussion', 'projet'],
            exclusions: ['newsletter', 'marketing', 'promotion', 'unsubscribe']
        },

        finance: {
            absolute: [
                'facture', 'invoice', 'payment', 'paiement',
                'virement', 'transfer', 'remboursement', 'refund',
                'relevé bancaire', 'bank statement',
                'déclaration fiscale', 'tax declaration',
                'n°commande', 'numéro commande', 'order number',
                'numéro de commande', 'commande n°', 'commande numéro',
                'livraison commande', 'commande expédiée',
                'confirmation commande', 'order confirmation'
            ],
            strong: [
                'montant', 'amount', 'total', 'facture',
                'fiscal', 'bancaire', 'bank', 'finance',
                'commande', 'order', 'achat', 'vente',
                'livraison', 'delivery', 'expédition', 'shipping',
                'prix', 'price', 'coût', 'cost'
            ],
            weak: ['euro', 'dollar', 'prix', 'payment', 'transaction'],
            exclusions: ['newsletter', 'marketing', 'spam', 'promotion']
        },

        reminders: {
            absolute: [
                'reminder:', 'rappel:', 'follow up', 'relance',
                'gentle reminder', 'rappel amical', 'following up',
                'je reviens vers vous', 'circling back',
                'comme convenu', 'as discussed'
            ],
            strong: [
                'reminder', 'rappel', 'follow', 'relance',
                'suite', 'convenu', 'discussed', 'pending'
            ],
            weak: ['previous', 'discussed', 'encore', 'still'],
            exclusions: ['newsletter', 'marketing', 'promotion']
        },

        support: {
            absolute: [
                'ticket #', 'ticket number', 'numéro de ticket',
                'case #', 'case number', 'incident #',
                'problème résolu', 'issue resolved',
                'support ticket', 'demande de support'
            ],
            strong: [
                'support', 'assistance', 'help desk',
                'technical support', 'ticket', 'incident',
                'problème', 'problem', 'issue'
            ],
            weak: ['help', 'aide', 'issue', 'question'],
            exclusions: ['newsletter', 'marketing', 'promotion']
        },

        project: {
            absolute: [
                'projet xx', 'project update', 'milestone',
                'sprint', 'livrable projet', 'gantt',
                'avancement projet', 'project status',
                'kickoff', 'retrospective', 'roadmap'
            ],
            strong: [
                'projet', 'project', 'milestone', 'sprint',
                'agile', 'scrum', 'kanban', 'jira',
                'development', 'développement'
            ],
            weak: ['development', 'phase', 'étape', 'planning'],
            exclusions: ['newsletter', 'marketing', 'promotion']
        },

        hr: {
            absolute: [
                'bulletin de paie', 'payslip', 'contrat de travail',
                'congés', 'leave request', 'onboarding',
                'entretien annuel', 'performance review',
                'ressources humaines', 'human resources',
                'offre d\'emploi', 'job offer', 'recrutement'
            ],
            strong: [
                'rh', 'hr', 'salaire', 'salary',
                'ressources humaines', 'human resources',
                'contrat', 'paie', 'congés', 'vacation',
                'emploi', 'job', 'recruitment'
            ],
            weak: ['employee', 'staff', 'personnel', 'équipe'],
            exclusions: [
                'newsletter', 'marketing', 'famille', 'family', 
                'personnel', 'personal', 'papa', 'maman',
                'présentation', 'document', 'correction',
                'bises', 'bisous', 'familial'
            ]
        },

        internal: {
            absolute: [
                'all staff', 'tout le personnel', 'annonce interne',
                'company announcement', 'memo interne',
                'communication interne', 'note de service',
                'à tous', 'to all employees'
            ],
            strong: [
                'internal', 'interne', 'company wide',
                'personnel', 'staff', 'équipe',
                'annonce', 'announcement'
            ],
            weak: ['annonce', 'announcement', 'information', 'update'],
            exclusions: ['newsletter', 'marketing', 'external', 'client']
        },

        notifications: {
            absolute: [
                'do not reply', 'ne pas répondre', 'noreply@',
                'automated message', 'notification automatique',
                'system notification', 'ceci est un message automatique',
                'no-reply@', 'donotreply@'
            ],
            strong: [
                'automated', 'automatic', 'system',
                'notification', 'automatique', 'alert'
            ],
            weak: ['notification', 'alert', 'info'],
            exclusions: ['newsletter', 'marketing', 'urgent']
        },

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
        },

        // Nouvelle catégorie pour les emails personnels/familiaux
        personal: {
            absolute: [
                'papa', 'maman', 'famille', 'bises', 'bisous',
                'document personnel', 'correction personnelle',
                'chéri', 'chérie', 'mon amour', 'mamie', 'papy'
            ],
            strong: [
                'famille', 'family', 'personnel', 'personal',
                'bises', 'bisous', 'présentation personnelle',
                'vacances', 'week-end', 'anniversaire'
            ],
            weak: ['document', 'correction', 'présentation', 'merci'],
            exclusions: ['rh', 'hr', 'contrat', 'salaire', 'entreprise', 'company']
        }
    };

    console.log('[CategoryManager] Mots-clés par défaut initialisés pour', Object.keys(this.weightedKeywords).length, 'catégories');
}
// CategoryManager.js - Méthode analyzeEmail() améliorée (remplacer vers ligne 1480)

analyzeEmail(email) {
    if (!email) return { category: 'other', score: 0, confidence: 0 };
    
    if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
        return { category: 'spam', score: 0, confidence: 0, isSpam: true };
    }
    
    const content = this.extractCompleteContent(email);
    
    // Vérifier les exclusions globales
    if (this.isGloballyExcluded(content, email)) {
        return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
    }
    
    // AMÉLIORATION: Vérifier si on est destinataire principal ou en CC
    const isMainRecipient = this.isMainRecipient(email);
    const isInCC = this.isInCC(email);
    
    // Si on est en CC, vérifier d'abord si c'est du marketing
    if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
        const marketingCheck = this.analyzeCategory(content, this.weightedKeywords.marketing_news);
        if (marketingCheck.score >= 80) {
            return {
                category: 'marketing_news',
                score: marketingCheck.total,
                confidence: this.calculateConfidence(marketingCheck),
                matchedPatterns: marketingCheck.matches,
                hasAbsolute: marketingCheck.hasAbsolute,
                originallyCC: true
            };
        }
        
        // Sinon, analyser normalement mais avec une préférence pour CC
        const allResults = this.analyzeAllCategories(content);
        
        // Si une autre catégorie a un score très élevé, la privilégier
        const bestNonCC = Object.values(allResults)
            .filter(r => r.category !== 'cc')
            .sort((a, b) => b.score - a.score)[0];
        
        if (bestNonCC && bestNonCC.score >= 100 && bestNonCC.hasAbsolute) {
            // Une autre catégorie est très pertinente
            return {
                category: bestNonCC.category,
                score: bestNonCC.score,
                confidence: bestNonCC.confidence,
                matchedPatterns: bestNonCC.matches,
                hasAbsolute: bestNonCC.hasAbsolute,
                isCC: true
            };
        }
        
        // Sinon, catégoriser comme CC
        return {
            category: 'cc',
            score: 100,
            confidence: 0.95,
            matchedPatterns: [{ keyword: 'email_in_cc', type: 'detected', score: 100 }],
            hasAbsolute: true,
            isCC: true
        };
    }
    
    const allResults = this.analyzeAllCategories(content);
    return this.selectByPriorityWithThreshold(allResults);
}

// Nouvelle méthode pour vérifier si on est destinataire principal
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
// CategoryManager.js - Méthode analyzeAllCategories() améliorée (remplacer vers ligne 1530)

analyzeAllCategories(content) {
    const results = {};
    const activeCategories = this.getActiveCategories();
    
    // IMPORTANT: Logger les catégories actives pour debug
    if (this.debugMode) {
        console.log('[CategoryManager] 🎯 Catégories actives pour analyse:', activeCategories);
        console.log('[CategoryManager] 📝 Catégories avec mots-clés:', Object.keys(this.weightedKeywords));
    }
    
    for (const [categoryId, keywords] of Object.entries(this.weightedKeywords)) {
        // Toujours inclure marketing_news et cc même si non actives
        if (!activeCategories.includes(categoryId) && 
            categoryId !== 'marketing_news' && 
            categoryId !== 'cc') {
            continue;
        }
        
        // Vérifier que la catégorie existe encore
        if (!this.categories[categoryId]) {
            console.warn(`[CategoryManager] ⚠️ Catégorie ${categoryId} dans weightedKeywords mais pas dans categories`);
            continue;
        }
        
        // NOUVEAU: Vérifier si la catégorie a des mots-clés
        const hasKeywords = keywords && (
            (keywords.absolute && keywords.absolute.length > 0) ||
            (keywords.strong && keywords.strong.length > 0) ||
            (keywords.weak && keywords.weak.length > 0)
        );
        
        if (!hasKeywords) {
            console.warn(`[CategoryManager] ⚠️ Catégorie ${categoryId} (${this.categories[categoryId]?.name}) n'a pas de mots-clés`);
            // Continuer quand même avec un score de base pour les catégories personnalisées
            if (this.categories[categoryId]?.isCustom) {
                results[categoryId] = {
                    category: categoryId,
                    score: 0,
                    hasAbsolute: false,
                    matches: [],
                    confidence: 0,
                    priority: this.categories[categoryId]?.priority || 50,
                    noKeywords: true
                };
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
            priority: this.categories[categoryId]?.priority || 50
        };
    }
    
    // NOUVEAU: Analyser aussi les catégories personnalisées sans mots-clés
    Object.entries(this.customCategories).forEach(([catId, category]) => {
        if (!results[catId] && activeCategories.includes(catId)) {
            console.log(`[CategoryManager] 🆕 Catégorie personnalisée ${catId} (${category.name}) ajoutée avec score 0`);
            results[catId] = {
                category: catId,
                score: 0,
                hasAbsolute: false,
                matches: [],
                confidence: 0,
                priority: category.priority || 30,
                isCustom: true,
                noKeywords: true
            };
        }
    });
    
    return results;
}

selectByPriorityWithThreshold(results) {
    // BAISSER le seuil minimum pour capturer plus d'emails
    const MIN_SCORE_THRESHOLD = 20; // Réduit de 30 à 20
    const MIN_CONFIDENCE_THRESHOLD = 0.4; // Réduit de 0.5 à 0.4
    
    const sortedResults = Object.values(results)
        .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
        .sort((a, b) => {
            // Priorité d'abord
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            // Puis score
            return b.score - a.score;
        });
    
    if (this.debugMode) {
        console.log('[CategoryManager] 📊 Scores par catégorie:');
        sortedResults.forEach(r => {
            console.log(`  - ${r.category}: ${r.score}pts (priority: ${r.priority}, confidence: ${r.confidence})`);
        });
    }
    
    const bestResult = sortedResults[0];
    
    if (bestResult) {
        return {
            category: bestResult.category,
            score: bestResult.score,
            confidence: bestResult.confidence,
            matchedPatterns: bestResult.matches,
            hasAbsolute: bestResult.hasAbsolute
        };
    }
    
    // Si aucun résultat, essayer une détection basique par domaine
    const domainCategory = this.detectByDomain(results);
    if (domainCategory) {
        return domainCategory;
    }
    
    return {
        category: 'other',
        score: 0,
        confidence: 0,
        matchedPatterns: [],
        hasAbsolute: false
    };
}
// CategoryManager.js - Méthode calculateScore() améliorée (remplacer vers ligne 1100)

calculateScore(content, keywords, categoryId) {
    let totalScore = 0;
    let hasAbsolute = false;
    const matches = [];
    const text = content.text;
    
    // Bonus de base pour certaines catégories souvent mal détectées
    const categoryBonus = {
        'project': 10,
        'cc': 5,
        'security': 10,
        'hr': 10,
        'tasks': 15, // AJOUT bonus pour tasks
        'finance': 10 // AJOUT bonus pour finance
    };
    
    if (categoryBonus[categoryId]) {
        totalScore += categoryBonus[categoryId];
        matches.push({ keyword: 'category_bonus', type: 'bonus', score: categoryBonus[categoryId] });
    }
    
    // NOUVEAU: Gérer spécialement les emails sans sujet
    if (content.hasNoSubject) {
        // Analyser le contenu pour déterminer la catégorie
        if (text.includes('update') || text.includes('demande')) {
            if (categoryId === 'tasks') {
                totalScore += 50; // Boost pour tasks si "update" dans un email sans sujet
                matches.push({ keyword: 'no_subject_update', type: 'bonus', score: 50 });
            }
        }
    }
    
    // Test des exclusions en premier
    if (keywords.exclusions && keywords.exclusions.length > 0) {
        for (const exclusion of keywords.exclusions) {
            if (this.findInText(text, exclusion)) {
                // Pénalité plus intelligente selon le contexte
                let penalty = 50;
                
                // Réduire la pénalité pour certains cas
                if (categoryId === 'hr' && (exclusion === 'famille' || exclusion === 'personal')) {
                    // Si l'email contient aussi des mots RH forts, réduire la pénalité
                    if (text.includes('ressources humaines') || text.includes('contrat')) {
                        penalty = 20;
                    } else {
                        penalty = 100; // Forte pénalité si pas de mots RH
                    }
                }
                
                if (categoryId === 'cc' && (exclusion === 'commande' || exclusion === 'order')) {
                    // Si on est vraiment en CC, réduire la pénalité
                    if (content.text.includes('cc:') || content.text.includes('copie')) {
                        penalty = 20;
                    }
                }
                
                totalScore -= penalty;
                matches.push({ keyword: exclusion, type: 'exclusion', score: -penalty });
            }
        }
    }
    
    // Test des mots-clés absolus avec bonus contexte
    if (keywords.absolute && keywords.absolute.length > 0) {
        for (const keyword of keywords.absolute) {
            if (this.findInText(text, keyword)) {
                totalScore += 100;
                hasAbsolute = true;
                matches.push({ keyword, type: 'absolute', score: 100 });
                
                // Bonus supplémentaire si dans le sujet
                if (content.subject && this.findInText(content.subject, keyword)) {
                    totalScore += 50;
                    matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 50 });
                }
                
                // Bonus si au début du texte (plus pertinent)
                if (text.substring(0, 200).includes(keyword.toLowerCase())) {
                    totalScore += 20;
                    matches.push({ keyword: keyword + ' (early position)', type: 'bonus', score: 20 });
                }
            }
        }
    }
    
    // Test des mots-clés forts avec scoring amélioré
    if (keywords.strong && keywords.strong.length > 0) {
        let strongMatches = 0;
        for (const keyword of keywords.strong) {
            if (this.findInText(text, keyword)) {
                totalScore += 40;
                strongMatches++;
                matches.push({ keyword, type: 'strong', score: 40 });
                
                // Bonus si dans le sujet
                if (content.subject && this.findInText(content.subject, keyword)) {
                    totalScore += 20;
                    matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 20 });
                }
            }
        }
        
        // Bonus si plusieurs mots-clés forts matchent
        if (strongMatches >= 2) {
            totalScore += 30;
            matches.push({ keyword: 'multiple_strong_matches', type: 'bonus', score: 30 });
        }
    }
    
    // Test des mots-clés faibles avec scoring amélioré
    if (keywords.weak && keywords.weak.length > 0) {
        let weakMatches = 0;
        for (const keyword of keywords.weak) {
            if (this.findInText(text, keyword)) {
                totalScore += 15;
                weakMatches++;
                matches.push({ keyword, type: 'weak', score: 15 });
            }
        }
        
        // Bonus si beaucoup de mots faibles matchent
        if (weakMatches >= 3) {
            totalScore += 20;
            matches.push({ keyword: 'multiple_weak_matches', type: 'bonus', score: 20 });
        }
    }
    
    // Appliquer bonus de domaine amélioré
    this.applyEnhancedDomainBonus(content, categoryId, matches, totalScore);
    
    // Bonus de longueur pour certaines catégories
    if (['project', 'hr', 'internal'].includes(categoryId) && content.length > 500) {
        totalScore += 10;
        matches.push({ keyword: 'long_content', type: 'bonus', score: 10 });
    }
    
    // NOUVEAU: Détection contextuelle spéciale
    if (categoryId === 'finance' && text.includes('showroomprive')) {
        totalScore += 30;
        matches.push({ keyword: 'showroomprive_commerce', type: 'domain', score: 30 });
    }
    
    return { 
        total: Math.max(0, totalScore), 
        hasAbsolute, 
        matches 
    };
}
    detectByDomain(results) {
    // Mapping domaine -> catégorie pour les cas courants
    const domainMappings = {
        'linkedin': 'commercial',
        'indeed': 'commercial',
        'github': 'project',
        'gitlab': 'project',
        'jira': 'project',
        'asana': 'project',
        'trello': 'project',
        'slack': 'internal',
        'teams': 'meetings',
        'zoom': 'meetings',
        'meet': 'meetings',
        'paypal': 'finance',
        'stripe': 'finance',
        'bank': 'finance',
        'invoice': 'finance',
        'support': 'support',
        'help': 'support',
        'noreply': 'notifications',
        'notification': 'notifications',
        'alert': 'security',
        'security': 'security'
    };
    
    // Extraire le domaine depuis le contexte (à implémenter selon votre structure)
    // Pour l'instant, retourne null
    return null;
}

applyEnhancedDomainBonus(content, categoryId, matches, totalScore) {
    const domainBonuses = {
        security: ['microsoft', 'google', 'apple', 'security', 'auth', '2fa', 'verification'],
        finance: ['gouv.fr', 'impots', 'bank', 'paypal', 'stripe', 'invoice', 'billing'],
        marketing_news: ['newsletter', 'mailchimp', 'campaign', 'marketing', 'sendinblue', 'mailjet'],
        notifications: ['noreply', 'notification', 'donotreply', 'automated', 'system'],
        project: ['github', 'gitlab', 'jira', 'asana', 'trello', 'confluence', 'bitbucket'],
        hr: ['workday', 'bamboohr', 'adp', 'payroll', 'hr', 'recruiting'],
        meetings: ['zoom', 'teams', 'meet', 'webex', 'gotomeeting', 'calendar'],
        support: ['zendesk', 'freshdesk', 'helpdesk', 'support', 'ticket']
    };
    
    if (domainBonuses[categoryId]) {
        for (const domainKeyword of domainBonuses[categoryId]) {
            if (content.domain.includes(domainKeyword)) {
                const bonus = 40; // Bonus uniforme plus élevé
                totalScore += bonus;
                matches.push({ keyword: `${domainKeyword}_domain`, type: 'domain', score: bonus });
                break;
            }
        }
    }
}

    applyDomainBonus(content, categoryId, matches, totalScore) {
        const domainBonuses = {
            security: ['microsoft', 'google', 'apple', 'security'],
            finance: ['gouv.fr', 'impots', 'bank', 'paypal'],
            marketing_news: ['newsletter', 'mailchimp', 'campaign', 'marketing'],
            notifications: ['noreply', 'notification', 'donotreply']
        };
        
        if (domainBonuses[categoryId]) {
            for (const domainKeyword of domainBonuses[categoryId]) {
                if (content.domain.includes(domainKeyword)) {
                    const bonus = categoryId === 'marketing_news' ? 30 : 50;
                    totalScore += bonus;
                    matches.push({ keyword: `${domainKeyword}_domain`, type: 'domain', score: bonus });
                    break;
                }
            }
        }
    }

    // ================================================
    // VÉRIFICATION DES EXCLUSIONS GLOBALES (inchangé)
    // ================================================
    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        // Vérifier les domaines exclus
        if (exclusions.domains && exclusions.domains.length > 0) {
            for (const domain of exclusions.domains) {
                if (content.domain.includes(domain.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Vérifier les emails exclus
        if (exclusions.emails && exclusions.emails.length > 0) {
            const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
            if (emailAddress && exclusions.emails.includes(emailAddress)) {
                return true;
            }
        }
        
        return false;
    }

    // ================================================
    // MÉTHODES UTILITAIRES (inchangées)
    // ================================================
    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

// CategoryManager.js - Méthode extractCompleteContent() améliorée (remplacer vers ligne 1720)

extractCompleteContent(email) {
    let allText = '';
    let subject = '';
    
    // IMPORTANT: Traiter le sujet avec un poids très élevé
    if (email.subject && email.subject.trim()) {
        subject = email.subject;
        // Répéter le sujet 10 fois pour lui donner beaucoup plus de poids
        allText += (email.subject + ' ').repeat(10);
    } else {
        // Si pas de sujet, ajouter un marqueur pour la détection
        subject = '[SANS_SUJET]';
        allText += 'sans sujet email sans objet ';
    }
    
    // Extraire l'expéditeur
    if (email.from?.emailAddress?.address) {
        allText += (email.from.emailAddress.address + ' ').repeat(3);
    }
    if (email.from?.emailAddress?.name) {
        allText += (email.from.emailAddress.name + ' ').repeat(3);
    }
    
    // Extraire les destinataires (important pour détecter si on est en copie)
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
    
    // Extraire les CC
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
    
    // Extraire le contenu du corps
    if (email.bodyPreview) {
        allText += email.bodyPreview + ' ';
    }
    
    if (email.body?.content) {
        const cleanedBody = this.cleanHtml(email.body.content);
        allText += cleanedBody + ' ';
        
        // Extraire les mots importants du corps (en majuscules)
        const importantWords = cleanedBody.match(/\b[A-Z]{2,}\b/g);
        if (importantWords) {
            allText += importantWords.join(' ') + ' ';
        }
    }
    
    // Analyser le contexte de l'email pour détecter des patterns
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

// Nouvelle méthode pour extraire des indices contextuels
extractContextClues(email) {
    let clues = '';
    
    // Détecter les patterns de réponse/transfert
    const subject = email.subject || '';
    if (subject.match(/^(RE:|FW:|Fwd:|Tr:)/i)) {
        clues += ' conversation reply response ';
    }
    
    // Détecter les mentions de documents
    const body = email.body?.content || email.bodyPreview || '';
    if (body.match(/ci-joint|attached|attachment|pièce jointe|document/i)) {
        clues += ' document attachment piece jointe ';
    }
    
    // Détecter les formules de politesse familiales
    if (body.match(/\b(papa|maman|bises|bisous)\b/i)) {
        clues += ' famille family personal personnel ';
    }
    
    // Détecter les mentions commerciales
    if (body.match(/\b(commande|order|facture|invoice|livraison|delivery|n°|numéro)\b/i)) {
        clues += ' commerce order commande achat vente ';
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

// CategoryManager.js - Méthode findInText() corrigée (remplacer vers ligne 1850)

findInText(text, keyword) {
    if (!text || !keyword) return false;
    
    // Normalisation complète pour gérer tous les cas
    const normalizedText = text.toLowerCase()
        .normalize('NFD') // Décomposer les caractères accentués
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
        .replace(/[éèêëÉÈÊË]/gi, 'e')
        .replace(/[àâäÀÂÄ]/gi, 'a')
        .replace(/[ùûüÙÛÜ]/gi, 'u')
        .replace(/[çÇ]/gi, 'c')
        .replace(/[îïÎÏ]/gi, 'i')
        .replace(/[ôöÔÖ]/gi, 'o')
        .replace(/['']/g, "'") // Normaliser les apostrophes
        .replace(/[-_]/g, ' ') // Remplacer tirets et underscores par espaces
        .replace(/\s+/g, ' ') // Normaliser les espaces multiples
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
    
    // Recherche avec word boundaries pour éviter les faux positifs
    // Par exemple, ne pas matcher "commande" dans "commander"
    const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
    
    return wordBoundaryRegex.test(normalizedText) || normalizedText.includes(normalizedKeyword);
}

// Méthode helper pour échapper les caractères spéciaux regex
escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
// CategoryManager.js - Méthode isInCC() corrigée (remplacer vers ligne 1950)

isInCC(email) {
    // Vérifier d'abord si on a des destinataires en CC
    if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
        return false;
    }
    
    const currentUserEmail = this.getCurrentUserEmail();
    
    // Si on ne peut pas déterminer l'email de l'utilisateur actuel
    if (!currentUserEmail) {
        console.log('[CategoryManager] ⚠️ Email utilisateur non trouvé, vérification CC basée sur la présence de CC');
        // Si il y a des CC mais qu'on n'est pas dans TO, on est probablement en CC
        const isInTo = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail && recipientEmail.includes('@');
        });
        
        return email.ccRecipients.length > 0 && !isInTo;
    }
    
    // Vérifier si on est dans les CC
    const isInCCList = email.ccRecipients.some(recipient => {
        const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
        return recipientEmail === currentUserEmail.toLowerCase();
    });
    
    // Vérifier aussi si on n'est PAS dans les TO
    const isInToList = email.toRecipients?.some(recipient => {
        const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
        return recipientEmail === currentUserEmail.toLowerCase();
    }) || false;
    
    // On est en CC si on est dans la liste CC et PAS dans TO
    const result = isInCCList && !isInToList;
    
    if (result) {
        console.log('[CategoryManager] 📋 Email détecté en CC:', {
            subject: email.subject?.substring(0, 50),
            ccCount: email.ccRecipients.length,
            toCount: email.toRecipients?.length || 0
        });
    }
    
    return result;
}

// Méthode getCurrentUserEmail() améliorée (remplacer vers ligne 1970)

getCurrentUserEmail() {
    try {
        // Essayer plusieurs sources
        const userInfo = localStorage.getItem('currentUserInfo');
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            return parsed.email || parsed.userPrincipalName || parsed.mail;
        }
        
        // Essayer depuis le token MSAL
        const msalAccounts = JSON.parse(localStorage.getItem('msal.account.keys') || '[]');
        if (msalAccounts.length > 0) {
            const firstAccount = localStorage.getItem(msalAccounts[0]);
            if (firstAccount) {
                const account = JSON.parse(firstAccount);
                return account.username || account.preferred_username;
            }
        }
        
        // Essayer depuis AuthService
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
    getCurrentUserEmail() {
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName;
            }
        } catch (e) {
            console.warn('[CategoryManager] Impossible de récupérer l\'email utilisateur');
        }
        return null;
    }

    // ================================================
    // MÉTHODES PUBLIQUES (inchangées)
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
    // MÉTHODES DE TEST ET DEBUG (inchangées)
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

    testKeywords(categoryId, testText) {
        const keywords = this.getCategoryKeywords(categoryId);
        if (!keywords) {
            console.error(`[CategoryManager] Catégorie ${categoryId} non trouvée`);
            return null;
        }

        const content = {
            text: testText.toLowerCase(),
            subject: testText.toLowerCase(),
            domain: 'test.com'
        };

        const result = this.calculateScore(content, keywords, categoryId);
        
        console.log(`\n[CategoryManager] TEST KEYWORDS - ${categoryId}:`);
        console.log(`Text: "${testText}"`);
        console.log(`Score: ${result.total}pts`);
        console.log(`Has Absolute: ${result.hasAbsolute}`);
        console.log(`Matches:`, result.matches);
        console.log(`Confidence: ${Math.round(this.calculateConfidence(result) * 100)}%`);
        
        return result;
    }

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
    // LISTENER POUR ÉVÉNEMENTS (modifié pour ne pas dupliquer)
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        // Écouter seulement les événements externes (pas les nôtres)
        this.externalSettingsChangeHandler = (event) => {
            // Ignorer nos propres événements
            if (event.detail?.source === 'CategoryManager') {
                return;
            }
            
            const { type, value } = event.detail;
            console.log(`[CategoryManager] Reçu changement externe: ${type}`, value);
            
            // Appliquer sans notifier (pour éviter les boucles)
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
    // MÉTHODES DE VALIDATION (inchangées)
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
                    .filter((k, index, arr) => arr.indexOf(k) === index); // Dédoublonner
            }
        });
        
        return sanitized;
    }

    // ================================================
    // MÉTHODES DE NETTOYAGE (inchangées)
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
        
        // Réinitialiser avec les mots-clés par défaut
        this.initializeWeightedDetection();
        
        // Recharger les catégories personnalisées
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

    // Force la synchronisation immédiate de tous les modules
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
        
        // Notification générale finale
        this.notifyAllModules('fullSync', this.settings);
        
        console.log('[CategoryManager] ✅ Synchronisation forcée terminée');
    }

    // Test complet de synchronisation
    testSynchronization() {
        console.group('🧪 TEST SYNCHRONISATION CategoryManager');
        
        const debugInfo = this.getDebugInfo();
        console.log('Debug Info:', debugInfo);
        
        // Test modification taskPreselectedCategories
        const originalCategories = [...this.getTaskPreselectedCategories()];
        const testCategories = ['tasks', 'commercial'];
        
        console.log('Test: Modification taskPreselectedCategories');
        console.log('Avant:', originalCategories);
        
        this.updateTaskPreselectedCategories(testCategories);
        
        setTimeout(() => {
            const newCategories = this.getTaskPreselectedCategories();
            console.log('Après:', newCategories);
            
            // Vérifier EmailScanner
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            console.log('EmailScanner a:', emailScannerCategories);
            
            const isSync = JSON.stringify(newCategories.sort()) === JSON.stringify(emailScannerCategories.sort());
            console.log('Synchronisation:', isSync ? '✅ OK' : '❌ ÉCHEC');
            
            // Remettre les valeurs originales
            this.updateTaskPreselectedCategories(originalCategories);
            
            console.groupEnd();
        }, 500);
        
        return true;
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        // Arrêter tous les intervals
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Nettoyer les event listeners
        if (this.externalSettingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.externalSettingsChangeHandler);
        }
        
        // Vider les queues et listeners
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

// Créer l'instance globale avec nettoyage préalable
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v20.0...');
window.categoryManager = new CategoryManager();

// Export des méthodes de test globales améliorées
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v20.0');
    
    const tests = [
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", expected: "marketing_news" },
        { subject: "Action requise: Confirmer votre commande", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte", expected: "security" },
        { subject: "Facture #12345 - Échéance dans 3 jours", expected: "finance" },
        { subject: "Réunion équipe prévue pour demain", expected: "meetings" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
    });
    
    console.log('Stats:', window.categoryManager.getCategoryStats());
    console.log('Debug Info:', window.categoryManager.getDebugInfo());
    
    // Test synchronisation
    window.categoryManager.testSynchronization();
    
    console.groupEnd();
    return { success: true, testsRun: tests.length };
};

window.debugCategoryKeywords = function() {
    console.group('🔍 DEBUG Mots-clés v20.0');
    const allKeywords = window.categoryManager.getAllKeywords();
    
    Object.entries(allKeywords).forEach(([categoryId, keywords]) => {
        const category = window.categoryManager.getCategory(categoryId);
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        if (total > 0) {
            console.log(`${category?.icon || '📂'} ${category?.name || categoryId}: ${total} mots-clés`);
            if (keywords.absolute?.length) console.log(`  Absolus: ${keywords.absolute.join(', ')}`);
            if (keywords.strong?.length) console.log(`  Forts: ${keywords.strong.join(', ')}`);
            if (keywords.weak?.length) console.log(`  Faibles: ${keywords.weak.join(', ')}`);
            if (keywords.exclusions?.length) console.log(`  Exclusions: ${keywords.exclusions.join(', ')}`);
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

console.log('✅ CategoryManager v20.0 loaded - Synchronisation complètement fixée');
