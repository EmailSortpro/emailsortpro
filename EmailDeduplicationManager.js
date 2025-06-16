// EmailDeduplicationManager.js - Version 1.0 - Module indépendant pour la gestion des conversations

class EmailDeduplicationManager {
    constructor() {
        this.conversations = new Map();
        this.conversationMap = new Map(); // emailId -> conversationId
        this.duplicates = new Map();
        this.settings = {
            enableConversationGrouping: true,
            enableDuplicateDetection: true,
            subjectCleaningRules: [
                { pattern: /^(RE|FW|FWD|TR):\s*/i, replace: '' },
                { pattern: /\s*\[.*?\]\s*/g, replace: '' },
                { pattern: /\s*\(.*?\)\s*/g, replace: '' },
                { pattern: /\s+/g, replace: ' ' }
            ],
            conversationTimeout: 7 * 24 * 60 * 60 * 1000, // 7 jours
            duplicateThreshold: 0.85,
            maxConversationSize: 50
        };
        
        console.log('[EmailDeduplicationManager] ✅ Module initialisé');
    }

    // ================================================
    // MÉTHODE PRINCIPALE - TRAITEMENT COMPLET
    // ================================================
    processEmails(emails) {
        console.log('[EmailDeduplicationManager] 🔍 === DÉBUT TRAITEMENT ===');
        console.log('[EmailDeduplicationManager] 📧 Emails à traiter:', emails.length);
        
        if (!emails || emails.length === 0) {
            console.log('[EmailDeduplicationManager] ⚠️ Aucun email à traiter');
            return {
                deduplicated: [],
                stats: {
                    original: 0,
                    conversations: 0,
                    duplicatesRemoved: 0,
                    final: 0
                }
            };
        }

        // Réinitialiser les structures
        this.conversations.clear();
        this.conversationMap.clear();
        this.duplicates.clear();

        // Créer une copie des emails pour éviter de modifier l'original
        const emailsCopy = emails.map(email => ({ ...email }));
        
        // ÉTAPE 1: Détecter et supprimer les doublons exacts
        const withoutDuplicates = this.removeDuplicates(emailsCopy);
        
        // ÉTAPE 2: Grouper en conversations
        const conversationGroups = this.groupIntoConversations(withoutDuplicates);
        
        // ÉTAPE 3: Sélectionner le dernier email de chaque conversation
        const deduplicatedEmails = this.selectLatestFromConversations(conversationGroups);
        
        const stats = {
            original: emails.length,
            withoutDuplicates: withoutDuplicates.length,
            conversations: conversationGroups.length,
            duplicatesRemoved: emails.length - withoutDuplicates.length,
            conversationsCollapsed: conversationGroups.length - deduplicatedEmails.length,
            final: deduplicatedEmails.length
        };
        
        console.log('[EmailDeduplicationManager] 📊 === RÉSULTATS TRAITEMENT ===');
        console.log('[EmailDeduplicationManager] 📈 Stats:', stats);
        console.log('[EmailDeduplicationManager] ✅ Emails finaux:', deduplicatedEmails.length);
        
        return {
            deduplicated: deduplicatedEmails,
            conversations: conversationGroups,
            duplicates: Array.from(this.duplicates.values()),
            stats: stats
        };
    }

    // ================================================
    // DÉTECTION ET SUPPRESSION DES DOUBLONS EXACTS
    // ================================================
    removeDuplicates(emails) {
        console.log('[EmailDeduplicationManager] 🔍 Détection des doublons...');
        
        const uniqueEmails = [];
        const seenHashes = new Set();
        const duplicateGroups = new Map();
        
        emails.forEach(email => {
            const hash = this.generateEmailHash(email);
            
            if (seenHashes.has(hash)) {
                // Email dupliqué trouvé
                if (!duplicateGroups.has(hash)) {
                    duplicateGroups.set(hash, []);
                }
                duplicateGroups.get(hash).push(email);
                
                console.log('[EmailDeduplicationManager] 📋 Doublon détecté:', {
                    subject: email.subject?.substring(0, 50),
                    from: email.from?.emailAddress?.address,
                    date: email.receivedDateTime
                });
            } else {
                seenHashes.add(hash);
                uniqueEmails.push(email);
                
                // Marquer comme email original
                email._deduplicationInfo = {
                    isOriginal: true,
                    hash: hash,
                    duplicateCount: 0
                };
            }
        });
        
        // Mettre à jour les informations de déduplication
        duplicateGroups.forEach((duplicates, hash) => {
            const originalEmail = uniqueEmails.find(e => 
                e._deduplicationInfo?.hash === hash
            );
            
            if (originalEmail) {
                originalEmail._deduplicationInfo.duplicateCount = duplicates.length;
                originalEmail._deduplicationInfo.duplicates = duplicates.map(d => ({
                    id: d.id,
                    date: d.receivedDateTime,
                    from: d.from?.emailAddress?.address
                }));
            }
            
            this.duplicates.set(hash, {
                original: originalEmail,
                duplicates: duplicates,
                count: duplicates.length
            });
        });
        
        console.log('[EmailDeduplicationManager] ✅ Doublons supprimés:', 
            emails.length - uniqueEmails.length);
        
        return uniqueEmails;
    }

    // ================================================
    // GÉNÉRATION DE HASH POUR DÉTECTION DOUBLONS
    // ================================================
    generateEmailHash(email) {
        // Utiliser plusieurs propriétés pour créer un hash unique
        const parts = [
            email.subject?.trim() || '',
            email.from?.emailAddress?.address?.toLowerCase() || '',
            this.normalizeDate(email.receivedDateTime),
            (email.bodyPreview || '').substring(0, 100).trim()
        ];
        
        return this.simpleHash(parts.join('|'));
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir en 32 bits
        }
        return Math.abs(hash).toString(36);
    }

    normalizeDate(dateStr) {
        try {
            const date = new Date(dateStr);
            // Normaliser à la minute près pour éviter les micro-différences
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date.toISOString();
        } catch (e) {
            return dateStr;
        }
    }

    // ================================================
    // GROUPEMENT EN CONVERSATIONS
    // ================================================
    groupIntoConversations(emails) {
        console.log('[EmailDeduplicationManager] 🗂️ Groupement en conversations...');
        
        const conversations = new Map();
        const processedEmails = [...emails];
        
        // Trier par date (plus récent en premier)
        processedEmails.sort((a, b) => 
            new Date(b.receivedDateTime) - new Date(a.receivedDateTime)
        );
        
        processedEmails.forEach(email => {
            const conversationKey = this.generateConversationKey(email);
            
            if (!conversations.has(conversationKey)) {
                conversations.set(conversationKey, {
                    key: conversationKey,
                    subject: this.cleanSubject(email.subject),
                    participants: new Set(),
                    emails: [],
                    latestDate: null,
                    earliestDate: null,
                    thread: []
                });
            }
            
            const conversation = conversations.get(conversationKey);
            
            // Ajouter l'email à la conversation
            conversation.emails.push(email);
            conversation.thread.push({
                id: email.id,
                date: email.receivedDateTime,
                from: email.from?.emailAddress?.address,
                subject: email.subject,
                isReply: this.isReply(email.subject),
                isForward: this.isForward(email.subject)
            });
            
            // Mettre à jour les participants
            if (email.from?.emailAddress?.address) {
                conversation.participants.add(email.from.emailAddress.address);
            }
            
            // Mettre à jour les dates
            const emailDate = new Date(email.receivedDateTime);
            if (!conversation.latestDate || emailDate > conversation.latestDate) {
                conversation.latestDate = emailDate;
            }
            if (!conversation.earliestDate || emailDate < conversation.earliestDate) {
                conversation.earliestDate = emailDate;
            }
            
            // Marquer l'email avec les infos de conversation
            email._conversationInfo = {
                conversationKey: conversationKey,
                subject: conversation.subject,
                threadPosition: conversation.emails.length,
                isLatest: false // Sera mis à jour plus tard
            };
            
            // Mapper l'email à sa conversation
            this.conversationMap.set(email.id, conversationKey);
        });
        
        // Trier les emails dans chaque conversation par date
        conversations.forEach(conversation => {
            conversation.emails.sort((a, b) => 
                new Date(a.receivedDateTime) - new Date(b.receivedDateTime)
            );
            
            conversation.thread.sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
            
            // Marquer le dernier email de chaque conversation
            if (conversation.emails.length > 0) {
                const latestEmail = conversation.emails[conversation.emails.length - 1];
                latestEmail._conversationInfo.isLatest = true;
                
                console.log('[EmailDeduplicationManager] 📎 Conversation:', {
                    subject: conversation.subject.substring(0, 50),
                    emails: conversation.emails.length,
                    participants: conversation.participants.size,
                    latest: latestEmail.subject?.substring(0, 30),
                    span: `${conversation.earliestDate?.toLocaleDateString()} - ${conversation.latestDate?.toLocaleDateString()}`
                });
            }
        });
        
        const conversationArray = Array.from(conversations.values());
        
        console.log('[EmailDeduplicationManager] ✅ Conversations créées:', conversationArray.length);
        
        return conversationArray;
    }

    // ================================================
    // GÉNÉRATION DE CLÉ DE CONVERSATION
    // ================================================
    generateConversationKey(email) {
        const subject = this.cleanSubject(email.subject);
        const participants = this.extractParticipants(email);
        
        // Créer une clé basée sur le sujet nettoyé et les participants principaux
        const participantKey = participants.sort().slice(0, 3).join('|');
        return this.simpleHash(`${subject}|${participantKey}`);
    }

    cleanSubject(subject) {
        if (!subject) return 'Sans sujet';
        
        let cleaned = subject.trim();
        
        // Appliquer les règles de nettoyage
        this.settings.subjectCleaningRules.forEach(rule => {
            cleaned = cleaned.replace(rule.pattern, rule.replace);
        });
        
        return cleaned.trim() || 'Sans sujet';
    }

    extractParticipants(email) {
        const participants = new Set();
        
        // Expéditeur
        if (email.from?.emailAddress?.address) {
            participants.add(email.from.emailAddress.address.toLowerCase());
        }
        
        // Destinataires TO
        if (email.toRecipients) {
            email.toRecipients.forEach(recipient => {
                if (recipient.emailAddress?.address) {
                    participants.add(recipient.emailAddress.address.toLowerCase());
                }
            });
        }
        
        // Destinataires CC
        if (email.ccRecipients) {
            email.ccRecipients.forEach(recipient => {
                if (recipient.emailAddress?.address) {
                    participants.add(recipient.emailAddress.address.toLowerCase());
                }
            });
        }
        
        return Array.from(participants);
    }

    isReply(subject) {
        return /^RE:\s*/i.test(subject || '');
    }

    isForward(subject) {
        return /^(FW|FWD|TR):\s*/i.test(subject || '');
    }

    // ================================================
    // SÉLECTION DU DERNIER EMAIL DE CHAQUE CONVERSATION
    // ================================================
    selectLatestFromConversations(conversations) {
        console.log('[EmailDeduplicationManager] 🎯 Sélection des derniers emails...');
        
        const selectedEmails = [];
        let conversationsCollapsed = 0;
        
        conversations.forEach(conversation => {
            if (conversation.emails.length === 0) return;
            
            // Prendre le dernier email (le plus récent)
            const latestEmail = conversation.emails[conversation.emails.length - 1];
            
            // Enrichir avec les informations de conversation
            latestEmail._conversationSummary = {
                totalEmails: conversation.emails.length,
                participants: Array.from(conversation.participants),
                timeSpan: {
                    start: conversation.earliestDate,
                    end: conversation.latestDate
                },
                hasReplies: conversation.emails.length > 1,
                hasForwards: conversation.thread.some(t => t.isForward),
                thread: conversation.thread
            };
            
            // Si c'est une conversation (plus d'un email), marquer comme compressée
            if (conversation.emails.length > 1) {
                latestEmail._isConversationHead = true;
                latestEmail._hiddenEmails = conversation.emails.slice(0, -1).map(e => ({
                    id: e.id,
                    subject: e.subject,
                    from: e.from?.emailAddress?.address,
                    date: e.receivedDateTime,
                    category: e.category,
                    bodyPreview: e.bodyPreview?.substring(0, 100)
                }));
                
                conversationsCollapsed++;
                
                console.log('[EmailDeduplicationManager] 📦 Conversation compressée:', {
                    subject: conversation.subject.substring(0, 50),
                    totalEmails: conversation.emails.length,
                    hiddenEmails: conversation.emails.length - 1,
                    timeSpan: `${conversation.earliestDate?.toLocaleDateString()} - ${conversation.latestDate?.toLocaleDateString()}`
                });
            }
            
            selectedEmails.push(latestEmail);
        });
        
        console.log('[EmailDeduplicationManager] ✅ Sélection terminée:', {
            selected: selectedEmails.length,
            conversationsCollapsed: conversationsCollapsed,
            emailsHidden: conversations.reduce((sum, c) => sum + Math.max(0, c.emails.length - 1), 0)
        });
        
        return selectedEmails;
    }

    // ================================================
    // MÉTHODES D'ACCÈS AUX DONNÉES
    // ================================================
    getConversationById(conversationKey) {
        return this.conversations.get(conversationKey);
    }

    getEmailConversation(emailId) {
        const conversationKey = this.conversationMap.get(emailId);
        return conversationKey ? this.conversations.get(conversationKey) : null;
    }

    getHiddenEmails(emailId) {
        const conversation = this.getEmailConversation(emailId);
        if (!conversation || conversation.emails.length <= 1) {
            return [];
        }
        
        // Retourner tous les emails sauf le dernier
        return conversation.emails.slice(0, -1);
    }

    getDuplicatesInfo() {
        return Array.from(this.duplicates.values());
    }

    getConversationStats() {
        const stats = {
            totalConversations: this.conversations.size,
            totalEmails: 0,
            singleEmailConversations: 0,
            multiEmailConversations: 0,
            longestConversation: 0,
            averageConversationLength: 0,
            totalParticipants: new Set(),
            duplicatesFound: this.duplicates.size
        };
        
        this.conversations.forEach(conversation => {
            stats.totalEmails += conversation.emails.length;
            
            if (conversation.emails.length === 1) {
                stats.singleEmailConversations++;
            } else {
                stats.multiEmailConversations++;
            }
            
            if (conversation.emails.length > stats.longestConversation) {
                stats.longestConversation = conversation.emails.length;
            }
            
            conversation.participants.forEach(p => stats.totalParticipants.add(p));
        });
        
        stats.averageConversationLength = stats.totalConversations > 0 ? 
            Math.round((stats.totalEmails / stats.totalConversations) * 100) / 100 : 0;
        
        stats.totalParticipants = stats.totalParticipants.size;
        
        return stats;
    }

    // ================================================
    // MÉTHODES UTILITAIRES POUR L'INTERFACE
    // ================================================
    expandConversation(emailId) {
        const conversation = this.getEmailConversation(emailId);
        if (!conversation) {
            return [];
        }
        
        return conversation.emails.map(email => ({
            ...email,
            _inConversation: true,
            _conversationSize: conversation.emails.length,
            _conversationPosition: conversation.emails.indexOf(email) + 1
        }));
    }

    getConversationPreview(emailId, maxEmails = 3) {
        const hiddenEmails = this.getHiddenEmails(emailId);
        if (hiddenEmails.length === 0) {
            return null;
        }
        
        const preview = hiddenEmails.slice(-maxEmails).map(email => ({
            from: email.from?.emailAddress?.name || email.from?.emailAddress?.address,
            date: new Date(email.receivedDateTime).toLocaleDateString('fr-FR'),
            subject: email.subject?.substring(0, 50),
            preview: email.bodyPreview?.substring(0, 80)
        }));
        
        return {
            emails: preview,
            totalHidden: hiddenEmails.length,
            hasMore: hiddenEmails.length > maxEmails
        };
    }

    // ================================================
    // RECHERCHE DANS LES CONVERSATIONS
    // ================================================
    searchInConversations(query, includeHidden = false) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        this.conversations.forEach(conversation => {
            const emailsToSearch = includeHidden ? 
                conversation.emails : 
                [conversation.emails[conversation.emails.length - 1]];
            
            emailsToSearch.forEach(email => {
                const matches = this.emailMatchesQuery(email, searchTerm);
                if (matches.length > 0) {
                    results.push({
                        email: email,
                        matches: matches,
                        conversation: {
                            subject: conversation.subject,
                            totalEmails: conversation.emails.length,
                            isHidden: includeHidden && email !== conversation.emails[conversation.emails.length - 1]
                        }
                    });
                }
            });
        });
        
        return results;
    }

    emailMatchesQuery(email, searchTerm) {
        const matches = [];
        
        if (email.subject?.toLowerCase().includes(searchTerm)) {
            matches.push({ field: 'subject', value: email.subject });
        }
        
        if (email.bodyPreview?.toLowerCase().includes(searchTerm)) {
            matches.push({ field: 'body', value: email.bodyPreview.substring(0, 100) });
        }
        
        if (email.from?.emailAddress?.address?.toLowerCase().includes(searchTerm)) {
            matches.push({ field: 'from', value: email.from.emailAddress.address });
        }
        
        if (email.from?.emailAddress?.name?.toLowerCase().includes(searchTerm)) {
            matches.push({ field: 'fromName', value: email.from.emailAddress.name });
        }
        
        return matches;
    }

    // ================================================
    // CONFIGURATION ET PARAMÈTRES
    // ================================================
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        console.log('[EmailDeduplicationManager] ⚙️ Paramètres mis à jour:', this.settings);
    }

    getSettings() {
        return { ...this.settings };
    }

    // ================================================
    // MÉTHODES DE DEBUG ET EXPORT
    // ================================================
    debugConversations(limit = 10) {
        console.group('[EmailDeduplicationManager] 🐛 DEBUG Conversations');
        
        const conversations = Array.from(this.conversations.values())
            .sort((a, b) => b.emails.length - a.emails.length)
            .slice(0, limit);
        
        conversations.forEach(conversation => {
            console.log(`📎 ${conversation.subject}`);
            console.log(`  - Emails: ${conversation.emails.length}`);
            console.log(`  - Participants: ${Array.from(conversation.participants).join(', ')}`);
            console.log(`  - Période: ${conversation.earliestDate?.toLocaleDateString()} - ${conversation.latestDate?.toLocaleDateString()}`);
            console.log(`  - Thread:`, conversation.thread.map(t => `${t.from} (${new Date(t.date).toLocaleDateString()})`));
        });
        
        console.groupEnd();
    }

    exportConversationData() {
        const data = {
            exportDate: new Date().toISOString(),
            settings: this.settings,
            stats: this.getConversationStats(),
            conversations: Array.from(this.conversations.values()).map(conversation => ({
                key: conversation.key,
                subject: conversation.subject,
                participants: Array.from(conversation.participants),
                emailCount: conversation.emails.length,
                timeSpan: {
                    start: conversation.earliestDate,
                    end: conversation.latestDate
                },
                thread: conversation.thread
            })),
            duplicates: this.getDuplicatesInfo().map(dup => ({
                count: dup.count,
                originalSubject: dup.original?.subject,
                originalDate: dup.original?.receivedDateTime
            }))
        };
        
        return JSON.stringify(data, null, 2);
    }

    // ================================================
    // MÉTHODES DE VALIDATION
    // ================================================
    validateConversationIntegrity() {
        console.log('[EmailDeduplicationManager] 🔍 Validation de l\'intégrité...');
        
        const issues = [];
        let totalEmails = 0;
        
        this.conversations.forEach((conversation, key) => {
            totalEmails += conversation.emails.length;
            
            // Vérifier que chaque email a bien une référence de conversation
            conversation.emails.forEach(email => {
                if (!email._conversationInfo) {
                    issues.push(`Email ${email.id} sans info de conversation`);
                }
                
                if (email._conversationInfo?.conversationKey !== key) {
                    issues.push(`Email ${email.id} avec clé de conversation incorrecte`);
                }
            });
            
            // Vérifier l'ordre chronologique
            for (let i = 1; i < conversation.emails.length; i++) {
                const prev = new Date(conversation.emails[i-1].receivedDateTime);
                const curr = new Date(conversation.emails[i].receivedDateTime);
                
                if (prev > curr) {
                    issues.push(`Conversation ${key}: ordre chronologique incorrect`);
                    break;
                }
            }
        });
        
        const validationResult = {
            isValid: issues.length === 0,
            issues: issues,
            stats: {
                conversations: this.conversations.size,
                totalEmails: totalEmails,
                mappedEmails: this.conversationMap.size
            }
        };
        
        if (validationResult.isValid) {
            console.log('[EmailDeduplicationManager] ✅ Intégrité validée');
        } else {
            console.warn('[EmailDeduplicationManager] ⚠️ Problèmes détectés:', issues);
        }
        
        return validationResult;
    }

    // ================================================
    // NETTOYAGE ET DESTRUCTION
    // ================================================
    cleanup() {
        console.log('[EmailDeduplicationManager] 🧹 Nettoyage...');
        
        this.conversations.clear();
        this.conversationMap.clear();
        this.duplicates.clear();
        
        console.log('[EmailDeduplicationManager] ✅ Nettoyage terminé');
    }

    destroy() {
        this.cleanup();
        this.settings = null;
        console.log('[EmailDeduplicationManager] Instance détruite');
    }
}

// ================================================
// CRÉATION DE L'INSTANCE GLOBALE
// ================================================
if (window.emailDeduplicationManager) {
    console.log('[EmailDeduplicationManager] 🔄 Nettoyage ancienne instance...');
    window.emailDeduplicationManager.destroy?.();
}

console.log('[EmailDeduplicationManager] 🚀 Création nouvelle instance...');
window.emailDeduplicationManager = new EmailDeduplicationManager();

// ================================================
// INTÉGRATION AVEC EMAILSCANNER (MÉTHODE SÉPARÉE)
// ================================================

// Fonction utilitaire pour intégrer la déduplication dans EmailScanner
window.integrateEmailDeduplication = function() {
    if (!window.emailScanner || !window.emailDeduplicationManager) {
        console.error('[Integration] EmailScanner ou EmailDeduplicationManager manquant');
        return false;
    }
    
    console.log('[Integration] 🔗 Intégration de la déduplication...');
    
    // Sauvegarder la méthode originale de scan
    if (!window.emailScanner._originalScan) {
        window.emailScanner._originalScan = window.emailScanner.scan.bind(window.emailScanner);
    }
    
    // Remplacer la méthode scan avec déduplication
    window.emailScanner.scan = async function(options = {}) {
        console.log('[EmailScanner] 🔄 Scan avec déduplication activée');
        
        // Appeler le scan original
        const originalResult = await this._originalScan(options);
        
        if (!originalResult || !originalResult.emails || originalResult.emails.length === 0) {
            console.log('[EmailScanner] Aucun email à dédupliquer');
            return originalResult;
        }
        
        // Appliquer la déduplication
        console.log('[EmailScanner] 📧 Application de la déduplication...');
        const deduplicationResult = window.emailDeduplicationManager.processEmails(originalResult.emails);
        
        // Mettre à jour les résultats
        this.emails = deduplicationResult.deduplicated;
        
        // Recalculer les catégories avec les emails dédupliqués
        this.categorizedEmails = {};
        if (window.categoryManager) {
            await this.categorizeEmails();
        }
        
        // Mettre à jour les statistiques
        const updatedResults = this.getDetailedResults();
        updatedResults.deduplication = deduplicationResult.stats;
        updatedResults.conversations = deduplicationResult.conversations.length;
        
        console.log('[EmailScanner] ✅ Déduplication terminée:', {
            original: deduplicationResult.stats.original,
            final: deduplicationResult.stats.final,
            conversations: deduplicationResult.conversations.length,
            duplicatesRemoved: deduplicationResult.stats.duplicatesRemoved
        });
        
        return updatedResults;
    };
    
    // Ajouter des méthodes utilitaires à EmailScanner
    window.emailScanner.getConversationEmails = function(emailId) {
        return window.emailDeduplicationManager.expandConversation(emailId);
    };
    
    window.emailScanner.getEmailConversationPreview = function(emailId) {
        return window.emailDeduplicationManager.getConversationPreview(emailId);
    };
    
    window.emailScanner.searchInAllEmails = function(query, includeHidden = false) {
        return window.emailDeduplicationManager.searchInConversations(query, includeHidden);
    };
    
    console.log('[Integration] ✅ Intégration terminée');
    return true;
};

// ================================================
// MÉTHODES DE TEST GLOBALES
// ================================================
window.testEmailDeduplication = function() {
    console.group('🧪 TEST EmailDeduplication');
    
    // Créer des emails de test avec conversations
    const testEmails = [
        {
            id: 'email1',
            subject: 'Projet Alpha - Planning initial',
            from: { emailAddress: { address: 'alice@example.com', name: 'Alice' } },
            receivedDateTime: '2024-01-15T09:00:00Z',
            bodyPreview: 'Voici le planning initial du projet Alpha...'
        },
        {
            id: 'email2',
            subject: 'RE: Projet Alpha - Planning initial',
            from: { emailAddress: { address: 'bob@example.com', name: 'Bob' } },
            receivedDateTime: '2024-01-15T10:30:00Z',
            bodyPreview: 'Merci Alice, quelques questions sur le planning...'
        },
        {
            id: 'email3',
            subject: 'RE: Projet Alpha - Planning initial',
            from: { emailAddress: { address: 'alice@example.com', name: 'Alice' } },
            receivedDateTime: '2024-01-15T14:00:00Z',
            bodyPreview: 'Réponses à tes questions Bob...'
        },
        {
            id: 'email4',
            subject: 'Newsletter Mars 2024',
            from: { emailAddress: { address: 'news@company.com', name: 'Company News' } },
            receivedDateTime: '2024-01-16T08:00:00Z',
            bodyPreview: 'Voici les actualités de mars...'
        },
        // Doublon exact
        {
            id: 'email5',
            subject: 'Newsletter Mars 2024',
            from: { emailAddress: { address: 'news@company.com', name: 'Company News' } },
            receivedDateTime: '2024-01-16T08:00:00Z',
            bodyPreview: 'Voici les actualités de mars...'
        }
    ];
    
    console.log('Emails de test:', testEmails.length);
    
    const result = window.emailDeduplicationManager.processEmails(testEmails);
    
    console.log('Résultat déduplication:', result.stats);
    console.log('Emails finaux:', result.deduplicated.length);
    console.log('Conversations:', result.conversations.length);
    
    // Test des méthodes utilitaires
    if (result.deduplicated.length > 0) {
        const firstEmail = result.deduplicated[0];
        const preview = window.emailDeduplicationManager.getConversationPreview(firstEmail.id);
        console.log('Preview conversation:', preview);
    }
    
    // Validation de l'intégrité
    const validation = window.emailDeduplicationManager.validateConversationIntegrity();
    console.log('Validation:', validation);
    
    // Debug des conversations
    window.emailDeduplicationManager.debugConversations(3);
    
    console.groupEnd();
    
    return {
        success: true,
        stats: result.stats,
        validation: validation
    };
};

window.debugEmailConversations = function() {
    console.group('📊 DEBUG Conversations');
    
    const stats = window.emailDeduplicationManager.getConversationStats();
    console.log('Statistiques:', stats);
    
    const duplicates = window.emailDeduplicationManager.getDuplicatesInfo();
    console.log('Doublons:', duplicates.length);
    
    window.emailDeduplicationManager.debugConversations();
    
    console.groupEnd();
    
    return { stats, duplicates };
};

console.log('✅ EmailDeduplicationManager v1.0 loaded - Module de gestion des conversations et doublons');  // À la fin du fichier EmailDeduplicationManager.js
window.addEventListener('DOMContentLoaded', () => {
    // Attendre que tous les modules soient chargés
    setTimeout(() => {
        if (window.emailScanner && window.emailDeduplicationManager) {
            window.integrateEmailDeduplication();
            console.log('✅ Déduplication automatiquement activée');
        }
    }, 1000);
});
