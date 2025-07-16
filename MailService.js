// MailService.js - Version 3.1 - Service unifié avec détection améliorée des méthodes
// Fusion optimisée pour gérer correctement Gmail et Outlook

class MailService {
    constructor() {
        this.currentProvider = null;
        this._isInitialized = false;
        this.authServices = {
            google: window.googleAuthService,
            gmail: window.googleAuthService,
            microsoft: window.authService,
            outlook: window.authService
        };
        
        console.log('[MailService] v3.1 - Service unifié avec détection améliorée');
        this.detectAvailableMethods();
    }

    // ================================================
    // DÉTECTION DES MÉTHODES DISPONIBLES
    // ================================================
    detectAvailableMethods() {
        console.log('[MailService] 🔍 Détection des méthodes disponibles...');
        
        // Détecter les méthodes pour Google/Gmail
        if (window.googleAuthService) {
            console.log('[MailService] Gmail - Méthodes disponibles:');
            console.log('  - fetchEmails:', typeof window.googleAuthService.fetchEmails === 'function');
            console.log('  - getMessages:', typeof window.googleAuthService.getMessages === 'function');
            console.log('  - isAuthenticated:', typeof window.googleAuthService.isAuthenticated === 'function');
            console.log('  - initialize:', typeof window.googleAuthService.initialize === 'function');
        }
        
        // Détecter les méthodes pour Microsoft/Outlook
        if (window.authService) {
            console.log('[MailService] Outlook - Méthodes disponibles:');
            console.log('  - fetchEmails:', typeof window.authService.fetchEmails === 'function');
            console.log('  - getMessages:', typeof window.authService.getMessages === 'function');
            console.log('  - isAuthenticated:', typeof window.authService.isAuthenticated === 'function');
            console.log('  - initialize:', typeof window.authService.initialize === 'function');
        }
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        if (this._isInitialized) {
            return true;
        }

        try {
            console.log('[MailService] Initialisation...');
            
            // Détecter le provider actif
            this.detectActiveProvider();
            
            // Initialiser le service approprié
            if (this.currentProvider) {
                const service = this.authServices[this.currentProvider];
                if (service) {
                    // Vérifier si le service a besoin d'initialisation
                    if (typeof service.initialize === 'function') {
                        console.log(`[MailService] Initialisation du service ${this.currentProvider}...`);
                        await service.initialize();
                    } else if (typeof service.isInitialized === 'function' && !service.isInitialized()) {
                        console.log(`[MailService] Le service ${this.currentProvider} n'est pas initialisé et n'a pas de méthode initialize`);
                    } else {
                        console.log(`[MailService] Le service ${this.currentProvider} est déjà prêt`);
                    }
                }
            }
            
            this._isInitialized = true;
            console.log('[MailService] ✅ Initialisé avec provider:', this.currentProvider);
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur initialisation:', error);
            this._isInitialized = false;
            throw error;
        }
    }

    // ================================================
    // VÉRIFICATION D'INITIALISATION
    // ================================================
    isInitialized() {
        return this._isInitialized;
    }

    // ================================================
    // DÉTECTION DU PROVIDER
    // ================================================
    detectActiveProvider() {
        console.log('[MailService] 🔍 Détection du provider actif...');
        
        // Vérifier Gmail
        if (window.googleAuthService) {
            try {
                let isAuth = false;
                if (typeof window.googleAuthService.isAuthenticated === 'function') {
                    isAuth = window.googleAuthService.isAuthenticated();
                } else if (window.googleAuthService.isAuthenticated === true) {
                    isAuth = true;
                }
                
                if (isAuth) {
                    this.currentProvider = 'google';
                    console.log('[MailService] ✅ Gmail actif et authentifié');
                    return 'google';
                }
            } catch (e) {
                console.warn('[MailService] Erreur vérification Gmail:', e);
            }
        }
        
        // Vérifier Outlook
        if (window.authService) {
            try {
                let isAuth = false;
                if (typeof window.authService.isAuthenticated === 'function') {
                    isAuth = window.authService.isAuthenticated();
                } else if (window.authService.isAuthenticated === true) {
                    isAuth = true;
                }
                
                if (isAuth) {
                    this.currentProvider = 'microsoft';
                    console.log('[MailService] ✅ Outlook actif et authentifié');
                    return 'microsoft';
                }
            } catch (e) {
                console.warn('[MailService] Erreur vérification Outlook:', e);
            }
        }
        
        console.log('[MailService] ⚠️ Aucun provider authentifié détecté');
        return null;
    }

    // ================================================
    // GESTION DU PROVIDER
    // ================================================
    getCurrentProvider() {
        if (!this.currentProvider) {
            this.detectActiveProvider();
        }
        return this.currentProvider;
    }

    async setProvider(provider) {
        const normalizedProvider = this.normalizeProvider(provider);
        console.log('[MailService] Changement de provider:', normalizedProvider);
        
        this.currentProvider = normalizedProvider;
        
        // Réinitialiser l'état d'initialisation
        this._isInitialized = false;
        
        // Initialiser le nouveau service
        await this.initialize();
        
        return normalizedProvider;
    }

    normalizeProvider(provider) {
        if (!provider) return null;
        
        const providerLower = provider.toLowerCase();
        if (providerLower === 'gmail' || providerLower === 'google') {
            return 'google';
        }
        if (providerLower === 'outlook' || providerLower === 'microsoft') {
            return 'microsoft';
        }
        return provider;
    }

    // ================================================
    // AUTHENTIFICATION
    // ================================================
    async authenticate(provider) {
        const normalizedProvider = this.normalizeProvider(provider);
        const service = this.authServices[normalizedProvider];
        
        if (!service) {
            throw new Error(`Service non disponible pour ${provider}`);
        }
        
        console.log(`[MailService] Authentification ${normalizedProvider}...`);
        
        if (typeof service.login === 'function') {
            await service.login();
            this.currentProvider = normalizedProvider;
            this._isInitialized = false; // Forcer la réinitialisation
            await this.initialize();
        } else {
            throw new Error(`Méthode login non disponible pour ${provider}`);
        }
    }

    isAuthenticated() {
        if (!this.currentProvider) {
            this.detectActiveProvider();
        }
        
        if (!this.currentProvider) {
            return false;
        }
        
        const service = this.authServices[this.currentProvider];
        if (!service) {
            return false;
        }
        
        // Vérifier l'authentification
        if (typeof service.isAuthenticated === 'function') {
            return service.isAuthenticated();
        } else if (service.isAuthenticated === true) {
            return true;
        }
        
        return false;
    }

    // ================================================
    // RÉCUPÉRATION DES MESSAGES - CONTENU COMPLET
    // ================================================
    async getMessages(folder = 'INBOX', options = {}) {
        console.log('[MailService] 📧 Récupération des messages...');
        console.log('[MailService] Provider:', this.currentProvider);
        console.log('[MailService] Options:', options);
        
        // S'assurer que le service est initialisé
        if (!this._isInitialized) {
            await this.initialize();
        }
        
        if (!this.isAuthenticated()) {
            throw new Error('Non authentifié');
        }
        
        const service = this.authServices[this.currentProvider];
        if (!service) {
            throw new Error('Service non disponible');
        }
        
        try {
            // Préparer les options avec extraction complète
            const fetchOptions = {
                ...options,
                folder: folder,
                maxResults: options.maxResults || -1, // Par défaut : pas de limite
                days: options.days || 7,
                includeSpam: options.includeSpam || false,
                includeFullContent: true, // Forcer l'extraction complète
                onProgress: options.onProgress
            };
            
            // Détecter la méthode disponible pour ce service
            let emails = [];
            let methodUsed = null;
            
            // Ordre de priorité des méthodes à essayer
            const methodsToTry = [
                { name: 'fetchEmails', check: () => typeof service.fetchEmails === 'function' },
                { name: 'getMessages', check: () => typeof service.getMessages === 'function' },
                { name: 'fetchMessages', check: () => typeof service.fetchMessages === 'function' },
                { name: 'getAllEmails', check: () => typeof service.getAllEmails === 'function' }
            ];
            
            // Essayer chaque méthode dans l'ordre
            for (const method of methodsToTry) {
                if (method.check()) {
                    console.log(`[MailService] Utilisation de la méthode: ${method.name}`);
                    methodUsed = method.name;
                    
                    try {
                        switch (method.name) {
                            case 'fetchEmails':
                                emails = await service.fetchEmails(fetchOptions);
                                break;
                            case 'getMessages':
                                emails = await service.getMessages(folder, fetchOptions);
                                break;
                            case 'fetchMessages':
                                emails = await service.fetchMessages(fetchOptions);
                                break;
                            case 'getAllEmails':
                                emails = await service.getAllEmails(fetchOptions);
                                break;
                        }
                        
                        // Si on a récupéré des emails, arrêter
                        if (emails && (Array.isArray(emails) || emails.length >= 0)) {
                            break;
                        }
                    } catch (methodError) {
                        console.warn(`[MailService] Erreur avec ${method.name}:`, methodError);
                        // Continuer avec la méthode suivante
                    }
                }
            }
            
            // Si aucune méthode n'a fonctionné
            if (!methodUsed) {
                // Dernière tentative : chercher une méthode générique
                console.log('[MailService] ⚠️ Aucune méthode standard trouvée, recherche de méthodes alternatives...');
                
                // Lister toutes les méthodes disponibles du service
                const availableMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(service))
                    .filter(prop => typeof service[prop] === 'function')
                    .filter(name => name.includes('mail') || name.includes('email') || name.includes('message'));
                
                console.log('[MailService] Méthodes disponibles:', availableMethods);
                
                throw new Error(`Aucune méthode de récupération disponible pour ${this.currentProvider}. Méthodes du service: ${availableMethods.join(', ')}`);
            }
            
            console.log(`[MailService] ✅ ${emails.length} emails récupérés via ${methodUsed}`);
            
            // S'assurer que chaque email a le contenu complet
            const processedEmails = emails.map(email => this.ensureCompleteContent(email));
            
            return processedEmails;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération messages:', error);
            
            // Diagnostic supplémentaire
            console.log('[MailService] 🔍 Diagnostic du service:');
            console.log('  - Service existe:', !!service);
            console.log('  - Service type:', typeof service);
            console.log('  - Service constructor:', service?.constructor?.name);
            
            // Lister toutes les propriétés du service
            if (service) {
                const props = Object.getOwnPropertyNames(service);
                const proto = Object.getPrototypeOf(service);
                const protoProps = proto ? Object.getOwnPropertyNames(proto) : [];
                
                console.log('  - Propriétés directes:', props);
                console.log('  - Propriétés prototype:', protoProps);
            }
            
            throw error;
        }
    }

    // ================================================
    // ASSURER LE CONTENU COMPLET
    // ================================================
    ensureCompleteContent(email) {
        // S'assurer que l'email a tous les champs nécessaires
        if (!email.fullTextContent && (email.body?.content || email.bodyText || email.bodyHtml)) {
            // Reconstruire le contenu complet si nécessaire
            let fullText = '';
            
            // Ajouter le sujet (important pour la catégorisation)
            if (email.subject) {
                fullText += email.subject + ' ' + email.subject + ' ' + email.subject + '\n\n';
            }
            
            // Ajouter l'expéditeur
            if (email.from?.emailAddress) {
                const fromEmail = email.from.emailAddress.address || email.from.emailAddress || '';
                const fromName = email.from.emailAddress.name || email.from.name || '';
                fullText += `De: ${fromName} <${fromEmail}>\n`;
                
                // Ajouter le domaine
                if (fromEmail.includes('@')) {
                    const domain = fromEmail.split('@')[1];
                    fullText += `Domaine: ${domain}\n`;
                }
            } else if (email.from) {
                // Format alternatif pour l'expéditeur
                const fromStr = typeof email.from === 'string' ? email.from : JSON.stringify(email.from);
                fullText += `De: ${fromStr}\n`;
            }
            
            // Ajouter la date
            if (email.receivedDateTime) {
                fullText += `Date: ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}\n`;
            } else if (email.date) {
                fullText += `Date: ${new Date(email.date).toLocaleString('fr-FR')}\n`;
            }
            
            fullText += '\n';
            
            // Ajouter le corps avec les balises pour préserver les liens
            if (email.body?.content) {
                if (email.body.contentType === 'html' || email.body.content.includes('<')) {
                    // Conserver le HTML brut pour détecter les patterns
                    fullText += '[HTML_CONTENT]\n' + email.body.content + '\n[/HTML_CONTENT]\n\n';
                    
                    // Extraire aussi le texte
                    const textContent = this.extractTextFromHtml(email.body.content);
                    fullText += '[TEXT_CONTENT]\n' + textContent + '\n[/TEXT_CONTENT]\n';
                } else {
                    fullText += '[TEXT_CONTENT]\n' + email.body.content + '\n[/TEXT_CONTENT]\n';
                }
            } else if (email.bodyHtml) {
                fullText += '[HTML_CONTENT]\n' + email.bodyHtml + '\n[/HTML_CONTENT]\n\n';
                const textContent = this.extractTextFromHtml(email.bodyHtml);
                fullText += '[TEXT_CONTENT]\n' + textContent + '\n[/TEXT_CONTENT]\n';
            } else if (email.bodyText) {
                fullText += '[TEXT_CONTENT]\n' + email.bodyText + '\n[/TEXT_CONTENT]\n';
            } else if (email.bodyPreview) {
                fullText += '[PREVIEW]\n' + email.bodyPreview + '\n[/PREVIEW]\n';
            }
            
            // Ajouter le snippet Gmail si disponible
            if (email.gmailMetadata?.snippet && !fullText.includes(email.gmailMetadata.snippet)) {
                fullText += '\n[SNIPPET]\n' + email.gmailMetadata.snippet + '\n[/SNIPPET]\n';
            }
            
            // Ajouter les métadonnées
            if (email.hasAttachments) {
                fullText += '\n[ATTACHMENTS]';
            }
            
            if (email.importance === 'high') {
                fullText += '\n[HIGH_PRIORITY]';
            }
            
            // Ajouter les labels Gmail
            if (email.labelIds && Array.isArray(email.labelIds)) {
                fullText += '\n[LABELS]\n';
                email.labelIds.forEach(label => {
                    fullText += label + ' ';
                });
                fullText += '\n[/LABELS]\n';
            }
            
            email.fullTextContent = fullText;
        }
        
        // S'assurer que le provider est marqué
        if (!email.provider) {
            email.provider = this.currentProvider;
        }
        
        if (!email.providerType) {
            email.providerType = this.currentProvider;
        }
        
        // S'assurer que l'email a un ID
        if (!email.id) {
            email.id = email.messageId || email.itemId || email.uniqueId || this.generateId();
        }
        
        return email;
    }

    // ================================================
    // EXTRACTION DE TEXTE DEPUIS HTML - AMÉLIORÉE
    // ================================================
    extractTextFromHtml(html) {
        if (!html) return '';
        
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // IMPORTANT: Extraire d'abord les liens importants
            const importantLinks = [];
            
            // Chercher les liens de désabonnement
            tempDiv.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href') || '';
                const text = (link.textContent || link.innerText || '').toLowerCase();
                
                // Détecter les liens de désabonnement et préférences
                if (text.includes('unsubscribe') || text.includes('desinscrire') || 
                    text.includes('désinscrire') || text.includes('desabonner') ||
                    text.includes('preferences') || text.includes('préférences') ||
                    text.includes('manage') || text.includes('gérer') ||
                    text.includes('opt out') || text.includes('opt-out') ||
                    text.includes('email preferences') || text.includes('notification') ||
                    href.includes('unsubscribe') || href.includes('preferences') ||
                    href.includes('opt-out') || href.includes('optout')) {
                    
                    importantLinks.push(text + ' [LINK:' + href + ']');
                }
            });
            
            // Supprimer les éléments non textuels mais préserver la structure
            const elementsToRemove = tempDiv.querySelectorAll('script, style, noscript, iframe, object, embed');
            elementsToRemove.forEach(el => el.remove());
            
            // Préserver la structure du texte
            tempDiv.querySelectorAll('br').forEach(br => {
                br.replaceWith('\n');
            });
            
            tempDiv.querySelectorAll('p, div, li, tr, h1, h2, h3, h4, h5, h6').forEach(el => {
                if (el.textContent.trim()) {
                    el.innerHTML = el.innerHTML + '\n';
                }
            });
            
            tempDiv.querySelectorAll('td, th').forEach(el => {
                el.innerHTML = el.innerHTML + ' ';
            });
            
            // Extraire le texte
            let text = tempDiv.textContent || tempDiv.innerText || '';
            
            // Ajouter les liens importants extraits
            if (importantLinks.length > 0) {
                text += '\n\n[IMPORTANT_LINKS]\n' + importantLinks.join('\n') + '\n[/IMPORTANT_LINKS]';
            }
            
            // Nettoyer tout en préservant la structure
            text = text
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .replace(/[ \t]+/g, ' ')
                .replace(/\n[ \t]+/g, '\n')
                .replace(/[ \t]+\n/g, '\n')
                .trim();
            
            return text;
        } catch (error) {
            console.warn('[MailService] Erreur extraction HTML:', error);
            // Fallback basique
            return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }

    // ================================================
    // OPÉRATIONS SUR LES MESSAGES
    // ================================================
    async markAsRead(messageId) {
        const service = this.authServices[this.currentProvider];
        
        if (service && typeof service.markAsRead === 'function') {
            return await service.markAsRead(messageId);
        }
        
        console.warn('[MailService] markAsRead non supporté pour', this.currentProvider);
        return false;
    }

    async archive(messageId) {
        const service = this.authServices[this.currentProvider];
        
        if (service && typeof service.archive === 'function') {
            return await service.archive(messageId);
        }
        
        console.warn('[MailService] archive non supporté pour', this.currentProvider);
        return false;
    }

    async delete(messageId) {
        const service = this.authServices[this.currentProvider];
        
        if (service && typeof service.delete === 'function') {
            return await service.delete(messageId);
        }
        
        console.warn('[MailService] delete non supporté pour', this.currentProvider);
        return false;
    }

    // ================================================
    // INFORMATIONS UTILISATEUR
    // ================================================
    async getUserInfo() {
        const service = this.authServices[this.currentProvider];
        
        if (service && typeof service.getUserInfo === 'function') {
            return await service.getUserInfo();
        }
        
        if (service && typeof service.getAccount === 'function') {
            return service.getAccount();
        }
        
        return null;
    }

    getAccount() {
        const service = this.authServices[this.currentProvider];
        
        if (service && typeof service.getAccount === 'function') {
            return service.getAccount();
        }
        
        return null;
    }

    // ================================================
    // DÉCONNEXION
    // ================================================
    async logout() {
        const service = this.authServices[this.currentProvider];
        
        if (service && typeof service.logout === 'function') {
            await service.logout();
        }
        
        this.currentProvider = null;
        this._isInitialized = false;
        
        console.log('[MailService] Déconnexion effectuée');
    }

    // ================================================
    // DIAGNOSTIC
    // ================================================
    getDiagnosticInfo() {
        const info = {
            currentProvider: this.currentProvider,
            isInitialized: this._isInitialized,
            isAuthenticated: this.isAuthenticated(),
            availableServices: {}
        };
        
        // Vérifier chaque service
        Object.keys(this.authServices).forEach(key => {
            const service = this.authServices[key];
            if (service) {
                info.availableServices[key] = {
                    exists: true,
                    isInitialized: (typeof service.isInitialized === 'function' ? service.isInitialized() : service.isInitialized) || false,
                    isAuthenticated: (typeof service.isAuthenticated === 'function' ? service.isAuthenticated() : false),
                    availableMethods: []
                };
                
                // Lister les méthodes importantes
                const importantMethods = ['fetchEmails', 'getMessages', 'fetchMessages', 'getAllEmails', 'login', 'logout', 'initialize'];
                importantMethods.forEach(method => {
                    if (typeof service[method] === 'function') {
                        info.availableServices[key].availableMethods.push(method);
                    }
                });
            }
        });
        
        return info;
    }

    // ================================================
    // TEST DE CONNEXION
    // ================================================
    async testConnection() {
        if (!this.isAuthenticated()) {
            return {
                success: false,
                error: 'Non authentifié'
            };
        }
        
        try {
            // Essayer de récupérer 1 email pour tester
            const emails = await this.getMessages('INBOX', {
                maxResults: 1,
                days: 30
            });
            
            return {
                success: true,
                provider: this.currentProvider,
                emailCount: emails.length
            };
            
        } catch (error) {
            return {
                success: false,
                provider: this.currentProvider,
                error: error.message
            };
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    generateId() {
        return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ================================================
    // COMPATIBILITÉ AVEC EMAILSCANNER
    // ================================================
    async fetchEmails(options = {}) {
        // Méthode alias pour compatibilité avec EmailScanner
        return this.getMessages(options.folder || 'INBOX', options);
    }

    // ================================================
    // MÉTHODE DE DEBUG
    // ================================================
    debugService() {
        console.log('[MailService] 🔍 DEBUG - État actuel:');
        console.log('  - Provider actuel:', this.currentProvider);
        console.log('  - Initialisé:', this._isInitialized);
        console.log('  - Authentifié:', this.isAuthenticated());
        
        console.log('\n[MailService] 🔍 DEBUG - Services disponibles:');
        Object.keys(this.authServices).forEach(key => {
            const service = this.authServices[key];
            console.log(`\n  ${key}:`);
            console.log('    - Existe:', !!service);
            if (service) {
                console.log('    - Type:', typeof service);
                console.log('    - Constructor:', service.constructor?.name);
                
                // Méthodes importantes
                const methods = ['fetchEmails', 'getMessages', 'isAuthenticated', 'initialize', 'login'];
                methods.forEach(method => {
                    console.log(`    - ${method}:`, typeof service[method] === 'function' ? '✅ Fonction' : '❌ Non disponible');
                });
            }
        });
        
        return this.getDiagnosticInfo();
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.mailService) {
    console.log('[MailService] Service existant trouvé, remplacement...');
    // Nettoyer l'ancien service
    if (typeof window.mailService.logout === 'function') {
        window.mailService.logout().catch(() => {});
    }
}

window.mailService = new MailService();

// Auto-initialiser si possible
(async () => {
    try {
        await window.mailService.initialize();
        console.log('[MailService] ✅ Auto-initialisation réussie');
        
        // Debug initial
        window.mailService.debugService();
        
    } catch (error) {
        console.log('[MailService] Auto-initialisation échouée, attente de l\'authentification');
    }
})();

console.log('✅ MailService v3.1 loaded - Détection améliorée des méthodes Gmail/Outlook');
