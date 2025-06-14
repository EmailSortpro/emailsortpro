// CategoriesPage.js - Version moderne et simplifiée

class CategoriesPage {
    constructor() {
        this.editingCategoryId = null;
        this.currentModal = null;
        console.log('[CategoriesPage] ✅ Version moderne initialisée');
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
            
            container.innerHTML = `
                <div class="categories-modern">
                    <div class="header-modern">
                        <div class="header-content">
                            <h1>Catégories</h1>
                            <p class="subtitle">Gérez vos catégories d'emails et leurs règles de détection</p>
                        </div>
                        <button class="btn-create" onclick="window.categoriesPage.showCreateModal()">
                            <i class="fas fa-plus"></i>
                            <span>Nouvelle catégorie</span>
                        </button>
                    </div>
                    
                    <div class="categories-grid-modern">
                        ${Object.entries(categories).map(([id, category]) => 
                            this.renderCategoryCard(id, category, settings.activeCategories)
                        ).join('')}
                        
                        ${Object.keys(categories).length === 0 ? `
                            <div class="empty-state">
                                <i class="fas fa-folder-open"></i>
                                <p>Aucune catégorie créée</p>
                                <button class="btn-create-first" onclick="window.categoriesPage.showCreateModal()">
                                    Créer votre première catégorie
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            this.addStyles();
            
        } catch (error) {
            console.error('[CategoriesPage] Erreur rendu:', error);
            container.innerHTML = `
                <div class="error-modern">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Erreur de chargement</h2>
                    <p>Impossible de charger les catégories</p>
                    <button onclick="location.reload()" class="btn-reload">
                        <i class="fas fa-redo"></i> Recharger
                    </button>
                </div>
            `;
        }
    }

    // ================================================
    // CARTE CATÉGORIE MODERNE
    // ================================================
    renderCategoryCard(id, category, activeCategories) {
        const isActive = activeCategories === null || activeCategories.includes(id);
        const keywords = window.categoryManager?.getCategoryKeywords(id) || {
            absolute: [], strong: [], weak: [], exclusions: []
        };
        
        const totalKeywords = keywords.absolute.length + keywords.strong.length + 
                             keywords.weak.length + keywords.exclusions.length;
        
        return `
            <div class="category-card-modern ${!isActive ? 'inactive' : ''}" data-id="${id}">
                <div class="card-header">
                    <div class="category-icon-modern" style="background: ${category.color}15; color: ${category.color}">
                        ${category.icon}
                    </div>
                    <label class="switch-modern">
                        <input type="checkbox" ${isActive ? 'checked' : ''} 
                               onchange="window.categoriesPage.toggleCategory('${id}')">
                        <span class="switch-slider"></span>
                    </label>
                </div>
                
                <h3 class="category-title">${category.name}</h3>
                
                <div class="category-stats">
                    <span class="stat" title="Mots-clés configurés">
                        <i class="fas fa-key"></i> ${totalKeywords}
                    </span>
                    ${category.isCustom ? '<span class="badge-custom">Custom</span>' : ''}
                </div>
                
                <button class="btn-edit-modern" onclick="window.categoriesPage.openEditModal('${id}')">
                    <i class="fas fa-cog"></i> Configurer
                </button>
            </div>
        `;
    }

    // ================================================
    // MODAL D'ÉDITION MODERNE
    // ================================================
    openEditModal(categoryId) {
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
            <div class="modal-backdrop" onclick="if(event.target === this) window.categoriesPage.closeModal()">
                <div class="modal-modern">
                    <div class="modal-header-modern">
                        <div class="modal-title-group">
                            <div class="modal-icon" style="background: ${category.color}15; color: ${category.color}">
                                ${category.icon}
                            </div>
                            <div>
                                <h2>${category.name}</h2>
                                <p>Configuration complète de la catégorie</p>
                            </div>
                        </div>
                        <button class="btn-close-modern" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body-modern">
                        <!-- Filtres de domaines/emails -->
                        <div class="config-section">
                            <h3 class="section-title">
                                <i class="fas fa-filter"></i> Filtres d'inclusion
                            </h3>
                            <p class="section-desc">Forcez la catégorisation pour certains domaines ou emails</p>
                            
                            <div class="filters-grid">
                                ${this.renderFilterBox('includeDomains', 'Domaines', filters.includeDomains, '#10b981', 'exemple.com')}
                                ${this.renderFilterBox('includeEmails', 'Emails', filters.includeEmails, '#10b981', 'contact@exemple.com')}
                            </div>
                        </div>
                        
                        <!-- Mots-clés -->
                        <div class="config-section">
                            <h3 class="section-title">
                                <i class="fas fa-tags"></i> Mots-clés de détection
                            </h3>
                            <p class="section-desc">Définissez les mots-clés pour la détection automatique</p>
                            
                            <div class="keywords-container">
                                ${this.renderKeywordBox('absolute', 'Mots-clés absolus', keywords.absolute, '#dc2626', 'Garantit la catégorisation')}
                                ${this.renderKeywordBox('strong', 'Mots-clés forts', keywords.strong, '#f59e0b', 'Poids élevé dans la détection')}
                                ${this.renderKeywordBox('weak', 'Mots-clés faibles', keywords.weak, '#3b82f6', 'Poids modéré dans la détection')}
                                ${this.renderKeywordBox('exclusions', 'Exclusions', keywords.exclusions, '#6b7280', 'Empêche la catégorisation')}
                            </div>
                        </div>
                        
                        ${category.isCustom ? `
                            <div class="danger-section">
                                <button class="btn-delete-modern" onclick="window.categoriesPage.deleteCategory('${categoryId}')">
                                    <i class="fas fa-trash"></i> Supprimer cette catégorie
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-footer-modern">
                        <button class="btn-cancel" onclick="window.categoriesPage.closeModal()">Annuler</button>
                        <button class="btn-save" onclick="window.categoriesPage.saveCategory()">
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

    // ================================================
    // RENDU DES COMPOSANTS
    // ================================================
    renderFilterBox(type, title, items, color, placeholder) {
        return `
            <div class="filter-box-modern">
                <h4>${title}</h4>
                <div class="input-modern">
                    <input type="text" id="${type}-input" placeholder="${placeholder}">
                    <button onclick="window.categoriesPage.addItem('${type}')" style="background: ${color}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="tags-container" id="${type}-tags">
                    ${items.map(item => `
                        <span class="tag-modern" style="background: ${color}15; color: ${color}">
                            ${item}
                            <button onclick="window.categoriesPage.removeItem('${type}', '${item}')">×</button>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderKeywordBox(type, title, keywords, color, description) {
        return `
            <div class="keyword-box-modern">
                <div class="keyword-header">
                    <h4 style="color: ${color}">${title}</h4>
                    <span class="keyword-count">${keywords.length}</span>
                </div>
                <p class="keyword-desc">${description}</p>
                <div class="input-modern">
                    <input type="text" id="${type}-input" placeholder="Ajouter un mot-clé">
                    <button onclick="window.categoriesPage.addItem('${type}')" style="background: ${color}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="tags-container" id="${type}-tags">
                    ${keywords.map(kw => `
                        <span class="tag-modern" style="background: ${color}15; color: ${color}">
                            ${kw}
                            <button onclick="window.categoriesPage.removeItem('${type}', '${kw}')">×</button>
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
                <div class="modal-modern modal-small">
                    <div class="modal-header-modern">
                        <h2>Nouvelle catégorie</h2>
                        <button class="btn-close-modern" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body-modern">
                        <div class="form-modern">
                            <div class="form-group">
                                <label>Nom de la catégorie</label>
                                <input type="text" id="new-name" placeholder="Ex: Support Client" autofocus>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Icône</label>
                                    <select id="new-icon" class="select-modern">
                                        <option value="📁">📁 Dossier</option>
                                        <option value="💼">💼 Business</option>
                                        <option value="📧">📧 Email</option>
                                        <option value="🎯">🎯 Objectif</option>
                                        <option value="⚡">⚡ Urgent</option>
                                        <option value="🔔">🔔 Notification</option>
                                        <option value="💡">💡 Idée</option>
                                        <option value="📊">📊 Analyse</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>Couleur</label>
                                    <div class="color-picker">
                                        <input type="color" id="new-color" value="#3b82f6">
                                        <div class="color-presets">
                                            ${['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'].map(c => 
                                                `<button class="color-preset" style="background: ${c}" onclick="document.getElementById('new-color').value='${c}'"></button>`
                                            ).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer-modern">
                        <button class="btn-cancel" onclick="window.categoriesPage.closeModal()">Annuler</button>
                        <button class="btn-save" onclick="window.categoriesPage.createCategory()">
                            <i class="fas fa-check"></i> Créer
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
    addItem(type) {
        const input = document.getElementById(`${type}-input`);
        if (!input || !input.value.trim()) return;
        
        const value = input.value.trim().toLowerCase();
        const container = document.getElementById(`${type}-tags`);
        
        if (!container) return;
        
        // Vérifier les doublons
        const existing = container.querySelector(`[data-value="${value}"]`);
        if (existing) {
            this.showToast('Déjà ajouté', 'warning');
            return;
        }
        
        const colors = {
            absolute: '#dc2626',
            strong: '#f59e0b',
            weak: '#3b82f6',
            exclusions: '#6b7280',
            includeDomains: '#10b981',
            includeEmails: '#10b981'
        };
        
        const color = colors[type] || '#6b7280';
        
        container.insertAdjacentHTML('beforeend', `
            <span class="tag-modern" style="background: ${color}15; color: ${color}" data-value="${value}">
                ${value}
                <button onclick="window.categoriesPage.removeItem('${type}', '${value}')">×</button>
            </span>
        `);
        
        input.value = '';
        input.focus();
    }

    removeItem(type, value) {
        const container = document.getElementById(`${type}-tags`);
        if (!container) return;
        
        const tag = container.querySelector(`[data-value="${value}"]`);
        if (tag) tag.remove();
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
        
        // Mettre à jour visuellement
        const card = document.querySelector(`[data-id="${categoryId}"]`);
        if (card) {
            card.classList.toggle('inactive', isActive);
        }
        
        this.showToast(isActive ? 'Catégorie désactivée' : 'Catégorie activée', 'success');
    }

    createCategory() {
        const name = document.getElementById('new-name')?.value?.trim();
        const icon = document.getElementById('new-icon')?.value || '📁';
        const color = document.getElementById('new-color')?.value || '#3b82f6';
        
        if (!name) {
            this.showToast('Nom requis', 'error');
            return;
        }
        
        try {
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
                
                // Ouvrir la configuration
                setTimeout(() => this.openEditModal(newCategory.id), 300);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur création:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    saveCategory() {
        if (!this.editingCategoryId) return;
        
        try {
            // Collecter tous les tags
            const getTagsFromContainer = (containerId) => {
                const container = document.getElementById(containerId);
                if (!container) return [];
                const tags = container.querySelectorAll('.tag-modern');
                return Array.from(tags).map(tag => tag.dataset.value || tag.textContent.replace('×', '').trim());
            };
            
            const keywords = {
                absolute: getTagsFromContainer('absolute-tags'),
                strong: getTagsFromContainer('strong-tags'),
                weak: getTagsFromContainer('weak-tags'),
                exclusions: getTagsFromContainer('exclusions-tags')
            };
            
            const filters = {
                includeDomains: getTagsFromContainer('includeDomains-tags'),
                includeEmails: getTagsFromContainer('includeEmails-tags'),
                excludeDomains: [],
                excludeEmails: []
            };
            
            // Sauvegarder
            window.categoryManager?.updateCategoryKeywords(this.editingCategoryId, keywords);
            window.categoryManager?.updateCategoryFilters(this.editingCategoryId, filters);
            
            this.closeModal();
            this.showToast('Modifications enregistrées', 'success');
            this.refreshPage();
            
            // Re-catégoriser si nécessaire
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
        
        if (confirm(`Supprimer définitivement "${category.name}" ?`)) {
            try {
                window.categoryManager?.deleteCustomCategory(categoryId);
                this.closeModal();
                this.showToast('Catégorie supprimée', 'success');
                this.refreshPage();
            } catch (error) {
                console.error('[CategoriesPage] Erreur suppression:', error);
                this.showToast('Erreur lors de la suppression', 'error');
            }
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
        // Si UIManager existe
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message, type);
            return;
        }
        
        // Sinon créer un toast simple
        const toast = document.createElement('div');
        toast.className = `toast-modern toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ================================================
    // STYLES MODERNES
    // ================================================
    addStyles() {
        if (document.getElementById('categoriesModernStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'categoriesModernStyles';
        styles.textContent = `
            /* Base */
            .categories-modern {
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            /* Header */
            .header-modern {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                padding-bottom: 24px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .header-content h1 {
                font-size: 32px;
                font-weight: 700;
                color: #111827;
                margin: 0 0 4px 0;
            }
            
            .subtitle {
                color: #6b7280;
                font-size: 16px;
                margin: 0;
            }
            
            .btn-create {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .btn-create:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            
            .btn-create:active {
                transform: translateY(0);
            }
            
            /* Grid */
            .categories-grid-modern {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
            }
            
            /* Card */
            .category-card-modern {
                background: white;
                border: 2px solid #f3f4f6;
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }
            
            .category-card-modern::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #3b82f6, #6366f1);
                transform: scaleX(0);
                transition: transform 0.3s ease;
            }
            
            .category-card-modern:hover {
                border-color: #e5e7eb;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
            }
            
            .category-card-modern:hover::before {
                transform: scaleX(1);
            }
            
            .category-card-modern.inactive {
                opacity: 0.6;
                background: #f9fafb;
            }
            
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .category-icon-modern {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .category-title {
                font-size: 18px;
                font-weight: 600;
                color: #111827;
                margin: 0 0 12px 0;
            }
            
            .category-stats {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                color: #6b7280;
                font-size: 14px;
            }
            
            .stat {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .badge-custom {
                background: #f3e8ff;
                color: #7c3aed;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .btn-edit-modern {
                width: 100%;
                background: #f3f4f6;
                border: none;
                padding: 10px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.2s ease;
            }
            
            .btn-edit-modern:hover {
                background: #e5e7eb;
                color: #111827;
            }
            
            /* Switch moderne */
            .switch-modern {
                position: relative;
                display: inline-block;
                width: 48px;
                height: 26px;
            }
            
            .switch-modern input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .switch-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #e5e7eb;
                transition: .4s;
                border-radius: 26px;
            }
            
            .switch-slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            input:checked + .switch-slider {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
            }
            
            input:checked + .switch-slider:before {
                transform: translateX(22px);
            }
            
            /* Modal */
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
                animation: fadeIn 0.2s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-modern {
                background: white;
                border-radius: 20px;
                width: 100%;
                max-width: 900px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal-modern.modal-small {
                max-width: 500px;
            }
            
            .modal-header-modern {
                padding: 24px 32px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .modal-title-group {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .modal-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .modal-header-modern h2 {
                font-size: 24px;
                font-weight: 700;
                color: #111827;
                margin: 0;
            }
            
            .modal-header-modern p {
                color: #6b7280;
                font-size: 14px;
                margin: 4px 0 0 0;
            }
            
            .btn-close-modern {
                background: none;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #6b7280;
                transition: all 0.2s ease;
            }
            
            .btn-close-modern:hover {
                background: #f3f4f6;
                color: #111827;
            }
            
            .modal-body-modern {
                padding: 32px;
                overflow-y: auto;
                flex: 1;
            }
            
            .modal-footer-modern {
                padding: 24px 32px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            /* Sections */
            .config-section {
                margin-bottom: 40px;
            }
            
            .section-title {
                font-size: 18px;
                font-weight: 600;
                color: #111827;
                margin: 0 0 8px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .section-desc {
                color: #6b7280;
                font-size: 14px;
                margin: 0 0 20px 0;
            }
            
            /* Filters & Keywords */
            .filters-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .keywords-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
            }
            
            .filter-box-modern,
            .keyword-box-modern {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
            }
            
            .keyword-box-modern {
                background: #fafbfc;
            }
            
            .keyword-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
            }
            
            .keyword-header h4,
            .filter-box-modern h4 {
                font-size: 15px;
                font-weight: 600;
                margin: 0;
            }
            
            .keyword-count {
                background: #e5e7eb;
                color: #6b7280;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .keyword-desc {
                font-size: 12px;
                color: #6b7280;
                margin: 0 0 12px 0;
            }
            
            /* Input moderne */
            .input-modern {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .input-modern input {
                flex: 1;
                padding: 10px 14px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                transition: all 0.2s ease;
            }
            
            .input-modern input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .input-modern button {
                padding: 10px 14px;
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            }
            
            .input-modern button:hover {
                transform: scale(1.05);
            }
            
            .input-modern button:active {
                transform: scale(0.95);
            }
            
            /* Tags */
            .tags-container {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                min-height: 32px;
            }
            
            .tag-modern {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                animation: tagAppear 0.2s ease;
            }
            
            @keyframes tagAppear {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .tag-modern button {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
                padding: 0;
                margin-left: 2px;
                opacity: 0.6;
                transition: opacity 0.2s ease;
            }
            
            .tag-modern button:hover {
                opacity: 1;
            }
            
            /* Form moderne */
            .form-modern {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .form-group label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .form-group input,
            .select-modern {
                width: 100%;
                padding: 10px 14px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                transition: all 0.2s ease;
            }
            
            .form-group input:focus,
            .select-modern:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            /* Color picker */
            .color-picker {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .color-picker input[type="color"] {
                width: 100%;
                height: 40px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            }
            
            .color-presets {
                display: flex;
                gap: 4px;
            }
            
            .color-preset {
                width: 24px;
                height: 24px;
                border: 2px solid white;
                border-radius: 6px;
                cursor: pointer;
                transition: transform 0.2s ease;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            .color-preset:hover {
                transform: scale(1.2);
            }
            
            /* Buttons */
            .btn-save,
            .btn-cancel,
            .btn-delete-modern {
                padding: 10px 20px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
            }
            
            .btn-save {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
            }
            
            .btn-save:hover {
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-cancel {
                background: #f3f4f6;
                color: #374151;
            }
            
            .btn-cancel:hover {
                background: #e5e7eb;
            }
            
            .btn-delete-modern {
                background: #fee2e2;
                color: #dc2626;
                width: 100%;
                justify-content: center;
            }
            
            .btn-delete-modern:hover {
                background: #fca5a5;
            }
            
            /* Danger section */
            .danger-section {
                margin-top: 40px;
                padding-top: 32px;
                border-top: 1px solid #e5e7eb;
            }
            
            /* Empty state */
            .empty-state {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .empty-state i {
                font-size: 48px;
                color: #d1d5db;
                margin-bottom: 16px;
                display: block;
            }
            
            .empty-state p {
                font-size: 16px;
                margin: 0 0 20px 0;
            }
            
            .btn-create-first {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .btn-create-first:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            
            /* Error state */
            .error-modern {
                text-align: center;
                padding: 60px 20px;
            }
            
            .error-modern i {
                font-size: 48px;
                color: #ef4444;
                margin-bottom: 16px;
                display: block;
            }
            
            .error-modern h2 {
                font-size: 24px;
                color: #111827;
                margin: 0 0 8px 0;
            }
            
            .error-modern p {
                color: #6b7280;
                margin: 0 0 24px 0;
            }
            
            .btn-reload {
                background: #f3f4f6;
                color: #374151;
                border: none;
                padding: 10px 20px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
            }
            
            .btn-reload:hover {
                background: #e5e7eb;
            }
            
            /* Toast */
            .toast-modern {
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                font-weight: 500;
                transform: translateX(400px);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 2000;
            }
            
            .toast-modern.show {
                transform: translateX(0);
            }
            
            .toast-modern i {
                font-size: 18px;
            }
            
            .toast-success {
                border-left: 4px solid #10b981;
                color: #059669;
            }
            
            .toast-error {
                border-left: 4px solid #ef4444;
                color: #dc2626;
            }
            
            .toast-warning {
                border-left: 4px solid #f59e0b;
                color: #d97706;
            }
            
            .toast-info {
                border-left: 4px solid #3b82f6;
                color: #2563eb;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .categories-grid-modern {
                    grid-template-columns: 1fr;
                }
                
                .filters-grid,
                .keywords-container {
                    grid-template-columns: 1fr;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .header-modern {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 16px;
                }
                
                .btn-create {
                    width: 100%;
                    justify-content: center;
                }
                
                .modal-modern {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }
                
                .toast-modern {
                    right: 12px;
                    left: 12px;
                    bottom: 12px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Créer l'instance globale
window.categoriesPage = new CategoriesPage();

// Intégration au PageManager
if (window.pageManager?.pages) {
    window.pageManager.pages.settings = (container) => {
        window.categoriesPage.render(container);
    };
}

console.log('✅ CategoriesPage moderne chargée');
