// GoogleAuthService.js - Version 10.0 - Service Gmail complet et fonctionnel
// Sans erreurs, avec extraction complète et gestion mémoire optimisée

class GoogleAuthService {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.expectedDomain = 'emailsortpro.netlify.app';
        this.provider = 'gmail';
        
        // Configuration OAuth2
        this.config = {
            clientId: '436941729211-2dr129lfjnc22k1k7f42ofisjbfthmr2.apps.googleusercontent.com',
            scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            redirectUri: `${window.location.origin}/auth-callback.html`,
            responseType: 'token',
            accessType: 'online'
        };
        
        // Limites de scan optimisées
        this.scanLimits = {
            maxEmails: Number.MAX_SAFE_INTEGER,
            batchSize: 100,
            detailsBatchSize: 10,
            rateLimitDelay: 50
        };
        
        console.log('[GoogleAuthService] v10.0 - Service complet et fonctionnel');
    }

    // ================================================
    // INITIALISATION
    // ================================================
    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        if (this.isInitialized) {
            return Promise.resolve(true);
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    async _doInitialize() {
        try {
            console.log('[GoogleAuthService] Initialisation...');
            
            const cachedToken = this.getCachedToken();
            if (cachedToken && this.isTokenValid(cachedToken)) {
                console.log('[GoogleAuthService] Token valide trouvé');
                await this.loadUserInfoFromToken(cachedToken.access_token);
                this.isInitialized = true;
            } else {
                console.log('[GoogleAuthService] Pas de token valide');
                this.isInitialized = true;
            }
            
            console.log('[GoogleAuthService] ✅ Initialisation réussie');
            return true;
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur initialisation:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    // ================================================
    // AUTHENTIFICATION
    // ================================================
    isAuthenticated() {
        return this.currentUser !== null && this.isInitialized;
    }

    getAccount() {
        if (!this.currentUser) return null;
        
        return {
            id: this.currentUser.sub || this.currentUser.id,
            name: this.currentUser.name,
            email: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: this.provider,
            username: this.currentUser.email,
            displayName: this.currentUser.name,
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email,
            scanCapabilities: {
                unlimited: true,
                maxEmails: this.scanLimits.maxEmails,
                batchSize: this.scanLimits.batchSize
            }
        };
    }

    async login() {
        console.log('[GoogleAuthService] Login OAuth2...');
        
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const authUrl = this.buildSecureOAuth2Url();
            
            if (window.uiManager) {
                window.uiManager.showToast('Redirection vers Google...', 'info');
            }
            
            window.location.href = authUrl;
            return new Promise(() => {});
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur login:', error);
            throw error;
        }
    }

    buildSecureOAuth2Url() {
        const state = 'google_auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('google_oauth_state', state);
        
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scopes.join(' '),
            response_type: 'token',
            access_type: 'online',
            prompt: 'select_account',
            state: state
        });
        
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async handleOAuthCallback(fragment) {
        console.log('[GoogleAuthService] Traitement callback OAuth2...');
        
        try {
            const fragmentParams = new URLSearchParams(fragment.substring(1));
            
            const accessToken = fragmentParams.get('access_token');
            const tokenType = fragmentParams.get('token_type');
            const expiresIn = fragmentParams.get('expires_in');
            const state = fragmentParams.get('state');
            const error = fragmentParams.get('error');
            
            if (error) {
                throw new Error(`Erreur OAuth2: ${error}`);
            }
            
            if (!accessToken) {
                throw new Error('Token manquant');
            }
            
            const savedState = sessionStorage.getItem('google_oauth_state');
            if (!savedState || savedState !== state) {
                throw new Error('État invalide');
            }
            
            await this.loadUserInfoFromToken(accessToken);
            
            const tokenData = {
                access_token: accessToken,
                token_type: tokenType || 'Bearer',
                expires_in: parseInt(expiresIn) || 3600,
                expires_at: Date.now() + (parseInt(expiresIn) || 3600) * 1000
            };
            
            this.saveToken(tokenData);
            
            console.log('[GoogleAuthService] ✅ Auth réussie');
            return true;
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur callback:', error);
            throw error;
        } finally {
            sessionStorage.removeItem('google_oauth_state');
        }
    }

    async loadUserInfoFromToken(accessToken) {
        console.log('[GoogleAuthService] Chargement infos utilisateur...');
        
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur userinfo: ${response.status}`);
        }
        
        const userInfo = await response.json();
        this.currentUser = userInfo;
        
        console.log('[GoogleAuthService] ✅ User:', userInfo.email);
        return userInfo;
    }

    // ================================================
    // RÉCUPÉRATION DES EMAILS - MÉTHODE PRINCIPALE
    // ================================================
    async fetchEmails(options = {}) {
        console.log('[GoogleAuthService] 📧 === RÉCUPÉRATION EMAILS GMAIL ===');
        console.log('[GoogleAuthService] Options:', options);
        
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('Pas de token d\'authentification');
        }

        try {
            // Paramètres par défaut
            const maxResults = options.maxResults === -1 ? Number.MAX_SAFE_INTEGER : (options.maxResults || 500);
            const days = options.days || 7;
            const includeSpam = options.includeSpam || false;
            
            // Construire la requête de recherche Gmail
            const query = this.buildGmailQuery({
                days: days,
                includeSpam: includeSpam,
                folder: options.folder
            });
            
            console.log('[GoogleAuthService] 🔍 Query Gmail:', query);
            console.log('[GoogleAuthService] 📊 Limite:', maxResults === Number.MAX_SAFE_INTEGER ? 'ILLIMITÉ' : maxResults);
            
            let allEmails = [];
            let pageToken = null;
            let totalFetched = 0;
            
            // Boucle de récupération des IDs d'emails
            do {
                // Calculer le nombre d'emails à récupérer dans ce batch
                const batchSize = Math.min(this.scanLimits.batchSize, maxResults - totalFetched);
                
                const params = new URLSearchParams({
                    maxResults: batchSize.toString(),
                    q: query
                });
                
                if (pageToken) {
                    params.append('pageToken', pageToken);
                }
                
                // Récupérer la liste des messages
                const listResponse = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }
                );
                
                if (!listResponse.ok) {
                    const errorText = await listResponse.text();
                    throw new Error(`Gmail API error ${listResponse.status}: ${errorText}`);
                }
                
                const listData = await listResponse.json();
                const messageIds = listData.messages || [];
                
                if (messageIds.length === 0) {
                    console.log('[GoogleAuthService] Plus d\'emails à récupérer');
                    break;
                }
                
                console.log(`[GoogleAuthService] 📬 Récupération de ${messageIds.length} emails...`);
                
                // Récupérer les détails de chaque email
                const batchEmails = await this.fetchEmailDetailsInBatches(messageIds, token);
                allEmails = allEmails.concat(batchEmails);
                totalFetched += batchEmails.length;
                
                // Callback de progression
                if (options.onProgress) {
                    options.onProgress({
                        phase: 'fetching',
                        message: `${totalFetched} emails Gmail récupérés...`,
                        progress: { 
                            current: totalFetched, 
                            total: maxResults === Number.MAX_SAFE_INTEGER ? totalFetched : maxResults 
                        }
                    });
                }
                
                // Récupérer le token de la page suivante
                pageToken = listData.nextPageToken;
                
                // Vérifier si on a atteint la limite
                if (totalFetched >= maxResults) {
                    console.log('[GoogleAuthService] Limite atteinte');
                    break;
                }
                
                // Délai anti rate-limit entre les pages
                if (pageToken) {
                    await new Promise(resolve => setTimeout(resolve, this.scanLimits.rateLimitDelay));
                }
                
            } while (pageToken);
            
            console.log(`[GoogleAuthService] ✅ TOTAL: ${allEmails.length} emails Gmail récupérés`);
            return allEmails;
            
        } catch (error) {
            console.error('[GoogleAuthService] ❌ Erreur récupération emails:', error);
            throw error;
        }
    }

    buildGmailQuery(options) {
        const parts = [];
        
        // Exclure le spam si demandé
        if (!options.includeSpam) {
            parts.push('-in:spam');
        }
        
        // Toujours exclure la corbeille
        parts.push('-in:trash');
        
        // Dossier spécifique ou inbox + sent
        if (options.folder === 'INBOX') {
            parts.push('in:inbox');
        } else if (options.folder === 'SENT') {
            parts.push('in:sent');
        } else {
            parts.push('(in:inbox OR in:sent)');
        }
        
        // Filtre de date
        if (options.days && options.days > 0) {
            const date = new Date();
            date.setDate(date.getDate() - options.days);
            const dateStr = date.toISOString().split('T')[0];
            parts.push(`after:${dateStr}`);
        }
        
        return parts.join(' ');
    }

    // ================================================
    // RÉCUPÉRATION DES DÉTAILS DES EMAILS
    // ================================================
    async fetchEmailDetailsInBatches(messageIds, token) {
        const emails = [];
        const batchSize = this.scanLimits.detailsBatchSize;
        
        // Traiter par batches pour optimiser
        for (let i = 0; i < messageIds.length; i += batchSize) {
            const batch = messageIds.slice(i, i + batchSize);
            
            // Récupérer les détails en parallèle pour ce batch
            const promises = batch.map(msg => 
                this.fetchSingleEmailDetail(msg.id, token).catch(error => {
                    console.error(`[GoogleAuthService] Erreur email ${msg.id}:`, error);
                    return null;
                })
            );
            
            const results = await Promise.all(promises);
            
            // Ajouter les emails valides
            results.forEach(email => {
                if (email) {
                    emails.push(email);
                }
            });
            
            // Petit délai entre les batches
            if (i + batchSize < messageIds.length) {
                await new Promise(resolve => setTimeout(resolve, this.scanLimits.rateLimitDelay));
            }
        }
        
        return emails;
    }

    async fetchSingleEmailDetail(messageId, token) {
        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Erreur récupération message ${messageId}: ${response.status}`);
            }
            
            const messageData = await response.json();
            return this.transformGmailToStandardFormat(messageData);
            
        } catch (error) {
            console.error(`[GoogleAuthService] Erreur détail email ${messageId}:`, error);
            throw error;
        }
    }

    // ================================================
    // TRANSFORMATION DU FORMAT GMAIL
    // ================================================
    transformGmailToStandardFormat(gmailData) {
        try {
            // Extraire les headers
            const headers = this.extractHeaders(gmailData.payload?.headers || []);
            
            // Extraire le corps complet de l'email
            const bodyData = this.extractCompleteBody(gmailData.payload);
            
            // Créer le contenu textuel complet pour l'analyse
            let fullTextForAnalysis = '';
            
            // 1. Ajouter le sujet (très important pour la catégorisation)
            if (headers.subject) {
                fullTextForAnalysis += this.cleanText(headers.subject) + '\n\n';
            }
            
            // 2. Ajouter l'expéditeur
            if (headers.from) {
                fullTextForAnalysis += 'From: ' + headers.from + '\n';
            }
            
            // 3. Ajouter le corps du message
            if (bodyData.fullText) {
                fullTextForAnalysis += bodyData.fullText;
            }
            
            // 4. Ajouter le snippet si différent
            if (gmailData.snippet && !fullTextForAnalysis.includes(gmailData.snippet)) {
                fullTextForAnalysis += '\n\n' + this.cleanText(gmailData.snippet);
            }
            
            // Créer l'objet email standardisé
            const email = {
                // Identifiants
                id: gmailData.id,
                threadId: gmailData.threadId,
                provider: 'gmail',
                providerType: 'gmail',
                source: 'gmail',
                
                // Métadonnées principales
                subject: this.cleanText(headers.subject || '(Sans sujet)'),
                receivedDateTime: new Date(parseInt(gmailData.internalDate)).toISOString(),
                
                // Expéditeur
                from: this.parseEmailAddress(headers.from),
                
                // Destinataires
                toRecipients: this.parseRecipients(headers.to),
                ccRecipients: this.parseRecipients(headers.cc),
                bccRecipients: this.parseRecipients(headers.bcc),
                
                // Corps du message
                bodyPreview: this.createBodyPreview(bodyData.fullText || gmailData.snippet),
                body: {
                    content: bodyData.html || bodyData.text || bodyData.fullText,
                    contentType: bodyData.html ? 'html' : 'text'
                },
                
                // IMPORTANT: Contenu complet pour l'analyse par CategoryManager
                fullTextContent: fullTextForAnalysis.trim(),
                
                // Contenu textuel brut
                bodyText: bodyData.text || bodyData.fullText,
                bodyHtml: bodyData.html,
                
                // Pièces jointes
                hasAttachments: bodyData.hasAttachments,
                attachments: bodyData.attachments,
                
                // État et importance
                isRead: !gmailData.labelIds?.includes('UNREAD'),
                isDraft: gmailData.labelIds?.includes('DRAFT'),
                importance: this.extractImportance(headers, gmailData.labelIds),
                
                // Labels Gmail
                labels: gmailData.labelIds || [],
                labelNames: this.mapLabelIds(gmailData.labelIds),
                labelIds: gmailData.labelIds || [],
                
                // Headers complets (pour analyse avancée si besoin)
                headers: headers,
                
                // Métadonnées Gmail spécifiques
                gmailMetadata: {
                    historyId: gmailData.historyId,
                    snippet: gmailData.snippet,
                    sizeEstimate: gmailData.sizeEstimate,
                    threadId: gmailData.threadId,
                    labels: gmailData.labelIds || []
                }
            };
            
            return email;
            
        } catch (error) {
            console.error('[GoogleAuthService] Erreur transformation email:', error);
            console.error('[GoogleAuthService] Data Gmail:', gmailData);
            return null;
        }
    }

    // ================================================
    // EXTRACTION DES HEADERS
    // ================================================
    extractHeaders(headers) {
        const result = {};
        
        headers.forEach(header => {
            const name = header.name.toLowerCase();
            const value = header.value;
            
            // Stocker tous les headers
            result[name] = value;
            
            // Headers multiples (comme Received)
            if (name === 'received' || name === 'x-received') {
                if (!result['received-headers']) {
                    result['received-headers'] = [];
                }
                result['received-headers'].push(value);
            }
        });
        
        return result;
    }

    // ================================================
    // EXTRACTION COMPLÈTE DU CORPS
    // ================================================
    extractCompleteBody(payload) {
        let textContent = '';
        let htmlContent = '';
        let fullText = '';
        let hasAttachments = false;
        const attachments = [];
        
        const processPayloadPart = (part) => {
            // Détecter les pièces jointes
            if (part.filename && part.filename.length > 0) {
                hasAttachments = true;
                attachments.push({
                    filename: part.filename,
                    mimeType: part.mimeType,
                    size: part.body?.size || 0,
                    attachmentId: part.body?.attachmentId
                });
                return;
            }
            
            // Extraire le contenu du corps
            if (part.body?.data) {
                const decoded = this.base64Decode(part.body.data);
                
                if (part.mimeType === 'text/plain') {
                    textContent += decoded + '\n';
                    fullText += decoded + '\n';
                } else if (part.mimeType === 'text/html') {
                    htmlContent += decoded;
                    // Convertir le HTML en texte pour l'analyse
                    const textFromHtml = this.extractTextFromHtml(decoded);
                    if (!textContent) {
                        // Si pas de version texte, utiliser le texte extrait du HTML
                        fullText += textFromHtml + '\n';
                    }
                }
            }
            
            // Traiter récursivement les parties multiples
            if (part.parts && Array.isArray(part.parts)) {
                part.parts.forEach(processPayloadPart);
            }
        };
        
        // Commencer le traitement
        if (payload) {
            processPayloadPart(payload);
        }
        
        // S'assurer qu'on a du contenu textuel
        if (!fullText) {
            if (htmlContent) {
                fullText = this.extractTextFromHtml(htmlContent);
            } else if (textContent) {
                fullText = textContent;
            }
        }
        
        return {
            text: textContent.trim(),
            html: htmlContent.trim(),
            fullText: fullText.trim(),
            hasAttachments: hasAttachments,
            attachments: attachments
        };
    }

    // ================================================
    // EXTRACTION DU TEXTE DEPUIS HTML
    // ================================================
    extractTextFromHtml(html) {
        if (!html) return '';
        
        try {
            // Créer un élément DOM temporaire
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Supprimer les éléments non textuels et problématiques
            const elementsToRemove = tempDiv.querySelectorAll(
                'script, style, noscript, iframe, object, embed, meta, link, ' +
                'img[src^="cid:"], img[src^="https://links"], img[src*="tracking"]'
            );
            elementsToRemove.forEach(el => el.remove());
            
            // Nettoyer les liens de tracking
            tempDiv.querySelectorAll('a[href*="tracking"], a[href*="links1."], a[href*="linkprod"]').forEach(link => {
                const text = link.textContent || link.innerText || '';
                if (text.trim()) {
                    link.replaceWith(text);
                }
            });
            
            // Préserver la structure du texte
            // Remplacer les BR par des sauts de ligne
            tempDiv.querySelectorAll('br').forEach(br => {
                br.replaceWith('\n');
            });
            
            // Ajouter des sauts de ligne pour les éléments de bloc
            tempDiv.querySelectorAll('p, div, li, tr').forEach(el => {
                if (el.textContent.trim()) {
                    el.innerHTML = el.innerHTML + '\n';
                }
            });
            
            // Ajouter des doubles sauts de ligne pour les titres
            tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
                el.innerHTML = '\n' + el.innerHTML + '\n';
            });
            
            // Ajouter des séparateurs pour les cellules de tableau
            tempDiv.querySelectorAll('td, th').forEach(el => {
                el.innerHTML = el.innerHTML + ' | ';
            });
            
            // Préserver les liens utiles (non-tracking)
            tempDiv.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.includes('tracking') && !href.includes('links1.') && !href.startsWith('cid:')) {
                    const text = link.textContent || link.innerText || '';
                    if (text && !text.includes(href)) {
                        link.innerHTML = text + ` [${href}]`;
                    }
                }
            });
            
            // Extraire et nettoyer le texte
            let text = tempDiv.textContent || tempDiv.innerText || '';
            
            // Nettoyer les espaces excessifs tout en préservant la structure
            text = text
                .replace(/\r\n/g, '\n')      // Normaliser les sauts de ligne
                .replace(/\r/g, '\n')
                .replace(/\n{3,}/g, '\n\n')   // Maximum 2 sauts de ligne consécutifs
                .replace(/[ \t]+/g, ' ')      // Remplacer les espaces multiples
                .replace(/\n[ \t]+/g, '\n')   // Supprimer les espaces en début de ligne
                .replace(/[ \t]+\n/g, '\n')   // Supprimer les espaces en fin de ligne
                .replace(/ \| \n/g, '\n');    // Nettoyer les séparateurs de tableau en fin de ligne
            
            return text;
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur extraction HTML:', error);
            // Fallback basique
            return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }

    // ================================================
    // CRÉATION DU PREVIEW
    // ================================================
    createBodyPreview(text, maxLength = 200) {
        if (!text) return '';
        
        // Nettoyer le texte pour le preview
        let preview = text
            .replace(/\n+/g, ' ')           // Remplacer les sauts de ligne par des espaces
            .replace(/\s+/g, ' ')           // Normaliser les espaces
            .replace(/https?:\/\/[^\s]+/g, '') // Supprimer les URLs
            .trim();
        
        // Tronquer si nécessaire
        if (preview.length > maxLength) {
            // Couper au dernier espace avant la limite
            const lastSpace = preview.lastIndexOf(' ', maxLength);
            if (lastSpace > maxLength * 0.8) {
                preview = preview.substring(0, lastSpace) + '...';
            } else {
                preview = preview.substring(0, maxLength) + '...';
            }
        }
        
        return preview;
    }

    // ================================================
    // PARSING DES ADRESSES EMAIL
    // ================================================
    parseEmailAddress(emailHeader) {
        if (!emailHeader) return { emailAddress: { address: 'unknown@gmail.com', name: 'Unknown' } };
        
        // Patterns pour extraire nom et email
        const match = emailHeader.match(/^"?([^"<]*?)"?\s*<?([^>]+@[^>]+)>?$/);
        
        if (match) {
            const name = match[1].trim();
            const email = match[2].trim().toLowerCase();
            
            return {
                emailAddress: {
                    name: name || email.split('@')[0],
                    address: email
                }
            };
        }
        
        // Si le pattern ne match pas, essayer de détecter juste l'email
        const emailMatch = emailHeader.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) {
            const email = emailMatch[1].toLowerCase();
            return {
                emailAddress: {
                    name: email.split('@')[0],
                    address: email
                }
            };
        }
        
        // Fallback
        return {
            emailAddress: {
                name: emailHeader,
                address: emailHeader.toLowerCase()
            }
        };
    }

    parseRecipients(recipientHeader) {
        if (!recipientHeader) return [];
        
        const recipients = [];
        
        // Séparer par virgule en respectant les guillemets et les chevrons
        const parts = recipientHeader.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)(?![^<]*>)/);
        
        parts.forEach(part => {
            const parsed = this.parseEmailAddress(part.trim());
            if (parsed.emailAddress.address && parsed.emailAddress.address.includes('@')) {
                recipients.push(parsed);
            }
        });
        
        return recipients;
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    base64Decode(data) {
        try {
            // Gmail utilise une variante URL-safe du base64
            const base64 = data
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            
            // Ajouter le padding si nécessaire
            const padLength = (4 - (base64.length % 4)) % 4;
            const padded = base64 + '='.repeat(padLength);
            
            // Décoder
            const decoded = atob(padded);
            
            // Convertir en UTF-8 proprement
            const bytes = new Uint8Array(decoded.length);
            for (let i = 0; i < decoded.length; i++) {
                bytes[i] = decoded.charCodeAt(i);
            }
            
            // Utiliser TextDecoder pour gérer l'UTF-8 correctement
            const decoder = new TextDecoder('utf-8', { fatal: false });
            return decoder.decode(bytes);
            
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur décodage base64:', error);
            // Fallback
            try {
                return decodeURIComponent(escape(atob(data.replace(/-/g, '+').replace(/_/g, '/'))));
            } catch (e) {
                return '';
            }
        }
    }

    cleanText(text) {
        if (!text) return '';
        
        try {
            return text
                .replace(/\r\n/g, ' ')
                .replace(/\n/g, ' ')
                .replace(/\t/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        } catch (error) {
            return String(text).trim();
        }
    }

    extractImportance(headers, labelIds) {
        // Vérifier les labels Gmail
        if (labelIds?.includes('IMPORTANT')) {
            return 'high';
        }
        
        // Vérifier les headers
        const importance = headers['importance'] || headers['x-priority'];
        if (importance) {
            if (importance.toLowerCase().includes('high') || importance === '1') {
                return 'high';
            }
            if (importance.toLowerCase().includes('low') || importance === '5') {
                return 'low';
            }
        }
        
        return 'normal';
    }

    mapLabelIds(labelIds) {
        if (!labelIds) return [];
        
        const labelMap = {
            'INBOX': 'Boîte de réception',
            'SENT': 'Envoyés',
            'DRAFT': 'Brouillons',
            'SPAM': 'Spam',
            'TRASH': 'Corbeille',
            'UNREAD': 'Non lu',
            'IMPORTANT': 'Important',
            'STARRED': 'Suivi',
            'CATEGORY_PERSONAL': 'Personnel',
            'CATEGORY_SOCIAL': 'Réseaux sociaux',
            'CATEGORY_PROMOTIONS': 'Promotions',
            'CATEGORY_UPDATES': 'Mises à jour',
            'CATEGORY_FORUMS': 'Forums'
        };
        
        return labelIds.map(id => labelMap[id] || id);
    }

    // ================================================
    // GESTION DU TOKEN
    // ================================================
    saveToken(tokenData) {
        try {
            const tokenInfo = {
                access_token: tokenData.access_token,
                expires_at: tokenData.expires_at || (Date.now() + (tokenData.expires_in * 1000)),
                token_type: tokenData.token_type || 'Bearer',
                created_at: Date.now(),
                provider: this.provider
            };
            
            localStorage.setItem('google_token_emailsortpro', JSON.stringify(tokenInfo));
            console.log('[GoogleAuthService] Token sauvegardé');
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur sauvegarde token:', error);
        }
    }

    getCachedToken() {
        try {
            const tokenStr = localStorage.getItem('google_token_emailsortpro');
            if (tokenStr) {
                return JSON.parse(tokenStr);
            }
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur lecture token:', error);
        }
        return null;
    }

    isTokenValid(tokenInfo) {
        if (!tokenInfo || !tokenInfo.access_token) {
            return false;
        }
        
        const now = Date.now();
        const expiresAt = tokenInfo.expires_at || 0;
        
        // Le token est valide s'il expire dans plus de 5 minutes
        return expiresAt > (now + 5 * 60 * 1000);
    }

    async getAccessToken() {
        if (!this.isAuthenticated()) {
            return null;
        }

        const cachedToken = this.getCachedToken();
        if (cachedToken && this.isTokenValid(cachedToken)) {
            return cachedToken.access_token;
        }
        
        console.log('[GoogleAuthService] Token expiré, re-authentification nécessaire');
        return null;
    }

    // ================================================
    // MÉTHODES PUBLIQUES
    // ================================================
    async getUserInfo() {
        if (!this.isAuthenticated()) {
            throw new Error('Non authentifié');
        }

        return {
            id: this.currentUser.id || this.currentUser.sub,
            displayName: this.currentUser.name,
            givenName: this.currentUser.given_name,
            familyName: this.currentUser.family_name,
            mail: this.currentUser.email,
            userPrincipalName: this.currentUser.email,
            imageUrl: this.currentUser.picture,
            provider: this.provider,
            username: this.currentUser.email,
            name: this.currentUser.name,
            email: this.currentUser.email
        };
    }

    async logout() {
        console.log('[GoogleAuthService] Déconnexion...');
        
        try {
            this.currentUser = null;
            localStorage.removeItem('google_token_emailsortpro');
            sessionStorage.removeItem('google_oauth_state');
            
            console.log('[GoogleAuthService] ✅ Déconnexion réussie');
            
        } catch (error) {
            console.error('[GoogleAuthService] Erreur déconnexion:', error);
        }
    }

    async reset() {
        console.log('[GoogleAuthService] Reset complet...');
        this.forceCleanup();
    }

    forceCleanup() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        
        try {
            localStorage.removeItem('google_token_emailsortpro');
            sessionStorage.removeItem('google_oauth_state');
        } catch (error) {
            console.warn('[GoogleAuthService] Erreur cleanup:', error);
        }
    }

    // ================================================
    // DIAGNOSTIC
    // ================================================
    getDiagnosticInfo() {
        const cachedToken = this.getCachedToken();
        
        return {
            isInitialized: this.isInitialized,
            hasCurrentUser: !!this.currentUser,
            userEmail: this.currentUser?.email,
            provider: this.provider,
            tokenInfo: cachedToken ? {
                hasToken: !!cachedToken.access_token,
                isValid: this.isTokenValid(cachedToken),
                expiresAt: cachedToken.expires_at ? new Date(cachedToken.expires_at).toISOString() : null
            } : null,
            scanLimits: this.scanLimits
        };
    }

    async testGmailConnection() {
        console.log('[GoogleAuthService] Test connexion Gmail...');
        
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('Aucun token valide');
            }

            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Gmail API error: ${response.status}`);
            }

            const profile = await response.json();
            console.log('[GoogleAuthService] ✅ Test réussi');
            
            return {
                success: true,
                provider: this.provider,
                email: profile.emailAddress,
                messagesTotal: profile.messagesTotal,
                threadsTotal: profile.threadsTotal,
                historyId: profile.historyId
            };

        } catch (error) {
            console.error('[GoogleAuthService] ❌ Test échoué:', error);
            return {
                success: false,
                provider: this.provider,
                error: error.message
            };
        }
    }
}

// ================================================
// INITIALISATION GLOBALE
// ================================================
try {
    // Nettoyer l'ancienne instance si elle existe
    if (window.googleAuthService) {
        window.googleAuthService.forceCleanup?.();
    }
    
    window.googleAuthService = new GoogleAuthService();
    console.log('[GoogleAuthService] ✅ v10.0 créée - Service complet et fonctionnel');
    
} catch (error) {
    console.error('[GoogleAuthService] ❌ Erreur création:', error);
    
    // Fallback en cas d'erreur
    window.googleAuthService = {
        isInitialized: false,
        provider: 'gmail',
        initialize: () => Promise.resolve(),
        login: () => Promise.reject(new Error('Service indisponible')),
        isAuthenticated: () => false,
        fetchEmails: () => Promise.reject(new Error('Service indisponible'))
    };
}

console.log('✅ GoogleAuthService v10.0 loaded - Service Gmail complet et fonctionnel');
