// CategoryManager.js - VERSION CORRIGÉE v16.3
// Retour à la version stable avec corrections minimales

class CategoryManager {
    constructor() {
        this.categories = {};
        this.isInitialized = false;
        this.debugMode = false;
        this.weightedKeywords = {};
        this.currentSettings = {
            excludeSpam: true,
            detectCC: true,
            activeCategories: null
        };
        
        console.log('[CategoryManager] ✅ Version 16.3 - Version corrigée et stable');
        
        this.initializeCategories();
        this.initializeWeightedDetection();
        
        // Essayer de charger les paramètres depuis CategoriesPage
        setTimeout(() => {
            this.loadSettingsFromCategoriesPage();
        }, 100);
    }

    // ================================================
    // MÉTHODES DE MISE À JOUR (COMPATIBILITÉ)
    // ================================================
    
    loadSettingsFromCategoriesPage() {
        try {
            if (window.categoriesPage) {
                this.currentSettings = {
                    excludeSpam: window.categoriesPage.shouldExcludeSpam(),
                    detectCC: window.categoriesPage.shouldDetectCC(),
                    activeCategories: window.categoriesPage.loadSettings().activeCategories
                };
                console.log('[CategoryManager] Paramètres chargés depuis CategoriesPage:', this.currentSettings);
            }
        } catch (error) {
            console.warn('[CategoryManager] Impossible de charger depuis CategoriesPage:', error);
        }
    }
    
    updateSettings(settings) {
        if (settings.excludeSpam !== undefined) {
            this.currentSettings.excludeSpam = settings.excludeSpam;
        }
        if (settings.detectCC !== undefined) {
            this.currentSettings.detectCC = settings.detectCC;
        }
        if (settings.activeCategories !== undefined) {
            this.currentSettings.activeCategories = settings.activeCategories;
        }
        
        console.log('[CategoryManager] Paramètres mis à jour:', this.currentSettings);
    }
    
    setSpamExclusion(enabled) {
        this.currentSettings.excludeSpam = enabled;
        console.log(`[CategoryManager] Spam exclusion ${enabled ? 'enabled' : 'disabled'}`);
    }

    setCCDetection(enabled) {
        this.currentSettings.detectCC = enabled;
        console.log(`[CategoryManager] CC detection ${enabled ? 'enabled' : 'disabled'}`);
    }

    setActiveCategories(activeCategories) {
        this.currentSettings.activeCategories = activeCategories;
        console.log('[CategoryManager] Active categories updated:', activeCategories);
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES (INCHANGÉ)
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
                description: 'Alertes de sécurité, connexions et authentification',
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
    }

    // ================================================
    // SYSTÈME DE DÉTECTION (INCHANGÉ)
    // ================================================
    
    initializeWeightedDetection() {
        this.weightedKeywords = {
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'quelqu\'un s\'est connecté', 'connexion à votre compte',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'accès à votre compte', 'account accessed',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'code d\'accès unique', 'one-time password', 'otp',
                    'password reset', 'réinitialisation mot de passe',
                    'reset your password', 'changer votre mot de passe'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe'
                ],
                weak: ['compte', 'account', 'accès'],
                exclusions: ['newsletter', 'unsubscribe', 'promotion', 'sale', 'offre']
            },
            
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'book a meeting', 'réserver une réunion',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'conference call', 'rendez-vous', 'rdv',
                    'demande présentation', 'présentation prévue'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment'
                ],
                weak: ['présentation', 'agenda'],
                exclusions: ['newsletter', 'unsubscribe', 'promotion']
            },
            
            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable',
                    'urgence', 'urgent', 'très urgent',
                    'demande explication', 'explication requise',
                    'merci de faire', 'pouvez-vous faire', 'pourriez-vous faire',
                    'action à mener', 'à faire', 'à traiter',
                    'demande d\'action', 'nécessite votre action',
                    'en attente de', 'waiting for your action',
                    'répondre avant', 'reply by', 'response needed',
                    'confirmation requise', 'approval needed'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'deadline', 'échéance', 'avant le'
                ],
                weak: ['demande', 'besoin', 'attente'],
                exclusions: [
                    'discount', 'promo', 'sale', 'offer', 'offre',
                    'newsletter', 'unsubscribe', 'marketing',
                    'shop now', 'buy now', 'limited time',
                    'exclusive', 'special offer', 'just for you',
                    'découvrez', 'new arrivals', 'collection'
                ]
            },
            
            reminders: {
                absolute: [
                    'reminder:', 'rappel:', 'follow up', 'relance',
                    'gentle reminder', 'rappel amical', 'following up',
                    'quick reminder', 'petit rappel', 'friendly reminder',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'suite à notre', 'faisant suite'
                ],
                strong: [
                    'reminder', 'rappel', 'follow', 'relance',
                    'suite', 'convenu'
                ],
                weak: ['previous', 'discussed'],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale',
                    'proposition commerciale', 'business proposal',
                    'opportunité commerciale', 'commercial opportunity',
                    'nouveau client', 'new customer',
                    'signature contrat', 'contract signature'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal'
                ],
                weak: ['offre', 'négociation'],
                exclusions: ['newsletter', 'unsubscribe', 'marketing', 'promotion', 'sale']
            },
            
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration',
                    'impôts', 'taxes', 'fiscal',
                    'reçu fiscal', 'tax receipt',
                    'comptabilité', 'accounting',
                    'bilan', 'balance sheet',
                    'échéance de paiement', 'payment due',
                    'rappel de paiement', 'payment reminder'
                ],
                strong: [
                    'montant', 'amount', 'total', 'facture',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'paiement', 'payment'
                ],
                weak: ['euro', 'dollar', 'prix'],
                exclusions: ['newsletter', 'marketing', 'promotion', 'offre spéciale']
            },
            
            project: {
                absolute: [
                    'projet xx', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'kick off', 'lancement projet'
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
                    'congés', 'leave request', 'onboarding',
                    'entretien annuel', 'performance review',
                    'recrutement', 'recruitment', 'candidature'
                ],
                strong: [
                    'rh', 'hr', 'salaire', 'salary',
                    'ressources humaines', 'human resources'
                ],
                weak: ['employee', 'staff'],
                exclusions: ['newsletter', 'marketing']
            },
            
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved', 'ticket résolu',
                    'support ticket', 'ticket de support', 'help desk'
                ],
                strong: [
                    'support', 'assistance', 'help desk',
                    'technical support', 'ticket'
                ],
                weak: ['help', 'aide', 'issue'],
                exclusions: ['newsletter', 'marketing']
            },
            
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'annonce interne',
                    'company announcement', 'memo interne',
                    'communication interne', 'internal communication',
                    'note de service', 'bulletin interne'
                ],
                strong: [
                    'internal', 'interne', 'company wide',
                    'personnel', 'staff'
                ],
                weak: ['annonce', 'announcement'],
                exclusions: ['newsletter', 'unsubscribe', 'marketing', 'external']
            },
            
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique',
                    'system notification', 'notification système',
                    'ceci est un message automatique', 'this is an automated'
                ],
                strong: [
                    'automated', 'automatic', 'system',
                    'notification', 'automatique'
                ],
                weak: ['notification', 'alert'],
                exclusions: ['unsubscribe', 'newsletter', 'marketing', 'promotion', 'sale']
            },
            
            marketing_news: {
                absolute: [
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception',
                    'email preferences', 'préférences email',
                    'ne plus recevoir', 'stop emails',
                    'gérer vos abonnements', 'manage subscriptions',
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'cet email vous est envoyé', 'vous recevez cet email',
                    'marketing', 'campaign', 'campagne',
                    'limited offer', 'offre limitée', 'special offer',
                    'showroom', 'promotion', 'promo', 'soldes',
                    'vente privée', 'offre spéciale', 'réduction',
                    '% de réduction', '% off', 'promo code', 'code promo',
                    'flash sale', 'vente flash', 'black friday',
                    'discount', 'remise', 'prix réduit',
                    'exclusive offer', 'offre exclusive',
                    'limited time', 'temps limité',
                    'actualités', 'news update', 'weekly digest',
                    'monthly newsletter', 'hebdomadaire', 'mensuel',
                    'édition du', 'bulletin', 'flash info',
                    'shop now', 'acheter maintenant', 'buy now',
                    'add to cart', 'ajouter au panier',
                    'new collection', 'nouvelle collection',
                    'follow us', 'suivez-nous', 'like us',
                    'on instagram', 'on facebook',
                    'recently added to their stories'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'abonné', 'subscriber', 'désinscription',
                    'exclusive', 'special', 'limited', 'new',
                    'collection', 'shop', 'store'
                ],
                weak: ['update', 'discover', 'new'],
                exclusions: [
                    'facture urgente', 'paiement requis',
                    'code de vérification urgent', 'security alert critical',
                    'action required immediately'
                ]
            },

            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy',
                    'pour information', 'info copy'
                ],
                strong: [
                    'information', 'copie', 'copy'
                ],
                weak: ['fyi', 'info'],
                exclusions: []
            }
        };
    }

    // ================================================
    // ANALYSE AVEC PARAMÈTRES
    // ================================================
    
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Filtrer les courriers indésirables
        if (this.currentSettings.excludeSpam && this.isSpamEmail(email)) {
            if (this.debugMode) {
                console.log('[CategoryManager] Email spam détecté, ignoré:', email.subject);
            }
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email);
        
        // Vérification CC
        if (this.currentSettings.detectCC && this.isInCC(email)) {
            if (this.debugMode) {
                console.log('[CategoryManager] Email en CC détecté:', email.subject);
            }
            
            // Vérifier si ce n'est pas du marketing malgré le CC
            const marketingCheck = this.analyzeCategory(content, this.weightedKeywords.marketing_news);
            if (marketingCheck.score >= 80) {
                if (this.debugMode) {
                    console.log('[CategoryManager] Email CC mais marketing détecté:', email.subject);
                }
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
        
        // Vérification spéciale pour les emails personnels
        if (this.isPersonalEmail(email)) {
            const enhancedContent = {
                ...content,
                text: content.text + ' demande action personnelle interne'
            };
            
            const allResults = this.analyzeAllCategories(enhancedContent);
            
            if (allResults.tasks) {
                allResults.tasks.score += 50;
                allResults.tasks.confidence = Math.min(0.95, allResults.tasks.confidence + 0.2);
            }
            
            return this.selectByPriorityWithThreshold(allResults);
        }
        
        // Analyse normale
        const allResults = this.analyzeAllCategories(content);
        return this.selectByPriorityWithThreshold(allResults);
    }

    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        let filteredResults = Object.values(results);
        
        if (this.currentSettings.activeCategories && this.currentSettings.activeCategories.length > 0) {
            filteredResults = filteredResults.filter(r => 
                this.currentSettings.activeCategories.includes(r.category) ||
                r.category === 'marketing_news' ||
                r.category === 'cc'
            );
            
            if (this.debugMode) {
                console.log('[CategoryManager] Filtrage par catégories actives:', this.currentSettings.activeCategories);
            }
        }
        
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

    // ================================================
    // TOUTES LES AUTRES MÉTHODES RESTENT IDENTIQUES
    // ================================================
    
    isSpamEmail(email) {
        if (email.parentFolderId) {
            const folderInfo = email.parentFolderId.toLowerCase();
            if (folderInfo.includes('junk') || 
                folderInfo.includes('spam') || 
                folderInfo.includes('unwanted') ||
                folderInfo.includes('indésirable') ||
                folderInfo.includes('courrier indésirable')) {
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
        
        if (email.importance === 'low' && email.flag?.flagStatus === 'flagged') {
            return this.hasSuspiciousSpamPatterns(email);
        }
        
        if (email.subject) {
            const suspiciousSubjectPatterns = [
                /\[spam\]/i,
                /\*\*\*spam\*\*\*/i,
                /urgent.{0,20}action.{0,20}required.{0,20}immediately/i,
                /you.{0,10}have.{0,10}won/i,
                /congratulations.{0,20}winner/i,
                /free.{0,10}money/i,
                /click.{0,10}here.{0,10}now/i
            ];
            
            if (suspiciousSubjectPatterns.some(pattern => pattern.test(email.subject))) {
                return true;
            }
        }
        
        return false;
    }

    hasSuspiciousSpamPatterns(email) {
        const content = this.extractCompleteContent(email);
        const spamPatterns = [
            'click here now', 'act now', 'urgent action required',
            'you have won', 'congratulations winner', 'free money',
            'limited time offer expires', 'this is not spam',
            'remove from list', 'unsubscribe here'
        ];
        
        let spamScore = 0;
        spamPatterns.forEach(pattern => {
            if (this.findInText(content.text, pattern)) {
                spamScore += 1;
            }
        });
        
        return spamScore >= 2;
    }

    isInCC(email) {
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients)) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        if (!currentUserEmail) {
            return email.ccRecipients.length > 0;
        }
        
        const isInCCList = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        if (this.debugMode && isInCCList) {
            console.log('[CategoryManager] Utilisateur trouvé en CC:', email.subject);
        }
        
        return isInCCList;
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
        
        try {
            const emailHistory = localStorage.getItem('recentEmails');
            if (emailHistory) {
                const emails = JSON.parse(emailHistory);
                const toAddresses = emails.flatMap(email => 
                    (email.toRecipients || []).map(r => r.emailAddress?.address)
                ).filter(Boolean);
                
                const addressCounts = {};
                toAddresses.forEach(addr => {
                    addressCounts[addr] = (addressCounts[addr] || 0) + 1;
                });
                
                const mostFrequent = Object.entries(addressCounts)
                    .sort(([,a], [,b]) => b - a)[0];
                
                if (mostFrequent) {
                    return mostFrequent[0];
                }
            }
        } catch (e) {
            console.warn('[CategoryManager] Impossible de déduire l\'email utilisateur');
        }
        
        return null;
    }

    analyzeAllCategories(content) {
        const results = {};
        
        for (const [categoryId, keywords] of Object.entries(this.weightedKeywords)) {
            const score = this.calculateScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                hasAbsolute: score.hasAbsolute,
                matches: score.matches,
                confidence: this.calculateConfidence(score),
                priority: this.categories[categoryId].priority
            };
        }
        
        return results;
    }

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
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
        
        // Bonus de domaine
        if (categoryId === 'security' && 
            (content.domain.includes('microsoft') || 
             content.domain.includes('google') ||
             content.domain.includes('apple') ||
             content.domain.includes('security'))) {
            totalScore += 50;
            matches.push({ keyword: 'security_domain', type: 'domain', score: 50 });
        }
        
        if (categoryId === 'finance' && 
            (content.domain.includes('gouv.fr') || 
             content.domain.includes('impots') ||
             content.domain.includes('bank') ||
             content.domain.includes('paypal'))) {
            totalScore += 50;
            matches.push({ keyword: 'finance_domain', type: 'domain', score: 50 });
        }
        
        if (categoryId === 'marketing_news' && 
            (content.domain.includes('newsletter') ||
             content.domain.includes('mailchimp') ||
             content.domain.includes('campaign') ||
             content.domain.includes('marketing'))) {
            totalScore += 30;
            matches.push({ keyword: 'newsletter_domain', type: 'domain', score: 30 });
        }
        
        if (categoryId === 'notifications' && 
            (content.domain.includes('noreply') ||
             content.domain.includes('notification') ||
             content.domain.includes('donotreply'))) {
            totalScore += 40;
            matches.push({ keyword: 'notification_domain', type: 'domain', score: 40 });
        }
        
        return { total: Math.max(0, totalScore), hasAbsolute, matches };
    }

    isPersonalEmail(email) {
        if (!email.from?.emailAddress?.address) return false;
        
        const fromEmail = email.from.emailAddress.address.toLowerCase();
        const toEmails = (email.toRecipients || [])
            .map(r => r.emailAddress?.address?.toLowerCase())
            .filter(Boolean);
        
        return toEmails.includes(fromEmail);
    }

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
        
        if (normalizedText.includes(normalizedKeyword)) {
            return true;
        }
        
        if (!normalizedKeyword.includes(' ')) {
            const wordBoundaryPattern = `\\b${this.escapeRegex(normalizedKeyword)}\\b`;
            try {
                const regex = new RegExp(wordBoundaryPattern, 'i');
                if (regex.test(normalizedText)) {
                    return true;
                }
            } catch (e) {
                // Continuer si regex échoue
            }
        }
        
        if (normalizedKeyword.includes(' ')) {
            const flexiblePattern = normalizedKeyword
                .split(' ')
                .filter(word => word.length > 0)
                .map(word => this.escapeRegex(word))
                .join('\\s+');
            try {
                const regex = new RegExp(flexiblePattern, 'i');
                return regex.test(normalizedText);
            } catch (e) {
                return false;
            }
        }
        
        return false;
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

    // ================================================
    // API PUBLIQUE
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
        return this.categories[categoryId] || null;
    }
    
    getCategoryStats() {
        const stats = {
            totalCategories: Object.keys(this.categories).length,
            totalKeywords: 0,
            absoluteKeywords: 0,
            strongKeywords: 0,
            weakKeywords: 0
        };
        
        for (const keywords of Object.values(this.weightedKeywords)) {
            if (keywords.absolute) stats.absoluteKeywords += keywords.absolute.length;
            if (keywords.strong) stats.strongKeywords += keywords.strong.length;
            if (keywords.weak) stats.weakKeywords += keywords.weak.length;
        }
        
        stats.totalKeywords = stats.absoluteKeywords + stats.strongKeywords + stats.weakKeywords;
        return stats;
    }
    
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
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
        console.log(`Matches:`, result.matchedPatterns);
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`❌ FAILED - Expected ${expectedCategory}, got ${result.category}`);
        } else {
            console.log('✅ SUCCESS');
        }
        
        return result;
    }

    setCurrentUserEmail(email) {
        if (email) {
            localStorage.setItem('currentUserInfo', JSON.stringify({ email: email }));
            if (this.debugMode) {
                console.log('[CategoryManager] Email utilisateur défini:', email);
            }
        }
    }
}

// Créer l'instance globale
window.categoryManager = new CategoryManager();

console.log('✅ CategoryManager v16.3 CORRIGÉ loaded');
