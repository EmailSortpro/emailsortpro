// MailService.js - Service unifié pour la gestion des emails
// Intégration avec GoogleAuthService et AuthService pour extraction complète

class MailService {
    constructor() {
        this.currentProvider = null;
        this.isInitialized = false;
        this.authServices = {
            google: window.googleAuthService,
            gmail: window.googleAuthService,
            microsoft: window.authService,
            outlook: window.authService
        };
        
        console.log('[MailService] Service unifié créé');
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        try {
            console.log('[MailService] Initialisation...');
            
            // Détecter le provider actif
            this.detectActiveProvider();
            
            // Initialiser le service approprié
            if (this.currentProvider) {
                const service = this.authServices[this.currentProvider];
                if (service && service.initialize) {
                    await service.initialize();
                }
            }
            
            this.isInitialized = true;
            console.log('[MailService] ✅ Initialisé avec provider:', this.currentProvider);
            return true;
            
        } catch (error) {
            console.error('[MailService] ❌ Erreur initialisation:', error);
            throw error;
        }
    }

    // ================================================
    // DÉTECTION DU PROVIDER
    // ================================================
    detectActiveProvider() {
        // Vérifier Gmail
        if (window.googleAuthService?.isAuthenticated?.()) {
            this.currentProvider = 'google';
            return 'google';
        }
        
        // Vérifier Outlook
        if (window.authService?.isAuthenticated?.()) {
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
        if (service && service.initialize && !service.isInitialized) {
            await service.initialize();
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
        
        if (service.login) {
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
        return service?.isAuthenticated?.() || false;
    }

    // ================================================
    // RÉCUPÉRATION DES MESSAGES - CONTENU COMPLET
    // ================================================
    async getMessages(folder = 'INBOX', options = {}) {
        console.log('[MailService] 📧 Récupération des messages...');
        console.log('[MailService] Provider:', this.currentProvider);
        console.log('[MailService] Options:', options);
        
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
            
            // Utiliser la méthode appropriée selon le service
            if (service.fetchEmails) {
                // GoogleAuthService ou AuthService avec fetchEmails
                const emails = await service.fetchEmails(fetchOptions);
                console.log(`[MailService] ✅ ${emails.length} emails récupérés avec contenu complet`);
                
                // S'assurer que chaque email a le contenu complet
                return emails.map(email => this.ensureCompleteContent(email));
                
            } else if (service.getMessages) {
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
        if (!email.fullTextContent && (email.body?.content || email.bodyText || email.bodyHtml)) {
            // Reconstruire le contenu complet si nécessaire
            let fullText = '';
            
            // Ajouter le sujet
            if (email.subject) {
                fullText += email.subject + '\n\n';
            }
            
            // Ajouter l'expéditeur
            if (email.from?.emailAddress) {
                fullText += `From: ${email.from.emailAddress.name || ''} <${email.from.emailAddress.address}>\n\n`;
            }
            
            // Ajouter le corps
            if (email.bodyText) {
                fullText += email.bodyText;
            } else if (email.body?.content) {
                if (email.body.contentType === 'html') {
                    fullText += this.extractTextFromHtml(email.body.content);
                } else {
                    fullText += email.body.content;
                }
            } else if (email.bodyHtml) {
                fullText += this.extractTextFromHtml(email.bodyHtml);
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
        
        return email;
    }

    // ================================================
    // EXTRACTION DE TEXTE DEPUIS HTML
    // ================================================
    extractTextFromHtml(html) {
        if (!html) return '';
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Supprimer les éléments non textuels
        const elementsToRemove = tempDiv.querySelectorAll('script, style, noscript, iframe, object, embed');
        elementsToRemove.forEach(el => el.remove());
        
        // Préserver les sauts de ligne
        tempDiv.querySelectorAll('br').forEach(br => {
            br.replaceWith('\n');
        });
        
        tempDiv.querySelectorAll('p, div, li, tr').forEach(el => {
            if (el.textContent.trim()) {
                el.innerHTML = el.innerHTML + '\n';
            }
        });
        
        // Extraire le texte
        let text = tempDiv.textContent || tempDiv.innerText || '';
        
        // Nettoyer
        text = text
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
        
        return text;
    }

    // ================================================
    // OPÉRATIONS SUR LES MESSAGES
    // ================================================
    async markAsRead(messageId) {
        const service = this.authServices[this.currentProvider];
        
        if (service.markAsRead) {
            return await service.markAsRead(messageId);
        }
        
        console.warn('[MailService] markAsRead non supporté pour', this.currentProvider);
        return false;
    }

    async archive(messageId) {
        const service = this.authServices[this.currentProvider];
        
        if (service.archive) {
            return await service.archive(messageId);
        }
        
        console.warn('[MailService] archive non supporté pour', this.currentProvider);
        return false;
    }

    async delete(messageId) {
        const service = this.authServices[this.currentProvider];
        
        if (service.delete) {
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
        
        if (service?.getUserInfo) {
            return await service.getUserInfo();
        }
        
        if (service?.getAccount) {
            return await service.getAccount();
        }
        
        return null;
    }

    getAccount() {
        const service = this.authServices[this.currentProvider];
        
        if (service?.getAccount) {
            return service.getAccount();
        }
        
        return null;
    }

    // ================================================
    // DÉCONNEXION
    // ================================================
    async logout() {
        const service = this.authServices[this.currentProvider];
        
        if (service?.logout) {
            await service.logout();
        }
        
        this.currentProvider = null;
        this.isInitialized = false;
        
        console.log('[MailService] Déconnexion effectuée');
    }

    // ================================================
    // DIAGNOSTIC
    // ================================================
    getDiagnosticInfo() {
        const info = {
            currentProvider: this.currentProvider,
            isInitialized: this.isInitialized,
            isAuthenticated: this.isAuthenticated(),
            availableServices: {}
        };
        
        // Vérifier chaque service
        Object.keys(this.authServices).forEach(key => {
            const service = this.authServices[key];
            if (service) {
                info.availableServices[key] = {
                    exists: true,
                    isInitialized: service.isInitialized || false,
                    isAuthenticated: service.isAuthenticated?.() || false
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
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
if (window.mailService) {
    console.log('[MailService] Service existant trouvé, remplacement...');
}

window.mailService = new MailService();

console.log('✅ MailService loaded - Service unifié pour extraction complète des emails');
