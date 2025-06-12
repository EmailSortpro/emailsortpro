// EmailScanner.js - VERSION SIMPLIFIÉE ET CORRIGÉE v4.1
// Retour à une version stable avec corrections minimales

class EmailScanner {
    constructor() {
        this.emails = [];
        this.categorizedEmails = {};
        this.scanProgress = null;
        this.isScanning = false;
        
        console.log('[EmailScanner] ✅ Version 4.1 - Version simplifiée et corrigée');
    }

    // ================================================
    // MÉTHODE PRINCIPALE DE SCAN
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

            console.log('[EmailScanner] 🚀 Starting scan with options:', {
                days,
                folder,
                maxEmails,
                includeSpam
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

            // Étape 3: Récupérer les emails
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
                    emails: []
                };
            }

            // Étape 4: Catégoriser les emails
            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'categorizing',
                    message: 'Analyse et catégorisation intelligente des emails...',
                    progress: { current: 0, total: this.emails.length }
                });
            }

            await this.categorizeEmails();

            // Étape 5: Calculer les résultats
            const results = this.getDetailedResults();

            if (this.scanProgress) {
                this.scanProgress({
                    phase: 'complete',
                    message: 'Scan terminé avec succès !',
                    results
                });
            }

            console.log('[EmailScanner] ✅ Scan completed successfully');
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
    // RÉINITIALISATION
    // ================================================
    reset() {
        console.log('[EmailScanner] 🔄 Resetting scanner...');
        this.emails = [];
        this.categorizedEmails = {};
        
        // Initialiser toutes les catégories depuis CategoryManager
        if (window.categoryManager) {
            const categories = window.categoryManager.getCategories();
            Object.keys(categories).forEach(catId => {
                this.categorizedEmails[catId] = [];
            });
        }
        
        this.categorizedEmails.other = [];
        
        console.log('[EmailScanner] ✅ Reset complete, categories initialized:', 
            Object.keys(this.categorizedEmails));
    }

    // ================================================
    // CATÉGORISATION SIMPLIFIÉE
    // ================================================
    async categorizeEmails() {
        const total = this.emails.length;
        let processed = 0;
        let errors = 0;

        console.log('[EmailScanner] 🏷️ Starting categorization of', total, 'emails');

        for (let i = 0; i < this.emails.length; i++) {
            const email = this.emails[i];
            
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
                } else {
                    this.categorizedEmails.other.push(email);
                    console.warn(`[EmailScanner] Unknown category ${categoryId}, using 'other'`);
                }

            } catch (error) {
                console.error('[EmailScanner] ❌ Error categorizing email:', error);
                email.category = 'other';
                email.categoryError = error.message;
                this.categorizedEmails.other.push(email);
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
        console.log('[EmailScanner] ⚠️ Errors during categorization:', errors);
    }

    // ================================================
    // CALCUL DES RÉSULTATS
    // ================================================
    getDetailedResults() {
        const breakdown = {};
        let totalCategorized = 0;
        let totalWithHighConfidence = 0;
        let totalWithAbsolute = 0;

        // Compter les emails par catégorie
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
            stats: {
                processed: this.emails.length,
                errors: this.emails.filter(e => e.categoryError).length,
                highConfidence: totalWithHighConfidence,
                absoluteMatches: totalWithAbsolute,
                averageConfidence: avgConfidence,
                averageScore: avgScore,
                categoriesUsed: Object.keys(breakdown).filter(cat => breakdown[cat] > 0).length
            },
            emails: this.emails
        };
    }

    // ================================================
    // MÉTHODES STATISTIQUES
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
    // API PUBLIQUE
    // ================================================
    
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

    // ================================================
    // RECHERCHE D'EMAILS
    // ================================================
    searchEmails(query) {
        if (!query) return this.emails;

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
    // GROUPEMENT DES EMAILS
    // ================================================
    getEmailGroups(categoryId = null) {
        const emails = categoryId ? 
            this.getEmailsByCategory(categoryId) : 
            this.emails;

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
                    avgConfidence: 0
                });
            }

            const group = groups.get(key);
            group.emails.push(email);
            group.count++;
            group.categories.add(email.category);
            group.totalScore += (email.categoryScore || 0);

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
                    avgConfidence: Math.round(avgConfidence * 100) / 100
                };
            })
            .sort((a, b) => b.count - a.count);
    }

    // ================================================
    // EXPORT DES RÉSULTATS
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

        return '\ufeff' + csv;
    }

    exportToJSON() {
        const data = {
            scanDate: new Date().toISOString(),
            totalEmails: this.emails.length,
            stats: this.getDetailedResults().stats,
            categories: {},
            emails: []
        };

        Object.entries(this.categorizedEmails).forEach(([catId, emails]) => {
            const categoryInfo = window.categoryManager?.getCategory(catId) || 
                { name: catId, icon: '📂' };
            
            data.categories[catId] = {
                name: categoryInfo.name,
                icon: categoryInfo.icon,
                count: emails.length,
                percentage: Math.round((emails.length / this.emails.length) * 100),
                avgScore: emails.length > 0 ? 
                    Math.round(emails.reduce((sum, e) => sum + (e.categoryScore || 0), 0) / emails.length) : 0
            };
        });

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
            avgScore: this.calculateAverageScore()
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
}

// Créer l'instance globale
window.emailScanner = new EmailScanner();

// Ajouter des méthodes utilitaires globales pour le debug
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

console.log('✅ EmailScanner v4.1 CORRIGÉ loaded');
