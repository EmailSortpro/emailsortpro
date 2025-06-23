// CategoryManager.js - Version 8.0 - Complètement corrigé et optimisé

class CategoryManager {
    constructor() {
        this.categories = {};
        this.customCategories = {};
        this.settings = {};
        this.taskPreselectedCategories = [];
        this.isInitialized = false;
        this.changeListeners = [];
        this.initPromise = null;
        this.patterns = new Map();
        this.exclusions = new Map();
        
        console.log('[CategoryManager] 🚀 Initialisation version 8.0...');
        this.init();
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._doInit();
        return this.initPromise;
    }

    async _doInit() {
        try {
            console.log('[CategoryManager] 📋 Chargement des catégories...');
            
            // Charger les catégories par défaut
            this.loadDefaultCategories();
            
            // Charger les paramètres
            await this.loadSettings();
            
            // Charger les catégories personnalisées
            this.loadCustomCategories();
            
            // Initialiser les patterns
            this.initializePatterns();
            
            this.isInitialized = true;
            console.log('[CategoryManager] ✅ Initialisation terminée');
            
            // Notifier que le module est prêt
            this.dispatchModuleReady();
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur initialisation:', error);
            // Continuer avec les valeurs par défaut
            this.loadDefaultCategories();
            this.isInitialized = true;
        }
    }

    loadDefaultCategories() {
        this.categories = {
            'tasks': {
                name: 'Tâches',
                icon: '✅',
                color: '#22c55e',
                priority: 90,
                description: 'Emails nécessitant une action',
                keywords: {
                    absolute: ['action requise', 'urgent', 'deadline', 'échéance', 'à faire', 'todo', 'task'],
                    strong: ['merci de', 'veuillez', 'pouvez-vous', 'pourriez-vous', 'demande', 'besoin'],
                    weak: ['question', 'aide', 'assistance', 'support']
                },
                exclusions: ['newsletter', 'notification', 'automatique']
            },
            'meetings': {
                name: 'Réunions',
                icon: '📅',
                color: '#3b82f6',
                priority: 85,
                description: 'Invitations et événements',
                keywords: {
                    absolute: ['réunion', 'meeting', 'rendez-vous', 'invitation', 'calendrier'],
                    strong: ['aujourd\'hui', 'demain', 'la semaine', 'prochaine', 'agenda'],
                    weak: ['événement', 'conférence', 'présentation']
                },
                exclusions: []
            },
            'finance': {
                name: 'Finance',
                icon: '💰',
                color: '#10b981',
                priority: 80,
                description: 'Factures et finances',
                keywords: {
                    absolute: ['facture', 'paiement', 'invoice', 'billing', 'montant', 'euro', 'dollar'],
                    strong: ['échéance', 'rappel', 'solde', 'compte', 'transaction'],
                    weak: ['prix', 'coût', 'tarif', 'devis']
                },
                exclusions: []
            },
            'commercial': {
                name: 'Commercial',
                icon: '🤝',
                color: '#f59e0b',
                priority: 75,
                description: 'Ventes et prospects',
                keywords: {
                    absolute: ['proposition', 'devis', 'commande', 'vente', 'client', 'prospect'],
                    strong: ['offre', 'prix', 'tarif', 'produit', 'service'],
                    weak: ['intéressé', 'contact', 'société', 'entreprise']
                },
                exclusions: ['newsletter']
            },
            'marketing_news': {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                priority: 50,
                description: 'Newsletters et marketing',
                keywords: {
                    absolute: ['newsletter', 'unsubscribe', 'désabonner', 'marketing', 'promotion'],
                    strong: ['actualités', 'news', 'nouveautés', 'offre spéciale'],
                    weak: ['découvrez', 'nouveau', 'tendances']
                },
                exclusions: []
            },
            'security': {
                name: 'Sécurité',
                icon: '🔒',
                color: '#ef4444',
                priority: 95,
                description: 'Alertes de sécurité',
                keywords: {
                    absolute: ['sécurité', 'security', 'connexion', 'login', 'mot de passe', 'password'],
                    strong: ['alerte', 'suspicion', 'détecté', 'compte', 'authentification'],
                    weak: ['protection', 'vérification', 'confirmation']
                },
                exclusions: []
            },
            'personal': {
                name: 'Personnel',
                icon: '👤',
                color: '#6366f1',
                priority: 60,
                description: 'Emails personnels',
                keywords: {
                    absolute: ['famille', 'ami', 'personnel', 'privé'],
                    strong: ['salut', 'bonjour', 'bonsoir', 'ça va'],
                    weak: ['comment', 'nouvelles', 'prendre']
                },
                exclusions: ['professionnel', 'entreprise', 'société']
            },
            'notifications': {
                name: 'Notifications',
                icon: '🔔',
                color: '#64748b',
                priority: 30,
                description: 'Notifications automatiques',
                keywords: {
                    absolute: ['notification', 'automatique', 'noreply', 'no-reply', 'donotreply'],
                    strong: ['mise à jour', 'update', 'changement', 'modification'],
                    weak: ['information', 'avis', 'rappel']
                },
                exclusions: []
            }
        };

        console.log('[CategoryManager] 📚 Catégories par défaut chargées:', Object.keys(this.categories).length);
    }

    initializePatterns() {
        console.log('[CategoryManager] 🔍 Initialisation des patterns...');
        
        this.patterns.clear();
        this.exclusions.clear();
        
        Object.entries(this.categories).forEach(([categoryId, category]) => {
            if (category.keywords) {
                this.patterns.set(categoryId, {
                    absolute: (category.keywords.absolute || []).map(k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')),
                    strong: (category.keywords.strong || []).map(k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')),
                    weak: (category.keywords.weak || []).map(k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
                });
            }
            
            if (category.exclusions) {
                this.exclusions.set(categoryId, category.exclusions.map(k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')));
            }
        });
        
        console.log('[CategoryManager] ✅ Patterns initialisés pour', this.patterns.size, 'catégories');
    }

    async loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = parsed;
                this.taskPreselectedCategories = parsed.taskPreselectedCategories || [];
                console.log('[CategoryManager] 📥 Paramètres chargés:', this.taskPreselectedCategories);
            } else {
                this.settings = this.getDefaultSettings();
                console.log('[CategoryManager] 📝 Paramètres par défaut utilisés');
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            if (saved) {
                this.customCategories = JSON.parse(saved);
                console.log('[CategoryManager] 🎨 Catégories personnalisées chargées:', Object.keys(this.customCategories).length);
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    getDefaultSettings() {
        return {
            taskPreselectedCategories: ['tasks', 'meetings', 'finance'],
            activeCategories: Object.keys(this.categories),
            excludedDomains: [],
            excludedKeywords: [],
            categoryExclusions: {
                domains: [],
                emails: []
            },
            preferences: {
                darkMode: false,
                compactView: false,
                showNotifications: true,
                excludeSpam: true,
                detectCC: true
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
            }
        };
    }

    // ================================================
    // ANALYSE D'EMAIL
    // ================================================
    analyzeEmail(email) {
        if (!email) {
            return { category: 'other', score: 0, confidence: 0, reason: 'Email invalide' };
        }

        const subject = (email.subject || '').toLowerCase();
        const body = (email.bodyPreview || email.body?.content || '').toLowerCase();
        const sender = (email.from?.emailAddress?.address || '').toLowerCase();
        const senderName = (email.from?.emailAddress?.name || '').toLowerCase();
        const senderDomain = sender.split('@')[1] || '';
        
        const combinedText = `${subject} ${body} ${senderName}`;
        
        // Détection spam basique
        const isSpam = this.detectSpam(email, combinedText);
        if (isSpam) {
            return {
                category: 'spam',
                score: 100,
                confidence: 0.9,
                reason: 'Détecté comme spam',
                isSpam: true,
                matchedPatterns: []
            };
        }

        // Détection CC/BCC
        const isCC = this.detectCC(email);
        
        // Analyser par catégories
        const results = [];
        
        for (const [categoryId, category] of Object.entries(this.categories)) {
            const analysis = this.analyzeCategoryMatch(combinedText, categoryId, category);
            if (analysis.score > 0) {
                results.push({
                    category: categoryId,
                    ...analysis
                });
            }
        }
        
        // Analyser catégories personnalisées
        for (const [categoryId, category] of Object.entries(this.customCategories)) {
            const analysis = this.analyzeCategoryMatch(combinedText, categoryId, category);
            if (analysis.score > 0) {
                results.push({
                    category: categoryId,
                    ...analysis,
                    isCustom: true
                });
            }
        }
        
        // Tri par score décroissant
        results.sort((a, b) => b.score - a.score);
        
        const bestMatch = results[0];
        
        if (!bestMatch || bestMatch.score < 10) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                reason: 'Aucune catégorie correspondante',
                isCC: isCC,
                matchedPatterns: []
            };
        }
        
        return {
            category: bestMatch.category,
            score: bestMatch.score,
            confidence: Math.min(bestMatch.score / 100, 1),
            reason: bestMatch.reason,
            hasAbsolute: bestMatch.hasAbsolute,
            isCC: isCC,
            isSpam: false,
            matchedPatterns: bestMatch.matchedPatterns || []
        };
    }

    analyzeCategoryMatch(text, categoryId, category) {
        const patterns = this.patterns.get(categoryId);
        const exclusions = this.exclusions.get(categoryId) || [];
        
        if (!patterns) {
            return { score: 0, reason: 'Pas de patterns définis' };
        }
        
        // Vérifier exclusions
        for (const exclusion of exclusions) {
            if (exclusion.test(text)) {
                return {
                    score: 0,
                    reason: `Exclu par pattern: ${exclusion.source}`,
                    matchedPatterns: [{ type: 'exclusion', keyword: exclusion.source, score: -100 }]
                };
            }
        }
        
        let totalScore = 0;
        let hasAbsolute = false;
        const matchedPatterns = [];
        
        // Patterns absolus (score max)
        for (const pattern of patterns.absolute || []) {
            if (pattern.test(text)) {
                totalScore += 80;
                hasAbsolute = true;
                matchedPatterns.push({ type: 'absolute', keyword: pattern.source, score: 80 });
            }
        }
        
        // Patterns forts
        for (const pattern of patterns.strong || []) {
            if (pattern.test(text)) {
                totalScore += 50;
                matchedPatterns.push({ type: 'strong', keyword: pattern.source, score: 50 });
            }
        }
        
        // Patterns faibles
        for (const pattern of patterns.weak || []) {
            if (pattern.test(text)) {
                totalScore += 20;
                matchedPatterns.push({ type: 'weak', keyword: pattern.source, score: 20 });
            }
        }
        
        // Bonus pour priorité de catégorie
        if (category.priority) {
            totalScore += Math.round(category.priority / 10);
        }
        
        return {
            score: Math.min(totalScore, 100),
            reason: hasAbsolute ? 'Match absolu' : `${matchedPatterns.length} patterns trouvés`,
            hasAbsolute,
            matchedPatterns
        };
    }

    detectSpam(email, text) {
        const spamPatterns = [
            /viagra|cialis|loan|casino|lottery|winner|congratulations/i,
            /click here now|act now|limited time|urgent response/i,
            /make money|get rich|work from home|miracle/i
        ];
        
        const sender = (email.from?.emailAddress?.address || '').toLowerCase();
        const subject = (email.subject || '').toLowerCase();
        
        // Patterns de spam dans le texte
        if (spamPatterns.some(pattern => pattern.test(text))) {
            return true;
        }
        
        // Sujet trop de majuscules
        if (subject.length > 10 && (subject.match(/[A-Z]/g) || []).length / subject.length > 0.7) {
            return true;
        }
        
        // Domaines suspects
        const suspiciousDomains = ['temporary', 'tempmail', '10minutemail'];
        if (suspiciousDomains.some(domain => sender.includes(domain))) {
            return true;
        }
        
        return false;
    }

    detectCC(email) {
        const recipients = [
            ...(email.toRecipients || []),
            ...(email.ccRecipients || []),
            ...(email.bccRecipients || [])
        ];
        
        return recipients.length > 3; // Plus de 3 destinataires = probablement CC
    }

    // ================================================
    // GESTION DES CATÉGORIES PRÉ-SÉLECTIONNÉES
    // ================================================
    getTaskPreselectedCategories() {
        return [...this.taskPreselectedCategories];
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[CategoryManager] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const oldCategories = [...this.taskPreselectedCategories];
        this.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
        
        this.saveSettings();
        
        // Notifier les changements
        this.notifyChange('taskPreselectedCategories', this.taskPreselectedCategories, this.settings);
        
        console.log('[CategoryManager] ✅ Catégories pré-sélectionnées mises à jour');
        return this.taskPreselectedCategories;
    }

    // ================================================
    // ACCÈS AUX DONNÉES
    // ================================================
    getCategories() {
        return { ...this.categories, ...this.customCategories };
    }

    getCategory(categoryId) {
        return this.categories[categoryId] || this.customCategories[categoryId] || null;
    }

    getCustomCategories() {
        return { ...this.customCategories };
    }

    getActiveCategories() {
        return this.settings.activeCategories || Object.keys(this.categories);
    }

    getSettings() {
        return { ...this.settings };
    }

    // ================================================
    // SAUVEGARDE
    // ================================================
    saveSettings() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            console.log('[CategoryManager] 💾 Paramètres sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde:', error);
        }
    }

    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] 🎨 Catégories personnalisées sauvegardées');
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde catégories personnalisées:', error);
        }
    }

    // ================================================
    // LISTENERS ET ÉVÉNEMENTS
    // ================================================
    addChangeListener(callback) {
        if (typeof callback === 'function') {
            this.changeListeners.push(callback);
            console.log('[CategoryManager] 👂 Listener ajouté');
            
            // Retourner une fonction de nettoyage
            return () => {
                const index = this.changeListeners.indexOf(callback);
                if (index > -1) {
                    this.changeListeners.splice(index, 1);
                    console.log('[CategoryManager] 👂 Listener supprimé');
                }
            };
        }
        return null;
    }

    notifyChange(type, value, fullSettings = null) {
        console.log('[CategoryManager] 📢 Notification changement:', type);
        
        this.changeListeners.forEach(callback => {
            try {
                callback(type, value, fullSettings || this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur notification listener:', error);
            }
        });
        
        // Dispatcher un événement global
        this.dispatchEvent('categorySettingsChanged', {
            type,
            value,
            settings: fullSettings || this.settings,
            source: 'CategoryManager'
        });
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, {
                detail: {
                    ...detail,
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error('[CategoryManager] Erreur dispatch événement:', error);
        }
    }

    dispatchModuleReady() {
        try {
            window.dispatchEvent(new CustomEvent('moduleReady', {
                detail: {
                    moduleName: 'CategoryManager',
                    timestamp: Date.now(),
                    source: 'CategoryManager'
                }
            }));
            console.log('[CategoryManager] 📢 Module prêt notifié');
        } catch (error) {
            console.error('[CategoryManager] Erreur notification module prêt:', error);
        }
    }

    // ================================================
    // CATÉGORIES PERSONNALISÉES
    // ================================================
    addCustomCategory(categoryData) {
        const id = `custom_${Date.now()}`;
        this.customCategories[id] = {
            ...categoryData,
            isCustom: true,
            id
        };
        
        this.saveCustomCategories();
        this.initializePatterns(); // Réinitialiser les patterns
        
        console.log('[CategoryManager] ➕ Catégorie personnalisée ajoutée:', id);
        return id;
    }

    updateCustomCategory(id, categoryData) {
        if (this.customCategories[id]) {
            this.customCategories[id] = {
                ...this.customCategories[id],
                ...categoryData
            };
            
            this.saveCustomCategories();
            this.initializePatterns();
            
            console.log('[CategoryManager] ✏️ Catégorie personnalisée mise à jour:', id);
            return true;
        }
        return false;
    }

    deleteCustomCategory(id) {
        if (this.customCategories[id]) {
            delete this.customCategories[id];
            
            // Retirer des catégories pré-sélectionnées si nécessaire
            if (this.taskPreselectedCategories.includes(id)) {
                this.taskPreselectedCategories = this.taskPreselectedCategories.filter(catId => catId !== id);
                this.settings.taskPreselectedCategories = this.taskPreselectedCategories;
                this.saveSettings();
            }
            
            this.saveCustomCategories();
            this.initializePatterns();
            
            console.log('[CategoryManager] 🗑️ Catégorie personnalisée supprimée:', id);
            return true;
        }
        return false;
    }

    // ================================================
    // STATISTIQUES
    // ================================================
    getCategoryStats() {
        const allCategories = this.getCategories();
        const stats = {
            totalCategories: Object.keys(allCategories).length,
            defaultCategories: Object.keys(this.categories).length,
            customCategories: Object.keys(this.customCategories).length,
            preselectedCategories: this.taskPreselectedCategories.length,
            categoriesWithPatterns: 0
        };
        
        Object.values(allCategories).forEach(category => {
            if (category.keywords && Object.keys(category.keywords).length > 0) {
                stats.categoriesWithPatterns++;
            }
        });
        
        return stats;
    }

    // ================================================
    // MÉTHODES DE TEST
    // ================================================
    testEmail(subject, body, sender, expectedCategory = null) {
        const testEmail = {
            subject,
            bodyPreview: body,
            from: {
                emailAddress: {
                    address: sender,
                    name: sender.split('@')[0]
                }
            }
        };
        
        const result = this.analyzeEmail(testEmail);
        
        console.log('[CategoryManager] 🧪 Test email:', {
            subject: subject.substring(0, 30) + '...',
            result: result.category,
            expected: expectedCategory,
            score: result.score,
            confidence: Math.round(result.confidence * 100) + '%',
            success: expectedCategory ? result.category === expectedCategory : 'N/A'
        });
        
        return result;
    }

    runTests() {
        console.group('🧪 Tests CategoryManager');
        
        const tests = [
            {
                subject: "Action requise: Confirmer votre commande",
                body: "Veuillez confirmer votre commande dans les plus brefs délais",
                sender: "orders@shop.com",
                expected: "tasks"
            },
            {
                subject: "Réunion équipe demain 14h",
                body: "Réunion prévue demain à 14h en salle de conférence",
                sender: "manager@company.com",
                expected: "meetings"
            },
            {
                subject: "Facture #12345 - Échéance 30 jours",
                body: "Votre facture d'un montant de 150 euros",
                sender: "billing@provider.com",
                expected: "finance"
            },
            {
                subject: "Newsletter hebdomadaire - Désabonnez-vous",
                body: "Voici votre newsletter avec un lien unsubscribe",
                sender: "newsletter@site.com",
                expected: "marketing_news"
            },
            {
                subject: "Alerte sécurité - Nouvelle connexion détectée",
                body: "Une nouvelle connexion a été détectée sur votre compte",
                sender: "security@platform.com",
                expected: "security"
            }
        ];
        
        let passed = 0;
        let total = tests.length;
        
        tests.forEach(test => {
            const result = this.testEmail(test.subject, test.body, test.sender, test.expected);
            if (result.category === test.expected) {
                passed++;
            }
        });
        
        console.log(`✅ Tests terminés: ${passed}/${total} réussis (${Math.round(passed/total*100)}%)`);
        console.groupEnd();
        
        return { passed, total, success: passed === total };
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        this.changeListeners = [];
        this.patterns.clear();
        this.exclusions.clear();
        console.log('[CategoryManager] 🧹 Nettoyage effectué');
    }

    destroy() {
        this.cleanup();
        this.isInitialized = false;
        console.log('[CategoryManager] 💥 Instance détruite');
    }
}

// ================================================
// CRÉATION INSTANCE GLOBALE SÉCURISÉE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance...');
window.categoryManager = new CategoryManager();

// Export de la classe pour usage externe
window.CategoryManager = CategoryManager;

// Méthodes globales de test
window.testCategoryManager = function() {
    if (window.categoryManager) {
        return window.categoryManager.runTests();
    } else {
        console.error('CategoryManager non disponible');
        return { error: 'CategoryManager non disponible' };
    }
};

window.debugCategoryManager = function() {
    if (window.categoryManager) {
        console.group('🔍 Debug CategoryManager');
        console.log('Initialized:', window.categoryManager.isInitialized);
        console.log('Categories:', Object.keys(window.categoryManager.getCategories()));
        console.log('Custom Categories:', Object.keys(window.categoryManager.getCustomCategories()));
        console.log('Preselected:', window.categoryManager.getTaskPreselectedCategories());
        console.log('Settings:', window.categoryManager.getSettings());
        console.log('Stats:', window.categoryManager.getCategoryStats());
        console.groupEnd();
        
        return {
            initialized: window.categoryManager.isInitialized,
            stats: window.categoryManager.getCategoryStats()
        };
    } else {
        console.error('CategoryManager non disponible');
        return { error: 'CategoryManager non disponible' };
    }
};

console.log('✅ CategoryManager v8.0 loaded - Complètement corrigé et optimisé');
