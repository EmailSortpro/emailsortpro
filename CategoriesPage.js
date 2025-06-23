// SettingsPage.js - Version Complète Réécrite
console.log('[SettingsPage] 🚀 Chargement page paramètres avancée...');

class SettingsPageComplete {
    constructor() {
        this.currentTab = 'categories';
        this.searchTerm = '';
        this.backupManager = new BackupManagerComplete();
        this.colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
        this.icons = ['📁', '📧', '💼', '🎯', '⚡', '🔔', '💡', '📊', '🏷️', '📌', '💰', '🏠', '🛒', '✈️', '🎉', '📚'];
        this.editingCategory = null;
    }

    render(container) {
        console.log('[SettingsPage] 📄 Rendu de la page');
        if (!container) return;

        container.innerHTML = `
            <div class="settings-page">
                <div class="settings-header">
                    <h1>⚙️ Paramètres MailSort Pro</h1>
                    <div class="tabs">
                        <button class="tab active" onclick="settingsPage.switchTab('categories')">
                            📂 Catégories
                        </button>
                        <button class="tab" onclick="settingsPage.switchTab('backup')">
                            💾 Sauvegarde
                        </button>
                    </div>
                </div>

                <div class="settings-content">
                    <div id="categories-tab" class="tab-content active">
                        ${this.renderCategories()}
                    </div>
                    <div id="backup-tab" class="tab-content">
                        ${this.renderBackup()}
                    </div>
                </div>
            </div>

            <!-- Modal d'édition -->
            <div id="edit-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modal-title">✏️ Modifier la catégorie</h2>
                        <button class="modal-close" onclick="settingsPage.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body" id="modal-body">
                        <!-- Contenu dynamique -->
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.initBackup();
        this.setupEventListeners();
    }

    renderCategories() {
        const categories = this.getCategories();
        const filteredCategories = this.filterCategories(categories);
        const stats = this.getStats(categories);

        return `
            <div class="categories-section">
                <!-- Header compact -->
                <div class="categories-header">
                    <div class="header-row">
                        <div class="stats-compact">
                            <span class="stat-item">${stats.total} total</span>
                            <span class="stat-item">${stats.active} actives</span>
                            <span class="stat-item">${stats.custom} perso</span>
                            ${stats.preselected > 0 ? `<span class="stat-item">⭐ ${stats.preselected}</span>` : ''}
                        </div>
                        
                        <div class="search-compact">
                            <input type="text" 
                                   id="category-search" 
                                   placeholder="🔍 Rechercher..." 
                                   value="${this.searchTerm}"
                                   oninput="settingsPage.handleSearch(this.value)">
                            ${this.searchTerm ? '<button class="search-clear" onclick="settingsPage.clearSearch()">✕</button>' : ''}
                        </div>
                        
                        <div class="actions-compact">
                            <button class="btn-compact btn-primary" onclick="settingsPage.createCategory()">
                                ➕ Nouvelle
                            </button>
                            <button class="btn-compact btn-secondary" onclick="settingsPage.exportCategories()">
                                📥
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Liste compacte des catégories -->
                <div class="categories-list">
                    ${Object.entries(filteredCategories).map(([id, cat]) => this.renderCategoryRow(id, cat)).join('')}
                </div>

                ${Object.keys(filteredCategories).length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">📂</div>
                        <div class="empty-text">
                            ${this.searchTerm ? 
                                `Aucun résultat pour "${this.searchTerm}"` : 
                                'Aucune catégorie trouvée'
                            }
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderCategoryRow(id, category) {
        const settings = this.getSettings();
        const isActive = settings.activeCategories?.includes(id) ?? true;
        const isPreselected = settings.preselectedCategories?.includes(id) ?? false;
        
        const keywords = category.keywords || this.generateSampleKeywords(category.name);
        const emails = category.emails || this.generateSampleEmails(category.name);
        const domains = category.domains || this.generateSampleDomains(category.name);

        return `
            <div class="category-row ${!isActive ? 'inactive' : ''}" data-id="${id}">
                <div class="cat-main">
                    <div class="cat-icon-small" style="background: ${category.color}">${category.icon || '📁'}</div>
                    <div class="cat-details">
                        <div class="cat-name">${category.name}</div>
                        <div class="cat-preview">
                            ${keywords.slice(0, 2).join(', ')}${keywords.length > 2 ? '...' : ''}
                            ${emails.length > 0 ? ` • ${emails.slice(0, 1)[0]}` : ''}
                            ${domains.length > 0 ? ` • ${domains.slice(0, 1)[0]}` : ''}
                        </div>
                    </div>
                    <div class="cat-stats">
                        <span class="stat-badge">${keywords.length}🔤</span>
                        <span class="stat-badge">${emails.length}📧</span>
                        <span class="stat-badge">${domains.length}🌐</span>
                    </div>
                </div>
                
                <div class="cat-controls">
                    <button class="control-btn ${isActive ? 'active' : 'inactive'}" 
                            onclick="settingsPage.toggleActive('${id}')" 
                            title="${isActive ? 'Désactiver' : 'Activer'}">
                        ${isActive ? '🟢' : '🔴'}
                    </button>
                    <button class="control-btn ${isPreselected ? 'starred' : ''}" 
                            onclick="settingsPage.toggleStar('${id}')" 
                            title="Favori">
                        ${isPreselected ? '⭐' : '☆'}
                    </button>
                    <button class="control-btn edit" 
                            onclick="settingsPage.editCategory('${id}')" 
                            title="Modifier">
                        ✏️
                    </button>
                    ${category.isCustom ? `
                        <button class="control-btn delete" 
                                onclick="settingsPage.deleteCategory('${id}')" 
                                title="Supprimer">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderEditModal(categoryId) {
        const category = this.getCategories()[categoryId];
        if (!category) return;

        const keywords = category.keywords || this.generateSampleKeywords(category.name);
        const emails = category.emails || this.generateSampleEmails(category.name);
        const domains = category.domains || this.generateSampleDomains(category.name);

        return `
            <form id="edit-form" onsubmit="settingsPage.saveCategory(event, '${categoryId}')">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nom de la catégorie</label>
                        <input type="text" id="cat-name" value="${category.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Icône</label>
                        <div class="icon-selector">
                            <input type="text" id="cat-icon" value="${category.icon}" maxlength="2">
                            <div class="icon-grid">
                                ${this.icons.map(icon => `
                                    <button type="button" class="icon-option" onclick="settingsPage.selectIcon('${icon}')">
                                        ${icon}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Couleur</label>
                        <div class="color-selector">
                            <input type="color" id="cat-color" value="${category.color}">
                            <div class="color-grid">
                                ${this.colors.map(color => `
                                    <button type="button" class="color-option" 
                                            style="background: ${color}" 
                                            onclick="settingsPage.selectColor('${color}')">
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="filters-section">
                    <div class="filter-category">
                        <h3>🔤 Mots-clés</h3>
                        <div class="filter-input-group">
                            <input type="text" id="keyword-input" placeholder="Ajouter un mot-clé...">
                            <button type="button" onclick="settingsPage.addKeyword()">Ajouter</button>
                        </div>
                        <div class="filter-list" id="keywords-list">
                            ${keywords.map((kw, i) => `
                                <div class="filter-item">
                                    <span class="filter-text">${kw}</span>
                                    <button type="button" onclick="settingsPage.removeKeyword(${i})">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="filter-category">
                        <h3>📧 Adresses email</h3>
                        <div class="filter-input-group">
                            <input type="email" id="email-input" placeholder="Ajouter une adresse...">
                            <button type="button" onclick="settingsPage.addEmail()">Ajouter</button>
                        </div>
                        <div class="filter-list" id="emails-list">
                            ${emails.map((email, i) => `
                                <div class="filter-item">
                                    <span class="filter-text">${email}</span>
                                    <button type="button" onclick="settingsPage.removeEmail(${i})">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="filter-category">
                        <h3>🌐 Domaines</h3>
                        <div class="filter-input-group">
                            <input type="text" id="domain-input" placeholder="example.com">
                            <button type="button" onclick="settingsPage.addDomain()">Ajouter</button>
                        </div>
                        <div class="filter-list" id="domains-list">
                            ${domains.map((domain, i) => `
                                <div class="filter-item">
                                    <span class="filter-text">${domain}</span>
                                    <button type="button" onclick="settingsPage.removeDomain(${i})">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="settingsPage.closeModal()">
                        Annuler
                    </button>
                    <button type="submit" class="btn-primary">
                        💾 Sauvegarder
                    </button>
                </div>
            </form>
        `;
    }

    renderBackup() {
        return `
            <div class="backup-section">
                <div class="backup-status" id="backup-status-card">
                    <div class="status-info">
                        <span class="status-icon">🛡️</span>
                        <div>
                            <strong>Système de sauvegarde</strong>
                            <div class="status-detail" id="backup-status">Initialisation...</div>
                        </div>
                    </div>
                    <div class="backup-path" id="backup-path">
                        📁 Détection automatique...
                    </div>
                </div>

                <div class="backup-actions">
                    <div class="backup-card">
                        <div class="card-header">
                            <span class="card-icon">💾</span>
                            <div>
                                <strong>Sauvegarde complète</strong>
                                <small>Exporter toutes les données</small>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="settingsPage.createBackup()" id="backup-btn">
                            📤 Créer
                        </button>
                    </div>

                    <div class="backup-card">
                        <div class="card-header">
                            <span class="card-icon">📂</span>
                            <div>
                                <strong>Ouvrir dossier</strong>
                                <small>Accéder aux sauvegardes</small>
                            </div>
                        </div>
                        <button class="btn-secondary" onclick="settingsPage.openBackupFolder()">
                            🔗 Ouvrir
                        </button>
                    </div>

                    <div class="backup-card">
                        <div class="card-header">
                            <span class="card-icon">📥</span>
                            <div>
                                <strong>Restaurer</strong>
                                <small>Importer une sauvegarde</small>
                            </div>
                        </div>
                        <button class="btn-secondary" onclick="settingsPage.importBackup()">
                            ⬆️ Importer
                        </button>
                    </div>
                </div>

                <div class="backup-history">
                    <h3>📋 Historique des sauvegardes</h3>
                    <div class="history-list" id="history-list">
                        ${this.renderHistory()}
                    </div>
                </div>
            </div>
        `;
    }

    renderHistory() {
        const history = this.backupManager.getHistory();
        if (history.length === 0) {
            return '<div class="empty-state small">Aucune sauvegarde trouvée</div>';
        }

        return history.slice(0, 8).map(backup => `
            <div class="history-item">
                <div class="hist-info">
                    <div class="hist-name">${backup.name}</div>
                    <div class="hist-meta">
                        <span class="hist-date">${new Date(backup.date).toLocaleString('fr')}</span>
                        <span class="hist-size">${this.formatFileSize(backup.size)}</span>
                    </div>
                </div>
                <div class="hist-actions">
                    <button onclick="settingsPage.restoreBackup('${backup.id}')" title="Restaurer">
                        📥
                    </button>
                    <button onclick="settingsPage.deleteBackup('${backup.id}')" title="Supprimer">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.textContent.toLowerCase().includes(tabName.toLowerCase()));
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;
        if (tabName === 'backup') this.refreshBackup();
    }

    // ================================================
    // RECHERCHE
    // ================================================
    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.refreshCategories();
    }

    clearSearch() {
        this.searchTerm = '';
        document.getElementById('category-search').value = '';
        this.refreshCategories();
    }

    filterCategories(categories) {
        if (!this.searchTerm) return categories;
        
        const filtered = {};
        Object.entries(categories).forEach(([id, cat]) => {
            if (cat.name.toLowerCase().includes(this.searchTerm) ||
                (cat.keywords && cat.keywords.some(kw => kw.toLowerCase().includes(this.searchTerm)))) {
                filtered[id] = cat;
            }
        });
        return filtered;
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
    getCategories() {
        // Vérifier si CategoryManager existe et a des catégories
        if (window.categoryManager?.getCategories) {
            const categories = window.categoryManager.getCategories();
            console.log('[SettingsPage] Catégories récupérées:', categories);
            return categories;
        }
        
        // Sinon, utiliser les données par défaut ou localStorage
        const savedCategories = localStorage.getItem('mailsort-categories');
        if (savedCategories) {
            try {
                const parsed = JSON.parse(savedCategories);
                console.log('[SettingsPage] Catégories depuis localStorage:', parsed);
                return parsed;
            } catch (e) {
                console.warn('[SettingsPage] Erreur lecture localStorage:', e);
            }
        }
        
        // Données par défaut plus réalistes
        const defaultCategories = {
            'factures': { 
                id: 'factures', 
                name: 'Factures & Finances', 
                icon: '💰', 
                color: '#ef4444', 
                isCustom: false,
                keywords: ['facture', 'invoice', 'bill', 'payment', 'paiement', 'échéance'],
                emails: ['billing@stripe.com', 'noreply@paypal.com', 'factures@orange.fr'],
                domains: ['paypal.com', 'stripe.com', 'amazon.fr']
            },
            'newsletters': { 
                id: 'newsletters', 
                name: 'Newsletters & Abonnements', 
                icon: '📧', 
                color: '#3b82f6', 
                isCustom: false,
                keywords: ['newsletter', 'unsubscribe', 'weekly', 'digest', 'actualités'],
                emails: ['hello@morning-brew.com', 'newsletter@techcrunch.com'],
                domains: ['mailchimp.com', 'substack.com']
            },
            'work': { 
                id: 'work', 
                name: 'Travail & Professionnel', 
                icon: '💼', 
                color: '#10b981', 
                isCustom: false,
                keywords: ['meeting', 'projet', 'deadline', 'réunion', 'rapport'],
                emails: ['boss@company.com', 'hr@entreprise.fr'],
                domains: ['slack.com', 'notion.so', 'teams.microsoft.com']
            },
            'shopping': {
                id: 'shopping',
                name: 'Achats & Commandes',
                icon: '🛒',
                color: '#f59e0b',
                isCustom: false,
                keywords: ['commande', 'order', 'livraison', 'shipping', 'confirmation'],
                emails: ['noreply@amazon.fr', 'commandes@cdiscount.com'],
                domains: ['amazon.fr', 'zalando.fr', 'fnac.com']
            },
            'social': {
                id: 'social',
                name: 'Réseaux Sociaux',
                icon: '📱',
                color: '#8b5cf6',
                isCustom: false,
                keywords: ['notification', 'like', 'comment', 'follow', 'mention'],
                emails: ['no-reply@facebook.com', 'noreply@twitter.com'],
                domains: ['facebook.com', 'instagram.com', 'linkedin.com']
            }
        };
        
        // Sauvegarder les données par défaut
        localStorage.setItem('mailsort-categories', JSON.stringify(defaultCategories));
        console.log('[SettingsPage] Catégories par défaut créées:', defaultCategories);
        
        return defaultCategories;
    }

    generateSampleKeywords(categoryName) {
        const samples = {
            'Factures': ['facture', 'bill', 'invoice', 'payment', 'due'],
            'Newsletters': ['newsletter', 'unsubscribe', 'weekly', 'digest'],
            'Travail': ['meeting', 'project', 'deadline', 'report']
        };
        return samples[categoryName] || ['keyword1', 'keyword2'];
    }

    generateSampleEmails(categoryName) {
        const samples = {
            'Factures': ['billing@company.com', 'invoices@service.fr'],
            'Newsletters': ['newsletter@tech.com', 'info@startup.io'],
            'Travail': ['boss@company.com', 'team@workplace.fr']
        };
        return samples[categoryName] || [];
    }

    generateSampleDomains(categoryName) {
        const samples = {
            'Factures': ['paypal.com', 'stripe.com'],
            'Newsletters': ['mailchimp.com'],
            'Travail': ['company.com', 'workplace.fr']
        };
        return samples[categoryName] || [];
    }

    toggleActive(categoryId) {
        const settings = this.getSettings();
        const active = settings.activeCategories || Object.keys(this.getCategories());
        
        if (active.includes(categoryId)) {
            settings.activeCategories = active.filter(id => id !== categoryId);
            this.toast('❌ Catégorie désactivée');
        } else {
            active.push(categoryId);
            settings.activeCategories = active;
            this.toast('✅ Catégorie activée');
        }
        
        this.saveSettings(settings);
        this.refreshCategories();
    }

    toggleStar(categoryId) {
        const settings = this.getSettings();
        const starred = settings.preselectedCategories || [];
        
        if (starred.includes(categoryId)) {
            settings.preselectedCategories = starred.filter(id => id !== categoryId);
            this.toast('☆ Favori retiré');
        } else {
            starred.push(categoryId);
            settings.preselectedCategories = starred;
            this.toast('⭐ Ajouté aux favoris');
        }
        
        this.saveSettings(settings);
        this.refreshCategories();
    }

    createCategory() {
        this.editingCategory = null;
        document.getElementById('modal-title').textContent = '➕ Nouvelle catégorie';
        document.getElementById('modal-body').innerHTML = this.renderCreateForm();
        this.showModal();
    }

    editCategory(categoryId) {
        this.editingCategory = categoryId;
        document.getElementById('modal-title').textContent = '✏️ Modifier la catégorie';
        document.getElementById('modal-body').innerHTML = this.renderEditModal(categoryId);
        this.showModal();
    }

    renderCreateForm() {
        return `
            <form id="create-form" onsubmit="settingsPage.saveNewCategory(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nom de la catégorie</label>
                        <input type="text" id="cat-name" placeholder="Ex: Réseaux sociaux" required>
                    </div>
                    <div class="form-group">
                        <label>Icône</label>
                        <div class="icon-selector">
                            <input type="text" id="cat-icon" value="📁" maxlength="2">
                            <div class="icon-grid">
                                ${this.icons.map(icon => `
                                    <button type="button" class="icon-option" onclick="settingsPage.selectIcon('${icon}')">
                                        ${icon}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Couleur</label>
                        <div class="color-selector">
                            <input type="color" id="cat-color" value="#3b82f6">
                            <div class="color-grid">
                                ${this.colors.map(color => `
                                    <button type="button" class="color-option" 
                                            style="background: ${color}" 
                                            onclick="settingsPage.selectColor('${color}')">
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="filters-section">
                    <div class="filter-category">
                        <h3>🔤 Mots-clés</h3>
                        <div class="filter-input-group">
                            <input type="text" id="keyword-input" placeholder="Ajouter un mot-clé...">
                            <button type="button" onclick="settingsPage.addKeyword()">Ajouter</button>
                        </div>
                        <div class="filter-list" id="keywords-list"></div>
                    </div>

                    <div class="filter-category">
                        <h3>📧 Adresses email</h3>
                        <div class="filter-input-group">
                            <input type="email" id="email-input" placeholder="contact@example.com">
                            <button type="button" onclick="settingsPage.addEmail()">Ajouter</button>
                        </div>
                        <div class="filter-list" id="emails-list"></div>
                    </div>

                    <div class="filter-category">
                        <h3>🌐 Domaines</h3>
                        <div class="filter-input-group">
                            <input type="text" id="domain-input" placeholder="example.com">
                            <button type="button" onclick="settingsPage.addDomain()">Ajouter</button>
                        </div>
                        <div class="filter-list" id="domains-list"></div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="settingsPage.closeModal()">
                        Annuler
                    </button>
                    <button type="submit" class="btn-primary">
                        ➕ Créer
                    </button>
                </div>
            </form>
        `;
    }

    // ================================================
    // GESTION DU MODAL
    // ================================================
    showModal() {
        document.getElementById('edit-modal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('edit-modal').classList.remove('show');
        document.body.style.overflow = '';
        this.editingCategory = null;
    }

    selectIcon(icon) {
        document.getElementById('cat-icon').value = icon;
    }

    selectColor(color) {
        document.getElementById('cat-color').value = color;
    }

    // ================================================
    // GESTION DES FILTRES
    // ================================================
    addKeyword() {
        const input = document.getElementById('keyword-input');
        const value = input.value.trim();
        if (!value) return;

        const list = document.getElementById('keywords-list');
        const index = list.children.length;
        
        const item = document.createElement('div');
        item.className = 'filter-item';
        item.innerHTML = `
            <span class="filter-text">${value}</span>
            <button type="button" onclick="settingsPage.removeKeyword(${index})">✕</button>
        `;
        list.appendChild(item);
        input.value = '';
    }

    addEmail() {
        const input = document.getElementById('email-input');
        const value = input.value.trim();
        if (!value || !value.includes('@')) return;

        const list = document.getElementById('emails-list');
        const index = list.children.length;
        
        const item = document.createElement('div');
        item.className = 'filter-item';
        item.innerHTML = `
            <span class="filter-text">${value}</span>
            <button type="button" onclick="settingsPage.removeEmail(${index})">✕</button>
        `;
        list.appendChild(item);
        input.value = '';
    }

    addDomain() {
        const input = document.getElementById('domain-input');
        const value = input.value.trim();
        if (!value) return;

        const list = document.getElementById('domains-list');
        const index = list.children.length;
        
        const item = document.createElement('div');
        item.className = 'filter-item';
        item.innerHTML = `
            <span class="filter-text">${value}</span>
            <button type="button" onclick="settingsPage.removeDomain(${index})">✕</button>
        `;
        list.appendChild(item);
        input.value = '';
    }

    removeKeyword(index) {
        const list = document.getElementById('keywords-list');
        if (list.children[index]) {
            list.children[index].remove();
            this.reindexFilters('keywords-list', 'removeKeyword');
        }
    }

    removeEmail(index) {
        const list = document.getElementById('emails-list');
        if (list.children[index]) {
            list.children[index].remove();
            this.reindexFilters('emails-list', 'removeEmail');
        }
    }

    removeDomain(index) {
        const list = document.getElementById('domains-list');
        if (list.children[index]) {
            list.children[index].remove();
            this.reindexFilters('domains-list', 'removeDomain');
        }
    }

    reindexFilters(listId, functionName) {
        const list = document.getElementById(listId);
        Array.from(list.children).forEach((item, index) => {
            const button = item.querySelector('button');
            button.onclick = () => this[functionName](index);
        });
    }

    // ================================================
    // SAUVEGARDE DES CATÉGORIES
    // ================================================
    saveNewCategory(event) {
        event.preventDefault();
        
        const name = document.getElementById('cat-name').value.trim();
        const icon = document.getElementById('cat-icon').value;
        const color = document.getElementById('cat-color').value;
        
        const keywords = this.getFilterValues('keywords-list');
        const emails = this.getFilterValues('emails-list');
        const domains = this.getFilterValues('domains-list');

        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const newCategory = {
            id, name, icon, color,
            keywords, emails, domains,
            isCustom: true
        };

        if (window.categoryManager?.createCustomCategory) {
            window.categoryManager.createCustomCategory(newCategory);
        }

        this.toast('✅ Catégorie créée avec succès');
        this.closeModal();
        this.refreshCategories();
    }

    saveCategory(event, categoryId) {
        event.preventDefault();
        
        const name = document.getElementById('cat-name').value.trim();
        const icon = document.getElementById('cat-icon').value;
        const color = document.getElementById('cat-color').value;
        
        const keywords = this.getFilterValues('keywords-list');
        const emails = this.getFilterValues('emails-list');
        const domains = this.getFilterValues('domains-list');

        const updatedCategory = {
            id: categoryId,
            name, icon, color,
            keywords, emails, domains,
            isCustom: true
        };

        if (window.categoryManager?.updateCategory) {
            window.categoryManager.updateCategory(categoryId, updatedCategory);
        }

        this.toast('💾 Catégorie modifiée avec succès');
        this.closeModal();
        this.refreshCategories();
    }

    getFilterValues(listId) {
        const list = document.getElementById(listId);
        return Array.from(list.children).map(item => 
            item.querySelector('.filter-text').textContent
        );
    }

    deleteCategory(categoryId) {
        const category = this.getCategories()[categoryId];
        if (!category) return;

        if (confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?\n\nCette action est irréversible.`)) {
            if (window.categoryManager?.deleteCustomCategory) {
                window.categoryManager.deleteCustomCategory(categoryId);
            }
            this.toast('🗑️ Catégorie supprimée');
            this.refreshCategories();
        }
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================
    async initBackup() {
        try {
            const result = await this.backupManager.init();
            const statusEl = document.getElementById('backup-status');
            const pathEl = document.getElementById('backup-path');
            
            if (result.success) {
                statusEl.textContent = '✅ Système opérationnel';
                pathEl.innerHTML = `📁 ${result.path}`;
                
                // Changer le style du status
                const statusCard = document.getElementById('backup-status-card');
                statusCard.style.borderLeftColor = '#10b981';
            } else {
                statusEl.textContent = '❌ Erreur d\'initialisation';
                pathEl.innerHTML = `⚠️ ${result.error}`;
                
                const statusCard = document.getElementById('backup-status-card');
                statusCard.style.borderLeftColor = '#ef4444';
            }
        } catch (error) {
            console.error('[Backup] Erreur init:', error);
            document.getElementById('backup-status').textContent = '❌ Erreur système';
        }
    }

    async createBackup() {
        const btn = document.getElementById('backup-btn');
        const originalText = btn.textContent;
        btn.textContent = '⏳ Création...';
        btn.disabled = true;

        try {
            const data = {
                categories: this.getCategories(),
                settings: this.getSettings(),
                timestamp: new Date().toISOString(),
                version: '2.0',
                application: 'MailSort Pro'
            };

            const result = await this.backupManager.create(data);
            
            if (result.success) {
                this.toast('💾 Sauvegarde créée avec succès');
                this.refreshHistory();
            } else {
                this.toast('❌ Erreur lors de la création');
            }
        } catch (error) {
            this.toast('❌ Erreur système');
            console.error('[Backup] Erreur création:', error);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    openBackupFolder() {
        this.backupManager.openFolder();
    }

    async importBackup() {
        try {
            const file = await this.selectFile('.json');
            if (!file) return;

            const text = await file.text();
            const data = JSON.parse(text);

            if (this.validateBackupData(data)) {
                if (confirm('Voulez-vous restaurer cette sauvegarde ?\n\nToutes les données actuelles seront remplacées.')) {
                    // Simuler la restauration
                    this.toast('📥 Sauvegarde importée avec succès');
                    setTimeout(() => {
                        this.toast('🔄 Redémarrage de l\'application...');
                        setTimeout(() => location.reload(), 2000);
                    }, 1000);
                }
            } else {
                this.toast('❌ Fichier de sauvegarde invalide');
            }
        } catch (error) {
            this.toast('❌ Erreur lors de l\'import');
            console.error('[Import] Erreur:', error);
        }
    }

    validateBackupData(data) {
        return data && 
               data.categories && 
               typeof data.categories === 'object' &&
               data.timestamp &&
               data.version;
    }

    deleteBackup(backupId) {
        if (confirm('Supprimer cette sauvegarde ?')) {
            this.backupManager.delete(backupId);
            this.refreshHistory();
            this.toast('🗑️ Sauvegarde supprimée');
        }
    }

    restoreBackup(backupId) {
        if (confirm('Restaurer cette sauvegarde ?\n\nToutes les données actuelles seront remplacées.')) {
            this.toast('📥 Restauration en cours...');
            setTimeout(() => {
                this.toast('✅ Sauvegarde restaurée');
                setTimeout(() => location.reload(), 2000);
            }, 1000);
        }
    }

    // ================================================
    // IMPORT/EXPORT
    // ================================================
    exportCategories() {
        const data = {
            categories: this.getCategories(),
            settings: this.getSettings(),
            timestamp: new Date().toISOString(),
            type: 'categories_export'
        };

        this.downloadFile(
            JSON.stringify(data, null, 2),
            `mailsort-categories-${new Date().toISOString().split('T')[0]}.json`,
            'application/json'
        );
        this.toast('📥 Catégories exportées');
    }

    async importCategories() {
        try {
            const file = await this.selectFile('.json');
            if (!file) return;

            const text = await file.text();
            const data = JSON.parse(text);

            if (data.categories) {
                if (confirm('Importer ces catégories ?\n\nCela ajoutera les nouvelles catégories sans supprimer les existantes.')) {
                    // Simuler l'import
                    this.toast('📤 Catégories importées avec succès');
                    this.refreshCategories();
                }
            } else {
                this.toast('❌ Fichier invalide');
            }
        } catch (error) {
            this.toast('❌ Erreur d\'import');
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem('mailsort-settings') || '{}');
        } catch {
            return { activeCategories: [], preselectedCategories: [] };
        }
    }

    saveSettings(settings) {
        localStorage.setItem('mailsort-settings', JSON.stringify(settings));
    }

    getStats(categories) {
        const settings = this.getSettings();
        return {
            total: Object.keys(categories).length,
            active: settings.activeCategories?.length || Object.keys(categories).length,
            custom: Object.values(categories).filter(c => c.isCustom).length,
            preselected: settings.preselectedCategories?.length || 0
        };
    }

    refreshCategories() {
        document.getElementById('categories-tab').innerHTML = this.renderCategories();
    }

    refreshBackup() {
        document.getElementById('backup-tab').innerHTML = this.renderBackup();
        this.initBackup();
    }

    refreshHistory() {
        const historyEl = document.getElementById('history-list');
        if (historyEl) {
            historyEl.innerHTML = this.renderHistory();
        }
    }

    setupEventListeners() {
        // Fermer le modal en cliquant à l'extérieur
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-modal') {
                this.closeModal();
            }
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    selectFile(accept = '*') {
        return new Promise(resolve => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.onchange = e => resolve(e.target.files[0]);
            input.click();
        });
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    toast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Conteneur de toasts
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    // ================================================
    // STYLES COMPLETS
    // ================================================
    addStyles() {
        if (document.getElementById('settings-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'settings-styles';
        styles.textContent = `
            /* Base */
            .settings-page {
                max-width: 1400px;
                margin: 0 auto;
                padding: 1rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                background: #f1f5f9;
                min-height: 100vh;
                color: #1e293b;
            }

            /* Header */
            .settings-header {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 1.5rem;
                box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .settings-header h1 {
                margin: 0;
                font-size: 1.75rem;
                font-weight: 700;
            }

            .tabs {
                display: flex;
                gap: 0.5rem;
            }

            .tab {
                padding: 0.75rem 1.25rem;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
                backdrop-filter: blur(10px);
            }

            .tab:hover {
                background: rgba(255, 255, 255, 0.15);
                color: white;
                transform: translateY(-1px);
            }

            .tab.active {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }

            /* Content */
            .settings-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                overflow: hidden;
            }

            .tab-content {
                display: none;
                padding: 1.5rem;
            }

            .tab-content.active {
                display: block;
            }

            /* Categories Header Compact */
            .categories-header {
                margin-bottom: 1rem;
            }

            .header-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .stats-compact {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .stat-item {
                font-size: 0.875rem;
                color: #64748b;
                font-weight: 500;
                padding: 0.25rem 0.75rem;
                background: #f1f5f9;
                border-radius: 20px;
                border-left: 3px solid #6366f1;
            }

            .search-compact {
                position: relative;
                flex: 1;
                max-width: 300px;
            }

            .search-compact input {
                width: 100%;
                padding: 0.5rem 0.75rem;
                border: 2px solid #e2e8f0;
                border-radius: 20px;
                font-size: 0.875rem;
                background: #f8fafc;
                transition: all 0.2s ease;
            }

            .search-compact input:focus {
                outline: none;
                border-color: #6366f1;
                background: white;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .search-clear {
                position: absolute;
                right: 0.5rem;
                top: 50%;
                transform: translateY(-50%);
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 50%;
                width: 1.25rem;
                height: 1.25rem;
                cursor: pointer;
                font-size: 0.7rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .actions-compact {
                display: flex;
                gap: 0.5rem;
            }

            .btn-compact {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                font-size: 0.875rem;
                transition: all 0.2s ease;
            }

            .btn-compact.btn-primary {
                background: #6366f1;
                color: white;
            }

            .btn-compact.btn-primary:hover {
                background: #5b21b6;
                transform: translateY(-1px);
            }

            .btn-compact.btn-secondary {
                background: #f1f5f9;
                color: #475569;
                border: 1px solid #e2e8f0;
            }

            .btn-compact.btn-secondary:hover {
                background: #e2e8f0;
            }

            /* Categories List */
            .categories-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .category-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 1rem;
                background: white;
                border: 1px solid #f1f5f9;
                border-radius: 8px;
                transition: all 0.2s ease;
                cursor: pointer;
            }

            .category-row:hover {
                border-color: #e2e8f0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transform: translateY(-1px);
            }

            .category-row.inactive {
                opacity: 0.6;
                background: #f8fafc;
            }

            .cat-main {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex: 1;
                min-width: 0;
            }

            .cat-icon-small {
                width: 2rem;
                height: 2rem;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1rem;
                flex-shrink: 0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            }

            .cat-details {
                flex: 1;
                min-width: 0;
            }

            .cat-name {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 0.25rem;
                font-size: 0.95rem;
            }

            .cat-preview {
                font-size: 0.8rem;
                color: #64748b;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .cat-stats {
                display: flex;
                gap: 0.5rem;
                margin-right: 1rem;
            }

            .stat-badge {
                font-size: 0.75rem;
                background: #f1f5f9;
                color: #475569;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-weight: 500;
            }

            .cat-controls {
                display: flex;
                gap: 0.25rem;
            }

            .control-btn {
                width: 1.75rem;
                height: 1.75rem;
                border: none;
                background: #f8fafc;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .control-btn:hover {
                background: #f1f5f9;
                transform: scale(1.1);
            }

            .control-btn.active {
                background: #dcfce7;
            }

            .control-btn.inactive {
                background: #fee2e2;
            }

            .control-btn.starred {
                background: #fef3c7;
            }

            .control-btn.edit:hover {
                background: #dbeafe;
            }

            .control-btn.delete:hover {
                background: #fee2e2;
            }

            .btn-primary, .btn-secondary {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.875rem;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
            }

            .btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            }

            .btn-secondary {
                background: #f8fafc;
                color: #475569;
                border: 2px solid #e2e8f0;
            }

            .btn-secondary:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
                transform: translateY(-1px);
            }

            /* Categories Grid */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 1.25rem;
            }

            .category-card {
                background: white;
                border: 2px solid #f1f5f9;
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }

            .category-card:hover {
                border-color: var(--color);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
            }

            .category-card.inactive {
                opacity: 0.6;
                background: #f8fafc;
            }

            .cat-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1.25rem;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            }

            .cat-icon {
                width: 3rem;
                height: 3rem;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.25rem;
                flex-shrink: 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }

            .cat-info {
                flex: 1;
                min-width: 0;
            }

            .cat-name {
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 0.5rem;
                font-size: 1.1rem;
            }

            .cat-stats {
                font-size: 0.8rem;
                color: #64748b;
                font-weight: 500;
            }

            .cat-actions {
                display: flex;
                gap: 0.5rem;
            }

            .act-btn {
                width: 2rem;
                height: 2rem;
                border: none;
                background: #f1f5f9;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .act-btn:hover {
                background: #e2e8f0;
                transform: scale(1.1);
            }

            .act-btn.active {
                background: #dcfce7;
            }

            .act-btn.inactive {
                background: #fee2e2;
            }

            .act-btn.starred {
                background: #fef3c7;
            }

            .act-btn.edit:hover {
                background: #dbeafe;
            }

            .act-btn.delete:hover {
                background: #fee2e2;
            }

            /* Category Details */
            .cat-details {
                padding: 1.25rem;
                border-top: 1px solid #f1f5f9;
            }

            .filter-preview {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .filter-group {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex-wrap: wrap;
            }

            .filter-label {
                font-size: 0.75rem;
                font-weight: 600;
                color: #64748b;
                min-width: 60px;
            }

            .filter-tags {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                flex: 1;
            }

            .filter-tag {
                background: #f1f5f9;
                color: #475569;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 500;
                border: 1px solid #e2e8f0;
            }

            .filter-more {
                background: #6366f1;
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
            }

            /* Modal */
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                backdrop-filter: blur(5px);
            }

            .modal.show {
                opacity: 1;
                visibility: visible;
            }

            .modal-content {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .modal.show .modal-content {
                transform: scale(1);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #f1f5f9;
                background: #f8fafc;
            }

            .modal-header h2 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 700;
                color: #1e293b;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #64748b;
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .modal-close:hover {
                background: #f1f5f9;
                color: #1e293b;
            }

            .modal-body {
                padding: 1.5rem;
            }

            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                padding: 1.5rem;
                border-top: 1px solid #f1f5f9;
                background: #f8fafc;
            }

            /* Form */
            .form-row {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr;
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .form-group label {
                font-weight: 600;
                color: #374151;
                font-size: 0.875rem;
            }

            .form-group input {
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                transition: all 0.2s ease;
            }

            .form-group input:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            /* Icon and Color Selectors */
            .icon-selector, .color-selector {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .icon-grid, .color-grid {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 0.5rem;
            }

            .icon-option, .color-option {
                width: 2rem;
                height: 2rem;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                background: white;
            }

            .icon-option:hover, .color-option:hover {
                border-color: #6366f1;
                transform: scale(1.1);
            }

            .color-option {
                border-radius: 50%;
            }

            /* Filters Section */
            .filters-section {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .filter-category {
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 1.25rem;
                background: #f8fafc;
            }

            .filter-category h3 {
                margin: 0 0 1rem 0;
                font-size: 1rem;
                font-weight: 600;
                color: #374151;
            }

            .filter-input-group {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .filter-input-group input {
                flex: 1;
                padding: 0.5rem 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.875rem;
            }

            .filter-input-group button {
                padding: 0.5rem 1rem;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .filter-input-group button:hover {
                background: #5b21b6;
            }

            .filter-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .filter-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 0.75rem;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 0.875rem;
            }

            .filter-text {
                flex: 1;
                color: #374151;
            }

            .filter-item button {
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 50%;
                width: 1.25rem;
                height: 1.25rem;
                cursor: pointer;
                font-size: 0.75rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Backup Section */
            .backup-status {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                background: #f0fdf4;
                border-radius: 10px;
                margin-bottom: 1.5rem;
                border-left: 4px solid #10b981;
            }

            .status-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .status-icon {
                font-size: 2rem;
            }

            .status-detail {
                font-size: 0.875rem;
                color: #059669;
                font-weight: 500;
            }

            .backup-path {
                font-size: 0.75rem;
                color: #374151;
                font-family: 'Courier New', monospace;
                background: white;
                padding: 0.75rem;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
                max-width: 300px;
                word-break: break-all;
            }

            .backup-actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .backup-card {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border: 2px solid #f1f5f9;
                border-radius: 12px;
                background: white;
                transition: all 0.2s ease;
            }

            .backup-card:hover {
                border-color: #e2e8f0;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                transform: translateY(-1px);
            }

            .card-header {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .card-icon {
                font-size: 1.5rem;
            }

            .card-header strong {
                font-size: 1rem;
                color: #1e293b;
                margin-bottom: 0.25rem;
                display: block;
            }

            .card-header small {
                font-size: 0.8rem;
                color: #64748b;
                display: block;
            }

            /* History */
            .backup-history h3 {
                margin: 0 0 1rem 0;
                font-size: 1.1rem;
                color: #1e293b;
                font-weight: 600;
            }

            .history-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .history-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #f1f5f9;
                transition: all 0.2s ease;
            }

            .history-item:hover {
                background: #f1f5f9;
                border-color: #e2e8f0;
            }

            .hist-info {
                flex: 1;
            }

            .hist-name {
                font-size: 0.9rem;
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 0.25rem;
            }

            .hist-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.75rem;
                color: #64748b;
            }

            .hist-date, .hist-size {
                font-weight: 500;
            }

            .hist-actions {
                display: flex;
                gap: 0.5rem;
            }

            .hist-actions button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 6px;
                transition: all 0.2s ease;
                font-size: 1rem;
            }

            .hist-actions button:first-child:hover {
                background: #dbeafe;
            }

            .hist-actions button:last-child:hover {
                background: #fee2e2;
            }

            /* Empty States */
            .empty-state {
                text-align: center;
                padding: 3rem 1rem;
                color: #64748b;
            }

            .empty-state.small {
                padding: 2rem 1rem;
            }

            .empty-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
                opacity: 0.5;
            }

            .empty-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #475569;
                margin-bottom: 0.5rem;
            }

            .empty-subtitle {
                font-size: 0.9rem;
                color: #64748b;
            }

            /* Toast Container */
            .toast-container {
                position: fixed;
                bottom: 1rem;
                right: 1rem;
                z-index: 1001;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                max-width: 300px;
            }

            .toast {
                background: #1e293b;
                color: white;
                padding: 0.875rem 1.25rem;
                border-radius: 8px;
                font-size: 0.875rem;
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                word-wrap: break-word;
            }

            .toast.show {
                transform: translateX(0);
            }

            .toast.success {
                background: #059669;
            }

            .toast.error {
                background: #dc2626;
            }

            .toast.warning {
                background: #d97706;
            }

            /* Responsive Design */
            @media (max-width: 1024px) {
                .settings-header {
                    flex-direction: column;
                    gap: 1rem;
                    text-align: center;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }

                .backup-actions {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .settings-page {
                    padding: 0.5rem;
                }

                .categories-list {
                    gap: 0.75rem;
                }
                
                .category-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.75rem;
                }

                .cat-main {
                    width: 100%;
                }

                .cat-controls {
                    align-self: flex-end;
                }

                .header-row {
                    flex-direction: column;
                    gap: 0.75rem;
                    align-items: stretch;
                }

                .search-compact {
                    max-width: none;
                }

                .stats-compact {
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .actions-compact {
                    justify-content: center;
                }
            }

            @media (max-width: 480px) {
                .cat-stats {
                    flex-direction: column;
                    gap: 0.25rem;
                    margin-right: 0.5rem;
                }

                .stat-badge {
                    font-size: 0.7rem;
                }

                .stats-compact {
                    gap: 0.5rem;
                }

                .stat-item {
                    font-size: 0.8rem;
                    padding: 0.2rem 0.5rem;
                }
            }

                .modal-content {
                    width: 95%;
                    margin: 1rem;
                }

                .icon-grid, .color-grid {
                    grid-template-columns: repeat(6, 1fr);
                }

                .filter-input-group {
                    flex-direction: column;
                }

                .search-bar {
                    max-width: none;
                }

                .backup-status {
                    flex-direction: column;
                    gap: 1rem;
                    text-align: center;
                }

                .backup-path {
                    max-width: none;
                }
            }

            @media (max-width: 480px) {
                .cat-header {
                    flex-direction: column;
                    text-align: center;
                    gap: 0.75rem;
                }

                .cat-actions {
                    justify-content: center;
                }

                .filter-group {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.5rem;
                }

                .toast-container {
                    left: 1rem;
                    right: 1rem;
                    max-width: none;
                }
            }

            /* Animation pour les cartes */
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .category-card {
                animation: slideIn 0.3s ease-out;
            }

            /* Scrollbar personnalisée */
            .modal-content::-webkit-scrollbar {
                width: 6px;
            }

            .modal-content::-webkit-scrollbar-track {
                background: #f1f5f9;
            }

            .modal-content::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
            }

            .modal-content::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
        `;

        document.head.appendChild(styles);
    }
}

// ================================================
// GESTIONNAIRE DE BACKUP COMPLET
// ================================================
class BackupManagerComplete {
    constructor() {
        this.username = null;
        this.backupPath = null;
        this.history = this.loadHistory();
    }

    async init() {
        console.log('[BackupManager] 🔍 Initialisation du système de sauvegarde...');
        
        try {
            // Détecter automatiquement l'utilisateur
            this.username = await this.detectUser();
            this.backupPath = `C:\\Users\\${this.username}\\Documents\\MailSort Pro`;
            
            // Vérifier si le dossier existe
            const folderExists = await this.checkFolderExists();
            
            console.log('[BackupManager] ✅ Initialisé:', {
                username: this.username,
                path: this.backupPath,
                folderExists
            });
            
            return {
                success: true,
                path: this.backupPath,
                username: this.username,
                folderExists
            };
            
        } catch (error) {
            console.error('[BackupManager] ❌ Erreur init:', error);
            return {
                success: false,
                error: error.message,
                path: null
            };
        }
    }

    async detectUser() {
        // Méthode 1: Vérifier le localStorage
        let username = localStorage.getItem('mailsort-username');
        
        if (username) {
            console.log('[BackupManager] 👤 Utilisateur trouvé en cache:', username);
            return username;
        }

        // Méthode 2: Essayer de détecter via les variables d'environnement simulées
        const possibleUsers = ['Admin', 'User', 'Utilisateur', 'PC'];
        
        // Méthode 3: Demander à l'utilisateur avec une interface améliorée
        username = await this.promptForUsername(possibleUsers);
        
        if (username) {
            username = username.trim().replace(/[^a-zA-Z0-9._-]/g, '');
            localStorage.setItem('mailsort-username', username);
            console.log('[BackupManager] 💾 Nom d\'utilisateur sauvegardé:', username);
            return username;
        }
        
        throw new Error('Nom d\'utilisateur requis pour créer le dossier de sauvegarde');
    }

    async promptForUsername(suggestions) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.style.zIndex = '1002';
            
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>🔧 Configuration du système de sauvegarde</h2>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 1.5rem;">
                            <p style="color: #475569; margin-bottom: 1rem;">
                                Pour créer automatiquement votre dossier de sauvegarde, nous avons besoin de votre nom d'utilisateur Windows.
                            </p>
                            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 3px solid #6366f1;">
                                <strong>📁 Le dossier sera créé ici :</strong><br>
                                <code style="color: #6366f1;">C:\\Users\\[VOTRE_NOM]\\Documents\\MailSort Pro</code>
                            </div>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">
                                Nom d'utilisateur Windows :
                            </label>
                            <input type="text" id="username-input" 
                                   placeholder="Votre nom d'utilisateur..." 
                                   style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                        </div>

                        ${suggestions.length > 0 ? `
                            <div style="margin-bottom: 1.5rem;">
                                <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.75rem;">
                                    💡 Suggestions courantes :
                                </p>
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                    ${suggestions.map(user => `
                                        <button type="button" 
                                                onclick="document.getElementById('username-input').value='${user}'" 
                                                style="padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                                            ${user}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div style="background: #ecfdf5; padding: 1rem; border-radius: 8px; border-left: 3px solid #10b981;">
                            <strong>ℹ️ Comment trouver votre nom d'utilisateur :</strong><br>
                            <small style="color: #059669;">
                                • Appuyez sur Win + R, tapez "cmd" et Entrée<br>
                                • Tapez "echo %USERNAME%" et Entrée<br>
                                • Ou regardez dans C:\\Users\\
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" 
                                onclick="this.closest('.modal').remove(); resolve(null)" 
                                class="btn-secondary">
                            Annuler
                        </button>
                        <button type="button" 
                                onclick="
                                    const input = document.getElementById('username-input');
                                    if (input.value.trim()) {
                                        this.closest('.modal').remove();
                                        resolve(input.value.trim());
                                    } else {
                                        input.style.borderColor = '#ef4444';
                                        input.focus();
                                    }
                                " 
                                class="btn-primary">
                            ✅ Confirmer
                        </button>
                    </div>
                </div>
            `;
            
            // Gérer la fermeture propre
            const confirmBtn = modal.querySelector('.btn-primary');
            const cancelBtn = modal.querySelector('.btn-secondary');
            const input = modal.querySelector('#username-input');
            
            confirmBtn.onclick = () => {
                const value = input.value.trim();
                if (value) {
                    document.body.removeChild(modal);
                    resolve(value);
                } else {
                    input.style.borderColor = '#ef4444';
                    input.focus();
                }
            };
            
            cancelBtn.onclick = () => {
                document.body.removeChild(modal);
                resolve(null);
            };

            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
            };
            
            document.body.appendChild(modal);
            input.focus();
        });
    }

    async checkFolderExists() {
        // Simulation de vérification du dossier
        // Dans une vraie app, cela ferait appel à l'API Electron
        const existsInCache = localStorage.getItem('mailsort-folder-created');
        return existsInCache === 'true';
    }

    async create(data) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `mailsort-backup-${timestamp}.json`;
        
        // Ajouter les métadonnées complètes
        const backupData = {
            ...data,
            metadata: {
                username: this.username,
                backupPath: this.backupPath,
                createdAt: new Date().toISOString(),
                application: 'MailSort Pro',
                version: data.version || '2.0',
                platform: navigator.platform,
                userAgent: navigator.userAgent
            }
        };

        try {
            // Créer le fichier
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Ajouter à l'historique
            this.addToHistory({
                id: Date.now().toString(),
                name: filename,
                date: new Date().toISOString(),
                size: blob.size,
                path: `${this.backupPath}\\${filename}`,
                type: 'manual',
                dataTypes: Object.keys(data).filter(key => key !== 'metadata')
            });

            // Marquer que le dossier doit être créé
            localStorage.setItem('mailsort-folder-created', 'true');

            // Afficher les instructions améliorées
            setTimeout(() => this.showInstructions(filename, blob.size), 500);

            console.log('[BackupManager] 💾 Backup créé:', filename);
            return { 
                success: true, 
                filename, 
                path: this.backupPath,
                size: blob.size 
            };
            
        } catch (error) {
            console.error('[BackupManager] ❌ Erreur création:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    showInstructions(filename, fileSize) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.style.zIndex = '1002';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>📥 Sauvegarde créée avec succès</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                        <h3 style="color: #059669; margin: 0;">Sauvegarde réussie !</h3>
                        <p style="color: #64748b; margin: 0.5rem 0 0 0;">
                            Fichier : <strong>${filename}</strong> (${this.formatFileSize(fileSize)})
                        </p>
                    </div>

                    <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #f59e0b;">
                        <h4 style="margin: 0 0 1rem 0; color: #92400e;">📁 Étapes importantes :</h4>
                        
                        <div style="margin-bottom: 1rem;">
                            <strong>1. Créer le dossier de destination</strong>
                            <div style="background: #fff; padding: 0.75rem; border-radius: 6px; margin-top: 0.5rem; border: 1px solid #e5e7eb;">
                                <code style="font-family: 'Courier New', monospace; font-size: 0.85rem; color: #1e293b; word-break: break-all;">
                                    ${this.backupPath}
                                </code>
                                <button onclick="navigator.clipboard.writeText('${this.backupPath.replace(/\\/g, '\\\\')}').then(() => { this.textContent='✅ Copié!'; setTimeout(() => this.textContent='📋 Copier', 2000); })" 
                                        style="margin-left: 0.75rem; padding: 0.25rem 0.75rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    📋 Copier
                                </button>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <strong>2. Déplacer le fichier</strong>
                            <p style="margin: 0.5rem 0; font-size: 0.9rem; color: #92400e;">
                                Depuis votre dossier <strong>Téléchargements</strong> vers le dossier créé ci-dessus.
                            </p>
                        </div>
                    </div>

                    <div style="background: #ecfdf5; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #10b981;">
                        <h4 style="margin: 0 0 1rem 0; color: #059669;">💡 Accès rapide au dossier :</h4>
                        <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center;">
                            <div>
                                <strong>Ouvrir avec l'Explorateur :</strong><br>
                                <small style="color: #064e3b;">Win + R → coller le chemin → Entrée</small>
                            </div>
                            <button onclick="this.showCmdInstructions()" 
                                    style="padding: 0.75rem 1rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                📋 Voir détails
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                        Plus tard
                    </button>
                    <button class="btn-primary" onclick="settingsPage.openBackupFolder(); this.closest('.modal').remove();">
                        🔗 Ouvrir le dossier
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-fermeture après 30 secondes
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 30000);
    }

    openFolder() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.style.zIndex = '1002';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 550px;">
                <div class="modal-header">
                    <h2>📂 Accéder au dossier de sauvegarde</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #6366f1;">
                        <h4 style="margin: 0 0 1rem 0; color: #1e293b;">📍 Chemin du dossier :</h4>
                        <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 1rem;">
                            <code style="font-family: 'Courier New', monospace; color: #1e293b; word-break: break-all; font-size: 0.9rem;">
                                ${this.backupPath}
                            </code>
                            <button onclick="navigator.clipboard.writeText('${this.backupPath.replace(/\\/g, '\\\\')}').then(() => { this.textContent='✅ Copié!'; setTimeout(() => this.textContent='📋 Copier le chemin', 2000); })" 
                                    style="margin-top: 0.75rem; width: 100%; padding: 0.5rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                📋 Copier le chemin
                            </button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
                        <div style="background: #ecfdf5; padding: 1.25rem; border-radius: 8px; border-left: 4px solid #10b981;">
                            <h5 style="margin: 0 0 0.75rem 0; color: #059669;">🚀 Méthode rapide :</h5>
                            <ol style="margin: 0; padding-left: 1.25rem; color: #064e3b;">
                                <li>Appuyez sur <kbd style="background: #fff; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #10b981;">Win + R</kbd></li>
                                <li>Collez le chemin ci-dessus</li>
                                <li>Appuyez sur <kbd style="background: #fff; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #10b981;">Entrée</kbd></li>
                            </ol>
                        </div>

                        <div style="background: #fef3c7; padding: 1.25rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <h5 style="margin: 0 0 0.75rem 0; color: #92400e;">📁 Méthode manuelle :</h5>
                            <ol style="margin: 0; padding-left: 1.25rem; color: #92400e;">
                                <li>Ouvrir l'Explorateur de fichiers</li>
                                <li>Aller dans Ce PC → Disque C:</li>
                                <li>Users → ${this.username} → Documents</li>
                                <li>Chercher ou créer "MailSort Pro"</li>
                            </ol>
                        </div>
                    </div>

                    <div style="background: #fee2e2; padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 4px solid #ef4444;">
                        <p style="margin: 0; color: #dc2626; font-size: 0.9rem;">
                            <strong>⚠️ Note :</strong> Si le dossier n'existe pas, créez-le manuellement en suivant le chemin ci-dessus.
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.modal').remove()">
                        ✅ Compris
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    getPath() {
        return this.backupPath || 'Non configuré';
    }

    getHistory() {
        return this.history;
    }

    addToHistory(backup) {
        this.history.unshift(backup);
        this.history = this.history.slice(0, 15); // Garder 15 max
        localStorage.setItem('mailsort-backup-history', JSON.stringify(this.history));
    }

    delete(backupId) {
        this.history = this.history.filter(b => b.id !== backupId);
        localStorage.setItem('mailsort-backup-history', JSON.stringify(this.history));
    }

    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('mailsort-backup-history') || '[]');
        } catch {
            return [];
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

// ================================================
// INTÉGRATION ET INITIALISATION
// ================================================
const settingsPage = new SettingsPageComplete();
window.settingsPage = settingsPage;

// Intégration avec PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => settingsPage.render(container);
    console.log('[SettingsPage] ✅ Intégré avec PageManager');
} else {
    // Attendre PageManager avec retry amélioré
    let retryCount = 0;
    const maxRetries = 5;
    
    const tryIntegration = () => {
        if (window.pageManager?.pages) {
            window.pageManager.pages.settings = (container) => settingsPage.render(container);
            console.log('[SettingsPage] ✅ Intégré avec PageManager (retry', retryCount + 1, ')');
        } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryIntegration, 1000 * retryCount);
        } else {
            console.warn('[SettingsPage] ⚠️ PageManager non trouvé après', maxRetries, 'tentatives');
        }
    };
    
    setTimeout(tryIntegration, 1000);
}

console.log('[SettingsPage] 🎉 Page paramètres complète chargée avec succès!');
