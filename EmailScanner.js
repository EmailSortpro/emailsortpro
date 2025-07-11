// EmailScanner.js - Version 11.0 - Compatibilité Gmail et détection améliorée

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
        
        console.log('[EmailScanner] ✅ Version 11.0 - Compatibilité Gmail et détection améliorée');
        this.initializeWithSync();
    }

    // ================================================
    // INITIALISATION AVEC SYNCHRONISATION
    // ================================================
    async initializeWithSync() {
        console.log('[EmailScanner] 🔧 Initialisation avec synchronisation...');
        
        // 1. Charger les paramètres
        await this.loadSettingsFromCategoryManager();
        
        // 2. S'enregistrer comme listener
        this.registerAsChangeListener();
        
        // 3. Démarrer la surveillance
        this.startRealTimeSync();
        
        // 4. Setup event listeners
        this.setupEventListeners();
        
        console.log('[EmailScanner] ✅ Initialisation terminée');
    }

    // ... [Garder toutes les méthodes existantes jusqu'à fetchEmailsFromMailService] ...

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
            startDate.setDate(endDate.getDate() - options.days);

            // Construire le filtre de date selon le provider
            const dateFilter = this.buildDateFilter(startDate, endDate, provider);

            // Options spécifiques pour Gmail
            const fetchOptions = {
                top: options.maxEmails,
                filter: dateFilter
            };

            // Pour Gmail, demander les headers supplémentaires
            if (provider === 'gmail') {
                fetchOptions.includeHeaders = true;
                fetchOptions.includeLabels = true;
                fetchOptions.includeCategories = true;
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

    // ... [Garder toutes les autres méthodes existantes] ...

    // ================================================
    // MÉTHODES DE DEBUG - AMÉLIORÉES
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
            version: '11.0'
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

    // ... [Garder toutes les autres méthodes existantes] ...
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.emailScanner) {
    console.log('[EmailScanner] 🔄 Nettoyage ancienne instance...');
    window.emailScanner.destroy?.();
}

console.log('[EmailScanner] 🚀 Création nouvelle instance v11.0...');
window.emailScanner = new EmailScanner();

// ================================================
// FONCTIONS UTILITAIRES GLOBALES - AMÉLIORÉES
// ================================================
window.testEmailScanner = function() {
    console.group('🧪 TEST EmailScanner v11.0');
    
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
    console.group('📊 DEBUG Catégories v11.0');
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

console.log('✅ EmailScanner v11.0 loaded - Compatibilité Gmail et détection améliorée!');
