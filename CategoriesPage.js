// CategoriesPage.js - Version simplifiée et minimaliste

class CategoriesPage {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        console.log('[CategoriesPage] ✅ Version simplifiée - Interface minimaliste');
    }

    // ================================================
    // RENDU PRINCIPAL
    // ================================================
    renderSettings(container) {
        if (!container) return;

        try {
            const categories = window.categoryManager?.getCategories() || {};
            const settings = this.loadSettings();
            
            container.innerHTML = `
                <div class="categories-page">
                    <div class="page-header">
                        <h1>Catégories</h1>
                        <button class="btn-add-category" onclick="window.categoriesPage.showCreateCategoryModal()">
                            <i class="fas fa-plus"></i> Nouvelle catégorie
                        </button>
                    </div>
                    
                    <div class="categories-grid">
                        ${Object.entries(categories).map(([id, category]) => 
                            this.renderCategoryCard(id, category, settings.activeCategories)
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
    // RENDU D'UNE CARTE CATÉGORIE
    // ================================================
    renderCategoryCard(id, category, activeCategories) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        
        return `
            <div class="category-card ${!isActive ? 'inactive' : ''}" data-category-id="${id}">
                <div class="category-icon" style="background: ${category.color}20; color: ${category.color}">
                    ${category.icon}
                </div>
                
                <h3 class="category-name">${category.name}</h3>
                
                <div class="category-actions">
                    <button class="btn-edit" onclick="window.categoriesPage.openCategoryModal('${id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    <label class="toggle-switch" title="${isActive ? 'Désactiver' : 'Activer'}">
                        <input type="checkbox" ${isActive ? 'checked' : ''} 
                               onchange="window.categoriesPage.toggleCategory('${id}')">
                        <span class="slider"></span>
                    </label>
                </div>
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
            <div id="category-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span class="modal-icon" style="background: ${category.color}20; color: ${category.color}">
                                ${category.icon}
                            </span>
                            <h2>${category.name}</h2>
                        </div>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <!-- Section Filtres -->
                        <div class="section">
                            <h3>Filtres d'inclusion/exclusion</h3>
                            
                            <div class="filters-grid">
                                <div class="filter-box include">
                                    <h4><i class="fas fa-plus-circle"></i> Domaines à inclure</h4>
                                    <div class="input-group">
                                        <input type="text" id="include-domain" placeholder="exemple.com" 
                                               onkeypress="if(event.key==='Enter') window.categoriesPage.addFilter('includeDomains')">
                                        <button onclick="window.categoriesPage.addFilter('includeDomains')">+</button>
                                    </div>
                                    <div class="tags" id="includeDomains-tags">
                                        ${filters.includeDomains.map(d => this.renderTag(d, 'includeDomains', 'include')).join('')}
                                    </div>
                                </div>
                                
                                <div class="filter-box include">
                                    <h4><i class="fas fa-envelope"></i> Emails à inclure</h4>
                                    <div class="input-group">
                                        <input type="text" id="include-email" placeholder="contact@exemple.com" 
                                               onkeypress="if(event.key==='Enter') window.categoriesPage.addFilter('includeEmails')">
                                        <button onclick="window.categoriesPage.addFilter('includeEmails')">+</button>
                                    </div>
                                    <div class="tags" id="includeEmails-tags">
                                        ${filters.includeEmails.map(e => this.renderTag(e, 'includeEmails', 'include')).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Section Mots-clés -->
                        <div class="section">
                            <h3>Mots-clés de détection</h3>
                            
                            <div class="keywords-grid">
                                ${this.renderKeywordBox('absolute', 'Absolus (garantit la catégorisation)', keywords.absolute, '#dc2626')}
                                ${this.renderKeywordBox('strong', 'Forts (poids élevé)', keywords.strong, '#f59e0b')}
                                ${this.renderKeywordBox('weak', 'Faibles (poids modéré)', keywords.weak, '#3b82f6')}
                                ${this.renderKeywordBox('exclusions', 'Exclusions (empêche la catégorisation)', keywords.exclusions, '#6b7280')}
                            </div>
                        </div>
                        
                        ${category.isCustom ? `
                            <div class="danger-zone">
                                <button class="btn-delete" onclick="window.categoriesPage.deleteCategory('${categoryId}')">
                                    <i class="fas fa-trash"></i> Supprimer la catégorie
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.categoriesPage.closeModal()">Fermer</button>
                        <button class="btn-primary" onclick="window.categoriesPage.saveCategory()">
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
    // RENDU D'UNE BOÎTE DE MOTS-CLÉS
    // ================================================
    renderKeywordBox(type, title, keywords, color) {
        return `
            <div class="keyword-box">
                <h4 style="color: ${color}">${title}</h4>
                <div class="input-group">
                    <input type="text" id="${type}-input" placeholder="Ajouter un mot-clé" 
                           onkeypress="if(event.key==='Enter') window.categoriesPage.addKeyword('${type}')">
                    <button style="background: ${color}" onclick="window.categoriesPage.addKeyword('${type}')">+</button>
                </div>
                <div class="tags" id="${type}-tags">
                    ${keywords.map(k => this.renderTag(k, type, 'keyword', color)).join('')}
                </div>
            </div>
        `;
    }

    // ================================================
    // RENDU D'UN TAG
    // ================================================
    renderTag(text, type, style, color = null) {
        const styleColor = color || (style === 'include' ? '#16a34a' : '#dc2626');
        return `
            <span class="tag ${style}" style="${color ? `background: ${color}20; color: ${color}` : ''}">
                ${text}
                <button onclick="window.categoriesPage.removeItem('${type}', '${text}')">×</button>
            </span>
        `;
    }

    // ================================================
    // MODAL DE CRÉATION DE CATÉGORIE
    // ================================================
    showCreateCategoryModal() {
        this.closeModal();
        
        const modalHTML = `
            <div id="create-modal" class="modal-overlay">
                <div class="modal-container small">
                    <div class="modal-header">
                        <h2>Nouvelle catégorie</h2>
                        <button class="modal-close" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="form-group">
                            <label>Nom</label>
                            <input type="text" id="new-name" placeholder="Ex: Support Client">
                        </div>
                        
                        <div class="form-row">
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
                                <input type="color" id="new-color" value="#3b82f6">
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

    // ================================================
    // ACTIONS
    // ================================================
    addKeyword(type) {
        const input = document.getElementById(`${type}-input`);
        if (!input || !input.value.trim()) return;
        
        const keyword = input.value.trim().toLowerCase();
        const container = document.getElementById(`${type}-tags`);
        
        if (container && !this.isDuplicate(container, keyword)) {
            const colors = {
                absolute: '#dc2626',
                strong: '#f59e0b', 
                weak: '#3b82f6',
                exclusions: '#6b7280'
            };
            
            container.insertAdjacentHTML('beforeend', this.renderTag(keyword, type, 'keyword', colors[type]));
            input.value = '';
        }
    }

    addFilter(type) {
        const inputId = type.includes('Domain') ? 
            (type.includes('include') ? 'include-domain' : 'exclude-domain') :
            (type.includes('include') ? 'include-email' : 'exclude-email');
            
        const input = document.getElementById(inputId);
        if (!input || !input.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const container = document.getElementById(`${type}-tags`);
        
        if (container && !this.isDuplicate(container, value)) {
            const style = type.includes('include') ? 'include' : 'exclude';
            container.insertAdjacentHTML('beforeend', this.renderTag(value, type, style));
            input.value = '';
        }
    }

    removeItem(type, value) {
        const container = document.getElementById(`${type}-tags`);
        if (!container) return;
        
        const tags = container.querySelectorAll('.tag');
        tags.forEach(tag => {
            if (tag.textContent.trim().replace('×', '').trim() === value) {
                tag.remove();
            }
        });
    }

    isDuplicate(container, value) {
        const tags = container.querySelectorAll('.tag');
        return Array.from(tags).some(tag => 
            tag.textContent.trim().replace('×', '').trim().toLowerCase() === value
        );
    }

    toggleCategory(categoryId) {
        const settings = this.loadSettings();
        let activeCategories = settings.activeCategories;
        
        if (!activeCategories) {
            activeCategories = Object.keys(window.categoryManager?.getCategories() || {});
        }
        
        const isActive = activeCategories.includes(categoryId);
        
        if (isActive) {
            activeCategories = activeCategories.filter(id => id !== categoryId);
        } else {
            activeCategories.push(categoryId);
        }
        
        settings.activeCategories = activeCategories;
        this.saveSettings(settings);
        
        // Mettre à jour l'affichage
        const card = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (card) {
            card.classList.toggle('inactive', isActive);
        }
        
        this.showToast(isActive ? 'Catégorie désactivée' : 'Catégorie activée', 'success');
    }

    createCategory() {
        const name = document.getElementById('new-name')?.value?.trim();
        const icon = document.getElementById('new-icon')?.value || '📂';
        const color = document.getElementById('new-color')?.value || '#3b82f6';
        
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
            this.showToast(`Catégorie "${name}" créée`, 'success');
            this.refreshPage();
            
            // Ouvrir directement la modal d'édition
            setTimeout(() => this.openCategoryModal(newCategory.id), 300);
        }
    }

    saveCategory() {
        if (!this.editingCategoryId) return;
        
        try {
            // Collecter les mots-clés
            const keywords = {
                absolute: this.getItemsFromTags('absolute-tags'),
                strong: this.getItemsFromTags('strong-tags'),
                weak: this.getItemsFromTags('weak-tags'),
                exclusions: this.getItemsFromTags('exclusions-tags')
            };
            
            // Collecter les filtres
            const filters = {
                includeDomains: this.getItemsFromTags('includeDomains-tags'),
                excludeDomains: this.getItemsFromTags('excludeDomains-tags'),
                includeEmails: this.getItemsFromTags('includeEmails-tags'),
                excludeEmails: this.getItemsFromTags('excludeEmails-tags')
            };
            
            // Sauvegarder
            window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
            window.categoryManager?.updateCategoryFilters(this.editingCategoryId, filters);
            
            this.closeModal();
            this.showToast('Catégorie sauvegardée', 'success');
            
            // Déclencher re-catégorisation si nécessaire
            if (window.emailScanner?.emails?.length > 0) {
                window.emailScanner.recategorizeEmails();
            }
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde:', error);
            this.showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    deleteCategory(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        if (confirm(`Supprimer la catégorie "${category.name}" ?`)) {
            window.categoryManager?.deleteCustomCategory(categoryId);
            this.closeModal();
            this.showToast('Catégorie supprimée', 'success');
            this.refreshPage();
        }
    }

    getItemsFromTags(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        
        const tags = container.querySelectorAll('.tag');
        return Array.from(tags).map(tag => 
            tag.textContent.trim().replace('×', '').trim()
        );
    }

    closeModal() {
        if (this.currentModal) {
            const modal = document.getElementById(this.currentModal);
            if (modal) modal.remove();
            this.currentModal = null;
            this.editingCategoryId = null;
        }
        document.body.style.overflow = 'auto';
    }

    refreshPage() {
        const container = document.querySelector('.settings-container') || 
                        document.querySelector('.main-content') ||
                        document.querySelector('.content');
        if (container) {
            this.renderSettings(container);
        }
    }

    // ================================================
    // UTILITAIRES
    // ================================================
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
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    // ================================================
    // STYLES CSS
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesPageStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesPageStyles';
        styles.textContent = `
            .categories-page {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
            }
            
            .page-header h1 {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin: 0;
            }
            
            .btn-add-category {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
            }
            
            .btn-add-category:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            /* Grille de catégories */
            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 16px;
            }
            
            .category-card {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .category-card:hover {
                border-color: #3b82f6;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .category-card.inactive {
                opacity: 0.5;
                background: #f9fafb;
            }
            
            .category-icon {
                width: 60px;
                height: 60px;
                margin: 0 auto 12px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
            }
            
            .category-name {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 16px 0;
            }
            
            .category-actions {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 12px;
            }
            
            .btn-edit {
                width: 36px;
                height: 36px;
                border: 1px solid #e5e7eb;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .btn-edit:hover {
                border-color: #3b82f6;
                color: #3b82f6;
                background: #eff6ff;
            }
            
            /* Toggle switch */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
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
                transition: .4s;
                border-radius: 24px;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            
            input:checked + .slider {
                background-color: #3b82f6;
            }
            
            input:checked + .slider:before {
                transform: translateX(20px);
            }
            
            /* Modal */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .modal-container {
                background: white;
                border-radius: 16px;
                width: 100%;
                max-width: 800px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            }
            
            .modal-container.small {
                max-width: 500px;
            }
            
            .modal-header {
                padding: 24px;
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
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #6b7280;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s ease;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-content {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer {
                padding: 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            /* Sections */
            .section {
                margin-bottom: 32px;
            }
            
            .section h3 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 16px 0;
            }
            
            /* Grilles */
            .filters-grid,
            .keywords-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 16px;
            }
            
            .filter-box,
            .keyword-box {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                background: #f9fafb;
            }
            
            .filter-box.include {
                background: #f0fdf4;
                border-color: #86efac;
            }
            
            .filter-box h4,
            .keyword-box h4 {
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 12px 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            /* Input groups */
            .input-group {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .input-group input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .input-group input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .input-group button {
                padding: 8px 12px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            }
            
            .input-group button:hover {
                background: #2563eb;
            }
            
            /* Tags */
            .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                min-height: 32px;
            }
            
            .tag {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
            }
            
            .tag.keyword {
                border: 1px solid currentColor;
            }
            
            .tag.include {
                background: #dcfce7;
                color: #16a34a;
            }
            
            .tag.exclude {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .tag button {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                padding: 0 2px;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            }
            
            .tag button:hover {
                opacity: 1;
            }
            
            /* Form groups */
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 6px;
            }
            
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            /* Buttons */
            .btn-primary,
            .btn-secondary,
            .btn-delete {
                padding: 8px 16px;
                border-radius: 8px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
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
            
            .btn-delete {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .btn-delete:hover {
                background: #fca5a5;
            }
            
            /* Danger zone */
            .danger-zone {
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .categories-grid {
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                }
                
                .filters-grid,
                .keywords-grid {
                    grid-template-columns: 1fr;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance globale
window.categoriesPage = new CategoriesPage();

// Intégrer au PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.categoriesPage.renderSettings(container);
    };
}

console.log('✅ CategoriesPage simplifiée chargée');
