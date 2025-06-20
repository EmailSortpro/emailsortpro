// SettingsPage.js - Version Simplifiée avec Backup Local
console.log('[SettingsPage] 🚀 Loading SettingsPage Simplifiée...');

// Nettoyer toute instance précédente
if (window.settingsPage) {
    console.log('[SettingsPage] 🧹 Nettoyage instance précédente...');
    delete window.settingsPage;
}

class SettingsPageSimple {
    constructor() {
        this.currentTab = 'categories';
        this.backupManager = new BackupManager();
        this.editingCategoryId = null;
        this.currentModal = null;
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8'
        ];
        console.log('[SettingsPage] ✅ Interface simplifiée initialisée');
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
            container.innerHTML = `
                <div class="settings-page">
                    <!-- Header -->
                    <div class="settings-header">
                        <h1><i class="fas fa-cog"></i> Paramètres</h1>
                        <p>Gérez vos catégories et vos sauvegardes</p>
                    </div>
                    
                    <!-- Navigation des onglets -->
                    <div class="settings-tabs">
                        <button class="tab-button active" data-tab="categories" onclick="window.settingsPage.switchTab('categories')">
                            <i class="fas fa-tags"></i>
                            <span>Catégories</span>
                        </button>
                        <button class="tab-button" data-tab="backup" onclick="window.settingsPage.switchTab('backup')">
                            <i class="fas fa-cloud-download-alt"></i>
                            <span>Sauvegarde</span>
                        </button>
                    </div>
                    
                    <!-- Contenu des onglets -->
                    <div class="settings-content">
                        <!-- Onglet Catégories -->
                        <div id="tab-categories" class="tab-content active">
                            ${this.renderCategoriesTab()}
                        </div>
                        
                        <!-- Onglet Backup -->
                        <div id="tab-backup" class="tab-content">
                            ${this.renderBackupTab()}
                        </div>
                    </div>
                </div>
            `;
            
            this.addStyles();
            this.initializeBackupManager();
            
        } catch (error) {
            console.error('[SettingsPage] Erreur:', error);
            container.innerHTML = this.renderError();
        }
    }

    // ================================================
    // ONGLET CATÉGORIES
    // ================================================
    renderCategoriesTab() {
        const categories = window.categoryManager?.getCategories() || {};
        const stats = this.calculateCategoryStats();
        
        return `
            <div class="categories-section">
                <!-- Stats rapides -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-number">${Object.keys(categories).length}</div>
                        <div class="stat-label">Catégories</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalEmails}</div>
                        <div class="stat-label">Emails classés</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalKeywords}</div>
                        <div class="stat-label">Mots-clés</div>
                    </div>
                </div>
                
                <!-- Actions principales -->
                <div class="categories-actions">
                    <button class="btn-primary" onclick="window.settingsPage.showCreateCategoryModal()">
                        <i class="fas fa-plus"></i>
                        Nouvelle catégorie
                    </button>
                    <button class="btn-secondary" onclick="window.settingsPage.exportCategories()">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                </div>
                
                <!-- Liste des catégories -->
                <div class="categories-list">
                    ${this.renderCategoriesList(categories)}
                </div>
            </div>
        `;
    }

    renderCategoriesList(categories) {
        if (Object.keys(categories).length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Aucune catégorie</h3>
                    <p>Créez votre première catégorie pour commencer</p>
                </div>
            `;
        }

        return Object.entries(categories).map(([id, category]) => {
            const stats = this.getCategoryStats(id);
            const settings = this.loadSettings();
            const isActive = settings.activeCategories === null || settings.activeCategories.includes(id);
            const isPreselected = settings.taskPreselectedCategories?.includes(id) || false;
            
            return `
                <div class="category-item ${!isActive ? 'inactive' : ''}">
                    <div class="category-main">
                        <div class="category-icon" style="background: ${category.color}20; color: ${category.color}">
                            ${category.icon}
                        </div>
                        <div class="category-info">
                            <h3>${category.name}</h3>
                            <div class="category-meta">
                                <span>${stats.emailCount} emails</span>
                                <span>${stats.keywords} mots-clés</span>
                                ${isPreselected ? '<span class="preselected-badge">⭐ Pré-sélectionnée</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="category-actions">
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
            `;
        }).join('');
    }

    // ================================================
    // ONGLET BACKUP
    // ================================================
    renderBackupTab() {
        return `
            <div class="backup-section">
                <!-- Statut du backup -->
                <div class="backup-status" id="backup-status">
                    <div class="status-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        Initialisation du système de sauvegarde...
                    </div>
                </div>
                
                <!-- Chemin de sauvegarde -->
                <div id="backup-path-info" class="backup-path-info">
                    <!-- Sera rempli par JavaScript -->
                </div>
                
                <!-- Actions de backup -->
                <div class="backup-actions">
                    <div class="backup-group">
                        <h3><i class="fas fa-save"></i> Sauvegarde manuelle</h3>
                        <p>Créer une sauvegarde complète de vos données</p>
                        <button class="btn-primary" onclick="window.settingsPage.createBackup()" id="backup-btn">
                            <i class="fas fa-cloud-upload-alt"></i>
                            Créer une sauvegarde
                        </button>
                    </div>
                    
                    <div class="backup-group">
                        <h3><i class="fas fa-history"></i> Restauration</h3>
                        <p>Restaurer vos données depuis une sauvegarde</p>
                        <button class="btn-secondary" onclick="window.settingsPage.restoreBackup()" id="restore-btn">
                            <i class="fas fa-upload"></i>
                            Restaurer une sauvegarde
                        </button>
                    </div>
                    
                    <div class="backup-group">
                        <h3><i class="fas fa-folder-open"></i> Dossier de sauvegarde</h3>
                        <p>Accéder au dossier de sauvegarde local</p>
                        <button class="btn-secondary" onclick="window.settingsPage.openBackupFolder()">
                            <i class="fas fa-external-link-alt"></i>
                            Ouvrir le dossier
                        </button>
                    </div>
                </div>
                
                <!-- Historique des sauvegardes -->
                <div class="backup-history">
                    <h3><i class="fas fa-list"></i> Historique des sauvegardes</h3>
                    <div id="backup-list">
                        <div class="loading">Chargement...</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // GESTION DES ONGLETS
    // ================================================
    switchTab(tabName) {
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
        
        this.currentTab = tabName;
        
        // Actions spécifiques par onglet
        if (tabName === 'backup') {
            this.refreshBackupStatus();
        }
    }

    // ================================================
    // GESTION DES CATÉGORIES
    // ================================================
    calculateCategoryStats() {
        const categories = window.categoryManager?.getCategories() || {};
        const emails = window.emailScanner?.getAllEmails() || [];
        
        let totalKeywords = 0;
        Object.keys(categories).forEach(id => {
            const keywords = window.categoryManager?.getCategoryKeywords(id) || {};
            totalKeywords += (keywords.absolute?.length || 0) + 
                           (keywords.strong?.length || 0) + 
                           (keywords.weak?.length || 0);
        });
        
        return {
            totalEmails: emails.length,
            totalKeywords: totalKeywords
        };
    }

    getCategoryStats(categoryId) {
        const emails = window.emailScanner?.getAllEmails() || [];
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {};
        
        return {
            emailCount: emails.filter(email => email.category === categoryId).length,
            keywords: (keywords.absolute?.length || 0) + 
                     (keywords.strong?.length || 0) + 
                     (keywords.weak?.length || 0)
        };
    }

    toggleCategory(categoryId) {
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories || null;
        
        if (activeCategories === null) {
            const allCategories = Object.keys(window.categoryManager?.getCategories() || {});
            activeCategories = allCategories.filter(id => id !== categoryId);
        } else {
            if (activeCategories.includes(categoryId)) {
                activeCategories = activeCategories.filter(id => id !== categoryId);
            } else {
                activeCategories.push(categoryId);
            }
        }
        
        settings.activeCategories = activeCategories;
        this.saveSettings(settings);
        
        // Notifier CategoryManager
        if (window.categoryManager) {
            window.categoryManager.updateActiveCategories(activeCategories);
        }
        
        this.refreshCategoriesTab();
        this.showToast(`Catégorie ${activeCategories.includes(categoryId) ? 'activée' : 'désactivée'}`);
    }

    togglePreselection(categoryId) {
        const settings = this.loadSettings();
        let taskPreselectedCategories = settings.taskPreselectedCategories || [];
        
        if (taskPreselectedCategories.includes(categoryId)) {
            taskPreselectedCategories = taskPreselectedCategories.filter(id => id !== categoryId);
        } else {
            taskPreselectedCategories.push(categoryId);
        }
        
        settings.taskPreselectedCategories = taskPreselectedCategories;
        this.saveSettings(settings);
        
        // Synchroniser avec les autres modules
        this.syncTaskPreselectedCategories(taskPreselectedCategories);
        
        this.refreshCategoriesTab();
        this.showToast('Pré-sélection mise à jour');
    }

    syncTaskPreselectedCategories(categories) {
        // Synchroniser avec CategoryManager
        if (window.categoryManager && typeof window.categoryManager.updateTaskPreselectedCategories === 'function') {
            window.categoryManager.updateTaskPreselectedCategories(categories);
        }
        
        // Synchroniser avec EmailScanner
        if (window.emailScanner && typeof window.emailScanner.updateTaskPreselectedCategories === 'function') {
            window.emailScanner.updateTaskPreselectedCategories(categories);
        }
        
        // Dispatching des événements
        window.dispatchEvent(new CustomEvent('categorySettingsChanged', { 
            detail: {
                type: 'taskPreselectedCategories',
                value: categories,
                source: 'SettingsPage'
            }
        }));
    }

    // ================================================
    // MODALS SIMPLIFIÉES
    // ================================================
    showCreateCategoryModal() {
        this.closeModal();
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.settingsPage.closeModal()">
                <div class="modal-simple">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus"></i> Nouvelle catégorie</h2>
                        <button class="btn-close" onclick="window.settingsPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Nom de la catégorie</label>
                            <input type="text" id="category-name" placeholder="Ex: Factures, Newsletter..." autofocus>
                        </div>
                        
                        <div class="form-group">
                            <label>Icône</label>
                            <div class="icon-selector">
                                ${['📁', '📧', '💼', '🎯', '⚡', '🔔', '💡', '📊', '🏷️', '📌'].map((icon, i) => 
                                    `<button class="icon-option ${i === 0 ? 'selected' : ''}" onclick="window.settingsPage.selectIcon('${icon}')">${icon}</button>`
                                ).join('')}
                            </div>
                            <input type="hidden" id="category-icon" value="📁">
                        </div>
                        
                        <div class="form-group">
                            <label>Couleur</label>
                            <div class="color-selector">
                                ${this.colors.map((color, i) => 
                                    `<button class="color-option ${i === 0 ? 'selected' : ''}" 
                                             style="background: ${color}"
                                             onclick="window.settingsPage.selectColor('${color}')"></button>`
                                ).join('')}
                            </div>
                            <input type="hidden" id="category-color" value="${this.colors[0]}">
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.settingsPage.closeModal()">Annuler</button>
                        <button class="btn-primary" onclick="window.settingsPage.createCategory()">
                            <i class="fas fa-plus"></i> Créer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
        
        setTimeout(() => document.getElementById('category-name')?.focus(), 100);
    }

    selectIcon(icon) {
        document.getElementById('category-icon').value = icon;
        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.classList.toggle('selected', btn.textContent === icon);
        });
    }

    selectColor(color) {
        document.getElementById('category-color').value = color;
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.toggle('selected', btn.style.background === color);
        });
    }

    createCategory() {
        const name = document.getElementById('category-name')?.value?.trim();
        const icon = document.getElementById('category-icon')?.value || '📁';
        const color = document.getElementById('category-color')?.value || this.colors[0];
        
        if (!name) {
            this.showToast('Le nom est requis', 'error');
            return;
        }
        
        const categoryData = {
            name,
            icon,
            color,
            priority: 30,
            keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
        };
        
        const newCategory = window.categoryManager?.createCustomCategory(categoryData);
        
        if (newCategory) {
            this.closeModal();
            this.showToast('Catégorie créée avec succès!');
            this.refreshCategoriesTab();
        }
    }

    editCategory(categoryId) {
        console.log('[SettingsPage] 📝 Ouverture édition catégorie:', categoryId);
        
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) {
            this.showToast('Catégorie introuvable', 'error');
            return;
        }
        
        this.closeModal();
        this.editingCategoryId = categoryId;
        
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        const filters = window.categoryManager?.getCategoryFilters(categoryId) || {
            includeDomains: [], includeEmails: [], excludeDomains: [], excludeEmails: []
        };
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.settingsPage.closeModal()">
                <div class="modal-edit">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon" style="color: ${category.color}">${category.icon}</span>
                            <h2>Éditer "${category.name}"</h2>
                        </div>
                        <button class="btn-close" onclick="window.settingsPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-tabs">
                        <button class="tab-btn active" data-tab="keywords" onclick="window.settingsPage.switchEditTab('keywords')">
                            <i class="fas fa-key"></i> Mots-clés
                        </button>
                        <button class="tab-btn" data-tab="filters" onclick="window.settingsPage.switchEditTab('filters')">
                            <i class="fas fa-filter"></i> Filtres
                        </button>
                        ${category.isCustom ? `
                            <button class="tab-btn" data-tab="settings" onclick="window.settingsPage.switchEditTab('settings')">
                                <i class="fas fa-cog"></i> Paramètres
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="modal-content">
                        <!-- Onglet Mots-clés -->
                        <div class="edit-tab-content active" id="edit-keywords">
                            <div class="keywords-layout">
                                ${this.renderKeywordSection('absolute', 'Mots-clés absolus', keywords.absolute, '#EF4444', 'fa-star', 'Déclenchent automatiquement cette catégorie')}
                                ${this.renderKeywordSection('strong', 'Mots-clés forts', keywords.strong, '#F97316', 'fa-bolt', 'Ont un poids important dans la classification')}
                                ${this.renderKeywordSection('weak', 'Mots-clés faibles', keywords.weak, '#3B82F6', 'fa-feather', 'Ont un poids modéré dans la classification')}
                                ${this.renderKeywordSection('exclusions', 'Exclusions', keywords.exclusions, '#8B5CF6', 'fa-ban', 'Empêchent la classification dans cette catégorie')}
                            </div>
                        </div>
                        
                        <!-- Onglet Filtres -->
                        <div class="edit-tab-content" id="edit-filters">
                            <div class="filters-layout">
                                <div class="filter-group">
                                    <h3><i class="fas fa-check"></i> Inclusions</h3>
                                    ${this.renderFilterSection('includeDomains', 'Domaines autorisés', filters.includeDomains, 'exemple.com', '#10B981')}
                                    ${this.renderFilterSection('includeEmails', 'Emails autorisés', filters.includeEmails, 'contact@exemple.com', '#10B981')}
                                </div>
                                <div class="filter-group">
                                    <h3><i class="fas fa-times"></i> Exclusions</h3>
                                    ${this.renderFilterSection('excludeDomains', 'Domaines exclus', filters.excludeDomains, 'spam.com', '#EF4444')}
                                    ${this.renderFilterSection('excludeEmails', 'Emails exclus', filters.excludeEmails, 'noreply@exemple.com', '#EF4444')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Onglet Paramètres (si catégorie personnalisée) -->
                        ${category.isCustom ? `
                            <div class="edit-tab-content" id="edit-settings">
                                <div class="settings-section">
                                    <div class="danger-zone">
                                        <h3><i class="fas fa-exclamation-triangle"></i> Zone dangereuse</h3>
                                        <p>Cette action supprimera définitivement la catégorie et tous ses paramètres.</p>
                                        <button class="btn-danger" onclick="window.settingsPage.confirmDeleteCategory('${categoryId}')">
                                            <i class="fas fa-trash"></i> Supprimer cette catégorie
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.settingsPage.closeModal()">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                        <button class="btn-primary" onclick="window.settingsPage.saveCategory()">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
    }

    renderKeywordSection(type, title, keywords, color, icon, description) {
        return `
            <div class="keyword-section">
                <div class="section-header">
                    <h4><i class="fas ${icon}" style="color: ${color}"></i> ${title}</h4>
                    <span class="keyword-count" style="background: ${color}20; color: ${color}">${keywords.length}</span>
                </div>
                <p class="section-description">${description}</p>
                
                <div class="input-group">
                    <input type="text" 
                           id="${type}-input" 
                           placeholder="Ajouter un mot-clé..."
                           onkeypress="if(event.key === 'Enter') window.settingsPage.addKeyword('${type}', '${color}')">
                    <button class="btn-add" style="background: ${color}" onclick="window.settingsPage.addKeyword('${type}', '${color}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="keywords-list" id="${type}-list">
                    ${keywords.map(keyword => `
                        <span class="keyword-tag" style="background: ${color}15; color: ${color}">
                            ${keyword}
                            <button onclick="window.settingsPage.removeKeyword('${type}', '${keyword}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFilterSection(type, title, items, placeholder, color) {
        return `
            <div class="filter-section">
                <h4><i class="fas fa-${type.includes('Domain') ? 'globe' : 'at'}"></i> ${title}</h4>
                
                <div class="input-group">
                    <input type="text" 
                           id="${type}-input" 
                           placeholder="${placeholder}"
                           onkeypress="if(event.key === 'Enter') window.settingsPage.addFilter('${type}', '${color}')">
                    <button class="btn-add" style="background: ${color}" onclick="window.settingsPage.addFilter('${type}', '${color}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="filters-list" id="${type}-list">
                    ${items.map(item => `
                        <span class="filter-tag" style="background: ${color}15; color: ${color}">
                            ${item}
                            <button onclick="window.settingsPage.removeFilter('${type}', '${item}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    switchEditTab(tabName) {
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Mettre à jour le contenu
        document.querySelectorAll('.edit-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `edit-${tabName}`);
        });
    }

    addKeyword(type, color) {
        const input = document.getElementById(`${type}-input`);
        if (!input?.value.trim()) return;
        
        const keyword = input.value.trim().toLowerCase();
        const list = document.getElementById(`${type}-list`);
        
        if (!list) return;
        
        // Vérifier si le mot-clé existe déjà
        const existing = list.querySelector(`[data-keyword="${keyword}"]`);
        if (existing) {
            this.showToast('Ce mot-clé existe déjà', 'warning');
            return;
        }
        
        list.insertAdjacentHTML('beforeend', `
            <span class="keyword-tag" style="background: ${color}15; color: ${color}" data-keyword="${keyword}">
                ${keyword}
                <button onclick="window.settingsPage.removeKeyword('${type}', '${keyword}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `);
        
        // Mettre à jour le compteur
        const counter = document.querySelector(`.keyword-section:has(#${type}-input) .keyword-count`);
        if (counter) {
            const newCount = list.children.length;
            counter.textContent = newCount;
        }
        
        input.value = '';
        input.focus();
    }

    removeKeyword(type, keyword) {
        const list = document.getElementById(`${type}-list`);
        if (!list) return;
        
        const tag = list.querySelector(`[data-keyword="${keyword}"]`);
        if (tag) {
            tag.remove();
            
            // Mettre à jour le compteur
            const counter = document.querySelector(`.keyword-section:has(#${type}-input) .keyword-count`);
            if (counter) {
                const newCount = list.children.length;
                counter.textContent = newCount;
            }
        }
    }

    addFilter(type, color) {
        const input = document.getElementById(`${type}-input`);
        if (!input?.value.trim()) return;
        
        const item = input.value.trim().toLowerCase();
        const list = document.getElementById(`${type}-list`);
        
        if (!list) return;
        
        // Vérifier si l'élément existe déjà
        const existing = list.querySelector(`[data-item="${item}"]`);
        if (existing) {
            this.showToast('Cet élément existe déjà', 'warning');
            return;
        }
        
        list.insertAdjacentHTML('beforeend', `
            <span class="filter-tag" style="background: ${color}15; color: ${color}" data-item="${item}">
                ${item}
                <button onclick="window.settingsPage.removeFilter('${type}', '${item}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `);
        
        input.value = '';
        input.focus();
    }

    removeFilter(type, item) {
        const list = document.getElementById(`${type}-list`);
        if (!list) return;
        
        const tag = list.querySelector(`[data-item="${item}"]`);
        if (tag) {
            tag.remove();
        }
    }

    saveCategory() {
        if (!this.editingCategoryId) {
            this.showToast('Aucune catégorie en cours d\'édition', 'error');
            return;
        }
        
        try {
            // Collecter les mots-clés
            const keywords = {
                absolute: this.collectItems('absolute-list'),
                strong: this.collectItems('strong-list'),
                weak: this.collectItems('weak-list'),
                exclusions: this.collectItems('exclusions-list')
            };
            
            // Collecter les filtres
            const filters = {
                includeDomains: this.collectItems('includeDomains-list'),
                includeEmails: this.collectItems('includeEmails-list'),
                excludeDomains: this.collectItems('excludeDomains-list'),
                excludeEmails: this.collectItems('excludeEmails-list')
            };
            
            // Sauvegarder via CategoryManager
            window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
            window.categoryManager?.updateCategoryFilters(this.editingCategoryId, filters);
            
            console.log('[SettingsPage] ✅ Catégorie sauvegardée:', {
                id: this.editingCategoryId,
                keywords,
                filters
            });
            
            this.closeModal();
            this.showToast('Catégorie mise à jour avec succès!');
            this.refreshCategoriesTab();
            
        } catch (error) {
            console.error('[SettingsPage] Erreur sauvegarde:', error);
            this.showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    collectItems(listId) {
        const list = document.getElementById(listId);
        if (!list) return [];
        
        const items = [];
        list.querySelectorAll('.keyword-tag, .filter-tag').forEach(tag => {
            const keyword = tag.getAttribute('data-keyword');
            const item = tag.getAttribute('data-item');
            if (keyword) items.push(keyword);
            if (item) items.push(item);
        });
        
        return items;
    }

    confirmDeleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir supprimer définitivement la catégorie "${category.name}" ?\n\nCette action est irréversible et supprimera :\n- Tous les mots-clés\n- Tous les filtres\n- Toutes les configurations\n\nTapez "SUPPRIMER" pour confirmer :`)) {
            const confirmation = prompt('Tapez "SUPPRIMER" en majuscules pour confirmer :');
            if (confirmation === 'SUPPRIMER') {
                this.deleteCategory(categoryId);
            } else {
                this.showToast('Suppression annulée', 'info');
            }
        }
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)) {
            window.categoryManager?.deleteCustomCategory(categoryId);
            this.showToast('Catégorie supprimée');
            this.refreshCategoriesTab();
        }
    }

    exportCategories() {
        const categories = window.categoryManager?.getCategories() || {};
        const data = JSON.stringify(categories, null, 2);
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mailsort-categories-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Catégories exportées');
    }

    closeModal() {
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = 'auto';
        this.currentModal = null;
        this.editingCategoryId = null;
    }

    // ================================================
    // GESTION DU BACKUP
    // ================================================
    async initializeBackupManager() {
        try {
            this.updateBackupStatus('loading', 'Initialisation du système de sauvegarde...');
            await this.backupManager.initialize();
            this.refreshBackupStatus();
        } catch (error) {
            console.error('[SettingsPage] Erreur initialisation backup:', error);
            this.updateBackupStatus('error', 'Système de sauvegarde non disponible - Mode de téléchargement activé');
            
            // Même en cas d'erreur, permettre les sauvegardes par téléchargement
            this.backupManager.hasPermission = true;
            this.backupManager.backupPath = 'Téléchargements du navigateur';
            this.backupManager.isInitialized = true;
        }
    }

    async refreshBackupStatus() {
        if (this.currentTab !== 'backup') return;
        
        try {
            const status = await this.backupManager.getStatus();
            this.updateBackupStatus('ready', `Système de sauvegarde prêt`);
            
            // Afficher le chemin de sauvegarde
            const pathInfo = this.backupManager.backupPath || 'Dossier Téléchargements';
            document.getElementById('backup-path-info').innerHTML = `
                <div class="backup-path-display">
                    <i class="fas fa-folder"></i>
                    <span>Emplacement : ${pathInfo}</span>
                </div>
            `;
            
            this.loadBackupHistory();
        } catch (error) {
            this.updateBackupStatus('ready', 'Mode téléchargement disponible');
            document.getElementById('backup-path-info').innerHTML = `
                <div class="backup-path-display">
                    <i class="fas fa-download"></i>
                    <span>Mode : Téléchargements du navigateur</span>
                </div>
            `;
            this.loadBackupHistory();
        }
    }

    updateBackupStatus(status, message) {
        const statusEl = document.getElementById('backup-status');
        if (!statusEl) return;
        
        const icons = {
            loading: 'fa-spinner fa-spin',
            ready: 'fa-check-circle',
            error: 'fa-exclamation-triangle'
        };
        
        const colors = {
            loading: '#6B7280',
            ready: '#10B981',
            error: '#EF4444'
        };
        
        statusEl.innerHTML = `
            <div class="status-${status}" style="color: ${colors[status]}">
                <i class="fas ${icons[status]}"></i>
                ${message}
            </div>
        `;
    }

    async createBackup() {
        const btn = document.getElementById('backup-btn');
        if (!btn) return;
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';
        btn.disabled = true;
        
        try {
            const result = await this.backupManager.createBackup();
            this.showToast('Sauvegarde créée avec succès!');
            this.loadBackupHistory();
        } catch (error) {
            console.error('[SettingsPage] Erreur backup:', error);
            this.showToast('Erreur lors de la création de la sauvegarde', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    async restoreBackup() {
        try {
            const result = await this.backupManager.selectAndRestoreBackup();
            if (result) {
                this.showToast('Sauvegarde restaurée avec succès!');
                // Recharger la page pour appliquer les changements
                setTimeout(() => location.reload(), 1500);
            }
        } catch (error) {
            console.error('[SettingsPage] Erreur restauration:', error);
            this.showToast('Erreur lors de la restauration', 'error');
        }
    }

    async openBackupFolder() {
        try {
            await this.backupManager.openBackupFolder();
        } catch (error) {
            this.showToast('Impossible d\'ouvrir le dossier de sauvegarde', 'error');
        }
    }

    async loadBackupHistory() {
        const listEl = document.getElementById('backup-list');
        if (!listEl) return;
        
        try {
            const backups = await this.backupManager.getBackupHistory();
            
            if (backups.length === 0) {
                listEl.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>Aucune sauvegarde trouvée</p>
                    </div>
                `;
                return;
            }
            
            listEl.innerHTML = backups.map(backup => `
                <div class="backup-item">
                    <div class="backup-info">
                        <div class="backup-name">${backup.name}</div>
                        <div class="backup-date">${new Date(backup.date).toLocaleString('fr-FR')}</div>
                        <div class="backup-size">${this.formatFileSize(backup.size)}</div>
                    </div>
                    <div class="backup-actions">
                        <button class="btn-small" onclick="window.settingsPage.restoreSpecificBackup('${backup.path}')">
                            <i class="fas fa-undo"></i> Restaurer
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            listEl.innerHTML = '<div class="error">Erreur lors du chargement de l\'historique</div>';
        }
    }

    async restoreSpecificBackup(backupPath) {
        if (!confirm('Êtes-vous sûr de vouloir restaurer cette sauvegarde ?')) return;
        
        try {
            await this.backupManager.restoreFromPath(backupPath);
            this.showToast('Sauvegarde restaurée avec succès!');
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            this.showToast('Erreur lors de la restauration', 'error');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ================================================
    // UTILS
    // ================================================
    refreshCategoriesTab() {
        const categoriesTab = document.getElementById('tab-categories');
        if (categoriesTab && this.currentTab === 'categories') {
            categoriesTab.innerHTML = this.renderCategoriesTab();
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : { 
                activeCategories: null,
                taskPreselectedCategories: []
            };
        } catch (error) {
            return { 
                activeCategories: null,
                taskPreselectedCategories: []
            };
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(settings));
        } catch (error) {
            console.error('[SettingsPage] Erreur sauvegarde:', error);
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    renderError() {
        return `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur de chargement</h3>
                <button class="btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Recharger
                </button>
            </div>
        `;
    }

    // ================================================
    // STYLES MODERNES
    // ================================================
    addStyles() {
        if (document.getElementById('settingsPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'settingsPageStyles';
        styles.textContent = `
            /* Variables CSS */
            .settings-page {
                --primary: #3B82F6;
                --secondary: #6B7280;
                --success: #10B981;
                --warning: #F59E0B;
                --danger: #EF4444;
                --bg: #F9FAFB;
                --surface: #FFFFFF;
                --border: #E5E7EB;
                --text: #111827;
                --text-light: #6B7280;
                --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
                --radius: 12px;
                
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: var(--text);
                background: var(--bg);
                min-height: 100vh;
            }
            
            /* Header */
            .settings-header {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .settings-header h1 {
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 8px 0;
                color: var(--text);
            }
            
            .settings-header p {
                font-size: 16px;
                color: var(--text-light);
                margin: 0;
            }
            
            /* Navigation des onglets */
            .settings-tabs {
                display: flex;
                background: var(--surface);
                border-radius: var(--radius);
                padding: 4px;
                margin-bottom: 24px;
                box-shadow: var(--shadow);
                gap: 4px;
            }
            
            .tab-button {
                flex: 1;
                padding: 12px 20px;
                border: none;
                background: transparent;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-weight: 500;
                color: var(--text-light);
            }
            
            .tab-button:hover {
                background: var(--bg);
                color: var(--text);
            }
            
            .tab-button.active {
                background: var(--primary);
                color: white;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
            }
            
            /* Contenu des onglets */
            .settings-content {
                background: var(--surface);
                border-radius: var(--radius);
                box-shadow: var(--shadow);
                overflow: hidden;
            }
            
            .tab-content {
                display: none;
                padding: 32px;
            }
            
            .tab-content.active {
                display: block;
            }
            
            /* Section catégories */
            .stats-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .stat-card {
                text-align: center;
                padding: 20px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
            }
            
            .stat-number {
                font-size: 28px;
                font-weight: 700;
                color: var(--primary);
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 14px;
                color: var(--text-light);
            }
            
            .categories-actions {
                display: flex;
                gap: 12px;
                margin-bottom: 24px;
            }
            
            .categories-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .category-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
                transition: all 0.2s;
            }
            
            .category-item:hover {
                border-color: var(--primary);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .category-item.inactive {
                opacity: 0.6;
                background: #F5F5F5;
            }
            
            .category-main {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .category-icon {
                width: 48px;
                height: 48px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .category-info h3 {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .category-meta {
                display: flex;
                gap: 12px;
                font-size: 13px;
                color: var(--text-light);
            }
            
            .preselected-badge {
                background: var(--warning);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .category-actions {
                display: flex;
                gap: 8px;
            }
            
            .action-btn {
                width: 36px;
                height: 36px;
                border: 1px solid var(--border);
                background: white;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                color: var(--text-light);
            }
            
            .action-btn:hover {
                border-color: var(--primary);
                color: var(--primary);
            }
            
            .action-btn.active {
                background: var(--success);
                color: white;
                border-color: var(--success);
            }
            
            .action-btn.inactive {
                background: var(--danger);
                color: white;
                border-color: var(--danger);
            }
            
            .action-btn.selected {
                background: var(--warning);
                color: white;
                border-color: var(--warning);
            }
            
            .action-btn.danger:hover {
                background: var(--danger);
                color: white;
                border-color: var(--danger);
            }
            
            /* Section backup */
            .backup-status {
                margin-bottom: 24px;
                padding: 16px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
            }
            
            .backup-actions {
                display: grid;
                gap: 24px;
                margin-bottom: 32px;
            }
            
            .backup-group {
                padding: 20px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
            }
            
            .backup-group h3 {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .backup-group p {
                margin: 0 0 16px 0;
                color: var(--text-light);
                font-size: 14px;
            }
            
            .backup-history h3 {
                margin: 0 0 16px 0;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .backup-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
                margin-bottom: 8px;
            }
            
            .backup-info {
                flex: 1;
            }
            
            .backup-name {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .backup-date {
                font-size: 13px;
                color: var(--text-light);
            }
            
            .backup-size {
                font-size: 12px;
                color: var(--text-light);
            }
            
            /* Boutons */
            .btn-primary, .btn-secondary, .btn-small {
                padding: 10px 16px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                font-size: 14px;
            }
            
            .btn-primary {
                background: var(--primary);
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563EB;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-secondary {
                background: var(--bg);
                color: var(--text);
                border: 1px solid var(--border);
            }
            
            .btn-secondary:hover {
                background: white;
                border-color: var(--primary);
            }
            
            .btn-small {
                padding: 6px 12px;
                font-size: 12px;
                background: var(--primary);
                color: white;
            }
            
            .btn-small:hover {
                background: #2563EB;
            }
            
            /* Modal */
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
                padding: 20px;
            }
            
            .modal-simple {
                background: white;
                border-radius: var(--radius);
                width: 100%;
                max-width: 500px;
                box-shadow: var(--shadow-lg);
                overflow: hidden;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-close {
                width: 32px;
                height: 32px;
                border: none;
                background: var(--bg);
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-close:hover {
                background: var(--danger);
                color: white;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: var(--text);
            }
            
            .form-group input {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid var(--border);
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .icon-selector, .color-selector {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
                gap: 8px;
            }
            
            .icon-option {
                width: 40px;
                height: 40px;
                border: 1px solid var(--border);
                background: white;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                transition: all 0.2s;
            }
            
            .icon-option:hover {
                border-color: var(--primary);
            }
            
            .icon-option.selected {
                border-color: var(--primary);
                background: rgba(59, 130, 246, 0.1);
            }
            
            .color-option {
                width: 40px;
                height: 40px;
                border: 2px solid transparent;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }
            
            .color-option:hover {
                transform: scale(1.1);
            }
            
            .color-option.selected {
                border-color: var(--text);
            }
            
            .color-option.selected::after {
                content: '✓';
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid var(--border);
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            /* États vides */
            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: var(--text-light);
            }
            
            .empty-state i {
                font-size: 48px;
                margin-bottom: 16px;
                display: block;
            }
            
            .empty-state h3 {
                margin: 0 0 8px 0;
                color: var(--text);
            }
            
            .error-state {
                text-align: center;
                padding: 40px 20px;
            }
            
            .error-state i {
                font-size: 48px;
                color: var(--danger);
                margin-bottom: 16px;
                display: block;
            }
            
            /* Modal d'édition */
            .modal-edit {
                background: white;
                border-radius: var(--radius);
                width: 100%;
                max-width: 800px;
                max-height: 90vh;
                box-shadow: var(--shadow-lg);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .modal-tabs {
                display: flex;
                background: var(--bg);
                border-bottom: 1px solid var(--border);
                padding: 0 20px;
            }
            
            .tab-btn {
                padding: 12px 20px;
                border: none;
                background: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text-light);
                font-weight: 500;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }
            
            .tab-btn:hover {
                color: var(--text);
                background: white;
            }
            
            .tab-btn.active {
                color: var(--primary);
                border-bottom-color: var(--primary);
                background: white;
            }
            
            .edit-tab-content {
                display: none;
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .edit-tab-content.active {
                display: block;
            }
            
            /* Layout des mots-clés */
            .keywords-layout {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .keyword-section {
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 20px;
            }
            
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .section-header h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .keyword-count {
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .section-description {
                margin: 0 0 16px 0;
                font-size: 13px;
                color: var(--text-light);
                line-height: 1.4;
            }
            
            .input-group {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .input-group input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid var(--border);
                border-radius: 6px;
                font-size: 14px;
            }
            
            .input-group input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }
            
            .btn-add {
                width: 36px;
                height: 36px;
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .btn-add:hover {
                transform: scale(1.05);
            }
            
            .keywords-list, .filters-list {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                min-height: 40px;
            }
            
            .keyword-tag, .filter-tag {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 16px;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .keyword-tag button, .filter-tag button {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                padding: 2px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .keyword-tag button:hover, .filter-tag button:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.2);
            }
            
            /* Layout des filtres */
            .filters-layout {
                display: grid;
                gap: 24px;
            }
            
            .filter-group {
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 20px;
            }
            
            .filter-group h3 {
                margin: 0 0 20px 0;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text);
            }
            
            .filter-section {
                margin-bottom: 20px;
            }
            
            .filter-section:last-child {
                margin-bottom: 0;
            }
            
            .filter-section h4 {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text);
            }
            
            /* Zone de danger */
            .settings-section {
                max-width: 500px;
            }
            
            .danger-zone {
                background: var(--danger)05;
                border: 2px solid var(--danger)20;
                border-radius: var(--radius);
                padding: 20px;
            }
            
            .danger-zone h3 {
                margin: 0 0 8px 0;
                color: var(--danger);
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .danger-zone p {
                margin: 0 0 16px 0;
                color: var(--text-light);
                font-size: 14px;
                line-height: 1.4;
            }
            
            /* Informations de backup */
            .backup-path-info {
                margin-bottom: 24px;
                padding: 16px;
                background: var(--bg);
                border-radius: var(--radius);
                border: 1px solid var(--border);
            }
            
            .backup-path-display {
                display: flex;
                align-items: center;
                gap: 12px;
                color: var(--text);
                font-weight: 500;
            }
            
            .folder-status {
                background: var(--primary)05;
                border: 1px solid var(--primary)20;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 20px;
            }
            
            .folder-status p {
                margin: 0;
                font-size: 13px;
                color: var(--primary);
                display: flex;
                align-items: flex-start;
                gap: 8px;
                line-height: 1.4;
            }
            
            .folder-status i {
                margin-top: 2px;
                flex-shrink: 0;
            }
            
            .folder-troubleshooting {
                background: var(--warning)05;
                border: 1px solid var(--warning)20;
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .folder-troubleshooting h4 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--warning);
            }
            
            .folder-troubleshooting ul {
                margin: 0;
                padding-left: 20px;
            }
            
            .folder-troubleshooting li {
                margin-bottom: 6px;
                font-size: 13px;
                color: var(--text-light);
            }
            
            .folder-troubleshooting strong {
                color: var(--text);
            }
            .backup-notification {
                position: fixed;
                top: 24px;
                right: 24px;
                background: white;
                border: 1px solid var(--border);
                border-radius: var(--radius);
                box-shadow: var(--shadow-lg);
                z-index: 1500;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            
            .notification-content {
                padding: 16px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }
            
            .notification-content i {
                color: var(--primary);
                font-size: 20px;
                margin-top: 2px;
            }
            
            .notification-content > div {
                flex: 1;
            }
            
            .notification-content strong {
                display: block;
                margin-bottom: 4px;
                color: var(--text);
            }
            
            .notification-content p {
                margin: 0;
                font-size: 13px;
                color: var(--text-light);
                word-break: break-all;
            }
            
            .notification-content button {
                background: none;
                border: none;
                color: var(--text-light);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .notification-content button:hover {
                background: var(--bg);
                color: var(--text);
            }
            
            /* Modal de permissions */
            .permission-modal .modal-simple {
                max-width: 600px;
            }
            
            .permission-info {
                display: flex;
                gap: 20px;
                align-items: flex-start;
            }
            
            .permission-icon {
                background: var(--primary)10;
                border-radius: 12px;
                padding: 20px;
                color: var(--primary);
                font-size: 32px;
                flex-shrink: 0;
            }
            
            .permission-content h3 {
                margin: 0 0 12px 0;
                color: var(--text);
                font-size: 18px;
            }
            
            .permission-content > p {
                margin: 0 0 20px 0;
                color: var(--text-light);
                line-height: 1.5;
            }
            
            .permission-details,
            .permission-benefits,
            .permission-security {
                margin-bottom: 20px;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid var(--border);
            }
            
            .permission-details {
                background: var(--bg);
            }
            
            .permission-benefits {
                background: var(--success)05;
                border-color: var(--success)20;
            }
            
            .permission-security {
                background: var(--primary)05;
                border-color: var(--primary)20;
            }
            
            .permission-details h4,
            .permission-benefits h4 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
            }
            
            .permission-details ul,
            .permission-benefits ul {
                margin: 0;
                padding-left: 20px;
            }
            
            .permission-details li {
                margin-bottom: 4px;
                font-size: 13px;
                color: var(--text-light);
            }
            
            .permission-benefits li {
                margin-bottom: 4px;
                font-size: 13px;
                color: var(--success);
            }
            
            .permission-details code {
                background: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
                border: 1px solid var(--border);
                word-break: break-all;
            }
            
            .permission-security p {
                margin: 0;
                font-size: 13px;
                color: var(--primary);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* Modal d'informations de dossier */
            .folder-info {
                display: flex;
                gap: 20px;
                align-items: flex-start;
            }
            
            .folder-icon {
                background: var(--warning)10;
                border-radius: 12px;
                padding: 20px;
                color: var(--warning);
                font-size: 32px;
                flex-shrink: 0;
            }
            
            .folder-details h3 {
                margin: 0 0 12px 0;
                color: var(--text);
            }
            
            .folder-path {
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 20px;
                padding: 12px;
                background: var(--bg);
                border-radius: 6px;
                border: 1px solid var(--border);
            }
            
            .folder-path code {
                flex: 1;
                background: none;
                border: none;
                padding: 0;
                font-size: 13px;
                word-break: break-all;
                color: var(--text);
            }
            
            .btn-copy {
                background: var(--primary);
                color: white;
                border: none;
                padding: 6px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            
            .btn-copy:hover {
                background: #2563EB;
            }
            
            .folder-instructions,
            .folder-alternatives {
                margin-bottom: 20px;
            }
            
            .folder-instructions h4,
            .folder-alternatives h4 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--text);
            }
            
            .folder-instructions ol,
            .folder-alternatives ul {
                margin: 0;
                padding-left: 20px;
            }
            
            .folder-instructions li,
            .folder-alternatives li {
                margin-bottom: 4px;
                font-size: 13px;
                color: var(--text-light);
            }
            
            kbd {
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: 3px;
                padding: 2px 6px;
                font-size: 11px;
                font-family: monospace;
            }
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: var(--text);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: var(--shadow-lg);
                z-index: 2000;
                transform: translateY(100px);
                transition: transform 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
                max-width: 400px;
            }
            
            .toast.show {
                transform: translateY(0);
            }
            
            .toast.success {
                background: var(--success);
            }
            
            .toast.error {
                background: var(--danger);
            }
            
            .toast.info {
                background: var(--primary);
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .settings-page {
                    padding: 16px;
                }
                
                .tab-content {
                    padding: 20px;
                }
                
                .stats-row {
                    grid-template-columns: 1fr;
                }
                
                .categories-actions {
                    flex-direction: column;
                }
                
                .category-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 16px;
                }
                
                .category-actions {
                    justify-content: center;
                }
                
                .backup-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// ================================================
// GESTIONNAIRE DE BACKUP LOCAL INTELLIGENT
// ================================================
class BackupManager {
    constructor() {
        this.backupPath = null;
        this.backupHandle = null;
        this.isInitialized = false;
        this.hasPermission = false;
        this.detectedPaths = [];
    }

    async initialize() {
        try {
            console.log('[BackupManager] 🔍 Détection intelligente des dossiers...');
            
            // Vérifier les permissions déjà accordées
            const savedPath = localStorage.getItem('mailsort-backup-path');
            const hasPermission = localStorage.getItem('mailsort-backup-permission') === 'granted';
            
            if (savedPath && hasPermission) {
                this.backupPath = savedPath;
                this.hasPermission = true;
                this.isInitialized = true;
                console.log('[BackupManager] ✅ Utilisation du chemin sauvegardé:', this.backupPath);
                return;
            }

            // Détecter les chemins disponibles selon l'environnement
            await this.detectAvailablePaths();
            
            // Mode simplifié : toujours utiliser le fallback avec téléchargements
            await this.initializeFallback();

            this.isInitialized = true;
            console.log('[BackupManager] ✅ Initialisé avec le chemin:', this.backupPath);
        } catch (error) {
            console.error('[BackupManager] ❌ Erreur d\'initialisation:', error);
            // Même en cas d'erreur, initialiser en mode fallback
            this.backupPath = 'Dossier Téléchargements';
            this.hasPermission = true;
            this.isInitialized = true;
        }
    }

    async detectAvailablePaths() {
        this.detectedPaths = [];
        
        // Détecter le vrai nom d'utilisateur
        const realUsername = await this.detectRealUsername();
        
        // Chemins communs selon l'OS avec le vrai nom d'utilisateur
        const commonPaths = {
            windows: [
                `C:\\Users\\${realUsername}\\Documents\\MailSort Pro`,
                `C:\\Users\\${realUsername}\\Desktop\\MailSort Pro`,
                `C:\\Users\\${realUsername}\\Downloads\\MailSort Pro`,
                `C:\\MailSort Pro`,
                `C:\\Users\\${realUsername}\\AppData\\Roaming\\MailSort Pro`
            ],
            mac: [
                `/Users/${realUsername}/Documents/MailSort Pro`,
                `/Users/${realUsername}/Desktop/MailSort Pro`,
                `/Users/${realUsername}/Downloads/MailSort Pro`,
                '/Applications/MailSort Pro'
            ],
            linux: [
                `/home/${realUsername}/Documents/MailSort Pro`,
                `/home/${realUsername}/Desktop/MailSort Pro`,
                `/home/${realUsername}/Downloads/MailSort Pro`,
                '/opt/MailSort Pro'
            ]
        };

        // Détecter l'OS
        const platform = this.detectPlatform();
        const paths = commonPaths[platform] || commonPaths.windows;
        
        this.detectedPaths = paths;
        
        console.log('[BackupManager] 🗂️ Chemins détectés pour', platform, 'utilisateur:', realUsername);
        console.log('[BackupManager] 📁 Chemins:', this.detectedPaths);
    }

    async detectRealUsername() {
        try {
            // Méthode 1: Tenter de détecter via les APIs disponibles
            if (window.electronAPI && window.electronAPI.getUsername) {
                const username = await window.electronAPI.getUsername();
                if (username) return username;
            }

            // Méthode 2: Utiliser l'API utilisateur Microsoft si connecté
            if (window.authService && window.authService.isAuthenticated()) {
                try {
                    const userInfo = await window.authService.getUserInfo();
                    if (userInfo && userInfo.userPrincipalName) {
                        // Extraire le nom d'utilisateur de l'email
                        const emailPart = userInfo.userPrincipalName.split('@')[0];
                        const cleanUsername = emailPart.replace(/[^a-zA-Z0-9]/g, '');
                        if (cleanUsername) return cleanUsername;
                    }
                    if (userInfo && userInfo.displayName) {
                        // Utiliser le nom d'affichage comme fallback
                        const cleanName = userInfo.displayName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
                        if (cleanName) return cleanName;
                    }
                } catch (error) {
                    console.log('[BackupManager] Info utilisateur non disponible');
                }
            }

            // Méthode 3: Tenter via les variables d'environnement simulées
            const platform = this.detectPlatform();
            if (platform === 'windows') {
                // Approximations courantes Windows
                const commonUsernames = ['User', 'Admin', 'Administrator', process.env?.USERNAME || 'User'];
                return commonUsernames[0];
            } else if (platform === 'mac' || platform === 'linux') {
                return process.env?.USER || 'user';
            }

            // Fallback par défaut
            return 'User';
            
        } catch (error) {
            console.error('[BackupManager] Erreur détection nom utilisateur:', error);
            return 'User';
        }
    }

    // Méthode pour tester l'existence d'un dossier (quand possible)
    async testFolderExists(path) {
        try {
            if (window.electronAPI && window.electronAPI.checkFolderExists) {
                return await window.electronAPI.checkFolderExists(path);
            }
            
            // En environnement web, on ne peut pas tester l'existence
            // On retourne true par défaut
            return true;
        } catch (error) {
            return false;
        }
    }

    // Méthode améliorée pour obtenir le meilleur chemin
    async getBestAvailablePath() {
        for (const path of this.detectedPaths) {
            const exists = await this.testFolderExists(path);
            if (exists) {
                console.log('[BackupManager] ✅ Dossier existant trouvé:', path);
                return path;
            }
        }
        
        // Si aucun dossier n'existe, retourner le premier (Documents)
        console.log('[BackupManager] 📁 Utilisation du chemin par défaut:', this.detectedPaths[0]);
        return this.detectedPaths[0];
    }

    detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('win')) return 'windows';
        if (userAgent.includes('mac')) return 'mac';
        if (userAgent.includes('linux')) return 'linux';
        return 'windows'; // Défaut
    }

    resolvePath(path) {
        if (typeof window !== 'undefined') {
            // En environnement web, approximation des variables
            if (path.includes('%USERPROFILE%')) {
                // Approximation du profil utilisateur
                const username = 'User'; // Ou récupérer depuis une autre source
                return path.replace('%USERPROFILE%', `C:\\Users\\${username}`);
            }
            if (path.includes('%APPDATA%')) {
                const username = 'User';
                return path.replace('%APPDATA%', `C:\\Users\\${username}\\AppData\\Roaming`);
            }
            if (path.includes('~')) {
                return path.replace('~', '/Users/User'); // Approximation macOS/Linux
            }
        }
        return path;
    }

    async initializeElectron() {
        try {
            // Dans un vrai environnement Electron
            this.backupPath = await window.electronAPI.setupBackupFolder();
            this.hasPermission = true;
            this.savePermissions();
        } catch (error) {
            console.error('[BackupManager] Erreur Electron:', error);
            throw error;
        }
    }

    async initializeFileSystemAPI() {
        try {
            // Demander l'autorisation à l'utilisateur pour choisir/créer le dossier
            const needsPermission = !localStorage.getItem('mailsort-backup-permission');
            
            if (needsPermission) {
                const userChoice = await this.requestUserPermission();
                if (!userChoice) {
                    throw new Error('Permission refusée par l\'utilisateur');
                }
            }

            // Utiliser l'API File System Access pour sélectionner/créer le dossier
            this.backupHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            this.backupPath = this.backupHandle.name;
            this.hasPermission = true;
            this.savePermissions();

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Sélection du dossier annulée');
            }
            console.error('[BackupManager] Erreur File System API:', error);
            await this.initializeFallback();
        }
    }

    async initializeFallback() {
        // Mode de fallback : utiliser le meilleur chemin détecté
        console.log('[BackupManager] 🔄 Mode de fallback activé');
        
        this.backupPath = await this.getBestAvailablePath();
        this.hasPermission = true; // Pas de vraie permission nécessaire en fallback
        
        // Informer l'utilisateur avec le vrai chemin
        this.showPermissionDialog();
        this.savePermissions();
    }

    async requestUserPermission() {
        return new Promise((resolve) => {
            const modal = this.createPermissionModal(resolve);
            document.body.appendChild(modal);
        });
    }

    createPermissionModal(callback) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop permission-modal';
        modal.innerHTML = `
            <div class="modal-simple permission-dialog">
                <div class="modal-header">
                    <h2><i class="fas fa-shield-alt"></i> Autorisation de sauvegarde</h2>
                </div>
                
                <div class="modal-body">
                    <div class="permission-info">
                        <div class="permission-icon">
                            <i class="fas fa-folder-plus"></i>
                        </div>
                        <div class="permission-content">
                            <h3>MailSort Pro souhaite créer un dossier de sauvegarde</h3>
                            <p>Pour sauvegarder vos catégories et paramètres de manière sécurisée, nous avons besoin de créer un dossier dédié.</p>
                            
                            <div class="permission-details">
                                <h4>📍 Emplacements suggérés :</h4>
                                <ul>
                                    ${this.detectedPaths.slice(0, 3).map(path => 
                                        `<li><code>${path}</code></li>`
                                    ).join('')}
                                </ul>
                            </div>
                            
                            <div class="permission-benefits">
                                <h4>✅ Avantages :</h4>
                                <ul>
                                    <li>Sauvegarde automatique de vos données</li>
                                    <li>Restauration facile en cas de problème</li>
                                    <li>Export/import entre appareils</li>
                                    <li>Historique des versions</li>
                                </ul>
                            </div>
                            
                            <div class="permission-security">
                                <p><i class="fas fa-lock"></i> <strong>Sécurité :</strong> Toutes les données restent locales sur votre appareil. Aucune information n'est envoyée vers des serveurs externes.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.permission-modal').remove(); window.settingsPage.backupManager.handlePermissionResponse(false);">
                        <i class="fas fa-times"></i> Refuser
                    </button>
                    <button class="btn-primary" onclick="this.closest('.permission-modal').remove(); window.settingsPage.backupManager.handlePermissionResponse(true);">
                        <i class="fas fa-check"></i> Autoriser la création
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    handlePermissionResponse(granted) {
        this.permissionCallback?.(granted);
    }

    showPermissionDialog() {
        // Afficher une notification discrète sur l'état du backup
        const notification = document.createElement('div');
        notification.className = 'backup-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-info-circle"></i>
                <div>
                    <strong>Système de sauvegarde activé</strong>
                    <p>Dossier de sauvegarde : ${this.backupPath}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Auto-suppression après 5 secondes
        setTimeout(() => notification.remove(), 5000);
    }

    savePermissions() {
        localStorage.setItem('mailsort-backup-path', this.backupPath);
        localStorage.setItem('mailsort-backup-permission', 'granted');
        localStorage.setItem('mailsort-backup-timestamp', new Date().toISOString());
    }

    async setupWebBackupPath() {
        // Cette méthode n'est plus utilisée, remplacée par la détection intelligente
        return this.detectedPaths[0];
    }

    async getStatus() {
        if (!this.isInitialized) {
            throw new Error('BackupManager non initialisé');
        }

        return {
            backupPath: this.backupPath,
            isReady: true
        };
    }

    async createBackup() {
        if (!this.hasPermission) {
            throw new Error('Permissions de sauvegarde non accordées');
        }

        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            categories: window.categoryManager?.getCategories() || {},
            settings: JSON.parse(localStorage.getItem('categorySettings') || '{}'),
            emails: window.emailScanner?.getAllEmails()?.slice(0, 1000) || [], // Limiter pour la taille
            metadata: {
                totalEmails: window.emailScanner?.getAllEmails()?.length || 0,
                createdAt: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: this.detectPlatform(),
                backupPath: this.backupPath
            }
        };

        const filename = `mailsort-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        try {
            // Tenter d'utiliser l'API File System Access si disponible
            if (this.backupHandle && window.showDirectoryPicker) {
                await this.saveToFileSystem(filename, backupData);
            } else {
                // Fallback : téléchargement classique
                await this.saveAsDownload(filename, backupData);
            }

            // Enregistrer dans l'historique
            this.saveBackupRecord(filename, JSON.stringify(backupData).length);

            return { filename, size: JSON.stringify(backupData).length };
        } catch (error) {
            console.error('[BackupManager] Erreur lors de la sauvegarde:', error);
            throw error;
        }
    }

    async saveToFileSystem(filename, backupData) {
        try {
            // Créer le fichier dans le dossier sélectionné
            const fileHandle = await this.backupHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            
            await writable.write(JSON.stringify(backupData, null, 2));
            await writable.close();
            
            console.log('[BackupManager] ✅ Sauvegarde créée dans le dossier système:', filename);
        } catch (error) {
            console.warn('[BackupManager] ⚠️ Échec sauvegarde système, utilisation du téléchargement');
            await this.saveAsDownload(filename, backupData);
        }
    }

    async saveAsDownload(filename, backupData) {
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('[BackupManager] ✅ Sauvegarde téléchargée:', filename);
    }

    saveBackupRecord(filename, size) {
        const backups = JSON.parse(localStorage.getItem('mailsort-backups') || '[]');
        backups.unshift({
            name: filename,
            date: new Date().toISOString(),
            size: size,
            path: `${this.backupPath}\\${filename}`
        });
        
        // Garder seulement les 10 dernières sauvegardes
        backups.splice(10);
        
        localStorage.setItem('mailsort-backups', JSON.stringify(backups));
    }

    async getBackupHistory() {
        const backups = JSON.parse(localStorage.getItem('mailsort-backups') || '[]');
        return backups;
    }

    async selectAndRestoreBackup() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    resolve(false);
                    return;
                }
                
                try {
                    const text = await file.text();
                    const backupData = JSON.parse(text);
                    await this.restoreFromData(backupData);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            input.click();
        });
    }

    async restoreFromPath(path) {
        // Dans un environnement réel, on lirait le fichier depuis le chemin
        throw new Error('Restauration depuis un chemin non implémentée dans cette version de démonstration');
    }

    async restoreFromData(backupData) {
        try {
            // Restaurer les catégories
            if (backupData.categories && window.categoryManager) {
                Object.entries(backupData.categories).forEach(([id, category]) => {
                    if (category.isCustom) {
                        window.categoryManager.createCustomCategory(category);
                    }
                });
            }

            // Restaurer les paramètres
            if (backupData.settings) {
                localStorage.setItem('categorySettings', JSON.stringify(backupData.settings));
            }

            console.log('[BackupManager] Sauvegarde restaurée avec succès');
        } catch (error) {
            console.error('[BackupManager] Erreur lors de la restauration:', error);
            throw error;
        }
    }

    async openBackupFolder() {
        if (!this.hasPermission) {
            throw new Error('Aucun dossier de sauvegarde configuré');
        }

        if (window.electronAPI) {
            // Environnement Electron
            await window.electronAPI.openBackupFolder();
        } else if (this.backupHandle) {
            // File System Access API - Ouvrir le dossier
            try {
                // Malheureusement, l'API File System Access ne permet pas d'ouvrir directement le dossier
                // On affiche une information à l'utilisateur
                this.showFolderInfo();
            } catch (error) {
                this.showFolderInfo();
            }
        } else {
            // Fallback - Afficher les informations du dossier
            this.showFolderInfo();
        }
    }

    showFolderInfo() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-simple">
                <div class="modal-header">
                    <h2><i class="fas fa-folder-open"></i> Dossier de sauvegarde</h2>
                    <button class="btn-close" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="folder-info">
                        <div class="folder-icon">
                            <i class="fas fa-folder"></i>
                        </div>
                        <div class="folder-details">
                            <h3>Emplacement de sauvegarde</h3>
                            <div class="folder-path">
                                <code>${this.backupPath}</code>
                                <button class="btn-copy" onclick="navigator.clipboard.writeText('${this.backupPath.replace(/\\/g, '\\\\')}'); this.innerHTML='<i class=\\"fas fa-check\\"></i> Copié!';">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            
                            <div class="folder-status">
                                <p><i class="fas fa-info-circle"></i> <strong>Information :</strong> Ce chemin correspond à votre dossier Documents personnel. Si le dossier "MailSort Pro" n'existe pas encore, il sera créé automatiquement lors de la première sauvegarde.</p>
                            </div>
                            
                            <div class="folder-instructions">
                                <h4>📁 Pour accéder manuellement :</h4>
                                <ol>
                                    <li>Ouvrez l'Explorateur de fichiers (raccourci : <kbd>Win + E</kbd>)</li>
                                    <li>Cliquez dans la barre d'adresse en haut</li>
                                    <li>Collez le chemin ci-dessus</li>
                                    <li>Appuyez sur <kbd>Entrée</kbd></li>
                                </ol>
                            </div>
                            
                            <div class="folder-alternatives">
                                <h4>🔧 Méthodes alternatives :</h4>
                                <ul>
                                    <li>Utilisez <kbd>Win + R</kbd>, collez le chemin et appuyez sur <kbd>Entrée</kbd></li>
                                    <li>Ouvrez votre dossier Documents et cherchez "MailSort Pro"</li>
                                    <li>Utilisez la recherche Windows avec "MailSort Pro"</li>
                                    <li>Vérifiez aussi dans Téléchargements si les sauvegardes s'y trouvent</li>
                                </ul>
                            </div>
                            
                            <div class="folder-troubleshooting">
                                <h4>🔧 Dépannage :</h4>
                                <ul>
                                    <li><strong>Dossier introuvable ?</strong> Le dossier sera créé automatiquement lors de la première sauvegarde</li>
                                    <li><strong>Accès refusé ?</strong> Vérifiez que vous avez les droits sur votre dossier Documents</li>
                                    <li><strong>Chemin invalide ?</strong> Les sauvegardes iront dans le dossier Téléchargements par défaut</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-backdrop').remove(); window.settingsPage.backupManager.resetPermissions(); window.settingsPage.initializeBackupManager();">
                        <i class="fas fa-redo"></i> Reconfigurer
                    </button>
                    <button class="btn-primary" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-check"></i> Compris
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Méthode pour réinitialiser les permissions (utile pour les tests)
    async resetPermissions() {
        localStorage.removeItem('mailsort-backup-path');
        localStorage.removeItem('mailsort-backup-permission');
        localStorage.removeItem('mailsort-backup-timestamp');
        
        this.backupPath = null;
        this.backupHandle = null;
        this.hasPermission = false;
        this.isInitialized = false;
        
        console.log('[BackupManager] 🔄 Permissions réinitialisées');
    }

    // Méthode pour obtenir les informations détaillées
    getDetailedStatus() {
        return {
            isInitialized: this.isInitialized,
            hasPermission: this.hasPermission,
            backupPath: this.backupPath,
            detectedPaths: this.detectedPaths,
            platform: this.detectPlatform(),
            apiSupport: {
                electron: !!window.electronAPI,
                fileSystemAccess: !!window.showDirectoryPicker,
                fallback: !window.electronAPI && !window.showDirectoryPicker
            },
            lastPermissionDate: localStorage.getItem('mailsort-backup-timestamp')
        };
    }
}

// ================================================
// INTÉGRATION GLOBALE
// ================================================
window.settingsPage = new SettingsPageSimple();

// Intégration avec PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.settingsPage.render(container);
    };
}

console.log('[SettingsPage] ✅ SettingsPage Simplifiée chargée avec BackupManager!');
