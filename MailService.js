// MailService.js - Version 3.0 - Service unifié avec extraction HTML améliorée
// Correction de l'extraction du contenu pour une meilleure détection des newsletters

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
        
        console.log('[MailService] v3.0 - Service unifié avec extraction améliorée');
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
                if (service && typeof service.initialize === 'function') {
                    await service.initialize();
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
        // Vérifier Gmail
        if (window.googleAuthService && 
            typeof window.googleAuthService.isAuthenticated === 'function' &&
            window.googleAuthService.isAuthenticated()) {
            this.currentProvider = 'google';
            return 'google';
        }
        
        // Vérifier Outlook
        if (window.authService && 
            typeof window.authService.isAuthenticated === 'function' &&
            window.authService.isAuthenticated()) {
            this.currentProvider = 'microsoft';
            return 'microsoft';
        }
        
        console.log('[MailService] Aucun provider authentifié détecté');
        return null;
    }

    // ================================================
    // GESTION DU PROVIDER
    // ================================================
    getCurrentProvider() {
        return this.currentProvider;
    }

    async setProvider(provider) {
        const normalizedProvider = this.normalizeProvider(provider);
        console.log('[MailService] Changement de provider:', normalizedProvider);
        
        this.currentProvider = normalizedProvider;
        
        // Initialiser le nouveau service si nécessaire
        const service = this.authServices[normalizedProvider];
        if (service && typeof service.initialize === 'function') {
            if (typeof service.isInitialized === 'function' && !service.isInitialized()) {
                await service.initialize();
            } else if (service.isInitialized === false) {
                await service.initialize();
            }
        }
        
        return normalizedProvider;
    }

    normalizeProvider(provider) {
        if (provider === 'gmail' || provider === 'google') {
            return 'google';
        }
        if (provider === 'outlook' || provider === 'microsoft') {
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
        
        if (typeof service.login === 'function') {
            await service.login();
            this.currentProvider = normalizedProvider;
        } else {
            throw new Error(`Méthode login non disponible pour ${provider}`);
        }
    }

    isAuthenticated() {
        if (!this.currentProvider) {
            this.detectActiveProvider();
        }
        
        const service = this.authServices[this.currentProvider];
        if (service && typeof service.isAuthenticated === 'function') {
            return service.isAuthenticated();
        }
        
        return false;
    }

    // ================================================
    // RÉCUPÉRATION DES MESSAGES - CONTENU COMPLET
    // ================================================
    async getMessages(folder = 'INBOX', options = {}) {
        console.log('[MailService] 📧 Récupération des messages...');
        console.log('[MailService] Provider actuel:', this.currentProvider);
        console.log('[MailService] Options:', options);
        
        // S'assurer que le service est initialisé
        if (!this._isInitialized) {
            await this.initialize();
        }
        
        // Détecter le provider si nécessaire
        if (!this.currentProvider) {
            this.detectActiveProvider();
            console.log('[MailService] Provider détecté:', this.currentProvider);
        }
        
        if (!this.isAuthenticated()) {
            throw new Error('Non authentifié');
        }
        
        const service = this.authServices[this.currentProvider];
        if (!service) {
            throw new Error(`Service non disponible pour ${this.currentProvider}`);
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
            
            // Utiliser la méthode appropriée selon le service
            if (typeof service.fetchEmails === 'function') {
                // GoogleAuthService ou AuthService avec fetchEmails
                const emails = await service.fetchEmails(fetchOptions);
                console.log(`[MailService] ✅ ${emails.length} emails récupérés avec contenu complet`);
                
                // S'assurer que chaque email a le contenu complet
                return emails.map(email => this.ensureCompleteContent(email));
                
            } else if (typeof service.getMessages === 'function') {
                // Service avec getMessages
                const emails = await service.getMessages(folder, fetchOptions);
                console.log(`[MailService] ✅ ${emails.length} emails récupérés`);
                
                return emails.map(email => this.ensureCompleteContent(email));
                
            } else {
                throw new Error('Aucune méthode de récupération disponible');
            }
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur récupération messages:', error);
            throw error;
        }
    }

    // ================================================
    // ASSURER LE CONTENU COMPLET
    // ================================================
    ensureCompleteContent(email) {
        // S'assurer que l'email a tous les champs nécessaires
        if (!email.fullTextContent) {
            // Reconstruire le contenu complet si nécessaire
            let fullText = '';
            
            // Ajouter le sujet (très important, répété pour augmenter le poids)
            if (email.subject) {
                fullText += email.subject + ' ' + email.subject + ' ' + email.subject + '\n\n';
            }
            
            // Ajouter l'expéditeur
            if (email.from?.emailAddress) {
                const fromEmail = email.from.emailAddress.address || '';
                const fromName = email.from.emailAddress.name || '';
                fullText += `De: ${fromName} <${fromEmail}>\n`;
                if (fromEmail.includes('@')) {
                    const domain = fromEmail.split('@')[1];
                    fullText += `Domaine: ${domain}\n`;
                }
            }
            
            // Ajouter la date
            if (email.receivedDateTime) {
                fullText += `Date: ${new Date(email.receivedDateTime).toLocaleString('fr-FR')}\n`;
            }
            
            fullText += '\n';
            
            // Ajouter le corps - AMÉLIORATION : Inclure le HTML brut ET le texte extrait
            if (email.body?.content) {
                // Inclure le HTML brut pour détecter les patterns exacts
                fullText += '[HTML_RAW]\n' + email.body.content + '\n[/HTML_RAW]\n\n';
                
                // Extraire et inclure le texte propre
                if (email.body.contentType === 'html') {
                    const extractedText = this.extractTextFromHtml(email.body.content);
                    fullText += '[TEXT_EXTRACTED]\n' + extractedText + '\n[/TEXT_EXTRACTED]\n';
                } else {
                    fullText += '[TEXT_CONTENT]\n' + email.body.content + '\n[/TEXT_CONTENT]\n';
                }
            } else if (email.bodyHtml) {
                // HTML brut
                fullText += '[HTML_RAW]\n' + email.bodyHtml + '\n[/HTML_RAW]\n\n';
                // Texte extrait
                const extractedText = this.extractTextFromHtml(email.bodyHtml);
                fullText += '[TEXT_EXTRACTED]\n' + extractedText + '\n[/TEXT_EXTRACTED]\n';
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
                    if (label.includes('CATEGORY_PROMOTIONS')) {
                        fullText += '\n[GMAIL_PROMOTIONS_CATEGORY]';
                    }
                    if (label.includes('CATEGORY_SOCIAL')) {
                        fullText += '\n[GMAIL_SOCIAL_CATEGORY]';
                    }
                    if (label.includes('CATEGORY_UPDATES')) {
                        fullText += '\n[GMAIL_UPDATES_CATEGORY]';
                    }
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
            email.id = email.messageId || email.itemId || this.generateId();
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
            
            // IMPORTANT : Extraire d'abord les liens de désabonnement et les textes importants
            const unsubscribeLinks = [];
            const importantTexts = [];
            
            // Chercher tous les liens
            tempDiv.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href') || '';
                const text = (link.textContent || link.innerText || '').trim();
                
                // Conserver les textes des liens de désabonnement
                if (text.match(/unsubscribe|se désabonner|désinscrire|opt.?out|stop email|arrêter|ne plus recevoir|gérer.*préférences|manage.*preferences|email preferences/i)) {
                    unsubscribeLinks.push(text);
                }
                
                // Remplacer le lien par son texte pour la suite du traitement
                if (text) {
                    const textNode = document.createTextNode(text + ' ');
                    link.parentNode?.replaceChild(textNode, link);
                }
            });
            
            // Chercher les textes importants dans tout le HTML
            const allText = tempDiv.textContent || tempDiv.innerText || '';
            
            // Patterns de newsletter
            const newsletterPatterns = [
                /newsletter/i,
                /mailing list/i,
                /liste de diffusion/i,
                /cliquez ici pour/i,
                /click here to/i,
                /email preferences/i,
                /notification/i,
                /recevoir ces notifications/i,
                /change email frequency/i,
                /voir.*en ligne/i,
                /view.*online/i,
                /si.*difficultés.*visualiser/i,
                /trouble viewing/i
            ];
            
            newsletterPatterns.forEach(pattern => {
                const matches = allText.match(pattern);
                if (matches) {
                    importantTexts.push(...matches);
                }
            });
            
            // Supprimer les éléments non textuels
            const elementsToRemove = tempDiv.querySelectorAll('script, style, noscript, iframe, object, embed, meta, link');
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
            
            // Extraire le texte final
            let text = tempDiv.textContent || tempDiv.innerText || '';
            
            // Ajouter les liens de désabonnement au début pour s'assurer qu'ils sont détectés
            if (unsubscribeLinks.length > 0) {
                text = '\n[UNSUBSCRIBE_LINKS]\n' + unsubscribeLinks.join('\n') + '\n[/UNSUBSCRIBE_LINKS]\n' + text;
            }
            
            // Ajouter les textes importants
            if (importantTexts.length > 0) {
                text = '\n[NEWSLETTER_INDICATORS]\n' + importantTexts.join('\n') + '\n[/NEWSLETTER_INDICATORS]\n' + text;
            }
            
            // Nettoyer les espaces excessifs tout en préservant la structure
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
                    isAuthenticated: (typeof service.isAuthenticated === 'function' ? service.isAuthenticated() : false)
                };
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
    } catch (error) {
        console.log('[MailService] Auto-initialisation échouée, attente de l\'authentification');
    }
})();

console.log('✅ MailService v3.0 loaded - Extraction HTML améliorée pour newsletters');
