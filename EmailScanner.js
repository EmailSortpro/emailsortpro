// EmailScanner.js - Version 4.1 - CORRIGÉ avec synchronisation paramètres

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        
        // Paramètres synchronisés
        this.currentSettings = this.loadSettings();
        this.preselectedCategories = [];
        
        this.bindSettingsEvents();
        console.log('[EmailScanner] ✅ Initialized v4.1 - CORRIGÉ avec synchronisation paramètres');
    }

    // ================================================
    // SYNCHRONISATION AVEC LES PARAMÈTRES
    // ================================================
    loadSettings() {
        // Charger depuis CategoriesPage si disponible
        if (window.categoriesPage) {
            return {
                scanSettings: window.categoriesPage.getScanSettings(),
                taskPreselectedCategories: window.categoriesPage.getTaskPreselectedCategories(),
                automationSettings: window.categoriesPage.getAutomationSettings()
            };
        }
        
        // Fallback vers localStorage direct
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                const settings = JSON.parse(saved);
                return {
                    scanSettings: settings.scanSettings || {},
                    taskPreselectedCategories: settings.taskPreselectedCategories || [],
                    automationSettings: settings.automationSettings || {}
                };
            }
        } catch (error) {
            console.warn('[EmailScanner] Error loading settings:', error);
        }
        
        return {
            scanSettings: {},
            taskPreselectedCategories: [],
            automationSettings: {}
        };
    }

    bindSettingsEvents() {
        // Écouter les changements de paramètres
        window.addEventListener('settingsChanged', (event) => {
            this.onSettingsChanged(event.detail.settings);
        });
    }

    onSettingsChanged(settings) {
        console.log('[EmailScanner] Settings changed, updating scanner...');
        
        this.currentSettings = {
            scanSettings: settings.scanSettings || {},
            taskPreselectedCategories: settings.taskPreselectedCategories || [],
            automationSettings: settings.automationSettings || {}
        };
        
        this.preselectedCategories = this.currentSettings.taskPreselectedCategories;
        
        console.log('[EmailScanner] Settings updated:', {
            preselectedCategories: this.preselectedCategories.length,
            autoAnalyze: this.currentSettings.scanSettings.autoAnalyze,
            autoCreateTasks: this.currentSettings.automationSettings.autoCreateTasks
        });
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE SCAN CORRIGÉE AVEC PARAMÈTRES
    // ================================================
    async scan(options = {}) {
        const {
            days = 30,
            folder = 'inbox',
            onProgress = null,
            includeSpam = true,
            maxEmails = 1000,
            // NOUVEAUX PARAMÈTRES SYNCHRONISÉS
            autoAnalyze = this.currentSettings.scanSettings?.autoAnalyze !== false,
            autoCategrize = this.currentSettings.scanSettings?.autoCategrize !== false,
            preselectedCategories = this.preselectedCategories,
            automationSettings = this.currentSettings.automationSettings
        } = options;

        if (this.isScanning) {
            console.warn('[EmailScanner] Scan already in progress');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = onProgress;
            this.preselectedCategories = preselectedCategories;

            console.log('[EmailScanner] 🚀 Starting scan with synchronized options:', {
                days,
                folder,
                maxEmails,
                includeSpam,
                autoAnalyze,
                autoCategrize,
                preselectedCategories: preselectedCategories.length,
                automationSettings
            });

            // Étape 1: Vérifier les services requis
            if (!window.mailService) {
                throw new Error('MailService not available');
            }

            if (!window.categoryManager) {
                throw new Error('CategoryManager not available');
            }

            // Étape 2: Calculer les dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            // Étape 3: Récupérer les emails via la BONNE méthode
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: 'Récupération des emails depuis votre boîte...',
                    progress: { current: 0, total: 100 }
                });
            }

            console.log('[EmailScanner] 📧 Fetching emails from folder:', folder);

            const emails = await window.mailService.getEmailsFromFolder(folder, {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                top: maxEmails
            });

            this.emails = emails || [];
            console.log(`[EmailScanner] ✅ Fetched ${this.emails.length} emails from ${folder}`);

            if (this.emails.length === 0) {
                console.warn('[EmailScanner] No emails found in the specified period');
                return {
                    success: true,
                    total: 0,
                    categorized: 0,
                    breakdown: {},
                    stats: { processed: 0, errors: 0 },
                    emails: [],
                    preselectedCategoriesUsed: preselectedCategories.length,
                    automationApplied: false
                };
            }

            // Étape 4: Catégoriser les emails avec le nouveau CategoryManager
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'categorizing',
                    message: 'Analyse et catégorisation intelligente des emails...',
                    progress: { current: 0, total: this.emails.length }
                });
            }

            await this.categorizeEmailsEnhanced();

            // Étape 5: Appliquer les paramètres de pré-sélection
            const preselectedEmails = this.applyPreselectedCategories(preselectedCategories);

            // Étape 6: Calculer les résultats avec les paramètres appliqués
            const results = this.getDetailedResults();
            
            // Ajouter les informations de synchronisation
            results.preselectedCategoriesUsed = preselectedCategories.length;
            results.preselectedEmails = preselectedEmails;
            results.automationSettings = automationSettings;
            results.scanSettings = { autoAnalyze, autoCategrize };

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            // Log de distribution pour debug avec paramètres
            this.logCategoryDistribution(results);
            this.logPreselectionResults(preselectedEmails, preselectedCategories);

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ Scan error:', error);
            
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
    // APPLICATION DES CATÉGORIES PRÉ-SÉLECTIONNÉES
    // ================================================
    applyPreselectedCategories(preselectedCategories) {
        if (!preselectedCategories || preselectedCategories.length === 0) {
            console.log('[EmailScanner] Aucune catégorie pré-sélectionnée');
            return [];
        }

        console.log('[EmailScanner] 🎯 Application des catégories pré-sélectionnées:', preselectedCategories);

        const preselectedEmails = [];

        // Marquer les emails des catégories pré-sélectionnées
        this.emails.forEach(email => {
            if (preselectedCategories.includes(email.category)) {
                email.isPreselected = true;
                email.preselectedFor = 'tasks'; // Marquer pour création de tâches
                preselectedEmails.push(email);
                
                console.log(`[EmailScanner] ✓ Email pré-sélectionné: ${email.subject} (${email.category})`);
            }
        });

        console.log(`[EmailScanner] 📊 Résultat pré-sélection: ${preselectedEmails.length} emails sélectionnés sur ${this.emails.length} total`);

        return preselectedEmails;
    }

    logPreselectionResults(preselectedEmails, preselectedCategories) {
        if (preselectedCategories.length === 0) return;

        console.log('[EmailScanner] 🎯 === RÉSULTATS PRÉ-SÉLECTION ===');
        console.log(`[EmailScanner] Catégories pré-sélectionnées: ${preselectedCategories.join(', ')}`);
        console.log(`[EmailScanner] Emails correspondants: ${preselectedEmails.length}`);

        // Répartition par catégorie pré-sélectionnée
        const breakdown = {};
        preselectedEmails.forEach(email => {
            breakdown[email.category] = (breakdown[email.category] || 0) + 1;
        });

        console.log('[EmailScanner] Répartition par catégorie pré-sélectionnée:');
        Object.entries(breakdown).forEach(([category, count]) => {
            const categoryInfo = window.categoryManager?.getCategory(category);
            const icon = categoryInfo?.icon || '📂';
            const name = categoryInfo?.name || category;
            console.log(`[EmailScanner]   ${icon} ${name}: ${count} emails`);
        });

        console.log('[EmailScanner] ================================');
    }

    // ================================================
    // RÉINITIALISATION COMPLÈTE
    // ================================================
    reset() {
        console.log('[EmailScanner] 🔄 Resetting scanner...');
        this.emails = [];
        this.categorizedEmails = {};
        
        // Initialiser toutes les catégories depuis CategoryManager
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            
            // Créer un conteneur pour chaque catégorie définie
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        // Toujours s'assurer que 'other' existe
        this.categorizedEmails.other = [];
        
        console.log('[EmailScanner] ✅ Reset complete, categories initialized:', 
            Object.keys(this.categorizedEmails));
    }

    // ================================================
    // CATÉGORISATION AMÉLIORÉE AVEC CATEGORYMANAGER
    // ================================================
    async categorizeEmailsEnhanced() {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        console.log('[EmailScanner] 🏷️ Starting enhanced categorization of', total, 'emails');
        console.log('[EmailScanner] Using CategoryManager with weighted scoring');

        // Statistiques de catégorisation
        const categoryStats = {};
        const categories = window.categoryManager.getCategories();
        
        // Initialiser les stats
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
        });
        categoryStats.other = 0;

        // Analyser chaque email avec le système
        for (let i = 0; i < this.emails.length; i++) {
            const email = this.emails[i];
            
            try {
                // Utiliser CategoryManager pour analyser
                const analysis = window.categoryManager.analyzeEmail(email);
                
                // Enrichir l'email avec toutes les données de catégorisation
                email.category = analysis.category || 'other';
                email.categoryScore = analysis.score || 0;
                email.categoryConfidence = analysis.confidence || 0;
                email.matchedPatterns = analysis.matchedPatterns || [];
                email.hasAbsolute = analysis.hasAbsolute || false;
                
                // Ajouter à la catégorie appropriée
                const categoryId = email.category;
                if (this.categorizedEmails[categoryId]) {
                    this.categorizedEmails[categoryId].push(email);
                    categoryStats[categoryId]++;
                } else {
                    // Fallback vers 'other' si la catégorie n'existe pas
                    this.categorizedEmails.other.push(email);
                    categoryStats.other++;
                    console.warn(`[EmailScanner] Unknown category ${categoryId}, using 'other'`);
                }

                // Log détaillé pour les emails avec patterns absolus
                if (email.hasAbsolute && this.debugMode) {
                    console.log(`[EmailScanner] 🎯 Absolute match for ${categoryId}:`, {
                        subject: email.subject?.substring(0, 50),
                        score: email.categoryScore,
                        patterns: email.matchedPatterns.filter(p => p.type === 'absolute')
                    });
                }

            } catch (error) {
                console.error('[EmailScanner] ❌ Error categorizing email:', error);
                email.category = 'other';
                email.categoryError = error.message;
                this.categorizedEmails.other.push(email);
                categoryStats.other++;
                errors++;
            }

            // Mise à jour de la progression
            processed++;
            if (this.scanProgress && (processed % 10 === 0 || processed === total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Catégorisation: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }
        }

        console.log('[EmailScanner] ✅ Categorization complete');
        console.log('[EmailScanner] 📊 Category distribution:', categoryStats);
        console.log('[EmailScanner] ⚠️ Errors during categorization:', errors);
        
        // Afficher les top patterns détectés
        this.logTopPatterns();
    }

    // ================================================
    // ANALYSE DES PATTERNS LES PLUS FRÉQUENTS
    // ================================================
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
        
        // Trier par fréquence
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

    // ================================================
    // CALCUL DES RÉSULTATS DÉTAILLÉS AVEC PARAMÈTRES
    // ================================================
    getDetailedResults() {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithAbsolute = 0;
        let totalPreselected = 0;

        // Compter les emails par catégorie et calculer les stats
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId !== 'other') {
                totalCategorized += emails.length;
                
                // Compter les emails avec haute confiance et pré-sélectionnés
                emails.forEach(email => {
                    if (email.categoryConfidence >= 0.8) {
                        totalWithHighConfidence++;
                    }
                    if (email.hasAbsolute) {
                        totalWithAbsolute++;
                    }
                    if (email.isPreselected) {
                        totalPreselected++;
                    }
                });
            }
        });

        // Calculer des statistiques supplémentaires
        const avgConfidence = this.calculateAverageConfidence();
        const avgScore = this.calculateAverageScore();

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            stats: {
                processed: this.emails.length,
                errors: this.emails.filter(e => e.categoryError).length,
                highConfidence: totalWithHighConfidence,
                absoluteMatches: totalWithAbsolute,
                averageConfidence: avgConfidence,
                averageScore: avgScore,
                categoriesUsed: Object.keys(breakdown).filter(cat => breakdown[cat] > 0).length,
                preselected: totalPreselected
            },
            emails: this.emails,
            // Informations de paramètres
            preselectedCategories: this.preselectedCategories,
            preselectedCount: totalPreselected
        };
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX EMAILS AVEC FILTRES
    // ================================================
    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.emails;
        }
        if (categoryId === 'preselected') {
            return this.emails.filter(email => email.isPreselected);
        }
        return this.emails.filter(email => email.category === categoryId);
    }

    getPreselectedEmails() {
        return this.emails.filter(email => email.isPreselected);
    }

    getEmailsForTaskCreation() {
        // Retourner les emails des catégories pré-sélectionnées pour création de tâches
        return this.emails.filter(email => 
            this.preselectedCategories.includes(email.category)
        );
    }

    getAllEmails() {
        return this.emails;
    }

    getCategorizedEmails() {
        return this.categorizedEmails;
    }

    // ================================================
    // CALCULS STATISTIQUES
    // ================================================
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

    // ================================================
    // LOG DE DISTRIBUTION DÉTAILLÉ AVEC PARAMÈTRES
    // ================================================
    logCategoryDistribution(results) {
        console.log('[EmailScanner] 📊 === RÉSULTATS FINAUX AVEC PARAMÈTRES ===');
        console.log(`[EmailScanner] Total emails: ${results.total}`);
        console.log(`[EmailScanner] Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
        console.log(`[EmailScanner] Pré-sélectionnés: ${results.stats.preselected}`);
        console.log(`[EmailScanner] Haute confiance: ${results.stats.highConfidence}`);
        console.log(`[EmailScanner] Matches absolus: ${results.stats.absoluteMatches}`);
        console.log(`[EmailScanner] Confiance moyenne: ${results.stats.averageConfidence}`);
        console.log(`[EmailScanner] Score moyen: ${results.stats.averageScore}`);
        console.log('[EmailScanner] Distribution par catégorie:');
        
        // Obtenir les catégories depuis CategoryManager pour l'ordre
        const categories = window.categoryManager?.getCategories() || {};
        const categoryOrder = Object.keys(categories).sort((a, b) => {
            return (categories[b].priority || 50) - (categories[a].priority || 50);
        });
        
        // Ajouter 'other' à la fin
        categoryOrder.push('other');
        
        // Afficher dans l'ordre de priorité avec indication pré-sélection
        categoryOrder.forEach(cat => {
            if (results.breakdown[cat] !== undefined && results.breakdown[cat] > 0) {
                const count = results.breakdown[cat];
                const percentage = Math.round((count / results.total) * 100);
                const categoryInfo = categories[cat] || { name: 'Autre', icon: '📌' };
                const isPreselected = this.preselectedCategories.includes(cat) ? ' 🎯' : '';
                console.log(`[EmailScanner]   ${categoryInfo.icon} ${categoryInfo.name}: ${count} emails (${percentage}%)${isPreselected}`);
            }
        });
        
        console.log('[EmailScanner] ================================================');
    }

    // ================================================
    // RECHERCHE D'EMAILS AMÉLIORÉE
    // ================================================
    searchEmails(query, options = {}) {
        const { includePreselected = false, categoryFilter = null } = options;
        
        if (!query) {
            let emails = this.emails;
            
            if (categoryFilter) {
                emails = emails.filter(email => email.category === categoryFilter);
            }
            
            if (includePreselected) {
                emails = emails.filter(email => email.isPreselected);
            }
            
            return emails;
        }

        const searchTerm = query.toLowerCase();
        
        return this.emails.filter(email => {
            // Filtres de base
            if (categoryFilter && email.category !== categoryFilter) return false;
            if (includePreselected && !email.isPreselected) return false;
            
            // Recherche textuelle
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

    // ================================================
    // GROUPEMENT DES EMAILS AVEC PARAMÈTRES
    // ================================================
    getEmailGroups(categoryId = null, options = {}) {
        const { includePreselected = false } = options;
        
        let emails = categoryId ? 
            this.getEmailsByCategory(categoryId) : 
            this.emails;

        if (includePreselected) {
            emails = emails.filter(email => email.isPreselected);
        }

        const groups = new Map();

        emails.forEach(email => {
            const key = email.from?.emailAddress?.address || 'unknown';
            const name = email.from?.emailAddress?.name || key.split('@')[0];

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
                    hasPreselected: false
                });
            }

            const group = groups.get(key);
            group.emails.push(email);
            group.count++;
            group.categories.add(email.category);
            group.totalScore += (email.categoryScore || 0);
            
            if (email.isPreselected) {
                group.hasPreselected = true;
            }

            const emailDate = new Date(email.receivedDateTime);
            if (!group.latestDate || emailDate > group.latestDate) {
                group.latestDate = emailDate;
            }
        });

        // Convertir en array et calculer les moyennes
        return Array.from(groups.values())
            .map(g => {
                const avgScore = g.count > 0 ? Math.round(g.totalScore / g.count) : 0;
                const avgConfidence = g.count > 0 ? 
                    g.emails.reduce((sum, e) => sum + (e.categoryConfidence || 0), 0) / g.count : 0;
                
                return {
                    ...g,
                    categories: Array.from(g.categories),
                    avgScore,
                    avgConfidence: Math.round(avgConfidence * 100) / 100
                };
            })
            .sort((a, b) => {
                // Prioriser les groupes avec emails pré-sélectionnés
                if (a.hasPreselected && !b.hasPreselected) return -1;
                if (!a.hasPreselected && b.hasPreselected) return 1;
                return b.count - a.count;
            });
    }

    // ================================================
    // EXPORT DES RÉSULTATS AVEC PARAMÈTRES
    // ================================================
    exportResults(format = 'csv') {
        console.log('[EmailScanner] 📤 Exporting results as', format);
        
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

            // Créer le blob et télécharger
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
            console.error('[EmailScanner] ❌ Export error:', error);
            if (window.uiManager) {
                window.uiManager.showToast('Erreur lors de l\'export', 'error');
            }
        }
    }

    exportToCSV() {
        const rows = [
            ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Patterns', 'Absolu', 'Présélectionné']
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
                email.isPreselected ? 'Oui' : 'Non'
            ]);
        });

        const csv = rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // Ajouter BOM pour UTF-8
        return '\ufeff' + csv;
    }

    exportToJSON() {
        const data = {
            scanDate: new Date().toISOString(),
            totalEmails: this.emails.length,
            stats: this.getDetailedResults().stats,
            preselectedCategories: this.preselectedCategories,
            categories: {},
            emails: []
        };

        // Ajouter le résumé par catégorie
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            const categoryInfo = window.categoryManager?.getCategory(catId) || 
                { name: catId, icon: '📂' };
            
            const preselectedCount = emails.filter(e => e.isPreselected).length;
            
            data.categories[catId] = {
                name: categoryInfo.name,
                icon: categoryInfo.icon,
                count: emails.length,
                percentage: Math.round((emails.length / this.emails.length) * 100),
                avgScore: emails.length > 0 ? 
                    Math.round(emails.reduce((sum, e) => sum + (e.categoryScore || 0), 0) / emails.length) : 0,
                preselected: preselectedCount,
                isPreselectedCategory: this.preselectedCategories.includes(catId)
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
            isPreselected: email.isPreselected,
            patterns: email.matchedPatterns?.map(p => ({
                type: p.type,
                keyword: p.keyword,
                score: p.score
            }))
        }));

        return JSON.stringify(data, null, 2);
    }

    // ================================================
    // MÉTHODES DE TEST ET DEBUG
    // ================================================
    testCategorization(emailSample) {
        console.log('[EmailScanner] 🧪 === TEST CATEGORIZATION ===');
        
        if (!window.categoryManager) {
            console.error('[EmailScanner] CategoryManager not available for testing');
            return null;
        }
        
        const result = window.categoryManager.analyzeEmail(emailSample);
        console.log('Email:', emailSample.subject);
        console.log('Résultat:', result.category);
        console.log('Score:', result.score);
        console.log('Confiance:', Math.round(result.confidence * 100) + '%');
        console.log('Patterns matchés:', result.matchedPatterns);
        console.log('Match absolu:', result.hasAbsolute ? '✅ OUI' : '❌ NON');
        console.log('Pré-sélectionné:', this.preselectedCategories.includes(result.category) ? '🎯 OUI' : '❌ NON');
        console.log('============================');
        
        return result;
    }

    getDebugInfo() {
        return {
            isScanning: this.isScanning,
            totalEmails: this.emails.length,
            categorizedCount: Object.values(this.categorizedEmails)
                .reduce((sum, emails) => sum + emails.length, 0),
            categories: Object.keys(this.categorizedEmails)
                .filter(cat => this.categorizedEmails[cat].length > 0),
            avgConfidence: this.calculateAverageConfidence(),
            avgScore: this.calculateAverageScore(),
            preselectedCategories: this.preselectedCategories,
            preselectedEmailsCount: this.emails.filter(e => e.isPreselected).length
        };
    }

    // Mode debug
    enableDebugMode() {
        this.debugMode = true;
        console.log('[EmailScanner] 🐛 Debug mode enabled');
    }

    disableDebugMode() {
        this.debugMode = false;
        console.log('[EmailScanner] Debug mode disabled');
    }

    // ================================================
    // OPÉRATIONS EN BATCH (INCHANGÉ)
    // ================================================
    async performBatchAction(emailIds, action) {
        console.log(`[EmailScanner] 🔄 Performing ${action} on ${emailIds.length} emails`);

        if (!window.mailService) {
            console.error('[EmailScanner] MailService not available for batch actions');
            return;
        }

        try {
            switch (action) {
                case 'markAsRead':
                    if (typeof window.mailService.markAsRead === 'function') {
                        const promises = emailIds.map(id => window.mailService.markAsRead(id));
                        await Promise.allSettled(promises);
                    } else {
                        console.warn('[EmailScanner] markAsRead not available in MailService');
                    }
                    break;

                case 'delete':
                    if (typeof window.mailService.deleteEmails === 'function') {
                        await window.mailService.deleteEmails(emailIds);
                    } else {
                        console.warn('[EmailScanner] deleteEmails not available in MailService');
                    }
                    break;

                case 'moveToSpam':
                    if (typeof window.mailService.moveToFolder === 'function') {
                        const spamPromises = emailIds.map(id => 
                            window.mailService.moveToFolder(id, 'junkemail')
                        );
                        await Promise.allSettled(spamPromises);
                    } else {
                        console.warn('[EmailScanner] moveToFolder not available in MailService');
                    }
                    break;

                default:
                    console.warn(`[EmailScanner] Unknown action: ${action}`);
            }
            
            if (window.uiManager) {
                window.uiManager.showToast(`Action "${action}" effectuée sur ${emailIds.length} emails`, 'success');
            }
            
        } catch (error) {
            console.error(`[EmailScanner] Error performing batch action:`, error);
            if (window.uiManager) {
                window.uiManager.showToast(`Erreur lors de l'action: ${error.message}`, 'error');
            }
        }
    }
}

// Créer l'instance globale
window.emailScanner = new EmailScanner();

// Ajouter des méthodes utilitaires globales pour le debug
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner avec paramètres');
    
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

console.log('✅ EmailScanner v4.1 loaded - CORRIGÉ avec synchronisation paramètres complète');
