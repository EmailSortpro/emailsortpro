// CategoryManager.js - Version 22.0 - Détection améliorée HR et Marketing

class CategoryManager {
    constructor() {
        // État principal
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        this.isInitialized = false;
        this.debugMode = false;
        
        // Système de synchronisation
        this.syncQueue = [];
        this.syncInProgress = false;
        this.lastSyncTimestamp = 0;
        this.changeListeners = new Set();
        this.eventListenersSetup = false;
        
        // Cache pour optimisation
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        this._lastLoggedTaskCategories = null;
        
        console.log('[CategoryManager] ✅ Version 22.0 - Détection améliorée HR et Marketing');
        this.init();
    }

    // ================================================
    // INITIALISATION
    // ================================================
    init() {
        console.log('[CategoryManager] 🔧 Initialisation v22.0...');
        
        // 1. Charger les paramètres
        this.settings = this.loadSettings();
        
        // 2. Initialiser les catégories
        this.initializeCategories();
        
        // 3. Initialiser les mots-clés avec détection améliorée
        this.initializeWeightedDetection();
        
        // 4. Charger les catégories personnalisées
        this.loadCustomCategories();
        
        // 5. Initialiser les filtres
        this.initializeFilters();
        
        // 6. Setup event listeners
        this.setupEventListeners();
        
        // 7. Démarrer la synchronisation automatique
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Initialisation terminée - Détection HR et Marketing améliorée');
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
                description: 'Newsletters et promotions',
                priority: 150, // Augmenté pour priorité maximale
                isCustom: false
            },
            
            // CATÉGORIE HR - PRIORITÉ ÉLEVÉE
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines et recrutement',
                priority: 100, // Augmenté pour meilleure détection
                isCustom: false
            },
            
            // CATÉGORIE CC - PRIORITÉ ÉLEVÉE
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90,
                isCustom: false
            },
            
            // PRIORITÉ NORMALE
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
                priority: 40, // Réduit pour laisser la priorité aux autres
                isCustom: false
            }
        };
        
        this.isInitialized = true;
    }

    // ================================================
    // INITIALISATION DES MOTS-CLÉS AMÉLIORÉE v22
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // PRIORITÉ MAXIMALE - MARKETING & NEWS
            marketing_news: {
                absolute: [
                    // Patterns de désabonnement classiques
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails',
                    'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                    'paramétrez vos choix', 'parametrez vos choix',
                    
                    // Patterns "clique-ici" pour désabonnement
                    'clique-ici pour ne plus recevoir',
                    'clique ici pour ne plus recevoir',
                    'cliquez-ici pour ne plus recevoir',
                    'cliquez ici pour ne plus recevoir',
                    'clique-ici pour vous désinscrire',
                    'clique ici pour vous désinscrire',
                    'cliquez-ici pour vous désinscrire',
                    'cliquez ici pour vous désinscrire',
                    'si tu ne souhaites plus recevoir',
                    'si vous ne souhaitez plus recevoir',
                    'to stop receiving emails',
                    'click here to unsubscribe',
                    
                    // Patterns newsletters et marketing
                    'newsletter', 'mailing list', 'mailing',
                    'this email was sent to', 'you are receiving this',
                    'limited offer', 'offre limitée', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente privée',
                    'ventes en ligne', 'vente en ligne', 'shopping',
                    
                    // Patterns streaming et live (Twitch, etc.)
                    'is live', 'streaming', 'watch now', 'regarder maintenant',
                    'twitch community', 'valued member', 'follow us',
                    'stop receiving emails when someone',
                    
                    // Patterns de notifications marketing
                    'disable these notifications', 'turn off notifications',
                    'manage notifications', 'notification settings',
                    'email settings', 'communication preferences',
                    'update your preferences', 'modify your subscription',
                    
                    // Patterns spéciaux pour domaines marketing
                    'no-reply@news.', 'noreply@news.',
                    'no-reply@marketing.', 'noreply@marketing.',
                    'no-reply@info.', 'noreply@info.',
                    
                    // Hashtags marketing
                    '#fitnesspark', '#fitness', 'suis-nous sur',
                    'partage tes photos', 'follow us',
                    '#deployfriday', 'free trial', 'month free'
                ],
                strong: [
                    'promo', 'deal', 'offer', 'sale', 'discount', 'réduction',
                    'newsletter', 'mailing', 'campaign', 'marketing',
                    'exclusive', 'special', 'limited', 'new', 'nouveau',
                    'boutique', 'shopping', 'acheter', 'commander',
                    'offre', 'promotion', 'remise', 'solde',
                    'notifications', 'alerts', 'updates', 'subscribe',
                    'informations de notre part', 'recevoir nos',
                    'app', 'application mobile', 'télécharge',
                    'live', 'streaming', 'watch', 'regarder',
                    'community', 'communauté', 'member', 'membre'
                ],
                weak: [
                    'update', 'discover', 'new', 'nouveauté', 'découvrir',
                    'rappel', 'reminder', 'info', 'information'
                ],
                exclusions: []
            },

            // CATÉGORIE HR - AMÉLIORÉE v22
            hr: {
                absolute: [
                    // Candidatures et recrutement
                    'votre candidature', 'your application', 'ta candidature',
                    'suite de votre candidature', 'suite à votre candidature',
                    'candidature pour le poste', 'application for the position',
                    'candidature au poste', 'candidature spontanée',
                    'dossier de candidature', 'cv reçu', 'resume received',
                    
                    // Réponses négatives
                    'ne sommes malheureusement pas', 'pas en mesure d\'y donner',
                    'suite favorable', 'suite défavorable', 'unsuccessful',
                    'ne pouvons pas y répondre favorablement',
                    'profil ne correspond pas', 'not a match',
                    'pas retenu', 'candidature non retenue',
                    
                    // Processus de recrutement
                    'entretien', 'interview', 'rendez-vous rh',
                    'process de recrutement', 'recruitment process',
                    'hiring process', 'étapes de recrutement',
                    'assessment', 'évaluation', 'test technique',
                    
                    // Postes et titres
                    'customer success manager', 'responsable equipe',
                    'customer support engineer', 'poste de', 'position of',
                    'offre d\'emploi', 'job offer', 'job opening',
                    'opportunité professionnelle', 'career opportunity',
                    
                    // Remerciements candidature
                    'remercions de nous avoir fait parvenir',
                    'thank you for applying', 'thanks for applying',
                    'merci pour ta candidature', 'merci pour votre candidature',
                    'thank you for your interest', 'thank you for expressing interest',
                    
                    // Formules RH
                    'ressources humaines', 'human resources', 'rh',
                    'talent acquisition', 'équipe recrutement',
                    'chargée de recrutement', 'recruteur', 'recruiter',
                    
                    // Documents RH
                    'bulletin de paie', 'payslip', 'contrat de travail',
                    'congés', 'leave request', 'onboarding',
                    'entretien annuel', 'performance review'
                ],
                strong: [
                    'candidature', 'application', 'candidat', 'applicant',
                    'recrutement', 'recruitment', 'hiring', 'emploi',
                    'job', 'poste', 'position', 'offre', 'offer',
                    'entretien', 'interview', 'cv', 'resume',
                    'rh', 'hr', 'human resources', 'ressources humaines',
                    'talent', 'career', 'carrière', 'professionnel',
                    'salaire', 'salary', 'contrat', 'contract',
                    'onboarding', 'intégration', 'équipe', 'team'
                ],
                weak: [
                    'merci', 'thank you', 'interest', 'intérêt',
                    'opportunity', 'opportunité', 'profil', 'profile',
                    'expérience', 'experience', 'compétence', 'skill'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe',
                    'follow us', 'community', 'live', 'streaming'
                ]
            },

            security: {
                absolute: [
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'activité suspecte', 'suspicious activity', 'login alert',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'code de vérification', 'verification code', 'security code',
                    'two-factor', '2fa', 'authentification', 'authentication',
                    'password reset', 'réinitialisation mot de passe',
                    'tentative de fraude', 'phishing', 'hameçonnage'
                ],
                strong: [
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'password', 'mot de passe',
                    'fraude', 'arnaque', 'scam', 'phishing'
                ],
                weak: ['compte', 'account', 'accès'],
                exclusions: ['newsletter', 'unsubscribe', 'promotion', 'candidature']
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
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe', 
                    'candidature', 'application', 'recrutement',
                    'thank you for applying', 'thank you for your interest'
                ]
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
                exclusions: ['newsletter', 'promotion', 'marketing', 'candidature', 'interview']
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
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'unsubscribe', 
                    'ventes en ligne', 'candidature', 'application',
                    'customer success manager position', 'customer support engineer'
                ]
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
                exclusions: [
                    'newsletter', 'marketing', 'spam', 'promotion', 
                    'soldes', 'ventes en ligne', 'candidature'
                ]
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
                exclusions: ['newsletter', 'marketing', 'promotion', 'candidature']
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
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 
                    'candidature', 'thank you for applying'
                ]
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
                exclusions: ['newsletter', 'marketing', 'promotion', 'customer support engineer']
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
                exclusions: ['newsletter', 'marketing', 'external', 'client', 'candidature']
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
                exclusions: [
                    'newsletter', 'marketing', 'urgent', 'candidature',
                    'unsubscribe', 'twitch', 'streaming', 'is live'
                ]
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
                    'urgent', 'action required', 'payment', 'candidature'
                ]
            }
        };

        console.log('[CategoryManager] Mots-clés v22.0 initialisés - Détection HR et Marketing renforcée');
    }

    // ================================================
    // ANALYSE EMAIL AMÉLIORÉE v22
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContent(email);
        
        // Log de debug pour les emails problématiques
        if (this.debugMode) {
            const problematicPatterns = ['twitch', 'candidature', 'applying', 'customer'];
            const shouldDebug = problematicPatterns.some(p => 
                content.text.includes(p) || content.subject.includes(p)
            );
            
            if (shouldDebug) {
                console.log('[CategoryManager] 🔍 Email problématique détecté:', {
                    subject: email.subject?.substring(0, 80),
                    from: email.from?.emailAddress?.address,
                    preview: content.text.substring(0, 200)
                });
            }
        }
        
        // Vérifier les exclusions globales
        if (this.isGloballyExcluded(content, email)) {
            return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
        }
        
        // Détecter les emails familiaux/personnels AVANT tout
        if (this.isPersonalEmail(content, email)) {
            if (this.categories.personal || this.customCategories.personal) {
                return {
                    category: 'personal',
                    score: 100,
                    confidence: 0.95,
                    matchedPatterns: [{ keyword: 'personal_email_detected', type: 'absolute', score: 100 }],
                    hasAbsolute: true,
                    isPersonal: true
                };
            } else {
                return { category: 'excluded', score: 0, confidence: 0, isExcluded: true, reason: 'personal' };
            }
        }
        
        // NOUVEAU v22: Vérification prioritaire pour patterns spéciaux
        const specialChecks = this.checkSpecialPatterns(content, email);
        if (specialChecks.category) {
            if (this.debugMode) {
                console.log(`[CategoryManager] ✅ Pattern spécial détecté: ${specialChecks.category}`);
            }
            return specialChecks;
        }
        
        // Vérifier si on est destinataire principal ou en CC
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        // Si on est en CC
        if (this.shouldDetectCC() && isInCC && !isMainRecipient) {
            const allResults = this.analyzeAllCategories(content);
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
        
        const allResults = this.analyzeAllCategories(content);
        const selectedResult = this.selectByPriorityWithThreshold(allResults);
        
        // Si aucune catégorie trouvée, retourner explicitement 'other'
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

    // ================================================
    // NOUVELLE MÉTHODE v22: Vérification des patterns spéciaux
    // ================================================
    checkSpecialPatterns(content, email) {
        const text = content.text.toLowerCase();
        const from = email.from?.emailAddress?.address?.toLowerCase() || '';
        const subject = content.subject;
        
        // Pattern 1: Twitch streaming notifications
        if (from.includes('twitch') || text.includes('is live') || text.includes('streaming')) {
            if (text.includes('stop receiving emails') || text.includes('click here') || 
                text.includes('valued member') || text.includes('community')) {
                return {
                    category: 'marketing_news',
                    score: 200,
                    confidence: 0.95,
                    matchedPatterns: [{
                        keyword: 'twitch_streaming_notification',
                        type: 'absolute',
                        score: 200
                    }],
                    hasAbsolute: true,
                    detectionReason: 'twitch_pattern'
                };
            }
        }
        
        // Pattern 2: Job applications and HR
        const hrPatterns = [
            /thank(?:s| you) for (?:your )?(?:applying|application|interest)/i,
            /(?:votre|ta) candidature/i,
            /suite (?:de|à) votre candidature/i,
            /candidature (?:pour|au) (?:le )?poste/i,
            /(?:customer|client) (?:success|support) (?:manager|engineer)/i,
            /position (?:at|with)/i,
            /(?:ne|pas) (?:sommes|pouvons) (?:malheureusement|pas)/i,
            /profil ne correspond pas/i,
            /talent acquisition/i
        ];
        
        for (const pattern of hrPatterns) {
            if (pattern.test(text) || pattern.test(subject)) {
                return {
                    category: 'hr',
                    score: 180,
                    confidence: 0.95,
                    matchedPatterns: [{
                        keyword: pattern.source,
                        type: 'absolute',
                        score: 180
                    }],
                    hasAbsolute: true,
                    detectionReason: 'hr_pattern'
                };
            }
        }
        
        // Pattern 3: Vérifier le domaine pour candidatures
        if (from.includes('candidates.') || from.includes('digitalrecruiters') || 
            from.includes('welcomekit') || from.includes('recruiters')) {
            return {
                category: 'hr',
                score: 150,
                confidence: 0.9,
                matchedPatterns: [{
                    keyword: `recruitment_domain:${from}`,
                    type: 'absolute',
                    score: 150
                }],
                hasAbsolute: true,
                detectionReason: 'recruitment_domain'
            };
        }
        
        return {};
    }

    // ================================================
    // CALCUL DE SCORE AMÉLIORÉ v22
    // ================================================
    calculateScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.text;
        
        // Bonus spécial pour domaines selon catégorie
        if (categoryId === 'marketing_news') {
            const from = content.domain;
            if (from.includes('twitch') || from.includes('news') || 
                from.includes('marketing') || from.includes('newsletter')) {
                totalScore += 50;
                matches.push({ keyword: `marketing_domain:${from}`, type: 'domain', score: 50 });
            }
        } else if (categoryId === 'hr') {
            const from = content.domain;
            if (from.includes('recruiters') || from.includes('candidates') || 
                from.includes('welcomekit') || from.includes('jobs')) {
                totalScore += 50;
                matches.push({ keyword: `hr_domain:${from}`, type: 'domain', score: 50 });
            }
        }
        
        // Test des exclusions en premier
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInText(text, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
                    
                    // Debug pour HR
                    if (this.debugMode && categoryId === 'hr') {
                        console.log(`[CategoryManager] ❌ Exclusion HR trouvée: ${exclusion}`);
                    }
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
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 50 });
                    }
                    
                    // Debug pour catégories importantes
                    if (this.debugMode && (categoryId === 'hr' || categoryId === 'marketing_news')) {
                        console.log(`[CategoryManager] ✅ Mot-clé absolu ${categoryId}: ${keyword}`);
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
                    
                    // Bonus si dans le sujet
                    if (content.subject && this.findInText(content.subject, keyword)) {
                        totalScore += 20;
                        matches.push({ keyword: keyword + ' (in subject)', type: 'bonus', score: 20 });
                    }
                }
            }
            
            // Bonus si plusieurs mots-clés forts matchent
            if (strongMatches >= 2) {
                totalScore += 30;
                matches.push({ keyword: 'multiple_strong_matches', type: 'bonus', score: 30 });
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
            
            // Bonus si beaucoup de mots faibles matchent
            if (weakMatches >= 3) {
                totalScore += 20;
                matches.push({ keyword: 'multiple_weak_matches', type: 'bonus', score: 20 });
            }
        }
        
        return { 
            total: Math.max(0, totalScore), 
            hasAbsolute, 
            matches 
        };
    }

    // ================================================
    // MÉTHODE FINDTEXT AMÉLIORÉE
    // ================================================
    findInText(text, keyword) {
        if (!text || !keyword) return false;
        
        // Normalisation complète
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
            .replace(/\s+/g, ' ')
            .trim();
        
        // Recherche directe
        return normalizedText.includes(normalizedKeyword);
    }

    // ================================================
    // SÉLECTION PAR PRIORITÉ AMÉLIORÉE
    // ================================================
    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 30;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const sortedResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                // Si un a un match absolu et pas l'autre, privilégier celui avec absolu
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                // Priorité d'abord
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                // Puis score
                return b.score - a.score;
            });
        
        if (this.debugMode) {
            console.log('[CategoryManager] 📊 Scores par catégorie:');
            sortedResults.forEach(r => {
                console.log(`  - ${r.category}: ${r.score}pts (priority: ${r.priority}, confidence: ${r.confidence}, hasAbsolute: ${r.hasAbsolute})`);
            });
        }
        
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
        
        // Fallback
        const allSorted = Object.values(results)
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score);
        
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
    // Le reste du code reste identique à la version 21.0
    // Je copie uniquement les méthodes modifiées ou ajoutées
    // ================================================

    // Méthode pour tester spécifiquement les emails problématiques
    testProblematicEmails() {
        console.group('[CategoryManager] 🧪 Test emails problématiques v22');
        
        const testCases = [
            {
                name: 'Twitch Live',
                email: {
                    subject: "RMCsport is live: 🥊🔴 MMA GRATUIT JUSQU'A 21h",
                    from: { emailAddress: { address: "no-reply@twitch.tv" } },
                    bodyPreview: "Hey! RMCsport is live! Watch Now. You're receiving this email because you're a valued member. To stop receiving emails"
                },
                expected: 'marketing_news'
            },
            {
                name: 'Candidature ADENES',
                email: {
                    subject: "Responsable Equipe Satisfaction Client F/H - Suite de votre candidature",
                    from: { emailAddress: { address: "candidature.xyz@message.digitalrecruiters.com" } },
                    bodyPreview: "Nous vous remercions de nous avoir fait parvenir votre candidature. Malheureusement pas en mesure"
                },
                expected: 'hr'
            },
            {
                name: 'Platform.sh Application',
                email: {
                    subject: "Thanks for Applying to Platform.sh",
                    from: { emailAddress: { address: "no-reply@platform.sh" } },
                    bodyPreview: "Thank you for expressing interest in the Customer Success Manager position"
                },
                expected: 'hr'
            },
            {
                name: 'Sekoia Candidature',
                email: {
                    subject: "Ta candidature pour le poste de Customer Support Engineer",
                    from: { emailAddress: { address: "xyz@candidates.welcomekit.co" } },
                    bodyPreview: "Merci pour ta candidature. Malheureusement nous ne pouvons pas y répondre favorablement"
                },
                expected: 'hr'
            }
        ];
        
        testCases.forEach(test => {
            const result = this.analyzeEmail(test.email);
            const success = result.category === test.expected;
            
            console.log(`\n${success ? '✅' : '❌'} ${test.name}:`);
            console.log(`  Expected: ${test.expected}`);
            console.log(`  Got: ${result.category} (${result.score}pts)`);
            if (result.matchedPatterns?.length) {
                console.log(`  Patterns: ${result.matchedPatterns.slice(0, 3).map(p => p.keyword).join(', ')}`);
            }
        });
        
        console.groupEnd();
    }

    // Copier toutes les autres méthodes depuis la version 21.0...
    // [Le reste du code reste identique - méthodes de synchronisation, gestion des catégories, etc.]
    
    startAutoSync() {
        // Synchronisation automatique toutes les 2 secondes
        setInterval(() => {
            this.processSettingsChanges();
        }, 2000);
        
        // Synchronisation immédiate lors des changements
        this.setupImmediateSync();
    }

    setupImmediateSync() {
        // Écouter les changements dans localStorage
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
        
        // Appliquer le changement dans les settings locaux
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
        
        // Sauvegarder immédiatement
        this.saveSettingsToStorage();
        
        // Notifier les modules si demandé
        if (notifyModules !== false) {
            this.notifySpecificModules(type, value);
            this.notifyAllModules(type, value);
        }
    }

    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification spécialisée: ${type}`);
        
        // EmailScanner - PRIORITÉ ABSOLUE
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
        
        // AITaskAnalyzer
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
        
        // StartScan/MinimalScanModule
        if (window.minimalScanModule || window.scanStartModule) {
            const scanner = window.minimalScanModule || window.scanStartModule;
            if (type === 'taskPreselectedCategories' || type === 'scanSettings') {
                console.log('[CategoryManager] → ScanModule:', type);
                if (typeof scanner.updateSettings === 'function') {
                    scanner.updateSettings({ [type]: value });
                }
            }
        }
        
        // PageManager
        if (window.pageManager) {
            console.log('[CategoryManager] → PageManager:', type);
            if (typeof window.pageManager.handleSettingsChanged === 'function') {
                window.pageManager.handleSettingsChanged({ settings: this.settings });
            }
        }
    }

    notifyAllModules(type, value) {
        // Dispatch événements globaux
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
        
        // Notifier les listeners enregistrés
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur listener:', error);
            }
        });
    }

    updateSettings(newSettings, notifyModules = true) {
        console.log('[CategoryManager] 📝 updateSettings appelé:', newSettings);
        
        // Ajouter à la queue de synchronisation
        this.syncQueue.push({
            type: 'fullSettings',
            value: newSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        // Traitement immédiat si pas en cours
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateTaskPreselectedCategories(categories, notifyModules = true) {
        console.log('[CategoryManager] 📋 updateTaskPreselectedCategories:', categories);
        
        const normalizedCategories = Array.isArray(categories) ? [...categories] : [];
        
        // Invalider le cache
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
        
        // Détecter les changements et notifier
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
            activeCategories: null, // null = toutes actives
            excludedDomains: [],
            excludedKeywords: [],
            taskPreselectedCategories: [], // VIDE par défaut
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

    getSettings() {
        // Toujours retourner une copie fraîche
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        // Vérifier le cache avec une durée de vie de 10 secondes
        const now = Date.now();
        const CACHE_DURATION = 10000; // 10 secondes
        
        if (this._taskCategoriesCache && 
            this._taskCategoriesCacheTime && 
            (now - this._taskCategoriesCacheTime) < CACHE_DURATION) {
            // Retourner depuis le cache sans logger
            return [...this._taskCategoriesCache];
        }
        
        // Récupérer les catégories fraîches
        const categories = this.settings.taskPreselectedCategories || [];
        
        // Mettre à jour le cache
        this._taskCategoriesCache = [...categories];
        this._taskCategoriesCacheTime = now;
        
        // Log seulement si changement ou première fois
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
        // Si activeCategories est null, toutes les catégories sont actives
        if (!this.settings.activeCategories) {
            // Retourner TOUTES les catégories (standard + personnalisées)
            const allCategories = Object.keys(this.categories);
            return allCategories;
        }
        
        // Sinon retourner seulement les catégories marquées comme actives
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

    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        // Retourner une fonction pour supprimer le listener
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    removeChangeListener(callback) {
        this.changeListeners.delete(callback);
    }

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
                // Ajouter la catégorie
                this.categories[id] = {
                    ...category,
                    isCustom: true,
                    priority: category.priority || 30
                };
                
                // IMPORTANT: Charger les mots-clés sauvegardés
                if (category.keywords) {
                    this.weightedKeywords[id] = {
                        absolute: [...(category.keywords.absolute || [])],
                        strong: [...(category.keywords.strong || [])],
                        weak: [...(category.keywords.weak || [])],
                        exclusions: [...(category.keywords.exclusions || [])]
                    };
                } else {
                    // Initialiser avec des tableaux vides
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
                console.log(`  - Keywords object:`, this.weightedKeywords[id]);
                
                if (totalKeywords === 0) {
                    console.warn(`  ⚠️ AUCUN MOT-CLÉ - La catégorie ne pourra pas détecter d'emails!`);
                }
                
                // S'assurer que la catégorie est active
                if (this.settings.activeCategories === null) {
                    // Si null, toutes sont actives par défaut
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
        
        // Initialiser les mots-clés
        this.weightedKeywords[id] = {
            absolute: category.keywords.absolute || [],
            strong: category.keywords.strong || [],
            weak: category.keywords.weak || [],
            exclusions: category.keywords.exclusions || []
        };

        this.saveCustomCategories();
        
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

        // Mise à jour avec préservation des mots-clés
        const updatedCategory = {
            ...this.customCategories[categoryId],
            ...updates,
            keywords: updates.keywords || this.customCategories[categoryId].keywords,
            updatedAt: new Date().toISOString()
        };

        this.customCategories[categoryId] = updatedCategory;
        this.categories[categoryId] = updatedCategory;
        
        // Mettre à jour les mots-clés si fournis
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

        // Retirer des catégories pré-sélectionnées si présente
        if (this.settings.taskPreselectedCategories?.includes(categoryId)) {
            const newPreselected = this.settings.taskPreselectedCategories.filter(id => id !== categoryId);
            this.updateTaskPreselectedCategories(newPreselected);
        }

        // Retirer des catégories actives si présente
        if (this.settings.activeCategories?.includes(categoryId)) {
            const newActive = this.settings.activeCategories.filter(id => id !== categoryId);
            this.updateActiveCategories(newActive);
        }

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

        // Si c'est une catégorie personnalisée, sauvegarder
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

    // NOUVELLE méthode pour détecter les emails personnels/familiaux
    isPersonalEmail(content, email) {
        const personalIndicators = [
            'papa', 'maman', 'mamie', 'papy', 'papi',
            'chéri', 'chérie', 'mon amour', 'ma chérie',
            'bises', 'bisous', 'gros bisous', 'je t\'embrasse',
            'famille', 'familial', 'personnel', 'personal'
        ];
        
        const professionalCounterIndicators = [
            'ressources humaines', 'human resources', 'rh',
            'contrat', 'contract', 'entreprise', 'company',
            'professionnel', 'professional', 'business'
        ];
        
        const text = content.text.toLowerCase();
        
        // Compter les indicateurs personnels
        let personalScore = 0;
        personalIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                personalScore += 10;
            }
        });
        
        // Réduire le score si des indicateurs professionnels sont présents
        let professionalScore = 0;
        professionalCounterIndicators.forEach(indicator => {
            if (text.includes(indicator)) {
                professionalScore += 10;
            }
        });
        
        // Email personnel si score personnel > 20 ET score professionnel < 10
        return personalScore > 20 && professionalScore < 10;
    }

    // Nouvelle méthode pour vérifier si on est destinataire principal
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

    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // IMPORTANT: Toujours inclure TOUTES les catégories personnalisées
        const customCategoryIds = Object.keys(this.customCategories);
        
        if (this.debugMode) {
            console.log('[CategoryManager] 🎯 Analyse avec:');
            console.log('  - Catégories actives:', activeCategories);
            console.log('  - Catégories personnalisées:', customCategoryIds);
        }
        
        // Analyser toutes les catégories (standard + personnalisées)
        const allCategoriesToAnalyze = new Set([
            ...Object.keys(this.weightedKeywords),
            ...customCategoryIds
        ]);
        
        for (const categoryId of allCategoriesToAnalyze) {
            // Vérifier si la catégorie est active OU personnalisée OU spéciale
            const isActive = activeCategories.includes(categoryId);
            const isCustom = customCategoryIds.includes(categoryId);
            const isSpecial = ['marketing_news', 'cc', 'hr'].includes(categoryId); // HR ajouté aux spéciales
            
            if (!isActive && !isCustom && !isSpecial) {
                continue;
            }
            
            // Vérifier que la catégorie existe
            if (!this.categories[categoryId]) {
                console.warn(`[CategoryManager] ⚠️ Catégorie ${categoryId} non trouvée`);
                continue;
            }
            
            // Obtenir les mots-clés (depuis weightedKeywords ou catégorie personnalisée)
            let keywords = this.weightedKeywords[categoryId];
            
            // Pour les catégories personnalisées, charger depuis customCategories si nécessaire
            if (isCustom && (!keywords || this.isEmptyKeywords(keywords))) {
                const customCat = this.customCategories[categoryId];
                if (customCat && customCat.keywords) {
                    keywords = customCat.keywords;
                    // S'assurer que les mots-clés sont dans weightedKeywords
                    this.weightedKeywords[categoryId] = keywords;
                }
            }
            
            // Vérifier si la catégorie a des mots-clés
            if (!keywords || this.isEmptyKeywords(keywords)) {
                if (isCustom) {
                    console.warn(`[CategoryManager] ⚠️ Catégorie personnalisée ${categoryId} (${this.categories[categoryId]?.name}) sans mots-clés`);
                }
                continue;
            }
            
            // Calculer le score
            const score = this.calculateScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                hasAbsolute: score.hasAbsolute,
                matches: score.matches,
                confidence: this.calculateConfidence(score),
                priority: this.categories[categoryId]?.priority || 50,
                isCustom: isCustom
            };
            
            if (this.debugMode && score.total > 0) {
                console.log(`[CategoryManager] 📊 ${categoryId}: ${score.total}pts (${score.matches.length} matches)`);
            }
        }
        
        return results;
    }

    // Méthode helper pour vérifier si les mots-clés sont vides
    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
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
        
        // Charger depuis le stockage ou utiliser les valeurs par défaut
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
        
        // Initialiser si nécessaire
        if (!this.categoryFilters) {
            this.categoryFilters = {};
        }
        
        this.categoryFilters[categoryId] = {
            includeDomains: filters.includeDomains || [],
            excludeDomains: filters.excludeDomains || [],
            includeEmails: filters.includeEmails || [],
            excludeEmails: filters.excludeEmails || []
        };
        
        // Si c'est une catégorie personnalisée, sauvegarder
        if (this.customCategories[categoryId]) {
            this.customCategories[categoryId].filters = this.categoryFilters[categoryId];
            this.saveCustomCategories();
        } else {
            // Pour les catégories standard, sauvegarder dans localStorage séparément
            this.saveCategoryFilters();
        }
        
        console.log(`[CategoryManager] Filtres mis à jour pour ${categoryId}`);
        
        // Notifier les changements
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

    // Modifier la méthode analyzeEmail pour prendre en compte les filtres
    analyzeEmailWithFilters(email) {
        const baseAnalysis = this.analyzeEmail(email);
        
        // Si l'email est déjà bien catégorisé avec un score élevé, on peut le garder
        if (baseAnalysis.category !== 'other' && baseAnalysis.score >= 100 && baseAnalysis.hasAbsolute) {
            return baseAnalysis;
        }
        
        // Vérifier les filtres d'inclusion/exclusion pour chaque catégorie
        const emailDomain = this.extractDomain(email.from?.emailAddress?.address);
        const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
        
        let bestMatch = null;
        let highestPriority = -1;
        
        Object.entries(this.categories).forEach(([categoryId, category]) => {
            const filters = this.getCategoryFilters(categoryId);
            
            // Vérifier les exclusions d'abord
            if (filters.excludeDomains?.includes(emailDomain) || 
                filters.excludeEmails?.includes(emailAddress)) {
                // Cette catégorie est exclue pour cet email
                return;
            }
            
            // Vérifier les inclusions
            if (filters.includeDomains?.includes(emailDomain) || 
                filters.includeEmails?.includes(emailAddress)) {
                // Cette catégorie a une inclusion directe
                const priority = category.priority || 50;
                if (priority > highestPriority) {
                    highestPriority = priority;
                    bestMatch = {
                        category: categoryId,
                        score: 150, // Score élevé pour les inclusions directes
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
        
        // Si on a trouvé une correspondance par filtre, l'utiliser
        if (bestMatch) {
            return bestMatch;
        }
        
        // Sinon, retourner l'analyse de base
        return baseAnalysis;
    }

    // Ajouter cette méthode dans l'initialisation
    initializeFilters() {
        this.loadCategoryFilters();
        console.log('[CategoryManager] Filtres initialisés');
    }

    applyEnhancedDomainBonus(content, categoryId, matches, totalScore) {
        const domainBonuses = {
            security: ['microsoft', 'google', 'apple', 'security', 'auth', '2fa', 'verification'],
            finance: ['gouv.fr', 'impots', 'bank', 'paypal', 'stripe', 'invoice', 'billing'],
            marketing_news: ['newsletter', 'mailchimp', 'campaign', 'marketing', 'sendinblue', 'mailjet', 'twitch'],
            notifications: ['noreply', 'notification', 'donotreply', 'automated', 'system'],
            project: ['github', 'gitlab', 'jira', 'asana', 'trello', 'confluence', 'bitbucket'],
            hr: ['workday', 'bamboohr', 'adp', 'payroll', 'hr', 'recruiting', 'recruiters', 'candidates', 'welcomekit'],
            meetings: ['zoom', 'teams', 'meet', 'webex', 'gotomeeting', 'calendar'],
            support: ['zendesk', 'freshdesk', 'helpdesk', 'support', 'ticket']
        };
        
        if (domainBonuses[categoryId]) {
            for (const domainKeyword of domainBonuses[categoryId]) {
                if (content.domain.includes(domainKeyword)) {
                    const bonus = 40; // Bonus uniforme plus élevé
                    totalScore += bonus;
                    matches.push({ keyword: `${domainKeyword}_domain`, type: 'domain', score: bonus });
                    break;
                }
            }
        }
    }

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        // Vérifier les domaines exclus
        if (exclusions.domains && exclusions.domains.length > 0) {
            for (const domain of exclusions.domains) {
                if (content.domain.includes(domain.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Vérifier les emails exclus
        if (exclusions.emails && exclusions.emails.length > 0) {
            const emailAddress = email.from?.emailAddress?.address?.toLowerCase();
            if (emailAddress && exclusions.emails.includes(emailAddress)) {
                return true;
            }
        }
        
        return false;
    }

    analyzeCategory(content, keywords) {
        return this.calculateScore(content, keywords, 'single');
    }

    extractCompleteContent(email) {
        let allText = '';
        let subject = '';
        
        // IMPORTANT: Traiter le sujet avec un poids très élevé
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            // Répéter le sujet 10 fois pour lui donner beaucoup plus de poids
            allText += (email.subject + ' ').repeat(10);
        } else {
            // Si pas de sujet, ajouter un marqueur pour la détection
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet ';
        }
        
        // Extraire l'expéditeur
        if (email.from?.emailAddress?.address) {
            allText += (email.from.emailAddress.address + ' ').repeat(3);
        }
        if (email.from?.emailAddress?.name) {
            allText += (email.from.emailAddress.name + ' ').repeat(3);
        }
        
        // Extraire les destinataires (important pour détecter si on est en copie)
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
        
        // Extraire les CC
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
        
        // Extraire le contenu du corps
        if (email.bodyPreview) {
            allText += email.bodyPreview + ' ';
        }
        
        if (email.body?.content) {
            const cleanedBody = this.cleanHtml(email.body.content);
            allText += cleanedBody + ' ';
            
            // Extraire les mots importants du corps (en majuscules)
            const importantWords = cleanedBody.match(/\b[A-Z]{2,}\b/g);
            if (importantWords) {
                allText += importantWords.join(' ') + ' ';
            }
        }
        
        // Analyser le contexte de l'email pour détecter des patterns
        const contextClues = this.extractContextClues(email);
        allText += contextClues + ' ';
        
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

    // Nouvelle méthode pour extraire des indices contextuels
    extractContextClues(email) {
        let clues = '';
        
        // Détecter les patterns de réponse/transfert
        const subject = email.subject || '';
        if (subject.match(/^(RE:|FW:|Fwd:|Tr:)/i)) {
            clues += ' conversation reply response ';
        }
        
        // Détecter les mentions de documents
        const body = email.body?.content || email.bodyPreview || '';
        if (body.match(/ci-joint|attached|attachment|pièce jointe|document/i)) {
            clues += ' document attachment piece jointe ';
        }
        
        // Détecter les formules de politesse familiales
        if (body.match(/\b(papa|maman|bises|bisous)\b/i)) {
            clues += ' famille family personal personnel ';
        }
        
        // Détecter les mentions commerciales
        if (body.match(/\b(commande|order|facture|invoice|livraison|delivery|n°|numéro)\b/i)) {
            clues += ' commerce order commande achat vente ';
        }
        
        // Détecter les mentions RH
        if (body.match(/\b(candidature|application|recrutement|recruitment|poste|position)\b/i)) {
            clues += ' hr ressources humaines candidature recrutement ';
        }
        
        return clues;
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

    // Méthode helper pour échapper les caractères spéciaux regex
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\    removeChangeListener(callback) {
        this');
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
        // Si pas de CC, ce n'est pas un email en CC
        if (!email.ccRecipients || !Array.isArray(email.ccRecipients) || email.ccRecipients.length === 0) {
            return false;
        }
        
        const currentUserEmail = this.getCurrentUserEmail();
        
        if (!currentUserEmail) {
            console.log('[CategoryManager] ⚠️ Email utilisateur non trouvé');
            return false;
        }
        
        // Vérifier si l'utilisateur est dans TO
        const isInToList = email.toRecipients?.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        }) || false;
        
        // Vérifier si l'utilisateur est dans CC
        const isInCCList = email.ccRecipients.some(recipient => {
            const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
            return recipientEmail === currentUserEmail.toLowerCase();
        });
        
        // IMPORTANT: On est en CC seulement si on est dans CC ET PAS dans TO
        const result = isInCCList && !isInToList;
        
        if (result) {
            console.log('[CategoryManager] 📋 Email en CC détecté (pas destinataire principal):', {
                subject: email.subject?.substring(0, 50),
                inTo: isInToList,
                inCC: isInCCList
            });
        }
        
        return result;
    }

    getCurrentUserEmail() {
        try {
            // Essayer plusieurs sources
            const userInfo = localStorage.getItem('currentUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.email || parsed.userPrincipalName || parsed.mail;
            }
            
            // Essayer depuis le token MSAL
            const msalAccounts = JSON.parse(localStorage.getItem('msal.account.keys') || '[]');
            if (msalAccounts.length > 0) {
                const firstAccount = localStorage.getItem(msalAccounts[0]);
                if (firstAccount) {
                    const account = JSON.parse(firstAccount);
                    return account.username || account.preferred_username;
                }
            }
            
            // Essayer depuis AuthService
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
            exclusionKeywords: 0
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

    exportKeywords() {
        const data = {
            exportDate: new Date().toISOString(),
            categories: {},
            customCategories: this.customCategories
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

            console.log('[CategoryManager] Mots-clés importés avec succès');
            return true;
            
        } catch (error) {
            console.error('[CategoryManager] Erreur import mots-clés:', error);
            return false;
        }
    }

    setupEventListeners() {
        if (this.eventListenersSetup) {
            return;
        }

        // Écouter seulement les événements externes (pas les nôtres)
        this.externalSettingsChangeHandler = (event) => {
            // Ignorer nos propres événements
            if (event.detail?.source === 'CategoryManager') {
                return;
            }
            
            const { type, value } = event.detail;
            console.log(`[CategoryManager] Reçu changement externe: ${type}`, value);
            
            // Appliquer sans notifier (pour éviter les boucles)
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
                    .filter((k, index, arr) => arr.indexOf(k) === index); // Dédoublonner
            }
        });
        
        return sanitized;
    }

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
        
        // Réinitialiser avec les mots-clés par défaut
        this.initializeWeightedDetection();
        
        // Recharger les catégories personnalisées
        Object.entries(this.customCategories).forEach(([id, category]) => {
            if (category.keywords) {
                this.weightedKeywords[id] = this.sanitizeKeywords(category.keywords);
            }
        });
        
        console.log('[CategoryManager] Index des mots-clés reconstruit');
    }

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC COMPLET CategoryManager v22.0');
        
        // 1. Vérifier les catégories
        console.group('📂 Catégories');
        const allCategories = Object.keys(this.categories);
        const customCategories = Object.keys(this.customCategories);
        const activeCategories = this.getActiveCategories();
        
        console.log('Total catégories:', allCategories.length);
        console.log('Catégories standard:', allCategories.filter(c => !this.categories[c].isCustom).length);
        console.log('Catégories personnalisées:', customCategories.length);
        console.log('Catégories actives:', activeCategories.length);
        
        // Vérifier les catégories personnalisées
        customCategories.forEach(catId => {
            const cat = this.categories[catId];
            const keywords = this.weightedKeywords[catId];
            const isActive = activeCategories.includes(catId);
            const keywordCount = this.getTotalKeywordsCount(catId);
            
            console.log(`\n${cat.icon} ${cat.name} (${catId}):`);
            console.log('  - Active:', isActive ? '✅' : '❌');
            console.log('  - Priorité:', cat.priority);
            console.log('  - Mots-clés:', keywordCount);
            
            if (keywordCount === 0) {
                console.warn('  ⚠️ AUCUN MOT-CLÉ DÉFINI!');
            }
        });
        console.groupEnd();
        
        // 2. Vérifier l'efficacité des catégories
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
        
        // 3. Vérifier la synchronisation
        console.group('🔄 État de synchronisation');
        console.log('Queue de sync:', this.syncQueue.length);
        console.log('Sync en cours:', this.syncInProgress);
        console.log('Dernière sync:', new Date(this.lastSyncTimestamp).toLocaleTimeString());
        console.log('Listeners actifs:', this.changeListeners.size);
        console.groupEnd();
        
        // 4. Test des emails problématiques
        console.group('🧪 Test emails problématiques');
        this.testProblematicEmails();
        console.groupEnd();
        
        // 5. Recommandations
        console.group('💡 Recommandations');
        
        // Catégories sans mots-clés
        const emptyCats = allCategories.filter(catId => this.getTotalKeywordsCount(catId) === 0);
        if (emptyCats.length > 0) {
            console.warn('Catégories sans mots-clés:', emptyCats);
        }
        
        // Catégories peu efficaces
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
        
        console.groupEnd();
        console.groupEnd();
        
        return {
            totalCategories: allCategories.length,
            customCategories: customCategories.length,
            activeCategories: activeCategories.length,
            emptyCategoriesCount: emptyCats.length,
            inefficientCategoriesCount: inefficientCats.length
        };
    }

    getDebugInfo() {
        return {
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
            version: '22.0'
        };
    }

    // Force la synchronisation immédiate de tous les modules
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
        
        // Notification générale finale
        this.notifyAllModules('fullSync', this.settings);
        
        console.log('[CategoryManager] ✅ Synchronisation forcée terminée');
    }

    // Test complet de synchronisation
    testSynchronization() {
        console.group('🧪 TEST SYNCHRONISATION CategoryManager v22');
        
        const debugInfo = this.getDebugInfo();
        console.log('Debug Info:', debugInfo);
        
        // Test modification taskPreselectedCategories
        const originalCategories = [...this.getTaskPreselectedCategories()];
        const testCategories = ['tasks', 'commercial'];
        
        console.log('Test: Modification taskPreselectedCategories');
        console.log('Avant:', originalCategories);
        
        this.updateTaskPreselectedCategories(testCategories);
        
        setTimeout(() => {
            const newCategories = this.getTaskPreselectedCategories();
            console.log('Après:', newCategories);
            
            // Vérifier EmailScanner
            const emailScannerCategories = window.emailScanner?.getTaskPreselectedCategories() || [];
            console.log('EmailScanner a:', emailScannerCategories);
            
            const isSync = JSON.stringify(newCategories.sort()) === JSON.stringify(emailScannerCategories.sort());
            console.log('Synchronisation:', isSync ? '✅ OK' : '❌ ÉCHEC');
            
            // Remettre les valeurs originales
            this.updateTaskPreselectedCategories(originalCategories);
            
            console.groupEnd();
        }, 500);
        
        return true;
    }

    cleanup() {
        // Arrêter tous les intervals
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Nettoyer les event listeners
        if (this.externalSettingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.externalSettingsChangeHandler);
        }
        
        // Vider les queues et listeners
        this.syncQueue = [];
        this.changeListeners.clear();
        this.eventListenersSetup = false;
        this.syncInProgress = false;
        
        console.log('[CategoryManager] 🧹 Nettoyage effectué');
    }

    destroy() {
        this.cleanup();
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        console.log('[CategoryManager] Instance détruite');
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
}

// ================================================
// INITIALISATION GLOBALE SÉCURISÉE
// ================================================

// Créer l'instance globale avec nettoyage préalable
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v22.0...');
window.categoryManager = new CategoryManager();

// Export des méthodes de test globales améliorées
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v22.0');
    
    const tests = [
        { subject: "RMCsport is live: 🥊🔴 MMA GRATUIT", body: "Watch Now. Stop receiving emails when someone", from: "no-reply@twitch.tv", expected: "marketing_news" },
        { subject: "Newsletter hebdomadaire - Désabonnez-vous ici", expected: "marketing_news" },
        { subject: "Responsable Equipe - Suite de votre candidature", from: "candidature@digitalrecruiters.com", expected: "hr" },
        { subject: "Thanks for Applying to Platform.sh", body: "Customer Success Manager position", expected: "hr" },
        { subject: "Ta candidature pour le poste", from: "xyz@candidates.welcomekit.co", expected: "hr" },
        { subject: "Action requise: Confirmer votre commande", expected: "tasks" },
        { subject: "Nouvelle connexion détectée sur votre compte", expected: "security" },
        { subject: "Facture #12345 - Échéance dans 3 jours", expected: "finance" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, test.body || '', test.from || 'test@example.com', test.expected);
    });
    
    console.log('Stats:', window.categoryManager.getCategoryStats());
    console.log('Debug Info:', window.categoryManager.getDebugInfo());
    
    // Test synchronisation
    window.categoryManager.testSynchronization();
    
    console.groupEnd();
    return { success: true, testsRun: tests.length };
};

window.debugCategoryKeywords = function() {
    console.group('🔍 DEBUG Mots-clés v22.0');
    const allKeywords = window.categoryManager.getAllKeywords();
    
    Object.entries(allKeywords).forEach(([categoryId, keywords]) => {
        const category = window.categoryManager.getCategory(categoryId);
        const total = (keywords.absolute?.length || 0) + (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + (keywords.exclusions?.length || 0);
        
        if (total > 0) {
            console.log(`${category?.icon || '📂'} ${category?.name || categoryId}: ${total} mots-clés`);
            if (keywords.absolute?.length) console.log(`  Absolus: ${keywords.absolute.slice(0, 5).join(', ')}${keywords.absolute.length > 5 ? '...' : ''}`);
            if (keywords.strong?.length) console.log(`  Forts: ${keywords.strong.slice(0, 5).join(', ')}${keywords.strong.length > 5 ? '...' : ''}`);
            if (keywords.weak?.length) console.log(`  Faibles: ${keywords.weak.slice(0, 5).join(', ')}${keywords.weak.length > 5 ? '...' : ''}`);
            if (keywords.exclusions?.length) console.log(`  Exclusions: ${keywords.exclusions.slice(0, 5).join(', ')}${keywords.exclusions.length > 5 ? '...' : ''}`);
        }
    });
    
    console.groupEnd();
};

window.testCategorySync = function() {
    return window.categoryManager.testSynchronization();
};

window.forceCategorySync = function() {
    window.categoryManager.forceSyncAllModules();
    return { success: true, message: 'Synchronisation forcée effectuée' };
};

window.runCategoryDiagnostics = function() {
    return window.categoryManager.runDiagnostics();
};

console.log('✅ CategoryManager v22.0 loaded - Détection HR et Marketing améliorée!');
