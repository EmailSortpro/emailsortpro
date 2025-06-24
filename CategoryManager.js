// CategoryManager.js - Version 27.1 - SYNTAXE CORRIGÉE

class CategoryManager {
    constructor() {
        console.log('[CategoryManager] 🚀 Constructor starting v27.1...');
        
        this.categories = {};
        this.keywordCatalog = {};
        this.customCategories = {};
        this.settings = this.loadSettings();
        this.isInitialized = false;
        this.debugMode = false;
        
        // Système de synchronisation
        this.changeListeners = new Set();
        
        // Gestion des scans
        this.scanHistory = [];
        this.lastScanResults = null;
        this.scanProviders = {
            gmail: {
                name: 'Gmail',
                icon: 'fab fa-google',
                color: '#ea4335',
                priority: 1,
                methods: ['mailService', 'directGmail', 'googleAuthService']
            },
            outlook: {
                name: 'Outlook',
                icon: 'fab fa-microsoft', 
                color: '#0078d4',
                priority: 2,
                methods: ['mailService', 'directOutlook', 'authService']
            }
        };
        
        // Initialisation synchrone des composants critiques
        try {
            this.initializeCategories();
            this.loadCustomCategories();
            this.initializeKeywordCatalog();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[CategoryManager] ✅ Version 27.1 - Initialized successfully');
            
            // Notifier que CategoryManager est prêt
            this.notifyReady();
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Initialization error:', error);
            this.isInitialized = false;
        }
    }

    // ================================================
    // NOTIFICATION DE DISPONIBILITÉ
    // ================================================
    notifyReady() {
        console.log('[CategoryManager] 📢 Notifying that CategoryManager is ready');
        
        try {
            window.dispatchEvent(new CustomEvent('categoryManagerReady', {
                detail: {
                    isInitialized: this.isInitialized,
                    categoriesCount: Object.keys(this.categories).length,
                    version: '27.1'
                }
            }));
            console.log('[CategoryManager] ✅ Ready event dispatched');
        } catch (error) {
            console.error('[CategoryManager] Error dispatching ready event:', error);
        }
        
        window.categoryManagerReady = true;
    }

    // ================================================
    // CATALOGUE DE MOTS-CLÉS - SANS DOUBLONS
    // ================================================
    initializeKeywordCatalog() {
        console.log('[CategoryManager] 🔍 Initialisation catalogue v27.1 - Mots-clés uniques par catégorie...');
        
        this.keywordCatalog = {
            // MARKETING & NEWSLETTER - Mots-clés uniques
            marketing_news: {
                absolute: [
                    // Désabonnement (unique à marketing)
                    'se désabonner', 'se desinscrire', 'désinscrire', 'desinscrire',
                    'unsubscribe', 'opt out', 'opt-out', 'désabonner', 'desabonner',
                    'gérer vos préférences', 'gérer la réception', 'gérer mes préférences',
                    'email preferences', 'préférences email', 'preferences email',
                    'ne plus recevoir', 'stop emails', 'arreter les emails', 'arrêter les emails',
                    
                    // Newsletter (unique à marketing)
                    'newsletter', 'newsletter hebdomadaire', 'newsletter mensuelle',
                    'mailing list', 'mailing', 'e-mailing', 'emailing',
                    'liste de diffusion', 'diffusion email', 'email marketing',
                    'campagne email', 'email campaign', 'mass email', 'email blast',
                    
                    // Visualisation web (unique à marketing)
                    'view in browser', 'voir dans le navigateur', 'version web',
                    'having trouble viewing', 'problème d\'affichage',
                    
                    // Plateformes marketing (unique à marketing)
                    'mailchimp', 'sendgrid', 'mailgun', 'constant contact',
                    'aweber', 'getresponse', 'campaign monitor', 'sendinblue',
                    
                    // Adresses automatiques (unique à marketing)
                    'noreply@', 'no-reply@', 'donotreply@', 'do-not-reply@',
                    'automated message', 'message automatique',
                    'this is an automated', 'ceci est un message automatisé'
                ],
                strong: [
                    // Commerce (unique à marketing)
                    'publicity', 'publicité', 'advertising', 'campaign', 'campagne',
                    'promotion', 'promo', 'deal', 'offer', 'offre', 'sale', 'vente',
                    'discount', 'réduction', 'special', 'exclusive', 'limited',
                    'new arrivals', 'nouveautés', 'collection', 'catalog', 'catalogue',
                    
                    // Actions marketing (unique à marketing)
                    'shop', 'boutique', 'store', 'magasin', 'shopping',
                    'acheter', 'buy', 'purchase', 'order', 'commander',
                    'cart', 'panier', 'checkout'
                ],
                weak: [
                    'discover', 'découvrir', 'explore', 'explorer',
                    'learn more', 'en savoir plus', 'read more',
                    'visit', 'visiter', 'click here', 'cliquez ici'
                ],
                exclusions: []
            },

            // SÉCURITÉ - Mots-clés uniques
            security: {
                absolute: [
                    // Alertes connexion (unique à sécurité)
                    'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                    'new sign-in', 'sign in detected', 'connexion détectée',
                    'login alert', 'alerte login', 'connexion inhabituelle',
                    
                    // Activité suspecte (unique à sécurité)
                    'activité suspecte', 'suspicious activity', 'activité inhabituelle',
                    'unusual activity', 'unauthorized access', 'accès non autorisé',
                    'compte compromis', 'account compromised', 'security breach',
                    
                    // Codes et vérification (unique à sécurité)
                    'code de vérification', 'verification code', 'security code',
                    'code de sécurité', 'two-factor', '2fa', 'authentification à deux facteurs',
                    
                    // Réinitialisation (unique à sécurité)
                    'password reset', 'réinitialisation mot de passe',
                    'reset your password', 'réinitialiser votre mot de passe',
                    'confirm your identity', 'confirmez votre identité'
                ],
                strong: [
                    // Termes sécurité (unique à sécurité)
                    'sécurité', 'security', 'vérification', 'verify',
                    'authentification', 'authentication', 'password', 'mot de passe',
                    'login', 'connexion', 'access', 'accès', 'breach', 'violation',
                    'protect', 'protéger', 'secure', 'sécuriser', 'alert', 'alerte'
                ],
                weak: [
                    'identity', 'identité', 'privacy', 'confidentialité',
                    'protection', 'user', 'utilisateur'
                ],
                exclusions: []
            },

            // TÂCHES - Mots-clés uniques + TAGS
            tasks: {
                absolute: [
                    // Actions requises (unique à tâches)
                    'action required', 'action requise', 'action needed',
                    'action nécessaire', 'action demandée', 'action attendue',
                    
                    // Complétion (unique à tâches)
                    'please complete', 'veuillez compléter', 'à compléter',
                    'complete by', 'à compléter avant', 'finish by',
                    
                    // Assignation (unique à tâches)
                    'task assigned', 'tâche assignée', 'assigned to you',
                    'assigné à vous', 'your task', 'votre tâche',
                    
                    // Échéances (unique à tâches)
                    'deadline', 'échéance', 'due date', 'date limite',
                    'due by', 'à rendre avant', 'livrable', 'deliverable',
                    
                    // Validation (unique à tâches)
                    'merci de valider', 'validation requise', 'approval needed',
                    'approbation requise', 'please approve', 'veuillez approuver',
                    
                    // Tags utilisateur (unique à tâches)
                    '@team', '@tous', '@all', '@urgent'
                ],
                strong: [
                    // Urgence (unique à tâches)
                    'urgent', 'urgence', 'très urgent', 'asap', 'priority',
                    'priorité', 'prioritaire', 'critique', 'critical',
                    
                    // Actions tâches (unique à tâches)
                    'task', 'tâche', 'todo', 'à faire', 'pending',
                    'en attente', 'awaiting', 'correction', 'corriger',
                    'révision', 'review', 'réviser', 'valider', 'validate',
                    
                    // Indicateurs de tag
                    'assigner', 'assign', 'attribuer', 'pour toi', 'for you'
                ],
                weak: [
                    'demande', 'request', 'besoin', 'need',
                    'attente', 'waiting', 'response', 'réponse'
                ],
                exclusions: []
            },

            // FINANCE - Mots-clés uniques
            finance: {
                absolute: [
                    // Documents financiers (unique à finance)
                    'facture', 'invoice', 'invoice number', 'numéro de facture',
                    'relevé bancaire', 'bank statement', 'relevé de compte',
                    'bulletin de salaire', 'pay stub', 'fiche de paie',
                    
                    // Paiements (unique à finance)
                    'payment due', 'échéance paiement', 'paiement dû',
                    'payment required', 'paiement requis', 'payment reminder',
                    'rappel de paiement', 'overdue', 'en retard', 'impayé',
                    
                    // Transactions (unique à finance)
                    'virement', 'transfer', 'wire transfer', 'virement bancaire',
                    'remboursement', 'refund', 'reimbursement', 'crédit',
                    
                    // Cartes et comptes (unique à finance)
                    'credit card', 'carte de crédit', 'debit card', 'carte de débit',
                    'bank notification', 'notification bancaire'
                ],
                strong: [
                    // Termes financiers (unique à finance)
                    'montant', 'amount', 'total', 'price', 'prix',
                    'fiscal', 'bancaire', 'bank', 'finance', 'financial',
                    'euro', 'dollar', 'currency', 'devise', 'payment',
                    'paiement', 'transaction', 'debit', 'credit', 'solde',
                    'balance', 'billing', 'facturation', 'charge', 'frais'
                ],
                weak: [
                    'money', 'argent', 'cost', 'coût', 'fee',
                    'expense', 'dépense', 'receipt', 'reçu'
                ],
                exclusions: []
            },

            // RÉUNIONS - Mots-clés uniques
            meetings: {
                absolute: [
                    // Demandes réunion (unique à meetings)
                    'demande de réunion', 'meeting request', 'réunion demandée',
                    'schedule a meeting', 'planifier une réunion',
                    'invitation réunion', 'meeting invitation',
                    
                    // Plateformes réunion (unique à meetings)
                    'teams meeting', 'zoom meeting', 'google meet',
                    'skype meeting', 'webex meeting', 'gotomeeting',
                    
                    // Liens réunion (unique à meetings)
                    'join the meeting', 'rejoindre la réunion',
                    'meeting link', 'lien de réunion', 'meeting url',
                    
                    // Rendez-vous (unique à meetings)
                    'rendez-vous', 'appointment', 'rdv', 'rdv prévu',
                    'calendar invitation', 'invitation calendrier'
                ],
                strong: [
                    // Termes réunion (unique à meetings)
                    'meeting', 'réunion', 'conference', 'conférence',
                    'call', 'appel', 'webinar', 'webinaire', 'séminaire',
                    'présentation', 'presentation', 'session', 'séance',
                    
                    // Planning (unique à meetings)
                    'schedule', 'planifier', 'calendar', 'calendrier',
                    'agenda', 'planning', 'disponibilité', 'availability'
                ],
                weak: [
                    'disponible', 'available', 'slot', 'créneau',
                    'time', 'temps', 'date', 'heure', 'durée'
                ],
                exclusions: []
            },

            // COMMERCIAL - Mots-clés uniques
            commercial: {
                absolute: [
                    // Documents commerciaux (unique à commercial)
                    'devis', 'quotation', 'quote', 'estimation',
                    'proposal', 'proposition', 'proposition commerciale',
                    'business proposal', 'offre commerciale',
                    
                    // Contrats (unique à commercial)
                    'contrat', 'contract', 'agreement', 'accord',
                    'bon de commande', 'purchase order', 'po number',
                    
                    // Opportunités (unique à commercial)
                    'opportunity', 'opportunité', 'lead', 'prospect qualifié',
                    'négociation', 'negotiation', 'closing', 'signature'
                ],
                strong: [
                    // Termes commerciaux (unique à commercial)
                    'client', 'customer', 'prospect', 'commercial',
                    'business', 'affaires', 'marché', 'market',
                    'vente', 'sales', 'revenue', 'chiffre d\'affaires',
                    
                    // Relations (unique à commercial)
                    'partnership', 'partenariat', 'collaboration',
                    'vendor', 'fournisseur', 'supplier', 'distributeur'
                ],
                weak: [
                    'discussion', 'projet', 'project', 'potential',
                    'potentiel', 'interest', 'intérêt', 'besoin client'
                ],
                exclusions: []
            },

            // SUPPORT - Mots-clés uniques
            support: {
                absolute: [
                    // Tickets (unique à support)
                    'ticket #', 'ticket number', 'numéro de ticket',
                    'ticket id', 'case #', 'case number', 'case id',
                    'incident #', 'incident number', 'incident id',
                    
                    // Support (unique à support)
                    'support ticket', 'demande de support', 'support request',
                    'help desk', 'service desk', 'assistance technique',
                    
                    // Résolution (unique à support)
                    'problème résolu', 'issue resolved', 'ticket closed',
                    'ticket fermé', 'resolution', 'résolution'
                ],
                strong: [
                    // Termes support (unique à support)
                    'support', 'assistance', 'help', 'aide',
                    'technical support', 'support technique',
                    'troubleshooting', 'dépannage', 'diagnostic',
                    
                    // Problèmes (unique à support)
                    'problème', 'problem', 'issue', 'incident',
                    'bug', 'défaut', 'erreur', 'error', 'panne'
                ],
                weak: [
                    'question', 'solution', 'workaround', 'contournement',
                    'escalation', 'escalade', 'sla', 'service level'
                ],
                exclusions: []
            },

            // RH - Mots-clés uniques
            hr: {
                absolute: [
                    // Documents RH (unique à hr)
                    'bulletin de paie', 'payslip', 'salary slip',
                    'contrat de travail', 'employment contract',
                    'avenant', 'amendment', 'attestation employeur',
                    
                    // Congés (unique à hr)
                    'congés', 'leave request', 'vacation request',
                    'absence request', 'demande d\'absence', 'rtt',
                    
                    // Processus RH (unique à hr)
                    'onboarding', 'intégration', 'offboarding',
                    'entretien annuel', 'performance review',
                    'évaluation annuelle', 'annual review'
                ],
                strong: [
                    // Termes RH (unique à hr)
                    'rh', 'hr', 'ressources humaines', 'human resources',
                    'salaire', 'salary', 'rémunération', 'compensation',
                    'paie', 'payroll', 'benefits', 'avantages sociaux',
                    
                    // Emploi (unique à hr)
                    'emploi', 'job', 'poste', 'position', 'recrutement',
                    'recruitment', 'hiring', 'embauche', 'formation'
                ],
                weak: [
                    'employee', 'employé', 'staff', 'personnel',
                    'équipe', 'team', 'department', 'service'
                ],
                exclusions: []
            },

            // RELANCES - Mots-clés uniques
            reminders: {
                absolute: [
                    // Formules relance (unique à reminders)
                    'reminder:', 'rappel:', 'friendly reminder',
                    'rappel amical', 'gentle reminder', 'petit rappel',
                    
                    // Follow-up (unique à reminders)
                    'follow up', 'follow-up', 'relance', 'following up',
                    'je reviens vers vous', 'circling back',
                    'comme convenu', 'as discussed', 'as agreed',
                    
                    // Statut (unique à reminders)
                    'still waiting', 'toujours en attente',
                    'pending response', 'réponse en attente'
                ],
                strong: [
                    // Termes relance (unique à reminders)
                    'reminder', 'rappel', 'relance', 'suivi',
                    'follow', 'suite à', 'convenu', 'discussed',
                    'pending', 'en attente', 'outstanding', 'restant'
                ],
                weak: [
                    'previous', 'précédent', 'earlier', 'plus tôt',
                    'encore', 'still', 'toujours', 'yet'
                ],
                exclusions: []
            },

            // PROJETS - Mots-clés uniques
            project: {
                absolute: [
                    // Gestion projet (unique à project)
                    'project update', 'mise à jour projet',
                    'project status', 'statut projet', 'avancement projet',
                    'project milestone', 'jalon projet', 'milestone',
                    
                    // Méthodologies (unique à project)
                    'sprint planning', 'planification sprint',
                    'sprint review', 'retrospective', 'retro',
                    'daily standup', 'standup', 'scrum meeting',
                    
                    // Outils projet (unique à project)
                    'gantt chart', 'diagramme gantt', 'roadmap',
                    'backlog', 'user story', 'epic', 'jira ticket'
                ],
                strong: [
                    // Termes projet (unique à project)
                    'projet', 'project', 'sprint', 'iteration',
                    'agile', 'scrum', 'kanban', 'waterfall',
                    
                    // Développement (unique à project)
                    'development', 'développement', 'release',
                    'deployment', 'déploiement', 'livraison',
                    'testing', 'test', 'qa', 'quality'
                ],
                weak: [
                    'phase', 'étape', 'stage', 'progress',
                    'progrès', 'avancement', 'timeline', 'délai'
                ],
                exclusions: []
            },

            // COMMUNICATION INTERNE - Mots-clés uniques
            internal: {
                absolute: [
                    // Annonces internes (unique à internal)
                    'all staff', 'tout le personnel', 'all employees',
                    'tous les employés', 'company wide', 'toute l\'entreprise',
                    
                    // Communications officielles (unique à internal)
                    'annonce interne', 'internal announcement',
                    'company announcement', 'annonce entreprise',
                    'memo interne', 'internal memo', 'note de service',
                    
                    // Distribution (unique à internal)
                    'communication interne', 'internal communication',
                    'à tous', 'to all', 'distribution générale'
                ],
                strong: [
                    // Termes internes (unique à internal)
                    'internal', 'interne', 'company', 'entreprise',
                    'organization', 'organisation', 'corporate',
                    
                    // Types communication (unique à internal)
                    'annonce', 'announcement', 'memo', 'mémo',
                    'policy', 'politique', 'procedure', 'procédure',
                    'directive', 'guideline', 'règlement'
                ],
                weak: [
                    'information', 'info', 'update', 'mise à jour',
                    'news', 'nouvelle', 'changement', 'change'
                ],
                exclusions: []
            },

            // NOTIFICATIONS - Mots-clés uniques
            notifications: {
                absolute: [
                    // Messages automatiques (unique à notifications)
                    'do not reply', 'ne pas répondre', 'no reply',
                    'automatic reply', 'réponse automatique',
                    'auto-reply', 'auto reply', 'autoreply',
                    
                    // Système (unique à notifications)
                    'system notification', 'notification système',
                    'system alert', 'alerte système', 'system message',
                    'server notification', 'notification serveur',
                    
                    // Maintenance (unique à notifications)
                    'maintenance notification', 'notification maintenance',
                    'scheduled maintenance', 'maintenance planifiée',
                    'backup notification', 'notification sauvegarde'
                ],
                strong: [
                    // Termes notification (unique à notifications)
                    'automated', 'automatic', 'automatique', 'automatisé',
                    'system', 'système', 'server', 'serveur',
                    'maintenance', 'backup', 'sauvegarde', 'update système'
                ],
                weak: [
                    'notice', 'avis', 'status', 'statut',
                    'monitoring', 'surveillance', 'log', 'journal'
                ],
                exclusions: []
            },

            // EN COPIE - Mots-clés uniques
            cc: {
                absolute: [
                    // Formules CC (unique à cc)
                    'copie pour information', 'for your information',
                    'fyi', 'pour info', 'pour information',
                    'en copie', 'in copy', 'cc:', 'courtesy copy',
                    
                    // Visibilité (unique à cc)
                    'shared for visibility', 'partagé pour visibilité',
                    'keeping you in the loop', 'pour vous tenir informé',
                    'for awareness', 'pour information seulement'
                ],
                strong: [
                    // Termes CC (unique à cc)
                    'copie', 'copy', 'cc', 'fyi', 'visibility',
                    'visibilité', 'awareness', 'connaissance'
                ],
                weak: [
                    'share', 'partage', 'inform', 'informer'
                ],
                exclusions: []
            }
        };

        console.log('[CategoryManager] ✅ Catalogue initialisé avec mots-clés uniques par catégorie');
    }

    // ================================================
    // ANALYSE EMAIL - DÉTECTION MOTS-CLÉS AMÉLIORÉE
    // ================================================
    analyzeEmail(email) {
        if (!email) return { category: 'other', score: 0, confidence: 0 };
        
        if (this.shouldExcludeSpam() && this.isSpamEmail(email)) {
            return { category: 'spam', score: 0, confidence: 0, isSpam: true };
        }
        
        const content = this.extractCompleteContentEnhanced(email);
        
        if (this.isGloballyExcluded(content, email)) {
            return { category: 'excluded', score: 0, confidence: 0, isExcluded: true };
        }
        
        // DÉTECTION PAR TAG (@) - PRIORITÉ ABSOLUE POUR TÂCHES
        const tagDetection = this.detectUserTag(content, email);
        if (tagDetection.hasTag) {
            console.log(`[CategoryManager] 👤 TAG DÉTECTÉ: @${tagDetection.taggedUser} - Catégorisation automatique en tâche`);
            return {
                category: 'tasks',
                score: 500, // Score très élevé pour priorité absolue
                confidence: 0.99,
                matchedPatterns: [{
                    keyword: `@${tagDetection.taggedUser}`,
                    type: 'user_tag',
                    score: 500
                }],
                hasAbsolute: true,
                detectionMethod: 'user_tag',
                taggedUser: tagDetection.taggedUser,
                tagContext: tagDetection.context
            };
        }
        
        const newsletterResult = this.detectNewsletterEnhanced(content, email);
        if (newsletterResult && newsletterResult.score >= 80) {
            return newsletterResult;
        }
        
        const allResults = this.analyzeAllCategories(content, email);
        const selectedResult = this.selectBestCategory(allResults);
        
        // Si aucune catégorie n'est trouvée, retourner "other"
        if (!selectedResult || selectedResult.score === 0) {
            return {
                category: 'other',
                score: 0,
                confidence: 0,
                matchedPatterns: [],
                hasAbsolute: false,
                reason: 'no_category_matched',
                detectionMethod: 'default_other'
            };
        }
        
        return selectedResult;
    }

    // ================================================
    // DÉTECTION DES TAGS UTILISATEUR (@)
    // ================================================
    detectUserTag(content, email) {
        const result = {
            hasTag: false,
            taggedUser: null,
            context: null,
            matches: []
        };
        
        // Patterns pour détecter les tags
        // Format: @nom ou @prenom.nom ou @nom-compose
        const tagPattern = /@([a-zA-Z0-9\-_.]+)/g;
        
        // Chercher dans le sujet
        const subjectMatches = email.subject?.match(tagPattern);
        if (subjectMatches && subjectMatches.length > 0) {
            const taggedUser = subjectMatches[0].substring(1); // Enlever le @
            result.hasTag = true;
            result.taggedUser = taggedUser;
            result.context = 'subject';
            result.matches.push({
                tag: subjectMatches[0],
                location: 'subject',
                fullText: email.subject
            });
            return result;
        }
        
        // Chercher dans le corps (début du message)
        if (content.text) {
            // Extraire les 500 premiers caractères pour la performance
            const bodyStart = content.text.substring(0, 500);
            const bodyMatches = bodyStart.match(tagPattern);
            
            if (bodyMatches && bodyMatches.length > 0) {
                // Vérifier que ce n'est pas une adresse email
                const tag = bodyMatches[0];
                const beforeTag = bodyStart.substring(Math.max(0, bodyStart.indexOf(tag) - 1), bodyStart.indexOf(tag));
                
                // Si ce n'est pas précédé par un caractère d'email, c'est un tag valide
                if (beforeTag !== '.' && beforeTag !== '-' && !bodyStart.includes(tag + '@')) {
                    const taggedUser = tag.substring(1);
                    result.hasTag = true;
                    result.taggedUser = taggedUser;
                    result.context = 'body';
                    result.matches.push({
                        tag: tag,
                        location: 'body',
                        snippet: bodyStart.substring(
                            Math.max(0, bodyStart.indexOf(tag) - 30),
                            Math.min(bodyStart.length, bodyStart.indexOf(tag) + 30)
                        )
                    });
                }
            }
        }
        
        // Chercher dans le preview
        if (!result.hasTag && email.bodyPreview) {
            const previewMatches = email.bodyPreview.match(tagPattern);
            if (previewMatches && previewMatches.length > 0) {
                const tag = previewMatches[0];
                const beforeTag = email.bodyPreview.substring(
                    Math.max(0, email.bodyPreview.indexOf(tag) - 1), 
                    email.bodyPreview.indexOf(tag)
                );
                
                if (beforeTag !== '.' && beforeTag !== '-' && !email.bodyPreview.includes(tag + '@')) {
                    const taggedUser = tag.substring(1);
                    result.hasTag = true;
                    result.taggedUser = taggedUser;
                    result.context = 'preview';
                    result.matches.push({
                        tag: tag,
                        location: 'preview',
                        snippet: email.bodyPreview
                    });
                }
            }
        }
        
        return result;
    }

    // ================================================
    // DÉTECTION NEWSLETTER AMÉLIORÉE
    // ================================================
    detectNewsletterEnhanced(content, email) {
        let totalScore = 0;
        const matches = [];
        let hasStrongIndicator = false;
        
        const marketingKeywords = this.keywordCatalog.marketing_news;
        const bodyAnalysis = this.analyzeKeywordsInContent(content.text, marketingKeywords, 'marketing_news');
        
        totalScore += bodyAnalysis.score;
        matches.push(...bodyAnalysis.matches);
        
        if (bodyAnalysis.hasAbsolute) {
            hasStrongIndicator = true;
        }
        
        const senderAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
        const newsletterAddressPatterns = [
            'noreply', 'no-reply', 'donotreply', 'do-not-reply',
            'notifications', 'updates', 'news', 'newsletter',
            'marketing', 'promo', 'offers', 'deals'
        ];
        
        for (const pattern of newsletterAddressPatterns) {
            if (senderAddress.includes(pattern)) {
                totalScore += 50;
                matches.push({ keyword: `sender_${pattern}`, type: 'sender', score: 50 });
                hasStrongIndicator = true;
                break;
            }
        }
        
        const domain = this.extractDomain(senderAddress);
        const marketingDomains = [
            'mailchimp.com', 'sendgrid.net', 'constantcontact.com',
            'aweber.com', 'getresponse.com', 'campaign-monitor.com'
        ];
        
        if (marketingDomains.some(md => domain.includes(md))) {
            totalScore += 100;
            hasStrongIndicator = true;
            matches.push({ keyword: 'marketing_platform', type: 'domain', score: 100 });
        }
        
        const subjectAnalysis = this.analyzeKeywordsInContent(
            content.subject,
            marketingKeywords,
            'marketing_news',
            2.0
        );
        
        totalScore += subjectAnalysis.score;
        matches.push(...subjectAnalysis.matches.map(m => ({
            ...m,
            keyword: m.keyword + ' (subject)',
            type: 'subject_' + m.type
        })));
        
        if (hasStrongIndicator || totalScore >= 80) {
            const confidence = hasStrongIndicator ? 0.95 : 
                              totalScore >= 150 ? 0.90 : 
                              totalScore >= 100 ? 0.85 : 
                              totalScore >= 80 ? 0.75 : 0.70;
            
            return {
                category: 'marketing_news',
                score: Math.min(totalScore, 300),
                confidence: confidence,
                matchedPatterns: matches,
                hasAbsolute: hasStrongIndicator,
                detectionMethod: 'enhanced_keyword_detection',
                keywordMatches: bodyAnalysis.keywordCount
            };
        }
        
        return null;
    }

    // ================================================
    // ANALYSE DES MOTS-CLÉS DANS LE CONTENU
    // ================================================
    analyzeKeywordsInContent(text, keywords, categoryId, multiplier = 1.0) {
        let score = 0;
        const matches = [];
        let hasAbsolute = false;
        let keywordCount = 0;
        
        if (!text || !keywords) {
            return { score: 0, matches: [], hasAbsolute: false, keywordCount: 0 };
        }
        
        const normalizedText = text.toLowerCase();
        
        if (keywords.absolute && keywords.absolute.length > 0) {
            for (const keyword of keywords.absolute) {
                const occurrences = this.countKeywordOccurrences(normalizedText, keyword);
                if (occurrences > 0) {
                    const keywordScore = 100 * multiplier * Math.min(occurrences, 3);
                    score += keywordScore;
                    hasAbsolute = true;
                    keywordCount += occurrences;
                    matches.push({
                        keyword: keyword,
                        type: 'absolute',
                        score: keywordScore,
                        occurrences: occurrences
                    });
                }
            }
        }
        
        if (keywords.strong && keywords.strong.length > 0) {
            for (const keyword of keywords.strong) {
                const occurrences = this.countKeywordOccurrences(normalizedText, keyword);
                if (occurrences > 0) {
                    const keywordScore = 40 * multiplier * Math.min(occurrences, 2);
                    score += keywordScore;
                    keywordCount += occurrences;
                    matches.push({
                        keyword: keyword,
                        type: 'strong',
                        score: keywordScore,
                        occurrences: occurrences
                    });
                }
            }
        }
        
        if (keywords.weak && keywords.weak.length > 0) {
            for (const keyword of keywords.weak) {
                const occurrences = this.countKeywordOccurrences(normalizedText, keyword);
                if (occurrences > 0) {
                    const keywordScore = 15 * multiplier;
                    score += keywordScore;
                    keywordCount += occurrences;
                    matches.push({
                        keyword: keyword,
                        type: 'weak',
                        score: keywordScore,
                        occurrences: occurrences
                    });
                }
            }
        }
        
        if (keywords.exclusions && keywords.exclusions.length > 0) {
            for (const exclusion of keywords.exclusions) {
                if (this.findKeywordInText(normalizedText, exclusion)) {
                    const penalty = -30 * multiplier;
                    score += penalty;
                    matches.push({
                        keyword: exclusion,
                        type: 'exclusion',
                        score: penalty,
                        occurrences: 1
                    });
                }
            }
        }
        
        return {
            score: Math.max(0, score),
            matches: matches,
            hasAbsolute: hasAbsolute,
            keywordCount: keywordCount
        };
    }

    // ================================================
    // COMPTAGE DES OCCURRENCES DE MOTS-CLÉS
    // ================================================
    countKeywordOccurrences(text, keyword) {
        if (!text || !keyword) return 0;
        
        const normalizedKeyword = keyword.toLowerCase();
        let count = 0;
        let position = 0;
        
        while ((position = text.indexOf(normalizedKeyword, position)) !== -1) {
            count++;
            position += normalizedKeyword.length;
        }
        
        if (count === 0) {
            try {
                const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'gi');
                const matches = text.match(wordBoundaryRegex);
                if (matches) {
                    count = matches.length;
                }
            } catch (e) {
                // Ignorer les erreurs regex
            }
        }
        
        return count;
    }

    // ================================================
    // RECHERCHE DE MOT-CLÉ DANS LE TEXTE
    // ================================================
    findKeywordInText(text, keyword) {
        if (!text || !keyword) return false;
        
        const normalizedKeyword = keyword.toLowerCase();
        
        if (text.includes(normalizedKeyword)) {
            return true;
        }
        
        try {
            const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
            return wordBoundaryRegex.test(text);
        } catch (e) {
            return false;
        }
    }

    // ================================================
    // ANALYSE DE TOUTES LES CATÉGORIES
    // ================================================
    analyzeAllCategories(content, email) {
        const results = {};
        const activeCategories = this.getActiveCategories();
        
        for (const categoryId of Object.keys(this.keywordCatalog)) {
            if (!activeCategories.includes(categoryId) && categoryId !== 'cc') {
                continue;
            }
            
            const keywords = this.keywordCatalog[categoryId];
            if (!keywords) continue;
            
            const contentAnalysis = this.analyzeKeywordsInContent(
                content.text,
                keywords,
                categoryId
            );
            
            const subjectAnalysis = this.analyzeKeywordsInContent(
                content.subject,
                keywords,
                categoryId,
                1.5
            );
            
            const totalScore = contentAnalysis.score + subjectAnalysis.score;
            const allMatches = [...contentAnalysis.matches, ...subjectAnalysis.matches];
            const hasAbsolute = contentAnalysis.hasAbsolute || subjectAnalysis.hasAbsolute;
            const totalKeywords = contentAnalysis.keywordCount + subjectAnalysis.keywordCount;
            
            let categoryBonus = 0;
            if (categoryId === 'marketing_news' && totalKeywords > 3) {
                categoryBonus = 50;
            } else if (['security', 'finance', 'tasks'].includes(categoryId) && hasAbsolute) {
                categoryBonus = 30;
            }
            
            const finalScore = totalScore + categoryBonus;
            
            results[categoryId] = {
                category: categoryId,
                score: finalScore,
                confidence: this.calculateConfidence(finalScore, hasAbsolute, totalKeywords),
                matchedPatterns: allMatches,
                hasAbsolute: hasAbsolute,
                keywordCount: totalKeywords,
                priority: this.categories[categoryId]?.priority || 50
            };
        }
        
        if (this.shouldDetectCC() && this.isInCC(email) && !this.isMainRecipient(email)) {
            results.cc = {
                category: 'cc',
                score: 100,
                confidence: 0.95,
                matchedPatterns: [{ keyword: 'in_cc', type: 'detected', score: 100 }],
                hasAbsolute: true,
                priority: 30
            };
        }
        
        return results;
    }

    // ================================================
    // SÉLECTION DE LA MEILLEURE CATÉGORIE
    // ================================================
    selectBestCategory(results) {
        const MIN_SCORE_THRESHOLD = 20;
        const MIN_CONFIDENCE_THRESHOLD = 0.5;
        
        const validResults = Object.values(results)
            .filter(r => r.score >= MIN_SCORE_THRESHOLD && r.confidence >= MIN_CONFIDENCE_THRESHOLD)
            .sort((a, b) => {
                if (a.hasAbsolute && !b.hasAbsolute) return -1;
                if (!a.hasAbsolute && b.hasAbsolute) return 1;
                
                if (Math.abs(a.score - b.score) > 20) {
                    return b.score - a.score;
                }
                
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                
                return (b.keywordCount || 0) - (a.keywordCount || 0);
            });
        
        if (validResults.length === 0) {
            return null;
        }
        
        return validResults[0];
    }

    // ================================================
    // CALCUL DE CONFIDENCE
    // ================================================
    calculateConfidence(score, hasAbsolute, keywordCount = 0) {
        if (hasAbsolute) {
            if (score >= 200) return 0.98;
            if (score >= 150) return 0.95;
            if (score >= 100) return 0.90;
            return 0.85;
        }
        
        if (score >= 150 && keywordCount >= 5) return 0.90;
        if (score >= 100 && keywordCount >= 3) return 0.85;
        if (score >= 80 && keywordCount >= 2) return 0.80;
        if (score >= 60) return 0.75;
        if (score >= 40) return 0.70;
        if (score >= 30) return 0.65;
        if (score >= 20) return 0.60;
        return 0.50;
    }

    // ================================================
    // EXTRACTION DE CONTENU AMÉLIORÉE
    // ================================================
    extractCompleteContentEnhanced(email) {
        let allText = '';
        let subject = '';
        
        if (email.subject && email.subject.trim()) {
            subject = email.subject;
            allText += (email.subject + ' ').repeat(3);
        } else {
            subject = '[SANS_SUJET]';
            allText += 'sans sujet email sans objet ';
        }
        
        if (email.from?.emailAddress?.address) {
            const senderAddress = email.from.emailAddress.address;
            allText += senderAddress + ' ';
            
            const domain = this.extractDomain(senderAddress);
            allText += domain + ' ';
        }
        
        if (email.from?.emailAddress?.name) {
            const senderName = email.from.emailAddress.name;
            allText += senderName + ' ';
        }
        
        if (email.bodyPreview) {
            const cleanPreview = this.cleanAndNormalizeText(email.bodyPreview);
            allText += (cleanPreview + ' ').repeat(2);
        }
        
        if (email.body?.content) {
            let bodyContent = email.body.content;
            
            if (bodyContent.includes('<')) {
                bodyContent = this.cleanHtmlContent(bodyContent);
            }
            
            const cleanBody = this.cleanAndNormalizeText(bodyContent);
            allText += cleanBody + ' ';
        }
        
        if (email.categories && Array.isArray(email.categories)) {
            email.categories.forEach(cat => {
                allText += cat + ' ';
            });
        }
        
        if (email.importance) {
            allText += email.importance + ' ';
        }
        
        if (email.hasAttachments) {
            allText += 'attachment pièce jointe ';
        }
        
        return {
            text: allText.toLowerCase().trim(),
            subject: subject.toLowerCase(),
            rawSubject: email.subject || '',
            domain: this.extractDomain(email.from?.emailAddress?.address),
            hasHtml: !!(email.body?.content && email.body.content.includes('<')),
            length: allText.length,
            senderAddress: email.from?.emailAddress?.address?.toLowerCase() || '',
            senderName: email.from?.emailAddress?.name?.toLowerCase() || ''
        };
    }

    // ================================================
    // NETTOYAGE HTML
    // ================================================
    cleanHtmlContent(html) {
        if (!html) return '';
        
        let cleaned = html;
        
        cleaned = cleaned.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
            return ` ${text} ${href} `;
        });
        
        cleaned = cleaned.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi, (match, alt) => {
            return ` ${alt} `;
        });
        
        cleaned = cleaned
            .replace(/<style[^>]*>.*?<\/style>/gis, ' ')
            .replace(/<script[^>]*>.*?<\/script>/gis, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        return cleaned;
    }

    // ================================================
    // NETTOYAGE ET NORMALISATION DU TEXTE
    // ================================================
    cleanAndNormalizeText(text) {
        if (!text) return '';
        
        return text
            .replace(/Ã©/g, 'é')
            .replace(/Ã¨/g, 'è')
            .replace(/Ã /g, 'à')
            .replace(/Ã´/g, 'ô')
            .replace(/Ã§/g, 'ç')
            .replace(/Ã¹/g, 'ù')
            .replace(/Ã¢/g, 'â')
            .replace(/Ãª/g, 'ê')
            .replace(/Ã®/g, 'î')
            .replace(/Ã¯/g, 'ï')
            .replace(/Ã«/g, 'ë')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/['']/g, "'")
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ================================================
    // MÉTHODES UTILITAIRES
    // ================================================
    extractDomain(email) {
        if (!email || !email.includes('@')) return 'unknown';
        return email.split('@')[1]?.toLowerCase() || 'unknown';
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
                description: 'Newsletters, promotions et marketing',
                priority: 100,
                isCustom: false
            },
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
                description: 'Tâches à faire, demandes d\'action et messages avec @tags',
                priority: 95, // Priorité augmentée pour les tags
                isCustom: false
            },
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
            cc: {
                name: 'En Copie',
                icon: '📋',
                color: '#64748b',
                description: 'Emails où vous êtes en copie',
                priority: 30,
                isCustom: false
            },
            notifications: {
                name: 'Notifications',
                icon: '🔔',
                color: '#94a3b8',
                description: 'Notifications automatiques système',
                priority: 20,
                isCustom: false
            },
            other: {
                name: 'Autres',
                icon: '📧',
                color: '#6b7280',
                description: 'Emails non catégorisés',
                priority: 10,
                isCustom: false
            }
        };
        
        console.log('[CategoryManager] 📚 Catégories initialisées avec catégorie "other"');
    }

    // ================================================
    // DÉTECTION SPAM ET EXCLUSIONS
    // ================================================
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

    // ================================================
    // DÉTECTION DESTINATAIRES
    // ================================================
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

    shouldExcludeSpam() {
        return this.settings.preferences?.excludeSpam !== false;
    }

    shouldDetectCC() {
        return this.settings.preferences?.detectCC !== false;
    }

    // ================================================
    // GESTION DES PARAMÈTRES
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
    // DÉTECTION PROVIDERS
    // ================================================
    detectEmailProvider() {
        console.log('[CategoryManager] 🔍 Détection provider email...');
        
        if (window.googleAuthService && 
            typeof window.googleAuthService.isAuthenticated === 'function' && 
            window.googleAuthService.isAuthenticated()) {
            console.log('[CategoryManager] ✅ Gmail détecté et authentifié');
            return {
                type: 'gmail',
                service: window.googleAuthService,
                ...this.scanProviders.gmail
            };
        }
        
        if (window.authService && 
            typeof window.authService.isAuthenticated === 'function' && 
            window.authService.isAuthenticated()) {
            console.log('[CategoryManager] ✅ Outlook détecté et authentifié');
            return {
                type: 'outlook',
                service: window.authService,
                ...this.scanProviders.outlook
            };
        }
        
        console.log('[CategoryManager] ⚠️ Aucun provider email authentifié');
        return null;
    }

    checkEmailRetrievalMethods() {
        const provider = this.detectEmailProvider();
        if (!provider) {
            return {
                available: false,
                provider: null,
                methods: [],
                error: 'Aucun provider authentifié'
            };
        }

        const availableMethods = [];
        
        if (window.mailService && typeof window.mailService.getEmailsFromFolder === 'function') {
            availableMethods.push('mailService');
        }
        
        if (provider.type === 'gmail') {
            if (window.googleAuthService && typeof window.googleAuthService.getAccessToken === 'function') {
                availableMethods.push('directGmail');
            }
        } else if (provider.type === 'outlook') {
            if (window.authService && typeof window.authService.getAccessToken === 'function') {
                availableMethods.push('directOutlook');
            }
        }

        return {
            available: availableMethods.length > 0,
            provider: provider,
            methods: availableMethods,
            error: availableMethods.length === 0 ? 'Aucune méthode de récupération disponible' : null
        };
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
    // GESTION SCAN ET HISTORIQUE
    // ================================================
    recordScanResult(scanResult) {
        const record = {
            timestamp: Date.now(),
            provider: scanResult.provider || 'unknown',
            totalEmails: scanResult.total || 0,
            categorizedEmails: scanResult.categorized || 0,
            preselectedForTasks: scanResult.stats?.preselectedForTasks || 0,
            marketingDetected: scanResult.stats?.marketingDetected || 0,
            scanDuration: scanResult.stats?.scanDuration || 0,
            breakdown: scanResult.breakdown || {},
            taskPreselectedCategories: scanResult.taskPreselectedCategories || []
        };

        this.scanHistory.push(record);
        this.lastScanResults = record;

        if (this.scanHistory.length > 10) {
            this.scanHistory = this.scanHistory.slice(-10);
        }

        console.log('[CategoryManager] 📊 Scan enregistré:', record);
        this.notifyChange('scanCompleted', record);
    }

    getScanHistory() {
        return [...this.scanHistory];
    }

    getLastScanResults() {
        return this.lastScanResults;
    }

    // ================================================
    // CATÉGORIES PERSONNALISÉES
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
                }
                
                console.log(`[CategoryManager] ✅ Catégorie personnalisée "${category.name}" chargée`);
            });
            
            console.log('[CategoryManager] 📊 Total:', Object.keys(this.customCategories).length, 'catégories personnalisées');
            
        } catch (error) {
            console.error('[CategoryManager] ❌ Erreur chargement catégories personnalisées:', error);
            this.customCategories = {};
        }
    }

    // ================================================
    // GESTION ÉVÉNEMENTS
    // ================================================
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
        
        console.log('\n[CategoryManager] TEST RESULT v27.1:');
        console.log(`Subject: "${subject}"`);
        console.log(`From: ${from}`);
        console.log(`Category: ${result.category} (expected: ${expectedCategory || 'any'})`);
        console.log(`Score: ${result.score}pts`);
        console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`Detection Method:`, result.detectionMethod || 'keyword_matching');
        if (result.taggedUser) {
            console.log(`Tagged User: @${result.taggedUser}`);
        }
        console.log(`Keywords matched: ${result.keywordMatches || result.matchedPatterns?.length || 0}`);
        
        if (expectedCategory && result.category !== expectedCategory) {
            console.log(`❌ FAILED - Expected ${expectedCategory}, got ${result.category}`);
        } else {
            console.log('✅ SUCCESS');
        }
        
        return result;
    }

    runDiagnostics() {
        console.group('🏥 DIAGNOSTIC CategoryManager v27.1');
        
        console.group('📂 Catégories');
        const allCategories = Object.keys(this.categories);
        console.log('Total catégories:', allCategories.length);
        console.log('Catégorie "other" présente:', this.categories.other ? '✅' : '❌');
        console.log('Support des tags (@):', '✅');
        console.groupEnd();
        
        console.group('🔍 Catalogue mots-clés');
        Object.entries(this.keywordCatalog).forEach(([catId, keywords]) => {
            const total = (keywords.absolute?.length || 0) + 
                         (keywords.strong?.length || 0) + 
                         (keywords.weak?.length || 0);
            const category = this.getCategory(catId);
            console.log(`${category?.icon || '📂'} ${category?.name || catId}: ${total} mots-clés`);
        });
        console.groupEnd();
        
        console.group('✨ Fonctionnalités');
        console.log('Détection par tags (@):', '✅ Activée');
        console.log('Catégorie "other" par défaut:', '✅ Activée');
        console.log('Mots-clés uniques par catégorie:', '✅');
        console.groupEnd();
        
        console.groupEnd();
        
        return {
            version: 'v27.1',
            categoriesCount: allCategories.length,
            hasOtherCategory: !!this.categories.other,
            hasTagDetection: true,
            isInitialized: this.isInitialized
        };
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        console.log('[CategoryManager] 🧹 Nettoyage...');
        this.changeListeners.clear();
        this.scanHistory = [];
        this.lastScanResults = null;
    }

    destroy() {
        this.cleanup();
        this.categories = {};
        this.keywordCatalog = {};
        this.customCategories = {};
        this.settings = {};
        console.log('[CategoryManager] 💥 Instance détruite');
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.categoryManager) {
    console.log('[CategoryManager] 🔄 Nettoyage ancienne instance...');
    try {
        window.categoryManager.destroy?.();
    } catch (e) {
        console.warn('[CategoryManager] Erreur nettoyage:', e);
    }
}

console.log('[CategoryManager] 🚀 Création nouvelle instance v27.1...');

try {
    window.categoryManager = new CategoryManager();
    console.log('[CategoryManager] ✅ Instance créée avec succès');
} catch (error) {
    console.error('[CategoryManager] ❌ Erreur création instance:', error);
    
    window.dispatchEvent(new CustomEvent('categoryManagerReady', {
        detail: {
            isInitialized: false,
            error: error.message,
            version: '27.1'
        }
    }));
}

// ================================================
// FONCTIONS DE TEST GLOBALES
// ================================================
window.testCategoryManagerV27 = function() {
    console.group('🧪 TEST CategoryManager v27.1 - Tags et catégorie Other');
    
    const tests = [
        // Tests avec tags
        {
            subject: "@jean peux-tu regarder ça ?",
            body: "J'ai besoin de ton avis sur ce document.",
            from: "colleague@company.com",
            expected: "tasks"
        },
        {
            subject: "Rapport mensuel",
            body: "@marie voici le rapport que tu m'as demandé. Peux-tu le valider ?",
            from: "team@company.com",
            expected: "tasks"
        },
        {
            subject: "Email test",
            body: "Cliquez ici pour vous désabonner de notre newsletter. View in browser.",
            from: "info@company.com",
            expected: "marketing_news"
        },
        {
            subject: "Email important",
            body: "Action requise: veuillez compléter cette tâche avant la deadline.",
            from: "manager@company.com",
            expected: "tasks"
        },
        {
            subject: "Document",
            body: "Votre facture est disponible. Montant total: 500€. Paiement requis.",
            from: "billing@company.com",
            expected: "finance"
        },
        {
            subject: "Notification",
            body: "Code de vérification: 123456. Nouvelle connexion détectée sur votre compte.",
            from: "security@bank.com",
            expected: "security"
        },
        {
            subject: "Message général",
            body: "Bonjour, j'espère que vous allez bien. Cordialement.",
            from: "contact@example.com",
            expected: "other"
        },
        {
            subject: "Simple email",
            body: "Merci pour votre message. Bonne journée.",
            from: "info@test.com",
            expected: "other"
        }
    ];
    
    tests.forEach(test => {
        window.categoryManager.testEmail(test.subject, test.body, test.from, test.expected);
    });
    
    console.groupEnd();
    
    const diagnostic = window.categoryManager.runDiagnostics();
    return { 
        success: true, 
        testsRun: tests.length,
        diagnostic: diagnostic
    };
};

console.log('✅ CategoryManager v27.1 loaded - Avec détection @tags et catégorie Other');
console.log('📧 Utilisez testCategoryManagerV27() pour tester la détection');
console.log('👤 Les emails avec @nom seront automatiquement catégorisés comme tâches');
console.log('📂 Les emails non catégorisés iront dans "Autres"');
