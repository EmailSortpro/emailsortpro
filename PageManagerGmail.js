class PageManagerGmail {
    constructor(gmailInterface) {
        this.gmailInterface = gmailInterface;
        this.currentPage = null;
        this.emails = [];
        this.filteredEmails = [];
        this.currentEmailIndex = 0;
        this.emailsPerPage = 20;
        this.totalPages = 0;
        this.currentPageNumber = 1;
        this.categoryFilter = 'all';
        this.searchQuery = '';
        this.sortOrder = 'date-desc';
        this.viewMode = 'list';
        this.selectedEmails = new Set();
        this.isLoading = false;
        this.lastFetchTime = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Utiliser IndexedDB au lieu de localStorage pour les grandes données
        this.dbName = 'GmailExtensionDB';
        this.dbVersion = 1;
        this.db = null;
        
        // Statistiques temps réel
        this.stats = {
            sessionStart: Date.now(),
            emailsProcessed: 0,
            categoriesAssigned: {},
            errors: 0
        };
        
        this.initIndexedDB();
    }

    // Initialiser IndexedDB pour stocker les emails
    async initIndexedDB() {
        try {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('[PageManagerGmail] Erreur IndexedDB:', request.error);
                // Fallback sur la mémoire si IndexedDB échoue
                this.useMemoryOnly = true;
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('[PageManagerGmail] ✅ IndexedDB initialisé');
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Créer le store pour les emails
                if (!db.objectStoreNames.contains('emails')) {
                    const emailStore = db.createObjectStore('emails', { keyPath: 'id' });
                    emailStore.createIndex('category', 'category', { unique: false });
                    emailStore.createIndex('date', 'date', { unique: false });
                    emailStore.createIndex('from', 'from', { unique: false });
                    emailStore.createIndex('isRead', 'isRead', { unique: false });
                    emailStore.createIndex('isStarred', 'isStarred', { unique: false });
                }
                
                // Créer le store pour les métadonnées
                if (!db.objectStoreNames.contains('metadata')) {
                    db.createObjectStore('metadata', { keyPath: 'key' });
                }
                
                // Créer le store pour les brouillons
                if (!db.objectStoreNames.contains('drafts')) {
                    db.createObjectStore('drafts', { keyPath: 'id', autoIncrement: true });
                }
            };
        } catch (error) {
            console.error('[PageManagerGmail] Erreur init IndexedDB:', error);
            this.useMemoryOnly = true;
        }
    }

    // Sauvegarder les emails dans IndexedDB
    async saveEmailsToIndexedDB(emails) {
        if (!this.db || this.useMemoryOnly) return;
        
        try {
            const transaction = this.db.transaction(['emails', 'metadata'], 'readwrite');
            const emailStore = transaction.objectStore('emails');
            const metaStore = transaction.objectStore('metadata');
            
            // Effacer les anciennes données
            await this.clearStore(emailStore);
            
            // Sauvegarder les nouveaux emails par lots pour éviter les timeouts
            const batchSize = 100;
            for (let i = 0; i < emails.length; i += batchSize) {
                const batch = emails.slice(i, i + batchSize);
                for (const email of batch) {
                    emailStore.add(email);
                }
            }
            
            // Sauvegarder les métadonnées
            metaStore.put({
                key: 'lastFetch',
                timestamp: Date.now(),
                count: emails.length,
                categories: this.getCategoryStats(emails)
            });
            
            await new Promise((resolve, reject) => {
                transaction.oncomplete = resolve;
                transaction.onerror = reject;
            });
            
            console.log('[PageManagerGmail] 💾 Emails sauvegardés dans IndexedDB');
        } catch (error) {
            console.error('[PageManagerGmail] Erreur sauvegarde IndexedDB:', error);
        }
    }

    // Charger les emails depuis IndexedDB
    async loadEmailsFromIndexedDB() {
        if (!this.db || this.useMemoryOnly) return null;
        
        try {
            const transaction = this.db.transaction(['emails', 'metadata'], 'readonly');
            const emailStore = transaction.objectStore('emails');
            const metaStore = transaction.objectStore('metadata');
            
            // Vérifier la fraîcheur des données
            const metadata = await this.getFromStore(metaStore, 'lastFetch');
            if (!metadata || Date.now() - metadata.timestamp > this.cacheExpiry) {
                return null; // Cache expiré
            }
            
            // Charger tous les emails
            const emails = await this.getAllFromStore(emailStore);
            
            if (emails.length > 0) {
                console.log(`[PageManagerGmail] 📥 ${emails.length} emails chargés depuis IndexedDB`);
                return emails;
            }
            
            return null;
        } catch (error) {
            console.error('[PageManagerGmail] Erreur chargement IndexedDB:', error);
            return null;
        }
    }

    // Helpers pour IndexedDB
    clearStore(store) {
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    getFromStore(store, key) {
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = reject;
        });
    }

    getAllFromStore(store) {
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = reject;
        });
    }

    // Obtenir les statistiques par catégorie
    getCategoryStats(emails) {
        const stats = {};
        emails.forEach(email => {
            stats[email.category] = (stats[email.category] || 0) + 1;
        });
        return stats;
    }

    // Sauvegarder uniquement les paramètres dans localStorage
    saveSettingsToLocal() {
        try {
            const settings = {
                categoryFilter: this.categoryFilter,
                searchQuery: this.searchQuery,
                sortOrder: this.sortOrder,
                viewMode: this.viewMode,
                emailsPerPage: this.emailsPerPage,
                currentPageNumber: this.currentPageNumber,
                cacheExpiry: this.cacheExpiry
            };
            
            localStorage.setItem('gmailSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('[PageManagerGmail] Impossible de sauvegarder les paramètres:', error);
        }
    }

    // Charger les paramètres depuis localStorage
    loadSettingsFromLocal() {
        try {
            const settings = localStorage.getItem('gmailSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                Object.assign(this, parsed);
                console.log('[PageManagerGmail] ⚙️ Paramètres chargés');
            }
        } catch (error) {
            console.warn('[PageManagerGmail] Erreur chargement paramètres:', error);
        }
    }

    // Gestion du déchargement de page
    async unloadPage() {
        console.log('[PageManagerGmail] 🔄 Déchargement de la page...');
        
        // Sauvegarder les paramètres
        this.saveSettingsToLocal();
        
        // Sauvegarder les statistiques de session
        this.saveSessionStats();
        
        // Nettoyer les écouteurs d'événements
        this.removeEventListeners();
        
        // Réinitialiser l'état
        this.emails = [];
        this.filteredEmails = [];
        this.selectedEmails.clear();
        this.currentPage = null;
        
        console.log('[PageManagerGmail] ✅ Page déchargée');
    }

    // Sauvegarder les statistiques de session
    saveSessionStats() {
        try {
            const sessionStats = {
                duration: Date.now() - this.stats.sessionStart,
                emailsProcessed: this.stats.emailsProcessed,
                categoriesAssigned: this.stats.categoriesAssigned,
                errors: this.stats.errors,
                timestamp: new Date().toISOString()
            };
            
            // Récupérer l'historique des sessions
            const history = JSON.parse(localStorage.getItem('gmailSessionHistory') || '[]');
            history.unshift(sessionStats);
            
            // Garder seulement les 10 dernières sessions
            if (history.length > 10) {
                history.length = 10;
            }
            
            localStorage.setItem('gmailSessionHistory', JSON.stringify(history));
        } catch (error) {
            console.warn('[PageManagerGmail] Erreur sauvegarde stats session:', error);
        }
    }

    // Supprimer les écouteurs d'événements
    removeEventListeners() {
        const oldContainer = document.querySelector('.container');
        if (oldContainer) {
            const newContainer = oldContainer.cloneNode(true);
            oldContainer.parentNode.replaceChild(newContainer, oldContainer);
        }
    }

    // Récupérer les emails via l'API Gmail
    async fetchEmails(maxResults = 500) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        console.log('[PageManagerGmail] 📧 Récupération des emails...');

        try {
            // Essayer de charger depuis IndexedDB d'abord
            const cachedEmails = await this.loadEmailsFromIndexedDB();
            if (cachedEmails) {
                this.emails = cachedEmails;
                this.filteredEmails = [...this.emails];
                this.calculateTotalPages();
                this.isLoading = false;
                return;
            }

            // Sinon, récupérer depuis l'API Gmail
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    { 
                        action: "getEmails", 
                        maxResults: maxResults 
                    },
                    resolve
                );
            });

            if (response.error) {
                throw new Error(response.error);
            }

            // Traiter et enrichir les emails
            this.emails = await this.processEmails(response.emails || []);
            this.filteredEmails = [...this.emails];
            
            // Sauvegarder dans IndexedDB
            await this.saveEmailsToIndexedDB(this.emails);
            
            // Calculer les pages
            this.calculateTotalPages();
            
            // Mettre à jour les stats
            this.stats.emailsProcessed += this.emails.length;
            
            console.log(`[PageManagerGmail] ✅ ${this.emails.length} emails récupérés`);
            
        } catch (error) {
            console.error('[PageManagerGmail] ❌ Erreur récupération emails:', error);
            this.stats.errors++;
            this.showError("Erreur lors de la récupération des emails");
        } finally {
            this.isLoading = false;
        }
    }

    // Traiter les emails récupérés
    async processEmails(rawEmails) {
        const categoryManager = window.categoryManager;
        const processedEmails = [];

        for (const email of rawEmails) {
            try {
                // Extraire les informations de base
                const from = this.extractEmailAddress(email.from);
                const subject = email.subject || 'Sans objet';
                const date = new Date(email.date);
                const snippet = email.snippet || '';

                // Catégoriser l'email
                let category = 'other';
                let categoryScore = 0;

                if (categoryManager) {
                    const result = await categoryManager.categorizeEmail({
                        from: from,
                        subject: subject,
                        snippet: snippet
                    });
                    
                    if (result && result.category) {
                        category = result.category;
                        categoryScore = result.confidence || 0;
                        
                        // Mettre à jour les stats
                        this.stats.categoriesAssigned[category] = 
                            (this.stats.categoriesAssigned[category] || 0) + 1;
                    }
                }

                processedEmails.push({
                    id: email.id,
                    threadId: email.threadId,
                    from: from,
                    fromName: this.extractName(email.from) || from,
                    to: email.to,
                    subject: subject,
                    snippet: snippet,
                    body: email.body || '',
                    date: date,
                    timestamp: date.getTime(),
                    labels: email.labelIds || [],
                    category: category,
                    categoryScore: categoryScore,
                    attachments: email.attachments || [],
                    isRead: !email.labelIds?.includes('UNREAD'),
                    isStarred: email.labelIds?.includes('STARRED'),
                    isImportant: email.labelIds?.includes('IMPORTANT'),
                    isDraft: email.labelIds?.includes('DRAFT'),
                    isSpam: email.labelIds?.includes('SPAM'),
                    isTrash: email.labelIds?.includes('TRASH')
                });
            } catch (error) {
                console.error('[PageManagerGmail] Erreur traitement email:', error, email);
                this.stats.errors++;
            }
        }

        // Trier par date décroissante par défaut
        processedEmails.sort((a, b) => b.timestamp - a.timestamp);

        return processedEmails;
    }

    // Extraire l'adresse email
    extractEmailAddress(fromString) {
        if (!fromString) return 'unknown@email.com';
        const match = fromString.match(/<(.+?)>/);
        return match ? match[1] : fromString;
    }

    // Extraire le nom
    extractName(fromString) {
        if (!fromString) return null;
        const match = fromString.match(/^(.+?)\s*</);
        return match ? match[1].trim() : null;
    }

    // Calculer le nombre total de pages
    calculateTotalPages() {
        this.totalPages = Math.ceil(this.filteredEmails.length / this.emailsPerPage);
        if (this.currentPageNumber > this.totalPages) {
            this.currentPageNumber = Math.max(1, this.totalPages);
        }
    }

    // Filtrer les emails
    filterEmails() {
        this.filteredEmails = this.emails.filter(email => {
            // Exclure les emails dans la corbeille ou spam
            if (email.isTrash || email.isSpam) {
                return false;
            }

            // Filtre par catégorie
            if (this.categoryFilter !== 'all' && email.category !== this.categoryFilter) {
                return false;
            }

            // Filtre par recherche
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                const searchableText = `
                    ${email.subject} 
                    ${email.fromName} 
                    ${email.from} 
                    ${email.snippet}
                    ${email.body}
                `.toLowerCase();
                
                if (!searchableText.includes(query)) {
                    return false;
                }
            }

            return true;
        });

        // Appliquer le tri
        this.sortEmails();
        
        // Recalculer les pages
        this.calculateTotalPages();
        
        // Réinitialiser à la première page
        this.currentPageNumber = 1;
    }

    // Trier les emails
    sortEmails() {
        this.filteredEmails.sort((a, b) => {
            switch (this.sortOrder) {
                case 'date-desc':
                    return b.timestamp - a.timestamp;
                case 'date-asc':
                    return a.timestamp - b.timestamp;
                case 'subject-asc':
                    return a.subject.localeCompare(b.subject);
                case 'subject-desc':
                    return b.subject.localeCompare(a.subject);
                case 'from-asc':
                    return a.fromName.localeCompare(b.fromName);
                case 'from-desc':
                    return b.fromName.localeCompare(a.fromName);
                case 'category-asc':
                    return a.category.localeCompare(b.category);
                case 'category-desc':
                    return b.category.localeCompare(a.category);
                default:
                    return b.timestamp - a.timestamp;
            }
        });
    }

    // Obtenir les emails de la page courante
    getCurrentPageEmails() {
        const start = (this.currentPageNumber - 1) * this.emailsPerPage;
        const end = start + this.emailsPerPage;
        return this.filteredEmails.slice(start, end);
    }

    // Charger une page
    async loadPage(pageName) {
        console.log(`[PageManagerGmail] 📄 Chargement de la page: ${pageName}`);
        
        this.currentPage = pageName;
        this.loadSettingsFromLocal();

        const container = document.querySelector('.container');
        if (!container) return;

        // Ajouter une classe pour le style de la page
        container.className = `container page-${pageName}`;

        switch (pageName) {
            case 'emails':
                await this.renderEmailsPage(container);
                break;
            case 'compose':
                this.renderComposePage(container);
                break;
            case 'settings':
                this.renderSettingsPage(container);
                break;
            case 'statistics':
                this.renderStatisticsPage(container);
                break;
            case 'search':
                this.renderAdvancedSearchPage(container);
                break;
            default:
                this.renderDefaultPage(container);
        }
    }

    // Afficher la page des emails
    async renderEmailsPage(container) {
        container.innerHTML = `
            <div class="emails-page">
                <div class="page-header">
                    <h1>📧 Mes Emails</h1>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="refreshEmails">
                            <i class="fas fa-sync-alt"></i> Actualiser
                        </button>
                        <button class="btn btn-secondary" id="composeEmail">
                            <i class="fas fa-pen"></i> Nouveau
                        </button>
                        <button class="btn btn-secondary" id="viewMode">
                            <i class="fas fa-${this.viewMode === 'list' ? 'th' : 'list'}"></i>
                        </button>
                    </div>
                </div>

                <div class="filters-section">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchInput" placeholder="Rechercher..." value="${this.searchQuery}">
                        <button class="btn-icon" id="advancedSearch" title="Recherche avancée">
                            <i class="fas fa-filter"></i>
                        </button>
                    </div>
                    
                    <div class="filter-controls">
                        <select id="categoryFilter" class="filter-select">
                            <option value="all">Toutes les catégories</option>
                            <option value="important">⭐ Important</option>
                            <option value="security">🔒 Sécurité</option>
                            <option value="finance">💰 Finance</option>
                            <option value="commercial">🛍️ Commercial</option>
                            <option value="social">👥 Social</option>
                            <option value="meetings">📅 Réunions</option>
                            <option value="marketing_news">📰 Marketing/Actualités</option>
                            <option value="other">📁 Autres</option>
                        </select>
                        
                        <select id="sortOrder" class="filter-select">
                            <option value="date-desc">Plus récents</option>
                            <option value="date-asc">Plus anciens</option>
                            <option value="subject-asc">Objet A-Z</option>
                            <option value="subject-desc">Objet Z-A</option>
                            <option value="from-asc">Expéditeur A-Z</option>
                            <option value="from-desc">Expéditeur Z-A</option>
                            <option value="category-asc">Catégorie A-Z</option>
                            <option value="category-desc">Catégorie Z-A</option>
                        </select>
                        
                        <div class="quick-filters">
                            <button class="filter-btn ${!this.hasActiveQuickFilter() ? 'active' : ''}" data-filter="all">
                                <i class="fas fa-inbox"></i> Tous
                            </button>
                            <button class="filter-btn" data-filter="unread">
                                <i class="fas fa-envelope"></i> Non lus
                            </button>
                            <button class="filter-btn" data-filter="starred">
                                <i class="fas fa-star"></i> Favoris
                            </button>
                            <button class="filter-btn" data-filter="attachments">
                                <i class="fas fa-paperclip"></i> Pièces jointes
                            </button>
                        </div>
                    </div>
                </div>

                <div class="emails-toolbar" style="display: none;">
                    <div class="selection-info">
                        <span id="selectionCount">0 sélectionné(s)</span>
                    </div>
                    <div class="toolbar-actions">
                        <button class="btn-icon" id="markAsRead" title="Marquer comme lu">
                            <i class="fas fa-envelope-open"></i>
                        </button>
                        <button class="btn-icon" id="markAsUnread" title="Marquer comme non lu">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="btn-icon" id="starSelected" title="Ajouter aux favoris">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="btn-icon" id="archiveSelected" title="Archiver">
                            <i class="fas fa-archive"></i>
                        </button>
                        <button class="btn-icon" id="deleteSelected" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="emails-container">
                    <div class="loading-spinner" id="loadingSpinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Chargement des emails...</p>
                    </div>
                    <div id="emailsList" class="emails-list ${this.viewMode}"></div>
                </div>

                <div class="pagination" id="pagination"></div>
            </div>
        `;

        // Restaurer les valeurs des filtres
        document.getElementById('categoryFilter').value = this.categoryFilter;
        document.getElementById('sortOrder').value = this.sortOrder;

        // Charger les emails
        if (this.emails.length === 0) {
            await this.fetchEmails();
        }

        // Afficher les emails
        this.displayEmails();
        
        // Configurer les interactions
        this.setupEmailsInteractions();
    }

    // Vérifier si un filtre rapide est actif
    hasActiveQuickFilter() {
        return this.quickFilter && this.quickFilter !== 'all';
    }

    // Afficher les emails
    displayEmails() {
        const emailsList = document.getElementById('emailsList');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        if (!emailsList) return;

        if (this.isLoading) {
            loadingSpinner.style.display = 'flex';
            emailsList.style.display = 'none';
            return;
        }

        loadingSpinner.style.display = 'none';
        emailsList.style.display = this.viewMode === 'grid' ? 'grid' : 'block';

        const pageEmails = this.getCurrentPageEmails();

        if (pageEmails.length === 0) {
            emailsList.innerHTML = `
                <div class="no-emails">
                    <i class="fas fa-inbox fa-3x"></i>
                    <p>Aucun email trouvé</p>
                    <button class="btn btn-primary" onclick="window.pageManager.clearFilters()">
                        Réinitialiser les filtres
                    </button>
                </div>
            `;
            return;
        }

        emailsList.innerHTML = pageEmails.map(email => this.renderEmailItem(email)).join('');
        
        // Mettre à jour la pagination
        this.updatePagination();
    }

    // Réinitialiser les filtres
    clearFilters() {
        this.categoryFilter = 'all';
        this.searchQuery = '';
        this.quickFilter = 'all';
        
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('searchInput').value = '';
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
        
        this.filterEmails();
        this.displayEmails();
        this.saveSettingsToLocal();
    }

    // Rendre un email
    renderEmailItem(email) {
        const categoryColors = {
            important: '#ff4444',
            security: '#ff9800',
            finance: '#4caf50',
            commercial: '#2196f3',
            social: '#9c27b0',
            meetings: '#00bcd4',
            marketing_news: '#795548',
            other: '#607d8b'
        };

        const categoryLabels = {
            important: '⭐ Important',
            security: '🔒 Sécurité',
            finance: '💰 Finance',
            commercial: '🛍️ Commercial',
            social: '👥 Social',
            meetings: '📅 Réunions',
            marketing_news: '📰 Marketing/Actualités',
            other: '📁 Autres'
        };

        const categoryColor = categoryColors[email.category] || categoryColors.other;
        const formattedDate = this.formatDate(email.date);

        if (this.viewMode === 'grid') {
            return `
                <div class="email-card ${email.isRead ? 'read' : 'unread'}" data-email-id="${email.id}">
                    <div class="email-card-header">
                        <input type="checkbox" class="email-select" data-email-id="${email.id}">
                        <span class="category-badge" style="background-color: ${categoryColor}">
                            ${categoryLabels[email.category]}
                        </span>
                        <div class="email-actions">
                            ${email.isStarred ? '<i class="fas fa-star starred"></i>' : '<i class="far fa-star"></i>'}
                        </div>
                    </div>
                    <div class="email-card-from">${email.fromName}</div>
                    <div class="email-card-subject">${email.subject}</div>
                    <div class="email-card-snippet">${email.snippet}</div>
                    <div class="email-card-footer">
                        <span class="email-date">${formattedDate}</span>
                        ${email.attachments.length > 0 ? '<i class="fas fa-paperclip"></i>' : ''}
                        ${email.isImportant ? '<i class="fas fa-exclamation-circle important"></i>' : ''}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="email-item ${email.isRead ? 'read' : 'unread'}" data-email-id="${email.id}">
                    <div class="email-checkbox">
                        <input type="checkbox" class="email-select" data-email-id="${email.id}">
                    </div>
                    <div class="email-star">
                        ${email.isStarred ? '<i class="fas fa-star starred"></i>' : '<i class="far fa-star"></i>'}
                    </div>
                    <div class="email-importance">
                        ${email.isImportant ? '<i class="fas fa-exclamation-circle important"></i>' : ''}
                    </div>
                    <div class="email-from">${email.fromName}</div>
                    <div class="email-content">
                        <div class="email-subject">
                            ${email.subject}
                            <span class="category-badge" style="background-color: ${categoryColor}">
                                ${categoryLabels[email.category]}
                            </span>
                        </div>
                        <div class="email-snippet">${email.snippet}</div>
                    </div>
                    <div class="email-meta">
                        ${email.attachments.length > 0 ? '<i class="fas fa-paperclip"></i>' : ''}
                        <span class="email-date">${formattedDate}</span>
                    </div>
                </div>
            `;
        }
    }

    // Formater la date
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return minutes === 0 ? 'À l\'instant' : `Il y a ${minutes} min`;
            }
            return `Il y a ${hours}h`;
        } else if (days === 1) {
            return 'Hier';
        } else if (days < 7) {
            return `Il y a ${days} jours`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    // Mettre à jour la pagination
    updatePagination() {
        const paginationDiv = document.getElementById('pagination');
        if (!paginationDiv) return;

        if (this.totalPages <= 1) {
            paginationDiv.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-info">';
        const start = (this.currentPageNumber - 1) * this.emailsPerPage + 1;
        const end = Math.min(this.currentPageNumber * this.emailsPerPage, this.filteredEmails.length);
        paginationHTML += `<span>${start}-${end} sur ${this.filteredEmails.length}</span></div>`;
        
        paginationHTML += '<div class="pagination-controls">';
        
        // Bouton précédent
        paginationHTML += `
            <button class="page-btn" ${this.currentPageNumber === 1 ? 'disabled' : ''} data-page="${this.currentPageNumber - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Numéros de page
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPageNumber - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-dots">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPageNumber ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += `<span class="page-dots">...</span>`;
            }
            paginationHTML += `<button class="page-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
        }

        // Bouton suivant
        paginationHTML += `
            <button class="page-btn" ${this.currentPageNumber === this.totalPages ? 'disabled' : ''} data-page="${this.currentPageNumber + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationHTML += '</div>';
        paginationDiv.innerHTML = paginationHTML;

        // Ajouter les écouteurs
        paginationDiv.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPageNumber = parseInt(btn.dataset.page);
                this.displayEmails();
                window.scrollTo(0, 0);
            });
        });
    }

    // Configurer les interactions
    setupEmailsInteractions() {
        console.log('[PageManagerGmail] 🎯 Configuration des interactions...');

        // Actualiser
        const refreshBtn = document.getElementById('refreshEmails');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualisation...';
                
                // Forcer le rechargement depuis l'API
                this.emails = [];
                await this.fetchEmails();
                this.filterEmails();
                this.displayEmails();
                
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualiser';
                
                this.showSuccess('Emails actualisés !');
            });
        }

        // Composer un nouvel email
        const composeBtn = document.getElementById('composeEmail');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => {
                this.loadPage('compose');
            });
        }

        // Mode d'affichage
        const viewModeBtn = document.getElementById('viewMode');
        if (viewModeBtn) {
            viewModeBtn.addEventListener('click', () => {
                this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
                viewModeBtn.innerHTML = `<i class="fas fa-${this.viewMode === 'list' ? 'th' : 'list'}"></i>`;
                this.displayEmails();
                this.saveSettingsToLocal();
            });
        }

        // Recherche
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value;
                    this.filterEmails();
                    this.displayEmails();
                    this.saveSettingsToLocal();
                }, 300);
            });

            // Touche Entrée pour rechercher immédiatement
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(searchTimeout);
                    this.searchQuery = e.target.value;
                    this.filterEmails();
                    this.displayEmails();
                    this.saveSettingsToLocal();
                }
            });
        }

        // Recherche avancée
        const advancedSearchBtn = document.getElementById('advancedSearch');
        if (advancedSearchBtn) {
            advancedSearchBtn.addEventListener('click', () => {
                this.loadPage('search');
            });
        }

        // Filtre par catégorie
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.categoryFilter = e.target.value;
                this.filterEmails();
                this.displayEmails();
                this.saveSettingsToLocal();
            });
        }

        // Tri
        const sortOrder = document.getElementById('sortOrder');
        if (sortOrder) {
            sortOrder.addEventListener('change', (e) => {
                this.sortOrder = e.target.value;
                this.filterEmails();
                this.displayEmails();
                this.saveSettingsToLocal();
            });
        }

        // Filtres rapides
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.quickFilter = filter;
                
                // Mettre à jour l'apparence des boutons
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.toggle('active', b === btn);
                });
                
                // Appliquer le filtre
                this.applyQuickFilter(filter);
                this.displayEmails();
            });
        });

        // Sélection multiple
        this.setupSelectionHandlers();

        // Clic sur les emails
        document.addEventListener('click', (e) => {
            // Clic sur l'étoile
            if (e.target.classList.contains('fa-star')) {
                e.stopPropagation();
                const emailItem = e.target.closest('[data-email-id]');
                if (emailItem) {
                    this.toggleStar(emailItem.dataset.emailId);
                }
                return;
            }

            // Clic sur l'email (sauf checkbox)
            const emailItem = e.target.closest('.email-item, .email-card');
            if (emailItem && !e.target.closest('.email-checkbox')) {
                const emailId = emailItem.dataset.emailId;
                this.openEmail(emailId);
            }
        });
    }

    // Appliquer un filtre rapide
    applyQuickFilter(filter) {
        this.filteredEmails = this.emails.filter(email => {
            // Appliquer d'abord les filtres existants
            if (this.categoryFilter !== 'all' && email.category !== this.categoryFilter) {
                return false;
            }
            
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                const searchableText = `${email.subject} ${email.fromName} ${email.from} ${email.snippet}`.toLowerCase();
                if (!searchableText.includes(query)) {
                    return false;
                }
            }
            
            // Appliquer le filtre rapide
            switch (filter) {
                case 'unread':
                    return !email.isRead;
                case 'starred':
                    return email.isStarred;
                case 'attachments':
                    return email.attachments.length > 0;
                case 'all':
                default:
                    return true;
            }
        });
        
        this.sortEmails();
        this.calculateTotalPages();
        this.currentPageNumber = 1;
    }

    // Configurer les gestionnaires de sélection
    setupSelectionHandlers() {
        const toolbar = document.querySelector('.emails-toolbar');
        
        // Checkbox de sélection
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('email-select')) {
                const emailId = e.target.dataset.emailId;
                if (e.target.checked) {
                    this.selectedEmails.add(emailId);
                } else {
                    this.selectedEmails.delete(emailId);
                }
                this.updateSelectionUI();
            }
        });
        
        // Actions sur la sélection
        document.getElementById('markAsRead')?.addEventListener('click', () => {
            this.performBulkAction('markAsRead');
        });
        
        document.getElementById('markAsUnread')?.addEventListener('click', () => {
            this.performBulkAction('markAsUnread');
        });
        
        document.getElementById('starSelected')?.addEventListener('click', () => {
            this.performBulkAction('star');
        });
        
        document.getElementById('archiveSelected')?.addEventListener('click', () => {
            this.performBulkAction('archive');
        });
        
        document.getElementById('deleteSelected')?.addEventListener('click', () => {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedEmails.size} email(s) ?`)) {
                this.performBulkAction('delete');
            }
        });
    }

    // Mettre à jour l'UI de sélection
    updateSelectionUI() {
        const toolbar = document.querySelector('.emails-toolbar');
        const selectionCount = document.getElementById('selectionCount');
        
        if (toolbar) {
            toolbar.style.display = this.selectedEmails.size > 0 ? 'flex' : 'none';
        }
        
        if (selectionCount) {
            selectionCount.textContent = `${this.selectedEmails.size} sélectionné(s)`;
        }
    }

    // Effectuer une action en masse
    async performBulkAction(action) {
        const emailIds = Array.from(this.selectedEmails);
        
        try {
            for (const emailId of emailIds) {
                const email = this.emails.find(e => e.id === emailId);
                if (!email) continue;
                
                switch (action) {
                    case 'markAsRead':
                        email.isRead = true;
                        await this.updateEmailStatus(emailId, 'markAsRead');
                        break;
                    case 'markAsUnread':
                        email.isRead = false;
                        await this.updateEmailStatus(emailId, 'markAsUnread');
                        break;
                    case 'star':
                        email.isStarred = !email.isStarred;
                        await this.updateEmailStatus(emailId, email.isStarred ? 'star' : 'unstar');
                        break;
                    case 'archive':
                        await this.archiveEmail(emailId);
                        break;
                    case 'delete':
                        await this.deleteEmail(emailId);
                        break;
                }
            }
            
            // Rafraîchir l'affichage
            this.filterEmails();
            this.displayEmails();
            
            // Réinitialiser la sélection
            this.selectedEmails.clear();
            this.updateSelectionUI();
            
            // Sauvegarder les changements
            await this.saveEmailsToIndexedDB(this.emails);
            
            this.showSuccess(`Action effectuée sur ${emailIds.length} email(s)`);
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur action en masse:', error);
            this.showError('Erreur lors de l\'exécution de l\'action');
        }
    }

    // Mettre à jour le statut d'un email
    async updateEmailStatus(emailId, action) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: "updateEmailStatus",
                emailId: emailId,
                status: action
            }, resolve);
        });
    }

    // Basculer l'étoile
    async toggleStar(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email) return;
        
        email.isStarred = !email.isStarred;
        
        // Mettre à jour l'UI immédiatement
        const starIcon = document.querySelector(`[data-email-id="${emailId}"] .fa-star`);
        if (starIcon) {
            starIcon.className = email.isStarred ? 'fas fa-star starred' : 'far fa-star';
        }
        
        // Envoyer la mise à jour au backend
        await this.updateEmailStatus(emailId, email.isStarred ? 'star' : 'unstar');
        
        // Sauvegarder localement
        await this.saveEmailsToIndexedDB(this.emails);
    }

    // Ouvrir un email
    openEmail(emailId) {
        console.log(`[PageManagerGmail] Ouverture de l'email: ${emailId}`);
        
        // Marquer comme lu
        const email = this.emails.find(e => e.id === emailId);
        if (email && !email.isRead) {
            email.isRead = true;
            this.saveEmailsToIndexedDB(this.emails);
            this.updateEmailStatus(emailId, 'markAsRead');
            
            // Mettre à jour l'affichage
            const emailElement = document.querySelector(`[data-email-id="${emailId}"]`);
            if (emailElement) {
                emailElement.classList.add('read');
                emailElement.classList.remove('unread');
            }
        }
        
        // Afficher le détail de l'email
        this.showEmailDetail(email);
    }

    // Afficher le détail d'un email
    showEmailDetail(email) {
        if (!email) return;
        
        const modal = document.createElement('div');
        modal.className = 'email-modal';
        modal.innerHTML = `
            <div class="email-detail">
                <div class="email-detail-header">
                    <button class="close-modal">&times;</button>
                    <h2>${email.subject}</h2>
                </div>
                <div class="email-detail-meta">
                    <div class="email-detail-from">
                        <strong>De:</strong> ${email.fromName} &lt;${email.from}&gt;
                    </div>
                    <div class="email-detail-date">
                        <strong>Date:</strong> ${email.date.toLocaleString('fr-FR')}
                    </div>
                    ${email.to ? `<div class="email-detail-to"><strong>À:</strong> ${email.to}</div>` : ''}
                </div>
                <div class="email-detail-body">
                    ${email.body || email.snippet}
                </div>
                ${email.attachments.length > 0 ? `
                    <div class="email-detail-attachments">
                        <h3><i class="fas fa-paperclip"></i> Pièces jointes (${email.attachments.length})</h3>
                        <div class="attachments-list">
                            ${email.attachments.map(att => `
                                <div class="attachment-item">
                                    <i class="fas fa-file"></i> ${att.filename || 'Pièce jointe'}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                <div class="email-detail-actions">
                    <button class="btn btn-primary" onclick="window.pageManager.replyToEmail('${email.id}')">
                        <i class="fas fa-reply"></i> Répondre
                    </button>
                    <button class="btn btn-secondary" onclick="window.pageManager.forwardEmail('${email.id}')">
                        <i class="fas fa-share"></i> Transférer
                    </button>
                    <button class="btn btn-secondary" onclick="window.pageManager.openInGmail('${email.id}')">
                        <i class="fas fa-external-link-alt"></i> Ouvrir dans Gmail
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fermer la modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Répondre à un email
    replyToEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email) return;
        
        // Fermer la modal si elle existe
        document.querySelector('.email-modal')?.remove();
        
        // Charger la page de composition avec les données de réponse
        this.composeData = {
            to: email.from,
            subject: `Re: ${email.subject}`,
            body: `\n\n---\nLe ${email.date.toLocaleString('fr-FR')}, ${email.fromName} a écrit:\n${email.snippet}`,
            inReplyTo: emailId
        };
        
        this.loadPage('compose');
    }

    // Transférer un email
    forwardEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (!email) return;
        
        // Fermer la modal
        document.querySelector('.email-modal')?.remove();
        
        // Charger la page de composition
        this.composeData = {
            subject: `Fwd: ${email.subject}`,
            body: `\n\n--- Message transféré ---\nDe: ${email.fromName} <${email.from}>\nDate: ${email.date.toLocaleString('fr-FR')}\nObjet: ${email.subject}\n\n${email.body || email.snippet}`,
            forward: emailId
        };
        
        this.loadPage('compose');
    }

    // Ouvrir dans Gmail
    openInGmail(emailId) {
        chrome.runtime.sendMessage({
            action: "openEmail",
            emailId: emailId
        });
    }

    // Archiver un email
    async archiveEmail(emailId) {
        try {
            await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: "archiveEmail",
                    emailId: emailId
                }, resolve);
            });
            
            // Retirer de la liste
            this.emails = this.emails.filter(e => e.id !== emailId);
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur archivage:', error);
        }
    }

    // Supprimer un email
    async deleteEmail(emailId) {
        try {
            await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: "deleteEmail",
                    emailId: emailId
                }, resolve);
            });
            
            // Retirer de la liste
            this.emails = this.emails.filter(e => e.id !== emailId);
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur suppression:', error);
        }
    }

    // Afficher la page de composition
    renderComposePage(container) {
        const data = this.composeData || {};
        
        container.innerHTML = `
            <div class="compose-page">
                <div class="page-header">
                    <h1>✉️ Nouveau message</h1>
                    <button class="btn btn-secondary" onclick="window.pageManager.loadPage('emails')">
                        <i class="fas fa-arrow-left"></i> Retour
                    </button>
                </div>
                
                <form id="composeForm" class="compose-form">
                    <div class="form-group">
                        <label for="composeTo">À:</label>
                        <input type="email" id="composeTo" name="to" value="${data.to || ''}" required 
                               placeholder="destinataire@example.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="composeCc">Cc:</label>
                        <input type="email" id="composeCc" name="cc" placeholder="Copie carbone (optionnel)">
                    </div>
                    
                    <div class="form-group">
                        <label for="composeSubject">Objet:</label>
                        <input type="text" id="composeSubject" name="subject" value="${data.subject || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="composeBody">Message:</label>
                        <textarea id="composeBody" name="body" rows="15" required>${data.body || ''}</textarea>
                    </div>
                    
                    <div class="compose-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Envoyer
                        </button>
                        <button type="button" class="btn btn-secondary" id="saveDraft">
                            <i class="fas fa-save"></i> Enregistrer le brouillon
                        </button>
                        <button type="button" class="btn btn-secondary" id="attachFile">
                            <i class="fas fa-paperclip"></i> Joindre un fichier
                        </button>
                    </div>
                    
                    <div id="attachmentsList" class="attachments-list"></div>
                </form>
            </div>
        `;
        
        // Réinitialiser composeData
        this.composeData = null;
        
        // Configurer les interactions
        this.setupComposeInteractions();
    }

    // Configurer les interactions de composition
    setupComposeInteractions() {
        const form = document.getElementById('composeForm');
        
        // Envoi du formulaire
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const emailData = {
                to: formData.get('to'),
                cc: formData.get('cc'),
                subject: formData.get('subject'),
                body: formData.get('body')
            };
            
            try {
                // Désactiver le bouton d'envoi
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
                
                // Envoyer l'email
                const response = await new Promise((resolve) => {
                    chrome.runtime.sendMessage({
                        action: "sendEmail",
                        emailData: emailData
                    }, resolve);
                });
                
                if (response.success) {
                    this.showSuccess('Email envoyé avec succès !');
                    this.loadPage('emails');
                } else {
                    throw new Error(response.error || 'Erreur inconnue');
                }
                
            } catch (error) {
                console.error('[PageManagerGmail] Erreur envoi email:', error);
                this.showError(`Erreur lors de l'envoi: ${error.message}`);
                
                // Réactiver le bouton
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer';
            }
        });
        
        // Sauvegarder le brouillon
        document.getElementById('saveDraft')?.addEventListener('click', async () => {
            const formData = new FormData(form);
            const draftData = {
                to: formData.get('to'),
                cc: formData.get('cc'),
                subject: formData.get('subject'),
                body: formData.get('body'),
                savedAt: new Date().toISOString()
            };
            
            try {
                await this.saveDraft(draftData);
                this.showSuccess('Brouillon enregistré !');
            } catch (error) {
                this.showError('Erreur lors de l\'enregistrement du brouillon');
            }
        });
        
        // Auto-save du brouillon
        let autoSaveTimeout;
        form.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(async () => {
                const formData = new FormData(form);
                if (formData.get('to') || formData.get('subject') || formData.get('body')) {
                    await this.saveDraft({
                        to: formData.get('to'),
                        cc: formData.get('cc'),
                        subject: formData.get('subject'),
                        body: formData.get('body'),
                        savedAt: new Date().toISOString()
                    });
                }
            }, 2000);
        });
    }

    // Sauvegarder un brouillon
    async saveDraft(draftData) {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['drafts'], 'readwrite');
            const store = transaction.objectStore('drafts');
            
            await new Promise((resolve, reject) => {
                const request = store.add(draftData);
                request.onsuccess = resolve;
                request.onerror = reject;
            });
            
        } catch (error) {
            console.error('[PageManagerGmail] Erreur sauvegarde brouillon:', error);
            throw error;
        }
    }

    // Afficher la page des paramètres
    renderSettingsPage(container) {
        container.innerHTML = `
            <div class="settings-page">
                <h1>⚙️ Paramètres</h1>
                
                <div class="settings-section">
                    <h2>Affichage</h2>
                    <div class="setting-item">
                        <label>Emails par page</label>
                        <select id="emailsPerPage">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Mode d'affichage par défaut</label>
                        <select id="defaultViewMode">
                            <option value="list">Liste</option>
                            <option value="grid">Grille</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Thème</label>
                        <select id="theme">
                            <option value="light">Clair</option>
                            <option value="dark">Sombre</option>
                            <option value="auto">Automatique</option>
                        </select>
                    </div>
                </div>

                <div class="settings-section">
                    <h2>Cache et performances</h2>
                    <div class="setting-item">
                        <label>Durée du cache (minutes)</label>
                        <input type="number" id="cacheExpiry" min="1" max="60" value="${this.cacheExpiry / 60000}">
                    </div>
                    <div class="setting-item">
                        <label>Taille du cache</label>
                        <span id="cacheSize">Calcul...</span>
                    </div>
                    <button class="btn btn-danger" id="clearCache">
                        <i class="fas fa-trash"></i> Vider le cache
                    </button>
                </div>

                <div class="settings-section">
                    <h2>Notifications</h2>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="enableNotifications"> 
                            Activer les notifications
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="notifyImportant"> 
                            Notifier uniquement les emails importants
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h2>Import/Export</h2>
                    <button class="btn btn-secondary" id="exportSettings">
                        <i class="fas fa-download"></i> Exporter les paramètres
                    </button>
                    <button class="btn btn-secondary" id="importSettings">
                        <i class="fas fa-upload"></i> Importer les paramètres
                    </button>
                </div>

                <div class="settings-section">
                    <button class="btn btn-primary" id="saveSettings">
                        <i class="fas fa-save"></i> Enregistrer
                    </button>
                    <button class="btn btn-secondary" id="resetSettings">
                        <i class="fas fa-undo"></i> Réinitialiser
                    </button>
                </div>
            </div>
        `;

        // Charger les valeurs actuelles
        this.loadSettings();
        
        // Calculer la taille du cache
        this.calculateCacheSize();
        
        // Configurer les interactions
        this.setupSettingsInteractions();
    }

    // Charger les paramètres dans le formulaire
    loadSettings() {
        document.getElementById('emailsPerPage').value = this.emailsPerPage;
        document.getElementById('defaultViewMode').value = this.viewMode;
        
        // Charger d'autres paramètres depuis localStorage
        try {
            const settings = JSON.parse(localStorage.getItem('gmailAdvancedSettings') || '{}');
            
            if (settings.theme) {
                document.getElementById('theme').value = settings.theme;
            }
            
            if (settings.notifications !== undefined) {
                document.getElementById('enableNotifications').checked = settings.notifications;
                document.getElementById('notifyImportant').checked = settings.notifyImportant || false;
            }
        } catch (error) {
            console.error('[PageManagerGmail] Erreur chargement paramètres avancés:', error);
        }
    }

    // Calculer la taille du cache
    async calculateCacheSize() {
        const sizeElement = document.getElementById('cacheSize');
        if (!sizeElement || !this.db) return;
        
        try {
            const transaction = this.db.transaction(['emails'], 'readonly');
            const store = transaction.objectStore('emails');
            const count = await new Promise((resolve, reject) => {
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = reject;
            });
            
            // Estimation approximative
            const estimatedSize = count * 2; // ~2KB par email
            const sizeInMB = (estimatedSize / 1024).toFixed(2);
            
            sizeElement.textContent = `${count} emails (~${sizeInMB} MB)`;
        } catch (error) {
            sizeElement.textContent = 'Erreur de calcul';
        }
    }

    // Configurer les interactions des paramètres
    setupSettingsInteractions() {
        // Sauvegarder les paramètres
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.emailsPerPage = parseInt(document.getElementById('emailsPerPage').value);
                this.viewMode = document.getElementById('defaultViewMode').value;
                this.cacheExpiry = parseInt(document.getElementById('cacheExpiry').value) * 60000;
                
                // Sauvegarder les paramètres avancés
                const advancedSettings = {
                    theme: document.getElementById('theme').value,
                    notifications: document.getElementById('enableNotifications').checked,
                    notifyImportant: document.getElementById('notifyImportant').checked
                };
                
                localStorage.setItem('gmailAdvancedSettings', JSON.stringify(advancedSettings));
                
                this.saveSettingsToLocal();
                this.calculateTotalPages();
                
                // Appliquer le thème
                this.applyTheme(advancedSettings.theme);
                
                this.showSuccess('Paramètres enregistrés !');
            });
        }

        // Réinitialiser les paramètres
        document.getElementById('resetSettings')?.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
                localStorage.removeItem('gmailSettings');
                localStorage.removeItem('gmailAdvancedSettings');
                
                // Réinitialiser les valeurs par défaut
                this.emailsPerPage = 20;
                this.viewMode = 'list';
                this.cacheExpiry = 5 * 60 * 1000;
                
                this.loadSettings();
                this.showSuccess('Paramètres réinitialisés !');
            }
        });

        // Vider le cache
        const clearCacheBtn = document.getElementById('clearCache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', async () => {
                if (confirm('Êtes-vous sûr de vouloir vider le cache ?')) {
                    // Vider IndexedDB
                    if (this.db) {
                        const transaction = this.db.transaction(['emails', 'metadata'], 'readwrite');
                        await this.clearStore(transaction.objectStore('emails'));
                        await this.clearStore(transaction.objectStore('metadata'));
                    }
                    
                    // Réinitialiser les données en mémoire
                    this.emails = [];
                    this.filteredEmails = [];
                    
                    this.calculateCacheSize();
                    this.showSuccess('Cache vidé !');
                }
            });
        }

        // Export des paramètres
        document.getElementById('exportSettings')?.addEventListener('click', () => {
            const settings = {
                basic: {
                    emailsPerPage: this.emailsPerPage,
                    viewMode: this.viewMode,
                    cacheExpiry: this.cacheExpiry,
                    categoryFilter: this.categoryFilter,
                    sortOrder: this.sortOrder
                },
                advanced: JSON.parse(localStorage.getItem('gmailAdvancedSettings') || '{}'),
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `gmail_settings_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showSuccess('Paramètres exportés !');
        });

        // Import des paramètres
        document.getElementById('importSettings')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const settings = JSON.parse(text);
                    
                    // Appliquer les paramètres
                    if (settings.basic) {
                        Object.assign(this, settings.basic);
                        this.saveSettingsToLocal();
                    }
                    
                    if (settings.advanced) {
                        localStorage.setItem('gmailAdvancedSettings', JSON.stringify(settings.advanced));
                    }
                    
                    this.loadSettings();
                    this.showSuccess('Paramètres importés !');
                    
                } catch (error) {
                    this.showError('Erreur lors de l\'import des paramètres');
                }
            });
            
            input.click();
        });
    }

    // Appliquer le thème
    applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'dark') {
            body.classList.add('dark-theme');
        } else if (theme === 'light') {
            body.classList.remove('dark-theme');
        } else {
            // Auto: suivre les préférences système
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.toggle('dark-theme', prefersDark);
        }
    }

    // Afficher la page des statistiques
    renderStatisticsPage(container) {
        const stats = this.calculateStatistics();
        
        container.innerHTML = `
            <div class="statistics-page">
                <h1>📊 Statistiques</h1>
                
                <div class="stats-overview">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <i class="fas fa-envelope fa-2x"></i>
                            <div class="stat-value">${stats.totalEmails}</div>
                            <div class="stat-label">Total emails</div>
                        </div>
                        
                        <div class="stat-card">
                            <i class="fas fa-envelope-open fa-2x"></i>
                            <div class="stat-value">${stats.readEmails}</div>
                            <div class="stat-label">Emails lus</div>
                            <div class="stat-percentage">${stats.readPercentage}%</div>
                        </div>
                        
                        <div class="stat-card">
                            <i class="fas fa-star fa-2x"></i>
                            <div class="stat-value">${stats.starredEmails}</div>
                            <div class="stat-label">Emails favoris</div>
                        </div>
                        
                        <div class="stat-card">
                            <i class="fas fa-paperclip fa-2x"></i>
                            <div class="stat-value">${stats.emailsWithAttachments}</div>
                            <div class="stat-label">Avec pièces jointes</div>
                        </div>
                    </div>
                </div>

                <div class="stats-section">
                    <h2>📈 Répartition par catégorie</h2>
                    <div class="category-chart">
                        ${this.renderCategoryChart(stats.categoryCounts)}
                    </div>
                </div>

                <div class="stats-section">
                    <h2>📅 Activité par jour</h2>
                    <div class="activity-chart">
                        ${this.renderActivityChart(stats.dailyActivity)}
                    </div>
                </div>

                <div class="stats-section">
                    <h2>👥 Top 10 expéditeurs</h2>
                    <div class="top-senders">
                        ${this.renderTopSenders(stats.topSenders)}
                    </div>
                </div>

                <div class="stats-section">
                    <h2>🏷️ Mots-clés fréquents</h2>
                    <div class="word-cloud">
                        ${this.renderWordCloud(stats.topKeywords)}
                    </div>
                </div>
            </div>
        `;
        
        // Animer les compteurs
        this.animateCounters();
    }

    // Calculer les statistiques
    calculateStatistics() {
        const stats = {
            totalEmails: this.emails.length,
            readEmails: this.emails.filter(e => e.isRead).length,
            unreadEmails: this.emails.filter(e => !e.isRead).length,
            starredEmails: this.emails.filter(e => e.isStarred).length,
            emailsWithAttachments: this.emails.filter(e => e.attachments.length > 0).length,
            categoryCounts: {},
            senderCounts: {},
            dailyActivity: {},
            topSenders: [],
            topKeywords: []
        };

        // Pourcentage de lecture
        stats.readPercentage = stats.totalEmails > 0 
            ? Math.round((stats.readEmails / stats.totalEmails) * 100) 
            : 0;

        // Analyser les emails
        const keywords = {};
        
        this.emails.forEach(email => {
            // Compter par catégorie
            stats.categoryCounts[email.category] = (stats.categoryCounts[email.category] || 0) + 1;
            
            // Compter par expéditeur
            stats.senderCounts[email.fromName] = (stats.senderCounts[email.fromName] || 0) + 1;
            
            // Activité par jour
            const dayKey = email.date.toISOString().split('T')[0];
            stats.dailyActivity[dayKey] = (stats.dailyActivity[dayKey] || 0) + 1;
            
            // Extraire les mots-clés du sujet
            const words = email.subject.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 4 && !this.isStopWord(word)) {
                    keywords[word] = (keywords[word] || 0) + 1;
                }
            });
        });

        // Top expéditeurs
        stats.topSenders = Object.entries(stats.senderCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([sender, count]) => ({ sender, count }));

        // Top mots-clés
        stats.topKeywords = Object.entries(keywords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word, count]) => ({ word, count }));

        return stats;
    }

    // Vérifier si un mot est un mot vide
    isStopWord(word) {
        const stopWords = ['pour', 'avec', 'dans', 'plus', 'vous', 'nous', 'votre', 'notre'];
        return stopWords.includes(word);
    }

    // Afficher le graphique des catégories
    renderCategoryChart(categoryCounts) {
        const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
        const categoryLabels = {
            important: '⭐ Important',
            security: '🔒 Sécurité',
            finance: '💰 Finance',
            commercial: '🛍️ Commercial',
            social: '👥 Social',
            meetings: '📅 Réunions',
            marketing_news: '📰 Marketing/Actualités',
            other: '📁 Autres'
        };

        return Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => {
                const percentage = ((count / total) * 100).toFixed(1);
                return `
                    <div class="category-bar-item">
                        <div class="category-info">
                            <span class="category-name">${categoryLabels[category] || category}</span>
                            <span class="category-stats">${count} emails (${percentage}%)</span>
                        </div>
                        <div class="category-bar">
                            <div class="category-bar-fill" style="width: ${percentage}%; background-color: var(--category-${category}-color, #607d8b)"></div>
                        </div>
                    </div>
                `;
            }).join('');
    }

    // Afficher le graphique d'activité
    renderActivityChart(dailyActivity) {
        const days = Object.keys(dailyActivity).sort().slice(-30); // 30 derniers jours
        const maxCount = Math.max(...Object.values(dailyActivity));
        
        return `
            <div class="activity-bars">
                ${days.map(day => {
                    const count = dailyActivity[day] || 0;
                    const height = (count / maxCount) * 100;
                    const date = new Date(day);
                    const label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                    
                    return `
                        <div class="activity-bar" title="${label}: ${count} emails">
                            <div class="activity-bar-fill" style="height: ${height}%"></div>
                            <div class="activity-label">${label}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Afficher les top expéditeurs
    renderTopSenders(topSenders) {
        return topSenders.map((item, index) => `
            <div class="sender-item">
                <span class="sender-rank">#${index + 1}</span>
                <span class="sender-name">${item.sender}</span>
                <div class="sender-bar">
                    <div class="sender-bar-fill" style="width: ${(item.count / topSenders[0].count) * 100}%"></div>
                </div>
                <span class="sender-count">${item.count}</span>
            </div>
        `).join('');
    }

    // Afficher le nuage de mots
    renderWordCloud(keywords) {
        const maxCount = keywords[0]?.count || 1;
        
        return `
            <div class="word-cloud-container">
                ${keywords.map(item => {
                    const size = 0.8 + (item.count / maxCount) * 1.5;
                    const opacity = 0.5 + (item.count / maxCount) * 0.5;
                    
                    return `
                        <span class="word-cloud-item" 
                              style="font-size: ${size}em; opacity: ${opacity}"
                              title="${item.count} occurrences">
                            ${item.word}
                        </span>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Animer les compteurs
    animateCounters() {
        document.querySelectorAll('.stat-value').forEach(element => {
            const target = parseInt(element.textContent);
            let current = 0;
            const increment = target / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.round(current);
            }, 20);
        });
    }

    // Afficher la page de recherche avancée
    renderAdvancedSearchPage(container) {
        container.innerHTML = `
            <div class="advanced-search-page">
                <div class="page-header">
                    <h1>🔍 Recherche avancée</h1>
                    <button class="btn btn-secondary" onclick="window.pageManager.loadPage('emails')">
                        <i class="fas fa-arrow-left"></i> Retour
                    </button>
                </div>
                
                <form id="advancedSearchForm" class="advanced-search-form">
                    <div class="search-section">
                        <h3>Contenu</h3>
                        <div class="form-group">
                            <label>Rechercher dans:</label>
                            <input type="text" name="query" placeholder="Mots-clés...">
                        </div>
                        <div class="form-group">
                            <label>De:</label>
                            <input type="text" name="from" placeholder="Expéditeur...">
                        </div>
                        <div class="form-group">
                            <label>Objet contient:</label>
                            <input type="text" name="subject" placeholder="Mots dans l'objet...">
                        </div>
                    </div>
                    
                    <div class="search-section">
                        <h3>Filtres</h3>
                        <div class="form-group">
                            <label>Catégorie:</label>
                            <select name="category" multiple>
                                <option value="important">⭐ Important</option>
                                <option value="security">🔒 Sécurité</option>
                                <option value="finance">💰 Finance</option>
                                <option value="commercial">🛍️ Commercial</option>
                                <option value="social">👥 Social</option>
                                <option value="meetings">📅 Réunions</option>
                                <option value="marketing_news">📰 Marketing/Actualités</option>
                                <option value="other">📁 Autres</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="hasAttachments"> Avec pièces jointes
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="isUnread"> Non lus uniquement
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="isStarred"> Favoris uniquement
                            </label>
                        </div>
                    </div>
                    
                    <div class="search-section">
                        <h3>Date</h3>
                        <div class="form-group">
                            <label>Du:</label>
                            <input type="date" name="dateFrom">
                        </div>
                        <div class="form-group">
                            <label>Au:</label>
                            <input type="date" name="dateTo">
                        </div>
                    </div>
                    
                    <div class="search-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-search"></i> Rechercher
                        </button>
                        <button type="reset" class="btn btn-secondary">
                            <i class="fas fa-undo"></i> Réinitialiser
                        </button>
                    </div>
                </form>
                
                <div id="searchResults" class="search-results"></div>
            </div>
        `;
        
        this.setupAdvancedSearchInteractions();
    }

    // Configurer les interactions de recherche avancée
    setupAdvancedSearchInteractions() {
        const form = document.getElementById('advancedSearchForm');
        
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const searchCriteria = {
                query: formData.get('query'),
                from: formData.get('from'),
                subject: formData.get('subject'),
                categories: formData.getAll('category'),
                hasAttachments: formData.get('hasAttachments') === 'on',
                isUnread: formData.get('isUnread') === 'on',
                isStarred: formData.get('isStarred') === 'on',
                dateFrom: formData.get('dateFrom'),
                dateTo: formData.get('dateTo')
            };
            
            this.performAdvancedSearch(searchCriteria);
        });
    }

    // Effectuer une recherche avancée
    performAdvancedSearch(criteria) {
        const results = this.emails.filter(email => {
            // Recherche textuelle
            if (criteria.query) {
                const query = criteria.query.toLowerCase();
                const searchableText = `${email.subject} ${email.body} ${email.snippet}`.toLowerCase();
                if (!searchableText.includes(query)) return false;
            }
            
            // Expéditeur
            if (criteria.from) {
                const from = criteria.from.toLowerCase();
                if (!email.from.toLowerCase().includes(from) && 
                    !email.fromName.toLowerCase().includes(from)) return false;
            }
            
            // Objet
            if (criteria.subject) {
                if (!email.subject.toLowerCase().includes(criteria.subject.toLowerCase())) return false;
            }
            
            // Catégories
            if (criteria.categories.length > 0) {
                if (!criteria.categories.includes(email.category)) return false;
            }
            
            // Filtres booléens
            if (criteria.hasAttachments && email.attachments.length === 0) return false;
            if (criteria.isUnread && email.isRead) return false;
            if (criteria.isStarred && !email.isStarred) return false;
            
            // Dates
            if (criteria.dateFrom) {
                const dateFrom = new Date(criteria.dateFrom);
                if (email.date < dateFrom) return false;
            }
            
            if (criteria.dateTo) {
                const dateTo = new Date(criteria.dateTo);
                dateTo.setHours(23, 59, 59);
                if (email.date > dateTo) return false;
            }
            
            return true;
        });
        
        this.displaySearchResults(results);
    }

    // Afficher les résultats de recherche
    displaySearchResults(results) {
        const resultsDiv = document.getElementById('searchResults');
        
        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search fa-3x"></i>
                    <p>Aucun résultat trouvé</p>
                </div>
            `;
            return;
        }
        
        resultsDiv.innerHTML = `
            <h3>${results.length} résultat(s) trouvé(s)</h3>
            <div class="search-results-list">
                ${results.slice(0, 50).map(email => this.renderEmailItem(email)).join('')}
            </div>
            ${results.length > 50 ? '<p class="text-muted">Affichage des 50 premiers résultats</p>' : ''}
        `;
        
        // Réutiliser les interactions des emails
        this.setupEmailItemInteractions();
    }

    // Configurer les interactions sur les items d'email
    setupEmailItemInteractions() {
        // Réutiliser la logique existante pour les clics sur les emails
        document.querySelectorAll('.email-item, .email-card').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.email-checkbox, .fa-star')) {
                    this.openEmail(item.dataset.emailId);
                }
            });
        });
        
        // Gérer les étoiles
        document.querySelectorAll('.fa-star').forEach(star => {
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                const emailId = star.closest('[data-email-id]').dataset.emailId;
                this.toggleStar(emailId);
            });
        });
    }

    // Afficher la page par défaut
    renderDefaultPage(container) {
        container.innerHTML = `
            <div class="default-page">
                <div class="welcome-section">
                    <h1>📧 Gmail Manager Pro</h1>
                    <p class="welcome-message">Bienvenue dans votre gestionnaire d'emails intelligent</p>
                </div>
                
                <div class="quick-stats">
                    <div class="quick-stat-card">
                        <i class="fas fa-envelope"></i>
                        <span>${this.emails.length} emails</span>
                    </div>
                    <div class="quick-stat-card">
                        <i class="fas fa-envelope-open"></i>
                        <span>${this.emails.filter(e => !e.isRead).length} non lus</span>
                    </div>
                    <div class="quick-stat-card">
                        <i class="fas fa-star"></i>
                        <span>${this.emails.filter(e => e.isStarred).length} favoris</span>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <button class="action-card" onclick="window.pageManager.loadPage('emails')">
                        <i class="fas fa-inbox fa-3x"></i>
                        <h3>Boîte de réception</h3>
                        <p>Consultez vos emails</p>
                    </button>
                    <button class="action-card" onclick="window.pageManager.loadPage('compose')">
                        <i class="fas fa-pen fa-3x"></i>
                        <h3>Nouveau message</h3>
                        <p>Rédigez un email</p>
                    </button>
                    <button class="action-card" onclick="window.pageManager.loadPage('statistics')">
                        <i class="fas fa-chart-bar fa-3x"></i>
                        <h3>Statistiques</h3>
                        <p>Analysez vos emails</p>
                    </button>
                    <button class="action-card" onclick="window.pageManager.loadPage('settings')">
                        <i class="fas fa-cog fa-3x"></i>
                        <h3>Paramètres</h3>
                        <p>Personnalisez l'application</p>
                    </button>
                </div>
            </div>
        `;
    }

    // Afficher un message de succès
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    // Afficher un message d'erreur
    showError(message) {
        this.showToast(message, 'error');
    }

    // Afficher un toast
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        }[type] || 'fa-info-circle';
        
        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Appliquer le thème sauvegardé
    const settings = JSON.parse(localStorage.getItem('gmailAdvancedSettings') || '{}');
    if (settings.theme) {
        const pageManager = new PageManagerGmail();
        pageManager.applyTheme(settings.theme);
    }
});

// Exporter la classe
window.PageManagerGmail = PageManagerGmail;
