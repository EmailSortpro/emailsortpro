// EmailDeduplicationManager.js - Version 2.1 - CORRECTION BOUCLE INFINIE

console.log('[EmailDeduplicationManager] 🚀 Création nouvelle instance v2.1...');

class EmailDeduplicationManager {
    constructor() {
        this.duplicateGroups = new Map();
        this.conversationThreads = new Map();
        this.emailIndex = new Map();
        this.stats = {
            totalEmails: 0,
            duplicatesFound: 0,
            conversationsFound: 0,
            spaceReclaimed: 0
        };
        
        // CORRECTION: Système d'intégration non-bloquant
        this.integrationAttempts = 0;
        this.maxIntegrationAttempts = 10;
        this.integrationTimeout = null;
        this.isIntegrated = false;
        
        console.log('[EmailDeduplicationManager] ✅ Module initialisé v2.1');
        
        // Démarrer l'intégration de façon sécurisée
        this.startSafeIntegration();
    }

    // ================================================
    // SYSTÈME D'INTÉGRATION SÉCURISÉ (NOUVEAU)
    // ================================================
    startSafeIntegration() {
        // Attendre un délai initial plus long
        setTimeout(() => {
            this.attemptIntegration();
        }, 2000);
    }

    attemptIntegration() {
        if (this.isIntegrated) {
            console.log('[EmailDeduplicationManager] ✅ Déjà intégré, arrêt des tentatives');
            return;
        }

        if (this.integrationAttempts >= this.maxIntegrationAttempts) {
            console.warn('[EmailDeduplicationManager] ⚠️ Nombre max de tentatives d\'intégration atteint');
            console.log('[EmailDeduplicationManager] ℹ️ Module fonctionnel en mode autonome');
            return;
        }

        this.integrationAttempts++;
        console.log(`[EmailDeduplicationManager] 🔄 Tentative d'intégration ${this.integrationAttempts}/${this.maxIntegrationAttempts}`);

        if (window.emailScanner && typeof window.emailScanner.getAllEmails === 'function') {
            console.log('[EmailDeduplicationManager] ✅ EmailScanner détecté, intégration...');
            this.performIntegration();
            this.isIntegrated = true;
        } else {
            console.log('[EmailDeduplicationManager] ⏳ EmailScanner non disponible, nouvelle tentative dans 3s');
            
            // Programmer la prochaine tentative avec un délai croissant
            const delay = Math.min(3000 + (this.integrationAttempts * 1000), 10000);
            
            if (this.integrationTimeout) {
                clearTimeout(this.integrationTimeout);
            }
            
            this.integrationTimeout = setTimeout(() => {
                this.attemptIntegration();
            }, delay);
        }
    }

    performIntegration() {
        try {
            console.log('[EmailDeduplicationManager] 🔗 Intégration avec EmailScanner...');
            
            // Ajouter la méthode de déduplication à EmailScanner si elle n'existe pas
            if (!window.emailScanner.analyzeForDuplicates) {
                window.emailScanner.analyzeForDuplicates = () => {
                    const emails = window.emailScanner.getAllEmails();
                    return this.analyzeDuplicates(emails);
                };
                console.log('[EmailDeduplicationManager] ➕ Méthode analyzeForDuplicates ajoutée');
            }
            
            // Ajouter la méthode de suppression des doublons
            if (!window.emailScanner.removeDuplicateEmails) {
                window.emailScanner.removeDuplicateEmails = async () => {
                    const analysis = window.emailScanner.analyzeForDuplicates();
                    if (analysis.duplicateGroups.size > 0) {
                        return await this.removeDuplicates(analysis.duplicateGroups);
                    }
                    return 0;
                };
                console.log('[EmailDeduplicationManager] ➕ Méthode removeDuplicateEmails ajoutée');
            }
            
            // Ajouter méthode d'accès au manager
            if (!window.emailScanner.getDeduplicationManager) {
                window.emailScanner.getDeduplicationManager = () => this;
                console.log('[EmailDeduplicationManager] ➕ Méthode getDeduplicationManager ajoutée');
            }
            
            console.log('[EmailDeduplicationManager] ✅ Intégration réussie avec EmailScanner');
            
            // Nettoyer le timeout
            if (this.integrationTimeout) {
                clearTimeout(this.integrationTimeout);
                this.integrationTimeout = null;
            }
            
        } catch (error) {
            console.error('[EmailDeduplicationManager] ❌ Erreur lors de l\'intégration:', error);
            this.isIntegrated = false;
        }
    }

    // ================================================
    // MÉTHODES PRINCIPALES (inchangées)
    // ================================================
    
    analyzeDuplicates(emails) {
        if (!Array.isArray(emails)) {
            console.warn('[EmailDeduplicationManager] emails doit être un tableau');
            return { duplicateGroups: new Map(), stats: this.stats };
        }

        console.log(`[EmailDeduplicationManager] 🔍 Analyse de ${emails.length} emails...`);
        
        this.reset();
        this.stats.totalEmails = emails.length;
        
        // Indexer tous les emails
        emails.forEach(email => {
            this.indexEmail(email);
        });
        
        // Identifier les doublons
        this.findDuplicates();
        
        // Identifier les conversations
        this.findConversations();
        
        console.log('[EmailDeduplicationManager] ✅ Analyse terminée:', this.stats);
        
        return {
            duplicateGroups: this.duplicateGroups,
            conversationThreads: this.conversationThreads,
            stats: this.stats
        };
    }

    indexEmail(email) {
        if (!email || !email.id) return;
        
        // Créer une clé de déduplication
        const dedupKey = this.createDedupKey(email);
        
        if (!this.emailIndex.has(dedupKey)) {
            this.emailIndex.set(dedupKey, []);
        }
        
        this.emailIndex.get(dedupKey).push(email);
    }

    createDedupKey(email) {
        // Clé basée sur: expéditeur + sujet normalisé + date approximative
        const sender = email.from?.emailAddress?.address || 'unknown';
        const subject = this.normalizeSubject(email.subject || '');
        const date = email.receivedDateTime ? 
            new Date(email.receivedDateTime).toISOString().split('T')[0] : 
            'unknown';
        
        return `${sender}|${subject}|${date}`;
    }

    normalizeSubject(subject) {
        // Retirer les préfixes RE:, FW:, etc.
        return subject
            .toLowerCase()
            .replace(/^(re:|fw:|fwd:|tr:|rép:|réf:)\s*/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    findDuplicates() {
        this.emailIndex.forEach((emails, key) => {
            if (emails.length > 1) {
                // Trier par date pour garder le plus récent
                emails.sort((a, b) => 
                    new Date(b.receivedDateTime) - new Date(a.receivedDateTime)
                );
                
                this.duplicateGroups.set(key, {
                    original: emails[0],
                    duplicates: emails.slice(1),
                    count: emails.length,
                    spaceWasted: this.calculateSpaceWasted(emails.slice(1))
                });
                
                this.stats.duplicatesFound += emails.length - 1;
            }
        });
    }

    findConversations() {
        // Grouper par sujet normalisé
        const subjectGroups = new Map();
        
        this.emailIndex.forEach((emails) => {
            emails.forEach(email => {
                const normalizedSubject = this.normalizeSubject(email.subject || '');
                
                if (!subjectGroups.has(normalizedSubject)) {
                    subjectGroups.set(normalizedSubject, []);
                }
                
                subjectGroups.get(normalizedSubject).push(email);
            });
        });
        
        // Identifier les conversations (plus de 2 emails avec le même sujet)
        subjectGroups.forEach((emails, subject) => {
            if (emails.length > 2) {
                // Trier par date
                emails.sort((a, b) => 
                    new Date(a.receivedDateTime) - new Date(b.receivedDateTime)
                );
                
                this.conversationThreads.set(subject, {
                    subject: emails[0].subject || subject,
                    emails: emails,
                    participants: this.extractParticipants(emails),
                    count: emails.length,
                    dateRange: {
                        start: emails[0].receivedDateTime,
                        end: emails[emails.length - 1].receivedDateTime
                    }
                });
                
                this.stats.conversationsFound++;
            }
        });
    }

    extractParticipants(emails) {
        const participants = new Set();
        
        emails.forEach(email => {
            if (email.from?.emailAddress?.address) {
                participants.add(email.from.emailAddress.address);
            }
            
            if (email.toRecipients) {
                email.toRecipients.forEach(recipient => {
                    if (recipient.emailAddress?.address) {
                        participants.add(recipient.emailAddress.address);
                    }
                });
            }
        });
        
        return Array.from(participants);
    }

    calculateSpaceWasted(duplicates) {
        let totalSize = 0;
        
        duplicates.forEach(email => {
            // Estimation approximative de la taille
            const subjectSize = (email.subject || '').length;
            const bodySize = (email.bodyPreview || '').length * 10; // Estimation
            const attachmentsSize = email.hasAttachments ? 500000 : 0; // 500KB par défaut
            
            totalSize += subjectSize + bodySize + attachmentsSize;
        });
        
        this.stats.spaceReclaimed += totalSize;
        return totalSize;
    }

    // ================================================
    // ACTIONS SUR LES DOUBLONS
    // ================================================
    
    async removeDuplicates(duplicateGroups) {
        console.log('[EmailDeduplicationManager] 🗑️ Suppression des doublons...');
        
        const toDelete = [];
        
        duplicateGroups.forEach(group => {
            toDelete.push(...group.duplicates.map(d => d.id));
        });
        
        if (toDelete.length > 0) {
            console.log(`[EmailDeduplicationManager] Suppression de ${toDelete.length} doublons`);
            
            // Appeler EmailScanner pour supprimer
            if (window.emailScanner?.performBatchAction) {
                await window.emailScanner.performBatchAction(toDelete, 'delete');
            }
            
            return toDelete.length;
        }
        
        return 0;
    }

    // ================================================
    // MÉTHODES D'ANALYSE
    // ================================================
    
    getSummary() {
        return {
            ...this.stats,
            duplicateGroups: this.duplicateGroups.size,
            conversations: this.conversationThreads.size,
            potentialSavings: this.formatBytes(this.stats.spaceReclaimed),
            isIntegrated: this.isIntegrated,
            integrationAttempts: this.integrationAttempts
        };
    }

    getDuplicatesForEmail(emailId) {
        for (const [key, group] of this.duplicateGroups) {
            if (group.original.id === emailId || 
                group.duplicates.some(d => d.id === emailId)) {
                return group;
            }
        }
        return null;
    }

    getConversationForEmail(emailId) {
        for (const [subject, thread] of this.conversationThreads) {
            if (thread.emails.some(e => e.id === emailId)) {
                return thread;
            }
        }
        return null;
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    reset() {
        this.duplicateGroups.clear();
        this.conversationThreads.clear();
        this.emailIndex.clear();
        this.stats = {
            totalEmails: 0,
            duplicatesFound: 0,
            conversationsFound: 0,
            spaceReclaimed: 0
        };
    }

    // ================================================
    // EXPORT DES RÉSULTATS
    // ================================================
    
    exportAnalysis() {
        const analysis = {
            summary: this.getSummary(),
            duplicates: [],
            conversations: []
        };
        
        // Exporter les groupes de doublons
        this.duplicateGroups.forEach((group, key) => {
            analysis.duplicates.push({
                key,
                original: {
                    id: group.original.id,
                    subject: group.original.subject,
                    from: group.original.from?.emailAddress?.address,
                    date: group.original.receivedDateTime
                },
                duplicatesCount: group.count - 1,
                spaceWasted: this.formatBytes(group.spaceWasted)
            });
        });
        
        // Exporter les conversations
        this.conversationThreads.forEach((thread, subject) => {
            analysis.conversations.push({
                subject: thread.subject,
                emailsCount: thread.count,
                participants: thread.participants,
                dateRange: thread.dateRange
            });
        });
        
        return analysis;
    }

    // ================================================
    // MÉTHODES DE NETTOYAGE
    // ================================================
    cleanup() {
        console.log('[EmailDeduplicationManager] 🧹 Nettoyage...');
        
        if (this.integrationTimeout) {
            clearTimeout(this.integrationTimeout);
            this.integrationTimeout = null;
        }
        
        this.reset();
        this.isIntegrated = false;
        this.integrationAttempts = 0;
    }

    destroy() {
        this.cleanup();
        console.log('[EmailDeduplicationManager] 💥 Instance détruite');
    }

    // ================================================
    // MÉTHODES DE DEBUG
    // ================================================
    getDebugInfo() {
        return {
            isIntegrated: this.isIntegrated,
            integrationAttempts: this.integrationAttempts,
            maxIntegrationAttempts: this.maxIntegrationAttempts,
            hasIntegrationTimeout: !!this.integrationTimeout,
            emailScannerAvailable: !!window.emailScanner,
            emailScannerMethods: window.emailScanner ? Object.keys(window.emailScanner) : [],
            stats: this.stats,
            duplicateGroups: this.duplicateGroups.size,
            conversationThreads: this.conversationThreads.size,
            version: '2.1'
        };
    }

    forceIntegration() {
        console.log('[EmailDeduplicationManager] 🔄 Force intégration...');
        this.integrationAttempts = 0;
        this.isIntegrated = false;
        
        if (this.integrationTimeout) {
            clearTimeout(this.integrationTimeout);
            this.integrationTimeout = null;
        }
        
        this.attemptIntegration();
    }
}

// ================================================
// INITIALISATION SÉCURISÉE
// ================================================

// Nettoyer l'ancienne instance
if (window.emailDeduplicationManager) {
    console.log('[EmailDeduplicationManager] 🔄 Nettoyage ancienne instance...');
    window.emailDeduplicationManager.destroy?.();
    delete window.emailDeduplicationManager;
}

// Créer la nouvelle instance
window.emailDeduplicationManager = new EmailDeduplicationManager();

// Méthodes globales de debug et contrôle
window.debugEmailDeduplication = function() {
    console.group('🔍 DEBUG EmailDeduplicationManager v2.1');
    
    const manager = window.emailDeduplicationManager;
    if (!manager) {
        console.error('❌ EmailDeduplicationManager non disponible');
        console.groupEnd();
        return;
    }
    
    const debugInfo = manager.getDebugInfo();
    console.log('Debug Info:', debugInfo);
    
    if (debugInfo.isIntegrated) {
        console.log('✅ Intégration réussie avec EmailScanner');
    } else {
        console.warn(`⚠️ Intégration en cours (${debugInfo.integrationAttempts}/${debugInfo.maxIntegrationAttempts})`);
    }
    
    console.log('EmailScanner disponible:', debugInfo.emailScannerAvailable);
    if (debugInfo.emailScannerAvailable) {
        console.log('Méthodes EmailScanner:', debugInfo.emailScannerMethods);
    }
    
    console.groupEnd();
    return debugInfo;
};

window.forceEmailDeduplicationIntegration = function() {
    if (window.emailDeduplicationManager) {
        window.emailDeduplicationManager.forceIntegration();
        return { success: true, message: 'Intégration forcée' };
    }
    return { success: false, message: 'Manager non disponible' };
};

window.testEmailDeduplication = function() {
    console.group('🧪 TEST EmailDeduplicationManager');
    
    const manager = window.emailDeduplicationManager;
    if (!manager) {
        console.error('❌ Manager non disponible');
        console.groupEnd();
        return;
    }
    
    // Test avec des emails factices
    const testEmails = [
        {
            id: '1',
            subject: 'Test Email',
            from: { emailAddress: { address: 'test@example.com' } },
            receivedDateTime: '2024-01-01T10:00:00Z',
            bodyPreview: 'Ceci est un test'
        },
        {
            id: '2',
            subject: 'RE: Test Email',
            from: { emailAddress: { address: 'test@example.com' } },
            receivedDateTime: '2024-01-01T10:05:00Z',
            bodyPreview: 'Ceci est un test'
        },
        {
            id: '3',
            subject: 'Test Email',
            from: { emailAddress: { address: 'test@example.com' } },
            receivedDateTime: '2024-01-01T10:01:00Z',
            bodyPreview: 'Ceci est un test (doublon)'
        }
    ];
    
    const result = manager.analyzeDuplicates(testEmails);
    console.log('Résultat test:', result);
    console.log('Summary:', manager.getSummary());
    
    console.groupEnd();
    return result;
};

console.log('✅ EmailDeduplicationManager v2.1 loaded - Correction boucle infinie');
