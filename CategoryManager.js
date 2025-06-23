// CategoryManager.js - Version 22.0 - DÉTECTION PRIORITAIRE MARKETING/NEWSLETTER

class CategoryManager {
    constructor() {
        this.categories = {};
        this.keywordCatalog = {}; // UN SEUL CATALOGUE CENTRAL
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        
        // Système de synchronisation simplifié
        this.changeListeners = new Set();
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeKeywordCatalog(); // MÉTHODE UNIQUE
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('[CategoryManager] ✅ Version 22.0 - Détection prioritaire marketing/newsletter initialisée');
    }

    // ================================================
    // CATALOGUE DE MOTS-CLÉS - MARKETING EN PRIORITÉ ABSOLUE
    // ================================================
    initializeKeywordCatalog() {
        console.log('[CategoryManager] 🔍 Initialisation du catalogue avec priorité marketing...');
        
        this.keywordCatalog = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS - DÉTECTION EN PREMIER
            marketing_news: {
                absolute: [
                    // Mots-clés de désabonnement - PRIORITÉ ABSOLUE
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'paramétrez vos choix', 'parametrez vos choix',
                    'disable these notifications', 'turn off notifications',
                    'manage notifications', 'notification settings',
                    'email settings', 'communication preferences',
                    'update your preferences', 'modify your subscription',
                    'this email was sent to', 'you are receiving this',
                    'cet email vous a été envoyé', 'vous recevez cet email',
                    
                    // Newsletter explicites
                    'newsletter', 'mailing list', 'mailing', 'e-mailing',
                    'bulletin d\'information', 'lettre d\'information',
                    'our newsletter', 'notre newsletter', 'subscribe to',
                    
                    // Marketing explicite
                    'limited offer', 'offre limitée', 'special offer', 'offre spéciale',
                    'promotion', 'promo', 'soldes', 'vente privée', 'private sale',
                    'discount', 'réduction', 'remise', 'code promo',
                    'exclusive offer', 'offre exclusive', 'new arrivals', 'nouveautés',
                    'flash sale', 'vente flash', 'deal of the day',
                    'shop now', 'acheter maintenant', 'buy now',
                    'limited time', 'temps limité', 'expires soon', 'expire bientôt',
                    
                    // Retail et e-commerce
                    'your order', 'votre commande', 'order confirmation',
                    'confirmation de commande', 'tracking number', 'numéro de suivi',
                    'shipped', 'expédié', 'delivered', 'livré',
                    'cart reminder', 'rappel panier', 'abandoned cart',
                    'panier abandonné', 'complete your order',
                    
                    // Notifications commerciales
                    'product recommendation', 'recommandation produit',
                    'you might like', 'cela pourrait vous plaire',
                    'personalized for you', 'personnalisé pour vous',
                    'based on your purchase', 'selon vos achats'
                ],
                strong: [
                    // Marketing général
                    'marketing', 'publicity', 'publicité', 'advertising',
                    'campaign', 'campagne', 'promotion', 'promo',
                    'deal', 'offer', 'offre', 'sale', 'vente',
                    'discount', 'réduction', 'special', 'exclusive',
                    'limited', 'new', 'nouveau', 'latest', 'dernier',
                    
                    // E-commerce
                    'shop', 'boutique', 'store', 'magasin',
                    'shopping', 'acheter', 'buy', 'purchase',
                    'order', 'commander', 'cart', 'panier',
                    'checkout', 'payment', 'paiement',
                    
                    // Communication marketing
                    'newsletter', 'mailing', 'updates', 'news',
                    'alerts', 'notifications', 'subscribe', 'abonner',
                    'follow us', 'suivez-nous', 'social media',
                    'facebook', 'twitter', 'instagram', 'linkedin',
                    
                    // Retail
                    'brand', 'marque', 'collection', 'catalog',
                    'catalogue', 'lookbook', 'trend', 'tendance',
                    'fashion', 'mode', 'style', 'design'
                ],
                weak: [
                    'update', 'discover', 'découvrir', 'explore',
                    'learn more', 'en savoir plus', 'read more',
                    'download', 'télécharger', 'free', 'gratuit'
                ],
                exclusions: [
                    // Éviter les faux positifs
                    'task', 'tâche', 'meeting', 'réunion', 'urgent',
                    'action required', 'facture', 'invoice', 'payment due',
                    'security alert', 'alerte sécurité', 'password',
                    'verification', 'support ticket', 'help desk'
                ]
            },

            // NOTIFICATIONS SYSTÈME - Après marketing
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'noreply@',
                    'automated message', 'notification automatique',
                    'system notification', 'ceci est un message automatique',
                    'no-reply@', 'donotreply@', 'auto-reply',
                    'automatic reply', 'réponse automatique',
                    'system alert', 'alerte système'
                ],
                strong: [
                    'automated', 'automatic', 'automatique', 'system',
                    'notification', 'alert', 'alerte', 'reminder',
                    'rappel', 'update', 'mise à jour', 'status'
                ],
                weak: [
                    'info', 'information', 'notice', 'avis'
                ],
                exclusions: [
                    // Éviter les marketing déguisés
                    'newsletter', 'unsubscribe', 'promotion', 'offer',
                    'shop', 'buy', 'purchase', 'sale', 'deal',
                    'marketing', 'campaign', 'advertising'
                ]
            },

            // SÉCURITÉ
            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'password reset', 'réinitialisation mot de passe',
                    'compte compromis', 'account compromised',
                    'unusual activity', 'activité inhabituelle'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe',
                    'login', 'connexion', 'access', 'accès'
                ],
                weak: [
                    'compte', 'account', 'user', 'utilisateur'
                ],
                exclusions: [
                    'newsletter', 'unsubscribe', 'promotion', 'marketing',
                    'shop', 'buy', 'order', 'purchase'
                ]
            },

            // TÂCHES ET ACTIONS
            tasks: {
                absolute: [
                    'action required', 'action requise', 'action needed',
                    'please complete', 'veuillez compléter', 'to do',
                    'task assigned', 'tâche assignée', 'deadline',
                    'due date', 'échéance', 'livrable', 'deliverable',
                    'urgence', 'urgent', 'très urgent', 'priority',
                    'demande update', 'update request', 'mise à jour demandée',
                    'demande de mise à jour', 'update needed',
                    'correction requise', 'à corriger', 'please review',
                    'merci de valider', 'validation requise', 'approval needed',
                    'please confirm', 'veuillez confirmer'
                ],
                strong: [
                    'urgent', 'asap', 'priority', 'priorité',
                    'complete', 'compléter', 'action', 'faire',
                    'update', 'mise à jour', 'demande', 'request',
                    'task', 'tâche', 'todo', 'à faire',
                    'correction', 'corriger', 'modifier', 'révision',
                    'deadline', 'échéance', 'due', 'livrable'
                ],
                weak: [
                    'demande', 'besoin', 'attente', 'need', 'waiting'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe',
                    'shop', 'buy', 'order', 'sale'
                ]
            },

            // FINANCE
            finance: {
                absolute: [
                    'facture', 'invoice', 'payment', 'paiement',
                    'virement', 'transfer', 'remboursement', 'refund',
                    'relevé bancaire', 'bank statement',
                    'déclaration fiscale', 'tax declaration',
                    'payment due', 'échéance paiement',
                    'overdue', 'en retard', 'unpaid', 'impayé',
                    'credit card', 'carte de crédit',
                    'bank notification', 'notification bancaire'
                ],
                strong: [
                    'montant', 'amount', 'total', 'price', 'prix',
                    'fiscal', 'bancaire', 'bank', 'finance',
                    'euro', 'dollar', 'currency', 'devise',
                    'transaction', 'debit', 'credit', 'solde'
                ],
                weak: [
                    'money', 'argent', 'cost', 'coût', 'fee'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'shop',
                    'order confirmation', 'shipping', 'delivery'
                ]
            },

            // RÉUNIONS
            meetings: {
                absolute: [
                    'demande de réunion', 'meeting request', 'réunion',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    'teams meeting', 'zoom meeting', 'google meet',
                    'rendez-vous', 'appointment', 'rdv',
                    'calendar invitation', 'invitation calendrier'
                ],
                strong: [
                    'meeting', 'réunion', 'schedule', 'planifier',
                    'calendar', 'calendrier', 'appointment',
                    'agenda', 'conférence', 'conference', 'call',
                    'webinar', 'présentation'
                ],
                weak: [
                    'disponible', 'available', 'time', 'temps'
                ],
                exclusions: [
                    'newsletter', 'promotion', 'marketing', 'shop'
                ]
            },

            // COMMERCIAL
            commercial: {
                absolute: [
                    'devis', 'quotation', 'proposal', 'proposition',
                    'contrat', 'contract', 'bon de commande',
                    'purchase order', 'offre commerciale',
                    'opportunity', 'opportunité', 'lead',
                    'négociation', 'negotiation'
                ],
                strong: [
                    'client', 'customer', 'prospect', 'opportunity',
                    'commercial', 'business', 'marché', 'deal',
                    'vente', 'sales', 'négociation', 'contract'
                ],
                weak: [
                    'offre', 'discussion', 'projet', 'partnership'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe'
                ]
            },

            // SUPPORT
            support: {
                absolute: [
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'case #', 'case number', 'incident #',
                    'problème résolu', 'issue resolved',
                    'support ticket', 'demande de support',
                    'help desk', 'service client'
                ],
                strong: [
                    'support', 'assistance', 'help', 'aide',
                    'technical support', 'ticket', 'incident',
                    'problème', 'problem', 'issue', 'bug'
                ],
                weak: [
                    'question', 'help', 'assistance'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion'
                ]
            },

            // RELANCES
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
                weak: [
                    'previous', 'encore', 'still', 'toujours'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion'
                ]
            },

            // PROJETS
            project: {
                absolute: [
                    'projet', 'project update', 'milestone',
                    'sprint', 'livrable projet', 'gantt',
                    'avancement projet', 'project status',
                    'kickoff', 'retrospective', 'roadmap'
                ],
                strong: [
                    'projet', 'project', 'milestone', 'sprint',
                    'agile', 'scrum', 'kanban', 'jira',
                    'development', 'développement'
                ],
                weak: [
                    'phase', 'étape', 'planning'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion'
                ]
            },

            // RH
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
                weak: [
                    'employee', 'staff', 'personnel', 'équipe'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion'
                ]
            },

            // COMMUNICATION INTERNE
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
                weak: [
                    'information', 'update', 'news'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'external', 'client'
                ]
            },

            // EN COPIE
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'en copie', 'in copy', 'cc:', 'courtesy copy',
                    'pour info', 'pour information'
                ],
                strong: [
                    'information', 'copie', 'copy', 'cc', 'fyi'
                ],
                weak: [
                    'info'
                ],
                exclusions: [
                    'urgent', 'action required', 'payment'
                ]
            }
        };

        console.log('[CategoryManager] ✅ Catalogue initialisé avec priorité marketing pour', Object.keys(this.keywordCatalog).length, 'catégories');
    }

    // ================================================
    // ANALYSE EMAIL - MARKETING EN PRIORITÉ ABSOLUE
    // ================================================
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
        
        // PRIORITÉ 1: MARKETING/NEWSLETTER - TOUJOURS EN PREMIER
        const marketingAnalysis = this.analyzeCategory(content, this.keywordCatalog.marketing_news);
        
        // Si détection marketing forte, retourner immédiatement
        if (marketingAnalysis.hasAbsolute || marketingAnalysis.total >= 80) {
            console.log(`[CategoryManager] ✅ Marketing détecté: ${email.subject?.substring(0, 50)} (${marketingAnalysis.total}pts)`);
            return {
                category: 'marketing_news',
                score: marketingAnalysis.total,
                confidence: this.calculateConfidence(marketingAnalysis),
                matchedPatterns: marketingAnalysis.matches,
                hasAbsolute: marketingAnalysis.hasAbsolute,
                priorityDetection: 'marketing_first'
            };
        }
        
        // Vérifier si on est destinataire principal ou en CC
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        // Si on est en CC ET pas de marketing fort détecté
        if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
            // Analyser toutes les autres catégories sauf marketing
            const allResults = this.analyzeAllCategoriesExceptMarketing(content);
            const bestNonCC = Object.values(allResults)
                .filter(r => r.category !== 'cc')
                .sort((a, b) => b.score - a.score)[0];
            
            if (bestNonCC && bestNonCC.score >= 100 && bestNonCC.hasAbsolute) {
                return {
                    category: bestNonCC.category,
                    score: bestNonCC.score,
                    confidence: bestNonCC.confidence,
                    matchedPatterns: bestNonCC.matches,
                    hasAbsolute: bestNonCC.hasAbsolute,
                    isCC: true
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
        
        // Analyser toutes les catégories (sauf marketing déjà fait)
        const allResults = this.analyzeAllCategoriesExceptMarketing(content);
        
        // Ajouter le résultat marketing
        allResults.marketing_news = {
            category: 'marketing_news',
            score: marketingAnalysis.total,
            hasAbsolute: marketingAnalysis.hasAbsolute,
            matches: marketingAnalysis.matches,
            confidence: this.calculateConfidence(marketingAnalysis),
            priority: 100 // Priorité maximale
        };
        
        const selectedResult = this.selectByPriorityWithThreshold(allResults);
        
        if (!selectedResult || selectedResult.category === 'other' || selectedResult.score === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'no_category_matched'
            };
        }
        
        return selectedResult;
    }

    analyzeAllCategoriesExceptMarketing(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        const customCategoryIds = Object.keys(this.customCategories);
        
        // Analyser toutes les catégories SAUF marketing_news
        const allCategoriesToAnalyze = new Set([
            ...Object.keys(this.keywordCatalog).filter(cat => cat !== 'marketing_news'),
            ...customCategoryIds
        ]);
        
        for (const categoryId of allCategoriesToAnalyze) {
            const isActive = activeCategories.includes(categoryId);
            const isCustom = customCategoryIds.includes(categoryId);
            const isSpecial = ['cc'].includes(categoryId);
            
            if (!isActive && !isCustom && !isSpecial) {
                continue;
            }
            
            if (!this.categories[categoryId] && !this.customCategories[categoryId]) {
                continue;
            }
            
            let keywords = this.keywordCatalog[categoryId];
            
            if (isCustom && (!keywords || this.isEmptyKeywords(keywords))) {
                const customCat = this.customCategories[categoryId];
                if (customCat && customCat.keywords) {
                    keywords = customCat.keywords;
                }
            }
            
            if (!keywords || this.isEmptyKeywords(keywords)) {
                continue;
            }
            
            const score = this.calculateScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                hasAbsolute: score.hasAbsolute,
                matches: score.matches,
                confidence: this.calculateConfidence(score),
                priority: (this.categories[categoryId] || this.customCategories[categoryId])?.priority || 50,
                isCustom: isCustom
            };
        }
        
        return results;
    }

    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Pénalité pour contenu marketing dans autres catégories
        const marketingKeywords = [
            'newsletter', 'unsubscribe', 'promotion', 'marketing',
            'shop', 'buy', 'purchase', 'sale', 'deal', 'offer'
        ];
        
        let marketingContent = 0;
        marketingKeywords.forEach(keyword => {
            if (this.findInText(text, keyword)) {
                marketingContent += 20;
            }
        });
        
        // Si contenu marketing détecté et on n'est pas dans marketing_news
        if (marketingContent >= 40 && categoryId !== 'marketing_news') {
            totalScore -= marketingContent;
            matches.push({ 
                keyword: 'marketing_content_penalty', 
                type: 'penalty', 
                score: -marketingContent 
            });
        }
        
        // Bonus de base pour certaines catégories
        const categoryBonus = {
            'security': 15,
            'finance': 15,
            'tasks': 15,
            'meetings': 10,
            'support': 10,
            'hr': 10,
            'commercial': 10,
            'project': 5,
            'notifications': 5,
            'cc': 5
        };
        
        if (categoryBonus[categoryId]) {
            totalScore += categoryBonus[categoryId];
            matches.push({ 
                keyword: 'category_bonus', 
                type: 'bonus', 
                score: categoryBonus[categoryId] 
            });
        }
        
        // Test des exclusions en premier
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    const penalty = 50;
                    totalScore -= penalty;
                    matches.push({ 
                        keyword: exclusion, 
                        type: 'exclusion', 
                        score: -penalty 
                    });
                }
            }
        }
        
        // Test des mots-clés absolus
        if (keywords.absolute && keywords.absolute.length > 0) {
            for (const keyword of keywords.absolute) {
                if (this.findInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    // Bonus supplémentaire si dans le sujet
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 50;
                        matches.push({ 
                            keyword: keyword + ' (in subject)', 
                            type: 'bonus', 
                            score: 50 
                        });
                    }
                }
            }
        }
        
        // Test des mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            let strongMatches = 0;
            for (const keyword of keywords.strong) {
                if (this.findInText(text, keyword)) {
                    totalScore += 40;
                    strongMatches++;
                    matches.push({ keyword, type: 'strong', score: 40 });
                    
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 20;
                        matches.push({ 
                            keyword: keyword + ' (in subject)', 
                            type: 'bonus', 
                            score: 20 
                        });
                    }
                }
            }
            
            if (strongMatches >= 2) {
                totalScore += 30;
                matches.push({ 
                    keyword: 'multiple_strong_matches', 
                    type: 'bonus', 
                    score: 30 
                });
            }
        }
        
        // Test des mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            let weakMatches = 0;
            for (const keyword of keywords.weak) {
                if (this.findInText(text, keyword)) {
                    totalScore += 15;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: 15 });
                }
            }
            
            if (weakMatches >= 3) {
                totalScore += 20;
                matches.push({ 
                    keyword: 'multiple_weak_matches', 
                    type: 'bonus', 
                    score: 20 
                });
            }
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        // Priorité spéciale pour marketing
        const marketingResult = results.marketing_news;
        if (marketingResult && marketingResult.score >= 40) {
            console.log(`[CategoryManager] ✅ Marketing prioritaire: ${marketingResult.score}pts`);
            return {
                category: 'marketing_news',
                score: marketingResult.score,
                confidence: marketingResult.confidence,
                matchedPatterns: marketingResult.matches,
                hasAbsolute: marketingResult.hasAbsolute,
                prioritySelection: true
            };
        }
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // Marketing toujours en premier
                if (a.category === 'marketing_news' && b.category !== 'marketing_news') return -1;
                if (b.category === 'marketing_news' && a.category !== 'marketing_news') return 1;
                
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                return b.score - a.score;
            });
        
        const bestResult = sortedResults[0];
        
        if (bestResult) {
            console.log(`[CategoryManager] ✅ Catégorie sélectionnée: ${bestResult.category} (${bestResult.score}pts, ${Math.round(bestResult.confidence * 100)}%)`);
            return {
                category: bestResult.category,
                score: bestResult.score,
                confidence: bestResult.confidence,
                matchedPatterns: bestResult.matches,
                hasAbsolute: bestResult.hasAbsolute
            };
        }
        
        const allSorted = Object.values(results)
            .filter(r => r.score > 0)
            .sort((a, b) => {
                if (a.category === 'marketing_news') return -1;
                if (b.category === 'marketing_news') return 1;
                return b.score - a.score;
            });
        
        if (allSorted.length > 0 && allSorted[0].score >= 20 && allSorted[0].confidence >= 0.4) {
            const fallback = allSorted[0];
            console.log(`[CategoryManager] 📌 Utilisation fallback: ${fallback.category} (${fallback.score}pts, ${Math.round(fallback.confidence * 100)}%)`);
            return {
                category: fallback.category,
                score: fallback.score,
                confidence: fallback.confidence,
                matchedPatterns: fallback.matches,
                hasAbsolute: fallback.hasAbsolute
            };
        }
        
        console.log('[CategoryManager] 📌 Aucune catégorie correspondante, classification "other"');
        return {
            category: 'other',
            score: 0,
            confidence: 0,
            matchedPatterns: [],
            hasAbsolute: false,
            reason: 'below_threshold'
        };
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters, promotions et marketing',
                priority: 100, // PRIORITÉ MAXIMALE
                isCustom: false
            },
            
            // PRIORITÉ ÉLEVÉE - SYSTÈMES
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité et authentification',
                priority: 90,
                isCustom: false
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures et paiements',
                priority: 85,
                isCustom: false
            },
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches à faire et demandes d\'action',
                priority: 80,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et demandes de réunion',
                priority: 70,
                isCustom: false
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités, devis et contrats',
                priority: 65,
                isCustom: false
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Tickets et assistance',
                priority: 60,
                isCustom: false
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
                priority: 55,
                isCustom: false
            },
            
            // PRIORITÉ FAIBLE
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
                priority: 45,
                isCustom: false
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Annonces internes',
                priority: 40,
                isCustom: false
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques système',
                priority: 35,
                isCustom: false
            },
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 30,
                isCustom: false
            }
        };
        
        console.log('[CategoryManager] 📚 Catégories initialisées avec priorité marketing:', Object.keys(this.categories).length);
    }

    // ================================================
    // MÉTHODES UTILITAIRES - INCHANGÉES
    // ================================================
    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(15); // Augmenté pour le sujet
        } else {
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet ';
        }
        
        if (email.from?.emailAddress?.address) {
            allText += (email.from.emailAddress.address + ' ').repeat(5);
        }
        if (email.from?.emailAddress?.name) {
            allText += (email.from.emailAddress.name + ' ').repeat(5);
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
            allText += (email.bodyPreview + ' ').repeat(3); // Augmenté pour le preview
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtml(email.body.content);
            allText += cleanedBody + ' ';
        }
        
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

    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedText = text.toLowerCase()
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
        
        const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
        
        return wordBoundaryRegex.test(normalizedText) || normalizedText.includes(normalizedKeyword);
    }

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

    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

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

    isInCC(email) {
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        
        if (!currentUserEmail) {
            return false;
        }
        
        const isInToList = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        }) || false;
        
        const isInCCList = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        return isInCCList && !isInToList;
    }

    getCurrentUserEmail() {
        try {
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName || parsed.mail;
            }
            
            const msalAccounts = JSON.parse(localStorage.getItem('msal.account.keys') || '[]');
            if (msalAccounts.length > 0) {
                const firstAccount = localStorage.getItem(msalAccounts[0]);
                if (firstAccount) {
                    const account = JSON.parse(firstAccount);
                    return account.username || account.preferred_username;
                }
            }
            
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

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        if (exclusions.domains && exclusions.domains.length > 0) {
            for (const domain of exclusions.domains) {
                if (content.domain.includes(domain.toLowerCase())) {
                    return true;
                }
            }
        }
        
        if (exclusions.emails && exclusions.emails.length > 0) {
            const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
            if (emailAddress && exclusions.emails.includes(emailAddress)) {
                return true;
            }
        }
        
        return false;
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

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    // ================================================
    // GESTION PARAMÈTRES
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

    getDefaultSettings() {
        return {
            activeCategories: null,
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: ['tasks', 'meetings', 'finance'],
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

    saveSettings() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            console.log('[CategoryManager] 💾 Settings sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde paramètres:', error);
        }
    }

    // ================================================
    // API PUBLIQUE
    // ================================================
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }

    updateTaskPreselectedCategories(categories) {
        console.log('[CategoryManager] 📋 updateTaskPreselectedCategories:', categories);
        
        const normalizedCategories = Array.isArray(categories) ? [...categories] : [];
        this.settings.taskPreselectedCategories = normalizedCategories;
        this.saveSettings();
        
        this.notifyChange('taskPreselectedCategories', normalizedCategories);
        
        return normalizedCategories;
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            const allCategories = [...Object.keys(this.categories), ...Object.keys(this.customCategories)];
            return allCategories;
        }
        
        return [...this.settings.activeCategories];
    }

    getCategories() {
        return { ...this.categories, ...this.customCategories };
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
        return this.categories[categoryId] || this.customCategories[categoryId] || null;
    }

    // ================================================
    // CATÉGORIES PERSONNALISÉES ET ÉVÉNEMENTS
    // ================================================
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
                    this.keywordCatalog[id] = {
                        absolute: [...(category.keywords.absolute || [])],
                        strong: [...(category.keywords.strong || [])],
                        weak: [...(category.keywords.weak || [])],
                        exclusions: [...(category.keywords.exclusions || [])]
                    };
                } else {
                    this.keywordCatalog[id] = {
                        absolute: [],
                        strong: [],
                        weak: [],
                        exclusions: []
                    };
                }
                
                const totalKeywords = this.getTotalKeywordsCount(id);
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" (${id}): ${totalKeywords} mots-clés`);
            });
            
            console.log('[CategoryManager] 📊 Résumé:', Object.keys(this.customCategories).length, 'catégories personnalisées chargées');
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    getTotalKeywordsCount(categoryId) {
        const keywords = this.keywordCatalog[categoryId];
        if (!keywords) return 0;
        
        return (keywords.absolute?.length || 0) + 
               (keywords.strong?.length || 0) + 
               (keywords.weak?.length || 0) + 
               (keywords.exclusions?.length || 0);
    }

    setupEventListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'categorySettings') {
                console.log('[CategoryManager] 🔄 Changement localStorage détecté');
                this.reloadSettingsFromStorage();
            }
        });
    }

    reloadSettingsFromStorage() {
        const oldSettings = { ...this.settings };
        this.settings = this.loadSettings();
        
        const changes = this.detectSettingsChanges(oldSettings, this.settings);
        changes.forEach(change => {
            this.notifyChange(change.type, change.value);
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

    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    notifyChange(type, value) {
        console.log(`[CategoryManager] 📢 Notification changement: ${type}`);
        
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur listener:', error);
            }
        });
        
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
    }

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

    // ================================================
    // MÉTHODES DE TEST
    // ================================================
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

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC CategoryManager v22.0 - Marketing Priority');
        
        console.group('📂 Catégories');
        const allCategories = Object.keys(this.categories);
        const customCategories = Object.keys(this.customCategories);
        const activeCategories = this.getActiveCategories();
        
        console.log('Total catégories:', allCategories.length);
        console.log('Catégories standard:', allCategories.filter(c => !this.categories[c].isCustom).length);
        console.log('Catégories personnalisées:', customCategories.length);
        console.log('Catégories actives:', activeCategories.length);
        console.groupEnd();
        
        console.group('🔍 Catalogue mots-clés');
        const catalogEntries = Object.keys(this.keywordCatalog);
        console.log('Entrées dans le catalogue:', catalogEntries.length);
        
        // Afficher marketing en premier
        if (this.keywordCatalog.marketing_news) {
            const marketingKeywords = this.getTotalKeywordsCount('marketing_news');
            console.log(`📰 Marketing & News (PRIORITÉ): ${marketingKeywords} mots-clés`);
        }
        
        catalogEntries.filter(cat => cat !== 'marketing_news').forEach(catId => {
            const totalKeywords = this.getTotalKeywordsCount(catId);
            if (totalKeywords > 0) {
                const category = this.getCategory(catId);
                console.log(`${category?.icon || '📂'} ${category?.name || catId}: ${totalKeywords} mots-clés`);
            }
        });
        console.groupEnd();
        
        console.group('⚙️ Configuration');
        console.log('Catégories pré-sélectionnées:', this.getTaskPreselectedCategories());
        console.log('Catégories actives:', this.getActiveCategories().length);
        console.log('Exclude spam:', this.shouldExcludeSpam());
        console.log('Detect CC:', this.shouldDetectCC());
        console.groupEnd();
        
        console.groupEnd();
        
        return {
            totalCategories: allCategories.length,
            customCategories: customCategories.length,
            activeCategories: activeCategories.length,
            catalogEntries: catalogEntries.length,
            preselectedCategories: this.getTaskPreselectedCategories().length,
            marketingPriority: true
        };
    }
}

// ================================================
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v22.0...');
window.categoryManager = new CategoryManager();

// Export des méthodes de test globales
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v22.0 - Marketing Priority');
    
    const tests = [
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", expected: "marketing_news" },
        { subject: "Promotion spéciale - 50% de réduction - unsubscribe", expected: "marketing_news" },
        { subject: "Votre commande a été expédiée - tracking disponible", expected: "marketing_news" },
        { subject: "Action requise: Confirmer votre commande", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte", expected: "security" },
        { subject: "Facture #12345 - Échéance dans 3 jours", expected: "finance" },
        { subject: "Réunion équipe prévue pour demain", expected: "meetings" },
        { subject: "Do not reply - système automatique", expected: "notifications" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
    });
    
    console.log('Diagnostic:', window.categoryManager.runDiagnostics());
    
    console.groupEnd();
    return { success: true, testsRun: tests.length };
};

window.debugCategoryKeywords = function() {
    console.group('🔍 DEBUG Mots-clés v22.0 - Marketing Priority');
    const catalog = window.categoryManager.keywordCatalog;
    
    // Afficher marketing en premier
    if (catalog.marketing_news) {
        const keywords = catalog.marketing_news;
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        console.log(`📰 Marketing & News (PRIORITÉ ABSOLUE): ${total} mots-clés`);
        if (keywords.absolute?.length) console.log(`  Absolus: ${keywords.absolute.slice(0, 10).join(', ')}...`);
        if (keywords.strong?.length) console.log(`  Forts: ${keywords.strong.slice(0, 10).join(', ')}...`);
        if (keywords.weak?.length) console.log(`  Faibles: ${keywords.weak.slice(0, 5).join(', ')}...`);
        if (keywords.exclusions?.length) console.log(`  Exclusions: ${keywords.exclusions.slice(0, 5).join(', ')}...`);
    }
    
    Object.entries(catalog).forEach(([categoryId, keywords]) => {
        if (categoryId === 'marketing_news') return; // Déjà affiché
        
        const category = window.categoryManager.getCategory(categoryId);
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        if (total > 0) {
            console.log(`${category?.icon || '📂'} ${category?.name || categoryId}: ${total} mots-clés`);
            if (keywords.absolute?.length) console.log(`  Absolus: ${keywords.absolute.slice(0, 5).join(', ')}...`);
            if (keywords.strong?.length) console.log(`  Forts: ${keywords.strong.slice(0, 5).join(', ')}...`);
            if (keywords.weak?.length) console.log(`  Faibles: ${keywords.weak.slice(0, 3).join(', ')}...`);
            if (keywords.exclusions?.length) console.log(`  Exclusions: ${keywords.exclusions.slice(0, 3).join(', ')}...`);
        }
    });
    
    console.groupEnd();
};

console.log('✅ CategoryManager v22.0 loaded - Détection prioritaire marketing/newsletter');
