// CategoryManager.js - Version 23.0 - DÉTECTION NEWSLETTER ULTRA-RENFORCÉE 🚀

class CategoryManager {
    constructor() {
        this.categories = {};
        this.weightedKeywords = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = true; // Activé pour debug newsletter
        this.eventListenersSetup = false;
        
        // Système de cache haute performance
        this.analysisCache = new Map();
        this.cacheMaxSize = 1000;
        this.cacheTTL = 300000; // 5 minutes
        this.cacheStats = { hits: 0, misses: 0 };
        
        // Optimisation regex pré-compilées
        this.compiledPatterns = new Map();
        this.textNormalizer = this.createTextNormalizer();
        
        // Système de synchronisation optimisé
        this.syncQueue = [];
        this.syncInProgress = false;
        this.changeListeners = new Set();
        this.lastSyncTimestamp = 0;
        
        // Batch processing
        this.pendingAnalysis = [];
        this.batchSize = 50;
        this.batchTimeout = null;
        
        this.initializeCategories();
        this.loadCustomCategories();
        this.initializeWeightedDetection();
        this.initializeFilters();
        this.setupEventListeners();
        this.startOptimizedSync();
        
        console.log('[CategoryManager] ✅ Version 23.0 - DÉTECTION NEWSLETTER ULTRA-RENFORCÉE');
    }

    // ================================================
    // EXTRACTION DE CONTENU - MÉTHODE PRINCIPALE AMÉLIORÉE
    // ================================================
    extractCompleteContent(email) {
        const parts = [];
        
        // Sujet avec pondération maximale pour newsletters
        if (email.subject?.trim()) {
            parts.push(email.subject.repeat(5)); // Augmenté de 3 à 5
        }
        
        // Expéditeur avec pondération élevée
        if (email.from?.emailAddress?.address) {
            parts.push(email.from.emailAddress.address.repeat(3));
        }
        
        // Nom de l'expéditeur si disponible
        if (email.from?.emailAddress?.name) {
            parts.push(email.from.emailAddress.name.repeat(2));
        }
        
        // Aperçu du corps
        if (email.bodyPreview) {
            parts.push(email.bodyPreview.repeat(2));
        }
        
        // Corps de l'email si disponible - EXTRACTION COMPLÈTE
        if (email.body?.content) {
            // Extraire TOUT le texte du HTML, pas seulement 500 caractères
            const fullTextContent = this.extractTextFromHtml(email.body.content);
            parts.push(fullTextContent);
        }
        
        // Ajouter aussi le body non formaté s'il existe
        if (email.body?.text) {
            parts.push(email.body.text);
        }
        
        // Destinataires
        const recipients = [];
        if (email.toRecipients?.length) {
            recipients.push(...email.toRecipients.slice(0, 3).map(r => r.emailAddress?.address).filter(Boolean));
        }
        if (email.ccRecipients?.length) {
            recipients.push(...email.ccRecipients.slice(0, 2).map(r => r.emailAddress?.address).filter(Boolean));
        }
        parts.push(recipients.join(' '));
        
        const rawText = parts.join(' ');
        
        // AMÉLIORATION: Garder deux versions du texte
        const normalizedText = this.normalizeTextForSearch(rawText);
        const originalText = rawText.toLowerCase(); // Version avec accents préservés
        
        return {
            text: normalizedText,
            originalText: originalText, // NOUVEAU: texte original pour recherche accents
            subject: this.normalizeTextForSearch(email.subject || ''),
            originalSubject: (email.subject || '').toLowerCase(),
            domain: this.extractDomain(email.from?.emailAddress?.address),
            senderName: this.normalizeTextForSearch(email.from?.emailAddress?.name || ''),
            senderEmail: email.from?.emailAddress?.address?.toLowerCase() || '',
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: normalizedText.length,
            rawSubject: email.subject || '',
            rawSenderName: email.from?.emailAddress?.name || ''
        };
    }

    // NOUVELLE MÉTHODE: Extraction complète du texte HTML
    extractTextFromHtml(html) {
        if (!html) return '';
        
        // Remplacer les balises par des espaces pour éviter la concaténation
        let text = html.replace(/<br\s*\/?>/gi, ' ');
        text = text.replace(/<\/p>/gi, ' ');
        text = text.replace(/<\/div>/gi, ' ');
        text = text.replace(/<\/td>/gi, ' ');
        text = text.replace(/<\/li>/gi, ' ');
        
        // Supprimer toutes les autres balises
        text = text.replace(/<[^>]*>/g, ' ');
        
        // Décoder les entités HTML
        text = this.decodeHtmlEntities(text);
        
        // Nettoyer les espaces multiples
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    // NOUVELLE MÉTHODE: Décoder les entités HTML
    decodeHtmlEntities(text) {
        const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&nbsp;': ' ',
            '&eacute;': 'é',
            '&egrave;': 'è',
            '&agrave;': 'à',
            '&ccedil;': 'ç',
            '&ocirc;': 'ô',
            '&ecirc;': 'ê',
            '&iuml;': 'ï',
            '&ouml;': 'ö',
            '&uuml;': 'ü'
        };
        
        for (const [entity, char] of Object.entries(entities)) {
            text = text.replace(new RegExp(entity, 'gi'), char);
        }
        
        // Décoder les entités numériques
        text = text.replace(/&#(\d+);/g, (match, num) => String.fromCharCode(num));
        text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
        
        return text;
    }

    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        const parts = email.split('@');
        return parts[1]?.toLowerCase() || 'unknown';
    }

    // ================================================
    // NORMALISATION AMÉLIORÉE
    // ================================================
    createTextNormalizer() {
        return {
            // Mapping complet des accents
            accentMap: {
                'à': 'a', 'â': 'a', 'ä': 'a', 'á': 'a', 'ã': 'a', 'å': 'a',
                'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
                'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
                'ò': 'o', 'ó': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o',
                'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
                'ç': 'c', 'ñ': 'n'
            },
            spaces: /\s+/g,
            punctuation: /[^\w\s\-\%àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/g, // Garde les accents pour la recherche
            html: /<[^>]+>/g
        };
    }

    // NOUVELLE MÉTHODE: Normalisation pour la recherche (garde les accents)
    normalizeTextForSearch(text) {
        if (!text) return '';
        
        return text.toLowerCase()
            .replace(this.textNormalizer.html, ' ')
            .replace(this.textNormalizer.spaces, ' ')
            .trim();
    }

    // Ancienne méthode pour compatibilité
    normalizeTextFast(text) {
        if (!text) return '';
        
        let normalized = text.toLowerCase();
        
        // Remplacer les accents
        for (const [accented, plain] of Object.entries(this.textNormalizer.accentMap)) {
            normalized = normalized.replace(new RegExp(accented, 'g'), plain);
        }
        
        return normalized
            .replace(this.textNormalizer.punctuation, ' ')
            .replace(this.textNormalizer.spaces, ' ')
            .trim();
    }

    // ================================================
    // ANALYSE EMAIL - DÉTECTION NEWSLETTER ULTRA-RENFORCÉE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        // Pré-détection newsletter ultra-agressive
        const isNewsletterCandidate = this.isNewsletterCandidate(email);
        
        if (this.debugMode && isNewsletterCandidate) {
            console.group(`[CategoryManager] 🔍 NEWSLETTER CANDIDAT: ${email.subject?.substring(0, 50)}`);
            console.log('📧 Email complet:', {
                subject: email.subject,
                sender: email.from?.emailAddress?.address,
                senderName: email.from?.emailAddress?.name,
                bodyPreview: email.bodyPreview?.substring(0, 100)
            });
        }
        
        // Vérifier le cache
        const cached = this.getCachedAnalysis(email);
        if (cached) {
            if (this.debugMode && isNewsletterCandidate) {
                console.log('✅ Résultat depuis cache:', cached);
                console.groupEnd();
            }
            return cached;
        }
        
        // Vérifications rapides
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            const result = { category: 'spam', score: 0, confidence: 0, isSpam: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Extraction de contenu AMÉLIORÉE
        const content = this.extractCompleteContent(email);
        
        if (this.debugMode && isNewsletterCandidate) {
            console.log('📄 Contenu extrait:', {
                textLength: content.text.length,
                originalTextLength: content.originalText.length,
                subject: content.subject,
                domain: content.domain,
                senderName: content.senderName,
                senderEmail: content.senderEmail
            });
        }
        
        // Vérifications d'exclusion
        if (this.isGloballyExcluded(content, email)) {
            const result = { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Détection personnelle
        if (this.isPersonalEmail(content)) {
            const result = {
                category: this.categories.personal ? 'personal' : 'excluded',
                score: 100,
                confidence: 0.95,
                isPersonal: true
            };
            this.setCachedAnalysis(email, result);
            return result;
        }
        
        // Analyse CC
        const ccResult = this.analyzeCC(email, content);
        if (ccResult) {
            this.setCachedAnalysis(email, ccResult);
            return ccResult;
        }
        
        // Analyse des catégories avec priorité newsletter
        const result = this.analyzeAllCategories(content, email);
        
        if (this.debugMode && isNewsletterCandidate) {
            console.log('🏆 Résultat final:', result);
            console.groupEnd();
        }
        
        // Cache du résultat
        this.setCachedAnalysis(email, result);
        return result;
    }

    // Méthode de pré-détection newsletter AMÉLIORÉE
    isNewsletterCandidate(email) {
        const subject = (email.subject || '').toLowerCase();
        const sender = (email.from?.emailAddress?.address || '').toLowerCase();
        const senderName = (email.from?.emailAddress?.name || '').toLowerCase();
        const bodyPreview = (email.bodyPreview || '').toLowerCase();
        
        // Combiner tous les textes pour la recherche
        const allText = `${subject} ${sender} ${senderName} ${bodyPreview}`;
        
        // Patterns évidents de newsletter (étendus)
        const obviousPatterns = [
            // Français
            'newsletter', 'infolettre', 'bulletin', 'lettre d\'information',
            'désabonner', 'desabonner', 'désinscri', 'desinscri',
            'désabonnement', 'desabonnement', 'se désinscrire', 'se desinscrire',
            'préférences email', 'preferences email', 'préférences de communication',
            'preferences de communication', 'gérer vos préférences', 'gerer vos preferences',
            'mettre à jour vos préférences', 'mettre a jour vos preferences',
            'cliquez ici pour', 'si vous ne souhaitez plus',
            'arrêter de recevoir', 'arreter de recevoir', 'ne plus recevoir',
            
            // Anglais
            'unsubscribe', 'opt out', 'opt-out', 'email preferences',
            'manage preferences', 'update preferences', 'notification settings',
            'mailing list', 'stop receiving', 'click here to unsubscribe',
            'if you no longer', 'view in browser', 'view online',
            'this email was sent', 'you are receiving this',
            
            // Marques
            'tommy', 'hilfiger', 'calvin', 'klein', 'cerruti', 'camberabero', 
            'moustache', 'gens de confiance',
            
            // Promotions
            'promo', 'promotion', 'sale', 'soldes', 'offer', 'offre',
            'deal', 'discount', 'reduction', 'réduction', 'remise',
            '%', 'jusqu\'à', 'jusqu\'a', 'up to', 'save', 'économis',
            
            // Emails automatiques
            'noreply', 'no-reply', 'donotreply', 'do-not-reply',
            'marketing@', 'news@', 'newsletter@', 'info@', 'contact@',
            'hello@', 'notification@', 'updates@', 'promotions@'
        ];
        
        // Recherche flexible sans regex
        for (const pattern of obviousPatterns) {
            if (allText.includes(pattern)) {
                if (this.debugMode) {
                    console.log(`[CategoryManager] 🎯 Pattern newsletter trouvé: "${pattern}"`);
                }
                return true;
            }
        }
        
        return false;
    }

    // ================================================
    // CALCUL DE SCORE AMÉLIORÉ
    // ================================================
    calculateScore(content, keywords, categoryId, email = null) {
        let totalScore = 0;
        let hasAbsolute = false;
        const matches = [];
        
        // Utiliser DEUX versions du texte pour la recherche
        const normalizedText = content.text;
        const originalText = content.originalText;
        
        if (this.debugMode && categoryId === 'marketing_news') {
            console.log(`[CategoryManager] 🔍 Calcul score pour ${categoryId}:`);
            console.log('- Longueur texte normalisé:', normalizedText.length);
            console.log('- Longueur texte original:', originalText.length);
            console.log('- Mots-clés absolus:', keywords.absolute?.length);
            console.log('- Mots-clés forts:', keywords.strong?.length);
        }
        
        const categoryBonus = this.getCategoryBonus(categoryId);
        if (categoryBonus > 0) {
            totalScore += categoryBonus;
            matches.push({ keyword: 'category_bonus', type: 'bonus', score: categoryBonus });
        }
        
        // Bonus spécial pour newsletter si candidat évident
        if (categoryId === 'marketing_news' && email && this.isNewsletterCandidate(email)) {
            totalScore += 30;
            matches.push({ keyword: 'newsletter_candidate', type: 'bonus', score: 30 });
            if (this.debugMode) {
                console.log(`[CategoryManager] 🎁 Bonus candidat newsletter: +30`);
            }
        }
        
        // Recherche des exclusions
        if (keywords.exclusions?.length) {
            for (const exclusion of keywords.exclusions) {
                if (this.findInTextImproved(normalizedText, originalText, exclusion)) {
                    totalScore -= 50;
                    matches.push({ keyword: exclusion, type: 'exclusion', score: -50 });
                }
            }
        }
        
        // Recherche des mots-clés absolus
        if (keywords.absolute?.length) {
            for (const keyword of keywords.absolute) {
                if (this.findInTextImproved(normalizedText, originalText, keyword)) {
                    totalScore += 100;
                    hasAbsolute = true;
                    matches.push({ keyword, type: 'absolute', score: 100 });
                    
                    if (this.debugMode && categoryId === 'marketing_news') {
                        console.log(`[CategoryManager] ✅ Mot-clé absolu trouvé: "${keyword}"`);
                    }
                    
                    // Bonus si aussi dans le sujet
                    if (this.findInTextImproved(content.subject, content.originalSubject, keyword)) {
                        totalScore += 50;
                        matches.push({ keyword: keyword + '_subject', type: 'bonus', score: 50 });
                    }
                }
            }
        }
        
        // Recherche des mots-clés forts
        if (!hasAbsolute || totalScore < 150) {
            if (keywords.strong?.length) {
                let strongMatches = 0;
                for (const keyword of keywords.strong) {
                    if (this.findInTextImproved(normalizedText, originalText, keyword)) {
                        const baseScore = categoryId === 'marketing_news' ? 60 : 40;
                        totalScore += baseScore;
                        strongMatches++;
                        matches.push({ keyword, type: 'strong', score: baseScore });
                        
                        if (this.debugMode && categoryId === 'marketing_news') {
                            console.log(`[CategoryManager] 💪 Mot-clé fort trouvé: "${keyword}" (+${baseScore})`);
                        }
                        
                        if (strongMatches >= 3) break;
                    }
                }
                
                if (strongMatches >= 2) {
                    const bonusScore = categoryId === 'marketing_news' ? 50 : 30;
                    totalScore += bonusScore;
                    matches.push({ keyword: 'multiple_strong', type: 'bonus', score: bonusScore });
                }
            }
        }
        
        // Recherche des mots-clés faibles
        if (totalScore < 150 && keywords.weak?.length) {
            let weakMatches = 0;
            for (const keyword of keywords.weak.slice(0, 10)) {
                if (this.findInTextImproved(normalizedText, originalText, keyword)) {
                    const baseScore = categoryId === 'marketing_news' ? 25 : 15;
                    totalScore += baseScore;
                    weakMatches++;
                    matches.push({ keyword, type: 'weak', score: baseScore });
                    
                    if (this.debugMode && categoryId === 'marketing_news' && weakMatches <= 3) {
                        console.log(`[CategoryManager] 🔸 Mot-clé faible trouvé: "${keyword}" (+${baseScore})`);
                    }
                }
            }
        }
        
        const finalScore = Math.max(0, totalScore);
        
        if (this.debugMode && categoryId === 'marketing_news') {
            console.log(`[CategoryManager] 📊 Score final pour ${categoryId}: ${finalScore} (hasAbsolute: ${hasAbsolute})`);
            console.log(`[CategoryManager] 📋 Total matches:`, matches.length);
        }
        
        return { 
            total: finalScore, 
            hasAbsolute, 
            matches 
        };
    }

    // NOUVELLE MÉTHODE: Recherche améliorée dans le texte
    findInTextImproved(normalizedText, originalText, keyword) {
        if (!normalizedText || !keyword) return false;
        
        const keywordLower = keyword.toLowerCase();
        const keywordNormalized = this.normalizeTextFast(keyword);
        
        // Recherche 1: Dans le texte original (avec accents)
        if (originalText && originalText.includes(keywordLower)) {
            return true;
        }
        
        // Recherche 2: Dans le texte normalisé (sans accents)
        if (normalizedText.includes(keywordNormalized)) {
            return true;
        }
        
        // Recherche 3: Avec espaces autour (pour éviter les faux positifs)
        const patterns = [
            ` ${keywordLower} `,
            ` ${keywordLower}`,
            `${keywordLower} `,
            ` ${keywordNormalized} `,
            ` ${keywordNormalized}`,
            `${keywordNormalized} `
        ];
        
        for (const pattern of patterns) {
            if (originalText && originalText.includes(pattern)) return true;
            if (normalizedText.includes(pattern)) return true;
        }
        
        // Recherche 4: Patterns spéciaux pour les URLs et emails
        if (keyword.includes('@') || keyword.includes('-')) {
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            try {
                const regex = new RegExp(escapedKeyword, 'i');
                if (originalText && regex.test(originalText)) return true;
                if (regex.test(normalizedText)) return true;
            } catch (e) {
                // Ignorer les erreurs regex
            }
        }
        
        return false;
    }

    getCategoryBonus(categoryId) {
        const bonuses = {
            'tasks': 15,
            'security': 10,
            'finance': 10,
            'marketing_news': 15, // Augmenté de 10 à 15
            'project': 10,
            'hr': 10
        };
        return bonuses[categoryId] || 0;
    }

    // ================================================
    // INITIALISATION DES MOTS-CLÉS ULTRA-COMPLETS
    // ================================================
    initializeWeightedDetection() {
        this.weightedKeywords = {
            marketing_news: {
                absolute: [
                    // === FRANÇAIS - DÉSINSCRIPTION ===
                    'se désabonner', 'se desabonner', 'désabonner', 'desabonner',
                    'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'désinscription', 'desinscription', 'désabonnement', 'desabonnement',
                    'arrêter de recevoir', 'arreter de recevoir', 'ne plus recevoir',
                    'cesser de recevoir', 'stopper les emails', 'arrêter les emails',
                    'me désabonner', 'me desabonner', 'vous désabonner', 'vous desabonner',
                    'cliquez ici pour vous désabonner', 'cliquez ici pour vous desabonner',
                    'lien de désinscription', 'lien de desinscription',
                    'gérer mes préférences', 'gerer mes preferences',
                    'gérer vos préférences', 'gerer vos preferences',
                    'modifier mes préférences', 'modifier mes preferences',
                    'modifier vos préférences', 'modifier vos preferences',
                    'mettre à jour mes préférences', 'mettre a jour mes preferences',
                    'mettre à jour vos préférences', 'mettre a jour vos preferences',
                    'préférences de communication', 'preferences de communication',
                    'préférences email', 'preferences email', 'préférences d\'email',
                    'paramètres de notification', 'parametres de notification',
                    'centre de préférences', 'centre de preferences',
                    'si vous ne souhaitez plus recevoir', 'si vous ne voulez plus recevoir',
                    'pour ne plus recevoir', 'afin de ne plus recevoir',
                    'cliquez sur ce lien', 'suivez ce lien', 'utilisez ce lien',
                    
                    // === ANGLAIS - UNSUBSCRIBE ===
                    'unsubscribe', 'unsubscribe from', 'unsubscribe here',
                    'opt out', 'opt-out', 'optout', 'opt out here',
                    'email preferences', 'e-mail preferences', 'mail preferences',
                    'manage preferences', 'manage your preferences', 'update preferences',
                    'update your preferences', 'preference center', 'preferences center',
                    'notification settings', 'email settings', 'communication preferences',
                    'mailing list', 'mailing lists', 'email list', 'distribution list',
                    'remove from list', 'remove from mailing list', 'remove me',
                    'stop receiving', 'stop receiving emails', 'stop these emails',
                    'disable these notifications', 'turn off notifications',
                    'click here to unsubscribe', 'unsubscribe link',
                    'if you no longer wish', 'if you no longer want',
                    'to unsubscribe', 'to opt out', 'to stop receiving',
                    'update subscription', 'manage subscription', 'cancel subscription',
                    'subscription preferences', 'subscription settings',
                    
                    // === TERMES NEWSLETTER ===
                    'newsletter', 'newsletters', 'news letter', 'infolettre',
                    'lettre d\'information', 'lettre d\'informations', 'bulletin',
                    'bulletin d\'information', 'email marketing', 'e-mail marketing',
                    'marketing email', 'marketing e-mail', 'promotional email',
                    'email promotionnel', 'e-mail promotionnel',
                    
                    // === EMAILS AUTOMATIQUES ===
                    'cet email a été envoyé', 'cet e-mail a été envoyé',
                    'cet email a ete envoye', 'this email was sent',
                    'this e-mail was sent', 'this message was sent',
                    'vous recevez cet email', 'vous recevez cet e-mail',
                    'you are receiving this email', 'you\'re receiving this',
                    'email automatique', 'e-mail automatique', 'message automatique',
                    'automated email', 'automated message', 'auto-generated',
                    'automatically generated', 'do not reply', 'ne pas répondre',
                    'ne pas repondre', 'donotreply', 'noreply', 'no-reply',
                    
                    // === LÉGAL & COPYRIGHT ===
                    'tous droits réservés', 'tous droits reserves', 'all rights reserved',
                    'copyright', '©', '(c)', 'politique de confidentialité',
                    'politique de confidentialite', 'privacy policy', 'terms of service',
                    'conditions d\'utilisation', 'terms and conditions',
                    
                    // === VISUALISATION ===
                    'voir dans le navigateur', 'voir dans votre navigateur',
                    'afficher dans le navigateur', 'view in browser',
                    'view in your browser', 'view online', 'voir en ligne',
                    'si cet email ne s\'affiche pas', 'if this email doesn\'t display',
                    'having trouble viewing', 'problème d\'affichage',
                    'probleme d\'affichage'
                ],
                strong: [
                    // === MARQUES & COMMERCE ===
                    'tommy hilfiger', 'tommy', 'hilfiger', 'calvin klein', 'calvin', 'klein',
                    'cerruti', 'camberabero', 'big moustache', 'moustache', 'gens de confiance',
                    
                    // === PROMOTIONS FRANÇAIS ===
                    'promo', 'promos', 'promotion', 'promotions', 'promo en cours',
                    'soldes', 'solde', 'grande braderie', 'braderie', 'déstockage',
                    'destockage', 'liquidation', 'vente flash', 'flash sale',
                    'réduction', 'reduction', 'réductions', 'reductions',
                    'remise', 'remises', 'rabais', 'ristourne',
                    'offre spéciale', 'offre speciale', 'offres spéciales',
                    'bon plan', 'bons plans', 'bonne affaire', 'bonnes affaires',
                    'vente privée', 'vente privee', 'ventes privées', 'ventes privees',
                    'prix cassé', 'prix casse', 'prix cassés', 'prix casses',
                    'jusqu\'à', 'jusqu\'a', 'jusque', 'allant jusqu\'à',
                    
                    // === PROMOTIONS ANGLAIS ===
                    'sale', 'sales', 'on sale', 'for sale', 'summer sale', 'winter sale',
                    'offer', 'offers', 'special offer', 'special offers',
                    'deal', 'deals', 'daily deal', 'deal of the day',
                    'discount', 'discounts', 'discounted', 'save up to',
                    'up to', '% off', 'percent off', 'percentage off',
                    'limited time', 'limited offer', 'exclusive offer',
                    'exclusive', 'members only', 'vip', 'early access',
                    'clearance', 'outlet', 'bargain', 'best price',
                    
                    // === APPELS À L'ACTION ===
                    'shop now', 'acheter maintenant', 'buy now', 'commander',
                    'order now', 'commandez', 'discover', 'découvrir',
                    'decouvrir', 'découvrez', 'decouvrez', 'explore',
                    'explorer', 'explorez', 'voir plus', 'see more',
                    'en savoir plus', 'learn more', 'cliquez ici',
                    'click here', 'visitez', 'visit', 'profitez',
                    
                    // === TERMES MARKETING ===
                    'campaign', 'campagne', 'marketing', 'mailing',
                    'mass email', 'bulk email', 'bulk mail', 'broadcast',
                    'annonce', 'announcement', 'communiqué', 'communique',
                    'nouvelle collection', 'new collection', 'nouveautés',
                    'nouveautes', 'new arrivals', 'latest', 'dernières',
                    'dernieres', 'tendances', 'trends', 'must have',
                    
                    // === ADRESSES EMAIL MARKETING ===
                    'newsletter@', 'news@', 'info@', 'contact@', 'hello@',
                    'marketing@', 'promo@', 'promotions@', 'noreply@',
                    'no-reply@', 'donotreply@', 'notification@', 'update@',
                    'updates@', 'announce@', 'list@', 'mailinglist@'
                ],
                weak: [
                    // === COMMERCE GÉNÉRAL ===
                    'shop', 'boutique', 'store', 'magasin', 'e-shop',
                    'eshop', 'e-commerce', 'ecommerce', 'catalogue',
                    'catalog', 'collection', 'collections', 'gamme',
                    'produit', 'produits', 'product', 'products',
                    'article', 'articles', 'item', 'items',
                    
                    // === MODE & STYLE ===
                    'fashion', 'mode', 'style', 'tendance', 'trend',
                    'look', 'outfit', 'tenue', 'vêtement', 'vetement',
                    'clothing', 'clothes', 'wear', 'apparel',
                    'accessoire', 'accessoires', 'accessories',
                    
                    // === TERMES GÉNÉRAUX ===
                    'update', 'updates', 'mise à jour', 'mise a jour',
                    'news', 'actualité', 'actualite', 'actualités',
                    'nouveauté', 'nouveaute', 'nouveau', 'nouvelle',
                    'new', 'latest', 'récent', 'recent',
                    'information', 'info', 'infos', 'message',
                    'communication', 'annonce', 'avis', 'notice',
                    
                    // === FRÉQUENCE ===
                    'hebdomadaire', 'weekly', 'mensuel', 'mensuelle',
                    'monthly', 'quotidien', 'quotidienne', 'daily',
                    'régulier', 'regulier', 'regular', 'périodique',
                    'periodique', 'periodic', 'fréquent', 'frequent',
                    
                    // === MARQUES GÉNÉRIQUES ===
                    'brand', 'marque', 'luxury', 'luxe', 'premium',
                    'exclusif', 'exclusive', 'designer', 'créateur',
                    'createur', 'officiel', 'official', 'authentique',
                    
                    // === RÉSEAUX SOCIAUX ===
                    'facebook', 'instagram', 'twitter', 'linkedin',
                    'youtube', 'pinterest', 'tiktok', 'social',
                    'suivez-nous', 'follow us', 'rejoignez-nous',
                    'join us', 'connectez-vous', 'connect'
                ],
                exclusions: [
                    // Éviter les faux positifs avec les emails transactionnels
                    'confirmation de commande', 'order confirmation',
                    'votre commande', 'your order', 'numéro de commande',
                    'order number', 'facture', 'invoice', 'reçu', 'receipt',
                    'livraison', 'delivery', 'shipping', 'expédition',
                    'expedition', 'suivi', 'tracking', 'colis', 'package',
                    'paiement', 'payment', 'transaction', 'virement',
                    'remboursement', 'refund', 'retour', 'return'
                ]
            },
            security: {
                absolute: [
                    'alerte de connexion', 'login alert', 'new sign-in', 'nouvelle connexion',
                    'code de vérification', 'verification code', 'two-factor', 'authentification',
                    'password reset', 'réinitialisation mot de passe', 'security alert',
                    'alerte sécurité', 'alerte securite', 'suspicious activity',
                    'activité suspecte', 'activite suspecte', 'connexion inhabituelle',
                    'unusual activity', 'verify your identity', 'vérifier votre identité'
                ],
                strong: ['sécurité', 'security', 'authentification', 'authentication', 'password', 'mot de passe'],
                weak: ['compte', 'account', 'login', 'connexion'],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },
            tasks: {
                absolute: [
                    'action required', 'action requise', 'urgent', 'urgence',
                    'deadline', 'échéance', 'echeance', 'date limite',
                    'à faire avant', 'a faire avant', 'must be completed',
                    'doit être fait', 'doit etre fait', 'immediate attention',
                    'attention immédiate', 'attention immediate', 'asap',
                    'dès que possible', 'des que possible', 'by end of day',
                    'avant la fin de journée', 'response needed', 'réponse attendue'
                ],
                strong: [
                    'urgent', 'urgency', 'urgence', 'priority', 'priorité', 'priorite',
                    'important', 'critique', 'critical', 'deadline', 'échéance',
                    'task', 'tâche', 'tache', 'action', 'todo', 'to-do', 'à faire',
                    'a faire', 'assignment', 'mission', 'devoir', 'obligation'
                ],
                weak: [
                    'demande', 'request', 'besoin', 'need', 'require', 'nécessaire',
                    'necessaire', 'attente', 'waiting', 'pending', 'en cours',
                    'rappel', 'reminder', 'suite à donner', 'follow up'
                ],
                exclusions: ['newsletter', 'marketing', 'promotion', 'unsubscribe']
            },
            meetings: {
                absolute: [
                    'invitation à une réunion', 'invitation a une reunion', 'meeting request',
                    'demande de réunion', 'demande de reunion', 'réunion planifiée',
                    'reunion planifiee', 'scheduled meeting', 'teams meeting',
                    'zoom meeting', 'google meet', 'skype meeting', 'webex',
                    'rendez-vous', 'rendez vous', 'appointment', 'rdv',
                    'conférence', 'conference', 'visioconférence', 'visioconference',
                    'video call', 'appel vidéo', 'appel video'
                ],
                strong: [
                    'meeting', 'réunion', 'reunion', 'schedule', 'planning',
                    'calendrier', 'calendar', 'agenda', 'disponibilité', 'disponibilite',
                    'availability', 'slot', 'créneau', 'creneau', 'horaire'
                ],
                weak: [
                    'date', 'heure', 'time', 'when', 'quand', 'durée', 'duree',
                    'duration', 'participant', 'attendee', 'invité', 'invite'
                ],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },
            commercial: {
                absolute: [
                    'devis', 'quotation', 'quote', 'proposition commerciale',
                    'commercial proposal', 'business proposal', 'offre commerciale',
                    'contrat', 'contract', 'accord commercial', 'agreement',
                    'bon de commande', 'purchase order', 'po number',
                    'opportunité', 'opportunite', 'opportunity', 'lead',
                    'prospect', 'nouveau client', 'new customer', 'deal'
                ],
                strong: [
                    'client', 'customer', 'commercial', 'business', 'vente',
                    'sale', 'affaire', 'deal', 'négociation', 'negociation',
                    'negotiation', 'partenariat', 'partnership', 'collaboration'
                ],
                weak: [
                    'offre', 'offer', 'proposition', 'proposal', 'tarif',
                    'price', 'prix', 'budget', 'investissement', 'investment'
                ],
                exclusions: ['newsletter', 'marketing', 'promotion', 'soldes']
            },
            finance: {
                absolute: [
                    'facture', 'invoice', 'facture n°', 'invoice number',
                    'paiement', 'payment', 'virement', 'wire transfer',
                    'transaction', 'reçu', 'recu', 'receipt', 'relevé',
                    'releve', 'statement', 'compte rendu financier',
                    'financial statement', 'rapport financier', 'financial report',
                    'déclaration', 'declaration', 'tax', 'taxe', 'impôt'
                ],
                strong: [
                    'montant', 'amount', 'total', 'somme', 'sum', 'solde',
                    'balance', 'débit', 'debit', 'crédit', 'credit',
                    'échéance', 'echeance', 'due date', 'comptabilité',
                    'comptabilite', 'accounting', 'finance', 'financier'
                ],
                weak: [
                    'euro', 'eur', '€', 'dollar', 'usd', '$', 'prix',
                    'price', 'coût', 'cout', 'cost', 'frais', 'fee',
                    'charge', 'dépense', 'depense', 'expense'
                ],
                exclusions: ['newsletter', 'marketing', 'promotion', 'offre spéciale']
            },
            project: {
                absolute: [
                    'projet', 'project', 'nom du projet', 'project name',
                    'chef de projet', 'project manager', 'gestion de projet',
                    'project management', 'milestone', 'jalon', 'livrable',
                    'deliverable', 'sprint', 'iteration', 'backlog',
                    'roadmap', 'feuille de route', 'gantt', 'planning projet'
                ],
                strong: [
                    'projet', 'project', 'développement', 'developpement',
                    'development', 'phase', 'étape', 'etape', 'stage',
                    'avancement', 'progress', 'progression', 'statut',
                    'status', 'mise à jour', 'mise a jour', 'update'
                ],
                weak: [
                    'équipe', 'equipe', 'team', 'ressource', 'resource',
                    'planning', 'plan', 'objectif', 'objective', 'but',
                    'goal', 'délai', 'delai', 'timeline', 'calendrier'
                ],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },
            reminders: {
                absolute: [
                    'rappel', 'reminder', 'n\'oubliez pas', 'n\'oubliez pas',
                    'don\'t forget', 'gentle reminder', 'rappel amical',
                    'friendly reminder', 'relance', 'follow up', 'follow-up',
                    'suivi', 'comme convenu', 'as agreed', 'as discussed',
                    'comme discuté', 'comme discute', 'suite à notre',
                    'suite a notre', 'following our'
                ],
                strong: [
                    'rappel', 'reminder', 'relance', 'follow', 'suivi',
                    'encore', 'again', 'toujours', 'still', 'attente',
                    'waiting', 'pending', 'en attente', 'outstanding'
                ],
                weak: [
                    'précédent', 'precedent', 'previous', 'dernier', 'last',
                    'mentionné', 'mentionne', 'mentioned', 'évoqué', 'evoque',
                    'discussed', 'parlé', 'parle', 'talked'
                ],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            support: {
                absolute: [
                    'ticket', 'ticket #', 'ticket n°', 'ticket number',
                    'case number', 'numéro de dossier', 'numero de dossier',
                    'support ticket', 'ticket de support', 'incident',
                    'incident #', 'problème résolu', 'probleme resolu',
                    'issue resolved', 'résolution', 'resolution', 'helpdesk',
                    'help desk', 'service desk', 'centre d\'aide'
                ],
                strong: [
                    'support', 'assistance', 'aide', 'help', 'technique',
                    'technical', 'problème', 'probleme', 'problem', 'issue',
                    'bug', 'erreur', 'error', 'dysfonctionnement', 'malfunction'
                ],
                weak: [
                    'solution', 'résoudre', 'resoudre', 'resolve', 'fix',
                    'réparer', 'reparer', 'repair', 'corriger', 'correct',
                    'dépannage', 'depannage', 'troubleshooting'
                ],
                exclusions: ['newsletter', 'marketing', 'promotion']
            },
            hr: {
                absolute: [
                    'bulletin de paie', 'bulletin de salaire', 'fiche de paie',
                    'payslip', 'pay slip', 'salary slip', 'contrat de travail',
                    'employment contract', 'work contract', 'congés', 'conges',
                    'vacation', 'leave', 'absence', 'rtt', 'cp',
                    'évaluation', 'evaluation', 'performance review', 'entretien',
                    'entretien annuel', 'annual review', 'offre d\'emploi',
                    'offre d\'emploi', 'job offer', 'job posting'
                ],
                strong: [
                    'rh', 'hr', 'human resources', 'ressources humaines',
                    'salaire', 'salary', 'paie', 'paye', 'pay', 'payroll',
                    'emploi', 'employment', 'job', 'poste', 'position',
                    'recrutement', 'recruitment', 'hiring', 'embauche'
                ],
                weak: [
                    'employé', 'employe', 'employee', 'salarié', 'salarie',
                    'staff', 'personnel', 'équipe', 'equipe', 'team',
                    'collègue', 'collegue', 'colleague', 'coworker'
                ],
                exclusions: ['newsletter', 'promotion', 'marketing']
            },
            internal: {
                absolute: [
                    'all staff', 'tout le personnel', 'tous les employés',
                    'tous les employes', 'company wide', 'à toute l\'entreprise',
                    'a toute l\'entreprise', 'company announcement', 'annonce entreprise',
                    'annonce interne', 'internal announcement', 'memo interne',
                    'internal memo', 'mémo interne', 'memo interne',
                    'note de service', 'service note', 'communication interne',
                    'internal communication', 'to all team', 'à toute l\'équipe',
                    'a toute l\'equipe'
                ],
                strong: [
                    'internal', 'interne', 'company', 'entreprise', 'société',
                    'societe', 'organisation', 'organization', 'corporate',
                    'annonce', 'announcement', 'mémo', 'memo', 'note',
                    'communication', 'information', 'directive', 'policy'
                ],
                weak: [
                    'team', 'équipe', 'equipe', 'staff', 'personnel',
                    'employé', 'employe', 'employee', 'département', 'departement',
                    'department', 'service', 'division', 'bureau', 'office'
                ],
                exclusions: ['newsletter', 'marketing', 'external', 'externe', 'client', 'customer']
            },
            notifications: {
                absolute: [
                    'do not reply', 'ne pas répondre', 'ne pas repondre',
                    'no reply', 'noreply', 'no-reply', 'donotreply',
                    'automated message', 'message automatique', 'message automatisé',
                    'automated email', 'email automatique', 'e-mail automatique',
                    'system notification', 'notification système', 'notification systeme',
                    'auto-generated', 'généré automatiquement', 'genere automatiquement',
                    'this is an automated', 'ceci est un message automatique'
                ],
                strong: [
                    'automated', 'automatique', 'automatic', 'automatisé',
                    'automatise', 'system', 'système', 'systeme', 'notification',
                    'alert', 'alerte', 'automatic', 'bot', 'robot'
                ],
                weak: [
                    'notification', 'notice', 'avis', 'info', 'information',
                    'message', 'email', 'mail', 'update', 'mise à jour',
                    'mise a jour', 'changement', 'change', 'modification'
                ],
                exclusions: ['urgent', 'action required', 'deadline', 'réponse requise']
            },
            cc: {
                absolute: [
                    'copie pour information', 'for your information', 'fyi',
                    'pour info', 'pour information', 'en copie', 'in copy',
                    'cc:', 'courtesy copy', 'copie de courtoisie', 'copie carbone',
                    'carbon copy', 'également envoyé à', 'also sent to',
                    'copie à', 'copy to', 'pour votre information'
                ],
                strong: [
                    'information', 'copie', 'copy', 'courtoisie', 'courtesy',
                    'fyi', 'cc', 'bcc', 'cci', 'pour info', 'notifier',
                    'notify', 'informer', 'inform', 'partager', 'share'
                ],
                weak: [
                    'info', 'note', 'savoir', 'know', 'aware', 'connaissance',
                    'knowledge', 'référence', 'reference', 'mentionné',
                    'mentioned', 'cité', 'cited', 'inclus', 'included'
                ],
                exclusions: ['urgent', 'action required', 'deadline', 'facture', 'invoice', 'paiement']
            }
        };

        console.log('[CategoryManager] 🔑 Mots-clés initialisés avec détection newsletter ULTRA-RENFORCÉE');
    }

    // ================================================
    // AUTRES MÉTHODES (inchangées mais nécessaires)
    // ================================================
    
    // Cache système
    createCacheKey(email) {
        const content = this.extractCompleteContent(email);
        const key = `${email.from?.emailAddress?.address || ''}|${email.subject || ''}|${content.text.substring(0, 100)}`;
        return this.hashString(key);
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    getCachedAnalysis(email) {
        const key = this.createCacheKey(email);
        const cached = this.analysisCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            this.cacheStats.hits++;
            return cached.result;
        }
        
        this.cacheStats.misses++;
        return null;
    }

    setCachedAnalysis(email, result) {
        const key = this.createCacheKey(email);
        
        if (this.analysisCache.size >= this.cacheMaxSize) {
            const firstKey = this.analysisCache.keys().next().value;
            this.analysisCache.delete(firstKey);
        }
        
        this.analysisCache.set(key, {
            result: { ...result },
            timestamp: Date.now()
        });
    }

    invalidateCache() {
        this.analysisCache.clear();
        this.cacheStats = { hits: 0, misses: 0 };
        console.log('[CategoryManager] 🧹 Cache invalidé');
    }

    // Vérifications
    isSpamEmail(email) {
        if (email.parentFolderId?.toLowerCase().includes('junk')) return true;
        if (email.categories?.some(cat => cat.toLowerCase().includes('spam'))) return true;
        return false;
    }

    isGloballyExcluded(content, email) {
        const exclusions = this.settings.categoryExclusions;
        if (!exclusions) return false;
        
        if (exclusions.domains?.length) {
            return exclusions.domains.some(domain => content.domain.includes(domain.toLowerCase()));
        }
        return false;
    }

    isPersonalEmail(content) {
        const personalPatterns = ['papa', 'maman', 'bises', 'famille', 'chéri', 'cherie', 'bisous'];
        const text = content.originalText || content.text;
        return personalPatterns.some(pattern => text.includes(pattern));
    }

    isMainRecipient(email) {
        return email.toRecipients?.length > 0;
    }

    isInCC(email) {
        return email.ccRecipients?.length > 0;
    }

    analyzeCC(email, content) {
        if (!this.shouldDetectCC()) return null;
        
        const isMainRecipient = this.isMainRecipient(email);
        const isInCC = this.isInCC(email);
        
        if (isInCC && !isMainRecipient) {
            if (content.originalText.includes('unsubscribe') || 
                content.originalText.includes('newsletter') ||
                content.originalText.includes('désabonner')) {
                return {
                    category: 'marketing_news',
                    score: 100,
                    confidence: 0.90,
                    isCC: true
                };
            }
            
            return {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                isCC: true
            };
        }
        
        return null;
    }

    // Analyse des catégories
    analyzeAllCategories(content, email = null) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        if (this.debugMode) {
            console.log('[CategoryManager] 🔍 Analyse avec catégories actives:', activeCategories);
        }
        
        // Forcer l'analyse de marketing_news en premier si c'est un candidat newsletter
        const isNewsletterCandidate = email ? this.isNewsletterCandidate(email) : false;
        
        let categoriesByPriority;
        if (isNewsletterCandidate) {
            // Mettre marketing_news en premier
            categoriesByPriority = activeCategories
                .filter(catId => catId === 'marketing_news')
                .concat(activeCategories.filter(catId => catId !== 'marketing_news'))
                .map(catId => ({ id: catId, priority: catId === 'marketing_news' ? 1000 : (this.categories[catId]?.priority || 50) }));
        } else {
            categoriesByPriority = activeCategories
                .map(catId => ({ id: catId, priority: this.categories[catId]?.priority || 50 }))
                .sort((a, b) => b.priority - a.priority);
        }
        
        for (const { id: categoryId } of categoriesByPriority) {
            const keywords = this.weightedKeywords[categoryId];
            if (!keywords || this.isEmptyKeywords(keywords)) {
                continue;
            }
            
            const score = this.calculateScore(content, keywords, categoryId, email);
            
            if (this.debugMode && (score.total > 0 || categoryId === 'marketing_news')) {
                console.log(`[CategoryManager] 📊 ${categoryId}: score=${score.total}, matches:`, score.matches.length);
            }
            
            if (score.total > 0) {
                results[categoryId] = {
                    category: categoryId,
                    score: score.total,
                    hasAbsolute: score.hasAbsolute,
                    matches: score.matches,
                    confidence: this.calculateConfidence(score),
                    priority: this.categories[categoryId]?.priority || 50
                };
                
                // Si c'est une newsletter avec un score élevé, arrêt anticipé
                if (categoryId === 'marketing_news' && score.total >= 100) {
                    if (this.debugMode) {
                        console.log(`[CategoryManager] 🎯 Newsletter détectée, arrêt anticipé (score: ${score.total})`);
                    }
                    break;
                }
                
                if (score.hasAbsolute && score.total >= 150) {
                    break;
                }
            }
        }
        
        const finalResult = this.selectByPriorityWithThreshold(results);
        
        return finalResult;
    }

    selectByPriorityWithThreshold(results) {
        const MIN_SCORE_THRESHOLD = 20; // Abaissé de 25 à 20 pour newsletter
        const MIN_CONFIDENCE_THRESHOLD = 0.35; // Abaissé de 0.4 à 0.35
        
        const validResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD);
        
        if (validResults.length === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'below_threshold'
            };
        }
        
        validResults.sort((a, b) => {
            // Priorité absolue pour marketing_news si score > 40
            if (a.category === 'marketing_news' && a.score >= 40) {
                return -1;
            }
            if (b.category === 'marketing_news' && b.score >= 40) {
                return 1;
            }
            
            if (a.hasAbsolute !== b.hasAbsolute) {
                return b.hasAbsolute - a.hasAbsolute;
            }
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return b.score - a.score;
        });
        
        const best = validResults[0];
        return {
            category: best.category,
            score: best.score,
            confidence: best.confidence,
            matchedPatterns: best.matches,
            hasAbsolute: best.hasAbsolute
        };
    }

    // Utilitaires
    isEmptyKeywords(keywords) {
        return !keywords || (
            (!keywords.absolute || keywords.absolute.length === 0) &&
            (!keywords.strong || keywords.strong.length === 0) &&
            (!keywords.weak || keywords.weak.length === 0)
        );
    }

    calculateConfidence(score) {
        if (score.hasAbsolute) return 0.95;
        if (score.total >= 200) return 0.90;
        if (score.total >= 150) return 0.85;
        if (score.total >= 100) return 0.80;
        if (score.total >= 80) return 0.75;
        if (score.total >= 60) return 0.70;
        if (score.total >= 40) return 0.60;
        if (score.total >= 25) return 0.50;
        if (score.total >= 20) return 0.40; // Nouveau seuil pour newsletter
        return 0.35;
    }

    // ================================================
    // SETTINGS ET CONFIGURATION
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

    initializeCategories() {
        this.categories = {
            marketing_news: {
                name: 'Marketing & News',
                icon: '📰',
                color: '#8b5cf6',
                description: 'Newsletters et promotions',
                priority: 100,
                isCustom: false
            },
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 90,
                isCustom: false
            },
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
            hr: {
                name: 'RH',
                icon: '👥',
                color: '#10b981',
                description: 'Ressources humaines',
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
                priority: 50,
                isCustom: false
            }
        };
        
        this.isInitialized = true;
    }

    initializeFilters() {
        this.loadCategoryFilters();
        console.log('[CategoryManager] Filtres initialisés');
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
                    this.weightedKeywords[id] = {
                        absolute: [...(category.keywords.absolute || [])],
                        strong: [...(category.keywords.strong || [])],
                        weak: [...(category.keywords.weak || [])],
                        exclusions: [...(category.keywords.exclusions || [])]
                    };
                } else {
                    this.weightedKeywords[id] = {
                        absolute: [],
                        strong: [],
                        weak: [],
                        exclusions: []
                    };
                }
                
                const totalKeywords = this.getTotalKeywordsCount(id);
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" (${id}): ${totalKeywords} mots-clés`);
            });
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    // ================================================
    // EVENT LISTENERS ET SYNCHRONISATION  
    // ================================================
    setupEventListeners() {
        if (this.eventListenersSetup) return;

        this.externalSettingsChangeHandler = (event) => {
            if (event.detail?.source === 'CategoryManager') return;
            
            const { type, value } = event.detail;
            console.log(`[CategoryManager] Reçu changement externe: ${type}`, value);
            
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
        
        console.log('[CategoryManager] Event listeners configurés');
    }

    startOptimizedSync() {
        setInterval(() => {
            this.processSettingsChanges();
        }, 5000);
        
        this.setupImmediateSync();
    }

    setupImmediateSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'categorySettings') {
                console.log('[CategoryManager] 🔄 Changement localStorage détecté');
                this.reloadSettingsFromStorage();
                this.invalidateCache();
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
        
        this.saveSettingsToStorage();
        
        if (notifyModules !== false) {
            this.notifySpecificModules(type, value);
            this.notifyAllModules(type, value);
        }
    }

    notifySpecificModules(type, value) {
        console.log(`[CategoryManager] 📢 Notification spécialisée: ${type}`);
        
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
            }
        }
        
        if (window.aiTaskAnalyzer) {
            if (type === 'taskPreselectedCategories') {
                if (typeof window.aiTaskAnalyzer.updatePreselectedCategories === 'function') {
                    window.aiTaskAnalyzer.updatePreselectedCategories(value);
                }
            }
        }
        
        if (window.pageManager) {
            if (typeof window.pageManager.handleSettingsChanged === 'function') {
                window.pageManager.handleSettingsChanged({ settings: this.settings });
            }
        }
    }

    notifyAllModules(type, value) {
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
        
        this.changeListeners.forEach(listener => {
            try {
                listener(type, value, this.settings);
            } catch (error) {
                console.error('[CategoryManager] Erreur listener:', error);
            }
        });
    }

    // ================================================
    // API PUBLIQUE
    // ================================================
    updateSettings(newSettings, notifyModules = true) {
        console.log('[CategoryManager] 📝 updateSettings appelé:', newSettings);
        
        this.syncQueue.push({
            type: 'fullSettings',
            value: newSettings,
            notifyModules,
            timestamp: Date.now()
        });
        
        if (!this.syncInProgress) {
            this.processSettingsChanges();
        }
    }

    updateTaskPreselectedCategories(categories, notifyModules = true) {
        console.log('[CategoryManager] 📋 updateTaskPreselectedCategories:', categories);
        
        const normalizedCategories = Array.isArray(categories) ? [...categories] : [];
        
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

    updateCategoryKeywords(categoryId, keywords) {
        console.log(`[CategoryManager] 🔑 Mise à jour mots-clés pour ${categoryId}:`, keywords);
        
        if (this.weightedKeywords[categoryId]) {
            this.weightedKeywords[categoryId] = {
                absolute: [...(keywords.absolute || [])],
                strong: [...(keywords.strong || [])],
                weak: [...(keywords.weak || [])],
                exclusions: [...(keywords.exclusions || [])]
            };
            
            if (this.customCategories[categoryId]) {
                this.customCategories[categoryId].keywords = this.weightedKeywords[categoryId];
                this.saveCustomCategories();
            }
            
            this.invalidateCache();
            
            console.log('[CategoryManager] ✅ Mots-clés mis à jour');
        }
    }

    updateCategoryFilters(categoryId, filters) {
        console.log(`[CategoryManager] 🔍 Mise à jour filtres pour ${categoryId}:`, filters);
        
        if (!this.categoryFilters) {
            this.categoryFilters = {};
        }
        
        this.categoryFilters[categoryId] = {
            includeDomains: [...(filters.includeDomains || [])],
            includeEmails: [...(filters.includeEmails || [])],
            excludeDomains: [...(filters.excludeDomains || [])],
            excludeEmails: [...(filters.excludeEmails || [])]
        };
        
        this.saveCategoryFilters();
        this.invalidateCache();
        
        console.log('[CategoryManager] ✅ Filtres mis à jour');
    }

    // ================================================
    // GETTERS
    // ================================================
    getSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    getTaskPreselectedCategories() {
        const now = Date.now();
        const CACHE_DURATION = 10000;
        
        if (this._taskCategoriesCache && 
            this._taskCategoriesCacheTime && 
            (now - this._taskCategoriesCacheTime) < CACHE_DURATION) {
            return [...this._taskCategoriesCache];
        }
        
        const categories = this.settings.taskPreselectedCategories || [];
        
        this._taskCategoriesCache = [...categories];
        this._taskCategoriesCacheTime = now;
        
        if (!this._lastLoggedTaskCategories || 
            JSON.stringify(this._lastLoggedTaskCategories) !== JSON.stringify(categories)) {
            console.log('[CategoryManager] 📋 Catégories tâches mises à jour:', categories);
            this._lastLoggedTaskCategories = [...categories];
        }
        
        return [...categories];
    }

    getActiveCategories() {
        if (!this.settings.activeCategories) {
            const allCategories = Object.keys(this.categories);
            // Éviter la boucle infinie - logguer qu'une fois
            if (!this._loggedAllCategories) {
                console.log('[CategoryManager] 🔧 Toutes catégories actives par défaut:', allCategories);
                this._loggedAllCategories = true;
            }
            return allCategories;
        }
        
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

    getCategories() {
        return this.categories;
    }

    getCustomCategories() {
        return this.customCategories;
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

    getCategoryKeywords(categoryId) {
        return this.weightedKeywords[categoryId] || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
    }

    getCategoryFilters(categoryId) {
        return this.categoryFilters?.[categoryId] || {
            includeDomains: [],
            includeEmails: [],
            excludeDomains: [],
            excludeEmails: []
        };
    }

    getTotalKeywordsCount(categoryId) {
        const keywords = this.weightedKeywords[categoryId];
        if (!keywords) return 0;
        
        return (keywords.absolute?.length || 0) + 
               (keywords.strong?.length || 0) + 
               (keywords.weak?.length || 0) + 
               (keywords.exclusions?.length || 0);
    }

    // ================================================
    // GESTION DES CATÉGORIES PERSONNALISÉES
    // ================================================
    createCustomCategory(categoryData) {
        console.log('[CategoryManager] 🆕 Création catégorie personnalisée:', categoryData);
        
        const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newCategory = {
            ...categoryData,
            id,
            isCustom: true,
            priority: categoryData.priority || 30,
            keywords: categoryData.keywords || {
                absolute: [],
                strong: [],
                weak: [],
                exclusions: []
            }
        };
        
        this.categories[id] = newCategory;
        this.customCategories[id] = newCategory;
        this.weightedKeywords[id] = newCategory.keywords;
        
        this.saveCustomCategories();
        this.invalidateCache();
        
        console.log('[CategoryManager] ✅ Catégorie créée:', id);
        
        return { id, ...newCategory };
    }

    deleteCustomCategory(categoryId) {
        console.log('[CategoryManager] 🗑️ Suppression catégorie:', categoryId);
        
        if (!this.customCategories[categoryId]) {
            console.warn('[CategoryManager] Catégorie non trouvée ou non personnalisée');
            return false;
        }
        
        delete this.categories[categoryId];
        delete this.customCategories[categoryId];
        delete this.weightedKeywords[categoryId];
        delete this.categoryFilters?.[categoryId];
        
        if (this.settings.activeCategories?.includes(categoryId)) {
            this.settings.activeCategories = this.settings.activeCategories.filter(id => id !== categoryId);
            this.saveSettingsToStorage();
        }
        
        if (this.settings.taskPreselectedCategories?.includes(categoryId)) {
            this.settings.taskPreselectedCategories = this.settings.taskPreselectedCategories.filter(id => id !== categoryId);
            this.saveSettingsToStorage();
        }
        
        this.saveCustomCategories();
        this.saveCategoryFilters();
        this.invalidateCache();
        
        console.log('[CategoryManager] ✅ Catégorie supprimée');
        
        return true;
    }

    // ================================================
    // SAUVEGARDE
    // ================================================
    saveSettingsToStorage() {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(this.settings));
            console.log('[CategoryManager] 💾 Settings sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde paramètres:', error);
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

    saveCategoryFilters() {
        try {
            localStorage.setItem('categoryFilters', JSON.stringify(this.categoryFilters));
            console.log('[CategoryManager] 💾 Filtres sauvegardés');
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur sauvegarde filtres:', error);
        }
    }

    reloadSettingsFromStorage() {
        const oldSettings = { ...this.settings };
        this.settings = this.loadSettings();
        
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

    // ================================================
    // LISTENERS
    // ================================================
    addChangeListener(callback) {
        this.changeListeners.add(callback);
        console.log(`[CategoryManager] 👂 Listener ajouté (${this.changeListeners.size} total)`);
        
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    removeChangeListener(callback) {
        this.changeListeners.delete(callback);
    }

    invalidateTaskCategoriesCache() {
        this._taskCategoriesCache = null;
        this._taskCategoriesCacheTime = 0;
        console.log('[CategoryManager] 🔄 Cache des catégories tâches invalidé');
    }

    // ================================================
    // PERFORMANCE
    // ================================================
    getPerformanceStats() {
        return {
            cache: {
                size: this.analysisCache.size,
                hits: this.cacheStats.hits,
                misses: this.cacheStats.misses,
                hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100
            },
            compiledPatterns: this.compiledPatterns.size,
            batchSize: this.batchSize,
            cacheMaxSize: this.cacheMaxSize
        };
    }

    // ================================================
    // EVENTS
    // ================================================
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
    // MÉTHODES DE DEBUG POUR NEWSLETTER
    // ================================================
    
    // Méthode de test pour newsletter spécifique
    testNewsletterDetection(subject, sender, bodyPreview = '') {
        console.group(`[CategoryManager] 🧪 TEST NEWSLETTER DETECTION`);
        
        const testEmail = {
            subject: subject,
            from: { emailAddress: { address: sender, name: '' } },
            bodyPreview: bodyPreview,
            toRecipients: [{ emailAddress: { address: 'test@example.com' } }],
            ccRecipients: [],
            body: { content: bodyPreview }
        };
        
        console.log('📧 Email de test:', testEmail);
        
        const isCandidate = this.isNewsletterCandidate(testEmail);
        console.log('🎯 Est candidat newsletter:', isCandidate);
        
        const content = this.extractCompleteContent(testEmail);
        console.log('📄 Contenu extrait:', content);
        
        const keywords = this.weightedKeywords.marketing_news;
        console.log('🔑 Mots-clés marketing_news:', {
            absolute: keywords.absolute?.length,
            strong: keywords.strong?.length,
            weak: keywords.weak?.length
        });
        
        const score = this.calculateScore(content, keywords, 'marketing_news', testEmail);
        console.log('📊 Score calculé:', score);
        
        const result = this.analyzeEmail(testEmail);
        console.log('🏆 Résultat final:', result);
        
        console.groupEnd();
        
        return result;
    }
    
    // Méthode pour afficher les statistiques de détection
    getNewsletterDetectionStats() {
        const keywords = this.weightedKeywords.marketing_news;
        return {
            totalAbsolute: keywords.absolute?.length || 0,
            totalStrong: keywords.strong?.length || 0,
            totalWeak: keywords.weak?.length || 0,
            totalExclusions: keywords.exclusions?.length || 0,
            totalKeywords: this.getTotalKeywordsCount('marketing_news'),
            sampleAbsolute: keywords.absolute?.slice(0, 5) || [],
            sampleStrong: keywords.strong?.slice(0, 5) || [],
            debugMode: this.debugMode
        };
    }
    
    // Méthode pour désactiver les logs debug
    disableDebugMode() {
        this.debugMode = false;
        console.log('[CategoryManager] 🔇 Mode debug désactivé');
    }
    
    // Méthode pour activer les logs debug
    enableDebugMode() {
        this.debugMode = true;
        console.log('[CategoryManager] 🔊 Mode debug activé');
    }

    // ================================================
    // NETTOYAGE
    // ================================================
    cleanup() {
        this.analysisCache.clear();
        this.compiledPatterns.clear();
        
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        if (this.externalSettingsChangeHandler) {
            window.removeEventListener('settingsChanged', this.externalSettingsChangeHandler);
        }
        
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
}

// ================================================
// INITIALISATION GLOBALE AVEC MÉTHODES DE TEST
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    window.categoryManager.destroy?.();
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v23.0 avec détection newsletter ultra-renforcée...');
window.categoryManager = new CategoryManager();

// ================================================
// MÉTHODES GLOBALES DE TEST NEWSLETTER
// ================================================

// Test rapide pour les emails problématiques
window.testNewsletterEmail = function(subject, sender, body) {
    return window.categoryManager.testNewsletterDetection(
        subject || 'Test newsletter',
        sender || 'newsletter@example.com',
        body || 'Cliquez ici pour vous désabonner. Si vous ne souhaitez plus recevoir nos emails, mettez à jour vos préférences de communication.'
    );
};

// Test des emails des documents
window.testRealEmails = function() {
    console.group('🧪 TEST DES EMAILS RÉELS');
    
    // Email 1: Investissement Locatif
    const email1 = window.categoryManager.testNewsletterDetection(
        '✅ TOMMY HILFIGER boxers jusqu\'à -54%, CAMBERABERO, CALVIN KLEIN underwear, CERRUTI 1881 parfums, BIG MOUSTACHE soins...',
        'mz@investissement-locatif.com',
        'Comment VRAIMENT acheter un bien dans les 6 prochains mois... Rejoignez nous en direct maintenant. Pour ne plus recevoir nos communications, vous pouvez vous désabonner en cliquant sur ce lien.'
    );
    console.log('Email 1 (Investissement Locatif):', email1);
    
    // Email 2: Gens de Confiance
    const email2 = window.categoryManager.testNewsletterDetection(
        '🌿 Fraîchement publiées… des maisons qui sentent bon les vacances !',
        'hello@news.gensdeconfiance.com',
        'Ne laissez pas filer ces nouvelles locations ! Découvrez notre sélection d\'annonces tout juste partagées sur Gens de Confiance. Si vous souhaitez vous désinscrire de notre newsletter, cliquez ici'
    );
    console.log('Email 2 (Gens de Confiance):', email2);
    
    console.groupEnd();
};

// Afficher les stats de détection newsletter
window.getNewsletterStats = function() {
    const stats = window.categoryManager.getNewsletterDetectionStats();
    console.table(stats);
    return stats;
};

// Toggle debug mode
window.toggleNewsletterDebug = function() {
    if (window.categoryManager.debugMode) {
        window.categoryManager.disableDebugMode();
    } else {
        window.categoryManager.enableDebugMode();
    }
    return window.categoryManager.debugMode;
};

console.log('✅ CategoryManager v23.0 - DÉTECTION NEWSLETTER ULTRA-RENFORCÉE loaded!');
console.log('🧪 Fonctions de test disponibles:');
console.log('   - testNewsletterEmail(subject, sender, body) : Test personnalisé');
console.log('   - testRealEmails() : Test des emails des documents');  
console.log('   - getNewsletterStats() : Statistiques de détection');
console.log('   - toggleNewsletterDebug() : Activer/désactiver debug');
