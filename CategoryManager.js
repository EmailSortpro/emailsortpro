// CategoryManager.js - Version 22.0 - Mots-clés génériques et détection améliorée
// Amélioration complète de la détection avec mots-clés adaptés à tous les secteurs

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        this.eventListenersSetup = false;
        
        // Système de synchronisation amélioré
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        // Cache pour optimisation
        this._normalizedTextCache = new Map();
        this._analysisCache = new Map();
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.setupEventListeners();
        this.startAutoSync();
        
        console.log('[CategoryManager] ✅ Version 22.0 - Mots-clés génériques multi-secteurs');
    }

    // ================================================
    // MÉTHODE D'ANALYSE PRINCIPALE - COMPLÈTEMENT REFAITE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Vérifier le cache d'analyse
        const cacheKey = this.generateCacheKey(email);
        if (this._analysisCache.has(cacheKey)) {
            return this._analysisCache.get(cacheKey);
        }
        
        // Extraire TOUT le contenu disponible
        const content = this.extractCompleteContent(email);
        
        if (this.debugMode) {
            console.log('[CategoryManager] 📄 Analyse email:', {
                subject: email.subject?.substring(0, 50) + '...',
                from: email.from?.emailAddress?.address,
                contentLength: content.fullText.length,
                hasFullTextContent: !!email.fullTextContent
            });
        }
        
        // Analyser toutes les catégories
        const results = this.analyzeAllCategories(content);
        
        // Sélectionner la meilleure catégorie
        const bestResult = this.selectBestCategory(results);
        
        // Mettre en cache le résultat
        this._analysisCache.set(cacheKey, bestResult);
        
        // Nettoyer le cache si trop grand
        if (this._analysisCache.size > 1000) {
            const firstKey = this._analysisCache.keys().next().value;
            this._analysisCache.delete(firstKey);
        }
        
        return bestResult;
    }

    // ================================================
    // EXTRACTION COMPLÈTE DU CONTENU - OPTIMISÉE
    // ================================================
    extractCompleteContent(email) {
        // Construire le texte complet pour l'analyse
        let fullText = '';
        let subject = email.subject || '';
        let bodyText = '';
        
        // 1. PRIORITÉ ABSOLUE : Utiliser fullTextContent si disponible
        if (email.fullTextContent && email.fullTextContent.trim()) {
            fullText = email.fullTextContent;
            // S'assurer que le sujet est inclus
            if (subject && !fullText.toLowerCase().includes(subject.toLowerCase())) {
                fullText = subject + '\n\n' + fullText;
            }
        } else {
            // 2. FALLBACK : Construire le contenu manuellement
            
            // Sujet (très important, répété pour augmenter le poids)
            if (subject) {
                fullText += subject + ' ' + subject + ' ' + subject + '\n\n';
            }
            
            // Expéditeur
            if (email.from?.emailAddress) {
                const fromEmail = email.from.emailAddress.address || '';
                const fromName = email.from.emailAddress.name || '';
                fullText += `De: ${fromName} <${fromEmail}>\n`;
                // Ajouter le domaine de l'expéditeur
                if (fromEmail.includes('@')) {
                    const domain = fromEmail.split('@')[1];
                    fullText += `Domaine: ${domain}\n`;
                }
            }
            
            // Corps du message
            if (email.body?.content) {
                bodyText = this.cleanHtmlContent(email.body.content);
                fullText += bodyText + '\n';
            } else if (email.bodyPreview) {
                bodyText = email.bodyPreview;
                fullText += bodyText + '\n';
            }
            
            // Snippet Gmail
            if (email.gmailMetadata?.snippet && !fullText.includes(email.gmailMetadata.snippet)) {
                fullText += '\n' + email.gmailMetadata.snippet;
            }
            
            // Métadonnées importantes
            if (email.hasAttachments) {
                fullText += '\n[PIÈCE JOINTE PRÉSENTE]';
            }
            
            if (email.importance === 'high') {
                fullText += '\n[HAUTE PRIORITÉ]';
            }
            
            // Labels Gmail
            if (email.labelIds && Array.isArray(email.labelIds)) {
                email.labelIds.forEach(label => {
                    if (label.includes('IMPORTANT')) fullText += '\n[EMAIL IMPORTANT]';
                    if (label.includes('CATEGORY_PROMOTIONS')) fullText += '\n[CATÉGORIE PROMOTIONS]';
                    if (label.includes('CATEGORY_SOCIAL')) fullText += '\n[CATÉGORIE RÉSEAUX SOCIAUX]';
                    if (label.includes('CATEGORY_UPDATES')) fullText += '\n[CATÉGORIE MISES À JOUR]';
                });
            }
        }
        
        // Normaliser le texte pour l'analyse
        const normalizedText = this.normalizeText(fullText);
        
        return {
            fullText: fullText,
            normalizedText: normalizedText,
            subject: subject,
            bodyText: bodyText,
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasAttachments: email.hasAttachments || false,
            importance: email.importance || 'normal',
            provider: email.provider || email.providerType || 'unknown',
            isReply: this.isReplyOrForward(subject),
            hasFullTextContent: !!email.fullTextContent
        };
    }

    // ================================================
    // NORMALISATION DU TEXTE - AMÉLIORÉE
    // ================================================
    normalizeText(text) {
        if (!text) return '';
        
        // Vérifier le cache
        if (this._normalizedTextCache.has(text)) {
            return this._normalizedTextCache.get(text);
        }
        
        // Normaliser complètement
        let normalized = text.toLowerCase()
            // Normaliser les caractères Unicode
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            // Remplacer les accents
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ýÿ]/g, 'y')
            .replace(/[ñ]/g, 'n')
            .replace(/[ç]/g, 'c')
            // Remplacer les apostrophes
            .replace(/[''`]/g, "'")
            // Remplacer les tirets par des espaces
            .replace(/[-–—_]/g, ' ')
            // Remplacer les retours à la ligne par des espaces
            .replace(/[\r\n]+/g, ' ')
            // Supprimer la ponctuation sauf les points (pour les URLs)
            .replace(/[,;:!?()[\]{}«»""]/g, ' ')
            // Normaliser les espaces multiples
            .replace(/\s+/g, ' ')
            .trim();
        
        // Mettre en cache
        this._normalizedTextCache.set(text, normalized);
        
        // Nettoyer le cache si trop grand
        if (this._normalizedTextCache.size > 500) {
            const firstKey = this._normalizedTextCache.keys().next().value;
            this._normalizedTextCache.delete(firstKey);
        }
        
        return normalized;
    }

    // ================================================
    // ANALYSE DE TOUTES LES CATÉGORIES
    // ================================================
    analyzeAllCategories(content) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        // Analyser chaque catégorie
        for (const categoryId of activeCategories) {
            const keywords = this.weightedKeywords[categoryId];
            if (!keywords) continue;
            
            const score = this.calculateCategoryScore(content, keywords, categoryId);
            
            results[categoryId] = {
                category: categoryId,
                score: score.total,
                matches: score.matches,
                confidence: this.calculateConfidence(score),
                hasAbsolute: score.hasAbsolute,
                priority: this.categories[categoryId]?.priority || 50
            };
        }
        
        // Toujours inclure "other" comme option
        results.other = {
            category: 'other',
            score: 0,
            matches: [],
            confidence: 0,
            hasAbsolute: false,
            priority: 0
        };
        
        return results;
    }

    // ================================================
    // CALCUL DU SCORE PAR CATÉGORIE - REFAIT
    // ================================================
    calculateCategoryScore(content, keywords, categoryId) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        const text = content.normalizedText;
        
        // Bonus de base selon le type d'email
        if (content.isReply) {
            if (['meetings', 'tasks', 'reminders'].includes(categoryId)) {
                totalScore += 10;
                matches.push({ type: 'context', keyword: 'reply_email', score: 10 });
            }
        }
        
        if (content.hasAttachments) {
            if (['finance', 'project', 'commercial'].includes(categoryId)) {
                totalScore += 15;
                matches.push({ type: 'context', keyword: 'has_attachment', score: 15 });
            }
        }
        
        if (content.importance === 'high') {
            if (['tasks', 'security', 'finance'].includes(categoryId)) {
                totalScore += 20;
                matches.push({ type: 'context', keyword: 'high_importance', score: 20 });
            }
        }
        
        // Analyser les mots-clés absolus
        if (keywords.absolute && keywords.absolute.length > 0) {
            for (const keyword of keywords.absolute) {
                if (this.findKeywordInText(text, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ type: 'absolute', keyword: keyword, score: 100 });
                    
                    // Bonus si dans le sujet
                    if (content.subject && this.findKeywordInText(content.subject.toLowerCase(), keyword)) {
                        totalScore += 50;
                        matches.push({ type: 'subject_bonus', keyword: keyword, score: 50 });
                    }
                }
            }
        }
        
        // Analyser les mots-clés forts
        if (keywords.strong && keywords.strong.length > 0) {
            let strongCount = 0;
            for (const keyword of keywords.strong) {
                if (this.findKeywordInText(text, keyword)) {
                    totalScore += 40;
                    strongCount++;
                    matches.push({ type: 'strong', keyword: keyword, score: 40 });
                    
                    // Bonus si dans le sujet
                    if (content.subject && this.findKeywordInText(content.subject.toLowerCase(), keyword)) {
                        totalScore += 20;
                        matches.push({ type: 'subject_bonus', keyword: keyword, score: 20 });
                    }
                }
            }
            
            // Bonus pour correspondances multiples
            if (strongCount >= 3) {
                totalScore += 30;
                matches.push({ type: 'multiple_strong', keyword: `${strongCount} strong matches`, score: 30 });
            }
        }
        
        // Analyser les mots-clés faibles
        if (keywords.weak && keywords.weak.length > 0) {
            let weakCount = 0;
            for (const keyword of keywords.weak) {
                if (this.findKeywordInText(text, keyword)) {
                    totalScore += 15;
                    weakCount++;
                    matches.push({ type: 'weak', keyword: keyword, score: 15 });
                }
            }
            
            // Bonus pour correspondances multiples
            if (weakCount >= 4) {
                totalScore += 20;
                matches.push({ type: 'multiple_weak', keyword: `${weakCount} weak matches`, score: 20 });
            }
        }
        
        // Appliquer les exclusions
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findKeywordInText(text, exclusion)) {
                    totalScore -= 50;
                    matches.push({ type: 'exclusion', keyword: exclusion, score: -50 });
                }
            }
        }
        
        return {
            total: Math.max(0, totalScore),
            hasAbsolute: hasAbsolute,
            matches: matches
        };
    }

    // ================================================
    // RECHERCHE DE MOTS-CLÉS AMÉLIORÉE
    // ================================================
    findKeywordInText(text, keyword) {
        if (!text || !keyword) return false;
        
        // Normaliser le mot-clé aussi
        const normalizedKeyword = this.normalizeText(keyword);
        
        // Recherche simple
        if (text.includes(normalizedKeyword)) {
            return true;
        }
        
        // Recherche avec limites de mots
        const wordBoundaryPattern = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
        return wordBoundaryPattern.test(text);
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategory(results) {
        const MIN_SCORE_THRESHOLD = 25;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        // Filtrer les résultats valides
        const validResults = Object.values(results)
            .filter(r => r.category !== 'other' && r.score >= MIN_SCORE_THRESHOLD);
        
        if (validResults.length === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'no_category_matched'
            };
        }
        
        // Trier par priorité et score
        validResults.sort((a, b) => {
            // Priorité aux matches absolus
            if (a.hasAbsolute && !b.hasAbsolute) return -1;
            if (!a.hasAbsolute && b.hasAbsolute) return 1;
            
            // Puis par score
            if (a.score !== b.score) return b.score - a.score;
            
            // Puis par priorité de catégorie
            return b.priority - a.priority;
        });
        
        const best = validResults[0];
        
        if (best.confidence < MIN_CONFIDENCE_THRESHOLD && !best.hasAbsolute) {
            return {
                category: 'other',
                score: best.score,
                confidence: best.confidence,
                matchedPatterns: best.matches,
                hasAbsolute: false,
                reason: 'low_confidence'
            };
        }
        
        return {
            category: best.category,
            score: best.score,
            confidence: best.confidence,
            matchedPatterns: best.matches,
            hasAbsolute: best.hasAbsolute
        };
    }

    // ================================================
    // INITIALISATION DES CATÉGORIES
    // ================================================
    initializeCategories() {
        this.categories = {
            // Catégories principales
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters, actualités et communications marketing',
                priority: 80,
                isCustom: false
            },
            
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques et alertes système',
                priority: 70,
                isCustom: false
            },
            
            finance: {
                name: 'Finance',
                icon: '💰',
                color: '#dc2626',
                description: 'Factures, paiements et documents financiers',
                priority: 90,
                isCustom: false
            },
            
            tasks: {
                name: 'Actions Requises',
                icon: '✅',
                color: '#ef4444',
                description: 'Tâches et actions à effectuer',
                priority: 95,
                isCustom: false
            },
            
            meetings: {
                name: 'Réunions',
                icon: '📅',
                color: '#f59e0b',
                description: 'Invitations et planification de réunions',
                priority: 85,
                isCustom: false
            },
            
            commercial: {
                name: 'Commercial',
                icon: '💼',
                color: '#059669',
                description: 'Opportunités commerciales et partenariats',
                priority: 75,
                isCustom: false
            },
            
            project: {
                name: 'Projets',
                icon: '📊',
                color: '#3b82f6',
                description: 'Gestion et suivi de projets',
                priority: 70,
                isCustom: false
            },
            
            support: {
                name: 'Support',
                icon: '🛠️',
                color: '#f59e0b',
                description: 'Support technique et assistance',
                priority: 60,
                isCustom: false
            },
            
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines et administration',
                priority: 65,
                isCustom: false
            },
            
            security: {
                name: 'Sécurité',
                icon: '🔒',
                color: '#991b1b',
                description: 'Alertes de sécurité et authentification',
                priority: 100,
                isCustom: false
            },
            
            internal: {
                name: 'Communication Interne',
                icon: '📢',
                color: '#0ea5e9',
                description: 'Communications internes d\'entreprise',
                priority: 55,
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
            
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 40,
                isCustom: false
            },
            
            // Catégorie spéciale pour les non-classés
            other: {
                name: 'Non classé',
                icon: '❓',
                color: '#64748b',
                description: 'Emails non catégorisés',
                priority: 0,
                isCustom: false
            }
        };
        
        this.isInitialized = true;
    }

    // ================================================
    // INITIALISATION DES MOTS-CLÉS GÉNÉRIQUES
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            // MARKETING & NEWS - Mots-clés génériques pour tous secteurs
            marketing_news: {
                absolute: [
                    // Désabonnement universel
                    'se desinscrire', 'se désinscrire', 'desinscrire', 'désinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'desabonner', 'désabonner',
                    'stop emails', 'arreter emails', 'ne plus recevoir',
                    'gerer preferences', 'gérer préférences', 'manage preferences',
                    'email preferences', 'communication preferences',
                    'update preferences', 'modifier preferences',
                    'cliquez ici pour', 'click here to',
                    'liste de diffusion', 'mailing list',
                    'newsletter', 'bulletin', 'infolettre',
                    // Marketing générique
                    'offre speciale', 'offre spéciale', 'special offer',
                    'promotion', 'promo', 'soldes', 'vente',
                    'reduction', 'réduction', 'discount',
                    'nouveau produit', 'new product', 'lancement',
                    'decouvrez', 'découvrez', 'discover'
                ],
                strong: [
                    'actualite', 'actualité', 'news', 'nouveaute', 'nouveauté',
                    'article', 'blog', 'publication', 'parution',
                    'evenement', 'événement', 'event', 'webinar', 'webinaire',
                    'invitation', 'participer', 'inscrire', 'inscription',
                    'offre', 'promotion', 'remise', 'avantage',
                    'exclusif', 'exclusive', 'limite', 'limité', 'limited',
                    'gratuit', 'free', 'essai', 'trial',
                    'telecharger', 'télécharger', 'download',
                    'decouvrir', 'découvrir', 'explorer', 'voir plus'
                ],
                weak: [
                    'information', 'info', 'mise a jour', 'mise à jour', 'update',
                    'nouveau', 'nouvelle', 'new', 'recent', 'récent',
                    'disponible', 'available', 'maintenant', 'now',
                    'profiter', 'beneficier', 'bénéficier'
                ],
                exclusions: [
                    'facture', 'invoice', 'paiement', 'payment',
                    'urgent', 'action requise', 'securite', 'sécurité'
                ]
            },

            // NOTIFICATIONS - Emails automatiques tous secteurs
            notifications: {
                absolute: [
                    'ne pas repondre', 'ne pas répondre', 'do not reply',
                    'no reply', 'noreply', 'donotreply',
                    'message automatique', 'automated message', 'automatic email',
                    'notification automatique', 'system notification',
                    'ceci est un message automatique', 'this is an automated',
                    // Notifications RH génériques
                    'votre candidature', 'your application',
                    'candidature recue', 'candidature reçue', 'application received',
                    'nous avons le regret', 'we regret to inform',
                    'merci pour votre candidature', 'thank you for your application',
                    'apres examen', 'après examen', 'after review',
                    'suite donnee', 'suite donnée', 'next steps'
                ],
                strong: [
                    'notification', 'alerte', 'alert', 'avis', 'notice',
                    'statut', 'status', 'etat', 'état', 'state',
                    'confirmation', 'confirme', 'confirmé', 'confirmed',
                    'recu', 'reçu', 'received', 'traite', 'traité', 'processed',
                    'automatique', 'automatic', 'automated', 'systeme', 'système',
                    'candidature', 'application', 'postulation',
                    'recrutement', 'recruitment', 'embauche', 'hiring'
                ],
                weak: [
                    'information', 'message', 'update', 'mise a jour',
                    'changement', 'modification', 'evolution', 'évolution'
                ],
                exclusions: [
                    'action requise', 'urgent', 'a faire', 'à faire',
                    'deadline', 'echeance', 'échéance'
                ]
            },

            // FINANCE - Termes financiers universels
            finance: {
                absolute: [
                    'facture', 'invoice', 'bill',
                    'paiement', 'payment', 'reglement', 'règlement',
                    'virement', 'transfer', 'wire transfer',
                    'remboursement', 'refund', 'credit', 'crédit',
                    'releve', 'relevé', 'statement', 'compte rendu',
                    'declaration', 'déclaration', 'declaration fiscale',
                    'commande numero', 'commande numéro', 'order number',
                    'numero commande', 'numéro commande', 'commande n',
                    'bon de commande', 'purchase order',
                    'devis', 'quote', 'quotation', 'estimation'
                ],
                strong: [
                    'montant', 'amount', 'somme', 'total',
                    'prix', 'price', 'cout', 'coût', 'cost',
                    'euro', 'euros', 'dollar', 'dollars',
                    'tva', 'taxe', 'tax', 'ht', 'ttc',
                    'echeance', 'échéance', 'due date', 'date limite',
                    'bancaire', 'bank', 'banque', 'compte',
                    'tresorerie', 'trésorerie', 'treasury', 'finance',
                    'comptabilite', 'comptabilité', 'accounting',
                    'budget', 'depense', 'dépense', 'expense'
                ],
                weak: [
                    'reference', 'référence', 'ref', 'numero', 'numéro',
                    'document', 'piece', 'pièce', 'justificatif',
                    'valider', 'validation', 'approuver', 'approval'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'solde',
                    'reduction', 'réduction', 'offre speciale'
                ]
            },

            // TASKS - Actions requises universelles
            tasks: {
                absolute: [
                    'action requise', 'action required', 'action necessaire', 'action nécessaire',
                    'a faire', 'à faire', 'to do', 'todo',
                    'urgent', 'urgence', 'urgent action', 'tres urgent', 'très urgent',
                    'asap', 'des que possible', 'dès que possible', 'immediately',
                    'deadline', 'date limite', 'echeance', 'échéance',
                    'avant le', 'before', 'au plus tard',
                    'merci de', 'veuillez', 'please', 'priere de', 'prière de',
                    'completer', 'compléter', 'complete', 'remplir', 'fill',
                    'valider', 'validate', 'approuver', 'approve',
                    'corriger', 'correction', 'modifier', 'modification'
                ],
                strong: [
                    'urgent', 'urgence', 'priority', 'priorite', 'priorité',
                    'important', 'critique', 'critical', 'imperatif', 'impératif',
                    'action', 'tache', 'tâche', 'task', 'mission',
                    'demande', 'request', 'besoin', 'need', 'require',
                    'attente', 'waiting', 'en cours', 'pending',
                    'retard', 'delay', 'late', 'overdue',
                    'rappel', 'reminder', 'relance', 'follow up',
                    'reponse', 'réponse', 'response', 'retour', 'feedback'
                ],
                weak: [
                    'faire', 'do', 'realiser', 'réaliser', 'executer', 'exécuter',
                    'terminer', 'finir', 'complete', 'achever',
                    'traiter', 'process', 'gerer', 'gérer', 'handle'
                ],
                exclusions: [
                    'information', 'pour info', 'fyi', 'newsletter',
                    'notification', 'automatique'
                ]
            },

            // MEETINGS - Réunions tous contextes
            meetings: {
                absolute: [
                    'reunion', 'réunion', 'meeting', 'rendez vous', 'rendez-vous',
                    'invitation reunion', 'invitation réunion', 'meeting invitation',
                    'conference', 'conférence', 'call', 'appel', 'visio',
                    'teams', 'zoom', 'meet', 'skype', 'webex',
                    'salle de reunion', 'salle de réunion', 'meeting room',
                    'ordre du jour', 'agenda', 'planning',
                    'participer', 'join', 'rejoindre', 'assister'
                ],
                strong: [
                    'calendrier', 'calendar', 'agenda', 'planning', 'schedule',
                    'date', 'heure', 'hour', 'time', 'horaire',
                    'disponible', 'available', 'disponibilite', 'disponibilité',
                    'confirmer', 'confirm', 'confirmation', 'presence', 'présence',
                    'reporter', 'postpone', 'decaler', 'décaler', 'reschedule',
                    'annuler', 'cancel', 'annulation', 'cancellation',
                    'point', 'sujet', 'topic', 'discussion', 'debat', 'débat'
                ],
                weak: [
                    'rencontre', 'meet', 'voir', 'discuss', 'discuter',
                    'echanger', 'échanger', 'talk', 'parler', 'partager'
                ],
                exclusions: [
                    'newsletter', 'notification', 'automatique', 'marketing'
                ]
            },

            // COMMERCIAL - Opportunités business génériques
            commercial: {
                absolute: [
                    'opportunite', 'opportunité', 'opportunity', 'occasion',
                    'proposition', 'proposal', 'offre commerciale',
                    'contrat', 'contract', 'accord', 'agreement',
                    'partenariat', 'partnership', 'collaboration',
                    'prospect', 'lead', 'client potentiel',
                    'negociation', 'négociation', 'negotiation',
                    'appel offre', 'appel d\'offre', 'tender', 'rfp'
                ],
                strong: [
                    'commercial', 'business', 'affaire', 'deal',
                    'vente', 'sale', 'achat', 'purchase', 'acquisition',
                    'client', 'customer', 'prospect', 'lead',
                    'marche', 'marché', 'market', 'secteur', 'industrie',
                    'strategie', 'stratégie', 'strategy', 'plan',
                    'objectif', 'target', 'but', 'goal',
                    'croissance', 'growth', 'developpement', 'développement',
                    'investissement', 'investment', 'roi', 'retour'
                ],
                weak: [
                    'interessant', 'intéressant', 'interesting', 'potentiel',
                    'possible', 'envisager', 'consider', 'etudier', 'étudier'
                ],
                exclusions: [
                    'facture', 'invoice', 'paiement', 'newsletter',
                    'candidature', 'cv', 'emploi'
                ]
            },

            // PROJECT - Gestion de projet universelle
            project: {
                absolute: [
                    'projet', 'project', 'programme', 'program',
                    'milestone', 'jalon', 'etape', 'étape', 'phase',
                    'livrable', 'deliverable', 'rendu', 'resultat', 'résultat',
                    'sprint', 'iteration', 'itération', 'cycle',
                    'gantt', 'planning projet', 'roadmap', 'feuille de route',
                    'kick off', 'kickoff', 'lancement', 'demarrage', 'démarrage',
                    'retrospective', 'rétrospective', 'retro', 'bilan'
                ],
                strong: [
                    'avancement', 'progress', 'progression', 'statut', 'status',
                    'planning', 'plan', 'calendrier', 'timeline',
                    'equipe', 'équipe', 'team', 'ressource', 'resource',
                    'tache', 'tâche', 'task', 'activite', 'activité',
                    'risque', 'risk', 'issue', 'probleme', 'problème',
                    'budget', 'cout', 'coût', 'cost', 'delai', 'délai',
                    'validation', 'revue', 'review', 'point', 'suivi'
                ],
                weak: [
                    'document', 'fichier', 'file', 'dossier', 'rapport',
                    'mise a jour', 'update', 'evolution', 'changement'
                ],
                exclusions: [
                    'facture', 'paiement', 'newsletter', 'marketing'
                ]
            },

            // SUPPORT - Support technique générique
            support: {
                absolute: [
                    'ticket', 'incident', 'demande support', 'support request',
                    'probleme technique', 'problème technique', 'technical issue',
                    'bug', 'erreur', 'error', 'panne', 'dysfonctionnement',
                    'assistance', 'help desk', 'helpdesk', 'service desk',
                    'resolution', 'résolution', 'resolved', 'resolu', 'résolu',
                    'escalade', 'escalation', 'priorite', 'priorité'
                ],
                strong: [
                    'support', 'assistance', 'aide', 'help',
                    'technique', 'technical', 'informatique', 'it',
                    'probleme', 'problème', 'problem', 'issue',
                    'solution', 'resolution', 'résolution', 'fix',
                    'maintenance', 'depannage', 'dépannage', 'repair',
                    'diagnostic', 'analyse', 'investigation',
                    'utilisateur', 'user', 'client', 'demandeur'
                ],
                weak: [
                    'question', 'demande', 'request', 'besoin',
                    'fonctionnement', 'marche pas', 'not working'
                ],
                exclusions: [
                    'commercial', 'vente', 'marketing', 'newsletter'
                ]
            },

            // HR - Ressources humaines génériques
            hr: {
                absolute: [
                    'ressources humaines', 'human resources', 'rh', 'hr',
                    'contrat travail', 'contrat de travail', 'employment contract',
                    'bulletin paie', 'bulletin de paie', 'fiche paie', 'payslip',
                    'conge', 'congé', 'conges', 'congés', 'leave', 'vacation',
                    'entretien annuel', 'evaluation', 'évaluation', 'review',
                    'formation', 'training', 'stage', 'onboarding',
                    'recrutement', 'recruitment', 'embauche', 'hiring'
                ],
                strong: [
                    'salaire', 'salary', 'remuneration', 'rémunération',
                    'prime', 'bonus', 'avantage', 'benefit',
                    'employe', 'employé', 'employee', 'salarie', 'salarié',
                    'poste', 'position', 'fonction', 'role',
                    'carriere', 'carrière', 'career', 'evolution',
                    'competence', 'compétence', 'skill', 'qualification',
                    'contrat', 'contract', 'avenant', 'accord'
                ],
                weak: [
                    'equipe', 'équipe', 'team', 'personnel', 'staff',
                    'entreprise', 'company', 'societe', 'société'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'commercial', 'vente'
                ]
            },

            // SECURITY - Sécurité informatique universelle
            security: {
                absolute: [
                    'alerte securite', 'alerte sécurité', 'security alert',
                    'connexion suspecte', 'suspicious login', 'activite suspecte',
                    'mot de passe', 'password', 'mdp', 'code verification',
                    'authentification', 'authentication', '2fa', 'two factor',
                    'compte bloque', 'compte bloqué', 'account locked',
                    'tentative connexion', 'login attempt', 'acces refuse',
                    'violation securite', 'security breach', 'intrusion'
                ],
                strong: [
                    'securite', 'sécurité', 'security', 'protection',
                    'verification', 'vérification', 'verify', 'confirmer',
                    'identite', 'identité', 'identity', 'authentifier',
                    'acces', 'accès', 'access', 'autorisation',
                    'suspicieux', 'suspicious', 'inhabituel', 'unusual',
                    'bloquer', 'block', 'verrouiller', 'lock',
                    'risque', 'risk', 'menace', 'threat', 'danger'
                ],
                weak: [
                    'compte', 'account', 'profil', 'profile',
                    'connexion', 'login', 'session', 'utilisateur'
                ],
                exclusions: [
                    'newsletter', 'marketing', 'promotion', 'offre'
                ]
            },

            // INTERNAL - Communications internes
            internal: {
                absolute: [
                    'communication interne', 'internal communication',
                    'note service', 'note de service', 'memo',
                    'tout le personnel', 'all staff', 'tous les employes',
                    'annonce entreprise', 'company announcement',
                    'information generale', 'information générale',
                    'a tous', 'à tous', 'to all', 'pour tous'
                ],
                strong: [
                    'interne', 'internal', 'entreprise', 'company',
                    'organisation', 'organization', 'societe', 'société',
                    'personnel', 'staff', 'employes', 'employés',
                    'direction', 'management', 'comite', 'comité',
                    'politique', 'policy', 'procedure', 'procédure',
                    'changement', 'change', 'evolution', 'évolution'
                ],
                weak: [
                    'information', 'annonce', 'announcement', 'nouvelle',
                    'mise a jour', 'update', 'communication'
                ],
                exclusions: [
                    'client', 'customer', 'externe', 'external',
                    'marketing', 'commercial'
                ]
            },

            // REMINDERS - Relances et suivis
            reminders: {
                absolute: [
                    'rappel', 'reminder', 'relance', 'follow up',
                    'suite a', 'suite à', 'following', 'concernant',
                    'comme convenu', 'as agreed', 'as discussed',
                    'je reviens vers', 'i follow up', 'circling back',
                    'point suivi', 'point de suivi', 'status update'
                ],
                strong: [
                    'rappeler', 'remind', 'relancer', 'suivre',
                    'attente', 'waiting', 'pending', 'en cours',
                    'retour', 'feedback', 'reponse', 'réponse',
                    'precedent', 'précédent', 'previous', 'dernier',
                    'encore', 'still', 'toujours', 'always'
                ],
                weak: [
                    'point', 'suivi', 'follow', 'suite',
                    'message', 'mail', 'email', 'courrier'
                ],
                exclusions: [
                    'premiere', 'première', 'first', 'nouveau',
                    'initial', 'introduction'
                ]
            },

            // CC - Emails en copie
            cc: {
                absolute: [
                    'pour information', 'for information', 'fyi',
                    'en copie', 'in copy', 'cc pour info',
                    'copie pour information', 'courtesy copy'
                ],
                strong: [
                    'information', 'info', 'copie', 'copy',
                    'cc', 'cci', 'bcc', 'connaissance'
                ],
                weak: [
                    'transmettre', 'forward', 'partager', 'share'
                ],
                exclusions: [
                    'action', 'urgent', 'faire', 'repondre',
                    'valider', 'approuver'
                ]
            }
        };

        console.log('[CategoryManager] ✅ Mots-clés génériques initialisés');
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    extractDomain(email) {
        if (!email || !email.includes('@')) return '';
        const domain = email.split('@')[1]?.toLowerCase() || '';
        // Extraire le domaine principal (ex: google.com -> google)
        const parts = domain.split('.');
        if (parts.length >= 2) {
            return parts[parts.length - 2];
        }
        return domain;
    }

    cleanHtmlContent(html) {
        if (!html) return '';
        
        // Créer un élément temporaire
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Supprimer les scripts et styles
        const elementsToRemove = temp.querySelectorAll('script, style, noscript, iframe');
        elementsToRemove.forEach(el => el.remove());
        
        // Extraire le texte en préservant la structure
        let text = '';
        
        const extractText = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent + ' ';
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Ajouter des espaces pour certains éléments
                if (['p', 'div', 'br', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName.toLowerCase())) {
                    text += '\n';
                }
                
                // Parcourir les enfants
                for (const child of node.childNodes) {
                    extractText(child);
                }
            }
        };
        
        extractText(temp);
        
        return text.trim();
    }

    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.85;
        if (score.total >= 100) return 0.80;
        if (score.total >= 70) return 0.75;
        if (score.total >= 50) return 0.70;
        if (score.total >= 30) return 0.60;
        return 0.50;
    }

    isReplyOrForward(subject) {
        if (!subject) return false;
        const patterns = /^(re:|fwd:|fw:|tr:|ref:|re :|fwd :|fw :|tr :|ref :)/i;
        return patterns.test(subject);
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    generateCacheKey(email) {
        return `${email.id || ''}_${email.subject || ''}_${email.from?.emailAddress?.address || ''}`;
    }

    // ================================================
    // GESTION DES PARAMÈTRES
    // ================================================
    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            if (saved) {
                return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement paramètres:', error);
        }
        return this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            activeCategories: null, // null = toutes actives
            taskPreselectedCategories: [],
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
            preferences: {
                excludeSpam: true,
                detectCC: true,
                showNotifications: true
            }
        };
    }

    saveSettings() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('[CategoryManager] Erreur sauvegarde paramètres:', error);
        }
    }

    // ================================================
    // MÉTHODES PUBLIQUES
    // ================================================
    getCategories() {
        return { ...this.categories };
    }

    getCategory(categoryId) {
        return this.categories[categoryId] || null;
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            return Object.keys(this.categories);
        }
        return [...this.settings.activeCategories];
    }

    getTaskPreselectedCategories() {
        return [...(this.settings.taskPreselectedCategories || [])];
    }

    updateTaskPreselectedCategories(categories) {
        this.settings.taskPreselectedCategories = Array.isArray(categories) ? [...categories] : [];
        this.saveSettings();
        this.notifyChanges('taskPreselectedCategories', this.settings.taskPreselectedCategories);
        return this.settings.taskPreselectedCategories;
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.notifyChanges('settings', this.settings);
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    loadCustomCategories() {
        try {
            const saved = localStorage.getItem('customCategories');
            if (saved) {
                this.customCategories = JSON.parse(saved);
                
                // Ajouter les catégories personnalisées
                Object.entries(this.customCategories).forEach(([id, category]) => {
                    this.categories[id] = {
                        ...category,
                        isCustom: true,
                        priority: category.priority || 30
                    };
                    
                    // Ajouter les mots-clés personnalisés
                    if (category.keywords) {
                        this.weightedKeywords[id] = category.keywords;
                    }
                });
                
                console.log(`[CategoryManager] ${Object.keys(this.customCategories).length} catégories personnalisées chargées`);
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur chargement catégories personnalisées:', error);
        }
    }

    // ================================================
    // SYSTÈME DE NOTIFICATION
    // ================================================
    notifyChanges(type, value) {
        // Notifier les listeners
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur notification listener:', error);
            }
        });
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('categoryManagerChanged', {
            detail: { type, value, settings: this.settings }
        }));
    }

    addChangeListener(callback) {
        this.changeListeners.add(callback);
        return () => this.changeListeners.delete(callback);
    }

    // ================================================
    // SYNCHRONISATION AUTOMATIQUE
    // ================================================
    startAutoSync() {
        // Vérifier les changements toutes les 2 secondes
        setInterval(() => {
            if (this.syncQueue.length > 0 && !this.syncInProgress) {
                this.processSyncQueue();
            }
        }, 2000);
    }

    processSyncQueue() {
        this.syncInProgress = true;
        
        try {
            while (this.syncQueue.length > 0) {
                const change = this.syncQueue.shift();
                this.applyChange(change);
            }
        } catch (error) {
            console.error('[CategoryManager] Erreur traitement sync queue:', error);
        } finally {
            this.syncInProgress = false;
            this.lastSyncTimestamp = Date.now();
        }
    }

    applyChange(change) {
        const { type, value } = change;
        
        switch (type) {
            case 'taskPreselectedCategories':
                this.settings.taskPreselectedCategories = [...value];
                break;
            case 'settings':
                this.settings = { ...this.settings, ...value };
                break;
        }
        
        this.saveSettings();
        this.notifyChanges(type, value);
    }

    // ================================================
    // EVENT LISTENERS
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) return;
        
        // Écouter les changements externes
        window.addEventListener('settingsChanged', (event) => {
            if (event.detail?.source !== 'CategoryManager') {
                this.syncQueue.push({
                    type: event.detail.type,
                    value: event.detail.value
                });
            }
        });
        
        this.eventListenersSetup = true;
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    testEmail(subject, body = '', from = 'test@example.com', expectedCategory = null) {
        const testEmail = {
            subject: subject,
            body: { content: body },
            from: { emailAddress: { address: from } },
            fullTextContent: subject + '\n' + body
        };
        
        const result = this.analyzeEmail(testEmail);
        
        console.log(`📧 Test: "${subject}"`);
        console.log(`   Catégorie: ${result.category} (Score: ${result.score}, Confiance: ${Math.round(result.confidence * 100)}%)`);
        console.log(`   Matches:`, result.matchedPatterns);
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`   ❌ ERREUR: Attendu "${expectedCategory}"`);
        } else if (expectedCategory) {
            console.log(`   ✅ Catégorie correcte`);
        }
        
        return result;
    }

    getCategoryStats() {
        const stats = {};
        Object.keys(this.categories).forEach(catId => {
            const keywords = this.weightedKeywords[catId];
            stats[catId] = {
                name: this.categories[catId].name,
                absolute: keywords?.absolute?.length || 0,
                strong: keywords?.strong?.length || 0,
                weak: keywords?.weak?.length || 0,
                exclusions: keywords?.exclusions?.length || 0,
                total: (keywords?.absolute?.length || 0) + 
                       (keywords?.strong?.length || 0) + 
                       (keywords?.weak?.length || 0)
            };
        });
        return stats;
    }

    getDebugInfo() {
        return {
            version: '22.0',
            categoriesCount: Object.keys(this.categories).length,
            customCategoriesCount: Object.keys(this.customCategories).length,
            activeCategories: this.getActiveCategories().length,
            taskPreselectedCategories: this.settings.taskPreselectedCategories,
            cacheSize: {
                normalizedText: this._normalizedTextCache.size,
                analysis: this._analysisCache.size
            },
            syncQueue: this.syncQueue.length,
            lastSync: new Date(this.lastSyncTimestamp).toISOString()
        };
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[CategoryManager] Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        this._normalizedTextCache.clear();
        this._analysisCache.clear();
        this.syncQueue = [];
        this.changeListeners.clear();
    }

    destroy() {
        this.cleanup();
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = {};
        console.log('[CategoryManager] Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.categoryManager) {
    window.categoryManager.destroy?.();
}

window.categoryManager = new CategoryManager();

// Fonctions de test globales
window.testCategoryManager = function() {
    console.group('🧪 TEST CategoryManager v22.0');
    
    const tests = [
        { subject: "Nouvelle facture #12345 à payer avant le 31", expected: "finance" },
        { subject: "Action urgente requise: valider le document", expected: "tasks" },
        { subject: "Invitation réunion Teams demain 14h", expected: "meetings" },
        { subject: "Newsletter hebdomadaire - Se désinscrire", expected: "marketing_news" },
        { subject: "Alerte sécurité: Nouvelle connexion détectée", expected: "security" },
        { subject: "Votre candidature chez ABC Corp", expected: "notifications" },
        { subject: "Opportunité de partenariat avec votre entreprise", expected: "commercial" },
        { subject: "Rappel: Suite à notre échange de la semaine dernière", expected: "reminders" },
        { subject: "Ticket #45678 - Problème résolu", expected: "support" },
        { subject: "Note de service: Changement d'horaires", expected: "internal" },
        { subject: "Bulletin de paie Janvier 2024", expected: "hr" },
        { subject: "Avancement projet Alpha - Sprint 3", expected: "project" }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, '', 'test@example.com', test.expected);
    });
    
    console.log('\n📊 Statistiques des mots-clés:');
    console.table(window.categoryManager.getCategoryStats());
    
    console.log('\n🔍 Debug Info:', window.categoryManager.getDebugInfo());
    
    console.groupEnd();
    
    return { success: true, testsRun: tests.length };
};

console.log('✅ CategoryManager v22.0 loaded - Mots-clés génériques multi-secteurs');
