// ================================================
    // MÉTHODES PUBLIQUES (conservées)
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
            exclusionKeywords: 0,
            visibleCategories: Object.values(this.categoryVisibilitySettings).filter(v => v).length,
            lockedCategories: this.categoryDisplayLocks.size
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
    // MÉTHODES DE TEST ET DEBUG AMÉLIORÉES
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

    // NOUVEAU: Test du système de catégories figées
    testCategoryVisibility() {
        console.group('🧪 TEST CATÉGORIES FIGÉES');
        
        console.log('1. Test figement catégories individuelles');
        this.lockCategoryDisplay('tasks', true);
        this.lockCategoryDisplay('commercial', true);
        console.log('Catégories figées:', Array.from(this.categoryDisplayLocks.keys()));
        
        console.log('2. Test visibilité avec emails');
        const testEmailCategories = ['finance', 'security', 'meetings'];
        const displayed = this.getDisplayedCategories(testEmailCategories);
        console.log('Catégories affichées:', displayed);
        
        console.log('3. Test libération toutes catégories');
        this.unlockAllCategories();
        console.log('Catégories figées après libération:', Array.from(this.categoryDisplayLocks.keys()));
        
        console.groupEnd();
        return { success: true, displayedCategories: displayed };
    }

    // NOUVEAU: Test du système de sélection groupée
    testSelectionSystem() {
        console.group('🧪 TEST SÉLECTION GROUPÉE');
        
        console.log('1. Initialisation catégorie avec emails');
        const testEmails = ['email1', 'email2', 'email3', 'email4', 'email5'];
        this.initializeCategorySelection('tasks', testEmails);
        
        console.log('2. Sélection individuelle');
        this.toggleEmailSelection('tasks', 'email1', true);
        this.toggleEmailSelection('tasks', 'email3', true);
        let state = this.getCategorySelectionState('tasks');
        console.log('État après sélection individuelle:', state);
        
        console.log('3. Sélection totale');
        this.toggleCategorySelection('tasks', true);
        state = this.getCategorySelectionState('tasks');
        console.log('État après sélection totale:', state);
        
        console.log('4. Désélection totale');
        this.toggleCategorySelection('tasks', false);
        state = this.getCategorySelectionState('tasks');
        console.log('État après désélection totale:', state);
        
        console.log('5. Résumé toutes sélections');
        this.toggleCategorySelection('commercial', true);
        const allSelections = this.getAllSelections();
        console.log('Toutes les sélections:', allSelections);
        
        console.log('6. Nettoyage');
        this.clearAllSelections();
        console.log('Après nettoyage:', this.getAllSelections());
        
        console.groupEnd();
        return { success: true, finalState: state };
    }

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC COMPLET CategoryManager v21.0');
        
        // 1. Diagnostics originaux
        console.group('📂 Catégories');
        const allCategories = Object.keys(this.categories);
        const customCategories = Object.keys(this.customCategories);
        const activeCategories = this.getActiveCategories();
        
        console.log('Total catégories:', allCategories.length);
        console.log('Catégories standard:', allCategories.filter(c => !this.categories[c].isCustom).length);
        console.log('Catégories personnalisées:', customCategories.length);
        console.log('Catégories actives:', activeCategories.length);
        console.groupEnd();
        
        // 2. NOUVEAU: Diagnostics système de figement
        console.group('📌 Système de figement');
        console.log('Catégories figées:', Array.from(this.categoryDisplayLocks.keys()));
        console.log('Paramètres visibilité:', this.categoryVisibilitySettings);
        console.log('Catégories toujours visibles:', Object.entries(this.categoryVisibilitySettings)
            .filter(([id, visible]) => visible).map(([id]) => id));
        console.groupEnd();
        
        // 3. NOUVEAU: Diagnostics système de sélection
        console.group('☑️ Système de sélection');
        console.log('Catégories avec sélection active:', Array.from(this.categorySelectionState.keys()));
        console.log('Callbacks de sélection:', this.selectionChangeCallbacks.size);
        const selections = this.getAllSelections();
        console.log('Sélections actuelles:', Object.keys(selections).length);
        console.groupEnd();
        
        // 4. Vérifier l'efficacité des catégories
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
        
        // 5. Vérifier la synchronisation
        console.group('🔄 État de synchronisation');
        console.log('Queue de sync:', this.syncQueue.length);
        console.log('Sync en cours:', this.syncInProgress);
        console.log('Dernière sync:', new Date(this.lastSyncTimestamp).toLocaleTimeString());
        console.log('Listeners actifs:', this.changeListeners.size);
        console.groupEnd();
        
        // 6. Recommandations améliorées
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
        
        // NOUVEAU: Recommandations pour le système de figement
        const unlockedImportantCategories = ['tasks', 'finance', 'security'].filter(catId => 
            !this.categoryDisplayLocks.has(catId));
        if (unlockedImportantCategories.length > 0) {
            console.log('💡 Considérez figer ces catégories importantes:', unlockedImportantCategories);
        }
        
        console.groupEnd();
        console.groupEnd();
        
        return {
            totalCategories: allCategories.length,
            customCategories: customCategories.length,
            activeCategories: activeCategories.length,
            emptyCategoriesCount: emptyCats.length,
            inefficientCategoriesCount: inefficientCats.length,
            lockedCategoriesCount: this.categoryDisplayLocks.size,
            activeSelectionsCount: Object.keys(selections).length
        };
    }

    exportKeywords() {
        const data = {
            exportDate: new Date().toISOString(),
            version: '21.0',
            categories: {},
            customCategories: this.customCategories,
            categoryVisibility: this.categoryVisibilitySettings,
            lockedCategories: Array.from(this.categoryDisplayLocks.keys())
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

            // NOUVEAU: Importer les paramètres de visibilité
            if (data.categoryVisibility) {
                this.categoryVisibilitySettings = { ...this.categoryVisibilitySettings, ...data.categoryVisibility };
                this.saveCategoryVisibilitySettings();
            }

            // NOUVEAU: Importer les catégories figées
            if (data.lockedCategories && Array.isArray(data.lockedCategories)) {
                data.lockedCategories.forEach(categoryId => {
                    this.lockCategoryDisplay(categoryId, true);
                });
            }

            console.log('[CategoryManager] Mots-clés et paramètres importés avec succès');
            return true;
            
        } catch (error) {
            console.error('[CategoryManager] Erreur import mots-clés:', error);
            return false;
        }
    }

    // ================================================
    // GESTION DES FILTRES (conservée mais améliorée)
    // ================================================
    
    initializeFilters() {
        this.loadCategoryFilters();
        console.log('[CategoryManager] Filtres initialisés');
    }

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

    analyzeEmailWithFilters(email) {
        const baseAnalysis = this.analyzeEmail(email);
        
        if (baseAnalysis.category !== 'other' && baseAnalysis.score >= 100 && baseAnalysis.hasAbsolute) {
            return baseAnalysis;
        }
        
        const emailDomain = this.extractDomain(email.from?.emailAddress?.address);
        const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
        
        let bestMatch = null;
        let highestPriority = -1;
        
        Object.entries(this.categories).forEach(([categoryId, category]) => {
            const filters = this.getCategoryFilters(categoryId);
            
            if (filters.excludeDomains?.includes(emailDomain) || 
                filters.excludeEmails?.includes(emailAddress)) {
                return;
            }
            
            if (filters.includeDomains?.includes(emailDomain) || 
                filters.includeEmails?.includes(emailAddress)) {
                const priority = category.priority || 50;
                if (priority > highestPriority) {
                    highestPriority = priority;
                    bestMatch = {
                        category: categoryId,
                        score: 150,
                        confidence: 0.95,
                        matchedPatterns: [{
                            keyword: filters.includeDomains?.includes(emailDomain) ? 
                                `domain:${emailDomain}` : `email:${emailAddress}`,
                            type: 'filter',
                            score: 150
                        }],
                        hasAbsolute: true,
                        matchedByFilter: true
                    };
                }
            }
        });
        
        if (bestMatch) {
            return bestMatch;
        }
        
        return baseAnalysis;
    }

    // ================================================
    // LISTENER POUR ÉVÉNEMENTS (conservé)
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
    // MÉTHODES DE VALIDATION (conservées)
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
    // MÉTHODES DE NETTOYAGE (conservées)
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
    // MÉTHODES DE DEBUG AMÉLIORÉES (conservées + nouvelles)
    // ================================================
    
    getDebugInfo() {
        return {
            version: '21.0',
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
            customCategoriesCount: Object.keys(this.customCategories).length,
            // NOUVEAU: Infos système de figement
            lockedCategoriesCount: this.categoryDisplayLocks.size,
            lockedCategories: Array.from(this.categoryDisplayLocks.keys()),
            categoryVisibilitySettings: this.categoryVisibilitySettings,
            // NOUVEAU: Infos système de sélection
            activeSelectionsCount: this.categorySelectionState.size,
            selectionCallbacksCount: this.selectionChangeCallbacks.size,
            allSelections: this.getAllSelections()
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
        console.group('🧪 TEST SYNCHRONISATION CategoryManager v21.0');
        
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
    // NETTOYAGE ET DESTRUCTION AMÉLIORÉS
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
        
        // NOUVEAU: Nettoyage système de figement
        this.categoryDisplayLocks.clear();
        this.displayedCategories.clear();
        
        // NOUVEAU: Nettoyage système de sélection
        this.categorySelectionState.clear();
        this.selectionChangeCallbacks.clear();
        
        console.log('[CategoryManager] 🧹 Nettoyage v21.0 effectué');
    }

    destroy() {
        this.cleanup();
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        this.categoryVisibilitySettings = {};
        console.log('[CategoryManager] Instance v21.0 détruite');
    }

    // ================================================
    // MÉTHODES UTILITAIRES FINALES (conservées)
    // ================================================
    
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    source: 'CategoryManager',
                    version: '21.0',
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`[CategoryManager] Erreur dispatch ${eventName}:`, error);
        }
    }
}

// ================================================
// INITIALISATION GLOBALE SÉCURISÉE v21.0
// ================================================

if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v21.0...');
window.categoryManager = new CategoryManager();

// ================================================
// EXPORT DES MÉTHODES DE TEST GLOBALES AMÉLIORÉES
// ================================================

window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v21.0');
    
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
    
    window.categoryManager.testSynchronization();
    
    console.groupEnd();
    return { success: true, testsRun: tests.length };
};

window.debugCategoryKeywords = function() {
    console.group('🔍 DEBUG Mots-clés v21.0');
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

// NOUVEAU: Tests spécifiques aux nouvelles fonctionnalités
window.testCategoryVisibility = function() {
    return window.categoryManager.testCategoryVisibility();
};

window.testSelectionSystem = function() {
    return window.categoryManager.testSelectionSystem();
};

window.testCategorySync = function() {
    return window.categoryManager.testSynchronization();
};

window.forceCategorySync = function() {
    window.categoryManager.forceSyncAllModules();
    return { success: true, message: 'Synchronisation forcée effectuée' };
};

// NOUVEAU: Fonctions utilitaires pour l'interface
window.createCategorySelectionButton = function(categoryId, container, options) {
    return window.categoryManager.createCategorySelectionButton(categoryId, container, options);
};

window.createCategoryVisibilityPanel = function(container) {
    return window.categoryManager.createCategoryVisibilityPanel(container);
};

window.lockAllDisplayedCategories = function() {
    window.categoryManager.lockAllDisplayedCategories();
    return { success: true, message: 'Toutes les catégories visibles ont été figées' };
};

window.unlockAllCategories = function() {
    window.categoryManager.unlockAllCategories();
    return { success: true, message: 'Toutes les catégories ont été libérées' };
};

window.getDisplayedCategories = function(emailCategories = []) {
    return window.categoryManager.getDisplayedCategories(emailCategories);
};

window.getCategorySelectionState = function(categoryId) {
    return window.categoryManager.getCategorySelectionState(categoryId);
};

window.toggleCategorySelection = function(categoryId, forceSelect = null) {
    return window.categoryManager.toggleCategorySelection(categoryId, forceSelect);
};

window.getAllSelections = function() {
    return window.categoryManager.getAllSelections();
};

window.clearAllSelections = function() {
    window.categoryManager.clearAllSelections();
    return { success: true, message: 'Toutes les sélections ont été effacées' };
};

// NOUVEAU: Fonctions d'aide pour l'intégration UI
window.CategoryManagerUI = {
    // Créer un bouton de sélection pour une catégorie
    createSelectionButton: function(categoryId, options = {}) {
        return window.categoryManager.createCategorySelectionButton(categoryId, null, options);
    },
    
    // Créer le panneau de contrôle de visibilité
    createVisibilityPanel: function() {
        return window.categoryManager.createCategoryVisibilityPanel(null);
    },
    
    // Obtenir l'état d'une catégorie pour l'affichage
    getCategoryDisplayInfo: function(categoryId, emailCount = 0) {
        const category = window.categoryManager.getCategory(categoryId);
        const selectionState = window.categoryManager.getCategorySelectionState(categoryId);
        const isLocked = window.categoryManager.categoryDisplayLocks.has(categoryId);
        const isVisible = window.categoryManager.categoryVisibilitySettings[categoryId] !== false;
        
        return {
            category,
            emailCount,
            selectionState,
            isLocked,
            isVisible,
            shouldDisplay: isLocked || emailCount > 0 || ['all', 'other', 'spam'].includes(categoryId)
        };
    },
    
    // Initialiser la sélection pour une liste d'emails
    initializeCategoryEmails: function(categoryId, emailIds) {
        window.categoryManager.initializeCategorySelection(categoryId, emailIds);
        return window.categoryManager.getCategorySelectionState(categoryId);
    },
    
    // Mettre à jour les emails d'une catégorie
    updateCategoryEmails: function(categoryId, emailIds) {
        window.categoryManager.updateCategoryEmails(categoryId, emailIds);
        return window.categoryManager.getCategorySelectionState(categoryId);
    },
    
    // Ajouter un callback pour les changements de sélection
    onSelectionChange: function(callback) {
        return window.categoryManager.addSelectionChangeCallback(callback);
    },
    
    // Créer un composant complet de catégorie avec sélection
    createCategoryComponent: function(categoryId, emailIds, container, options = {}) {
        const categoryInfo = this.getCategoryDisplayInfo(categoryId, emailIds.length);
        
        if (!categoryInfo.shouldDisplay && !options.forceDisplay) {
            return null;
        }
        
        // Initialiser la sélection
        this.initializeCategoryEmails(categoryId, emailIds);
        
        // Créer le conteneur principal
        const categoryElement = document.createElement('div');
        categoryElement.className = `category-item ${options.className || ''}`;
        categoryElement.style.cssText = `
            display: flex;
            align-items: center;
            padding: 8px 12px;
            border-bottom: 1px solid #e2e8f0;
            background: ${categoryInfo.isLocked ? '#fef3c7' : 'white'};
            transition: background-color 0.2s;
        `;
        
        // Ajouter l'indicateur de figement
        if (categoryInfo.isLocked) {
            const lockIcon = document.createElement('span');
            lockIcon.textContent = '📌';
            lockIcon.title = 'Catégorie figée (toujours visible)';
            lockIcon.style.cssText = 'margin-right: 4px; font-size: 12px;';
            categoryElement.appendChild(lockIcon);
        }
        
        // Créer le bouton de sélection
        const selectionButton = this.createSelectionButton(categoryId, {
            onSelectionChange: options.onSelectionChange
        });
        categoryElement.appendChild(selectionButton);
        
        // Ajouter l'icône et le nom de la catégorie
        const categoryInfo_display = document.createElement('div');
        categoryInfo_display.style.cssText = 'display: flex; align-items: center; flex: 1;';
        
        const icon = document.createElement('span');
        icon.textContent = categoryInfo.category?.icon || '📂';
        icon.style.cssText = 'margin-right: 8px; font-size: 16px;';
        
        const name = document.createElement('span');
        name.textContent = categoryInfo.category?.name || categoryId;
        name.style.cssText = 'font-weight: 500; flex: 1;';
        
        const count = document.createElement('span');
        count.textContent = `(${emailIds.length})`;
        count.style.cssText = `
            color: #6b7280;
            font-size: 12px;
            margin-left: 8px;
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 10px;
        `;
        
        categoryInfo_display.appendChild(icon);
        categoryInfo_display.appendChild(name);
        categoryInfo_display.appendChild(count);
        categoryElement.appendChild(categoryInfo_display);
        
        // Ajouter les contrôles de visibilité si en mode admin
        if (options.showVisibilityControls) {
            const visibilityButton = document.createElement('button');
            visibilityButton.textContent = categoryInfo.isLocked ? '🔓' : '📌';
            visibilityButton.title = categoryInfo.isLocked ? 'Libérer la catégorie' : 'Figer la catégorie';
            visibilityButton.style.cssText = `
                background: none;
                border: none;
                cursor: pointer;
                margin-left: 8px;
                font-size: 14px;
                opacity: 0.6;
                transition: opacity 0.2s;
            `;
            
            visibilityButton.addEventListener('click', (e) => {
                e.stopPropagation();
                window.categoryManager.lockCategoryDisplay(categoryId, !categoryInfo.isLocked);
                // Recharger le composant
                if (options.onVisibilityChange) {
                    options.onVisibilityChange(categoryId, !categoryInfo.isLocked);
                }
            });
            
            visibilityButton.addEventListener('mouseenter', () => {
                visibilityButton.style.opacity = '1';
            });
            
            visibilityButton.addEventListener('mouseleave', () => {
                visibilityButton.style.opacity = '0.6';
            });
            
            categoryElement.appendChild(visibilityButton);
        }
        
        if (container) {
            container.appendChild(categoryElement);
        }
        
        return categoryElement;
    },
    
    // Créer une liste complète de catégories
    createCategoriesList: function(emailsByCategory, container, options = {}) {
        const fragment = document.createDocumentFragment();
        
        // Obtenir les catégories à afficher
        const categoriesToDisplay = window.categoryManager.getDisplayedCategories(
            Object.keys(emailsByCategory)
        );
        
        // Trier les catégories par priorité puis par nom
        categoriesToDisplay.sort((a, b) => {
            const catA = window.categoryManager.getCategory(a);
            const catB = window.categoryManager.getCategory(b);
            
            const priorityA = catA?.priority || 50;
            const priorityB = catB?.priority || 50;
            
            if (priorityA !== priorityB) {
                return priorityB - priorityA; // Priorité décroissante
            }
            
            const nameA = catA?.name || a;
            const nameB = catB?.name || b;
            return nameA.localeCompare(nameB);
        });
        
        categoriesToDisplay.forEach(categoryId => {
            const emailIds = emailsByCategory[categoryId] || [];
            const categoryElement = this.createCategoryComponent(
                categoryId, 
                emailIds, 
                null, 
                {
                    ...options,
                    forceDisplay: true // Forcer l'affichage pour les catégories dans la liste
                }
            );
            
            if (categoryElement) {
                fragment.appendChild(categoryElement);
            }
        });
        
        if (container) {
            container.innerHTML = '';
            container.appendChild(fragment);
        }
        
        return fragment;
    }
};

console.log('✅ CategoryManager v21.0 loaded - Catégories figées et sélection groupée');
console.log('📌 Nouvelles fonctionnalités:');
console.log('   - Catégories figées pour affichage permanent');
console.log('   - Système de sélection groupée avec boutons');
console.log('   - Interface UI simplifiée avec CategoryManagerUI');
console.log('   - Export/import des paramètres de visibilité');
console.log('   - Tests dédiés aux nouvelles fonctionnalités');

// Afficher un résumé des fonctionnalités disponibles
console.group('🎯 FONCTIONNALITÉS v21.0');
console.log('Figement des catégories:');
console.log('  - lockCategoryDisplay(categoryId, lock)');
console.log('  - unlockAllCategories()');
console.log('  - getDisplayedCategories(emailCategories)');
console.log('');
console.log('Sélection groupée:');
console.log('  - toggleCategorySelection(categoryId, forceSelect)');
console.log('  - toggleEmailSelection(categoryId, emailId, selected)');
console.log('  - getCategorySelectionState(categoryId)');
console.log('  - getAllSelections()');
console.log('');
console.log('Interface utilisateur:');
console.log('  - CategoryManagerUI.createSelectionButton(categoryId)');
console.log('  - CategoryManagerUI.createCategoryComponent(categoryId, emailIds)');
console.log('  - CategoryManagerUI.createCategoriesList(emailsByCategory)');
console.log('');
console.log('Tests spécifiques:');
console.log('  - testCategoryVisibility()');
console.log('  - testSelectionSystem()');
console.groupEnd();// CategoryManager.js - Version 21.0 - Catégories figées et sélection groupée

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // NOUVEAU: Système de catégories figées pour l'affichage
        this.displayedCategories = new Set();
        this.categoryDisplayLocks = new Map();
        this.categoryVisibilitySettings = this.loadCategoryVisibilitySettings();
        
        // NOUVEAU: Système de sélection groupée
        this.categorySelectionState = new Map();
        this.selectionChangeCallbacks = new Set();
        
        // Système de synchronisation renforcé (conservé)
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.initializeFilters();
        this.setupEventListeners();
        this.initializeCategoryVisibility();
        
        // Démarrer la synchronisation automatique
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 21.0 - Catégories figées et sélection groupée');
    }

    // ================================================
    // NOUVEAU: SYSTÈME DE CATÉGORIES FIGÉES
    // ================================================
    
    initializeCategoryVisibility() {
        // Initialiser avec toutes les catégories visibles par défaut
        const allCategoryIds = Object.keys(this.categories);
        allCategoryIds.forEach(categoryId => {
            if (!this.categoryVisibilitySettings.hasOwnProperty(categoryId)) {
                this.categoryVisibilitySettings[categoryId] = true;
            }
        });
        this.saveCategoryVisibilitySettings();
    }
    
    loadCategoryVisibilitySettings() {
        try {
            const saved = localStorage.getItem('categoryVisibilitySettings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement visibilité catégories:', error);
            return {};
        }
    }
    
    saveCategoryVisibilitySettings() {
        try {
            localStorage.setItem('categoryVisibilitySettings', JSON.stringify(this.categoryVisibilitySettings));
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde visibilité catégories:', error);
        }
    }
    
    // Figer une catégorie pour qu'elle reste visible même sans emails
    lockCategoryDisplay(categoryId, lock = true) {
        if (lock) {
            this.categoryDisplayLocks.set(categoryId, true);
            this.displayedCategories.add(categoryId);
        } else {
            this.categoryDisplayLocks.delete(categoryId);
        }
        
        console.log(`[CategoryManager] 📌 Catégorie ${categoryId} ${lock ? 'figée' : 'dé-figée'}`);
        this.dispatchEvent('categoryDisplayLockChanged', { categoryId, locked: lock });
    }
    
    // Définir quelles catégories doivent toujours être visibles
    setCategoryVisibility(categoryId, visible) {
        this.categoryVisibilitySettings[categoryId] = visible;
        
        if (visible) {
            this.displayedCategories.add(categoryId);
            this.lockCategoryDisplay(categoryId, true);
        } else {
            this.displayedCategories.delete(categoryId);
            this.lockCategoryDisplay(categoryId, false);
        }
        
        this.saveCategoryVisibilitySettings();
        this.dispatchEvent('categoryVisibilityChanged', { categoryId, visible });
    }
    
    // Obtenir les catégories à afficher (figées + celles avec des emails)
    getDisplayedCategories(emailCategories = []) {
        const displayed = new Set(this.displayedCategories);
        
        // Ajouter les catégories figées
        this.categoryDisplayLocks.forEach((locked, categoryId) => {
            if (locked && this.categoryVisibilitySettings[categoryId] !== false) {
                displayed.add(categoryId);
            }
        });
        
        // Ajouter les catégories qui ont des emails
        emailCategories.forEach(categoryId => {
            if (this.categoryVisibilitySettings[categoryId] !== false) {
                displayed.add(categoryId);
            }
        });
        
        // Ajouter les catégories spéciales toujours visibles
        const alwaysVisible = ['all', 'other', 'spam'];
        alwaysVisible.forEach(categoryId => displayed.add(categoryId));
        
        return Array.from(displayed).filter(categoryId => 
            this.categories[categoryId] || alwaysVisible.includes(categoryId)
        );
    }
    
    // Figer toutes les catégories actuellement visibles
    lockAllDisplayedCategories() {
        this.displayedCategories.forEach(categoryId => {
            this.lockCategoryDisplay(categoryId, true);
        });
        console.log('[CategoryManager] 📌 Toutes les catégories visibles figées');
    }
    
    // Libérer toutes les catégories figées
    unlockAllCategories() {
        this.categoryDisplayLocks.clear();
        console.log('[CategoryManager] 🔓 Toutes les catégories libérées');
        this.dispatchEvent('allCategoriesUnlocked', {});
    }

    // ================================================
    // NOUVEAU: SYSTÈME DE SÉLECTION GROUPÉE
    // ================================================
    
    // Initialiser la sélection pour une catégorie
    initializeCategorySelection(categoryId, emailIds = []) {
        this.categorySelectionState.set(categoryId, {
            allSelected: false,
            selectedEmails: new Set(),
            totalEmails: emailIds.length,
            availableEmails: new Set(emailIds)
        });
    }
    
    // Sélectionner/désélectionner tous les emails d'une catégorie
    toggleCategorySelection(categoryId, forceSelect = null) {
        const state = this.categorySelectionState.get(categoryId);
        if (!state) {
            console.warn(`[CategoryManager] Catégorie ${categoryId} non initialisée pour sélection`);
            return false;
        }
        
        const shouldSelectAll = forceSelect !== null ? forceSelect : !state.allSelected;
        
        if (shouldSelectAll) {
            // Sélectionner tous
            state.selectedEmails = new Set(state.availableEmails);
            state.allSelected = true;
        } else {
            // Désélectionner tous
            state.selectedEmails.clear();
            state.allSelected = false;
        }
        
        this.categorySelectionState.set(categoryId, state);
        
        console.log(`[CategoryManager] 📋 Catégorie ${categoryId}: ${shouldSelectAll ? 'tous sélectionnés' : 'tous désélectionnés'} (${state.selectedEmails.size}/${state.totalEmails})`);
        
        // Notifier les callbacks
        this.notifySelectionChange(categoryId, state);
        
        return shouldSelectAll;
    }
    
    // Sélectionner/désélectionner un email spécifique
    toggleEmailSelection(categoryId, emailId, selected = null) {
        const state = this.categorySelectionState.get(categoryId);
        if (!state) {
            console.warn(`[CategoryManager] Catégorie ${categoryId} non initialisée pour sélection`);
            return false;
        }
        
        const isSelected = selected !== null ? selected : !state.selectedEmails.has(emailId);
        
        if (isSelected) {
            state.selectedEmails.add(emailId);
        } else {
            state.selectedEmails.delete(emailId);
        }
        
        // Mettre à jour l'état "tous sélectionnés"
        state.allSelected = state.selectedEmails.size === state.totalEmails && state.totalEmails > 0;
        
        this.categorySelectionState.set(categoryId, state);
        this.notifySelectionChange(categoryId, state);
        
        return isSelected;
    }
    
    // Obtenir les emails sélectionnés pour une catégorie
    getSelectedEmails(categoryId) {
        const state = this.categorySelectionState.get(categoryId);
        return state ? Array.from(state.selectedEmails) : [];
    }
    
    // Obtenir l'état de sélection d'une catégorie
    getCategorySelectionState(categoryId) {
        const state = this.categorySelectionState.get(categoryId);
        return state ? {
            allSelected: state.allSelected,
            selectedCount: state.selectedEmails.size,
            totalCount: state.totalEmails,
            selectedEmails: Array.from(state.selectedEmails),
            partialSelection: state.selectedEmails.size > 0 && state.selectedEmails.size < state.totalEmails
        } : {
            allSelected: false,
            selectedCount: 0,
            totalCount: 0,
            selectedEmails: [],
            partialSelection: false
        };
    }
    
    // Mettre à jour les emails disponibles pour une catégorie
    updateCategoryEmails(categoryId, emailIds) {
        let state = this.categorySelectionState.get(categoryId);
        if (!state) {
            this.initializeCategorySelection(categoryId, emailIds);
            state = this.categorySelectionState.get(categoryId);
        }
        
        const newEmailIds = new Set(emailIds);
        const oldSelected = state.selectedEmails;
        
        // Garder seulement les emails sélectionnés qui existent encore
        state.selectedEmails = new Set([...oldSelected].filter(id => newEmailIds.has(id)));
        state.availableEmails = newEmailIds;
        state.totalEmails = emailIds.length;
        state.allSelected = state.selectedEmails.size === state.totalEmails && state.totalEmails > 0;
        
        this.categorySelectionState.set(categoryId, state);
        this.notifySelectionChange(categoryId, state);
    }
    
    // Réinitialiser toutes les sélections
    clearAllSelections() {
        this.categorySelectionState.clear();
        console.log('[CategoryManager] 🗑️ Toutes les sélections effacées');
        this.dispatchEvent('allSelectionsCleared', {});
    }
    
    // Obtenir un résumé de toutes les sélections
    getAllSelections() {
        const selections = {};
        this.categorySelectionState.forEach((state, categoryId) => {
            if (state.selectedEmails.size > 0) {
                selections[categoryId] = {
                    category: this.getCategory(categoryId),
                    selectedCount: state.selectedEmails.size,
                    totalCount: state.totalEmails,
                    selectedEmails: Array.from(state.selectedEmails)
                };
            }
        });
        return selections;
    }
    
    // Ajouter un callback pour les changements de sélection
    addSelectionChangeCallback(callback) {
        this.selectionChangeCallbacks.add(callback);
        return () => this.selectionChangeCallbacks.delete(callback);
    }
    
    // Notifier les changements de sélection
    notifySelectionChange(categoryId, state) {
        const selectionInfo = {
            categoryId,
            category: this.getCategory(categoryId),
            allSelected: state.allSelected,
            selectedCount: state.selectedEmails.size,
            totalCount: state.totalEmails,
            selectedEmails: Array.from(state.selectedEmails),
            partialSelection: state.selectedEmails.size > 0 && state.selectedEmails.size < state.totalEmails
        };
        
        // Notifier les callbacks internes
        this.selectionChangeCallbacks.forEach(callback => {
            try {
                callback(selectionInfo);
            } catch (error) {
                console.error('[CategoryManager] Erreur callback sélection:', error);
            }
        });
        
        // Dispatch événement global
        this.dispatchEvent('categorySelectionChanged', selectionInfo);
    }

    // ================================================
    // API PUBLIQUE POUR L'INTERFACE - NOUVEAU
    // ================================================
    
    // Créer le bouton de sélection pour une catégorie
    createCategorySelectionButton(categoryId, container, options = {}) {
        const state = this.getCategorySelectionState(categoryId);
        const category = this.getCategory(categoryId);
        
        const button = document.createElement('button');
        button.className = `category-selection-btn ${options.className || ''}`;
        button.style.cssText = `
            background: ${state.allSelected ? '#ef4444' : state.partialSelection ? '#f59e0b' : '#10b981'};
            color: white;
            border: none;
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 12px;
            cursor: pointer;
            margin-right: 8px;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        `;
        
        this.updateSelectionButtonContent(button, state, category);
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const newState = this.toggleCategorySelection(categoryId);
            this.updateSelectionButtonContent(button, this.getCategorySelectionState(categoryId), category);
            
            // Callback optionnel
            if (options.onSelectionChange) {
                options.onSelectionChange(categoryId, newState, this.getSelectedEmails(categoryId));
            }
        });
        
        // Écouter les changements de sélection pour mettre à jour le bouton
        this.addSelectionChangeCallback((selectionInfo) => {
            if (selectionInfo.categoryId === categoryId) {
                this.updateSelectionButtonContent(button, selectionInfo, category);
            }
        });
        
        if (container) {
            container.appendChild(button);
        }
        
        return button;
    }
    
    updateSelectionButtonContent(button, state, category) {
        if (state.allSelected) {
            button.innerHTML = `✓ Désél. tout (${state.selectedCount})`;
            button.style.background = '#ef4444';
            button.title = `Désélectionner tous les emails de ${category?.name || 'cette catégorie'}`;
        } else if (state.partialSelection) {
            button.innerHTML = `◐ Sél. tout (${state.selectedCount}/${state.totalCount})`;
            button.style.background = '#f59e0b';
            button.title = `Sélectionner tous les emails de ${category?.name || 'cette catégorie'}`;
        } else {
            button.innerHTML = `☐ Sél. tout${state.totalCount > 0 ? ` (${state.totalCount})` : ''}`;
            button.style.background = '#10b981';
            button.title = `Sélectionner tous les emails de ${category?.name || 'cette catégorie'}`;
        }
    }
    
    // Créer le panneau de contrôle des catégories figées
    createCategoryVisibilityPanel(container) {
        const panel = document.createElement('div');
        panel.className = 'category-visibility-panel';
        panel.style.cssText = `
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Catégories toujours visibles';
        title.style.cssText = 'margin: 0 0 12px 0; font-size: 14px; font-weight: 600;';
        panel.appendChild(title);
        
        const categoriesList = document.createElement('div');
        categoriesList.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px;';
        
        Object.entries(this.categories).forEach(([categoryId, category]) => {
            const item = document.createElement('label');
            item.style.cssText = `
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 10px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
            `;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.categoryVisibilitySettings[categoryId] !== false;
            
            checkbox.addEventListener('change', () => {
                this.setCategoryVisibility(categoryId, checkbox.checked);
            });
            
            const icon = document.createElement('span');
            icon.textContent = category.icon;
            
            const name = document.createElement('span');
            name.textContent = category.name;
            
            item.appendChild(checkbox);
            item.appendChild(icon);
            item.appendChild(name);
            categoriesList.appendChild(item);
        });
        
        panel.appendChild(categoriesList);
        
        // Boutons de contrôle
        const controls = document.createElement('div');
        controls.style.cssText = 'margin-top: 12px; display: flex; gap: 8px;';
        
        const lockAllBtn = document.createElement('button');
        lockAllBtn.textContent = '📌 Figer toutes';
        lockAllBtn.style.cssText = `
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
        `;
        lockAllBtn.addEventListener('click', () => this.lockAllDisplayedCategories());
        
        const unlockAllBtn = document.createElement('button');
        unlockAllBtn.textContent = '🔓 Tout libérer';
        unlockAllBtn.style.cssText = `
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
        `;
        unlockAllBtn.addEventListener('click', () => this.unlockAllCategories());
        
        controls.appendChild(lockAllBtn);
        controls.appendChild(unlockAllBtn);
        panel.appendChild(controls);
        
        if (container) {
            container.appendChild(panel);
        }
        
        return panel;
    }

    // ================================================
    // SYSTÈME DE SYNCHRONISATION AUTOMATIQUE (conservé)
    // ================================================
    
    startAutoSync() {
        setInterval(() => {
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
    // MÉTHODES DE NOTIFICATION RENFORCÉES (conservées)
    // ================================================
    
    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification spécialisée: ${type}`);
        
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
        
        if (window.minimalScanModule || window.scanStartModule) {
            const scanner = window.minimalScanModule || window.scanStartModule;
            if (type === 'taskPreselectedCategories' || type === 'scanSettings') {
                console.log('[CategoryManager] → ScanModule:', type);
                if (typeof scanner.updateSettings === 'function') {
                    scanner.updateSettings({ [type]: value });
                }
            }
        }
        
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
    // API PUBLIQUE POUR CHANGEMENTS DE PARAMÈTRES (conservée)
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
    // GESTION DES PARAMÈTRES CENTRALISÉE (conservée)
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

    // ================================================
    // MÉTHODES PUBLIQUES POUR LES AUTRES MODULES (conservées)
    // ================================================
    
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        const now = Date.now();
        const CACHE_DURATION = 10000;
        
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
    // SYSTÈME D'ÉCOUTE POUR AUTRES MODULES (conservé)
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
    // GESTION DES CATÉGORIES PERSONNALISÉES (conservée)
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
                
                const totalKeywords = this.getTotalKeywordsCount(id);
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" (${id}):`);
                console.log(`  - Priorité: ${category.priority || 30}`);
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
            priority: categoryData.priority || 30,
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
        
        // Ajouter automatiquement aux catégories visibles
        this.setCategoryVisibility(id, true);
        
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

        // Supprimer de la visibilité et des catégories figées
        delete this.categoryVisibilitySettings[categoryId];
        this.categoryDisplayLocks.delete(categoryId);
        this.displayedCategories.delete(categoryId);
        this.saveCategoryVisibilitySettings();

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
    // GESTION DES MOTS-CLÉS PAR CATÉGORIE (conservée)
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
    // INITIALISATION DES CATÉGORIES (conservée)
    // ================================================
    
    initializeCategories() {
        this.categories = {
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100,
                isCustom: false
            },
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90,
                isCustom: false
            },
            
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
                    'promotion', 'promo', 'soldes', 'vente privée',
                    'ventes en ligne', 'vente en ligne', 'shopping',
                    'disable these notifications', 'turn off notifications',
                    'manage notifications', 'notification settings',
                    'email settings', 'communication preferences',
                    'update your preferences', 'modify your subscription'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount', 'réduction',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'exclusive', 'special', 'limited', 'new', 'nouveau',
                    'boutique', 'shopping', 'acheter', 'commander',
                    'offre', 'promotion', 'remise', 'solde',
                    'notifications', 'alerts', 'updates', 'subscribe'
                ],
                weak: ['update', 'discover', 'new', 'nouveauté', 'découvrir'],
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
                    'demande de mise à jour', 'update needed', 'mise a jour requise',
                    'correction requise', 'à corriger', 'please review',
                    'merci de valider', 'validation requise', 'approval needed'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'update', 'mise à jour', 'demande', 'request',
                    'task', 'tâche', 'todo', 'à faire',
                    'correction', 'corriger', 'modifier', 'révision'
                ],
                weak: ['demande', 'besoin', 'attente', 'request', 'need', 'waiting'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'unsubscribe', 'papa', 'maman', 'famille']
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
                exclusions: ['newsletter', 'promotion', 'marketing', 'papa', 'maman', 'famille']
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
                exclusions: ['newsletter', 'marketing', 'promotion', 'unsubscribe', 'ventes en ligne']
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
                exclusions: ['newsletter', 'marketing', 'spam', 'promotion', 'soldes', 'ventes en ligne']
            },

            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'retrospective', 'roadmap',
                    'document corrigé', 'version corrigée', 'corrections apportées'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'jira',
                    'development', 'développement',
                    'document', 'présentation', 'correction'
                ],
                weak: ['development', 'phase', 'étape', 'planning', 'présentation'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'papa', 'maman', 'famille', 'bises']
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
                exclusions: ['newsletter', 'marketing', 'external', 'client', 'papa', 'maman', 'famille', 'bises']
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
            }
        };
