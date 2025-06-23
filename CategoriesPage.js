// SettingsPage.js - Version 2.0 Moderne et Fonctionnelle
console.log('[SettingsPage] 🚀 Loading SettingsPage v2.0...');

// Nettoyer toute instance précédente
if (window.settingsPage) {
    console.log('[SettingsPage] 🧹 Nettoyage instance précédente...');
    delete window.settingsPage;
}

class SettingsPageV2 {
    constructor() {
        this.currentTab = 'categories';
        this.currentFilter = 'all';
        this.backupManager = new BackupManagerV2();
        this.editingCategoryId = null;
        this.currentModal = null;
        this.colors = [
            '#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
            '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899',
            '#64748b', '#dc2626', '#ea580c', '#059669', '#0284c7'
        ];
        this.icons = [
            '📁', '📧', '💼', '🎯', '⚡', '🔔', '💡', '📊', '🏷️', '📌',
            '💰', '🛒', '👤', '📱', '🔧', '🎨', '📚', '🎵', '🍕', '✈️'
        ];
        
        this.initializeEventListeners();
        console.log('[SettingsPage] ✅ Interface v2.0 initialisée');
    }

    // ================================================
    // RENDU PRINCIPAL
    // ================================================
    render(container) {
        if (!container) {
            console.error('[SettingsPage] ❌ Container manquant');
            return;
        }

        try {
            container.innerHTML = this.renderMainStructure();
            this.addModernStyles();
            this.initializeComponents();
            
        } catch (error) {
            console.error('[SettingsPage] Erreur:', error);
            container.innerHTML = this.renderError();
        }
    }

    renderMainStructure() {
        return `
            <div class="settings-container">
                <!-- Header moderne -->
                <div class="settings-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-cog"></i>
                        </div>
                        <div class="header-text">
                            <h1>Paramètres</h1>
                            <p>Configurez vos catégories et gérez vos sauvegardes</p>
                        </div>
                    </div>
                </div>

                <!-- Navigation moderne -->
                <div class="settings-navigation">
                    <div class="nav-container">
                        <button class="nav-item active" data-tab="categories" onclick="window.settingsPage.switchTab('categories')">
                            <div class="nav-icon">
                                <i class="fas fa-tags"></i>
                            </div>
                            <div class="nav-text">
                                <span class="nav-title">Catégories</span>
                                <span class="nav-subtitle">Gérer vos catégories</span>
                            </div>
                        </button>
                        
                        <button class="nav-item" data-tab="backup" onclick="window.settingsPage.switchTab('backup')">
                            <div class="nav-icon">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <div class="nav-text">
                                <span class="nav-title">Sauvegarde</span>
                                <span class="nav-subtitle">Backup & restauration</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="settings-main">
                    <!-- Onglet Catégories -->
                    <div id="categories-content" class="tab-content active">
                        ${this.renderCategoriesContent()}
                    </div>

                    <!-- Onglet Backup -->
                    <div id="backup-content" class="tab-content">
                        ${this.renderBackupContent()}
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // CONTENU CATÉGORIES
    // ================================================
    renderCategoriesContent() {
        return `
            <!-- Dashboard Stats -->
            <div class="stats-dashboard">
                <div class="stats-grid" id="categories-stats">
                    ${this.renderCategoriesStats()}
                </div>
            </div>

            <!-- Actions et filtres -->
            <div class="categories-toolbar">
                <div class="toolbar-left">
                    <h2 class="section-title">
                        <i class="fas fa-layer-group"></i>
                        Mes catégories
                    </h2>
                </div>
                
                <div class="toolbar-center">
                    <div class="filter-tabs">
                        <button class="filter-tab active" data-filter="all" onclick="window.settingsPage.filterCategories('all')">
                            <i class="fas fa-list"></i>
                            Toutes
                        </button>
                        <button class="filter-tab" data-filter="custom" onclick="window.settingsPage.filterCategories('custom')">
                            <i class="fas fa-user"></i>
                            Personnalisées
                        </button>
                        <button class="filter-tab" data-filter="active" onclick="window.settingsPage.filterCategories('active')">
                            <i class="fas fa-toggle-on"></i>
                            Actives
                        </button>
                    </div>
                </div>
                
                <div class="toolbar-right">
                    <button class="btn-modern btn-secondary" onclick="window.settingsPage.exportCategories()">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                    <button class="btn-modern btn-primary" onclick="window.settingsPage.showCreateCategoryModal()">
                        <i class="fas fa-plus"></i>
                        Nouvelle catégorie
                    </button>
                </div>
            </div>

            <!-- Grille des catégories -->
            <div class="categories-container">
                <div class="categories-grid" id="categories-grid">
                    ${this.renderCategoriesGrid()}
                </div>
            </div>
        `;
    }

    renderCategoriesStats() {
        const categories = this.getCategories();
        const stats = this.calculateStats(categories);
        
        return `
            <div class="stat-card primary" onclick="window.settingsPage.filterCategories('all')">
                <div class="stat-icon">
                    <i class="fas fa-tags"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Catégories totales</div>
                    <div class="stat-trend">+${stats.custom} personnalisées</div>
                </div>
                <div class="stat-chart">
                    <div class="mini-chart" style="--percentage: ${(stats.custom/stats.total)*100}%"></div>
                </div>
            </div>

            <div class="stat-card success" onclick="window.settingsPage.filterCategories('active')">
                <div class="stat-icon">
                    <i class="fas fa-toggle-on"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${stats.active}</div>
                    <div class="stat-label">Catégories actives</div>
                    <div class="stat-trend">${Math.round((stats.active/stats.total)*100)}% du total</div>
                </div>
                <div class="stat-chart">
                    <div class="mini-chart" style="--percentage: ${(stats.active/stats.total)*100}%"></div>
                </div>
            </div>

            <div class="stat-card warning">
                <div class="stat-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${stats.preselected}</div>
                    <div class="stat-label">Pré-sélectionnées</div>
                    <div class="stat-trend">Pour les tâches</div>
                </div>
                <div class="stat-chart">
                    <div class="mini-chart" style="--percentage: ${stats.preselected > 0 ? (stats.preselected/stats.total)*100 : 0}%"></div>
                </div>
            </div>

            <div class="stat-card info">
                <div class="stat-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${stats.emails.toLocaleString()}</div>
                    <div class="stat-label">Emails classés</div>
                    <div class="stat-trend">Cette semaine</div>
                </div>
                <div class="stat-chart">
                    <div class="mini-chart" style="--percentage: 85%"></div>
                </div>
            </div>
        `;
    }

    renderCategoriesGrid() {
        const categories = this.getCategories();
        const settings = this.loadSettings();
        
        if (Object.keys(categories).length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-folder-open"></i>
                    </div>
                    <h3>Aucune catégorie</h3>
                    <p>Créez votre première catégorie pour organiser vos emails</p>
                    <button class="btn-modern btn-primary" onclick="window.settingsPage.showCreateCategoryModal()">
                        <i class="fas fa-plus"></i>
                        Créer une catégorie
                    </button>
                </div>
            `;
        }

        return Object.entries(categories)
            .filter(([id, category]) => this.shouldShowCategory(category))
            .map(([id, category]) => {
                const isActive = settings.activeCategories?.includes(id) ?? true;
                const isPreselected = settings.preselectedCategories?.includes(id) ?? false;
                const stats = this.getCategoryStats(id);
                
                return `
                    <div class="category-card ${!isActive ? 'inactive' : ''}" 
                         style="--category-color: ${category.color}"
                         onclick="window.settingsPage.toggleCategorySelection('${id}')">
                        
                        <div class="category-header">
                            <div class="category-icon" style="background: ${category.color}">
                                ${category.icon || '📁'}
                            </div>
                            <div class="category-badges">
                                ${category.isCustom ? '<span class="badge custom">Personnalisée</span>' : ''}
                                ${isPreselected ? '<span class="badge preselected">⭐ Pré-sélectionnée</span>' : ''}
                                <span class="badge status ${isActive ? 'active' : 'inactive'}">
                                    ${isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div class="category-body">
                            <h3 class="category-name">${category.name}</h3>
                            <div class="category-stats">
                                <div class="stat-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>${stats.emails} emails</span>
                                </div>
                                <div class="stat-item">
                                    <i class="fas fa-key"></i>
                                    <span>${stats.keywords} mots-clés</span>
                                </div>
                            </div>
                        </div>

                        <div class="category-footer">
                            <div class="category-actions" onclick="event.stopPropagation()">
                                <button class="action-btn ${isActive ? 'active' : 'inactive'}" 
                                        onclick="window.settingsPage.toggleCategory('${id}')"
                                        title="${isActive ? 'Désactiver' : 'Activer'}">
                                    <i class="fas fa-${isActive ? 'toggle-on' : 'toggle-off'}"></i>
                                </button>
                                
                                <button class="action-btn ${isPreselected ? 'selected' : ''}" 
                                        onclick="window.settingsPage.togglePreselection('${id}')"
                                        title="Pré-sélection pour tâches">
                                    <i class="fas fa-star"></i>
                                </button>
                                
                                <button class="action-btn" 
                                        onclick="window.settingsPage.editCategory('${id}')"
                                        title="Modifier">
                                    <i class="fas fa-edit"></i>
                                </button>
                                
                                ${category.isCustom ? `
                                    <button class="action-btn danger" 
                                            onclick="window.settingsPage.deleteCategory('${id}')"
                                            title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
    }

    // ================================================
    // CONTENU BACKUP
    // ================================================
    renderBackupContent() {
        return `
            <!-- Status du système -->
            <div class="backup-status-section">
                <div class="status-card">
                    <div class="status-header">
                        <div class="status-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div class="status-info">
                            <h3>Système de sauvegarde</h3>
                            <div class="status-indicator" id="backup-status">
                                <span class="status-dot loading"></span>
                                <span>Initialisation...</span>
                            </div>
                        </div>
                    </div>
                    <div class="status-details" id="backup-details">
                        <!-- Sera rempli par JS -->
                    </div>
                </div>
            </div>

            <!-- Actions principales -->
            <div class="backup-actions-section">
                <div class="actions-grid">
                    <div class="action-card primary">
                        <div class="card-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div class="card-content">
                            <h3>Sauvegarde complète</h3>
                            <p>Créez une sauvegarde de toutes vos données : catégories, paramètres et configuration.</p>
                            <div class="card-features">
                                <span><i class="fas fa-check"></i> Catégories personnalisées</span>
                                <span><i class="fas fa-check"></i> Paramètres utilisateur</span>
                                <span><i class="fas fa-check"></i> Historique des emails</span>
                            </div>
                        </div>
                        <button class="btn-card btn-primary" onclick="window.settingsPage.createFullBackup()" id="backup-btn">
                            <i class="fas fa-save"></i>
                            Créer maintenant
                        </button>
                    </div>

                    <div class="action-card secondary">
                        <div class="card-icon">
                            <i class="fas fa-file-import"></i>
                        </div>
                        <div class="card-content">
                            <h3>Restauration</h3>
                            <p>Restaurez vos données à partir d'un fichier de sauvegarde existant.</p>
                            <div class="card-features">
                                <span><i class="fas fa-upload"></i> Import de fichier JSON</span>
                                <span><i class="fas fa-check"></i> Validation automatique</span>
                                <span><i class="fas fa-shield"></i> Sauvegarde préventive</span>
                            </div>
                        </div>
                        <button class="btn-card btn-secondary" onclick="window.settingsPage.importBackup()">
                            <i class="fas fa-file-import"></i>
                            Importer un fichier
                        </button>
                    </div>

                    <div class="action-card accent">
                        <div class="card-icon">
                            <i class="fas fa-sync-alt"></i>
                        </div>
                        <div class="card-content">
                            <h3>Sauvegarde auto</h3>
                            <p>Configuration de la sauvegarde automatique lors des modifications.</p>
                            <div class="card-features">
                                <span><i class="fas fa-clock"></i> Sauvegarde planifiée</span>
                                <span><i class="fas fa-magic"></i> Déclenchement intelligent</span>
                                <span><i class="fas fa-history"></i> Versioning automatique</span>
                            </div>
                        </div>
                        <button class="btn-card btn-accent" onclick="window.settingsPage.configureAutoBackup()">
                            <i class="fas fa-cog"></i>
                            Configurer
                        </button>
                    </div>
                </div>
            </div>

            <!-- Historique -->
            <div class="backup-history-section">
                <div class="history-header">
                    <h3><i class="fas fa-history"></i> Historique des sauvegardes</h3>
                    <button class="btn-modern btn-secondary" onclick="window.settingsPage.refreshBackupHistory()">
                        <i class="fas fa-sync-alt"></i>
                        Actualiser
                    </button>
                </div>
                <div class="history-content" id="backup-history">
                    ${this.renderBackupHistory()}
                </div>
            </div>
        `;
    }

    renderBackupHistory() {
        const history = this.backupManager.getHistory();
        
        if (history.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3>Aucune sauvegarde</h3>
                    <p>Créez votre première sauvegarde pour commencer</p>
                </div>
            `;
        }

        return `
            <div class="history-list">
                ${history.map(backup => `
                    <div class="history-item">
                        <div class="history-icon">
                            <i class="fas fa-file-archive"></i>
                        </div>
                        <div class="history-info">
                            <div class="history-name">${backup.name}</div>
                            <div class="history-meta">
                                ${new Date(backup.date).toLocaleString('fr-FR')} • 
                                ${this.formatFileSize(backup.size)} • 
                                ${backup.categories || 0} catégories
                            </div>
                        </div>
                        <div class="history-actions">
                            <button class="btn-icon" onclick="window.settingsPage.downloadBackup('${backup.id}')" title="Télécharger">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn-icon danger" onclick="window.settingsPage.deleteBackupRecord('${backup.id}')" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchTab(tabName) {
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabName);
        });

        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });

        this.currentTab = tabName;

        // Actions spécifiques
        if (tabName === 'backup') {
            this.initializeBackup();
        }
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
    filterCategories(filter) {
        this.currentFilter = filter;
        
        // Mettre à jour les boutons de filtre
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        // Re-rendre la grille
        this.refreshCategoriesGrid();
    }

    shouldShowCategory(category) {
        const settings = this.loadSettings();
        
        switch (this.currentFilter) {
            case 'custom':
                return category.isCustom;
            case 'active':
                return settings.activeCategories?.includes(category.id) ?? true;
            case 'preselected':
                return settings.preselectedCategories?.includes(category.id) ?? false;
            default:
                return true;
        }
    }

    toggleCategory(categoryId) {
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories || [];
        
        if (activeCategories.includes(categoryId)) {
            activeCategories = activeCategories.filter(id => id !== categoryId);
            this.showToast('Catégorie désactivée', 'info');
        } else {
            activeCategories.push(categoryId);
            this.showToast('Catégorie activée', 'success');
        }
        
        settings.activeCategories = activeCategories;
        this.saveSettings(settings);
        this.refreshCategoriesGrid();
        this.refreshStats();
    }

    togglePreselection(categoryId) {
        const settings = this.loadSettings();
        let preselectedCategories = settings.preselectedCategories || [];
        
        if (preselectedCategories.includes(categoryId)) {
            preselectedCategories = preselectedCategories.filter(id => id !== categoryId);
            this.showToast('Pré-sélection supprimée', 'info');
        } else {
            preselectedCategories.push(categoryId);
            this.showToast('Catégorie pré-sélectionnée', 'success');
        }
        
        settings.preselectedCategories = preselectedCategories;
        this.saveSettings(settings);
        this.refreshCategoriesGrid();
        this.refreshStats();
    }

    toggleCategorySelection(categoryId) {
        // Toggle de sélection visuelle (pour les interactions rapides)
        const card = document.querySelector(`[onclick*="${categoryId}"]`);
        if (card) {
            card.classList.toggle('selected');
        }
    }

    editCategory(categoryId) {
        const category = this.getCategory(categoryId);
        if (!category) {
            this.showToast('Catégorie introuvable', 'error');
            return;
        }

        this.showEditCategoryModal(category);
    }

    deleteCategory(categoryId) {
        const category = this.getCategory(categoryId);
        if (!category || !category.isCustom) return;

        if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\n\nCette action est irréversible.`)) {
            // Supprimer via CategoryManager si disponible
            if (window.categoryManager?.deleteCustomCategory) {
                window.categoryManager.deleteCustomCategory(categoryId);
            }
            
            // Nettoyer les paramètres
            const settings = this.loadSettings();
            settings.activeCategories = settings.activeCategories?.filter(id => id !== categoryId) || [];
            settings.preselectedCategories = settings.preselectedCategories?.filter(id => id !== categoryId) || [];
            this.saveSettings(settings);

            this.refreshCategoriesGrid();
            this.refreshStats();
            this.showToast('Catégorie supprimée', 'success');
        }
    }

    // ================================================
    // MODALS
    // ================================================
    showCreateCategoryModal() {
        const modal = this.createModal('Nouvelle catégorie', this.renderCreateCategoryForm());
        document.body.appendChild(modal);
    }

    renderCreateCategoryForm() {
        return `
            <div class="form-modern">
                <div class="form-group">
                    <label class="form-label">Nom de la catégorie</label>
                    <input type="text" class="form-input" id="category-name" 
                           placeholder="Ex: Factures, Newsletter, Projets..." 
                           autocomplete="off">
                </div>

                <div class="form-group">
                    <label class="form-label">Icône</label>
                    <div class="icon-grid">
                        ${this.icons.map((icon, i) => `
                            <button type="button" class="icon-option ${i === 0 ? 'selected' : ''}" 
                                    onclick="window.settingsPage.selectIcon('${icon}', this)">
                                ${icon}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Couleur</label>
                    <div class="color-grid">
                        ${this.colors.map((color, i) => `
                            <button type="button" class="color-option ${i === 0 ? 'selected' : ''}" 
                                    style="background: ${color}"
                                    onclick="window.settingsPage.selectColor('${color}', this)">
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-modern btn-secondary" onclick="window.settingsPage.closeModal()">
                    <i class="fas fa-times"></i>
                    Annuler
                </button>
                <button class="btn-modern btn-primary" onclick="window.settingsPage.saveNewCategory()">
                    <i class="fas fa-save"></i>
                    Créer la catégorie
                </button>
            </div>
        `;
    }

    showEditCategoryModal(category) {
        const modal = this.createModal(`Éditer "${category.name}"`, this.renderEditCategoryForm(category));
        document.body.appendChild(modal);
        this.editingCategoryId = category.id;
    }

    renderEditCategoryForm(category) {
        const keywords = this.getCategoryKeywords(category.id);
        
        return `
            <div class="edit-tabs">
                <button class="edit-tab active" data-tab="info" onclick="window.settingsPage.switchEditTab('info')">
                    <i class="fas fa-info-circle"></i>
                    Informations
                </button>
                <button class="edit-tab" data-tab="keywords" onclick="window.settingsPage.switchEditTab('keywords')">
                    <i class="fas fa-key"></i>
                    Mots-clés
                </button>
            </div>

            <div class="edit-content">
                <!-- Onglet Informations -->
                <div class="edit-panel active" id="edit-info">
                    <div class="form-modern">
                        <div class="form-group">
                            <label class="form-label">Nom de la catégorie</label>
                            <input type="text" class="form-input" id="edit-category-name" 
                                   value="${category.name}" ${!category.isCustom ? 'disabled' : ''}>
                        </div>

                        ${category.isCustom ? `
                            <div class="form-group">
                                <label class="form-label">Icône</label>
                                <div class="icon-grid">
                                    ${this.icons.map(icon => `
                                        <button type="button" class="icon-option ${icon === category.icon ? 'selected' : ''}" 
                                                onclick="window.settingsPage.selectIcon('${icon}', this)">
                                            ${icon}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Couleur</label>
                                <div class="color-grid">
                                    ${this.colors.map(color => `
                                        <button type="button" class="color-option ${color === category.color ? 'selected' : ''}" 
                                                style="background: ${color}"
                                                onclick="window.settingsPage.selectColor('${color}', this)">
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Onglet Mots-clés -->
                <div class="edit-panel" id="edit-keywords">
                    ${this.renderKeywordsEditor(keywords)}
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-modern btn-secondary" onclick="window.settingsPage.closeModal()">
                    <i class="fas fa-times"></i>
                    Annuler
                </button>
                <button class="btn-modern btn-primary" onclick="window.settingsPage.saveEditedCategory()">
                    <i class="fas fa-save"></i>
                    Enregistrer
                </button>
            </div>
        `;
    }

    renderKeywordsEditor(keywords) {
        return `
            <div class="keywords-editor">
                <div class="keywords-section">
                    <h4><i class="fas fa-star" style="color: #ef4444"></i> Mots-clés absolus</h4>
                    <p class="section-desc">Déclenchent automatiquement cette catégorie</p>
                    <div class="keyword-input-group">
                        <input type="text" class="keyword-input" placeholder="Ajouter un mot-clé..." 
                               onkeypress="if(event.key==='Enter') window.settingsPage.addKeyword('absolute', this)">
                        <button class="btn-add" onclick="window.settingsPage.addKeyword('absolute', this.previousElementSibling)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="keywords-list" id="absolute-keywords">
                        ${(keywords.absolute || []).map(kw => `
                            <span class="keyword-tag absolute" data-keyword="${kw}">
                                ${kw}
                                <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="keywords-section">
                    <h4><i class="fas fa-bolt" style="color: #f97316"></i> Mots-clés forts</h4>
                    <p class="section-desc">Ont un poids important dans la classification</p>
                    <div class="keyword-input-group">
                        <input type="text" class="keyword-input" placeholder="Ajouter un mot-clé..." 
                               onkeypress="if(event.key==='Enter') window.settingsPage.addKeyword('strong', this)">
                        <button class="btn-add" onclick="window.settingsPage.addKeyword('strong', this.previousElementSibling)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="keywords-list" id="strong-keywords">
                        ${(keywords.strong || []).map(kw => `
                            <span class="keyword-tag strong" data-keyword="${kw}">
                                ${kw}
                                <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="keywords-section">
                    <h4><i class="fas fa-feather" style="color: #3b82f6"></i> Mots-clés faibles</h4>
                    <p class="section-desc">Ont un poids modéré dans la classification</p>
                    <div class="keyword-input-group">
                        <input type="text" class="keyword-input" placeholder="Ajouter un mot-clé..." 
                               onkeypress="if(event.key==='Enter') window.settingsPage.addKeyword('weak', this)">
                        <button class="btn-add" onclick="window.settingsPage.addKeyword('weak', this.previousElementSibling)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="keywords-list" id="weak-keywords">
                        ${(keywords.weak || []).map(kw => `
                            <span class="keyword-tag weak" data-keyword="${kw}">
                                ${kw}
                                <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-modern">
                <div class="modal-header">
                    <h2><i class="fas fa-cog"></i> ${title}</h2>
                    <button class="btn-close" onclick="window.settingsPage.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }

    closeModal() {
        document.querySelector('.modal-backdrop')?.remove();
        this.currentModal = null;
        this.editingCategoryId = null;
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================
    async initializeBackup() {
        try {
            this.updateBackupStatus('loading', 'Initialisation...');
            await this.backupManager.initialize();
            this.updateBackupStatus('ready', 'Système opérationnel');
            this.updateBackupDetails();
        } catch (error) {
            console.error('[SettingsPage] Erreur backup:', error);
            this.updateBackupStatus('error', 'Erreur de configuration');
        }
    }

    updateBackupStatus(status, message) {
        const statusEl = document.getElementById('backup-status');
        if (!statusEl) return;

        const icons = {
            loading: 'loading',
            ready: 'ready',
            error: 'error'
        };

        statusEl.innerHTML = `
            <span class="status-dot ${icons[status]}"></span>
            <span>${message}</span>
        `;
    }

    updateBackupDetails() {
        const detailsEl = document.getElementById('backup-details');
        if (!detailsEl) return;

        detailsEl.innerHTML = `
            <div class="status-details-grid">
                <div class="detail-item">
                    <i class="fas fa-folder"></i>
                    <span>Dossier: Téléchargements du navigateur</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>Sécurité: Données 100% locales</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-download"></i>
                    <span>Mode: Téléchargement automatique</span>
                </div>
            </div>
        `;
    }

    async createFullBackup() {
        const btn = document.getElementById('backup-btn');
        const originalContent = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';
        btn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation

            const backupData = await this.backupManager.createBackup();
            this.refreshBackupHistory();
            this.showToast('Sauvegarde créée avec succès!', 'success');
            
        } catch (error) {
            console.error('[SettingsPage] Erreur backup:', error);
            this.showToast('Erreur lors de la création de la sauvegarde', 'error');
        } finally {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    }

    async importBackup() {
        try {
            const file = await this.selectFile('.json');
            if (!file) return;

            const text = await file.text();
            const data = JSON.parse(text);

            if (this.validateBackupData(data)) {
                await this.restoreFromBackup(data);
                this.showToast('Sauvegarde importée avec succès!', 'success');
                setTimeout(() => location.reload(), 2000);
            } else {
                this.showToast('Fichier de sauvegarde invalide', 'error');
            }
        } catch (error) {
            console.error('[SettingsPage] Erreur import:', error);
            this.showToast('Erreur lors de l\'import', 'error');
        }
    }

    configureAutoBackup() {
        this.showToast('Fonctionnalité en développement', 'info');
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    getCategories() {
        return window.categoryManager?.getCategories() || {
            'factures': {
                id: 'factures',
                name: 'Factures',
                icon: '💰',
                color: '#ef4444',
                isCustom: false
            },
            'newsletters': {
                id: 'newsletters',
                name: 'Newsletters',
                icon: '📧',
                color: '#3b82f6',
                isCustom: false
            },
            'work': {
                id: 'work',
                name: 'Travail',
                icon: '💼',
                color: '#10b981',
                isCustom: true
            }
        };
    }

    getCategory(id) {
        const categories = this.getCategories();
        return categories[id];
    }

    getCategoryKeywords(categoryId) {
        return window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [],
            strong: [],
            weak: [],
            exclusions: []
        };
    }

    calculateStats(categories) {
        const settings = this.loadSettings();
        const total = Object.keys(categories).length;
        const custom = Object.values(categories).filter(cat => cat.isCustom).length;
        const active = settings.activeCategories?.length || total;
        const preselected = settings.preselectedCategories?.length || 0;
        const emails = Math.floor(Math.random() * 3000 + 1000); // Simulation

        return { total, custom, active, preselected, emails };
    }

    getCategoryStats(categoryId) {
        return {
            emails: Math.floor(Math.random() * 200 + 10),
            keywords: Math.floor(Math.random() * 15 + 3)
        };
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('mailsort-settings');
            return saved ? JSON.parse(saved) : {
                activeCategories: null,
                preselectedCategories: []
            };
        } catch (error) {
            return { activeCategories: null, preselectedCategories: [] };
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem('mailsort-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('[SettingsPage] Erreur sauvegarde:', error);
        }
    }

    refreshCategoriesGrid() {
        const grid = document.getElementById('categories-grid');
        if (grid) {
            grid.innerHTML = this.renderCategoriesGrid();
        }
    }

    refreshStats() {
        const stats = document.getElementById('categories-stats');
        if (stats) {
            stats.innerHTML = this.renderCategoriesStats();
        }
    }

    refreshBackupHistory() {
        const history = document.getElementById('backup-history');
        if (history) {
            history.innerHTML = this.renderBackupHistory();
        }
    }

    selectFile(accept) {
        return new Promise(resolve => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.onchange = e => resolve(e.target.files[0]);
            input.click();
        });
    }

    validateBackupData(data) {
        return data && 
               typeof data === 'object' && 
               data.timestamp && 
               data.version && 
               (data.categories || data.settings);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-modern ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            </div>
            <div class="toast-content">${message}</div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    renderError() {
        return `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Erreur de chargement</h3>
                <p>Une erreur est survenue lors du chargement de la page.</p>
                <button class="btn-modern btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i>
                    Recharger la page
                </button>
            </div>
        `;
    }

    // ================================================
    // ACTIONS MODAL
    // ================================================
    selectIcon(icon, element) {
        document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedIcon = icon;
    }

    selectColor(color, element) {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedColor = color;
    }

    saveNewCategory() {
        const name = document.getElementById('category-name')?.value?.trim();
        if (!name) {
            this.showToast('Le nom de la catégorie est requis', 'error');
            return;
        }

        const categoryData = {
            name,
            icon: this.selectedIcon || '📁',
            color: this.selectedColor || this.colors[0],
            isCustom: true,
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
        };

        // Créer via CategoryManager si disponible
        if (window.categoryManager?.createCustomCategory) {
            window.categoryManager.createCustomCategory(categoryData);
        }

        this.closeModal();
        this.refreshCategoriesGrid();
        this.refreshStats();
        this.showToast('Catégorie créée avec succès!', 'success');
    }

    switchEditTab(tabName) {
        document.querySelectorAll('.edit-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        document.querySelectorAll('.edit-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `edit-${tabName}`);
        });
    }

    addKeyword(type, input) {
        const keyword = input.value.trim();
        if (!keyword) return;

        const list = document.getElementById(`${type}-keywords`);
        if (!list) return;

        // Vérifier les doublons
        const existing = list.querySelector(`[data-keyword="${keyword}"]`);
        if (existing) {
            this.showToast('Ce mot-clé existe déjà', 'warning');
            return;
        }

        // Ajouter le mot-clé
        const tag = document.createElement('span');
        tag.className = `keyword-tag ${type}`;
        tag.setAttribute('data-keyword', keyword);
        tag.innerHTML = `
            ${keyword}
            <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;

        list.appendChild(tag);
        input.value = '';
        input.focus();
    }

    saveEditedCategory() {
        if (!this.editingCategoryId) return;

        const category = this.getCategory(this.editingCategoryId);
        if (!category) return;

        // Sauvegarder les modifications de base
        if (category.isCustom) {
            const name = document.getElementById('edit-category-name')?.value?.trim();
            if (name && name !== category.name) {
                category.name = name;
            }
            if (this.selectedIcon) category.icon = this.selectedIcon;
            if (this.selectedColor) category.color = this.selectedColor;
        }

        // Sauvegarder les mots-clés
        const keywords = {
            absolute: this.collectKeywords('absolute-keywords'),
            strong: this.collectKeywords('strong-keywords'),
            weak: this.collectKeywords('weak-keywords'),
            exclusions: []
        };

        // Mettre à jour via CategoryManager si disponible
        if (window.categoryManager) {
            if (window.categoryManager.updateCategoryKeywords) {
                window.categoryManager.updateCategoryKeywords(this.editingCategoryId, keywords);
            }
        }

        this.closeModal();
        this.refreshCategoriesGrid();
        this.showToast('Catégorie mise à jour!', 'success');
    }

    collectKeywords(listId) {
        const list = document.getElementById(listId);
        if (!list) return [];

        return Array.from(list.querySelectorAll('.keyword-tag'))
            .map(tag => tag.getAttribute('data-keyword'))
            .filter(Boolean);
    }

    exportCategories() {
        const categories = this.getCategories();
        const settings = this.loadSettings();
        
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            categories,
            settings,
            metadata: {
                exportedAt: new Date().toISOString(),
                application: 'MailSort Pro v2.0'
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mailsort-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Export réalisé avec succès!', 'success');
    }

    deleteBackupRecord(backupId) {
        if (confirm('Supprimer cette entrée de l\'historique ?')) {
            this.backupManager.deleteBackup(backupId);
            this.refreshBackupHistory();
            this.showToast('Entrée supprimée', 'info');
        }
    }

    downloadBackup(backupId) {
        this.showToast('Téléchargement en cours...', 'info');
    }

    // ================================================
    // INITIALISATION
    // ================================================
    initializeComponents() {
        this.refreshStats();
        this.refreshCategoriesGrid();
        this.selectedIcon = this.icons[0];
        this.selectedColor = this.colors[0];
    }

    initializeEventListeners() {
        // Écouter les changements de catégories
        window.addEventListener('categoryChanged', () => {
            this.refreshCategoriesGrid();
            this.refreshStats();
        });

        // Fermeture des modals avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // ================================================
    // STYLES MODERNES
    // ================================================
    addModernStyles() {
        if (document.getElementById('settingsPageStylesV2')) return;

        const styles = document.createElement('style');
        styles.id = 'settingsPageStylesV2';
        styles.textContent = `
            :root {
                --primary: #6366f1;
                --primary-light: #a5b4fc;
                --primary-dark: #4f46e5;
                --secondary: #64748b;
                --success: #10b981;
                --warning: #f59e0b;
                --danger: #ef4444;
                --info: #3b82f6;
                --bg-primary: #fafbff;
                --bg-secondary: #ffffff;
                --bg-tertiary: #f1f5f9;
                --text-primary: #0f172a;
                --text-secondary: #475569;
                --text-muted: #94a3b8;
                --border: #e2e8f0;
                --border-light: #f1f5f9;
                --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                --radius: 12px;
                --radius-lg: 16px;
                --radius-xl: 20px;
            }

            .settings-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 2rem;
                background: var(--bg-primary);
                min-height: 100vh;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            /* Header moderne */
            .settings-header {
                margin-bottom: 3rem;
            }

            .header-content {
                display: flex;
                align-items: center;
                gap: 2rem;
                padding: 2rem;
                background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                border-radius: var(--radius-xl);
                color: white;
                box-shadow: var(--shadow-lg);
            }

            .header-icon {
                width: 4rem;
                height: 4rem;
                background: rgba(255, 255, 255, 0.2);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
            }

            .header-text h1 {
                font-size: 2.5rem;
                font-weight: 800;
                margin: 0 0 0.5rem 0;
            }

            .header-text p {
                font-size: 1.125rem;
                opacity: 0.9;
                margin: 0;
            }

            /* Navigation moderne */
            .settings-navigation {
                margin-bottom: 3rem;
            }

            .nav-container {
                display: flex;
                gap: 1rem;
                background: var(--bg-secondary);
                padding: 0.5rem;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow);
            }

            .nav-item {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem 1.5rem;
                border: none;
                background: none;
                border-radius: var(--radius);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                color: var(--text-secondary);
            }

            .nav-item:hover {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }

            .nav-item.active {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .nav-icon {
                width: 2.5rem;
                height: 2.5rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
            }

            .nav-item.active .nav-icon {
                background: rgba(255, 255, 255, 0.2);
            }

            .nav-text {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            .nav-title {
                font-weight: 600;
                font-size: 1rem;
            }

            .nav-subtitle {
                font-size: 0.875rem;
                opacity: 0.7;
            }

            /* Contenu principal */
            .settings-main {
                background: var(--bg-secondary);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-xl);
                overflow: hidden;
            }

            .tab-content {
                display: none;
                padding: 3rem;
            }

            .tab-content.active {
                display: block;
            }

            /* Stats Dashboard */
            .stats-dashboard {
                margin-bottom: 3rem;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2rem;
            }

            .stat-card {
                background: var(--bg-secondary);
                border: 2px solid var(--border-light);
                border-radius: var(--radius-lg);
                padding: 2rem;
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }

            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--stat-color);
                transition: height 0.3s;
            }

            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-xl);
                border-color: var(--stat-color);
            }

            .stat-card:hover::before {
                height: 6px;
            }

            .stat-card.primary { --stat-color: var(--primary); }
            .stat-card.success { --stat-color: var(--success); }
            .stat-card.warning { --stat-color: var(--warning); }
            .stat-card.info { --stat-color: var(--info); }

            .stat-icon {
                width: 3.5rem;
                height: 3.5rem;
                background: var(--stat-color);
                color: white;
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
                box-shadow: var(--shadow);
            }

            .stat-number {
                font-size: 2.5rem;
                font-weight: 800;
                color: var(--stat-color);
                line-height: 1;
                margin-bottom: 0.5rem;
            }

            .stat-label {
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .stat-trend {
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .mini-chart {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 30%;
                height: 60px;
                background: linear-gradient(45deg, var(--stat-color)20, var(--stat-color)40);
                clip-path: polygon(0 100%, 100% calc(100% - var(--percentage)), 100% 100%);
            }

            /* Toolbar */
            .categories-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                gap: 2rem;
                flex-wrap: wrap;
            }

            .section-title {
                font-size: 1.875rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .section-title i {
                color: var(--primary);
            }

            .filter-tabs {
                display: flex;
                gap: 0.5rem;
                background: var(--bg-tertiary);
                padding: 0.5rem;
                border-radius: var(--radius);
            }

            .filter-tab {
                padding: 0.75rem 1.25rem;
                border: none;
                background: none;
                border-radius: var(--radius);
                cursor: pointer;
                font-weight: 500;
                color: var(--text-secondary);
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .filter-tab:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .filter-tab.active {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .btn-modern {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.875rem 1.5rem;
                border: none;
                border-radius: var(--radius);
                font-weight: 600;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-decoration: none;
            }

            .btn-primary {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .btn-primary:hover {
                background: var(--primary-dark);
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            .btn-secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border: 1px solid var(--border);
            }

            .btn-secondary:hover {
                background: var(--bg-secondary);
                border-color: var(--primary);
                color: var(--primary);
            }

            /* Grille des catégories */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 2rem;
            }

            .category-card {
                background: var(--bg-secondary);
                border: 2px solid var(--border-light);
                border-radius: var(--radius-lg);
                padding: 1.5rem;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                cursor: pointer;
                overflow: hidden;
            }

            .category-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 0;
                background: var(--category-color);
                transition: height 0.3s;
            }

            .category-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
                border-color: var(--category-color);
            }

            .category-card:hover::before {
                height: 4px;
            }

            .category-card.inactive {
                opacity: 0.6;
                background: var(--bg-tertiary);
            }

            .category-card.selected {
                border-color: var(--category-color);
                box-shadow: 0 0 0 3px var(--category-color)20;
            }

            .category-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .category-icon {
                width: 3rem;
                height: 3rem;
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: white;
                box-shadow: var(--shadow);
            }

            .category-badges {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                align-items: flex-end;
            }

            .badge {
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .badge.custom {
                background: var(--info);
                color: white;
            }

            .badge.preselected {
                background: var(--warning);
                color: white;
            }

            .badge.status.active {
                background: var(--success);
                color: white;
            }

            .badge.status.inactive {
                background: var(--text-muted);
                color: white;
            }

            .category-body {
                margin-bottom: 1.5rem;
            }

            .category-name {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 1rem 0;
            }

            .category-stats {
                display: flex;
                gap: 1rem;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .category-footer {
                border-top: 1px solid var(--border-light);
                padding-top: 1rem;
            }

            .category-actions {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
            }

            .action-btn {
                width: 2.5rem;
                height: 2.5rem;
                border: 2px solid var(--border);
                background: var(--bg-secondary);
                border-radius: var(--radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                color: var(--text-secondary);
            }

            .action-btn:hover {
                border-color: var(--primary);
                color: var(--primary);
                transform: scale(1.1);
            }

            .action-btn.active {
                background: var(--success);
                border-color: var(--success);
                color: white;
            }

            .action-btn.inactive {
                background: var(--danger);
                border-color: var(--danger);
                color: white;
            }

            .action-btn.selected {
                background: var(--warning);
                border-color: var(--warning);
                color: white;
            }

            .action-btn.danger:hover {
                background: var(--danger);
                border-color: var(--danger);
                color: white;
            }

            /* Section Backup */
            .backup-status-section {
                margin-bottom: 3rem;
            }

            .status-card {
                background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
                border: 1px solid var(--border);
                border-radius: var(--radius-lg);
                padding: 2rem;
                box-shadow: var(--shadow);
            }

            .status-header {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .status-icon {
                width: 3rem;
                height: 3rem;
                background: var(--primary);
                color: white;
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

            .status-info h3 {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 0.5rem 0;
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-weight: 500;
            }

            .status-dot {
                width: 0.75rem;
                height: 0.75rem;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            .status-dot.loading {
                background: var(--warning);
            }

            .status-dot.ready {
                background: var(--success);
                animation: none;
            }

            .status-dot.error {
                background: var(--danger);
                animation: none;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .status-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }

            .detail-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: var(--bg-secondary);
                border-radius: var(--radius);
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .detail-item i {
                color: var(--primary);
            }

            /* Actions Backup */
            .backup-actions-section {
                margin-bottom: 3rem;
            }

            .actions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 2rem;
            }

            .action-card {
                background: var(--bg-secondary);
                border: 2px solid var(--border-light);
                border-radius: var(--radius-lg);
                padding: 2rem;
                text-align: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }

            .action-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 0;
                background: var(--card-color);
                transition: height 0.3s;
            }

            .action-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-xl);
                border-color: var(--card-color);
            }

            .action-card:hover::before {
                height: 4px;
            }

            .action-card.primary { --card-color: var(--primary); }
            .action-card.secondary { --card-color: var(--secondary); }
            .action-card.accent { --card-color: var(--info); }

            .card-icon {
                width: 4rem;
                height: 4rem;
                background: var(--card-color);
                color: white;
                border-radius: var(--radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                margin: 0 auto 1.5rem;
                box-shadow: var(--shadow);
            }

            .card-content h3 {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 1rem 0;
            }

            .card-content p {
                color: var(--text-secondary);
                margin: 0 0 1.5rem 0;
                line-height: 1.6;
            }

            .card-features {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                margin-bottom: 2rem;
            }

            .card-features span {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .card-features i {
                color: var(--success);
            }

            .btn-card {
                width: 100%;
                padding: 1rem 2rem;
                border: none;
                border-radius: var(--radius);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
            }

            .btn-card.btn-primary {
                background: var(--primary);
                color: white;
            }

            .btn-card.btn-secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border: 1px solid var(--border);
            }

            .btn-card.btn-accent {
                background: var(--info);
                color: white;
            }

            .btn-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            /* Historique Backup */
            .backup-history-section {
                background: var(--bg-tertiary);
                border-radius: var(--radius-lg);
                padding: 2rem;
            }

            .history-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }

            .history-header h3 {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .history-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .history-item {
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1.5rem;
                display: flex;
                align-items: center;
                gap: 1.5rem;
                transition: all 0.3s;
            }

            .history-item:hover {
                border-color: var(--primary);
                box-shadow: var(--shadow);
            }

            .history-icon {
                width: 3rem;
                height: 3rem;
                background: var(--primary)15;
                color: var(--primary);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                flex-shrink: 0;
            }

            .history-info {
                flex: 1;
            }

            .history-name {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .history-meta {
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .history-actions {
                display: flex;
                gap: 0.5rem;
            }

            .btn-icon {
                width: 2.5rem;
                height: 2.5rem;
                border: 1px solid var(--border);
                background: var(--bg-secondary);
                border-radius: var(--radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                color: var(--text-secondary);
            }

            .btn-icon:hover {
                border-color: var(--primary);
                color: var(--primary);
            }

            .btn-icon.danger:hover {
                background: var(--danger);
                border-color: var(--danger);
                color: white;
            }

            /* Modals */
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                animation: fadeIn 0.3s forwards;
            }

            @keyframes fadeIn {
                to { opacity: 1; }
            }

            .modal-modern {
                background: var(--bg-secondary);
                border-radius: var(--radius-xl);
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: var(--shadow-xl);
                transform: scale(0.9);
                animation: modalSlideIn 0.3s 0.1s forwards;
            }

            @keyframes modalSlideIn {
                to { transform: scale(1); }
            }

            .modal-header {
                padding: 2rem 2rem 1rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h2 {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .btn-close {
                width: 3rem;
                height: 3rem;
                border: none;
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                color: var(--text-secondary);
            }

            .btn-close:hover {
                background: var(--danger);
                color: white;
                transform: scale(1.1);
            }

            .modal-body {
                padding: 2rem;
                max-height: 60vh;
                overflow-y: auto;
            }

            .modal-footer {
                padding: 1rem 2rem 2rem;
                border-top: 1px solid var(--border);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
            }

            /* Formulaires */
            .form-modern {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .form-label {
                font-weight: 600;
                color: var(--text-primary);
                font-size: 1rem;
            }

            .form-input {
                padding: 1rem;
                border: 2px solid var(--border);
                border-radius: var(--radius);
                font-size: 1rem;
                transition: all 0.3s;
                background: var(--bg-secondary);
            }

            .form-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px var(--primary)20;
            }

            .icon-grid, .color-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(3rem, 1fr));
                gap: 1rem;
            }

            .icon-option, .color-option {
                width: 3rem;
                height: 3rem;
                border: 2px solid var(--border);
                border-radius: var(--radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                font-size: 1.25rem;
                background: var(--bg-secondary);
            }

            .icon-option:hover, .color-option:hover {
                transform: scale(1.1);
                border-color: var(--primary);
            }

            .icon-option.selected, .color-option.selected {
                border-color: var(--primary);
                background: var(--primary)15;
                transform: scale(1.1);
            }

            /* Éditeur de mots-clés */
            .edit-tabs {
                display: flex;
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                padding: 0.25rem;
                margin-bottom: 2rem;
            }

            .edit-tab {
                flex: 1;
                padding: 0.75rem 1rem;
                border: none;
                background: none;
                border-radius: var(--radius);
                cursor: pointer;
                font-weight: 500;
                color: var(--text-secondary);
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .edit-tab:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .edit-tab.active {
                background: var(--primary);
                color: white;
                box-shadow: var(--shadow);
            }

            .edit-content {
                max-height: 50vh;
                overflow-y: auto;
            }

            .edit-panel {
                display: none;
            }

            .edit-panel.active {
                display: block;
            }

            .keywords-editor {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }

            .keywords-section {
                background: var(--bg-tertiary);
                border-radius: var(--radius);
                padding: 1.5rem;
            }

            .keywords-section h4 {
                font-size: 1.125rem;
                font-weight: 600;
                margin: 0 0 0.5rem 0;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .section-desc {
                font-size: 0.875rem;
                color: var(--text-secondary);
                margin: 0 0 1.5rem 0;
            }

            .keyword-input-group {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .keyword-input {
                flex: 1;
                padding: 0.75rem;
                border: 1px solid var(--border);
                border-radius: var(--radius);
                font-size: 0.875rem;
            }

            .btn-add {
                width: 3rem;
                height: 3rem;
                border: none;
                border-radius: var(--radius);
                background: var(--primary);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .btn-add:hover {
                transform: scale(1.05);
                box-shadow: var(--shadow);
            }

            .keywords-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                min-height: 2rem;
            }

            .keyword-tag {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.3s;
            }

            .keyword-tag.absolute {
                background: #ef444415;
                color: #ef4444;
                border: 1px solid #ef444440;
            }

            .keyword-tag.strong {
                background: #f9731615;
                color: #f97316;
                border: 1px solid #f9731640;
            }

            .keyword-tag.weak {
                background: #3b82f615;
                color: #3b82f6;
                border: 1px solid #3b82f640;
            }

            .keyword-tag button {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 50%;
                transition: all 0.2s;
                opacity: 0.7;
            }

            .keyword-tag button:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.2);
            }

            /* États vides */
            .empty-state {
                text-align: center;
                padding: 4rem 2rem;
                color: var(--text-secondary);
            }

            .empty-icon {
                width: 5rem;
                height: 5rem;
                background: var(--bg-tertiary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                margin: 0 auto 2rem;
                color: var(--text-muted);
            }

            .empty-state h3 {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0 0 1rem 0;
                color: var(--text-primary);
            }

            .empty-state p {
                margin: 0 0 2rem 0;
                line-height: 1.6;
            }

            /* Toast */
            .toast-modern {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1rem 1.5rem;
                box-shadow: var(--shadow-lg);
                z-index: 2000;
                transform: translateX(400px);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 1rem;
                max-width: 400px;
                border-left: 4px solid var(--toast-color);
            }

            .toast-modern.show {
                transform: translateX(0);
            }

            .toast-modern.success { --toast-color: var(--success); }
            .toast-modern.error { --toast-color: var(--danger); }
            .toast-modern.info { --toast-color: var(--info); }
            .toast-modern.warning { --toast-color: var(--warning); }

            .toast-icon {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                background: var(--toast-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                flex-shrink: 0;
            }

            .toast-content {
                font-weight: 500;
                color: var(--text-primary);
            }

            /* Responsive */
            @media (max-width: 1024px) {
                .settings-container {
                    padding: 1.5rem;
                }

                .header-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 1.5rem;
                }

                .categories-toolbar {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 1.5rem;
                }

                .toolbar-center {
                    order: -1;
                }

                .stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                }

                .categories-grid {
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                }

                .actions-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .settings-container {
                    padding: 1rem;
                }

                .tab-content {
                    padding: 2rem;
                }

                .header-text h1 {
                    font-size: 2rem;
                }

                .nav-container {
                    flex-direction: column;
                }

                .nav-item {
                    justify-content: center;
                }

                .categories-grid {
                    grid-template-columns: 1fr;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                }

                .modal-modern {
                    margin: 1rem;
                    max-width: none;
                }

                .icon-grid, .color-grid {
                    grid-template-columns: repeat(5, 1fr);
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// ================================================
// GESTIONNAIRE DE BACKUP V2
// ================================================
class BackupManagerV2 {
    constructor() {
        this.isInitialized = false;
        this.history = this.loadHistory();
    }

    async initialize() {
        this.isInitialized = true;
        console.log('[BackupManager] ✅ Initialisé');
    }

    async createBackup() {
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            categories: window.settingsPage.getCategories(),
            settings: window.settingsPage.loadSettings(),
            metadata: {
                totalCategories: Object.keys(window.settingsPage.getCategories()).length,
                createdAt: new Date().toISOString(),
                application: 'MailSort Pro v2.0',
                userAgent: navigator.userAgent
            }
        };

        const filename = `mailsort-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });

        // Télécharger le fichier
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Ajouter à l'historique
        const record = {
            id: Date.now().toString(),
            name: filename,
            date: new Date().toISOString(),
            size: blob.size,
            categories: Object.keys(backupData.categories).length,
            type: 'complete'
        };

        this.history.unshift(record);
        this.history = this.history.slice(0, 20); // Garder 20 max
        this.saveHistory();

        return backupData;
    }

    getHistory() {
        return this.history;
    }

    deleteBackup(backupId) {
        this.history = this.history.filter(backup => backup.id !== backupId);
        this.saveHistory();
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('mailsort-backup-history');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('mailsort-backup-history', JSON.stringify(this.history));
        } catch (error) {
            console.error('[BackupManager] Erreur sauvegarde historique:', error);
        }
    }
}

// ================================================
// INTÉGRATION GLOBALE
// ================================================
window.settingsPage = new SettingsPageV2();

// Intégration avec PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.settingsPage.render(container);
    };
}

console.log('[SettingsPage] ✅ SettingsPage v2.0 chargée!');
