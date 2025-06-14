// CategoriesPage.js - Version ultra-minimaliste et moderne

class CategoriesPage {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.viewMode = 'grid'; // 'grid' ou 'list'
        console.log('[CategoriesPage] ✅ Interface minimaliste initialisée');
    }

    // ================================================
    // RENDU PRINCIPAL
    // ================================================
    render(container) {
        if (!container) return;

        try {
            const categories = window.categoryManager?.getCategories() || {};
            const settings = this.loadSettings();
            
            container.innerHTML = `
                <div class="categories-minimal">
                    <!-- Header épuré -->
                    <div class="header-minimal">
                        <div>
                            <h1>Catégories</h1>
                            <p class="header-subtitle">Gérez vos règles de détection d'emails</p>
                        </div>
                        <button class="btn-add" onclick="window.categoriesPage.showCreateModal()" title="Nouvelle catégorie">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <!-- Barre de contrôle -->
                    <div class="control-bar">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   placeholder="Rechercher une catégorie..." 
                                   onkeyup="window.categoriesPage.handleSearch(this.value)">
                        </div>
                        
                        <div class="view-toggle">
                            <button class="${this.viewMode === 'grid' ? 'active' : ''}" 
                                    onclick="window.categoriesPage.setViewMode('grid')" 
                                    title="Vue grille">
                                <i class="fas fa-th"></i>
                            </button>
                            <button class="${this.viewMode === 'list' ? 'active' : ''}" 
                                    onclick="window.categoriesPage.setViewMode('list')" 
                                    title="Vue liste">
                                <i class="fas fa-bars"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Stats rapides -->
                    <div class="quick-stats">
                        <div class="stat-item">
                            <span class="stat-number">${Object.keys(categories).length}</span>
                            <span class="stat-label">catégories</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getActiveCount(categories, settings.activeCategories)}</span>
                            <span class="stat-label">actives</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getTotalKeywords(categories)}</span>
                            <span class="stat-label">mots-clés</span>
                        </div>
                    </div>
                    
                    <!-- Catégories -->
                    <div class="categories-container ${this.viewMode}" id="categories-container">
                        ${this.renderCategories(categories, settings.activeCategories)}
                    </div>
                </div>
            `;
            
            this.addStyles();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur:', error);
            container.innerHTML = this.renderError();
        }
    }

    // ================================================
    // RENDU DES CATÉGORIES
    // ================================================
    renderCategories(categories, activeCategories) {
        const filtered = this.filterCategories(categories);
        
        if (Object.keys(filtered).length === 0) {
            return `
                <div class="empty-state-minimal">
                    <i class="fas fa-search"></i>
                    <p>Aucune catégorie trouvée</p>
                </div>
            `;
        }
        
        return Object.entries(filtered)
            .map(([id, category]) => this.viewMode === 'grid' 
                ? this.renderGridCard(id, category, activeCategories)
                : this.renderListItem(id, category, activeCategories)
            ).join('');
    }

    // Vue grille compacte
    renderGridCard(id, category, activeCategories) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        const stats = this.getCategoryStats(id);
        
        return `
            <div class="cat-card ${!isActive ? 'inactive' : ''}" data-id="${id}">
                <div class="cat-icon" style="background: ${category.color}20; color: ${category.color}">
                    ${category.icon}
                </div>
                
                <div class="cat-info">
                    <h3>${category.name}</h3>
                    <div class="cat-meta">
                        <span class="meta-item" title="Mots-clés">
                            <i class="fas fa-key"></i> ${stats.keywords}
                        </span>
                        ${stats.absolute > 0 ? `
                            <span class="meta-item highlight" title="Mots-clés absolus">
                                <i class="fas fa-star"></i> ${stats.absolute}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="cat-actions">
                    <button class="btn-toggle ${isActive ? 'active' : ''}" 
                            onclick="window.categoriesPage.toggleCategory('${id}')"
                            title="${isActive ? 'Désactiver' : 'Activer'}">
                        <i class="fas fa-power-off"></i>
                    </button>
                    <button class="btn-config" 
                            onclick="window.categoriesPage.openModal('${id}')"
                            title="Configurer">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Vue liste ultra-compacte
    renderListItem(id, category, activeCategories) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        const stats = this.getCategoryStats(id);
        
        return `
            <div class="cat-list-item ${!isActive ? 'inactive' : ''}" data-id="${id}">
                <div class="list-icon" style="background: ${category.color}20; color: ${category.color}">
                    ${category.icon}
                </div>
                
                <div class="list-info">
                    <span class="list-name">${category.name}</span>
                    <span class="list-stats">
                        ${stats.keywords} mots-clés
                        ${stats.absolute > 0 ? `• <strong>${stats.absolute} absolus</strong>` : ''}
                    </span>
                </div>
                
                <div class="list-actions">
                    <button class="btn-mini ${isActive ? 'active' : ''}" 
                            onclick="window.categoriesPage.toggleCategory('${id}')"
                            title="${isActive ? 'Actif' : 'Inactif'}">
                        <i class="fas fa-circle"></i>
                    </button>
                    <button class="btn-mini" 
                            onclick="window.categoriesPage.openModal('${id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // MODAL SIMPLIFIÉE
    // ================================================
    openModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        this.closeModal();
        this.editingCategoryId = categoryId;
        
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        const modalHTML = `
            <div class="modal-minimal" onclick="if(event.target === this) window.categoriesPage.closeModal()">
                <div class="modal-content">
                    <!-- Header minimal -->
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-category-icon" style="background: ${category.color}20; color: ${category.color}">
                                ${category.icon}
                            </span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Tabs simples -->
                    <div class="modal-tabs">
                        <button class="tab active" data-tab="keywords" onclick="window.categoriesPage.switchTab('keywords')">
                            Mots-clés
                        </button>
                        <button class="tab" data-tab="filters" onclick="window.categoriesPage.switchTab('filters')">
                            Filtres
                        </button>
                        ${category.isCustom ? `
                            <button class="tab" data-tab="settings" onclick="window.categoriesPage.switchTab('settings')">
                                Paramètres
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Contenu des tabs -->
                    <div class="modal-body">
                        <!-- Tab Mots-clés -->
                        <div class="tab-content active" id="tab-keywords">
                            <div class="keyword-grid">
                                ${this.renderKeywordSection('absolute', 'Absolus', keywords.absolute, '#ef4444', 'Déclenche toujours')}
                                ${this.renderKeywordSection('strong', 'Forts', keywords.strong, '#f59e0b', 'Poids élevé')}
                                ${this.renderKeywordSection('weak', 'Faibles', keywords.weak, '#3b82f6', 'Poids modéré')}
                                ${this.renderKeywordSection('exclusions', 'Exclusions', keywords.exclusions, '#6b7280', 'Empêche la détection')}
                            </div>
                        </div>
                        
                        <!-- Tab Filtres -->
                        <div class="tab-content" id="tab-filters">
                            <div class="filters-simple">
                                <div class="filter-section">
                                    <h4><i class="fas fa-plus-circle"></i> Inclure ces domaines</h4>
                                    <div class="input-group">
                                        <input type="text" id="include-domain" placeholder="exemple.com">
                                        <button onclick="window.categoriesPage.addFilter('includeDomains')">+</button>
                                    </div>
                                    <div class="items" id="includeDomains-items"></div>
                                </div>
                                
                                <div class="filter-section">
                                    <h4><i class="fas fa-envelope"></i> Inclure ces emails</h4>
                                    <div class="input-group">
                                        <input type="text" id="include-email" placeholder="contact@exemple.com">
                                        <button onclick="window.categoriesPage.addFilter('includeEmails')">+</button>
                                    </div>
                                    <div class="items" id="includeEmails-items"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab Paramètres -->
                        ${category.isCustom ? `
                            <div class="tab-content" id="tab-settings">
                                <div class="settings-simple">
                                    <button class="btn-danger" onclick="window.categoriesPage.deleteCategory('${categoryId}')">
                                        <i class="fas fa-trash"></i> Supprimer cette catégorie
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Footer minimal -->
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.categoriesPage.closeModal()">Fermer</button>
                        <button class="btn-primary" onclick="window.categoriesPage.save()">
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
        
        // Charger les données
        this.loadModalData(categoryId);
    }

    renderKeywordSection(type, title, keywords, color, hint) {
        return `
            <div class="keyword-section">
                <div class="section-header">
                    <h4 style="color: ${color}">${title}</h4>
                    <span class="hint">${hint}</span>
                </div>
                <div class="input-group">
                    <input type="text" id="${type}-input" placeholder="Ajouter...">
                    <button style="background: ${color}" onclick="window.categoriesPage.addKeyword('${type}')">+</button>
                </div>
                <div class="items" id="${type}-items">
                    ${keywords.map(k => `
                        <span class="item" style="background: ${color}20; color: ${color}">
                            ${k}
                            <button onclick="window.categoriesPage.removeItem('${type}', '${k}')">×</button>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ================================================
    // MODAL DE CRÉATION MINIMALISTE
    // ================================================
    showCreateModal() {
        this.closeModal();
        
        const modalHTML = `
            <div class="modal-minimal" onclick="if(event.target === this) window.categoriesPage.closeModal()">
                <div class="modal-content modal-small">
                    <div class="modal-header">
                        <h2>Nouvelle catégorie</h2>
                        <button class="btn-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-minimal">
                            <input type="text" id="new-name" placeholder="Nom de la catégorie" autofocus>
                            
                            <div class="icon-color-row">
                                <div class="icon-picker">
                                    <label>Icône</label>
                                    <div class="icon-options">
                                        ${['📁', '📧', '💼', '🎯', '⚡', '🔔', '💡', '📊', '🏷️', '📌'].map(icon => 
                                            `<button class="icon-option" onclick="window.categoriesPage.selectIcon('${icon}')">${icon}</button>`
                                        ).join('')}
                                    </div>
                                    <input type="hidden" id="new-icon" value="📁">
                                </div>
                                
                                <div class="color-picker-minimal">
                                    <label>Couleur</label>
                                    <input type="color" id="new-color" value="#3b82f6">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.categoriesPage.closeModal()">Annuler</button>
                        <button class="btn-primary" onclick="window.categoriesPage.createCategory()">
                            Créer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
        
        setTimeout(() => document.getElementById('new-name')?.focus(), 100);
    }

    // ================================================
    // ACTIONS
    // ================================================
    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.updateCategoriesDisplay();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        this.updateCategoriesDisplay();
        
        // Mettre à jour les boutons
        document.querySelectorAll('.view-toggle button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    filterCategories(categories) {
        if (!this.searchTerm) return categories;
        
        const filtered = {};
        Object.entries(categories).forEach(([id, category]) => {
            if (category.name.toLowerCase().includes(this.searchTerm)) {
                filtered[id] = category;
            }
        });
        return filtered;
    }

    updateCategoriesDisplay() {
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        const categories = window.categoryManager?.getCategories() || {};
        const settings = this.loadSettings();
        
        container.className = `categories-container ${this.viewMode}`;
        container.innerHTML = this.renderCategories(categories, settings.activeCategories);
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) tab.classList.add('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(`tab-${tabName}`)?.classList.add('active');
    }

    selectIcon(icon) {
        document.getElementById('new-icon').value = icon;
        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.classList.toggle('selected', btn.textContent === icon);
        });
    }

    addKeyword(type) {
        const input = document.getElementById(`${type}-input`);
        if (!input?.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const container = document.getElementById(`${type}-items`);
        
        if (!container) return;
        
        const colors = {
            absolute: '#ef4444',
            strong: '#f59e0b',
            weak: '#3b82f6',
            exclusions: '#6b7280'
        };
        
        container.insertAdjacentHTML('beforeend', `
            <span class="item" style="background: ${colors[type]}20; color: ${colors[type]}">
                ${value}
                <button onclick="window.categoriesPage.removeItem('${type}', '${value}')">×</button>
            </span>
        `);
        
        input.value = '';
    }

    addFilter(type) {
        const inputId = type.includes('Domain') ? 'include-domain' : 'include-email';
        const input = document.getElementById(inputId);
        if (!input?.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const container = document.getElementById(`${type}-items`);
        
        if (!container) return;
        
        container.insertAdjacentHTML('beforeend', `
            <span class="item filter-item">
                ${value}
                <button onclick="window.categoriesPage.removeItem('${type}', '${value}')">×</button>
            </span>
        `);
        
        input.value = '';
    }

    removeItem(type, value) {
        const container = document.getElementById(`${type}-items`);
        if (!container) return;
        
        const items = container.querySelectorAll('.item');
        items.forEach(item => {
            if (item.textContent.trim().replace('×', '').trim() === value) {
                item.remove();
            }
        });
    }

    toggleCategory(categoryId) {
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories || Object.keys(window.categoryManager?.getCategories() || {});
        
        const isActive = activeCategories.includes(categoryId);
        
        if (isActive) {
            activeCategories = activeCategories.filter(id => id !== categoryId);
        } else {
            activeCategories.push(categoryId);
        }
        
        settings.activeCategories = activeCategories;
        this.saveSettings(settings);
        
        this.updateCategoriesDisplay();
        this.showToast(isActive ? 'Catégorie désactivée' : 'Catégorie activée');
    }

    createCategory() {
        const name = document.getElementById('new-name')?.value?.trim();
        const icon = document.getElementById('new-icon')?.value || '📁';
        const color = document.getElementById('new-color')?.value || '#3b82f6';
        
        if (!name) {
            this.showToast('Nom requis', 'error');
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
            this.showToast('Catégorie créée');
            this.refreshPage();
            
            setTimeout(() => this.openModal(newCategory.id), 300);
        }
    }

    save() {
        if (!this.editingCategoryId) return;
        
        try {
            // Collecter les données
            const getItems = (containerId) => {
                const container = document.getElementById(containerId);
                if (!container) return [];
                return Array.from(container.querySelectorAll('.item')).map(item => 
                    item.textContent.trim().replace('×', '').trim()
                );
            };
            
            const keywords = {
                absolute: getItems('absolute-items'),
                strong: getItems('strong-items'),
                weak: getItems('weak-items'),
                exclusions: getItems('exclusions-items')
            };
            
            const filters = {
                includeDomains: getItems('includeDomains-items'),
                includeEmails: getItems('includeEmails-items'),
                excludeDomains: [],
                excludeEmails: []
            };
            
            window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
            window.categoryManager?.updateCategoryFilters(this.editingCategoryId, filters);
            
            this.closeModal();
            this.showToast('Modifications enregistrées');
            this.refreshPage();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur:', error);
            this.showToast('Erreur', 'error');
        }
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Supprimer "${category.name}" ?`)) {
            window.categoryManager?.deleteCustomCategory(categoryId);
            this.closeModal();
            this.showToast('Catégorie supprimée');
            this.refreshPage();
        }
    }

    loadModalData(categoryId) {
        const filters = window.categoryManager?.getCategoryFilters(categoryId) || {
            includeDomains: [], includeEmails: []
        };
        
        // Charger les filtres
        if (filters.includeDomains.length > 0) {
            const container = document.getElementById('includeDomains-items');
            if (container) {
                container.innerHTML = filters.includeDomains.map(d => `
                    <span class="item filter-item">
                        ${d}
                        <button onclick="window.categoriesPage.removeItem('includeDomains', '${d}')">×</button>
                    </span>
                `).join('');
            }
        }
        
        if (filters.includeEmails.length > 0) {
            const container = document.getElementById('includeEmails-items');
            if (container) {
                container.innerHTML = filters.includeEmails.map(e => `
                    <span class="item filter-item">
                        ${e}
                        <button onclick="window.categoriesPage.removeItem('includeEmails', '${e}')">×</button>
                    </span>
                `).join('');
            }
        }
    }

    closeModal() {
        document.querySelector('.modal-minimal')?.remove();
        document.body.style.overflow = 'auto';
        this.currentModal = null;
        this.editingCategoryId = null;
    }

    refreshPage() {
        const container = document.querySelector('.settings-container') || 
                        document.querySelector('.main-content') ||
                        document.querySelector('.content');
        if (container) {
            this.render(container);
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    getCategoryStats(categoryId) {
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        return {
            keywords: keywords.absolute.length + keywords.strong.length + 
                     keywords.weak.length + keywords.exclusions.length,
            absolute: keywords.absolute.length
        };
    }

    getActiveCount(categories, activeCategories) {
        if (!activeCategories) return Object.keys(categories).length;
        return activeCategories.filter(id => categories[id]).length;
    }

    getTotalKeywords(categories) {
        let total = 0;
        Object.keys(categories).forEach(id => {
            const stats = this.getCategoryStats(id);
            total += stats.keywords;
        });
        return total;
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('categorySettings');
            return saved ? JSON.parse(saved) : { activeCategories: null };
        } catch (error) {
            return { activeCategories: null };
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem('categorySettings', JSON.stringify(settings));
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde:', error);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-minimal ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    renderError() {
        return `
            <div class="error-minimal">
                <i class="fas fa-exclamation-circle"></i>
                <p>Erreur de chargement</p>
                <button onclick="location.reload()">Recharger</button>
            </div>
        `;
    }

    // ================================================
    // STYLES MINIMALISTES
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesMinimalStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesMinimalStyles';
        styles.textContent = `
            /* Reset et base */
            .categories-minimal * {
                box-sizing: border-box;
            }
            
            .categories-minimal {
                padding: 20px;
                max-width: 1000px;
                margin: 0 auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: #1a1a1a;
            }
            
            /* Header minimal */
            .header-minimal {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
            }
            
            .header-minimal h1 {
                font-size: 24px;
                font-weight: 600;
                margin: 0;
            }
            
            .header-subtitle {
                font-size: 14px;
                color: #666;
                margin: 4px 0 0 0;
            }
            
            .btn-add {
                width: 40px;
                height: 40px;
                background: #000;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }
            
            .btn-add:hover {
                transform: scale(1.1);
            }
            
            /* Barre de contrôle */
            .control-bar {
                display: flex;
                gap: 16px;
                margin-bottom: 20px;
            }
            
            .search-box {
                flex: 1;
                position: relative;
            }
            
            .search-box i {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: #999;
                font-size: 14px;
            }
            
            .search-box input {
                width: 100%;
                padding: 10px 16px 10px 40px;
                border: 1px solid #e5e5e5;
                border-radius: 8px;
                font-size: 14px;
                background: #f8f8f8;
                transition: all 0.2s;
            }
            
            .search-box input:focus {
                outline: none;
                border-color: #000;
                background: white;
            }
            
            .view-toggle {
                display: flex;
                gap: 4px;
                background: #f8f8f8;
                padding: 4px;
                border-radius: 8px;
            }
            
            .view-toggle button {
                width: 32px;
                height: 32px;
                border: none;
                background: transparent;
                border-radius: 6px;
                cursor: pointer;
                color: #666;
                transition: all 0.2s;
            }
            
            .view-toggle button.active {
                background: white;
                color: #000;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            /* Stats rapides */
            .quick-stats {
                display: flex;
                gap: 24px;
                margin-bottom: 24px;
                padding: 16px;
                background: #f8f8f8;
                border-radius: 8px;
            }
            
            .stat-item {
                display: flex;
                align-items: baseline;
                gap: 6px;
            }
            
            .stat-number {
                font-size: 20px;
                font-weight: 600;
            }
            
            .stat-label {
                font-size: 14px;
                color: #666;
            }
            
            /* Container des catégories */
            .categories-container {
                display: grid;
                gap: 12px;
            }
            
            .categories-container.grid {
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            }
            
            .categories-container.list {
                grid-template-columns: 1fr;
                gap: 4px;
            }
            
            /* Vue grille */
            .cat-card {
                background: white;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                padding: 16px;
                transition: all 0.2s;
                cursor: pointer;
            }
            
            .cat-card:hover {
                border-color: #000;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            
            .cat-card.inactive {
                opacity: 0.5;
            }
            
            .cat-icon {
                width: 48px;
                height: 48px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                margin-bottom: 12px;
            }
            
            .cat-info h3 {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 4px 0;
            }
            
            .cat-meta {
                display: flex;
                gap: 12px;
                font-size: 12px;
                color: #666;
                margin-bottom: 12px;
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .meta-item.highlight {
                color: #f59e0b;
                font-weight: 600;
            }
            
            .cat-actions {
                display: flex;
                gap: 8px;
            }
            
            .btn-toggle,
            .btn-config {
                flex: 1;
                padding: 8px;
                border: 1px solid #e5e5e5;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }
            
            .btn-toggle.active {
                background: #000;
                color: white;
                border-color: #000;
            }
            
            .btn-config:hover {
                border-color: #000;
            }
            
            /* Vue liste */
            .cat-list-item {
                background: white;
                border: 1px solid #e5e5e5;
                border-radius: 8px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.2s;
            }
            
            .cat-list-item:hover {
                border-color: #000;
                background: #fafafa;
            }
            
            .cat-list-item.inactive {
                opacity: 0.5;
            }
            
            .list-icon {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .list-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .list-name {
                font-weight: 600;
                font-size: 14px;
            }
            
            .list-stats {
                font-size: 12px;
                color: #666;
            }
            
            .list-stats strong {
                color: #f59e0b;
            }
            
            .list-actions {
                display: flex;
                gap: 8px;
            }
            
            .btn-mini {
                width: 32px;
                height: 32px;
                border: 1px solid #e5e5e5;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                transition: all 0.2s;
            }
            
            .btn-mini:hover {
                border-color: #000;
            }
            
            .btn-mini.active {
                color: #10b981;
            }
            
            /* Modal minimaliste */
            .modal-minimal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 16px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            }
            
            .modal-content.modal-small {
                max-width: 400px;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e5e5e5;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .modal-category-icon {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            
            .modal-header h2 {
                font-size: 18px;
                font-weight: 600;
                margin: 0;
            }
            
            .btn-close {
                width: 32px;
                height: 32px;
                border: none;
                background: #f8f8f8;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .btn-close:hover {
                background: #e5e5e5;
            }
            
            /* Tabs */
            .modal-tabs {
                display: flex;
                padding: 0 20px;
                gap: 24px;
                border-bottom: 1px solid #e5e5e5;
            }
            
            .tab {
                padding: 12px 0;
                border: none;
                background: none;
                font-size: 14px;
                font-weight: 500;
                color: #666;
                cursor: pointer;
                position: relative;
                transition: color 0.2s;
            }
            
            .tab:hover {
                color: #000;
            }
            
            .tab.active {
                color: #000;
            }
            
            .tab.active::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                right: 0;
                height: 2px;
                background: #000;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            /* Sections de mots-clés */
            .keyword-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
            }
            
            .keyword-section {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .section-header {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .section-header h4 {
                font-size: 14px;
                font-weight: 600;
                margin: 0;
            }
            
            .hint {
                font-size: 11px;
                color: #999;
            }
            
            .input-group {
                display: flex;
                gap: 8px;
            }
            
            .input-group input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #e5e5e5;
                border-radius: 6px;
                font-size: 13px;
            }
            
            .input-group input:focus {
                outline: none;
                border-color: #000;
            }
            
            .input-group button {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-weight: 600;
                transition: transform 0.2s;
            }
            
            .input-group button:hover {
                transform: scale(1.1);
            }
            
            /* Items */
            .items {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                min-height: 32px;
            }
            
            .item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .item button {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                font-size: 14px;
                line-height: 1;
                padding: 0;
                opacity: 0.6;
            }
            
            .item button:hover {
                opacity: 1;
            }
            
            .filter-item {
                background: #f0f9ff;
                color: #0369a1;
            }
            
            /* Filtres */
            .filters-simple {
                display: grid;
                gap: 24px;
            }
            
            .filter-section h4 {
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 12px 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            /* Settings */
            .settings-simple {
                padding: 20px 0;
            }
            
            .btn-danger {
                width: 100%;
                padding: 12px;
                background: #fee;
                color: #dc2626;
                border: 1px solid #fca5a5;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .btn-danger:hover {
                background: #fca5a5;
            }
            
            /* Footer modal */
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #e5e5e5;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            .btn-primary,
            .btn-secondary {
                padding: 8px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #000;
                color: white;
            }
            
            .btn-primary:hover {
                background: #333;
            }
            
            .btn-secondary {
                background: #f8f8f8;
                color: #666;
            }
            
            .btn-secondary:hover {
                background: #e5e5e5;
            }
            
            /* Form minimal */
            .form-minimal {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .form-minimal input[type="text"] {
                padding: 12px 16px;
                border: 1px solid #e5e5e5;
                border-radius: 8px;
                font-size: 14px;
            }
            
            .form-minimal input[type="text"]:focus {
                outline: none;
                border-color: #000;
            }
            
            .icon-color-row {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 16px;
            }
            
            .icon-picker label,
            .color-picker-minimal label {
                display: block;
                font-size: 12px;
                font-weight: 600;
                color: #666;
                margin-bottom: 8px;
            }
            
            .icon-options {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }
            
            .icon-option {
                width: 36px;
                height: 36px;
                border: 1px solid #e5e5e5;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transition: all 0.2s;
            }
            
            .icon-option:hover,
            .icon-option.selected {
                border-color: #000;
                background: #f8f8f8;
            }
            
            .color-picker-minimal input[type="color"] {
                width: 80px;
                height: 36px;
                border: 1px solid #e5e5e5;
                border-radius: 6px;
                cursor: pointer;
            }
            
            /* État vide */
            .empty-state-minimal {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #999;
            }
            
            .empty-state-minimal i {
                font-size: 48px;
                color: #e5e5e5;
                margin-bottom: 16px;
                display: block;
            }
            
            /* Erreur */
            .error-minimal {
                text-align: center;
                padding: 60px 20px;
            }
            
            .error-minimal i {
                font-size: 48px;
                color: #dc2626;
                margin-bottom: 16px;
                display: block;
            }
            
            .error-minimal button {
                margin-top: 16px;
                padding: 8px 20px;
                background: #f8f8f8;
                border: 1px solid #e5e5e5;
                border-radius: 8px;
                cursor: pointer;
            }
            
            /* Toast minimal */
            .toast-minimal {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: #000;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                transition: transform 0.3s;
                z-index: 2000;
            }
            
            .toast-minimal.show {
                transform: translateX(-50%) translateY(0);
            }
            
            .toast-minimal.error {
                background: #dc2626;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .categories-container.grid {
                    grid-template-columns: 1fr;
                }
                
                .control-bar {
                    flex-direction: column;
                }
                
                .keyword-grid {
                    grid-template-columns: 1fr;
                }
                
                .icon-color-row {
                    grid-template-columns: 1fr;
                }
                
                .quick-stats {
                    justify-content: space-between;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance
window.categoriesPage = new CategoriesPage();

// Intégration PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.categoriesPage.render(container);
    };
}

console.log('✅ CategoriesPage ultra-minimaliste chargée');
