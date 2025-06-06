// EmailScanner.js - Scanner d'emails CORRIGÉ v4.1 - Récupération et catégorisation fiables

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        this.debugMode = false;
        console.log('[EmailScanner] ✅ Initialized v4.1 - Reliable fetch and categorization');
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE SCAN COMPLÈTEMENT CORRIGÉE
    // ================================================
    async scan(options = {}) {
        const {
            days = 30,
            folder = 'inbox',
            onProgress = null,
            includeSpam = true,
            maxEmails = 1000
        } = options;

        if (this.isScanning) {
            console.warn('[EmailScanner] Scan already in progress');
            return null;
        }

        try {
            this.isScanning = true;
            this.reset();
            this.scanProgress = onProgress;

            console.log('[EmailScanner] 🚀 Starting CORRECTED scan with options:', {
                days,
                folder,
                maxEmails,
                includeSpam
            });

            // Étape 1: Vérifications préliminaires RENFORCÉES
            await this.performPreScanChecks();

            // Étape 2: Calculer les dates avec validation
            const { startDate, endDate } = this.calculateScanDates(days);
            console.log('[EmailScanner] 📅 Scan period:', { startDate, endDate, days });

            // Étape 3: Récupérer les emails avec gestion d'erreurs robuste
            if (this.scanProgress) {
                this.scanProgress({ 
                    phase: 'fetching', 
                    message: `Récupération des emails des ${days} derniers jours...`,
                    progress: { current: 0, total: 100 }
                });
            }

            const emails = await this.fetchEmailsWithRetry(folder, startDate, endDate, maxEmails);
            
            if (!emails || emails.length === 0) {
                console.warn('[EmailScanner] ⚠️ No emails found for the specified period');
                return this.createEmptyResult(days, folder);
            }

            this.emails = emails;
            console.log(`[EmailScanner] ✅ Successfully fetched ${this.emails.length} emails`);

            // Étape 4: Catégoriser avec le CategoryManager amélioré
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'categorizing',
                    message: 'Classification intelligente des emails...',
                    progress: { current: 0, total: this.emails.length }
                });
            }

            await this.categorizeEmailsRobust();

            // Étape 5: Générer les résultats finaux
            const results = this.generateFinalResults(days, folder);

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: `Scan terminé ! ${results.total} emails analysés`,
                    results
                });
            }

            // Log final pour debug
            this.logFinalResults(results);

            return results;

        } catch (error) {
            console.error('[EmailScanner] ❌ CRITICAL scan error:', error);
            
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'error',
                    message: `Erreur critique: ${error.message}`,
                    error
                });
            }
            
            throw error;
        } finally {
            this.isScanning = false;
        }
    }

    // ================================================
    // VÉRIFICATIONS PRE-SCAN RENFORCÉES
    // ================================================
    async performPreScanChecks() {
        console.log('[EmailScanner] 🔍 Performing pre-scan checks...');

        // Vérifier AuthService
        if (!window.authService) {
            throw new Error('AuthService not available - Email scanning requires authentication');
        }

        if (!window.authService.isAuthenticated()) {
            throw new Error('User not authenticated - Please login first');
        }

        // Vérifier MailService
        if (!window.mailService) {
            throw new Error('MailService not available - Cannot access emails');
        }

        // Initialiser MailService si nécessaire
        if (!window.mailService.isInitialized) {
            console.log('[EmailScanner] 🔧 Initializing MailService...');
            await window.mailService.initialize();
        }

        // Test de connectivité rapide
        try {
            const testResult = await window.mailService.testConnection();
            if (!testResult.success) {
                throw new Error(`MailService connection test failed: ${testResult.error}`);
            }
            console.log('[EmailScanner] ✅ Pre-scan checks passed');
        } catch (testError) {
            throw new Error(`Pre-scan connectivity test failed: ${testError.message}`);
        }

        // Vérifier CategoryManager
        if (!window.categoryManager) {
            console.warn('[EmailScanner] ⚠️ CategoryManager not available - emails will not be categorized');
        }
    }

    // ================================================
    // CALCUL DES DATES AVEC VALIDATION
    // ================================================
    calculateScanDates(days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        // Validation des dates
        if (days <= 0 || days > 365) {
            console.warn('[EmailScanner] ⚠️ Invalid days parameter, using default 30 days');
            startDate.setDate(endDate.getDate() - 30);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    // ================================================
    // RÉCUPÉRATION D'EMAILS AVEC RETRY ET FALLBACK
    // ================================================
    async fetchEmailsWithRetry(folder, startDate, endDate, maxEmails, maxRetries = 3) {
        let emails = [];
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`[EmailScanner] 📧 Attempt ${attempt}/${maxRetries} - Fetching emails from ${folder}`);
                
                // Utiliser la méthode correcte de MailService
                emails = await window.mailService.getEmailsFromFolder(folder, {
                    startDate: startDate,
                    endDate: endDate,
                    top: maxEmails,
                    orderBy: 'receivedDateTime desc'
                });

                if (emails && emails.length > 0) {
                    console.log(`[EmailScanner] ✅ Attempt ${attempt} successful: ${emails.length} emails fetched`);
                    return emails;
                }

                console.warn(`[EmailScanner] ⚠️ Attempt ${attempt} returned no emails`);
                
                // Si pas d'emails mais pas d'erreur, ce n'est pas forcément un échec
                if (emails && emails.length === 0) {
                    return emails; // Retourner un tableau vide plutôt que de retry
                }

            } catch (error) {
                lastError = error;
                console.error(`[EmailScanner] ❌ Attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
                    console.log(`[EmailScanner] ⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // Si tous les tentatives ont échoué
        if (lastError) {
            throw new Error(`Failed to fetch emails after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }

        // Si aucune erreur mais aucun email
        console.warn('[EmailScanner] ⚠️ All attempts completed but no emails retrieved');
        return [];
    }

    // ================================================
    // CATÉGORISATION ROBUSTE AVEC GESTION D'ERREURS
    // ================================================
    async categorizeEmailsRobust() {
        if (!window.categoryManager) {
            console.warn('[EmailScanner] ⚠️ CategoryManager not available, skipping categorization');
            this.emails.forEach(email => {
                email.category = 'other';
                email.categoryScore = 0;
                email.categoryConfidence = 0;
            });
            return;
        }

        const total = this.emails.length;
        let processed = 0;
        let errors = 0;
        let categorized = 0;

        console.log('[EmailScanner] 🏷️ Starting robust categorization of', total, 'emails');

        // Initialiser les conteneurs de catégories
        const categories = window.categoryManager.getCategories();
        Object.keys(categories).forEach(catId => {
            this.categorizedEmails[catId] = [];
        });
        this.categorizedEmails.other = [];

        // Statistiques de catégorisation
        const categoryStats = {};
        Object.keys(categories).forEach(catId => {
            categoryStats[catId] = 0;
        });
        categoryStats.other = 0;

        // Traitement par lots pour de meilleures performances
        const batchSize = 10;
        
        for (let i = 0; i < this.emails.length; i += batchSize) {
            const batch = this.emails.slice(i, Math.min(i + batchSize, this.emails.length));
            
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
                    
                    // Ajouter à la catégorie appropriée
                    const categoryId = email.category;
                    if (this.categorizedEmails[categoryId]) {
                        this.categorizedEmails[categoryId].push(email);
                        categoryStats[categoryId]++;
                        if (categoryId !== 'other') categorized++;
                    } else {
                        // Fallback vers 'other'
                        this.categorizedEmails.other.push(email);
                        categoryStats.other++;
                        console.warn(`[EmailScanner] Unknown category ${categoryId}, using 'other'`);
                    }

                } catch (error) {
                    console.error('[EmailScanner] ❌ Error categorizing email:', error);
                    email.category = 'other';
                    email.categoryError = error.message;
                    this.categorizedEmails.other.push(email);
                    categoryStats.other++;
                    errors++;
                }

                processed++;
            }

            // Mise à jour de la progression par lot
            if (this.scanProgress && (processed % 20 === 0 || processed >= total)) {
                const percent = Math.round((processed / total) * 100);
                this.scanProgress({
                    phase: 'categorizing',
                    message: `Classification: ${processed}/${total} emails (${percent}%)`,
                    progress: { current: processed, total }
                });
            }

            // Petite pause pour ne pas bloquer l'UI
            if (i + batchSize < this.emails.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        console.log('[EmailScanner] ✅ Categorization complete');
        console.log('[EmailScanner] 📊 Stats:', {
            total: total,
            processed: processed,
            categorized: categorized,
            errors: errors,
            distribution: categoryStats
        });

        // Log des patterns les plus fréquents pour debug
        if (this.debugMode) {
            this.logTopPatterns();
        }
    }

    // ================================================
    // GÉNÉRATION DES RÉSULTATS FINAUX
    // ================================================
    generateFinalResults(days, folder) {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithAbsolute = 0;

        // Compter les emails par catégorie
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            breakdown[catId] = emails.length;
            
            if (catId !== 'other') {
                totalCategorized += emails.length;
                
                // Compter les emails avec haute confiance
                emails.forEach(email => {
                    if (email.categoryConfidence >= 0.8) {
                        totalWithHighConfidence++;
                    }
                    if (email.hasAbsolute) {
                        totalWithAbsolute++;
                    }
                });
            }
        });

        // Calculer des statistiques enrichies
        const stats = {
            processed: this.emails.length,
            errors: this.emails.filter(e => e.categoryError).length,
            categorized: totalCategorized,
            highConfidence: totalWithHighConfidence,
            absoluteMatches: totalWithAbsolute,
            averageConfidence: this.calculateAverageConfidence(),
            averageScore: this.calculateAverageScore(),
            categoriesUsed: Object.keys(breakdown).filter(cat => breakdown[cat] > 0).length,
            scanDuration: Date.now() - (this.scanStartTime || Date.now()),
            parameters: {
                days,
                folder,
                maxEmails: 1000
            }
        };

        return {
            success: true,
            total: this.emails.length,
            categorized: totalCategorized,
            breakdown,
            stats,
            emails: this.emails,
            timestamp: new Date().toISOString(),
            version: '4.1'
        };
    }

    // ================================================
    // RÉSULTAT VIDE EN CAS D'ÉCHEC
    // ================================================
    createEmptyResult(days, folder) {
        return {
            success: true,
            total: 0,
            categorized: 0,
            breakdown: { other: 0 },
            stats: {
                processed: 0,
                errors: 0,
                categorized: 0,
                highConfidence: 0,
                absoluteMatches: 0,
                averageConfidence: 0,
                averageScore: 0,
                categoriesUsed: 0,
                scanDuration: 0,
                parameters: { days, folder, maxEmails: 1000 }
            },
            emails: [],
            timestamp: new Date().toISOString(),
            version: '4.1',
            isEmpty: true
        };
    }

    // ================================================
    // RÉINITIALISATION COMPLÈTE
    // ================================================
    reset() {
        console.log('[EmailScanner] 🔄 Resetting scanner state...');
        
        this.emails = [];
        this.categorizedEmails = {};
        this.scanStartTime = Date.now();
        
        // Initialiser toutes les catégories depuis CategoryManager
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
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
    // LOGGING ET DEBUG
    // ================================================
    logFinalResults(results) {
        console.group('[EmailScanner] 📊 === RÉSULTATS FINAUX DÉTAILLÉS ===');
        console.log(`✅ Scan réussi: ${results.success}`);
        console.log(`📧 Total emails: ${results.total}`);
        console.log(`🏷️ Catégorisés: ${results.categorized} (${Math.round((results.categorized / results.total) * 100)}%)`);
        console.log(`⭐ Haute confiance: ${results.stats.highConfidence}`);
        console.log(`🎯 Matches absolus: ${results.stats.absoluteMatches}`);
        console.log(`📈 Confiance moyenne: ${results.stats.averageConfidence}`);
        console.log(`📊 Score moyen: ${results.stats.averageScore}`);
        console.log(`⏱️ Durée scan: ${Math.round(results.stats.scanDuration / 1000)}s`);
        
        console.log('📋 Distribution par catégorie:');
        Object.entries(results.breakdown).forEach(([cat, count]) => {
            if (count > 0) {
                const percentage = Math.round((count / results.total) * 100);
                const categoryInfo = window.categoryManager?.getCategory(cat) || { name: cat, icon: '📂' };
                console.log(`  ${categoryInfo.icon} ${categoryInfo.name}: ${count} (${percentage}%)`);
            }
        });
        
        console.groupEnd();
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

    // ================================================
    // MÉTHODES D'ACCÈS AUX EMAILS
    // ================================================
    getAllEmails() {
        return this.emails || [];
    }

    getEmailsByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.emails || [];
        }
        return (this.emails || []).filter(email => email.category === categoryId);
    }

    getCategorizedEmails() {
        return this.categorizedEmails || {};
    }

    // ================================================
    // RECHERCHE D'EMAILS
    // ================================================
    searchEmails(query) {
        if (!query || !this.emails) return this.emails || [];

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

    // ================================================
    // MÉTHODES DE DIAGNOSTIC ET DEBUG
    // ================================================
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
            lastScanDuration: this.lastScanDuration || 0,
            version: '4.1'
        };
    }

    enableDebugMode() {
        this.debugMode = true;
        console.log('[EmailScanner] 🐛 Debug mode enabled');
    }

    disableDebugMode() {
        this.debugMode = false;
        console.log('[EmailScanner] Debug mode disabled');
    }

    // ================================================
    // TEST DE CATÉGORISATION
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
        console.log('============================');
        
        return result;
    }

    // ================================================
    // EXPORT DES RÉSULTATS (CONSERVÉ)
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
            ['Date', 'De', 'Email', 'Sujet', 'Catégorie', 'Confiance', 'Score', 'Patterns', 'Absolu']
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
                email.hasAbsolute ? 'Oui' : 'Non'
            ]);
        });

        const csv = rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        return '\ufeff' + csv; // BOM pour UTF-8
    }

    exportToJSON() {
        const data = {
            scanDate: new Date().toISOString(),
            totalEmails: this.emails.length,
            stats: this.getDebugInfo(),
            categories: {},
            emails: []
        };

        // Résumé par catégorie
        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            const categoryInfo = window.categoryManager?.getCategory(catId) || 
                { name: catId, icon: '📂' };
            
            data.categories[catId] = {
                name: categoryInfo.name,
                icon: categoryInfo.icon,
                count: emails.length,
                percentage: Math.round((emails.length / this.emails.length) * 100)
            };
        });

        // Détails des emails
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
            hasAbsolute: email.hasAbsolute
        }));

        return JSON.stringify(data, null, 2);
    }
}

// Créer l'instance globale
window.emailScanner = new EmailScanner();

// Ajouter des méthodes utilitaires globales pour le debug
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v4.1');
    
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

window.debugEmailScanner = function() {
    console.group('🔍 DEBUG EmailScanner');
    console.log('Instance:', window.emailScanner);
    console.log('Debug Info:', window.emailScanner.getDebugInfo());
    console.log('Current emails:', window.emailScanner.getAllEmails().length);
    console.log('Categorized emails:', window.emailScanner.getCategorizedEmails());
    console.groupEnd();
};

console.log('✅ EmailScanner v4.1 loaded - Reliable email fetching and categorization');
