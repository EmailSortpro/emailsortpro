// CategoryManager.js - Version 18.0 - VERSION FINALE CORRIGÉE

class CategoryManager {
    constructor() {
        this.categories = {};
        this.isInitialized = false;
        this.debugMode = false;
        this.weightedKeywords = {};
        this.currentSettings = {};
        this.initializationComplete = false;
        
        // Initialiser immédiatement les catégories et mots-clés
        this.initializeCategories();
        this.initializeWeightedDetection();
        this.setDefaultSettings();
        
        // Différer la synchronisation avec les autres modules
        setTimeout(() => this.deferredInitialization(), 100);
        
        console.log('[CategoryManager] ✅ Version 18.0 - Version finale corrigée');
    }

    async deferredInitialization() {
        try {
            // Attendre que le DOM soit prêt
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Attendre un peu plus pour que les autres modules se chargent
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Charger les paramètres depuis CategoriesPage si disponible
            await this.loadSettingsFromCategoriesPage();
            
            // Configurer les listeners
            this.setupSettingsListener();
            
            this.initializationComplete = true;
            console.log('[CategoryManager] ✅ Initialisation différée terminée');
            
            // Notifier que CategoryManager est prêt
            window.dispatchEvent(new CustomEvent('categoryManagerReady', {
                detail: { manager: this }
            }));
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur lors de l\'initialisation:', error);
            this.initializationComplete = true; // Marquer comme terminé même en cas d'erreur
        }
    }

    async loadSettingsFromCategoriesPage() {
        try {
            // Attendre que CategoriesPage soit disponible
            let attempts = 0;
            const maxAttempts = 30; // 3 secondes max
            
            while (!window.categoriesPage?.initializationComplete && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (window.categoriesPage?.initializationComplete) {
                console.log('[CategoryManager] 🔗 CategoriesPage trouvé, chargement des paramètres...');
                
                // Charger les paramètres réels
                const settings = window.categoriesPage.loadSettings();
                
                this.currentSettings = {
                    excludeSpam: settings.preferences?.excludeSpam !== false,
                    detectCC: settings.preferences?.detectCC !== false,
                    activeCategories: settings.activeCategories || Object.keys(this.categories),
                    taskPreselectedCategories: settings.taskPreselectedCategories || ['tasks', 'commercial', 'finance', 'meetings']
                };
                
                console.log('[CategoryManager] ✅ Paramètres chargés depuis CategoriesPage:', this.currentSettings);
            } else {
                console.warn('[CategoryManager] ⚠️ CategoriesPage non disponible, utilisation des paramètres par défaut');
            }
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement paramètres:', error);
        }
    }
    
    setDefaultSettings() {
        this.currentSettings = {
            excludeSpam: true,
            detectCC: true,
            activeCategories: Object.keys(this.categories),
            taskPreselectedCategories: ['tasks', 'commercial', 'finance', 'meetings']
        };
        console.log('[CategoryManager] 🔧 Paramètres par défaut définis');
    }

    // Méthodes pour recevoir les notifications des autres modules
    setSpamExclusion(enabled) {
        this.currentSettings.excludeSpam = enabled;
        console.log(`[CategoryManager] 📧 Exclusion spam ${enabled ? 'activée' : 'désactivée'}`);
    }

    setCCDetection(enabled) {
        this.currentSettings.detectCC = enabled;
        console.log(`[CategoryManager] 📋 Détection CC ${enabled ? 'activée' : 'désactivée'}`);
    }

    setActiveCategories(activeCategories) {
        this.currentSettings.activeCategories = activeCategories || Object.keys(this.categories);
        console.log('[CategoryManager] 🏷️ Catégories actives mises à jour:', this.currentSettings.activeCategories);
    }
    
    setTaskPreselectedCategories(preselectedCategories) {
        this.currentSettings.taskPreselectedCategories = preselectedCategories || [];
        console.log('[CategoryManager] ✅ Catégories pré-sélectionnées mises à jour:', this.currentSettings.taskPreselectedCategories);
    }

    updateSettings(settings) {
        if (settings.excludeSpam !== undefined) this.setSpamExclusion(settings.excludeSpam);
        if (settings.detectCC !== undefined) this.setCCDetection(settings.detectCC);
        if (settings.activeCategories !== undefined) this.setActiveCategories(settings.activeCategories);
        if (settings.taskPreselectedCategories !== undefined) this.setTaskPreselectedCategories(settings.taskPreselectedCategories);
        console.log('[CategoryManager] 🔄 Paramètres mis à jour:', this.currentSettings);
    }

    // Méthodes publiques pour accéder aux paramètres
    getTaskPreselectedCategories() {
        return this.currentSettings.taskPreselectedCategories || [];
    }
    
    getActiveCategories() {
        return this.currentSettings.activeCategories || Object.keys(this.categories);
    }
    
    shouldExcludeSpam() {
        return this.currentSettings.excludeSpam !== false;
    }
    
    shouldDetectCC() {
        return this.currentSettings.detectCC !== false;
    }

    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS (détecté en premier)
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100
            },
            
            // CATÉGORIE CC - PRIORITÉ ÉLEVÉE POUR INTERCEPTION
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90
            },
            
            // CATÉGORIES NORMALES - MÊME PRIORITÉ
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité et authentification',
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
                description: 'Tâches à faire et demandes d\'action',
                priority: 50
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis et contrats',
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
        
        this.isInitialized = true;
        console.log('[CategoryManager] ✅ Catégories initialisées:', Object.keys(this.categories));
    }

    initializeWeightedDetection() {
        this.weightedKeywords = {
            // SÉCURITÉ - PATTERNS STRICTS
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'code de vérification', 'verification code', 'security code',
                    'password reset', 'réinitialisation mot de passe',
                    'two-factor', '2fa', 'authentification',
                    'activité suspecte', 'suspicious activity'
                ],
                strong: ['sécurité', 'security', 'vérification', 'verify', 'password'],
                weak: ['compte', 'account', 'accès'],
                exclusions: ['newsletter', 'unsubscribe', 'promotion']
            },
            
            // RÉUNIONS - PATTERNS STRICTS
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'conference call', 'rendez-vous', 'rdv'
                ],
                strong: ['meeting', 'réunion', 'schedule', 'calendar'],
                weak: ['présentation', 'agenda'],
                exclusions: ['newsletter', 'promotion']
            },
            
            // TÂCHES - PATTERNS STRICTS
            tasks: {
                absolute: [
                    'action required', 'action requise', 'urgent',
                    'please complete', 'veuillez compléter', 'deadline',
                    'à faire', 'to do', 'task assigned',
                    'demande d\'action', 'response needed'
                ],
                strong: ['urgent', 'priority', 'action', 'deadline', 'échéance'],
                weak: ['demande', 'besoin', 'attente'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'sale']
            },
            
            // RELANCES - PATTERNS STRICTS
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'following up',
                    'comme convenu', 'suite à notre'
                ],
                strong: ['reminder', 'rappel', 'follow', 'relance'],
                weak: ['suite', 'convenu'],
                exclusions: ['newsletter', 'marketing']
            },
            
            // COMMERCIAL - PATTERNS STRICTS
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'contrat',
                    'business proposal', 'opportunité commerciale',
                    'nouveau client', 'signature contrat'
                ],
                strong: ['client', 'prospect', 'commercial', 'business'],
                weak: ['offre', 'négociation'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            
            // FINANCE - PATTERNS STRICTS
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'relevé bancaire', 'impôts',
                    'déclaration fiscale', 'comptabilité'
                ],
                strong: ['montant', 'facture', 'fiscal', 'payment'],
                weak: ['euro', 'dollar', 'prix'],
                exclusions: ['newsletter', 'marketing']
            },
            
            // PROJETS
            project: {
                absolute: [
                    'projet', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'kickoff'
                ],
                strong: ['projet', 'project', 'milestone', 'agile'],
                weak: ['development', 'phase'],
                exclusions: ['newsletter']
            },
            
            // RH
            hr: {
                absolute: [
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'entretien annuel'
                ],
                strong: ['rh', 'hr', 'salaire', 'ressources humaines'],
                weak: ['employee', 'staff'],
                exclusions: ['newsletter']
            },
            
            // SUPPORT
            support: {
                absolute: [
                    'ticket #', 'support ticket', 'help desk',
                    'problème résolu', 'issue resolved'
                ],
                strong: ['support', 'assistance', 'ticket'],
                weak: ['help', 'aide'],
                exclusions: ['newsletter']
            },
            
            // INTERNE
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'communication interne'
                ],
                strong: ['internal', 'interne', 'company wide'],
                weak: ['annonce', 'personnel'],
                exclusions: ['newsletter', 'external']
            },
            
            // NOTIFICATIONS
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique'
                ],
                strong: ['automated', 'automatic', 'notification'],
                weak: ['notification', 'alert'],
                exclusions: ['marketing', 'promotion']
            },
            
            // MARKETING & NEWS - PRIORITÉ MAXIMALE
            marketing_news: {
                absolute: [
                    // DÉSINSCRIPTION
                    'se désinscrire', 'unsubscribe', 'opt out',
                    'gérer vos préférences', 'email preferences',
                    'ne plus recevoir', 'stop emails',
                    
                    // NEWSLETTERS
                    'newsletter', 'mailing list',
                    'this email was sent to', 'vous recevez cet email',
                    
                    // MARKETING
                    'marketing', 'promotion', 'special offer',
                    'limited offer', 'shop now', 'discount',
                    'flash sale', 'exclusive offer',
                    
                    // E-COMMERCE
                    'buy now', 'add to cart', 'new collection',
                    
                    // RÉSEAUX SOCIAUX
                    'follow us', 'suivez-nous', 'on instagram'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'exclusive', 'special', 'limited', 'shop'
                ],
                weak: ['update', 'discover', 'new'],
                exclusions: [
                    'facture urgente', 'paiement requis',
                    'security alert critical', 'action required immediately'
                ]
            },

            // CATÉGORIE CC
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'courtesy copy'
                ],
                strong: ['information', 'copie'],
                weak: ['fyi', 'info'],
                exclusions: []
            }
        };
        
        console.log('[CategoryManager] ✅ Mots-clés initialisés pour', Object.keys(this.weightedKeywords).length, 'catégories');
    }

    // ANALYSE PRINCIPALE
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Filtrer les courriers indésirables si activé
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email);
        
        // Vérification CC si activée
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
        
        for (const [categoryId, keywords] of Object.entries(this.weightedKeywords)) {
            const score = this.calculateScore(content, keywords);
            
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

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords);
    }

    calculateScore(content, keywords) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Vérifier les exclusions
        if (keywords.exclusions) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    totalScore -= 50;
                }
            }
        }
        
        // Mots absolus (100 points)
        if (keywords.absolute) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Bonus si dans le sujet
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 50;
                    }
                }
            }
        }
        
        // Mots forts (30 points)
        if (keywords.strong && matches.length < 5) {
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 30;
                    matches.push({ keyword, type: 'strong', score: 30 });
                }
            }
        }
        
        // Mots faibles (10 points) - seulement si pas de mots absolus
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

    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        // Filtrer selon les catégories actives
        let filteredResults = Object.values(results);
        
        const activeCategories = this.getActiveCategories();
        if (activeCategories?.length > 0) {
            filteredResults = filteredResults.filter(r => 
                activeCategories.includes(r.category) ||
                r.category === 'marketing_news' ||
                r.category === 'cc'
            );
        }
        
        // Trier par priorité puis par score
        const sortedResults = filteredResults
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return b.score - a.score;
            });
        
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

    // DÉTECTION SPAM
    isSpamEmail(email) {
        if (email.parentFolderId) {
            const folderInfo = email.parentFolderId.toLowerCase();
            if (folderInfo.includes('junk') || folderInfo.includes('spam')) {
                return true;
            }
        }
        
        if (email.categories?.some(cat => 
            cat.toLowerCase().includes('spam') || cat.toLowerCase().includes('junk'))) {
            return true;
        }
        
        return false;
    }

    // DÉTECTION CC
    isInCC(email) {
        if (!email.ccRecipients?.length) return false;
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) return email.ccRecipients.length > 0;
        
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
            // Ignore
        }
        return null;
    }

    // EXTRACTION CONTENU
    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        if (email.subject) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(3);
        }
        
        if (email.from?.emailAddress?.address) {
            allText += email.from.emailAddress.address + ' ';
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
            length: allText.length
        };
    }

    cleanHtml(html) {
        if (!html) return '';
        return html
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractDomain(email) {
        if (!email?.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedText = text.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a');
        
        const normalizedKeyword = keyword.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a');
        
        return normalizedText.includes(normalizedKeyword);
    }

    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 100) return 0.80;
        if (score.total >= 60) return 0.70;
        if (score.total >= 30) return 0.60;
        return 0.50;
    }

    // MÉTHODES PUBLIQUES
    getCategories() { return this.categories; }
    
    getCategory(categoryId) {
        if (categoryId === 'all') return { id: 'all', name: 'Tous', icon: '📧', color: '#1e293b' };
        if (categoryId === 'other') return { id: 'other', name: 'Non classé', icon: '❓', color: '#64748b' };
        if (categoryId === 'spam') return { id: 'spam', name: 'Spam', icon: '🚫', color: '#dc2626' };
        return this.categories[categoryId] || null;
    }
    
    getCategoryStats() {
        const stats = {
            totalCategories: Object.keys(this.categories).length,
            totalKeywords: 0
        };
        
        for (const keywords of Object.values(this.weightedKeywords)) {
            if (keywords.absolute) stats.totalKeywords += keywords.absolute.length;
            if (keywords.strong) stats.totalKeywords += keywords.strong.length;
            if (keywords.weak) stats.totalKeywords += keywords.weak.length;
        }
        
        return stats;
    }
    
    setDebugMode(enabled) { this.debugMode = enabled; }
    
    setCurrentUserEmail(email) {
        if (email) {
            localStorage.setItem('currentUserInfo', JSON.stringify({ email }));
        }
    }

    // LISTENER POUR CHANGEMENTS
    setupSettingsListener() {
        window.addEventListener('settingsChanged', (event) => {
            const { type, value } = event.detail;
            console.log(`[CategoryManager] 📢 Reçu changement: ${type}`, value);
            
            switch (type) {
                case 'preferences':
                    this.updateSettings(value);
                    break;
                case 'activeCategories':
                    this.setActiveCategories(value);
                    break;
                case 'taskPreselectedCategories':
                    this.setTaskPreselectedCategories(value);
                    break;
            }
        });
        
        window.addEventListener('categoriesPageReady', async () => {
            console.log('[CategoryManager] 🔗 CategoriesPage prêt, synchronisation...');
            await this.loadSettingsFromCategoriesPage();
        });
        
        console.log('[CategoryManager] ✅ Listeners configurés');
    }

    // MÉTHODE DE TEST
    testEmail(subject, expectedCategory = null) {
        const testEmail = {
            subject: subject,
            body: { content: 'Test content' },
            from: { emailAddress: { address: 'test@example.com' } },
            toRecipients: [{ emailAddress: { address: 'user@example.com' } }]
        };
        
        const result = this.analyzeEmail(testEmail);
        
        console.log('\n[CategoryManager] TEST RESULT:');
        console.log(`Subject: "${subject}"`);
        console.log(`Category: ${result.category} (expected: ${expectedCategory || 'any'})`);
        console.log(`Score: ${result.score}pts`);
        console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
        
        return result;
    }
}

// Créer l'instance globale avec gestion d'erreur
try {
    window.categoryManager = new CategoryManager();
    console.log('✅ CategoryManager v18.0 chargé - Version finale corrigée');
} catch (error) {
    console.error('❌ Erreur lors du chargement de CategoryManager:', error);
    
    // Fallback minimal
    window.categoryManager = {
        getCategories: () => ({}),
        getCategory: () => null,
        analyzeEmail: () => ({ category: 'other', score: 0, confidence: 0 }),
        getTaskPreselectedCategories: () => [],
        shouldExcludeSpam: () => true,
        shouldDetectCC: () => true,
        setDebugMode: () => {},
        initializationComplete: false
    };
}
