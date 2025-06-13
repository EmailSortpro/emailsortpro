// CategoryManager.js - Méthode initializeWeightedDetection() avec catalogue enrichi

initializeWeightedDetection() {
    this.weightedKeywords = {
        marketing_news: {
            absolute: [
                // Désabonnement français
                'se désinscrire', 'se desinscrire', 'désinscrire', 'desinscrire',
                'me désabonner', 'me desabonner', 'désabonner', 'desabonner',
                'stop email', 'stopper les emails', 'arrêter les emails', 'arreter les emails',
                'ne plus recevoir', 'cesser de recevoir', 'interrompre les envois',
                'gérer vos préférences', 'gérer mes préférences', 'gérer la réception',
                'gérer les préférences', 'gerer vos preferences', 'gerer mes preferences',
                'préférences de communication', 'preferences de communication',
                'préférences email', 'preferences email', 'préférences d\'email',
                'paramétrez vos choix', 'parametrez vos choix', 'paramétrer mes choix',
                'modifier vos préférences', 'modifier mes preferences',
                'vous ne souhaitez plus recevoir', 'ne souhaitez plus recevoir',
                'cliquez ici pour vous désabonner', 'lien de désabonnement',
                'retirer de la liste', 'supprimer de la liste d\'envoi',
                
                // Désabonnement anglais
                'unsubscribe', 'opt out', 'opt-out', 'optout',
                'unsubscribe from this list', 'remove me', 'remove from list',
                'stop receiving these emails', 'stop emails', 'cancel subscription',
                'email preferences', 'manage preferences', 'update preferences',
                'communication preferences', 'mailing preferences',
                'you are receiving this', 'this email was sent to',
                'why did i get this', 'why am i receiving this',
                'no longer wish to receive', 'don\'t want to receive',
                'click here to unsubscribe', 'unsubscribe link',
                'manage your subscription', 'update subscription',
                
                // Newsletter et marketing
                'newsletter', 'news letter', 'lettre d\'information', 'lettre d\'infos',
                'bulletin d\'information', 'infolettre', 'e-newsletter',
                'mailing list', 'liste de diffusion', 'liste d\'envoi',
                'campagne email', 'email campaign', 'campaign email',
                'marketing email', 'email marketing', 'email promotionnel',
                'message commercial', 'commercial message', 'publicité',
                
                // Promotions et offres
                'promotion', 'promo', 'promotionnel', 'promotional',
                'offre spéciale', 'offre limitée', 'offre exclusive',
                'special offer', 'limited offer', 'exclusive offer',
                'vente privée', 'private sale', 'vente flash', 'flash sale',
                'soldes', 'sales', 'réduction', 'discount', 'remise',
                'bon plan', 'bons plans', 'good deal', 'great deals',
                'black friday', 'cyber monday', 'french days',
                'code promo', 'code promotion', 'promo code', 'coupon',
                'jusqu\'à -', 'up to', '% de réduction', '% off',
                
                // Termes commerciaux
                'découvrez notre', 'decouvrez notre', 'discover our',
                'nouveautés', 'nouveautes', 'what\'s new', 'new arrivals',
                'collection', 'gamme', 'catalogue', 'catalog',
                'boutique en ligne', 'online shop', 'e-shop', 'eshop',
                'commandez maintenant', 'order now', 'acheter maintenant',
                'profitez de', 'take advantage', 'bénéficiez de',
                'offert', 'gratuit', 'free', 'cadeau', 'gift'
            ],
            strong: [
                // Marketing général
                'promo', 'deal', 'offer', 'sale', 'discount', 'remise',
                'newsletter', 'mailing', 'campaign', 'marketing',
                'exclusive', 'special', 'limited', 'new', 'nouveau',
                'boutique', 'shop', 'store', 'magasin', 'e-commerce',
                'catalogue', 'collection', 'produit', 'product',
                'commande', 'order', 'achat', 'purchase', 'buy',
                
                // Termes d'urgence
                'dernière chance', 'last chance', 'se termine', 'ends soon',
                'plus que', 'only', 'reste', 'left', 'stock limité',
                'dépêchez-vous', 'hurry', 'vite', 'quick', 'fast',
                
                // Call to action
                'cliquez', 'click', 'découvrir', 'discover', 'voir',
                'profiter', 'bénéficier', 'obtenir', 'get', 'claim',
                'inscription', 'subscribe', 's\'inscrire', 'register'
            ],
            weak: [
                'update', 'mise à jour', 'discover', 'new', 'nouveau',
                'information', 'info', 'news', 'actualité', 'actu',
                'événement', 'event', 'webinar', 'webinaire',
                'article', 'blog', 'contenu', 'content', 'guide',
                'tendance', 'trend', 'conseil', 'tips', 'astuce'
            ],
            exclusions: [
                'facture', 'invoice', 'reçu', 'receipt', 'commande confirmée',
                'order confirmed', 'mot de passe', 'password', 'sécurité',
                'security', 'urgent', 'action requise', 'required action'
            ]
        },

        security: {
            absolute: [
                // Alertes de connexion français
                'alerte de connexion', 'alert connexion', 'nouvelle connexion',
                'connexion détectée', 'connexion detectee', 'connexion suspecte',
                'tentative de connexion', 'connexion inhabituelle', 'connexion réussie',
                'connexion depuis un nouvel appareil', 'connexion nouvel appareil',
                'nouvelle connexion à votre compte', 'quelqu\'un s\'est connecté',
                
                // Alertes de connexion anglais
                'login alert', 'new sign-in', 'sign in detected', 'signin detected',
                'new login', 'login from new device', 'successful login',
                'someone signed in', 'unusual sign-in', 'suspicious login',
                'login attempt', 'failed login attempt', 'login activity',
                'new device login', 'unrecognized device', 'unknown device',
                
                // Activité suspecte
                'activité suspecte', 'activite suspecte', 'suspicious activity',
                'activité inhabituelle', 'unusual activity', 'anomalie détectée',
                'comportement suspect', 'suspicious behavior', 'alerte de sécurité',
                'security alert', 'alerte securite', 'avertissement de sécurité',
                'security warning', 'problème de sécurité', 'security issue',
                
                // Codes et vérification
                'code de vérification', 'code de verification', 'verification code',
                'code de sécurité', 'security code', 'code d\'authentification',
                'authentication code', 'code à usage unique', 'one-time code',
                'code temporaire', 'temporary code', 'code otp', 'otp code',
                'two-factor', '2fa', 'deux facteurs', '2 facteurs',
                'double authentification', 'authentification à deux facteurs',
                'two-factor authentication', 'multi-factor authentication',
                
                // Mots de passe
                'réinitialisation mot de passe', 'reinitialisation mot de passe',
                'réinitialiser votre mot de passe', 'password reset',
                'reset password', 'changer mot de passe', 'change password',
                'nouveau mot de passe', 'new password', 'mot de passe expiré',
                'password expired', 'mettre à jour mot de passe',
                'update password', 'modifier mot de passe',
                
                // Compte et accès
                'compte bloqué', 'compte verrouillé', 'account blocked',
                'account locked', 'accès refusé', 'access denied',
                'compte suspendu', 'account suspended', 'compte compromis',
                'account compromised', 'violation de sécurité', 'security breach'
            ],
            strong: [
                // Termes de sécurité
                'sécurité', 'securite', 'security', 'protection',
                'vérification', 'verification', 'verify', 'vérifier',
                'authentification', 'authentication', 'authentifier',
                'mot de passe', 'password', 'mdp', 'pass',
                'connexion', 'login', 'sign in', 'signin', 'log in',
                'compte', 'account', 'profil', 'profile',
                
                // Actions de sécurité
                'confirmer', 'confirm', 'valider', 'validate',
                'autoriser', 'authorize', 'approuver', 'approve',
                'bloquer', 'block', 'verrouiller', 'lock',
                'protéger', 'protect', 'sécuriser', 'secure',
                
                // Urgence sécurité
                'urgent', 'immédiat', 'immediate', 'critique',
                'critical', 'important', 'alerte', 'alert',
                'avertissement', 'warning', 'attention', 'caution'
            ],
            weak: [
                'compte', 'account', 'accès', 'access', 'utilisateur',
                'user', 'session', 'activité', 'activity', 'connexion',
                'dispositif', 'device', 'appareil', 'navigateur', 'browser',
                'localisation', 'location', 'ip', 'adresse', 'address'
            ],
            exclusions: [
                'newsletter', 'unsubscribe', 'désabonner', 'promotion',
                'offre', 'offer', 'marketing', 'publicité', 'soldes',
                'vente', 'sale', 'boutique', 'shop', 'commande', 'order'
            ]
        },

        tasks: {
            absolute: [
                // Actions requises français
                'action requise', 'action required', 'action nécessaire',
                'action à effectuer', 'action à réaliser', 'action demandée',
                'intervention requise', 'intervention nécessaire',
                'votre action est requise', 'nécessite votre action',
                'en attente de votre action', 'awaiting your action',
                
                // Complétion et validation
                'veuillez compléter', 'please complete', 'à compléter',
                'merci de compléter', 'compléter avant le', 'complete by',
                'finaliser', 'finalize', 'terminer', 'finish',
                'valider avant le', 'validate before', 'approuver avant',
                'approve before', 'confirmer avant', 'confirm before',
                
                // Tâches et assignations
                'tâche assignée', 'task assigned', 'nouvelle tâche',
                'new task', 'tâche à effectuer', 'tâche en attente',
                'pending task', 'tâche urgente', 'urgent task',
                'vous avez été assigné', 'you have been assigned',
                'assigné à vous', 'assigned to you', 'votre tâche',
                
                // Échéances et deadlines
                'deadline', 'échéance', 'echeance', 'date limite',
                'due date', 'date d\'échéance', 'à rendre avant',
                'dû le', 'due on', 'expire le', 'expires on',
                'dernier délai', 'final deadline', 'délai dépassé',
                'overdue', 'en retard', 'late', 'échu', 'expired',
                
                // Livrables et urgence
                'livrable', 'deliverable', 'à livrer', 'to deliver',
                'rendu attendu', 'expected delivery', 'document à fournir',
                'urgence', 'urgent', 'très urgent', 'extremely urgent',
                'priorité haute', 'high priority', 'critique', 'critical',
                'asap', 'dès que possible', 'as soon as possible',
                'immédiat', 'immediate', 'sans délai', 'without delay'
            ],
            strong: [
                // Termes d'action
                'urgent', 'urgence', 'asap', 'priority', 'priorité',
                'prioritaire', 'important', 'critique', 'critical',
                'compléter', 'complete', 'terminer', 'finish', 'finaliser',
                'action', 'faire', 'do', 'effectuer', 'réaliser',
                'tâche', 'task', 'mission', 'travail', 'work',
                
                // Termes de suivi
                'suivi', 'follow-up', 'followup', 'relance', 'reminder',
                'rappel', 'attente', 'waiting', 'pending', 'en cours',
                'à faire', 'todo', 'to do', 'to-do', 'checklist',
                
                // Responsabilité
                'responsable', 'responsible', 'assigné', 'assigned',
                'charge', 'in charge', 'délégué', 'delegated',
                'propriétaire', 'owner', 'pilote', 'lead'
            ],
            weak: [
                'demande', 'request', 'besoin', 'need', 'nécessaire',
                'necessary', 'attente', 'waiting', 'souhaité', 'wanted',
                'requis', 'required', 'obligatoire', 'mandatory',
                'facultatif', 'optional', 'prévu', 'planned', 'scheduled',
                'programme', 'agenda', 'planning', 'calendrier', 'timeline'
            ],
            exclusions: [
                'newsletter', 'marketing', 'promotion', 'publicité',
                'offre', 'offer', 'soldes', 'sale', 'boutique',
                'information', 'info', 'mise à jour', 'update',
                'notification automatique', 'automated', 'noreply'
            ]
        },

        meetings: {
            absolute: [
                // Demandes de réunion français
                'demande de réunion', 'meeting request', 'invitation réunion',
                'invitation à une réunion', 'convocation réunion', 'rdv',
                'rendez-vous', 'planifier une réunion', 'organiser une réunion',
                'programmer une réunion', 'schedule a meeting', 'book a meeting',
                
                // Invitations calendrier
                'invitation calendrier', 'calendar invitation', 'calendar invite',
                'événement calendrier', 'calendar event', 'nouvel événement',
                'invitation teams', 'teams meeting', 'réunion teams',
                'invitation zoom', 'zoom meeting', 'réunion zoom',
                'google meet', 'google hangout', 'skype meeting',
                'webex meeting', 'gotomeeting', 'join.me',
                
                // Confirmations et modifications
                'confirmer votre présence', 'confirm attendance', 'rsvp',
                'confirmer participation', 'accepter invitation', 'accept invite',
                'réunion confirmée', 'meeting confirmed', 'rdv confirmé',
                'réunion annulée', 'meeting cancelled', 'réunion reportée',
                'meeting postponed', 'changement d\'horaire', 'time change',
                'nouvelle date', 'new date', 'nouveau créneau', 'new slot',
                
                // Types de réunions
                'point hebdomadaire', 'weekly meeting', 'réunion hebdo',
                'daily meeting', 'standup', 'stand-up', 'point quotidien',
                'comité de pilotage', 'steering committee', 'copil',
                'réunion d\'équipe', 'team meeting', 'all hands',
                'one-on-one', '1:1', 'entretien', 'interview',
                'présentation', 'presentation', 'démonstration', 'demo'
            ],
            strong: [
                // Termes de réunion
                'meeting', 'réunion', 'reunion', 'rencontre', 'rdv',
                'rendez-vous', 'appointment', 'entretien', 'entrevue',
                'schedule', 'planifier', 'programmer', 'organiser',
                'calendrier', 'calendar', 'agenda', 'planning',
                
                // Platformes
                'teams', 'zoom', 'meet', 'skype', 'webex', 'hangout',
                'visio', 'visioconférence', 'videoconference', 'video',
                'conférence', 'conference', 'conf call', 'call',
                
                // Timing
                'horaire', 'time', 'heure', 'date', 'jour', 'day',
                'semaine', 'week', 'mois', 'month', 'créneau', 'slot',
                'disponibilité', 'availability', 'libre', 'free'
            ],
            weak: [
                'présentation', 'presentation', 'ordre du jour', 'agenda',
                'participant', 'attendee', 'invité', 'guest', 'organisateur',
                'organizer', 'salle', 'room', 'lieu', 'location', 'adresse',
                'lien', 'link', 'url', 'connexion', 'dial-in', 'code'
            ],
            exclusions: [
                'newsletter', 'promotion', 'marketing', 'offre', 'soldes',
                'unsubscribe', 'désabonner', 'publicité', 'boutique',
                'commande', 'order', 'facture', 'invoice', 'paiement'
            ]
        },

        commercial: {
            absolute: [
                // Documents commerciaux français
                'devis', 'devis commercial', 'proposition de devis',
                'demande de devis', 'nouveau devis', 'devis révisé',
                'quotation', 'quote', 'proposal', 'proposition',
                'proposition commerciale', 'offre commerciale', 'business proposal',
                
                // Contrats et commandes
                'contrat', 'contract', 'nouveau contrat', 'projet de contrat',
                'signature contrat', 'contract signature', 'à signer',
                'bon de commande', 'purchase order', 'po number',
                'ordre d\'achat', 'commande client', 'customer order',
                'confirmation de commande', 'order confirmation',
                
                // Opportunités et affaires
                'opportunité', 'opportunity', 'nouvelle opportunité',
                'lead qualifié', 'qualified lead', 'prospect qualifié',
                'affaire en cours', 'deal in progress', 'négociation',
                'closing', 'signature imminente', 'about to close',
                
                // Appels d'offres
                'appel d\'offre', 'appel d\'offres', 'tender', 'rfp',
                'request for proposal', 'rfq', 'request for quotation',
                'cahier des charges', 'specifications', 'consultation',
                'mise en concurrence', 'competitive bidding'
            ],
            strong: [
                // Termes commerciaux
                'client', 'customer', 'prospect', 'lead', 'contact',
                'commercial', 'sales', 'vente', 'business', 'affaire',
                'marché', 'market', 'deal', 'transaction', 'négoce',
                'partenaire', 'partner', 'fournisseur', 'supplier',
                
                // Actions commerciales
                'négociation', 'negotiation', 'proposition', 'proposal',
                'présentation', 'pitch', 'demo', 'démonstration',
                'offre', 'offer', 'tarif', 'pricing', 'prix', 'price',
                'remise', 'discount', 'conditions', 'terms',
                
                // Processus commercial
                'pipeline', 'funnel', 'entonnoir', 'conversion',
                'qualification', 'discovery', 'closing', 'signature',
                'renouvellement', 'renewal', 'upsell', 'cross-sell'
            ],
            weak: [
                'offre', 'proposition', 'négociation', 'discussion',
                'échange', 'exchange', 'rendez-vous', 'meeting',
                'présentation', 'information', 'documentation', 'brochure',
                'catalogue', 'tarifs', 'liste de prix', 'price list'
            ],
            exclusions: [
                'newsletter', 'marketing', 'unsubscribe', 'désabonner',
                'promotion générale', 'mass mailing', 'publicité',
                'spam', 'unsolicited', 'non sollicité'
            ]
        },

        finance: {
            absolute: [
                // Factures français
                'facture', 'facture à payer', 'nouvelle facture',
                'facture en attente', 'facture impayée', 'facture échue',
                'invoice', 'invoice due', 'unpaid invoice', 'new invoice',
                'outstanding invoice', 'overdue invoice', 'final invoice',
                
                // Paiements
                'paiement', 'payment', 'règlement', 'settlement',
                'paiement en attente', 'payment pending', 'paiement dû',
                'payment due', 'échéance de paiement', 'payment deadline',
                'rappel de paiement', 'payment reminder', 'mise en demeure',
                
                // Virements et transactions
                'virement', 'transfer', 'virement bancaire', 'bank transfer',
                'wire transfer', 'transaction', 'opération bancaire',
                'mouvement bancaire', 'bank transaction', 'crédit', 'débit',
                
                // Documents bancaires
                'relevé bancaire', 'bank statement', 'relevé de compte',
                'account statement', 'extrait de compte', 'bank extract',
                'solde bancaire', 'bank balance', 'position bancaire',
                
                // Remboursements et crédits
                'remboursement', 'refund', 'reimbursement', 'crédit',
                'avoir', 'credit note', 'note de crédit', 'trop perçu',
                'overpayment', 'régularisation', 'adjustment',
                
                // Documents fiscaux
                'déclaration fiscale', 'tax declaration', 'déclaration tva',
                'vat return', 'impôts', 'taxes', 'avis d\'imposition',
                'tax notice', 'échéance fiscale', 'tax deadline'
            ],
            strong: [
                // Termes financiers
                'montant', 'amount', 'somme', 'sum', 'total',
                'facture', 'invoice', 'paiement', 'payment', 'règlement',
                'fiscal', 'tax', 'tva', 'vat', 'taxe', 'impôt',
                'bancaire', 'bank', 'banking', 'compte', 'account',
                'finance', 'financial', 'financier', 'trésorerie', 'treasury',
                
                // Monnaies et valeurs
                'euro', 'eur', '€', 'dollar', 'usd', '$',
                'devise', 'currency', 'taux', 'rate', 'change',
                'prix', 'price', 'coût', 'cost', 'frais', 'fees',
                
                // Échéances
                'échéance', 'due date', 'deadline', 'terme', 'term',
                'délai', 'delay', 'retard', 'late', 'impayé', 'unpaid'
            ],
            weak: [
                'euro', 'dollar', 'montant', 'prix', 'valeur',
                'référence', 'numéro', 'number', 'date', 'période',
                'mois', 'month', 'année', 'year', 'exercice', 'fiscal year',
                'budget', 'prévision', 'forecast', 'rapport', 'report'
            ],
            exclusions: [
                'newsletter', 'marketing', 'promotion', 'publicité',
                'offre commerciale', 'devis', 'proposition', 'gratuit',
                'free', 'cadeau', 'gift', 'réduction', 'discount'
            ]
        },

        reminders: {
            absolute: [
                // Rappels français
                'rappel:', 'rappel :', 'reminder:', 'reminder :',
                'rappel amical', 'gentle reminder', 'rappel cordial',
                'friendly reminder', 'petit rappel', 'quick reminder',
                'dernier rappel', 'final reminder', 'last reminder',
                'rappel urgent', 'urgent reminder', 'rappel important',
                
                // Relances
                'relance', 'follow up', 'follow-up', 'followup',
                'je relance', 'following up', 'relance sur', 'follow up on',
                'suite à', 'following', 'en référence à', 'regarding',
                'concerning', 'au sujet de', 'about', 're:',
                
                // Formules de relance
                'je reviens vers vous', 'i\'m following up', 'circling back',
                'coming back to you', 'touching base', 'checking in',
                'je me permets de', 'i\'m reaching out', 'reaching back',
                'comme convenu', 'as discussed', 'as agreed', 'suite à notre',
                'further to our', 'faisant suite', 'in continuation'
            ],
            strong: [
                // Termes de rappel
                'reminder', 'rappel', 'follow', 'suivre', 'relance',
                'relancer', 'suite', 'continuation', 'poursuite',
                'convenu', 'agreed', 'discuté', 'discussed', 'mentionné',
                
                // Références temporelles
                'précédent', 'previous', 'dernier', 'last', 'avant',
                'earlier', 'antérieur', 'prior', 'déjà', 'already',
                
                // Actions de suivi
                'vérifier', 'check', 'confirmer', 'confirm', 'valider',
                'validate', 'actualiser', 'update', 'mettre à jour'
            ],
            weak: [
                'previous', 'discussed', 'mentioned', 'évoqué', 'parlé',
                'conversation', 'discussion', 'échange', 'exchange',
                'point', 'sujet', 'topic', 'question', 'demande', 'request'
            ],
            exclusions: [
                'newsletter', 'marketing', 'nouvelle', 'new', 'première',
                'first', 'initial', 'découvrir', 'discover', 'promotion'
            ]
        },

        support: {
            absolute: [
                // Tickets et références
                'ticket #', 'ticket n°', 'ticket number', 'numéro de ticket',
                'case #', 'case number', 'dossier n°', 'référence ticket',
                'incident #', 'incident number', 'numéro d\'incident',
                'request #', 'demande n°', 'sr #', 'service request',
                
                // Statuts de résolution
                'problème résolu', 'issue resolved', 'incident résolu',
                'ticket fermé', 'ticket closed', 'case closed',
                'résolution', 'resolution', 'solutionné', 'solved',
                'corrigé', 'fixed', 'réparé', 'repaired', 'traité',
                
                // Support et assistance
                'support technique', 'technical support', 'assistance technique',
                'help desk', 'helpdesk', 'service desk', 'centre d\'aide',
                'equipe support', 'support team', 'technicien', 'technician',
                
                // Escalade et priorité
                'escalade', 'escalation', 'escaladé', 'escalated',
                'priorité support', 'support priority', 'sla', 'service level',
                'temps de résolution', 'resolution time', 'délai intervention'
            ],
            strong: [
                // Termes de support
                'support', 'assistance', 'aide', 'help', 'helpdesk',
                'ticket', 'incident', 'problème', 'problem', 'issue',
                'bug', 'défaut', 'defect', 'erreur', 'error', 'panne',
                
                // Actions support
                'résoudre', 'resolve', 'réparer', 'fix', 'corriger',
                'dépanner', 'troubleshoot', 'diagnostiquer', 'diagnose',
                'intervenir', 'intervene', 'traiter', 'process',
                
                // Communication support
                'réponse', 'response', 'solution', 'résolution', 'statut',
                'status', 'mise à jour', 'update', 'suivi', 'follow-up'
            ],
            weak: [
                'help', 'aide', 'issue', 'problème', 'question',
                'demande', 'request', 'besoin', 'need', 'difficulté',
                'difficulty', 'technique', 'technical', 'système', 'system'
            ],
            exclusions: [
                'newsletter', 'marketing', 'promotion', 'offre', 'vente',
                'commercial', 'devis', 'facture', 'paiement', 'commande'
            ]
        },

        project: {
            absolute: [
                // Gestion de projet
                'projet', 'project', 'nouveau projet', 'new project',
                'chef de projet', 'project manager', 'manager de projet',
                'project lead', 'pilote projet', 'project owner',
                'équipe projet', 'project team', 'membres du projet',
                
                // Mises à jour projet
                'project update', 'mise à jour projet', 'update projet',
                'avancement projet', 'project progress', 'progression projet',
                'statut projet', 'project status', 'état du projet',
                'rapport de projet', 'project report', 'reporting projet',
                
                // Jalons et livrables
                'milestone', 'jalon', 'étape clé', 'key milestone',
                'livrable projet', 'project deliverable', 'deliverable',
                'phase projet', 'project phase', 'étape projet',
                'lot de travail', 'work package', 'workstream',
                
                // Méthodologies
                'sprint', 'iteration', 'itération', 'release', 'version',
                'backlog', 'user story', 'epic', 'feature', 'tâche',
                'scrum', 'agile', 'kanban', 'waterfall', 'cascade',
                'daily scrum', 'stand up', 'retrospective', 'retro',
                'sprint planning', 'sprint review', 'demo sprint',
                
                // Planning
                'gantt', 'planning projet', 'project timeline', 'roadmap',
                'plan projet', 'project plan', 'schedule', 'calendrier projet',
                'chemin critique', 'critical path', 'dépendance', 'dependency'
            ],
            strong: [
                // Termes projet
                'projet', 'project', 'programme', 'program', 'initiative',
                'milestone', 'jalon', 'phase', 'étape', 'stage',
                'sprint', 'release', 'version', 'itération', 'iteration',
                
                // Méthodologies
                'agile', 'scrum', 'kanban', 'lean', 'devops',
                'waterfall', 'cascade', 'pmbok', 'prince2',
                
                // Rôles et responsabilités
                'chef', 'manager', 'lead', 'pilote', 'owner',
                'responsable', 'coordinateur', 'coordinator', 'pmo',
                
                // Outils et artefacts
                'planning', 'timeline', 'roadmap', 'backlog', 'board',
                'dashboard', 'report', 'kpi', 'metric', 'indicateur'
            ],
            weak: [
                'development', 'développement', 'phase', 'planning',
                'équipe', 'team', 'ressource', 'resource', 'budget',
                'délai', 'deadline', 'risque', 'risk', 'issue', 'action'
            ],
            exclusions: [
                'newsletter', 'marketing', 'promotion', 'vente', 'commercial',
                'personnel', 'personal', 'privé', 'private', 'confidentiel'
            ]
        },

        hr: {
            absolute: [
                // Documents de paie
                'bulletin de paie', 'bulletin de salaire', 'fiche de paie',
                'payslip', 'pay slip', 'salary slip', 'pay stub',
                'relevé de salaire', 'salary statement', 'décompte de paie',
                
                // Contrats et documents RH
                'contrat de travail', 'employment contract', 'work contract',
                'avenant contrat', 'contract amendment', 'modification contrat',
                'attestation employeur', 'employment certificate', 'certificat travail',
                'attestation pôle emploi', 'unemployment certificate',
                
                // Congés et absences
                'congés', 'leave request', 'demande de congés', 'vacation request',
                'congés payés', 'paid leave', 'annual leave', 'vacances',
                'arrêt maladie', 'sick leave', 'medical leave', 'absence',
                'rtt', 'jour de récupération', 'recovery day', 'time off',
                
                // Processus RH
                'entretien annuel', 'annual review', 'performance review',
                'évaluation annuelle', 'yearly evaluation', 'appraisal',
                'entretien professionnel', 'professional interview', 'career review',
                'augmentation salaire', 'salary increase', 'raise', 'promotion',
                
                // Onboarding et formation
                'onboarding', 'intégration', 'integration', 'bienvenue',
                'welcome aboard', 'nouvel employé', 'new employee', 'new hire',
                'formation obligatoire', 'mandatory training', 'training required',
                'plan de formation', 'training plan', 'développement compétences'
            ],
            strong: [
                // Termes RH généraux
                'rh', 'hr', 'ressources humaines', 'human resources',
                'salaire', 'salary', 'paie', 'payroll', 'rémunération',
                'compensation', 'benefits', 'avantages', 'prime', 'bonus',
                
                // Documents et processus
                'contrat', 'contract', 'convention', 'agreement', 'accord',
                'formation', 'training', 'développement', 'development',
                'carrière', 'career', 'évolution', 'progression', 'mobilité',
                
                // Gestion du personnel
                'employé', 'employee', 'salarié', 'worker', 'personnel',
                'staff', 'équipe', 'team', 'effectif', 'workforce',
                'manager', 'responsable', 'hiérarchie', 'management'
            ],
            weak: [
                'employee', 'staff', 'personnel', 'équipe', 'team',
                'bureau', 'office', 'travail', 'work', 'emploi',
                'poste', 'position', 'fonction', 'role', 'département'
            ],
            exclusions: [
                'newsletter', 'marketing', 'client', 'customer', 'externe',
                'external', 'fournisseur', 'supplier', 'commercial', 'vente'
            ]
        },

        internal: {
            absolute: [
                // Communications d'entreprise
                'all staff', 'tout le personnel', 'tous les employés',
                'all employees', 'toute l\'équipe', 'whole team',
                'annonce interne', 'internal announcement', 'communication interne',
                'internal communication', 'note interne', 'internal memo',
                
                // Annonces officielles
                'company announcement', 'annonce entreprise', 'annonce société',
                'corporate communication', 'communication corporate', 'message direction',
                'management message', 'message du ceo', 'ceo message',
                'note de service', 'service note', 'circulaire', 'circular',
                
                // Communications RH groupe
                'memo interne', 'internal memo', 'mémo rh', 'hr memo',
                'politique interne', 'internal policy', 'procédure interne',
                'internal procedure', 'règlement intérieur', 'internal rules',
                
                // Événements internes
                'événement entreprise', 'company event', 'événement interne',
                'internal event', 'réunion générale', 'all hands meeting',
                'assemblée générale', 'general assembly', 'town hall'
            ],
            strong: [
                // Termes internes
                'internal', 'interne', 'company', 'entreprise', 'société',
                'corporate', 'organisation', 'organization', 'groupe', 'group',
                
                // Audience
                'personnel', 'staff', 'employés', 'employees', 'équipe',
                'collaborateurs', 'colleagues', 'collègues', 'workforce',
                
                // Types de communication
                'annonce', 'announcement', 'communication', 'information',
                'note', 'memo', 'message', 'update', 'nouvelle', 'news',
                
                // Caractère officiel
                'officiel', 'official', 'formel', 'formal', 'important',
                'mandatory', 'obligatoire', 'required', 'must read'
            ],
            weak: [
                'annonce', 'announcement', 'information', 'nouvelle',
                'update', 'message', 'communication', 'note', 'équipe',
                'team', 'company', 'entreprise', 'interne', 'internal'
            ],
            exclusions: [
                'newsletter', 'marketing', 'external', 'externe', 'client',
                'customer', 'public', 'presse', 'press', 'media', 'partner'
            ]
        },

        notifications: {
            absolute: [
                // Emails automatiques
                'do not reply', 'ne pas répondre', 'no-reply', 'noreply',
                'noreply@', 'no-reply@', 'donotreply@', 'do-not-reply@',
                'automated message', 'message automatique', 'automated email',
                'email automatique', 'notification automatique', 'automatic notification',
                
                // Messages système
                'system notification', 'notification système', 'system message',
                'message système', 'system alert', 'alerte système',
                'ceci est un message automatique', 'this is an automated message',
                'cet email est automatique', 'this email is automated',
                
                // Confirmations automatiques
                'confirmation automatique', 'automatic confirmation', 'auto-confirmation',
                'accusé de réception', 'acknowledgment', 'receipt confirmation',
                'bien reçu', 'well received', 'message reçu', 'message received',
                
                // Notifications de service
                'service notification', 'notification de service', 'platform notification',
                'notification plateforme', 'app notification', 'notification application',
                'alert automatique', 'automatic alert', 'rappel automatique'
            ],
            strong: [
                // Termes d'automatisation
                'automated', 'automatic', 'automatique', 'auto', 'système',
                'system', 'notification', 'alert', 'alerte', 'avertissement',
                
                // Types de notifications
                'confirmation', 'acknowledgment', 'receipt', 'accusé',
                'rappel', 'reminder', 'update', 'mise à jour', 'info',
                
                // Caractéristiques
                'no-reply', 'noreply', 'unmonitored', 'non surveillé',
                'generated', 'généré', 'triggered', 'déclenché'
            ],
            weak: [
                'notification', 'alert', 'message', 'email', 'info',
                'information', 'update', 'système', 'system', 'service',
                'automatic', 'auto', 'rappel', 'reminder', 'avis'
            ],
            exclusions: [
                'urgent', 'action required', 'action requise', 'répondre',
                'reply', 'answer', 'response needed', 'réponse nécessaire',
                'personnel', 'personal', 'confidentiel', 'confidential'
            ]
        },

        cc: {
            absolute: [
                // Copies et information
                'copie pour information', 'pour information', 'fyi',
                'for your information', 'à titre informatif', 'for info',
                'en copie', 'in copy', 'cc:', 'cc :', 'courtesy copy',
                'copie conforme', 'carbon copy', 'pour info', 'p.i.',
                
                // Mentions de copie
                'vous êtes en copie', 'you are in cc', 'mis en copie',
                'copied on this', 'en cc', 'in cc', 'ajouté en copie',
                'added in cc', 'copié sur ce mail', 'copied on this email',
                
                // Formules d'information
                'je vous mets en copie', 'i\'m copying you', 'putting you in cc',
                'adding you in copy', 'pour votre information', 'for your awareness',
                'à toutes fins utiles', 'for your records', 'pour archive'
            ],
            strong: [
                // Termes de copie
                'information', 'info', 'copie', 'copy', 'cc',
                'fyi', 'awareness', 'connaissance', 'notification',
                
                // Actions
                'informer', 'inform', 'notifier', 'notify', 'partager',
                'share', 'transmettre', 'forward', 'communiquer'
            ],
            weak: [
                'fyi', 'info', 'information', 'copie', 'copy',
                'pour', 'for', 'votre', 'your', 'connaissance', 'awareness'
            ],
            exclusions: [
                'action required', 'action requise', 'urgent', 'à faire',
                'to do', 'répondre', 'reply', 'answer', 'besoin', 'need'
            ]
        }
    };

    console.log('[CategoryManager] ✅ Catalogue de mots-clés enrichi pour', Object.keys(this.weightedKeywords).length, 'catégories');
    
    // Afficher les statistiques pour chaque catégorie
    Object.entries(this.weightedKeywords).forEach(([category, keywords]) => {
        const total = (keywords.absolute?.length || 0) + 
                     (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0) + 
                     (keywords.exclusions?.length || 0);
        console.log(`[CategoryManager] 📊 ${category}: ${total} mots-clés (${keywords.absolute?.length || 0} absolus)`);
    });
}
