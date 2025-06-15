// CategoriesPage.js - Version moderne optimisée
class CategoriesPage {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        this.searchTerm = '';
        this.viewMode = 'grid';
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8'
        ];
        console.log('[CategoriesPage] 🎨 Interface moderne initialisée');
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
                <div class="categories-modern">
                    <!-- Header vibrant -->
                    <div class="header-modern">
                        <div class="header-content">
                            <h1>Catégories <span class="emoji">✨</span></h1>
                            <p class="subtitle">Organisez vos emails avec style</p>
                        </div>
                        <button class="btn-create" onclick="window.categoriesPage.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            <span>Créer</span>
                        </button>
                    </div>
                    
                    <!-- Stats colorées -->
                    <div class="stats-bar">
                        <div class="stat-card" style="--accent: #FF6B6B">
                            <div class="stat-value">${Object.keys(categories).length}</div>
                            <div class="stat-label">Total</div>
                        </div>
                        <div class="stat-card" style="--accent: #4ECDC4">
                            <div class="stat-value">${this.getActiveCount(categories, settings.activeCategories)}</div>
                            <div class="stat-label">Actives</div>
                        </div>
                        <div class="stat-card" style="--accent: #45B7D1">
                            <div class="stat-value">${this.getTotalKeywords(categories)}</div>
                            <div class="stat-label">Mots-clés</div>
                        </div>
                        <div class="search-modern">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   placeholder="Rechercher..." 
                                   onkeyup="window.categoriesPage.handleSearch(this.value)">
                        </div>
                    </div>
                    
                    <!-- Grille de catégories -->
                    <div class="categories-grid" id="categories-container">
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
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>Aucune catégorie trouvée</p>
                </div>
            `;
        }
        
        return Object.entries(filtered)
            .map(([id, category]) => this.renderCategoryCard(id, category, activeCategories))
            .join('');
    }

    renderCategoryCard(id, category, activeCategories) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        const stats = this.getCategoryStats(id);
        
        return `
            <div class="category-card ${!isActive ? 'inactive' : ''}" 
                 data-id="${id}"
                 style="--cat-color: ${category.color}"
                 onclick="window.categoriesPage.openModal('${id}')">
                
                <div class="card-header">
                    <div class="cat-emoji">${category.icon}</div>
                    <div class="cat-name">${category.name}</div>
                </div>
                
                <div class="card-stats">
                    <span class="stat-badge">
                        <i class="fas fa-key"></i> ${stats.keywords}
                    </span>
                    ${stats.absolute > 0 ? `
                        <span class="stat-badge special">
                            <i class="fas fa-star"></i> ${stats.absolute}
                        </span>
                    ` : ''}
                </div>
                
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="btn-action ${isActive ? 'active' : ''}" 
                            onclick="window.categoriesPage.toggleCategory('${id}')"
                            title="${isActive ? 'Actif' : 'Inactif'}">
                        <i class="fas fa-power-off"></i>
                    </button>
                    <button class="btn-action" 
                            onclick="window.categoriesPage.openModal('${id}')"
                            title="Configurer">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ================================================
    // MODAL MODERNE
    // ================================================
    openModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        this.closeModal();
        this.editingCategoryId = categoryId;
        
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        const filters = window.categoryManager?.getCategoryFilters(categoryId) || {
            includeDomains: [], includeEmails: [], excludeDomains: [], excludeEmails: []
        };
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPage.closeModal()">
                <div class="modal-modern">
                    <!-- Header avec gradient -->
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon">${category.icon}</span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="btn-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Tabs modernes -->
                    <div class="tabs-modern">
                        <button class="tab active" data-tab="keywords" onclick="window.categoriesPage.switchTab('keywords')">
                            <i class="fas fa-key"></i> Mots-clés
                        </button>
                        <button class="tab" data-tab="filters" onclick="window.categoriesPage.switchTab('filters')">
                            <i class="fas fa-filter"></i> Filtres
                        </button>
                        ${category.isCustom ? `
                            <button class="tab" data-tab="settings" onclick="window.categoriesPage.switchTab('settings')">
                                <i class="fas fa-cog"></i> Paramètres
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Contenu -->
                    <div class="modal-content">
                        <!-- Tab Mots-clés -->
                        <div class="tab-panel active" id="tab-keywords">
                            <div class="keywords-layout">
                                ${this.renderKeywordBox('absolute', 'Mots-clés absolus', keywords.absolute, '#FF6B6B', 'fa-star', 'Déclenchent toujours la catégorie')}
                                ${this.renderKeywordBox('strong', 'Mots-clés forts', keywords.strong, '#FECA57', 'fa-bolt', 'Poids élevé dans la détection')}
                                ${this.renderKeywordBox('weak', 'Mots-clés faibles', keywords.weak, '#54A0FF', 'fa-feather', 'Poids modéré dans la détection')}
                                ${this.renderKeywordBox('exclusions', 'Exclusions', keywords.exclusions, '#A29BFE', 'fa-ban', 'Empêchent la détection')}
                            </div>
                        </div>
                        
                        <!-- Tab Filtres -->
                        <div class="tab-panel" id="tab-filters">
                            <div class="filters-layout">
                                <div class="filter-section">
                                    <h3>Filtres d'inclusion</h3>
                                    
                                    <div class="filter-box">
                                        <h4><i class="fas fa-globe"></i> Domaines autorisés</h4>
                                        <p class="filter-hint">Accepter uniquement les emails de ces domaines</p>
                                        <div class="input-modern">
                                            <input type="text" id="include-domain" placeholder="exemple.com">
                                            <button onclick="window.categoriesPage.addFilter('includeDomains')">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="tags" id="includeDomains-items">
                                            ${filters.includeDomains.map(d => `
                                                <span class="tag filter-tag">
                                                    <i class="fas fa-globe"></i>
                                                    ${d}
                                                    <button onclick="window.categoriesPage.removeItem('includeDomains', '${d}')">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    <div class="filter-box">
                                        <h4><i class="fas fa-at"></i> Emails autorisés</h4>
                                        <p class="filter-hint">Accepter uniquement les emails de ces adresses</p>
                                        <div class="input-modern">
                                            <input type="text" id="include-email" placeholder="contact@exemple.com">
                                            <button onclick="window.categoriesPage.addFilter('includeEmails')">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="tags" id="includeEmails-items">
                                            ${filters.includeEmails.map(e => `
                                                <span class="tag filter-tag">
                                                    <i class="fas fa-at"></i>
                                                    ${e}
                                                    <button onclick="window.categoriesPage.removeItem('includeEmails', '${e}')">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="filter-section">
                                    <h3>Filtres d'exclusion</h3>
                                    
                                    <div class="filter-box">
                                        <h4><i class="fas fa-ban"></i> Domaines exclus</h4>
                                        <p class="filter-hint">Ignorer les emails de ces domaines</p>
                                        <div class="input-modern">
                                            <input type="text" id="exclude-domain" placeholder="spam.com">
                                            <button onclick="window.categoriesPage.addFilter('excludeDomains')">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="tags" id="excludeDomains-items">
                                            ${filters.excludeDomains.map(d => `
                                                <span class="tag exclude-tag">
                                                    <i class="fas fa-ban"></i>
                                                    ${d}
                                                    <button onclick="window.categoriesPage.removeItem('excludeDomains', '${d}')">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    <div class="filter-box">
                                        <h4><i class="fas fa-user-slash"></i> Emails exclus</h4>
                                        <p class="filter-hint">Ignorer les emails de ces adresses</p>
                                        <div class="input-modern">
                                            <input type="text" id="exclude-email" placeholder="noreply@exemple.com">
                                            <button onclick="window.categoriesPage.addFilter('excludeEmails')">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="tags" id="excludeEmails-items">
                                            ${filters.excludeEmails.map(e => `
                                                <span class="tag exclude-tag">
                                                    <i class="fas fa-user-slash"></i>
                                                    ${e}
                                                    <button onclick="window.categoriesPage.removeItem('excludeEmails', '${e}')">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab Paramètres -->
                        ${category.isCustom ? `
                            <div class="tab-panel" id="tab-settings">
                                <div class="settings-content">
                                    <div class="danger-zone">
                                        <h4><i class="fas fa-exclamation-triangle"></i> Zone dangereuse</h4>
                                        <p>Cette action est irréversible</p>
                                        <button class="btn-danger" onclick="window.categoriesPage.deleteCategory('${categoryId}')">
                                            <i class="fas fa-trash"></i> Supprimer la catégorie
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Footer -->
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPage.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-modern primary" onclick="window.categoriesPage.save()">
                            <i class="fas fa-check"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = true;
    }

    renderKeywordBox(type, title, keywords, color, icon, description) {
        return `
            <div class="keyword-box">
                <div class="box-header">
                    <h4><i class="fas ${icon}"></i> ${title}</h4>
                    <span class="box-count" style="background: ${color}20; color: ${color}">${keywords.length}</span>
                </div>
                <p class="box-description">${description}</p>
                <div class="input-modern">
                    <input type="text" id="${type}-input" placeholder="Ajouter un mot-clé..." 
                           onkeypress="if(event.key === 'Enter') window.categoriesPage.addKeyword('${type}', '${color}')">
                    <button style="background: ${color}" onclick="window.categoriesPage.addKeyword('${type}', '${color}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="tags" id="${type}-items">
                    ${keywords.map(k => `
                        <span class="tag" style="background: ${color}15; color: ${color}">
                            ${k}
                            <button onclick="window.categoriesPage.removeItem('${type}', '${k}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ================================================
    // MODAL DE CRÉATION
    // ================================================
    showCreateModal() {
        this.closeModal();
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPage.closeModal()">
                <div class="modal-modern modal-create">
                    <div class="create-header">
                        <h2>Nouvelle catégorie ✨</h2>
                        <button class="btn-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="create-content">
                        <input type="text" 
                               id="new-name" 
                               class="input-name" 
                               placeholder="Nom de la catégorie" 
                               autofocus>
                        
                        <div class="emoji-picker">
                            <label>Choisir une icône</label>
                            <div class="emoji-grid">
                                ${['📁', '📧', '💼', '🎯', '⚡', '🔔', '💡', '📊', '🏷️', '📌', '🌟', '🚀', '💎', '🎨', '🔥'].map(emoji => 
                                    `<button class="emoji-option ${emoji === '📁' ? 'selected' : ''}" 
                                             onclick="window.categoriesPage.selectIcon('${emoji}')">${emoji}</button>`
                                ).join('')}
                            </div>
                            <input type="hidden" id="new-icon" value="📁">
                        </div>
                        
                        <div class="color-selector">
                            <label>Couleur de la catégorie</label>
                            <div class="color-grid">
                                ${this.colors.map((color, i) => 
                                    `<button class="color-option ${i === 0 ? 'selected' : ''}" 
                                             style="background: ${color}"
                                             onclick="window.categoriesPage.selectColor('${color}')"></button>`
                                ).join('')}
                            </div>
                            <input type="hidden" id="new-color" value="${this.colors[0]}">
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-modern secondary" onclick="window.categoriesPage.closeModal()">
                            Annuler
                        </button>
                        <button class="btn-modern primary" onclick="window.categoriesPage.createCategory()">
                            <i class="fas fa-sparkles"></i> Créer
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
        
        container.innerHTML = this.renderCategories(categories, settings.activeCategories);
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });
    }

    selectIcon(icon) {
        document.getElementById('new-icon').value = icon;
        document.querySelectorAll('.emoji-option').forEach(btn => {
            btn.classList.toggle('selected', btn.textContent === icon);
        });
    }

    selectColor(color) {
        document.getElementById('new-color').value = color;
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.toggle('selected', btn.style.background === color);
        });
    }

    addKeyword(type, color) {
        const input = document.getElementById(`${type}-input`);
        if (!input?.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const container = document.getElementById(`${type}-items`);
        
        if (!container) return;
        
        container.insertAdjacentHTML('beforeend', `
            <span class="tag" style="background: ${color}15; color: ${color}">
                ${value}
                <button onclick="window.categoriesPage.removeItem('${type}', '${value}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `);
        
        input.value = '';
        input.focus();
    }

    addFilter(type) {
        const inputId = type.includes('Domain') ? 
            (type.includes('exclude') ? 'exclude-domain' : 'include-domain') : 
            (type.includes('exclude') ? 'exclude-email' : 'include-email');
        const input = document.getElementById(inputId);
        if (!input?.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const container = document.getElementById(`${type}-items`);
        
        if (!container) return;
        
        const isExclude = type.includes('exclude');
        const icon = type.includes('Domain') ? 
            (isExclude ? 'ban' : 'globe') : 
            (isExclude ? 'user-slash' : 'at');
        
        container.insertAdjacentHTML('beforeend', `
            <span class="tag ${isExclude ? 'exclude-tag' : 'filter-tag'}">
                <i class="fas fa-${icon}"></i>
                ${value}
                <button onclick="window.categoriesPage.removeItem('${type}', '${value}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `);
        
        input.value = '';
        input.focus();
    }

    removeItem(type, value) {
        const container = document.getElementById(`${type}-items`);
        if (!container) return;
        
        const tags = container.querySelectorAll('.tag');
        tags.forEach(tag => {
            const text = tag.textContent.trim().replace(/×$/, '').trim();
            if (text === value || text.includes(value)) {
                tag.remove();
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
        this.showToast(isActive ? '🔴 Catégorie désactivée' : '🟢 Catégorie activée');
    }

    createCategory() {
        const name = document.getElementById('new-name')?.value?.trim();
        const icon = document.getElementById('new-icon')?.value || '📁';
        const color = document.getElementById('new-color')?.value || this.colors[0];
        
        if (!name) {
            this.showToast('⚠️ Nom requis', 'warning');
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
            this.showToast('✅ Catégorie créée avec succès!');
            this.refreshPage();
            
            setTimeout(() => this.openModal(newCategory.id), 300);
        }
    }

    save() {
        if (!this.editingCategoryId) return;
        
        try {
            const getItems = (containerId) => {
                const container = document.getElementById(containerId);
                if (!container) return [];
                return Array.from(container.querySelectorAll('.tag')).map(tag => {
                    const text = tag.textContent.trim();
                    return text.replace(/×$/, '').replace(/^[^\s]+\s/, '').trim();
                });
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
                excludeDomains: getItems('excludeDomains-items'),
                excludeEmails: getItems('excludeEmails-items')
            };
            
            window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
            window.categoryManager?.updateCategoryFilters(this.editingCategoryId, filters);
            
            this.closeModal();
            this.showToast('💾 Modifications enregistrées!');
            this.refreshPage();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur:', error);
            this.showToast('❌ Erreur lors de la sauvegarde', 'error');
        }
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)) {
            window.categoryManager?.deleteCustomCategory(categoryId);
            this.closeModal();
            this.showToast('🗑️ Catégorie supprimée');
            this.refreshPage();
        }
    }

    closeModal() {
        document.querySelector('.modal-backdrop')?.remove();
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

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-modern ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
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
                <div class="error-icon">😵</div>
                <h3>Oups! Une erreur est survenue</h3>
                <button class="btn-modern primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Recharger
                </button>
            </div>
        `;
    }

    // ================================================
    // STYLES MODERNES
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesModernStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesModernStyles';
        styles.textContent = `
            /* Base et variables */
            .categories-modern {
                --primary: #6366F1;
                --secondary: #EC4899;
                --success: #10B981;
                --warning: #F59E0B;
                --danger: #EF4444;
                --bg: #F9FAFB;
                --surface: #FFFFFF;
                --text: #111827;
                --text-secondary: #6B7280;
                --border: #E5E7EB;
                --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
                
                padding: 24px;
                min-height: 100vh;
                background: var(--bg);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
                color: var(--text);
            }
            
            /* Header moderne */
            .header-modern {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                padding: 0 8px;
            }
            
            .header-content h1 {
                font-size: 32px;
                font-weight: 700;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .emoji {
                font-size: 28px;
            }
            
            .subtitle {
                font-size: 16px;
                color: var(--text-secondary);
                margin: 4px 0 0 0;
            }
            
            .btn-create {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            }
            
            .btn-create:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
            }
            
            /* Stats bar */
            .stats-bar {
                display: grid;
                grid-template-columns: repeat(3, 120px) 1fr;
                gap: 16px;
                margin-bottom: 24px;
                padding: 0 8px;
            }
            
            .stat-card {
                background: var(--surface);
                border-radius: 16px;
                padding: 16px;
                text-align: center;
                border: 2px solid transparent;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
            }
            
            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--accent);
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .stat-card:hover {
                border-color: var(--accent);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .stat-card:hover::before {
                opacity: 1;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: var(--accent);
            }
            
            .stat-label {
                font-size: 12px;
                color: var(--text-secondary);
                margin-top: 4px;
            }
            
            /* Recherche moderne */
            .search-modern {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .search-modern i {
                position: absolute;
                left: 16px;
                color: var(--text-secondary);
                pointer-events: none;
            }
            
            .search-modern input {
                width: 100%;
                padding: 14px 16px 14px 44px;
                border: 2px solid var(--border);
                border-radius: 12px;
                font-size: 15px;
                background: var(--surface);
                transition: all 0.3s;
            }
            
            .search-modern input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            /* Grille de catégories */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 12px;
                padding: 0 8px;
            }
            
            /* Carte de catégorie */
            .category-card {
                background: var(--surface);
                border-radius: 12px;
                padding: 12px;
                border: 2px solid var(--border);
                transition: all 0.3s;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            
            .category-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, var(--cat-color)10, transparent);
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .category-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
                border-color: var(--cat-color);
            }
            
            .category-card:hover::before {
                opacity: 1;
            }
            
            .category-card.inactive {
                opacity: 0.5;
            }
            
            .card-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .cat-emoji {
                font-size: 28px;
                width: 42px;
                height: 42px;
                background: var(--cat-color)15;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .cat-name {
                font-size: 18px;
                font-weight: 600;
                flex: 1;
                line-height: 1.2;
                color: var(--text);
            }
            
            .card-stats {
                display: flex;
                gap: 6px;
                margin-bottom: 10px;
                flex-wrap: wrap;
            }
            
            .stat-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                background: var(--bg);
                border-radius: 12px;
                font-size: 13px;
                color: var(--text-secondary);
                font-weight: 500;
            }
            
            .stat-badge.special {
                background: linear-gradient(135deg, #FEF3C7, #FDE68A);
                color: #92400E;
                font-weight: 600;
            }
            
            .card-actions {
                display: flex;
                gap: 6px;
            }
            
            .btn-action {
                flex: 1;
                padding: 8px 12px;
                border: 2px solid var(--border);
                background: var(--surface);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                min-width: 48px;
            }
            
            .btn-action:hover {
                border-color: var(--primary);
                background: var(--primary)10;
                color: var(--primary);
            }
            
            .btn-action.active {
                background: var(--success);
                color: white;
                border-color: var(--success);
            }
            
            .btn-action:not(.active):first-child {
                background: #FEE2E2;
                color: var(--danger);
                border-color: #FECACA;
            }
            
            .btn-action:not(.active):first-child:hover {
                background: var(--danger);
                color: white;
                border-color: var(--danger);
            }
            
            /* Modal moderne */
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
                animation: fadeIn 0.3s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-modern {
                background: var(--surface);
                border-radius: 24px;
                width: 100%;
                max-width: 900px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s;
                border: 1px solid var(--border);
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-create {
                max-width: 480px;
            }
            
            .modal-header,
            .create-header {
                padding: 28px;
                border-bottom: 2px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--bg);
                border-radius: 24px 24px 0 0;
            }
            
            .modal-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .modal-icon {
                font-size: 32px;
            }
            
            .modal-header h2,
            .create-header h2 {
                font-size: 24px;
                font-weight: 700;
                margin: 0;
            }
            
            .btn-close {
                width: 40px;
                height: 40px;
                border: none;
                background: var(--bg);
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .btn-close:hover {
                background: var(--danger)10;
                color: var(--danger);
            }
            
            /* Tabs modernes */
            .tabs-modern {
                display: flex;
                padding: 0 28px;
                gap: 32px;
                border-bottom: 2px solid var(--border);
                background: #FFFFFF;
            }
            
            .tab {
                padding: 16px 0;
                border: none;
                background: none;
                font-size: 15px;
                font-weight: 600;
                color: var(--text-secondary);
                cursor: pointer;
                position: relative;
                transition: color 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tab:hover {
                color: var(--text);
            }
            
            .tab.active {
                color: var(--primary);
            }
            
            .tab.active::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--primary);
                border-radius: 3px 3px 0 0;
            }
            
            /* Contenu modal */
            .modal-content,
            .create-content {
                padding: 28px;
                overflow-y: auto;
                flex: 1;
                background: var(--surface);
            }
            
            .tab-panel {
                display: none;
            }
            
            .tab-panel.active {
                display: block;
            }
            
            /* Layout mots-clés */
            .keywords-layout {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 24px;
            }
            
            .keyword-box {
                background: var(--bg);
                border: 1px solid var(--border);
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s;
            }
            
            .keyword-box:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            
            .box-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .box-header h4 {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .box-count {
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .box-description {
                font-size: 14px;
                color: var(--text-secondary);
                margin: 0 0 16px 0;
                line-height: 1.4;
            }
            
            /* Input moderne */
            .input-modern {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .input-modern input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid var(--border);
                border-radius: 10px;
                font-size: 15px;
                transition: all 0.3s;
            }
            
            .input-modern input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .input-modern button {
                width: 44px;
                height: 44px;
                border: none;
                border-radius: 10px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .input-modern button:hover {
                transform: scale(1.1);
            }
            
            /* Tags */
            .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                min-height: 40px;
            }
            
            .tag {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 14px;
                border-radius: 20px;
                font-size: 15px;
                font-weight: 500;
                transition: all 0.3s;
            }
            
            .tag button {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.6;
                transition: opacity 0.3s;
                font-size: 10px;
            }
            
            .tag button:hover {
                opacity: 1;
            }
            
            .filter-tag {
                background: var(--primary)10;
                color: var(--primary);
            }
            
            .exclude-tag {
                background: var(--danger)10;
                color: var(--danger);
            }
            
            /* Layout filtres */
            .filters-layout {
                display: grid;
                gap: 32px;
            }
            
            .filter-section {
                background: #FFFFFF;
                border: 1px solid var(--border);
                border-radius: 20px;
                padding: 28px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .filter-section h3 {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 20px 0;
                color: var(--text);
            }
            
            .filter-box {
                margin-bottom: 24px;
            }
            
            .filter-box:last-child {
                margin-bottom: 0;
            }
            
            .filter-box h4 {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 8px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .filter-hint {
                font-size: 13px;
                color: var(--text-secondary);
                margin: 0 0 16px 0;
            }
            
            /* Paramètres */
            .settings-content {
                padding: 20px 0;
            }
            
            .danger-zone {
                background: var(--danger)10;
                border: 2px solid var(--danger)20;
                border-radius: 16px;
                padding: 24px;
            }
            
            .danger-zone h4 {
                font-size: 16px;
                font-weight: 600;
                color: var(--danger);
                margin: 0 0 8px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .danger-zone p {
                font-size: 14px;
                color: var(--text-secondary);
                margin: 0 0 16px 0;
            }
            
            .btn-danger {
                width: 100%;
                padding: 12px;
                background: var(--danger);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s;
            }
            
            .btn-danger:hover {
                background: #DC2626;
                transform: scale(1.02);
            }
            
            /* Footer modal */
            .modal-footer {
                padding: 24px 28px;
                border-top: 2px solid var(--border);
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                background: var(--bg);
                border-radius: 0 0 24px 24px;
            }
            
            /* Boutons modernes */
            .btn-modern {
                padding: 10px 20px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-modern.primary {
                background: var(--primary);
                color: white;
            }
            
            .btn-modern.primary:hover {
                background: #5558E3;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }
            
            .btn-modern.secondary {
                background: var(--bg);
                color: var(--text-secondary);
                border: 2px solid var(--border);
            }
            
            .btn-modern.secondary:hover {
                background: var(--surface);
                border-color: var(--text-secondary);
            }
            
            /* Création de catégorie */
            .input-name {
                width: 100%;
                padding: 16px 20px;
                border: 2px solid var(--border);
                border-radius: 12px;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 24px;
                transition: all 0.3s;
            }
            
            .input-name:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .emoji-picker,
            .color-selector {
                margin-bottom: 24px;
            }
            
            .emoji-picker label,
            .color-selector label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-secondary);
                margin-bottom: 12px;
            }
            
            .emoji-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
                gap: 8px;
            }
            
            .emoji-option {
                width: 48px;
                height: 48px;
                border: 2px solid var(--border);
                background: var(--surface);
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s;
            }
            
            .emoji-option:hover {
                border-color: var(--primary);
                transform: scale(1.1);
            }
            
            .emoji-option.selected {
                border-color: var(--primary);
                background: var(--primary)10;
            }
            
            .color-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                gap: 8px;
            }
            
            .color-option {
                width: 40px;
                height: 40px;
                border: 3px solid transparent;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
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
            
            /* États vides */
            .empty-state,
            .error-state {
                grid-column: 1 / -1;
                text-align: center;
                padding: 80px 20px;
            }
            
            .empty-icon,
            .error-icon {
                font-size: 64px;
                margin-bottom: 16px;
                display: block;
            }
            
            .empty-state p,
            .error-state h3 {
                font-size: 18px;
                color: var(--text-secondary);
                margin: 0;
            }
            
            .error-state h3 {
                color: var(--text);
                margin-bottom: 16px;
            }
            
            /* Toast moderne */
            .toast-modern {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: var(--text);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                transition: transform 0.3s;
                z-index: 2000;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .toast-modern.show {
                transform: translateX(-50%) translateY(0);
            }
            
            .toast-modern.warning {
                background: var(--warning);
            }
            
            .toast-modern.error {
                background: var(--danger);
            }
            
            /* Responsive */
            @media (max-width: 1200px) {
                .categories-grid {
                    grid-template-columns: repeat(4, 1fr);
                }
            }
            
            @media (max-width: 768px) {
                .categories-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                
                .stats-bar {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .search-modern {
                    grid-column: 1 / -1;
                }
                
                .keywords-layout {
                    grid-template-columns: 1fr;
                }
                
                .modal-modern {
                    max-height: 95vh;
                }
                
                .header-content h1 {
                    font-size: 24px;
                }
                
                .cat-name {
                    font-size: 14px;
                }
            }
            
            /* Animations supplémentaires */
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .category-card:active {
                animation: pulse 0.3s;
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

console.log('🎨 CategoriesPage moderne chargée');
