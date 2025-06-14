// CategoriesPage.js - Version Minimaliste
// Focus sur l'essentiel : affichage des catégories et gestion complète dans une seule vue

class CategoriesPage {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        console.log('[CategoriesPage] ✅ Version minimaliste initialisée');
    }

    // ================================================
    // RENDU PRINCIPAL
    // ================================================
    render(container) {
        if (!container) {
            console.error('[CategoriesPage] Container manquant');
            return;
        }

        try {
            const categories = window.categoryManager?.getCategories() || {};
            const settings = this.loadSettings();
            const activeCategories = settings.activeCategories || null;
            
            container.innerHTML = `
                <div class="categories-page-minimal">
                    <div class="page-header-minimal">
                        <h1>Catégories</h1>
                        <button class="btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                            <i class="fas fa-plus"></i> Nouvelle catégorie
                        </button>
                    </div>
                    
                    <div class="categories-grid-minimal">
                        ${Object.entries(categories).map(([id, category]) => 
                            this.renderCategoryCard(id, category, activeCategories)
                        ).join('')}
                    </div>
                </div>
            `;
            
            this.addStyles();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur rendu:', error);
            container.innerHTML = '<div class="error">Erreur de chargement</div>';
        }
    }

    // ================================================
    // RENDU D'UNE CARTE DE CATÉGORIE
    // ================================================
    renderCategoryCard(id, category, activeCategories) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        const keywords = window.categoryManager?.getCategoryKeywords(id) || {};
        const totalKeywords = Object.values(keywords).flat().length;
        
        return `
            <div class="category-card ${!isActive ? 'inactive' : ''}" 
                 onclick="window.categoriesPage.openCategoryModal('${id}')">
                <div class="card-header">
                    <div class="card-icon" style="background: ${category.color}20; color: ${category.color}">
                        ${category.icon}
                    </div>
                    <div class="card-info">
                        <h3>${category.name}</h3>
                        <span class="keywords-count">${totalKeywords} mots-clés</span>
                    </div>
                    <label class="toggle-switch" onclick="event.stopPropagation()">
                        <input type="checkbox" ${isActive ? 'checked' : ''} 
                               onchange="window.categoriesPage.toggleCategory('${id}')">
                        <span class="slider"></span>
                    </label>
                </div>
                ${category.isCustom ? '<span class="custom-badge">Personnalisée</span>' : ''}
            </div>
        `;
    }

    // ================================================
    // MODAL DE GESTION D'UNE CATÉGORIE
    // ================================================
    openCategoryModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        this.closeModal();
        this.editingCategoryId = categoryId;
        
        const keywords = window.categoryManager?.getCategoryKeywords(categoryId) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        const filters = window.categoryManager?.getCategoryFilters(categoryId) || {
            includeDomains: [], excludeDomains: [], includeEmails: [], excludeEmails: []
        };
        
        const modalHTML = `
            <div id="category-modal" class="modal-overlay" onclick="if(event.target === this) window.categoriesPage.closeModal()">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon" style="background: ${category.color}20; color: ${category.color}">
                                ${category.icon}
                            </span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="close-btn" onclick="window.categoriesPage.closeModal()">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Section Mots-clés -->
                        <div class="section">
                            <h3>Mots-clés</h3>
                            <div class="keywords-grid">
                                ${this.renderKeywordSection('absolute', 'Absolus 🎯', keywords.absolute, '#dc2626')}
                                ${this.renderKeywordSection('strong', 'Forts 💪', keywords.strong, '#f59e0b')}
                                ${this.renderKeywordSection('weak', 'Faibles 📝', keywords.weak, '#3b82f6')}
                                ${this.renderKeywordSection('exclusions', 'Exclusions 🚫', keywords.exclusions, '#6b7280')}
                            </div>
                        </div>
                        
                        <!-- Section Filtres de domaines/emails -->
                        <div class="section">
                            <h3>Filtres par expéditeur</h3>
                            <div class="filters-grid">
                                ${this.renderFilterSection('includeDomains', 'Domaines à inclure', filters.includeDomains, '#16a34a')}
                                ${this.renderFilterSection('includeEmails', 'Emails à inclure', filters.includeEmails, '#16a34a')}
                                ${this.renderFilterSection('excludeDomains', 'Domaines à exclure', filters.excludeDomains, '#dc2626')}
                                ${this.renderFilterSection('excludeEmails', 'Emails à exclure', filters.excludeEmails, '#dc2626')}
                            </div>
                        </div>
                        
                        <!-- Paramètres si catégorie personnalisée -->
                        ${category.isCustom ? this.renderCategorySettings(category) : ''}
                    </div>
                    
                    <div class="modal-footer">
                        ${category.isCustom ? `
                            <button class="btn-danger" onclick="window.categoriesPage.deleteCategory('${categoryId}')">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                        ` : ''}
                        <button class="btn-primary" onclick="window.categoriesPage.saveChanges()">
                            <i class="fas fa-save"></i> Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = 'category-modal';
    }

    // ================================================
    // SECTIONS DE MOTS-CLÉS ET FILTRES
    // ================================================
    renderKeywordSection(type, title, keywords, color) {
        return `
            <div class="keyword-section">
                <h4 style="color: ${color}">${title}</h4>
                <div class="add-item">
                    <input type="text" placeholder="Ajouter..." 
                           onkeypress="if(event.key==='Enter') window.categoriesPage.addKeyword('${type}', this)">
                    <button onclick="window.categoriesPage.addKeyword('${type}', this.previousElementSibling)">+</button>
                </div>
                <div class="items-list" data-type="${type}">
                    ${keywords.map(kw => `
                        <span class="item-tag" style="background: ${color}20; color: ${color}">
                            ${kw}
                            <button onclick="window.categoriesPage.removeKeyword('${type}', '${kw}')">×</button>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderFilterSection(type, title, items, color) {
        const placeholder = type.includes('Emails') ? 'email@example.com' : 'example.com';
        return `
            <div class="filter-section">
                <h4 style="color: ${color}">${title}</h4>
                <div class="add-item">
                    <input type="text" placeholder="${placeholder}" 
                           onkeypress="if(event.key==='Enter') window.categoriesPage.addFilter('${type}', this)">
                    <button onclick="window.categoriesPage.addFilter('${type}', this.previousElementSibling)">+</button>
                </div>
                <div class="items-list" data-type="${type}">
                    ${items.map(item => `
                        <span class="item-tag" style="background: ${color}20; color: ${color}">
                            ${item}
                            <button onclick="window.categoriesPage.removeFilter('${type}', '${item}')">×</button>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderCategorySettings(category) {
        return `
            <div class="section">
                <h3>Paramètres</h3>
                <div class="settings-grid">
                    <div class="setting-group">
                        <label>Nom</label>
                        <input type="text" id="cat-name" value="${category.name}">
                    </div>
                    <div class="setting-group">
                        <label>Icône</label>
                        <select id="cat-icon">
                            ${['📂', '💼', '🎯', '⚡', '📧', '🔔', '💡', '🎨', '🔧', '📊'].map(icon => 
                                `<option value="${icon}" ${category.icon === icon ? 'selected' : ''}>${icon}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>Couleur</label>
                        <input type="color" id="cat-color" value="${category.color}">
                    </div>
                    <div class="setting-group">
                        <label>Priorité</label>
                        <select id="cat-priority">
                            <option value="10" ${category.priority === 10 ? 'selected' : ''}>Basse</option>
                            <option value="30" ${category.priority === 30 ? 'selected' : ''}>Normale</option>
                            <option value="50" ${category.priority === 50 ? 'selected' : ''}>Haute</option>
                            <option value="90" ${category.priority === 90 ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================================
    // ACTIONS
    // ================================================
    addKeyword(type, input) {
        const value = input.value.trim().toLowerCase();
        if (!value || value.length < 2) return;
        
        const container = document.querySelector(`.items-list[data-type="${type}"]`);
        const exists = Array.from(container.children).some(tag => 
            tag.textContent.trim().toLowerCase().startsWith(value)
        );
        
        if (!exists) {
            const colors = {
                absolute: '#dc2626',
                strong: '#f59e0b',
                weak: '#3b82f6',
                exclusions: '#6b7280'
            };
            
            container.insertAdjacentHTML('beforeend', `
                <span class="item-tag" style="background: ${colors[type]}20; color: ${colors[type]}">
                    ${value}
                    <button onclick="window.categoriesPage.removeKeyword('${type}', '${value}')">×</button>
                </span>
            `);
        }
        
        input.value = '';
    }
    
    removeKeyword(type, keyword) {
        const container = document.querySelector(`.items-list[data-type="${type}"]`);
        Array.from(container.children).forEach(tag => {
            if (tag.textContent.trim().toLowerCase().startsWith(keyword.toLowerCase())) {
                tag.remove();
            }
        });
    }
    
    addFilter(type, input) {
        const value = input.value.trim().toLowerCase();
        if (!value) return;
        
        // Validation basique
        const isEmail = type.includes('Emails');
        if (isEmail && !value.includes('@')) return;
        if (!isEmail && value.includes('@')) return;
        
        const container = document.querySelector(`.items-list[data-type="${type}"]`);
        const exists = Array.from(container.children).some(tag => 
            tag.textContent.trim().toLowerCase().startsWith(value)
        );
        
        if (!exists) {
            const color = type.includes('include') ? '#16a34a' : '#dc2626';
            container.insertAdjacentHTML('beforeend', `
                <span class="item-tag" style="background: ${color}20; color: ${color}">
                    ${value}
                    <button onclick="window.categoriesPage.removeFilter('${type}', '${value}')">×</button>
                </span>
            `);
        }
        
        input.value = '';
    }
    
    removeFilter(type, filter) {
        const container = document.querySelector(`.items-list[data-type="${type}"]`);
        Array.from(container.children).forEach(tag => {
            if (tag.textContent.trim().toLowerCase().startsWith(filter.toLowerCase())) {
                tag.remove();
            }
        });
    }
    
    saveChanges() {
        if (!this.editingCategoryId) return;
        
        try {
            // Sauvegarder les mots-clés
            const keywords = {
                absolute: this.getItemsFromList('absolute'),
                strong: this.getItemsFromList('strong'),
                weak: this.getItemsFromList('weak'),
                exclusions: this.getItemsFromList('exclusions')
            };
            
            window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
            
            // Sauvegarder les filtres
            const filters = {
                includeDomains: this.getItemsFromList('includeDomains'),
                excludeDomains: this.getItemsFromList('excludeDomains'),
                includeEmails: this.getItemsFromList('includeEmails'),
                excludeEmails: this.getItemsFromList('excludeEmails')
            };
            
            window.categoryManager?.updateCategoryFilters(this.editingCategoryId, filters);
            
            // Sauvegarder les paramètres si catégorie personnalisée
            const category = window.categoryManager?.getCategory(this.editingCategoryId);
            if (category?.isCustom) {
                const updates = {
                    name: document.getElementById('cat-name')?.value || category.name,
                    icon: document.getElementById('cat-icon')?.value || category.icon,
                    color: document.getElementById('cat-color')?.value || category.color,
                    priority: parseInt(document.getElementById('cat-priority')?.value) || category.priority
                };
                
                window.categoryManager?.updateCustomCategory(this.editingCategoryId, updates);
            }
            
            this.closeModal();
            this.showToast('Modifications sauvegardées', 'success');
            
            // Rafraîchir l'affichage
            const container = document.querySelector('.categories-page-minimal')?.parentElement;
            if (container) this.render(container);
            
            // Déclencher re-catégorisation si nécessaire
            if (window.emailScanner?.emails?.length > 0) {
                window.emailScanner.recategorizeEmails();
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde:', error);
            this.showToast('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    getItemsFromList(type) {
        const container = document.querySelector(`.items-list[data-type="${type}"]`);
        if (!container) return [];
        
        return Array.from(container.children).map(tag => 
            tag.textContent.trim().replace(/×$/, '').trim().toLowerCase()
        );
    }
    
    toggleCategory(categoryId) {
        event.stopPropagation();
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories;
        
        if (!activeCategories) {
            const allCategories = Object.keys(window.categoryManager?.getCategories() || {});
            activeCategories = [...allCategories];
        }
        
        const isActive = activeCategories.includes(categoryId);
        
        if (isActive) {
            activeCategories = activeCategories.filter(id => id !== categoryId);
        } else {
            activeCategories.push(categoryId);
        }
        
        settings.activeCategories = activeCategories;
        this.saveSettings(settings);
        
        // Rafraîchir l'affichage
        const container = document.querySelector('.categories-page-minimal')?.parentElement;
        if (container) this.render(container);
    }
    
    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category || !confirm(`Supprimer "${category.name}" ?`)) return;
        
        try {
            window.categoryManager?.deleteCustomCategory(categoryId);
            this.closeModal();
            this.showToast('Catégorie supprimée', 'success');
            
            const container = document.querySelector('.categories-page-minimal')?.parentElement;
            if (container) this.render(container);
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur suppression:', error);
            this.showToast('Erreur lors de la suppression', 'error');
        }
    }

    // ================================================
    // MODAL CRÉATION DE CATÉGORIE
    // ================================================
    showCreateCategoryModal() {
        this.closeModal();
        
        const modalHTML = `
            <div id="create-modal" class="modal-overlay" onclick="if(event.target === this) window.categoriesPage.closeModal()">
                <div class="modal-content small">
                    <div class="modal-header">
                        <h2>Nouvelle catégorie</h2>
                        <button class="close-btn" onclick="window.categoriesPage.closeModal()">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nom *</label>
                                <input type="text" id="new-name" placeholder="ex: Support Client">
                            </div>
                            
                            <div class="form-group">
                                <label>Icône</label>
                                <select id="new-icon">
                                    <option value="📂">📂 Dossier</option>
                                    <option value="💼">💼 Business</option>
                                    <option value="🎯">🎯 Objectif</option>
                                    <option value="⚡">⚡ Urgent</option>
                                    <option value="📧">📧 Email</option>
                                    <option value="🔔">🔔 Notification</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Couleur</label>
                                <input type="color" id="new-color" value="#6366f1">
                            </div>
                            
                            <div class="form-group">
                                <label>Priorité</label>
                                <select id="new-priority">
                                    <option value="10">Basse</option>
                                    <option value="30" selected>Normale</option>
                                    <option value="50">Haute</option>
                                    <option value="90">Critique</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.categoriesPage.closeModal()">Annuler</button>
                        <button class="btn-primary" onclick="window.categoriesPage.createCategory()">
                            <i class="fas fa-plus"></i> Créer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        this.currentModal = 'create-modal';
        
        setTimeout(() => document.getElementById('new-name')?.focus(), 100);
    }
    
    createCategory() {
        const name = document.getElementById('new-name')?.value?.trim();
        if (!name) {
            this.showToast('Le nom est requis', 'error');
            return;
        }
        
        try {
            const categoryData = {
                name,
                icon: document.getElementById('new-icon')?.value || '📂',
                color: document.getElementById('new-color')?.value || '#6366f1',
                priority: parseInt(document.getElementById('new-priority')?.value) || 30,
                keywords: { absolute: [], strong: [], weak: [], exclusions: [] }
            };
            
            const newCategory = window.categoryManager?.createCustomCategory(categoryData);
            
            if (newCategory) {
                this.closeModal();
                this.showToast(`Catégorie "${name}" créée`, 'success');
                
                const container = document.querySelector('.categories-page-minimal')?.parentElement;
                if (container) this.render(container);
                
                // Ouvrir directement la modal d'édition
                setTimeout(() => this.openCategoryModal(newCategory.id), 100);
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur création:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
    closeModal() {
        if (this.currentModal) {
            const modal = document.getElementById(this.currentModal);
            if (modal) modal.remove();
            this.currentModal = null;
            this.editingCategoryId = null;
        }
        document.body.style.overflow = 'auto';
    }
    
    showToast(message, type = 'info') {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[Toast ${type}] ${message}`);
        }
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
            console.error('[CategoriesPage] Erreur sauvegarde settings:', error);
        }
    }

    // ================================================
    // STYLES MINIMALISTES
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageMinimalStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageMinimalStyles';
        styles.textContent = `
            .categories-page-minimal {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .page-header-minimal {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .page-header-minimal h1 {
                font-size: 24px;
                font-weight: 700;
                margin: 0;
            }
            
            /* Grille de catégories */
            .categories-grid-minimal {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 16px;
            }
            
            /* Carte de catégorie */
            .category-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }
            
            .category-card:hover {
                border-color: #3b82f6;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .category-card.inactive {
                opacity: 0.6;
            }
            
            .card-header {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .card-icon {
                width: 40px;
                height: 40px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            .card-info {
                flex: 1;
            }
            
            .card-info h3 {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .keywords-count {
                font-size: 13px;
                color: #6b7280;
            }
            
            .custom-badge {
                position: absolute;
                top: 8px;
                right: 8px;
                font-size: 10px;
                background: #f3e8ff;
                color: #7c3aed;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            /* Toggle switch */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 36px;
                height: 20px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #e5e7eb;
                transition: 0.3s;
                border-radius: 20px;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
            }
            
            .toggle-switch input:checked + .slider {
                background-color: #3b82f6;
            }
            
            .toggle-switch input:checked + .slider:before {
                transform: translateX(16px);
            }
            
            /* Modal */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            
            .modal-content.small {
                max-width: 500px;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .modal-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .modal-icon {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 4px 8px;
                border-radius: 4px;
            }
            
            .close-btn:hover {
                background: #f3f4f6;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            /* Sections */
            .section {
                margin-bottom: 32px;
            }
            
            .section:last-child {
                margin-bottom: 0;
            }
            
            .section h3 {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 16px 0;
            }
            
            /* Grilles */
            .keywords-grid, .filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            
            .settings-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
            }
            
            .form-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            
            /* Sections d'items */
            .keyword-section, .filter-section {
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 12px;
            }
            
            .keyword-section h4, .filter-section h4 {
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 8px 0;
            }
            
            /* Ajout d'item */
            .add-item {
                display: flex;
                gap: 4px;
                margin-bottom: 8px;
            }
            
            .add-item input {
                flex: 1;
                padding: 4px 8px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 13px;
            }
            
            .add-item button {
                padding: 4px 12px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
            }
            
            .add-item button:hover {
                background: #2563eb;
            }
            
            /* Liste d'items */
            .items-list {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                min-height: 32px;
            }
            
            .item-tag {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .item-tag button {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                font-size: 14px;
                padding: 0 2px;
                opacity: 0.7;
            }
            
            .item-tag button:hover {
                opacity: 1;
            }
            
            /* Paramètres */
            .setting-group, .form-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .setting-group label, .form-group label {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
            }
            
            .setting-group input, .setting-group select,
            .form-group input, .form-group select {
                padding: 6px 8px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 13px;
            }
            
            /* Boutons */
            .btn-primary, .btn-secondary, .btn-danger {
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .btn-danger {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .btn-danger:hover {
                background: #fca5a5;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .categories-grid-minimal {
                    grid-template-columns: 1fr;
                }
                
                .keywords-grid, .filters-grid {
                    grid-template-columns: 1fr;
                }
                
                .modal-content {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance globale
if (window.categoriesPage) {
    console.log('[CategoriesPage] Nettoyage de l\'ancienne instance');
}

window.categoriesPage = new CategoriesPage();

// Export pour PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.categories = (container) => {
        window.categoriesPage.render(container);
    };
    console.log('✅ CategoriesPage minimaliste intégrée au PageManager');
}

console.log('✅ CategoriesPage minimaliste chargée');
