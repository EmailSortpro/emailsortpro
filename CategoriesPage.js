// CategoriesPage.js - Version 9.0 - Gestion complète des catégories avec CRUD

class CategoriesPage {
    constructor() {
        this.currentTab = 'general';
        this.searchTerm = '';
        this.editingKeyword = null;
        this.isInitialized = false;
        this.eventListenersSetup = false;
        this.lastNotificationTime = 0;
        
        // NOUVEAU: État pour l'édition de catégories
        this.editingCategory = null;
        this.categoryFormMode = 'create'; // 'create' | 'edit'
        
        // Gestion de synchronisation renforcée
        this.syncInProgress = false;
        this.pendingSync = false;
        this.syncQueue = [];
        
        // Bind toutes les méthodes
        this.bindMethods();
        
        console.log('[CategoriesPage] ✅ Version 9.0 - Gestion complète des catégories avec CRUD');
    }

    bindMethods() {
        const methods = [
            'switchTab', 'savePreferences', 'saveScanSettings', 'saveAutomationSettings',
            'updateTaskPreselectedCategories', 'addQuickExclusion', 'toggleCategory',
            'openKeywordsModal', 'openAllKeywordsModal', 'openExclusionsModal',
            'exportSettings', 'importSettings', 'closeModal', 'hideExplanationMessage',
            'debugSettings', 'testCategorySelection', 'forceUpdateUI', 'forceSynchronization',
            // NOUVEAU: Méthodes CRUD catégories
            'showCreateCategoryModal', 'showEditCategoryModal', 'showDeleteCategoryModal',
            'showCategoryKeywordsModal', 'createNewCategory', 'editCustomCategory', 
            'deleteCustomCategory', 'saveCategoryForm', 'validateCategoryForm',
            'generateCategoryId', 'getCategoryPreview', 'resetCategoryForm'
        ];
        
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    // ================================================
    // ONGLET CATÉGORIES - COMPLET AVEC CRUD
    // ================================================
    renderKeywordsTab(settings, moduleStatus) {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = Object.entries(categories).filter(([id, cat]) => cat.isCustom);
            const systemCategories = Object.entries(categories).filter(([id, cat]) => !cat.isCustom);
            
            return `
                <div class="categories-management-layout">
                    <!-- Création de nouvelle catégorie -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-plus-circle"></i>
                            <h3>Gestion des catégories</h3>
                            <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                                <i class="fas fa-plus"></i>
                                Nouvelle catégorie
                            </button>
                        </div>
                        <p>Créez et gérez vos catégories personnalisées pour classifier vos emails selon vos besoins spécifiques.</p>
                    </div>

                    <!-- Catégories système -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-cogs"></i>
                            <h3>Catégories système</h3>
                            <span class="category-count-badge">${systemCategories.length} catégories</span>
                        </div>
                        <div class="categories-grid-management">
                            ${systemCategories.map(([id, category]) => this.renderCategoryCard(id, category, false)).join('')}
                        </div>
                    </div>

                    <!-- Catégories personnalisées -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-user-cog"></i>
                            <h3>Catégories personnalisées</h3>
                            <span class="category-count-badge">${customCategories.length} catégories</span>
                        </div>
                        ${customCategories.length > 0 ? `
                            <div class="categories-grid-management">
                                ${customCategories.map(([id, category]) => this.renderCategoryCard(id, category, true)).join('')}
                            </div>
                        ` : `
                            <div class="empty-categories-state">
                                <div class="empty-icon">
                                    <i class="fas fa-folder-plus"></i>
                                </div>
                                <h4>Aucune catégorie personnalisée</h4>
                                <p>Créez votre première catégorie personnalisée pour organiser vos emails selon vos besoins.</p>
                                <button class="btn-compact btn-primary" onclick="window.categoriesPage.showCreateCategoryModal()">
                                    <i class="fas fa-plus"></i>
                                    Créer ma première catégorie
                                </button>
                            </div>
                        `}
                    </div>

                    <!-- Actions globales -->
                    <div class="settings-card-compact">
                        <div class="card-header-compact">
                            <i class="fas fa-tools"></i>
                            <h3>Actions avancées</h3>
                        </div>
                        <div class="advanced-actions-grid">
                            <button class="btn-advanced-action" onclick="window.categoriesPage.exportCategories()">
                                <i class="fas fa-download"></i>
                                <div class="action-content">
                                    <span class="action-title">Exporter catégories</span>
                                    <span class="action-description">Sauvegarder toutes vos catégories</span>
                                </div>
                            </button>
                            <button class="btn-advanced-action" onclick="window.categoriesPage.importCategories()">
                                <i class="fas fa-upload"></i>
                                <div class="action-content">
                                    <span class="action-title">Importer catégories</span>
                                    <span class="action-description">Restaurer des catégories sauvegardées</span>
                                </div>
                            </button>
                            <button class="btn-advanced-action" onclick="window.categoriesPage.resetCategories()">
                                <i class="fas fa-undo"></i>
                                <div class="action-content">
                                    <span class="action-title">Réinitialiser</span>
                                    <span class="action-description">Restaurer les paramètres par défaut</span>
                                </div>
                            </button>
                            <button class="btn-advanced-action" onclick="window.categoriesPage.testAllCategories()">
                                <i class="fas fa-vial"></i>
                                <div class="action-content">
                                    <span class="action-title">Tester catégories</span>
                                    <span class="action-description">Vérifier le fonctionnement</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[CategoriesPage] Erreur renderKeywordsTab:', error);
            return '<div>Erreur lors du chargement de l\'onglet catégories</div>';
        }
    }

    renderCategoryCard(categoryId, category, isEditable = false) {
        const isPreselected = this.getTaskPreselectedCategories().includes(categoryId);
        const priority = category.priority || 50;
        
        return `
            <div class="category-card-management ${isPreselected ? 'preselected' : ''}" data-category-id="${categoryId}">
                <div class="category-card-header">
                    <div class="category-icon-display" style="background: ${category.color}20; color: ${category.color};">
                        ${category.icon}
                    </div>
                    <div class="category-info">
                        <h5 class="category-name">${category.name}</h5>
                        <p class="category-description">${category.description || 'Aucune description'}</p>
                    </div>
                    ${isPreselected ? '<span class="preselected-badge-small">⭐ Pré-sélectionné</span>' : ''}
                </div>
                
                <div class="category-meta">
                    <span class="category-priority">Priorité: ${priority}</span>
                    ${category.isCustom ? '<span class="custom-badge-small">Personnalisée</span>' : '<span class="system-badge-small">Système</span>'}
                </div>
                
                <div class="category-actions">
                    <button class="btn-category-action" onclick="window.categoriesPage.showCategoryKeywordsModal('${categoryId}')" title="Voir mots-clés">
                        <i class="fas fa-key"></i>
                    </button>
                    ${isEditable ? `
                        <button class="btn-category-action edit" onclick="window.categoriesPage.showEditCategoryModal('${categoryId}')" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-category-action delete" onclick="window.categoriesPage.showDeleteCategoryModal('${categoryId}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <button class="btn-category-action" onclick="window.categoriesPage.showCategoryKeywordsModal('${categoryId}')" title="Informations">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    // ================================================
    // MODALES CRUD CATÉGORIES
    // ================================================
    showCreateCategoryModal() {
        this.categoryFormMode = 'create';
        this.editingCategory = null;
        
        const modalContent = this.renderCategoryFormModal();
        this.showModal('Créer une nouvelle catégorie', modalContent, 'large');
        
        setTimeout(() => {
            this.initializeCategoryForm();
        }, 100);
    }

    showEditCategoryModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category || !category.isCustom) {
            this.showToast('Seules les catégories personnalisées peuvent être modifiées', 'warning');
            return;
        }
        
        this.categoryFormMode = 'edit';
        this.editingCategory = { id: categoryId, ...category };
        
        const modalContent = this.renderCategoryFormModal();
        this.showModal('Modifier la catégorie', modalContent, 'large');
        
        setTimeout(() => {
            this.initializeCategoryForm();
            this.populateCategoryForm(this.editingCategory);
        }, 100);
    }

    showDeleteCategoryModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category || !category.isCustom) {
            this.showToast('Seules les catégories personnalisées peuvent être supprimées', 'warning');
            return;
        }
        
        const modalContent = `
            <div class="delete-confirmation-content">
                <div class="delete-warning-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h4>Confirmer la suppression</h4>
                <p>Êtes-vous sûr de vouloir supprimer la catégorie <strong>"${category.name}"</strong> ?</p>
                <div class="delete-details">
                    <div class="category-preview-delete">
                        <span class="category-icon-preview" style="background: ${category.color}20; color: ${category.color};">
                            ${category.icon}
                        </span>
                        <div>
                            <div class="category-name-preview">${category.name}</div>
                            <div class="category-desc-preview">${category.description || 'Aucune description'}</div>
                        </div>
                    </div>
                </div>
                <div class="delete-warning">
                    <i class="fas fa-info-circle"></i>
                    <span>Cette action est irréversible. Les emails déjà classés dans cette catégorie seront reclassés automatiquement.</span>
                </div>
                <div class="confirmation-input-section">
                    <label for="deleteConfirmInput">Tapez <strong>"SUPPRIMER"</strong> pour confirmer :</label>
                    <input type="text" id="deleteConfirmInput" class="form-input-compact" placeholder="SUPPRIMER" autocomplete="off">
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-compact btn-secondary" onclick="window.categoriesPage.closeModal()">
                    Annuler
                </button>
                <button class="btn-compact btn-danger" id="confirmDeleteButton" disabled onclick="window.categoriesPage.confirmDeleteCategory('${categoryId}')">
                    <i class="fas fa-trash"></i>
                    Supprimer définitivement
                </button>
            </div>
        `;
        
        this.showModal('Supprimer la catégorie', modalContent, 'medium');
        
        setTimeout(() => {
            const input = document.getElementById('deleteConfirmInput');
            const button = document.getElementById('confirmDeleteButton');
            
            if (input && button) {
                input.addEventListener('input', () => {
                    button.disabled = input.value !== 'SUPPRIMER';
                    button.classList.toggle('enabled', input.value === 'SUPPRIMER');
                });
            }
        }, 100);
    }

    showCategoryKeywordsModal(categoryId) {
        const category = window.categoryManager?.getCategory(categoryId);
        if (!category) return;
        
        const keywords = window.categoryManager?.weightedKeywords?.[categoryId];
        
        const modalContent = `
            <div class="keywords-display-content">
                <div class="category-header-display">
                    <div class="category-icon-large" style="background: ${category.color}20; color: ${category.color};">
                        ${category.icon}
                    </div>
                    <div>
                        <h3>${category.name}</h3>
                        <p>${category.description || 'Aucune description'}</p>
                        ${category.isCustom ? '<span class="custom-badge">Personnalisée</span>' : '<span class="system-badge">Système</span>'}
                    </div>
                </div>
                
                ${keywords ? `
                    <div class="keywords-sections">
                        ${keywords.absolute?.length > 0 ? `
                            <div class="keyword-section">
                                <h4><i class="fas fa-star"></i> Mots-clés absolus (100 points)</h4>
                                <div class="keywords-list">
                                    ${keywords.absolute.map(kw => `<span class="keyword-tag absolute">${kw}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${keywords.strong?.length > 0 ? `
                            <div class="keyword-section">
                                <h4><i class="fas fa-bolt"></i> Mots-clés forts (30 points)</h4>
                                <div class="keywords-list">
                                    ${keywords.strong.map(kw => `<span class="keyword-tag strong">${kw}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${keywords.weak?.length > 0 ? `
                            <div class="keyword-section">
                                <h4><i class="fas fa-feather"></i> Mots-clés faibles (10 points)</h4>
                                <div class="keywords-list">
                                    ${keywords.weak.map(kw => `<span class="keyword-tag weak">${kw}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${keywords.exclusions?.length > 0 ? `
                            <div class="keyword-section">
                                <h4><i class="fas fa-ban"></i> Exclusions</h4>
                                <div class="keywords-list">
                                    ${keywords.exclusions.map(kw => `<span class="keyword-tag exclusion">${kw}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-keywords-message">
                        <i class="fas fa-info-circle"></i>
                        <p>Cette catégorie n'a pas de mots-clés configurés ou ils ne sont pas disponibles.</p>
                    </div>
                `}
                
                ${category.isCustom ? `
                    <div class="keywords-actions">
                        <button class="btn-compact btn-primary" onclick="window.categoriesPage.showEditCategoryModal('${categoryId}')">
                            <i class="fas fa-edit"></i>
                            Modifier cette catégorie
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.showModal(`Mots-clés : ${category.name}`, modalContent, 'large');
    }

    renderCategoryFormModal() {
        const isEdit = this.categoryFormMode === 'edit';
        const title = isEdit ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie';
        
        return `
            <div class="category-form-content">
                <div class="form-section">
                    <h4><i class="fas fa-info-circle"></i> Informations de base</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="categoryName" class="form-label-required">Nom de la catégorie</label>
                            <input type="text" id="categoryName" class="form-input-compact" 
                                   placeholder="Ex: Projets client" maxlength="50" required>
                            <div class="field-help">Le nom affiché pour cette catégorie</div>
                        </div>
                        <div class="form-group">
                            <label for="categoryIcon" class="form-label-required">Icône</label>
                            <div class="icon-selector">
                                <input type="text" id="categoryIcon" class="form-input-compact icon-input" 
                                       placeholder="📁" maxlength="2" required>
                                <div class="icon-preview" id="iconPreview">📁</div>
                                <button type="button" class="btn-icon-picker" onclick="window.categoriesPage.showIconPicker()">
                                    <i class="fas fa-palette"></i>
                                </button>
                            </div>
                            <div class="field-help">Emoji ou icône pour identifier cette catégorie</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="categoryColor" class="form-label-required">Couleur</label>
                            <div class="color-selector">
                                <input type="color" id="categoryColor" class="color-input" value="#3b82f6" required>
                                <div class="color-presets">
                                    ${this.renderColorPresets()}
                                </div>
                            </div>
                            <div class="field-help">Couleur pour les badges et indicateurs</div>
                        </div>
                        <div class="form-group">
                            <label for="categoryPriority" class="form-label">Priorité</label>
                            <select id="categoryPriority" class="form-select-compact">
                                <option value="100">Maximale (100)</option>
                                <option value="90">Très haute (90)</option>
                                <option value="75">Haute (75)</option>
                                <option value="50" selected>Normale (50)</option>
                                <option value="25">Basse (25)</option>
                                <option value="10">Très basse (10)</option>
                            </select>
                            <div class="field-help">Plus la priorité est élevée, plus la catégorie sera préférée</div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="categoryDescription" class="form-label">Description</label>
                        <textarea id="categoryDescription" class="form-textarea-compact" 
                                  placeholder="Description de cette catégorie..." rows="3" maxlength="200"></textarea>
                        <div class="field-help">Description optionnelle pour expliquer l'usage de cette catégorie</div>
                    </div>
                </div>

                <div class="form-section">
                    <h4><i class="fas fa-key"></i> Mots-clés de détection</h4>
                    <p class="section-help">Configurez les mots-clés qui permettront de détecter automatiquement cette catégorie dans les emails.</p>
                    
                    <div class="keywords-form-section">
                        <div class="keyword-type-section">
                            <label class="keyword-type-label">
                                <i class="fas fa-star"></i>
                                Mots-clés absolus (100 points)
                            </label>
                            <textarea id="keywordsAbsolute" class="keywords-textarea" 
                                      placeholder="Entrez un mot-clé par ligne. Ex:&#10;facture&#10;invoice&#10;paiement requis" 
                                      rows="4"></textarea>
                            <div class="keyword-help">Mots-clés qui garantissent la classification dans cette catégorie</div>
                        </div>
                        
                        <div class="keyword-type-section">
                            <label class="keyword-type-label">
                                <i class="fas fa-bolt"></i>
                                Mots-clés forts (30 points)
                            </label>
                            <textarea id="keywordsStrong" class="keywords-textarea" 
                                      placeholder="Entrez un mot-clé par ligne. Ex:&#10;urgent&#10;important&#10;priorité" 
                                      rows="3"></textarea>
                            <div class="keyword-help">Mots-clés importants mais pas absolus</div>
                        </div>
                        
                        <div class="keyword-type-section">
                            <label class="keyword-type-label">
                                <i class="fas fa-feather"></i>
                                Mots-clés faibles (10 points)
                            </label>
                            <textarea id="keywordsWeak" class="keywords-textarea" 
                                      placeholder="Entrez un mot-clé par ligne. Ex:&#10;merci&#10;cordialement&#10;information" 
                                      rows="3"></textarea>
                            <div class="keyword-help">Mots-clés qui renforcent légèrement la détection</div>
                        </div>
                        
                        <div class="keyword-type-section">
                            <label class="keyword-type-label">
                                <i class="fas fa-ban"></i>
                                Exclusions
                            </label>
                            <textarea id="keywordsExclusions" class="keywords-textarea" 
                                      placeholder="Entrez un mot-clé par ligne. Ex:&#10;newsletter&#10;publicité&#10;spam" 
                                      rows="3"></textarea>
                            <div class="keyword-help">Mots-clés qui empêchent la classification dans cette catégorie</div>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h4><i class="fas fa-eye"></i> Aperçu en temps réel</h4>
                    <div class="category-preview" id="categoryPreview">
                        ${this.renderCategoryPreview()}
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-compact btn-secondary" onclick="window.categoriesPage.closeModal()">
                    Annuler
                </button>
                <button class="btn-compact btn-primary" onclick="window.categoriesPage.saveCategoryForm()">
                    <i class="fas fa-save"></i>
                    ${isEdit ? 'Modifier' : 'Créer'} la catégorie
                </button>
            </div>
        `;
    }

    renderColorPresets() {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
        ];
        
        return colors.map(color => 
            `<button type="button" class="color-preset" style="background: ${color}" 
                     onclick="document.getElementById('categoryColor').value='${color}'; window.categoriesPage.updateCategoryPreview()"></button>`
        ).join('');
    }

    renderCategoryPreview() {
        return `
            <div class="preview-card">
                <div class="preview-icon" id="previewIcon">📁</div>
                <div class="preview-content">
                    <div class="preview-name" id="previewName">Nouvelle catégorie</div>
                    <div class="preview-description" id="previewDescription">Description de la catégorie</div>
                </div>
                <div class="preview-priority" id="previewPriority">Priorité: 50</div>
            </div>
        `;
    }

    // ================================================
    // GESTION DU FORMULAIRE DE CATÉGORIE
    // ================================================
    initializeCategoryForm() {
        // Événements pour mise à jour en temps réel
        const fieldsToWatch = ['categoryName', 'categoryIcon', 'categoryColor', 'categoryDescription', 'categoryPriority'];
        
        fieldsToWatch.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.updateCategoryPreview());
                field.addEventListener('change', () => this.updateCategoryPreview());
            }
        });
        
        // Validation en temps réel
        const nameField = document.getElementById('categoryName');
        if (nameField) {
            nameField.addEventListener('input', () => this.validateCategoryForm());
        }
        
        // Mise à jour initiale de l'aperçu
        this.updateCategoryPreview();
    }

    populateCategoryForm(category) {
        document.getElementById('categoryName').value = category.name || '';
        document.getElementById('categoryIcon').value = category.icon || '';
        document.getElementById('categoryColor').value = category.color || '#3b82f6';
        document.getElementById('categoryPriority').value = category.priority || 50;
        document.getElementById('categoryDescription').value = category.description || '';
        
        // Peupler les mots-clés si disponibles
        const keywords = window.categoryManager?.weightedKeywords?.[category.id];
        if (keywords) {
            document.getElementById('keywordsAbsolute').value = (keywords.absolute || []).join('\n');
            document.getElementById('keywordsStrong').value = (keywords.strong || []).join('\n');
            document.getElementById('keywordsWeak').value = (keywords.weak || []).join('\n');
            document.getElementById('keywordsExclusions').value = (keywords.exclusions || []).join('\n');
        }
        
        this.updateCategoryPreview();
    }

    updateCategoryPreview() {
        const name = document.getElementById('categoryName')?.value || 'Nouvelle catégorie';
        const icon = document.getElementById('categoryIcon')?.value || '📁';
        const color = document.getElementById('categoryColor')?.value || '#3b82f6';
        const description = document.getElementById('categoryDescription')?.value || 'Description de la catégorie';
        const priority = document.getElementById('categoryPriority')?.value || 50;
        
        // Mettre à jour l'aperçu de l'icône dans le sélecteur
        const iconPreview = document.getElementById('iconPreview');
        if (iconPreview) {
            iconPreview.textContent = icon;
        }
        
        // Mettre à jour l'aperçu complet
        const previewIcon = document.getElementById('previewIcon');
        const previewName = document.getElementById('previewName');
        const previewDescription = document.getElementById('previewDescription');
        const previewPriority = document.getElementById('previewPriority');
        const previewCard = document.querySelector('.preview-card');
        
        if (previewIcon) previewIcon.textContent = icon;
        if (previewName) previewName.textContent = name;
        if (previewDescription) previewDescription.textContent = description;
        if (previewPriority) previewPriority.textContent = `Priorité: ${priority}`;
        if (previewCard) {
            previewCard.style.borderColor = color;
            previewIcon.style.background = `${color}20`;
            previewIcon.style.color = color;
        }
    }

    validateCategoryForm() {
        const name = document.getElementById('categoryName')?.value.trim();
        const icon = document.getElementById('categoryIcon')?.value.trim();
        const color = document.getElementById('categoryColor')?.value;
        
        const isValid = name && name.length >= 2 && icon && icon.length >= 1 && color;
        
        // Vérifier que le nom n'est pas déjà utilisé
        if (name && this.categoryFormMode === 'create') {
            const categories = window.categoryManager?.getCategories() || {};
            const nameExists = Object.values(categories).some(cat => 
                cat.name.toLowerCase() === name.toLowerCase()
            );
            
            if (nameExists) {
                this.showFieldError('categoryName', 'Ce nom de catégorie existe déjà');
                return false;
            }
        }
        
        return isValid;
    }

    saveCategoryForm() {
        if (!this.validateCategoryForm()) {
            this.showToast('Veuillez corriger les erreurs du formulaire', 'error');
            return;
        }
        
        const formData = this.getCategoryFormData();
        
        try {
            if (this.categoryFormMode === 'create') {
                this.createNewCategory(formData);
            } else {
                this.editCustomCategory(this.editingCategory.id, formData);
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur sauvegarde catégorie:', error);
            this.showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    getCategoryFormData() {
        // Récupérer les données du formulaire
        const name = document.getElementById('categoryName').value.trim();
        const icon = document.getElementById('categoryIcon').value.trim();
        const color = document.getElementById('categoryColor').value;
        const priority = parseInt(document.getElementById('categoryPriority').value);
        const description = document.getElementById('categoryDescription').value.trim();
        
        // Récupérer les mots-clés
        const keywordsAbsolute = this.parseKeywords(document.getElementById('keywordsAbsolute').value);
        const keywordsStrong = this.parseKeywords(document.getElementById('keywordsStrong').value);
        const keywordsWeak = this.parseKeywords(document.getElementById('keywordsWeak').value);
        const keywordsExclusions = this.parseKeywords(document.getElementById('keywordsExclusions').value);
        
        return {
            name,
            icon,
            color,
            priority,
            description,
            keywords: {
                absolute: keywordsAbsolute,
                strong: keywordsStrong,
                weak: keywordsWeak,
                exclusions: keywordsExclusions
            }
        };
    }

    parseKeywords(text) {
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }

    // ================================================
    // ACTIONS CRUD
    // ================================================
    createNewCategory(formData) {
        if (!window.categoryManager) {
            this.showToast('CategoryManager non disponible', 'error');
            return;
        }
        
        try {
            const categoryData = {
                ...formData,
                isCustom: true,
                createdAt: new Date().toISOString()
            };
            
            const newCategory = window.categoryManager.createCustomCategory(categoryData);
            
            if (newCategory) {
                this.showToast(`Catégorie "${formData.name}" créée avec succès`, 'success');
                this.closeModal();
                this.refreshCurrentTab();
                this.forceSynchronization();
            } else {
                throw new Error('Échec de création de la catégorie');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur création catégorie:', error);
            this.showToast('Erreur lors de la création', 'error');
        }
    }

    editCustomCategory(categoryId, formData) {
        if (!window.categoryManager) {
            this.showToast('CategoryManager non disponible', 'error');
            return;
        }
        
        try {
            const success = window.categoryManager.updateCustomCategory(categoryId, {
                ...formData,
                updatedAt: new Date().toISOString()
            });
            
            if (success) {
                this.showToast(`Catégorie "${formData.name}" modifiée avec succès`, 'success');
                this.closeModal();
                this.refreshCurrentTab();
                this.forceSynchronization();
            } else {
                throw new Error('Échec de modification de la catégorie');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur modification catégorie:', error);
            this.showToast('Erreur lors de la modification', 'error');
        }
    }

    confirmDeleteCategory(categoryId) {
        const input = document.getElementById('deleteConfirmInput');
        if (!input || input.value !== 'SUPPRIMER') {
            this.showToast('Veuillez taper "SUPPRIMER" pour confirmer', 'warning');
            return;
        }
        
        if (!window.categoryManager) {
            this.showToast('CategoryManager non disponible', 'error');
            return;
        }
        
        try {
            const category = window.categoryManager.getCategory(categoryId);
            const success = window.categoryManager.deleteCustomCategory(categoryId);
            
            if (success) {
                this.showToast(`Catégorie "${category.name}" supprimée avec succès`, 'success');
                this.closeModal();
                this.refreshCurrentTab();
                this.forceSynchronization();
            } else {
                throw new Error('Échec de suppression de la catégorie');
            }
        } catch (error) {
            console.error('[CategoriesPage] Erreur suppression catégorie:', error);
            this.showToast('Erreur lors de la suppression', 'error');
        }
    }

    // ================================================
    // ACTIONS AVANCÉES
    // ================================================
    exportCategories() {
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = Object.entries(categories)
                .filter(([id, cat]) => cat.isCustom)
                .reduce((acc, [id, cat]) => {
                    acc[id] = cat;
                    return acc;
                }, {});
            
            const exportData = {
                categories: customCategories,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `categories-custom-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showToast(`${Object.keys(customCategories).length} catégories exportées`, 'success');
        } catch (error) {
            console.error('[CategoriesPage] Erreur export catégories:', error);
            this.showToast('Erreur lors de l\'export', 'error');
        }
    }

    importCategories() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (!importData.categories) {
                        throw new Error('Format de fichier invalide');
                    }
                    
                    let imported = 0;
                    Object.entries(importData.categories).forEach(([id, categoryData]) => {
                        try {
                            if (window.categoryManager?.createCustomCategory(categoryData)) {
                                imported++;
                            }
                        } catch (error) {
                            console.warn('Échec import catégorie:', categoryData.name, error);
                        }
                    });
                    
                    if (imported > 0) {
                        this.showToast(`${imported} catégorie(s) importée(s) avec succès`, 'success');
                        this.refreshCurrentTab();
                        this.forceSynchronization();
                    } else {
                        this.showToast('Aucune catégorie n\'a pu être importée', 'warning');
                    }
                } catch (error) {
                    console.error('[CategoriesPage] Erreur import catégories:', error);
                    this.showToast('Erreur lors de l\'import : ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    resetCategories() {
        const confirmReset = confirm('Êtes-vous sûr de vouloir supprimer TOUTES les catégories personnalisées ? Cette action est irréversible.');
        
        if (!confirmReset) return;
        
        try {
            const categories = window.categoryManager?.getCategories() || {};
            const customCategories = Object.entries(categories).filter(([id, cat]) => cat.isCustom);
            
            let deleted = 0;
            customCategories.forEach(([id, cat]) => {
                if (window.categoryManager?.deleteCustomCategory(id)) {
                    deleted++;
                }
            });
            
            this.showToast(`${deleted} catégorie(s) personnalisée(s) supprimée(s)`, 'success');
            this.refreshCurrentTab();
            this.forceSynchronization();
        } catch (error) {
            console.error('[CategoriesPage] Erreur reset catégories:', error);
            this.showToast('Erreur lors de la réinitialisation', 'error');
        }
    }

    testAllCategories() {
        console.log('[CategoriesPage] === TEST TOUTES LES CATÉGORIES ===');
        
        const categories = window.categoryManager?.getCategories() || {};
        const testResults = [];
        
        Object.entries(categories).forEach(([id, category]) => {
            const testResult = {
                id,
                name: category.name,
                isCustom: category.isCustom || false,
                hasKeywords: !!(window.categoryManager?.weightedKeywords?.[id]),
                priority: category.priority || 50,
                color: category.color,
                icon: category.icon
            };
            
            testResults.push(testResult);
        });
        
        console.table(testResults);
        this.showToast(`Test terminé pour ${testResults.length} catégories - voir console`, 'info');
        
        return testResults;
    }

    // ================================================
    // UTILITAIRES POUR FORMULAIRES
    // ================================================
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Supprimer l'ancien message d'erreur
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Ajouter le nouveau message d'erreur
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        field.classList.add('error');
        
        // Supprimer l'erreur après 5 secondes
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
            field.classList.remove('error');
        }, 5000);
    }

    generateCategoryId() {
        return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    showIconPicker() {
        const commonIcons = [
            '📁', '📂', '📋', '📊', '📈', '📉', '📌', '📍', '📎', '📏',
            '🔍', '🔧', '🔨', '🔩', '🔪', '🔫', '🔬', '🔭', '🔮', '🔯',
            '💼', '💰', '💳', '💴', '💵', '💶', '💷', '💸', '💹', '💺',
            '⚡', '⚙️', '⚠️', '⚡', '⭐', '✅', '❌', '❗', '❓', '❔',
            '🎯', '🎨', '🎪', '🎫', '🎬', '🎭', '🎮', '🎯', '🎲', '🎳'
        ];
        
        const iconGrid = commonIcons.map(icon => 
            `<button type="button" class="icon-option" onclick="window.categoriesPage.selectIcon('${icon}')">${icon}</button>`
        ).join('');
        
        this.showModal('Choisir une icône', `
            <div class="icon-picker-grid">
                ${iconGrid}
            </div>
            <div style="margin-top: 16px; text-align: center;">
                <input type="text" placeholder="Ou tapez votre propre emoji..." id="customIconInput" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <button type="button" onclick="window.categoriesPage.selectIcon(document.getElementById('customIconInput').value)" style="margin-left: 8px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px;">Utiliser</button>
            </div>
        `, 'medium');
    }

    selectIcon(icon) {
        if (!icon || icon.trim() === '') return;
        
        const iconField = document.getElementById('categoryIcon');
        if (iconField) {
            iconField.value = icon.trim();
            this.updateCategoryPreview();
        }
        
        this.closeModal();
    }

    // ================================================
    // MODAL UTILITIES AMÉLIORÉES
    // ================================================
    showModal(title, content, size = 'medium') {
        // Fermer les modales existantes
        this.closeModal();
        
        const sizeClass = {
            small: 'modal-small',
            medium: 'modal-medium', 
            large: 'modal-large',
            xlarge: 'modal-xlarge'
        }[size] || 'modal-medium';
        
        const modalHtml = `
            <div class="modal-overlay" id="currentModal">
                <div class="modal-container ${sizeClass}">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close-btn" onclick="window.categoriesPage.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
        
        // Animation d'entrée
        setTimeout(() => {
            const modal = document.getElementById('currentModal');
            if (modal) {
                modal.classList.add('visible');
            }
        }, 10);
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.classList.remove('visible');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        });
        document.body.style.overflow = 'auto';
        
        // Reset form state
        this.editingCategory = null;
        this.categoryFormMode = 'create';
    }

    // [Les autres méthodes existantes restent inchangées...]
    // Continuez avec toutes les autres méthodes de la classe originale...
}

// Styles CSS supplémentaires pour la gestion des catégories
const categoryManagementStyles = `
    /* Gestion des catégories */
    .categories-management-layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .categories-grid-management {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
        margin-top: 16px;
    }

    .category-card-management {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        transition: all 0.3s ease;
        position: relative;
    }

    .category-card-management:hover {
        border-color: #3b82f6;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .category-card-management.preselected {
        border-color: #8b5cf6;
        background: #fdf4ff;
    }

    .category-card-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
    }

    .category-icon-display {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
    }

    .category-info {
        flex: 1;
        min-width: 0;
    }

    .category-name {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
    }

    .category-description {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
    }

    .preselected-badge-small {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #8b5cf6;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
    }

    .category-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 12px;
    }

    .category-priority {
        color: #6b7280;
        font-weight: 500;
    }

    .custom-badge-small,
    .system-badge-small {
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
    }

    .custom-badge-small {
        background: #f59e0b;
        color: white;
    }

    .system-badge-small {
        background: #10b981;
        color: white;
    }

    .category-actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
    }

    .btn-category-action {
        width: 32px;
        height: 32px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        font-size: 14px;
    }

    .btn-category-action:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
        color: #374151;
    }

    .btn-category-action.edit:hover {
        background: #dbeafe;
        border-color: #3b82f6;
        color: #3b82f6;
    }

    .btn-category-action.delete:hover {
        background: #fee2e2;
        border-color: #ef4444;
        color: #ef4444;
    }

    .category-count-badge {
        background: #f3f4f6;
        color: #6b7280;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        margin-left: auto;
    }

    /* État vide */
    .empty-categories-state {
        text-align: center;
        padding: 40px 20px;
        background: #f8fafc;
        border-radius: 12px;
        border: 2px dashed #d1d5db;
    }

    .empty-categories-state .empty-icon {
        font-size: 48px;
        color: #d1d5db;
        margin-bottom: 16px;
    }

    .empty-categories-state h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #374151;
    }

    .empty-categories-state p {
        margin: 0 0 20px 0;
        color: #6b7280;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }

    /* Actions avancées */
    .advanced-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
    }

    .btn-advanced-action {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
    }

    .btn-advanced-action:hover {
        background: #f8fafc;
        border-color: #3b82f6;
        transform: translateY(-1px);
    }

    .btn-advanced-action i {
        font-size: 20px;
        color: #3b82f6;
        flex-shrink: 0;
    }

    .action-content {
        flex: 1;
    }

    .action-title {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 2px;
    }

    .action-description {
        display: block;
        font-size: 12px;
        color: #6b7280;
    }

    /* Formulaire de catégorie */
    .category-form-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .form-section {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
    }

    .form-section h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .form-section h4 i {
        color: #3b82f6;
    }

    .section-help {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #6b7280;
        line-height: 1.5;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-label-required::after {
        content: ' *';
        color: #ef4444;
    }

    .form-input-compact,
    .form-select-compact,
    .form-textarea-compact {
        padding: 10px 12px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s ease;
    }

    .form-input-compact:focus,
    .form-select-compact:focus,
    .form-textarea-compact:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input-compact.error {
        border-color: #ef4444;
    }

    .field-help {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
    }

    .field-error {
        font-size: 12px;
        color: #ef4444;
        margin-top: 4px;
        font-weight: 500;
    }

    /* Sélecteurs spéciaux */
    .icon-selector {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .icon-input {
        flex: 1;
    }

    .icon-preview {
        width: 40px;
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        background: #f8fafc;
    }

    .btn-icon-picker {
        width: 40px;
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        background: white;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .btn-icon-picker:hover {
        background: #f3f4f6;
        border-color: #3b82f6;
        color: #3b82f6;
    }

    .color-selector {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .color-input {
        width: 100%;
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
    }

    .color-presets {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .color-preset {
        width: 24px;
        height: 24px;
        border: 2px solid #e5e7eb;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .color-preset:hover {
        transform: scale(1.1);
        border-color: #374151;
    }

    /* Mots-clés */
    .keywords-form-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .keyword-type-section {
        border-left: 4px solid #e5e7eb;
        padding-left: 12px;
    }

    .keyword-type-label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .keywords-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        resize: vertical;
        transition: border-color 0.2s ease;
    }

    .keywords-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .keyword-help {
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
        font-style: italic;
    }

    /* Aperçu */
    .category-preview {
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
    }

    .preview-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
    }

    .preview-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
    }

    .preview-content {
        flex: 1;
    }

    .preview-name {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 2px;
    }

    .preview-description {
        font-size: 12px;
        color: #6b7280;
    }

    .preview-priority {
        font-size: 11px;
        color: #9ca3af;
        font-weight: 500;
    }

    /* Affichage des mots-clés */
    .keywords-display-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .category-header-display {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
    }

    .category-icon-large {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
    }

    .keywords-sections {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .keyword-section h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .keywords-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .keyword-tag {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid;
    }

    .keyword-tag.absolute {
        background: #fef3c7;
        color: #92400e;
        border-color: #f59e0b;
    }

    .keyword-tag.strong {
        background: #dbeafe;
        color: #1e40af;
        border-color: #3b82f6;
    }

    .keyword-tag.weak {
        background: #f3f4f6;
        color: #4b5563;
        border-color: #9ca3af;
    }

    .keyword-tag.exclusion {
        background: #fee2e2;
        color: #991b1b;
        border-color: #ef4444;
    }

    .no-keywords-message {
        text-align: center;
        padding: 40px 20px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px dashed #d1d5db;
    }

    .no-keywords-message i {
        font-size: 32px;
        color: #d1d5db;
        margin-bottom: 12px;
        display: block;
    }

    .keywords-actions {
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
    }

    /* Confirmation de suppression */
    .delete-confirmation-content {
        text-align: center;
        padding: 20px;
    }

    .delete-warning-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #fee2e2;
        color: #dc2626;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        margin: 0 auto 20px auto;
    }

    .delete-confirmation-content h4 {
        margin: 0 0 12px 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
    }

    .delete-confirmation-content > p {
        margin: 0 0 20px 0;
        color: #6b7280;
        font-size: 16px;
    }

    .delete-details {
        margin: 20px 0;
    }

    .category-preview-delete {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin: 0 auto;
        max-width: 300px;
    }

    .category-icon-preview {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
    }

    .category-name-preview {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 2px;
    }

    .category-desc-preview {
        font-size: 13px;
        color: #6b7280;
    }

    .delete-warning {
        background: #fffbeb;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 12px;
        margin: 20px 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #92400e;
    }

    .delete-warning i {
        color: #f59e0b;
        flex-shrink: 0;
    }

    .confirmation-input-section {
        margin: 20px 0;
        text-align: left;
    }

    .confirmation-input-section label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
    }

    /* Sélecteur d'icônes */
    .icon-picker-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 8px;
        max-height: 300px;
        overflow-y: auto;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
    }

    .icon-option {
        width: 40px;
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        background: white;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-option:hover {
        border-color: #3b82f6;
        background: #f0f9ff;
        transform: scale(1.1);
    }

    /* Modales */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .modal-overlay.visible {
        opacity: 1;
    }

    .modal-container {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transform: translateY(20px);
        transition: transform 0.3s ease;
    }

    .modal-overlay.visible .modal-container {
        transform: translateY(0);
    }

    .modal-small {
        width: 100%;
        max-width: 400px;
    }

    .modal-medium {
        width: 100%;
        max-width: 600px;
    }

    .modal-large {
        width: 100%;
        max-width: 900px;
    }

    .modal-xlarge {
        width: 100%;
        max-width: 1200px;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        background: #f8fafc;
    }

    .modal-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
    }

    .modal-close-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .modal-close-btn:hover {
        background: rgba(0, 0, 0, 0.2);
        color: #374151;
    }

    .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 24px;
        border-top: 1px solid #e5e7eb;
        background: #f8fafc;
    }

    .btn-danger {
        background: #ef4444;
        color: white;
        border-color: #ef4444;
    }

    .btn-danger:hover {
        background: #dc2626;
        border-color: #dc2626;
    }

    .btn-danger:disabled {
        background: #9ca3af;
        border-color: #9ca3af;
        cursor: not-allowed;
        transform: none;
    }

    .btn-danger.enabled {
        background: #ef4444;
        border-color: #ef4444;
        cursor: pointer;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .categories-grid-management {
            grid-template-columns: 1fr;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .advanced-actions-grid {
            grid-template-columns: 1fr;
        }

        .modal-container {
            margin: 10px;
            max-height: calc(100vh - 20px);
        }

        .modal-small,
        .modal-medium,
        .modal-large,
        .modal-xlarge {
            width: 100%;
            max-width: none;
        }

        .icon-picker-grid {
            grid-template-columns: repeat(6, 1fr);
        }
    }

    @media (max-width: 480px) {
        .category-card-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .category-actions {
            justify-content: center;
            width: 100%;
        }

        .icon-picker-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }
`;

// Compléter la classe avec les méthodes manquantes de la version originale
window.categoriesPage = new CategoriesPage();
