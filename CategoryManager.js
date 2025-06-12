// CategoryManager.js - Version 18.1 - Simplifié et corrigé

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        this.isInitialized = false;
        this.debugMode = false;
        
        this.init();
        console.log('[CategoryManager] ✅ Version 18.1 - Réécriture complète avec synchronisation parfaite - CORRIGÉE');
    }

    async init() {
        try {
            // 1. Initialiser les catégories
            this.initializeCategories();
            
            // 2. Charger les paramètres
            await this.loadSettings();
            
            // 3. Charger les catégories personnalisées
            this.loadCustomCategories();
            
            // 4. Initialiser la détection par mots-clés
            this.initializeWeightedDetection();
            
            // 5. Marquer comme initialisé
            this.isInitialized = true;
            
            console.log('[CategoryManager] 🎯 Initialisation complète terminée');
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur d\'initialisation:', error);
            this.isInitialized = true; // Continuer même en cas d'erreur
        }
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    async loadSettings() {
        console.log('[CategoryManager] 📚 Chargement des paramètres...');
        
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                this.settings = { ...this.getDefaultSettings(), ...JSON.parse(saved) };
                console.log('[CategoryManager] ✅ Paramètres chargés depuis localStorage');
            } else {
                this.settings = this.getDefaultSettings();
                console.log('[CategoryManager] 📝 Paramètres par défaut utilisés');
                await this.saveSettings();
            }
            
            return this.settings;
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement paramètres:', error);
            this.settings = this.getDefaultSettings();
            return this.settings;
        }
    }

    async saveSettings(newSettings = null) {
        try {
            if (newSettings) {
                this.settings = { ...this.settings, ...newSettings };
            }
            
            // Valider les paramètres
            this.validateSettings();
            
            // Sauvegarder
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            console.log('[CategoryManager] 💾 Paramètres sauvegardés');
            
            // Notifier les changements
            setTimeout(() => {
                this.dispatchEvent('categorySettingsChanged', {
                    settings: { ...this.settings },
                    timestamp: Date.now(),
                    source: 'CategoryManager'
                });
            }, 10);
            
            return this.settings;
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde:', error);
            return null;
        }
    }

    validateSettings() {
        if (!this.settings.taskPreselectedCategories) {
            this.settings.taskPreselectedCategories = [];
        }
        
        if (!Array.isArray(this.settings.taskPreselectedCategories)) {
            this.settings.taskPreselectedCategories = [];
        }
        
        if (!this.settings.scanSettings) {
            this.settings.scanSettings = this.getDefaultSettings().scanSettings;
        }
        
        if (!this.settings.preferences) {
            this.settings.preferences = this.getDefaultSettings().preferences;
        }
        
        if (!this.settings.automationSettings) {
            this.settings.automationSettings = this.getDefaultSettings().automationSettings;
        }
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

    // ================================================
    // MÉTHODES PUBLIQUES SIMPLIFIÉES
    // ================================================
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    async updateSettings(newSettings) {
        console.log('[CategoryManager] 🔄 Mise à jour des paramètres:', newSettings);
        
        const timestampedSettings = {
            ...newSettings,
            _lastModified: Date.now()
        };
        
        return await this.saveSettings(timestampedSettings);
    }

    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }

    async updateTaskPreselectedCategories(categories) {
        console.log('[CategoryManager] 📋 Mise à jour catégories pré-sélectionnées:', categories);
        
        const validCategories = Array.isArray(categories) ? categories : [];
        
        await this.updateSettings({
            taskPreselectedCategories: validCategories
        });
        
        return validCategories;
    }

    getScanSettings() {
        return { ...this.settings.scanSettings };
    }

    async updateScanSettings(scanSettings) {
        console.log('[CategoryManager] 🔍 Mise à jour paramètres de scan:', scanSettings);
        
        await this.updateSettings({
            scanSettings: { ...this.settings.scanSettings, ...scanSettings }
        });
    }

    async updateScanSetting(key, value) {
        console.log(`[CategoryManager] 🔍 Mise à jour paramètre de scan: ${key} = ${value}`);
        
        const newScanSettings = { ...this.settings.scanSettings };
        newScanSettings[key] = value;
        
        await this.updateScanSettings(newScanSettings);
    }

    getAutomationSettings() {
        return { ...this.settings.automationSettings };
    }

    async updateAutomationSettings(automationSettings) {
        console.log('[CategoryManager] 🤖 Mise à jour paramètres d\'automatisation:', automationSettings);
        
        await this.updateSettings({
            automationSettings: { ...this.settings.automationSettings, ...automationSettings }
        });
    }

    getPreferences() {
        return { ...this.settings.preferences };
    }

    async updatePreferences(preferences) {
        console.log('[CategoryManager] ⚙️ Mise à jour préférences:', preferences);
        
        await this.updateSettings({
            preferences: { ...this.settings.preferences, ...preferences }
        });
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100
            },
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90
            },
            
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité, connexions',
                priority: 50
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                priority: 50
            },
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire',
                priority: 50
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis',
                priority: 50
            },
            
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                priority: 50
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                priority: 50
            },
            
            reminders: {
                name: 'Relances',
                icon: '🔄',
                color: '#10b981',
                description: 'Rappels et suivis',
                priority: 50
            },
            
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion de projet',
                priority: 50
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                priority: 50
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                priority: 50
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques',
                priority: 50
            }
        };
        
        console.log('[CategoryManager] 🏷️ Catégories initialisées:', Object.keys(this.categories));
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
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
            });
            
            console.log('[CategoryManager] 🎨 Catégories personnalisées chargées:', Object.keys(this.customCategories));
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    saveCustomCategories() {
        try {
            localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
            console.log('[CategoryManager] 💾 Catégories personnalisées sauvegardées');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde catégories personnalisées:', error);
        }
    }

    // ================================================
    // SYSTÈME DE DÉTECTION PAR MOTS-CLÉS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'promotion', 'promo', 'soldes', 'vente privée'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount',
                    'newsletter', 'mailing', 'campaign', 'marketing'
                ],
                weak: ['update', 'discover', 'new', 'choix'],
                exclusions: []
            },
            
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'quelqu\'un s\'est connecté', 'connexion à votre compte',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'code de vérification', 'verification code', 'security code',
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
                    'urgence', 'urgent', 'très urgent',
                    'merci de faire', 'pouvez-vous faire', 'pourriez-vous faire'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire'
                ],
                weak: ['demande', 'besoin', 'attente'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment'
                ],
                weak: ['présentation', 'agenda'],
                exclusions: ['newsletter', 'promotion']
            },
            
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business'
                ],
                weak: ['offre', 'négociation'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement',
                    'relevé bancaire', 'bank statement',
                    'impôts', 'taxes', 'fiscal'
                ],
                strong: [
                    'montant', 'amount', 'total', 'facture',
                    'fiscal', 'bancaire', 'bank', 'finance'
                ],
                weak: ['euro', 'dollar', 'prix'],
                exclusions: ['newsletter', 'marketing']
            },
            
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'je reviens vers vous', 'circling back'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu'
                ],
                weak: ['previous', 'discussed'],
                exclusions: ['newsletter', 'marketing']
            },
            
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'support ticket', 'ticket de support'
                ],
                strong: [
                    'support', 'assistance', 'help desk',
                    'technical support', 'ticket'
                ],
                weak: ['help', 'aide', 'issue'],
                exclusions: ['newsletter', 'marketing']
            },
            
            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum'
                ],
                weak: ['development', 'phase'],
                exclusions: ['newsletter', 'marketing']
            },
            
            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'onboarding'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary',
                    'ressources humaines', 'human resources'
                ],
                weak: ['employee', 'staff'],
                exclusions: ['newsletter', 'marketing']
            },
            
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'memo interne'
                ],
                strong: [
                    'internal', 'interne', 'company wide',
                    'personnel', 'staff'
                ],
                weak: ['annonce', 'announcement'],
                exclusions: ['newsletter', 'marketing', 'external']
            },
            
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique'
                ],
                strong: [
                    'automated', 'automatic', 'system',
                    'notification', 'automatique'
                ],
                weak: ['notification', 'alert'],
                exclusions: ['newsletter', 'marketing']
            },
            
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:'
                ],
                strong: ['information', 'copie', 'copy'],
                weak: ['fyi', 'info'],
                exclusions: []
            }
        };
        
        console.log('[CategoryManager] 🔍 Détection par mots-clés initialisée');
    }

    // ================================================
    // ANALYSE PRINCIPALE D'EMAIL
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Filtrer les courriers indésirables si activé
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email);
        
        // Vérification CC en priorité si activé
        if (this.shouldDetectCC() && this.isInCC(email)) {
            // Vérifier si ce n'est pas du marketing malgré le CC
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
            
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'email_in_cc', type: 'detected', score: 100 }],
                hasAbsolute: true,
                isCC: true
            };
        }
        
        // Analyse normale
        const allResults = this.analyzeAllCategories(content);
        return this.selectByPriorityWithThreshold(allResults);
    }

    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        for (const [categoryId, keywords] of Object.entries(this.weightedKeywords)) {
            if (!activeCategories.includes(categoryId) && 
                categoryId !== 'marketing_news' && 
                categoryId !== 'cc') {
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
        
        return results;
    }

    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return b.score - a.score;
            });
        
        if (this.debugMode) {
            console.log('[CategoryManager] Scores par catégorie:');
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
        
        return {
            category: 'other',
            score: 0,
            confidence: 0,
            matchedPatterns: [],
            hasAbsolute: false
        };
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    getCategories() {
        return { ...this.categories };
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
        return this.categories[categoryId] || null;
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return this.settings.activeCategories;
    }

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    // ================================================
    // MÉTHODES DE DÉTECTION
    // ================================================
    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        if (email.subject) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(5);
        }
        
        if (email.from?.emailAddress?.address) {
            allText += email.from.emailAddress.address + ' ';
        }
        if (email.from?.emailAddress?.name) {
            allText += email.from.emailAddress.name + ' ';
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
            allText += this.cleanHtml(email.body.content) + ' ';
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length
        };
    }

    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        if (keywords.exclusions) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    if (categoryId === 'marketing_news') {
                        totalScore -= 20;
                    } else {
                        totalScore -= 100;
                    }
                }
            }
        }
        
        if (keywords.absolute) {
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
        
        if (keywords.strong && matches.length < 5) {
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 30;
                    matches.push({ keyword, type: 'strong', score: 30 });
                }
            }
        }
        
        if (keywords.weak && !hasAbsolute) {
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 10;
                    matches.push({ keyword, type: 'weak', score: 10 });
                }
            }
        }
        
        return { total: Math.max(0, totalScore), hasAbsolute, matches };
    }

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
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
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/'/g, '\'')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ');
        
        const normalizedKeyword = keyword.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/'/g, '\'')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ');
        
        return normalizedText.includes(normalizedKeyword);
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
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients)) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) {
            return email.ccRecipients.length > 0;
        }
        
        return email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
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
    // ÉVÉNEMENTS ET UTILITAIRES
    // ================================================
    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (error) {
            console.error(`[CategoryManager] Erreur dispatch ${eventName}:`, error);
        }
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    destroy() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        console.log('[CategoryManager] Instance détruite');
    }
}

// Créer l'instance globale avec nettoyage préalable
if (window.categoryManager) {
    window.categoryManager.destroy?.();
}

window.categoryManager = new CategoryManager();

console.log('✅ CategoryManager v18.1 loaded - Réécriture complète avec synchronisation parfaite - CORRIGÉE');
